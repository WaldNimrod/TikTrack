# 🗺️ Field Map LOD 400: תנועות מזומן (Cash Flows)

**סשן:** S20.08 | **משימה:** יומן תנועות הון | **סטנדרט:** Plural Standard

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת תנועות (Cash Flows Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | API ID. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | מזהה חשבונות המסחר המבצעים. |
| `transaction_amounts` | `NUMERIC(20, 8)` | `Decimal` | סכום התנועה (דיוק 20,8). |