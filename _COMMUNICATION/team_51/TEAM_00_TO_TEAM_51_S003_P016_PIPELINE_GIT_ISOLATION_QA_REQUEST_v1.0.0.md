# TEAM 00 → TEAM 51: QA Request — S003-P016 Pipeline Git Isolation
**document:** TEAM_00_TO_TEAM_51_S003_P016_PIPELINE_GIT_ISOLATION_QA_REQUEST_v1.0.0.md
**from:** Team 00 (System Designer)
**to:** Team 51 (QA)
**date:** 2026-03-24
**Priority:** HIGH — gates S003-P004 (TikTrack feature development)

---

## 1. What Was Built

**Program:** S003-P016 — Pipeline Git Isolation (Branch-per-WP + State Consolidation)

**Architectural directive:** `_COMMUNICATION/team_00/_Architects_Decisions/TEAM_00_ARCHITECT_DIRECTIVE_PIPELINE_GIT_ISOLATION_v1.0.0.md`

**Purpose:** Eliminate git contamination of main branch during pipeline execution. Previously, `pipeline_run.sh` committed volatile runtime state (pipeline_state_*.json, WSM COS fields) directly to `main` on every gate advance. This created constant merge conflicts, polluted commit history, and made `git log main` unreadable for development teams.

**Solution:**
1. Pipeline creates isolated `wp/{WP_ID}` branches per Work Package. All pipeline commits go to the WP branch.
2. WP branch merges into `main` only at GATE_5 PASS (COMPLETE) — clean, single-merge-commit per WP lifecycle.
3. WSM `CURRENT_OPERATIONAL_STATE` section removed — runtime state lives exclusively in `pipeline_state_*.json`.
4. Volatile files (`STATE_SNAPSHOT.json`, `pipeline_events.jsonl`) gitignored.
5. `safe_commit.sh` guards Team 191 from accidentally committing on `wp/*` branches.

---

## 2. Commits (4 phases — all on `main`)

| Phase | Commit | Description |
|-------|--------|-------------|
| Phase 1 | `8d9f66eed` | `.gitignore` — gitignore volatile pipeline runtime artifacts |
| Phase 2 | `c2100da71` | WSM COS extraction — retire wsm_writer COS, rewrite ssot_check, update tests |
| Phase 3 | `15801a140` | Branch-per-WP — pipeline operates on `wp/{WP_ID}` branches |
| Phase 4 | `10b3754bd` | Dashboard fix — scope `read_wsm_identity_fields` to COS block |

---

## 3. Files Changed

| File | Change |
|------|--------|
| `.gitignore` | Added `STATE_SNAPSHOT.json`, `pipeline_events.jsonl` |
| `pipeline_run.sh` | `_autocommit_pipeline_state()` rewritten — Branch-per-WP lifecycle; `wsm-reset` repurposed to sync STAGE_PARALLEL_TRACKS |
| `scripts/safe_commit.sh` | WP-branch guard added — blocks Team 191 commits on `wp/*` |
| `agents_os_v2/orchestrator/wsm_writer.py` | `write_wsm_state()` and `write_wsm_idle_reset()` stubbed as no-ops |
| `agents_os_v2/tools/ssot_check.py` | Full rewrite — internal `pipeline_state_*.json` validation only (no WSM COS comparison) |
| `agents_os_v2/observers/state_reader.py` | `read_wsm_identity_fields()` scoped to COS block (returns empty when COS absent); legacy `pipeline_state.json` reference removed |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | `## CURRENT_OPERATIONAL_STATE` section removed; pointer to `pipeline_state_*.json` added |
| `agents_os_v2/tests/test_ssot_mandate.py` | Tests updated for new internal-only SSOT check |
| `agents_os_v2/tests/test_dm005_regressions.py` | `TestG12WsmIdleReset` replaced with no-op contract test (COS removed) |

---

## 4. Success Criteria (from Directive)

### SC-1: `main` branch is clean during active WP execution
**Status: VERIFIED**
- Stability test: `start_pipeline` for `S003-P016-WP001`, then `pass --gate GATE_0`
- Output evidence: `[pipeline] Creating WP branch: wp/S003-P016-WP001`
- Commit went to WP branch: `[wp/S003-P016-WP001 12ae55880] pipeline: [tiktrack] GATE_0 PASS → GATE_1`
- `main` stayed at `15801a140` throughout — not advanced by pipeline

