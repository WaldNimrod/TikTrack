# דוח סטיות - Unified Table System Standardization
## Unified Table System Deviations Report

**תאריך יצירה:** 28 בינואר 2025  
**תאריך עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📊 בתהליך סריקה

---

## מטרת הדוח

דוח זה מפרט את כל הסטיות, כפילויות ובעיות שנמצאו בכל 36 העמודים במערכת ביחס לשימוש במערכת הטבלאות המאוחדת (Unified Table System).

---

## סיכום כללי

### סטטיסטיקות:
- **סה"כ עמודים נסרקים:** 0/36 (0%)
- **עמודים עם סטיות:** 0
- **פונקציות מקומיות שנמצאו:** 0
- **כפילויות קוד שנמצאו:** 0
- **בעיות HTML שנמצאו:** 0

---

## עמודים מרכזיים (11 עמודים)

### 1. index.html

**קובץ HTML:** `trading-ui/index.html`  
**קובץ JS:** `trading-ui/scripts/index.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 2. trades.html

**קובץ HTML:** `trading-ui/trades.html`  
**קובץ JS:** `trading-ui/scripts/trades.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 3. trade_plans.html

**קובץ HTML:** `trading-ui/trade_plans.html`  
**קובץ JS:** `trading-ui/scripts/trade_plans.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 4. alerts.html

**קובץ HTML:** `trading-ui/alerts.html`  
**קובץ JS:** `trading-ui/scripts/alerts.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 5. tickers.html

**קובץ HTML:** `trading-ui/tickers.html`  
**קובץ JS:** `trading-ui/scripts/tickers.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 6. trading_accounts.html

**קובץ HTML:** `trading-ui/trading_accounts.html`  
**קובץ JS:** `trading-ui/scripts/trading_accounts.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 7. executions.html

**קובץ HTML:** `trading-ui/executions.html`  
**קובץ JS:** `trading-ui/scripts/executions.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 8. cash_flows.html

**קובץ HTML:** `trading-ui/cash_flows.html`  
**קובץ JS:** `trading-ui/scripts/cash_flows.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 9. notes.html

