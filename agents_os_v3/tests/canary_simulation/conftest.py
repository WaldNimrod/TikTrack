"""Phase 5 — pipeline canary simulation (fixtures + marker)."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line(
        "markers",
        "aos_v3_canary_sim: Phase 5 F-05 — multi-step DB-backed pipeline simulation (Remediation)",
    )


@pytest.fixture
def api_client() -> Generator[TestClient, None, None]:
    app = create_app()

    def _db_override() -> Generator[Any, None, None]:
        c = db_connection()
        try:
            yield c
        finally:
            c.close()

    app.dependency_overrides[_db_conn] = _db_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
