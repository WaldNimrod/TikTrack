# 🗺️ Field Map LOD 400: טיקרים ומיפויים (Tickers & Mappings)

**id:** `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-14  
**version:** v1.2

**סשן:** S20.09 | **סטטוס:** סגירת 100% פערים | **סטנדרט:** Identity Strategy

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` - אינדוקס פנימי אופטימלי.
- **External ULIDs:** `VARCHAR(26)` - חשיפה ב-API חיצוני.

## 2. סכימת נכסים (Tickers Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `ticker_symbols` | `VARCHAR(20)` | `String` | למשל: AAPL, BTC. |
| `provider_mapping_data` | `JSONB` | `Object` | מיפוי לספקים — **Yahoo Finance + Alpha Vantage בלבד** (Stage-1). אין IBKR כספק market-data. **יישור:** MARKET_DATA_COVERAGE_MATRIX + MARKET_DATA_PIPE_SPEC. |
| `asset_type_enums` | `VARCHAR(50)` | `Enum` | STOCK, CRYPTO, ETF. |
| `is_active_flags` | `BOOLEAN` | `Boolean` | true = Intraday+EOD+היסטוריה; false = EOD+היסטוריה בלבד. מקור: [TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT](../../09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md) (יעד: שדה status). |

## 2.1 Provider Mapping Contract (Stage-1 — LOCKED)

- `provider_mapping_data` חייב לכלול מפתח לכל ספק פעיל: `yahoo_finance`, `alpha_vantage`.
- עבור **CRYPTO**:
  - `yahoo_finance.symbol` בפורמט `BASE-QUOTE` (לדוגמה: `BTC-USD`)
  - `alpha_vantage.symbol` = בסיס (לדוגמה: `BTC`)
  - `alpha_vantage.market` = מטבע הציטוט (לדוגמה: `USD`)
- עבור **STOCK/ETF**:
  - ניתן לשמור `symbol` אחיד לשני הספקים (לדוגמה: `AAPL`)
  - סיומת בורסה נשמרת כחלק מהסימבול (לדוגמה: `ANAU.MI`)

דוגמה:

```json
{
  "yahoo_finance": { "symbol": "BTC-USD" },
  "alpha_vantage": { "symbol": "BTC", "market": "USD" }
}
```
