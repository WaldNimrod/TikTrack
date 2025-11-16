# Trade Planning Fields - Documentation
## שדות תכנון בטריידים

**תאריך יצירה:** 2025-01-29  
**גרסה:** 1.0.0  
**סטטוס:** ✅ מיושם במלואו

---

## סקירה כללית

מערכת שדות התכנון בטריידים מאפשרת שמירת נתוני תכנון ישירות ב-Trade entity, בנוסף לקישור לתוכנית טרייד (TradePlan). זה מאפשר:

1. **טריידים ללא תוכנית** - משתמשים יכולים ליצור טריידים ישירות ללא צורך בתוכנית מקושרת
2. **Snapshot Pattern** - שמירת "צילום" של נתוני התכנון בזמן יצירת הטרייד
3. **השוואה** - הצגת "תכנון מקדים" (מהתוכנית) מול "תכנון בפועל" (מה-Trade)

---

## שדות התכנון

### Trade Entity Fields

השדות הבאים נוספו לטבלת `trades`:

| שדה | סוג | Nullable | תיאור |
|-----|-----|----------|-------|
| `planned_quantity` | FLOAT | ✅ | כמות מתוכננת (מספר מניות/יחידות) |
| `planned_amount` | FLOAT | ✅ | סכום השקעה מתוכנן ($) |
| `entry_price` | FLOAT | ✅ | מחיר כניסה מתוכנן ($) |

### TradePlan Entity Fields (קיימים)

| שדה | סוג | Nullable | תיאור |
|-----|-----|----------|-------|
| `planned_amount` | FLOAT | ❌ | סכום השקעה מתוכנן ($) |
| `entry_price` | FLOAT | ❌ | מחיר כניסה מתוכנן ($) |

---

## Snapshot Pattern (דפוס צילום)

### עקרון בסיסי

**TradePlan הוא מקור האמת (Source of Truth)**, אבל Trade שומר snapshot של הנתונים בזמן יצירתו.

### תרחישים נתמכים

#### 1. יצירת טרייד מתוכנית (Trade from Plan)
**תהליך:**
- משתמש יוצר טרייד עם `trade_plan_id`
- המערכת מעתיקה (snapshot) את השדות מהתוכנית לטרייד:
  - `planned_amount` ← `TradePlan.planned_amount`
  - `entry_price` ← `TradePlan.entry_price`
  - `planned_quantity` ← מחושב: `planned_amount / entry_price`

**מימוש:**
- `Backend/services/trade_service.py` - `TradeService.create()`
- לוגיקה: אם `trade_plan_id` קיים, מעתיקים שדות מהתוכנית

#### 2. יצירת תוכנית מטרייד (Plan from Trade)
**תהליך:**
- משתמש יוצר תוכנית מטרייד קיים
- המערכת מעתיקה (snapshot) את השדות מהטרייד לתוכנית:
  - `planned_amount` ← `Trade.planned_amount`
  - `entry_price` ← `Trade.entry_price`

**מימוש:**
- `Backend/services/trade_plan_service.py` - `TradePlanService.create()`
- לוגיקה: אם `trade_id` קיים, מעתיקים שדות מהטרייד

#### 3. יצירת טרייד ותוכנית נפרדים ואז קישור
**תהליך:**
- משתמש יוצר טרייד ותוכנית בנפרד
- משתמש מקשר ביניהם (מעדכן `trade.trade_plan_id`)
- **אופציונלי:** המערכת יכולה להציע snapshot מהתוכנית לטרייד

**מימוש:**
- `Backend/services/trade_service.py` - `TradeService.assign_plan()`
- **הערה:** כרגע לא מיושם snapshot אוטומטי בקישור - המשתמש צריך לעדכן ידנית

#### 4. Override - שדות מפורשים
**תהליך:**
- משתמש יוצר טרייד עם `trade_plan_id` **וגם** שדות תכנון מפורשים
- השדות המפורשים **עוקפים** את ערכי התוכנית

**מימוש:**
- `Backend/services/trade_service.py` - `TradeService.create()`
- לוגיקה: `data.setdefault()` - רק אם לא נשלח במפורש

---

## ממשק משתמש

### מודול עריכה (Edit Modal)

**מקור נתונים:**
- ✅ **רק שדות מה-Trade עצמו** (`planned_quantity`, `planned_amount`, `entry_price`)
- ❌ **אין fallbacks** - לא מפוזיציה, לא מתוכנית, לא מחישובים

