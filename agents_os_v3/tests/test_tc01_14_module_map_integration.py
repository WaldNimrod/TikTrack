"""
Module Map Integration Spec v1.0.1 §7 (TC-01..TC-14) + Process Map D.3 — pytest traceability.

| TC-ID | Summary | SSOT reference | Pytest function |
|-------|---------|----------------|-----------------|
| TC-01 | Full run happy path → COMPLETE | Module Map §7 row TC-01; Process Map D.3 | test_tc01_full_run_happy_path_complete |
| TC-02 | Blocking fail + correction + resolve | §7 TC-02; UC-04/09/11 | test_tc02_blocking_fail_correction_resubmit_advance |
| TC-03 | Advisory fail (non-blocking) | §7 TC-03; UC-05 | test_tc03_advisory_fail_stays_in_progress |
| TC-04 | HITL gate approval (GATE_4) | §7 TC-04; UC-06 | test_tc04_human_gate_principal_approve |
| TC-05 | Pause + resume (snapshot branch A) | §7 TC-05; UC-07/08 | test_tc05_pause_resume_gate_unchanged |
| TC-06 | PAUSED actor=null + sentinel | §7 TC-06; UC-13 AD-S5-02 | test_tc06_paused_state_actor_null_sentinel |
| TC-07 | Sentinel bypass routing | §7 TC-07; AD-S5-05 | test_tc07_sentinel_bypass_routing |
| TC-08 | ROUTING_UNRESOLVED (no rule) | §7 TC-08; UC-01 | test_tc08_routing_unresolved_on_initiate |
| TC-09 | Atomic TX rollback AD-S7-01 | §7 TC-09; AD-S7-01 | test_tc09_atomic_tx_rollback_on_ledger_fail |
| TC-10 | Principal override FORCE_PASS from CORRECTION | §7 TC-10; UC-12 | test_tc10_principal_override_force_pass_from_correction |
| TC-11 | Admin template update (version bump) | §7 TC-11; OQ-S3-02 | test_tc11_admin_template_update_version_bump |
| TC-12 | Max correction cycles → escalation | §7 TC-12; UC-09/10 | test_tc12_max_correction_cycles_escalation_on_resubmit |
| TC-13 | GetHistory pagination + event_type filter | §7 TC-13; UC-14 | test_tc13_get_history_pagination_filtered_total |
| TC-14 | Wrong actor on advance | §7 TC-14; UC-02 | test_tc14_wrong_actor_advance_forbidden |

Requires AOS_V3_DATABASE_URL. API integration (TestClient), not browser E2E.
"""

from __future__ import annotations

import json
from collections.abc import Generator
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
    assert_ad_s7_01_atomic_rollback,
    assert_tc07_sentinel_bypass_resolver,
    delete_routing_rules_by_ids,
    drive_from_0_1_to_4_1,
    hdr,
    http_advance_pass,
    http_clear_pending_feedback,
    http_feedback_pass,
    insert_blocking_authority_for_gate0,
    insert_linear_track_routing_rules,
    restore_pipeline_role_block_and_delete_gra,
    seed_extra_phase_passed_events,
)

