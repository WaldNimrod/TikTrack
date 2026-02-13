# 🔵 הודעה: Design Sprint - Core Systems Specification

**מאת:** Team 10 (The Gateway)  
**אל:** כל הצוותים (10, 20, 30, 40, 60)  
**תאריך:** 2026-02-06  
**סטטוס:** 🔵 **DESIGN SPRINT ACTIVE**  
**עדיפות:** 🔴 **P0 - BLOCKING**

---

## 🎯 Executive Summary

**הוכרז "ספרינט אפיון" (Design Sprint) - עצירת פיתוח לטובת אפיון תשתית מאוחדת.**

בעקבות מנדט מאת האדריכלית, אנו עוצרים את כל פיתוח Phase 2 (D18/D21) לטובת אפיון מערכות הליבה (Balanced Core Model).

**כל המשימות הפיזיות של D18/D21 עוברות לסטטוס UNDER_DESIGN.**

---

## 🚩 ההחלטה האסטרטגית

**אנו מאמצים את מודל ה-Balanced Core.**

- ❌ **לא בונים יותר** לוגיקה ייעודית לעמודים (D18, D21)
- ✅ **כל הלוגיקה עוברת** ל-"לב המערכת" (Shared Core)
- ✅ **העמודים הופכים** לקבצי קונפיגורציה בלבד

---

## 🏗️ מערכות הליבה לאפיון (The Characterization List)

**חובה לייצר מסמכי אפיון (Specs) עבור הרכיבים הבאים לפני כתיבת קוד:**

### **1. Unified App Init (UAI)** 🔵 **Team 30**

**תיאור:** ניהול 5 שלבי טעינת עמוד (DOM → Bridge → Data → Render)

**תפקיד:**
- ניהול מחזור החיים המלא של טעינת עמוד
- תיאום בין שלבי הטעינה השונים
- הבטחת סדר טעינה נכון

**קבצים קשורים:**
- `Phoenix_Platform_Core.js` (UAI + GED)

---

### **2. Phoenix Data Service Core (PDSC)** 🔵 **Team 20**

**תיאור:** ניהול Fetching, Error Codes, ו-Hardened Transformers

**תפקיד:**
- טעינת נתונים מ-API
- ניהול Error Codes
- שימוש ב-Hardened Transformers (`transformers.js` v1.2)
- ניהול Routes SSOT (`routes.json` v1.1.2)

**קבצים קשורים:**
- `Shared_Services.js` (PDSC + EFR)
- `ui/src/cubes/shared/utils/transformers.js` (קיים)
- `routes.json` (קיים)

---

### **3. Entity Field Renderer (EFR)** 🔵 **Team 30**

