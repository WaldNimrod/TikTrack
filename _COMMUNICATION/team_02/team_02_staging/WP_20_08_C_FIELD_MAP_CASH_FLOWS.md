# 🗺️ Field Map LOD 400: תנועות מזומן (Cash Flows)
**project_domain:** TIKTRACK

**סשן:** S20.08.C | **משימה:** יומן תנועות הון

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` | **External ULIDs:** `VARCHAR(26)` (אכיפת ULID).

## 2. סכימת תנועות (Cash Flows Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | API ID. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | מזהה חשבונות המסחר. |
| `transaction_amounts` | `NUMERIC(20, 8)` | `Decimal` | דיוק נומרי 20,8. |