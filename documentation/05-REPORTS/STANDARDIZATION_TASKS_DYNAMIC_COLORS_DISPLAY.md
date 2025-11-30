# דוח משימות - dynamic-colors-display.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/dynamic-colors-display.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/dynamic-colors-display.html
- **סה"כ בעיות:** 52

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (15 בעיות)
- ✅ **notifications**: ok (7 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ❌ **icons**: missing (5 בעיות)
- ❌ **colors**: missing (2 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ⚠️ **logger**: issues_found (3 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (4 בעיות)
- ⚠️ **html_structure**: issues_found (36 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 209** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 211** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### icons

- **שורה 60** (html): `<h2><img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height...`
- **שורה 76** (html): `<h2><img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height...`
- **שורה 90** (html): `<h2><img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height...`
- **שורה 104** (html): `<h2><img src="/trading-ui/images/icons/tabler/chart-bar.svg" width="16" height="...`
- **שורה 118** (html): `<h2><img src="/trading-ui/images/icons/tabler/settings.svg" width="16" height="1...`

### colors

- **שורה 243** (js): `const color = window.getEntityColor(entity) || '#6c757d';...`
- **שורה 484** (js): `<code class="bg-light p-2 rounded small">getEntityColor(entityType)</code>...`

### logger

- **שורה 7** (js): `//     console.log('=== Dynamic Colors Display Page Loaded ===');...`
- **שורה 751** (js): `console.error('שגיאה בהעתקה:', err);...`
- **שורה 179** (html): `<script src="scripts/logger-service.js?v=1.0.0"></script> <!-- Advanced logging ...`

### dom_manipulation

- **שורה 159** (js): `sectionElement.innerHTML = sectionContent;...`
- **שורה 263** (js): `sectionElement.innerHTML = sectionContent;...`
- **שורה 423** (js): `sectionElement.innerHTML = sectionContent;...`
- **שורה 606** (js): `sectionElement.innerHTML = sectionContent;...`

### html_structure

- **שורה 51** (js): `<div class="card h-100" style="border-color: ${positiveColor}; border-width: 2px...`
- **שורה 52** (js): `<div class="card-header" style="background-color: ${window.getNumericValueColor(...`
- **שורה 57** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- **שורה 60** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- **שורה 63** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- **שורה 76** (js): `<div class="card h-100" style="border-color: ${negativeColor}; border-width: 2px...`
- **שורה 77** (js): `<div class="card-header" style="background-color: ${window.getNumericValueColor(...`
- **שורה 82** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- **שורה 85** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- **שורה 88** (js): `<div class="p-3 rounded" style="background-color: ${window.getNumericValueColor(...`
- ... ועוד 26 בעיות

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
