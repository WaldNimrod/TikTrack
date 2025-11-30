# דוח סטיות - Info Summary System
## INFO_SUMMARY_SYSTEM_DEVIATIONS_REPORT

**תאריך יצירה:** 26.11.2025  
**גרסה:** 1.0.0  
**מטרה:** זיהוי שימושים מקומיים במקום Info Summary System המרכזית

---

## 📊 סיכום כללי

- **סה"כ עמודים נסרקו:** 36
- **עמודים המשתמשים במערכת:** 8
- **עמודים עם summary element:** 15
- **עמודים עם config:** 11
- **עמודים עם בעיות:** 17
- **סה"כ בעיות נמצאו:** 40

### פילוח בעיות לפי סוג:

- **עדכון summary עם innerHTML ישיר:** 12
- **פונקציות מקומיות:** 0
- **חישוב ידני של סטטיסטיקות:** 11
- **חסר טעינת המערכת:** 6
- **חסר config:** 6

---

## 📋 דוח מפורט לכל עמוד

### index
**קובץ HTML:** `trading-ui/index.html`  
**קובץ JS:** `trading-ui/scripts/index.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 522:** פונקציה מקומית updatePortfolioSummary במקום InfoSummarySystem
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function updatePortfolioSummary({ accounts = [], trades = [], cashFlows = [] }, currencySymbol) {`

2. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

3. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### trades
**קובץ HTML:** `trading-ui/trades.html`  
**קובץ JS:** `trading-ui/scripts/trades.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### trade_plans
**קובץ HTML:** `trading-ui/trade_plans.html`  
**קובץ JS:** `trading-ui/scripts/trade_plans.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### alerts
**קובץ HTML:** `trading-ui/alerts.html`  
**קובץ JS:** `trading-ui/scripts/alerts.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 4012:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `resultsDiv.innerHTML = ``

