---
**project_domain:** AGENTS_OS
**id:** TEAM_100_TO_TEAM_61_WP001_REMEDIATION_MANDATE_v1.0.0
**from:** Team 100 (Development Architecture Authority — AGENTS_OS)
**to:** Team 61 (Local Cursor Implementation Agent)
**cc:** Team 00 (Nimrod), Team 190 (Constitutional Validator)
**date:** 2026-03-10
**status:** ACTIVE — EXECUTION REQUIRED
**gate_id:** GATE_0 (RE-SUBMISSION AFTER BLOCK_FOR_FIX)
**work_package_id:** S002-P002-WP001
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 (Agents_OS Pipeline Orchestrator) |
| work_package_id | S002-P002-WP001 |
| gate_id | GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

# MISSION CORRECTION + WP001 REMEDIATION MANDATE
## תיקון מיקוד: הדומיין שלנו הוא AGENTS_OS בלבד

---

## §0 הבהרת הבלבול — קריאת חובה ראשונה

**WP003 (Market Data Provider Hardening) = TIKTRACK domain — לא שלנו.**
Team 100 + Team 61 אחראיים על **AGENTS_OS domain בלבד**.

| Work Package | Domain | בבעלות מי | מצב |
|---|---|---|---|
| **WP001** (V2 Foundation Hardening) | **AGENTS_OS** | **Team 100 + Team 61** | ⛔ **BLOCKED — BF-01..BF-05** |
| WP003 (Market Data Hardening) | TIKTRACK | Team 90 + Team 10 + Team 20 | GATE_7 (runtime confirmation) |

**המשימה שלך עכשיו:** תקן BF-01..BF-05 ב-`agents_os_v2/` → WP001 חוזר ל-Team 190 לre-validation.

---

## §1 הסמכות שקיבלת

**מסמך החסימה של Team 190:**
`TEAM_190_TO_TEAM_100_TEAM_61_S002_P002_WP001_GATE0_ARCHITECTURAL_REVIEW_v1.0.0`
(הועבר לך ישירות על ידי Team 00 — Nimrod)

**החלטת Team 100:** כל 5 ממצאים = בעיות אמיתיות. תקן הכל. **אין לעגל פינות.**

---

## §2 חמשת הממצאים החוסמים — spec מלאה לביצוע

---

### BF-01 — Deterministic GATE_2/GATE_6 Wait-State (Category A)

**הבעיה:** Pipeline מציג approval prompt אך ממשיך לרוץ ולא עוצר במצב שמור. אין `WAITING_FOR_GATE2_HUMAN_APPROVAL` / `WAITING_FOR_GATE6_HUMAN_APPROVAL` כ-named states ב-state machine.

**קבצים לתיקון:**
- `agents_os_v2/orchestrator/state.py`
- `agents_os_v2/orchestrator/pipeline.py` (lines ~209–226, ~362–379)

**תיקון נדרש ב-`state.py`:**
```python
# ADD to PipelineState — explicit wait state constants:
GATE_2_WAIT_STATE = "WAITING_FOR_GATE2_HUMAN_APPROVAL"
GATE_6_WAIT_STATE = "WAITING_FOR_GATE6_HUMAN_APPROVAL"

# In advance_gate() — recognize wait states as valid pause (not fail):
def advance_gate(self, gate_id: str, status: str):
    if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL",
                  "CONDITIONAL_PASS", "WAITING_FOR_HUMAN"):
        # WAITING_FOR_HUMAN = pause state, not completion
        if status == "WAITING_FOR_HUMAN":
            self.current_gate = f"WAITING_{gate_id}"
        else:
            self.gates_completed.append(gate_id)
    else:
        self.gates_failed.append(gate_id)
    self.save()
```

**תיקון נדרש ב-`pipeline.py` (אחרי GATE_2 analysis):**
```python
# AFTER run_gate_2() returns PASS/CONDITIONAL_PASS:
state.current_gate = "WAITING_FOR_GATE2_HUMAN_APPROVAL"
state.save()
_log(f"GATE_2 PAUSED — state saved as WAITING_FOR_GATE2_HUMAN_APPROVAL")
_print_human_approval_prompt("GATE_2", g2.engine_response, g2.message)
return  # ← hard stop; pipeline saves + exits; resume via --approve GATE_2

# --approve GATE_2 handler must check state.current_gate == "WAITING_FOR_GATE2_HUMAN_APPROVAL"
# before allowing advance
```

