// Materializes per-CLI skill entrypoints from the canonical .agents/skills/ copy.
// Each supported CLI reads its own skill dir; we mirror the product-ops SKILL.md
// into each so the /product-ops slash command works everywhere without duplicates.
// Adapted from santifer/career-ops' scaffolder/bin/skill-entrypoints.mjs.
import { existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CLI_DIRS = [
  ".claude/skills",
  ".opencode/skills",
  ".qwen/skills",
  ".antigravitycli/skills",
  ".grok/skills",
];

// Mirror every skill under .agents/skills/<skill>/SKILL.md into each CLI dir.
export function ensureSkillEntrypoints(rootAbs) {
  const agentsSkills = join(rootAbs, ".agents", "skills");
  if (!existsSync(agentsSkills)) return;

  const skills = readdirSync(agentsSkills, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const cli of CLI_DIRS) {
    const cliSkillsDir = join(rootAbs, cli);
    mkdirSync(cliSkillsDir, { recursive: true });
    for (const skill of skills) {
      const src = join(agentsSkills, skill, "SKILL.md");
      if (!existsSync(src)) continue;
      const destDir = join(cliSkillsDir, skill);
      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, join(destDir, "SKILL.md"));
    }
  }
}

// `node skill-entrypoints.mjs` — run against cwd (used during development).
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureSkillEntrypoints(process.cwd());
  console.log("Skill entrypoints materialized.");
}
