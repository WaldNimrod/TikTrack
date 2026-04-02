# G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 170 (canonical); prepares matrix: Team 90; fills results: Nimrod (Team 00)
gate: GATE_7 only
date: 2026-03-10
authority: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0

---

> ⚠️ **LEGACY DOCUMENT — DO NOT USE IN NEW WORK**
> This document references GATE_6, GATE_7, or GATE_8, which are NOT active pipeline gates.
> Active pipeline: GATE_0 through GATE_5 only (2026-03-24).
> Preserved for historical reference only.

---

## 1) Purpose

Define the canonical template and scope for `G7_HUMAN_RESIDUALS_MATRIX.md`. This artifact is the mandatory evidence for GATE_7 (Human Residuals Sign-Off). Scope restriction: **HUMAN_ONLY tagged items only**. AUTO_TESTABLE items are explicitly prohibited from this matrix. PASS condition: all rows PASS + Nimrod sign-off (אישור).

---

## 2) Markdown Template

```markdown
# GATE_7 Human Residuals Matrix — {WP_ID}
gate_id: GATE_7
work_package_id: {WP_ID}
classification_basis: GATE_2 approved AUTO_TESTABLE/HUMAN_ONLY tags

SCOPE: This matrix contains ONLY items tagged HUMAN_ONLY in the approved spec.
       GATE_7 DOES NOT re-run any item already closed in GATE_5.

| # | Residual Item | GATE_2 Ref | UI Page/Surface | Expected Result | Nimrod Actual | PASS/FAIL |
|---|---|---|---|---|---|---|
| 1 | [description] | §X.X | [page name] | [expected] | [to fill] | — |

GATE_7 PASS condition: all residuals PASS + Nimrod sign-off (אישור).
```

---

## 3) Scope Restriction

- **Included:** Only acceptance criteria tagged **HUMAN_ONLY** in the GATE_2 approved spec.
- **Excluded:** Any item tagged AUTO_TESTABLE or already verified at GATE_5. Including AUTO_TESTABLE items in this matrix is explicitly prohibited.

---

## 4) PASS Condition

All rows must have PASS. In addition, Nimrod must provide explicit sign-off (אישור) in the canonical GATE_7 decision artifact. No GATE_7 PASS without both: completed matrix (all PASS) + Nimrod sign-off.

---

**log_entry | TEAM_170 | G7_HUMAN_RESIDUALS_MATRIX_CONTRACT | v1.0.0_CREATED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**

historical_record: true
