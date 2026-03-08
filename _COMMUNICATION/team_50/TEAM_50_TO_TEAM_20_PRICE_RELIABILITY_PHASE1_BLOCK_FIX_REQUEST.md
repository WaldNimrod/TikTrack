# Team 50 → Team 20 | Price Reliability PHASE_1 — Block Fix Request

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_BLOCK_FIX_REQUEST  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 20 (Backend)  
**cc:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-09  
**status:** ACTION_REQUIRED  
**phase:** PHASE_1  
**procedure:** TEAM_50_QA_BLOCK_DIRECT_ROUTING_PROCEDURE_v1.0.0  

---

## 1) Context

QA הרצה על PHASE_1 (Price Reliability — EOD preservation) הסתיימה ב־**BLOCK**. שני חסימות מונעות PASS. דרישת תיקון ישירה לפי נוהל (ללא טלפון שבור).

---

## 2) Blockers (Critical)

| # | Blocker | Severity | Required Action |
|---|---------|----------|-----------------|
| B1 | Unit test file `test_price_reliability_phase1.py` חסר | Critical | ליצור את הקובץ עם 5 התרחישים מהמנדט; להריץ ולהבטיח PASS. |
| B2 | EOD_STALE לא מיושם | Critical | ב־`_get_price_with_fallback`: כש־EOD stale ואין intraday — להחזיר EOD עם `price_source="EOD_STALE"` (לא null). |

---

## 3) Evidence

**B1 — Unit test חסר:**
```
$ python3 -m pytest tests/unit/test_price_reliability_phase1.py -v
ERROR: file or directory not found: tests/unit/test_price_reliability_phase1.py
```

**B2 — לוגיקת קוד (`api/services/tickers_service.py`, שורות 66–122):**
- EOD stale → נוסף ל־`need_intraday`; **לא** נוסף ל־`out`.
- Intraday fallback → מוסיף ל־`out` רק כשיש `intra_rows` לאותו ticker.
- אין שלב שמחזיר EOD stale כשאין intraday — התוצאה: `null`.

---

## 4) Required Remediation

### 4.1 B2 — EOD_STALE Logic

1. **שמירת EOD stale:** בפער הראשון (שורות 73–74), כשמוסיפים ל־`need_intraday`, לשמור גם `(tid, price_val, daily_pct, ts_utc)` במבנה זמני (למשל `stale_eod: Dict[ticker_id, {...}]`).
2. **לאחר intraday fallback:** לכל `tid` ב־`need_intraday` שלא ב־`out`, להכניס את הערכים השמורים עם `price_source="EOD_STALE"`.
3. **Schema:** לעדכן `api/schemas/tickers.py` — ב־`price_source` description להוסיף `EOD_STALE`.

### 4.2 B1 — Unit Tests

ליצור `tests/unit/test_price_reliability_phase1.py` עם 5 בדיקות:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | stale EOD + no intraday (active) | EOD_STALE, not null |
| 2 | stale EOD + no intraday (inactive) | EOD_STALE, not null |
| 3 | stale EOD + intraday (active) | INTRADAY_FALLBACK |
| 4 | fresh EOD + intraday | EOD |
| 5 | missing EOD + intraday (active) | INTRADAY_FALLBACK |

---

## 5) Verification (Team 50 after fix)

1. הרצת `python3 -m pytest tests/unit/test_price_reliability_phase1.py -v` — 5/5 PASS.
2. Code review ל־`_get_price_with_fallback`.
3. דוח Re-QA עם status PASS אם כל 5 התרחישים עוברים.

---

## 6) Reference

- **מנדט:** `TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0.md`
- **בקשת QA:** `TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE1_QA_REQUEST.md`
- **דוח QA:** `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md`

---

**log_entry | TEAM_50 | PRICE_RELIABILITY_PHASE1_BLOCK_FIX_REQUEST | TO_TEAM_20 | CC_TEAM_10 | 2026-03-09**
