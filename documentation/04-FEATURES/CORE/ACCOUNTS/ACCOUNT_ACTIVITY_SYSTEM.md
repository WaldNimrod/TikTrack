# Account Activity System - TikTrack
# מערכת תנועות חשבון

**תאריך יצירה:** 1 בנובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש  
**מטרה:** הצגת תנועות חשבון (תזרימי מזומנים + ביצועים) עם תמיכה במטבעות מרובים

---

## 📋 סקירה כללית

מערכת תנועות חשבון מציגה את כל התנועות הכספיות בחשבון מסחר, כולל:
- **תזרימי מזומנים** (cash flows): הפקדות, משיכות, העברות, עמלות, דיבידנדים, ריבית
- **ביצועים** (executions): קניות ומכירות של נכסים

המערכת מספקת:
- **קיבוץ לפי מטבע** - תמיכה מלאה במטבעות מרובים באותו חשבון
- **חישוב יתרות בזמן אמת** - יתרות מחושבות מהנתונים המקוריים, ללא שמירה בבסיס נתונים
- **יתרה ראשית במטבע בסיס** - יתרה כוללת במטבע הבסיס של החשבון
- **יתרה פר מטבע** - תמיכה ב-4 מטבעות (USD, EUR, ILS, GBP) - כל מטבע עם יתרה נפרדת
- **המרה למטבע בסיס** - הצגת סה"כ במטבע הבסיס של החשבון
- **אינטגרציה מלאה** - עם מערכות קיימות (מטמון, פילטרים, EntityDetailsModal)

## שינוי ארכיטקטוני חשוב - הסרת cash_balance

**תאריך שינוי:** 1 בנובמבר 2025  
**גרסה:** 1.1.0

השדה `cash_balance` הוסר מהטבלה `trading_accounts` ומהמודל `TradingAccount`. היתרה מחושבת כעת **בזמן אמת** דרך `AccountActivityService` ומתואמת ב-memory cache.

**יתרונות:**
- ✅ נתונים תמיד מדויקים - תמיד מחושב מהמקור
- ✅ אין סיכון לאי-סינכרון
- ✅ פשוט יותר לתחזוקה - קוד אחד במקום 6 נקודות עדכון
- ✅ עקבי עם עקרון "לא לשמור תוצאות חישוב"

**שימוש:**
- Endpoint: `GET /api/account-activity/<account_id>/balances`
- מחזיר: `base_currency_total` + `balances_by_currency`

---

## 🏗️ ארכיטקטורה

### Backend Components

#### 1. Service Layer
**קובץ:** `Backend/services/account_activity_service.py`

**פונקציות עיקריות:**
- `get_account_activity()` - שליפת כל התנועות לפי מטבע
- `calculate_balance_by_currency()` - חישוב יתרה למטבע ספציפי
- `get_movements_timeline()` - timeline כרונולוגי של תנועות

**אלגוריתם חישוב יתרה:**
```python
# Cash Flows
if type in ['deposit', 'dividend', 'interest']:
    balance += amount
elif type in ['withdrawal', 'fee']:
    balance -= amount

# Executions
if action == 'buy':
    balance -= (price * quantity + fee)
elif action == 'sell':
    balance += (price * quantity - fee)
```

#### 2. API Endpoints
**קובץ:** `Backend/routes/api/account_activity.py`

**Endpoints:**
- `GET /api/account-activity/<account_id>` - תנועות חשבון עם אפשרות פילטרים
- `GET /api/account-activity/<account_id>/balance/<currency_id>` - יתרה למטבע ספציפי
- `GET /api/account-activity/<account_id>/timeline` - timeline כרונולוגי

**Query Parameters:**
- `start_date` (optional): תאריך התחלה (YYYY-MM-DD)
- `end_date` (optional): תאריך סיום (YYYY-MM-DD)

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "account_id": 1,
    "account_name": "Interactive Brokers",
    "base_currency_id": 1,
    "base_currency": "USD",
    "currencies": [
      {
        "currency_id": 1,
        "currency_symbol": "USD",
        "currency_name": "US Dollar",
        "balance": 10500.50,
        "movements": [...]
      }
    ],
    "base_currency_total": 12350.75,
    "exchange_rates_used": {
      "ILS": 3.65,
      "EUR": 0.85
    }
  }
}
```

### Frontend Components

#### 1. HTML Structure
**קובץ:** `trading-ui/trading_accounts.html`

**מבנה הסקשן:**
```html
<div class="bottom-section" data-section="account-activity">
  <!-- Header עם בחירת חשבון -->
  <!-- Summary עם סטטיסטיקות -->
  <!-- Table עם תנועות -->
  <!-- Footer עם סיכומי מטבעות -->
