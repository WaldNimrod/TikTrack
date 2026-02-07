# 📋 הודעה: Phase 2 Execution - Backend API (D18/D21)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend Implementation)  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 EXECUTION MANDATE - ACTIVE DEVELOPMENT**  
**עדיפות:** 🔴 **CRITICAL**

---

## 🎯 Executive Summary

**הליבה הפיננסית פתוחה לפיתוח!**

בעקבות אישור האדריכל (Architect Execution Mandate), אתם מורשים להתחיל בפיתוח Backend API עבור:
- **D18 - Brokers Fees (עמלות ברוקרים)**
- **D21 - Cash Flows (תזרים מזומנים)**

**מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md`

---

## ⚠️ חובת משילות - קריאה חובה לפני התחלה

**🚨 חובה על כל צוות לעצור ולבצע רענון למידה לנהלים הבאים:**

### **1. "התנ"ך שלנו" - חובת קריאה חוזרת**
- 📖 **קובץ:** `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- 📖 **קובץ:** `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- 📖 **קובץ:** `documentation/00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md` (SSOT)

**חובה:** חתימה על READINESS_DECLARATION לאחר קריאה חוזרת של התנ"ך והגדרות התפקיד.

### **2. נהלי עבודה - לימוד חוזר**
- 📖 **קובץ:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md` (תוכנית מימוש מלא)
- 📖 **קובץ:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md` (דוגמה ל-Field Map)

---

## 📋 משימות Phase 2.1: Brokers Fees (D18)

### **1. הגדרת API Endpoints ב-`routes.json`**

**קובץ:** `routes.json` v1.1.2 (SSOT)

**דרישות:**
- [ ] הוספת endpoint: `GET /api/v1/brokers_fees`
- [ ] הוספת endpoint: `GET /api/v1/brokers_fees/{id}`
- [ ] הוספת endpoint: `POST /api/v1/brokers_fees`
- [ ] הוספת endpoint: `PUT /api/v1/brokers_fees/{id}`
- [ ] הוספת endpoint: `DELETE /api/v1/brokers_fees/{id}`

**פרמטרים נדרשים (Query Parameters):**
- `broker` (string, optional) - סינון לפי ברוקר
- `commission_type` (string, optional) - סינון לפי סוג עמלה (TIERED/FLAT)
- `search` (string, optional) - חיפוש חופשי

**⚠️ קריטי:** כל ה-endpoints חייבים להיות מוגדרים ב-`routes.json` בלבד. אין routes hardcoded!

### **2. יצירת Field Map**

**תבנית:** `WP_20_*_FIELD_MAP_BROKERS_FEES.md`

**דרישות:**
- [ ] מיפוי שדות DB → API Response
- [ ] שימוש ב-**Singular Naming** לשדות (למשל: `broker_id`, `commission_type`, `commission_value`)
- [ ] תיעוד מלא של כל השדות
- [ ] דוגמאות Response

**דוגמה לשדות נדרשים (לפי הבלופרינט):**
- `broker` (string) - שם הברוקר
- `commission_type` (string) - סוג עמלה (TIERED/FLAT)
- `commission_value` (string) - ערך העמלה (למשל: "0.0035 $ / Share")
- `minimum` (decimal) - מינימום לפעולה (USD)

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D18_BRKRS_VIEW.html`

### **3. מימוש Logic Cube**

**דרישות:**
- [ ] יצירת Model: `api/models/brokers_fees.py`
- [ ] יצירת Schema: `api/schemas/brokers_fees.py`
- [ ] יצירת Service: `api/services/brokers_fees_service.py`
- [ ] יצירת Router: `api/routers/brokers_fees.py`
- [ ] רישום Router ב-`main.py`

**⚠️ קריטי - Singular Naming:**
- שמות שדות ב-DB: `broker_id`, `commission_type`, `commission_value`, `minimum`
- שמות שדות ב-API Response: `broker_id`, `commission_type`, `commission_value`, `minimum`
- **אין שימוש ב-Plural לשדות!**

