"""Layer 1 — canonical event hash (Event Obs §3.1 / Team 00 resolution)."""

from __future__ import annotations

from agents_os_v3.modules.audit.ledger import compute_event_hash


def test_compute_event_hash_is_deterministic() -> None:
    h1 = compute_event_hash(
        "e1",
        "01RUN00000000000000000001",
        1,
        "RUN_INITIATED",
        "2026-03-28T00:00:00Z",
        '{"a": 1}',
    )
    h2 = compute_event_hash(
        "e1",
        "01RUN00000000000000000001",
        1,
        "RUN_INITIATED",
        "2026-03-28T00:00:00Z",
        '{"a": 1}',
    )
    assert h1 == h2
    assert len(h1) == 64


def test_compute_event_hash_changes_when_sequence_changes() -> None:
    iso = "2026-03-28T00:00:00Z"
    h1 = compute_event_hash("e1", "r1", 1, "PHASE_PASSED", iso, "{}")
    h2 = compute_event_hash("e1", "r1", 2, "PHASE_PASSED", iso, "{}")
    assert h1 != h2
