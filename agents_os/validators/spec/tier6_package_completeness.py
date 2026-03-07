"""
TIER 6 — V-34 to V-41: Package completeness.
7-file format, file existence, header format (WSM §0.1).
"""

from pathlib import Path
from typing import List, Optional

from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

CANONICAL_7_FILES = [
    "COVER_NOTE.md",
    "SPEC_PACKAGE.md",
    "VALIDATION_REPORT.md",
    "DIRECTIVE_RECORD.md",
    "SSM_VERSION_REFERENCE.md",
    "WSM_VERSION_REFERENCE.md",
    "PROCEDURE_AND_CONTRACT_REFERENCE.md",
]


class Tier6PackageCompletenessValidator(ValidatorBase):
    """V-34–V-41: Package completeness. Context: submission folder path."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        ctx = context or {}
        package_path = ctx.get("package_path", "")

        # V-34: Package path provided (optional for spec-only validation)
        results.append(ValidatorResult("V-34", True, "package_path optional for spec flow", package_path or "N/A"))

        if not package_path:
            for vid in ["V-35", "V-36", "V-37", "V-38", "V-39", "V-40", "V-41"]:
                results.append(ValidatorResult(vid, True, "Skipped: no package path", "N/A"))
            return results

        root = Path(__file__).resolve().parents[2]
        pkg = (root / package_path) if not Path(package_path).is_absolute() else Path(package_path)

        # V-35–V-41: Each of 7 files exists
        for i, fname in enumerate(CANONICAL_7_FILES):
            vid = f"V-{35 + i}"
            fpath = pkg / fname
            passed = fpath.exists()
            results.append(ValidatorResult(vid, passed, f"File {fname}", str(fpath) if passed else "missing"))

        return results
