# Team 20 — דוח מימוש External Data (סיכום ל-Team 10)

**id:** TEAM_20_EXTERNAL_DATA_IMPLEMENTATION_SUMMARY_FOR_TEAM_10  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-14  
**מטרה:** עדכון תיעוד ומערכת לפי המימוש בפועל

---

## 1. Providers — Yahoo / Alpha

| נושא | תוכן |
|------|------|
| **מגבלות** | Yahoo: 429 (rate limit), "No data" בסוף שבוע/טווח תאריכים; Alpha: דורש API key, 5 קריאות/דקה (12.5s). |
| **תיקונים** | UA Rotation (Yahoo); RateLimitQueue (Alpha); Cooldown על 429 (provider_cooldown.py). |
| **Fallback** | Prices: Yahoo → Alpha; FX: Alpha → Yahoo. Alpha "no API key" → Yahoo כ־Primary ל־Prices. |

**מקור:** MARKET_DATA_PIPE_SPEC §2.1, §2.2; TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE.

---

## 2. סקריפטי סנכרון

| סקריפט | תיאור | Make target |
|--------|--------|-------------|
| **sync_exchange_rates_eod.py** | FX (Alpha→Yahoo) + exchange_rates_history | `make sync-eod` |
| **sync_ticker_prices_eod.py** | מחירי טיקר EOD (Yahoo→Alpha); טיקרים מ־market_data.tickers | `make sync-ticker-prices` |
| **sync_intraday.py** (או מקביל) | ticker_prices_intraday — Active tickers | `make sync-intraday` |
| **History Backfill** | 250d OHLCV לטיקרים עם &lt; 250 שורות (Indicators) | `make sync-history-backfill` |
| **cleanup_market_data.py** | Intraday 30d, Daily 250d, FX history 250d | `make cleanup-market-data` |
| **seed_market_data_tickers.py** | Seed טיקרים (נדרש לפני sync מחירים) | `make seed-tickers` |

**Make targets רלוונטיים:** seed-tickers, sync-eod, sync-ticker-prices, sync-intraday, sync-history-backfill, cleanup-market-data, check-market-data-counts, verify_dual_provider_full_scope.

---

## 3. Cron / Jobs

| נושא | תוכן |
|------|------|
| **תזמון** | EOD: History Backfill 21:00, FX 22:00, Ticker 22:05, Cleanup 22:30 UTC (Mon–Fri). Intraday: */15 דקות (לפי INTRADAY_INTERVAL_MINUTES). |
| **Wrapper** | `scripts/run_market_data_job.sh` — טוען api/.env ומריץ job (sync-history-backfill, sync-eod, sync-ticker-prices, sync-intraday, cleanup-market-data). |
| **תיעוד** | **TEAM_60_CRON_SCHEDULE.md** — documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md (או נתיב מקביל). |

---

## 4. API — Endpoints

| Endpoint | תיאור |
|----------|--------|
| **GET /api/v1/tickers** | רשימת טיקרים (id, symbol, company_name, current_price, …). |
| **GET /api/v1/tickers/{ticker_id}/data-integrity** | בקרת תקינות — eod_prices, intraday_prices, history_250d, gaps_summary, last_updates. |
| **GET /api/v1/settings/market-data** | System Settings (max_active_tickers, intraday_interval_minutes, provider_cooldown_minutes, max_symbols_per_request). |
| **GET /api/v1/reference/exchange-rates** | שערי חליפין (דשבורד נתונים). |

**קבצים:** api/routers/tickers.py, api/routers/settings.py; api/services/tickers_service.py (get_tickers, get_ticker_data_integrity); api/schemas/tickers.py (TickerDataIntegrityResponse).

---

## 5. טבלאות DB (market_data)

| טבלה | תיאור |
|------|--------|
| **tickers** | רשימת טיקרים (symbol, company_name, …). |
| **ticker_prices** | מחירי EOD + היסטוריה יומית (250d retention). |
| **ticker_prices_intraday** | מחירים תוך־יומיים — Active tickers (P3-016). |
| **exchange_rates** | שערי חליפין נוכחיים. |
| **exchange_rates_history** | היסטוריית FX 250d (p3_018). |

