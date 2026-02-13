# ❓ שאלות להבהרה: החלטות אדריכלית - Phase 2 Core Decisions

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **CLARIFICATION REQUIRED**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**רשימת שאלות מפורטות להבהרת החלטות האדריכלית לפני הכנת תוכנית מימוש מלאה.**

**מטרה:** להבהיר כל פינה וכל גרגר שלא ברור לפני הרצת הצוותים.

---

## 📋 שאלות קריטיות להבהרה

### **1. PDSC Hybrid Architecture** 🔴 **CRITICAL**

**החלטה:** PDSC הוא היברידי (Hybrid)

**שאלות להבהרה:**

1. **מה המשמעות המדויקת של "Hybrid"?**
   - [ ] האם הכוונה: Server = Source of Law (Schema), Client = Source of Implementation (Fetching + Transformers)?
   - [ ] האם יש אחריות נוספת שצריך להגדיר?

2. **מה צריך לעדכן ב-Specs?**
   - [ ] האם צריך לעדכן את `TEAM_20_PDSC_ERROR_SCHEMA.md`?
   - [ ] האם צריך לעדכן את `TEAM_20_PDSC_RESPONSE_CONTRACT.md`?
   - [ ] האם צריך לעדכן את `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md`?
   - [ ] מה השינויים המדויקים הנדרשים?

3. **מה המשמעות ל-Implementation?**
   - [ ] האם יש שינויים נדרשים בקוד הקיים?
   - [ ] האם יש שינויים נדרשים ב-API endpoints?
   - [ ] האם יש שינויים נדרשים ב-Frontend data loaders?

---

### **2. UAI External JS (לא Inline)** 🔴 **CRITICAL**

**החלטה:** UAI צריך external JS (לא inline `<script>`)

**שאלות להבהרה:**

1. **מה הפורמט המדויק הנדרש?**
   - [ ] האם הכוונה: קובץ JS חיצוני (`pageConfig.js`)?
   - [ ] האם הכוונה: JSON + Loader (`pageConfig.json` + `loadPageConfig()`)?
   - [ ] האם יש פורמט מועדף?

2. **איפה צריך למקם את הקבצים?**
   - [ ] האם כל עמוד צריך קובץ config נפרד?
   - [ ] האם יש מבנה תיקיות מועדף?
   - [ ] דוגמה: `/src/views/financial/cashFlows/cashFlowsPageConfig.js`?

3. **מה צריך לעדכן ב-Specs?**
   - [ ] האם צריך לעדכן את `TEAM_30_UAI_CONFIG_CONTRACT.md`?
   - [ ] האם צריך להסיר את כל הדוגמאות עם inline `<script>`?
   - [ ] האם צריך להוסיף דוגמאות עם external JS?
   - [ ] מה השינויים המדויקים הנדרשים?

4. **מה המשמעות ל-Implementation?**
   - [ ] האם צריך ליצור Loader function חדש?
   - [ ] האם צריך לעדכן את `UnifiedAppInit.js`?
   - [ ] האם צריך לעדכן את `DOMStage.js`?
   - [ ] האם יש שינויים נדרשים בעמודים הקיימים?

---

### **3. מערכות הליבה - APPROVED_FOR_IMPLEMENTATION** 🔴 **CRITICAL**

**החלטה:** שנו ב-OFFICIAL_PAGE_TRACKER את כל מערכות הליבה לסטטוס APPROVED_FOR_IMPLEMENTATION

**שאלות להבהרה:**

1. **מה הן "מערכות הליבה"?**
   - [ ] האם הכוונה: UAI, PDSC, EFR, GED?
   - [ ] האם יש מערכות נוספות שצריך לכלול?

2. **מה המשמעות של APPROVED_FOR_IMPLEMENTATION?**
   - [ ] האם זה אומר שהחוזים מאושרים ומוכנים למימוש?
   - [ ] האם זה אומר שצריך להתחיל מימוש עכשיו?
   - [ ] האם יש עדיין חסמים שצריך לפתור?

3. **מה צריך לעדכן ב-Page Tracker?**
   - [ ] האם צריך להוסיף סטטוס חדש: `APPROVED_FOR_IMPLEMENTATION`?
   - [ ] האם צריך לעדכן את הסטטוס של D18/D21?
   - [ ] מה השינויים המדויקים הנדרשים?

---

### **4. Phase 1.8: Infrastructure Retrofit** 🚨 **EMERGENCY**

**החלטה:** Phase 1.8: Infrastructure Retrofit - פיתוח עמודים חדשים מוקפא

**שאלות להבהרה:**

