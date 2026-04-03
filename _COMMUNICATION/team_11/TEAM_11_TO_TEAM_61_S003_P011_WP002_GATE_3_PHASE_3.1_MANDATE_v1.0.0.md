---
id: TEAM_11_TO_TEAM_61_S003_P011_WP002_GATE_3_PHASE_3.1_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS Implementation)
cc: Team 51, Team 90, Team 100, Team 101, Team 170, Team 190, Team 00
date: 2026-03-20
gate: GATE_3
phase: "3.1"
wp: S003-P011-WP002
program: S003-P011
domain: agents_os
process_variant: TRACK_FOCUSED
type: IMPLEMENTATION_MANDATE
status: ACTIVE
spec_source: TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1
requirements_source: TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1
workplan_source: TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0
gate2_handoff: TEAM_90_TO_TEAM_11_S003_P011_WP002_GATE_2_PHASE_2.2v_PASS_HANDOFF_v1.0.0.md
architect_context: Following Chief Architect / Team 100 approval of Work Plan v1.0.0 and task breakdown; GATE_3 Phase 3.2 execution authorized for Team 61.---

# TEAM 11 → TEAM 61 | GATE_3 Phase 3.1 — Implementation Mandate
## S003-P011-WP002 — Pipeline Stabilization & Hardening

---

## §0 — Executive Order

**You are Team 61.** Implement **all** WP002 deliverables **D-01 through D-12** per the **approved Work Plan** and **LLD400 v1.0.1**, with **§17 (Blocking Findings Closure Addendum)** as the **authoritative** contract wherever §1..§16 conflict.

**QA:** After implementation evidence is complete, **Team 51** executes full QA per:
`_COMMUNICATION/team_51/TEAM_11_TO_TEAM_51_S003_P011_WP002_FULL_QA_REQUEST_v1.0.0.md`

**Do not** invent gate IDs, team IDs, or state field names not present in LLD400 §17.1 / LOD200.

**Awareness:** Pending architectural decisions may exist for Team 100 — see  
`_COMMUNICATION/team_90/TEAM_90_TO_TEAM_100_S003_P011_WP002_POST_VALIDATION_PENDING_ARCH_DECISIONS_v1.0.0.md` — do not block D-01/D-02/D-03 on unrelated decisions unless Team 100 explicitly holds implementation.

---

## §1 — Mandatory Identity Header (Program)

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P011 |
| work_package_id | S003-P011-WP002 |
| task_id | GATE_3_PHASE_3_2_IMPLEMENTATION |
| gate_id | GATE_3 |
| phase | 3.2 (implementation execution under this mandate) |
| phase_owner | Team 61 |
| project_domain | agents_os |
| lod200_author_team | team_101 |

---

## §2 — Authority Stack (Read Order)

| Priority | Document | Path |
|----------|----------|------|
| 1 | LLD400 v1.0.1 — **§17** | `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md` |
| 2 | LOD200 v1.0.1 | `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md` |
| 3 | Work Plan v1.0.0 | `_COMMUNICATION/team_11/TEAM_11_S003_P011_WP002_GATE_2_WORKPLAN_v1.0.0.md` |
| 4 | Architectural Review | `_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md` |
| 5 | DECISION-WP2-02/03/04 | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04_v1.0.0.md` |
| 6 | GATE_SEQUENCE_CANON | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md` |

---

## §3 — Binding Implementation Constraints (Non-Negotiable)

Reproduce in code/comments as needed; full text in **Work Plan §3** — summary:

| ID | Rule |
|----|------|
| BC-01 | `@model_validator` for migration: **in-memory only** — **NO `save()`** inside validator |
| BC-02 | **`PipelineState.load()`** calls **`save()` only if `was_migrated=True`**; log migration **only** in `load()` |
| BC-03 | **Single migration path:** `@model_validator` per **§17.2**; **`_MIGRATION_TABLE`** module-level in `pipeline.py`; **no** duplicate `_perform_migration()` from LLD400 §1 |
| BC-04 | **`pipeline` sentinel:** auto-action, no team prompt; document what is written (registry / WP parity per AC-WP2-16) |
| BC-05 | **`GATE_PHASE_GENERATORS`** naming: `_g1_1_1`, `_g2_2_1v`, etc. per **§17.4** |
| BC-06 | Preserve **`phase8_content`** — no rename, no new semantics (Arch Review A6) |

