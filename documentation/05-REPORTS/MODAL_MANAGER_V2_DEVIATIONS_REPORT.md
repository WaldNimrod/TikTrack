# דוח סטיות - Modal Manager V2
## Modal Manager V2 Deviations Report

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** זיהוי כל השימושים ב-`bootstrap.Modal` ישירות, פונקציות מקומיות למודלים וסטיות מהסטנדרט בכל 36 העמודים

---

## 📊 סיכום כללי

- **סה"כ עמודים:** 36
- **עמודים עם bootstrap.Modal ישיר:** 9
- **עמודים עם פונקציות מקומיות:** 7
- **עמודים שצריך לתקן:** 11
- **סה"כ מופעים של bootstrap.Modal:** 25
- **סה"כ פונקציות מקומיות:** 18

---

## 🔴 עמודים מרכזיים (11 עמודים)

### 1. trades.html
**קובץ JS:** `trading-ui/scripts/trades.js`

#### סטיות שנמצאו:
1. **שורה 1898-1908:** פונקציה מקומית `hideAddTradeModal()` - כבר משתמש ב-`ModalManagerV2.hideModal`, אבל עדיין wrapper מיותר
2. **שורה 1920-1930:** פונקציה מקומית `hideEditTradeModal()` - כבר משתמש ב-`ModalManagerV2.hideModal`, אבל עדיין wrapper מיותר
3. **שורה 2725:** פונקציה מקומית `openTradeConditionsModal()` - זה modal מיוחד לתנאים, צריך לבדוק אם אפשר להשתמש במערכת המרכזית

**המלצה:** להסיר wrappers מיותרים, להשאיר רק את `openTradeConditionsModal` כי זה modal מיוחד

---

### 2. trade_plans.html
**קובץ JS:** `trading-ui/scripts/trade_plans.js`

#### סטיות שנמצאו:
1. **שורה 1039:** `bootstrap.Modal.getOrCreateInstance(modalElement)` - צריך להחליף ב-`ModalManagerV2.showModal()`
2. **שורה 1044:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`
3. **שורה 1015:** פונקציה מקומית `openCancelTradePlanModal()` - modal מיוחד לביטול, צריך לבדוק אם אפשר להשתמש במערכת המרכזית
4. **שורה 2431:** פונקציה מקומית `openTradePlanConditionsModal()` - modal מיוחד לתנאים

**המלצה:** ליצור helper function ב-ModalManagerV2 למודלים מיוחדים, או להשאיר fallback מסודר

---

### 3. alerts.html
**קובץ JS:** `trading-ui/scripts/alerts.js`

#### סטיות שנמצאו:
1. **שורה 3718:** `bootstrap.Modal.getInstance()` - זה fallback, אבל צריך לבדוק למה ModalManagerV2 לא זמין

**המלצה:** לבדוק למה יש fallback, לתקן את הסיבה ולא להסיר את ה-fallback

---

### 4. executions.html
**קובץ JS:** `trading-ui/scripts/executions.js`

#### סטיות שנמצאו:
1. **שורה 2869:** `bootstrap.Modal.getInstance()` - סגירת modal, צריך להחליף ב-`ModalManagerV2.hideModal()`
2. **שורה 4636:** פונקציה מקומית `openTradeDetailsModal()` - משתמש ב-EntityDetailsModal, זה תקין

**המלצה:** להחליף את שורה 2869 ב-`ModalManagerV2.hideModal()`, להשאיר את `openTradeDetailsModal` כי זה modal מיוחד

---

### 5. notes.html
**קובץ JS:** `trading-ui/scripts/notes.js`

#### סטיות שנמצאו:
1. **שורה 2425:** `bootstrap.Modal.getOrCreateInstance()` - צריך להחליף ב-`ModalManagerV2.showModal()`
2. **שורה 2430:** `new bootstrap.Modal()` - fallback, צריך לבדוק
3. **שורה 1725:** `bootstrap.Modal.getInstance()` - סגירת modal, צריך להחליף ב-`ModalManagerV2.hideModal()`
4. **שורה 2595:** `bootstrap.Modal.getInstance()` - סגירת modal, צריך להחליף ב-`ModalManagerV2.hideModal()`

**המלצה:** להחליף כל השימושים ב-`ModalManagerV2.showModal()` ו-`ModalManagerV2.hideModal()`

---

## 🟠 עמודים טכניים (12 עמודים)

### 6. constraints.html
**קובץ JS:** `trading-ui/scripts/constraints.js`

#### סטיות שנמצאו:
1. **שורה 690:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`
2. **שורה 828:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`
3. **שורה 779:** פונקציה מקומית `showValidationModal()` - צריך להחליף במערכת המרכזית

**המלצה:** להחליף את כל השימושים במערכת המרכזית

---

### 7. system-management.html
**קובץ JS:** `trading-ui/scripts/system-management.js`

#### סטיות שנמצאו:
1. **שורה 915:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`

