# FOREX_MARKET_SPEC — SSOT

**id:** `FOREX_MARKET_SPEC`  
**משימה:** 1-001 (Stage-1)  
**בעלים:** Team 20 (Backend) + Team 10 (תיעוד SSOT)  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)  
**סטטוס:** SSOT — קודם מטיוטת Team 20 ע"י Team 10 (Knowledge Promotion)  
**תאריך קידום:** 2026-02-13

---

## 1. מטרה

אפיון שערי חליפין ומחירי FOREX כתשתית חובה לפני Batch 3. Spec זה מהווה SSOT להמרות מטבע, מחירי שוק ורמת דיוק.

---

## 2. טווח (Scope)

| נושא | תיאור |
|------|--------|
| **שערי חליפין** | מקור שערים להמרת מטבע (Cash Flows CURRENCY_CONVERSION, D21) |
| **דיוק** | `NUMERIC(20, 8)` לכל ערך כספי/שער (SSOT: .cursorrules, WP_20_07) |
| **מטבעות** | ISO 4217 (USD, EUR, ILS וכו') |
| **זמן** | `last_sync_time` — TIMESTAMP UTC |

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
| **Precision Audit** | אימות NUMERIC(20,8) בכל השדות הכספיים (1-004) |

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
| Roadmap v2.1 | _COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |
| Cash Flow Types SSOT | documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md |

---

**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | FOREX_MARKET_SPEC_SSOT | 2026-02-13**
