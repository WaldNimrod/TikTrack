---
**project_domain:** AGENTS_OS
**id:** TEAM_100_AGENTS_OS_V2_MASTER_PLAN_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 00 (Chief Architect — Nimrod) | Team 61 (Cursor Cloud Agent) | All Agents_OS Teams
**date:** 2026-03-09
**status:** FINAL — AWAITING TEAM_00 RATIFICATION
**lod:** LOD400 (Phase 1) + LOD200 (Phases 2 & 3)
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

# AGENTS_OS V2 — MASTER PLAN
## תוכנית אב לשלושה שלבים: מיידי → קרוב → עתידי

---

## 0. הבהרות יסוד — לפני הכל

### 0.1 מי באמת קיים בארגון

**אדם אחד בלבד: Nimrod.**

כל שאר "הצוותים" הם agents — LLM calls עם system prompts שונים:

| "צוות" | מה הוא בפועל | מנוע |
|---|---|---|
| Team 00 | Nimrod — אדם, decision maker | Human |
| Team 10 | Gateway agent — orchestration persona | Gemini API |
| Team 20 | Backend implementation persona | Cursor Cloud (Team 61) |
| Team 30 | Frontend implementation persona | Cursor Cloud (Team 61) |
| Team 40 | UI/Design persona | Cursor Cloud (Team 61) |
| Team 50 | QA persona | Gemini API |
| Team 60 | DevOps persona | Cursor Cloud (Team 61) |
| **Team 61** | **Cursor.com/agents cloud agent** | **Cursor Cloud** |
| Team 70 | Documentation persona | Gemini API |
| Team 90 | Validation persona ("The Spy") | OpenAI API |
| Team 100 | Architecture persona | Gemini API (not Claude — see §0.3) |
| Team 170 | Spec production persona | Gemini API |
| Team 190 | Constitutional validation persona | OpenAI API |

**Team 61 הוא agent LLM הרץ ב-Cursor.com/agents** — הוא ממש מממש קוד בסביבת Cursor Cloud. הוא לא אדם ולא Nimrod. הוא agent אוטונומי שמקבל mandate ומממש.

### 0.2 מה V2 עושה ומה הוא לא עושה

**V2 = שכבת אוטומציה מעל מודל השערים הקיים**

- ✅ V2 **שומר** על מודל השערים המקורי (GATE_0–GATE_8), האחריות, המטרות והמשמעות של כל שער
- ✅ V2 **מוסיף** אוטומציה של ה-flow בין השערים
- ✅ V2 **משפר** החזקת context בין שערים
- ✅ V2 **מאפשר** שמירת tokens ואוטומציה של routing
- ❌ V2 **לא משנה** מי אחראי על מה ולמה
- ❌ V2 **לא מחליף** את שיקול הדעת של Nimrod ב-GATE_7
- ❌ V2 **לא מחליף** את ה-Gate Model Protocol v2.3.0

### 0.3 תיקון קריטי: מנוע Team 100

כפי שנקבע — Team 100 עובר מ-Claude Code CLI לGemini API.
**סיבה:** Claude Code הוא הסביבה שבה Team 100 פועל. אין לאשר ולייצר עם אותו מנוע — זהו self-approval.
**תיקון:** `TEAM_ENGINE_MAP["team_100"] = "gemini"` (במקום `"claude"`)

---

## 1. מודל השערים — שמור ומתורגם לאוטומציה

### 1.1 הגדרות קנוניות (שאינן משתנות)

