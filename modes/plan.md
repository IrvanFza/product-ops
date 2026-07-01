# Mode: plan — Business Plan & Pricing

Offer design, packaging, pricing, revenue model, and unit economics. Stage 3.

## When to use
- "Build me a business plan"
- "How should I price this?"
- "What tiers / packaging?"
- "Is the unit economics viable?"

## Inputs
- `idea.md`, `config/product.yml` (esp. `pricing_goals`), `.agents/product-marketing.md`
- `competitors.yml` (scrape competitor pricing pages — Step 0 ladder — for anchoring)
- `proof-points.md` (founder's cost basis / existing distribution)

## Process
1. **Offer design** — route to `offers` skill. Define the thing sold: value
   framing, what's included, guarantees, the "why now".
2. **Pricing** — route to `pricing` skill. Propose: model (sub/one-time/usage/
   freemium), 2–3 tiers, anchor, free-tier y/n, annual discount. Justify against
   competitor anchors + ICP willingness-to-pay + `pricing_goals` targets.
3. **Revenue model / revops** — route to `revops` skill. Lead lifecycle,
   marketing→sales handoff, expansion paths. For B2B, the buying motion.
4. **Unit economics** — CAC (realistic, cite distribution), LTV, payback, margin.
   Mark every assumption; flag unverified ones `(assumed)`.
5. **Business plan PDF** — render `templates/business-plan.html` →
   `output/{slug}-business-plan.pdf` via `generate-pdf.mjs`. Sections: problem,
   solution, market, model, pricing, unit economics, GTM summary, risks, 90-day plan.

## Output
- `output/{slug}-business-plan.pdf`
- `brand/pricing.md` (the pricing proposal — USER)
- Update `data/products.md` status → `Planned`

## Rules
- Pricing is a *draft proposal* — present, don't set in stone.
- Unit-economics numbers cite a source or are marked `(assumed)`. No invented metrics.
- Respect `pricing_goals.floor`/`ceiling`/`currency` from `config/product.yml`.
- STOP before changing live prices or spending on paid acquisition.
