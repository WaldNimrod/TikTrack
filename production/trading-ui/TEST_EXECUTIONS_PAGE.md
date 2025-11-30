# הוראות בדיקת עמוד ביצועים

## שימוש מהיר

1. פתח את `executions.html` בדפדפן
2. לחץ `F12` כדי לפתוח את Developer Tools
3. עבור לטאב **Console**
4. העתק את כל התוכן של הקובץ `scripts/test-executions-page-loading.js`
5. הדבק בקונסולה ולחץ `Enter`

## מה הבדיקה בודקת?

הבדיקה בודקת את כל החבילות והגלובלים הנדרשים לעמוד ביצועים:

### ✅ חבילת BASE (חובה)
- `NotificationSystem`
- `window.Logger`
- `window.CacheSyncManager`
- `window.IconSystem`

### 🎯 חבילת CONDITIONS (קריטי!)
- `window.conditionsTranslations`
- `window.conditionsValidator`
- `window.conditionsFormGenerator`
- `window.conditionsCRUDManager`
- `window.conditionsInitializer` ⭐ הקריטי ביותר
- `window.conditionsModalConfig`
- `window.ConditionsUIManager`
- `window.ConditionsModalController`

### 🔧 חבילת SERVICES
- `window.SelectPopulatorService`
- `window.RichTextEditorService`
- `window.Quill`
- `window.DOMPurify`

### 🎨 חבילת UI-ADVANCED
- `window.setupSortableHeaders`
- `DataUtils`

### 📚 חבילת MODULES
- `window.loadUserPreferences`

### 🏢 חבילת ENTITY-SERVICES
- `window.tickerService`

### 💰 Pending Execution Trade Creation
- `window.PendingExecutionTradeCreation`
- `window.executionsModalConfig`

### ✓ חבילת VALIDATION
- `window.validateSelectField`

## תוצאות צפויות

### ✅ הצלחה מלאה:
```
🎉 מצוין! כל הבדיקות עברו בהצלחה!
   העמוד מוכן לשימוש מלא.
✅ חבילת CONDITIONS נטענה בהצלחה!
   ניתן ליצור trades עם תנאים מעמוד ביצועים.
```

### ❌ בעיות:
אם יש בעיות, תראה רשימה של כל הפריטים החסרים עם סימון ❌.

## בעיות נפוצות

### ❌ חבילת CONDITIONS לא נטענה
**סיבה:** הסקריפטים של conditions package לא נטענו ב-HTML.

**פתרון:**
1. בדוק את `executions.html`
2. ודא שכל הסקריפטים של conditions package קיימים:
   - `conditions-translations.js`
   - `conditions-validator.js`
   - `conditions-form-generator.js`
   - `conditions-crud-manager.js`
   - `conditions-initializer.js`
   - `conditions-config.js`
   - `conditions-ui-manager.js`
   - `conditions-modal-controller.js`

### ❌ PAGE_CONFIGS לא נמצא
**סיבה:** `page-initialization-configs.js` לא נטען.

**פתרון:**
1. בדוק את `executions.html`
2. ודא שהסקריפט `page-initialization-configs.js` נטען לפני `core-systems.js`

## הערות

- הבדיקה לא משנה את המצב של העמוד
- הבדיקה רק קוראת ומציגה מידע
- ניתן להריץ את הבדיקה מספר פעמים

