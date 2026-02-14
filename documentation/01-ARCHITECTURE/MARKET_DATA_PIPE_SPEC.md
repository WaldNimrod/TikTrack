# MARKET_DATA_PIPE_SPEC — SSOT

**id:** `MARKET_DATA_PIPE_SPEC`  
**משימה:** 1-002 (Stage-1)  
**בעלים:** Team 20 (Backend) + Team 60 (תשתית)  
**תלות:** FOREX_MARKET_SPEC (1-001)  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)  
**סטטוס:** SSOT — קודם מטיוטת Team 20 ע"י Team 10 (Knowledge Promotion)  
**תאריך קידום:** 2026-02-13

---

## 1. מטרה

אפיון תשתית אספקת מחירי שוק (Market Data Pipeline) — היררכיית מקורות, מדיניות Staleness, ואי־חסימת UI.

---

## 2. היררכיית מקורות (Source Hierarchy)

| רמה | מקור | תיאור |
|-----|------|--------|
| 1 | **Cache** | מטמון מקומי — עדיפות ראשונה |
| 2 | **EOD** | End-of-Day / API חיצוני |
| 3 | **LocalStore** | שמירה מקומית (fallback) |

**מקור קיים:** `documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md`

---

## 2.1 Providers & Priority (Stage-1 — LOCKED)

| Domain | Primary | Fallback |
|--------|---------|----------|
| FX (Exchange Rates) | Alpha Vantage | Yahoo Finance |
| Prices (Ticker Prices) | Yahoo Finance | Alpha Vantage |

**No Frankfurter.** IBKR is **Broker only** (not market-data provider in Stage-1).  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE; ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022).

---

## 2.2 Provider Guardrails (LOCKED)

| ספק | חובה |
|-----|------|
| **Yahoo Finance** | User-Agent Rotation **required**. |
| **Alpha Vantage** | RateLimitQueue **required** (12.5s delay → 5 calls/min). |

---

## 2.3 Cache-First (Mandatory)

1. **Always check local cache (DB)** before any external API call.
2. Cache HIT → return immediately.
3. Cache MISS → Provider (Primary → Fallback).
4. Both fail → return stale (if exists) + `staleness=na`. **Never block UI.**

---

## 2.4 Cadence Policy (Stage‑1 — Intraday required)

- **FX:** EOD בלבד.
- **Prices:** Intraday for **Active tickers**; EOD for inactive (לפי System Settings — Domain + Ticker Status).
- **Historical daily:** 250 trading days retention (OHLCV) — נדרש ל־Indicators (ATR/MA/CCI).
- **Market Cap:** Daily (EOD). **Indicators:** ATR(14), MA(20/50/150/200), CCI(20) — Daily, derived from 250d history.

**מטריצת כיסוי מלאה:** `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`.

---

## 2.5 Data Freshness & UI Indicator (No Banner)

- UI must show **Last Update Clock** for prices.
- If stale/EOD → clock changes color + tooltip explains staleness.
- Fields: `price_timestamp` (as_of), `fetched_at`, `is_stale`. **אין באנר** — Clock + color + tooltip בלבד.

## 2.6 Cadence Configuration (System Settings — Required)

System Settings (Admin) must allow **configurable cadence** by **domain** and **ticker status**:

- **Prices (Active):** intraday interval (minutes) — configurable.  
- **Prices (Inactive):** EOD schedule (time + timezone).  
- **FX:** EOD schedule (time + timezone).  
- **Staleness thresholds:** warning + na boundaries (for clock color/tooltip).

This configuration is required for Stage‑1, and must be available via Admin Settings UI.

---

## 3. מדיניות (Policy)

| כלל | תיאור |
|-----|--------|
| **Never block UI** | אסור לחסום את ה-UI בגלל קריאה ל-API חיצוני |
| **Staleness Warning** | התראה כשהנתונים בני 15 דקות |
| **Staleness N/A** | אחרי יום מסחר מלא — N/A / אין ציפייה |

---

## 4. ממשקים צפויים

### 4.1 מחירי טיקרים (Ticker Prices)

- טבלאות:
  - **Daily / EOD + Historical:** `market_data.ticker_prices`
  - **Intraday (Active tickers):** `market_data.ticker_prices_intraday`  **(separate table)**
- שדות: `price`, `open_price`, `high_price`, `low_price`, `close_price`, **`market_cap`** — `NUMERIC(20,8)`
- **Historical daily:** 250 trading days retention (OHLCV) — נדרש ל־Indicators.
- **Indicators (Stage-1):** ATR(14), MA(20/50/150/200), CCI(20) — ראה `MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md`.
- מקור: `api/models/ticker_prices.py`

### 4.2 שערי חליפין (Exchange Rates)

