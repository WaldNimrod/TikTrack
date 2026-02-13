#!/usr/bin/env python3
"""
Stage 1 Task 1-002 — Runtime verification: exchange_rates table
Team 50 (QA) — actual DB check, not just document review
Requires: DATABASE_URL in api/.env or env
"""
import os
import sys
import json
from pathlib import Path

# Add api to path for config
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

        # 1. Table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema='market_data' AND table_name='exchange_rates'
            );
        """)
        out["tableExists"] = cur.fetchone()["exists"]

        # 2. Column types
        cur.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_schema='market_data' AND table_name='exchange_rates'
            ORDER BY ordinal_position;
        """)
        cols = cur.fetchall()
        out["columns"] = [dict(c) for c in cols]
        conv = next((c for c in cols if c["column_name"] == "conversion_rate"), None)
        if conv:
            out["conversion_rate"] = {
                "data_type": conv["data_type"],
                "numeric_precision": str(conv["numeric_precision"]) if conv["numeric_precision"] else None,
                "numeric_scale": str(conv["numeric_scale"]) if conv["numeric_scale"] else None,
                "expected": "NUMERIC(20,8)",
            }

        # 3. Constraints
        cur.execute("""
            SELECT c.conname, c.contype
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname='market_data' AND t.relname='exchange_rates';
        """)
        out["constraints"] = [dict(r) for r in cur.fetchall()]

        cur.close()
        conn.close()

        # PASS criteria
        out["PASS"] = (
            out.get("tableExists") is True
            and conv is not None
            and conv["data_type"] in ("numeric", "NUMERIC")
            and conv.get("numeric_precision") == 20
            and conv.get("numeric_scale") == 8
        )

    except Exception as e:
        out["error"] = str(e)
        out["PASS"] = False

    print(json.dumps(out, indent=2))
    sys.exit(0 if out.get("PASS") else 1)

if __name__ == "__main__":
    main()
