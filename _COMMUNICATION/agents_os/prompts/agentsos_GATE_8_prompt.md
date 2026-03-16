# Mandates — S002-P005-WP002  ·  GATE_8

**Spec:** Pipeline Governance — PASS_WITH_ACTION micro-cycle

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 170   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh phase2
             📄 Team 90 reads coordination data from Team 170

  Phase 2:  Team 90   ← runs alone

════════════════════════════════════════════════════════════

## Team 170 — Documentation & Archive (Phase 1)

### Your Task

**Environment:** Cursor Composer (Team 70) / Codex (Team 170)

Complete **two mandatory tasks** for WP `S002-P005-WP002` closure:

---

**TASK A — Write AS_MADE_REPORT**

Write to: `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md`

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

Source: `_COMMUNICATION/team_*/` (files containing `S002_P005_WP002` or `S002-P005-WP002` in name)
Destination: `_COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/`

```bash
mkdir -p _COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/
find _COMMUNICATION/team_*/ \( -name '*S002_P005_WP002*' -o -name '*S002-P005-WP002*' \) -type f
# Copy all matching files to _COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/
```

**Do NOT archive** (keep active): SSM, WSM, PHOENIX_MASTER_WSM, PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK

→ When BOTH tasks complete, Team 90 can begin Phase 2 validation.

**Output — write to:**
`_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md`

### Coordination Data — Team 90 validation result (correction cycle — empty on first run)

✅  Auto-loaded: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0.md`

```
---
project_domain: AGENTS_OS
id: TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0
from: Team 90 (GATE_8 validation authority)
to: Team 170 (Spec & Governance — GATE_8 executor)
cc: Team 10, Team 00, Team 100
date: 2026-03-15
historical_record: true
status: FAIL
gate_id: GATE_8
work_package_id: S002-P005-WP002
phase: CLOSURE_VALIDATION_PHASE_2
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | CLOSURE_VALIDATION_PHASE_2 |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| project_domain | AGENTS_OS |

## Overall Result

- overall_status: **FAIL**
- verdict: **CLOSURE-001**
- lifecycle_state: **RETURN_TO_TEAM_170_FOR_CORRECTION**

## Validation Checklist Result

| Check | Result | Basis |
|---|---|---|
| AS_MADE_REPORT exists at `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md` | FAIL | Versioned file missing; only unversioned file exists. |
| AS_MADE_REPORT has required sections (1–7) | FAIL | Current file has section `1` and `2` only (`TEAM_170_S002_P005_WP002_AS_MADE_REPORT.md:28`, `TEAM_170_S002_P005_WP002_AS_MADE_REPORT.md:68`). |
| Archive dir exists at `_COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/` | FAIL | Directory not present; Team 170 archive report points to `_COMMUNICATION/99-ARCHIVE/2026-02-19/S002_P005_WP002/` (`TEAM_170_S002_P005_WP002_ARCHIVE_REPORT.md:31`). |
| Archive contains gate art
```
_[… content truncated at 1500 chars]_


### Acceptance
- AS_MADE_REPORT written at: `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md`
- All WP files archived to: `_COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/`
- Archive manifest in AS_MADE_REPORT Section 7
- Team 90 notified for Phase 2 validation

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Team 90 — Closure Validation (Phase 2)

⚠️  PREREQUISITE: **Team 170** must be COMPLETE before starting this mandate.

### Your Task

**Environment:** Codex

Validate that Team 170 has completed all closure requirements for `S002-P005-WP002`.

**Validation checklist:**
□ AS_MADE_REPORT exists at: `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md`
□ AS_MADE_REPORT has all required sections (1–7)
□ Archive directory exists: `_COMMUNICATION/_ARCHIVE/S002/S002-P005-WP002/`
□ Archive contains gate artifacts (verdicts, blocking reports, work plans)
□ Archive manifest (Section 7) correctly lists all archived files
□ No unarchived WP-specific files remain in active team folders


### Coordination Data — Team 170 AS_MADE_REPORT

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0.md`

```
# TEAM_170 | S002-P005-WP002 AS_MADE_REPORT v1.0.0

**project_domain:** AGENTS_OS  
**id:** TEAM_170_S002_P005_WP002_AS_MADE_REPORT_v1.0.0  
**from:** Team 170 (Spec & Governance — GATE_8 executor)  
**to:** Team 90 (GATE_8 validation), Team 00, Team 100  
**cc:** Team 10, Team 61, Team 51  
**date:** 2026-03-15  
**status:** GATE_8_SUBMISSION  
**gate_id:** GATE_8  
**work_package_id:** S002-P005-WP002  
**in_response_to:** TEAM_00_GATE8_ACTIVATION_DIRECTIVE_S002_P005_WP002_v1.0.0, TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0 (CLOSURE-001 remediation)

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | N/A |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| project_domain | AGENTS_OS |

---

## 1. Feature summary — what was built

**S002-P005-WP002 — Pipeline Governance (AGENTS_OS):** Pipeline state model, CLI commands, and PWA dashboard for agents_os domain.

- **State model:** `gate_state`, `pending_actions`, `override_reason` in `agents_os_v2/orchestrator/state.py`.
- **CLI:** `pass_with_actions`, `actions_clear`, `override` in `pipeline_run.sh` (GATE_6 AC-01, AC-03, AC-04); `--domain` support. `insist` command pending (OBS-02; Team 61).
- **PWA dashboard:** Banner, sidebar, gate timeline; Help modal (4 tabs: Start, Gates, Commands, Help); Three Modes and domain examples; context banner “
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 6 checklist items PASS
- No missing sections in AS_MADE_REPORT
- No unarchived WP files found in active team folders
- If ALL pass  →  `./pipeline_run.sh pass`  →  WP S002-P005-WP002 CLOSED ✅
- If ANY fail  →  `./pipeline_run.sh fail "CLOSURE-001: [specific issue]"`  →  returns to Team 170 for correction
