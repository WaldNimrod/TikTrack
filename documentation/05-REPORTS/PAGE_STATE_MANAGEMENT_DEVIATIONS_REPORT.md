# דוח סטיות - Page State Management

**תאריך:** 26.11.2025
**בודק:** Auto Scanner
**סטטוס:** 🔄 בתהליך

---

## סיכום כללי

**עמודים נבדקים:** 40
**קבצי JavaScript נבדקים:** 20
**שימושים ישירים ב-localStorage:** 2
**פונקציות restorePageState מקומיות:** 9
**שימושים ב-page-utils.js:** 5
**שימושים לא עקביים ב-API:** 31
**עמודים ללא page-state-manager.js:** 7

---

## 1. שימושים ישירים ב-localStorage

**סה"כ:** 2 מופעים

### trading-ui/scripts/header-system.js

- **שורה 70:** `localStorage.getItem('headerFilters')` (headerFilters-get)
  - הקשר: `const saved = localStorage.getItem('headerFilters');`
- **שורה 94:** `localStorage.setItem('headerFilters'` (headerFilters-set)
  - הקשר: `localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));`

## 2. פונקציות restorePageState מקומיות

**סה"כ:** 9 פונקציות

### trading-ui/scripts/trades.js

- **שורה 1712:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/trade_plans.js

- **שורה 3813:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/alerts.js

- **שורה 4306:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/tickers.js

- **שורה 2641:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/trading_accounts.js

- **שורה 2639:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/executions.js

- **שורה 4030:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/cash_flows.js

- **שורה 4134:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/notes.js

- **שורה 2922:** `async function restorePageState(pageName) {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

### trading-ui/scripts/portfolio-state-page.js

- **שורה 3186:** `async function restorePageState() {`
- **המלצה:** בדוק אם יש צורך בפונקציה מקומית או שניתן להסיר ולהשתמש ב-PageStateManager ישירות

## 3. שימושים ב-page-utils.js

**סה"כ:** 5 מופעים

### trading-ui/scripts/page-utils.js

- **שורה 421:** `savePageState(pageName` (savePageState-direct)
- **שורה 421:** `savePageState(pageName` (savePageState-direct)
- **שורה 194:** `loadPageState(pageName` (loadPageState-direct)
- **שורה 194:** `loadPageState(pageName` (loadPageState-direct)
- **שורה 194:** `loadPageState(pageName` (loadPageState-direct)

## 4. שימושים לא עקביים ב-API

**סה"כ:** 31 מופעים

### trading-ui/scripts/trades.js

- **שורה 1730:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/trade_plans.js

- **שורה 3831:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/alerts.js

- **שורה 4324:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/tickers.js

- **שורה 2659:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/trading_accounts.js

- **שורה 2661:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/executions.js

- **שורה 4048:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/cash_flows.js

- **שורה 689:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 681:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 681:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 681:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 689:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/notes.js

- **שורה 2940:** `window.PageStateManager.loadPageState(` (window-dot-notation)

### trading-ui/scripts/ui-utils.js

- **שורה 2448:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 2454:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 2448:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/page-utils.js

- **שורה 425:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 469:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 425:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/comparative-analysis-page.js

- **שורה 525:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 525:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/portfolio-state-page.js

- **שורה 3172:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 3192:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 3172:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/trade-history-page.js

- **שורה 397:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 397:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 1441:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 397:** `PageStateManager.savePageState(` (direct-class-call)
- **שורה 397:** `PageStateManager.savePageState(` (direct-class-call)

### trading-ui/scripts/trading-journal-page.js

- **שורה 464:** `window.PageStateManager.savePageState(` (window-dot-notation)
- **שורה 433:** `window.PageStateManager.loadPageState(` (window-dot-notation)
- **שורה 464:** `PageStateManager.savePageState(` (direct-class-call)

## 5. עמודים ללא page-state-manager.js

**סה"כ:** 7 עמודים

- **mockups/daily-snapshots/portfolio-state-page.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/emotional-tracking-widget.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/history-widget.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/economic-calendar-page.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/tradingview-test-page.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/heatmap-visual-example.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/comparative-analysis-page.html:** page-state-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)

---

**עדכון אחרון:** 26.11.2025
**סטטוס:** 🔄 סריקה הושלמה
