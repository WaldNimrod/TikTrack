---
**project_domain:** AGENTS_OS
**id:** S002_P002_PIPELINE_ORCHESTRATOR_LOD200_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 170 (LLD400), Team 190 (GATE_0), Team 00 (awareness + GATE_2 context)
**date:** 2026-02-27
**status:** LOD200 — READY FOR GATE_0 PACKAGING (activates when S001-P002 enters GATE_3)
**purpose:** Full LOD200 architectural specification for S002-P002 — Full Pipeline Orchestrator. Closes the automation loop in Agents_OS: automated gate triggering, submission detection, and WSM update proposal flow.
**authority:** TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS_v1.0.0.md (Decisions B-1, B-2, B-3)
**architectural_approval_type:** SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | N/A (LOD200 — WPs defined here) |
| task_id | N/A |
| gate_id | N/A (pre-GATE_0) |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# S002-P002 — FULL PIPELINE ORCHESTRATOR: LOD200 v1.0.0
## Closing the Automation Loop

---

## 1. Strategic Context

S002-P001 built the two core validators:
- **WP001 — Spec Validator**: 44 deterministic checks + LLM quality gate (GATE_8 PASS 2026-02-26)
- **WP002 — Execution Validator**: 11 deterministic checks + LLM quality gate (GATE_8 PASS 2026-02-26)

Both validators are **invocation-ready** but **not yet auto-triggered**. Teams must manually run the validators at the correct gate. This creates coordination overhead — the exact cost we are eliminating.

**S002-P002 closes this gap.** When this program completes:
- A submission landing in `_COMMUNICATION/_ARCHITECT_INBOX/` automatically triggers the correct validator within 5 minutes
- A GATE_0 submission triggers the spec validator without Team 190 manually invoking it
- A GATE_5 submission triggers the execution validator without Team 90 manually running it
- Results are formatted as structured gate response artifacts, ready for human review
- PASS results include a WSM update proposal for gate owner confirmation

**Net effect:** The time between submission and validation response drops from hours (scheduling + manual invocation) to minutes (automatic). Human effort shifts from operations to review.

---

## 2. Problem Statement — Why Manual Invocation Is the Wrong Architecture

Current state after S002-P001:

```
Team 170 submits LOD200 to _ARCHITECT_INBOX/
    → Team 190 receives (manual notification, email or chat)
    → Team 190 runs: python3 -m agents_os.orchestrator.validation_runner --mode=spec
    → Team 190 reads output
    → Team 190 formats response artifact
    → Team 190 sends to Team 10 / Team 00
```

Every manual step is a token expense and a latency source. The validator does the analysis. Humans do the logistics. S002-P002 automates the logistics.

**Token cost of manual coordination (per gate, current):** ~400 tokens in coordination messages
**Token cost after S002-P002:** ~50 tokens (human confirms system-generated result)
**Per-program saving (9 gates):** ~3,150 tokens saved in coordination overhead alone

---

## 3. Activation Condition

| Condition | Required | Status |
|---|---|---|
| S002-P001-WP001 GATE_8 PASS | ✅ | Met 2026-02-26 |
| S002-P001-WP002 GATE_8 PASS | ✅ | Met 2026-02-26 |
| Team 00 Decisions B-1, B-2, B-3 | ✅ | LOCKED |
| S001-P002 enters GATE_3 | ⏳ | Pending — trigger for S002-P002 LOD200 submission |

**Activation sequencing (per Team 00 Decision B-3):** S002-P002 runs in parallel with TikTrack S003. S002-P002 LOD200 packaging begins when S001-P002 passes GATE_2 and enters GATE_3 execution phase.

---

## 4. Program Scope

### 4.1 In Scope

