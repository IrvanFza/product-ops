# Mode: review — Red-Team / Critic Pass (Block I)

A second, adversarial persona critiques an evaluation report for bias, gaps, and
fabrication — the quality-control loop the single-pass eval lacks. Can adjust the
score down. This is the "review process" step.

## When to use
- After an evaluation report is written (Step 2b in auto-pipeline).
- "Pressure-test this evaluation" / "what am I missing?" / "is this too optimistic?"

## Inputs
- The evaluation report (`reports/{NNN}-*.md`)
- `competitors.yml`, scan data (to check for missed competitors)
- `idea.md`, `proof-points.md` (to check fabrication / over-claiming)

## Process (adopt a skeptical reviewer persona)
1. **Over-optimism check** — is the global score inflated? Which blocks read
   rosier than the evidence supports? Propose a recalibrated score (usually ≤ original).
2. **Fabrication/claim audit** — for every "evidence source" cited in blocks A–G,
   verify it's actually in the in-scope files or scan data. Flag any claim that
   isn't backed (the "reformulate, never fabricate" rule). List unverified claims.
3. **Missing competitors** — does `competitors.yml` + scan cover the real
   landscape? Name 2–3 competitors the eval missed (use scan data / a quick search).
4. **Weak-block pressure** — challenge Block C (feasibility): is "founder can build
   this" actually supported, or hand-wavy? Challenge Block F (red flags): what
   did the eval under-weight?
5. **Legitimacy skepticism** — is Block G's "High Confidence" earned, or did the
   eval trust a single source? What would make the market actually dead?
6. **Must-fix list** — concrete items the report should fix before the founder
   trusts it (e.g. "verify Indonesia demand with geo=ID", "add TikTok as competitor").

## Output (append to the report as `## I) Review & Audit`)
- Recalibrated score (if different from global) + confidence delta (e.g. "−0.3").
- Unverified-claims list (each with the source it should cite or remove).
- Missed competitors (2–3).
- Must-fix list (numbered).
- One-line reviewer verdict: "trust as-is" / "trust after fixes" / "re-run".

## Rules
- Be adversarial but specific — name the claim, not "this seems optimistic".
- Never fabricate counter-evidence; if you can't verify a miss, say "unverified".
- The recalibrated score only goes DOWN from the original (reviewer's job is to
  correct optimism, not inflate). If the original was actually conservative, say so.
- This block does NOT change the weighted A–F global; it's a separate audit (like
  Block G). The Decision mode reads both.
