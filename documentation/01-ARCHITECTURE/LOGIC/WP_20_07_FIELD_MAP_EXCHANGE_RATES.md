# 🗺️ Field Map LOD 400: שערי חליפין (Exchange Rates)

**סשן:** S20.07 | **סטטוס:** דיוק Forex (20,8) | **סטנדרט:** Identity Strategy

## 1. סכימת מסד נתונים (Exchange Rates)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `from_currencies` | `VARCHAR(3)` | `String` | ISO 4217 (למשל: USD). |
| `to_currencies` | `VARCHAR(3)` | `String` | ISO 4217 (למשל: ILS). |
| `conversion_rates` | `NUMERIC(20, 8)` | `Decimal` | דיוק 8 ספרות לאחר הנקודה. |
| `last_sync_times` | `TIMESTAMP` | `ISO8601` | זמן סנכרון UTC. |