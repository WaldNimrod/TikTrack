# אינטגרציה User-Ticker - תיעוד ארכיטקטורה

**תאריך יצירה:** 4 בדצמבר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מיושם ומאומת

---

## סקירה כללית

מערכת TikTrack משתמשת בטבלת שיוך `user_tickers` ליצירת קשר many-to-many בין משתמשים לטיקרים. זה מאפשר:

1. **חד-ערכיות בטבלת הטיקרים:** כל טיקר קיים פעם אחת בלבד במערכת
2. **רשימות מותאמות אישית:** כל משתמש יכול להגדיר רשימת טיקרים משלו
3. **שדות מותאמים אישית:** כל משתמש יכול להגדיר שם וסוג מותאמים לטיקרים שלו
4. **סטטוס דו-שכבתי:** סטטוס ברמת שיוך (user-ticker) וברמת טיקר כללי

---

## ארכיטקטורת נתונים

### מודל UserTicker

**קובץ:** `Backend/models/user_ticker.py`

```python
class UserTicker(BaseModel):
    __tablename__ = "user_tickers"
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    ticker_id = Column(Integer, ForeignKey('tickers.id', ondelete='CASCADE'))
    
    # שדות מותאמים אישית
    name_custom = Column(String(100), nullable=True)
    type_custom = Column(String(20), nullable=True)
    
    # סטטוס ברמת שיוך
    status = Column(String(20), default='open', nullable=False)
    
    # טיימסטמפים
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Constraints
    UniqueConstraint('user_id', 'ticker_id')
```

### סטטוס דו-שכבתי

#### 1. סטטוס ברמת שיוך (User-Ticker)

**חישוב:** מבוסס על טריידים ותוכניות פעילים של המשתמש

```python
def update_user_ticker_status(db, user_id, ticker_id):
    """
    מעדכן סטטוס ברמת שיוך:
    - 'open' אם יש טריידים/תוכניות פעילים
    - 'closed' אם אין טריידים/תוכניות פעילים
    - 'cancelled' אם המשתמש ביטל את השיוך (לא מתעדכן אוטומטית)
    """
```

**טריגרים:**

- יצירת טרייד/תוכנית
- סגירת טרייד/תוכנית
- ביטול טרייד/תוכנית

#### 2. סטטוס ברמת טיקר (Ticker-level)

**חישוב:** מבוסס על כל השיוכים של כל המשתמשים

```python
def update_ticker_status_auto(db, ticker_id):
    """
    מעדכן סטטוס כללי של טיקר:
    - 'open' אם יש לפחות משתמש אחד עם שיוך 'open'
    - 'closed' אם אין אף משתמש עם שיוך 'open'
    - 'cancelled' אם הטיקר בוטל (לא מתעדכן אוטומטית)
    """
```

**שימוש:**

- קובע את העבודה מול מערכת הנתונים החיצוניים
- קובע את תדירות הטעינה של נתונים חיצוניים

---

## שירותים (Services)

### TickerService

**קובץ:** `Backend/services/ticker_service.py`

#### `get_user_tickers(db, user_id) -> List[Ticker]`

מחזיר רק טיקרים של המשתמש הפעיל, כולל שדות מותאמים.

```python
tickers = TickerService.get_user_tickers(db, user_id=10)
# מחזיר 52 טיקרים למשתמש 10
# כל ticker כולל: name_custom, type_custom, user_ticker_status
```

**אופטימיזציה:**

- משתמש ב-`joinedload` למניעת N+1 queries
- ביצועים: ~0.002s למשתמש עם 52 טיקרים

#### `update_user_ticker_status(db, user_id, ticker_id) -> bool`

מעדכן סטטוס ברמת שיוך.

**קריאה אוטומטית:**

- `TradeService.create/update/close/cancel`
- `TradePlanService.create/update/cancel/activate`

#### `update_ticker_status_auto(db, ticker_id) -> bool`

מעדכן סטטוס כללי של טיקר.

**קריאה אוטומטית:**

- אחרי `update_user_ticker_status`
- אחרי יצירה/עדכון/ביטול שיוך

---

## API Endpoints

### GET /api/tickers/

**קובץ:** `Backend/routes/api/tickers.py`

**שינוי:** מחזיר רק טיקרים של המשתמש הפעיל

```python
@tickers_bp.route('/', methods=['GET'])
def get_tickers():
    user_id = g.get('user_id') or request.args.get('user_id', type=int)
    tickers = TickerService.get_user_tickers(db, user_id)
    # ...
```

