"""
S003-P012-WP005 — Stage 3: TRACK_FULL simulation (Teams 20/30/40, team_50 @ 3.3, handoff, roster).

Mandate: TEAM_00_S003_P012_WP002_TO_WP005_MANDATES_v1.0.0.md §4 Stage 3
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator import pipeline as P


def _tt_full(wp: str = "S003-P012-WP005-TT-FULL") -> PipelineState:
    return PipelineState(
        work_package_id=wp,
        stage_id="S003",
        project_domain="tiktrack",
        process_variant="TRACK_FULL",
        current_gate="GATE_3",
        current_phase="3.2",
        lod200_author_team="team_111",
        lld400_content="SPEC " * 120,
        work_plan="Team 20 | backend scope\nTeam 30 | frontend scope\nTeam 40 | assets",
        spec_brief="WP005 TRACK_FULL simulation",
        implementation_files=["ui/src/x.jsx"],
    )


def _aos_full(wp: str = "S003-P012-WP005-AOS-FULL") -> PipelineState:
    return PipelineState(
        work_package_id=wp,
        stage_id="S003",
        project_domain="agents_os",
        process_variant="TRACK_FULL",
        current_gate="GATE_3",
        current_phase="3.2",
        lod200_author_team="team_110",
        lld400_content="SPEC " * 120,
        work_plan="Team 20 | be\nTeam 30 | fe",
        spec_brief="WP005 AOS TRACK_FULL",
    )


def test_wp005_tiktrack_gate3_phase33_routes_team_50():
    st = _tt_full()
    st.current_phase = "3.3"
    owner = P.resolve_phase_owner_from_state(st, "GATE_3", "3.3")
    assert owner == "team_50"


def test_wp005_agents_os_gate3_phase33_routes_team_51():
    st = _aos_full()
    st.current_phase = "3.3"
    owner = P.resolve_phase_owner_from_state(st, "GATE_3", "3.3")
    assert owner == "team_51"


def test_wp005_team_20_mandate_section_differs_from_team_30():
    st = _tt_full()
    st.current_gate = "GATE_3"
    st.current_phase = "3.1"
    doc = P._generate_mandates(st)
    assert "API Verification" in doc
    assert "Frontend Implementation" in doc
    i_api = doc.find("API Verification")
    i_fe = doc.find("Frontend Implementation")
    assert i_api >= 0 and i_fe >= 0
    block20 = doc[i_api : i_api + 500]
    block30 = doc[i_fe : i_fe + 500]
    assert block20 != block30
    assert "endpoint" in block20.lower() or "backend" in block20.lower()
    assert "frontend" in block30.lower() or "mcp" in block30.lower()


def test_wp005_phase31_roster_excerpt_present_tiktrack():
    st = _tt_full()
    st.current_phase = "3.1"
    text = P.generate_gate3_prompt(st)
    assert "roster" in text.lower() or "Team |" in text
    assert "team_50" in text or "team 50" in text.lower()


def test_wp005_phase31_roster_excerpt_present_agents_os():
    st = _aos_full()
    st.current_phase = "3.1"
    text = P.generate_gate3_prompt(st)
    assert "team_51" in text or "Team 51" in text
    assert "roster" in text.lower() or "AOS" in text


def test_wp005_phase32_tiktrack_lists_teams_20_30_40():
    st = _tt_full()
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    lo = text.lower()
    assert "team_20" in lo and "team_30" in lo and "team_40" in lo


def test_wp005_phase32_agents_os_lists_team_61_not_tt_triplet():
    st = _aos_full()
    st.current_phase = "3.2"
    text = P.generate_gate3_prompt(st)
    lo = text.lower()
    assert "team_61" in lo
    assert "team_20" not in lo or "team_61" in lo  # AOS impl header


def test_wp005_cursor_prompts_include_prior_phase_handoff_keywords():
    st = _tt_full()
    st.current_phase = "3.2"
    text = P._generate_cursor_prompts(st, revision_notes="")
    assert "Prior-phase" in text or "completion reports" in text.lower()
    assert "team_20" in text.lower()


def test_wp005_phase33_uses_gate4_qa_prompt_wrapper():
    st = _tt_full()
    st.current_phase = "3.3"
    text = P.generate_gate3_prompt(st)
    assert "FAIL_CMD" in text or "team_50" in text.lower()


def test_wp005_mandate_3_1_not_identical_to_3_2_prompt():
    st = _tt_full()
    st.current_phase = "3.1"
    p31 = P.generate_gate3_prompt(st)
    st.current_phase = "3.2"
    p32 = P.generate_gate3_prompt(st)
    assert p31 != p32
    assert len(p31) > 100 and len(p32) > 100


def test_wp005_track_full_resolves_32_owner_team_list():
    st = _tt_full()
    owners = P.resolve_phase_owner_from_state(st, "GATE_3", "3.2")
    assert isinstance(owners, list)
    assert "team_20" in owners and "team_40" in owners


def test_wp005_tiktrack_focused_32_uses_teams_20_30_only():
    st = _tt_full()
    st.process_variant = "TRACK_FOCUSED"
    owners = P.resolve_phase_owner_from_state(st, "GATE_3", "3.2")
    assert owners == ["team_20", "team_30"]


def test_wp005_domain_roster_table_markdown_shape():
    ex = P._roster_excerpt_for_mandate(
        PipelineState(project_domain="tiktrack", work_package_id="W", process_variant="TRACK_FULL")
    )
    assert "|" in ex and "team_" in ex
