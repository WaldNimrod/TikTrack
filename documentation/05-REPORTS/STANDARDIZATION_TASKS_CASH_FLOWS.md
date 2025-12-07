# דוח משימות - cash_flows.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מרכזי  
**עדיפות:** גבוהה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/cash_flows.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/cash_flows.html
- **סה"כ בעיות:** 209

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (16 בעיות)
- ✅ **notifications**: ok (32 בעיות)
- ✅ **modals**: ok (38 בעיות)
- ❌ **tables**: missing (12 בעיות)
- ❌ **field_renderer**: missing (46 בעיות)
- ❌ **crud_handler**: missing (14 בעיות)
- ❌ **select_populator**: missing (4 בעיות)
- ❌ **data_collection**: missing (54 בעיות)
- ❌ **icons**: missing (4 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (7 בעיות)
- ❌ **pagination**: missing (6 בעיות)
- ❌ **entity_details**: missing (10 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (16 בעיות)
- ✅ **logger**: ok (140 בעיות)
- ❌ **cache**: missing (1 בעיות)
- ⚠️ **dom_manipulation**: issues_found (14 בעיות)
- ⚠️ **html_structure**: issues_found (35 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 531** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 533** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 4199** (js): `if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sor...`
- **שורה 4199** (js): `if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sor...`
- **שורה 4202** (js): `const sortedData = await window.UnifiedTableSystem.sorter.sort('cash_flows', col...`
- **שורה 4214** (js): `} else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {...`
- **שורה 4214** (js): `} else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {...`
- **שורה 4216** (js): `const sortedData = await window.UnifiedTableSystem.sorter.applyDefaultSort('cash...`
- **שורה 4244** (js): `* Register cash_flows table with UnifiedTableSystem...`
- **שורה 4248** (js): `if (!window.UnifiedTableSystem) {...`
- **שורה 4249** (js): `window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { pa...`
- **שורה 4259** (js): `window.UnifiedTableSystem.registry.register('cash_flows', {...`
- ... ועוד 2 בעיות

### field_renderer

- **שורה 987** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 987** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 989** (js): `return window.FieldRendererService.renderDate(dateEnvelope || dateValue, false);...`
- **שורה 1012** (js): `// Use FieldRendererService or dateUtils for formatting...`
- **שורה 1013** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 1013** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 1014** (js): `return window.FieldRendererService.renderDate(dateObj, false);...`
- **שורה 1424** (js): `const baseTypeDisplay = (window.FieldRendererService && typeof window.FieldRende...`
- **שורה 1424** (js): `const baseTypeDisplay = (window.FieldRendererService && typeof window.FieldRende...`
- **שורה 1425** (js): `? window.FieldRendererService.renderType(cashFlow.type, amountForColor)...`
- ... ועוד 36 בעיות

### crud_handler

- **שורה 1046** (js): `CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');...`
- **שורה 1068** (js): `// שימוש ב-CRUDResponseHandler עם רענון אוטומטי...`
- **שורה 1069** (js): `await CRUDResponseHandler.handleDeleteResponse(response, {...`
- **שורה 1077** (js): `CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');...`
- **שורה 2805** (js): `// CRUDResponseHandler will handle cache clearing automatically...`
- **שורה 2948** (js): `// CRUDResponseHandler handles ALL response processing including errors...`
- **שורה 2953** (js): `crudResult = await CRUDResponseHandler.handleUpdateResponse(responseToHandle, {...`
- **שורה 2962** (js): `crudResult = await CRUDResponseHandler.handleSaveResponse(responseToHandle, {...`
- **שורה 2990** (js): `window.Logger.debug('saveCashFlow - CRUDResponseHandler completed', { page: 'cas...`
- **שורה 2994** (js): `CRUDResponseHandler.handleError(error, 'שמירת תזרים מזומן');...`
- ... ועוד 4 בעיות

### select_populator

- **שורה 1280** (js): `// שימוש ב-SelectPopulatorService...`
- **שורה 1281** (js): `await SelectPopulatorService.populateAccountsSelect(selectId, {...`
- **שורה 1312** (js): `// שימוש ב-SelectPopulatorService...`
- **שורה 1313** (js): `await SelectPopulatorService.populateCurrenciesSelect(selectId, {...`

### data_collection

- **שורה 458** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 458** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 459** (js): `window.DataCollectionService.setValue(selectId, normalizedValue, 'text');...`
- **שורה 461** (js): `// Fallback if DataCollectionService is not available...`
- **שורה 486** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 486** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 487** (js): `window.DataCollectionService.setValue(selectId, initialValue, 'text');...`
- **שורה 489** (js): `// Fallback if DataCollectionService is not available...`
- **שורה 2617** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 2617** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- ... ועוד 44 בעיות

### icons

- **שורה 37** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 104** (html): `<img src="images/icons/entities/cash_flows.svg" alt="תזרימי מזומנים" class="sect...`
- **שורה 130** (html): `<img src="images/icons/entities/cash_flows.svg" alt="ניהול תזרימי מזומנים" class...`
- **שורה 205** (html): `<img src="images/icons/entities/cash_flows.svg" alt="המרות מטבע מאוחדות" class="...`

### info_summary

- **שורה 29** (js): `* - updatePageSummaryStats() - Uses InfoSummarySystem from services/statistics-c...`
- **שורה 1731** (js): `* Uses InfoSummarySystem from services/statistics-calculator.js...`
- **שורה 1741** (js): `// Use global InfoSummarySystem if available...`
- **שורה 1742** (js): `if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMA...`
- **שורה 1744** (js): `window.InfoSummarySystem.calculateAndRender(summarySource, config);...`
- **שורה 1745** (js): `window.Logger.debug('Page summary stats updated via InfoSummarySystem', {...`
- **שורה 1776** (js): `window.Logger.warn('InfoSummarySystem not available - using fallback', { page: '...`

### pagination

- **שורה 421** (js): `// Fallback: try to get from PaginationSystem...`
- **שורה 422** (js): `if (window.PaginationSystem?.get) {...`
- **שורה 423** (js): `const instance = window.PaginationSystem.get(CASH_FLOWS_TABLE_ID);...`
- **שורה 425** (js): `window.Logger?.debug('⚠️ [getCashFlowsPaginationInstance] Using PaginationSystem...`
- **שורה 4207** (js): `if (Array.isArray(sortedData) && window.PaginationSystem) {...`
- **שורה 4218** (js): `if (Array.isArray(sortedData) && window.PaginationSystem) {...`

### entity_details

- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 2137** (js): `if (typeof showEntityDetails === 'function') {...`
- **שורה 2138** (js): `return `<button class="btn btn-sm btn-outline-primary" data-onclick="showEntityD...`
- **שורה 2431** (js): `if (window.showEntityDetails) {...`
- **שורה 2432** (js): `window.showEntityDetails('cash_flow', cashFlowId, { mode: 'view' });...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`

### cache

- **שורה 4017** (js): `'UnifiedCacheManager',...`

### dom_manipulation

- **שורה 1335** (js): `tbody.innerHTML = '';...`
- **שורה 1385** (js): `tbody.innerHTML = `<tr><td colspan="9" class="text-center">${message}</td></tr>`...`
- **שורה 1512** (js): `row.innerHTML = `...`
- **שורה 1921** (js): `tableBody.innerHTML = `<tr><td colspan="7" class="text-center">אין המרות מטבע לה...`
- **שורה 1973** (js): `tableBody.innerHTML = '';...`
- **שורה 1986** (js): `row.innerHTML = `...`
- **שורה 2128** (js): `container.innerHTML = '<div class="text-muted small">הצמד יוצג לאחר שמירה.</div>...`
- **שורה 2132** (js): `container.innerHTML = window.FieldRendererService.renderExchangePairCards(summar...`
- **שורה 2155** (js): `container.innerHTML = '<div class="text-muted small">הצמד יוצג לאחר שמירה.</div>...`
- **שורה 2161** (js): `container.innerHTML = '<div class="text-muted small">תזרים זה אינו חלק מהמרת מטב...`
- ... ועוד 4 בעיות

### html_structure

- **שורה 496** (js): `// No need for manual event listeners - just like buttons with data-onclick!...`
- **שורה 1443** (js): `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', $...`
- **שורה 2138** (js): `return `<button class="btn btn-sm btn-outline-primary" data-onclick="showEntityD...`
- **שורה 2180** (js): `return `<button class="btn btn-sm btn-outline-primary" data-onclick="showCashFlo...`
- **שורה 2263** (js): `return `<span class="numeric-value-positive" style="color: ${color}; font-weight...`
- **שורה 2401** (js): `return baseAmount.replace('<span', `<span style="color: ${color};"`);...`
- **שורה 41** (html): `<!-- ===== CRITICAL: showModalSafe Helper - Must be loaded before any data-oncli...`
- **שורה 44** (html): `// This prevents "showModalSafe is not a function" errors when data-onclick attr...`
- **שורה 108** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 135** (html): `<button data-button-type="ADD" data-entity-type="cash_flow" data-variant="full" ...`
- ... ועוד 25 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** גבוהה
- **זמן משוער:** 31 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
