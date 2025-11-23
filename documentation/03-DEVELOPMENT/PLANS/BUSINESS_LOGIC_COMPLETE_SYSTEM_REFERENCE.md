# Business Logic Layer - Complete System Reference
# Business Logic Layer - הפניה מלאה למערכת

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** 📋 הפניה מלאה ומעודכנת  
**מטרה:** מסמך מרכזי המכיל את כל המידע על הישויות, המערכות, העמודים והאינטגרציות

---

## 📋 תוכן עניינים

1. [ישויות במערכת (24 ישויות)](#ישויות-במערכת)
2. [Data Services (12 services)](#data-services)
3. [עמודים במערכת (28 עמודים)](#עמודים-במערכת)
4. [מערכות כלליות (~40 מערכות)](#מערכות-כלליות)
5. [מערכות מטמון (4 שכבות)](#מערכות-מטמון)
6. [מערכות איתחול (5 שלבים)](#מערכות-איתחול)
7. [Business Logic Services (12 services)](#business-logic-services)
8. [אינטגרציות](#אינטגרציות)

---

## 🗄️ ישויות במערכת

### ישויות ראשיות (12 ישויות)

| ישות | Model | Business Service | Data Service | API Endpoint | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **Trade** | ✅ `Backend/models/trade.py` | ✅ `TradeBusinessService` | ✅ `trades-data.js` | `/api/trades/` | ✅ מוכן |
| **Execution** | ✅ `Backend/models/execution.py` | ✅ `ExecutionBusinessService` | ✅ `executions-data.js` | `/api/executions/` | ✅ מוכן |
| **Alert** | ✅ `Backend/models/alert.py` | ✅ `AlertBusinessService` | ✅ `alerts-data.js` | `/api/alerts/` | ✅ מוכן |
| **CashFlow** | ✅ `Backend/models/cash_flow.py` | ✅ `CashFlowBusinessService` | ✅ `cash-flows-data.js` | `/api/cash-flows/` | ✅ מוכן |
| **Note** | ✅ `Backend/models/note.py` | ✅ `NoteBusinessService` | ✅ `notes-data.js` | `/api/notes/` | ✅ מוכן |
| **TradingAccount** | ✅ `Backend/models/trading_account.py` | ✅ `TradingAccountBusinessService` | ✅ `trading-accounts-data.js` | `/api/trading-accounts/` | ✅ מוכן |
| **TradePlan** | ✅ `Backend/models/trade_plan.py` | ✅ `TradePlanBusinessService` | ✅ `trade-plans-data.js` | `/api/trade-plans/` | ✅ מוכן |
| **Ticker** | ✅ `Backend/models/ticker.py` | ✅ `TickerBusinessService` | ✅ `tickers-data.js` | `/api/tickers/` | ✅ מוכן |
| **Currency** | ✅ `Backend/models/currency.py` | ✅ `CurrencyBusinessService` | ❌ חסר | `/api/currencies/` | ⏳ צריך Frontend wrappers |
| **Tag** | ✅ `Backend/models/tag.py` | ✅ `TagBusinessService` | ❌ חסר | `/api/tags/` | ⏳ צריך Frontend wrappers |
| **User** | ✅ `Backend/models/user.py` | ❌ חסר | ❌ חסר | `/api/users/` | ⏳ אופציונלי |
| **Preferences** | ✅ `Backend/models/preferences.py` | ❌ חסר | ✅ `preferences-data.js` | `/api/preferences/` | ⏳ מורכב |

### ישויות משניות (12 ישויות)

| ישות | Model | Business Service | Data Service | API Endpoint | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **NoteRelationType** | ✅ `Backend/models/note_relation_type.py` | ❌ חסר | ❌ חסר | - | ⏳ אופציונלי |
| **ExternalDataProvider** | ✅ `Backend/models/external_data.py` | ❌ חסר | ❌ חסר | `/api/external-data/` | ⏳ אופציונלי |
| **MarketDataQuote** | ✅ `Backend/models/external_data.py` | ❌ חסר | ❌ חסר | `/api/market-data/` | ⏳ אופציונלי |
| **DataRefreshLog** | ✅ `Backend/models/external_data.py` | ❌ חסר | ❌ חסר | `/api/data-refresh/` | ⏳ אופציונלי |
| **IntradayDataSlot** | ✅ `Backend/models/external_data.py` | ❌ חסר | ❌ חסר | `/api/intraday-data/` | ⏳ אופציונלי |
| **TradingMethod** | ✅ `Backend/models/trading_method.py` | ❌ חסר | ❌ חסר | `/api/trading-methods/` | ⏳ אופציונלי |
| **MethodParameter** | ✅ `Backend/models/trading_method.py` | ❌ חסר | ❌ חסר | `/api/method-parameters/` | ⏳ אופציונלי |
| **PlanCondition** | ✅ `Backend/models/plan_condition.py` | ❌ חסר | ❌ חסר | `/api/plan-conditions/` | ⏳ אופציונלי |
| **TradeCondition** | ✅ `Backend/models/trade_condition.py` | ❌ חסר | ❌ חסר | `/api/trade-conditions/` | ⏳ אופציונלי |
| **ConditionAlertMapping** | ✅ `Backend/models/plan_condition.py` | ❌ חסר | ❌ חסר | `/api/condition-alert-mappings/` | ⏳ אופציונלי |
| **ImportSession** | ✅ `Backend/models/import_session.py` | ❌ חסר | ❌ חסר | `/api/import-sessions/` | ⏳ אופציונלי |
| **Constraint** | ✅ `Backend/models/constraint.py` | ❌ חסר | ❌ חסר | `/api/constraints/` | ⏳ אופציונלי |
| **TagCategory** | ✅ `Backend/models/tag_category.py` | ❌ חסר | ❌ חסר | `/api/tag-categories/` | ⏳ אופציונלי |
| **TagLink** | ✅ `Backend/models/tag_link.py` | ❌ חסר | ❌ חסר | `/api/tag-links/` | ⏳ אופציונלי |
| **QuotesLast** | ✅ `Backend/models/quotes_last.py` | ❌ חסר | ❌ חסר | `/api/quotes-last/` | ⏳ אופציונלי |

**סה"כ ישויות:** 24 ישויות (12 ראשיות + 12 משניות)

---

## 📦 Data Services

### Data Services קיימים (12 services)

| Service | קובץ | Business Logic API | סטטוס |
| --- | --- | --- | --- |
| **TradesData** | ✅ `trades-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **ExecutionsData** | ✅ `executions-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **AlertsData** | ✅ `alerts-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **CashFlowsData** | ✅ `cash-flows-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **NotesData** | ✅ `notes-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **TradingAccountsData** | ✅ `trading-accounts-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **TradePlansData** | ✅ `trade-plans-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **TickersData** | ✅ `tickers-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **PreferencesData** | ✅ `preferences-data.js` | ❌ חסר | ⏳ מורכב |
| **ResearchData** | ✅ `research-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **DataImportData** | ✅ `data-import-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **DashboardData** | ✅ `dashboard-data.js` | ❌ חסר | ⏳ צריך Wrappers |

**סה"כ Data Services:** 12 services (3 מוכנים, 9 צריכים עדכון)

---

## 📄 עמודים במערכת

### עמודים מרכזיים (11 עמודים)

| עמוד | HTML | JS | Data Service | Business Service | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **Dashboard** | ✅ `index.html` | ✅ `index.js` | ✅ `dashboard-data.js` | ❌ חסר | ⏳ צריך Business Service |
| **Trades** | ✅ `trades.html` | ✅ `trades.js` | ✅ `trades-data.js` | ✅ `TradeBusinessService` | ✅ מוכן |
| **Executions** | ✅ `executions.html` | ✅ `executions.js` | ✅ `executions-data.js` | ✅ `ExecutionBusinessService` | ✅ מוכן |
| **Alerts** | ✅ `alerts.html` | ✅ `alerts.js` | ✅ `alerts-data.js` | ✅ `AlertBusinessService` | ✅ מוכן |
| **Trade Plans** | ✅ `trade_plans.html` | ✅ `trade_plans.js` | ✅ `trade-plans-data.js` | ✅ `TradePlanBusinessService` | ✅ מוכן |
| **Cash Flows** | ✅ `cash_flows.html` | ✅ `cash_flows.js` | ✅ `cash-flows-data.js` | ✅ `CashFlowBusinessService` | ✅ מוכן |
| **Trading Accounts** | ✅ `trading_accounts.html` | ✅ `trading_accounts.js` | ✅ `trading-accounts-data.js` | ✅ `TradingAccountBusinessService` | ✅ מוכן |
| **Tickers** | ✅ `tickers.html` | ✅ `tickers.js` | ✅ `tickers-data.js` | ✅ `TickerBusinessService` | ✅ מוכן |
| **Notes** | ✅ `notes.html` | ✅ `notes.js` | ✅ `notes-data.js` | ✅ `NoteBusinessService` | ✅ מוכן |
| **Data Import** | ✅ `data_import.html` | ✅ `data_import.js` | ✅ `data-import-data.js` | ❌ חסר | ⏳ צריך Business Service |
| **Research** | ✅ `research.html` | ✅ `research.js` | ✅ `research-data.js` | ❌ חסר | ⏳ צריך Business Service |

### עמודים טכניים (17 עמודים)

| עמוד | HTML | JS | סטטוס |
| --- | --- | --- | --- |
| **Preferences** | ✅ `preferences.html` | ✅ `preferences-core-new.js` | ⏳ מורכב |
| **DB Display** | ✅ `db_display.html` | ✅ `db_display.js` | ✅ מוכן |
| **Constraints** | ✅ `constraints.html` | ✅ `constraints.js` | ✅ מוכן |
| **System Management** | ✅ `system-management.html` | ✅ `system-management.js` | ✅ מוכן |
| **Server Monitor** | ✅ `server-monitor.html` | ✅ `server-monitor.js` | ✅ מוכן |
| **Code Quality Dashboard** | ✅ `code-quality-dashboard.html` | ✅ `code-quality-dashboard.js` | ✅ מוכן |
| **Notifications Center** | ✅ `notifications-center.html` | ✅ `notifications-center.js` | ✅ מוכן |
| **CSS Management** | ✅ `css-management.html` | ✅ `css-management.js` | ✅ מוכן |
| **Chart Management** | ✅ `chart-management.html` | ✅ `chart-management.js` | ✅ מוכן |
| **Dynamic Colors Display** | ✅ `dynamic-colors-display.html` | ✅ `dynamic-colors-display.js` | ✅ מוכן |
| **Designs** | ✅ `designs.html` | ✅ `designs.js` | ✅ מוכן |
| **TradingView Test Page** | ✅ `tradingview-test-page.html` | ✅ `tradingview-test-page.js` | ✅ מוכן |
| **Init System Management** | ✅ `init-system-management.html` | ✅ `init-system-management.js` | ✅ מוכן |
| **Entity Details Test** | ✅ `entity-details-test.html` | ✅ `entity-details-test.js` | ✅ מוכן |
| **Tag Management** | ✅ `tag-management.html` | ✅ `tag-management.js` | ✅ מוכן |
| **Import User Data** | ✅ `import-user-data.html` | ✅ `import-user-data.js` | ✅ מוכן |
| **Portfolio State** | ✅ `portfolio-state-page.html` | ✅ `portfolio-state-page.js` | ✅ מוכן |

**סה"כ עמודים:** 28 עמודים (11 מרכזיים + 17 טכניים)

---

## 🔧 מערכות כלליות

### מערכות Core (8 מערכות)

| מערכת | קובץ | Business Logic Integration | סטטוס |
| --- | --- | --- | --- |
| **UnifiedAppInitializer** | ✅ `modules/core-systems.js` | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **NotificationSystem** | ✅ `notification-system.js` | ✅ לא נדרש | ✅ מוכן |
| **ModalManagerV2** | ✅ `modal-manager-v2.js` | ✅ לא נדרש | ✅ מוכן |
| **UI Utils** | ✅ `ui-utils.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **Page Utils** | ✅ `page-utils.js` | ✅ לא נדרש | ✅ מוכן |
| **Translation Utils** | ✅ `translation-utils.js` | ✅ לא נדרש | ✅ מוכן |
| **EventHandlerManager** | ✅ `event-handler-manager.js` | ✅ לא נדרש | ✅ מוכן |
| **LoggerService** | ✅ `logger-service.js` | ✅ לא נדרש | ✅ מוכן |

### מערכות CRUD (12 מערכות)

| מערכת | קובץ | Business Logic Integration | סטטוס |
| --- | --- | --- | --- |
| **TradesData** | ✅ `services/trades-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **ExecutionsData** | ✅ `services/executions-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **AlertsData** | ✅ `services/alerts-data.js` | ✅ Wrappers קיימים | ✅ מוכן |
| **CashFlowsData** | ✅ `services/cash-flows-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **NotesData** | ✅ `services/notes-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **TradingAccountsData** | ✅ `services/trading-accounts-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **TradePlansData** | ✅ `services/trade-plans-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **TickersData** | ✅ `services/tickers-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **PreferencesData** | ✅ `services/preferences-data.js` | ❌ חסר | ⏳ מורכב |
| **ResearchData** | ✅ `services/research-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **DataImportData** | ✅ `services/data-import-data.js` | ❌ חסר | ⏳ צריך Wrappers |
| **DashboardData** | ✅ `services/dashboard-data.js` | ❌ חסר | ⏳ צריך Wrappers |

### מערכות UI (8 מערכות)

| מערכת | קובץ | Business Logic Integration | סטטוס |
| --- | --- | --- | --- |
| **HeaderSystem** | ✅ `header-system.js` | ✅ לא נדרש | ✅ מוכן |
| **ColorSchemeSystem** | ✅ `color-scheme-system.js` | ✅ לא נדרש | ✅ מוכן |
| **ButtonSystem** | ✅ `button-system-init.js` | ✅ לא נדרש | ✅ מוכן |
| **InfoSummarySystem** | ✅ `info-summary-system.js` | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |
| **PaginationSystem** | ✅ `pagination-system.js` | ✅ לא נדרש | ✅ מוכן |
| **EntityDetailsModal** | ✅ `entity-details-modal.js` | ✅ לא נדרש | ✅ מוכן |
| **PendingTradePlanWidget** | ✅ `pending-trade-plan-widget.js` | ✅ לא נדרש | ✅ מוכן |
| **FieldRendererService** | ✅ `services/field-renderer-service.js` | ✅ לא נדרש | ✅ מוכן |

### מערכות מטמון (4 מערכות)

| מערכת | קובץ | Business Logic Integration | סטטוס |
| --- | --- | --- | --- |
| **UnifiedCacheManager** | ✅ `unified-cache-manager.js` | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |
| **CacheTTLGuard** | ✅ `cache-ttl-guard.js` | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |
| **CacheSyncManager** | ✅ `cache-sync-manager.js` | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |
| **CachePolicyManager** | ✅ `cache-policy-manager.js` | ✅ לא נדרש | ✅ מוכן |

### מערכות נוספות (8 מערכות)

| מערכת | קובץ | Business Logic Integration | סטטוס |
| --- | --- | --- | --- |
| **InvestmentCalculationService** | ✅ `services/investment-calculation-service.js` | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |
| **StatisticsCalculator** | ✅ `services/statistics-calculator.js` | ✅ `StatisticsBusinessService` | ✅ מוכן |
| **SelectPopulatorService** | ✅ `services/select-populator-service.js` | ✅ לא נדרש | ✅ מוכן |
| **LinkedItemsService** | ✅ `services/linked-items-service.js` | ✅ לא נדרש | ✅ מוכן |
| **TagService** | ✅ `services/tag-service.js` | ❌ חסר | ⏳ צריך Business Service |
| **AlertConditionRenderer** | ✅ `services/alert-condition-renderer.js` | ✅ לא נדרש | ✅ מוכן |
| **DataCollectionService** | ✅ `services/data-collection-service.js` | ✅ לא נדרש | ✅ מוכן |
| **DefaultValueSetter** | ✅ `services/default-value-setter.js` | ✅ לא נדרש | ✅ מוכן |

**סה"כ מערכות כלליות:** ~40 מערכות

---

## 💾 מערכות מטמון

### 4 שכבות מטמון

| שכבה | קובץ | גודל מקסימלי | TTL | סטטוס |
| --- | --- | --- | --- | --- |
| **Memory** | ✅ `unified-cache-manager.js` | <100KB | לפי סוג נתון | ✅ פעיל |
| **LocalStorage** | ✅ `unified-cache-manager.js` | <1MB | לפי סוג נתון | ✅ פעיל |
| **IndexedDB** | ✅ `unified-cache-manager.js` | >1MB | לפי סוג נתון | ✅ פעיל |
| **Backend Cache** | ✅ `Backend/routes/api/cache_sync.py` | TTL-based | לפי סוג נתון | ⏳ כבוי (CACHE_DISABLED=true) |

### מערכות מטמון נוספות

| מערכת | קובץ | תפקיד | סטטוס |
| --- | --- | --- | --- |
| **CacheTTLGuard** | ✅ `cache-ttl-guard.js` | TTL guard ל-entity loaders | ✅ פעיל |
| **CacheSyncManager** | ✅ `cache-sync-manager.js` | סנכרון Frontend ↔ Backend | ✅ פעיל |
| **CachePolicyManager** | ✅ `cache-policy-manager.js` | מדיניות מטמון אחידה | ✅ פעיל |

---

## 🚀 מערכות איתחול

### 5 שלבי איתחול

| שלב | שם | מערכות | Business Logic Integration | סטטוס |
| --- | --- | --- | --- | --- |
| **Stage 1** | Core Systems | UnifiedCacheManager, CacheTTLGuard, CacheSyncManager | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **Stage 2** | UI Systems | HeaderSystem, FilterSystem, UI Utils | ✅ לא נדרש | ✅ מוכן |
| **Stage 3** | Page Systems | Custom Initializers, Data Services | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **Stage 4** | Validation Systems | Form Validation, Data Validation | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |
| **Stage 5** | Finalization | Business Logic, Communication, Cache | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |

### מערכות איתחול נוספות

| מערכת | קובץ | תפקיד | סטטוס |
| --- | --- | --- | --- |
| **UnifiedAppInitializer** | ✅ `modules/core-systems.js` | נקודת כניסה אחת | ✅ פעיל |
| **PageInitializationConfigs** | ✅ `page-initialization-configs.js` | תצורות עמודים | ✅ פעיל |
| **PackageManifest** | ✅ `init-system/package-manifest.js` | מניפסט packages | ✅ פעיל |
| **MonitoringSystem** | ✅ `monitoring-functions.js` | מוניטורינג ותיעוד | ✅ פעיל |

---

## 🏗️ Business Logic Services

### Business Services קיימים (5 services)

| Service | קובץ | API Endpoints | Frontend Wrappers | סטטוס |
| --- | --- | --- | --- | --- |
| **TradeBusinessService** | ✅ `Backend/services/business_logic/trade_business_service.py` | ✅ `/api/business/trade/*` | ✅ `trades-data.js` | ✅ מוכן |
| **ExecutionBusinessService** | ✅ `Backend/services/business_logic/execution_business_service.py` | ✅ `/api/business/execution/*` | ✅ `executions-data.js` | ✅ מוכן |
| **AlertBusinessService** | ✅ `Backend/services/business_logic/alert_business_service.py` | ✅ `/api/business/alert/*` | ✅ `alerts-data.js` | ✅ מוכן |
| **StatisticsBusinessService** | ✅ `Backend/services/business_logic/statistics_business_service.py` | ✅ `/api/business/statistics/*` | ❌ חסר | ⏳ צריך Wrappers<br>📚 [מדריך מפתחים](../GUIDES/STATISTICS_BUSINESS_SERVICE_GUIDE.md) |
| **CashFlowBusinessService** | ✅ `Backend/services/business_logic/cash_flow_business_service.py` | ✅ `/api/business/cash-flow/*` | ❌ חסר | ⏳ צריך Wrappers |

### Business Services חדשים (6 services)

| Service | ישות | קובץ | API Endpoints | Frontend Wrappers | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **NoteBusinessService** | Note | ✅ `note_business_service.py` | ✅ `/api/business/note/*` | ✅ `notes-data.js` | ✅ מוכן |
| **TradingAccountBusinessService** | TradingAccount | ✅ `trading_account_business_service.py` | ✅ `/api/business/trading-account/*` | ✅ `trading-accounts-data.js` | ✅ מוכן |
| **TradePlanBusinessService** | TradePlan | ✅ `trade_plan_business_service.py` | ✅ `/api/business/trade-plan/*` | ✅ `trade-plans-data.js` | ✅ מוכן |
| **TickerBusinessService** | Ticker | ✅ `ticker_business_service.py` | ✅ `/api/business/ticker/*` | ✅ `tickers-data.js` | ✅ מוכן |
| **CurrencyBusinessService** | Currency | ✅ `currency_business_service.py` | ✅ `/api/business/currency/*` | ❌ חסר | ⏳ צריך Frontend wrappers |
| **TagBusinessService** | Tag | ✅ `tag_business_service.py` | ✅ `/api/business/tag/*` | ❌ חסר | ⏳ צריך Frontend wrappers |

### Business Services חסרים (1 service)

| Service | ישות | קובץ | API Endpoints | Frontend Wrappers | סטטוס |
| --- | --- | --- | --- | --- | --- |
| **PreferencesBusinessService** | Preferences | ❌ חסר | ❌ חסר | ❌ חסר | ❌ מורכב |

**סה"כ Business Services:** 12 services (11 קיימים, 1 חסר)

---

## 🔗 אינטגרציות

### אינטגרציה עם מערכות מטמון

| מערכת | Business Logic Integration | סטטוס |
| --- | --- | --- |
| **UnifiedCacheManager** | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |
| **CacheTTLGuard** | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |
| **CacheSyncManager** | ⏳ צריך אינטגרציה | ⏳ צריך אינטגרציה |

### אינטגרציה עם מערכות איתחול

| שלב | Business Logic Integration | סטטוס |
| --- | --- | --- |
| **Stage 1 (Core Systems)** | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **Stage 2 (UI Systems)** | ✅ לא נדרש | ✅ מוכן |
| **Stage 3 (Page Systems)** | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **Stage 4 (Validation Systems)** | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |
| **Stage 5 (Finalization)** | ⏳ צריך Business Service | ⏳ צריך אינטגרציה |

### אינטגרציה עם Preferences Loading Events

| Event | Business Logic Integration | סטטוס |
| --- | --- | --- |
| **preferences:critical-loaded** | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **preferences:all-loaded** | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |
| **window.__preferencesCriticalLoaded** | ⏳ צריך בדיקה | ⏳ צריך אינטגרציה |

---

## 📊 סיכום סטטוס

### ישויות
- ✅ **5 ישויות מוכנות** (Trade, Execution, Alert, CashFlow, Statistics)
- ⏳ **7 ישויות צריכות Business Service** (Note, TradingAccount, TradePlan, Ticker, Currency, Tag, Preferences)
- ⏳ **12 ישויות אופציונליות** (ישויות משניות)

### Data Services
- ✅ **8 Data Services מוכנים** (TradesData, ExecutionsData, AlertsData, CashFlowsData, NotesData, TradingAccountsData, TradePlansData, TickersData)
- ⏳ **4 Data Services צריכים Wrappers** (PreferencesData, ResearchData, DataImportData, DashboardData)

### עמודים
- ✅ **9 עמודים מוכנים** (Trades, Executions, Alerts, Cash Flows, Trade Plans, Trading Accounts, Tickers, Notes)
- ⏳ **3 עמודים צריכים Business Service** (Dashboard, Data Import, Research)
- ✅ **17 עמודים טכניים** (מוכנים)

### מערכות כלליות
- ✅ **28 מערכות מוכנות** (Core, UI, CRUD חלקי)
- ⏳ **12 מערכות צריכות אינטגרציה** (מטמון, איתחול, Business Logic)

### Business Logic Services
- ✅ **11 Business Services קיימים** (Trade, Execution, Alert, Statistics, CashFlow, Note, TradingAccount, TradePlan, Ticker, Currency, Tag)
- ⏳ **1 Business Service חסר** (Preferences - מורכב)

---

---

## 📖 תיעוד מפורט - StatisticsBusinessService

`StatisticsBusinessService` מספק חישובי סטטיסטיקה, KPI, וביצועי פורטפוליו.

### תכונות עיקריות:
- ✅ חישובי סטטיסטיקה בסיסיים: sum, average, count, min/max
- ✅ חישובי KPI מורכבים
- ✅ **חישוב Time-Weighted Return (TWR)** לביצועי פורטפוליו

### פונקציות מרכזיות:

#### 1. פונקציות בסיסיות:
- `calculate_sum(data, field)` - חישוב סכום
- `calculate_average(data, field)` - חישוב ממוצע
- `count_records(data, filter_fn)` - ספירה עם פילטר
- `calculate_min_max(data, field)` - מינימום ומקסימום

#### 2. חישובי KPI:
- `calculate_kpi(calculation_type, data, params)` - חישוב KPI על פי סוג
  - סוגים: 'kpi', 'summary', 'average', 'position', 'portfolio'

#### 3. חישוב Time-Weighted Return:
- `calculate_time_weighted_return(db, account_id, start_date, end_date, include_cash_flows)`
  - **מטרה**: חישוב ביצועי פורטפוליו ללא השפעה של הפקדות/משיכות
  - **איך זה עובד**: מחלק את התקופה לתת-תקופות בין cash flows, מחשב תשואה לכל תת-תקופה, ומכפיל את כל התשואות
  - **למה חשוב**: מתחשב בזמן הכניסה של הכסף - הפקדה בחודש הראשון "עובדת" יותר זמן מהפקדה בחודש האחרון

### תיעוד מפורט:
📚 **ראה:** [`STATISTICS_BUSINESS_SERVICE_GUIDE.md`](../GUIDES/STATISTICS_BUSINESS_SERVICE_GUIDE.md) למדריך מפורט עם דוגמאות שימוש

---

**תאריך עדכון אחרון:** 23 נובמבר 2025  
**גרסה:** 1.1.0  
**סטטוס:** ✅ מעודכן - כולל Phase 2.1-2.3 (Frontend Wrappers, Page Scripts, Cache Integration)

