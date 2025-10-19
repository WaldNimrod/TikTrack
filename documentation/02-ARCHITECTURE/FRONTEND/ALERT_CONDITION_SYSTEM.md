# מערכת בניית תנאים להתראות - Alert Condition System
## Alert Condition Building System Documentation

### תאריך עדכון: 2025-01-16
### סטטוס: 🚧 בפיתוח מתקדם

---

## 📋 סקירה כללית

מערכת בניית התנאים להתראות מאפשרת למשתמשים ליצור תנאים דינמיים וחכמים להתראות מסחר. המערכת כוללת שני ממשקי משתמש עיקריים:

1. **ממשק חכם (ברירת מחדל)**: ממשק דינמי שמשתנה לפי סוג הנתון
2. **ממשק קבוע (פולבאק)**: ממשק עם 3 שדות קבועים לכל האופציות

---

## 🏗️ ארכיטקטורה

### קבצים מרכזיים:

#### 1. `trading-ui/scripts/services/alert-condition-renderer.js`
**שירות מרכזי לרינדור תנאי התראות**

```javascript
class AlertConditionRenderer {
    static interfaceMode = 'dynamic'; // 'dynamic' | 'fixed'
    
    // מיפוי מאפיינים לעברית ומאפיינים טכניים
    static attributeConfig = {
        price: { label: 'מחיר', unit: '$', icon: '💰', ... },
        change: { label: 'שינוי באחוזים', unit: '%', icon: '📈', ... },
        volume: { label: 'נפח מסחר', unit: '', icon: '📊', ... },
        ma: { label: 'ממוצע נע', unit: '$', icon: '📉', ... }
    };
}
```

**תכונות עיקריות:**
- ניהול מצב ממשק (דינמי/קבוע)
- רינדור שדות דינמיים לפי מאפיין
- קבלת מטבע דינמי לפי טיקר
- רינדור תצוגה מקדימה של תנאים

#### 2. `trading-ui/scripts/services/select-populator-service.js`
**שירות מילוי select boxes**

```javascript
class AlertConditionPopulator {
    static populateAttributeSelect(selectId, selectedValue = null);
    static populateOperatorSelect(selectId, selectedValue = null);
}
```

#### 3. `trading-ui/scripts/alerts.js`
**לוגיקה ראשית לבניית תנאים**

**פונקציות מרכזיות:**
- `loadSmartOperators(attribute, selectId)` - טעינת אופרטורים לפי מאפיין
- `updateSmartPreview()` - עדכון תצוגה מקדימה
- `onSmartConditionChange()` - טיפול בשינוי בממשק החכם
- `toggleConditionInterface()` - החלפה בין ממשקים

---

## 🔧 סוגי נתונים ואופרטורים

### 1. מחיר (PRICE)
**משמעות:** מחיר הנוכחי של הנכס
**מקור:** שרת נתונים חיצוני (Yahoo Finance)

**אופרטורים זמינים:**
```javascript
price: [
    { value: 'more_than', label: 'יותר מ' },      // מחיר > X
    { value: 'less_than', label: 'פחות מ' },      // מחיר < X  
    { value: 'equals', label: 'שווה בדיוק ל' },   // מחיר = X
    { value: 'change', label: 'שינוי בכל כיוון' }, // שינוי של X% (כל כיוון)
    { value: 'change_up', label: 'עליה של' },     // עליה של X%
    { value: 'change_down', label: 'ירידה של' },   // ירידה של X%
    { value: 'cross_up', label: 'חוצה למעלה' },   // חוצה קו למעלה
    { value: 'cross_down', label: 'חוצה למטה' }   // חוצה קו למטה
]
```

**ולידציה UI:**
- `min: 0.01` - לפחות 1 סנט
- `max: 10000` - מקסימום $10,000 למניה
- `step: 0.01` - דיוק של 2 ספרות
- `unit: '$'` - מטבע דינמי לפי טיקר

### 2. שינוי באחוזים (CHANGE)
**משמעות:** שינוי במחיר באחוזים
**מקור:** חישוב: ((מחיר נוכחי - מחיר קודם) / מחיר קודם) * 100

