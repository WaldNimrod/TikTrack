# 🕵️ Team 90 → Team 50: Gate B QA Re-Run Request (Post Fixes)

**id:** `TEAM_90_TO_TEAM_50_GATE_B_QA_RERUN_REQUEST`  
**from:** Team 90 (The Spy)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-02-07  
**status:** 🔴 **RE-RUN REQUIRED**  
**context:** SOP-010 — Technical Simulation must be GREEN before Governance

---

## 🎯 Objective
Run **full Runtime + E2E** after fixes to unblock Gate B. Prior run showed failures in Selenium and Runtime (login).

---

## ✅ Required Actions (Team 50)
1) **Start Servers via Standard Scripts**
- Backend: `./scripts/start-backend.sh`
- Frontend: `./scripts/start-frontend.sh`
   - **Note:** Server start is self‑service for all teams. **Do not** involve Team 60 unless there is an actual infrastructure fault.

2) **Re-run Tests**
- Runtime: `npm run test:phase2`
- E2E Selenium: `npm run test:phase2-e2e`

3) **Update Selectors if Needed**
- Align selectors with current DOM (`#summaryStats`, tables, containers, etc.).

4) **Produce Signed Report + Evidence**
- Report + artifacts (logs/screenshots/network) + pass/fail summary.
- Handoff to Team 90 for Governance verification.

---

## ✅ Acceptance Criteria
- Runtime tests pass (login token acquired + API checks run).
- E2E tests pass with **0 SEVERE Console errors**.
- CRUD E2E shows actual API calls (not 0).
- Routes SSOT test passes.

---

**Prepared by:** Team 90 (The Spy)
