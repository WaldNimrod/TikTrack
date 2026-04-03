date: 2026-03-25
historical_record: true

# AOS Pipeline & Dashboard — Code Quality Report + Optimal Architecture
**Author:** Team 100 (architectural research, no code changes)
**Date:** 2026-03-25
**Scope:** `agents_os_v2/` (Python orchestrator) + `agents_os/ui/js/` (browser dashboard)
**Status:** Research only — no implementation

---

## 1. Executive Summary

The AOS pipeline is a **logically sound deterministic state machine** built iteratively over many versions. The core design — 5-gate sequence, domain-parallel execution, HITL guard, KB-84 precision — is correct and worth preserving.

The problem is implementation structure, not design:

> **The system knows what it wants to be (a data-driven routing table) but is implemented as code-driven logic.** Every new gate, domain, or team required manual surgery in 4+ files simultaneously. The codebase shows the scars.

**Bottom line:** The candidate for refactoring is real. The risk is manageable if phased correctly.

---

## 2. Code Quality Assessment by Layer

### 2.1 Python Orchestrator (`agents_os_v2/`)

| Module | Size | Quality | Notes |
|---|---|---|---|
| `orchestrator/pipeline.py` | **3,854 lines** | ⚠️ Critical | Monolith. Routing, prompt generation, state logic, domain branching — all mixed |
| `orchestrator/state.py` | ~250 lines | ✅ Good | Clean Pydantic model; migration pattern correct |
| `orchestrator/gate_router.py` | ~80 lines | ⚠️ Partial | Flat map duplicates pipeline.py routing; not SSOT |
| `orchestrator/migration_config.py` | ~40 lines | ✅ Good | Isolated table; clean pattern |
| `conversations/gate_*.py` | ~750 lines (8 files) | ⚠️ Boilerplate | Every file is structurally identical: build prompt → call engine → parse → return GateResult |
| `engines/` | ~200 lines | ✅ Good | Clean base class + implementations |
| `validators/` | ~500 lines | ✅ Good | Well-isolated; one concern per validator |
| `context/injection.py` | ~200 lines | ✅ Good | 4-layer injection is correct architecture |
| `config.py` | ~152 lines | ⚠️ Partial | Multiple domain maps scattered across file; should be one manifest |
| `server/` | ~400 lines | ✅ Good | Clean FastAPI; routes are appropriate |

**Biggest problem:** `pipeline.py` at 3,854 lines is the blast radius. It contains:
- 3-tier domain/variant/phase routing table (embedded in code, not data)
- Per-gate if/elif branching (9+ branches)
- Prompt generation logic
- State transition logic
- Failure/remediation routing
- Domain-specific special cases

### 2.2 JavaScript Dashboard (`agents_os/ui/js/`)

| Module | Size | Quality | Notes |
|---|---|---|---|
| `pipeline-config.js` | ~300 lines | ⚠️ Partial | Gate sequence + phase routing fallback table — mirrors Python; drift risk |
| `pipeline-state.js` | ~150 lines | ✅ Good | KB-84 guard + domain resolution is solid |
| `pipeline-commands.js` | ~250 lines | ✅ Good | Clipboard + guard modal — works well |
| `pipeline-teams.js` | ~300 lines | ❌ Problem | 300 lines of hard-coded team roster. No JSON source. Any roster change = JS edit |
| `pipeline-dashboard.js` | ~200 lines | ✅ OK | Straightforward UI render |
| `pipeline-roadmap.js` | ~200 lines | ✅ OK | Roadmap renders fine |
| `pipeline-monitor*.js` | ~400 lines | ⚠️ Partial | 3 monitor files for one page; boundary unclear |

### 2.3 Shell Wrapper (`pipeline_run.sh`)

| Aspect | Assessment |
|---|---|
| Domain resolution | ✅ Clean 3-tier hierarchy (flag > env > auto-detect) |
| Precision guard | ✅ Correct KB-84 validation before advance |
| Prompt generation | ✅ Delegates to Python; not re-implementing routing |
| Auto-commit (S003-P016) | ✅ Clean and isolated |
| Overall size (~500 lines) | ⚠️ Growing; git integration section is complex |

---

## 3. Specific Code Smells