### **4. ולידציה של אבטחה**

- [ ] אכיפת Masked Log (אין `console.log` עם טוקנים)
- [ ] ולידציה של Token Leakage (אין דליפת מידע רגיש)
- [ ] בדיקת CORS (Port 8082 בלבד)

---

## 📋 משימות Phase 2.2: Cash Flows (D21)

### **1. הגדרת API Endpoints ב-`routes.json`**

**קובץ:** `routes.json` v1.1.2 (SSOT)

**דרישות:**
- [ ] הוספת endpoint: `GET /api/v1/cash_flows`
- [ ] הוספת endpoint: `GET /api/v1/cash_flows/{id}`
- [ ] הוספת endpoint: `POST /api/v1/cash_flows`
- [ ] הוספת endpoint: `PUT /api/v1/cash_flows/{id}`
- [ ] הוספת endpoint: `DELETE /api/v1/cash_flows/{id}`

**פרמטרים נדרשים (Query Parameters):**
- `trading_account_id` (string, optional) - סינון לפי חשבון מסחר
- `flow_type` (string, optional) - סינון לפי סוג תנועה (DEPOSIT/WITHDRAWAL/DIVIDEND/INTEREST/FEE/OTHER)
- `date_from` (date, optional) - תאריך התחלה
- `date_to` (date, optional) - תאריך סיום
- `search` (string, optional) - חיפוש חופשי

**⚠️ קריטי:** כל ה-endpoints חייבים להיות מוגדרים ב-`routes.json` בלבד. אין routes hardcoded!

### **2. יצירת Field Map**

**תבנית:** `WP_20_*_FIELD_MAP_CASH_FLOWS.md`

**דרישות:**
- [ ] מיפוי שדות DB → API Response
- [ ] שימוש ב-**Singular Naming** לשדות
- [ ] תיעוד מלא של כל השדות
- [ ] דוגמאות Response

**דוגמה לשדות נדרשים (לפי הבלופרינט - טבלה 1: תזרימי מזומנים):**
- `trade` (string) - מספר טרייד
- `trading_account` (string) - שם החשבון
- `type` (string) - סוג תנועה (הפקדה/משיכה/דיבידנד/ריבית/עמלה/אחר)
- `amount` (decimal) - סכום
- `date` (date) - תאריך פעולה
- `description` (string) - תיאור התנועה
- `source` (string) - מקור התנועה
- `updated` (date) - תאריך עדכון

**דוגמה לשדות נדרשים (לפי הבלופרינט - טבלה 2: המרות מטבע):**
- `date` (date) - תאריך המרה
- `trading_account` (string) - שם החשבון
- `from` (string) - מטבע מקור
- `to` (string) - מטבע יעד
- `rate` (decimal) - שער המרה
- `id` (string) - מזהה ייחודי

