#!/usr/bin/env python3
"""
External Data — Suite B: Cache-First + Failover
- API exchange-rates reads from DB (cache) — no external call in request
- Returns staleness in {ok, warning, na}
"""

import os
import sys
import urllib.request
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.chdir(Path(__file__).resolve().parent.parent)

def load_env():
    p = Path("api/.env")
    if p.exists():
        for line in p.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\"").strip())

load_env()

FAILS = []
API_BASE = os.getenv("API_BASE_URL", "http://127.0.0.1:8082")

def ok(name):
    print(f"  ✅ {name}")

def fail(name, msg):
    print(f"  ❌ {name}: {msg}")
    FAILS.append(f"{name}: {msg}")

def get_token():
    """Use seed user — requires backend running."""
    try:
        req = urllib.request.Request(
            f"{API_BASE}/api/v1/auth/login",
            data=json.dumps({"usernameOrEmail": "TikTrackAdmin", "password": "4181"}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            d = json.loads(r.read().decode())
            return d.get("access_token")
    except Exception as e:
        return None

def test_exchange_rates_returns_staleness():
    """GET /reference/exchange-rates returns staleness enum"""
    token = get_token()
    if not token:
        fail("cache_failover", "no token (backend/login)"); return
    try:
        req = urllib.request.Request(
            f"{API_BASE}/api/v1/reference/exchange-rates",
            headers={"Authorization": f"Bearer {token}"},
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            d = json.loads(r.read().decode())
        st = d.get("staleness")
        if st not in ("ok", "warning", "na"):
            fail("staleness_enum", f"got {st}"); return
        data = d.get("data", [])
        if not isinstance(data, list):
            fail("data_format", "data not list"); return
        ok("exchange_rates_staleness")
    except urllib.error.HTTPError as e:
        fail("exchange_rates_api", f"HTTP {e.code}"); return
    except Exception as e:
        fail("exchange_rates_api", str(e))

def test_exchange_rates_precision():
    """conversion_rate in response is numeric 20,8 compatible"""
    token = get_token()
    if not token:
        fail("precision", "no token"); return
    try:
        req = urllib.request.Request(
            f"{API_BASE}/api/v1/reference/exchange-rates",
            headers={"Authorization": f"Bearer {token}"},
        )
        with urllib.request.urlopen(req, timeout=5) as r:
            d = json.loads(r.read().decode())
        for item in d.get("data", [])[:2]:
            rate = item.get("conversion_rate")
            if rate is None:
                continue
            try:
                v = float(rate)
                if v <= 0 or v > 1e12:
                    fail("precision_range", f"rate {v} out of range"); return
            except (TypeError, ValueError):
                fail("precision_format", f"invalid rate: {rate}"); return
        ok("exchange_rates_precision")
    except Exception as e:
        fail("exchange_rates_precision", str(e))

def main():
    print("=== Suite B: Cache-First + Failover ===\n")
    test_exchange_rates_returns_staleness()
    test_exchange_rates_precision()
    print()
    if FAILS:
        print(f"FAILED: {len(FAILS)}")
        for f in FAILS:
            print(f"  - {f}")
        sys.exit(1)
    print("PASS")
    sys.exit(0)

if __name__ == "__main__":
    main()
