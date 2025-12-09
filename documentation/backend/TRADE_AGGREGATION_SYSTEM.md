# Trade Aggregation System - TikTrack

## מערכת כללית לאגרגציית נתוני טריידים

**תאריך יצירה:** 06/12/2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ פעיל ומתועד  
**מטרה:** מערכת כללית לאגרגציית נתוני טריידים מלאים לשימושים שונים

---

## 📋 תוכן עניינים

1. [מבוא](#מבוא)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [API Reference](#api-reference)
4. [שימוש במערכת](#שימוש-במערכת)
5. [פורמט נתונים](#פורמט-נתונים)
6. [דוגמאות שימוש](#דוגמאות-שימוש)
7. [אינטגרציות](#אינטגרציות)

---

## 🎯 מבוא

`TradeAggregationService` היא מערכת כללית המאפשרת איסוף ועיבוד נתוני טריידים מלאים, כולל:

- **Trade Data** - נתוני טרייד בסיסיים
- **Executions** - כל הביצועים של הטרייד
- **Trade Plans** - תוכניות מסחר מקושרות
- **Conditions** - תנאי מסחר (Trade Conditions + Plan Conditions)
- **Position Data** - מצב פוזיציה נוכחי (מחושב)
- **Summary Statistics** - סטטיסטיקות כוללות

### שימושים עיקריים

1. **AI Analysis** - ניתוחים מבוססי AI (Portfolio Performance, Technical Analysis, Risk Assessment)
2. **Reports** - דוחות מפורטים על ביצועי מסחר
3. **Statistics** - חישובי סטטיסטיקות מורכבות
4. **Dashboards** - וידג'טים עתידיים

---

## 🏗️ ארכיטקטורה

### מיקום קבצים

```
Backend/
├── services/
│   └── trade_aggregation_service.py    # השירות הראשי
├── models/
│   ├── trade.py                        # Trade model
│   ├── execution.py                    # Execution model
│   ├── trade_plan.py                   # TradePlan model
│   └── trade_condition.py              # TradeCondition model
```

### תלויות

- `PositionPortfolioService` - חישוב פוזיציות
- `PositionCalculatorService` - חישובי פוזיציה בסיסיים
- SQLAlchemy ORM - גישה למסד הנתונים

---

## 📚 API Reference

### `aggregate_trades()`

מבצע איגוד מלא של נתוני טריידים לפי פילטרים שונים.

#### חתימה

```python
@staticmethod
def aggregate_trades(
    db: Session,
    user_id: int,
    trade_id: Optional[int] = None,
    trade_ids: Optional[List[int]] = None,
    ticker_id: Optional[int] = None,
    ticker_symbol: Optional[str] = None,
    trading_account_id: Optional[int] = None,
    investment_type: Optional[str] = None,
    trading_method_id: Optional[int] = None,
    status: Optional[str] = None,
    status_list: Optional[List[str]] = None,
    side: Optional[str] = None,
    date_range_start: Optional[datetime] = None,
    date_range_end: Optional[datetime] = None,
    date_field: str = 'created_at',
    include_closed: bool = True,
    include_cancelled: bool = False,
    enrich_with_position: bool = True,
    enrich_with_market_data: bool = False
) -> Dict[str, Any]
```

#### פרמטרים

| פרמטר | סוג | חובה | תיאור |
|--------|-----|------|-------|
| `db` | Session | ✅ | Database session |
| `user_id` | int | ✅ | User ID (always filtered) |
| `trade_id` | int | ❌ | Single trade ID (takes precedence) |
| `trade_ids` | List[int] | ❌ | Multiple trade IDs |
| `ticker_id` | int | ❌ | Filter by ticker ID |
| `ticker_symbol` | str | ❌ | Filter by ticker symbol |
| `trading_account_id` | int | ❌ | Filter by trading account |
| `investment_type` | str | ❌ | Filter by investment type |
| `trading_method_id` | int | ❌ | Filter by trading method |
| `status` | str | ❌ | Filter by single status |
| `status_list` | List[str] | ❌ | Filter by multiple statuses |
| `side` | str | ❌ | Filter by side (Long/Short) |
| `date_range_start` | datetime | ❌ | Start date for range |
| `date_range_end` | datetime | ❌ | End date for range |
| `date_field` | str | ❌ | Which date field ('created_at' or 'closed_at') |
| `include_closed` | bool | ❌ | Include closed trades (default: True) |
| `include_cancelled` | bool | ❌ | Include cancelled trades (default: False) |
| `enrich_with_position` | bool | ❌ | Calculate position data (default: True) |
| `enrich_with_market_data` | bool | ❌ | Include market prices (default: False) |

#### החזרה

```python
{
    "trades": [
        {
            "trade": {...},              # Trade data
            "executions": [...],         # List of executions
            "trade_plan": {...},         # TradePlan data (if exists)
            "conditions": [...],         # Trade conditions
            "position": {...},           # Current position (if calculated)
            "summary": {...}             # Trade summary stats
        }
    ],
    "aggregate_summary": {
        "total_trades": int,
        "total_pl": float,
        "realized_pl": float,
        "unrealized_pl": float,
        "total_fees": float,
        "win_rate": float,
        "avg_holding_period": float,
        "closed_trades_count": int,
        "open_trades_count": int,
        "winning_trades_count": int
    },
    "filters_applied": {...}            # Summary of applied filters
}
```

### `format_trades_for_ai()`

מעצב את נתוני הטריידים לפורמט מובנה למנוע AI.

#### חתימה

```python
@staticmethod
def format_trades_for_ai(aggregated_data: Dict[str, Any]) -> str
```

#### פרמטרים

| פרמטר | סוג | תיאור |
|--------|-----|-------|
| `aggregated_data` | Dict[str, Any] | תוצאה מ-`aggregate_trades()` |

#### החזרה

מחרוזת בפורמט מובנה עם:

- סקירה כללית (סה"כ טריידים, win rate, P/L כולל)
- פרטי כל טרייד (ID, Status, Ticker, Executions, Trade Plan, Conditions, Position)
- סיכום סטטיסטיקות

---

## 💻 שימוש במערכת

### דוגמה בסיסית

```python
from services.trade_aggregation_service import TradeAggregationService
from config.database import SessionLocal

db = SessionLocal()
user_id = 11

# אגרגציה בסיסית - כל הטריידים של המשתמש
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    include_closed=True
)

# פורמט למנוע AI
formatted = TradeAggregationService.format_trades_for_ai(result)
```

### דוגמה עם פילטרים

```python
# טריידים של טיקר ספציפי
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    ticker_symbol='TSLA',
    date_range_start=datetime(2024, 1, 1),
    date_range_end=datetime(2024, 12, 31),
    investment_type='Swing Trading',
    include_closed=True
)

# טרייד בודד
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    trade_id=1929
)
```

---

## 📊 פורמט נתונים

### Trade Object

```python
{
    "id": int,
    "ticker_id": int,
    "trading_account_id": int,
    "investment_type": str,
    "side": str,                    # "Long" or "Short"
    "status": str,                  # "open", "closed", "cancelled"
    "planned_amount": float,
    "planned_quantity": float,
    "entry_price": float,
    "total_pl": float,
    "created_at": datetime,
    "opened_at": datetime,
    "closed_at": datetime,
    "ticker": {...},                # Ticker object
    "account": {...}                # TradingAccount object
}
```

### Execution Object

```python
{
    "id": int,
    "trade_id": int,
    "action": str,                  # "BUY" or "SELL"
    "quantity": float,
    "price": float,
    "fee": float,
    "date": datetime
}
```

### Position Object (Calculated)

```python
{
    "quantity": float,
    "average_price": float,
    "total_cost": float,
    "total_fees": float,
    "side": str,                    # "long", "short", "closed"
    "last_updated": datetime,
    "total_bought": float,
    "total_sold": float
}
```

---

## 🔗 אינטגרציות

### AI Analysis System

השירות משמש את `AIAnalysisService` להבאת נתוני טריידים עבור:

1. **Portfolio Performance Analysis** - ניתוח ביצועים ופורטפוליו
2. **Technical Analysis** - ניתוח טכני מבוסס נתונים היסטוריים
3. **Risk & Conditions Analysis** - ניתוח סיכונים ותנאים

**קוד דוגמה:**

```python
# ב-AIAnalysisService.generate_analysis()
from services.trade_aggregation_service import TradeAggregationService

# Aggregate trades based on filters
enriched_data = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    ticker_symbol=prompt_variables.get('ticker_symbol'),
    date_range_start=start_date,
    date_range_end=end_date,
    trading_account_id=filters.get('trading_account_id')
)

# Format for AI
trade_data_str = TradeAggregationService.format_trades_for_ai(enriched_data)

# Inject into prompt
prompt = prompt.replace("{trade_data_structured}", trade_data_str)
```

### Reports System (עתידי)

השירות יכול לשמש ליצירת דוחות מפורטים:

```python
# דוח ביצועים חודשי
result = TradeAggregationService.aggregate_trades(
    db=db,
    user_id=user_id,
    date_range_start=month_start,
    date_range_end=month_end,
    include_closed=True
)

# השתמש ב-aggregate_summary לסטטיסטיקות
summary = result['aggregate_summary']
print(f"Total P/L: {summary['total_pl']}")
print(f"Win Rate: {summary['win_rate'] * 100}%")
```

---

## 🧪 בדיקות

### קובץ בדיקות

`Backend/scripts/test_trade_aggregation_service.py`

### הרצת בדיקות

```bash
python3 Backend/scripts/test_trade_aggregation_service.py
```

### בדיקות זמינות

1. **Basic Trade Aggregation** - אגרגציה בסיסית
2. **Filtered Aggregation** - סינון לפי ticker_id
3. **Individual Trade Enrichment** - העשרת טרייד בודד
4. **AI Formatting** - פורמט למנוע AI

---

## 📝 הערות חשובות

1. **Performance** - השירות משתמש ב-eager loading (`joinedload`) לביצועים טובים
2. **Position Calculation** - חישוב פוזיציות נעשה באמצעות `PositionPortfolioService`
3. **Memory** - עבור כמויות גדולות של טריידים, יש לשקול pagination
4. **Error Handling** - כל שגיאה מתועדת ב-logger

---

## 🔄 גרסאות

### v1.0.0 (06/12/2025)

- ✅ יצירה ראשונית של השירות
- ✅ תמיכה בפילטרים מרובים
- ✅ חישוב פוזיציות אוטומטי
- ✅ פורמט למנוע AI
- ✅ אינטגרציה עם AI Analysis System

---

## 📚 קבצים קשורים

- `Backend/services/trade_aggregation_service.py` - השירות הראשי
- `Backend/services/ai_analysis_service.py` - שימוש ב-AI Analysis
- `Backend/services/position_portfolio_service.py` - חישוב פוזיציות
- `documentation/04-FEATURES/AI_ANALYSIS_TRADE_DATA_FORMAT.md` - פורמט נתונים ל-AI

---

**עודכן לאחרונה:** 06/12/2025


