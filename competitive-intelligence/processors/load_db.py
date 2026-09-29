#!/usr/bin/env python3
"""Load cleaned rows into canonical_skus / listings / price_observations / market_observations. Idempotent upserts keyed by platform_product_id.

STATUS: stub — not implemented yet. Belongs to a later step of the build spec
(CLAUDE.md). Step 0 only creates the scaffold; do not run this as if it works.
"""
from __future__ import annotations


def main() -> int:
    raise NotImplementedError(
        "processors/load_db.py is a Step 1+ module. Implement it when its step is reached "
        "(see CLAUDE.md). Step 0 = setup only."
    )


if __name__ == "__main__":
    raise SystemExit(main())