---

## §4 — File Manifest (Team 61 Touch List)

| Path | Mandate |
|------|---------|
| `agents_os_v2/orchestrator/state.py` | Pydantic `PipelineState` **§17.1**; migration **§17.2** + BC-01..BC-03; atomic `save()` (temp+rename) |
| `agents_os_v2/orchestrator/pipeline.py` | `GATE_SEQUENCE` (5 gates); `_MIGRATION_TABLE`; `_DOMAIN_PHASE_ROUTING` **§2**; `_resolve_phase_owner` **§17.3**; `GATE_PHASE_GENERATORS` **§17.4**; `_generate_gate1..5_prompt`; `CORRECTION_CYCLE_BANNER`; `GATE_ALIASES`; `FAIL_ROUTING` **§6**; `fail`/`pass` **§7**; `GATE_MANDATE_FILES` **§8**; `_write_state_view` **§9** |
| `agents_os_v2/utils/path_builder.py` | `CanonicalPathBuilder` **§12** |
| `agents_os_v2/tests/test_certification.py` | **CERT_01..CERT_15** per **§17.5** |
| `pipeline_run.sh` | `pass [GATE_ID]`, `fail` + finding args, `dry-run`, `status`, `approve` as spec’d |
| `agents_os/ui/js/pipeline-dashboard.js` | Mandate panel: `GATE_3` + `phase === '3.1'`; timeline labels |
| `agents_os/ui/js/pipeline-monitor-core.js` | **No hardcoded** phase→owner matrix — consume `_DOMAIN_PHASE_ROUTING` export **or** `phase_routing.json` (Arch Review A3) |
| `documentation/docs-governance/04-PROCEDURES/PIPELINE_SMOKE_TESTS_v1.0.0.md` | Tier-2 SMOKE_01..03 procedure (**create** if missing per D-03) |
| `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` (or active path) | D-07: KB-26..39 lifecycle per LLD400 §13 / LOD200 §3 |

**Team 170 / Team 100 ownership (coordinate — do not usurp):**

- `ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0.md` (D-08)
- `04_GATE_MODEL_PROTOCOL_v2.3.0.md` deprecation header + `AGENTS_OS_V2_OPERATING_PROCEDURES` update (D-11)
- `TEAM_170_S003_P011_WP002_GATE_5_SSOT_AUDIT_REPORT_v1.0.0.md` + `IDENTITY.md` for team_11, team_101, team_102, team_191 (D-12)

---

## §5 — Execution Sequence (Ordered — Work Plan §5)

Execute in order unless Team 100 issues a variance.

### Phase 1 — Foundation
1. **D-02** — Pydantic state + migration validator + conditional `load()` save.
2. **D-01** — Full `pipeline.py` orchestration layer.

### Phase 2 — Core Logic
3. **D-09** — `CanonicalPathBuilder` + `_read_coordination_file()` integration.
4. **D-06** — `pipeline_run.sh` + CLI wiring.
5. **D-03** — `test_certification.py` + **PIPELINE_SMOKE_TESTS** doc.

### Phase 3 — Content Generation
6. **D-04** — Dashboard + monitor routing data.
7. **D-05** — Team 90 verdict template in GATE_4 Phase 4.1 prompt + parser rules (**route_recommendation** BLOCK only).

### Phase 4 — Governance Alignment & Hardening
8. **Dry-run** — no state mutation on dry-run paths (via D-06/D-03).
9. **Atomic save** — confirm on `PipelineState.save()`.
10. **LOD200 D-07** — KNOWN_BUGS_REGISTER: IN_REMEDIATION at start of GATE_3 implementation window; target CLOSED at GATE_5; registry parity **AC-WP2-16**.
11. **LOD200 D-08** — unblock with Team 100/00 on naming directive presence.
12. **LOD200 D-10** — new files follow canonical naming.
13. **LOD200 D-11 / D-12** — support Team 170 with evidence; do not substitute for Team 170 authored governance packages.

