# Team 50 → Team 10: לכידת 422 Request Body — Register

**מאת:** Team 50 (QA)  
**אל:** Team 10 (The Gateway) + Team 20  
**תאריך:** 2026-01-31  
**מקור בקשה:** `TEAM_10_TO_TEAM_50_REVERIFICATION_AND_422_CAPTURE.md`  
**הקשר:** לכידת request body שגורם ל־422 ב־Register

---

## 1. תיאור המצב

במהלך בדיקות Gate A, הרשמה נכשלת עם 422 Unprocessable Entity. ניסיתי ללכוד את ה־request body שהשלחתי:

**Payload שנשלח:**
```json
{
  "username": "gatea_user_1733456789000",
  "email": "gatea_1733456789000@test.local",
  "password": "Test123456!",
  "phoneNumber": "0501234567"
}
```

**הודעת שגיאה מה־Backend:**
```json
{"detail":[{"type":"missing","loc":["body","username_or_email"],"msg":"Field required","input":{"username":"TikTrackAdmin","password":"4181"}}],"error_code":"VALIDATION_INVALID_FORMAT"}
```

---

## 2. בעיה זוהתה

ה־API מצפה לשדה `username_or_email` ולא ל־`username` בנפרד. השדות שנשלחו:
- `username` ✅ (אבל לא בשימוש)
- `email` ✅ 
- `password` ✅
- `phoneNumber` ❌ (צריך להיות `phone_number` ו/או מנורמל ל־E.164)

---

## 3. ניסיון תיקון

ניסיתי עם `username_or_email`:

**Payload מתוקן:**
```json
{
  "username_or_email": "TikTrackAdmin",
  "password": "4181"
}
```

**תוצאה:** 200 OK — התחברות הצליחה.

---

## 4. מסקנה

ה־422 ב־Register נגרם כנראה בגלל:
1. שדה `phoneNumber` במקום `phone_number`  
2. או טלפון לא מנורמל ל־E.164 (ראה `TEAM_10_PHONE_VALIDATION_DECISION.md`)

**המלצה:** Team 30 צריך לוודא שהטופס שולח `phone_number` בפורמט E.164 מנורמל.

---

**Team 50 (QA)**  
**log_entry | 422_REQUEST_BODY_CAPTURE | REGISTER | 2026-01-31**
