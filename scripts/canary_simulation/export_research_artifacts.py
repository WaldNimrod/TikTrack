#!/usr/bin/env python3
"""
Export structured research data for Canary / pipeline simulation gap analysis.
Writes machine-readable JSON under _COMMUNICATION/team_101/research/
"""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / "_COMMUNICATION" / "team_101" / "research"


# Priority: P0 = blocks trustworthy simulation / architectural sign-off
# Use status: open | closed (closed_* refs Team 61/30 constitution alignment 2026-03-23)
FINDINGS: list[dict] = [
    {
        "id": "GAP-001",
        "priority": "P0",
        "status": "closed",
        "closed_date": "2026-03-23",
        "closure_refs": [
            "_COMMUNICATION/team_61/TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md",
            "_COMMUNICATION/team_30/TEAM_30_TO_TEAM_61_GETEXPECTEDFILES_UX_REVIEW_v1.0.0.md",
        ],
        "title": "GATE_0 / GATE_1 — getExpectedFiles מול verdict candidates",
        "detail": "RESOLVED: early-return ב-getExpectedFiles ל-GATE_0 ו-GATE_1 (פאזים) — מימוש Team 61 + אישור UX Team 30 (APPROVED).",
        "evidence": ["agents_os/ui/js/pipeline-config.js"],
        "recommended_owner": "—",
    },
    {
        "id": "GAP-002",
        "priority": "P0",
        "status": "open",
        "title": "אין אוטומציה לפריטי ממשק מול קובץ prompt בדיסק (parity)",
        "detail": "לא קיימת בדיקה שמשווה טקסט #current-step-banner / מנדטה לתוכן *_prompt.md שנוצר לאותו gate×phase×domain.",
        "evidence": ["tests/pipeline-dashboard-*.e2e.test.js (smoke בלבד)"],
        "recommended_owner": "Team 50 / Team 101",
    },
    {
        "id": "GAP-003",
        "priority": "P1",
        "status": "open",
        "title": "פיצול בין sub-steps ב-CURSOR_IMPLEMENTATION (API_VERIFY) לבין getExpectedFiles (IMPLEMENTATION)",
        "detail": "ב-pipeline-dashboard.js ה-substeps מציגים TEAM_20_*_API_VERIFY; ב-getExpectedFiles ל-GATE_3/3.2 TikTrack מופיעים IMPLEMENTATION בלבד. עלול לבלבל מפעילים ולגרום ל'אדום' בצעד משנה אחד למרות קיום קובץ אחר.",
        "evidence": ["agents_os/ui/js/pipeline-dashboard.js (CURSOR_IMPLEMENTATION substeps)", "agents_os/ui/js/pipeline-config.js GATE_3 3.2"],
        "recommended_owner": "Team 101 + Team 30",
    },
    {
        "id": "GAP-004",
        "priority": "P1",
        "status": "open",
        "title": "שכבות Feedback Detection / rescan / drift — ללא סוויטת רגרסיה",
        "detail": "הלוגיקה קיימת בקוד (fdRescan, logVerdictDrift) אך אין בדיקות אוטומטיות שמאמתות התנהגות על כמה קבצי verdict או מחזורי תיקון.",
        "evidence": ["agents_os/ui/js/pipeline-dashboard.js"],
        "recommended_owner": "Team 50",
    },
    {
        "id": "GAP-005",
        "priority": "P1",
        "status": "open",
        "title": "Phase B — B1/B2/B3 ללא הרצת orchestration מבוקרת ב-CI",
        "detail": "חוסם בגלל שינוי pipeline_state ו-SSOT; נדרש sandbox WP או job עם state זמני.",
        "evidence": ["scripts/canary_simulation/phase_b fixtures"],
        "recommended_owner": "Team 61 / Team 10",
    },
    {
        "id": "GAP-006",
        "priority": "P2",
        "status": "open",
        "title": "רעש SEVERE בלוג דפדפן ב-Selenium",
        "detail": "דווח WARN browser SEVERE במספר הרצות; לבודד מקור.",
        "evidence": ["TEAM_101_CANARY_SIMULATION_IMPLEMENTATION_AND_VERIFICATION_REPORT_v1.0.0.md"],
        "recommended_owner": "Team 30",
    },
    {
        "id": "GAP-007",
        "priority": "P2",
        "status": "open",
        "title": "HRC GATE_4/4.3 — חסרים data-testid יציבים לבדיקות אוטומטיות מלאות",
        "detail": "B3 נשאר בעיקר MCP/ידני עד להוספת selectors.",
        "evidence": ["agents_os/ui/js/pipeline-dashboard.js (HRC render)"],
        "recommended_owner": "Team 30",
    },
    {
        "id": "GAP-008",
        "priority": "P2",
        "status": "open",
        "title": "ניהול git / רעש repo — לא בתוך סוויטת הבדיקות",
        "detail": "מדיניות Team 191 (clean tree, archive) לא ממופה לבדיקות אוטומטיות; נדרש תיאום נפרד.",
        "evidence": ["TEAM_170_TO_TEAM_191_* (דוגמאות)"],
        "recommended_owner": "Team 191",
    },
]


