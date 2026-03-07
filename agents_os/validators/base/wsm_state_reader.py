"""
WSM live state reader (read-only) — LLD400 §2.5.
Reads CURRENT_OPERATIONAL_STATE from PHOENIX_MASTER_WSM. No write methods.
"""

from pathlib import Path
from typing import Dict, Optional

WSM_CANONICAL_PATH = "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"


def _find_project_root() -> Path:
    """Locate project root (parent of agents_os)."""
    p = Path(__file__).resolve()
    # agents_os/validators/base/wsm_state_reader.py -> .../agents_os/...
    while p.name and p.name != "agents_os":
        p = p.parent
    if p.name == "agents_os":
        return p.parent
    return Path.cwd()


def read_wsm_state(project_root: Optional[Path] = None) -> Dict[str, str]:
    """
    Read CURRENT_OPERATIONAL_STATE block from WSM.
    Returns dict of Field -> Value. Empty dict on parse failure (WSM_READ_ERROR).
    """
    root = project_root or _find_project_root()
    wsm_path = root / WSM_CANONICAL_PATH
    if not wsm_path.exists():
        return {}

    content = wsm_path.read_text(encoding="utf-8")
    lines = content.splitlines()
    in_block = False
    result = {}

    for line in lines:
        if "CURRENT_OPERATIONAL_STATE" in line and line.strip().startswith("##"):
            in_block = True
            continue
        if in_block:
            if line.strip().startswith("##") or (line.strip().startswith("---") and result):
                break
            if "|" in line:
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) >= 2 and parts[0].lower() != "field":
                    result[parts[0]] = parts[1]

    return result
