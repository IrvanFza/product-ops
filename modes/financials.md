# Mode: financials — Cost, Timeline & Infrastructure Estimation

Estimate **cost, timeline, and infrastructure size** from market-size → adoption
ramp → server/resource sizing. NO stack suggestions — only capacity/cost ballpark.

## When to use
- "How much will this cost to build/run?" / "How big a server?" / "Timeline?"
- After feasibility (Step 1c in auto-pipeline), before decision.

## Inputs
- The evaluation report (Block A demand, Block D monetization, Feasibility)
- `config/product.yml` (pricing_goals, constraints)
- Scan/demand data (`data/pipeline.md`, `data/scan-history.tsv`) — market-size proxies
- `competitors.yml` (pricing anchors)

## Process
### 1. Market sizing (proxies — be honest about data limits)
- **TAM/SAM/SOM** proxies from scan data: counts of competitors, app-store
  installs/reviews, subreddit sizes, search-suggest volume, Trends slope.
- Convert to addressable accounts (e.g. "# Indonesian ad agencies × % digital →
  wedge SAM"). Mark every figure's source; `(estimated)` where unsure.
- Output: design-partner target (5), Y1 reachable (SOM), ceiling (SAM).

### 2. Adoption ramp → concurrent load
- Scenarios: launch (month 3), Y1-mid, Y1-peak. % conversion of SOM → active accounts.
- Per account: # ad accounts, # campaigns/day, # agent runs/day, # creative gen/day,
  # messages/day. → daily + peak concurrent workload (agent invocations, API calls,
  generations, stored docs).
- Peak concurrent agents = the sizing driver for an agentic SaaS.

### 3. Infrastructure estimation (capacity, NOT stack)
From the workload, estimate the resource ballpark:
- **Compute (agents)**: peak concurrent agent invocations × avg duration → vCPU
  ballpark (e.g. "50 concurrent agents × ~30s → ~8–12 vCPU equiv at 1 agent/core").
- **Memory**: # concurrent agents × working-set + RAG/vector index size.
- **Storage**: docs/RAG corpus + vectors + generated assets (images/videos) +
  logs/telemetry + per-account data. Estimate GB/Y1.
- **Bandwidth**: creative assets out + ad-API calls + chat messages.
- **External cost drivers (the big ones for an agentic SaaS)**: model token cost
  (pass-through, per-token accurate), ad-platform API quota, WhatsApp BSP per-message,
  media storage/CDN. These usually dwarf compute.
- Output a table: resource | Y1-mid | Y1-peak | monthly cost ballpark (USD/IDR).

### 4. Cost structure
- **Variable (pass-through)**: model tokens, ad-API, WhatsApp, media. Scales with usage.
- **Fixed/infra**: compute, storage, bandwidth, monitoring. Scales with concurrent load.
- **People**: solo founder (0) → first hire (when?).
- Break-even: at what MRR does variable+infra < revenue? (use `pricing_goals`)

### 5. Timeline
- MVP: X weeks (gated by Feasibility gating items — sequence them).
- Launch: +Y weeks (gated by API partner reviews — the long-lead items).
- Scale: +Z weeks (post-launch iterate).
- A Gantt-ish sequence with the gating items on the critical path.

### 6. Unit-economics sensitivity
- CAC / LTV / margin under 3 adoption scenarios (slow / base / fast).
- Payback month. Flag if negative under the slow case.

## Output (append to the report as `## Financials`)
- Market sizing (TAM/SAM/SOM proxies + sources).
- Adoption ramp table.
- **Infrastructure estimation table** (vCPU / RAM / storage / bandwidth + monthly $).
- Cost structure (variable vs fixed) + break-even MRR.
- Timeline (MVP → launch → scale, gating items on critical path).
- Unit-economics sensitivity (3 scenarios).

## Rules
- NO stack names. Capacity + cost only.
- Every number cites a source or is marked `(estimated)`/`(assumed)`. No fabrication.
- Currency from `config/product.yml → pricing_goals.currency`.
- If market-size data is thin (e.g. geo=ID Trends missing), say so — it's a Feasibility/Decision input.
