# ⚠️ NON-SSOT - COMMUNICATION ONLY

**⚠️ זהו מסמך תקשורת בלבד - לא SSOT!**

**SSOT Location:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`

---

# 🚀 תוכנית מימוש מלא - חבילה 2: Financial Core

**id:** `TEAM_10_PHASE_2_IMPLEMENTATION_PLAN`  
**owner:** Team 10 (The Gateway)  
**status:** ⚠️ **NON-SSOT - COMMUNICATION ONLY**  
**supersedes:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`  
**last_updated:** 2026-02-06  
**version:** v1.0 (Communication Copy)

---

**מקור:** `ARCHITECT_PHASE_2_FULL_RELEASE_MANDATE.md`  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 RELEASED**

---

## 📋 רשימת עמודים בחבילה 2

### **Batch 2: Financial Core**

| ID | שם קובץ | תיאור | סטטוס נוכחי | צוות אחראי |
|:---|:---|:---|:---|:---|
| **D16** | `trading_accounts.html` | חשבונות מסחר | ✅ **5. APPROVED** | Team 30 |
| **D18** | `brokers_fees.html` | עמלות ברוקרים | 🟡 **3. IN PROGRESS** | Team 30 |
| **D21** | `cash_flows.html` | תזרים מזומנים | 🟡 **3. IN PROGRESS** | Team 30 |

---

## 🎯 יעדי חבילה 2

### **1. Trading Accounts (D16)** ✅ **APPROVED**
- **סטטוס:** מאושר ומוכן לייצור
- **תשתית:** Transformers Hardened v1.2, Routes SSOT v1.1.2
- **אבטחה:** Masked Log, Token Leakage Fixed
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend API)

### **2. Brokers Fees (D18)** 🟡 **IN PROGRESS**
- **יעד:** מימוש מלא של מודול עמלות ברוקרים
- **דרישות:**
  - שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
  - שימוש ב-Routes SSOT (`routes.json` v1.1.2)
  - אכיפת Hybrid Scripts Policy (אין inline JS)
  - אכיפת Masked Log (אין דליפת טוקנים)
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend), Team 40 (UI/Design), Team 50 (QA)

### **3. Cash Flows (D21)** 🟡 **IN PROGRESS**
- **יעד:** מימוש מלא של מודול תזרים מזומנים
- **דרישות:**
  - שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
  - שימוש ב-Routes SSOT (`routes.json` v1.1.2)
  - אכיפת Hybrid Scripts Policy (אין inline JS)
  - אכיפת Masked Log (אין דליפת טוקנים)
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend), Team 40 (UI/Design), Team 50 (QA)

---

## 📐 תשתית מוכנה (Infrastructure Ready)

### ✅ **Routes SSOT**
- **קובץ:** `routes.json` v1.1.2
- **שימוש:** חובה להשתמש בנתיבים מהקובץ בלבד
- **אכיפה:** כל סטייה תגרור עצירה מיידית

### ✅ **Transformers Hardened**
- **קובץ:** `transformers.js` v1.2 (נתיב: `ui/src/cubes/shared/utils/transformers.js`)
- **תכונות:** המרת מספרים כפויה, המרת snake_case ↔ camelCase
- **אכיפה:** אין שימוש ב-Transformers מקומיים

### ✅ **Bridge Integration**
- **תשתית:** HTML ↔ React Bridge
- **שימוש:** חובה לכל רכיבי Frontend

### ✅ **Security Masked Log**
- **תכונה:** מניעת דליפת טוקנים ומידע רגיש
- **אכיפה:** אין שימוש ב-`console.log` עם טוקנים או מידע רגיש

### ✅ **Port Unification**
- **Frontend:** Port 8080
- **Backend:** Port 8082
- **אכיפה:** אין שימוש בפורטים אחרים

---

## 🔄 שלבי עבודה (Workflow Phases)

### **Phase 2.1: Brokers Fees (D18)**
1. **Team 20 (Backend):**
   - הגדרת API endpoints ב-`routes.json`
   - יצירת Field Map (`WP_20_*_FIELD_MAP_BROKERS_FEES.md`)
   - מימוש Logic Cube

