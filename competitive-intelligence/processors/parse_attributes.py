#!/usr/bin/env python3
"""Parse product attributes from raw listing text (spec §9).

Pure functions over (name, pack_size, query) -> structured attributes, plus an
evidence trail. NEVER infers material from brand; a field not stated is None
with method 'not_available'. Ambiguous pack arithmetic is flagged for review.
"""
from __future__ import annotations

import re
from typing import Any

# --- category from the search query that surfaced the listing --------------
CATEGORY_BY_KEYWORD = [
    ("facial", "Facial"), ("face tissue", "Facial"), ("tissue box", "Facial"),
    ("pocket", "Pocket"), ("car tissue", "Car"),
    ("kitchen towel", "Kitchen towel"), ("kitchen roll", "Kitchen towel"),
    ("paper towel", "Kitchen towel"),
    ("toilet", "Toilet"),
    ("napkin", "Napkin"), ("serviette", "Napkin"),
    ("wet wipe", "Wipes"), ("wipe", "Wipes"),
    ("air fryer", "Kitchen paper"), ("baking paper", "Kitchen paper"),
    ("butter paper", "Kitchen paper"), ("parchment", "Kitchen paper"),
    ("food wrap", "Kitchen paper"),
    ("cling", "Cling wrap"), ("plastic wrap", "Cling wrap"),
    ("garbage", "Garbage bag"), ("dustbin", "Garbage bag"), ("trash", "Garbage bag"),
    ("paper plate", "Paper plate"), ("disposable plate", "Paper plate"),
    ("paper cup", "Paper cup"), ("disposable cup", "Paper cup"),
]

MATERIAL_KEYWORDS = [
    ("100% virgin", "virgin"), ("virgin pulp", "virgin"), ("virgin", "virgin"),
    ("recycled", "recycled"), ("bamboo", "bamboo"),
    ("bagasse", "bagasse"), ("sugarcane", "bagasse"),
]

CLAIM_VOCAB = {
    "soft": ["soft", "super soft", "ultra soft"],
    "strong": ["strong", "extra strong", "durable"],
    "absorbent": ["absorbent", "super absorbent", "high absorb"],
    "food_safe": ["food safe", "food grade"],
    "eco": ["eco", "eco-friendly", "ecofriendly", "natural", "biodegradable", "compostable"],
    "hypoallergenic": ["hypoallergenic"],
    "chlorine_free": ["chlorine free", "chlorine-free", "unbleached"],
    "fragrance": ["fragrance", "scented", "perfumed"],
    "lotion": ["lotion", "aloe", "balm", "moistur"],
}


def category_from_query(query: str | None) -> str | None:
    q = (query or "").lower()
    for kw, cat in CATEGORY_BY_KEYWORD:
        if kw in q:
            return cat
    return None


# Strong category words as they appear in a PRODUCT NAME, in priority order.
# A specific format word (napkin, toilet, kitchen, wipe, pocket) beats the
# generic "tissue"/"facial", so a "Cocktail Napkin Tissue" is a Napkin.
NAME_CATEGORY_PRIORITY = [
    ("napkin", "Napkin"), ("serviette", "Napkin"), ("tissue napkin", "Napkin"),
    ("toilet", "Toilet"), ("toilet roll", "Toilet"),
    ("kitchen towel", "Kitchen towel"), ("kitchen roll", "Kitchen towel"),
    ("kitchen tissue", "Kitchen towel"), ("paper towel", "Kitchen towel"),
    ("wet wipe", "Wipes"), ("wipes", "Wipes"),
    ("pocket", "Pocket"),
    ("paper cup", "Paper cup"), ("paper plate", "Paper plate"),
    ("garbage", "Garbage bag"), ("cling", "Cling wrap"),
    ("air fryer", "Kitchen paper"), ("baking paper", "Kitchen paper"),
    ("parchment", "Kitchen paper"), ("butter paper", "Kitchen paper"),
    ("face tissue", "Facial"), ("facial", "Facial"),
]


def category_from_name(name: str | None) -> str | None:
    """Category as stated by the PRODUCT NAME (more reliable than the query,
    which can surface adjacent products). None if the name says nothing specific.
    """
    n = (name or "").lower()
    for kw, cat in NAME_CATEGORY_PRIORITY:
        if kw in n:
            return cat
    return None


def parse_ply(text: str) -> int | None:
    m = re.search(r"(\d)\s*-?\s*ply", text, re.I)
    return int(m.group(1)) if m else None


def parse_gsm(text: str) -> tuple[int | None, str]:
    m = re.search(r"(\d{1,3})\s*gsm", text, re.I)
    if not m:
        return None, "unknown"
    val = int(m.group(1))
    basis = "unknown"
    window = text[max(0, m.start() - 15): m.end() + 15].lower()
    if "per ply" in window or "/ply" in window:
        basis = "per_ply"
    elif "total" in window:
        basis = "total"
    return val, basis


def parse_dims(text: str) -> tuple[float | None, float | None]:
    m = re.search(r"(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*cm", text, re.I)
    if m:
        return float(m.group(1)), float(m.group(2))
    return None, None


def parse_material(text: str) -> str:
    t = text.lower()
    for kw, mat in MATERIAL_KEYWORDS:
        if kw in t:
            return mat
    return "not_stated"


