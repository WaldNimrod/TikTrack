"""
Sync Exchange Rates EOD — APScheduler job (BF-004 / GATE_7)
Runs scripts/sync_exchange_rates_eod.py so market_data.exchange_rates.last_sync_time is updated.
Per MARKET_DATA_PIPE_SPEC: Alpha → Yahoo; EOD only. Once per day.
"""

import asyncio
import os
import re
import sys
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession


def _project_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent.parent


async def run(db: AsyncSession) -> dict:
    """
    Run scripts/sync_exchange_rates_eod.py via subprocess.
    Returns {records_processed, records_updated, error_count} for job_run_log.
    """
    root = _project_root()
    script = root / "scripts" / "sync_exchange_rates_eod.py"
    if not script.exists():
        return {"records_processed": 0, "records_updated": 0, "error_count": 1}

    env = os.environ.copy()
    # Ensure script can see api/.env-derived vars (start-backend.sh sources them)
    env_path = root / "api" / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip("'\"")

    proc = await asyncio.create_subprocess_exec(
        sys.executable,
        str(script),
        cwd=str(root),
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate()
    out = (stdout or b"").decode("utf-8", errors="replace")
    err = (stderr or b"").decode("utf-8", errors="replace")

    if proc.returncode != 0:
        return {"records_processed": 0, "records_updated": 0, "error_count": 1}

    # Parse "Upserted N rates" for records_updated
    n_updated = 0
    m = re.search(r"Upserted\s+(\d+)\s+rates", out)
    if m:
        n_updated = int(m.group(1))
    return {"records_processed": 5, "records_updated": n_updated, "error_count": 0}
