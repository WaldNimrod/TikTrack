# 📋 מסך עבודה: Phase 1.8 - Team 40 (Design)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 40 (UI Assets & Design)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**מסך עבודה מפורט למימוש Phase 1.8 - Infrastructure & Retrofit עבור Team 40.**

**מקור:** `ARCHITECT_PHASE_1_8_DETAILED_STRATEGY.md`

---

## 🔴 תיקונים קריטיים נדרשים לפני המשך

**⚠️ BLOCKING:** התיקון הבא חובה לפני אישור המשך:

**CSS Load Verification - אכיפה אמיתית** - Integration ב-DOMStage + הכרעה על כלל CSS

**מסמך:** `TEAM_10_TO_TEAM_30_40_CSS_VERIFICATION_CRITICAL.md`

---

## 📋 שלב 2: בניית המנוע - CSS Layering (8 שעות)

### **משימה 2.1: הטמעת CSS Verifier ב-DOMStage** (8 שעות)

**דרישות:**

#### **2.1.1. עדכון cssLoadVerifier.js** (4 שעות)
- [ ] עדכון `cssLoadVerifier.js` לפי `TEAM_40_CSS_LOAD_VERIFICATION_SPEC.md`
- [ ] וידוא שכל ה-Methods מיושמים:
  - [ ] `verifyCSSLoadOrder()` - פונקציה ראשית
  - [ ] `checkCSSLoaded()` - בדיקת טעינת קובץ CSS
  - [ ] `checkCSSVariables()` - בדיקת זמינות משתנים
  - [ ] `checkLoadingOrder()` - בדיקת סדר טעינה
- [ ] Error Handling עם Error Codes
- [ ] תמיכה ב-Strict Mode / Non-Strict Mode
- [ ] Export ל-UAI DOMStage

**קבצים:**
- `ui/src/components/core/cssLoadVerifier.js` (קיים, לעדכון/להשלים)

---

#### **2.1.2. שילוב ב-DOMStage** (4 שעות)
- [ ] Integration של `cssLoadVerifier.js` ב-`DOMStage.js`
- [ ] בדיקת סדר טעינה: Pico -> Base -> Components
- [ ] עצירת Lifecycle אם הבדיקה נכשלה
- [ ] Error Handling במהלך Lifecycle
- [ ] Events: `css-verified`, `css-verification-failed`

**דרישות סדר טעינה:**
1. **Pico CSS** - `pico.min.css` (אם נדרש)
2. **Base CSS** - `phoenix-base.css` (SSOT - CSS Variables)
3. **Components CSS** - קבצי CSS נוספים

**קבצים:**
- `ui/src/components/core/stages/DOMStage.js` (לעדכון)

---

## 📋 שלב 3: הסבה (Retrofit) - וידוא סדר טעינה (4 שעות)

### **משימה 3.1: וידוא סדר טעינה בעמודים קיימים (D15)** (4 שעות)

**דרישות:**
- [ ] בדיקת סדר טעינת CSS בכל עמודי D15:
  - [ ] D15_LOGIN.html
  - [ ] D15_REGISTER.html
  - [ ] D15_RESET_PWD.html
  - [ ] D15_INDEX.html
  - [ ] D15_PROF_VIEW.html
- [ ] וידוא שכל העמודים נטענים בסדר: Pico -> Base -> Components
- [ ] תיקון סדר טעינה אם נדרש
- [ ] בדיקת תקינות

**קבצים:**
- `ui/src/views/identity/D15_LOGIN.html` (לבדיקה)
- `ui/src/views/identity/D15_REGISTER.html` (לבדיקה)
- `ui/src/views/identity/D15_RESET_PWD.html` (לבדיקה)
- `ui/src/views/dashboard/D15_INDEX.html` (לבדיקה)
- `ui/src/views/profile/D15_PROF_VIEW.html` (לבדיקה)

---

## 📋 תוצר סופי נדרש

### **קבצים:**
- [ ] `ui/src/components/core/cssLoadVerifier.js` - מושלם
- [ ] `ui/src/components/core/stages/DOMStage.js` - מעודכן עם CSS Verifier
- [ ] כל עמודי D15 - סדר טעינת CSS מתוקן

### **תיעוד:**
- [ ] דוגמאות שימוש ב-CSS Verifier
- [ ] Integration Examples עם DOMStage
- [ ] Validation Rules

---

## ✅ Checklist מימוש

### **שלב 2: בניית המנוע (8 שעות):**
- [ ] עדכון cssLoadVerifier.js
- [ ] שילוב ב-DOMStage
- [ ] בדיקת תקינות

### **שלב 3: הסבה (4 שעות):**
- [ ] וידוא סדר טעינה בעמודים קיימים (D15)
- [ ] תיקון סדר טעינה אם נדרש
- [ ] בדיקת תקינות

---

## 🎯 Timeline סופי

**סה"כ:** 12 שעות

- **שלב 2:** 8 שעות (בניית המנוע)
- **שלב 3:** 4 שעות (הסבה)

---

## ⚠️ אזהרות קריטיות

1. **CSS Verifier חובה** - לא ניתן להתחיל Retrofit ללא CSS Verifier
2. **סדר טעינה חובה** - Pico -> Base -> Components
3. **phoenix-base.css חובה** - חייב להיטען לפני Components

---

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- אישור החלטות
- בדיקת תאימות
- תיאום עם Team 30 (DOMStage)

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **MANDATORY - PHASE 1.8**

**log_entry | [Team 10] | PHASE_1_8 | TEAM_40_WORK_PLAN | RED | 2026-02-07**
