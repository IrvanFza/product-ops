# product-ops (scaffolder)

The public npm entry that bootstraps a product-ops workspace. Published
separately from the main repo (the main `package.json` is `private: true`).

```bash
npx product-ops init [folder]      # default: ./product-ops
```

What it does:
1. Resolves the latest release tag of `IrvanFza/product-ops` (falls back to `main`).
2. `git clone --depth 1 --branch <tag>` into the target folder.
3. `npm install` (postinstall installs Playwright Chromium).
4. `ensureSkillEntrypoints()` — mirrors `.agents/skills/*/SKILL.md` into each
   per-CLI skill dir (`.claude/skills`, `.opencode/skills`, …).
5. `npx skills add coreyhaines31/marketingskills` (non-fatal — prints the manual
   command if `npx skills` is unavailable).
6. Detects installed AI CLIs to tailor the final message.

It deliberately does **not** pre-create `idea.md` / `config/product.yml` /
`competitors.yml` — their absence is what triggers the agent's conversational
onboarding on first launch (see `AGENTS.md` "First Run — Onboarding").
