"""
Remediation Phase 2.2 — contract tests for Phase 1 endpoints (Option B paths, no /api/admin/).

API integration (FastAPI TestClient) only; not browser E2E (Phase 3).
"""

from __future__ import annotations

import json
from collections.abc import Generator
from datetime import datetime, timezone
from typing import Any

import pytest
from fastapi.testclient import TestClient
from ulid import ULID

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection

from .conftest import requires_aos_db
from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package
from .tc_module_map_helpers import (
    ORCH_ROLE_ID,
    delete_routing_rules_by_ids,
    drive_from_0_1_to_4_1,
    hdr,
    http_advance_pass,
    http_clear_pending_feedback,
    http_feedback_pass,
    insert_linear_track_routing_rules,
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


def _principal_override(
    client: TestClient,
    run_id: str,
    *,
    action: str,
    reason: str = "phase2 contract",
    snapshot: dict[str, Any] | None = None,
) -> Any:
    body: dict[str, Any] = {
        "actor_team_id": "team_00",
        "action": action,
        "reason": reason,
    }
    if snapshot is not None:
        body["snapshot"] = snapshot
    return client.post(
        f"/api/runs/{run_id}/override",
        headers=hdr("team_00"),
        json=body,
    )


@requires_aos_db
def test_phase2_get_team_detail_includes_hierarchy_and_assignment_flag(
    api_client: TestClient,
) -> None:
    r = api_client.get("/api/teams/team_10")
    assert r.status_code == 200, r.text
    b = r.json()
    for k in (
        "team_id",
        "label",
        "name",
        "engine",
        "group",
        "profession",
        "domain_scope",
        "parent_team_id",
        "children",
        "has_active_assignment",
    ):
        assert k in b


@requires_aos_db
def test_phase2_override_force_pass_in_progress_advances_phase(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        ro = _principal_override(api_client, rid, action="FORCE_PASS")
        assert ro.status_code == 200, ro.text
        assert ro.json()["to_status"] == "IN_PROGRESS"
        rg = api_client.get(f"/api/runs/{rid}").json()
        assert rg["current_phase_id"] == "0.2"
        rh = api_client.get(f"/api/history?run_id={rid}&limit=3&order=desc")
        ev = next(e for e in rh.json()["events"] if e["event_type"] == "PRINCIPAL_OVERRIDE")
        pj = ev.get("payload_json") or {}
        assert pj.get("action") == "FORCE_PASS"
        assert pj.get("from_state") == "IN_PROGRESS"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_override_force_pause_requires_snapshot(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        ro = _principal_override(api_client, rid, action="FORCE_PAUSE")
        assert ro.status_code == 400
        assert ro.json()["detail"]["code"] == "SNAPSHOT_REQUIRED"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_override_force_pause_with_valid_snapshot(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        cap = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        snap = {
            "captured_at": cap,
            "gate_id": "GATE_0",
            "phase_id": "0.1",
            "assignments": {
                ORCH_ROLE_ID: {"assignment_id": str(ULID()), "team_id": "team_10"},
            },
        }
        ro = _principal_override(api_client, rid, action="FORCE_PAUSE", snapshot=snap)
        assert ro.status_code == 200, ro.text
        assert ro.json()["to_status"] == "PAUSED"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_override_force_resume_after_pause(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        api_client.post(
            f"/api/runs/{rid}/pause",
            headers=hdr("team_00"),
            json={"pause_reason": "phase2 resume prep"},
        )
        rr = _principal_override(api_client, rid, action="FORCE_RESUME", reason="phase2 resume")
        assert rr.status_code == 200, rr.text
        assert rr.json()["to_status"] == "IN_PROGRESS"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_override_terminal_complete_returns_409(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        drive_from_0_1_to_4_1(api_client, rid)
        api_client.post(
            f"/api/runs/{rid}/approve",
            headers=hdr("team_00"),
            json={"approval_notes": "p2 terminal"},
        )
        http_feedback_pass(api_client, rid)
        http_advance_pass(api_client, rid)
        http_clear_pending_feedback(api_client, rid)
        ro = _principal_override(api_client, rid, action="FORCE_PASS", reason="should fail")
        assert ro.status_code == 409
        assert ro.json()["detail"]["code"] == "TERMINAL_STATE"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_override_force_fail_moves_to_correction(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    try:
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        ro = _principal_override(api_client, rid, action="FORCE_FAIL", reason="phase2 force fail")
        assert ro.status_code == 200, ro.text
        assert ro.json()["to_status"] == "CORRECTION"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_phase2_delete_routing_rule_team00_removes_from_list(api_client: TestClient, aos_db_conn: Any) -> None:
    pr = api_client.post(
        "/api/routing-rules",
        headers=hdr("team_10"),
        json={
            "gate_id": "GATE_2",
            "phase_id": "2.1",
            "domain_id": "01JK8AOSV3DOMAIN00000001",
            "role_id": ORCH_ROLE_ID,
            "priority": 1,
        },
    )
    assert pr.status_code == 201, pr.text
    rule_id = pr.json()["id"]
    try:
        before = api_client.get("/api/routing-rules").json()["routing_rules"]
        assert any(r["id"] == rule_id for r in before)
        d = api_client.delete(f"/api/routing-rules/{rule_id}", headers=hdr("team_00"))
        assert d.status_code == 200, d.text
        after = api_client.get("/api/routing-rules").json()["routing_rules"]
        assert not any(r["id"] == rule_id for r in after)
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM routing_rules WHERE id = %s", (rule_id,))
        aos_db_conn.commit()


@requires_aos_db
def test_phase2_put_policy_team00_updates_listed_value(api_client: TestClient, aos_db_conn: Any) -> None:
    pol_id = "01JK8AOSV3POL00000000001"
    with aos_db_conn.cursor() as cur:
        cur.execute("SELECT policy_value_json FROM policies WHERE id = %s", (pol_id,))
        old = str(cur.fetchone()["policy_value_json"])
    try:
        new_val = json.dumps({"max": 5, "phase2_marker": True})
        pu = api_client.put(
            f"/api/policies/{pol_id}",
            headers=hdr("team_00"),
            json={"policy_value_json": new_val},
        )
        assert pu.status_code == 200, pu.text
        lst = api_client.get("/api/policies").json()["policies"]
        row = next(p for p in lst if p["id"] == pol_id)
        assert json.loads(row["policy_value_json"])["phase2_marker"] is True
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "UPDATE policies SET policy_value_json = %s WHERE id = %s",
                (old, pol_id),
            )
        aos_db_conn.commit()
