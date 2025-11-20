# Cash Flows Edit Modal Architecture - מבנה מודול עריכה תזרימי מזומנים
## ארכיטקטורה מיוחדת - מודול עריכה דואלי

**תאריך יצירה:** 21 בנובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מוכן לשימוש  
**חשיבות:** ⚠️ **יוצא דופן** - מבנה מיוחד שדורש הבנה מעמיקה

---

## 📋 סקירה כללית

מודול העריכה של תזרימי מזומנים (`cashFlowModal`) הוא **יוצא דופן** במערכת כי הוא מטפל בשני סוגי ישויות שונות עם ממשק עריכה אחד:

1. **תזרימי מזומנים רגילים** - רשומה אחת פשוטה
2. **המרות מטבע** - שתי רשומות מחוברות (FROM + TO) שצריכות להיות ערוכות יחד

### ⚠️ למה זה יוצא דופן?

ברוב המערכת, כל ישות יש לה מודול עריכה אחד פשוט. כאן יש:
- **מודול אחד** (`cashFlowModal`)
- **שני טאבים** (תזרים רגיל / המרת מטבע)
- **לוגיקה דינמית** שמחליטה איזה טאב להציג לפי סוג התזרים
- **טעינת נתונים שונה** - תזרים רגיל טוען רשומה אחת, המרת מטבע טוען שתי רשומות

---

## 🏗️ מבנה הנתונים

### תזרים רגיל (Regular Cash Flow)

רשומה אחת בטבלה `cash_flows`:

```python
CashFlow(
    id=7,
    type='deposit',  # או withdrawal, fee, dividend, etc.
    amount=1000.0,
    currency_id=1,
    trading_account_id=1,
    date='2025-11-21',
    description='הפקדה',
    source='manual',
    external_id='0'
)
```

### המרת מטבע (Currency Exchange)

**שתי רשומות** בטבלה `cash_flows` עם `external_id` משותף:

```python
# FROM Record (ממטבע)
CashFlow(
    id=10,
    type='currency_exchange_from',
    amount=-1000.0,  # תמיד שלילי
    fee_amount=5.0,  # עמלה (רק ב-FROM)
    currency_id=1,  # ILS
    trading_account_id=1,
    date='2025-11-21',
    external_id='exchange_9fa0cd95389f',  # משותף עם TO
    source='manual'
)

# TO Record (למטבע)
CashFlow(
    id=11,
    type='currency_exchange_to',
    amount=270.0,  # תמיד חיובי
    fee_amount=0.0,  # תמיד 0
    currency_id=2,  # USD
    trading_account_id=1,
    date='2025-11-21',
    external_id='exchange_9fa0cd95389f',  # משותף עם FROM
    source='manual'
)
```

**מאפיינים:**
- שתי הרשומות חולקות `external_id` בפורמט `exchange_<uuid>`
- FROM תמיד שלילי, TO תמיד חיובי
- עמלה נשמרת רק ב-FROM
- תאריך זהה בשתי הרשומות
- מטבעות שונים (FROM ≠ TO)

---

## 🎯 זיהוי סוג התזרים

### פונקציית זיהוי: `isCurrencyExchange()`

**מיקום:** `trading-ui/scripts/cash_flows.js`

```javascript
function isCurrencyExchange(cashFlow) {
    if (!cashFlow) return false;
    
    // בדיקה לפי type
    if (resolveExchangeDirectionFromType(cashFlow.type)) {
        return true;  // currency_exchange_from או currency_exchange_to
    }
    
    // בדיקה לפי exchange_group_id
    if (cashFlow.exchange_group_id) {
        return true;
    }
    
    // בדיקה לפי linked_exchange_cash_flow_id
    if (cashFlow.linked_exchange_cash_flow_id || 
        cashFlow.linked_exchange_summary || 
        cashFlow.exchange_pair_summary) {
        return true;
    }
    
    // בדיקה לפי source
    if (cashFlow.source && String(cashFlow.source).toLowerCase() === 'currency_exchange') {
        return true;
    }
    
    // בדיקה לפי external_id
    const externalId = cashFlow.external_id;
    return typeof externalId === 'string' && externalId.startsWith('exchange_');
}
```

