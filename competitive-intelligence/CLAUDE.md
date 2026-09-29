# S.O.S. Competitor Intelligence Pipeline — Build Spec for Claude Code

Owner: Aryan Singh (S.O.S. — Society of Spills)
Version: v1, 29 Sep 2026

**How to use this file:** open Claude Code in this folder and move ONE STEP AT A
TIME. Say e.g. *"Read CLAUDE.md. Do Step 0 and Step 1 only, then stop and report
back."* Do not let it jump to the national run.

---

## 1. What we are building

A repeatable pipeline that collects publicly visible product listings for Indian
household paper products (tissues, kitchen towels, toilet rolls, napkins, wipes,
kitchen paper) from quick-commerce and e-commerce platforms, then cleans,
normalises and matches them so we can compare brands fairly.

Four data layers:

1. **Product intelligence** — what is being sold (ply, pulls, rolls, dimensions, GSM, material, claims).
2. **Price intelligence** — what it costs (MRP, selling price, discount, normalised unit prices).
3. **Market intelligence** — how it performs and shows up (rating, reviews, search rank, sponsored slot, stock, badges, assortment by locality).
4. **Evidence** — where every number came from (platform, URL, store/pincode, timestamp, raw value, extraction method, confidence).

**Division of labour:** Apify collects. Our Python code interprets. Never let the
scraper's output be the final answer.

---

## 2. Working rules for Claude Code

- Work one step at a time. Stop at the end of each step and report: what ran, row counts, errors, cost, and anything surprising.
- **Never fabricate or fill in data.** If a field isn't on the listing, store `NULL` and `extraction_method = 'not_available'`.
- **Never infer material from brand.** Material is only set if the title/description states it (virgin, recycled, bamboo, bagasse). Otherwise `not_stated`.
- Keep every raw JSON response untouched in `raw_data/`. Cleaning never overwrites raw.
- Store the Apify token in `.env` as `APIFY_TOKEN`. Add `.env` to `.gitignore`. Never print or commit it.
- Respect a spend cap set by Aryan (ask before Step 1 if not set). Log Apify cost per run. Stop if a run would exceed the cap.
- Public pages only. No logins, no accounts, no bypassing CAPTCHAs, modest request volumes. This is academic and early-stage market research.
- Do not store reviewer names or any personal data from reviews.

---

## 3. Tech stack

| Layer | Tool |
|---|---|
| Acquisition | Apify actors via `apify-client` (Python) |
| Orchestration | Python scripts run by Claude Code |
| Storage (pilot) | SQLite file (`data/sos.db`) — move to DuckDB/Supabase/Postgres only if this becomes ongoing |
| Cleaning / analysis | pandas |
| Outputs | Excel exports + charts (PNG); Streamlit dashboard later, optional |

---

## 4. Repo structure

```
/competitive-intelligence
  CLAUDE.md                # this spec
  README.md                # quickstart + status
  .env                     # APIFY_TOKEN (gitignored)
  .env.example
  requirements.txt
  config/
    locations.yaml         # city, locality, affluence tier, platform store IDs/pincodes
    queries.yaml           # search keywords
    actors.yaml            # chosen actor per platform + input template
    brands.yaml            # brand universe + tiers (spec §12)
  scrapers/
    common.py              # env/token/config/run-log helpers
    check_apify_token.py   # Step 0 token verification (free call)
    run_quick_commerce.py  # Blinkit, Zepto, Instamart
    run_ecommerce.py       # Amazon, Flipkart
  raw_data/<platform>/<run_id>/*.json
  processors/
    parse_attributes.py    # ply, pulls, rolls, dims, GSM, material, claims
    normalize_prices.py
    match_skus.py
    load_db.py
  analysis/
    pilot_variance.py
    pricing.py
    product_architecture.py
    market_presence.py
  db/
    schema.sql             # full schema (spec §8)
    init_db.py             # build/verify data/sos.db
  data/sos.db              # the pilot database (gitignored)
  review_queue/            # ambiguous matches / parses for human check
  exports/
  logs/run_log.csv         # run_id, platform, actor, locations, queries, rows, cost, errors
```

---

## 5. Sources

| Platform | Type | Location handling |
|---|---|---|
| Blinkit | Quick commerce | Per dark store (store ID ↔ pincode). Record store ID. |
| Zepto | Quick commerce | Locality name or pincode, geocoded by the actor. Record resolved location. |
| Swiggy Instamart | Quick commerce | Locality/pincode. Record resolved location. |
| Amazon.in | E-commerce | 1–2 pincodes (Delhi + Mumbai) |
| Flipkart | E-commerce | 1–2 pincodes (Delhi + Mumbai) |
| Later, optional | BigBasket, JioMart, brand D2C sites | — |

---

## 6. Search queries (`config/queries.yaml`)

Scrape **search result pages**, not a fixed product list, so we capture new SKUs,
rank and sponsored slots. Queries grouped by category in the config.

Cap results per (query × location) at 60 for quick commerce and 100 for
e-commerce. Only tissue-related results are kept after filtering (see §9.7).

---

## 7. Locations (`config/locations.yaml`)

Proposed localities, stratified by affluence. **Claude Code must confirm each is
serviceable on each platform, resolve it to a store ID / pincode, and log the
resolved value.** Swap any unserviceable locality for the nearest equivalent in
the same tier. 36 locations across 8 tier-1 cities; NCR weighted higher (8) as
the launch beachhead.

---

## 8. Database schema

