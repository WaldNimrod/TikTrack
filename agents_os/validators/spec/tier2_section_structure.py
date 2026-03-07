"""
TIER 2 — V-14 to V-20: Section structure (gated on T001 templates).
Reads LOD200/LLD400 templates; validates spec has required sections.
"""

from pathlib import Path
from typing import List, Optional

from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

LOD200_TEMPLATE_PATH = "documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md"
LLD400_TEMPLATE_PATH = "documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md"


def _find_project_root() -> Path:
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


class Tier2SectionStructureValidator(ValidatorBase):
    """V-14–V-20: Section structure validation. Gated on T001 templates."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        root = _find_project_root()

        lod200 = root / LOD200_TEMPLATE_PATH
        lld400 = root / LLD400_TEMPLATE_PATH

        if not lod200.exists():
            results.append(ValidatorResult("V-14", False, "LOD200 template missing (T001)", str(lod200)))
        else:
            results.append(ValidatorResult("V-14", True, "LOD200 template exists", str(lod200)))

        if not lld400.exists():
            results.append(ValidatorResult("V-15", False, "LLD400 template missing (T001)", str(lld400)))
        else:
            results.append(ValidatorResult("V-15", True, "LLD400 template exists", str(lld400)))

        if not lod200.exists() or not lld400.exists():
            for vid in ["V-16", "V-17", "V-18", "V-19", "V-20"]:
                results.append(ValidatorResult(vid, False, "Templates missing; Tier2 gated on T001", ""))
            return results

        # LLD400 required sections (per LLD400 §6)
        lld400_sections = [
            ("Identity Header", "V-16"),
            ("Program Definition", "V-17"),
            ("Repo Reality Evidence", "V-18"),
            ("Proposed Deltas", "V-19"),
            ("Risk Register", "V-20"),
        ]
        for section, vid in lld400_sections:
            passed = section in content
            results.append(ValidatorResult(vid, passed, f"Section {section}", "present" if passed else "missing"))

        return results
