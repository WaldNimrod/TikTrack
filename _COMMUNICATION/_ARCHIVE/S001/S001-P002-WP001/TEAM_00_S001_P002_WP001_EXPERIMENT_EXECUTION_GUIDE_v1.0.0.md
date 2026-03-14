---
**project_domain:** TIKTRACK
**id:** TEAM_00_S001_P002_WP001_EXPERIMENT_EXECUTION_GUIDE_v1.0.0
**from:** Team 00 (Chief Architect — Nimrod)
**to:** Team 10 (FAST_2 orchestrator), Team 20, Team 30, Team 50, Team 70, Team 100
**date:** 2026-03-13
**status:** ACTIVE — AUTHORITATIVE RUNBOOK
**purpose:** End-to-end ordered execution guide for the agents_os_v2 live-fire experiment on S001-P002 WP001 (Alerts Summary Widget). Includes exact CLI commands, environments, dependencies, and expected artifacts at every step.
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | WP001 |
| gate_id | FAST_2 → FAST_3 → FAST_4 |
| phase_owner | Team 10 (FAST_2); Nimrod (FAST_3); Team 70 (FAST_4) |
| project_domain | TIKTRACK |

---

# agents_os_v2 Live-Fire Experiment — S001-P002 Execution Guide

## What This Is

This is the first end-to-end use of the agents_os_v2 pipeline on a **real TikTrack product feature**.

The goal is not just to build the Alerts Summary Widget — it is to prove that the entire agents_os_v2 orchestration infrastructure (CLI state machine, prompt generation, data_model validator, test template generator, gate routing) can drive a real feature from scope to GATE_7 PASS.

Every step is logged, every gate is advanced via CLI. The final state: `pipeline_state.json` shows `COMPLETE`.

---

## Infrastructure State Assessment (as of 2026-03-13)

| Component | Location | Status |
|---|---|---|
| Pipeline CLI | `agents_os_v2/orchestrator/pipeline.py` | ✅ DEPLOYED |
| State machine | `_COMMUNICATION/agents_os/pipeline_state.json` | ⚠️ STALE — needs reset |
| Gate router | `agents_os_v2/orchestrator/gate_router.py` | ✅ G3.7 present |
| Data Model Validator | `agents_os_v2/validators/data_model.py` | ✅ S003-P001 COMPLETE |
| Test Template Generator | `agents_os_v2/generators/test_templates.py` | ✅ S003-P002 COMPLETE |
| Prompt outputs dir | `_COMMUNICATION/agents_os/prompts/` | ✅ EXISTS (stale prompts) |
| Team identity contexts | `agents_os_v2/context/identity/` | ✅ DEPLOYED |
| Engine map | `agents_os_v2/config.py` | ✅ (T10=gemini, T30=cursor, T90=openai) |

**Pipeline state issue:** `pipeline_state.json` currently has `gates_failed: ["GATE_0"]` and empty spec_brief from prior testing. Must be re-initialized before running the experiment.

---

## S001-P002 FAST Stage Status (as of 2026-03-13)

| Stage | Status | Date | Document |
|---|---|---|---|
| FAST_0 | ✅ COMPLETE | 2026-03-10 | `TEAM_100_S001_P002_WP001_FAST0_SCOPE_BRIEF_v1.1.0.md` |
| FAST_1 | ✅ COMPLETE — PASS | 2026-03-11 | `TEAM_190_TO_TEAM_100_TEAM_10_S001_P002_WP001_FAST1_REVALIDATION_RESULT_v1.0.0.md` |
| FAST_2 hold | ✅ LIFTED | 2026-03-13 | `TEAM_00_TO_TEAM_10_S001_P002_WP001_FAST2_RELEASE_v1.0.0.md` |
| FAST_2 | 🔴 NOT STARTED | — | ← **START HERE** |
| FAST_3 | 🔴 NOT STARTED | — | — |
| FAST_4 | 🔴 NOT STARTED | — | — |