### 3.1 The Routing Duplication Problem (Critical)

The same routing question — "which team owns gate G, phase P, domain D, variant V?" — is answered in **four places**:

| Location | Expression | Lines |
|---|---|---|
| `pipeline.py` | `_DOMAIN_PHASE_ROUTING` dict | ~80 lines embedded code |
| `config.py` | `DOMAIN_GATE_OWNERS` dict | ~30 lines |
| `pipeline-config.js` | inline `phaseTable` fallback | ~40 lines |
| `pipeline-teams.js` | team definitions (no routing, but team capability) | ~300 lines |

Any change to routing (new domain, new team, new phase) requires touching all four. This is why GATE_6/7/8 drift existed — the aliases were cleaned in one place but survived in others for months.

### 3.2 Conversation Handler Boilerplate (High)

All 8 gate conversation handlers (`gate_0_spec_arc.py` through `gate_5_dev_validation.py`) follow identical structure:

```python
async def run_gate_X(engine, inputs...) -> GateResult:
    system_prompt = build_full_agent_prompt(...)
    user_message = build_canonical_message(...)
    response = await engine.call_with_retry(system_prompt, user_message)
    decision = parse_decision(response)
    return GateResult(gate_id="GATE_X", status=decision, ...)
```

The difference between files is only: which gate, which phase labels, which acceptance criteria, which artifact names. This is a textbook case for a **generic gate runner with gate-specific configuration**.

### 3.3 Hard-Coded Team Roster in JS (High)

`pipeline-teams.js` defines the canonical team roster as JavaScript objects (~300 lines). This means:
- Team roster change = JS edit
- No single source of truth with Python config
- Dashboard can show teams that no longer exist (or miss new ones)

The roster should live in `teams_roster.json`, generated from `config.py` (or the proposed SSOT manifest), and loaded by JS.

### 3.4 Composite Key Routing Complexity (Medium)

The current routing priority logic:
```
composite (domain+variant) > domain > variant > default
```

Works, but is fragile:
- Priority is implicit (sequence of dict lookups, not explicit precedence)
- A typo in a key (`"tiktrack+TRACK_FULL"` vs `"tiktrack+track_full"`) silently falls through to wrong default
- There is no validation that every phase has a reachable route for every valid domain/variant combination

### 3.5 Scattered State SSOT (Medium)

Three places describe "what is the current pipeline state":
1. `pipeline_state_tiktrack.json` / `pipeline_state_agentsos.json` — runtime
2. `PHOENIX_MASTER_WSM_v1.0.0.md` — human-readable markdown
3. `server/` FastAPI `/api/status` — derived from #1

This is acceptable (runtime state → derived endpoints) but the WSM is maintained manually by teams. There is no enforcement that WSM reflects state files. S003-P016 improved this but didn't eliminate the gap.

---

## 4. What Should NOT Be Changed

Before proposing new architecture, record what is working well and should be preserved:

| Element | Why It Works |
|---|---|
| 5-gate sequence (GATE_0–GATE_5) | Proven model; don't touch the sequence itself |
| Domain-parallel independent state files | Correct isolation; keep |
| KB-84 precision guard | Critical safety mechanism; keep and strengthen |
| 4-layer prompt injection (identity + governance + state + task) | Solid LLM engineering; keep the structure |
| HITL enforcement (no agent self-advancement) | Iron Rule; non-negotiable |
| Base engine abstraction (`BaseEngine`) | Clean; engines are interchangeable |
| GateResult typed return | Good contract; keep |
| Action log + event log (append-only JSONL) | Correct audit approach; keep |
| Auto-migration on state load | Backward compatibility; keep the pattern |
| S003-P016 git isolation (branch-per-WP) | Correct; keep |

---

## 5. Proposed Optimal Architecture

### 5.1 Core Principle

**Invert the model: make routing a data artifact, not code.**

Today: routing is expressed as Python dicts inside pipeline.py. Code is truth.
Tomorrow: routing is expressed in a YAML manifest. Data is truth. Code reads it.

### 5.2 The SSOT Manifest (`pipeline_manifest.yaml`)

A single file that defines everything that currently lives scattered across config.py, pipeline.py, gate_router.py, and pipeline-config.js:

