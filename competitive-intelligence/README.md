# S.O.S. Competitive Intelligence Pipeline

A repeatable pipeline that collects publicly-visible listings for Indian
household paper products (tissues, kitchen towels, toilet rolls, napkins, wipes,
kitchen paper) from quick-commerce and e-commerce platforms, then cleans,
normalises and matches them so brands can be compared fairly.

**Apify collects. Our Python interprets. The scraper's output is never the final answer.**

Full spec and step plan: [`CLAUDE.md`](./CLAUDE.md). Work **one step at a time**.

> This pipeline lives in a subfolder of the S.O.S. website repo but is a
> standalone Python project — it shares no code with the Next.js site.

---

## Status

| Step | What | State |
|---|---|---|
| 0 | Setup — repo, configs, empty DB with schema | ✅ done (auth verified: acct `yawningwhale`) |
| 1 | Actor evaluation — winner chosen per platform, tiny scored test | ✅ done (~$0.39 spent; see `config/actors.yaml`) |
| 2 | Manual accuracy check (≥95% on MRP/SP/pack size) | 🟡 worksheet generated — **awaiting Aryan's manual verification** |
| 3 | NCR pilot + variance decision | ✅ budget slice done (1,309 rows, $0.43) → **4 localities/city is enough**. See `PILOT_FINDINGS.md` |
| 4 | National baseline (36→ ~32 locations) | ⬜ needs Apify budget decision (exceeds $5 free tier) |
| 5 | Analysis outputs (Excel + charts) | ⬜ |
| 6 | Physical teardown (GSM/sheet size, manual) | ⬜ |

### Step 1 chosen actors (verified by live test, 29 Sep 2026)

| Platform | Actor | ~cost/1k | Notable |
|---|---|---|---|
| Blinkit | `fascinating_lentil/blinkit-quick-commerce-scraper` | ~$0.45 | search rank (position) |
| Zepto | `memo23/zepto-product-scraper` | ~$0.91 | real storeId + resolved location |
| Instamart | `solidcode/swiggy-scraper` | ~$0.25 | isAd (sponsored) flag; cheapest |
| Amazon.in | `clearrun/amazon-products` | ~$8.25 | rank + sponsored + badges; no pincode |
| Flipkart | `scrapers_lat/flipkart-products-scraper` | free (test) | AI-enriched attrs; no rank |

**Step 2 for Aryan:** open `exports/Step2_Accuracy_Check_<date>.csv`, open each
row's `url` in the live app (same location, Vasant Kunj/Delhi), and mark
`mrp_ok` / `sp_ok` / `packsize_ok` = y/n. If ≥95% correct, we proceed to Step 3.

---

## Quickstart

```bash
cd competitive-intelligence

# 1. virtual env + deps
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2. secrets (never committed — .env is gitignored)
cp .env.example .env
#   then edit .env: paste APIFY_TOKEN and set SOS_SPEND_CAP_USD

# 3. build / verify the database (idempotent; no token needed)
python db/init_db.py

# 4. confirm the Apify token works (free metadata call, spends nothing)
python scrapers/check_apify_token.py
```

`python db/init_db.py` and `--check` are safe to re-run anytime — they never drop
data. The DB file (`data/sos.db`), raw payloads (`raw_data/`), exports and the
review queue are all gitignored local artifacts.

---

## Ground rules (from the spec §2 — enforced in code where possible)

- **Never fabricate.** Missing field → `NULL` + `extraction_method='not_available'`.
- **Never infer material from brand.** Only what the listing states.
- **Raw is immutable.** Every Apify response is saved untouched under `raw_data/`; cleaning reads it, never overwrites it.
- **Token safety.** `APIFY_TOKEN` lives only in `.env`; it is never printed or committed.
- **Spend cap.** Runs refuse to start above `SOS_SPEND_CAP_USD`. Must be set before Step 1.
- **Public pages only.** No logins, no CAPTCHA bypass, modest volumes. Academic / early-stage research.
- **No personal data.** Reviewer names are never stored.

---

## Layout

```
config/      queries.yaml · locations.yaml · actors.yaml · brands.yaml
scrapers/    common.py · check_apify_token.py · run_quick_commerce.py · run_ecommerce.py
processors/  parse_attributes.py · normalize_prices.py · match_skus.py · load_db.py
analysis/    pilot_variance.py · pricing.py · product_architecture.py · market_presence.py
db/          schema.sql · init_db.py
data/        sos.db (gitignored)
raw_data/    <platform>/<run_id>/*.json (gitignored)
review_queue/ exports/ logs/run_log.csv
```

Modules under `scrapers/` (the runners), `processors/` and `analysis/` are
**stubs** until their step is reached — they raise `NotImplementedError` rather
than pretend to work.
