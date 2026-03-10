# Team 60 → Team 10 | S002-P002-WP003 GATE_7 — Remediation Round 2 Completion

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION  
**from:** Team 60 (Infrastructure)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 20, Team 30  
**date:** 2026-03-10  
**status:** **DONE**  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE7_R2_MANDATE  
**authority:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0  
**SSOT findings:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_DETAILED_QA_FINDINGS_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 10 |

---

## 1) Summary

Team 60 has completed all R2 scope items **1.2, 1.3, 1.5, 1.6**. Deliverables: seed script updated (exchange_id, ticker_type, cleanup DDD/TSLA/MSFT, SPY/QQQ as ETF); pipelines verified (EOD/intraday + exchange_rates job). This document serves as **handoff to Team 20** with DB structure and seed/migration notes.

---

## 2) Finding Matrix — Team 60 (completed)

| # | ממצא | פעולה | סטטוס |
|---|------|--------|--------|
| **1.2** | רמזור אדום — price_source null | וידוא sync EOD/intraday + exchange_rates job; pipelines | ✅ DONE |
| **1.3** | exchange_id null | seed מקשר טיקרים ל־exchange (TEVA.TA→TASE, ANAU.MI→MIL, US→NASDAQ/NYSE) | ✅ DONE |
| **1.5** | ticker_type שגוי (SPY, QQQ = ETF) | seed: SPY, QQQ עם ticker_type=ETF; שאר נכסים STOCK/CRYPTO | ✅ DONE |
| **1.6** | ניקוי seed | הסרת DDD, TSLA, MSFT (soft-delete); הוספת SPY, QQQ כ־ETF | ✅ DONE |

---

## 3) Evidence & Implementation

### 3.1) 1.2 — Pipelines (EOD/intraday + exchange_rates)

- **sync_ticker_prices_intraday:** רשום ב־`api/background/scheduler_registry.py`; רץ לפי `INTRADAY_INTERVAL_MINUTES`; ממלא `ticker_prices_intraday` ו־EOD fallback ב־`tickers_service` מספק `price_source` / `price_as_of_utc`.
- **sync_exchange_rates_eod:** רשום באותו registry; רץ כל 1440 דק' (R1 GATE_7); מעדכן `market_data.exchange_rates.last_sync_time`.
- **תנאי ל־price_source לא null:** יש להריץ לאחר seed: `make sync-eod` (או job exchange_rates) ו־intraday job פעיל; טיקרים פעילים יקבלו EOD/intraday מ־`_get_price_with_fallback` (Team 20 מטפל ב־API flow).

**המלצה ל־Team 20:** לוודא ש־GET טיקרים מחזיר `price_source` ו־`price_as_of_utc` ממילוי EOD/intraday (כבר מיושם ב־tickers_service); אם רמזור נשאר אדום — לבדוק שטיקרים ב־DB עם מחירים (להריץ sync לאחר seed).

### 3.2) 1.3, 1.5, 1.6 — Seed script

**קובץ:** `scripts/seed_market_data_tickers.py`

- **מבנה רשומה:** `(symbol, company_name, ticker_type, exchange_code)`. `exchange_code` מתמפה ל־`exchange_id` דרך `market_data.exchanges` (נדרש להריץ לפני seed: migration `p3_021_market_data_reference_tables.sql` — מזין NASDAQ, NYSE, TASE, MIL, LSE).
- **ניקוי (1.6):** בתחילת seed — `UPDATE market_data.tickers SET deleted_at = NOW() WHERE symbol IN ('DDD','TSLA','MSFT')`.
- **טיקרים אחרי R2:**

| symbol    | company_name              | ticker_type | exchange_code | הערה     |
|-----------|---------------------------|-------------|---------------|----------|
| AAPL      | Apple Inc.                | STOCK       | NASDAQ        |          |
| GOOGL     | Alphabet Inc. (Google)    | STOCK       | NASDAQ        |          |
| AMZN      | Amazon.com Inc.           | STOCK       | NASDAQ        |          |
| SPY       | SPDR S&P 500 ETF          | ETF         | NYSE          | 1.5      |
| QQQ       | Invesco QQQ Trust         | ETF         | NASDAQ        | 1.5      |
| TEVA.TA   | Teva Pharmaceutical       | STOCK       | TASE          | 1.3 ILS  |
| BTC-USD   | Bitcoin USD               | CRYPTO      | —             | exchange_id null |
| ANAU.MI   | Anima Holding             | STOCK       | MIL           | 1.3 EUR  |

