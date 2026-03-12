

# Team 20 → Team 10 | S002-P002-WP003 CC-02 Off-Hours Fix — דוח השלמה

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P002_WP003_CC02_OFF_HOURS_FIX_COMPLETION  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 60, Team 50, Team 90  
**date:** 2026-03-12  
**historical_record:** true
**status:** DONE  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P002_WP003_CC02_OFF_HOURS_FIX_MANDATE_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 Part A |
| phase_owner | Team 90 |

---

## 1) סטטוס

**DONE** — שני תיקונים יושמו להקטנת קריאות Yahoo ב־off-hours ל־≤2.

---

## 2) תיאור התיקונים

### 2.1 דילוג על Yahoo market status ב־off-hours

**קובץ:** `api/services/market_status_service.py`

**שינוי:** ב־`get_market_status_sync()` — אם `_us_market_status_from_local_time()` מחזיר `CLOSED` (סופ״ש או מחוץ ל־9:30–16:00 ET), מחזירים מיידית בלי קריאות Yahoo/Alpha.

**תוצאה:** חיסכון 1 קריאת HTTP ב־off-hours.

### 2.2 איסור קריאות Yahoo per-ticker ב־off-hours

**קובץ:** `api/background/jobs/sync_intraday.py`

**שינוי:** ב־`_fetch_prices_for_tickers` — קריאות Yahoo ל־per-ticker מתבצעות רק כאשר `market_is_open == True`. ב־off-hours משתמשים רק בתוצאות ה־batch; לחסרים — Alpha או last-known.

**תוצאה:** ב־off-hours: 0 (market status) + 1 (batch) = **≤2** קריאות Yahoo.

---

## 3) קבצים ששונו

| קובץ | שינוי |
|------|-------|
| `api/services/market_status_service.py` | דילוג על Yahoo כשהשוק סגור (לפי שעון מקומי) |
| `api/background/jobs/sync_intraday.py` | הגבלת Yahoo per-ticker ל־market-open בלבד |

---

## 4) אימות מקומי (מומלץ)

```bash
# Backend עם GATE7_CC_EVIDENCE=1 והרצת tee ללוג
uvicorn api.main:app --host 0.0.0.0 --port 8082 2>&1 | tee /tmp/g7_part_a.log

# במקביל — off-hours (להפעיל כשהשוק סגור)
G7_PART_A_LOG_PATH=/tmp/g7_part_a.log G7_PART_A_MODE=off_hours python3 scripts/verify_g7_part_a_runtime.py
```

**צפי:** `cc_02_yahoo_call_count ≤ 2`, `pass_02=true`.

---

## 5) העברת חבילה

לאחר השלמה — Team 60 יריץ evidence חוזר (Run B off-hours); Team 50 corroboration v2.0.5.

---

**log_entry | TEAM_20 | CC02_OFF_HOURS_FIX | DONE | 2026-03-12**
