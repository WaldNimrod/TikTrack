# G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 170 (canonical); prepares: Team 90; approves: Team 100
gate: GATE_6 only
date: 2026-03-10
authority: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0

---

> ⚠️ **LEGACY DOCUMENT — DO NOT USE IN NEW WORK**
> This document references GATE_6, GATE_7, or GATE_8, which are NOT active pipeline gates.
> Active pipeline: GATE_0 through GATE_5 only (2026-03-24).
> Preserved for historical reference only.

---

## 1) Purpose

Define the canonical template and verdict rules for `G6_TRACEABILITY_MATRIX.md`. This artifact is the mandatory evidence for GATE_6 (Traceability Verdict / Reality Gate). Every GATE_2 acceptance criterion must appear as a row. MATCH_ALL or DEVIATION_FOUND verdict.

---

## 2) Markdown Template

```markdown
# GATE_6 Traceability Matrix — {WP_ID}
gate_id: GATE_6
work_package_id: {WP_ID}
gate2_decision_reference: ARCHITECT_GATE2_{SCOPE_ID}_DECISION.md

| Spec Item (GATE_2 intent) | LOD400 §Ref | Implementation File | Test Evidence (GATE_5) | Status |
|---|---|---|---|---|
| [acceptance criterion] | §X.X | path/to/file.py | G5_AUTOMATION_EVIDENCE row N | MATCH / DEVIATION |

VERDICT: MATCH_ALL | DEVIATION_FOUND
If DEVIATION_FOUND: routing per GATE_6 rejection protocol.
```

---

## 3) Mapping Rule

Every GATE_2 acceptance criterion (from the architect-approved spec) must appear as a row in the matrix. No criterion may be omitted. Each row has Status = MATCH or DEVIATION.

---

## 4) Verdict Rules

| VERDICT | Meaning | Next action |
|--------|---------|-------------|
| MATCH_ALL | Every spec item has implementation evidence and status MATCH | GATE_6 PASS → GATE_7 entry |
| DEVIATION_FOUND | At least one row has status DEVIATION | Apply GATE_6 rejection protocol: DOC_ONLY_LOOP / CODE_CHANGE_REQUIRED / ESCALATE_TO_TEAM_00 |

---

**log_entry | TEAM_170 | G6_TRACEABILITY_MATRIX_CONTRACT | v1.0.0_CREATED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**

historical_record: true
