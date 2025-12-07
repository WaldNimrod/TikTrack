# דוח משימות - system-management.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/system-management.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/system-management.html
- **סה"כ בעיות:** 82

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ❌ **section_toggle**: missing (18 בעיות)
- ✅ **notifications**: ok (10 בעיות)
- ✅ **modals**: ok (18 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (4 בעיות)
- ❌ **icons**: missing (10 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (34 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (26 בעיות)
- ⚠️ **html_structure**: issues_found (22 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 383** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 385** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### section_toggle

- **שורה 34** (html): `<div class="top-section" id="system-management-top" data-section="top">...`
- **שורה 70** (html): `<div class="content-section" id="sm-server" data-section="section1">...`
- **שורה 73** (html): `<div class="content-section" id="sm-cache" data-section="section2">...`
- **שורה 90** (html): `<div class="content-section" id="sm-performance" data-section="section3">...`
- **שורה 107** (html): `<div class="content-section" id="sm-external-data" data-section="section4">...`
- **שורה 124** (html): `<div class="content-section" id="sm-alerts" data-section="section5">...`
- **שורה 141** (html): `<div class="content-section" id="sm-database" data-section="section6">...`
- **שורה 158** (html): `<div class="content-section" id="sm-background-tasks" data-section="section7">...`
- **שורה 175** (html): `<div class="content-section" id="sm-operations" data-section="section8">...`
- **שורה 192** (html): `<div class="content-section" id="sm-system-settings" data-section="section9">...`
- ... ועוד 8 בעיות

### data_collection

- **שורה 1824** (js): `// Use DataCollectionService to set value if available...`
- **שורה 1825** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1825** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1826** (js): `window.DataCollectionService.setValue(select.id, provider, 'text');...`

### icons

- **שורה 18** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 37** (html): `<img src="/trading-ui/images/icons/tabler/settings.svg" alt="מנהל מערכת" class="...`
- **שורה 76** (html): `<img src="/trading-ui/images/icons/tabler/server.svg" alt="שרת" class="section-i...`
- **שורה 93** (html): `<img src="/trading-ui/images/icons/tabler/database.svg" alt="מטמון" class="secti...`
- **שורה 110** (html): `<img src="/trading-ui/images/icons/tabler/chart-line.svg" alt="ביצועים" class="s...`
- **שורה 127** (html): `<img src="/trading-ui/images/icons/tabler/world.svg" alt="נתונים חיצוניים" class...`
- **שורה 144** (html): `<img src="/trading-ui/images/icons/tabler/bell.svg" alt="התראות" class="section-...`
- **שורה 161** (html): `<img src="/trading-ui/images/icons/tabler/database.svg" alt="בסיס נתונים" class=...`
- **שורה 178** (html): `<img src="/trading-ui/images/icons/tabler/clock.svg" alt="משימות רקע" class="sec...`
- **שורה 195** (html): `<img src="/trading-ui/images/icons/tabler/tools.svg" alt="פעולות" class="section...`

### dom_manipulation

- **שורה 597** (js): `container.innerHTML = `...`
- **שורה 685** (js): `resultsContent.innerHTML = `...`
- **שורה 822** (js): `modal.innerHTML = `...`
- **שורה 1248** (js): `detailsElement.innerHTML = scoreDetails;...`
- **שורה 1391** (js): `providerListElement.innerHTML = providers.map(provider => `...`
- **שורה 1413** (js): `logContent.innerHTML = '';...`
- **שורה 1418** (js): `statusLog.innerHTML = `...`
- **שורה 1433** (js): `logEntry.innerHTML = `...`
- **שורה 1515** (js): `backupStatusElement.innerHTML = '<span class="text-success">✅ גיבוי עדכני</span>...`
- **שורה 1517** (js): `backupStatusElement.innerHTML = '<span class="text-warning">⚠️ גיבוי ישן</span>'...`
- ... ועוד 16 בעיות

### html_structure

- **שורה 620** (js): `<div class="results-content" style="display: none;">...`
- **שורה 751** (js): `<pre class="bg-light p-2 rounded" style="font-size: 0.8em; max-height: 200px; ov...`
- **שורה 897** (js): `<pre class="bg-light p-2 rounded" style="font-size: 0.8em; max-height: 200px; ov...`
- **שורה 59** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleAllSe...`
- **שורה 80** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 97** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 114** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 131** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 148** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 165** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- ... ועוד 12 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 8 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
