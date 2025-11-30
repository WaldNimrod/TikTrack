# דוח סטיות - Select Populator Service
## SELECT_POPULATOR_SERVICE_DEVIATIONS_REPORT

**תאריך יצירה:** 26.11.2025  
**גרסה:** 1.0.0  
**מטרה:** זיהוי שימושים מקומיים במקום Select Populator Service המרכזית

---

## 📊 סיכום כללי

- **סה"כ עמודים נסרקו:** 36
- **עמודים המשתמשים במערכת:** 5
- **עמודים עם בעיות:** 16
- **סה"כ בעיות נמצאו:** 138

### פילוח בעיות לפי סוג:

- **טיפול ידני במילוי select:** 48
- **קריאות fetch ישירות:** 68
- **פונקציות מקומיות:** 22
- **חסר טעינת המערכת:** 31

---

## 📋 דוח מפורט לכל עמוד

### index
**קובץ HTML:** `trading-ui/index.html`  
**קובץ JS:** `trading-ui/scripts/index.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### trades
**קובץ HTML:** `trading-ui/trades.html`  
**קובץ JS:** `trading-ui/scripts/trades.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2075:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';`

2. **שורה 2075:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';`

3. **שורה 2089:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(option);`

4. **שורה 2083:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

5. **שורה 332:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `let response = await fetch('/api/trades/', { cache: 'no-store' });`

6. **שורה 332:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `let response = await fetch('/api/trades/', { cache: 'no-store' });`

7. **שורה 646:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

8. **שורה 784:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/');`

9. **שורה 1207:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${planId}`);`

10. **שורה 1370:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trades/${tradeId}`);`

11. **שורה 1370:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trades/${tradeId}`);`

12. **שורה 1370:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trades/${tradeId}`);`

13. **שורה 1370:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trades/${tradeId}`);`

14. **שורה 646:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

15. **שורה 646:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

16. **שורה 1207:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${planId}`);`

17. **שורה 1207:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${planId}`);`

18. **שורה 646:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

19. **שורה 1370:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trades/${tradeId}`);`

20. **שורה 332:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `let response = await fetch('/api/trades/', { cache: 'no-store' });`

21. **שורה 2045:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `* @function populateSelect`

