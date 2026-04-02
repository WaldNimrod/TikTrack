---
id: TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 71 (AOS Documentation)
cc: Team 21, Team 31, Team 100, Team 170, Team 00 (Principal)
paired_implementation_mandates:
  - TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md
  - TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md
date: 2026-03-28
type: MANDATE — GATE_DOC שלב ב (מימוש תיעוד v3)
domain: agents_os
branch: aos-v3
authority:
  - TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md
  - TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md
  - TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md §0.9
start_condition: AOS v3 BUILD COMPLETE (GATE_5 PASS)
roster_ssot: documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json
role_mapping: documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md---

# Team 11 → Team 71 | GATE_DOC שלב ב — מימוש תיעוד AOS v3

## מודל הקשר — ארבע שכבות (חובת טעינה לסשן Team 71)

מקור **Layer 1–2–4** קבועים: `TEAMS_ROSTER_v1.0.0.json` → `team_71`. מיפוי תפקידים ארגוני: `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.1.md` (דומיין **agents_os**, צוות תיעוד **71**). **Layer 3** להלן מותאם למסלול **AOS v3 BUILD** + מנדט זה.

### שכבה 1 — זהות (Identity)

| שדה | ערך |
|-----|-----|
| **Team ID** | `team_71` |
| **שם רשמי** | AOS Documentation |
| **קבוצה (group)** | `documentation` |
| **מקצוע (profession)** | `technical_writer` |
| **דומיין** | `agents_os` בלבד — תיעוד TikTrack → **Team 70** (מראה x0/x1) |
| **מנוע ברירת מחדל** | `codex` |
| **הורה ארגוני** | `team_00` (Principal) |
| **ילדים** | אין |
| **תפקיד (roster)** | כתיבה טכנית לדומיין Agents_OS — אסמכתאות, מפרטים, דוחות תוכנית AOS; **מראה** ל־**Team 70** (TikTrack Documentation) בציר ה־x0/x1. |
| **תפקיד במנדט זה** | בעלות **מימוש GATE_DOC שלב ב** — אכלוס קנון **v3** תחת `documentation/docs-agents-os/` עם קידומת **`AGENTS_OS_V3_`**, עדכון מאסטר אינדקס; **שילוב קלט** ממנדטים פורמליים ל־**21** (README + docstrings) ו־**31** (קלט Runbook UI). |

### שכבה 2 — סמכות וגבולות כתיבה (Authority)

| שדה | ערך |
|-----|-----|
| **writes_to (roster — baseline)** | `_COMMUNICATION/team_71/`; `documentation/docs-governance/` |
| **writes_to (מנדט BUILD זה — הרחבה מחייבת)** | `documentation/docs-agents-os/**` — קבצים חדשים/מעודכנים עם קידומת **`AGENTS_OS_V3_`** בלבד, לפי **Directive 3B**; **במקביל** מסמכי עבודה/מסירה תחת `_COMMUNICATION/team_71/`. |
| **לא בתחום המנדט** | שינוי או מחיקת מסמכי **v2** קיימים תחת `documentation/docs-agents-os/`; עריכת **SSM/WSM**; קידום ישיר ל־`documentation/` מחוץ לנתיבים המאושרים בלי תיאום **Team 170** (קנון governance) / **Team 70** (אם חפיפה TikTrack). |
| **governed_by** | SSM; TEAM_ROSTER_LOCK; PHOENIX_PORTFOLIO_ROADMAP; **+** `TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`; מפת שלבים `TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md` §0.9. |
| **Iron Rules (roster — layer_4_procedure)** | כותרת זהות חובה על מסמכים; דומיין **AOS בלבד**; **אין** שינוי SSM/WSM בלי הוראת Team 00; עקביות חוצה־דומיין — ניתוב ל־**Team 170**. |
| **Iron Rules (מנדט + 3B)** | **אין** `agents_os_v3/docs/`; **אין** פגיעה ב־v2; קידומת קובץ **`AGENTS_OS_V3_`** לנכסי v3 תחת `docs-agents-os/`. |

### שכבה 3 — מצב נוכחי (Current state — AOS v3)

