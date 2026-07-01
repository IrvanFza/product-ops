---
name: product-ops
description: "AI-powered product-creation pipeline for solo founders. Use when the user wants to take a product from idea to operating business: ideation, customer/competitor research, naming & brand, business plan, pricing & packaging, marketing plan, launch, growth/operations, or when they paste an idea/competitor URL for a full evaluation. Routes to marketingskills (product-marketing, pricing, offers, revops, launch, customer-research, competitor-profiling, churn-prevention, ab-testing, etc.) and to product-ops modes (ideate, brand, plan, market, operate, evaluate, scan, tracker, deep, batch). Runs on any agent-skill-standard CLI. Local-first, human-in-the-loop — never auto-publishes or auto-spends."
metadata:
  version: 0.1.0
---

# Product-Ops — product-creation pipeline

You drive a product from idea to operating business across 5 stages. The brain
lives in `modes/` (read `modes/_shared.md` first for the product-fit scoring
system and Sources-of-Truth rule). Skill-level marketing/ops capability comes
from the vendored `marketingskills` skills under `.agents/skills/`; the
`product-creation` orchestrator skill routes stage → skills.

## Slash-command menu

| If the user... | Mode |
|---|---|
| Pastes idea or competitor URL | `auto-pipeline` (research + eval + brand/plan PDFs + tracker) |
| Wants to generate/refine an idea | `ideate` |
| Wants naming, positioning, brand | `brand` |
| Wants a business plan / pricing | `plan` |
| Wants a marketing plan / launch | `market` |
| Wants growth / regular operations | `operate` |
| Asks to evaluate one idea/opportunity | `evaluate` |
| Asks to compare ideas | `evaluate` (compare) |
| Wants competitor/market research | `deep` |
| Searches for new ideas/competitors | `scan` |
| Processes pending pipeline URLs | `pipeline` |
| Asks about product status | `tracker` |
| Batch processes ideas | `batch` |
| Asks about scoring patterns | `patterns` |
| Wants to update the system | `update` |

## Stages → marketingskills routing

1. **Ideation** → `customer-research`, `marketing-ideas`, `marketing-psychology`, `free-tools`
2. **Name & brand** → `competitor-profiling`, `customer-research`, `product-marketing`, `offers`
3. **Business plan / pricing** → `pricing`, `offers`, `revops`
4. **Marketing plan** → `product-marketing`, `marketing-plan`, `launch`, `content-strategy`, `seo-audit`, `ads`
5. **Growth / operations** → `referrals`, `free-tools`, `co-marketing`, `onboarding`, `signup`, `churn-prevention`, `analytics`, `ab-testing`

`product-marketing` is the foundation — it writes `.agents/product-marketing.md`
(product/audience/positioning) that every other skill reads first.

## Critical rules (see AGENTS.md + modes/_shared.md)

- **Data contract**: never write user data into system files. Customization →
  `modes/_profile.md` / `config/product.yml`, never `modes/_shared.md`.
- **Sources of Truth**: only `idea.md`, `config/product.yml`, `modes/_profile.md`,
  `.agents/product-marketing.md`, `brand/*`, `proof-points.md` may generate
  user-facing content. *"Keywords reformulated, never fabricated."*
- **Human-in-the-loop**: draft, evaluate, plan — but STOP before publish/spend/
  launch. The user clicks.
- **Discourage low-fit**: score < 4.0 → recommend against building.
- **Browser/research**: SPA extraction + market-liveness use Playwright
  (`browser_navigate` + `browser_snapshot`), with fallback ladder
  Playwright → HTTP → WebFetch → WebSearch → ask user. Respect `robots.txt`
  unless `scrape.aggressive` is set.
- **Update check** on first message: `node update-system.mjs check` (silent).
- **Onboarding**: `node doctor.mjs --json` — if `onboardingNeeded`, run the
  AGENTS.md "First Run" steps before any mode.
