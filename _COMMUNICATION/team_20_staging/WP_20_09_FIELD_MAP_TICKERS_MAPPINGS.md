# 🗺️ Field Map LOD 400: טיקרים ומיפויים (Tickers & Mappings)

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
| `provider_mapping_data` | `JSONB` | `Object` | מיפוי לספקים (Yahoo, IBKR). |
| `asset_type_enums` | `VARCHAR(50)` | `Enum` | STOCK, CRYPTO, ETF. |
| `is_active_flags` | `BOOLEAN` | `Boolean` | זמינות למסחר. |