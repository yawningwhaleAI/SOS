#!/usr/bin/env python3
"""Step 3 pilot analysis — does price / assortment vary by NCR locality & tier?

Reads raw_observations (stdlib sqlite only — no pandas dependency) and reports:
  1. Price consistency across localities, per platform: of products seen in >=2
     localities, what share show the SAME selling price everywhere (the modal
     price). High share => few locations per city are enough (spec §11 Step 3).
  2. Assortment by affluence tier: brand presence per tier (which brands show up
     only in premium localities).
  3. Category / query coverage: how many listings per query.

One-day pilot: between-day / time-of-day variance needs multi-day data and is
reported as "n/a (single day)".

Usage: python analysis/pilot_variance.py
"""
from __future__ import annotations

import re
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "sos.db"


def norm(s: str | None) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def product_key(row) -> str:
    """A coarse product identity for the pilot: brand + name + pack size."""
    return f"{norm(row['brand_raw'])}|{norm(row['product_name_raw'])}|{norm(row['pack_size_raw'])}"


def main() -> int:
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT platform, locality, affluence_tier, brand_raw, product_name_raw, "
        "pack_size_raw, price_raw, query, is_substitute FROM raw_observations"
    ).fetchall()
    conn.close()

    if not rows:
        print("No observations yet — run the scraper first.")
        return 0

    print(f"Total listings: {len(rows)}")
    by_plat = Counter(r["platform"] for r in rows)
    print("By platform:", dict(by_plat))
    locs = sorted({r["locality"] for r in rows})
    print(f"Localities ({len(locs)}): {locs}\n")

    # 1. Price consistency across localities, per platform
    print("=== 1. PRICE CONSISTENCY ACROSS LOCALITIES (per platform) ===")
    for plat in sorted(by_plat):
        prices = defaultdict(dict)  # product_key -> {locality: price}
        for r in rows:
            if r["platform"] != plat or r["price_raw"] in (None, ""):
                continue
            try:
                p = float(r["price_raw"])
            except (TypeError, ValueError):
                continue
            prices[product_key(r)][r["locality"]] = p
        multi = {k: v for k, v in prices.items() if len(v) >= 2}
        if not multi:
            print(f"  {plat}: no product seen in >=2 localities yet.")
            continue
        same = sum(1 for v in multi.values() if len(set(v.values())) == 1)
        pct = 100 * same / len(multi)
        print(f"  {plat}: {len(multi)} products in >=2 localities | "
              f"{same} ({pct:.0f}%) identical price across localities")

    # 2. Assortment by tier
    print("\n=== 2. ASSORTMENT BY AFFLUENCE TIER (distinct brands) ===")
    tier_brands = defaultdict(set)
    for r in rows:
        if r["brand_raw"]:
            tier_brands[r["affluence_tier"]].add(norm(r["brand_raw"]))
    all_tiers = ["premium", "upper_mid", "mid", "new_suburb"]
    for t in all_tiers:
        bs = tier_brands.get(t, set())
        print(f"  {t:11}: {len(bs)} brands")
    # brands appearing ONLY in premium
    premium_only = tier_brands.get("premium", set()) - set().union(
        *[tier_brands.get(t, set()) for t in all_tiers if t != "premium"] or [set()])
    if premium_only:
        print(f"  brands seen ONLY in premium: {sorted(premium_only)[:15]}")

    # 3. Category / query coverage
    print("\n=== 3. QUERY COVERAGE (listings per query) ===")
    q = Counter(norm(r["query"]) for r in rows if r["query"])
    for query, n in q.most_common():
        print(f"  {query:20}: {n}")

    subs = sum(1 for r in rows if r["is_substitute"])
    print(f"\nSubstitutes flagged (reusable/cloth/microfiber): {subs} "
          f"({100*subs/len(rows):.0f}% of listings)")
    print("\nBetween-day / time-of-day variance: n/a (single-day pilot).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
