#!/usr/bin/env python3
"""SKU matching (spec §10).

1. Deterministic key: normalised brand + category + ply + units + pulls.
2. Fuzzy (stdlib difflib): within same brand+category, title similarity >= 0.85
   AND identical pack arithmetic -> same canonical, lower confidence.
Never merges listings with different pack arithmetic.

No third-party dependency (difflib is stdlib) so it runs anywhere.
"""
from __future__ import annotations

import re
from difflib import SequenceMatcher

STOPWORDS = {"the", "and", "with", "of", "for", "pack", "roll", "rolls", "box",
             "pulls", "pull", "sheets", "sheet", "ply", "tissue", "paper"}


def norm_brand(b: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (b or "").lower()) or "unknown"


def clean_title(t: str | None) -> str:
    t = re.sub(r"[^a-z0-9 ]+", " ", (t or "").lower())
    toks = [w for w in t.split() if w not in STOPWORDS and not w.isdigit()]
    return " ".join(toks)


def deterministic_key(brand: str | None, attrs: dict) -> str:
    cat = (attrs.get("category") or "unknown").lower().replace(" ", "")
    ply = attrs.get("ply") or "na"
    units = attrs.get("units_per_pack") or "na"
    pulls = attrs.get("pulls_per_unit") or "na"
    return f"{norm_brand(brand)}_{cat}_{ply}ply_{units}x{pulls}"


def title_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, clean_title(a), clean_title(b)).ratio()


def same_pack(a: dict, b: dict) -> bool:
    return (a.get("units_per_pack") == b.get("units_per_pack")
            and a.get("pulls_per_unit") == b.get("pulls_per_unit"))


def fuzzy_match(cand_title: str, cand_attrs: dict, existing: list[dict],
                threshold: float = 0.85) -> tuple[str | None, float]:
    """Return (canonical_sku_id, confidence) of the best fuzzy match, or (None,0).

    `existing` = [{canonical_sku_id, brand, title, attrs}] within same brand+cat.
    """
    best_id, best = None, 0.0
    for e in existing:
        if not same_pack(cand_attrs, e["attrs"]):
            continue
        s = title_similarity(cand_title, e["title"])
        if s >= threshold and s > best:
            best, best_id = s, e["canonical_sku_id"]
    return best_id, round(best * 0.9, 3)  # cap fuzzy confidence below deterministic
