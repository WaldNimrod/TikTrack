# ✅ הודעה: צוות 10 → צוות 20 (Password Change Flow - Architectural Decision)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** PASSWORD_CHANGE_FLOW_APPROVED | Status: ✅ APPROVED  
**Priority:** ✅ **ARCHITECTURAL_DECISION**

---

## ✅ הודעה חשובה

**החלטה אדריכלית רשמית: Password Change Flow מאושר!**

האדריכלית הראשית אישרה את ההצעה שלכם.  
**המבנה המוצע עומד בסטנדרטים של LOD 400 ומכבד את ה-Transformation Layer.**

---

## 🏰 החלטה אדריכלית

**Endpoint:** `PUT /users/me/password` ✅ **APPROVED**

**Payload Structure:**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**שימוש ב-snake_case בלבד** (תואם ל-API Layer)

---

## 🟢 הנחיות לביצוע - צוות 20 (Backend)

### **1. Endpoint Implementation**

**Endpoint:** `PUT /users/me/password`

**Route:** `api/routers/users.py` (או `api/routers/auth.py` - לפי הארגון שלכם)

**Method:** `PUT`

**Path:** `/users/me/password`

---

### **2. Payload Structure**

**Request Schema:**
```python
class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
```

**שימוש ב-snake_case בלבד** - תואם ל-API Layer

---

### **3. Security Guard** 🔒

**חובה לאמת את ה-old_password לפני ביצוע השינוי:**

```python
# Pseudo-code
def change_password(user_id, old_password, new_password):
    # 1. Get user from database
    user = get_user(user_id)
    
    # 2. Verify old_password
    if not verify_password(old_password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"  # Generic message (no user enumeration)
        )
    
    # 3. Hash new password
    new_password_hash = hash_password(new_password)
    
    # 4. Update user password
    user.password_hash = new_password_hash
    db.commit()
    
    return {"message": "Password changed successfully"}
```

**Error Response:**
- **Status Code:** `401 Unauthorized`
- **Message:** הודעה גנרית (לא לחשוף אם המשתמש קיים או לא)

---

### **4. Rate Limiting** ⚠️

**חובה להחיל Rate Limiting מחמירה:**

- **מטרה:** למנוע Brute-force על סיסמאות קיימות
- **המלצה:** 5 ניסיונות לכל 15 דקות לכל user
- **Implementation:** השתמשו ב-FastAPI rate limiting middleware

**Example:**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.put("/users/me/password")
@limiter.limit("5/15minutes")
async def change_password(...):
    ...
```

---

### **5. Response Schema**

**Success Response:**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid password"
}
```

---

## 📋 Checklist לביצוע

- [ ] Endpoint `PUT /users/me/password` מיושם
- [ ] Request Schema מוגדר (`old_password`, `new_password`)
- [ ] Security Guard מיושם (אימות old_password)
- [ ] Error handling (401 עם הודעה גנרית)
- [ ] Rate Limiting מיושם (5 ניסיונות / 15 דקות)
- [ ] Password hashing (bcrypt)
- [ ] OpenAPI Spec מעודכן
- [ ] Tests כתובים

---

## 📝 OpenAPI Spec Update

**חובה לעדכן את OpenAPI Spec:**

```yaml
/users/me/password:
  put:
    summary: Change user password
    tags:
      - Users
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - old_password
              - new_password
            properties:
              old_password:
                type: string
                format: password
              new_password:
                type: string
                format: password
    responses:
      '200':
        description: Password changed successfully
      '401':
        description: Invalid password
      '429':
        description: Rate limit exceeded
```

---

## 📡 דיווח נדרש

**לאחר המימוש, שלחו:**

```text
From: Team 20
To: Team 10 (The Gateway)
Subject: Password Change Endpoint Implemented
Status: COMPLETED
Endpoint: PUT /users/me/password
Features: Security guard, Rate limiting, Error handling
OpenAPI Spec: Updated
Tests: Written
log_entry | [Team 20] | PASSWORD_CHANGE_IMPLEMENTED | ENDPOINT | GREEN
```

---

## ✅ Sign-off

**Architectural Decision:** ✅ **APPROVED**  
**Endpoint:** `PUT /users/me/password`  
**Status:** ✅ **READY FOR IMPLEMENTATION**

---

**Team 10 (The Gateway)**  
**Status:** ✅ **ARCHITECTURAL_DECISION_DELIVERED**

---

**log_entry | Team 10 | PASSWORD_CHANGE_APPROVED | TO_TEAM_20 | GREEN | 2026-01-31**
