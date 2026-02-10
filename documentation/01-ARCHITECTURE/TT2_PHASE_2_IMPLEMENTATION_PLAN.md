# 🚀 תוכנית מימוש מלא - חבילה 2: Financial Core

**id:** `TT2_PHASE_2_IMPLEMENTATION_PLAN`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - LOCKED**  
**supersedes:** `_COMMUNICATION/team_10/TEAM_10_PHASE_2_IMPLEMENTATION_PLAN.md`  
**last_updated:** 2026-02-07  
**version:** v2.1 (Phase 2 - Architect Verdict - Endpoints Active Dev)

---

**מקור:** `ARCHITECT_PHASE_2_REFINED_MANDATE.md` + `ARCHITECT_PHASE_2_BLOCKER_VERDICT_FINAL.md`  
**תאריך:** 2026-02-07  
**סטטוס:** 🟢 **PHASE 2 - ACTIVE DEVELOPMENT - ARCHITECT VERDICT IMPLEMENTED**

**🔒 החלטות סופיות ננעלו:** עוברים מ-'דיון' ל-'ביצוע' - כל עמודי הליבה הפיננסית נעולים ל-UAI Refit עד סיום UAI Core Refactor.

---

## 📋 רשימת עמודים בחבילה 2

### **Batch 2: Financial Core**

| ID | שם קובץ | תיאור | סטטוס נוכחי | צוות אחראי |
|:---|:---|:---|:---|:---|
| **D16** | `trading_accounts.html` | חשבונות מסחר | 🔒 **LOCKED_FOR_UAI_REFIT** | Team 30 |
| **D18** | `brokers_fees.html` | עמלות ברוקרים | 🔒 **LOCKED_FOR_UAI_REFIT** | Team 30 |
| **D21** | `cash_flows.html` | תזרים מזומנים | 🔒 **LOCKED_FOR_UAI_REFIT** | Team 30 |

---

## 🎯 יעדי חבילה 2

### **1. Trading Accounts (D16)** 🔒 **LOCKED_FOR_UAI_REFIT**
- **סטטוס:** נעול ל-UAI Refit - ממתין לסיום UAI Core Refactor
- **תשתית:** Transformers Hardened v1.2, Routes SSOT v1.1.2
- **אבטחה:** Masked Log, Token Leakage Fixed
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend API)
- **הערה:** לא ניתן לעבוד עליו עד סיום UAI Core Refactor (48 שעות)

### **2. Brokers Fees (D18)** 🔒 **LOCKED_FOR_UAI_REFIT**
- **סטטוס:** נעול ל-UAI Refit - ממתין לסיום UAI Core Refactor
- **יעד:** מימוש מלא של מודול עמלות ברוקרים (לאחר סיום UAI Core Refactor)
- **דרישות:**
  - שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
  - שימוש ב-Routes SSOT (`routes.json` v1.1.2)
  - אכיפת Hybrid Scripts Policy (אין inline JS)
  - אכיפת Masked Log (אין דליפת טוקנים)
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend), Team 40 (UI/Design), Team 50 (QA)
- **הערה:** לא ניתן לעבוד עליו עד סיום UAI Core Refactor (48 שעות)

### **3. Cash Flows (D21)** 🔒 **LOCKED_FOR_UAI_REFIT**
- **סטטוס:** נעול ל-UAI Refit - ממתין לסיום UAI Core Refactor
- **יעד:** מימוש מלא של מודול תזרים מזומנים (לאחר סיום UAI Core Refactor)
- **דרישות:**
  - שימוש ב-Transformers המרכזיים בלבד (`transformers.js`)
  - שימוש ב-Routes SSOT (`routes.json` v1.1.2)
  - אכיפת Hybrid Scripts Policy (אין inline JS)
  - אכיפת Masked Log (אין דליפת טוקנים)
- **צוותים מעורבים:** Team 30 (Frontend), Team 20 (Backend), Team 40 (UI/Design), Team 50 (QA)
- **הערה:** לא ניתן לעבוד עליו עד סיום UAI Core Refactor (48 שעות)

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

## 🛑 Design Sprint - REJECTED - Contracts Required (חובה ראשונה)

**⚠️ Design Sprint Rejected:** כל ה-Specs נדחו על ידי Spy Team (90.05) - נדרשים Interface Contracts לפני המשך.

### **מצב נוכחי:**

**Specs שהוגשו (כולם נדחו):**
- ✅ Team 20: PDSC (v1.1) - **REJECTED_BY_SPY**
- ✅ Team 30: UAI (v1.0.0) - **REJECTED_BY_SPY**
- ✅ Team 30: EFR (v1.0) - **REJECTED_BY_SPY**
- ✅ Team 30: GED (v1.0) - **REJECTED_BY_SPY**
- ✅ Team 40: DNA Variables CSS (v1.0) - **REJECTED_BY_SPY**

