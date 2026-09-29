#!/usr/bin/env python3
"""Collect quick-commerce search results (Blinkit / Zepto / Instamart).

For each (platform x locality) it runs the Step 1 chosen actor with all queries
batched, saves the untouched JSON under raw_data/, and inserts one
raw_observations row per listing plus a runs row. Cleaning/normalisation is a
later step — this script only collects and preserves.

SPEND SAFETY (spec §2):
  * Reads the committed spend cap (config/actors.yaml guardrails.spend_cap_usd).
  * --budget sets a lower soft ceiling for THIS invocation (default $3).
  * Stops before starting a run once spend reaches the soft budget, and hard
    stops if actual spend reaches the cap.

Examples:
  # dry run — show exactly what would be scraped, spend nothing
  python scrapers/run_quick_commerce.py --tier-sample --core-queries --dry-run

  # budget-bounded day-1 pilot: 1 locality per tier, core queries, <= $3
  python scrapers/run_quick_commerce.py --tier-sample --core-queries \
      --max-items-per-query 30 --budget 3
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
from field_maps import MAX_QUERIES_PER_RUN, build_input, map_item  # noqa: E402


def chunk(seq, size):
    if not size or size <= 0 or size >= len(seq):
        return [list(seq)]
    return [list(seq[i:i + size]) for i in range(0, len(seq), size)]

DB = ROOT / "data" / "sos.db"
QC_PLATFORMS = ["blinkit", "zepto", "instamart"]

# One primary query per core category for the pilot (keeps cost bounded).
CORE_QUERIES = [
    "facial tissue", "kitchen towel", "toilet paper",
    "paper napkins", "wet wipes", "pocket tissue",
]

SUBSTITUTE_HINTS = ("reusable", "microfiber", "micro fiber", "cloth", "cotton",
                    "washable", "non woven cloth", "bamboo cloth")


def apply_caps(tmpl: dict, max_items: int, n_queries: int) -> dict:
    """Lower an input_template's item caps to the requested per-query limit."""
    t = dict(tmpl)
    for f in ("maxItemsPerQuery", "maxResults", "maxProducts", "maxResultsPerQuery"):
        if f in t:
            t[f] = max_items
    if "maxItems" in t:  # zepto total cap = per-query * number of queries
        t["maxItems"] = max_items * max(1, n_queries)
    return t


def resolve_localities(cfg, city_key, args):
    city = cfg["cities"][city_key]
    locs = city["localities"]
    if args.localities:
        want = {x.strip().lower() for x in args.localities.split(",")}
        locs = [l for l in locs if l["name"].lower() in want]
    elif args.tier_sample:
        seen, picked = set(), []
        for l in locs:  # first locality of each tier, in tier order
            if l["tier"] not in seen:
                seen.add(l["tier"]); picked.append(l)
        locs = picked
    if args.limit_locations:
        locs = locs[: args.limit_locations]
    return locs


def queries_for(args, qcfg):
    if args.queries:
        return [q.strip() for q in args.queries.split(",")]
    if args.core_queries:
        return CORE_QUERIES
    # else: all queries from queries.yaml
    out = []
    for lst in qcfg["queries"].values():
        out.extend(lst)
    return out


def ensure_run_row(conn, run_id, platform, actor, queries, loc, status, cost, n):
    conn.execute(
        "INSERT OR REPLACE INTO runs(run_id,platform,actor_name,started_at,finished_at,"
        "locations_json,queries_json,rows_returned,cost_usd,status) "
        "VALUES(?,?,?,?,?,?,?,?,?,?)",
        (run_id, platform, actor, common.now_ist(), common.now_ist(),
         json.dumps([loc["name"]]), json.dumps(queries), n, cost, status),
    )


