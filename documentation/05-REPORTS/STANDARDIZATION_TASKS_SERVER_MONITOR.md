# דוח משימות - server-monitor.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/server-monitor.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/server-monitor.html
- **סה"כ בעיות:** 95

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ❌ **section_toggle**: missing (17 בעיות)
- ✅ **notifications**: ok (34 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (14 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ❌ **icons**: missing (12 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (2 בעיות)
- ✅ **logger**: ok (47 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (5 בעיות)
- ⚠️ **html_structure**: issues_found (45 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 590** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 592** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### section_toggle

- **שורה 76** (html): `<div class="top-section" data-section="top">...`
- **שורה 167** (html): `<div class="content-section" id="cursorTasksSection" data-section="cursorTasksSe...`
- **שורה 274** (html): `<div class="content-section" id="section1" data-section="section1">...`
- **שורה 328** (html): `<div class="content-section" id="section2" data-section="section2">...`
- **שורה 395** (html): `<div class="content-section" id="section3" data-section="section3">...`
- **שורה 481** (html): `<div class="content-section" id="section4" data-section="section4">...`
- **שורה 95** (html): `${createToggleButton("toggleSection('section1')", "הצג/הסתר סקשן")}...`
- **שורה 178** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('cursorTasksSectio...`
- **שורה 179** (html): `${createToggleButton("toggleSection('section1')", "הצג/הסתר סקשן")}...`
- **שורה 277** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('section1')" title...`
- ... ועוד 7 בעיות

### field_renderer

- **שורה 181** (js): `// Use FieldRendererService or dateUtils for consistent date formatting...`
- **שורה 183** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 183** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 184** (js): `lastCheck.textContent = window.FieldRendererService.renderDate(now, true);...`
- **שורה 315** (js): `// Use FieldRendererService or dateUtils for date formatting...`
- **שורה 316** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 316** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 317** (js): `return window.FieldRendererService.renderDate(timestampDate, false);...`
- **שורה 332** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- **שורה 332** (js): `if (window.FieldRendererService && typeof window.FieldRendererService.renderDate...`
- ... ועוד 4 בעיות

### icons

- **שורה 105** (html): `<img src="/trading-ui/images/icons/tabler/circle.svg" width="16" height="16" alt...`
- **שורה 189** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 195** (html): `<img src="/trading-ui/images/icons/tabler/player-play.svg" width="16" height="16...`
- **שורה 198** (html): `<img src="/trading-ui/images/icons/tabler/refresh.svg" width="16" height="16" al...`
- **שורה 201** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 204** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 214** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 220** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 223** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- **שורה 226** (html): `<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16...`
- ... ועוד 2 בעיות

### dom_manipulation

- **שורה 260** (js): `logsContainer.innerHTML = '';...`
- **שורה 276** (js): `logElement.innerHTML = `...`
- **שורה 761** (js): `systemInfo.innerHTML = `...`
- **שורה 270** (js): `const logElement = document.createElement('div');...`
- **שורה 471** (js): `const a = document.createElement('a');...`

### html_structure

- **שורה 94** (html): `<button class="filter-toggle-btn" data-onclick="toggleAllSections()" title="הצג/...`
- **שורה 178** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('cursorTasksSectio...`
- **שורה 277** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('section1')" title...`
- **שורה 305** (html): `<button class="btn btn-success w-100 mb-3" data-onclick="restartServerAdvanced()...`
- **שורה 310** (html): `<button class="btn btn-warning w-100 mb-3" data-onclick="stopServer()" data-butt...`
- **שורה 315** (html): `<button data-button-type="REFRESH" data-onclick="refreshData()" data-classes="re...`
- **שורה 318** (html): `<button class="btn btn-secondary w-100 mb-3" data-onclick="clearLogs()" data-but...`
- **שורה 331** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('section2')" title...`
- **שורה 398** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('section3')" title...`
- **שורה 437** (html): `<button class="btn btn-primary" data-onclick="checkApiHealth()" data-button-type...`
- ... ועוד 35 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 9 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
