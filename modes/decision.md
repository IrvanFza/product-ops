# Mode: decision — Final Verdict (GO / NO-GO / PIVOT)

Synthesize everything into a single **go/no-go/pivot** verdict with rationale,
conditions, and the next action. Records a Decision log entry.

## When to use
- "Should I build this?" / "What's the verdict?"
- Last step of auto-pipeline (Step 2c), after eval + feasibility + financials + review.

## Inputs
- The full report: A–G score, Block G legitimacy, Feasibility, Financials,
  Compliance (if run), Review/Block I (if run).
- `config/product.yml` (constraints — budget, timeline, solo).

## Process
1. **Aggregate** the signals:
   - A–G global score (demand/differentiation/feasibility/monetization/moat/red-flags)
   - Block G market legitimacy (is the market alive?)
   - Feasibility score + gating items
   - Financials: break-even reachable? timeline fits constraints? infra affordable?
   - Compliance: any blocking red flags?
   - Review/Block I: confidence delta + must-fix items
2. **Verdict** — one of:
   - **GO** — build now. (Typically: score ≥ 4.0, feasibility ≥ 3.5, financials break-even < 18mo, no compliance blocker, legitimacy High.)
   - **PIVOT** — build a narrower/different version. (Score 3.5–4.4 with a clear pivot that lifts it, OR feasibility/financials borderline with a fixable wedge.)
   - **NO-GO** — don't build. (Score < 3.5, OR a compliance blocker, OR market legitimacy Suspicious, OR financials never break even.)
3. **Rationale** — 2–4 sentences citing the deciding signals.
4. **Conditions** — what must be true / verified for the verdict to hold (the
   "unconfirmed" items from Block A/G, the Feasibility gating items, etc.).
5. **Next action** — the single highest-leverage next step (e.g. "submit Meta Ads
   API partner review", "run 5 customer interviews", "ship Meta+WhatsApp MVP loop").

## Output
- Append `## Decision: {VERDICT}` to the report with rationale + conditions + next action.
- Write a Decision log entry (TSV or markdown) so the tracker carries the verdict:

  Append to `data/products.md` notes column (or a `## Decisions` section):
  `#{NNN} {YYYY-MM-DD} {VERDICT} — {one-line rationale} → {next action}`

## Rules
- The verdict is a *recommendation*; the founder decides. Always present the
  conditions + next action, never just a bare verdict.
- A NO-GO is a valid, good outcome — it saves months. Don't rubber-stamp GO.
- If signals conflict (e.g. high score but Suspicious legitimacy), pick the more
  conservative verdict and explain the tension.
- Cite the deciding evidence; no fabrication.
