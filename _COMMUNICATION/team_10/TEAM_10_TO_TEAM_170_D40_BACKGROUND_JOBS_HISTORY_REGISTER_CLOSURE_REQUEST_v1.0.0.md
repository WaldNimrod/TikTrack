# Team 10 → Team 170 | D40 Background Jobs History — בקשת סגירה ברג'יסטר

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_170_D40_BACKGROUND_JOBS_HISTORY_REGISTER_CLOSURE_REQUEST_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 170 (Spec & Governance Authority)  
**cc:** Team 30, Team 50, Team 90, Team 190  
**date:** 2026-03-12  
**historical_record:** true  
**status:** ISSUED_ON_PASS — מופעל רק לאחר Team 90 PASS  
**gate_id:** GATE_7_REMEDIATION_LANE  
**program_id:** S002-P002  
**work_package_id:** S002-P002-WP003  
**scope:** URGENT_BUGFIX_CYCLE_2026-03-12_D40_HISTORY_TOGGLE  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-12-24 |
| cycle_id | URGENT_BUGFIX_CYCLE_2026-03-12_D40_HISTORY_TOGGLE |
| lineage | Team 30 fix → Team 50 QA PASS → Team 90 revalidation PASS |

---

## 1) תנאי הנפקה

מסמך זה מונפק **רק** לאחר:
- Team 90 verdict = **PASS** ב־`TEAM_90_TO_TEAM_10_TEAM_190_S002_P002_WP003_KB_2026_03_12_24_REVALIDATION_RESULT_v1.0.0.md`

---

## 2) בקשה

**Team 170:** העבר סטטוס KB-2026-03-12-24 ב־KNOWN_BUGS_REGISTER מ־**IN_REMEDIATION** ל־**CLOSED**.

---

## 3) Evidence chain

| שלב | ארטיפקט |
|-----|----------|
| Fix | TEAM_30_TO_TEAM_10_..._KB_2026_03_12_24_FIX_COMPLETION_v1.0.0.md |
| QA | TEAM_50_TO_TEAM_10_..._KB_2026_03_12_24_TARGETED_QA_REPORT_v1.0.0.md |
| Validation | TEAM_90_TO_TEAM_10_TEAM_190_..._KB_2026_03_12_24_REVALIDATION_RESULT_v1.0.0.md |

---

## 4) רישום

- **Register:** `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md`
- **Procedure:** KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE — Closure Rule §4

---

**log_entry | TEAM_10 | TO_TEAM_170 | D40_REGISTER_CLOSURE_REQUEST | KB_2026_03_12_24 | CONDITIONAL_ON_90_PASS | 2026-03-12**
