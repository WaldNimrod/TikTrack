# Team 10 → Team 50 | Price Reliability PHASE_3 — QA Request

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE3_QA_REQUEST  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-08  
**status:** ACTION_REQUIRED  
**phase:** PHASE_3  
**trigger:** TEAM_60_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_COMPLETION  

---

## 1) Context

Team 60 השלים PHASE_3 (off-hours cadence). נדרשת הרצת מטריצת QA.

---

## 2) Test matrix (PHASE_3)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | runtime smoke | scheduler/job executes in both cadence profiles (market_open, off_hours) |
| 2 | evidence check | output includes source + as-of deterministically |
| 3 | user-facing | off-hours still shows usable price context (current + last close) |
| 4 | validation alignment | evidence admissible for Team 90 |

---

## 3) Implementation summary (Team 60)

- **Cadence profiles:** `get_current_cadence_minutes()` — REGULAR → intraday, otherwise → off_hours (60 min default)
- **Scheduler log:** `PHASE_3 price sync cadence: mode=off_hours|market_open interval_min=<N> next_run=<ISO UTC>`
- **Evidence:** job_run_log (M005b), API price_source, price_as_of_utc, last_close_*
- **Fallback:** `documentation/PRICE_RELIABILITY_PHASE3_OFF_HOURS_FALLBACK_AND_LOGS.md` — EOD retained when feed unavailable

---

## 4) Output required

**נתיב:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_QA_REPORT.md`

**תוכן:**
- status: PASS | BLOCK
- טבלת תוצאות לכל 4 התרחישים
- Evidence (scheduler log snippet, API response, paths)
- Blockers (אם BLOCK)

---

## 5) On PASS

Team 10 יפעיל את Team 90 לוולידציה סופית. לאחר Team 90 PASS — סגירת 3-phase program ל־Team 190.

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE3_QA_REQUEST | TO_TEAM_50 | 2026-03-08**
