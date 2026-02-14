#!/usr/bin/env python3
"""
P3-017: Cleanup Jobs — Market Data + Archive (SSOT §7.3)
Team 60 — MARKET_DATA_PIPE_SPEC §7; MARKET_DATA_COVERAGE_MATRIX Rule 7

- Intraday: 30d DB → Archive → Delete from DB; Archive files deleted after 1 year
- EOD/FX: 250d DB → Archive (no delete of archive files ever)
Evidence: last_run_time, rows_archived, rows_pruned, archive_paths
"""

import csv
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

_project = Path(__file__).parent.parent
ARCHIVE_BASE = _project / "archive" / "market_data"
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
INTRADAY_ARCHIVE_RETENTION_DAYS = 365  # 1 year — then delete archive files
DAILY_RETENTION_DAYS = 250


def _export_to_csv(cur, query: str, out_path: Path) -> int:
    """Export query result to CSV. Returns row count."""
    cur.execute(query)
    rows = cur.fetchall()
    if not rows:
        return 0
    cols = [d[0] for d in cur.description]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        w.writerows(rows)
    return len(rows)


def run_cleanup_intraday() -> dict:
    """30d → Archive → Delete. Archive files deleted after 1 year."""
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cutoff = datetime.now(timezone.utc) - timedelta(days=INTRADAY_RETENTION_DAYS)
        # 1. Export to archive
        export_sql = """
            SELECT id, ticker_id, provider_id, price, open_price, high_price, low_price, close_price,
                   volume, market_cap, price_timestamp, fetched_at, is_stale, created_at
            FROM market_data.ticker_prices_intraday WHERE price_timestamp < %s
        """
        cur.execute(export_sql, (cutoff,))
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        arch_dir = ARCHIVE_BASE / "intraday"
        arch_dir.mkdir(parents=True, exist_ok=True)
        arch_file = arch_dir / f"intraday_{cutoff.date().isoformat()}_{ts}.csv"
        n_archived = 0
        if rows:
            with open(arch_file, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(cols)
                w.writerows(rows)
            n_archived = len(rows)
        # 2. Delete from DB
        cur.execute("DELETE FROM market_data.ticker_prices_intraday WHERE price_timestamp < %s", (cutoff,))
        n_pruned = cur.rowcount
        conn.commit()
        # 3. Delete archive files older than 1 year
        archive_cutoff = datetime.now(timezone.utc) - timedelta(days=INTRADAY_ARCHIVE_RETENTION_DAYS)
        deleted_files = 0
        for p in arch_dir.glob("intraday_*.csv"):
            try:
                if p.stat().st_mtime < archive_cutoff.timestamp():
                    p.unlink()
                    deleted_files += 1
            except OSError:
                pass
        return {
            "rows_archived": n_archived,
            "rows_pruned": n_pruned,
            "archive_path": str(arch_file) if n_archived else None,
            "archive_files_deleted": deleted_files,
            "cutoff": cutoff.isoformat(),
        }
    finally:
        conn.close()


def run_cleanup_daily() -> dict:
    """250d → Archive (no delete of archive). EOD per §7.3."""
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cutoff = datetime.now(timezone.utc) - timedelta(days=DAILY_RETENTION_DAYS)
        # 1. Export to archive (ticker_prices)
        export_sql = """
            SELECT id, ticker_id, provider_id, price, open_price, high_price, low_price, close_price,
                   volume, price_timestamp, fetched_at, is_stale, created_at, market_cap
            FROM market_data.ticker_prices WHERE price_timestamp < %s
        """
        cur.execute(export_sql, (cutoff,))
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        arch_dir = ARCHIVE_BASE / "daily"
        arch_dir.mkdir(parents=True, exist_ok=True)
        arch_file = arch_dir / f"ticker_prices_{cutoff.date().isoformat()}_{ts}.csv"
        n_archived = 0
        if rows:
            with open(arch_file, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(cols)
                w.writerows(rows)
            n_archived = len(rows)
        # 2. Delete from DB
        cur.execute("DELETE FROM market_data.ticker_prices WHERE price_timestamp < %s", (cutoff,))
        n_pruned = cur.rowcount
        conn.commit()
        return {
            "rows_archived": n_archived,
            "rows_pruned": n_pruned,
            "archive_path": str(arch_file) if n_archived else None,
            "cutoff": cutoff.isoformat(),
        }
    finally:
        conn.close()


def run_cleanup_fx_history() -> dict:
    """250d → Archive (no delete of archive). FX per §7.3."""
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()
        cutoff = datetime.now(timezone.utc).date() - timedelta(days=DAILY_RETENTION_DAYS)
        # 1. Export to archive
        export_sql = """
            SELECT id, from_currency, to_currency, conversion_rate, rate_date, created_at
            FROM market_data.exchange_rates_history WHERE rate_date < %s
        """
        cur.execute(export_sql, (cutoff,))
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description]
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        arch_dir = ARCHIVE_BASE / "fx_history"
        arch_dir.mkdir(parents=True, exist_ok=True)
        arch_file = arch_dir / f"exchange_rates_history_{cutoff.isoformat()}_{ts}.csv"
        n_archived = 0
        if rows:
            with open(arch_file, "w", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                w.writerow(cols)
                w.writerows(rows)
            n_archived = len(rows)
        # 2. Delete from DB
        cur.execute("DELETE FROM market_data.exchange_rates_history WHERE rate_date < %s", (cutoff,))
        n_pruned = cur.rowcount
        conn.commit()
        return {
            "rows_archived": n_archived,
            "rows_pruned": n_pruned,
            "archive_path": str(arch_file) if n_archived else None,
            "cutoff": cutoff.isoformat(),
        }
    finally:
        conn.close()


def log_evidence(ev: dict) -> None:
    """MD log + JSON evidence. Per SSOT + TEAM_10_TO_TEAM_60_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE."""
    artifacts = _project / "documentation" / "05-REPORTS" / "artifacts"
    artifacts.mkdir(parents=True, exist_ok=True)
    now = ev.get("last_run_time", datetime.now(timezone.utc).isoformat())
    rows_archived = (
        ev.get("intraday", {}).get("rows_archived", 0)
        + ev.get("daily", {}).get("rows_archived", 0)
        + ev.get("fx_history", {}).get("rows_archived", 0)
    )
    rows_pruned = (
        ev.get("intraday", {}).get("rows_pruned", 0)
        + ev.get("daily", {}).get("rows_pruned", 0)
        + ev.get("fx_history", {}).get("rows_pruned", 0)
    )
    archive_paths = []
    for k in ("intraday", "daily", "fx_history"):
        p = ev.get(k, {}).get("archive_path")
        if p:
            archive_paths.append(p)
    # MD log
    log_file = artifacts / "TEAM_60_CLEANUP_EVIDENCE_LOG.md"
    entry = (
        f"\n## {now}\n"
        f"- intraday: rows_archived={ev.get('intraday',{}).get('rows_archived',0)}, rows_pruned={ev.get('intraday',{}).get('rows_pruned',0)}\n"
        f"- daily: rows_archived={ev.get('daily',{}).get('rows_archived',0)}, rows_pruned={ev.get('daily',{}).get('rows_pruned',0)}\n"
        f"- fx_history: rows_archived={ev.get('fx_history',{}).get('rows_archived',0)}, rows_pruned={ev.get('fx_history',{}).get('rows_pruned',0)}\n"
        f"- archive_paths: {archive_paths}\n"
    )
    with open(log_file, "a") as f:
        f.write(entry)
    # JSON evidence
    json_ev = {
        "last_run_time": now,
        "rows_archived": rows_archived,
        "rows_pruned": rows_pruned,
        "rows_updated": ev.get("rows_updated", 0),
        "archive_paths": archive_paths,
        "intraday": ev.get("intraday", {}),
        "daily": ev.get("daily", {}),
        "fx_history": ev.get("fx_history", {}),
    }
    json_file = artifacts / "TEAM_60_CLEANUP_EVIDENCE.json"
    with open(json_file, "w") as f:
        json.dump(json_ev, f, indent=2)


def main():
    print("🔄 Cleanup — market data + Archive (P3-017, SSOT §7.3)")
    ev = {}
    try:
        ev["intraday"] = run_cleanup_intraday()
        print(f"✅ Intraday: archived {ev['intraday']['rows_archived']}, pruned {ev['intraday']['rows_pruned']}")
    except Exception as e:
        print(f"⚠️ Intraday: {e}")
        ev["intraday"] = {"rows_archived": 0, "rows_pruned": 0, "error": str(e)}
    try:
        ev["daily"] = run_cleanup_daily()
        print(f"✅ Daily: archived {ev['daily']['rows_archived']}, pruned {ev['daily']['rows_pruned']}")
    except Exception as e:
        print(f"⚠️ Daily: {e}")
        ev["daily"] = {"rows_archived": 0, "rows_pruned": 0, "error": str(e)}
    try:
        ev["fx_history"] = run_cleanup_fx_history()
        print(f"✅ FX History: archived {ev['fx_history']['rows_archived']}, pruned {ev['fx_history']['rows_pruned']}")
    except Exception as e:
        print(f"⚠️ FX History: {e}")
        ev["fx_history"] = {"rows_archived": 0, "rows_pruned": 0, "error": str(e)}
    ev["last_run_time"] = datetime.now(timezone.utc).isoformat()
    log_evidence(ev)
    print("✅ Cleanup complete. Archive before delete. Evidence logged.")
    sys.exit(0)


if __name__ == "__main__":
    main()