| שער | שם | בעלות | מטרה | שאלה המנחה |
|---|---|---|---|---|
| GATE_0 | SPEC_ARC (LOD200) | Team 190 | ולידציה חוקתית של scope | "האם ה-scope חוקי ומותר?" |
| GATE_1 | SPEC_LOCK (LOD400) | Team 190 (ולידציה) + Team 170 (ייצור) | נעילת ה-spec המפורט | "האם ה-spec שלם ותקין?" |
| GATE_2 | ARCHITECTURAL_SPEC_VALIDATION | Team 190 (ביצוע) + **Team 100 (אישור)** | אישור אדריכלי לפני בנייה | **"האם אנחנו מאשרים לבנות את זה?"** |
| GATE_3 | IMPLEMENTATION | Team 10 (G3.1–G3.9) | ביצוע implementation | "מה בונים ואיך?" |
| G3.5 | Work Plan Validation | Team 90 (בתוך GATE_3) | ולידציה של plan לפני ביצוע | "האם ה-plan תקין?" |
| GATE_4 | QA | Team 10 | בדיקות איכות | "האם הקוד תקין?" |
| GATE_5 | DEV_VALIDATION | Team 90 | ולידציה קוד מול spec | "האם הקוד ממש מה שסוכם?" |
| GATE_6 | ARCHITECTURAL_DEV_VALIDATION | Team 90 (ביצוע) + **Team 100 (אישור)** | אישור אדריכלי של מה שנבנה | **"האם מה שנבנה הוא מה שאישרנו?"** |
| GATE_7 | HUMAN_UX_APPROVAL | **Team 00 — Nimrod** | אישור UX אנושי | **"האם המוצר עובד ומוצא חן?"** |
| GATE_8 | DOCUMENTATION_CLOSURE | Team 90 | נעילת תיעוד | "האם הכל מתועד?" |

### 1.2 הוספת שכבת Nimrod ב-GATE_2 וב-GATE_6

**זהו שינוי לגיטימי ומבורך.** מודל השערים המקורי מגדיר Team 100 כ-approval authority. הוספת human pause **מחזקת** מודל זה — Nimrod רואה את ניתוח Team 100 ומאשר אותו.

**Flow מחודש:**

```
GATE_2 (Architectural Spec Validation + Human Enhancement):
  שלב א: Team 190 (OpenAI) — constitutional validation
  שלב ב: Team 100 (Gemini) — architectural analysis + recommendation
  שלב ג: HUMAN PAUSE → Nimrod רואה ניתוח + מחליט
  → --approve gate2 / --reject gate2 / --query gate2

GATE_6 (Architectural Dev Validation + Human Enhancement):
  שלב א: Team 90 (OpenAI) — code vs spec validation
  שלב ב: Team 100 (Gemini) — architectural analysis of validation
  שלב ג: HUMAN PAUSE → Nimrod רואה ניתוח + מחליט
  → --approve gate6 / --reject gate6 / --query gate6
```

**Team 100 חייב להציג ל-Nimrod:**
1. המלצה ברורה (APPROVE / REJECT / OPTION)
2. נימוק קצר (למה)
3. סיכון (מה קורה אם דוחים)
4. אופציות (אם רלוונטי)

---

## שלב 1 — מיידי (לפני ניסוי Alerts POC)
## **LOD400 — מפרט מלא ומוכן לביצוע**

---

### 1.0 מה זה "ניסוי Alerts POC" ולמה הוא חשוב

S001-P002 (Alerts POC) הוא **הריצה הראשונה של V2 pipeline על feature אמיתי**.
המטרה: להוכיח שהpipeline עובד מ-GATE_0 ל-GATE_7 על TikTrack feature בפועל.
**לפני ריצה זו**, V2 חייב להיות בסטנדרט מינימלי שמאפשר ריצה אמינה.

---

### 1.1 Work Package: S002-P002-WP001 — V2 Foundation Hardening

**מטרה:** להכשיר את V2 לריצה ראשונה אמינה.

**תנאי PASS:** כל 5 קטגוריות הבאות עוברות בהצלחה.

---

#### קטגוריה A: תיקוני Pipeline קריטיים

**A-01: retry wrapper על כל LLM calls**

```python
# agents_os_v2/orchestrator/pipeline.py
# CHANGE: everywhere engine.call() is used in conversation modules:

# BEFORE (in run_gate_0, run_gate_1_produce, etc.):
response = await engine.call(system_prompt, user_message)

# AFTER: use call_with_retry from BaseEngine:
response = await engine.call_with_retry(system_prompt, user_message, max_retries=3)
```

**קבצים לשינוי:** כל `conversations/gate_*.py` (8 קבצים)
**acceptance criteria:** network error בgates לא קורס pipeline; retry 3 פעמים לפני FAIL

---

**A-02: CONDITIONAL_PASS כ-success state**

