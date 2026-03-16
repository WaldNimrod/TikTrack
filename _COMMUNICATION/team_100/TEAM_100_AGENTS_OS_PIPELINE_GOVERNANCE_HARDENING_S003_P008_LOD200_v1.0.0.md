---
document_id: TEAM_100_AGENTS_OS_PIPELINE_GOVERNANCE_HARDENING_S003_P008_LOD200_v1.0.0
from: Team 100 (Program Manager)
to: Team 00 (Chief Architect)
cc: Team 170 (Registry & Documentation), Team 190 (Constitutional Validator), Team 61 (Pipeline UI Specialist)
date: 2026-03-16
status: SUBMITTED_FOR_GATE_0
stage_id: S003
program_id: S003-P008
work_package_id: S003-P008-WP001
domain: AGENTS_OS
spec_brief: AOS Pipeline Governance Hardening
authority_source: CLAUDE.md (Team 100 architectural responsibility)
in_response_to: S002-P005-WP003 dogfooding findings (BF-01, BF-02) + Session analysis 2026-03-16
---

# LOD200 — S003-P008: AOS Pipeline Governance Hardening

## 1. Purpose and Motivation

During S002-P005-WP003 dogfooding (March 2026), Team 190 issued a GATE_0 BLOCK_FOR_FIX with
two blocking findings:

- **BF-01:** Submitted `Current State` block in the prompt claimed WSM was already tracking
  WP003 as active — incorrect. WSM still showed `NO_ACTIVE_WORK_PACKAGE`.
- **BF-02:** Program Registry notes prematurely mirrored WP003 as "activated on 2026-03-16",
  creating a portfolio sync conflict against WSM runtime SSOT.

Both errors are systemic: the pipeline had no machine-enforcement mechanism to prevent Team 100
from submitting a GATE_0 prompt whose state claims were inconsistent with canonical registries.

**Session response (immediate — implemented 2026-03-16):**
- A1: Prompt staleness guard in `pipeline_run.sh` (auto-regenerate if state file is newer)
- A2: Registry premature activation advisory in `_check_governance_precheck()` (detects "activated"
  language in Program Registry notes before GATE_0 PASS)

**S003-P008 mission:** Harden these fixes, fill the remaining gaps (IDEA-038, 039, 040, 042),
and ensure the AOS pipeline runs a smooth, self-consistent gate process in both domains with
no class of BF-01/BF-02 errors recurring.

This program directly enables the **S003 completion milestone**: a stable AOS system running
a complete, smooth, continuous gate process through the dashboard in both domains.

---

## 2. Identity Header

| Field | Value |
|---|---|
| stage_id | S003 |
| program_id | S003-P008 |
| work_package_id | S003-P008-WP001 |
| domain | AGENTS_OS |
| spec_brief | AOS Pipeline Governance Hardening |
| gate_entry | GATE_0 (full pipeline, not FAST path) |
| sequencing | Activate before or in parallel with S003-P007 (Command Bridge Lite); pipeline stability is prerequisite for UX improvements |

---

## 3. Scope — WP001

WP001 covers all items in a single implementation pass. No WP002 planned at this time.

### 3.1 STATE_VIEW.json — Expected Registry State File

**Problem:** Team 100 manually authored the "Current State" block in GATE_0 prompts.
This manual step is error-prone and produced BF-01.

**Solution:** `pipeline.py` generates a `STATE_VIEW.json` file at GATE_0 time in
`_COMMUNICATION/agents_os/STATE_VIEW.json`. This file captures:

```json
{
  "generated_at": "<ISO timestamp>",
  "gate": "GATE_0",
  "work_package_id": "S003-P008-WP001",
  "project_domain": "agents_os",
  "expected_state": {
    "wsm": {
      "active_work_package_id": "N/A",
      "note": "WSM is NOT updated until GATE_3 intake (Team 10 mandate)"
    },
    "wp_registry": {
      "wp_entry_exists": false,
      "note": "WP Registry row is added AFTER GATE_0 PASS (Team 170 mandate)"
    },
    "program_registry": {
      "program_status": "ACTIVE",
      "notes_guidance": "Must say 'pending GATE_0 validation' — NOT 'activated'"
    }
  },
  "gate_ordering_rules": [
    "GATE_0 PASS → Team 170 inserts WP Registry row",
    "GATE_3 intake → Team 10 updates WSM active_work_package_id",
    "Program Registry notes at GATE_0 → 'pending GATE_0 validation'"
  ]
}
```

**Usage:** The GATE_0 prompt includes this file's content in the `## Pipeline State` block,
replacing the manually-authored Current State section. Team 190 uses it as the reference
for expected state at submission time.

