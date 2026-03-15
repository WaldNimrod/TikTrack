---
project_domain: AGENTS_OS
id: TEAM_191_INTERNAL_S002_P005_WP002_RESTART_COMPLETION_TRIGGER_PLAN_v1.0.0
from: Team 191 (Git Governance Operations)
to: Team 191, Team 90
cc: Team 10, Team 00, Team 170
date: 2026-03-15
status: ACTIVE
scope: Restart-to-complete trigger plan for S002-P005-WP002 under Git-governance lane
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP002 |
| task_id | TEAM191_GITHUB_WORKFLOW_OPTIMIZATION |
| gate_id | GATE_8_COMPLETION_RECOVERY |
| phase_owner | Team 191 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Current State Snapshot (Evidence-Based)

1. GATE_8 revalidation PASS artifact exists:
   - `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_170_S002_P005_WP002_GATE8_VALIDATION_RESPONSE_v1.0.1.md`
2. WSM/Registry still not locked to final WP002 closure state:
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:108`
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md:47`
3. Team 191 pre-push lane status (executed 2026-03-15):
   - `DATE-LINT`: FAIL (9 findings)
   - `SYNC CHECK`: PASS
   - `SNAPSHOT CHECK`: FAIL (snapshot out of date)
4. Local workspace has pending/uncommitted artifacts (clean-tree not achieved).

## 2) Completion Lock (Definition of Done)

Completion is achieved only when all of the following are true:
1. `bash scripts/lint_governance_dates.sh` => PASS
2. `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check` => PASS
3. `python3 scripts/portfolio/build_portfolio_snapshot.py --check` => PASS
4. WSM + WP registry mirror reflect final canonical state for `S002-P005-WP002` after GATE_8 PASS
5. `git status --porcelain` => clean before final push lane

## 3) Trigger Set (Minimal Team Spread)

### TRG-191-01 (Team 191) — Git blocker remediation lane

Execute immediate remediation cycle for blocking checks:
1. Resolve `DATE-LINT` failures using canonical method:
   - update document date to a valid non-future value, or
   - add `historical_record: true` in headers for intentional historical artifacts.
2. Refresh portfolio snapshot:
   - `python3 scripts/portfolio/build_portfolio_snapshot.py`
3. Re-run all three checks until green.

### TRG-90-01 (Team 90) — Gate-owner state lock for WP002

Issue/append canonical WSM gate-owner update entries that explicitly lock WP002 post-GATE_8 closure state and reference Team 90 PASS artifact.

Required evidence in return:
1. WSM path + exact log_entry lines added
2. Canonical closure path for GATE_8 PASS decision
3. Confirmation whether active WP state remains `NO_ACTIVE_WORK_PACKAGE` after closure

### TRG-191-02 (Team 191) — Post-WSM mirror sync + final pre-push

After Team 90 WSM update:
1. Run mirror sync write/check sequence.
2. Rebuild snapshot and validate check.
3. Verify clean tree and run push lane.

## 4) Required User Actions

1. Approve Team 90 execution of TRG-90-01 (WSM gate-owner update for WP002 closure lock).
2. Keep Codex command approvals persistent for git/curl/jq flow to avoid manual pauses.
3. Approve final Team 191 commit/push once the three checks are green and tree is clean.

## 5) Execution Commands (Team 191)

```bash
bash scripts/lint_governance_dates.sh
python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check
python3 scripts/portfolio/build_portfolio_snapshot.py
python3 scripts/portfolio/build_portfolio_snapshot.py --check
git status --porcelain
```

## 6) Exit Contract

- overall_result
- checks_run
- files_changed
- remaining_blockers
- owner_next_action

---

**log_entry | TEAM_191 | S002_P005_WP002_RESTART_COMPLETION_TRIGGER_PLAN | ACTIVE | 2026-03-15**
