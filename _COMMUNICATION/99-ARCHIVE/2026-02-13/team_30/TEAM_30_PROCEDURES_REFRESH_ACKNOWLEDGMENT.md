# ✅ Team 30 - Procedures Refresh Acknowledgment

**Team:** 30 (Frontend Execution)  
**Date:** 2026-02-06  
**Status:** 🟢 **ACKNOWLEDGED & REFRESHED**

---

## 📚 עדכון חשוב: הבנת מבנה הקבצים

### ⚠️ הבחנה קריטית: NON-SSOT vs SSOT

**גיליתי עדכון חשוב במבנה הקבצים:**

1. **קבצים ב-`_COMMUNICATION/team_10/`:**
   - ⚠️ **סטטוס:** NON-SSOT - COMMUNICATION ONLY
   - 📋 **תפקיד:** העתקי תקשורת בלבד
   - ✅ **שימוש:** להבנת הנהלים והתוכניות, אבל לא מקור האמת

2. **קבצים ב-`documentation/`:**
   - ✅ **סטטוס:** SSOT - Single Source of Truth
   - 📋 **תפקיד:** מקור האמת היחיד והרשמי
   - ✅ **שימוש:** מקור האמת לכל הנהלים והתוכניות

---

## 📋 SSOT Locations (מקורות אמת רשמיים)

### 1. נוהל קידום ידע (Knowledge Promotion Protocol)
- **NON-SSOT (תקשורת):** `_COMMUNICATION/team_10/TEAM_10_KNOWLEDGE_PROMOTION_WORKFLOW.md`
- **SSOT (מקור אמת):** `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`

