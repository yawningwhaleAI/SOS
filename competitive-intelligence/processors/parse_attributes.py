#!/usr/bin/env python3
"""Parse ply, pulls, rolls, dimensions, GSM, material, claims from raw listing text (spec §9). Never infer material from brand; NULL when not stated. Every extracted value writes an evidence_log row.

STATUS: stub — not implemented yet. Belongs to a later step of the build spec
(CLAUDE.md). Step 0 only creates the scaffold; do not run this as if it works.
"""
from __future__ import annotations


def main() -> int:
    raise NotImplementedError(
        "processors/parse_attributes.py is a Step 1+ module. Implement it when its step is reached "
        "(see CLAUDE.md). Step 0 = setup only."
    )


if __name__ == "__main__":
    raise SystemExit(main())
