---
id: TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 90 (for Phase 2.2v review), Team 100 (for Phase 2.3 sign-off)
cc: Team 00, Team 61, Team 101, Team 190
date: 2026-03-20
gate: GATE_2
phase: "2.2"
wp: S003-P011-WP002
type: WORKPLAN
status: SUBMITTED_FOR_REVIEW
lod200_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
lld400_ref: _COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md
arch_review_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md
domain: agents_os
process_variant: TRACK_FOCUSED
---

# Work Plan — S003-P011-WP002 | Pipeline Stabilization & Hardening
## GATE_2 Phase 2.2 | Team 61 Execution Blueprint

---

## §1 — Overview and Context

| Field | Value |
|-------|-------|
| Work package | `S003-P011-WP002` |
| Title | Pipeline Stabilization & Hardening |
| Domain | **agents_os** (default track: **TRACK_FOCUSED**; TikTrack verification: **TRACK_FULL**) |
| Active gate / phase (this artifact) | GATE_2 / Phase **2.2** (Work Plan production) |
| LOD200 (requirements) | `TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md` |
| LLD400 (implementation contract) | `TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md` — **TEAM_190_PASS** |
| Architectural review | `TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md` |
| `lod200_author_team` (runtime) | `team_101` for this WP |

**Purpose:** Stabilize `agents_os_v2` pipeline so the 5-gate canonical model is consistently implemented: correct routing per `_DOMAIN_PHASE_ROUTING`, certified prompt generators, enforced `fail`/`pass`, automatic state migration, dashboard alignment, governance/SSOT closure.

**Authority rule:** Where LLD400 §1..§16 and **§17** conflict, **§17 is authoritative** (Blocking Findings Closure Addendum). Team 61 implements per **§17** plus binding clarifications in **§3** below (Architectural Review §3.1..§3.4, reproduced verbatim).

---

## §2 — Implementation Team and Tools

| Role | Team | Engine (per TEAM_ROSTER_v2.0.0 / team_engine_config) |
|------|------|------------------------------------------------------|
| Implementation | **Team 61** (AOS Backend Implementor) | **Cursor Composer** (operational default per config chain) |
| QA (GATE_3 Phase 3.3) | Team 51 | — |
| Governance / SSOT / D-11 / D-12 artifacts | Team 170 (+ Team 190 validation) | — |

**Primary file scope (Team 61):**

| Path | Purpose |
|------|---------|
| `agents_os_v2/orchestrator/state.py` | `PipelineState` Pydantic model + `load()` — **§17.1, §17.2 amended by §3.1** |
| `agents_os_v2/orchestrator/pipeline.py` | `GATE_SEQUENCE`, `_MIGRATION_TABLE`, `_DOMAIN_PHASE_ROUTING`, generators, `FAIL_ROUTING`, handlers — **§2, §3..§9, §17.3, §17.4** |
| `agents_os_v2/utils/path_builder.py` | `CanonicalPathBuilder` — **§12** |
| `agents_os_v2/tests/test_certification.py` | CERT_01..CERT_15 — **§10, §17.5** |
| `pipeline_run.sh` (repo root) | `pass` / `fail` / `approve` / `dry-run` / `status` — **§7, D-06, LOD200 §2.4–2.5** |
| `agents_os/ui/js/pipeline-dashboard.js` | Mandate panel `GATE_3` + phase `3.1` — **§8, D-04** |
| `agents_os/ui/js/pipeline-monitor-core.js` | Constitution map **must not** hardcode routing; source from `_DOMAIN_PHASE_ROUTING` export or `phase_routing.json` — **D-04 extension (Architectural Review A3)** |
| `documentation/docs-governance/04-PROCEDURES/PIPELINE_SMOKE_TESTS_v1.0.0.md` | Tier-2 SMOKE_01..03 procedure — **LOD200 §2.9, D-03** |

**Current pipeline state (awareness):** `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` — verify after migration tests.

---