Implemented in `db/schema.sql` (SQLite). Tables: `runs`, `raw_observations`
(8.1), `listings` (8.2), `canonical_skus` (8.3, product intelligence),
`price_observations` (8.4, with computed unit-price metrics),
`market_observations` (8.5), `evidence_log` (8.6, one row per extracted value),
`review_texts` (8.7, later; no reviewer names), `brand_tiers`.

Computed price metrics (8.4): `discount_pct = 1 − SP/MRP`,
`price_per_unit = SP/units_per_pack`, `price_per_100_pulls = SP/total_pulls×100`,
`price_per_100_ply_sheets = SP/(total_pulls×ply)×100`,
`price_per_1000_cm2` (dims only), `price_per_gram` (dims+GSM+basis only),
`mrp_inflation_flag = discount_pct > 0.50`.

---

## 9. Parsing and normalisation rules

1. **Pack arithmetic:** handle `4 x 60`, `4 rolls x 60 pulls`, `pack of 4`, `240 sheets`, `2 in 1`, `Buy 3 Get 3` (units = 6, note promo), `4s`. Resolve to units_per_pack × pulls_per_unit. Conflicting readings → `review_queue/`.
2. **Ply:** regex `(\d)\s*-?\s*ply`. If absent, NULL.
3. **Dimensions:** `(\d+(\.\d+)?)\s*[x×]\s*(\d+(\.\d+)?)\s*cm`. Convert inches/mm to cm.
4. **GSM:** `(\d+)\s*gsm`. Record gsm_basis only if the listing says per ply or total.
5. **Material:** keyword match only (virgin, 100% virgin pulp, recycled, bamboo, bagasse, sugarcane). Otherwise `not_stated`.
6. **Claims:** controlled vocabulary; map synonyms ("super absorbent" → absorbent).
7. **Filtering:** drop non-paper (cloth, reusable, non-woven, tissue-culture plants) — but keep reusable/non-woven kitchen towels flagged `is_substitute`, as competitive substitutes.

---

## 10. SKU matching (core logic)

1. **Deterministic key first:** normalised brand + category + ply + units_per_pack + pulls_per_unit. Exact → `deterministic`, confidence 0.95.
2. **Fuzzy second:** within same brand + category, token similarity ≥ 0.85 and identical pack arithmetic → confidence 0.8.
3. **LLM-assisted third:** remaining ambiguous pairs → same/different judgement with reasons, confidence ≤ 0.7, written to `review_queue/`.
4. Never merge listings with different pack arithmetic, even if titles look identical.

---

## 11. Step-by-step plan

### Step 0 — Setup ✅
Create repo, `.env`, config files, empty DB with schema. Confirm Apify token works. **Stop and report.**

### Step 1 — Actor evaluation (per platform)
Shortlist 2 actors each for Blinkit, Zepto, Instamart, Amazon.in, Flipkart. Tiny
test each: 1 location (Vasant Kunj, Delhi or nearest) × 2 queries (`kitchen
towel`, `facial tissue`) × max 20 items. Score on: MRP+SP separate (required),
pack size text (required), location control works (required for QC), store ID /
resolved location (preferred), stock/rating/reviews (preferred), rank/sponsored
(preferred), cost per 1,000 (record), success/errors/speed (record). Pick one
actor per platform. **Stop and report with a comparison table.**

### Step 2 — Manual accuracy check
Export 20 random rows per chosen actor. Aryan checks against the live app/site
(same location), marks each field. Target ≥ 95% on MRP, SP, pack size. Below →
fix parsing or switch actors.

### Step 3 — NCR pilot (1 week)
8 NCR locations × Blinkit/Zepto/Instamart × all queries. Daily 11:00 IST for 7
days, plus 19:00 IST on two days. Amazon + Flipkart: day 1 and day 7, Delhi
pincode. Decision rule (`analysis/pilot_variance.py`): if ≥ 90% of SKU-days show
the same price across NCR locations → 4 locations/city is enough; else 6, and
report which tiers differ. Report assortment differences by tier. **Stop and
report before Step 4.**

### Step 4 — National baseline
36 locations × 3 quick-commerce platforms × all queries. Weekly, same weekday,
11:00 IST, 2–3 weeks (assignment) or 6–8 weeks (pricing system). Amazon +
Flipkart weekly, Delhi + Mumbai.

### Step 5 — Analysis outputs
`exports/SOS_Competitor_Database_<date>.xlsx` with sheets: SKU_Master,
Price_Summary, Price_Ladder, Discount_Behaviour, Share_of_Search,
Assortment_by_Tier, Attribute_Architecture, Evidence. Charts (PNG). **Always use
medians plus spread, never plain means of selling price.**

### Step 6 — Physical teardown (manual)
Buy top 10–15 SKUs, measure sheet size, weigh a counted stack for GSM, photograph
packs. Enter with `extraction_method = 'manual'`.

---

## 12. Brand universe to watch

See `config/brands.yaml`. Tiers: mass organised (Origami, Premier, private
labels); new-age/premium (Beco, The Honest Home, Imvelo, Aurelia); imported
premium (Paseo, Kleenex, Selpak); value/marketplace (Wintex, Kressa, Liora,
Daffodil Plus, YellowHome, Imeco, Baiko, Tulips); reference (10 On);
substitutes (reusable / non-woven / cloth).

---

## 13. Definition of done (for the assignment)

- ≥ 150 canonical SKUs across the 6 core categories, matched across platforms.
- ≥ 95% field accuracy on MRP, SP, pack size in the manual check.
- Every number in the deck traceable to an observation ID, date and location.
- Pilot variance result documented (how many locations per city are enough, and why).
