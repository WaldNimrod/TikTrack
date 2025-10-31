# Event Handler System - TikTrack
## מערכת ניהול אירועים מרכזית

### 📋 סקירה כללית

מערכת ניהול האירועים המרכזית של TikTrack מספקת פתרון אחיד ויעיל לניהול כל מטפלי האירועים במערכת, מונעת כפילויות ומשפרת ביצועים.

**מיקום:** `trading-ui/scripts/event-handler-manager.js`

**גרסה:** 1.0  
**עודכן לאחרונה:** 2025-01-26

---

## 🎯 מטרות העיצוב

1. **מניעת כפילויות** - מטפל אחד מרכזי לכל סוג אירוע
2. **ביצועים טובים** - שימוש ב-event delegation במקום listeners מרובים
3. **תאימות** - עובד עם Bootstrap, מערכת הכפתורים, וכל המערכות האחרות
4. **תחזוקה קלה** - כל הלוגיקה במקום אחד

---

## 🏗️ ארכיטקטורה

### EventHandlerManager Class

המערכת מבוססת על class מרכזי המנהל את כל האירועים:

```javascript
class EventHandlerManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
        this.initialized = false;
    }
    
    init() {
        // אתחול המערכת
        this.setupGlobalDelegation();
        this.initialized = true;
    }
}
```

### Event Delegation

המערכת משתמשת ב-**Event Delegation** - listener אחד על `document` במקום listeners רבים על כל אלמנט:

```javascript
setupGlobalDelegation() {
    // Click events delegation
    document.addEventListener('click', (event) => {
        this.handleDelegatedClick(event);
    });
    
    // Change events delegation
    document.addEventListener('change', (event) => {
        this.handleDelegatedChange(event);
    });
    
    // Input events delegation
    document.addEventListener('input', (event) => {
        this.handleDelegatedInput(event);
    });
    
    // Blur events delegation
    document.addEventListener('blur', (event) => {
        this.handleDelegatedBlur(event);
    });
}
```

---

## 🔘 טיפול בכפתורים - data-onclick

### סקירה כללית

המערכת מטפלת באופן מיוחד בכפתורים עם `data-onclick` attribute - זה התקן המומלץ לכל הכפתורים במערכת TikTrack.

### איך זה עובד

1. **יצירת כפתור** - מערכת הכפתורים (`button-system-init.js`) יוצרת כפתורים עם `data-onclick` במקום `onclick`
2. **זיהוי לחיצה** - `EventHandlerManager` מזהה לחיצה על כפתור עם `data-onclick`
3. **ביצוע פונקציה** - הפונקציה המוגדרת ב-`data-onclick` מבוצעת דרך `eval()`

### קוד המימוש

```javascript
handleDelegatedClick(event) {
    const target = event.target;
    
    // Handle buttons with data-onclick attribute (centralized button system)
    // זה התקן המומלץ - כל הכפתורים החדשים משתמשים בזה
    const buttonWithOnclick = target.closest('button[data-onclick]');
    if (buttonWithOnclick) {
        // בדיקה אם הכפתור disabled
        if (buttonWithOnclick.disabled || buttonWithOnclick.hasAttribute('disabled')) {
            return;
        }
        
        const onclickValue = buttonWithOnclick.getAttribute('data-onclick');
        if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
            try {
                // אין preventDefault/stopPropagation כדי לאפשר Bootstrap modals לעבוד
                eval(onclickValue);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('EventHandlerManager: Error executing data-onclick', {
                        onclickValue: onclickValue,
                        error: error.message,
                        stack: error.stack
                    });
                }
            }
            // לא return - מאפשר handlers אחרים לעבוד (Bootstrap וכו')
        }
    }
    
    // Handle buttons with onclick attribute (legacy support - backwards compatibility)
    // תמיכה בכפתורים ישנים עם onclick רגיל - רק אם אין data-onclick
    const buttonWithOnclickLegacy = target.closest('button[onclick]:not([data-onclick])');
    if (buttonWithOnclickLegacy && buttonWithOnclickLegacy !== buttonWithOnclick) {
        // בדיקה אם הכפתור disabled
        if (buttonWithOnclickLegacy.disabled || buttonWithOnclickLegacy.hasAttribute('disabled')) {
            return;
        }
        
        const onclickValue = buttonWithOnclickLegacy.getAttribute('onclick');
        if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
            try {
                // אין preventDefault/stopPropagation כדי לאפשר Bootstrap modals לעבוד
                eval(onclickValue);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('EventHandlerManager: Error executing onclick', {
                        onclickValue: onclickValue,
                        error: error.message,
                        stack: error.stack
                    });
                }
            }
            // לא return - מאפשר handlers אחרים לעבוד
        }
    }
    
    // ממשיך לטפל באירועים אחרים...
}
```

### הערות חשובות

