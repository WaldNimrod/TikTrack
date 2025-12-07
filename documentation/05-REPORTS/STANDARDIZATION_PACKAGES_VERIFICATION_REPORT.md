# דוח בדיקת Packages - סטנדרטיזציה

**תאריך יצירה:** 1764531637.593773
**סה"כ עמודים נבדקו:** 31

---

## סיכום כללי

- **עמודים עם בעיות:** 30
- **חבילות חסרות:** 165
- **Globals חסרים:** 344
- **בעיות תלויות:** 0
- **בעיות סדר טעינה:** 0

---

## מפת Packages למערכות

### מיפוי מערכות ל-Packages

| מערכת | Package | Required Globals |
|--------|---------|------------------|
| Conditions System | `conditions` | window.conditionsInitializer, window.ConditionsUIManager |
| Pending Trade Plan Widget | `dashboard-widgets` | window.PendingTradePlanWidget |
| Linked Items Service | `crud` | window.LinkedItemsService, window.CRUDResponseHandler, window.createActionsMenu |
| Modal Navigation Manager | `modules` | window.ModalNavigationManager, window.ModalManagerV2 |
| CRUD Response Handler | `crud` | window.LinkedItemsService, window.CRUDResponseHandler, window.createActionsMenu |
| Select Populator Service | `services` | window.SelectPopulatorService, window.DataCollectionService, window.DefaultValueSetter, window.TableSortValueAdapter |
| Data Collection Service | `services` | window.SelectPopulatorService, window.DataCollectionService, window.DefaultValueSetter, window.TableSortValueAdapter |
| Pagination System | `ui-advanced` | window.PaginationSystem |
| Actions Menu Toolkit | `crud` | window.LinkedItemsService, window.CRUDResponseHandler, window.createActionsMenu |
| Info Summary System | `info-summary` | window.InfoSummarySystem |
| Entity Details Modal | `entity-details` | window.showEntityDetails |
| Unified Table System | `crud` | window.LinkedItemsService, window.CRUDResponseHandler, window.createActionsMenu |
| Modal Manager V2 | `modules` | window.ModalNavigationManager, window.ModalManagerV2 |
| Default Value Setter | `services` | window.SelectPopulatorService, window.DataCollectionService, window.DefaultValueSetter, window.TableSortValueAdapter |
| Table Sort Value Adapter | `services` | window.SelectPopulatorService, window.DataCollectionService, window.DefaultValueSetter, window.TableSortValueAdapter |

---

## תוצאות מפורטות לכל עמוד

### index

**Packages נוכחיים:** base, services, ui-advanced, modules, preferences, entity-services, entity-details, info-summary, dashboard-widgets, init-system

**📦 Packages חסרים:**
- `conditions`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.conditionsInitializer`

**💡 המלצות:**
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array

---

### tickers

**Packages נוכחיים:** base, services, ui-advanced, modules, crud, preferences, validation, external-data, entity-services, entity-details, info-summary, init-system

**📦 Packages חסרים:**
- `conditions`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.conditionsInitializer`

**💡 המלצות:**
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array

---

### trading_accounts

**Packages נוכחיים:** base, services, ui-advanced, modules, crud, preferences, validation, entity-details, entity-services, info-summary, init-system

**📦 Packages חסרים:**
- `conditions`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.conditionsInitializer`

**💡 המלצות:**
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array

---

### cash_flows

**Packages נוכחיים:** base, services, ui-advanced, modules, crud, preferences, validation, entity-services, entity-details, info-summary, init-system

**📦 Packages חסרים:**
- `conditions`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.SelectPopulatorService`
- `window.TableSortValueAdapter`
- `window.conditionsInitializer`

**💡 המלצות:**
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array

---

### research

**Packages נוכחיים:** base, services, ui-advanced, crud, preferences, init-system

