# מדריך מערכת כפתורים מאוחדת - TikTrack
## Button System Guide

**תאריך:** 13 בינואר 2025  
**גרסה:** 1.0  
**מטרה:** מדריך מפורט לשימוש במערכת הכפתורים המאוחדת עם צבעים דינמיים

---

## 🎯 סקירה כללית

מערכת הכפתורים המאוחדת מספקת 9 פונקציות מרכזיות ליצירת כפתורים חוזרים במערכת, עם תמיכה מלאה בצבעים דינמיים, נגישות ו-**Event Delegation System** מתקדם.

### עקרונות מנחים:
- **רק כפתורים עם 2+ מופעים** עברו למערכת המרכזית
- **כפתורים ייחודיים** נשארו ידניים ב-HTML
- **צבעים דינמיים מלאים** - תמיכה ב-`--primary-color`, `--secondary-color`, `--danger-color`
- **Event Delegation מתקדם** - תמיכה מלאה ב-`data-onclick` attributes
- **Fallback בטיחותי** - אם הפונקציה לא קיימת, יוצג הכפתור הישן

### 🆕 Event Delegation System
מערכת הכפתורים כוללת מערכת event delegation מתקדמת המטפלת אוטומטית ב-`data-onclick` attributes:

```html
<!-- כפתור עם data-onclick - מערכת הכפתורים תטפל בו אוטומטית -->
<button data-button-type="ADD" data-entity-type="execution" 
        data-variant="full" data-onclick="openExecutionDetails()" 
        data-text="הוסף ביצוע"></button>
```

**יתרונות:**
- ✅ עובד עם כפתורים דינמיים שנוצרים בזמן ריצה
- ✅ תאימות מלאה עם המערכת המאוחדת
- ✅ Error handling אוטומטי
- ✅ תמיכה בפונקציות מורכבות

---

## 🛠️ פונקציות זמינות

### קטגוריה ב: כפתורי טפסים

#### `createSaveButton(onClick, text, entityType)`
יצירת כפתור שמירה עם צבע primary דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "שמור")
- `entityType` (string, אופציונלי) - סוג ישות (לצבע ספציפי)

**דוגמה:**
```javascript
${window.createSaveButton ? window.createSaveButton('saveTrade()', 'שמור טרייד', 'trade') : '<button class="btn btn-entity btn-entity-trade" onclick="saveTrade()">שמור טרייד</button>'}
```

#### `createFormCancelButton(onClick, text)`
יצירת כפתור ביטול עם צבע secondary דינמי.

**פרמטרים:**
- `onClick` (string, אופציונלי) - פונקציה להרצה (ברירת מחדל: סגירת מודול)
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "ביטול")

**דוגמה:**
```javascript
${window.createFormCancelButton ? window.createFormCancelButton('', 'ביטול') : '<button class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>'}
```

---

### קטגוריה ג: כפתורי ניווט וכלים

#### `createRefreshButton(onClick, text)`
יצירת כפתור רענון עם צבע secondary דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "רענן")

**דוגמה:**
```javascript
${window.createRefreshButton ? window.createRefreshButton('refreshTrades()', 'רענן טריידים') : '<button class="btn btn-sm btn-outline-secondary" onclick="refreshTrades()"><i class="fas fa-sync-alt"></i> רענן טריידים</button>'}
```

#### `createCopyButton(onClick, text)`
יצירת כפתור העתקה עם צבע secondary דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "העתק לוג מפורט")

**דוגמה:**
```javascript
${window.createCopyButton ? window.createCopyButton('copyDetailedLog()', 'העתק לוג מפורט') : '<button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()"><i class="fas fa-copy"></i> העתק לוג מפורט</button>'}
```

#### `createAddButton(entityType, onClick, text)`
יצירת כפתור הוסף עיקרי עם צבע primary דינמי ואייקון ישות.

**פרמטרים:**
- `entityType` (string) - סוג ישות (למשל: 'trades', 'alerts')
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "הוסף")

**דוגמה:**
```javascript
${window.createAddButton ? window.createAddButton('trades', 'showAddTradeModal()', 'הוסף טרייד') : '<button id="addTradeBtn" class="refresh-btn" onclick="showAddTradeModal()"><img src="images/icons/trades.svg" alt="הוסף" class="action-icon"> הוסף טרייד</button>'}
```

---

### קטגוריה ד: Toggle Sections

