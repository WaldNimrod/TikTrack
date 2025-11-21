# מדריך למפתח: מערכת טולטיפים לכפתורים

## סקירה כללית

מערכת הטולטיפים לכפתורים מספקת פתרון אחיד, יציב ופשוט לניהול טולטיפים בכל המערכת. המערכת תומכת בכפתורים קבועים (static) ודינמיים, עם מנגנון ברירת מחדל אוטומטי.

## עקרונות עיצוב

### 1. יציבות קשיחה לכפתורים קבועים
- כפתורים עם `data-tooltip` ב-HTML נחשבים קבועים
- מסומנים אוטומטית עם `data-tooltip-static="true"`
- **לא יכולים להשתנות** - נשארים כמו שהוגדרו ב-HTML
- זה מבטיח יציבות קשיחה לכפתורים קבועים בממשק

### 2. גמישות לכפתורים דינמיים
- כפתורים ללא `data-tooltip-static` יכולים לעדכן טולטיפ בזמן ריצה
- משמשים לכפתורי toggle שמשנים תוכן לפי מצב (פתוח/סגור)
- עדכון דרך `window.advancedButtonSystem.updateTooltip()`

### 3. מנגנון ברירת מחדל
- כפתורים עם `data-button-type` ללא `data-tooltip` מקבלים ברירת מחדל אוטומטית
- חיפוש ב-`BUTTON_TOOLTIPS_CONFIG` לפי `page`, `buttonType`, `entityType`
- נסיגה ל-`BUTTON_TEXTS[buttonType]` אם לא נמצא

## שימוש בסיסי

### כפתור קבוע (מומלץ)

```html
<button 
    data-button-type="ADD" 
    data-entity-type="note"
    data-id="add-note-button"
    data-tooltip="הוסף הערה חדשה"
    data-tooltip-placement="top"
    data-tooltip-trigger="hover">
    הוסף הערה
</button>
```

**תוצאה:**
- טולטיפ: "הוסף הערה חדשה"
- מסומן כ-`data-tooltip-static="true"`
- לא יכול להשתנות

### כפתור דינמי

```html
<!-- כפתור ללא data-tooltip - יקבל ברירת מחדל -->
<button 
    data-button-type="VIEW" 
    data-entity-type="note"
    data-id="view-note-button">
    צפה
</button>
```

**תוצאה:**
- יקבל טולטיפ ברירת מחדל: "צפה" (מ-BUTTON_TEXTS או BUTTON_TOOLTIPS_CONFIG)
- מסומן כ-`data-tooltip-fallback="true"`
- יכול להשתנות דרך `updateTooltip()`

### עדכון טולטיפ דינמי

```javascript
// עדכון טולטיפ לכפתור דינמי
const toggleButton = document.getElementById('toggle-top-section');
window.advancedButtonSystem.updateTooltip(toggleButton, 'הצג סיכום מלא', {
    placement: 'top',
    trigger: 'hover'
});

// או עם selector
window.updateTooltip('#myButton', 'טקסט חדש');
```

**הגבלות:**
- כפתורים עם `data-tooltip-static="true"` **לא יכולים** לעדכן טולטיפ
- הפונקציה מחזירה `true` אם הצליחה, `false` אם לא

## יצירת ID ייחודיים

### למה זה חשוב?

כפילות ID עלולה לגרום לבעיות:
- כפתור אחד מחליף את הטולטיפ של כפתור אחר
- טולטיפים לא נכונים מוצגים
- בעיות ב-DOM

### פתרון מומלץ

**תמיד הוסף `data-id` מפורש לכפתורים קבועים:**

```html
<!-- ✅ נכון -->
<button 
    data-button-type="TOGGLE" 
    data-id="toggle-top-section"
    data-tooltip="הצג או הסתר את אזור הסיכום">
    הצג/הסתר
</button>

<!-- ⚠️ לא מומלץ -->
<button 
    data-button-type="TOGGLE" 
    data-tooltip="הצג או הסתר את אזור הסיכום">
    הצג/הסתר
</button>
```

### כיצד המערכת יוצרת ID

1. **אם יש `data-id`** - משתמש בו
2. **אם אין `data-id`** - יוצר `btn-{buttonType}-{index}-{timestamp}`
3. **אם יש כפילות** - מוסיף timestamp נוסף ליצירת ID ייחודי

### דוגמאות ל-ID מומלצים

```html
<!-- כפתורי Toggle -->
<button data-id="toggle-top-section" ...>
<button data-id="toggle-main-section" ...>

<!-- כפתורי Add -->
<button data-id="add-note-button" ...>
<button data-id="add-trade-button" ...>

<!-- כפתורי Filter -->
<button data-id="filter-all-notes" ...>
<button data-id="filter-by-account" ...>

<!-- כפתורי Sort -->
<button data-id="sort-by-date" ...>
<button data-id="sort-by-name" ...>
```

## תהליך אתחול

### סדר הטעינה

1. **טעינת HTML** - כפתורים עם `data-button-type` מוגדרים ב-HTML
2. **אתחול מערכת כפתורים** - `window.advancedButtonSystem.initializeButtons()`
3. **עיבוד כפתורים** - `processButtonElement()` מעבד כל כפתור:
   - קורא `data-tooltip` מה-HTML
   - מסמן כ-`data-tooltip-static="true"` אם יש `data-tooltip`
   - יוצר ID ייחודי
   - מאתחל Bootstrap Tooltip
