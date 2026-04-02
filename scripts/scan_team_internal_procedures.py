#!/usr/bin/env python3
"""
Scan _COMMUNICATION/team_*/ for internal procedure / rules files (heuristic).
Outputs CSV + can feed TEAM_170 report.

Usage (repo root):
  python3 scripts/scan_team_internal_procedures.py
  python3 scripts/scan_team_internal_procedures.py --out-csv _COMMUNICATION/team_170/TEAM_00_EXCLUSION_PASS1_INTERNAL_PROCEDURES.csv
"""
from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
COMM = REPO_ROOT / "_COMMUNICATION"

# Filename-only heuristics (no file body read)
RE_TEAM_INTERNAL = re.compile(r"TEAM_\d{2,3}_INTERNAL", re.I)
RE_SOP = re.compile(r"(^|_)SOP[_\d-]", re.I)
# "PROCEDURE" must not match inside "PROCEDURES" (false positives on filenames)
RE_PROCEDURE_WORD = re.compile(r"PROCEDURE(?!S)", re.I)
SKIP_NAMES = {".ds_store", ".gitkeep", "thumbs.db"}

# Suspect = procedural / ops naming — **not** WP spec artifacts (LLD/LOD/QA_REPORT) unless also INTERNAL.
# Team 00 triages: many "MANDATE" are program handoffs, not team-internal rules.
SUSPECT_TOKENS = (
    "PROCEDURE",
    "RUNBOOK",
    "WORK_PROCEDURE",
    "GOVERNANCE",
    "PROTOCOL",
    "MANDATE",
    "HANDOFF",
    "ACTIVATION",
    "READINESS",
    "DECLARATION",
    "SOP",
)


def is_confirmed_internal_rules(basename: str) -> bool:
    """High confidence: team internal procedures / rules by name."""
    u = basename.upper()
    if "INTERNAL_WORK_PROCEDURE" in u:
        return True
    if RE_TEAM_INTERNAL.search(basename):
        return True
    if "_INTERNAL_" in u or u.startswith("INTERNAL_"):
        if RE_PROCEDURE_WORD.search(basename) or any(
            k in u
            for k in (
                "RULE",
                "GOVERNANCE",
                "CHARTER",
                "REGULATION",
                "HANDBOOK",
                "PROTOCOL",
            )
        ):
            return True
    if "INTERNAL" in u and (
        RE_PROCEDURE_WORD.search(basename)
        or any(k in u for k in ("RULES", "GOVERNANCE", "CHARTER", "REGULATION", "HANDBOOK"))
    ):
        return True
    if "RUNBOOK" in u:
        return True
    if RE_SOP.search(basename):
        return True
    if "TEAM_RULES" in u or "RULES_OF_ENGAGEMENT" in u or "OPERATING_MODEL" in u:
        return True
    return False


def has_suspect_token(basename: str) -> str | None:
    u = basename.upper()
    # PROCEDURE token: avoid matching "PROCEDURES" as containing "PROCEDURE"
    if RE_PROCEDURE_WORD.search(basename):
        return "PROCEDURE"
    for t in SUSPECT_TOKENS:
        if t == "PROCEDURE":
            continue
        if t in u:
            return t
    return None


def team_folder_name(p: Path) -> str | None:
    rel = p.relative_to(COMM)
    parts = rel.parts
    if not parts:
        return None
    top = parts[0]
    if top.startswith("team_") and top.replace("team_", "").isdigit():
        return top
    return None


