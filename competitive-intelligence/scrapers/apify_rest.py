"""Minimal Apify REST client over urllib (stdlib only).

Works through the session's egress proxy. Auth is an explicit Bearer header
when APIFY_TOKEN is set, otherwise it relies on a proxy-injected credential.
No third-party dependency, so it runs anywhere Python does.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request

API = "https://api.apify.com/v2"
TERMINAL = {"SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"}


def _token() -> str | None:
    t = os.environ.get("APIFY_TOKEN", "").strip()
    return t or None


def _request(path: str, method: str = "GET", body=None):
    url = f"{API}/{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    tok = _token()
    if tok:
        req.add_header("Authorization", f"Bearer {tok}")
    if data:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=90) as r:  # noqa: S310 https only
        raw = r.read().decode("utf-8")
    return json.loads(raw) if raw else None


def actor_id(slug: str) -> str:
    """`username/actor` -> `username~actor` (the API path form)."""
    return slug.replace("/", "~")


def get_actor(slug: str) -> dict | None:
    return (_request(f"acts/{actor_id(slug)}") or {}).get("data")


def start_run(slug: str, run_input: dict) -> dict:
    """Start an actor run. Raises urllib.error.HTTPError on 4xx/5xx."""
    return _request(f"acts/{actor_id(slug)}/runs", "POST", run_input)["data"]


def wait_for_run(run_id: str, poll_s: int = 4, timeout_s: int = 600) -> dict:
    waited = 0
    while waited < timeout_s:
        time.sleep(poll_s)
        waited += poll_s
        run = _request(f"actor-runs/{run_id}")["data"]
        if run["status"] in TERMINAL:
            return run
    return _request(f"actor-runs/{run_id}")["data"]


def get_dataset_items(dataset_id: str) -> list[dict]:
    """Return all items (the /items endpoint yields a bare JSON list)."""
    items = _request(f"datasets/{dataset_id}/items")
    return items if isinstance(items, list) else []


def run_actor(slug: str, run_input: dict, timeout_s: int = 600, start_retries: int = 3) -> dict:
    """Start, wait, and collect. Returns {status, cost_usd, items, run_id}.

    Retries a transient start failure (some actors 400/429 when hit back-to-back)
    with exponential backoff before giving up.
    """
    run = None
    last_code = None
    for attempt in range(start_retries):
        try:
            run = start_run(slug, run_input)
            break
        except urllib.error.HTTPError as e:
            last_code = e.code
            if attempt < start_retries - 1:
                time.sleep(3 * (attempt + 1))  # 3s, 6s, ...
    if run is None:
        return {"status": f"START_HTTP_{last_code}", "cost_usd": 0.0, "items": [], "run_id": None}
    run = wait_for_run(run["id"], timeout_s=timeout_s)
    items = get_dataset_items(run["defaultDatasetId"]) if run["status"] == "SUCCEEDED" else []
    return {
        "status": run["status"],
        "cost_usd": float(run.get("usageTotalUsd") or 0.0),
        "items": items,
        "run_id": run["id"],
    }