---

## Pre-Run Checklist

Before running any step, verify:

- [ ] Backend running: `curl http://localhost:8082/health` → HTTP 200
- [ ] Frontend accessible: `http://localhost:8080` loads
- [ ] DB accessible: PostgreSQL `tiktrack` database
- [ ] Authenticated API token available for `curl` tests
- [ ] `OPENAI_API_KEY` set in environment (Team 90 = OpenAI)
- [ ] `GEMINI_API_KEY` set in environment (Team 10 = Gemini)
- [ ] Cursor Composer available (Team 20/30 = Cursor)
- [ ] Repo root: `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix`

---

## PHASE 0 — Governance Release (Terminal, 2 min)

This is already done — see `TEAM_00_TO_TEAM_10_S001_P002_WP001_FAST2_RELEASE_v1.0.0.md`.

No terminal commands needed. Hold is lifted.

---

## PHASE 1 — Pipeline Initialization (Terminal, 1 min)

**Environment:** Terminal at repo root
**Dependency:** None
**Purpose:** Reset stale pipeline state; register S001-P002 WP001 in the CLI state machine

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix

python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "S001-P002 WP001: Alerts Summary Widget on D15.I home dashboard. Read-only frontend component. Triggered-unread count badge + list of N=5 most recent, fully hidden when 0. Uses existing GET /api/v1/alerts/ endpoint. Per-alert: ticker symbol · condition label · triggered_at relative time. Click item → D34. Click badge → D34 filtered unread. collapsible-container Iron Rule. maskedLog mandatory. No new backend, no schema changes." \
  --stage S001 \
  --wp S001-P002-WP001
```

**Expected output:**
```
[HH:MM:SS] INIT: Updating STATE_SNAPSHOT.json...
[HH:MM:SS] INIT: STATE_SNAPSHOT updated.
[HH:MM:SS] Pipeline started: S001-P002 WP001: Alerts Summary Widget on D15...
[HH:MM:SS] Stage: S001
╔══ NEXT: GATE_0 (Team 190 validates LOD200 scope)
║  Owner: team_190  Engine: codex
...
```

**Verify state:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --status
```

---

## PHASE 2 — GATE_0: Data Model Validator (Terminal, 2 min)

**Environment:** Terminal
**Dependency:** Phase 1 complete
**Purpose:** Run data_model validator on spec brief. S001-P002 has no schema changes → expect 0 BLOCK findings. This is the first automated check of the experiment.

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_0
```

**Expected validator output:** The pipeline reads `state.spec_brief`, runs `validate_spec_schema()`.
Since the spec has no `float` columns, no bare `DECIMAL`, no NUMERIC precision issues:
```
[HH:MM:SS] Prompt saved to: _COMMUNICATION/agents_os/prompts/GATE_0_prompt.md
```
No `⛔ BLOCK` lines = validator passed. This is the S003-P001 Data Model Validator at work.

**Advance GATE_0:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_0 PASS
```

---

## PHASE 3 — GATE_1 + GATE_2: Fast-Advance (Terminal, 1 min)

**Environment:** Terminal
**Dependency:** GATE_0 PASS
**Purpose:** FAST_0 scope brief = equivalent of LLD400 for fast track; FAST_1 = equivalent of GATE_0+1 validation. No re-validation needed.

```bash
# GATE_1: scope brief already validated by Team 190 FAST_1
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_1 PASS

# GATE_2: Team 100 approved scope via FAST_0; fast-advance
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_2 PASS
python3 -m agents_os_v2.orchestrator.pipeline --approve GATE_2
```

**Expected output after --approve GATE_2:**
```
[HH:MM:SS] Human APPROVED GATE_2
╔══ NEXT: G3_PLAN (Build work plan from approved spec)
║  Owner: team_10  Engine: cursor
...
```

Pipeline is now at G3_PLAN. FAST_2 execution begins.

