#!/usr/bin/env bash
# Log / stack-trace triage helper.
# Summarises a Spring Boot log: level counts, top exceptions, most frequent ERROR/WARN messages,
# and the first stack trace of each distinct exception - a quick starting point for
# incident triage (or for pasting into an AI agent as context).
#
# Usage:
#   scripts/triage-logs.sh app.log
#   docker compose logs --no-color backend | scripts/triage-logs.sh
#   kubectl logs deploy/chapter-and-co-backend | scripts/triage-logs.sh
set -euo pipefail

input="${1:--}"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
cat "$input" > "$tmp"

echo "== Log levels =="
grep -oE '\b(ERROR|WARN|INFO|DEBUG)\b' "$tmp" | sort | uniq -c | sort -rn || true

echo
echo "== Top exceptions =="
grep -oE '([a-zA-Z_]+\.)+[A-Z][A-Za-z]*(Exception|Error)([^A-Za-z]|$)' "$tmp" | sed -E 's/[^A-Za-z]$//' | sort | uniq -c | sort -rn | head -10 || true

echo
echo "== Most frequent ERROR/WARN messages =="
grep -E '\b(ERROR|WARN)\b' "$tmp" | sed -E 's/^[0-9T:.+-]+ +//' | cut -c1-160 | sort | uniq -c | sort -rn | head -10 || true

echo
echo "== First stack trace per exception type =="
awk '
  /([a-zA-Z_]+\.)+[A-Z][A-Za-z]*(Exception|Error)([^A-Za-z]|$)/ {
    match($0, /([a-zA-Z_]+\.)+[A-Z][A-Za-z]*(Exception|Error)([^A-Za-z]|$)/)
    key = substr($0, RSTART, RLENGTH)
    sub(/[^A-Za-z]$/, "", key)
    if (!(key in seen)) { seen[key] = 1; show = 6; print "--- " key } else { show = 0 }
  }
  show > 0 { print; show-- }
' "$tmp"
