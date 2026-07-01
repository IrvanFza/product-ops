#!/usr/bin/env node
/**
 * product-sync-check.mjs — keep idea.md ↔ config/product.yml ↔ .agents/product-marketing.md
 * consistent. Analogous to career-ops' cv-sync-check.mjs.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const ROOT = dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const IDEA = join(ROOT, 'idea.md');
const PY = join(ROOT, 'config/product.yml');
const PM = join(ROOT, '.agents/product-marketing.md');

const issues = [];
let ideaName = '', pyName = '';

if (existsSync(IDEA)) {
  const m = readFileSync(IDEA, 'utf-8').match(/^#\s*Idea:\s*(.+)/m);
  ideaName = m ? m[1].trim() : '';
} else issues.push('idea.md missing');

if (existsSync(PY)) {
  try {
    const y = yaml.load(readFileSync(PY, 'utf-8'));
    pyName = y?.identity?.name || '';
    if (!y?.icp?.primary_use_case) issues.push('product.yml: icp.primary_use_case empty');
    if (!y?.pricing_goals?.currency) issues.push('product.yml: pricing_goals.currency empty');
  } catch { issues.push('product.yml: invalid YAML'); }
} else issues.push('config/product.yml missing');

if (!existsSync(PM)) issues.push('.agents/product-marketing.md missing (run the product-marketing skill)');

if (ideaName && pyName && !pyName.toLowerCase().includes('tbd') && ideaName.toLowerCase() !== pyName.toLowerCase()) {
  issues.push(`name mismatch: idea="${ideaName}" vs product.yml="${pyName}"`);
}

const ok = issues.length === 0;
if (JSON_OUT) console.log(JSON.stringify({ ok, issues, ideaName, productYmlName: pyName }));
else { console.log(ok ? '✓ in sync' : `✗ ${issues.length} issue(s)`); issues.forEach((i) => console.log('  ' + i)); }
process.exit(ok ? 0 : 1);
