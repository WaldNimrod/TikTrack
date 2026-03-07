# TEAM_190_AGENTS_OS_CASE_ALIGNMENT_DECISION_ADDENDUM_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_AGENTS_OS_CASE_ALIGNMENT_DECISION_ADDENDUM  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Nimrod (Chief Manager)  
**cc:** Team 00, Team 10, Team 60, Team 100, Team 170  
**date:** 2026-02-27  
**status:** APPLIED  
**in_response_to:** `TEAM_190_AGENTS_OS_CASE_ALIGNMENT_DEEP_SCAN_REPORT_v1.0.0`

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Locked Decision

Canonical filesystem/runtime root is **`agents_os/` (lowercase only)**.

`Agents_OS/` is non-canonical and blocked for active runtime use.

---

## 2) Actions Applied

1. All tracked files previously under `Agents_OS/` were migrated into `agents_os/`.
2. Post-migration tracked state:
   - `Agents_OS/` tracked files: **0**
   - `agents_os/` tracked files: **51**
3. CI guardrail added:
   - `scripts/lint_agents_os_case_paths.sh`
   - wired into `.github/workflows/lint-enforcement.yml`

---

## 3) Residual Uppercase References

Residual `Agents_OS/` mentions may remain in:
- historical reports
- prior audit artifacts
- Team 190 evidence snapshots

These are treated as **historical context only**, not active runtime authority.

---

## 4) Enforcement Rule

From this point forward:
- no tracked file may exist under `Agents_OS/`
- no active code/CI path/import may reference `Agents_OS/`
- violations must fail CI immediately

---

**log_entry | TEAM_190 | AGENTS_OS_CASE_ALIGNMENT_DECISION_ADDENDUM | LOWERCASE_CANONICAL_APPLIED | 2026-02-27**
