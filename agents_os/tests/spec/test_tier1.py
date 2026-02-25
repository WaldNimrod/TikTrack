"""Tests for tier1_identity_header."""

import pytest
from agents_os.validators.spec.tier1_identity_header import Tier1IdentityHeaderValidator


SAMPLE_FULL = """
## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP001 |
| task_id | N/A |
| gate_id | GATE_1 |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
"""


def test_tier1_pass():
    v = Tier1IdentityHeaderValidator()
    ec, results = v.run(SAMPLE_FULL)
    assert ec.value == 0
    assert all(r.passed for r in results)


def test_tier1_missing_header():
    v = Tier1IdentityHeaderValidator()
    ec, results = v.run("no identity header here")
    assert ec.value == 1
    failed = [r for r in results if not r.passed]
    assert len(failed) > 0


def test_tier1_invalid_format():
    bad = """
## Mandatory identity header
| Field | Value |
| stage_id | INVALID |
| program_id | bad |
"""
    v = Tier1IdentityHeaderValidator()
    ec, results = v.run(bad)
    assert ec.value == 1