**📦 Packages חסרים:**
- `conditions`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.conditionsInitializer`

**💡 המלצות:**
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array

---

### preferences

**Packages נוכחיים:** base, services, ui-advanced, crud, preferences, validation, entity-details, info-summary, init-system

**📦 Packages חסרים:**
- `conditions`
- `dashboard-widgets`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.showEntityDetails`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'window.showEntityDetails' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### user-profile

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `entity-details`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.showEntityDetails`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'entity-details' ל-packages array
- הוסף 'window.showEntityDetails' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### db_extradata

**Packages נוכחיים:** base, services, ui-advanced, crud, preferences, init-system

**📦 Packages חסרים:**
- `dashboard-widgets`

**🔧 Globals חסרים:**
- `window.PendingTradePlanWidget`

**💡 המלצות:**
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### constraints

**Packages נוכחיים:** base, services, ui-advanced, crud, init-system

**📦 Packages חסרים:**
- `conditions`
- `dashboard-widgets`
- `modules`
- `info-summary`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### background-tasks

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.PendingTradePlanWidget`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### server-monitor

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### system-management

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### cache-test

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `entity-details`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.showEntityDetails`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'entity-details' ל-packages array
- הוסף 'window.showEntityDetails' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### notifications-center

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.PendingTradePlanWidget`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### css-management

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### dynamic-colors-display

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### designs

**Packages נוכחיים:** base, init-system

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### tradingview-test-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `entity-details`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.showEntityDetails`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'entity-details' ל-packages array
- הוסף 'window.showEntityDetails' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'entity-details' ל-packages array
- הוסף 'window.showEntityDetails' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### external-data-dashboard

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.PendingTradePlanWidget`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### chart-management

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### portfolio-state-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.PendingTradePlanWidget`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### trade-history-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### price-history-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### comparative-analysis-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### trading-journal-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### strategy-analysis-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### economic-calendar-page

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.ModalNavigationManager`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`

**💡 המלצות:**
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### history-widget

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### emotional-tracking-widget

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

### date-comparison-modal

**Packages נוכחיים:** אין

**📦 Packages חסרים:**
- `conditions`
- `services`
- `info-summary`
- `dashboard-widgets`
- `modules`
- `ui-advanced`
- `crud`

**🔧 Globals חסרים:**
- `window.ConditionsUIManager`
- `window.InfoSummarySystem`
- `window.DefaultValueSetter`
- `window.DataCollectionService`
- `window.PendingTradePlanWidget`
- `window.LinkedItemsService`
- `window.CRUDResponseHandler`
- `window.SelectPopulatorService`
- `window.ModalManagerV2`
- `window.conditionsInitializer`
- `window.createActionsMenu`
- `window.TableSortValueAdapter`
- `window.PaginationSystem`
- `window.ModalNavigationManager`

**💡 המלצות:**
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'services' ל-packages array
- הוסף 'window.SelectPopulatorService' ל-requiredGlobals array
- הוסף 'window.DataCollectionService' ל-requiredGlobals array
- הוסף 'window.DefaultValueSetter' ל-requiredGlobals array
- הוסף 'window.TableSortValueAdapter' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'info-summary' ל-packages array
- הוסף 'window.InfoSummarySystem' ל-requiredGlobals array
- הוסף 'ui-advanced' ל-packages array
- הוסף 'window.PaginationSystem' ל-requiredGlobals array
- הוסף 'conditions' ל-packages array
- הוסף 'window.conditionsInitializer' ל-requiredGlobals array
- הוסף 'window.ConditionsUIManager' ל-requiredGlobals array
- הוסף 'modules' ל-packages array
- הוסף 'window.ModalNavigationManager' ל-requiredGlobals array
- הוסף 'window.ModalManagerV2' ל-requiredGlobals array
- הוסף 'crud' ל-packages array
- הוסף 'window.LinkedItemsService' ל-requiredGlobals array
- הוסף 'window.CRUDResponseHandler' ל-requiredGlobals array
- הוסף 'window.createActionsMenu' ל-requiredGlobals array
- הוסף 'dashboard-widgets' ל-packages array
- הוסף 'window.PendingTradePlanWidget' ל-requiredGlobals array

---

## סטטיסטיקות

### Packages חסרים (לפי תדירות)

| Package | מספר עמודים |
|---------|---------------|
| `conditions` | 29 |
| `dashboard-widgets` | 25 |
| `modules` | 23 |
| `services` | 22 |
| `ui-advanced` | 22 |
| `crud` | 22 |
| `info-summary` | 19 |
| `entity-details` | 3 |

