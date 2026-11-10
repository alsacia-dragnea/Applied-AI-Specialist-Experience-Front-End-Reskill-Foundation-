# API Testing Guide

How the REST API is tested against the requirements of the capstone (Step 8: "Test APIs", "Verify responses match the API specification", "Check data is saved in database").

| Artefact | Purpose |
|---|---|
| [`docs/openapi.yaml`](openapi.yaml) | API specification (17 paths), generated from the running application |
| [`docs/insomnia-collection.json`](insomnia-collection.json) | 28 ready-made requests, import into Insomnia or Postman |
| [`scripts/api-e2e-test.sh`](../scripts/api-e2e-test.sh) | Automated end-to-end run of every endpoint plus database checks |
| [`docs/api-test-results.md`](api-test-results.md) | Result of the last automated run (57 checks) |
| `backend/src/test` | 48 JUnit tests (unit, web layer and real-persistence integration) |

## 1. Test manually with Insomnia

1. Start the stack and load the catalogue (see [`DEVOPS.md`](DEVOPS.md)), or run the backend locally on port 8080.
2. In Insomnia: **Create, Import, From File**, choose `docs/insomnia-collection.json`.
3. Open **Base Environment** and fill in the variables as you go:

   | Variable | Where to get it |
   |---|---|
   | `base_url` | default `http://localhost:8080/api/v1` |
   | `token` | `token` field in the response of **Auth / Login** |
   | `category_slug`, `author_id` | from **List categories** and **List authors** |
   | `book_slug`, `book_id` | from **List books** |
   | `address_id` | from **Create address** or **List addresses** |
   | `order_id` | `orderId` in the response of **Checkout** |

4. Run the folders in order: Auth, Catalogue, Account, Checkout and orders, Negative cases.

You can also use the browser: Swagger UI is at `http://localhost:8080/swagger-ui.html` (use **Authorize** and paste the token).

## 2. Run the automated end-to-end test

```bash
npm install            # once, for the seed script
scripts/api-e2e-test.sh
```

The script starts PostgreSQL and the backend with docker compose on spare ports (it does not touch your own database), applies the Prisma migration, seeds the 30-book catalogue, runs every request, verifies the rows in PostgreSQL, tears the stack down and rewrites [`api-test-results.md`](api-test-results.md). It exits non-zero if any check fails.

## 3. What is covered

| Area | Checks |
|---|---|
| Authentication | register, duplicate email, invalid data, login, wrong password |
| Catalogue | categories, books (paging, category, author, search, sort), featured, bestsellers, authors, book detail, estimated delivery date, related books, unknown resources |
| Security | missing token returns 401; one user cannot read or cancel another user's order |
| Addresses | create, validation, list |
| Checkout | card payment, gift-point redemption, over-redeeming, invalid payment method, invalid quantity, unknown book |
| Orders | history, detail, buy again, recommendations before and after an order |
| Cancellation | within 48 hours, invalid action, already cancelled, older than 48 hours (order aged in the database) |
| Data in PostgreSQL | user, orders, order items and payments saved; stock decremented then restored; gift points earned and redeemed; no unhandled exceptions in the log |

## 4. Note on HTTP verbs

The capstone lists GET, POST, PUT and DELETE generically. The wireframes only require reading, creating and cancelling, so the API uses GET and POST plus one PATCH (cancel order). There is no PUT or DELETE because no wireframe edits or removes a resource.
