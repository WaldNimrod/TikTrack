"""
Canonical message format parser — LLD400 §2.5.
Parses metadata block and mandatory identity header per Gate Protocol v2.3.0.
"""

from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class ParsedHeader:
    """Mandatory identity header fields (Gate Protocol §1.4)."""

    roadmap_id: Optional[str] = None
    stage_id: Optional[str] = None
    program_id: Optional[str] = None
    work_package_id: Optional[str] = None
    task_id: Optional[str] = None
    gate_id: Optional[str] = None
    phase_owner: Optional[str] = None
    required_ssm_version: Optional[str] = None
    required_active_stage: Optional[str] = None


@dataclass
class ParsedMessage:
    """Parsed canonical message."""

    metadata: Dict[str, str] = field(default_factory=dict)
    identity_header: Optional[ParsedHeader] = None
    raw_text: str = ""
    parse_errors: list = field(default_factory=list)


def _extract_metadata(lines: list) -> "tuple[Dict[str, str], int]":
    """Extract **key** | **key:** value pairs. Returns (metadata, last_index)."""
    meta = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith("#"):
            break
        if not s:
            i += 1
            continue
        if s.startswith("**") and "**" in s[2:]:
            # **key:** value or **key** |
            parts = s.split(":", 1)
            if len(parts) == 2:
                key = parts[0].strip().strip("*").strip()
                val = parts[1].strip().strip("*").strip()
                if key:
                    meta[key] = val
        i += 1
    return meta, i


def _extract_table(lines: list, start: int) -> "tuple[Dict[str, str], int]":
    """Extract | col1 | col2 | table. Returns (field->value dict, last_index)."""
    result = {}
    i = start
    while i < len(lines):
        line = lines[i]
        if not line.strip().startswith("|"):
            break
        parts = [p.strip() for p in line.split("|") if p.strip()]
        if len(parts) >= 2 and parts[0].lower() != "field":
            result[parts[0]] = parts[1]
        i += 1
    return result, i


def parse_message(content: str) -> ParsedMessage:
    """
    Parse canonical message format:
    1. Metadata block (**key:** value)
    2. ## Mandatory identity header table
    """
    msg = ParsedMessage(raw_text=content)
    lines = content.splitlines()

    meta, i = _extract_metadata(lines)
    msg.metadata = meta

    while i < len(lines):
        if "mandatory identity header" in lines[i].lower() or "identity header" in lines[i].lower():
            i += 1
            while i < len(lines) and (not lines[i].strip() or lines[i].strip().startswith("|")):
                if lines[i].strip().startswith("|"):
                    tbl, i = _extract_table(lines, i)
                    if tbl:
                        msg.identity_header = ParsedHeader(
                            roadmap_id=tbl.get("roadmap_id"),
                            stage_id=tbl.get("stage_id"),
                            program_id=tbl.get("program_id"),
                            work_package_id=tbl.get("work_package_id"),
                            task_id=tbl.get("task_id"),
                            gate_id=tbl.get("gate_id"),
                            phase_owner=tbl.get("phase_owner"),
                            required_ssm_version=tbl.get("required_ssm_version"),
                            required_active_stage=tbl.get("required_active_stage"),
                        )
                    break
                i += 1
            break
        i += 1

    return msg
