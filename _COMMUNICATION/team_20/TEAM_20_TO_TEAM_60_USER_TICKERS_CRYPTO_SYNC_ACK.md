# Team 20 → Team 60: אישור — User Tickers Crypto Sync (Corrective)

**id:** `TEAM_20_TO_TEAM_60_USER_TICKERS_CRYPTO_SYNC_ACK`  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-14  
**מקור:** TEAM_60_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_COORDINATION

---

## 1. בוצע

עודכנו שלושת הסקריפטים לפי דרישות §3.1–3.3:

### 1.1 טעינה מרחיבה
- **load_tickers** (EOD), **load_active_tickers** (intraday), **load_tickers_needing_backfill** (history): קוראים כעת `ticker_type` ו־`metadata`.
- **load_ticker_with_history_info**: מחזיר גם `ticker_type` ו־`metadata` (ל-API history backfill).

### 1.2 שימוש ב־provider mapping
- מודול משותף: `api/integrations/market_data/provider_mapping_utils.py` — `get_provider_mapping`, `resolve_symbols_for_fetch`.
- **CRYPTO**: Alpha משתמש ב־`get_ticker_price_crypto` / `get_ticker_history_crypto` (DIGITAL_CURRENCY_DAILY).
- **STOCK**: התנהגות קיימת (GLOBAL_QUOTE, TIME_SERIES_DAILY).

### 1.3 אי־שבירה
- **אין סינון** לפי `ticker_type=CRYPTO` — Jobs ממשיכים לכלול את כל הטיקרים הפעילים.

---

## 2. קבצים שעודכנו

| קובץ | שינוי |
|------|-------|
| `api/integrations/market_data/provider_mapping_utils.py` | חדש — לוגיקת provider mapping משותפת |
| `scripts/sync_ticker_prices_eod.py` | טעינה מרחיבה + crypto ב-fetch |
| `scripts/sync_ticker_prices_intraday.py` | טעינה מרחיבה + crypto ב-fetch |
| `scripts/sync_ticker_prices_history_backfill.py` | טעינה מרחיבה + crypto ב-fetch + load_ticker_with_history_info |
| `api/services/history_backfill_service.py` | העברת ticker_type, metadata ל-fetch_history_for_ticker |

---

## 3. המשך

- Team 60 יכול להריץ את הסקריפטים דרך cron.
- אין שינוי ב-make targets או ב-ENV.
- Evidence: `documentation/05-REPORTS/artifacts/TEAM_20_USER_TICKERS_CRYPTO_SYNC_EVIDENCE.md`

---

**Status:** ✅ COMPLETE — Sync scripts support CRYPTO + provider mapping  
**log_entry | TEAM_20 | TO_TEAM_60 | USER_TICKERS_CRYPTO_SYNC_ACK | 2026-02-14**
