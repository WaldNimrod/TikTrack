"""FIX-101-03 — HITL injection helpers; OBS-51-001 — COMPLETE terminal gate."""

from agents_os_v2.orchestrator.pipeline import _hitl_prohibition_block, _maybe_hitl, generate_prompt


def test_maybe_hitl_idempotent() -> None:
    body = "Hello"
    once = _maybe_hitl(body)
    assert "DO NOT run `./pipeline_run.sh`" in once
    twice = _maybe_hitl(once)
    assert twice == once


def test_hitl_block_nonempty() -> None:
    b = _hitl_prohibition_block()
    assert "OPERATOR-ONLY" in b
    assert len(b) > 20


def test_generate_prompt_complete_is_terminal_no_crash() -> None:
    """OBS-51-001: COMPLETE is not an Unknown gate; must not require *_COMPLETE_prompt.md."""
    # Loads real workspace state; branch returns before saving any prompt file.
    generate_prompt("COMPLETE")
