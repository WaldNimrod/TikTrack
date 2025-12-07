# דוח משימות - db_display.html

**תאריך יצירה:** 1764521947.967354  
**קטגוריה:** עמוד טכני  
**עדיפות:** בינונית

---

## סטטוס נוכחי

- **קובץ JS:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/scripts/db_display.js
- **קובץ HTML:** /Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui/db_display.html
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
- ✅ **logger**: ok (19 בעיות)
- ❌ **cache**: missing (0 בעיות)
- ⚠️ **dom_manipulation**: issues_found (4 בעיות)
- ⚠️ **html_structure**: issues_found (19 בעיות)

---

## בעיות מפורטות

### unified_init

- **שורה 469** (html): `<script src="scripts/init-system/package-manifest.js?v=1.0.0"></script> <!-- Pac...`
- **שורה 471** (html): `<script src="scripts/page-initialization-configs.js?v=1.0.0"></script> <!-- Page...`

### tables

- **שורה 257** (js): `* Create table headers from data (FALLBACK - Use UnifiedTableSystem instead)...`
- **שורה 258** (js): `* @deprecated Use window.UnifiedTableSystem.renderer.render() instead...`
- **שורה 269** (js): `* Create table body HTML from data (FALLBACK - Use UnifiedTableSystem instead)...`
- **שורה 270** (js): `* @deprecated Use window.UnifiedTableSystem.renderer.render() instead...`
- **שורה 96** (html): `<table class="table" id="accountsTable" data-table-type="trading_accounts">...`
- **שורה 119** (html): `<table class="table" id="tradesTable" data-table-type="trades">...`
- **שורה 142** (html): `<table class="table" id="tickersTable" data-table-type="tickers">...`
- **שורה 165** (html): `<table class="table" id="tradePlansTable" data-table-type="trade_plans">...`
- **שורה 188** (html): `<table class="table" id="executionsTable" data-table-type="executions">...`
- **שורה 211** (html): `<table class="table" id="alertsTable" data-table-type="alerts">...`
- ... ועוד 2 בעיות

### icons

- **שורה 38** (html): `<!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem...`
- **שורה 58** (html): `<img src="/trading-ui/images/icons/entities/db_display.svg" alt="בסיס נתונים" cl...`
- **שורה 86** (html): `<img src="/trading-ui/images/icons/entities/trading_accounts.svg" alt="trading_a...`
- **שורה 109** (html): `<img src="/trading-ui/images/icons/entities/trades.svg" alt="trades" class="sect...`
- **שורה 132** (html): `<img src="/trading-ui/images/icons/entities/tickers.svg" alt="tickers" class="se...`
- **שורה 155** (html): `<img src="/trading-ui/images/icons/entities/trade_plans.svg" alt="trade_plans" c...`
- **שורה 178** (html): `<img src="/trading-ui/images/icons/entities/executions.svg" alt="executions" cla...`
- **שורה 201** (html): `<img src="/trading-ui/images/icons/entities/alerts.svg" alt="alerts" class="sect...`
- **שורה 224** (html): `<img src="/trading-ui/images/icons/entities/notes.svg" alt="notes" class="sectio...`
- **שורה 247** (html): `<img src="/trading-ui/images/icons/entities/cash_flows.svg" alt="cash_flows" cla...`

### dom_manipulation

- **שורה 188** (js): `thead.innerHTML = createTableHeaders(data);...`
- **שורה 195** (js): `tbody.innerHTML = tbodyHTML;...`
- **שורה 307** (js): `tbody.innerHTML = '<tr><td colspan="100" class="text-center">Loading data...</td...`
- **שורה 323** (js): `tbody.innerHTML = `<tr><td colspan="100" class="text-center text-danger">Error: ...`

### html_structure

- **שורה 62** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 91** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 114** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 137** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 160** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 183** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 206** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 229** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 252** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
- **שורה 62** (html): `<button data-button-type="TOGGLE" data-variant="small" data-onclick="toggleSecti...`
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
