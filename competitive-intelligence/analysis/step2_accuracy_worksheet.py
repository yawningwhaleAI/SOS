#!/usr/bin/env python3
"""Step 2 — build the manual accuracy-check worksheet (spec §11 Step 2).

Samples up to N rows per platform from the Step 1 evaluation datasets saved in
raw_data/<platform>/EVAL_*/items.json, maps each actor's fields to a common
layout, and writes a CSV with the scraped MRP / selling price / pack size next
to blank check columns. Aryan opens each `url` in the live app (same location)
and marks mrp_ok / sp_ok / packsize_ok = y/n. Target >= 95% correct on MRP, SP
and pack size before scaling up (Step 3).

Never fabricates: a field the actor did not return is left blank.

Usage:
    python analysis/step2_accuracy_worksheet.py [--per-platform 20]
"""
from __future__ import annotations

import argparse
import csv
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw_data"
EXPORTS = ROOT / "exports"

# Map each chosen actor's field names -> our common columns.
FIELDMAP = {
    "blinkit":   {"name": "title", "brand": "brand", "mrp": "mrp", "sp": "price",
                  "discount": "discountPercent", "packsize": "packSize", "url": "productUrl"},
    "zepto":     {"name": "name", "brand": "brand", "mrp": "mrp", "sp": "sellingPrice",
                  "discount": "discountPercent", "packsize": "packSize", "url": "productUrl"},
    "instamart": {"name": "name", "brand": "brand", "mrp": "mrp", "sp": "price",
                  "discount": "discount", "packsize": "quantity", "url": "productUrl"},
    "amazon":    {"name": "title", "brand": "brand", "mrp": "listPrice", "sp": "price",
                  "discount": "discountPercent", "packsize": None, "url": "url"},
    "flipkart":  {"name": "title", "brand": "brand", "mrp": "mrp", "sp": "currentPrice",
                  "discount": "discountPercentage", "packsize": "subtitle", "url": "url"},
}

OUT_COLS = [
    "platform", "name", "brand", "mrp_scraped", "sp_scraped", "discount_scraped",
    "packsize_scraped", "url",
    # blank columns for the human check:
    "mrp_ok", "sp_ok", "packsize_ok", "notes",
]


def load_eval_items(platform: str) -> list[dict]:
    items: list[dict] = []
    for f in sorted((RAW / platform).glob("EVAL_*/items.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        items.extend(r for r in data if isinstance(r, dict) and r.get(FIELDMAP[platform]["name"]))
    return items


def build(per_platform: int) -> Path:
    EXPORTS.mkdir(parents=True, exist_ok=True)
    out = EXPORTS / f"Step2_Accuracy_Check_{date.today().isoformat()}.csv"
    rows: list[dict] = []
    for platform, fmap in FIELDMAP.items():
        items = load_eval_items(platform)
        for r in items[:per_platform]:
            pack = r.get(fmap["packsize"]) if fmap["packsize"] else None
            rows.append({
                "platform": platform,
                "name": r.get(fmap["name"]),
                "brand": r.get(fmap["brand"]),
                "mrp_scraped": r.get(fmap["mrp"]),
                "sp_scraped": r.get(fmap["sp"]),
                "discount_scraped": r.get(fmap["discount"]),
                "packsize_scraped": pack,
                "url": r.get(fmap["url"]),
                "mrp_ok": "", "sp_ok": "", "packsize_ok": "", "notes": "",
            })
    with open(out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=OUT_COLS)
        w.writeheader()
        w.writerows(rows)
    # small summary
    from collections import Counter
    c = Counter(r["platform"] for r in rows)
    print(f"Wrote {len(rows)} rows -> {out}")
    for p in FIELDMAP:
        print(f"  {p}: {c.get(p,0)} rows")
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-platform", type=int, default=20)
    args = ap.parse_args()
    build(args.per_platform)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
