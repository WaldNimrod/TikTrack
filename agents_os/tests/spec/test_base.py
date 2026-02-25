"""Tests for validators/base."""

import pytest
from agents_os.validators.base.message_parser import parse_message
from agents_os.validators.base.validator_base import ValidatorBase, ExitCode, ValidatorResult
from agents_os.validators.base.response_generator import generate_response
from agents_os.validators.base.seal_generator import generate_seal
from agents_os.validators.base.wsm_state_reader import read_wsm_state


SAMPLE_CANONICAL = """
**project_domain:** AGENTS_OS
**id:** TEST_SPEC
**from:** Team 170
**to:** Team 190
**date:** 2026-02-25
**status:** SUBMITTED
**gate_id:** GATE_1

---

## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_1 |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
"""


def test_parse_message_metadata():
    parsed = parse_message(SAMPLE_CANONICAL)
    assert parsed.metadata.get("project_domain") == "AGENTS_OS"
    assert parsed.metadata.get("gate_id") == "GATE_1"


def test_parse_message_identity_header():
    parsed = parse_message(SAMPLE_CANONICAL)
    assert parsed.identity_header is not None
    assert parsed.identity_header.stage_id == "S002"
    assert parsed.identity_header.gate_id == "GATE_1"
    assert parsed.identity_header.required_ssm_version == "1.0.0"


def test_exit_code_values():
    assert int(ExitCode.PASS) == 0
    assert int(ExitCode.BLOCK) == 1
    assert int(ExitCode.HOLD) == 2


def test_response_generator():
    r1 = ValidatorResult("V-01", True, "ok")
    r2 = ValidatorResult("V-02", False, "fail")
    resp = generate_response(ExitCode.BLOCK, [r1, r2])
    assert resp["verdict"] == "BLOCK"
    assert resp["passed"] == 1
    assert resp["failed"] == 1


def test_seal_generator():
    seal = generate_seal("L2-001", "COMPLETED", ["a.py"], "PASS", "Handover")
    assert "--- PHOENIX TASK SEAL ---" in seal
    assert "TASK_ID: L2-001" in seal
    assert "STATUS: COMPLETED" in seal
    assert "PRE_FLIGHT: PASS" in seal


def test_wsm_state_reader():
    state = read_wsm_state()
    assert isinstance(state, dict)
    if state:
        assert "active_stage_id" in state or "active_work_package_id" in state
