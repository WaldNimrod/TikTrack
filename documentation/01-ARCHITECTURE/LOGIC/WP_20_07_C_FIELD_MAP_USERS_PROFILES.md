# 🗺️ Field Map LOD 400: משתמשים ופרופילים (Users & Profiles)

**סשן:** S20.07.C | **עדכון:** Identity Tiers (Bronze-Platinum) + Admin Duplicate Email/Phone Exception

## 1. אסטרטגיית מזהים
- **Internal IDs:** `BIGINT` | **External ULIDs:** `VARCHAR(26)`

## 2. סכימת משתמשים (Users Schema)
| שדה | טיפוס פנימי | הגדרות לוגיות |
| :--- | :--- | :--- |
| `internal_ids` | `BIGINT (PK)` | PK פנימי. |
| `external_ulids` | `VARCHAR(26)` | ULID חשוף. |
| `user_tier_levels` | `ENUM` | **Bronze, Silver, Gold, Platinum** (מדרג חובה). |
| `email` | `VARCHAR(255)` | Unique Index (למשתמשים רגילים). **החרגה:** ADMIN/SUPERADMIN יכולים להיות עם email כפול. |
| `phone_number` | `VARCHAR(20)` | Unique Index (למשתמשים רגילים, אם לא NULL). **החרגה:** ADMIN/SUPERADMIN יכולים להיות עם phone כפול. |
| `user_profiles_data` | `JSONB` | אחסון עד 5 פרופילים (JSONB). |

## 3. מדיניות Uniqueness - Email ו-Phone

### כלל כללי
- **Email:** UNIQUE per active user (לא נמחק)
- **Phone:** UNIQUE per active user (אם לא NULL ולא נמחק)

### החרגה למנהלים
- **ADMIN ו-SUPERADMIN:** יכולים להיות עם email/phone שכבר קיים אצל משתמש אחר
- **סיבה:** לאפשר למנהל להיות גם מנהל וגם משתמש רגיל (dual identity)

### יישום טכני
- **DB Schema:** Partial Unique Indexes (`idx_users_email_unique_non_admin`, `idx_users_phone_unique_non_admin`) שמדלגים על ADMIN/SUPERADMIN
- **Application Logic:** בדיקת uniqueness בקוד מדלגת על ADMIN/SUPERADMIN לפני commit
- **ראה:** `PHX_DB_SCHEMA_V2.5_ADMIN_DUPLICATE_EMAIL_PHONE.sql` לעדכון DB schema