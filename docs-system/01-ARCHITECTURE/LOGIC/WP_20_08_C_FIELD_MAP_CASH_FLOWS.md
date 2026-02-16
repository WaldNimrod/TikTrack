# 🗺️ Field Map LOD 400: תנועות מזומן (Cash Flows)

**id:** `WP_20_08_C_FIELD_MAP_CASH_FLOWS`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.08.C | **משימה:** יומן תנועות הון

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` | **External ULIDs:** `VARCHAR(26)` (אכיפת ULID).

## 2. סכימת תנועות (Cash Flows Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | API ID. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | מזהה חשבונות המסחר. |
| `transaction_amounts` | `NUMERIC(20, 6)` | `Decimal` | דיוק נומרי 20,6 — PRECISION_POLICY_SSOT (תזרימים). |