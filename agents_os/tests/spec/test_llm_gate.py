"""Tests for llm_gate (mock)."""

import pytest
from agents_os.llm_gate.quality_judge import quality_judge
from agents_os.validators.base.validator_base import ExitCode


def test_quality_judge_mock_pass():
    ec, reason = quality_judge("spec content", llm_call=None)
    assert ec == ExitCode.PASS
    assert "mock" in reason or "PASS" in reason


def test_quality_judge_hold_on_negative():
    def fake_llm_fail(_sys, _user):
        return False, "quality failed"

    ec, reason = quality_judge("spec", llm_call=fake_llm_fail)
    assert ec == ExitCode.HOLD
    assert "quality failed" in reason


def test_quality_judge_pass_on_positive():
    def fake_llm_pass(_sys, _user):
        return True, "ok"

    ec, _ = quality_judge("spec", llm_call=fake_llm_pass)
    assert ec == ExitCode.PASS
