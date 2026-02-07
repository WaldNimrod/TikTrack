# 📋 הגשת אפיון: PDSC Error Contract Specification

**id:** `TEAM_20_TO_TEAM_10_PDSC_SPECIFICATION_SUBMISSION`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-06  
**Session:** PDSC (Data Service Core) - Error Contract Specification  
**Subject:** PDSC_ERROR_CONTRACT_SPEC | Status: 🟡 **SPECIFICATION SUBMITTED**  
**Priority:** 🔴 **HIGH**

---

## ✅ Executive Summary

**Team 20 הגיש אפיון מפורט לחוזה שגיאות אחיד (Contract-First Error Handling) עבור PDSC.**

האפיון כולל:
- ניתוח המצב הנוכחי
- הגדרת חוזה Error Response אחיד
- ארכיטקטורה מוצעת (PDSC Service Layer)
- Error Codes מפורטים לקוביות פיננסיות
- מימוש מוצע (Pydantic schemas, Base Service, Financial Service)
- תהליך מעבר (Migration Plan)

---

## 📄 מסמך האפיון

**קובץ:** `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md`

### **תוכן המסמך:**

1. **ניתוח המצב הנוכחי:**
   - מבנה Error Handling קיים
   - בעיות זוהו (אי-אחידות, Error Codes לא מפורטים, אין Response Schema אחיד)

2. **מטרות החוזה החדש:**
   - Contract-First Error Handling
   - Error Codes מפורטים
   - Response Schema אחיד

3. **חוזה Error Response אחיד:**
   - Error Response Schema (JSON)
   - Success Response Schema (JSON)
   - דוגמאות מפורטות

4. **ארכיטקטורה מוצעת:**
   - PDSC Service Layer (Unified Interface)
   - Error Handling Flow
   - דיאגרמה של הארכיטקטורה

5. **Error Codes - קוביות פיננסיות:**
   - Trading Accounts errors
   - Cash Flows errors
   - Brokers Fees errors
   - Positions errors
   - Generic Financial errors

6. **מימוש מוצע:**
   - Error Response Schema (Pydantic)
   - PDSC Base Service
   - PDSC Financial Service
   - דוגמאות קוד

7. **תהליך מעבר:**
   - 4 שלבים מפורטים
   - Checklist לכל שלב

---

## 🎯 עקרונות מרכזיים

### **1. Frontend לא צריך לדעת מאיזה endpoint:**
- ✅ קריאה אחת ל-PDSC Service
- ✅ טיפול אחיד בשגיאות
- ✅ פחות קוד ב-Frontend

### **2. Error Handling אחיד:**
- ✅ כל השגיאות באותו פורמט
- ✅ קל לטפל בשגיאות ב-Frontend
- ✅ Error codes מפורטים ומבוססי קונטקסט

### **3. קל לתחזוקה:**
- ✅ שינוי ב-Service אחד משפיע על כל הקוביות
- ✅ קל להוסיף קוביות חדשות
- ✅ קל לבדוק ולנפות באגים

---

## 📋 שאלות פתוחות

1. **i18n:** האם נדרש תמיכה ב-i18n כבר עכשיו או בעתיד?
2. **Backward Compatibility:** האם לשמור על endpoints הקיימים?
3. **Request ID:** האם להשתמש ב-request ID מ-middleware או ליצור חדש?
4. **Metadata:** מה metadata נוסף נדרש ב-responses?

---

## 🔄 Next Steps

### **לאחר אישור האדריכלית:**

1. **שלב 1: הגדרת Infrastructure**
   - יצירת Error schemas
   - יצירת PDSC Base Service
   - הרחבת ErrorCodes

2. **שלב 2: מימוש PDSC Service**
   - מימוש Financial Service
   - אינטגרציה עם Services קיימים

3. **שלב 3: עדכון Routers**
   - עדכון לשימוש ב-PDSC Service
   - שמירה על backward compatibility

4. **שלב 4: עדכון Frontend**
   - עדכון לשימוש ב-PDSC Service
   - הסרת תלות ב-endpoints ספציפיים

---

## 📞 תקשורת

**לשאלות או הבהרות:**
- 📧 `_COMMUNICATION/team_20/`
- 📋 פורמט: `TEAM_20_TO_TEAM_10_PDSC_[SUBJECT].md`

---

## 🔗 קישורים רלוונטיים

- **מסמך האפיון:** `_COMMUNICATION/team_20/TEAM_20_PDSC_ERROR_CONTRACT_SPECIFICATION.md`
- **מקור הדרישה:** הודעת אדריכלית - PDSC (Data Service Core)

---

**Team 20 (Backend Implementation)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟡 **SPECIFICATION SUBMITTED - AWAITING ARCHITECT APPROVAL**

**log_entry | [Team 20] | PDSC | SPEC_SUBMITTED | YELLOW | 2026-02-06**