- **פקודה:** `make seed-tickers` או `python3 scripts/seed_market_data_tickers.py` (מהשורש של הפרויקט, עם `api/.env` / DATABASE_URL).

---

## 4) Handoff to Team 20

### 4.1) מבנה DB רלוונטי

- **market_data.exchanges**  
  - עמודות: `id` (UUID), `exchange_code` (UNIQUE), `exchange_name`, `country` (ISO 3166-1 alpha-2: USA, ISR, ITA, GBR), `timezone`, `status`.  
  - ערכי seed: NASDAQ, NYSE, LSE, TASE, MIL (מ־`scripts/migrations/p3_021_market_data_reference_tables.sql`).

- **market_data.tickers**  
  - עמודות: `id`, `symbol`, `exchange_id` (FK → market_data.exchanges.id, nullable), `company_name`, `ticker_type` (enum: STOCK, ETF, CRYPTO, …), `is_active`, `deleted_at`, `created_at`, `updated_at`, ואחרים לפי סכמה.  
  - **R2:** לכל טיקר ב־seed מוגדרים `exchange_id` (לפי exchange_code) ו־`ticker_type` (ETF ל־SPY/QQQ).

### 4.2) מיפוי מטבע (לשימוש ב־API)

- **country → currency (SSOT):** USA→USD, ISR→ILS, ITA→EUR, GBR→GBP. CRYPTO / ללא exchange: נגזר מסמל (למשל BTC-USD→USD) או ברירת מחדל.
- Team 20: קישור טיקר ל־exchange (למשל JOIN ל־exchanges) ו־`_derive_currency` לפי `exchanges.country` + סוג נכס.

### 4.3) Seed scripts & סדר הרצה

1. **מיגרציות:** להריץ `p3_021_market_data_reference_tables.sql` (exchanges + sectors וכו') אם טרם הורץ.
2. **Seed טיקרים:** `make seed-tickers` — מוסיף/מעדכן את רשימת הטיקרים למעלה ומנקה DDD/TSLA/MSFT.
3. **אופציונלי:** `make sync-eod` / הרצת job של exchange_rates לרענון מחירים ושערי המרה.

### 4.4) רשימת טיקרים לדוגמה (עם exchange ו־ticker_type)

| symbol    | exchange_code | ticker_type | country (למטבע) |
|-----------|----------------|-------------|-------------------|
| AAPL      | NASDAQ         | STOCK       | USA → USD         |
| SPY       | NYSE           | ETF         | USA → USD         |
| QQQ       | NASDAQ         | ETF         | USA → USD         |
| TEVA.TA   | TASE           | STOCK       | ISR → ILS         |
| ANAU.MI   | MIL            | STOCK       | ITA → EUR         |
| BTC-USD   | —              | CRYPTO      | נגזר מסמל / USD   |

---

## 5) Integration Notes

- **Team 20:** יש לספק ב־API שדות `exchange_id` / `exchange_code` (או `currency` נגזר) ו־`ticker_type` מתאימים ל־DB; לוודא זרימת EOD/intraday ל־`price_source` / `price_as_of_utc` (ממצא 1.2). חוזה add-form: מטבע, בורסה, סמל בורסאי (למשל ANAU.MI) — לפי מנדט R2.
- **Team 30:** לאחר עדכון API — binding מקור/עודכן ב, formatCurrency לפי מטבע, מודל פרטים מלא, טופס הוספה עם מטבע ובורסה.

---

## 6) Deliverable Path

- **נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md` (מסמך זה).
- **סטטוס:** DONE. מוכן להפעלת Team 20 על ידי Team 10.

---

**log_entry | TEAM_60 | WP003_G7_R2_COMPLETION | TO_TEAM_10 | DONE | HANDOFF_TO_20 | 2026-03-11**
