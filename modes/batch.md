# Mode: batch — Parallel evaluation

Process many ideas/competitors in parallel using headless CLI workers. Each
worker runs an `evaluate` (or `auto-pipeline`) and writes a tracker TSV; then
`merge-tracker.mjs` reconciles.

## When to use
- "Evaluate these 15 ideas"
- "Score my whole pipeline overnight"
- Bulk processing `data/pipeline.md`

## Process
1. `batch/batch-runner.sh` spawns headless workers per entry:
   `claude -p` / `opencode run` / `codex exec` / `qwen -p` / `agy -p` / `grok -p`
   / `copilot -p` (see `AGENTS.md` → Headless / Batch Mode).
2. Each worker reads `modes/evaluate.md` (+ `_shared.md`) and writes:
   - `reports/{NNN}-{slug}-{date}.md`
   - `batch/tracker-additions/{NNN}-{slug}.tsv` (9-col, status-before-score)
3. After all workers: `node merge-tracker.mjs` folds TSVs into `data/products.md`.
4. Liveness fallback: headless mode has no Playwright MCP → use WebFetch + mark
   `**Verification:** unconfirmed (batch mode)`. The founder verifies later.

## Rules
- Report numbers reserved atomically via `reserve-report-num.mjs` (no collisions).
- Bounded budget per worker (same as `evaluate`).
- ALWAYS run `merge-tracker.mjs` after a batch — never edit `products.md` directly.
- After merge: `node normalize-statuses.mjs` + `node dedup-tracker.mjs`.
