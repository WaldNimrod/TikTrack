---
project_domain: AGENTS_OS
id: TEAM_191_S002_P005_WP002_DATE_LINT_FIXLIST_v1.0.0
from: Team 191 (Git Governance Operations)
to: Team 191
cc: Team 10, Team 00, Team 170, Team 90
date: 2026-03-15
status: ACTIONABLE
scope: DATE-LINT blocking file list and remediation method for S002-P005-WP002 closure lane
---

## Source Check

`bash scripts/lint_governance_dates.sh` (run on 2026-03-15) => `DATE-LINT RESULT: FAIL (9 findings)`.

## Blocking Files (exact)

1. `_COMMUNICATION/_Architects_Decisions/TEAM_00_GATE8_ACTIVATION_DIRECTIVE_S002_P005_WP002_v1.0.0.md`
2. `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_51_S002_P005_WP002_GATE7_BROWSER_DELEGATION_MANDATE_v1.0.0.md`
3. `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_90_S002_P005_WP002_GATE7_PASS_AND_GATE8_ACTIVATION_TRIGGER_v1.0.0.md`
4. `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_ARCHIVE_REPORT.md`
5. `_COMMUNICATION/team_170/TEAM_170_S002_P005_WP002_CANONICAL_EVIDENCE_CLOSURE_CHECK.md`
6. `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_90_S002_P005_WP002_GATE8_VALIDATION_REQUEST.md`
7. `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_00_OBS02_INSIST_RESOLUTION_v1.0.0.md`
8. `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_00_OBS03_TEST_INJECTION_NOTE_v1.0.0.md`
9. `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_00_WP002_GATE7_PREP_COMPLETE_v1.0.0.md`

## Canonical Remediation Rule

For each file above, do exactly one of:
1. Set `date:` to valid non-future value compatible with current WSM reference window.
2. Add `historical_record: true` when historical date is intentional and must be preserved.

## Verification

```bash
bash scripts/lint_governance_dates.sh
```

Expected result: `DATE-LINT RESULT: PASS`.

---

**log_entry | TEAM_191 | S002_P005_WP002_DATE_LINT_FIXLIST | CREATED | 2026-03-15**
