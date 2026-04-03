#!/usr/bin/env python3
"""
Move S003-P012 communication files to _COMMUNICATION/_ARCHIVE/S003/S003-P012/
per TEAM_170_S003_P012_GOVERNANCE_CLOSURE_AND_ARCHIVE_MANDATE_v1.0.0.md

Excludes: team_00, agents_os runtime paths, 99-ARCHIVE.
team_170: COPY mandate + AS_MADE to archive; MOVE other S003-P012 files.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
COMM = REPO / "_COMMUNICATION"
ARCHIVE_ROOT = COMM / "_ARCHIVE" / "S003" / "S003-P012"

COPY_ONLY_TEAM170 = {
    "TEAM_170_S003_P012_GOVERNANCE_CLOSURE_AND_ARCHIVE_MANDATE_v1.0.0.md",
    "TEAM_170_S003_P012_AS_MADE_REPORT_v1.0.0.md",
}

SKIP_TEAM170 = {
    "TEAM_170_S003_P012_GOVERNANCE_CLOSURE_DELIVERY_v1.0.0.md",  # written last; stays active
}

TEAM_FOLDERS = (
    "team_50",
    "team_51",
    "team_61",
    "team_90",
    "team_100",
    "team_101",
    "team_170",
)


def matches_s003_p012(name: str) -> bool:
    u = name.upper()
    return "S003_P012" in u or "S003-P012" in u


def git_tracked(path: Path) -> bool:
    r = subprocess.run(
        ["git", "ls-files", "--error-unmatch", str(path)],
        cwd=REPO,
        capture_output=True,
    )
    return r.returncode == 0


def git_mv(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "mv", str(src), str(dst)], cwd=REPO, check=True)


def main() -> int:
    manifest: list[tuple[str, str, str]] = []
    for team in TEAM_FOLDERS:
        td = COMM / team
        if not td.is_dir():
            continue
        for f in sorted(td.rglob("*")):
            if not f.is_file():
                continue
            if not matches_s003_p012(f.name):
                continue
            if team == "team_170" and f.name in SKIP_TEAM170:
                continue
            rel = f.relative_to(COMM)
            dest_dir = ARCHIVE_ROOT / team
            dest = dest_dir / f.name
            if team == "team_170" and f.name in COPY_ONLY_TEAM170:
                dest_dir.mkdir(parents=True, exist_ok=True)
                shutil.copy2(f, dest)
                wp = "PROGRAM"
                manifest.append((str(rel), str(dest.relative_to(COMM)), f"COPY {wp}"))
                continue
            # MOVE
            dest_dir.mkdir(parents=True, exist_ok=True)
            if dest.exists():
                print(f"SKIP exists: {dest}", file=sys.stderr)
                continue
            if git_tracked(f):
                git_mv(f, dest)
            else:
                shutil.move(str(f), str(dest))
            wp = "WP?"
            if "WP001" in f.name:
                wp = "WP001"
            elif "WP002" in f.name:
                wp = "WP002"
            elif "WP003" in f.name:
                wp = "WP003"
            elif "WP004" in f.name:
                wp = "WP004"
            elif "WP005" in f.name:
                wp = "WP005"
            manifest.append((str(rel), str(dest.relative_to(COMM)), wp))

    # Write manifest append to ARCHIVE_MANIFEST.md
    lines = [
        "# Archive Manifest — S003-P012",
        "",
        "date_archived: 2026-03-21",
        "archived_by: Team 170",
        "program_status: DOCUMENTATION_CLOSED",
        "",
        "## Files archived",
        "",
        "| original_path | archived_path | wp |",
        "|---|---|---|",
    ]
    for orig, arch, wp in manifest:
        lines.append(f"| `{orig}` | `{arch}` | {wp} |")
    lines.extend(
        [
            "",
            "## Files NOT archived (reason)",
            "",
            "| path | reason |",
            "|---|---|",
            "| `_COMMUNICATION/team_00/*S003_P012*` | Mandate: Team 00 architect decisions — retain in place |",
            "| `_COMMUNICATION/agents_os/*` | Live operational / prompts — not moved |",
            "| `_COMMUNICATION/_Architects_Decisions/*` | Permanent directives |",
            "| `TEAM_170_S003_P012_GOVERNANCE_CLOSURE_DELIVERY_v1.0.0.md` | Active delivery + Seal (stays in team_170) |",
            "",
        ]
    )
    ARCHIVE_ROOT.mkdir(parents=True, exist_ok=True)
    (ARCHIVE_ROOT / "ARCHIVE_MANIFEST.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"OK: {len(manifest)} operations; manifest -> {ARCHIVE_ROOT / 'ARCHIVE_MANIFEST.md'}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
