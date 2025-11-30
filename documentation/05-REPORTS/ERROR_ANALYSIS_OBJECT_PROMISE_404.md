# ניתוח שגיאה: `[object Promise]` 404

## סיכום השגיאה

**שגיאה:** `Failed to load resource: the server responded with a status of 404 (NOT FOUND) @ http://localhost:8080/[object%20Promise]:0`

**תיאור:** Promise מומר ל-string במקום URL, מה שגורם לקריאת fetch/script.src עם `[object Promise]` במקום URL תקין.

## מיפוי המערכת והשכבה

### 1. **אובייקט/מערכת:**
- **מערכת:** מערכת ניטור וטעינת קבצים (Monitoring & File Loading System)
- **אובייקטים רלוונטיים:**
  - `parseHTMLFile()` - `trading-ui/scripts/monitoring-functions.js`
  - `runDetailedPageScan()` - `trading-ui/scripts/monitoring-functions.js`
  - `loadScriptOnce()` - `trading-ui/scripts/ui-utils.js`
  - `ensureRelatedData()` - `trading-ui/scripts/active-alerts-component.js`

### 2. **שכבה:**
- **שכבה:** שכבת טעינת משאבים (Resource Loading Layer)
- **תת-שכבה:** שכבת טעינת קבצים דינמית (Dynamic File Loading Sub-layer)
- **רמת גישה:** Frontend JavaScript - Browser API Level

### 3. **ארכיטקטורה:**
```
┌─────────────────────────────────────────┐
│  Frontend Application Layer             │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Resource Loading Layer            │  │
│  │  - parseHTMLFile()                │  │
│  │  - runDetailedPageScan()          │  │
│  │  - loadScriptOnce()               │  │
│  │  - ensureRelatedData()            │  │
│  └───────────────────────────────────┘  │
│           ↓                              │
│  ┌───────────────────────────────────┐  │
│  │ Browser API Layer                 │  │
│  │  - fetch()                        │  │
│  │  - script.src                     │  │
│  │  - href                           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## ניתוח מקור השגיאה

### אפשרויות:

1. **קריאת `fetch()` עם Promise במקום string:**
   - `parseHTMLFile(pageName)` - אם `pageName` הוא Promise
   - `ensureRelatedData()` - אם אחד מה-URLs הוא Promise
   - קריאה אחרת ל-`fetch()` עם Promise

2. **קריאת `script.src` עם Promise במקום string:**
   - `loadScriptOnce(src)` - אם `src` הוא Promise
   - `_loadModuleScript()` - אם `config.path` הוא Promise
   - קריאה אחרת ל-`script.src` עם Promise

3. **קריאת `href` או `src` דרך אובייקט אחר:**
   - קריאה דרך wrapper שלא תפסתי
   - קריאה דרך אובייקט אחר

## תיקונים שבוצעו

### 1. Validation ל-`parseHTMLFile()`:
```javascript
// trading-ui/scripts/monitoring-functions.js:853
async function parseHTMLFile(pageName) {
    // Validate pageName is a string, not a Promise
    if (typeof pageName !== 'string') {
        const error = new Error(`parseHTMLFile: pageName must be a string, got ${typeof pageName}. If you have a Promise, await it first.`);
        console.error('❌ parseHTMLFile invalid pageName type:', error);
        if (window.Logger?.error) {
            window.Logger.error('❌ parseHTMLFile invalid pageName type', error, { page: 'monitoring', pageNameType: typeof pageName });
        }
        throw error;
    }
    // ... rest of function
}
```

### 2. Validation ל-`runDetailedPageScan()`:
```javascript
// trading-ui/scripts/monitoring-functions.js:690
async function runDetailedPageScan(pageName, pageConfig) {
    // Validate pageName is a string, not a Promise
    if (typeof pageName !== 'string') {
        const error = new Error(`runDetailedPageScan: pageName must be a string, got ${typeof pageName}. If you have a Promise, await it first.`);
        console.error('❌ runDetailedPageScan invalid pageName type:', error);
        if (window.Logger?.error) {
            window.Logger.error('❌ runDetailedPageScan invalid pageName type', error, { page: 'monitoring', pageNameType: typeof pageName });
        }
        throw error;
    }
    // ... rest of function
}
```

### 3. Validation קיים ב-`loadScriptOnce()`:
```javascript
// trading-ui/scripts/ui-utils.js:2187
function loadScriptOnce(src, options = {}) {
  if (!src) {
    return Promise.reject(new Error('loadScriptOnce: src is required'));
  }
  
  // Validate src is a string, not a Promise or other object
  if (typeof src !== 'string') {
    const error = new Error(`loadScriptOnce: src must be a string, got ${typeof src}. If you have a Promise, await it first.`);
    if (window.Logger?.error) {
      window.Logger.error('❌ loadScriptOnce invalid src type', error, { page: 'ui-utils', loader: 'loadScriptOnce', srcType: typeof src });
    }
    return Promise.reject(error);
  }
  // ... rest of function
}
```

## בדיקות שבוצעו

1. ✅ הוספתי monitoring ל-`fetch()` - לא תפס את השגיאה
2. ✅ הוספתי monitoring ל-`script.src` - לא תפס את השגיאה
3. ✅ בדקתי קריאות אוטומטיות - לא מצאתי
4. ✅ בדקתי `parseHTMLFile()` - יש validation
5. ✅ בדקתי `runDetailedPageScan()` - יש validation
6. ✅ בדקתי `loadScriptOnce()` - יש validation

## מסקנות

השגיאה עדיין מופיעה, מה שמצביע על:
1. **מקור אחר** - לא מ-`parseHTMLFile`, `runDetailedPageScan`, או `loadScriptOnce`
2. **קריאה דרך wrapper** - אולי דרך מערכת אחרת שלא תפסתי
3. **קריאה אוטומטית מוקדמת** - מתרחשת לפני שה-monitoring נטען
4. **קריאה דרך אובייקט אחר** - אולי דרך `href` או `src` של אובייקט אחר

## המלצות

1. **להמשיך לחקור:**
   - להוסיף monitoring ל-`href` assignments
   - להוסיף monitoring ל-`src` assignments של כל האובייקטים
   - לבדוק קריאות אוטומטיות מוקדמות יותר

2. **לבדוק:**
   - קריאות דרך `active-alerts-component.js`
   - קריאות דרך מערכות אחרות
   - קריאות דרך wrappers

3. **לשקול:**
   - הוספת try-catch ל-`fetch()` global
   - הוספת try-catch ל-`script.src` setter
   - הוספת logging מפורט יותר

## קבצים רלוונטיים

- `trading-ui/scripts/monitoring-functions.js` - `parseHTMLFile()`, `runDetailedPageScan()`
- `trading-ui/scripts/ui-utils.js` - `loadScriptOnce()`
- `trading-ui/scripts/active-alerts-component.js` - `ensureRelatedData()`
- `trading-ui/scripts/init-system-check.js` - קריאות ל-`runDetailedPageScan()`
- `trading-ui/scripts/modules/core-systems.js` - `_loadModuleScript()`

## תאריך ניתוח

2025-01-27

