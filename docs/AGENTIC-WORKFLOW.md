# Agentic Workflows

How AI agents are used in this repository, and where each expectation of the Applied AI Specialist - Cloud FullStack role is delivered. The setup is committed to Git so any teammate (or the manager reviewing it) gets the same agents, rules and skills.

## Mapping to the role description

| Role description | Delivered by |
|---|---|
| Automate scaffolding | Spring Boot project, entities, services and controllers generated with Bob from the wireframes and the API spec (`backend/`) |
| Dependency management | Dependabot for Maven, npm, Docker and Actions ([`.github/dependabot.yml`](../.github/dependabot.yml)); Trivy dependency scan |
| API definition and validation (OpenAPI) | [`openapi.yaml`](openapi.yaml) generated from the running app; **[`OpenApiContractTest`](../backend/src/test/java/com/chapterandco/contract/OpenApiContractTest.java) fails the build if spec and code drift**; Redocly lint in CI; skill `regenerate-openapi` |
| Database design and validation | Prisma schema and migration as the single source of truth; JPA `ddl-auto=validate` checks every entity against it at startup; verified on PostgreSQL by `scripts/api-e2e-test.sh` |
| Advanced code reviews | Agent persona `code-reviewer` ([`.bob/agents/`](../.bob/agents/code-reviewer.md)) with a repository-specific checklist |
| Context, spec and prompt engineering | [`AGENTS.md`](../AGENTS.md) (rules and commands every agent loads), custom mode `cloud-fullstack` ([`.bob/custom_modes.yaml`](../.bob/custom_modes.yaml)), personas and skills below |
| Agentic workflows | Three personas, three skills and one custom mode, described below |
| CI/CD and GitOps | [`ci.yml`](../.github/workflows/ci.yml), Kustomize overlays and an ArgoCD application in [`deploy/`](../deploy) |
| IaC | Terraform in [`deploy/terraform/`](../deploy/terraform) |
| DevSecOps, SAST and DAST | CodeQL, OWASP ZAP, Trivy, Gitleaks in [`security.yml`](../.github/workflows/security.yml); agent persona `security-auditor` checks the controls |
| Agents analyse logs and stack traces, triage incidents | `scripts/triage-logs.sh` (pattern extraction), CI step that posts a triage summary on a failing build, persona `incident-triager`, skill `triage-incident`, [`INCIDENT-PLAYBOOK.md`](INCIDENT-PLAYBOOK.md) with a pattern table and a real incident record |
| Generate utilities, templates and documentation | `scripts/` (triage, end-to-end test), Insomnia collection generated from the spec, `docs/` |

## What is in `.bob/`

| File | Type | Purpose |
|---|---|---|
| `agents/code-reviewer.md` | Persona (read-only) | Reviews a diff for persistence, security, contract, test and operations problems; outputs a severity table and a verdict |
| `agents/incident-triager.md` | Persona (read-only) | Takes a log or stack trace, classifies it with the playbook, ranks hypotheses with a command to confirm each, proposes the smallest fix |
| `agents/security-auditor.md` | Persona (read-only) | Walks the DevSecOps control list and answers PASS, GAP or NOT VERIFIABLE with evidence |
| `skills/regenerate-openapi/` | Skill | Regenerates `docs/openapi.yaml` from the running application |
| `skills/triage-incident/` | Skill | Reproduce on the real stack, fix, add a regression test, record the incident |
| `skills/verify-change/` | Skill | Runs the validation that matches what changed and reports honestly |
| `custom_modes.yaml` | Mode `cloud-fullstack` | Spec-first, verify-on-real-infrastructure working style with read, edit, execute, skill, todo and subagent access |

Skills activate automatically from their description, or by name. Personas are used by subagents, for example "use the incident-triager agent on this stack trace".

## The loop

```
requirement
   |  context: AGENTS.md rules + mode cloud-fullstack
   v
spec first (OpenAPI)  -->  implement  -->  tests with real entities
   |                                           |
   |  OpenApiContractTest keeps spec == code   v
   |                                  scripts/api-e2e-test.sh on PostgreSQL
   v                                           |
code-reviewer persona  <-------------------------+
   v
push --> CI (build, tests, lint) + DevSecOps (CodeQL, Trivy, Gitleaks, ZAP)
   v                                   |
GitOps (ArgoCD syncs deploy/)          | failure -> triage summary in the run
   v                                   v
runtime logs --> triage-logs.sh --> incident-triager --> fix --> INCIDENT-PLAYBOOK.md
```

## A worked example: checkout incident

The checkout returned HTTP 500 on PostgreSQL while all 40 unit tests passed. The agentic loop is what found and closed it:

1. Auditing the customer journey against the code showed the order was never fully persisted.
2. Running the real stack exposed the 500; `GlobalExceptionHandler` was changed to log the swallowed exception.
3. The stack trace was classified (native enum, missing cascade, foreign-key order) and each cause fixed.
4. Guards were added so it cannot return silently: `CheckoutIntegrationTest`, `scripts/api-e2e-test.sh`, `OpenApiContractTest`.
5. The incident was recorded as INC-001 in [`INCIDENT-PLAYBOOK.md`](INCIDENT-PLAYBOOK.md), which future triage reads.

## What is not covered

- The personas, skills and mode are configuration for Bob; their behaviour depends on the agent running them and was not exercised end to end here. The shell script and the contract test were run and verified.
- The ICA test generation agent required by the capstone is not part of this repository.
- GitHub workflows (including the failure triage summary) can only be confirmed after they run on GitHub.
