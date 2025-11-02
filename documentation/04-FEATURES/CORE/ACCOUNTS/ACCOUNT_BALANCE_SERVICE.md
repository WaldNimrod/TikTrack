# Account Balance Service - TikTrack

**תאריך יצירה:** נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש

---

## 📋 סקירה כללית

`AccountBalanceService` הוא service מרכזי שנועד לספק גישה נוחה ומהירה ליתרות חשבונות מסחר בכל המערכת, ללא צורך לטעון את כל הקוד של החישוב בכל עמוד.

### 🎯 מטרות:
1. **גישה מרכזית** - נקודה אחת לכל הטעינה של יתרות
2. **Cache אוטומטי** - שימוש ב-`UnifiedCacheManager` לניהול cache
3. **Batch Loading** - טעינה יעילה של מספר חשבונות במקביל
4. **API פשוט** - ממשק נקי ונוח לשימוש
5. **אינטגרציה** - עובד אוטומטית עם cache invalidation

---

## 📦 מיקום בקוד

**קובץ:** `trading-ui/scripts/services/account-balance-service.js`  
**Package:** `services` (אופציונלי - לא נטען אוטומטית, צריך לבקש במפורש)

---

## 🚀 שימוש בסיסי

### טעינת יתרה בודדת

```javascript
// יתרה עבור חשבון בודד
const balance = await AccountBalanceService.getBalance(1);

if (balance) {
    console.log(`Balance: ${balance.base_currency_total} ${balance.base_currency}`);
    console.log(`Balances by currency:`, balance.balances_by_currency);
}
```

### טעינת מספר יתרות (batch - מומלץ)

```javascript
// טעינה יעילה של מספר חשבונות במקביל
const balances = await AccountBalanceService.getBalances([1, 2, 3]);

balances.forEach((balance, accountId) => {
    console.log(`Account ${accountId}: ${balance.base_currency_total} ${balance.base_currency}`);
});
```

---

## 📊 מבנה הנתונים המוחזר

```javascript
{
    account_id: 1,
    account_name: "חשבון מעודכן",
    base_currency_total: 10000.50,      // יתרה כוללת במטבע בסיס
    base_currency: "USD",               // סימבול מטבע בסיס
    base_currency_id: 1,                // ID מטבע בסיס
    balances_by_currency: [            // יתרות לפי מטבע
        {
            currency_id: 1,
            currency_symbol: "USD",
            currency_name: "US Dollar",
            balance: 10000.50
        },
        {
            currency_id: 2,
            currency_symbol: "ILS",
            currency_name: "Israeli Shekel",
            balance: 35000.00
        }
    ],
    exchange_rates_used: {              // שערי חליפין used
        "ILS": 3.5
    }
}
```

---

## 🔧 API מלא

### `getBalance(accountId, options)`

טעינת יתרה עבור חשבון בודד.

**פרמטרים:**
- `accountId` (number) - ID של חשבון מסחר
- `options` (object, optional):
  - `useCache` (boolean, default: `true`) - האם להשתמש ב-cache
  - `forceRefresh` (boolean, default: `false`) - האם לעקוף cache ולטעון מחדש

**החזרות:**
- `Promise<Object|null>` - נתוני יתרה או `null` במקרה של שגיאה

**דוגמאות:**

```javascript
// שימוש רגיל (עם cache)
const balance = await AccountBalanceService.getBalance(1);

// רענון ידני (עוקף cache)
const freshBalance = await AccountBalanceService.getBalance(1, { 
    forceRefresh: true 
});

// בלי cache כלל
const balance = await AccountBalanceService.getBalance(1, { 
    useCache: false 
});
```

---

### `getBalances(accountIds, options)`

טעינת יתרות עבור מספר חשבונות (batch loading - יעיל יותר).

**פרמטרים:**
- `accountIds` (Array<number>) - מערך של IDs של חשבונות מסחר
- `options` (object, optional) - כמו `getBalance`

