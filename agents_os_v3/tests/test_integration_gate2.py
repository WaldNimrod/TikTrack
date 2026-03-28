"""
Process Map §6 — four cross-module checks before GATE_2 submission.

1) Routing → Builder pipeline
2) Machine + ledger atomic rollback (AD-S7-01)
3) Machine authority / invalid transition signals (not swallowed)
4) Sentinel bypass (resolve_from_state_key) + definitions-shaped run row
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from agents_os_v3.modules.audit.ledger import AuditLedgerError
from agents_os_v3.modules.prompting import cache as prompt_cache
from agents_os_v3.modules.prompting.builder import assemble_prompt_for_run
from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
from agents_os_v3.modules.state import machine as M
from agents_os_v3.modules.state.errors import StateMachineError

from .conftest import requires_aos_db
from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package


def test_gate2_crossmodule_routing_to_builder_pipeline() -> None:
    """resolve_actor_team_id + get_active_template + policies + L2 file → assembled prompt."""
    from datetime import datetime, timezone

    prompt_cache.cache_clear_prefix("prompt:")
    cur = MagicMock()
    conn = MagicMock()
    cm = MagicMock()
    cm.__enter__.return_value = cur
    cm.__exit__.return_value = False
    conn.cursor.return_value = cm
    lu = datetime.now(timezone.utc)
    run = {
        "id": "01RUNX",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "process_variant": "TRACK_FULL",
        "last_updated": lu,
    }
    tpl = {"id": "01JK8AOSV3TPL0000000001", "body_markdown": "# Chain", "version": 1}
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with patch("agents_os_v3.modules.prompting.builder.T.get_active_template", return_value=tpl):
            with patch("agents_os_v3.modules.prompting.builder.resolve_actor_team_id", return_value="team_11"):
                with patch("agents_os_v3.modules.prompting.builder.list_policies", return_value=[]):
                    out = assemble_prompt_for_run(conn, run_id="01RUNX", bust_cache=True)
    assert out["meta"]["actor_team_id"] == "team_11"
    assert "# Chain" in out["layers"]["L1_template"]
    assert "L2_governance" in out["layers"]


@requires_aos_db
def test_gate2_crossmodule_machine_ledger_atomic_rollback(aos_db_conn: object) -> None:
    """AD-S7-01: run position update rolls back when append_event fails."""
    conn = aos_db_conn
    dom = "01JK8AOSV3DOMAIN00000002"
    clear_in_progress_runs_for_domain(conn, dom)
    wp = insert_temp_wp(conn, dom)
    try:
        started = M.initiate_run(conn, work_package_id=wp, domain_id=dom, process_variant=None)
        rid = str(started["run_id"])
        with conn.cursor() as cur:
            cur.execute(
                "SELECT current_gate_id, current_phase_id, status FROM runs WHERE id = %s",
                (rid,),
            )
            before = dict(cur.fetchone())

        with patch(
            "agents_os_v3.modules.state.machine.append_event",
            side_effect=AuditLedgerError("forced ledger fail"),
        ):
            with pytest.raises(StateMachineError) as ei:
                M.advance_run(
                    conn,
                    run_id=rid,
                    actor_team_id="team_10",
                    verdict="pass",
                    summary=None,
                )
            assert ei.value.code == "AUDIT_LEDGER_ERROR"

        with conn.cursor() as cur:
            cur.execute(
                "SELECT current_gate_id, current_phase_id, status FROM runs WHERE id = %s",
                (rid,),
            )
            after = dict(cur.fetchone())
        assert after["current_gate_id"] == before["current_gate_id"]
        assert after["current_phase_id"] == before["current_phase_id"]
        assert after["status"] == before["status"]
    finally:
        purge_work_package(conn, wp)


@requires_aos_db
def test_gate2_crossmodule_machine_exception_signals_authority(aos_db_conn: object) -> None:
    """INSUFFICIENT_AUTHORITY propagates through machine entry (not swallowed)."""
    conn = aos_db_conn
    dom = "01JK8AOSV3DOMAIN00000002"
    clear_in_progress_runs_for_domain(conn, dom)
    wp = insert_temp_wp(conn, dom)
    try:
        started = M.initiate_run(conn, work_package_id=wp, domain_id=dom, process_variant=None)
        rid = str(started["run_id"])
        with pytest.raises(StateMachineError) as ei:
            M.pause_run(conn, run_id=rid, actor_team_id="team_11", pause_reason="qa authority probe")
        assert ei.value.code == "INSUFFICIENT_AUTHORITY"
    finally:
        purge_work_package(conn, wp)


def test_gate2_crossmodule_sentinel_bypass_definitions_shaped_run() -> None:
    """lod200_author_team on run row returns sentinel without assignment_for_role."""
    cur = MagicMock()
    cur.fetchone.return_value = {
        "resolve_from_state_key": "lod200_author_team",
        "role_id": "01JK8AOSV3ROLE0000000001",
    }
    run = {
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_2",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "current_phase_id": "2.1",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "process_variant": "TRACK_FULL",
        "lod200_author_team": "team_111",
    }
    with patch("agents_os_v3.modules.routing.resolver.R.assignment_for_role") as m_asg:
        out = resolve_actor_team_id(cur, run)
    assert out == "team_111"
    m_asg.assert_not_called()
