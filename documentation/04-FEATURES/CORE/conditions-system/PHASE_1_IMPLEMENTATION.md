# תיעוד טכני - שלב 1: מימוש מינימלי ויפה של היכולות הקיימות

**תאריך:** 2025-12-18  
**סטטוס:** הושלם ✅

---

## סקירה כללית

שלב 1 מיישם מימוש מינימלי ויפה של מערכת התנאים הקיימת, עם דגש על:

1. בדיקת דרישות נתונים אוטומטית
2. הצגת מצב כשירות ב-UI
3. הודעות למשתמש
4. קישור חזרה לישות בהתראות
5. בדיקות מקיפות

---

## רכיבים עיקריים

### Backend

#### 1. ConditionsDataRequirementsService

**מיקום:** `Backend/services/conditions_data_requirements_service.py`

**תפקיד:** בדיקת דרישות נתונים לתנאים וקביעת מצב כשירות

**פונקציות עיקריות:**

- `get_condition_data_requirements(condition)` - גזירת דרישות נתונים לפי סוג תנאי
- `get_missing_data_for_condition(condition, ticker_id)` - רשימת נתונים חסרים
- `check_condition_readiness(condition_id, condition_type, ticker_id)` - מצב כשירות

**דוגמת שימוש:**

```python
from services.conditions_data_requirements_service import ConditionsDataRequirementsService

service = ConditionsDataRequirementsService(db_session)
readiness = service.check_condition_readiness(condition_id, 'plan', ticker_id)

# readiness = {
#     'status': 'ready' | 'waiting_for_data' | 'error',
#     'missing_data': ['current_quote', 'historical_data'],
#     'requirements': {...},
#     'message': '...'
# }
```

#### 2. API Integration

**קבצים מעודכנים:**

- `Backend/routes/api/plan_conditions.py`
- `Backend/routes/api/trade_conditions.py`

**שינויים:**

- הוספת קריאה ל-`check_condition_readiness` לאחר יצירה/עדכון
- החזרת `readiness_status`, `readiness_message`, `missing_data` בתגובה

**דוגמת תגובה:**

```json
{
  "status": "success",
  "data": {
    "id": 123,
    "method_id": 1,
    "readiness_status": "waiting_for_data",
    "readiness_message": "Missing: current_quote, historical_data",
    "missing_data": ["current_quote", "historical_data"]
  }
}
```

### Frontend

#### 1. ConditionsUIManager

**מיקום:** `trading-ui/scripts/conditions/conditions-ui-manager.js`

**שינויים:**

- הוספת פונקציה `formatReadinessCell(condition)` - הצגת מצב כשירות
- הוספת עמודה "מצב כשירות" בטבלה
- הוספת כפתור "טען נתונים" כאשר `readiness_status === 'waiting_for_data'`
- הוספת פונקציה `getTickerId()` - קבלת ticker_id מהישות

**דוגמת תצוגה:**

```javascript
// Badge עם צבעים:
// - ready: bg-success (ירוק)
// - waiting_for_data: bg-warning (צהוב)
// - error: bg-danger (אדום)

// כפתור טעינת נתונים מופיע רק ב-waiting_for_data
```

#### 2. הודעות למשתמש

**מיקום:** `trading-ui/scripts/conditions/conditions-ui-manager.js`

**שינויים:**

- עדכון `createCondition()` - הודעות לפי readiness_status
- עדכון `updateCondition()` - הודעות לפי readiness_status

**הודעות:**

- `ready`: "התנאי פעיל וניתן להערכה"
- `waiting_for_data`: "התנאי נשמר אבל יתחיל לעבוד לאחר השלמת נתונים"
- `error`: הודעת שגיאה

#### 3. הצגת התראות

**קבצים מעודכנים:**

- `trading-ui/scripts/alerts.js` - פונקציה `getConditionSourceDisplay()`
- `trading-ui/scripts/active-alerts-component.js` - הוספת שורת מקור תנאי
- `trading-ui/scripts/entity-details-renderer.js` - פונקציה `renderAlertConditionSource()`

**תכונות:**

