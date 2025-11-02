# Total Balance Calculation - חישוב יתרה כללית
# =============================================

**תאריך יצירה:** 2 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מיושם בעמוד חשבונות מסחר  

---

## 📋 סקירה כללית

מערכת לחישוב ותצוגת יתרה כללית של כל חשבונות המסחר במטבע בסיס.

### תכונות עיקריות:
- ✅ טעינת יתרות מכל החשבונות בבת אחת (Batch)
- ✅ חישוב יתרה מצטברת במטבע בסיס
- ✅ המרת מטבע אוטומטית (USD, ILS, EUR, GBP, JPY)
- ✅ תצוגה דינמית בסיכום העמוד
- ✅ Fallback לחישוב ידני אם מערכת סיכום לא זמינה

---

## 🏗️ ארכיטקטורה

### קבצים מעורבים

```
trading-ui/scripts/
├── trading_accounts.js
│   ├── updateTradingAccountsSummary()        # פונקציה ראשית לעדכון סיכום
│   ├── loadAccountBalancesBatch()            # טעינת יתרות בבת אחת
│   └── loadAccountBalance()                 # טעינת יתרה בודדת
│
└── info-summary-system.js                    # מערכת סיכום נתונים מאוחדת
    └── InfoSummarySystem.calculateAndRender()

Backend/
└── routes/api/account_activity.py
    └── /api/account-activity/<account_id>/balances
```

---

## 🔧 יישום

### 1. פונקציה ראשית: `updateTradingAccountsSummary()`

```javascript
async function updateTradingAccountsSummary(trading_accounts) {
  try {
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.trading_accounts;
      await window.InfoSummarySystem.calculateAndRender(trading_accounts, config);
    } else {
      // מערכת סיכום נתונים לא זמינה - חישוב ידני
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement && trading_accounts) {
        // ... חישוב ידני (ראה למטה)
      }
    }
  } catch (error) {
    window.Logger?.error('❌ שגיאה ב-updateTradingAccountsSummary:', error);
  }
}
```

### 2. חישוב ידני (Fallback)

```javascript
// חישוב סטטיסטיקות בסיסיות
const totalAccounts = trading_accounts.length;
const activeAccounts = trading_accounts.filter(acc => acc.status === 'open').length;
const openAccounts = trading_accounts.filter(acc => acc.status === 'open').length;

// טעינת יתרות מכל החשבונות
let balancesMap = new Map();
const accountIds = trading_accounts.map(acc => acc.id);

if (typeof window.loadAccountBalancesBatch === 'function') {
  balancesMap = await window.loadAccountBalancesBatch(accountIds);
} else if (typeof loadAccountBalancesBatch === 'function') {
  balancesMap = await loadAccountBalancesBatch(accountIds);
}

// חישוב סה"כ יתרה במטבע בסיס
let totalBaseCurrencyBalance = 0;
let baseCurrencySymbol = '$';

// Helper function to convert currency code to symbol
const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode || currencyCode.length <= 1) return currencyCode || '$';
  switch (currencyCode.toUpperCase()) {
    case 'USD': return '$';
    case 'ILS': return '₪';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return currencyCode;
  }
};

// חישוב יתרה מצטברת
trading_accounts.forEach(account => {
  const balanceData = balancesMap.get(account.id);
  if (balanceData) {
    totalBaseCurrencyBalance += balanceData.base_currency_total || 0;
    if (balanceData.base_currency) {
      baseCurrencySymbol = getCurrencySymbol(balanceData.base_currency);
    }
  }
});

// עדכון התצוגה
summaryStatsElement.innerHTML = `
  <div>סה"כ חשבונות: <strong id="totalAccounts">${totalAccounts}</strong></div>
  <div>חשבונות פעילים: <strong id="activeAccounts">${activeAccounts}</strong></div>
  <div>חשבונות פתוחים: <strong id="openAccounts">${openAccounts}</strong></div>
  <div>סה"כ יתרה: <strong id="totalBalance">${window.renderAmount ? window.renderAmount(totalBaseCurrencyBalance, baseCurrencySymbol) : `${totalBaseCurrencyBalance.toFixed(2)} ${baseCurrencySymbol}`}</strong></div>
`;
```

---

## 📊 טעינת יתרות

### `loadAccountBalancesBatch()`

```javascript
async function loadAccountBalancesBatch(accountIds) {
  const balanceMap = new Map();
  if (!accountIds || accountIds.length === 0) {
    return balanceMap;
  }
  
  // Load balances in parallel using Promise.all
  const promises = accountIds.map(async (accountId) => {
    const balance = await loadAccountBalance(accountId);
    if (balance) {
      balanceMap.set(accountId, balance);
    }
  });
  
  await Promise.all(promises);
  return balanceMap;
}
```

### `loadAccountBalance()`