**קישור לבלופרינט:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html`

### **3. מימוש Logic Cube**

**דרישות:**
- [ ] יצירת Model: `api/models/cash_flows.py`
- [ ] יצירת Schema: `api/schemas/cash_flows.py`
- [ ] יצירת Service: `api/services/cash_flows_service.py`
- [ ] יצירת Router: `api/routers/cash_flows.py`
- [ ] רישום Router ב-`main.py`

**⚠️ קריטי - Singular Naming:**
- שמות שדות ב-DB: `trade_id`, `trading_account_id`, `flow_type`, `amount`, `date`, `description`, `source`, `updated_at`
- שמות שדות ב-API Response: `trade_id`, `trading_account_id`, `flow_type`, `amount`, `date`, `description`, `source`, `updated_at`
- **אין שימוש ב-Plural לשדות!**

### **4. ולידציה של אבטחה**

- [ ] אכיפת Masked Log (אין `console.log` עם טוקנים)
- [ ] ולידציה של Token Leakage (אין דליפת מידע רגיש)
- [ ] בדיקת CORS (Port 8082 בלבד)

---

## ⚠️ כללי אכיפה קריטיים

### **1. Routes SSOT**
- ❌ **אסור:** יצירת routes מקומיים או hardcoded
- ✅ **חובה:** שימוש ב-`routes.json` v1.1.2 בלבד
- ✅ **אכיפה:** כל סטייה תגרור עצירה מיידית

### **2. Singular Naming לשדות**
- ❌ **אסור:** שמות שדות ב-Plural (`brokers`, `commissions`)
- ✅ **חובה:** שמות שדות ב-Singular (`broker_id`, `commission_type`)
- ✅ **אכיפה:** כל סטייה תגרור עצירה מיידית

### **3. Security**
- ❌ **אסור:** `console.log` עם טוקנים או מידע רגיש
- ✅ **חובה:** שימוש ב-Masked Log בלבד

### **4. Ports**
- ❌ **אסור:** שימוש בפורטים אחרים מלבד 8082 (Backend)
- ✅ **חובה:** Port Unification

---

## 📊 לוח זמנים

| משימה | תאריך יעד | עדיפות |
|:---|:---|:---|
| חתימה על READINESS_DECLARATION | 2026-02-07 | 🔴 CRITICAL |
| D18: הגדרת API Endpoints | 2026-02-08 | 🔴 CRITICAL |
| D18: יצירת Field Map | 2026-02-09 | 🔴 CRITICAL |
| D18: מימוש Logic Cube | 2026-02-12 | 🔴 CRITICAL |
| D21: הגדרת API Endpoints | 2026-02-13 | 🔴 CRITICAL |
| D21: יצירת Field Map | 2026-02-14 | 🔴 CRITICAL |
| D21: מימוש Logic Cube | 2026-02-17 | 🔴 CRITICAL |

---

## 📞 קישורים רלוונטיים

### **מנדטים ותוכניות:**
- **מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_EXECUTION_MANDATE.md`
- **תוכנית מימוש:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`
- **מנדט כללי:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md`

### **בלופרינטים:**
- **D18 Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D18_BRKRS_VIEW.html`
- **D21 Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html`
- **מדריך יישום:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_D18_D21_IMPLEMENTATION_GUIDE.md`

### **תיעוד:**
- **DB Schema:** `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **OpenAPI Spec:** `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`
- **דוגמה Field Map:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_07_C_FIELD_MAP_TRADING_ACCOUNTS.md`

---

## ✅ Checklist סופי

### **Phase 2.1: Brokers Fees (D18)**
- [ ] חתימה על READINESS_DECLARATION
- [ ] הגדרת API Endpoints ב-`routes.json`
- [ ] יצירת Field Map (`WP_20_*_FIELD_MAP_BROKERS_FEES.md`)
- [ ] מימוש Model (`api/models/brokers_fees.py`)
- [ ] מימוש Schema (`api/schemas/brokers_fees.py`)
- [ ] מימוש Service (`api/services/brokers_fees_service.py`)
- [ ] מימוש Router (`api/routers/brokers_fees.py`)
- [ ] רישום Router ב-`main.py`
- [ ] ולידציה של אבטחה (Masked Log, Token Leakage)

### **Phase 2.2: Cash Flows (D21)**
- [ ] הגדרת API Endpoints ב-`routes.json`
- [ ] יצירת Field Map (`WP_20_*_FIELD_MAP_CASH_FLOWS.md`)
- [ ] מימוש Model (`api/models/cash_flows.py`)
- [ ] מימוש Schema (`api/schemas/cash_flows.py`)
- [ ] מימוש Service (`api/services/cash_flows_service.py`)
- [ ] מימוש Router (`api/routers/cash_flows.py`)
- [ ] רישום Router ב-`main.py`
- [ ] ולידציה של אבטחה (Masked Log, Token Leakage)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 EXECUTION MANDATE - ACTIVE DEVELOPMENT**

**log_entry | [Team 10] | TEAM_20 | PHASE_2_EXECUTION_D18_D21 | GREEN | 2026-02-06**
