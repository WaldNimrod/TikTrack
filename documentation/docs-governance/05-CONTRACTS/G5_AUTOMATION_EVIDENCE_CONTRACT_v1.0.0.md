# G5_AUTOMATION_EVIDENCE_CONTRACT_v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 170 (canonical); issuer at GATE_5: Team 90
gate: GATE_5 only
date: 2026-03-10
authority: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0

---

## 1) Purpose

Define the canonical schema and validity rules for `G5_AUTOMATION_EVIDENCE.json`. This artifact is the mandatory evidence for GATE_5 (Canonical Superset Validation). Issuer: Team 90. Artifact invalid if missing any required field.

---

## 2) JSON Schema (minimal required)

```json
{
  "work_package_id": "S00X-P00X-WP00X",
  "gate_id": "GATE_5",
  "verdict": "PASS | FAIL",
  "run_timestamp": "ISO8601",
  "test_suite_type": "canonical_superset",
  "total_tests": 0,
  "passed": 0,
  "failed": 0,
  "skipped": 0,
  "severe_blockers": 0,
  "flakiness_controls": {
    "seed": "fixed_value_or_none",
    "timeout_policy": "per_test_ms",
    "retry_policy": "no_retry_on_first_run"
  },
  "evidence_artifacts": ["path/to/report"],
  "issuer_team": "Team 90"
}
```

---

## 3) Mandatory Fields and Type Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| work_package_id | string | YES | S{NNN}-P{NNN}-WP{NNN} format |
| gate_id | string | YES | Must be "GATE_5" |
| verdict | string | YES | "PASS" or "FAIL" only |
| run_timestamp | string | YES | ISO 8601 UTC |
| test_suite_type | string | YES | "canonical_superset" |
| total_tests | number | YES | Non-negative integer |
| passed | number | YES | Non-negative integer |
| failed | number | YES | Non-negative integer |
| skipped | number | YES | Non-negative integer |
| severe_blockers | number | YES | Non-negative integer; 0 required for PASS |
| flakiness_controls | object | YES | Must contain seed, timeout_policy, retry_policy |
| evidence_artifacts | array | YES | At least one path string |
| issuer_team | string | YES | "Team 90" |

**Enforcement:** Artifact invalid if missing any required field. Invalid artifact cannot be used for GATE_5 PASS.

---

## 4) Example Minimal Valid Artifact

```json
{
  "work_package_id": "S002-P002-WP003",
  "gate_id": "GATE_5",
  "verdict": "PASS",
  "run_timestamp": "2026-03-11T14:00:00Z",
  "test_suite_type": "canonical_superset",
  "total_tests": 42,
  "passed": 42,
  "failed": 0,
  "skipped": 0,
  "severe_blockers": 0,
  "flakiness_controls": {
    "seed": "12345",
    "timeout_policy": "5000",
    "retry_policy": "no_retry_on_first_run"
  },
  "evidence_artifacts": ["_COMMUNICATION/team_90/G5_S002_P002_WP003_REPORT.json"],
  "issuer_team": "Team 90"
}
```

---

**log_entry | TEAM_170 | G5_AUTOMATION_EVIDENCE_CONTRACT | v1.0.0_CREATED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**