#### ✅ מה המערכת עושה:
- **מזהה כפתורים** עם `data-onclick` attribute (תקן מומלץ)
- **תומך גם ב-`onclick` רגיל** (legacy support - תאימות לאחור)
- **בודקת disabled** - לא מבצעת אם הכפתור disabled
- **מבצעת את הפונקציה** דרך `eval()`
- **לוגים שגיאות** אבל לא מתרסקת

#### ❌ מה המערכת לא עושה:
- **אין `preventDefault()`** - כדי לאפשר Bootstrap modals לעבוד
- **אין `stopPropagation()`** - כדי לאפשר handlers אחרים לעבוד
- **אין return מוקדם** - מאפשר מטפלי אירועים אחרים לפעול

### תמיכה ב-onclick רגיל (Legacy Support)

המערכת תומכת גם בכפתורים עם `onclick` רגיל לתאימות לאחור:

```html
<!-- כפתור עם onclick רגיל - עדיין יעבוד! -->
<button onclick="doSomething()">לחץ כאן</button>

<!-- אבל מומלץ להשתמש ב-data-onclick -->
<button data-button-type="PRIMARY" data-onclick="doSomething()" data-text="לחץ כאן"></button>
```

**הערות חשובות:**
- ✅ **תמיכה כפולה** - גם `data-onclick` וגם `onclick` רגיל עובדים
- ⚠️ **מומלץ: `data-onclick`** - זה התקן החדש והמומלץ
- ✅ **תאימות לאחור** - כפתורים ישנים עם `onclick` רגיל עדיין עובדים
- ✅ **אין כפילות** - אם לכפתור יש גם `data-onclick` וגם `onclick`, רק `data-onclick` יבוצע

### דוגמאות שימוש

#### כפתור פשוט
```html
<button data-button-type="ADD" data-onclick="openAddModal()" data-text="הוסף">
    הוסף
</button>
```

#### כפתור עם פרמטרים
```html
<button data-button-type="EDIT" 
        data-onclick="editRecord(123)" 
        data-text="ערוך">
    ערוך
</button>
```

#### כפתור עם פונקציה מורכבת
```html
<button data-button-type="VIEW" 
        data-onclick="window.showEntityDetails('execution', 4, { mode: 'view' })" 
        data-text="צפה">
    צפה
</button>
```

#### כפתור בתוך טבלה דינמית
```javascript
// הכפתור נוצר דינמית ועדיין יעבוד!
const buttonHtml = `
    <button data-button-type="DELETE" 
            data-onclick="deleteRow(${rowId})" 
            data-text="מחק">
        מחק
    </button>
`;
tableRow.innerHTML += buttonHtml;
// הכפתור יעבוד מיד ללא צורך ב-addEventListener!
```

#### כפתורים במודולים דינמיים

כשמחליפים שלבים במודול, הכפתורים החדשים מעובדים אוטומטית:

```javascript
function goToStep(step) {
    // ... קוד של המעבר בין שלבים ...
    
    // עיבוד אוטומטי של כפתורים בשלב החדש
    const modal = document.getElementById('myModal');
    if (modal && window.advancedButtonSystem) {
        const currentStepElement = modal.querySelector(`.step[data-step="${step}"]`);
        if (currentStepElement) {
            window.advancedButtonSystem.processButtons(currentStepElement);
        }
    }
}
```

**יתרון:** כל הכפתורים במודול, גם אלה שנוספים דינמית, יעבדו מיד דרך המערכת המרכזית!

---

## 🎨 תאימות עם מערכות אחרות

### Bootstrap Modals

המערכת **תואמת Bootstrap** כי היא לא משתמשת ב-`preventDefault()`:

```html
<!-- כפתור סגירה של Bootstrap modal - יעבוד! -->
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>

<!-- כפתור עם data-onclick בתוך modal - יעבוד! -->
<button data-button-type="SAVE" 
        data-onclick="saveData()" 
        data-bs-dismiss="modal"
        data-text="שמור">
    שמור
</button>
```

### Form Submissions

כפתורי submit בטופסים יעבדו כרגיל:

```html
<form>
    <button type="submit" data-onclick="validateForm()">שלח</button>
</form>
```

### Dynamic Content

כפתורים שנוצרים דינמית אחרי טעינת הדף יעבדו אוטומטית:

```javascript
// יצירת כפתור חדש אחרי 5 שניות
setTimeout(() => {
    const newButton = document.createElement('button');
    newButton.setAttribute('data-onclick', 'doSomething()');
    newButton.textContent = 'לחץ כאן';
    document.body.appendChild(newButton);
    // הכפתור יעבוד מיד ללא צורך ב-addEventListener!
}, 5000);
```

---

## 🔧 אירועים אחרים

### Click Events - data-action

```javascript
// אלמנט עם data-action
if (target.matches('[data-action]')) {
    const action = target.getAttribute('data-action');
    this.executeAction(action, target, event);
}
```

