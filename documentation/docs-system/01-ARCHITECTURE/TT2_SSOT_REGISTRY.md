# 📚 SSOT Registry - רישום נכסים משותפים

**id:** `TT2_SSOT_REGISTRY`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-07  
**version:** v1.1 (Phase 1.8 - Core Systems Added)

---

## 📢 Executive Summary

מרשם מרכזי של כל הנכסים המשותפים (Shared Assets) במערכת. כל קובץ ברשימה זו הוא מקור אמת (SSOT) ויש להשתמש בו בלבד.

**⚠️ חובה:** כל שימוש בנכסים משותפים חייב להיות מהרשימה הזו בלבד.

---

## 🎯 Header Handlers - Core Assets

### **1. `phoenixHeaderHandlersBase.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/phoenixHeaderHandlersBase.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת לכל ה-handlers)

**תיאור:** קובץ ליבה משותף לכל ה-handlers של header filters. כולל פונקציות משותפות:
- `initFilterCloseButtons()` - סגירת תפריטי פילטרים
- `initSearchClearButton()` - ניקוי שדה חיפוש
- `initFilterResetButton()` - איפוס פילטרים
- `initFilterClearButton()` - ניקוי פילטרים
- `initLucideIcons()` - אתחול אייקונים

**שימוש:**
- כל עמוד חייב להשתמש ב-`PhoenixHeaderHandlersBase.init(config)`
- קונפיגורציה ייעודית בקובץ נפרד (למשל: `brokersFeesHeaderConfig.js`)

**גרסה:** v1.0.0 (Header Unification Mandate)

---

### **2. `baseDataLoader.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/baseDataLoader.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת לטעינת נתונים)

**תיאור:** קובץ ליבה משותף לטעינת נתונים מ-API עם שימוש ב-Hardened Transformers.

**תכונות:**
- טעינת `routes.json` (SSOT)
- שימוש ב-`transformers.js` המרכזי בלבד
- פונקציות: `getApiBaseUrl()`, `getAuthHeader()`, `fetchData()`

**שימוש:**
- כל DataLoader חייב להשתמש ב-`BaseDataLoader`
- מניעת כפילויות ו-Drift

**גרסה:** v1.0.0 (Header Unification Mandate)

---

## 🔧 Transformers - Core Assets

### **3. `transformers.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/cubes/shared/utils/transformers.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת להמרות נתונים)

**תיאור:** קובץ מרכזי להמרת נתונים (snake_case ↔ camelCase, המרת מספרים כפויה).

**גרסה:** v1.2 (Hardened)

**⚠️ אסור:** יצירת Transformers מקומיים או שימוש ב-`FIX_transformers.js` (דפרקטי).

---

## 🛣️ Routes - Core Assets

### **4. `routes.json`** ✅ **SSOT - CORE**

**מיקום:** `routes.json` (root)

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת לנתיבי API)

**תיאור:** קובץ מרכזי להגדרת כל נתיבי ה-API.

**גרסה:** v1.1.2

**⚠️ אסור:** יצירת routes hardcoded או מקומיים.

---

## 🎨 Header Components - Core Assets

### **5. `headerFilters.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/headerFilters.js`

**סטטוס:** 🔒 **SSOT - CORE**

**תיאור:** טיפול ב-toggle של פילטרים ב-header.

**גרסה:** v2.0.0

---

### **6. `headerDropdown.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/headerDropdown.js`

**סטטוס:** 🔒 **SSOT - CORE**

**תיאור:** טיפול ב-dropdowns של header.

**גרסה:** v2.0.0

---

### **7. `phoenixFilterBridge.js`** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/phoenixFilterBridge.js`

**סטטוס:** 🔒 **SSOT - CORE**

**תיאור:** Bridge בין React (PhoenixFilterContext) ו-Vanilla JS (Header HTML).

**גרסה:** v2.0.0

---

## 🏗️ Core Systems - Phase 1.8 (Infrastructure Retrofit)

### **8. UnifiedAppInit.js** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/UnifiedAppInit.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת ל-UAI Lifecycle)

**תיאור:** Controller ראשי לניהול Lifecycle של עמודים ב-5 שלבים (DOM → Bridge → Data → Render → Ready).

**גרסה:** v1.0.0

**Spec:** [TT2_UAI_CONFIG_CONTRACT.md](./TT2_UAI_CONFIG_CONTRACT.md)

---

### **9. Shared_Services.js (PDSC Client)** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/Shared_Services.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת ל-PDSC Client)

**תיאור:** Unified API client עם routes.json SSOT, transformers.js v1.2, error handling לפי PDSC Schema.

