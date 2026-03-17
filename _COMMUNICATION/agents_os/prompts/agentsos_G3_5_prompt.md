**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S003-P009-WP001 | stage=S003 | 2026-03-17

---

╔══════════════════════════════════════════════════════════════╗
║  ⚠  RE-VALIDATION — G3_5 CYCLE #2                          ║
║  Work plan was revised to address prior blockers.            ║
║  Perform a FRESH review — do NOT repeat previous findings.   ║
╚══════════════════════════════════════════════════════════════╝

Previous verdict (read for context, do NOT copy its blockers):
  `_COMMUNICATION/team_90/TEAM_90_S003_P009_WP001_G3_5_VERDICT_v1.0.0.md`

# G3.5 — Validate Work Plan  [RE-RUN #2]

**WP:** `S003-P009-WP001`

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.

## MANDATORY: route_recommendation

**If FAIL — include at the top of your response:**

```
route_recommendation: doc
```  ← plan has format/governance/wording issues only
```
route_recommendation: full
``` ← plan has structural/scope/logic problems

Classification:
- `doc`: blockers are grammar, missing paths, credential text, format-only
- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors

This field drives automatic pipeline routing. Missing = manual block.

Respond with: PASS or FAIL + blocking findings.

## Work Plan

---
project_domain: AGENTS_OS
id: TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.2.0
from: Team 10 (Execution Orchestrator / Work Plan Generator)
to: Team 61, Team 51, Team 170
cc: Team 00, Team 100, Team 190
date: 2026-03-17
status: ACTIVE
gate_id: G3_PLAN
program_id: S003-P009
work_package_id: S003-P009-WP001
scope: Pipeline Resilience Package — G3 Build Work Plan (G3_5 Blocker Remediation)
authority_mode: TEAM_10_GATE_3_OWNER
spec_source: TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md
supersedes: TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.1.0
g35_remediation: BF-G3_5-WP001-001, BF-G3_5-WP001-002, BF-G3_5-WP001-003, BF-G3_5-WP001-RE2-001
---

# Team 10 | S003-P009-WP001 — G3 Work Plan v1.2.0 (G3_5 Blocker Remediation)

## G3_5 Blocker Fixes Summary

| Blocker | Severity | Fix Applied |
|---------|----------|-------------|
| **BF-G3_5-WP001: 001** | SEVERE | Structural completeness: Added G3_5 fixes table; §3.2 Gate Routing table (G3_PLAN→G3_5→G3_6); completed dependency rules; §2 canonical paths per team with exact file lists; §7 Team 61 completion artifact contract |
| **BF-G3_5-WP001: 002** | SEVERE | Test coverage operationalized: §5 P0/P1 tests with exact runnable commands; binary PASS/FAIL per row; copy-paste-ready steps; pytest + regression with explicit commands |
| **BF-G3_5-WP001: 003** | MAJOR | Team 61 completion artifact contract: §7 required sections (identity header, modified files list, Item 1/2/3 checklist, test evidence, handover prompt); format spec; Team 51 trigger |
| **BF-G3_5-WP001-RE2: 001** | SEVERE | Submitted work plan incomplete: Added §G3_5 Readiness Checklist (immediately below) to attest all required sections present; Team 90 can validate completeness before full read. Full plan in `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` |

---

## G3_5 Submission Readiness Checklist

**Attestation:** This work plan is structurally complete. All required sections present.

| # | Required Element | Section | Status |
|---|------------------|---------|--------|
| 1 | Identity header (gate/wp/stage/domain/date) | Mandatory Identity Header | ✓ |
| 2 | §2 Files per team (canonical paths) | §2.1 Canonical Paths; §2.2–2.5 per team | ✓ |
| 3 | §3 Execution order with dependencies | §3.1 Execution Order; §3.2 Gate Routing | ✓ |
| 4 | §4 API/contract (CLI, Python, JSON) | §4 API / Contract Summary | ✓ |
| 5 | §5 Test scenarios (operationalized) | §5 P0/P1 tests, pytest | ✓ |
| 6 | §6 Per-team acceptance criteria | §6.1–6.6 | ✓ |
| 7 | §7 Team 61 completion artifact contract | §7 | ✓ |
| 8 | Domain adaptation (Team 61 + 51, no 20/30) | §2, §6 | ✓ |

**Canonical file (full content):** `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| task_id | G3_PLAN |
| gate_id | G3_PLAN |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |
| date | 2026-03-17 |

---

## 1. Approved Spec (Locked)

**Source:** `_COMMUNICATION/team_170/TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md`

S003-P009-WP001: Pipeline Resilience Package. 3-tier file path resolution (AC-10/AC-11 hardening), WSM auto-write module (`wsm_writer.py`), targeted git operations (pre-GATE_4 uncommitted block + GATE_8 closure checklist). Items 4a/4b (route alias) already implemented — verification only. No HTTP API — contracts are CLI, Python modules, file I/O.

---

## 2. Files to Create/Modify per Team

**Domain:** AGENTS_OS — Team 61 (implementation + contract verify), Team 51 (QA), Team 170 (governance doc).

### 2.1 §2 Canonical Paths per Team

| Team | Deliverable | Canonical Path |
|------|-------------|----------------|
| Team 61 | Contract verify | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_CONTRACT_VERIFY_v1.0.0.md` |
| Team 61 | Implementation | `pi