---

## PHASE 4 — G3_PLAN: Team 10 Work Plan (Gemini/Claude chat, 10 min)

**Environment:** Gemini session (Team 10 engine = gemini) or Claude chat
**Dependency:** GATE_2 approved
**Purpose:** Team 10 (orchestrator) builds a detailed work plan for Team 20/30 implementation

**Step A — Generate prompt:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt G3_PLAN
# Prompt saved to: _COMMUNICATION/agents_os/prompts/G3_PLAN_prompt.md
```

**Step B — Paste into Gemini/Claude session:**
Open the prompt file and paste its contents.

The work plan should define:
```
Team 20 scope (API verify — verify only, no implementation):
  - Run: GET /api/v1/alerts/?trigger_status=triggered_unread&limit=5
  - Confirm: exact filter param name, response shape, triggered_at field name
  - Output: TEAM_20_S001_P002_API_VERIFICATION_NOTE_v1.0.0.md

Team 30 scope (frontend implementation):
  - CREATE: ui/static/js/alerts-widget.js
    · fetchUnreadAlerts() → GET /api/v1/alerts/ with confirmed params
    · renderWidget(alerts) → build count badge + list items
    · Empty state: container hidden (display:none or CSS class)
    · Non-empty: collapsible-container section with badge + N=5 list
    · Per-item: ticker symbol · condition_name · relative time from triggered_at
    · Item click: navigate to D34
    · Badge click: navigate to D34?filter=triggered_unread
    · All console output: maskedLog()
  - MODIFY: ui/templates/home.html (or equivalent D15.I template)
    · Add collapsible-container section for Alerts Widget
    · Include alerts-widget.js
    · Section title: "Alerts" (or equivalent per existing D15.I style)

MCP test scenarios (Team 50, after implementation):
  1. Navigate to http://localhost:8080, login
  2. Navigate to D15.I (home dashboard)
  3. browser_snapshot → verify: if 0 unread alerts → widget section hidden
  4. (Setup: create 1+ triggered_unread alert via D34 or API)
  5. Navigate to D15.I → browser_snapshot → widget visible + count badge correct
  6. Verify list: up to 5 items, most recent first
  7. Click an alert item → verify navigation to D34
  8. Click badge → verify navigation to D34 (unread filter)
  9. Verify D34 unchanged from GATE_7 PASS state
```

**Step C — Advance after plan received:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_PLAN PASS
```

---

## PHASE 5 — G3_5: Work Plan Validation (OpenAI Codex, 5 min)

**Environment:** OpenAI Codex session (Team 90 engine = openai)
**Dependency:** G3_PLAN PASS, work plan documented
**Purpose:** Team 90 validates work plan for implementation readiness

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt G3_5
# Prompt saved to: _COMMUNICATION/agents_os/prompts/G3_5_prompt.md
```

Paste into Codex session. Expected validation checks:
- Team assignments correct (Team 20 verify-only, Team 30 frontend primary)
- No scope creep (no D34 changes, no backend)
- MCP scenarios cover all 10 FAST_3 acceptance criteria
- collapsible-container + maskedLog constraints noted

Expected result: PASS (simple, well-scoped frontend widget).

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_5 PASS
```

---

## PHASE 6 — G3.7: Test Template Generation (Terminal, 1 min — automated)

**Environment:** Terminal
**Dependency:** G3_5 PASS
**Purpose:** Run S003-P002 Test Template Generator on the spec. This is a direct proof that the generator is operational.

```bash
python3 -c "
import argparse
from agents_os_v2.orchestrator.gate_router import run_g3_7_test_template_generation
from agents_os_v2.orchestrator.state import PipelineState

state = PipelineState.load()
args = argparse.Namespace(force_generate=False)
run_g3_7_test_template_generation(state, args, print)
"
```

**Expected output:**
```
G3.7 PASS: 0 test scaffold(s) generated.
```

