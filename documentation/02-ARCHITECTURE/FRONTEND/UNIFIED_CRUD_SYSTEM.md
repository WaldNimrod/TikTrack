# Unified CRUD System - TikTrack

## סקירה כללית

`UnifiedCRUDService` היא מערכת מרכזית לפעולות CRUD עבור כל הישויות במערכת TikTrack. המערכת מספקת פתרון מאוחד לפעולות יצירה, עדכון ומחיקה תוך שימוש מלא במערכות הקיימות: `DataCollectionService`, `CRUDResponseHandler`, `CacheSyncManager`, ו-`ModalManagerV2`.

**גרסה**: 1.0.0  
**תאריך יצירה**: ינואר 2025  
**סטטוס**: Production Ready

---

## תכונות מרכזיות

### 1. פעולות CRUD מאוחדות
- **שמירה כללית** (`saveEntity`) - יצירה או עדכון אוטומטי
- **עדכון כללי** (`updateEntity`) - עדכון ישות קיימת
- **מחיקה כללית** (`deleteEntity`) - מחיקת ישות עם בדיקת פריטים מקושרים

### 2. אינטגרציה מלאה עם מערכות קיימות
- **DataCollectionService** - איסוף נתונים מטפסים
- **CRUDResponseHandler** - טיפול בתגובות API
- **CacheSyncManager** - ניקוי מטמון אוטומטי
- **ModalManagerV2** - סגירת מודלים אוטומטית

### 3. תמיכה בכל הישויות
- trade
- trade_plan
- alert
- ticker
- trading_account
- execution
- cash_flow
- note

---

## API Reference

### saveEntity()

שמירה כללית (יצירה או עדכון אוטומטי).

```javascript
static async saveEntity(entityType, entityData, options = {})
```