- לפי FOREX_MARKET_SPEC (1-001) — `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
- `conversion_rate` — `NUMERIC(20,8)`

---

## 5. Smart History Fill (LOCKED — Stage-1)

**מקור אמת:** _COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md

### 5.1 עקרונות מחייבים

| החלטה | תוכן |
|--------|------|
| **Gap-First** | תמיד קודם בודקים פערים; מבקשים מהספק **רק תאריכים חסרים** (לא טעינה מלאה מיותרת). |
| **Reload רק ב-Admin** | טעינה מלאה (מחיקה + טעינה מחדש) מנוהלת **אך ורק** מעמוד ניהול טיקרים (Admin), עם אישור מפורש. |
| **250 ימי מסחר מינימום** | סף מינימום לכל טיקר — 250 ימי מסחר (OHLCV) — נדרש ל־Indicators (ATR/MA/CCI). |
| **Gap Definition** | **Gap** = יום חסר אחד בתוך חלון 250 ימי המסחר. |
| **Retry Policy** | ניסיון חוזר **מיידי** אחד + **Batch לילה** אם לא הושגו 250 ימים. |
| **History Priority** | **Yahoo → Alpha** (כבכל מחירי טיקר — §2.1). |
| **Provider Interface** | הרחבת `get_ticker_history`: פרמטרים אופציונליים **`date_from`**, **`date_to`** — למילוי פערים בלבד. |
| **API Design** | **Endpoint יחיד:** `POST /api/v1/tickers/{ticker_id}/history-backfill` עם query **`mode=gap_fill`** (ברירת מחדל) או **`mode=force_reload`** (Admin בלבד). |

### 5.2 זרימת עבודה (Smart History Engine)

1. **Gap Analysis** — רשימת תאריכים קיימים מ-DB; חישוב `missing_dates` (עד 250 ימי מסחר אחורה).  
2. **Decision** — אין פערים → NO_OP; יש פערים → GAP_FILL.  
3. **Gap Fill** — קריאה לספק רק עבור טווח המכסה את `missing_dates` (דרך `date_from`/`date_to`).  
4. **Force Reload** — רק מ-Admin עם אישור → ניקוי נתונים לטיקר → טעינה מלאה.  
5. **Post-run Verification** — `COUNT(rows) >= MIN_HISTORY_DAYS`; אם לא — Retry חכם (מיידי + batch לילה).

### 5.3 מיקום לוגיקה

- **מנגנון ברמת מערכת:** Smart History Engine (Service/Engine) — לא בתוך קוד הספקים; שימוש אחיד לכל ספק.  
- **סקריפט:** `scripts/sync_ticker_prices_history_backfill.py` — מתואם עם המנוע.  
- **API:** `api/routers/tickers.py` — `POST /{ticker_id}/history-backfill?mode=gap_fill|force_reload`.

---

## 6. תיאום Team 60

| נושא | בעלים | הערות |
|------|--------|--------|
| תשתית Cache | Team 60 | **DB as Cache** — טבלאות DB + `market_data.latest_ticker_prices` (MV) כמאגר; ללא Redis בשלב זה. |
| סנכרון EOD | Team 60 | **Cron** דוגמה: `0 22 * * 1-5` (22:00 ימים א'–ה'); **אזור זמן:** UTC. סקריפט: `scripts/sync_exchange_rates_eod.py`. |
| ספק + Scope מטבעות | Team 60 | **Alpha Vantage → Yahoo.** **Scope ראשוני:** USD, EUR, ILS בלבד. הרחבה לפי ISO 4217 — עתידי. |
| DDL / Schema | Team 60 | טבלאות ticker_prices, exchange_rates |

---

## 7. תוכנית ולידציה

1. וידוא שהממשק לא חוסם UI (timeout, fallback).
2. וידוא Staleness logic — Warning / N/A.
3. Precision Audit (1-004) — NUMERIC(20,8) בכל השדות.

---

## 8. תחזוקה וניקוי (Background Jobs — Stage‑1)

**מטרה:** למנוע התנפחות DB ולשמור על דיוק נתונים לאורך זמן.

### 7.1 Jobs מחייבים (Stage‑1)

1. **FX EOD Sync (Cron)**  
   - מקור: FOREX_MARKET_SPEC §2.3  
   - תזמון: `0 22 * * 1-5` (UTC)  
   - פעולה: עדכון `market_data.exchange_rates` + `last_sync_time`

2. **Intraday Refresh (Active tickers)**  
   - תזמון: **מתוך System Settings** (דקות)  
   - פעולה: רענון `market_data.ticker_prices_intraday`  
   - תנאי: **Active בלבד** (`is_active_flags = true`)

3. **Daily History Retention**  
   - טווח חובה: **250 ימי מסחר**  
   - פעולה: ניקוי רשומות ישנות מ־`market_data.ticker_prices`  

4. **Intraday Retention Cleanup**  
   - פעולה: מחיקת רשומות ישנות מ־`market_data.ticker_prices_intraday`  
   - **חלון שימור (נעול):** **30 ימים** ב־DB  
   - **ארכוב:** לאחר 30 ימים → מעבר לקבצי מידע (archive files)  
   - **מחיקה סופית:** קבצי Intraday יימחקו לאחר **שנה** (365 ימים)

5. **MV Refresh (אם קיים)**  
   - `market_data.latest_ticker_prices` — רענון לאחר ריצת Intraday / EOD.

### 7.2 Evidence (נדרש)

- כל Job חייב לכתוב: `last_run_time`, `rows_updated`, `rows_pruned`.  
- Evidence לוג יתווסף ב־`documentation/05-REPORTS/artifacts/` לכל סבב סגירה.

### 7.3 Retention + Archive Policy (Locked)

1. **Daily/EOD + FX (DB Retention):** **250 ימי מסחר** ב־DB.  
2. **Archive (post‑retention):** נתוני EOD + FX **לא נמחקים** — מועברים לקבצי מידע/לוג לקריאה איטית בעת הצורך.  
3. **Intraday (DB Retention):** **30 ימים**.  
4. **Intraday (Archive Retention):** שמירה בקבצים **שנה אחת** ואז מחיקה סופית.

### 7.4 Cleanup Cycles (Locked)

- **Daily:** ניקוי בסיסי (DB retention thresholds).  
- **Weekly:** ניקוי מעמיק + אימות תקינות ארכיב.  
- **Monthly:** ניקוי עומק + בדיקת עקביות לוגים/ארכיב.

**הערה:** תזמוני תחזוקה נוספים יתווספו בהמשך תהליך הפיתוח.

---

## 9. Rate‑Limit & Scaling Policy (Stage‑1)

**מטרה:** למנוע חסימות ספקים (429) ולאפשר סקייל עם נפחי מידע גדולים.

### 8.1 Core Rules (LOCKED)

1. **Cache‑First Only** — אין קריאה חיצונית מתוך request.  
2. **Single‑Flight Refresh** — Job יחיד מרענן; בקשות אחרות מקבלות stale.  
3. **Backoff & Cooldown** — ספק שמחזיר 429 נכנס ל‑cooldown (ללא ניסיונות נוספים בפרק הזמן).  
4. **Provider Fallback** — Yahoo → Alpha (Prices), Alpha → Yahoo (FX).  
5. **Never Block UI** — במקרה כשל → stale + `staleness=na`.

### 8.2 Cadence Tiering (Load Control)

- **Active tickers:** Intraday (minutes, configurable).  
- **Inactive tickers:** EOD בלבד.  
- **Market Cap:** Daily (EOD).  
- **Indicators (ATR/MA/CCI):** Daily (computed from 250d).  

### 8.3 System Settings (Required)

System Settings must expose:
- `max_active_tickers`  
- `intraday_interval_minutes`  
- `provider_cooldown_minutes`  
- `max_symbols_per_request` (if provider supports batching)

### 8.4 Yahoo Guardrails

- **User‑Agent rotation** required.  
- If **429** → cooldown + fallback.  

---

## 10. הפניות

| מסמך | נתיב |
|------|------|
| TT2_MARKET_DATA_RESILIENCE | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md |
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md |
| ticker_prices model | api/models/ticker_prices.py |
| Roadmap v2.1 | _COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |
| Smart History Fill (Locked) | _COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md |

---

**log_entry | TEAM_10 | SSOT_UPDATE | SMART_HISTORY_FILL_LOCKED | 2026-02-14** — §5 Smart History Fill (Gap-First, 250d min, Gap def, Retry, Yahoo→Alpha, date_from/date_to, API mode=gap_fill|force_reload, Reload Admin only). מקור: TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.

**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | MARKET_DATA_PIPE_SPEC_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | CACHE_EOD_DECISION_TO_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | EXTERNAL_DATA_SSOT_INTEGRATION | 2026-02-13** — Providers (Yahoo+Alpha), Guardrails, Cache-First, Cadence, UI Clock (מקור: TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT). — DB-as-Cache, Cron+UTC, Scope USD/EUR/ILS (מקור: Team 60).  
**log_entry | TEAM_10 | SSOT_EXPANSION | RESUBMISSION_90 | 2026-02-13** — Market Cap, Indicators (ATR/MA/CCI), 250d historical, Coverage Matrix + Indicators Spec (מקור: TEAM_90_RESUBMISSION_REQUIRED, TEAM_90_INDICATORS_ADDENDUM).  
**log_entry | TEAM_90 | INTRADAY_LOCK | STAGE1_DECISIONS | 2026-02-13** — Intraday required for Active tickers; separate intraday table; System Settings cadence config (domain + status).
**log_entry | TEAM_90 | MAINTENANCE_RETENTION_LOCK | STAGE1 | 2026-02-13** — Retention + archive policy + cleanup cycles locked (Intraday 30d→archive 1y; EOD/FX 250d→archive; daily/weekly/monthly).
**log_entry | TEAM_90 | RATELIMIT_SCALING_LOCK | STAGE1 | 2026-02-13** — Rate‑limit & scaling policy locked (cache‑first, single‑flight, cooldown on 429, system settings controls).
