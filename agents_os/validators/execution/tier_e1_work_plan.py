"""
TIER E1 — E-01 to E-06: Work plan integrity.
Phase 1 (G3.5): declaration only. Phase 2 (GATE_5): physical checks.
"""

from pathlib import Path
from typing import List, Optional

from agents_os.validators.base.message_parser import parse_message
from agents_os.validators.base.wsm_state_reader import read_wsm_state
from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

E1_REQUIRED_FIELDS = [
    "roadmap_id", "stage_id", "program_id", "work_package_id",
    "task_id", "gate_id", "phase_owner", "required_ssm_version", "required_active_stage",
]


def _find_project_root() -> Path:
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


class TierE1WorkPlanValidator(ValidatorBase):
    """E-01–E-06: Work plan integrity."""

    def __init__(self, phase: int = 1):
        super().__init__(check_prefix="E-")
        self.phase = phase
        self.check_physical = phase >= 2

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        parsed = parse_message(content)
        ctx = context or {}
        submission_path = ctx.get("submission_path", "")
        root = _find_project_root()

        # E-01: Identity header completeness (9 fields)
        h_dict = {}
        if parsed.identity_header:
            h = parsed.identity_header
            h_dict = {
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
        def _field_ok(f: str, v) -> bool:
            if v is None:
                return False
            s = str(v).strip()
            if not s:
                return False
            if f == "task_id" and s.upper() == "N/A":
                return True
            return s.upper() != "N/A" or f == "task_id"
        all_present = all(_field_ok(f, h_dict.get(f)) for f in E1_REQUIRED_FIELDS) if h_dict else False
        results.append(ValidatorResult("E-01", all_present, "Identity header completeness", "9 fields" if all_present else "missing"))

        # E-02: Gate prerequisite chain (WSM)
        wsm = read_wsm_state()
        passed_e02 = len(wsm) > 0 and ("last_gate_event" in wsm or "last_closed_work_package_id" in wsm)
        results.append(ValidatorResult("E-02", passed_e02, "WSM prerequisite state", "" if passed_e02 else "WSM_READ_ERROR"))

        # E-03: Completion criteria defined
        has_criteria = "completion_criteria" in content.lower() or "exit_criteria" in content.lower() or "Completion Criteria" in content
        results.append(ValidatorResult("E-03", has_criteria, "Completion criteria section", "present" if has_criteria else "missing"))

        # E-04: Evidence index declared (Phase 1: declaration; Phase 2: physical)
        c_lower = content.lower()
        has_evidence_ref = (
            "evidence" in c_lower
            or "completion report" in c_lower
            or "completion_report" in c_lower
            or "team_20" in c_lower
            or "team_70" in c_lower
            or "team 20" in c_lower
            or "team 70" in c_lower
            or "artifacts to build" in c_lower
        )
        if self.check_physical and submission_path:
            base = root / submission_path if not Path(submission_path).is_absolute() else Path(submission_path)
            ev_exists = (base / "_COMMUNICATION" / "team_20").exists() or (base / "team_20").exists()
            passed_e04 = has_evidence_ref and ev_exists
        else:
            passed_e04 = has_evidence_ref
        results.append(ValidatorResult("E-04", passed_e04, "Evidence index", "present" if passed_e04 else "missing"))

        # E-05: Team activation compliance (Phase 1: declaration; Phase 2: physical)
        has_team_ref = "team_20" in content or "team_70" in content or "Team 20" in content or "Team 70" in content
        if self.check_physical and submission_path:
            base = root / submission_path if not Path(submission_path).is_absolute() else Path(submission_path)
            t20_report = (base / "_COMMUNICATION/team_20").exists() if base.exists() else False
            passed_e05 = has_team_ref and t20_report
        else:
            passed_e05 = has_team_ref
        results.append(ValidatorResult("E-05", passed_e05, "Team activation compliance", "ok" if passed_e05 else "check"))

        # E-06: WSM active scope consistency
        if not wsm or not parsed.identity_header:
            results.append(ValidatorResult("E-06", False, "WSM/header missing", ""))
        else:
            active_wp = wsm.get("active_work_package_id", "")
            last_wp = wsm.get("last_closed_work_package_id", "")
            doc_wp = (h_dict.get("work_package_id") or "").strip()
            allowed = wsm.get("allowed_gate_range", "")
            doc_gate = (h_dict.get("gate_id") or "").strip()
            wp_ok = doc_wp in (active_wp, last_wp) or active_wp in doc_wp or last_wp in doc_wp
            gate_ok = not doc_gate or doc_gate in allowed or "GATE" in allowed
            passed_e06 = wp_ok and gate_ok
            results.append(ValidatorResult("E-06", passed_e06, "WSM scope", f"{doc_wp} vs {active_wp}"))

        return results
