# 🛑 מנדט דחוף: PDSC Boundary Contract - חובה קריטית

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - BLOCKING - CRITICAL**  
**עדיפות:** 🔴 **P0 - IMMEDIATE**

---

## 🎯 Executive Summary

**דוח Team 90 זיהה חסם קריטי: PDSC Boundary Contract חסר.**

**דרישה:** יצירת 3 מסמכי חוזה מחייבים:
1. JSON Error Schema Definition
2. Response Contract (Success + Error formats)
3. Shared Boundary Contract (לאחר סשן חירום עם Team 30)

**סטטוס:** 🟥 **RED - Gate לא ניתן לאישור ללא חוזה גבול**

---

## 🔴 חסם קריטי: PDSC Boundary Contract חסר

### **הבעיה:**

חסר חוזה גבול רשמי בין PDSC ↔ Frontend (Interface Definition מחייב לסריקה אוטומטית).

**ראיות:**
- לא נמצאו הקבצים:
  - `TEAM_20_PDSC_ERROR_SCHEMA.md`
  - `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
  - `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`

**השפעה:**
- לא ניתן לבדוק תאימות בין PDSC ל-EFR/UAI
- לא ניתן לבצע ולידציה אוטומטית
- Gate לא ניתן לאישור

---

## 📋 משימות נדרשות

### **1. JSON Error Schema Definition** 🔴 **CRITICAL**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_SCHEMA.md`

**תוכן נדרש:**
- JSON Schema Definition מפורט (לא רק Pydantic)
- כל ה-Error Codes מפורטים
- Error Response Schema מלא
- דוגמאות לכל סוג שגיאה

**דוגמה:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PDSC Error Response",
  "type": "object",
  "required": ["success", "error"],
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "object",
      "required": ["code", "message", "status_code", "timestamp"],
      "properties": {
        "code": {
          "type": "string",
          "pattern": "^[A-Z_]+$"
        },
        "message": {
          "type": "string"
        },
        "status_code": {
          "type": "integer",
          "minimum": 400,
          "maximum": 599
        }
      }
    }
  }
}
```

**Timeline:** 12 שעות

---

### **2. Response Contract (Success + Error)** 🔴 **CRITICAL**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_PDSC_RESPONSE_CONTRACT.md`

**תוכן נדרש:**
- Success Response Format מפורט
- Error Response Format מפורט
- דוגמאות לכל סוג response
- Integration עם Frontend

**דוגמה:**
```json
// Success Response:
{
  "success": true,
  "data": { /* ... */ },
  "meta": {
    "timestamp": "2026-02-07T10:30:00Z",
    "request_id": "req_01ARZ3NDEKTSV4RRFFQ69G5FAV"
  }
}

// Error Response:
{
  "success": false,
  "error": {
    "code": "FINANCIAL_BROKERS_FEES_NOT_FOUND",
    "message": "Brokers fees not found",
    "status_code": 404,
    "details": { /* ... */ }
  }
}
```

**Timeline:** 12 שעות

---

### **3. Shared Boundary Contract** 🔴 **CRITICAL**

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`

**תוכן נדרש:**
- Boundary Definition מפורט (Server = Source of Truth, Client = Implementation)
- Error Schema (Server responsibility)
- Response Contract (Server responsibility)
- Fetching (Client responsibility)
- Transformers (Client responsibility)
- Error Handling (Client responsibility)

**דרישה:** סשן חירום עם Team 30 לפני יצירת המסמך

**Timeline:** 24 שעות (כולל סשן חירום)

---

## 🔄 סשן חירום עם Team 30

**דרישה:** סשן חירום בין Team 20 ל-Team 30 להגדרת Boundary Contract.

**נושאים לדיון:**
1. Error Schema - Server responsibility
2. Response Contract - Server responsibility
3. Fetching - Client responsibility
4. Transformers - Client responsibility
5. Error Handling - Client responsibility

**תוצאה נדרשת:**
- Shared Boundary Contract מוסכם
- הגדרת אחריות ברורה לכל צד
- Integration points מתועדים

**Timeline:** 8 שעות (סשן) + 16 שעות (יצירת מסמך)

---

## 📋 Checklist

### **JSON Error Schema:**
- [ ] יצירת `TEAM_20_PDSC_ERROR_SCHEMA.md`
- [ ] JSON Schema Definition מפורט
- [ ] כל ה-Error Codes מפורטים
- [ ] Error Response Schema מלא
- [ ] דוגמאות לכל סוג שגיאה

### **Response Contract:**
- [ ] יצירת `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- [ ] Success Response Format מפורט
- [ ] Error Response Format מפורט
- [ ] דוגמאות לכל סוג response
- [ ] Integration עם Frontend

### **Shared Boundary Contract:**
- [ ] תיאום סשן חירום עם Team 30
- [ ] ביצוע סשן חירום
- [ ] יצירת `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`
- [ ] Boundary Definition מפורט
- [ ] אחריות ברורה לכל צד
- [ ] Integration points מתועדים

---

## ⚠️ אזהרות קריטיות

1. **PDSC Boundary Contract הוא חסם קריטי** - Gate לא ניתן לאישור ללא חוזה גבול
2. **סשן חירום חובה** - לא ניתן ליצור Shared Contract ללא הסכמה משותפת
3. **JSON Schema Definition חובה** - לא רק Pydantic, גם JSON Schema

---

## 🎯 Timeline

**12 שעות:** JSON Error Schema  
**12 שעות:** Response Contract  
**24 שעות:** Shared Boundary Contract (כולל סשן חירום)

**סה"כ:** 48 שעות

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟥 **RED - CRITICAL FIXES REQUIRED**

**log_entry | [Team 10] | PDSC_BOUNDARY | CRITICAL_MANDATE | RED | 2026-02-07**
