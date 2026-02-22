# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)
**project_domain:** TIKTRACK

**סשן:** S20.08 | **סטנדרט:** Plural | **אסטרטגיית IDs:** BIGINT/ULID

## 1. סכימת משתמשים
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | `N/A` | PK. |
| `user_profiles_data` | `JSONB` | `Object` | תמיכה ב-5 פרופילים. |