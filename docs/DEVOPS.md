# DevOps, DevSecOps & Cloud Delivery

How Chapter & Co. is built, scanned, packaged and deployed. Everything here maps to the Cloud FullStack role description.

| Role expectation | Where it lives |
|---|---|
| API definition & validation (OpenAPI) | [`docs/openapi.yaml`](openapi.yaml), SpringDoc at `/api-docs`, `openapi-lint` job in [`ci.yml`](../.github/workflows/ci.yml) |
| Cloud-native packaging | [`backend/Dockerfile`](../backend/Dockerfile) (multi-stage, non-root, OpenShift-compatible), [`docker-compose.yml`](../docker-compose.yml) |
| CI | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml): build, test, OpenAPI lint, image push to GHCR |
| DevSecOps: SAST | CodeQL (Java + JS/TS) in [`security.yml`](../.github/workflows/security.yml) |
| DevSecOps: DAST | OWASP ZAP API scan against the running stack (`dast` job) |
| DevSecOps: SCA / secrets / IaC misconfig | Trivy (fs + image), Gitleaks, Dependabot ([`dependabot.yml`](../.github/dependabot.yml)) |
| GitOps | Kustomize base/overlays in [`deploy/`](../deploy), ArgoCD app in [`deploy/argocd/application.yaml`](../deploy/argocd/application.yaml) |
| IaC | Terraform in [`deploy/terraform/`](../deploy/terraform) (namespace, secrets, PostgreSQL StatefulSet) |
| Observability / incident triage | Spring Actuator probes and metrics, [`scripts/triage-logs.sh`](../scripts/triage-logs.sh) |

## Configuration (12-factor)

No secret is required in source control. `application.properties` reads these environment variables:

| Variable | Default (local dev only) | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/chapter_and_co` | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `admin` / `admin` | DB credentials |
| `JWT_SECRET` | dev placeholder | JWT signing key, at least 32 bytes. **Must be set outside local dev.** |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated origins |
| `LOG_LEVEL` | `INFO` | App log level |

## Run locally with containers

```bash
cp .env.example .env        # then edit DB_PASSWORD and JWT_SECRET
docker compose up --build
curl localhost:8080/actuator/health
open http://localhost:8080/swagger-ui.html
```

The database is empty on first start. `ddl-auto=validate` expects the Prisma schema, so run the Prisma migrations and seed first (`npx prisma migrate deploy && npx prisma db seed` against `localhost:5432`).

## CI/CD flow

```
push / PR -> ci.yml:       mvn verify  ->  OpenAPI lint  ->  (main) build & push image to GHCR
          -> security.yml: CodeQL | Gitleaks | Trivy fs | Trivy image | ZAP DAST (weekly cron too)
main merge -> bump image tag in deploy/overlays/prod -> ArgoCD syncs the cluster (GitOps)
```

Trivy filesystem and ZAP findings are reported only (results appear in the Security tab). The container scan fails the build on fixable CRITICAL vulnerabilities.

## Deploy to Kubernetes / OpenShift (ROSA, ROKS)

1. Provision namespace, secrets and PostgreSQL:
   ```bash
   cd deploy/terraform
   terraform init && terraform apply -var kube_context=<ctx>
   ```
2. Deploy the app, either manually or through GitOps:
   ```bash
   kubectl apply -k deploy/overlays/prod        # manual
   kubectl apply -f deploy/argocd/application.yaml   # GitOps (ArgoCD installed)
   ```
3. Check the rollout: `kubectl -n chapter-and-co-prod rollout status deploy/chapter-and-co-backend`

Notes:
- `deploy/base` does **not** contain a Secret. Terraform creates it, or you can apply [`deploy/secret.example.yaml`](../deploy/secret.example.yaml) after filling in real values. Use Sealed Secrets or External Secrets for a pure-GitOps flow.
- The prod overlay includes an OpenShift `Route` (edge TLS). On plain Kubernetes, remove `route.yaml` from the overlay and use an Ingress.
- The Terraform state holds generated passwords, so use an encrypted remote backend for real environments.
- The image reference in `deploy/base/deployment.yaml` points at GHCR under the GitHub repository path. Adjust it if the repository moves.

## Observability and incident triage

- Probes: `/actuator/health/liveness` and `/actuator/health/readiness` (public). `/actuator/metrics` requires a JWT.
- Triage a failing pod or container in seconds:
  ```bash
  kubectl logs deploy/chapter-and-co-backend | scripts/triage-logs.sh
  docker compose logs --no-color backend | scripts/triage-logs.sh
  ```
  The output (level counts, top exceptions, first stack trace per exception) is also a compact context block to hand to an AI agent for root-cause analysis.

## AI-assisted workflow

The pipeline, manifests and scripts here were generated with IBM Bob from the role description, then reviewed by a human. Review points: least-privilege pod security context, no secrets in Git, pinned action versions, and report-only vs. blocking scan policy.
