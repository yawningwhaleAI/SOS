#!/usr/bin/env python3
"""Step 5 (preview) — price summary + ladders from the derived tables.

Sheets:
  - SKU_Master        : canonical SKUs and parsed attributes
  - Price_Summary     : per SKU medians + WHERE it was seen (localities/platforms)
  - Price_Ladder      : per category, ranked by ₹/100 ply-sheets (fair, ply+pack
                        normalised) with a fallback to ₹/100 pulls
  - Ladder_by_Ply_Pack: per category -> ply -> pack size (units_per_pack),
                        ranked WITHIN each like-for-like segment

Always medians + spread, never means (spec §5). Requires openpyxl.

Usage: python analysis/pricing.py
"""
from __future__ import annotations

import json
import sqlite3
import statistics
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "data" / "sos.db"
EXPORTS = ROOT / "exports"


def med(v):
    v = [x for x in v if x is not None]
    return round(statistics.median(v), 2) if v else None


def bundle_label(units) -> str:
    if not units or units == 1:
        return "single"
    return f"pack of {units}"


# Paper-sheet categories almost never have <20 sheets total; a smaller
# total_pulls is almost always a misparsed multipack (roll count read as sheets).
SHEET_CATEGORIES = {"Facial", "Toilet", "Kitchen towel", "Napkin", "Pocket", "Wipes"}


def plausible(s: dict) -> bool:
    tp = s.get("total_pulls")
    if s.get("category") in SHEET_CATEGORIES and tp is not None and tp < 20:
        return False
    return True


