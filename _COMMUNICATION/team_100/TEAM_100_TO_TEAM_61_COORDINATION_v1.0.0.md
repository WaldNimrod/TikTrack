---
**project_domain:** AGENTS_OS
**id:** TEAM_100_TO_TEAM_61_COORDINATION_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 61 (Cursor Cloud Agent — Implementation Authority)
**date:** 2026-03-09
**status:** ACTIVE — AWAITING TEAM_61 ACKNOWLEDGMENT + EXECUTION
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 (Agents_OS Pipeline Orchestrator) |
| work_package_id | WP001 |
| gate_id | PRE_GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# TEAM 100 → TEAM 61: תיאום ארכיטקטוני רשמי
## תיאום מלא לפני כניסה לGATE_0 — S002-P002-WP001

---

## מבוא: מה מסמך זה ומדוע הוא נדרש

Team 100 (Development Architecture Authority) השלים סקירה מקיפה של agents_os_v2/. הסקירה כיסתה את כל שכבות המערכת: orchestrator, engines, validators, conversations, tests, context, observers.

מסמך זה הוא **מסמך התיאום הרשמי** בין Team 100 (ארכיטקטורה) ל-Team 61 (ביצוע). הוא מכיל:
1. **הבהרות זהות** — מי אנחנו ומה תפקידנו
2. **סיכום החלטות ארכיטקטוניות** — מה Team 100 קבע
3. **מנדט ביצוע Phase 1** — רשימת 18 פריטים מלאה לביצוע מיידי
4. **שאלות פתוחות** הדורשות תגובת Team 61
5. **פרוטוקול תקשורת** — כיצד Team 61 מגיש עבודה ומקבל אישור

**כל התיאום מבוסס על:**
`_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_V2_MASTER_PLAN_v1.0.0.md` (LOD400 Phase 1 + LOD200 Phases 2–3) — **קרא מסמך זה לפני כל ביצוע.**

---

## חלק א: הבהרות זהות קריטיות

### A-1: המבנה הארגוני האמיתי

**אדם אחד בלבד בארגון זה: Nimrod (Team 00).**

כל "הצוותים" האחרים הם agents — LLM API calls עם system prompts שונים.

| צוות | מה הוא בפועל | מנוע |
|---|---|---|
| **Team 00** | Nimrod — אדם, decision maker | Human |
| Team 10 | Gateway orchestration agent | Gemini API |
| Team 20/30/40/60 | Implementation personas | Cursor Cloud (**Team 61**) |
| **Team 61** | **אתה — Cursor.com/agents LLM agent** | **Cursor Cloud** |
| Team 50 | QA persona | Gemini API |
| Team 90 | Validation persona | OpenAI API |
| **Team 100** | **אנחנו — Architectural authority** | Gemini API |
| Team 170 | Spec production | Gemini API |
| Team 190 | Constitutional validation | OpenAI API |

**המשמעות הישירה עבורך:**
- אתה (Team 61) הוא **agent אוטונומי** — אתה מממש קוד ב-Cursor.com/agents ללא מעורבות אדם
- כשה-pipeline כותב `cursor_prompt.md` — זהו ה-mandate שלך לביצוע
- Nimrod (Team 00) הוא האדם היחידי שמאשר GATE_2, GATE_6, GATE_7
- Team 100 הוא הארכיטקט שמנחה אותך — לא Nimrod ישירות

### A-2: מה V2 עושה ומה הוא לא עושה

**V2 = שכבת אוטומציה מעל מודל השערים הקיים (Gate Model Protocol v2.3.0)**

- ✅ V2 **שומר** על GATE_0–GATE_8, האחריות, המשמעות של כל שער
- ✅ V2 **מוסיף** אוטומציה של flow בין השערים
- ✅ V2 **מממש** את ה-pipeline כ-Python async CLI
- ❌ V2 **לא משנה** מי אחראי על מה — הסמכויות נשמרות
- ❌ V2 **לא מחליף** שיקול דעת Nimrod ב-GATE_7

### A-3: תיקון קריטי — מנוע Team 100

