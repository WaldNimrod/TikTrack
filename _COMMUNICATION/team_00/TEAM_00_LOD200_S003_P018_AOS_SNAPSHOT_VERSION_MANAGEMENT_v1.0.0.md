---
lod_target: LOD200
lod_status: APPROVED
track: A
authoring_team: team_00
consuming_team: team_100
date: 2026-04-03
version: v1.0.0
supersedes: TEAM_00_LOD100_S003_P018_AOS_SNAPSHOT_VERSION_MANAGEMENT_v1.0.0.md
program_id: S003-P018
domain: AGENTS_OS
approved_by: Team 00 (Nimrod)
historical_record: true
---

# LOD200 — AOS Snapshot Version Management

**id:** S003-P018
**status:** LOD200 / APPROVED
**date:** 2026-04-03
**gate_target:** GATE_0 → GATE_5 (Track A)
**executor:** Team 191 (build) + Team 190 (GATE_5 validation)

---

## §1 — Problem Statement

The `agents_os_v3/` directory inside TikTrack (and future client repos) is a deployed snapshot
of `agents-os/core/`. With the bridge model now active, snapshot and source will diverge over
time. Without a formal versioning + sync process:

- No one knows which version of `agents-os/core/` any given repo's snapshot represents
- Manual syncs produce untraceable diffs
- Multi-project adoption (S003-P019) is impossible: each client repo could silently drift

This program defines the **minimum viable version management layer** for the bridge period
(Phases B and C of ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md).

---

## §2 — Decisions (locked at LOD200)

### D-01: Version format

`SNAPSHOT_VERSION` file contains a single line:

```
SNAPSHOT_VERSION=v{MAJOR}.{MINOR}.{PATCH}+{SHORT_SHA}
```

Example: `SNAPSHOT_VERSION=v0.1.0+4b24f8c`

- **Semantic version** (vMAJOR.MINOR.PATCH): manually bumped by the sync operator
  - PATCH: documentation/governance-only changes, no behavioral diff
  - MINOR: new AOS features or Lean Kit content additions (backward-compatible)
  - MAJOR: breaking changes to APIs, hooks, or definition.yaml schema
- **SHORT_SHA**: the 7-char git commit SHA from `agents-os` HEAD at sync time (for traceability)
- File lives at `agents_os_v3/SNAPSHOT_VERSION` in every client repo

### D-02: Sync command interface

A single bash script: `scripts/sync_aos_snapshot.sh`

Located in **each client repo** (TikTrack first, template for future repos).
Accepts parameters from `agents-os` local path:

```bash
bash scripts/sync_aos_snapshot.sh --source /path/to/agents-os --version v0.2.0
```

Optional: `--dry-run` (preview diff only, no write).

The script does NOT live in `agents-os/` itself — client repos own their sync process.
`agents-os/` provides **only** the source; sync logic is a client concern.

### D-03: Scope of sync

The sync copies `agents-os/core/` → `agents_os_v3/` with these rules:

| Include | Exclude |
|---------|---------|
| All files in `agents-os/core/` | `agents-os/lean-kit/` (separate, not part of runtime) |
| Updates `agents_os_v3/SNAPSHOT_VERSION` | `agents-os/projects/` (external project registry) |
| Updates `agents_os_v3/FILE_INDEX.json` (re-run indexer) | `.git/` and any `.gitignore`-listed items |

### D-04: Pre-commit hook integration

After sync, the existing hooks run automatically on staged files:
- `FILE_INDEX enforcement` (BLOCKING) — must pass before commit
- `date-lint` — synced files from a prior date get `historical_record: true` automatically
- `v2 FREEZE` — enforced (no `agents_os_v2/` edits)

No new hooks required for this program.

### D-05: Sync documentation location

A `SYNC_PROCEDURE.md` file lives at `agents-os/core/SYNC_PROCEDURE.md` and is copied into
`agents_os_v3/SYNC_PROCEDURE.md` on each sync. It contains the operator runbook.

---

## §3 — Deliverables

| # | Deliverable | File path (TikTrack repo) | Owner |
|---|------------|--------------------------|-------|
| D1 | `SNAPSHOT_VERSION` initial file | `agents_os_v3/SNAPSHOT_VERSION` | Team 191 |
| D2 | Sync script | `scripts/sync_aos_snapshot.sh` | Team 191 |
| D3 | Sync procedure doc | `agents_os_v3/SYNC_PROCEDURE.md` | Team 191 |
| D4 | Source procedure (agents-os) | `agents-os/core/SYNC_PROCEDURE.md` | Team 191 |
| D5 | `FILE_INDEX.json` updated | `agents_os_v3/FILE_INDEX.json` | auto (hook) |
| D6 | Makefile target | `Makefile` — `sync-snapshot` | Team 191 |

---

