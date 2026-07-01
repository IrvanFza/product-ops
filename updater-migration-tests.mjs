#!/usr/bin/env node
/**
 * updater-migration-tests.mjs — system/user boundary safety for update-system.mjs.
 * Parses DATA_CONTRACT.md and asserts no path is listed in BOTH the System and
 * User layers (which would let the updater clobber user data).
 * // ponytail: exact-match check only; prefix-overlap handling is the updater's job.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import assert from 'node:assert/strict';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DC = readFileSync(join(ROOT, 'DATA_CONTRACT.md'), 'utf-8');

function extractPaths(header) {
  const re = new RegExp(`## ${header}[\\s\\S]*?(?:\\n## |$)`);
  const block = (DC.match(re) || [''])[0];
  const paths = [];
  for (const line of block.split('\n')) {
    const m = line.match(/^\|\s*`([^`]+)`/);
    if (m) paths.push(m[1]);
  }
  return paths;
}

const userPaths = extractPaths('User Layer');
const sysPaths = extractPaths('System Layer');

assert(userPaths.length > 0, 'failed to parse USER paths from DATA_CONTRACT.md');
assert(sysPaths.length > 0, 'failed to parse SYSTEM paths from DATA_CONTRACT.md');

const shared = sysPaths.filter((p) => userPaths.includes(p));
assert(shared.length === 0, `SYSTEM/USER overlap — paths listed in both layers: ${shared.join(', ')}`);

console.log(`✓ boundary safe: ${sysPaths.length} system, ${userPaths.length} user paths, no exact overlap.`);
