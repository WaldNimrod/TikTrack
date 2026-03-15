---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_00_TEAM_100_AGENTS_OS_STATE_ALIGNMENT_INTELLIGENCE_REPORT_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 00 (Chief Architect), Team 100 (AOS Architects)
cc: Team 10, Team 61, Team 170, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCHITECT_REVIEW
scope: Deep spy audit of state alignment drift across Dashboard / Roadmap / Teams runtime views
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | STATE_ALIGNMENT_INTELLIGENCE_AUDIT |
| gate_id | GOVERNANCE_PROGRAM |
| validation_authority | Team 190 |

## 1) Objective

Perform code-level reality mapping for state misalignment reported by operations:

1. Map all state sources.
2. Map full data path to UI (Dashboard, Roadmap, Teams).
3. Identify cache/refresh/fallback failure modes.
4. Verify strict domain isolation and cross-domain contamination risk.
5. Provide architect-ready remediation plan.

## 2) Ground Truth Sources (scanned)

1. `agents_os/ui/PIPELINE_DASHBOARD.html`
2. `agents_os/ui/PIPELINE_ROADMAP.html`
3. `agents_os/ui/PIPELINE_TEAMS.html`
4. `agents_os/ui/js/pipeline-config.js`
5. `agents_os/ui/js/pipeline-state.js`
6. `agents_os/ui/js/pipeline-dashboard.js`
7. `agents_os/ui/js/pipeline-roadmap.js`
8. `agents_os/ui/js/pipeline-teams.js`
9. `agents_os/ui/js/pipeline-dom.js`
10. `agents_os_v2/orchestrator/state.py`
11. `agents_os_v2/observers/state_reader.py`
12. `scripts/portfolio/build_portfolio_snapshot.py`
13. `scripts/portfolio/sync_registry_mirrors_from_wsm.py`
14. `pipeline_run.sh`
15. `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`
16. `_COMMUNICATION/agents_os/pipeline_state_agentsos.json`
17. `_COMMUNICATION/agents_os/pipeline_state.json`
18. `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`
19. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
20. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
21. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
22. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

## 3) State Source Inventory (who writes, who reads)

