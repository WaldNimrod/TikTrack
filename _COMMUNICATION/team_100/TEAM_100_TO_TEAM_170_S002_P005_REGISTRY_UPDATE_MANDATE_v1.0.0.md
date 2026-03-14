---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_170_S002_P005_REGISTRY_UPDATE_MANDATE_v1.0.0
from: Team 100 (Agents_OS Architectural Authority)
to: Team 170 (Documentation and Governance)
cc: Team 00, Team 10
date: 2026-03-14
status: MANDATE_ISSUED
priority: MEDIUM
trigger: immediate (S002-P005-WP001 task closure confirmed)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| mandate_scope | PROGRAM_REGISTRY + PORTFOLIO_ROADMAP annotations |

---

## Mandate

Team 170 must update the following governance documents to reflect the confirmed state of S002-P005.

---

## 1) PHOENIX_PROGRAM_REGISTRY_v1.0.0.md — Update Required

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

**Current row (line ~46):**
```
| S002 | S002-P005 | Agents_OS v2 Writing Semantics Hardening (ADR-031 Stage A) | AGENTS_OS | PLANNED | — (immediate hotfix lane...) |
```

**Updated row:**
```
| S002 | S002-P005 | Agents_OS v2 Writing Semantics Hardening (ADR-031 Stage A) + UI Optimization | AGENTS_OS | ACTIVE |
  WP001 (ADR-031 Stage A + UI Optimization): TASK_CLOSED 2026-03-15 — Team 100 final approval `TEAM_100_AGENTS_OS_UI_OPTIMIZATION_FINAL_APPROVAL_v1.0.0.md`; 14/14 ACs PASS; CSS/JS extraction complete; validator hardening complete; UI layout canon complete.
  WP002 (Pipeline Governance — PASS_WITH_ACTION micro-cycle): PLANNED — trigger: WP001 GATE_8 PASS; design locked `TEAM_100_PASS_WITH_ACTION_PIPELINE_GOVERNANCE_BACKLOG_v1.0.0.md`; Nimrod confirmed 2026-03-15. |
```

---

## 2) PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md — Annotation Only

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

No structural change required. Add an annotation note under the existing ADR-031 section (around line 96) to reflect that S002-P005 now contains WP002:

```
  - S002-P005: Writing Semantics Hardening (Stage A) + UI Optimization [WP001 TASK_CLOSED 2026-03-15] + Pipeline Governance PASS_WITH_ACTION [WP002 PLANNED — trigger: WP001 GATE_8].
```

---

## 3) Scope Boundaries

| In scope | Out of scope |
|---|---|
| S002-P005 row update in program registry | WSM active_program_id (no change needed — S002-P002 remains the active tracked program) |
| Portfolio roadmap annotation for S002-P005 | Any other program rows |
| WP001 and WP002 status notes | Creating new sections or tables |

---

## Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | S002-P005 status changed from PLANNED to ACTIVE in registry |
| AC-02 | WP001 TASK_CLOSED note recorded with date + evidence ref |
| AC-03 | WP002 PLANNED note recorded with trigger condition + design doc ref |
| AC-04 | Portfolio roadmap S002-P005 annotation updated |

---

**log_entry | TEAM_100 | S002_P005_REGISTRY_UPDATE_MANDATE | ISSUED_TO_TEAM_170 | 2026-03-15**
