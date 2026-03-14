date: 2026-03-14

╔══════════════════════════════════════════════════════════════╗
║  GATE_8 — CLOSURE: DOCUMENTATION & ARCHIVING                ║
║  Work Package: S001-P002-WP001                               ║
╚══════════════════════════════════════════════════════════════╝

TWO-PHASE GATE:
  Phase 1 → Team 70  — Documentation + Archive WP files
  Phase 2 → Team 90  — Validate → PASS (close) or FAIL (back to Team 70)

────────────────────────────────────────────────────────────
  PHASE 1 — TEAM 70: TWO MANDATORY TASKS
────────────────────────────────────────────────────────────

TASK A — AS_MADE_REPORT

  Write to: _COMMUNICATION/team_70/S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md

  Required sections:
    1. Feature summary — what was built
    2. Files created / modified:
    [list all files created/modified during implementation]
    3. API endpoints added / changed (if any)
    4. Migrations or schema changes applied (if any)
    5. Known limitations / deferred items
    6. Notes for future developers (setup, gotchas, dependencies)

TASK B — Archive WP communication files

  Source pattern:  _COMMUNICATION/team_*/  (files matching: S001_P002_WP001 OR S001-P002-WP001)
  Archive to:      _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/

  Steps:
    1. mkdir -p _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/
    2. Find:  find _COMMUNICATION/team_*/ -name "*S001_P002_WP001*" -o -name "*S001-P002-WP001*"
    3. Copy all matching files to _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/
    4. List archived files in AS_MADE_REPORT (Section 7 — Archive manifest)

  Keep active (do NOT archive):
    SSM, WSM, PHOENIX_MASTER_WSM, PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK

  → When BOTH tasks complete: inform Team 90 to validate.

────────────────────────────────────────────────────────────
  PHASE 2 — TEAM 90: VALIDATE CLOSURE
────────────────────────────────────────────────────────────

  Validation checklist:
  □ AS_MADE_REPORT exists at: _COMMUNICATION/team_70/S001_P002_WP001_AS_MADE_REPORT_v1.0.0.md
  □ AS_MADE_REPORT has all required sections (1–6 above)
  □ WP files archived to: _COMMUNICATION/_ARCHIVE/S001/S001-P002-WP001/
  □ Archive contains gate artifacts (verdicts, blocking reports, work plans)
  □ No unarchived WP-specific files remain in active team folders

  If ALL pass:
    ./pipeline_run.sh pass        → WP S001-P002-WP001 CLOSED ✅

  If ANY fail (list specific issues):
    ./pipeline_run.sh fail "CLOSURE-001: [specific issue]"
    → Returns to Team 70 for correction → re-run GATE_8
