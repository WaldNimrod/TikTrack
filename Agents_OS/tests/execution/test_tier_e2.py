"""Tests for tier_e2_code_quality."""

import pytest
from agents_os.validators.execution.tier_e2_code_quality import TierE2CodeQualityValidator


def test_e2_run():
    v = TierE2CodeQualityValidator()
    ec, results = v.run("")
    assert len(results) >= 5
    for r in results:
        assert r.check_id in ("E-07", "E-08", "E-09", "E-10", "E-11")
