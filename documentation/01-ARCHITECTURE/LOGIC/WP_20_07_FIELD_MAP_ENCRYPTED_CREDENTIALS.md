# 🗺️ Field Map LOD 400: מפתחות API מוצפנים (Encrypted Credentials)

**סשן:** S20.07 | **סטטוס:** אבטחה מחמירה | **סטנדרט:** Identity Strategy

## 1. סכימת מסד נתונים (Encrypted Credentials)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `trading_account_ids` | `BIGINT (FK)` | `ULID` | קישור לחשבונות מסחר. |
| `encrypted_api_keys` | `TEXT` | `String` | AES-256 Encryption. |
| `encrypted_secrets` | `TEXT` | `String` | הצפנה במנוחה (At Rest). |