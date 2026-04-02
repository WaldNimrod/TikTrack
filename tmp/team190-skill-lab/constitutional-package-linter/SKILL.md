---
name: constitutional-package-linter
description: "Preflight canonical governance, validation, revalidation, and remediation markdown packages before Team 190 or Team 100 review. Use when checking `_COMMUNICATION` or architect-intake `.md` files for evidence-backed contract failures seen in recent Phoenix artifacts: missing or future dates, placeholder `phase_owner` values in Mandatory Identity Header, missing `correction_cycle` on revalidation/remediation packages, and malformed validation findings tables missing `evidence-by-path` or `route_recommendation`."
---

# Constitutional Package Linter

Use this skill to catch technical package defects before constitutional review.

This skill is intentionally narrow. It only enforces checks that were repeatedly observed in recent artifacts and validation loops. It is not a general markdown linter and it does not decide architecture.

## Quick Start

Run the linter on one or more markdown files:

```bash
python3 scripts/lint_constitutional_package.py /absolute/path/to/file.md
python3 scripts/lint_constitutional_package.py _COMMUNICATION/team_170/foo.md _COMMUNICATION/team_190/bar.md
```

Run the bundled tests:

```bash
python3 scripts/test_lint_constitutional_package.py
```

## Workflow

1. Select candidate package files before review or submission.
2. Run `scripts/lint_constitutional_package.py` on the files.
3. Read findings first. The script exits non-zero when blocking issues are found.
4. Fix metadata or schema drift in the original files.
5. Re-run the linter until it passes.

## What This Skill Checks

The current MVP checks only evidence-backed failure classes:

1. `CPL-001`: missing document date.
2. `CPL-002`: future-dated document relative to current UTC day.
3. `CPL-003`: `phase_owner` is still a placeholder such as `RECEIVING_TEAM`.
4. `CPL-004`: revalidation/remediation/resubmission-style package is missing `correction_cycle`.
5. `CPL-005`: validation-result findings table is missing `evidence-by-path` or `evidence_by_path`.
6. `CPL-006`: validation-result findings table is missing `route_recommendation`.

These checks were selected from recent Team 190 findings and cross-team submissions. See `references/evidence-basis.md`.

## Boundaries

Do not use this skill to:

1. approve architecture,
2. decide ownership routing,
3. interpret business logic,
4. rewrite documents automatically without review.

This skill is a preflight assistant. Constitutional judgment remains with Team 190 and architectural judgment remains with Team 100 or Team 00.

## Output Interpretation

The linter emits:

1. `PASS` when no findings are detected,
2. one line per finding with `finding_id`, `severity`, file path, and message,
3. non-zero exit code when findings are present.

Treat findings as pre-validation blockers for package hygiene, not as final constitutional verdicts.

## Resources

### `scripts/`

Use `scripts/lint_constitutional_package.py` for the actual checks.

Use `scripts/test_lint_constitutional_package.py` to validate the linter behavior on evidence-derived fixtures.

### `references/`

Read `references/evidence-basis.md` when adjusting rules. It lists the recent artifacts that justified each rule.

Read `references/check-catalog.md` for the current rule catalog and intended scope.
