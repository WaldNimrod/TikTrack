# Mandates — S003-P009-WP001  ·  GATE_8

**date:** 2026-03-18

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

⚠️  File not yet available. Searched (in order):
  - `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_70_S003_P009_WP001_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0.md`
  - `_COMMUNICATION/team_90/TEAM_90_S003_P009_WP001_GATE_8_VERDICT_v1.0.0.md`
  - `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_70_S003_P009_WP001_GATE8_RESULT_v1.0.0.md`

→ Complete the prerequisite team's work first.
→ Re-generate after: `./pipeline_run.sh` injects real data.


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

⚠️  File not yet available. Searched (in order):
  - `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`
  - `_COMMUNICATION/team_70/TEAM_70_S003_P009_WP001_AS_MADE_REPORT_v1.0.0.md`

→ Complete the prerequisite team's work first.
→ Re-generate after: `./pipeline_run.sh` injects real data.


### Acceptance
- All 6 checklist items PASS
- No missing sections in AS_MADE_REPORT
- No unarchived WP files found in active team folders
- If ALL pass  →  `./pipeline_run.sh pass`  →  WP S003-P009-WP001 CLOSED ✅
- If ANY fail  →  `./pipeline_run.sh fail "CLOSURE-001: [specific issue]"`  →  returns to Team 70 for correction
