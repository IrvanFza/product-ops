#!/usr/bin/env node
// product-ops scaffolder — one-command install.
// Clones the repo at the latest release tag and installs dependencies, then
// installs marketingskills (the skill base) and materializes per-CLI skill
// entrypoints. Adapted from santifer/career-ops' scaffolder/bin/cli.mjs.
//
// It deliberately does NOT create idea.md / config/product.yml / competitors.yml:
// the agent runs a conversational onboarding on first launch (see AGENTS.md
// "First Run — Onboarding"), triggered precisely by those files being absent.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, cpSync, rmSync } from "node:fs";
import { join, delimiter, isAbsolute } from "node:path";
import { ensureSkillEntrypoints } from "./skill-entrypoints.mjs";

const REPO = "https://github.com/IrvanFza/product-ops.git";
const LATEST_RELEASE = "https://api.github.com/repos/IrvanFza/product-ops/releases/latest";
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
const GIT = process.platform === "win32" ? "git.exe" : "git";

// product-ops is AI-agnostic: every CLI reads AGENTS.md. We only detect them to
// tailor the final message — we never install/configure/remove anything per-CLI.
const SUPPORTED_CLIS = [
  { name: "Claude Code", cmd: "claude" },
  { name: "Gemini CLI", cmd: "gemini" },
  { name: "Codex", cmd: "codex" },
  { name: "Qwen Code", cmd: "qwen" },
  { name: "OpenCode", cmd: "opencode" },
  { name: "GitHub Copilot CLI", cmd: "copilot" },
  { name: "Antigravity CLI", cmd: "agy" },
  { name: "Grok Build CLI", cmd: "grok" },
];

const USAGE = `product-ops — set up an AI product-creation workspace.

Usage:
  npx product-ops init [folder]    Create a new workspace (default: ./product-ops)

After setup, open your AI coding tool inside the folder and paste an idea or a
competitor URL. Docs: https://github.com/IrvanFza/product-ops`;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function onPath(cmd) {
  const exts = process.platform === "win32" ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  for (const dir of (process.env.PATH || "").split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      try { if (existsSync(join(dir, cmd + ext))) return true; } catch {}
    }
  }
  return false;
}

function detectClis() {
  return SUPPORTED_CLIS.filter((c) => onPath(c.cmd));
}

async function latestTag() {
  try {
    const res = await fetch(LATEST_RELEASE, {
      headers: { "User-Agent": "product-ops-cli", Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.tag_name || null;
  } catch {
    return null;
  }
}

// Non-interactive marketingskills install: `npx skills add` is an interactive
// TUI that hangs in CI / non-interactive init. Clone+copy instead so init never
// blocks. Users can still run `npx skills add coreyhaines31/marketingskills`
// interactively later to pick a subset. Non-fatal on failure.
function installMarketingskills(targetDir) {
  console.log("\n→ Installing marketingskills (the skill base)…");
  const tmp = join(targetDir, "..", `.ms-clone-${Date.now()}`);
  const clone = spawnSync(GIT, ["clone", "--depth", "1", "https://github.com/coreyhaines31/marketingskills.git", tmp], { stdio: "ignore" });
  if (clone.status !== 0) {
    console.warn("\n⚠ Could not clone marketingskills. Install manually:\n  npx skills add coreyhaines31/marketingskills\n");
    return;
  }
  try {
    const msDir = join(targetDir, ".agents", "skills");
    mkdirSync(msDir, { recursive: true });
    let n = 0;
    for (const name of readdirSync(join(tmp, "skills"))) {
      cpSync(join(tmp, "skills", name), join(msDir, name), { recursive: true });
      n++;
    }
    ensureSkillEntrypoints(targetDir); // re-mirror per-CLI dirs with the new skills
    console.log(`  ✓ marketingskills installed (${n} skills).`);
  } catch (e) {
    console.warn(`\n⚠ marketingskills copy failed: ${e.message}.\n  Run 'npx skills add coreyhaines31/marketingskills' manually.\n`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function main() {
  const [cmd, dirArg] = process.argv.slice(2);
  if (!cmd || cmd === "-h" || cmd === "--help") { console.log(USAGE); return; }
  if (cmd !== "init") die(`Unknown command "${cmd}". Usage: npx product-ops init [folder]`);

  const target = dirArg || "product-ops";
  const targetAbs = isAbsolute(target) ? target : join(process.cwd(), target);
  if (existsSync(targetAbs)) die(`"${target}" already exists. Choose a different folder.`);

  console.log(`\n→ Cloning product-ops into ${target}…`);
  const tag = await latestTag();
  const ref = tag || "main"; // fall back to main if no release tag yet
  try {
    execFileSync(GIT, ["clone", "--depth", "1", "--branch", ref, REPO, targetAbs], {
      stdio: "inherit",
    });
  } catch {
    // tag may not exist on a fresh repo — retry against default branch
    try {
      execFileSync(GIT, ["clone", "--depth", "1", REPO, targetAbs], { stdio: "inherit" });
    } catch (e) {
      die(`Clone failed: ${e.message}. Check network / repo access.`);
    }
  }

  console.log("\n→ Installing dependencies…");
  // Some npm envs block postinstall scripts (EALLOWSCRIPTS). Retry without
  // scripts, then install Chromium explicitly so PDF/browser features still work.
  try {
    execFileSync(NPM, ["install"], { cwd: targetAbs, stdio: "inherit" });
  } catch {
    try {
      execFileSync(NPM, ["install", "--ignore-scripts"], { cwd: targetAbs, stdio: "inherit" });
    } catch (e) {
      console.warn(`\n⚠ npm install failed: ${e.message}. Run "npm install" inside ${target} manually.`);
    }
  }

  console.log("\n→ Ensuring Playwright Chromium…");
  // Bypass `npx` — it can hang on npm script-policy prompts in non-interactive
  // envs. Run the local playwright CLI directly via node.
  const pwCli = join(targetAbs, "node_modules", "playwright", "cli.js");
  let pw;
  if (existsSync(pwCli)) {
    pw = spawnSync(process.execPath, [pwCli, "install", "chromium"], { cwd: targetAbs, stdio: "inherit" });
  } else {
    pw = spawnSync("npx", ["playwright", "install", "chromium"], { cwd: targetAbs, stdio: "inherit", shell: process.platform === "win32" });
  }
  if (pw.status !== 0) {
    console.warn("\n⚠ Chromium install failed. Run `npx playwright install chromium` inside the workspace.");
  }

  ensureSkillEntrypoints(targetAbs);
  installMarketingskills(targetAbs);

  const clis = detectClis();
  console.log("\n✓ product-ops workspace ready.\n");
  console.log(`  cd ${target}`);
  if (clis.length) {
    console.log(`  Open it in ${clis.map((c) => c.name).join(", ")} and paste an idea or competitor URL.`);
    console.log("  (Or type /product-ops for the menu.)");
  } else {
    console.log("  Open it in any agent-skill-standard AI CLI and paste an idea or competitor URL.");
    console.log("  Install one of: claude, opencode, codex, qwen, gemini, copilot, agy, grok.");
  }
  console.log("\n  On first run the agent will walk you through onboarding (idea → profile → competitors).\n");
}

main().catch((e) => die(e.message));
