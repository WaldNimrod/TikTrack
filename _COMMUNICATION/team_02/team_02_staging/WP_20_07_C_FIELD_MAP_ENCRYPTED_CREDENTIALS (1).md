# 🗺️ Field Map LOD 400: מפתחות API מוצפנים (Credentials)
**project_domain:** TIKTRACK

**סשן:** S20.07.C | **סטטוס:** Security Isolation

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)`
- **External ULIDs:** `VARCHAR(26)` - **חובה: הצהרת ULID** (G-03).

## 2. סכימת אבטחה (Credentials Schema)
| שדה | טיפוס | הגדרות |
| :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | |
| `external_ulids` | `VARCHAR(26)` | מזהה API (ULID). |
| `trading_account_ids` | `BIGINT (FK)` | קישור לחשבונות מסחר. |
| `encrypted_api_keys` | `TEXT` | AES-256 Encryption. |
| `encrypted_secrets` | `TEXT` | Encryption at Rest. |