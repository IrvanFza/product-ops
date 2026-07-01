---
name: product-creation
description: "Top-level orchestrator that routes a product from idea to operating business across 5 stages. For solo founders taking a product from ideation to growth: (1) Ideation, (2) Name & brand, (3) Business plan & pricing, (4) Marketing plan & launch, (5) Growth & operations. Each stage calls the relevant marketingskills (product-marketing foundation, customer-research, pricing, offers, launch, ab-testing, etc.) and invokes the matching product-ops mode (ideate, brand, plan, market, operate). product-marketing writes .agents/product-marketing.md, the shared context every later skill reads first. End-to-end flow in modes/auto-pipeline.md; scoring in modes/_shared.md. Local-first, human-in-the-loop — STOP before publish/spend/launch. No fabrication: keywords reformulated, never invented."
metadata:
  version: 0.1.0
---

# product-creation — product-creation orchestrator

`product-creation` is the top-level **router/orchestrator** that drives a new
product from idea to operating business. It is *not* a worker — it routes each
stage to the right `marketingskills` skills (under `.agents/skills/`) and
invokes the matching `product-ops` mode (in `modes/`). Read `modes/_shared.md`
first for the product-fit scoring system + Sources-of-Truth rule, and
`modes/auto-pipeline.md` for the full end-to-end flow (paste an idea or
competitor URL → research → evaluate → brand/plan PDFs → tracker).

## The 5 stages

| # | Stage | product-ops mode | marketingskills routed |
|---|-------|------------------|------------------------|
| 1 | Ideation | `ideate` | `customer-research`, `marketing-ideas`, `marketing-psychology`, `free-tools` |
| 2 | Name & brand | `brand` | `competitor-profiling`, `customer-research`, `product-marketing`, `offers` |
| 3 | Business plan / pricing | `plan` | `pricing`, `offers`, `revops` |
| 4 | Marketing plan / launch | `market` | `product-marketing`, `marketing-plan`, `launch`, `content-strategy`, `seo-audit`, `ads` |
| 5 | Growth / operations | `operate` | `referrals`, `free-tools`, `co-marketing`, `onboarding`, `signup`, `churn-prevention`, `analytics`, `ab-testing` |

**`product-marketing` is the foundation.** It writes
`.agents/product-marketing.md` (product / audience / positioning), the shared
context every other stage reads first. If missing, create/update it in stage 2
(brand) before anything downstream runs.

## Artifacts by stage

| Stage | Template → output |
|-------|-------------------|
| Brand | `templates/brand-guide.html` → `output/{slug}-brand-guide.pdf` |
| Plan | `templates/business-plan.html` → `output/{slug}-business-plan.pdf` |
| Market | `templates/marketing-plan.html` → `output/{slug}-marketing-plan.pdf` |
| Market (optional) | `templates/pitch-deck.html`, `templates/one-pager.html` → `output/{slug}-{deck,one-pager}.pdf` |

Render via `generate-pdf.mjs` (Playwright HTML→PDF, a4, `printBackground: true`).

## Slash-menu

| If the user... | Route to |
|---|---|
| Pastes idea or competitor URL | `auto-pipeline` |
| Wants to generate/refine an idea | stage 1 → `ideate` |
| Wants naming / positioning / brand | stage 2 → `brand` |
| Wants a business plan / pricing | stage 3 → `plan` |
| Wants a marketing plan / launch | stage 4 → `market` |
| Wants growth / regular operations | stage 5 → `operate` |
| Wants a pitch deck / one-pager | stage 4 (option) |
| Asks to evaluate one idea | `evaluate` |
| Asks to compare ideas | `evaluate` (compare) |

## Critical rules

- **No fabrication.** Keywords reformulated, never invented. Claims cite a
  Source-of-Truth file (`idea.md`, `config/product.yml`, `modes/_profile.md`,
  `.agents/product-marketing.md`, `proof-points.md`, `brand/*`) or are flagged
  `(assumed)` / `(unconfirmed)`.
- **Human-in-the-loop gates.** Draft, evaluate, plan — but **STOP before
  publish / spend / launch.** The founder clicks. No auto-publish, no auto-spend.
- **Discourage low fit.** Score < 4.0 → recommend against building; < 3.5 skips PDF generation.
- **Data contract.** Never write user data into system files. Customization →
  `modes/_profile.md` / `config/product.yml`, never `modes/_shared.md`.
- **Bounded research.** No `deep-research`, no subagents, stop at the query cap (`modes/_shared.md`).

`product-creation` orchestrates; the modes and marketingskills do the work.
