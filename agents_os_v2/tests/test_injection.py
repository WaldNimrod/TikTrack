"""Tests for Context Injection System."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.context.injection import (
    load_team_identity,
    load_governance_rules,
    load_conventions,
    build_context_reset,
    build_state_summary,
    build_identity_header,
    build_canonical_message,
    build_full_agent_prompt,
)


class TestTeamIdentity:
    def test_load_team_90(self):
        identity = load_team_identity("team_90")
        assert "The Spy" in identity
        assert "GATE_5" in identity

    def test_load_team_20(self):
        identity = load_team_identity("team_20")
        assert "Backend" in identity

    def test_load_team_190(self):
        identity = load_team_identity("team_190")
        assert "Constitutional" in identity

    def test_load_all_teams(self):
        teams = ["team_00", "team_10", "team_20", "team_30", "team_40",
                 "team_50", "team_60", "team_70", "team_90", "team_100",
                 "team_170", "team_190"]
        for team in teams:
            identity = load_team_identity(team)
            assert "FILE NOT FOUND" not in identity, f"Missing identity for {team}"

    def test_load_nonexistent_team(self):
        identity = load_team_identity("team_999")
        assert "FILE NOT FOUND" in identity


class TestGovernance:
    def test_load_gate_rules(self):
        rules = load_governance_rules()
        assert "SOP-013" in rules
        assert "Seal" in rules
        assert "GATE" in rules

    def test_load_backend_conventions(self):
        conv = load_conventions("backend")
        assert "SQLAlchemy" in conv or "Decimal" in conv

    def test_load_frontend_conventions(self):
        conv = load_conventions("frontend")
        assert "React" in conv or "Vite" in conv


class TestContextReset:
    def test_context_reset_format(self):
        reset = build_context_reset("team_90")
        assert "TEAM 90" in reset
        assert "CONTEXT_RESET" in reset
        assert "active stage" in reset


class TestStateSummary:
    def test_state_summary_has_content(self):
        summary = build_state_summary()
        assert "Backend models" in summary or "STATE_SNAPSHOT" in summary


class TestIdentityHeader:
    def test_header_format(self):
        header = build_identity_header(
            team_from="team_10",
            team_to="team_90",
            gate_id="GATE_5",
            work_package_id="S002-P002-WP001",
        )
        assert "roadmap_id" in header
        assert "GATE_5" in header
        assert "S002-P002-WP001" in header
        assert "PHOENIX_ROADMAP" in header


class TestCanonicalMessage:
    def test_message_format(self):
        msg = build_canonical_message(
            team_from="team_10",
            team_to="team_90",
            gate_id="GATE_5",
            purpose="Validate implementation of strategies CRUD.",
            context_inputs=["LLD400 spec at _COMMUNICATION/...", "Code at api/routers/strategies.py"],
            required_actions=["Validate code against spec", "Check naming conventions"],
            deliverables=["VALIDATION_RESPONSE.md"],
            validation_criteria=["All spec requirements implemented", "Tests pass"],
            work_package_id="S002-P002-WP001",
        )
        assert "## Mandatory Identity Header" in msg
        assert "## 1) Purpose" in msg
        assert "## 2) Context / Inputs" in msg
        assert "## 3) Required actions" in msg
        assert "## 5) Validation criteria" in msg
        assert "GATE_5" in msg
        assert "log_entry" in msg


class TestFullAgentPrompt:
    def test_full_prompt_has_all_layers(self):
        prompt = build_full_agent_prompt(
            team_id="team_90",
            gate_id="GATE_5",
            task_message="Validate the strategies implementation.",
            work_package_id="S002-P002-WP001",
        )
        assert "CONTEXT_RESET" in prompt
        assert "Layer 1" in prompt
        assert "Layer 2" in prompt
        assert "Layer 3" in prompt
        assert "Drift Prevention" in prompt
        assert "GATE_5" in prompt
        assert "S002-P002-WP001" in prompt

    def test_full_prompt_with_conventions(self):
        prompt = build_full_agent_prompt(
            team_id="team_20",
            gate_id="GATE_3",
            task_message="Implement strategies CRUD.",
            include_conventions=True,
            scope="backend",
        )
        assert "Coding Conventions" in prompt
