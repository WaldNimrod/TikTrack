# Portfolio Project (GitHub-native, zero-manual-sync)

## Goal
Manage the pipeline directly in GitHub with **automatic** sync from canonical governance files, with no recurring manual overhead for teams.

## SSOT model (locked)
1. Runtime "what is active now" = `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` only.
2. Portfolio pipeline catalog =
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
   - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`

No task-level data is synced into portfolio issues.

## What is automated
GitHub Action: `.github/workflows/portfolio-auto-sync.yml`

Triggers:
1. `push` touching canonical portfolio/WSM files.
2. `pull_request` touching canonical portfolio/WSM files (validation only).
3. Manual `workflow_dispatch` (with runtime inputs).

Behavior:
1. Validates sync consistency (fails CI on drift).
2. Builds `portfolio_project/portfolio_snapshot.json` + `portfolio_project/portfolio_snapshot.md`.
3. Upserts managed GitHub Issues on:
   - `workflow_dispatch`, or
   - `phoenix-dev` push, or
   - default-branch push.

Manual run inputs:
- `sync_scope`: `full` or `stages`
- `close_stale`: `true/false`

Scripts:
- `scripts/portfolio/build_portfolio_snapshot.py`
- `scripts/portfolio/sync_github_portfolio_issues.py`

## GitHub display model (built-in)
Use **GitHub Projects (built-in)** with automatic ingestion from issues.

Managed issue labels:
- `portfolio-pipeline` (master selector)
- `portfolio-runtime`
- `portfolio-stage`
- `portfolio-program`
- `portfolio-work-package`
- `portfolio-status-*`

The sync script creates/updates these labels automatically.

## Hierarchy model in issues (deterministic)
Issues are generated in strict hierarchy and sortable title format:
1. Stage: `[P01][STAGE] S001 ...`
2. Program: `[P01.01][PROGRAM] S001-P001 ...`
3. Work Package: `[P01.01.001][WP] S001-P001-WP001 ...`

Each Program issue includes parent `stage` key; each WP issue includes parent `stage` + `program` keys.
This allows stable filtering/sorting and easy parent tracing.

## One-time setup in GitHub UI (no ongoing overhead)
1. Create a repository Project, e.g. `Phoenix Portfolio Pipeline`.
2. Configure built-in workflow rule: **auto-add items to project** when label is `portfolio-pipeline`.
3. Create views:
   - Runtime: filter `label:portfolio-runtime`
   - Stages: filter `label:portfolio-stage`
   - Programs: filter `label:portfolio-program`
   - Work Packages: filter `label:portfolio-work-package`
4. Optional: group by `Status` (from issue open/closed + status labels).

After this, teams only update canonical docs; GitHub updates itself.

## Operational policy
- Teams do **not** update portfolio issues manually.
- Teams do **not** duplicate state in ad-hoc docs.
- Any drift blocks CI until fixed at canonical source.

## Create / update / close policy
Issue lifecycle is fully derived from SSOT snapshot:
1. **Create**: key does not exist (new stage/program/wp/runtime).
2. **Update**: same key exists and any mirrored fields changed.
3. **Close by status**:
   - Stage closes when status is `COMPLETED`.
   - Program closes when status is `CLOSED/COMPLETE`.
   - Work package closes when status is `CLOSED`.
4. **Close stale** (optional, recommended): if a managed key no longer exists in snapshot, close it automatically using `--close-stale`.

## Local run (optional)
```bash
python scripts/portfolio/build_portfolio_snapshot.py --check
```

Dry-run issue sync (requires token + repository env):
```bash
GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
python scripts/portfolio/sync_github_portfolio_issues.py --dry-run
```
