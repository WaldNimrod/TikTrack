# תיעוד מעבר למערכת מטבעות מרכזית - TikTrack

## סקירה כללית

מסמך זה מתעד את השינויים הנדרשים במעבר מאחסון שם מטבע כמחרוזת לשימוש במזהה מטבע מטבלת מטבעות מרכזית.

## שינויים שבוצעו

### 1. יצירת טבלת מטבעות חדשה ✅

**קובץ**: `Backend/models/currency.py`
**תיאור**: מודל חדש לטבלת מטבעות עם השדות:
- `id`: מזהה ראשי
- `symbol`: סמל המטבע (USD, EUR, ILS)
- `name`: שם המטבע בעברית
- `usd_rate`: שער חליפין ביחס לדולר
- `created_at`: תאריך יצירה

**Migration**: `Backend/migrations/create_currencies_table.py`

### 2. עדכון מודל החשבונות ✅

**קובץ**: `Backend/models/account.py`
**שינויים**:
- החלפת `currency` (String) ב-`currency_id` (Integer + ForeignKey)
- הוספת relationship למודל Currency
- עדכון `to_dict()` להחזיר גם currency_id וגם פרטי המטבע
- עדכון `__repr__()` ו-`get_balance_info()` להשתמש ב-currency.symbol

**Migration**: `Backend/migrations/update_accounts_currency.py`

### 3. עדכון מודל הטיקרים ✅

**קובץ**: `Backend/models/ticker.py`
**שינויים**:
- החלפת `currency` (String) ב-`currency_id` (Integer + ForeignKey)
- הוספת relationship למודל Currency
- עדכון התיעוד והדוגמאות

**Migration**: `Backend/migrations/update_tickers_currency.py`

## שינויים נדרשים בהמשך

### 4. עדכון Services 🔄

#### AccountService (`Backend/services/account_service.py`)
- [ ] עדכון `create()` לקבל currency_id במקום currency string
- [ ] עדכון `update()` לטפל ב-currency_id
- [ ] הוספת validation שהמטבע קיים
- [ ] עדכון queries לכלול join עם טבלת המטבעות

#### TickerService (`Backend/services/ticker_service.py`)
- [ ] עדכון `create()` לקבל currency_id במקום currency string
- [ ] עדכון `update()` לטפל ב-currency_id
- [ ] הוספת validation שהמטבע קיים
- [ ] עדכון queries לכלול join עם טבלת המטבעות

### 5. עדכון API Routes 🔄

#### Accounts API (`Backend/routes/api/accounts.py`)
- [ ] עדכון endpoints לקבל currency_id במקום currency
- [ ] הוספת endpoint לקבלת רשימת מטבעות זמינים
- [ ] עדכון responses לכלול פרטי מטבע מלאים
- [ ] עדכון validation rules

#### Tickers API (`Backend/routes/api/tickers.py`)
- [ ] עדכון endpoints לקבל currency_id במקום currency
- [ ] עדכון responses לכלול פרטי מטבע מלאים
- [ ] עדכון validation rules

### 6. עדכון Frontend - דף החשבונות ✅

#### JavaScript (`trading-ui/scripts/accounts.js`)
**שינויים שבוצעו**:

1. **טעינת רשימת מטבעות**:
```javascript
// פונקציה לטעינת מטבעות מהשרת
async function loadCurrenciesFromServer() {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/v1/currencies/');
    const responseData = await response.json();
    const currencies = responseData.data || responseData;
    window.currenciesData = currencies;
    window.currenciesLoaded = true;
  } catch (error) {
    // טעינת מטבעות ברירת מחדל
    window.currenciesData = [
      { id: 1, symbol: 'USD', name: 'US Dollar', usd_rate: '1.000000' }
    ];
    window.currenciesLoaded = true;
  }
}
```

2. **עדכון הצגת מטבע בטבלה**:
```javascript
// פונקציה עזר להצגת מטבע
function getCurrencyDisplay(account) {
  if (account.currency && account.currency.symbol) {
    // אם יש פרטי מטבע מלאים
    const symbol = account.currency.symbol;
    switch (symbol) {
      case 'USD': return '$';
      case 'ILS': return '₪';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return symbol;
    }
  } else if (account.currency_id && window.currenciesData.length > 0) {
    // אם יש רק currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === account.currency_id);
    if (currency) {
      switch (currency.symbol) {
        case 'USD': return '$';
        case 'ILS': return '₪';
        case 'EUR': return '€';
        case 'GBP': return '£';
        default: return currency.symbol;
      }
    }
  }
  return '-';
}
```

