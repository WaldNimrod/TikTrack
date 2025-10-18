# אפיון עמוד Trade Plans
**תאריך יצירה:** 18 אוקטובר 2025  
**תאריך עדכון:** 19 אוקטובר 2025  
**גרסה:** 3.0.0  
**מפתח:** AI Assistant  

---

## תקציר
עמוד Trade Plans הוא עמוד מרכזי במערכת TikTrack המאפשר ניהול תכנוני מסחר. העמוד מספק ממשק מקיף ליצירה, עריכה, מחיקה וניהול תכנוני מסחר עם אינטגרציה מלאה למערכות הכלליות של המערכת.

**חדש בגרסה 3.0.0:** הוספת מערכת תנאים מתקדמת המאפשרת הגדרת תנאים מותאמים אישית לתכניות מסחר עם 6 שיטות מסחר שונות (ממוצעים נעים, נפח, תמיכה והתנגדות, קווי מגמה, מבנים טכניים, פיבונצי).

---

## מבנה העמוד

### 1. מבנה הקבצים
```
trading-ui/
├── trade_plans.html          # מבנה ה-HTML הראשי
├── scripts/
│   ├── trade_plans.js        # לוגיקת העמוד והפונקציונליות
│   └── conditions/           # מערכת התנאים
│       ├── conditions-translations.js
│       ├── condition-validator.js
│       └── condition-builder.js
└── styles-new/               # עיצוב ITCSS
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
    <!-- Trade Plans Table -->
    <!-- Modals: Add/Edit/Delete -->
    <!-- Notification Systems -->
</body>
</html>
```

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
- **פונקציונליות:** בניית תנאים מותאמים אישית, בחירת שיטות מסחר, הגדרת פרמטרים

---

## מבנה הנתונים

### 1. TradePlan Model (Backend)
```python
class TradePlan(db.Model):
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False)
    investment_type = Column(String(20), default='swing', nullable=False)  # swing/investment/passive
    side = Column(String(10), default='Long', nullable=False)  # Long/Short
    planned_amount = Column(Float, default=1000, nullable=False)
    stop_price = Column(Float, nullable=True)
    target_price = Column(Float, nullable=True)
    entry_conditions = Column(Text, nullable=True)
    reasons = Column(Text, nullable=True)
    status = Column(String(20), default='open', nullable=False)  # open/closed/cancelled
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conditions = relationship("PlanCondition", back_populates="trade_plan", cascade="all, delete-orphan")
```

### 2. TradingMethod Model (Backend) - חדש בגרסה 3.0.0
```python
class TradingMethod(db.Model):
    __tablename__ = "trading_methods"
    id = Column(Integer, primary_key=True)
    name_en = Column(String(100), unique=True, nullable=False)
    name_he = Column(String(100), unique=True, nullable=False)
    description_en = Column(Text, nullable=True)
    description_he = Column(Text, nullable=True)
    method_key = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parameters = relationship("MethodParameter", back_populates="method", cascade="all, delete-orphan")
    plan_conditions = relationship("PlanCondition", back_populates="method")
```

### 3. PlanCondition Model (Backend) - חדש בגרסה 3.0.0
```python
class PlanCondition(db.Model):
    __tablename__ = "plan_conditions"
    id = Column(Integer, primary_key=True)
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=False)
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    condition_group = Column(Integer, default=0, nullable=False)
    parameters_json = Column(Text, nullable=False)
    logical_operator = Column(String(10), default='NONE', nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trade_plan = relationship("TradePlan", back_populates="conditions")
    method = relationship("TradingMethod", back_populates="plan_conditions")
```

### 2. מבנה ה-JSON API
```json
{
  "id": 1,
  "account_id": 1,
  "ticker_id": 5,
  "investment_type": "swing",
  "side": "Long",
  "planned_amount": 1000.0,
  "stop_price": 150.0,
  "target_price": 180.0,
  "entry_conditions": "Break above resistance",
  "reasons": "Strong fundamentals",
  "status": "open",
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
async function loadTradePlansData() {
    // טעינה ממערכת השירותים או ישירות מה-API
    // עדכון cache גלובלי
    // רענון הטבלה
}
```

### 2. הצגת הטבלה
```javascript
function updateTradePlansTable(trade_plans) {
    // בניית HTML לטבלה
    // הצגת נתונים עם עיצוב
    // יצירת כפתורי פעולה
}
```

### 3. ניהול מודלים
- **הוספה:** `showAddTradePlanModal()`
- **עריכה:** `openEditTradePlanModal(id)`
- **מחיקה:** `openDeleteTradePlanModal(id)`
- **ביטול:** `cancelTradePlan(id)`

### 4. מערכת התנאים (חדש בגרסה 3.0.0)
```javascript
// אתחול מערכת התנאים
function initializeTradePlanConditionsSystem() {
    // הגדרת מאזינים למודלים
    // אתחול ConditionBuilder
}

// אתחול תנאים למודל ספציפי
function initializeTradePlanConditions(mode, planId) {
    // יצירת ConditionBuilder חדש
    // טעינת תנאים קיימים (במצב edit)
}

// ניקוי מערכת התנאים
function cleanupTradePlanConditions(mode) {
    // שחרור זיכרון
    // ניקוי מאזינים
}
```

