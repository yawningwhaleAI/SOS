---
name: high-end-visual-design
description: Agency-tier visual polish — deliberate fonts, spatial rhythm, layered depth, custom-eased motion and obsessive micro-interactions that make a site feel expensive. Blocks the cheap AI defaults.
source: https://github.com/leonxlnx/taste-skill (skills/soft-skill)
note: Third-party skill. Reviewed before use — it is a static reference prompt with no scripts or network calls. Vendored here as a faithful adaptation; consult the source for the full text.
---

# High-End Visual Design — Principal UI Architect

Engineer agency-level experiences, not just pages: haptic depth, cinematic spatial
rhythm, obsessive micro-interactions, flawless fluid motion. Never repeat the same
layout/aesthetic twice — combine premium layout archetypes deliberately.

## Banned defaults (make it look cheap)
- Generic fonts: **Inter, Roboto, Open Sans, system-ui** as the display face. Choose
  a deliberate typeface with a point of view.
- Default flat drop-shadows (`rgba(0,0,0,.1)` under every card); one border-radius on
  everything regardless of hierarchy.
- Cramped vertical rhythm. Give sections real room — generous section padding
  (think `py-24`+ on desktop), and let whitespace do work.
- Linear/instant transitions. Motion uses **custom cubic-bezier easing**, never the
  browser default `ease`.
- Stock icons dropped in without weight-matching the type.

## Do instead
- **Deliberate type:** one or two families with real personality; a clear, wide type
  scale; treat headline type as an active design element.
- **Layered depth:** build depth with structure (nested frames, borders, precise
  insets, considered elevation) rather than blurry shadows.
- **Spatial rhythm:** a consistent, generous spacing scale; align to a grid; let the
  hero breathe.
- **Choreographed motion:** one orchestrated entrance moment; purposeful, custom-eased
  micro-interactions that respond to user action; respect `prefers-reduced-motion`.
- **Variance:** pick a layout archetype for the brief instead of defaulting to the
  same stacked-cards template.

## ⚠️ S.O.S. application note (read this)
This skill's default *mood* is "soft, calm, Apple/Linear-tier, rounded, low-contrast,
spring motion." **That mood is the opposite of the S.O.S. brand**, which is brutal,
high-contrast, industrial *signage* (Signal Orange + Bone + Black, sharp corners, no
glassmorphism, no soft shadows, no rounded SaaS cards). Per `frontend-design`, the
brief's own words win. So from this skill we KEEP: deliberate non-generic fonts,
generous spatial rhythm, layered structural depth, custom-eased and purposeful
micro-interactions, and the anti-sameness variance mandate. We REJECT: softness, low
contrast, rounded double-bezel cards, spring/bounce motion — anything that would sand
the edges off the brand.
