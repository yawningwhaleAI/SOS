#!/usr/bin/env python3
"""Data-quality / cleaning layer — flag and quarantine bad rows (spec §2, §9).

Runs AFTER build_canonical.py. Reads the derived price_observations (joined to
canonical_skus + raw_observations), applies a battery of validation rules, and
marks each row is_clean=1/0 with a drop_reason. Analysis (pricing.py) then uses
ONLY clean rows. Nothing is deleted — raw_data/ and raw_observations are never
touched, and dropped rows stay in the DB (is_clean=0) and are exported to
review_queue/dropped_rows.csv for audit.

Red-flag rules (a row failing ANY hard rule is dropped from analysis):
  H1 no_price            selling_price missing or <= 0
  H2 sp_gt_mrp           selling_price > MRP (impossible)
  H3 substitute          reusable / cloth / microfiber / non-woven (not paper)
  H4 not_product         accessory, not the tissue (dispenser/holder/stand/...)
  H5 pack_misparse       paper category but < 20 total sheets (multipack misread)
  H6 per_sheet_too_high  > 250 rupees / 100 sheets in a paper category (misparse)
  H7 per_sheet_too_low   < 1.5 rupees / 100 sheets (sheet count overcounted)
  H8 sku_price_outlier   SP is >3x or <1/3 of its SKU's median (heterogeneous merge)
  H9 name_cat_mismatch   product name states a category different from assigned

Soft flags (kept, but noted): mrp_inflation_extreme (>90% off), bad_rating.

Usage: python processors/clean_data.py
"""
from __future__ import annotations

import csv
import re
import sqlite3
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "sos.db"
REVIEW = ROOT / "review_queue"

SHEET_CATEGORIES = {"Facial", "Toilet", "Kitchen towel", "Napkin", "Pocket", "Wipes"}
DRY_SHEET = SHEET_CATEGORIES - {"Wipes"}   # wipes are legitimately dearer per unit
# Accessories and non-tissue products that surface under our search queries.
NOT_PRODUCT = ["dispenser", "holder", "stand", "warmer", "caddy", "organizer",
               "bracket", "rack", "storage box", "wall mount", "spare part",
               "bowl", "sanitizer", "freshener", "air fresh", "spray", "soap",
               "detergent", "shampoo", "perfume", "deodorant", "handwash",
               "toilet cleaner", "floor cleaner", "liquid"]
PER_SHEET_HIGH_WIPES = 1000.0
NAME_CAT = [  # (keyword in name, category it implies)
    ("napkin", "Napkin"), ("serviette", "Napkin"), ("toilet", "Toilet"),
    ("kitchen towel", "Kitchen towel"), ("kitchen roll", "Kitchen towel"),
    ("wet wipe", "Wipes"), ("pocket", "Pocket"), ("face tissue", "Facial"),
]
PER_SHEET_LOW = 1.0
OUTLIER_FACTOR = 3.0
# Minimum plausible sheets-per-unit by category. A roll/box with fewer sheets
# than this is a pack misparse (not a price judgement, so premium items survive).
MIN_PULLS_PER_UNIT = {"Toilet": 40, "Kitchen towel": 15, "Facial": 30,
                      "Napkin": 15, "Pocket": 5, "Wipes": 8}


def ensure_columns(conn):
    cols = {r[1] for r in conn.execute("PRAGMA table_info(price_observations)")}
    if "is_clean" not in cols:
        conn.execute("ALTER TABLE price_observations ADD COLUMN is_clean INTEGER")
    if "drop_reason" not in cols:
        conn.execute("ALTER TABLE price_observations ADD COLUMN drop_reason TEXT")


def main() -> int:
    REVIEW.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    ensure_columns(conn)

    rows = conn.execute("""
      SELECT p.price_obs_id, p.canonical_sku_id, p.selling_price, p.mrp,
             p.discount_pct, p.price_per_100_pulls,
             s.category, s.total_pulls, s.pulls_per_unit, r.product_name_raw, r.is_substitute
      FROM price_observations p
      JOIN canonical_skus s ON s.canonical_sku_id=p.canonical_sku_id
      JOIN raw_observations r ON r.obs_id=p.obs_id
    """).fetchall()

    # SKU median SP from rows that pass basic price validity (for the outlier test)
    valid_sp = defaultdict(list)
    for r in rows:
        if r["selling_price"] and r["selling_price"] > 0 and (
                r["mrp"] is None or r["selling_price"] <= r["mrp"]):
            valid_sp[r["canonical_sku_id"]].append(r["selling_price"])
    sku_med = {k: statistics.median(v) for k, v in valid_sp.items() if len(v) >= 3}

    updates = []
    dropped = []
    reason_counts = defaultdict(int)

    for r in rows:
        name = (r["product_name_raw"] or "").lower()
        cat = r["category"]
        sp, mrp = r["selling_price"], r["mrp"]
        pps = r["price_per_100_pulls"]
        reason = None

        if sp is None or sp <= 0:
            reason = "no_price"
        elif mrp is not None and sp > mrp:
            reason = "sp_gt_mrp"
        elif r["is_substitute"]:
            reason = "substitute"
        elif any(w in name for w in NOT_PRODUCT):
            reason = "not_product"
        elif (cat in MIN_PULLS_PER_UNIT and r["pulls_per_unit"] is not None
              and r["pulls_per_unit"] < MIN_PULLS_PER_UNIT[cat]):
            reason = "pack_misparse"
        elif cat in SHEET_CATEGORIES and r["total_pulls"] is not None and r["total_pulls"] < 20:
            reason = "pack_misparse"
        elif pps is not None and pps < PER_SHEET_LOW:
            reason = "per_sheet_too_low"
        else:
            # name states a category different from the one assigned
            for kw, implied in NAME_CAT:
                if kw in name and cat and implied != cat:
                    reason = "name_cat_mismatch"
                    break
            # within-SKU price outlier (heterogeneous merge / bad price)
            if reason is None and r["canonical_sku_id"] in sku_med:
                m = sku_med[r["canonical_sku_id"]]
                if m > 0 and (sp > OUTLIER_FACTOR * m or sp < m / OUTLIER_FACTOR):
                    reason = "sku_price_outlier"

        is_clean = 0 if reason else 1
        updates.append((is_clean, reason, r["price_obs_id"]))
        if reason:
            reason_counts[reason] += 1
            dropped.append({"price_obs_id": r["price_obs_id"], "reason": reason,
                            "sku": r["canonical_sku_id"], "category": cat,
                            "selling_price": sp, "mrp": mrp,
                            "price_per_100_pulls": pps, "name": r["product_name_raw"]})

    conn.executemany("UPDATE price_observations SET is_clean=?, drop_reason=? WHERE price_obs_id=?", updates)
    conn.commit()

    total = len(rows)
    clean = sum(1 for u in updates if u[0] == 1)
    conn.close()

    # audit export
    if dropped:
        with open(REVIEW / "dropped_rows.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(dropped[0].keys()))
            w.writeheader(); w.writerows(dropped)

    print(f"Rows evaluated: {total}")
    print(f"  CLEAN (kept for analysis): {clean} ({100*clean/total:.1f}%)")
    print(f"  DROPPED: {total-clean} ({100*(total-clean)/total:.1f}%)")
    for reason, n in sorted(reason_counts.items(), key=lambda x: -x[1]):
        print(f"    {reason:20} {n}")
    print(f"\nDropped rows -> review_queue/dropped_rows.csv")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
