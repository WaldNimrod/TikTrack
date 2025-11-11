# Execution Trade Matching Service

## סקירה כללית

`ExecutionTradeMatchingService` הוא שירות Backend המספק הצעות חכמות לשיוך ביצועים לטריידים על בסיס קריטריוני התאמה שונים.

## מיקום

`Backend/services/execution_trade_matching_service.py`

## מטרה

לסייע למשתמשים לזהות ולשייך ביצועים ללא שיוך לטרייד (`trade_id IS NULL`) לטריידים הרלוונטיים על בסיס:
- התאמת טיקר (חובה)
- התאמת חשבון מסחר (אם קיים בביצוע)
- התאמת טווח תאריכים (תאריך ביצוע בטווח הטרייד)

## מבנה הנתונים

### Execution Model
- `ticker_id`: **חובה (NOT NULL)** - כל ביצוע חייב טיקר
- `trade_id`: **אופציונלי (NULLABLE)** - שיוך לטרייד
- `trading_account_id`: אופציונלי - חשבון מסחר

### Trade Model
- `ticker_id`: חובה
- `trading_account_id`: חובה
- `created_at`: תאריך פתיחת טרייד
- `closed_at`: תאריך סגירת טרייד (אופציונלי)

## מערכת ניקוד (Scoring System)

השירות משתמש במערכת ניקוד של 50-100 נקודות:

### Score 100 - התאמה מושלמת
- ✅ טיקר תואם
- ✅ חשבון מסחר תואם
- ✅ תאריך ביצוע בטווח הטרייד (בין `created_at` ל-`closed_at`)

### Score 70 - התאמה טובה
- ✅ טיקר תואם
- ✅ חשבון מסחר תואם
- ✅ תאריך ביצוע קרוב לטווח הטרייד (עד 7 ימים)

### Score 50 - התאמה בסיסית
- ✅ טיקר תואם בלבד

## API Methods

### `get_pending_executions(db: Session) -> List[Execution]`

מחזיר את כל הביצועים ללא שיוך לטרייד.

**פילטר:**
```python
Execution.trade_id.is_(None)
```

**Returns:**
- רשימת `Execution` objects עם `ticker` ו-`trading_account` loaded

### `suggest_trades_for_execution(db: Session, execution: Execution, max_suggestions: int = 5) -> List[Dict[str, Any]]`

מחזיר רשימת הצעות טריידים לביצוע ספציפי.

**Parameters:**
- `db`: Database session
- `execution`: Execution object
- `max_suggestions`: מספר מקסימלי של הצעות (ברירת מחדל: 5)

**Returns:**
רשימת dictionaries עם:
```python
{
    'trade_id': int,
    'score': int,  # 50-100
    'ticker_id': int,
    'ticker_symbol': str,
    'trading_account_id': int,
    'account_name': str,
    'status': str,
    'side': str,
    'investment_type': str,
    'created_at': str,  # ISO format
    'closed_at': str | None,
    'match_reasons': List[str]  # ['טיקר תואם', 'חשבון מסחר תואם', ...]
}
```

**Algorithm:**
1. מציאת כל הטריידים עם `ticker_id` תואם
2. חישוב score לכל טרייד
3. סינון טריידים עם score >= 50
4. מיון לפי score (יורד)
5. החזרת top N הצעות

### `suggest_trades_for_all_pending(db: Session, max_suggestions_per_execution: int = 5) -> Dict[int, List[Dict[str, Any]]]`

מחזיר הצעות לכל הביצועים הממתינים.

**Returns:**
Dictionary mapping `execution_id` → list of suggestions

## קריטריוני התאמה

### 1. Ticker Match (חובה)
- ביצוע חייב `ticker_id`
- טרייד חייב `ticker_id` זהה
- ללא התאמה זו, הטרייד לא יוצע

### 2. Account Match (+30 נקודות)
- אם לביצוע יש `trading_account_id`
- והטרייד יש `trading_account_id` זהה
- נותן +30 נקודות

### 3. Date Range Match (+20 נקודות)
- תאריך הביצוע בין `trade.created_at` ל-`trade.closed_at` (או `datetime.max` אם לא סגור)
- נותן +20 נקודות

### 4. Date Close Match (+10 נקודות)
- תאריך הביצוע קרוב לטווח הטרייד (עד 7 ימים)
- נותן +10 נקודות

## דוגמאות שימוש

### Python (Backend)
```python
from services.execution_trade_matching_service import ExecutionTradeMatchingService
from models.execution import Execution

# Get pending executions
pending = ExecutionTradeMatchingService.get_pending_executions(db)

# Get suggestions for specific execution
execution = db.query(Execution).filter(Execution.id == 123).first()
suggestions = ExecutionTradeMatchingService.suggest_trades_for_execution(
    db, execution, max_suggestions=5
)

# Get suggestions for all pending
all_suggestions = ExecutionTradeMatchingService.suggest_trades_for_all_pending(db)
```

