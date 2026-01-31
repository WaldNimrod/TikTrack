# 🗺️ Field Map LOD 400: הגדרות מערכת (System Settings)

**סשן:** S20.10 | **משימה:** WP-20.10 | **סטנדרט:** Identity Strategy (BIGINT/ULID)

## 1. אסטרטגיית מזהים (Identity Strategy)
- **Internal IDs:** `BIGINT (PK)` - אופטימיזציית אינדקסים פנימית.
- **External ULIDs:** `VARCHAR(26)` - חשיפה בטוחה ב-API חיצוני (G-03).

## 2. סכימת הגדרות מערכת (System Settings Schema)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות לוגיות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `setting_keys` | `VARCHAR(100)` | `String` | מזהה ייחודי (למשל: `FX_FRESHNESS_THRESHOLD`). |
| `setting_values` | `JSONB` | `Object` | קונפיגורציה גמישה. דיוק נומרי פנימי ל-`NUMERIC(20, 8)`. |
| `is_system_reserved_flags` | `BOOLEAN` | `Boolean` | הגנה מפני שינוי משתמשים. |

## 3. וולידציות וכללים
- אכיפה: שימוש בלעדי במונח 'הגדרות מערכת' (System Settings) בלשון רבים.
- אסטרטגיית אחסון: שימוש ב-JSONB לכל שדות הקונפיגורציה הדינמיים.