**אופרטורים זמינים:**
```javascript
change: [
    { value: 'more_than', label: 'יותר מ' },      // שינוי > X%
    { value: 'less_than', label: 'פחות מ' },      // שינוי < X% 
    { value: 'change_up', label: 'עליה של' },     // עליה של X%
    { value: 'change_down', label: 'ירידה של' },   // ירידה של X%
    { value: 'change', label: 'שינוי גדול מ' }    // שינוי בכל כיוון X%
]
```

**ולידציה UI:**
- `min: -100` - מקסימום ירידה 100%
- `max: 1000` - מקסימום עליה
- `step: 0.01` - דיוק של 2 ספרות
- `unit: '%'` - תמיד אחוזים

### 3. נפח מסחר (VOLUME)
**משמעות:** כמות המניות שנסחרו במהלך תקופה
**מקור:** שרת נתונים חיצוני

**אופרטורים זמינים:**
```javascript
volume: [
    { value: 'more_than', label: 'יותר מ' },           // נפח גבוה מהרגיל
    { value: 'less_than', label: 'פחות מ' },           // נפח נמוך מהרגיל
    { value: 'cross_up', label: 'פורץ ממוצע יומי' },   // נפח פורץ את הממוצע היומי למעלה
    { value: 'cross_down', label: 'יורד מתחת לממוצע' } // נפח יורד מתחת לממוצע היומי
]
```

**ולידציה UI:**
- `min: 1` - לפחות יחידה אחת
- `max: 1000000000` - מקסימום מיליארד יחידות
- `step: 1` - מספר שלם
- `unit: ''` - ללא יחידה

### 4. ממוצע נע (MA)
**משמעות:** ממוצע מחירים של תקופה מסוימת
**מקור:** חישוב על בסיס נתוני מחירים היסטוריים

**אופרטורים זמינים:**
```javascript
ma: [
    { value: 'cross_up', label: 'חוצה למעלה' },   // מחיר חוצה MA למעלה (אות קנייה)
    { value: 'cross_down', label: 'חוצה למטה' },   // מחיר חוצה MA למטה (אות מכירה)
    { value: 'cross', label: 'חוצה' },            // חוצה בכל כיוון
    { value: 'more_than', label: 'מעל' },         // מחיר מעל MA
    { value: 'less_than', label: 'מתחת' }         // מחיר מתחת MA
]
```

**ולידציה UI:**
- `min: 0.01` - כמו מחיר
- `max: 10000` - כמו מחיר
- `step: 0.01` - כמו מחיר
- `unit: '$'` - מטבע דינמי לפי טיקר

---

## 💱 מערכת מטבע דינמית

### לוגיקה:
1. **קבלת מטבע הטיקר:**
```javascript
static async getTickerCurrency(tickerId) {
    const response = await fetch(`/api/tickers/${tickerId}`);
    const data = await response.json();
    return data.data?.currency?.symbol || '$'; // fallback ל-USD
}
```

2. **עדכון יחידת המחיר:**
```javascript
static async updatePriceUnit(tickerId) {
    if (tickerId) {
        const currency = await this.getTickerCurrency(tickerId);
        if (this.attributeConfig.price) {
            this.attributeConfig.price.unit = currency;
        }
    }
}
```

3. **Event Listeners מעודכנים:**
- `onRelatedObjectChange()` - עדכון מטבע כשמשנים טיקר במודל הוספה
- `onEditAlertRelatedObjectChange()` - עדכון מטבע כשמשנים טיקר במודל עריכה

---

## 🔄 ממשקי משתמש

### ממשק חכם (ברירת מחדל)
**מאפיינים:**
- 3 שדות בשורה אחת: מאפיין | אופרטור | ערך
- שדה האופרטור מתעדכן לפי המאפיין שנבחר
- שדה הערך משתנה לפי המאפיין והאופרטור (יחידות, min/max/step)
- תצוגה מקדימה פעילה

**היגיון דינמי:**
```javascript
// יחידות לפי attribute ו-operator
if (attributeValue === 'price') {
    if (operatorValue === 'change' || operatorValue === 'change_up' || operatorValue === 'change_down') {
        unit = '%'; // שינוי באחוזים
    } else {
        unit = currencyUnit; // ערך מוחלט במטבע הטיקר
    }
}
```