### GET /api/tickers/my

**שינוי:** משתמש ב-`get_user_tickers` (זהה ל-`/api/tickers/`)

**תגובה:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 7,
      "symbol": "QQQ",
      "name": "Invesco QQQ Trust",
      "name_custom": null,
      "type_custom": null,
      "user_ticker_status": "open"
    }
  ]
}
```

### POST /api/tickers/

**לוגיקה:**

1. בודק אם הטיקר כבר קיים (לפי `symbol`)
2. אם קיים → יוצר שיוך ב-`user_tickers`
3. אם לא קיים → יוצר טיקר חדש ואז שיוך

**שדות מותאמים:**

- `name_custom` - שם חברה מותאם אישית
- `type_custom` - סוג נכס מותאם אישית

### PUT /api/tickers/<id>

**לוגיקה:**

- עדכון שדות מותאמים (`name_custom`, `type_custom`) ב-`user_tickers`
- עדכון שדות כלליים (`symbol`, `name`, `type`) רק למנהל (עתידי)

### DELETE /api/tickers/<id>

**לוגיקה:**

- מבטל שיוך משתמש (`status = 'cancelled'`)
- לא מוחק את הטיקר מהטבלה הראשית
- מעדכן סטטוס כללי

### DELETE /api/tickers/<id>/admin-delete

**לוגיקה:**

- רק למנהל
- בודק שאין שיוכים פעילים
- מוחק את הטיקר מהטבלה הראשית (cascade)

---

## Frontend Integration

### TickersData Service

**קובץ:** `trading-ui/scripts/services/tickers-data.js`

#### `getUserTickers(options)`

מחזיר רק טיקרים של המשתמש הפעיל.

```javascript
const tickers = await window.tickersData.getUserTickers({ force: true });
// מחזיר טיקרים עם name_custom, type_custom, user_ticker_status
```

#### `getAllTickers(options)`

**שינוי:** קורא ל-`getUserTickers` (לשמירה על עקביות)

### SelectPopulatorService

**קובץ:** `trading-ui/scripts/services/select-populator-service.js`

#### `populateTickersSelect(selectIdOrElement, options)`

**שינוי:**

- משתמש ב-`/api/tickers/my` במקום `/api/tickers/`
- מציג `name_custom` אם קיים, אחרת `name`
- מציג `type_custom` אם קיים, אחרת `type`
- ממיין אלפביתית לפי `symbol` ואז `name`

### TickerService

**קובץ:** `trading-ui/scripts/ticker-service.js`

#### `loadTickersForTradePlan(selectId)`

**שינוי:**

- משתמש ב-`/api/tickers/my`
- ממיין אלפביתית
- מציג שדות מותאמים

### עמוד טיקרים

**קובץ:** `trading-ui/scripts/tickers.js`

**שינויים:**

- מציג `name_custom` במקום `name` (אם קיים)
- מציג `type_custom` במקום `type` (אם קיים)
- מציג סטטוס ברמת שיוך (`user_ticker_status`)

---

## מיגרציה

### הוספת שדות ל-user_tickers

**קובץ:** `Backend/migrations/add_user_ticker_custom_fields.py`

**שדות שנוספו:**

- `name_custom` (VARCHAR(100) NULL)
- `type_custom` (VARCHAR(20) NULL)
- `status` (VARCHAR(20) DEFAULT 'open' NOT NULL)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### יצירת שיוכים ראשוניים

**קובץ:** `Backend/scripts/migrate_user_ticker_associations.py`

**לוגיקה:**

1. עבור כל משתמש:
   - איתור טיקרים מטריידים, תוכניות וביצועים
   - יצירת שיוך ב-`user_tickers`
   - חישוב סטטוס ראשוני (open/closed)

**תוצאות:**

- User 10 (admin): 52 טיקרים
- User 11 (user): 19 טיקרים
- סה"כ: 83 שיוכים

---

## אופטימיזציה וביצועים

### אינדקסים

**קובץ:** `Backend/scripts/optimize_user_ticker_indexes.py`

**אינדקסים שנוצרו:**

- `idx_user_tickers_user_status` (user_id, status)
- `idx_user_tickers_ticker_status` (ticker_id, status)
- `idx_user_tickers_status` (status)

### ביצועים

**תוצאות בדיקות:**

- `get_user_tickers`: 0.002s (1 query, ללא N+1)
- `update_ticker_status_auto`: 0.001s
- `update_user_ticker_status`: 0.002s

**אופטימיזציות:**

- שימוש ב-`joinedload` למניעת N+1 queries
- אינדקסים מותאמים ל-queries הנפוצים

---

## בדיקות

### קבצי בדיקה

1. **`Backend/scripts/test_user_ticker_integration.py`**
   - בדיקות אינטגרציה מקיפות (7/7 עברו)
   - בדיקות שלמות נתונים
   - בדיקות עקביות סטטוס

2. **`Backend/scripts/test_user_ticker_performance.py`**
   - בדיקות ביצועים
   - זיהוי N+1 queries
   - בדיקות bulk operations

3. **`Backend/scripts/test_user_ticker_comprehensive_report.py`**
   - דוח מקיף של כל הבדיקות

4. **`trading-ui/scripts/test-user-ticker-frontend.js`**
   - בדיקות Frontend (להרצה בדפדפן)

5. **`trading-ui/test_user_ticker_integration.html`**
   - דף בדיקה אינטראקטיבי

### תוצאות בדיקות

**Backend:** ✅ כל הבדיקות עברו (7/7)  
**Frontend:** ✅ עובד מצוין עם משתמש מנהל (52 טיקרים)  
**ביצועים:** ✅ כל הפעולות < 2ms

---

## קבצים מעודכנים

### Backend

- `Backend/models/user_ticker.py` - הוספת שדות מותאמים וסטטוס
- `Backend/services/ticker_service.py` - לוגיקת סטטוס דו-שכבתי
- `Backend/routes/api/tickers.py` - עדכון endpoints
- `Backend/services/trade_service.py` - טריגרים לעדכון סטטוס
- `Backend/services/trade_plan_service.py` - טריגרים לעדכון סטטוס

### Frontend

- `trading-ui/scripts/services/tickers-data.js` - שימוש ב-`/api/tickers/my`
- `trading-ui/scripts/services/select-populator-service.js` - עדכון `populateTickersSelect`
- `trading-ui/scripts/ticker-service.js` - עדכון `loadTickersForTradePlan`
- `trading-ui/scripts/tickers.js` - הצגת שדות מותאמים
- `trading-ui/scripts/ticker_dashboard.js` - בחירת טיקר מרשימת המשתמש
- `trading-ui/scripts/ai_analysis-manager.js` - עדכון `populateTickersSelect`

### Database

- `Backend/migrations/add_user_ticker_custom_fields.py` - מיגרציה
- `Backend/scripts/migrate_user_ticker_associations.py` - יצירת שיוכים ראשוניים

---

## כללי שימוש

### 1. קבלת טיקרים של משתמש

```python
# Backend
tickers = TickerService.get_user_tickers(db, user_id=10)
```

```javascript
// Frontend
const tickers = await window.tickersData.getUserTickers({ force: true });
```

### 2. יצירת טיקר חדש

```python
# Backend - API
POST /api/tickers/
{
  "symbol": "AAPL",
  "name_custom": "אפל שלי",
  "type_custom": "מניה"
}
```

### 3. עדכון שדות מותאמים

```python
# Backend - API
PUT /api/tickers/7
{
  "name_custom": "שם מותאם",
  "type_custom": "סוג מותאם"
}
```

### 4. ביטול שיוך

```python
# Backend - API
DELETE /api/tickers/7
# מבטל שיוך (status = 'cancelled')
```

---

## הערות חשובות

1. **חד-ערכיות:** טבלת `tickers` נשארת משותפת - כל טיקר קיים פעם אחת בלבד
2. **שדות מותאמים:** `name_custom` ו-`type_custom` הם ברמת שיוך, לא ברמת טיקר
3. **סטטוס:** סטטוס ברמת שיוך מתעדכן אוטומטית, סטטוס כללי מתעדכן לפי כל השיוכים
4. **מחיקה:** רק מנהל יכול למחוק טיקר מהטבלה הראשית
5. **מיון:** כל רשימות הטיקרים ממוינות אלפביתית לפי `symbol` ואז `name`

---

## קישורים רלוונטיים

- [תוכנית מימוש מקיפה](../03-DEVELOPMENT/PLANS/USER_TICKER_INTEGRATION_PLAN.md)
- [דוח בדיקות סופי](../../Backend/scripts/TEST_RESULTS_FINAL.md)
- [דוח בדיקות מקיף](../../Backend/scripts/TEST_RESULTS_SUMMARY.md)

