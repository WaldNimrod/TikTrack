"""
TIER 3 — V-21 to V-24: Gate model validation.
gate_id enum, SSM/WSM version refs, lifecycle chain.
"""

import re
from typing import List, Optional

from agents_os.validators.base.message_parser import parse_message
from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

VALID_GATE_IDS = {"GATE_0", "GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5", "GATE_6", "GATE_7", "GATE_8", "PRE_GATE_3"}


class Tier3GateModelValidator(ValidatorBase):
    """V-21–V-24: Gate model checks."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        parsed = parse_message(content)

        if not parsed.identity_header:
            for vid in ["V-21", "V-22", "V-23", "V-24"]:
                results.append(ValidatorResult(vid, False, "Identity header missing", ""))
            return results

        h = parsed.identity_header

        # V-21: gate_id in enum
        gate_val = (h.gate_id or "").strip()
        passed = gate_val in VALID_GATE_IDS
        results.append(ValidatorResult("V-21", passed, "gate_id in canonical enum", gate_val or "missing"))

        # V-22: required_ssm_version present
        ssm = (h.required_ssm_version or "").strip()
        results.append(ValidatorResult("V-22", bool(ssm), "required_ssm_version present", ssm or "missing"))

        # V-23: required_active_stage present
        stage = (h.required_active_stage or "").strip()
        results.append(ValidatorResult("V-23", bool(stage), "required_active_stage present", stage or "missing"))

        # V-24: work_package_id format (Sxxx-Pxxx-WPxxx) when gate-bound
        wp = (h.work_package_id or "").strip()
        passed = not wp or wp.upper() == "N/A" or bool(re.match(r"^S\d{3}-P\d{3}-WP\d{3}$", wp))
        results.append(ValidatorResult("V-24", passed, "work_package_id format", wp or "N/A"))

        return results
