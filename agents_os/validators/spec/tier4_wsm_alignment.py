"""
TIER 4 — V-25 to V-29: WSM/SSM alignment.
Cross-reference to live WSM CURRENT_OPERATIONAL_STATE.
"""

from typing import List, Optional

from agents_os.validators.base.message_parser import parse_message
from agents_os.validators.base.wsm_state_reader import read_wsm_state
from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult


class Tier4WsmAlignmentValidator(ValidatorBase):
    """V-25–V-29: WSM alignment checks."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        wsm = read_wsm_state()

        # V-25: WSM readable
        results.append(ValidatorResult("V-25", len(wsm) > 0, "WSM CURRENT_OPERATIONAL_STATE readable", "" if wsm else "WSM_READ_ERROR"))

        if not wsm:
            for vid in ["V-26", "V-27", "V-28", "V-29"]:
                results.append(ValidatorResult(vid, False, "WSM unreadable; skip alignment", ""))
            return results

        parsed = parse_message(content)
        h = parsed.identity_header

        # V-26: stage_id aligns with active_stage_id
        active_stage = wsm.get("active_stage_id", "")
        doc_stage = (h.stage_id if h else "") or ""
        results.append(ValidatorResult("V-26", doc_stage == active_stage or not doc_stage, "stage_id vs WSM active_stage_id", f"{doc_stage} vs {active_stage}"))

        # V-27: work_package_id aligns with active_work_package_id when provided
        active_wp = wsm.get("active_work_package_id", "")
        doc_wp = (h.work_package_id if h else "") or ""
        doc_wp_na = not doc_wp or str(doc_wp).strip().upper() == "N/A"
        passed = doc_wp_na or doc_wp == active_wp
        results.append(ValidatorResult("V-27", passed, "work_package_id vs WSM active_work_package_id", f"{doc_wp} vs {active_wp}"))

        # V-28: gate_id in allowed range
        allowed = wsm.get("allowed_gate_range", "")
        doc_gate = (h.gate_id if h else "") or ""
        passed = not doc_gate or doc_gate in allowed or "GATE" in allowed
        results.append(ValidatorResult("V-28", passed, "gate_id in allowed range", doc_gate))

        # V-29: required_active_stage matches WSM active_stage_label or active_stage_id
        req_stage = (h.required_active_stage if h else "") or ""
        passed = not req_stage or req_stage in active_stage or active_stage in req_stage
        results.append(ValidatorResult("V-29", passed, "required_active_stage alignment", req_stage))

        return results