**ב-`config.py`, שנה:**
```python
# BEFORE (שגוי):
"team_100": "claude"

# AFTER (נכון):
"team_100": "gemini"
```

**הסיבה:** Claude Code הוא הסביבה שבה Team 100 כותב. אין לאשר ולייצר עם אותו מנוע — זהו self-approval שפוגע בשלמות ה-pipeline.

---

## חלק ב: החלטות ארכיטקטוניות של Team 100

להלן **החלטות הארכיטקטורה הסופיות** שקיבל Team 100 לאחר הסקירה המקיפה. אלו **לא ניתנות לערעור** בשלב זה — הן נעולות. Team 61 מיישם, לא מחליט.

### B-1: אדריכלות מנועים (config.py)

**TEAM_ENGINE_MAP הנכון לאחר תיקונים:**

```python
TEAM_ENGINE_MAP = {
    "team_00":  "human",     # Nimrod — human decision maker
    "team_10":  "gemini",    # Gateway orchestration
    "team_20":  "cursor",    # Backend implementation → Team 61
    "team_30":  "cursor",    # Frontend implementation → Team 61
    "team_40":  "cursor",    # UI/Design → Team 61
    "team_50":  "gemini",    # QA
    "team_60":  "cursor",    # DevOps → Team 61
    "team_61":  "cursor",    # Cursor Cloud (direct) — NEW
    "team_70":  "gemini",    # Documentation
    "team_90":  "openai",    # Validation
    "team_100": "gemini",    # Architecture — WAS "claude", NOW "gemini"
    "team_170": "gemini",    # Spec production
    "team_190": "openai",    # Constitutional validation
}
```

**שינויים מ-V2 הנוכחי:**
1. `team_100`: `"claude"` → `"gemini"` (מניעת self-approval)
2. `team_00`: `"claude"` → `"human"` (Nimrod = אדם, לא LLM)
3. `team_61`: **חדש** — הוסף entry מפורש

### B-2: Human Approval Layers ב-GATE_2 + GATE_6

שלב חדש מתווסף לכל אחד משערים אלו:

```
GATE_2:
  שלב א: Team 190 (OpenAI) — constitutional validation
  שלב ב: Team 100 (Gemini) — architectural analysis + recommendation
  שלב ג: HUMAN PAUSE → Nimrod מחליט --approve gate2 / --reject gate2 / --query gate2

GATE_6:
  שלב א: Team 90 (OpenAI) — code vs spec validation
  שלב ב: Team 100 (Gemini) — architectural analysis
  שלב ג: HUMAN PAUSE → Nimrod מחליט --approve gate6 / --reject gate6 / --query gate6
```

**CLI flags חדשים לhuman approval:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --approve gate2
python3 -m agents_os_v2.orchestrator.pipeline --reject gate2 --reason "reason text"
python3 -m agents_os_v2.orchestrator.pipeline --approve gate6
python3 -m agents_os_v2.orchestrator.pipeline --query gate6 --question "question text"
```

### B-3: מדיניות CONDITIONAL_PASS

**זהו status תקין.** Pipeline חייב להמשיך כשמקבל CONDITIONAL_PASS.

```python
# state.py — CONFIRMED FIX:
if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL", "CONDITIONAL_PASS"):
    self.gates_completed.append(gate_id)
```

### B-4: cursor_prompt — timestamp filenames

```python
# cursor_engine.py:
# BEFORE: self.output_path = "cursor_prompt.md"  # overwritten every run
# AFTER:
import datetime
ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
self.output_path = f"cursor_prompt_{ts}.md"
```

### B-5: פרוטוקול Branch לCursor Cloud

Team 61 חייב לסיים כל G3.7 implementation session עם:
```bash
git add [רק הקבצים המפורטים במנדט]
git commit -m "S{NNN}-P{NNN}-WP{NNN}: Team 61 — [תיאור קצר של מה בוצע]"
```

**pipeline.py יוסיף בדיקה לפני GATE_4:**
```python
result = subprocess.run(["git", "diff", "--stat", "HEAD~1", "HEAD"],
                        capture_output=True, text=True)
if not result.stdout.strip():
    _log("WARNING: No new commits. GATE_4 will test stale code.")