## §3 — Binding Clarifications (Team 00–approved — verbatim from Team 100 mandate §2 / Architectural Review §3)

### 3.1 — Migration: No save() Inside Pydantic Validator

**BINDING CONSTRAINT:**

The `@model_validator(mode="after")` on `PipelineState` (LLD400 §17.2) MUST:
- Update ONLY in-memory fields: `current_gate`, `current_phase`, `gate_state`, `remediation_cycle_count`
- NOT call `self.save()` — save() causes file I/O on every model instantiation, including in tests

The `PipelineState.load(domain)` classmethod MUST:
- Run migration logic after `model_validate()` (single path: `@model_validator` from §17.2 updates in-memory fields; **do not** use superseded §1 `_perform_migration()`)
- Call `self.save()` ONLY if migration was applied (was_migrated=True)
- Log the migration event ONLY inside `load()`, never inside the validator

The `_MIGRATION_TABLE` is a module-level dict in `pipeline.py`.
The validator reads from it. **No file I/O inside validators — ever.**

LLD400 §17.2 describes the validator structure. The `load()` classmethod skeleton in LLD400 §1
shows the correct structure (steps 4→6: migrate → validate → if was_migrated: save).

### 3.2 — Single Migration Implementation

**BINDING CONSTRAINT:**

LLD400 §1 shows `_perform_migration()` as a static method (dict-based).
LLD400 §17.2 shows `_run_migration()` as the model validator approach.

**Team 61 implements ONLY the `@model_validator` approach from §17.2.**
The static `_perform_migration()` from §1 is superseded by §17.2.
The migration table name is `_MIGRATION_TABLE` (module-level constant in `pipeline.py`).

There MUST be exactly ONE migration code path. No dual implementations.

### 3.3 — "pipeline" Sentinel Handling

**BINDING CONSTRAINT:**

When `_resolve_phase_owner()` returns `"pipeline"`:
- The gate/phase is an **auto-action**, not a team prompt
- No prompt text is generated
- The pipeline performs the action automatically (e.g., write program to registry)
- Phase advances immediately after auto-action completes
- Applicable: `GATE_1 Phase 1.2` (program registration)

The `_generate_gate1_prompt()` function must check for `"pipeline"` ownership and branch into
the auto-action path. Team 61 must specify in their implementation exactly what the
auto-action writes (see LOD200 D-09 and GATE_SEQUENCE_CANON §3).

**Note (Team 11 clarification — non-binding addendum):** Mandate text “LOD200 D-09” overlaps naming with LLD400 **D-09** (`CanonicalPathBuilder`). For Phase **1.2** auto-action, implement **WP/program registry** writes per **GATE_SEQUENCE_CANON** and **AC-WP2-16**; treat **CanonicalPathBuilder** as the separate **§4 D-09** deliverable.

### 3.4 — Phase Naming Convention

**BINDING CONSTRAINT:**

`GATE_PHASE_GENERATORS` dict key naming convention (LLD400 §17.4):
```python
_g1_1_1   # GATE_1, Phase 1.1
_g2_2_1   # GATE_2, Phase 2.1
_g2_2_1v  # GATE_2, Phase 2.1v  ← "v" suffix = validation phase
_g2_2_2   # GATE_2, Phase 2.2
_g2_2_3   # GATE_2, Phase 2.3
```
Note: `"2.1v"` is a phase string (string key in `_DOMAIN_PHASE_ROUTING`).
`process_variant="TRACK_FOCUSED"` is a separate concept — no naming collision.

### 3.5 — Legacy field `phase8_content` (Architectural Review A6)

Preserve `phase8_content: str` **as-is** for backward compatibility; do not introduce new behavior on this field in WP002; rename is **out of scope**.

---

## §4 — Deliverables Sequence (D-01..D-12)

Each row: what Team 61 (or noted owner) produces, **exact LLD400 references**, and success criterion.

