"""Layer 2A — routing/resolver.py (AD-S5-02 precondition, resolve_from_state_key sentinel)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from agents_os_v3.modules.routing.resolver import resolve_actor_team_id


def _base_run(**overrides: object) -> dict[str, object]:
    r: dict[str, object] = {
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_1",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "current_phase_id": "1.1",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "process_variant": "TRACK_FULL",
    }
    r.update(overrides)
    return r


def test_resolve_returns_none_when_paused_ad_s5_02() -> None:
    cur = MagicMock()
    assert resolve_actor_team_id(cur, _base_run(status="PAUSED")) is None
    cur.execute.assert_not_called()


def test_resolve_returns_none_when_complete() -> None:
    cur = MagicMock()
    assert resolve_actor_team_id(cur, _base_run(status="COMPLETE")) is None
    cur.execute.assert_not_called()


def test_resolve_returns_none_when_no_matching_rule() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = None
    assert resolve_actor_team_id(cur, _base_run()) is None
    cur.execute.assert_called_once()


def test_resolve_uses_assignment_when_no_state_key() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = {
        "resolve_from_state_key": None,
        "role_id": "01JK8AOSV3ROLE0000000001",
    }
    fake_asg = {"team_id": "team_10"}
    with patch(
        "agents_os_v3.modules.routing.resolver.R.assignment_for_role",
        return_value=fake_asg,
    ) as m_asg:
        out = resolve_actor_team_id(cur, _base_run())
    assert out == "team_10"
    m_asg.assert_called_once_with(cur, "01JK8AOSV3WP0000000001", "01JK8AOSV3ROLE0000000001")


def test_resolve_sentinel_state_key_skips_assignment() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = {
        "resolve_from_state_key": "lod200_author_team",
        "role_id": "01JK8AOSV3ROLE0000000001",
    }
    run = _base_run(lod200_author_team="team_777")
    with patch(
        "agents_os_v3.modules.routing.resolver.R.assignment_for_role",
    ) as m_asg:
        out = resolve_actor_team_id(cur, run)
    assert out == "team_777"
    m_asg.assert_not_called()


def test_resolve_returns_none_when_assignment_missing() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = {
        "resolve_from_state_key": None,
        "role_id": "01JK8AOSV3ROLE0000000001",
    }
    with patch("agents_os_v3.modules.routing.resolver.R.assignment_for_role", return_value=None):
        assert resolve_actor_team_id(cur, _base_run()) is None
