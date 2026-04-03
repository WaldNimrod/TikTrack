"""HTTP-level checks for Team 11 GATE_2 handoff (FastAPI TestClient)."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from ulid import ULID

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection
from agents_os_v3.modules.state import machine as state_machine

from .conftest import requires_aos_db
from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package


@pytest.fixture
def api_client() -> Generator[TestClient, None, None]:
    """Fresh DB connection per HTTP request (TestClient may run sync routes off-thread)."""
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


def test_http_health_no_db() -> None:
    client = TestClient(create_app())
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_http_root_redirects_to_v3_mount() -> None:
    """``GET /`` returns 302 to ``/v3/`` so HTML is served with correct relative asset URLs."""
    client = TestClient(create_app())
    r = client.get("/", follow_redirects=False)
    assert r.status_code == 302
    assert r.headers.get("location") == "/v3/"
    r2 = client.get("/v3/", follow_redirects=False)
    assert r2.status_code == 200
    ct = r2.headers.get("content-type", "")
    assert "text/html" in ct
    assert b"Agents OS v3" in r2.content
    assert (
        b'<base href="/v3/"' in r2.content or b'<base href="./"' in r2.content
    )


def test_http_v3_index_and_shared_css_served() -> None:
    client = TestClient(create_app())
    r = client.get("/v3/index.html")
    assert r.status_code == 200
    r2 = client.get("/agents_os/ui/css/pipeline-shared.css")
    assert r2.status_code == 200


def test_http_bare_api_prefix_redirects_not_404() -> None:
    client = TestClient(create_app())
    r = client.get("/api", follow_redirects=False, headers={"Accept": "text/html"})
    assert r.status_code == 307
    assert r.headers.get("location") == "/"
    r2 = client.get("/api/", follow_redirects=False, headers={"Accept": "application/json"})
    assert r2.status_code == 307
    assert r2.headers.get("location") == "/docs"


def test_http_missing_actor_header_post_runs() -> None:
    client = TestClient(create_app())
    r = client.post(
        "/api/runs",
        json={
            "work_package_id": "01JK8AOSV3WP0000000001",
            "domain_id": "01JK8AOSV3DOMAIN00000001",
        },
    )
    assert r.status_code == 400
    body = r.json()
    assert body["detail"]["code"] == "MISSING_ACTOR_HEADER"


@requires_aos_db
def test_http_get_teams_portfolio_8a(api_client: TestClient) -> None:
    r = api_client.get("/api/teams")
    assert r.status_code == 200
    data = r.json()
    assert "teams" in data
    ids = {t["team_id"] for t in data["teams"]}
    assert "team_10" in ids
    assert all("has_active_assignment" in t for t in data["teams"])


@requires_aos_db
def test_http_get_routing_rules(api_client: TestClient) -> None:
    r = api_client.get("/api/routing-rules")
    assert r.status_code == 200
    assert "routing_rules" in r.json()
    assert len(r.json()["routing_rules"]) >= 1


@requires_aos_db
def test_http_get_policies(api_client: TestClient) -> None:
    r = api_client.get("/api/policies")
    assert r.status_code == 200
    assert "policies" in r.json()


@requires_aos_db
def test_http_put_template_with_actor_header(api_client: TestClient, aos_db_conn: Any) -> None:
    tid = str(ULID())
    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO templates (
              id, gate_id, phase_id, domain_id, name, body_markdown, version, is_active, updated_at
            ) VALUES (%s, 'GATE_3', '3.1', NULL, 'pytest admin tpl', '# admin put smoke', 1, 1, NOW())
            """,
            (tid,),
        )
    aos_db_conn.commit()
    try:
        r = api_client.put(
            f"/api/templates/{tid}",
            headers={"X-Actor-Team-Id": "team_10"},
            json={},
        )
        assert r.status_code == 200
        assert r.json().get("id") == tid
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM templates WHERE id = %s", (tid,))
        aos_db_conn.commit()


@requires_aos_db
def test_http_get_prompt_when_run_exists(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    tpl_id = str(ULID())
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO templates (
              id, gate_id, phase_id, domain_id, name, body_markdown, version, is_active, updated_at
            ) VALUES (%s, 'GATE_0', '0.1', NULL, 'pytest prompt slot', '# HTTP prompt smoke', 1, 1, NOW())
            """,
            (tpl_id,),
        )
    aos_db_conn.commit()
    try:
        started = state_machine.initiate_run(
            aos_db_conn,
            work_package_id=wp,
            domain_id=dom,
            process_variant=None,
        )
        rid = str(started["run_id"])
        r = api_client.get(f"/api/runs/{rid}/prompt")
        assert r.status_code == 200, r.text
        body = r.json()
        assert "layers" in body
        assert "L1_template" in body["layers"]
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM templates WHERE id = %s", (tpl_id,))
        aos_db_conn.commit()
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_http_put_idea_status_forbidden_without_authority(api_client: TestClient, aos_db_conn: Any) -> None:
    iid = str(ULID())
    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO ideas (
              id, title, domain_id, idea_type, status, priority, submitted_by, submitted_at, updated_at
            ) VALUES (%s, %s, %s, 'FEATURE', 'NEW', 'MEDIUM', 'team_10', NOW(), NOW())
            """,
            (iid, "gate2 qa idea", "01JK8AOSV3DOMAIN00000001"),
        )
    aos_db_conn.commit()
    try:
        r = api_client.put(
            f"/api/ideas/{iid}",
            headers={"X-Actor-Team-Id": "team_10"},
            json={"status": "EVALUATING"},
        )
        assert r.status_code == 403
        assert r.json()["detail"]["code"] == "INSUFFICIENT_AUTHORITY"
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM ideas WHERE id = %s", (iid,))
        aos_db_conn.commit()


@requires_aos_db
def test_http_state_invalid_domain_returns_404(api_client: TestClient) -> None:
    r = api_client.get(
        "/api/state",
        params={"domain_id": "NONEXISTENT_XXX"},
        headers={"X-Actor-Team-Id": "team_00"},
    )
    assert r.status_code == 404
    assert r.json()["detail"]["code"] == "DOMAIN_NOT_FOUND"


@requires_aos_db
def test_http_runs_invalid_domain_returns_404(api_client: TestClient) -> None:
    r = api_client.get(
        "/api/runs",
        params={"domain_id": "NONEXISTENT_XXX"},
        headers={"X-Actor-Team-Id": "team_00"},
    )
    assert r.status_code == 404
    assert r.json()["detail"]["code"] == "DOMAIN_NOT_FOUND"
