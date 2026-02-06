# 🗺️ Field Map LOD 400: טיקרים ומיפויים (Tickers & Mappings)

**id:** `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

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