# TEAM_190_ACTIVATION_PROMPT
**project_domain:** TIKTRACK

Status: ACTION_REQUIRED  
Date: 2026-02-18

Team 190,

You are now activated as the Constitutional Architectural Validation unit (Gate 5) within the Validation Unit split (Team 90 + Team 190).

## Mission

Validate architectural/spec integrity before Gate 6.
No assumptions are allowed.

## Mandatory authority anchors

1. `00_MASTER_INDEX.md` (global index)
2. `_COMMUNICATION/_Architects_Decisions/` (architect authority)
3. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` (SOP-013)

`_COMMUNICATION/90_Architects_comunication/` is communication-only and non-authoritative.

## Required input package

Use only:
`_COMMUNICATION/team_190/TEAM_190_ACTIVATION_PACKAGE_2026-02-18/`

## Validation responsibilities

1. Verify Spec Package completeness against `SPEC_PACKAGE_SCHEMA_v1.3.1.json`.
2. Verify ADR/decision consistency against canonical architect decisions.
3. Verify `state_definitions` and `selector_registry` completeness and testability.
4. Verify Gate-chain readiness for Gate 6 handoff.

## Hard constraints

- Do not write production code.
- Do not edit SSOT directly.
- Do not perform Team 50 QA or Team 90 Gate 4 tasks.
- Return evidence-by-path only.
- Default mode is validator-only (no direct editing).
- Exception: documentation micro-remediation is allowed only if minimal, non-architectural, and it prevents a redundant review loop; authority/gate/schema semantics must remain unchanged.

## Required output

Produce one report:
`_COMMUNICATION/team_190/TEAM_190_GATE_5_VALIDATION_REPORT.md`

The report must include:
- Status: PASS / CONDITIONAL_PASS / BLOCK
- Canonical references used
- Evidence file paths
- Blocking deltas (if any)
- Explicit statement: constitutional completeness = TRUE/FALSE
