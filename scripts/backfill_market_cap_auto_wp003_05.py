#!/usr/bin/env python3
"""
AUTO-WP003-05 — Backfill market_cap for ANAU.MI, BTC-USD, TEVA.TA, SPY when null.
Run when Yahoo cooldown has expired (e.g. 20 min after sync-ticker-prices).

Usage:
  python3 scripts/backfill_market_cap_auto_wp003_05.py
  python3 scripts/backfill_market_cap_auto_wp003_05.py --manual ANAU.MI=1440000000
"""

import argparse
import os
import sys
from decimal import Decimal
from pathlib import Path

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))

from scripts.sync_ticker_prices_eod import backfill_market_cap_auto_wp003_05

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill market_cap for AUTO-WP003-05 symbols")
    parser.add_argument(
        "--manual",
        action="append",
        metavar="SYMBOL=VALUE",
        help="Override when providers fail, e.g. ANAU.MI=1440000000 (use when Yahoo 429)",
    )
    args = parser.parse_args()
    manual = {}
    if args.manual:
        for s in args.manual:
            if "=" in s:
                sym, val = s.split("=", 1)
                sym, val = sym.strip(), val.strip()
                if sym and val:
                    try:
                        manual[sym] = Decimal(val)
                    except Exception:
                        print(f"⚠️ Ignoring invalid --manual {s}")
    if not DATABASE_URL:
        print("❌ DATABASE_URL not set")
        sys.exit(1)
    n = backfill_market_cap_auto_wp003_05(manual_overrides=manual)
    print(f"✅ Backfilled market_cap for {n} row(s)")
    sys.exit(0)
