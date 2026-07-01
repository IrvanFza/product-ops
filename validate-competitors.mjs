#!/usr/bin/env node
/**
 * validate-competitors.mjs — validate competitors.yml schema.
 * Run: node validate-competitors.mjs [--json]
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const FILE = join(ROOT, 'competitors.yml');

if (!existsSync(FILE)) {
  const msg = 'competitors.yml missing (copy templates/competitors.example.yml)';
  console.log(JSON_OUT ? `{"ok":false,"errors":["${msg}"]}` : `✗ ${msg}`);
  process.exit(1);
}

const errors = [];
let cfg;
try { cfg = yaml.load(readFileSync(FILE, 'utf-8')); }
catch (e) {
  console.log(JSON_OUT ? `{"ok":false,"errors":["invalid YAML: ${e.message}"]}` : `✗ invalid YAML: ${e.message}`);
  process.exit(1);
}

for (const [i, c] of (cfg.competitors || []).entries()) {
  if (!c.name) errors.push(`competitor[${i}]: name missing`);
  if (!c.url || !/^https?:\/\//.test(c.url)) errors.push(`competitor[${i}] ${c.name || ''}: url invalid`);
}
for (const [id, s] of Object.entries(cfg.sources || {})) {
  if (typeof s.enabled !== 'boolean') errors.push(`source.${id}: enabled not boolean`);
}

const ok = errors.length === 0;
if (JSON_OUT) console.log(JSON.stringify({ ok, errors }));
else { console.log(ok ? '✓ competitors.yml valid' : `✗ ${errors.length} error(s)`); errors.forEach((e) => console.log('  ' + e)); }
process.exit(ok ? 0 : 1);