# Global GATE_0 fallback (definition.yaml) — TC-08 removes it temporarily to force ROUTING_UNRESOLVED.
GLOBAL_GATE0_FALLBACK_RR_ID = "01JK8AOSV3RR0000000003"


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
def test_tc01_full_run_happy_path_complete(api_client: TestClient, aos_db_conn: Any) -> None:
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
        assert r0.status_code == 201, r0.text
        rid = r0.json()["run_id"]
        drive_from_0_1_to_4_1(api_client, rid)
        ra = api_client.post(
            f"/api/runs/{rid}/approve",
            headers=hdr("team_00"),
            json={"approval_notes": "TC-04/TC-01 HITL leg"},
        )
        assert ra.status_code == 200, ra.text
        http_feedback_pass(api_client, rid)
        r_done = http_advance_pass(api_client, rid)
        http_clear_pending_feedback(api_client, rid)
        assert r_done.get("status") == "COMPLETE"
        rg = api_client.get(f"/api/runs/{rid}")
        assert rg.json()["status"] == "COMPLETE"
        rh = api_client.get(f"/api/history?run_id={rid}&limit=200&order=desc")
        assert rh.status_code == 200
        types = {e["event_type"] for e in rh.json()["events"]}
        assert "RUN_INITIATED" in types
        assert "PHASE_PASSED" in types
        assert "GATE_APPROVED" in types
        assert "RUN_COMPLETED" in types
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc02_blocking_fail_correction_resubmit_advance(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    gra_id = str(ULID())
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    prev_block = 0
    try:
        prev_block = insert_blocking_authority_for_gate0(aos_db_conn, domain_id=dom, gra_id=gra_id)
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        assert r0.status_code == 201, r0.text
        rid = r0.json()["run_id"]
        rf = api_client.post(
            f"/api/runs/{rid}/fail",
            headers=hdr("team_11"),
            json={"reason": "blocking TC-02", "findings": []},
        )
        assert rf.status_code == 200, rf.text
        assert rf.json()["status"] == "CORRECTION"
        assert rf.json()["correction_cycle_count"] == 1
        rr = api_client.post(
            f"/api/runs/{rid}/advance",
            headers=hdr("team_11"),
            json={"verdict": "resubmit"},
        )
        assert rr.status_code == 200, rr.text
        assert rr.json()["status"] == "IN_PROGRESS"
        http_feedback_pass(api_client, rid)
        ra = http_advance_pass(api_client, rid)
        assert ra["current_gate_id"] == "GATE_0"
        assert ra["current_phase_id"] == "0.2"
    finally:
        restore_pipeline_role_block_and_delete_gra(aos_db_conn, gra_id=gra_id, prev_can_block=prev_block)
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc03_advisory_fail_stays_in_progress(api_client: TestClient, aos_db_conn: Any) -> None:
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
        rf = api_client.post(
            f"/api/runs/{rid}/fail",
            headers=hdr("team_11"),
            json={"reason": "advisory TC-03", "findings": []},
        )
        assert rf.status_code == 200, rf.text
        assert rf.json()["status"] == "IN_PROGRESS"
        assert rf.json()["advisory_logged"] is True
        rh = api_client.get(f"/api/history?run_id={rid}&limit=5&order=desc")
        assert rh.json()["events"][0]["event_type"] == "GATE_FAILED_ADVISORY"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc04_human_gate_principal_approve(api_client: TestClient, aos_db_conn: Any) -> None:
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
        ra = api_client.post(
            f"/api/runs/{rid}/approve",
            headers=hdr("team_00"),
            json={"approval_notes": "TC-04"},
        )
        assert ra.status_code == 200, ra.text
        body = ra.json()
        assert body["current_gate_id"] == "GATE_5"
        assert body["current_phase_id"] == "5.1"
        rh = api_client.get(f"/api/history?run_id={rid}&limit=3&order=desc")
        assert any(e["event_type"] == "GATE_APPROVED" for e in rh.json()["events"])
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc05_pause_resume_gate_unchanged(api_client: TestClient, aos_db_conn: Any) -> None:
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
        http_feedback_pass(api_client, rid)
        http_advance_pass(api_client, rid)
        http_clear_pending_feedback(api_client, rid)
        g1 = api_client.get(f"/api/runs/{rid}").json()
        rp = api_client.post(
            f"/api/runs/{rid}/pause",
            headers=hdr("team_00"),
            json={"pause_reason": "TC-05 pause"},
        )
        assert rp.status_code == 200, rp.text
        rr = api_client.post(
            f"/api/runs/{rid}/resume",
            headers=hdr("team_00"),
            json={"resume_notes": ""},
        )
        assert rr.status_code == 200, rr.text
        g2 = api_client.get(f"/api/runs/{rid}").json()
        assert g2["current_gate_id"] == g1["current_gate_id"]
        assert g2["current_phase_id"] == g1["current_phase_id"]
        assert g2["status"] == "IN_PROGRESS"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc06_paused_state_actor_null_sentinel(api_client: TestClient, aos_db_conn: Any) -> None:
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
            json={"pause_reason": "TC-06"},
        )
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "UPDATE runs SET lod200_author_team = %s WHERE id = %s",
                ("team_00", rid),
            )
        aos_db_conn.commit()
        rs = api_client.get(f"/api/state?run_id={rid}", headers=hdr("team_11"))
        assert rs.status_code == 200, rs.text
        sj = rs.json()
        assert sj["actor"] is None
        assert sj["sentinel"]["active"] is True
        assert sj["sentinel"]["override_team"] == "team_00"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


