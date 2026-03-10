from __future__ import annotations

"""Integration tests — mock pipeline run without API calls."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.conversations.base import GateResult
from agents_os_v2.conversations.response_parser import parse_gate_decision


class TestPipelineHappyPath:
    def test_all_gates_pass(self):
        state = PipelineState(work_package_id="S002-P002-WP001", pipe_run_id="test001")
        gates = ["GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
                 "G3_PLAN", "G3_5",
                 "G3_6_MANDATES", "CURSOR_IMPLEMENTATION", "GATE_4",
                 "GATE_5", "GATE_6", "WAITING_GATE6_APPROVAL",
                 "GATE_7", "GATE_8"]
        for gate in gates:
            state.advance_gate(gate, "PASS")
        assert len(state.gates_completed) == 14
        assert len(state.gates_failed) == 0

    def test_conditional_pass_advances(self):
        state = PipelineState(work_package_id="S002-P002-WP001")
        state.advance_gate("GATE_2", "CONDITIONAL_PASS")
        assert "GATE_2" in state.gates_completed


class TestGateFailStops:
    def test_gate_0_fail(self):
        state = PipelineState(work_package_id="S002-P002-WP001")
        state.advance_gate("GATE_0", "FAIL")
        assert "GATE_0" in state.gates_failed
        assert len(state.gates_completed) == 0


class TestG35G36Chain:
    def test_g35_plan_then_g36_mandates(self):
        """G3.5 work plan feeds into G3.6 mandates."""
        state = PipelineState(work_package_id="S002-P002-WP001")
        state.advance_gate("GATE_0", "PASS")
        state.advance_gate("GATE_1", "PASS")
        state.advance_gate("GATE_2", "PASS")
        state.advance_gate("WAITING_GATE2_APPROVAL", "PASS")
        state.advance_gate("G3_PLAN", "PASS")
        state.advance_gate("G3_5", "PASS")
        state.advance_gate("G3_6_MANDATES", "PASS")
        assert "G3_PLAN" in state.gates_completed
        assert "G3_5" in state.gates_completed
        assert "G3_6_MANDATES" in state.gates_completed


class TestResponseParser:
    def test_structured_pass(self):
        content = "## Gate Decision\nSTATUS: PASS\nREASON: All checks passed"
        status, reason = parse_gate_decision(content)
        assert status == "PASS"
        assert "All checks" in reason

    def test_structured_fail(self):
        content = "## Gate Decision\nSTATUS: FAIL\nREASON: Missing identity header"
        status, reason = parse_gate_decision(content)
        assert status == "FAIL"

    def test_structured_conditional(self):
        content = "## Gate Decision\nSTATUS: CONDITIONAL_PASS\nREASON: Minor issues"
        status, reason = parse_gate_decision(content)
        assert status == "CONDITIONAL_PASS"

    def test_structured_approved(self):
        content = "## Gate Decision\nSTATUS: APPROVED\nREASON: Architecturally sound"
        status, reason = parse_gate_decision(content)
        assert status == "PASS"

    def test_fallback_pass(self):
        content = "The spec looks good. PASS."
        status, reason = parse_gate_decision(content)
        assert status == "PASS"
        assert "fallback" in reason

    def test_fallback_fail(self):
        content = "BLOCK: missing required section"
        status, reason = parse_gate_decision(content)
        assert status == "FAIL"
