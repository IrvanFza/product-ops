#!/usr/bin/env node
/**
 * openai-eval.mjs — standalone product-fit evaluator (non-interactive) via an
 * OpenAI-compatible endpoint. Lets founders run `modes/evaluate.md` scoring on
 * cheap/local models without an interactive CLI. No SDK — uses fetch.
 *
 * Usage: node openai-eval.mjs --idea "<text|idea.md path>" [--model gpt-4o-mini]
 *        [--base-url https://api.openai.com] [--out reports/NNN-idea-date.md]
 * Env: OPENAI_API_KEY
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = dirname(fileURLToPath(import.meta.url));

// tiny arg parser: --key value
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i] ?? '';
}

const ideaArg = args.idea;
const model = args.model || 'gpt-4o-mini';
const baseUrl = (args['base-url'] || 'https://api.openai.com').replace(/\/$/, '');
const out = args.out;

if (!ideaArg) {
  console.error('Usage: node openai-eval.mjs --idea "<text|idea.md>" [--model] [--base-url] [--out reports/NNN.md]');
  process.exit(1);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) { console.error('OPENAI_API_KEY env required.'); process.exit(1); }

const ideaText = existsSync(ideaArg) ? readFileSync(ideaArg, 'utf-8') : ideaArg;
const sysPrompt =
  readFileSync(join(ROOT, 'modes/_shared.md'), 'utf-8') + '\n\n' +
  readFileSync(join(ROOT, 'modes/evaluate.md'), 'utf-8');
const userPrompt =
  `Evaluate this product idea. Produce the full A–G report per modes/evaluate.md ` +
  `(URL/Score/Legitimacy/Archetype header + blocks A–F + G + H if ≥4.0). Cite evidence; no fabrication.\n\n--- IDEA ---\n${ideaText}\n--- END ---`;

(async () => {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
    process.exit(1);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, content);
    console.log(`✓ wrote ${out}`);
  } else {
    console.log(content);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
