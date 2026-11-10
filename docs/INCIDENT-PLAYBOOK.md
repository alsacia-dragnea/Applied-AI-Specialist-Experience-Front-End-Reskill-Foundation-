# Incident Playbook

How failures in the Chapter & Co. backend are detected, triaged and recorded. It is the knowledge base used by the `incident-triager` agent persona and the `triage-incident` skill (see [`AGENTIC-WORKFLOW.md`](AGENTIC-WORKFLOW.md)).

## Triage procedure

1. Collect evidence: `docker compose logs --no-color backend | scripts/triage-logs.sh` (or `kubectl logs deploy/chapter-and-co-backend | scripts/triage-logs.sh`).
2. Find the `Unhandled exception` marker. `GlobalExceptionHandler` logs every unexpected exception with its full stack trace.
3. Classify with the pattern table below.
4. Reproduce on the real stack (`scripts/api-e2e-test.sh`), fix minimally, add a regression test with real entities.
5. Record the incident in the log at the end of this file.

## Failure patterns

| Signature in the log | Class | Usual cause | First check |
|---|---|---|---|
| `column "x" is of type "SomeEnum" but expression is of type character varying` | Persistence mapping | Native PostgreSQL enum written as a string | JDBC URL must contain `stringtype=unspecified` |
| `could not determine data type of parameter $N` | Persistence mapping | Null parameter in JPQL without a type | Wrap in `CAST(:p AS string)` |
| `violates foreign key constraint` | Constraint | Child row saved before parent (save order, cascade) | Save the parent first or cascade from it |
| `No enum constant ...` | Input handling | Client sent a value outside the enum | Validate and return 400 |
| `Failed to load ApplicationContext`, `NoClassDefFoundError` in tests | Build | Stale `target/` or test in the wrong package | `mvn clean verify` |
| `Schema-validation: missing column/table` | Configuration | Database not migrated, `ddl-auto=validate` | Apply `prisma/migrations` |
| `JWT`, `signature does not match` | Security | `JWT_SECRET` differs between instances or restarts | Same secret in every replica |
| HTTP 401 on a public route | Security | Route missing from `SecurityConfig` | Check `requestMatchers` |
| `OOMKilled`, restarts in `kubectl get pods` | Capacity | Limits too low | `resources.limits` in `deploy/base/deployment.yaml`, `JAVA_OPTS` |
| Readiness probe failing, liveness fine | Dependency | Database unreachable | `DB_URL`, secret `chapter-and-co-backend`, `postgres` service |

## Incident log

### INC-001 Checkout returned HTTP 500 on PostgreSQL (found by audit, fixed)

| | |
|---|---|
| Symptom | `POST /checkout` returned `{"error":"An unexpected error occurred"}`. All 40 unit tests passed. |
| Detection | Running the real stack with the Prisma schema. The generic handler hid the cause, so logging was added first. |
| Root cause 1 | `column "status" is of type "OrderStatus" but expression is of type character varying`: native PostgreSQL enums. Fixed with `stringtype=unspecified`. A `@JdbcTypeCode(NAMED_ENUM)` attempt was rejected because H2 cannot map it. |
| Root cause 2 | Order items and payment were never persisted (the code comment said "simplified here"). Items and payment are now built and saved through cascade. |
| Root cause 3 | `gift_points_transactions_orderId_fkey` violated: points were saved before the order. They are now saved after it. |
| Related defects | Invalid payment method returned 500 instead of 400. Book search failed on PostgreSQL (`could not determine data type of parameter`). Checkout item quantity was not validated. |
| Why tests missed it | Repositories were mocked, so no SQL was ever executed. |
| Guards added | `CheckoutIntegrationTest` (real entities), `scripts/api-e2e-test.sh` (57 checks on PostgreSQL), `GlobalExceptionHandler` logging, `OpenApiContractTest`. |
