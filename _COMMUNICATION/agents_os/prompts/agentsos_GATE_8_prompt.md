# Mandates — S003-P009-WP001  ·  GATE_8

**date:** 2026-03-21

**Spec:** Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 70   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2
             📄 Team 90 reads coordination data from Team 70

  Phase 2:  Team 90   ← runs alone

════════════════════════════════════════════════════════════

## Team 70 — Documentation & Archive (Phase 1)

### Your Task

**Environment:** Cursor Composer — Team 70

Complete **two mandatory tasks** for WP `S003-P009-WP001` closure:

---

**TASK A — Write AS_MADE_REPORT**

Write to: `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`

Required sections:
  1. Feature summary — what was built
  2. Files created / modified:
    [list all files created/modified during implementation]
  3. API endpoints added / changed (if any)
  4. Migrations or schema changes applied (if any)
  5. Known limitations / deferred items
  6. Notes for future developers (setup, gotchas, dependencies)
  7. Archive manifest (populated after Task B — list all archived files)

---

**TASK B — Archive WP Communication Files**

Source: `_COMMUNICATION/team_*/` (files containing `S003_P009_WP001` or `S003-P009-WP001` in name)
Destination: `_COMMUNICATION/_ARCHIVE/S003/S003-P009-WP001/`

```bash
mkdir -p _COMMUNICATION/_ARCHIVE/S003/S003-P009-WP001/
find _COMMUNICATION/team_*/ \( -name '*S003_P009_WP001*' -o -name '*S003-P009-WP001*' \) -type f
# Copy all matching files to _COMMUNICATION/_ARCHIVE/S003/S003-P009-WP001/
```

**Do NOT archive** (keep active): SSM, WSM, PHOENIX_MASTER_WSM, PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK

→ When BOTH tasks complete, Team 90 can begin Phase 2 validation.

**Output — write to:**
`_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`

### Coordination Data — Team 90 validation result (correction cycle — empty on first run)

✅  Auto-loaded: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S003_P009_WP001_GATE5_VALIDATION_RESPONSE_v1.0.0.md`

```
# Team 90 → Team 10 | S003-P009-WP001 GATE_5 — Validation Response

**project_domain:** AGENTS_OS  
**id:** TEAM_90_TO_TEAM_10_S003_P009_WP001_GATE5_VALIDATION_RESPONSE_v1.0.0  
**from:** Team 90 (External Validation Unit — GATE_5 Owner)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 20, Team 30, Team 50, Team 100  
**date:** 2026-03-16  
**status:** COMPLETED  
**gate_id:** GATE_5  
**work_package_id:** S003-P009-WP001  
**verdict:** PASS  
**route_recommendation:** doc  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| gate_id | GATE_5 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |

---

## 1) Validation Summary

| Item | Result |
|------|--------|
| GATE_4 PASS evidence | PASS — `TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md` |
| Team 20 BF closure | PASS — `TEAM_20_TO_TEAM_10_S003_P009_WP001_G5_DOC_REMEDIATION_COMPLETION_v1.0.0.md` |
| Pipeline resilience package | PASS — wsm_writer, pre-GATE_4 block, 3-tier resolution |
| Constitutional flow (BLK-01..05) | PASS — _extract_blocking_findings, auto-injection, remediation prompt |
| Fresh regression evidence | PASS — FAST_3 (108 passed), server (10 passed) |

---

## 2) Artifact Chain Verification

| Artifact | Path | Status |
|----------|------|--------|
| Team 20 API verify | `_COMMUNICATION/team_2
```
_[… content truncated at 1500 chars]_


### Acceptance
- AS_MADE_REPORT written at: `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`
- All WP files archived to: `_COMMUNICATION/_ARCHIVE/S003/S003-P009-WP001/`
- Archive manifest in AS_MADE_REPORT Section 7
- Team 90 notified for Phase 2 validation

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Team 90 — Closure Validation (Phase 2)

⚠️  PREREQUISITE: **Team 70** must be COMPLETE before starting this mandate.

### Your Task

**Environment:** Codex

Validate that Team 70 has completed all closure requirements for `S003-P009-WP001`.

**Validation checklist:**
□ AS_MADE_REPORT exists at: `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`
□ AS_MADE_REPORT has all required sections (1–7)
□ Archive directory exists: `_COMMUNICATION/_ARCHIVE/S003/S003-P009-WP001/`
□ Archive contains gate artifacts (verdicts, blocking reports, work plans)
□ Archive manifest (Section 7) correctly lists all archived files
□ No unarchived WP-specific files remain in active team folders


### Coordination Data — Team 70 AS_MADE_REPORT

✅  Auto-loaded: `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`

```
---
project_domain: AGENTS_OS
id: TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0
from: Team 70 (Knowledge Librarian — GATE_8 executor)
to: Team 90 (GATE_8 validation), Team 00, Team 10
cc: Team 20, Team 30, Team 50, Team 100, Team 101, Team 170, Team 190
date: 2026-03-18
status: REQUESTING_GATE_8_VALIDATION
gate_id: GATE_8
work_package_id: S003-P009-WP001
program_id: S003-P009
in_response_to: GATE_8 mandate (agentsos_gate_8_mandates.md — S003-P009-WP001)
---

# S003-P009-WP001 AS_MADE_REPORT — Pipeline Resilience Package

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| gate_id | GATE_8 |
| project_domain | AGENTS_OS |
| date | 2026-03-18 |

---

## 1. Feature summary — what was built

S003-P009-WP001 delivers the **Pipeline Resilience Package** for AGENTS_OS:

- **3-tier file resolution (AC-10 / AC-11):** At GATE_1 and G3_PLAN, the pipeline auto-resolves LLD400 and work plan artifacts: Tier 1 = canonical path under `team_170/` or `team_10/`; Tier 2 = glob over `_COMMUNICATION/**/`; Tier 3 = manual `./pipeline_run.sh store GATE_1 <path>` or `store G3_PLAN <path>`. Implemented in `pipeline_run.sh` via `_auto_store_gate1_artifact()` and `_auto_store_g3plan_artifact()`.
- **wsm_writer.py auto-write:** New module `agents_os_v2/orchestrator/wsm_writer.py` updates `PHOENIX_MASTER_WSM_v1.0.0.md` CURRENT_OPERATIONAL_STATE (active_stage_id, curr
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 6 checklist items PASS
- No missing sections in AS_MADE_REPORT
- No unarchived WP files found in active team folders
- If ALL pass  →  `./pipeline_run.sh pass`  →  WP S003-P009-WP001 CLOSED ✅
- If ANY fail  →  `./pipeline_run.sh fail "CLOSURE-001: [specific issue]"`  →  returns to Team 70 for correction
