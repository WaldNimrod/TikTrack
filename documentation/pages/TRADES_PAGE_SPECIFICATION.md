# אפיון עמוד Trades
**תאריך יצירה:** 18 אוקטובר 2025  
**גרסה:** 2.0.6  
**מפתח:** AI Assistant  

---

## תקציר
עמוד Trades הוא עמוד מרכזי במערכת TikTrack המאפשר ניהול טריידים פעילים וסגורים. העמוד מספק ממשק מקיף ליצירה, עריכה, מחיקה וניהול טריידים עם אינטגרציה מלאה למערכות הכלליות של המערכת.

---

## מבנה העמוד

### 1. מבנה הקבצים
```
trading-ui/
├── trades.html               # מבנה ה-HTML הראשי
├── scripts/
│   └── trades.js            # לוגיקת העמוד והפונקציונליות
└── styles-new/              # עיצוב ITCSS
    ├── 05-objects/_layout.css
    ├── 06-components/_buttons-advanced.css
    └── 06-components/_linked-items.css
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

### קבצי CSS נדרשים:
- `styles-new/05-objects/_layout.css`
- `styles-new/06-components/_buttons-advanced.css`
- `styles-new/06-components/_linked-items.css`

### קבצי Backend נדרשים:
- `Backend/models/trade.py`
- `Backend/routes/api/trades.py`

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

---

## קישורים נוספים

- [תיעוד מערכות כלליות](../02-ARCHITECTURE/FRONTEND/)
- [מדריך פיתוח](../DEVELOPMENT_GUIDE.md)
- [מדריך API](../API_DOCUMENTATION.md)
- [מדריך בדיקות](../TESTING_GUIDE.md)
- [אפיון עמוד Trade Plans](./TRADE_PLANS_PAGE_SPECIFICATION.md)
