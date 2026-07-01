#!/usr/bin/env node
/**
 * update-system.mjs — Safe self-update of product-ops SYSTEM files.
 * Adapted from santifer/career-ops (MIT), simplified.
 * // ponytail: career-ops re-execs the target updater resolving its import closure
 * // for resilience across versions; v0.1 uses a straightforward git checkout of
 * // SYSTEM_PATHS. Add the re-exec trick if cross-version upgrades start breaking.
 *
 * Never touches USER files (see DATA_CONTRACT.md). Backs up before apply.
 *
 * Usage:
 *   node update-system.mjs check      # JSON: {status, local, remote, changelog}
 *   node update-system.mjs apply      # backup + checkout SYSTEM_PATHS from origin
 *   node update-system.mjs rollback   # restore from the last backup
 *   node update-system.mjs dismiss    # silence the current remote version until a newer one
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = 'IrvanFza/product-ops';
const VERSION_FILE = join(ROOT, 'VERSION');
const DISMISS_FILE = join(ROOT, '.update-dismissed');
const BACKUP_DIR = join(ROOT, '.update-backup');

// System paths safe to overwrite (must NOT overlap any USER path in DATA_CONTRACT.md).
const SYSTEM_PATHS = [
  'modes', 'providers', 'templates', 'fonts', 'dashboard', 'batch', 'plugins',
  'docs', '.agents/skills',
  'AGENTS.md', 'CLAUDE.md', 'OPENCODE.md', 'CODEX.md', 'GEMINI.md', 'KIMI.md',
  'DATA_CONTRACT.md', 'VERSION',
];
// *.mjs scripts are system too — handled separately as a glob below.

const localVersion = readFileSync(VERSION_FILE, 'utf-8').trim();

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'product-ops-updater', Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function remoteVersion() {
  try {
    const data = await fetchJson(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (data.tag_name) return { version: data.tag_name.replace(/^v/, ''), changelog: data.body || '' };
  } catch {}
  // Fallback: raw VERSION on the default branch. Validate res.ok + semver shape
  // so a 404 (repo not pushed / private) doesn't get treated as a version string.
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO}/main/VERSION`);
    if (!res.ok) return null;
    const v = (await res.text()).trim();
    if (/^\d+\.\d+\.\d+/.test(v)) return { version: v, changelog: '' };
  } catch {}
  return null;
}

function cmp(a, b) { return a === b ? 0 : (a < b ? -1 : 1); } // naive semver string cmp (good enough for 0.x)

async function check() {
  const remote = await remoteVersion();
  if (!remote) return { status: 'no-remote-version' };
  let dismissed = null;
  if (existsSync(DISMISS_FILE)) dismissed = readFileSync(DISMISS_FILE, 'utf-8').trim();
  if (dismissed === remote.version) return { status: 'dismissed' };
  const c = cmp(localVersion, remote.version);
  if (c < 0) return { status: 'update-available', local: localVersion, remote: remote.version, changelog: remote.changelog };
  return { status: 'up-to-date', local: localVersion, remote: remote.version };
}

function apply() {
  // Backup system paths (USER files are never touched).
  rmSync(BACKUP_DIR, { recursive: true, force: true });
  mkdirSync(BACKUP_DIR, { recursive: true });
  for (const p of SYSTEM_PATHS) {
    if (existsSync(join(ROOT, p))) cpSync(join(ROOT, p), join(BACKUP_DIR, p), { recursive: true });
  }
  // Fetch + checkout system paths from origin/main.
  execSync('git fetch --depth 1 origin main', { cwd: ROOT, stdio: 'ignore' });
  const paths = [...SYSTEM_PATHS, '*.mjs'];
  execSync(`git checkout origin/main -- ${paths.map((p) => `"${p}"`).join(' ')}`, { cwd: ROOT, stdio: 'ignore' });
  // Refresh per-CLI skill entrypoints.
  try { execSync('node scaffolder/bin/skill-entrypoints.mjs', { cwd: ROOT, stdio: 'ignore' }); } catch {}
  rmSync(DISMISS_FILE, { force: true });
  console.log(JSON.stringify({ status: 'applied', version: readFileSync(VERSION_FILE, 'utf-8').trim() }));
}

function rollback() {
  if (!existsSync(BACKUP_DIR)) { console.error('No backup to roll back to.'); process.exit(1); }
  for (const p of SYSTEM_PATHS) {
    if (existsSync(join(BACKUP_DIR, p))) {
      rmSync(join(ROOT, p), { recursive: true, force: true });
      cpSync(join(BACKUP_DIR, p), join(ROOT, p), { recursive: true });
    }
  }
  console.log('Rolled back system files from .update-backup/.');
}

function dismiss() {
  // record current remote so check stays silent until a newer version appears
  remoteVersion().then((r) => {
    if (r) { writeFileSync(DISMISS_FILE, r.version); console.log(`Dismissed update ${r.version}.`); }
    else console.log('Could not fetch remote version to dismiss.');
  });
}

const cmd = process.argv[2];
if (cmd === 'check') check().then((r) => console.log(JSON.stringify(r)));
else if (cmd === 'apply') apply();
else if (cmd === 'rollback') rollback();
else if (cmd === 'dismiss') dismiss();
else { console.error('Usage: node update-system.mjs check|apply|rollback|dismiss'); process.exit(1); }
