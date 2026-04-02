"""GATE_0 Entry Quality Gate — team_190 as actor, terminal reject_entry_run.

Tests:
- team_190 is the GATE_0 actor for both domains (tiktrack + agents_os)
- PASS at GATE_0 advances to GATE_1/1.1 with SPEC_AUTHOR (team_170) as next actor
- reject_entry_run → run=FAILED, wp=PLANNED, linked_run_id=NULL
- GATE0_REJECTED event emitted with reason
- guard: only at GATE_0
- guard: only when IN_PROGRESS
- guard: only team_190 or team_00
- WP can be restarted after GATE_0 rejection
- HTTP endpoint POST /runs/{run_id}/reject-entry
"""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest
from fastapi.testclient import TestClient
from ulid import ULID

from agents_os_v3.modules.management.api import _db_conn, create_app
from agents_os_v3.modules.management.db import connection as db_connection
from agents_os_v3.modules.state import machine as M
from agents_os_v3.modules.state.errors import StateMachineError

from .conftest import requires_aos_db
from .gate2_db_helpers import (
    clear_in_progress_runs_for_domain,
    insert_temp_wp,
    purge_work_package,
)

# Domain ULIDs from seed
DOMAIN_TIKTRACK = "01JK8AOSV3DOMAIN00000002"
DOMAIN_AOS = "01JK8AOSV3DOMAIN00000001"

TEAM_190 = "team_190"
TEAM_00 = "team_00"
TEAM_10 = "team_10"   # tiktrack orchestrator
TEAM_11 = "team_11"   # aos orchestrator


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def db_conn() -> Generator[Any, None, None]:
    """Real DB connection for state-machine tests — cleans up after each test."""
    conn = db_connection()
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture
def api_client() -> Generator[TestClient, None, None]:
    """FastAPI TestClient with real DB connection."""
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


def _start_run(conn: Any, domain_id: str, wp_id: str) -> str:
    """Helper: initiate a run and return run_id."""
    result = M.initiate_run(conn, work_package_id=wp_id, domain_id=domain_id, process_variant=None)
    return result["run_id"]


# ── TC-G0-01: team_190 is actor after initiate_run (tiktrack) ────────────────

@requires_aos_db
def test_gate0_actor_is_team190_tiktrack(db_conn: Any) -> None:
    """After initiate_run for tiktrack domain, GATE_0 actor must be team_190."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        with db_conn.cursor() as cur:
            # Check assignment: role CONSTITUTIONAL_VALIDATOR → team_190
            cur.execute(
                "SELECT team_id, role_id FROM assignments WHERE work_package_id = %s AND status = 'ACTIVE'",
                (wp_id,),
            )
            row = cur.fetchone()
        assert row is not None, "No active assignment found"
        assert str(row["team_id"]) == TEAM_190, f"Expected team_190 got {row['team_id']}"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-02: team_190 is actor after initiate_run (agents_os) ───────────────

@requires_aos_db
def test_gate0_actor_is_team190_aos(db_conn: Any) -> None:
    """After initiate_run for agents_os domain, GATE_0 actor must also be team_190."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_AOS)
    wp_id = insert_temp_wp(db_conn, DOMAIN_AOS)
    try:
        run_id = _start_run(db_conn, DOMAIN_AOS, wp_id)
        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT team_id FROM assignments WHERE work_package_id = %s AND status = 'ACTIVE'",
                (wp_id,),
            )
            row = cur.fetchone()
        assert row is not None
        assert str(row["team_id"]) == TEAM_190, f"Expected team_190 got {row['team_id']}"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-03: PASS at GATE_0 → GATE_1 with ORCHESTRATOR actor ───────────────

