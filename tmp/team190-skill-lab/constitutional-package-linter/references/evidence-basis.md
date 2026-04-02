# Evidence Basis

This skill is based only on repeated defects observed in recent artifacts, weighted toward the newest cycles.

## Primary Evidence Window

Priority window:

1. `2026-03-13`
2. `2026-03-14`
3. `2026-03-15`
4. `2026-03-16`

Older artifacts were used only when they still matched the current contract model.

## Evidence by Rule

### `CPL-001` and `CPL-002` — date presence and future-date drift

Evidence:

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_PHASE1_VALIDATION_RESULT_v1.0.0.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_HIERARCHY_REVALIDATION_RESULT_v1.0.0.md`
3. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_GOVERNANCE_PHASE0_VALIDATION_RESULT_v1.0.0.md`
4. `_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md`

Observed pattern:

1. repeated `BLOCK_FOR_FIX` due to temporal inconsistency,
2. repeated need to normalize `date` and `log_entry`,
3. repeated special handling for `historical_record: true`.

### `CPL-003` — `phase_owner` placeholder drift

Evidence:

1. `_COMMUNICATION/_ARCHITECT_INBOX/AGENT_OS_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P005_TEAM_SKILLS_ALIGNMENT/TEAM_190_ARCHITECT_DECISION_ACCELERATOR_SKILLS_ALIGNMENT_v1.0.0.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_ALL_TEAMS_SKILLS_DISCOVERY_SUBMISSION_PROMPT_v1.0.0.md`

Observed pattern:

1. incoming reports with `phase_owner` placeholder values,
2. metadata inconsistency across otherwise valid packages,
3. avoidable architect review noise.

### `CPL-004` — missing `correction_cycle`

Evidence:

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_S002_P002_WP003_PLAN_REVALIDATION_RESULT_v1.0.0.md`
2. `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_190_GOVERNANCE_PHASE0_VALIDATION_REQUEST_v1.0.0.md`
3. `_COMMUNICATION/team_170/TEAM_170_TO_TEAM_190_AGENTS_OS_DOCS_REMEDIATION_RESUBMISSION_v1.0.0.md`

Observed pattern:

1. revalidation packages missing lineage notes triggered explicit remediation,
2. once `correction_cycle` was added, review became deterministic.

### `CPL-005` and `CPL-006` — findings table schema

Evidence:

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_170_TEAM_00_IDEA_PIPELINE_HIERARCHY_VALIDATION_RESULT_v1.0.0.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_TEAM_170_AOS_AUDIT_ROUND1_VALIDATION_RESULT_v1.0.0.md`
3. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_61_AGENTS_OS_UI_OPTIMIZATION_VALIDATION_RESULT_v1.0.0.md`
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_51_AGENTS_OS_UI_IMPLEMENTATION_VALIDATION_RESULT_v1.2.0.md`

Observed pattern:

1. Team 190 findings stabilize when the table includes path evidence and route recommendation,
2. missing schema fields increase follow-up clarification.

## Exclusions

The MVP deliberately does not lint:

1. business-scope correctness,
2. roadmap placement,
3. gate legality,
4. WSM-vs-registry consistency,
5. supersession chains.

Those require separate logic and should be added only after this MVP is proven stable.
