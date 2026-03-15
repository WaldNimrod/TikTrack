---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 170 (Spec & Governance), Team 190 (Constitutional Validation)
cc: Team 100, Team 10
date: 2026-03-15
status: MANDATE_ACTIVE
priority: HIGH
thread: AOS_DOCS_AUDIT (new standing thread)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | GOVERNANCE |
| mandate_type | DOCS_AUDIT + ONGOING_GOVERNANCE |
| trigger | ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0 + accumulated docs drift detected |

---

## 1) Purpose — מטרת המנדט

פתיחת **thread נפרד וממוסד** לבדיקת תקינות ודיוק תיעוד מערכת AOS מול:
1. **קוד בפועל** — מה הקוד עושה כיום
2. **החזון** — מה AOS אמורה להיות (Mode 3 full-auto)
3. **תוכניות עתידיות** — roadmap + WP-level plans

**המטרה:** מניעת drift — מצב בו התיעוד מתאר מציאות שונה מהקוד, גורמת לאגנטים לפעול בהנחות שגויות ומייצרת שגיאות systemic.

**הפעלה:** Team 170 + Team 190 עובדים במשותף. Team 190 מבצע ולידציה חוקתית של הממצאים. Team 170 מבצע תיקונים ומוסיף תיעוד.

---

## 2) Scope — תחום הבדיקה

### 2A — Architecture Principle Updates (PRIORITY 1 — זמן קצר)

הטמעת `ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0` בכל נקודות הגע:

| קובץ / מסמך | שינוי נדרש |
|---|---|
| `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | עדכון Team 10 לפי v2.0.0 של Roster; הוספת הערת "output: structured verdict only" ל-Team 190/50/90 |
| כל activation prompts של Team 190 | הסרת כל `owner_next_action` מ-output contract; הוספת constraint: "do NOT route to other teams" |
| כל activation prompts של Team 50/51 | הסרת routing instructions; output = test results + verdict only |
| כל activation prompts של Team 90 | הסרת routing instructions; output = review notes + verdict only |
| כל activation prompts של Team 10 | עדכון לשלושת המצבים (Mode 1/2/3) לפי ADR |
| `PHOENIX_MASTER_WSM_v1.0.0.md` | בדיקה — האם מתואר Team 10 כ-"process coordinator" באופן שסותר Mode 2+ |

**New document to author:**
- `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` — טבלה דטרמיניסטית: כל verdict (PASS/FAIL/BLOCK) + מקור gate → next team + action. ללא שיקול דעת. Team 00 יאשר לאחר ניסוח.

### 2B — Code vs. Docs Alignment Audit (PRIORITY 2 — תהליך מובנה)

Team 190 סורקת; Team 170 מתקנת.

**קבצי קוד לבדיקה מול תיעוד:**

| קובץ קוד | תיעוד מקביל לבדיקה |
|---|---|
| `agents_os_v2/orchestrator/state.py` | כל מסמך שמתאר pipeline state schema |
| `agents_os_v2/orchestrator/pipeline.py` | כל מסמך שמתאר pipeline CLI commands |
| `agents_os_v2/orchestrator/gate_router.py` | כל מסמך שמתאר gate→engine→team mapping |
| `pipeline_run.sh` | כל operator guide / pipeline docs |
| `agents_os/ui/PIPELINE_DASHBOARD.html` + `js/` | כל UI component documentation |
| `agents_os_v2/config.py` | כל מסמך שמתאר domain names, paths, defaults |

**דוגמאות לdrift שנמצא:**
- `lld400_content` נמחק ב-GATE_1 FAIL — התנהגות חדשה שלא תועדה
- AC-10 auto-store — לא תועד
- domain guard ב-`PipelineState.load()` — תועד חלקית ב-DOC-01 mandate אבל לא בכל context files
- `gate_state`, `pending_actions`, `override_reason` — שדות חדשים ב-state.py שטרם תועדו מלאו

### 2C — Vision Alignment (PRIORITY 3 — בדיקה אחת לחודש)

השוואה בין מסמכי ארכיטקטורה לחזון Mode 3:
- האם כל תיאור של AOS מציין בבירור את שלב ה-mode (1/2/3)?
- האם תיאורי "מה AOS עושה" מבדילים בין מה שכבר קיים לבין מה שמתוכנן?
- האם ה-roadmap (S003+) מיושר עם כיוון AOS Mode 3?

---

## 3) Output Format — פורמט הפלט

### לכל ממצא drift (2B / 2C):

```markdown
### DRIFT-XXX
- **file_doc:** [path to document]
- **file_code:** [path to code OR "N/A — missing feature"]
- **discrepancy:** [תיאור קצר של הפער]
- **severity:** BLOCKER | HIGH | MEDIUM | LOW
- **fix:** [מה Team 170 צריך לכתוב/לשנות]
- **status:** OPEN | FIXED
```

### דוח סיכום:

```markdown
## AOS Docs Audit Report — [date]
### Summary
- files_scanned: N
- drift_items_found: N
- severity_breakdown: { blocker: N, high: N, medium: N, low: N }
- items_fixed: N
- items_open: N

### Findings Table
| DRIFT-ID | severity | file | discrepancy | status |
...

### Verdict
CLEAN | DRIFT_FOUND_OPEN | DRIFT_FOUND_FIXED
```

---

## 4) Division of Responsibility

| Task | Team 170 | Team 190 |
|---|---|---|
| Scan code files vs. docs (2B) | — | ✅ Primary |
| Author fixes to docs | ✅ Primary | — |
| Validate fixes are accurate | — | ✅ Sign-off |
| Author new context files / activation prompts | ✅ Primary | — |
| Validate prompts don't contain routing (2A compliance) | — | ✅ Sign-off |
| Author Mode 1 routing table | ✅ Primary | — |
| Vision alignment check (2C) | ✅ Primary | ✅ Joint |

---

## 5) Thread Governance — ממשל ה-Thread

### Trigger points (when to run)

| Trigger | Action |
|---|---|
| כל gate completion (GATE_8 per WP) | Team 170 checks 2A compliance for items touched by that WP |
| כל pipeline code change (state.py, pipeline.py, pipeline_run.sh) | Team 190 runs targeted 2B scan on changed files |
| כל S (Stage) activation | Full 2B + 2C audit |
| On-demand (Team 00 request) | Full audit, priority override |

### First run (immediate)

This mandate triggers the first audit session immediately:
1. Team 170: execute 2A (priority 1) — update all activation prompts + role mapping
2. Team 190: validate 2A changes are correct and don't re-introduce routing instructions
3. Both: targeted 2B scan on: `state.py`, `pipeline.py`, `pipeline_run.sh`
4. Report: submit to `_COMMUNICATION/team_100/` as `TEAM_170_190_AOS_AUDIT_REPORT_ROUND1_v1.0.0.md`

---

## 6) Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | All Team 190/50/90/10 activation prompts updated per Process-Functional Separation directive |
| AC-02 | `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` reflects Team Roster v2.0.0 |
| AC-03 | `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` authored and approved by Team 00 |
| AC-04 | All known drift items (state.py fields, GATE_1 fail behavior, AC-10 auto-store, domain guard) documented in respective docs |
| AC-05 | Audit report submitted with severity breakdown |
| AC-06 | No `owner_next_action` found in any Team 190/50/90 output template |

---

*log_entry | TEAM_00 | AOS_DOCS_AUDIT_MANDATE | TEAM_170_TEAM_190 | THREAD_OPENED | 2026-03-15*
