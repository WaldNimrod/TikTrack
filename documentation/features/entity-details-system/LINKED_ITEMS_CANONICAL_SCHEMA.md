# סכמת פריטים מקושרים – גרסה 1.0 (נובמבר 2025)

## 🎯 מטרה
- לאחד את מבנה הנתונים שמוחזר משכבת ה-backend (`EntityDetailsService` / `/api/linked-items`) אל הפרונט.
- להבטיח שמערכת ההרצה (Entity Details Modal + LinkedItemsService) מקבלת את אותם שדות עבור כל ישות.
- לאפשר למפתחים עתידיים להרחיב ישויות/שדות מבלי לשבור את מודול הפרטים.

## 🧱 שכבות המערכת המעורבות
1. **Backend**
   - `Backend/services/entity_details_service.py`
   - `Backend/routes/api/linked_items.py`
2. **Frontend**
   - `trading-ui/scripts/entity-details-api.js`
   - `trading-ui/scripts/entity-details-renderer.js`
   - `trading-ui/scripts/services/linked-items-service.js`
3. **Caching**
   - דקורטורים של `cache_for` בצד השרת
   - `UnifiedCacheManager` בצד הלקוח

## 📦 החוזה הקנוני (כל פריט ברשימת linked_items)
```json
{
  "id": 123,
  "type": "execution",            // חובה: trade, trade_plan, execution, ticker, trading_account, alert, cash_flow, note
  "link_direction": "parent",     // חובה: parent | child | related (ראה הערה בהמשך)
  "label": {
    "he": "ביצוע",
    "en": "Execution"
  },
  "display": {
    "title": "ביצוע",
    "name": "AAPL",
    "description": "ביצוע buy 100 במחיר 152.30",
    "icon": "execution",          // משויך ל-FieldRendererService.renderLinkedEntity
    "color": "#26baac"            // מקור: FieldRendererService / LinkedItemsService
  },
  "status": {
    "value": "active",
    "category": "open",           // לשימוש ב-renderStatus
    "badge_variant": "outline"    // בהתאם למערכת badges הכללית
  },
  "metrics": {
    "side": "buy",
    "investment_type": "swing",
    "quantity": 100.0,
    "price": 152.3,
    "amount": null
  },
  "conditions": {
    "trigger_type": null,
    "trigger_operator": null,
    "target_value": null
  },
  "relations": {
    "trade_id": 45,
    "trade_plan_id": null,
    "ticker_id": 6,
    "trading_account_id": 1
  },
  "timestamps": {
    "created_at": "2025-09-01T10:15:00Z",
    "updated_at": "2025-09-01T10:30:00Z",
    "closed_at": null
  },
  "source": {
    "entity_type": "execution",   // המקור המלא כפי שהוחזר מה-ORM/SQL
    "entity_id": 123,
    "origin": "EntityDetailsService._get_execution_linked_items",
    "api_path": "/api/linked-items/execution/123"
  },
  "raw_payload": { ... }            // אופציונלי: שמירת המקור המלא (ל-debug, לא נשלח לפרונט פרודקשן)
}
```

### שדות חובה
- `id`, `type`, `link_direction`, `display.title`, `display.description`, `status.value`, `timestamps.created_at`

### שדות מומלצים (לשימוש בפריסה קיימת)
- `metrics.side`, `metrics.investment_type` (מניעת ריק בעמודות צד/סוג השקעה)
- `metrics.quantity`, `metrics.price` לביצועים ותזרימי מזומנים
- `conditions.trigger_operator`, `conditions.target_value` להתראות

### מדיניות הפרדה
- **נתוני תצוגה** (`display`, `status`, `metrics`) מיועדים ל-UI בלבד.
- **נתוני יחסים** (`relations`) משמשים את כפתורי הניווט/העמקת המידע.
- **נתוני מקור** (`source`) מאפשרים לוגים מתועדים ואוטומציה של refresh.