| ID | Description | LLD400 references | Success criterion |
|----|-------------|-------------------|-------------------|
| **D-02** | `PipelineState` → Pydantic `BaseModel`; full field parity **§17.1**; migration via **§17.2** with **§3.1** (no `save()` in validator); `load()` saves only when migrated | §1 (superseded static migration — do not implement), **§17.1, §17.2** | Model validates JSON; migration table applied; tests do not trigger disk write on every `model_validate` |
| **D-01** | `GATE_SEQUENCE` 5 gates; `_MIGRATION_TABLE` in `pipeline.py`; `_DOMAIN_PHASE_ROUTING` **§2**; `_resolve_phase_owner` **§17.3**; `GATE_PHASE_GENERATORS` **§17.4**; per-gate generators **§3**; `CORRECTION_CYCLE_BANNER` **§4**; `GATE_ALIASES` **§5**; `FAIL_ROUTING` **§6**; `fail`/`pass` **§7**; `GATE_MANDATE_FILES` **§8**; `_write_state_view` human flag **§9** | **§2–§9, §17.3, §17.4** | Zero hardcoded team IDs in generators; routing only via `_resolve_phase_owner`; old IDs absent from active `current_gate` after load |
| **D-09** | `CanonicalPathBuilder` in `agents_os_v2/utils/path_builder.py`; `_read_coordination_file()` uses `build()` primary, glob fallback | **§12** | Build/parse round-trip for canonical filenames per LOD200 §10 |
| **D-06** | `pipeline_run.sh`: `pass [GATE_ID]`, `fail` with finding args per **§7**; align with LOD200 §2.4–2.5 | **§7**, D-06 checklist LOD200 §4 | AC-WP2-04, AC-WP2-05 satisfied |
| **D-03** | `test_certification.py`: **CERT_01..CERT_15** per **§17.5**; Tier-2 doc **PIPELINE_SMOKE_TESTS_v1.0.0.md** | **§10, §17.5**, LOD200 §2.9 | All CERT tests green in CI; smoke doc exists |
| **D-04** | Dashboard: mandate panel `GATE_3` + `phase === '3.1'`; `flags.waiting_human_approval` from `gate_state === 'HUMAN_PENDING'` **§9**; timeline labels; **monitor**: replace hardcoded phase→owners with data from `_DOMAIN_PHASE_ROUTING` export or `phase_routing.json` | **§8, §9**, Architectural Review §2 (A3) | AC-WP2-13; monitor matches pipeline routing truth |
| **D-05** | Team 90 verdict template embedded in GATE_4 Phase 4.1 prompt path; schema **§11**; parser respects `route_recommendation` rules (BLOCK only) | **§11**, LOD200 D-05 | AC-WP2-10; KB-28 closed |
| **D-07** | `KNOWN_BUGS_REGISTER` protocol **§13**; registry parity **LOD200 D-07 H-01** | **§13**, LOD200 §4 D-07 | KB-26..39 IN_REMEDIATION at GATE_3 start; CLOSED at GATE_5 |
| **D-08** | Canonical naming directive artifact (Team 100 draft → Team 00 approve) per LOD200 §10 / **§14** | **§14** | `ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md` exists |
| **D-10** | New WP002 files use canonical schema; no retroactive renames | LOD200 §10, **§14** | Spot-check new artifacts |
| **D-11** | Governance promotion: deprecation header on `04_GATE_MODEL_PROTOCOL_v2.3.0.md`; procedures point to GATE_SEQUENCE_CANON — **Team 170 lead**, Team 61 coordinates dependencies | **§14**, LOD200 D-11 | AC-WP2-17, AC-WP2-18 |
| **D-12** | SSOT audit report **Team 170** + Team 190 validation; **identity files** for teams missing them | **§14**, LOD200 D-12, Architectural Review §2 (A5) | `TEAM_170_S003_P011_WP002_GATE_5_SSOT_AUDIT_REPORT_v1.0.0.md`; `_COMMUNICATION/team_{N}/IDENTITY.md` (or equivalent) for **team_11, team_101, team_102, team_191** |

