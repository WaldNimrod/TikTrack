# Unified Deletion Process - תהליך מחיקה אחיד
# ===========================================

**תאריך יצירה:** 2 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מיושם בכל 8 העמודים  

---

## 📋 סקירה כללית

תהליך מחיקה אחיד המבוסס על:
- ✅ בדיקת פריטים מקושרים לפני מחיקה
- ✅ ניקוי מטמון לפני ביצוע המחיקה
- ✅ שימוש ב-`CRUDResponseHandler` לטיפול אחיד בתגובות
- ✅ עדכון טבלה אוטומטי לאחר מחיקה מוצלחת

---

## 🏗️ ארכיטקטורה

### קבצים מעורבים

```
trading-ui/scripts/
├── linked-items.js              # מערכת בדיקת פריטים מקושרים
│   ├── checkLinkedItemsBeforeAction()
│   └── checkLinkedItemsAndPerformAction()
│
├── crud-response-handler.js     # מערכת טיפול בתגובות CRUD
│   └── CRUDResponseHandler.handleDeleteResponse()
│
└── [page]-specific.js           # קבצי עמוד ספציפיים
    └── perform[Entity]Deletion() # פונקציית מחיקה ספציפית
```

---

## 🔧 יישום לפי עמוד

### 1. Trading Accounts (`trading_accounts.js`)

```javascript
async function performTradingAccountDeletion(accountId) {
    try {
        // Clear cache before deletion
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('accounts-data');
            await window.unifiedCacheManager.clearByPattern('account-balance-*');
            await window.unifiedCacheManager.clearByPattern('account-activity-*');
        }
        
        // Send delete request
        const response = await fetch(`/api/trading-accounts/${accountId}`, {
            method: 'DELETE'
        });
        
        // Use CRUDResponseHandler
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'חשבון מסחר נמחק בהצלחה',
            entityName: 'חשבון מסחר',
            reloadFn: window.loadTradingAccountsDataForTradingAccountsPage,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת חשבון מסחר');
    }
}

// Wrapper function with linked items check
async function checkLinkedItemsAndDeleteTradingAccount(tradingAccountId) {
  await window.checkLinkedItemsAndPerformAction('account', tradingAccountId, 'delete', performTradingAccountDeletion);
}
```

**חשוב:**
- ✅ סוג ישות: `'account'` (לא `'trading_account'`)
- ✅ URL: `/api/trading-accounts/` (עם מקף)
- ✅ `reloadFn`: `window.loadTradingAccountsDataForTradingAccountsPage`

---

### 2. Trades (`trades.js`)

```javascript
async function performTradeDeletion(tradeId) {
  try {
    if (window.unifiedCacheManager) {
      await window.unifiedCacheManager.clearByPattern('trades-data');
      await window.unifiedCacheManager.clearByPattern('dashboard-data');
    }
    const response = await fetch(`/api/trades/${tradeId}`, { method: 'DELETE' });
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'טרייד נמחק בהצלחה',
      entityName: 'טרייד',
      reloadFn: window.loadTradesData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טרייד');
  }
}
```

**Cache patterns:**
- `trades-data`
- `dashboard-data`

---

### 3. Trade Plans (`trade_plans.js`)

```javascript
async function performTradePlanDeletion(tradePlanId) {
    try {
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('trade-plans-data');
        }
        
        const response = await fetch(`/api/trade_plans/${tradePlanId}`, {
            method: 'DELETE'
        });
        
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'תוכנית מסחר נמחקה בהצלחה',
            entityName: 'תוכנית מסחר',
            reloadFn: window.loadTradePlansData,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת תוכנית מסחר');
    }
}
```

**Cache patterns:**
- `trade-plans-data`

---

### 4. Executions (`executions.js`)

```javascript
async function performExecutionDeletion(executionId) {
    try {
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('executions-data');
            await window.unifiedCacheManager.clearByPattern('dashboard-data');
            await window.unifiedCacheManager.clearByPattern('account-activity-data');
            await window.unifiedCacheManager.clearByPattern('account-activity-*');
            await window.unifiedCacheManager.clearByPattern('account-balance-*');
        }
        
        const response = await fetch(`/api/executions/${executionId}`, {
            method: 'DELETE'
        });
        
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'ביצוע נמחק בהצלחה',
            entityName: 'ביצוע',
            reloadFn: window.loadExecutionsData,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת ביצוע');
    }
}
```

**Cache patterns:**
- `executions-data`
- `dashboard-data`
- `account-activity-data`
- `account-activity-*`
- `account-balance-*`

---

### 5. Cash Flows (`cash_flows.js`)

```javascript
async function performCashFlowDeletion(id) {
  try {
    if (window.unifiedCacheManager) {
      await window.unifiedCacheManager.clearByPattern('cash-flows-data');
      await window.unifiedCacheManager.clearByPattern('account-activity-data');
      await window.unifiedCacheManager.clearByPattern('account-activity-*');
      await window.unifiedCacheManager.clearByPattern('account-balance-*');
    }
    
    const response = await fetch(`/api/cash_flows/${id}`, { method: 'DELETE' });
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'תזרים המזומנים נמחק בהצלחה!',
      entityName: 'תזרים מזומנים',
      reloadFn: window.loadCashFlowsData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת תזרים מזומנים');
  }
}
```

---

### 6. Alerts (`alerts.js` + `alert-service.js`)

