# M1 TODO — remaining script copies & adaptations

The authored foundation is done (repo shell, `package.json`, `DATA_CONTRACT.md`,
`AGENTS.md`, multi-CLI entry files, `.agents/skills/product-ops/SKILL.md`,
`scaffolder/`, onboarding seed templates, `templates/states.yml`).

What remains for M1 is copying career-ops' **generic, battle-tested machinery**
from `~/Projects/OpenSource/career-ops` into `~/Projects/OpenSource/product-ops`,
then adapting job-specific references. Read each file before copying — don't
blind-copy. Keep career-ops' MIT attribution (already in `LICENSE`).

## Copy verbatim (minimal adaptation — rename `applications` → `products`, `cv` → `idea`)
- [ ] `update-system.mjs` — self-update (verify it derives SYSTEM_PATHS from `DATA_CONTRACT.md`, not hardcoded job paths)
- [ ] `updater-migration-tests.mjs` + `validate-system-paths-coverage.mjs` — system/user boundary tests
- [ ] `doctor.mjs` — rewrite the prerequisite list (`cv`→`idea`, `profile`→`product`, `portals`→`competitors`); add a `browser` health check
- [ ] `reserve-report-num.mjs` — atomic report# reservation (generic)
- [ ] `tracker.mjs` + `tracker-utils.mjs` + `tracker-parse.mjs` + `tracker-links.mjs` — SQLite index over `data/products.md`
- [ ] `merge-tracker.mjs` — merges `batch/tracker-additions/*.tsv` (status/score swap + link normalization)
- [ ] `dedup-tracker.mjs` + `normalize-statuses.mjs` + `reconcile-pipeline.mjs` — integrity
- [ ] `generate-pdf.mjs` — Playwright HTML→PDF (swap ATS-text-normalization for general copy; keep `--report` linkage to `data/pdf-index.tsv`)
- [ ] `batch/batch-prompt.md` + `batch/batch-runner.sh` — rewrite the prompt for product-fit eval
- [ ] `plugins.mjs` + `plugin-install.mjs` + `plugin-audit.mjs` + `validate-plugin-registry.mjs` + `plugins-registry.json` — plugin engine (generic)
- [ ] `dashboard/` (Go TUI) — point at `data/products.md`
- [ ] standalone evaluators: `gemini-eval.mjs`, `ollama-eval.mjs`, `openai-eval.mjs`, `openrouter-runner.mjs` — swap the injected prompt to product-fit scoring
- [ ] `liveness-browser.mjs` + `liveness-core.mjs` + `liveness-api.mjs` + `check-liveness.mjs` — reframe "posting alive?" → "competitor alive / trend hot?" (keep UA/throttle/SSRF guards)
- [ ] `providers/_http.mjs` + `_trust-validator.mjs` + `_types.js` + `local-parser.mjs` + `hackernews.mjs` — shared infra + the one reusable board
- [ ] `verify-pipeline.mjs` + `analyze-patterns.mjs` + `followup-cadence.mjs` + `build-dashboard.mjs`

## Build new (product-specific)
- [ ] `modes/_shared.md` — product-fit A–F + Block G market-legitimacy + sources-of-truth table (M2)
- [ ] `modes/auto-pipeline.md` + stage modes (`ideate`, `brand`, `plan`, `market`, `operate`, `evaluate`, `scan`, `pipeline`, `tracker`, `deep`, `batch`, `patterns`) (M2)
- [ ] `modes/_profile.template.md` (M2)
- [ ] market-research `providers/`: `producthunt`, `g2`, `crunchbase`, `similarweb`, `reddit`, `google-trends`, `serp`, `appstore`, `playstore`, `github`, `google-suggest` (M3)
- [ ] `scan.mjs` wired to new providers (M3)
- [ ] `generate-screenshot.mjs` — competitor landing-page PNGs into `reports/assets/` (M3)
- [ ] templates: `brand-guide.html`, `business-plan.html`, `marketing-plan.html`, `pitch-deck.html`, `one-pager.html` (M4)
- [ ] `.agents/skills/product-creation/SKILL.md` — 5-stage orchestrator router (M5)
- [ ] `product-sync-check.mjs` — keep `idea.md` ↔ `config/product.yml` ↔ `.agents/product-marketing.md` consistent
- [ ] `test-all.mjs` adapted + CI (Actions test+CodeQL, release-please) (M6)

## Verification (definition of done for M1)
- [ ] `node -c` / `node --check` passes on every copied `.mjs`
- [ ] `node doctor.mjs --json` returns `{"onboardingNeeded":true,...}` on a fresh clone
- [ ] `npx product-ops init /tmp/po-smoke` clones, installs, materializes entrypoints, prints the CLI message
- [ ] `git status` clean; first commit tagged `v0.1.0`
