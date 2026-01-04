# הוראות בדיקת עמוד בסיס נתונים

## שימוש מהיר

1. פתח את `db_display.html` בדפדפן
2. לחץ `F12` כדי לפתוח את Developer Tools
3. עבור לטאב **Console**
4. העתק את כל התוכן של הקובץ `scripts/test-db-display-page-loading.js`
5. הדבק בקונסולה ולחץ `Enter`

## מה הבדיקה בודקת

הבדיקה בודקת את כל החבילות והגלובלים הנדרשים לעמוד בסיס נתונים:

### ✅ חבילת BASE (חובה)

- `NotificationSystem`
- `window.Logger`
- `window.CacheSyncManager`
- `window.IconSystem`

### 🔧 חבילת SERVICES (קריטי!)

- `window.loadTableData` ⭐ הקריטי ביותר - לטעינת טבלאות
- `window.SelectPopulatorService`
- `DataUtils`

### 🎨 חבילת UI-ADVANCED (קריטי!)

- `window.setupSortableHeaders` ⭐ קריטי למיון טבלאות
- `window.UnifiedTableSystem`
- `window.TableMappings`
- `window.setupPagination`

### 📊 חבילת CRUD

- `window.formatDate`
- `DataUtils`

### ⚙️ חבילת PREFERENCES

- `window.loadUserPreferences`

### 🗄️ פונקציות ספציפיות לעמוד

- `window.loadDatabaseInfo`
- `window.initSystemCheck`

## תוצאות צפויות

### ✅ הצלחה מלאה

```
🎉 מצוין! כל הבדיקות עברו בהצלחה!
   העמוד מוכן לשימוש מלא.
✅ חבילות SERVICES ו-UI-ADVANCED נטענו בהצלחה!
   ניתן לטעון ולנהל טבלאות בעמוד.
```

### ❌ בעיות

אם יש בעיות, תראה רשימה של כל הפריטים החסרים עם סימון ❌.

## בעיות נפוצות

### ❌ window.loadTableData חסר

**סיבה:** הסקריפט `data-basic.js` לא נטען (שייך לחבילת services).

**פתרון:**

1. בדוק את `db_display.html`
2. ודא שהסקריפט `scripts/modules/data-basic.js` נטען
3. ודא שהוא נטען אחרי חבילת `services`

### ❌ window.setupSortableHeaders חסר

**סיבה:** הסקריפט `tables.js` לא נטען (שייך לחבילת ui-advanced).

**פתרון:**

1. בדוק את `db_display.html`
2. ודא שהסקריפט `scripts/tables.js` נטען
3. ודא שהוא נטען אחרי חבילת `ui-advanced`

### ❌ pageInitializationConfigs לא נמצא

**סיבה:** `page-initialization-configs.js` לא נטען.

**פתרון:**

1. בדוק את `db_display.html`
2. ודא שהסקריפט `page-initialization-configs.js` נטען לפני `core-systems.js`

### ❌ חבילות services ו-ui-advanced לא נטענו

**סיבה:** הסקריפטים של החבילות לא נוספו ל-HTML.

**פתרון:**

1. בדוק את `db_display.html`
2. ודא שכל הסקריפטים של:
   - חבילת `services` (כולל `data-basic.js`)
   - חבילת `ui-advanced` (כולל `tables.js`)

## בדיקת טבלאות

הבדיקה גם בודקת את הטבלאות בדף:

- מספר הטבלאות שנמצאו
- האם הן נמצאות בתוך `[data-section]` attributes

## הערות

- הבדיקה לא משנה את המצב של העמוד
- הבדיקה רק קוראת ומציגה מידע
- ניתן להריץ את הבדיקה מספר פעמים
- הבדיקה לא בודקת אם הנתונים בטבלאות נטענו (רק אם המערכת זמינה)

