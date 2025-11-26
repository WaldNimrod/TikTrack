# דוח סטיות - Modal Navigation System

**תאריך:** 26.11.2025
**בודק:** Auto Scanner
**סטטוס:** 🔄 בתהליך

---

## סיכום כללי

**עמודים נבדקים:** 40
**קבצי JavaScript נבדקים:** 16
**מודלים מקוננים ללא רישום:** 89
**מודלים ללא עדכון UI:** 5
**מודלים ללא רישום סגירה:** 9
**שימושים לא עקביים ב-API:** 12
**עמודים ללא modal-navigation-manager.js:** 7

---

## 1. מודלים מקוננים ללא רישום

**סה"כ:** 89 מופעים

### trading-ui/scripts/modal-manager-v2.js

- **שורה 7498:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal(modalId, mode);`

### trading-ui/scripts/entity-details-modal.js

- **שורה 1777:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `function showEntityDetails(entityType, entityId, options = {}) {`
- **שורה 1777:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `function showEntityDetails(entityType, entityId, options = {}) {`
- **שורה 1442:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `window.showLinkedItemsModal(data, entityType, entityId, 'view');`
- **שורה 1442:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `window.showLinkedItemsModal(data, entityType, entityId, 'view');`

### trading-ui/scripts/modules/core-systems.js

- **שורה 2422:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal(modalId, 'view');`
- **שורה 2772:** `createAndShowModal(` (createAndShowModal)
  - הקשר: `const modal = window.createAndShowModal(modalHtml, 'clearCacheConfirmationModal');`
- **שורה 2772:** `createAndShowModal(` (createAndShowModal)
  - הקשר: `const modal = window.createAndShowModal(modalHtml, 'clearCacheConfirmationModal');`
- **שורה 2772:** `createAndShowModal(` (createAndShowModal)
  - הקשר: `const modal = window.createAndShowModal(modalHtml, 'clearCacheConfirmationModal');`
- **שורה 2772:** `createAndShowModal(` (createAndShowModal)
  - הקשר: `const modal = window.createAndShowModal(modalHtml, 'clearCacheConfirmationModal');`

### trading-ui/scripts/linked-items.js

- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`
- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`
- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`
- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`
- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`
- **שורה 79:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `*    - showLinkedItemsModal() - Display linked items modal`

### trading-ui/scripts/trade-selector-modal.js

- **שורה 544:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `window.showEntityDetails('trade', tradeId, { mode: 'view' });`
- **שורה 196:** `createAndShowModal(` (createAndShowModal)
  - הקשר: `this.modal = await window.createAndShowModal(modalHTML, this.modalId, {`

### trading-ui/scripts/trade_plans.js

- **שורה 2067:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `{ type: 'VIEW', onclick: `window.showEntityDetails('trade_plan', ${design.id}, { mode: 'view' })`, title: 'צפה בפרטי תכנון' },`
- **שורה 1127:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('cancelTradePlanModal', 'view');`
- **שורה 1127:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('cancelTradePlanModal', 'view');`
- **שורה 895:** `ConditionsModalController.open(` (ConditionsModalController.open)
  - הקשר: `* @deprecated Use ConditionsModalController.open() instead`
- **שורה 895:** `ConditionsModalController.open(` (ConditionsModalController.open)
  - הקשר: `* @deprecated Use ConditionsModalController.open() instead`

### trading-ui/scripts/executions.js

- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 1259:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `<button data-button-type="LINK" data-variant="small" data-icon="🔗" data-classes="btn-outline-primary table-btn-small" data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${execution.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${execution.trade_id}, 'view'); }" title="פתח פרטי טרייד"></button>`
- **שורה 122:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('executionsModal', 'add');`
- **שורה 122:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('executionsModal', 'add');`
- **שורה 122:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('executionsModal', 'add');`
- **שורה 122:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `await window.ModalManagerV2.showModal('executionsModal', 'add');`

### trading-ui/scripts/trades.js

- **שורה 1149:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `{ type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },`
- **שורה 1149:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `{ type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },`
- **שורה 1149:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `{ type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },`
- **שורה 1149:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `{ type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },`
- **שורה 1324:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);`
- **שורה 1324:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);`
- **שורה 1324:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);`
- **שורה 1324:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);`
- **שורה 1324:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('tradesModal', 'edit', entityData);`
- **שורה 4589:** `ConditionsModalController.open(` (ConditionsModalController.open)
  - הקשר: `window.ConditionsModalController.open(context);`

### trading-ui/scripts/alerts.js

- **שורה 841:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="showEntityDetails('alert', ${alert.id}); return false;"`
- **שורה 841:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="showEntityDetails('alert', ${alert.id}); return false;"`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`
- **שורה 3099:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly`

### trading-ui/scripts/tickers.js

- **שורה 122:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `window.showEntityDetails('ticker', tickerId, { mode: 'view' });`
- **שורה 122:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `window.showEntityDetails('ticker', tickerId, { mode: 'view' });`
- **שורה 122:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `window.showEntityDetails('ticker', tickerId, { mode: 'view' });`
- **שורה 1161:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `window.showLinkedItemsModal(data, 'ticker', parseInt(id));`
- **שורה 1161:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `window.showLinkedItemsModal(data, 'ticker', parseInt(id));`
- **שורה 1161:** `showLinkedItemsModal(` (showLinkedItemsModal)
  - הקשר: `window.showLinkedItemsModal(data, 'ticker', parseInt(id));`
- **שורה 2380:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly`
- **שורה 2380:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly`
- **שורה 2380:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly`
- **שורה 2380:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly`

### trading-ui/scripts/trading_accounts.js

- **שורה 744:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })"`
- **שורה 744:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })"`
- **שורה 744:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })"`
- **שורה 744:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="window.showEntityDetails('trading_account', ${tradingAccount.id}, { mode: 'view' })"`
- **שורה 2301:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddTradingAccountModal - use window.ModalManagerV2.showModal('tradingAccountsModal', 'add') directly`

