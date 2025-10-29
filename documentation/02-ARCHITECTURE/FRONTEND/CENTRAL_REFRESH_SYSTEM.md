# Central Refresh System - TikTrack
## מערכת רענון מרכזית לפעולות CRUD

### סקירה כללית
מערכת `CentralRefreshSystem` היא מערכת מרכזית המטפלת בעדכון אוטומטי של הממשק אחרי פעולות CRUD (Create, Read, Update, Delete) בכל 13 עמודי המשתמש במערכת.

### מטרות המערכת
1. **איחוד לוגיקה** - החלפת 18+ פונקציות זהות ב-`save/update/delete`
2. **עדכון אוטומטי** - רענון נתונים ומטמון אוטומטי אחרי פעולות
3. **ניהול מטמון חכם** - ניקוי מטמון ספציפי לכל ישות
4. **עקביות** - התנהגות אחידה בכל המערכת

### ארכיטקטורה

#### רכיבי המערכת
```
CentralRefreshSystem
├── Entity Load Functions (13 ישויות)
├── Cache Management (ניקוי ממוקד)
├── Success Notifications (הודעות הצלחה)
└── Error Handling (טיפול בשגיאות)
```

#### ישויות נתמכות
| ישות | פונקציית טעינה | דפוסי מטמון |
|------|----------------|-------------|
| `trades` | `loadTradesData()` | `trades_*`, `trade_*` |
| `trading_accounts` | `loadAccountsTable()` | `accounts_*`, `trading_accounts_*` |
| `executions` | `loadExecutionsData()` | `executions_*`, `execution_*` |
| `cash_flows` | `loadCashFlowsData()` | `cash_flows_*`, `cash_flow_*` |
| `alerts` | `loadAlertsData()` | `alerts_*`, `alert_*` |
| `tickers` | `loadTickersData()` | `tickers_*`, `ticker_*` |
| `notes` | `loadNotesData()` | `notes_*`, `note_*` |
| `trade_plans` | `loadTradePlansData()` | `trade_plans_*`, `trade_plan_*` |
| `research` | `loadResearchData()` | `research_*`, `all_research_*` |
| `preferences` | `window.location.reload()` | `preference_*`, `all_preferences_*` |
| `dashboard` | `loadDashboardData()` | `dashboard_*`, `overview_*` |

### API

#### `showSuccessAndRefresh(entityType, successMessage, options)`
הפונקציה הראשית לעדכון אחרי פעולות CRUD.

**פרמטרים:**
- `entityType` (string) - סוג הישות (trades, alerts, etc.)
- `successMessage` (string) - הודעת הצלחה
- `options` (object) - אפשרויות נוספות
  - `onSuccess` (function) - פונקציה נוספת לביצוע

**דוגמה:**
```javascript
// עדכון טרייד
await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד עודכן בהצלחה!');

// עדכון העדפות
await window.centralRefresh.showSuccessAndRefresh('preferences', 'העדפות נשמרו בהצלחה!');

// עדכון עם פונקציה נוספת
await window.centralRefresh.showSuccessAndRefresh('alerts', 'התראה נוספה בהצלחה!', {
    onSuccess: () => console.log('Additional action completed')
});
```

#### `refreshEntityData(entityType)`
רענון נתונים של ישות ספציפית.

**פרמטרים:**
- `entityType` (string) - סוג הישות

#### `refreshAllEntities()`
רענון כל הישויות במערכת.

#### `clearEntityCache(entityType)`
ניקוי מטמון ספציפי לישות.

**פרמטרים:**
- `entityType` (string) - סוג הישות

### אינטגרציה עם מערכות אחרות

#### UnifiedCacheManager
```javascript
// ניקוי מטמון אוטומטי
await window.UnifiedCacheManager.refreshUserPreferences();
```

#### Notification System
```javascript
// הודעות הצלחה אוטומטיות
window.showSuccessNotification('הצלחה', successMessage, 4000, 'business');
```

#### Error Handling
```javascript
// טיפול בשגיאות עם הודעות
window.showErrorNotification('שגיאה', `שגיאה בעדכון ${entityType}: ${error.message}`);
```

### שימוש במערכת

#### 1. בדיקה אם המערכת זמינה
```javascript
if (window.centralRefresh && window.centralRefresh.initialized) {
    // השתמש במערכת המרכזית
    await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד נשמר בהצלחה!');
} else {
    // Fallback למערכת הישנה
    window.showSuccessNotification('הצלחה', 'טרייד נשמר בהצלחה!');
    await loadTradesData();
}
```

