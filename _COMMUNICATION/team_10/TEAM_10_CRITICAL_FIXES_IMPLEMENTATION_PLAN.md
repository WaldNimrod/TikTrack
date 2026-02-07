# 📋 תוכנית מימוש: תיקונים קריטיים לפני אישור המשך

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**תוכנית מימוש מפורטת לכל התיקונים הקריטיים הנדרשים לפני אישור המשך Phase 1.8.**

**מקור:** החלטות האדריכלית וסקירת Team 10

---

## 📋 תיקונים קריטיים - סיכום

### **1. UAI חובה לכל העמודים** 🔴 **CRITICAL**
- **צוות:** Team 30
- **Timeline:** 16 שעות
- **משימה:** מעבר מלא של 100% מהעמודים הקיימים ל-UAI

### **2. CSS Load Verification - אכיפה אמיתית** 🔴 **CRITICAL**
- **צוותים:** Team 30 + Team 40
- **Timeline:** 4 שעות
- **משימה:** Integration ב-DOMStage + הכרעה על כלל CSS

### **3. ניקוי טעינת סקריפטים ישנה** 🔴 **CRITICAL**
- **צוות:** Team 30
- **Timeline:** 8 שעות
- **משימה:** הסרת hardcoded scripts מכל העמודים

### **4. חוזי UAI + PDSC סופיים** 🔴 **CRITICAL**
- **צוותים:** Team 20 + Team 30
- **Timeline:** 24 שעות
- **משימה:** גרסה סופית חתומה

### **5. Namespace UAI** 🔴 **CRITICAL**
- **צוות:** Team 30
- **Timeline:** 4 שעות
- **משימה:** עקביות `window.UAI.config` בכל המסמכים

---

## 📋 תוכנית מימוש מפורטת

### **שלב 1: תיקונים קריטיים (56 שעות)**

#### **1.1. UAI חובה לכל העמודים (16 שעות)**

**צוות:** Team 30

**עמודים:**
- Batch 1 (10 שעות):
  - D15_LOGIN.html (2 שעות)
  - D15_REGISTER.html (2 שעות)
  - D15_RESET_PWD.html (2 שעות)
  - D15_INDEX.html (2 שעות)
  - D15_PROF_VIEW.html (2 שעות)
- Batch 2 (6 שעות):
  - trading_accounts.html (2 שעות)
  - cash_flows.html (2 שעות)
  - brokers_fees.html (2 שעות)

**דרישות לכל עמוד:**
- [ ] יצירת `pageConfig.js`
- [ ] הסרת hardcoded scripts
- [ ] הוספת UAI entry point
- [ ] בדיקת תקינות

**מסמך:** `TEAM_10_TO_TEAM_30_CRITICAL_FIXES_UAI.md`

---

#### **1.2. CSS Load Verification (4 שעות)**

**צוותים:** Team 30 + Team 40

**משימות:**
- [ ] הכרעה על כלל CSS (1 שעה)
- [ ] Integration ב-DOMStage (2 שעות)
- [ ] עדכון cssLoadVerifier.js (1 שעה)

**מסמך:** `TEAM_10_TO_TEAM_30_40_CSS_VERIFICATION_CRITICAL.md`

---

#### **1.3. ניקוי טעינת סקריפטים (8 שעות)**

**צוות:** Team 30

**עמודים:** כל 8 העמודים

**דרישות:**
- [ ] הסרת כל `<script>` tags מה-HTML
- [ ] הוספת UAI entry point
- [ ] בדיקת תקינות

**משולב עם:** סעיף 1.1 (UAI חובה)

---

#### **1.4. חוזי UAI + PDSC סופיים (24 שעות)**

**צוותים:** Team 20 + Team 30

**משימות:**
- [ ] סשן חירום (8 שעות)
- [ ] השלמת UAI Config Contract (8 שעות)
- [ ] השלמת PDSC Boundary Contract (8 שעות)

**דרישות:**
- [ ] כל דוגמאות inline JS הוסרו
- [ ] כל דוגמאות external JS נוספו
- [ ] naming מאוחד
- [ ] חתימה סופית

---

#### **1.5. Namespace UAI (4 שעות)**

**צוות:** Team 30

**משימות:**
- [ ] עדכון מסמכים (2 שעות)
- [ ] עדכון קוד (1 שעה)
- [ ] הגדרת legacy fallback (1 שעה)

**מסמך:** `TEAM_10_TO_TEAM_30_NAMESPACE_UAI_CRITICAL.md`

---

### **שלב 2: Re-Scan ועדכון סטטוס (4 שעות)**

**צוות:** Team 10

**משימות:**
- [ ] ביצוע Re-Scan מלא
- [ ] עדכון Page Tracker
- [ ] עדכון מסכי עבודה
- [ ] דוח סיכום

---

## ✅ Checklist מימוש

### **שלב 1: תיקונים קריטיים (56 שעות):**

- [ ] UAI חובה לכל העמודים (16 שעות)
- [ ] CSS Load Verification (4 שעות)
- [ ] ניקוי טעינת סקריפטים (8 שעות)
- [ ] חוזי UAI + PDSC סופיים (24 שעות)
- [ ] Namespace UAI (4 שעות)

### **שלב 2: Re-Scan (4 שעות):**

- [ ] ביצוע Re-Scan מלא
- [ ] עדכון Page Tracker
- [ ] עדכון מסכי עבודה
- [ ] דוח סיכום

---

## 🎯 Timeline סופי

**סה"כ:** 60 שעות

- **שלב 1:** 56 שעות (תיקונים קריטיים)
- **שלב 2:** 4 שעות (Re-Scan ועדכון)

---

## ⚠️ אזהרות קריטיות

1. **UAI חובה** - אין אישור לעמודים חדשים עד סיום retrofit
2. **CSS Load Verification חובה** - הבדיקה חייבת להפיל עמוד אם סדר ה-CSS שגוי
3. **חוזים סופיים חובה** - לא ניתן להתחיל מימוש ללא חוזים חתומים
4. **Namespace עקבי חובה** - `window.UAI.config` בכל המסמכים והדוגמאות

---

## 🔗 קבצים קשורים

### **מסמכי תיקונים:**
- `TEAM_10_CRITICAL_FIXES_REQUIRED.md` ✅
- `TEAM_10_TO_TEAM_30_CRITICAL_FIXES_UAI.md` ✅
- `TEAM_10_TO_TEAM_30_40_CSS_VERIFICATION_CRITICAL.md` ✅
- `TEAM_10_TO_TEAM_30_NAMESPACE_UAI_CRITICAL.md` ✅

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**

**log_entry | [Team 10] | CRITICAL_FIXES | IMPLEMENTATION_PLAN | RED | 2026-02-07**
