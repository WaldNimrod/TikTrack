# ⚠️ הודעה: צוות 10 → צוות 20 + צוות 30 (Password Change Flow Clarification)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend) + Team 30 (Frontend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** PASSWORD_CHANGE_FLOW_CLARIFICATION | Status: ⚠️ CLARIFICATION_NEEDED  
**Priority:** ⚠️ **CLARIFICATION_REQUIRED**

---

## ⚠️ הודעה חשובה

**נדרשת הבהרה: Password Change Flow**

Team 50 (QA) זיהה שצריך להגדיר את ה-Password Change flow לפני Integration Testing.

---

## 📋 הבעיה

**Issue:** Password Change Flow לא מוגדר בבירור

**מה נדרש:**
- הגדרת Password Change flow משותפת
- החלטה: endpoint נפרד או חלק מ-`/users/me` PUT

---

## 🎯 אפשרויות

### **Option 1: Endpoint נפרד**
```
PUT /auth/change-password
Body: {
  "old_password": "string",
  "new_password": "string"
}
```

**יתרונות:**
- הפרדה ברורה של אחריות
- קל יותר לאבטחה (rate limiting, etc.)
- תואם ל-REST best practices

**חסרונות:**
- endpoint נוסף לניהול

---

### **Option 2: חלק מ-`/users/me` PUT**
```
PUT /users/me
Body: {
  "old_password": "string",
  "new_password": "string",
  // ... other fields
}
```

**יתרונות:**
- endpoint אחד לניהול פרופיל
- פחות endpoints

**חסרונות:**
- ערבוב אחריות (profile update + password change)
- קשה יותר לאבטחה (rate limiting, etc.)

---

## 📋 מה נדרש מכם

### **לצוות 20 (Backend) + צוות 30 (Frontend):**

**נדרש:**
1. **החלטה משותפת:**
   - איזה option לבחור (Option 1 או Option 2)
   - או הצעה אחרת

2. **הגדרת Flow:**
   - Endpoint (אם Option 1)
   - Schema (request/response)
   - Error handling
   - Security (rate limiting, validation)

3. **תיאום:**
   - Backend: מימוש ה-endpoint
   - Frontend: מימוש ה-form/handler

---

## ⏰ דחיפות

**Priority:** ⚠️ **CLARIFICATION_REQUIRED**

**למה זה חשוב:**
- Team 50 לא יכול להמשיך עם Integration Testing בלי זה
- זה חלק מה-User Management Flow (Task 50.2.2)
- צריך להחליט לפני הרצת הבדיקות

---

## 📡 תגובה נדרשת

**פורמט תגובה:**
```text
From: Team 20 + Team 30
To: Team 10 (The Gateway)
Subject: Password Change Flow Decision
Decision: [Option 1 / Option 2 / Other]
Rationale: [why this option]
Implementation Plan: [how to implement]
log_entry | [Team 20/30] | PASSWORD_CHANGE_DECISION | CLARIFICATION | GREEN
```

---

## ✅ Sign-off

**Status:** ⚠️ **CLARIFICATION_REQUIRED**  
**Next:** Awaiting decision from Team 20 + Team 30

---

**Team 10 (The Gateway)**  
**Status:** ⚠️ **AWAITING_CLARIFICATION**

---

**log_entry | Team 10 | PASSWORD_CHANGE_CLARIFICATION | TO_TEAM_20_TEAM_30 | CLARIFICATION | 2026-01-31**
