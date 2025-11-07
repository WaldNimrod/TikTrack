# תוכנית יישום - הוספת יתרת פתיחה לחשבון מסחר

**תאריך יצירה:** 2 בינואר 2025  
**מטרה:** הוספת שדה `opening_balance` (יתרת פתיחה) לחשבון מסחר עם מיגרציה מלאה ועדכון כל שכבות המערכת

---

## הנחות יסוד

1. **שם השדה:** `opening_balance`
2. **טיפוס:** Float (כמו `cash_balance`)
3. **חובה:** לא (nullable=True, default=0.0)
4. **חישוב יתרה:** `balance = opening_balance + cash_flows + executions`
5. **מטבע:** יתרת פתיחה במטבע הבסיס של החשבון בלבד - שאר מטבעות מתחילים מ-0
6. **הערה למשתמש:** יש להוסיף הערה ליד השדה: "יתרת פתיחה במטבע הבסיס של החשבון בלבד"

---

## שלב 1: גיבוי בסיס הנתונים

### קבצים ליצירה:
- `Backend/migrations/add_opening_balance_to_trading_accounts.py` (חדש)

### פעולות:
1. יצירת סקריפט גיבוי אוטומטי עם timestamp
2. גיבוי קובץ בסיס הנתונים ל-`Backend/db/backups/`
3. שמירת נתיב הגיבוי ללוג

### קוד גיבוי (בתוך המיגרציה):
```python
def backup_database(db_path):
    """Create backup before migration"""
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    import shutil
    shutil.copy2(db_path, backup_path)
    logger.info(f"Database backup created: {backup_path}")
    return backup_path
```

---

## שלב 2: מיגרציה - הוספת שדה לבסיס הנתונים

### קבצים ליצירה:
- `Backend/migrations/add_opening_balance_to_trading_accounts.py`

### מבנה המיגרציה:
1. גיבוי בסיס הנתונים
2. בדיקת מבנה טבלה קיים
3. הוספת שדה `opening_balance FLOAT DEFAULT 0.0`
4. עדכון כל הרשומות הקיימות ל-0.0 (או NULL)
5. בדיקת תקינות המבנה

### קוד מיגרציה:
```python
# Step 1: Backup
backup_path = backup_database(db_path)

# Step 2: Check if column exists
cursor.execute("PRAGMA table_info(trading_accounts)")
columns = [col[1] for col in cursor.fetchall()]

if 'opening_balance' in columns:
    logger.warning("Column opening_balance already exists - migration may have been run")
    return False

# Step 3: Add column
cursor.execute("""
    ALTER TABLE trading_accounts 
    ADD COLUMN opening_balance FLOAT DEFAULT 0.0
""")

# Step 4: Update existing records to 0.0
cursor.execute("""
    UPDATE trading_accounts 
    SET opening_balance = 0.0 
    WHERE opening_balance IS NULL
""")

# Step 5: Verify
cursor.execute("PRAGMA table_info(trading_accounts)")
columns_after = [col[1] for col in cursor.fetchall()]
assert 'opening_balance' in columns_after, "Migration failed - column not found"
```

---

## שלב 3: עדכון Backend - Model Layer

### קבצים לעדכון:
- `Backend/models/trading_account.py`

### פעולות:
1. הוספת שדה `opening_balance` למודל:
   ```python
   opening_balance = Column(Float, default=0.0, nullable=True)
   ```

2. עדכון `to_dict()` להכללת השדה:
   ```python
   'opening_balance': self.opening_balance or 0.0,
   ```

3. עדכון `__repr__()` אם צריך (אופציונלי)

---

## שלב 4: עדכון Backend - Service Layer

### קבצים לעדכון:
- `Backend/services/trading_account_service.py`
- `Backend/services/account_activity_service.py`
- `Backend/services/position_portfolio_service.py` (בדיקה)

### פעולות ב-TradingAccountService:

**4.1 עדכון `create()` ו-`update()`:**
```python
# עדכון allowed_fields
allowed_fields = {'name', 'currency_id', 'status', 'cash_balance', 'total_value', 'total_pl', 'notes', 'opening_balance'}
```

**4.2 ולידציה (אופציונלי):**
```python
if 'opening_balance' in data and data['opening_balance'] is not None:
    if data['opening_balance'] < 0:
        raise ValueError("opening_balance must be >= 0")
```

### פעולות ב-AccountActivityService:

**4.3 עדכון `get_account_activity()`:**

מיקום: שורה 147-161 (אתחול currencies_dict)