@requires_aos_db
def test_gate0_pass_advances_to_gate1_with_spec_author(db_conn: Any) -> None:
    """After advance(pass) at GATE_0, run moves to GATE_1/1.1 with team_170 as actor (tiktrack).

    GATE_1/1.1 is owned by SPEC_AUTHOR role → team_170 for both domains.
    team_10 (ORCHESTRATOR) is no longer active at GATE_1 — it starts at GATE_3.
    """
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        # GATE_0 is single-phase (0.1 only — phase 0.2 was deprecated and removed).
        # One advance: 0.1 → GATE_1/1.1 (crosses gate, assignment handoff to SPEC_AUTHOR)
        M.advance_run(
            db_conn,
            run_id=run_id,
            actor_team_id=TEAM_190,
            verdict="pass",
            summary="Spec meets all entry criteria.",
        )
        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT current_gate_id, current_phase_id, status FROM runs WHERE id = %s",
                (run_id,),
            )
            run = dict(cur.fetchone())
            cur.execute(
                "SELECT team_id FROM assignments WHERE work_package_id = %s AND status = 'ACTIVE'",
                (wp_id,),
            )
            asgn = cur.fetchone()
        assert run["current_gate_id"] == "GATE_1", f"Expected GATE_1 got {run['current_gate_id']}"
        assert run["current_phase_id"] == "1.1", f"Expected 1.1 got {run['current_phase_id']}"
        assert run["status"] == "IN_PROGRESS"
        # SPEC_AUTHOR for tiktrack = team_170
        assert asgn is not None
        assert str(asgn["team_id"]) == "team_170", f"Expected team_170 (SPEC_AUTHOR) got {asgn['team_id']}"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-04: reject_entry_run → run=FAILED, WP=PLANNED, linked_run=NULL ─────

@requires_aos_db
def test_gate0_reject_resets_wp_to_planned(db_conn: Any) -> None:
    """reject_entry_run terminates the run (FAILED); WP stays ACTIVE + linked (effective=GATE0_REJECTED)."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        result = M.reject_entry_run(
            db_conn,
            run_id=run_id,
            actor_team_id=TEAM_190,
            reason="Spec missing measurable ACs for deliverable D-03.",
        )
        assert result["status"] == "FAILED"
        assert result["wp_status"] == "GATE0_REJECTED"
        assert result["run_id"] == run_id

        with db_conn.cursor() as cur:
            cur.execute("SELECT status FROM runs WHERE id = %s", (run_id,))
            run = dict(cur.fetchone())
            cur.execute("SELECT status, linked_run_id FROM work_packages WHERE id = %s", (wp_id,))
            wp = dict(cur.fetchone())

        assert run["status"] == "FAILED", f"Expected FAILED got {run['status']}"
        assert wp["status"] == "ACTIVE", f"Expected ACTIVE got {wp['status']}"
        assert str(wp["linked_run_id"]) == run_id, "WP must stay linked to FAILED run for history"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-05: GATE0_REJECTED event is emitted ────────────────────────────────

@requires_aos_db
def test_gate0_reject_emits_gate0_rejected_event(db_conn: Any) -> None:
    """reject_entry_run emits a GATE0_REJECTED event with the rejection reason."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    rejection_reason = "LOD200 missing: no domain declared, no acceptance criteria."
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        M.reject_entry_run(
            db_conn,
            run_id=run_id,
            actor_team_id=TEAM_190,
            reason=rejection_reason,
        )
        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT event_type, verdict, reason, actor_team_id FROM events WHERE run_id = %s AND event_type = 'GATE0_REJECTED'",
                (run_id,),
            )
            ev = cur.fetchone()
        assert ev is not None, "GATE0_REJECTED event not found"
        assert str(ev["event_type"]) == "GATE0_REJECTED"
        assert str(ev["verdict"]) == "fail"
        assert rejection_reason in str(ev["reason"])
        assert str(ev["actor_team_id"]) == TEAM_190
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-06: reject only at GATE_0 ─────────────────────────────────────────

