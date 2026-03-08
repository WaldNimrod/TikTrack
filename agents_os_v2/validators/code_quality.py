from __future__ import annotations
"""
Code Quality Validator — wraps pytest, mypy, bandit, vite build.
Returns structured pass/fail results.
"""

import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

from ..config import REPO_ROOT


@dataclass
class QualityResult:
    check: str
    passed: bool
    output: str
    exit_code: int


def _run(cmd: list[str], cwd: Path = REPO_ROOT, timeout: int = 120) -> QualityResult:
    check_name = " ".join(cmd[:3])
    try:
        result = subprocess.run(
            cmd, cwd=str(cwd), capture_output=True, text=True, timeout=timeout,
        )
        return QualityResult(
            check=check_name,
            passed=result.returncode == 0,
            output=result.stdout[-2000:] if result.stdout else result.stderr[-2000:],
            exit_code=result.returncode,
        )
    except subprocess.TimeoutExpired:
        return QualityResult(check=check_name, passed=False, output="TIMEOUT", exit_code=-1)
    except FileNotFoundError:
        return QualityResult(check=check_name, passed=False, output="Command not found", exit_code=-1)


def run_unit_tests() -> QualityResult:
    return _run([sys.executable, "-m", "pytest", "tests/unit/", "-v", "--tb=short"])


def run_mypy() -> QualityResult:
    return _run([sys.executable, "-m", "mypy", "api/", "--config-file", "api/mypy.ini", "--no-error-summary"])


def run_bandit() -> QualityResult:
    return _run([sys.executable, "-m", "bandit", "-r", "api/", "--exclude", "api/venv", "-ll", "-q"])


def run_vite_build() -> QualityResult:
    return _run(["npx", "vite", "build"], cwd=REPO_ROOT / "ui")


def run_all_quality_checks() -> list[QualityResult]:
    return [run_unit_tests(), run_bandit(), run_vite_build()]
