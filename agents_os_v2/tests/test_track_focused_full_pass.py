"""
S003-P012-WP005 — Stage 1: TRACK_FOCUSED dummy WP, full 5-gate PASS (no manual intervention).

Mandate: TEAM_00_S003_P012_WP002_TO_WP005_MANDATES_v1.0.0.md §4 Stage 1
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

FIXTURE = REPO / "agents_os_v2" / "tests" / "fixtures" / "dummy_wp_focused.json"


def _patch_agents_os(monkeypatch, tmp_path):
    import agents_os_v2.orchestrator.state as sm

    p = tmp_path / "pipeline_state_agentsos.json"

    def _sf(domain=None):
        d = (domain or "agents_os").lower().replace("-", "_")
        if d == "agents_os":
            return p
        return tmp_path / f"pipeline_state_{d}.json"

    monkeypatch.setattr(sm, "get_state_file", _sf)
    monkeypatch.setattr(sm, "STATE_FILE", tmp_path / "pipeline_state_legacy.json")
    monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")
    return p


def _silence_sidefx(monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    monkeypatch.setattr(pl, "_post_advance_ssot", lambda *a, **k: None)
    monkeypatch.setattr(pl, "_emit_pipeline_event", lambda *a, **k: None)


def _approve_gate2(tmp_path, p):
    import agents_os_v2.orchestrator.state as sm

    st = sm.PipelineState.load_domain("agents_os")
    assert st.current_gate == "GATE_2"
    st.gate_state = None
    st._append_gate("GATE_2", completed=True)
    st.current_gate = "GATE_3"
    st.save()


def test_wp005_dummy_fixture_is_valid_json():
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    assert data["process_variant"] == "TRACK_FOCUSED"
    assert data["project_domain"] == "agents_os"
    assert data["current_gate"] == "GATE_1"
    assert "WP005" in (data.get("work_package_id") or "") or "DUMMY" in (data.get("work_package_id") or "")


def test_wp005_track_focused_five_gate_full_pass(tmp_path, monkeypatch):
    """GATE_1→2 (approve)→3→4→5 PASS; ends at COMPLETE — all via API, no manual UI."""
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    p.write_text(FIXTURE.read_text(encoding="utf-8"), encoding="utf-8")

    pl.advance_gate("GATE_1", "PASS")
    _approve_gate2(tmp_path, p)

    for g in ("GATE_3", "GATE_4", "GATE_5"):
        pl.advance_gate(g, "PASS")

    data = json.loads(p.read_text(encoding="utf-8"))
    assert data.get("current_gate") == "COMPLETE"
    assert "GATE_5" in (data.get("gates_completed") or [])


def test_wp005_track_focused_gate_sequence_advances_monotonic(tmp_path, monkeypatch):
    """Each PASS moves forward in canonical GATE_SEQUENCE until COMPLETE."""
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    p.write_text(FIXTURE.read_text(encoding="utf-8"), encoding="utf-8")

    pl.advance_gate("GATE_1", "PASS")
    _approve_gate2(tmp_path, p)
    assert json.loads(p.read_text(encoding="utf-8"))["current_gate"] == "GATE_3"

    pl.advance_gate("GATE_3", "PASS")
    assert json.loads(p.read_text(encoding="utf-8"))["current_gate"] == "GATE_4"

    pl.advance_gate("GATE_4", "PASS")
    assert json.loads(p.read_text(encoding="utf-8"))["current_gate"] == "GATE_5"

    pl.advance_gate("GATE_5", "PASS")
    assert json.loads(p.read_text(encoding="utf-8"))["current_gate"] == "COMPLETE"


def test_wp005_dummy_wp_id_stable_across_run(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    p.write_text(FIXTURE.read_text(encoding="utf-8"), encoding="utf-8")
    wp0 = json.loads(p.read_text(encoding="utf-8"))["work_package_id"]

    pl.advance_gate("GATE_1", "PASS")
    _approve_gate2(tmp_path, p)
    pl.advance_gate("GATE_3", "PASS")

    wp1 = json.loads(p.read_text(encoding="utf-8"))["work_package_id"]
    assert wp0 == wp1 == "S003-P012-WP005-DUMMY-FOCUSED"
