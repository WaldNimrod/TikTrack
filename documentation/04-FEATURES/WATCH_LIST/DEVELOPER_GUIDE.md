# מדריך מפתחים: מערכת Watch List
## Developer Guide: Watch List System

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0

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
├── watch-lists.html            # Main page
├── scripts/
│   ├── services/
│   │   ├── watch-lists-data.js      # Data service
│   │   └── watch-lists-ui-service.js # UI service
│   └── watch-lists.js          # Page-specific logic

documentation/04-FEATURES/WATCH_LIST/
├── WATCHLIST_SPEC.md           # Main specification
├── DATABASE_SCHEMA.md          # Database schema
├── API_REFERENCE.md            # API documentation
├── FRONTEND_SERVICES_SPEC.md   # Frontend services
├── UI_DESIGN_SPEC.md           # UI design
└── INTEGRATION_PLAN.md         # Integration plan
```

---

**ראו:** מסמכי התיעוד הנוספים לפרטים מלאים.










