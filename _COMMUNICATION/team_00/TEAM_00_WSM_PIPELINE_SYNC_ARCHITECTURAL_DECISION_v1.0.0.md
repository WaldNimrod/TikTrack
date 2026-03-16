---
document_id: TEAM_00_WSM_PIPELINE_SYNC_ARCHITECTURAL_DECISION_v1.0.0
from: Team 00 (Chief Architect)
to: Team 100 (AOS Domain Architect), Team 61 (Pipeline UI Specialist)
cc: Team 190 (Constitutional Validator), Team 170 (Registry & Documentation)
date: 2026-03-16
status: DECISION_PENDING — requires Nimrod approval before execution
priority: BLOCKING — WP003 cannot advance until resolution
authority: Team 00 — Chief Architect
---

# WSM ↔ Pipeline State JSON — Architectural Decision
## Team 00 Analysis & Options

---

## 0. Executive Summary — The Real Problem

**Team 61's diagnosis is correct. But the report understates the depth of the issue.**

Three distinct failures are co-present today:

| # | Failure | Manifestation |
|---|---------|---------------|
| F-1 | **Identity gap** — WSM says `active_work_package_id = N/A`; JSON says `S002-P005-WP003` | Dashboard shows WP that WSM doesn't know about |
| F-2 | **Stuck default** — `pipeline_state_tiktrack.json` has `work_package_id = "REQUIRED"` | TikTrack domain appears to have a phantom active pipeline |
| F-3 | **STATE_SNAPSHOT is not an integration** — it reads JSON for pipeline data and WSM for governance separately, with no cross-check | Drift is invisible at the operator level |

