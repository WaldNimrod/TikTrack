# מערכת טיקרים - TikTrack

## סקירה כללית

מערכת הטיקרים מאפשרת ניהול מניות, ETFs, מטבעות קריפטו וניירות ערך אחרים במערכת TikTrack. המערכת כוללת מנגנון אוטומטי לעדכון סטטוסים המבוסס על פריטים מקושרים.

## ארכיטקטורה

### מודל Ticker
- **סמל ייחודי**: כל טיקר חייב להיות בעל סמל ייחודי
- **סוג נכס**: stock, etf, crypto, forex, commodity
- **סטטוס**: open, closed, cancelled
- **שדה active_trades**: מציין האם יש trades פעילים

### סטטוסים אוטומטיים

#### סטטוס 'open'
- יש trades עם סטטוס 'open' **או**
- יש trade_plans עם סטטוס 'open'

#### סטטוס 'closed'
- אין trades עם סטטוס 'open' **וגם**
- אין trade_plans עם סטטוס 'open'

#### סטטוס 'cancelled'
- סטטוס ידני - לא משתנה אוטומטית
- נשאר 'cancelled' גם אם יש פריטים מקושרים

## טריגרים אוטומטיים

### SQLAlchemy Event Listeners

#### Trade Events
```python
@event.listens_for(Trade, 'after_insert')
@event.listens_for(Trade, 'after_update')
@event.listens_for(Trade, 'after_delete')
```

#### TradePlan Events
```python
@event.listens_for(TradePlan, 'after_insert')
@event.listens_for(TradePlan, 'after_update')
@event.listens_for(TradePlan, 'after_delete')
```

### אילוצי מסד נתונים

#### active_trades_consistency
```sql
(active_trades = 1 AND EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) 
OR (active_trades = 0 AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open')) 
OR active_trades IS NULL
```

#### ticker_status_auto_update
```sql
(status = 'cancelled') 
OR (status = 'open' AND (EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') 
                        OR EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))) 
OR (status = 'closed' AND NOT EXISTS (SELECT 1 FROM trades WHERE trades.ticker_id = tickers.id AND trades.status = 'open') 
    AND NOT EXISTS (SELECT 1 FROM trade_plans WHERE trade_plans.ticker_id = tickers.id AND trade_plans.status = 'open'))
```

## פונקציות עדכון

### update_ticker_status_from_linked_items
```python
@staticmethod
def update_ticker_status_from_linked_items(session, ticker_id: int) -> None:
    """
    Update ticker status based on linked trades and trade plans
    
    Note: This function respects the 'cancelled' status - if a ticker is cancelled,
    it will not be automatically updated to open/closed status.
    """
```

### update_all_ticker_statuses
```python
@staticmethod
def update_all_ticker_statuses(session) -> None:
    """
    Update status for all tickers based on their linked trades and trade plans
    
    Note: This function respects the 'cancelled' status - cancelled tickers
    will not be automatically updated to open/closed status.
    """
```

## פעולות ידניות

### ביטול טיקר
- **API**: `POST /api/v1/tickers/{id}/cancel`
- **סטטוס**: משתנה ל-'cancelled'
- **השפעה**: לא משתנה אוטומטית

### הפעלה מחדש
- **API**: `PUT /api/v1/tickers/{id}` עם status: 'open'
- **סטטוס**: משתנה ל-'open'
- **השפעה**: נבדק מול פריטים מקושרים

### מחיקת טיקר
- **API**: `DELETE /api/v1/tickers/{id}`
- **בדיקה**: מונע מחיקה אם יש פריטים מקושרים
- **השפעה**: מוחק רק אם אין פריטים מקושרים

## סקריפט תיקון

### fix_ticker_statuses.py
סקריפט לתיקון סטטוסי טיקרים קיימים:

```bash
# בדיקה בלבד
python Backend/scripts/fix_ticker_statuses.py --verify-only

# תיקון סטטוסים
python Backend/scripts/fix_ticker_statuses.py --fix

# בדיקה ותיקון אוטומטי
python Backend/scripts/fix_ticker_statuses.py
```

### פונקציות הסקריפט
- `verify_ticker_statuses()` - בדיקת עקביות סטטוסים
- `fix_all_ticker_statuses()` - תיקון כל הסטטוסים הלא נכונים

## תהליכים שמפעילים טריגרים

### 1. יצירת Trade
- **API**: `POST /api/v1/trades/`
- **טריגר**: `trade_inserted`
- **עדכון**: סטטוס טיקר ל-'open' אם יש trades פתוחים

### 2. עדכון Trade
- **API**: `PUT /api/v1/trades/{id}`
- **טריגר**: `trade_updated`
- **עדכון**: סטטוס טיקר בהתאם לסטטוס ה-trade

### 3. מחיקת Trade
- **API**: `DELETE /api/v1/trades/{id}`
- **טריגר**: `trade_deleted`
- **עדכון**: סטטוס טיקר ל-'closed' אם אין trades פתוחים

### 4. יצירת TradePlan
- **API**: `POST /api/v1/trade_plans/`
- **טריגר**: `trade_plan_inserted`
- **עדכון**: סטטוס טיקר ל-'open' אם יש plans פתוחים

### 5. עדכון TradePlan
- **API**: `PUT /api/v1/trade_plans/{id}`
- **טריגר**: `trade_plan_updated`
- **עדכון**: סטטוס טיקר בהתאם לסטטוס ה-plan

### 6. מחיקת TradePlan
- **API**: `DELETE /api/v1/trade_plans/{id}`
- **טריגר**: `trade_plan_deleted`
- **עדכון**: סטטוס טיקר ל-'closed' אם אין plans פתוחים

## מעקב וניטור

### לוגים
כל פעולת עדכון סטטוס מתועדת בלוגים:
```
INFO: Processing ticker 1 (AAPL) - current status: open
INFO: Fixed ticker AAPL: closed -> open
INFO: Ticker MSFT status is correct: open
```

### התראות שגיאה
שגיאות בטריגרים מתועדות אך לא עוצרות את התהליך:
```
ERROR: Error in trade_inserted event: [error details]
WARNING: Could not update ticker active_trades status: [error details]
```

## בדיקות ותחזוקה

### בדיקת עקביות
```python
# בדיקה ידנית
incorrect_count = verify_ticker_statuses()
print(f"Found {incorrect_count} incorrect statuses")
```

### תיקון אוטומטי
```python
# תיקון כל הסטטוסים
fixed_count = fix_all_ticker_statuses()
print(f"Fixed {fixed_count} ticker statuses")
```

### עדכון כללי
```python
# עדכון כל הטיקרים
update_all_tickers_open_status()
```

## שיקולי ביצועים

### אופטימיזציה
- טריגרים פועלים רק על שינויים רלוונטיים
- עדכונים מתבצעים ברמת הטיקר הספציפי
- שימוש ב-session pooling למניעת דליפות זיכרון

### ניטור
- מעקב אחר זמני ביצוע של טריגרים
- התראות על שגיאות חוזרות
- לוגים מפורטים לבדיקת בעיות

## תאימות ומיגרציה

### גרסאות קודמות
- המערכת תואמת לגרסאות קודמות
- סטטוסים קיימים נשמרים
- מיגרציה אוטומטית בעת עדכון

### גיבוי
- גיבוי אוטומטי לפני שינויים משמעותיים
- אפשרות שחזור לסטטוסים קודמים
- תיעוד שינויים בהיסטוריית גרסאות
