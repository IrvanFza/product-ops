# Mode: feasibility — Technical Feasibility Assessment

Assess whether the idea is **technically buildable** by this founder, and what's
hard. NO stack recommendations — only feasibility, risk, and gating items.

## When to use
- "Is this technically possible?" / "Can I actually build this?"
- After the A–G evaluation (Step 1b in auto-pipeline), before financials/decision.

## Inputs
- `idea.md`, `proof-points.md` (founder's existing tech/skills — Block C evidence)
- `competitors.yml` + scanned signals (what others built → proves feasibility)
- The evaluation report (`reports/{NNN}-*.md`)

## Process
1. **Component breakdown** — list the capability areas the product needs (e.g. for a marketing-automation SaaS: multi-agent orchestration, creative generation, ad-API publishing, chat/DM, lead management, RAG/knowledge, billing, multi-tenancy).
2. **Per component — make / buy / have**:
   - **HAVE**: already built by the founder (cite `proof-points.md`) → low risk.
   - **MAKE**: buildable with founder skills but not yet built → medium risk.
   - **BUY/INTEGRATE**: depends on a 3rd-party API/service → risk = that partner's gate.
3. **API/platform gates** — identify every external approval required (e.g. Meta Ads API partner review, Google Ads API developer-token review, WhatsApp BSP signup, app-store listing). Each is a sequenced, long-lead gate. Estimate lead time.
4. **Data availability** — is the corpus/data needed available? (training data, RAG documents, market data). Note where it's thin.
5. **Model capability** — which AI capabilities does it need (generation, reasoning, tool-use, vision)? Are frontier models sufficient / affordable? Any capability gap?
6. **Integration complexity & rate limits** — external API throughput, quota, cost-per-call ceilings.
7. **Team/skill fit** — solo? does the founder's skill set cover the MAKE items? (Block C evidence.)

## Output (append to the report as `## Feasibility`)
- A 1–5 feasibility score (5 = straightforward given founder's stack; 1 = blocked).
- A component table: component | have/make/buy | risk | gate/lead-time.
- **Gating items** (numbered, sequenced) — the things that must clear before MVP.
- Top 3 technical risks + mitigation.

## Rules
- NO stack suggestions (no "use Postgres/K8s/Next.js"). Only feasibility + sizing-relevant capability needs.
- "HAVE" claims must cite `proof-points.md`. No fabrication.
- Be honest: a great market the founder can't ship is a low score.
