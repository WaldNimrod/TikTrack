# דוח משימות - trading_accounts.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מרכזי  
**עדיפות:** גבוהה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/trading_accounts.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/trading_accounts.html
- **סה"כ בעיות:** 175

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ❌ **section_toggle**: missing (17 בעיות)
- ✅ **notifications**: ok (51 בעיות)
- ✅ **modals**: ok (22 בעיות)
- ❌ **tables**: missing (25 בעיות)
- ❌ **field_renderer**: missing (6 בעיות)
- ❌ **crud_handler**: missing (15 בעיות)
- ❌ **select_populator**: missing (2 בעיות)
- ❌ **data_collection**: missing (4 בעיות)
- ❌ **icons**: missing (6 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (5 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (6 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (12 בעיות)
- ✅ **logger**: ok (143 בעיות)
- ❌ **cache**: missing (1 בעיות)
- ⚠️ **dom_manipulation**: issues_found (15 בעיות)
- ⚠️ **html_structure**: issues_found (71 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 707** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 709** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### section_toggle

- **שורה 1712** (js): `// This function now relies on the global restoreAllSectionStates system...`
- **שורה 1714** (js): `if (typeof window.restoreAllSectionStates === 'function') {...`
- **שורה 1715** (js): `await window.restoreAllSectionStates('trading_accounts');...`
- **שורה 1753** (js): `if (typeof window.restoreAllSectionStates === 'function') {...`
- **שורה 1755** (js): `window.restoreAllSectionStates();...`
- **שורה 1761** (js): `window.Logger.warn('⚠️ restoreAllSectionStates לא נמצאה - שחזור מצב סקשנים לא בו...`
- **שורה 2689** (js): `if (pageState.sections && typeof window.restoreAllSectionStates === 'function') ...`
- **שורה 2690** (js): `await window.restoreAllSectionStates();...`
- **שורה 95** (html): `<div class="top-section" data-section="top">...`
- **שורה 177** (html): `<div class="content-section" data-section="account-activity-summary">...`
- ... ועוד 7 בעיות

### tables

- **שורה 2675** (js): `if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sor...`
- **שורה 2675** (js): `if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sor...`
- **שורה 2678** (js): `await window.UnifiedTableSystem.sorter.sort('trading_accounts', columnIndex, {...`
- **שורה 2683** (js): `} else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {...`
- **שורה 2683** (js): `} else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {...`
- **שורה 2685** (js): `await window.UnifiedTableSystem.sorter.applyDefaultSort('trading_accounts');...`
- **שורה 2706** (js): `* Register trading_accounts page tables with UnifiedTableSystem...`
- **שורה 2710** (js): `if (!window.UnifiedTableSystem) {...`
- **שורה 2711** (js): `window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { pa...`
- **שורה 2721** (js): `window.UnifiedTableSystem.registry.register('trading_accounts', {...`
- ... ועוד 15 בעיות

### field_renderer

- **שורה 762** (js): `// Prefer FieldRendererService.renderDate for consistent date formatting...`
- **שורה 769** (js): `// Use FieldRendererService.renderDate for proper date formatting...`
- **שורה 773** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 773** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 774** (js): `// Use FieldRendererService to render date with time...`
- **שורה 775** (js): `dateDisplay = window.FieldRendererService.renderDate(rawDate, true);...`

### crud_handler

- **שורה 1200** (js): `// שימוש ב-CRUDResponseHandler עם רענון אוטומטי...`
- **שורה 1201** (js): `await CRUDResponseHandler.handleDeleteResponse(response, {...`
- **שורה 1210** (js): `CRUDResponseHandler.handleError(error, 'מחיקת חשבון מסחר');...`
- **שורה 1372** (js): `// Replaced by newer implementation at line 2359 with CRUDResponseHandler...`
- **שורה 1482** (js): `// REMOVED: window.showFormError - error handling handled by ModalManagerV2 and ...`
- **שורה 2060** (js): `// Replaced by newer implementation at line 2414 with CRUDResponseHandler...`
- **שורה 2462** (js): `// Use CRUDResponseHandler for consistent response handling...`
- **שורה 2465** (js): `crudResult = await CRUDResponseHandler.handleUpdateResponse(response, {...`
- **שורה 2473** (js): `crudResult = await CRUDResponseHandler.handleSaveResponse(response, {...`
- **שורה 2482** (js): `// Cache invalidation after CRUDResponseHandler processes the response...`
- ... ועוד 5 בעיות

### select_populator

- **שורה 381** (js): `// שימוש ב-SelectPopulatorService למילוי מטבעות...`
- **שורה 392** (js): `await SelectPopulatorService.populateCurrenciesSelect(selectId, options);...`

### data_collection

- **שורה 2313** (js): `// ניקוי מטמון לפני פעולת CRUD        // Collect form data using DataCollectionS...`
- **שורה 2320** (js): `const accountData = DataCollectionService.collectFormData({...`
- **שורה 2320** (js): `const accountData = DataCollectionService.collectFormData({...`
- **שורה 2358** (js): `hiddenIdValue: form.querySelector('input[name="id"]')?.value || null,...`

### icons

- **שורה 34** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 99** (html): `<img src="images/icons/entities/trading_accounts.svg" alt="חשבונות מסחר" class="...`
- **שורה 125** (html): `<img src="images/icons/entities/trading_accounts.svg" alt="ניהול חשבונות מסחר" c...`
- **שורה 181** (html): `<img src="images/icons/entities/trading_accounts.svg" alt="תנועות חשבון" class="...`
- **שורה 289** (html): `<img src="images/icons/entities/trading_accounts.svg" alt="דף חשבון" class="sect...`
- **שורה 351** (html): `<img src="images/icons/entities/trading_accounts.svg" alt="פוזיציות לפי חשבון" c...`

### info_summary

- **שורה 929** (js): `window.Logger.debug('updateTradingAccountsSummary called', { page: 'trading_acco...`
- **שורה 932** (js): `if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {...`
- **שורה 935** (js): `window.Logger.debug('Using InfoSummarySystem with config', { page: 'trading_acco...`
- **שורה 936** (js): `await window.InfoSummarySystem.calculateAndRender(accountsArray, config);...`
- **שורה 941** (js): `window.Logger.warn('InfoSummarySystem not available', { page: 'trading_accounts'...`

### entity_details

- **שורה 744** (js): `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, ...`
- **שורה 854** (js): `{ type: 'VIEW', onclick: `window.showEntityDetails('trading_account', ${tradingA...`
- **שורה 859** (js): `<button data-button-type="VIEW" data-variant="small" data-onclick="window.showEn...`
- **שורה 2159** (js): `if (typeof window.showEntityDetails === 'function') {...`
- **שורה 2160** (js): `window.showEntityDetails('trading_account', tradingAccountId, { mode: 'view' });...`
- **שורה 2162** (js): `window.Logger.error('❌ showEntityDetails לא זמינה - המערכת הכללית לא נטענה', { p...`

### cache

- **שורה 302** (js): `const token = await window.unifiedCacheManager?.get('authToken') || window.PageS...`

### dom_manipulation

- **שורה 716** (js): `tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין חשבונות מסחר להצג...`
- **שורה 733** (js): `tbody.innerHTML = trading_accounts.map(tradingAccount => {...`
- **שורה 897** (js): `tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #dc3545...`
- **שורה 945** (js): `summaryStatsElement.innerHTML = `...`
- **שורה 976** (js): `tbody.innerHTML = errorHtml;...`
- **שורה 1105** (js): `tradingAccountMenu.innerHTML = '';...`
- **שורה 1111** (js): `allTradingAccountsItem.innerHTML = `...`
- **שורה 1123** (js): `tradingAccountItem.innerHTML = `...`
- **שורה 1672** (js): `tradingAccountMenu.innerHTML = '';...`
- **שורה 1678** (js): `allTradingAccountsItem.innerHTML = `...`
- ... ועוד 5 בעיות

### html_structure

- **שורה 744** (js): `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, ...`
- **שורה 859** (js): `<button data-button-type="VIEW" data-variant="small" data-onclick="window.showEn...`
- **שורה 860** (js): `<button data-button-type="EDIT" data-variant="small" data-onclick="window.showEd...`
- **שורה 861** (js): `<button data-button-type="${tradingAccount.status === 'cancelled' ? 'REACTIVATE'...`
- **שורה 862** (js): `<button data-button-type="DELETE" data-variant="small" data-onclick="window.dele...`
- **שורה 742** (js): `data-button-type="VIEW"...`
- **שורה 859** (js): `<button data-button-type="VIEW" data-variant="small" data-onclick="window.showEn...`
- **שורה 860** (js): `<button data-button-type="EDIT" data-variant="small" data-onclick="window.showEd...`
- **שורה 861** (js): `<button data-button-type="${tradingAccount.status === 'cancelled' ? 'REACTIVATE'...`
- **שורה 862** (js): `<button data-button-type="DELETE" data-variant="small" data-onclick="window.dele...`
- ... ועוד 61 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** גבוהה
- **זמן משוער:** 26 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
