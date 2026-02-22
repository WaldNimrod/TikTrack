# 📋 סדר טעינת CSS - מדריך מפורט
**project_domain:** TIKTRACK

**id:** `CSS_LOADING_ORDER`  
**owner:** Team 10 (The Gateway) + Team 40 (UI Assets & Design)  
**status:** 🔒 **SSOT - MANDATORY**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-07  
**version:** v1.1

---

**מיקום:** `documentation/04-DESIGN_UX_UI/`  
**תוקף:** מחייב לכל המערכת  
**סטטוס:** ✅ **ACTIVE - MANDATORY**

---

## 🎯 מטרת המסמך

מסמך זה מגדיר את סדר הטעינה המדויק של קבצי CSS במערכת Phoenix V2. סדר הטעינה הוא **קריטי** - שינוי בסדר יגרום לשבירת סגנונות.

**קישור לנוהל CSS:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`  
**קישור ל-ITCSS:** `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`

---

## ⚠️ חוק ברזל: סדר הטעינה הוא קדוש

**אין לשנות את סדר הטעינה!** כל שינוי יגרום לשבירת סגנונות.

---

## 🔒 דפי HTML סטטיים (לא React) — חובה יישור ל-SSOT

**סטטוס:** Doc Alignment — מניעת drift בסדר טעינת CSS (2026-02-07)

- **כל דפי HTML שאינם React** (כולל D16, D18, D21 וכל עמוד סטטיים עתידיים) **חייבים** ליישר את סדר טעינת ה-CSS **בדיוק** לפי ה-SSOT המפורט במסמך זה.
- ה-SSOT עצמו תקין; הבעיה היא **ביישום בפועל** בדפי HTML — יש לוודא שכל קובץ HTML מציג את אותו סדר טעינה כמו בסעיף "📚 סדר טעינה מדויק" ובדוגמה "דוגמה 3: בלופרינט HTML".
- **סדר מחייב בדפי HTML:**  
  1. Pico CSS (CDN)  
  2. phoenix-base.css  
  3. phoenix-components.css (או מקביל לפי מבנה הפרויקט)  
  4. phoenix-header.css  
  5. Page-Specific CSS  
- כל נהלי Blueprint / HTML pages **חייבים** להפנות למסמך זה (קריאת חובה). ראה `documentation/05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md` — חובה להפניה ל-`CSS_LOADING_ORDER.md`.

**מטרה:** למנוע חזרה של drift בסדר טעינת CSS בדפי HTML עתידיים.

---

## 📚 סדר טעינה מדויק (ITCSS)

### **1. Pico CSS (CDN)**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
```

**מיקום:** `ui/index.html` (CDN)  
**תפקיד:** Reset & Base (Generic Layer)  
**ITCSS Layer:** Generic  
**מדוע ראשון:** מספק reset ו-base styles שעליהם נבנים כל הסגנונות

**⚠️ חשוב:** Pico CSS נטען ב-`index.html` ולא ב-React Components.

---

### **2. phoenix-base.css**
```jsx
import './styles/phoenix-base.css';
```

**מיקום:** `ui/src/styles/phoenix-base.css`  
**טעינה:** `ui/src/main.jsx` (שורה 26)  
**תפקיד:** CSS Variables (SSOT) + Base Styles  
**ITCSS Layers:** Settings + Generic + Elements  
**מדוע שני:** מגדיר את כל ה-CSS Variables (SSOT) והסגנונות הבסיסיים

**תוכן:**
- CSS Variables (`:root`) - כל המשתנים של המערכת
- Base Typography (h1-h6, p, a)
- Form Elements Base (input, textarea, select, button)
- Reset overrides (נגד Pico CSS)

**⚠️ קריטי:** זהו ה-SSOT (Single Source of Truth) לכל ה-CSS Variables!

---

### **3. phoenix-components.css**
```jsx
import './styles/phoenix-components.css';
```

**מיקום:** `ui/src/styles/phoenix-components.css`  
**טעינה:** `ui/src/main.jsx` (שורה 29)  
**תפקיד:** LEGO Components (tt-container, tt-section, tt-section-row)  
**ITCSS Layer:** Objects  
**מדוע שלישי:** משתמש ב-CSS Variables מ-`phoenix-base.css`