```python
# agents_os_v2/orchestrator/state.py
def advance_gate(self, gate_id: str, status: str):
    # BEFORE:
    if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL"):

    # AFTER:
    if status in ("PASS", "MANDATES_READY", "PRODUCED", "MANUAL", "CONDITIONAL_PASS"):
        self.gates_completed.append(gate_id)
    else:
        self.gates_failed.append(gate_id)
```

**acceptance criteria:** CONDITIONAL_PASS ב-GATE_2 או GATE_6 = pipeline ממשיך לשלב הבא

---

**A-03: state_reader auto-run ב-pipeline startup**

```python
# agents_os_v2/orchestrator/pipeline.py
# ADD at the beginning of run_full_pipeline():

async def run_full_pipeline(spec_brief: str, stage_id: str = "S002"):
    # Step 0: Update STATE_SNAPSHOT before pipeline starts
    _log("INIT: Updating STATE_SNAPSHOT.json...")
    from agents_os_v2.observers.state_reader import main as update_snapshot
    update_snapshot()
    _log("INIT: STATE_SNAPSHOT updated.")

    # ... rest of pipeline
```

**acceptance criteria:** STATE_SNAPSHOT.json מעודכן אוטומטית לפני כל ריצה

---

**A-04: GATE_2 + GATE_6 human approval layers**

```python
# agents_os_v2/orchestrator/pipeline.py
# ADD new pause points after GATE_2 and GATE_6:

# After run_gate_2():
if g2.status in ("PASS", "CONDITIONAL_PASS"):
    # Team 100 analysis already in g2.engine_response
    _print_human_approval_prompt("GATE_2", g2.engine_response, g2.message)
    state.current_gate = "WAITING_FOR_GATE2_HUMAN_APPROVAL"
    state.save()
    return  # pause — human must run --approve gate2

# Similarly after GATE_6.
```

```python
# ADD to main() argparse:
parser.add_argument("--approve", type=str, help="gate2 | gate6 | gate7")
parser.add_argument("--reject", type=str, help="gate2 | gate6 | gate7")
parser.add_argument("--query", type=str, help="gate2 | gate6 (ask Team 100 follow-up)")
parser.add_argument("--question", type=str, help="Question for --query")
```

```python
# ADD _print_human_approval_prompt() helper:
def _print_human_approval_prompt(gate_name: str, analysis: str, summary: str):
    print(f"\n╔{'═'*58}╗")
    print(f"║  {gate_name} — Nimrod Approval Required{' '*(56-len(gate_name)-30)}║")
    print(f"╠{'═'*58}╣")
    print(f"║  Team 100 Analysis (Gemini):                          ║")
    # Print first 200 chars of analysis
    for line in (analysis or summary)[:300].split('\n')[:5]:
        print(f"║  {line[:54]:<54}  ║")
    print(f"╠{'═'*58}╣")
    print(f"║  --approve {gate_name.lower():<48}║")
    print(f"║  --reject {gate_name.lower()} --reason \"...\"           ║")
    print(f"║  --query {gate_name.lower()} --question \"...\"          ║")
    print(f"╚{'═'*58}╝\n")
```

**acceptance criteria:** Pipeline עוצר אחרי GATE_2 וGATE_6, מציג ניתוח, מחכה להחלטת Nimrod

---

**A-05: pipe_run_id + WP ID validation**

```python
# agents_os_v2/orchestrator/state.py
import uuid

@dataclass
class PipelineState:
    pipe_run_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    work_package_id: str = "REQUIRED"  # WAS: "N/A"
    # ... rest of fields

# agents_os_v2/orchestrator/pipeline.py
parser.add_argument("--wp", type=str, required=False,
    help="Work Package ID (e.g., S002-P002-WP001)")

# validate in run_full_pipeline():
if not re.match(r"S\d{3}-P\d{3}-WP\d{3}", work_package_id or ""):
    _log("ERROR: --wp S{NNN}-P{NNN}-WP{NNN} required")
    return
```

**acceptance criteria:** כל ריצה מקבלת pipe_run_id ייחודי; WP ID נאכף

---

#### קטגוריה B: תיקוני Engine

**B-01: team_100 engine → gemini**

