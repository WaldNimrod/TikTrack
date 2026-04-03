---
id: TEAM_61_TO_TEAM_190_SSOT_IMPLEMENTATION_VALIDATION_REQUEST_v1.0.0
historical_record: true
from: Team 61 (AOS Unified Implementor — SSOT delivery owner)
to: Team 190 (Constitutional Validator — adversarial validation)
cc: Team 00, Team 100, Team 170, Team 10
date: 2026-03-10
type: VALIDATION_REQUEST
priority: CRITICAL
scope: S003-P012-WP001 — SSOT_IMPLEMENTATION_v1.0.0
authority:
  - TEAM_00_TO_TEAM_61_SSOT_MANDATE_v1.0.0
  - TEAM_61_SSOT_IMPLEMENTATION_DELIVERY_v1.0.0.md
status: ISSUED---

# בקשת ולידציה קנונית — SSOT Implementation (AC-01 … AC-10)

## 1. מטרה

צוות **190** מתבקש לבצע **ולידציה adversarial** (לא רק קריאת דוח) על יישום ה-SSOT שהושלם על ידי צוות 61, בהתאם ל־§4 במנדט Team 00, ולאשר או לדחות כל **Acceptance Criterion** עם ראיות ניתנות לביקורת.

תוצר נדרש מצוות 190: דוח ולידציה חתום (מבנה מוצע — §7) בנתיב:

`_COMMUNICATION/team_190/TEAM_190_SSOT_IMPLEMENTATION_VALIDATION_REPORT_v1.0.0.md`

(או שם שקיל עם מזהה גרסה; העיקר — עמידה בפורמט ראיות + PASS/FAIL per AC.)

---

## 2. סקופ (מה נכלל בבדיקה)

| שכבה | תיאור | קבצים / כניסות עיקריות |
|------|--------|-------------------------|
| **A** | הרחבת `write_wsm_state()` — סנכרון שדות `CURRENT_OPERATIONAL_STATE` ב־WSM | `agents_os_v2/orchestrator/wsm_writer.py` |
| **B** | בנייה מחדש של `STATE_SNAPSHOT.json` אחרי advance (pass/fail) + נתיב approve ידני ל־GATE_2 | `agents_os_v2/orchestrator/pipeline.py` — `_post_advance_ssot` |
| **C** | כלי `ssot_check` + שילוב ב־`pipeline_run.sh` | `agents_os_v2/tools/ssot_check.py`, `pipeline_run.sh` |
| **D** | הערת governance ב־WSM (AUTO-GENERATED) | **מחוץ לסקופ קוד Team 61** — קידום ל־Team 170/10 (`TEAM_61_PROMOTE_WSM_AUTOGEN_NOTE_FOR_TEAM_170_v1.0.0.md`) |
| **E** | `--auto-sync` placeholder (Team 101 עתידי) | `ssot_check.py` — אימות שאין side effects |

**מתוך סקופ בדיקת קוד:** רק מה שממומש ב-repo על ידי Team 61. **AC-06 / AC-10** — ולידציה כ־**dependency / doc review** (לא חוסם review קוד אם מסומן כ־DEFERRED עד קידום Team 170).

---

## 3. סעיפים שטופלו (מיפוי למנדט Team 00)

| סעיף במנדט | תיאור קצר | סטטוס מימוש (Team 61) |
|------------|------------|------------------------|
| §3 Task A | הרחבת `write_wsm_state` לכל שדות הטבלה הנדרשים; הסרת guard `gate_state is not None` | **DONE** — writer מעדכן שדות מרובים; guard הוסר |
| §3 Task B | `STATE_SNAPSHOT` rebuild בכל advance | **DONE** — `_post_advance_ssot` אחרי `state.save()` ב־`advance_gate` + אחרי `--approve GATE_2` |
| §3 Task C | `ssot_check` + שילוב ב־pipeline_run | **DONE** — CLI + `_ssot_check_print` אחרי pass/fail/approve |
| §3 Task D | הערת AUTO-GENERATED ב־`PHOENIX_MASTER_WSM` | **PENDING PROMOTION** — מסמך קידום בלבד |
| §3 Task E | רק הערה / placeholder | **DONE** — `--auto-sync` מדפיס הודעה בלבד |

---

## 4. רשימת בדיקה — AC-01 … AC-10 (למילוי על ידי Team 190)

לכל שורה: **PASS / FAIL / DEFERRED / N/A** + נתיב ראיה (פקודה, קובץ log, ציטוט שורות).