**acceptance criteria:**
- `pipeline_state.json` shows `current_gate: "WAITING_FOR_GATE2_HUMAN_APPROVAL"` when paused
- `python3 -m pipeline --approve GATE_2` resumes from saved state
- Pipeline does NOT proceed past GATE_2 without explicit `--approve`

---

### BF-02 — Validator Policy + Mypy Green (Category C)

**הבעיה א — mypy:** 4 errors ב-`agents_os_v2/`. עיקר הבעיות ב-`gate_4_qa.py` (Python 3.10 union syntax `X | Y` במקום `Union[X, Y]`).

**קובץ לתיקון:** `agents_os_v2/conversations/gate_4_qa.py`

```python
# BEFORE (Python 3.10+ only):
def run_gate_4(...) -> dict | None:
    result: dict | None = None

# AFTER (Python 3.9 compatible):
from typing import Optional, Dict
def run_gate_4(...) -> Optional[Dict]:
    result: Optional[Dict] = None
```

כמו כן תקן missing stubs/imports שמצביע mypy — הרץ:
```bash
api/venv/bin/python -m mypy agents_os_v2/ --ignore-missing-imports
```
ואז הסר `--ignore-missing-imports` ותקן כל שגיאה אמיתית עד 0 errors.

**הבעיה ב — parse_gate_decision not uniform:**
בקבצים הבאים, ה-`parse_gate_decision()` קיים אבל לא נאכף באופן אחיד:
- `agents_os_v2/conversations/gate_0_spec_arc.py:57`
- `agents_os_v2/conversations/gate_1_spec_lock.py:64`
- `agents_os_v2/conversations/gate_2_intent.py:47`
- `agents_os_v2/conversations/gate_5_dev_validation.py:86`
- `agents_os_v2/conversations/gate_6_arch_validation.py:52`

**תיקון נדרש** — בכל gate שמקבל LLM response: אם `parse_gate_decision()` לא מוצא STATUS תקין → `GateResult(status="FAIL", message="LLM response missing valid gate decision")`. לא exception, לא silent continue.

**acceptance criteria:**
- `api/venv/bin/python -m mypy agents_os_v2/` = 0 errors
- כל gate conversation handler מחזיר FAIL מפורש על LLM response לא תקין

---

### BF-03 — Identity Files Upgraded to Operational Depth (Category E)

**הבעיה:** `context/identity/team_190.md` ו-`context/identity/team_100.md` — עדיין high-level, לא כוללים את ה-validation protocol המלא.

**קבצים לתיקון:**
- `agents_os_v2/context/identity/team_190.md` (line :12)
- `agents_os_v2/context/identity/team_100.md` (line :20)

**הspec המלאה לשני הקבצים נמצאת ב:**
`_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_V2_MASTER_PLAN_v1.0.0.md` §1.1 E-01 ו-E-02

**תוכן חובה ל-team_190.md:**
```markdown
# Team 190 — Constitutional Architectural Validator
**Role:** Constitutional guardian. Validates spec completeness + architectural integrity.
**Engine:** OpenAI gpt-4o
**Gates:** GATE_0 (scope validation), GATE_1 (spec lock), GATE_2 (execution side)

## GATE_0 Validation Checklist (7 items):
1. Identity header: ALL fields present (roadmap_id, stage_id, program_id,
   work_package_id, gate_id, phase_owner, required_ssm_version, required_active_stage)
2. program_id format: S{NNN}-P{NNN}
3. stage_id = S002 (current active stage)
4. Domain declared: TIKTRACK or AGENTS_OS (not both)
5. Scope brief: specific enough to produce LLD400
6. No conflict with active programs in context
7. Required SSM version matches current SSM

## GATE_1 Validation Checklist (5 items):
1. LLD400 includes: endpoint_contract, db_contract, state_definitions,
   dom_blueprint, no_guessing_declaration
2. Endpoints follow /api/v1/ prefix
3. DB precision: NUMERIC(20,8) financial, TIMESTAMPTZ datetimes
4. No cross-domain imports declared
5. Spec references only existing codebase modules (verify vs STATE_SNAPSHOT)

## Required Response Format — ALWAYS include:
## Gate Decision
STATUS: PASS | FAIL | CONDITIONAL_PASS
REASON: [one sentence]
FINDINGS:
- [finding 1 with file:line if applicable]
```

