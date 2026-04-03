# AOS snapshot sync — operator runbook

**Program:** S003-P018 — AOS Snapshot Version Management  
**Canonical location:** `agents-os/core/SYNC_PROCEDURE.md` (copied to client repos as `agents_os_v3/SYNC_PROCEDURE.md` on each sync)  
**date:** 2026-03-27

---

## 1. When to sync

Run a snapshot sync from `agents-os` into the client repo (e.g. TikTrack `agents_os_v3/`) when any of the following is true:

| Trigger | Typical bump |
|--------|----------------|
| New AOS v3 feature or fix merged to `agents-os` `main` | MINOR or PATCH (see section 6) |
| Governance or engine docs under `agents-os/core/` changed | PATCH (docs-only) or MINOR if behavior contracts change |
| `definition.yaml`, pipeline state contracts, or DB migrations under `core/` changed | MINOR or MAJOR (see section 6) |
| Lean Kit or methodology changes **outside** `core/` | Not copied by this sync; no snapshot bump for `core/` unless `core/` itself changed |

**Do not** use this procedure for Lean Kit-only paths (`lean-kit/`); they are out of scope for `core/` rsync.

---

## 2. Prerequisites

1. **Local `agents-os` clone** at the commit you intend to ship (usually `main` after pull).  
   - Verify: `git -C /path/to/agents-os status` — be aware of dirty state; prefer a clean tree when recording SHA.
2. **Client repo** (TikTrack Phoenix) clone with **clean working tree** for `agents_os_v3/` aside from intentional sync outputs, or be ready to commit all sync changes in one commit.
3. **`rsync` installed** on the operator machine (`which rsync`).
4. **Python 3** available for `scripts/update_aos_v3_file_index.py` in the client repo.
5. Decide the **semantic version** label for this sync (`vMAJOR.MINOR.PATCH`) per section 6 before running.

---

## 3. Exact commands

Run from the **client repository root** (e.g. `TikTrackAppV2-phoenix/`).

**Preview (no writes):**

```bash
bash scripts/sync_aos_snapshot.sh \
  --source /Users/nimrod/Documents/agents-os \
  --version v0.1.0 \
  --dry-run
```

**Apply sync:**

```bash
bash scripts/sync_aos_snapshot.sh \
  --source /Users/nimrod/Documents/agents-os \
  --version v0.1.0
```

**Via Makefile:**

```bash
make sync-snapshot SOURCE=/Users/nimrod/Documents/agents-os VERS=v0.1.0
```

Replace `/Users/nimrod/Documents/agents-os` with your local `agents-os` path if different.

**Help:**

```bash
bash scripts/sync_aos_snapshot.sh --help
```

---

## 4. Post-sync (git)

After a successful sync:

```bash
git add agents_os_v3/
git status   # review
git commit -m "sync(aos): vX.Y.Z+SHA"
```

Use the real values from `agents_os_v3/SNAPSHOT_VERSION` (e.g. `v0.1.0+a1b2c3d`) in the commit message when helpful.

Include any other client-repo files touched in the same change set (e.g. `scripts/sync_aos_snapshot.sh`, `Makefile`) in the same or a preceding commit as appropriate.

---

## 5. Validation

Before pushing the client branch:

```bash
bash scripts/check_aos_v3_build_governance.sh
```

This must **PASS** (exit 0). It enforces, among other things, that every file under `agents_os_v3/` on disk is listed in `agents_os_v3/FILE_INDEX.json` and applies v2 freeze rules where configured.

Then run pre-commit on the repo as required by your lane (e.g. `make run-pre-commit-all`).

---

## 6. Version bump decision guide

The `SNAPSHOT_VERSION` file format is:

`SNAPSHOT_VERSION=v{MAJOR}.{MINOR}.{PATCH}+{SHORT_SHA}`

The **semantic part** (`vMAJOR.MINOR.PATCH`) is chosen by the operator; **SHORT_SHA** is always taken from `agents-os` HEAD at sync time by the sync script.

| Bump | When to use |
|------|-------------|
| **PATCH** | Documentation-only or governance text under `core/`; no API, schema, or runtime behavior change. |
| **MINOR** | Backward-compatible engine changes: new optional fields, new modules, bug fixes that do not break existing clients or `definition.yaml` consumers. |
| **MAJOR** | Breaking changes: `definition.yaml` or API contract breaks, removed endpoints, migration steps that require coordinated client updates. |

When in doubt between PATCH and MINOR, choose **MINOR**.

---

**log_entry | SYNC_PROCEDURE | S003_P018 | agents-os/core | 2026-03-27**
