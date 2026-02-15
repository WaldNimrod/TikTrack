# עדכוני SSOT — User Tickers: Crypto + Exchanges

**From:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**מקור:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN.md

---

## 1. מסמכי SSOT לעדכון (חובה)

| מסמך | מיקום | עדכון נדרש |
|------|--------|-------------|
| **MARKET_DATA_PIPE_SPEC** | `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` | תיעוד פורמט `provider_mapping_data` עבור **קריפטו** (symbol+market, Alpha DIGITAL_CURRENCY_DAILY). |
| **MARKET_DATA_COVERAGE_MATRIX** | `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` | **קריפטו** כלול ומנוהל לפי mapping; בורסות אירופה + TASE. |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS** | `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md` | דוגמת mapping ל**קריפטו**; דוגמאות בורסות (.MI, TASE). **פורמט נעול (אדריכלית):** `{ "yahoo_finance": { "symbol": "BTC-USD" }, "alpha_vantage": { "symbol": "BTC", "market": "USD" } }` — ראה TEAM_10_USER_TICKERS_FINAL_TEST_AND_ROOT_FIX_PLAN.md §3.3. |
| **00_MASTER_INDEX** | `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` | הפניות לתוכנית התיקון ולמסמכים המעודכנים. |

---

## 2. משימת סריקה ורשימת Seed (Team 10 → Team 20)

- **חובה:** לבצע **סריקה** ולהודיע לצוות 20 **רשימה של ערכים לטבלת seed**.
- ערכים רלוונטיים (לפי צורך): בורסות (exchanges) — כולל Milan (.MI), תל אביב (TASE); דוגמאות mapping לקריפטו ולבורסות.
- **מסירה:** רשימה מפורמטת ל-Team 20 (קובץ או מסמך ב-`_COMMUNICATION/team_10/` או ב-artifacts); Team 20 מיישם את ה-seed.

---

## 3. סטטוס

- עדכוני SSOT — בהתאם לתוכנית התיקון; לא לסגור User Tickers לפני סגירת פערים ואישור Team 90.
- רשימת seed — לסריקה ומסירה ל-Team 20.

---

**log_entry | TEAM_10 | USER_TICKERS_SSOT_CRYPTO_EXCHANGE_UPDATES | 2026-02-14**
