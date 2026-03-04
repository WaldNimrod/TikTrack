---
**project_domain:** AGENTS_OS
**id:** TEAM_100_TEAM_61_MANDATE_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 61 (Cursor Cloud Agent)
**date:** 2026-03-04
**status:** ACTIVE — MANDATE_ISSUED
**mandate_type:** Role Authorization + Remediation Assignment + Standing Operating Procedures
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | WP001 |
| task_id | MANDATE-61-001 |
| gate_id | PRE_GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# TEAM 100 → TEAM 61: ARCHITECTURAL MANDATE
## Role Authorization, V2 Remediation Assignment, Standing Operating Procedures

---

## 1. Role Authorization

**Team 61 is AUTHORIZED** as the Cursor implementation authority within the Agents_OS domain.

This authorization is issued by Team 100 (Development Architecture Authority — Agents_OS) following the architectural review of `agents_os_v2/` on branch `cursor/development-environment-setup-6742`.

### 1.1 Identity

| Field | Value |
|---|---|
| Team ID | team_61 |
| Full Name | Cursor Cloud Agent |
| Engine | cursor |
| Domain | AGENTS_OS (exclusively) |
| Reporting to | Team 100 |
| Gate participation | GATE_3 implementation stage (G3.7), remediation tasks |
| Gate authority | NONE — Team 61 is an execution team, not a governance team |
| Scope | Implementation of mandates produced at GATE_3 G3.6 |

### 1.2 What Team 61 Is

Team 61 is the **Cursor-engine implementation team** for Agents_OS V2. When the pipeline reaches G3.6 (build mandates), the resulting mandate files are Team 61's work orders. Team 61 executes the implementation in Cursor and commits the code. The pipeline resumes with `--continue` after Team 61 completes the implementation.

Team 61 is NOT:
- A governance team (no authority to modify SSM, WSM, or canonical docs)
- An architecture team (no authority to change gate routing, engine mapping, or identity files without Team 100 approval)
- A validation team (Team 90 validates; Team 61 implements)

### 1.3 Engine Assignment

Team 61 operates via the `cursor` engine as defined in `agents_os_v2/config.py`:

```python
TEAM_ENGINE_MAP = {
    ...
    "team_60":  "cursor",
    ...
}
```

Note: `team_61` is not yet in `TEAM_ENGINE_MAP`. Team 61 must be added as part of the first remediation pass:
```python
"team_61":  "cursor",
```

---

## 2. V2 Remediation Assignment

Team 61 delivered `agents_os_v2/` and it passed architectural review as CONDITIONAL_PASS. Five (5) items require remediation before GATE_0 submission. All five are assigned to Team 61.

### Remediation R-01 — G3.5/G3.6 Function Collision (HIGH)

**File:** `agents_os_v2/orchestrator/pipeline.py`
**Location:** `run_full_pipeline()`, lines ~68–76

**Problem:**
```python
# CURRENT (WRONG):
g3_plan = await run_g36_build_mandates(engine_gemini, ...)  # labelled as "work plan" but calls mandate function
g35 = await run_g35_work_plan_validation(engine_openai, ...)
g36 = await run_g36_build_mandates(engine_gemini, ...)
```

The first call (labelled "building work plan") incorrectly calls `run_g36_build_mandates`. G3.5 plan generation and G3.6 mandate generation are different artifacts with different prompts.

**Required fix:**
1. Create `run_g35_build_work_plan(engine, lld400_content, stage_id)` in `conversations/gate_3_implementation.py`
   - This function asks the engine to produce a structured implementation work plan from the LLD400
   - Output: work plan document, not mandate files
2. `run_g36_build_mandates(engine, lld400_content, work_plan, wp_id, stage_id)` remains for mandate generation (already exists)
3. Update `pipeline.py` to call `run_g35_build_work_plan()` at the G3.5 step

**Acceptance criteria:** G3.5 and G3.6 call distinct functions with distinct prompts producing distinct artifacts.

---

### Remediation R-02 — CursorEngine Execution Model (MEDIUM)

**File:** `agents_os_v2/engines/cursor_engine.py`

**Problem:** Cursor is an IDE, not a programmatic API. The execution model of `CursorEngine` was not confirmed during review.

**Required fix:**
Option A (PREFERRED): `CursorEngine` is a **mandate file generator** — it writes the mandate to `_COMMUNICATION/agents_os/prompts/cursor_mandate.md` and returns a `[MANUAL]` response indicating human paste required. This is consistent with the G3.6 pause already in `pipeline.py`.

Option B (IF cursor has an agent API): Document the API, version-pin the dependency, and add error handling for API failures.

**Implementation:**
- If Option A: Confirm `cursor_engine.py` implements the file-based fallback model (same pattern as `ClaudeEngine._fallback_to_file()`). Add `CursorEngine.is_programmatic = False` class attribute.
- Update docstring to explicitly state: "CursorEngine generates mandate files for human execution in Cursor IDE. It does not make programmatic API calls."
- Submit the full `cursor_engine.py` content to Team 100 as part of GATE_0 package.

**Acceptance criteria:** Execution model is documented and consistent with the pipeline pause architecture.

