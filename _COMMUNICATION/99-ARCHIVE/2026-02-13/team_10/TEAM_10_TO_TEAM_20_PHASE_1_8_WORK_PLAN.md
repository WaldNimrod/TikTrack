# 📋 מסך עבודה: Phase 1.8 - Team 20 (Backend)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**מסך עבודה מפורט למימוש Phase 1.8 - Infrastructure & Retrofit עבור Team 20.**

**מקור:** `ARCHITECT_PHASE_1_8_DETAILED_STRATEGY.md`

---

## 🚨 סשן חירום נדרש - Team 30 ממתינה

**⚠️ CRITICAL:** Team 30 השלימה את כל המשימות ב-Phase 1.8 וממתינה לסשן חירום עם Team 20.

**מסמך:** `TEAM_10_TO_TEAM_20_EMERGENCY_SESSION_REQUIRED.md` ✅

**סטטוס Team 30:** ✅ **PHASE 1.8 COMPLETE** (ממתין ל-PDSC Contract)

---

## 📋 שלב 1: נעילת חוזים (48 שעות) 🔴 **CRITICAL**

### **משימה 1.1: השלמת PDSC Boundary Contract** (24 שעות) 🚨 **EMERGENCY**

**דרישות:**
- [ ] **🚨 ביצוע סשן חירום עם Team 30 (8 שעות) - נדרש מיידי**
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` עם החלטות משותפות:
  - [ ] Error Schema - אישור/שינויים
  - [ ] Response Contract - אישור/שינויים
  - [ ] Transformers Integration - הגדרת אחריות ברורה
  - [ ] Fetching Integration - הגדרת אחריות ברורה
  - [ ] Routes SSOT Integration - הגדרת אחריות ברורה
- [ ] הוספת דוגמאות קוד משותפות:
  - [ ] Backend Examples (Python/Pydantic)
  - [ ] Frontend Examples (JavaScript)
  - [ ] Integration Examples (End-to-End)
- [ ] תיעוד Integration Points
- [ ] Validation Rules מוסכמים

**קבצים:**
- `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (לעדכון)

**Timeline:** 24 שעות (לאחר סשן חירום)

**Deadline:** 48 שעות מתחילת Phase 1.8

---

### **משימה 1.2: בדיקת Financial Fields** (2 שעות)

**דרישות:**
- [ ] לבדוק מה Backend מחזיר (strings/numbers) עבור financial fields
- [ ] לתעד את ההחלטה ב-Shared Boundary Contract
- [ ] לוודא שההחלטה תואמת ל-`TEAM_20_REQUIRED_DECISIONS_WITH_TEAM_30.md`

**קבצים לבדיקה:**
- `api/schemas/trading_accounts.py` - `balance: Decimal`
- `api/schemas/cash_flows.py` - `amount: Decimal`
- `api/schemas/brokers_fees.py` - `minimum: Decimal`
- בדיקת תגובת API בפועל (JSON response)

**Timeline:** 2 שעות (במהלך סשן חירום)

---

## 📋 שלב 2: בניית המנוע - PDSC Server (24 שעות)

### **משימה 2.1: מימוש PDSC Server ב-Python** (24 שעות)

**דרישות:**

#### **2.1.1. Error Schema אחיד (JSON)** (8 שעות)
- [ ] מימוש Error Schema לפי `TEAM_20_PDSC_ERROR_SCHEMA.md`
- [ ] יצירת Error Response Helper (Python)
- [ ] ולידציה של Error Response לפי JSON Schema
- [ ] דוגמאות לכל סוג שגיאה

**קבצים:**
- `api/utils/exceptions.py` - ErrorCodes (קיים, לעדכן)
- `api/utils/pdsc_error_handler.py` - חדש (Error Response Helper)

---

#### **2.1.2. Validation Schemas (Pydantic)** (8 שעות)
- [ ] מימוש Validation Schemas לפי `TEAM_20_PDSC_RESPONSE_CONTRACT.md`
- [ ] Success Response Schema (Pydantic)
- [ ] Error Response Schema (Pydantic)
- [ ] Unified Response Schema (oneOf)
- [ ] ולידציה של כל Response לפי Schema

**קבצים:**
- `api/schemas/pdsc_responses.py` - חדש (Response Schemas)
- `api/utils/pdsc_response_validator.py` - חדש (Response Validator)

---

#### **2.1.3. API לפי OpenAPI SSOT** (8 שעות)
- [ ] עדכון API endpoints לפי `OPENAPI_SPEC_V2.yaml` (SSOT)
- [ ] ולידציה שכל endpoints עובדים לפי OpenAPI Spec
- [ ] בדיקת תאימות ל-PDSC Error Schema
- [ ] בדיקת תאימות ל-PDSC Response Contract

**קבצים:**
- `OPENAPI_SPEC_V2.yaml` - SSOT (לבדיקה)
- `api/routers/` - כל ה-routers (לעדכון)

---

## 📋 תוצר סופי נדרש

### **קבצים:**
- [ ] `api/utils/pdsc_error_handler.py` - Error Response Helper
- [ ] `api/schemas/pdsc_responses.py` - Response Schemas
- [ ] `api/utils/pdsc_response_validator.py` - Response Validator
- [ ] `_COMMUNICATION/team_20/TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - מושלם

### **תיעוד:**
- [ ] דוגמאות קוד Backend (Python/Pydantic)
- [ ] Integration Examples (End-to-End)
- [ ] Validation Rules

---

## ✅ Checklist מימוש

### **שלב 1: נעילת חוזים (48 שעות):**
- [ ] **🚨 סשן חירום עם Team 30 - נדרש מיידי (Team 30 ממתינה)**
- [ ] השלמת PDSC Boundary Contract
- [ ] בדיקת Financial Fields
- [ ] הגשה ל-Team 90 לביקורת

### **שלב 2: בניית המנוע (24 שעות):**
- [ ] מימוש Error Schema אחיד
- [ ] מימוש Validation Schemas
- [ ] עדכון API לפי OpenAPI SSOT

---

## 🎯 Timeline סופי

**סה"כ:** 72 שעות

- **שלב 1:** 48 שעות (נעילת חוזים)
- **שלב 2:** 24 שעות (בניית המנוע)

---

## ⚠️ אזהרות קריטיות

1. **PDSC Boundary Contract חובה** - לא ניתן להתחיל מימוש ללא חוזה מושלם
2. **OpenAPI SSOT חובה** - כל API חייב לעבוד לפי OpenAPI Spec
3. **Error Schema אחיד חובה** - כל שגיאה חייבת להיות לפי Schema

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- תיאום סשן חירום עם Team 30
- אישור החלטות
- בדיקת תאימות
- הגשה ל-Team 90 לביקורת

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**

**log_entry | [Team 10] | PHASE_1_8 | TEAM_20_WORK_PLAN | RED | 2026-02-07**
