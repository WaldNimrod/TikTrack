---
id: TEAM_100_TO_TEAM_191_AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_MANDATE_v1.0.0
from: Team 100 (Claude Code — Chief System Architect)
to: Team 191 (GitHub & Backup)
cc: Team 00 (Principal)
date: 2026-04-02
priority: HIGH
status: ACTIVE
subject: agents_os_v2 LEGACY closure + main merge decision
branch: aos-v3
---

# Mandate — agents_os_v2 LEGACY Closure + Main Merge Decision
## Team 191 — Git Governance & Backup

---

## 0. Context

### agents_os_v2 LEGACY status
`agents_os_v2/` is the previous-generation Agents OS (v2). It has been **fully superseded** by `agents_os_v3/` (S003-P005-WP001 complete, Team 51 QA PASS 133/0, Team 190 Validation PASS). The v2 codebase is LEGACY — it is retained for historical reference only.

**Current problem:** 22 untracked files exist in `agents_os_v2/` subdirectories. They were produced during the v2-to-v3 development transition and have never been committed. These must be staged + committed as LEGACY artifacts and pushed to `origin/aos-v3`.

### main branch merge decision
`aos-v3` is **37 commits ahead of `main`** (1157 files changed, 171953 insertions). The project has completed a major phase (S003-P005-WP001 Pipeline Quality Plan v3.5.0). Team 00 proposes evaluating a merge of `aos-v3` → `main` to establish it as the official release version.

This mandate covers **both actions** — but they are sequenced: Section 1 (v2 LEGACY closure) executes immediately; Section 2 (main merge) executes **only after explicit Team 00 APPROVE** in the result file.

---

## 1. EXECUTE NOW — agents_os_v2 LEGACY closure

### 1A. Create LEGACY_NOTICE.md

Create this file **before staging**:

File: `agents_os_v2/LEGACY_NOTICE.md`

```markdown
# LEGACY — agents_os_v2

**Status:** SUPERSEDED (2026-04-02)
**Superseded by:** `agents_os_v3/` — Agents OS v3

agents_os_v2 is retained in this repository for historical reference only.
No further development will occur in this directory.

**Active system:** `agents_os_v3/`
**Canonical state:** S003-P005-WP001 complete — Team 51 QA PASS (133/0), Team 190 Validation PASS

log_entry | TEAM_100 | LEGACY_CLOSURE | agents_os_v2 | 2026-04-02
```

### 1B. Stage all 22 untracked files + LEGACY_NOTICE

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix

# Stage LEGACY notice (create it first per 1A above)
git add "agents_os_v2/LEGACY_NOTICE.md"

# Stage all untracked agents_os_v2 files
git add \
  "agents_os_v2/orchestrator/json_enforcer.py" \
  "agents_os_v2/orchestrator/migrate_state.py" \
  "agents_os_v2/orchestrator/migration_config.py" \
  "agents_os_v2/schemas/" \
  "agents_os_v2/server/routes/config.py" \
  "agents_os_v2/server/routes/state_patch.py" \
  "agents_os_v2/ssot/" \
  "agents_os_v2/tests/conftest.py" \
  "agents_os_v2/tests/fixtures/dummy_wp_focused.json" \
  "agents_os_v2/tests/fixtures/pipeline_scenarios/" \
  "agents_os_v2/tests/fixtures/wp005_fail_report_sample.md" \
  "agents_os_v2/tests/test_canary_fixes.py" \
  "agents_os_v2/tests/test_certification.py" \
  "agents_os_v2/tests/test_correction_cycle_scenarios.py" \
  "agents_os_v2/tests/test_dry_run.py" \
  "agents_os_v2/tests/test_track_focused_full_pass.py" \
  "agents_os_v2/tests/test_track_full_simulation.py" \
  "agents_os_v2/tests/test_wp004_ci_foundation.py" \
  "agents_os_v2/tools/__init__.py" \
  "agents_os_v2/tools/generate_gate_map_assets.py" \
  "agents_os_v2/tools/pipeline_scenario_harness.py" \
  "agents_os_v2/utils/"

# Also stage this mandate file + definition.yaml gate drift fixes
git add \
  "_COMMUNICATION/team_191/TEAM_100_TO_TEAM_191_AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_MANDATE_v1.0.0.md" \
  "_COMMUNICATION/team_170/TEAM_100_TO_TEAM_170_GATE_DRIFT_REMEDIATION_MANDATE_v1.0.0.md" \
  "agents_os_v3/definition.yaml"
