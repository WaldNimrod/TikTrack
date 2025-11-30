# דוח משימות - index.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד מרכזי  
**עדיפות:** גבוהה

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/index.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/index.html
- **סה"כ בעיות:** 226

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (5 בעיות)
- ✅ **section_toggle**: ok (8 בעיות)
- ✅ **notifications**: ok (4 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (1 בעיות)
- ❌ **field_renderer**: missing (21 בעיות)
- ❌ **crud_handler**: missing (21 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ✅ **icons**: ok (22 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (1 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ⚠️ **logger**: issues_found (84 בעיות)
- ❌ **cache**: missing (6 בעיות)
- ⚠️ **dom_manipulation**: issues_found (48 בעיות)
- ⚠️ **html_structure**: issues_found (39 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 1392** (js): `// Note: positions & portfolio system initialization is handled by page-initiali...`
- **שורה 1396** (js): `// have been removed and replaced by UnifiedPendingActionsWidget which is initia...`
- **שורה 1400** (js): `// in unified-app-initializer.js, so we don't need to call it directly here....`
- **שורה 723** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 725** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 378** (html): `<table class="table table-hover" id="portfolioTable" data-table-type="portfolio"...`

### field_renderer

- **שורה 134** (js): `if (window.FieldRendererService?.renderDateShort) {...`
- **שורה 136** (js): `return window.FieldRendererService.renderDateShort(resolved) || '';...`
- **שורה 275** (js): `// שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package...`
- **שורה 278** (js): `balanceEl.innerHTML = window.FieldRendererService?.renderAmount...`
- **שורה 279** (js): `? window.FieldRendererService.renderAmount(numericBalance, currencySymbol, 2, tr...`
- **שורה 289** (js): `// שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package...`
- **שורה 292** (js): `totalPnLEl.innerHTML = window.FieldRendererService?.renderAmount...`
- **שורה 293** (js): `? window.FieldRendererService.renderAmount(numericPnL, currencySymbol, 2, true)...`
- **שורה 434** (js): `if (Number.isFinite(numericValue) && window.FieldRendererService?.renderAmount) ...`
- **שורה 435** (js): `amountWrapper.innerHTML = window.FieldRendererService.renderAmount(numericValue,...`
- ... ועוד 11 בעיות

### crud_handler

- **שורה 756** (js): `// Use CRUDResponseHandler for error notification if available...`
- **שורה 757** (js): `if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler...`
- **שורה 757** (js): `if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler...`
- **שורה 758** (js): `window.CRUDResponseHandler.handleError(error, 'טעינת נתוני דשבורד');...`
- **שורה 1019** (js): `// Use CRUDResponseHandler.handleLoadResponse for consistent error handling...`
- **שורה 1021** (js): `if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler...`
- **שורה 1021** (js): `if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler...`
- **שורה 1022** (js): `// Use CRUDResponseHandler for consistent error handling with retry mechanism...`
- **שורה 1023** (js): `return window.CRUDResponseHandler.handleLoadResponse(response, {...`
- **שורה 1038** (js): `// Use CRUDResponseHandler for error notification if available...`
- ... ועוד 11 בעיות

### info_summary

- **שורה 695** (js): `// summaryStats uses InfoSummarySystem via updateSummaryStats()...`

### logger

- **שורה 1502** (js): `const originalError = console.error;...`
- **שורה 1503** (js): `const originalWarn = console.warn;...`
- **שורה 1504** (js): `const originalLog = console.log;...`
- **שורה 1506** (js): `console.error = function(...args) {...`
- **שורה 1507** (js): `logData.console.errors.push(args.join(' '));...`
- **שורה 1511** (js): `console.warn = function(...args) {...`
- **שורה 1512** (js): `logData.console.warnings.push(args.join(' '));...`
- **שורה 1516** (js): `console.log = function(...args) {...`
- **שורה 1517** (js): `logData.console.logs.push(args.join(' '));...`
- **שורה 39** (js): `window.Logger.info('🏠 Index page JavaScript loaded', { page: "index" });...`
- ... ועוד 74 בעיות

### cache

- **שורה 1134** (js): `if (window.UnifiedCacheManager?.clearByPattern) {...`
- **שורה 1136** (js): `await window.UnifiedCacheManager.clearByPattern(DASHBOARD_DATA_KEY);...`
- **שורה 1142** (js): `} else if (window.UnifiedCacheManager?.clearByPattern) {...`
- **שורה 1145** (js): `await window.UnifiedCacheManager.clearByPattern(DASHBOARD_DATA_KEY);...`
- **שורה 1156** (js): `if (window.CacheTTLGuard?.ensure) {...`
- **שורה 1157** (js): `const cachedOrFresh = await window.CacheTTLGuard.ensure(...`

### dom_manipulation

- **שורה 278** (js): `balanceEl.innerHTML = window.FieldRendererService?.renderAmount...`
- **שורה 282** (js): `balanceEl.innerHTML = '<span class="text-muted">לא זמין</span>';...`
- **שורה 292** (js): `totalPnLEl.innerHTML = window.FieldRendererService?.renderAmount...`
- **שורה 296** (js): `totalPnLEl.innerHTML = '<span class="text-muted">לא זמין</span>';...`
- **שורה 373** (js): `container.innerHTML = '<div class="text-muted small">אין תוכניות זמינות</div>';...`
- **שורה 435** (js): `amountWrapper.innerHTML = window.FieldRendererService.renderAmount(numericValue,...`
- **שורה 447** (js): `container.innerHTML = '';...`
- **שורה 476** (js): `container.innerHTML = '<div class="text-muted small">אין טריידים זמינים</div>';...`
- **שורה 523** (js): `sideSpan.innerHTML = sideHtml;...`
- **שורה 552** (js): `amountWrapper.innerHTML = window.FieldRendererService.renderAmount(numericValue,...`
- ... ועוד 38 בעיות

### html_structure

- **שורה 1538** (js): `{ selector: '#unified-header', name: 'Header Container' },...`
- **שורה 1550** (js): `const computedStyle = window.getComputedStyle(el);...`
- **שורה 1575** (js): `const computedStyle = window.getComputedStyle(menu);...`
- **שורה 1584** (js): `const computedStyle = window.getComputedStyle(filterToggleBtn);...`
- **שורה 1648** (js): `const computedStyle = window.getComputedStyle(widget);...`
- **שורה 22** (html): `</head><body class="index-page"><div id="unified-header"></div><div class="backg...`
- **שורה 22** (html): `</head><body class="index-page"><div id="unified-header"></div><div class="backg...`
- **שורה 22** (html): `</head><body class="index-page"><div id="unified-header"></div><div class="backg...`
- **שורה 356** (html): `<button data-button-type="FILTER" data-variant="small" data-icon="↕" data-classe...`
- **שורה 357** (html): `<button data-button-type="FILTER" data-variant="small" data-icon="↑" data-classe...`
- ... ועוד 29 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** גבוהה
- **זמן משוער:** 33 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
