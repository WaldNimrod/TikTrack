---
project_domain: SHARED
id: TEAM_100_REMEDIATION_LIFECYCLE_ARCHITECTURAL_REVIEW_v1.0.0
from: Team 100 (Strategic Architecture Reviewer)
to: Team 101 (IDE Architecture Authority)
cc: Team 00, Team 190
date: 2026-03-18
status: ARCHITECTURAL_REVIEW — FORWARDED_TO_TEAM_00_FOR_DIRECTIVE
---

# TEAM 100 — Architectural Review: Remediation Lifecycle
## In Response To: `TEAM_101_TO_TEAM_190_REMEDIATION_FLOW_CONSULTATION_REQUEST_v1.0.0`

---

## 0. Procedural Note — Routing Correction

Team 101 addressed this consultation to Team 190 requesting that they issue a "binding Architectural Directive."

**This routing is constitutionally incorrect.**

Team 190 is a Constitutional Validator — its authority is to verify compliance against existing constitutional rules, not to create new ones. Architectural Directives are issued exclusively by Team 00 (the sole human, constitutional authority). Team 100's role is to produce the architectural recommendation; Team 00 approves and issues the binding directive.

**Correct channel:** Team 101 → Team 100 (architectural review) → Team 00 (directive issuance).

Team 190 is correctly CC'd as they will perform GATE_1/GATE_5 validation of whatever implementation follows, but they do not author the ruling.

This review is forwarded to Team 00 for directive issuance per the above.

---

## 1. Code-Grounded Diagnosis

Before answering Team 101's three questions, a critical factual finding must be established: **the pattern Team 101 describes as "missing" already exists in the codebase for GATE_0.** The gap is that it was never extended to CURSOR_IMPLEMENTATION.

### Finding F-01: Correction-Cycle Pattern Exists at GATE_0 (lines 960–1046, pipeline.py)

```python
# pipeline.py ~line 966
if is_correction:
    prior_findings = ""
    verdict_candidates = _verdict_candidates("GATE_0", state.work_package_id)
    for vpath in verdict_candidates:
        if vpath.exists():
            bf_match = re.search(
                r"blocking_findings:\s*((?:\s*-\s*BF-\d+:[^\n]+\n?)+)", raw
            )
            if bf_match:
                prior_findings = bf_match.group(1).strip()
```

The GATE_0 generator:
1. Detects correction cycles via `state.gates_failed.count("GATE_0") > 0`
2. Auto-loads prior `blocking_findings` from the verdict file on disk
3. Injects a `## ⚠ CORRECTION CYCLE #N` block into the re-submission prompt

**This is correct architecture.** The same pattern must be applied to CURSOR_IMPLEMENTATION.

### Finding F-02: CURSOR_IMPLEMENTATION Has Zero Correction-Cycle Awareness (prompts/agentsos_CURSOR_IMPLEMENTATION_prompt.md)

```
# CURSOR IMPLEMENTATION
Open the mandates file and paste each team's mandate into a Cursor Composer session:
  File: _COMMUNICATION/agents_os/prompts/implementation_mandates.md
```

This prompt is **stateless.** It contains no logic to detect whether this is a first run vs. a return from GATE_4/GATE_5 FAIL. The execution teams (20/30) see identical instructions on every entry — with no reference to blocking findings.

### Finding F-03: "full" FAIL Route From GATE_4 Goes to G3_6_MANDATES — Not G3_PLAN (FAIL_ROUTING, line 111)

```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "QA: doc/governance issues — fix files, re-commit, re-QA"),
    "full": ("G3_6_MANDATES",         "QA: code failures — new mandates, full re-implementation, re-QA"),
},
```

The "full" route skips G3_PLAN and goes directly to G3_6_MANDATES. The mandate generator reads `state.work_plan` to produce `implementation_mandates.md` — but `state.work_plan` is the **original** plan, not a remediation-scoped plan. Blocking findings are not in scope.

### Finding F-04: `state.py` Has No `last_blocking_findings` Field

```python
# state.py line 40
gate_state: Optional[str] = None   # null | "PASS_WITH_ACTION" | "OVERRIDE"
```

There is no persistent field in `PipelineState` to carry blocking findings forward across gates. The GATE_0 correction cycle reads findings ad-hoc from disk each time; it is not stored in state. For CURSOR_IMPLEMENTATION remediation, this must be remediated.

