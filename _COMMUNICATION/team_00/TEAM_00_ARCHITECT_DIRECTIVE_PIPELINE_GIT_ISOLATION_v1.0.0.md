---
id: TEAM_00_ARCHITECT_DIRECTIVE_PIPELINE_GIT_ISOLATION_v1.0.0
from: Team 00 (System Designer / Constitutional Authority)
to: Team 170 (Implementation Lead), Team 61 (Pipeline Orchestration)
cc: Team 00, Team 100, Team 191, Nimrod
date: 2026-03-24
status: ACTIVE — blocks S003-P004
priority: CRITICAL
subject: Architectural Directive — S003-P016 Pipeline Git Isolation (Branch-per-WP + State Consolidation)
program_ref: S003-P016
prerequisite_to: S003-P004
---

# Architectural Directive: Pipeline Git Isolation — S003-P016

## 1. Executive Decision

**Problem:** The pipeline uses `git diff` / `git add` / `git commit` against the same branch (main) where Team 191 and human developers also operate. Any developer push that modifies pipeline-owned runtime files (WSM, pipeline_state_*.json) causes SSOT drift that blocks the next pipeline operation. This is a structural defect — it cannot be fixed by procedure alone.

**Decision (Team 00, 2026-03-24):** Implement full pipeline git isolation via:
1. **Branch-per-WP** — pipeline operates exclusively on an isolated `wp/{WP_ID}` branch
2. **WSM COS extraction** — runtime operational state leaves the markdown governance doc and lives exclusively in pipeline_state_*.json
3. **State file consolidation** — reduce from 6+ files to 2 canonical sources
4. **SSOT rewrite** — single source, no cross-file comparison needed
5. **Dashboard update** — reads pipeline_state_*.json instead of WSM COS fields

**Blocking rule:** S003-P004 (User Tickers D33) CANNOT start until S003-P016 reaches GATE_5 PASS and stability validation passes.

---

## 2. Scope — 5 Components

### Component 1: WSM COS Extraction

**Current state:** `PHOENIX_MASTER_WSM_v1.0.0.md` contains two logically separate sections:
- `CURRENT_OPERATIONAL_STATE` (COS) — runtime fields updated on every gate advance (active_work_package_id, current_gate, active_flow, etc.)
- Everything else — static policy, governance structure, program registry references

**Problem:** COS fields in a markdown doc = plain text, edited by `wsm_writer.py` via regex replacement, committed to git by the pipeline. Every pipeline gate advance = 1 git commit to main. Every Team 191 push that includes an old WSM snapshot overwrites the COS.

**Decision:**
- Remove the `## CURRENT_OPERATIONAL_STATE` section from WSM entirely
- WSM becomes a **static policy document** — no runtime fields, no regex-replacement writes
- COS fields move to `pipeline_state_tiktrack.json` and `pipeline_state_agentsos.json` as top-level keys
- `wsm_writer.py` is retired or repurposed to write only to pipeline_state_*.json
- WSM gains a single line: `> Runtime state: see _COMMUNICATION/agents_os/pipeline_state_*.json`

**Impact on wsm_writer.py:** Entire module becomes obsolete. Team 61 must:
1. Remove calls to `write_wsm_state()` and `write_wsm_idle_reset()` from `pipeline.py`
2. Write equivalent fields directly to `PipelineState` (already has `current_gate`, `work_package_id`, etc.)
3. Keep `write_stage_parallel_tracks_row()` for the STAGE_PARALLEL_TRACKS table if that table stays in WSM; OR migrate that table to pipeline_state too

**Impact on `wsm-reset` command in pipeline_run.sh:** Repurpose to reset pipeline_state_*.json to idle state (instead of WSM regex patch).

---

### Component 2: State File Consolidation

**Current state (6+ files):**
```
_COMMUNICATION/agents_os/
  pipeline_state.json          ← legacy TikTrack, kept for backward compat
  pipeline_state_tiktrack.json ← current TikTrack canonical
  pipeline_state_agentsos.json ← current AOS canonical
  STATE_SNAPSHOT.json          ← generated snapshot, committed
  pipeline_state_agentsos.json ← (duplicate reference)
logs/
  pipeline_events.jsonl        ← event log, committed
```

