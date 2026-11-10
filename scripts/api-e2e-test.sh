#!/usr/bin/env bash
# End-to-end API test for the Chapter & Co. Spring Boot backend.
#
# Starts the real stack (PostgreSQL + backend) with docker compose on spare ports,
# applies the Prisma migration, seeds the 30-book catalogue, then exercises every
# endpoint and verifies the data in the database. Writes a Markdown report.
#
# Usage:  scripts/api-e2e-test.sh            (report -> docs/api-test-results.md)
# Needs:  docker, curl, jq, node (for the seed script, `npm install` done once)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT="cc-e2e"
DB_PORT=55433
API_PORT=18081
BASE="http://localhost:${API_PORT}/api/v1"
REPORT="${REPORT:-docs/api-test-results.md}"
OVERRIDE="$(mktemp)"
export JWT_SECRET="e2e-only-secret-at-least-32-bytes-long-0000"
export DB_PASSWORD="e2e"
export DB_USERNAME="admin"

cat > "$OVERRIDE" <<EOF
services:
  db:
    ports: !override
      - "${DB_PORT}:5432"
  backend:
    ports: !override
      - "${API_PORT}:8080"
EOF

dc() { docker compose -p "$PROJECT" -f docker-compose.yml -f "$OVERRIDE" "$@"; }
psql_q() { dc exec -T db psql -At -U admin -d chapter_and_co -c "$1"; }
cleanup() { dc down -v >/dev/null 2>&1; rm -f "$OVERRIDE"; }
trap cleanup EXIT

PASS=0; FAIL=0; ROWS=""
# check <name> <method+path> <expected-status> <actual-status> [detail]
record() {
  local name="$1" call="$2" want="$3" got="$4" detail="${5:-}"
  if [ "$want" = "$got" ]; then PASS=$((PASS+1)); mark="PASS"; else FAIL=$((FAIL+1)); mark="FAIL"; fi
  ROWS+="| ${mark} | ${name} | \`${call}\` | ${want} | ${got} | ${detail} |"$'\n'
  printf '%-4s %-52s want=%s got=%s %s\n' "$mark" "$name" "$want" "$got" "$detail"
}
# assert <name> <description> <condition-exit-code>
assert() {
  local name="$1" detail="$2" ok="$3"
  if [ "$ok" = "0" ]; then PASS=$((PASS+1)); mark="PASS"; else FAIL=$((FAIL+1)); mark="FAIL"; fi
  ROWS+="| ${mark} | ${name} | (database / body check) | - | - | ${detail} |"$'\n'
  printf '%-4s %-52s %s\n' "$mark" "$name" "$detail"
}
# http <method> <path> [token] [json-body]  -> sets STATUS and BODY
http() {
  local method="$1" path="$2" token="${3:-}" body="${4:-}"
  local args=(-s -o /tmp/e2e-body -w '%{http_code}' -X "$method" "${BASE}${path}" -H 'Content-Type: application/json')
  [ -n "$token" ] && args+=(-H "Authorization: Bearer ${token}")
  [ -n "$body" ] && args+=(-d "$body")
  STATUS="$(curl "${args[@]}")"
  BODY="$(cat /tmp/e2e-body)"
}

echo "== Starting stack"
dc up -d --wait db >/dev/null 2>&1 || { echo "db failed to start"; exit 1; }
dc exec -T db psql -v ON_ERROR_STOP=1 -q -U admin -d chapter_and_co \
  < prisma/migrations/20261024204305_init/migration.sql || { echo "migration failed"; exit 1; }

echo "== Seeding catalogue (prisma/seed.ts)"
DATABASE_URL="postgresql://admin:e2e@localhost:${DB_PORT}/chapter_and_co" npx --yes tsx prisma/seed.ts >/tmp/e2e-seed.log 2>&1 \
  || { echo "seed failed:"; tail -5 /tmp/e2e-seed.log; exit 1; }
BOOKS_IN_DB="$(psql_q 'select count(*) from books')"
echo "books seeded: ${BOOKS_IN_DB}"

dc up -d --build --wait --wait-timeout 240 backend >/dev/null 2>&1 || { echo "backend failed"; dc logs backend | tail -20; exit 1; }

echo "== Running API tests"
# ---- Health ----
STATUS="$(curl -s -o /tmp/e2e-body -w '%{http_code}' "http://localhost:${API_PORT}/actuator/health/readiness")"
record "Readiness probe" "GET /actuator/health/readiness" 200 "$STATUS"