| Capability | What it does |
|---|---|
| Submission listener | Monitors `_COMMUNICATION/_ARCHITECT_INBOX/` for new submission folders (polling, 5-minute interval) |
| GATE_0 auto-trigger | On LOD200 submission detection → invokes `validation_runner --mode=spec` → produces structured GATE_0 response artifact |
| GATE_1 auto-trigger | On LLD400 submission detection → invokes `validation_runner --mode=spec` → produces structured GATE_1 response artifact |
| GATE_4 pre-QA auto-trigger | On GATE_3 exit evidence detection → invokes pre-QA check suite → produces Team 50 input artifact |
| GATE_5 auto-trigger | On GATE_5 submission detection → invokes `validation_runner --mode=execution --phase=2` → produces structured GATE_5 response artifact |
| GATE_8 doc scan | On GATE_7 PASS signal detection → invokes documentation closure scan → produces GATE_8 checklist artifact |
| WSM update proposal | On PASS result → generates structured WSM CURRENT_OPERATIONAL_STATE update proposal for gate owner to review and apply |
| Audit log | Every trigger event, invocation, result, and proposal logged to `agents_os/orchestrator/audit.log` |

### 4.2 Out of Scope

| Item | Reason |
|---|---|
| GATE_2 automation | Architectural spec approval requires Team 100 human judgment — non-automatable by design |
| GATE_3 automation | Work package intake requires Team 10 planning judgment — non-automatable |
| GATE_6 automation | Architectural dev validation: "is what was built what we approved?" — requires Team 100 review of diff vs. spec |
| GATE_7 automation | Nimrod personal UX approval — permanently non-automatable per ADR-027 |
| Auto-remediation | Out of scope — system identifies failures, humans fix |
| Auto-WSM-apply | Gate owner confirms and applies all WSM updates — system only proposes (Decision B-2) |
| Multi-project support | Single-project (Phoenix) in this program; generalization is Post-S006 |

---

## 5. Architecture

### 5.1 Folder Structure (New Files)

```
agents_os/
├── orchestrator/
│   ├── validation_runner.py          ← EXISTS (WP001+WP002) — no change
│   └── pipeline_orchestrator.py      ← NEW (WP001 of this program)
├── triggers/                          ← NEW (WP001 of this program)
│   ├── __init__.py
│   ├── gate_listener.py               ← Polls _ARCHITECT_INBOX; detects new submissions
│   ├── submission_classifier.py       ← Classifies submission: which gate, which domain
│   ├── gate0_trigger.py               ← GATE_0: spec validator invocation + response formatting
│   ├── gate1_trigger.py               ← GATE_1: spec validator on LLD400
│   ├── gate4_trigger.py               ← GATE_4: pre-QA check invocation
│   ├── gate5_trigger.py               ← GATE_5: execution validator phase 2
│   └── gate8_trigger.py               ← GATE_8: documentation closure scan
├── wsm_proposals/                     ← NEW (WP002 of this program)
│   ├── __init__.py
│   ├── proposal_generator.py          ← Generates structured WSM update proposal
│   └── proposal_schema.py             ← Schema for WSM CURRENT_OPERATIONAL_STATE block
└── tests/
    └── orchestrator/                  ← NEW (this program)
        ├── __init__.py
        ├── test_gate_listener.py
        ├── test_submission_classifier.py
        ├── test_trigger_gate0.py
        ├── test_trigger_gate5.py
        └── test_wsm_proposal_generator.py
```

**Zero new files outside `agents_os/`. No TikTrack changes. Domain isolation mandatory.**

### 5.2 Work Package Structure

S002-P002 has **two work packages**, separating trigger infrastructure from WSM proposal logic:

```
S002-P002
├── WP001 — Submission Listener + Gate Triggers      ← GATE_0 → GATE_8
│   Scope: gate_listener.py, submission_classifier.py, gate0/1/4/5/8_trigger.py
│   pipeline_orchestrator.py (main entry point)
│   Test suite: test_gate_listener.py, test_trigger_gate0.py, test_trigger_gate5.py
│
└── WP002 — WSM Proposal Generator                  ← activates after WP001 GATE_4 PASS
    Scope: wsm_proposals/proposal_generator.py, proposal_schema.py
    Test suite: test_wsm_proposal_generator.py
    Integration: connects proposal output to trigger outputs
```

