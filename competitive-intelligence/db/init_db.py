#!/usr/bin/env python3
"""Create (or verify) the pilot SQLite database from schema.sql.

Idempotent: safe to re-run. It never drops existing tables or data — it only
applies `CREATE TABLE IF NOT EXISTS`. Cleaning/loading code writes here; the
untouched Apify JSON always lives in raw_data/ and is the source of truth.

Usage:
    python db/init_db.py            # build/verify data/sos.db
    python db/init_db.py --check    # only report which tables exist
"""
from __future__ import annotations

import argparse
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "sos.db"
SCHEMA_PATH = ROOT / "db" / "schema.sql"

EXPECTED_TABLES = {
    "runs",
    "raw_observations",
    "canonical_skus",
    "listings",
    "price_observations",
    "market_observations",
    "evidence_log",
    "review_texts",
    "brand_tiers",
}


def list_tables(conn: sqlite3.Connection) -> set[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' "
        "AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return {r[0] for r in rows}


def build() -> int:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(schema)
        conn.commit()
        tables = list_tables(conn)
    finally:
        conn.close()

    missing = EXPECTED_TABLES - tables
    print(f"Database: {DB_PATH}")
    print(f"Tables present ({len(tables)}): {', '.join(sorted(tables))}")
    if missing:
        print(f"ERROR — missing expected tables: {', '.join(sorted(missing))}", file=sys.stderr)
        return 1
    print("OK — all expected tables present.")
    return 0


def check() -> int:
    if not DB_PATH.exists():
        print(f"No database at {DB_PATH}. Run without --check to create it.", file=sys.stderr)
        return 1
    conn = sqlite3.connect(DB_PATH)
    try:
        tables = list_tables(conn)
    finally:
        conn.close()
    missing = EXPECTED_TABLES - tables
    print(f"Database: {DB_PATH}")
    print(f"Tables present ({len(tables)}): {', '.join(sorted(tables))}")
    if missing:
        print(f"Missing: {', '.join(sorted(missing))}", file=sys.stderr)
        return 1
    print("OK — schema complete.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Init/verify the S.O.S. pilot database.")
    ap.add_argument("--check", action="store_true", help="only report table presence")
    args = ap.parse_args()
    return check() if args.check else build()


if __name__ == "__main__":
    raise SystemExit(main())