**סיבה לדחייה:** Specs תיאורטיים בלבד - חסר ה-"דבק" הארכיטקטוני המבטיח אינטגרציה.

### **חוזים נדרשים (Interface Contracts):**

**חובה לייצר נספח "חוזה" (Interface Contract) לכל Spec:**

1. **UAI Config Contract (Team 30):** הגדרת ה-JSON Schema המדויק שכל עמוד חייב לספק (selectors, endpoints, dependencies)
2. **PDSC Boundary Contract (Team 20+30):** הגדרת חוזה הנתונים בין השרת ללקוח. השרת מספק Schema, הלקוח מממש Fetching + Hardened Transformers
3. **EFR Logic Map (Team 30):** טבלת SSOT המגדירה איזה טיפוס נתונים ב-API מקבל איזה רכיב רינדור ב-EFR
4. **CSS Load Verification (Team 40+10):** הוספת סעיף בדיקה ב-G-Bridge לווידוא סדר טעינת קבצי ה-CSS

**מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md`

**⚠️ BLOCKING:** אין אישור התקדמות ללא Interface Contracts.

---

## 🔄 שלבי עבודה (Workflow Phases)

### **Phase 2.0: Design Sprint - Final Resolution - Execution Mode** 🔴 **EXECUTION MODE**

**🔒 החלטות סופיות ננעלו:** עוברים מ-'דיון' ל-'ביצוע' - כל השאלות הפתוחות ננעלו.

**חוזים שהושלמו:**
- [x] Team 30: EFR Logic Map - ✅ **COMPLETE**
- [x] Team 30: EFR Hardened Transformers Lock - ✅ **COMPLETE**
- [x] Team 40: CSS Load Verification - ✅ **COMPLETE**
- [x] Team 30: UAI Core Files - ✅ **COMPLETE** (כל 5 השלבים)
- [x] Team 40: CSS Core File - ✅ **COMPLETE** (`cssLoadVerifier.js`)
- [x] Team 30: UAI Config Contract - ✅ **COMPLETE** (External JS + Naming)

**חוזים שדורשים השלמה:**
- [ ] Team 20+30: PDSC Boundary Contract - 🟡 **PARTIAL** (ממתין לסשן חירום)

**משימות סופיות:**
- [ ] Team 30: UAI Core Refactor (48 שעות) - 🔴 **CRITICAL - PRIORITY 1**
- [ ] Team 20+30: סשן חירום (8 שעות) - 🚨 **EMERGENCY**
- [ ] Team 20+30: השלמת Shared Boundary Contract (16 שעות) - 🔴 **CRITICAL**

**הצעדים הבאים:**
- [ ] Team 30: ביצוע UAI Core Refactor (48 שעות) - **PRIORITY 1**
- [ ] Team 20+30: ביצוע סשן חירום (לאחר סיום UAI Core Refactor)
- [ ] Team 20+30: השלמת Shared Boundary Contract
- [ ] Team 10: בדיקה ואישור כל התיקונים
- [ ] Team 90: Re-Scan לביקורת

**מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md`

