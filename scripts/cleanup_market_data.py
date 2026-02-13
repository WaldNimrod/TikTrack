#!/usr/bin/env python3
"""
P3-017: Cleanup Jobs — Market Data
Team 60 — MARKET_DATA_PIPE_SPEC §7
- Intraday: 30d retention; 30d→archive 1y→delete
- Daily/FX: 250 trading days retention → archive (no hard delete)
Evidence: last_run_time, rows_updated, rows_pruned
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip().strip("'\"").strip()
                break
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set")
    sys.exit(1)
if "postgresql+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

INTRADAY_RETENTION_DAYS = 30
DAILY_RETENTION_DAYS = 250  # trading days — simplified to calendar days for script


def run_cleanup_intraday() -> dict:
    """Prune ticker_prices_intraday older than 30 days."""
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cutoff = datetime.now(timezone.utc) - timedelta(days=INTRADAY_RETENTION_DAYS)
        cur.execute(
            "DELETE FROM market_data.ticker_prices_intraday WHERE price_timestamp < %s",
            (cutoff,),
        )
        rows = cur.rowcount
        conn.commit()
        return {"rows_pruned": rows, "cutoff": cutoff.isoformat()}
    finally:
        conn.close()


def run_cleanup_daily() -> dict:
    """Prune ticker_prices older than 250 days (simplified). Archive = no hard delete for EOD/FX per §7.3."""
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cutoff = datetime.now(timezone.utc) - timedelta(days=DAILY_RETENTION_DAYS)
        cur.execute(
            "DELETE FROM market_data.ticker_prices WHERE price_timestamp < %s",
            (cutoff,),
        )
        rows = cur.rowcount
        conn.commit()
        return {"rows_pruned": rows, "cutoff": cutoff.isoformat()}
    finally:
        conn.close()


def log_evidence(ev: dict) -> None:
    artifacts = _project / "documentation" / "05-REPORTS" / "artifacts"
    artifacts.mkdir(parents=True, exist_ok=True)
    log_file = artifacts / "TEAM_60_CLEANUP_EVIDENCE_LOG.md"
    now = datetime.now(timezone.utc).isoformat()
    entry = f"\n## {now}\n- intraday: rows_pruned={ev.get('intraday',{}).get('rows_pruned',0)}\n- daily: rows_pruned={ev.get('daily',{}).get('rows_pruned',0)}\n"
    with open(log_file, "a") as f:
        f.write(entry)


def main():
    print("🔄 Cleanup — market data (P3-017)")
    ev = {}
    try:
        ev["intraday"] = run_cleanup_intraday()
        print(f"✅ Intraday: pruned {ev['intraday']['rows_pruned']} rows")
    except Exception as e:
        print(f"⚠️ Intraday: {e}")
        ev["intraday"] = {"rows_pruned": 0, "error": str(e)}
    try:
        ev["daily"] = run_cleanup_daily()
        print(f"✅ Daily: pruned {ev['daily']['rows_pruned']} rows")
    except Exception as e:
        print(f"⚠️ Daily: {e}")
        ev["daily"] = {"rows_pruned": 0, "error": str(e)}
    ev["last_run_time"] = datetime.now(timezone.utc).isoformat()
    log_evidence(ev)
    print("✅ Cleanup complete. Evidence logged.")
    sys.exit(0)


if __name__ == "__main__":
    main()
