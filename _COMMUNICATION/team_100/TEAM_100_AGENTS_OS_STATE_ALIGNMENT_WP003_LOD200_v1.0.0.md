---
project_domain: AGENTS_OS
id: TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 61 (AOS Implementation), Team 51 (AOS QA), Team 10 (Orchestration), Team 170 (Docs), Team 190 (Constitutional Validation)
cc: Team 00, Nimrod
date: 2026-03-15
historical_record: true
status: APPROVED_FOR_EXECUTION
scope: LOD200 — S002-P005-WP003 AOS State Alignment & Governance Integrity Package
in_response_to: TEAM_190_TO_TEAM_100_AGENTS_OS_STATE_ALIGNMENT_EXECUTION_PACKAGING_PROMPT_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| task_id | AOS_STATE_ALIGNMENT_LOD200 |
| gate_id | GATE_0 (pending Team 190 scope validation) |
| phase_owner | Team 100 (LOD200 authority) → Team 10 (execution intake at GATE_3) |
| domain | AGENTS_OS |

---

## 1. Executive Summary

**Work Package:** S002-P005-WP003
**Name:** AOS State Alignment & Governance Integrity
**Program:** S002-P005 (ADR-031 Stage A + UI Optimization — continuing program)
**Authority:** Team 100 LOD200 + Team 190 GATE_0 validation required before GATE_3 intake

This WP addresses the 8 consolidated state-alignment findings (CS-01..CS-08) identified by Team 61 + Team 190, absorbs approved ideas (IDEA-002, IDEA-003, IDEA-005, IDEA-036), and establishes deterministic state provenance across Dashboard, Roadmap, and Teams pages.

Root cause (single statement): The AOS pipeline UI uses multiple state sources (domain JSON files, registry markdown, WSM, snapshot) without a deterministic read priority order, explicit source labeling, or fallback prohibition — producing representational drift that operators cannot diagnose from the UI alone.

---

## 2. Program Activation Decision

**Decision: Option A — Reopen S002-P005 with WP003**

| Factor | Assessment |
|---|---|
| Constitutional validity | PASS — WP003 was pre-registered in S002-P005 backlog; adding WPs to an ongoing program is standard practice |
| Registry status | S002-P005: COMPLETE → ACTIVE (restored on WP003 open) |
| WSM update | active_program_id remains S002-P005; active_work_package_id = S002-P005-WP003 on GATE_3 intake |
| Option B rejected | Creating S002-P006 adds registry overhead with no architectural benefit; WP003 scope is continuous with S002-P005 remit |
| ADR-031 sequence | S002-P005 (Stage A) → S003-P007 (Stage B) → S004-P008 (Stage C); WP003 extends Stage A plumbing without conflicting |

**Registry change required:**
- `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` — S002-P005 status: COMPLETE → ACTIVE (Team 170 mandate)
- `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` — Add WP003 row: `S002-P005 | S002-P005-WP003 | IN_PROGRESS | GATE_0 | true | AOS State Alignment & Governance Integrity` (Team 170 mandate, after GATE_0 PASS)

---

## 3. Scope

### 3.1 In Scope

| Area | Files / Targets |
|---|---|
| AOS UI — JavaScript | `agents_os/ui/js/pipeline-state.js`, `pipeline-teams.js`, `pipeline-dashboard.js`, `pipeline-config.js` |
| AOS UI — Python backend | `agents_os_v2/orchestrator/state.py`, `agents_os_v2/orchestrator/pipeline.py` |
| AOS UI — Observer | `agents_os_v2/observers/state_reader.py` |
| Portfolio scripts | `scripts/portfolio/build_portfolio_snapshot.py`, `scripts/portfolio/sync_registry_mirrors_from_wsm.py` |
| AOS HTML pages | `agents_os/ui/PIPELINE_TEAMS.html` (SA-01 fix) |
| Documentation | `documentation/docs-agents-os/03-CLI-REFERENCE/PIPELINE_STATE_AND_BEHAVIOR_v1.0.0.md`, `documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_ARCHITECTURE_OVERVIEW.md` |
| Idea absorptions | IDEA-002 (Teams page), IDEA-003 (Docs Audit), IDEA-005 (Mode 1 Routing Table), IDEA-036 (Date Governance) |

### 3.2 Out of Scope

- P2 STATE_VIEW.json unified read model → deferred to WP004 (architectural scope too broad for WP003)
- IDEA-007 (Ideas Pipeline Phase 2) → WP004 as registered
- IDEA-018 (Stage transitions + roadmap management) → S004 candidate, no action until S003 stable
- IDEA-037 (Cross-Team Skills Program) → separate strategic decision; OUT_OF_SCOPE_FOR_THIS_WP
- No WSM policy rewrite (out of Team 61 authority)
- No TikTrack domain code (separate domain)

---

## 4. Findings Acceptance & Acceptance Criteria