**החזרות:**
- `Promise<Map<number, Object>>` - Map של `accountId -> balance data`

**דוגמה:**

```javascript
const balances = await AccountBalanceService.getBalances([1, 2, 3]);

// שימוש ב-Map
balances.forEach((balance, accountId) => {
    console.log(`Account ${accountId}: ${balance.base_currency_total}`);
});

// המרה ל-Array אם צריך
const balanceArray = Array.from(balances.entries());
```

---

### `refreshBalance(accountId)`

רענון יתרה (נקיית cache וטעינה מחדש).

**פרמטרים:**
- `accountId` (number) - ID של חשבון מסחר

**החזרות:**
- `Promise<Object|null>` - נתוני יתרה מעודכנים

**דוגמה:**

```javascript
// אחרי יצירת execution או cash flow
await AccountBalanceService.refreshBalance(1);
```

---

### `refreshBalances(accountIds)`

רענון מספר יתרות (batch).

**פרמטרים:**
- `accountIds` (Array<number>) - מערך של IDs של חשבונות מסחר

**החזרות:**
- `Promise<Map<number, Object>>` - Map של `accountId -> balance data`

---

### `clearCache(accountId)`

נקיית cache עבור חשבון ספציפי.

**פרמטרים:**
- `accountId` (number) - ID של חשבון מסחר

**החזרות:**
- `Promise<boolean>` - האם הניקוי הצליח

**דוגמה:**

```javascript
// נקיית cache ידנית (לרוב לא נדרש - cache מתנקה אוטומטית)
await AccountBalanceService.clearCache(1);
```

---

### `clearCaches(accountIds)`

נקיית cache עבור מספר חשבונות.

**פרמטרים:**
- `accountIds` (Array<number>) - מערך של IDs של חשבונות מסחר

**החזרות:**
- `Promise<number>` - מספר חשבונות שנוקו בהצלחה

---

## 🔄 Cache Management

השירות משתמש ב-`UnifiedCacheManager` לניהול cache אוטומטי:

- **Cache Key:** `account-balance-{accountId}`
- **TTL:** 60 שניות (1 minute)
- **Layer:** `backend` (עם TTL בשרת)

### Cache Invalidation

ה-cache מתנקה אוטומטית כאשר:
- נוצר/מתעדכן/נמחק `execution`
- נוצר/מתעדכן/נמחק `cash_flow`
- מתעדכן `trading_account`

**דוגמה לשימוש ב-invalidation:**

```javascript
// אחרי יצירת execution
await createExecution(executionData);
// Cache יתנקה אוטומטית דרך CacheSyncManager
```

---

## 📝 דוגמאות שימוש בעמודים

### עמוד Dashboard

```javascript
// טעינת יתרות לכל החשבונות
async function loadDashboardBalances() {
    const accounts = await getAccounts(); // פונקציה קיימת
    const accountIds = accounts.map(acc => acc.id);
    
    const balances = await AccountBalanceService.getBalances(accountIds);
    
    // חישוב סה"כ יתרה
    let totalBalance = 0;
    balances.forEach((balance) => {
        totalBalance += balance.base_currency_total;
    });
    
    return totalBalance;
}
```

### עמוד Trades

```javascript
// הצגת יתרה בטבלת טריידים
async function updateTradeTable(trades) {
    // אסוף את כל ה-account IDs מהטריידים
    const accountIds = [...new Set(trades.map(t => t.trading_account_id))];
    
    // טען את כל היתרות בבת אחת
    const balances = await AccountBalanceService.getBalances(accountIds);
    
    // עדכן את הטבלה
    trades.forEach(trade => {
        const balance = balances.get(trade.trading_account_id);
        if (balance) {
            // הצג את היתרה בטבלה
            updateTradeRow(trade, balance);
        }
    });
}
```

### עמוד Trading Accounts

