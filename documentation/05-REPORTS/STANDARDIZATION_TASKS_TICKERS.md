# דוח משימות - tickers.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מרכזי  
**עדיפות:** גבוהה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/tickers.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/tickers.html
- **סה"כ בעיות:** 208

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (19 בעיות)
- ✅ **notifications**: ok (93 בעיות)
- ✅ **modals**: ok (35 בעיות)
- ✅ **tables**: ok (18 בעיות)
- ❌ **field_renderer**: missing (11 בעיות)
- ❌ **crud_handler**: missing (11 בעיות)
- ❌ **select_populator**: missing (6 בעיות)
- ❌ **data_collection**: missing (10 בעיות)
- ✅ **icons**: ok (15 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (2 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (6 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (9 בעיות)
- ⚠️ **logger**: issues_found (88 בעיות)
- ❌ **cache**: missing (21 בעיות)
- ⚠️ **dom_manipulation**: issues_found (16 בעיות)
- ⚠️ **html_structure**: issues_found (35 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 496** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 498** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### field_renderer

- **שורה 2110** (js): `// Prefer FieldRendererService.renderDate for consistent date formatting...`
- **שורה 2117** (js): `// Use FieldRendererService.renderDate for proper date formatting...`
- **שורה 2121** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 2121** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 2122** (js): `// Use FieldRendererService to render date with time...`
- **שורה 2123** (js): `dateDisplay = window.FieldRendererService.renderDate(rawDate, true);...`
- **שורה 2460** (js): `// המרת נתונים לפורמט שמצפה FieldRendererService.renderTickerInfo...`
- **שורה 2477** (js): `// Render using FieldRendererService...`
- **שורה 2479** (js): `if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo)...`
- **שורה 2479** (js): `if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo)...`
- ... ועוד 1 בעיות

### crud_handler

- **שורה 993** (js): `// שימוש ב-CRUDResponseHandler עם רענון אוטומטי...`
- **שורה 994** (js): `const crudResult = await CRUDResponseHandler.handleSaveResponse(response, {...`
- **שורה 1022** (js): `CRUDResponseHandler.handleError(error, 'שמירת טיקר');...`
- **שורה 1223** (js): `// שימוש ב-CRUDResponseHandler עם רענון אוטומטי...`
- **שורה 1224** (js): `const updateResult = await CRUDResponseHandler.handleUpdateResponse(response, {...`
- **שורה 1249** (js): `CRUDResponseHandler.handleError(error, 'עדכון טיקר');...`
- **שורה 1829** (js): `CRUDResponseHandler.handleError(error, 'מחיקת טיקר');...`
- **שורה 1855** (js): `// שימוש ב-CRUDResponseHandler עם רענון אוטומטי...`
- **שורה 1856** (js): `await CRUDResponseHandler.handleDeleteResponse(response, {...`
- **שורה 1865** (js): `CRUDResponseHandler.handleError(error, 'מחיקת טיקר');...`
- ... ועוד 1 בעיות

### select_populator

- **שורה 383** (js): `* Uses SelectPopulatorService if available, falls back to local implementation...`
- **שורה 392** (js): `// Use SelectPopulatorService if available...`
- **שורה 393** (js): `if (window.SelectPopulatorService && typeof window.SelectPopulatorService.popula...`
- **שורה 393** (js): `if (window.SelectPopulatorService && typeof window.SelectPopulatorService.popula...`
- **שורה 397** (js): `await window.SelectPopulatorService.populateCurrenciesSelect(addSelect, {...`
- **שורה 405** (js): `await window.SelectPopulatorService.populateCurrenciesSelect(editSelect, {...`

### data_collection

- **שורה 799** (js): `// Use DataCollectionService to set value if available...`
- **שורה 800** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 800** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 801** (js): `window.DataCollectionService.setValue(input.id, mapping.provider_symbol || '', '...`
- **שורה 835** (js): `// איסוף נתונים מהטופס באמצעות DataCollectionService...`
- **שורה 837** (js): `const tickerData = DataCollectionService.collectFormData({...`
- **שורה 1041** (js): `// ניקוי מטמון לפני פעולת CRUD - עריכה  // שימוש ב-DataCollectionService לאיסוף ...`
- **שורה 1043** (js): `const tickerData = DataCollectionService.collectFormData({...`
- **שורה 837** (js): `const tickerData = DataCollectionService.collectFormData({...`
- **שורה 1043** (js): `const tickerData = DataCollectionService.collectFormData({...`

### info_summary

- **שורה 1994** (js): `if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {...`
- **שורה 1996** (js): `window.InfoSummarySystem.calculateAndRender(tickersArray, config);...`

### entity_details

- **שורה 121** (js): `if (typeof window.showEntityDetails === 'function') {...`
- **שורה 122** (js): `window.showEntityDetails('ticker', tickerId, { mode: 'view' });...`
- **שורה 2199** (js): `data-onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker',...`
- **שורה 2199** (js): `data-onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker',...`
- **שורה 2199** (js): `data-onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker',...`
- **שורה 2230** (js): `{ type: 'VIEW', onclick: `window.showEntityDetails('ticker', ${ticker.id}, { mod...`

### logger

- **שורה 647** (js): `console.error('Error loading provider symbols:', error);...`
- **שורה 661** (js): `console.warn('⚠️ initializeProviderSymbolFields is deprecated - ModalManagerV2 n...`
- **שורה 677** (js): `console.warn('⚠️ Provider symbols fields container not found');...`
- **שורה 739** (js): `console.error('Error loading providers:', error);...`
- **שורה 793** (js): `console.warn('⚠️ Mapping missing provider name:', mapping);...`
- **שורה 813** (js): `console.warn(`⚠️ Provider symbol input field not found: providerSymbol_${provide...`
- **שורה 106** (js): `window.Logger?.error('ModalManagerV2 לא זמין', { page: "tickers" });...`
- **שורה 129** (js): `window.Logger.error('Error in viewTickerDetails:', error, { tickerId, page: "tic...`
- **שורה 238** (js): `window.Logger.error('getCurrencySymbol failed', { page: 'tickers', error: error?...`
- **שורה 262** (js): `window.Logger.error('getTickerTypeStyle failed', { page: 'tickers', error: error...`
- ... ועוד 78 בעיות

### cache

- **שורה 1540** (js): `if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCach...`
- **שורה 1540** (js): `if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCach...`
- **שורה 1541** (js): `await window.UnifiedCacheManager.clearAllCache('Light');...`
- **שורה 1571** (js): `if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCach...`
- **שורה 1571** (js): `if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCach...`
- **שורה 1572** (js): `await window.UnifiedCacheManager.clearAllCache('Light');...`
- **שורה 1698** (js): `if (window.unifiedCacheManager) {...`
- **שורה 1699** (js): `await window.unifiedCacheManager.clearByPattern('tickers-data');...`
- **שורה 1700** (js): `await window.unifiedCacheManager.clearByPattern('market-data');...`
- **שורה 1886** (js): `// REMOVED: clearTickersCache - use window.UnifiedCacheManager.clearAllCache() o...`
- ... ועוד 11 בעיות

### dom_manipulation

- **שורה 419** (js): `addSelect.innerHTML = currenciesAvailable...`
- **שורה 426** (js): `editSelect.innerHTML = currenciesAvailable...`
- **שורה 682** (js): `fieldsContainer.innerHTML = `...`
- **שורה 699** (js): `fieldsContainer.innerHTML = `...`
- **שורה 730** (js): `fieldsContainer.innerHTML = fieldsHTML;...`
- **שורה 740** (js): `fieldsContainer.innerHTML = `...`
- **שורה 2001** (js): `summaryStatsElement.innerHTML = `...`
- **שורה 2061** (js): `tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו טיקרים</td>...`
- **שורה 2245** (js): `tbody.innerHTML = '';  // ניקוי מלא...`
- **שורה 2246** (js): `tbody.innerHTML = finalHTML;  // הוספת התוכן החדש...`
- ... ועוד 6 בעיות

### html_structure

- **שורה 2199** (js): `data-onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker',...`
- **שורה 2002** (js): `<div style="color: #dc3545; font-weight: bold;">...`
- **שורה 2097** (js): `const typeStyle = getTickerTypeStyle(ticker.type);...`
- **שורה 2101** (js): `const statusStyle = getTickerStatusStyle(ticker.status);...`
- **שורה 2105** (js): `: `<span class="status-badge entity-badge-base" style="background-color: ${statu...`
- **שורה 2217** (js): `<span class="badge-type entity-badge-base" style="background-color: ${typeStyle....`
- **שורה 2605** (js): `window.getTickerTypeStyle = getTickerTypeStyle;...`
- **שורה 2606** (js): `window.getTickerStatusStyle = getTickerStatusStyle;...`
- **שורה 36** (html): `<!-- ===== CRITICAL: showModalSafe Helper - Must be loaded before any data-oncli...`
- **שורה 39** (html): `// This prevents "showModalSafe is not a function" errors when data-onclick attr...`
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
