---
id: ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v2.0.0
supersedes: ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0
from: Team 00 (Principal — Nimrod)
to: All teams; Team 191 (Git Governance); pre-commit hook
cc: Team 100 (Chief System Architect)
date: 2026-04-02
type: ARCHITECT_DIRECTIVE — Iron Rule amendment
domain: agents_os
authority: Team 00 Constitutional authority
status: ACTIVE
---

# Architect Directive — AOS v3 File Index Protocol + v2 Freeze — v2.0.0

## Amendment rationale

**AOS v3 development is COMPLETE** as of 2026-04-02.
- S003-P005-WP001 (Pipeline Quality Plan v3.5.0): PASS
- Team 51 QA: PASS (133/0)
- Team 190 Validation: PASS (v1.0.2)
- Backup: committed `bbb380884`, pushed to `origin/aos-v3`

The v1.0.0 freeze was designed for the active development period of AOS v3 to prevent context mixing. That period is over. The freeze is hereby **lifted for LEGACY closure purposes**.

---

## סעיף 1 — UC-15 amendment: v2 freeze status

### Changed from v1.0.0

| Rule | v1.0.0 | v2.0.0 |
|------|--------|--------|
| New files in `agents_os_v2/` | FORBIDDEN | **Permitted for LEGACY CLOSURE only** |
| Code changes to v2 | FORBIDDEN | **Still forbidden** — no bug fixes, no features |
| v2 as reference | Permitted | Permitted |
| LEGACY_NOTICE.md | N/A | **Required** — must exist before any v2 commit |

### LEGACY closure criteria (to be met before any v2 commit is allowed)
1. `agents_os_v2/LEGACY_NOTICE.md` must exist in the working tree
2. The commit may only **add** files (no modifications to existing v2 code)
3. The purpose of added files must be archival/historical record only

### Permanent restrictions (unchanged)
- No bug fixes or feature additions to `agents_os_v2/` code — ever
- No running `agents_os_v2/` in parallel with `agents_os_v3/`
- No mixing of v2 and v3 production contexts

---

## סעיף 2 — FILE_INDEX (unchanged from v1.0.0)

Every staged `agents_os_v3/` file must be registered in `agents_os_v3/FILE_INDEX.json` before commit. This rule is **unchanged and remains in force**.

---

## Hook update instruction

`scripts/lint_aos_v3_file_index_and_v2_freeze.sh` must be updated to:

1. If a staged file is under `agents_os_v2/`:
   - Check that `agents_os_v2/LEGACY_NOTICE.md` exists in the working tree
   - Check that the staged change type is ADD (`A`) only — no modifications to existing v2 files
   - If both conditions met → PASS
   - Otherwise → FAIL (with existing message)
2. FILE_INDEX enforcement for `agents_os_v3/` is unchanged

---

**log_entry | TEAM_00 | AOS_V3_V2_FREEZE_LIFTED_FOR_LEGACY_CLOSURE | 2026-04-02**

historical_record: true