```javascript
// עדכון טבלת חשבונות עם יתרות
async function updateAccountsTable(accounts) {
    const accountIds = accounts.map(acc => acc.id);
    
    // שימוש ב-service במקום הפונקציות הישנות
    const balances = await AccountBalanceService.getBalances(accountIds);
    
    accounts.forEach(account => {
        const balance = balances.get(account.id);
        if (balance) {
            account.current_balance = balance.base_currency_total;
            account.currency_symbol = balance.base_currency;
        }
    });
    
    renderAccountsTable(accounts);
}
```

---

## 🔌 Integration עם Pages

### הוספת ה-Service לעמוד

1. **הוספה ל-Package Manifest:**
   - ה-service כבר מוגדר ב-`services` package
   - אם העמוד כבר משתמש ב-`services` package - לא צריך לעשות כלום

2. **הוספה ל-HTML:**
   ```html
   <!-- אם services package לא נטען -->
   <script src="scripts/services/account-balance-service.js?v=1.0.0"></script>
   ```

3. **שימוש בקוד:**
   ```javascript
   // בדיקה אם ה-service זמין
   if (window.AccountBalanceService) {
       const balance = await window.AccountBalanceService.getBalance(1);
   }
   ```

---

## ⚡ ביצועים

### Batch Loading vs Single Loading

**מומלץ:** להשתמש ב-`getBalances()` עבור מספר חשבונות:

```javascript
// ❌ לא יעיל - 3 קריאות API נפרדות
const balance1 = await AccountBalanceService.getBalance(1);
const balance2 = await AccountBalanceService.getBalance(2);
const balance3 = await AccountBalanceService.getBalance(3);

// ✅ יעיל - 3 קריאות במקביל + cache
const balances = await AccountBalanceService.getBalances([1, 2, 3]);
```

### Cache Hit Rate

ה-service מנהל cache אוטומטי עם TTL של 60 שניות. אם אתה קורא ל-`getBalance()` מספר פעמים בתוך 60 שניות, רק הקריאה הראשונה תגיע לשרת.

---

## 🔍 Debugging

### בדיקת זמינות Service

```javascript
if (window.AccountBalanceService) {
    console.log('✅ AccountBalanceService available');
} else {
    console.warn('⚠️ AccountBalanceService not loaded');
}
```

### בדיקת Cache

```javascript
if (window.UnifiedCacheManager) {
    const cached = await window.UnifiedCacheManager.get('account-balance-1');
    console.log('Cached balance:', cached);
}
```

---

## 📚 Related Documentation

- [Account Activity System](./ACCOUNT_ACTIVITY_SYSTEM.md) - מערכת חישוב היתרות
- [Unified Cache System](../../../02-ARCHITECTURE/FRONTEND/UNIFIED_CACHE_SYSTEM.md) - מערכת ה-cache
- [Services Architecture](../../../frontend/SERVICES_ARCHITECTURE.md) - ארכיטקטורת Services

---

## 🎯 Migration מ-Code קיים

אם יש לך קוד קיים שמשתמש ב-`loadAccountBalance` או `loadAccountBalancesBatch`:

### לפני:
```javascript
// trading_accounts.js
const balance = await loadAccountBalance(1);
const balances = await loadAccountBalancesBatch([1, 2, 3]);
```

### אחרי:
```javascript
// בכל מקום במערכת
const balance = await AccountBalanceService.getBalance(1);
const balances = await AccountBalanceService.getBalances([1, 2, 3]);
```

**יתרונות:**
- ✅ קוד אחיד בכל המערכת
- ✅ Cache management אוטומטי
- ✅ אינטגרציה עם cache invalidation
- ✅ API עקבי עם שאר ה-services

---

## 📝 סיכום

`AccountBalanceService` מספק פתרון מרכזי ונוח לטעינת יתרות חשבונות בכל המערכת. השירות מטפל בכל הפרטים הטכניים (cache, batch loading, error handling) ומספק API פשוט ונקי לשימוש.

**עקרון השימוש:** כל עמוד שמציג יתרות חשבון צריך להשתמש ב-`AccountBalanceService` במקום לייצר קוד מקומי.





