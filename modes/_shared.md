# System Context — product-ops

<!-- ============================================================
     THIS FILE IS AUTO-UPDATABLE. Don't put personal data here.
     Your customizations go in modes/_profile.md (never auto-updated).
     This file contains system rules, scoring logic, and tool config
     that improve with each product-ops release.
     ============================================================ -->

## Sources of Truth (EXCLUSIVE)

The files below are the **ONLY** sources for user-facing content (brand copy,
business plan, marketing plan, pitch deck, positioning, pricing page). Auto-memory,
parent/sibling repos, and cross-session inferences are out of scope. See
"Source-of-Truth Boundary" in `AGENTS.md`.

| File | Path | When |
|------|------|------|
| idea.md | `idea.md` (project root) | ALWAYS |
| product.yml | `config/product.yml` | ALWAYS (identity, ICP, pricing goals, constraints) |
| _profile.md | `modes/_profile.md` | ALWAYS (brand archetypes, positioning, voice) |
| product-marketing.md | `.agents/product-marketing.md` | ALWAYS (shared product/audience/positioning context) |
| proof-points.md | `proof-points.md` (if exists) | ALWAYS (founder metrics, shipped work) |
| brand/ | `brand/*` | When generating brand-facing assets — palette, voice samples, logo |

**RULE: NEVER hardcode metrics from proof points.** Read them from `idea.md` + `proof-points.md` at evaluation time.
**RULE: For product metrics, `proof-points.md` takes precedence over `idea.md`.**
**RULE: Read `_profile.md` AFTER this file. User customizations in `_profile.md` override defaults here.**
**RULE: Never claim the founder built a project/tool/framework unless explicitly attributed in `idea.md` or `proof-points.md`.** Tool-of-trade conflation (founder uses X → founder built X) is forbidden.
**RULE: Keywords get reformulated, never fabricated.** Reorder, reframe, emphasise — but never invent. If a claim isn't backed by an in-scope file, ask the user. If no answer, omit. Silence beats manufactured detail.

---

## Scoring System

The evaluation uses 6 blocks (A–F) with a global score of 1–5:

| Block | Dimension | What it measures |
|-------|-----------|------------------|
| A | Market demand | Search volume / trend slope, complaint density (Reddit/HN), existing-tool usage |
| B | Differentiation | vs competitors in `competitors.yml` — moat, positioning whitespace |
| C | Feasibility | Build cost vs founder skills (from `idea.md`), time-to-MVP |
| D | Monetization | Pricing viability, unit economics, willingness-to-pay signals |
| E | Brand / moat | Defensibility, network effects, switching cost, brand potential |
| F | Red flags | Market shrink, commoditized, regulatory, capex-heavy, distribution-poor |

**Global = weighted average.** Default weights (override per-archetype in `_profile.md`):
A 0.25 · B 0.20 · C 0.15 · D 0.20 · E 0.10 · F 0.10.

**Score interpretation:**
- 4.5+ → Strong fit, recommend building immediately
- 4.0–4.4 → Good fit, worth building
- 3.5–3.9 → Decent but not ideal, build only with a specific reason
- Below 3.5 → Recommend against building (see Ethical Use in `AGENTS.md`)

Each block scores 1–5 with a one-line justification citing the evidence source
(e.g. "Google Trends slope +12%/mo; 440 Reddit complaint threads"). **No evidence
= no claim.** If a signal can't be verified, score conservatively and flag it in
Block G.

## Block G — Market Legitimacy (separate from score)

Block G assesses whether the opportunity is real and the market is alive. It
does **NOT** affect the 1–5 global score — it is a separate qualitative tier.

**Three tiers:**
- **High Confidence** — Real, active demand; competitors shipping; trend rising
- **Proceed with Caution** — Mixed signals; some concerns worth noting
- **Suspicious** — Multiple dead-market indicators; investigate first

**Key signals (weighted by reliability):**

| Signal | Source | Reliability | Notes |
|--------|--------|-------------|-------|
| Trend slope | Google Trends / `providers/google-trends.mjs` | High | Rising = good, flat = mixed, falling = concerning |
| Competitor shipping velocity | GitHub last-commit / PH recent upvotes / release notes | High | Direct observable |
| Review velocity | G2 / app-store review rate | Medium | Stalled reviews = stalled demand |
| Complaint density | Reddit / HN / `providers/reddit.mjs` | Medium | High complaint volume = real pain (good) AND/OR saturated (bad) |
| Clone saturation | `data/scan-history.tsv` repost pattern | Medium | Many near-identical clones = commoditized |
| Recent "shutting down" news | WebSearch | Medium | Consider timing + cause |
| Founder-history signals | Qualitative | Low | Supporting only |

**Market-liveness verification is MANDATORY before a full evaluation.** Use
Playwright (`browser_navigate` + `browser_snapshot`) to verify a competitor page
is live and a trend is current. Fallback ladder: Playwright → HTTP → WebFetch →
WebSearch → ask user. Never trust WebSearch alone for liveness.

**Ethical framing (MANDATORY):**
- This helps the founder prioritize time on real opportunities.
- NEVER present findings as accusations of deception by competitors.
- Present signals and let the user decide.
- Always note legitimate explanations for concerning signals.

## Archetype Detection

Classify every idea into one (or a hybrid of two):

| Archetype | Key signals |
|-----------|-------------|
| SaaS (B2B / vertical) | "subscription", "workflow", "dashboard", "teams", "integration" |
| Dev tool / infra | "CLI", "SDK", "API", "developer", "open source", "CI" |
| Marketplace | "two-sided", "supply", "demand", "matchmaking", "transactions" |
| Consumer app | "mobile", "social", "creator", "freemium", "viral" |
| B2B service / agency | "done-for-you", "consulting", "managed", "retainer" |
| Media / content | "newsletter", "publication", "audience", "sponsorship" |

After detecting archetype, read `modes/_profile.md` for the founder's specific
framing, proof points, and pricing norms for that archetype.

## Bounded Research Budget

Evaluations are bounded. Company/market/competitor lookup must **not** invoke
`deep-research`, must **not** spawn subagents, and must stop at the shared query
cap (default: 6 queries per block, max 24 per evaluation) instead of escalating
into open-ended research. Exhausting the budget is fine — score conservatively
and flag unverified signals in Block G. Deep research is a separate, opt-in
mode (`modes/deep.md`).

## Global Rules

- **Output language**: match `config/product.yml → language.modes_dir` if set; else English.
- **Currency / locale**: read from `config/product.yml → pricing_goals.currency` and `identity.location`.
- **Report format**: every evaluation writes `reports/{NNN}-{slug}-{YYYY-MM-DD}.md` with header `**URL:**`, `**Score:** X.X/5`, `**Legitimacy:** {tier}`, `**Archetype:** {type}`. Number reserved atomically via `reserve-report-num.mjs`.
- **Tracker writes**: never add rows directly to `data/products.md`. Write a TSV to `batch/tracker-additions/{num}-{slug}.tsv` and let `merge-tracker.mjs` merge. You MAY update existing rows' status/notes.
- **Personalization**: user-specific archetypes/framing/voice → `modes/_profile.md` or `config/product.yml`. NEVER `modes/_shared.md`.
- **Scrape ethics**: public/no-auth pages only; respect `robots.txt` unless `config/product.yml → scrape.aggressive` is true. Auth-gated sources are plugins.
- **Human-in-the-loop**: draft, evaluate, plan — but STOP before publish/spend/launch. The user clicks.
