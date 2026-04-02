---
id: TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 100 (Chief System Architect / Chief R&D)
cc: Team 111 (AOS Domain Architect IDE), Team 71 (AOS Documentation), Team 00 (Principal), Team 21, Team 31, Team 51
date: 2026-03-28
type: STANDARDS_APPROVAL_REQUEST — AOS v3 BUILD documentation phase (pre-implementation)
domain: agents_os
branch: aos-v3
authority: TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md---

# Team 11 → Team 100 | אישור סטנדרטים ותבניות — שלב דוקומנטציה BUILD

## בקשה

לאשר **חבילת סטנדרטים ותבניות** (להלן **טיוטה v0.1**) לשלב **GATE_DOC** בתוכנית BUILD, **לפני** מימוש מסמכי יעד בקוד ובמדריכים.  
לאחר **APPROVED** מצדכם, Gateway יפרסם מנדט מימוש ל-**Team 71** (קנון + קידום לפי נוהל) בשיתוף **21/31** (הערות קוד, מבנה מודולים).

## רקע

- Principal אישר הוספת שלב דוקומנטציה רשמי — ראו `TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md`.
- קידום ל-`documentation/` הקנוני נשאר באחריות **Team 71** + ניתוב **Team 10/11** (לא מבוצע במסמך זה).

---

## טיוטת סטנדרטים (v0.1 — לאשר / לתקן / לדחות פריט)

### א. מסמכי מוצר (`agents_os_v3/`)

| # | סטנדרט | תיאור |
|---|--------|--------|
| S1 | **README שורש** | קובץ `agents_os_v3/README.md`: מטרה, ענף פעיל, פורט API, משתני סביבה חיוניים (`AOS_V3_DATABASE_URL`), הרצת API, הרצת UI סטטי, קישור ל-WP v1.0.3 ול-`FILE_INDEX.json`. |
| S2 | **Runbook מפתח** | **קנון לפי Team 100 Directive 3B:** `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` (תוכן: Team 71) — pytest, governance, preflight, DB; עקבי עם דוחות QA 51. |
| S3 | **תיעוד API** | **קנון לפי Team 100 Directive 3B:** `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md` + docstrings על handlers ב-`api.py`; **אסור** `agents_os_v3/docs/`. |

### ב. קוד

| # | סטנדרט | תיאור |
|---|--------|--------|
| S4 | **מודולים ציבוריים** | הערות מינימליות על use-cases/state transitions שאינן טריוויאליות; ללא שכפול אסמכתאות ארוכות — הפניה למסמך. |
| S5 | **IR שמורים** | אין שינוי ב-IR-3 (FILE_INDEX), IR-4 (UI consumer-only), IR-2 (v2 frozen). |

### ג. תקשורת וראיות (`_COMMUNICATION/`)

| # | סטנדרט | תיאור |
|---|--------|--------|
| S6 | **Frontmatter** | מסמכי ראיות/Seal: שדות `id`, `from`, `to`, `date`, `type`, `domain`, `branch` — כפי שבשימוש ב-BUILD. |
| S7 | **מעקב אחרי שינוי שובר** | שינוי שובר API/סכימה: רישום ב-`_COMMUNICATION/team_21/` או handoff ל-11 + עדכון **AGENTS_OS_V3_API_REFERENCE.md** (קנון 3B) + פרוטוקול QA — `TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0.md`. |

---

## טיוטת תבניות (v0.1 — לנעול בגרסה 1.0.0 במסמך האישור שלכם)

| # | תבנית | שימוש |
|---|--------|--------|
| T1 | **תבנית מדריך מפתח (Markdown)** | כותרות: Setup / Run API / Run UI / Test / Troubleshooting / קישורים ל-SSOT |
| T2 | **תבנית “שינוי שובר”** | טבלה: endpoint או מודול / לפני / אחרי / TC מושפע / תאריך |
| T3 | **תבנית אינדקס קישורים** | רשימת קישורים ל-WP, UI Spec, FILE_INDEX, מפת שלבים |

לאחר אישורכם, Team 71 יוצר תבניות תחת **`documentation/docs-agents-os/05-TEMPLATES/`** עם קידומת **`AGENTS_OS_V3_`** (Directive **3B**), או טיוטות תחת `_COMMUNICATION/team_71/` עד קידום.

---

## קבלה Gateway — פסיקה אדריכלית 3B (2026-03-28)

**התקבל:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md` — יעדי קנון, טבלת נתיבים, Iron Rules; **GATE_DOC שלב א** נסגר מבחינת **יעד קבצים**. **שלב ב** — מנדט מימוש ל-**Team 71**.

---

## מסירה מבוקשת מ-Team 100

פרסם תחת `_COMMUNICATION/team_100/` (או נתיב שתקבעו), למשל:

`TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_v1.0.0.md`

עם: **APPROVED** / **APPROVED_WITH_CHANGES** / **REJECT**; טבלת סטנדרטים מאושרים; גרסת תבניות **v1.0.0**; והערות חוסמות אם יש.

---

## צעד Gateway אחרי אישור

1. עדכון `TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md` — סימון **DOC_PREP** כ-**PASS**.  
2. מנדט ל-**Team 71** + תיאום **21/31** למימוש **DOC_EXEC** לפני או במקביל ל-GATE_5 (כפי שייקבע במפה אחרי verdict).

---

**log_entry | TEAM_11 | AOS_V3_BUILD | T100_DOC_STANDARDS_REQUEST | RECEIPT_3B_DIRECTIVE | 2026-03-28**
