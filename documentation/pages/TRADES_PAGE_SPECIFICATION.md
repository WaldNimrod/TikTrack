# אפיון עמוד Trades
**תאריך יצירה:** 18 אוקטובר 2025  
**תאריך עדכון:** 24 אוקטובר 2025  
**גרסה:** 3.2.0  
**מפתח:** AI Assistant  

---

## תקציר
עמוד Trades הוא עמוד מרכזי במערכת TikTrack המאפשר ניהול טריידים פעילים וסגורים. העמוד מספק ממשק מקיף ליצירה, עריכה, מחיקה וניהול טריידים עם אינטגרציה מלאה למערכות הכלליות של המערכת.

**חדש בגרסה 3.0.0:** הוספת מערכת תנאים מתקדמת המאפשרת הגדרת תנאים מותאמים אישית לטריידים עם אפשרות לרשת תנאים מתכניות מסחר או ליצור תנאים ייחודיים לטרייד.

**חדש בגרסה 3.1.0:** סטנדרטיזציה מלאה למערכות כלליות - שימוש ב-FieldRendererService, Actions Menu System, DataCollectionService, SelectPopulatorService, Entity Details Modal, ו-Translation System.

**חדש בגרסה 3.2.0:** הוספת מערכת חישוב פוזיציות - הצגת נתוני פוזיציה נוכחית (כמות, מחיר ממוצע, P/L) עם אינטגרציה למערכת Position Calculator Service ו-Unified Cache Manager.

---

## מבנה העמוד

### 1. מבנה הקבצים
```
trading-ui/
├── trades.html               # מבנה ה-HTML הראשי
├── scripts/
│   ├── trades.js            # לוגיקת העמוד והפונקציונליות
│   └── conditions/          # מערכת התנאים
│       ├── conditions-translations.js
│       ├── condition-validator.js
│       └── condition-builder.js
└── styles-new/              # עיצוב ITCSS
    ├── 05-objects/_layout.css
    ├── 06-components/_buttons-advanced.css
    ├── 06-components/_linked-items.css
    └── 06-components/_conditions-system.css
```

### 2. מבנה HTML
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <!-- מטא-דאטה וקישורים לקבצי CSS/JS -->
</head>
<body>
    <!-- Header עם ניווט -->
    <!-- Filters Section -->
    <!-- Trades Table -->
    <!-- Modals: Add/Edit/Delete -->
    <!-- Notification Systems -->