---

### Remediation R-03 — mypy Excluded from Quality Checks (HIGH)

**File:** `agents_os_v2/validators/code_quality.py`

**Problem:**
```python
def run_all_quality_checks() -> list[QualityResult]:
    return [run_unit_tests(), run_bandit(), run_vite_build()]
    # run_mypy() is MISSING — Iron Rule violation per KB-006
```

**Required fix:**
```python
def run_all_quality_checks() -> list[QualityResult]:
    return [run_unit_tests(), run_mypy(), run_bandit(), run_vite_build()]
```

**Acceptance criteria:** `run_mypy()` is in `run_all_quality_checks()` and mypy passes with 0 errors on the `agents_os_v2/` module.

---

### Remediation R-04 — work_package_id Defaults to "N/A" (MEDIUM)

**Files:** `agents_os_v2/orchestrator/pipeline.py`, `agents_os_v2/orchestrator/state.py`

**Problem:** `PipelineState.work_package_id` defaults to `"N/A"`. All canonical messages include this field in the Identity Header. A WSM-compliant run requires a real WP ID.

**Required fix:**
1. Add `--wp` argument to `argparse` in `main()`:
   ```python
   parser.add_argument("--wp", type=str, required=True, help="Work Package ID (e.g., S002-P002-WP001)")
   ```
   Note: `required=True` only when `--spec` is used (can be conditional on args.spec being set).
2. Validate format: must match `S\d{3}-P\d{3}-WP\d{3}` pattern
3. Store in `PipelineState.work_package_id` from the start of the run
4. Pass WP ID to all `build_canonical_message()` calls

**Acceptance criteria:** Running `--spec "..."` without `--wp` produces a usage error. Running with `--wp S002-P002-WP001` stores the ID and passes it to all gate messages.

---

### Remediation R-05 — Fragile PASS/FAIL Response Parsing (HIGH)

**Files:** All `agents_os_v2/conversations/gate_*.py`

**Problem:** Every gate conversation parses LLM response as:
```python
status = "PASS" if "PASS" in response.content.upper() and "BLOCK" not in response.content.upper() else "FAIL"
```
This is fragile. LLM responses are free-form and edge cases exist.

**Required fix — two parts:**

**Part A:** Update `build_canonical_message()` in `injection.py` to append a required response format to Section 6:
```python
f"## 6) Response required\n"
f"- Respond with a structured decision block EXACTLY as follows:\n"
f"```\n"
f"## Gate Decision\n"
f"STATUS: PASS | FAIL | CONDITIONAL_PASS\n"
f"REASON: [one sentence]\n"
f"FINDINGS: [bulleted list of findings, or 'None']\n"
f"```\n"
f"- Then provide full analysis.\n"
```

**Part B:** Create `agents_os_v2/conversations/response_parser.py` with:
```python
import re

def parse_gate_decision(content: str) -> tuple[str, str]:
    """
    Parse structured decision block from LLM response.
    Returns (status, reason). Status is 'PASS', 'FAIL', or 'CONDITIONAL_PASS'.
    Falls back to keyword search if structured block not found.
    """
    block_match = re.search(r"## Gate Decision\s+STATUS:\s*(PASS|FAIL|CONDITIONAL_PASS)", content, re.IGNORECASE)
    if block_match:
        status = block_match.group(1).upper()
        reason_match = re.search(r"REASON:\s*(.+)", content)
        reason = reason_match.group(1).strip() if reason_match else ""
        return status, reason
    # Fallback to keyword search with warning logged
    if "APPROVED" in content.upper() or ("PASS" in content.upper() and "BLOCK" not in content.upper()):
        return "PASS", "(fallback: keyword match)"
    return "FAIL", "(fallback: keyword match)"
