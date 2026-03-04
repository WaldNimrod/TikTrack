"""Tests for Validators."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.validators.identity_header import validate_identity_header
from agents_os_v2.validators.section_structure import validate_section_structure
from agents_os_v2.validators.gate_compliance import validate_gate_compliance
from agents_os_v2.validators.spec_compliance import validate_spec_compliance


VALID_MESSAGE = """
# TEST_MESSAGE

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP001 |
| task_id | N/A |
| gate_id | GATE_5 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose
Test purpose.

## 2) Context / Inputs
1. Input A

## 3) Required actions
1. Action A

## 4) Deliverables and paths
1. Deliverable A

## 5) Validation criteria (PASS/FAIL)
1. Criterion A

## 6) Response required
- Decision: PASS

log_entry | TEAM_90 | TEST | PASS | 2026-03-03
"""


class TestIdentityHeader:
    def test_valid_header_passes(self):
        findings = validate_identity_header(VALID_MESSAGE)
        statuses = {f.status for f in findings}
        assert "BLOCK" not in statuses

    def test_missing_header_blocks(self):
        findings = validate_identity_header("No header here")
        assert any(f.status == "BLOCK" for f in findings)

    def test_empty_field_blocks(self):
        bad = VALID_MESSAGE.replace("PHOENIX_ROADMAP", "")
        findings = validate_identity_header(bad)
        assert any(f.status == "BLOCK" for f in findings)


class TestSectionStructure:
    def test_valid_sections_pass(self):
        findings = validate_section_structure(VALID_MESSAGE)
        statuses = {f.status for f in findings}
        assert "BLOCK" not in statuses

    def test_missing_section_blocks(self):
        bad = VALID_MESSAGE.replace("## 3) Required actions", "")
        findings = validate_section_structure(bad)
        assert any(f.status == "BLOCK" for f in findings)

    def test_missing_log_entry_blocks(self):
        bad = VALID_MESSAGE.replace("log_entry", "")
        findings = validate_section_structure(bad)
        assert any(f.status == "BLOCK" for f in findings)


class TestGateCompliance:
    def test_valid_gate(self):
        msg_with_prereq = VALID_MESSAGE + "\nPrerequisite: GATE_4 PASS achieved."
        findings = validate_gate_compliance(msg_with_prereq, "GATE_5")
        statuses = {f.status for f in findings}
        assert "BLOCK" not in statuses

    def test_invalid_gate_id(self):
        findings = validate_gate_compliance("", "GATE_99")
        assert any(f.status == "BLOCK" for f in findings)

    def test_pre_gate_3_blocked(self):
        findings = validate_gate_compliance("PRE_GATE_3 validation", "GATE_3")
        assert any(f.status == "BLOCK" and "PRE_GATE_3" in f.message for f in findings)


class TestSpecCompliance:
    def test_existing_files_pass(self):
        findings = validate_spec_compliance(["api/main.py", "ui/package.json"])
        assert all(f.status == "PASS" for f in findings)

    def test_missing_file_blocks(self):
        findings = validate_spec_compliance(["api/nonexistent_file.py"])
        assert any(f.status == "BLOCK" for f in findings)
