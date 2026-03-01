# Team 10 -> Team 50 | G6 Rejection Remediation Activation (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_G6_REMEDIATION_ACTIVATION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 20, Team 60, Team 90, Team 190  
**date:** 2026-03-01  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_3 (rollback remediation loop)  
**work_package_id:** S002-P003-WP002  
**trigger:** GATE_6 REJECT / CODE_CHANGE_REQUIRED (GF-G6-001..003)  

---

## 1) Scope

Close GF-G6-001, GF-G6-002, GF-G6-003 and deliver evidence package ready for GATE_4 re-verification.

---

## 2) Required actions

| Finding | Action | Output |
| --- | --- | --- |
| GF-G6-001 (DOC_ONLY) | Run D22 E2E and document runtime evidence with PASS count + exit code. | Report section with exact run result (X/Y PASS, exit code). |
| GF-G6-002 (DOC_ONLY) | Issue SOP-013 seals for D34-FAV and D35-FAV. | Two seal blocks: `S002-P003-WP002-D34-FAV`, `S002-P003-WP002-D35-FAV`. |
| GF-G6-003 (CODE_CHANGE) D34 | Extend `scripts/run-alerts-d34-fav-api.sh` with negative error-contract tests: 422/422/401/400. | Script + execution evidence proving expected status codes. |
| GF-G6-003 (CODE_CHANGE) D35 | **Option A selected by Team 10:** extend `tests/notes-d35-fav-e2e.test.js` with direct API negative checks (422/422/401). | Test file update + execution evidence (PASS count + exit code). |

---

## 3) Standards (mandatory)

- Evidence quality: do not write "PRESENT" only; provide **X/Y PASS + exit code**.
- Scope lock: D22/D34/D35 only; no D23/S003.
- No secrets in scripts/logs.

---

## 4) Deliverables to Team 10

1. Remediation completion report under `_COMMUNICATION/team_50/` with:
   - closure map GF-G6-001..003,
   - evidence-by-path,
   - final decision (PASS/BLOCK for remediation cycle).
2. Updated artifacts/scripts/tests.
3. SOP-013 seals for D34-FAV and D35-FAV embedded in report.

---

## 5) Coordination rule

- Backend mismatch found -> issue coordination to Team 20 immediately.
- Runtime/tooling blocker -> issue coordination to Team 60 immediately.
- Team 10 remains orchestration owner during rollback loop.

---

Log entry: TEAM_10 | TO_TEAM_50 | S002_P003_G6_REMEDIATION_ACTIVATION | MANDATE_ACTIVE | 2026-03-01
