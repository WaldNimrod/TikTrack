# 📋 תוכנית יישום: SPY_DOCS_INTEGRITY_GAP_REPORT

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-05  
**מקור:** `_COMMUNICATION/team_90/SPY_DOCS_INTEGRITY_GAP_REPORT.md`  
**סטטוס:** 🟡 **IN PROGRESS**

---

## 📢 Executive Summary

דוח המרגל (Team 90) זיהה פערים קריטיים ביושרת התיעוד. תוכנית זו מפרטת את כל הפעולות הנדרשות לתיקון מלא.

---

## 🔍 פערים שזוהו

### **1. קבצים חסרים שהאינדקס מפנה אליהם** ❌

#### **קבצים חסרים לגמרי:**
- ❌ `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md` - לא קיים
- ❌ `documentation/01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md` - לא קיים

#### **קבצים שנמצאים ב-_COMMUNICATION (לא SSOT):**
- ⚠️ `_COMMUNICATION/team_10/Bach1_2026_2_2/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - האינדקס מפנה אליו
- ⚠️ `_COMMUNICATION/team_10/Bach1_2026_2_2/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md` - האינדקס מפנה אליו
- ⚠️ `_COMMUNICATION/team_30/Bach1_2026_2_2/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md` - האינדקס מפנה אליו

---

### **2. קישורים ל-_COMMUNICATION באינדקס המאוחד** ⚠️

האינדקס המאוחד מפנה לקבצים ב-_COMMUNICATION, מה שמפר את הכלל ש-SSOT חייב להיות רק ב-`documentation/`.

**קישורים שצריך להסיר או להחליף:**
- `../../_COMMUNICATION/team_51/TEAM_51_ONBOARDING_COMPREHENSIVE.md`
- `../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_FOOTER_STRATEGY.md`
- `../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md`
- `../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_RESPONSIVE_CHARTER.md`
- `../../_COMMUNICATION/90_Architects_comunication/ARCHITECT_BATCH_1_FINAL_SUMMARY.md`
- `../../_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md`
- `../../_COMMUNICATION/team_10/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md`
- `../../_COMMUNICATION/team_30/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`

---

### **3. חסרים בלוקי Metadata במסמכי SSOT** ⚠️

כל מסמך SSOT חייב להתחיל בבלוק Metadata עם:
- `id:`
- `owner:`
- `status:`
- `supersedes:` (אם רלוונטי)

**רשימת מסמכים שצריכים Metadata:**
- כל המסמכים ב-`documentation/09-GOVERNANCE/standards/`
- כל המסמכים ב-`documentation/01-ARCHITECTURE/`
- כל המסמכים ב-`documentation/04-DESIGN_UX_UI/`
- כל המסמכים ב-`documentation/10-POLICIES/`
- כל המסמכים ב-`documentation/02-DEVELOPMENT/`

---

### **4. אינדקסים מבוטלים** ✅

**סטטוס:** כבר טופל - כל האינדקסים הועברו לארכיון.

---

## 📋 תוכנית פעולה

### **שלב 1: טיפול בקבצים חסרים** 🔴 **PRIORITY**

#### **1.1 יצירת TT2_INFRASTRUCTURE_GUIDE.md**
- **מיקום:** `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`
- **פעולה:** יצירת מסמך SSOT מקיף על תשתיות המערכת
- **תוכן:** Frontend, Backend, Database, Environment, Deployment

#### **1.2 יצירת TT2_TABLES_REACT_FRAMEWORK.md**
- **מיקום:** `documentation/01-ARCHITECTURE/TT2_TABLES_REACT_FRAMEWORK.md`
- **פעולה:** יצירת מסמך SSOT על מערכת הטבלאות React
- **תוכן:** PhoenixTable, PhoenixFilterContext, Hooks, Transformation Layer

---

### **שלב 2: טיפול בקישורים ל-_COMMUNICATION** 🟡 **PRIORITY**

#### **2.1 העברת קבצים מ-_COMMUNICATION ל-documentation/**
**קבצים להעברה:**
- `TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` → `documentation/02-DEVELOPMENT/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md`
- `TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md` → `documentation/02-DEVELOPMENT/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md`
- `TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md` → `documentation/05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`

**הערה:** קבצים אלה הם SSOT ולכן חייבים להיות ב-`documentation/`.

#### **2.2 הסרת קישורים ל-_COMMUNICATION מהאינדקס**
**קישורים להסרה (לא SSOT):**
- קישורים ל-`90_Architects_comunication/` - אלה החלטות אדריכליות, לא SSOT
- קישור ל-`team_51/TEAM_51_ONBOARDING_COMPREHENSIVE.md` - זה מסמך Communication

**פעולה:** עדכון האינדקס המאוחד להסיר קישורים אלה או להחליף בהערות.

---

### **שלב 3: הוספת Metadata Blocks** 🟡 **PRIORITY**

#### **3.1 יצירת תבנית Metadata**
```markdown
**id:** `[UNIQUE_ID]`
**owner:** [Team/Individual]
**status:** [SSOT/ACTIVE/DEPRECATED]
**supersedes:** [Previous document if applicable]
**last_updated:** [Date]
**version:** [Version number]
```

#### **3.2 הוספת Metadata לכל מסמכי SSOT**
**קבצים לעדכון:**
- כל המסמכים ב-`documentation/09-GOVERNANCE/standards/`
- כל המסמכים ב-`documentation/01-ARCHITECTURE/`
- כל המסמכים ב-`documentation/04-DESIGN_UX_UI/`
- כל המסמכים ב-`documentation/10-POLICIES/`
- כל המסמכים ב-`documentation/02-DEVELOPMENT/`

---

### **שלב 4: אימות ואישור** ✅

#### **4.1 בדיקת תקינות כל הקישורים**
#### **4.2 אימות שכל מסמכי SSOT כוללים Metadata**
#### **4.3 אימות שאין קישורים ל-_COMMUNICATION באינדקס המאוחד**

---

## ✅ קריטריוני השלמה

1. ✅ כל הקבצים שהאינדקס מפנה אליהם קיימים
2. ✅ אין קישורים ל-_COMMUNICATION באינדקס המאוחד (או שהם מסומנים בבירור כ-Communication)
3. ✅ כל מסמכי SSOT כוללים בלוק Metadata מלא
4. ✅ כל הקבצים שהועברו מ-_COMMUNICATION כוללים Metadata

---

## 📁 קבצים רלוונטיים

- **דוח המרגל:** `_COMMUNICATION/team_90/SPY_DOCS_INTEGRITY_GAP_REPORT.md`
- **אינדקס מאוחד:** `documentation/00-MANAGEMENT/00_MASTER_INDEX.md`
- **מנדט אדריכל:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DOCS_INTEGRITY_MANDATE.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-05  
**סטטוס:** 🟡 **IN PROGRESS**

**log_entry | [Team 10] | SPY_GAP_REPORT | IMPLEMENTATION_PLAN_CREATED | BLUE | 2026-02-05**
