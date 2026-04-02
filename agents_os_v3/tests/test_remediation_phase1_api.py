"""Phase 1 remediation — D.6 gaps (Team 11 mandate v1.0.1). Requires AOS_V3_DATABASE_URL."""

from __future__ import annotations

import json
from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection

from .conftest import requires_aos_db


def _hdr(team_id: str) -> dict[str, str]:
    return {"X-Actor-Team-Id": team_id}


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


@requires_aos_db
def test_get_team_detail_ok(api_client: TestClient) -> None:
    r = api_client.get("/api/teams/team_00")
    assert r.status_code == 200
    body = r.json()
    assert body["team_id"] == "team_00"
    assert "label" in body
    assert "has_active_assignment" in body


@requires_aos_db
def test_get_team_detail_not_found(api_client: TestClient) -> None:
    r = api_client.get("/api/teams/team_99999_nonexistent")
    assert r.status_code == 404
    assert r.json()["detail"]["code"] == "NOT_FOUND"


@requires_aos_db
def test_override_actor_mismatch(api_client: TestClient) -> None:
    body = {
        "actor_team_id": "team_00",
        "action": "FORCE_PASS",
        "reason": "test",
    }
    r = api_client.post(
        "/api/runs/01JK8AOSV3RUN0000000001/override",
        headers=_hdr("team_10"),
        json=body,
    )
    assert r.status_code == 400
    assert r.json()["detail"]["code"] == "ACTOR_MISMATCH"


@requires_aos_db
def test_override_insufficient_authority(api_client: TestClient) -> None:
    body = {
        "actor_team_id": "team_20",
        "action": "FORCE_PASS",
        "reason": "test",
    }
    r = api_client.post(
        "/api/runs/01JK8AOSV3RUN0000000001/override",
        headers=_hdr("team_20"),
        json=body,
    )
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "INSUFFICIENT_AUTHORITY"


@requires_aos_db
def test_delete_routing_rule_forbidden(api_client: TestClient) -> None:
    r = api_client.delete(
        "/api/routing-rules/01JK8AOSV3RR0000000001",
        headers=_hdr("team_10"),
    )
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "INSUFFICIENT_AUTHORITY"


@requires_aos_db
def test_put_policy_forbidden(api_client: TestClient) -> None:
    r = api_client.put(
        "/api/policies/01JK8AOSV3POL00000000001",
        headers=_hdr("team_11"),
        json={"policy_value_json": json.dumps({"max": 5})},
    )
    assert r.status_code == 403
    assert r.json()["detail"]["code"] == "INSUFFICIENT_AUTHORITY"