### 2. תוכנית Phase 2 (Phase 2 Implementation Plan)
- **NON-SSOT (תקשורת):** `_COMMUNICATION/team_10/TEAM_10_PHASE_2_IMPLEMENTATION_PLAN.md`
- **SSOT (מקור אמת):** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`

---

## ✅ עקרונות מחייבים - רענון מלא

### 1. נוהל קידום ידע (Knowledge Promotion Protocol)

**עקרונות מרכזיים:**
- ❌ **אסור מוחלט:** כתיבה ישירה ל-`documentation/`
- ✅ **חובה:** כל הפלט ב-`_COMMUNICATION/team_30/`
- ✅ **חובה:** רק Team 10 רשאי לכתוב ל-`documentation/`
- ✅ **חובה:** Consolidation בסיום כל באץ' לפני מעבר לבאץ' הבא

**תהליך Consolidation:**
1. איסוף דוחות תקשורת מ-`_COMMUNICATION/team_[ID]/`
2. זיקוק ידע קריטי (החלטות, דפוסים, לקחים)
3. מיפוי ל-`documentation/` (על ידי Team 10 בלבד)
4. עדכון אינדקסים מרכזיים
5. ארכוב דוחות תקשורת

### 2. תוכנית Phase 2 - דרישות קריטיות

**תשתית מוכנה (Infrastructure Ready):**

#### ✅ Routes SSOT
- **קובץ:** `routes.json` v1.1.2
- **שימוש:** חובה להשתמש בנתיבים מהקובץ בלבד
- **אכיפה:** כל סטייה תגרור עצירה מיידית

#### ✅ Transformers Hardened
- **קובץ:** `transformers.js` v1.2 (נתיב: `ui/src/cubes/shared/utils/transformers.js`)
- **תכונות:** המרת מספרים כפויה, המרת snake_case ↔ camelCase
- **אכיפה:** אין שימוש ב-Transformers מקומיים
- ⚠️ **חשוב:** שם הקובץ הוא `transformers.js` (ללא קידומת FIX)

#### ✅ Bridge Integration
- **תשתית:** HTML ↔ React Bridge
- **שימוש:** חובה לכל רכיבי Frontend

#### ✅ Security Masked Log
- **תכונה:** מניעת דליפת טוקנים ומידע רגיש
- **אכיפה:** אין שימוש ב-`console.log` עם טוקנים או מידע רגיש

#### ✅ Port Unification
- **Frontend:** Port 8080
- **Backend:** Port 8082
- **אכיפה:** אין שימוש בפורטים אחרים

---

## ⚠️ כללי אכיפה קריטיים - Phase 2

### 1. Transformers 🔴
- ❌ **אסור:** יצירת Transformers מקומיים (`apiToReact` מקומי)
- ✅ **חובה:** שימוש ב-`transformers.js` בלבד
- ✅ **נתיב:** `ui/src/cubes/shared/utils/transformers.js`
- ⚠️ **חשוב:** שם הקובץ הוא `transformers.js` (ללא קידומת FIX)

### 2. Routes 🔴
- ❌ **אסור:** יצירת routes מקומיים או hardcoded
- ✅ **חובה:** שימוש ב-`routes.json` v1.1.2 בלבד

### 3. Hybrid Scripts Policy 🔴
- ❌ **אסור:** Inline JavaScript (`<script>` ללא `src`, `onclick` attributes)
- ✅ **חובה:** כל ה-JS בקובץ חיצוני, Event listeners פרוגרמטיים

### 4. Security 🔴
- ❌ **אסור:** `console.log` עם טוקנים או מידע רגיש
- ✅ **חובה:** שימוש ב-Masked Log בלבד

### 5. Ports 🔴
- ❌ **אסור:** שימוש בפורטים אחרים מלבד 8080 (Frontend) ו-8082 (Backend)
- ✅ **חובה:** Port Unification

---

## 📋 עבודה על Brokers Fees (D18) ו-Cash Flows (D21)

### שלבי עבודה ל-Team 30:

#### **Phase 2.1: Brokers Fees (D18)**
1. ✅ יצירת `brokers_fees.html`
2. ✅ שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
3. ✅ שימוש ב-Routes SSOT בלבד (`routes.json` v1.1.2)
4. ✅ אכיפת Hybrid Scripts Policy (אין inline JS)
5. ✅ אכיפת Masked Log (אין דליפת טוקנים)

#### **Phase 2.2: Cash Flows (D21)**
1. ✅ יצירת `cash_flows.html`
2. ✅ שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
3. ✅ שימוש ב-Routes SSOT בלבד (`routes.json` v1.1.2)
4. ✅ אכיפת Hybrid Scripts Policy (אין inline JS)
5. ✅ אכיפת Masked Log (אין דליפת טוקנים)

---

## 🎯 קריטריוני הצלחה לכל עמוד

1. ✅ שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
2. ✅ שימוש ב-Routes SSOT בלבד (`routes.json` v1.1.2)
3. ✅ אכיפת Hybrid Scripts Policy (אין inline JS)
4. ✅ אכיפת Masked Log (אין דליפת טוקנים)
5. ✅ Port Unification (8080/8082)
6. ✅ LOD 400 Fidelity (Team 40)
7. ✅ QA Validation Passed (Team 50)
8. ✅ Architect Approval (G-Bridge)

---

## ✅ אישור והצהרת מוכנות

**אני מצהיר כי:**

1. ✅ הבנתי את ההבחנה בין NON-SSOT (תקשורת) ל-SSOT (מקור אמת)
2. ✅ אני יודע שה-SSOT נמצא ב-`documentation/` ולא ב-`_COMMUNICATION/`
3. ✅ אני מבין שכל הפלט שלי חייב להיות ב-`_COMMUNICATION/team_30/`
4. ✅ אני מבין שרק Team 10 רשאי לכתוב ל-`documentation/`
5. ✅ אני מכיר את כל הדרישות הקריטיות ל-Phase 2
6. ✅ אני מוכן לעבוד על Brokers Fees ו-Cash Flows לפי כל הכללים

---

## 🚀 מוכנות לשלב הבא

**סטטוס:** ✅ **READY**

- ✅ רענון מלא של הנהלים והתוכניות
- ✅ הבנת מבנה הקבצים (NON-SSOT vs SSOT)
- ✅ הבנת כל הדרישות הקריטיות ל-Phase 2
- ✅ מוכן לעבוד על Brokers Fees ו-Cash Flows

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **ACKNOWLEDGED & REFRESHED**

**log_entry | [Team 30] | PROCEDURES_REFRESH | ACKNOWLEDGED | GREEN | 2026-02-06**