**תיאור:** מנוע רינדור אחיד לטבלאות (סכומים, תאריכים, באדג'ים)

**תפקיד:**
- רינדור אחיד של שדות בטבלאות
- פורמט סכומים (מטבע, +/-)
- פורמט תאריכים (DD/MM/YYYY)
- רינדור באדג'ים (Badges) צבעוניים

**קבצים קשורים:**
- `Shared_Services.js` (PDSC + EFR)
- `ui/src/cubes/shared/tableFormatters.js` (קיים - להתייחסות)

---

### **4. Global Event Delegation (GED)** 🔵 **Team 30**

**תיאור:** ניהול אירועים מרכזי למניעת דליפות זיכרון

**תפקיד:**
- ניהול Event Listeners מרכזי
- מניעת דליפות זיכרון
- ניהול cleanup אוטומטי

**קבצים קשורים:**
- `Phoenix_Platform_Core.js` (UAI + GED)

---

## 📐 היררכיית טעינה ותלויות (Loading Order)

**סדר הטעינה בכל עמוד HTML יהיה קשיח:**

```html
<!-- 1. DNA Variables (CSS) -->
<link rel="stylesheet" href="DNA_Variables.css">

<!-- 2. Phoenix Platform Core (UAI + GED) -->
<script src="Phoenix_Platform_Core.js"></script>

<!-- 3. Shared Services (PDSC + EFR) -->
<script src="Shared_Services.js"></script>

<!-- 4. Page Specific Config (הגדרות עמוד בלבד) -->
<script src="Page_Specific_Config.js"></script>
```

---

## 📋 משימות לכל צוות

### **Team 20 (Backend Implementation)**

**משימה:** יצירת Spec עבור **Phoenix Data Service Core (PDSC)**

**קובץ Spec:** `_COMMUNICATION/team_20/TEAM_20_PDSC_SPEC.md`

**תוכן נדרש:**
- [ ] תיאור כללי של PDSC
- [ ] ניהול Fetching (API calls)
- [ ] ניהול Error Codes
- [ ] שימוש ב-Hardened Transformers (`transformers.js` v1.2)
- [ ] שימוש ב-Routes SSOT (`routes.json` v1.1.2)
- [ ] API Base URL construction
- [ ] Authorization headers
- [ ] Error handling patterns
- [ ] דוגמאות קוד

**תאריך יעד:** 2026-02-08

---

### **Team 30 (Frontend Implementation)**

**משימות:**
1. יצירת Spec עבור **Unified App Init (UAI)**
2. יצירת Spec עבור **Entity Field Renderer (EFR)**
3. יצירת Spec עבור **Global Event Delegation (GED)**

**קבצי Spec:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_SPEC.md`
- `_COMMUNICATION/team_30/TEAM_30_EFR_SPEC.md`
- `_COMMUNICATION/team_30/TEAM_30_GED_SPEC.md`

#### **UAI Spec - תוכן נדרש:**
- [ ] תיאור כללי של UAI
- [ ] 5 שלבי טעינת עמוד:
  1. DOM Ready
  2. Bridge Initialization
  3. Data Loading
  4. Render
  5. Cleanup
- [ ] Lifecycle hooks
- [ ] Error handling
- [ ] דוגמאות קוד

#### **EFR Spec - תוכן נדרש:**
- [ ] תיאור כללי של EFR
- [ ] רינדור סכומים (מטבע, +/-)
- [ ] רינדור תאריכים (DD/MM/YYYY)
- [ ] רינדור באדג'ים (Badges) צבעוניים
- [ ] פורמטרים נפוצים
- [ ] דוגמאות קוד

#### **GED Spec - תוכן נדרש:**
- [ ] תיאור כללי של GED
- [ ] ניהול Event Listeners מרכזי
- [ ] מניעת דליפות זיכרון
- [ ] Cleanup אוטומטי
- [ ] Event delegation patterns
- [ ] דוגמאות קוד

**תאריך יעד:** 2026-02-08

---

### **Team 10 (The Gateway)**

**משימות:**
- [ ] איחוד כל ה-Specs
- [ ] בדיקת עקביות בין Specs
- [ ] הגשה לאישור אדריכל
- [ ] עדכון SSOT Registry

**תאריך יעד:** 2026-02-09

---

## 📝 תבנית Spec (Template)

**כל צוות חייב להשתמש בתבנית הבאה:**

```markdown
# [System Name] Specification

**id:** `TEAM_[ID]_[SYSTEM]_SPEC`  
**owner:** Team [ID]  
**status:** 📝 **DRAFT - DESIGN SPRINT**  
**last_updated:** 2026-02-06  
**version:** v1.0 (Design Sprint)

---

## 📢 Executive Summary

[תיאור קצר של המערכת]

---

## 🎯 Purpose & Goals

[מטרות המערכת]

---

## 🏗️ Architecture

[תיאור ארכיטקטורה]

---

## 📋 API / Interface

[ממשקי המערכת]

---

## 🔄 Workflow / Lifecycle

[תהליכי עבודה / מחזור חיים]

---

## ⚠️ Error Handling

[טיפול בשגיאות]

---

## 📊 Examples

[דוגמאות קוד]

---

## 🔗 Dependencies

[תלויות]

---

## ✅ Checklist

[רשימת בדיקות]

---

**Team [ID]**  
**תאריך:** 2026-02-06  
**סטטוס:** 📝 **DRAFT - DESIGN SPRINT**
```

---

## ⚠️ כללי אכיפה

### **1. חובת Spec לפני קוד**
- ❌ **אסור:** כתיבת קוד לפני אישור Spec
- ✅ **חובה:** הגשת Spec תחת `_COMMUNICATION/team_[ID]/`

### **2. תבנית אחידה**
- ✅ **חובה:** שימוש בתבנית Spec המפורטת לעיל
- ✅ **חובה:** מטא-דאטה מלא (`id`, `owner`, `status`, `version`)

### **3. תיאום בין צוותים**
- ✅ **חובה:** תיאום עם צוותים אחרים (אם יש תלויות)
- ✅ **חובה:** הגשה ל-Team 10 לאיחוד ואישור

---

## 📊 לוח זמנים

| משימה | צוות | תאריך יעד | עדיפות |
|:---|:---|:---|:---|
| PDSC Spec | Team 20 | 2026-02-08 | 🔴 P0 |
| UAI Spec | Team 30 | 2026-02-08 | 🔴 P0 |
| EFR Spec | Team 30 | 2026-02-08 | 🔴 P0 |
| GED Spec | Team 30 | 2026-02-08 | 🔴 P0 |
| איחוד Specs | Team 10 | 2026-02-09 | 🔴 P0 |
| אישור אדריכל | Architect | 2026-02-10 | 🔴 P0 |

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`

### **תיעוד SSOT:**
- `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`
- `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`
- `documentation/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md`

### **קבצים קיימים להתייחסות:**
- `ui/src/cubes/shared/utils/transformers.js` (Transformers)
- `ui/src/cubes/shared/tableFormatters.js` (Formatters)
- `routes.json` (Routes SSOT)

---

## ✅ Checklist סופי

### **Team 20:**
- [ ] יצירת `TEAM_20_PDSC_SPEC.md`
- [ ] מילוי כל הסעיפים בתבנית
- [ ] הגשה תחת `_COMMUNICATION/team_20/`

### **Team 30:**
- [ ] יצירת `TEAM_30_UAI_SPEC.md`
- [ ] יצירת `TEAM_30_EFR_SPEC.md`
- [ ] יצירת `TEAM_30_GED_SPEC.md`
- [ ] מילוי כל הסעיפים בתבנית
- [ ] הגשה תחת `_COMMUNICATION/team_30/`

### **Team 10:**
- [ ] איחוד כל ה-Specs
- [ ] בדיקת עקביות
- [ ] הגשה לאישור אדריכל
- [ ] עדכון SSOT Registry

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-06  
**סטטוס:** 🔵 **DESIGN SPRINT ACTIVE**

**log_entry | [Team 10] | DESIGN_SPRINT | ALL_TEAMS_MANDATE | BLUE | 2026-02-06**