| נושא | ערך |
|------|-----|
| **ענף עבודה** | `aos-v3` → push `origin/aos-v3` (ראו `AGENTS.md`) |
| **מסלול pipeline TikTrack** | **לא פעיל** כאן (`pipeline_run.sh` — N/A) |
| **BUILD** | **COMPLETE** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` |
| **שער בתוכנית** | **GATE_DOC שלב ב** (שלב א = קנון 100 **הושלם**) |
| **מוצא קוד SSOT** | `agents_os_v3/` (מימוש סגור); תיעוד מתאר את המצב בפועל ב-repo |
| **אינדקס קבצים** | כל שינוי תחת `agents_os_v3/` דורש עדכון `FILE_INDEX.json` + עמידה ב־v2 FREEZE |

### שכבה 4 — משימה (Task — Layer 4 ממופה למסמך)

המשימה הספציפית, טבלת המסירות, תיאום 21/31, ופורמט ההשלמה — **בסעיפים להלן** (משימות חובה → מסירה ל־11).

---

## הקשר (תמצית מול Gateway)

- **שלב א (קנון):** **הושלם** — `TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`.  
- **BUILD:** **COMPLETE** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md`.  
- **יעד מסמכים:** עץ `documentation/docs-agents-os/` עם קידומת קובץ **`AGENTS_OS_V3_`**; **אין** `agents_os_v3/docs/`.

## משימות חובה (בעלות ראשית — Team 71)

| # | משימה | פלט קנוני |
|---|--------|-----------|
| 1 | **Overview** | `documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_V3_OVERVIEW.md` |
| 2 | **ארכיטקטורה** | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_ARCHITECTURE_OVERVIEW.md` |
| 3 | **API Reference** | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md` |
| 4 | **Developer Runbook** | `documentation/docs-agents-os/04-PROCEDURES/AGENTS_OS_V3_DEVELOPER_RUNBOOK.md` |
| 5 | **תבניות** (לפחות אחת רלוונטית) | `documentation/docs-agents-os/05-TEMPLATES/` — קבצים עם קידומת `AGENTS_OS_V3_` |
| 6 | **מאסטר אינדקס** | עדכון סעיף **Agents OS v3** ב־`documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` — סטטוס מ־**Planned** ל־**Active** + קישורים תקינים |

**איכות:** התיעוד ישקף את הקוד וההרצה ב־`agents_os_v3/` **כפי שב-repo** (ללא המצאת שדות/נתיבי API); הפרדה ברורה מ־**v2** בטקסט ובהפניות.

## מנדטים צמודים לצוותי מימוש (Gateway — פורסמו במקביל)

| צוות | מסמך מנדט | תוכן |
|------|-----------|------|
| **21** | `TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` | `agents_os_v3/README.md` + **docstrings**; השלמה ל־11. |
| **31** | `TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` | מסמך קלט `TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0.md` + השלמה ל־11. |

**תהליך מומלץ:** 71 **יוזמת** בקשות הבהרה ל־21/31 לפי צורך; 21/31 עומדים במנדטיהם; 71 **ממזג** לתוך `AGENTS_OS_V3_*` בלי לשכפל בעלות על קוד/UI.  
כל שינוי תחת `agents_os_v3/` על ידי **21** (או **31** אם נגע) חייב **FILE_INDEX** + **v2 FREEZE** (ראו `AGENTS.md`).

## Iron Rules (מ-directive 3B)

1. **אין** יצירת `agents_os_v3/docs/`.  
2. **אין** מחיקה/שינוי מסמכי **v2** תחת `documentation/docs-agents-os/` בלי erratum נפרד.  
3. שמות קבצים חדשים בנתיב הקנוני — קידומת **`AGENTS_OS_V3_`**.

## מסירה ל-Gateway

`_COMMUNICATION/team_71/TEAM_71_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` — רשימת קבצים שנוצרו/עודכנו, עמידה בטבלה לעיל, **הפניה למסמכי השלמה של 21 ו-31** (או ציון שאינם חוסמים אם עדיין בתהליך — לתאם Gateway), ו־`FILE_INDEX` אם נגעתם ב־`agents_os_v3/`.

## קבלה

לאחר מסירה — **Team 11** יפרסם קבלה ויעדכן `TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md` §0.9 ל־**שלב ב הושלם**.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | T71_GATE_DOC_PHASE_B | PAIRED_T21_T31_MANDATES | 2026-03-28**