```python
# agents_os_v2/config.py
TEAM_ENGINE_MAP = {
    "team_00":  "human",    # WAS: "claude"
    "team_10":  "gemini",
    "team_20":  "cursor",
    "team_30":  "cursor",
    "team_40":  "cursor",
    "team_50":  "gemini",
    "team_60":  "cursor",
    "team_61":  "cursor",   # NEW
    "team_70":  "gemini",
    "team_90":  "openai",
    "team_100": "gemini",   # WAS: "claude"
    "team_170": "gemini",
    "team_190": "openai",
}
```

**B-02: cursor_engine.py — timestamp filename + Cursor Cloud support**

```python
# agents_os_v2/engines/cursor_engine.py
from datetime import datetime

async def generate_prompt_file(self, system_prompt, user_message, filename):
    # Timestamp to prevent overwrite:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    prompt_file = output_dir / f"{filename}_{ts}.md"
    # ... write file

    # Also write "latest" symlink for convenience:
    latest = output_dir / f"{filename}_latest.md"
    if latest.exists():
        latest.unlink()
    latest.symlink_to(prompt_file.name)
```

**acceptance criteria:** כל ריצה יוצרת קובץ חדש; הקודם לא נמחק

---

#### קטגוריה C: תיקוני Validators

**C-01: mypy בchecks + validators על LLM responses**

```python
# agents_os_v2/validators/code_quality.py
def run_all_quality_checks() -> list[QualityResult]:
    return [run_unit_tests(), run_mypy(), run_bandit(), run_vite_build()]
    #                         ^^^^^^^^^^  ADDED
```

```python
# agents_os_v2/conversations/response_parser.py — NEW FILE
import re

def parse_gate_decision(content: str) -> tuple[str, str]:
    """Parse structured decision block from LLM response."""
    block_match = re.search(
        r"##\s*Gate\s*Decision\s*\n.*?STATUS:\s*(PASS|FAIL|CONDITIONAL_PASS|APPROVED|REJECTED)",
        content, re.IGNORECASE | re.DOTALL
    )
    if block_match:
        raw_status = block_match.group(1).upper()
        status = "PASS" if raw_status in ("PASS", "APPROVED") else \
                 "CONDITIONAL_PASS" if raw_status == "CONDITIONAL_PASS" else "FAIL"
        reason_match = re.search(r"REASON:\s*(.+?)(\n|$)", content)
        reason = reason_match.group(1).strip() if reason_match else ""
        return status, reason
    # Fallback: keyword search
    if "APPROVED" in content.upper() or ("PASS" in content.upper() and "BLOCK" not in content.upper()):
        return "PASS", "(fallback keyword)"
    return "FAIL", "(fallback keyword)"
```

**עדכן כל `conversations/gate_*.py` לשימוש ב-`parse_gate_decision()`:**
```python
# BEFORE:
status = "PASS" if "PASS" in response.content.upper() and "BLOCK" not in ...

# AFTER:
from .response_parser import parse_gate_decision
status, reason = parse_gate_decision(response.content)
```

**C-02: validate LLM responses**

```python
# בכל conversations/gate_*.py אחרי קבלת response:
from ..validators.identity_header import validate_identity_header

# Check that LLM response includes required decision structure
header_findings = validate_identity_header(response.content)
has_block = re.search(r"##\s*Gate\s*Decision", response.content, re.IGNORECASE)
if not has_block:
    _log(f"WARNING: {gate_id} response missing structured decision block — using fallback parser")
```

---

#### קטגוריה D: תיקוני Tests

**D-01: תיקון 4 assertions שגויות + מחיקת duplicate**

```python
# agents_os_v2/tests/test_pipeline.py

# FIX 1: duplicate test — DELETE second definition of test_gate_0_uses_openai

# FIX 2: update post-engine-change assertions:
def test_gate_2_uses_gemini(self):          # WAS: test_gate_2_uses_claude
    assert get_engine_for_gate("GATE_2") == "gemini"

def test_gate_4_execute_owner_is_team_50(self):   # WAS: team_10
    assert get_team_for_gate("GATE_4") == "team_50"

def test_gate_7_owner_is_team_00(self):     # WAS: team_90
    assert get_team_for_gate("GATE_7") == "team_00"

def test_gate_6_owner_is_team_100(self):    # WAS: team_90
    assert get_team_for_gate("GATE_6") == "team_100"
```