---

## §5 — Implementation Sequence (Ordered Execution Plan)

Execute in order unless noted “parallel.” **§17 overrides LLD400 §15** where they differ on sequencing details.

### Phase 1 — Foundation

1. **D-02** — Pydantic `PipelineState` + `_run_migration` validator (**§17.2 + §3.1**) + `load()` persistence only when migrated.
2. **D-01** — Full `pipeline.py` logic layer on top of D-02 (routing, generators, FAIL_ROUTING, command handlers).

### Phase 2 — Core Logic

3. **D-09** — `CanonicalPathBuilder` + wire `_read_coordination_file()`.
4. **D-06** — `pipeline_run.sh` and CLI entrypoints for `pass`/`fail`/dry-run/status/approve.
5. **D-03** — `test_certification.py` implementing **§17.5** matrix; add Tier-2 smoke procedure file.

### Phase 3 — Content Generation

6. **D-04** — Dashboard + **pipeline-monitor-core.js** routing data (no duplicate hardcoded matrix).
7. **D-05** — Team 90 verdict template in prompt path + parser alignment.

### Phase 4 — Governance, Hardening, Closure Prep

*(Team 100 mandate Phase 4 ordering **D-07 → D-08 → D-10 → D-11 → D-12** uses labels that **do not** match LOD200 §4 D-numbers; below maps mandate intent → LOD200 IDs.)*

8. **Dry-run test mode** (mandate “D-07”) — implement **`dry-run`** via **D-06** (`pipeline_run.sh`) + assert in **D-03** where applicable; no state mutation on dry-run paths.
9. **Path-safe atomic `save()`** (mandate “D-08”) — implement on **`PipelineState.save()`** per LLD400 §1 (**D-02**); temp file + rename.
10. **LOD200 D-07** — KNOWN_BUGS_REGISTER protocol (KB-26..39 in WP002 scope per LOD200 §3) + registry parity (**H-01 / AC-WP2-16**); IN_REMEDIATION at GATE_3 start, CLOSED at GATE_5.
11. **LOD200 D-08** — `ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md` (Team 100 draft → Team 00 approve).
12. **LOD200 D-10** — New WP002 outputs use canonical schema from LOD200 §10 / D-08 (no retroactive renames).
13. **LOD200 D-11** — Team 170 governance promotion (deprecation header + procedures pointer to GATE_SEQUENCE_CANON).
14. **LOD200 D-12** — Team 170 SSOT audit + identity files for team_11, team_101, team_102, team_191; Team 190 validation.

**KB-27..39 remediation** is implemented in **D-01/D-02/D-04/D-06** per LOD200 §3; register closure via **D-07**.

**Dependency notes:**
- **D-09** may proceed after D-01 partial stub only if imports are stable; preferred order above.
- **D-08** is a governance artifact; **D-10** depends on published naming ENUM from D-08/LOD200 §10.

---

## §6 — Acceptance Criteria (LOD200 §7 — AC-WP2-01..22)

