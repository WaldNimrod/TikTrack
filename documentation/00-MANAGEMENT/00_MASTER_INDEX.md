# 🗂️ TikTrack Master Documentation Index

**id:** `D15_MASTER_INDEX`  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - SINGLE SOURCE OF TRUTH**  
**supersedes:** `D15_SYSTEM_INDEX.md`, `PHOENIX_ARCHITECT_MASTER_INDEX.md`, `TT2_MASTER_DOCUMENTATION_INDEX.md`, `SPY_DOCS_INDEX_EXPANDED.md`  
**last_updated:** 2026-01-30  
**version:** v3.9 (קידום ידע באץ' 2 — Consolidation הושלם)

---

## 📢 Executive Summary

זהו האינדקס המאוחד היחיד (SSOT) לכל התיעוד במערכת TikTrack Phoenix. כל האינדקסים האחרים מסומנים כ-DEPRECATED.

**עקרון יסוד:** ה-SSOT וכל נהלי העבודה הם **תקוד קריטי וקבוע** — מחייבים, קבועים, ומתעדכנים רק דרך הנהלים המפורשים (קידום מידע, החלטות אדריכלית). ראה `CURSOR_INTERNAL_PLAYBOOK.md` עקרון יסוד.

**מקור:** Phase 1.7 - Documentation Integrity Mandate (`ARCHITECT_DOCS_INTEGRITY_MANDATE.md`)

---

## 📂 עץ תיקיות (Directory Tree)

```
documentation/
├── 00-MANAGEMENT/          (Management & Master Index)
├── 01-ARCHITECTURE/        (ADRs & Blueprints)
├── 02-DEVELOPMENT/         (Development Guides)
├── 03-PRODUCT_&_BUSINESS/  (Product & Business Logic)
├── 04-DESIGN_UX_UI/        (Design & UX Guidelines)
├── 05-PROCEDURES/          (Operational Procedures)
├── 06-ENGINEERING/         (Engineering & Database)
├── 07-CONTRACTS/           (API Contracts & Schemas)
├── 08-REPORTS/             (Reports & Artifacts)
│   └── artifacts_SESSION_01/
├── 09-GOVERNANCE/          (Governance & Standards)
│   └── standards/
│       ├── PHOENIX_MASTER_BIBLE.md
│       ├── CURSOR_INTERNAL_PLAYBOOK.md
│       ├── TEAM_50_QA_REPORT_TEMPLATE.md
│       ├── TEAM_50_QA_WORKFLOW_PROTOCOL.md
│       └── TEAM_50_QA_TEST_INDEX.md
├── 10-POLICIES/            (Policies & Protocols)
├── 90_Architects_documentation/  (READ ONLY - Architect only)
└── 99-ARCHIVE/             (Archived Files)

_COMMUNICATION/
├── README_COMMUNICATION.md  (long-term reference)
├── team_01/
├── team_02/
├── team_10/                 (The Gateway)
├── team_20/                 (Backend)
├── team_30/                 (Frontend)
├── team_31/                 (Shared Components)
├── team_40/                 (UI/Design)
├── team_50/                 (QA)
├── team_60/                 (DevOps)
├── 90_Architects_communication/  (READ ONLY - Architect only)
└── [staging folders, cursor_messages, etc.]
```

---

## 🚀 מסמכי יסוד (Foundations)

- [📖 PHOENIX_MASTER_BIBLE.md](../09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md) - ספר החוקים המאסטר
- [⚔️ CURSOR_INTERNAL_PLAYBOOK.md](../09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md) - מדריך עבודה פנימי
- [🏛️ PHOENIX_ORGANIZATIONAL_STRUCTURE.md](./PHOENIX_ORGANIZATIONAL_STRUCTURE.md) - מבנה ארגוני
- [🤝 TT2_SLA_TEAMS_30_40.md](../05-PROCEDURES/TT2_SLA_TEAMS_30_40.md) - אמנת שירות צוות 30 (Frontend) ↔ 40 (UI Assets) — Presentational vs Container ✅ **מחייב**
- [📜 TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md](../05-PROCEDURES/TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md) - דרישות מסירת בלופרינט (צוות 31 → 30/40) ✅ **מחייב**
- [📋 TT2_PHASE_2_CLOSURE_WORK_PLAN.md](./TT2_PHASE_2_CLOSURE_WORK_PLAN.md) - תוכנית סגירת Phase 2 (4 שלבים: Debt Closure → Phase Closure → Team 90 Gate B → G-Lead) ✅ **פעיל**
- [🏰 ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md](./ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md) - מנדט אדריכל מאוחד (ADR-010) ✅ **SSOT**
- [📋 TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md](./TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md) - מידע משלים נדרש לסגירת משימות ב-100% (ללא ניחושים)

---

## 📌 ניהול גרסאות (ADR-016) — Versioning Policy

- [📜 TT2_VERSIONING_POLICY.md](../10-POLICIES/TT2_VERSIONING_POLICY.md) - **נוהל משילות: ניהול גרסאות אחוד** — חוק Ceiling (תקרת SV), Major/Minor רק באישור G-Lead, Patch/Build אוטומטי ✅ **LOCKED**
- [📊 TT2_VERSION_MATRIX.md](../10-POLICIES/TT2_VERSION_MATRIX.md) - מטריצת גרסאות נוכחית (System, API, DB, UI, Routes) + מיקומי גרסה בקוד
- [📋 TT2_VERSIONING_PROCEDURE.md](../05-PROCEDURES/TT2_VERSIONING_PROCEDURE.md) - נוהל מימוש: תוכנית הטמעה, **יישום יציב** (מקורות יחידים, checklist שחרור, קובץ VERSION), בדיקת תאימות ע"י Team 90

---

## 🧪 נוהלי QA (Team 50 & Team 51)

- [📜 TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md](../05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md) - פרוטוקול שערי איכות (שער א' 50 / שער ב' 90 / שער ג' G-Lead — אישור ויזואלי בפועל אצלו בלבד; אין צילומי מסך) ✅ **מחייב**
- [📋 דרישות אישור עיצוב](../../_COMMUNICATION/team_10/TEAM_10_DESIGN_APPROVAL_AND_FIDELITY_REQUIREMENTS.md) - דיוקי עיצוב ותיקוני עיצוב — **תמיד מול G-Lead**; האדריכלית אינה רואה את הממשק ✅ **מחייב**
- [💾 ARCHITECT_DATA_MANAGEMENT_SOP_011.md](../05-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md) - SOP-011 ניהול נתוני סביבה (Seeding) ✅ **SSOT**
- [🧪 TEAM_50_QA_WORKFLOW_PROTOCOL.md](../09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md) - נוהל עבודה לבדיקות QA (Code Review → Selenium → Visual Validation)
- [📋 TEAM_50_QA_REPORT_TEMPLATE.md](../09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md) - תבנית דוח QA סטנדרטית
- [📊 TEAM_50_QA_TEST_INDEX.md](../09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md) - אינדקס בדיקות QA מפורט
- [👤 QA Test User Seed (README)](../../scripts/README_SEED_QA_USER.md) - משתמש QA קבוע ל-Gate B Runtime/E2E (TikTrackAdmin / 4181); הרצת `python3 scripts/seed_qa_test_user.py` אחרי איפוס DB ✅ **תעוד קבוע**
- [📋 TT2_QA_SEED_USER_PROCEDURE.md](../05-PROCEDURES/TT2_QA_SEED_USER_PROCEDURE.md) - נוהל קצר + הפניה ל-README המלא
- ⚠️ **TEAM_51_ONBOARDING_COMPREHENSIVE.md** - חבילת אונבורדינג מקיפה לצוות 51 (QA Remote) - נמצא ב-`_COMMUNICATION/team_51/` (לא SSOT - Communication בלבד)

---

## 🏗️ תשתיות (Infrastructure)

- [🏗️ TT2_INFRASTRUCTURE_GUIDE.md](../01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md) - מדריך מקיף לתשתיות המערכת (Frontend, Backend, Database, Environment, Deployment)
- [🔐 TT2_DATABASE_CREDENTIALS.md](../01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md) - הגדרת Database Credentials (שם DB, משתמש, הוראות הגדרה)
- [👤 QA Test User Seed](../../scripts/README_SEED_QA_USER.md) - סקריפט Seed למשתמש QA קבוע (Gate B Runtime/E2E); הרצה אחרי DB reset
- [🏛️ TT2_MASTER_BLUEPRINT.md](../01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md) - Master Blueprint (Stack, IDs, Time, Design, Ports)

---

## 🧱 ארכיטקטורת LEGO מודולרית (LEGO Modular Architecture)

- [🧱 TT2_SECTION_ARCHITECTURE_SPEC.md](../01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md) - LEGO System Spec (TtSection > TtSectionRow > TtSectionCol)
- [🧱 TT2_BACKEND_LEGO_SPEC.md](../01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md) - Backend LEGO Architecture (Atoms → Molecules → Organisms/Modular Cubes)
- [📦 TT2_BACKEND_CUBE_INVENTORY.md](../01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md) - אינוונטר קוביות Backend (17 קוביות)
- [📊 TT2_TABLES_REACT_FRAMEWORK.md](../01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md) - מערכת טבלאות React (PhoenixTable, PhoenixFilterContext, Hooks, Transformation Layer) ✅ **As Made**
- [🏗️ תוכנית CSS & Blueprint Refactor V2](../02-DEVELOPMENT/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md) - תוכנית בנייה מחדש לפי ארכיטקטורת LEGO מודולרית ✅ **SSOT**
- [🔍 בדיקת התאמה לארכיטקטורת LEGO](../02-DEVELOPMENT/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md) - בדיקת התאמה לארכיטקטורה מודולרית ✅ **SSOT**

---

## 🔄 Routes SSOT & Data Transformation

- [🗺️ Routes SSOT (routes.json v1.1.2)](../../ui/public/routes.json) - מקור אמת יחיד לנתיבי המערכת (Frontend: 8080, Backend: 8082, Routes Hierarchy) ✅ **P1 Complete**
- [🔄 Transformers Hardened v1.2](../../ui/src/cubes/shared/utils/transformers.js) - המרת נתונים מוקשחת עם המרת מספרים כפויה לשדות כספיים (`transformers.js` - לא `FIX_transformers.js`) ✅ **P2 Complete**
- [🔗 Bridge Integration](../../ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx) - חיבור React Context ל-PhoenixBridge עם Listener ל-`phoenix-filter-change` event ✅ **P1 Complete**

---

## 🏗️ Core Systems - Phase 1.8 (Infrastructure Retrofit)

**סטטוס:** ✅ **COMPLETE - SYSTEM STABLE** (2026-02-07)

### **UAI (Unified App Init) - Lifecycle Engine** ✅
- [🔧 TT2_UAI_CONFIG_CONTRACT.md](../01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md) - JSON Schema Contract מחייב לכל עמוד (pageType, dataLoader, tables, lifecycle hooks) ✅ **SSOT - Phase 1.8**
- [🔧 UAI Core Files](../../ui/src/components/core/UnifiedAppInit.js) - UnifiedAppInit.js + 5 Stages (DOM, Bridge, Data, Render, Ready) ✅ **STABLE**

### **PDSC (Phoenix Data Service Core) - Hybrid Architecture** ✅
- [🤝 TT2_PDSC_BOUNDARY_CONTRACT.md](../01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md) - Shared Boundary Contract בין Backend (Source of Truth) ל-Frontend (Implementation) ✅ **SSOT - Phase 1.8**
- [🔧 PDSC Client](../../ui/src/components/core/Shared_Services.js) - Shared_Services.js - Unified API client עם routes.json SSOT ✅ **STABLE**

### **EFR (Entity Field Renderer) - Field Mapping & Rendering** ✅
- [📊 TT2_EFR_LOGIC_MAP.md](../01-ARCHITECTURE/TT2_EFR_LOGIC_MAP.md) - SSOT Field Mapping Table (Backend snake_case → Frontend camelCase → EFR Renderer) ✅ **SSOT - Phase 1.8**
- [🔒 TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md](../01-ARCHITECTURE/TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md) - Lock Specification על transformers.js v1.2 כבסיס היחיד להמרת נתונים ✅ **SSOT - Phase 1.8**

### **CSS Load Verification - DNA Variables Enforcement** ✅
- [✅ TT2_CSS_LOAD_VERIFICATION_SPEC.md](../01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md) - CSS Load Order Verification (phoenix-base.css ראשון, משתנים קריטיים) ✅ **SSOT - Phase 1.8**
- [🔧 CSS Load Verifier](../../ui/src/components/core/cssLoadVerifier.js) - CSSLoadVerifier class - אכיפת סדר טעינה ב-DOMStage ✅ **STABLE**

---

## 🎨 עיצוב ו-Fidelity (Design & Fidelity)

- [🎨 TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md](../09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md) - נוהל תיקון בעיות fidelity מול Blueprint (מתי ואיך לתקן)
- [📐 CONTAINER_HEADER_STRUCTURE_GUIDELINES.md](../04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md) - הנחיות מבנה כותרות קונטיינרים (3 חלקים, גובה קבוע)
- [🎯 UNIFIED_HEADER_SPECIFICATION.md](../04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md) - מפרט טכני מפורט של אלמנט ראש הדף
- [📚 SYSTEM_WIDE_DESIGN_PATTERNS.md](../04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md) - תובנות מערכתיות ומבנים כלליים (תבנית עמוד, קונטיינרים, כרטיסים, **פוטר מודולרי**, פונטים, צבעים)
- [🗂️ CSS_CLASSES_INDEX.md](../04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md) - אינדקס מחלקות CSS - מפה למפתח לשימוש חוזר ולמניעת כפילויות
- [📋 CSS_LOADING_ORDER.md](../04-DESIGN_UX_UI/CSS_LOADING_ORDER.md) - מדריך מפורט לסדר טעינת CSS (ITCSS, סדר טעינה קריטי, דוגמאות שימוש, בעיות נפוצות) 🔴 **CRITICAL**
- [📊 DASHBOARD_WIDGETS_GUIDE.md](../04-DESIGN_UX_UI/DASHBOARD_WIDGETS_GUIDE.md) - מדריך מקיף לדשבורד וויגיטים - מבנה, עיצוב, פונקציונליות, וכל הדיוקים שבוצעו
- [📜 TT2_RESPONSIVE_FLUID_DESIGN.md](../04-DESIGN_UX_UI/TT2_RESPONSIVE_FLUID_DESIGN.md) - אמנת רספונסיביות דינמית (Fluid Design, ללא media queries) 🛡️ **MANDATORY**
- [🎨 DNA_COLOR_PALETTE_DOCUMENTATION.md](../01-ARCHITECTURE/DNA_COLOR_PALETTE_DOCUMENTATION.md) - תיעוד מקיף לפלטת הצבעים DNA (63 משתנים, מבנה, פילוסופיה, מימוש, מיפוי Apple Colors) ✅ **SSOT**
- [🔘 DNA_BUTTON_SYSTEM.md](../04-DESIGN_UX_UI/DNA_BUTTON_SYSTEM.md) - מערכת כפתורים DNA (SSOT) ✅ **Batch 1+2**
- [🎨 DNA_PALETTE_SSOT.md](../04-DESIGN_UX_UI/DNA_PALETTE_SSOT.md) - פלטת צבעים DNA — SSOT רשמי ✅ **Batch 1+2**
- [🏰 ARCHITECT_MODULE_MENU_STYLING_SSOT.md](../09-GOVERNANCE/ARCHITECT_MODULE_MENU_STYLING_SSOT.md) - החלטה אדריכלית: עיצוב מודולים ותפריט (RTL כפתורים, צבעי כותרת לפי ישות, מודול דוגמה כסטנדרט) ✅ **SSOT — Batch 1+2**

---

## ✅ ולידציה וטפסים (Validation & Forms)

- [🎯 TT2_FORM_VALIDATION_FRAMEWORK.md](../10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md) - תשתית ולידציה מרכזית לכל הטפסים במערכת (PhoenixSchema, Error Handling, Client + Server Validation)
- [📘 TT2_VALIDATION_DEVELOPER_GUIDE.md](../02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md) - מדריך מפורט למפתחים עתידיים (יצירת Schemas, Error Handling, Best Practices)

---

## 📊 מטריצת עמודים מרכזית (Official Page Tracker)

- [📊 TT2_OFFICIAL_PAGE_TRACKER.md](../01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md) - מטריצה מרכזית למעקב התקדמות כל העמודים במערכת (מחויב על ידי האדריכלית, מתוחזק על ידי Team 10) ✅ **Batch 2 CLOSED 2026-02-12**
- [📚 Consolidation Batch 2 (פיננסי)](../../_COMMUNICATION/team_10/CONSOLIDATION_BATCH_2.md) - דוח קידום ידע באץ' 2; שער א'+ב' נסגרו; ארכיון `_COMMUNICATION/99-ARCHIVE/2026-02-12/` ✅ **2026-02-12**
- [📌 TT2_DECISION_PROFILE_ROUTE.md](../01-ARCHITECTURE/TT2_DECISION_PROFILE_ROUTE.md) - החלטה: /profile טיפוס C (Auth-only) — מקודם מבאץ' 2 ✅ **SSOT**
- [📌 TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md](../01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md) - SSOT: A/B/C/D, Header Persistence, ProtectedRoute — מקודם מבאץ' 2 ✅ **SSOT**

---

## 🛡️ הנחיות אדריכליות (Architect Guidelines)

- [🛡️ PHOENIX_MASTER_BIBLE](../09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md) - ספר החוקים המאסטר (ריענון נהלים v1.5 + Final Governance Lock v2.0 + Batch 1 Closure Mandate) 🛡️ **MANDATORY**
- [🛡️ ריענון נהלים ומשמעת אדריכלית v1.5](../09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md#3-ריענון-נהלים-ומשמעת-אדריכלית-v15--חובה) - הנחיות מחייבות מהאדריכלית (ניהול קבצים, G-Bridge, Transformation Layer)
- [🛡️ Final Governance Lock v2.0](../09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md#6-final-governance-lock-v20--mandatory) - נעילה ארכיטקטונית כוללת (מבנה תיקיות, Fluid Design, Design Tokens, משמעת סקריפטים) 🛡️ **FINAL LOCK**
- [🛡️ הגדרות תפקיד ומשילות לכל צוות](../09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md#5-הגדרות-תפקיד-ומשילות-לכל-צוות--batch-1-closure-mandate) - הגדרות תפקיד ומשילות לכל צוות (Batch 1 Closure Mandate) 🛡️ **MANDATORY - FOUNDATION SEAL**
- [🏰 ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md](../09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md) - החלטות רספונסיביות טבלאות (Option D) ✅ **SSOT**
- [🏰 ARCHITECT_MODULE_MENU_STYLING_SSOT.md](../09-GOVERNANCE/ARCHITECT_MODULE_MENU_STYLING_SSOT.md) - החלטה אדריכלית: Module/Menu Styling (RTL כפתורים, צבעי כותרת לפי ישות, מודול דוגמה) ✅ **SSOT — Batch 1+2**
- [📋 TT2_SYSTEM_STATUS_VALUES_SSOT.md](../09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md) - סטטוסים מערכתיים (active/inactive/pending/cancelled + פתוח/סגור/ממתין/מבוטל) — רשימת סטטוסים מרכזית לכל הישויות ✅ **SSOT**
- [📋 TT2_STATUS_VALUES_CODE_MAP.md](../02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md) - מיפוי מקומות בקוד הדורשים עדכון לפי סטטוסים (header, filters, DataLoader)
- ⚠️ **החלטות אדריכליות נוספות** - נמצאות ב-`_COMMUNICATION/90_Architects_comunication/` (לא SSOT - Communication בלבד):
  - `ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md` - פוטר מודולרי
  - `ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - Final Governance Lock
  - `ARCHITECT_RESPONSIVE_CHARTER.md` - אמנת רספונסיביות
  - `ARCHITECT_BATCH_1_FINAL_SUMMARY.md` - Batch 1 Closure

---

## 🔄 תהליכי פיתוח (Development Processes)

- [🔄 CSS & Blueprint Refactor V2 - תוכנית בנייה מחדש](../02-DEVELOPMENT/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md) - תוכנית מלאה לבנייה מחדש לפי ארכיטקטורת LEGO מודולרית (⚠️ כלל ברזל: אין סקריפטים בתוך העמוד) ✅ **SSOT**
- [📋 תהליך עבודה עם בלופרינטים](../05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md) - תהליך עבודה מעודכן v2.0 עם checklist לבדיקת CSS ו-DOM ✅ **SSOT**
- [📚 פרוטוקול קידום ידע (Knowledge Promotion Protocol)](../05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md) - נוהל Consolidation: זיקוק דוחות תקשורת למסמכי SSOT (Team 10 בלבד רשאי לכתוב ל-`documentation/`) ✅ **SSOT - ACTIVE**
- [🚀 תוכנית מימוש Phase 2 (Financial Core)](../01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md) - תוכנית מימוש מלא לחבילה 2: Financial Core (D16, D18, D21) ✅ **SSOT - LOCKED**
- [📡 הודעה מרוכזת Phase 2 לכל הצוותים](../01-ARCHITECTURE/TT2_PHASE_2_ALL_TEAMS_MANDATE.md) - הודעה מרוכזת לכל הצוותים: חיזוק משילות, חובת למידה חוזרת, משימות ראשונות ✅ **SSOT - LOCKED**
- [📊 סיכום Phase 2 Release](../08-REPORTS/TT2_PHASE_2_RELEASE_SUMMARY.md) - סיכום Phase 2 Release: הושלם בהצלחה, רשימת עמודים, משימות לכל צוות ✅ **SSOT - ACTIVE**

---

## 🔒 Architect Mandate Implementation Status

**Last Updated:** 2026-02-05

### **P0/P1/P2 Complete:**
- ✅ **Port Unification:** Frontend (8080), Backend (8082)
- ✅ **Routes SSOT:** `routes.json` v1.1.2
- ✅ **Transformers Hardened:** v1.2 (Forced number conversion for financial fields)
- ✅ **Bridge Integration:** HTML Shell ↔ React Content
- ✅ **Security:** Masked Log (Token leakage prevention)
- ✅ **Scripts Policy:** Hybrid Scripts Policy (Allowed `<script src>`, Forbidden inline)
- ✅ **Naming Resolution:** Plural enforcement (trades, trading_accounts)
- ✅ **Drift Fix:** trade_plans reverted per DB schema

### **Batch Status:**
- ✅ **Batch 1:** Identity & Auth - COMPLETE (2026-02-02)
- 🟢 **Batch 2:** Financial Core - PHASE 2 RELEASED (2026-02-06)

---

## 📋 סטטוס נוכחי

### 🚀 סטטוס סשן נוכחי: SESSION_01 (🟢 OPEN)
### 🛡️ הנחיות אדריכליות: v1.5 (✅ ACKNOWLEDGED & IMPLEMENTED)
### 🎉 Batch 1 Status: ✅ **COMPLETE END-TO-END** (2026-02-02)
### 🛡️ Team Roles: ✅ **DEFINED & MANDATORY** (Batch 1 Closure Mandate)
### 🛠️ Infrastructure Tools: ✅ **COMPLETE** (2026-02-02) - כלי בדיקה ותיעוד מוכנים
### 🔒 Architect Mandate Implementation: ✅ **P0/P1/P2 COMPLETE** (2026-02-04)
  - ✅ **P0:** Port Unification (8080/8082), Proxy Fix, Scripts Policy
  - ✅ **P1:** Routes SSOT (routes.json v1.1.2), Security Masked Log, State SSOT (Bridge Integration)
  - ✅ **P2:** FIX Files (transformers.js Hardened v1.2), D16 Cleanup, Documentation Update
### 📚 Documentation Integrity: ✅ **PHASE 1.7 COMPLETE** (2026-02-05)
  - ✅ **Unified Index:** `00_MASTER_INDEX.md` is now SSOT
  - ✅ **Deprecated Indexes:** All other indexes marked as DEPRECATED and archived
  - ✅ **Archive Location:** `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/` and `_COMMUNICATION/99-ARCHIVE/deprecated_indexes_phase_1.7/`
### 🏗️ Phase 1.8 Infrastructure Retrofit: ✅ **COMPLETE** (2026-02-07)
  - ✅ **Core Systems:** UAI, PDSC, EFR, CSS Verification - כל המערכות יציבות
  - ✅ **Knowledge Promotion:** 5 Specs הועברו ל-SSOT (`documentation/01-ARCHITECTURE/`)
  - ✅ **System Status:** STABLE - מוכן ל-Phase 2 Active Development
  - ✅ **Page Tracker:** עודכן ל-v3.6 (Phase 2 Active Development)
### 🧭 Gate B (Contract↔Runtime): ✅ **GREEN** (2026-02-09)
  - ✅ **סגירה:** Team 90 — ריצה מלאה לפי SOP-010 (Runtime + E2E, 0 SEVERE)
  - 📄 **סטטוס תהליך (SSOT):** [GATE_B_STATUS.md](../05-REPORTS/GATE_B_STATUS.md)
  - 📁 **ארטיפקטים:** [documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/](../05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/) — דוח חתום, screenshots, logs, test_summary

---

## 📁 דוחות ו-Gate B (Reports & Artifacts)

- [🧭 GATE_B_STATUS.md](../05-REPORTS/GATE_B_STATUS.md) - סטטוס Gate B (GREEN) + קישורים לארטיפקטים ✅ **SSOT**
- [✅ TEAM_50_GATE_B_SIGNED_QA_REPORT.md](../05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/TEAM_50_GATE_B_SIGNED_QA_REPORT.md) - דוח QA חתום (Phase 2 E2E)
- **תיקיית ארטיפקטים:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/` — console_logs, network_logs, test_summary, screenshots (D16, D18, D21)

---

## ⚠️ אינדקסים מבוטלים (Deprecated Indexes)

**הערה חשובה:** כל האינדקסים הבאים מסומנים כ-DEPRECATED והועברו לארכיון. השתמשו רק ב-`00_MASTER_INDEX.md` כמקור האמת היחיד.

- ❌ `documentation/D15_SYSTEM_INDEX.md` - **DEPRECATED & ARCHIVED** → `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/D15_SYSTEM_INDEX.md`
- ❌ `documentation/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md` - **DEPRECATED & ARCHIVED** → `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/PHOENIX_ARCHITECT_MASTER_INDEX.md`
- ❌ `documentation/10-POLICIES/TT2_MASTER_DOCUMENTATION_INDEX.md` - **DEPRECATED & ARCHIVED** → `documentation/99-ARCHIVE/deprecated_indexes_phase_1.7/TT2_MASTER_DOCUMENTATION_INDEX.md`
- ❌ `_COMMUNICATION/team_90/SPY_DOCS_INDEX_EXPANDED.md` - **DEPRECATED & ARCHIVED** → `_COMMUNICATION/99-ARCHIVE/deprecated_indexes_phase_1.7/SPY_DOCS_INDEX_EXPANDED.md`

---

## 📚 טקסונומיה קשיחה (Hard Taxonomy)

לפי פקודת האדריכל (`ARCHITECT_DOCS_INTEGRITY_MANDATE.md`):

1. **01-ARCHITECTURE:** החלטות (ADRs) ובלופרינטים
2. **09-GOVERNANCE:** פרוטוקולים מחייבים (RTL, DNA)
3. **_COMMUNICATION:** טיוטות ודיווחים בלבד. לעולם לא SSOT

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-01-30  
**סטטוס:** 🔒 **SSOT - SINGLE SOURCE OF TRUTH**

**log_entry | [Team 10] | PROCESS_FORMALIZATION | MASTER_INDEX_UPDATED | 2026-02-09**  
**log_entry | [Team 10] | ADR_016_VERSIONING_INDEX_AND_PROCEDURE | 2026-01-30**