1. **מה המשמעות של "מוקפא"?**
   - [ ] האם זה אומר שכל פיתוח D18/D21 עוצר לחלוטין?
   - [ ] האם יש משימות שמותר להמשיך בהן?
   - [ ] מה הסטטוס המדויק של D18/D21?

2. **מה המשמעות של "Infrastructure Retrofit"?**
   - [ ] האם זה אומר שצריך להסב את כל העמודים הקיימים ל-UAI?
   - [ ] האם זה אומר שצריך להסב רק Dashboard, Profile ו-Trading Accounts?
   - [ ] האם יש עמודים נוספים שצריך להסב?

3. **מה ה-Retrofit Task List?**
   - [ ] מה המשימות המדויקות שצריך לבצע?
   - [ ] מה הסדר המדויק של המשימות?
   - [ ] מה ה-Timeline לכל משימה?

4. **מה המשמעות ל-Dashboard, Profile, Trading Accounts?**
   - [ ] האם צריך להסב אותם ל-UAI עכשיו?
   - [ ] האם יש שינויים נדרשים בקוד הקיים?
   - [ ] האם יש שינויים נדרשים ב-Config files?

5. **מה המשמעות ל-PDSC Boundary?**
   - [ ] האם צריך להשלים את `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` לפני Retrofit?
   - [ ] האם יש שינויים נדרשים ב-PDSC Boundary?
   - [ ] מה הקשר בין Retrofit ל-PDSC Boundary?

---

### **5. סדר עדיפויות וטיימליין** 🔴 **CRITICAL**

**שאלות להבהרה:**

1. **מה סדר העדיפויות?**
   - [ ] האם קודם צריך להשלים את כל החוזים ואז להתחיל Retrofit?
   - [ ] האם Retrofit יכול להתחיל במקביל להשלמת חוזים?
   - [ ] מה הסדר המדויק?

2. **מה ה-Timeline?**
   - [ ] מתי צריך להתחיל Retrofit?
   - [ ] מתי צריך לסיים Retrofit?
   - [ ] מה ה-Timeline לכל משימה?

3. **מה הקשר בין Phase 1.8 ל-Phase 2?**
   - [ ] האם Phase 1.8 הוא חלק מ-Phase 2?
   - [ ] האם Phase 1.8 הוא שלב נפרד?
   - [ ] מה הקשר המדויק?

---

## 📋 שאלות נוספות

### **6. תיקוני UAI Contract** 🔴 **CRITICAL**

**שאלות להבהרה:**

1. **מה הסטטוס של תיקוני UAI Contract?**
   - [ ] האם צריך להשלים את תיקון Inline JS לפני Retrofit?
   - [ ] האם צריך להשלים את איחוד naming לפני Retrofit?
   - [ ] מה הסדר המדויק?

2. **מה המשמעות ל-Retrofit?**
   - [ ] האם Retrofit צריך לחכות לתיקוני UAI Contract?
   - [ ] האם Retrofit יכול להתחיל במקביל לתיקוני UAI Contract?
   - [ ] מה הקשר המדויק?

---

### **7. PDSC Boundary Contract** 🔴 **CRITICAL**

**שאלות להבהרה:**

1. **מה הסטטוס של PDSC Boundary Contract?**
   - [ ] האם צריך להשלים את `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` לפני Retrofit?
   - [ ] האם יש עדיין נושאים פתוחים שצריך לפתור?
   - [ ] מה הסדר המדויק?

2. **מה המשמעות ל-Retrofit?**
   - [ ] האם Retrofit צריך לחכות להשלמת PDSC Boundary Contract?
   - [ ] האם Retrofit יכול להתחיל במקביל להשלמת PDSC Boundary Contract?
   - [ ] מה הקשר המדויק?

---

## ✅ Checklist הבהרות נדרשות

### **לפני הכנת תוכנית מימוש:**

- [ ] הבהרה על PDSC Hybrid Architecture
- [ ] הבהרה על UAI External JS
- [ ] הבהרה על APPROVED_FOR_IMPLEMENTATION
- [ ] הבהרה על Phase 1.8: Infrastructure Retrofit
- [ ] הבהרה על סדר עדיפויות וטיימליין
- [ ] הבהרה על תיקוני UAI Contract
- [ ] הבהרה על PDSC Boundary Contract

---

## 🎯 הצעדים הבאים

1. **מיידי:** שליחת שאלות אלה לאדריכלית להבהרה
2. **לאחר הבהרה:** הכנת תוכנית מימוש מלאה
3. **לאחר אישור:** הפצת הוראות לצוותים

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🟡 **CLARIFICATION REQUIRED**

**log_entry | [Team 10] | ARCHITECT_DECISIONS | CLARIFICATION_REQUIRED | YELLOW | 2026-02-07**
