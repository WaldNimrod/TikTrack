# מטריצת אינטגרציה - TikTrack
## Integration Matrix

**תאריך יצירה:** 1.11.2025  
**גרסה:** 1.0.0  
**סטטוס:** מעודכן אוטומטית

---

## 📊 מטריצת אינטגרציה

מטריצה זו מציגה את כל האינטגרציות והתלויות בין המערכות הכלליות במערכת TikTrack.

### קטגוריות:

**סוגי אינטגרציה:**
- **Direct:** קריאה ישירה (window.Service.method())
- **Indirect:** דרך מערכת מתווכת
- **Optional:** עם fallback (window.X && window.X.method())
- **Required:** חובה - שגיאה אם חסר

**סטטוס אינטגרציה:**
- **Working:** אינטגרציה עובדת במלואה
- **Partial:** חלקי - עובד אבל לא אופטימלי
- **Broken:** שבור - שגיאות ידועות
- **Missing:** חסר - צריך ליצור
- **Unknown:** לא נבדק

---

## 📋 טבלת אינטגרציה

| מערכת | קובץ | תלויות (Depends On) | משתמשות בה (Used By) | סוג אינטגרציה | סטטוס | סדר אתחול | בעיות קריטיות | הערות |
|--------|------|---------------------|---------------------|----------------|--------|-----------|---------------|-------|
| AlertConditionRenderer | services/alert-condition-renderer.js | - | - | None | Unknown | N/A | - | - |
| CRUDResponseHandler | services/crud-response-handler.js | UnifiedCacheManager | loadTableData | Required, Direct, Optional | Partial | 6 | - | - |
| DataCollectionService | services/data-collection-service.js | - | - | None | Unknown | 1 | - | - |
| DefaultValueSetter | services/default-value-setter.js | - | - | None | Unknown | 5 | - | - |
| FieldRendererService | services/field-renderer-service.js | - | EntityDetailsRenderer | None | Unknown | 2 | - | - |
| LinkedItemsService | services/linked-items-service.js | ModalManagerV2 | EntityDetailsRenderer | Direct, Optional | Working | 7 | - | - |
| SelectPopulatorService | services/select-populator-service.js | PreferencesCore, PreferencesSystem | ModalManagerV2 | Required, Direct | Broken | 3 | - | - |
| StatisticsCalculator | services/statistics-calculator.js | - | - | None | Unknown | 4 | - | - |
| ActionsMenuSystem | modules/actions-menu-system.js | - | UnifiedAppInitializer | None | Unknown | 3 | - | - |
| loadTableData | modules/business-module.js | CRUDResponseHandler, ModalManagerV2, toggleSection | - | Required, Direct, Indirect | Working | N/A | - | - |
| UnifiedAppInitializer | modules/core-systems.js | UnifiedCacheManager, PreferencesSystem, Logger, NotificationSystem, ActionsMenuSystem, HeaderSystem, toggleSection | - | Required, Direct, Optional, Indirect | Broken | N/A | - | - |
| ModalManagerV2 | modal-manager-v2.js | PreferencesSystem, SelectPopulatorService | LinkedItemsService, loadTableData, EventHandlerManager, EntityDetailsRenderer | Required, Direct | Broken | 2 | - | - |
| UnifiedCacheManager | unified-cache-manager.js | Logger, CacheSyncManager, PreferencesCore | CRUDResponseHandler, UnifiedAppInitializer, ModalNavigationManager, NotificationSystem, HeaderSystem, PreferencesGroupManager, EntityDetailsAPI, PreferencesCore | Required, Direct, Optional | Partial | 6 | Circular dependency: UnifiedCacheManager -> UnifiedCacheManager -> PreferencesCore | - |
| CacheSyncManager | cache-sync-manager.js | Logger | UnifiedCacheManager | Required, Direct | Working | 7 | - | - |
| CachePolicyManager | cache-policy-manager.js | - | - | None | Unknown | 10 | - | - |
| ModalNavigationManager | modal-navigation-manager.js | Logger, UnifiedCacheManager, ButtonSystem | - | Required, Direct, Optional, Indirect | Partial | 1 | - | - |
| EventHandlerManager | event-handler-manager.js | Logger, ModalManagerV2, toggleSection | - | Required, Direct, Indirect | Working | 13 | - | - |
| NotificationSystem | notification-system.js | Logger, UnifiedCacheManager | UnifiedAppInitializer | Required, Direct, Optional | Partial | 2 | - | - |
| Logger | logger-service.js | toggleSection | UnifiedAppInitializer, UnifiedCacheManager, CacheSyncManager, ModalNavigationManager, EventHandlerManager, NotificationSystem, HeaderSystem, ButtonSystem, ColorSchemeSystem, InfoSummarySystem, AlertService, TickerService, EntityDetailsModal, EntityDetailsRenderer, EntityDetailsAPI, toggleSection, PreferencesCore | Indirect | Working | 8 | Circular dependency: Logger -> Logger -> toggleSection; Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem | - |
| HeaderSystem | header-system.js | Logger, UnifiedCacheManager | UnifiedAppInitializer | Required, Direct, Optional, Indirect | Partial | 9 | - | - |
| ButtonSystem | button-system-init.js | Logger | ModalNavigationManager | Required, Direct | Working | 14 | - | - |
| ColorSchemeSystem | color-scheme-system.js | Logger | - | Required, Direct | Working | 15 | - | - |
| InfoSummarySystem | info-summary-system.js | Logger | toggleSection | Required, Direct | Working | 1 | Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem | - |
| AlertService | alert-service.js | Logger | - | Required, Direct | Working | N/A | - | - |
| TickerService | ticker-service.js | Logger | - | Required, Direct | Working | N/A | - | - |
| TradePlanService | trade-plan-service.js | - | - | None | Unknown | N/A | - | - |
| AccountService | account-service.js | - | - | None | Unknown | N/A | - | - |
| PreferencesGroupManager | preferences-group-manager.js | PreferencesCore, UnifiedCacheManager | - | Required, Direct, Optional | Partial | 8 | - | - |
| EntityDetailsModal | entity-details-modal.js | Logger | - | Required, Direct | Working | 3 | - | - |
| EntityDetailsRenderer | entity-details-renderer.js | Logger, FieldRendererService, LinkedItemsService, ModalManagerV2 | - | Required, Direct, Optional | Partial | 2 | - | - |
| EntityDetailsAPI | entity-details-api.js | Logger, UnifiedCacheManager | - | Required, Direct, Optional | Partial | 1 | - | - |
| toggleSection | ui-utils.js | Logger, InfoSummarySystem | loadTableData, UnifiedAppInitializer, EventHandlerManager, Logger | Required, Direct | Working | 3 | Circular dependency: Logger -> Logger -> toggleSection; Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem | - |
| PreferencesCore | preferences-core-new.js | Logger, UnifiedCacheManager | SelectPopulatorService, UnifiedCacheManager, PreferencesGroupManager | Required, Direct, Indirect | Working | 1 | Circular dependency: UnifiedCacheManager -> UnifiedCacheManager -> PreferencesCore | - |
| showFieldError | validation-utils.js | - | - | None | Unknown | 6 | - | - |