22. **שורה 2052:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function populateSelect(selectId, data, field, prefix = '') {`

---

### trade_plans
**קובץ HTML:** `trading-ui/trade_plans.html`  
**קובץ JS:** `trading-ui/scripts/trade_plans.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 141:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trade-plans/' + planId + '/execute', {`

2. **שורה 194:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

3. **שורה 841:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${tradePlanId}`, {`

4. **שורה 841:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${tradePlanId}`, {`

5. **שורה 841:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trade-plans/${tradePlanId}`, {`

---

### alerts
**קובץ HTML:** `trading-ui/alerts.html`  
**קובץ JS:** `trading-ui/scripts/alerts.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1290:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';`

2. **שורה 1298:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(option);`

3. **שורה 1298:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(option);`

4. **שורה 1294:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

5. **שורה 1294:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

6. **שורה 1294:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

7. **שורה 1294:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

8. **שורה 3657:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trade-plans');`

9. **שורה 3704:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trades');`

10. **שורה 4175:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

11. **שורה 1260:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `* @function populateSelect`

12. **שורה 1267:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function populateSelect(selectId, data, field, prefix = '') {`

---

### tickers
**קובץ HTML:** `trading-ui/tickers.html`  
**קובץ JS:** `trading-ui/scripts/tickers.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 208:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/currencies/');`

2. **שורה 460:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

3. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

4. **שורה 535:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/update-all-active-trades', {`

5. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

6. **שורה 535:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/update-all-active-trades', {`

7. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

8. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

9. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

10. **שורה 535:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/update-all-active-trades', {`

11. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

12. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

13. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

14. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

15. **שורה 503:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {`

---

### trading_accounts
**קובץ HTML:** `trading-ui/trading_accounts.html`  
**קובץ JS:** `trading-ui/scripts/trading_accounts.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 312:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/currencies/', {`

2. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

3. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

4. **שורה 1317:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch(`/api/trades/?trading_account_id=${tradingAccountId}&status=open`...`

5. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

6. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

7. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

8. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

9. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

10. **שורה 2115:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `response = await fetch('/api/trading-accounts/' + tradingAccountId, {`

11. **שורה 483:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {`

---

### executions
**קובץ HTML:** `trading-ui/executions.html`  
**קובץ JS:** `trading-ui/scripts/executions.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2326:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

2. **שורה 2326:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

3. **שורה 2199:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

4. **שורה 2603:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch(`/api/tickers/`);`

5. **שורה 2199:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

6. **שורה 2199:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

7. **שורה 3656:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tickersResponse = await fetch('/api/tickers/');`

8. **שורה 2199:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

9. **שורה 3656:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tickersResponse = await fetch('/api/tickers/');`

10. **שורה 2199:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const tradesResponse = await fetch('/api/trades/');`

---

### cash_flows
**קובץ HTML:** `trading-ui/cash_flows.html`  
**קובץ JS:** `trading-ui/scripts/cash_flows.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 3140:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const accountResponse = await fetch(`/api/trading-accounts/${exchangeData.trading_account_id}`);`

2. **שורה 1278:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadAccountsForCashFlow(selectId, useDefaultFromPreferences = false) {`

3. **שורה 1310:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadCurrenciesForCashFlow(selectId, useDefaultFromPreferences = false) {`

4. **שורה 1278:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadAccountsForCashFlow(selectId, useDefaultFromPreferences = false) {`

5. **שורה 1310:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadCurrenciesForCashFlow(selectId, useDefaultFromPreferences = false) {`

---

### notes
**קובץ HTML:** `trading-ui/notes.html`  
**קובץ JS:** `trading-ui/scripts/notes.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ✅ כן
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1184:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';`

2. **שורה 1246:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(option);`

3. **שורה 1187:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

4. **שורה 113:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trading-accounts/');`

5. **שורה 121:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trades/');`

6. **שורה 142:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trade-plans/');`

7. **שורה 162:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/');`

8. **שורה 113:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trading-accounts/');`

9. **שורה 121:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trades/');`

10. **שורה 142:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trade-plans/');`

11. **שורה 162:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/tickers/');`

12. **שורה 1175:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function populateSelect(selectId, data, field, prefix = '') {`

13. **שורה 1360:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function populateEditSelectByType(relationType, selectedId) {`

14. **שורה 1429:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function populateEditSelectByTypeFallback(relationType, selectedId) {`

15. **שורה 1360:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function populateEditSelectByType(relationType, selectedId) {`

16. **שורה 1429:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function populateEditSelectByTypeFallback(relationType, selectedId) {`

---

### research
**קובץ HTML:** `trading-ui/research.html`  
**קובץ JS:** `trading-ui/scripts/research.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### preferences
**קובץ HTML:** `trading-ui/preferences.html`  
**קובץ JS:** `trading-ui/scripts/preferences.js`  
**קטגוריה:** main

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 668:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

2. **שורה 668:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

---

### db_display
**קובץ HTML:** `trading-ui/db_display.html`  
**קובץ JS:** `trading-ui/scripts/db_display.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### db_extradata
**קובץ HTML:** `trading-ui/db_extradata.html`  
**קובץ JS:** `trading-ui/scripts/db_extradata.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
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
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 147:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

---

### background-tasks
**קובץ HTML:** `trading-ui/background-tasks.html`  
**קובץ JS:** `trading-ui/scripts/background-tasks.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### server-monitor
**קובץ HTML:** `trading-ui/server-monitor.html`  
**קובץ JS:** `trading-ui/scripts/server-monitor.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
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
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### cache-test
**קובץ HTML:** `trading-ui/cache-test.html`  
**קובץ JS:** `trading-ui/scripts/cache-test.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
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
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 1014:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

---

### css-management
**קובץ HTML:** `trading-ui/css-management.html`  
**קובץ JS:** `trading-ui/scripts/css-management.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
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
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### tradingview-test-page
**קובץ HTML:** `trading-ui/tradingview-test-page.html`  
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`  
**קטגוריה:** technical

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### external-data-dashboard
**קובץ HTML:** `trading-ui/external-data-dashboard.html`  
**קובץ JS:** `trading-ui/scripts/external-data-dashboard.js`  
**קטגוריה:** secondary

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### chart-management
**קובץ HTML:** `trading-ui/chart-management.html`  
**קובץ JS:** `trading-ui/scripts/chart-management.js`  
**קטגוריה:** secondary

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### portfolio-state-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/portfolio-state-page.html`  
**קובץ JS:** `trading-ui/scripts/portfolio-state-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 264:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

2. **שורה 152:** קריאת fetch ישירה למילוי select במקום SelectPopulatorService
   - **סוג:** directFetch
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const response = await fetch('/api/trading-accounts/');`

3. **שורה 1031:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadTrades(dateRange, selectedAccounts, investmentType) {`

4. **שורה 1031:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadTrades(dateRange, selectedAccounts, investmentType) {`

5. **שורה 259:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function loadInvestmentTypes() {`

---

### trade-history-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/trade-history-page.html`  
**קובץ JS:** `trading-ui/scripts/trade-history-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 165:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

2. **שורה 165:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

3. **שורה 160:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function populateTickerFilter() {`

4. **שורה 176:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `function loadInvestmentTypes() {`

---

### price-history-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/price-history-page.html`  
**קובץ JS:** `trading-ui/scripts/price-history-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### comparative-analysis-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/comparative-analysis-page.html`  
**קובץ JS:** `trading-ui/scripts/comparative-analysis-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

2. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

3. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

4. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

5. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

6. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

7. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

8. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

9. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

10. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

11. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

12. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

13. **שורה 2754:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = accounts.map(acc =>`

14. **שורה 2746:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadTradingAccounts() {`

15. **שורה 2879:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadTickers() {`

---

### trading-journal-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/trading-journal-page.html`  
**קובץ JS:** `trading-ui/scripts/trading-journal-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ✅ כן
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### strategy-analysis-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/strategy-analysis-page.html`  
**קובץ JS:** `trading-ui/scripts/strategy-analysis-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 2542:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '';`

2. **שורה 2542:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '';`

3. **שורה 2542:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.innerHTML = '';`

4. **שורה 2544:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(firstOption);`

5. **שורה 2544:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(firstOption);`

6. **שורה 2544:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(firstOption);`

7. **שורה 2544:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `select.appendChild(firstOption);`

8. **שורה 2548:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

9. **שורה 2548:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

10. **שורה 2548:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

11. **שורה 2548:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

12. **שורה 2548:** טיפול ידני במילוי select במקום SelectPopulatorService
   - **סוג:** manualPopulation
   - **חומרה:** 🔴 גבוהה
   - **קוד:** `const option = document.createElement('option');`

---

### economic-calendar-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/economic-calendar-page.html`  
**קובץ JS:** `trading-ui/scripts/economic-calendar-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### history-widget
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/history-widget.html`  
**קובץ JS:** `trading-ui/scripts/history-widget.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### emotional-tracking-widget
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/emotional-tracking-widget.html`  
**קובץ JS:** `trading-ui/scripts/emotional-tracking-widget.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

### date-comparison-modal
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/date-comparison-modal.html`  
**קובץ JS:** `trading-ui/scripts/date-comparison-modal.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ⚠️ כן

#### סטיות שנמצאו:

1. **שורה 511:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadLastSelectedDates() {`

2. **שורה 511:** פונקציה מקומית למילוי select במקום SelectPopulatorService
   - **סוג:** localFunction
   - **חומרה:** 🟡 בינונית
   - **קוד:** `async function loadLastSelectedDates() {`

---

### tradingview-test-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/tradingview-test-page.html`  
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`  
**קטגוריה:** mockups

#### סטטוס:
- **משתמש במערכת:** ❌ לא
- **טוען את המערכת:** ❌ לא
- **יש בעיות:** ✅ לא

#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון

---

