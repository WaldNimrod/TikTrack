# Mandates — S003-P011-WP001  ·  G3_PLAN

**Spec:** Process Architecture v2.0 — 5-gate canonical model (GATE_1..5), FCP 3-level classification with auto-routing, TRACK_FULL/TRACK_FOCUSED/TRACK_FAST process variants, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, lod200_author_team LOD200 Author Rule, state schema migration from legacy gate sequence (GATE_0→GATE_8). LOD200 v1.3 APPROVED 2026-03-19.

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 11   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2

  Phase 2:  Operator   ← runs alone

════════════════════════════════════════════════════════════

## Team 11 — Work Plan Author (Phase 1)

### Your Task

**Environment:** Cursor (Team 11 — Work Plan Generator)

Produce a complete implementation work plan for WP `S003-P011-WP001`.

**Approved Spec (from GATE_1 LLD400):**

# LLD400 v1.0.1 — Delta Note

**in_response_to:** TEAM_190_TO_TEAM_170_S003_P011_WP001_G1_CORRECTION_PROMPT_v1.0.0  
**date:** 2026-03-19  
**from:** Team 170  

---

## Sections Changed

### BF-01 — UI contract (R-01)

| Section | Change |
|---------|--------|
| §4 | Added §4.0 **Consolidated Component Tree and State Shape** |
| §4.0 | Full hierarchy: Dashboard → GateStatusPanel, FCPPanel, TeamAssignmentPanel, EngineEditor, Lod200AuthorOverride |
| §4.0 | Complete **state shape**: current_gate, current_phase, process_variant, finding_type, fcp_level, return_target_team, lod200_author_team, project_domain |
| §4.0 | **Engine-config payload shape** for EngineEditor |
| §4.1–§4.5 | Each subsection references §4.0 subtree; retains per-panel state shape and DOM anchors |

### BF-02 — team_engine_config.json (R-02)

| Section | Change |
|---------|--------|
| §2.3 | Replaced flat `team_engine` map with **per-team object schema** |
| §2.3 | Each `teams.{team_id}` = `{ engine: string, domain: string }` |
| §2.3 | Team 11 explicitly: `teams.team_11 = { "engine": "Cursor Composer", "domain": "AOS" }` |
| §3.2 | Updated contract text to match per-team object schema |
| §5.4 MCP-10 | Assertion: `teams.team_11.domain === "AOS"` AND `teams.team_11.engine === "Cursor Composer"` |
| §6 AC-10 | Wording: Team 11 has AOS domain (`teams.team_11.domain === "AOS"`) and Cursor Composer default (`teams.team_11.engine === "Cursor Composer"`) |

## AC Numbering

No change. AC numbering unchanged (AC-01 through AC-26).

---

**log_entry | TEAM_170 | S003_P011_WP001_LLD400_DELTA | v1.0.1 | BF-01_BF-02_CLOSED | 2026-03-19**


---

**Required output — all 4 sections mandatory:**

1. **§2 Files per team** (canonical paths):
   - Team 61 Contract Verify → `_COMMUNICATION/team_61/TEAM_61_S003_P011_WP001_CONTRACT_VERIFY_v1.0.0.md`
   - Team 61 Implementation → `agents_os/ui/js/*.js`, `agents_os_v2/orchestrator/*.py`
   - Team 51 QA → `_COMMUNICATION/team_51/TEAM_51_S003_P011_WP001_QA_REPORT_v1.0.0.md`

2. **§3 Execution order** with dependencies

3. **§6 Per-team acceptance criteria** — field, empty state, error contracts for UI

4. **§4 API/contract** — CLI commands, JSON paths, Python entry points, schema

---

**Domain adaptation:** AGENTS_OS — Team 61 (implementation + contract verify) + Team 51 (QA). No Team 20/30 for this domain.

Identity header required: `gate: G3_PLAN | wp: S003-P011-WP001 | stage: S003 | domain: agents_os | date: 2026-03-19`

Save to: `_COMMUNICATION/team_11/TEAM_11_S003_P011_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

When done, inform Nimrod. Nimrod runs `./pipeline_run.sh --domain agents_os phase2` to auto-store the plan and confirm readiness for G3_5.

⛔ **YOUR TASK ENDS WITH SAVING THE WORK PLAN.**

**Output — write to:**
`_COMMUNICATION/team_11/TEAM_11_S003_P011_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Work plan saved to: `_COMMUNICATION/team_11/TEAM_11_S003_P011_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- All 4 sections present: §2 files per team, §3 execution order, §6 AC, §4 API contract
- Domain adaptation: Team 61 + Team 51 (no Team 20/30 for agents_os)
- Identity header present (gate/wp/stage/domain/date)
- When done: Nimrod runs `./pipeline_run.sh --domain agents_os phase2`

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Operator — Work Plan Storage Confirmation (Phase 2)

⚠️  PREREQUISITE: **Team 11** must be COMPLETE before starting this mandate.

### Phase 2 — Work Plan Auto-Storage & Advance

**This phase is operator-run, not a team task.**

Running `./pipeline_run.sh --domain agents_os phase2` will:

1. Auto-scan `_COMMUNICATION/team_11/` for latest `TEAM_11_S003_P011_WP001_G3_PLAN_WORK_PLAN_v*.md`
2. Store content → `pipeline_state.work_plan`
3. Confirm storage + print next step

**Current storage status:** ⏳ Not yet stored — Team 11 must save work plan first

---

**After storage confirmed:**

`./pipeline_run.sh --domain agents_os pass` → advances G3_PLAN → G3_5 (Team 90 validates plan)

### Acceptance
- work_plan field populated in pipeline state (non-empty)
- If PASS  →  `./pipeline_run.sh --domain agents_os pass`  (advances to G3_5)
- If plan missing  →  check Team 11 saved `TEAM_11_S003_P011_WP001_G3_PLAN_WORK_PLAN_v*.md`