# ---- Auth ----
EMAIL="e2e-$(date +%s)@example.com"
http POST /auth/register "" "{\"name\":\"E2E User\",\"email\":\"${EMAIL}\",\"password\":\"Passw0rd!x\"}"
record "Register user" "POST /auth/register" 201 "$STATUS"
http POST /auth/register "" "{\"name\":\"E2E User\",\"email\":\"${EMAIL}\",\"password\":\"Passw0rd!x\"}"
record "Register duplicate email rejected" "POST /auth/register" 400 "$STATUS"
http POST /auth/register "" '{"name":"A","email":"not-an-email","password":"short"}'
record "Register with invalid data rejected" "POST /auth/register" 422 "$STATUS"
http POST /auth/login "" "{\"email\":\"${EMAIL}\",\"password\":\"wrong-password\"}"
record "Login with wrong password rejected" "POST /auth/login" 400 "$STATUS"
http POST /auth/login "" "{\"email\":\"${EMAIL}\",\"password\":\"Passw0rd!x\"}"
record "Login" "POST /auth/login" 200 "$STATUS"
TOKEN="$(echo "$BODY" | jq -r '.token')"

# ---- Catalogue (public) ----
http GET /categories
record "List categories" "GET /categories" 200 "$STATUS" "$(echo "$BODY" | jq '.categories|length') categories"
CAT_SLUG="$(echo "$BODY" | jq -r '.categories[0].slug')"
http GET "/categories/${CAT_SLUG}"
record "Category by slug" "GET /categories/{slug}" 200 "$STATUS"
http GET /categories/does-not-exist
record "Unknown category" "GET /categories/{slug}" 404 "$STATUS"
http GET /books
record "List books (paged)" "GET /books" 200 "$STATUS" "$(echo "$BODY" | jq '.pagination.total') total"
http GET "/books?category=${CAT_SLUG}"
record "Filter books by category" "GET /books?category=" 200 "$STATUS" "$(echo "$BODY" | jq '.books|length') books"
http GET /books?search=the
record "Search books" "GET /books?search=" 200 "$STATUS"
http GET "/books?sort=price_asc&limit=5"
record "Sort books by price" "GET /books?sort=price_asc" 200 "$STATUS"
http GET /books/featured
record "Featured books" "GET /books/featured" 200 "$STATUS"
http GET /books/bestsellers
record "Bestseller books" "GET /books/bestsellers" 200 "$STATUS"
http GET /authors
record "List authors (brands)" "GET /authors" 200 "$STATUS" "$(echo "$BODY" | jq '.authors|length') authors"
AUTHOR_ID="$(echo "$BODY" | jq -r '.authors[0].id')"
http GET "/books?author=${AUTHOR_ID}"
record "Filter books by author" "GET /books?author=" 200 "$STATUS" "$(echo "$BODY" | jq '.books|length') books"
http GET "/books?category=${CAT_SLUG}"
BOOK1_SLUG="$(echo "$BODY" | jq -r '.books[0].slug')"; BOOK1_ID="$(echo "$BODY" | jq -r '.books[0].id')"
BOOK2_ID="$(echo "$BODY" | jq -r '.books[1].id // .books[0].id')"
http GET "/books/${BOOK1_SLUG}"
record "Book detail" "GET /books/{slug}" 200 "$STATUS"
echo "$BODY" | jq -e '.estimatedDelivery.from and .estimatedDelivery.to' >/dev/null
assert "Book detail has estimated delivery date" "$(echo "$BODY" | jq -c '.estimatedDelivery')" $?
http GET /books/does-not-exist
record "Unknown book" "GET /books/{slug}" 404 "$STATUS"
http GET "/books/${BOOK1_SLUG}/related"
record "Related books" "GET /books/{slug}/related" 200 "$STATUS" "$(echo "$BODY" | jq '.books|length') books"
echo "$BODY" | jq -e --arg id "$BOOK1_ID" '[.books[].id] | index($id) == null' >/dev/null
assert "Related books exclude the book itself" "" $?

# ---- Security ----
http GET /orders
record "Orders without token rejected" "GET /orders" 401 "$STATUS"
http POST /checkout "" '{}'
record "Checkout without token rejected" "POST /checkout" 401 "$STATUS"

# ---- Recommendations before any order ----
http GET /recommendations "$TOKEN"
record "Recommendations (no history -> featured)" "GET /recommendations" 200 "$STATUS" "reason=$(echo "$BODY" | jq -r '.reason')"

