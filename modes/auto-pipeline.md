# Mode: auto-pipeline — Full Automatic Pipeline

When the user pastes an **idea** (text) or a **competitor/product URL** without an
explicit sub-command, execute the ENTIRE pipeline in sequence.

## Step 0 — Extract input

If the input is a **URL** (competitor landing/pricing page, Product Hunt, G2, app
listing), extract content using the fallback ladder:

1. **Playwright (preferred):** most competitor sites, G2, and app listings are
   SPAs. Use `browser_navigate` + `browser_snapshot` to render and read the page.
   Capture a full-page screenshot to `reports/assets/{slug}-landing.png` for the
   brand/messaging analysis in Step 3.
2. **direct HTTP (curl/node fetch):** for static HTML or public JSON/RSS.
3. **WebFetch (fallback):** best-effort text extraction.
4. **WebSearch (last resort):** find a secondary static source.
5. **If nothing works:** ask the user to paste the page text or a screenshot.

If the input is **idea text** (not a URL): use directly.

## Step 0.5 — Market-liveness gate

Before spending tokens on the A–G evaluation, confirm the opportunity is alive.
From the Step 0 snapshot/fetched content + a zero-token scan, classify:

- **active market evidence:** rising trend slope (Trends), competitors shipping
  (recent GitHub commits / PH upvotes / release notes), review velocity, active
  complaint threads
- **dead-market evidence:** falling trend, competitors archived/shutting down,
  stalled reviews, "sunset" news, clone saturation with no differentiation

If the market looks dead or the trend is cold, **stop here**: do not run Steps
1–4. Tell the founder the market looks stale, and if the entry came from
`data/pipeline.md`, mark it `- [x] ~~Product | url~~ — market stale`.

If only idea text was pasted (no URL), run a minimal Trends + competitor-velocity
check; if that also can't verify, proceed but flag `**Legitimacy:** unconfirmed`
in the report.

Do not continue to Step 1 until this gate is resolved.

## Step 1 — A–G Evaluation

Execute the `evaluate` mode (read `modes/evaluate.md` for all A–F blocks + Block
G Market Legitimacy). The evaluation inherits the bounded research budget from
`_shared.md` — no `deep-research`, no subagents, stop at the query cap.

## Step 2 — Save Report .md

Save the full evaluation in `reports/{###}-{product-slug}-{YYYY-MM-DD}.md`
(format in `modes/evaluate.md`). Include Block G. Header must carry `**URL:**`,
`**Score:** X.X/5`, `**Legitimacy:** {tier}`, `**Archetype:** {type}`. Reserve
the number atomically via `reserve-report-num.mjs`.

## Step 3 — Generate stage artifacts

Based on archetype and the founder's stage in the pipeline, generate the
relevant PDFs (reuse `generate-pdf.mjs`; templates in `templates/`):

- **Brand stage** → `templates/brand-guide.html` → `output/{slug}-brand-guide.pdf`
- **Plan stage** → `templates/business-plan.html` → `output/{slug}-business-plan.pdf`
- **Market stage** → `templates/marketing-plan.html` → `output/{slug}-marketing-plan.pdf`
- (optional) `templates/one-pager.html`, `templates/pitch-deck.html`

Stage selection: if score ≥ 4.0, generate brand + business-plan + marketing-plan.
If 3.5–3.9, generate brand + business-plan only. Below 3.5, skip generation (see
Ethical Use). The founder can request specific stages explicitly.

Route the *content* of each artifact through the corresponding marketingskills
(see `modes/brand.md` / `modes/plan.md` / `modes/market.md` for the skill calls).

## Step 4 — Draft positioning + pricing + launch plan (only if score ≥ 4.0)

1. **Positioning** (one paragraph) — read `.agents/product-marketing.md`; route via `product-marketing` skill.
2. **Pricing** — one concrete proposal (model, tiers, anchor, free-tier y/n); route via `pricing` + `offers` skills.
3. **Launch** — one-page launch plan (channels, sequence, first 14 days); route via `launch` skill.

Save as section `## H) Draft Plan` in the report. Tone: direct, evidence-backed,
no hype. Mark every claim with its source; unverified claims get `(unconfirmed)`.

**Human-in-the-loop gate:** these are *drafts*. Do NOT publish, do NOT spend,
do NOT launch. Present them for the founder's review.

## Step 5 — Update Tracker

Record it in `data/products.md` via a TSV in `batch/tracker-additions/{num}-{slug}.tsv`
(see `AGENTS.md` → Pipeline Integrity for the column format + the status/score
swap). All columns including Report and PDF as ✅.

**If any step fails**, continue with the next ones and mark the failed step as
pending in the tracker notes.
