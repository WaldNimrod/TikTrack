# 🗂️ TikTrack Master Documentation Index (D15)
**Last Updated:** 2026-02-01
**Status:** ✅ **REORGANIZED & UNIFIED - FOLDER STRUCTURE FIXED - ARCHITECT GUIDELINES v1.5 - VALIDATION FRAMEWORK COMPLETE - TEAM 51 ONBOARDED - MODULAR FOOTER APPROVED - LEGO REFACTOR PLAN V2**
**Version:** v2.5 (Post-Reorganization + Architect Guidelines + Validation Framework + Team 51 + Modular Footer + LEGO Refactor Plan V2)

---
## 📂 עץ תיקיות (Directory Tree)
```
documentation/
├── 00-MANAGEMENT/
├── 01-ARCHITECTURE/
├── 02-DEVELOPMENT/
├── 03-PRODUCT_&_BUSINESS/
├── 04-DESIGN_UX_UI/
├── 05-PROCEDURES/
├── 06-ENGINEERING/
├── 07-CONTRACTS/
├── 08-REPORTS/
│   └── artifacts_SESSION_01/
├── 09-GOVERNANCE/
│   └── standards/
│       ├── PHOENIX_MASTER_BIBLE.md
│       ├── CURSOR_INTERNAL_PLAYBOOK.md
│       ├── TEAM_50_QA_REPORT_TEMPLATE.md
│       ├── TEAM_50_QA_WORKFLOW_PROTOCOL.md
│       └── TEAM_50_QA_TEST_INDEX.md
├── 10-POLICIES/
├── 90_Architects_documentation/  (READ ONLY - Architect only)
└── 99-ARCHIVE/

_COMMUNICATION/
├── README_COMMUNICATION.md  (long-term reference)
├── team_01/
├── team_02/
├── team_10/
├── team_20/
├── team_30/
├── team_31/
├── team_40/
├── team_50/
├── team_60/
├── 90_Architects_communication/  (READ ONLY - Architect only)
└── [staging folders, cursor_messages, etc.]
```

---
## 🚀 מסמכי יסוד (Foundations)
- [📖 PHOENIX_MASTER_BIBLE.md](./09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md)
- [⚔️ CURSOR_INTERNAL_PLAYBOOK.md](./09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md)
- [🏛️ PHOENIX_ORGANIZATIONAL_STRUCTURE.md](./00-MANAGEMENT/PHOENIX_ORGANIZATIONAL_STRUCTURE.md)

## 🧪 נוהלי QA (Team 50 & Team 51)
- [🧪 TEAM_50_QA_WORKFLOW_PROTOCOL.md](./09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md) - נוהל עבודה לבדיקות QA (Code Review → Selenium → Visual Validation)
- [📋 TEAM_50_QA_REPORT_TEMPLATE.md](./09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md) - תבנית דוח QA סטנדרטית
- [📊 TEAM_50_QA_TEST_INDEX.md](./09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md) - אינדקס בדיקות QA מפורט
- [🚀 TEAM_51_ONBOARDING_COMPREHENSIVE.md](../_COMMUNICATION/team_51/TEAM_51_ONBOARDING_COMPREHENSIVE.md) - חבילת אונבורדינג מקיפה לצוות 51 (QA Remote)

## 🏗️ תשתיות (Infrastructure)
- [🏗️ TT2_INFRASTRUCTURE_GUIDE.md](./01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md) - מדריך מקיף לתשתיות המערכת (Frontend, Backend, Database, Environment, Deployment)
- [🔐 TT2_DATABASE_CREDENTIALS.md](./01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md) - הגדרת Database Credentials (שם DB, משתמש, הוראות הגדרה)
- [🏛️ TT2_MASTER_BLUEPRINT.md](./01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md) - Master Blueprint (Stack, IDs, Time, Design, Ports)

## 🧱 ארכיטקטורת LEGO מודולרית (LEGO Modular Architecture)
- [🧱 TT2_SECTION_ARCHITECTURE_SPEC.md](./01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md) - LEGO System Spec (TtSection > TtSectionRow > TtSectionCol)
- [🧱 TT2_BACKEND_LEGO_SPEC.md](./01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md) - Backend LEGO Architecture (Atoms → Molecules → Organisms/Modular Cubes)
- [📦 TT2_BACKEND_CUBE_INVENTORY.md](./01-ARCHITECTURE/TT2_BACKEND_CUBE_INVENTORY.md) - אינוונטר קוביות Backend (17 קוביות)
- [🏗️ תוכנית CSS & Blueprint Refactor V2](../_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md) - תוכנית בנייה מחדש לפי ארכיטקטורת LEGO מודולרית
- [🔍 בדיקת התאמה לארכיטקטורת LEGO](../_COMMUNICATION/team_10/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md) - בדיקת התאמה לארכיטקטורה מודולרית

