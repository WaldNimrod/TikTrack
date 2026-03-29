#!/usr/bin/env python3
"""Auto-update agents_os_v3/FILE_INDEX.json with stub entries for new files.

Usage:
    python3 scripts/update_aos_v3_file_index.py

Scans agents_os_v3/ on disk and appends a stub entry for every file that is
not already listed in FILE_INDEX.json.  Existing entries are never modified.
Run this before committing new files to agents_os_v3/ so the governance check
(scripts/check_aos_v3_build_governance.sh) passes without manual edits.
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = ROOT / "agents_os_v3" / "FILE_INDEX.json"

EXCLUDE = {
    "agents_os_v3/.env",
    "agents_os_v3/pipeline_state.json",
    "agents_os_v3/FILE_INDEX.json",
}


def main() -> None:
    data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    indexed = {e["path"] for e in data.get("entries", []) if isinstance(e, dict) and "path" in e}

    added: list[str] = []
    for f in sorted((ROOT / "agents_os_v3").rglob("*")):
        if not f.is_file():
            continue
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        if rel in EXCLUDE or "node_modules" in rel:
            continue
        if rel not in indexed:
            data["entries"].append(
                {
                    "path": rel,
                    "status": "NEW",
                    "spec_ref": "AUTO — update manually with spec_ref and owner_team",
                    "owner_team": "team_61",
                    "added_in_gate": "PENDING",
                    "notes": "Auto-added by scripts/update_aos_v3_file_index.py",
                }
            )
            added.append(rel)

    if added:
        INDEX_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Added {len(added)} stub entries to FILE_INDEX.json:")
        for p in added:
            print(f"  + {p}")
    else:
        print("FILE_INDEX.json is up to date — no new files found.")


if __name__ == "__main__":
    main()
