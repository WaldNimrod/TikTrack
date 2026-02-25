"""
TIER 5 — V-30 to V-33: Domain isolation.
Path patterns, no TikTrack imports (LLD400 §2.3).
"""

import ast
from pathlib import Path
from typing import List, Optional

from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

TIKTRACK_IMPORT_PATTERNS = ["api.", "ui.", "tiktrack"]


def _find_project_root() -> Path:
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


def _scan_agents_os_for_tiktrack_imports(root: Path) -> List[str]:
    """AST scan of agents_os for TikTrack imports."""
    violations = []
    agents_dir = root / "agents_os"
    if not agents_dir.exists():
        return violations
    for py in agents_dir.rglob("*.py"):
        try:
            tree = ast.parse(py.read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if any(p in alias.name for p in TIKTRACK_IMPORT_PATTERNS):
                            violations.append(f"{py.relative_to(root)}: import {alias.name}")
                elif isinstance(node, ast.ImportFrom):
                    if node.module and any(p in node.module for p in TIKTRACK_IMPORT_PATTERNS):
                        violations.append(f"{py.relative_to(root)}: from {node.module}")
        except Exception:
            pass
    return violations


class Tier5DomainIsolationValidator(ValidatorBase):
    """V-30–V-33: Domain isolation checks."""

    def __init__(self):
        super().__init__(check_prefix="V-")

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        root = _find_project_root()

        # V-30: agents_os path exists
        agents = root / "agents_os"
        results.append(ValidatorResult("V-30", agents.exists(), "agents_os path exists", str(agents)))

        # V-31: No TikTrack imports in agents_os (AST scan)
        violations = _scan_agents_os_for_tiktrack_imports(root)
        results.append(ValidatorResult("V-31", len(violations) == 0, "No TikTrack imports", "; ".join(violations) if violations else "OK"))

        # V-32: Content does not reference TikTrack code paths
        refs = ["api/", "ui/", "from api", "from ui", "import api", "import ui"]
        found = [r for r in refs if r in content]
        results.append(ValidatorResult("V-32", len(found) == 0, "Spec content no TikTrack paths", "; ".join(found) if found else "OK"))

        # V-33: project_domain in allowed set
        domain_refs = ["AGENTS_OS", "TIKTRACK", "SHARED"]
        has_domain = any(d in content for d in domain_refs)
        results.append(ValidatorResult("V-33", has_domain, "project_domain in content", "OK" if has_domain else "missing"))

        return results