Why 0 scaffolds: The FAST_0 scope brief has section `### 5.3 API Contract` (not `## API Contracts` canonical heading). The generator returns TT-SKIP (no matching section). State advances to G3.6.

**This is the correct behavior** — G3.7 is operational; TT-SKIP is the right result for a spec without a canonical contracts section. The test infrastructure proof is: no TT-00 BLOCK was raised.

> **Note for Team 00 review:** If a full LLD400 spec were produced with `## API Contracts` table, G3.7 would generate pytest scaffolds. This is the S003-P002 capability. S001-P002 intentionally exercises the TT-SKIP path.

---

## PHASE 7 — G3_6_MANDATES: Mandate Generation (Terminal, 1 min — deterministic)

**Environment:** Terminal
**Dependency:** G3_5 PASS
**Purpose:** Orchestrator generates Team 20 + Team 30 implementation mandates deterministically

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt G3_6_MANDATES
# Output: _COMMUNICATION/agents_os/prompts/implementation_mandates.md
```

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance G3_6_MANDATES PASS
```

The `implementation_mandates.md` file now contains:
- Team 20 mandate (API verification instructions)
- Team 30 mandate (frontend implementation instructions + MCP test scenarios)

---

## PHASE 8 — CURSOR_IMPLEMENTATION: Teams 20 + 30 (Cursor Composer, 30–60 min)

**Environment:** Cursor Composer (two independent sessions)
**Dependency:** Mandates generated (Phase 7), G3_6_MANDATES PASS
**Purpose:** Actual feature implementation — the core of FAST_2

### Session A — Team 20 (API Verification, ~10 min)

1. Open Cursor Composer in repo root
2. Open `_COMMUNICATION/agents_os/prompts/implementation_mandates.md`
3. Find Team 20 section, paste mandate
4. Execute API check (requires auth token):
   ```bash
   curl -s -X GET \
     "http://localhost:8082/api/v1/alerts/?trigger_status=triggered_unread&limit=5" \
     -H "Authorization: Bearer <token>" | python3 -m json.tool
   ```
5. Document findings in:
   `_COMMUNICATION/team_20/TEAM_20_S001_P002_API_VERIFICATION_NOTE_v1.0.0.md`

   Confirm:
   - Exact filter param (`trigger_status=triggered_unread` or equivalent)
   - Response field names (`ticker_symbol`, `condition_name`, `triggered_at`, etc.)
   - Ordering: is `triggered_at DESC` supported?
   - Count endpoint or count from response length?

6. If API gap found (filter param missing, field name different) → **escalate to Team 00 immediately before Team 30 builds**

### Session B — Team 30 (Frontend Implementation, ~40 min)

**Dependency: Team 20 API verification note exists first.**

1. Open Cursor Composer in repo root
2. Read `_COMMUNICATION/team_20/TEAM_20_S001_P002_API_VERIFICATION_NOTE_v1.0.0.md`
3. Open `_COMMUNICATION/agents_os/prompts/implementation_mandates.md` → Team 30 section
4. Implement:

   **New file — `ui/static/js/alerts-widget.js`:**
   ```javascript
   // Alerts Summary Widget — S001-P002 WP001
   // Iron Rules: maskedLog, read-only, page-load refresh only
   // API: GET /api/v1/alerts/ (params confirmed by Team 20)

   async function loadAlertsWidget() {
     try {
       const resp = await fetch('/api/v1/alerts/?trigger_status=triggered_unread&limit=5&order=triggered_at_desc', {
         headers: { 'Authorization': `Bearer ${getAuthToken()}` }
       });
       if (!resp.ok) return;
       const data = await resp.json();
       const alerts = data.items ?? data ?? [];
       renderAlertsWidget(alerts);
     } catch (e) {
       maskedLog('alerts-widget', 'load error', e);
     }
   }

   function renderAlertsWidget(alerts) {
     const container = document.getElementById('alerts-widget-container');
     if (!container) return;
     if (!alerts.length) {
       container.style.display = 'none';
       return;
     }
     container.style.display = '';
     // render badge + list ...
   }
   ```
   *(Full implementation in Cursor Composer — this is illustrative)*

   **Modified file — D15.I template (find exact path: likely `ui/templates/home.html` or `ui/templates/index.html`):**
   - Add collapsible-container section within existing layout
   - Include `alerts-widget.js` at bottom of page
   - Wire `loadAlertsWidget()` to page DOMContentLoaded

