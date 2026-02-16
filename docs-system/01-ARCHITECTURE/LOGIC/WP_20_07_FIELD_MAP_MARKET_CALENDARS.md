# 🗺️ Field Map LOD 400: יומני שוק (Market Calendars)

**id:** `WP_20_07_FIELD_MAP_MARKET_CALENDARS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.07 | **סטטוס:** ניהול זמן גלובלי | **סטנדרט:** Identity Strategy

## 1. סכימת מסד נתונים (Market Calendars)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `exchange_names` | `VARCHAR(100)` | `String` | NYSE, NASDAQ, וכו'. |
| `timezones` | `VARCHAR(50)` | `String` | למשל: America/New_York. |
| `trading_sessions` | `JSONB` | `Object` | הגדרות PRE/REG/POST. |