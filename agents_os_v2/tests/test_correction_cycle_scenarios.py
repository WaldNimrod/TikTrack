"""
S003-P012-WP005 — Stage 2: correction cycle, all finding_type values, --from-report.

Mandate: TEAM_00_S003_P012_WP002_TO_WP005_MANDATES_v1.0.0.md §4 Stage 2
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

# pipeline.py help + KB: 9 valid finding types
FINDING_TYPES_9 = (
    "PWA",
    "doc",
    "wording",
    "canonical_deviation",
    "code_fix_single",
    "code_fix_multi",
    "architectural",
    "scope_change",
    "unclear",
)

REPORT_FIXTURE = REPO / "agents_os_v2" / "tests" / "fixtures" / "wp005_fail_report_sample.md"


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


def _base_state_gate4():
    return {
        "pipe_run_id": "wp005cc",
        "work_package_id": "S003-P012-WP005-CC",
        "stage_id": "S003",
        "project_domain": "agents_os",
        "spec_brief": "correction cycle test",
        "current_gate": "GATE_4",
        "current_phase": "4.1",
        "gates_completed": ["GATE_1", "GATE_2", "GATE_3"],
        "gates_failed": [],
        "process_variant": "TRACK_FOCUSED",
        "remediation_cycle_count": 0,
        "last_blocking_findings": "",
        "last_blocking_gate": "",
        "lld400_content": "X" * 400,
        "work_plan": "Team 20 | t1\nTeam 30 | t2",
    }


@pytest.mark.parametrize("finding_type", FINDING_TYPES_9)
def test_wp005_finding_type_persisted_on_gate4_fail(tmp_path, monkeypatch, finding_type):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    p.write_text(json.dumps(_base_state_gate4()), encoding="utf-8")

    pl.advance_gate("GATE_4", "FAIL", f"reason for {finding_type}", finding_type=finding_type)
    data = json.loads(p.read_text(encoding="utf-8"))
    assert data.get("finding_type") == finding_type
    assert int(data.get("remediation_cycle_count") or 0) >= 1


def test_wp005_parse_fail_report_prefers_fail_cmd_line():
    import agents_os_v2.orchestrator.pipeline as p

    raw = REPORT_FIXTURE.read_text(encoding="utf-8")
    got = p._parse_fail_report_text(raw)
    assert "./pipeline_run.sh" in got
    assert "GATE_4 FAIL" in got
    assert "BF-99" not in got


def test_wp005_parse_fail_report_path_roundtrip(tmp_path):
    import agents_os_v2.orchestrator.pipeline as p

    rp = tmp_path / "report.md"
    rp.write_text(
        "FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type doc \"GATE_3 FAIL: z\"\n",
        encoding="utf-8",
    )
    assert "GATE_3 FAIL" in p._parse_fail_report_path(rp)


def test_wp005_parse_fail_report_fallback_body_when_no_fail_cmd(tmp_path):
    import agents_os_v2.orchestrator.pipeline as p

    rp = tmp_path / "plain.md"
    rp.write_text("Only narrative.\nSecond line here.\n", encoding="utf-8")
    got = p._parse_fail_report_path(rp)
    assert "Only narrative" in got


def test_wp005_remediation_mandate_has_identity_header(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    st = json.loads(json.dumps(_base_state_gate4()))
    st["last_blocking_findings"] = "- BF-01: blocking issue"
    st["last_blocking_gate"] = "GATE_4"
    st["remediation_cycle_count"] = 1
    p.write_text(json.dumps(st), encoding="utf-8")

    from agents_os_v2.orchestrator.state import PipelineState

    s = PipelineState.load_domain("agents_os")
    text = pl._generate_remediation_mandate(s)
    assert "roadmap_id" in text.lower() or "PHOENIX_ROADMAP" in text
    assert "work_package_id" in text.lower() or "S003-P012-WP005-CC" in text


def test_wp005_correction_step_single_finding(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    st = _base_state_gate4()
    st["last_blocking_findings"] = "- First finding only\n"
    p.write_text(json.dumps(st), encoding="utf-8")

    from agents_os_v2.orchestrator.state import PipelineState

    s = PipelineState.load_domain("agents_os")
    step = pl._generate_correction_step(s, step_index=1)
    assert "Correction step 1" in step
    assert "First finding" in step


def test_wp005_gate3_prompt_includes_correction_banner_after_fail(tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.pipeline as pl

    p = _patch_agents_os(monkeypatch, tmp_path)
    _silence_sidefx(monkeypatch)
    st = _base_state_gate4()
    st["current_gate"] = "GATE_3"
    st["current_phase"] = "3.2"
    st["remediation_cycle_count"] = 1
    st["last_blocking_gate"] = "GATE_3"
    st["last_blocking_findings"] = "- must fix"
    p.write_text(json.dumps(st), encoding="utf-8")

    from agents_os_v2.orchestrator.state import PipelineState

    s = PipelineState.load_domain("agents_os")
    text = pl.generate_gate3_prompt(s)
    assert "CORRECTION_CYCLE_BANNER" in text


def test_wp005_correction_cycle_banner_constant_shape():
    import agents_os_v2.orchestrator.pipeline as pl

    assert "CORRECTION_CYCLE_BANNER" in pl.CORRECTION_CYCLE_BANNER
    assert "Remediation cycle" in pl.CORRECTION_CYCLE_BANNER


def test_wp005_finding_types_count_is_nine():
    assert len(FINDING_TYPES_9) == 9
    assert len(set(FINDING_TYPES_9)) == 9
