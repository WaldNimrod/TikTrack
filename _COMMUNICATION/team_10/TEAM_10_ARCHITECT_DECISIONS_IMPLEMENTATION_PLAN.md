# 📋 תוכנית מימוש: החלטות אדריכלית - Phase 2 Core Decisions

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **DRAFT - AWAITING CLARIFICATION**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**תוכנית מימוש מלאה להחלטות האדריכלית, כולל שאלות להבהרה לפני הרצת הצוותים.**

**מטרה:** להבהיר כל פינה וכל גרגר שלא ברור לפני הרצת הצוותים.

---

## 📋 החלטות אדריכלית - סיכום

### **1. PDSC Hybrid Architecture** ✅ **DECIDED**

**החלטה:** PDSC הוא היברידי (Hybrid)

**הבנה מהמסמכים הקיימים:**
- ✅ Server (Team 20) = Source of Truth (Schema, Error Codes, Response Contract)
- ✅ Client (Team 30) = Implementation (Fetching, Transformers, Error Handling)

**מה צריך לעדכן:**
- [ ] לוודא שכל ה-Specs משקפים את ההחלטה הזו
- [ ] לוודא ש-`TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` משקף את ההחלטה

---

### **2. UAI External JS (לא Inline)** ✅ **DECIDED**

**החלטה:** UAI צריך external JS (לא inline `<script>`)

**הבנה מהמסמכים הקיימים:**
- ✅ `TEAM_30_UAI_CONFIG_CONTRACT.md` כבר מציין external JS
- ✅ חובה: קובץ JS חיצוני עם `.js` extension
- ✅ Config חייב להיטען לפני UAI initialization

**מה צריך לעדכן:**
- [ ] לוודא שכל הדוגמאות ב-`TEAM_30_UAI_CONFIG_CONTRACT.md` משתמשות ב-external JS
- [ ] להסיר כל דוגמאות עם inline `<script>`
- [ ] להוסיף דוגמאות עם external JS

---

### **3. מערכות הליבה - APPROVED_FOR_IMPLEMENTATION** ✅ **DECIDED**

**החלטה:** שנו ב-OFFICIAL_PAGE_TRACKER את כל מערכות הליבה לסטטוס APPROVED_FOR_IMPLEMENTATION

**הבנה:**
- מערכות הליבה: UAI, PDSC, EFR, GED
- סטטוס חדש: `APPROVED_FOR_IMPLEMENTATION`

**מה צריך לעדכן:**
- [ ] להוסיף סטטוס חדש ל-Page Tracker: `APPROVED_FOR_IMPLEMENTATION`
- [ ] לעדכן את הסטטוס של מערכות הליבה

---

### **4. Phase 1.8: Infrastructure Retrofit** 🚨 **EMERGENCY**

**החלטה:** Phase 1.8: Infrastructure Retrofit - פיתוח עמודים חדשים מוקפא

**הבנה מהמנדט:**
- ✅ הקפאת פיתוח D18/D21
- ✅ מימוש הליבה (PDSC Dual-Core, UAI Engine, CSS Layering)
- ✅ הסבת עמודים קיימים (Dashboard, Profile, Trading Accounts) ל-UAI
- ✅ בקרה: 100% מהעמודים הפעילים משתמשים ב-UAI

**מה צריך לעדכן:**
- [ ] לעדכן את הסטטוס של D18/D21 ל-`PAUSED_FOR_INFRA`
- [ ] לרכז את ה-Retrofit Task List
- [ ] לוודא שצוות 20 ו-30 מסונכרנים על ה-PDSC Boundary

---

## ❓ שאלות קריטיות להבהרה

### **1. סדר עדיפויות** 🔴 **CRITICAL**

**שאלות:**
- [ ] האם קודם צריך להשלים את כל החוזים ואז להתחיל Retrofit?
- [ ] האם Retrofit יכול להתחיל במקביל להשלמת חוזים?
- [ ] מה הסדר המדויק?

**המלצה זמנית:**
1. השלמת חוזים (PDSC Boundary, UAI Contract Fixes)
2. מימוש הליבה (PDSC Dual-Core, UAI Engine, CSS Layering)
3. Retrofit (הסבת עמודים קיימים)

---

### **2. תיקוני UAI Contract** 🔴 **CRITICAL**

**שאלות:**
- [ ] האם צריך להשלים את תיקון Inline JS לפני Retrofit?
- [ ] האם צריך להשלים את איחוד naming לפני Retrofit?
- [ ] מה הסדר המדויק?

**המלצה זמנית:**
- תיקון Inline JS + איחוד naming לפני Retrofit (כי Retrofit צריך UAI Contract תקין)

---

### **3. PDSC Boundary Contract** 🔴 **CRITICAL**

**שאלות:**
- [ ] האם צריך להשלים את `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` לפני Retrofit?
- [ ] האם יש עדיין נושאים פתוחים שצריך לפתור?
- [ ] מה הסדר המדויק?

**המלצה זמנית:**
- השלמת PDSC Boundary Contract לפני Retrofit (כי Retrofit צריך PDSC Boundary תקין)

---

### **4. Retrofit Task List** 🔴 **CRITICAL**

**שאלות:**
- [ ] מה המשימות המדויקות שצריך לבצע?
- [ ] מה הסדר המדויק של המשימות?
- [ ] מה ה-Timeline לכל משימה?

