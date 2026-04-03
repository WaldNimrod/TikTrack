---
id: TEAM_100_TO_TEAM_191_PFS_HYGIENE_TEAM190_FILES_MANDATE_v1.0.0
from: Team 100 (Architecture — acting on Team 00 authority)
to: Team 191 (GitHub & Git lane — Cursor Composer)
cc: Team 00 (Principal), Team 190 (affected team)
date: 2026-04-03
type: HYGIENE_MANDATE
priority: LOW
status: ACTIVE
blocking: NONE
source_finding: S003-P018 GATE_5 F-01 (MINOR) — Team 190 GATE_5 validation result v1.0.0
---

# Hygiene Mandate — PFS Hook Violations in Team 190 Historical Files

## Context

`make run-pre-commit-all` fails on 11 files in `_COMMUNICATION/team_190/` due to `owner_next_action:` field or `owner_next_action` section headers. This violates `ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md`.

These are historical activation prompts and operational documents from 2026-04-02 and earlier. The fix is to remove the prohibited field/section from each file.

This is a hygiene fix — does NOT block any program. Execute when convenient, before the next `make run-pre-commit-all` is required.

## Scope — 11 files to fix

All in `_COMMUNICATION/team_190/`:

1. `TEAM_190_ACTIVATION_PROMPT.md`
2. `TEAM_190_TO_TEAM_100_AGENTS_OS_STATE_ALIGNMENT_EXECUTION_PACKAGING_PROMPT_v1.0.0.md`
3. `TEAM_190_ACTIVATION_PROMPT_UNIFIED_REVALIDATION_SESSION_20260402_v1.0.0.md`
4. `TEAM_190_ACTIVATION_PROMPT_SESSION_20260402_RESUBMISSION_v3.0.0.md`
5. `TEAM_190_ACTIVATION_PROMPT_SESSION_20260402_RESUBMISSION_v1.0.0.md`
6. `TEAM_190_TO_TEAM_191_GITHUB_COMMUNICATION_DATE_GOVERNANCE_MANDATE_v1.0.0.md`
7. `TEAM_190_TO_TEAM_191_GIT_GOVERNANCE_ACTIVATION_PROMPT_v1.0.0.md`
8. `TEAM_190_ACTIVATION_PROMPT_SESSION_20260402_RESUBMISSION_v2.0.0.md`
9. `TEAM_190_TO_TEAM_191_GITHUB_COMMUNICATION_DATE_GOVERNANCE_VALIDATION_RESULT_v1.0.0.md`
10. `TEAM_190_ACTIVATION_PROMPT_SESSION_20260402_VALIDATION_v1.0.0.md`
11. `TEAM_190_TO_TEAM_191_S003_P018_GATE5_VALIDATION_RESULT_v1.0.0.md`

## Fix instruction

For each file, find and remove the `owner_next_action:` field or `## owner_next_action` section.

The PFS hook BLOCK pattern:
```
BLOCK_REGEX='##[[:space:]]*owner_next_action|owner_next_action:[[:space:]]*|owner_next_action[[:space:]]*$'
```

**Replacement strategy:**
- If `owner_next_action: <value>` is a frontmatter field → delete the line entirely
- If `## owner_next_action` is a section header → delete the section header + its content (or convert to `## Routing Note` if content is worth preserving)
- Do NOT add `historical_record: true` — that does not bypass this hook

## Verification

After edits:
```bash
bash scripts/lint_process_functional_separation.sh _COMMUNICATION/team_190/TEAM_190_ACTIVATION_PROMPT.md
# Should print: [PROCESS-FUNCTIONAL-SEPARATION] Result: PASS
```

Run for all 11 files, then:
```bash
make run-pre-commit-all
# Should pass on these 11 files
```

## Completion

File a brief completion notice at:
```
_COMMUNICATION/_ARCHITECT_INBOX/TEAM_191_TO_TEAM_100_PFS_HYGIENE_COMPLETION_v1.0.0.md
```

Required fields:
```yaml
files_fixed: 11
pfs_result: PASS
make_run_pre_commit_all: PASS
```

**log_entry | TEAM_100 | PFS_HYGIENE_MANDATE | TEAM_191 | 11_FILES | S003_P018_F01_FOLLOW_UP | 2026-04-03**
