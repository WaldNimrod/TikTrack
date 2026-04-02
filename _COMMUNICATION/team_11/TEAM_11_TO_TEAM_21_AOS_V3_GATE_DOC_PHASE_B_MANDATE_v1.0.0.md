---
id: TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 71, Team 31, Team 100, Team 00 (Principal)
date: 2026-03-28
type: MANDATE — GATE_DOC שלב ב (תיעוד קוד — README + docstrings)
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
  - TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md---

# Team 11 → Team 21 | GATE_DOC שלב ב — תיעוד טכני ב-repo (`agents_os_v3/`)

## מודל הקשר — ארבע שכבות (חובת טעינה לסשן Team 21)

מקור **Layer 1–2–4**: `TEAMS_ROSTER_v1.0.0.json` → `team_21`. **Layer 3** — מסלול **AOS v3** + מנדט זה.  
**הערת מסלול:** מימוש הבילד נמצא ב־**`agents_os_v3/`** (לא `agents_os/` ישן); מנדט זה חל על **v3** בלבד.

### שכבה 1 — זהות

| שדה | ערך |
|-----|-----|
| **Team ID** | `team_21` |
| **שם** | AOS Backend Implementation |
| **group / profession** | `implementation` / `backend_engineer` |
| **דומיין** | `agents_os` |
| **הורה** | `team_11` (Gateway) |
| **תפקיד (roster)** | API, לוגיקה, DB, שירותים — מימוש backend ל־AOS. |
| **תפקיד במנדט זה** | **בעלות תוכן טכני** על **`agents_os_v3/README.md`** ועל **docstrings** בנקודות כניסה ציבוריות (מודולים/פונקציות שנחשפות דרך ה-API או סקריפטי תפעול), כך ש־**Team 71** יוכל ליישר את `AGENTS_OS_V3_*` מול הקוד בפועל. |

### שכבה 2 — סמכות

| שדה | ערך |
|-----|-----|
| **writes_to (מנדט)** | `agents_os_v3/README.md`; קבצי Python תחת `agents_os_v3/` — **רק** הוספת/עדכון **docstrings** (ולא שינוי התנהגות עסקית אלא אם באג חוסם תיעוד). |
| **writes_to (מסירה)** | `_COMMUNICATION/team_21/` — מסמך השלמה למטה. |
| **לא בתחום** | יצירת `agents_os_v3/docs/` (**אסור** לפי 3B). תיעוד קנוני ארוך ב־`documentation/docs-agents-os/` — **בעלות 71**; 21 **לא** מחליף את 71. |
| **governed_by** | SSM; ROSTER; **Directive 3B**; `AGENTS.md` (FILE_INDEX + v2 FREEZE). |
| **Iron Rules** | כל שינוי/קובץ חדש תחת `agents_os_v3/` → עדכון **`agents_os_v3/FILE_INDEX.json`**; **אין** שינוי ב־`agents_os_v2/`; **אין** המצאת שדות/נתיבי API שלא קיימים בקוד. |

### שכבה 3 — מצב נוכחי

| נושא | ערך |
|------|-----|
| **BUILD** | **COMPLETE** (GATE_5) |
| **ענף** | `aos-v3` |
| **תיאום** | **Team 71** מוביל מסמכי `AGENTS_OS_V3_*`; 21 **מספק בסיס קוד מתועד** ומגיב לבקשות הבהרה סבירות מ־71. |

### שכבה 4 — משימות חובה

| # | משימה | קריטריון קבלה |
|---|--------|----------------|
| 1 | **`agents_os_v3/README.md`** | הרצה מקומית (דורשי env, DB, פורט API, פקודות bootstrap בסיסיות) — **מסונכן** עם `AGENTS.md` ועם המצב בפועל ב-repo. |
| 2 | **Docstrings** | כיסוי לפחות ל: שכבת API ראשית (`api.py` או שווה ערך), מודולי שירות מרכזיים ש־71 מזהה עם רשימת endpoints; פורמט עקבי (Google/NumPy style או כפי שבשימוש בריפו). |
| 3 | **תיאום 71** | אם 71 מבקשת הבהרה למסמך API/ארכיטקטורה — מענה בזמן סביר דרך `_COMMUNICATION` או PR comment לפי נוהל הצוות. |

## סטנדרטים ותבניות (3B + פרויקט)

- **Directive 3B:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md` — אין `agents_os_v3/docs/`; תיאור ארוך ב־`documentation/docs-agents-os/` עם קידומת **`AGENTS_OS_V3_`** הוא אחריות **71**.  
- **כותרת זהות** על כל מסמך חדש תחת `_COMMUNICATION/team_21/` (טבלת שדות כמו במסמכי צוות אחרים במסלול BUILD): `id`, `from`, `to`, `date`, `type`, `domain`, `branch`.

## מסירה ל-Gateway

`_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` — רשימת נתיבים שעודכנו (`README`, קבצי py עם docstrings), גרסת **`FILE_INDEX.json`** אם נגעתם בקבצים חדשים, ואישור שאין שינוי ב־`agents_os_v2/`.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | T21_GATE_DOC_PHASE_B | MANDATE_ISSUED | 2026-03-28**