**בדיקת ספירות:** `make check-market-data-counts` או `python3 scripts/check_market_data_counts.py`.

---

## 6. UI — בקרת תקינות נתונים (D22)

| פריט | תוכן |
|------|------|
| **עמוד** | ניהול טיקרים — tickers.html |
| **רכיב** | דרופדאון טיקר + כפתור "בדוק" + פירוט (eod_prices, intraday_prices, history_250d) + gaps_summary + last_updates. |
| **קובץ לוגיקה** | tickersDataIntegrityInit.js (או מקביל) — קריאה ל־GET /tickers/{id}/data-integrity. |
| **מקור בקשה** | TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST; מסירה: TEAM_10_TO_TEAM_30_TICKER_DATA_INTEGRITY_UI_HANDOFF. |

---

## 7. הפניות לתיעוד

| סוג | מסמכים |
|-----|--------|
| **SSOT** | MARKET_DATA_PIPE_SPEC, MARKET_DATA_COVERAGE_MATRIX, FOREX_MARKET_SPEC, PRECISION_POLICY_SSOT, TT2_MARKET_DATA_RESILIENCE. |
| **תאום** | TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST, TEAM_20_TO_TEAM_60_HISTORY_BACKFILL_COORDINATION_REQUEST, TEAM_60_CRON_SCHEDULE. |
| **Evidence** | TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE, TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE, TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE. |
| **Debug / ספירות** | scripts/check_market_data_counts.py, scripts/verify_dual_provider_full_scope.py. |

---

## 8. Make targets (סיכום)

| Target | שימוש |
|--------|--------|
| seed-tickers | Seed market_data.tickers (לפני sync מחירים) |
| sync-eod | EOD FX + exchange_rates_history |
| sync-ticker-prices | EOD ticker_prices (Yahoo→Alpha) |
| sync-intraday | Intraday ticker_prices_intraday (Active) |
| sync-history-backfill | History backfill 250d (טיקרים עם &lt; 250 שורות) |
| cleanup-market-data | Retention + ארכיון |
| check-market-data-counts | ספירות טבלאות market_data |
| ensure-ticker-prices-partitions | יצירת 파티ונות 2025–2027 |

---

## 9. ENV

| משתנה | תיאור | ברירת מחדל (market_data_settings) |
|--------|--------|-----------------------------------|
| DATABASE_URL | חיבור DB | — |
| ALPHA_VANTAGE_API_KEY | Alpha Vantage API key | — |
| MAX_ACTIVE_TICKERS | מקסימום טיקרים פעילים (Intraday) | 50 |
| INTRADAY_INTERVAL_MINUTES | מרווח Intraday (דקות) | 15 |
| PROVIDER_COOLDOWN_MINUTES | Cooldown אחרי 429 (דקות) | 15 |
| MAX_SYMBOLS_PER_REQUEST | מקסימום סימבולים לבקשה | 5 |

**מיקום:** api/.env, api/.env.example; market_data_settings.py קורא מ־env.

---

## 10. המלצות לעדכון (Team 10)

| פריט | פעולה מומלצת |
|------|----------------|
| **D15_MASTER_INDEX / אינדקס מערכת** | לעדכן רשימת Jobs (EOD, Intraday, History Backfill, Cleanup) ונתיבי תיעוד (TEAM_60_CRON_SCHEDULE, דוח זה). |
| **Page Tracker** | D22 — וידוא שהערת "בקרת תקינות" ו־widget (data-integrity) מעודכנים; D23 דשבורד נתונים. |
| **רשימת Jobs** | פרסום רשימה אחת (מקור: TEAM_60_CRON_SCHEDULE) — History Backfill, FX, Ticker, Intraday, Cleanup — עם Make targets ו־wrapper. |

---

**log_entry | TEAM_20 | EXTERNAL_DATA_IMPLEMENTATION_SUMMARY | FOR_TEAM_10 | 2026-02-14**