**Rationale for split:** WP001 is the core automation value. WP002 adds the WSM proposal layer. Splitting allows WP001 to be validated and in use while WP002 is built — progressively delivering value.

### 5.3 Submission Classifier Logic

The classifier reads the submission folder structure and determines:
- **Gate**: inferred from folder naming convention (`GATE_0`, `GATE_1`, `G3.5`, `GATE_5`, `GATE_8`)
- **Domain**: inferred from `COVER_NOTE.md` → `project_domain` field (AGENTS_OS or TIKTRACK)
- **Mode**: `spec` for GATE_0/1; `execution --phase=1` for G3.5; `execution --phase=2` for GATE_5

This makes the trigger system **submission-folder-structure-driven** — no hardcoded routing rules beyond the folder naming convention already established.

### 5.4 Gate Listener Design (Decision B-1: Polling)

```python
# Pseudocode — not implementation
class GateListener:
    poll_interval_seconds = 300  # 5 minutes (Decision B-1 locked)
    inbox_path = "_COMMUNICATION/_ARCHITECT_INBOX/"

    def run(self):
        while True:
            new_submissions = self._scan_for_new_submissions()
            for submission in new_submissions:
                gate, domain, mode = self.classifier.classify(submission)
                trigger = self.trigger_registry[gate]
                trigger.invoke(submission, mode)
            time.sleep(self.poll_interval_seconds)
```

**Persistence:** The listener maintains a state file (`agents_os/orchestrator/listener_state.json`) recording which submission folders have been processed. This prevents re-processing on restart.

### 5.5 WSM Proposal Schema (Decision B-2: Gate owner confirms)

Every PASS result includes a proposal block:

```yaml
# wsm_proposal_schema
wsm_update_proposal:
  field: CURRENT_OPERATIONAL_STATE
  proposed_changes:
    - field: current_gate
      old_value: GATE_0
      new_value: GATE_1
    - field: last_gate_event
      value: "GATE_0_PASS | {date} | Team 190 | {submission_id}"
    - field: active_flow
      value: "GATE_1_PENDING ({program_id}); LLD400 authoring next"
  confirmation_required_by: {gate_owner_team}
  confirmation_instruction: "Review and apply to WSM CURRENT_OPERATIONAL_STATE block"
```

The proposal is a formatted markdown artifact embedded in the validator output. Gate owner reviews, edits if needed, and applies to WSM. Human confirms — system does not write directly to WSM (Decision B-2 locked).

---

## 6. Gate Automation Map — Post S002-P002

| Gate | Before S002-P002 | After S002-P002 |
|---|---|---|
| GATE_0 | Team 190 manually runs spec validator | **Auto-triggered** within 5 minutes of submission; Team 190 reviews structured report |
| GATE_1 | Team 190 manually runs spec validator on LLD400 | **Auto-triggered** within 5 minutes; Team 190 reviews |
| GATE_2 | Team 100/00 manual review | **Unchanged** — human judgment required (architectural approval) |
| G3.5 | Team 90 manually runs execution validator phase 1 | **Auto-triggered** on work plan submission |
| GATE_4 | Team 50 manual QA | Pre-QA **auto-triggered**; Team 50 reviews structured input |
| GATE_5 | Team 90 manually runs execution validator phase 2 | **Auto-triggered** within 5 minutes; Team 90 reviews |
| GATE_6 | Team 100 manual diff review | **Unchanged** — human judgment required ("is what was built what we approved?") |
| GATE_7 | Nimrod manual UX review | **Unchanged** — Nimrod personal sign-off always |
| GATE_8 | Team 90/70 manual documentation check | Doc closure scan **auto-triggered**; Team 70 reviews checklist |

---

## 7. Token Efficiency Design