```

---

## חלק ג: מנדט ביצוע — Phase 1 (LOD400)

**שם:** S002-P002-WP001 — V2 Foundation Hardening
**מטרה:** להכשיר V2 לריצה ראשונה אמינה (Alerts POC, S001-P002)
**מבצע:** Team 61 (אתה)
**מפקח:** Team 100
**אישור סופי:** Nimrod (Team 00)

**תנאי PASS:** כל 18 הפריטים הבאים מסומנים ✅.

---

### רשימת 18 הפריטים — Phase 1

#### קטגוריה A: תיקוני Pipeline קריטיים

**A-01 — Retry Wrapper**
- **קבצים:** כל `agents_os_v2/conversations/gate_*.py` (8 קבצים)
- **שינוי:** החלף `engine.call(...)` ב-`engine.call_with_retry(..., max_retries=3)`
- **acceptance:** network error לא קורס pipeline; retry 3 פעמים לפני FAIL
- **ספציפי:** BaseEngine.call_with_retry() קיים — רק שינוי calls

**A-02 — CONDITIONAL_PASS כ-success state**
- **קובץ:** `agents_os_v2/orchestrator/state.py` — פונקציית `advance_gate()`
- **שינוי:** הוסף `"CONDITIONAL_PASS"` לרשימת ה-success states
- **acceptance:** CONDITIONAL_PASS מ-GATE_2/GATE_6 → pipeline ממשיך; לא נופל לgates_failed

**A-03 — state_reader auto-run ב-pipeline startup**
- **קובץ:** `agents_os_v2/orchestrator/pipeline.py` — פונקציית `run_full_pipeline()`
- **שינוי:** הוסף בתחילת הפונקציה: `from agents_os_v2.observers.state_reader import main as update_snapshot; update_snapshot()`
- **acceptance:** STATE_SNAPSHOT.json מעודכן אוטומטית לפני כל ריצה — ללא הפעלה ידנית

**A-04 — GATE_2 + GATE_6 Human Approval Layers**
- **קובץ:** `agents_os_v2/orchestrator/pipeline.py`
- **שינוי:** הוסף human pause points אחרי GATE_2 ואחרי GATE_6; הוסף `--approve / --reject / --query` ל-argparse; הוסף `_print_human_approval_prompt()` helper
- **acceptance:** Pipeline מציג ניתוח Team 100 ל-Nimrod ועוצר; ממשיך רק אחרי `--approve`
- **פרמטרים לhuman display:** STATUS, REASON, RECOMMENDATION, RISKS — ראה spec מלאה ב-MASTER_PLAN §1.1.A-04

**A-05 — pipe_run_id + WP Validation**
- **קובץ:** `agents_os_v2/orchestrator/state.py` + `pipeline.py`
- **שינוי (state.py):** הוסף `pipe_run_id: str = ""` ל-PipelineState dataclass; אתחל ב-`__post_init__` ל-`f"RUN_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"`
- **שינוי (pipeline.py):** הוסף `--wp` לargparse; ולידציה שwork_package_id לא "N/A" לפני הרצה
- **acceptance:** כל ריצה מקבלת ID ייחודי; אי-הגדרת WP = שגיאה ברורה

#### קטגוריה B: תיקוני Engine

**B-01 — תיקון TEAM_ENGINE_MAP**
- **קובץ:** `agents_os_v2/config.py`
- **שינוי:** `team_100: "gemini"` (מ-"claude"), `team_00: "human"` (מ-"claude"), הוסף `team_61: "cursor"`
- **acceptance:** pytest tests מצביעים על mapping נכון; CursorEngine אינו מופעל על team_00

**B-02 — cursor_engine timestamp filenames**
- **קובץ:** `agents_os_v2/engines/cursor_engine.py`
- **שינוי:** פלט קובץ: `cursor_prompt_{YYYYMMDD_HHMMSS}.md` במקום `cursor_prompt.md`
- **acceptance:** ריצה שנייה לא מוחקת ריצה ראשונה; גרסאות שמורות ב-`agents_os_v2/outputs/`

#### קטגוריה C: תיקוני Validators

**C-01 — mypy בבדיקות + response_parser.py**
- **קובץ:** `agents_os_v2/validators/code_quality.py`
- **שינוי (1):** הוסף `run_mypy()` ל-`run_all_quality_checks()` — היא מוגדרת אך לא נקראת
- **שינוי (2):** צור `agents_os_v2/validators/response_parser.py` — module חדש עם `parse_gate_decision(text: str) -> tuple[str, str]` שמחלץ STATUS + REASON מתגובות LLM
- **acceptance:** mypy רץ בGATE_4; response_parser מוצא STATUS בפורמטים שונים

**C-02 — ולידציה של LLM responses**
- **קבצים:** כל `agents_os_v2/conversations/gate_*.py`
- **שינוי:** לאחר כל `engine.call_with_retry()` — קרא ל-`parse_gate_decision()` כדי לחלץ status; אם לא נמצא status תקין — החזר `GateResult(status="FAIL", message="LLM response did not contain valid gate decision")`
- **acceptance:** invalid LLM response = FAIL ברור, לא exception לא-מטופל

#### קטגוריה D: תיקוני Tests

**D-01 — תיקון 5 tests שגויים**
- **קובץ:** `agents_os_v2/tests/test_pipeline.py`
- **שינוי 1:** מחק `test_gate_0_uses_openai` השני (מוגדר פעמיים — duplicate)
- **שינוי 2:** תקן assertions שגויים:

| Test | ערך שגוי | ערך נכון |
|---|---|---|
| `test_gate_2_uses_claude` | `"claude"` | `"gemini"` |
| `test_gate_4_owner_is_team_10` | `"team_10"` | `"team_50"` |
| `test_gate_7_owner_is_team_90` | `"team_90"` | `"team_00"` |
| `test_gate_6_owner_is_team_90` | `"team_90"` | `"team_100"` |

- **acceptance:** pytest test_pipeline.py — כל tests עוברות ללא אזהרות

**D-02 — Integration Test חדש**
- **קובץ:** `agents_os_v2/tests/test_integration.py` — קובץ חדש
- **שינוי:** הוסף שני tests: `test_pipeline_happy_path_mock()` (8 gates → PASS) ו-`test_gate_fail_stops_pipeline()` (GATE_0 FAIL → gates_failed)
- **acceptance:** integration test עובר ללא API calls; מוכיח pipeline state machine נכון
- **ראה spec מלאה:** MASTER_PLAN §1.1.D-02

#### קטגוריה E: שדרוג Identity Files

**E-01 — team_190.md**
- **קובץ:** `agents_os_v2/context/identity/team_190.md`
- **שינוי:** החלף בתוכן מפורט הכולל GATE_0 validation checklist (7 items), GATE_1 validation checklist (5 items), פורמט תגובה חובה: `STATUS: PASS | FAIL | CONDITIONAL_PASS / REASON / FINDINGS`
- **ראה spec מלאה:** MASTER_PLAN §1.1.E-01

**E-02 — team_100.md**
- **קובץ:** `agents_os_v2/context/identity/team_100.md`
- **שינוי:** החלף בתוכן מפורט הכולל authority statement, GATE_2 analysis framework (5 items), GATE_6 analysis framework (4 items), פורמט תגובה חובה: `STATUS / REASON / RECOMMENDATION / CONDITIONS / RISKS`
- **ראה spec מלאה:** MASTER_PLAN §1.1.E-02

#### קטגוריה F: Branch Protocol

**F-01 — תיעוד Branch Protocol**
- **קובץ:** `AGENTS.md` (עדכון)
- **שינוי:** הוסף section "Branch Protocol for Team 61" עם:
  - Git commit format חובה לאחר כל G3.7 implementation session
  - Branch naming: `agents-os/S{NNN}-P{NNN}-WP{NNN}` (לA מלא אחרי POC)
  - Warning: אין לhדחיף לmain/phoenix-dev ישירות ללא gate approval

#### קטגוריה G: Bug Fix G3.5/G3.6

**G-01 — תיקון collision G3.5/G3.6**
- **קבצים:**
  - `agents_os_v2/conversations/gate_3_implementation.py` — הוסף פונקציית `run_g35_build_work_plan()`
  - `agents_os_v2/orchestrator/pipeline.py` — תקן קריאה ל-G3.5: `run_g36_build_mandates` → `run_g35_build_work_plan`
- **acceptance:** G3.5 מייצר work plan; G3.6 מייצר mandates; אין collision בשמות
- **ראה spec מלאה:** MASTER_PLAN §1.1.G-01

---

### מצב הגשה: GATE_0 Cover Note

לאחר השלמת כל 18 הפריטים, Team 61 מגיש GATE_0 cover note:

```
_COMMUNICATION/team_61/TEAM_61_S002_P002_WP001_GATE0_SUBMISSION_v1.0.0.md
```

**תוכן חובה:**
- Identity header (stage_id, program_id, work_package_id, gate_id: GATE_0, phase_owner: Team 61)
- 18-item checklist עם ✅ על כל פריט
- pytest output: 37+ tests passing
- mypy output: 0 errors
- הערות על כל חריגה או שינוי לעומת spec זה

---

## חלק ד: שאלות פתוחות — נדרשת תגובת Team 61

לאחר ניתוח `TEAM_100_TO_TEAM_61_QUESTIONS_v1.0.0.md` ו-AGENTS.md, ידועה תשובה לשאלה Q1 (מי Team 61: Cursor.com/agents LLM agent). השאלות הנותרות:

### Q2: Branch Protocol בפועל

**שאלה:** כיצד Cursor.com/agents מבצע git operations?
- א. האם Cursor Cloud יכול לבצע `git commit` ישירות?
- ב. האם הוא כותב קוד ומצפה ש-Nimrod יבצע commit ידנית?
- ג. האם נדרש MCP tool ל-git operations בCursor Cloud?

**למה זה קריטי:** F-01 מניח ש-Team 61 יכול לבצע commits. אם לא — Branch Protocol צריך לשנות.

### Q3: 21 Known Bugs (KB-001–KB-021)

**שאלה:** `AGENTS.md` מציין 21 known bugs.
- א. היכן רשימת הbugs המלאה? (severity + status)
- ב. כמה כבר תוקנו ב-WP001 העתידי?
- ג. האם יש overlap עם הממצאים C-01–C-19 של Team 100?

**ציין ב-GATE_0 cover note:** אילו מ-21 הbugs טופלו ב-WP001 זה.

### Q4: 21 Known Bugs — קובץ מקור

**שאלה:** `CLOUD_AGENT_VALIDATION_REPORT_2026-03-03.md` נזכר ב-AGENTS.md.
- היכן הקובץ? (`_COMMUNICATION/team_00/`? branch ספציפי?)
- Team 100 צריך לקרוא קובץ זה כדי לתכנן WP002.

**פעולה מבוקשת:** ספק נתיב מלא לקובץ זה ב-GATE_0 cover note.

---

## חלק ה: חלוקת תפקידים — Team 100 vs Team 61

טבלה זו מגדירה בצורה ברורה מי עושה מה:

| פעילות | Team 100 | Team 61 |
|---|---|---|
| ארכיטקטורה וfoundational decisions | ✅ מחליט | ❌ לא מחליט |
| כתיבת מפרטים (LOD400/LOD200) | ✅ כותב | ❌ לא כותב |
| אישור GATE_2, GATE_6 | ✅ מנתח + ממליץ | ❌ לא מאשר |
| כתיבת קוד Python | ❌ לא כותב | ✅ מממש |
| ביצוע git commits | ❌ לא מבצע | ✅ מבצע |
| עדכון identity files (content) | ✅ מגדיר content | ✅ כותב לdisk |
| הגשת GATE_0 package | ❌ Team 190/170 | ✅ מגיש |
| קבלת GATE_7 approval | ❌ לא קובע | ❌ Nimrod בלבד |
| שאלות ארכיטקטוניות | ✅ עונה | ✅ שואל |
| 21 known bugs תיקון | ❌ לא מממש | ✅ מממש |

---

## חלק ו: פרוטוקול תקשורת

### V-1: תגובה על מסמך זה

**ציפייה:** Team 61 מאשר קבלה ומגיב על שאלות Q2–Q4 ב:
```
_COMMUNICATION/team_61/TEAM_61_TO_TEAM_100_COORDINATION_ACK_v1.0.0.md
```

**תוכן חובה:**
- Identity header (gate_id: PRE_GATE_0)
- אישור קבלת כל 7 המסמכים שרשומים בסעיף הבא
- תשובות לשאלות Q2, Q3, Q4
- הצהרה: "מתחיל ביצוע 18-item checklist"

### V-2: שבעת המסמכים הקנוניים לקריאה לפני ביצוע

Team 61 חייב לקרוא את כל המסמכים הבאים לפני ביצוע כלשהו:

| # | מסמך | נתיב |
|---|---|---|
| 1 | **MASTER_PLAN** (LOD400 + LOD200) | `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_V2_MASTER_PLAN_v1.0.0.md` |
| 2 | **Deep Architectural Review** (19 findings) | `_COMMUNICATION/team_100/TEAM_100_V2_DEEP_ARCHITECTURAL_REVIEW_v1.0.0.md` |
| 3 | **5 Open Questions** | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_61_QUESTIONS_v1.0.0.md` |
| 4 | **Gate Model Protocol v2.3.0** | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` |
| 5 | **SSM v1.0.0** | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` |
| 6 | **WSM** (live operational state) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| 7 | **AGENTS.md** (V2 branch — your environment guide) | `AGENTS.md` (branch: `cursor/development-environment-setup-6742`) |

