"""Tests for tier_e1_work_plan."""

import pytest
from agents_os.validators.execution.tier_e1_work_plan import TierE1WorkPlanValidator


WP_DEF_SAMPLE = """
## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | S002-P001-WP002 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 6) Completion Criteria (exit criteria)

| Milestone | Criterion |
|-----------|-----------|
| G3.5 PASS | TIER E1 all pass |

## Evidence

team_20 completion report, team_70 completion report
"""


def test_e1_pass():
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run(WP_DEF_SAMPLE)
    assert ec.value == 0
    e01 = next(r for r in results if r.check_id == "E-01")
    assert e01.passed


def test_e1_missing_header():
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run("no header")
    assert ec.value == 1
    e01 = next(r for r in results if r.check_id == "E-01")
    assert not e01.passed


def test_e1_e03_criteria():
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run(WP_DEF_SAMPLE)
    e03 = next(r for r in results if r.check_id == "E-03")
    assert e03.passed


def test_e1_all_six_checks():
    """E-01..E-06: all checks present."""
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run(WP_DEF_SAMPLE)
    ids = {r.check_id for r in results}
    assert ids >= {"E-01", "E-02", "E-03", "E-04", "E-05", "E-06"}
