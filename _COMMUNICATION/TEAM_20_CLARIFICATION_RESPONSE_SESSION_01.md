# ✅ תגובה לבקשת הבהרה: צוות 20 | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Subject:** CLARIFICATION RESPONSE | Questions 1 & 2  
**Status:** ✅ **PARTIALLY RESOLVED**

---

## ✅ שאלה 1: אסטרטגיית מזהים (UUID vs ULID) - **נפתרה**

**תשובה:** יש תשובה ברורה וחד משמעית בתיעוד.

### מקור התשובה:
**מסמך:** `documentation/06-GOVERNANCE_&_COMPLIANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md`

### התשובה:
```
## 1. זהות (Identity)
* **Internal:** UUID v4.
* **External (API):** ULID Strings.
```

### פרשנות והנחיות:
1. **ב-DB:** משתמשים ב-UUID v4 כ-Primary Key (כפי שמוגדר ב-`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`)
2. **ב-API:** כל ה-responses חייבים להחזיר ULID במקום UUID
3. **Conversion Layer:** יש ליצור conversion layer שיהמיר UUID → ULID ב-responses

### יישום מעשי:
- **SQLAlchemy Models:** שדה `id` יהיה UUID (כפי שמוגדר ב-DB)
- **Pydantic Schemas:** שדה `external_ulids` יהיה ULID string
- **Conversion:** ב-Service layer, לפני החזרת response, יש להמיר `model.id` (UUID) → `response.external_ulids` (ULID)

### דוגמה:
```python
# Model (DB)
user = User(id=UUID("..."), email="...")

# Response (API)
response = UserResponse(
    external_ulids=uuid_to_ulid(user.id),  # Conversion!
    email=user.email
)
```

### משימות שכעת יכולות להתקדם:
- ✅ **Task 20.1.2:** Models - יכול להתחיל (UUID ב-DB)
- ✅ **Task 20.1.3:** Schemas - יכול להתחיל (ULID ב-responses)

---

## ⚠️ שאלה 2: מבנה JWT Payload - **נפתרה חלקית**

**תשובה:** יש תשובה חלקית בתיעוד, אך חסר מידע על refresh token mechanism.

### מקור התשובה:
**מסמך:** `documentation/06-GOVERNANCE_&_COMPLIANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md`

### התשובה הקיימת:
```
## 2. אבטחה
* **JWT:** sub (ULID), email, role, exp (24h).
```

### מה יש לנו:
1. **Claims:**
   - `sub` (subject) - ULID של המשתמש (לא UUID!)
   - `email` - כתובת אימייל
   - `role` - תפקיד המשתמש
   - `exp` - expiration time (24 שעות)

2. **Expiration:** 24 שעות

### מה חסר:
- ❌ **Refresh Token Mechanism:** לא מוגדר בתיעוד
- ❌ **Refresh Token Storage:** לא מוגדר (DB? Redis? Cookie?)
- ❌ **Refresh Token Expiration:** לא מוגדר

### יישום מעשי (על בסיס מה שיש):
```python
# JWT Payload Structure
payload = {
    "sub": user_ulid,  # ULID, not UUID!
    "email": user.email,
    "role": user.role,
    "exp": datetime.utcnow() + timedelta(hours=24)
}
```

### משימות שכעת יכולות להתקדם (חלקית):
- ✅ **Task 20.1.5:** AuthService - יכול להתחיל עם access token (24h expiration)
- ⚠️ **Refresh Token:** ממתין להחלטה אדריכלית

---

## 📡 פעולה נדרשת

### שאלה 1: ✅ **פתורה - ניתן להתחיל**
המשיכו עם משימות 20.1.2 ו-20.1.3.

### שאלה 2: ⚠️ **חלקית פתורה - ניתן להתחיל עם access token**
המשיכו עם משימה 20.1.5, אך השאירו מקום ל-refresh token mechanism (אם יוחלט בעתיד).

**הערה:** נשלחה הודעה לצוות האדריכל (Team 00 / Gemini Bridge) לקבלת החלטה על refresh token mechanism.

---

## 📋 סיכום

| שאלה | סטטוס | פעולה |
|------|-------|-------|
| Q1: UUID vs ULID | ✅ **פתורה** | התחילו עם Tasks 20.1.2, 20.1.3 |
| Q2: JWT Claims | ✅ **פתורה** | התחילו עם Task 20.1.5 (access token) |
| Q2: Refresh Token | ⚠️ **ממתין** | ממתין להחלטה אדריכלית |

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ✅ **CLARIFICATIONS PROVIDED**  
**Next:** Awaiting task progress reports
