#!/usr/bin/env python3
"""Collect Amazon.in / Flipkart search results (national — these actors have no
pincode control, so prices are ~national, not per-locality).

Reuses the quick-commerce plumbing (input build, DB insert, run log, spend cap).
Amazon is the priciest actor (~$8/1k) so keep --max-items-per-query modest.

Example:
  python scrapers/run_ecommerce.py --core-queries --max-items-per-query 30 --budget 2
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(ROOT / "processors"))

import apify_rest  # noqa: E402
import common  # noqa: E402
from field_maps import MAX_QUERIES_PER_RUN, build_input  # noqa: E402
# reuse the shared collectors from the quick-commerce runner
from run_quick_commerce import (CORE_QUERIES, apply_caps, chunk,  # noqa: E402
                                ensure_run_row, insert_observations)

DB = ROOT / "data" / "sos.db"
EC_PLATFORMS = ["amazon", "flipkart"]
NATIONAL = {"name": "National", "city": "National", "area": "National", "tier": "national"}


def queries_for(args, qcfg):
    if args.queries:
        return [q.strip() for q in args.queries.split(",")]
    if args.core_queries:
        return CORE_QUERIES
    out = []
    for lst in qcfg["queries"].values():
        out.extend(lst)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--platforms", default=",".join(EC_PLATFORMS))
    ap.add_argument("--queries")
    ap.add_argument("--core-queries", action="store_true")
    ap.add_argument("--max-items-per-query", type=int, default=30)
    ap.add_argument("--budget", type=float, default=2.0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    qcfg = common.load_yaml("queries.yaml")
    actors = common.load_yaml("actors.yaml")["platforms"]
    cap = common.get_spend_cap_usd() or float("inf")
    platforms = [p.strip() for p in args.platforms.split(",") if p.strip() in EC_PLATFORMS]
    queries = queries_for(args, qcfg)

    print(f"E-commerce (national). platforms={platforms}")
    print(f"Queries ({len(queries)}): {queries}")
    print(f"Cap=${cap} soft budget=${args.budget} maxItems/query={args.max_items_per_query}\n")

    if args.dry_run:
        for p in platforms:
            tmpl = apply_caps(actors[p]["input_template"], args.max_items_per_query, len(queries))
            print(f"--- {p} ({actors[p]['chosen_actor']}) ---")
            print(json.dumps(build_input(p, tmpl, queries, NATIONAL), indent=1)[:400], "\n")
        print("DRY RUN — $0 spent.")
        return 0

    conn = sqlite3.connect(DB)
    spent = 0.0
    total = 0
    try:
        for p in platforms:
            actor = actors[p]["chosen_actor"]
            tmpl = apply_caps(actors[p]["input_template"], args.max_items_per_query, len(queries))
            for ci, qc in enumerate(chunk(queries, MAX_QUERIES_PER_RUN.get(p, 0))):
                if spent >= args.budget:
                    print(f"[STOP] soft budget ${args.budget} reached."); raise SystemExit(0)
                inp = build_input(p, tmpl, qc, NATIONAL)
                res = apify_rest.run_actor(actor, inp)
                spent += res["cost_usd"]
                rid = res["run_id"] or f"failed_{p}_{ci}"
                n = 0
                if res["status"] == "SUCCEEDED" and res["items"]:
                    rawp = ROOT / "raw_data" / p / rid
                    rawp.mkdir(parents=True, exist_ok=True)
                    (rawp / "items.json").write_text(
                        json.dumps(res["items"], indent=1, ensure_ascii=False), encoding="utf-8")
                    n = insert_observations(conn, rid, p, actor, NATIONAL, res["items"])
                    total += n
                ensure_run_row(conn, rid, p, actor, qc, NATIONAL, res["status"], res["cost_usd"], n)
                conn.commit()
                common.append_run_log({
                    "run_id": rid, "platform": p, "actor": actor, "locations": "National",
                    "queries": len(qc), "rows": n, "cost_usd": round(res["cost_usd"], 4),
                    "status": res["status"], "errors": "",
                    "started_at": common.now_ist(), "finished_at": common.now_ist()})
                print(f"[{p:9}] chunk{ci} {res['status']:9} rows={n:3} cost=${res['cost_usd']:.4f} cum=${spent:.3f}")
                if spent >= cap:
                    print(f"[HARD STOP] cap ${cap} reached."); raise SystemExit(0)
    finally:
        conn.close()
    print(f"\nDone. rows={total} spend=${spent:.3f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
