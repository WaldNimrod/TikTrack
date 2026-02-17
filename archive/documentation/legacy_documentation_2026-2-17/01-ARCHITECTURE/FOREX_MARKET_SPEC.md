# FOREX_MARKET_SPEC — SSOT

**id:** `FOREX_MARKET_SPEC`  
**משימה:** 1-001 (Stage-1)  
**בעלים:** Team 20 (Backend) + Team 10 (תיעוד SSOT)  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)  
**סטטוס:** SSOT — קודם מטיוטת Team 20 ע"י Team 10 (Knowledge Promotion)  
**תאריך קידום:** 2026-02-13  
**עדכון ADR-022:** 2026-02-13 — Providers (Yahoo+Alpha), FX EOD, Cache-First, Scope USD/EUR/ILS, Visual Warning (מטיוטת Team 20).

---

## 1. מטרה

אפיון שערי חליפין ומחירי FOREX כתשתית חובה לפני Batch 3. Spec זה מהווה SSOT להמרות מטבע, מחירי שוק ורמת דיוק.

---

## 2. טווח (Scope)

| נושא | תיאור |
|------|--------|
| **שערי חליפין** | מקור שערים להמרת מטבע (Cash Flows CURRENCY_CONVERSION, D21) |
| **דיוק** | `NUMERIC(20, 8)` לשערים/מחירים (SSOT: PRECISION_POLICY_SSOT, WP_20_07) |
| **מטבעות** | USD, EUR, ILS (טווח ראשוני — ראה §2.4) |
| **זמן** | `last_sync_time` — TIMESTAMP UTC |

### 2.1 Providers (ספקי שערי FX) — ADR-022

| ספק | שימוש | הערות |
|-----|--------|------|
| **Alpha Vantage** | Primary | ראשי |
| **Yahoo Finance** | Fallback | גיבוי |
| ~~Frankfurter~~ | **אין** | הוסר לפי ADR-022 |

**החלטה:** Yahoo + Alpha בלבד. אין שימוש ב-Frankfurter.

### 2.2 מקור נתונים — FX EOD בלבד

- **EOD (End-of-Day):** שערי חליפין נמשכים פעם ביום (סנכרון EOD).
- **אין Real-Time:** לא נעשה שימוש בשערי real-time.
- **Primary/Fallback:** Alpha Vantage → Yahoo (בעת כשל או חוסר נתונים).

### 2.3 Cache-First Enforcement

- **חובה:** אין פנייה ל-API חיצוני לפני בדיקת local cache.
- **מקור נתונים ל-Endpoint:** קריאה מ־`market_data.exchange_rates` (מטמון/DB).
- **סנכרון:** Team 60 — cron/job מרענן את הטבלה (EOD). אין קריאה חיצונית מתוך request.

### 2.4 Scope מטבעות (נעול)

**מטבעות נתמכים (טווח ראשוני):** USD, EUR, ILS. הרחבה עתידית — לפי החלטת Product.

### 2.5 Staleness & UI (EOD)

- **חובה:** אינדיקציה למשתמש כאשר מוצג מחיר/שער EOD או stale.
- **מימוש:** שדה `staleness` בתגובת API: `ok` \| `warning` (>15 דקות) \| `na` (>24 שעות).
- **Frontend:** Clock + color + tooltip (אין באנר). ראה MARKET_DATA_PIPE_SPEC §2.5.

---

## 3. סכימת נתונים (Data Schema)

### 3.1 Exchange Rates

| שדה | טיפוס | תיאור |
|-----|-------|--------|
| `from_currency` | VARCHAR(3) | מטבע מקור (ISO 4217) |
| `to_currency` | VARCHAR(3) | מטבע יעד (ISO 4217) |
| `conversion_rate` | NUMERIC(20, 8) | שער המרה |
| `last_sync_time` | TIMESTAMPTZ | זמן סנכרון אחרון (UTC) |

**מקור קיים:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_EXCHANGE_RATES.md`

### 3.2 Market Prices (מחירי שוק)

| שדה | טיפוס | תיאור |
|-----|-------|--------|
| `symbol` | VARCHAR | מזהה נייר (טיקר) |
| `price` | NUMERIC(20, 8) | מחיר |
| `source` | VARCHAR | מקור (EOD/Cache/Local) |
| `as_of` | TIMESTAMPTZ | זמן מחיר |

**מקור קיים:** `api/models/ticker_prices.py` — `Numeric(20, 8)` ל-price.

---

## 4. תלויות

| תלות | תיאור |
|------|--------|
| **MARKET_DATA_PIPE** | תשתית אספקת מחירי שוק (1-002) |
| **ADR-022** | מדיניות ספקים, EOD, Cache-First, Visual Warning (§2.1–2.5) |
| **Precision Audit** | אימות דיוק לפי PRECISION_POLICY_SSOT (1-004) |

---

## 5. תוכנית ולידציה

1. וידוא שכל endpoint המחזיר שערי חליפין/מחירים משתמש ב־`Decimal` / `NUMERIC(20,8)`.
2. וידוא ש־`GET /api/v1/cash_flows/currency_conversions` עקבי ל־Spec.
3. Precision Audit (1-004) יסמן סטיות ויתקן.

---

## 6. הפניות

| מסמך | נתיב |
|------|------|
| Exchange Rates Field Map | documentation/01-ARCHITECTURE/LOGIC/WP_20_07_FIELD_MAP_EXCHANGE_RATES.md |
| Market Data Resilience | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md |
| Roadmap v2.1 | _COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |
| Cash Flow Types SSOT | documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md |

---

**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | FOREX_MARKET_SPEC_SSOT | 2026-02-13**  
**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | FOREX_MARKET_SPEC_ADR_022 | 2026-02-13** — מיזוג טיוטת P3-005 (TEAM_20_P3_005_FOREX_MARKET_SPEC_UPDATE_DRAFT) ל־SSOT.
