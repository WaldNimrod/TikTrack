---
historical_record: true
id: TEAM_100_TO_TEAM_191_S003_P018_AOS_SNAPSHOT_VERSION_MANAGEMENT_ACTIVATION_v1.0.0
from: Team 100 (Architecture — acting on Team 00 authority)
to: Team 191 (GitHub & Git lane — Cursor Composer)
cc: Team 00 (Principal), Team 190 (GATE_5 validator), Team 10 (TikTrack Gateway)
date: 2026-04-03
type: BUILD_ACTIVATION
program_id: S003-P018
domain: AGENTS_OS
lod_source: TEAM_00_LOD200_S003_P018_AOS_SNAPSHOT_VERSION_MANAGEMENT_v1.0.0.md
gate_entry: GATE_3 (LOD200 approved by Team 00 — GATE_1/GATE_2 covered by principal authorship)
gate_5_validator: Team 190
status: ACTIVE
---

# Activation Prompt — S003-P018: AOS Snapshot Version Management

## Identity

You are **Team 191 (GitHub & Backup)** running in **Cursor Composer**.
Program: **S003-P018 — AOS Snapshot Version Management**
Authority: Team 100 mandate, Team 00 LOD200 approval (2026-04-03).

**Do not start without reading the full LOD200.** Path:
```
_COMMUNICATION/team_00/TEAM_00_LOD200_S003_P018_AOS_SNAPSHOT_VERSION_MANAGEMENT_v1.0.0.md
```

---

## Context

The `agents_os_v3/` directory in TikTrack is a deployed snapshot of `agents-os/core/`. With the bridge model active (Phase B/C), snapshot and source will diverge. This program delivers the minimum viable version management layer: a version file, a sync script, and an operator runbook.

**Current state (verified 2026-04-03):**
- `agents_os_v3/` ≡ `agents-os/core/` — zero divergence
- `FILE_INDEX.json` version: v1.1.29
- `agents-os` local path: `/Users/nimrod/Documents/agents-os/`
- `agents-os` remote: `git@github.com:WaldNimrod/agents-os.git`

---

## Deliverables (6 total)

| # | File | Repo | Description |
|---|------|------|-------------|
| D1 | `agents_os_v3/SNAPSHOT_VERSION` | TikTrack | Initial version file — see format below |
| D2 | `scripts/sync_aos_snapshot.sh` | TikTrack | Sync script — see spec below |
| D3 | `agents_os_v3/SYNC_PROCEDURE.md` | TikTrack | Operator runbook (copied from D4 on first sync) |
| D4 | `agents-os/core/SYNC_PROCEDURE.md` | agents-os | Source procedure doc — canonical copy |
| D5 | `agents_os_v3/FILE_INDEX.json` | TikTrack | Auto-updated by pre-commit hook after sync |
| D6 | `Makefile` — `sync-snapshot` target | TikTrack | `make sync-snapshot SOURCE=<path> VERS=<version>` |

---

## D1 — SNAPSHOT_VERSION file

Location: `agents_os_v3/SNAPSHOT_VERSION`

Content (initial value):
```
SNAPSHOT_VERSION=v0.1.0+<SHORT_SHA>
```
Where `<SHORT_SHA>` = output of `git -C /Users/nimrod/Documents/agents-os rev-parse --short HEAD` at time of execution.

Format rule: `SNAPSHOT_VERSION=v{MAJOR}.{MINOR}.{PATCH}+{SHORT_SHA}` — exactly one line, no trailing whitespace.

---

## D2 — Sync script specification

Location: `scripts/sync_aos_snapshot.sh`

```bash
#!/usr/bin/env bash
# scripts/sync_aos_snapshot.sh
# Usage: bash scripts/sync_aos_snapshot.sh --source <agents-os-path> --version <semver> [--dry-run]
#
# Syncs agents-os/core/ → agents_os_v3/ and updates SNAPSHOT_VERSION.
```

**Required parameters:**
- `--source <path>` — absolute path to agents-os local clone (must contain `core/`)
- `--version <semver>` — semantic version e.g. `v0.1.0` (no SHA — script captures it)
- `--dry-run` (optional) — diff only, no writes, exit 0

**Steps the script must execute (in order):**
1. Parse and validate arguments (exit 1 if `--source` or `--version` missing)
2. Verify `<source>/core/` exists (exit 1 if not)
3. Verify `rsync` is installed (exit 1 if not)
4. Capture: `SHORT_SHA=$(git -C "$SOURCE" rev-parse --short HEAD)`
5. If `--dry-run`: print `rsync --dry-run` diff between `<source>/core/` and `agents_os_v3/`, exit 0
6. Run: `rsync -av --delete --exclude='.git' "<source>/core/" agents_os_v3/`
7. Write: `echo "SNAPSHOT_VERSION=${VERSION}+${SHORT_SHA}" > agents_os_v3/SNAPSHOT_VERSION`
8. Run: `python3 scripts/update_aos_v3_file_index.py` (exit 1 if non-zero)
9. Print summary: `Sync complete: ${N} files changed, version=${VERSION}+${SHORT_SHA}`
10. Exit 0

**Error conditions → exit 1 with message:**
- `--source` not provided
- `--version` not provided (unless `--dry-run` only, in which case skip validation)
- `<source>/core/` does not exist
- `rsync` not installed
- `update_aos_v3_file_index.py` exits non-zero

---

## D4 — SYNC_PROCEDURE.md content (source in agents-os)

Location: `agents-os/core/SYNC_PROCEDURE.md` (then copied to `agents_os_v3/SYNC_PROCEDURE.md` by sync script)