### ממשק קבוע (פולבאק)
**מאפיינים:**
- 3 שדות קבועים לכל האופציות
- כל השדות תמיד זמינים
- תצוגה מקדימה מוסתרת (מיותרת)

---

## 🎨 רכיבי UI

### אינדיקטור מצב ממשק
```html
<small id="interfaceModeIndicator" class="text-muted">
    <i class="fas fa-magic"></i> ממשק חכם פעיל
</small>
<button onclick="toggleConditionInterface()" class="btn btn-sm btn-outline-secondary">
    <span>החלף</span>
</button>
```

### תצוגה מקדימה
```html
<div class="card bg-light border-info" style="max-width: 400px;">
    <div class="card-body p-2">
        <small id="conditionPreview" class="condition-preview text-muted">בחר תנאי...</small>
    </div>
</div>
```

---

## 🔧 תכונות טכניות

### Backend Integration
**קבצים רלוונטיים:**
- `Backend/models/alert.py` - מודל התראה עם ולידציות
- `Backend/services/alert_service.py` - לוגיקה עסקית

**אילוצי בסיס נתונים:**
```python
valid_attributes = ['price', 'change', 'ma', 'volume']
valid_operators = [
    'more_than', 'less_than', 'cross', 'cross_up', 'cross_down',
    'change', 'change_up', 'change_down', 'equals'
]
```

### Frontend Services
**מערכת טעינה מאוחדת:**
- `alert-condition-renderer.js` נטען ב-Stage 4
- אינטגרציה עם `select-populator-service.js`
- תמיכה במערכת העדפות דינמית

---

## 📈 תכונות מתקדמות

### עדכון תצוגה בזמן אמת
```javascript
function updateSmartPreview() {
    // חיפוש שדה הערך החדש שנוצר דינמית
    const valueContainer = document.getElementById('smartValueContainer');
    let valueInput = valueContainer?.querySelector('input');
    
    // בניית טקסט תנאי עם יחידות דינמיות
    const previewText = `${attributeLabel} ${operatorLabel} ${numberValue}${unitDisplay}`;
}
```

### טיפול בשגיאות
- Fallback לממשק קבוע במקרה של שגיאה
- וולידציה של ערכים לפני שליחה לשרת
- הודעות שגיאה ברורות למשתמש

---

## 🚀 משימות עתידיות (עדיפות גבוהה)

### 1. שיפורי UX/UI
- [ ] הוספת tooltips להסבר אופרטורים
- [ ] שיפור אנימציות מעבר בין ממשקים
- [ ] הוספת דוגמאות לכל אופרטור

### 2. פונקציונליות מתקדמת
- [ ] הוספת תנאים מורכבים (AND/OR)
- [ ] שמירת תבניות תנאים נפוצות
- [ ] היסטוריית תנאים

### 3. מיטוב ביצועים
- [ ] Cache למטבעות טיקרים
- [ ] Lazy loading של אופרטורים
- [ ] Debounce לעדכון תצוגה מקדימה

### 4. בדיקות ולידציה
- [ ] בדיקות יחידה לכל פונקציה
- [ ] ולידציה מקיפה של תנאים
- [ ] בדיקות אינטגרציה עם Backend

---

## 📋 רשימת קבצים

### קבצים מרכזיים:
- `trading-ui/scripts/services/alert-condition-renderer.js` - שירות רינדור מרכזי
- `trading-ui/scripts/services/select-populator-service.js` - מילוי select boxes
- `trading-ui/scripts/alerts.js` - לוגיקה ראשית
- `trading-ui/alerts.html` - HTML ממשקים

### Backend:
- `Backend/models/alert.py` - מודל התראה
- `Backend/services/alert_service.py` - שירות התראות

### דוקומנטציה:
- `documentation/02-ARCHITECTURE/FRONTEND/ALERT_CONDITION_SYSTEM.md` - קובץ זה

---

**מחבר:** TikTrack Development Team  
**גרסה:** 2.0  
**סטטוס:** 🚧 בפיתוח מתקדם - מוכן לשימוש בסיסי, דורש שיפורים נוספים
