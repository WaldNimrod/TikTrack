#!/usr/bin/env python3
"""
P3-013 — Runtime verification: market_cap column in ticker_prices
Team 50 (QA) — per TEAM_20_TO_TEAM_50_EXTERNAL_DATA_QA_HANDOFF
"""
import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.chdir(Path(__file__).resolve().parent.parent)

def load_env():
    env_path = Path("api/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                v = v.strip().strip("'\"")
                os.environ.setdefault(k, v)

def main():
    load_env()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print(json.dumps({"error": "DATABASE_URL not set", "PASS": False}, indent=2))
        sys.exit(1)
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
    except ImportError:
        print(json.dumps({"error": "psycopg2 not installed", "PASS": False}, indent=2))
        sys.exit(1)
    out = {"timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z", "runtimeCheck": True}
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_schema='market_data' AND table_name='ticker_prices' AND column_name='market_cap';
        """)
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            out["market_cap"] = dict(row)
            out["PASS"] = (
                row["data_type"] in ("numeric", "NUMERIC")
                and row.get("numeric_precision") == 20
                and row.get("numeric_scale") == 8
            )
        else:
            out["market_cap"] = None
            out["PASS"] = False
    except Exception as e:
        out["error"] = str(e)
        out["PASS"] = False
    print(json.dumps(out, indent=2))
    sys.exit(0 if out.get("PASS") else 1)

if __name__ == "__main__":
    main()
