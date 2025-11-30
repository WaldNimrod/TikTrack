# דוח משימות - external-data-dashboard.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד משני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/external-data-dashboard.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/external-data-dashboard.html
- **סה"כ בעיות:** 105

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (14 בעיות)
- ✅ **notifications**: ok (6 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (6 בעיות)
- ❌ **icons**: missing (3 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (2 בעיות)
- ❌ **cache**: missing (1 בעיות)
- ⚠️ **dom_manipulation**: issues_found (18 בעיות)
- ⚠️ **html_structure**: issues_found (75 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 542** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 544** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### data_collection

- **שורה 1771** (js): `// Use DataCollectionService to clear fields if available...`
- **שורה 1772** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1772** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1773** (js): `if (hotElement) window.DataCollectionService.setValue(hotElement.id, '', 'text')...`
- **שורה 1774** (js): `if (warmElement) window.DataCollectionService.setValue(warmElement.id, '', 'text...`
- **שורה 1775** (js): `if (maxElement) window.DataCollectionService.setValue(maxElement.id, '', 'text')...`

### icons

- **שורה 15** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 25** (html): `<h2><img src="/trading-ui/images/icons/tabler/world.svg" width="16" height="16" ...`
- **שורה 92** (html): `<h6 class="card-title mb-3"><img src="/trading-ui/images/icons/tabler/chart-bar....`

### cache

- **שורה 3217** (js): `* - State persistence via UnifiedCacheManager...`

### dom_manipulation

- **שורה 956** (js): `detailsElement.innerHTML = '<div class="status-detail">לא נמצאו נתונים עבור Yaho...`
- **שורה 960** (js): `detailsElement.innerHTML = [...`
- **שורה 986** (js): `detailsElement.innerHTML = '<div class="status-detail">נתוני מטמון לא זמינים</di...`
- **שורה 997** (js): `detailsElement.innerHTML = [...`
- **שורה 1023** (js): `detailsElement.innerHTML = '<div class="status-detail">נתוני ספקים לא זמינים</di...`
- **שורה 1027** (js): `detailsElement.innerHTML = [...`
- **שורה 1047** (js): `detailsElement.innerHTML = '<div class="status-detail">נתוני API לא זמינים</div>...`
- **שורה 1050** (js): `detailsElement.innerHTML = [...`
- **שורה 1066** (js): `element.innerHTML = html;...`
- **שורה 1236** (js): `providersGrid.innerHTML = '<div class="col-12 text-center text-muted py-4">לא נמ...`
- ... ועוד 8 בעיות

### html_structure

- **שורה 27** (html): `<button data-button-type="COPY" data-text="העתק לוג מפורט" data-onclick="Externa...`
- **שורה 28** (html): `<button class="filter-toggle-btn" data-onclick="toggleAllSections()" title="הצג/...`
- **שורה 133** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('actions-section')...`
- **שורה 146** (html): `<button data-button-type="REFRESH" data-text="רענון סטטוס" data-onclick="Externa...`
- **שורה 147** (html): `<button data-button-type="REFRESH" data-text="רענון ספקים" data-onclick="Externa...`
- **שורה 148** (html): `<button data-button-type="REFRESH" data-text="רענון נתוני מטמון" data-onclick="E...`
- **שורה 149** (html): `<button data-button-type="PLAY" data-text="רענון כל הטיקרים" data-onclick="Exter...`
- **שורה 159** (html): `<button data-button-type="MENU" data-text="ניקוי מטמון נתונים חיצוניים" data-onc...`
- **שורה 160** (html): `<button data-button-type="RESET" data-text="איפוס מלא (מטמון + לוגים)" data-oncl...`
- **שורה 161** (html): `<button data-button-type="MENU" data-text="אופטימיזציית מטמון נתונים חיצוניים" d...`
- ... ועוד 65 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 10 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