5. After implementation: commit changes
   ```bash
   git add ui/static/js/alerts-widget.js ui/templates/home.html
   git commit -m "feat(S001-P002): Add Alerts Summary Widget on D15.I home dashboard"
   ```

**Advance after both sessions complete:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance CURSOR_IMPLEMENTATION PASS
```

---

## PHASE 9 — GATE_4: QA — Team 50 (Cursor Composer + MCP, 20 min)

**Environment:** Cursor Composer with MCP browser tools
**Dependency:** Implementation committed (Git commit exists — pipeline verifies via `git diff HEAD~1`)
**Purpose:** Team 50 QA/FAV — verify all 10 FAST_3 acceptance criteria before FAST_3 scheduling

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_4
# Prompt at: _COMMUNICATION/agents_os/prompts/GATE_4_prompt.md
```

**If pipeline reports "GATE_4 blocked — implementation not committed":**
```bash
# After committing: re-generate with force flag
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_4 --force-gate4
```

**QA checklist (10 items — per FAST_0 §7):**

| # | Check | Method |
|---|---|---|
| 1 | D15.I loads | `browser_navigate http://localhost:8080` → no errors |
| 2 | Empty state | 0 unread alerts → widget container hidden (display:none) |
| 3 | Non-empty state | ≥1 unread → widget visible |
| 4 | Count badge | Integer count displayed correctly |
| 5 | Alert list | Up to 5 items, most recent first |
| 6 | Per-alert display | Ticker · Condition · relative time |
| 7 | Alert item click | Navigates to D34 |
| 8 | Count badge click | Navigates to D34 (unread filter) |
| 9 | Layout integrity | D15.I layout intact — no breakage |
| 10 | D34 unaffected | D34 renders identically to prior state |

**Team 50 produces:**
`_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md` with PASS/FAIL per item.

**0 FAIL required for GATE_4 PASS.**

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_4 PASS
```

---

## PHASE 10 — GATE_5: Dev Validation (OpenAI Codex, 10 min)

**Environment:** OpenAI Codex session (Team 90)
**Dependency:** GATE_4 PASS
**Purpose:** Data model validator re-runs at GATE_5; Team 90 validates implementation vs. spec

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_5
```

The pipeline runs `validate_migration_file()` at GATE_5. Since S001-P002 has no migrations, the data_model validator checks if any unexpected migration files were added.

Expected: 0 BLOCK findings → paste prompt into Codex → Team 90 validates:
- JS widget follows spec (read-only, collapsible-container, maskedLog)
- No D34 changes
- No backend changes

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_5 PASS
```

---

## PHASE 11 — GATE_6: Team 100 Architectural Review (Gemini/Claude, 10 min)

**Environment:** Gemini session (Team 100 engine = gemini)
**Dependency:** GATE_5 PASS
**Purpose:** "Does what was built match what we approved at GATE_2 (= FAST_0 scope brief)?"

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_6
```

Paste into Gemini session as Team 100. Expected review:
- Widget spec vs. implementation match: count badge, N=5 list, hidden when 0, click nav
- No scope creep beyond FAST_0 §5.2 behavioral spec
- GATE_4 QA PASS report reviewed