</div>
```

#### 2. JavaScript Logic
**קובץ:** `trading-ui/scripts/account-activity.js`

**פונקציות עיקריות:**
- `initAccountActivity()` - אתחול המערכת
- `loadAccountActivity(accountId)` - טעינת נתונים מה-API
- `populateAccountActivityTable(data)` - מילוי הטבלה
- `renderMovementRow(movement, balance)` - רנדור שורת תנועה
- `updateCurrencyBalancesFooter(data)` - עדכון סיכומי מטבעות
- `openMovementDetails(movementId, movementType)` - פתיחת פרטים

**עמודות טבלה:**
1. תאריך
2. סוג (תזרים/ביצוע)
3. תת-סוג (deposit/buy/sell/...)
4. טיקר (רק לביצועים)
5. סכום
6. מטבע
7. יתרה שוטפת
8. פעולות (כפתור "פרטים")

---

## 💾 Cache Strategy

### Cache Policy
**קובץ:** `trading-ui/scripts/unified-cache-manager.js`

```javascript
'account-activity-data': {
  layer: 'backend',
  ttl: 60000, // 1 דקה
  dependencies: ['accounts-data', 'cash-flows-data', 'executions-data']
}
'account-activity-*': {
  layer: 'backend',
  ttl: 60000 // 1 דקה
}
```

### Cache Invalidation
**קובץ:** `trading-ui/scripts/cache-sync-manager.js`

**Invalidation Patterns:**
- `cash-flow-created` → invalidate `account-activity-data`, `account-activity-*`
- `cash-flow-updated` → invalidate `account-activity-data`, `account-activity-*`
- `cash-flow-deleted` → invalidate `account-activity-data`, `account-activity-*`
- `execution-created` → invalidate `account-activity-data`, `account-activity-*`
- `execution-updated` → invalidate `account-activity-data`, `account-activity-*`
- `execution-deleted` → invalidate `account-activity-data`, `account-activity-*`

---

## 🌍 תמיכה במטבעות מרובים

### הבעיה
חשבון מסחר יכול להחזיק נכסים בכמה מטבעות:
- **מטבע בסיס:** המטבע הראשי של החשבון (מוגדר ב-`trading_accounts.currency_id`)
- **מטבעות נוספים:** מטבעות של נכסים שנקנו (מוגדרים ב-`tickers.currency_id`)

### הפתרון
1. **קיבוץ לפי מטבע:** כל תנועה מקושרת למטבע שלה
2. **חישוב יתרה לכל מטבע:** יתרה נפרדת לכל מטבע
3. **המרה למטבע בסיס:** סיכום כל היתרות במטבע הבסיס (זמנית - עד לאינטגרציה עם שערי מטבע)

### הצגה בטבלה
```
┌──────────────────────────────────────────┐
│ USD: $10,500.50                          │
│ ILS: ₪5,200.00                          │
│ EUR: €1,250.75                          │
├──────────────────────────────────────────┤
│ סה"כ במטבע בסיס (USD): $12,350.75      │
│ (לפי שער: ILS=3.65, EUR=0.85)          │
└──────────────────────────────────────────┘
```

### Placeholder להמרת מטבע
כרגע, ההמרה למטבע בסיס משתמשת בשערים מהטבלת `currencies` (field `usd_rate`).

**עתיד:** לאחר אינטגרציה עם מערכת שערי מטבע החיצונית:
- שימוש ב-`/api/currency-rates/convert` להמרה עדכנית
- הצגת שערים היסטוריים לתאריך כל תנועה
- רענון אוטומטי של שערים כל 5 דקות

---

## 🔗 אינטגרציות

### 1. EntityDetailsModal
פתיחת פרטי תנועה דרך כפתור "פרטים":
```javascript
openMovementDetails(movementId, movementType)
// entityType: 'cash_flow' או 'execution'
```

### 2. UnifiedCacheManager
שימוש במטמון backend עם TTL של 1 דקה:
```javascript
const cached = await window.UnifiedCacheManager.get(cacheKey);
```

### 3. Filter System
הפילטר הראשי בעמוד (`header-system.js`) מסנן את רשומות הטבלה אוטומטית.

### 4. Account Selector
בחירת חשבון מתוך רשימת החשבונות הקיימים:
```javascript
populateAccountSelector() // ממלא את ה-selector
```

---

## 📊 דוגמת שימוש

### טעינת תנועות חשבון
```javascript
// אוטומטי - נטען בעת בחירת חשבון
// או ידני:
await loadAccountActivity(accountId);
```

### קבלת נתונים מה-API
```javascript
const response = await fetch(`/api/account-activity/${accountId}?start_date=2025-01-01&end_date=2025-12-31`);
const result = await response.json();
```

### פתיחת פרטי תנועה
```javascript
openMovementDetails(123, 'cash_flow'); // תזרים מזומנים
openMovementDetails(456, 'execution'); // ביצוע
```

---

## 🔄 תזרימי נתונים

```
User selects account
       ↓
