"""
S003-P011-WP002 — Certification suite CERT_01..CERT_15 (LLD400 v1.0.1 §17.5).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator import pipeline as P


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


def test_cert_01_gate2_aos_team11_workplan():
    st = _aos()
    text = P.generate_gate2_prompt(st)
    assert "team_11" in text.lower() or "Team 11".lower() in text.lower()
    assert "work plan" in text.lower()


def test_cert_02_gate2_tiktrack_team10():
    st = _tt()
    text = P.generate_gate2_prompt(st)
    assert "team_10" in text.lower() or "team 10" in text.lower()


def test_cert_03_gate3_3_1_team11_mandate():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.1"
    text = P.generate_gate3_prompt(st)
    assert "team_11" in text.lower() or "Team 11" in text


def test_cert_04_gate3_3_2_team61():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    assert "team_61" in text.lower() or "61" in text


def test_cert_05_gate3_tiktrack_teams_20_30_40():
    st = _tt()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    lo = text.lower()
    assert "team_20" in lo and "team_30" in lo and "team_40" in lo


def test_cert_06_gate4_lod200_team101():
    st = _aos()
    st.current_gate = "GATE_4"
    st.current_phase = "4.2"
    st.lod200_author_team = "team_110"
    text = P.generate_gate4_prompt(st)
    assert "team_110" in text


def test_cert_07_gate4_lod200_team100():
    st = _aos()
    st.current_gate = "GATE_4"
    st.current_phase = "4.2"
    st.lod200_author_team = "team_100"
    text = P.generate_gate4_prompt(st)
    assert "team_100" in text


def test_cert_08_gate5_aos_team170():
    st = _aos()
    st.current_gate = "GATE_5"
    st.current_phase = "5.1"
    text = P.generate_gate5_prompt(st)
    assert "team_170" in text
    assert "Documentation Closure" in text
    assert "Dev Validation" not in text


def test_cert_09_gate5_tiktrack_team70():
    st = _tt()
    st.current_gate = "GATE_5"
    st.current_phase = "5.1"
    text = P.generate_gate5_prompt(st)
    assert "team_70" in text
    assert "Documentation Closure" in text
    assert "Dev Validation" not in text


def test_cert_10_correction_banner_gate3():
    st = _aos()
    st.current_gate = "GATE_3"
    st.current_phase = "3.2"
    st.remediation_cycle_count = 2
    st.last_blocking_gate = "GATE_3"
    st.last_blocking_findings = "- BF-01: test finding"
    text = P.generate_gate3_prompt(st)
    assert "CORRECTION_CYCLE_BANNER" in text
    assert "BF-01" in text


def _agents_os_state_path(tmp_path):
    return tmp_path / "pipeline_state_agentsos.json"


def _patch_agents_os_state_file(monkeypatch, tmp_path):
    import agents_os_v2.orchestrator.state as sm

    p = _agents_os_state_path(tmp_path)

    def _sf(domain=None):
        d = (domain or "tiktrack").lower().replace("-", "_")
        if d == "agents_os":
            return p
        return tmp_path / f"pipeline_state_{d}.json"

    monkeypatch.setattr(sm, "get_state_file", _sf)
    monkeypatch.setattr(sm, "STATE_FILE", tmp_path / "pipeline_state_legacy.json")
    return p


def test_cert_11b_gate4_fail_doc_routes_to_gate3_canonical():
    """KB-32: FAIL from GATE_4 doc path targets GATE_3 (not legacy CURSOR_IMPLEMENTATION)."""
    target, _desc = P.FAIL_ROUTING["GATE_4"]["doc"]
    assert target == "GATE_3"
    assert target not in ("CURSOR_IMPLEMENTATION", "G3_PLAN", "GATE_8")


def test_cert_11_cli_fail_writes_findings(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os_state_file(monkeypatch, tmp_path)
    base = {
        "pipe_run_id": "abc",
        "work_package_id": "S003-P011-WP099",
        "stage_id": "S003",
        "project_domain": "agents_os",
        "spec_brief": "x",
        "current_gate": "GATE_3",
        "current_phase": "3.2",
        "gates_completed": [],
        "gates_failed": [],
        "process_variant": "TRACK_FOCUSED",
        "remediation_cycle_count": 0,
        "last_blocking_findings": "",
        "last_blocking_gate": "",
    }
    p.write_text(json.dumps(base), encoding="utf-8")
    monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")
    pl.advance_gate("GATE_3", "FAIL", "doc gap", finding_type="doc")
    data = json.loads(p.read_text(encoding="utf-8"))
    assert data.get("finding_type") == "doc"
    assert int(data.get("remediation_cycle_count", 0)) >= 1


def test_cert_12_pass_gate_mismatch_exits_nonzero(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os_state_file(monkeypatch, tmp_path)
    base = {
        "pipe_run_id": "abc",
        "work_package_id": "S003-P011-WP099",
        "stage_id": "S003",
        "project_domain": "agents_os",
        "current_gate": "GATE_2",
        "current_phase": "2.2",
        "gates_completed": [],
        "gates_failed": [],
        "process_variant": "TRACK_FOCUSED",
    }
    p.write_text(json.dumps(base), encoding="utf-8")
    monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")
    with pytest.raises(SystemExit):
        pl.advance_gate("GATE_3", "PASS", "", finding_type="")


def test_cert_13_migration_g3_6_to_gate3(tmp_path, monkeypatch):
    p = _patch_agents_os_state_file(monkeypatch, tmp_path)
    raw = {
        "work_package_id": "S003-P011-WP099",
        "stage_id": "S003",
        "project_domain": "agents_os",
        "current_gate": "G3_6_MANDATES",
        "current_phase": "legacy",
        "gates_completed": [],
        "process_variant": "TRACK_FOCUSED",
        "spec_brief": "s",
    }
    p.write_text(json.dumps(raw), encoding="utf-8")
    st = PipelineState.load_domain("agents_os")
    assert st.current_gate == "GATE_3"
    assert st.current_phase == "3.1"


def test_cert_14_migration_g3_plan_to_gate2_2_2(tmp_path, monkeypatch):
    p = _patch_agents_os_state_file(monkeypatch, tmp_path)
    raw = {
        "work_package_id": "S003-P011-WP099",
        "stage_id": "S003",
        "project_domain": "agents_os",
        "current_gate": "G3_PLAN",
        "current_phase": "legacy",
        "gates_completed": [],
        "process_variant": "TRACK_FOCUSED",
        "spec_brief": "s",
    }
    p.write_text(json.dumps(raw), encoding="utf-8")
    st = PipelineState.load_domain("agents_os")
    assert st.current_gate == "GATE_2"
    assert st.current_phase == "2.2"


def test_cert_16_tiktrack_real_state_migration(tmp_path, monkeypatch):
    """KB-33: load real repo TikTrack state via isolated file; legacy gate migrates to canonical."""
    import agents_os_v2.orchestrator.state as sm

    canonical = REPO / "_COMMUNICATION/agents_os/pipeline_state_tiktrack.json"
    assert canonical.exists()
    raw = json.loads(canonical.read_text(encoding="utf-8"))
    pre = (raw.get("current_gate") or "").strip()
    p = tmp_path / "pipeline_state_tiktrack.json"
    p.write_text(canonical.read_text(encoding="utf-8"))
    monkeypatch.setattr(sm, "get_state_file", lambda domain=None: p)
    st = PipelineState.load_domain("tiktrack")
    if pre in ("G3_6_MANDATES", "G3_PLAN"):
        assert st.current_gate in ("GATE_3", "GATE_2")
        if pre == "G3_6_MANDATES":
            assert st.current_gate == "GATE_3"
        if pre == "G3_PLAN":
            assert st.current_gate == "GATE_2"
    else:
        assert st.current_gate == pre or str(st.current_gate).startswith("GATE_")
    # Canonical snapshot: no migration table hit → gate unchanged
    p2 = tmp_path / "pipeline_state_tiktrack.json"
    p2.write_text(
        json.dumps(
            {
                **{k: v for k, v in raw.items() if k != "current_gate"},
                "current_gate": "GATE_4",
                "work_package_id": raw.get("work_package_id") or "S003-P011-WP099",
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(sm, "get_state_file", lambda domain=None: p2)
    st2 = PipelineState.load_domain("tiktrack")
    assert st2.current_gate == "GATE_4"


def test_cert_15_all_gate_phase_generators_non_empty():
    for gate in P.GATE_SEQUENCE:
        phases = list(P._DOMAIN_PHASE_ROUTING.get(gate, {}).keys())
        if not phases:
            continue  # GATE_0 and other single-phase gates have no _DOMAIN_PHASE_ROUTING entry — skip
        for phase in phases:
            st = _aos()
            st.current_gate = gate
            st.current_phase = phase
            if gate == "GATE_1":
                own = P.resolve_phase_owner_from_state(st, gate, phase)
                assert own, f"{gate}/{phase}"
                continue
            if gate == "GATE_2":
                txt = P.generate_gate2_prompt(st)
            elif gate == "GATE_3":
                txt = P.generate_gate3_prompt(st)
            elif gate == "GATE_4":
                txt = P.generate_gate4_prompt(st)
            elif gate == "GATE_5":
                txt = P.generate_gate5_prompt(st)
            else:
                continue
            assert len(txt) > 80, f"empty prompt {gate}/{phase}"


def test_path_builder_roundtrip():
    from agents_os_v2.utils.path_builder import CanonicalPathBuilder

    fn = CanonicalPathBuilder.build("101", "S003-P011-WP002", "GATE_2", "LLD400", "1.0.0")
    assert "TEAM_101" in fn and "LLD400" in fn
    parsed = CanonicalPathBuilder.parse(fn)
    assert parsed["sender"] == "101"
    assert parsed["gate"] == "GATE_2"


def test_wp002_migration_table_avoids_canonical_gate_collision():
    from agents_os_v2.orchestrator.migration_config import _MIGRATION_TABLE

    for bad in ("GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5"):
        assert bad not in _MIGRATION_TABLE, f"collision on {bad}"


def test_phase_routing_json_matches_pipeline_module():
    import json
    from pathlib import Path

    from agents_os_v2.config import AGENTS_OS_OUTPUT_DIR
    from agents_os_v2.orchestrator.pipeline import _DOMAIN_PHASE_ROUTING

    path = AGENTS_OS_OUTPUT_DIR / "phase_routing.json"
    assert path.exists()
    on_disk = json.loads(path.read_text(encoding="utf-8"))
    assert on_disk == _DOMAIN_PHASE_ROUTING


def test_resolve_lod200_sentinel():
    st = _aos()
    st.lod200_author_team = "team_111"
    r = P.resolve_phase_owner_from_state(st, "GATE_4", "4.2")
    assert r == "team_111"