**תוכן חובה ל-team_100.md:**
```markdown
# Team 100 — Development Architecture Authority (Agents_OS)
**Role:** Architectural approval authority for AGENTS_OS domain.
**Engine:** Gemini gemini-2.0-flash
**Gates:** GATE_2 (approve spec), GATE_6 (approve implementation)

## Authority
GATE_2: "האם אנחנו מאשרים לבנות את זה?"
GATE_6: "האם מה שנבנה הוא מה שאישרנו?"

## GATE_2 Analysis Framework:
1. Spec aligns with existing architecture? (check STATE_SNAPSHOT.codebase)
2. DB changes backwards compatible?
3. Technical debt introduced?
4. Scope appropriate for one Work Package?
5. Your RECOMMENDATION: APPROVE / REJECT / CONDITIONAL

## GATE_6 Analysis Framework:
1. Implemented code matches LLD400?
2. Spec deviations introduced?
3. Quality sufficient (GATE_4 + GATE_5 results)?
4. Your RECOMMENDATION: APPROVE / REJECT

## Required Response Format — ALWAYS:
## Gate Decision
STATUS: PASS | FAIL | CONDITIONAL_PASS
REASON: [one sentence — actionable]
RECOMMENDATION: APPROVE | REJECT | APPROVE_WITH_CONDITIONS
CONDITIONS: [if conditional — exactly what must change]
RISKS: [key risks of approving or rejecting]
```

**acceptance criteria:**
- שני הקבצים מכילים את החלקים הנ"ל + validation checklist מלא
- LLM יוכל לפעול לפיהם ללא הנחיות נוספות

---

### BF-04 — Pre-GATE_4 Commit Freshness Check (Category F)

**הבעיה:** הדרישה מופיעה ב-AGENTS.md ובdocs אבל **לא ממומשת ב-pipeline.py**.

**קובץ לתיקון:** `agents_os_v2/orchestrator/pipeline.py`

**תיקון נדרש — הוסף לפני `run_gate_4()`:**

```python
import subprocess

def _check_commit_freshness() -> bool:
    """Return True if there are new commits since last run."""
    result = subprocess.run(
        ["git", "diff", "--stat", "HEAD~1", "HEAD"],
        capture_output=True, text=True
    )
    return bool(result.stdout.strip())

# In run_full_pipeline(), BEFORE calling run_gate_4():
if not _check_commit_freshness():
    _log("WARNING: No new commits detected since HEAD~1.")
    _log("GATE_4 may test stale code. Ensure Team 61 committed implementation.")
    _log("To override: pass --force-gate4 flag.")
    if not getattr(args, 'force_gate4', False):
        _log("STOPPING before GATE_4. Run with --force-gate4 to override.")
        state.current_gate = "WAITING_FOR_IMPLEMENTATION_COMMIT"
        state.save()
        return
```

**הוסף גם ל-argparse:**
```python
parser.add_argument("--force-gate4", action="store_true",
                    help="Override commit freshness check before GATE_4")
```

**acceptance criteria:**
- Pipeline עוצר לפני GATE_4 אם אין commits חדשים
- `--force-gate4` מאפשר override מפורש
- מוצג ב-pipeline_state.json: `current_gate: "WAITING_FOR_IMPLEMENTATION_COMMIT"`

---

### BF-05 — G3.5 Wired to Runtime (Category G)

**הבעיה:** `run_g35_build_work_plan()` מוגדרת ב-`gate_3_implementation.py` ומיובאת ב-`pipeline.py` אבל **לא נקראת בשום מקום** בzמסלול הביצוע.

**קבצים לתיקון:**
- `agents_os_v2/orchestrator/pipeline.py` (line :34 — import בלבד, אין call)
- `agents_os_v2/conversations/gate_3_implementation.py`