</body>
</html>
```

---

## מערכות כלליות בשימוש

עמוד זה משתמש במערכות כלליות הבאות (מתועדות ב-`GENERAL_SYSTEMS_LIST.md` ו-`SERVICES_ARCHITECTURE.md`):

### 1. FieldRendererService
- **מיקום:** `trading-ui/scripts/services/field-renderer-service.js`
- **שימוש:** רינדור status badges, type badges, side badges, ערכים מספריים, תאריכים
- **פונקציות:** `renderStatus()`, `renderSide()`, `renderType()`, `renderNumericValue()`, `renderDate()`
- **הפחתת קוד:** 138 מקומות עם HTML ידני → 1 מערכת מרכזית

### 2. Actions Menu System
- **מיקום:** `trading-ui/scripts/modules/actions-menu-system.js`
- **שימוש:** תפריט פעולות נפתח בטבלה
- **פונקציות:** `window.createActionsMenu()`
- **יתרון:** UI אחיד, נגישות משופרת, קוד נקי

### 3. DataCollectionService
- **מיקום:** `trading-ui/scripts/services/data-collection-service.js`
- **שימוש:** איסוף נתונים מטפסים עם המרות טיפוס
- **פונקציות:** `collectFormData()`, `setFormData()`, `resetForm()`
- **הפחתת קוד:** 445 קריאות `getElementById` → 0

### 4. Position Calculator Service
- **מיקום:** `Backend/services/position_calculator_service.py`
- **שימוש:** חישוב פוזיציות נוכחיות לטריידים על בסיס ביצועים
- **פונקציות:** `calculate_position()`, `calculate_positions_batch()`
- **אינטגרציה:** Backend API מחזיר position data, Frontend מציג עמודות פוזיציה

### 4. SelectPopulatorService
- **מיקום:** `trading-ui/scripts/services/select-populator-service.js`
- **שימוש:** מילוי select boxes מ-API
- **פונקציות:** `populateTickersSelect()`, `populateAccountsSelect()`, `populateTradePlansSelect()`
- **יתרון:** קוד פחות חוזר, טעינה מהירה יותר

### 5. Entity Details Modal
- **מיקום:** `trading-ui/scripts/modules/entity-details-modal.js`
- **שימוש:** הצגת פרטי ישות במודל
- **פונקציות:** `window.showEntityDetails(entityType, entityId, options)`
- **יתרון:** תצוגה אחידה לכל הישויות

### 6. Translation System
- **מיקום:** `trading-ui/scripts/translation-utils.js`
- **שימוש:** תרגומים ופורמט מטבעות
- **פונקציות:** `formatCurrency()`, `translateTradePlanStatus()`, וכו'
- **יתרון:** תרגומים אחידים בכל המערכת

---

## Position Data Display

### עמודות פוזיציה חדשות
עמוד Trades מציג כעת 4 עמודות פוזיציה חדשות המבוססות על חישובי Position Calculator Service:

#### 1. גודל פוזיציה (Position Quantity)
- **מטרה:** הצגת הכמות הנוכחית של הטרייד
- **חישוב:** `SUM(buy_quantity) - SUM(sell_quantity)`
- **תצוגה:** מספר חיובי/שלילי עם צבעים דינמיים
- **Fallback:** "אין ביצועים" אם אין executions

#### 2. מחיר ממוצע (Average Price)
- **מטרה:** הצגת המחיר הממוצע של הפוזיציה כולל עמלות
- **חישוב:** `(SUM(quantity * price + fee WHERE action='buy')) / SUM(quantity WHERE action='buy')`
- **תצוגה:** פורמט מטבע עם סימן $ לפני המספר
- **Fallback:** "-" אם אין נתונים

#### 3. P/L בערך (P/L Value)
- **מטרה:** הצגת רווח/הפסד בדולרים
- **חישוב:** `(current_price - average_price) * quantity`
- **תצוגה:** פורמט מטבע עם צבעים חיוביים/שליליים
- **Fallback:** "חסר מחיר" אם אין נתוני מחיר

#### 4. P/L באחוזים (P/L Percentage)
- **מטרה:** הצגת רווח/הפסד באחוזים
- **חישוב:** `((current_price - average_price) / average_price) * 100`
- **תצוגה:** אחוזים עם סימן + או - וצבעים דינמיים
- **Fallback:** "-" אם אין נתונים

### כפתור רענון פוזיציות
- **מיקום:** בכותרת הטבלה ליד כפתור "הוסף טרייד"
- **פונקציה:** `refreshPositions()`
- **פעולה:** 
  - Invalidate cache של position data
  - טעינה מחדש של נתוני טריידים
  - הצגת הודעות למשתמש
- **Cache:** Unified Cache Manager (5 דקות TTL)

### אינטגרציה עם מערכות כלליות
- **Position Calculator Service:** Backend service לחישוב פוזיציות
- **Unified Cache Manager:** Frontend cache לנתוני פוזיציה
- **Notification System:** הודעות רענון והצלחה
- **Field Renderer Service:** רינדור ערכים מספריים ומטבעות

---

## ארכיטקטורה

### 1. מערכות כלליות משולבות

#### מערכת הניווט
- **קובץ:** `scripts/navigation.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/NAVIGATION_SYSTEM.md`
- **פונקציונליות:** ניווט בין עמודים, breadcrumbs, active states

#### מערכת הפילטרים
- **קובץ:** `scripts/filter-system.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/FILTER_SYSTEM.md`
- **פונקציונליות:** פילטור לפי סטטוס, סוג, תאריך, חיפוש טקסטואלי

#### מערכת הטבלאות
- **קובץ:** `scripts/tables.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM.md`
- **פונקציונליות:** מיון, pagination, responsive design

#### מערכת המודלים
- **קובץ:** `scripts/modal-system.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/MODAL_SYSTEM.md`
- **פונקציונליות:** ניהול מודלים, validation, form handling

#### מערכת התראות
- **קובץ:** `scripts/notification-system.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/NOTIFICATION_SYSTEM.md`
- **פונקציונליות:** הודעות הצלחה/שגיאה, toast notifications

#### מערכת הריענון המרכזית
- **קובץ:** `scripts/central-refresh-system.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/CENTRAL_REFRESH_SYSTEM.md`
- **פונקציונליות:** רענון אוטומטי של נתונים, cache management

#### מערכת הוולידציה
- **קובץ:** `scripts/validation-utils.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/VALIDATION_SYSTEM.md`
- **פונקציונליות:** ולידציה של טפסים, הצגת שגיאות

#### מערכת התרגום
- **קובץ:** `scripts/translation-utils.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/TRANSLATION_SYSTEM.md`
- **פונקציונליות:** תרגום ערכים, תצוגה בעברית

#### מערכת הצבעים
- **קובץ:** `scripts/color-scheme-system.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/COLOR_SCHEME_SYSTEM.md`
- **פונקציונליות:** ניהול צבעים דינמי, themes

#### מערכת הכפתורים
- **קובץ:** `scripts/button-icons.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/BUTTON_SYSTEM.md`
- **פונקציונליות:** יצירת כפתורים אחידים, icons

#### מערכת פריטים מקושרים
- **קובץ:** `scripts/linked-items.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/LINKED_ITEMS_SYSTEM.md`
- **פונקציונליות:** הצגת פריטים מקושרים, ניהול קשרים

#### מערכת פרטי ישות
- **קובץ:** `scripts/entity-details-modal.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/ENTITY_DETAILS_SYSTEM.md`
- **פונקציונליות:** הצגת פרטים מפורטים של ישויות

#### מערכת טיפול בשגיאות
- **קובץ:** `scripts/error-handlers.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/ERROR_HANDLING_SYSTEM.md`
- **פונקציונליות:** טיפול אחיד בשגיאות, logging

#### מערכת התנאים (חדש בגרסה 3.0.0)
- **קובץ:** `scripts/conditions/condition-builder.js`
- **תיעוד:** `documentation/02-ARCHITECTURE/FRONTEND/CONDITIONS_SYSTEM.md`
- **פונקציונליות:** בניית תנאים מותאמים אישית, בחירת שיטות מסחר, הגדרת פרמטרים, רשת תנאים מתכניות מסחר

---

## מבנה הנתונים

### 1. Trade Model (Backend)
```python
class Trade(db.Model):
    id = Column(Integer, primary_key=True)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='Long', nullable=False)  # Long/Short
    side = Column(String(10), default='Long', nullable=False)  # Long/Short
    status = Column(String(20), default='open', nullable=False)  # open/closed/cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conditions = relationship("TradeCondition", back_populates="trade", cascade="all, delete-orphan")
