---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_61_STATE_ALIGNMENT_WP003_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 10, Team 51, Team 100, Team 190
date: 2026-03-15
status: MANDATE_ACTIVE
scope: Implementation mandate — S002-P005-WP003 AOS State Alignment & Governance Integrity
lod200_ref: TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0.md
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| task_id | TEAM_61_IMPLEMENTATION_MANDATE |
| gate_id | CURSOR_IMPLEMENTATION (post-GATE_3 intake) |
| phase_owner | Team 10 (orchestration) → Team 61 (implementation) |

---

## 1. Mission

Implement all P0 items before GATE_4 submission. P1 items in same gate cycle (no separate WP needed). Every implementation must adhere to Iron Rules listed below.

**LOD200 reference:** `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_STATE_ALIGNMENT_WP003_LOD200_v1.0.0.md` — read in full before any implementation.

---

## 2. P0 Deliverables (blocking — GATE_4 cannot open without all P0 green)

### P0-01: Provenance Badges (CS-01)
**Files:** `agents_os/ui/js/pipeline-dashboard.js`, `pipeline-roadmap.js`, `pipeline-teams.js`
**Requirement:** Each status-bearing display block adds a visible badge showing its data source.
- Dashboard main header + gate strip: badge `[domain_file: {filename}]`
- Roadmap program cards: badge `[registry_mirror]` or `[live: {domain}]` (already resolved via getLiveProgramStatusOverride — add visible label)
- Teams state strip: badge per domain row showing `[domain_file: tiktrack]` / `[domain_file: agents_os]`
**AC:** Source badge visible in browser for all 3 pages; correct source labeled; wrong source = FAIL

### P0-02: Gate Contradiction Fix (CS-02)
**Files:** `agents_os_v2/orchestrator/pipeline.py`, `pipeline_run.sh`
**Requirement:** Gate transition logic must enforce mutual exclusivity: if gate G is added to `gates_completed`, it must be removed from `gates_failed` (and vice versa). Add validation assert.
**AC:** Automated test: state file after any gate transition shows no gate in both lists simultaneously

### P0-03: Fallback Removal — JS (CS-03, FB-01, FB-02)
**Files:** `agents_os/ui/js/pipeline-state.js`, `pipeline-dashboard.js`
**Requirement:**
- `loadDomainState()` (pipeline-state.js): on domain file read failure → render explicit `PRIMARY_STATE_READ_FAILED` error panel. Remove legacy `pipeline_state.json` fallback for operational paths.
- Dashboard Progress Check (pipeline-dashboard.js line ~733-736): remove legacy fallback retry; show explicit diagnostics instead.
**Error panel must include:** source_path, HTTP status, timestamp, domain context, recovery command: `python3 -m http.server 8090`
**AC:** Missing domain file → operator sees error panel; no fallback state shown; JS console shows structured log entry

### P0-04: Fallback Removal — Python (CS-03, FB-03, FB-04)
**Files:** `agents_os_v2/orchestrator/state.py`
**Requirement:**
- `PipelineState.load()`: when no active pipeline → return explicit `NO_ACTIVE_PIPELINE` sentinel object; do NOT read legacy `pipeline_state.json` as runtime source.
- Legacy mirror write (save to `pipeline_state.json` on every domain save): mark as `# DEPRECATED — non-runtime backward-compat copy only`. Do NOT remove — keep write but add deprecation comment.
- `is_active` detection: treat `work_package_id = "NONE"` and `current_gate in ("NONE", "COMPLETE")` as inactive sentinels.
**AC:** `state.py` tests pass; `NONE`/`COMPLETE` do not trigger active-pipeline signal; no legacy read in load() hot path

### P0-05: Teams Page Global State (SA-01 / IDEA-002)
**Files:** `agents_os/ui/PIPELINE_TEAMS.html`, `agents_os/ui/js/pipeline-teams.js`
**Requirement:** Replace `loadDomainState("tiktrack")` hardcode with global state model showing both domains.
- Two domain rows in state strip: TikTrack and Agents_OS
- Each row: WP | Gate | Stage | provenance badge
- Row data loaded from `allDomainStatesCache` (already available in roadmap) or fresh fetch of both domain files
- If domain state file unavailable: row shows `—` with `[unavailable]` badge (no fallback)
**AC:** Teams page renders two domain rows; both accurate; no tiktrack-only anchor; provenance badges visible

