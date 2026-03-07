# TEAM_190_TO_TEAM_00_TEAM_100_TEAM_170_PORTFOLIO_IDENTIFIER_AND_DATE_REMEDIATION_PROMPT_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_TO_TEAM_00_TEAM_100_TEAM_170_PORTFOLIO_IDENTIFIER_AND_DATE_REMEDIATION_PROMPT  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 00 (Chief Architect), Team 100 (Architecture Authority), Team 170 (Spec Owner / Canonical Librarian)  
**cc:** Team 10  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED  
**gate_id:** GOVERNANCE_PROGRAM  
**scope:** Canonical portfolio identifier remediation + Team 00 date-header remediation

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Blocking Findings

### P0-01 — Invalid canonical program identifiers (blocks portfolio snapshot)

`python scripts/portfolio/build_portfolio_snapshot.py --check` fails because the canonical program registry contains invalid placeholders instead of legal identifiers `S{NNN}-P{NNN}`.

Affected canonical file:
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

Blocking rows:
- `S003-P0XX`
- `S003-P0YY`
- `S004-P0XX`
- `S004-P0YY`
- `S004-P0ZZ`
- `S005-P0XX`

Evidence lines:
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:44`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:45`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:46`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:47`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:48`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md:49`

### P1-01 — Team 100 internal map still mirrors invalid placeholders

Affected non-canonical planning file:
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md`

Evidence lines:
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:166`
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:167`
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:199`
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:200`
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:201`
- `_COMMUNICATION/team_100/TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md:256`

### P1-02 — Team 00 document missing parseable date header

Affected file:
- `_COMMUNICATION/team_00/TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE_v1.0.0.md`

Issue:
- file contains `effective_date`, but no canonical `**date:** YYYY-MM-DD` or `date: YYYY-MM-DD`

---

## 2) Required Actions

### Team 00 + Team 100 (numbering authority)

1. Assign final canonical program IDs for all six placeholder programs.
2. Do not leave placeholder tokens (`P0XX`, `P0YY`, `P0ZZ`) in any active artifact.

### Team 170 (canonical artifact executor)

1. Update `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` with the architect-approved final IDs.
2. Preserve row order and all existing scope text; only replace invalid identifiers and any dependent wording.

### Team 100

1. Update `TEAM_100_AGENTS_OS_MASTER_PROGRAM_MAP_v1.0.0.md` so it mirrors the final canonical IDs exactly.

### Team 00

1. Add canonical `**date:** 2026-02-27` (or another factually correct date) to:
   - `_COMMUNICATION/team_00/TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE_v1.0.0.md`
2. Keep `effective_date` if needed; this is additive, not a rewrite.

---

## 3) Validation Rule

- `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` must contain only identifiers matching `S{NNN}-P{NNN}`.
- Team 100 internal map must match those exact IDs.
- Team 00 note must contain a parseable canonical `date` header.

---

## 4) Response Required

Return a closure response with:
1. Final assigned identifiers
2. Updated file paths
3. Confirmation that `build_portfolio_snapshot --check` is unblocked on identifier format

---

**log_entry | TEAM_190 | PORTFOLIO_IDENTIFIER_AND_DATE_REMEDIATION_PROMPT | ISSUED | 2026-03-01**
