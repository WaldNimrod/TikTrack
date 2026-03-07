"""Tests for tier3, tier5, tier7."""

import pytest
from agents_os.validators.spec.tier3_gate_model import Tier3GateModelValidator
from agents_os.validators.spec.tier5_domain_isolation import Tier5DomainIsolationValidator
from agents_os.validators.spec.tier7_lod200_traceability import Tier7Lod200TraceabilityValidator


SAMPLE_HEADER = """
| Field | Value |
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP001 |
| gate_id | GATE_1 |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
"""


def test_tier3_pass():
    v = Tier3GateModelValidator()
    content = "## Mandatory identity header\n" + SAMPLE_HEADER
    ec, results = v.run(content)
    assert ec.value == 0


def test_tier5_domain_isolation():
    v = Tier5DomainIsolationValidator()
    ec, results = v.run("")
    assert any(r.check_id == "V-30" for r in results)
    assert any(r.check_id == "V-31" for r in results)


def test_tier7_traceability():
    v = Tier7Lod200TraceabilityValidator()
    ec1, _ = v.run("source: LOD200. Scope and Risk Register.")
    assert ec1.value == 0
    ec2, _ = v.run("no refs")
    assert ec2.value == 1