| Source | Writer(s) | Reader(s) | Role |
|---|---|---|---|
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | `PipelineState.save()` via `get_state_file("tiktrack")` | Dashboard/Roadmap/Teams UI; observer tooling | Domain runtime state (TikTrack) |
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | `PipelineState.save()` via `get_state_file("agents_os")` | Dashboard/Roadmap/Teams UI; observer tooling | Domain runtime state (Agents_OS) |
| `_COMMUNICATION/agents_os/pipeline_state.json` (legacy) | `PipelineState.save()` always mirrors to legacy | UI fallback; observer tooling | Backward compatibility alias (high drift risk) |
| `documentation/.../PHOENIX_MASTER_WSM_v1.0.0.md` | Gate-owner updates (by governance process) | Snapshot/sync scripts, health panel, roadmap context | Runtime SSOT |
| `documentation/.../PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Team 170 + sync script mirror | Roadmap tree/statistics | Structural catalog + mirror |
| `documentation/.../PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | Team 170 + sync script mirror | Portfolio checks/scripts | WP lifecycle mirror |
| `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | `agents_os_v2.observers.state_reader` | Dashboard health panel | Derived observer snapshot |

## 4) Data Path to UI

### 4.1 Dashboard (`PIPELINE_DASHBOARD.html`)

1. Domain selection from `localStorage.pipeline_domain` in `pipeline-state.js`.
2. `loadDomainState(currentDomain)` loads domain state file; on failure falls back to legacy `pipeline_state.json`.
3. UI cards (`WP/Stage/Gate/Owner/Engine`) built from loaded state.
4. Health panel separately loads `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` and compares with WSM-derived fields.

### 4.2 Roadmap (`PIPELINE_ROADMAP.html`)

1. `refreshAllDomainStates()` loads both domain state files into cache.
2. `loadPipelineState()` loads only `currentDomain` state into primary context.
3. Roadmap content loaded from:
   - `PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
   - `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
4. Program status resolution uses `live domain cache override` else falls back to static program row status.
5. Stage conflict check validates pipeline stage against roadmap stage status with exception table.

### 4.3 Teams (`PIPELINE_TEAMS.html`)

1. `loadState()` currently hardcodes `loadDomainState("tiktrack")`.
2. Team prompt panel therefore anchors to TikTrack state regardless of actual operator domain.
3. This is an explicit cross-view context divergence bug.

## 5) Findings (canonical)

| finding_id | severity | status | description | evidence-by-path |
|---|---|---|---|---|
| SA-01 | CRITICAL | OPEN | Teams page is a global cross-domain page by design, but runtime state strip is pinned to TikTrack (`loadDomainState("tiktrack")`). This creates representational drift (global page shows single-domain state as if canonical). | `agents_os/ui/js/pipeline-teams.js:132` |
| SA-02 | HIGH | OPEN | Legacy fallback path can silently cross domain context (`loadDomainState` fallback to `pipeline_state.json`), creating false alignment when domain file read fails. | `agents_os/ui/js/pipeline-state.js:11-31`, `agents_os/ui/js/pipeline-dashboard.js:733-736` |
| SA-03 | HIGH | OPEN | Runtime writer always mirrors every domain save into shared legacy file; this preserves contamination vector and weakens strict isolation. | `agents_os_v2/orchestrator/state.py:54-55` |
| SA-04 | HIGH | OPEN | Active-pipeline auto-detection treats sentinel values incorrectly (`NONE` not in inactive/placeholder sets). This can mark idle states as active and trigger domain ambiguity noise. | `agents_os_v2/orchestrator/state.py:86-99` |
| SA-05 | HIGH | OPEN | Roadmap status depends on registry fallback when no live match exists; stale/intentional ACTIVE rows in closed stages can appear as currently active operations. | `agents_os/ui/js/pipeline-roadmap.js:39-50`, `agents_os/ui/js/pipeline-roadmap.js:281-294`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:41` |
| SA-06 | MEDIUM | OPEN | Stage conflict checker validates only active pipeline state, not full registry active-status coherence (closed stage + ACTIVE program). This misses systemic drift class. | `agents_os/ui/js/pipeline-roadmap.js:355-385` |
| SA-07 | MEDIUM | OPEN | Health panel uses derived snapshot file that can become stale relative to direct state files; no freshness SLA guard in UI. | `agents_os/ui/js/pipeline-dashboard.js:1730-1781`, `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` |
| SA-08 | MEDIUM | OPEN | Sentinel vocabulary is duplicated across scripts and inconsistent (`N/A`, `NONE`, textual variants), creating check drift and false failures. | `scripts/portfolio/build_portfolio_snapshot.py:352`, `scripts/portfolio/sync_registry_mirrors_from_wsm.py:26` |
| SA-09 | LOW | OPEN | Cache busting exists for data fetches, but static JS uses manual `?v=` versioning; if version not bumped across deploys, browser can execute stale logic. | `agents_os/ui/PIPELINE_ROADMAP.html:161-164`, `agents_os/ui/PIPELINE_DASHBOARD.html:11-13` |

## 6) Domain Isolation Verdict

| control | expected | observed | verdict |
|---|---|---|---|
| Separate domain state files | strict separation | Implemented (`pipeline_state_tiktrack.json`, `pipeline_state_agentsos.json`) | PASS |
| Command domain propagation | no accidental cross-domain pass/fail | Implemented via `--domain` and `_dfCmd` | PASS |
| Global pages semantics (Teams/Roadmap) | global pages must present explicit multi-domain truth (not implicit single-domain anchor) | Teams state strip is TikTrack-anchored; Roadmap mixes global and selected-domain context without strict provenance labels | FAIL |
| Legacy compatibility path | allowed but non-contaminating | Legacy fallback and legacy mirror can mask domain errors | FAIL |

## 7) Why operators see mismatched statuses

Primary mechanism is not one bug; it is a multi-source model with mixed semantics:

1. `Dashboard` = selected domain state + snapshot-derived health.
2. `Roadmap` = selected domain state + all-domain live cache + markdown registries.
3. `Teams` = forced TikTrack state (current implementation).

With this topology, two pages can be internally correct relative to different sources and still disagree in operator view.

## 7.1 Clarification applied (architect input)

1. Teams page is intentionally cross-domain; it must not behave like a domain-separated page.
2. Roadmap page is intentionally cross-domain; issue is incorrect state presentation/provenance, not the existence of both domains in one page.
3. Therefore, the defect class is **state provenance ambiguity**, not “domain split missing” in those pages.

## 8) Remediation Plan (architectural)

### P0 (execute now)

