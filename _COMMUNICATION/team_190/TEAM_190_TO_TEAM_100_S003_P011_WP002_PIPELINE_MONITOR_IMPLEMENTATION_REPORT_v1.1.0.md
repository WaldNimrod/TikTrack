---
id: TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.1.0
historical_record: true
from: Team 190 (Constitutional Validator / Architectural Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 61, Team 170, Team 101
date: 2026-03-20
status: SUBMITTED_ADDENDUM
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
scope: Pipeline monitor implementation + strategic proposal for role-based team management
supersedes: TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.0.0---

## 1) Executive Summary
This addendum keeps the original monitor implementation outcome and adds a strategic proposal requested by Team 00:

1. Each process variant defines required process roles.
2. Each work package (WP) carries `domain` + `process_variant`, and derives required roles.
3. Each domain defines default `role -> team` mapping.
4. At WP activation, system materializes WP-specific `role -> team` assignments.
5. User can override assignments per WP (UI or architectural request), with governance validation.

Target outcome: dynamic operational flexibility (quality/cost/environment optimization) without breaking canonical governance or active pipeline flow.

---

## 2) What Was Already Implemented (v1.0.0 baseline)
- Read-only monitor page + dashboard menu integration.
- Dual-domain runtime visibility (`tiktrack` + `agents_os`).
- Track-aware phase map and canonical expected outputs.
- Non-interference contract (no state mutation, no pipeline commands).

Reference:
- `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.0.0.md`

---

## 3) Full Intelligence Findings ("Spy" layer)

### 3.1 Evidence matrix: where the current model is still hardcoded

| finding_id | severity | finding | evidence-by-path | impact |
|---|---|---|---|---|
| RBTM-F01 | HIGH | Ownership logic still hardcoded in orchestrator table instead of role catalog. | `agents_os_v2/orchestrator/pipeline.py:85`, `agents_os_v2/orchestrator/pipeline.py:90`, `agents_os_v2/orchestrator/pipeline.py:94` | Any new variant/domain rule requires code edits (slow, risky). |
| RBTM-F02 | HIGH | Legacy + new gate ownership coexist in runtime config (hybrid). | `agents_os_v2/orchestrator/pipeline.py:77`, `agents_os_v2/orchestrator/pipeline.py:107`, `agents_os_v2/orchestrator/pipeline.py:122` | Increases routing drift risk and governance ambiguity. |
| RBTM-F03 | HIGH | Monitor constitution map uses hardcoded phase->owners matrix. | `agents_os/ui/js/pipeline-monitor-core.js:55`, `agents_os/ui/js/pipeline-monitor-core.js:96`, `agents_os/ui/js/pipeline-monitor-core.js:191` | UI truth can diverge from orchestrator truth. |
| RBTM-F04 | HIGH | Teams page still uses hardcoded team catalog (`TEAMS`) despite roster SSOT note. | `agents_os/ui/js/pipeline-teams.js:15`, `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json:7` | Structural SSOT violation; dual maintenance burden. |
| RBTM-F05 | MEDIUM | Domain default variant exists, but no persisted WP-level role assignment artifact. | `agents_os_v2/config.py:122` | No deterministic audit trail for per-WP role overrides. |
| RBTM-F06 | MEDIUM | Engine config is team-centric only (`team -> engine`) with no role context. | `agents_os_v2/config.py:24`, `agents_os/ui/js/pipeline-teams.js:197` | Cannot optimize engine by role semantics (only by static team id). |
| RBTM-F07 | MEDIUM | Governance role mapping defines responsibilities but not machine-readable role-binding registry. | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md:17` | Policy exists in docs, but runtime binding cannot be validated automatically. |

### 3.2 Positive assets we can build on

| asset | evidence-by-path | reuse value |
|---|---|---|
| Domain default variant mechanism | `agents_os_v2/config.py:122` | Direct base for role-resolution priority chain. |
| Roster with 4-layer team data | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json:11` | Strong source for team eligibility and domain constraints. |
| Teams page drilldown + context audit | `agents_os/ui/js/pipeline-teams.js:356` | Ready UI shell for exposing role-binding internals and gaps. |
| Monitor track toggles + phase visibility | `agents_os/ui/js/pipeline-monitor-core.js:22` | Ready UX pattern for variant-switching and structure/state split. |

---

## 4) Architectural Proposal (Role-Based Team Management)

### 4.1 Canonical model
1. Process Variant Role Catalog:
   - Defines roles required per gate/phase for each variant.
2. Domain Default Role Bindings:
   - Maps each role to default team per domain.
3. WP Role Assignment (materialized):
   - Concrete `role -> team` table for one WP, generated at activation.
4. Override policy:
   - User/architect can override `role -> team` for a specific WP only, with validation and audit log.

### 4.2 Role examples (illustrative)

| role_id | semantic role | sample phases |
|---|---|---|
| `ROLE_GATEWAY_WORKPLAN` | Gateway workplan author | `GATE_2/2.2`, `GATE_3/3.1` |
| `ROLE_IMPL_BACKEND` | Backend implementor | `GATE_3/3.2` |
| `ROLE_IMPL_FRONTEND` | Frontend implementor | `GATE_3/3.2` |
| `ROLE_QA_EXECUTION` | QA executor | `GATE_3/3.3` |
| `ROLE_ARCH_REVIEW` | Architecture reviewer | `GATE_2/2.3`, `GATE_4/4.2` |
| `ROLE_DOC_CLOSURE` | Closure documentation owner | `GATE_5/5.1` |

### 4.3 Resolution algorithm (deterministic)
Given `(domain, process_variant, work_package_id, gate, phase)`:
1. Resolve required role from variant role catalog.
2. Resolve team by precedence:
   - WP override binding (highest)
   - Domain default binding
   - Fallback binding from variant baseline
3. Validate constraints:
   - team exists in roster
   - team domain eligibility fits domain/variant
   - team active status
4. Persist assignment trace in WP role-assignment file.

---

## 5) Proposed Data Contracts (machine-readable)

### 5.1 New files

| file | purpose | owner |
|---|---|---|
| `_COMMUNICATION/agents_os/role_catalog.json` | Variant->role->phase contract | Team 100/170 (approved by Team 00) |
| `_COMMUNICATION/agents_os/domain_role_defaults.json` | Domain default `role -> team` | Team 100/170 |
| `_COMMUNICATION/agents_os/wp_role_assignments/{work_package_id}.json` | Materialized WP-specific bindings + overrides | Pipeline runtime (Team 61 implementation) |

### 5.2 WP assignment schema (minimal)

| field | type | description |
|---|---|---|
| `work_package_id` | string | canonical WP id |
| `domain` | string | `tiktrack` / `agents_os` |
| `process_variant` | string | `TRACK_FULL` / `TRACK_FOCUSED` / `TRACK_FAST` |
| `role_bindings` | object | `role_id -> team_id` |
| `binding_source` | object | `default` / `override` per role |
| `updated_by` | string | actor/team |
| `updated_at` | string | UTC timestamp |

---

## 6) UI/UX Integration Plan (non-overloaded, modular)

### 6.1 Teams page (Phase 1 extension)
Add modular accordion containers:
1. `Role Architecture (Structure)`
   - Variant -> roles -> gate/phase matrix.
2. `Domain Defaults`
   - Domain `role -> team` defaults.
3. `Active WP Responsibility Chain`
   - Per active WP: resolved role->team chain + source (default/override).
4. `Drilldown`
   - Raw JSON viewer for role catalog/defaults/WP assignment file.

### 6.2 Future Team Management page (Phase 2)
- Editable role bindings per WP with preview/diff/validation.
- Save guarded by policy checks and audit event write.

---

## 7) Non-Interference Guardrails (mandatory)
1. Read-only monitor remains read-only.
2. Role-binding materialization runs at WP activation only.
3. No implicit reassignment during active gate execution.
4. Override changes require explicit user/architect action and produce auditable event.
5. Active WP execution path remains uninterrupted by UI-only browsing actions.

---

## 8) Implementation Recommendations (ordered)

| priority | recommendation | rationale |
|---|---|---|
| P1 | Introduce `role_catalog.json` + `domain_role_defaults.json` and wire resolver in orchestrator. | Removes hardcoded routing from multiple files. |
| P1 | Materialize per-WP role assignment on activation (`wp_role_assignments/{wp}.json`). | Deterministic runtime + auditability. |
| P1 | Refactor `pipeline.py::_resolve_phase_owner` to use role resolver only. | Single canonical routing source. |
| P2 | Refactor monitor/teams UI to read role catalog and WP assignment instead of hardcoded phase owners. | Prevent UI/runtime drift. |
| P2 | Extend engine editor from `team->engine` to optional `role->preferred_engine` profile (advisory). | Enables role-aware optimization under cost/quality constraints. |
| P3 | Add policy validator + tests for illegal bindings (domain mismatch, inactive team, missing identity). | Governance-safe dynamic flexibility. |

---

## 9) Risks and Mitigations

| risk | severity | mitigation |
|---|---|---|
| Dual-source truth during migration | HIGH | Run with compatibility bridge + parity tests until cutover complete. |
| Misbinding critical roles by manual override | HIGH | Enforce validation + required approval path + rollback to previous binding snapshot. |
| UI complexity overload | MEDIUM | Keep summary-first cards + accordion drilldown only for details. |
| Runtime performance overhead | LOW | Cache role catalogs and read WP assignment once per command cycle. |

---

## 10) Decisions Requested from Team 100 / Team 00
1. Approve role-based architecture as canonical direction for Team Management.
2. Approve new JSON contracts (`role_catalog`, `domain_role_defaults`, `wp_role_assignments`).
3. Decide approval policy for WP-level overrides:
   - `A` Team 00 approval always
   - `B` Team 100 approval + Team 00 awareness
   - `C` Team 00 only for high-impact roles (architect, QA, closure)
4. Confirm whether `TRACK_FAST` enters same role-binding framework now or in later phase.

---

## 11) Final Constitutional Position (Team 190)
The proposed model is constitutionally aligned and strategically correct, provided the system keeps:
- one deterministic resolver,
- auditable WP-level materialized bindings,
- strict non-interference with active gate execution,
- and explicit override governance.

---

log_entry | TEAM_190 | S003_P011_WP002 | PIPELINE_MONITOR_REPORT_ADDENDUM_ROLE_BASED_TEAM_MANAGEMENT | SUBMITTED_ADDENDUM | 2026-03-20
