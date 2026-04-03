---
id: TEAM_00_TO_TEAM_170_AOS_V3_D6_DOCUMENTATION_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 170 (Spec & Governance)
cc: Team 11 (AOS Gateway), Team 100 (Chief Architect)
date: 2026-03-28
type: MANDATE — documentation alignment
domain: agents_os
priority: Medium
blocking: D.6 COMPLETE designation only — does NOT block production
trigger: AOS v3 Remediation Phase 1+2 closed; F-03/F-07 code+QA PASS; text alignment deferred
authority: TEAM_00_CONSTITUTION_v1.0.0.md — Principal writing authority---

# Team 00 → Team 170 | AOS v3 — D.6 Documentation Alignment Mandate

## רקע

מסלול הרמדיאציה של AOS v3 (F-01..F-07, Phases 0–5) הושלם PASS ב-2026-03-28. **קוד ו-QA** מול D.6 (5 נקודות קצה חסרות + UC-12 override) — PASS (Phase 1 + Phase 2). **טקסט D.6** בתיקיית `documentation/` — **לא עודכן** כחלק מהרמדיאציה; נדחה ל-Team 170/70 לפי הסכמת Gateway + Team 100.

## דרישה

**עדכן את תיעוד D.6 ב-`documentation/`** כך שישקף את נתיבי ה-API ה**בפועל** לאחר הרמדיאציה.

## מקורות אמת (לקריאה לפני ביצוע)

| קובץ | תוכן רלוונטי |
|------|--------------|
| `agents_os_v3/tests/test_remediation_phase2_api_contracts.py` | חוזי HTTP מלאים — כל נקודות הקצה בפועל כולל override |
| `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` | API deliverables Phase 1 (5 endpoints + UC-12) |
| `_COMMUNICATION/team_100/TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md` | Option B — prefix `/api/` (ללא `/admin/`) |
| `agents_os_v3/FILE_INDEX.json` (v1.1.15) | רשימת מלאה של כל artifacts |

## היקף

- **טקסט בלבד** — אין שינויי קוד.
- עדכן את כל ה-endpoint paths ב-D.6 לפי חוזי Phase 2.
- ודא כי Option B (ללא prefix `/admin/`) משתקף בדיוק.
- UC-12 (`POST .../override`) — רשום כנקודת קצה קנונית.
- אל תשנה שאר פרקי ה-AOS spec — D.6 בלבד.

## קבלה

לאחר השלמה — שלח אישור ל-Team 00 + Team 11:
`_COMMUNICATION/team_170/TEAM_170_TO_TEAM_00_AOS_V3_D6_ALIGNMENT_COMPLETION_v1.0.0.md`

כולל: נתיב הקובץ שעודכן, רשימת שינויים (diff-level), וגרסת FILE_INDEX שנרשמה.

## עדיפות ולו"ז

**עדיפות:** Medium — **אינו חוסם production**. חוסם סימון D.6 כ-`COMPLETE` בתיעוד הקנוני.
**לו"ז מוצע:** תוך session הבא של Team 170 — אין דחיפות קריטית.

---

**log_entry | TEAM_00 | AOS_V3_REMEDIATION | D6_MANDATE_TO_TEAM_170 | ISSUED | 2026-03-28**
