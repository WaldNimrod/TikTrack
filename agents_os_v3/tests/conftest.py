"""Shared pytest fixtures — AOS v3 GATE_2 QA (Team 51)."""

from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest


def _load_aos_v3_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


_load_aos_v3_dotenv()


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line(
        "markers",
        "aos_v3_phase5_canary: Remediation Phase 5 — DB canary simulation (Team 51 F-05)",
    )


# Re-export for test modules
requires_aos_db = pytest.mark.skipif(
    not (os.environ.get("AOS_V3_DATABASE_URL") or "").strip(),
    reason="AOS_V3_DATABASE_URL not set — integration tests skipped",
)


@pytest.fixture
def aos_db_conn() -> Generator[Any, None, None]:
    """Real Postgres connection; rolls back after each test (no autocommit)."""
    import psycopg2
    from psycopg2.extras import RealDictCursor

    url = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not url:
        pytest.skip("AOS_V3_DATABASE_URL not set")
    conn = psycopg2.connect(url, cursor_factory=RealDictCursor)
    conn.autocommit = False
    try:
        yield conn
    finally:
        conn.rollback()
        conn.close()
