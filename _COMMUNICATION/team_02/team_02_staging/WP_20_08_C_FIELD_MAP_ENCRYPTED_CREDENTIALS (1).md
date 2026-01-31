# 🗺️ Field Map LOD 400: מפתחות API מוצפנים (Credentials)

**סשן:** S20.08.C | **סטטוס:** Security Isolation

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)`
- **External ULIDs:** `VARCHAR(26)` - **חובה: הצהרת ULID** (G-03).

## 2. סכימת אבטחה (Credentials Schema)
| שם שדה | טיפוס | הגדרות |
| :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | |
| `external_ulids` | `VARCHAR(26)` | ULID (API ID). |
| `trading_account_ids` | `BIGINT (FK)` | קישור לחשבונות מסחר. |
| `encrypted_api_keys` | `TEXT` | AES-256. |
| `encrypted_secrets` | `TEXT` | Encryption At Rest. |