> הערה על `link_direction`:  
> * `child` – הישות שהוחזרה תלויה בישות המבוקשת (למשל טריידים של טיקר).  
> * `parent` – הישות מהווה הורה ישיר לרשומה שנבדקת (למשל חשבון מסחר של ביצוע).  
> * `related` – משמש את שכבת השירותים הכללית (`EntityDetailsService.get_linked_items`) במקרים שבהם מתקבל ערבוב בין הורים לילדים וההבחנה נשמרת בצד הקורא.

## 🔄 מיפוי לכל סוג ישות
| Entity Type        | Parent/Child | Must Populate                                                    |
|--------------------|--------------|------------------------------------------------------------------|
| `trading_account`  | parent       | `display.name` (account name), `relations.trading_account_id`    |
| `trade`            | child/parent | `metrics.side`, `metrics.investment_type`, `relations.trade_id`   |
| `trade_plan`       | child        | `metrics.side`, `metrics.investment_type`, `relations.trade_plan_id` |
| `execution`        | child        | `metrics.side`, `metrics.quantity`, `metrics.price`, `relations.trade_id`, `relations.ticker_id`, `relations.trading_account_id` |
| `cash_flow`        | child        | `metrics.amount`, `relations.trading_account_id`, `relations.trade_id` |
| `alert`            | child        | `conditions.trigger_type`, `conditions.target_value`, `relations.trade_id|ticker_id` |
| `ticker`           | parent       | `display.name` (symbol), `relations.ticker_id`                    |
| `note`             | child/parent | `display.description` (trimmed/HTML stripped)                    |

## 📝 דרישות הטמעה
1. **Backend**
   - להשתמש ב-`Backend/services/linked_item_formatter.py` לשם יצירת המבנה הקנוני (פונקציות `canonicalize_linked_item/s`).
   - `EntityDetailsService.get_linked_items()` עוטף את התוצאות באמצעות `EntityDetailsService._make_enrichment_provider()` + `canonicalize_linked_items(..., 'related', ...)`.
   - Blueprint `/api/linked-items/<type>/<id>` יוצר `enrichment_provider` מבוסס SQLite (`make_sqlite_enrichment_provider`) ומחזיר את התוצאות הקנוניות (כולל `link_direction` מתאים).
   - בעת הוספת/עדכון פונקציות `_get_*_linked_items` יש להקפיד להוסיף מידע יחסי (trade_id, ticker_id וכו') כדי שהפורמטור יוכל להעשיר ללא שאילתה נוספת.
2. **Frontend**
   - `EntityDetailsAPI.getLinkedItems()` מכבד את האובייקטים הקנוניים, מבצע Normalization קל (`link_direction`, fallback לשדות מורשת) ומטמון אותם כמות שהם.
   - `entity-details-renderer.js` משתמש בשדות החדשים (`item.metrics`, `item.conditions`, `item.timestamps`) עם נפילה לאחור לשדות ההיסטוריים.
   - `LinkedItemsService` שומר על מיון ולוגיקת פעולה ללא שינוי, הודות לכך שהשדות ההיסטוריים עדיין משוכפלים ברמת השורש.
3. **Caching**
   - המפתח ב-`UnifiedCacheManager` ישאר זהה, אך התוקף יתאפס אחרי שדרוג הסכמה (invalidate דרך גרסת schema).

## ✅ בדיקות נדרשות
- יחידות backend: בדיקה שכל `*_linked_items` מחזירות שדות חובה.
- בדיקות אינטגרציה: קריאת `/api/linked-items/<type>/<id>` ומוודאת Schema.
- בדיקות frontend (Jest + E2E): רינדור מודל פריטים מקושרים לכל ישות.

## 📚 עדכונים מתועדים
- `documentation/features/entity-details-system/INDEX.md` עודכן ומצביע לקובץ זה.
- הוספת אזכור ל-`LinkedItemFormatter` וזרימת ההעשרה ב-README הראשי של Entity Details (TODO: להשלים בעת איחוד סופי של המסמכים).
- בדיקות אינטגרציה (`tests/integration/linked-items-integration.test.js`) עודכנו כדי לשקף payload קנוני.

