---
name: triage-incident
description: Use when the user pastes a log, stack trace or error from the backend (HTTP 500, exception, failing pod or container, failing CI job) and wants the root cause and a fix.
---

# Triage an incident

## Steps

1. Get the evidence. If the user gave none, collect it:
   ```bash
   docker compose logs --no-color backend | scripts/triage-logs.sh      # local containers
   kubectl logs deploy/chapter-and-co-backend | scripts/triage-logs.sh  # cluster
   ```
   Unhandled exceptions are logged as `Unhandled exception` by `GlobalExceptionHandler`; search for that marker and read the full trace.
2. Classify the failure with the pattern table in `docs/INCIDENT-PLAYBOOK.md`.
3. Find the first `com.chapterandco` frame in the trace and read that file.
4. Reproduce on the real stack, not on mocks. Use `scripts/api-e2e-test.sh` or a `curl` against `docker compose` and confirm the same exception.
5. Write the smallest fix and a regression test with real entities (see `CheckoutIntegrationTest`).
6. Run `cd backend && mvn -B clean verify`, then `scripts/api-e2e-test.sh` if behaviour changed.
7. Append a short entry to the incident log in `docs/INCIDENT-PLAYBOOK.md`: symptom, root cause, fix, test that now guards it.
8. State anything you could not verify. Do not claim a root cause without reproducing it or showing the matching frame.
