"""
Phase 5 (F-05) — DB-backed pipeline canary (Remediation).

Single end-to-end happy path: initiate → five phase advances (0.1→4.1) → principal approve
→ final advance → COMPLETE. Covers pause/resume style flows in sibling TC modules; here we
validate the full linear canary expected in CI.

Traceability: TEAM_11 Remediation Phase 5; C-03 (≥5 transitions) satisfied via
``drive_from_0_1_to_4_1`` (five advance cycles) plus initiate, approve, and terminal advance.
"""

from __future__ import annotations

from typing import Any

import pytest
from fastapi.testclient import TestClient

from agents_os_v3.tests.conftest import requires_aos_db
from agents_os_v3.tests.gate2_db_helpers import (
    clear_in_progress_runs_for_domain,
    insert_temp_wp,
    purge_work_package,
)
from agents_os_v3.tests.tc_module_map_helpers import (
    delete_routing_rules_by_ids,
    drive_from_0_1_to_4_1,
    hdr,
    http_advance_pass,
    http_clear_pending_feedback,
    http_feedback_pass,
    insert_linear_track_routing_rules,
)

pytestmark = pytest.mark.aos_v3_canary_sim


@requires_aos_db
def test_phase5_canary_pipeline_happy_path(
    api_client: TestClient,
    aos_db_conn: Any,
) -> None:
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
            json={"approval_notes": "Phase 5 canary — HITL leg"},
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