**File location:** `_COMMUNICATION/agents_os/STATE_VIEW.json` (domain-scoped, overwritten on
each GATE_0 prompt generation).

**Implementation:** `_generate_gate_0_prompt()` calls a new `_generate_state_view(state)`
function that writes STATE_VIEW.json and returns its content for embedding in the prompt.

### 3.2 LOD200 Ordering Table Schema (IDEA-040 + IDEA-042)

**Problem:** The pre-activation ordering rules (WP Registry after GATE_0 PASS; WSM at GATE_3)
are documented in governance docs but not machine-readable. Team 100 has to remember them manually.

**Solution:** Add a YAML front-matter section to LOD200 documents:

```yaml
pre_gate_0_state:
  wsm_active_wp: "N/A"           # What WSM should show at GATE_0 submission
  wp_registry_entry: "absent"    # Expected: absent (inserted after GATE_0 PASS)
  program_registry_notes: "pending GATE_0 validation"  # Required phrase in notes
```

**Pipeline enforcement:** `_check_governance_precheck()` reads the LOD200 file at
`state.spec_path`, parses the `pre_gate_0_state` block, and validates actual registry state
against the declared expected state. Mismatches emit advisory warnings with specific field names.

**Scope:**
- Schema definition (Iron Rule — Team 100 must include in all future LOD200 files)
- `_parse_lod200_state_block(spec_path)` helper in pipeline.py
- Advisory checks added to `_check_governance_precheck()`
- Backfill: add `pre_gate_0_state` to WP003 LOD200 as reference implementation

### 3.3 Gate Prompt Lifecycle — Archive on Advance (IDEA-038)

**Problem:** Gate prompt files (e.g., `agentsos_GATE_0_prompt.md`) are never cleaned up.
After gate advance, the stale file remains and can be accidentally used.

**Solution:** On every gate PASS/FAIL advance in `pipeline.py`, move the outgoing gate's
prompt file to `_COMMUNICATION/agents_os/prompts/archive/{pipe_run_id}_{gate}_{timestamp}.md`.

**Logic:**
```python
def _archive_gate_prompt(gate_id: str, state: PipelineState) -> None:
    """Move outgoing gate prompt to archive on gate transition."""
    domain_slug = state.project_domain.lower().replace("_", "").replace("-", "")
    prompt_file = PROMPTS_DIR / f"{domain_slug}_{gate_id}_prompt.md"
    if prompt_file.exists():
        archive_dir = PROMPTS_DIR / "archive"
        archive_dir.mkdir(exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        dest = archive_dir / f"{state.pipe_run_id}_{gate_id}_{ts}.md"
        prompt_file.rename(dest)
```

Called from `advance_gate()` before the new gate prompt is generated.

**Acceptance criteria:**
- After `./pipeline_run.sh pass`, the current gate's prompt file moves to archive/
- Next gate's prompt file is generated fresh at the new location
- Archive directory capped at 20 entries (oldest deleted on overflow)

### 3.4 test_cursor_prompt Accumulation Cap (IDEA-039)

**Problem:** Each `pipeline_run.sh` invocation writes `test_cursor_prompt_{timestamp}.md`.
20+ files have already accumulated with no cap or cleanup.

**Solution:** Cap at last N=5 test_cursor_prompt files. On write, if more than 5 exist,
delete the oldest (sorted by mtime). Implementation in `pipeline_run.sh` or in the Python
`_save_prompt()` function.

**Logic (Python):**
```python
def _rotate_test_prompts(prompts_dir: Path, prefix: str = "test_cursor_prompt_", keep: int = 5):
    existing = sorted(prompts_dir.glob(f"{prefix}*.md"), key=lambda p: p.stat().st_mtime)
    for old in existing[:-keep]:
        old.unlink(missing_ok=True)
```

Called after writing a new test_cursor_prompt file.

---

## 4. Non-Scope (explicitly excluded)

| Item | Reason for exclusion |
|---|---|
| S003-P007 Command Bridge Lite | Separate program; different scope (UX/operator flow) |
| Ideas Pipeline Phase 2 UI (IDEA-007) | Separate WP (S002-P005-WP004 candidate); depends on P008 stability |
| Cross-Team Skills Set (IDEA-037) | Cross-domain program; separate LOD200 needed |
| WSM write automation | Out of scope; WSM is written by Team 10 at GATE_3 |
| Full CI/CD lint pipeline | Beyond S003 scope; deferred to S004+ |

---

## 5. Pre-Gate 0 State Declaration

```yaml
pre_gate_0_state:
  wsm_active_wp: "N/A"
  wp_registry_entry: "absent"
  program_registry_notes: "pending GATE_0 validation"
```

