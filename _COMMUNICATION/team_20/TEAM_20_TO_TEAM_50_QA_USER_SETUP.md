# ✅ QA User Setup Guide - TikTrackAdmin

**id:** `TEAM_20_TO_TEAM_50_QA_USER_SETUP`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 50 (QA) + Team 60 (DevOps)  
**תאריך:** 2026-02-07  
**Session:** Gate B - Runtime Fix  
**Subject:** QA_USER_SETUP | Status: ✅ **GUIDE READY**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 🎯 Objective

**להבטיח שמשתמש QA קיים ב-DB עם credentials נכונים:**

- Username: `TikTrackAdmin`
- Password: `4181`

---

## ✅ Auth Login Endpoint - Verified

**Endpoint:** `POST /api/v1/auth/login`

**Response Schema:** מחזיר `access_token` ב-response body:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_at": "2026-02-01T12:00:00Z",
  "user": { ... }
}
```

**קוד מאומת:**
- ✅ Schema: `api/schemas/identity.py` - שורה 44: `access_token: str`
- ✅ Service: `api/services/auth.py` - שורה 376: מחזיר `access_token`
- ✅ Router: `api/routers/auth.py` - שורה 293: מחזיר response עם `access_token`

---

## 🔧 QA User Setup Options

### **Option 1: יצירת משתמש דרך API (מומלץ)**

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```bash
curl -X POST http://localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TikTrackAdmin",
    "email": "tiktrackadmin@test.com",
    "password": "4181"
  }'
```

**Response:** מחזיר `access_token` - ניתן להשתמש בו מיד.

---

### **Option 2: יצירת משתמש דרך DB Script**

**אם צריך ליצור משתמש ישירות ב-DB:**

```sql
-- 1. Hash password "4181" (צריך להשתמש ב-bcrypt)
-- 2. Insert user
INSERT INTO user_data.users (
  id,
  username,
  email,
  password_hash,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TikTrackAdmin',
  'tiktrackadmin@test.com',
  '$2b$12$...', -- bcrypt hash של "4181"
  true,
  NOW(),
  NOW()
);
```

**⚠️ חשוב:** צריך ליצור את ה-password hash עם bcrypt לפני ה-insert.

---

### **Option 3: בדיקה שהמשתמש קיים**

**Query לבדיקה:**
```sql
SELECT id, username, email, is_active, created_at 
FROM user_data.users 
WHERE username = 'TikTrackAdmin';
```

**אם המשתמש קיים אבל ה-password לא עובד:**
- יש לאפס את ה-password דרך password reset flow
- או ליצור משתמש חדש

---

## 🧪 Testing Login Endpoint

### **Manual Test:**
```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"TikTrackAdmin","password":"4181"}'
```

**Expected Response (HTTP 200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_at": "2026-02-01T12:00:00Z",
  "user": {
    "external_ulids": "...",
    "email": "tiktrackadmin@test.com",
    ...
  }
}
```

**אם מחזיר 401:**
- המשתמש לא קיים, או
- ה-password hash לא תואם

---

## 📋 Checklist

- [ ] **בדוק שהמשתמש קיים:**
  ```sql
  SELECT * FROM user_data.users WHERE username = 'TikTrackAdmin';
  ```

- [ ] **אם לא קיים - צור משתמש:**
  - דרך API: `POST /api/v1/auth/register`
  - או דרך DB script (עם bcrypt hash)

- [ ] **בדוק login:**
  ```bash
  curl -X POST http://localhost:8082/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username_or_email":"TikTrackAdmin","password":"4181"}'
  ```

- [ ] **אם login עובד - הרץ runtime tests:**
  ```bash
  npm run test:phase2
  ```

---

## 🔗 Related Files

### **Backend Code:**
- `api/routers/auth.py` - שורה 189: Login endpoint
- `api/services/auth.py` - שורה 269: Login service
- `api/schemas/identity.py` - שורה 42: LoginResponse schema

### **Test Files:**
- `tests/phase2-runtime.test.js` - שורה 16: TEST_USER
- `tests/selenium-config.js` - שורות 24-25: QA credentials

---

## 🎯 Summary

**Auth Login Endpoint מאומת - מחזיר `access_token`.**

**הבעיה כנראה:**
- המשתמש `TikTrackAdmin` לא קיים ב-DB, או
- ה-password hash לא תואם ל-"4181"

**פתרון:**
- צור משתמש דרך API (`POST /api/v1/auth/register`)
- או צור משתמש דרך DB script (עם bcrypt hash)

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-07  
**Session:** Gate B - Runtime Fix  
**Status:** ✅ **GUIDE READY**

**log_entry | [Team 20] | GATE_B | QA_USER_SETUP_GUIDE | READY | 2026-02-07**