@requires_aos_db
def test_gate0_reject_only_allowed_at_gate0(db_conn: Any) -> None:
    """reject_entry_run raises GATE0_REJECT_ONLY_AT_GATE0 when gate != GATE_0."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        # GATE_0 is single-phase (0.1 only) — one advance to reach GATE_1
        M.advance_run(db_conn, run_id=run_id, actor_team_id=TEAM_190, verdict="pass", summary="OK")
        # Now at GATE_1 — try to reject — should fail (no longer at GATE_0)
        with pytest.raises(StateMachineError) as exc_info:
            M.reject_entry_run(db_conn, run_id=run_id, actor_team_id=TEAM_190, reason="Late reject")
        assert exc_info.value.code == "GATE0_REJECT_ONLY_AT_GATE0"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-07: reject requires IN_PROGRESS ────────────────────────────────────

@requires_aos_db
def test_gate0_reject_requires_in_progress(db_conn: Any) -> None:
    """reject_entry_run raises INVALID_STATE when run is not IN_PROGRESS."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        # Force-pause the run first
        M.pause_run(
            db_conn,
            run_id=run_id,
            actor_team_id=TEAM_00,
            snapshot=None,
        )
    except Exception:
        # pause may require a snapshot — just manually update run status to PAUSED for this test
        with db_conn.cursor() as cur:
            cur.execute("UPDATE runs SET status = 'PAUSED', paused_at = NOW(), paused_routing_snapshot_json = '{}' WHERE id = %s", (run_id,))
        db_conn.commit()

    try:
        with pytest.raises(StateMachineError) as exc_info:
            M.reject_entry_run(db_conn, run_id=run_id, actor_team_id=TEAM_190, reason="Reject from PAUSED")
        assert exc_info.value.code == "INVALID_STATE"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-08: only team_190 or team_00 can reject ───────────────────────────

@requires_aos_db
def test_gate0_reject_unauthorized_actor(db_conn: Any) -> None:
    """reject_entry_run raises UNAUTHORIZED_ACTOR when actor is not team_190 or team_00."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        with pytest.raises(StateMachineError) as exc_info:
            M.reject_entry_run(db_conn, run_id=run_id, actor_team_id=TEAM_10, reason="Unauthorized reject")
        assert exc_info.value.code == "UNAUTHORIZED_ACTOR"
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-09: team_00 (principal) can also reject ───────────────────────────

@requires_aos_db
def test_gate0_reject_allows_team00(db_conn: Any) -> None:
    """team_00 (principal) can also reject a GATE_0 run."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        run_id = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        result = M.reject_entry_run(
            db_conn,
            run_id=run_id,
            actor_team_id=TEAM_00,
            reason="Principal override: spec fails Iron Rules.",
        )
        assert result["status"] == "FAILED"
        with db_conn.cursor() as cur:
            cur.execute("SELECT actor_team_id, actor_type FROM events WHERE run_id = %s AND event_type = 'GATE0_REJECTED'", (run_id,))
            ev = dict(cur.fetchone())
        assert str(ev["actor_team_id"]) == TEAM_00
        assert str(ev["actor_type"]) == "human"  # team_00 = human
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-10: rejected WP can be restarted ───────────────────────────────────