| finding_id | severity | Team 100 verdict | AC (testable, deterministic) | Owner |
|---|---|---|---|---|
| CS-01 | CRITICAL | APPROVED | Each status-bearing display block in Dashboard/Roadmap/Teams shows a visible source badge: `[domain_file]`, `[registry_mirror]`, `[snapshot]`, or `[legacy_fallback]`. Badge must render correctly in browser; wrong source = AC FAIL | Team 61 |
| CS-02 | CRITICAL | APPROVED | `pipeline.py` / `pipeline_run.sh`: after any gate transition, a gate ID cannot appear in both `gates_completed` AND `gates_failed` simultaneously. AC: automated assert in pipeline test suite checks this invariant on every state write | Team 61 |
| CS-03 | HIGH | APPROVED | `loadDomainState()` failure (JS) shows explicit `PRIMARY_STATE_READ_FAILED` error panel with: source path, HTTP status, timestamp, domain context, recovery command. No silent substitution. Python `state.py` load failure raises explicit `NO_ACTIVE_PIPELINE` object (not legacy file read). AC: test with missing domain file → operator sees error panel, no fallback state shown | Team 61 |
| CS-04 | HIGH | APPROVED | `state.py` `is_active` / active-pipeline detection: `work_package_id = "NONE"` and `current_gate = "NONE"` or `"COMPLETE"` are treated as inactive sentinels. AC: `pipeline_state_tiktrack.json` with `work_package_id: "NONE"` → `is_active = false` in all detection paths | Team 61 |
| CS-05 | HIGH | APPROVED | Roadmap stage conflict checker: detect `program.status = ACTIVE` in a stage with `status = COMPLETE or CLOSED` → show conflict banner unless explicit `AUTHORIZED_STAGE_EXCEPTIONS` entry exists. AC: S001-P002 (ACTIVE in S001 which may be COMPLETE) → banner rendered or exception card shown | Team 61 |
| CS-06 | MEDIUM | APPROVED | `EXPECTED_FILES` in pipeline-config.js: remove hardcoded S001-P002-WP001 list. When no WP is active, section shows `"No active WP — expected files N/A"`. When WP is active, generate from WP metadata (spec_path, mandate paths). AC: no hardcoded program-specific paths; section renders accurately for active and idle states | Team 61 |
| CS-07 | LOW | APPROVED | `loadPrompt()` called with gate = `'COMPLETE'`: returns a clean "No prompt for COMPLETE gate — pipeline lifecycle closed" UI message. No 404 error, no JS exception, no broken panel. AC: navigate to COMPLETE state → prompt section shows informational message | Team 61 |
| CS-08 | MEDIUM | APPROVED | Dashboard health panel: show `snapshot_age_seconds` derived from `STATE_SNAPSHOT.json.produced_at_iso`. Warning (yellow) when age > 3600s; critical (red) when age > 86400s. AC: freshness badge visible; test with artificially old snapshot triggers correct severity | Team 61 |
| SA-01 / IDEA-002 | CRITICAL | APPROVED | Teams page (`PIPELINE_TEAMS.html` + `pipeline-teams.js`): replace single hardcoded `loadDomainState("tiktrack")` state strip with explicit global-state model showing both domains. Each domain row: WP, Gate, Stage, provenance badge. AC: Teams page renders two domain rows accurately (TikTrack + Agents_OS); no tiktrack-only anchor | Team 61 |
| IDEA-036 | MEDIUM | APPROVED | Date Governance P1+P2: canonical `date -u +%F` in all gate prompts; Team 191 push-guard lane operational; Team 190 validation-only (no push authority). AC: Team 191 operational with registered scripts; at least 3 AOS gate prompt templates updated with canonical date pattern | Team 61 + Team 191 |

---

## 5. P0 / P1 Execution Phases

### P0 — Immediate (blocking, no GATE_5 before all P0 items green)

| item | AC ref | owner |
|---|---|---|
| CS-01: Provenance badges | AC-CS-01 | Team 61 |
| CS-02: Gate contradiction fix | AC-CS-02 | Team 61 |
| CS-03: Fallback removal (JS + Python FB-01..FB-04) | AC-CS-03 | Team 61 |
| CS-04: Sentinel fix in state.py | AC-CS-04 | Team 61 |
| SA-01/IDEA-002: Teams global state strip | AC-SA-01 | Team 61 |

### P1 — Short cycle (before GATE_6)

| item | AC ref | owner |
|---|---|---|
| CS-05: Roadmap closed-stage conflict detector | AC-CS-05 | Team 61 |
| CS-06: EXPECTED_FILES dynamic | AC-CS-06 | Team 61 |
| CS-07: COMPLETE gate safe path | AC-CS-07 | Team 61 |
| CS-08: Snapshot freshness guard | AC-CS-08 | Team 61 |
| FB-05..FB-08: Observer + docs fallback cleanup | (see fallback scan) | Team 61 + Team 170 |
| IDEA-003/005: Docs Audit deliverables | Mode 1 Routing Table + activation prompt updates | Team 170 |
| IDEA-036: Date Governance P1+P2 | AC-IDEA-036 | Team 61 + Team 191 |

