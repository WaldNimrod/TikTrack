# דוח משימות - notifications-center.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/notifications-center.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/notifications-center.html
- **סה"כ בעיות:** 134

---

## סיכום קטגוריות

- ❌ **unified_init**: missing (2 בעיות)
- ✅ **section_toggle**: ok (14 בעיות)
- ✅ **notifications**: ok (21 בעיות)
- ✅ **modals**: ok (18 בעיות)
- ❌ **tables**: missing (0 בעיות)
- ❌ **field_renderer**: missing (0 בעיות)
- ❌ **crud_handler**: missing (0 בעיות)
- ❌ **select_populator**: missing (0 בעיות)
- ❌ **data_collection**: missing (17 בעיות)
- ❌ **icons**: missing (49 בעיות)
- ❌ **colors**: missing (0 בעיות)
- ❌ **info_summary**: missing (0 בעיות)
- ❌ **pagination**: missing (0 בעיות)
- ❌ **entity_details**: missing (0 בעיות)
- ❌ **conditions**: missing (0 בעיות)
- ✅ **page_state**: ok (0 בעיות)
- ✅ **logger**: ok (111 בעיות)
- ❌ **cache**: missing (3 בעיות)
- ⚠️ **dom_manipulation**: issues_found (16 בעיות)
- ⚠️ **html_structure**: issues_found (47 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 466** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 468** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### data_collection

- **שורה 1277** (js): `// Use DataCollectionService to get values if available...`
- **שורה 1279** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1279** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1280** (js): `typeFilter = window.DataCollectionService.getValue('historyFilter', 'text', '') ...`
- **שורה 1281** (js): `pageFilter = window.DataCollectionService.getValue('pageFilter', 'text', '') || ...`
- **שורה 1282** (js): `period = window.DataCollectionService.getValue('historyPeriod', 'text', '24h') |...`
- **שורה 1429** (js): `// Use DataCollectionService to get values if available...`
- **שורה 1431** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1431** (js): `if (typeof window.DataCollectionService !== 'undefined' && window.DataCollection...`
- **שורה 1432** (js): `typeFilter = window.DataCollectionService.getValue('historyFilter', 'text', '') ...`
- ... ועוד 7 בעיות

### icons

- **שורה 132** (js): `// Use IconSystem to render category icon...`
- **שורה 134** (js): `if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {...`
- **שורה 134** (js): `if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {...`
- **שורה 136** (js): `iconHTML = await window.IconSystem.renderIcon('category', category.icon, {...`
- **שורה 143** (js): `// Fallback if IconSystem fails...`
- **שורה 147** (js): `// Fallback if IconSystem not available...`
- **שורה 231** (js): `// Render icons using IconSystem...`
- **שורה 236** (js): `if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {...`
- **שורה 236** (js): `if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {...`
- **שורה 238** (js): `slidersIcon = await window.IconSystem.renderIcon('button', 'sliders', { size: '1...`
- ... ועוד 39 בעיות

### cache

- **שורה 1076** (js): `if (window.UnifiedCacheManager) {...`
- **שורה 1077** (js): `window.Logger?.debug('🔧 טוען היסטוריה מהמערכת החדשה (UnifiedCacheManager)...');...`
- **שורה 1078** (js): `const globalHistory = await window.UnifiedCacheManager.get('notification_history...`

### dom_manipulation

- **שורה 164** (js): `container.innerHTML = html;...`
- **שורה 281** (js): `container.innerHTML = preferencesHtml;...`
- **שורה 530** (js): `popup.innerHTML = `...`
- **שורה 660** (js): `container.innerHTML = `...`
- **שורה 703** (js): `container.innerHTML = `...`
- **שורה 716** (js): `container.innerHTML = notificationHTMLs.join('');...`
- **שורה 1010** (js): `pageFilterSelect.innerHTML = '<option value="">כל העמודים</option>';...`
- **שורה 1323** (js): `historyContainer.innerHTML = '';...`
- **שורה 1337** (js): `historyContainer.innerHTML = `...`
- **שורה 1350** (js): `notificationElement.innerHTML = notificationHTML;...`
- ... ועוד 6 בעיות

### html_structure

- **שורה 533** (js): `<button data-button-type="CLOSE" data-size="small" data-variant="small" data-onc...`
- **שורה 2021** (js): `<button data-button-type="CLOSE" data-size="large" data-variant="small" data-onc...`
- **שורה 2035** (js): `<button data-button-type="CANCEL" data-onclick="data-bs-dismiss='modal'" data-te...`
- **שורה 533** (js): `<button data-button-type="CLOSE" data-size="small" data-variant="small" data-onc...`
- **שורה 2021** (js): `<button data-button-type="CLOSE" data-size="large" data-variant="small" data-onc...`
- **שורה 2026** (js): `<button data-button-type="EXPORT" data-format="csv" data-text="ייצוא CSV" title=...`
- **שורה 2028** (js): `<button data-button-type="EXPORT" data-format="json" data-text="ייצוא JSON" titl...`
- **שורה 2030** (js): `<button data-button-type="COPY" data-format="clipboard" data-text="העתקה ללוח" t...`
- **שורה 2035** (js): `<button data-button-type="CANCEL" data-onclick="data-bs-dismiss='modal'" data-te...`
- **שורה 144** (js): `iconHTML = `<img src="/trading-ui/images/icons/tabler/${category.icon}.svg" widt...`
- ... ועוד 37 בעיות

---

## תיקונים נדרשים

- הוספת מערכות חסרות (ראה מטריצת סטנדרטיזציה)

---

## הערכת זמן

- **עדיפות:** בינונית
- **זמן משוער:** 13 דקות

---

**הערות:**
- דוח זה נוצר אוטומטית על בסיס סריקה מעמיקה
- יש לבדוק ידנית את כל הבעיות לפני תיקון
- ראה `STANDARDIZATION_REMAINING_PAGES_TASKS_REPORT.md` למידע נוסף