### trading-ui/scripts/cash_flows.js

- **שורה 1443:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${cashFlow.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${cashFlow.trade_id}, 'view'); }"`
- **שורה 1443:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${cashFlow.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${cashFlow.trade_id}, 'view'); }"`
- **שורה 1443:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `data-onclick="if(window.showEntityDetails) { window.showEntityDetails('trade', ${cashFlow.trade_id}, { mode: 'view' }); } else if(window.showEntityDetailsModal) { window.showEntityDetailsModal('trade', ${cashFlow.trade_id}, 'view'); }"`
- **שורה 3695:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly`
- **שורה 3695:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly`
- **שורה 3695:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly`
- **שורה 3695:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly`
- **שורה 3695:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `// REMOVED: showAddCashFlowModal - use window.ModalManagerV2.showModal('cashFlowModal', 'add') directly`

### trading-ui/scripts/notes.js

- **שורה 383:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `* For viewing note details, use viewNote(noteId) which uses showEntityDetails().`
- **שורה 383:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `* For viewing note details, use viewNote(noteId) which uses showEntityDetails().`
- **שורה 383:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `* For viewing note details, use viewNote(noteId) which uses showEntityDetails().`
- **שורה 391:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('notesModal', 'add');`
- **שורה 391:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('notesModal', 'add');`
- **שורה 391:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('notesModal', 'add');`
- **שורה 391:** `ModalManagerV2.showModal(` (ModalManagerV2.showModal)
  - הקשר: `window.ModalManagerV2.showModal('notesModal', 'add');`

### trading-ui/scripts/entity-details-renderer.js

- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`
- **שורה 2686:** `showEntityDetails(` (showEntityDetails)
  - הקשר: `onclick="if (window.showEntityDetails) { window.showEntityDetails('${entityType}', ${entityId}); } return false;">`

## 2. מודלים ללא עדכון UI

**סה"כ:** 5 מופעים

### trading-ui/scripts/entity-details-modal.js

- **שורה 323:** `registerModalOpen(` (missing-ui-update)
- **שורה 326:** `pushModalToNavigation(` (missing-ui-update)

### trading-ui/scripts/conditions/conditions-modal-controller.js

- **שורה 235:** `registerModalOpen(` (missing-ui-update)

### trading-ui/scripts/import-user-data.js

- **שורה 388:** `registerModalOpen(` (missing-ui-update)
- **שורה 789:** `registerModalOpen(` (missing-ui-update)

## 3. מודלים ללא רישום סגירה

**סה"כ:** 9 מופעים

### trading-ui/scripts/modal-manager-v2.js

- **שורה 2121:** `registerModalOpen(` (missing-close-registration)
- **שורה 2123:** `pushModalToNavigation(` (missing-close-registration)

### trading-ui/scripts/entity-details-modal.js

- **שורה 323:** `registerModalOpen(` (missing-close-registration)
- **שורה 326:** `pushModalToNavigation(` (missing-close-registration)

### trading-ui/scripts/conditions/conditions-modal-controller.js

- **שורה 235:** `registerModalOpen(` (missing-close-registration)

### trading-ui/scripts/linked-items.js

- **שורה 293:** `registerModalOpen(` (missing-close-registration)
- **שורה 302:** `pushModalToNavigation(` (missing-close-registration)

### trading-ui/scripts/trade_plans.js

- **שורה 2840:** `registerModalOpen(` (missing-close-registration)

### trading-ui/scripts/import-user-data.js

- **שורה 388:** `registerModalOpen(` (missing-close-registration)

## 4. שימושים לא עקביים ב-API

**סה"כ:** 12 מופעים

### trading-ui/scripts/modal-manager-v2.js

- **שורה 2121:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)
- **שורה 2123:** `window.pushModalToNavigation(` (window-dot-notation)

### trading-ui/scripts/entity-details-modal.js

- **שורה 323:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)
- **שורה 326:** `window.pushModalToNavigation(` (window-dot-notation)

### trading-ui/scripts/conditions/conditions-modal-controller.js

- **שורה 235:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)

### trading-ui/scripts/linked-items.js

- **שורה 293:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)
- **שורה 302:** `window.pushModalToNavigation(` (window-dot-notation)

### trading-ui/scripts/trade-selector-modal.js

- **שורה 216:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)
- **שורה 218:** `window.pushModalToNavigation(` (window-dot-notation)

### trading-ui/scripts/trade_plans.js

- **שורה 2840:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)

### trading-ui/scripts/import-user-data.js

- **שורה 388:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)
- **שורה 388:** `window.ModalNavigationService.registerModalOpen(` (window-dot-notation)

## 5. עמודים ללא modal-navigation-manager.js

**סה"כ:** 7 עמודים

- **mockups/daily-snapshots/portfolio-state-page.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/emotional-tracking-widget.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/history-widget.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/economic-calendar-page.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/tradingview-test-page.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/heatmap-visual-example.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)
- **mockups/daily-snapshots/comparative-analysis-page.html:** modal-navigation-manager.js לא נמצא בקובץ (ייתכן שנטען דרך package-manifest)

---

**עדכון אחרון:** 26.11.2025
**סטטוס:** 🔄 סריקה הושלמה
