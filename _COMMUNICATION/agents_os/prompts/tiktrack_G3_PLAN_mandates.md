date: 2026-03-26
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

# Mandates — S003-P003-WP001  ·  G3_PLAN

**Spec:** test

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 10   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain tiktrack phase2

  Phase 2:  Operator   ← runs alone

════════════════════════════════════════════════════════════

## Team 10 — Work Plan Author (Phase 1)

### Your Task

**Environment:** Cursor (Team 10 — Work Plan Generator)

Produce a complete implementation work plan for WP `S003-P003-WP001`.

**Approved Spec (from GATE_1 LLD400):**

SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC SPEC 

---

**Required output — all 4 sections mandatory:**

1. **§2 Files per team** (canonical paths):
   - Team 20 (backend) → `_COMMUNICATION/team_20/TEAM_20_S003_P003_WP001_IMPLEMENTATION_v1.0.0.md`
   - Team 30 (frontend) → `_COMMUNICATION/team_30/TEAM_30_S003_P003_WP001_IMPLEMENTATION_v1.0.0.md`
   - Team 50 (QA) → `_COMMUNICATION/team_50/TEAM_50_S003_P003_WP001_QA_REPORT_v1.0.0.md`

2. **§3 Execution order** with dependencies (Team 20 backend → Team 30 frontend → Team 50 QA)

3. **§6 Per-team acceptance criteria** — endpoint contract, UI column, error states, test scenarios per LLD400

4. **§4 API/contract** — FastAPI routes, Pydantic models, SQL queries, test commands (curl/pytest)

---

**Domain:** TikTrack — Teams 20/30 (backend + frontend) + Team 50 (QA). Process variant: `TRACK_FULL`.

Identity header required: `gate: G3_PLAN | wp: S003-P003-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-26`

Save to: `_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain tiktrack phase2` to auto-store the plan and confirm readiness for GATE_2/2.2v (Team 90 plan review).

⛔ **YOUR TASK ENDS WITH SAVING THE WORK PLAN.**

**Output — write to:**
`_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Work plan saved to: `_COMMUNICATION/team_10/TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- All 4 sections present: §2 files per team, §3 execution order, §6 AC, §4 API contract
- Domain: TikTrack — Teams 20/30 + Team 50. Variant: TRACK_FULL
- Identity header present (gate/wp/stage/domain/date)
- When done: Nimrod runs `./pipeline_run.sh --domain tiktrack phase2`

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 1) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 1 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase2
     (regenerates mandates with Phase 1 output → activates Phase 2)
────────────────────────────────────────────────────────────

## Operator — Work Plan Storage Confirmation (Phase 2)

⚠️  PREREQUISITE: **Team 10** must be COMPLETE before starting this mandate.

### Phase 2 — Work Plan Auto-Storage & Advance

**This phase is operator-run, not a team task.**

Running `./pipeline_run.sh --domain tiktrack phase2` will:

1. Auto-scan `_COMMUNICATION/team_10/` for latest `TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v*.md`
2. Store content → `pipeline_state.work_plan`
3. Confirm storage + print next step

**Current storage status:** ✅ Stored (26 chars) — ready to pass

---

**After storage confirmed:**

`./pipeline_run.sh --domain tiktrack pass` → advances GATE_2/2.2 → 2.2v (Team 90 validates plan)

**Output — write to:**
`_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`

### Acceptance
- work_plan field populated in pipeline state (non-empty)
- If PASS  →  `./pipeline_run.sh --domain tiktrack pass`  (advances to GATE_2/2.2v — Team 90 plan review)
- If plan missing  →  check Team 10 saved `TEAM_10_S003_P003_WP001_G3_PLAN_WORK_PLAN_v*.md`
