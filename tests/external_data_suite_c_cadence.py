#!/usr/bin/env python3
"""
External Data — Suite C: Cadence & Status
- Active tickers → Intraday; Inactive → EOD
- Minimal: verify tables/fields exist for cadence
"""

import os
import sys
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

def ok(name):
    print(f"  ✅ {name}")

def fail(name, msg):
    print(f"  ❌ {name}: {msg}")
    FAILS.append(f"{name}: {msg}")

def test_tables_exist():
    """ticker_prices (EOD) and ticker_prices_intraday exist"""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        db = os.getenv("DATABASE_URL", "").replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(db)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        for t in ["ticker_prices", "ticker_prices_intraday"]:
            cur.execute("""
                SELECT 1 FROM information_schema.tables
                WHERE table_schema='market_data' AND table_name=%s
            """, (t,))
            if not cur.fetchone():
                fail("cadence_tables", f"missing {t}"); cur.close(); conn.close(); return
        cur.close()
        conn.close()
        ok("cadence_tables")
    except Exception as e:
        fail("cadence_tables", str(e))

def main():
    print("=== Suite C: Cadence & Status ===\n")
    test_tables_exist()
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
