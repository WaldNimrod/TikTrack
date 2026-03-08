from __future__ import annotations
"""
Spec Compliance Validator
Compares implementation files against LLD400 requirements.
"""

import re
from dataclasses import dataclass
from pathlib import Path

from ..config import REPO_ROOT


@dataclass
class Finding:
    check_id: str
    status: str
    message: str
    path: str = ""


def validate_spec_compliance(
    required_files: list[str],
    required_endpoints: list[str] | None = None,
) -> list[Finding]:
    """
    Check that all files specified in the LLD400 exist.
    Optionally check that required API endpoints are registered.
    """
    findings = []

    for fpath in required_files:
        full = REPO_ROOT / fpath
        if not full.exists():
            findings.append(Finding(
                check_id="SC-01",
                status="BLOCK",
                message=f"Required file missing: {fpath}",
                path=fpath,
            ))

    if required_endpoints:
        main_py = REPO_ROOT / "api" / "main.py"
        if main_py.exists():
            main_content = main_py.read_text(encoding="utf-8")
            for endpoint in required_endpoints:
                if endpoint not in main_content:
                    findings.append(Finding(
                        check_id="SC-02",
                        status="BLOCK",
                        message=f"Required endpoint/router '{endpoint}' not registered in api/main.py",
                        path="api/main.py",
                    ))

    if not findings:
        findings.append(Finding(
            check_id="SC-ALL",
            status="PASS",
            message=f"All {len(required_files)} required files exist" +
                    (f", all {len(required_endpoints)} endpoints registered" if required_endpoints else ""),
        ))

    return findings
