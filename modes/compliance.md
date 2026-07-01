# Mode: compliance — Legal & Compliance Gate

Audit the legal/compliance exposure before launch. For ad/marketing/data SaaS this
is a real gate, not a nicety. Flags blockers; does not give legal advice.

## When to use
- Before launch / publishing / spending (gates auto-pipeline Step 4).
- "Is this compliant?" / "what's the legal risk?"

## Inputs
- `idea.md`, `.agents/product-marketing.md` (what the product does + data it touches)
- The Feasibility report (which external APIs/platforms)

## Process
Audit each applicable area. Cite the rule/framework, don't quote law verbatim.
1. **Platform Terms of Service** — for every external API the product uses:
   - Meta Graph API / Marketing API (Ads) ToS — automation, scraping, user-data.
   - Google Ads API ToS — developer-token rules, automated-ads policy.
   - TikTok / LinkedIn / X API ToS — automation + content rules.
   - WhatsApp Business Platform (BSP) policy — messaging windows, templates, opt-in.
   Flag any ToS that restricts the product's core automation.
2. **Data privacy (jurisdiction-specific)** —
   - Indonesia **UU PDP** (Undang-Undang Pelindungan Data Pribadi): lawful basis,
     consent, data-subject rights, DPO threshold, cross-border transfer, breach
     notification. Flag data-localization expectations.
   - If serving other markets: GDPR (EU), etc. (note applicability).
   Flag: what personal data is collected/processed, lawful basis, retention.
3. **Ad-creative & disclosure** — platform ad policies (prohibited content,
   personal-attributes targeting, political/financial ads), AI-generated content
   disclosure rules (each platform's AI-labeling policy).
4. **Consumer protection / advertising law** — Indonesia KUHPerdata/UCP rules on
   advertising claims, endorsements, testimonials.
5. **Intellectual property** — naming/trademark clearance, generated-content
   ownership, third-party asset licensing.

## Output
- A compliance checklist (area | requirement | status ✓/⚠/✗ | action | blocking?).
- **Blocking red flags** (must clear before launch) vs **non-blocking**.
- Explicit disclaimer: "Not legal advice — verify with a qualified lawyer for your jurisdiction."

## Rules
- Never give definitive legal advice — flag risks + recommend lawyer review for anything material.
- Blocking items gate launch (auto-pipeline Step 4 won't draft a launch plan until blockers clear, or flags them).
- Cite the framework/rule name (e.g. "UU PDP Art. 20 — consent") not fabricated specifics.
