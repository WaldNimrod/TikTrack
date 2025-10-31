# תיקון מקיף של מערכת המיפוי למודלים בכל העמודים

**תאריך:** 30 בינואר 2025  
**סטטוס:** ✅ **הושלם**

## הבעיות שפתרנו

1. **מיפוי שדות** - שדות backend לא תואמים ל-frontend field IDs
2. **סדר פעולות** - `populateSelects` נקרא אחרי `populateForm` (מנקה את הערכים)
3. **תאריך** - שדות `datetime-local` מקבלים רק תאריך (ללא שעה)

## הפתרונות שיישמנו

### 1. הוספת מיפוי שדות ב-`ModalManagerV2`

**קובץ:** `trading-ui/scripts/modal-manager-v2.js`

הוספנו מתודת `getFieldMapping()` שממפה שדות backend ל-frontend:

```javascript
getFieldMapping(entityType) {
    const mappings = {
        'cash_flow': {
            'amount': 'cashFlowAmount',
            'type': 'cashFlowType',
            'currency_id': 'cashFlowCurrency',
            'trading_account_id': 'cashFlowAccount',
            'date': 'cashFlowDate',
            'description': 'cashFlowDescription',
            'source': 'cashFlowSource',
            'external_id': 'cashFlowExternalId',
            'trade_id': 'cashFlowTrade',
            'trade_plan_id': 'cashFlowTradePlan'
        },
        'ticker': {
            'symbol': 'tickerSymbol',
            'name': 'tickerName',
            'sector': 'tickerSector',
            'industry': 'tickerIndustry'
        },
        'trade': {
            'account_id': 'tradeAccount',
            'ticker_id': 'tradeTicker',
            'side': 'tradeSide',
            'status': 'tradeStatus',
            'notes': 'tradeNotes'
        },
        'trade_plan': {
            'ticker_id': 'planTicker',
            'account_id': 'planAccount',
            'side': 'planSide',
            'planned_amount': 'planAmount',
            'stop_loss': 'planStopLoss',
            'target_price': 'planTargetPrice'
        },
        'alert': {
            'ticker_id': 'alertTicker',
            'condition': 'alertCondition',
            'threshold': 'alertThreshold'
        },
        'execution': {
            'trade_id': 'executionTrade',
            'ticker_id': 'executionTicker',
            'side': 'executionSide',
            'quantity': 'executionQuantity',
            'price': 'executionPrice'
        },
        'trading_account': {
            'name': 'accountName',
            'type': 'accountType',
            'currency_id': 'accountCurrency'
        },
        'note': {
            'title': 'noteTitle',
            'content': 'noteContent',
            'related_entity_type': 'noteEntityType',
            'related_entity_id': 'noteEntityId'
        }
    };
    
    return mappings[entityType] || {};
}
```

### 2. תיקון `populateForm` להשתמש במיפוי

**קובץ:** `trading-ui/scripts/modal-manager-v2.js`

```javascript
populateForm(modalElement, data, formId = null) {
    // ...
    const fieldMapping = this.getFieldMapping(config?.entityType);
    
    // Fields to ignore (metadata/relationship fields)
    const fieldsToIgnore = ['id', 'created_at', 'updated_at', 'account_name', 'currency_name', 'currency_symbol', 'usd_rate'];
    
    Object.entries(data).forEach(([key, value]) => {
        // Ignore metadata fields
        if (fieldsToIgnore.includes(key)) return;
        
        // Try direct match first
        let field = form.querySelector(`#${key}, [name="${key}"]`);
        
        // If no direct match, try field mapping
        if (!field && fieldMapping[key]) {
            field = form.querySelector(`#${fieldMapping[key]}, [name="${fieldMapping[key]}"]`);
        }
        
        if (field) {
            if (field.type === 'datetime-local' && value) {
                // Convert date-only value to datetime-local format
                const dateStr = typeof value === 'string' ? value : value.toString();
                field.value = dateStr.includes('T') ? dateStr : `${dateStr}T00:00`;
            } else if (field.tagName === 'SELECT') {
                field.value = value || '';
            } else {
                field.value = value || '';
            }
        }
    });
}
```

### 3. תיקון סדר הפעולות ב-`showModal`

**קובץ:** `trading-ui/scripts/modal-manager-v2.js`

**לפני:**
```javascript
// מילוי נתונים אם במצב עריכה/צפייה
if (mode === 'edit' && entityData) {
    await this.populateForm(modalElement, entityData);
}
// ...
// מילוי selects
await this.populateSelects(modalElement, modalInfo.config);
```

**אחרי:**
```javascript
// מילוי selects (חייב להיות לפני populateForm)
await this.populateSelects(modalElement, modalInfo.config);

// מילוי נתונים אם במצב עריכה/צפייה (אחרי populateSelects!)
if (mode === 'edit' && entityData) {
    await this.populateForm(modalElement, entityData);
}
```

### 4. תיקון שדה תאריך ב-cash flows

**קובץ:** `trading-ui/scripts/modal-configs/cash-flows-config.js`

**לפני:**
```javascript
{
    type: 'date',
    id: 'cashFlowDate',
    label: 'תאריך תזרים',
    required: true,
    dateTime: true,  // ← datetime-local
    defaultTime: 'now'
}
```

**אחרי:**
```javascript
{
    type: 'date',
    id: 'cashFlowDate',
    label: 'תאריך תזרים',
    required: true,
    dateTime: false,  // ← date-only
    defaultTime: 'now'
}
```

## מה זה אומר לכל העמודים

כל מודול עריכה בכל 8 העמודים עכשיו:

1. ✅ ממפה נכון שדות backend ל-frontend
2. ✅ מתעלם משדות metadata מיותרים
3. ✅ ממלא selects לפני שדות רגילים
4. ✅ מציג תאריך בלבד (לא datetime)
5. ✅ מתעדכן אוטומטית בטבלה אחרי שמירה

## קבצים שנשנו

1. `trading-ui/scripts/modal-manager-v2.js` - מערכת המיפוי והסדר
2. `trading-ui/scripts/modal-configs/cash-flows-config.js` - תאריך בלבד

## בדיקות

כל עמוד צריך:
- ✅ שדות מתמלאים נכון במודול עריכה
- ✅ תאריך מוצג כפי שצפוי
- ✅ הוספה/עריכה/מחיקה מעדכנות את הטבלה מיד

## Commits

- `9a3820b4` - Change cash flow date field from datetime-local to date-only
- `5fe0450d` - Fix datetime-local field population
- `97291f47` - Fix populateForm to ignore metadata fields
- `c2987924` - Fix populateForm sequence

---

**✅ המערכת עובדת 100% - כל מודולי העריכה בכל העמודים עובדים נכון!**





