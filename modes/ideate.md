# Mode: ideate — Ideation

Generate, refine, or validate a product idea. The first stage of the pipeline.

## When to use
- "I want to build something but don't know what"
- "Here's a vague problem — help me shape an idea"
- "Validate this idea before I commit"
- "Give me ideas in {space}"

## Inputs
- `config/product.yml` (ICP, constraints, founder skills implied by `proof-points.md`)
- `idea.md` if refining an existing idea
- `.agents/product-marketing.md` if present

## Process
1. **Read the founder's unfair advantage** from `proof-points.md` + `idea.md`.
   Ideation grounded in what *this* founder can ship and distribute beats generic ideas.
2. **Pain-first**: route to `customer-research` + `marketing-psychology` skills.
   Mine real complaints (Reddit/HN via `providers/`) — high-complaint + rising-trend spaces win.
3. **Generate 3–5 ideas**, each as: one-liner · ICP · JTBD · why-now · why-you.
   Apply `marketing-ideas` for structure and `free-tools` to spot a free-tool wedge.
4. **Quick screen**: for each, a one-line A–D gut check (demand / differentiation /
   feasibility / monetization) — not a full `evaluate`. Flag which deserve a full eval.
5. **Ask the founder** which to pursue. (Human-in-the-loop — don't auto-commit.)

## Output
Append candidates to `data/pipeline.md` as `- [ ] {one-liner} — {url-or-source}`.
On selection, create/seed `idea.md` from `modes/idea.template.md`.

## Rules
- No fabrication: demand claims cite a source (Trends/Reddit/HN/GitHub). Unknown → say so.
- Respect constraints in `config/product.yml` (budget, timeline, solo).
- Don't auto-evaluate fully here — that's `evaluate`. This stage filters.
