#!/usr/bin/env python3
"""Compute price-intelligence metrics (spec §8.4).

All normalised prices are per selling price (SP). Metrics that need data we
don't have (dimensions, GSM) return None rather than a guess. Downstream
analysis always uses medians + spread, never means (spec §5 Step 5).
"""
from __future__ import annotations

from typing import Any


def to_float(x: Any) -> float | None:
    if x is None:
        return None
    try:
        return float(str(x).replace("₹", "").replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def compute_metrics(attrs: dict, mrp: Any, sp: Any) -> dict[str, Any]:
    mrp = to_float(mrp)
    sp = to_float(sp)
    ply = attrs.get("ply")
    units = attrs.get("units_per_pack")
    total = attrs.get("total_pulls")
    L, W = attrs.get("sheet_length_cm"), attrs.get("sheet_width_cm")
    gsm, basis = attrs.get("gsm"), attrs.get("gsm_basis")

    out: dict[str, Any] = {
        "mrp": mrp, "selling_price": sp,
        "discount_pct": None, "price_per_unit": None,
        "price_per_100_pulls": None, "price_per_100_ply_sheets": None,
        "price_per_1000_cm2": None, "price_per_gram": None,
        "mrp_inflation_flag": None,
    }
    if mrp and sp and mrp > 0:
        out["discount_pct"] = round(1 - sp / mrp, 4)
        out["mrp_inflation_flag"] = 1 if out["discount_pct"] > 0.50 else 0
    if sp and units:
        out["price_per_unit"] = round(sp / units, 4)
    if sp and total:
        out["price_per_100_pulls"] = round(sp / total * 100, 4)
        if ply:
            out["price_per_100_ply_sheets"] = round(sp / (total * ply) * 100, 4)
        if L and W:
            area = total * L * W
            if area > 0:
                out["price_per_1000_cm2"] = round(sp / area * 1000, 6)
                if gsm and basis in ("per_ply", "total") and ply:
                    plies = ply if basis == "per_ply" else 1
                    grams = area * plies * gsm / 10000.0  # cm2 * gsm/ (100*100)
                    if grams > 0:
                        out["price_per_gram"] = round(sp / grams, 4)
    return out