#### 2. שימוש סטנדרטי
```javascript
// במקום:
window.showSuccessNotification('הצלחה', 'טרייד נשמר בהצלחה!');
await loadTradesData();

// השתמש ב:
await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד נשמר בהצלחה!');
```

#### 3. הוספת ישות חדשה
```javascript
// הוספה ל-entityLoadFunctions
this.entityLoadFunctions.set('new_entity', () => {
    if (typeof window.loadNewEntityData === 'function') {
        return window.loadNewEntityData();
    }
    return Promise.resolve();
});

// הוספה ל-getEntityCachePatterns
const patterns = {
    // ... existing patterns
    'new_entity': ['new_entity_*', 'all_new_entity_*']
};
```

### תכונות מתקדמות

#### ניהול מטמון חכם
- ניקוי מטמון ספציפי לכל ישות
- דפוסי מטמון מותאמים אישית
- אינטגרציה עם UnifiedCacheManager

#### טיפול בשגיאות
- Fallback אוטומטי למערכת הישנה
- הודעות שגיאה מפורטות
- Logging מפורט לכל פעולה

#### ביצועים
- טעינה אסינכרונית של נתונים
- ניקוי מטמון מקבילי
- Timeout protection (5 שניות)

### לוגים ודיבוג

#### רמת לוגים
```javascript
// הצלחה
window.Logger.info('✅ Success and refresh completed for trades', { page: "central-refresh" });

// שגיאה
window.Logger.error('❌ Error in showSuccessAndRefresh for trades:', error, { page: "central-refresh" });

// אזהרה
window.Logger.warn('⚠️ No load function found for entity: new_entity', { page: "central-refresh" });
```

#### דיבוג
```javascript
// בדיקת זמינות
console.log('Central Refresh available:', !!window.centralRefresh);
console.log('Central Refresh initialized:', window.centralRefresh?.initialized);

// בדיקת ישויות זמינות
console.log('Available entities:', Array.from(window.centralRefresh.entityLoadFunctions.keys()));
```

### תחזוקה ופיתוח

#### הוספת ישות חדשה
1. הוסף ל-`setupEntityMappings()`
2. הוסף דפוסי מטמון ל-`getEntityCachePatterns()`
3. בדוק שהפונקציית הטעינה קיימת
4. בדוק אינטגרציה עם המערכת

#### עדכון פונקציות טעינה
```javascript
// עדכון פונקציית טעינה קיימת
this.entityLoadFunctions.set('trades', () => {
    if (typeof window.loadTradesDataV2 === 'function') {
        return window.loadTradesDataV2();
    }
    return Promise.resolve();
});
```

#### ניטור ביצועים
```javascript
// מדידת זמן ביצוע
const startTime = performance.now();
await window.centralRefresh.showSuccessAndRefresh('trades', 'טרייד נשמר בהצלחה!');
const endTime = performance.now();
console.log(`Refresh took ${endTime - startTime} milliseconds`);
```

### בעיות נפוצות ופתרונות

#### 1. "Central Refresh System not available"
**בעיה:** המערכת לא נטענה
**פתרון:** בדוק שה-`central-refresh-system.js` נטען לפני השימוש

#### 2. "No load function found for entity"
**בעיה:** אין פונקציית טעינה לישות
**פתרון:** הוסף את הפונקציה ל-`setupEntityMappings()`

#### 3. "Cache clearing failed"
**בעיה:** ניקוי מטמון נכשל
**פתרון:** בדוק ש-UnifiedCacheManager זמין ופעיל

#### 4. "Entity data refresh failed"
**בעיה:** טעינת נתונים נכשלה
**פתרון:** בדוק שהפונקציית הטעינה עובדת נכון

### גרסאות ועדכונים

#### v1.0.0 (אוקטובר 2025)
- יצירת המערכת הבסיסית
- תמיכה ב-13 ישויות
- אינטגרציה עם UnifiedCacheManager
- מערכת הודעות מלאה

#### תכונות עתידיות
- [ ] תמיכה ב-batch operations
- [ ] ניטור ביצועים מתקדם
- [ ] תמיכה ב-custom refresh strategies
- [ ] אינטגרציה עם WebSocket updates

### קישורים רלוונטיים
- [Unified Cache System](../UNIFIED_CACHE_SYSTEM.md)
- [CRUD Response Handler](../services/CRUD_RESPONSE_HANDLER.md)
- [Notification System](../NOTIFICATION_SYSTEM.md)
- [Frontend Architecture Overview](../FRONTEND_ARCHITECTURE.md)