```javascript
// alert-service.js
async function performAlertDeletion(alertId) {
  try {
    if (window.unifiedCacheManager) {
      await window.unifiedCacheManager.clearByPattern('alerts-data');
    }
    const response = await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'התראה נמחקה בהצלחה!',
      entityName: 'התראה',
      reloadFn: window.loadAlertsData,
      requiresHardReload: false
    });
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת התראה');
  }
}
```

---

### 7. Tickers (`tickers.js`)

```javascript
async function performTickerDeletion(tickerId) {
  try {
    if (window.unifiedCacheManager) {
      await window.unifiedCacheManager.clearByPattern('tickers-data');
      await window.unifiedCacheManager.clearByPattern('market-data');
    }
    
    const response = await fetch(`/api/tickers/${tickerId}`, { method: 'DELETE' });
    
    // Uses handleApiResponseWithRefresh instead of CRUDResponseHandler
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'מחיקה',
      itemName: 'הטיקר',
      successMessage: 'הטיקר נמחק בהצלחה',
      onSuccess: () => {
        if (typeof window.onTickerDeleted === 'function') {
          window.onTickerDeleted(tickerId);
        }
      }
    });
    
  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
  }
}
```

**הערה:** טיקר משתמש ב-`handleApiResponseWithRefresh` במקום `CRUDResponseHandler`.

---

### 8. Notes (`notes.js`)

```javascript
async function deleteNoteFromServer(noteId) {
  if (window.unifiedCacheManager) {
    await window.unifiedCacheManager.clearByPattern('notes-data');
  }
  
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      await CRUDResponseHandler.handleDeleteResponse(response, {
        successMessage: 'הערה נמחקה בהצלחה!',
        entityName: 'הערה',
        reloadFn: window.loadNotesData,
        requiresHardReload: false
      });
      return; // יציאה מוצלחת
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        CRUDResponseHandler.handleError(error, 'מחיקת הערה');
        return;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }
}
```

**הערה:** Notes כולל retry logic עם 3 ניסיונות.

---

## 🔍 בדיקת פריטים מקושרים

### שימוש ב-`checkLinkedItemsAndPerformAction`

```javascript
await window.checkLinkedItemsAndPerformAction(
  itemType,      // 'account', 'trade', 'execution', etc.
  itemId,        // ID של הפריט למחיקה
  'delete',      // הפעולה ('delete' או 'cancel')
  actionFunction // הפונקציה לביצוע הפעולה
);
```

### מיפוי סוגי ישויות

| סוג ישות ב-Frontend | סוג ישות ב-Backend |
|---------------------|-------------------|
| `'account'` | `'account'` |
| `'trade'` | `'trade'` |
| `'execution'` | `'execution'` |
| `'cash_flow'` | `'cash_flow'` |
| `'alert'` | `'alert'` |
| `'ticker'` | `'ticker'` |
| `'note'` | `'note'` |
| `'trade_plan'` | `'trade_plan'` |

**חשוב:** Trading Accounts משתמש ב-`'account'` ולא ב-`'trading_account'`!

---

## 🧹 ניקוי מטמון

### Cache Patterns לפי עמוד

| עמוד | Cache Patterns |
|------|---------------|
| **Trading Accounts** | `accounts-data`, `account-balance-*`, `account-activity-*` |
| **Trades** | `trades-data`, `dashboard-data` |
| **Trade Plans** | `trade-plans-data` |
| **Executions** | `executions-data`, `dashboard-data`, `account-activity-data`, `account-activity-*`, `account-balance-*` |
| **Cash Flows** | `cash-flows-data`, `account-activity-data`, `account-activity-*`, `account-balance-*` |
| **Alerts** | `alerts-data` |
| **Tickers** | `tickers-data`, `market-data` |
| **Notes** | `notes-data` |

---

## 📝 תבנית סטנדרטית

```javascript
async function perform[Entity]Deletion(entityId) {
    try {
        // 1. Clear cache before deletion
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('[entity]-data');
            // Additional patterns if needed
        }
        
        // 2. Send delete request
        const response = await fetch(`/api/[entities]/${entityId}`, {
            method: 'DELETE'
        });
        
        // 3. Use CRUDResponseHandler for consistent response handling
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: '[Entity] נמחק בהצלחה',
            entityName: '[Entity]',
            reloadFn: window.load[Entity]Data,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת [Entity]');
    }
}
```

---

## ✅ דרישות יישום

### 1. טעינת קבצים נדרשים

```html
<!-- חייב להיות בטעינה לפני trading_accounts.js -->
<script src="scripts/linked-items.js"></script>
<script src="scripts/crud-response-handler.js"></script>
<script src="scripts/trading_accounts.js"></script>
```

### 2. Export לפונקציות גלובליות

```javascript
window.perform[Entity]Deletion = perform[Entity]Deletion;
window.checkLinkedItemsAndDelete[Entity] = checkLinkedItemsAndDelete[Entity];
```

### 3. שימוש ב-Actions Menu

```javascript
{
    type: 'DELETE',
    onclick: `window.delete[Entity]WithLinkedItemsCheck && window.delete[Entity]WithLinkedItemsCheck(${entityId})`,
    title: 'מחק'
}
```

---

## 🔗 קישורים קשורים

- [Linked Items System](../entity-details-system/LINKED_ITEMS_SYSTEM.md)
- [CRUD Response Handler](../CRUD_RESPONSE_HANDLER.md)
- [Unified Cache System](../UNIFIED_CACHE_SYSTEM.md)

---

## 📅 היסטוריית שינויים

| תאריך | גרסה | תיאור |
|-------|------|-------|
| 2 נובמבר 2025 | 1.0.0 | יצירת תיעוד ראשוני |



