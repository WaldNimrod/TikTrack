# 📡 הודעה: צוות 10 → צוות 60 (Password Change Endpoint - Proxy Update)

**From:** Team 10 (The Gateway)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** PASSWORD_CHANGE_ENDPOINT_PROXY | Status: ⚠️ UPDATE_REQUIRED  
**Priority:** ⚠️ **INFRASTRUCTURE_UPDATE**

---

## ⚠️ הודעה חשובה

**Endpoint חדש נוסף - נדרש עדכון Proxy!**

האדריכלית הראשית אישרה endpoint חדש: `PUT /users/me/password`  
**צריך לוודא שה-Proxy ב-Vite מוגדר נכון.**

---

## 🏰 החלטה אדריכלית

**Endpoint:** `PUT /users/me/password` ✅ **APPROVED**

**Method:** `PUT`

**Path:** `/users/me/password`

**Backend:** `http://localhost:8082/api/v1/users/me/password`

---

## 📡 עדכון נדרש - צוות 60 (DevOps)

### **1. Vite Proxy Configuration**

**File:** `ui/vite.config.js`

**Current Configuration:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    secure: false,
  },
}
```

**Status:** ✅ **Already configured correctly**

**הסבר:**
- ה-Proxy מוגדר ל-`/api` → `http://localhost:8082`
- ה-endpoint החדש הוא `/api/v1/users/me/password`
- זה יעבור דרך ה-Proxy הקיים ללא שינוי

---

### **2. Verification**

**ודאו שה-Proxy עובד:**

```bash
# Test proxy
curl -X PUT http://localhost:8080/api/v1/users/me/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"old_password":"test","new_password":"test123"}'
```

**Expected:** Request should be proxied to `http://localhost:8082/api/v1/users/me/password`

---

### **3. Environment Variables**

**File:** `ui/.env.development`

**Current Configuration:**
```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
```

**Status:** ✅ **Already configured correctly**

**הסבר:**
- ה-API Base URL מוגדר נכון
- ה-endpoint החדש יעבור דרך זה

---

## 📋 Checklist לבדיקה

- [ ] Vite proxy configuration correct (`/api` → `http://localhost:8082`)
- [ ] Environment variables correct (`VITE_API_BASE_URL=http://localhost:8082/api/v1`)
- [ ] Proxy test successful (curl test)
- [ ] Frontend can call `/api/v1/users/me/password`

---

## 📡 דיווח נדרש

**לאחר הבדיקה, שלחו:**

```text
From: Team 60
To: Team 10 (The Gateway)
Subject: Password Change Endpoint Proxy Verified
Status: VERIFIED
Proxy: Working correctly
Environment Variables: Correct
Test: Successful
log_entry | [Team 60] | PASSWORD_CHANGE_PROXY_VERIFIED | INFRASTRUCTURE | GREEN
```

---

## ✅ Sign-off

**Infrastructure Update:** ⚠️ **VERIFICATION_REQUIRED**  
**Status:** ✅ **NO_CHANGES_NEEDED** (Proxy already configured correctly)

---

**Team 10 (The Gateway)**  
**Status:** ⚠️ **VERIFICATION_REQUESTED**

---

**log_entry | Team 10 | PASSWORD_CHANGE_ENDPOINT | TO_TEAM_60 | VERIFICATION | 2026-01-31**
