# מדריך מפתחים: מערכת Watch List

## Developer Guide: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.1.0  
**עודכן:** 6 בינואר 2025 - תיקון בעיות קריטיות

---

## התחלה מהירה

### 1. הוספת עמוד חדש

```javascript
// trading-ui/watch-lists.html
// שימוש בתבנית סטנדרטית (tag-management.html כדוגמה)
```

### 2. הוספת Package

```javascript
// trading-ui/scripts/init-system/package-manifest.js
{
  name: 'watch-lists',
  scripts: [
    'services/watch-lists-data.js',
    'services/watch-lists-ui-service.js',
    'watch-lists.js'
  ],
  dependencies: ['base', 'services', 'ui-advanced', 'crud']
}
```

### 3. הוספת Page Config

```javascript
// trading-ui/scripts/page-initialization-configs.js
window.pageInitializationConfigs['watch-lists'] = {
  packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'watch-lists', 'init-system'],
  requiredGlobals: [...],
  pageType: 'main'
};
```

---

## וויג'ט דשבורד (Dashboard Widget)

### הוספת וויג'ט חדש לדף הבית

```javascript
// 1. יצירת קובץ וויג'ט
// trading-ui/scripts/widgets/watch-lists-widget.js

(function() {
  'use strict';

  const PAGE_LOG_CONTEXT = { page: 'watch-lists-widget' };

  // Module Pattern
  const WatchListsWidget = {
    init: function(containerId, config) {
      window.Logger?.info('Initializing Watch Lists Widget', PAGE_LOG_CONTEXT);
      // יישום וויג'ט
    },
    render: function() {
      // רינדור וויג'ט
    },
    refresh: function() {
      // רענון נתונים
    },
    destroy: function() {
      // ניקוי משאבים
    }
  };

  // Export to global scope
  window.WatchListsWidget = WatchListsWidget;

  // Log loading
  console.log('✅ Watch Lists Widget loaded', PAGE_LOG_CONTEXT);
  if (window.Logger) {
    window.Logger.info('Watch Lists Widget loaded', PAGE_LOG_CONTEXT);
  }
})();
```

```javascript
// 2. הוספה ל-package-manifest.js
// trading-ui/scripts/init-system/package-manifest.js
{
  file: 'widgets/watch-lists-widget.js',
  globalCheck: 'window.WatchListsWidget',
  description: 'Watch lists widget for dashboard',
  required: false,
  loadOrder: 8
}
```

```javascript
// 3. הוספה ל-page-initialization-configs.js
// trading-ui/scripts/page-initialization-configs.js
window.pageInitializationConfigs['index'].customInitializers.push({
  name: 'WatchListsWidget',
  initializer: async () => {
    if (window.WatchListsWidget) {
      await window.WatchListsWidget.init('watchListsWidgetContainer', {
        maxItems: 10
      });
    }
  }
});
```

---

## שימוש ב-Data Service

```javascript
// טעינת רשימות
const lists = await window.WatchListsData.loadWatchListsData();

// יצירת רשימה
const newList = await window.WatchListsData.createWatchList({
  name: 'Tech Stocks',
  icon: 'chart-line',
  color_hex: '#26baac'
});

// הוספת טיקר
await window.WatchListsData.addTickerToList(listId, {
  ticker_id: 5
});
```

---

## שימוש ב-UI Service

```javascript
// שינוי מצב תצוגה
window.WatchListsUIService.setViewMode(listId, 'cards');

// הצגת Flag Palette
window.WatchListsUIService.showFlagPalette(itemId, (color) => {
  // Update flag
});

// רינדור טבלה
window.WatchListsUIService.renderTableView(items, 'containerId');
```

---

## מבנה קבצים