**מנדטים מפורטים:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_INTERFACE_CONTRACTS_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PDSC_BOUNDARY_CONTRACT_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_EMERGENCY_SESSION_20_30_PDSC_BOUNDARY.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_CSS_LOAD_VERIFICATION.md`

### **Phase 2.1: Brokers Fees (D18)**
1. **Team 60 (DevOps):**
   - ✅ **COMPLETE:** יצירת טבלת DB `user_data.brokers_fees` (2026-02-06)
   - ✅ ENUM type `user_data.commission_type` (TIERED, FLAT)
   - ✅ 6 אינדקסים + טריגר לעדכון `updated_at`
   - ✅ הרשאות למשתמש האפליקציה

2. **Team 20 (Backend):**
   - הגדרת API endpoints ב-`routes.json`
   - יצירת Field Map (`WP_20_*_FIELD_MAP_BROKERS_FEES.md`)
   - מימוש Logic Cube (Model, Schema, Service, Router)
   - 🟢 **ACTIVE_DEV:** `GET /api/v1/brokers_fees/summary` - בפיתוח (2026-02-07)

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
1. **Team 60 (DevOps):**
   - ✅ **VERIFIED:** טבלת DB `user_data.cash_flows` מאומתת כקיימת ותקינה (2026-02-07)
   - 🔴 **VERIFICATION REQUIRED:** אימות הרשאות למשתמש האפליקציה
   - **מקור:** `TEAM_10_PHASE_2_DOCUMENTATION_AND_CODE_AUDIT.md`

2. **Team 20 (Backend):**
   - ✅ **COMPLETE:** API endpoints ב-`routes.json` - מוכן ופועל
   - ✅ **COMPLETE:** מימוש Logic Cube (Model, Schema, Service, Router) - מוכן ופועל
   - 🟡 **VERIFICATION REQUIRED:** אימות שדות response בפועל מול API Integration Guide
   - **מקור:** `TEAM_20_TO_TEAM_30_PHASE_2_API_INTEGRATION_GUIDE.md`

2. **Team 30 (Frontend):**
   - ✅ **COMPLETE:** Data Loaders עודכנו לשימוש ב-Shared_Services.js
   - 🟡 **FIX REQUIRED:** תיקון `cashFlowsDataLoader.js` - הסרת manual transformation (שורות 45-58)
   - **מקור:** `TEAM_10_PHASE_2_DOCUMENTATION_AND_CODE_AUDIT.md`
   - יצירת `cash_flows.html` (ממתין לסיום UAI Core Refactor)
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

### **4. Security & Code Hygiene**
- ❌ **אסור:** `console.log` עם טוקנים או מידע רגיש
- ✅ **חובה:** שימוש ב-Masked Log בלבד
- ⚠️ **No-Logs Policy:** פסילה אוטומטית (RED) לכל קובץ עם `console.log` חשוף
- ✅ **חובה:** שימוש ב-`audit.maskedLog` בלבד

### **5. Ports**
- ❌ **אסור:** שימוש בפורטים אחרים מלבד 8080 (Frontend) ו-8082 (Backend)
- ✅ **חובה:** Port Unification

---

## 📊 מעקב התקדמות

### **D18 - Brokers Fees** 🟢 **ACTIVE_DEV - QA COMPLETE - BLOCKERS FIXED**
- [x] Team 60: DB Table Creation (`user_data.brokers_fees`) ✅ **COMPLETE** (2026-02-06)
- [x] Team 30: UAI Core Refactor ✅ **COMPLETE** (2026-02-07)
- [x] Team 20: API endpoints + Field Map ✅ **COMPLETE** (2026-02-07)
- [x] Team 30: Frontend Implementation ✅ **COMPLETE** (2026-02-07)
- [x] Team 30: Script Tags Fix ✅ **COMPLETE** (2026-02-07)
- [x] Team 40: UI/Design Fidelity ✅ **COMPLETE** (2026-02-07)
- [x] Team 50: QA Validation ✅ **COMPLETE** (2026-02-07)
  - ✅ Gate A — Doc↔Code: GREEN
  - ✅ Gate B — Contract↔Runtime: GREEN
  - ✅ Gate C — UI↔Runtime (E2E): GREEN
  - ⏸️ Gate D — Manual/Visual: PENDING
- [ ] Team 40: Manual/Visual Approval ⏸️ **PENDING**
- [ ] Team 10: Final Approval

### **D21 - Cash Flows** 🟢 **ACTIVE_DEV - INFRA VERIFIED - ENDPOINTS ACTIVE_DEV**
- [x] Team 60: DB Table Verification (`user_data.cash_flows`) ✅ **VERIFIED** (2026-02-07)
- [x] Team 30: UAI Core Refactor ✅ **COMPLETE** (2026-02-07)
- [x] Team 20: API endpoints + Logic Cube ✅ **COMPLETE** (2026-02-07)
- [x] Team 20: Endpoints חסרים - `cash_flows/currency_conversions` 🟢 **ACTIVE_DEV** (2026-02-07)
- [ ] Team 20: Response Schema Verification 🟡 **VERIFICATION REQUIRED**
- [x] Team 30: Data Loaders Update ✅ **COMPLETE** (2026-01-31)
- [x] Team 30: Data Loader Fix (Manual Transformation) ✅ **FIXED** (2026-02-07)
- [x] Team 30: Frontend Implementation ✅ **COMPLETE** (2026-02-07)
- [x] Team 30: Script Tags Fix ✅ **COMPLETE** (2026-02-07)
- [x] Team 40: UI/Design Fidelity ✅ **COMPLETE** (2026-02-07)
- [x] Team 50: QA Validation ✅ **COMPLETE** (2026-02-07)
  - ✅ Gate A — Doc↔Code: GREEN (עם סטייה קלה אחת)
  - ✅ Gate B — Contract↔Runtime: GREEN
  - ✅ Gate C — UI↔Runtime (E2E): GREEN
  - ⏸️ Gate D — Manual/Visual: PENDING
- [x] Team 20: Cash Flows Precision ✅ **LOCKED** - NUMERIC(20,6) (SSOT) (2026-02-07)
- [ ] Team 30: Update Data Loaders for `currency_conversions` endpoint 🟢 **ACTIVE_DEV**
- [ ] Team 40: Manual/Visual Approval ⏸️ **PENDING**
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

## 🔄 שלב Promotion Gate (חובה בסיום D18/D21)

**⚠️ חובה קריטית:** בסיום פיתוח Brokers Fees (D18) ו-Cash Flows (D21), **חובה לבצע ארכוב תקשורת וקידום SSOT** לפני מעבר לבאץ' הבא.

### **מתי מתבצע Promotion Gate?**
- ✅ בסיום פיתוח D18 (Brokers Fees)
- ✅ בסיום פיתוח D21 (Cash Flows)
- ✅ לפני אישור סופי של האדריכל
- ✅ לפני פתיחת באץ' הבא

### **תהליך Promotion Gate (5 שלבים):**

#### **שלב 1: איסוף דוחות תקשורת**
1. סריקת `_COMMUNICATION/team_[ID]/` לכל הצוותים המעורבים (20, 30, 40, 50)
2. זיהוי דוחות השלמה רלוונטיים (Field Maps, ADRs, Implementation Reports)

#### **שלב 2: זיקוק ל-SSOT**
1. זיהוי ידע קריטי (החלטות אדריכליות, דפוסים, לקחים)
2. מיפוי ל-`documentation/` לפי קטגוריות:
   - החלטות אדריכליות → `documentation/01-ARCHITECTURE/`
   - מדריכי פיתוח → `documentation/02-DEVELOPMENT/`
   - נהלי עבודה → `documentation/05-PROCEDURES/`

#### **שלב 3: יצירת/עדכון מסמכי SSOT**
1. יצירת מסמך SSOT חדש (אם נדרש)
2. עדכון מסמך SSOT קיים (אם קיים)
3. הוספת מטא-דאטה מלא (`id`, `owner`, `status`, `supersedes`, `last_updated`, `version`)

#### **שלב 4: עדכון אינדקסים**
1. עדכון `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
2. עדכון `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`
3. עדכון אינדקסים ספציפיים (אם רלוונטי)