**המלצה:** להחליף במערכת המרכזית

---

### 8. notifications-center.html
**קובץ JS:** `trading-ui/scripts/notifications-center.js`

#### סטיות שנמצאו:
1. **שורה 1907:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`

**המלצה:** להחליף במערכת המרכזית

---

### 9. css-management.html
**קובץ JS:** `trading-ui/scripts/css-management.js`

#### סטיות שנמצאו:
- **15 מופעים** של `new bootstrap.Modal()` ו-`bootstrap.Modal.getInstance()`
- **7 פונקציות מקומיות** לפתיחת מודלים

**המלצה:** זה העמוד המורכב ביותר - צריך תיקון יסודי. כל המודלים כאן הם מודלים מיוחדים לניהול CSS, אולי צריך ליצור מערכת משנה או להשאיר אותם עם fallback מסודר ל-ModalManagerV2

---

## 🟡 עמודים משניים (2 עמודים)

✅ **כל העמודים המשניים תקינים**

---

## 🟢 עמודי מוקאפ (11 עמודים)

### 10. trade-history-page.html
**קובץ JS:** `trading-ui/scripts/trade-history-page.js`

#### סטיות שנמצאו:
1. **שורה 313:** `new bootstrap.Modal()` - צריך להחליף ב-`ModalManagerV2.showModal()`
2. **שורה 494:** `bootstrap.Modal.getInstance()` - צריך להחליף ב-`ModalManagerV2.hideModal()`
3. **שורה 311:** פונקציה מקומית `openTradeSelectorModal()` - modal מיוחד, צריך לבדוק

**המלצה:** להחליף במערכת המרכזית

---

### 11. economic-calendar-page.html
**קובץ JS:** `trading-ui/scripts/economic-calendar-page.js`

#### סטיות שנמצאו:
1. **שורה 538:** פונקציה מקומית `showSaveEventModal()` - צריך לבדוק

**המלצה:** לבדוק אם אפשר להשתמש במערכת המרכזית

---

## 🔵 מערכות כלליות

### ui-utils.js
**קובץ:** `trading-ui/scripts/ui-utils.js`

#### סטיות שנמצאו:
1. **שורה 263-282:** פונקציה `showModal()` שמשתמשת ב-`bootstrap.Modal` ישירות

**המלצה:** להחליף את `window.showModal` להשתמש ב-`ModalManagerV2.showModal()` או להסיר ולהשאיר רק את `ModalManagerV2`

---

## 📝 סיכום ותוכנית תיקון

### עדיפות 1 (קריטי):
1. ✅ **ui-utils.js** - להחליף `window.showModal`
2. ✅ **alerts.js** - לתקן fallback
3. ✅ **notes.js** - להחליף כל השימושים (4 מופעים)
4. ✅ **executions.js** - להחליף סגירת modal

### עדיפות 2 (חשוב):
5. ✅ **trade_plans.js** - להחליף bootstrap.Modal (2 מופעים)
6. ✅ **constraints.js** - להחליף כל השימושים (2 מופעים + פונקציה)
7. ✅ **system-management.js** - להחליף (1 מופע)
8. ✅ **notifications-center.js** - להחליף (1 מופע)

### עדיפות 3 (מודלים מיוחדים):
9. ⏳ **css-management.js** - 15 מופעים + 7 פונקציות - צריך דיון
10. ⏳ **trade-history-page.js** - 2 מופעים + פונקציה
11. ⏳ **economic-calendar-page.js** - פונקציה אחת

### עדיפות 4 (ניקוי):
12. ⏳ **trades.js** - להסיר wrappers מיותרים

---

**הדוח יתעדכן ככל שהתיקונים יתקדמו**
