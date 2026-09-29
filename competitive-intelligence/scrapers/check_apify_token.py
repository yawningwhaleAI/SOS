#!/usr/bin/env python3
"""Step 0 verification: confirm the Apify token works. Costs nothing.

Calls the Apify `users/me` endpoint (a free metadata call, no actor run) and
prints the account username + plan. Never prints the token itself.

Usage:
    python scrapers/check_apify_token.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import get_apify_token, get_spend_cap_usd  # noqa: E402


def main() -> int:
    try:
        token = get_apify_token()
    except RuntimeError as e:
        print(f"[FAIL] {e}", file=sys.stderr)
        return 1

    try:
        from apify_client import ApifyClient
    except ImportError:
        print(
            "[FAIL] apify-client not installed. Run:\n"
            "    pip install -r requirements.txt",
            file=sys.stderr,
        )
        return 2

    try:
        client = ApifyClient(token)
        me = client.user("me").get()  # free metadata call, no actor run
    except Exception as e:  # noqa: BLE001 — surface any auth/network error plainly
        print(f"[FAIL] Apify rejected the token or the call failed: {e}", file=sys.stderr)
        return 3

    username = (me or {}).get("username", "<unknown>")
    plan = ((me or {}).get("plan") or {}).get("id", "<unknown>")
    print(f"[OK] Apify token works. account={username} plan={plan}")

    cap = get_spend_cap_usd()
    if cap is None:
        print("[WARN] SOS_SPEND_CAP_USD is not set. Set it in .env before Step 1.")
    else:
        print(f"[OK] Spend cap set: ${cap:.2f} per run.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