Frontend: loadAccountActivity()
       ↓
Check Cache (60s TTL)
       ↓
[Cache Hit] → Display data
[Cache Miss] → API Call
       ↓
Backend: AccountActivityService.get_account_activity()
       ↓
Query cash_flows + executions
       ↓
Group by currency_id
       ↓
Calculate balances
       ↓
Convert to base currency (via currencies.usd_rate)
       ↓
Return JSON
       ↓
Frontend: populateAccountActivityTable()
       ↓
Cache result
       ↓
Display in table
```

---

## ⚠️ הערות חשובות

### 1. אין שמירת נתונים מחושבים
- יתרות מחושבות בזמן אמת מהטבלאות הקיימות
- לא נשמר `account_balances` או טבלאות מחושבות אחרות
- כל חישוב הוא לפי הנתונים המקוריים

### 2. תאריכים
- תזרימי מזומנים: `Date` (תאריך בלבד)
- ביצועים: `DateTime` (תאריך + שעה)
- מיון כרונולוגי: לפי תאריך (וביצועים לפי שעה)

### 3. מטבע ביצועים
- אם לביצוע יש `ticker.currency_id` → משתמש במטבע הטיקר
- אחרת → משתמש במטבע הבסיס של החשבון

### 4. Cache Invalidation
- בעת יצירה/עדכון/מחיקה של תזרים מזומנים → invalidate cache
- בעת יצירה/עדכון/מחיקה של ביצוע → invalidate cache
- בעת שינוי חשבון → reload data

---

## 🚀 עתיד

### שלב 2: אינטגרציה עם שערי מטבע
- שימוש ב-`/api/currency-rates/convert` להמרה עדכנית
- הצגת שערים היסטוריים לכל תנועה
- רענון אוטומטי כל 5 דקות

### שלב 3: תכונות נוספות
- ייצוא ל-Excel/CSV
- גרפים של תנועות לפי זמן
- סינון מתקדם (סוג תנועה, טיקר, טווח סכומים)
- חיפוש בתנועות

---

## 📁 קבצים רלוונטיים

### Backend
- `Backend/services/account_activity_service.py` - שירות חישוב יתרות
- `Backend/routes/api/account_activity.py` - API endpoints
- `Backend/models/trading_account.py` - מודל חשבון
- `Backend/models/cash_flow.py` - מודל תזרים מזומנים
- `Backend/models/execution.py` - מודל ביצוע

### Frontend
- `trading-ui/trading_accounts.html` - מבנה HTML
- `trading-ui/scripts/account-activity.js` - לוגיקת JavaScript
- `trading-ui/scripts/unified-cache-manager.js` - מדיניות מטמון
- `trading-ui/scripts/cache-sync-manager.js` - invalidation patterns

### Documentation
- `documentation/04-FEATURES/CORE/external_data/CURRENCY_RATES_INTEGRATION_REQUIREMENTS.md` - דרישות אינטגרציה שערי מטבע

---

**מפתח אחראי:** TikTrack Development Team  
**תאריך עדכון אחרון:** 1 בנובמבר 2025


