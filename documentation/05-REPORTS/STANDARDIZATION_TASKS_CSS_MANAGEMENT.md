# דוח משימות - css-management.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/css-management.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/css-management.html
- **סה"כ בעיות:** 122

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (16 בעיות)
- ✅ **notifications**: ok (78 בעיות)
- ✅ **modals**: ok (26 בעיות)
- ❌ **tables**: missing (1 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (29 בעיות)
- ❌ **icons**: missing (11 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (49 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (12 בעיות)
- ⚠️ **html_structure**: issues_found (67 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 398** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 400** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 211** (html): `<table class="table table-striped table-hover" id="cssFilesTable" data-table-typ...`

### data_collection

- **שורה 412** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 412** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 413** (js): `searchTerm = window.DataCollectionService.getValue('cssSearchInput', 'text', '')...`
- **שורה 415** (js): `// Fallback if DataCollectionService is not available...`
- **שורה 583** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 583** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 584** (js): `window.DataCollectionService.setValue('cssSearchInput', '', 'text');...`
- **שורה 586** (js): `// Fallback if DataCollectionService is not available...`
- **שורה 589** (js): `// Use DataCollectionService to clear field if available...`
- **שורה 590** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- ... ועוד 19 בעיות

### icons

- **שורה 64** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 201** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 244** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 249** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 254** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 263** (html): `<img src="/trading-ui/images/icons/tabler/search.svg" width="16" height="16" alt...`
- **שורה 268** (html): `<img src="/trading-ui/images/icons/tabler/check.svg" width="16" height="16" alt=...`
- **שורה 273** (html): `<img src="/trading-ui/images/icons/tabler/trash.svg" width="16" height="16" alt=...`
- **שורה 278** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 304** (html): `<img src="/trading-ui/images/icons/tabler/search.svg" width="16" height="16" alt...`
- ... ועוד 1 בעיות

### dom_manipulation

- **שורה 537** (js): `container.innerHTML = html;...`
- **שורה 551** (js): `resultsContainer.innerHTML = `...`
- **שורה 1049** (js): `container.innerHTML = html;...`
- **שורה 1063** (js): `resultsContainer.innerHTML = `...`
- **שורה 1720** (js): `container.innerHTML = html;...`
- **שורה 1734** (js): `resultsContainer.innerHTML = `...`
- **שורה 1957** (js): `tbody.innerHTML = '';...`
- **שורה 1961** (js): `row.innerHTML = `...`
- **שורה 547** (js): `const resultsContainer = document.createElement('div');...`
- **שורה 1059** (js): `const resultsContainer = document.createElement('div');...`
- ... ועוד 2 בעיות

### html_structure

- **שורה 163** (js): `<button data-button-type="SAVE" data-onclick="saveCssFile()"></button>...`
- **שורה 366** (js): `<button data-button-type="DELETE" data-variant="full" data-onclick="confirmDelet...`
- **שורה 529** (js): `<button data-button-type="VIEW" data-variant="small" data-onclick="viewCssFile('...`
- **שורה 530** (js): `<button data-button-type="EDIT" data-variant="small" data-onclick="editCssFile('...`
- **שורה 698** (js): `<button data-button-type="DELETE" data-variant="full" data-onclick="executeUnuse...`
- **שורה 1029** (js): `<button data-button-type="DELETE" data-variant="small" data-onclick="removeSpeci...`
- **שורה 1498** (js): `<button data-button-type="DELETE" data-variant="full" data-onclick="executeDelet...`
- **שורה 1969** (js): `<button data-button-type="VIEW" data-variant="small" data-onclick="viewCssFile('...`
- **שורה 1970** (js): `<button data-button-type="EDIT" data-variant="small" data-onclick="editCssFile('...`
- **שורה 1971** (js): `<button data-button-type="DELETE" data-variant="small" data-onclick="confirmDele...`
- ... ועוד 57 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 12 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
