"""Layer 2B — prompting/builder.py (assemble_prompt_for_run, AD-S6-07 meta)."""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

from agents_os_v3.modules.prompting import cache as prompt_cache
from agents_os_v3.modules.prompting.builder import assemble_prompt_for_run
from agents_os_v3.modules.state.errors import StateMachineError


def _conn_cm(cur: MagicMock) -> MagicMock:
    cm = MagicMock()
    cm.__enter__.return_value = cur
    cm.__exit__.return_value = False
    conn = MagicMock()
    conn.cursor.return_value = cm
    return conn


def test_assemble_rejects_paused_run() -> None:
    cur = MagicMock()
    conn = _conn_cm(cur)
    run = {
        "id": "01RUN",
        "status": "PAUSED",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "last_updated": datetime.now(timezone.utc),
    }
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with pytest.raises(StateMachineError) as ei:
            assemble_prompt_for_run(conn, run_id="01RUN")
        assert ei.value.code == "INVALID_STATE"


def test_assemble_template_not_found() -> None:
    cur = MagicMock()
    conn = _conn_cm(cur)
    run = {
        "id": "01RUN",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "last_updated": datetime.now(timezone.utc),
    }
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with patch("agents_os_v3.modules.prompting.builder.T.get_active_template", return_value=None):
            with pytest.raises(StateMachineError) as ei:
                assemble_prompt_for_run(conn, run_id="01RUN")
            assert ei.value.code == "TEMPLATE_NOT_FOUND"


def test_assemble_routing_unresolved_when_no_actor() -> None:
    cur = MagicMock()
    conn = _conn_cm(cur)
    run = {
        "id": "01RUN",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "last_updated": datetime.now(timezone.utc),
    }
    tpl = {"id": "01T", "body_markdown": "# L1", "version": 1}
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with patch("agents_os_v3.modules.prompting.builder.T.get_active_template", return_value=tpl):
            with patch("agents_os_v3.modules.prompting.builder.resolve_actor_team_id", return_value=None):
                with pytest.raises(StateMachineError) as ei:
                    assemble_prompt_for_run(conn, run_id="01RUN")
                assert ei.value.code == "ROUTING_UNRESOLVED"


def test_assemble_success_sets_token_budget_warning_none_ad_s6_07() -> None:
    prompt_cache.cache_clear_prefix("prompt:")
    cur = MagicMock()
    conn = _conn_cm(cur)
    lu = datetime.now(timezone.utc)
    run = {
        "id": "01RUN",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "last_updated": lu,
    }
    tpl = {"id": "01TPL", "body_markdown": "# L1 body", "version": 3}
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with patch("agents_os_v3.modules.prompting.builder.T.get_active_template", return_value=tpl):
            with patch("agents_os_v3.modules.prompting.builder.resolve_actor_team_id", return_value="team_11"):
                with patch("agents_os_v3.modules.prompting.builder.list_policies", return_value=[]):
                    out = assemble_prompt_for_run(conn, run_id="01RUN", bust_cache=True)
    assert out["meta"]["token_budget_warning"] is None
    assert "L1_template" in out["layers"]
    assert out["layers"]["L1_template"] == "# L1 body"


def test_assemble_second_call_uses_cache_when_same_key() -> None:
    prompt_cache.cache_clear_prefix("prompt:")
    cur = MagicMock()
    conn = _conn_cm(cur)
    lu = datetime(2026, 3, 28, 12, 0, tzinfo=timezone.utc)
    run = {
        "id": "01RUN2",
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_0",
        "current_phase_id": "0.1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "last_updated": lu,
    }
    tpl = {"id": "01TPL", "body_markdown": "# Cached", "version": 1}
    with patch("agents_os_v3.modules.prompting.builder.R.fetch_run", return_value=run):
        with patch("agents_os_v3.modules.prompting.builder.T.get_active_template", return_value=tpl):
            with patch("agents_os_v3.modules.prompting.builder.resolve_actor_team_id", return_value="team_11"):
                with patch("agents_os_v3.modules.prompting.builder.list_policies", return_value=[]):
                    a = assemble_prompt_for_run(conn, run_id="01RUN2", bust_cache=False)
                    b = assemble_prompt_for_run(conn, run_id="01RUN2", bust_cache=False)
    assert a is b
