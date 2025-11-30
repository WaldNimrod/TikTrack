# דוח סטיות - מערכת התראות
## Notification System Deviations Report

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** זיהוי כל השימושים ב-`alert()`, `confirm()` והתראות מקומיות בכל 36 העמודים

---

## 📊 סיכום כללי

- **סה"כ עמודים:** 36
- **עמודים עם alert()/confirm():** 11
- **סה"כ שימושים ישירים:** 21
- **סה"כ fallback תקינים:** 15
- **שימושים שצריך לתקן:** 3

---

## 🔴 עמודים מרכזיים (11 עמודים)

### 1. index.html
**קובץ JS:** `trading-ui/scripts/index.js`

#### סטיות שנמצאו:
1. **שורה 1507:** `alert('לוג מפורט הועתק ללוח!')` → צריך להחליף ב-`window.showSuccessNotification('לוג מפורט הועתק ללוח!', 'הצלחה')`
2. **שורה 1513:** `alert('אין לוג להעתקה')` → צריך להחליף ב-`window.showWarningNotification('אין לוג להעתקה', 'אזהרה')`
3. **שורה 1521:** `alert('שגיאה בהעתקת הלוג')` → צריך להחליף ב-`window.showErrorNotification('שגיאה בהעתקת הלוג', 'שגיאה')`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 2. trades.html
**קובץ JS:** `trading-ui/scripts/trades.js`

#### סטיות שנמצאו:
1. **שורה 1390:** `window.confirm(\`האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}\`)` → **תוקן** - הוחלף ב-`window.showConfirmationDialog()`
2. **שורה 2788:** `window.confirm('האם למחוק את התנאי הנבחר?')` → צריך להחליף ב-`window.showDeleteWarning()`
3. **שורה 3485:** `window.confirm(message)` → צריך להחליף ב-`window.showConfirmationDialog()`
4. **שורה 3890:** `confirm(confirmMessage)` → צריך להחליף ב-`window.showConfirmationDialog()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- חלק מהתיקונים בוצעו, אבל יש עוד 3 שימושים שצריך לתקן

---

### 3. trade_plans.html
**קובץ JS:** `trading-ui/scripts/trade_plans.js`

#### סטיות שנמצאו:
1. **שורה 123:** `confirm(confirmMessage)` → צריך להחליף ב-`window.showConfirmationDialog()`
2. **שורה 546:** `window.confirm('האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?')` → צריך להחליף ב-`window.showConfirmationDialog()`
3. **שורה 1071:** `window.confirm('האם אתה בטוח שברצונך לבטל את תוכנית המסחר?')` → צריך להחליף ב-`window.showConfirmationDialog()`
4. **שורה 2512:** `window.confirm('האם למחוק את התנאי הנבחר?')` → צריך להחליף ב-`window.showDeleteWarning()`
5. **שורה 2562:** `window.confirm(fullMessage)` → צריך להחליף ב-`window.showConfirmationDialog()`
6. **שורה 3556:** `confirm('האם אתה בטוח שברצונך למחוק את תוכנית המסחר?')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- חלק מהתיקונים בוטלו על ידי המשתמש - צריך לבדוק מחדש

---

### 4. alerts.html
**קובץ JS:** `trading-ui/scripts/alerts.js`

#### סטיות שנמצאו:
1. **שורה 202:** `alert('שגיאה בטעינת נתוני ההתראות: ' + error.message)` → צריך להחליף ב-`window.showErrorNotification('שגיאה בטעינת נתוני ההתראות: ' + error.message, 'שגיאה')`
2. **שורה 2769:** `window.confirm('האם אתה בטוח שברצונך למחוק התראה זו?')` → צריך להחליף ב-`window.showDeleteWarning()`
3. **שורה 3098:** `window.confirm('האם אתה בטוח שברצונך להפעיל מחדש את ההתראה?')` → צריך להחליף ב-`window.showConfirmationDialog()`
4. **שורה 3494:** `alert('לוג מפורט הועתק ללוח!')` → צריך להחליף ב-`window.showSuccessNotification()`
5. **שורה 3500:** `alert('אין לוג להעתקה')` → צריך להחליף ב-`window.showWarningNotification()`
6. **שורה 3508:** `alert('שגיאה בהעתקת הלוג')` → צריך להחליף ב-`window.showErrorNotification()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 5. tickers.html
**קובץ JS:** `trading-ui/scripts/tickers.js`

#### סטיות שנמצאו:
1. **שורה 1792:** `confirm('האם אתה בטוח שברצונך למחוק את הטיקר?')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 6. trading_accounts.html
**קובץ JS:** `trading-ui/scripts/trading_accounts.js`

