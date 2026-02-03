# 📡 הודעה: צוות 10 → Team 20 (Batch 1 Closure - Backend Mandate)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend Implementation)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** BATCH_1_CLOSURE_BACKEND_MANDATE | Status: 🛡️ **MANDATORY**  
**Priority:** 🔴 **CRITICAL**

---

## 📢 פסיקת האדריכל: צוות 20 - "מקור האמת"

חבילה 1 (Identity & Auth) מאושרת רשמית כבלופרינט המחייב של המערכת.

להלן ההנחיות הספציפיות לצוות 20:

---

## 🎯 תפקיד: "מקור האמת"

**האדריכלית הגדירה את צוות 20 כ"מקור האמת"** - ה-API הוא החוזה, לא המלצה.

---

## 🚨 חוקי ברזל

### **1. חוזי נתונים (`snake_case`)**

**חוק ברזל:**
- 🚨 **כל ה-Payloads חייבים להיות ב-`snake_case`**
- 🚨 **אין סטיות מהתקן הזה**

**דוגמאות:**
```json
// ✅ נכון
{
  "user_id": "123",
  "is_email_verified": true,
  "created_at": "2026-02-02T10:00:00Z"
}

// ❌ שגוי
{
  "userId": "123",
  "isEmailVerified": true,
  "createdAt": "2026-02-02T10:00:00Z"
}
```

**פעולות נדרשות:**
- ✅ בדיקת כל ה-Payloads ב-Network (DevTools)
- ✅ הקפדה על `snake_case` בכל ה-API responses
- ✅ הקפדה על `snake_case` בכל ה-API requests

---

### **2. קודי שגיאה יציבים**

**חוק ברזל:**
- 🚨 **קודי שגיאה חייבים להיות יציבים ולא משתנים**
- 🚨 **אין לשנות קודי שגיאה קיימים**

**דוגמאות:**
```json
// ✅ נכון - קוד שגיאה יציב
{
  "error_code": "AUTH_INVALID_CREDENTIALS",
  "detail": "Invalid username or password"
}

// ❌ שגוי - קוד שגיאה משתנה
{
  "error_code": "INVALID_CREDENTIALS", // שונה מ-AUTH_INVALID_CREDENTIALS
  "detail": "Invalid username or password"
}
```

**פעולות נדרשות:**
- ✅ רשימת קודי שגיאה יציבה ומתועדת
- ✅ אי-שינוי קודי שגיאה קיימים
- ✅ תיעוד כל קוד שגיאה חדש

---

### **3. ה-API הוא החוזה**

**חוק ברזל:**
- 🚨 **ה-API הוא החוזה, לא המלצה**
- 🚨 **אין שינויים ללא תיאום**

**פעולות נדרשות:**
- ✅ כל שינוי ב-API חייב להיות מתועד
- ✅ כל שינוי ב-API חייב להיות מתואם עם Frontend
- ✅ ה-API הוא החוזה - אין שינויים ללא תיאום

---

## 📋 פעולות נדרשות מיידיות

### **1. בדיקת `snake_case`**
- [ ] בדיקת כל ה-Payloads ב-Network (DevTools)
- [ ] הקפדה על `snake_case` בכל ה-API responses
- [ ] הקפדה על `snake_case` בכל ה-API requests

### **2. בדיקת קודי שגיאה**
- [ ] רשימת קודי שגיאה יציבה ומתועדת
- [ ] אי-שינוי קודי שגיאה קיימים
- [ ] תיעוד כל קוד שגיאה חדש

### **3. תיעוד API**
- [ ] כל שינוי ב-API מתועד
- [ ] כל שינוי ב-API מתואם עם Frontend
- [ ] ה-API הוא החוזה - אין שינויים ללא תיאום

---

## 🔗 קבצים רלוונטיים

- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BATCH_1_FINAL_SUMMARY.md` - הודעה מלאה מהאדריכלית
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` - ספר החוקים המאסטר (עודכן)
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` - מטריצת עמודים (Batch 1 Complete)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02  
**Status:** 🛡️ **MANDATORY - FOUNDATION SEAL**

**log_entry | [Team 10] | BATCH_1_CLOSURE | TO_TEAM_20 | GREEN | 2026-02-02**