**גרסה:** v1.0.0

**Spec:** [TT2_PDSC_BOUNDARY_CONTRACT.md](./TT2_PDSC_BOUNDARY_CONTRACT.md)

---

### **10. cssLoadVerifier.js** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/cssLoadVerifier.js`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת ל-CSS Load Verification)

**תיאור:** CSS Load Order Verification - וידוא ש-phoenix-base.css נטען ראשון ומשתני CSS זמינים.

**גרסה:** v1.1.0

**Spec:** [TT2_CSS_LOAD_VERIFICATION_SPEC.md](./TT2_CSS_LOAD_VERIFICATION_SPEC.md)

---

### **11. UAI Stages** ✅ **SSOT - CORE**

**מיקום:** `ui/src/components/core/stages/`

**סטטוס:** 🔒 **SSOT - CORE** (מקור אמת ל-UAI Stages)

**קבצים:**
- `DOMStage.js` - Stage 1: DOM Ready + CSS Verification
- `BridgeStage.js` - Stage 2: PhoenixBridge Initialization
- `DataStage.js` - Stage 3: Data Loading (PDSC Client)
- `RenderStage.js` - Stage 4: UI Rendering
- `ReadyStage.js` - Stage 5: Finalization
- `StageBase.js` - Base class לכל השלבים

**גרסה:** v1.0.0

**Spec:** [TT2_UAI_CONFIG_CONTRACT.md](./TT2_UAI_CONFIG_CONTRACT.md)

---

## 📋 Page-Specific Configurations

### **D18 - Brokers Fees**

**קובץ Config:** `ui/src/views/financial/brokersFees/brokersFeesPageConfig.js`

**סטטוס:** ✅ **COMPLETE** (Phase 1.8)

**תיאור:** UAI Page Config ל-D18. משתמש ב-UAI Engine + PDSC Client.

---

### **D21 - Cash Flows**

**קובץ Config:** `ui/src/views/financial/cashFlows/cashFlowsPageConfig.js`

**סטטוס:** ✅ **COMPLETE** (Phase 1.8)

**תיאור:** UAI Page Config ל-D21. משתמש ב-UAI Engine + PDSC Client.

---

### **D16 - Trading Accounts**

**קובץ Config:** `ui/src/views/financial/tradingAccounts/tradingAccountsPageConfig.js`

**סטטוס:** ✅ **COMPLETE** (Phase 1.8)

**תיאור:** UAI Page Config ל-D16. משתמש ב-UAI Engine + PDSC Client.

---

## ⚠️ כללי אכיפה

### **1. שימוש ב-SSOT בלבד**
- ❌ **אסור:** יצירת נכסים משותפים חדשים ללא אישור
- ✅ **חובה:** שימוש בנכסים מהרשימה הזו בלבד

### **2. Core + Config Model**
- ❌ **אסור:** לוגיקה משותפת בקובץ ייעודי
- ✅ **חובה:** כל לוגיקה משותפת ב-Core, קונפיגורציה ייעודית בקובץ נפרד

### **3. עדכון Registry**
- ✅ **חובה:** עדכון רשימה זו בכל יצירת נכס משותף חדש
- ✅ **חובה:** עדכון גרסה בכל שינוי בנכס קיים

---

## 📊 עדכונים אחרונים

**2026-02-07 (Phase 1.8 Complete):**
- ✅ הוספת Core Systems (UAI, PDSC Client, CSS Verification)
- ✅ הוספת UAI Stages (5 stages + StageBase)
- ✅ הוספת Page Configs (D16, D18, D21)
- ✅ עדכון Specs (TT2_UAI_CONFIG_CONTRACT, TT2_PDSC_BOUNDARY_CONTRACT, TT2_CSS_LOAD_VERIFICATION_SPEC)

**2026-02-06:**
- ✅ יצירת Registry (Header Unification Mandate)
- ✅ הוספת `phoenixHeaderHandlersBase.js` (SSOT - CORE)
- ✅ הוספת `baseDataLoader.js` (SSOT - CORE)

---

## 🔗 קישורים רלוונטיים

- **Header Unification Mandate:** `_COMMUNICATION/_Architects_Decisions/ARCHITECT_HEADER_UNIFICATION_MANDATE.md`
- **תוכנית מימוש (ארכיון):** `archive/documentation_legacy/snapshots/2026-02-18_0200/documentation/docs-system/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`
- **Page Tracker:** `documentation/docs-system/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔒 **SSOT - ACTIVE**

**log_entry | [Team 10] | SSOT_REGISTRY | PHASE_1_8_UPDATED | GREEN | 2026-02-07**