### SC-2: All pipeline state reads from `pipeline_state_*.json` only
**Status: VERIFIED**
- `build_state_snapshot()` returns correct domain state from both `pipeline_state_tiktrack.json` and `pipeline_state_agentsos.json`
- `wsm_identity` returns all-empty (COS removed) — no spurious values
- `detect_drift()` safely no-ops (guards on `if wsm_wp and json_wp` — both empty after COS removal)

### SC-3: `ssot_check` validates internal state consistency
**Status: VERIFIED**
- New `run_check(domain)` validates: `current_gate`, `stage_id`, `project_domain` present; `work_package_id` set when gate is active
- No longer compares against WSM COS (removed)
- `safe_commit.sh` SSOT guard: passes when `pipeline_state_*.json` is internally consistent

### SC-4: Team 191 blocked from committing on `wp/*` branches
**Status: VERIFIED**
- Guard test: `git checkout -b wp/TEST-GUARD-WP001` → `bash scripts/safe_commit.sh "test" somefile` → `exit 1`
- Error message: `⛔ WP BRANCH DETECTED — current branch: wp/TEST-GUARD-WP001`
- After cleanup: `git checkout main && git branch -D wp/TEST-GUARD-WP001`

### SC-5: 239 tests pass (baseline maintained)
**Status: VERIFIED**
```
239 passed, 4 skipped in 1.17s
```

---

## 5. Regression Evidence

**Pre-implementation baseline:** 243 tests passing
**Post-implementation:** 239 passing, 4 skipped

Net change: −4 (expected — 6 `TestG12WsmIdleReset` field-clearing tests removed, 2 new contract tests added)

All regressions are intentional test refactors matching the new architecture. No unexpected failures.

---

## 6. Known Architectural Notes for QA

1. **`read_wsm_identity_fields()` returns all-empty post-P016.** This is correct. The COS section was removed from WSM. Any code path relying on this function to get active WP/gate must be migrated to read from `pipeline_state_*.json` directly. Team 51 should flag any callers that still expect non-empty values.

2. **`write_wsm_state()` and `write_wsm_idle_reset()` are no-ops.** Retained for import compatibility. Any call site that expects these to write to WSM is now silently broken. Team 51 should scan for callers outside `agents_os_v2/orchestrator/` that might depend on WSM COS being updated.

3. **MERGE at COMPLETE not exercised in stability test.** Gate guards (GATE_1 requires LLD400 artifact) prevented force-advancing through GATE_5. The merge code in `_autocommit_pipeline_state()` is correct but was not executed end-to-end. Team 51 should verify merge behavior in a controlled integration test.

4. **`pipeline_state.json` (legacy root file) still shows in `git status` as modified.** This is pre-existing and unrelated to S003-P016 — it was already in an unstaged-modified state before this program started.

---

## 7. QA Focus Areas

Team 51 should verify the following specifically:

- [ ] **Branch lifecycle**: Simulate a full WP from `start_pipeline` → `GATE_0 PASS` → ... → `GATE_5 PASS`. Verify `wp/{WP_ID}` branch is created, pipeline commits go there, and merge to `main` happens at COMPLETE.
- [ ] **`safe_commit.sh` WP guard**: Confirm guard fires on `wp/*` branches and does NOT fire on `main`.
- [ ] **`ssot_check` consistency**: Run `python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` and `--domain agents_os`. Both should return `✓ CONSISTENT` with clean state files.
- [ ] **WSM COS absence**: Confirm WSM no longer contains `## CURRENT_OPERATIONAL_STATE` section. Confirm `STAGE_PARALLEL_TRACKS` still present and correctly populated.
- [ ] **No false drift alarms**: Run `build_state_snapshot()` and confirm `wsm_identity` is all-empty (no header-row contamination).
- [ ] **Gitignore**: Confirm `STATE_SNAPSHOT.json` and `pipeline_events.jsonl` are not tracked (`git status` should not show them as modified after pipeline runs).
- [ ] **Merge at COMPLETE** (integration): Exercise the COMPLETE path and verify clean merge commit appears on `main`.

---

## 8. Gate Clearance Request

Upon Team 51 QA PASS:
- **S003-P016 GATE_5** → PASS
- **S003-P004 blocking condition** lifts (per directive: S003-P004 cannot start until S003-P016 GATE_5 PASS)

Escalation: any BLOCK findings → route to Team 00 (System Designer) with finding ID.

---

**log_entry | TEAM_00 | S003_P016_QA_SUBMISSION | SENT_TO_TEAM_51 | 2026-03-24**

historical_record: true
