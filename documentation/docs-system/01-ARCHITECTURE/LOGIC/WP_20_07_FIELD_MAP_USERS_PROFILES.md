# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)
**project_domain:** TIKTRACK

**id:** `WP_20_07_FIELD_MAP_USERS_PROFILES`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

**סשן:** S20.07 | **סטטוס:** השלמת זהות (5 Profiles) | **סטנדרט:** Identity Strategy  
**עדכון:** Admin Duplicate Email/Phone Exception (2026-02-01)

## 1. סכימת מסד נתונים (Users)
| שם שדה | טיפוס פנימי | טיפוס חיצוני | הגדרות |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT (PK)` | `N/A` | PK פנימי. |
| `ulid` | `VARCHAR(26)` | `ULID` | מזהה API חיצוני. |
| `email` | `VARCHAR(255)` | `String` | אינדקס Unique (למשתמשים רגילים). **החרגה:** ADMIN/SUPERADMIN יכולים להיות עם email כפול. |
| `phone_number` | `VARCHAR(20)` | `String` | אינדקס Unique (למשתמשים רגילים, אם לא NULL). **החרגה:** ADMIN/SUPERADMIN יכולים להיות עם phone כפול. |
| `user_profiles` | `JSONB` | `Object` | מימוש 5 פרופילים (Day, Swing, וכו'). |
| `is_active_statuses` | `BOOLEAN` | `Boolean` | סטטוס משתמשים. |

## 2. מדיניות Uniqueness - Email ו-Phone

**כלל כללי:** Email ו-Phone הם UNIQUE per active user.

**החרגה:** ADMIN ו-SUPERADMIN יכולים להיות עם email/phone שכבר קיים אצל משתמש אחר (dual identity).

**ראה:** `WP_20_07_C_ADMIN_DUPLICATE_EMAIL_PHONE_POLICY.md` לפרטים מלאים.