```

### 2. TradeCondition Model (Backend) - חדש בגרסה 3.0.0
```python
class TradeCondition(db.Model):
    __tablename__ = "trade_conditions"
    id = Column(Integer, primary_key=True)
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=False)
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    inherited_from_plan_condition_id = Column(Integer, ForeignKey('plan_conditions.id'), nullable=True)
    condition_group = Column(Integer, default=0, nullable=False)
    parameters_json = Column(Text, nullable=False)
    logical_operator = Column(String(10), default='NONE', nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trade = relationship("Trade", back_populates="conditions")
    method = relationship("TradingMethod", back_populates="trade_conditions")
    inherited_from_plan_condition = relationship("PlanCondition", back_populates="inherited_trade_conditions")
```

### 2. מבנה ה-JSON API
```json
{
  "id": 1,
  "trading_account_id": 1,
  "ticker_id": 5,
  "investment_type": "Long",
  "side": "Long",
  "status": "open",
  "notes": "Strong momentum",
  "created_at": "2025-10-18T10:00:00Z",
  "updated_at": "2025-10-18T10:00:00Z",
  "ticker": {
    "id": 5,
    "symbol": "AAPL",
    "name": "Apple Inc."
  }
}
```

---

## פונקציונליות מרכזית

### 1. טעינת נתונים
```javascript
async function loadTradesData() {
    // טעינה ממערכת השירותים או ישירות מה-API
    // עדכון cache גלובלי
    // רענון הטבלה
}
```

### 2. הצגת הטבלה
```javascript
function updateTradesTable(trades) {
    // בניית HTML לטבלה
    // הצגת נתונים עם עיצוב
    // יצירת כפתורי פעולה
}
```

### 3. ניהול מודלים
- **הוספה:** `showAddTradeModal()`
- **עריכה:** `showEditTradeModal(id)`
- **מחיקה:** `deleteTradeRecord(id)`

### 4. מערכת התנאים (חדש בגרסה 3.0.0)
```javascript
// אתחול מערכת התנאים
function initializeTradeConditionsSystem() {
    // הגדרת מאזינים למודלים
    // אתחול ConditionBuilder
}

// אתחול תנאים למודל ספציפי
function initializeTradeConditions(mode, tradeId) {
    // יצירת ConditionBuilder חדש
    // טעינת תנאים קיימים (במצב edit)
    // רשת תנאים מתכנית מסחר (אם קיימת)
}

// ניקוי מערכת התנאים
function cleanupTradeConditions(mode) {
    // שחרור זיכרון
    // ניקוי מאזינים
}
```

### 4. ולידציה
```javascript
const validationRules = {
    'addTicker': { required: true, message: 'יש לבחור טיקר' },
    'addType': { 
        required: true, 
        message: 'יש לבחור סוג השקעה',
        customValidation: value => ['Long', 'Short'].includes(value)
    },
    'addSide': { 
        required: true, 
        message: 'יש לבחור צד',
        customValidation: value => ['Long', 'Short'].includes(value)
    },
    'addQuantity': { 
        required: true, 
        message: 'כמות חייבה להיות גדולה מ-0',
        customValidation: value => parseFloat(value) > 0
    },
    'addPrice': { 
        required: true, 
        message: 'מחיר חייב להיות מספר חיובי',
        customValidation: value => parseFloat(value) > 0
    }
};
```

---

## API Endpoints

### 1. GET /api/trades/
- **תיאור:** קבלת רשימת כל הטריידים
- **פרמטרים:** `?status=open&type=Long&page=1&limit=50`
- **תגובה:** רשימה של Trade objects

### 2. POST /api/trades/
- **תיאור:** יצירת טרייד חדש
- **body:** Trade object
- **תגובה:** Trade object שנוצר

### 3. PUT /api/trades/{id}
- **תיאור:** עדכון טרייד קיים
- **body:** Trade object
- **תגובה:** Trade object מעודכן

### 4. DELETE /api/trades/{id}
- **תיאור:** מחיקת טרייד
- **תגובה:** הודעת הצלחה

### 5. GET /api/trade_conditions?trade_id={id} (חדש בגרסה 3.0.0)
- **תיאור:** קבלת תנאים של טרייד ספציפי
- **פרמטרים:** `trade_id` - ID של הטרייד
- **תגובה:** רשימה של TradeCondition objects

### 6. POST /api/trade_conditions/ (חדש בגרסה 3.0.0)
- **תיאור:** יצירת תנאי חדש לטרייד
- **body:** TradeCondition object
- **תגובה:** TradeCondition object שנוצר

### 7. PUT /api/trade_conditions/{id} (חדש בגרסה 3.0.0)
- **תיאור:** עדכון תנאי קיים
- **body:** TradeCondition object
- **תגובה:** TradeCondition object מעודכן

### 8. DELETE /api/trade_conditions/{id} (חדש בגרסה 3.0.0)
- **תיאור:** מחיקת תנאי
- **תגובה:** הודעת הצלחה

---

## תחזוקה ועדכונים

### 1. הוספת שדה חדש
1. עדכן את המודל ב-Backend (`Backend/models/trade.py`)
2. הוסף את השדה ל-HTML (`trades.html`)
3. עדכן את הפונקציות ב-JavaScript (`trades.js`)
4. עדכן את ה-validation rules
5. עדכן את ה-API endpoints

### 2. שינוי לוגיקה עסקית
1. עדכן את הפונקציות הרלוונטיות ב-`trades.js`
2. ודא שהשינויים מתואמים עם מערכות כלליות
3. עדכן את ה-validation rules במידת הצורך
4. בדוק אינטגרציה עם מערכות אחרות

### 3. שינוי עיצוב
1. עדכן קבצי CSS ב-`styles-new/`
2. ודא עמידה ב-ITCSS principles
3. בדוק responsive design
4. ודא עמידה במערכת הצבעים

### 4. הוספת פונקציונליות חדשה
1. הוסף את הפונקציונליות ל-`trades.js`
2. ודא אינטגרציה עם מערכות כלליות
3. הוסף validation במידת הצורך
4. עדכן את התיעוד

---

## בדיקות מומלצות

### 1. בדיקות פונקציונליות
- [ ] טעינת העמוד והצגת נתונים
- [ ] הוספת טרייד חדש
- [ ] עריכת טרייד קיים
- [ ] מחיקת טרייד
- [ ] פילטור ומיון
- [ ] חיפוש טקסטואלי

### 2. בדיקות UI/UX
- [ ] responsive design
- [ ] נגישות (accessibility)
- [ ] עיצוב אחיד עם שאר המערכת
- [ ] ביצועים (performance)

### 3. בדיקות אינטגרציה
- [ ] אינטגרציה עם מערכות כלליות
- [ ] עדכון אוטומטי של נתונים
- [ ] הצגת התראות
- [ ] ניהול שגיאות

---

## תלות בקבצים חיצוניים

### קבצי JavaScript נדרשים:
- `scripts/navigation.js`
- `scripts/filter-system.js`
- `scripts/tables.js`
- `scripts/modal-system.js`
- `scripts/notification-system.js`
- `scripts/central-refresh-system.js`
- `scripts/validation-utils.js`
- `scripts/translation-utils.js`
- `scripts/color-scheme-system.js`
- `scripts/button-icons.js`
- `scripts/linked-items.js`
- `scripts/entity-details-modal.js`
- `scripts/error-handlers.js`
- `scripts/conditions/conditions-translations.js` (חדש בגרסה 3.0.0)
- `scripts/conditions/condition-validator.js` (חדש בגרסה 3.0.0)
- `scripts/conditions/condition-builder.js` (חדש בגרסה 3.0.0)

### קבצי CSS נדרשים:
- `styles-new/05-objects/_layout.css`
- `styles-new/06-components/_buttons-advanced.css`
- `styles-new/06-components/_linked-items.css`
- `styles-new/06-components/_conditions-system.css` (חדש בגרסה 3.0.0)

### קבצי Backend נדרשים:
- `Backend/models/trade.py`
- `Backend/routes/api/trades.py`
- `Backend/models/trading_method.py` (חדש בגרסה 3.0.0)
- `Backend/models/plan_condition.py` (חדש בגרסה 3.0.0)
- `Backend/routes/api/trading_methods.py` (חדש בגרסה 3.0.0)
- `Backend/routes/api/trade_conditions.py` (חדש בגרסה 3.0.0)

---

## הבדלים מ-Trade Plans

### 1. מבנה נתונים פשוט יותר
- פחות שדות מ-Trade Plans
- אין planned_amount, stop_price, target_price
- אין entry_conditions, reasons

### 2. פונקציונליות מוגבלת
- אין פונקציית ביטול (cancel)
- אין פונקציית הפעלה מחדש (reactivate)
- אין פונקציית העתקה (copy)

### 3. ולידציה פשוטה יותר
- פחות שדות נדרשים
- פחות בדיקות מותאמות אישית

---

## הערות חשובות

1. **CASING:** השדות `investment_type` ו-`side` רגישים לאותיות גדולות/קטנות
2. **Validation:** כל השדות עוברים ולידציה גם ב-frontend וגם ב-backend
3. **Cache:** הנתונים נשמרים ב-cache גלובלי (`window.tradesData`)
4. **Real-time:** העמוד תומך בעדכונים בזמן אמת דרך מערכת הריענון המרכזית
5. **Accessibility:** העמוד תומך בנגישות עם ARIA labels ותמיכה במקלדת
6. **מערכת התנאים:** התנאים מאותחלים אוטומטית דרך המערכת המאוחדת (`unified-app-initializer.js`)
7. **רשת תנאים:** טריידים יכולים לרשת תנאים מתכניות מסחר או ליצור תנאים ייחודיים
8. **שיטות מסחר:** המערכת תומכת ב-6 שיטות מסחר: ממוצעים נעים, נפח, תמיכה והתנגדות, קווי מגמה, מבנים טכניים, פיבונצי
9. **אינטגרציה עם התראות:** תנאים יכולים ליצור התראות אוטומטיות דרך מסך ההתראות

---

## קישורים נוספים

- [תיעוד מערכות כלליות](../02-ARCHITECTURE/FRONTEND/)
- [מדריך פיתוח](../DEVELOPMENT_GUIDE.md)
- [מדריך API](../API_DOCUMENTATION.md)
- [מדריך בדיקות](../TESTING_GUIDE.md)
- [אפיון עמוד Trade Plans](./TRADE_PLANS_PAGE_SPECIFICATION.md)
