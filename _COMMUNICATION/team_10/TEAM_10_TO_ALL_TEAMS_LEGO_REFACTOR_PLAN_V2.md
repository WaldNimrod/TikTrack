# 📡 הודעה מרוכזת: תוכנית CSS & Blueprint Refactor V2 - ארכיטקטורת LEGO מודולרית

**From:** Team 10 (The Gateway)  
**To:** All Teams (Team 30, Team 40, Team 31)  
**Date:** 2026-02-01  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** LEGO_REFACTOR_PLAN_V2 | Status: 🟢 **ACTIVE**  
**Priority:** 🔴 **P0 - CRITICAL**

---

## 📋 Executive Summary

**תוכנית מעודכנת:** התוכנית לבנייה מחדש של העמודים עודכנה בהתאם לארכיטקטורת LEGO מודולרית וקוביות מודולריות.

**שינויים עיקריים:**
- ✅ ארגון מחדש לפי קוביות מודולריות (לא עמודים בודדים)
- ✅ הוספת שלב חדש: יצירת Cube Components Library
- ✅ עדכון תפקיד Team 31 - רק בלופרינטים, לא מעורב בתהליך הבנייה מחדש
- ✅ הוספת Backend Integration ו-State Management ברמת קוביה
- ⚠️ **כלל ברזל:** אין סקריפטים בתוך העמוד - כל הסקריפטים בקבצים חיצוניים
- ✅ הוספת שלב ולידציה מקיף ע"י Team 50

---

## 🎯 מטרת התוכנית

בנייה מחדש של כל העמודים שכבר מימשנו בהתאם לבלופרינטים חדשים מ-Team 31, תיקון היררכיית CSS, ויישום תבנית בסיס מדויקת - **כל זאת תוך שמירה על ארכיטקטורת LEGO מודולרית וקוביות מודולריות**.

---

## 🏗️ ארכיטקטורת LEGO מודולרית

### **LEGO System (Frontend UI)**
**היררכיה:**
```
tt-container
  └── tt-section
      └── tt-section-row
```

**עקרונות:**
- רכיבים לשימוש חוזר (Reusable Components)
- אין CSS מותאם אישית - רק Logical Properties
- State management: Sections זוכרים מצב פתוח/סגור (Zustand)

### **Modular Cubes (Backend/Logic/Pages)**
**קוביות מוגדרות:**
- **Identity & Authentication Cube (D15):** D15_LOGIN, D15_REGISTER, D15_RESET_PWD, D15_PROFILE, D15_INDEX
- **Financial Cube (D16, D18, D21):** D16_ACCTS_VIEW, D18_BRKRS_VIEW, D21_CASH_VIEW

**עקרונות:**
- כל קוביה היא יחידה מודולרית עצמאית
- עמודים בתוך קוביה חולקים לוגיקה משותפת
- Components משותפים ברמת קוביה
- State Management משותף ברמת קוביה
- Backend Integration ברמת קוביה

---

## 📊 שלבי העבודה

### **שלב 1: עדכון תבנית בסיס** ⏳ **IN PROGRESS**
**צוותים:** Team 30 + Team 40  
**מטרה:** עדכון `global_page_template.jsx` לפי הבלופרינט החדש

**החלטות:**
- ✅ **CSS:** CSS Classes מותאמים אישית (לא Tailwind)
- ✅ **Filter:** React Context (`PhoenixFilterContext`)

---

### **שלב 2: הידוק היררכיית CSS** ⏳ **IN PROGRESS**
**צוותים:** Team 40  
**מטרה:** תיקון היררכיית CSS, איחוד CSS Variables, הסרת כפילויות

**סטטוס:** ✅ Audit Complete, ✅ Approved, ⏳ In Progress

---

### **שלב 2.5: יצירת Cube Components Library** ⭐ **חדש** ⏸️ **PENDING**
**צוותים:** Team 30 + Team 40  
**מטרה:** זיהוי ויצירת Components משותפים ברמת קוביה לפני בנייה מחדש של העמודים

**תהליך:**
- זיהוי Components משותפים לכל קוביה
- יצירת מבנה תיקיות `ui/src/cubes/`
- יצירת Shared Components
- תיעוד Components

