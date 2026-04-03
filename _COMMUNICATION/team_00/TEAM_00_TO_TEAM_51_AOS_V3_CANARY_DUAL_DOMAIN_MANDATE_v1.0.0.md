---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_MANDATE_v1.0.0
**from:** Team 00 (System Designer / Principal)
**to:** Team 51 (AOS QA Agent)
**cc:** Team 100, Team 11
**date:** 2026-03-30
**status:** ACTIVE — execute immediately
**priority:** HIGH — pipeline canary coverage gap must be closed before next S003 program activates
---

# Team 51 — AOS v3 Canary: Dual-Domain Coverage Mandate

## Extend Canary to agents_os + Full Suite Run + Findings Report

---

## CONTEXT — WHY THIS MANDATE EXISTS

The existing canary E2E test (`test_canary_full_pipeline.py`) covers only the **tiktrack** domain.
During the last session (2026-03-30), the audit revealed:

1. **agents_os had ZERO routing rules for GATE_1–GATE_5** — any agents_os WP advancing past
   GATE_0 would crash with "no routing rule found". Fixed: 10 new rules added (IDs 15–24).

2. **agents_os default_variant was TRACK_FULL** — should be TRACK_FOCUSED per Iron Rule
   (MEMORY.md, locked 2026-03-19). Fixed in definition.yaml + DB.

3. **All 6 templates were ORCHESTRATOR-as-executor** — templates told the agent to produce
   the spec / implement the code directly, contradicting the gateway architecture. Fixed: all
   templates v1 → v2, ORCHESTRATOR-as-coordinator language throughout.

4. **Only 1 policy existed** — no domain-specific variants, no gate-type policies. Fixed: 4 policies.

These fixes were seeded and tested. Full suite: **151/151 passed.**

**The gap**: no canary run was executed for the agents_os domain. All critical fixes above
were made for agents_os but have **zero automated E2E coverage**. If a regression is
introduced, it will be invisible.

**Your mission**: extend the canary to agents_os, run both domains, run the full suite,
and return a structured findings report.

---

## MANDATORY CONTEXT READS (before starting)

| # | Document / Path | Purpose |
|---|---|---|
| 1 | `agents_os_v3/tests/e2e/test_canary_full_pipeline.py` | Existing canary — full source, understand every test |
| 2 | `agents_os_v3/definition.yaml` (routing_rules, templates, domains) | Current seed state — IDs 15–24, templates v2, TRACK_FOCUSED |
| 3 | `agents_os_v3/seed.py` | Understand DO UPDATE behavior — definition.yaml is now SSOT |
| 4 | `agents_os_v3/modules/state/machine.py` | ULID shim, state transitions, `_resolve_actor_team_id` |
| 5 | `agents_os_v3/modules/management/api.py` | All endpoints — `/api/runs`, `/api/state`, `/api/runs/{id}/prompt` |
| 6 | `agents_os_v3/tests/e2e/conftest.py` | Fixtures: browser_driver, e2e_base_url, e2e_ui_page |

**Server:** `http://127.0.0.1:8090/`
**DB:** `AOS_V3_DATABASE_URL` — in `agents_os_v3/.env`
**Test run command:**
```bash
set -a && source agents_os_v3/.env && set +a
AOS_V3_E2E_RUN=1 AOS_V3_E2E_HEADLESS=1 AOS_V3_E2E_UI_MOCK=0 \
  python3 -m pytest agents_os_v3/tests/ -q --tb=short
```

---

## SCOPE — 3 DELIVERABLES

---

### DELIVERABLE 1 — Extend Canary Test: agents_os Domain

**File to modify:** `agents_os_v3/tests/e2e/test_canary_full_pipeline.py`

Add a second test class `TestCanaryFullPipelineAgentsOS` that mirrors
`TestCanaryFullPipeline` but for the agents_os domain. Requirements:

**Constants to add at module level:**
```python
AGENTS_OS_DOMAIN = "01JK8AOSV3DOMAIN00000001"
AGENTS_OS_SLUG   = "agents_os"
AOS_ACTOR_HDR    = {"X-Actor-Team-Id": "team_11"}   # AOS gateway
```

**Fixtures to add (module-scoped, isolated from tiktrack fixtures):**
- `canary_db_aos` — separate DB connection (can reuse same pattern as `canary_db`)
  OR reuse `canary_db` if the teardown handles both WPs safely (document your choice)
