# Gates 4/5/6/7 Governance Policy v1.0.0

> ⚠️ **LEGACY — pipeline is GATE_0–GATE_5 only. GATE_6/7 sections are superseded.**

project_domain: SHARED
status: LOCKED
owner: Team 170 (canonical); authority: Team 00
date: 2026-03-10
authority: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0

---

## 1) Purpose
Single policy document for GATE_4/5/6/7 execution in manual mode.
Phase 2 (agent overlay) uses the same contracts — no gate semantic change.

## 2) GATE_4 — Subset QA (Smoke + Readiness)

| Field | Value |
|---|---|
| Gate owner | Team 10 (QA execution: Team 50) |
| Suite type | Subset — smoke + readiness |
| Entry | GATE_3 implementation complete |
| Evidence artifact | QA smoke report (Team 50 format) |
| Pass criterion | 0 SEVERE blockers on smoke suite |
| Nimrod run required | NO |
| MCP scenarios | Core entity CRUD (agents_os_v2/mcp/test_scenarios.py where applicable) |

## 3) GATE_5 — Canonical Superset Validation

| Field | Value |
|---|---|
| Gate owner | Team 90 |
| Suite type | Superset — all AUTO_TESTABLE criteria from GATE_2 approval |
| Entry | GATE_4 PASS |
| Evidence artifact | G5_AUTOMATION_EVIDENCE.json (canonical schema per GATE_QUALITY_HARDENING §6) |
| Pass criterion | 0 SEVERE blockers; Team 90 deterministic verdict |
| Nimrod run required | NO (Nimrod may be requested for point clarifications only) |
| UI assertions | Mandatory — screen-level automated checks, not API-only |
| Anti-flakiness | Fixed seed, session isolation, explicit timeouts, no retry on first run |

## 4) GATE_6 — Traceability Verdict (Reality Gate)

> **LEGACY (2026-03-24):** **GATE_6** is **not** an active pipeline gate (organizational / historical construct).

| Field | Value |
|---|---|
| Gate owner | Team 90 (execution); Team 100 (approval authority) |
| Scope | Traceability-only: implementation vs GATE_2 approved intent |
| Entry | GATE_5 PASS |
| Evidence artifact | G6_TRACEABILITY_MATRIX.md (canonical template per GATE_QUALITY_HARDENING §6) |
| Pass criterion | MATCH_ALL — every GATE_2 spec item has implementation evidence |
| Deviation handling | DOC_ONLY_LOOP / CODE_CHANGE_REQUIRED / ESCALATE_TO_TEAM_00 per rejection protocol |

## 5) GATE_7 — Human Residuals Sign-Off

> **LEGACY (2026-03-24):** **GATE_7** does **not** exist as a pipeline gate (historical drift).

| Field | Value |
|---|---|
| Gate owner | Team 90 (prepares); Nimrod/Team 00 (signs) |
| Scope | HUMAN_ONLY tagged items only — G7_HUMAN_RESIDUALS_MATRIX.md |
| Entry | GATE_6 PASS |
| Evidence artifact | G7_HUMAN_RESIDUALS_MATRIX.md (completed by Nimrod) |
| Surface | Browser/UI always (product pages for feature WPs; admin panel for infrastructure WPs) |
| Pass criterion | All residuals PASS + explicit Nimrod sign-off (אישור) |
| GATE_7 must NOT | Re-run GATE_5 deterministic checks |

## 6) Anti-Flakiness Policy (enforced at GATE_4 and GATE_5)

| Rule | Requirement |
|------|-------------|
| Seed | Fixed random seed declared in test configuration |
| Session | Isolated per gate run; no shared state |
| Timeout | All async operations: explicit ms timeout |
| Retry | No retry on initial run; retry flag allowed on re-run only |
| Data baseline | Deterministic seed data; no live external state for pass/fail |
| Flaky test | SEVERE blocker until root cause resolved; not masked with retry |

## 7) AUTO_TESTABLE / HUMAN_ONLY Classification

Every acceptance criterion in LOD400 spec must carry one of:
- AUTO_TESTABLE: verified programmatically at GATE_5
- HUMAN_ONLY: verified by Nimrod at GATE_7 only

Classification is GATE_1 responsibility; confirmed at GATE_2 approval.
GATE_5 scope = all AUTO_TESTABLE items.
GATE_7 scope = all HUMAN_ONLY items (G7_HUMAN_RESIDUALS_MATRIX.md).

---

**log_entry | TEAM_170 | GATES_4_5_6_7_GOVERNANCE_POLICY | v1.0.0_CREATED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**

historical_record: true