### Finding F-05: MandateStep `reads_from` Already Supports Auto-Injection (pipeline.py ~line 280)

The `_read_coordination_file()` function and `MandateStep.reads_from` already provide a mechanism for auto-injecting file content into mandate sections. This can be leveraged to inject blocking reports into remediation mandates without architectural changes to the mandate engine.

---

## 2. Ruling on Question 1 — The Remediation Artifact

**Question:** Should the system generate a completely new `remediation_mandates.md` replacing the original, or another approach?

### Ruling: Delta-Supplement Artifact, Not Replacement

**Decision:** Generate a new `remediation_mandates.md` artifact. The original `implementation_mandates.md` is preserved as historical reference. The remediation artifact is a **delta document** — it contains only the remediation scope, not a re-statement of the full feature.

**Rationale:**

Three considerations drive this decision:

**R1 — Token Efficiency.** Regenerating the entire feature spec for every correction cycle wastes tokens and re-introduces all original work as "new" context for execution teams, triggering the exact re-implementation problem Team 101 describes. A targeted delta document scopes the team to BF items only.

**R2 — Explicit Prohibition.** The remediation artifact must contain an explicit, capitalized prohibition: `DO NOT RE-IMPLEMENT FROM SCRATCH — address BF items only`. Without this, LLM execution teams will default to full re-implementation (their training distribution favors completeness). The prohibition must be in the prompt, not assumed from context.

**R3 — Baseline Preservation.** The original `implementation_mandates.md` must remain on disk unchanged. During remediation, execution teams need the original as a reference for unchanged components. If it is overwritten by a "remediation" version that only contains BF tasks, teams lose the ability to verify that non-BF areas were not accidentally modified.

**Artifact Specification:**

```
Artifact:          remediation_mandates.md   (domain-prefixed)
Origin:            Generated at G3_6_MANDATES (or CURSOR_IMPLEMENTATION)
                   when state.remediation_cycle_count > 0
Structure:
  §1: REMEDIATION CONTEXT
      - Cycle count
      - Gate that failed
      - Blocking findings verbatim (BF-01, BF-02, ...)
      - Source verdict file path
      - Explicit prohibition: DO NOT RE-IMPLEMENT FROM SCRATCH
  §2: REMEDIATION SCOPE
      - Per-team sections (only teams with assigned BF items)
      - Phase sequencing (see Q3 ruling)
      - Targeted task descriptions (translated by Team 10 at G3_REMEDIATION)
  §3: NON-SCOPE CONFIRMATION
      - Explicit list: "The following areas are OUT OF SCOPE for this cycle"
      - Teams MUST NOT touch these areas
```

---

## 3. Ruling on Question 2 — Translation of Blocker to Task

**Question:** Who translates BF items into executable tasks? Option A (Team 10 re-enters) or Option B (pipeline auto-injects raw BF to execution teams)?

### Ruling: Option A Scoped for "full" Routes; Option B for "doc" Routes

**Decision:** The routing type (`doc` vs `full`) determines the translation mechanism. These are architecturally distinct correction cycles that require different levels of intelligence.

**Case A — "doc" route (GATE_4 or GATE_5 FAIL with `doc` routing):**

"doc" failures are minor, targeted, and mechanical — governance format, missing evidence files, wrong header fields. The pipeline can safely auto-inject raw BF into a CURSOR_IMPLEMENTATION correction prompt because:
- The BF items are already precise enough to act on directly
- No root-cause analysis is needed
- Team 10 involvement would create overhead disproportionate to the fix

**Implementation:** The `_generate_cursor_implementation_prompt()` function must be modified to detect `state.remediation_cycle_count > 0` and inject a correction-cycle header with blocking findings — exactly the pattern already used by `_generate_gate_0_prompt()` at line 960.

**Case B — "full" route (GATE_4 FAIL with `full` routing → G3_6_MANDATES):**

"full" failures involve code defects, integration failures, wrong behavior. The raw BF ("API returns 500") is a symptom, not a task. Sending `BF-01: ticker sync returns HTTP 500 on TASE symbols` directly to Team 20 without analysis will result in:
- Guesswork (Team 20 tries fixes without knowing root cause)
- Token waste (multiple attempts without structured diagnosis)
- Scope creep (Team 20 may over-fix adjacent code to compensate)

**Ruling: Option A — Team 10 must enter a scoped remediation planning loop.** However, this is NOT a full G3_PLAN re-run (which implies re-designing the entire feature). It is a **`G3_REMEDIATION` sprint** — a new lightweight pipeline state.