**אם חסרים נתונים:**
- הודעה ברורה דרך מערכת ההודעות: "נתוני תכנון חסרים - הטרייד לא כולל את השדות הבאים: [רשימת שדות]. אנא מלא אותם ידנית."

**מימוש:**
- `trading-ui/scripts/modal-manager-v2.js` - `populateForm()`

### מודול פרטים (Details Module)

**תצוגה:**
טבלה עם 3 עמודות:

| | תכנון מקדים | תכנון בפועל | פוזיציה |
|---|---|---|---|
| **כמות** | מ-`TradePlan` | מ-`Trade.planned_quantity` | מ-`Position.quantity` |
| **סכום** | מ-`TradePlan.planned_amount` | מ-`Trade.planned_amount` | מ-`Position.market_value` |
| **אחוז מהחשבון** | מחושב | מחושב | מחושב |
| **מחיר כניסה** | מ-`TradePlan.entry_price` | מ-`Trade.entry_price` | מ-`Position.average_price` |

**אם אין נתונים:**
- מציג "לא זמין" (לא fallback!)
- **תכנון מקדים:** רק אם יש `trade_plan` מקושר
- **תכנון בפועל:** רק אם יש שדות ב-`Trade` עצמו

**מימוש:**
- `trading-ui/scripts/entity-details-renderer.js` - `renderTradeSpecific()`

---

## Backend Implementation

### Database Schema

**Migration:**
- `Backend/migrations/add_planning_fields_to_trades.py`
- הוסיף 3 שדות: `planned_quantity`, `planned_amount`, `entry_price`
- כל השדות הם FLOAT ו-nullable

### Models

**Trade Model:**
```python
# Backend/models/trade.py
planned_quantity = Column(Float, nullable=True)
planned_amount = Column(Float, nullable=True)
entry_price = Column(Float, nullable=True)
```

**TradePlan Model:**
```python
# Backend/models/trade_plan.py
planned_amount = Column(Float, nullable=False, default=1000)
entry_price = Column(Float, nullable=False)
```

### Services

**TradeService.create():**
- Snapshot logic: אם `trade_plan_id` קיים, מעתיק שדות מהתוכנית
- Override: שדות מפורשים עוקפים את ערכי התוכנית
- חישוב: `planned_quantity = planned_amount / entry_price` (אם לא נשלח)

**TradeService.update():**
- תומך בעדכון שדות התכנון

**TradeService.to_dict():**
- מחזיר את כל שדות התכנון ב-response

### API Endpoints

**GET /api/trades:**
- מחזיר `planned_quantity`, `planned_amount`, `entry_price` לכל טרייד

**GET /api/trades/:id:**
- מחזיר שדות תכנון ב-entity details

**POST /api/trades:**
- מקבל `planned_quantity`, `planned_amount`, `entry_price`
- אם `trade_plan_id` קיים, מעתיק שדות מהתוכנית (אם לא נשלחו במפורש)

**PUT /api/trades/:id:**
- תומך בעדכון שדות התכנון

---

## Frontend Implementation

### Data Loading

**trades.js - loadTradesData():**
```javascript
planned_quantity: trade.planned_quantity || trade.quantity || null,
planned_amount: trade.planned_amount || null,
entry_price: trade.entry_price || null,
```

### Data Saving

**trades.js - saveTrade():**
```javascript
const payload = {
    // ... core fields ...
    planned_quantity: tradeData.quantity ? parseFloat(tradeData.quantity) : null,
    planned_amount: plannedAmount ? parseFloat(plannedAmount) : null,
    entry_price: tradeData.entry_price ? parseFloat(tradeData.entry_price) : null,
};
```

### Data Display

**entity-details-renderer.js - renderTradeSpecific():**
- תכנון מקדים: רק מ-`trade_plan` אם קיים
- תכנון בפועל: רק מ-`Trade` עצמו
- אין fallbacks - אם אין נתונים, מציג "לא זמין"

---

## מדיניות Fallback

### ❌ אין Fallbacks

**עקרון בסיסי:**
אם אין נתונים במקור הראשי, **לא** להשתמש בנתונים ממקורות אחרים.

**דוגמאות אסורות:**
- ❌ אם אין `Trade.entry_price`, לא לקחת מ-`TradePlan.entry_price`
- ❌ אם אין `Trade.planned_amount`, לא לקחת מ-`Position.amount`
- ❌ אם אין `Trade.planned_quantity`, לא לחשב מ-`planned_amount / entry_price`

**מה לעשות במקום:**
- ✅ להציג "לא זמין" במודול הפרטים
- ✅ להציג הודעה ברורה במודול העריכה: "נתוני תכנון חסרים - אנא מלא אותם ידנית"

