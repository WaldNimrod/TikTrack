# Architect Directive — Gate Architecture Addendum
## ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0

**from:** Team 00 (Chief Architect — Nimrod)
**date:** 2026-03-17
**status:** LOCKED
**supplements:** `ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_v1.0.0.md`
**trigger:** Architectural input received from IDE environment agent (id: Team 101) — substance valid, processed by Team 00 directly

---

## A. Procedural Note — Team 101

An agent identified as "Team 101 (IDE Architecture Authority)" submitted architectural observations via the chat interface. Team 101 does not appear in the canonical team roster (`ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md`).

**Ruling:**
- The **substance** of the input is architecturally sound and is addressed in full below.
- The **framing** ("Team 101 requests that Team 00...") is procedurally incorrect. Team 00 does not receive requests from teams — it receives input, evaluates it, and decides.
- **Action required:** If Team 101 is a persistent agent identity (e.g., a Cursor-based architecture reviewer), it must be registered in the team roster with a defined scope, engine, and reporting line. Until then, its output is treated as advisory input to Team 00, not as a mandate.

---

## B. Conceptual Clarifications (Locked)

### B.1 — Maker-Checker Principle: Formal Definition

**Decision: ADOPT — add to SSM as foundational governance rule.**

The Maker-Checker principle is already implicit in IR-VAL-01 (Cross-Engine Validation) but has never been stated as an organizational rule. Locking it now:

> **Maker-Checker Rule:** No team may serve as the Checker (validator) for an artifact it produced as the Maker (executor) in the same work package. A team is a Maker if it produced the artifact under review. A team is a Checker if it evaluates the artifact for correctness, compliance, or completeness.

**Enforcement in gate assignments:**

| Maker Role | Gate | Checker Role | Gate |
|------------|------|-------------|------|
| Team 170 (LLD400) | GATE_1 Phase 1 | Team 190 | GATE_1 Phase 2 |
| Team 10 (Work Plan) | G3_PLAN | Team 90 | G3_5 |
| Teams 20+30 / Team 61 (Implementation) | GATE_3_IMPL | Team 50/51 | GATE_4 |
| Teams 20+30 / Team 61 | GATE_3_IMPL | Team 90 | GATE_5 |
| All | All | Team 100 | GATE_6 |
| All | All | Nimrod | GATE_7 |

**Violation example (prohibited):** Team 170 validating its own LLD400 at GATE_1 Phase 2. Team 10 validating its own work plan at G3_5.

**Mandate to Team 170:** Add "§ Maker-Checker Rule" to `PHOENIX_MASTER_SSM_v1.0.0.md` under Governance Principles, using the exact text above. This is a constitutional addition — no creative interpretation.

---

### B.2 — GATE_2 Type: Canonical Ruling (corrected 2026-03-17)

**Ruling: GATE_2 is ARCHITECTURAL for ALL domains. It is never a human gate.**

GATE_7 is the only human gate in the pipeline. Nimrod's personal approval occurs at GATE_7 only.

**Canonical GATE_2 definition (both domains):**

| Domain | GATE_2 | Owner |
|--------|--------|-------|
| **agents_os** | 🔍 AI VALIDATION — LLD400 vs LOD200 intent check | Team 100 |
| **tiktrack** | 🔍 ARCHITECTURAL VALIDATION — LLD400 vs LOD200 intent check | Team 00 (as architect, not as human approver) |

**WAITING_GATE2_APPROVAL — drift in pipeline.py:**

The current code has:
```python
"WAITING_GATE2_APPROVAL": {"owner": "team_00", "engine": "human", ...}
```

This is **incorrect**. `engine: "human"` for WAITING_GATE2_APPROVAL is drift. Decision:

- If WAITING_GATE2_APPROVAL is retained as a pipeline state, its engine must be changed to reflect architectural review, not human input.
- Alternatively, WAITING_GATE2_APPROVAL is eliminated entirely — GATE_2 PASS routes directly to G3_PLAN.
- **Mandate to Team 61 (pipeline.py):** Add to §C code mandates — fix or remove WAITING_GATE2_APPROVAL; `engine: "human"` is not permitted for any gate except GATE_7.

**What the original v1.0.0 directive stated:** `🔍 VALIDATION (ARCHITECTURAL, not human)` — this was correct. The addendum initially introduced an incorrect tiktrack exception ("Nimrod reviews directly = HUMAN"). That exception is **revoked**. The v1.0.0 canonical definition stands without modification.

