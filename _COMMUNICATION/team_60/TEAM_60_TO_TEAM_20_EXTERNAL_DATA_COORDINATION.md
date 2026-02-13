# Team 60 → Team 20: תיאום External Data — תשתית מוכנה

**id:** `TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_60_EXTERNAL_DATA_ACTIVATION; P3-011, P3-016, P3-017

---

## 1. תשתית — סטטוס

| רכיב | סטטוס | פרטים |
|------|--------|-------|
| **market_data.ticker_prices_intraday** | ✅ קיים | טבלה נפרדת ל-Intraday (Active tickers); שדות: price, open_price, high_price, low_price, close_price, volume, market_cap — NUMERIC(20,8) |
| **market_data.exchange_rates** | ✅ קיים | FX EOD; Scope USD/EUR/ILS |
| **FX EOD Sync** | ✅ פעיל | Alpha Vantage (Primary) → Yahoo (Fallback); `make sync-eod`; Cron 0 22 * * 1-5 (UTC) |
| **Cleanup Jobs** | ✅ פעיל | Intraday 30d, Daily 250d; `make cleanup-market-data`; Evidence ב-artifacts |

---

## 2. Schema — ticker_prices_intraday

**טבלה:** `market_data.ticker_prices_intraday`

| עמודה | טיפוס | הערות |
|-------|-------|-------|
| id | UUID | PK |
| ticker_id | UUID | NOT NULL |
| provider_id | UUID | NULL |
| price | NUMERIC(20,8) | NOT NULL |
| open_price, high_price, low_price, close_price | NUMERIC(20,8) | |
| volume | BIGINT | |
| market_cap | NUMERIC(20,8) | |
| price_timestamp | TIMESTAMPTZ | NOT NULL |
| fetched_at | TIMESTAMPTZ | NOT NULL |
| is_stale | BOOLEAN | NOT NULL DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL |

**אינדקסים:** ticker_id+price_timestamp, price_timestamp, is_stale.  
**Retention:** 30 ימים — Cleanup job מוחק ישן.

---

## 3. חוזים ל-Team 20

| נושא | חוזה |
|------|------|
| **Intraday writes** | כתיבה ל־`ticker_prices_intraday` — Active tickers בלבד (`is_active_flags = true`) |
| **FX reads** | קריאה מ־`market_data.exchange_rates` — Cache-First; Job מרענן EOD |
| **Alpha Vantage** | ALPHA_VANTAGE_API_KEY ב־api/.env — חובה ל-FX EOD |
| **Yahoo fallback** | yfinance — התקנה ב־requirements אם חסר |

---

## 4. סקריפטים והרצה

| פקודה | תיאור |
|-------|--------|
| `make sync-eod` | סנכרון FX — Alpha→Yahoo |
| `make cleanup-market-data` | ניקוי Intraday 30d, Daily 250d + Evidence |
| Cron דוגמה | `0 22 * * 1-5` (FX); `0 1 * * *` (Cleanup) |

---

## 5. תלות

- **Team 20:** מודל/ORM ל־ticker_prices_intraday; שירות Cache-First משתמש ב־Alpha/Yahoo; Guardrails (RateLimit 12.5s, User-Agent Rotation).
- **api/.env:** DATABASE_URL, ALPHA_VANTAGE_API_KEY.

---

**log_entry | TEAM_60 | TO_TEAM_20 | EXTERNAL_DATA_COORDINATION | 2026-02-13**
