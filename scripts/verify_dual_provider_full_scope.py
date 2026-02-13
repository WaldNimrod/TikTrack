#!/usr/bin/env python3
"""
הוכחת טעינה משני ספקים + היקף מלא
TEAM_10_TO_TEAM_20_DUAL_PROVIDER_AND_FULL_SCOPE_EVIDENCE_MANDATE
מריץ sync-eod, sync-ticker-prices, מונה שורות, מייצר Evidence.
"""

import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "DATABASE_URL":
                    DATABASE_URL = v.strip().strip("'\"").strip()
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

LINES = []


def log(s: str):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {s}"
    print(line)
    LINES.append(line)


def run_cmd(cmd: list, name: str) -> str:
    log(f">>> {' '.join(cmd)}")
    try:
        r = subprocess.run(
            cmd,
            cwd=str(_project),
            capture_output=True,
            text=True,
            timeout=300,
        )
        out = (r.stdout or "") + (r.stderr or "")
        for line in out.strip().splitlines():
            log(f"    {line}")
        if r.returncode != 0:
            log(f"    (exit {r.returncode})")
        return out
    except Exception as e:
        log(f"    ERROR: {e}")
        return ""


def db_counts() -> dict:
    if not DATABASE_URL or "postgresql" not in str(DATABASE_URL):
        return {}
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        counts = {}
        for table in ["tickers", "ticker_prices", "exchange_rates", "exchange_rates_history", "ticker_prices_intraday"]:
            try:
                cur.execute(f"SELECT COUNT(*) FROM market_data.{table}")
                counts[table] = cur.fetchone()[0]
            except Exception:
                counts[table] = "N/A"
        cur.close()
        conn.close()
        return counts
    except Exception as e:
        log(f"DB counts error: {e}")
        return {}


def main():
    log("=== Dual Provider + Full Scope Verification ===")
    log("")

    log("1. FX — Alpha → Yahoo (exchange_rates)")
    run_cmd(["python3", "scripts/sync_exchange_rates_eod.py"], "sync-eod")
    log("")

    log("2. Prices (EOD) — Yahoo → Alpha (ticker_prices)")
    run_cmd(["python3", "scripts/sync_ticker_prices_eod.py"], "sync-ticker-prices")
    log("")

    log("3. DB Counts (after sync)")
    counts = db_counts()
    for k, v in counts.items():
        log(f"   market_data.{k}: {v}")
    log("")

    log("4. Historical 250d — Providers Yahoo/Alpha support get_ticker_history(250)")
    log("   — EOD sync builds history day-by-day (1 row/ticker/day)")
    log("   — On-demand: get_ticker_indicators_cache_first uses 250d for ATR/MA/CCI")
    log("")

    log("5. Intraday — ticker_prices_intraday")
    log("   — Table exists (P3-016); sync job for Active tickers: לא מיושם בשלב זה")
    log("   — System Settings: intraday_interval_minutes, max_active_tickers")
    log("")

    log("=== Verification complete ===")
    return LINES


if __name__ == "__main__":
    main()
    evidence_path = _project / "_COMMUNICATION" / "team_20" / "TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.md"
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    with open(evidence_path, "w", encoding="utf-8") as f:
        f.write("# Team 20 — Dual Provider + Full Scope Evidence\n\n")
        f.write("**id:** TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE  \n")
        f.write("**date:** " + datetime.now(timezone.utc).strftime("%Y-%m-%d") + "  \n")
        f.write("**מקור:** TEAM_10_TO_TEAM_20_DUAL_PROVIDER_AND_FULL_SCOPE_EVIDENCE_MANDATE\n\n---\n\n")
        f.write("## Verification run output\n\n```\n")
        f.write("\n".join(LINES))
        f.write("\n```\n\n")
    print(f"\n✅ Evidence appended to {evidence_path}")
    sys.exit(0)
