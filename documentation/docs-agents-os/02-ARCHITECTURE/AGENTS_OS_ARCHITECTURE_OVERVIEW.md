# Agents_OS Architecture Overview
## documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-14

---

## 1. Domain Isolation Model

Agents_OS runtime and orchestration logic live under `agents_os/` and `agents_os_v2/`. `agents_os_v2` imports nothing from `api/` or TikTrack application code — it is a pure governance/orchestration layer.

**Source:** [agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md](../../../agents_os/docs-governance/AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/DOMAIN_ISOLATION_MODEL.md)

| Rule | Description |
|------|-------------|
| **Repository location** | All Agents_OS artifacts under `agents_os/`; no runtime logic outside. |
| **Communication layer** | `_COMMUNICATION` remains shared infrastructure. |
| **Documentation** | System docs: `documentation/docs-system/`; governance: `documentation/docs-governance/`; Agents_OS: `documentation/docs-agents-os/` |
| **Enforcement** | No Agents_OS runtime in TikTrack directories or governance canonical files. Violation = structural failure. |
| **State (SSM/WSM)** | Shared; no per-domain SSM/WSM files. Single source in docs-governance. |

---

## 2. Gate Sequence

ASCII flow (authoritative: `GATE_SEQUENCE` and `GATE_CONFIG` in `agents_os_v2/orchestrator/pipeline.py`):

```
GATE_0 (Scope) → GATE_1 (LLD400) → GATE_2 / WAITING_GATE2_APPROVAL (Human) →
G3_PLAN (Work Plan) → G3_5 (Validate Plan) → G3_6_MANDATES (Mandates) →
CURSOR_IMPLEMENTATION → GATE_4 (QA) → GATE_5 (Dev Validation) [doc→G5_DOC_FIX] →
GATE_6 / WAITING_GATE6_APPROVAL (Human) → GATE_7 (UX Sign-off) → GATE_8 (Closure)
```

**Gate types and owners (GATE_CONFIG):**

| Gate | Owner | Engine | Description |
|------|-------|--------|-------------|
| GATE_0 | team_190 | codex | LOD200 scope validation |
| GATE_1 | team_190 | codex | LLD400 spec validation |
| GATE_2 | team_100 | codex+human | Architectural intent review → WAITING_GATE2_APPROVAL |
| WAITING_GATE2_APPROVAL | team_00 | human | Nimrod reviews GATE_2 analysis |
| G3_PLAN | team_10 | cursor | Build work plan from approved spec |
| G3_5 | team_90 | codex | Validate work plan |
| G3_6_MANDATES | team_10 | orchestrator | Generate per-team mandates |
| CURSOR_IMPLEMENTATION | teams_20_30 | cursor | Implement + MCP test |
| GATE_4 | team_10 | cursor | QA coordination |
| GATE_5 | team_90 | codex | Dev validation (code vs spec) |
| G5_DOC_FIX | team_10 | cursor | Doc/artifact fix → GATE_5 re-validation |
| GATE_6 | team_100 | codex+human | Architectural reality review |
| WAITING_GATE6_APPROVAL | team_00 | human | Nimrod reviews GATE_6 |
| GATE_7 | team_90 | human | Team 90 + Nimrod UX approval |
| GATE_8 | team_90 | codex | Documentation closure |

---

## 3. Mandate Engine

**Source:** `agents_os_v2/orchestrator/pipeline.py` — `MandateStep`, `_generate_mandate_doc()`, `_read_coordination_file()`.

### MandateStep

Each `MandateStep` describes one team's work:

| Field | Purpose |
|-------|---------|
| team_id | "team_20", "team_70", etc. |
| label | Display label |
| phase | Execution phase (1 = first); same phase = parallel |
| task | Full task description (markdown) |
| writes_to | Canonical output path |
| reads_from | File paths for coordination data |
| reads_label | Human-readable description |
| depends_on | Team IDs whose phase must complete first |
| acceptance | Acceptance criteria strings |
| extra | Context (conventions, iron rules) |

### Document generation flow

1. Header (gate, WP, spec_brief)
2. EXECUTION ORDER block — phases, parallel/sequential, dependency arrows
3. Per-team sections — task, coordination (auto-injected via `_read_coordination_file` or guided placeholder), output path, acceptance criteria

### Coordination injection

`_read_coordination_file(paths, repo_root)` searches candidate paths and, if not found, globs team folder for WP-pattern files. Result is injected into the mandate so the next team sees prior team output.

### Output files

- `G3_6_MANDATES` → `implementation_mandates.md`
- `GATE_8` → `gate_8_mandates.md`

---

## 4. Multi-Domain Design

**Source:** `agents_os_v2/orchestrator/state.py`, `pipeline_run.sh` `--domain` handling.

| Aspect | Behavior |
|--------|----------|
| Domains | `tiktrack` (default) and `agents_os` — parallel pipelines |
| State files | `_COMMUNICATION/agents_os/pipeline_state.json` (tiktrack), `pipeline_state_agentsos.json` (agents_os) via `get_state_file(domain)` |
| Resolution | Explicit `--domain` > `PIPELINE_DOMAIN` env > fallback to legacy `pipeline_state.json` |
| CLI | `./pipeline_run.sh --domain agents_os status`, `./pipeline_run.sh domain` shows both pipelines |

`PipelineState` holds `project_domain`; `load()` and `load_domain()` resolve which file to read.

---

## 5. Correction Cycle

When a gate fails, routing is determined by `FAIL_ROUTING` and `default_fail_route` in GATE_CONFIG.

| Route | Target | Use case |
|-------|--------|----------|
| **doc** | Same gate or G5_DOC_FIX | Documentation/artifact issues only — no code changes |
| **full** | G3_PLAN or G3_6_MANDATES | Substantial code/design issues — full re-plan → mandates → implementation |

**GATE_8 example:** On FAIL, GATE_8 routes doc→GATE_8 (fix doc gaps and re-validate) or full→G3_PLAN (major revision). `advance_gate()` in `pipeline.py` applies the chosen route; `fail` case in `pipeline_run.sh` displays options and waits for `route doc|full [notes]`.

**Source:** `advance_gate()`, `fail)` handler in `pipeline_run.sh`, `FAIL_ROUTING` and GATE_CONFIG in `pipeline.py`.

---

**log_entry | TEAM_170 | AGENTS_OS_ARCHITECTURE_OVERVIEW | DELIVERED | 2026-03-14**