```python
# לאחר קבלת account (שורה 57-59)
# הוספה לפני לולאת cash_flows (שורה 149)

# אתחול opening_balance למטבע הבסיס
base_currency_id = account.currency_id
opening_balance = float(account.opening_balance or 0.0)

# אם אין מטבעות עדיין, צור את מטבע הבסיס
if base_currency_id not in currencies_dict:
    currencies_dict[base_currency_id] = {
        'currency_id': base_currency_id,
        'currency_symbol': account.currency.symbol if account.currency else 'USD',
        'currency_name': account.currency.name if account.currency else 'US Dollar',
        'movements': [],
        'balance': opening_balance  # ✅ הוספת יתרת פתיחה
    }
else:
    # אם כבר קיים, הוסף את יתרת הפתיחה
    currencies_dict[base_currency_id]['balance'] += opening_balance
```

**4.4 עדכון `calculate_balance_by_currency()`:**

מיקום: שורה 316-347

```python
# הוספה בתחילת הפונקציה (אחרי שורה 332)
balance = 0.0

# הוספת יתרת פתיחה רק למטבע הבסיס
account = db.query(TradingAccount).filter(TradingAccount.id == account_id).first()
if account and account.currency_id == currency_id:
    opening_balance = float(account.opening_balance or 0.0)
    balance += opening_balance
```

---

## שלב 5: עדכון Backend - API Layer

### קבצים לבדיקה:
- `Backend/routes/api/trading_accounts.py`

### פעולות:
1. בדיקה שהשדה החדש נשלח ב-responses (דרך `to_dict()`)
2. בדיקה שהשדה החדש מתקבל ב-create/update (דרך TradingAccountService)
3. אין צורך בשינויים - הכל עובד דרך המודל והשירות

---

## שלב 6: עדכון Frontend - קובץ קונפיגורציה

### קבצים לעדכון:
- `trading-ui/scripts/modal-configs/trading-accounts-config.js`

### פעולות:
1. הוספת שדה `accountOpeningBalance` ל-`fields`:

**מיקום:** אחרי `accountCurrency` (שורה 39), לפני `accountStatus` (שורה 41)

```javascript
{
    type: 'number',
    id: 'accountOpeningBalance',
    label: 'יתרת פתיחה',
    required: false,
    min: 0,
    step: 0.01,
    placeholder: '0.00',
    description: 'יתרת פתיחה במטבע הבסיס של החשבון בלבד. שאר מטבעות מתחילים מ-0.',
    rowClass: 'row',
    colClass: 'col-md-6'
},
```

2. עדכון `validation` (אופציונלי):
```javascript
accountOpeningBalance: {
    required: false,
    min: 0
}
```

---

## שלב 7: עדכון Frontend - פונקציית שמירה

### קבצים לעדכון:
- `trading-ui/scripts/trading_accounts.js`

### פעולות:
1. עדכון `saveTradingAccount()` (שורה 2228):

**הוספה ל-`DataCollectionService.collectFormData()`:**
```javascript
opening_balance: { id: 'accountOpeningBalance', type: 'float', default: 0 }
```

**מיקום:** אחרי `currency_id`, לפני `status`

2. ולידציה (אופציונלי):
```javascript
if (accountData.opening_balance !== undefined && accountData.opening_balance !== null) {
    if (accountData.opening_balance < 0) {
        if (window.showValidationWarning) {
            window.showValidationWarning('accountOpeningBalance', 'יתרת פתיחה לא יכולה להיות שלילית');
        }
        hasErrors = true;
    }
}
```

---

## שלב 8: עדכון Frontend - מודול עריכה

### קבצים לבדיקה/עדכון:
- `trading-ui/scripts/modal-manager-v2.js` - בדיקה אם `showEditModal` ממלא את השדה אוטומטית
- `trading-ui/scripts/trading_accounts.js` - אם יש פונקציית מילוי ידנית

### פעולות:
1. מודול עריכה - ModalManagerV2 אמור למלא אוטומטית דרך `showEditModal
2. בדיקה - וידוא שהשדה מתמלא בעריכה

---

## שלב 9: עדכון Frontend - מודול פרטים

### קבצים לעדכון:
- `trading-ui/scripts/entity-details-renderer.js`

### פעולות:
1. עדכון `renderAccount()` (שורה 2327):

**הוספה ל-`fieldMappings` (שורה 1579):**
```javascript
trading_account: [
    // ... שדות קיימים ...
    { key: 'opening_balance', label: 'יתרת פתיחה', type: 'currency', description: 'יתרת פתיחה במטבע הבסיס של החשבון בלבד' },
    // ...
]
```

**או הוספה ישירה ב-HTML של renderAccount:**
```javascript
<!-- הוספה אחרי שדה מטבע, לפני סטטוס -->
<div class="mb-2">
    <strong>יתרת פתיחה:</strong>
    <span>${this.formatFieldValue(accountData.opening_balance || 0, 'currency', accountColor, 'opening_balance', accountData)}</span>
    <small class="text-muted d-block mt-1">יתרת פתיחה במטבע הבסיס של החשבון בלבד. שאר מטבעות מתחילים מ-0.</small>