| AC | Criterion | Satisfied by deliverable(s) |
|----|-----------|----------------------------|
| AC-WP2-01 | CERT_01..CERT_15 all PASS in pytest | D-03 |
| AC-WP2-02 | `agents_os` @ GATE_3/3.1 → prompt Team 11 | D-01, D-03 |
| AC-WP2-03 | `tiktrack` @ GATE_3/3.1 → prompt Team 10 | D-01, D-03 |
| AC-WP2-04 | `fail` writes `last_blocking_findings` | D-01, D-06, D-03 |
| AC-WP2-05 | `pass GATE_2` at GATE_3 aborts | D-06, D-03 |
| AC-WP2-06 | TikTrack active WP loads GATE_3/3.1 after migration | D-02, D-03 (CERT_13) |
| AC-WP2-07 | GATE_5/5.1 AOS → Team 170 | D-01, D-03 |
| AC-WP2-08 | GATE_5/5.1 TikTrack → Team 70 | D-01, D-03 |
| AC-WP2-09 | Correction banner when `remediation_cycle_count≥1` | D-01, D-03 (CERT_10) |
| AC-WP2-10 | Team 90 verdict schema; no `route_recommendation` on PASS | D-05 |
| AC-WP2-11-a | G3_PLAN → GATE_2 / 2.2 | D-02, D-03 (CERT_14) |
| AC-WP2-11-b | G3_6_MANDATES → GATE_3 / 3.1 | D-02, D-03 (CERT_13) |
| AC-WP2-12 | `pytest agents_os_v2/` — 127+ tests still PASS | All phases regression |
| AC-WP2-13 | Dashboard AOS + TikTrack | D-04 |
| AC-WP2-14 | Engine editor R/W preserved | D-04 regression |
| AC-WP2-15 | KB-26..39 CLOSED | D-07 |
| AC-WP2-16 | Registry parity at gate closes | D-07, process |
| AC-WP2-17 | 04_GATE_MODEL_PROTOCOL deprecation header | D-11 |
| AC-WP2-18 | AGENTS_OS_V2_OPERATING_PROCEDURES references GATE_SEQUENCE_CANON | D-11 |
| AC-WP2-19 | SMOKE_01 PASS (evidence) | Tier-2 + Team 90 GATE_4 |
| AC-WP2-20 | SMOKE_02 PASS | Tier-2 + Team 90 GATE_4 |
| AC-WP2-21 | SSOT audit report produced + validated | D-12 |
| AC-WP2-22 | ARCHIVED headers on superseded docs | D-12, D-11 |

---

## §7 — Certification Scenarios

### Tier 1 — pytest (`test_certification.py`) — per LLD400 **§17.5** (authoritative)

| CERT | Fixture / input | Calls | Assertions |
|------|-----------------|-------|------------|
| CERT_01 | `aos_track_focused_state` | `_generate_gate2_prompt(state)` | Team **11**, phase **2.2**, work plan instructions |
| CERT_02 | TikTrack @ GATE_2/2.2 | `_generate_gate2_prompt(state)` | Team **10** (not 11) |
| CERT_03 | AOS @ GATE_3/3.1 | `_generate_gate3_prompt(state)` | Team **11** mandate prompt |
| CERT_04 | AOS @ GATE_3/3.2 | `_generate_gate3_prompt(state)` | Team **61** |
| CERT_05 | TikTrack @ GATE_3/3.2 | `_generate_gate3_prompt(state)` | teams **20/30/40** |
| CERT_06 | AOS, `lod200_author_team=team_101` @ 4.2 | `_generate_gate4_prompt(state)` | **team_101** for 4.2 |
| CERT_07 | AOS, `lod200_author_team=team_100` @ 4.2 | `_generate_gate4_prompt(state)` | **team_100** for 4.2 |
| CERT_08 | AOS @ GATE_5/5.1 | `_generate_gate5_prompt(state)` | **team_170** (not 70) |
| CERT_09 | TikTrack @ GATE_5/5.1 | `_generate_gate5_prompt(state)` | **team_70** (not 170) |
| CERT_10 | `correction_cycle_state` | `_generate_gate3_prompt(state)` | `CORRECTION_CYCLE_BANNER` + findings text |
| CERT_11 | temp state | CLI `fail` with `--finding-type` | `last_blocking_findings`, `last_blocking_gate`, cycle increment |
| CERT_12 | temp state | `pass GATE_3` / `pass GATE_2` | Match succeeds; mismatch aborts |
| CERT_13 | `old_gate_state` (G3_6_MANDATES) | `PipelineState.load(domain)` | → GATE_3 / 3.1 + migration event |
| CERT_14 | `old_gate_state` (G3_PLAN) | `PipelineState.load(domain)` | → GATE_2 / **2.2** (BF-01) |
| CERT_15 | full simulated progression fixture | prompt generation + phase advance loop | All 5 gates + phases valid |