- `canary_wp_aos` — insert a canary WP for `AGENTS_OS_DOMAIN`, purge on teardown
  Label: `"CANARY-AOS — full pipeline E2E test"`
- `live_browser_aos` — separate module-scoped Chrome session (or reuse `live_browser`
  if the test class isolation guarantees no cross-contamination — document your choice)

**Tests to implement (10 tests, mirror the tiktrack class):**

| Test | What it validates |
|------|------------------|
| `test_01_wp_dropdown_is_populated` | agents_os WP appears in dropdown after clicking agents_os domain button |
| `test_02_start_run_agents_os` | Start Run for agents_os WP → IN_PROGRESS + GATE_0 displayed |
| `test_03_gate0_prompt_live_aos` | `/api/runs/{id}/prompt` → L1/L2/L3/L4 non-empty at GATE_0 |
| `test_04_browser_prompt_not_stale_aos` | Browser prompt panel: no "2026-03-26", no "Team 61", no "mock" in assembled_at |
| `test_05_advance_gate0_to_gate1_aos` | Advance past GATE_0 (both phases 0.1+0.2) → GATE_1 |
| `test_06_advance_gate1_to_gate2_aos` | Advance GATE_1 → GATE_2; prompt valid |
| `test_07_advance_gate2_to_gate3_aos` | Advance GATE_2 → GATE_3; prompt valid |
| `test_08_advance_gate3_to_gate4_approve_visible_aos` | Advance GATE_3 → GATE_4; APPROVE button visible |
| `test_09_approve_gate4_advance_gate5_complete_aos` | Approve GATE_4 → GATE_5 → COMPLETE |
| `test_10_run_log_events_aos` | Run log: RUN_INITIATED + ≥5 PHASE_PASSED + GATE_APPROVED + RUN_COMPLETED |

**Additional check unique to agents_os** — add as assertion inside `test_03`:
- Verify the routing rule that resolved has domain_id = `01JK8AOSV3DOMAIN00000001` (not tiktrack)
- Method: `GET /api/runs/{run_id}` response should include `domain_id` matching agents_os ULID

**Additional check unique to agents_os** — add as assertion inside `test_05`:
- Verify TRACK_FOCUSED variant is associated with this run (L4 run_json should contain
  "TRACK_FOCUSED" or the process_variant field should be TRACK_FOCUSED)
  ```python
  r = requests.get(f"{BASE_URL}/api/runs/{run_id}", headers=AOS_ACTOR_HDR)
  run_data = r.json()
  assert run_data.get("process_variant") == "TRACK_FOCUSED", \
      f"agents_os run should use TRACK_FOCUSED, got: {run_data.get('process_variant')}"
  ```
  If `process_variant` is not in the run response, check L4 of the prompt JSON and document
  where this value is tracked.

**Isolation requirement:** The two test classes MUST be completely isolated:
- Different WP IDs, different run IDs
- Teardown of canary_wp_aos must NOT delete tiktrack WP data
- If run in parallel or sequential, both must pass cleanly

---

### DELIVERABLE 2 — Full Suite Run + Pass Criterion

After implementing Deliverable 1, run the complete test suite:

```bash
AOS_V3_E2E_RUN=1 AOS_V3_E2E_HEADLESS=1 AOS_V3_E2E_UI_MOCK=0 \
  python3 -m pytest agents_os_v3/tests/ -q --tb=short 2>&1 | tee /tmp/suite_run_result.txt
```

**Required outcome:** `161+ passed, 0 failed`
(151 existing + 10 new agents_os canary tests)

If any tests fail:
- Provide full `--tb=long` output for each failure
- Classify each failure: **regression** (caused by new code) vs **pre-existing** vs **environment**
- Do NOT attempt to fix regressions yourself — report them to Team 00
- Exception: trivial fixture isolation issues (e.g. scope mismatch) may be fixed directly

---

### DELIVERABLE 3 — Findings Report

Return a structured QA report to `_COMMUNICATION/team_51/` with filename:
`TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_QA_REPORT_v1.0.0.md`

The report must cover ALL of the following sections:

#### Section A — Test Results Summary
```
tiktrack canary:   10/10 PASS / FAIL
agents_os canary:  10/10 PASS / FAIL
Full suite:       XXX passed, YYY failed, ZZZ warnings
```

#### Section B — agents_os Domain Validation
For each of the 10 agents_os canary tests:
- PASS / FAIL
- If FAIL: exact assertion message + root cause hypothesis