# ---- Addresses ----
http POST /addresses "$TOKEN" '{"fullName":"E2E User","line1":"1 Test St","city":"London","postalCode":"SW1A 1AA","country":"GB","isDefault":true}'
record "Create address" "POST /addresses" 201 "$STATUS"
http POST /addresses "$TOKEN" '{"fullName":"","line1":"","city":"","postalCode":"","country":"GBR"}'
record "Create invalid address rejected" "POST /addresses" 422 "$STATUS"
http GET /addresses "$TOKEN"
record "List addresses" "GET /addresses" 200 "$STATUS"
ADDR_ID="$(echo "$BODY" | jq -r '.addresses[0].id')"

# ---- Checkout ----
STOCK_BEFORE="$(psql_q "select stock from books where id='${BOOK1_ID}'")"
http GET /gift-points "$TOKEN"
record "Gift points balance (new user)" "GET /gift-points" 200 "$STATUS" "balance=$(echo "$BODY" | jq '.balance')"
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"DEMO_CARD\",\"cardLast4\":\"4242\",\"giftPointsToRedeem\":0,\"items\":[{\"bookId\":\"${BOOK1_ID}\",\"quantity\":2}]}"
record "Checkout with card" "POST /checkout" 201 "$STATUS" "ref=$(echo "$BODY" | jq -r '.reference')"
ORDER_ID="$(echo "$BODY" | jq -r '.orderId')"
[ "$(psql_q "select stock from books where id='${BOOK1_ID}'")" = "$((STOCK_BEFORE - 2))" ]
assert "Stock decremented by checkout" "stock ${STOCK_BEFORE} -> $((STOCK_BEFORE - 2))" $?
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"CREDIT_CARD\",\"giftPointsToRedeem\":0,\"items\":[{\"bookId\":\"${BOOK1_ID}\",\"quantity\":1}]}"
record "Checkout with invalid payment method rejected" "POST /checkout" 400 "$STATUS"
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"DEMO_CARD\",\"giftPointsToRedeem\":0,\"items\":[{\"bookId\":\"${BOOK1_ID}\",\"quantity\":999}]}"
record "Checkout with invalid quantity rejected" "POST /checkout" 422 "$STATUS"
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"DEMO_CARD\",\"giftPointsToRedeem\":0,\"items\":[{\"bookId\":\"no-such-book\",\"quantity\":1}]}"
record "Checkout with unknown book rejected" "POST /checkout" 404 "$STATUS"
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"GIFT_POINTS\",\"giftPointsToRedeem\":100000,\"items\":[{\"bookId\":\"${BOOK2_ID}\",\"quantity\":1}]}"
record "Redeem more gift points than owned rejected" "POST /checkout" 400 "$STATUS"
http GET /gift-points "$TOKEN"
BALANCE="$(echo "$BODY" | jq '.balance')"
REDEEM=$(( BALANCE > 5 ? 5 : 0 ))
http POST /checkout "$TOKEN" "{\"addressId\":\"${ADDR_ID}\",\"paymentMethod\":\"GIFT_POINTS\",\"giftPointsToRedeem\":${REDEEM},\"items\":[{\"bookId\":\"${BOOK2_ID}\",\"quantity\":1}]}"
record "Checkout redeeming gift points" "POST /checkout" 201 "$STATUS" "redeemed ${REDEEM} pts"
ORDER2_ID="$(echo "$BODY" | jq -r '.orderId')"

# ---- Orders ----
http GET /orders "$TOKEN"
record "Order history" "GET /orders" 200 "$STATUS" "$(echo "$BODY" | jq '.orders|length') orders"
http GET "/orders/${ORDER_ID}" "$TOKEN"
record "Order detail" "GET /orders/{id}" 200 "$STATUS"
echo "$BODY" | jq -e '(.order.orderItems|length)==1 and .order.payment.method=="DEMO_CARD"' >/dev/null
assert "Order detail contains items and payment" "" $?
http GET "/orders/does-not-exist" "$TOKEN"
record "Unknown order" "GET /orders/{id}" 404 "$STATUS"
http GET /orders/buy-again "$TOKEN"
record "Buy again" "GET /orders/buy-again" 200 "$STATUS" "$(echo "$BODY" | jq '.books|length') books"
http GET /recommendations "$TOKEN"
record "Recommendations (with history)" "GET /recommendations" 200 "$STATUS" "reason=$(echo "$BODY" | jq -r '.reason')"

