# 📋 תוכנית עבודה: Batch 2 - Financial Core

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **READY TO START**  
**מקור:** פקודת האדריכל + Batch 1 Closure Mandate

---

## 📢 Executive Summary

לאחר השלמת Batch 1 (Identity & Auth) והשלמת P0/P1/P2, המערכת מוכנה לפתיחת Batch 2: Financial Core.

---

## 🎯 יעדי Batch 2

### **עמודים לפיתוח:**
1. **D16 - Trading Accounts** (`trading_accounts.html`)
   - ניהול חשבונות מסחר
   - סטטוס: 🟡 **IN PROGRESS**

2. **D18 - Brokers Fees** (`brokers_fees.html`)
   - ניהול עמלות ברוקרים
   - סטטוס: ⏳ **PLANNED**

3. **D21 - Cash Flows** (`cash_flows.html`)
   - ניהול תזרים מזומנים
   - סטטוס: ⏳ **PLANNED**

---

## 🏗️ תשתית מוכנה

### **P0/P1/P2 Complete:**
- ✅ **Routes SSOT:** `routes.json` v1.1.1 - מקור אמת יחיד לנתיבים
- ✅ **Transformers Hardened v1.2:** המרת מספרים כפויה לשדות כספיים
- ✅ **Bridge Integration:** תקשורת HTML Shell ↔ React Content
- ✅ **Security Masked Log:** מניעת דליפת טוקנים
- ✅ **Port Unification:** Frontend (8080), Backend (8082)

### **Batch 1 Complete:**
- ✅ Identity & Auth Cube
- ✅ Auth Pages (Login, Register, Reset Password)
- ✅ Profile Page (Fidelity)
- ✅ Dashboard (Fidelity)

---

## 📋 תוכנית עבודה מפורטת

### **שלב 1: D16 - Trading Accounts** 🟡 **IN PROGRESS**

#### **Team 20 (Backend):**
- ✅ פיתוח Financial Cube API
- ✅ Endpoints ל-Trading Accounts
- ✅ Field Maps (`WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md`)
- ✅ Database Schema (כבר קיים)

**זמן משוער:** 4-6 שעות

#### **Team 30 (Frontend):**
- ⏳ פיתוח `trading_accounts.html`
- ⏳ אינטגרציה עם Financial Cube API
- ⏳ שימוש ב-Transformers Hardened v1.2
- ⏳ שימוש ב-Bridge Integration

**זמן משוער:** 8-12 שעות

#### **Team 40 (UI/Design):**
- ⏳ ולידציה מול Blueprint
- ⏳ Fidelity Check
- ⏳ CSS Integration

**זמן משוער:** 3-4 שעות

#### **Team 50 (QA):**
- ⏳ QA Validation
- ⏳ Fidelity Check
- ⏳ Security Audit

**זמן משוער:** 2-3 שעות

---

### **שלב 2: D18 - Brokers Fees** ⏳ **PLANNED**

#### **Team 20 (Backend):**
- ⏳ Endpoints ל-Brokers Fees
- ⏳ Field Maps
- ⏳ Database Schema

**זמן משוער:** 3-4 שעות

#### **Team 30 (Frontend):**
- ⏳ פיתוח `brokers_fees.html`
- ⏳ אינטגרציה עם API
- ⏳ שימוש ב-Transformers ו-Bridge

**זמן משוער:** 6-8 שעות

#### **Team 40 (UI/Design):**
- ⏳ ולידציה מול Blueprint
- ⏳ Fidelity Check

**זמן משוער:** 2-3 שעות

#### **Team 50 (QA):**
- ⏳ QA Validation
- ⏳ Fidelity Check

**זמן משוער:** 2-3 שעות

---

### **שלב 3: D21 - Cash Flows** ⏳ **PLANNED**

#### **Team 20 (Backend):**
- ⏳ Endpoints ל-Cash Flows
- ⏳ Field Maps (`WP_20_08_C_FIELD_MAP_CASH_FLOWS.md`)
- ⏳ Database Schema

**זמן משוער:** 3-4 שעות

#### **Team 30 (Frontend):**
- ⏳ פיתוח `cash_flows.html`
- ⏳ אינטגרציה עם API
- ⏳ שימוש ב-Transformers ו-Bridge

**זמן משוער:** 6-8 שעות

#### **Team 40 (UI/Design):**
- ⏳ ולידציה מול Blueprint
- ⏳ Fidelity Check

**זמן משוער:** 2-3 שעות

#### **Team 50 (QA):**
- ⏳ QA Validation
- ⏳ Fidelity Check

**זמן משוער:** 2-3 שעות

---

## ⏱️ זמן כולל משוער

### **D16 - Trading Accounts:**
**17-25 שעות**

### **D18 - Brokers Fees:**
**13-18 שעות**

### **D21 - Cash Flows:**
**13-18 שעות**

### **סה"כ Batch 2:**
**43-61 שעות**

---

## 🛡️ הנחיות אדריכליות

### **לפי Batch 1 Closure Mandate:**

#### **Team 20 (Backend):**
- ✅ הקפדה על `snake_case` ב-API
- ✅ קודי שגיאה יציבים
- ✅ ה-API הוא החוזה, לא המלצה

#### **Team 30 (Frontend):**
- ✅ בידוד מוחלט בין קוביות (Cubes)
- ✅ כל קוביה היא אי עצמאי המתקשר רק דרך ה-Shared
- ✅ שימוש ב-Transformers Hardened v1.2
- ✅ שימוש ב-Bridge Integration

#### **Team 40 (UI/Design):**
- ✅ ניהול בלעדי של CSS Variables
- ✅ אין עיצוב מקומי בתוך רכיבים
- ✅ Fidelity מול Blueprint

#### **Team 50 (QA):**
- ✅ פסילת כל קובץ שאינו עובר Audit Trail תחת debug
- ✅ Fidelity Check מול Blueprint

---

## 📚 מסמכים קשורים

### **תשתית:**
- `routes.json` v1.1.1 - Routes SSOT
- `transformers.js` Hardened v1.2 - Data Transformation
- `PhoenixFilterContext.jsx` - Bridge Integration
- `PHOENIX_MASTER_BIBLE.md` - Master Rules

### **Field Maps:**
- `WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md` - Trading Accounts Fields
- `WP_20_08_C_FIELD_MAP_CASH_FLOWS.md` - Cash Flows Fields

### **ארכיטקטורה:**
- `TT2_BACKEND_CUBE_INVENTORY.md` - Backend Cubes
- `TT2_UI_INTEGRATION_PATTERN.md` - UI Integration Pattern
- `TT2_MASTER_BLUEPRINT.md` - Master Blueprint

---

## ✅ קריטריוני הצלחה

### **לכל עמוד:**
- ✅ עובר QA Validation
- ✅ עובר Fidelity Check מול Blueprint
- ✅ משתמש ב-Transformers Hardened v1.2
- ✅ משתמש ב-Bridge Integration
- ✅ אין דליפת טוקנים (Masked Log)
- ✅ Routes מתועדים ב-`routes.json`

---

## 🚀 צעדים הבאים

### **מיידי:**
1. ⏳ **Team 20:** התחלת פיתוח Financial Cube API
2. ⏳ **Team 30:** המשך פיתוח `trading_accounts.html`
3. ⏳ **Team 40:** הכנה לולידציה מול Blueprint
4. ⏳ **Team 50:** הכנה ל-QA Validation

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **READY TO START**

**log_entry | [Team 10] | BATCH_2 | WORK_PLAN | GREEN | 2026-02-04**
