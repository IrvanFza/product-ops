# Mode: pipeline — Process the inbox

Work through pending entries in `data/pipeline.md` one by one (or in bulk via
`batch`). For each unchecked `- [ ]` entry, run `auto-pipeline`.

## When to use
- "Process my pipeline"
- "Work through the inbox"
- After a `scan` produced new entries

## Process
1. Read `data/pipeline.md`. Pick the next unchecked entry (highest signal first,
   or top-down — ask the founder if unclear).
2. Run `modes/auto-pipeline.md` for it: extract → liveness gate → A–G eval →
   report → PDFs → tracker TSV.
3. Mark the entry `- [x]` in `data/pipeline.md` (or `~~struck~~` if stale).
4. After a batch: `node merge-tracker.mjs` to fold TSVs into `data/products.md`.

## Rules
- Honor the liveness gate — dead entries get marked stale, not evaluated.
- Bounded research budget per entry (see `_shared.md`).
- For many entries, prefer `batch` mode (parallel headless workers).
