# AOS_WORKSPACE_PROTOCOL_v1.0.0
project_domain: AGENTS_OS
status: LOCKED_PROTOCOL
version: 1.0.0
last_updated: 2026-02-22
owner: Team 100 (Development Architecture Lead)
applies_to: Team 10, Team 90, Team 50, Team 70, Team 190

---

## 0) Purpose

Define a **non-temporary**, productionizable implementation workflow for Agents_OS automation:
- **Isolation-first** development via **Git worktree/branch sandbox**
- Deterministic evidence capture
- Repeatable gate progression
- Future-compatible with Option B modular runtime

This protocol is **mandatory** for all Agents_OS Work Packages that include code execution.

---

## 1) Canonical Concepts

### 1.1 Workspace (Sandbox)
A physical work directory created from the main repo using `git worktree` (preferred) or a dedicated branch checkout.

**Workspace ID**
`WS_<work_package_id>_<yyyymmdd>_<seq>`

Example:
`WS_S001-P001-WP001_20260222_01`

### 1.2 Submission Pack
A standardized evidence bundle produced by the automation pipeline prior to human/architect approval.

---

## 2) Canonical Directory Layout (Repo)

Repo root: `TikTrackAppV2-phoenix/`

Agents_OS root (mandatory):
`agents_os/`

Agents_OS runtime paths (target):
- `agents_os/runtime/`
- `agents_os/agents/`
- `agents_os/validators/`
- `agents_os/tests/`
- `agents_os/documentation/`

Workspaces root (mandatory):
`agents_os/_workspaces/`

Workspaces structure:
```
agents_os/_workspaces/
  S001-P001-WP001/
    WS_S001-P001-WP001_20260222_01/
      repo/
      _EVIDENCE/
      _SUBMISSION/
      _LOGS/
```

---

## 3) Worktree-Based Sandbox Workflow

### 3.1 Create Workspace (preferred)
From repo root:

1) Create a branch for the WP:
- `aos/<work_package_id>`
Example: `aos/S001-P001-WP001`

2) Create a worktree bound to that branch:
- Worktree path:
  `agents_os/_workspaces/<work_package_id>/<workspace_id>/repo/`
- The `repo/` folder is the git worktree checkout.

### 3.2 Work Inside Sandbox
All coding, edits, tests run **only inside** the worktree checkout (`.../repo/`).

### 3.3 Evidence Capture
Evidence is written outside the git checkout into:
`.../_EVIDENCE/`

### 3.4 Submission Pack Generation
Prior to final human review, generate `_SUBMISSION/` containing canonical artifacts (see AOS_SUBMISSION_PACK_SPEC).

### 3.5 Merge Strategy
- Merge changes from `aos/<work_package_id>` into main only after all required gates are PASS.
- No direct commits to main.

---

## 4) Anti-Drift & No-Duplication Rules

1. **No duplication** of canonical documents: do not copy files into communication folders as "new canon".
2. Communication artifacts are pointers + summaries; canonical files live in canonical roots.
3. Evidence folders are write-once, append-only; never edited retroactively.
4. Workspace is disposable; canonical merge is the only source of truth.

---

## 5) Tooling Minimum (Local POC)

- Git (worktree)
- Python or Node runtime for Agents_OS CLI (implementation-specific)
- Test runner (pytest / node test)

---

## 6) Gate Mapping (Agents_OS Execution)

This protocol applies from **GATE_3 (Implementation)** onward for Agents_OS work packages.

- GATE_3: Implementation inside sandbox
- GATE_4: Dev Validation (Team 90) with evidence
- GATE_5: QA (Team 50) with evidence
- GATE_6: Architectural Execution Approval (Team 00) supported by Team 190 spy audit
- GATE_7: Documentation Closure (as-made, archive, clean comms)

---

END OF PROTOCOL