```javascript
async function loadAccountBalance(accountId) {
  try {
    const response = await fetch(`/api/account-activity/${accountId}/balances`);
    if (response.ok) {
      const data = await response.json();
      return data; // { base_currency_total, base_currency, ... }
    }
  } catch (error) {
    window.Logger?.error(`Error loading balance for account ${accountId}:`, error);
  }
  return null;
}
```

---

## 🎯 נקודות קריאה

### 1. טעינת עמוד ראשונית

```javascript
// trading_accounts.js - loadTradingAccountsDataForTradingAccountsPage()
window.loadTradingAccountsDataForTradingAccountsPage = async function() {
  // ... טעינת נתונים
  
  // עדכון סטטיסטיקות
  if (typeof window.updateTradingAccountsSummary === 'function') {
    await window.updateTradingAccountsSummary(filteredTradingAccounts);
  }
};
```

### 2. עדכון טבלה

```javascript
// trading_accounts.js - updateTradingAccountsTable()
async function updateTradingAccountsTable(trading_accounts) {
  // ... עדכון טבלה
  
  // עדכון סיכום (async, לא חוסם)
  updateTradingAccountsSummary(accountsData).catch(err => {
    window.Logger.error('❌ שגיאה בעדכון סיכום:', err);
  });
}
```

---

## 🔍 מבנה נתוני יתרה

### תגובת API: `/api/account-activity/<account_id>/balances`

```json
{
  "base_currency_total": 15000.50,
  "base_currency": "USD",
  "cash_balance": 5000.00,
  "total_value": 20000.50,
  "unrealized_pl": 1000.00,
  "realized_pl": 500.00
}
```

### מיפוי מטבעות

| קוד מטבע | סמל |
|----------|-----|
| USD | $ |
| ILS | ₪ |
| EUR | € |
| GBP | £ |
| JPY | ¥ |

---

## 📝 HTML Structure

```html
<div class="info-summary" id="summaryStats">
  <div>סה"כ חשבונות: <strong id="totalAccounts">0</strong></div>
  <div>חשבונות פעילים: <strong id="activeAccounts">0</strong></div>
  <div>חשבונות פתוחים: <strong id="openAccounts">0</strong></div>
  <div>סה"כ יתרה: <strong id="totalBalance">$0</strong></div>
</div>
```

---

## ⚠️ טיפול בשגיאות

### 1. מערכת סיכום לא זמינה

```javascript
if (!window.InfoSummarySystem || !window.INFO_SUMMARY_CONFIGS) {
  // Fallback לחישוב ידני
}
```

### 2. טעינת יתרות נכשלה

```javascript
try {
  balancesMap = await window.loadAccountBalancesBatch(accountIds);
} catch (balanceError) {
  window.Logger?.error('❌ שגיאה בטעינת יתרות לסיכום:', balanceError);
  // המשך עם balancesMap ריק - זה בסדר, נציג 0
}
```

### 3. אלמנט לא נמצא

```javascript
const summaryStatsElement = document.getElementById('summaryStats');
if (!summaryStatsElement) {
  // לא מוצג - הדף לא נטען עדיין או מבנה שונה
  return;
}
```

---

## 🔗 אינטגרציה עם מערכת סיכום מאוחדת

### קונפיגורציה: `info-summary-configs.js`

```javascript
const INFO_SUMMARY_CONFIGS = {
  trading_accounts: {
    containerId: 'summaryStats',
    stats: [
      {
        id: 'totalAccounts',
        label: 'סה"כ חשבונות',
        calculator: 'count'
      },
      {
        id: 'openAccounts',
        label: 'חשבונות פתוחים',
        calculator: 'countByStatus',
        params: { status: 'open' }
      },
      {
        id: 'totalBalance',
        label: 'סה"כ יתרה',
        calculator: 'sumField',
        params: { field: 'balance' },
        formatter: 'currency'
      }
    ]
  }
};
```

---

## ✅ בדיקות

### בדיקה ידנית

1. פתח עמוד חשבונות מסחר
2. בדוק שסיכום הנתונים מוצג בראש העמוד
3. בדוק שהיתרה הכללית מעודכנת ומדויקת
4. נסה להוסיף/למחוק חשבון ובדוק שהיתרה מתעדכנת

### בדיקה בקונסולה

```javascript
// בדיקת פונקציות
typeof window.updateTradingAccountsSummary  // "function"
typeof window.loadAccountBalancesBatch      // "function"

// בדיקת אלמנט
document.getElementById('summaryStats')     // HTMLElement

// בדיקת עדכון
document.getElementById('totalBalance').textContent  // "$15,000.50"
```

---

## 🔗 קישורים קשורים

- [Account Balance Service](./ACCOUNT_BALANCE_SERVICE.md)
- [Info Summary System](../../INFO_SUMMARY_SYSTEM.md)
- [Unified Cache System](../../UNIFIED_CACHE_SYSTEM.md)

---

## 📅 היסטוריית שינויים

| תאריך | גרסה | תיאור |
|-------|------|-------|
| 2 נובמבר 2025 | 1.0.0 | יצירת תיעוד ראשוני |