Expected: APPROVED.

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_6 PASS
python3 -m agents_os_v2.orchestrator.pipeline --approve GATE_6
```

---

## PHASE 12 — GATE_7 = FAST_3: Nimrod Browser Sign-Off (Browser, 15 min)

**Environment:** Browser — `http://localhost:8080`
**Dependency:** GATE_6 approved
**Purpose:** Nimrod personally reviews D15.I with the Alerts Widget. This is FAST_3 — the human authority gate.

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_7
```

**Nimrod review checklist** (FAST_0 §7 — all 10 must pass):

1. Open `http://localhost:8080` → login as TikTrackAdmin
2. Navigate to D15.I (home dashboard)
3. Verify empty state (if no unread alerts → widget section invisible)
4. Create or trigger an alert → navigate back to D15.I
5. Verify widget appears: count badge correct
6. Verify list: up to 5 items, most recent first, ticker·condition·relative time format
7. Click an alert item → lands on D34 with that alert in view
8. Click count badge → lands on D34 with triggered_unread filter
9. Confirm D15.I layout is intact (no other sections broken)
10. Navigate to D34 → confirm it's unchanged from GATE_7 PASS state (alerts fully functional)

**If PASS:**
```bash
python3 -m agents_os_v2.orchestrator.pipeline --approve GATE_7
```

**If FAIL:** Document specific issues → `--advance GATE_7 FAIL --reason "..."` → remediate → re-run

---

## PHASE 13 — GATE_8 = FAST_4: Documentation Closure (Gemini/Team 70, 15 min)

**Environment:** Gemini session (Team 70)
**Dependency:** GATE_7 = FAST_3 PASS
**Purpose:** Full documentation closure. This is FAST_4 — the final step.

```bash
python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_8
```

Team 70 produces:
1. `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_FAST4_CLOSURE_v1.0.0.md`
   - AS_MADE_REPORT: widget deployed on D15.I, files modified, evidence artifacts
   - Confirmation: all governance docs exist and are consistent
2. Program Registry update:
   - S001-P002: `status = COMPLETE`, `current_gate_mirror = GATE_8 PASS 2026-03-13`
3. WSM update:
   - S001-P002 WP001: CLOSED
   - S001 stage: all programs COMPLETE (P001 was already COMPLETE)

```bash
python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_8 PASS
```

**Expected final CLI output:**
```
╔══════════════════════════════════════════════════════════╗
║  ✅ LIFECYCLE COMPLETE                                   ║
║  Spec: S001-P002 WP001: Alerts Summary Widget on D15    ║
╚══════════════════════════════════════════════════════════╝
```

---

## Complete Step-by-Step Summary (Condensed Runbook)

```
PHASE 0 — Governance         Doc: FAST2_RELEASE_v1.0.0 (done)
PHASE 1 — Init pipeline      Terminal: --spec + --stage S001 --wp S001-P002-WP001
PHASE 2 — GATE_0             Terminal: --generate-prompt GATE_0 → --advance GATE_0 PASS
PHASE 3 — GATE_1+2           Terminal: advance GATE_1+GATE_2 → --approve GATE_2
PHASE 4 — G3_PLAN            Gemini: paste G3_PLAN_prompt.md → get work plan
PHASE 5 — G3_5               Codex: paste G3_5_prompt.md → validate work plan
PHASE 6 — G3.7               Terminal: python3 -c "run_g3_7..." → expect TT-SKIP
PHASE 7 — G3_6_MANDATES      Terminal: --generate-prompt G3_6_MANDATES (deterministic)
PHASE 8A — Team 20           Cursor: API verification → write note
PHASE 8B — Team 30           Cursor: implement widget → commit
PHASE 8 — advance            Terminal: --advance CURSOR_IMPLEMENTATION PASS
PHASE 9 — GATE_4 QA          Cursor+MCP: 10-point QA → --advance GATE_4 PASS
PHASE 10 — GATE_5            Codex: dev validation → --advance GATE_5 PASS
PHASE 11 — GATE_6            Gemini: Team 100 review → --approve GATE_6
PHASE 12 — GATE_7 = FAST_3   Browser: Nimrod reviews D15.I → --approve GATE_7
PHASE 13 — GATE_8 = FAST_4   Gemini: Team 70 docs closure → --advance GATE_8 PASS
                             ✅ LIFECYCLE COMPLETE
```