```

### 1C. Pre-commit guards

```bash
bash scripts/lint_governance_dates.sh
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check
python3 scripts/portfolio/build_portfolio_snapshot.py --check
bash scripts/lint_process_functional_separation.sh
```

**Date-lint:** WARN on pre-existing old files = acceptable. BLOCK only on new files from this session.

### 1D. Commit

```bash
git commit -m "$(cat <<'EOF'
chore(legacy): close agents_os_v2 as LEGACY — superseded by agents_os_v3

agents_os_v2 is fully superseded. S003-P005-WP001 (Pipeline Quality Plan
v3.5.0) complete: Team 51 QA PASS (133/0), Team 190 Validation PASS.

- Add agents_os_v2/LEGACY_NOTICE.md — status: SUPERSEDED 2026-04-02
- Commit 22 untracked v2 transition files (orchestrator, schemas, server,
  ssot, tests, tools, utils) — historical record preserved
- agents_os_v3/definition.yaml: GATE_6/7/8 marked LEGACY throughout
  (gate_authority, role_description, iron_rules — all 5-gate model aligned)
- Issue mandate files: gate drift remediation (Team 170), this mandate

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 1E. Push

```bash
git push origin aos-v3
```

---

## 2. DECISION POINT — Merge aos-v3 → main

### Current state
- `aos-v3` is **37 commits ahead of `main`**
- Scope: 1157 files changed (agents_os_v3, TikTrack S002/S003 features, governance docs, UI)
- `main` HEAD: `7f90de781` (docs: team_170 renumbering completion)
- `aos-v3` HEAD after Section 1 commit: new SHA (verify with `git log --oneline -1`)

### Recommendation from Team 100
**RECOMMEND MERGE.** Rationale:
1. S003-P005-WP001 is COMPLETE, validated, backed up
2. agents_os_v3 is the active runtime, tested, gate-model aligned
3. `main` represents "official release" — the current gap means the official release is stale by 37 commits
4. No active feature branches depend on the current `main` HEAD
5. Merge now = clean release boundary at a natural milestone

**Merge type:** Non-destructive fast-forward or merge commit onto `main`. Do NOT squash (preserve full commit history on main).

### ⚠️ DO NOT EXECUTE UNTIL TEAM 00 APPROVES

Team 191 must wait for explicit `APPROVE` from Team 00 in the result file before executing the merge.

### Merge procedure (execute only after APPROVE)

```bash
# Pre-merge: verify clean state
git status --short
git log --oneline -3

# Merge aos-v3 into main
git checkout main
git merge aos-v3 --no-ff -m "$(cat <<'EOF'
merge(main): promote aos-v3 to main — AOS v3 + S003 milestone release

aos-v3 branch: 37 commits ahead of main.
Key milestones included:
- agents_os_v3: full v3 implementation, GATE model, pipeline, UI
- S003-P005-WP001 Pipeline Quality Plan v3.5.0 — complete + validated
- agents_os_v2 LEGACY closure
- LOD Standard v0.2 (architectural document)
- Gate sequence canon enforced (GATE_0–GATE_5 active, GATE_6/7/8 LEGACY)
- WP ID 3-level hierarchy enforced (validation + migration)

Team 51 QA PASS (133/0). Team 190 Validation PASS. Team 00 APPROVED.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

git push origin main
git checkout aos-v3
```

---

## 3. Result Report

File: `_COMMUNICATION/team_191/TEAM_191_AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_RESULT_v1.0.0.md`

```
## Section 1 — agents_os_v2 LEGACY closure
- guards: PASS / WARN (detail)
- commit_sha: {sha}
- files_committed: N
- push: SUCCESS
- log: (git log --oneline -1)

## Section 2 — main merge
- Team 00 decision: PENDING / APPROVED / REJECTED
- [If APPROVED] merge_commit_sha: {sha}
- [If APPROVED] main HEAD: {sha}
- push: SUCCESS / SKIPPED
```

---

**log_entry | TEAM_100 | AGENTS_OS_V2_LEGACY_AND_MAIN_MERGE_MANDATE_ISSUED | TO_TEAM_191 | 2026-04-02**

historical_record: true
