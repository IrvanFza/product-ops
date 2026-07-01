# Mode: validate — Customer Validation Loop

Turn Block A's "unconfirmed" demand into verified evidence by collecting real
customer voice — interviews, surveys, or proxy signals from social data.

## When to use
- "Validate demand before I build" / "do real customers want this?"
- Optional Step 1a in auto-pipeline (before/alongside eval) — opt-in because it
  needs real customer access or a social-data proxy.

## Inputs
- `idea.md`, `config/product.yml` (ICP)
- Scan data (`providers/reddit.mjs`, `hackernews.mjs`, + future tiktok/instagram)
- Customer responses (pasted in chat, or a file at `data/interviews/{slug}.md`)

## Process
1. **Draft the instrument** — an ICP-targeted interview/survey script (5–8
   questions): the problem, current workaround, willingness-to-pay, switching
   cost, deal-breakers. Use verbatim customer language where possible.
2. **Proxy path (no interviews yet)** — mine real social data for demand/sentiment
   signals: Reddit/HN complaint threads, TikTok/IG hashtag volume, app-store
   reviews of competitors. Synthesize: top 5 pains, demand intensity, ICP fit.
   Mark as `(proxy — not direct customer voice)`.
3. **Direct path** — ingest pasted interview notes or `data/interviews/*.md`.
   Extract: pains, jobs-to-be-done, willingness-to-pay signals, ICP confirmation,
   objections. Quote verbatim.
4. **Synthesize** — does the evidence confirm or contradict Block A? Update the
   demand score with real evidence; convert "unconfirmed" items to verified (or
   refuted). Note sample size + source bias.

## Output
- A validation brief (`reports/{NNN}-{slug}-validate-{date}.md` or appended to the
  main report as `## Validation`): instrument, evidence, top pains, WTP signals,
  ICP confirmation, sample size + bias.
- Update Block A evidence in the main report (mark verified items).

## Rules
- Verbatim customer language > polished summaries.
- Mark proxy vs direct evidence honestly. Sample size matters (n=1 is a signal, not proof).
- No fabrication of testimonials. If no evidence, say "unvalidated".
- Respect privacy — no PII in reports; anonymize interviewees.
