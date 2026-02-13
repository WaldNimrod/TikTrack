# Team 20 → Team 50: הגשת External Data ל-QA

**from:** Team 20 (Backend)  
**to:** Team 50 (QA & Fidelity), Team 10 (The Gateway)  
**date:** 2026-02-13  
**משימות:** P3-008, P3-009, P3-013, P3-014, P3-015  
**מקור:** TEAM_10_TO_TEAM_20_EXTERNAL_DATA_ACTIVATION

---

## 1. הקשר

מימוש מלא של חבילת External Data (Market Data Pipeline) — Provider Interface, Cache-First, Guardrails, Market Cap, Indicators, 250d Historical.

---

## 2. תוצרים להעברה ל-QA

| מזהה | תוצר | מיקום | בדיקות |
|------|------|--------|--------|
| **P3-008** | Provider Interface + Cache-First | `api/integrations/market_data/` | Unit: imports; Manual: sync scripts |
| **P3-009** | Guardrails (Yahoo UA, Alpha RateLimit) | `providers/yahoo_provider.py`, `alpha_provider.py` | Manual: verify no block |
| **P3-013** | Market Cap | `ticker_prices.market_cap`, PriceResult, Providers | Migration: `scripts/migrations/p3_013_add_market_cap_to_ticker_prices.sql` |
| **P3-014** | Indicators ATR/MA/CCI | `indicators_service.py`, `cache_first_service.get_ticker_indicators_cache_first` | Unit: `tests/test_market_data_indicators.py` ✅ |
| **P3-015** | 250d Historical | `get_ticker_history`, `get_ticker_history_cache_first` | Unit: imports; Manual: fetch |
| **TickerPriceIntraday** | ORM | `api/models/ticker_prices_intraday.py` | Schema alignment |

---

## 3. בדיקות שהרצנו

- `python3 tests/test_market_data_indicators.py` — ✅ PASSED
- Import verification — ✅ כל המודולים נטענים

---

## 4. תלויות לריצת בדיקות

- **DB:** `market_data.ticker_prices` — צריך עמודה `market_cap` (הרצת migration P3-013 על ידי Team 60)
- **Env:** `ALPHA_VANTAGE_API_KEY` — לבדיקות אינטגרציה עם Alpha (אופציונלי)
- **yfinance:** מותקן ב-`api/requirements.txt`

---

## 5. קבצים לבדיקה

| קובץ | תיאור |
|------|--------|
| `api/integrations/market_data/provider_interface.py` | ממשק אגנוסטי, PriceResult, OHLCVRow |
| `api/integrations/market_data/providers/yahoo_provider.py` | Yahoo + UA Rotation + market_cap + history |
| `api/integrations/market_data/providers/alpha_provider.py` | Alpha + RateLimit 12.5s + market_cap + history |
| `api/integrations/market_data/cache_first_service.py` | Cache-First, get_ticker_indicators_cache_first |
| `api/integrations/market_data/indicators_service.py` | ATR(14), MA(20/50/150/200), CCI(20) |
| `api/models/ticker_prices.py` | + market_cap |
| `api/models/ticker_prices_intraday.py` | ORM Intraday |
| `scripts/migrations/p3_013_add_market_cap_to_ticker_prices.sql` | DDL ל-Team 60 |
| `tests/test_market_data_indicators.py` | Unit tests |

---

## 6. Evidence

`documentation/05-REPORTS/artifacts/TEAM_20_EXTERNAL_DATA_P3_008_015_EVIDENCE.md`

---

**בקשה ל-Team 50:** בדיקות לפי TEAM_50_QA_WORKFLOW_PROTOCOL. דיווח ל-Team 10.

**log_entry | TEAM_20 | TO_TEAM_50 | EXTERNAL_DATA_QA_HANDOFF | 2026-02-13**
