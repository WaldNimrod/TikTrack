"""
TIER 1 — V-01 to V-13: Identity header presence and format.
Gate Protocol v2.3.0 §1.4.
"""

import re
from typing import List, Optional

from agents_os.validators.base.message_parser import parse_message, ParsedMessage
from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

REQUIRED_FIELDS = [
    ("roadmap_id", "V-01"),
    ("stage_id", "V-02"),
    ("program_id", "V-03"),
    ("work_package_id", "V-04"),
    ("gate_id", "V-05"),
    ("phase_owner", "V-06"),
    ("required_ssm_version", "V-07"),
    ("required_active_stage", "V-08"),
]

OPTIONAL_FIELDS = [
    ("task_id", "V-09"),
]

FORMAT_CHECKS = [
    ("stage_id", r"^S\d{3}$", "V-10"),
    ("program_id", r"^S\d{3}-P\d{3}$", "V-11"),
    ("work_package_id", r"^S\d{3}-P\d{3}-WP\d{3}$", "V-12"),
    ("gate_id", r"^(GATE_[0-8]|PRE_GATE_3)$", "V-13"),
]


class Tier1IdentityHeaderValidator(ValidatorBase):
    """V-01–V-13: Identity header validation."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        parsed = parse_message(content)

        if not parsed.identity_header:
            for _, vid in REQUIRED_FIELDS + OPTIONAL_FIELDS:
                results.append(ValidatorResult(vid, False, "Mandatory identity header missing", "No identity header table found"))
            return results

        h = parsed.identity_header
        header_dict = {
            "roadmap_id": h.roadmap_id,
            "stage_id": h.stage_id,
            "program_id": h.program_id,
            "work_package_id": h.work_package_id,
            "task_id": h.task_id,
            "gate_id": h.gate_id,
            "phase_owner": h.phase_owner,
            "required_ssm_version": h.required_ssm_version,
            "required_active_stage": h.required_active_stage,
        }

        for field, vid in REQUIRED_FIELDS:
            val = header_dict.get(field)
            passed = val is not None and str(val).strip() and str(val).strip().upper() != "N/A"
            results.append(ValidatorResult(vid, passed, f"{field} required" if not passed else f"{field} present", val))

        for field, vid in OPTIONAL_FIELDS:
            val = header_dict.get(field)
            passed = True
            results.append(ValidatorResult(vid, passed, f"{field} optional", val or "N/A"))

        for field, pattern, vid in FORMAT_CHECKS:
            val = header_dict.get(field)
            if not val or str(val).strip().upper() == "N/A":
                results.append(ValidatorResult(vid, True, f"{field} format skipped (optional)", ""))
                continue
            passed = bool(re.match(pattern, str(val).strip()))
            results.append(ValidatorResult(vid, passed, f"{field} format" if passed else f"{field} invalid format", val))

        return results
