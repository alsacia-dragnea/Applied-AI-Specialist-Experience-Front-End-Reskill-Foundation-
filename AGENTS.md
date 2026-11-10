# Chapter & Co. - agent context

Full-stack bookstore. Two backends share one PostgreSQL schema owned by Prisma:

- `src/`, `prisma/`: Next.js 15 front-end and the original API (port 3000).
- `backend/`: Spring Boot 3.3 / Java 21 REST API (port 8080) used for the Cloud FullStack capstone.
- `deploy/`: Kustomize (GitOps), ArgoCD application, Terraform (IaC).
- `.github/workflows/`: CI, CodeQL (SAST), Trivy, Gitleaks, OWASP ZAP (DAST).
- `docs/`: OpenAPI spec, architecture, DevOps, API testing, agentic workflow.

## Commands

```bash
# Backend build and tests (Java 21 required)
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
cd backend && mvn -B clean verify

# Whole stack in containers
cp .env.example .env && docker compose up --build

# Real end-to-end API test on PostgreSQL (writes docs/api-test-results.md)
scripts/api-e2e-test.sh

# Triage a log or stack trace
docker compose logs --no-color backend | scripts/triage-logs.sh

# Manifests and IaC
kubectl kustomize deploy/overlays/prod
(cd deploy/terraform && terraform init -backend=false && terraform validate)
```

## Rules an agent must follow

1. **Database schema belongs to Prisma** (`prisma/migrations`). JPA runs with `ddl-auto=validate`. Never change the schema from Java; add a Prisma migration.
2. **Never commit secrets.** Configuration comes from environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`). `deploy/secret.example.yaml` holds placeholders only. A Gitleaks job in `.github/workflows/security.yml` scans for tokens.
3. **Mocks hide persistence bugs.** The checkout once returned 500 on real PostgreSQL while every mocked unit test passed. Any change to services, entities or repositories needs a test with real entities (`CheckoutIntegrationTest` pattern) and a run of `scripts/api-e2e-test.sh`.
4. **The OpenAPI spec is generated, not hand-written.** After any controller or DTO change regenerate `docs/openapi.yaml` from `/api-docs`. `OpenApiContractTest` fails the build when the spec and the code differ.
5. **Postgres specifics.** Native enums need `stringtype=unspecified` in the JDBC URL. Nullable query parameters in JPQL must be wrapped in `CAST(:p AS string)`.
6. **Error handling.** Business rule violations throw `BusinessRuleException` (400), missing data `ResourceNotFoundException` (404), validation returns 422. Never swallow an exception: `GlobalExceptionHandler` logs unexpected ones.
7. **Security defaults.** Catalogue endpoints are public, everything else needs a Bearer JWT, orders are always queried by `id` and `userId` (IDOR protection). Actuator exposes only `health` and `info` without authentication.
8. **Keep the diff small.** Do not refactor unrelated code. Update tests and docs for every behaviour change.

## Definition of done

- `mvn clean verify` passes (currently 50 tests).
- `scripts/api-e2e-test.sh` passes when behaviour changed.
- `docs/openapi.yaml` regenerated when the API changed.
- YAML files parse; `kubectl kustomize deploy/overlays/prod` renders.
- No secret, token or `.env` file in the diff.
