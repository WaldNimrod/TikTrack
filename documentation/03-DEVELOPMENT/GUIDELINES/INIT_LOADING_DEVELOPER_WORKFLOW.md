# מדריך זרימת עבודה למפתחים - Init/Loading System

**תאריך יצירה:** 1 בינואר 2026
**גרסה:** 1.0.0
**סטטוס:** ✅ פעיל ומתועד
**קהל יעד:** מפתחי Frontend

---

## 📋 תוכן עניינים

1. [מבוא](#מבוא)
2. [זרימת עבודה יומית](#זרימת-עבודה-יומית)
3. [הוספת חבילה חדשה](#הוספת-חבילה-חדשה)
4. [עדכון חבילה קיימת](#עדכון-חבילה-קיימת)
5. [ניפוי באגים](#ניפוי-באגים)
6. [בדיקות ואימות](#בדיקות-ואימות)
7. [שגיאות נפוצות](#שגיאות-נפוצות)

---

## 🎯 מבוא

### מטרת המדריך

מדריך זה מספק למפתחים את כל הכלים והזרימות הדרושות לעבודה עם מערכת Init/Loading. המדריך מכסה את כל השלבים מהוספת קוד חדש ועד בדיקה והפצה.

### קהל יעד

- **מפתחי Frontend** - עבודה יומית עם החבילות
- **מפתחי Backend** - הבנה של איך השינויים משפיעים על טעינה
- **DevOps** - הבנה של תהליכי בדיקה ואימות

### עקרונות יסוד

1. **Package Manifest First** - כל שינוי מתחיל במניפסט
2. **Test Before Commit** - בדיקה מקומית לפני push
3. **Monitor Always** - ניטור שינויים בזמן אמת
4. **Document Changes** - עדכון תיעוד לכל שינוי

---

## 📅 זרימת עבודה יומית

### בוקר - בדיקת סטטוס

```bash
# 1. בדוק סטטוס חבילות
node scripts/audit/validate-package-dependencies.js

# 2. בדוק שינויים אחרונים
git log --oneline -10 trading-ui/scripts/init-system/

# 3. בדוק אם יש בעיות ניטור
./scripts/monitoring/generate-report.sh
```

### פיתוח - עבודה עם חבילות

```javascript
// 1. בדוק חבילה קיימת
const myPackage = PACKAGE_MANIFEST['my-package'];

// 2. הוסף סקריפט חדש
myPackage.scripts.push({
  file: 'my-package/new-feature.js',
  globalCheck: 'window.NewFeature',
  description: 'תכונה חדשה',
  required: false,
  loadOrder: myPackage.scripts.length + 1
});

// 3. בדוק תלויות
console.log('Dependencies:', myPackage.dependencies);
```

### ערב - בדיקה לפני commit

```bash
# 1. הרץ בדיקות אוטומטיות
npm run test:loading

# 2. בדוק globals באופן ידני
# פתח דף ובדוק ב-console:
checkScriptExecutionSuccess()

# 3. בדוק scripts count
document.querySelectorAll('script[src]').length
```

---

## ➕ הוספת חבילה חדשה

### שלב 1: תכנון

**שאלות לתכנון:**

- מה התפקיד של החבילה?
- אילו תלויות נדרשות?
- איזה סקריפטים נדרשים?
- האם החבילה קריטית?

**דוגמה לתכנון:**

```
Package Name: user-preferences
Purpose: ניהול העדפות משתמש
Dependencies: ['base', 'cache']
Critical: false
Scripts: ['user-preferences.js', 'preferences-ui.js']
```

### שלב 2: יצירת החבילה

```javascript
// 1. הוסף למניפסט
PACKAGE_MANIFEST['user-preferences'] = {
  id: 'user-preferences',
  name: 'העדפות משתמש',
  description: 'ניהול העדפות משתמש מתקדמות',
  version: '1.0.0',
  critical: false,
  loadOrder: 8.0,
  dependencies: ['base', 'cache'],
  loadingStrategy: 'defer',
  scripts: [
    {
      file: 'user-preferences/user-preferences.js',
      globalCheck: 'window.UserPreferences',
      description: 'לוגיקת העדפות בסיסית',
      required: true,
      loadOrder: 1
    },
    {
      file: 'user-preferences/preferences-ui.js',
      globalCheck: 'window.PreferencesUI',
      description: 'ממשק משתמש להעדפות',
      required: false,
      loadOrder: 2
    }
  ]
};

// 2. צור את הקבצים
// trading-ui/scripts/user-preferences/
// ├── user-preferences.js
// └── preferences-ui.js
```

### שלב 3: בדיקה ואימות

```bash
# 1. בדוק תלויות
node scripts/audit/validate-package-dependencies.js

# 2. בדוק טעינה בעמוד
node scripts/audit/validate-all-pages-load-order.js

# 3. בדוק באופן ידני
# נווט לעמוד ובדוק globals
window.UserPreferences // should exist
window.PreferencesUI   // should exist
```

---

## 🔄 עדכון חבילה קיימת

### הוספת סקריפט לחבילה

```javascript
// 1. מצא את החבילה
const uiPackage = PACKAGE_MANIFEST['ui-components'];

// 2. הוסף סקריפט
uiPackage.scripts.push({
  file: 'ui-components/new-button.js',
  globalCheck: 'window.NewButton',
  description: 'כפתור חדש עם אנימציה',
  required: false,
  loadOrder: uiPackage.scripts.length + 1
});

// 3. עדכן גרסה
uiPackage.version = '1.1.0';
```

### שינוי תלויות

```javascript
// 1. הוסף תלות חדשה
PACKAGE_MANIFEST['my-package'].dependencies.push('new-dependency');

// 2. הסר תלות
const deps = PACKAGE_MANIFEST['my-package'].dependencies;
const index = deps.indexOf('old-dependency');
if (index > -1) deps.splice(index, 1);

// 3. בדוק שינויים
node scripts/audit/dependency-analyzer.js
```

### שינוי loadOrder

```javascript
// 1. שנה סדר טעינה
PACKAGE_MANIFEST['critical-package'].loadOrder = 2.0;

// 2. ודא שאין התנגשויות
// כל loadOrder צריך להיות יחודי
const orders = Object.values(PACKAGE_MANIFEST).map(p => p.loadOrder);
const uniqueOrders = [...new Set(orders)];
console.log('Unique orders:', uniqueOrders.length === orders.length);
```

---

## 🔍 ניפוי באגים

### זיהוי בעיות טעינה

**בעיית globals חסרים:**

```javascript
// בדוק אם global קיים
console.log('Global exists:', typeof window.MyGlobal !== 'undefined');

// מצא איזו חבילה אמורה לספק אותו
for (const [pkgId, pkg] of Object.entries(PACKAGE_MANIFEST)) {
  for (const script of pkg.scripts) {
    if (script.globalCheck.includes('MyGlobal')) {
      console.log('Found in package:', pkgId);
    }
  }
}
```

**בעיית סקריפטים לא נטענים:**

```javascript
// השווה HTML ל-DOM
const htmlScripts = document.querySelectorAll('script[src]').length;
const domScripts = Array.from(document.scripts).filter(s => s.complete).length;

console.log(`HTML: ${htmlScripts}, DOM: ${domScripts}`);

if (htmlScripts > domScripts) {
  console.log('Scripts missing from DOM!');
}
```

### כלי ניפוי באגים

```bash
# 1. בדיקת תלויות מפורטת
node scripts/audit/validate-package-dependencies.js --verbose

# 2. ניתוח סדר טעינה
node scripts/audit/load-order-validator.js --package problematic-package

# 3. ניטור בזמן אמת
./scripts/monitoring/start-monitoring.sh
```

### Console Debugging

```javascript
// ניטור טעינת סקריפטים
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking scripts...');
  checkScriptExecutionSuccess();
});

// ניטור שגיאות
window.addEventListener('error', (e) => {
  console.error('Script loading error:', e);
});

// ניטור globals
setInterval(() => {
  const result = checkScriptExecutionSuccess();
  if (!result.success) {
    console.warn('Missing globals:', result.missingGlobals);
  }
}, 1000);
```

---

## ✅ בדיקות ואימות

### בדיקות אוטומטיות

```bash
# בדיקה מקיפה
npm run test:init-loading

# בדיקת חבילה ספציפית
npm run test:package -- --package user-preferences

# בדיקת עמוד ספציפי
npm run test:page -- --page trading_journal
```

### בדיקות ידניות

**בדיקת טעינה מלאה:**

1. נווט לעמוד ריק (ללא cache)
2. פתח Developer Tools
3. בדוק Console ללא שגיאות
4. הרץ `checkScriptExecutionSuccess()`
5. בדוק שכל required globals קיימים

**בדיקת ביצועים:**

1. פתח Network tab
2. נווט לעמוד
3. בדוק זמני טעינה
4. ודא שאין בקשות כפולות

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: Init Loading Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run init loading tests
        run: npm run test:init-loading
      - name: Validate package dependencies
        run: node scripts/audit/validate-package-dependencies.js
```

---

## 🚨 שגיאות נפוצות

### "ReferenceError: X is not defined"

**סיבה:** Global לא זמין כי סקריפט לא נטען
**פתרון:**

1. בדוק אם החבילה מוגדרת במניפסט
2. בדוק סדר טעינה
3. בדוק globalCheck בהגדרת הסקריפט

### "Scripts count mismatch"

**סיבה:** סקריפטים ב-HTML לא נטענים ל-DOM
**פתרון:**

1. בדוק נתיבי קבצים
2. בדוק שגיאות רשת
3. בדוק CSP

### "Circular dependency detected"

**סיבה:** שתי חבילות תלויות זו בזו
**פתרון:**

1. הרץ `validate-package-dependencies.js`
2. שנה מבנה התלויות
3. שקול מיזוג חבילות

### "Load order conflict"

**סיבה:** שתי חבילות עם אותו loadOrder
**פתרון:**

1. שנה loadOrder לאחת החבילות
2. ודא שכל loadOrder יחודי

---

## 📚 תיעוד נוסף

- [INIT_LOADING_SYSTEM_ARCHITECTURE.md](../02-ARCHITECTURE/FRONTEND/INIT_LOADING_SYSTEM_ARCHITECTURE.md) - ארכיטקטורה מקיפה
- [PACKAGE_MANIFEST_SOT_DEVELOPER_GUIDE.md](../02-ARCHITECTURE/FRONTEND/PACKAGE_MANIFEST_SOT_DEVELOPER_GUIDE.md) - מדריך מניפסט
- [INIT_LOADING_MONITORING_SYSTEM_GUIDE.md](INIT_LOADING_MONITORING_SYSTEM_GUIDE.md) - מדריך ניטור
- [LOAD_ORDER_VALIDATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/LOAD_ORDER_VALIDATION_SYSTEM.md) - אימות סדר טעינה

---

**Team F - Init/Loading Developer Workflow**
