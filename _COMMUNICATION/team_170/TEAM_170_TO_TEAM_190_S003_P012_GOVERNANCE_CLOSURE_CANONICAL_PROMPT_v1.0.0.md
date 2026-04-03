---
id: TEAM_170_TO_TEAM_190_S003_P012_GOVERNANCE_CLOSURE_CANONICAL_PROMPT_v1.0.0
historical_record: true
from: Team 170 (Librarian / Governance & Documentation Authority)
to: Team 190 (Constitutional Architectural Validator)
cc: Team 00 (Chief Architect), Team 10 (Gateway), Team 100 (System Architect)
date: 2026-03-21
status: ACTIVE — canonical operator prompt for T190
scope: S003-P012 program governance closure package (WSM / registry / KB / archive / ssot_check)
pairs_with: TEAM_170_TO_TEAM_190_S003_P012_GOVERNANCE_CLOSURE_VALIDATION_REQUEST_v1.0.0.md---

# Team 170 → Team 190 | S003-P012 Governance Closure — **פרומט קאנוני**

**project_domain:** AGENTS_OS (program closure touches SHARED SSOT + TIKTRACK pipeline file)  
**program_id:** S003-P012  
**validation_type:** POST-CLOSURE — constitutional consistency + archive integrity  

---

## 1) הגדרת משילות — תפקיד Team 190

| Field | Value |
|-------|--------|
| Team ID | 190 |
| Role | Constitutional Architectural Validator |
| Responsibility | פסיקת **PASS** / **FAIL** / **REMEDIATE** על חבילת סגירת תוכנית (תיעוד קנוני + תקשורת בארכיון + SSOT) |
| Authority | אכיפה חוקתית מול ADR / SSM / מודל שערים / כללי ארכיון `_COMMUNICATION` |

**אין להחליף את Team 00** בקביעת “האם התוכנית נסגרה עסקית” — אתם מאמתים **עקביות חוקתית ומבנית** לפי החבילה שהוגשה.

---

## 2) Mandatory Identity Header (להעתיק לתשובתכם)

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P012 |
| program_title | AOS Pipeline Operator Reliability |
| task_id | TEAM_170_S003_P012_GOVERNANCE_CLOSURE |
| gate_context | Governance closure — **not** a runtime GATE_n execution step |
| input_package | `TEAM_170_S003_P012_GOVERNANCE_CLOSURE_DELIVERY_v1.0.0.md` |
| mandate_reference | `TEAM_170_S003_P012_GOVERNANCE_CLOSURE_AND_ARCHIVE_MANDATE_v1.0.0.md` |

---

## 3) קריאה חובה (סדר מומלץ)

1. **מסירה:** `_COMMUNICATION/team_170/TEAM_170_S003_P012_GOVERNANCE_CLOSURE_DELIVERY_v1.0.0.md`  
2. **מנדט:** `_COMMUNICATION/team_170/TEAM_170_S003_P012_GOVERNANCE_CLOSURE_AND_ARCHIVE_MANDATE_v1.0.0.md`  
3. **AS-MADE:** `_COMMUNICATION/team_170/TEAM_170_S003_P012_AS_MADE_REPORT_v1.0.0.md`  
4. **בקשת ולידציה (סקופ V-01..V-14):** `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_190_S003_P012_GOVERNANCE_CLOSURE_VALIDATION_REQUEST_v1.0.0.md`  
5. **קנון:**  
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (בלוקים `CURRENT_OPERATIONAL_STATE`, `STAGE_PARALLEL_TRACKS`)  
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` (סעיף סגירת S003-P012 אם קיים)  
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` (שורת S003-P012)  
   - `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` (בלוק **S003-P012 Closure Review**)  
6. **ארכיון:** `_COMMUNICATION/_ARCHIVE/S003/S003-P012/ARCHIVE_MANIFEST.md`  
7. **מצב תיקיות (דגימה):** `FOLDER_STATE_AFTER_ARCHIVE_S003_P012_v1.0.0.md` תחת `team_51` / `team_170` וכו'

---

## 4) בדיקות הרצה חובה (עובדה מדידה)

הריצו מ־**שורש הריפו**:

```bash
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
```

**ציפייה:** שתי הפקודות יוצאות עם **exit code 0**. אם לא — תעדו ב־REMEDIATE עם הפלט.

---

