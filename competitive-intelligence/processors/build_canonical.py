#!/usr/bin/env python3
"""Build the derived tables from raw_observations (spec §8.3–8.6, §9, §10).

Rebuilds canonical_skus, listings, price_observations and evidence_log from the
immutable raw_observations. Safe to re-run: derived tables are cleared and
rebuilt; raw_data/ and raw_observations are never touched.

Pipeline per observation:
  parse_attributes -> deterministic/fuzzy match -> canonical SKU
  -> normalize_prices -> price_observations
  -> evidence_log rows for the key extracted fields

Usage: python processors/build_canonical.py
"""
from __future__ import annotations

import json
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import match_skus as ms  # noqa: E402
from normalize_prices import compute_metrics  # noqa: E402
from parse_attributes import parse_all  # noqa: E402

DB = ROOT / "data" / "sos.db"
REVIEW = ROOT / "review_queue"

DERIVED = ["evidence_log", "market_observations", "price_observations", "listings", "canonical_skus"]


def clear_derived(conn):
    for t in DERIVED:
        conn.execute(f"DELETE FROM {t}")


def upsert_canonical(conn, sku_id, brand, attrs, confidence):
    exists = conn.execute(
        "SELECT 1 FROM canonical_skus WHERE canonical_sku_id=?", (sku_id,)
    ).fetchone()
    if exists:
        return
    conn.execute(
        "INSERT INTO canonical_skus(canonical_sku_id,brand,category,sub_category,ply,"
        "pulls_per_unit,sheets_per_unit,units_per_pack,total_pulls,sheet_length_cm,"
        "sheet_width_cm,gsm,gsm_basis,material,claims,attr_confidence) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (sku_id, brand, attrs.get("category"), None, attrs.get("ply"),
         attrs.get("pulls_per_unit"), attrs.get("pulls_per_unit"),
         attrs.get("units_per_pack"), attrs.get("total_pulls"),
         attrs.get("sheet_length_cm"), attrs.get("sheet_width_cm"),
         attrs.get("gsm"), attrs.get("gsm_basis"), attrs.get("material"),
         json.dumps(attrs.get("claims") or []), confidence),
    )


def link_listing(conn, platform, url, sku_id, method, conf):
    if not url:
        return
    conn.execute(
        "INSERT OR IGNORE INTO listings(platform,platform_product_id,url,"
        "canonical_sku_id,match_method,match_confidence) VALUES(?,?,?,?,?,?)",
        (platform, url, url, sku_id, method, conf),
    )
    conn.execute(
        "UPDATE listings SET canonical_sku_id=?, match_method=?, match_confidence=? "
        "WHERE platform=? AND platform_product_id=?",
        (sku_id, method, conf, platform, url),
    )


def add_price_obs(conn, obs, sku_id, metrics):
    conn.execute(
        "INSERT INTO price_observations(obs_id,canonical_sku_id,platform,city,locality,"
        "affluence_tier,scraped_at,mrp,selling_price,discount_pct,in_stock,price_per_unit,"
        "price_per_100_pulls,price_per_100_ply_sheets,price_per_1000_cm2,price_per_gram,"
        "mrp_inflation_flag) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (obs["obs_id"], sku_id, obs["platform"], obs["city"], obs["locality"],
         obs["affluence_tier"], obs["scraped_at"], metrics["mrp"], metrics["selling_price"],
         metrics["discount_pct"], obs["stock_status_raw"], metrics["price_per_unit"],
         metrics["price_per_100_pulls"], metrics["price_per_100_ply_sheets"],
         metrics["price_per_1000_cm2"], metrics["price_per_gram"], metrics["mrp_inflation_flag"]),
    )


def _num(x):
    if x is None:
        return None
    try:
        return float(str(x).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def add_market_obs(conn, obs, sku_id):
    conn.execute(
        "INSERT INTO market_observations(obs_id,canonical_sku_id,platform,locality,scraped_at,"
        "search_query,search_rank,is_sponsored,rating,review_count,badge,in_stock) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (obs["obs_id"], sku_id, obs["platform"], obs["locality"], obs["scraped_at"],
         obs["query"], obs["search_rank"], obs["is_sponsored"],
         _num(obs["rating_raw"]), _num(obs["review_count_raw"]), obs["badge_raw"],
         obs["stock_status_raw"]),
    )


