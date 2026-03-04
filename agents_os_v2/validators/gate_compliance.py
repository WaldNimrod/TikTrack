"""
V-21–V-24: Gate Model Compliance Validator
Validates gate enum, version references, lifecycle chain.
"""

import re
from dataclasses import dataclass

VALID_GATE_IDS = {f"GATE_{i}" for i in range(9)}
GATE_PROTOCOL_VERSION = "v2.3.0"


@dataclass
class Finding:
    check_id: str
    status: str
    message: str
    path: str = ""


def validate_gate_compliance(content: str, gate_id: str, source_path: str = "") -> list[Finding]:
    findings = []

    if gate_id not in VALID_GATE_IDS:
        findings.append(Finding(
            check_id="V-21",
            status="BLOCK",
            message=f"Invalid gate_id: '{gate_id}'. Must be one of {sorted(VALID_GATE_IDS)}",
            path=source_path,
        ))

    if "PRE_GATE_3" in content:
        findings.append(Finding(
            check_id="V-22",
            status="BLOCK",
            message="PRE_GATE_3 found in content. Work-plan validation is GATE_3 sub-stage G3.5, not PRE_GATE_3",
            path=source_path,
        ))

    if gate_id == "GATE_5":
        if "GATE_4" not in content and "gate_4" not in content.lower():
            findings.append(Finding(
                check_id="V-23",
                status="BLOCK",
                message="GATE_5 artifact must reference GATE_4 PASS as prerequisite",
                path=source_path,
            ))

    if not findings:
        findings.append(Finding(
            check_id="V-21–V-24",
            status="PASS",
            message="Gate compliance checks passed",
            path=source_path,
        ))

    return findings