## 5) מטריצת ולידציה חוקתית — **V-01 .. V-14**

עבור כל שורה: **PASS** | **FAIL** | **N/A** + משפט נימוק.

| ID | מה לבדוק | רמז אימות |
|----|-----------|-----------|
| **V-01** | WSM משקף סגירת **S003-P012** ומצב **AOS** הבא (לפי המנדט) | טקסט `agents_os_parallel_track`, `last_closed_work_package_id`, שורת AGENTS_OS ב־`STAGE_PARALLEL_TRACKS` |
| **V-02** | Portfolio Roadmap כולל סגירת תוכנית **S003-P012** (תאריך + סמכות) | סעיף “Program closure mirror” או שקיל |
| **V-03** | Program Registry — שורת **S003-P012** במצב סגור (**COMPLETE** + ניסוח סגירה) | טבלת Programs |
| **V-04** | KNOWN_BUGS — בלוק סגירת S003-P012; אין שינוי בלתי מוצדק ב־KB מחוץ לסקופ | סעיף Closure Review + שורות KB-70 / KB-71 |
| **V-05** | AS-MADE מכסה §1–§7 (+ gap §8 אם רלוונטי) | מבנה המסמך |
| **V-06** | Delivery כולל טבלת AC + ראיות + Seal (כולל AC-12 לאחר **PASS** Team 190) | `TEAM_170_S003_P012_GOVERNANCE_CLOSURE_DELIVERY_v1.0.0.md` |
| **V-07** | עקביות בין מנדט → מסירה → בקשת ולידציה | השוואת טענות תאריך / היקף WP |
| **V-08** | קיים `ARCHIVE_MANIFEST.md` עם מיפוי מקור→יעד | תיק הארכיון |
| **V-09** | לא הועברו לארכיון נתיבים אסורים (לפי המנדט: לא `_Architects_Decisions/`, לא מצבי ריצה חיים תחת `agents_os/` וכו') | דגימה + לוגיקה |
| **V-10** | תיקיות פעילות נקיות מפליטת S003-P012 (למעט יוצאים מן הכלל במנדט) | `FOLDER_STATE_*` + `grep` מדגם על `team_61` |
| **V-11** | `ssot_check` agents_os = 0 | פקודה §4 |
| **V-12** | `ssot_check` tiktrack = 0 | פקודה §4 |
| **V-13** | אין סתירה בין WSM לבין טבלאות מקבילות / תיאור מצב | קריאה הגיונית |
| **V-14** | סגירת מחזור **S003** עקבית עם מודל **5-gate** (לא בלבול GATE_8 כסגירת חיים ל־S003) | AS-MADE §7 + ניסוחים ב-WSM |

---

## 6) פורמט פלט חובה (מסמך תשובה Team 190)

הפיקו קובץ אחד לפחות:

`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_S003_P012_GOVERNANCE_CLOSURE_VALIDATION_RESULT_v1.0.1.md`

הכילו:

```markdown
## Verdict: PASS | FAIL | REMEDIATE

## Matrix V-01..V-14
| ID | Result | Notes |

## ssot_check
- agents_os: exit ___ (paste one-line summary)
- tiktrack: exit ___ (paste one-line summary)

## Findings (ordered by severity)

## Required remediations (if REMEDIATE/FAIL)
```

---

## 7) כללי ברזל

- **אין מחיקה** של ארכיון כדי “לתקן” — רק המלצות מתוקנות ל־Team 170 / Team 10.  
- **אין לערוך `documentation/`** כחלק מהולידציה — רק **פסיקה**; עריכה = Team 10 promotion או מנדט מפורש.  
- אם חסר **GIN** / שדה קנוני — **FAIL** עם דרישת השלמה, לא המצאה.

---

## 8) הפניות מהירות

| מסמך | נתיח |
|------|------|
| בקשה מפורטת | `TEAM_170_TO_TEAM_190_S003_P012_GOVERNANCE_CLOSURE_VALIDATION_REQUEST_v1.0.0.md` |
| דוגמת פרומט קאנוני (תבנית) | `TEAM_170_TO_TEAM_190_AGENTS_OS_DOCS_VALIDATION_PROMPT_v1.0.0.md` |

---

**log_entry | TEAM_170 | TEAM_190 | S003_P012 | CANONICAL_PROMPT | v1.0.0 | 2026-03-21**