def add_evidence(conn, obs_id, field, raw, extracted, method, conf):
    conn.execute(
        "INSERT INTO evidence_log(obs_id,field_name,raw_value,extracted_value,"
        "extraction_method,confidence) VALUES(?,?,?,?,?,?)",
        (obs_id, field, str(raw) if raw is not None else None,
         str(extracted) if extracted is not None else None, method, conf),
    )


def main() -> int:
    REVIEW.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    obs_rows = conn.execute("SELECT * FROM raw_observations").fetchall()
    if not obs_rows:
        print("No raw_observations. Run the scraper first.")
        return 0

    clear_derived(conn)
    # existing canonicals by (brand,category) for fuzzy
    by_brand_cat: dict[tuple, list[dict]] = defaultdict(list)
    review_items = []
    n_det = n_fuzzy = n_new = 0

    for o in obs_rows:
        o = dict(o)
        attrs = parse_all(o["product_name_raw"], o["pack_size_raw"], o["query"])
        brand = o["brand_raw"] or (o["product_name_raw"] or "").split(" ")[0]
        det_key = ms.deterministic_key(brand, attrs)
        bc = (ms.norm_brand(brand), (attrs.get("category") or "unknown"))

        # 1. deterministic: key already seen
        if conn.execute("SELECT 1 FROM canonical_skus WHERE canonical_sku_id=?", (det_key,)).fetchone():
            sku_id, method, conf = det_key, "deterministic", 0.95
            n_det += 1
        else:
            # 2. fuzzy within same brand+category
            fid, fconf = ms.fuzzy_match(o["product_name_raw"] or "", attrs, by_brand_cat[bc])
            if fid:
                sku_id, method, conf = fid, "fuzzy", fconf
                n_fuzzy += 1
                review_items.append({"obs_id": o["obs_id"], "name": o["product_name_raw"],
                                     "matched_to": fid, "confidence": fconf})
            else:
                sku_id, method, conf = det_key, "deterministic", 0.95
                upsert_canonical(conn, sku_id, brand, attrs, "high" if attrs.get("total_pulls") else "low")
                by_brand_cat[bc].append({"canonical_sku_id": sku_id, "brand": brand,
                                        "title": o["product_name_raw"] or "", "attrs": attrs})
                n_new += 1

        link_listing(conn, o["platform"], o["url"], sku_id, method, conf)
        metrics = compute_metrics(attrs, o["mrp_raw"], o["price_raw"])
        add_price_obs(conn, o, sku_id, metrics)
        add_market_obs(conn, o, sku_id)

        # evidence for the fields that drive the analysis
        add_evidence(conn, o["obs_id"], "total_pulls", o["pack_size_raw"],
                     attrs.get("total_pulls"), "regex_title" if attrs.get("total_pulls") else "not_available",
                     0.8 if attrs.get("total_pulls") else 0.0)
        add_evidence(conn, o["obs_id"], "ply", o["product_name_raw"], attrs.get("ply"),
                     "regex_title" if attrs.get("ply") else "not_available", 0.9 if attrs.get("ply") else 0.0)
        add_evidence(conn, o["obs_id"], "material", o["product_name_raw"], attrs.get("material"),
                     "regex_title" if attrs.get("material") != "not_stated" else "not_available",
                     0.9 if attrs.get("material") != "not_stated" else 0.0)
        add_evidence(conn, o["obs_id"], "selling_price", o["price_raw"], metrics["selling_price"],
                     "structured_field" if metrics["selling_price"] is not None else "not_available",
                     1.0 if metrics["selling_price"] is not None else 0.0)
        if attrs.get("ambiguous_pack"):
            review_items.append({"obs_id": o["obs_id"], "name": o["product_name_raw"],
                                "issue": "ambiguous pack arithmetic", "pack": o["pack_size_raw"]})

    conn.commit()
    if review_items:
        (REVIEW / "matches_and_packs.json").write_text(
            json.dumps(review_items, indent=1, ensure_ascii=False), encoding="utf-8")

    n_sku = conn.execute("SELECT COUNT(*) FROM canonical_skus").fetchone()[0]
    n_price = conn.execute("SELECT COUNT(*) FROM price_observations").fetchone()[0]
    n_ev = conn.execute("SELECT COUNT(*) FROM evidence_log").fetchone()[0]
    conn.close()
    print(f"Observations processed: {len(obs_rows)}")
    print(f"Canonical SKUs: {n_sku}  (deterministic hits {n_det}, fuzzy {n_fuzzy}, new {n_new})")
    print(f"price_observations: {n_price}  evidence_log: {n_ev}")
    print(f"review_queue items: {len(review_items)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