- Badge עם איקון (📋 תכנית / 📈 טרייד)
- קישור חזרה לישות המקושרת (Trade Plan / Trade)
- הצגה ב-tooltip וב-body של כרטיסיית התראה

---

## דיאגרמות זרימה

### זרימת יצירת תנאי

```text
1. משתמש יוצר תנאי
   ↓
2. API שומר את התנאי
   ↓
3. ConditionsDataRequirementsService בודק דרישות נתונים
   ↓
4. MissingDataChecker בודק מה חסר
   ↓
5. API מחזיר readiness_status בתגובה
   ↓
6. Frontend מציג הודעה למשתמש
   ↓
7. אם waiting_for_data → כפתור "טען נתונים" מופיע
```

### זרימת הערכת תנאי

```text
1. Background task מריץ הערכת תנאים
   ↓
2. ConditionEvaluator מעריך את התנאי
   ↓
3. אם התנאי מתקיים → AlertService יוצר התראה
   ↓
4. Alert נשמר עם plan_condition_id / trade_condition_id
   ↓
5. Frontend מציג התראה עם קישור חזרה לישות
```

---

## API Endpoints

### Plan Conditions

- `GET /api/plan-conditions/trade-plans/{id}/conditions` - רשימת תנאים
- `POST /api/plan-conditions/trade-plans/{id}/conditions` - יצירת תנאי
- `GET /api/plan-conditions/{id}` - פרטי תנאי
- `PUT /api/plan-conditions/{id}` - עדכון תנאי
- `DELETE /api/plan-conditions/{id}` - מחיקת תנאי

**תגובה כוללת:**

```json
{
  "readiness_status": "ready" | "waiting_for_data" | "error",
  "readiness_message": "מחרוזת הודעה",
  "missing_data": ["current_quote", "historical_data"]
}
```

### Trade Conditions

- `GET /api/trade-conditions/trades/{id}/conditions` - רשימת תנאים
- `POST /api/trade-conditions/trades/{id}/conditions` - יצירת תנאי
- `GET /api/trade-conditions/{id}` - פרטי תנאי
- `PUT /api/trade-conditions/{id}` - עדכון תנאי
- `DELETE /api/trade-conditions/{id}` - מחיקת תנאי

**תגובה זהה ל-Plan Conditions**

---

## דוגמאות קוד

### Backend - בדיקת readiness

```python
from services.conditions_data_requirements_service import ConditionsDataRequirementsService

# בדיקת readiness לאחר יצירת תנאי
readiness_service = ConditionsDataRequirementsService(db_session)
readiness = readiness_service.check_condition_readiness(
    condition.id,
    'plan',
    plan.ticker_id
)

if readiness['status'] == 'waiting_for_data':
    # הודעה למשתמש: "התנאי נשמר אבל יתחיל לעבוד לאחר השלמת נתונים"
    pass
```

### Frontend - הצגת מצב כשירות

```javascript
// conditions-ui-manager.js
function formatReadinessCell(condition) {
  const readinessStatus = condition?.readiness_status || 'ready';
  
  if (readinessStatus === 'waiting_for_data') {
    return `
      <span class="badge bg-warning">ממתין לנתונים</span>
      <button onclick="loadData()">טען נתונים</button>
    `;
  }
  
  return `<span class="badge bg-success">מוכן</span>`;
}
```

### Frontend - טעינת נתונים

```javascript
// conditions-ui-manager.js
async getTickerId() {
  if (this.entityType === 'plan') {
    const response = await fetch(`/api/trade-plans/${this.entityId}`);
    const data = await response.json();
    return data?.data?.ticker_id;
  }
  // ... עבור trade
}

// שימוש בכפתור טעינת נתונים
await window.ExternalDataService.refreshTickerData(tickerId, {
  forceRefresh: false,
  includeHistorical: true,
  daysBack: 150
});
```

---

## בדיקות

### סקריפטי בדיקות

1. **test_conditions_ui.py** - בדיקות Selenium ל-UI
   - פתיחת מודאל תנאים
   - יצירת תנאי
   - הצגת מצב כשירות

