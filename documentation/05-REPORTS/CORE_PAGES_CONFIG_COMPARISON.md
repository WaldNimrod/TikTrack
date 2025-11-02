# השוואת הגדרות - 8 העמודים המרכזיים

**תאריך:** 2025-11-01

✅ **כל ההגדרות אחידות ומדויקות!**


## פירוט לפי עמוד:

### ✅ trades

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (6):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadTradesData, window.checkLinkedItemsBeforeAction

**Metadata:**
- description: עמוד מעקב טריידים - כולל טבלאות, פילטרים, התראות ותנאים
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: trades-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ executions

**חבילות (12):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, import, init-system

**Required Globals (8):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadExecutionsData, window.SelectPopulatorService, window.tickerService, window.openImportUserDataModal

**Metadata:**
- description: מעקב ביצועי עסקאות - היסטוריית עסקאות שבוצעו
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: executions-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ trade_plans

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadTradePlansData

**Metadata:**
- description: ניהול תכניות מסחר - תכנון וביצוע אסטרטגיות מסחר
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: trade-plans-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ alerts

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadAlertsData

**Metadata:**
- description: מערכת התראות עסקיות - ניהול תנאי שוק והתראות
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: alerts-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ trading_accounts

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadTradingAccountsDataForTradingAccountsPage

**Metadata:**
- description: ניהול חשבונות מסחר - הוספה, עריכה ומעקב חשבונות
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: accounts-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ cash_flows

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadCashFlowsData

**Metadata:**
- description: ניהול תזרימי מזומנים - הכנסות והוצאות
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: cash-flows-data
- cacheStrategy: standard

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ tickers

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadTickersData

**Metadata:**
- description: ניהול טיקרים - מעקב מחירים ונתונים פיננסיים
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: tickers-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

### ✅ notes

**חבילות (11):** base, services, ui-advanced, crud, preferences, validation, entity-details, entity-services, info-summary, modules, init-system

**Required Globals (5):** NotificationSystem, DataUtils, window.Logger, window.CacheSyncManager, window.loadNotesData

**Metadata:**
- description: ניהול הערות - מעקב אחר הערות ומידע נוסף
- lastModified: 2025-10-19
- pageType: crud
- preloadAssets: notes-data
- cacheStrategy: aggressive

**Flags:**
- requiresFilters: true
- requiresValidation: true
- requiresTables: true

