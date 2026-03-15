---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_170_S002_P005_WP001_DOCS_UPDATE_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 170 (Agents_OS Documentation & Knowledge Management)
cc: Team 100
date: 2026-03-15
status: MANDATE_ACTIVE
priority: MEDIUM
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| mandate_type | DOCS_UPDATE |
| issued_by | Team 00, 2026-03-15 |
| trigger | Session 2026-03-15 — multiple architectural changes shipped without documentation update |

---

## 1) Context

בסשן 2026-03-15 בוצעו מספר שינויים ארכיטקטוניים משמעותיים ב-Agents_OS pipeline. חלק מהשינויים משנים **התנהגות ברורה מול המשתמש** ועלולים לבלבל מפעיל שמסתמך על מסמכי עבר. יש לתעד את כולם בכלים הרלוונטיים.

---

## 2) Mandatory Documentation Items

### DOC-01 — Domain Resolution: ארכיטקטורת `PipelineState.load()`

**קובץ לעדכן / ליצור:** תיעוד טכני של pipeline state manager

**שינוי ש-shipped:**
`PipelineState.load(domain=None)` ב-`agents_os_v2/orchestrator/state.py` קיבל לוגיקת auto-detect חדשה:

| מצב | התנהגות חדשה |
|---|---|
| domain מפורש (arg או `PIPELINE_DOMAIN` env) | טוען ישירות — ללא שינוי |
| דומיין יחיד פעיל (past GATE_0), ללא arg/env | auto-select דטרמיניסטי — שקט, ללא הודעה |
| שני דומיינים פעילים, ללא arg/env | **HARD BLOCK** — מדפיס שגיאה ברורה ל-stderr + `sys.exit(1)` |
| אין דומיין פעיל | legacy fallback ל-`pipeline_state.json` / empty state |

**הגדרת "פעיל":** `work_package_id` לא ריק ולא `REQUIRED`, ו-`current_gate` לא ב-`{"", "GATE_0", "NOT_STARTED"}`.

**חשיבות:** שינוי זה מכסה **כל** נתיבי קוד אחידים (bash, Python CLI, inline helpers) — לא רק `pass/fail/approve`. אין silent default של tiktrack יותר.

**להוסיף לתיעוד:**
```
Domain resolution rules (PipelineState.load):
  1. Explicit arg > PIPELINE_DOMAIN env > auto-detect
  2. Auto-detect: scans tiktrack + agents_os state files
     - 1 active  → auto-select (deterministic)
     - 0 active  → legacy fallback
     - 2+ active → BLOCK with clear error; add --domain flag

Active = work_package_id set + current_gate not in {GATE_0, NOT_STARTED, ""}
```

---

### DOC-02 — `pipeline_run.sh`: GATE_1 FAIL מוחק `lld400_content`

**קובץ לעדכן:** pipeline operator guide / הוראות הפעלה

**שינוי ש-shipped:**
כאשר `./pipeline_run.sh fail "reason"` מופעל בזמן שהגייט הפעיל הוא `GATE_1`:
1. המערכת מריצה `$CLI --advance GATE_1 FAIL`
2. לאחר מכן **מוחקת אוטומטית** את `lld400_content` מה-state file
3. מדפיסה: `🔄 GATE_1 FAIL: lld400_content cleared → dashboard shows Phase 1 correction cycle`

**מטרה:** Dashboard מציג את מצב Phase 1 (correction cycle) מיידית לאחר BLOCK של Team 190 — ולא מצב Phase 2 ישן.

**להוסיף לתיעוד:**
```
GATE_1 fail behavior:
  ./pipeline_run.sh fail "reason"
  → advances GATE_1 to FAIL
  → clears lld400_content in state (mandatory reset)
  → dashboard immediately shows Phase 1 correction panel
  Team 170 must revise and re-submit LLD400 before Phase 2 can re-start.
```

---

### DOC-03 — `pipeline_run.sh`: AC-10 auto-store `_auto_store_gate1_artifact()`

**קובץ לעדכן:** pipeline operator guide

**מנגנון שהוסף (נשמר ב-shipped code):**
לפני כל `pass`, `phase2`, ו-`next` (generate), הסקריפט מריץ `_auto_store_gate1_artifact()`:
1. בודק אם `current_gate == GATE_1`
2. מחפש קובץ `_COMMUNICATION/team_170/TEAM_170_{WP_ID}_LLD400_v*.md` (latest version)
3. אם קיים ושונה מה-stored content — מריץ `$CLI --store-artifact GATE_1 <file>` אוטומטית
4. מדפיס: `🔄 AC-10 auto-store: <file>` + `✅ lld400_content updated`

**מטרה:** מבטל את הצורך בהרצה ידנית של `./pipeline_run.sh store GATE_1 <file>` לפני `pass`.

**להוסיף לתיעוד:**
```
AC-10 auto-store:
  At GATE_1, pipeline_run.sh auto-detects the latest LLD400 file
  (_COMMUNICATION/team_170/TEAM_170_{WP}_LLD400_v*.md) and stores it
  before prompt generation and before pass validation.
  Manual `store GATE_1` still works as override if needed.
```

