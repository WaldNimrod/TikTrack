---
id: TEAM_00_TO_TEAM_51_S003_P016_CANONICAL_QA_PROMPT_v1.0.0
from: Team 00 (System Designer)
to: Team 51 (QA)
date: 2026-03-24
status: ACTIVE
subject: Canonical QA Prompt — S003-P016 Pipeline Git Isolation (Branch-per-WP + State Consolidation)
program_ref: S003-P016
prerequisite_to: S003-P004
---

# Canonical QA Prompt: S003-P016 Pipeline Git Isolation

**You are Team 51 — QA.**
**Task:** Perform comprehensive QA of program S003-P016 (Pipeline Git Isolation). Return a final verdict (PASS / BLOCK), list all findings with severity, and apply fixes for any BLOCK-level issues before returning.

---

## Context

S003-P016 implemented four architectural changes to the Phoenix pipeline:

1. **Phase 1** — `.gitignore` volatile artifacts (`STATE_SNAPSHOT.json`, `pipeline_events.jsonl`)
2. **Phase 2** — WSM `CURRENT_OPERATIONAL_STATE` section removed; `ssot_check.py` rewritten for internal pipeline_state validation; `write_wsm_state()` / `write_wsm_idle_reset()` stubbed as no-ops
3. **Phase 3** — `_autocommit_pipeline_state()` rewritten: pipeline creates `wp/{WP_ID}` branches, all gate-advance commits go to the WP branch, merge to `main` at COMPLETE
4. **Phase 4** — `read_wsm_identity_fields()` scoped to `## CURRENT_OPERATIONAL_STATE` block (returns all-empty when section absent; prevents false drift from STAGE_PARALLEL_TRACKS headers)

**Commits to review (all on `main`):**
- `8d9f66eed` — Phase 1
- `c2100da71` — Phase 2
- `15801a140` — Phase 3
- `10b3754bd` — Phase 4

---

## QA Checklist — Run All Items

### QA-01: Test suite baseline
```bash
python3 -m pytest agents_os_v2/tests/ -q --tb=short
```
**Expected:** `239 passed, 4 skipped` (or more if new tests were added). Zero failures. Zero unexpected errors.

**If failing:** Fix tests or identify regression before proceeding.

---

### QA-02: SSOT check — both domains
```bash
python3 -m agents_os_v2.tools.ssot_check --domain tiktrack
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
```
**Expected:** `✓ CONSISTENT` for both domains.

**Validation criteria (read the code):**
- `agents_os_v2/tools/ssot_check.py` — confirm it validates internal `pipeline_state_*.json` fields only (NOT WSM COS)
- Required fields: `current_gate`, `stage_id`, `project_domain` non-empty; `work_package_id` non-empty when gate ≠ COMPLETE/NOT_STARTED

---

### QA-03: WSM COS section absent
```bash
grep -n "## CURRENT_OPERATIONAL_STATE" documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
```
**Expected:** No output (section removed).

Also verify STAGE_PARALLEL_TRACKS is still present and populated:
```bash
grep -A 5 "## STAGE_PARALLEL_TRACKS" documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
```
**Expected:** Table with `domain | active_program_id | active_work_package_id | ...` rows for both AGENTS_OS and TIKTRACK.

---

### QA-04: wsm_writer no-op verification
```python
# Run in Python
import tempfile, pathlib
from unittest.mock import patch
import agents_os_v2.orchestrator.wsm_writer as ww
from agents_os_v2.orchestrator.state import PipelineState

original = "## some content\n\nno COS here\n"
with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
    f.write(original); tmp = pathlib.Path(f.name)

st = PipelineState(work_package_id="S003-P016-WP001", stage_id="S003",
                   project_domain="tiktrack", current_gate="GATE_3")
with patch.object(ww, 'WSM_PATH', tmp):
    ww.write_wsm_state(st, "GATE_3", "PASS")
    ww.write_wsm_idle_reset(tt_wp="S003-P016-WP001", tt_gate="COMPLETE",
                             aos_wp="S003-P015-WP001", aos_gate="COMPLETE")

result = tmp.read_text(encoding='utf-8')
assert result == original, f"FAIL: wsm_writer modified the file:\n{result}"
print("PASS: both write_wsm_state and write_wsm_idle_reset are no-ops")
tmp.unlink()
```
**Expected:** `PASS: both write_wsm_state and write_wsm_idle_reset are no-ops`

---

### QA-05: read_wsm_identity_fields — no false drift
```python
# Run in Python
from agents_os_v2.observers.state_reader import read_wsm_identity_fields, build_state_snapshot

# Must return all-empty (COS section absent)
identity = read_wsm_identity_fields()
assert identity['active_work_package_id'] == '', f"FAIL: got '{identity['active_work_package_id']}'"
assert identity['current_gate'] == '', f"FAIL: got '{identity['current_gate']}'"
print("PASS: read_wsm_identity_fields returns empty (COS absent)")

# Full snapshot must show correct pipeline state
s = build_state_snapshot()
domains = s.get('pipeline', {}).get('domains', {})
assert 'tiktrack' in domains and 'agents_os' in domains, "FAIL: missing domains"
wsm_id = s.get('governance', {}).get('wsm_identity', {})
assert wsm_id.get('active_work_package_id', '') == '', f"FAIL: spurious wsm_identity: {wsm_id}"
print("PASS: build_state_snapshot shows correct domains, clean wsm_identity")
```
**Expected:** Both PASS lines printed, no assertions raised.

---

### QA-06: safe_commit.sh WP-branch guard
```bash
# Create a test WP branch
git checkout -b wp/QA-TEST-P016

# Attempt a commit — must be blocked
bash scripts/safe_commit.sh "test" README.md 2>&1 | grep -E "⛔|WP BRANCH"
echo "Exit code: $?"

# Return to main and clean up
git checkout main
git branch -D wp/QA-TEST-P016
```
**Expected:**
- `⛔ WP BRANCH DETECTED — current branch: wp/QA-TEST-P016`
- Exit code `1`

