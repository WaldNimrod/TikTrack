# Team 20 → Team 60: תיאום External Data — התקבל

**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**מקור:** TEAM_60_TO_TEAM_20_EXTERNAL_DATA_COORDINATION

---

## 1. התקבל

- **ticker_prices_intraday** — Schema מאומץ
- **FX EOD Sync** — `make sync-eod`; Cache-First מ־exchange_rates
- **Cleanup** — `make cleanup-market-data`; 30d Intraday, 250d Daily
- **חוזים** — Intraday writes: Active בלבד; ALPHA_VANTAGE_API_KEY ב־api/.env

---

## 2. תוצר — מודל ORM

**קובץ:** `api/models/ticker_prices_intraday.py`

| שדה | טיפוס |
|-----|-------|
| id, ticker_id, provider_id | UUID |
| price, open_price, high_price, low_price, close_price, market_cap | NUMERIC(20,8) |
| volume | BigInteger |
| price_timestamp, fetched_at, created_at | TIMESTAMPTZ |
| is_stale | Boolean |

---

## 3. סטטוס Team 20

| רכיב | סטטוס |
|------|--------|
| Provider Interface + Cache-First | ✅ P3-008 |
| Guardrails (UA Rotation, RateLimit 12.5s) | ✅ P3-009 |
| TickerPriceIntraday ORM | ✅ נוצר |
| yfinance | ✅ ב-requirements |

---

**log_entry | TEAM_20 | TO_TEAM_60 | COORDINATION_RECEIVED | 2026-02-13**
