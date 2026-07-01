# Data Contract

This document defines which files belong to the **system** (auto-updatable) and
which belong to the **user** (never touched by updates). Adapted from
`santifer/career-ops`' `DATA_CONTRACT.md`.

## User Layer (NEVER auto-updated)

These files contain your product data, customizations, and work product. Updates
will NEVER modify them.

| File | Purpose |
|------|---------|
| `idea.md` | Your product concept in markdown (the "candidate") |
| `config/product.yml` | Product identity, ICP, pricing goals, constraints |
| `modes/_profile.md` | Your brand archetypes, positioning, voice, narrative |
| `modes/_custom.md` | Your house rules, custom workflows (procedural — survives updates) |
| `.agents/product-marketing.md` | Shared product/audience/positioning context (written by `product-marketing` skill) |
| `competitors.yml` | Your tracked competitor set + scan sources |
| `config/plugins.yml` | Your plugin activation toggles (seeded from `config/plugins.example.yml`) |
| `plugins.local/` | Your own / private plugins (never auto-updated) |
| `plugins.lock` | Integrity pins + recorded consent for enabled plugins (generated; never auto-updated) |
| `data/products.md` | Your product tracker (source of truth) |
| `data/products.db` | Derived query index over `products.md` (SQLite, rebuilt by `node tracker.mjs sync` — safe to delete) |
| `data/pipeline.md` | Your idea/competitor URL inbox |
| `data/scan-history.tsv` | Your scan history |
| `data/cadence.md` | Your re-evaluation / follow-up cadence |
| `brand/*` | Your brand assets (logo, palette, voice samples) |
| `proof-points.md` | Your founder proof points (metrics, shipped work) |
| `reports/*` | Your evaluation reports (+ `reports/assets/` screenshots) |
| `output/*` | Your generated PDFs |

## System Layer (safe to auto-update)

These files contain system logic, scripts, templates, and instructions that
improve with each release.

| File | Purpose |
|------|---------|
| `modes/_shared.md` | Product-fit scoring system, global rules, sources of truth |
| `modes/_custom.template.md` | Template seed for the user's `modes/_custom.md` |
| `modes/auto-pipeline.md` | Auto-pipeline instructions |
| `modes/ideate.md` `brand.md` `plan.md` `market.md` `operate.md` `evaluate.md` | Stage mode instructions |
| `modes/scan.md` `pipeline.md` `tracker.md` `deep.md` `batch.md` `patterns.md` | Utility mode instructions |
| `modes/feasibility.md` `financials.md` `decision.md` `review.md` `validate.md` `compliance.md` | Assessment-loop mode instructions |
| `modes/_profile.template.md` | Template seed for the user's `modes/_profile.md` |
| `CLAUDE.md` `OPENCODE.md` `CODEX.md` `GEMINI.md` `KIMI.md` | Thin `@AGENTS.md` redirect wrappers |
| `AGENTS.md` | Canonical agent instructions (imported by CLI-specific wrappers) |
| `*.mjs` | Utility scripts |
| `providers/` | Zero-token market-research board modules |
| `plugins/` | Bundled plugins + the plugin engine (opt-in external integrations) |
| `plugins.mjs` | Plugin CLI (list/run/available/add/new/enable/skill/trust/remove) |
| `plugins-registry.json` | Curated list of approved community plugins (the trust root) |
| `config/plugins.example.yml` | Plugin activation template (seed for `config/plugins.yml`) |
| `batch/batch-prompt.md` `batch-runner.sh` | Batch worker prompt + orchestrator |
| `dashboard/*` | Go TUI dashboard |
| `templates/*` | Base templates (HTML/LaTeX/PDF + `states.yml` + example configs) |
| `fonts/*` | Self-hosted fonts |
| `.agents/skills/*` | Skill definitions (incl. vendored marketingskills + `product-creation` orchestrator) |
| `.claude/skills/*` `.opencode/skills/*` `.qwen/skills/*` `.antigravitycli/skills/*` `.grok/skills/*` | Per-CLI skill entry (materialized by `ensureSkillEntrypoints`) |
| `docs/*` | Documentation |
| `VERSION` | Current version number |
| `DATA_CONTRACT.md` | This file |

## The Rule

**If a file is in the User Layer, no update process may read, modify, or delete it.**

**If a file is in the System Layer, it can be safely replaced with the latest
version from the upstream repo.**

When the user asks to customize anything (archetypes, narrative, pricing
framing, voice), ALWAYS write to `modes/_profile.md`, `config/product.yml`, or
`.agents/product-marketing.md`. NEVER edit `modes/_shared.md` for user-specific
content — system updates would overwrite it.