**תוכן:**
- `tt-container` - קונטיינר חיצוני (max-width: 1400px)
- `tt-section` - יחידת תוכן עצמאית (רקע שקוף)
- `tt-section-row` - חלוקה פנימית ל-Flex/Grid alignment
- `.index-section__header` - כותרת סקשן
- `.index-section__body` - גוף סקשן

---

### **4. phoenix-header.css**
```jsx
import './styles/phoenix-header.css';
```

**מיקום:** `ui/src/styles/phoenix-header.css`  
**טעינה:** `ui/src/main.jsx` (שורה 32)  
**תפקיד:** Unified Header Styles  
**ITCSS Layer:** Components  
**מדוע רביעי:** משתמש ב-LEGO Components מ-`phoenix-components.css`

**תוכן:**
- `#unified-header` - Header container
- `.tiktrack-nav-list` - רשימת ניווט ראשית
- `.tiktrack-dropdown-menu` - תפריט נפתח
- `.separator` - מפריד בתפריט

---

### **5. Page-Specific CSS**

#### **5.1 D15_IDENTITY_STYLES.css (Auth Pages)**
```jsx
import './styles/D15_IDENTITY_STYLES.css';
```

**מיקום:** `ui/src/styles/D15_IDENTITY_STYLES.css`  
**טעינה:** `ui/src/main.jsx` (שורה 35)  
**תפקיד:** Auth Pages Styles (Login, Register, Password Reset)  
**ITCSS Layer:** Components  
**מדוע חמישי:** משתמש בכל הסגנונות הקודמים

**תוכן:**
- `.auth-page` - עמודי Auth
- `.auth-card` - כרטיסי Auth
- `.auth-form` - טפסי Auth

**⚠️ חשוב:** נטען ב-`main.jsx` כי כל עמודי Auth משתמשים בו.

---

#### **5.2 D15_DASHBOARD_STYLES.css (Dashboard Pages)**
```jsx
import '../styles/D15_DASHBOARD_STYLES.css';
```

**מיקום:** `ui/src/styles/D15_DASHBOARD_STYLES.css`  
**טעינה:** `ui/src/components/HomePage.jsx` (שורה 18)  
**תפקיד:** Dashboard Pages Styles (HomePage, Dashboard, etc.)  
**ITCSS Layer:** Components  
**מדוע אחרון:** משתמש בכל הסגנונות הקודמים

**תוכן:**
- `.active-alerts` - התראות פעילות
- `.info-summary` - סיכום מידע
- `.widget-placeholder` - וויגיטים
- `.portfolio-header-filters` - פילטרים פורטפוליו

**⚠️ חשוב:** נטען ב-`HomePage.jsx` כי רק עמודי Dashboard משתמשים בו.

---

## 📋 דוגמאות שימוש

### **דוגמה 1: עמוד Auth (Login)**
```jsx
// ui/src/cubes/identity/components/auth/LoginForm.jsx

// CSS כבר נטען ב-main.jsx:
// 1. Pico CSS (index.html)
// 2. phoenix-base.css (main.jsx)
// 3. phoenix-components.css (main.jsx)
// 4. phoenix-header.css (main.jsx)
// 5. D15_IDENTITY_STYLES.css (main.jsx)

// אין צורך בטעינה נוספת!
```

---

### **דוגמה 2: עמוד Dashboard (HomePage)**
```jsx
// ui/src/components/HomePage.jsx

// CSS כבר נטען ב-main.jsx:
// 1. Pico CSS (index.html)
// 2. phoenix-base.css (main.jsx)
// 3. phoenix-components.css (main.jsx)
// 4. phoenix-header.css (main.jsx)
// 5. D15_IDENTITY_STYLES.css (main.jsx)

// טעינה נוספת רק ל-Dashboard:
import '../styles/D15_DASHBOARD_STYLES.css';
```

---

### **דוגמה 3: בלופרינט HTML**
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <!-- CSS Loading Order (CRITICAL - DO NOT CHANGE): -->
  
  <!-- 1. Pico CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">
  
  <!-- 2. Phoenix Base Styles -->
  <link rel="stylesheet" href="./phoenix-base.css">
  
  <!-- 3. LEGO Components -->
  <link rel="stylesheet" href="./phoenix-components.css">
  
  <!-- 4. Header Component -->
  <link rel="stylesheet" href="./phoenix-header.css">
  
  <!-- 5. Page-Specific Styles -->
  <link rel="stylesheet" href="./D15_DASHBOARD_STYLES.css">