4. **אתחול טולטיפים מותאמים** - `initializeTooltips()` לכפתורים ללא `data-button-type`

### כפתורים דינמיים (בטבלאות)

כפתורים שנוצרים דינמית בטבלאות (למשל דרך `createActionsMenu`):

```javascript
// notes.js - יצירת כפתורי פעולות
const result = window.createActionsMenu([
    { 
        type: 'VIEW', 
        onclick: `window.showEntityDetails('note', ${note.id})`, 
        title: 'צפה בפרטי הערה' 
    },
    // ...
]);
```

**תהליך:**
1. `createActionsMenu` יוצר HTML עם `data-button-type` ו-`data-tooltip`
2. HTML מוכנס ל-DOM
3. `processButtons(tbody)` מעבד את הכפתורים
4. כל כפתור מקבל ID ייחודי אוטומטית

## ניפוי באגים

### הפעלת מצב Debug

```html
<!-- ב-<head> של הדף -->
<script>
    window.ButtonTooltipDebugMode = true;
</script>
```

**מה זה נותן:**
- לוגים מפורטים על כל תהליך יצירת טולטיפ
- מידע על ID, טולטיפים, וסטטוס static
- אזהרות על כפילות ID או טולטיפים לא נכונים

### בעיות נפוצות

#### 1. טולטיפ לא נכון מוצג

**סימפטומים:**
- כפתור מציג טולטיפ של כפתור אחר
- טולטיפ משתנה אחרי טעינת טבלה

**פתרון:**
- בדוק כפילות ID - הוסף `data-id` מפורש
- בדוק שהכפתור מסומן כ-`data-tooltip-static="true"`
- בדוק שהטולטיפ נכון ב-HTML המקורי

#### 2. טולטיפ לא מוצג

**סימפטומים:**
- כפתור ללא טולטיפ

**פתרון:**
- בדוק שיש `data-tooltip` או `data-button-type`
- בדוק שהכפתור עבר `processButtonElement()`
- בדוק שיש ברירת מחדל ב-`BUTTON_TOOLTIPS_CONFIG` או `BUTTON_TEXTS`

#### 3. טולטיפ לא מתעדכן (דינמי)

**סימפטומים:**
- `updateTooltip()` מחזיר `false`
- טולטיפ נשאר כמו שהיה

**פתרון:**
- בדוק שהכפתור **לא** מסומן כ-`data-tooltip-static="true"`
- בדוק שהכפתור קיים ב-DOM
- בדוק שהטקסט החדש לא ריק

## דוגמאות מעשיות

### דוגמה 1: כפתור Toggle עם טולטיפ דינמי

```html
<!-- HTML -->
<button 
    data-button-type="TOGGLE" 
    data-id="toggle-summary"
    data-onclick="toggleSummary()">
    ▼
</button>
```

```javascript
// JavaScript - עדכון טולטיפ לפי מצב
function toggleSummary() {
    const button = document.getElementById('toggle-summary');
    const isCollapsed = document.getElementById('summary').style.display === 'none';
    
    const newTooltip = isCollapsed ? 'הצג סיכום' : 'הסתר סיכום';
    window.advancedButtonSystem.updateTooltip(button, newTooltip);
    
    // ... שאר הלוגיקה
}
```

**הערה:** כפתור זה **לא** צריך `data-tooltip` ב-HTML כי הוא דינמי.

### דוגמה 2: כפתור קבוע עם טולטיפ סטטי

```html
<!-- HTML -->
<button 
    data-button-type="ADD" 
    data-entity-type="note"
    data-id="add-note-main"
    data-tooltip="הוסף הערה חדשה"
    data-tooltip-placement="top">
    הוסף הערה
</button>
```

**תוצאה:**
- טולטיפ: "הוסף הערה חדשה" (תמיד)
- מסומן כ-`data-tooltip-static="true"`
- לא יכול להשתנות

### דוגמה 3: כפתור עם ברירת מחדל

```html
<!-- HTML - ללא data-tooltip -->
<button 
    data-button-type="VIEW" 
    data-entity-type="note"
    data-id="view-note-button">
    צפה
</button>
```

**תוצאה:**
- יקבל טולטיפ ברירת מחדל: "צפה" (מ-BUTTON_TEXTS)
- מסומן כ-`data-tooltip-fallback="true"`
- יכול להשתנות דרך `updateTooltip()`

## כללי זהב

1. **תמיד הוסף `data-id` מפורש** לכפתורים קבועים ב-HTML
2. **השתמש ב-`data-tooltip`** לכפתורים קבועים
3. **אל תשתמש ב-`data-tooltip`** לכפתורים דינמיים (הם יקבלו ברירת מחדל)
4. **בדוק כפילות ID** לפני הוספת כפתור חדש
5. **השתמש ב-`updateTooltip()`** רק לכפתורים דינמיים
6. **הפעל `ButtonTooltipDebugMode`** בעת פיתוח

## קבצים רלוונטיים

- `trading-ui/scripts/button-system-init.js` - לוגיקה מרכזית
- `trading-ui/scripts/button-tooltips-config.js` - ברירות מחדל
- `trading-ui/scripts/modules/actions-menu-system.js` - יצירת כפתורי פעולות
- `documentation/frontend/button-system.md` - תיעוד מלא

## תמיכה

לשאלות או בעיות, בדוק:
1. לוגים בקונסולה (עם `ButtonTooltipDebugMode`)
2. התיעוד המלא ב-`button-system.md`
3. דוגמאות בקוד הקיים