def test_tc07_sentinel_bypass_routing() -> None:
    assert_tc07_sentinel_bypass_resolver()


@requires_aos_db
def test_tc08_routing_unresolved_on_initiate(api_client: TestClient, aos_db_conn: Any) -> None:
    did = str(ULID())
    wp = str(ULID())
    slug = f"pytest_norr_{did[:8].lower()}"
    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO domains (id, slug, display_name, default_variant, doc_team_id, is_active, created_at)
            VALUES (%s, %s, 'No routing domain', 'TRACK_FULL', NULL, 1, NOW())
            """,
            (did, slug),
        )
        cur.execute(
            """
            INSERT INTO work_packages (id, label, domain_id, status, linked_run_id, created_at, updated_at)
            VALUES (%s, 'pytest no rr', %s, 'PLANNED', NULL, NOW(), NOW())
            """,
            (wp, did),
        )
        cur.execute(
            "DELETE FROM routing_rules WHERE id = %s",
            (GLOBAL_GATE0_FALLBACK_RR_ID,),
        )
    aos_db_conn.commit()
    try:
        r = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": did},
        )
        assert r.status_code == 500
        assert r.json()["detail"]["code"] == "ROUTING_UNRESOLVED"
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO routing_rules (
                  id, gate_id, phase_id, domain_id, variant, role_id, priority, resolve_from_state_key, created_at
                ) VALUES (%s, 'GATE_0', NULL, NULL, NULL, %s, 100, NULL, NOW())
                ON CONFLICT (id) DO NOTHING
                """,
                (GLOBAL_GATE0_FALLBACK_RR_ID, ORCH_ROLE_ID),
            )
            cur.execute("DELETE FROM work_packages WHERE id = %s", (wp,))
            cur.execute("DELETE FROM domains WHERE id = %s", (did,))
        aos_db_conn.commit()


@requires_aos_db
def test_tc09_atomic_tx_rollback_on_ledger_fail(aos_db_conn: Any) -> None:
    assert_ad_s7_01_atomic_rollback(aos_db_conn, "01JK8AOSV3DOMAIN00000002")


