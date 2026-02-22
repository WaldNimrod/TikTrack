# 🗺️ Field Map LOD 400: יתרות חשבונות מסחר (Trading Accounts Balances)
**project_domain:** TIKTRACK

**סשן:** S20.08 | **מודל:** Multi-currency Cash Logic | **סטנדרט:** Plural (G-10)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת יתרות (Balances Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | דרישות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קישור לקונטיינר חשבונות המסחר. |
| `currency_codes` | `VARCHAR(3)` | `String` | ISO 4217. |
| `available_amounts` | `NUMERIC(20, 8)` | `Decimal` | מזומן זמין (דיוק 8 ספרות). |
| `locked_amounts` | `NUMERIC(20, 8)` | `Decimal` | הון נעול בפוזיציות/מרג'ין. |