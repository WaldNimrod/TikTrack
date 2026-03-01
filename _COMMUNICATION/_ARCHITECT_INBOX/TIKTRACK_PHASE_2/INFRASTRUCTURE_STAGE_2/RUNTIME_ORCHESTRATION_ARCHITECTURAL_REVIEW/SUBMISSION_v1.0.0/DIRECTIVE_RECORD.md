# DIRECTIVE_RECORD — Requested Architecture Lock Scope
**project_domain:** TIKTRACK
**date:** 2026-03-01

**architectural_approval_type:** SPEC

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 00 / Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

## Directive items requested

### D-01 — Runtime authority
Approve one canonical execution substrate for gate-relevant background jobs.

### D-02 — Scheduler-as-code
Require scheduler registration to exist as a versioned repo artifact, not only as machine-local host state.

### D-03 — Runtime tuple contract
Require a machine-checkable readiness tuple before runtime evidence is eligible for gate use.

### D-04 — Evidence provenance
Require gate artifacts to classify runtime evidence explicitly as:
- `TARGET_RUNTIME`
- `LOCAL_DEV_NON_AUTHORITATIVE`

### D-05 — Operational health contract
Require a canonical status surface for:
- last run
- exit code
- runtime classification
- failure reason
- stdout/stderr references

### D-06 — Migration path
Require a transition note from host-coupled scheduling to the chosen canonical orchestration model.

## Non-goals of this directive

This submission does not ask to:
- approve a specific scheduler vendor
- approve cloud deployment details now
- approve one specific script implementation as final
