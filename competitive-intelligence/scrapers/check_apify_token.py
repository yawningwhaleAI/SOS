#!/usr/bin/env python3
"""Step 0 verification: confirm we can authenticate to Apify. Costs nothing.

Calls the Apify `users/me` endpoint (free metadata, no actor run) and prints the
account username + plan. Never prints the token itself.

Works with EITHER auth setup:
  (a) APIFY_TOKEN in the environment / .env  -> sent as a Bearer header, or
  (b) proxy-injected credential (the "Add credential" flow allow-lists
      api.apify.com and attaches Authorization automatically) -> no token in
      our code; we just call the endpoint and the proxy adds auth.

Usage:
    python scrapers/check_apify_token.py
"""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import get_spend_cap_usd  # noqa: E402
import common  # noqa: E402

APIFY_ME_URL = "https://api.apify.com/v2/users/me"


def _get_token_optional() -> str | None:
    """Return an explicit token if configured, else None (proxy may inject it)."""
    try:
        return common.get_apify_token()
    except RuntimeError:
        return None


def _fetch_me(token: str | None) -> dict:
    """GET users/me via the REST API through the session proxy.

    urllib honours HTTPS_PROXY and the system CA bundle already configured in
    this environment, so it routes through the egress proxy that either allows
    api.apify.com (and injects auth) or passes our explicit Bearer header.
    """
    req = urllib.request.Request(APIFY_ME_URL, method="GET")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 — https only
        payload = json.loads(resp.read().decode("utf-8"))
    # Apify wraps single objects as {"data": {...}}
    return payload.get("data", payload)


def main() -> int:
    token = _get_token_optional()
    mode = "explicit APIFY_TOKEN" if token else "proxy-injected credential"
    print(f"[..] Auth mode: {mode}. Calling {APIFY_ME_URL} (free, no actor run).")

    try:
        me = _fetch_me(token)
    except urllib.error.HTTPError as e:  # noqa: PERF203
        if e.code in (401, 403):
            print(
                f"[FAIL] Apify returned HTTP {e.code} (auth). "
                "Check the token value, or that api.apify.com is allow-listed "
                "with the Authorization credential attached.",
                file=sys.stderr,
            )
        else:
            print(f"[FAIL] Apify returned HTTP {e.code}: {e.reason}", file=sys.stderr)
        return 3
    except Exception as e:  # noqa: BLE001 — surface network/proxy errors plainly
        print(
            f"[FAIL] Could not reach api.apify.com: {e}\n"
            "If this is a proxy 403, the host is not allow-listed for this "
            "environment yet (Network access / Add credential).",
            file=sys.stderr,
        )
        return 3

    username = me.get("username", "<unknown>")
    plan = (me.get("plan") or {}).get("id", "<unknown>")
    print(f"[OK] Authenticated to Apify. account={username} plan={plan}")

    cap = get_spend_cap_usd()
    if cap is None:
        print("[WARN] Spend cap not set. Set guardrails.spend_cap_usd in config/actors.yaml before Step 1.")
    else:
        print(f"[OK] Spend cap: ${cap:.2f} per run.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