---

### DOC-04 — Dashboard: Current Step Banner (`buildCurrentStepBanner`)

**קובץ לעדכן:** `agents_os/ui/` documentation / UI component registry

**קומפוננט שנוסף:** באנר אחיד מעל כל שלבי ה-pipeline (כל הגייטים), מוצג ב-`#current-step-banner` מעל accordion ה-Gate Context.

**מבנה:**
```
[Actor] — [Engine badge] — [Phase label]
Step 1: [action]
Step 2: [action]
Step 3: [action]
```

**מצבים ועיצוב:**
| מצב gate | Class | תיאור |
|---|---|---|
| GATE_1 Phase 1 (ללא lld400) | `current-step-banner` (כחול) | Team 170 / Gemini / LLD400 authoring |
| GATE_1 Phase 1 correction | `csb-correction` (צהוב) | Team 170 / Gemini / correction cycle |
| GATE_1 Phase 2 (lld400 stored) | `csb-phase2` (ירוק) | Team 190 / Codex / validation |
| `gate_state = PASS_WITH_ACTION` | `csb-pwa` (ענבר) | WP002 — actions pending |
| Human gate (GATE_7, etc.) | `csb-human` (בסגנון אנושי) | Nimrod / browser review |
| GATE_8 | standard | Team 170 / Gemini / closure |
| Standard codex gate | standard (כחול) | appropriate team per gate config |

**טריגר render:** `loadPipelineState()` → `buildCurrentStepBanner(state.current_gate, state)`

---

### DOC-05 — Dashboard: Mandate Tab Phase Auto-Selection

**קובץ לעדכן:** `agents_os/ui/` documentation / UI component registry

**שינוי ב-`_parseMandateSections()`:**
- כאשר גייט הוא two-phase (e.g. GATE_1) ו-`lld400_content` מאוחסן ← Tab של Phase 2 נבחר אוטומטית
- Tab פעיל מציג badge: `▶ SEND NOW` (ירוק)
- כאשר `lld400_content` ריק ← Tab Phase 1 נבחר אוטומטית
- `activePhase = (isTwoPhaseGate(curGate) && lld400Ready) ? 2 : 1`

**חשיבות:** המשתמש תמיד רואה את ה-mandate הנכון ללא ניחוש ידני.

---

### DOC-06 — Dashboard: PWA Button (WP002 Scaffold)

**קובץ לעדכן:** `agents_os/ui/` documentation

**רכיב שנוסף (WP002 scaffold — copy template בלבד, ללא backend):**

1. **⚡ Pass w/ Action button** — בכל Quick Action Bar; מעתיק פקודת template:
   `./pipeline_run.sh pass_with_actions "ACTION-1: [describe]|ACTION-2: [describe]"`

2. **PWA Banner** — מוצג כאשר `gate_state === "PASS_WITH_ACTION"` (כאשר WP002 יהיה פעיל):
   - מציג רשימת `pending_actions`
   - כפתור `✅ Actions Resolved` → מעתיק `./pipeline_run.sh actions_clear`
   - כפתור `⚡ Override & Advance` → מעתיק `./pipeline_run.sh override "reason"`

**הערה לתיעוד:** WP002 (PASS_WITH_ACTION governance) טרם פעיל. הכפתורים הם scaffold בלבד — הפקודות `pass_with_actions`, `actions_clear`, `override` עדיין לא קיימות ב-pipeline_run.sh כפקודות אמיתיות. יופעלו ב-S002-P005-WP002.

---

## 3) Deliverable Format

לכל DOC-01..DOC-06, Team 170 יוצר או מעדכן קובץ תיעוד ב:
- `agents_os/ui/docs/` (עבור UI components — DOC-04, DOC-05, DOC-06)
- `documentation/docs-governance/` או קובץ קיים מתאים (עבור pipeline behavior — DOC-01, DOC-02, DOC-03)

**פורמט סעיפי תיעוד:**
```markdown
### [Component name]
**Added/Changed:** [date]
**Source:** [file:line]
**Behavior:** [precise description]
**Usage example:** [if applicable]
```

**Completion deliverable:** קובץ submission ב-`_COMMUNICATION/team_100/` עם:
- רשימת כל הקבצים שעודכנו/נוצרו
- אישור שכל DOC-01..DOC-06 מכוסים

---

## 4) Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | DOC-01: domain resolution rules מתועדות עם 3 cases (single/ambiguous/none) |
| AC-02 | DOC-02: GATE_1 fail → lld400_content cleared מתועד עם example |
| AC-03 | DOC-03: AC-10 auto-store flow מתועד כולל glob pattern |
| AC-04 | DOC-04: `buildCurrentStepBanner` מתועד עם כל 6 מצבים |
| AC-05 | DOC-05: mandate tab phase auto-selection logic מתועד עם activePhase formula |
| AC-06 | DOC-06: PWA scaffold מתועד עם הערת WP002 pending |

---

**log_entry | TEAM_00 | DOCS_UPDATE_MANDATE | TEAM_170 | S002_P005_WP001 | ISSUED | 2026-03-15**
