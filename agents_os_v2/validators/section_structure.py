from __future__ import annotations
"""
V-14–V-20: Section Structure Validator
Validates canonical message section order per CANONICAL_MESSAGE_FORMAT_LOCK.
"""

from dataclasses import dataclass
import re

REQUIRED_SECTIONS = [
    ("V-14", "## 1) Purpose"),
    ("V-15", "## 2) Context / Inputs"),
    ("V-16", "## 3) Required actions"),
    ("V-17", "## 4) Deliverables and paths"),
    ("V-18", "## 5) Validation criteria"),
    ("V-19", "## 6) Response required"),
]


@dataclass
class Finding:
    check_id: str
    status: str
    message: str
    path: str = ""


def validate_section_structure(content: str, source_path: str = "") -> list[Finding]:
    findings = []
    content_lower = content.lower()

    last_pos = -1
    for check_id, section_title in REQUIRED_SECTIONS:
        section_lower = section_title.lower()
        pos = content_lower.find(section_lower)

        if pos == -1:
            alt = section_title.split(")")[1].strip().lower() if ")" in section_title else ""
            if alt:
                pos = content_lower.find(alt)

        if pos == -1:
            findings.append(Finding(
                check_id=check_id,
                status="BLOCK",
                message=f"Required section '{section_title}' not found",
                path=source_path,
            ))
        elif pos < last_pos:
            findings.append(Finding(
                check_id=check_id,
                status="BLOCK",
                message=f"Section '{section_title}' found but out of order",
                path=source_path,
            ))
        else:
            last_pos = pos

    log_entry = re.search(r"log_entry\s*\|", content)
    if not log_entry:
        findings.append(Finding(
            check_id="V-20",
            status="BLOCK",
            message="Missing log_entry line at end of message",
            path=source_path,
        ))

    if not findings:
        findings.append(Finding(
            check_id="V-14–V-20",
            status="PASS",
            message="All required sections present in correct order",
            path=source_path,
        ))

    return findings