def main() -> int:
    from openpyxl import Workbook
    from openpyxl.styles import Font
    from openpyxl.utils import get_column_letter

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    skus = {r["canonical_sku_id"]: dict(r) for r in conn.execute("SELECT * FROM canonical_skus")}
    price = [dict(r) for r in conn.execute("SELECT * FROM price_observations")]
    market = [dict(r) for r in conn.execute("SELECT * FROM market_observations")]
    conn.close()
    if not price:
        print("No price_observations. Run build_canonical.py first.")
        return 0

    agg = defaultdict(lambda: defaultdict(list))
    locs = defaultdict(set)
    plats = defaultdict(set)
    for p in price:
        k = p["canonical_sku_id"]
        for f in ("selling_price", "discount_pct", "price_per_100_pulls", "price_per_100_ply_sheets"):
            if p[f] is not None:
                agg[k][f].append(p[f])
        if p["locality"]:
            locs[k].add(p["locality"])
        plats[k].add(p["platform"])

    # ratings / reviews per SKU (from market_observations)
    ratings = defaultdict(list)
    reviews = defaultdict(list)
    for m in market:
        if m["rating"] is not None:
            ratings[m["canonical_sku_id"]].append(m["rating"])
        if m["review_count"] is not None:
            reviews[m["canonical_sku_id"]].append(m["review_count"])

    def rat(k):
        return med(ratings.get(k, []))

    def rev(k):
        v = reviews.get(k, [])
        return int(max(v)) if v else None  # cumulative -> take the max seen

    EXPORTS.mkdir(parents=True, exist_ok=True)
    wb = Workbook()

    def build_readme(wb):
        ws = wb.create_sheet("READ_ME", 0)
        bold = Font(bold=True)
        title = Font(bold=True, size=13)
        def line(text="", style=None):
            ws.append([text]);
            if style: ws.cell(row=ws.max_row, column=1).font = style
        line("S.O.S. Competitor Price Ladders — data dictionary", title)
        line()
        line("SCOPE OF THIS DATA", bold)
        for t in [
            "Region: Delhi NCR only. 4 localities, one per affluence tier:",
            "   Greater Kailash (premium), Vasant Kunj (upper-mid),",
            "   Mayur Vihar Phase 1 (mid), Dwarka (new suburb).",
            "Platforms: Blinkit, Zepto, Instamart (quick-commerce). No Amazon/Flipkart yet.",
            "When: single snapshot, 29 Sep 2026, ~11am IST (not multi-day).",
            "Size: 1,309 listings -> 592 canonical SKUs, 6 categories, 89 brands.",
            "NOT manually verified (Step 2 skipped): a small % of pack/price parses may be wrong.",
            "~59 SKUs with misparsed multipacks are excluded from ladders (kept in Price_Summary).",
            "All figures are MEDIANS across sightings, never averages.",
            "Prefer 'per_100_pulls' (1,163 rows) over 'per_100_ply_sheets' (479 rows, needs ply).",
        ]:
            line("  " + t)
        line()
        defs = [
            ("SKU_Master — one row per unique product (canonical SKU)", [
                ("canonical_sku_id", "unique product id: brand_category_Nply_UxP"),
                ("brand / category", "brand name; Facial/Toilet/Kitchen towel/Napkin/Wipes/Pocket"),
                ("ply", "number of layers (blank if not stated on listing)"),
                ("units_per_pack", "rolls/boxes/packs in the pack (e.g. 6)"),
                ("pulls_per_unit", "sheets per roll/box (e.g. 100)"),
                ("total_pulls", "units_per_pack x pulls_per_unit = total sheets"),
                ("material", "virgin/bamboo/recycled/bagasse or not_stated (never guessed from brand)"),
                ("claims", "parsed marketing claims: soft, eco, absorbent, strong, etc."),
                ("attr_confidence", "high if pack math resolved (total_pulls known), else low"),
            ]),
            ("Price_Summary — one row per SKU: price + where seen + ratings", [
                ("n_obs", "how many times this SKU was seen (localities x platforms x queries)"),
                ("n_localities", "how many of the 4 NCR localities it appeared in"),
                ("n_platforms", "how many of the 3 apps carry it"),
                ("platforms", "which apps (blinkit/zepto/instamart)"),
                ("median_SP", "median selling price (the REAL price paid), in Rupees"),
                ("min_SP / max_SP", "cheapest / priciest sighting -> price volatility"),
                ("median_discount_pct", "typical discount off MRP (0.34 = 34% off)"),
                ("median_per_100_pulls", "price for 100 sheets = SP / total_pulls x 100 (KEY compare metric)"),
                ("median_per_100_ply_sheets", "ply-adjusted: SP / (total_pulls x ply) x 100 (fairest, needs ply)"),
                ("median_rating", "median star rating (out of 5)"),
                ("review_count", "max review/rating count seen (popularity proxy)"),
            ]),
            ("Price_Ladder — per category, ranked cheapest->priciest per sheet", [
                ("rank", "1 = cheapest per 100 ply-sheets (falls back to per 100 pulls)"),
                ("ply / units_per_pack / total_pulls", "format of the SKU"),
                ("median_per_100_ply_sheets / _pulls", "the ladder metrics (see above)"),
                ("median_rating / review_count", "quality + popularity"),
                ("n_obs", "sightings -> confidence (>=4 solid, 2 = directional)"),
            ]),
            ("Ladder_by_Ply_Pack — like-for-like: category -> ply -> pack size", [
                ("category / ply / pack", "the segment (e.g. Toilet, 3ply, pack of 6)"),
                ("rank_in_segment", "1 = cheapest WITHIN that exact ply+pack segment"),
                ("median_SP", "median selling price of the SKU"),
                ("median_per_100_pulls / _ply_sheets", "per-sheet price for ranking"),
                ("median_rating / review_count / n_obs", "quality, popularity, confidence"),
            ]),
        ]
        for header, cols in defs:
            line(header, bold)
            for name, desc in cols:
                ws.append(["", name, desc])
            line()
        ws.column_dimensions["A"].width = 4
        ws.column_dimensions["B"].width = 28
        ws.column_dimensions["C"].width = 90
        return ws

    def style_header(ws):
        for c in ws[1]:
            c.font = Font(bold=True)
        for i, _ in enumerate(ws[1], 1):
            ws.column_dimensions[get_column_letter(i)].width = 18

    # --- SKU_Master ---
    ws = wb.active
    ws.title = "SKU_Master"
    ws.append(["canonical_sku_id", "brand", "category", "ply", "units_per_pack",
               "pulls_per_unit", "total_pulls", "material", "claims", "attr_confidence"])
    for sid, s in sorted(skus.items(), key=lambda kv: (kv[1]["category"] or "", kv[1]["brand"] or "")):
        ws.append([sid, s["brand"], s["category"], s["ply"], s["units_per_pack"],
                   s["pulls_per_unit"], s["total_pulls"], s["material"],
                   ", ".join(json.loads(s["claims"] or "[]")), s["attr_confidence"]])
    style_header(ws)

    # --- Price_Summary (with WHERE it was seen) ---
    ws2 = wb.create_sheet("Price_Summary")
    ws2.append(["canonical_sku_id", "brand", "category", "ply", "units_per_pack",
                "n_obs", "n_localities", "n_platforms", "platforms",
                "median_SP", "min_SP", "max_SP", "median_discount_pct",
                "median_per_100_pulls", "median_per_100_ply_sheets",
                "median_rating", "review_count"])
    for k, a in agg.items():
        s = skus.get(k, {})
        sp = a["selling_price"]
        ws2.append([k, s.get("brand"), s.get("category"), s.get("ply"), s.get("units_per_pack"),
                    len(sp), len(locs[k]), len(plats[k]), ", ".join(sorted(plats[k])),
                    med(sp), min(sp) if sp else None, max(sp) if sp else None,
                    med(a["discount_pct"]), med(a["price_per_100_pulls"]),
                    med(a["price_per_100_ply_sheets"]), rat(k), rev(k)])
    style_header(ws2)

    # --- Price_Ladder (per category, fair per-sheet) ---
    ws3 = wb.create_sheet("Price_Ladder")
    ws3.append(["category", "rank", "brand", "canonical_sku_id", "ply", "units_per_pack",
                "total_pulls", "median_per_100_ply_sheets", "median_per_100_pulls",
                "median_rating", "review_count", "n_obs"])
    by_cat = defaultdict(list)
    excluded = 0
    for k, a in agg.items():
        s = skus.get(k, {})
        key_metric = med(a["price_per_100_ply_sheets"]) or med(a["price_per_100_pulls"])
        if key_metric is None:
            continue
        if not plausible(s):
            excluded += 1
            continue
        by_cat[s.get("category")].append(
            (key_metric, s.get("brand"), k, s.get("ply"), s.get("units_per_pack"),
             s.get("total_pulls"), med(a["price_per_100_ply_sheets"]),
             med(a["price_per_100_pulls"]), rat(k), rev(k), len(a["selling_price"])))
    for cat in sorted(by_cat, key=lambda x: (x or "")):
        for rank, row in enumerate(sorted(by_cat[cat], key=lambda r: r[0]), 1):
            ws3.append([cat, rank, row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]])
    style_header(ws3)

    # --- Ladder_by_Ply_Pack (like-for-like segments) ---
    ws4 = wb.create_sheet("Ladder_by_Ply_Pack")
    ws4.append(["category", "ply", "pack", "rank_in_segment", "brand", "canonical_sku_id",
                "total_pulls", "median_SP", "median_per_100_pulls", "median_per_100_ply_sheets",
                "median_rating", "review_count", "n_obs"])
    seg = defaultdict(list)
    for k, a in agg.items():
        s = skus.get(k, {})
        m = med(a["price_per_100_pulls"])
        if m is None or not plausible(s):
            continue
        plabel = f"{s.get('ply')}ply" if s.get("ply") else "ply?"
        segkey = (s.get("category"), plabel, bundle_label(s.get("units_per_pack")))
        seg[segkey].append((m, s.get("brand"), k, s.get("total_pulls"), med(a["selling_price"]),
                            med(a["price_per_100_pulls"]), med(a["price_per_100_ply_sheets"]),
                            rat(k), rev(k), len(a["selling_price"])))
    # sort segments: category, ply (numeric where possible), pack size
    def segsort(key):
        cat, ply, pack = key
        pn = int(ply[0]) if ply[0].isdigit() else 99
        un = int(pack.split()[-1]) if pack != "single" else 1
        return (cat or "", pn, un)
    for segkey in sorted(seg, key=segsort):
        cat, ply, pack = segkey
        for rank, row in enumerate(sorted(seg[segkey], key=lambda r: r[0]), 1):
            ws4.append([cat, ply, pack, rank, row[1], row[2], row[3], row[4],
                        row[5], row[6], row[7], row[8], row[9]])
    style_header(ws4)

    build_readme(wb)  # inserted as the first sheet
    out = EXPORTS / f"SOS_Price_Ladders_{date.today().isoformat()}.xlsx"
    wb.save(out)
    print(f"Wrote {out}")
    print(f"  SKUs: {len(skus)} · price rows: {len(price)} · categories: {len(by_cat)} · segments: {len(seg)}")
    print(f"  ladder rows excluded as implausible pack parse (<20 sheets): {excluded}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