**The only human gate is GATE_7.** No other gate has a human engine.

---

### B.3 — Team 10 Role: Formal Demotion to Work Plan Generator

**Decision: ADOPT — pipeline.py has drift, runbooks have drift, both must be corrected.**

**Current drift confirmed in code (`pipeline.py`):**

```python
# line 6:   "The Orchestrator IS Team 10..."
# line 1250: "Cursor (Team 10 — Execution Orchestrator)"
# line 1040: "WSM `active_work_package_id` is NOT updated until GATE_3 intake (Team 10 responsibility)"
```

**Canonical role going forward:**

| Role | Team |
|------|------|
| **Pipeline orchestrator** | `agents_os_v2/orchestrator/pipeline.py` (the Python system) |
| **Work Plan Generator** | Team 10 (produces G3_PLAN only) |
| **WSM management** | Pipeline system only — Team 10 does NOT modify WSM directly |

**Mandate to Team 170:**
Update `PHOENIX_MASTER_SSM_v1.0.0.md` and any Team 10 runbook/gateway document:
1. Replace all instances of "Team 10 — Execution Orchestrator" with "Team 10 — Work Plan Generator"
2. Remove any instruction to Team 10 to update WSM directly
3. Add: "WSM state is managed exclusively by the pipeline system. Team-facing operations that require WSM changes must be routed through `./pipeline_run.sh` commands."

**Mandate to Team 61 (pipeline.py):** Separately in §C.

---

## C. Code Mandates (additions to WP003 Direct Implementation Mandate)

The following code changes are **appended** to `TEAM_00_TO_TEAM_61_WP003_DIRECT_IMPLEMENTATION_MANDATE_v1.0.0.md` as additional tasks. They are **same priority as P0** — they must ship in the same delivery.

---

### C.1 — Remove G5_DOC_FIX from pipeline.py

**Rationale:** G5_DOC_FIX is an anti-pattern. GATE_5 admin failures route directly to the implementation team without a separate gate state.

**Changes required in `agents_os_v2/orchestrator/pipeline.py`:**

1. Remove `"G5_DOC_FIX"` from `GATE_SEQUENCE` (line 38 area)
2. Remove `"G5_DOC_FIX"` from `GATE_CONFIG` dict (line 55 area)
3. Remove `"G5_DOC_FIX"` from `FAIL_ROUTING` (lines 114–119)
4. Delete the `_generate_g5_doc_fix_prompt()` function entirely
5. Update GATE_5 `doc` routing entry:
   ```python
   "GATE_5": {
       # doc route: targeted fix — return directly to implementation with instructions
       # No separate G5_DOC_FIX state. Team 10/61 fixes docs, then re-presents to GATE_5.
       "doc":  ("CURSOR_IMPLEMENTATION", "Doc/artifact gap — implementation team fixes directly → GATE_5 re-validation"),
       "full": ("G3_PLAN",               "Code/design issues — full re-plan → mandates → impl → QA → GATE_5"),
   },
   ```

**Changes required in `pipeline_run.sh`:**
- Remove any `G5_DOC_FIX` case handling
- Update any prompt-showing logic that references G5_DOC_FIX

**Changes required in `agents_os/ui/js/pipeline-config.js`:**
- Remove `G5_DOC_FIX` from `ALL_GATE_DEFS`
- Remove `G5_DOC_FIX` from any sequence arrays

---

### C.2 — Team 10 "Orchestrator" Drift in pipeline.py

**Changes required:**

| File | Line area | Current | Replace with |
|------|-----------|---------|-------------|
| `pipeline.py` | Line 6 | "The Orchestrator IS Team 10" | "Team 10 is the Work Plan Generator. The Python pipeline is the sole orchestrator." |
| `pipeline.py` | Line 1250 | "Team 10 — Execution Orchestrator" | "Team 10 — Work Plan Generator" |
| `pipeline.py` | Line 1267 | Same | Same |
| `pipeline.py` | Lines 1040–1042 | WSM update = Team 10 responsibility | "WSM updates are managed by the pipeline system. Team 10 does not modify WSM directly." |

---

### C.3 — PASS_WITH_ACTION: Surface in Dashboard UI

**Current state:** `pass_with_actions` is fully implemented in `pipeline.py` and `pipeline_run.sh`. It is NOT shown as an option in the dashboard.

**Required change in `agents_os/ui/js/pipeline-dashboard.js`:**