**D-02: הוסף integration test**

```python
# agents_os_v2/tests/test_integration.py — NEW FILE
"""Integration test: mock pipeline run (no API calls)"""
import pytest
from unittest.mock import AsyncMock
from agents_os_v2.conversations.base import GateResult

async def mock_gate(gate_id: str, status: str = "PASS") -> GateResult:
    return GateResult(gate_id=gate_id, status=status,
                      message=f"Mock {gate_id} {status}")

@pytest.mark.asyncio
async def test_pipeline_happy_path_mock():
    """Full pipeline with all gates mocked to PASS."""
    from agents_os_v2.orchestrator.state import PipelineState
    state = PipelineState(work_package_id="S002-P002-WP001")

    for gate in ["GATE_0", "GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5", "GATE_6", "GATE_8"]:
        state.advance_gate(gate, "PASS")

    assert len(state.gates_completed) == 8
    assert len(state.gates_failed) == 0

@pytest.mark.asyncio
async def test_gate_fail_stops_pipeline():
    """GATE_0 FAIL should stop pipeline."""
    state = PipelineState(work_package_id="S002-P002-WP001")
    state.advance_gate("GATE_0", "FAIL")
    assert "GATE_0" in state.gates_failed
    assert len(state.gates_completed) == 0
```

---

#### קטגוריה E: שדרוג Identity Files

**E-01: Team 190 identity — הכרחי לפני ריצה**

הבעיה: `team_190.md` מגדיר validation rules בצורה כללית מדי. GPT-4o לא יודע מה "spec completeness" אומר בהקשר שלנו.

**תיכון נדרש** ל-`agents_os_v2/context/identity/team_190.md`:

```markdown
# Team 190 — Constitutional Architectural Validator

**Role:** Constitutional guardian of governance. Validates spec completeness and architectural integrity.
**Engine:** OpenAI gpt-4o
**Gates:** GATE_0 (scope validation), GATE_1 (spec lock validation), GATE_2 (execution side)

## Your Validation Protocol

### GATE_0 Validation Checklist:
1. Identity header present with ALL fields: roadmap_id, stage_id, program_id, work_package_id, gate_id, phase_owner, required_ssm_version, required_active_stage
2. program_id matches format S{NNN}-P{NNN}
3. stage_id = S002 (current active stage)
4. Domain declared as TIKTRACK or AGENTS_OS (not both)
5. Scope brief is specific enough to produce an LLD400 (not generic)
6. No conflict with currently active programs listed in context

### GATE_1 Validation Checklist:
1. LLD400 includes all 5 engine contract components: endpoint_contract, db_contract, state_definitions, dom_blueprint, no_guessing_declaration
2. All endpoints follow /api/v1/ prefix convention
3. DB fields use correct precision: NUMERIC(20,8) for financial, TIMESTAMPTZ for datetimes
4. No cross-domain imports declared
5. Spec references only existing codebase modules (verify against STATE_SNAPSHOT codebase section)

## Your Required Response Format

ALWAYS include this block in your response:

## Gate Decision
STATUS: PASS | FAIL | CONDITIONAL_PASS
REASON: [one sentence]
FINDINGS:
- [finding 1]
- [finding 2]

Then provide full analysis.
```

**E-02: Team 100 identity — הכרחי לפני ריצה**