**KB-27..39:** remediate in code per LOD200 §3 table; track in register per D-07.

---

## §6 — Certification & Acceptance (Team 61 Pre-Submit)

Before requesting **Team 51** QA:

| Gate | Requirement |
|------|-------------|
| CERT | `pytest agents_os_v2/tests/test_certification.py -v` — **15/15 PASS**; map each test to **§17.5** row |
| REG | `pytest agents_os_v2/ -v` — **≥127** existing tests PASS (AC-WP2-12); document new baseline if count changed |
| CLI | Demonstrate **AC-WP2-04, AC-WP2-05** via `pipeline_run.sh` or documented `python3 -m agents_os_v2.orchestrator.pipeline` equivalent |
| MIG | **CERT_13, CERT_14** prove **G3_6_MANDATES→3.1** and **G3_PLAN→2.2** |

Full AC list: **Work Plan §6** (AC-WP2-01..22). Team 51 will re-verify against **FULL_QA_REQUEST**.

---

## §7 — Tier-2 Smoke (Evidence for Team 90 / GATE_4)

Team 61 SHALL produce **runnable notes or scripts** in the smoke procedure doc so **SMOKE_01..03** can be executed:

- **SMOKE_01** — AOS TRACK_FOCUSED GATE_1→GATE_5 + state file checks  
- **SMOKE_02** — TikTrack TRACK_FULL same  
- **SMOKE_03** — fail → correction banner → pass → clean state  

LOD200 Iron Rule #3: Tier-2 required before **GATE_4 Phase 4.1** (Team 90).

---

## §8 — Out of Scope (Do Not Implement)

Per **Work Plan §9** / **DECISION-WP2-02**: no role_catalog, no role resolver, no `pipeline-teams.js` roster refactor (WP003), no TRACK_FAST, no `phase8_content` rename, no TikTrack feature work outside pipeline stabilization.

---

## §9 — Deliverables to `_COMMUNICATION/team_61/` (Evidence)

Publish (minimum):

| Artifact | Purpose |
|----------|---------|
| `TEAM_61_S003_P011_WP002_GATE_3_PHASE_3.2_IMPLEMENTATION_COMPLETE_v1.0.0.md` | File list, commands run, pytest summary, migration proof |
| Optional: evidence JSON / logs | Attach paths referenced in completion doc |

Then **notify Team 51** to run:  
`TEAM_11_TO_TEAM_51_S003_P011_WP002_FULL_QA_REQUEST_v1.0.0.md`

**Expected QA report path (Team 51):**  
`_COMMUNICATION/team_51/TEAM_51_S003_P011_WP002_QA_REPORT_v1.0.0.md`

---

## §10 — Pipeline Advancement

**Team 11 does not auto-advance the pipeline.** After Team 51 QA and internal closure, **Nimrod** / gateway runs the canonical pass command per domain policy (e.g. `./pipeline_run.sh --domain agents_os pass` when appropriate).

---

## §11 — Risk Register (Team 61 Mitigations)

| Risk | Mitigation |
|------|------------|
| Migration corrupts active state | Backup state JSON before first migration run; CERT_13/14 as regression |
| Monitor JSON drift from Python | Single export path from `pipeline.py` or generated snapshot checked in CI |
| Dual migration paths | Code review for single `@model_validator` + `_MIGRATION_TABLE` only |
| Governance doc edits without Team 170 | Route D-11/D-12 text changes through Team 170 |

---

**log_entry | TEAM_11 | S003_P011_WP002 | GATE_3_PHASE_3.1_MANDATE | v1.0.0 | ISSUED_TO_TEAM_61 | TRACK_FOCUSED | 2026-03-20**