### פונקציית חילוץ UUID: `getExchangeIdFromCashFlow()`

**מיקום:** `trading-ui/scripts/cash_flows.js`

```javascript
function getExchangeIdFromCashFlow(cashFlow) {
    if (!isCurrencyExchange(cashFlow)) {
        return null;
    }
    const groupId = cashFlow.exchange_group_id || cashFlow.external_id;
    if (!groupId) {
        return null;
    }
    // הסרת הקידומת 'exchange_' - backend מצפה רק ל-UUID
    const uuid = typeof groupId === 'string' 
        ? groupId.replace(/^exchange_/, '') 
        : String(groupId).replace(/^exchange_/, '');
    return uuid || null;
}
```

---

## 🔧 זרימת העבודה בעריכה

### 1. תזרים רגיל

**קריאה:** `editCashFlow(cashFlowId)`

**תהליך:**
1. טעינת התזרים דרך `/api/cash-flows/${id}`
2. בדיקה: `isCurrencyExchange()` מחזיר `false`
3. קריאה ל-`ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', id)`
4. `ModalManagerV2` מזהה שזה תזרים רגיל
5. `initializeCashFlowTabs()` מסתיר את טאב "המרת מטבע"
6. מציג רק את טאב "תזרים רגיל"
7. ממלא את השדות דרך `populateForm()`

### 2. המרת מטבע

**קריאה:** `editCashFlow(cashFlowId)` (אותו פונקציה!)

**תהליך:**
1. טעינת התזרים דרך `/api/cash-flows/${id}`
2. בדיקה: `isCurrencyExchange()` מחזיר `true`
3. חילוץ UUID: `getExchangeIdFromCashFlow()` מחזיר `'9fa0cd95389f'`
4. קריאה ל-`ModalManagerV2.showModal('cashFlowModal', 'edit', cashFlowData, { isCurrencyExchange: true, exchangeId: '9fa0cd95389f' })`
5. `ModalManagerV2` מזהה שזה המרת מטבע
6. `initializeCashFlowTabs()` מסתיר את טאב "תזרים רגיל"
7. מציג רק את טאב "המרת מטבע"
8. ממתין 200ms לרנדור המודל
9. טעינת נתוני שתי הרשומות דרך `loadCurrencyExchange(exchangeId)`
10. `loadCurrencyExchange()` קורא ל-`/api/cash-flows/exchange/${exchangeId}`
11. ממלא את השדות בשני הצדדים (FROM + TO)

---

## 📐 מבנה המודל

### קונפיגורציה: `cash-flows-config.js`

```javascript
const cashFlowModalConfig = {
    id: 'cashFlowModal',
    entityType: 'cash_flow',
    tabs: [
        {
            id: 'regular',
            label: 'תזרים רגיל',
            active: true,
            fields: [
                // שדות תזרים רגיל...
            ]
        },
        {
            id: 'exchange',
            label: 'המרת מטבע',
            active: false,
            fields: [
                // שדות המרת מטבע...
            ]
        }
    ],
    onSave: 'saveCashFlow',
    onSaveExchange: 'saveCurrencyExchange'
};
```

### לוגיקת הצגת טאבים: `initializeCashFlowTabs()`

**מיקום:** `trading-ui/scripts/modal-manager-v2.js`

**תפקיד:** מחליט איזה טאב להציג לפי סוג התזרים