### Modal Triggers

```javascript
// אלמנט עם data-modal-trigger
if (target.matches('[data-modal-trigger]')) {
    const modalType = target.getAttribute('data-modal-trigger');
    this.openModal(modalType, target, event);
}
```

### Sortable Headers

```javascript
// headers עם class sortable-header
if (target.matches('.sortable-header')) {
    this.handleSortableClick(target, event);
}
```

### Change Events

```javascript
handleDelegatedChange(event) {
    const target = event.target;
    
    // Form field changes
    if (target.matches('[data-field-change]')) {
        const fieldName = target.getAttribute('data-field-change');
        this.handleFieldChange(fieldName, target, event);
    }
    
    // Filter changes
    if (target.matches('[data-filter-change]')) {
        const filterType = target.getAttribute('data-filter-change');
        this.handleFilterChange(filterType, target, event);
    }
}
```

---

## 📝 Best Practices

### ✅ מה לעשות

1. **השתמש ב-`data-onclick`** לכל הכפתורים
2. **השתמש במערכת הכפתורים** (`button-system-init.js`) ליצירת כפתורים
3. **בדוק disabled state** לפני ביצוע פעולות
4. **השתמש בלוגים** לדיבוג בעיות

### ❌ מה לא לעשות

1. **אל תשתמש ב-`onclick`** - רק `data-onclick`
2. **אל תוסיף listeners ידניים** לכפתורים עם `data-onclick`
3. **אל תסמוך על `preventDefault()`** - המערכת לא משתמשת בו
4. **אל תוודא handlers אחרים** - הם יכולים לעבוד במקביל

---

## 🐛 פתרון בעיות

### כפתור לא עובד

**סיבות אפשריות:**
1. הכפתור לא נוצר עם `data-onclick` - בדוק שהמערכת יצרה אותו נכון
2. הפונקציה לא קיימת - בדוק שהפונקציה מוגדרת ב-`window`
3. שגיאה בביצוע - בדוק את הלוגים ב-console

**פתרון:**
```javascript
// בדיקה מהירה בקונסולה
const button = document.querySelector('button[data-onclick]');
console.log('Button:', button);
console.log('data-onclick value:', button?.getAttribute('data-onclick'));
console.log('Function exists:', typeof window[button?.getAttribute('data-onclick')?.split('(')[0]] === 'function');
```

### Bootstrap Modal לא נסגר

**סיבה:** כפתור עם `data-onclick` בתוך modal עלול להפריע

**פתרון:** ודא שהכפתור לא מונע את האירוע (המערכת כבר לא עושה `preventDefault()`)

### כפתור פועל פעמיים

**סיבה:** אולי יש גם `onclick` רגיל וגם `data-onclick`

**פתרון:** הסר את ה-`onclick` הרגיל, השתמש רק ב-`data-onclick`

---

## 📚 קישורים קשורים

- **מערכת הכפתורים:** `documentation/frontend/button-system.md`
- **Button System Init:** `trading-ui/scripts/button-system-init.js`
- **Event Handler Manager:** `trading-ui/scripts/event-handler-manager.js`

---

## 🔄 היסטוריית עדכונים

### 2025-01-27 - תיקון מערכת הכפתורים השבורה
- ✅ הוספת `event-handler-manager.js` ל-`package-manifest.js` BASE package
- ✅ הוספת `event-handler-manager.js` ל-`executions.html`
- ✅ תיקון בעיית כפילות עם `onclick` רגיל - הסרת `eval()` על `onclick` רגיל
- ✅ שמירה על תמיכה ב-`onclick` רגיל דרך הרצה טבעית של הדפדפן
- ✅ הוספת לוגים לזיהוי `onclick` כפתורים (debug mode)
- ✅ עדכון loadOrder ב-package-manifest.js

### 2025-01-27 - תמיכה ב-onclick רגיל ומודולים דינמיים
- ✅ הוספת תמיכה ב-`onclick` רגיל (legacy support) - תאימות לאחור
- ✅ עיבוד אוטומטי של כפתורים במודולים אחרי מעבר שלבים
- ✅ עדכון תיעוד מלא עם דוגמאות למודולים דינמיים

### 2025-01-26 - עדכון Event Delegation
- ✅ הוספת תמיכה מלאה ב-`data-onclick`
- ✅ הסרת `preventDefault()` ו-`stopPropagation()` לתאימות Bootstrap
- ✅ הוספת בדיקת disabled buttons
- ✅ שיפור error handling עם לוגים מפורטים
- ✅ עדכון תיעוד מלא

---

## 📞 תמיכה

לשאלות או בעיות עם מערכת ניהול האירועים:
1. בדוק את הלוגים ב-console
2. בדוק את התיעוד ב-`documentation/frontend/button-system.md`
3. בדוק את הקוד ב-`trading-ui/scripts/event-handler-manager.js`