**Decision:**
- **Keep:** `pipeline_state_tiktrack.json` + `pipeline_state_agentsos.json` (2 canonical files)
- **Delete:** `pipeline_state.json` (legacy) — migration complete per S003-P011-WP002
- **Gitignore:** `STATE_SNAPSHOT.json` — runtime artifact, never needs to be in git history
- **Gitignore:** `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` — append-only log, not a source of truth; Team 00 decision: event logs are runtime artifacts, not governance history
- **New gitignore entries** (add to `.gitignore`):
  ```
  _COMMUNICATION/agents_os/STATE_SNAPSHOT.json
  _COMMUNICATION/agents_os/logs/pipeline_events.jsonl
  ```

**Result:** Only 2 files committed by pipeline. Both exclusively owned by pipeline_run.sh auto-commit.

---

### Component 3: Branch-per-WP

**Current state:** Pipeline operates on `main`. Every gate advance commits WSM + pipeline_state to main.

**Decision:** Each program activated at GATE_0 gets an isolated git branch.

**Branch naming:** `wp/{WP_ID}` — e.g. `wp/S003-P004-WP001`

**Lifecycle:**
```
GATE_0 activate:
  git checkout -b wp/{WP_ID}        # create WP branch from current main HEAD
  [all pipeline commits go here]

GATE_0 through GATE_5 (all gate advances):
  [pipeline_run.sh auto-commits pipeline_state_*.json to wp/{WP_ID}]
  [Team 191 commits code/docs to main — structurally isolated]

GATE_5 PASS / COMPLETE:
  git checkout main
  git merge --no-ff wp/{WP_ID} -m "pipeline: merge WP {WP_ID} — GATE_5 PASS"
  [merge is integral part of program closure — Team 191 cannot do it manually]

GATE_5 FAIL or abandon:
  branch left as archive: wp/{WP_ID}-FAILED-{date}
  [or deleted after review — Team 00 decision]
```

**Key invariant:** `pipeline_run.sh` always ensures it is on `wp/{WP_ID}` branch before any auto-commit. A `git status --porcelain` check on wrong branch must abort with a clear error.

