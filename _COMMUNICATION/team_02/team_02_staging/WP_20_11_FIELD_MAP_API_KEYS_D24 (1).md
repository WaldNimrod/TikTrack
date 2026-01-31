# 🗺️ Field Map LOD 400: ניהול מפתחות API (D24 Update)

**סשן:** S20.11 | **רכיב:** D24_API_VIEW | **סטטוס:** STRICT MASKING ENFORCED

## 1. סכימת מפתחות API (User API Keys)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API (G-03). |
| `owner_user_ids` | `BIGINT (FK)` | `ULID` | קישור למשתמש. |
| `provider_enums` | `VARCHAR(20)` | `Enum` | `IBKR`, `POLYGON`, `YAHOO`. |
| `encrypted_api_keys` | `TEXT` | `MASKED_STRING` | **חובה: החזרת ערך ממוסך בפורמט `**********`.** |
| `encrypted_secrets` | `TEXT` | `MASKED_STRING` | **חובה: החזרת ערך ממוסך בפורמט `**********`.** |
| `is_active_flags` | `BOOLEAN` | `Boolean` | סטטוס מפתח. |

## 2. מדיניות מיסוך (Masking Policy)
- **Security Rule:** המערכת לעולם לא תחזיר את המפתח המפוענח ב-API. 
- **Representation:** הממשק יקבל מחרוזת של 20 כוכביות עבור מפתחות קיימים.

## 3. דוגמת חוזה API (Masked Response)
```json
{
  "external_ulid": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "provider": "IBKR",
  "api_key": "********************",
  "is_active": true
}
```