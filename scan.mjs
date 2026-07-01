#!/usr/bin/env node
/**
 * scan.mjs — Zero-token discovery of ideas / competitors / demand signals.
 * Adapted from santifer/career-ops (MIT), simplified.
 *
 * Reads enabled sources from competitors.yml, dispatches to providers/*.mjs,
 * writes new entries to data/pipeline.md and a row per finding to
 * data/scan-history.tsv (for dedup + repost/clone detection).
 *
 * Run: node scan.mjs            (uses competitors.yml)
 *      node scan.mjs --verify   (also run market-liveness via HTTP head — no Playwright here)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { makeHttpCtx } from './providers/_http.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const COMPETITORS_FILE = join(ROOT, 'competitors.yml');
const PIPELINE_FILE = join(ROOT, 'data/pipeline.md');
const HISTORY_FILE = join(ROOT, 'data/scan-history.tsv');

mkdirSync(join(ROOT, 'data'), { recursive: true });
const ctx = makeHttpCtx();

if (!existsSync(COMPETITORS_FILE)) {
  console.error('competitors.yml not found. Copy templates/competitors.example.yml → competitors.yml first.');
  process.exit(1);
}

const cfg = yaml.load(readFileSync(COMPETITORS_FILE, 'utf-8'));
const sources = cfg.sources || {};

// Discover provider modules in providers/ (skip _-prefixed).
const providerIds = readdirSync(join(ROOT, 'providers'))
  .filter((f) => f.endsWith('.mjs') && !f.startsWith('_'))
  .map((f) => f.replace(/\.mjs$/, ''));

async function loadProvider(id) {
  const mod = await import(`./providers/${id}.mjs`);
  return mod.default || mod;
}

// History dedup: "name|url" keys.
const history = new Set();
if (existsSync(HISTORY_FILE)) {
  for (const line of readFileSync(HISTORY_FILE, 'utf-8').split('\n')) {
    if (!line.trim()) continue;
    history.add(line.split('\t').slice(0, 2).join('|'));
  }
}

const newEntries = [];
const historyRows = [];
const ts = new Date().toISOString().slice(0, 10);

for (const id of providerIds) {
  const entry = sources[id];
  if (!entry || entry.enabled === false) continue;
  const provider = await loadProvider(id);
  let findings = [];
  try {
    findings = await provider.fetch({ name: id, ...entry }, ctx);
  } catch (e) {
    console.error(`${id}: ${e.message}`);
    continue;
  }
  for (const f of findings) {
    const key = `${(f.title || '').toLowerCase().slice(0, 80)}|${f.url || ''}`;
    if (history.has(key)) continue;
    history.add(key);
    historyRows.push([f.title || '', f.url || '', id, f.signal || '', ts].join('\t'));
    newEntries.push({ ...f, source: id });
  }
}

// Append to pipeline.md
let pipeline = existsSync(PIPELINE_FILE) ? readFileSync(PIPELINE_FILE, 'utf-8') : '# Pipeline\n\n';
const additions = newEntries
  .map((e) => `- [ ] ${e.title} | ${e.url} — ${e.source}${e.signal ? ` (${e.signal})` : ''}`)
  .join('\n');
if (additions) {
  if (!pipeline.endsWith('\n')) pipeline += '\n';
  pipeline += additions + '\n';
  writeFileSync(PIPELINE_FILE, pipeline);
}

// Append to scan-history.tsv
if (historyRows.length) {
  const header = existsSync(HISTORY_FILE) ? '' : 'title\turl\tsource\tsignal\tdate\n';
  writeFileSync(HISTORY_FILE, (existsSync(HISTORY_FILE) ? '' : header) + historyRows.join('\n') + '\n', { flag: 'a' });
}

console.log(`scan: ${newEntries.length} new entr${newEntries.length === 1 ? 'y' : 'ies'} across ${providerIds.length} provider(s).`);
if (newEntries.length) console.log(`  → ${PIPELINE_FILE}`);
