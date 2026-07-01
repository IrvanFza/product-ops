# Mode: patterns — Scoring pattern analysis

Analyze which archetypes/ideas score high vs low across the tracker, to retarget
the founder's pipeline. Uses `analyze-patterns.mjs`.

## When to use
- "What patterns are in my scores?"
- "Which archetypes should I focus on?"
- "Why am I scoring low?"

## Process
1. `node analyze-patterns.mjs` reads `data/products.md` + `reports/*.md`.
2. Report: score distribution by archetype, by stage, by source; which signals
   (Block A–G) most differentiate high vs low scores; recurring red flags.
3. Recommend: which archetype/space to concentrate on; which to `SKIP`; which
   founder-proof-point gaps are capping scores (→ feed `proof-points.md`).

## Rules
- Recommendations cite the data (counts, averages).
- Feeds back into `modes/_profile.md` (retargeting) — never `modes/_shared.md`.
- This is meta-analysis; it doesn't evaluate new ideas.
