# 🗺️ Field Map LOD 400: רשומות ביצוע (Executions)

**סשן:** S20.09.C | **משימה:** רישום ביצועים אטומיים | **דיוק:** DECIMAL(20, 8)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)` (ULID Mandatory).

## 2. סכימת ביצועים (Executions Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קישור לחשבונות מסחר (Plural). |
| `execution_quantities`| `NUMERIC(20, 8)` | `Decimal` | כמות (20,8). |
| `execution_prices` | `NUMERIC(20, 8)` | `Decimal` | מחיר (20,8). |