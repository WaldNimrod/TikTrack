# Team 10 → Team 50 | Price Reliability PHASE_2 — QA Request

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE2_QA_REQUEST  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA & Fidelity)  
**date:** 2026-03-09  
**status:** ACTION_REQUIRED  
**phase:** PHASE_2  
**trigger:** TEAM_20_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_API_COMPLETION + TEAM_30_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_COMPLETION  

---

## 1) Context

Team 20 + Team 30 השלימו PHASE_2 (API fields + UI transparency). נדרשת הרצת מטריצת QA.

---

## 2) Test matrix (PHASE_2)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | UI source label | correct for INTRADAY_FALLBACK, EOD, EOD_STALE |
| 2 | UI as-of timestamp | visible for current source |
| 3 | last close | visible, unchanged when current source is intraday |
| 4 | no misleading stale | user never sees stale value without stale indication |

---

## 3) Scope

- **Tickers table** (ניהול טיקרים): `current_price`, `price_source`, `price_as_of_utc`, `last_close_price`
- **User tickers table** (הטיקרים שלי): same + modal view
- **Source labels:** EOD → סגירה, EOD_STALE → סגירה (ישן), INTRADAY_FALLBACK → תוך־יומי

---

## 4) Output required

**נתיב:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_QA_REPORT.md`

**תוכן:**
- status: PASS | BLOCK
- טבלת תוצאות לכל 4 התרחישים
- Evidence (screenshots / paths)
- Blockers (אם BLOCK)

---

## 5) On PASS

Team 10 יפתח PHASE_3 — מנדט ל־Team 60 (off-hours cadence).

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE2_QA_REQUEST | TO_TEAM_50 | 2026-03-09**
