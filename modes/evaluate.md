# Mode: evaluate — Product-Fit Evaluation (the heart of product-ops)

Evaluate one idea or market opportunity against the founder's profile. Produces
the A–G report that `auto-pipeline` and `batch` build on.

## Inputs (read first)
- `idea.md` (the concept) — or idea text from the conversation
- `config/product.yml` (ICP, pricing goals, constraints)
- `modes/_profile.md` (brand archetypes, positioning, voice)
- `.agents/product-marketing.md` (shared context, if present)
- `proof-points.md` (founder metrics, if present)
- `competitors.yml` (tracked competitors) — if the idea is a competitor URL, this is the seed

## Process

### Block A — Market demand (weight 0.25)
Quantify real demand. Sources: Google Trends slope, search-volume proxies
(`providers/google-suggest.mjs`, `serp.mjs`), complaint density
(`reddit.mjs`, `hackernews.mjs`), existing-tool usage (`github.mjs` stars,
app-store rankings). Score 1–5 with cited evidence.

### Block B — Differentiation (weight 0.20)
Compare vs tracked competitors + the top 3 found in scan. Identify positioning
whitespace (what everyone misses), moat potential, and "me-too" risk. Use
`competitor-profiling` + `competitors` marketingskills for structure.

### Block C — Feasibility (weight 0.15)
Build cost vs founder skills (from `idea.md` + `proof-points.md`). Time-to-MVP
solo, dependencies, technical risk. Be honest — a great market the founder can't
ship is a 2, not a 4.

### Block D — Monetization (weight 0.20)
Pricing viability, unit economics, willingness-to-pay signals. Compare to
competitor pricing (scrape their pricing pages — Step 0 ladder). Route structure
via `pricing` + `offers` + `revops` skills. Does it hit `config/product.yml →
pricing_goals`?

### Block E — Brand / moat (weight 0.10)
Defensibility (network effects, switching cost, data moat, brand potential).
Long-term, not just launch.

### Block F — Red flags (weight 0.10)
Negative adjustments: market shrink, commoditized, regulatory/capex heavy,
distribution-poor, single-platform dependency, founder-history concerns.

### Global = weighted average (1–5)
Apply `_profile.md` archetype weights if set. Round to one decimal.

### Block G — Market Legitimacy (separate tier)
Three tiers (High Confidence / Proceed with Caution / Suspicious). Signals per
`_shared.md`. **Mandatory Playwright liveness** for any competitor URL; batch
mode may fall back to WebFetch + mark `**Verification:** unconfirmed (batch)`.

## Output format

Write `reports/{###}-{slug}-{YYYY-MM-DD}.md`:

```markdown
# {Product} — Product-Fit Evaluation

**URL:** {url or "idea text"}
**Score:** X.X/5
**Legitimacy:** {tier}
**Archetype:** {type}
**Date:** YYYY-MM-DD

## A) Market demand
{score}/5 — {one-line justification with evidence source}

## B) Differentiation
...
## C) Feasibility
...
## D) Monetization
...
## E) Brand / moat
...
## F) Red flags
...
## Global: X.X/5 — {recommendation}

## G) Market Legitimacy — {tier}
{signals table}

## H) Draft Plan (only if score ≥ 4.0)
### Positioning
### Pricing
### Launch
```

## Rules
- Bounded research budget: ≤6 queries/block, ≤24/eval. No subagents, no `deep-research`.
- Every score cites an evidence source. No evidence → conservative score + Block G flag.
- "Keywords reformulated, never fabricated." Don't invent metrics, testimonials, or demand.
- Discourage < 4.0 (recommend against building) — see Ethical Use in `AGENTS.md`.
- Reserve the report number via `reserve-report-num.mjs` before writing.