Special assertions:
- Was the correct routing rule (agents_os GATE_1–GATE_5, IDs 15–19) resolved? Evidence?
- Was TRACK_FOCUSED used (not TRACK_FULL)? Where is this visible in the run data?
- Was the correct actor team resolved per domain (team_11 not team_10)? Evidence?

#### Section C — Template Content Quality (all 6 gates, both domains)
For each gate (GATE_0–GATE_5), call `GET /api/runs/{run_id}/prompt` for the agents_os run
and inspect the L1_template layer:
- Does it say "You are the **ORCHESTRATOR**"? (expected: YES)
- Does it correctly describe coordination, NOT direct execution? (expected: YES)
- Are the correct downstream teams mentioned (Team 11/61/51 for agents_os, Team 10/20/30/40/60/50 for tiktrack)?
- Flag any template that still uses executor language ("Your task: Implement…")

#### Section D — Policy Coverage Check
Call `GET /api/policies` and verify:
- 4 policies returned (not 1)
- agents_os default_process_variant = TRACK_FOCUSED ✓
- tiktrack default_process_variant = TRACK_FULL ✓
- GATE_4 gate_type policy present ✓
- max_correction_cycles = 5 ✓

#### Section E — Routing Rules Coverage Check
Call `GET /api/routing-rules` and verify:
- 18 rules total (not 8 or 13)
- Every gate (GATE_0–GATE_5) has: tiktrack rule + agents_os rule + global fallback
- No duplicate rules for the same gate × domain combination
- Present as a table: gate × domain → rule_id

#### Section F — Open Issues and Observations
List any issues found that are NOT covered by the above sections:
- UI issues on the config page (routing rules table, templates display, policies display)
- API response inconsistencies
- Missing features or data gaps vs the v2 specification
- Anything that would block a real operator from using the pipeline UI

Format each issue as:
```
[SEVERITY: CRITICAL/HIGH/MEDIUM/LOW] — [SHORT TITLE]
Where: [page/endpoint/code location]
Observed: [exact behavior]
Expected: [correct behavior]
Hypothesis: [root cause, if known]
```

#### Section G — Canary Architecture Observations
- Does the two-class structure (tiktrack + agents_os) create any fixture interference?
- Is the `_advance_to_gate` helper robust for agents_os (same 2-phase GATE_0 behavior)?
- Any recommendations for improving canary maintainability or coverage?

---

## ACCEPTANCE CRITERIA

The mandate is COMPLETE when ALL of the following are true:

| # | Criterion | Verification |
|---|-----------|-------------|
| AC-1 | 10 new agents_os canary tests exist in `test_canary_full_pipeline.py` | File present, tests counted |
| AC-2 | All 10 agents_os tests PASS | pytest output: 10/10 |
| AC-3 | Full suite: 161+ passed, 0 failed | pytest output attached in report |
| AC-4 | TRACK_FOCUSED assertion exists and passes for agents_os | Evidence in Section B |
| AC-5 | Routing rule resolution confirmed (agents_os IDs 15–19) | Evidence in Section B |
| AC-6 | All 4 policies verified | Section D complete |
| AC-7 | 18 routing rules verified with no duplicates | Section E complete |
| AC-8 | Template content quality assessed for all 6 gates | Section C complete |
| AC-9 | QA report submitted to `_COMMUNICATION/team_51/` | File present |
| AC-10 | All CRITICAL/HIGH findings reported with root cause | Section F complete |

---

## WHAT TEAM 51 DOES NOT DO

- Does NOT modify templates, routing rules, policies, or seed data
- Does NOT fix application bugs (report findings, Team 61 or Team 11 fixes)
- Does NOT modify existing tiktrack canary tests — extend only, do not regress
- Does NOT push to remote repository

---

## DELIVERABLE FILE LOCATIONS

| Deliverable | Location |
|-------------|----------|
| Extended canary test | `agents_os_v3/tests/e2e/test_canary_full_pipeline.py` (modify in place) |
| QA report | `_COMMUNICATION/team_51/TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_QA_REPORT_v1.0.0.md` |

After completing both deliverables, notify Team 00 with a summary message referencing
this mandate ID: `TEAM_00_TO_TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_MANDATE_v1.0.0`

---

**log_entry | TEAM_00 | CANARY_DUAL_DOMAIN_MANDATE_ISSUED | ACTIVE | 2026-03-30**

historical_record: true
