# מערכת התנאים - Conditions System
**תאריך יצירה:** 19 אוקטובר 2025  
**גרסה:** 1.0.0  
**מפתח:** AI Assistant  

---

## תקציר
מערכת התנאים היא מערכת מתקדמת המאפשרת הגדרת תנאים מותאמים אישית לתכניות מסחר וטריידים. המערכת תומכת ב-6 שיטות מסחר שונות ומאפשרת יצירת התראות אוטומטיות בהתאם לתנאים שהוגדרו.

---

## מבנה המערכת

### 1. רכיבי המערכת
```
conditions-system/
├── README.md                           # דוקומנטציה ראשית
├── ARCHITECTURE.md                     # ארכיטקטורה מפורטת
├── API_DOCUMENTATION.md                # תיעוד API
├── USER_GUIDE.md                       # מדריך משתמש
├── DEVELOPER_GUIDE.md                  # מדריך מפתח
├── INTEGRATION_GUIDE.md                # מדריך אינטגרציה
├── TESTING_GUIDE.md                    # מדריך בדיקות
└── examples/                           # דוגמאות שימוש
    ├── basic-usage.md
    ├── advanced-usage.md
    └── integration-examples.md
```

### 2. קבצי המערכת
```
Backend/
├── models/
│   ├── trading_method.py               # מודל שיטות מסחר
│   └── plan_condition.py               # מודל תנאים
├── routes/api/
│   ├── trading_methods.py              # API שיטות מסחר
│   ├── plan_conditions.py              # API תנאי תכניות
│   └── trade_conditions.py             # API תנאי טריידים
└── services/
    ├── conditions_validation_service.py # שירות ולידציה
    └── conditions_evaluation_service.py # שירות הערכה

trading-ui/
├── scripts/conditions/
│   ├── conditions-translations.js      # תרגומים
│   ├── conditions-validator.js         # ולידציה קליינט
│   ├── conditions-form-generator.js    # טופס דינמי
│   ├── conditions-crud-manager.js      # חיבור CRUD מאוחד
│   ├── conditions-ui-manager.js        # רינדור ממשק תנאים
│   └── conditions-modal-controller.js  # אינטגרציה עם ModalNavigationService
└── styles-new/06-components/
    └── _conditions-system.css          # עיצוב מערכת
```

---

## תכונות עיקריות

### 1. שיטות מסחר נתמכות
- **ממוצעים נעים** - Moving Averages
- **נפח** - Volume Analysis
- **תמיכה והתנגדות** - Support and Resistance
- **קווי מגמה** - Trend Lines
- **מבנים טכניים** - Technical Patterns (Cup & Handle, etc.)
- **פיבונצי ואיזור הזהב** - Fibonacci & Golden Zone

### 2. פונקציונליות
- **ניהול תנאים** - מודול אחוד למעבר בין תכניות, טריידים והתראות
- **ולידציה** - בדיקת תקינות פרמטרים
- **רשת תנאים** - העתקת תנאים מתכניות מסחר לטריידים
- **התראות אוטומטיות** - יצירת התראות מתנאים
- **ניהול קבוצות** - ארגון תנאים בקבוצות לוגיות

### 3. אינטגרציה
- **תכניות מסחר** - הגדרת תנאים לתכניות
- **טריידים** - הגדרת תנאים לטריידים
- **התראות** - יצירת התראות מתנאים קיימים
- **נתונים חיצוניים** - שימוש בנתוני שוק אמיתיים

---

## דרישות מערכת

### 1. Backend
- Python 3.9+
- Flask 2.3+
- SQLAlchemy 1.4+
- PostgreSQL/SQLite

### 2. Frontend
- Modern Browser (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript ES6+
- Bootstrap 5.3+
- ITCSS Architecture

### 3. Dependencies
- מערכת התראות
- מערכת נתונים חיצוניים
- מערכת ולידציה מרכזית
- מערכת אתחול מאוחדת

---

## התקנה והגדרה

### 1. Backend Setup
```bash
# הפעלת migration
cd Backend
python3 migrations_manager.py

# יצירת נתוני דמה
python3 create_fresh_database.py
```

### 2. Frontend Setup
```html
<!-- הוספת קבצי CSS -->
<link rel="stylesheet" href="styles-new/06-components/_conditions-system.css">

<!-- הוספת קבצי JS -->
<script src="scripts/conditions/conditions-translations.js"></script>
<script src="scripts/conditions/conditions-validator.js"></script>
<script src="scripts/conditions/conditions-form-generator.js"></script>
<script src="scripts/conditions/conditions-crud-manager.js"></script>
<script src="scripts/conditions/conditions-initializer.js"></script>
<script src="scripts/modal-configs/conditions-config.js"></script>
<script src="scripts/conditions/conditions-ui-manager.js"></script>
<script src="scripts/conditions/conditions-modal-controller.js"></script>
```

### 3. אתחול המערכת
```javascript
// פתיחת מודול התנאים מתוך מודל ההורה
window.ConditionsModalController.open({
  entityType: 'plan',
  entityId: 42,
  entityName: 'TSLA Swing Plan',
  parentModalId: 'tradePlansModal'
});
```

---

## שימוש מהיר

### 1. יצירת תנאי פשוט
```javascript
// יצירת תנאי ממוצע נע
const condition = {
    method: 'moving_averages',
    parameters: {
        period: 20,
        type: 'SMA',
        comparison: 'above'
    }
};
```

### 2. יצירת תנאי מורכב
```javascript
// יצירת תנאי עם מספר פרמטרים
const condition = {
    method: 'support_resistance',
    parameters: {
        level_type: 'resistance',
        price: 150.00,
        tolerance: 0.5,
        time_frame: '1h'
    }
};
```

### 3. יצירת התראה מתנאי
```javascript
// יצירת התראה מתנאי קיים
const alert = {
    condition_id: 123,
    condition_type: 'plan',
    message: 'תנאי הופעל - זמן לפעולה!',
    state: 'active'
};
```

---

## קישורים נוספים

- [ארכיטקטורה מפורטת](./ARCHITECTURE.md)
- [תיעוד API](./API_DOCUMENTATION.md)
- [מדריך משתמש](./USER_GUIDE.md)
- [מדריך מפתח](./DEVELOPER_GUIDE.md)
- [מדריך אינטגרציה](./INTEGRATION_GUIDE.md)
- [מדריך בדיקות](./TESTING_GUIDE.md)

---

## תמיכה ועזרה

- **דיווח באגים:** [GitHub Issues](https://github.com/your-repo/issues)
- **שאלות:** [GitHub Discussions](https://github.com/your-repo/discussions)
- **תיעוד נוסף:** [Wiki](https://github.com/your-repo/wiki)

---

## רישיון

© 2025 TikTrack. כל הזכויות שמורות.
