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

### 3. חוויית משתמש ומעקב
- **טבלת תקציר תנאים** – מוצגת במודל עריכת תכנית (66% מהרוחב), כוללת עמודות שיטה/אופרטור/פרמטרים/עודכן/פעולות ופועלת על בסיס הנתונים של `EntityDetailsAPI`.
- **כפתורי פעולה אחידים** – כל הכפתורים (הוספה/עריכה/מחיקה) משתמשים ב-`ButtonSystem.processButtons` עם `data-variant="small"` להצגת איקונים בלבד (ללא טקסט) בכיוון RTL תקין.
- **Modal Navigation Integration** – `ConditionsModalController` שומר על מודל האב, תומך ב-`focusConditionId` לעריכת תנאי מתוך התקציר ומונע ריענון דף באמצעות `ConditionsReloadBypass`.
- **Post-Save Confirmation** – לאחר שמירה מוצג חלון ייעודי (“הוסף תנאי נוסף” / “חזרה לתכנון”) במקום סגירה כפולה של מודלים.

### 4. אינטגרציה
- **תכניות מסחר** - הגדרת תנאים לתכניות
- **טריידים** - הגדרת תנאים לטריידים
- **התראות** - יצירת התראות מתנאים קיימים
- **נתונים חיצוניים** - שימוש בנתוני שוק אמיתיים

---

## עדכוני נובמבר 2025 (גרסה 1.1.0)

> **מטרה:** תיעוד תוספות היציבות וה-UX שבוצעו בסבב האחרון (Backend + Frontend + DevEx).

### Backend & DB
- `_ensure_conditions_tables()` רץ בכל פעולה (GET/POST/PUT/DELETE) ומוודא קיום כל הטבלאות, העמודות והאינדקסים (כולל `method_key`, `auto_generate_alerts`).
- `TradingMethod` מחזיר `method_key` מחושב (`_generate_method_key`) כדי להבטיח צימוד מלא לוולידציה בצד הלקוח.
- `parameters_json` מתקבל כאובייקט ומומר ל-JSON string יחיד כדי למנוע stringify כפול ותקלות decoding.

### ולידציה בצד הלקוח
- `conditions-validator.js` מחובר ל-`conditionsCRUDManager` וקורא את רשימת השיטות מ-cache.
- הוגדרו חוקים מפורטים לכל שש השיטות: חובה/רשות, טיפוסים, טווחי ערכים, הערות תרגום ויחידות מדידה.
- פונקציית `safeParse` מוודאת JSON nested (למשל `validation_rule`) ומחזירה הודעות ברורות ללוגרים/משתמש.

### UI & חוויית משתמש
- `conditions-form-generator.js` הופך את כפתור “שמור” ל-`type="button"` ומונע submit טבעי כדי לשמור את המודלים פתוחים ולרשום לוגים.
- `conditions-ui-manager.js` ו-`conditions-crud-manager.js` מנהלים עצמאית הצלחות/שגיאות, מונעים reliance על `CRUDResponseHandler` ומוסיפים מודל Post-Save מותאם.
- `trade_plans.js` יוצר תקציר תנאים, מאזין ל-`tradePlanConditionsUpdated`, מפעיל `ButtonSystem` לכל כפתור פעולה ומאפשר עריכה/מחיקה ישירות מהטבלה.
- כפתור “הוסף תנאי” הוצב לצד שדה התגיות בשורה משותפת (33%/66%), משתמש ב-`data-button-type="ADD"` + `data-variant="small"` ומוצג בצד שמאל (RTL) עם tooltip/aria-label.

### לוגים והתראות
- כלל התרחישים המרכזיים שולחים לוגים דרך `window.Logger` עם תגיות ייעודיות (`ConditionsFlow`, `ConditionsCRUD`, `ConditionsFormFlow`, `ConditionsReloadBypass`).
- הודעות למשתמש מוצגות רק באמצעות `window.showNotification`, ללא נתוני ברירת מחדל/פיקטיביים (עמידה בכלל 48).
- preferences נטענים דרך `window.getCurrentPreference` שמכניס cache לאחוד (UnifiedCacheManager + API + localStorage) ומפסיק spam ל-`/api/preferences/default`.

### בדיקות מומלצות
1. **UI** – לפתוח מודל תכנית, להוסיף תנאי לכל אחת מהשיטות, לוודא שהתקציר מעודכן ושכפתורי הפעולה פועלים.
2. **Backend** – להריץ `pytest Backend/tests/test_conditions_master_data.py` לווידוא זריעת הנתונים.
3. **DB** – לאמת שהטבלאות `plan_conditions` / `trade_conditions` כוללות את העמודות החדשות ולהריץ `.schema` מול `tiktrack.db`.

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
