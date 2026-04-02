---
id: TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Nimrod
cc: Team 61, Team 101, Team 100
date: 2026-03-23
status: ADVISORY
work_package_id: S003-P013-WP001
project_domain: agents_os---

# Repo Noise / Backup Advisory (Post-QA Snapshot)

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P013 |
| work_package_id | S003-P013-WP001 |
| date | 2026-03-23 |

## §1 — Current Workspace Noise Level (`git status --porcelain`)

- Total changed entries: **1232**
- Status distribution:
  - `M`: **99**
  - `D`: **757**
  - `??`: **375**
  - `T`: **1**

## §2 — Changes That Should Be Checked or Backed Up First

| Priority | Area | Why it is noisy/risky | Suggested action |
|---|---|---|---|
| P0 | `_COMMUNICATION/Legace_html_for_blueprint/` (61 deletions) | Large deletion block; easy to lose historical artifacts unintentionally | Create backup bundle before cleanup/commit |
| P0 | Cross-team untracked docs under `_COMMUNICATION/team_*` (226 files) | Mixed canonical artifacts across many teams; high chance of accidental inclusion in unrelated commits | Stage by pathspec per team or archive to dedicated branch |
| P1 | New untracked AOS code in `agents_os_v2/` (21 files) | Architectural/runtime impact area; should be reviewed with focused diff | Review + isolate into dedicated PR/branch |
| P1 | New untracked UI files in `agents_os/ui/` (15 files) | Can alter dashboard/monitor behavior and QA surface | Review with smoke tests before merge |
| P1 | `_COMMUNICATION/agents_os/` state/prompts churn | Runtime-generated files create continuous diff noise | Separate generated artifacts from authored docs in commit workflow |
| P2 | General docs churn in `documentation/` and `ui/` | Increases review noise and merge conflict risk | Split governance/docs commits from code commits |

## §3 — Practical Backup / Hygiene Sequence (Non-destructive)

1. Create a snapshot branch for safety before further cleanup.
2. Export a backup tar/zip for `_COMMUNICATION/Legace_html_for_blueprint/` deleted set.
3. Split working sets by domain:
   - `agents_os_v2` / `agents_os/ui` code changes
   - `_COMMUNICATION/team_*` canonical docs
   - generated runtime files (`_COMMUNICATION/agents_os/*state*`, `prompts/*`)
4. Commit in small thematic batches to reduce accidental noise carryover.

**log_entry | TEAM_51 | REPO_NOISE_BACKUP_ADVISORY | S003_P013_WP001 | 2026-03-23**
