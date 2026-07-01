# Mode: market — Marketing Plan & Launch

GTM, channels, launch plan, content/SEO, paid. Stage 4.

## When to use
- "Write my marketing plan"
- "Plan the launch"
- "What channels?"
- "Content / SEO strategy"

## Inputs
- `.agents/product-marketing.md` (positioning — read first), `idea.md`,
  `config/product.yml`, `brand/voice.md`, `brand/pricing.md`

## Process
1. **Marketing plan** — route to `marketing-plan` skill. Comprehensive plan:
   audience, message, channel mix, funnel, 90-day calendar, budget split.
2. **Channel selection** — based on ICP + archetype (read `_profile.md`).
   Route to the relevant skills: `content-strategy`, `seo-audit`,
   `programmatic-seo`, `ads`, `social`, `public-relations`, `community-marketing`,
   `cold-email`, `directory-submissions`.
3. **Launch plan** — route to `launch` skill. Pre-launch, launch day, post-launch
   sequence; the first 14 days hour-by-hour for launch day; assets checklist.
4. **Content/SEO baseline** — `seo-audit` + `site-architecture` + `schema` for
   the landing page; `content-strategy` for the first 10 pieces.
5. **Marketing plan PDF** — render `templates/marketing-plan.html` →
   `output/{slug}-marketing-plan.pdf` via `generate-pdf.mjs`. Optionally
   `templates/pitch-deck.html` + `templates/one-pager.html`.

## Output
- `output/{slug}-marketing-plan.pdf` (+ optional pitch deck / one-pager)
- `brand/marketing-plan.md` (the plan — USER)
- Update `data/products.md` status → `Launched` (only when actually launched; else stay `Planned`)

## Rules
- Channel claims cite why they fit the ICP (e.g. "ICP is on LinkedIn — `social` skill").
- Paid-ad spend is a *plan* — do NOT create or fund ad accounts. STOP before spend.
- Don't auto-publish content/scheduled posts. Drafts only; the founder publishes.
- Respect `constraints.budget` for paid-channel recommendations.
