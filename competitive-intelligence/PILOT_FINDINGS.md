# Step 3 — NCR Pilot Findings (budget-bounded)

Date: 29 Sep 2026 · Cost: **$0.43** (of $5 free tier) · 1 day

## Scope actually run

A **budget-bounded slice** of the full spec (the full 8-location × 7-day pilot
would cost ~$80–120, impossible on the free tier). What ran:

- **4 NCR localities, one per affluence tier:** Greater Kailash (premium),
  Vasant Kunj (upper-mid), Mayur Vihar Phase 1 (mid), Dwarka (new suburb).
- **3 quick-commerce platforms:** Blinkit, Zepto, Instamart (chosen actors).
- **6 core-category queries:** facial tissue, kitchen towel, toilet paper,
  paper napkins, wet wipes, pocket tissue.
- **1 day, ~11:00 IST**, ≤30 items/query.
- **1,309 listings** collected (Blinkit 229, Zepto 362, Instamart 718).

## Result 1 — Price consistency across localities (the pilot's core question)

Of products seen in ≥2 localities on a platform, the share showing the **same**
selling price everywhere:

| Platform | Products in ≥2 localities | Identical price across localities |
|---|---|---|
| Blinkit | 52 | **100%** |
| Instamart | 91 | **95%** |
| Zepto | 110 | **91%** |

**Decision rule (spec §11 Step 3): ≥90% identical → 4 locations per city is
enough for the national run.** All three platforms clear 90%.

➡️ **Conclusion: sample 4 localities per city (one per affluence tier), not 8.**
This roughly halves the national-run cost with negligible loss of price signal.

## Result 2 — Assortment by affluence tier

Distinct brands seen per tier: premium 56 · upper-mid 59 · mid 49 · new-suburb 65.
Assortment is broadly similar across tiers; only 3 brands appeared *only* in the
premium locality (Claret, Godrej Aer, Ksoak) — minor. Brand availability is not
strongly tier-gated in NCR quick-commerce.

## Result 3 — Category coverage & substitutes

All six categories returned healthy volume (facial 313 · pocket 243 · wipes 216 ·
kitchen towel 194 · toilet 192 · napkins 151). 5% of listings were flagged as
substitutes (reusable / cloth / microfiber) per §9.7 — kept but tagged, not
merged into paper SKUs.

## Caveats (be honest in the deck)

- **Single day.** Between-day and time-of-day price variance were **not** tested
  (the spec wanted 7 days). The "4 locations" conclusion covers *between-location*
  variance only. A multi-day check needs a paid Apify plan.
- **Coarse product key.** Consistency was measured on brand+name+pack-size, not
  yet on matched canonical SKUs (SKU matching is a later processor step).
- **Free-tier ceiling.** The full national baseline (Step 4) across 8 cities ×
  4 localities × all 12 categories, weekly, will exceed $5 — budget/plan decision
  required before scaling.

## Recommended next steps

1. **Step 2 verification** still outstanding (accuracy worksheet already sent).
2. Build the **normalisation + SKU-matching** processors so consistency and
   price ladders run on real canonical SKUs, not the coarse key.
3. Decide Apify budget for **Step 4** (national). With 4 localities/city the
   national weekly run is far cheaper than the original 8.
