// liveness.test.mjs — classifyLiveness contract.
// Covers HTTP codes, title-level closure, body closure phrases, the v0.2.1
// "bare 'sunset' in body (not title) must NOT close" fix, and the empty case.
import { strict as assert } from 'node:assert';
import { classifyLiveness } from './liveness-core.mjs';

// 1. HTTP 404 → closed, reason names the code.
let r = classifyLiveness({ status: 404, finalUrl: 'https://x.co/p' });
assert.equal(r.result, 'closed');
assert.match(r.reason, /404/);

// 2. HTTP 410 → closed (gone).
r = classifyLiveness({ status: 410, finalUrl: 'https://x.co/p' });
assert.equal(r.result, 'closed');

// 3. HTTP 5xx → unclear (server error is not a closure signal).
r = classifyLiveness({ status: 503 });
assert.equal(r.result, 'unclear');

// 4. 200 + real title + substantive body → active.
r = classifyLiveness({ status: 200, finalUrl: 'https://acme.com', title: 'Acme Inc', bodyText: 'Pricing. '.repeat(60) });
assert.equal(r.result, 'active');

// 5. Title "... shut down" → closed (title-level signal is reliable).
r = classifyLiveness({ status: 200, title: 'Acme has shut down', bodyText: 'x'.repeat(300) });
assert.equal(r.result, 'closed');

// 6. Bare "sunset" in BODY (not title) must NOT close — the v0.2.1 fix:
//    marketing copy says "sunset" without the product being dead.
r = classifyLiveness({ status: 200, title: 'Acme Inc', bodyText: 'sunset' });
assert.notEqual(r.result, 'closed');

// 7. Empty input → unclear.
r = classifyLiveness({});
assert.equal(r.result, 'unclear');

// 8. Strong multi-word body closure phrase → closed.
r = classifyLiveness({ status: 200, title: 'Acme Inc', bodyText: 'The service has been discontinued. ' + 'z'.repeat(250) });
assert.equal(r.result, 'closed');

console.log('✓ liveness.test.mjs');