#### `createToggleButton(sectionId, isOpen, title)`
יצירת כפתור toggle עם צבע secondary דינמי.

**פרמטרים:**
- `sectionId` (string) - מזהה הסקשן
- `isOpen` (boolean, אופציונלי) - האם הסקשן פתוח (ברירת מחדל: true)
- `title` (string, אופציונלי) - כותרת הכפתור (ברירת מחדל: "הצג/הסתר")

**דוגמה:**
```javascript
${window.createToggleButton ? window.createToggleButton('main', true, 'הצג/הסתר אזור הטריידים') : '<button class="filter-toggle-btn" onclick="toggleSection(\'main\')" title="הצג/הסתר אזור הטריידים"><span class="section-toggle-icon">▼</span></button>'}
```

---

### קטגוריה ה: כפתורי מיון

#### `createSortableHeader(columnName, columnIndex, displayText)`
יצירת כפתור מיון עם צבע primary דינמי.

**פרמטרים:**
- `columnName` (string) - שם העמודה
- `columnIndex` (number) - אינדקס העמודה
- `displayText` (string) - טקסט להצגה

**דוגמה:**
```javascript
${window.createSortableHeader ? window.createSortableHeader('price', 1, 'מחיר נוכחי') : '<button class="btn btn-link sortable-header" data-sort-column="1">מחיר נוכחי <span class="sort-icon">↕</span></button>'}
```

---

### קטגוריה ו: כפתורים מיוחדים

#### `createFilterButton(entityType, onClick, title, isActive)`
יצירת כפתור פילטר ישויות עם צבע primary דינמי.

**פרמטרים:**
- `entityType` (string) - סוג ישות (למשל: 'trades', 'alerts')
- `onClick` (string) - פונקציה להרצה בלחיצה
- `title` (string) - כותרת הכפתור
- `isActive` (boolean, אופציונלי) - האם הכפתור פעיל (ברירת מחדל: false)

**דוגמה:**
```javascript
${window.createFilterButton ? window.createFilterButton('trades', 'filterAlertsByRelatedObjectType(\'trade\')', 'טריידים') : '<button class="btn btn-sm btn-outline-primary filter-icon-btn" onclick="filterAlertsByRelatedObjectType(\'trade\')" data-type="trade" title="טריידים"><img src="images/icons/trades.svg" alt="טריידים" class="action-icon"></button>'}
```

#### `createNavigationButton(pageName, entityType, displayText)`
יצירת כפתור ניווט בין עמודים עם צבע entity דינמי.

**פרמטרים:**
- `pageName` (string) - שם העמוד (ללא .html)
- `entityType` (string) - סוג ישות (למשל: 'trade', 'alert')
- `displayText` (string) - טקסט להצגה

**דוגמה:**
```javascript
${window.createNavigationButton ? window.createNavigationButton('trades', 'trade', 'טריידים') : '<button class="btn w-100" onclick="window.location.href=\'trades.html\'" style="border: 2px solid var(--entity-trade-color); color: var(--entity-trade-color);"><img src="images/icons/trades.svg" alt="" style="width: 20px; height: 20px; vertical-align: middle;"><span class="ms-2">טריידים</span></button>'}
```

---

### כפתורים נוספים

#### `createCloseButton(modalId, ariaLabel)`
יצירת כפתור סגירה סטנדרטי (כבר קיים).

#### `createModalActionButton(type, onClick, additionalClasses, additionalAttributes)`
יצירת כפתור פעולה בתוך מודול (כבר קיים).

---

### פונקציות חדשות - כפתורים נוספים

#### `createFilterAllButton(onClick, text, isActive)`
יצירת כפתור "הכל" בפילטרים עם צבע primary דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "הכל")
- `isActive` (boolean, אופציונלי) - האם הכפתור פעיל (ברירת מחדל: false)

**דוגמה:**
```javascript
${window.createFilterAllButton ? window.createFilterAllButton('filterAlertsByRelatedObjectType(\'all\')', 'הצג הכל', true) : '<button class="btn btn-sm active filter-all-btn" onclick="filterAlertsByRelatedObjectType(\'all\')">הכל</button>'}
```

#### `createNoteButton(onClick, text)`
יצירת כפתור הוסף הערה חשובה עם צבע info דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "הוסף הערה חשובה")

