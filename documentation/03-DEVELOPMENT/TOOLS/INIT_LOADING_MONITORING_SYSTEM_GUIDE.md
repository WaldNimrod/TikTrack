# מדריך מערכת ניטור Init/Loading - למפתחים

**תאריך יצירה:** 1 בינואר 2026
**גרסה:** 1.0.0
**סטטוס:** ✅ פעיל ומתועד
**מיקום:** `trading-ui/scripts/monitoring-functions.js`

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [רכיבי המערכת](#רכיבי-המערכת)
3. [פונקציות עיקריות](#פונקציות-עיקריות)
4. [שימוש יומי](#שימוש-יומי)
5. [פתרון בעיות](#פתרון-בעיות)
6. [הרחבות](#הרחבות)

---

## 🎯 סקירה כללית

### מטרת המערכת

מערכת ניטור Init/Loading אחראית על מעקב בזמן אמת אחר תהליכי אתחול וטעינה של עמודי המערכת. המערכת מספקת כלים לזיהוי בעיות טעינה, חסרים ב-globals, ותלויות שגויות.

### מתי להשתמש

- **בזמן פיתוח:** מעקב אחר בעיות טעינה חדשות
- **לפני הפצה:** בדיקת יציבות אתחול בכל העמודים
- **בעת debugging:** זיהוי בעיות סדר טעינה או תלויות
- **ב-batch חדש:** וידוא שהעמודים החדשים נטענים נכון

---

## 🏗️ רכיבי המערכת

### 1. monitoring-functions.js

**מיקום:** `trading-ui/scripts/monitoring-functions.js`
**גודל:** 1,718 שורות
**תפקיד:** פונקציות ליבה לניטור ואבחון

### 2. סקריפטים נלווים

- **generate-report.sh:** יצירת דוחות אוטומטיים
- **start-monitoring.sh:** הפעלת ניטור ברקע
- **stop-monitoring.sh:** עצירת ניטור

### 3. כלי אבחון

**מיקום:** `scripts/audit/`

- `validate-all-pages-load-order.js` - בדיקת סדר טעינה
- `load-order-validator.js` - אימות תלויות
- `dependency-analyzer.js` - ניתוח תלויות

---

## 🔧 פונקציות עיקריות

### checkScriptExecutionSuccess()

**תפקיד:** בדיקת זמינות globals קריטיים
**פרמטרים:** אין
**החזרה:** אובייקט עם סטטוס ומדדי ביטחון

```javascript
const result = checkScriptExecutionSuccess();
// result = {
//   success: true/false,
//   confidence: 80, // 0-100
//   missingGlobals: ['ModalManagerV2'],
//   availableGlobals: ['API_BASE_URL', 'Logger', ...]
// }
```

### waitForPageFullyLoaded()

**תפקיד:** המתנה לטעינה מלאה של עמוד
**פרמטרים:** אין
**החזרה:** Promise שמתמלא כשעמוד מוכן

### checkForMismatches()

**תפקיד:** השוואה בין HTML ל-DOM
**פרמטרים:**

- `pageName` (string): שם העמוד
- `pageConfig` (object): קונפיגורציית עמוד
- `htmlScripts` (array): סקריפטים מ-HTML

---

## 📊 שימוש יומי

### בדיקת עמוד חדש

```javascript
// 1. נווט לעמוד
// 2. המתן לטעינה
await waitForPageFullyLoaded();

// 3. בדוק globals
const globalsCheck = checkScriptExecutionSuccess();
console.log('Globals status:', globalsCheck);

// 4. בדוק scripts count
const htmlScripts = document.querySelectorAll('script[src]').length;
const domScripts = Array.from(document.scripts).filter(s => s.complete).length;
console.log(`Scripts: HTML=${htmlScripts}, DOM=${domScripts}`);
```

### ניטור אוטומטי

```bash
# הפעל ניטור ברקע
./scripts/monitoring/start-monitoring.sh

# צור דוח
./scripts/monitoring/generate-report.sh
```

---

## 🔧 פתרון בעיות

### בעיית "חסרים ב-globals"

**סימפטומים:**

- שגיאות ReferenceError
- פונקציות לא זמינות
- מערכות לא מתחילות

**פתרון:**

1. בדוק סדר טעינה ב-package-manifest.js
2. ודא ש-scripts קריטיים בלעדיים מ-async
3. בדוק תלויות עם dependency-analyzer.js

### בעיית "scripts לא נטענים"

**סימפטומים:**

- HTML count > DOM count
- מערכות לא מתחילות
- שגיאות ב-console

**פתרון:**

1. בדוק עם validate-all-pages-load-order.js
2. ודא ש-scripts קיימים בשרת
3. בדוק CSP ומדיניות אבטחה

### בעיית "אתחול איטי"

**סימפטומים:**

- זמן טעינה ארוך
- חסימות UI
- בעיות ביצועים

**פתרון:**

1. השתמש ב-async ל-scripts לא קריטיים
2. אופטם סדר טעינה
3. השתמש ב-lazy loading

---

## 🚀 הרחבות

### הוספת ניטור חדש

```javascript
// הוסף ל-monitoring-functions.js
function checkCustomSystem() {
  const result = {
    success: false,
    evidence: [],
    confidence: 0
  };

  // בדיקות מותאמות אישית
  if (typeof window.CustomSystem !== 'undefined') {
    result.success = true;
    result.confidence = 100;
    result.evidence.push('✅ CustomSystem available');
  }

  return result;
}
```

### אינטגרציה עם CI/CD

```bash
# הוסף ל-pipeline
npm run test:monitoring
npm run validate:load-order
npm run check:globals
```

---

## 📚 תיעוד נוסף

- [UNIFIED_INITIALIZATION_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md)
- [PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md](PACKAGE_LOAD_ORDER_AUDIT_TOOLS_GUIDE.md)
- [LOGGING_SYSTEM_GUIDE.md](LOGGING_SYSTEM_GUIDE.md)

---

**Team F - Init/Loading Monitoring Team**