2. **שורה 3416:** פונקציה מקומית updateAlertsSummary במקום InfoSummarySystem
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function updateAlertsSummary(alerts) {`

3. **שורה 4029:** פונקציה מקומית updateEvaluationSummary במקום InfoSummarySystem
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function updateEvaluationSummary(data) {`

---

### tickers
**קובץ HTML:** `trading-ui/tickers.html`  
**קובץ JS:** `trading-ui/scripts/tickers.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### trading_accounts
**קובץ HTML:** `trading-ui/trading_accounts.html`  
**קובץ JS:** `trading-ui/scripts/trading_accounts.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 997:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `summaryStatsElement.innerHTML = ``

---

### executions
**קובץ HTML:** `trading-ui/executions.html`  
**קובץ JS:** `trading-ui/scripts/executions.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2698:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `totalElement.innerHTML = `<strong>${result.label || 'סה"כ:'}</strong> ${sign}$${Math.abs(result.tota...`

---

### cash_flows
**קובץ HTML:** `trading-ui/cash_flows.html`  
**קובץ JS:** `trading-ui/scripts/cash_flows.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### notes
**קובץ HTML:** `trading-ui/notes.html`  
**קובץ JS:** `trading-ui/scripts/notes.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### research
**קובץ HTML:** `trading-ui/research.html`  
**קובץ JS:** `trading-ui/scripts/research.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### preferences
**קובץ HTML:** `trading-ui/preferences.html`  
**קובץ JS:** `trading-ui/scripts/preferences.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

2. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### db_display
**קובץ HTML:** `trading-ui/db_display.html`  
**קובץ JS:** `trading-ui/scripts/db_display.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

2. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### db_extradata
**קובץ HTML:** `trading-ui/db_extradata.html`  
**קובץ JS:** `trading-ui/scripts/db_extradata.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### constraints
**קובץ HTML:** `trading-ui/constraints.html`  
**קובץ JS:** `trading-ui/scripts/constraints.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1170:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const success = results.filter(r => r.database.status === 'success' && r.data.status === 'success' &...`

2. **שורה 1171:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const warnings = results.filter(r => r.data.status === 'warning' || r.ui.status === 'warning').lengt...`

3. **שורה 1172:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const errors = results.filter(r => r.database.status === 'error' || r.data.status === 'error' || r.u...`

---

### background-tasks
**קובץ HTML:** `trading-ui/background-tasks.html`  
**קובץ JS:** `trading-ui/scripts/background-tasks.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

2. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### server-monitor
**קובץ HTML:** `trading-ui/server-monitor.html`  
**קובץ JS:** `trading-ui/scripts/server-monitor.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### system-management
**קובץ HTML:** `trading-ui/system-management.html`  
**קובץ JS:** `trading-ui/scripts/system-management.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 681:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `resultsContent.innerHTML = ``

2. **שורה 814:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `modal.innerHTML = ``

3. **שורה 655:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const successCount = checkResults.checks.filter(c => c.status === 'success').length;`

4. **שורה 656:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const warningCount = checkResults.checks.filter(c => c.status === 'warning').length;`

5. **שורה 657:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const errorCount = checkResults.checks.filter(c => c.status === 'error').length;`

6. **שורה 788:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const successCount = checkResults.checks.filter(c => c.status === 'success').length;`

7. **שורה 789:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const warningCount = checkResults.checks.filter(c => c.status === 'warning').length;`

8. **שורה 790:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const errorCount = checkResults.checks.filter(c => c.status === 'error').length;`

9. **שורה 951:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `const errorCount = results.checks.filter(c => c.status === 'error').length;`

---

### cache-test
**קובץ HTML:** `trading-ui/cache-test.html`  
**קובץ JS:** `trading-ui/scripts/cache-test.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### notifications-center
**קובץ HTML:** `trading-ui/notifications-center.html`  
**קובץ JS:** `trading-ui/scripts/notifications-center.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

2. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### css-management
**קובץ HTML:** `trading-ui/css-management.html`  
**קובץ JS:** `trading-ui/scripts/css-management.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### dynamic-colors-display
**קובץ HTML:** `trading-ui/dynamic-colors-display.html`  
**קובץ JS:** `trading-ui/scripts/dynamic-colors-display.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### designs
**קובץ HTML:** `trading-ui/designs.html`  
**קובץ JS:** `trading-ui/scripts/designs.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### tradingview-test-page
**קובץ HTML:** `trading-ui/tradingview-test-page.html`  
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 693:** פונקציה מקומית updateTestSummary במקום InfoSummarySystem
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function updateTestSummary() {`

---

### external-data-dashboard
**קובץ HTML:** `trading-ui/external-data-dashboard.html`  
**קובץ JS:** `trading-ui/scripts/external-data-dashboard.js`  
**קטגוריה:** secondary

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ✅ כן
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2143:** חישוב ידני של סטטיסטיקות במקום InfoSummarySystem
   - **סוג:** manualCalculations
   - **חומרה:** 🟡 בינונית
   - **קוד:** `if (passed === tests.length) {`

2. **שורה 0:** עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS
   - **סוג:** missingConfig
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

3. **שורה 0:** עמוד עם summary element אבל לא טוען את info-summary-system.js
   - **סוג:** missingService
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `N/A`

---

### chart-management
**קובץ HTML:** `trading-ui/chart-management.html`  
**קובץ JS:** `trading-ui/scripts/chart-management.js`  
**קטגוריה:** secondary

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### portfolio-state-page
**קובץ HTML:** `trading-ui/portfolio-state-page.html`  
**קובץ JS:** `trading-ui/scripts/portfolio-state-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1320:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `summaryElement.innerHTML = ``

2. **שורה 3088:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `summaryElement.innerHTML = ``

---

### trade-history-page
**קובץ HTML:** `trading-ui/trade-history-page.html`  
**קובץ JS:** `trading-ui/scripts/trade-history-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 989:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `plel.innerHTML = ``

---

### price-history-page
**קובץ HTML:** `trading-ui/price-history-page.html`  
**קובץ JS:** `trading-ui/scripts/price-history-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### comparative-analysis-page
**קובץ HTML:** `trading-ui/comparative-analysis-page.html`  
**קובץ JS:** `trading-ui/scripts/comparative-analysis-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1509:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `summary.innerHTML = ``

2. **שורה 1612:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `tooltip.innerHTML = ``

3. **שורה 1790:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `tooltipEl.innerHTML = ``

---

### trading-journal-page
**קובץ HTML:** `trading-ui/trading-journal-page.html`  
**קובץ JS:** `trading-ui/scripts/trading-journal-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### strategy-analysis-page
**קובץ HTML:** `trading-ui/strategy-analysis-page.html`  
**קובץ JS:** `trading-ui/scripts/strategy-analysis-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1662:** עדכון summary עם innerHTML ישיר במקום InfoSummarySystem
   - **סוג:** manualInnerHTML
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `summary.innerHTML = ``

---

### economic-calendar-page
**קובץ HTML:** `trading-ui/economic-calendar-page.html`  
**קובץ JS:** `trading-ui/scripts/economic-calendar-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### history-widget
**קובץ HTML:** `trading-ui/history-widget.html`  
**קובץ JS:** `trading-ui/scripts/history-widget.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### emotional-tracking-widget
**קובץ HTML:** `trading-ui/emotional-tracking-widget.html`  
**קובץ JS:** `trading-ui/scripts/emotional-tracking-widget.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ❌ לא
- **יש config:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### date-comparison-modal
**קובץ HTML:** `trading-ui/date-comparison-modal.html`  
**קובץ JS:** `trading-ui/scripts/date-comparison-modal.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש summary element:** ✅ כן
- **יש config:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

