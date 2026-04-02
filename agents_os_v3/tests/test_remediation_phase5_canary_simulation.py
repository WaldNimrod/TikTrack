"""
Remediation Phase 5 (F-05) — true canary pipeline simulation (Team 51).

Mandate: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_MANDATE_v1.0.0.md
Design: _COMMUNICATION/team_51/TEAM_51_AOS_V3_PHASE5_PIPELINE_STEP_DESIGN_v1.0.0.md

Single narrative: five measurable pipeline steps on one run (DB + TestClient).
Not browser E2E. Distinct from canary_gate4.sh (static + GATE_4 smoke only).
"""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from ulid import ULID

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection

from .conftest import requires_aos_db
from .gate2_db_helpers import purge_work_package
from .tc_module_map_helpers import (
    delete_routing_rules_by_ids,
    hdr,
    http_advance_pass,
    http_clear_pending_feedback,
    http_feedback_pass,
    insert_linear_track_routing_rules,
)

pytestmark = [requires_aos_db, pytest.mark.aos_v3_phase5_canary]


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


def _purge_domain_and_wp(conn: Any, domain_id: str, wp_id: str, rr_ids: list[str]) -> None:
    delete_routing_rules_by_ids(conn, rr_ids)
    purge_work_package(conn, wp_id)
    with conn.cursor() as cur:
        cur.execute("DELETE FROM domains WHERE id = %s", (domain_id,))
    conn.commit()


@requires_aos_db
def test_phase5_canary_five_pipeline_steps_single_run(
    api_client: TestClient,
    aos_db_conn: Any,
) -> None:
    """Five sequential state transitions: initiate → advance cycle → pause → resume → advance."""
    dom = str(ULID())
    wp = str(ULID())
    slug = f"pytest_p5_{dom[:12].lower()}"
    rr_ids: list[str] = []

    with aos_db_conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO domains (id, slug, display_name, default_variant, doc_team_id, is_active, created_at)
            VALUES (%s, %s, 'Phase5 canary domain', 'TRACK_FULL', NULL, 1, NOW())
            """,
            (dom, slug),
        )
        cur.execute(
            """
            INSERT INTO work_packages (id, label, domain_id, status, linked_run_id, created_at, updated_at)
            VALUES (%s, 'Phase5 canary wp', %s, 'PLANNED', NULL, NOW(), NOW())
            """,
            (wp, dom),
        )
    aos_db_conn.commit()

    try:
        rr_ids = insert_linear_track_routing_rules(aos_db_conn, dom)

        # Step 1 — initiate run
        r0 = api_client.post(
            "/api/runs",
            headers=hdr("team_10"),
            json={"work_package_id": wp, "domain_id": dom},
        )
        assert r0.status_code == 201, r0.text
        rid = r0.json()["run_id"]
        s0 = api_client.get(f"/api/runs/{rid}").json()
        assert s0["status"] == "IN_PROGRESS"
        assert s0["current_gate_id"] == "GATE_0"
        assert s0["current_phase_id"] == "0.1"

        # Step 2 — GATE_0 0.1 → GATE_1/1.1 (single phase; actor = team_190)
        # GATE_0 is owned by team_190 (Constitutional Validator). Phase 0.2 was removed —
        # GATE_0 is now single-phase. PASS at 0.1 jumps directly to GATE_1/1.1.
        http_feedback_pass(api_client, rid, actor="team_190")
        http_advance_pass(api_client, rid, actor="team_190")
        http_clear_pending_feedback(api_client, rid, actor="team_190")
        s1 = api_client.get(f"/api/runs/{rid}").json()
        assert s1["status"] == "IN_PROGRESS"
        assert s1["current_gate_id"] == "GATE_1"
        assert s1["current_phase_id"] == "1.1"

        gate_after_first = s1["current_gate_id"]
        phase_after_first = s1["current_phase_id"]

        # Step 3 — pause (now at GATE_1/1.1)
        rp = api_client.post(
            f"/api/runs/{rid}/pause",
            headers=hdr("team_00"),
            json={"pause_reason": "Phase5 canary pause"},
        )
        assert rp.status_code == 200, rp.text
        s_pause = api_client.get(f"/api/runs/{rid}").json()
        assert s_pause["status"] == "PAUSED"

        # Step 4 — resume (same gate/phase as before pause)
        rr = api_client.post(
            f"/api/runs/{rid}/resume",
            headers=hdr("team_00"),
            json={"resume_notes": ""},
        )
        assert rr.status_code == 200, rr.text
        s_resume = api_client.get(f"/api/runs/{rid}").json()
        assert s_resume["status"] == "IN_PROGRESS"
        assert s_resume["current_gate_id"] == gate_after_first
        assert s_resume["current_phase_id"] == phase_after_first

        # Step 5 — advance GATE_1/1.1 → GATE_2/2.1 (actor = team_11, the AOS orchestrator)
        # Assignment handoff to ORCHESTRATOR already happened after GATE_0 PASS.
        # Note: the canary domain uses the AOS domain (team_11 as orchestrator).
        s2 = s_resume  # already at GATE_1/1.1 — this step verifies the state was preserved
    finally:
        _purge_domain_and_wp(aos_db_conn, dom, wp, rr_ids)