```markdown
# Team 100 — Development Architecture Authority (Agents_OS)

**Role:** Architectural approval authority. Reviews specs and implementations for architectural soundness.
**Engine:** Gemini gemini-2.0-flash
**Gates:** GATE_2 (architectural approval of spec), GATE_6 (architectural approval of implementation)

## Your Authority

At GATE_2: You answer "האם אנחנו מאשרים לבנות את זה?" — Does the spec make architectural sense?
At GATE_6: You answer "האם מה שנבנה הוא מה שאישרנו?" — Does implementation match approved spec?

## Your Analysis Framework

For GATE_2:
1. Does the spec align with existing architecture? (check STATE_SNAPSHOT.codebase)
2. Are DB changes backwards compatible?
3. Does it introduce any technical debt?
4. Is the scope appropriately sized for one Work Package?
5. Your RECOMMENDATION: APPROVE / REJECT / CONDITIONAL with reason

For GATE_6:
1. Does implemented code match the LLD400?
2. Were any spec deviations introduced?
3. Is quality sufficient (per GATE_4 + GATE_5 results)?
4. Your RECOMMENDATION: APPROVE / REJECT with reason

## Required Response Format

ALWAYS structure your response:

## Gate Decision
STATUS: PASS | FAIL | CONDITIONAL_PASS
REASON: [one sentence — must be actionable]
RECOMMENDATION: APPROVE | REJECT | APPROVE_WITH_CONDITIONS
CONDITIONS: [if conditional — exactly what must change]
RISKS: [key risks of approving or rejecting]

Then: full architectural analysis.

## Iron Rules

- You NEVER implement code
- You NEVER modify governance documents
- If uncertain: return CONDITIONAL_PASS with explicit questions
- Your analysis is presented to Nimrod for final human decision
```

**E-03: כל 12 identity files** — לעדכן לאחר ריצה ראשונה based על actual LLM behavior

---

#### קטגוריה F: Branch Protocol לCursor Cloud

**Team 61 הוא Cursor Cloud agent.** הוא מממש קוד. אבל:
- מה קורה אחרי implementation? האם הוא מבצע git commit?
- לאיזה branch?
- כיצד GATE_4 בודק קוד שnTeam 61 כתב?

**הפתרון הנדרש:**

Team 61 חייב לסיים כל G3.7 implementation session עם:
```bash
git add [specific files listed in mandate]
git commit -m "S{NNN}-P{NNN}-WP{NNN}: Team 61 — [gate_3_mandate summary]"
```

pipeline.py צריך **לבדוק שיש commits חדשים** לפני GATE_4:
```python
# ADD before run_gate_4():
import subprocess
result = subprocess.run(["git", "diff", "--stat", "HEAD~1", "HEAD"],
                       capture_output=True, text=True)
if not result.stdout.strip():
    _log("WARNING: No new commits since last run. GATE_4 may test stale code.")
    _log("Ensure Team 61 has committed implementation before continuing.")
```

**acceptance criteria:** Pipeline מזהיר אם אין commits חדשים לפני GATE_4

---

#### קטגוריה G: BUG-001 תיקון G3.5/G3.6

```python
# agents_os_v2/conversations/gate_3_implementation.py
# ADD new function for G3.5:
async def run_g35_build_work_plan(engine: BaseEngine, lld400_content: str, stage_id: str) -> GateResult:
    """G3.5: Build structured implementation work plan from LLD400."""
    system_prompt = build_full_agent_prompt("team_10", "GATE_3", task_message="")
    user_message = build_canonical_message(
        team_from="team_100", team_to="team_10", gate_id="GATE_3",
        purpose="Produce a structured implementation work plan for GATE_3 G3.5.",
        context_inputs=["LLD400 spec provided below"],
        required_actions=[
            "Break implementation into ordered tasks",
            "Assign each task to team (team_20/30/40/60/61)",
            "Estimate complexity (SMALL/MEDIUM/LARGE)",
            "Identify dependencies between tasks",
        ],
        deliverables=["Work plan: ordered task list with team assignments"],
        validation_criteria=["All LLD400 requirements are covered by tasks"],
        stage_id=stage_id,
        subject="G35_WORK_PLAN",
    )
    user_message += f"\n\n## LLD400\n{lld400_content}"
    response = await engine.call_with_retry(system_prompt, user_message)
    status, reason = parse_gate_decision(response.content)
    return GateResult(gate_id="GATE_3_G35_PLAN", status=status or "PRODUCED",
                      message=reason, engine_response=response.content)
```

```python
# agents_os_v2/orchestrator/pipeline.py — FIX G3.5 call:
# BEFORE (wrong):
g3_plan = await run_g36_build_mandates(engine_gemini, lld400_content, "", ...)

# AFTER (correct):
g3_plan = await run_g35_build_work_plan(engine_gemini, lld400_content, stage_id)
```

