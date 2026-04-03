---
id: TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 31 (AOS Frontend Implementation)
cc: Team 71, Team 21, Team 100, Team 00 (Principal)
date: 2026-03-28
type: MANDATE — GATE_DOC שלב ב (קלט ל-Runbook — UI + local dev)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md
  - TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md
  - TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md
roster_ssot: documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json
role_mapping: documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md
paired_mandates:
  - TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md
  - TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md---

# Team 11 → Team 31 | GATE_DOC שלב ב — קלט לתיעוד (UI + הרצה מקומית)

## מודל הקשר — ארבע שכבות (חובת טעינה לסשן Team 31)

מקור **Layer 1–2–4**: `TEAMS_ROSTER_v1.0.0.json` → `team_31`. **Layer 3** — **AOS v3** + מנדט זה.

### שכבה 1 — זהות

| שדה | ערך |
|-----|-----|
| **Team ID** | `team_31` |
| **שם** | AOS Frontend Implementation |
| **group / profession** | `implementation` / `frontend_engineer` |
| **דומיין** | `agents_os` |
| **הורה** | `team_11` |
| **תפקיד (roster)** | דפי UI, אינטגרציה ל-API, לוגיקת לקוח ל־Agents_OS. |
| **תפקיד במנדט זה** | לספק ל־**Team 71** חומר מובנה ל־**`AGENTS_OS_V3_DEVELOPER_RUNBOOK.md`** (וערכים קשורים): דפים, preflight, חוזה layout/header, פורטים, התנגשויות ידועות — **בלי** להחליף את עורך המסמכים הקנוני (71). |

### שכבה 2 — סמכות

| שדה | ערך |
|-----|-----|
| **writes_to (עיקרי)** | `_COMMUNICATION/team_31/` — מסמך קלט מובנה (שם נדרש למטה). |
| **writes_to (אופציונלי)** | `agents_os_v3/ui/` — **רק** אם נדרש תיקון טקסט/README מקומי קצר בקובץ קיים (למשל הערה ב־HTML) **ולא** שינוי התנהגות; כל שינוי → **FILE_INDEX**. |
| **לא בתחום** | יצירת `agents_os_v3/docs/`; עריכת מסמכי **`AGENTS_OS_V3_*.md`** תחת `documentation/docs-agents-os/` — **בעלות 71**. |
| **governed_by** | SSM; ROSTER; Iron Rules פרונט (ראו roster); Directive **3B**; `AGENTS.md`. |

### שכבה 3 — מצב נוכחי

| נושא | ערך |
|------|-----|
| **BUILD** | **COMPLETE** |
| **בסיס UI** | `agents_os_v3/ui/` — שישה דפים + ליבה (`app.js`, `api-client.js`, …) כפי שנסגרו ב-GATE_4/5. |

### שכבה 4 — משימות חובה

| # | משימה | קריטריון קבלה |
|---|--------|----------------|
| 1 | **מסמך קלט ל-71** | `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0.md` — חובה. מבנה מומלץ: (א) רשימת דפים + תפקיד; (ב) preflight / סקריפטים; (ג) פורטים והתנגשויות (למשל 8090); (ד) חוזה `agents-page-layout` / header אם רלוונטי לריצה; (ה) קישורים לקבצי UI עיקריים. |
| 2 | **תגובה ל-71** | בתוך זמן סביר אם 71 מבקשת הבהרות נוספות ל-Runbook. |

## סטנדרטים ותבניות

- **3B:** תיעוד קנוני ארוך — רק תחת `documentation/docs-agents-os/` עם קידומת **`AGENTS_OS_V3_`** על ידי **71**.  
- **כותרת זהות** חובה בראש `TEAM_31_TO_TEAM_71_...RUNBOOK_INPUT...` (טבלת `id`, `from`, `to`, `date`, `type`, `domain`, `branch`, `reply_to` = מנדט זה).  
- **אין המצאת** endpoints או שדות API — הפניה לקוד/ל-21 לשאלות backend.

## מסירה ל-Gateway

`_COMMUNICATION/team_31/TEAM_31_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` — אישור שהוגש `TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0.md`, ורשימת שינויים ב-repo (אם היו) + **FILE_INDEX** אם רלוונטי.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | T31_GATE_DOC_PHASE_B | MANDATE_ISSUED | 2026-03-28**