**`G3_REMEDIATION` State Specification:**

```
New gate:  G3_REMEDIATION
Owner:     team_10 (cursor)
Engine:    cursor
Position:  Inserted between FAIL_ROUTING[G3_6_MANDATES] and G3_6_MANDATES
Scope:     Strictly translate BF items → concrete implementation tasks. No re-design.
```

**Team 10's mandate at G3_REMEDIATION:**
1. Read the blocking report (auto-injected by pipeline via `state.last_blocking_findings`)
2. Read the original `work_plan` for component context
3. Read any verdict file auto-located via `_verdict_candidates()`
4. For each BF item: identify the responsible team, the specific file/function, and the precise fix required
5. Output: `remediation_work_plan.md` — structured as: `BF-NN → team_XX → file:function → fix description`
6. **Constraint:** MUST NOT add new features or expand scope. MUST NOT re-describe original requirements.

**Team 10 at G3_REMEDIATION is a diagnosis specialist, not a feature planner.**

**Summary table:**

| Failure Route | BF Translation | New State Needed |
|---|---|---|
| "doc" → CURSOR_IMPLEMENTATION | Automated pipeline injection | No — extend existing prompt generator |
| "full" → G3_6_MANDATES | Team 10 at G3_REMEDIATION | Yes — new state in GATE_SEQUENCE |

---

## 4. Ruling on Question 3 — Phase Sequencing in Remediation

**Question:** If Team 30 fails because Team 20's API is broken, do we re-run phases sequentially or in parallel?

### Ruling: Sequential-by-BF-Origin, Skip-Non-Affected-Phases

**Decision:** Phases are sequential by dependency. Phases containing no BF items are **skipped entirely** in the remediation cycle. Remediation never runs phases in parallel when the downstream phase depends on the upstream phase's output.

**Rationale:**

**R1 — Dependency Preservation.** The current `MandateStep.phase` / `depends_on` system already encodes dependency correctly (Phase 1: Team 20 → Phase 2: Team 30 after Phase 1). This ordering reflects a real data dependency: the frontend calls the API. Running them in parallel during remediation when Team 20's output is broken will cause Team 30 to either:
  a) Test against the broken API (producing misleading results), or
  b) Ignore the API during testing (producing incomplete verification)

Both outcomes are architectural violations — they allow a GATE_4 cycle to complete against a partially-fixed system.

**R2 — Phase Skip Optimization.** If BF items are exclusively in Phase 2 (Team 30 — frontend), Team 20's phase should not re-run. Re-running Team 20 against correct, already-passing backend code:
  a) Wastes tokens and time
  b) Risks regression (Team 20 may introduce new bugs while "re-confirming" passing code)
  c) Violates the delta-supplement principle from Q1

**R3 — BF Attribution Responsibility.** Who determines which phase owns each BF item? **Team 10 at G3_REMEDIATION.** During the remediation work plan, Team 10 assigns each BF item to a specific team and phase. The pipeline then generates remediation mandates only for phases that have assigned BF items.

**Phase sequencing rules for remediation:**

```
Rule R-1: Only phases with at least one assigned BF item are included
Rule R-2: Phase dependencies are preserved exactly as in the original mandate
Rule R-3: If Phase N is skipped (no BF items), Phase N+1 may start immediately
          — but only if Phase N+1's BF items do not require Phase N re-verification
Rule R-4: If Phase 1 (Team 20) has BF items that could affect Phase 2 (Team 30),
          Phase 2 MUST wait for Phase 1 remediation + mini-QA before starting
          → "mini-QA" = Team 50 validates only the affected endpoints, not full suite
```

**Concrete scenario from Team 101's question:**

```
Scenario: Team 30 UI fails because Team 20 API returns wrong data

BF attribution (by Team 10 at G3_REMEDIATION):
  BF-01: Phase 1 (Team 20) — ticker_router.py returns 500 on TASE symbols
  BF-02: Phase 2 (Team 30) — UI table shows wrong currency for agorot prices

Phase sequencing in remediation_mandates.md:
  Phase 1: Team 20 — fix ticker_router.py (BF-01)
           → mini-QA: Team 50 validates /api/v1/tickers/{tase_symbol} returns 200 + correct data
           → pipeline_run.sh phase2 only after mini-QA PASS
  Phase 2: Team 30 — fix currency display (BF-02), using verified Phase 1 output
```

