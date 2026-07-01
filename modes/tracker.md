# Mode: tracker — Status & pipeline integrity

Report on `data/products.md`: counts by status, top scores, stale entries,
duplicates. Also runs integrity checks.

## When to use
- "What's my pipeline status?"
- "Show me my products"
- "Anything stale / duplicated?"

## Process
1. `node tracker.mjs` builds/queries the SQLite index `data/products.db` over
   `data/products.md`.
2. Report: total, by-status counts, top-5 by score, entries older than N days
   without status change (stale), suspected duplicates.
3. Integrity: `node verify-pipeline.mjs` (health), `node normalize-statuses.mjs`
   (canonicalize), `node dedup-tracker.mjs` (dedup), `node reconcile-pipeline.mjs`
   (sync `pipeline.md` ↔ `products.md`).

## Rules
- Never add rows directly to `products.md` — only update existing status/notes.
- Canonical statuses only (`templates/states.yml`).
- The dashboard (`npm run serve:dashboard`) is the browsable view of this data.
