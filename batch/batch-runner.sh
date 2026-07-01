#!/usr/bin/env bash
# batch-runner.sh — parallel headless evaluation of data/pipeline.md entries.
# Adapted from santifer/career-ops (MIT), simplified.
#
# Usage: ./batch/batch-runner.sh [--cli <cmd>] [--limit N]
#   --cli    headless worker command (default: auto-detect; falls back to claude -p)
#   --limit  max entries to process (default: all unchecked)
#
# After all workers finish, runs merge-tracker + normalize-statuses + dedup-tracker.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CLI=""
LIMIT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cli) CLI="$2"; shift 2 ;;
    --limit) LIMIT="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Auto-detect a headless CLI (in priority order).
if [[ -z "$CLI" ]]; then
  for c in claude opencode codex qwen agy grok copilot; do
    if command -v "$c" >/dev/null 2>&1; then CLI="$c"; break; fi
  done
fi
if [[ -z "$CLI" ]]; then echo "No AI CLI found on PATH. Pass --cli <cmd>." >&2; exit 1; fi

worker_cmd() { # entry_line -> invoked CLI command
  case "$CLI" in
    claude|qwen|agy|grok|copilot) echo "$CLI -p" ;;
    opencode) echo "opencode run" ;;
    codex) echo "codex exec" ;;
    *) echo "$CLI -p" ;;
  esac
}

PROMPT_FILE="$ROOT/batch/batch-prompt.md"
PIPELINE="$ROOT/data/pipeline.md"
[[ -f "$PIPELINE" ]] || { echo "No data/pipeline.md."; exit 0; }

# Collect unchecked entries.
mapfile -t ENTRIES < <(grep -E '^- \[ \] ' "$PIPELINE" || true)
[[ ${#ENTRIES[@]} -eq 0 ]] && { echo "No unchecked entries in pipeline.md."; exit 0; }

if [[ "$LIMIT" -gt 0 && "${#ENTRIES[@]}" -gt "$LIMIT" ]]; then
  ENTRIES=("${ENTRIES[@]:0:$LIMIT}")
fi

echo "→ ${#ENTRIES[@]} entr${#ENTRIES[@]@]} via $CLI"
WCMD="$(worker_cmd)"
for entry in "${ENTRIES[@]}"; do
  echo "  • ${entry:0:80}…"
  # Substitute the entry into the prompt and run the headless worker.
  prompt="$(sed "s|{{ENTRY_LINE}}|$entry|" "$PROMPT_FILE")"
  # shellcheck disable=SC2086
  $WCMD "$prompt" || echo "    (worker failed for: $entry)"
done

echo "→ merging tracker additions…"
node "$ROOT/merge-tracker.mjs" || true
node "$ROOT/normalize-statuses.mjs" || true
node "$ROOT/dedup-tracker.mjs" || true
node "$ROOT/verify-pipeline.mjs" || true
echo "✓ batch complete"
