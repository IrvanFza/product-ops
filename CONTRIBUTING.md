# Contributing to Product-Ops

Thanks for your interest in contributing! Product-Ops is an AI-powered,
local-first, CLI-agnostic product-creation pipeline — forked from
[`santifer/career-ops`](https://github.com/santifer/career-ops). You can build
with any agent-skill-standard CLI (Claude Code, OpenCode, Codex, Qwen, …).

## How we work — issue first

We work **issue-first** to avoid wasted effort:

1. **Issue.** Open an [issue](https://github.com/IrvanFza/product-ops/issues)
   to discuss a new feature, mode, or architecture change *before* writing code.
   When in doubt, start in
   [Discussions](https://github.com/IrvanFza/product-ops/discussions) instead.
2. **Discussion.** Align on direction and scope with a maintainer.
3. **PR with linked issue.** Fork, branch (`git checkout -b feature/my-feature`),
   and open a Pull Request that references the issue (`Closes #123`).
4. **CI passes.** `node test-all.mjs` must be green (see [Testing](#testing)).
5. **Review.** A maintainer reviews; we read every PR and don't merge AI-slop.
6. **Merge.**

Going straight to a PR — no issue needed — is welcome for **bug fixes, docs,
new zero-token scanner providers, and translations**. Don't let process slow
these down. A large feature PR that skipped the issue step may be asked to
start one if it doesn't fit the architecture.

## Testing

```bash
node test-all.mjs      # run the full suite (no framework — node:assert/strict)
```

Tests live as `*.test.mjs` at the repo root and cover liveness classification,
the tracker parser, the TSV→`data/products.md` merge, and status
canonicalization. Each test is self-running: `node <file>.test.mjs` exits `0`
on pass, `1` on fail. CI runs the whole suite on every push and pull request
to `main`.

Before submitting, also run `node --check` on any `.mjs` you touched.

## What makes a good PR

- Fixes a bug listed in Issues, or addresses a discussed feature.
- Clear description of what changed and why.
- Follows the project philosophy: **simple, minimal, local-first, quality over
  quantity.** Zero-token scripts (`*.mjs`) do the work; `modes/*.md` hold the
  logic the AI reads.
- Doesn't commit personal data (`idea.md`, `data/products.md` with real
  competitors, `reports/`).

## Scope

The product-ops core is **local-first and human-in-the-loop** by design. Don't
add centralized or hosted infrastructure, auto-launch, or anything that sends a
user's data to a third-party service. Reading *public* market-research APIs
locally is welcome (that's how the built-in `providers/` work); routing
personal data through someone else's service is not.

## What we do NOT accept

- PRs that scrape platforms prohibiting automated access.
- PRs that enable auto-launching or auto-spending without human review.
- PRs that add external API dependencies without prior discussion in an issue.
- PRs that add centralized or hosted infrastructure to the core.
- PRs containing personal data. Use fictional data in examples instead.

## Need help?

- [GitHub Discussions](https://github.com/IrvanFza/product-ops/discussions) —
  fastest way to ask "how do I…?" and connect with other contributors.
- [Open an issue](https://github.com/IrvanFza/product-ops/issues) for bugs.
- Read [`AGENTS.md`](AGENTS.md) and [`DATA_CONTRACT.md`](DATA_CONTRACT.md) for
  the architecture and the system/user file boundary.

Contributions are governed by the MIT [LICENSE](LICENSE).
