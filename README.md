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

```
app/                     App Router entry, global styles, SEO metadata
components/
  navigation/            Sticky nav + mobile menu
  hero/                  Section 01 — Emergency alert / hero
  problem/               Section 02 — The problem
  story/                 Sections 03 & 04 — The Society + Our Response
  products/              Section 05 — Response Units (cards + detail modal)
  design-system/         Section 06 — Interactive packaging anatomy
  sustainability/        Section 07 — System extensions (RE: / Bamboo)
  attitude/              Section 08 — Kinetic brand statements
  join/                  Section 09 — Join the Society (email signup)
  footer/                Section 10 — Footer (back-of-pack)
  ui/                    Shared primitives (Reveal, Ticker, HazardBar, …)
data/
  products.ts            Single source of truth for the four products
lib/                     Small helpers
public/products/         Optimized product photography (WebP)
```

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