### API Endpoints

#### GET /api/executions/pending-assignment
```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "ticker_id": 5,
            "ticker_symbol": "AAPL",
            "trading_account_id": 2,
            "account_name": "Account 1",
            "date": "2025-01-15 10:00:00",
            "quantity": 100,
            "price": 150.50,
            "action": "buy"
        }
    ],
    "count": 1
}
```

#### GET /api/executions/<id>/suggest-trades
```json
{
    "status": "success",
    "data": [
        {
            "trade_id": 10,
            "score": 100,
            "ticker_symbol": "AAPL",
            "account_name": "Account 1",
            "status": "open",
            "side": "Long",
            "match_reasons": ["טיקר תואם", "חשבון מסחר תואם", "תאריך בטווח הטרייד"]
        }
    ],
    "execution_id": 1,
    "count": 1
}
```

## יצירת טרייד מאשכול ביצועים

החל מגרסה 2.0.5 השירות מספק גם אשכולי ביצועים המיועדים ליצירת טרייד חדש במקום שיוך לטרייד קיים.

### פונקציה: `get_execution_trade_creation_clusters`

- קיבוץ לפי `ticker_id`, `trading_account_id` ו-`action` (ממופה ל־`side` = Long/Short).
- מחשב סיכומים: כמות כוללת, שווי, עמלה, מספר ביצועים, מחיר ממוצע וטווח תאריכים (`date_range`).
- שומר את מזהי הביצועים ברירת מחדל לבחירה (`execution_ids`).
- בונה אובייקט `suggested_trade` עם שדות מקדימים ליצירת טרייד (כמות, מחיר כניסה, תאריך כניסה, מקור דומיננטי והערות מסוכמות).
- מייצר `flags` לזיהוי תרחישים מיוחדים (לדוגמה: ריבוי ביצועים, ריבוי מקורות, הימצאות הערות).

### API: `GET /api/executions/pending-assignment/trade-creation-clusters`

- מחזיר רשימת אשכולות במבנה המנורמל (כולל DateEnvelope על טווחי תאריכים).
- תומך בפרמטר `limit` לסינון כמות האשכולות.
- משמש שתי ממשקי UI:
  - סקשן חדש בעמוד `executions` המציג כרטיסי אשכול עם בחירה חלקית של ביצועים וכפתור "פתח טרייד חדש".
  - ווידג׳ט בדף הבית המציג עד ארבעה אשכולות בולטים.

### חיבור למערכות נוספות

- קליק על "פתח טרייד" פותח את מודול `tradesModal` באמצעות `ModalManagerV2.populateForm` וממלא את הטופס בערכים שמוחזרים מהשירות.
- לאחר יצירת טרייד חדש מתבצע קריאה ל־`POST /api/executions/batch-assign` כדי לשייך את כל הביצועים שנבחרו לטרייד שנוצר.
- `PendingExecutionTradeCreation.handleTradeCreated` דואג לעדכן את רשימת האשכולות ולעדכן את טבלת הביצועים.

## ביצועים

- השירות משתמש ב-`joinedload` למניעת N+1 queries
- מיון מתבצע ב-Python (לא ב-SQL) כדי לאפשר לוגיקת score מורכבת
- מומלץ להשתמש ב-`max_suggestions` קטן (5-10) לביצועים טובים

## הגבלות

1. **Ticker Match Required**: ללא התאמת טיקר, לא יוצעו טריידים
2. **Score Threshold**: רק טריידים עם score >= 50 מוחזרים
3. **Date Range**: חישוב תאריכים מבוסס על `datetime` objects
4. **Account Optional**: אם לביצוע אין `trading_account_id`, לא יקבל נקודות bonus

## שינויים עתידיים אפשריים

- הוספת קריטריונים נוספים (כמות, מחיר)
- Weighted scoring (משקלים שונים לקריטריונים)
- Machine learning לניבוי התאמות
- Caching של הצעות

## קשרים למערכות אחרות

- **Executions API**: משתמש ב-service זה
- **Frontend Suggestions**: קורא ל-API endpoints
- **Dashboard Widget**: מציג ביצועים ממתינים

## תיעוד נוסף

- [Executions Flexible Association](./EXECUTIONS_FLEXIBLE_ASSOCIATION.md)
- [Executions User Guide](../../05-USER-GUIDES/EXECUTIONS_USER_GUIDE.md)
- [Execution Trade Assignment Guide](../../05-USER-GUIDES/EXECUTION_TRADE_ASSIGNMENT_GUIDE.md)

