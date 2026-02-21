# TEAM_100_TO_TEAM_10_ACTIVATION_WORKTREE_SANDBOX_v1.0.0
from: Team 100 (Development Architecture Lead)
to: Team 10 (Gateway)
project_domain: AGENTS_OS
status: ACTIVATION_ORDER
version: 1.0.0
last_updated: 2026-02-22

---

## Activation: Implement Worktree Sandbox Workflow (Agents_OS)

Decision Lock:
Adopt **Git worktree/branch sandbox** as the canonical implementation workflow for Agents_OS work packages.

Scope:
Applies to WP001 and all subsequent Agents_OS work packages.

### Mandatory Steps (Team 10)

1. Create canonical folder:
`agents_os/_workspaces/S001-P001-WP001/`

2. Create workspace ID:
`WS_S001-P001-WP001_<yyyymmdd>_01`

3. Create branch:
`aos/S001-P001-WP001`

4. Create worktree checkout under:
`agents_os/_workspaces/S001-P001-WP001/<workspace_id>/repo/`

5. Implement WP001 deliverable per:
- `AOS_WP001_DEFINITION_OF_DONE_v1.0.0.md`
- `AOS_WORKSPACE_PROTOCOL_v1.0.0.md`
- `AOS_SUBMISSION_PACK_SPEC_v1.0.0.md`

6. Evidence + Submission Pack:
- Write evidence to `_EVIDENCE/`
- Assemble `_SUBMISSION/` (draft is acceptable until gates PASS)

7. Do not merge to main until:
- Team 90 Gate 4 PASS
- Team 50 Gate 5 PASS
- Team 00 approves execution at Gate 6
- Gate 7 closure completed

### Output Required (Team 10)
- Workspace created
- CLI validator implemented and runnable
- Evidence populated
- Draft submission pack generated

log_entry | TEAM_10 | AOS_WORKTREE_SANDBOX_ACTIVATION | REQUIRED | AMBER