**בדוק את הflow הנוכחי של GATE_3 ב-pipeline.py** ומצא איפה G3.6 (`run_g36_build_mandates`) נקראת. הוסף קריאה ל-G3.5 **לפניה**:

```python
# In run_full_pipeline() — GATE_3 sequence (G3.5 THEN G3.6):

# G3.5: Build work plan from LLD400
g35_result = await run_g35_build_work_plan(
    engine=engine_gemini,
    lld400_content=state.lld400_content,
    stage_id=state.stage_id
)
state.work_plan = g35_result.engine_response
state.save()
_log(f"G3.5 DONE — status: {g35_result.status}")

if g35_result.status not in ("PASS", "PRODUCED", "CONDITIONAL_PASS"):
    state.advance_gate("GATE_3_G35", g35_result.status)
    _log("G3.5 FAIL — stopping GATE_3")
    return

# G3.6: Build mandates from work plan
g36_result = await run_g36_build_mandates(
    engine=engine_cursor,
    work_plan=state.work_plan,
    stage_id=state.stage_id
)
```

**הוסף integration test ב-`test_integration.py`:**
```python
@pytest.mark.asyncio
async def test_g35_g36_chain():
    """G3.5 must run before G3.6 — verify chain produces work_plan."""
    from unittest.mock import AsyncMock, patch
    from agents_os_v2.conversations.base import GateResult

    mock_g35 = AsyncMock(return_value=GateResult(
        gate_id="GATE_3_G35", status="PRODUCED",
        message="Work plan ready", engine_response="PLAN: task1, task2"
    ))
    mock_g36 = AsyncMock(return_value=GateResult(
        gate_id="GATE_3_G36", status="MANDATES_READY",
        message="Mandates written", engine_response="cursor_prompt..."
    ))

    with patch("agents_os_v2.conversations.gate_3_implementation.run_g35_build_work_plan", mock_g35):
        with patch("agents_os_v2.conversations.gate_3_implementation.run_g36_build_mandates", mock_g36):
            result = await run_gate_3_chain_mock(mock_g35, mock_g36)
            assert mock_g35.called, "G3.5 must be called"
            assert mock_g36.called, "G3.6 must be called after G3.5"
```

**acceptance criteria:**
- Running pipeline reaches GATE_3 → G3.5 executes → G3.6 executes
- G3.5 FAIL blocks G3.6 (no mandate without work plan)
- Integration test passes

---

## §3 סדר הביצוע המומלץ

```
1. BF-02 mypy תיקון  ← עשה ראשון (הכי פשוט + מאמת בסיס)
2. BF-03 identity files ← עריכת markdown, לא קוד
3. BF-05 G3.5 wiring ← wire function call + integration test
4. BF-04 commit freshness ← הוסף helper + argparse
5. BF-01 wait-state ← הכי מורכב, לאחרון
```

הרץ `pytest agents_os_v2/tests/ -q` ו-`mypy agents_os_v2/` לאחר **כל** BF.

---

## §4 הגשה לאחר תיקון

**GATE_0 re-submission document:**
`_COMMUNICATION/team_61/TEAM_61_S002_P002_WP001_GATE0_RESUBMISSION_v1.0.0.md`

**תוכן חובה:**
1. Identity header (gate_id: GATE_0, work_package_id: WP001)
2. טבלה: BF-01..BF-05 — כל אחד עם:
   - status: FIXED
   - קובץ ששונה + line reference
   - acceptance criteria נבדק ✅
3. pytest output: 61+ passed, 0 failures
4. mypy output: 0 errors
5. הפנייה לreview: Team 190

**שלח ל:** `_COMMUNICATION/team_190/` (GATE_0 re-validation request)

---

## §5 מה לא לגעת בו

- **WP003** — לא שלנו. כל הדומיין TIKTRACK נמצא אצל Team 90/10/20.
- כל קוד מחוץ ל-`agents_os_v2/` — אל תיגע ללא הנחיה מפורשת
- WSM / SSM / governance docs — אל תיגע

---

log_entry | TEAM_100 | TEAM_61_WP001_REMEDIATION_MANDATE | ISSUED | BF-01..BF-05 | 2026-03-10