## §4 — Acceptance Criteria

| ID | Criterion | Test method |
|----|-----------|-------------|
| AC-01 | `agents_os_v3/SNAPSHOT_VERSION` exists, format matches D-01 | `cat agents_os_v3/SNAPSHOT_VERSION` |
| AC-02 | `scripts/sync_aos_snapshot.sh --help` exits 0 with usage text | direct invocation |
| AC-03 | `bash scripts/sync_aos_snapshot.sh --source /path/to/agents-os --version v0.1.0 --dry-run` prints diff, writes nothing | diff before/after shows no changes |
| AC-04 | Full sync run produces clean `agents_os_v3/` with zero diff from `agents-os/core/` | `diff -r agents-os/core/ agents_os_v3/ --exclude=SNAPSHOT_VERSION --exclude=FILE_INDEX.json` → empty |
| AC-05 | `FILE_INDEX.json` auto-updated after sync (hook passes) | pre-commit hook PASS |
| AC-06 | `make sync-snapshot` target runs the script with correct defaults | `make sync-snapshot SOURCE=/path VERS=v0.1.0` |
| AC-07 | `SYNC_PROCEDURE.md` exists in both repos with operator runbook | file present, non-empty |
| AC-08 | SNAPSHOT_VERSION includes git SHA from `agents-os` HEAD | SHA matches `git -C /path/to/agents-os rev-parse --short HEAD` |
| AC-09 | All pre-commit hooks pass after sync commit | `make run-pre-commit-all` → PASS |
| AC-10 | Script exits non-zero on invalid `--source` path | `bash sync_aos_snapshot.sh --source /nonexistent` → exit 1 |

---

## §5 — Sync script — specification

```bash
# scripts/sync_aos_snapshot.sh
# Usage: bash scripts/sync_aos_snapshot.sh --source <agents-os-path> --version <semver> [--dry-run]
#
# Steps:
#   1. Validate --source path exists and contains core/
#   2. Capture SHORT_SHA from git -C <source> rev-parse --short HEAD
#   3. If --dry-run: diff core/ vs agents_os_v3/ and exit 0
#   4. rsync agents-os/core/ → agents_os_v3/  (delete-after, exclude .git)
#   5. Write agents_os_v3/SNAPSHOT_VERSION = "SNAPSHOT_VERSION=<version>+<SHA>"
#   6. Run python3 scripts/update_aos_v3_file_index.py
#   7. Print summary: N files changed, version=<version>, sha=<SHA>
#   8. Exit 0
```

**Error conditions → exit 1:**
- `--source` not provided
- `--version` not provided (unless `--dry-run` only)
- `--source` path does not contain `core/` subdirectory
- `rsync` not installed
- `update_aos_v3_file_index.py` exits non-zero

---

## §6 — SYNC_PROCEDURE.md content (operator runbook)

The document must cover:
1. When to sync (decision criteria: new AOS feature merged, governance doc updated, Lean Kit content changed)
2. Prerequisites (local `agents-os` clone at correct HEAD, working directory clean)
3. Exact commands: `bash scripts/sync_aos_snapshot.sh --source ... --version ...`
4. Post-sync: `git add agents_os_v3/ && git commit -m "sync(aos): vX.Y.Z+SHA"`
5. Validation: `bash scripts/check_aos_v3_build_governance.sh` must pass
6. Version bump table (PATCH / MINOR / MAJOR decision guide)

---

## §7 — Sequencing + constraints

```
Pre-condition (verified 2026-04-03):
  agents_os_v3/ ≡ agents-os/core/  (zero divergence)
  FILE_INDEX.json v1.1.29

This program:
  GATE_0 → GATE_5 (Team 191 build + Team 190 validate)

Post-condition required for S003-P019:
  agents_os_v3/SNAPSHOT_VERSION exists
  scripts/sync_aos_snapshot.sh working
  SYNC_PROCEDURE.md published
```

---

## §8 — Out of scope (explicit)

- Automatic CI sync on AOS commits
- Rollback / downgrade procedure (S004+ if needed)
- SmallFarmsAgents / EyalAmit repo setup (that is S003-P019)
- Any TikTrack application feature changes
- Lean Kit template sync (different artifact, different scope)

---

## §9 — Open items (to resolve at GATE_1 spec review)

| # | Item | Owner |
|---|------|-------|
| OI-01 | Confirm `rsync` is available in all target environments | Team 191 |
| OI-02 | Decide Makefile defaults for `SOURCE` and `VERS` params | Team 100 |
| OI-03 | Confirm `agents-os` local path convention for each dev machine | Team 00 (Nimrod) |

---

**log_entry | TEAM_00 | LOD200_APPROVED | S003_P018 | AOS_SNAPSHOT_VERSION_MANAGEMENT | GATE_0_AUTHORIZED | 2026-04-03**