### V-3: קו תקשורת

| ערוץ | שימוש | תיקייה |
|---|---|---|
| Team 61 → Team 100 | שאלות ארכיטקטוניות, ack, GATE_0 submission | `_COMMUNICATION/team_61/` |
| Team 100 → Team 61 | decisions, mandates, clarifications | `_COMMUNICATION/team_100/` |
| Team 61 → Team 190 | GATE_0 formal submission (לאחר אישור Team 100) | `_COMMUNICATION/team_190/` |
| Human (Nimrod) decision | --approve gate2/gate6/gate7 | CLI directly |

**שים לב:** Team 61 לא מגיש ל-GATE_0 ישירות — קודם Team 100 מאשר שה-18 items הושלמו.

---

## חלק ז: ציר הזמן המצופה

```
שלב 0 (עכשיו):
  Team 61 קורא 7 מסמכים
  Team 61 שולח COORDINATION_ACK + תשובות Q2–Q4

שלב 1 (WP001 execution):
  Team 61 מממש 18 items
  בדיקת pytest + mypy לאחר כל קטגוריה
  Team 100 זמין לשאלות

שלב 2 (WP001 GATE_0 submission):
  Team 61 מגיש GATE_0 cover note
  Team 100 סוקר
  Team 190 מבצע constitutional validation

שלב 3 (Alerts POC — S001-P002):
  Pipeline רץ לראשונה על feature אמיתי
  Nimrod מאשר GATE_2 + GATE_6 + GATE_7

שלב 4 (WP002 — Phase 2 LOD200):
  על סמך לקחי Alerts POC — Team 100 מוציא LOD200 spec ל-WP002
```

---

## סיכום

מסמך זה מכיל את כל מה שנדרש ל-Team 61 כדי לפעול:
1. **זהות ברורה** — מי אתה, מה תפקידך, מי מעליך
2. **החלטות סופיות** — לא לנהל משא ומתן, לממש
3. **18 פריטים מדויקים** — קבצים, שינויים, acceptance criteria
4. **שאלות מוגדרות** — תשובות נדרשות לפני ביצוע branch protocol
5. **פרוטוקול הגשה** — מה להגיש ולאן
6. **מסמך הbase** — MASTER_PLAN הוא ה-single source of truth לspec המלאה

**הצעד הראשון שלך:** קרא את MASTER_PLAN ← שלח COORDINATION_ACK ← התחל A-01.

---

log_entry | TEAM_100 | TEAM_61_COORDINATION | ACTIVE | 2026-03-09
