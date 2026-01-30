# 🗺️ Field Map LOD 400: חשבונות מסחר (Trading Accounts)

**סשן:** S20.07 | **סטטוס:** סגירת 100% פערים | **סטנדרט:** Plural Standard (G-10)

## 1. סכימת מסד נתונים (Trading Accounts)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | דרישות לוגיות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | אינדוקס פנימי אופטימלי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה חיצוני גלובלי (G-03). |
| `user_ids` | `BIGINT (FK)` | `ULID` | קישור לישויות משתמשים. |
| `display_names` | `VARCHAR(255)` | `String` | שמות חשבונות המסחר (אכיפת G-10). |
| `opening_balances` | `JSONB` | `Object` | דיוק 20,8 (למשל: `{"USD": 100.00000000}`). |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | תמיכה ב-Soft Delete. |
| `created_at_times` | `TIMESTAMP` | `ISO8601` | Global UTC Storage. |
| `updated_at_times` | `TIMESTAMP` | `ISO8601` | מעקב עדכונים אטומי. |

## 2. וולידציות וכללים
- איסור מוחלט על שימוש במונח 'חשבון' (Account) ללא 'מסחר' (Trading).
- אכיפת לשון רבים לכל אורך הישות.