"""Layer 2A — prompting/templates.py (active slot resolution)."""

from __future__ import annotations

from unittest.mock import MagicMock

from agents_os_v3.modules.prompting.templates import get_active_template


def test_get_active_template_returns_dict_when_row_present() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = {
        "id": "01TPL",
        "gate_id": "GATE_0",
        "phase_id": "0.1",
        "domain_id": None,
        "body_markdown": "# x",
        "version": 2,
        "is_active": 1,
    }
    row = get_active_template(cur, gate_id="GATE_0", phase_id="0.1", domain_id=None)
    assert row is not None
    assert row["body_markdown"] == "# x"
    assert row["version"] == 2
    cur.execute.assert_called_once()


def test_get_active_template_returns_none_when_no_row() -> None:
    cur = MagicMock()
    cur.fetchone.return_value = None
    assert get_active_template(cur, gate_id="GATE_9", phase_id=None, domain_id=None) is None
