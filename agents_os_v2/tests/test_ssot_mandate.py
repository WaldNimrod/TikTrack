"""
S003-P012/P016 SSOT mandate — pipeline_state internal validation, ssot_check CLI.

S003-P016: SSOT check rewritten — no longer compares against WSM COS (removed).
Now validates pipeline_state_*.json internal consistency.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))


def test_ssot_check_consistent_when_aligned(monkeypatch):
    """Valid pipeline state (all required fields present) → CONSISTENT."""
    from agents_os_v2.tools import ssot_check as sc

    monkeypatch.setattr(
        sc,
        "_load_pipeline_state",
        lambda d: {
            "stage_id": "S003",
            "current_gate": "GATE_3",
            "work_package_id": "S003-P011-WP001",
            "project_domain": "tiktrack",
        },
    )

    ok, diffs = sc.run_check("tiktrack")
    assert ok
    assert diffs == []


def test_ssot_check_drift_detected(monkeypatch):
    """Missing current_gate → drift detected (internal validation failure)."""
    from agents_os_v2.tools import ssot_check as sc

    monkeypatch.setattr(
        sc,
        "_load_pipeline_state",
        lambda d: {
            "stage_id": "S003",
            "current_gate": "",  # empty — internal validation failure
            "work_package_id": "S003-P011-WP001",
            "project_domain": "tiktrack",
        },
    )

    ok, diffs = sc.run_check("tiktrack")
    assert not ok
    assert len(diffs) >= 1


def test_ssot_check_drift_active_gate_missing_wp(monkeypatch):
    """Active gate with missing work_package_id → drift detected."""
    from agents_os_v2.tools import ssot_check as sc

    monkeypatch.setattr(
        sc,
        "_load_pipeline_state",
        lambda d: {
            "stage_id": "S003",
            "current_gate": "GATE_2",
            "work_package_id": "",  # missing while gate is active
            "project_domain": "agents_os",
        },
    )

    ok, diffs = sc.run_check("agents_os")
    assert not ok
    assert any("work_package_id" in d for d in diffs)


def test_ssot_check_cli_exit_code(monkeypatch, capsys):
    from agents_os_v2.tools import ssot_check as mod

    monkeypatch.setattr(mod, "run_check", lambda d: (True, []))
    assert mod.main(["--domain", "tiktrack"]) == 0
    out = capsys.readouterr().out
    assert "CONSISTENT" in out


def test_post_advance_ssot_skips_pass_with_action(monkeypatch):
    from agents_os_v2.orchestrator import pipeline as pl
    from agents_os_v2.orchestrator.state import PipelineState

    calls: list[str] = []

    monkeypatch.setattr(pl, "write_wsm_state", lambda *a, **k: calls.append("wsm"))
    monkeypatch.setattr(
        "agents_os_v2.observers.state_reader.build_state_snapshot",
        lambda: {},
    )

    st = PipelineState(
        work_package_id="S003-P011-WP099",
        stage_id="S003",
        project_domain="agents_os",
        current_gate="GATE_4",
        gate_state="PASS_WITH_ACTION",
    )
    pl._post_advance_ssot(st, "GATE_4", "PASS")
    assert calls == []


def test_wsm_writer_is_noop(tmp_path, monkeypatch):
    """S003-P016: write_wsm_state is a no-op — COS removed from WSM."""
    from agents_os_v2.orchestrator import wsm_writer as ww
    from agents_os_v2.orchestrator.state import PipelineState

    original = "## WSM static policy\n\nNo COS section here.\n"
    p = tmp_path / "wsm.md"
    p.write_text(original, encoding="utf-8")
    monkeypatch.setattr(ww, "WSM_PATH", p)

    st = PipelineState(
        work_package_id="S003-P011-WP001",
        stage_id="S003",
        project_domain="tiktrack",
        current_gate="GATE_3",
    )
    ww.write_wsm_state(st, "GATE_2", "PASS")
    out = p.read_text(encoding="utf-8")
    assert out == original, "write_wsm_state should be a no-op (S003-P016); file must be unchanged"


def test_read_wsm_includes_current_gate():
    from agents_os_v2.observers.state_reader import read_wsm_identity_fields

    # Smoke: real repo WSM should parse current_gate if present
    d = read_wsm_identity_fields()
    assert "current_gate" in d
    assert isinstance(d["current_gate"], str)


def test_stage_parallel_tracks_parses_agents_os_and_tiktrack():
    from agents_os_v2.observers.state_reader import read_stage_parallel_tracks

    rows = read_stage_parallel_tracks()
    domains = {r["domain"] for r in rows}
    assert "agents_os" in domains
    assert "tiktrack" in domains
    assert len(rows) >= 2


def test_ssot_reference_identity_matches_parallel_track_for_tiktrack():
    """Smoke: TIKTRACK SSOT reference comes from STAGE_PARALLEL_TRACKS (not CURRENT_OPERATIONAL_STATE)."""
    from agents_os_v2.observers.state_reader import read_ssot_reference_identity

    ref = read_ssot_reference_identity("tiktrack")
    assert ref.get("active_project_domain", "").upper() == "TIKTRACK"
    assert ref.get("active_work_package_id")
    assert ref.get("current_gate")
