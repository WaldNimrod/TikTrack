"""Tests for validation_runner CLI."""

import pytest
from pathlib import Path

from agents_os.orchestrator.validation_runner import run_spec_validation


def _find_project_root():
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


def test_runner_block_on_missing():
    code = run_spec_validation("/nonexistent/path.md")
    assert code == 1


def test_runner_on_real_spec():
    root = _find_project_root()
    lld400 = root / "_COMMUNICATION/team_170/AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md"
    if lld400.exists():
        code = run_spec_validation(str(lld400))
        assert code in (0, 1, 2)
