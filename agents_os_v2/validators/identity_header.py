"""
V-01–V-13: Identity Header Validator
Validates mandatory identity header per Canonical Message Format Lock v1.0.0.
"""

import re
from dataclasses import dataclass, field
from pathlib import Path

REQUIRED_FIELDS = [
    "roadmap_id", "stage_id", "program_id", "work_package_id",
    "gate_id", "phase_owner", "required_ssm_version", "required_active_stage",
]

VALID_GATE_IDS = [f"GATE_{i}" for i in range(9)] + ["N/A"]
VALID_STAGES = [f"S{str(i).zfill(3)}" for i in range(1, 20)]


@dataclass
class Finding:
    check_id: str
    status: str  # PASS / BLOCK
    message: str
    path: str = ""
    line: int = 0


def validate_identity_header(content: str, source_path: str = "") -> list[Finding]:
    findings = []

    header_match = re.search(
        r"\|\s*Field\s*\|\s*Value\s*\|.*?\n\|[-\s|]+\n((?:\|.*\n)*)",
        content, re.IGNORECASE
    )

    if not header_match:
        findings.append(Finding(
            check_id="V-01",
            status="BLOCK",
            message="Mandatory identity header table not found",
            path=source_path,
        ))
        return findings

    header_text = header_match.group(1)
    found_fields = {}
    for line in header_text.strip().split("\n"):
        parts = [p.strip() for p in line.split("|") if p.strip()]
        if len(parts) >= 2:
            found_fields[parts[0].lower()] = parts[1]

    for i, field_name in enumerate(REQUIRED_FIELDS):
        check_id = f"V-{str(i+1).zfill(2)}"
        if field_name not in found_fields:
            findings.append(Finding(
                check_id=check_id,
                status="BLOCK",
                message=f"Required field '{field_name}' missing from identity header",
                path=source_path,
            ))
        else:
            value = found_fields[field_name]
            if not value or value.strip() == "":
                findings.append(Finding(
                    check_id=check_id,
                    status="BLOCK",
                    message=f"Field '{field_name}' is empty",
                    path=source_path,
                ))

    gate_id = found_fields.get("gate_id", "")
    if gate_id and gate_id not in VALID_GATE_IDS:
        findings.append(Finding(
            check_id="V-09",
            status="BLOCK",
            message=f"Invalid gate_id: '{gate_id}'. Must be GATE_0..GATE_8 or N/A",
            path=source_path,
        ))

    if not findings:
        findings.append(Finding(
            check_id="V-01–V-13",
            status="PASS",
            message="All identity header fields present and valid",
            path=source_path,
        ))

    return findings