---

### QA-07: Branch-per-WP lifecycle (integration — most critical)

This tests the end-to-end branch lifecycle. Use a throwaway WP ID.

```bash
# Step 1: Start a test pipeline (domain=tiktrack, test WP)
PIPELINE_DOMAIN=tiktrack python3 -c "
from agents_os_v2.orchestrator.pipeline import start_pipeline
start_pipeline(spec='S003-P016 QA integration test', stage='S003', wp_id='S003-P016-WP099')
"

# Verify state file shows GATE_0
python3 -c "
import json
d = json.load(open('_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'))
assert d['current_gate'] == 'GATE_0', f'Expected GATE_0, got {d[\"current_gate\"]}'
assert d['work_package_id'] == 'S003-P016-WP099', f'Expected S003-P016-WP099, got {d[\"work_package_id\"]}'
print('Step 1 PASS: state initialized at GATE_0')
"

# Step 2: Advance GATE_0 — must create wp/S003-P016-WP099 branch
PIPELINE_AUTOCOMMIT=1 bash pipeline_run.sh --domain tiktrack --wp S003-P016-WP099 --gate GATE_0 pass 2>&1 | grep -E "\[pipeline\]|branch|GATE|WP"

# Verify: WP branch exists, commit went to WP branch, main not advanced
git log --oneline --decorate -3
git branch --list "wp/S003-P016-WP099"
echo "Expected: 'wp/S003-P016-WP099' listed above"

# Step 3: Verify main is still at the Phase 4 commit (not advanced by pipeline)
MAIN_TIP=$(git rev-parse main)
echo "main tip: $MAIN_TIP  (must NOT have changed)"

# Cleanup: restore state and delete test branch
git checkout main
git checkout HEAD -- _COMMUNICATION/agents_os/pipeline_state_tiktrack.json
git branch -D wp/S003-P016-WP099
echo "Cleanup done"
```

**Expected outcomes:**
- `[pipeline] Creating WP branch: wp/S003-P016-WP099` in step 2 output
- Commit log shows `(HEAD -> wp/S003-P016-WP099)` for the advance commit
- `main` stays at `10b3754bd` (Phase 4 commit) throughout
- `wp/S003-P016-WP099` listed in `git branch --list`

**Note:** The merge-at-COMPLETE path requires advancing through GATE_5, which requires LLD400 artifacts. If your environment can supply the LLD400 store command, verify the merge as well:
```bash
# After advancing to GATE_5 PASS, verify merge commit on main:
git log --oneline main | head -3
# Expected: top commit should be "pipeline: merge wp/S003-P016-WP099 → main (GATE_5 PASS / COMPLETE)"
```

---

### QA-08: gitignore volatile artifacts
```bash
grep "STATE_SNAPSHOT.json" .gitignore
grep "pipeline_events.jsonl" .gitignore
```
**Expected:** Both lines present.

Also verify they are NOT tracked:
```bash
git ls-files _COMMUNICATION/agents_os/STATE_SNAPSHOT.json
git ls-files _COMMUNICATION/agents_os/logs/pipeline_events.jsonl
```
**Expected:** No output (not tracked).

---

### QA-09: Legacy pipeline_state.json absent
```bash
git ls-files _COMMUNICATION/agents_os/pipeline_state.json
```
**Expected:** No output (file deleted from tracking in Phase 1).

---

### QA-10: Canary smoke test
```bash
bash scripts/canary_simulation/run_canary_safe.sh
```
**Expected:**
- `SSOT CHECK: ✓ CONSISTENT (domain=tiktrack)`
- `SSOT CHECK: ✓ CONSISTENT (domain=agents_os)`
- `LAYER1_VERIFY: PASS`
- No `unbound variable` errors in stderr
- No execution markers (`[pipeline_run]`, `gate advance`, `WSM idle-reset`)

---

## Verdict Format

Return your findings in this format:

```
S003-P016 QA VERDICT: [PASS | BLOCK]

FINDINGS:
- [QA-XX] [SEVERITY: INFO|WARN|BLOCK] <description>
  → Fix applied: <yes/no — if yes, describe>

MERGE-AT-COMPLETE: [VERIFIED | NOT VERIFIED — artifact guard prevented full cycle]

RECOMMENDATION: [unblock S003-P004 | hold pending fix]
```

**Severity definitions:**
- `BLOCK` — code is incorrect, test fails, or a success criterion is not met. Must be fixed before QA PASS.
- `WARN` — functionally OK but a quality/clarity concern. Document; Team 00 decides if fix is needed.
- `INFO` — observation with no action required.

---

## Scope Boundary

Team 51 QA scope for this program:
- All 10 QA checklist items above
- `agents_os_v2/tools/ssot_check.py` — full read + logic review
- `agents_os_v2/orchestrator/wsm_writer.py` — confirm both stubs correct
- `agents_os_v2/observers/state_reader.py` — `read_wsm_identity_fields` scoping fix
- `pipeline_run.sh` — `_autocommit_pipeline_state()` branch lifecycle logic
- `scripts/safe_commit.sh` — WP-branch guard
- `.gitignore` — volatile artifact entries
- `agents_os_v2/tests/` — all 239 tests must pass

Out of scope for this QA pass:
- TikTrack frontend UI
- Team 170 documentation beyond what is modified above
- S003-P004 feature content (unblocked by this pass, not reviewed here)

---

**log_entry | TEAM_00 | QA_PROMPT_ISSUED | S003_P016 | TO_TEAM_51 | 2026-03-24**