def parse_claims(text: str) -> list[str]:
    t = text.lower()
    out = []
    for claim, syns in CLAIM_VOCAB.items():
        if any(s in t for s in syns):
            out.append(claim)
    return out


def parse_pack(text: str) -> dict[str, Any]:
    """Resolve units_per_pack and pulls_per_unit from messy pack text.

    Returns {units_per_pack, pulls_per_unit, total_pulls, ambiguous, note}.
    Handles: 'A x B pulls', 'B pulls x A', 'pack of A', 'A rolls', 'A in 1',
    'N pulls/sheets', 'As'. Unknown -> None with ambiguous flag when conflicting.
    """
    t = text.lower().replace("×", "x")
    units = pulls = None
    note = ""

    # pulls/sheets count: the number attached to pull/sheet/tissue/wipe/napkin
    mpull = re.search(r"(\d+)\s*(?:pull|sheet|tissue|wipe|napkin|pcs|pieces|count)s?\b", t)
    if mpull:
        pulls = int(mpull.group(1))

    # explicit "pack of N" / "N rolls|boxes|packs|rolls"
    mpack = re.search(r"pack\s*of\s*(\d+)", t)
    if mpack:
        units = int(mpack.group(1))
    else:
        mrolls = re.search(r"(\d+)\s*(?:rolls?|boxes?|packs?|carton)s?\b", t)
        if mrolls:
            units = int(mrolls.group(1))

    # "A in 1"
    min1 = re.search(r"(\d+)\s*in\s*1", t)
    if min1 and units is None:
        units = int(min1.group(1))

    # A x B pattern (adjacent digits): decide which side is pulls
    mx = re.search(r"(\d+)\s*x\s*(\d+)", t)
    if mx:
        a, b = int(mx.group(1)), int(mx.group(2))
        if pulls in (a, b):
            other = b if pulls == a else a
            units = units or other
        else:
            hi, lo = max(a, b), min(a, b)
            pulls = pulls or hi
            units = units or lo
    elif units is None or units == 1:
        # multiplier with a word between, e.g. "120 Pull x 4" or "4 x 60 pulls"
        mmul = re.search(r"x\s*(\d+)\b", t) or re.search(r"\b(\d+)\s*x\b", t)
        if mmul:
            units = int(mmul.group(1))

    # bare "As" (e.g. '4s') as units
    if units is None:
        ms = re.search(r"\b(\d+)s\b", t)
        if ms:
            units = int(ms.group(1))

    if units is None:
        units = 1
    ambiguous = pulls is None and not re.search(r"\d", t)
    total = units * pulls if (units and pulls) else None
    return {"units_per_pack": units, "pulls_per_unit": pulls,
            "total_pulls": total, "ambiguous": bool(mx and mpull and pulls not in (int(mx.group(1)), int(mx.group(2)))),
            "note": note}


# Known sub-brand / product lines. If present in the name, they keep distinct
# products (e.g. Origami Klassic vs Luxuria vs So Soft) from merging into one SKU.
KNOWN_LINES = [
    "so soft", "sosoft", "klassic", "luxuria", "luxe", "supreme", "premium",
    "classic", "gold", "naturals", "signature", "elite", "royale", "royal",
    "ultra", "pro", "max", "everyday", "essential", "chef", "tidy chef",
]


def parse_product_line(name: str | None) -> str | None:
    n = (name or "").lower()
    for line in KNOWN_LINES:
        if line in n:
            return line.replace(" ", "")
    return None


def parse_all(name: str | None, pack_size: str | None, query: str | None) -> dict[str, Any]:
    """Full attribute parse. `text` = name + pack_size combined for coverage."""
    name = name or ""
    pack_size = pack_size or ""
    text = f"{name} {pack_size}".strip()
    ply = parse_ply(text)
    gsm, gsm_basis = parse_gsm(text)
    L, W = parse_dims(text)
    pack = parse_pack(pack_size if re.search(r"\d", pack_size) else text)
    # Name wins over the search query (the query can surface adjacent products).
    category = category_from_name(name) or category_from_query(query)
    return {
        "category": category,
        "product_line": parse_product_line(name),
        "ply": ply,
        "units_per_pack": pack["units_per_pack"],
        "pulls_per_unit": pack["pulls_per_unit"],
        "total_pulls": pack["total_pulls"],
        "sheet_length_cm": L, "sheet_width_cm": W,
        "gsm": gsm, "gsm_basis": gsm_basis,
        "material": parse_material(text),
        "claims": parse_claims(text),
        "ambiguous_pack": pack["ambiguous"],
    }


if __name__ == "__main__":
    # quick self-test on a few real strings seen in the pilot
    samples = [
        ("Origami 2 Ply Kitchen Tissue Paper Roll ,60 Pulls Per Roll", "120 Pull x 4", "kitchen towel"),
        ("Beco Bamboo Super Soft Facial Tissue 100 Pulls (Pack of 6), 600 Pulls 2 ply", "", "facial tissue"),
        ("Origami Kitchen Towel Roll Non Woven", "80 pulls", "kitchen towel"),
        ("Wintex Toilet Roll 2 Ply", "6 rolls x 200 pulls", "toilet paper"),
    ]
    for n, p, q in samples:
        print(n[:45], "->", parse_all(n, p, q))