3. **עדכון טופס יצירת/עריכת חשבון**:
```javascript
// פונקציה ליצירת אפשרויות מטבע בטופס
function generateCurrencyOptions(account = null) {
  if (!window.currenciesData || window.currenciesData.length === 0) {
    return `<option value="1" ${account && (account.currency_id === 1 || (account.currency && account.currency.symbol === 'USD')) ? 'selected' : ''}>דולר אמריקאי (USD)</option>`;
  }

  return window.currenciesData.map(currency => {
    const isSelected = account && (
      account.currency_id === currency.id || 
      (account.currency && account.currency.symbol === currency.symbol) ||
      (account.currency === currency.symbol)
    );
    
    return `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
  }).join('');
}
```

4. **עדכון פונקציות CRUD**:
```javascript
// עדכון saveAccount לשלוח currency_id
const accountData = {
  name: formData.get('name'),
  currency_id: parseInt(formData.get('currency_id')),
  status: formData.get('status'),
  cash_balance: parseFloat(formData.get('cash_balance')) || 0,
  notes: formData.get('notes')
};
```

#### HTML (`trading-ui/accounts.html`)
**שינויים נדרשים**:

1. **עדכון הטופס**:
```html
<!-- במקום -->
<input type="text" id="currency" name="currency" maxlength="3" value="USD">

<!-- להשתמש ב -->
<select id="currency_id" name="currency_id" required>
    <!-- יטען דינמית מ-JavaScript -->
</select>
```

2. **עדכון עמודות הטבלה**:
```html
<!-- הכותרת נשארת זהה, אבל התוכן ישתנה -->
<th>מטבע</th>
```

### 7. עדכון Frontend - דף הטיקרים 🔄

#### JavaScript (`trading-ui/scripts/tickers.js`)
**שינויים דומים לדף החשבונות**:
- טעינת רשימת מטבעות
- יצירת dropdown למטבעות
- עדכון פונקציות CRUD
- עדכון הצגת נתונים

### 8. עדכון טבלאות נוספות 🔄

יש לבדוק ולעדכן טבלאות נוספות שעשויות להכיל שדה מטבע:
- `trades` - ככל הנראה יש שדה currency
- `trade_plans` - ככל הנראה יש שדה currency  
- `cash_flows` - ככל הנראה יש שדה currency

### 9. בדיקות ואימותים 🔄

- [ ] יצירת unit tests למודלים החדשים
- [ ] יצירת integration tests ל-API החדש
- [ ] בדיקת תאימות לאחור
- [ ] בדיקת ביצועים עם joins

## סדר ביצוע מומלץ

1. **הכנה** ✅
   - יצירת טבלת מטבעות
   - הוספת מטבעות ראשוניים

2. **מודלים** ✅
   - עדכון מודלי Account ו-Ticker

3. **מיגרציה** 🔄
   - הרצת migration scripts לעדכון הנתונים הקיימים

4. **Backend**
   - עדכון Services
   - עדכון API Routes

5. **Frontend**
   - עדכון JavaScript
   - עדכון HTML
   - בדיקות

6. **טבלאות נוספות**
   - זיהוי וטיפול בטבלאות נוספות

7. **בדיקות ואימות**
   - בדיקות מקיפות
   - תיקון באגים

## הערות חשובות

1. **תאימות לאחור**: במהלך המעבר, יש לוודא שהמערכת ממשיכה לעבוד
2. **גיבוי**: יש לבצע גיבוי מלא לפני הרצת ה-migrations
3. **בדיקות**: כל שינוי צריך להיבדק ביסודיות
4. **תיעוד**: יש לעדכן תיעוד API ומדריכי משתמש

## קבצים שנוצרו/עודכנו

### נוצרו ✅
- `Backend/models/currency.py`
- `Backend/services/currency_service.py`
- `Backend/routes/api/currencies.py`
- `Backend/migrations/create_currencies_table.py`
- `Backend/migrations/update_accounts_currency.py`
- `Backend/migrations/update_tickers_currency.py`
- `add_currencies.py`
- `CURRENCY_MIGRATION_DOCUMENTATION.md`

### עודכנו ✅
- `Backend/models/account.py`
- `Backend/models/ticker.py`
- `Backend/models/__init__.py`
- `Backend/services/__init__.py`
- `Backend/app.py`

### צריכים עדכון 🔄
- `Backend/services/account_service.py`
- `Backend/services/ticker_service.py`
- `Backend/routes/api/accounts.py`
- `Backend/routes/api/tickers.py`
- `trading-ui/scripts/accounts.js`
- `trading-ui/scripts/tickers.js`
- `trading-ui/accounts.html`
- `trading-ui/tickers.html`
