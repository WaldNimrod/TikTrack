# רשימת משימות - בדיקת עמודים בסיסיים 2

## 🎯 מטרה
לבדוק את כל העמודים הבסיסיים במערכת, לחפש פונקציות כפולות ולהחליף אותן בפונקציות גלובליות.

## ✅ פונקציות כפולות שכבר נמצאו ותוקנו

### 1. **alerts.js** ✅
- **`closeModal`** → הוחלף ב-`window.closeModal`
- **`showAddAlertModal`** → הוחלף ב-`window.showModal`
- **`editAlert`** → הוחלף ב-`window.showModal`
- **`translateStatus`** → הוחלף ב-`window.translateTradeStatus`
- **`translateType`** → הוחלף ב-`window.translateTradeType`
- **קריאות API** → תוקנו מ-`window.apiCall` ל-`fetch` רגיל
- **`confirm()`** → הוחלף ב-`window.showDeleteWarning`
- **`showModalNotification`** → הוחלף ב-`window.showSuccessNotification` ו-`window.showErrorNotification`

### 2. **simple-filter.js** ✅
- **`translateStatus`** → הוחלף ב-`window.translateTradeStatus`
- **`translateType`** → הוחלף ב-`window.translateTradeType`

## 📋 רשימת עמודים לבדיקה

### 1. **accounts.html + accounts.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 2. **tickers.html + tickers.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 3. **executions.html + executions.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 4. **trades.html + trades.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 5. **trade_plans.html + trade_plans.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 6. **cash_flows.html + cash_flows.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

### 7. **notes.html + notes.js**
- [ ] בדיקת פונקציות `closeModal`
- [ ] בדיקת פונקציות `showModal`
- [ ] בדיקת פונקציות תרגום
- [ ] בדיקת קריאות API
- [ ] בדיקת פונקציות ולידציה

## 🔍 פונקציות גלובליות זמינות

### פונקציות מודלים:
- `window.showModal(modalId, options)`
- `window.closeModal(modalId)`
- `window.showModalNotification(type, title, message, modalId)`

### פונקציות תרגום:
- `window.translateTradeStatus(status)`
- `window.translateTradeType(type)`
- `window.translateAccountStatus(status)`
- `window.translateTickerStatus(status)`
- `window.translateAlertStatus(status)`
- `window.translateCashFlowType(type)`

### פונקציות API:
- `window.apiCall(url, options)`
- `window.loadDataFromAPI(endpoint)`

### פונקציות הודעות:
- `window.showErrorNotification(title, message)`
- `window.showSuccessNotification(title, message)`
- `window.showWarningNotification(title, message)`

### פונקציות אזהרות:
- `window.showDeleteWarning(itemType, itemName, onConfirm, onCancel)`
- `window.showLinkedItemsWarning(itemType, linkedCount, onConfirm, onCancel)`
- `window.showValidationWarning(field, message)`
- `window.showWarning(type, data, options, onConfirm, onCancel)`

## 📝 הערות חשובות

### פונקציות שצריכות להישאר מקומיות:
- פונקציות ספציפיות לעמוד (למשל `loadAlertsData`, `updateAlertsTable`)
- פונקציות ולידציה ספציפיות (למשל `validateAlertStatusCombination`)
- פונקציות UI ספציפיות (למשל `populateRelatedObjects`)

## 📚 תיעוד נוסף

- [מערכת התראות והודעות](../frontend/NOTIFICATION_SYSTEM.md) - הסבר מפורט על ההבדל בין מערכת ההתראות למערכת ההודעות

### פונקציות שצריכות להיות גלובליות:
- פונקציות מודלים (סגירה, פתיחה)
- פונקציות תרגום
- פונקציות API בסיסיות
- פונקציות הודעות

## 🚀 שלב הבא
לאחר השלמת בדיקת כל העמודים, יש לעדכן את התיעוד ולהסיר פונקציות כפולות מיותרות.

---
**תאריך יצירה:** 26 באוגוסט 2025  
**מצב:** בתהליך  
**עדכון אחרון:** 26 באוגוסט 2025