| # | קריטריון | מה לבדוק (adversarial) |
|---|-----------|-------------------------|
| **AC-01** | אחרי `./pipeline_run.sh --domain tiktrack pass` — ב־WSM יש ≥10 שדות מעודכנים ב־`CURRENT_OPERATIONAL_STATE` | הרץ pass בסביבה בטוחה (או סימולציה); `grep` על הטבלה לפני/אחרי; ודא שדות כמו `active_stage_id`, `current_gate`, `active_flow`, `phase_owner_team` משקפים את `pipeline_state_tiktrack.json`. |
| **AC-02** | אחרי אותו pass — `STATE_SNAPSHOT.json` מכיל `stage_id` / מצב עדכני התואם pipeline | בדוק timestamp `produced_at_iso`; בדוק `pipeline.domains.tiktrack` מול קובץ ה-state. |
| **AC-03** | Guard הוסר — WSM מתעדכן גם כש־`gate_state` לא `None` (למשל אחרי מעברים לגיטימיים), למעט `PASS_WITH_ACTION` | קרא `wsm_writer.py` + `pipeline.py` — אימות ש־`_post_advance_ssot` לא נקרא ב־`PASS_WITH_ACTION`; אחרת נקרא. בדוק תרחיש GATE_3/3.2 אם רלוונטי לסביבה. |
| **AC-04** | `python -m agents_os_v2.tools.ssot_check --domain tiktrack` → exit **0** כשאין drift | הרץ על workspace כשהמצב עקבי; אם יש drift אמיתי — תעד אם זה pre-existing. |
| **AC-05** | אותו כלי → exit **1** + פלט diff כשמוזרק drift | אימות לוגי: בדיקות `test_ssot_mandate.py` או הזרקת ערך שגוי ב־WSM ב־ענף בדיקה בלבד (לא commit). |
| **AC-06** | הערת "AUTO-GENERATED BLOCK — Do NOT edit manually" ב־WSM | **DEFERRED ל־Team 170** אם עדיין לא מוזג ל־`documentation/`. סמן N/A לקוד או PASS רק אם המשפט קיים בקובץ ה-WSM בפועל. |
| **AC-07** | רגרסיה pytest | `python3 -m pytest agents_os_v2/ -q --tb=short -k "not OpenAI and not Gemini"` — צפי: **0 כשלונות** (Team 61: 161 passed בזמן המסירה). |
| **AC-08** | ≥5 בדיקות SSOT (או 6 בפועל) | אשר ש־`agents_os_v2/tests/test_ssot_mandate.py` מכסה drift / CLI / writer synthetic / `_post_advance_ssot` skip. |
| **AC-09** | `pipeline_run.sh` מציג תוצאת SSOT CHECK אחרי pass/fail/approve | בדיקה ידנית: הרץ פקודות (או בדוק שהפונקציה `_ssot_check_print` נקראת אחרי ה־CLI הרלוונטי). |
| **AC-10** | `PORTFOLIO_WSM_SYNC_RULES` מעודכן | **DEFERRED ל־Team 170** — doc review; N/A לקוד Team 61 אם לא בוצע merge. |

---

## 5. סיכונים ייעודיים לבדיקת 190

1. **סביבה מקומית:** `pass` משנה state + WSM — מומלץ ענף נפרד / גיבוי לפני בדיקות הרסניות.
2. **Drift לפני יישום:** אם `ssot_check` נכשל לפני כל שינוי — תעד כ־baseline.
3. **דומיין כפול:** חזור על דגימה ל־`agents_os` אם נדרש ממנדט (המנדט מדגיש `tiktrack` בדוגמאות).

---

## 6. קריטריון גמר לולידציית 190

- כל AC שב־§4 קיבל סטטוס מפורש + ראיה.
- כל **FAIL** כולל: מזהה בעיה, מיקום קובץ/שורה, המלצת תיקון או החזרה ל־Team 61.
- אישור מפורש: **VALIDATION PASS** או **VALIDATION FAIL** לסקופ SSOT, עם הפניה ל־§6 במנדט Team 00 (חסימת חבילות עד אישור).

---

## 7. פורמט מוצע לדוח Team 190

```markdown
# TEAM_190 — SSOT Implementation Validation Report

## Executive summary
- Result: PASS | FAIL
- Date:
- Validator:

## Per-AC results
| AC | Status | Evidence |
|----|--------|----------|
| AC-01 | ... | ... |
...

## Findings (if any)
## Sign-off
```

---

## 8. הפניות מהירות

| מסמך | נתיב |
|------|------|
| מנדט Team 00 | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_SSOT_MANDATE_v1.0.0.md` |
| מסירה Team 61 | `_COMMUNICATION/team_61/TEAM_61_SSOT_IMPLEMENTATION_DELIVERY_v1.0.0.md` |
| קידום הערת WSM | `_COMMUNICATION/team_61/TEAM_61_PROMOTE_WSM_AUTOGEN_NOTE_FOR_TEAM_170_v1.0.0.md` |

---

**log_entry | TEAM_61 | SSOT_VALIDATION_REQUEST | ISSUED_TO_TEAM_190 | 2026-03-10**
