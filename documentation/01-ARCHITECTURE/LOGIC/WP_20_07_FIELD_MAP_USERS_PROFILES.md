# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)

**סשן:** S20.07 | **סטטוס:** השלמת זהות (5 Profiles) | **סטנדרט:** Identity Strategy

## 1. סכימת מסד נתונים (Users)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `email_addresses` | `VARCHAR(255)` | `String` | אינדקס Unique. |
| `user_profiles` | `JSONB` | `Object` | מימוש 5 פרופילים (Day, Swing, וכו'). |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | סטטוס משתמשים. |