@requires_aos_db
def test_tc10_principal_override_force_pass_from_correction(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    gra_id = str(ULID())
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    prev_block = 0
    try:
        prev_block = insert_blocking_authority_for_gate0(aos_db_conn, domain_id=dom, gra_id=gra_id)
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        api_client.post(
            f"/api/runs/{rid}/fail",
            headers=hdr("team_11"),
            json={"reason": "TC-10 block", "findings": []},
        )
        ro = api_client.post(
            f"/api/runs/{rid}/override",
            headers=hdr("team_00"),
            json={
                "actor_team_id": "team_00",
                "action": "FORCE_PASS",
                "reason": "principal TC-10",
            },
        )
        assert ro.status_code == 200, ro.text
        assert ro.json()["event_type"] == "PRINCIPAL_OVERRIDE"
        rh = api_client.get(f"/api/history?run_id={rid}&limit=5&order=desc")
        ev = next(e for e in rh.json()["events"] if e["event_type"] == "PRINCIPAL_OVERRIDE")
        pj = ev.get("payload_json") or {}
        assert pj.get("action") == "FORCE_PASS"
        assert pj.get("from_state") == "CORRECTION"
        assert pj.get("to_state") == "IN_PROGRESS"
    finally:
        restore_pipeline_role_block_and_delete_gra(aos_db_conn, gra_id=gra_id, prev_can_block=prev_block)
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc11_admin_template_update_version_bump(api_client: TestClient, aos_db_conn: Any) -> None:
    tid = str(ULID())
    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO templates (
              id, gate_id, phase_id, domain_id, name, body_markdown, version, is_active, updated_at
            ) VALUES (%s, 'GATE_3', '3.1', NULL, 'TC-11 tpl', '# v1', 1, 1, NOW())
            """,
            (tid,),
        )
    aos_db_conn.commit()
    try:
        with aos_db_conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS c FROM events")
            n_before = int(cur.fetchone()["c"])
        r = api_client.put(
            f"/api/templates/{tid}",
            headers=hdr("team_00"),
            json={"body_markdown": "# v2 TC-11", "version": 2},
        )
        assert r.status_code == 200, r.text
        row = r.json()
        assert int(row["version"]) == 2
        assert "TC-11" in row["body_markdown"]
        with aos_db_conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS c FROM events")
            n_after = int(cur.fetchone()["c"])
        assert n_after == n_before
    finally:
        with aos_db_conn.cursor() as cur:
            cur.execute("DELETE FROM templates WHERE id = %s", (tid,))
        aos_db_conn.commit()


@requires_aos_db
def test_tc12_max_correction_cycles_escalation_on_resubmit(api_client: TestClient, aos_db_conn: Any) -> None:
    dom = "01JK8AOSV3DOMAIN00000001"
    gra_id = str(ULID())
    pol_id = "01JK8AOSV3POL00000000001"
    clear_in_progress_runs_for_domain(aos_db_conn, dom)
    rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)
    wp = insert_temp_wp(aos_db_conn, dom)
    prev_block = 0
    old_json: str | None = None
    try:
        with aos_db_conn.cursor() as cur:
            cur.execute(
                "SELECT policy_value_json FROM policies WHERE id = %s",
                (pol_id,),
            )
            old_json = str(cur.fetchone()["policy_value_json"])
            cur.execute(
                "UPDATE policies SET policy_value_json = %s WHERE id = %s",
                (json.dumps({"max": 1}), pol_id),
            )
        aos_db_conn.commit()
        prev_block = insert_blocking_authority_for_gate0(aos_db_conn, domain_id=dom, gra_id=gra_id)
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        rid = r0.json()["run_id"]
        api_client.post(
            f"/api/runs/{rid}/fail",
            headers=hdr("team_11"),
            json={"reason": "TC-12", "findings": []},
        )
        rs = api_client.post(
            f"/api/runs/{rid}/advance",
            headers=hdr("team_11"),
            json={"verdict": "resubmit"},
        )
        assert rs.status_code == 200, rs.text
        rh = api_client.get(f"/api/history?run_id={rid}&limit=10&order=desc")
        types = [e["event_type"] for e in rh.json()["events"]]
        assert "CORRECTION_ESCALATED" in types
        rg = api_client.get(f"/api/runs/{rid}")
        assert rg.json()["status"] == "CORRECTION"
    finally:
        restore_pipeline_role_block_and_delete_gra(aos_db_conn, gra_id=gra_id, prev_can_block=prev_block)
        if old_json is not None:
            with aos_db_conn.cursor() as cur:
                cur.execute(
                    "UPDATE policies SET policy_value_json = %s WHERE id = %s",
                    (old_json, pol_id),
                )
            aos_db_conn.commit()
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc13_get_history_pagination_filtered_total(api_client: TestClient, aos_db_conn: Any) -> None:
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
        seed_extra_phase_passed_events(
            aos_db_conn,
            run_id=rid,
            work_package_id=wp,
            domain_id=dom,
            count=25,
            start_seq=2,
        )
        rh = api_client.get(
            f"/api/history?run_id={rid}&event_type=PHASE_PASSED&limit=10&offset=10&order=desc",
        )
        assert rh.status_code == 200, rh.text
        data = rh.json()
        assert data["total"] == 25
        assert data["limit"] == 10
        assert data["offset"] == 10
        assert len(data["events"]) == 10
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)


@requires_aos_db
def test_tc14_wrong_actor_advance_forbidden(api_client: TestClient, aos_db_conn: Any) -> None:
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
        http_feedback_pass(api_client, rid)
        rx = api_client.post(
            f"/api/runs/{rid}/advance",
            headers=hdr("team_10"),
            json={"verdict": "pass"},
        )
        assert rx.status_code == 403
        assert rx.json()["detail"]["code"] == "WRONG_ACTOR"
    finally:
        purge_work_package(aos_db_conn, wp)
        delete_routing_rules_by_ids(aos_db_conn, rr_ids)