#### **שלב 5: ארכוב דוחות תקשורת**
1. העברת דוחות תקשורת לארכיון (`_COMMUNICATION/99-ARCHIVE/`)
2. שמירת קישורים ב-SSOT (אם רלוונטי)
3. יצירת Consolidation Report ב-`_COMMUNICATION/team_10/CONSOLIDATION_BATCH_2.md`

### **אחריות:**
- **Team 10 (The Gateway)** הוא הצוות היחיד המורשה לבצע Promotion Gate
- **חובה:** אין מעבר לבאץ' הבא ללא Promotion Gate מלא

**קישור לפרוטוקול:** `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟢 **PHASE 2 - ACTIVE DEVELOPMENT - COMPLETION WITH QA**

**מקורות:**
- `ARCHITECT_PHASE_2_BLOCKER_VERDICT_FINAL.md` - פסיקת האדריכלית
- `TEAM_10_ARCHITECT_VERDICT_IMPLEMENTATION.md` - יישום פסיקת האדריכלית
- `TEAM_10_PHASE_2_BLOCKING_DECISIONS.md` - החלטות חוסמות Phase 2
- `TEAM_10_PHASE_2_COMPREHENSIVE_REQUIREMENTS.md` - דרישות מקיפות
- `TEAM_90_PHASE_2_FINAL_GOVERNANCE_REPORT.md` - דוח Team 90
- `TEAM_50_PHASE_2_QA_FINAL_SUMMARY.md` - סיכום סופי QA

**תשתית מוכנה:**
- ✅ **D21 Infra:** VERIFIED - טבלת `user_data.cash_flows` מאומתת כקיימת ותקינה
- ✅ **Endpoints:** ACTIVE_DEV - `cash_flows/currency_conversions`, `brokers_fees/summary` בפיתוח
- ✅ **Precision:** נעול ל-**NUMERIC(20,6)** לכל השדות הכספיים (SSOT)
- ✅ **שרשרת QA:** הוגדרה - 50 → 90 → G-Lead
- ✅ **Code Hygiene:** No-Logs Policy - פסילה אוטומטית (RED) לכל קובץ עם `console.log` חשוף
- ⏸️ **Manual QA:** דורש השלמה מ-Team 40 (לפי תוכנית העבודה)

**log_entry | [Team 10] | PHASE_2_PLAN | ARCHITECT_VERDICT_IMPLEMENTED | GREEN | 2026-02-07**