def insert_observations(conn, run_id, platform, actor, loc, items):
    raw_rel = f"raw_data/{platform}/{run_id}/items.json"
    rows = []
    for it in items:
        m = map_item(platform, it)
        name = (m.get("product_name_raw") or "")
        is_sub = 1 if any(h in name.lower() for h in SUBSTITUTE_HINTS) else 0
        rows.append((
            run_id, platform, actor, common.now_ist(),
            loc.get("city"), loc["name"], loc["tier"],
            m.get("store_id"), None,
            m.get("query"), m.get("search_rank"), m.get("is_sponsored"),
            m.get("product_name_raw"), m.get("brand_raw"), m.get("pack_size_raw"), None,
            m.get("mrp_raw"), m.get("price_raw"),
            m.get("rating_raw"), m.get("review_count_raw"), m.get("badge_raw"),
            m.get("stock_status_raw"), None,
            m.get("url"), m.get("image_url"),
            raw_rel, None, is_sub,
        ))
    conn.executemany(
        "INSERT INTO raw_observations("
        "run_id,platform,actor_name,scraped_at,city,locality,affluence_tier,"
        "store_id,pincode_resolved,query,search_rank,is_sponsored,"
        "product_name_raw,brand_raw,pack_size_raw,description_raw,mrp_raw,price_raw,"
        "rating_raw,review_count_raw,badge_raw,stock_status_raw,seller_raw,"
        "url,image_url,raw_json_path,is_relevant,is_substitute) "
        "VALUES(" + ",".join(["?"] * 28) + ")",
        rows,
    )
    return len(rows)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--city", default="delhi_ncr")
    ap.add_argument("--platforms", default=",".join(QC_PLATFORMS))
    ap.add_argument("--localities", help="comma-separated locality names")
    ap.add_argument("--tier-sample", action="store_true", help="one locality per tier")
    ap.add_argument("--limit-locations", type=int)
    ap.add_argument("--queries", help="comma-separated queries (overrides)")
    ap.add_argument("--core-queries", action="store_true", help="6 core-category queries")
    ap.add_argument("--max-items-per-query", type=int, default=30)
    ap.add_argument("--budget", type=float, default=3.0, help="soft $ ceiling for this run")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    locs_cfg = common.load_yaml("locations.yaml")
    qcfg = common.load_yaml("queries.yaml")
    actors = common.load_yaml("actors.yaml")["platforms"]
    cap = common.get_spend_cap_usd() or float("inf")
    platforms = [p.strip() for p in args.platforms.split(",") if p.strip() in QC_PLATFORMS]
    locs = resolve_localities(locs_cfg, args.city, args)
    queries = queries_for(args, qcfg)

    print(f"City={args.city}  platforms={platforms}")
    print(f"Localities ({len(locs)}): {[l['name'] for l in locs]}")
    print(f"Queries ({len(queries)}): {queries}")
    print(f"Cap=${cap}  soft budget=${args.budget}  maxItems/query={args.max_items_per_query}")
    print(f"Planned runs: {len(platforms) * len(locs)} (platform x locality, queries batched)\n")

    if args.dry_run:
        for p in platforms:
            tmpl = apply_caps(actors[p]["input_template"], args.max_items_per_query, len(queries))
            print(f"--- {p} ({actors[p]['chosen_actor']}) sample input ---")
            print(json.dumps(build_input(p, tmpl, queries, locs[0]), indent=1)[:500], "\n")
        print("DRY RUN — nothing scraped, $0 spent.")
        return 0

    conn = sqlite3.connect(DB)
    spent = 0.0
    total_rows = 0
    try:
        for p in platforms:
            actor = actors[p]["chosen_actor"]
            tmpl = apply_caps(actors[p]["input_template"], args.max_items_per_query, len(queries))
            qchunks = chunk(queries, MAX_QUERIES_PER_RUN.get(p, 0))
            for loc in locs:
                if spent >= args.budget:
                    print(f"[STOP] soft budget ${args.budget} reached (spent ${spent:.3f}).")
                    raise SystemExit(0)
                loc_rows = 0
                for ci, qc in enumerate(qchunks):
                    inp = build_input(p, tmpl, qc, loc)
                    res = apify_rest.run_actor(actor, inp)
                    spent += res["cost_usd"]
                    rid = res["run_id"] or f"failed_{p}_{loc['name']}_{ci}"
                    n = 0
                    if res["status"] == "SUCCEEDED" and res["items"]:
                        rawp = ROOT / "raw_data" / p / rid
                        rawp.mkdir(parents=True, exist_ok=True)
                        (rawp / "items.json").write_text(
                            json.dumps(res["items"], indent=1, ensure_ascii=False), encoding="utf-8")
                        n = insert_observations(conn, rid, p, actor, loc, res["items"])
                        total_rows += n; loc_rows += n
                    ensure_run_row(conn, rid, p, actor, qc, loc, res["status"], res["cost_usd"], n)
                    conn.commit()
                    common.append_run_log({
                        "run_id": rid, "platform": p, "actor": actor,
                        "locations": loc["name"], "queries": len(qc),
                        "rows": n, "cost_usd": round(res["cost_usd"], 4),
                        "status": res["status"], "errors": "",
                        "started_at": common.now_ist(), "finished_at": common.now_ist(),
                    })
                    if res["status"] != "SUCCEEDED":
                        print(f"[{p:9}] {loc['name']:22} chunk{ci} {res['status']}")
                    if spent >= cap:
                        print(f"[HARD STOP] cap ${cap} reached.")
                        raise SystemExit(0)
                print(f"[{p:9}] {loc['name']:22} rows={loc_rows:3}  cum=${spent:.3f}")
    finally:
        conn.close()
    print(f"\nDone. rows={total_rows}  spend=${spent:.3f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
