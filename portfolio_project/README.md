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

On every change to WSM/portfolio canonical files:
1. Validates sync consistency (fails CI on drift).
2. Builds `portfolio_project/portfolio_snapshot.json` + `portfolio_project/portfolio_snapshot.md`.
3. On default branch only: upserts managed GitHub Issues (stage/program/wp/runtime cards).

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

## Local run (optional)
```bash
python scripts/portfolio/build_portfolio_snapshot.py --check
```

Dry-run issue sync (requires token + repository env):
```bash
GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo \
python scripts/portfolio/sync_github_portfolio_issues.py --dry-run
```
