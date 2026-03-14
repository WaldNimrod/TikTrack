# Mandates — S001-P002-WP001  ·  GATE_8

**Spec:** S001-P002 WP001: Alerts Summary Widget on D15.I home dashboard. Read-only frontend component. Triggered-unread count badge + list of N=5 most recent, fully hidden when 0. Uses existing GET /api/v1/alerts/ endpoint. Per-alert: ticker symbol · condition label · triggered_at relative time. Click item → D34. Click badge → D34 filtered unread. collapsible-container Iron Rule. maskedLog mandatory. No new backend, no schema changes.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 70   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             📄 Team 90 reads coordination data from Team 70

  Phase 2:  Team 90   ← runs alone

════════════════════════════════════════════════════════════

## Team 70 — Documentation & Archive (Phase 1)

### Your Task

**Environment:** Cursor Composer (Team 70) / Codex (Team 170)

Complete **two mandatory tasks** for WP `S001-P002-WP001` closure:

---

**TASK A — Write AS_MADE_REPORT**

Write to: `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md`

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

Source: `_COMMUNICATION/team_*/` (files containing `S001_P002_WP001` or `S001-P002-WP001` in name)
Destination: `_COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/`

```bash
mkdir -p _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/
find _COMMUNICATION/team_*/ \( -name '*S001_P002_WP001*' -o -name '*S001-P002-WP001*' \) -type f
# Copy all matching files to _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/
```

**Do NOT archive** (keep active): SSM, WSM, PHOENIX_MASTER_WSM, PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK

→ When BOTH tasks complete, Team 90 can begin Phase 2 validation.

**Output — write to:**
`_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md`

### Coordination Data — Team 90 validation result (correction cycle — empty on first run)

✅  Auto-loaded: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_70_S001_P002_WP001_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0.md`

```
# Team 90 -> Team 70 | S001-P002-WP001 GATE_8 Closure Validation Phase 2 Result

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_TEAM_70_S001_P002_WP001_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0  
**from:** Team 90 (Dev Validator)  
**to:** Team 70 (Documentation Closure)  
**cc:** Team 10  
**date:** 2026-03-14  
**status:** FAIL  
**gate_id:** GATE_8  
**program_id:** S001-P002  
**work_package_id:** S001-P002-WP001  

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | S001-P002-WP001 |
| task_id | N/A |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S001 |
| project_domain | TIKTRACK |

---

## Validation Checklist Result

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | AS_MADE_REPORT exists at required path | PASS | `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md` |
| 2 | AS_MADE_REPORT includes required sections 1-7 | PASS | Sections `1..7` found in report |
| 3 | Archive directory exists | PASS | `_COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/` |
| 4 | Archive contains gate artifacts (verdicts, blocking reports, work plans) | PASS | Archive contains Team 90 verdicts/blocking/work plans |
| 5 | Archive manifest (Section 7) correctly lists archived files | PASS | Section 7 list matches archive basenames |
| 6 | No unarchived WP-specific files remain in active team 
```
_[… content truncated at 1500 chars]_


### Acceptance
- AS_MADE_REPORT written at: `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md`
- All WP files archived to: `_COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/`
- Archive manifest in AS_MADE_REPORT Section 7
- Team 90 notified for Phase 2 validation

────────────────────────────────────────────────────────────

## Team 90 — Closure Validation (Phase 2)

⚠️  PREREQUISITE: **Team 70** must be COMPLETE before starting this mandate.

### Your Task

**Environment:** Codex

Validate that Team 70 has completed all closure requirements for `S001-P002-WP001`.

**Validation checklist:**
□ AS_MADE_REPORT exists at: `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md`
□ AS_MADE_REPORT has all required sections (1–7)
□ Archive directory exists: `_COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/`
□ Archive contains gate artifacts (verdicts, blocking reports, work plans)
□ Archive manifest (Section 7) correctly lists all archived files
□ No unarchived WP-specific files remain in active team folders


### Coordination Data — Team 70 AS_MADE_REPORT

✅  Auto-loaded: `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md`

```
# TEAM_70 | S001-P002-WP001 AS_MADE_REPORT v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_70_S001_P002_WP001_AS_MADE_REPORT_v1.0.0  
**from:** Team 70 (Documentation)  
**to:** Team 90 (Phase 2 validation), Team 10 (Gateway)  
**date:** 2026-03-14  
**status:** DELIVERABLE  
**gate_id:** GATE_8  
**work_package_id:** S001-P002-WP001  
**stage_id:** S001  

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | S001-P002-WP001 |
| task_id | N/A |
| gate_id | GATE_8 |
| phase_owner | Team 90 |
| project_domain | TIKTRACK |

---

## 1. Feature summary — what was built

**Alerts Summary Widget** — read-only triggered-unread alerts summary on the D15.I home dashboard.

- **Behavior:** Displays a triggered-unread count badge and a list of the N=5 most recent triggered-unread alerts. Widget is fully hidden when there are 0 unread alerts.
- **UI:** Collapsible section (collapsible-container Iron Rule) with title "התראות פעילות", link to D34 alerts page (filtered by `trigger_status=triggered_unread`), relative-time formatting (e.g. "לפני 5 דקות"), and maskedLog used for errors (mandatory).
- **Contracts:** Empty state (total === 0) → component returns null; 401/error → returns null; non-empty → collapsible section with badge and list.

---

## 2. Files created / modified

| Path | Role |
|------|------|
| `ui/src/components/AlertsSummaryWidget.jsx` | Created — Aler
```
_[… content truncated at 1500 chars]_


### Acceptance
- All 6 checklist items PASS
- No missing sections in AS_MADE_REPORT
- No unarchived WP files found in active team folders
- If ALL pass  →  `./pipeline_run.sh pass`  →  WP S001-P002-WP001 CLOSED ✅
- If ANY fail  →  `./pipeline_run.sh fail "CLOSURE-001: [specific issue]"`  →  returns to Team 70 for correction