```
Backend/
├── models/
│   └── watch_list.py           # SQLAlchemy models
├── routes/api/
│   └── watch_lists.py          # API endpoints
└── services/
    └── watch_list_service.py   # Business logic

trading-ui/
├── watch-lists.html            # Main page (Production)
├── scripts/
│   ├── services/
│   │   ├── watch-lists-data.js      # Data service
│   │   └── watch-lists-ui-service.js # UI service
│   └── watch-lists-page.js    # Page-specific logic

documentation/04-FEATURES/WATCH_LIST/
├── WATCHLIST_SPEC.md           # Main specification
├── DATABASE_SCHEMA.md          # Database schema
├── API_REFERENCE.md            # API documentation
├── FRONTEND_SERVICES_SPEC.md   # Frontend services
├── UI_DESIGN_SPEC.md           # UI design
└── INTEGRATION_PLAN.md         # Integration plan
```

---

## בעיות ידועות ותיקונים

### בעיות שתוקנו (6 בינואר 2025)

#### 1. בעיית Validation (validateTextField is not defined)

**בעיה:** `ui-basic.js` קורא ל-`validateTextField` אבל הפונקציה לא זמינה בזמן הטעינה.

**תיקון:**

- ✅ הוספת `validation` package ל-`watch-list` page configuration ב-`page-initialization-configs.js`
- ✅ וידוא ש-validation package נטען לפני modules package (loadOrder: 2.4 vs 2.5)
- ✅ שימוש ב-`window.validateTextField` ב-`ui-basic.js` עם fallback

**קבצים שנערכו:**

- `trading-ui/scripts/page-initialization-configs.js` - הוספת validation package
- `trading-ui/watch-list.html` - validation package נטען לפני modules

#### 2. בעיית aria-hidden Warning

**בעיה:** אזהרה על aria-hidden על element עם focus בעת סגירת modal.

**תיקון:**

- ✅ הוספת טיפול ב-`handleModalHidden()` ב-`modal-manager-v2.js`
- ✅ Blur של active element לפני סגירה
- ✅ הסרת aria-hidden מ-active element

**קבצים שנערכו:**

- `trading-ui/scripts/modal-manager-v2.js` - תיקון `handleModalHidden()`

#### 3. בעיות z-index במודלים

**בעיה:** אזהרות על modal לא נמצא ב-stack.

**בדיקה:**

- ✅ `modal-z-index-manager.js` עובד נכון
- ✅ אזהרות הן מתונות ולא קריטיות
- ✅ הלוגיקה תומכת ב-modals לא רשומים

**הערה:** האזהרות על "modal not found in stack" הן תקינות כאשר modal לא נרשם ב-ModalNavigationService (למשל modal יחיד).

### בדיקות Selenium

**סקריפט בדיקה:** `scripts/test_watch_lists_selenium.py`

**בדיקות זמינות:**

1. טעינת עמוד ואימות מערכות
2. פתיחת מודלים (Add List, Add Ticker)
3. ולידציה של טופסים
4. פעולות CRUD (Create, Read, Update, Delete)
5. החלפת מצבי תצוגה (Table, Cards, Compact)

**הרצה:**

```bash
python3 scripts/test_watch_lists_selenium.py
```

---

## אינטגרציה עם מערכות כלליות

### Validation System

- **Package:** `validation` (loadOrder: 2.4)
- **קובץ:** `scripts/validation-utils.js`
- **פונקציות:** `window.validateTextField`, `window.validateNumberField`, וכו'
- **שימוש:** ב-`ui-basic.js` לולידציה של שדות טופס

### Modal System

- **Package:** `modules` (loadOrder: 2.5)
- **קובץ:** `scripts/modal-manager-v2.js`
- **תכונות:** ניהול מודלים, z-index, aria-hidden
- **תיקונים:** הוספת טיפול ב-aria-hidden בעת סגירה

### Z-Index Management

- **קובץ:** `scripts/modal-z-index-manager.js`
- **תכונות:** ניהול z-index דינמי למודלים מקוננים
- **אינטגרציה:** עם ModalNavigationService

---

**ראו:** מסמכי התיעוד הנוספים לפרטים מלאים.











