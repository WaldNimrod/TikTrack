# 🔴 תיקונים קריטיים נדרשים לפני אישור המשך

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**  
**עדיפות:** 🔴 **P0 - CRITICAL**

---

## 🎯 Executive Summary

**רשימת תיקונים קריטיים נדרשים לפני אישור המשך Phase 1.8.**

**מקור:** החלטות האדריכלית וסקירת Team 10

---

## 📋 תיקונים קריטיים נדרשים

### **1. UAI חובה לכל העמודים** 🔴 **CRITICAL**

**דרישה:** מעבר מלא של 100% מהעמודים הקיימים ל-UAI (Config חיצוני + UnifiedAppInit.js)

**עמודים קיימים לבדיקה:**
- [ ] D15_LOGIN.html
- [ ] D15_REGISTER.html
- [ ] D15_RESET_PWD.html
- [ ] D15_INDEX.html (Dashboard)
- [ ] D15_PROF_VIEW.html (Profile)
- [ ] trading_accounts.html (D16)
- [ ] cash_flows.html (D21)
- [ ] brokers_fees.html (D18)

**דרישות לכל עמוד:**
- [ ] יצירת `pageConfig.js` חיצוני (לא inline)
- [ ] הסרת כל hardcoded scripts מה-HTML
- [ ] הוספת UAI entry point (`UnifiedAppInit.js`)
- [ ] הוספת טעינת Config JS לפני UAI
- [ ] בדיקת תקינות

**צוות אחראי:** Team 30

**Timeline:** 16 שעות

---

### **2. CSS Load Verification - אכיפה אמיתית** 🔴 **CRITICAL**

**דרישה:** אינטגרציה של CSSLoadVerifier בתוך DOMStage (או שלב מחייב אחר)

**דרישות:**
- [ ] Integration של `cssLoadVerifier.js` ב-`DOMStage.js`
- [ ] הבדיקה חייבת להפיל עמוד אם סדר ה-CSS שגוי (strict mode)
- [ ] להכריע סופית את הכלל:
  - **אופציה א:** `phoenix-base.css` ראשון תמיד
  - **אופציה ב:** ראשון מבין Phoenix בלבד (אם Pico קודם מותר)

**קבצים לעדכון:**
- `ui/src/components/core/stages/DOMStage.js` (לעדכן)
- `ui/src/components/core/cssLoadVerifier.js` (לעדכן אם נדרש)

**צוות אחראי:** Team 30 + Team 40

**Timeline:** 4 שעות

---

### **3. ניקוי טעינת סקריפטים ישנה** 🔴 **CRITICAL**

**דרישה:** להסיר Hardcoded scripts מה-HTML הישן ולהחליף ב-UAI entry point + Config JS

**עמודים לבדיקה:**
- [ ] D15_LOGIN.html
- [ ] D15_REGISTER.html
- [ ] D15_RESET_PWD.html
- [ ] D15_INDEX.html
- [ ] D15_PROF_VIEW.html
- [ ] trading_accounts.html
- [ ] cash_flows.html
- [ ] brokers_fees.html

**דרישות לכל עמוד:**
- [ ] הסרת כל `<script>` tags מה-HTML (חוץ מ-UAI entry point)
- [ ] הוספת טעינת `pageConfig.js` לפני UAI
- [ ] הוספת טעינת `UnifiedAppInit.js` אחרי Config
- [ ] בדיקת תקינות

**צוות אחראי:** Team 30

**Timeline:** 8 שעות

---

### **4. חוזי UAI + PDSC סופיים** 🔴 **CRITICAL**

**דרישה:** לפרסם גרסה סופית חתומה (UAI + PDSC)

**חוזים נדרשים:**

#### **4.1. UAI Config Contract:**
- [ ] `TEAM_30_UAI_CONFIG_CONTRACT.md` - גרסה סופית
- [ ] כל דוגמאות inline JS הוסרו
- [ ] כל דוגמאות external JS נוספו
- [ ] naming מאוחד (`window.UAI.config`)
- [ ] Validation function מעודכן
- [ ] חתימה סופית

#### **4.2. PDSC Boundary Contract:**
- [ ] `TEAM_20_30_PDSC_SHARED_BOUNDARY_CONTRACT.md` - גרסה סופית
- [ ] כל הנושאים מוסכמים
- [ ] דוגמאות קוד משותפות נוספו
- [ ] תיעוד Integration Points הושלם
- [ ] Validation Rules מוסכמים
- [ ] חתימה סופית

**צוותים אחראים:** Team 20 + Team 30

**Timeline:** 24 שעות (כולל סשן חירום)

---

### **5. Namespace UAI** 🔴 **CRITICAL**

**דרישה:** לוודא `window.UAI.config` עקבי בכל המסמכים והדוגמאות

**דרישות:**
- [ ] לעדכן כל המסמכים מ-`window.UAIConfig` ל-`window.UAI.config`
- [ ] לעדכן כל הדוגמאות בקוד
- [ ] אם נשאר fallback ל-`window.UAIConfig`, להגדיר כ-legacy בלבד במפורש
- [ ] לעדכן `DOMStage.js` (שורה 27)
- [ ] לעדכן `UnifiedAppInit.js` (אם נדרש)

**קבצים לעדכון:**
- `_COMMUNICATION/team_30/TEAM_30_UAI_CONFIG_CONTRACT.md`
- `ui/src/components/core/stages/DOMStage.js`
- `ui/src/components/core/UnifiedAppInit.js` (אם נדרש)
- כל המסמכים עם דוגמאות UAI

**צוות אחראי:** Team 30

**Timeline:** 4 שעות

---

## ✅ Checklist מימוש

### **שלב 1: תיקונים קריטיים (56 שעות):**

#### **1.1. UAI חובה לכל העמודים (16 שעות):**
- [ ] יצירת `pageConfig.js` לכל עמוד
- [ ] הסרת hardcoded scripts
- [ ] הוספת UAI entry point
- [ ] בדיקת תקינות

#### **1.2. CSS Load Verification (4 שעות):**
- [ ] Integration ב-DOMStage
- [ ] הכרעה על כלל CSS
- [ ] בדיקת תקינות

#### **1.3. ניקוי טעינת סקריפטים (8 שעות):**
- [ ] הסרת hardcoded scripts מכל העמודים
- [ ] הוספת UAI entry point
- [ ] בדיקת תקינות

#### **1.4. חוזי UAI + PDSC סופיים (24 שעות):**
- [ ] סשן חירום Team 20 + Team 30
- [ ] השלמת UAI Config Contract
- [ ] השלמת PDSC Boundary Contract
- [ ] חתימה סופית

#### **1.5. Namespace UAI (4 שעות):**
- [ ] עדכון כל המסמכים
- [ ] עדכון כל הדוגמאות
- [ ] הגדרת legacy fallback

---

### **שלב 2: Re-Scan ועדכון סטטוס:**

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

## 📞 תמיכה מ-Team 10

**Team 10 זמין לתמיכה:**
- תיאום בין צוותים
- אישור החלטות
- בדיקת תאימות
- Re-Scan ועדכון סטטוס

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-07  
**סטטוס:** 🔴 **CRITICAL - BLOCKING**

**log_entry | [Team 10] | CRITICAL_FIXES | REQUIRED | RED | 2026-02-07**
