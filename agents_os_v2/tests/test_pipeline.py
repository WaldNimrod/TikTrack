"""Tests for Pipeline Orchestrator — state management and routing."""

import sys
import json
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator.gate_router import get_engine_for_gate, get_team_for_gate
from agents_os_v2.conversations.base import GateResult


class TestPipelineState:
    def test_create_default(self):
        state = PipelineState()
        assert state.current_gate == "NOT_STARTED"
        assert state.gates_completed == []

    def test_advance_gate_pass(self):
        state = PipelineState()
        state.advance_gate("GATE_0", "PASS")
        assert "GATE_0" in state.gates_completed
        assert state.current_gate == "GATE_0"

    def test_advance_gate_fail(self):
        state = PipelineState()
        state.advance_gate("GATE_0", "FAIL")
        assert "GATE_0" in state.gates_failed
        assert state.gates_completed == []

    def test_save_and_load(self, tmp_path):
        import agents_os_v2.orchestrator.state as state_mod
        original = state_mod.STATE_FILE
        state_mod.STATE_FILE = tmp_path / "test_state.json"
        try:
            state = PipelineState(work_package_id="S002-P001-WP001", current_gate="GATE_3")
            state.save()
            loaded = PipelineState.load()
            assert loaded.work_package_id == "S002-P001-WP001"
            assert loaded.current_gate == "GATE_3"
        finally:
            state_mod.STATE_FILE = original


class TestGateRouter:
    def test_gate_0_uses_openai(self):
        assert get_engine_for_gate("GATE_0") == "openai"

    def test_gate_2_uses_gemini(self):
        assert get_engine_for_gate("GATE_2") == "gemini"

    def test_gate_4_owner_is_team_10(self):
        assert get_team_for_gate("GATE_4") == "team_10"

    def test_gate_7_owner_is_team_90(self):
        assert get_team_for_gate("GATE_7") == "team_90"

    def test_gate_3_plan_uses_gemini(self):
        assert get_engine_for_gate("GATE_3_PLAN") == "gemini"

    def test_gate_5_uses_openai(self):
        assert get_engine_for_gate("GATE_5") == "openai"

    def test_gate_6_owner_is_team_90(self):
        assert get_team_for_gate("GATE_6") == "team_90"


class TestGateResult:
    def test_pass_result(self):
        r = GateResult(gate_id="GATE_0", status="PASS", next_gate="GATE_1")
        assert r.status == "PASS"
        assert r.next_gate == "GATE_1"

    def test_fail_result(self):
        r = GateResult(gate_id="GATE_5", status="FAIL", findings=[{"check": "SC-01", "message": "missing"}])
        assert r.status == "FAIL"
        assert len(r.findings) == 1