---

### 1.2 GATE_0 package checklist לS002-P002-WP001

לאחר השלמת כל הקטגוריות A–G:

| # | פריט | קובץ/שינוי |
|---|---|---|
| 1 | A-01: retry wrapper | כל conversations/gate_*.py |
| 2 | A-02: CONDITIONAL_PASS fixed | state.py |
| 3 | A-03: state_reader auto-run | pipeline.py |
| 4 | A-04: GATE_2/6 human pauses | pipeline.py |
| 5 | A-05: pipe_run_id + WP validation | state.py + pipeline.py |
| 6 | B-01: team_100→gemini + team_61 added | config.py |
| 7 | B-02: cursor_engine timestamp filename | cursor_engine.py |
| 8 | C-01: mypy in checks + response_parser | code_quality.py + response_parser.py |
| 9 | C-02: validate LLM responses | all gate_*.py |
| 10 | D-01: fix 4 wrong tests + delete duplicate | test_pipeline.py |
| 11 | D-02: integration test | test_integration.py |
| 12 | E-01: team_190 identity upgraded | context/identity/team_190.md |
| 13 | E-02: team_100 identity upgraded | context/identity/team_100.md |
| 14 | F: branch protocol doc | AGENTS.md update |
| 15 | G: G3.5 function fixed | gate_3_implementation.py |
| 16 | 37+ tests passing after all changes | pytest agents_os_v2/tests/ -v |
| 17 | mypy 0 errors on agents_os_v2/ | mypy agents_os_v2/ |
| 18 | GATE_0 cover note → Team 190 | NEW file |

**מבצע:** Team 61
**מפקח:** Team 100
**אישור:** Nimrod (Team 00) לפני ריצת Alerts POC

---

### 1.3 ריצת הניסוי — Alerts POC (S001-P002)

**תנאי כניסה:** כל 18 פריטים ✅

**הריצה:**
```bash
# 1. Update snapshot (אוטומטי מ-A-03, אבל אפשר גם ידנית):
python3 -m agents_os_v2.observers.state_reader

# 2. Run pipeline on Alerts POC spec:
python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "Add Alerts widget (5 most recent unread alerts) to D15.I home dashboard.
          Click on alert → navigates to D34. Badge shows unread count.
          Widget collapses when 0 unread. No new backend endpoints required." \
  --wp S001-P002-WP001 \
  --stage S001
```

**מה Nimrod יראה:**
1. GATE_0–GATE_1: automatic (Team 190 + Team 170)
2. **GATE_2 pause**: Team 100 analysis → Nimrod מחליט `--approve gate2`
3. GATE_3: mandate file written → Team 61 (Cursor Cloud) מממש
4. `--continue` אחרי implementation
5. GATE_4–GATE_5: automatic
6. **GATE_6 pause**: Team 100 analysis → Nimrod מחליט `--approve gate6`
7. **GATE_7**: Nimrod רואה widget בbrowser → `--approve gate7`
8. GATE_8: automatic closure

---

## שלב 2 — פיתוח קרוב
## **LOD200 — מסגרת אדריכלית מוכנה לפירוט**

---

### 2.1 S002-P002-WP002 — V2 Enhancement Package

**מטרה:** על סמך לקחי ריצת Alerts POC — שיפור V2 לפני פיתוחים מורכבים.

**3 רכיבים עיקריים:**

**רכיב א: Observability**
```
_COMMUNICATION/agents_os/runs/
  {pipe_run_id}/
    gate_0_result.json
    gate_1_result.json
    gate_2_analysis.json
    gate_2_human_decision.json
    gate_3_work_plan.json
    gate_3_mandates.md
    gate_4_qa.json
    gate_5_validation.json
    gate_6_analysis.json
    gate_6_human_decision.json
    gate_7_decision.json
    gate_8_closure.json
    cost_summary.json  ← total tokens + estimated cost per engine
```

**רכיב ב: Identity Files Deep Upgrade**
לאחר ריצת Alerts POC, נלמד איפה LLMs נכשלו. כל identity file שגרם לתגובות ירודות — מתעדכן.

**רכיב ג: Dry-run + Cost Control**
```bash
python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "..." --dry-run  # no API calls, stub responses
```