### Tier 2 — Smoke (manual / MCP) — LOD200 §2.9

| ID | Description |
|----|-------------|
| SMOKE_01 | Full GATE_1→GATE_5, **AOS / TRACK_FOCUSED**, real `pipeline_run.sh`, MCP state checks |
| SMOKE_02 | Full GATE_1→GATE_5, **TikTrack / TRACK_FULL** |
| SMOKE_03 | Correction cycle: fail → banner in next prompt → pass → clean state |

---

## §8 — Iron Rules

### LOD200 §6 (all 11 — Team 61 must not violate)

1. No hybrid gate sequences — no old IDs in active `current_gate` after load.
2. Every prompt generator certified — CERT_01..CERT_15 before GATE_3 close.
3. Tier-2 smoke before GATE_4 Phase 4.1 (Team 90).
4. Migration automatic on `load()`.
5. All routing domain/variant-aware; **zero** hardcoded team IDs in generators; use `_resolve_phase_owner` + `_DOMAIN_PHASE_ROUTING`.
6. `fail` always writes findings.
7. `pass` gate identifier enforced when provided.
8. No regression — 127+ tests remain green.
9. Registry parity at gate closes.
10. Governance docs updated — D-11 validated for GATE_5 closure.
11. SSOT — D-12 audit + archived superseded docs.

### Three-layer engine authority (ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04 §DECISION-WP2-04)

Resolution order for engine: **`team_engine_config.json` → `config.py` `TEAM_ENGINE_MAP` → TEAMS_ROSTER (informational only for engine)**. UI engine editor writes **only** JSON override.

---

## §9 — Out of Scope (WP002 Boundary)

Explicitly **NOT** in WP002:

- **Role-Based Team Management** (role_catalog, domain_role_defaults, wp_role_assignments) — **WP003** per DECISION-WP2-02.
- **Teams UI catalog refactor** (roster-driven runtime loading of `pipeline-teams.js` TEAMS array) — **WP003** (C2).
- **Missing TEAMS_ROSTER entries** for team_11 / 101 / 102 — **WP003** (C3) unless fixed as dependency of B2; WP002 does not expand roster schema.
- **TRACK_FAST** variant implementation — deferred (C8).
- TikTrack **feature** work outside pipeline stabilization.
- **Rename** of `phase8_content` field.
- Makefile Option B (separate mandate).

---

## §10 — GATE_3 Entry Conditions

Before GATE_3 Phase 3.1 (Team 11 mandates) / Phase 3.2 (Team 61) submission:

- [ ] All **D-01..D-12** delivered per §4 (Team 170/190 artifacts for D-11/D-12 per ownership).
- [ ] **CERT_01..CERT_15** all **PASS**.
- [ ] **SMOKE_01..SMOKE_03** executed with evidence (Tier-2), ready for Team 90 at GATE_4.
- [ ] **KB-27..KB-39** (per KNOWN_BUGS_REGISTER WP002 scope) resolved or explicitly tracked to CLOSED at GATE_5 per D-07.
- [ ] Team 90 Phase **2.2v** PASS on this Work Plan; Team 100 Phase **2.3** sign-off.

---

## §11 — Submission Header (Canonical YAML for downstream artifacts)

Team 61 GATE_3 deliverables SHOULD use headers per LOD200 §10:

```yaml
---
id: TEAM_61_S003_P011_WP002_GATE_3_PHASE_3.2_<ARTIFACT>_v1.0.0
from: Team 61
to: Team 51
cc: Team 11, Team 100
date: YYYY-MM-DD
gate: GATE_3
phase: "3.2"
wp: S003-P011-WP002
type: IMPLEMENTATION_REPORT | EVIDENCE
lod200_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
lld400_ref: _COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md
workplan_ref: _COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md
---
```

---

**log_entry | TEAM_11 | S003_P011_WP002 | GATE_2_WORKPLAN | v1.0.0 | SUBMITTED_FOR_TEAM_90_PHASE_22V | 2026-03-20**