```javascript
initializeCashFlowTabs(modalElement, config, mode, entityData, options = {}) {
    // זיהוי אם זה המרת מטבע
    let isCurrencyExchange = false;
    
    if (options.isCurrencyExchange) {
        isCurrencyExchange = true;
    } else if (mode === 'edit' && entityData) {
        isCurrencyExchange = window.isCurrencyExchange?.(entityData) || false;
    }
    
    // הסתרת/הצגת טאבים
    if (isCurrencyExchange) {
        // הסתר טאב "תזרים רגיל"
        // הצג ופעיל טאב "המרת מטבע"
    } else {
        // הצג טאב "תזרים רגיל"
        // הסתר טאב "המרת מטבע"
    }
}
```

---

## 🔄 טעינת נתונים

### תזרים רגיל

**Endpoint:** `GET /api/cash-flows/{id}`

**תגובה:**
```json
{
    "status": "success",
    "data": {
        "id": 7,
        "type": "deposit",
        "amount": 1000.0,
        "currency_id": 1,
        "date": {
            "utc": "2025-11-21T00:00:00Z",
            "epochMs": 1732147200000,
            "display": "21.11.2025"
        },
        ...
    }
}
```

**טעינה:** דרך `ModalManagerV2.showEditModal()` → `loadEntityData()` → `populateForm()`

### המרת מטבע

**Endpoint:** `GET /api/cash-flows/exchange/{exchange_uuid}`

**תגובה:**
```json
{
    "status": "success",
    "data": {
        "exchange_id": "9fa0cd95389f",
        "exchange_rate": 0.27,
        "fee_amount": 5.0,
        "from_flow": {
            "id": 10,
            "type": "currency_exchange_from",
            "amount": -1000.0,
            "currency_id": 1,
            ...
        },
        "to_flow": {
            "id": 11,
            "type": "currency_exchange_to",
            "amount": 270.0,
            "currency_id": 2,
            ...
        },
        "exchange_pair_summary": { ... }
    }
}
```

**טעינה:** דרך `loadCurrencyExchange(exchangeId)` → ממלא שדות בשני הצדדים

---

## 💾 שמירת נתונים

### תזרים רגיל

**פונקציה:** `saveCashFlow()`

**Endpoint:** `PUT /api/cash-flows/{id}`

**תהליך:**
1. איסוף נתונים מטאב "תזרים רגיל"
2. שליחה ל-API
3. עדכון הטבלה

### המרת מטבע

**פונקציה:** `saveCurrencyExchange()`

**Endpoint:** `PUT /api/cash-flows/exchange/{exchange_uuid}`

**תהליך:**
1. איסוף נתונים מטאב "המרת מטבע"
2. שליחה ל-API (עדכון אטומי של שתי הרשומות)
3. עדכון הטבלה

---

## 🎨 ממשק המשתמש

### תזרים רגיל

**טאב גלוי:** "תזרים רגיל" בלבד

**שדות:**
- סוג תזרים (select)
- חשבון מסחר (select)
- סכום (number)
- מטבע (select)
- תאריך (date)
- מקור (select)
- מזהה חיצוני (text)
- תגיות (multi-select)
- תיאור (rich-text)

### המרת מטבע

**טאב גלוי:** "המרת מטבע" בלבד

**שדות:**
- חשבון מסחר (select)
- תאריך (date)
- מטבע מקור (select)
- מטבע יעד (select)
- שער המרה (number)
- עמלה (number)
- סכום להמרה (number)
- סכום מומר (number, read-only)
- סיכום חישוב (display)
- מקור (select)
- מזהה חיצוני (text)
- תגיות (multi-select)
- תיאור (rich-text)

---

## 🔍 נקודות חשובות למפתחים

### ⚠️ חובה לזכור:

1. **תמיד להשתמש ב-`editCashFlow(id)`** - לא לקרוא ישירות ל-`showEditModal` או `loadCurrencyExchange`
2. **הזיהוי אוטומטי** - `editCashFlow` מזהה אוטומטית אם זה תזרים רגיל או המרת מטבע
3. **UUID בלבד** - בעת קריאה ל-`loadCurrencyExchange`, להעביר רק את ה-UUID (ללא `exchange_`)
4. **שתי רשומות** - המרת מטבע תמיד מורכבת משתי רשומות, לא ניתן לערוך אחת בלבד
5. **עדכון אטומי** - שמירת המרת מטבע מעדכנת את שתי הרשומות יחד