**Team 191 operations on main:**
- Team 191 operates exclusively on `main`
- `safe_commit.sh` guard: if current branch is `wp/*`, block the commit (not Team 191's domain)
- Developer pushes to main CANNOT affect pipeline (pipeline is on `wp/{WP_ID}`)
- After merge-to-main at COMPLETE, pipeline branch is archived/deleted

**Edge case — parallel programs:**
- TikTrack and AOS domains may run concurrently
- Each gets its own branch: `wp/S003-P004-WP001` (tiktrack) + `wp/S003-P015-WP001` (AOS)
- Both branches fork from main HEAD at their respective GATE_0

---

### Component 4: SSOT Check Rewrite

**Current state:** `ssot_check.py` compares `pipeline_state_*.json` ↔ WSM COS fields. Two sources, regex parsing of markdown.

**After S003-P016:**
- WSM has no COS fields → nothing to compare against
- SSOT check becomes: **validate pipeline_state internal consistency**
  - Is `current_gate` a valid gate string?
  - Is `work_package_id` non-empty when gate != `COMPLETE`?
  - Are both domain files present and parseable?
  - (Optionally) Is the WP branch `wp/{WP_ID}` present in git?

**Impact:** `ssot_check.py` rewritten from ~140 lines to ~50 lines. `state_reader.py` (reads WSM COS) becomes unused for SSOT purposes.

**safe_commit.sh guard update:**
- Step 1 (SSOT check): still runs, now validates pipeline_state internal consistency
- Step 2 (WP099 check): obsolete — WSM no longer has COS fields → replace with: "is pipeline state on a known WP branch or COMPLETE?" check
- Step 3 (pipeline-file ownership): unchanged

---

### Component 5: Dashboard Update

**Current state:** `agents_os/ui/static/PIPELINE_DASHBOARD.html` (and associated JS in `pipeline-state.js`) reads domain state. The G-04 fix (`?domain=`) reads from pipeline_state.json files.

**Verification needed (Team 61):** Confirm whether dashboard reads:
(a) WSM COS fields directly via API, OR
(b) pipeline_state_*.json files

If (a): dashboard must be updated to read from pipeline_state_*.json (or the same data is already there after COS fields are merged in).

If (b): no change needed to dashboard logic, only the data shape may need minor updates.

---

## 3. Impact Analysis — Files Affected

### 3.1 Files to Modify

| File | Change | Complexity |
|------|--------|-----------|
| `agents_os_v2/orchestrator/wsm_writer.py` | Retire `write_wsm_state()` and `write_wsm_idle_reset()`; keep `write_stage_parallel_tracks_row()` if STAGE_PARALLEL_TRACKS remains in WSM, else retire fully | HIGH |
| `agents_os_v2/orchestrator/pipeline.py` | Remove calls to `write_wsm_state()`, `write_wsm_idle_reset()`; ensure COS fields written to pipeline_state | HIGH |
| `agents_os_v2/tools/ssot_check.py` | Full rewrite — internal pipeline_state validation only | MEDIUM |
| `agents_os_v2/observers/state_reader.py` | Remove `read_ssot_reference_identity()` (reads WSM COS); remove WSM parsing logic | MEDIUM |
| `pipeline_run.sh` | Add branch-per-WP lifecycle (checkout, auto-commit to WP branch, merge at COMPLETE); update `wsm-reset` to write pipeline_state not WSM; add branch guard before auto-commit | HIGH |
| `scripts/safe_commit.sh` | Update Step 2 (WP099 → branch check); add guard: block if current branch is `wp/*` | LOW |
| `.gitignore` | Add `STATE_SNAPSHOT.json` and `pipeline_events.jsonl` entries | LOW |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | Remove `## CURRENT_OPERATIONAL_STATE` section; add pointer to pipeline_state_*.json | MEDIUM |
| `agents_os/ui/static/PIPELINE_DASHBOARD.html` (and JS) | Verify/update data source (COS fields) | LOW–MEDIUM |

### 3.2 Files to Delete

| File | Reason |
|------|--------|
| `_COMMUNICATION/agents_os/pipeline_state.json` | Legacy file, migration complete (S003-P011-WP002) |

### 3.3 Tests to Update

| Test file | Change |
|-----------|--------|
| Any test that calls `write_wsm_state()` or `write_wsm_idle_reset()` | Update or delete |
| Any test that reads WSM COS fields to verify SSOT | Rewrite to check pipeline_state only |
| `test_ssot_check.py` (if exists) | Full rewrite |
| `test_wsm_writer.py` (if exists) | Full rewrite or delete |

**Constraint:** Test suite must pass at **243+ tests** after S003-P016 implementation. Current passing count is 243.

### 3.4 Files NOT Affected

- `agents_os_v2/orchestrator/state.py` — PipelineState model is correct as-is; COS fields are already here
- `agents_os_v2/orchestrator/action_log.py` — No change (added this session, already correct)
- `agents_os_v2/orchestrator/gate_router.py` — No change
- `agents_os_v2/orchestrator/log_events.py` — No change (events still written; log file gitignored)
- All `_COMMUNICATION/team_*/` documents — governance docs, not affected
- TikTrack application code — not affected

---

## 4. Implementation Phases

### Phase 1 — Cleanup (no behavioral change to pipeline execution)

**Goal:** Remove dead weight, gitignore volatile files, delete legacy file. Zero functionality change.

**Tasks:**
1. Add to `.gitignore`: `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` and `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`
2. Run `git rm --cached` for both files if currently tracked
3. Delete `_COMMUNICATION/agents_os/pipeline_state.json` (legacy) — confirm with `git log` that no active code references it; then `git rm`
4. Verify all 243 tests still pass

**Commit:** `S003-P016 Phase 1: gitignore volatile files + delete legacy pipeline_state.json`

### Phase 2 — WSM COS Extraction

**Goal:** Remove COS section from WSM; pipeline writes COS fields only to pipeline_state_*.json.

**Tasks:**
1. Remove `## CURRENT_OPERATIONAL_STATE` section from WSM; add single-line pointer
2. Retire `write_wsm_state()` / `write_wsm_idle_reset()` in `wsm_writer.py` (stub with no-op + log warning)
3. Remove calls to those functions from `pipeline.py`
4. Rewrite `ssot_check.py` for internal pipeline_state validation
5. Remove WSM COS reading from `state_reader.py`
6. Update `wsm-reset` in `pipeline_run.sh` to write pipeline_state_*.json idle state (not WSM)
7. Verify all 243 tests still pass
8. Run pipeline dry-run (GATE_0 → GATE_1) and verify no WSM writes occur

**Commit:** `S003-P016 Phase 2: extract WSM COS → pipeline_state_*.json; retire wsm_writer COS methods`

### Phase 3 — Branch-per-WP

**Goal:** Pipeline creates isolated WP branch at GATE_0, commits exclusively there, merges to main at COMPLETE.

**Tasks:**
1. In `pipeline_run.sh` `activate` path (GATE_0): add `git checkout -b wp/{WP_ID}` from current main HEAD
2. In `_autocommit_pipeline_state()`: verify current branch == `wp/{WP_ID}` before committing; abort with error if not
3. In `pipeline_run.sh` COMPLETE/GATE_5 PASS path: add `git checkout main && git merge --no-ff wp/{WP_ID}`
4. Update `safe_commit.sh` Step 2: replace WP099 check with branch check (`wp/*` branches are pipeline-owned, not Team 191's)
5. Update `safe_commit.sh`: if on `wp/*` branch, print error and exit 1
6. Stability validation: run 3 full pipeline cycles (GATE_0 → GATE_5 → COMPLETE) and verify:
   - Each run creates a clean `wp/{WP_ID}` branch
   - Main is not touched during execution
   - Merge-to-main at COMPLETE produces clean history
   - Team 191 commits to main do not affect pipeline operation
7. Verify 243+ tests pass

**Commit:** `S003-P016 Phase 3: branch-per-WP isolation — pipeline operates on wp/{WP_ID} branches`

### Phase 4 — Dashboard Verification + Regression

**Goal:** Verify dashboard reads correctly from new data shape; full regression suite.

**Tasks:**
1. Confirm dashboard G-04 `?domain=` flow reads from pipeline_state_*.json (already verified this session)
2. Verify COS fields displayed in dashboard are available in pipeline_state (not WSM)
3. If any dashboard reads depend on WSM COS: update to read pipeline_state_*.json
4. Run full test suite — must pass 243+ tests
5. Manual pipeline run verification: activate TikTrack WP, advance GATE_0 → GATE_3, verify dashboard shows correct state from pipeline_state

**Commit:** `S003-P016 Phase 4: dashboard verified; full regression pass; S003-P016 COMPLETE`

---

## 5. Success Criteria (GATE_5 Pass Requirements)

| Criterion | Verification method |
|-----------|-------------------|
| WSM `## CURRENT_OPERATIONAL_STATE` section removed | `grep -c "CURRENT_OPERATIONAL_STATE" PHOENIX_MASTER_WSM_v1.0.0.md` → 0 (or only in history) |
| `STATE_SNAPSHOT.json` not tracked by git | `git ls-files _COMMUNICATION/agents_os/STATE_SNAPSHOT.json` → empty |
| `pipeline_events.jsonl` not tracked by git | `git ls-files _COMMUNICATION/agents_os/logs/pipeline_events.jsonl` → empty |
| `pipeline_state.json` (legacy) deleted | `ls _COMMUNICATION/agents_os/pipeline_state.json` → not found |
| Pipeline creates `wp/{WP_ID}` branch at GATE_0 | `git branch --list "wp/*"` shows branch after activation |
| Main not modified during pipeline execution | `git log main --oneline` unchanged between GATE_0 and GATE_4 |
| Merge to main at COMPLETE | `git log main --oneline` shows merge commit after GATE_5 PASS |
| Team 191 push to main during active pipeline run has no effect | Manual test: push commit to main while pipeline on WP branch; pipeline continues unaffected |
| safe_commit.sh blocks commits on `wp/*` branches | `bash scripts/safe_commit.sh "test" somefile` on WP branch → exit 1 |
| 243+ tests passing | `python3 -m pytest agents_os_v2/tests/ -q` |
| 3 full pipeline cycle stability runs | Documented in Team 170 execution report |

---

## 6. Constraints and Iron Rules

1. **No S003-P004 activation until S003-P016 GATE_5 PASS.** Team 100 cannot open S003-P004 gate sequence. Team 00 will not sign off on S003-P004 activation document.

2. **Branch-per-WP is non-negotiable.** Do not propose alternatives that keep pipeline and Team 191 on the same branch.

3. **Merge at COMPLETE is non-negotiable.** The merge is part of the pipeline lifecycle, not a separate manual step.

4. **WSM remains a governance document.** It may retain static tables (STAGE_PARALLEL_TRACKS if used for human reference) but must not contain runtime state fields.

5. **safe_commit.sh must block `wp/*` branches.** Team 191 operating on a WP branch by mistake must be caught immediately.

6. **Do not break the 243-test baseline.** If Phase 2 or 3 causes test failures, fix before proceeding to the next phase.

7. **PIPELINE_AUTOCOMMIT=0 override must still work.** The flag that disables auto-commit (for dev/debug) must remain functional through all phases.

---

## 7. Team Assignments

| Team | Role | Deliverable |
|------|------|-------------|
| **Team 170** | LLD400 author, spec → Team 61 | Write LLD400 for each phase; validate feasibility; confirm file-level impact; submit to Team 61 |
| **Team 61** | Implementation | Execute phases 1–4; submit execution report at each phase |
| **Team 191** | Git governance | Update `safe_commit.sh` (step 2 + branch guard); update `TEAM_191_INTERNAL_WORK_PROCEDURE` to reference branch-per-WP awareness |
| **Team 100** | Gate authority | Approve GATE_2 (before Team 61 starts), GATE_5 (after stability validation) |
| **Team 00** | Architectural validation | Review LLD400 at GATE_2; personal sign-off at GATE_5 before S003-P004 unblock |

---

## 8. Open Questions (Team 170 to resolve at LLD400)

1. **STAGE_PARALLEL_TRACKS table in WSM:** Does it need to remain in WSM (human reference), or can it move to pipeline_state_*.json? If it stays in WSM, `write_stage_parallel_tracks_row()` survives with a narrowed scope.

2. **Branch conflict on re-activation:** If WP branch `wp/{WP_ID}` already exists (from a failed prior run), should pipeline abort with error, or force-reset the branch from current main HEAD?

3. **Pipeline state files on WP branch vs main:** After merge-to-main at COMPLETE, pipeline_state_*.json files on main will show the last completed WP's state. Is this the desired idle state, or should pipeline_state reset to idle fields post-merge?

4. **Parallel programs (TikTrack + AOS simultaneously):** Each has its own WP branch. If both need to merge to main at similar times, is there a merge ordering requirement?

5. **Pre-existing contaminated WSM HEAD:** After this directive is executed, the current committed WSM HEAD will not have a COS section. `wsm-reset` will be repurposed. Transition script needed to clean existing HEAD.

---

## 9. References

- S003-P016 registry entry: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
- S003-P004 blocked: `_COMMUNICATION/team_00/S003_P004_ACTIVATION_RUNBOOK_v1.0.0.md`
- Team 191 safe commit mandate: `_COMMUNICATION/team_191/TEAM_191_MANDATE_SAFE_COMMIT_v1.0.0.md`
- Pipeline run script: `pipeline_run.sh`
- Autocommit + PIPELINE_OWNED_FILES guard (current session): `scripts/safe_commit.sh` + `pipeline_run.sh`
- Action log (added this session): `agents_os_v2/orchestrator/action_log.py`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_PIPELINE_GIT_ISOLATION | ISSUED | S003-P016 | 2026-03-24**