**פרמטרים:**
- `entityType` (string, required) - סוג הישות (trade, trade_plan, alert, וכו')
- `entityData` (Object, optional) - נתוני הישות לשמירה. אם לא סופק, יאוספו מהטופס
- `options` (Object, optional) - אופציות נוספות:
  - `modalId` (string) - מזהה המודל לסגירה
  - `successMessage` (string) - הודעת הצלחה מותאמת אישית
  - `entityName` (string) - שם הישות בעברית (למטרות הודעות)
  - `reloadFn` (Function) - פונקציית רענון מותאמת אישית
  - `requiresHardReload` (boolean, default: false) - האם נדרש hard reload
  - `fieldMap` (Object) - מפת שדות לאיסוף נתונים (אם לא סופק entityData)
  - `formId` (string) - מזהה הטופס לאיסוף נתונים (אם לא סופק entityData)
  - `isEdit` (boolean) - האם זה מצב עריכה (אם לא נקבע אוטומטית)

**מחזיר:**
- `Promise<Object|null>` - נתוני התגובה או null במקרה של שגיאה

**דוגמאות:**

```javascript
// שמירת טרייד חדש
const result = await UnifiedCRUDService.saveEntity('trade', {
  trading_account_id: 1,
  ticker_id: 2,
  status: 'open',
  side: 'Long'
}, {
  modalId: 'tradesModal',
  successMessage: 'טרייד נוסף בהצלחה',
  entityName: 'טרייד',
  reloadFn: () => window.loadTradesData()
});

// שמירה עם איסוף נתונים מהטופס
const result = await UnifiedCRUDService.saveEntity('note', null, {
  modalId: 'notesModal',
  fieldMap: {
    content: { id: 'noteContent', type: 'rich-text' },
    related_type_id: { id: 'noteRelatedType', type: 'text' },
    related_id: { id: 'noteRelatedObject', type: 'int' }
  }
});
```

---

### updateEntity()

עדכון כללי של ישות קיימת.

```javascript
static async updateEntity(entityType, entityId, entityData, options = {})
```

**פרמטרים:**
- `entityType` (string, required) - סוג הישות
- `entityId` (number|string, required) - מזהה הישות
- `entityData` (Object, required) - נתוני הישות לעדכון
- `options` (Object, optional) - אופציות נוספות (כמו `saveEntity`)

**מחזיר:**
- `Promise<Object|null>` - נתוני התגובה או null במקרה של שגיאה

**דוגמה:**

```javascript
// עדכון טרייד
const result = await UnifiedCRUDService.updateEntity('trade', 123, {
  status: 'closed',
  closed_at: new Date().toISOString()
}, {
  modalId: 'tradesModal',
  successMessage: 'טרייד עודכן בהצלחה',
  entityName: 'טרייד'
});
```

---

### deleteEntity()

מחיקה כללית של ישות קיימת.

```javascript
static async deleteEntity(entityType, entityId, options = {})
```

**פרמטרים:**
- `entityType` (string, required) - סוג הישות
- `entityId` (number|string, required) - מזהה הישות
- `options` (Object, optional) - אופציות נוספות:
  - `modalId` (string) - מזהה המודל לסגירה
  - `successMessage` (string) - הודעת הצלחה מותאמת אישית
  - `entityName` (string) - שם הישות בעברית
  - `reloadFn` (Function) - פונקציית רענון מותאמת אישית
  - `checkLinkedItems` (Function) - פונקציית בדיקת פריטים מקושרים
  - `requiresHardReload` (boolean, default: false) - האם נדרש hard reload

**מחזיר:**
- `Promise<boolean>` - true אם המחיקה הצליחה, false אחרת

**דוגמה:**

```javascript
// מחיקת טרייד
const success = await UnifiedCRUDService.deleteEntity('trade', 123, {
  modalId: 'tradesModal',
  successMessage: 'טרייד נמחק בהצלחה',
  entityName: 'טרייד',
  reloadFn: () => window.loadTradesData(),
  checkLinkedItems: async (entityType, entityId) => {
    return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
  }
});
```

---

## שימוש במערכות קיימות

### DataCollectionService

`UnifiedCRUDService` משתמש ב-`DataCollectionService` לאיסוף נתונים מטפסים:

```javascript
// איסוף נתונים מהטופס
const data = window.DataCollectionService.collectFormData({
  content: { id: 'noteContent', type: 'rich-text' },
  related_type_id: { id: 'noteRelatedType', type: 'text' },
  related_id: { id: 'noteRelatedObject', type: 'int' }
});
```

### CRUDResponseHandler

`UnifiedCRUDService` משתמש ב-`CRUDResponseHandler` לטיפול בתגובות API:

```javascript
// טיפול בתגובת שמירה
const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
  modalId: 'notesModal',
  successMessage: 'הערה נשמרה בהצלחה!',
  entityName: 'הערה',
  reloadFn: () => window.loadNotesData({ force: true })
});
```

### CacheSyncManager

`UnifiedCRUDService` משתמש ב-`CacheSyncManager` לניקוי מטמון אוטומטי:

```javascript
// ניקוי מטמון לפי פעולה
await window.CacheSyncManager.invalidateByAction('trade-created');
await window.CacheSyncManager.invalidateByAction('trade-updated');
await window.CacheSyncManager.invalidateByAction('trade-deleted');
```

### ModalManagerV2

`UnifiedCRUDService` משתמש ב-`ModalManagerV2` לסגירת מודלים (דרך `CRUDResponseHandler`):

```javascript
// CRUDResponseHandler מטפל בסגירת המודל אוטומטית
// אין צורך בקריאה ישירה ל-ModalManagerV2
```

---

## מיפוי פעולות לניקוי מטמון

`UnifiedCRUDService` משתמש ב-`_getEntityActionName()` כדי לקבל שם פעולה התואם ל-`CacheSyncManager.invalidationPatterns`:

| Entity Type | Created | Updated | Deleted |
|-------------|---------|---------|---------|
| trade | trade-created | trade-updated | trade-deleted |
| trade_plan | trade-plan-created | trade-plan-updated | trade-plan-deleted |
| alert | alert-created | alert-updated | alert-deleted |
| ticker | ticker-updated* | ticker-updated | ticker-updated* |
| trading_account | account-created | account-updated | account-deleted |
| execution | execution-created | execution-updated | execution-deleted |
| cash_flow | cash-flow-created | cash-flow-updated | cash-flow-deleted |
| note | note-created | note-updated | note-deleted |

*טיפול מיוחד: `ticker` תומך רק ב-`updated` ב-`CacheSyncManager`, לכן `created` ו-`deleted` משתמשים ב-`ticker-updated`.

---

## אינטגרציה עם LinkedItemsService

`LinkedItemsService` משתמש ב-`UnifiedCRUDService` לפעולות מחיקה:

```javascript
// מחיקה דרך UnifiedCRUDService
const success = await window.UnifiedCRUDService.deleteEntity('note', noteId, {
  checkLinkedItems: async (entityType, entityId) => {
    if (window.checkLinkedItemsBeforeAction) {
      return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
    }
    return false;
  },
  reloadFn: () => {
    if (window.updateNotesTable) window.updateNotesTable();
  }
});
```

---

## תמיכה ב-Unlink/Link עבור Trade ↔ Trade Plan

`LinkedItemsService` תומך בפעולות unlink/link בין trade ל-trade_plan:

### Unlink Trade from Plan

```javascript
// ביטול קישור trade מתוכנית
await UnifiedCRUDService.updateEntity('trade', tradeId, {
  trade_plan_id: null
}, {
  successMessage: 'קישור לתוכנית בוטל בהצלחה',
  entityName: 'טרייד',
  reloadFn: () => {
    if (window.loadTradesData) window.loadTradesData();
    if (window.loadTradePlansData) window.loadTradePlansData();
  }
});
```

### Link Trade to Plan

```javascript
// קישור trade לתוכנית
const response = await fetch(`/api/trades/${tradeId}/link-plan`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ trade_plan_id: planId })
});
```

---

## טיפול בשגיאות

`UnifiedCRUDService` משתמש ב-`CRUDResponseHandler.handleError()` לטיפול בשגיאות:

```javascript
// טיפול בשגיאה
if (window.CRUDResponseHandler?.handleError) {
  window.CRUDResponseHandler.handleError(error, `שמירת ${options.entityName || entityType}`);
} else if (window.showErrorNotification) {
  window.showErrorNotification('שגיאה', error.message || `לא ניתן לשמור את ${options.entityName || entityType}`);
}
```

---

## אינטגרציה עם מערכת הטעינה

### Package Manifest

`unified-crud-service.js` נוסף ל-`package-manifest.js` ב-`services` package:

```javascript
{
  file: 'services/unified-crud-service.js',
  globalCheck: 'window.UnifiedCRUDService',
  description: 'שירות CRUD מאוחד לכל הישויות',
  required: false,
  loadOrder: 6.5
}
```

### Page Initialization

המערכת היא ניטור ובקרה בלבד - הקבצים חייבים להיות בקישורים ב-HTML.

---

## דוגמאות שימוש

### דוגמה 1: שמירת הערה חדשה

```javascript
// איסוף נתונים מהטופס
const noteData = window.DataCollectionService.collectFormData({
  content: { id: 'noteContent', type: 'rich-text' },
  related_type_id: { id: 'noteRelatedType', type: 'text' },
  related_id: { id: 'noteRelatedObject', type: 'int' },
  tag_ids: { id: 'noteTags', type: 'tags', default: [] }
});

// שמירה דרך UnifiedCRUDService
const result = await UnifiedCRUDService.saveEntity('note', noteData, {
  modalId: 'notesModal',
  successMessage: 'הערה נשמרה בהצלחה!',
  entityName: 'הערה',
  reloadFn: () => window.loadNotesData({ force: true })
});

// עדכון תגיות (אם נדרש)
if (result && window.TagService) {
  const noteId = result.data?.id || result.id;
  await window.TagService.replaceEntityTags('note', noteId, noteData.tag_ids);
}
```

### דוגמה 2: עדכון טרייד

```javascript
// עדכון סטטוס טרייד
const result = await UnifiedCRUDService.updateEntity('trade', tradeId, {
  status: 'closed',
  closed_at: new Date().toISOString()
}, {
  modalId: 'tradesModal',
  successMessage: 'טרייד עודכן בהצלחה',
  entityName: 'טרייד',
  reloadFn: () => window.loadTradesData()
});
```

### דוגמה 3: מחיקת התראה

```javascript
// מחיקת התראה עם בדיקת פריטים מקושרים
const success = await UnifiedCRUDService.deleteEntity('alert', alertId, {
  modalId: 'alertsModal',
  successMessage: 'התראה נמחקה בהצלחה',
  entityName: 'התראה',
  reloadFn: () => window.loadAlertsData(),
  checkLinkedItems: async (entityType, entityId) => {
    if (window.checkLinkedItemsBeforeAction) {
      return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
    }
    return false;
  }
});
```

---

## מדריך למפתח העתידי

### הוספת תמיכה בישות חדשה

1. **הוספה ל-`_isValidEntityType()`**:
```javascript
static _isValidEntityType(entityType) {
    const validTypes = [
        // ... ישויות קיימות
        'new_entity'
    ];
    return validTypes.includes(entityType);
}
```

2. **הוספה ל-`_getEntityAPIEndpoint()`**:
```javascript
static _getEntityAPIEndpoint(entityType) {
    const endpointMap = {
        // ... endpoints קיימים
        'new_entity': '/api/new-entities'
    };
    return endpointMap[entityType] || `/api/${entityType}`;
}
```

3. **הוספה ל-`_getEntityActionName()`**:
```javascript
static _getEntityActionName(entityType, operation) {
    const entityNameMap = {
        // ... entity names קיימים
        'new_entity': 'new-entity'
    };
    const entityName = entityNameMap[entityType] || entityType;
    return `${entityName}-${operation}`;
}
```

4. **הוספה ל-`_getDefaultReloadFunction()`**:
```javascript
static _getDefaultReloadFunction(entityType) {
    const reloadFunctionMap = {
        // ... functions קיימות
        'new_entity': () => window.loadNewEntitiesData?.()
    };
    return reloadFunctionMap[entityType] || null;
}
```

5. **הוספה ל-`_getEntityServiceMethod()`** (אופציונלי):
```javascript
static _getEntityServiceMethod(entityType, operation) {
    const serviceMap = {
        // ... services קיימים
        'new_entity': {
            create: window.NewEntitiesData?.createNewEntity,
            update: window.NewEntitiesData?.updateNewEntity
        }
    };
    return serviceMap[entityType]?.[operation] || null;
}
```

6. **הוספה ל-`CacheSyncManager.invalidationPatterns`** (אם נדרש):
```javascript
this.invalidationPatterns = {
    // ... patterns קיימים
    'new-entity-created': ['new-entities-data', 'dashboard-data'],
    'new-entity-updated': ['new-entities-data', 'dashboard-data'],
    'new-entity-deleted': ['new-entities-data', 'dashboard-data']
};
```

### שימוש ב-UnifiedCRUDService במקום פונקציות ספציפיות

**לפני:**
```javascript
// פונקציה ספציפית לכל ישות
async function saveTrade() {
    const form = document.getElementById('tradesModalForm');
    const tradeData = {
        trading_account_id: document.getElementById('tradeAccount').value,
        ticker_id: document.getElementById('tradeTicker').value,
        // ... עוד שדות
    };
    
    const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
    });
    
    if (response.ok) {
        window.showSuccessNotification('הצלחה', 'טרייד נוסף בהצלחה');
        window.ModalManagerV2.hideModal('tradesModal');
        window.loadTradesData();
    } else {
        window.showErrorNotification('שגיאה', 'לא ניתן לשמור את הטרייד');
    }
}
```

**אחרי:**
```javascript
// שימוש ב-UnifiedCRUDService
async function saveTrade() {
    const tradeData = window.DataCollectionService.collectFormData({
        trading_account_id: { id: 'tradeAccount', type: 'int' },
        ticker_id: { id: 'tradeTicker', type: 'int' },
        // ... עוד שדות
    });
    
    await UnifiedCRUDService.saveEntity('trade', tradeData, {
        modalId: 'tradesModal',
        successMessage: 'טרייד נוסף בהצלחה',
        entityName: 'טרייד',
        reloadFn: () => window.loadTradesData()
    });
}
```

---

## בעיות נפוצות ופתרונות

### בעיה: "Invalid entity type" error

**פתרון**: וודא שהישות מופיעה ב-`_isValidEntityType()`.

### בעיה: Cache לא מתנקה אחרי פעולה

**פתרון**: וודא שה-action name תואם ל-`CacheSyncManager.invalidationPatterns`.

### בעיה: Modal לא נסגר אחרי פעולה

**פתרון**: וודא ש-`modalId` מועבר ב-`options` ו-`CRUDResponseHandler` זמין.

### בעיה: טבלה לא מתעדכנת אחרי פעולה

**פתרון**: וודא ש-`reloadFn` מועבר ב-`options` או שהישות מופיעה ב-`_getDefaultReloadFunction()`.

---

## תלויות

- `DataCollectionService` - איסוף נתונים מטפסים
- `CRUDResponseHandler` - טיפול בתגובות API
- `CacheSyncManager` - ניקוי מטמון
- `ModalManagerV2` - סגירת מודלים (דרך CRUDResponseHandler)
- `EntityDetailsAPI` - מחיקה (fallback)
- `Logger` - לוגים

---

## קישורים רלוונטיים

- [CRUD Response Handler Documentation](./CRUD_RESPONSE_HANDLER.md)
- [Data Collection Service Documentation](./DATA_COLLECTION_SERVICE.md)
- [Cache Sync Manager Documentation](../../04-FEATURES/CORE/UNIFIED_CACHE_SYSTEM.md)
- [Modal System V2 Documentation](./MODAL_SYSTEM_V2.md)
- [Linked Items System Documentation](./LINKED_ITEMS_SYSTEM.md)

---

## תמיכה

לשאלות או בעיות:
1. בדוק את התיעוד הזה
2. בדוק את קבצי הקוד (`trading-ui/scripts/services/unified-crud-service.js`)
3. בדוק את לוגי המערכת (`window.Logger`)
4. פנה לצוות הפיתוח

