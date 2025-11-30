# דוח משימות - chart-management.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד משני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/chart-management.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/chart-management.html
- **סה"כ בעיות:** 58

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ❌ **section_toggle**: missing (7 בעיות)
- ✅ **notifications**: ok (0 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ❌ **icons**: missing (15 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (4 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (3 בעיות)
- ⚠️ **html_structure**: issues_found (31 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 349** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 351** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### section_toggle

- **שורה 62** (html): `<div class="top-section" data-section="top">...`
- **שורה 77** (html): `<div class="content-section" id="overviewSection" data-section="overviewSection"...`
- **שורה 128** (html): `<div class="content-section" id="managementSection" data-section="managementSect...`
- **שורה 204** (html): `<div class="content-section" id="settingsSection" data-section="settingsSection"...`
- **שורה 80** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 131** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 207** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`

### icons

- **שורה 55** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 67** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 70** (html): `<img src="/trading-ui/images/icons/tabler/download.svg" width="16" height="16" a...`
- **שורה 87** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 97** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 107** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 117** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 138** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 155** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 158** (html): `<img src="/trading-ui/images/icons/tabler/chart-line.svg" width="16" height="16"...`
- ... ועוד 5 בעיות

### dom_manipulation

- **שורה 170** (js): `card.innerHTML = `...`
- **שורה 410** (js): `this.elements.chartsList.innerHTML =...`
- **שורה 167** (js): `const card = document.createElement('div');...`

### html_structure

- **שורה 66** (html): `<button data-button-type="TOGGLE" data-onclick="refreshChartsStatus()" data-clas...`
- **שורה 69** (html): `<button data-button-type="EXPORT" data-onclick="exportAllCharts()" data-classes=...`
- **שורה 80** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 131** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 136** (html): `<button data-button-type="ADD" data-entity-type="chart" data-variant="full" data...`
- **שורה 137** (html): `<button data-button-type="REFRESH" data-onclick="refreshAllCharts()" data-text="...`
- **שורה 140** (html): `<button data-button-type="DELETE" data-onclick="destroyAllCharts()" data-text="מ...`
- **שורה 154** (html): `<button class="btn btn-primary btn-sm me-2 mb-2" data-onclick="createTestChart()...`
- **שורה 157** (html): `<button class="btn btn-info btn-sm me-2 mb-2" data-onclick="createPerformanceCha...`
- **שורה 160** (html): `<button class="btn btn-success btn-sm me-2 mb-2" data-onclick="createAccountChar...`
- ... ועוד 21 בעיות

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
