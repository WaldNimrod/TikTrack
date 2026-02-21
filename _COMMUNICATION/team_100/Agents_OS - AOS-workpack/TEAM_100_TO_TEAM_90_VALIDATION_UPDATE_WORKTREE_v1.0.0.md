# TEAM_100_TO_TEAM_90_VALIDATION_UPDATE_WORKTREE_v1.0.0
from: Team 100
to: Team 90 (Validation & Enforcement)
project_domain: AGENTS_OS
status: SCOPE_UPDATE
version: 1.0.0
last_updated: 2026-02-22

---

## Update: Validation Scope for Agents_OS Worktree Sandbox Workflow

Decision Lock:
Agents_OS implementation is executed inside Git worktree/branch sandbox workspaces.
Validation must include evidence pointers from sandbox `_EVIDENCE/` and `_SUBMISSION/`.

### Team 90 must validate (at Gate 4)

1. Workspace existence and canonical path:
`agents_os/_workspaces/<wp_id>/<workspace_id>/repo/`

2. Evidence folder presence:
`_EVIDENCE/TEST_RUNS/` must contain run logs.

3. Determinism check:
Same input produces same PASS/FAIL output.

4. DoD compliance check:
WP001 must be runnable CLI, not documentation-only.

5. Domain isolation check:
No Agents_OS runtime code changes outside `agents_os/`.

### Output Required
`DEV_VALIDATION_REPORT.md` included in `_SUBMISSION/` pack.

log_entry | TEAM_90 | AOS_VALIDATION_SCOPE_UPDATE_WORKTREE | REQUIRED | AMBER