**קובץ HTML:** `trading-ui/notes.html`  
**קובץ JS:** `trading-ui/scripts/notes.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 10. research.html

**קובץ HTML:** `trading-ui/research.html`  
**קובץ JS:** `trading-ui/scripts/research.js` (אם קיים)

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

### 11. preferences.html

**קובץ HTML:** `trading-ui/preferences.html`  
**קובץ JS:** `trading-ui/scripts/preferences.js`

#### סטיות שנמצאו:
- [ ] טרם נסרק

#### כפילויות שנמצאו:
- [ ] טרם נסרק

#### בעיות שזוהו:
- [ ] טרם נסרק

---

## עמודים טכניים (12 עמודים)

### 12. db_display.html

**קובץ HTML:** `trading-ui/db_display.html`  
**קובץ JS:** `trading-ui/scripts/db_display.js`

#### סטיות שנמצאו:
1. **שורה 78:** `loadTableDataLocal()` → צריך להחליף ב-`window.loadTableData()`
2. **שורה 127:** `updateTableDisplay()` → צריך להחליף ב-`window.updateTable()`
3. **שורה 153-189:** פונקציה מקומית `updateTableDisplay()` → למחוק ולהחליף ב-`window.updateTable()`

#### כפילויות שנמצאו:
1. **שורות 153-189:** פונקציה מקומית `updateTableDisplay()` → למחוק ולהחליף ב-`window.updateTable()`
2. **שורות 196-246:** פונקציות עזר מקומיות (`getSectionId`, `getContainerId`, `getTableId`) → לבדוק אם צריך להעביר למערכת המרכזית

#### בעיות שזוהו:
1. **HTML:** טבלאות ללא `data-table-type` attribute (שורות 96, 119, 142, 165, 188, 211, 234, 257)
2. **HTML:** טבלאות ללא `data-sortable` attributes לעמודות
3. טבלאות לא רשומות ב-TableRegistry
4. שימוש ב-`tableType` לא נכון (עם dashes במקום underscores)

---

### 13. db_extradata.html

**קובץ HTML:** `trading-ui/db_extradata.html`  
**קובץ JS:** `trading-ui/scripts/db_extradata.js`

#### סטיות שנמצאו:
1. **שורה 76:** `loadTableDataLocal()` → צריך להחליף ב-`window.loadTableData()`
2. **שורה 124:** `updateTableDisplay()` → צריך להחליף ב-`window.updateTable()`
3. **שורה 184-219:** פונקציה מקומית `updateTableDisplay()` → למחוק ולהחליף ב-`window.updateTable()`

#### כפילויות שנמצאו:
1. **שורות 184-219:** פונקציה מקומית `updateTableDisplay()` → למחוק ולהחליף ב-`window.updateTable()`
2. **שורות 229-280:** פונקציות עזר מקומיות (`createTableHeaders`, `createTableRows`, `formatCellValue`) → למחוק ולהחליף במערכת המרכזית

#### בעיות שזוהו:
1. **HTML:** טבלאות ללא `data-table-type` attribute
2. **HTML:** טבלאות ללא `data-sortable` attributes לעמודות
3. טבלאות לא רשומות ב-TableRegistry

---

### 14. database.js (constraints.html?)

**קובץ JS:** `trading-ui/scripts/database.js`

#### סטיות שנמצאו:
1. **שורה 161:** `loadTableData()` → צריך להחליף ב-`window.loadTableData()`
2. **שורה 195:** `fetchTableData()` → צריך להחליף ב-`window.loadTableData()`
3. **שורה 223:** `updateTableDisplay()` → צריך להחליף ב-`window.updateTable()`

#### כפילויות שנמצאו:
1. **שורות 161-188:** פונקציה מקומית `loadTableData()` → למחוק ולהחליף ב-`window.loadTableData()`
2. **שורות 195-214:** פונקציה מקומית `fetchTableData()` → למחוק ולהחליף ב-`window.loadTableData()`
3. **שורות 223-299:** פונקציה מקומית `updateTableDisplay()` → למחוק ולהחליף ב-`window.updateTable()`

#### בעיות שזוהו:
1. טבלאות לא רשומות ב-TableRegistry
2. שימוש ב-`tableType` לא נכון

---

### 15-23. עמודים טכניים נוספים

- [ ] constraints.html
- [ ] background-tasks.html
- [ ] server-monitor.html
- [ ] system-management.html
- [ ] cache-test.html
- [ ] notifications-center.html
- [ ] css-management.html
- [ ] dynamic-colors-display.html
- [ ] designs.html
- [ ] tradingview-test-page.html

**טרם נסרקו**

---

## עמודים משניים (2 עמודים)

- [ ] external-data-dashboard.html
- [ ] chart-management.html

**טרם נסרקו**

---

## עמודי מוקאפ (11 עמודים)

- [ ] portfolio-state-page.html
- [ ] trade-history-page.html
- [ ] price-history-page.html
- [ ] comparative-analysis-page.html
- [ ] trading-journal-page.html
- [ ] strategy-analysis-page.html
- [ ] economic-calendar-page.html
- [ ] history-widget.html
- [ ] emotional-tracking-widget.html
- [ ] date-comparison-modal.html
- [ ] tradingview-test-page.html (מוקאפ)

**טרם נסרקו**

---

## הערות כלליות

### דפוסי סטיות נפוצים:
1. פונקציות מקומיות לטעינת נתונים (`loadTableDataLocal`, `fetchTableData`)
2. פונקציות מקומיות לרינדור (`updateTableDisplay`, `renderTable`)
3. טבלאות ללא `data-table-type` attributes
4. טבלאות לא רשומות ב-TableRegistry

### פעולות נדרשות:
1. החלפת כל הפונקציות המקומיות במערכת המרכזית
2. הוספת `data-table-type` לכל הטבלאות
3. רישום כל הטבלאות ב-TableRegistry
4. מחיקת כפילויות קוד

---

**עדכון אחרון:** 28 בינואר 2025  
**גרסה:** 1.0.0

