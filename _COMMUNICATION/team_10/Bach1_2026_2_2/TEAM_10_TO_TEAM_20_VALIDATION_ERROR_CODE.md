# 📡 הודעה: Team 10 → Team 20 (Validation Error Code)

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** VALIDATION_ERROR_CODE_UPDATE | Status: 🔴 **P0 MANDATORY**  
**Priority:** 🔴 **CRITICAL - ARCHITECTURAL MANDATE**

---

## 📋 Executive Summary

**החלטה אדריכלית:** מודל ולידציה היברידי (v1.2)  
**מקור:** `ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`  
**סטטוס:** ✅ **MANDATORY - APPROVED BY ARCHITECT**

---

## 🎯 המשימה

**להוסיף שדה אופציונלי `error_code` לכל תגובת שגיאה.**

---

## 📋 פעולות נדרשות

### **1. עדכון OpenAPI Spec** 🔴 **P0**

**מיקום:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

**פעולה:** להוסיף שדה אופציונלי `error_code` ל-ErrorResponse Schema

**לפני:**
```yaml
ErrorResponse:
  type: object
  properties:
    detail:
      type: string
      description: "Error message"
      example: "Invalid credentials"
```

**אחרי:**
```yaml
ErrorResponse:
  type: object
  properties:
    detail:
      type: string
      description: "Error message (for Pydantic errors)"
      example: "Invalid credentials"
    error_code:
      type: string
      description: "Error code (optional, for Contract-First)"
      example: "AUTH_INVALID_CREDENTIALS"
      nullable: true
```

---

### **2. עדכון Backend Implementation** 🔴 **P0**

**פעולה:** להוסיף תמיכה ב-`error_code` בכל תגובות שגיאה

**דוגמה - Error Response:**
```python
# Backend error response
{
    "detail": "Invalid credentials",  # Keep for Pydantic compatibility
    "error_code": "AUTH_INVALID_CREDENTIALS"  # New optional field
}
```

**דוגמה - Pydantic Validation Errors:**
```python
# Array of validation errors
{
    "detail": [
        {
            "loc": ["body", "email"],
            "msg": "field required",
            "type": "value_error.missing",
            "error_code": "VALIDATION_FIELD_REQUIRED"  # Optional
        },
        {
            "loc": ["body", "phone_number"],
            "msg": "invalid phone format",
            "type": "value_error",
            "error_code": "VALIDATION_INVALID_PHONE"  # Optional
        }
    ]
}
```

---

### **3. Error Codes מומלצים** 🟡 **P1**

**רשימה ראשונית של Error Codes:**

#### **Authentication Errors:**
- `AUTH_INVALID_CREDENTIALS` - שם משתמש או סיסמה שגויים
- `AUTH_TOKEN_EXPIRED` - פג תוקף ההתחברות
- `AUTH_UNAUTHORIZED` - אין הרשאה
- `AUTH_RATE_LIMIT_EXCEEDED` - חריגה ממגבלת ניסיונות

#### **Validation Errors:**
- `VALIDATION_FIELD_REQUIRED` - שדה חובה
- `VALIDATION_INVALID_EMAIL` - אימייל לא תקין
- `VALIDATION_INVALID_PHONE` - מספר טלפון לא תקין
- `VALIDATION_INVALID_FORMAT` - פורמט לא תקין

#### **User Errors:**
- `USER_NOT_FOUND` - משתמש לא נמצא
- `USER_ALREADY_EXISTS` - משתמש כבר קיים
- `USER_UPDATE_FAILED` - עדכון המשתמש נכשל

#### **Generic Errors:**
- `SERVER_ERROR` - שגיאת שרת פנימית
- `NETWORK_ERROR` - שגיאת רשת
- `UNKNOWN_ERROR` - שגיאה בלתי צפויה

---

## 📋 Checklist

- [ ] עדכון OpenAPI Spec - הוספת `error_code` ל-ErrorResponse
- [ ] עדכון Backend - הוספת תמיכה ב-`error_code` בכל תגובות שגיאה
- [ ] בדיקות - וידוא שכל שגיאות מחזירות `error_code` (אופציונלי)
- [ ] עדכון תיעוד - תיעוד Error Codes החדשים

---

## ⚠️ הערות חשובות

1. **שדה אופציונלי:** `error_code` הוא שדה אופציונלי - לא צריך לשבור את הקוד הקיים
2. **תאימות לאחור:** שדה `detail` נשאר (לתאימות עם Pydantic)
3. **עדיפות:** Frontend ייתן עדיפות ל-`error_code`, אבל אם לא קיים ישתמש ב-`detail`

---

## 🔗 מסמכים רלוונטיים

1. **החלטה אדריכלית:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`
2. **תוכנית מימוש:** `_COMMUNICATION/team_10/TEAM_10_VALIDATION_HYBRID_IMPLEMENTATION_PLAN.md`
3. **OpenAPI Spec:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**log_entry | Team 10 | VALIDATION_ERROR_CODE | TO_TEAM_20 | 2026-02-01**

**Status:** 🔴 **P0 MANDATORY - AWAITING TEAM 20 IMPLEMENTATION**
