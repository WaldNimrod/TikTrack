"""Layer 1 — state machine error surface (no DB)."""

from __future__ import annotations

from agents_os_v3.modules.state.errors import StateMachineError


def test_state_machine_error_fields() -> None:
    e = StateMachineError("WRONG_ACTOR", 403, message="nope", details={"k": "v"})
    assert e.code == "WRONG_ACTOR"
    assert e.status_code == 403
    assert e.details == {"k": "v"}
    assert str(e) == "nope"