2. **Team 30 (Frontend):**
   - יצירת `brokers_fees.html`
   - שימוש ב-Transformers המרכזיים בלבד
   - שימוש ב-Routes SSOT בלבד
   - אכיפת Hybrid Scripts Policy

3. **Team 40 (UI/Design):**
   - ולידציה של Fidelity לפי LOD 400
   - בדיקת עמידה ב-Master Palette Spec

4. **Team 50 (QA):**
   - בדיקות Digital Twin
   - ולידציה של אבטחה (Masked Log, Token Leakage)
   - בדיקות אוטומציה (Selenium)

### **Phase 2.2: Cash Flows (D21)**
1. **Team 20 (Backend):**
   - הגדרת API endpoints ב-`routes.json`
   - יצירת Field Map (`WP_20_*_FIELD_MAP_CASH_FLOWS.md`)
   - מימוש Logic Cube

2. **Team 30 (Frontend):**
   - יצירת `cash_flows.html`
   - שימוש ב-Transformers המרכזיים בלבד
   - שימוש ב-Routes SSOT בלבד
   - אכיפת Hybrid Scripts Policy

3. **Team 40 (UI/Design):**
   - ולידציה של Fidelity לפי LOD 400
   - בדיקת עמידה ב-Master Palette Spec

4. **Team 50 (QA):**
   - בדיקות Digital Twin
   - ולידציה של אבטחה (Masked Log, Token Leakage)
   - בדיקות אוטומציה (Selenium)

---

## ⚠️ כללי אכיפה קריטיים

### **1. Transformers**
- ❌ **אסור:** יצירת Transformers מקומיים (`apiToReact` מקומי)
- ✅ **חובה:** שימוש ב-`transformers.js` בלבד (נתיב: `ui/src/cubes/shared/utils/transformers.js`)

### **2. Routes**
- ❌ **אסור:** יצירת routes מקומיים או hardcoded
- ✅ **חובה:** שימוש ב-`routes.json` v1.1.2 בלבד

### **3. Hybrid Scripts Policy**
- ❌ **אסור:** Inline JavaScript (`<script>` ללא `src`, `onclick` attributes)
- ✅ **חובה:** כל ה-JS בקובץ חיצוני, Event listeners פרוגרמטיים

### **4. Security**
- ❌ **אסור:** `console.log` עם טוקנים או מידע רגיש
- ✅ **חובה:** שימוש ב-Masked Log בלבד

### **5. Ports**
- ❌ **אסור:** שימוש בפורטים אחרים מלבד 8080 (Frontend) ו-8082 (Backend)
- ✅ **חובה:** Port Unification

---

## 📊 מעקב התקדמות

### **D18 - Brokers Fees**
- [ ] Team 20: API endpoints + Field Map
- [ ] Team 30: Frontend Implementation
- [ ] Team 40: UI/Design Fidelity
- [ ] Team 50: QA Validation
- [ ] Team 10: Final Approval

### **D21 - Cash Flows**
- [ ] Team 20: API endpoints + Field Map
- [ ] Team 30: Frontend Implementation
- [ ] Team 40: UI/Design Fidelity
- [ ] Team 50: QA Validation
- [ ] Team 10: Final Approval

---

## 🎯 קריטריוני הצלחה

### **לכל עמוד:**
1. ✅ שימוש ב-Transformers המרכזיים בלבד
2. ✅ שימוש ב-Routes SSOT בלבד
3. ✅ אכיפת Hybrid Scripts Policy
4. ✅ אכיפת Masked Log
5. ✅ Port Unification
6. ✅ LOD 400 Fidelity (Team 40)
7. ✅ QA Validation Passed (Team 50)
8. ✅ Architect Approval (G-Bridge)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🟢 **PHASE 2 RELEASED - ACTIVE DEVELOPMENT**

**log_entry | [Team 10] | PHASE_2_PLAN | IMPLEMENTATION_PLAN_CREATED | GREEN | 2026-02-06**
