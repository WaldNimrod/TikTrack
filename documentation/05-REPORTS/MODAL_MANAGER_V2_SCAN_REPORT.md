# דוח סריקה - Modal Manager V2
## Modal Manager V2 Scanning Report

**תאריך:** 26.11.2025
**סה"כ עמודים:** 36

---

## סיכום כללי

- **עמודים עם bootstrap.Modal:** 9
- **עמודים עם פונקציות מקומיות:** 7
- **עמודים שמשתמשים ב-ModalManagerV2:** 8

---

## עמודים מרכזיים

### index
**קובץ HTML:** `trading-ui/index.html`
**קובץ JS:** `trading-ui/scripts/index.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### trades
**קובץ HTML:** `trading-ui/trades.html`
**קובץ JS:** `trading-ui/scripts/trades.js`

#### פונקציות מקומיות (4):
- שורה 2725: `async function openTradeConditionsModal(modalElement, options = {}) {...`
- שורה 1898: `function hideAddTradeModal() {...`
- שורה 1920: `function hideEditTradeModal() {...`
- שורה 2725: `async function openTradeConditionsModal(modalElement, options = {}) {...`

❌ צריך תיקון

### trade_plans
**קובץ HTML:** `trading-ui/trade_plans.html`
**קובץ JS:** `trading-ui/scripts/trade_plans.js`

#### שימושים ב-bootstrap.Modal (2):
- שורה 1044: `const modal = new bootstrap.Modal(document.getElementById('cancelTradePlanModal'...`
- שורה 1039: `const modal = bootstrap.Modal.getOrCreateInstance(modalElement);...`

#### פונקציות מקומיות (3):
- שורה 1015: `function openCancelTradePlanModal(tradePlanId) {...`
- שורה 2431: `async function openTradePlanConditionsModal(modalElement, options = {}) {...`
- שורה 2431: `async function openTradePlanConditionsModal(modalElement, options = {}) {...`

❌ צריך תיקון

### alerts
**קובץ HTML:** `trading-ui/alerts.html`
**קובץ JS:** `trading-ui/scripts/alerts.js`

#### שימושים ב-bootstrap.Modal (1):
- שורה 3718: `const modal = bootstrap.Modal.getInstance(document.getElementById('addAlertModal...`

❌ צריך תיקון

### tickers
**קובץ HTML:** `trading-ui/tickers.html`
**קובץ JS:** `trading-ui/scripts/tickers.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### trading_accounts
**קובץ HTML:** `trading-ui/trading_accounts.html`
**קובץ JS:** `trading-ui/scripts/trading_accounts.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### executions
**קובץ HTML:** `trading-ui/executions.html`
**קובץ JS:** `trading-ui/scripts/executions.js`

#### שימושים ב-bootstrap.Modal (1):
- שורה 2869: `const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));...`

#### פונקציות מקומיות (1):
- שורה 4636: `function openTradeDetailsModal(tradeId) {...`

❌ צריך תיקון

### cash_flows
**קובץ HTML:** `trading-ui/cash_flows.html`
**קובץ JS:** `trading-ui/scripts/cash_flows.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### notes
**קובץ HTML:** `trading-ui/notes.html`
**קובץ JS:** `trading-ui/scripts/notes.js`

#### שימושים ב-bootstrap.Modal (4):
- שורה 2430: `const modal = new bootstrap.Modal(document.getElementById('viewNoteModal'));...`
- שורה 1725: `const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNoteMod...`
- שורה 2595: `const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewNoteM...`
- שורה 2425: `const modal = bootstrap.Modal.getOrCreateInstance(modalElement);...`

❌ צריך תיקון

### research
**קובץ HTML:** `trading-ui/research.html`
**קובץ JS:** `trading-ui/scripts/research.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### preferences
**קובץ HTML:** `trading-ui/preferences.html`
**קובץ JS:** `trading-ui/scripts/preferences.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

## עמודים טכניים

### db_display
**קובץ HTML:** `trading-ui/db_display.html`
**קובץ JS:** `trading-ui/scripts/db_display.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### db_extradata
**קובץ HTML:** `trading-ui/db_extradata.html`
**קובץ JS:** `trading-ui/scripts/db_extradata.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### constraints
**קובץ HTML:** `trading-ui/constraints.html`
**קובץ JS:** `trading-ui/scripts/constraints.js`

#### שימושים ב-bootstrap.Modal (2):
- שורה 690: `const modal = new bootstrap.Modal(document.getElementById('viewConstraintModal')...`
- שורה 828: `const modal = new bootstrap.Modal(document.getElementById('validationModal'));...`

#### פונקציות מקומיות (1):
- שורה 779: `function showValidationModal(constraint, isAll) {...`

❌ צריך תיקון

### background-tasks
**קובץ HTML:** `trading-ui/background-tasks.html`
**קובץ JS:** `trading-ui/scripts/background-tasks.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### server-monitor
**קובץ HTML:** `trading-ui/server-monitor.html`
**קובץ JS:** `trading-ui/scripts/server-monitor.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### system-management
**קובץ HTML:** `trading-ui/system-management.html`
**קובץ JS:** `trading-ui/scripts/system-management.js`

#### שימושים ב-bootstrap.Modal (1):
- שורה 915: `const bsModal = new bootstrap.Modal(modal);...`

❌ צריך תיקון

### cache-test
**קובץ HTML:** `trading-ui/cache-test.html`

✅ אין סטיות - משתמש ב-ModalManagerV2

### notifications-center
**קובץ HTML:** `trading-ui/notifications-center.html`
**קובץ JS:** `trading-ui/scripts/notifications-center.js`

#### שימושים ב-bootstrap.Modal (1):
- שורה 1907: `const bsModal = new bootstrap.Modal(modal);...`

❌ צריך תיקון

### css-management
**קובץ HTML:** `trading-ui/css-management.html`
**קובץ JS:** `trading-ui/scripts/css-management.js`

#### שימושים ב-bootstrap.Modal (15):
- שורה 290: `const modal = new bootstrap.Modal(document.getElementById('cssViewerModal'));...`
- שורה 342: `const modal = new bootstrap.Modal(document.getElementById('deleteConfirmationMod...`
- שורה 674: `const modal = new bootstrap.Modal(document.getElementById('unusedCssRemovalModal...`
- שורה 1103: `const modal = new bootstrap.Modal(document.getElementById('backupDialogModal'));...`
- שורה 1272: `const modal = new bootstrap.Modal(document.getElementById('duplicateCleanupModal...`
- שורה 1396: `const modal = new bootstrap.Modal(document.getElementById('specificDuplicateClea...`
- שורה 1515: `const modal = new bootstrap.Modal(document.getElementById('deleteFileSelectionMo...`
- שורה 1812: `const modal = new bootstrap.Modal(document.getElementById('addCssFileModal'));...`
- שורה 362: `const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirm...`
- שורה 715: `const modal = bootstrap.Modal.getInstance(document.getElementById('unusedCssRemo...`
- שורה 1141: `const modal = bootstrap.Modal.getInstance(document.getElementById('backupDialogM...`
- שורה 1309: `const modal = bootstrap.Modal.getInstance(document.getElementById('duplicateClea...`
- שורה 1428: `const modal = bootstrap.Modal.getInstance(document.getElementById('specificDupli...`
- שורה 1546: `const modal = bootstrap.Modal.getInstance(document.getElementById('deleteFileSel...`
- שורה 1844: `const modal = bootstrap.Modal.getInstance(document.getElementById('addCssFileMod...`

#### פונקציות מקומיות (7):
- שורה 258: `function showCssViewerModal(filename, content) {...`
- שורה 311: `function showDeleteConfirmationModal(filename) {...`
- שורה 600: `function showUnusedCssRemovalModal(cleanupResults) {...`
- שורה 1224: `function showDuplicateCleanupModal(duplicates) {...`
- שורה 1351: `function showSpecificDuplicateCleanupModal(selector, duplicate) {...`
- שורה 1473: `function showDeleteFileSelectionModal(selector, duplicate) {...`
- שורה 1773: `function showAddCssFileModal() {...`

❌ צריך תיקון

### dynamic-colors-display
**קובץ HTML:** `trading-ui/dynamic-colors-display.html`
**קובץ JS:** `trading-ui/scripts/dynamic-colors-display.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### designs
**קובץ HTML:** `trading-ui/designs.html`
**קובץ JS:** `trading-ui/scripts/designs.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### tradingview-test-page
**קובץ HTML:** `trading-ui/tradingview-test-page.html`
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

## עמודים משניים

### external-data-dashboard
**קובץ HTML:** `trading-ui/external-data-dashboard.html`
**קובץ JS:** `trading-ui/scripts/external-data-dashboard.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### chart-management
**קובץ HTML:** `trading-ui/chart-management.html`
**קובץ JS:** `trading-ui/scripts/chart-management.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

## עמודי מוקאפ

### portfolio-state-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/portfolio-state-page.html`
**קובץ JS:** `trading-ui/scripts/portfolio-state-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### trade-history-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/trade-history-page.html`
**קובץ JS:** `trading-ui/scripts/trade-history-page.js`

#### שימושים ב-bootstrap.Modal (2):
- שורה 313: `const modal = new bootstrap.Modal(modalElement);...`
- שורה 494: `const modal = bootstrap.Modal.getInstance(modalElement);...`

#### פונקציות מקומיות (2):
- שורה 311: `async function openTradeSelectorModal() {...`
- שורה 311: `async function openTradeSelectorModal() {...`

❌ צריך תיקון

### price-history-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/price-history-page.html`
**קובץ JS:** `trading-ui/scripts/price-history-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### comparative-analysis-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/comparative-analysis-page.html`
**קובץ JS:** `trading-ui/scripts/comparative-analysis-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### trading-journal-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/trading-journal-page.html`
**קובץ JS:** `trading-ui/scripts/trading-journal-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### strategy-analysis-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/strategy-analysis-page.html`
**קובץ JS:** `trading-ui/scripts/strategy-analysis-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### economic-calendar-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/economic-calendar-page.html`
**קובץ JS:** `trading-ui/scripts/economic-calendar-page.js`

#### פונקציות מקומיות (1):
- שורה 538: `function showSaveEventModal() {...`

❌ צריך תיקון

### history-widget
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/history-widget.html`
**קובץ JS:** `trading-ui/scripts/history-widget.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### emotional-tracking-widget
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/emotional-tracking-widget.html`
**קובץ JS:** `trading-ui/scripts/emotional-tracking-widget.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### date-comparison-modal
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/date-comparison-modal.html`
**קובץ JS:** `trading-ui/scripts/date-comparison-modal.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

### tradingview-test-page
**קובץ HTML:** `trading-ui/mockups/daily-snapshots/tradingview-test-page.html`
**קובץ JS:** `trading-ui/scripts/tradingview-test-page.js`

✅ אין סטיות - משתמש ב-ModalManagerV2

