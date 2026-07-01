#!/usr/bin/env node
/**
 * build-dashboard.mjs — build the Go dashboard binary.
 * Run: node build-dashboard.mjs   (→ dashboard/product-ops-dashboard)
 */
import { execSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
try {
  execSync('go build -o product-ops-dashboard .', { cwd: `${ROOT}/dashboard`, stdio: 'inherit' });
  console.log('✓ dashboard/product-ops-dashboard');
} catch {
  console.warn('⚠ go not installed or build failed. Install Go, or run directly:\n  cd dashboard && go run . --path ..');
}
