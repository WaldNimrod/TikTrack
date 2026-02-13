#!/usr/bin/env python3
"""
P3-013: Add market_cap to ticker_prices.
Team 60 — runs via: docker exec tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db -f scripts/migrations/p3_013_add_market_cap_to_ticker_prices.sql
Table owner is tiktrack; use -U tiktrack for ALTER.
"""
import subprocess
import sys
from pathlib import Path

_project = Path(__file__).parent.parent
migration = _project / "scripts" / "migrations" / "p3_013_add_market_cap_to_ticker_prices.sql"
with open(migration) as f:
    r = subprocess.run(
        [
            "docker", "exec", "-i", "tiktrack-postgres-dev",
            "psql", "-U", "tiktrack", "-d", "TikTrack-phoenix-db",
        ],
        stdin=f,
        capture_output=True,
        text=True,
    )
if r.returncode != 0:
    print(f"❌ Migration failed: {r.stderr}")
    sys.exit(1)
print("✅ P3-013 migration complete — market_cap added to ticker_prices")
