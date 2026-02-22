# 🗺️ Field Map LOD 400: עדכוני זהות ואבטחה (D25 Update)
**project_domain:** TIKTRACK

**סשן:** S20.11 | **רכיב:** D25_SEC_VIEW | **סטנדרת:** Plural (G-10)

## 1. עדכונים לישות המשתמשים (Users)
| שדה | טיפוס | אילוצים | מטרה |
| :--- | :--- | :--- | :--- |
| `phone_numbers` | `VARCHAR(20)` | `UNIQUE INDEX` | מזהה משני הכרחי לשחזור. |
| `ui_display_configs` | `JSONB` | `Default: {}` | אחסון Design Tokens (Colors, Icons). |

## 2. עדכונים לישות שחזור סיסמה (Password Resets)
| שדה | טיפוס | הגדרות |
| :--- | :--- | :--- |
| `delivery_method_enums` | `ENUM` | `EMAIL`, `SMS`. |
| `verification_codes` | `VARCHAR(10)` | קוד חד פעמי. |