```
Scenario: Only UI failed (Team 20 API correct)

BF attribution:
  BF-01: Phase 2 (Team 30) — display_name missing from ticker table

Phase sequencing:
  Phase 1: SKIPPED (no Team 20 BF items)
  Phase 2: Team 30 — fix display_name (BF-01)
```

---

## 5. Pipeline Implementation Summary

The following code changes are required to implement this ruling. These are **architectural specs for Team 61** — not instructions for Team 100 to implement.

### Change C-01: Add `last_blocking_findings` to `PipelineState` (state.py)

```python
# Add to PipelineState dataclass:
last_blocking_findings: str = ""       # raw BF-NN block from last verdict
last_blocking_gate: str = ""           # which gate produced the last failure
remediation_cycle_count: int = 0       # increments each time FAIL routing triggers
```

**Persistence:** These fields must be written to `pipeline_state_{domain}.json` and survive pipeline restarts.

### Change C-02: Add `G3_REMEDIATION` to GATE_SEQUENCE and GATE_CONFIG (pipeline.py)

```python
# In GATE_SEQUENCE — insert between G3_6_MANDATES and CURSOR_IMPLEMENTATION:
"GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
"G3_PLAN", "G3_5", "G3_6_MANDATES",
"G3_REMEDIATION",          # NEW — only active when remediation_cycle_count > 0
"CURSOR_IMPLEMENTATION",
...

# In GATE_CONFIG:
"G3_REMEDIATION": {
    "owner": "team_10", "engine": "cursor",
    "desc": "Team 10 translates blocking findings → targeted remediation work plan"
},
```

**Gate skip logic:** `G3_REMEDIATION` is skipped on first-run cycles (`remediation_cycle_count == 0`). Pipeline advance logic already supports this via `gate_state`.

### Change C-03: Extend `FAIL_ROUTING` for "full" GATE_4 route (pipeline.py)

```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "QA: doc/governance issues — inject BF + fix targeted"),
    "full": ("G3_REMEDIATION",        "QA: code failures — Team 10 diagnoses BF → remediation mandates"),
    #                ↑ was G3_6_MANDATES — now routes through G3_REMEDIATION first
},
```

### Change C-04: Extend CURSOR_IMPLEMENTATION Prompt Generator for Correction Cycles

The `_generate_cursor_implementation_prompt()` function (or its equivalent in `pipeline_run.sh`) must:
1. Check `state.remediation_cycle_count > 0`
2. If remediation cycle: load `state.last_blocking_findings` + generate correction notice identical to the GATE_0 pattern (lines 966–1012 of pipeline.py)
3. Point to `remediation_mandates.md` instead of `implementation_mandates.md`

### Change C-05: Add Remediation Mandate Generator Variant (pipeline.py)

When `remediation_cycle_count > 0` and entering `G3_6_MANDATES` (after G3_REMEDIATION):
- Read `remediation_work_plan.md` (Team 10's output from G3_REMEDIATION)
- Generate `remediation_mandates.md` using existing `_generate_mandate_doc()` with:
  - `is_remediation=True` flag (adds explicit prohibition header)
  - Only phases assigned BF items (phase skip logic per Q3 ruling)
  - BF context auto-injected into each team section via `MandateStep.reads_from`

---

## 6. Forwarding to Team 00

This architectural review constitutes Team 100's recommendation. Team 00's approval is required to issue a binding Architectural Directive.

**Recommended directive title:** `ARCHITECT_DIRECTIVE_REMEDIATION_LIFECYCLE_v1.0.0.md`

**Scope of directive:**
1. Lock the Delta-Supplement artifact model (Q1 ruling above)
2. Lock the G3_REMEDIATION state as canonical pipeline gate
3. Lock the "doc" vs "full" translation responsibility split
4. Lock sequential-by-BF-origin phase sequencing rule
5. Mandate C-01 through C-05 to Team 61 for implementation

**Implementation program:** This work belongs in **S003-P009** (Pipeline Resilience Package) as an additional work package (WP002), or as a separate S003 program depending on scope estimate by Team 10.

Team 101 should hold implementation until Team 00 approves this review and issues the directive.

---

**log_entry | TEAM_100 | REMEDIATION_LIFECYCLE_REVIEW | ARCHITECTURAL_ANALYSIS_COMPLETE_FORWARDED_TEAM_00 | 2026-03-18**