---

## 📊 סיכום סטטיסטיקות

### סיכום לפי סטטוס:
- **Unknown:** 10 מערכות
- **Partial:** 8 מערכות
- **Working:** 13 מערכות
- **Broken:** 3 מערכות

### סיכום לפי סוג אינטגרציה:
- **None:** 10 מערכות
- **Required:** 22 מערכות
- **Direct:** 23 מערכות
- **Optional:** 10 מערכות
- **Indirect:** 7 מערכות

### מערכות עם הכי הרבה תלויות:
1. **UnifiedCacheManager:** 391 תלויות
2. **NotificationSystem:** 196 תלויות
3. **toggleSection:** 168 תלויות
4. **EntityDetailsAPI:** 146 תלויות
5. **HeaderSystem:** 128 תלויות
6. **EntityDetailsRenderer:** 123 תלויות
7. **ModalNavigationManager:** 117 תלויות
8. **PreferencesCore:** 115 תלויות
9. **UnifiedAppInitializer:** 96 תלויות
10. **EntityDetailsModal:** 70 תלויות

---

## 🔍 בעיות שזוהו

### UnifiedCacheManager
- ⚠️ Circular dependency: UnifiedCacheManager -> UnifiedCacheManager -> PreferencesCore

### Logger
- ⚠️ Circular dependency: Logger -> Logger -> toggleSection
- ⚠️ Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem

### InfoSummarySystem
- ⚠️ Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem

### toggleSection
- ⚠️ Circular dependency: Logger -> Logger -> toggleSection
- ⚠️ Circular dependency: Logger -> toggleSection -> Logger -> InfoSummarySystem

### PreferencesCore
- ⚠️ Circular dependency: UnifiedCacheManager -> UnifiedCacheManager -> PreferencesCore


---

## 📝 הערות

- מטריצה זו נוצרת אוטומטית מניתוח הקוד
- לפרטים נוספים ראה: SYSTEM_INTEGRATION_ANALYSIS_REPORT.md
- עדכון אחרון: 1.11.2025, 5:14:38