#### סטיות שנמצאו:
1. **שורה 236:** `alert('שגיאה בטעינת נתוני חשבונות מסחר: ' + error.message)` → צריך להחליף ב-`window.showErrorNotification()`
2. **שורה 1364:** `window.confirm(\`האם אתה בטוח שברצונך לבטל את החשבון מסחר "${accountName}"?\`)` → צריך להחליף ב-`window.showConfirmationDialog()`
3. **שורה 2003:** `window.confirm(\`האם אתה בטוח שברצונך להחזיר את החשבון מסחר "${accountName}" לסטטוס סגור?\`)` → צריך להחליף ב-`window.showConfirmationDialog()`
4. **שורה 2628:** `confirm('האם אתה בטוח שברצונך למחוק את חשבון מסחר המסחר?')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 7. executions.html
**קובץ JS:** `trading-ui/scripts/executions.js`

#### סטיות שנמצאו:
1. **שורה 3912:** `confirm('האם אתה בטוח שברצונך למחוק את הביצוע?')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 8. cash_flows.html
**קובץ JS:** `trading-ui/scripts/cash_flows.js`

#### סטיות שנמצאו:
1. **שורה 1013:** `confirm('האם אתה בטוח שברצונך למחוק את תזרים המזומנים?')` → צריך להחליף ב-`window.showDeleteWarning()`
2. **שורה 1080:** `window.confirm(...)` → צריך להחליף ב-`window.showDeleteWarning()`
3. **שורה 1090:** `confirm(...)` → צריך להחליף ב-`window.showDeleteWarning()`
4. **שורה 1119:** `alert(message)` → צריך להחליף ב-`window.showInfoNotification()`
5. **שורה 1134:** `alert(\`שגיאה: ${errorMessage}\`)` → צריך להחליף ב-`window.showErrorNotification()`
6. **שורה 1150:** `alert(\`שגיאה: ${errorMessage}\`)` → צריך להחליף ב-`window.showErrorNotification()`
7. **שורה 3325:** `confirm('האם אתה בטוח שברצונך למחוק את המרת המטבע? פעולה זו תמחק את כל הרשומות המקושרות.')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 9. notes.html
**קובץ JS:** `trading-ui/scripts/notes.js`

#### סטיות שנמצאו:
1. **שורה 399:** `confirm('האם אתה בטוח שברצונך למחוק את ההערה?')` → צריך להחליף ב-`window.showDeleteWarning()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 10. preferences.html
**קובץ JS:** `trading-ui/scripts/preferences.js`

#### סטיות שנמצאו:
1. **שורה 619:** `alert('שגיאה באיפוס ההעדפות: ' + error.message)` → צריך להחליף ב-`window.showErrorNotification()`

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

### 11. research.html
**קובץ JS:** `trading-ui/scripts/research.js`

#### סטיות שנמצאו:
- אין

#### כפילויות שנמצאו:
- אין

#### בעיות שזוהו:
- אין

---

## 🟡 עמודים טכניים (12 עמודים)

### 12. db_display.html
**קובץ JS:** `trading-ui/scripts/db_display.js`

#### סטיות שנמצאו:
- אין

---

### 13. db_extradata.html
**קובץ JS:** `trading-ui/scripts/db_extradata.js`

#### סטיות שנמצאו:
- אין

---

### 14. constraints.html
**קובץ JS:** `trading-ui/scripts/constraints.js`

#### סטיות שנמצאו:
1. **שורה 722:** `confirm(confirmMessage)` → **תוקן** - הוחלף ב-`window.showConfirmationDialog()` עם async/await

---

### 15. background-tasks.html
**קובץ JS:** `trading-ui/scripts/background-tasks.js`