1. Replace Teams page pinned state with explicit global-state model (or remove single-state strip if global aggregation is not ready).
2. Tighten active-state detection in `state.py` (treat `NONE` and `COMPLETE` as inactive sentinels where required).
3. Remove runtime legacy fallback behavior for operational UI paths (no silent fallback); fail-fast with explicit operator message and structured debug log.
4. Add “source badge” per status block (e.g., `STATE: domain_file`, `STATE: legacy_fallback`, `STATUS: registry_mirror`) so operators see provenance.

### P1 (next sprint)

1. Centralize sentinel definitions in one canonical constants module (used by state manager + snapshot + sync scripts + UI).
2. Extend roadmap conflict validator to detect `ACTIVE program in COMPLETED/CLOSED stage` unless explicit authorized exception exists.
3. Add snapshot freshness guard (`produced_at_iso` age threshold + warning severity).

### P2 (structural hardening)

1. Introduce one generated read-model (e.g., `STATE_VIEW.json`) built from WSM + domain states + mirrors.
2. All three pages consume the same read-model only.
3. Keep raw files for audit, not for direct UI mixing.

## 8.1 Fallback Governance Policy (requested update)

**Policy lock requested:** in operational state flows, fallback to legacy/alternate sources is prohibited for runtime truth.

Required behavior:

1. Do not substitute another source when primary source fails.
2. Show explicit error to operator (`PRIMARY_STATE_READ_FAILED`).
3. Show structured diagnostic block: source path, HTTP/file error, timestamp, domain context, suggested recovery command.
4. Emit machine-readable log entry for audit.

## 8.2 Fallback Scan — additional fallback points in Agents OS system

| fallback_id | severity | location | current behavior | required policy action |
|---|---|---|---|---|
| FB-01 | HIGH | `agents_os/ui/js/pipeline-state.js:11-31` | Domain read failure falls back to `pipeline_state.json` silently (badge only). | Remove fallback; hard error with operator log payload. |
| FB-02 | HIGH | `agents_os/ui/js/pipeline-dashboard.js:733-736` | Progress Check retries legacy state file when domain read fails. | Remove legacy fallback; return explicit diagnostics. |
| FB-03 | HIGH | `agents_os_v2/orchestrator/state.py:54-55` | Every save mirrors to legacy `pipeline_state.json`. | Stop mirror write (or mark deprecation-only path and non-runtime). |
| FB-04 | HIGH | `agents_os_v2/orchestrator/state.py:130-134` | Load() falls back to legacy file when no active pipeline. | Replace with explicit `NO_ACTIVE_PIPELINE` state object; no legacy read as runtime source. |
| FB-05 | MEDIUM | `agents_os_v2/observers/state_reader.py:84-95` | Observer includes legacy state block in snapshot. | Keep only as deprecated audit field, not runtime signal; mark clearly non-authoritative. |
| FB-06 | MEDIUM | `agents_os/ui/js/pipeline-teams.js:468` | UI text still instructs generic `pipeline_state.json`. | Update UX text to domain-specific/global canonical source only. |
| FB-07 | MEDIUM | `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md:40-50` | Documentation still defines legacy fallback as normal behavior. | Update docs to “no runtime fallback” policy. |
| FB-08 | MEDIUM | `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md:104-105` | Architecture text states explicit fallback to legacy path. | Update architecture contract to strict-source behavior. |

## 9) Architect Decisions Requested

1. Approve P0 immediate implementation as hotfix governance package.
2. Approve fallback-removal policy: no operational runtime fallback; explicit error+log only.
3. Approve single read-model architecture (P2) as mandatory for cross-page consistency.

## 10) Operational Evidence (runtime reality)

Current files at audit time:

1. `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` => `work_package_id: NONE`, `current_gate: NONE`.
2. `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` => `work_package_id: S002-P005-WP002`, `current_gate: COMPLETE`.
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` includes `S001-P002` with `status=ACTIVE` under `S001` (roadmap stage marked `COMPLETED`).

This confirms the dashboard/roadmap/teams divergence class is structurally reproducible from present data model.

---

**overall_result:** BLOCK_FOR_FIX (architectural consistency)
**route_recommendation:** FULL (P0 mandatory before further UI governance expansion)

**log_entry | TEAM_190 | STATE_ALIGNMENT_INTELLIGENCE_AUDIT | SUBMITTED_TO_TEAM_00_TEAM_100 | 2026-03-15**