CHANNELS = [
    {"id": "ch_cli", "name": "CLI — pipeline_run.sh + orchestrator", "tests": ["verify_layer1 (ssot)", "pipeline-kb84-cli"], "coverage": "partial"},
    {"id": "ch_ssot", "name": "WSM / pipeline_state / ssot_check", "tests": ["agents_os_v2.tools.ssot_check"], "coverage": "good"},
    {"id": "ch_dash", "name": "Dashboard — PIPELINE_DASHBOARD.html", "tests": ["pipeline-dashboard-smoke", "pipeline-dashboard-phase-a"], "coverage": "partial"},
    {"id": "ch_prompt", "name": "Prompt artifacts — _COMMUNICATION/agents_os/prompts/", "tests": ["none automated parity"], "coverage": "gap"},
    {"id": "ch_mon", "name": "Monitor — PIPELINE_MONITOR / pipeline-monitor-core.js", "tests": ["not in canary suite"], "coverage": "gap"},
    {"id": "ch_git", "name": "Git hygiene / Team 191", "tests": ["none in canary workflow"], "coverage": "out_of_scope_automation"},
]


CONSTITUTION_ALIGNMENT_CLOSED = [
    {
        "id": "CON-001",
        "title": "תרשים סטטי כולל GATE_0",
        "closure_ref": "TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md",
    },
    {
        "id": "CON-002",
        "title": "PHASE_DEFINITIONS כולל GATE_0",
        "closure_ref": "TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md",
    },
    {
        "id": "CON-003",
        "title": "gates.yaml — הסרת GATE_0→GATE_1; החלטה TEAM_61_SSOT_GATE0_ALIAS_DECISION",
        "closure_ref": "_COMMUNICATION/team_61/TEAM_61_SSOT_GATE0_ALIAS_DECISION_v1.0.0.md",
    },
    {
        "id": "CON-004",
        "title": "GATE_2/2.2 AUTO — בעלות TikTrack vs AOS",
        "closure_ref": "TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md",
    },
]


WORK_PACKAGE_TASKS = [
    {
        "wp_task_id": "SIM-CLOSE-01",
        "status": "delivered",
        "title": "getExpectedFiles GATE_0/GATE_1 — מימוש + UX Team 30 APPROVED",
        "depends_on": ["GAP-001"],
        "owner": "Team 61 + Team 30",
    },
    {"wp_task_id": "SIM-CLOSE-02", "title": "סקריפט או בדיקת Node המשווה prompt file לטקסט באנר/מנדטה (לפחות GATE_2, GATE_3)", "depends_on": ["GAP-002"], "owner": "Team 50 + 101"},
    {"wp_task_id": "SIM-CLOSE-03", "title": "איחוד כוונת הקבצים בין CURSOR_IMPLEMENTATION substeps ל-getExpectedFiles (או תיעוד מפורש 'שלב א' vs 'השלמה')", "depends_on": ["GAP-003"], "owner": "Team 101"},
    {"wp_task_id": "SIM-CLOSE-04", "title": "מינימום בדיקות יחידה ל-feedback rescan על קבועי path מזויפים", "depends_on": ["GAP-004"], "owner": "Team 50"},
    {"wp_task_id": "SIM-CLOSE-05", "title": "Job CI עם pipeline_state זמני ל-negative path (B1) או הרצה מקומית מתועדת", "depends_on": ["GAP-005"], "owner": "Team 61"},
    {"wp_task_id": "SIM-CLOSE-06", "title": "data-testid ל-HRC כפתורי bulk ופריטים", "depends_on": ["GAP-007"], "owner": "Team 30"},
]


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "schema": "phoenix.team_101.research_export_v1",
        "generated_date": str(date.today()),
        "findings_sorted_by_priority": sorted(FINDINGS, key=lambda x: (x["priority"], x["id"])),
        "channels": CHANNELS,
        "recommended_work_package_tasks": WORK_PACKAGE_TASKS,
        "constitution_alignment_gaps_closed": CONSTITUTION_ALIGNMENT_CLOSED,
        "team_51_qa_report": "_COMMUNICATION/team_51/TEAM_51_CONSTITUTION_ALIGNMENT_QA_REPORT_v1.0.0.md",
        "team_61_handoff": "_COMMUNICATION/team_61/TEAM_61_TO_TEAM_101_CONSTITUTION_ALIGNMENT_HANDOFF_v1.0.0.md",
    }
    out_path = OUT_DIR / "COVERAGE_AND_GAPS_EXPORT_v1.0.0.json"
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out_path.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
