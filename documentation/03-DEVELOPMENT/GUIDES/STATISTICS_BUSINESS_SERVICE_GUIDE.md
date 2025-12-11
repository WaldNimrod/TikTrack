# Statistics Business Service - Developer Guide

# מדריך מפתחים - StatisticsBusinessService

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפורט לשימוש ב-StatisticsBusinessService - כולל חישובי Time-Weighted Return

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [פונקציות בסיסיות](#פונקציות-בסיסיות)
3. [חישובי KPI](#חישובי-kpi)
4. [חישוב Time-Weighted Return](#חישוב-time-weighted-return)
5. [דוגמאות שימוש](#דוגמאות-שימוש)
6. [API Endpoints](#api-endpoints)

---

## 🎯 סקירה כללית

`StatisticsBusinessService` הוא שירות עסקי מרכזי לחישוב סטטיסטיקות, KPI, וביצועי פורטפוליו.

**מיקום:** `Backend/services/business_logic/statistics_business_service.py`

**תכונות עיקריות:**

- חישובי סטטיסטיקה בסיסיים (sum, average, count, min/max)
- חישובי KPI מורכבים
- חישוב Time-Weighted Return לביצועי פורטפוליו
- תמיכה בפילטרים ואיגוד נתונים

---

## 📊 פונקציות בסיסיות

### `calculate_sum(data, field)`

חישוב סכום של שדה.

**פרמטרים:**

- `data` (List[Dict]): רשימת מילונים עם נתונים
- `field` (str): שם השדה לחישוב

**החזרה:**

```python
{
    'sum': float,      # הסכום המחושב
    'is_valid': bool,  # האם החישוב הצליח
    'error': str       # הודעת שגיאה (אם יש)
}
```

### `calculate_average(data, field)`

חישוב ממוצע של שדה.

**פרמטרים:**

- `data` (List[Dict]): רשימת מילונים עם נתונים
- `field` (str): שם השדה לחישוב

**החזרה:**

```python
{
    'average': float,   # הממוצע המחושב
    'is_valid': bool,   # האם החישוב הצליח
    'error': str        # הודעת שגיאה (אם יש)
}
```

### `count_records(data, filter_fn=None)`

ספירת רשומות עם אופציונלי פילטר.

**פרמטרים:**

- `data` (List[Dict]): רשימת מילונים עם נתונים
- `filter_fn` (Callable, Optional): פונקציית פילטר

**החזרה:**

```python
{
    'count': int,       # מספר הרשומות
    'is_valid': bool,   # האם החישוב הצליח
    'error': str        # הודעת שגיאה (אם יש)
}
```

### `calculate_min_max(data, field)`

חישוב מינימום ומקסימום של שדה.

**פרמטרים:**

- `data` (List[Dict]): רשימת מילונים עם נתונים
- `field` (str): שם השדה לחישוב

**החזרה:**

```python
{
    'min': float,       # הערך המינימלי
    'max': float,       # הערך המקסימלי
    'is_valid': bool,   # האם החישוב הצליח
    'error': str        # הודעת שגיאה (אם יש)
}
```

---

## 📈 חישובי KPI

### `calculate_kpi(calculation_type, data, params=None)`

חישוב KPI על פי סוג.

**פרמטרים:**

- `calculation_type` (str): סוג החישוב ('kpi', 'summary', 'average', 'position', 'portfolio')
- `data` (List[Dict]): רשימת מילונים עם נתונים
- `params` (Dict, Optional): פרמטרים נוספים לחישוב

**סוגי חישוב:**

- `'kpi'`: חישוב מספר KPIs
- `'summary'`: חישוב סטטיסטיקות סיכום
- `'average'`: חישוב ממוצעים
- `'position'`: חישוב סטטיסטיקות פוזיציה
- `'portfolio'`: חישוב סטטיסטיקות פורטפוליו

**דוגמה:**

```python
result = statistics_service.calculate_kpi(
    calculation_type='kpi',
    data=trades_data,
    params={
        'status_field': 'status',
        'statuses': ['open', 'closed', 'cancelled'],
        'sum_fields': ['total_pl', 'realized_pl']
    }
)
```

---

## 💹 חישוב Time-Weighted Return

### `calculate_time_weighted_return(db, account_id, start_date, end_date, include_cash_flows=True)`

חישוב **Time-Weighted Return (TWR)** לביצועי פורטפוליו.

#### מה זה Time-Weighted Return

Time-Weighted Return הוא מדד ביצועים המדד את התשואה של התיק **ללא השפעה של הפקדות ומשיכות**. זה חשוב כי:

1. **התחשבות בזמן הכניסה של כסף**: הפקדה בחודש הראשון של השנה "עובדת" כל השנה, בעוד הפקדה בחודש האחרון כמעט לא משפיעה.

2. **ביצועים טהורים**: TWR מודד רק את ביצועי ההשקעות, לא את כמות הכסף שהופקד.

3. **השוואה הוגנת**: מאפשר השוואה בין תיקים שונים או תקופות שונות, גם אם היו הפקדות/משיכות שונות.

#### איך זה עובד

החישוב מתבצע בשלבים:

1. **חלוקה לתת-תקופות**: התקופה מחולקת לתת-תקופות בין כל הפקדה/משיכה.

2. **חישוב תשואה לכל תת-תקופה**:

   ```
   Return_i = (End Value - Start Value) / Start Value
   ```

3. **כפל התשואות**:

   ```
   TWR = (1 + Return_1) * (1 + Return_2) * ... * (1 + Return_n) - 1
   ```

4. **המרה לאחוזים**: התוצאה מומרת לאחוזים (5.5 = 5.5%)

#### דוגמה מעשית

**תרחיש:**

- התחלה (1 ינואר): $1,000
- הפקדה (1 מרץ): $500
- סוף שנה (31 דצמבר): $2,000

**חישוב פשוט (לא נכון):**

```
(2,000 - 500 - 1,000) / 1,000 = 50%
```

❌ זה לא נכון כי ההפקדה "עבדה" 10 חודשים!

**חישוב Time-Weighted Return (נכון):**

**תקופה 1** (1 ינואר - 1 מרץ):

- התחלה: $1,000
- סוף: $1,200 (דוגמה)
- תשואה: (1,200 - 1,000) / 1,000 = 20%

**תקופה 2** (1 מרץ - 31 דצמבר):

- התחלה: $1,200 + $500 = $1,700
- סוף: $2,000
- תשואה: (2,000 - 1,700) / 1,700 = 17.65%

**TWR סופי:**

```
(1 + 0.20) * (1 + 0.1765) - 1 = 41.18%
```

✅ זה נכון - התחשבות בזמן הכניסה של הכסף!

#### פרמטרים

- `db` (Session): Database session (חובה)
- `account_id` (int, Optional): מזהה חשבון מסחר (None = כל החשבונות)
- `start_date` (datetime): תאריך התחלה (חובה)
- `end_date` (datetime): תאריך סיום (חובה)
- `include_cash_flows` (bool): האם להתחשב בהפקדות/משיכות (ברירת מחדל: True)

#### החזרה

```python
{
    'time_weighted_return': float,    # TWR באחוזים (למשל 5.5 = 5.5%)
    'periods': List[Dict],            # רשימת תת-תקופות עם תשואות
    'start_value': float,             # ערך תיק בתחילת התקופה
    'end_value': float,               # ערך תיק בסוף התקופה
    'total_cash_flows': float,        # סך הפקדות - משיכות
    'is_valid': bool,                 # האם החישוב הצליח
    'error': str                      # הודעת שגיאה (אם יש)
}
```

**מבנה `periods`:**

```python
[
    {
        'start_date': str,            # ISO format
        'end_date': str,              # ISO format
        'start_value': float,         # ערך תיק בתחילת התת-תקופה
        'end_value': float,           # ערך תיק בסוף התת-תקופה
        'return': float,              # תשואה באחוזים
        'cash_flows': [               # רשימת cash flows בתת-תקופה
            {
                'date': str,
                'amount': float       # חיובי להפקדה, שלילי למשיכה
            }
        ]
    },
    ...
]
```

#### דוגמת שימוש

```python
from datetime import datetime
from services.business_logic import StatisticsBusinessService
from sqlalchemy.orm import Session

# יצירת instance
statistics_service = StatisticsBusinessService()

# חישוב TWR עבור חשבון מסוים
result = StatisticsBusinessService.calculate_time_weighted_return(
    db=db_session,
    account_id=1,
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31),
    include_cash_flows=True
)

if result['is_valid']:
    twr = result['time_weighted_return']  # למשל 5.5 = 5.5%
    print(f"Time-Weighted Return: {twr}%")
    
    # הדפסת פרטי תת-תקופות
    for period in result['periods']:
        print(f"Period {period['start_date']} to {period['end_date']}: {period['return']}%")
else:
    print(f"Error: {result['error']}")
```

#### הערות חשובות

1. **חישוב ערך תיק בנקודת זמן ספציפית**:
   - הפונקציה הנוכחית משתמשת ב-`PositionPortfolioService.calculate_portfolio_summary()` שמחזיר את הערך הנוכחי.
   - **TODO**: נדרש להוסיף פונקציה ב-`PositionPortfolioService` שמחשבת ערך תיק בנקודת זמן ספציפית (על בסיס executions עד לאותה נקודת זמן).

2. **Cash Flow Types**:
   - **הפקדות** (חיוביות): `deposit`, `transfer_in`, `dividend`, `other_positive`
   - **משיכות** (שליליות): `withdrawal`, `transfer_out`, `fee`, `other_negative`

3. **תקופות ללא ערך**:
   - אם ערך התיק הוא 0 או שלילי בתחילת תת-תקופה, התשואה לא תיחשב (return = 0.0).

4. **ביצועים**:
   - החישוב מחייב טעינת cash flows וחישוב ערכי תיק בכל נקודת זמן - זה יכול להיות כבד.
   - מומלץ להשתמש ב-caching עבור חישובים חוזרים.

---

## 💡 דוגמאות שימוש

### דוגמה 1: חישוב TWR עבור כל החשבונות

```python
from datetime import datetime, timedelta
from services.business_logic import StatisticsBusinessService

# חישוב TWR עבור השנה האחרונה
end_date = datetime.now()
start_date = end_date - timedelta(days=365)

result = StatisticsBusinessService.calculate_time_weighted_return(
    db=db_session,
    account_id=None,  # כל החשבונות
    start_date=start_date,
    end_date=end_date
)

if result['is_valid']:
    print(f"Portfolio TWR: {result['time_weighted_return']}%")
    print(f"Start Value: ${result['start_value']:,.2f}")
    print(f"End Value: ${result['end_value']:,.2f}")
    print(f"Total Cash Flows: ${result['total_cash_flows']:,.2f}")
```

### דוגמה 2: חישוב TWR ללא התחשבות ב-Cash Flows

```python
# חישוב פשוט ללא התחשבות בהפקדות/משיכות
result = StatisticsBusinessService.calculate_time_weighted_return(
    db=db_session,
    account_id=1,
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31),
    include_cash_flows=False  # לא להתחשב ב-Cash Flows
)
```

### דוגמה 3: ניתוח מפורט של תת-תקופות

```python
result = StatisticsBusinessService.calculate_time_weighted_return(
    db=db_session,
    account_id=1,
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31)
)

if result['is_valid']:
    print(f"\nTotal TWR: {result['time_weighted_return']}%")
    print(f"\nSub-periods:")
    print("-" * 80)
    
    for i, period in enumerate(result['periods'], 1):
        print(f"\nPeriod {i}:")
        print(f"  Dates: {period['start_date']} to {period['end_date']}")
        print(f"  Start Value: ${period['start_value']:,.2f}")
        print(f"  End Value: ${period['end_value']:,.2f}")
        print(f"  Return: {period['return']}%")
        
        if period['cash_flows']:
            print(f"  Cash Flows:")
            for cf in period['cash_flows']:
                sign = '+' if cf['amount'] > 0 else ''
                print(f"    {cf['date']}: {sign}${cf['amount']:,.2f}")
```

### דוגמה 4: שימוש בפונקציות בסיסיות

```python
from services.business_logic import StatisticsBusinessService

statistics_service = StatisticsBusinessService()

# חישוב סכום
sum_result = statistics_service.calculate_sum(trades_data, 'total_pl')
if sum_result['is_valid']:
    print(f"Total P/L: ${sum_result['sum']:,.2f}")

# חישוב ממוצע
avg_result = statistics_service.calculate_average(executions_data, 'price')
if avg_result['is_valid']:
    print(f"Average Price: ${avg_result['average']:.2f}")

# ספירה עם פילטר
count_result = statistics_service.count_records(
    trades_data,
    filter_fn=lambda t: t.get('status') == 'open'
)
if count_result['is_valid']:
    print(f"Open Trades: {count_result['count']}")
```

---

## 🔗 API Endpoints

### חישוב KPI

**Endpoint:** `POST /api/business/statistics/kpi`

**Request Body:**

```json
{
    "calculation_type": "kpi",
    "data": [...],
    "params": {
        "status_field": "status",
        "statuses": ["open", "closed"],
        "sum_fields": ["total_pl"]
    }
}
```

**Response:**

```json
{
    "status": "success",
    "data": {
        "kpis": {
            "total_count": 100,
            "count_open": 50,
            "count_closed": 50,
            "sum_total_pl": 5000.00
        },
        "is_valid": true
    }
}
```

### חישוב Time-Weighted Return

**Endpoint:** `POST /api/business/statistics/time-weighted-return`

**Request Body:**

```json
{
    "account_id": 1,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "include_cash_flows": true
}
```

**Response:**

```json
{
    "status": "success",
    "data": {
        "time_weighted_return": 5.5,
        "periods": [
            {
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2024-03-01T00:00:00Z",
                "start_value": 1000.00,
                "end_value": 1200.00,
                "return": 20.0,
                "cash_flows": []
            },
            {
                "start_date": "2024-03-01T00:00:00Z",
                "end_date": "2024-12-31T23:59:59Z",
                "start_value": 1700.00,
                "end_value": 2000.00,
                "return": 17.65,
                "cash_flows": [
                    {
                        "date": "2024-03-01T00:00:00Z",
                        "amount": 500.00
                    }
                ]
            }
        ],
        "start_value": 1000.00,
        "end_value": 2000.00,
        "total_cash_flows": 500.00,
        "is_valid": true,
        "error": null
    }
}
```

---

## 📚 מקורות נוספים

### קבצים קשורים

- **קוד:** `Backend/services/business_logic/statistics_business_service.py`
- **API Routes:** `Backend/routes/api/business_logic.py`
- **Position Portfolio Service:** `Backend/services/position_portfolio_service.py`
- **Cash Flow Model:** `Backend/models/cash_flow.py`

### מסמכים קשורים

- `documentation/03-DEVELOPMENT/PLANS/BUSINESS_LOGIC_COMPLETE_SYSTEM_REFERENCE.md`
- `documentation/frontend/GENERAL_SYSTEMS_LIST.md`

---

## ⚠️ הערות חשובות למפתחים

1. **חישוב ערך תיק בנקודת זמן**:
   - הפונקציה `calculate_time_weighted_return()` דורשת שיפור בחישוב ערך תיק בנקודת זמן ספציפית.
   - **TODO**: להוסיף פונקציה ב-`PositionPortfolioService` שמחשבת ערך תיק על בסיס executions עד לנקודת זמן מסוימת.

2. **ביצועים**:
   - חישוב TWR יכול להיות כבד עבור תקופות ארוכות עם הרבה cash flows.
   - מומלץ להשתמש ב-caching או background jobs לחישובים חוזרים.

3. **תאריכים**:
   - כל התאריכים צריכים להיות ב-UTC או עם timezone ברור.
   - Cash flows ללא תאריך יידחו מהחישוב.

4. **ערכי תיק שליליים או אפס**:
   - תקופות עם ערך תיק 0 או שלילי בתחילה לא תתרחשנה לתשואה (return = 0.0).

---

**עודכן לאחרונה:** 22 נובמבר 2025  
**גרסה:** 1.0.0

