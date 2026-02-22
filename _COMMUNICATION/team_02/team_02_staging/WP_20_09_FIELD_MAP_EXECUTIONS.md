# 🗺️ Field Map LOD 400: רשומות ביצוע (Executions)
**project_domain:** TIKTRACK

**סשן:** S20.09 | **סטטוס:** דיוק פיננסי 20,8 | **סטנדרט:** Plural (G-10)

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת ביצועים (Executions Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קישור לחשבונות מסחר (Plural). |
| `ticker_ids` | `BIGINT (FK)` | `ULID` | קישור לנכסים. |
| `side_type_enums` | `VARCHAR(10)` | `Enum` | BUY, SELL. |
| `execution_quantities`| `NUMERIC(20, 8)` | `Decimal` | כמות (דיוק 8 ספרות). |
| `execution_prices` | `NUMERIC(20, 8)` | `Decimal` | מחיר ביצוע (20,8). |
| `execution_timestamps`| `TIMESTAMP` | `ISO8601` | Global UTC Storage. |