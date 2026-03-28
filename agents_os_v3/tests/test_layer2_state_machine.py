"""Layer 2B — state/machine.py (StateMachineError surfaces, get_run)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from agents_os_v3.modules.definitions import constants as C
from agents_os_v3.modules.state import machine as M
from agents_os_v3.modules.state.errors import StateMachineError


def test_get_run_raises_not_found() -> None:
    conn = MagicMock()
    cur = MagicMock()
    cur.__enter__.return_value = cur
    cur.__exit__.return_value = False
    conn.cursor.return_value = cur
    with patch("agents_os_v3.modules.state.machine.R.fetch_run", return_value=None):
        with pytest.raises(StateMachineError) as ei:
            M.get_run(conn, "missing")
        assert ei.value.code == "NOT_FOUND"


def test_approve_run_insufficient_authority_non_principal() -> None:
    conn = MagicMock()
    cur = MagicMock()
    cur.__enter__.return_value = cur
    cur.__exit__.return_value = False
    conn.cursor.return_value = cur
    run = {
        "id": "01RUN",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_4",
        "current_phase_id": "4.1",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
    }
    with patch("agents_os_v3.modules.state.machine.R.fetch_run", return_value=run):
        with pytest.raises(StateMachineError) as ei:
            M.approve_run(conn, run_id="01RUN", actor_team_id="team_10", approval_notes=None)
        assert ei.value.code == "INSUFFICIENT_AUTHORITY"
        assert ei.value.status_code == 403


def test_pause_run_insufficient_authority_non_principal() -> None:
    conn = MagicMock()
    cur = MagicMock()
    cur.__enter__.return_value = cur
    cur.__exit__.return_value = False
    conn.cursor.return_value = cur
    run = {"id": "01RUN", "status": "IN_PROGRESS"}
    with patch("agents_os_v3.modules.state.machine.R.fetch_run", return_value=run):
        with pytest.raises(StateMachineError) as ei:
            M.pause_run(conn, run_id="01RUN", actor_team_id="team_11", pause_reason="x")
        assert ei.value.code == "INSUFFICIENT_AUTHORITY"


def test_execute_transition_invalid_action_propagates() -> None:
    conn = MagicMock()
    with pytest.raises(StateMachineError) as ei:
        M.execute_transition(
            conn,
            transition="NO_SUCH",
            actor_team_id=C.TEAM_PRINCIPAL,
            run_id=None,
            payload={},
        )
    assert ei.value.code == "INVALID_ACTION"
