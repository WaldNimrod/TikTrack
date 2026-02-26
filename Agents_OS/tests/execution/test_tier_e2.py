"""Tests for tier_e2_code_quality."""

import pytest
from agents_os.validators.execution.tier_e2_code_quality import TierE2CodeQualityValidator


def test_e2_run():
    """E-07..E-11: all five checks present."""
    v = TierE2CodeQualityValidator()
    ec, results = v.run("")
    assert len(results) == 5
    ids = {r.check_id for r in results}
    assert ids == {"E-07", "E-08", "E-09", "E-10", "E-11"}


def test_e2_domain_isolation():
    """E-07, E-11: no TikTrack imports."""
    v = TierE2CodeQualityValidator()
    ec, results = v.run("")
    e07 = next(r for r in results if r.check_id == "E-07")
    e11 = next(r for r in results if r.check_id == "E-11")
    assert e07.passed and e11.passed
