---
project_domain: AGENTS_OS
id: TEAM_191_TO_TEAM_51_S002_P005_WP002_QA_HANDOFF_PROMPT_v1.0.1
from: Team 191 (Git Governance Operations)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 190, Team 10, Team 00, Team 170, Team 61, Team 100
date: 2026-03-15
status: READY_AFTER_FAST2_ONLY
work_package_id: S002-P005-WP002
handoff_type: FAST_2_COMPLETE -> FAST_2_5_QA
depends_on: TEAM_61_TO_TEAM_191_S002_P005_WP002_FAST2_IMPLEMENTATION_COMPLETION_v1.0.0
supersedes: TEAM_191_TO_TEAM_51_S002_P005_WP002_QA_HANDOFF_PROMPT_v1.0.0
---

# פרומט קאנוני — S002-P005-WP002 — Handoff ל-QA (Team 51)

## 0) Gate Condition (Binding)

נא לבצע QA רק לאחר שקיים בפועל:
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_191_S002_P005_WP002_FAST2_IMPLEMENTATION_COMPLETION_v1.0.0.md`

אם הארטיפקט לא קיים, מצב הבקשה הוא `BLOCKED_PENDING_FAST2_IMPLEMENTATION`.

## 1) Context

1. GATE_1 revalidation result: `PASS`.
2. הערת נתיב הלא-חוסמת נסגרה ע"י Team 191 (errata).
3. FAST_2 implementation הוא תנאי מוקדם ל-QA.

## 2) Artifacts to Validate (after FAST_2 completion)

1. `_COMMUNICATION/team_61/TEAM_61_TO_TEAM_191_S002_P005_WP002_FAST2_IMPLEMENTATION_COMPLETION_v1.0.0.md`
2. `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_61_S002_P005_WP002_FAST2_IMPLEMENTATION_MANDATE_v1.0.0.md`
3. `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_190_S002_P005_WP002_INTERNAL_LOD400_REVALIDATION_REQUEST_ERRATA_v1.0.0.md`
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_191_S002_P005_WP002_INTERNAL_LOD400_REVALIDATION_RESULT_v1.0.0.md`
5. Code + tests evidence from Team 61 completion package

## 3) Required Return Contract

1. `overall_result` (`QA_PASS` or `BLOCK_FOR_FIX`)
2. `validation_findings`
3. `remaining_blockers`
4. `owner_next_action`
5. `evidence-by-path`

## 4) Required Output Path

`_COMMUNICATION/team_51/TEAM_51_TO_TEAM_191_TEAM_190_S002_P005_WP002_QA_RESULT_v1.0.0.md`

---

**log_entry | TEAM_191 | S002_P005_WP002_QA_HANDOFF_PROMPT | v1.0.1_READY_AFTER_FAST2_ONLY | 2026-03-15**