@requires_aos_db
def test_gate0_rejected_wp_can_restart(db_conn: Any) -> None:
    """After GATE_0 rejection, WP is ACTIVE+GATE0_REJECTED; a new run can be started directly."""
    clear_in_progress_runs_for_domain(db_conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(db_conn, DOMAIN_TIKTRACK)
    try:
        # First run: rejected
        run_id_1 = _start_run(db_conn, DOMAIN_TIKTRACK, wp_id)
        M.reject_entry_run(db_conn, run_id=run_id_1, actor_team_id=TEAM_190, reason="Spec incomplete.")

        # WP stays ACTIVE + linked to the FAILED run
        with db_conn.cursor() as cur:
            cur.execute("SELECT status, linked_run_id FROM work_packages WHERE id = %s", (wp_id,))
            wp = dict(cur.fetchone())
        assert wp["status"] == "ACTIVE"
        assert str(wp["linked_run_id"]) == run_id_1

        # Second run: initiate_run overwrites linked_run_id
        result = M.initiate_run(db_conn, work_package_id=wp_id, domain_id=DOMAIN_TIKTRACK, process_variant=None)
        run_id_2 = result["run_id"]
        assert run_id_2 != run_id_1

        with db_conn.cursor() as cur:
            cur.execute("SELECT status FROM runs WHERE id = %s", (run_id_2,))
            run2 = dict(cur.fetchone())
            cur.execute("SELECT linked_run_id FROM work_packages WHERE id = %s", (wp_id,))
            wp2 = dict(cur.fetchone())
        assert run2["status"] == "IN_PROGRESS"
        assert str(wp2["linked_run_id"]) == run_id_2  # new run is now linked
    finally:
        purge_work_package(db_conn, wp_id)


# ── TC-G0-11: HTTP endpoint POST /runs/{run_id}/reject-entry ─────────────────

@requires_aos_db
def test_gate0_api_reject_entry_endpoint(api_client: TestClient) -> None:
    """POST /runs/{run_id}/reject-entry returns 200 with run=FAILED, wp=GATE0_REJECTED."""
    conn = db_connection()
    clear_in_progress_runs_for_domain(conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(conn, DOMAIN_TIKTRACK)
    run_id = _start_run(conn, DOMAIN_TIKTRACK, wp_id)
    conn.close()

    try:
        resp = api_client.post(
            f"/api/runs/{run_id}/reject-entry",
            json={"reason": "HTTP test: spec fails constitutional check."},
            headers={"X-Actor-Team-Id": TEAM_190},
        )
        assert resp.status_code == 200, f"Expected 200 got {resp.status_code}: {resp.text}"
        body = resp.json()
        assert body["status"] == "FAILED"
        assert body["wp_status"] == "GATE0_REJECTED"
        assert body["run_id"] == run_id
    finally:
        conn2 = db_connection()
        purge_work_package(conn2, wp_id)
        conn2.close()


# ── TC-G0-12: HTTP reject-entry denied for unauthorized actor ────────────────

@requires_aos_db
def test_gate0_api_reject_entry_unauthorized(api_client: TestClient) -> None:
    """POST /runs/{run_id}/reject-entry by team_10 returns 403."""
    conn = db_connection()
    clear_in_progress_runs_for_domain(conn, DOMAIN_TIKTRACK)
    wp_id = insert_temp_wp(conn, DOMAIN_TIKTRACK)
    run_id = _start_run(conn, DOMAIN_TIKTRACK, wp_id)
    conn.close()

    try:
        resp = api_client.post(
            f"/api/runs/{run_id}/reject-entry",
            json={"reason": "Unauthorized actor test."},
            headers={"X-Actor-Team-Id": TEAM_10},
        )
        assert resp.status_code == 403
        assert resp.json()["detail"]["code"] == "UNAUTHORIZED_ACTOR"
    finally:
        conn2 = db_connection()
        purge_work_package(conn2, wp_id)
        conn2.close()


# ── TC-G0-13: initiate_run rejects program-level WP IDs ─────────────────────

@requires_aos_db
def test_initiate_run_rejects_program_level_wp_id() -> None:
    """initiate_run() with a 2-level program-level ID raises INVALID_WP_ID_FORMAT (400).

    Iron Rule: work_package_id MUST be S{NNN}-P{NNN}-WP{NNN}.
    Directive: ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md
    """
    conn = db_connection()
    try:
        with pytest.raises(StateMachineError) as exc_info:
            M.initiate_run(
                conn,
                domain_id=DOMAIN_TIKTRACK,
                work_package_id="S003-P005",  # program-level — must be rejected
                process_variant=None,
            )
        err = exc_info.value
        assert err.code == "INVALID_WP_ID_FORMAT", (
            f"Expected INVALID_WP_ID_FORMAT, got {err.code}"
        )
        assert err.status_code == 400
    finally:
        conn.close()


@requires_aos_db
def test_initiate_run_accepts_canonical_3level_wp_id() -> None:
    """initiate_run() fails at WP-not-found (not format validation) for correct 3-level IDs.

    Verifies the validator passes S{NNN}-P{NNN}-WP{NNN} through to the DB lookup stage.
    """
    conn = db_connection()
    clear_in_progress_runs_for_domain(conn, DOMAIN_TIKTRACK)
    try:
        with pytest.raises(StateMachineError) as exc_info:
            M.initiate_run(
                conn,
                domain_id=DOMAIN_TIKTRACK,
                work_package_id="S099-P099-WP999",  # valid format, non-existent WP
                process_variant=None,
            )
        err = exc_info.value
        # Should fail at WP_NOT_FOUND, not at INVALID_WP_ID_FORMAT
        assert err.code != "INVALID_WP_ID_FORMAT", (
            f"Valid 3-level WP ID was incorrectly rejected by format validator: {err.code}"
        )
    finally:
        conn.close()