These are three different root causes requiring three different fixes. The sync script alone (Team 61's primary recommendation) addresses F-1 but not F-2 or F-3.

---

## 1. Ground Truth — What Each File Actually Holds Today

### WSM (SSOT — runtime portfolio state)
```
active_work_package_id:     N/A
in_progress_work_package_id: N/A
active_project_domain:      AGENTS_OS
current_gate:               GATE_8
last_closed_work_package_id: S002-P005-WP002 (GATE_8 PASS 2026-03-15)
```

### pipeline_state_agentsos.json (execution state)
```json
{
  "work_package_id": "S002-P005-WP003",
  "current_gate": "GATE_0",
  "gates_failed": ["GATE_0"],
  "spec_brief": "AOS State Alignment & Governance Integrity"
}
```

### pipeline_state_tiktrack.json (execution state)
```json
{
  "work_package_id": "REQUIRED",   ← DEFAULT VALUE, NEVER PROPERLY INITIALIZED
  "current_gate": "GATE_0",
  "gates_failed": ["GATE_0"]
}
```

### STATE_SNAPSHOT.json (observer output)
```json
"pipeline.domains.agents_os.current_gate": "GATE_0",
"pipeline.domains.tiktrack.current_gate": "GATE_0"
// WSM active_work_package_id: NOT surfaced in snapshot at all
```

### Summary table — what each system "sees"

| System | agents_os WP | tiktrack WP | WSM WP | Drift visible? |
|--------|-------------|-------------|--------|----------------|
| Dashboard | WP003 / GATE_0 | REQUIRED / GATE_0 | Not read | No |
| Pipeline CLI | WP003 / GATE_0 | REQUIRED / GATE_0 | Not read | No |
| STATE_SNAPSHOT | WP003 / GATE_0 | REQUIRED / GATE_0 | N/A (not surfaced) | No |
| WSM | N/A | N/A | N/A | — |

**No system detects the contradiction. That is the systemic failure.**

---

## 2. Root Cause Analysis

### RC-1: Ownership gap at initialization
`pipeline_run.sh init` creates a JSON file from CLI parameters (WP ID passed as argument).
It does NOT read WSM to validate or derive WP identity. Result: JSON can be initialized for a WP that WSM doesn't yet reflect.

### RC-2: No reverse obligation
WSM is updated by Gate Owners (manual). There is no enforcement that updating WSM
triggers (or requires) JSON alignment. The two updates are completely decoupled.

### RC-3: Wrong dataclass default
`state.py: work_package_id: str = "REQUIRED"` — this sentinel value was intended
as a "must be replaced" marker during init. In practice, if init is called without
a WP argument, the sentinel propagates to disk. Fix: `"NONE"` is the correct default.

### RC-4: STATE_SNAPSHOT doesn't integrate
`state_reader.py` has two independent read paths:
- `read_governance_state()` → reads WSM, extracts `active_stage` only
- `read_pipeline_state()` → reads JSON files directly

WSM's `active_work_package_id` is never extracted. The two reads are never
cross-checked. STATE_SNAPSHOT cannot detect drift because it was never designed to.

---

## 3. Architectural Options

### Option 1 — Two-Authority Contract (Minimal Fix + CI Enforcement)
**Core principle:** WSM owns *identity*. JSON owns *execution*. Enforce the boundary.

**What changes:**
- `pipeline_run.sh init` cross-validates WP_ID against WSM before writing JSON
- `state.py` default: `"REQUIRED"` → `"NONE"`
- `sync_registry_mirrors_from_wsm.py` extended to also check JSON identity fields
- CI `--check` added for pipeline_state JSON identity fields vs WSM
- Gate Owner SOP updated: "After updating WSM, run `./pipeline_run.sh sync`"

**Split of authority (explicit contract):**

| Field | Authority | Writable by |
|-------|-----------|-------------|
| `work_package_id` | WSM → JSON (mirror) | Only via `init` validated against WSM |
| `stage_id` | WSM → JSON (mirror) | Only via `init` validated against WSM |
| `project_domain` | WSM → JSON (mirror) | Only via `init` validated against WSM |
| `current_gate` | JSON | `pipeline_run.sh pass/fail` |
| `gates_completed` | JSON | `pipeline_run.sh pass` |
| `gates_failed` | JSON | `pipeline_run.sh fail` |
| `lld400_content` | JSON | Gate execution |
| `work_plan`, `mandates` | JSON | Gate execution |

**Pros:** Minimal code change. No architectural shift. Fast to implement.
**Cons:** Doesn't fix the visibility gap — dashboard/CLI still can't see drift after it forms.
**Complexity:** Low | **Risk:** Low | **Sprint:** ~0.5 session

---

### Option 2 — STATE_SNAPSHOT as Integration Layer
**Core principle:** All readers (dashboard, CLI, observer) read STATE_SNAPSHOT.
STATE_SNAPSHOT = WSM identity + JSON execution, merged and drift-checked.

**What changes:**
- `state_reader.py` updated: `read_governance_state()` extracts `active_work_package_id`, `active_project_domain`, `active_program_id` from WSM
- STATE_SNAPSHOT `pipeline` section restructured: identity fields from WSM, gate fields from JSON
- Drift detection: if `wsm.active_work_package_id != json.work_package_id` → `drift_detected: true` flag in STATE_SNAPSHOT
- Dashboard updated to read `STATE_SNAPSHOT.pipeline.domains` (already reads `STATE_SNAPSHOT.json`)
- Pipeline CLI updated to read STATE_SNAPSHOT for identity, JSON for execution

**STATE_SNAPSHOT schema (new `pipeline` section):**
```json
{
  "pipeline": {
    "wsm_active_wp": "S002-P005-WP003",
    "wsm_active_domain": "AGENTS_OS",
    "domains": {
      "agents_os": {
        "wp_identity_source": "wsm",
        "work_package_id": "S002-P005-WP003",
        "current_gate": "GATE_0",
        "drift_detected": false
      },
      "tiktrack": {
        "wp_identity_source": "json",
        "work_package_id": "NONE",
        "current_gate": "NONE",
        "drift_detected": false
      }
    }
  }
}
```

**Pros:** Drift becomes visible. Dashboard reflects true state. Single read interface.
**Cons:** Requires dashboard refactor (reads JSON directly today). WSM dual-domain limitation (WSM tracks one active domain; tiktrack "inactive" state must be inferred).
**Complexity:** Medium | **Risk:** Medium | **Sprint:** 1–1.5 sessions

---

### Option 3 — JSON Stores Only Execution (Structural Separation)
**Core principle:** Eliminate identity fields from pipeline JSON entirely.
JSON = execution ledger. WSM = identity ledger. No overlap, no conflict possible.

**What changes:**
- `PipelineState` dataclass removes: `work_package_id`, `stage_id`, `project_domain`, `spec_brief`
- These are always derived from WSM at runtime (never persisted in JSON)
- `PipelineState.load()` first reads WSM for identity, then JSON for execution
- Dashboard receives a unified object: identity from WSM + execution from JSON, assembled by state_reader

**Pros:** Permanent fix. Zero drift possible (no overlap). Architecturally cleanest.
**Cons:** Requires WSM to always be up-to-date before CLI works (adds dependency).
Breaking change to state.py/CLI.
**Complexity:** High | **Risk:** Medium-High | **Sprint:** Full dedicated session

---

## 4. Hybrid Recommendation (Team 00 Position)

**Immediate (this session, before WP003 can advance):**
Apply the minimal fixes that resolve today's broken state — no architectural change required:

| Action | Who | What |
|--------|-----|------|
| M-1 | Team 61 | `state.py`: change default `work_package_id = "REQUIRED"` → `"NONE"` |
| M-2 | Gate Owner (Team 10 / Nimrod) | WSM: set `active_work_package_id = S002-P005-WP003`, `active_project_domain = AGENTS_OS` |
| M-3 | Team 61 | `pipeline_state_tiktrack.json`: set `work_package_id = "NONE"`, `current_gate = "NONE"`, clear `gates_failed` |
| M-4 | Team 61 | `pipeline_run.sh init`: add WSM cross-validation before writing JSON |

**Short-term (WP003 scope — this is the substance of WP003):**
Option 1 (Two-Authority Contract) — the correct architectural fix for the system as built.
- CI enforcement for identity drift
- Gate Owner SOP update
- `--check` command in CLI

**Medium-term (S003 or dedicated session):**
Option 2 (STATE_SNAPSHOT integration) — upgrade drift from "detectable by CI" to "visible in dashboard in real-time".

**Option 3 is deferred** — it requires careful analysis of the WSM dual-domain limitation before being safe to implement.

---

## 5. Parameters for Nimrod's Decision

**Decision A: Immediate unblock — can Team 61 apply M-1 through M-4 now?**
- M-1 and M-3 are safe (no behavioral change, just fixing wrong data)
- M-2 requires Gate Owner judgment: is WP003 truly the active WP? (Yes, per pipeline JSON)
- M-4 is a small behavioral change to `pipeline_run.sh`

**Decision B: WP003 scope — does the Two-Authority Contract (Option 1) become WP003's deliverable?**
This is architecturally appropriate since WP003's title is "AOS State Alignment & Governance Integrity."
WP003 **is** the fix for this problem. The question is whether to expand scope to include Option 2 (STATE_SNAPSHOT integration) or keep it lean.

| Choice | Scope | Sessions | Risk |
|--------|-------|----------|------|
| B1 — Option 1 only | Sync contract + CI | 1 session | Low |
| B2 — Option 1 + Option 2 | Sync + STATE_SNAPSHOT integration | 2 sessions | Medium |
| B3 — Option 3 | Structural separation | 1 dedicated session | Medium-High |

**Decision C: Dual-domain WSM model**
WSM currently tracks ONE active domain. This is an implicit architectural constraint.
Does Team 100 agree that `active_project_domain` in WSM = the domain currently receiving pipeline work?
If tiktrack and agents_os could both be active simultaneously (they are today in practice), WSM needs a schema change.
This is a prerequisite for Option 2 or 3 if dual-domain parallelism is a requirement.

---

## 6. What Cannot Happen

**Iron Rule (immediate):**
`pipeline_state_tiktrack.json` MUST NOT contain `work_package_id = "REQUIRED"`.
This is an uninitialized sentinel in a committed file. It creates phantom pipeline state.
Regardless of architectural decision: this must be fixed before any work advances.

**Iron Rule (going forward):**
`pipeline_run.sh init` MUST NOT write JSON with `work_package_id = "REQUIRED"`.
If no WP is specified and WSM has no active WP, `init` must refuse (exit with error).

---

## 7. Requested Decisions

1. **Approve M-1 through M-4 as immediate unblock** (Team 61 executes today)
2. **Select WP003 scope** — B1 (lean) or B2 (full STATE_SNAPSHOT) or B3 (structural)
3. **Dual-domain WSM** — confirm whether single-active-domain is an accepted constraint or requires schema change

---

**log_entry | TEAM_00 | WSM_PIPELINE_SYNC_ARCHITECTURAL_DECISION | v1.0.0_CREATED | DECISION_PENDING | 2026-03-16**