| Invocation Pattern | Cost Without Orchestrator | Cost With Orchestrator |
|---|---|---|
| GATE_0 validation | ~200 tokens (coordination + manual invocation) | ~20 tokens (system runs; human reviews 2-line confirmation) |
| GATE_5 validation | ~200 tokens | ~20 tokens |
| WSM update per gate | ~150 tokens (manual drafting) | ~30 tokens (human reviews and confirms proposal) |
| **Per program (9 gates)** | **~3,150 tokens coordination** | **~450 tokens confirmation** |
| **Saving per program** | — | **~2,700 tokens (~86%)** |

**The orchestrator pays for itself in 1 program run.**

---

## 8. Exit Criteria

| Milestone | Criteria |
|---|---|
| WP001 G3.5 PASS | Gate listener detects test submission; submission_classifier routes correctly |
| WP001 GATE_4 PASS | GATE_0 and GATE_5 auto-triggers produce correct structured output; Team 50 QA 100% green |
| WP001 GATE_5 PASS | System correctly processes real S001-P002 submission (integration test on live POC); exit_code=0 |
| WP001 GATE_6 PASS | Team 100 confirms: trigger output matches expected format; no false positives; no missed submissions |
| WP001 GATE_7 PASS | Nimrod confirms: system response quality acceptable; no user experience regression |
| WP002 GATE_4 PASS | WSM proposal generator produces correct diff for test scenarios; all proposal fields populated |
| WP002 GATE_8 PASS | Full integration: trigger → validation → structured output → WSM proposal all connected |
| **S002-P002 COMPLETE** | WP001 + WP002 GATE_8 PASS; pipeline automation operational |

**Program success definition:** At least one real TikTrack submission (from S002-P003 or S001-P002) processed automatically through the orchestrator with zero manual invocation required.

---

## 9. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Gate listener misses submissions — race condition on rapid consecutive submissions | MEDIUM | State file tracks processed submissions by folder creation timestamp + folder name hash; re-scan on startup to catch missed submissions |
| Submission classifier produces wrong gate routing — e.g., GATE_5 classified as GATE_0 | HIGH | Explicit folder naming validation in classifier; if ambiguous → LOG and SKIP, notify Team 10; never auto-classify ambiguous submissions |
| WSM proposal contains stale field values — proposal generated from outdated WSM snapshot | MEDIUM | Proposal generator reads WSM at proposal time, not at trigger time; timestamp lock on proposal artifact |
| S001-P002 integration test fails — orchestrator breaks under real submission conditions | MEDIUM | S001-P002 entering GATE_3 is the real integration test; WP001 GATE_5 requires at least one live orchestrator run against S001-P002 evidence |
| Parallel S002-P002 + TikTrack S003 creates listener contention — multiple programs submitting simultaneously | LOW | Listener processes submissions sequentially (queue-based); no parallel invocation; 5-minute poll interval provides natural separation |
| Long-running LLM gate blocks listener loop | LOW | LLM invocations run in subprocess with 5-minute timeout; listener continues polling; timed-out LLM = HOLD result |

---

## 10. Dependencies

| Dependency | From | Status |
|---|---|---|
| `validation_runner.py` CLI (spec mode) | WP001 S002-P001 | ✅ COMPLETE |
| `validation_runner.py` CLI (execution mode) | WP002 S002-P001 | ✅ COMPLETE |
| `quality_judge.py` LLM gate | WP001 S002-P001 | ✅ COMPLETE |
| S001-P002 entering GATE_3 (activation trigger) | S001-P002 program | ⏳ PENDING |
| TikTrack S003 activation (parallel track) | Team 00 decision | LOCKED: parallel per Decision B-3 |

---

**log_entry | TEAM_100 | S002_P002_PIPELINE_ORCHESTRATOR_LOD200_v1.0.0_CREATED | READY_FOR_GATE0_WHEN_S001_P002_ENTERS_GATE3 | 2026-02-27**
