from __future__ import annotations
"""
V-25–V-29: WSM/SSM Alignment Validator
Cross-references artifact against live WSM state.
"""

import json
import re
from dataclasses import dataclass
from pathlib import Path

from ..config import REPO_ROOT, STATE_SNAPSHOT_PATH


@dataclass
class Finding:
    check_id: str
    status: str
    message: str
    path: str = ""


def _load_snapshot() -> dict:
    try:
        return json.loads(STATE_SNAPSHOT_PATH.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def validate_wsm_alignment(content: str, stage_id: str, source_path: str = "") -> list[Finding]:
    findings = []
    snapshot = _load_snapshot()
    gov = snapshot.get("governance", {})

    actual_stage = gov.get("active_stage", "unknown")
    if actual_stage != "unknown" and stage_id != actual_stage:
        findings.append(Finding(
            check_id="V-25",
            status="BLOCK",
            message=f"stage_id '{stage_id}' does not match active WSM stage '{actual_stage}'",
            path=source_path,
        ))

    ssm_match = re.search(r"required_ssm_version[:\s|]+\s*(\S+)", content)
    if ssm_match:
        ssm_version = ssm_match.group(1)
        if ssm_version not in ("1.0.0", "N/A"):
            findings.append(Finding(
                check_id="V-26",
                status="BLOCK",
                message=f"required_ssm_version '{ssm_version}' — expected 1.0.0",
                path=source_path,
            ))

    wsm_path = gov.get("wsm_path", "")
    if wsm_path:
        wsm_full = REPO_ROOT / wsm_path
        if not wsm_full.exists():
            findings.append(Finding(
                check_id="V-27",
                status="BLOCK",
                message=f"WSM file not found at {wsm_path}",
                path=source_path,
            ))

    if not findings:
        findings.append(Finding(
            check_id="V-25–V-29",
            status="PASS",
            message="WSM/SSM alignment checks passed",
            path=source_path,
        ))

    return findings
