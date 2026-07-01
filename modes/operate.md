# Mode: operate — Growth & Regular Operations

Acquisition loops, retention, analytics, experimentation. Stage 5 (post-launch).

## When to use
- "How do I grow?"
- "Set up analytics / experiments"
- "Reduce churn"
- "Optimize signup / onboarding / paywall"

## Inputs
- `.agents/product-marketing.md`, `config/product.yml`, `brand/*`,
  `data/products.md` (current status/metrics)

## Process
1. **Acquisition loops** — route to `referrals`, `free-tools`, `co-marketing`,
   `lead-magnets`. Pick 1–2 durable loops (not just paid).
2. **Conversion funnels** — route to `cro`, `signup`, `onboarding`, `paywalls`,
   `popups`. Identify the leakiest step; propose the fix.
3. **Retention** — route to `churn-prevention`, `emails`, `sms`, `community-marketing`.
   Cancellation flows, save offers, dunning, lifecycle email.
4. **Analytics** — route to `analytics` + `ab-testing`. What to measure, the
   experiment program, a first experiment to run.
5. **Cadence** — write a recurring check to `data/cadence.md` (re-evaluate
   competitors, re-run scans) and offer to schedule via the CLI's loop/schedule.

## Output
- `brand/growth-plan.md` (the ops plan — USER)
- `data/cadence.md` (re-evaluation schedule)
- Update `data/products.md` status → `Scaling` (only when loops are running)

## Rules
- Growth is a *plan* — do NOT modify live funnels, change prices, or message
  users without the founder's explicit go-ahead. STOP before live changes.
- Analytics setup is fine to draft; deploying tracking scripts needs approval.
- Cite which skill informed each recommendation.
