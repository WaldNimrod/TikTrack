#!/usr/bin/env python3
"""
Build expanded WP/program token list from TEAM_170_WP_EXCLUSION_TOKENS.json and
list every file under _COMMUNICATION/ (active layer) whose path matches any token.

Usage (repo root):
  python3 scripts/scan_communication_wp_exclusion.py
  python3 scripts/scan_communication_wp_exclusion.py --json path/to/TEAM_170_WP_EXCLUSION_TOKENS.json
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
COMM = REPO_ROOT / "_COMMUNICATION"
DEFAULT_JSON = COMM / "team_170" / "TEAM_170_WP_EXCLUSION_TOKENS.json"

SKIP_TOP = {"99-ARCHIVE", ".DS_Store"}
SKIP_NAMES = {".ds_store", ".gitkeep", "thumbs.db"}


def expand_id(s: str) -> list[str]:
    """S003-P011-WP002 -> hyphen + underscore forms."""
    s = s.strip()
    if not s:
        return []
    u = s.replace("-", "_")
    return list({s, u}) if s != u else [s]


def load_tokens(path: Path) -> tuple[list[str], dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    raw: list[str] = []

    for block in data.get("active_by_domain", []):
        pid = block.get("program_id")
        if pid:
            raw.append(pid)
        for wp in block.get("work_package_ids", []) or []:
            raw.append(wp)

    for x in data.get("recently_closed_reference", []) or []:
        raw.append(x)

    for row in data.get("planned_or_backlog", []) or []:
        v = row.get("program_or_wp")
        if v:
            raw.append(v)

    for p in data.get("program_ids_supplemental", []) or []:
        raw.append(p)

    expanded: list[str] = []
    for x in raw:
        expanded.extend(expand_id(x))

    # Longest first — deterministic matching display
    expanded = sorted(set(expanded), key=lambda t: (-len(t), t))
    return expanded, data


def should_skip_dir(name: str) -> bool:
    return name in SKIP_TOP or name.startswith(".")


def iter_comm_files() -> list[Path]:
    out: list[Path] = []
    for child in sorted(COMM.iterdir()):
        if not child.is_dir():
            continue
        if should_skip_dir(child.name):
            continue
        for f in child.rglob("*"):
            if not f.is_file():
                continue
            if f.name.startswith("."):
                continue
            if f.name.lower() in SKIP_NAMES:
                continue
            out.append(f)
    return out


def first_match(rel: str, tokens: list[str]) -> str | None:
    u = rel.replace("\\", "/")
    for t in tokens:
        if t in u:
            return t
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", type=Path, default=DEFAULT_JSON)
    ap.add_argument(
        "--out-csv",
        type=Path,
        default=COMM / "team_170" / "TEAM_00_EXCLUSION_PASS2_WORK_PACKAGES.csv",
    )
    ap.add_argument(
        "--out-md",
        type=Path,
        default=COMM
        / "team_170"
        / "TEAM_170_TO_TEAM_00_EXCLUSION_PASS2_WORK_PACKAGES_v1.0.0.md",
    )
    args = ap.parse_args()

    if not args.json.is_file():
        print(f"Missing JSON: {args.json}", file=sys.stderr)
        return 1

    tokens, data = load_tokens(args.json)
    rows: list[tuple[str, str]] = []
    for f in iter_comm_files():
        rel = str(f.relative_to(REPO_ROOT)).replace("\\", "/")
        m = first_match(rel, tokens)
        if m:
            rows.append((rel, m))

    rows.sort(key=lambda x: (x[0], x[1]))
    args.out_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.out_csv.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["repo_rel_path", "matched_token"])
        for rel, tok in rows:
            w.writerow([rel, tok])

    # Markdown summary
    date_iso = data.get("as_of_date", "2026-02-19")
    lines = [
        "---",
        "id: TEAM_170_TO_TEAM_00_EXCLUSION_PASS2_WORK_PACKAGES_v1.0.0",
        "from: Team 170 (Librarian — _COMMUNICATION/)",
        "to: Team 00 (Chief Architect)",
        "cc: Team 10 (Gateway)",
        f"date: {date_iso}",
        "status: DRAFT — token list requires Team 00 confirmation when WSM/backlog changes",
        "scope: _COMMUNICATION/ — exclusion of files bearing active/planned WP program signatures",
        "---",
        "",
        "# חרגה 2 — חבילות עבודה ותוכניות (חתימות בקבצים)",
        "",
        "## מקורות סטטוס (לעדכון מחזורי)",
        "",
    ]
    for n in data.get("authority_notes", []):
        lines.append(f"- {n}")
    lines.extend(
        [
            "",
            "## תוכניות / חבילות — פעילות (לפי דומיין)",
            "",
            "| דומיין | תוכנית | חבילות | הערה |",
            "|--------|---------|--------|------|",
        ]
    )
    for b in data.get("active_by_domain", []):
        wps = ", ".join(b.get("work_package_ids", []) or [])
        lines.append(
            f"| {b.get('domain','')} | {b.get('program_id','')} | {wps} | {b.get('status_note','')} |"
        )
    lines.extend(
        [
            "",
            "## מתוכננות / Backlog (מנוע החרגה — לא בהכרח ריצה פעילה)",
            "",
            "| פריט | דומיין | הערה |",
            "|--------|--------|------|",
        ]
    )
    for row in data.get("planned_or_backlog", []):
        lines.append(
            f"| `{row.get('program_or_wp','')}` | {row.get('domain','')} | {row.get('note','')} |"
        )
    lines.extend(
        [
            "",
            "## אסימונים מורחבים (מקף + קו תחתון)",
            "",
            f"**ספירה:** {len(tokens)} אסימונים; **קבצים תואמים:** {len(rows)}",
            "",
            "```text",
        ]
    )
    tok_lines = tokens[:120]
    lines.extend(tok_lines)
    if len(tokens) > 120:
        lines.append("... (" + str(len(tokens) - 120) + " more)")
    lines.extend(
        [
            "```",
            "",
            "## פלט סריקה",
            "",
            f"- CSV: `{args.out_csv.relative_to(REPO_ROOT)}` — כל קובץ תחת `_COMMUNICATION/` (למעט `99-ARCHIVE/`) שנמצא בו לפחות אסימון אחד.",
            "",
            "**הערה:** אסימון קצר מדי עלול לייצר שגיאות — רשימת האסימונים נבנית ממזהי WP/Program מלאים בלבד.",
            "",
            f"**log_entry | TEAM_170 | EXCLUSION_PASS2 | WP_SIGNATURE_SCAN | {date_iso}**",
            "",
        ]
    )
    args.out_md.write_text("\n".join(lines), encoding="utf-8")

    print(
        f"tokens={len(tokens)} matched_files={len(rows)} CSV={args.out_csv} MD={args.out_md}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