The document must cover all 6 sections from LOD200 §6:
1. When to sync (PATCH/MINOR/MAJOR criteria)
2. Prerequisites (local `agents-os` at correct HEAD, working directory clean)
3. Exact commands
4. Post-sync: `git add agents_os_v3/ && git commit -m "sync(aos): vX.Y.Z+SHA"`
5. Validation: `bash scripts/check_aos_v3_build_governance.sh` must pass
6. Version bump decision guide (PATCH / MINOR / MAJOR table)

---

## D6 — Makefile target

Add to existing `Makefile`:
```makefile
sync-snapshot:
	bash scripts/sync_aos_snapshot.sh --source $(SOURCE) --version $(VERS)
```

Usage: `make sync-snapshot SOURCE=/Users/nimrod/Documents/agents-os VERS=v0.1.0`

---

## Acceptance Criteria (10 ACs — all must pass before filing completion)

| AC | Test | Pass condition |
|----|------|---------------|
| AC-01 | `cat agents_os_v3/SNAPSHOT_VERSION` | Single line matching `SNAPSHOT_VERSION=v0.1.0+<SHA>` |
| AC-02 | `bash scripts/sync_aos_snapshot.sh --help` | Exit 0, usage text printed |
| AC-03 | `bash scripts/sync_aos_snapshot.sh --source /Users/nimrod/Documents/agents-os --version v0.1.0 --dry-run` | Exit 0, diff output, no files written |
| AC-04 | Full sync run then `diff -r agents-os/core/ agents_os_v3/ --exclude=SNAPSHOT_VERSION --exclude=FILE_INDEX.json --exclude=SYNC_PROCEDURE.md` | Empty diff |
| AC-05 | Pre-commit hook `AOS v3 FILE_INDEX` passes after sync | Hook exits 0 |
| AC-06 | `make sync-snapshot SOURCE=/Users/nimrod/Documents/agents-os VERS=v0.1.0` | Runs without error |
| AC-07 | `agents_os_v3/SYNC_PROCEDURE.md` and `agents-os/core/SYNC_PROCEDURE.md` both exist | Files present, non-empty, contain all 6 sections |
| AC-08 | SNAPSHOT_VERSION SHA matches `git -C /Users/nimrod/Documents/agents-os rev-parse --short HEAD` | SHA values equal |
| AC-09 | `make run-pre-commit-all` (or equivalent) after sync commit | All BLOCKING hooks PASS |
| AC-10 | `bash scripts/sync_aos_snapshot.sh --source /nonexistent --version v0.1.0` | Exit 1 with error message |

---

## Open Items (resolve during build, document in completion report)

| OI | Item | Decision needed from |
|----|------|---------------------|
| OI-01 | Confirm `rsync` available in CI environment | Team 191 (check) |
| OI-02 | Makefile defaults for SOURCE and VERS | Team 191 judgment (document in completion report) |
| OI-03 | Confirm `/Users/nimrod/Documents/agents-os` is the canonical local path | Team 00 (assumed confirmed — local execution context) |

---

## Execution scope and constraints

**In scope:**
- 6 deliverables listed above
- TikTrack repo and agents-os repo changes only
- Initial version = `v0.1.0`

**Out of scope (do NOT implement):**
- Automatic CI sync on AOS commits
- Rollback / downgrade procedure
- SmallFarmsAgents / EyalAmit repo (S003-P019)
- Any TikTrack application feature changes
- Lean Kit template sync

**Repository paths:**
- TikTrack: `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`
- agents-os: `/Users/nimrod/Documents/agents-os/`

---

## Completion report

On completion, file:

```
_COMMUNICATION/_ARCHITECT_INBOX/TEAM_191_TO_TEAM_100_S003_P018_COMPLETION_REPORT_v1.0.0.md
```

Required fields in completion report header:
```yaml
from: Team 191
to: Team 100
cc: Team 00, Team 190
date: 2026-04-03
program_id: S003-P018
acs_pass: <list of AC IDs that PASS>
acs_fail: <list if any>
oi_01_rsync: <finding>
oi_02_makefile_defaults: <decision>
git_commits: <list of commit SHAs and repos>
overall_verdict: PASS / PASS_WITH_FINDINGS / FAIL
```

Self-QA before filing:
- [ ] AC-01..AC-10 all tested, results documented
- [ ] `agents_os_v3/SNAPSHOT_VERSION` committed to TikTrack
- [ ] `agents-os/core/SYNC_PROCEDURE.md` committed and pushed to `agents-os` remote
- [ ] `scripts/sync_aos_snapshot.sh` committed to TikTrack
- [ ] `Makefile` `sync-snapshot` target committed to TikTrack
- [ ] No `agents_os_v2/` files touched (v2 FREEZE — BLOCKING pre-commit hook)
- [ ] `FILE_INDEX.json` auto-updated and committed
- [ ] All BLOCKING pre-commit hooks pass

---

## Gate 5 (GATE_5)

After completion report is filed and Team 100 reviews:
- Team 190 receives GATE_5 validation request
- Team 190 validates AC-01..AC-10 independently
- GATE_5 PASS → S003-P018 lifecycle COMPLETE → S003-P019 unblocked

**Iron Rule — Cross-Engine Validation (locked 2026-03-16):**
Team 191 (Cursor) builds → Team 190 (OpenAI/Codex) validates at GATE_5.
These are different engines. This is mandatory, not optional.

---

**log_entry | TEAM_100 | S003_P018_BUILD_ACTIVATION | TEAM_191 | GATE_3_ENTRY | 2026-04-03**