# ---- Isolation between users (IDOR) ----
OTHER="other-$(date +%s)@example.com"
http POST /auth/register "" "{\"name\":\"Other User\",\"email\":\"${OTHER}\",\"password\":\"Passw0rd!x\"}"
OTHER_TOKEN="$(echo "$BODY" | jq -r '.token')"
http GET "/orders/${ORDER_ID}" "$OTHER_TOKEN"
record "Another user cannot read my order (IDOR)" "GET /orders/{id}" 404 "$STATUS"
http PATCH "/orders/${ORDER_ID}" "$OTHER_TOKEN" '{"action":"cancel"}'
record "Another user cannot cancel my order (IDOR)" "PATCH /orders/{id}" 404 "$STATUS"

# ---- Cancellation ----
http PATCH "/orders/${ORDER_ID}" "$TOKEN" '{"action":"explode"}'
record "Cancel with invalid action rejected" "PATCH /orders/{id}" 400 "$STATUS"
http PATCH "/orders/${ORDER_ID}" "$TOKEN" '{"action":"cancel"}'
record "Cancel order within 48h" "PATCH /orders/{id}" 200 "$STATUS"
http PATCH "/orders/${ORDER_ID}" "$TOKEN" '{"action":"cancel"}'
record "Cancel an already cancelled order rejected" "PATCH /orders/{id}" 400 "$STATUS"

# Age the second order beyond 48 hours directly in the DB, then try to cancel it.
psql_q "update orders set \"createdAt\" = now() - interval '49 hours' where id = '${ORDER2_ID}'" >/dev/null
http PATCH "/orders/${ORDER2_ID}" "$TOKEN" '{"action":"cancel"}'
record "Cancel order older than 48h rejected" "PATCH /orders/{id}" 400 "$STATUS" "$(echo "$BODY" | jq -r '.error')"

# ---- Database verification ----
echo "== Verifying data in PostgreSQL"
USER_ID="$(psql_q "select id from users where email='${EMAIL}'")"
[ -n "$USER_ID" ]; assert "User row saved" "email=${EMAIL}" $?
[ "$(psql_q "select count(*) from orders where \"userId\"='${USER_ID}'")" = "2" ]
assert "Both orders saved" "orders=2" $?
[ "$(psql_q "select count(*) from order_items oi join orders o on o.id=oi.\"orderId\" where o.\"userId\"='${USER_ID}'")" = "2" ]
assert "Order items saved" "order_items=2" $?
[ "$(psql_q "select count(*) from payments p join orders o on o.id=p.\"orderId\" where o.\"userId\"='${USER_ID}'")" = "2" ]
assert "Payments saved" "payments=2" $?
[ "$(psql_q "select status from orders where id='${ORDER_ID}'")" = "CANCELLED" ]
assert "Cancelled order status stored" "status=CANCELLED" $?
[ "$(psql_q "select stock from books where id='${BOOK1_ID}'")" = "$STOCK_BEFORE" ]
assert "Stock restored after cancellation" "stock back to seeded value ${STOCK_BEFORE}" $?
[ "$(psql_q "select count(*) from gift_points_transactions where \"userId\"='${USER_ID}' and type='EARNED'")" -ge 1 ]
assert "Gift points earned and stored" "EARNED rows >= 1" $?
if [ "$REDEEM" -gt 0 ]; then
  [ "$(psql_q "select count(*) from gift_points_transactions where \"userId\"='${USER_ID}' and type='REDEEMED'")" = "1" ]
  assert "Gift points redeemed and stored" "REDEEMED rows = 1" $?
fi
[ "$(dc logs --no-color backend | grep -c 'Unhandled exception')" = "0" ]
assert "No unhandled exceptions in backend log" "0 occurrences" $?

TOTAL=$((PASS+FAIL))
echo
echo "RESULT: ${PASS}/${TOTAL} passed, ${FAIL} failed"

mkdir -p "$(dirname "$REPORT")"
{
  echo "# API Test Results"
  echo
  echo "End-to-end run of every endpoint against the real stack (Spring Boot + PostgreSQL 17 via docker compose)"
  echo "using the project's Prisma migration and the seeded catalogue (${BOOKS_IN_DB} books)."
  echo "Generated by [\`scripts/api-e2e-test.sh\`](../scripts/api-e2e-test.sh) on $(date -u '+%Y-%m-%d %H:%M UTC')."
  echo
  echo "**Result: ${PASS} / ${TOTAL} checks passed, ${FAIL} failed.**"
  echo
  echo "| Result | Test | Request | Expected | Actual | Notes |"
  echo "|---|---|---|---|---|---|"
  printf '%s' "$ROWS"
} > "$REPORT"
echo "report written to ${REPORT}"
[ "$FAIL" -eq 0 ]
