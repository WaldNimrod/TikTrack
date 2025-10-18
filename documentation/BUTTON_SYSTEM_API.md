# API Reference - מערכת הכפתורים המרכזית
## Button System API Reference

**גרסה:** 2.0.0  
**תאריך:** 16 בינואר 2025  
**מחבר:** TikTrack Development Team

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [פונקציות גלובליות](#פונקציות-גלובליות)
3. [מחלקות](#מחלקות)
4. [אובייקטים](#אובייקטים)
5. [אירועים](#אירועים)
6. [דוגמאות שימוש](#דוגמאות-שימוש)

---

## סקירה כללית

מערכת הכפתורים המרכזית מספקת API מקיף ליצירה, ניהול ואתחול של כפתורים באתר. ה-API כולל פונקציות גלובליות, מחלקות מתקדמות ואובייקטי הגדרה.

### מבנה ה-API

```
window
├── buttonSystem              # instance של AdvancedButtonSystem
├── advancedButtonSystem      # instance של AdvancedButtonSystem
├── initializeButtons()       # פונקציה לאתחול ידני
├── addDynamicButton()        # פונקציה להוספת כפתור דינמי
├── updateButton()           # פונקציה לעדכון כפתור
├── getButtonSystemStats()   # פונקציה לקבלת סטטיסטיקות
├── BUTTON_ICONS            # מפת איקונים
├── BUTTON_TEXTS            # מפת טקסטים
├── createButton()          # פונקציות יצירה בסיסיות
├── createEditButton()      # פונקציות יצירה ספציפיות
├── createDeleteButton()    # ...
└── getButtonClass()        # פונקציה לקבלת CSS class
```

---

## פונקציות גלובליות

### `window.initializeButtons()`

אתחול ידני של כל הכפתורים עם data attributes.

**תיאור:** מחפש את כל הכפתורים עם `data-button-type` וממיר אותם לכפתורים פונקציונליים.

**פרמטרים:** אין

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
// אתחול ידני של כל הכפתורים
window.initializeButtons();
```

**הערות:**
- הפונקציה רצה אוטומטית בטעינת הדף
- ניתן לקרוא לה שוב לאחר הוספת כפתורים דינמיים
- לא פוגעת בכפתורים שכבר עובדים

---

### `window.addDynamicButton(container, type, onClick, classes, attributes, text)`

הוספת כפתור דינמי ל-Container.

**תיאור:** יוצרת כפתור חדש עם data attributes ומוסיפה אותו ל-Container.

**פרמטרים:**
- `container` (HTMLElement) - אלמנט ה-Container
- `type` (string) - סוג הכפתור (EDIT, DELETE, ADD, וכו')
- `onClick` (string) - פונקציה להרצה בלחיצה
- `classes` (string, אופציונלי) - classes נוספים
- `attributes` (string, אופציונלי) - attributes נוספים
- `text` (string, אופציונלי) - טקסט מותאם

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
// הוספת כפתור הוספה
const container = document.getElementById('buttonContainer');
window.addDynamicButton(
    container,
    'ADD',
    'showAddModal()',
    'btn-success btn-sm',
    'id="newAddBtn"',
    'הוסף פריט חדש'
);
```

**הערות:**
- הכפתור נוצר עם data attributes
- המערכת ממירה אותו אוטומטית לכפתור פונקציונלי
- ניתן להוסיף attributes מותאמים

---

### `window.updateButton(buttonId, type, onClick, classes, attributes, text)`

עדכון כפתור קיים.

**תיאור:** מוצא כפתור לפי ID ומעדכן אותו עם הגדרות חדשות.

**פרמטרים:**
- `buttonId` (string) - ID של הכפתור לעדכון
- `type` (string) - סוג הכפתור החדש
- `onClick` (string) - פונקציה להרצה בלחיצה
- `classes` (string, אופציונלי) - classes נוספים
- `attributes` (string, אופציונלי) - attributes נוספים
- `text` (string, אופציונלי) - טקסט מותאם

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
// עדכון כפתור קיים
window.updateButton(
    'existingButton',
    'SAVE',
    'saveWithValidation()',
    'btn-primary btn-lg',
    'data-validate="true"',
    'שמור עם בדיקה'
);
```

**הערות:**
- הכפתור חייב להיות קיים ב-DOM
- העדכון כולל החלפה מלאה של הכפתור
- ניתן לשנות את כל המאפיינים

---

### `window.getButtonSystemStats()`

קבלת סטטיסטיקות המערכת.

**תיאור:** מחזיר אובייקט עם סטטיסטיקות מפורטות על המערכת.

**פרמטרים:** אין

**ערך החזרה:** `Object`

**דוגמה:**
```javascript
const stats = window.getButtonSystemStats();
console.log(stats);
// Output:
// {
//   performance: {
//     startTime: 1234567890,
//     endTime: 1234567891,
//     processedButtons: 25,
//     errors: 0
//   },
//   cache: {
//     hits: 15,
//     misses: 10,
//     size: 25
//   },
//   buttons: 25,
//   observers: 1
// }
```

**הערות:**
- הסטטיסטיקות מתעדכנות בזמן אמת
- כולל מידע על ביצועים, cache ומעקבים
- שימושי לדיבוג ואופטימיזציה

---

## מחלקות

### `AdvancedButtonSystem`

המחלקה הראשית של המערכת המתקדמת.

#### Constructor

```javascript
new AdvancedButtonSystem(config)
```

**פרמטרים:**
- `config` (Object, אופציונלי) - הגדרות המערכת

**דוגמה:**
```javascript
const myButtonSystem = new AdvancedButtonSystem({
    logging: {
        enabled: true,
        level: 'debug'
    },
    performance: {
        batchSize: 100
    }
});
```

#### Properties

##### `config`
הגדרות המערכת.

**טיפוס:** `Object`

**דוגמה:**
```javascript
const config = window.advancedButtonSystem.config;
console.log(config.logging.level); // 'info'
```

##### `initialized`
סטטוס האתחול של המערכת.

**טיפוס:** `boolean`

**דוגמה:**
```javascript
if (window.advancedButtonSystem.initialized) {
    console.log('המערכת מאותחלת');
}
```

##### `buttons`
מפת הכפתורים המעובדים.

**טיפוס:** `Map`

**דוגמה:**
```javascript
const buttons = window.advancedButtonSystem.buttons;
console.log(buttons.size); // מספר הכפתורים
```

#### Methods

##### `init()`

אתחול המערכת.

**תיאור:** מאתחל את המערכת ומגדיר את כל המעקבים.

**פרמטרים:** אין

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
window.advancedButtonSystem.init();
```

##### `initializeButtons()`

אתחול כל הכפתורים עם data attributes.

**תיאור:** מחפש ומעבד את כל הכפתורים עם data attributes.

**פרמטרים:** אין

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
window.advancedButtonSystem.initializeButtons();
```

##### `addButton(container, type, onClick, classes, attributes, text)`

הוספת כפתור דינמי.

**תיאור:** יוצרת כפתור חדש ומוסיפה אותו ל-Container.

**פרמטרים:**
- `container` (HTMLElement) - אלמנט ה-Container
- `type` (string) - סוג הכפתור
- `onClick` (string) - פונקציה להרצה בלחיצה
- `classes` (string, אופציונלי) - classes נוספים
- `attributes` (string, אופציונלי) - attributes נוספים
- `text` (string, אופציונלי) - טקסט מותאם

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
const container = document.getElementById('container');
window.advancedButtonSystem.addButton(
    container,
    'EDIT',
    'editRecord(123)',
    'btn-sm',
    'data-id="123"',
    'ערוך רשומה'
);
```

##### `updateButton(buttonId, type, onClick, classes, attributes, text)`

עדכון כפתור קיים.

**תיאור:** מוצא כפתור לפי ID ומעדכן אותו.

**פרמטרים:**
- `buttonId` (string) - ID של הכפתור
- `type` (string) - סוג הכפתור החדש
- `onClick` (string) - פונקציה להרצה בלחיצה
- `classes` (string, אופציונלי) - classes נוספים
- `attributes` (string, אופציונלי) - attributes נוספים
- `text` (string, אופציונלי) - טקסט מותאם

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
window.advancedButtonSystem.updateButton(
    'button123',
    'DELETE',
    'deleteRecord(123)',
    'btn-danger btn-sm',
    'data-confirm="true"',
    'מחק רשומה'
);
```

##### `getStats()`

קבלת סטטיסטיקות המערכת.

**תיאור:** מחזיר אובייקט עם סטטיסטיקות מפורטות.

**פרמטרים:** אין

**ערך החזרה:** `Object`

**דוגמה:**
```javascript
const stats = window.advancedButtonSystem.getStats();
console.log(stats.performance.processedButtons);
```

##### `cleanup()`

ניקוי המערכת.

**תיאור:** מנקה את כל המעקבים והנתונים.

**פרמטרים:** אין

**ערך החזרה:** `undefined`

**דוגמה:**
```javascript
window.advancedButtonSystem.cleanup();
```

---

### `ButtonSystemLogger`

מערכת לוגים מתקדמת.

#### Constructor

```javascript
new ButtonSystemLogger(config)
```

**פרמטרים:**
- `config` (Object) - הגדרות הלוגים

#### Methods

##### `log(level, message, data)`

הוספת לוג.

**פרמטרים:**
- `level` (string) - רמת הלוג (debug, info, warn, error)
- `message` (string) - הודעת הלוג
- `data` (any, אופציונלי) - נתונים נוספים

**דוגמה:**
```javascript
window.advancedButtonSystem.logger.log('info', 'כפתור נוסף', { type: 'ADD' });
```

##### `debug(message, data)`

הוספת לוג debug.

**דוגמה:**
```javascript
window.advancedButtonSystem.logger.debug('עיבוד כפתור', { id: 'btn1' });
```

##### `info(message, data)`

הוספת לוג info.

**דוגמה:**
```javascript
window.advancedButtonSystem.logger.info('אתחול הושלם');
```

##### `warn(message, data)`

הוספת לוג warning.

**דוגמה:**
```javascript
window.advancedButtonSystem.logger.warn('כפתור לא נמצא', { id: 'btn1' });
```

##### `error(message, data)`

הוספת לוג error.

**דוגמה:**
```javascript
window.advancedButtonSystem.logger.error('שגיאה בעיבוד', { error: err });
```

---

### `ButtonSystemCache`

מערכת cache לביצועים.

#### Constructor

```javascript
new ButtonSystemCache(config)
```

**פרמטרים:**
- `config` (Object) - הגדרות ה-cache

#### Methods

##### `get(key)`

קבלת ערך מה-cache.

**פרמטרים:**
- `key` (string) - מפתח ה-cache

**ערך החזרה:** `any` או `null`

**דוגמה:**
```javascript
const cachedButton = window.advancedButtonSystem.cache.get('button-html-123');
```

##### `set(key, value)`

הגדרת ערך ב-cache.

**פרמטרים:**
- `key` (string) - מפתח ה-cache
- `value` (any) - הערך לשמירה

**דוגמה:**
```javascript
window.advancedButtonSystem.cache.set('button-html-123', '<button>...</button>');
```

##### `clear()`

ניקוי ה-cache.

**דוגמה:**
```javascript
window.advancedButtonSystem.cache.clear();
```

##### `getStats()`

קבלת סטטיסטיקות ה-cache.

**ערך החזרה:** `Object`

**דוגמה:**
```javascript
const cacheStats = window.advancedButtonSystem.cache.getStats();
console.log(cacheStats.hits, cacheStats.misses);
```

---

## אובייקטים

### `BUTTON_ICONS`

מפת איקונים לכל סוגי הכפתורים.

**טיפוס:** `Object`

**דוגמה:**
```javascript
console.log(window.BUTTON_ICONS.EDIT);    // '✏️'
console.log(window.BUTTON_ICONS.DELETE);  // '🗑️'
console.log(window.BUTTON_ICONS.ADD);     // '➕'
```

**רשימת איקונים:**
- `EDIT`: '✏️'
- `DELETE`: '🗑️'
- `CANCEL`: '❌'
- `LINK`: '🔗'
- `ADD`: '➕'
- `SAVE`: '💾'
- `CLOSE`: '✖️'
- `REFRESH`: '🔄'
- `EXPORT`: '📤'
- `IMPORT`: '📥'
- `SEARCH`: '🔍'
- `FILTER`: '🔧'
- `VIEW`: '👁️'
- `DUPLICATE`: '📋'
- `ARCHIVE`: '📦'
- `RESTORE`: '📤'
- `REACTIVATE`: '🔄'
- `APPROVE`: '✅'
- `REJECT`: '<span class="cancel-icon">X</span>'
- `PAUSE`: '⏸️'
- `PLAY`: '▶️'
- `STOP`: '⏹️'
- `READ`: '✓'
- `CHECK`: '✓'
- `TOGGLE`: '▼'
- `SORT`: '↕️'

---

### `BUTTON_TEXTS`

מפת טקסטים לכל סוגי הכפתורים.

**טיפוס:** `Object`

**דוגמה:**
```javascript
console.log(window.BUTTON_TEXTS.EDIT);    // 'ערוך'
console.log(window.BUTTON_TEXTS.DELETE);  // 'מחק'
console.log(window.BUTTON_TEXTS.ADD);     // 'הוסף'
```

**רשימת טקסטים:**
- `EDIT`: 'ערוך'
- `DELETE`: 'מחק'
- `CANCEL`: 'ביטול'
- `LINK`: 'קישור'
- `ADD`: 'הוסף'
- `SAVE`: 'שמור'
- `CLOSE`: 'סגור'
- `REFRESH`: 'רענן'
- `EXPORT`: 'ייצא'
- `IMPORT`: 'ייבא'
- `SEARCH`: 'חיפוש'
- `FILTER`: 'פילטר'
- `VIEW`: 'צפה'
- `DUPLICATE`: 'שכפל'
- `ARCHIVE`: 'ארכב'
- `RESTORE`: 'שחזר'
- `REACTIVATE`: 'הפעל מחדש'
- `APPROVE`: 'אשר'
- `REJECT`: 'דחה'
- `PAUSE`: 'השהה'
- `PLAY`: 'הפעל'
- `STOP`: 'עצור'
- `READ`: 'קראתי'
- `CHECK`: 'סמן'
- `TOGGLE`: 'הצג/הסתר'
- `SORT`: 'מיון'

---

## אירועים

### `DOMContentLoaded`

אירוע שמופעל כשהדף נטען.

**תיאור:** המערכת מאתחלת את עצמה אוטומטית.

**דוגמה:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    console.log('מערכת הכפתורים מוכנה');
});
```

### `buttonSystem:initialized`

אירוע מותאם שמופעל כשהמערכת מאותחלת.

**תיאור:** ניתן להאזין לאירוע זה כדי לדעת שהמערכת מוכנה.

**דוגמה:**
```javascript
document.addEventListener('buttonSystem:initialized', (event) => {
    console.log('מערכת הכפתורים מאותחלת:', event.detail);
});
```

### `buttonSystem:buttonProcessed`

אירוע שמופעל כשכפתור מעובד.

**תיאור:** ניתן להאזין לאירוע זה כדי לעקוב אחר עיבוד כפתורים.

**דוגמה:**
```javascript
document.addEventListener('buttonSystem:buttonProcessed', (event) => {
    console.log('כפתור מעובד:', event.detail);
});
```

---

## דוגמאות שימוש

### דוגמה 1: יצירת כפתור פשוט

```html
<!-- HTML -->
<button data-button-type="SAVE" data-onclick="saveData()"></button>
```

```javascript
// JavaScript
function saveData() {
    console.log('נתונים נשמרו');
}
```

### דוגמה 2: כפתור עם התאמות

```html
<!-- HTML -->
<button data-button-type="EDIT" 
        data-onclick="editRecord(123)" 
        data-classes="btn-sm" 
        data-attributes="id='editBtn123' data-record-id='123'">
</button>
```

```javascript
// JavaScript
function editRecord(id) {
    console.log('עריכת רשומה:', id);
}
```

### דוגמה 3: הוספת כפתור דינמי

```javascript
// JavaScript
function addNewButton() {
    const container = document.getElementById('buttonContainer');
    
    window.addDynamicButton(
        container,
        'ADD',
        'addNewItem()',
        'btn-success btn-sm',
        'id="newItemBtn"',
        'הוסף פריט חדש'
    );
}

function addNewItem() {
    console.log('פריט חדש נוסף');
}
```

### דוגמה 4: עדכון כפתור קיים

```javascript
// JavaScript
function updateButtonToDelete() {
    window.updateButton(
        'existingButton',
        'DELETE',
        'deleteRecord(123)',
        'btn-danger btn-sm',
        'data-confirm="true"',
        'מחק רשומה'
    );
}

function deleteRecord(id) {
    if (confirm('האם אתה בטוח?')) {
        console.log('רשומה נמחקה:', id);
    }
}
```

### דוגמה 5: קבלת סטטיסטיקות

```javascript
// JavaScript
function showButtonStats() {
    const stats = window.getButtonSystemStats();
    
    console.log('סטטיסטיקות מערכת הכפתורים:');
    console.log('- כפתורים מעובדים:', stats.performance.processedButtons);
    console.log('- שגיאות:', stats.performance.errors);
    console.log('- כפתורים פעילים:', stats.buttons);
    console.log('- Cache hits:', stats.cache.hits);
    console.log('- Cache misses:', stats.cache.misses);
}
```

### דוגמה 6: הגדרת לוגים מותאמים

```javascript
// JavaScript
function setupCustomLogging() {
    // שינוי רמת לוגים
    window.advancedButtonSystem.config.logging.level = 'debug';
    
    // הוספת לוג מותאם
    window.advancedButtonSystem.logger.info('הגדרות לוגים עודכנו');
}
```

### דוגמה 7: ניקוי cache

```javascript
// JavaScript
function clearButtonCache() {
    window.advancedButtonSystem.cache.clear();
    console.log('Cache נוקה');
}
```

### דוגמה 8: אתחול ידני

```javascript
// JavaScript
function reinitializeButtons() {
    window.initializeButtons();
    console.log('כפתורים אותחלו מחדש');
}
```

---

## סיכום

ה-API של מערכת הכפתורים המרכזית מספק כלים מקיפים ליצירה, ניהול ואתחול של כפתורים באתר. עם פונקציות גלובליות פשוטות ומחלקות מתקדמות, המערכת מאפשרת גמישות מלאה בהתאמת הכפתורים לצרכים הספציפיים של כל אפליקציה.

### נקודות מפתח:

✅ **API פשוט ואינטואיטיבי**  
✅ **תמיכה מלאה ב-data attributes**  
✅ **מערכת לוגים מתקדמת**  
✅ **Cache לביצועים מיטביים**  
✅ **סטטיסטיקות מפורטות**  
✅ **תאימות לאחור מלאה**  

---

**© 2025 TikTrack Development Team. כל הזכויות שמורות.**