```

**Part C:** Update all gate conversation modules to use `parse_gate_decision()`:
```python
from .response_parser import parse_gate_decision
status, reason = parse_gate_decision(response.content)
```

**Acceptance criteria:** All gate conversations use `parse_gate_decision()`. Structured block parsing works for normal responses. Fallback handles malformed responses without crash.

---

### Additional: Add team_61 to TEAM_ENGINE_MAP

**File:** `agents_os_v2/config.py`

```python
TEAM_ENGINE_MAP = {
    ...
    "team_60":  "cursor",
    "team_61":  "cursor",  # ADD THIS
    ...
}
```

---

## 3. Identity Files Review Assignment

Before GATE_0 submission, all 12 `context/identity/team_XX.md` files must be reviewed for accuracy. Team 61 is responsible for the initial review pass. Team 100 will confirm.

**Files to review:**
- `agents_os_v2/context/identity/team_00.md` — Chief Architect (Nimrod)
- `agents_os_v2/context/identity/team_10.md` — Backend implementation
- `agents_os_v2/context/identity/team_20.md` — Cursor backend
- `agents_os_v2/context/identity/team_30.md` — Cursor frontend
- `agents_os_v2/context/identity/team_40.md` — Cursor QA
- `agents_os_v2/context/identity/team_50.md` — QA coordinator
- `agents_os_v2/context/identity/team_60.md` — CI/CD
- `agents_os_v2/context/identity/team_70.md` — Documentation
- `agents_os_v2/context/identity/team_90.md` — Dev validation
- `agents_os_v2/context/identity/team_100.md` — Architecture authority (Agents_OS)
- `agents_os_v2/context/identity/team_170.md` — Spec production
- `agents_os_v2/context/identity/team_190.md` — Governance validation

**Quality criteria per identity file:**
1. Team ID, name, domain correctly stated
2. Gate authority explicitly listed (which gates this team participates in)
3. What this team DOES and does NOT do (scope boundaries)
4. Reporting relationship stated
5. Iron Rules applicable to this team listed

**Also create:** `agents_os_v2/context/identity/team_61.md` for Team 61's own identity.

---

## 4. Standing Operating Procedures for Team 61

Once V2 is operational (after GATE_6 of WP001), Team 61's standard operating procedure per pipeline run is:

### 4.1 Receiving a Work Order

When the pipeline reaches G3.6, mandate files are written to:
```
_COMMUNICATION/agents_os/prompts/implementation_mandates.md
```

Team 61 opens this file in Cursor and reads the work order. The work order contains:
- Files to create or modify
- Exact functionality to implement
- Architecture constraints (from the LLD400)
- Validation criteria (what GATE_4 will check)

### 4.2 Implementation Rules

1. **Stay in scope** — implement only what the mandate specifies. No "while I'm at it" changes.
2. **Domain isolation** — never import from `api/` inside `agents_os_v2/`. Never import from `agents_os_v2/` inside `api/`.
3. **No governance doc modification** — do not touch `_COMMUNICATION/`, `_COMMUNICATION/_Architects_Decisions/`, or any `.md` governance file without a specific mandate to do so.
4. **Commit message format** — every commit must include `team_id: team_61` and `gate_stage: G3.7` in the commit body.
5. **Run validators before signaling done** — run `python3 -m agents_os_v2.validators` (or equivalent) before indicating implementation complete.

### 4.3 Signaling Completion

When implementation is complete:
```bash
python3 -m agents_os_v2.orchestrator.pipeline --continue
```
This triggers GATE_4 (code quality) and GATE_5 (dev validation) automatically.

### 4.4 Handling Failures

If GATE_4 or GATE_5 returns FAIL:
1. Read the failure findings in `_COMMUNICATION/agents_os/gate_4_result.json` or equivalent
2. Fix the failing items — do not reopen GATE_0 or change architecture
3. Run `--continue` again
4. Maximum 3 retry cycles per mandate before escalating to Team 90 for clarification

### 4.5 What Team 61 Does NOT Do

- Does not modify `gate_router.py`, `config.py`, `injection.py` without explicit Team 100 approval
- Does not skip gates or approve gates manually
- Does not merge branches to `main` or `phoenix-dev` — branch management is handled post-GATE_7
- Does not interpret governance documents autonomously — ask Team 100 if unclear

---

## 5. GATE_0 Submission Package Checklist

Team 61 is responsible for preparing the following before Team 190 can run GATE_0 validation:

| # | Item | Status |
|---|---|---|
| 1 | BUG-001 fixed (G3.5/G3.6 separation) | ⬜ TODO |
| 2 | BUG-002 resolved (cursor_engine.py reviewed + documented) | ⬜ TODO |
| 3 | BUG-003 fixed (mypy in quality checks) | ⬜ TODO |
| 4 | BUG-004 fixed (WP ID required) | ⬜ TODO |
| 5 | BUG-005 fixed (structured response parsing) | ⬜ TODO |
| 6 | team_61 added to TEAM_ENGINE_MAP | ⬜ TODO |
| 7 | All 12 identity files reviewed + team_61.md created | ⬜ TODO |
| 8 | All existing 37 tests still passing after changes | ⬜ TODO |
| 9 | mypy 0 errors on agents_os_v2/ module | ⬜ TODO |
| 10 | GATE_0 cover note written by Team 61 to Team 190 | ⬜ TODO |

When all 10 items are ✅, Team 61 notifies Team 100. Team 100 confirms and authorizes GATE_0 submission.

---

## 6. Communication Protocol

Team 61 communicates via:
- `_COMMUNICATION/agents_os/` — runtime artifacts (state, prompts, gate results)
- `_COMMUNICATION/team_100/TEAM_61_TO_TEAM_100_*.md` — formal communications to Team 100

Team 61 does NOT write to:
- `_COMMUNICATION/team_00/` — Chief Architect channel
- `_COMMUNICATION/_Architects_Decisions/` — locked decisions (Team 100/Team 00 only)
- Any other team's folder

---

## 7. Recognition

Team 61 delivered the first working Agents_OS pipeline. This is a significant achievement. The V2 codebase is architecturally sound, correctly aligned with the canonical gate model, and demonstrates genuine multi-agent orchestration capability.

The 5 remediations are small. The foundation is correct.

**Team 61 has the full confidence of Team 100 to continue.**

---

log_entry | TEAM_100 | TEAM_61_MANDATE | ACTIVE | 2026-03-04
