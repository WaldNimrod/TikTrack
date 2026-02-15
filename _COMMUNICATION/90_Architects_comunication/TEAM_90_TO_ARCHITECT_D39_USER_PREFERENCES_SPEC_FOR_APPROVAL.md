# Team 90 -> Architect: D39 User Preferences Spec (For Approval)

**id:** `TEAM_90_D39_USER_PREFERENCES_SPEC`  
**from:** Team 90 (The Spy)  
**to:** Architect  
**date:** 2026-02-15  
**status:** READY FOR ARCHITECT REVIEW  
**page_id:** D39 (`/preferences.html`)

---

## 1) מטרת המסמך

לאשר אפיון מחייב לעמוד **D39 — העדפות משתמש** לפני מימוש, עם הפרדה מלאה בין:
- **העדפות משתמש אישיות (D39)**
- **הגדרות מערכת גלובליות (D40 / system_management)**

---

## 2) מצב קיים (Evidence בלבד)

| נושא | מצב נוכחי | מקור |
|------|-----------|------|
| Route + תפריט | `preferences.html` קיים בתפריט ובראוטים | `ui/public/routes.json`, `ui/src/views/shared/unified-header.html` |
| תבנית עמוד | Shell קיים (ללא לוגיקה עסקית) | `ui/src/views/settings/preferences/preferences.html` |
| PageConfig | קיים אך עם אי-דיוקים סמנטיים | `ui/src/views/settings/preferences/preferencesPageConfig.js` |
| API משתמש קיים | `GET /users/me`, `PUT /users/me` (כולל `timezone`, `language`) | `api/routers/users.py`, `api/schemas/identity.py`, `api/models/identity.py` |
| API הגדרות מערכת | `GET /settings/market-data` Admin-only | `api/routers/settings.py` |
| טבלת `user_data.preferences` | לא קיימת כרגע ב-DDL הפעיל | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` |
| רפרנס לגסי | קיים מיפוי ל-`user_data.preferences` ו-`notification_settings` | `documentation/03-PRODUCT_&_BUSINESS/LEGACY_TO_PHOENIX_MAPPING_V2.5.md` |

---

## 3) גבולות אחריות (נעילה מוצעת)

### 3.1 מה שייך ל-D39 (User Preferences)
- שפה (`language`)
- אזור זמן (`timezone`)
- העדפות עבודה אישיות (Theme/Trading defaults/Notification preferences) — בכפוף להחלטת Data Model

### 3.2 מה לא שייך ל-D39
- כל הגדרת מערכת גלובלית/Infrastructure (Rate limit, cadence, provider cooldown, system flags)  
  -> נשאר ב-D40 (`system_management`) וב-`/settings/*` Admin-only.

---

## 4) אפיון פונקציונלי מוצע (שלבי מימוש)

## Phase D39-MVP (למימוש מהיר, ללא הרחבת DB)
1. עמוד D39 יציג טופס העדפות בסיס:
   - `language`
   - `timezone`
2. שמירה דרך `PUT /users/me`.
3. טעינה דרך `GET /users/me`.
4. שדות זהות (שם/טלפון/דוא"ל) **לא** מוכפלים ב-D39; נשארים ב-D15.V (Profile).

**יתרון:** אפס שינוי סכימה; מבוסס יכולות קיימות.

## Phase D39-V2 (אחרי אישור אדריכלית)
1. הוספת שכבת העדפות עשירה (Trading/Notifications/UI).
2. מימוש דרך טבלת העדפות ייעודית או JSONB תחת משתמש — לפי החלטת אדריכלית.
3. הוספת endpoints ייעודיים לעדפות (לא `/users/me`) אם נבחרת שכבה ייעודית.

---

## 5) פערים/תיקונים נדרשים לפני מימוש

| ID | פער | חומרה | תיקון נדרש |
|----|-----|-------|------------|
| D39-FIX-001 | `data-entity="cash_flow"` בעמוד preferences | Medium | ליישר ל-`preferences` |
| D39-FIX-002 | Comment ב-PageConfig מציין `entity: note` | Low | ליישר ל-`preferences` |
| D39-FIX-003 | אין חוזה API ייעודי לעדפות עשירות | Medium | להחליט אם MVP בלבד או כולל V2 |
| D39-FIX-004 | אין מודל/DDL פעיל ל-`user_data.preferences` | High (ל-V2) | החלטת Data Model + מיגרציה אם נדרש |

---

## 6) החלטות נדרשות מהאדריכלית (Blocking)

| # | החלטה | אפשרויות |
|---|--------|-----------|
| D39-DEC-001 | Data Model לעדפות משתמש עשירות | A) MVP בלבד דרך `users` (language/timezone) \| B) טבלת `user_data.preferences` \| C) JSONB תחת `users.metadata` |
| D39-DEC-002 | חלוקת גבולות D39 vs D15.V | A) D39 רק העדפות עבודה \| B) גם פרטי פרופיל (לא מומלץ) |
| D39-DEC-003 | שכבת התראות אישיות | A) מתוך D39 (notification preferences) \| B) עמוד נפרד בעתיד |
| D39-DEC-004 | סדר ביצוע | A) Notes -> Alerts -> Preferences \| B) Preferences לפני Alerts |

---

## 7) המלצת Team 90

1. לאשר **MVP מיידי** ל-D39 על בסיס `language/timezone` דרך `/users/me`.
2. לנעול ש-D39 הוא **User-only preferences** ולא System settings.
3. להחליט בנפרד על V2 (טבלת העדפות/JSONB) לפני הרחבת הסקופ.
4. לא לפתוח מימוש V2 ללא החלטות D39-DEC-001..003.

---

## 8) תוצרי המשך אחרי אישור

- Team 10: תוכנית Mini-task ל-D39 עם Gate chain (A/B/KP).
- Team 20: חוזה API + (אם נדרש) DDL/migration proposal.
- Team 30: יישור תבנית + טופס + wire ל-`/users/me`.
- Team 50: QA תרחישי save/reload/auth/validation.
- Team 90: Gate-B verification.

---

**log_entry | TEAM_90 | D39_USER_PREFERENCES_SPEC_SUBMITTED_TO_ARCHITECT | 2026-02-15**
