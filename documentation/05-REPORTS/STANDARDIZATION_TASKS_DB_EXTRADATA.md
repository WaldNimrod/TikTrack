# דוח משימות - db_extradata.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/db_extradata.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/db_extradata.html
- **סה"כ בעיות:** 47

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (19 בעיות)
- ✅ **notifications**: ok (0 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (12 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ❌ **icons**: missing (10 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (18 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (4 בעיות)
- ⚠️ **html_structure**: issues_found (19 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 456** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 458** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 238** (js): `* Create table headers from data (FALLBACK - Use UnifiedTableSystem instead)...`
- **שורה 239** (js): `* @deprecated Use window.UnifiedTableSystem.renderer.render() instead...`
- **שורה 257** (js): `* Create table rows from data (FALLBACK - Use UnifiedTableSystem instead)...`
- **שורה 258** (js): `* @deprecated Use window.UnifiedTableSystem.renderer.render() instead...`
- **שורה 95** (html): `<table class="table" id="constraintsTable" data-table-type="constraints">...`
- **שורה 118** (html): `<table class="table" id="currenciesTable" data-table-type="currencies">...`
- **שורה 141** (html): `<table class="table" id="preferenceGroupsTable" data-table-type="preference_grou...`
- **שורה 164** (html): `<table class="table" id="systemSettingGroupsTable" data-table-type="system_setti...`
- **שורה 187** (html): `<table class="table" id="externalDataProvidersTable" data-table-type="external_d...`
- **שורה 210** (html): `<table class="table" id="quotesLastTable" data-table-type="quotes_last">...`
- ... ועוד 2 בעיות

### icons

- **שורה 37** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 57** (html): `<img src="images/icons/entities/development.svg" alt="טבלאות עזר" class="section...`
- **שורה 85** (html): `<img src="images/icons/entities/development.svg" alt="constraints" class="sectio...`
- **שורה 108** (html): `<img src="images/icons/entities/development.svg" alt="currencies" class="section...`
- **שורה 131** (html): `<img src="images/icons/entities/development.svg" alt="preference_groups" class="...`
- **שורה 154** (html): `<img src="images/icons/entities/development.svg" alt="system_setting_groups" cla...`
- **שורה 177** (html): `<img src="images/icons/entities/development.svg" alt="external_data_providers" c...`
- **שורה 200** (html): `<img src="images/icons/entities/development.svg" alt="quotes_last" class="sectio...`
- **שורה 223** (html): `<img src="images/icons/entities/development.svg" alt="plan_conditions" class="se...`
- **שורה 246** (html): `<img src="images/icons/entities/development.svg" alt="user_preferences" class="s...`

### dom_manipulation

- **שורה 167** (js): `tbody.innerHTML = '<tr><td colspan="100" class="text-center text-muted">Loading ...`
- **שורה 183** (js): `tbody.innerHTML = `<tr><td colspan="100" class="text-center text-danger">Error: ...`
- **שורה 226** (js): `thead.innerHTML = headers;...`
- **שורה 231** (js): `tbody.innerHTML = rows;...`

### html_structure

- **שורה 61** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 90** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 113** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 136** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 159** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 182** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 205** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 228** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 251** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 61** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- ... ועוד 9 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 4 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
