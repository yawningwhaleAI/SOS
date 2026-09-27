# S.O.S. — Society of Spills · build & design law

Pre-launch Indian consumer brand. Four SKUs, nothing sold on-site yet. This is a
**brand site**, not an FMCG or SaaS page. Deployed on Vercel.

## The brand in one line
The emergency-response system for everyday domestic disasters. Witty, confident,
premium, design-led. Household essentials people want *visible* in their home.

## Non-negotiable identity
- **Colour:** Signal Orange `#F03E12` dominates. Bone `#F2EDE3`. Black `#111111`.
  Bamboo green `#3F6B4A` only as a restrained sustainability accent. Never an "eco" site.
- **Type:** Anton (condensed industrial display), Archivo (grotesque body),
  Saira Stencil One (the S.O.S. lockup, used sparingly), IBM Plex Mono (technical
  labels — a brand device grounded in the packaging, not decoration).
- **Language of the packaging IS the design system:** hazard stripes, spec panels,
  warning boxes, response-unit numbers, registration marks. Signage, not decoration.
- **Never:** rounded SaaS cards, soft drop-shadows, glassmorphism, pastels, gradients
  as decoration, generic tissue stock photography, invented certifications/stats/reviews.

## Structure (keep it lean — 5 sections, this is pre-launch)
1. **Hero** (`#top`)
2. **The Problem** (`#problem`) — the small-emergency cases + the Society story + the
   "so we built one" response. (Problem and brand-story are ONE section, not two.)
3. **Response Units** (`#response-units`) — the four products, full spec panels, detail
   modal. (Product intro + gallery are ONE section, not two.)
4. **The System** (`#system`) — interactive packaging anatomy + a compact sustainability
   band (RE: / Bamboo). Sustainability is a band, not a full section.
5. **Join** (`#join`) — consumer signup + a SEPARATE institutional-enquiry path.

Do not re-add: a standalone "Our Response" duplicate of the products, a standalone
"Society" prose section, a slogans-only "Why S.O.S." section, or a second marquee.
Run the marquee once.

## GTM facts that shape the site
- Institutions (hotels/cafés/offices) are ~35% of year-one revenue → the site MUST
  carry a distinct institutional enquiry path, not only a consumer signup.
- Core promise is radical transparency ("we print what others hide") → every product
  shows the SAME complete spec axes: Count, Ply, Sheet size, GSM. No unit ships a
  half-empty panel. GSM values are currently **indicative** industry values (flagged
  as such) until final mill certification; easy to swap in `data/products.ts`.
- Each product needs its OWN tagline and its OWN warning line. No shared copy.

## Contact
- General/consumer + institutional both route to `aryann.singh21@gmail.com`.
- Institutional is a separate, clearly-labelled enquiry (mailto with a supply subject).

## Design guardrails (from the vendored skills in .claude/skills/)
- `frontend-design` (Anthropic): avoid AI tells. The industrial/technical/numbered
  system here is a *brand choice grounded in the real packaging* — legitimate. But cut
  gratuitous chrome: don't accent single words in headlines just for colour; don't put
  a fake ordinal (01/02/03) on things that aren't a real sequence (product Response
  Units 01–04 ARE a real inventory — keep those; section eyebrows are not — no ordinals).
  One orchestrated motion moment (the hero); keep other reveals subtle.
- `high-end-visual-design` (third-party, applied SELECTIVELY): keep its spatial rhythm,
  layered structural depth, custom easing and purposeful micro-interactions; reject its
  soft/calm/rounded/low-contrast mood — it fights this brand.

## Tech
Next.js 14 App Router · TS · Tailwind · Framer Motion · next/image. Static, no env vars
required (OG base URL auto-derives from Vercel env). `npm run build` must stay green.
Product content lives in `data/products.ts`.