---

## Dependency Graph

```
PHASE 1 ─────────────────────────────── (no dep)
    │
    └── PHASE 2 (GATE_0)
            │
            └── PHASE 3 (GATE_1+2)
                    │
                    └── PHASE 4 (G3_PLAN)
                            │
                            └── PHASE 5 (G3_5)
                                    │
                                    ├── PHASE 6 (G3.7 — parallel with Phase 7)
                                    │
                                    └── PHASE 7 (G3_6_MANDATES)
                                            │
                                            ├── PHASE 8A (Team 20) ───┐
                                            │                          │ (Team 20 note → Team 30 dependency)
                                            └── PHASE 8B (Team 30) ───┘
                                                    │
                                                    └── PHASE 9 (GATE_4 QA)
                                                            │
                                                            └── PHASE 10 (GATE_5)
                                                                    │
                                                                    └── PHASE 11 (GATE_6)
                                                                            │
                                                                            └── PHASE 12 (GATE_7 = FAST_3 — Nimrod)
                                                                                    │
                                                                                    └── PHASE 13 (GATE_8 = FAST_4)
                                                                                                │
                                                                                                └── ✅ COMPLETE
```

---

## Expected Artifacts (Complete List)

| Artifact | Path | Owner | Created in Phase |
|---|---|---|---|
| FAST_2 release signal | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S001_P002_WP001_FAST2_RELEASE_v1.0.0.md` | Team 00 | Phase 0 ✅ |
| Pipeline state | `_COMMUNICATION/agents_os/pipeline_state.json` | CLI | Phase 1 |
| G3_PLAN prompt | `_COMMUNICATION/agents_os/prompts/G3_PLAN_prompt.md` | CLI | Phase 4 |
| G3.7 result (TT-SKIP log) | stdout | Automated | Phase 6 |
| Implementation mandates | `_COMMUNICATION/agents_os/prompts/implementation_mandates.md` | CLI | Phase 7 |
| Team 20 API note | `_COMMUNICATION/team_20/TEAM_20_S001_P002_API_VERIFICATION_NOTE_v1.0.0.md` | Team 20 | Phase 8A |
| Alerts widget JS | `ui/static/js/alerts-widget.js` | Team 30 | Phase 8B |
| D15.I template (modified) | `ui/templates/home.html` (TBD — confirm exact path) | Team 30 | Phase 8B |
| GATE_4 QA report | `_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md` | Team 50 | Phase 9 |
| FAST_4 closure doc | `_COMMUNICATION/team_70/TEAM_70_S001_P002_WP001_FAST4_CLOSURE_v1.0.0.md` | Team 70 | Phase 13 |
| Program Registry (updated) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Team 70 | Phase 13 |
| WSM (updated) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | Team 70 | Phase 13 |

---

## Experiment Success Criteria

| Criterion | Proof |
|---|---|
| agents_os_v2 CLI orchestrated full lifecycle | `pipeline_state.json → current_gate: COMPLETE` |
| Data Model Validator ran at GATE_0 + GATE_5 | 0 BLOCK findings on spec + migration check |
| Test Template Generator ran at G3.7 | TT-SKIP returned (correct behavior for no-contracts spec) |
| Mandates generated deterministically | `implementation_mandates.md` created without LLM at G3_6 |
| Real TikTrack feature delivered | D15.I Alerts Widget working in browser |
| GATE_7 = Nimrod PASS | `--approve GATE_7` issued |
| S001-P002 COMPLETE | Program Registry updated; S001 stage complete |

---

**log_entry | TEAM_00 | S001_P002_WP001_EXPERIMENT_EXECUTION_GUIDE | ACTIVE | 2026-03-13**