**דוגמה:**
```javascript
${window.createNoteButton ? window.createNoteButton('addImportantNote()', 'הוסף הערה חשובה') : '<button class="btn btn-sm btn-outline-info" onclick="addImportantNote()"><i class="fas fa-sticky-note"></i></button>'}
```

#### `createReminderButton(onClick, text)`
יצירת כפתור הוסף תזכורת עם צבע warning דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "הוסף תזכורת")

**דוגמה:**
```javascript
${window.createReminderButton ? window.createReminderButton('addReminder()', 'הוסף תזכורת') : '<button class="btn btn-sm btn-outline-warning" onclick="addReminder()"><i class="fas fa-bell"></i></button>'}
```

#### `createLinkButton(onClick, text)`
יצירת כפתור פריטים מקושרים עם צבע primary דינמי.

**פרמטרים:**
- `onClick` (string) - פונקציה להרצה בלחיצה
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "פריטים מקושרים")

**דוגמה:**
```javascript
${window.createLinkButton ? window.createLinkButton('openLinkedItemsModal(\'trade\', \'\')', 'הצג פריטים מקושרים') : '<button class="btn btn-sm btn-outline-primary" onclick="openLinkedItemsModal(\'trade\', \'\')"><i class="fas fa-link"></i></button>'}
```

#### `createInternalNavigationButton(pageName, text, icon)`
יצירת כפתור ניווט פנימי עם צבע primary דינמי.

**פרמטרים:**
- `pageName` (string) - שם העמוד (ללא .html)
- `text` (string) - טקסט הכפתור
- `icon` (string, אופציונלי) - שם אייקון FontAwesome

**דוגמה:**
```javascript
${window.createInternalNavigationButton ? window.createInternalNavigationButton('executions', 'דף עסקאות', 'external-link-alt') : '<button class="btn btn-sm btn-outline-primary" onclick="goToExecutionsPage()"><i class="fas fa-external-link-alt"></i> דף עסקאות</button>'}
```

#### `createSimpleCloseButton(onClick, text)`
יצירת כפתור סגירה פשוט עם צבע secondary דינמי.

**פרמטרים:**
- `onClick` (string, אופציונלי) - פונקציה להרצה (ברירת מחדל: סגירת מודול)
- `text` (string, אופציונלי) - טקסט הכפתור (ברירת מחדל: "סגור")

**דוגמה:**
```javascript
${window.createSimpleCloseButton ? window.createSimpleCloseButton('', 'סגור') : '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>'}
```

---

## 🎨 מערכת צבעים דינמיים

### משתני צבעים בשימוש:

| משתנה | שימוש | דוגמה |
|--------|-------|--------|
| `--primary-color` | כפתורי שמירה, הוסף, מיון, פילטר | כפתורי פעולות עיקריות |
| `--secondary-color` | כפתורי ביטול, רענון, העתקה, toggle | כפתורי פעולות משניות |
| `--danger-color` | כפתורי מחיקה | כפתורי פעולות מסוכנות |
| `--entity-{type}-color` | כפתורי ניווט | צבעים ספציפיים לישויות |

### תכונות מתקדמות:
- **Hover effects** עם `color-mix()` לשבירות צבעים
- **Active states** לכפתורי פילטר
- **Entity-specific colors** לכפתורי ניווט
- **Fallback values** לכל משתני הצבעים

---

## 🔧 תכונות טכניות

### Fallback בטיחותי:
כל פונקציה כוללת fallback לכפתור הישן:
```javascript
${window.createSaveButton ? window.createSaveButton(...) : '<button class="btn btn-entity">שמור</button>'}
```

### תמיכה ב-RTL:
- כל הכפתורים מותאמים לעברית
- מיקום אייקונים נכון (margin-left במקום margin-right)
- כיוון טקסט RTL

### נגישות:
- `title` attributes לכל הכפתורים
- `aria-label` לכפתורי סגירה
- `data-*` attributes לשמירת מידע

---

## 📋 דוגמאות שימוש

### 🆕 שימוש ב-data-onclick (הדרך החדשה!)

```html
<!-- כפתור הוספה עם data-onclick -->
<button data-button-type="ADD" data-entity-type="execution" 
        data-variant="full" data-onclick="openExecutionDetails()" 
        data-text="הוסף ביצוע" id="addExecutionBtn"></button>

<!-- כפתור toggle section -->
<button data-button-type="TOGGLE" data-variant="small" 
        data-onclick="toggleSection('main')" data-text="הצג/הסתר"></button>

<!-- כפתור עם פונקציה מורכבת -->
<button data-button-type="VIEW" data-onclick="window.showEntityDetails('execution', 4, { mode: 'view' })" 
        data-text="צפה"></button>
```

