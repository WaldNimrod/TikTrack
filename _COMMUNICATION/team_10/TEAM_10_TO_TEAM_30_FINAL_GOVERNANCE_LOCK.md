# 📡 הודעה: צוות 10 → Team 30 (Final Governance Lock - Retroactive Script Refactor)

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-02-02  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** FINAL_GOVERNANCE_LOCK | Status: 🛡️ **MANDATORY - RETROACTIVE**  
**Priority:** 🔴 **CRITICAL - G-BRIDGE BLOCKING**

---

## 📢 החלטה אדריכלית סופית: Final Governance Lock

האדריכלית הראשית הוציאה החלטה סופית ומחייבת. **כל חריגה תגרור פסילת G-Bridge מיידית.**

### **מקור:** `ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` (2026-02-02)

---

## 🛡️ עקרונות מחייבים

### **1. מבנה התיקיות והיררכיית Cubes** 🔴
- **`src/components/core/`:** רכיבים "טיפשים" (Button, Input, Spinner) - ללא לוגיקה עסקית
- **`src/cubes/shared/`:** רכיבים המשמשים יותר מקוביה אחת (PhoenixTable, Contexts, Transformers)
- **`src/cubes/{cube-name}/`:** יחידות לוגיות עצמאיות (Identity, Financial)
- **מיקום רכיבים קיימים:** `PhoenixTable` ו-`PhoenixFilterContext` עוברים ל-`cubes/shared` ✅ **כבר בוצע**

### **2. רספונסיביות אוטומטית (Fluid Design Mandate)** 📱
- **ללא קוד נפרד:** חל איסור על שימוש ב-Media Queries עבור גדלי פונטים וריווחים
- **הנחיה טכנית:** שימוש בלעדי ב-`clamp()`, `min()`, ו-`max()`
- **Layout:** שימוש ב-Grid עם `auto-fit` / `auto-fill`

### **3. אסטרטגיית Design Tokens** 🔴
- **SSOT:** קובץ `phoenix-base.css` הוא מקור האמת היחיד ✅ **כבר בוצע**
- **Cleanup:** קבצי ה-JSON מבוטלים ברמת הקוד ✅ **כבר בוצע**
- **הסרה:** יש להסיר את `design-tokens.css` מהפרויקט (אם עדיין קיים)

### **4. משמעת סקריפטים (The Clean Slate Rule)** 🔴 **RETROACTIVE**