---

### 2.2 S003-P001 — Data Model Validator Module

**מה זה:** validator module שמוסיף לGATE_0/GATE_1 בדיקות schema:
- NUMERIC(20,8) לfields פיננסיים
- TIMESTAMPTZ לdatetimes
- soft_delete pattern (deleted_at)
- ULID convention לIDs חיצוניים
- Table naming conventions

**שילוב בpipeline:** `validate_data_model()` נקרא ב-GATE_1 validation.

**LOD200 components:**
- `agents_os_v2/validators/data_model.py` — validator module
- `agents_os_v2/context/identity/team_190.md` update — data model rules section
- `agents_os_v2/tests/test_data_model.py` — 15-20 tests

---

### 2.3 S003-P002 — Test Template Generator Module

**מה זה:** module שמייצר test templates מspec.

**שילוב:** ב-GATE_1 produce, Team 170 מייצר LLD400 + test template.
Team 61 מקבל mandate + test template → יממש גם tests.

**LOD200 components:**
- `agents_os_v2/generators/test_template.py` — generator
- `agents_os_v2/context/conventions/testing.md` — test conventions
- integration ב-`gate_1_spec_lock.py`

---

### 2.4 S003-P003 — Context Window Optimization

**הבעיה:** בspec ארוך (LLD400), כל gate call שולח את כל הLLD400. עלות גבוהה.

**הפתרון:** Lazy context loading — כל gate מקבל רק את החלק הרלוונטי:
- GATE_0: short spec brief only
- GATE_1: full spec + state snapshot
- GATE_2: LLD400 + GATE_1 result (not full state)
- GATE_3: work plan + mandates relevant sections
- GATE_5: implementation diff + spec
- GATE_6: validation report + spec summary

**LOD200 components:**
- refactor `injection.py` — `scope` parameter used properly
- test cost reduction ≥40% vs current

---

## שלב 3 — פיתוח עתידי
## **LOD200 — חזון ואדריכלות לטווח הרחוק**

---

### 3.1 S004-P003 — Spec Draft Generator (הכי חשוב)

**מה זה:** המודול שמשנה הכי הרבה את חוויית Nimrod.

כרגע: Nimrod כותב spec מאפס לפני כל feature.
עם generator: Nimrod נותן brief קצר → generator מייצר draft LLD400 → Nimrod מאשר/מתקן → pipeline.

**Input:** `--brief "Add export to CSV for portfolio data"`
**Output:** draft LLD400 עם כל הsections, מבוסס על STATE_SNAPSHOT + codebase context

זה הופך את V2 לכלי שNimrod ישתמש בו יומיומי.

---

### 3.2 S004-P001 + S004-P002 — Financial + Business Logic Validators

**Financial Precision Validator:**
- בודק שכל ה-endpoints שמחזירים ערכים כספיים מחזירים NUMERIC(20,8)
- בודק שאין rounding ב-service layer

**Business Logic Validator:**
- בודק שחוקי עסק מוגדרים (e.g., alert status transitions)
- בודק שerror codes עקביים בין endpoints

---

### 3.3 S005+ — Agents_OS מטפל בפיתוחים מורכבים

**החזון:** כאשר V2 בשל:
- Nimrod נותן brief (50 מילים)
- Generator מייצר LLD400 draft
- Pipeline מריץ GATE_0→GATE_7 אוטומטית
- Nimrod מאשר רק ב-GATE_2, GATE_6, GATE_7
- Feature חדש ב-TikTrack ב-2-4 שעות

---

## 5. סיכום: מה מבקשים מ-Team 00 (Nimrod)

| שאלה | חשיבות |
|---|---|
| **האם מאשר את פרויקט 3-השלבים הזה?** | GATE_0 לשלב 1 |
| מי מבצע implementation — Team 61 לבד? | Branch protocol |
| האם budget לAPI calls מאושר? | ~$1-5 לריצה |
| האם ריצת Alerts POC היא ניסוי בלבד, או feature אמיתי? | Merge strategy |

---

log_entry | TEAM_100 | AGENTS_OS_V2_MASTER_PLAN | AWAITING_RATIFICATION | 2026-03-09