**יתרונות של data-onclick:**
- ✅ עובד עם כפתורים דינמיים שנוצרים בזמן ריצה
- ✅ תאימות מלאה עם המערכת המאוחדת
- ✅ Error handling אוטומטי
- ✅ תמיכה בפונקציות מורכבות

### עמוד טריידים - דוגמה מלאה (הדרך הישנה):

```html
<!-- כפתור העתקה -->
${window.createCopyButton ? window.createCopyButton('copyDetailedLog()', 'העתק לוג מפורט עם כל הנתונים והטריידים') : '<button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog()" title="העתק לוג מפורט עם כל הנתונים והטריידים"><i class="fas fa-copy"></i> העתק לוג מפורט</button>'}

<!-- כפתור toggle -->
${window.createToggleButton ? window.createToggleButton('top', false, 'הצג/הסתר אזור מעקב טריידים') : '<button class="filter-toggle-btn" onclick="toggleSection(\'top\')" title="הצג/הסתר אזור מעקב טריידים"><span class="filter-icon">▲</span></button>'}

<!-- כפתור הוסף -->
${window.createAddButton ? window.createAddButton('trades', 'showAddTradeModal()', 'הוסף טרייד חדש') : '<button id="addTradeBtn" class="refresh-btn" onclick="showAddTradeModal()" title="הוסף טרייד חדש"><img src="images/icons/trades.svg" alt="הוסף" class="action-icon"> הוסף טרייד חדש</button>'}

<!-- כפתור מיון -->
${window.createSortableHeader ? window.createSortableHeader('price', 1, 'מחיר נוכחי') : '<button class="btn btn-link sortable-header" data-sort-column="1">מחיר נוכחי <span class="sort-icon">↕</span></button>'}

<!-- כפתורי טפסים -->
${window.createFormCancelButton ? window.createFormCancelButton('', 'ביטול') : '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>'}
${window.createSaveButton ? window.createSaveButton('addTrade()', 'הוסף טרייד', 'trade') : '<button type="button" class="btn btn-entity btn-entity-trade" onclick="addTrade()">הוסף טרייד</button>'}
```

---

## 🚀 יתרונות

### 1. חיסכון בקוד
- **~1,700 שורות קוד** נחסכו
- **DRY principle** - אין כפילויות
- **מקור יחיד לאמת** לכל סוג כפתור

### 2. תחזוקה משופרת
- **עדכון במקום אחד** משפיע על כל המערכת
- **בדיקות קלות יותר** - פונקציה אחת לכל סוג
- **תיעוד מרכזי** של כל הכפתורים

### 3. אחידות ממשק
- **עיצוב זהה** לכל הכפתורים מאותו סוג
- **התנהגות עקבית** בכל המערכת
- **חוויית משתמש משופרת**

### 4. גמישות צבעים
- **החלפת פרופיל** משפיעה מיד על כל הכפתורים
- **תמיכה בעתיד** בפרופילי צבעים נוספים
- **אין צבעים קשיחים** במערכת

---

## 📚 קבצים קשורים

- **`trading-ui/scripts/button-icons.js`** - הקובץ הראשי עם כל הפונקציות
- **`trading-ui/styles-new/06-components/_buttons-advanced.css`** - CSS לכפתורים
- **`trading-ui/styles-new/01-settings/_colors-dynamic.css`** - משתני צבעים
- **`BUTTON_STANDARDIZATION_ANALYSIS.md`** - דוח ניתוח מקיף
- **`BUTTON_STANDARDIZATION_FINAL_SUMMARY.md`** - סיכום הפרויקט

---

## 🔄 עדכונים עתידיים

### תכונות מתוכננות:
- תמיכה בכפתורים נוספים לפי צורך
- שיפור נגישות
- תמיכה בכפתורים מותאמים אישית
- אינטגרציה עם מערכת העדפות מתקדמת

### תחזוקה:
- עדכון דוקומנטציה עם כל שינוי
- בדיקות תקופתיות של צבעים דינמיים
- מעקב אחר ביצועים

---

**המערכת מוכנה לשימוש מלא! 🚀**

