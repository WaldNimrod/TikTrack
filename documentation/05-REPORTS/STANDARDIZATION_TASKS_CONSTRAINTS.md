# דוח משימות - constraints.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/constraints.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/constraints.html
- **סה"כ בעיות:** 54

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (10 בעיות)
- ⚠️ **notifications**: issues_found (1 בעיות)
- ✅ **modals**: ok (36 בעיות)
- ❌ **tables**: missing (9 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ❌ **icons**: missing (7 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (13 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (10 בעיות)
- ⚠️ **html_structure**: issues_found (25 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 409** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 411** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### notifications

- **שורה 802** (js): `confirmed = confirm(confirmMessage);...`

### tables

- **שורה 1512** (js): `* Register constraints table with UnifiedTableSystem...`
- **שורה 1515** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1515** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1516** (js): `window.Logger?.warn('⚠️ UnifiedTableSystem not available for constraints registr...`
- **שורה 1522** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1522** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1527** (js): `window.UnifiedTableSystem.registry.register(tableType, {...`
- **שורה 1547** (js): `window.Logger?.info?.('✅ Registered constraints table with UnifiedTableSystem', ...`
- **שורה 175** (html): `<table class="data-table table-striped table-hover" id="constraints-table" data-...`

### icons

- **שורה 48** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 179** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`
- **שורה 182** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`
- **שורה 185** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`
- **שורה 188** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`
- **שורה 191** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`
- **שורה 194** (html): `<img src="/trading-ui/images/icons/tabler/arrows-sort.svg" width="16" height="16...`

### dom_manipulation

- **שורה 144** (js): `tableFilter.innerHTML = '<option value="">כל הטבלאות</option>';...`
- **שורה 211** (js): `content.innerHTML = html;...`
- **שורה 271** (js): `content.innerHTML = html;...`
- **שורה 332** (js): `content.innerHTML = html;...`
- **שורה 384** (js): `tbody.innerHTML = `...`
- **שורה 433** (js): `tbody.innerHTML = html;...`
- **שורה 545** (js): `messagesContainer.innerHTML = `...`
- **שורה 554** (js): `messagesContainer.innerHTML = '';...`
- **שורה 1371** (js): `resultsContainer.innerHTML = html;...`
- **שורה 147** (js): `const option = document.createElement('option');...`

### html_structure

- **שורה 689** (js): `<button data-button-type="EDIT" data-variant="full" data-icon="✏️" data-text="ער...`
- **שורה 878** (js): `<button data-button-type="EXPORT" data-variant="full" data-icon="📤" data-text="י...`
- **שורה 548** (js): `<button data-button-type="CLOSE" data-variant="small" data-attributes="data-bs-d...`
- **שורה 665** (js): `<button data-button-type="CLOSE" data-variant="small" data-attributes="data-bs-d...`
- **שורה 688** (js): `<button data-button-type="CLOSE" data-attributes="data-bs-dismiss='modal' type='...`
- **שורה 689** (js): `<button data-button-type="EDIT" data-variant="full" data-icon="✏️" data-text="ער...`
- **שורה 858** (js): `<button data-button-type="CLOSE" data-variant="small" data-attributes="data-bs-d...`
- **שורה 877** (js): `<button data-button-type="CLOSE" data-attributes="data-bs-dismiss='modal' type='...`
- **שורה 878** (js): `<button data-button-type="EXPORT" data-variant="full" data-icon="📤" data-text="י...`
- **שורה 863** (js): `<div class="progress-bar" role="progressbar" style="width: 0%"></div>...`
- ... ועוד 15 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 5 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
