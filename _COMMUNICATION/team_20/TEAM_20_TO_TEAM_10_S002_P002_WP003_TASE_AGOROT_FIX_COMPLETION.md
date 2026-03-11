# Team 20 → Team 10 | S002-P002-WP003 — TASE Agorot Fix Completion (B2)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P002_WP003_TASE_AGOROT_FIX_COMPLETION  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 90, Team 60, Team 50  
**date:** 2025-01-31  
**status:** **DONE**  
**gate_id:** GATE_3 / G3.7  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P002_WP003_TASE_AGOROT_FIX_MANDATE  
**priority:** P0  

---

## 1) Root Cause

Yahoo Finance ו-Alpha מחזירים מחירי TASE (סיומת `.TA`, כגון TEVA.TA) ב**אגורות** (ILA), לא שקלים. 1 ש"ח = 100 אגורות. הקוד לא ביצע המרה.

---

## 2) Fix Summary

| מיקום | שינוי |
|--------|--------|
| **yahoo_provider.py** | `_tase_agorot_to_ils()` — המרת כל .TA ל-ILS (÷100) |
| **yahoo_provider.py** | `_fetch_prices_batch_sync()` — יישום על price, open, high, low, close |
| **yahoo_provider.py** | `_fetch_last_close_via_v8_chart_inner()` — יישום על price, o, h, lw |
| **yahoo_provider.py** | `_fetch_price_via_quote_api()` — יישום על price, open, high, low |
| **alpha_provider.py** | `_tase_agorot_to_ils()` — המרה רק כאשר price > 1000 (אגורות) |
| **alpha_provider.py** | `get_ticker_price()` GLOBAL_QUOTE path — יישום על OHLC |
| **alpha_provider.py** | `_get_price_from_timeseries_daily()` — יישום על OHLC |
| **scripts/backfill_tase_agorot_to_ils.py** | **חדש** — backfill שורות קיימות (price > 200 → ÷100) |

---

## 3) Verification

| בדיקה | תוצאה |
|--------|--------|
| TEVA.TA `current_price < 200` | ✅ PASS — 94.25 (ש"ח) |
| Backfill | ✅ 171 rows updated (ticker_prices + ticker_prices_intraday) |

**פלט אימות:**
```
TEVA.TA latest: ('TEVA.TA', Decimal('94.25000000'), ...)
price < 200: True
```

---

## 4) Changed Files

| קובץ | שינוי |
|------|--------|
| `api/integrations/market_data/providers/yahoo_provider.py` | `_tase_agorot_to_ils`, יישום ב-3 פונקציות |
| `api/integrations/market_data/providers/alpha_provider.py` | `_tase_agorot_to_ils`, יישום ב-get_ticker_price + _get_price_from_timeseries_daily |
| `scripts/backfill_tase_agorot_to_ils.py` | **חדש** — המרת נתונים קיימים |

---

## 5) Commands

```bash
# Backfill (הרצה חד-פעמית לאחר deploy)
python3 scripts/backfill_tase_agorot_to_ils.py

# אימות
# SELECT price FROM market_data.ticker_prices tp
# JOIN market_data.tickers t ON t.id = tp.ticker_id
# WHERE t.symbol = 'TEVA.TA' ORDER BY tp.price_timestamp DESC LIMIT 1;
# Expect: price < 200 (שקלים)
```

---

## 6) On Completion

Team 10 — להמשיך ל-Team 90 / Phase 2 runtime mandate (TEVA.TA shekel range assertion).

---

**log_entry | TEAM_20 | TASE_AGOROT_FIX_COMPLETION | TO_TEAM_10 | DONE | 2025-01-31**
