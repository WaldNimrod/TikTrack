"""Tests for tier_e1_work_plan."""

import pytest
import agents_os.validators.execution.tier_e1_work_plan as tier_e1_module
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


def _stable_wsm_state():
    return {
        "active_work_package_id": "S002-P001-WP002",
        "last_closed_work_package_id": "S002-P001-WP001",
        "allowed_gate_range": "GATE_3 -> GATE_8",
        "last_gate_event": "GATE_3_INTAKE_OPEN | 2026-02-27 | Team 10",
    }


def test_e1_pass(monkeypatch):
    monkeypatch.setattr(tier_e1_module, "read_wsm_state", _stable_wsm_state)
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


def test_e1_e03_criteria(monkeypatch):
    monkeypatch.setattr(tier_e1_module, "read_wsm_state", _stable_wsm_state)
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run(WP_DEF_SAMPLE)
    e03 = next(r for r in results if r.check_id == "E-03")
    assert e03.passed


def test_e1_all_six_checks(monkeypatch):
    """E-01..E-06: all checks present."""
    monkeypatch.setattr(tier_e1_module, "read_wsm_state", _stable_wsm_state)
    v = TierE1WorkPlanValidator(phase=1)
    ec, results = v.run(WP_DEF_SAMPLE)
    ids = {r.check_id for r in results}
    assert ids >= {"E-01", "E-02", "E-03", "E-04", "E-05", "E-06"}
