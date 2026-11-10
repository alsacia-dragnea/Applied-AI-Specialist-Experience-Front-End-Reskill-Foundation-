---
name: verify-change
description: Use before committing or after finishing a change to the backend, deployment manifests or workflows, to run the complete validation set and report the result honestly.
---

# Verify a change

Run only the checks that apply to what changed, then report each result. Never report success for a check you did not run.

| Changed | Run |
|---|---|
| Anything under `backend/` | `export JAVA_HOME=/opt/homebrew/opt/openjdk@21 && cd backend && mvn -B clean verify` |
| Controllers, services, entities, repositories | the above, plus `scripts/api-e2e-test.sh` (needs Docker; rewrites `docs/api-test-results.md`) |
| Controllers or DTOs | the `regenerate-openapi` skill |
| `deploy/` | `kubectl kustomize deploy/overlays/prod >/dev/null && kubectl kustomize deploy/overlays/dev >/dev/null` and `cd deploy/terraform && terraform init -backend=false && terraform validate` |
| `docker-compose.yml` | `JWT_SECRET=x docker compose config -q` |
| `.github/` or any YAML | `python3 -c "import yaml,sys;[list(yaml.safe_load_all(open(f))) for f in sys.argv[1:]]" <files>` |

Then always:

1. `git diff` and confirm there is no token, password or `.env` content. Search with `grep -rn "ghp_\|BEGIN PRIVATE KEY" <changed files>`.
2. Check that docs mention any new endpoint, environment variable or script.
3. Report a table: check, command, result. List what was not run and why. GitHub workflows can only be verified after a push, so say so.
