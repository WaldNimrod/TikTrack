# Team 10 → Team 50 | Price Reliability — QA Mandate (3 Phases)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_QA_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-08  
**status:** MANDATE_ACTIVE  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Role

Execute targeted test matrix **per phase**. Issue PASS/BLOCK QA reports with explicit checklist mapping. Full 3-phase closure requires Team 50 consolidated PASS.

---

## 2) PHASE_1 QA (witness)

**Trigger:** Team 20 completion report.

| # | Test | Expected |
|---|------|----------|
| 1 | stale EOD + no intraday (active) | EOD_STALE, not null |
| 2 | stale EOD + no intraday (inactive) | EOD_STALE, not null |
| 3 | stale EOD + intraday (active) | INTRADAY_FALLBACK |
| 4 | fresh EOD + intraday | EOD |
| 5 | missing EOD + intraday (active) | INTRADAY_FALLBACK |

**Output:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md` — status PASS \| BLOCK.

---

## 3) PHASE_2 QA

**Trigger:** Team 20 + Team 30 completion reports.

| # | Test | Expected |
|---|------|----------|
| 1 | UI source label | correct for INTRADAY_FALLBACK, EOD, EOD_STALE |
| 2 | UI as-of timestamp | visible for current source |
| 3 | last close | visible, unchanged when intraday |
| 4 | no misleading stale | user always sees stale indication when stale |

**Output:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_QA_REPORT.md`.

---

## 4) PHASE_3 QA

**Trigger:** Team 60 completion report.

| # | Test | Expected |
|---|------|----------|
| 1 | runtime smoke | scheduler/job in both cadence profiles |
| 2 | evidence check | output includes source + as-of deterministically |
| 3 | user-facing | off-hours shows usable price context (current + last close) |
| 4 | validation alignment | evidence admissible for Team 90 |

**Output:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_QA_REPORT.md`.

---

## 5) Final consolidated report

After all 3 phases PASS:

**Output:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_3_PHASE_QA_CONSOLIDATED_REPORT.md`

- Checklist mapping for all phases
- status: PASS (only if all phases PASS)
- Evidence paths

---

## 6) Blocking

If any phase QA returns BLOCK — flow remains blocked. Team 10 routes remediation to relevant owner.

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_QA_MANDATE | TO_TEAM_50 | 2026-03-08**
