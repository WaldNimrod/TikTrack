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

✅  Auto-loaded: `_COMMUNICATION/team_90/S002_P005_WP002_G6_TRACEABILITY_MATRIX_v1.0.0.md`

```
# S002-P005-WP002 | GATE_6 Traceability Matrix v1.0.0

**project_domain:** AGENTS_OS  
**owner:** Team 90 (Dev Validation)  
**date:** 2026-03-15  
**gate_id:** GATE_6  
**program_id:** S002-P005  
**work_package_id:** S002-P005-WP002  

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | PIPELINE_GOVERNANCE_PASS_WITH_ACTION |
| gate_id | GATE_6 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | AGENTS_OS |

---

## Traceability (Design -> Implementation -> Verification)

| AC | Design requirement | Implementation evidence | Verification evidence | G6 verdict |
|---|---|---|---|---|
| AC-01 | `pass_with_actions` records actions and holds gate | `agents_os_v2/orchestrator/pipeline.py` (`pass_with_actions`) + `pipeline_run.sh` command | Team 51 QA result v1.0.0 | MATCH |
| AC-02 | `pass` blocked when `gate_state=PASS_WITH_ACTION` | `agents_os_v2/orchestrator/pipeline.py` guard and blocked message | Team 51 QA result v1.0.0 | MATCH |
| AC-03 | `actions_clear` advances and clears actions | `agents_os_v2/orchestrator/pipeline.py` (`actions_clear`) + `pipeline_run.sh` command | Team 51 QA result v1.0.0 | MATCH |
| AC-04 | `override` advances and persists reason | `agents_os_v2/orchestrator/pipeline.py` (`override`) with preserved `override_reason` | Team 51 QA result v1.0.0 (re-QA) 
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

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_ARCHIVE_REPORT.md`

```
---
project_domain: AGENTS_OS
id: TEAM_170_S002_P005_WP002_ARCHIVE_REPORT
from: Team 170 (Spec & Governance — GATE_8 executor)
to: Team 90 (GATE_8 validation), Team 00, Team 100
date: 2026-02-19
historical_record: true
status: GATE_8_SUBMISSION
gate_id: GATE_8
work_package_id: S002-P005-WP002
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| project_domain | AGENTS_OS |

---

## 1) Archive Execution Summary

### Archive root created

`_COMMUNICATION/99-ARCHIVE/2026-02-19/S002_P005_WP002/`

### Contents

| File | Description |
|------|-------------|
| `ARCHIVE_MANIFEST.md` | Closure references for one-off evidence from team_10, team_51, team_61, team_90, team_190, team_191, team_00 |

### Policy applied

Per TEAM_00_GATE8_ACTIVATION_DIRECTIVE §3: "Do not archive canonical structural/governance sources that must remain active."

- **Reference-based closure:** Manifest lists canonical paths to one-off cycle evidence. Originals remain in team folders.
- **Not archived:** Backlog, directives, agent identity files, prompts, registry files — these stay active.

---

## 2) Closure References Scope

| Team | Count | Scope |
|------|-------|-------|
| Team 10 | 6 | GATE_2 intake, GATE_4/5/6 handoffs |
| Team 51 | 3 | QA result, GATE_7 browser verification |
| Team 61 | 4 | Kickoff ACK, GATE_4/5, QA ha
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 6 checklist items PASS
- No missing sections in AS_MADE_REPORT
- No unarchived WP files found in active team folders
- If ALL pass  →  `./pipeline_run.sh pass`  →  WP S002-P005-WP002 CLOSED ✅
- If ANY fail  →  `./pipeline_run.sh fail "CLOSURE-001: [specific issue]"`  →  returns to Team 170 for correction
