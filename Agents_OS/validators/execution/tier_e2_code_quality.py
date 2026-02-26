"""
TIER E2 — E-07 to E-11: Code quality (Phase 2 / GATE_5 only).
"""

import ast
import re
import subprocess
from pathlib import Path
from typing import List, Optional

from agents_os.validators.base.validator_base import ValidatorBase, ValidatorResult

TIKTRACK_IMPORTS = ["api.", "ui.", "tiktrack"]
DEBUG_PATTERNS = [r"print\s*\(", r"breakpoint\s*\(", r"import\s+pdb", r"pdb\.set_trace\s*\("]


def _find_project_root() -> Path:
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


def _scan_imports(root: Path) -> List[str]:
    violations = []
    agents = root / "agents_os"
    if not agents.exists():
        return violations
    for py in agents.rglob("*.py"):
        try:
            tree = ast.parse(py.read_text(encoding="utf-8"))
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if any(p in alias.name for p in TIKTRACK_IMPORTS):
                            violations.append(f"{py.relative_to(root)}: {alias.name}")
                elif isinstance(node, ast.ImportFrom):
                    if node.module and any(p in node.module for p in TIKTRACK_IMPORTS):
                        violations.append(f"{py.relative_to(root)}: from {node.module}")
        except Exception:
            pass
    return violations


def _scan_debug(root: Path) -> List[str]:
    hits = []
    agents = root / "agents_os"
    if not agents.exists():
        return hits
    for py in agents.rglob("*.py"):
        if "tests" in str(py):
            continue
        if "validation_runner" in str(py):
            continue
        txt = py.read_text(encoding="utf-8")
        for pat in DEBUG_PATTERNS:
            if re.search(pat, txt):
                hits.append(f"{py.relative_to(root)}")
                break
    return hits


class TierE2CodeQualityValidator(ValidatorBase):
    """E-07–E-11: Code quality checks."""

    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        results = []
        root = _find_project_root()

        # E-07: Domain isolation — import scan
        viol = _scan_imports(root)
        results.append(ValidatorResult("E-07", len(viol) == 0, "Domain isolation", "; ".join(viol) if viol else "OK"))

        # E-08: Test directory coverage — execution validators have tests in tests/execution/
        tests_dir = root / "agents_os/tests"
        exec_tests = list((tests_dir / "execution").rglob("test_*.py")) if (tests_dir / "execution").exists() else []
        spec_tests = list((tests_dir / "spec").rglob("test_*.py")) if (tests_dir / "spec").exists() else []
        passed_e08 = len(exec_tests) >= 1
        results.append(ValidatorResult("E-08", passed_e08, "Test coverage", "ok" if passed_e08 else "missing"))

        # E-09: Test suite green
        try:
            r = subprocess.run(
                ["python3", "-m", "pytest", "agents_os/tests/", "-q"],
                cwd=root,
                capture_output=True,
                timeout=60,
            )
            passed_e09 = r.returncode == 0
        except Exception as e:
            passed_e09 = False
        results.append(ValidatorResult("E-09", passed_e09, "pytest exit 0", "ok" if passed_e09 else "fail"))

        # E-10: No debug artifacts
        debug_hits = _scan_debug(root)
        results.append(ValidatorResult("E-10", len(debug_hits) == 0, "No debug artifacts", "; ".join(debug_hits) if debug_hits else "OK"))

        # E-11: AST cross-domain scan (same as E-07)
        results.append(ValidatorResult("E-11", len(viol) == 0, "AST boundary scan", "; ".join(viol) if viol else "OK"))

        return results