**הבנה מהמנדט:**
1. Dashboard (D15_INDEX) - מעבר לטעינת UAI ושימוש ב-GED
2. Profile (D15_PROF_VIEW) - אינטגרציה עם ה-PDSC Client
3. Trading Accounts (D16) - החלפת ה-DataLoader המקומי ב-Shared Service

---

## 📋 תוכנית מימוש מפורטת

### **שלב 1: השלמת חוזים** (16 שעות)

#### **1.1. PDSC Boundary Contract** (8 שעות)
- [ ] סשן חירום Team 20 + Team 30
- [ ] השלמת `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`
- [ ] דוגמאות קוד משותפות
- [ ] תיעוד Integration Points

#### **1.2. UAI Contract Fixes** (8 שעות)
- [ ] תיקון Inline JS (6 שעות)
- [ ] איחוד naming (2 שעות)

---

### **שלב 2: עדכון Specs לפי החלטות** (8 שעות)

#### **2.1. PDSC Specs** (4 שעות)
- [ ] עדכון `TEAM_20_PDSC_ERROR_SCHEMA.md` (אם נדרש)
- [ ] עדכון `TEAM_20_PDSC_RESPONSE_CONTRACT.md` (אם נדרש)
- [ ] עדכון `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` (אם נדרש)

#### **2.2. UAI Specs** (4 שעות)
- [ ] עדכון `TEAM_30_UAI_CONFIG_CONTRACT.md` (הסרת inline JS, הוספת external JS)
- [ ] דוגמאות עם external JS

---

### **שלב 3: עדכון Page Tracker** (2 שעות)

#### **3.1. הוספת סטטוס חדש** (1 שעה)
- [ ] הוספת `APPROVED_FOR_IMPLEMENTATION` ל-SOP Status Legend
- [ ] תיעוד המשמעות של הסטטוס

#### **3.2. עדכון סטטוס מערכות הליבה** (1 שעה)
- [ ] UAI → `APPROVED_FOR_IMPLEMENTATION`
- [ ] PDSC → `APPROVED_FOR_IMPLEMENTATION`
- [ ] EFR → `APPROVED_FOR_IMPLEMENTATION`
- [ ] GED → `APPROVED_FOR_IMPLEMENTATION`

---

### **שלב 4: Phase 1.8 - Infrastructure Retrofit** (40 שעות)

#### **4.1. עדכון Page Tracker** (1 שעה)
- [ ] D18 → `PAUSED_FOR_INFRA`
- [ ] D21 → `PAUSED_FOR_INFRA`

#### **4.2. מימוש הליבה** (24 שעות)
- [ ] PDSC Dual-Core (Team 20: Server Schemas, Team 30: Shared_Services.js) - 12 שעות
- [ ] UAI Engine (מימוש UnifiedAppInit.js וכל 5 שלבי הטעינה) - 8 שעות
- [ ] CSS Layering (עדכון cssLoadVerifier.js ושילובו ב-DOMStage) - 4 שעות

#### **4.3. Retrofit Task List** (15 שעות)
- [ ] Dashboard (D15_INDEX) - מעבר לטעינת UAI ושימוש ב-GED - 5 שעות
- [ ] Profile (D15_PROF_VIEW) - אינטגרציה עם ה-PDSC Client - 5 שעות
- [ ] Trading Accounts (D16) - החלפת ה-DataLoader המקומי ב-Shared Service - 5 שעות

---

## ✅ Checklist מימוש

### **לפני התחלה:**
- [ ] הבהרה על סדר עדיפויות
- [ ] הבהרה על תיקוני UAI Contract
- [ ] הבהרה על PDSC Boundary Contract
- [ ] הבהרה על Retrofit Task List

### **שלב 1: השלמת חוזים:**
- [ ] PDSC Boundary Contract
- [ ] UAI Contract Fixes

### **שלב 2: עדכון Specs:**
- [ ] PDSC Specs
- [ ] UAI Specs

### **שלב 3: עדכון Page Tracker:**
- [ ] הוספת סטטוס חדש
- [ ] עדכון סטטוס מערכות הליבה

### **שלב 4: Phase 1.8:**
- [ ] עדכון Page Tracker (D18/D21)
- [ ] מימוש הליבה
- [ ] Retrofit Task List

---

## 🎯 Timeline סופי

**סה"כ:** 66 שעות

- **שלב 1:** 16 שעות (השלמת חוזים)
- **שלב 2:** 8 שעות (עדכון Specs)
- **שלב 3:** 2 שעות (עדכון Page Tracker)
- **שלב 4:** 40 שעות (Phase 1.8 - Infrastructure Retrofit)

---

## ⚠️ אזהרות קריטיות

1. **סדר עדיפויות חובה** - לא להתחיל Retrofit לפני השלמת חוזים
2. **תיקוני UAI Contract חובה** - Retrofit צריך UAI Contract תקין
3. **PDSC Boundary Contract חובה** - Retrofit צריך PDSC Boundary תקין

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **DRAFT - AWAITING CLARIFICATION**

**log_entry | [Team 10] | ARCHITECT_DECISIONS | IMPLEMENTATION_PLAN | YELLOW | 2026-02-07**
