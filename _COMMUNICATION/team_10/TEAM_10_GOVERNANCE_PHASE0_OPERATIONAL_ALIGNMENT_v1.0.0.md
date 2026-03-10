# Team 10 | Governance Phase 0 — Operational Alignment v1.0.0

**project_domain:** SHARED  
**id:** TEAM_10_GOVERNANCE_PHASE0_OPERATIONAL_ALIGNMENT  
**owner:** Team 10  
**date:** 2026-03-10  
**status:** LOCKED (מחייב)  
**trigger:** TEAM_190_TO_TEAM_10_GOVERNANCE_PHASE0_OPERATIONAL_ACTIVATION_v1.0.0  
**basis:** GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0, G5/G6/G7 contracts  

---

## 1) Purpose

מסמך פנימי — Team 10 מאמץ **במחייב** את נהלי Phase 0. כל ביצוע שער חייב לעמוד בדרישות למטה.

---

## 2) Gate Flow Enforcement (חובה)

| Gate | Evidence | Owner | Pass Criterion |
|------|----------|-------|----------------|
| **GATE_4** | Subset QA report | Team 50 (מבצע); Team 10 (מעביר) | 0 SEVERE blockers |
| **GATE_5** | `G5_AUTOMATION_EVIDENCE.json` | Team 90 | Canonical superset; 0 SEVERE |
| **GATE_6** | `G6_TRACEABILITY_MATRIX.md` | Team 90 | MATCH_ALL vs GATE_2 |
| **GATE_7** | `G7_HUMAN_RESIDUALS_MATRIX.md` **only** | Team 90 / Nimrod | HUMAN_ONLY items; Nimrod אישור |

**אין חריגה:** GATE_7 = G7_HUMAN_RESIDUALS_MATRIX.md בלבד. אין הרצה חוזרת של GATE_5 checks בשער 7.

---

## 3) Artifact Paths (SSOT)

| Artifact | Contract |
|----------|----------|
| G5_AUTOMATION_EVIDENCE.json | documentation/docs-governance/05-CONTRACTS/G5_AUTOMATION_EVIDENCE_CONTRACT_v1.0.0.md |
| G6_TRACEABILITY_MATRIX.md | documentation/docs-governance/05-CONTRACTS/G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0.md |
| G7_HUMAN_RESIDUALS_MATRIX.md | documentation/docs-governance/05-CONTRACTS/G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0.md |
| GATES_4_5_6_7 | documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md |

---

## 4) Team 10 Checklist (לפני כל handover)

- [ ] GATE_4: וידוא Team 50 subset QA — 0 SEVERE
- [ ] GATE_5: וידוא Team 90 מחזיר G5_AUTOMATION_EVIDENCE.json
- [ ] GATE_6: וידוא Team 90 מחזיר G6_TRACEABILITY_MATRIX.md
- [ ] GATE_7: וידוא Team 90 מחזיר G7_HUMAN_RESIDUALS_MATRIX.md בלבד; Nimrod sign-off

---

**log_entry | TEAM_10 | GOVERNANCE_PHASE0_ALIGNMENT | LOCKED | 2026-03-11**