</div>
```

---

## שלב 10: בדיקות

### בדיקות בסיס נתונים:
1. ✅ וידוא שהשדה נוסף לטבלה: `PRAGMA table_info(trading_accounts)`
2. ✅ וידוא שכל הרשומות הקיימות עם ערך 0.0
3. ✅ בדיקת הוספת חשבון חדש עם יתרת פתיחה

### בדיקות Backend:
1. ✅ בדיקת יצירת חשבון עם `opening_balance`
2. ✅ בדיקת עדכון חשבון עם `opening_balance`
3. ✅ בדיקת חישוב יתרה: 
   - חשבון עם `opening_balance = 1000`
   - cash flow: deposit 500
   - execution: buy 200
   - **תוצאה צפויה:** balance = 1000 + 500 - 200 = 1300
4. ✅ בדיקת חישוב שווי: `total_value = balance + positions_value`

### בדיקות Frontend:
1. ✅ בדיקת מודול הוספה - שדה נראה עם הערה
2. ✅ בדיקת מודול עריכה - שדה מתמלא ונשמר
3. ✅ בדיקת מודול פרטים - שדה מוצג

### בדיקות חישוב:
1. ✅ חשבון עם יתרת פתיחה בלבד (ללא cash flows) - balance = opening_balance
2. ✅ חשבון עם יתרת פתיחה + cash flows - balance = opening_balance + cash_flows
3. ✅ חשבון עם יתרת פתיחה + cash flows + executions - balance = opening_balance + cash_flows + executions
4. ✅ וידוא שהשווי כולל את יתרת הפתיחה
5. ✅ בדיקת מטבעות אחרים - מתחילים מ-0 (לא כוללים opening_balance)

---

## סדר ביצוע מומלץ

1. **גיבוי בסיס הנתונים** - יצירת סקריפט גיבוי
2. **מיגרציה** - הוספת השדה לבסיס הנתונים
3. **עדכון Backend Model** - הוספת השדה למודל
4. **עדכון Backend Services** - TradingAccountService + AccountActivityService
5. **בדיקת Backend** - בדיקת create/update/get
6. **עדכון Frontend Config** - הוספת השדה לקונפיגורציה
7. **עדכון Frontend Save** - הוספת השדה לפונקציית שמירה
8. **עדכון Frontend Details** - הוספת השדה למודול פרטים
9. **בדיקות מלאות** - כל הבדיקות

---

## קבצים חדשים ליצירה

1. `Backend/migrations/add_opening_balance_to_trading_accounts.py`

## קבצים לעדכון

1. `Backend/models/trading_account.py`
2. `Backend/services/trading_account_service.py`
3. `Backend/services/account_activity_service.py`
4. `Backend/services/position_portfolio_service.py` (בדיקה בלבד)
5. `trading-ui/scripts/modal-configs/trading-accounts-config.js`
6. `trading-ui/scripts/trading_accounts.js`
7. `trading-ui/scripts/entity-details-renderer.js`

---

## הערות חשובות

1. **יתרת פתיחה במטבע הבסיס בלבד** - רק במטבע הבסיס של החשבון (currency_id)
2. **שאר מטבעות מתחילים מ-0** - לא כוללים opening_balance
3. **חישוב יתרה:** `balance = opening_balance + cash_flows + executions` (רק למטבע הבסיס)
4. **השדה לא חובה** - ברירת מחדל 0.0
5. **הערה למשתמש** - יש להוסיף הערה ברורה: "יתרת פתיחה במטבע הבסיס של החשבון בלבד. שאר מטבעות מתחילים מ-0."
6. **כל החישובים דרך AccountActivityService** - עדכון אחד מספיק
7. **בדיקת חישובי שווי** - וידוא שהשווי כולל את יתרת הפתיחה

---

## נקודות קריטיות לבדיקה

1. ✅ **מיגרציה בטוחה** - גיבוי לפני כל שינוי
2. ✅ **חישוב נכון** - opening_balance רק למטבע הבסיס
3. ✅ **מטבעות אחרים** - מתחילים מ-0, לא כוללים opening_balance
4. ✅ **ולידציה** - opening_balance >= 0
5. ✅ **UI ברור** - הערה ברורה למשתמש
6. ✅ **עדכון חישובי שווי** - total_value כולל opening_balance

---

**תוכנית זו מוכנה ליישום**