---

## 6. Fallback Removal Policy (binding — Constitutional Lock §3)

Per Team 190's §8.1 mandate and consolidated finding CS-03:

**IRON RULE:** In all operational state flows (JS and Python), fallback to legacy or alternate sources is PROHIBITED.

Required behavior (all paths):
1. Primary source read FAILS → show explicit `PRIMARY_STATE_READ_FAILED` error block
2. Error block MUST include: source_path, error type, timestamp, domain context, suggested recovery
3. Emit machine-readable log: `{ event: "PRIMARY_STATE_READ_FAILED", source, domain, ts }`
4. No fallback state presented — operator sees error only
5. `pipeline_state.json` (legacy) — JS: no longer a fallback target for any operational path; remains as backward-compat read-only. Python: `state.py` load() must NOT fall back to legacy on normal startup; emit `NO_ACTIVE_PIPELINE` object.

**Legacy mirror write (FB-03):** `agents_os_v2/orchestrator/state.py` — mirror write to `pipeline_state.json` on every save is DEPRECATED. Mark as `# DEPRECATED — non-runtime copy only; scheduled for removal at S003-P007`. Do NOT remove yet (backward compat); DO mark clearly.

---

## 7. Idea Consolidation Table

| idea_id | title (short) | decision | rationale | target_wp |
|---|---|---|---|---|
| IDEA-002 | PIPELINE_TEAMS.html update | MERGE_NOW | Directly remediates SA-01 (Teams tiktrack anchor) — core P0 item | S002-P005-WP003 |
| IDEA-003 | AOS Docs Audit (Teams 170+190) | MERGE_NOW | Standing thread; activation prompts + targeted scan = P1 deliverables | S002-P005-WP003 |
| IDEA-005 | Mode 1 Routing Table (Team 170) | MERGE_NOW | Part of Docs Audit mandate; Team 170 sub-deliverable; no scope expansion | S002-P005-WP003 |
| IDEA-036 | Date Governance P1+P2 | MERGE_NOW | P0 already done; P1+P2 are small, drift-reducing, Team 191 scope; minimal overhead | S002-P005-WP003 |
| IDEA-007 | Ideas Pipeline Phase 2 | MERGE_NEXT_WP | WP04 candidate as registered; broader productization scope; WP003 must close first | S002-P005-WP004 |
| IDEA-018 | Stage transitions + roadmap management | MERGE_NEXT_WP | S004 candidate; blocked until S003 stable; no action now | S004-Pxxx |
| IDEA-037 | Cross-Team Skills Set Program | OUT_OF_SCOPE | Strategic/people program; separate architectural decision required; does not reduce immediate drift risk | TBD — separate program decision |

---

## 8. Ownership Split

| role | team | gates |
|---|---|---|
| Implementation (JS + Python) | Team 61 | G3_PLAN → CURSOR_IMPLEMENTATION |
| QA & functional acceptance | Team 51 | GATE_4 |
| Dev validation | Team 90 | GATE_5 |
| AOS Architectural review | Team 100 | GATE_2 (scope approval) + GATE_6 (reality vs intent) |
| Constitutional validation | Team 190 | GATE_0 (scope), GATE_1 (LLD400) |
| Orchestration + work plan | Team 10 | G3_PLAN → G3_6_MANDATES |
| Documentation + registry sync | Team 170 | GATE_1 (LLD400 assist) + GATE_8 (AS_MADE_REPORT) |
| UX sign-off | Team 00 / Nimrod | GATE_7 |

---

## 9. Pre-Activation Checklist

Before pipeline_run.sh GATE_0 is submitted:
- [ ] `PHOENIX_PROGRAM_REGISTRY` S002-P005 status: COMPLETE → ACTIVE (Team 170)
- [ ] `PHOENIX_WORK_PACKAGE_REGISTRY` WP003 row added (Team 170, after GATE_0 PASS)
- [ ] WSM CURRENT_OPERATIONAL_STATE updated: `active_work_package_id = S002-P005-WP003` (Gate owner at GATE_3 intake)
- [ ] `pipeline_state_agentsos.json` reset for new WP003 run (Team 10 at GATE_3 intake)
- [ ] Idea consolidation table registered in PHOENIX_IDEA_LOG.json (Team 100 or Team 170)

---

## 10. P2 Deferred Scope (not in WP003)

**STATE_VIEW.json unified read model** — architectural scope requiring:
1. New generated file built from WSM + domain states + registries
2. All 3 pages consume only this read model
3. Reconciliation rules + conflict priority order approved by Team 00/100

Decision: Deferred to **S002-P005-WP004** (after WP003 GATE_8 PASS) or merged with IDEA-007 (Ideas Pipeline Phase 2) as a compound WP04.

---

**overall_result:** LOD200_APPROVED — execution-ready for GATE_0 submission to Team 190

**log_entry | TEAM_100 | AOS_STATE_ALIGNMENT_WP003_LOD200 | AUTHORED_AND_APPROVED | 2026-03-16**
