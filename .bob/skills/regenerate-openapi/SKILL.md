---
name: regenerate-openapi
description: Use when a controller, DTO or endpoint of the Spring Boot backend changed and docs/openapi.yaml must be regenerated from the running application, or when OpenApiContractTest fails because the spec is out of date.
---

# Regenerate the OpenAPI spec

The spec is generated from the application, never written by hand. `OpenApiContractTest` fails the build when `docs/openapi.yaml` and the code differ.

## Steps

1. Build and test first so you regenerate from working code:
   ```bash
   export JAVA_HOME=/opt/homebrew/opt/openjdk@21
   cd backend && mvn -B clean verify
   ```
   If `OpenApiContractTest` is the only failure, continue; any other failure must be fixed first.
2. Start the stack on spare ports (does not touch a local database):
   ```bash
   export JWT_SECRET=local-spec-secret-at-least-32-bytes-long DB_PASSWORD=spec DDL_AUTO=create
   printf 'services:\n  db:\n    ports: !override\n      - "55440:5432"\n  backend:\n    ports: !override\n      - "18090:8080"\n' > /tmp/spec-override.yml
   docker compose -p cc-spec -f docker-compose.yml -f /tmp/spec-override.yml up -d --build --wait --wait-timeout 240
   ```
3. Download the spec and convert it to YAML with the project header and server:
   ```bash
   curl -s localhost:18090/api-docs -o /tmp/spring.json
   python3 - <<'EOF'
   import json, yaml
   d = json.load(open('/tmp/spring.json'))
   d['info']['description'] = 'REST API for the Chapter & Co. eCommerce bookstore (Spring Boot backend). Generated from the running application via SpringDoc (GET /api-docs).'
   d['servers'] = [{'url': 'http://localhost:8080', 'description': 'Local development'}]
   yaml.safe_dump(d, open('docs/openapi.yaml', 'w'), sort_keys=False, width=100, allow_unicode=True)
   EOF
   ```
4. Always stop the stack: `JWT_SECRET=x docker compose -p cc-spec down -v; rm /tmp/spec-override.yml`.
5. Re-run `cd backend && mvn -B clean verify`; `OpenApiContractTest` must now pass.
6. Update `docs/insomnia-collection.json` and the endpoint table in `backend/README.md` if operations were added or removed.
7. Report which operations were added, removed or changed.