#### **איסור מוחלט:**
- ❌ אין לכתוב תגי `<script>` בתוך קבצי HTML או JSX
- ❌ אין event handlers inline (`onclick`, `onchange`, `onsubmit`, וכו')

#### **רטרואקטיביות - חובה:**
**כל עמודי ה-Auth הקיימים חייבים לעבור Refactor להוצאת הלוגיקה לקבצים חיצוניים.**

---

## 🎯 משימה חדשה: שלב 3.1.6 - Refactor רטרואקטיבי

**תוכנית עבודה:** `TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - שלב 3.1.6

### **משימות:**

#### **3.1.6.1 סריקה מלאה של כל קבצי Auth קיימים**
- [ ] זיהוי כל תגי `<script>` בתוך קבצי HTML/JSX
- [ ] זיהוי כל event handlers inline (`onclick`, `onchange`, `onsubmit`, וכו')
- [ ] רשימת כל הלוגיקה שצריכה להיות מועברת לקבצים חיצוניים
- [ ] דוח ממצאים: רשימת כל הקבצים והלוגיקה שצריך להעביר

#### **3.1.6.2 יצירת קבצי JavaScript חיצוניים**
יצירת מבנה קבצים ב-`cubes/identity/scripts/`:

```
cubes/identity/scripts/
├── auth-login.js          # לוגיקת Login
├── auth-register.js       # לוגיקת Register
├── auth-reset-password.js # לוגיקת Reset Password
├── auth-profile.js        # לוגיקת Profile
└── auth-common.js         # פונקציות משותפות
```

**דרישות:**
- כל קובץ חייב לעמוד ב-`TT2_JS_STANDARDS_PROTOCOL.md`
- שימוש ב-`js-` prefixed classes
- Transformation Layer (`apiToReact` / `reactToApi`)
- Audit Trail (רק ב-`?debug`)
- JSDoc מלא עם `@legacyReference`

#### **3.1.6.3 העברת לוגיקה לקבצים חיצוניים**
- [ ] הסרת כל תגי `<script>` מקבצי HTML/JSX
- [ ] הסרת כל event handlers inline
- [ ] העברת כל הלוגיקה לקבצי JavaScript חיצוניים
- [ ] שימוש ב-`js-` prefixed classes במקום inline handlers

#### **3.1.6.4 עדכון קבצי HTML/JSX**
- [ ] הוספת `<script src="...">` בסוף `<body>` (לפני G-Bridge banner)
- [ ] הסרת כל תגי `<script>` פנימיים
- [ ] הסרת כל event handlers inline

#### **3.1.6.5 בדיקת עמידה**
- [ ] אין תגי `<script>` בתוך HTML/JSX
- [ ] אין event handlers inline
- [ ] כל הלוגיקה בקבצים חיצוניים
- [ ] שימוש ב-`js-` prefixed classes
- [ ] בדיקת G-Bridge - **חייבת לעבור (ירוק)** 🛡️ **CRITICAL**

---

## 📚 דוגמאות קוד

### **דוגמה 1: לפני (❌ לא נכון)**
```html
<!-- ❌ לא נכון - inline script -->
<form id="login-form">
  <input type="email" id="email" />
  <button onclick="handleLogin()">התחבר</button>
</form>

<script>
  function handleLogin() {
    // לוגיקה...
  }
</script>
```

### **דוגמה 2: אחרי (✅ נכון)**
```html
<!-- ✅ נכון - js- prefixed classes, אין inline handlers -->
<form id="login-form" class="js-login-form">
  <input type="email" id="email" class="js-email-input" />
  <button class="js-login-submit">התחבר</button>
</form>

<!-- Script בסוף body, לפני G-Bridge -->
<script src="./cubes/identity/scripts/auth-login.js"></script>
```

```javascript
// cubes/identity/scripts/auth-login.js
/**
 * Auth Login Manager
 * @legacyReference Legacy.auth.login()
 */
class AuthLoginManager {
  constructor() {
    this.form = document.querySelector('.js-login-form');
    this.emailInput = document.querySelector('.js-email-input');
    this.submitButton = document.querySelector('.js-login-submit');
    
    this.init();
  }
  
  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }
  
  async handleLogin() {
    // לוגיקה...
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AuthLoginManager();
});
```

---

## ⚠️ איסורים חשובים

### **אין תגי `<script>` בתוך HTML/JSX:**
- ❌ אין `<script>` בתוך `<head>`
- ❌ אין `<script>` בתוך `<body>`
- ✅ רק `<script src="...">` בסוף `<body>` (לפני G-Bridge)

### **אין event handlers inline:**
- ❌ אין `onclick="..."` 
- ❌ אין `onchange="..."`
- ❌ אין `onsubmit="..."`
- ✅ רק `js-` prefixed classes + event listeners בקבצים חיצוניים

---

## 🔍 קבצים לטיפול

### **קבצי Auth קיימים:**
- כל קבצי Login (HTML/JSX)
- כל קבצי Register (HTML/JSX)
- כל קבצי Reset Password (HTML/JSX)
- כל קבצי Profile (HTML/JSX)

### **מיקומים אפשריים:**
- `ui/src/cubes/identity/components/auth/` - Components React
- `ui/src/views/` - Views קיימים
- קבצי HTML בסטייג'ינג (אם יש)

---

## 📋 צעדים הבאים

1. **Team 30:** התחלת סריקה מלאה של קבצי Auth (משימה 3.1.6.1)
2. **Team 30:** יצירת מבנה קבצים ב-`cubes/identity/scripts/` (משימה 3.1.6.2)
3. **Team 30:** העברת לוגיקה לקבצים חיצוניים (משימה 3.1.6.3)
4. **Team 30:** עדכון קבצי HTML/JSX (משימה 3.1.6.4)
5. **Team 50:** בדיקת G-Bridge (משימה 3.1.6.5)

---

## 🔗 קישורים רלוונטיים

- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DECISION_LEGO_CUBES_FINAL.md` - החלטה אדריכלית סופית 🛡️ **FINAL GOVERNANCE LOCK**
- `_COMMUNICATION/team_10/TEAM_10_CSS_BLUEPRINT_REFACTOR_PLAN_V2.md` - תוכנית עבודה (שלב 3.1.6)
- `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md` - JS Standards Protocol

---

**Team 10 (The Gateway)**  
**Date:** 2026-02-02  
**Status:** 🛡️ **MANDATORY - RETROACTIVE - G-BRIDGE BLOCKING**

**⚠️ חשוב:** כל חריגה מהכללים תגרור פסילת G-Bridge מיידית. יש להקפיד על עמידה מלאה בכל הכללים.

**log_entry | [Team 10] | FINAL_GOVERNANCE_LOCK | TO_TEAM_30 | RED | 2026-02-02**