## 🎨 עיצוב ו-Fidelity (Design & Fidelity)
- [🎨 TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md](./09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md) - נוהל תיקון בעיות fidelity מול Blueprint (מתי ואיך לתקן)
- [📐 CONTAINER_HEADER_STRUCTURE_GUIDELINES.md](./04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md) - הנחיות מבנה כותרות קונטיינרים (3 חלקים, גובה קבוע)
- [🎯 UNIFIED_HEADER_SPECIFICATION.md](./04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md) - מפרט טכני מפורט של אלמנט ראש הדף
- [📚 SYSTEM_WIDE_DESIGN_PATTERNS.md](./04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md) - תובנות מערכתיות ומבנים כלליים (תבנית עמוד, קונטיינרים, כרטיסים, **פוטר מודולרי**, פונטים, צבעים)
- [🗂️ CSS_CLASSES_INDEX.md](./04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md) - אינדקס מחלקות CSS - מפה למפתח לשימוש חוזר ולמניעת כפילויות
- [📊 DASHBOARD_WIDGETS_GUIDE.md](./04-DESIGN_UX_UI/DASHBOARD_WIDGETS_GUIDE.md) - מדריך מקיף לדשבורד וויגיטים - מבנה, עיצוב, פונקציונליות, וכל הדיוקים שבוצעו

## ✅ ולידציה וטפסים (Validation & Forms)
- [🎯 TT2_FORM_VALIDATION_FRAMEWORK.md](./10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md) - תשתית ולידציה מרכזית לכל הטפסים במערכת (PhoenixSchema, Error Handling, Client + Server Validation)
- [📘 TT2_VALIDATION_DEVELOPER_GUIDE.md](./02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md) - מדריך מפורט למפתחים עתידיים (יצירת Schemas, Error Handling, Best Practices)

## 📊 מטריצת עמודים מרכזית (Official Page Tracker)
- [📊 TT2_OFFICIAL_PAGE_TRACKER.md](./01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md) - מטריצה מרכזית למעקב התקדמות כל העמודים במערכת (מחויב על ידי האדריכלית, מתוחזק על ידי Team 10)

## 🛡️ הנחיות אדריכליות (Architect Guidelines)
- [🛡️ ריענון נהלים ומשמעת אדריכלית v1.5](./09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md#3-ריענון-נהלים-ומשמעת-אדריכלית-v15--חובה) - הנחיות מחייבות מהאדריכלית (ניהול קבצים, G-Bridge, Transformation Layer)
- [🛡️ פוטר מודולרי - אסטרטגיה מאושרת](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md) - החלטה אדריכלית על פוטר מודולרי (Shared Component) - Team 31

## 🔄 תהליכי פיתוח (Development Processes)
- [🔄 CSS & Blueprint Refactor V2 - תוכנית בנייה מחדש](../_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md) - תוכנית מלאה לבנייה מחדש לפי ארכיטקטורת LEGO מודולרית (⚠️ כלל ברזל: אין סקריפטים בתוך העמוד)
- [📡 הודעה מרוכזת - LEGO Refactor Plan V2](../_COMMUNICATION/team_10/TEAM_10_TO_ALL_TEAMS_LEGO_REFACTOR_PLAN_V2.md) - הודעה מרוכזת לכל הצוותים
- [📡 הודעה ל-Team 30 - LEGO Refactor V2](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_LEGO_REFACTOR_V2.md) - הודעה ספציפית ל-Team 30
- [📡 הודעה ל-Team 40 - LEGO Refactor V2](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_LEGO_REFACTOR_V2.md) - הודעה ספציפית ל-Team 40
- [📡 הודעה ל-Team 31 - LEGO Refactor V2](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_31_LEGO_REFACTOR_V2.md) - הודעה ספציפית ל-Team 31 (תפקיד מעודכן)
- [📡 תשובות והבהרות ל-Team 31](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_31_ANSWERS_AND_CLARIFICATIONS.md) - תשובות מפורטות לשאלות Team 31 (מבנה קוביות, תהליך תיאום, מתי להתחיל)
- [📡 הודעה ל-Team 50 - דרישות ולידציה](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_VALIDATION_REQUIREMENTS.md) - דרישות ולידציה מקיפה לכל האפיונים והתקנים
- [📡 בקשה להחלטות אדריכליות](../_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_ARCHITECTURAL_DECISIONS_REQUEST.md) - שאלות קריטיות שדורשות החלטה אדריכלית (מבנה תיקיות, Design Tokens, תזמון) ✅ **RESOLVED**
- [📡 סיכום ביקורת צוותים](../_COMMUNICATION/team_10/TEAM_10_TEAMS_REVIEW_SUMMARY.md) - סיכום ביקורת Team 30 ו-Team 40 על התוכנית
- [📡 תשובות זמניות ל-Team 30 & 40](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_40_INTERIM_ANSWERS.md) - תשובות זמניות לשאלות שניתן לענות עליהן לפני החלטות אדריכליות
- [🛡️ החלטות אדריכליות - LEGO Cubes](../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES.md) - החלטות סופיות על ארכיטקטורת קוביות 🛡️ **MANDATORY**
- [📡 יישום החלטות אדריכליות](../_COMMUNICATION/team_10/TEAM_10_ARCHITECT_DECISIONS_IMPLEMENTATION.md) - מסמך יישום החלטות האדריכלית
- [📡 עדכון ל-Team 30 - החלטות אדריכליות](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_ARCHITECT_DECISIONS_UPDATE.md) - עדכון מבנה תיקיות והעברות נדרשות 🛡️
- [📡 עדכון ל-Team 40 - החלטות אדריכליות](../_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_ARCHITECT_DECISIONS_UPDATE.md) - אישור סופי על תיקוני CSS 🛡️

---
### 🚀 סטטוס סשן נוכחי: SESSION_01 (🟢 OPEN)
### 🛡️ הנחיות אדריכליות: v1.5 (✅ ACKNOWLEDGED & IMPLEMENTED)