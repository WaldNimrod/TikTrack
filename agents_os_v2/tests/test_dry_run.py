"""
S003-P011-WP002 KB-38 — DRY_RUN matrix: domain × variant × gate (15 scenarios).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator import pipeline as P
from agents_os_v2.orchestrator.pipeline import CORRECTION_CYCLE_BANNER


def _aos(wp: str = "S003-P011-WP002") -> PipelineState:
    return PipelineState(
        work_package_id=wp,
        stage_id="S003",
        project_domain="agents_os",
        process_variant="TRACK_FOCUSED",
        current_gate="GATE_2",
        current_phase="2.2",
        lod200_author_team="team_110",
        lld400_content="SPEC " * 200,
        work_plan="Team 20 | x\nTeam 30 | y",
        spec_brief="test",
    )


def _tt(wp: str = "S003-P003-WP001") -> PipelineState:
    return PipelineState(
        work_package_id=wp,
        stage_id="S003",
        project_domain="tiktrack",
        process_variant="TRACK_FULL",
        current_gate="GATE_2",
        current_phase="2.2",
        lod200_author_team="team_100",
        lld400_content="SPEC " * 200,
        work_plan="Team 20 | api\nTeam 30 | ui",
        spec_brief="test",
    )


def test_dry_run_01_aos_focused_gate1(monkeypatch, tmp_path):
    st = _aos()
    st.current_gate = "GATE_1"
    st.current_phase = "1.1"
    monkeypatch.setattr(P, "_save_prompt", lambda *a, **k: tmp_path / "gate1.md")
    text = P._generate_gate_1_mandates(st)
    lo = text.lower()
    assert "team_110" in lo or "team_170" in lo


def test_dry_run_02_aos_focused_gate2_workplan():
    st = _aos()
    st.current_gate = "GATE_2"
    st.current_phase = "2.2"
    text = P.generate_gate2_prompt(st)
    assert "team_11" in text.lower()


def test_dry_run_03_aos_focused_gate3_mandate():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.1"
    text = P.generate_gate3_prompt(st)
    assert "team_11" in text.lower()


def test_dry_run_04_aos_focused_gate3_impl():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    assert "team_61" in text.lower()


def test_dry_run_05_aos_focused_gate4_qa():
    st = _aos()
    st.current_gate = "GATE_4"
    st.current_phase = "4.1"
    text = P._generate_gate_4_prompt(st)
    assert "team_51" in text.lower()


def test_dry_run_06_aos_focused_gate4_spec():
    st = _aos()
    st.current_gate = "GATE_4"
    st.current_phase = "4.2"
    st.lod200_author_team = "team_110"
    text = P.generate_gate4_prompt(st)
    assert "team_110" in text


def test_dry_run_07_aos_focused_gate5_doc():
    st = _aos()
    st.current_gate = "GATE_5"
    st.current_phase = "5.1"
    text = P.generate_gate5_prompt(st)
    assert "team_170" in text
    assert "Documentation Closure" in text


def test_dry_run_08_tt_full_gate2_workplan():
    st = _tt()
    st.current_gate = "GATE_2"
    st.current_phase = "2.2"
    text = P.generate_gate2_prompt(st)
    assert "team_10" in text.lower()


def test_dry_run_09_tt_full_gate3_impl():
    st = _tt()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    lo = text.lower()
    assert "team_20" in lo and "team_30" in lo and "team_40" in lo


def test_dry_run_10_tt_full_gate4_qa():
    st = _tt()
    st.current_gate = "GATE_4"
    st.current_phase = "4.1"
    text = P._generate_gate_4_prompt(st)
    assert "team_50" in text.lower()


def test_dry_run_11_tt_full_gate5_doc():
    st = _tt()
    st.current_gate = "GATE_5"
    st.current_phase = "5.1"
    text = P.generate_gate5_prompt(st)
    assert "team_70" in text
    assert "Documentation Closure" in text


def test_dry_run_12_fail_routing_gate4():
    tgt, _ = P.FAIL_ROUTING["GATE_4"]["doc"]
    assert tgt == "GATE_3"
    assert P._canonical_fail_routing_key("CURSOR_IMPLEMENTATION") == "GATE_3"
    assert tgt not in ("CURSOR_IMPLEMENTATION", "G3_PLAN", "GATE_8")


def test_dry_run_13_gate4_phase42_team100():
    st = _aos()
    st.current_gate = "GATE_4"
    st.current_phase = "4.2"
    st.lod200_author_team = "team_100"
    text = P.generate_gate4_prompt(st)
    assert "team_100" in text


def test_dry_run_14_correction_cycle_banner():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    st.remediation_cycle_count = 1
    st.last_blocking_gate = "GATE_3"
    text = P.generate_gate3_prompt(st)
    assert CORRECTION_CYCLE_BANNER in text


def test_dry_run_15_migration_both_domains(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.state as sm

    pa = tmp_path / "pipeline_state_agentsos.json"
    pt = tmp_path / "pipeline_state_tiktrack.json"
    pa.write_text(
        json.dumps(
            {
                "work_package_id": "S003-P011-WP099",
                "stage_id": "S003",
                "project_domain": "agents_os",
                "current_gate": "G3_6_MANDATES",
                "current_phase": "legacy",
                "gates_completed": [],
                "process_variant": "TRACK_FOCUSED",
                "spec_brief": "s",
            }
        ),
        encoding="utf-8",
    )
    pt.write_text(
        json.dumps(
            {
                "work_package_id": "S003-P003-WP001",
                "stage_id": "S003",
                "project_domain": "tiktrack",
                "current_gate": "G3_PLAN",
                "current_phase": "legacy",
                "gates_completed": [],
                "process_variant": "TRACK_FULL",
                "spec_brief": "s",
            }
        ),
        encoding="utf-8",
    )

    def _gf(domain=None):
        d = (domain or "tiktrack").lower().replace("-", "_")
        if d == "agents_os":
            return pa
        if d == "tiktrack":
            return pt
        return tmp_path / f"pipeline_state_{d}.json"

    monkeypatch.setattr(sm, "get_state_file", _gf)
    sa = PipelineState.load_domain("agents_os")
    stt = PipelineState.load_domain("tiktrack")
    assert sa.current_gate == "GATE_3"
    assert stt.current_gate == "GATE_2"