---

### **שלב 3: בנייה מחדש לפי קוביות מודולריות** ⏸️ **PENDING**
**צוותים:** Team 30 + Team 40  
**מטרה:** בנייה מחדש של כל העמודים לפי קוביות מודולריות

**קוביות:**
- **Identity & Authentication Cube (D15):** 5 עמודים
- **Financial Cube (D16):** 1 עמוד (D18, D21 עתידיים)

**תהליך לכל קוביה:**
- יצירת Cube Structure
- יצירת Shared Components
- יצירת State Management (Context API)
- יצירת API Services
- בנייה מחדש של עמודים תוך שימוש ב-Shared Components

---

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל** ⏸️ **PENDING**
**צוותים:** Team 30 (Frontend)  
**כלל ברזל:** **אין סקריפטים בתוך העמוד** - כל הסקריפטים חייבים להיות בקבצים חיצוניים.

**משימות:**
- יצירת מבנה תיקיות `scripts/` לכל קוביה
- העברת כל הסקריפטים לקבצים חיצוניים
- הסרת כל ה-`<script>` tags מתוך HTML/JSX
- ארגון פונקציות משותפות בקובץ משותף (`ui/src/cubes/shared/scripts/`)
- עמידה ב-`TT2_JS_STANDARDS_PROTOCOL.md`

### **שלב 4: ולידציה ואיכות** ⏸️ **PENDING**
**צוותים:** Team 50 (QA)  
**מטרה:** בדיקת fidelity, RTL, Accessibility, עמידה בארכיטקטורה מודולרית, **בדיקת עמידה בכל האפיונים והתקנים**

**בדיקות Team 50:**
- JavaScript Standards (`TT2_JS_STANDARDS_PROTOCOL.md`)
- CSS Standards (`TT2_CSS_STANDARDS_PROTOCOL.md`)
- HTML/JSX Standards (LEGO System, אין inline scripts/styles)
- ארגון קבצים (סקריפטים חיצוניים, פונקציות משותפות)
- בדיקת עמידה בכל האפיונים והתקנים

---

## 🔧 תפקידים לפי צוות

### **Team 30 (Frontend Execution)**
**אחריות:**
- עדכון `global_page_template.jsx`
- יצירת מבנה קוביות מודולריות (`ui/src/cubes/`)
- יצירת Shared Components לכל קוביה
- יצירת State Management (Context API) לכל קוביה
- יצירת API Services לכל קוביה
- בנייה מחדש של עמודים לפי קוביות

**משימות מיידיות:**
- המשך עבודה על שלב 1.3 (תבנית בסיס)
- התחלת עבודה על שלב 2.5 (Cube Components Library) לאחר השלמת שלב 2

---

### **Team 40 (UI Assets & Design)**
**אחריות:**
- תיקון היררכיית CSS (שלב 2)
- עבודה עם Team 30 על יצירת Cube Components Library
- ולידציה ויזואלית של Components משותפים

**משימות מיידיות:**
- המשך עבודה על שלב 2.4 (תיקון היררכיית CSS)
- התחלת עבודה על שלב 2.5 (Cube Components Library) לאחר השלמת שלב 2

---

### **Team 31 (Blueprint)** ⚠️ **תפקיד מעודכן**
**אחריות חדשה:**
- **ייצור בלופרינטים נוספים לעמודים הבאים**
- **לא מעורב בתהליך הבנייה מחדש** - רק ספק Blueprints

**מטרה:**
לייצר בלופרינטים בצורה שתהיה אופטימלית לשילוב במבנה החדש שיצרו Team 30 + Team 40.

**מתי להתחיל:**
- ⏸️ **לאחר השלמת שלב 2.5** (Cube Components Library)
- ✅ **קבלת דוגמאות/תבניות** מ-Team 30 + Team 40
- ✅ **תיאום עם Team 10** לפני יצירת כל בלופרינט חדש

**עבודה עתידית:**
- בלופרינטים לעמודים נוספים לפי המטריצה
- התאמת הבלופרינטים למבנה הקוביות המודולריות
- עמידה בכלל הברזל: אין JavaScript בתוך הבלופרינט