</head>
<body>
  <!-- Content -->
</body>
</html>
```

---

## 🔍 בדיקת סדר טעינה

### **כלי בדיקה אוטומטי:**
```bash
npm run check:css
```

**קובץ:** `ui/check-css-loading.js`  
**תפקיד:** בודק שכל קבצי ה-CSS נטענים בסדר הנכון

---

### **בדיקה ידנית:**

#### **1. בדיקה ב-DevTools:**
1. פתח DevTools (F12)
2. לך ל-Network tab
3. רענן את העמוד
4. סנן לפי CSS
5. בדוק את סדר הטעינה

#### **2. בדיקה ב-Console:**
```javascript
// בדיקת קבצי CSS שנטענו
Array.from(document.styleSheets).forEach((sheet, index) => {
  console.log(`${index + 1}. ${sheet.href || 'inline'}`);
});
```

---

## ⚠️ בעיות נפוצות ופתרונות

### **בעיה 1: סגנונות לא נטענים**
**סיבה:** קובץ CSS לא נטען או נטען בסדר לא נכון  
**פתרון:**
1. בדוק שהקובץ מיובא ב-React Component
2. בדוק את סדר הטעינה ב-`main.jsx`
3. הרץ `npm run check:css`

---

### **בעיה 2: סגנונות נדרסים**
**סיבה:** קובץ CSS נטען לפני קובץ אחר שצריך להיות לפניו  
**פתרון:**
1. בדוק את סדר הטעינה ב-`main.jsx`
2. ודא ש-`phoenix-base.css` נטען לפני כל קובץ אחר
3. ודא ש-`phoenix-components.css` נטען לפני `phoenix-header.css`

---

### **בעיה 3: CSS Variables לא עובדים**
**סיבה:** `phoenix-base.css` לא נטען או נטען אחרי קובץ שמשתמש בו  
**פתרון:**
1. ודא ש-`phoenix-base.css` נטען שני (אחרי Pico CSS)
2. בדוק שאין שגיאות בטעינת הקובץ ב-Console

---

## 📊 טבלת סדר טעינה

| # | קובץ | מיקום | טעינה | ITCSS Layer | תלות |
|---|------|--------|--------|-------------|------|
| 1 | Pico CSS | CDN | index.html | Generic | - |
| 2 | phoenix-base.css | ui/src/styles/ | main.jsx | Settings + Generic + Elements | Pico CSS |
| 3 | phoenix-components.css | ui/src/styles/ | main.jsx | Objects | phoenix-base.css |
| 4 | phoenix-header.css | ui/src/styles/ | main.jsx | Components | phoenix-components.css |
| 5 | D15_IDENTITY_STYLES.css | ui/src/styles/ | main.jsx | Components | phoenix-header.css |
| 6 | D15_DASHBOARD_STYLES.css | ui/src/styles/ | HomePage.jsx | Components | phoenix-header.css |

---

## ✅ Checklist לפני יישום עמוד חדש

- [ ] כל קבצי ה-CSS הנדרשים נטענים
- [ ] סדר הטעינה נכון (לפי הטבלה למעלה)
- [ ] אין כפילויות בטעינה
- [ ] CSS Variables עובדים (נבדק ב-DevTools)
- [ ] סגנונות לא נדרסים
- [ ] הרצת `npm run check:css` עברה בהצלחה

---

## 🔗 קישורים רלוונטיים

- **CSS Standards Protocol:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
- **CSS Classes Index:** `documentation/04-DESIGN_UX_UI/CSS_CLASSES_INDEX.md`
- **כלי בדיקה:** `ui/check-css-loading.js`
- **Blueprint Guidelines:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_31_BLUEPRINT_WORK_GUIDELINES_V2.md`
- **נוהל Blueprint/HTML pages (חובה להפניה למסמך זה):** `documentation/05-PROCEDURES/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md`

---

**עודכן על ידי:** Team 10 (עם Team 40) | 2026-02-07 (v1.1 — סעיף דפי HTML סטטיים + יישור נוהל)  
**סטטוס:** ✅ **ACTIVE - MANDATORY**
