# 📋 Team 30: Register Payload Spec — פורמט ה־request להרשמה

**מאת:** Team 30 (Frontend)  
**תאריך:** 2026-01-30  
**סטטוס:** תיעוד SSOT  
**מקור:** `TEAM_10_TO_TEAM_30_422_DOCUMENTATION_AND_HANDOFF_TO_20.md`

---

## 1. שדות (API — snake_case)

| שדה | חובה | טיפוס | אילוצים | הערות |
|-----|------|-------|---------|--------|
| `username` | ✅ | string | min 3, max 50 | נדחס (trim) לפני שליחה |
| `email` | ✅ | string | EmailStr (Backend) | נדחס לפני שליחה |
| `password` | ✅ | string | min 8 (Backend) | לא נדחס — נשלח כמו שהוא |
| `phone_number` | ❌ | string | E.164: `^\+?[1-9]\d{1,14}$` | אופציונלי; נשלח רק אם מוזן |

---

## 2. המרת שמות (Frontend → API)

הפרונטאנד שולח **camelCase**; `reactToApi` ממיר אוטומטית ל־**snake_case**:

| Frontend (camelCase) | API (snake_case) |
|---------------------|------------------|
| username            | username         |
| email               | email            |
| password            | password         |
| phoneNumber         | phone_number     |

---

## 3. דוגמת JSON (לאחר המרה ל־snake_case)

### ללא טלפון:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

### עם טלפון (אופציונלי):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123",
  "phone_number": "+972501234567"
}
```

---

## 4. מקור בקוד

| רכיב | קובץ |
|------|------|
| בניית userData | `ui/src/cubes/identity/components/auth/RegisterForm.jsx` (שורות 141–149) |
| המרה + שליחה | `ui/src/cubes/identity/services/auth.js` (`register()`, שורות 151–160) |
| reactToApi | `ui/src/cubes/shared/utils/transformers.js` |

---

## 5. טלפון — נרמול ל־E.164 (תוקן)

**TEAM_10_PHONE_VALIDATION_DECISION:** ולידציה ונרמול של טלפון מטופלים בצד Frontend.

- הפרונטאנד משתמש ב־`validatePhoneNumber().normalized` לפני שליחה ל־API.
- דוגמה: `050-1234567` → `+972501234567`.

---

**Team 30 (Frontend)**  
**log_entry | REGISTER_PAYLOAD_SPEC | UPDATED | 2026-02-10**
