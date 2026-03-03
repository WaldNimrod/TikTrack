"""
Team 20 — KB Remediation TASK 1: Run production schema confirmation queries.
Runs against DATABASE_URL (api/.env). Output for Team 170 handoff.
"""

import os
import sys
from pathlib import Path

_path = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(_path))

# Load DATABASE_URL from api/.env
env_file = _path / "api" / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            if line.strip().startswith("DATABASE_URL=") and not line.strip().startswith("#"):
                val = line.split("=", 1)[1].strip().strip("'\"").strip()
                os.environ.setdefault("DATABASE_URL", val)
                break

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("SKIP: DATABASE_URL not set")
    sys.exit(2)

if "postgresql+asyncpg" in str(db_url):
    db_url = str(db_url).replace("postgresql+asyncpg://", "postgresql://")

import psycopg2
from psycopg2.extras import RealDictCursor

QUERIES = [
    ("tickers (market_data)", """
        SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema='market_data' AND table_name='tickers'
        ORDER BY ordinal_position;
    """),
    ("user_api_keys", """
        SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema='user_data' AND table_name='user_api_keys'
        ORDER BY ordinal_position;
    """),
    ("user_refresh_tokens", """
        SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema='user_data' AND table_name='user_refresh_tokens'
        ORDER BY ordinal_position;
    """),
    ("revoked_tokens", """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema='user_data' AND table_name='revoked_tokens'
        ORDER BY ordinal_position;
    """),
    ("trading_account_fees", """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema='user_data' AND table_name='trading_account_fees'
        ORDER BY ordinal_position;
    """),
    ("exchange_rates", """
        SELECT column_name, data_type, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema='market_data' AND table_name='exchange_rates'
        ORDER BY ordinal_position;
    """),
    ("ticker_prices (price, market_cap)", """
        SELECT column_name, data_type, numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema='market_data' AND table_name='ticker_prices'
        AND column_name IN ('price', 'market_cap')
        ORDER BY ordinal_position;
    """),
]


def main():
    try:
        conn = psycopg2.connect(db_url)
    except Exception as e:
        print(f"ERROR: Cannot connect: {e}")
        sys.exit(1)

    results = []
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        for name, sql in QUERIES:
            try:
                cur.execute(sql.strip())
                rows = cur.fetchall()
                results.append((name, rows))
            except Exception as e:
                results.append((name, [{"error": str(e)}]))

    conn.close()

    # Output
    out = []
    out.append("# Schema Confirmation Output — Team 20")
    out.append(f"# DATABASE_URL: {db_url.split('@')[-1] if '@' in db_url else '(hidden)'}")
    out.append("")

    for name, rows in results:
        out.append(f"## {name}")
        if rows and "error" in rows[0]:
            out.append(f"  ERROR: {rows[0]['error']}")
        elif not rows:
            out.append("  (no columns — table may not exist)")
        else:
            for r in rows:
                out.append(f"  {dict(r)}")
        out.append("")

    text = "\n".join(out)
    print(text)

    # Write to artifacts
    artifact_dir = _path / "documentation" / "reports" / "05-REPORTS" / "artifacts_SESSION_01"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    artifact_path = artifact_dir / "TEAM_20_SCHEMA_CONFIRMATION_OUTPUT.md"
    artifact_path.write_text(text, encoding="utf-8")
    print(f"\nWritten: {artifact_path}")
    sys.exit(0)


if __name__ == "__main__":
    main()