2. **test_conditions_api.py** - בדיקות API
   - כל ה-endpoints
   - readiness_status בתגובות
   - alert mapping

3. **test_conditions_evaluation.py** - בדיקות הערכה
   - הערכת תנאי
   - יצירת התראות
   - lifecycle של התראות

4. **test_conditions_data_loading.py** - בדיקות טעינת נתונים
   - זיהוי נתונים חסרים
   - טעינת נתונים
   - עדכון readiness לאחר טעינה

5. **test_pages_console_errors.py** - עדכון
   - בדיקת מערכת תנאים בעמודי trade_plans.html ו-trades.html
   - בדיקת עמודת readiness בטבלה

### הרצת בדיקות

```bash
# בדיקות UI
python3 scripts/test_conditions_ui.py

# בדיקות API
python3 scripts/test_conditions_api.py

# בדיקות הערכה
python3 scripts/test_conditions_evaluation.py

# בדיקות טעינת נתונים
python3 scripts/test_conditions_data_loading.py

# בדיקות console errors (כולל תנאים)
python3 scripts/test_pages_console_errors.py --page /trade_plans.html
```

---

## מבנה קבצים

```text
Backend/
  services/
    conditions_data_requirements_service.py  # שירות בדיקת דרישות
  routes/api/
    plan_conditions.py                      # API - plan conditions (עודכן)
    trade_conditions.py                     # API - trade conditions (עודכן)

trading-ui/scripts/conditions/
  conditions-ui-manager.js                  # UI manager (עודכן)
  conditions-translations.js                # תרגומים (עודכן)
  conditions-crud-manager.js                # CRUD manager

trading-ui/scripts/
  alerts.js                                 # הצגת התראות (עודכן)
  active-alerts-component.js                # קומפוננטת התראות (עודכן)
  entity-details-renderer.js                # רנדור ישויות (עודכן)

scripts/
  test_conditions_ui.py                     # בדיקות UI
  test_conditions_api.py                    # בדיקות API
  test_conditions_evaluation.py            # בדיקות הערכה
  test_conditions_data_loading.py           # בדיקות טעינת נתונים
  test_pages_console_errors.py             # בדיקות console (עודכן)
```

---

## תלויות

### Backend

- `MissingDataChecker` - בדיקת נתונים חסרים
- `DataRefreshPolicy` - מדיניות רענון נתונים
- `PlanCondition` / `TradeCondition` - מודלים
- `TradingMethod` - קטלוג שיטות מסחר

### Frontend

- `ExternalDataService` - טעינת נתונים
- `ModalManagerV2` - ניהול מודאלים
- `FieldRendererService` - רנדור שדות
- `NotificationSystem` - הודעות למשתמש

---

## הערות טכניות

### דרישות נתונים לפי סוג תנאי

- **technical_indicators** (Moving Averages): `ma_period + 5` נקודות היסטוריות
- **volume_analysis**: `volume_period` נקודות נפח
- **support_resistance**: 20+ נקודות מחיר
- **trend_analysis**: `lookback_period` נקודות
- **price_patterns**: `lookback_period` נקודות
- **fibonacci**: `lookback_period` נקודות

### מצבי readiness

- **ready**: כל הנתונים זמינים, התנאי פעיל
- **waiting_for_data**: חסרים נתונים קריטיים, התנאי ממתין
- **error**: שגיאה בבדיקת דרישות

### Alert Mapping

התראות שמקורן בתנאים נשמרות עם:

- `plan_condition_id` או `trade_condition_id`
- `related_id` = ID של Trade Plan / Trade
- `related_type_id` = 3 (plan) או 2 (trade)

---

## סיכום

שלב 1 הושלם בהצלחה עם:

✅ בדיקת דרישות נתונים אוטומטית  
✅ הצגת מצב כשירות ב-UI  
✅ הודעות למשתמש  
✅ קישור חזרה לישות בהתראות  
✅ בדיקות מקיפות  

המערכת מוכנה לשימוש ומספקת חוויית משתמש טובה עם שקיפות מלאה על מצב התנאים.