```yaml
# pipeline_manifest.yaml — SINGLE SOURCE OF TRUTH

gates:
  - id: GATE_0
    name: Scope Validation
    phases:
      - id: "0.1"
        name: Scope submission
        routing:
          default: team_190
      - id: "0.2"
        name: Scope validation
        routing:
          default: team_190

  - id: GATE_1
    name: Specification
    phases:
      - id: "1.1"
        name: LOD200 authoring
        routing:
          default: team_170
      - id: "1.2"
        name: Spec validation
        routing:
          default: team_190

  - id: GATE_2
    name: Work Plan & Approval
    phases:
      - id: "2.2"
        name: Work plan authoring
        routing:
          default: team_10
          tiktrack: team_10
          agents_os: team_11
          "tiktrack+TRACK_FOCUSED": team_10
          "agents_os+TRACK_FOCUSED": team_11
      - id: "2.3"
        name: Architectural sign-off
        routing:
          default: team_100
          sentinel: lod200_author_team      # resolve from state field

  - id: GATE_3
    name: Implementation
    phases:
      - id: "3.1"
        name: Mandate issuance
        routing:
          default: team_10
          tiktrack: team_10
          agents_os: team_11
      - id: "3.2"
        name: Implementation
        routing:
          default: team_10
          tiktrack: team_10
          agents_os: team_11
      - id: "3.3"
        name: QA-pre validation
        routing:
          default: team_90

  - id: GATE_4
    name: QA & Human Review
    phases:
      - id: "4.1"
        name: QA execution
        routing:
          default: team_50
          tiktrack+TRACK_FULL: team_50
          tiktrack+TRACK_FOCUSED: team_50
          agents_os: team_51
      - id: "4.2"
        name: Architectural QA review
        routing:
          default: team_100
      - id: "4.3"
        name: Human UX sign-off
        routing:
          default: team_00           # Nimrod — human gate

  - id: GATE_5
    name: Documentation Closure
    phases:
      - id: "5.1"
        name: AS_MADE documentation
        routing:
          default: team_70
          tiktrack: team_70
          agents_os: team_170
      - id: "5.2"
        name: Final validation
        routing:
          default: team_90

domains:
  tiktrack:
    default_variant: TRACK_FULL
    doc_team: team_70
    state_file: _COMMUNICATION/agents_os/pipeline_state_tiktrack.json
  agents_os:
    default_variant: TRACK_FOCUSED
    doc_team: team_170
    state_file: _COMMUNICATION/agents_os/pipeline_state_agentsos.json

variants:
  TRACK_FULL:
    description: Full team roster — default for TikTrack
    execution_teams: [team_10, team_20, team_30, team_40]
    qa_team: team_50
    validation_team: team_90
  TRACK_FOCUSED:
    description: Streamlined — default for Agents_OS
    execution_teams: [team_11, team_61]
    qa_team: team_51
    validation_team: team_90

teams:
  team_00:
    label: System Designer
    engine: human
    domain: all
  team_10:
    label: Gateway / Execution Lead (TikTrack)
    engine: cursor
    domain: tiktrack
  team_11:
    label: AOS Gateway / Execution Lead
    engine: cursor
    domain: agents_os
  # ... etc. for all teams
```

**Effect:** pipeline.py's `_DOMAIN_PHASE_ROUTING` (80 lines), config.py's `DOMAIN_GATE_OWNERS` (30 lines), `pipeline-config.js` fallback table (40 lines), and `pipeline-teams.js` roster (300 lines) are all replaced by this one file.

---

### 5.3 Python Layer — Module Map

**Proposed structure:**

```
agents_os_v2/
  manifest/
    pipeline_manifest.yaml          ← SSOT (new)
    manifest_loader.py              ← load + validate manifest
    phase_resolver.py               ← single routing function (replaces pipeline.py §5)

  orchestrator/
    state_machine.py                ← gate advancement, PASS/FAIL transitions (~200 lines)
    state.py                        ← unchanged (Pydantic model)
    migration_config.py             ← unchanged
    action_log.py                   ← unchanged
    log_events.py                   ← unchanged

  runner/
    gate_runner.py                  ← GENERIC gate executor (replaces all 8 conversation files)
    gate_config.py                  ← gate-specific acceptance criteria + artifact names (data)
    result.py                       ← GateResult model (extracted)

  context/
    injection.py                    ← unchanged
    identity/                       ← unchanged
    governance/                     ← unchanged

  engines/                          ← unchanged (BaseEngine + implementations)
  validators/                       ← unchanged
  server/                           ← unchanged

  tools/
    build_assets.py                 ← generates phase_routing.json + teams_roster.json for JS
    ssot_check.py                   ← validates manifest consistency
```