Add a third button/option to ALL validation gate PASS/FAIL sections:

```
✅ PASS      ⚠️ PASS_WITH_ACTION      ❌ FAIL
```

`⚠️ PASS_WITH_ACTION` button:
- Shows a textarea for the operator to list the actions (pipe-separated)
- Generates: `./pipeline_run.sh --domain [domain] pass_with_actions "ACTION-1|ACTION-2"`
- `data-testid="pass-with-action-btn"` on the button
- Only shown for VALIDATION gates (Team 90, 190, 50, 51 owned gates)
- NOT shown for EXECUTION gates or HUMAN gates

Add `data-testid="pending-actions-panel"` to display any currently pending actions from pipeline state.

---

### C.4 — Canonical Gate Name: Lock Decision

**Decision:** `CURSOR_IMPLEMENTATION` remains the canonical code name **until S003 activation.** Renaming is a cross-system change (pipeline.py, pipeline_run.sh, pipeline-config.js, all prompts) that requires its own WP.

**What gets updated in this WP (documentation only):**
- In `pipeline.py` GATE_CONFIG comment: add `# canonical display name: GATE_3_IMPL (pending rename WP)`
- In `ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_v1.0.0.md` open items: set status "⏳ rename WP = S003-P00X"

**No code rename in WP003.**

---

## D. Mandate Summary

| Target | Mandate | Priority |
|--------|---------|---------|
| **Team 170** | Add Maker-Checker Rule to SSM | High |
| **Team 170** | Update Team 10 role in SSM and runbooks | High |
| **Team 170** | Register Team 101 in team roster | High |
| **Team 61** | C.1: Remove G5_DOC_FIX from pipeline.py + pipeline_run.sh + pipeline-config.js | P0 (WP004) |
| **Team 61** | C.2: Fix Team 10 "Orchestrator" label in pipeline.py | P0 (WP004) |
| **Team 61** | C.3: Add PASS_WITH_ACTION button to dashboard | P1 (WP004) |
| **Team 61** | C.4: Add rename-pending comment to GATE_CONFIG | P1 doc (WP004) |
| **Team 61** | C.5: Fix WAITING_GATE2_APPROVAL engine drift — `engine: "human"` → architectural or eliminate | P1 (WP004) |
| **Team 00** | Update Team 101 roster status | ✅ Mandated — Team 170 |

---

## E. Open Items Updated

Appending to `ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_v1.0.0.md` open items:

| Item | Resolution |
|------|-----------|
| G3_6_MANDATES redundancy | Still open — not addressed in this addendum |
| GATE_3_IMPL canonical name | Code rename = separate WP in S003 |
| G5_DOC_FIX removal | ✅ Mandated — Team 61 WP003 delivery |
| GATE_4 routing protocol | Still open |
| GATE_2 admin shortcut in code | Still open |
| PASS_WITH_ACTION dashboard | ✅ Mandated — Team 61 WP003 delivery |
| WSM drift in Team 10 | ✅ Mandated — Team 170 |
| **Maker-Checker in SSM** | ✅ Mandated — Team 170 |
| **Team 101 roster registration** | ✅ Mandated — Team 170 Task 3 |
| **GATE_2 human exception (tiktrack)** | ✅ REVOKED — B.2 corrected; GATE_2 always architectural |
| **WAITING_GATE2_APPROVAL engine drift** | ✅ Mandated — Team 61 WP004 C.5 |
| **§C tasks (WP003 delivery scope)** | ✅ Rescoped → WP004 (separate from WP003 GATE_6 closure) |

---

**log_entry | TEAM_00 | GATE_ARCHITECTURE_ADDENDUM | LOCKED | 2026-03-17**
**log_entry | TEAM_00 | TEAM_101_INPUT_PROCESSED | SUBSTANCE_ADOPTED | 2026-03-17**
**log_entry | TEAM_00 | GATE_2_ALWAYS_ARCHITECTURAL | HUMAN_EXCEPTION_REVOKED | 2026-03-17**
**log_entry | TEAM_00 | MAKER_CHECKER_LOCKED | SSM_MANDATE_ISSUED | 2026-03-17**
**log_entry | TEAM_00 | G5_DOC_FIX_ABOLISHED | TEAM_61_WP004_MANDATE | 2026-03-17**
**log_entry | TEAM_00 | SECTION_C_TASKS_RESCOPED | WP003_CLOSED_WP004_OPENED | 2026-03-17**