---

## 3. P1 Deliverables (before GATE_6)

### P1-01: Roadmap Closed-Stage Conflict Detector (CS-05)
**File:** `agents_os/ui/js/pipeline-roadmap.js` — `checkStageConflict()`
**Requirement:** Extend existing conflict checker: detect program with `status = ACTIVE` inside a roadmap stage with `status = COMPLETE or CLOSED`. Render conflict banner unless `AUTHORIZED_STAGE_EXCEPTIONS` covers it.
**AC:** S001-P002 (ACTIVE) inside S001 (if COMPLETE) triggers banner or exception card

### P1-02: EXPECTED_FILES Dynamic (CS-06)
**File:** `agents_os/ui/js/pipeline-config.js`
**Requirement:** Remove hardcoded S001-P002-WP001 file list from `EXPECTED_FILES`. Derive from active WP: use `pipelineState.spec_path`, `pipelineState.mandates` references when available. When no active WP: section shows "No active WP — expected files N/A".
**AC:** No hardcoded program-specific paths; idle state renders informational message

### P1-03: COMPLETE Gate Safe Path (CS-07)
**File:** `agents_os/ui/js/pipeline-dashboard.js` — `loadPrompt()`
**Requirement:** When `gate === 'COMPLETE'`: skip file fetch entirely; render "Pipeline lifecycle complete — no active gate prompt" message in the prompt panel. No 404, no JS exception.
**AC:** Dashboard with COMPLETE state → prompt section shows informational message cleanly

### P1-04: Snapshot Freshness Guard (CS-08)
**File:** `agents_os/ui/js/pipeline-dashboard.js` — health panel section
**Requirement:** Read `STATE_SNAPSHOT.json.produced_at_iso`. Calculate age in seconds. Display freshness badge:
- Age < 3600s → green `[fresh]`
- Age 3600s–86400s → yellow `[stale: Xh ago]`
- Age > 86400s → red `[critical: stale Xd ago]`
**AC:** Freshness badge visible; test with artificially old snapshot triggers correct severity level

### P1-05: Docs Fallback Cleanup (FB-05..FB-06)
**Files:** `agents_os_v2/observers/state_reader.py`, `agents_os/ui/js/pipeline-teams.js` (UX text)
**Requirement:**
- `state_reader.py`: legacy state block in snapshot marked as `# DEPRECATED_AUDIT_ONLY — not runtime signal`
- `pipeline-teams.js:468`: update UX instruction text to reference domain-specific state files, not generic `pipeline_state.json`

### P1-06: Date Governance (IDEA-036) — Team 61 scope
**Files:** Gate prompt templates in `_COMMUNICATION/agents_os/prompts/`
**Requirement:** Replace any hardcoded date strings in prompt templates with `{{date}}` placeholder resolved at runtime by `pipeline_run.sh` using `date -u +%F`.
**AC:** At least 3 AOS prompt templates use canonical date pattern; no hardcoded dates

---

## 4. Iron Rules (non-negotiable)

1. Classic `<script src>` only — no ES modules, no bundler
2. `agents-page-layout` + `agents-header` mandatory on all AOS HTML pages
3. Preflight URL test before GATE_4 QA submission (Team 51 must be able to load all 3 pages)
4. No fallback state in operational paths — explicit error only (CS-03 Iron Rule)
5. Identity header mandatory on all output documents

---

## 5. Output Contract (what Team 61 submits to Team 51 at GATE_4)

- Evidence file listing all P0 + P1 deliverables with file paths and implementation notes
- Browser test confirmation: all 3 pages load without errors when `python3 -m http.server 8090`
- Provenance badge screenshots (or DOM inspection output) confirming CS-01 implementation
- State contradiction test result (CS-02)
- Fallback error panel test result (CS-03)
- Teams page dual-domain state strip screenshot (P0-05)

---

**log_entry | TEAM_100 | TO_TEAM_61 | STATE_ALIGNMENT_WP003_MANDATE_ISSUED | 2026-03-16**