### 4. ולידציה
```javascript
const validationRules = {
    'ticker': { required: true, message: 'יש לבחור טיקר' },
    'type': { 
        required: true, 
        message: 'יש לבחור סוג השקעה',
        customValidation: value => ['swing', 'investment', 'passive'].includes(value)
    },
    'side': { 
        required: true, 
        message: 'יש לבחור צד',
        customValidation: value => ['Long', 'Short'].includes(value)
    },
    'quantity': { 
        required: true, 
        message: 'סכום מתוכנן חייב להיות גדול מ-0',
        customValidation: value => parseFloat(value) > 0
    }
};
```

---

## API Endpoints

### 1. GET /api/trade_plans/
- **תיאור:** קבלת רשימת כל התכנונים
- **פרמטרים:** `?status=open&type=swing&page=1&limit=50`
- **תגובה:** רשימה של TradePlan objects

### 2. POST /api/trade_plans/
- **תיאור:** יצירת תכנון חדש
- **body:** TradePlan object
- **תגובה:** TradePlan object שנוצר

### 3. PUT /api/trade_plans/{id}
- **תיאור:** עדכון תכנון קיים
- **body:** TradePlan object
- **תגובה:** TradePlan object מעודכן

### 4. DELETE /api/trade_plans/{id}
- **תיאור:** מחיקת תכנון
- **תגובה:** הודעת הצלחה

### 5. GET /api/trading_methods/ (חדש בגרסה 3.0.0)
- **תיאור:** קבלת רשימת שיטות מסחר זמינות
- **תגובה:** רשימה של TradingMethod objects

### 6. GET /api/plan_conditions?plan_id={id} (חדש בגרסה 3.0.0)
- **תיאור:** קבלת תנאים של תכנון ספציפי
- **פרמטרים:** `plan_id` - ID של התכנון
- **תגובה:** רשימה של PlanCondition objects

### 7. POST /api/plan_conditions/ (חדש בגרסה 3.0.0)
- **תיאור:** יצירת תנאי חדש לתכנון
- **body:** PlanCondition object
- **תגובה:** PlanCondition object שנוצר

### 8. PUT /api/plan_conditions/{id} (חדש בגרסה 3.0.0)
- **תיאור:** עדכון תנאי קיים
- **body:** PlanCondition object
- **תגובה:** PlanCondition object מעודכן

### 9. DELETE /api/plan_conditions/{id} (חדש בגרסה 3.0.0)
- **תיאור:** מחיקת תנאי
- **תגובה:** הודעת הצלחה

---

## תחזוקה ועדכונים

### 1. הוספת שדה חדש
1. עדכן את המודל ב-Backend (`Backend/models/trade_plan.py`)
2. הוסף את השדה ל-HTML (`trade_plans.html`)
3. עדכן את הפונקציות ב-JavaScript (`trade_plans.js`)
4. עדכן את ה-validation rules
5. עדכן את ה-API endpoints

### 2. שינוי לוגיקה עסקית
1. עדכן את הפונקציות הרלוונטיות ב-`trade_plans.js`
2. ודא שהשינויים מתואמים עם מערכות כלליות
3. עדכן את ה-validation rules במידת הצורך
4. בדוק אינטגרציה עם מערכות אחרות

### 3. שינוי עיצוב
1. עדכן קבצי CSS ב-`styles-new/`
2. ודא עמידה ב-ITCSS principles
3. בדוק responsive design
4. ודא עמידה במערכת הצבעים

### 4. הוספת פונקציונליות חדשה
1. הוסף את הפונקציונליות ל-`trade_plans.js`
2. ודא אינטגרציה עם מערכות כלליות
3. הוסף validation במידת הצורך
4. עדכן את התיעוד

---

## בדיקות מומלצות

### 1. בדיקות פונקציונליות
- [ ] טעינת העמוד והצגת נתונים
- [ ] הוספת תכנון חדש
- [ ] עריכת תכנון קיים
- [ ] מחיקת תכנון
- [ ] ביטול תכנון
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
- `Backend/models/trade_plan.py`
- `Backend/routes/api/trade_plans.py`
- `Backend/models/trading_method.py` (חדש בגרסה 3.0.0)
- `Backend/models/plan_condition.py` (חדש בגרסה 3.0.0)
- `Backend/routes/api/trading_methods.py` (חדש בגרסה 3.0.0)
- `Backend/routes/api/plan_conditions.py` (חדש בגרסה 3.0.0)

---

## הערות חשובות

1. **CASING:** השדות `investment_type` ו-`side` רגישים לאותיות גדולות/קטנות
2. **Validation:** כל השדות עוברים ולידציה גם ב-frontend וגם ב-backend
3. **Cache:** הנתונים נשמרים ב-cache גלובלי (`window.tradePlansData`)
4. **Real-time:** העמוד תומך בעדכונים בזמן אמת דרך מערכת הריענון המרכזית
5. **Accessibility:** העמוד תומך בנגישות עם ARIA labels ותמיכה במקלדת
6. **מערכת התנאים:** התנאים מאותחלים אוטומטית דרך המערכת המאוחדת (`unified-app-initializer.js`)
7. **שיטות מסחר:** המערכת תומכת ב-6 שיטות מסחר: ממוצעים נעים, נפח, תמיכה והתנגדות, קווי מגמה, מבנים טכניים, פיבונצי
8. **אינטגרציה עם התראות:** תנאים יכולים ליצור התראות אוטומטיות דרך מסך ההתראות

---

## קישורים נוספים

- [תיעוד מערכות כלליות](../02-ARCHITECTURE/FRONTEND/)
- [מדריך פיתוח](../DEVELOPMENT_GUIDE.md)
- [מדריך API](../API_DOCUMENTATION.md)
- [מדריך בדיקות](../TESTING_GUIDE.md)
