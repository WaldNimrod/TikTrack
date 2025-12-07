# דוח משימות - background-tasks.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/background-tasks.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/background-tasks.html
- **סה"כ בעיות:** 57

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (8 בעיות)
- ✅ **notifications**: ok (2 בעיות)
- ✅ **modals**: ok (0 בעיות)
- ❌ **tables**: missing (10 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (0 בעיות)
- ✅ **icons**: ok (33 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (57 בעיות)
- ❌ **cache**: missing (12 בעיות)
- ⚠️ **dom_manipulation**: issues_found (13 בעיות)
- ⚠️ **html_structure**: issues_found (20 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 379** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 381** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 1439** (js): `* Register background_tasks table with UnifiedTableSystem...`
- **שורה 1442** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1442** (js): `if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {...`
- **שורה 1443** (js): `// UnifiedTableSystem is optional - silently skip if not available...`
- **שורה 1445** (js): `window.Logger.debug('UnifiedTableSystem not available for background_tasks regis...`
- **שורה 1452** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1452** (js): `if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem...`
- **שורה 1457** (js): `window.UnifiedTableSystem.registry.register(tableType, {...`
- **שורה 1473** (js): `window.Logger?.info?.('✅ Registered background_tasks table with UnifiedTableSyst...`
- **שורה 207** (html): `<table class="data-table table-striped" id="tasks-table" data-table-type="backgr...`

### cache

- **שורה 730** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 730** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 731** (js): `await window.UnifiedCacheManager.clear('memory');...`
- **שורה 752** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 752** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 753** (js): `await window.UnifiedCacheManager.clear('memory');...`
- **שורה 796** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 796** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- **שורה 797** (js): `await window.UnifiedCacheManager.clear('memory');...`
- **שורה 841** (js): `if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {...`
- ... ועוד 2 בעיות

### dom_manipulation

- **שורה 132** (js): `element.innerHTML = loaderIcon + ' טוען...';...`
- **שורה 140** (js): `element.innerHTML = '▶️ הפעל Scheduler';...`
- **שורה 161** (js): `element.innerHTML = stopIcon + ' עצור Scheduler';...`
- **שורה 182** (js): `element.innerHTML = refreshIcon + ' רענן';...`
- **שורה 351** (js): `stopBtn.innerHTML = '⏹️ עצור Scheduler';...`
- **שורה 357** (js): `startBtn.innerHTML = '▶️ הפעל Scheduler';...`
- **שורה 385** (js): `tbody.innerHTML = '<tr><td colspan="7" class="no-data">אין משימות זמינות</td></t...`
- **שורה 389** (js): `tbody.innerHTML = tasks.map(task => `...`
- **שורה 453** (js): `chartContainer.innerHTML = '<div class="no-data">אין נתוני ביצועים זמינים</div>'...`
- **שורה 473** (js): `chartContainer.innerHTML = `...`
- ... ועוד 3 בעיות

### html_structure

- **שורה 464** (js): `<div class="success-bar" style="width: ${stats.success_rate}%"></div>...`
- **שורה 94** (html): `<button class="filter-toggle-btn" data-onclick="toggleAllSections()" title="הצג/...`
- **שורה 117** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('systemStatus')" t...`
- **שורה 175** (html): `<button id="start-scheduler" class="btn btn-success btn-sm" data-onclick="startS...`
- **שורה 178** (html): `<button id="stop-scheduler" class="btn btn-danger btn-sm" data-onclick="stopSche...`
- **שורה 181** (html): `<button id="refresh-status" class="btn btn-primary btn-sm" data-onclick="refresh...`
- **שורה 191** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('tasksList')" titl...`
- **שורה 200** (html): `<button id="refresh-tasks" class="btn btn-secondary btn-sm" data-onclick="refres...`
- **שורה 233** (html): `<button class="filter-toggle-btn" data-onclick="toggleSection('backgroundTasksLo...`
- **שורה 242** (html): `<button id="refresh-background-tasks-log" class="btn btn-secondary btn-sm" data-...`
- ... ועוד 10 בעיות

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
