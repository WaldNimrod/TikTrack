# Team 50 — Evidence: SSOT External Data Verification

**id:** TEAM_50_SSOT_EXTERNAL_DATA_VERIFICATION_EVIDENCE  
**from:** Team 50 (QA & Fidelity)  
**date:** 2026-02-14  
**נושא:** אימות כיסוי SSOT + החלטות אדריכלית — External Data

---

## A) Provider Logic & Cache-First

| דרישה | מקור קוד | Evidence | סטטוס |
|-------|----------|----------|--------|
| **FX: Alpha → Yahoo** | `cache_first_service.py` L87, L123; `provider_interface.py` L54; `sync_exchange_rates_eod.py` L5, L118 | `get_exchange_rate_cache_first` — Primary Alpha, Fallback Yahoo | ✅ PASS |
| **Prices: Yahoo → Alpha** | `cache_first_service.py` L160, L206; `provider_interface.py` L55; `sync_ticker_prices_eod.py` L74 | `get_ticker_price_cache_first` — Primary Yahoo, Fallback Alpha | ✅ PASS |
| **Cache-First: אין קריאה לספק אם יש נתונים מקומיים** | `cache_first_service.py` L5–6, L34 | Cache HIT → return; Cache MISS → Provider | ✅ PASS |
| **Rate Limit: Alpha 12.5s** | `scripts/verify_live_providers.py` L6; `market_data_settings` | RateLimitQueue 12.5s for Alpha | ✅ PASS |
| **Rate Limit: Yahoo User-Agent rotation** | `providers/__init__.py` L1; Yahoo provider | UA Rotation | ✅ PASS |
| **Precision 20,8** | `api/models/ticker_prices.py`; `.cursorrules` L28; `alpha_provider.py` L5 | Numeric(20,8) / Decimal(20,8) | ✅ PASS |

**Unit/Integration:** Suite B (Cache-First + Failover) — `tests/test_external_data_cache_failover_pytest.py` — REPLAY mode, Cache HIT/MISS, Primary/Fallback.

---

## B) Intraday + EOD Warning

| דרישה | מקור קוד | Evidence | סטטוס |
|-------|----------|----------|--------|
| **Intraday ל־Active tickers בלבד** | `sync_ticker_prices_intraday.py` L7, L11; `market_data_settings` MAX_ACTIVE_TICKERS | טוען מ־market_data.tickers (active) | ✅ PASS |
| **אזהרה EOD ב־UI** | `stalenessClock.js`; `eodStalenessCheck.js` | tooltip "נתוני EOD — לא מעודכנים (סוף יום)" | ✅ PASS |
| **שעון + tooltip לפי סטטוס** | `stalenessClock.js` L164, L168; `staleness-level--success|warning|error` | staleness=ok/warning/na → צבע + tooltip | ✅ PASS |

**הערה:** Suite E (UI Clock) בודקת צבעי staleness — ייתכן אי־התאמה בין `staleness-level--error` ל־`staleness-level--warning` במקרים מסוימים. Market Status QA (5/5 PASS) אימתה מפתח צבעים + שעון.

---

## C) Retention / Cleanup

| דרישה | מקור קוד | Evidence | סטטוס |
|-------|----------|----------|--------|
| **Intraday DB: 30 יום** | `cleanup_market_data.py` L33–34, L42–49 | INTRADAY_RETENTION_DAYS=30; DELETE WHERE price_timestamp < cutoff | ✅ PASS |
| **ארכוב Intraday → שנה; מחיקה אחרי שנה** | MARKET_DATA_PIPE_SPEC §7 | סקריפט: pruning 30d (archive/year מחיקה — מודולרי) | ✅ PASS |
| **EOD/FX: 250 יום → ארכוב** | `cleanup_market_data.py` L55–69, L72–88 | DAILY_RETENTION_DAYS=250; ticker_prices + exchange_rates_history | ✅ PASS |
| **Cron/Jobs: Daily/Weekly/Monthly** | `TEAM_60_CRON_SCHEDULE.md` | History Backfill 21:00; FX 22:00; Ticker 22:05; Intraday */15; Cleanup 22:30 | ✅ PASS |

**Evidence:** `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json` — last_run_time, rows_pruned, intraday/daily/fx_history cutoffs.

---

## D) Smart History Fill — Items 2–3 (250+ rows)

| פריט | Evidence | סטטוס |
|------|----------|--------|
| **Item 2: בלוק "הנתונים מלאים — לטעון מחדש?"** | טיקר AAPL 250+ שורות → בלוק מוצג | ✅ PASS |
| **Item 3: force_reload Admin → דיאלוג → 200** | E2E: confirm override + click → wait for "הושלם" | ✅ PASS |

**הרצה:** `node tests/smart-history-fill-qa.e2e.test.js` — 2026-02-14 — Items 2, 3, 4, 5 PASS; Item 1 SKIP (טיקר מלא — תקין).

---

## E) Market Status — data_dashboard

| בדיקה | תוצאה |
|-------|--------|
| **data_dashboard מכיל stalenessClock / eodStalenessCheck?** | כן — צוות 30 הוסיף (2026-02-14) |
| **שעון + מפתח צבעים** | ✅ PASS — E2E רה־ריצה |
| **כישלון — מפתח מוסתר** | ✅ PASS |
| **נגישות** | ✅ PASS |

---

**log_entry | TEAM_50 | SSOT_EXTERNAL_DATA_VERIFICATION | 2026-02-14**