*This section is the reference implementation of the IDEA-042 schema.*

---

## 6. Acceptance Criteria (WP001)

| AC | Description |
|---|---|
| AC-01 | `STATE_VIEW.json` is generated by `_generate_gate_0_prompt()` and embedded in the GATE_0 prompt |
| AC-02 | `STATE_VIEW.json` correctly describes expected WSM / WP Registry / Program Registry state at GATE_0 |
| AC-03 | `_check_governance_precheck()` reads LOD200 `pre_gate_0_state` block when `spec_path` is set and emits advisory if declared state diverges from actual state |
| AC-04 | Gate prompt archive: on `./pipeline_run.sh pass`, outgoing prompt file moves to `prompts/archive/` |
| AC-05 | Archive capped at 20 entries; oldest deleted on overflow |
| AC-06 | test_cursor_prompt files capped at last N=5; rotation on write |
| AC-07 | All 4 changes have pytest test coverage (≥2 tests each) |
| AC-08 | `./pipeline_run.sh pass` + `./pipeline_run.sh fail` still work correctly end-to-end |
| AC-09 | IDEA-038, IDEA-039, IDEA-040, IDEA-042 status updated to `in_execution` after GATE_0 PASS |

---

## 7. Sequencing and Dependencies

```
S002-P005-WP003 (current, GATE_0 in correction cycle)
  → GATE_0 PASS → Team 170 registers WP003 in WP Registry
  → WP003 proceeds through pipeline → GATE_8 → S002-P005 closes

S003-P008-WP001 (this program)
  → GATE_0: immediately after WP003 GATE_0 PASS
  → No dependency on S003-P007 (Command Bridge Lite)
  → Can run in parallel with S003-P003 (TikTrack System Settings)
  → Prerequisite for S003-P007: stable pipeline is better UX surface
```

**Activation trigger:** WP003 GATE_0 PASS

---

## 8. Team Assignments

| Team | Role |
|---|---|
| Team 100 | Program Manager; GATE_2/GATE_6 approver (delegated) |
| Team 10 | Implementation (pipeline.py, pipeline_run.sh changes) |
| Team 61 | Dashboard UI (archive visibility in PIPELINE_DASHBOARD.html, if needed) |
| Team 170 | Registry updates (WP Registry row after GATE_0 PASS) |
| Team 190 | GATE_0 constitutional validation; GATE_5 quality gate |
| Team 90 | GATE_7 quality assurance |

---

## 9. S003 Milestone Success Criteria

This program is one of the inputs to the S003 completion milestone. The milestone is defined as:

> **S003 Completion Milestone:** The AOS system runs a complete, smooth, continuous gate process
> through the dashboard in both domains (AGENTS_OS + TikTrack), with no systemic BF-class
> governance failures during Team 190 validation.

**S003 milestone pass conditions:**

| # | Criterion | Program |
|---|---|---|
| MC-01 | Both domain pipelines (agents_os + tiktrack) have successfully completed at least one full GATE_0→GATE_8 cycle | S003-P008 / S003-P003 |
| MC-02 | Dashboard displays correct gate status for both domains simultaneously | S003-P007 / S003-P008 |
| MC-03 | No GATE_0 BLOCK_FOR_FIX due to state claim errors (BF-01/BF-02 class) in any completed WP | S003-P008 |
| MC-04 | Prompt staleness guard (A1) + registry advisory (A2) in production and passing all tests | S003-P008 |
| MC-05 | Gate prompt archive running; no stale prompt files accumulating | S003-P008 |
| MC-06 | Data Model Validator (S003-P001) and Test Template Generator (S003-P002) actively used in at least one S003 WP gate | S003-P001/P002 |
| MC-07 | S003-P007 Command Bridge Lite: approve-path desync resolved; operator can advance gates from dashboard | S003-P007 |
| MC-08 | AOS ideas pipeline: all IDEA-038/039/040/042 items at status `decided` | S003-P008 |

**Timeline target:** S003 milestone complete before S004 activation.
**Accountability:** Team 100 holds architectural responsibility for S003 delivery.

---

## 10. Document Map

| Document | Status |
|---|---|
| This LOD200 | SUBMITTED — awaiting GATE_0 |
| LLD400 | Not yet authored (Team 00 pre-gate work, per standard practice) |
| Team 170 WP Registry mandate | To be issued after GATE_0 PASS |
| Team 10 activation prompt | To be issued after GATE_2 PASS |

---

**log_entry | TEAM_100 | S003_P008_LOD200_SUBMITTED | GATE_0_PENDING | 2026-03-16**