**מימוש:**
- `trading-ui/scripts/modal-manager-v2.js` - רק שדות מה-Trade עצמו
- `trading-ui/scripts/entity-details-renderer.js` - רק נתונים אמיתיים, "לא זמין" אם חסר

---

## Testing

### Automated Tests

**Service Layer:**
- `Backend/tests/test_services/test_trade_planning_fields.py`
- 10 test cases: CRUD, snapshot, override, null handling

**API Routes:**
- `Backend/tests/test_routes/test_trades_planning_fields_api.py`
- 3 test cases: POST, GET, PUT

### Manual Tests

**Integration Test Script:**
```bash
python3 Backend/tests/manual_integration_test.py
```

**Test Scenarios:**
1. ✅ Create trade with explicit planning fields
2. ✅ Create trade from plan (snapshot)
3. ✅ Create trade with plan + override fields
4. ✅ Update trade planning fields
5. ✅ Verify to_dict() includes fields

---

## Migration Guide

### Database Migration

**להרצת המיגרציה:**
```python
from Backend.migrations import add_planning_fields_to_trades as mig
sql = mig.upgrade()
# Run SQL against database
```

**Backfill:**
- המיגרציה ממלאת שדות מטריידים קיימים עם `trade_plan_id` מהתוכנית המקושרת
- טריידים ללא תוכנית נשארים עם `NULL`

### Code Updates

**Backend:**
- ✅ Trade model עודכן
- ✅ TradeService עודכן (snapshot logic)
- ✅ EntityDetailsService עודכן (fields in response)

**Frontend:**
- ✅ trades.js עודכן (save/load)
- ✅ modal-manager-v2.js עודכן (edit modal)
- ✅ entity-details-renderer.js עודכן (details display)

---

## Best Practices

### יצירת טרייד חדש

1. **עם תוכנית:**
   - שלח `trade_plan_id`
   - המערכת תעתיק שדות מהתוכנית אוטומטית
   - אפשר לעדכן שדות מפורשים אם צריך

2. **ללא תוכנית:**
   - שלח `planned_quantity`, `planned_amount`, `entry_price` במפורש
   - או השאר `NULL` ומלא מאוחר יותר

### עריכת טרייד

- ✅ עדכן רק שדות מה-Trade עצמו
- ❌ אל תנסה לקחת נתונים מפוזיציה או תוכנית
- ✅ אם חסרים נתונים, המשתמש יקבל הודעה ברורה

### הצגת נתונים

- ✅ הצג "תכנון מקדים" רק אם יש `trade_plan` מקושר
- ✅ הצג "תכנון בפועל" רק אם יש שדות ב-`Trade` עצמו
- ✅ אם אין נתונים, הצג "לא זמין" (לא fallback!)

---

## Troubleshooting

### בעיה: שדות לא נטענים במודול עריכה

**פתרון:**
1. בדוק שהשדות קיימים ב-`Trade` entity בבסיס הנתונים
2. בדוק שה-API מחזיר את השדות ב-response
3. בדוק את הקונסול - `ModalManagerV2` מדווח על שדות חסרים

### בעיה: שדות לא מוצגים במודול פרטים

**פתרון:**
1. בדוק שיש נתונים ב-`Trade` entity
2. בדוק שה-API מחזיר את השדות ב-entity details
3. בדוק את הקונסול - `EntityDetailsRenderer` מדווח על מקורות נתונים

### בעיה: Snapshot לא עובד

**פתרון:**
1. בדוק שיש `trade_plan_id` בטרייד
2. בדוק שהתוכנית קיימת ויש לה `planned_amount` ו-`entry_price`
3. בדוק את הלוגים - `TradeService.create()` מדווח על snapshot

---

## Related Documentation

- **Database Models:** `documentation/database/MODELS.md`
- **API Reference:** `documentation/03-API_REFERENCE/`
- **Testing:** `documentation/testing/TRADE_PLANNING_FIELDS_TEST_REPORT.md`
- **Fallback Policy:** `documentation/02-ARCHITECTURE/FALLBACK_POLICY.md`

---

## Changelog

### 2025-01-29 - Initial Implementation
- ✅ Added planning fields to Trade model
- ✅ Implemented snapshot logic in TradeService
- ✅ Updated frontend save/load/render
- ✅ Removed all fallbacks
- ✅ Added comprehensive tests
- ✅ Updated documentation

---

**Author:** TikTrack Development Team  
**Last Updated:** 2025-01-29  
**Version:** 1.0.0

