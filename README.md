# S.O.S. — Society of Spills

**For everyday emergencies.**

A premium, production-ready brand website for **Society of Spills (S.O.S.)** — an
Indian consumer brand that treats boring household essentials like objects worth
keeping visible. Built as a cinematic scroll experience: part premium consumer
brand, part editorial product site, part emergency-response system.

Signal Orange · Bone · Black. Packaging as signage, not decoration.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** for animation (transform/opacity only, reduced-motion aware)
- `next/image` for optimized, lazy-loaded photography
- `next/font` (Anton · Archivo · Saira Stencil One · IBM Plex Mono)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

The build is fully static/brand — **no environment variables are required**.

## Project structure

Five sections, deliberately lean for a pre-launch brand:

```
app/                     App Router entry, global styles, SEO metadata
components/
  navigation/            Sticky nav + mobile menu
  hero/                  01 — Emergency alert / hero
  problem/               02 — The Problem (+ the Society story, folded in)
  products/              03 — Response Units (cards + detail modal)
  design-system/         04 — The System: interactive packaging anatomy
  sustainability/        04 — Sustainability band (RE: / Bamboo), tail of The System
  join/                  05 — Join: consumer signup + separate trade enquiry
  footer/                Footer (back-of-pack)
  ui/                    Shared primitives (Reveal, Ticker, HazardBar, …)
data/
  products.ts            Single source of truth for the four products + spec note
lib/                     Small helpers
public/products/         Optimized product photography (WebP)
.claude/skills/          Vendored design skills (frontend-design, high-end-visual-design)
CLAUDE.md                Brand + design law (read this before changing the design)
```

### Design decisions worth knowing
- **Specs are indicative.** Only Facial GSM (42) is confirmed on-pack; Pocket/Kitchen/Car
  GSM and two sheet sizes are industry-standard placeholders flagged as indicative in
  `data/products.ts`. Swap in certified figures there — nothing else changes.
- **OG image URL** auto-derives from Vercel env (`VERCEL_PROJECT_PRODUCTION_URL`), so
  social shares always point at the live domain. Override with `NEXT_PUBLIC_SITE_URL`.
- **Contact** routes to `aryann.singh21@gmail.com`; institutions have a separate
  trade-enquiry mailto.

### Changing products

All product content (names, response numbers, specs, warnings, images) lives in
[`data/products.ts`](./data/products.ts). Add, remove or edit entries there and
the cards, rail, and detail modals update automatically. Drop replacement
photography into `public/products/` using the same filenames to swap imagery
without touching layout.

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com/new), **Import** the repository.
3. Framework preset is auto-detected as **Next.js** — no configuration needed.
   - Build command: `next build`
   - Output: handled automatically
   - Environment variables: none
4. Click **Deploy**.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

## Accessibility & performance

- Semantic landmarks, keyboard-navigable, visible focus states, alt text.
- `prefers-reduced-motion` substantially reduces animation.
- Photography is compressed WebP served through `next/image` (AVIF/WebP,
  responsive sizes, lazy-loaded below the fold).
- Animations are limited to `transform` / `opacity` for smoothness on mobile.

---

_Society of Spills. Small disasters, handled._
