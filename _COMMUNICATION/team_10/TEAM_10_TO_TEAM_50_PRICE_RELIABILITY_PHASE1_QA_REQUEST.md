# Team 10 → Team 50 | Price Reliability PHASE_1 — QA Request

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE1_QA_REQUEST  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-08  
**status:** ACTION_REQUIRED  
**phase:** PHASE_1  
**trigger:** TEAM_20_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_COMPLETION  

---

## 1) Context

Team 20 השלים PHASE_1 (Backend regression fix). נדרש הרצת מטריצת QA לאימות 5 התרחישים.

---

## 2) Test matrix (PHASE_1)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | stale EOD + no intraday (active) | EOD_STALE, **not null** |
| 2 | stale EOD + no intraday (inactive) | EOD_STALE, **not null** |
| 3 | stale EOD + intraday (active) | INTRADAY_FALLBACK |
| 4 | fresh EOD + intraday | EOD |
| 5 | missing EOD + intraday (active) | INTRADAY_FALLBACK |

---

## 3) Execution

**Unit tests (Team 20):** `python3 -m pytest tests/unit/test_price_reliability_phase1.py -v`

**Team 50:** להריץ את הבדיקות; לאמת תוצאות; להנפיק דוח QA.

---

## 4) Output required

**נתיב:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md`

**תוכן:**
- status: PASS | BLOCK
- טבלת תוצאות לכל 5 התרחישים
- Evidence (path ל־test run או snippet)
- Blockers (אם BLOCK)

---

## 5) On PASS

Team 10 יפתח PHASE_2 — מנדטים ל־Team 20 (API fields) + Team 30 (UI).

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE1_QA_REQUEST | TO_TEAM_50 | 2026-03-08**
