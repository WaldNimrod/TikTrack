# 🗺️ Field Map LOD 400: יתרות חשבונות מסחר (Trading Accounts Balances)

**סשן:** S20.08.C | **משימה:** Separated Balance Model (Multi-Currency)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)`
- **External ULIDs:** `VARCHAR(26)` - **חובה: הצהרת ULID** (G-03).

## 2. סכימת יתרות (Balances Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API (ULID). |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קונטיינר חשבונות המסחר. |
| `currency_codes` | `VARCHAR(3)` | `String` | ISO 4217 (Plural). |
| `available_amounts` | `NUMERIC(20, 8)` | `Decimal` | מזומן זמין. |
| `locked_amounts` | `NUMERIC(20, 8)` | `Decimal` | הון נעול. |
| `opening_balance_amounts` | `NUMERIC(20, 8)` | `Decimal` | **יתרת פתיחה ראשונית** (DECIMAL 20,8). |