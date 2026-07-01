# Mode: deep — Deep research (opt-in, unbounded)

Open-ended market/competitor research that exceeds the bounded evaluation budget.
Use when the founder explicitly wants depth on one opportunity.

## When to use
- "Deep-dive this market"
- "Full competitive landscape for {space}"
- "Validate demand thoroughly"

## Process
1. Unlike `evaluate` (≤24 queries, no subagents), `deep` may use extended
   research: multiple Playwright page reads, full competitor pricing-page
   extraction, review mining, trend history, audience interviews synthesis.
2. Produce a research brief (not a scored report): market size proxies, demand
   evidence, competitor matrix, positioning whitespace, risk inventory.
3. Save to `reports/{NNN}-{slug}-deep-{YYYY-MM-DD}.md`. Link from the product's
   main report.

## Rules
- Explicit opt-in — never auto-invoked from `auto-pipeline` (which is bounded).
- Still no fabrication; cite every claim.
- Still respects `robots.txt` / scrape ethics.
- Output feeds back into `evaluate` as stronger evidence (improves future scores).