def iter_team_files() -> list[tuple[str, Path]]:
    """(team_id, file_path) for files under team_*/ active layer."""
    out: list[tuple[str, Path]] = []
    if not COMM.is_dir():
        return out
    for child in sorted(COMM.iterdir()):
        if not child.is_dir():
            continue
        name = child.name
        if not name.startswith("team_"):
            continue
        if name in ("team_engine",):  # safety
            continue
        team_id = name
        for f in child.rglob("*"):
            if not f.is_file():
                continue
            if f.name.startswith("."):
                continue
            if f.name.lower() in SKIP_NAMES:
                continue
            out.append((team_id, f))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--out-csv",
        type=Path,
        default=REPO_ROOT / "_COMMUNICATION/team_170/TEAM_00_EXCLUSION_PASS1_INTERNAL_PROCEDURES.csv",
    )
    ap.add_argument(
        "--out-md",
        type=Path,
        default=REPO_ROOT
        / "_COMMUNICATION/team_170/TEAM_170_TO_TEAM_00_EXCLUSION_PASS1_INTERNAL_PROCEDURES_v1.0.0.md",
    )
    args = ap.parse_args()

    confirmed: list[tuple[str, str]] = []
    suspects: list[tuple[str, str, str]] = []  # team, rel, reason

    for team_id, path in iter_team_files():
        rel = str(path.relative_to(COMM)).replace("\\", "/")
        base = path.name
        if is_confirmed_internal_rules(base):
            confirmed.append((team_id, rel))
            continue
        hit = has_suspect_token(base)
        if hit:
            suspects.append((team_id, rel, hit))

    confirmed.sort(key=lambda x: (x[0], x[1]))
    suspects.sort(key=lambda x: (x[0], x[1]))

    args.out_csv.parent.mkdir(parents=True, exist_ok=True)
    with args.out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["bucket", "team", "rel_path", "note"])
        for team_id, rel in confirmed:
            w.writerow(["CONFIRMED_INTERNAL_RULES", team_id, rel, ""])
        for team_id, rel, note in suspects:
            w.writerow(["SUSPECT_PROCEDURAL", team_id, rel, note])

    # Markdown report for Team 00
    date_iso = "2026-02-19"
    lines: list[str] = [
        "---",
        "id: TEAM_170_TO_TEAM_00_EXCLUSION_PASS1_INTERNAL_PROCEDURES_v1.0.0",
        "from: Team 170 (Librarian — _COMMUNICATION/)",
        "to: Team 00 (Chief Architect)",
        "cc: Team 10 (Gateway)",
        f"date: {date_iso}",
        "status: DRAFT — awaiting Team 00 triage",
        "scope: _COMMUNICATION/ — Exclusion list pass 1 (internal procedures & rules by team folder)",
        "---",
        "",
        "# חרגה 1 — נוהלים פנימיים וחוקי צוות (`team_*`)",
        "",
        "## מטרה",
        "",
        "לייצר בסיס ל**רשימת מוחרגים** (exclusion list): קבצים שמזוהים כ**נוהלים פנימיים / חוקי צוות** לפי **שם קובץ בלבד** (ללא קריאת גוף).",
        "בסוף התהליך הכוללי: **מה שלא ברשימת המוחרגים — מועבר לארכיון** (לפי מנדט נפרד).",
        "",
        "## שיטה (אוטומטית + ביקורת אנושית)",
        "",
        "| רמה | קריטריון |",
        "|--------|------------|",
        "| **ודאי (CONFIRMED)** | דפוסים חזקים: `INTERNAL_WORK_PROCEDURE`, `TEAM_NN_INTERNAL`, `INTERNAL`+נהלים, `RUNBOOK`, `SOP`, `TEAM_RULES`, וכו' |",
        "| **חשוד (SUSPECT)** | מילות מפתח תפעוליות: `PROCEDURE`, `GOVERNANCE`, `PROTOCOL`, `MANDATE`, `HANDOFF`, `ACTIVATION`, `READINESS`, `DECLARATION`, `SOP` — **לא** נכללו LLD/LOD/QA כדי להפחית רעש ארטיפקטי WP |",
        "",
        f"**כלי:** `scripts/scan_team_internal_procedures.py` — פלט CSV: `{args.out_csv.relative_to(REPO_ROOT)}`.",
        "",
        "## סיכומים",
        "",
        f"| מדד | ערך |",
        f"|--------|--------|",
        f"| ודאיים | {len(confirmed)} |",
        f"| חשודים | {len(suspects)} |",
        "",
        "---",
        "",
        "## א — רשימת **ודאיים** (ממוינת אלפבית לפי נתיב)",
        "",
    ]
    for _team, rel in confirmed:
        lines.append(f"- `{rel}`")
    if not confirmed:
        lines.append("*(אין)*")

    lines.extend(
        [
            "",
            "---",
            "",
            "## ב — רשימת **חשודים** (ממוספרת לפי צוות)",
            "",
            "כל שורה: מספר רץ בתוך הצוות + נתיב + אסימון שזוהה בשם הקובץ.",
            "",
        ]
    )

    by_team: dict[str, list[tuple[str, str]]] = {}
    for team_id, rel, note in suspects:
        by_team.setdefault(team_id, []).append((rel, note))

    for team_id in sorted(by_team.keys()):
        lines.append(f"### {team_id}")
        lines.append("")
        n = 0
        for rel, note in sorted(by_team[team_id], key=lambda x: x[0]):
            n += 1
            lines.append(f"{n}. `{rel}` — `{note}`")
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            "## הערות Team 170",
            "",
            "- רבים מהקבצים עם `MANDATE` / `HANDOFF` הם **הודעות תוכנית (WP)** ולא \"חוק פנימי\" של הצוות — Team 00 מחליט מה להעביר לרשימת המוחרגים.",
            "- להרחבת החרגה: הוסיפו שורות ל־CSV או מסמך המוחרגים המרכזי (גרסה עתידית) — **לא** לערוך את התוכנית ב־`documentation/` מכאן (סמכות Team 10).",
            "",
            f"**log_entry | TEAM_170 | EXCLUSION_PASS1 | INTERNAL_PROCEDURES_SCAN | {date_iso}**",
            "",
        ]
    )

    args.out_md.parent.mkdir(parents=True, exist_ok=True)
    args.out_md.write_text("\n".join(lines), encoding="utf-8")

    print(
        f"CONFIRMED: {len(confirmed)}  SUSPECT: {len(suspects)}  CSV: {args.out_csv}  MD: {args.out_md}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