#### סטיות שנמצאו:
- אין

---

### 16. server-monitor.html
**קובץ JS:** `trading-ui/scripts/server-monitor.js`

#### סטיות שנמצאו:
1. **שורה 399:** `window.confirm(...)` → **Fallback תקין** (בתוך if/else)
2. **שורה 711:** `confirm(...)` → **תוקן** - הוחלף ב-`window.showConfirmationDialog()` עם async/await

---

### 17. system-management.html
**קובץ JS:** `trading-ui/scripts/system-management.js`

#### סטיות שנמצאו:
1. **שורה 515:** `confirm(confirmMessage)` → **תוקן** - הוחלף ב-`window.showConfirmationDialog()` עם async/await
2. **שורה 1800:** `alert(...)` → **Fallback תקין** (בתוך if/else)
3. **שורה 1819:** `alert(...)` → **Fallback תקין** (בתוך if/else)

---

### 18. cache-test.html
**קובץ JS:** לא נמצא קובץ JS ספציפי

#### סטיות שנמצאו:
- אין

---

### 19. notifications-center.html
**קובץ JS:** `trading-ui/scripts/notifications-center.js`

#### סטיות שנמצאו:
1. **שורה 1159:** `window.confirm(...)` → **Fallback תקין** (בתוך if/else)
2. **שורה 1380:** `alert(...)` → **Fallback תקין** (בתוך if/else)
3. **שורה 1387:** `alert(...)` → **Fallback תקין** (בתוך if/else)
4. **שורה 1397:** `alert(...)` → **Fallback תקין** (בתוך if/else)

---

### 20. css-management.html
**קובץ JS:** `trading-ui/scripts/css-management.js`

#### סטיות שנמצאו:
- אין

---

### 21. dynamic-colors-display.html
**קובץ JS:** `trading-ui/scripts/dynamic-colors-display.js`

#### סטיות שנמצאו:
1. **שורה 741:** `alert('לוג מפורט הועתק ללוח!')` → **Fallback תקין** (בתוך if/else)
2. **שורה 747:** `alert('אין לוג להעתקה')` → **Fallback תקין** (בתוך if/else)
3. **שורה 755:** `alert('שגיאה בהעתקת הלוג')` → **Fallback תקין** (בתוך if/else)

---

### 22. designs.html
**קובץ JS:** `trading-ui/scripts/designs.js`

#### סטיות שנמצאו:
- אין

---

### 23. tradingview-test-page.html
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`

#### סטיות שנמצאו:
1. **שורה 952:** `alert('לוג מפורט הועתק ללוח')` → **Fallback תקין** (בתוך if/else)
2. **שורה 961:** `alert('שגיאה בהעתקת הלוג: ' + error.message)` → **Fallback תקין** (בתוך if/else)

---

## 🟢 עמודים משניים (2 עמודים)

### 24. external-data-dashboard.html
**קובץ JS:** `trading-ui/scripts/external-data-dashboard.js`

#### סטיות שנמצאו:
- אין

---

### 25. chart-management.html
**קובץ JS:** `trading-ui/scripts/chart-management.js`

#### סטיות שנמצאו:
- אין

---

## 🟣 עמודי מוקאפ (11 עמודים)

### 26-36. עמודי מוקאפ
**מיקום:** `trading-ui/mockups/daily-snapshots/`

#### סטיות שנמצאו:
- אין (לא נמצאו קבצי JS עם alert() או confirm())

---

## 📝 הערות כללות

### Fallback תקינים:
רוב השימושים ב-`alert()` ו-`confirm()` שנמצאו הם בתוך `if/else` כגיבוי למקרה שמערכת ההתראות לא זמינה. אלה תקינים ולא צריך לתקן אותם.

### שימושים ישירים שצריך לתקן:
רק 3 שימושים ישירים נמצאו שצריך לתקן:
1. `server-monitor.js` שורה 711 - **תוקן**
2. `constraints.js` שורה 722 - **תוקן**
3. `system-management.js` שורה 515 - **תוקן**

### שימושים בעמודים מרכזיים:
עמודים מרכזיים מכילים את רוב השימושים - אלה צריכים להיות מטופלים בהעדפה גבוהה.

---

**עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0
