"""
GATE_4 — TC-19..TC-26 (UI Spec Amendment v1.1.1 §17) via HTTP + Postgres.

TC-19..TC-21: re-exported from GATE_3 module for pytest collection under GATE_4 traceability.
TC-22..TC-26: API coverage for GATE_4 handoff.
"""

from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection
from agents_os_v3.modules.state import machine as state_machine

from .conftest import requires_aos_db
from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package

# TC-19..TC-21: see test_gate3_tc15_21_api.py (GATE_3 suite; not re-imported to avoid duplicate collection).


def _hdr(team_id: str = "team_11") -> dict[str, str]:
    return {"X-Actor-Team-Id": team_id}


@pytest.fixture
def api_client():
    app = create_app()

    def _db_override():
        c = db_connection()
        try:
            yield c
        finally:
            c.close()

    app.dependency_overrides[_db_conn] = _db_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


def _new_run(aos_db_conn: Any) -> tuple[str, str]:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    started = state_machine.initiate_run(
        aos_db_conn,
        work_package_id=wp,
        domain_id=dom,
        process_variant=None,
    )
    return wp, str(started["run_id"])


@requires_aos_db
def test_tc22_put_engine_non_principal_forbidden(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-22 — PUT /teams/{id}/engine as non-team_00 → 403 INSUFFICIENT_AUTHORITY."""
    _ = aos_db_conn
    r = api_client.put(
        "/api/teams/team_21/engine",
        headers=_hdr("team_21"),
        json={"engine": "codex"},
    )
    assert r.status_code == 403, r.text
    assert r.json()["detail"]["code"] == "INSUFFICIENT_AUTHORITY"


@requires_aos_db
def test_tc23_post_idea_domain_and_bug_type(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-23 — POST /ideas with domain_id + idea_type=BUG → 201 + fields echoed."""
    dom = "01JK8AOSV3DOMAIN00000001"
    r = api_client.post(
        "/api/ideas",
        headers=_hdr("team_10"),
        json={
            "title": "GATE_4 TC-23 bug",
            "description": "qa",
            "domain_id": dom,
            "idea_type": "BUG",
            "priority": "HIGH",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["domain_id"] == dom
    assert body["idea_type"] == "BUG"
    iid = body["idea_id"]
    try:
        pass
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM ideas WHERE id = %s", (iid,))
        aos_db_conn.commit()


@requires_aos_db
def test_tc24_post_idea_invalid_type(api_client: TestClient) -> None:
    """TC-24 — invalid idea_type → 400 INVALID_IDEA_TYPE."""
    r = api_client.post(
        "/api/ideas",
        headers=_hdr(),
        json={"title": "x", "idea_type": "INVALID"},
    )
    assert r.status_code == 400, r.text
    assert r.json()["detail"]["code"] == "INVALID_IDEA_TYPE"


@requires_aos_db
def test_tc25_work_package_detail_linked_run(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-25 — GET /work-packages/{id} includes linked_run when WP linked to active run."""
    dom = "01JK8AOSV3DOMAIN00000001"
    wp, rid = _new_run(aos_db_conn)
    try:
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "UPDATE work_packages SET linked_run_id = %s WHERE id = %s",
                (rid, wp),
            )
        aos_db_conn.commit()
        r = api_client.get(f"/api/work-packages/{wp}")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["linked_run_id"] == rid
        lr = body.get("linked_run")
        assert lr is not None
        assert lr["run_id"] == rid
        assert lr["status"] == "IN_PROGRESS"
        assert lr.get("current_gate_id") is not None
    finally:
        purge_work_package(aos_db_conn, wp)


@requires_aos_db
def test_tc26_runs_filter_by_current_gate_id(api_client: TestClient, aos_db_conn: Any) -> None:
    """TC-26 — GET /api/runs?current_gate_id=GATE_3 filters runs (Portfolio Active Runs API)."""
    dom1 = "01JK8AOSV3DOMAIN00000001"
    dom2 = "01JK8AOSV3DOMAIN00000002"
    clear_in_progress_runs_for_domain(aos_db_conn, dom1)
    clear_in_progress_runs_for_domain(aos_db_conn, dom2)
    wp1 = insert_temp_wp(aos_db_conn, dom1)
    wp2 = insert_temp_wp(aos_db_conn, dom2)
    try:
        s1 = state_machine.initiate_run(
            aos_db_conn, work_package_id=wp1, domain_id=dom1, process_variant=None
        )
        s2 = state_machine.initiate_run(
            aos_db_conn, work_package_id=wp2, domain_id=dom2, process_variant=None
        )
        r1 = str(s1["run_id"])
        r2 = str(s2["run_id"])
        ph2 = "pytest_tc26_ph2"
        ph3 = "pytest_tc26_ph3"
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM phases WHERE gate_id = %s ORDER BY sequence_order LIMIT 1",
                ("GATE_2",),
            )
            row2 = cur.fetchone()
            if row2:
                ph2 = str(row2["id"])
            else:
                cur.execute(
                    """
                    INSERT INTO phases (id, gate_id, sequence_order, name, allow_auto, display_in_ui)
                    VALUES (%s, 'GATE_2', 99, 'pytest TC-26', 0, 1)
                    """,
                    (ph2,),
                )
            cur.execute(
                "SELECT id FROM phases WHERE gate_id = %s ORDER BY sequence_order LIMIT 1",
                ("GATE_3",),
            )
            row3 = cur.fetchone()
            if row3:
                ph3 = str(row3["id"])
            else:
                cur.execute(
                    """
                    INSERT INTO phases (id, gate_id, sequence_order, name, allow_auto, display_in_ui)
                    VALUES (%s, 'GATE_3', 99, 'pytest TC-26', 0, 1)
                    """,
                    (ph3,),
                )
            cur.execute(
                "UPDATE runs SET current_gate_id = %s, current_phase_id = %s WHERE id = %s",
                ("GATE_2", ph2, r1),
            )
            cur.execute(
                "UPDATE runs SET current_gate_id = %s, current_phase_id = %s WHERE id = %s",
                ("GATE_3", ph3, r2),
            )
        aos_db_conn.commit()
        r = api_client.get(
            "/api/runs",
            params={"status": "IN_PROGRESS", "current_gate_id": "GATE_3", "limit": 50},
        )
        assert r.status_code == 200, r.text
        runs = r.json()["runs"]
        ids = {x["run_id"] for x in runs}
        assert r2 in ids
        assert r1 not in ids
        for x in runs:
            if x["run_id"] == r2:
                assert x["current_gate_id"] == "GATE_3"
    finally:
        purge_work_package(aos_db_conn, wp1)
        purge_work_package(aos_db_conn, wp2)
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "DELETE FROM phases WHERE id IN (%s, %s)",
                ("pytest_tc26_ph2", "pytest_tc26_ph3"),
            )
        aos_db_conn.commit()
