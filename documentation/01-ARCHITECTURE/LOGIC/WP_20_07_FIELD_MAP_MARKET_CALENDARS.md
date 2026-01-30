# 🗺️ Field Map LOD 400: יומני שוק (Market Calendars)

**סשן:** S20.07 | **סטטוס:** ניהול זמן גלובלי | **סטנדרט:** Identity Strategy

## 1. סכימת מסד נתונים (Market Calendars)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `exchange_names` | `VARCHAR(100)` | `String` | NYSE, NASDAQ, וכו'. |
| `timezones` | `VARCHAR(50)` | `String` | למשל: America/New_York. |
| `trading_sessions` | `JSONB` | `Object` | הגדרות PRE/REG/POST. |