---
id: TEAM_101_TO_TEAM_51_S003_P013_WP001_CANARY_FIXES_QA_REQUEST_v1.0.0
historical_record: true
from: Team 101 (AOS Domain Architect)
to: Team 51 (Agents_OS QA — FAST_2.5)
cc: Team 100, Team 61
date: 2026-03-23
status: QA_REQUEST_ACTIVE
type: CANONICAL_QA_ACTIVATION
work_package: S003-P013-WP001
gate: post-implementation (pipeline layer — not WSM-gated)
domain: agents_os
classification: AGENTS_OS_LANE_QA
phase_owner: Team 170
authority_basis:
  - TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0.md
  - TEAM_101_CANARY_FIXES_SUMMARY_v1.0.0.md---

# בקשת QA קאנונית — Team 51 | Canary Pipeline Fixes (FIX-101-01 … 07)

## §1 — מטרה

אימות **Functional / regression** (סביבת Agents_OS) על תיקוני שכבת ה-pipeline שמומשו במסגרת מנדט Team 100 → Team 101 (תיקוני Canary Findings).  
המימוש הושלם; נדרשת **בדיקת QA עצמאית** של Team 51 לפי נוהל V2 (סעיף Team 51 ב-`AGENTS_OS_V2_OPERATING_PROCEDURES`).

---

## §2 — Identity header (מחייב)

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P013 |
| work_package_id | S003-P013-WP001 |
| mandate_ref | TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0 |
| implementation_summary | `_COMMUNICATION/team_101/TEAM_101_CANARY_FIXES_SUMMARY_v1.0.0.md` |
| verification_artifacts | `TEAM_101_FIX_01_VERIFICATION_v1.0.0.md` … `TEAM_101_FIX_07_VERIFICATION_v1.0.0.md` (תחת `_COMMUNICATION/team_101/`) |

---

## §3 — תחום ובידול

| In scope | Out of scope |
|----------|----------------|
| `agents_os_v2/orchestrator/pipeline.py`, `wsm_writer.py` | קוד מוצר TikTrack (D33, API, UI אפליקציה) |
| `pipeline_run.sh` | שינויי WSM קנוניים ידניים ב-`documentation/` (אין לערוך לצורך QA) |
| `agents_os/ui/js/pipeline-dashboard.js`, `pipeline-config.js`, `pipeline-state.js` | GATE_6 / GATE_7 |
| `agents_os_v2/tests/`, `ssot_check` | |

---

## §4 — תנאי קדם

- Workspace: ענף `main` עדכני (או הענף שאושר לבדיקה).
- Python: `source api/venv/bin/activate`.
- דשבורד: שרת סטטי ל-`agents_os/ui/PIPELINE_DASHBOARD.html` (או `agents_os/scripts/start_ui_server.sh` אם זה הנוהל המקומי).
- קבצי מצב לדוגמה: `_COMMUNICATION/tiktrack/pipeline_state_tiktrack.json`, `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` (או נתיבים המופיעים ב-`agents_os_v2.config`).

---

## §5 — מטריצת בדיקות (חובה)

### A — Dashboard (`FIX-101-01`, `FIX-101-06`)

| # | בדיקה | צפוי |
|---|--------|------|
| A1 | GATE_2 + `current_phase` בטווח 2.1–2.3 | תצוגת מנדט רב-שלבית; `GATE_2_mandates.md` נטען מ-`GATE_MANDATE_FILES_BASE` (לא מיפוי ישן ל-G3_PLAN בלבד) |
| A2 | כותרת הדשבורד | מופיע **Last updated: YYYY-MM-DD HH:MM** (לא רק שעה) |
| A3 | לאחר `./pipeline_run.sh … pass` בטרמינל (עם מזהים תקפים) | תוך ≤5s: עדכון מצב או תג **REFRESH** עד רענון מלא |

### B — CLI / KB-84 (`FIX-101-04`)

| # | בדיקה | צפוי |
|---|--------|------|
| B1 | `./pipeline_run.sh pass` **ללא** `--wp`/`--gate` (וללא `PIPELINE_RELAXED_KB84`) | חסימה עם הודעת **identifiers required** + דוגמת פקודה |
| B2 | אותו פורמט ל-`fail`, `route`, `phase2` (כאשר רלוונטי למצב) | פורמט שגיאה אחיד |
| B3 | `PIPELINE_RELAXED_KB84=1` | התנהגות רופפת מתועדת ב-SUMMARY — אימות שאינה ברירת מחדל |

### C — HITL בפרומפטים (`FIX-101-03`)

| # | בדיקה | צפוי |
|---|--------|------|
| C1 | יצירת prompt לדוגמה (או דגימת קבצים תחת `_COMMUNICATION/*/prompts/`) | מחרוזת איסור הרצת `./pipeline_run.sh` / שינוי state בראשית התוכן |

### D — WSM / SSOT (`FIX-101-02`)

| # | בדיקה | צפוי |
|---|--------|------|
| D1 | אחרי `pass` מתועד עם `--domain tiktrack` | `python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` יוצא **0** (לאחר סנכרון אוטומטי), ללא תיקון WSM ידני |
| D2 | WSM | קיום `log_entry` עם צוות **PIPELINE_RUNNER** (או שקול מתועד) לאירוע סנכרון |

### E — `phase*` סדר (`FIX-101-07`)

| # | בדיקה | צפוי |
|---|--------|------|
| E1 | `phase2` ב-GATE_5 (מצב דו-שלבי) | עדכון state לפני `--generate-prompt`; פלט טרמינל משקף תוכן Phase 2 עדכני |

### F — Mandates / `writes_to` (`FIX-101-05`)

| # | בדיקה | צפוי |
|---|--------|------|
| F1 | מסמכי mandate שנוצרים מ-`MandateStep` | לכל שלב רלוונטי: שדה **writes_to** לא ריק (בדיקת דגימה על G3_PLAN / implementation mandates) |

### G — רגרסיה אוטומטית

| # | בדיקה | צפוי |
|---|--------|------|
| G1 | `python3 -m pytest agents_os_v2/tests/ -q --tb=line` | 0 כשלונות (התאמה לסביבה; דילוגים מותרים אם מתועדים) |

---

## §6 — ראיות (פלט נדרש מ-Team 51)

- דוח QA תחת `_COMMUNICATION/team_51/` בשם מוסכם, למשל:  
  `TEAM_51_S003_P013_WP001_CANARY_FIXES_QA_REPORT_v1.0.0.md`
- לכל כשל: צעדי שחזור, snippet מצב (ללא סודות), והפניה לקובץ/שורה.

---

## §7 — החלטה והמשך

| תוצאה | פעולה |
|--------|--------|
| **PASS** | Team 101 מעדכן Team 100 לאישור ארכיטקטורה סופי; סגירת מעגל מנדט Canary (עם הפניה לדוח Team 51). |
| **FAIL / PARTIAL** | ממצאים ל-Team 61 לתיקון או ל-Team 101 לניתוח הפרדה בין באג לתצורה; ללא שיתוף מסקנות עם Team 190 לפני תהליך עצמאי שלהם. |

---

## §8 — הערות תפעול

- **קבועות דומיין:** להריץ `pass`/`ssot_check` עם אותו `--domain` כדי למנוע drift ידוע בין tiktrack ל-agents_os.
- **KB-84:** סקריפטים ישנים ללא דגלים — להשתמש ב-`PIPELINE_RELAXED_KB84=1` רק כחריג מתועד.

---

**log_entry | TEAM_101 | TO_TEAM_51 | S003_P013_WP001_CANARY_FIXES_QA_REQUEST | CANONICAL | 2026-03-23**
