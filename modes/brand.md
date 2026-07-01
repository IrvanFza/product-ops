# Mode: brand — Name & Brand

Naming, positioning, voice, and visual direction. Stage 2 of the pipeline.

## When to use
- "Name this product"
- "Help me position it"
- "Draft the brand guide"
- "What's my voice?"

## Inputs
- `idea.md`, `config/product.yml`, `modes/_profile.md`
- `.agents/product-marketing.md` (create/update first if missing — see Step 4 onboarding)
- `competitors.yml` + scanned competitor landing-page screenshots (`reports/assets/`)

## Process
1. **Competitor landscape** — route to `competitor-profiling` + `customer-research` +
   `competitors` skills. Map how each competitor positions; find the whitespace.
2. **Positioning** — route to `product-marketing` skill. Write/refresh
   `.agents/product-marketing.md` (this is the shared context core every later
   skill reads). One paragraph: for whom, the key benefit, the category, the wedge.
3. **Naming** — generate 5–8 candidates. Check availability (domain via
   `providers/serp.mjs`, social handles, app-store name collisions). Score on
   memorability, spellability, trademark risk. Present for the founder's pick.
4. **Voice** — route to `copywriting` skill conventions. Draft a short voice
   guide (3 do's, 3 don'ts, 2 example sentences). Store in `brand/voice.md`.
5. **Visual direction** — palette + type direction (not full design). Store in
   `brand/palette.md`. Optional: route to `image` skill for a mood board.
6. **Brand guide PDF** — render `templates/brand-guide.html` → `output/{slug}-brand-guide.pdf`
   via `generate-pdf.mjs`.

## Output
- `.agents/product-marketing.md` (positioning context — USER, shared core)
- `brand/voice.md`, `brand/palette.md`
- `output/{slug}-brand-guide.pdf`
- Update `data/products.md` status → `Branded`

## Rules
- Naming availability claims must cite the check (domain registrar / social / app store).
- Trademark suggestions are not legal advice — flag "verify with a lawyer" for anything close.
- Voice must sound like the founder (read `modes/_profile.md`), not generic AI marketing prose.
- STOP before registering domains or reserving handles — the founder does that.