**Key reductions:**

| Before | After | Reduction |
|---|---|---|
| `pipeline.py` (3,854 lines) | `state_machine.py` (~200) + `phase_resolver.py` (~100) | **~3,500 lines eliminated** |
| 8 × `gate_*.py` files (~750 lines) | `gate_runner.py` (~150) + `gate_config.py` (~80) | **~520 lines eliminated** |
| `config.py` routing maps | YAML manifest | **~80 lines eliminated** |
| `gate_router.py` | Derived from manifest | **~80 lines eliminated** |

---

### 5.4 JavaScript Layer — Module Map

**Proposed structure:**

```
agents_os/ui/js/
  data/                             ← generated by Python, never hand-edited
    phase_routing.json              ← gate → phase → domain → variant → team
    teams_roster.json               ← full team list with attributes

  core/
    pipeline-config.js              ← gate sequence constants only (~30 lines)
    pipeline-state.js               ← unchanged (domain resolution + KB-84)
    pipeline-commands.js            ← unchanged (clipboard + guard modal)
    pipeline-manifest.js            ← loads phase_routing.json + teams_roster.json

  ui/
    pipeline-dashboard.js           ← unchanged (renders state)
    pipeline-roadmap.js             ← unchanged
    pipeline-teams.js               ← refactored: load from teams_roster.json (~30 lines, not 300)
    pipeline-monitor.js             ← consolidate monitor*.js into one file

  shared/
    pipeline-dom.js                 ← unchanged
    event-log.js                    ← unchanged
```

**Key change:** `pipeline-teams.js` drops from 300 lines of hard-coded objects to ~30 lines that load and render `teams_roster.json`. The roster data moves to the YAML manifest (generated to JSON by Python build step).

---

### 5.5 The Generic Gate Runner

Replace 8 structurally-identical conversation files with one:

```python
# runner/gate_runner.py

async def run_gate(gate_id: str, state: PipelineState, engine: BaseEngine) -> GateResult:
    """
    Generic gate executor. Gate-specific behavior is data (gate_config.py), not code.
    """
    config = GATE_CONFIGS[gate_id]  # from gate_config.py

    system_prompt = build_full_agent_prompt(
        team=resolve_phase_owner(state),
        gate=gate_id,
        acceptance_criteria=config.acceptance_criteria,
    )
    user_message = build_canonical_message(
        state=state,
        artifact_names=config.artifact_names,
        task_description=config.task_description,
    )

    response = await engine.call_with_retry(system_prompt, user_message)
    decision = parse_decision(response, config.decision_markers)

    return GateResult(
        gate_id=gate_id,
        status=decision,
        findings=extract_findings(response, config.finding_schema),
        artifacts_produced=config.artifact_names,
        next_gate=state_machine.resolve_next(gate_id, decision),
        message=response.summary,
    )
```

```python
# runner/gate_config.py — data, not code

GATE_CONFIGS = {
    "GATE_0": GateConfig(
        task_description="Validate scope: is this WP well-defined?",
        acceptance_criteria=["AC-01: Scope statement present", "AC-02: No scope creep"],
        artifact_names=["LOD200_draft"],
        decision_markers=["SCOPE_APPROVED", "SCOPE_REJECTED"],
        finding_schema=STANDARD_FINDINGS_SCHEMA,
    ),
    "GATE_1": GateConfig(
        task_description="Author LLD400 specification",
        acceptance_criteria=["AC-01: All sections complete", ...],
        ...
    ),
    # ... one entry per gate, ~20 lines each
}
```

---

### 5.6 Asset Generation Pipeline

Single build step that produces all derived artifacts:

```
python agents_os_v2/tools/build_assets.py
  → reads pipeline_manifest.yaml
  → writes agents_os/ui/js/data/phase_routing.json
  → writes agents_os/ui/js/data/teams_roster.json
  → validates routing coverage (every gate/phase/domain/variant has a resolved team)
  → runs ssot_check.py (consistency validation across all layers)
```

**Run automatically:** on `git commit` (pre-commit hook) and on pipeline server start.

---

## 6. Migration Phasing

Refactoring this system carries risk if done as a single large PR. Recommended 3-phase approach:

### Phase A: Extract Manifest (low risk, high value)

**Goal:** Move routing data out of code, into YAML. No behavioral change.

1. Create `pipeline_manifest.yaml` from existing routing tables
2. Create `manifest_loader.py` + `phase_resolver.py`
3. Modify `pipeline.py` to use `phase_resolver.resolve()` instead of inline dict
4. Add `build_assets.py` to generate JSON for JS
5. Modify `pipeline-config.js` to load from JSON (keep inline fallback temporarily)
6. Run `ssot_check.py` — verify zero routing changes

**Test:** Run existing 239 tests. All pass = Phase A complete.

### Phase B: Split pipeline.py (medium risk)

**Goal:** Decompose monolith. No behavioral change.

1. Extract state transition logic → `state_machine.py`
2. Extract prompt generation → `context/injection.py` additions
3. Extract failure routing → `orchestrator/failure_router.py`
4. `pipeline.py` becomes thin orchestration layer (~300 lines)

**Test:** 239 tests + new unit tests on extracted modules.

### Phase C: Generic Gate Runner (higher risk)

**Goal:** Replace 8 boilerplate files with one.

1. Create `gate_config.py` with GATE_CONFIGS
2. Create `gate_runner.py` generic runner
3. Delete 6 active gate conversation files (keep LEGACY headers on gate_6/7/8)
4. Wire `gate_runner` into orchestrator

**Test:** Full integration test — run a synthetic WP through all 5 gates.

---

## 7. What This Delivers

| Metric | Before | After (A+B+C) |
|---|---|---|
| SSOT for routing | 4 files | 1 YAML |
| `pipeline.py` size | 3,854 lines | ~300 lines |
| Total Python lines (core) | ~5,000 | ~1,800 |
| Gate conversation files | 8 files (~750 lines) | 1 runner + 1 config (~230 lines) |
| JS team roster | 300 lines hard-coded | 30 lines + JSON |
| Drift risk (new gate/team) | Change 4–6 files | Change 1 YAML |
| Routing coverage validation | None | `ssot_check.py` |
| Time to add new domain | ~2 days surgery | ~2 hours YAML + test |

---

## 8. One Thing to Decide First

Before starting Phase A, one architectural decision needs locking:

**Where does the manifest live?**

**Option 1:** `agents_os_v2/manifest/pipeline_manifest.yaml` — inside the Python package
- Pro: version-controlled with code; tool access
- Con: changes require Python deploy

**Option 2:** `_COMMUNICATION/agents_os/pipeline_manifest.yaml` — operational state directory
- Pro: Nimrod can edit routing without touching code
- Con: file is buried in communications; less discoverable

**Recommendation:** Option 1. The manifest is architectural configuration, not operational state. It changes rarely and should be version-controlled like code. Routing changes go through the normal development pipeline.

---

## 9. Summary Verdict

| Question | Answer |
|---|---|
| Is refactoring justified? | **Yes.** 3,854-line monolith with routing duplication across 4 files is a known debt accumulation pattern. |
| Is it urgent? | **Medium.** The system works. The debt is structural, not functional. Do it before S004 adds more gates or domains. |
| What is the highest-impact single action? | **Extract the SSOT manifest (Phase A).** 80% of the drift and maintenance burden lives here. |
| Is a full rewrite needed? | **No.** The engine abstractions, 4-layer injection, state model, validators, and shell wrapper are solid. Preserve them. |
| What is the risk? | **Low-medium** if phased correctly. A→B→C with 239 tests as regression guard. |

---

**log_entry | TEAM_100 | RESEARCH_REPORT | AOS_CODE_QUALITY_AND_ARCHITECTURE | 2026-03-25**