**קישור לתשובות מפורטות:** `TEAM_10_TO_TEAM_31_ANSWERS_AND_CLARIFICATIONS.md`

---

## 📋 החלטות

### **1. גישת CSS** ✅ **החלטה**
**החלטה:** CSS Classes מותאמים אישית (לא Tailwind)

### **2. גישת Filter** ✅ **החלטה**
**החלטה:** React Context (`PhoenixFilterContext`)

### **3. אישור CSS Refactor** ✅ **אושר**
**החלטה:** ✅ **אושר** - כל התיקונים מוצדקים ונדרשים

---

## 🔗 קישורים רלוונטיים

### **תוכנית מלאה:**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית מעודכנת מלאה

### **בלופרינטים:**
- `_COMMUNICATION/team_31/team_31_staging/` - כל הבלופרינטים מ-Team 31

### **תיעוד:**
- `_COMMUNICATION/team_40/TEAM_40_TO_TEAM_10_CSS_AUDIT_FINDINGS.md` - ממצאי Audit
- `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_40_CSS_HIERARCHY_AUDIT.md` - דוח Audit מלא
- `_COMMUNICATION/team_10/TEAM_10_LEGO_ARCHITECTURE_VALIDATION.md` - בדיקת התאמה לארכיטקטורה

### **ארכיטקטורה:**
- `documentation/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` - LEGO System Spec
- `documentation/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md` - Backend LEGO Architecture
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md` - Page Tracker (קוביות מוגדרות)

---

## ✅ Checklist כללי

### **שלב 1: תבנית בסיס** ⏳ **IN PROGRESS**
- [x] החלטה על גישת CSS ✅
- [x] החלטה על גישת Filter ✅
- [ ] עדכון `global_page_template.jsx` (Team 30)

### **שלב 2: היררכיית CSS** ⏳ **IN PROGRESS**
- [x] Audit Complete ✅
- [x] אישור תיקונים ✅
- [ ] תיקון היררכיה (Team 40)

### **שלב 2.5: Cube Components Library** ⏸️ **PENDING**
- [ ] זיהוי Components משותפים (Team 30 + Team 40)
- [ ] יצירת מבנה תיקיות (Team 30)
- [ ] יצירת Shared Components (Team 30 + Team 40)

### **שלב 3: בנייה מחדש לפי קוביות** ⏸️ **PENDING**
- [ ] Identity Cube (Team 30)
- [ ] Financial Cube (Team 30)

### **שלב 3.5: ארגון סקריפטים חיצוניים** ⚠️ **כלל ברזל** ⏸️ **PENDING**
- [ ] יצירת מבנה תיקיות `scripts/` לכל קוביה (Team 30)
- [ ] העברת כל הסקריפטים לקבצים חיצוניים (Team 30)
- [ ] הסרת כל ה-`<script>` tags מתוך HTML/JSX (Team 30)
- [ ] ארגון פונקציות משותפות בקובץ משותף (Team 30)

### **שלב 4: ולידציה ואיכות** ⏸️ **PENDING**
- [ ] בדיקת עמידה בכל האפיונים והתקנים (Team 50)

---

## 🎯 הצעדים הבאים

1. **Team 30:** המשך עבודה על שלב 1.3 (תבנית בסיס)
2. **Team 40:** המשך עבודה על שלב 2.4 (תיקון היררכיית CSS)
3. **Team 31:** ⏸️ ממתינים להשלמת שלב 2.5 לפני יצירת בלופרינטים חדשים
4. **לאחר השלמה:** התחלת שלב 2.5 (Cube Components Library)
5. **לאחר שלב 2.5:** Team 31 מתחיל לעבוד על בלופרינטים חדשים (עם דוגמאות/תבניות)

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-01  
**Status:** 🟢 **ACTIVE - LEGO ARCHITECTURE COMPLIANT**

**log_entry | Team 10 | LEGO_REFACTOR_PLAN_V2 | ALL_TEAMS_NOTIFIED | 2026-02-01**
