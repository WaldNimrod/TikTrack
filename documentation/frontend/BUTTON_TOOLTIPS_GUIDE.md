# מדריך ניהול טולטיפים לכפתורים

## סקירה כללית

מערכת ניהול טולטיפים מרוכזת לכפתורים בכל העמודים. המערכת מאפשרת ניהול קל ועדכון של כל טקסטי הטולטיפים ממקום אחד.

## מבנה המערכת

### 1. קובץ התצורה המרכזי

**מיקום:** `trading-ui/scripts/button-tooltips-config.js`

קובץ זה מכיל את כל טקסטי הטולטיפים לכל העמודים בפורמט:

```javascript
const BUTTON_TOOLTIPS_CONFIG = {
  notes: {
    'TOGGLE.top-section': 'הצג או הסתר את אזור הסיכום',
    'ADD.note': 'הוסף הערה חדשה',
    'FILTER.account': 'סינון לפי: חשבונות מסחר',
    // ...
  },
  // עמודים נוספים...
};
```

### 2. פורמט המפתחות

המפתחות בפורמט: `{BUTTON_TYPE}.{CONTEXT}`

- **BUTTON_TYPE**: סוג הכפתור (ADD, EDIT, DELETE, FILTER, SORT, TOGGLE, VIEW, וכו')
- **CONTEXT**: הקשר/הקונטקסט של הכפתור (note, account, trade, linked-object, וכו')

**דוגמאות:**
- `ADD.note` - כפתור הוספה בהקשר של הערות
- `FILTER.account` - כפתור סינון לפי חשבונות
- `SORT.linked-object` - כפתור מיון לפי אובייקט מקושר
- `TOGGLE.top-section` - כפתור הצג/הסתר לאזור עליון

## איך לעדכן טולטיפים

### שלב 1: עדכון קובץ התצורה

ערוך את `trading-ui/scripts/button-tooltips-config.js` והוסף/עדכן את הטקסטים:

```javascript
const BUTTON_TOOLTIPS_CONFIG = {
  notes: {
    'ADD.note': 'הטקסט המדויק שאתה רוצה',  // עדכן כאן
    // ...
  }
};
```

### שלב 2: עדכון הקבצים

**אופציה א': עדכון ידני**

עבור על הקבצים הרלוונטיים (HTML/JS) ועדכן את `data-tooltip` attributes:

```html
<!-- לפני -->
<button data-button-type="ADD" data-entity-type="note" ...>

<!-- אחרי -->
<button data-button-type="ADD" data-entity-type="note" 
        data-tooltip="הטקסט המדויק שאתה רוצה" ...>
```

**אופציה ב': שימוש בפונקציה הגלובלית**

אם הכפתור נוצר דינמית ב-JavaScript, השתמש בפונקציה:

```javascript
const tooltipText = window.getButtonTooltip('notes', 'ADD', 'note');
// השתמש ב-tooltipText ביצירת הכפתור
```

### שלב 3: בדיקה

1. רענן את הדף
2. בדוק שהטולטיפים מופיעים עם הטקסט הנכון
3. בדוק שהטולטיפים עובדים (hover/click)

## דוגמאות לעבודה

### דוגמה 1: עדכון טולטיפ לכפתור ADD בעמוד הערות

1. פתח `trading-ui/scripts/button-tooltips-config.js`
2. מצא את `notes.ADD.note`
3. עדכן את הטקסט:
   ```javascript
   'ADD.note': 'הוסף הערה חדשה למערכת',  // הטקסט החדש
   ```
4. עדכן את `trading-ui/notes.html`:
   ```html
   <button data-button-type="ADD" 
           data-entity-type="note"
           data-tooltip="הוסף הערה חדשה למערכת"
           ...>
   ```

### דוגמה 2: הוספת טולטיפ חדש

1. הוסף לקובץ התצורה:
   ```javascript
   notes: {
     // ... קיים
     'NEW_BUTTON.context': 'טקסט הטולטיפ החדש',
   }
   ```
2. עדכן את הקובץ הרלוונטי (HTML/JS) עם `data-tooltip`

## רשימת כל הכפתורים בעמוד הערות

להלן רשימה של כל הכפתורים בעמוד הערות והמפתחות שלהם בקובץ התצורה:

| כפתור | מיקום | מפתח בתצורה | סטטוס |
|-------|-------|-------------|-------|
| TOGGLE | אזור סיכום | `TOGGLE.top-section` | ✅ |
| ADD | כפתור הוספה ראשי | `ADD.note` | ✅ |
| ADD | מצב ריק | `ADD.note-empty-state` | ✅ |
| FILTER | כל ההערות | `FILTER.all` | ✅ |
| FILTER | חשבונות | `FILTER.account` | ✅ |
| FILTER | טריידים | `FILTER.trade` | ✅ |
| FILTER | תוכניות | `FILTER.trade_plan` | ✅ |
| FILTER | טיקרים | `FILTER.ticker` | ✅ |
| TOGGLE | אזור טבלה | `TOGGLE.main-section` | ✅ |
| SORT | אובייקט מקושר | `SORT.linked-object` | ✅ |
| SORT | תוכן | `SORT.content` | ✅ |
| SORT | תאריך יצירה | `SORT.created` | ✅ |
| SORT | תאריך עדכון | `SORT.updated` | ✅ |
| MENU | תפריט פעולות | `MENU.actions` | ✅ |
| VIEW | צפייה בהערה | `VIEW.note` | ✅ |
| EDIT | עריכת הערה | `EDIT.note` | ✅ |
| DELETE | מחיקת הערה | `DELETE.note` | ✅ |

## טיפים

1. **עקביות**: השתמש באותם טקסטים לכפתורים דומים בכל העמודים
2. **בהירות**: הטקסט צריך להיות ברור ומסביר מה הכפתור עושה
3. **אורך**: נסה לשמור על טקסטים קצרים (עד 50 תווים)
4. **הקשר**: השתמש ב-context כדי להבדיל בין כפתורים דומים בהקשרים שונים

## פתרון בעיות

### בעיה: הטולטיפ לא מופיע
**פתרון:**
1. בדוק שיש `data-tooltip` attribute
2. בדוק שהמערכת מאותחלת: `window.advancedButtonSystem.initializeTooltips()`
3. בדוק את הקונסול לשגיאות

### בעיה: הטקסט לא נכון
**פתרון:**
1. בדוק את `button-tooltips-config.js`
2. בדוק שהמפתח נכון (BUTTON_TYPE.CONTEXT)
3. בדוק שהקובץ עודכן נכון

## הערות חשובות

- כל הטולטיפים משתמשים ב-`data-tooltip` (לא `title`)
- הטולטיפים מאותחלים אוטומטית דרך `advancedButtonSystem`
- הקובץ `button-tooltips-config.js` הוא מקור האמת - עדכן אותו ראשון

