# 🗂️ TikTrack Master Documentation Index (D15)
**Last Updated:** 2026-02-01
**Status:** ✅ **REORGANIZED & UNIFIED - FOLDER STRUCTURE FIXED - ARCHITECT GUIDELINES v1.5 - VALIDATION FRAMEWORK COMPLETE**
**Version:** v2.2 (Post-Reorganization + Architect Guidelines + Validation Framework)

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

## 🧪 נוהלי QA (Team 50)
- [🧪 TEAM_50_QA_WORKFLOW_PROTOCOL.md](./09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md) - נוהל עבודה לבדיקות QA (Code Review → Selenium → Visual Validation)
- [📋 TEAM_50_QA_REPORT_TEMPLATE.md](./09-GOVERNANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md) - תבנית דוח QA סטנדרטית
- [📊 TEAM_50_QA_TEST_INDEX.md](./09-GOVERNANCE/standards/TEAM_50_QA_TEST_INDEX.md) - אינדקס בדיקות QA מפורט

## 🏗️ תשתיות (Infrastructure)
- [🏗️ TT2_INFRASTRUCTURE_GUIDE.md](./01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md) - מדריך מקיף לתשתיות המערכת (Frontend, Backend, Database, Environment, Deployment)
- [🔐 TT2_DATABASE_CREDENTIALS.md](./01-ARCHITECTURE/TT2_DATABASE_CREDENTIALS.md) - הגדרת Database Credentials (שם DB, משתמש, הוראות הגדרה)
- [🏛️ TT2_MASTER_BLUEPRINT.md](./01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md) - Master Blueprint (Stack, IDs, Time, Design, Ports)

## 🎨 עיצוב ו-Fidelity (Design & Fidelity)
- [🎨 TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md](./09-GOVERNANCE/standards/TT2_DESIGN_FIDELITY_FIX_PROTOCOL.md) - נוהל תיקון בעיות fidelity מול Blueprint (מתי ואיך לתקן)
- [📐 CONTAINER_HEADER_STRUCTURE_GUIDELINES.md](./04-DESIGN_UX_UI/CONTAINER_HEADER_STRUCTURE_GUIDELINES.md) - הנחיות מבנה כותרות קונטיינרים (3 חלקים, גובה קבוע)
- [🎯 UNIFIED_HEADER_SPECIFICATION.md](./04-DESIGN_UX_UI/UNIFIED_HEADER_SPECIFICATION.md) - מפרט טכני מפורט של אלמנט ראש הדף
- [📚 SYSTEM_WIDE_DESIGN_PATTERNS.md](./04-DESIGN_UX_UI/SYSTEM_WIDE_DESIGN_PATTERNS.md) - תובנות מערכתיות ומבנים כלליים (תבנית עמוד, קונטיינרים, כרטיסים, פונטים, צבעים)
- [🗂️ CSS_CLASSES_INDEX.md](./04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md) - אינדקס מחלקות CSS - מפה למפתח לשימוש חוזר ולמניעת כפילויות
- [📊 DASHBOARD_WIDGETS_GUIDE.md](./04-DESIGN_UX_UI/DASHBOARD_WIDGETS_GUIDE.md) - מדריך מקיף לדשבורד וויגיטים - מבנה, עיצוב, פונקציונליות, וכל הדיוקים שבוצעו

## ✅ ולידציה וטפסים (Validation & Forms)
- [🎯 TT2_FORM_VALIDATION_FRAMEWORK.md](./10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md) - תשתית ולידציה מרכזית לכל הטפסים במערכת (PhoenixSchema, Error Handling, Client + Server Validation)
- [📘 TT2_VALIDATION_DEVELOPER_GUIDE.md](./02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md) - מדריך מפורט למפתחים עתידיים (יצירת Schemas, Error Handling, Best Practices)

## 📊 מטריצת עמודים מרכזית (Official Page Tracker)
- [📊 TT2_OFFICIAL_PAGE_TRACKER.md](./01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md) - מטריצה מרכזית למעקב התקדמות כל העמודים במערכת (מחויב על ידי האדריכלית, מתוחזק על ידי Team 10)

## 🛡️ הנחיות אדריכליות (Architect Guidelines)
- [🛡️ ריענון נהלים ומשמעת אדריכלית v1.5](./09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md#3-ריענון-נהלים-ומשמעת-אדריכלית-v15--חובה) - הנחיות מחייבות מהאדריכלית (ניהול קבצים, G-Bridge, Transformation Layer)

---
### 🚀 סטטוס סשן נוכחי: SESSION_01 (🟢 OPEN)
### 🛡️ הנחיות אדריכליות: v1.5 (✅ ACKNOWLEDGED & IMPLEMENTED)