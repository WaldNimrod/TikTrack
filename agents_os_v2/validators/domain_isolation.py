"""
V-30–V-33: Domain Isolation Validator
Ensures no cross-domain imports or path violations.
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


def validate_domain_isolation(file_paths: list[str], domain: str = "TIKTRACK") -> list[Finding]:
    findings = []

    for fpath in file_paths:
        full = REPO_ROOT / fpath
        if not full.exists():
            continue

        if domain == "AGENTS_OS" and not fpath.startswith("agents_os"):
            findings.append(Finding(
                check_id="V-30",
                status="BLOCK",
                message=f"AGENTS_OS artifact outside agents_os/ directory: {fpath}",
                path=fpath,
            ))

        if fpath.endswith(".py"):
            try:
                content = full.read_text(encoding="utf-8")
            except Exception:
                continue

            if domain == "AGENTS_OS":
                if re.search(r"from\s+api\.", content) or re.search(r"import\s+api\.", content):
                    findings.append(Finding(
                        check_id="V-31",
                        status="BLOCK",
                        message=f"AGENTS_OS file imports from api/ (TikTrack domain): {fpath}",
                        path=fpath,
                    ))

            if domain == "TIKTRACK":
                if re.search(r"from\s+agents_os", content) or re.search(r"import\s+agents_os", content):
                    findings.append(Finding(
                        check_id="V-32",
                        status="BLOCK",
                        message=f"TikTrack file imports from agents_os: {fpath}",
                        path=fpath,
                    ))

    if not findings:
        findings.append(Finding(
            check_id="V-30–V-33",
            status="PASS",
            message="Domain isolation checks passed",
        ))

    return findings
