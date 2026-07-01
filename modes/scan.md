# Mode: scan — Discover ideas & competitors (zero-token)

Find new ideas, competitors, and demand signals from public sources. Zero LLM
cost — `scan.mjs` + `providers/*.mjs` hit public APIs/RSS/HTML directly.

## When to use
- "Scan for new ideas/competitors"
- "What's trending in {space}?"
- `/product-ops scan`

## Process
1. Read `competitors.yml` → `sources` (which providers enabled, queries).
2. Run `node scan.mjs` (or `scan:full`). Each provider module returns normalized
   entries: name, url, source, signal (e.g. PH upvotes, HN points, GitHub stars,
   Trends slope, G2 review count).
3. Dedup against `data/scan-history.tsv`; new entries append to `data/pipeline.md`
   as `- [ ] {name} | {url} — {signal}`.
4. Optionally `--verify` runs market-liveness on each (Playwright) before adding.

## Rules
- Public/no-auth sources only in core. Auth-gated (Ahrefs/SimilarWeb) = plugins.
- Respect `robots.txt` unless `config/product.yml → scrape.aggressive`.
- Scan is a filter, not a spray — high-signal entries only. The founder evaluates.
- After a batch scan, suggest `pipeline` mode to process the inbox.