### ❌ שגיאות נפוצות:

1. **קריאה ישירה ל-`showEditModal`** במקום `editCashFlow`
   ```javascript
   // ❌ לא נכון
   ModalManagerV2.showEditModal('cashFlowModal', 'cash_flow', id);
   
   // ✅ נכון
   editCashFlow(id);
   ```

2. **קריאה ישירה ל-`loadCurrencyExchange`** במקום `editCashFlow`
   ```javascript
   // ❌ לא נכון
   loadCurrencyExchange(exchangeId).then(() => {
       ModalManagerV2.showModal('cashFlowModal', 'edit');
   });
   
   // ✅ נכון
   editCashFlow(cashFlowId);  // הפונקציה מזהה אוטומטית
   ```

3. **שליחת `external_id` מלא** במקום UUID בלבד
   ```javascript
   // ❌ לא נכון
   loadCurrencyExchange('exchange_9fa0cd95389f');
   
   // ✅ נכון
   loadCurrencyExchange('9fa0cd95389f');
   ```

---

## 📝 קבצים רלוונטיים

### Frontend

- `trading-ui/scripts/cash_flows.js`
  - `editCashFlow()` - נקודת כניסה מרכזית לעריכה
  - `isCurrencyExchange()` - זיהוי המרת מטבע
  - `getExchangeIdFromCashFlow()` - חילוץ UUID
  - `loadCurrencyExchange()` - טעינת נתוני המרת מטבע
  - `saveCashFlow()` - שמירת תזרים רגיל
  - `saveCurrencyExchange()` - שמירת המרת מטבע

- `trading-ui/scripts/modal-configs/cash-flows-config.js`
  - קונפיגורציה של המודל עם שני הטאבים

- `trading-ui/scripts/modal-manager-v2.js`
  - `initializeCashFlowTabs()` - לוגיקת הצגת/הסתרת טאבים
  - `showModal()` - תמיכה באופציות נוספות

### Backend

- `Backend/routes/api/cash_flows.py`
  - `GET /api/cash-flows/{id}` - טעינת תזרים רגיל
  - `GET /api/cash-flows/exchange/{exchange_uuid}` - טעינת המרת מטבע
  - `PUT /api/cash-flows/{id}` - עדכון תזרים רגיל
  - `PUT /api/cash-flows/exchange/{exchange_uuid}` - עדכון המרת מטבע

- `Backend/services/cash_flow_service.py`
  - `create_exchange()` - יצירת המרת מטבע (שתי רשומות)
  - `get_exchange_flows()` - קבלת שתי הרשומות לפי exchange_id

---

## 🧪 בדיקות

### תזרים רגיל

1. פתיחת עריכה של תזרים רגיל
2. וידוא שרק טאב "תזרים רגיל" גלוי
3. וידוא שכל השדות מתמלאים נכון
4. שמירה ובדיקה שהנתונים עודכנו

### המרת מטבע

1. פתיחת עריכה של המרת מטבע (מכל אחת משתי הרשומות)
2. וידוא שרק טאב "המרת מטבע" גלוי
3. וידוא שכל השדות מתמלאים נכון (FROM + TO)
4. שמירה ובדיקה ששתי הרשומות עודכנו יחד

---

## 📚 קישורים רלוונטיים

- [ModalManagerV2 Specification](./MODAL_MANAGER_V2_SPECIFICATION.md)
- [Currency Exchange Import Documentation](../../user_data_import/CURRENCY_EXCHANGE_IMPORT.md)
- [Cash Flow Import Records Structure](../../user_data_import/CASHFLOW_IMPORT_RECORDS_STRUCTURE.md)

---

**Last Updated:** 21 בנובמבר 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete and Production Ready

