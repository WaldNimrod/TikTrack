# Watch Lists Widget Developer Guide - ווידג'ט רשימות צפייה

**תאריך יצירה:** 9 בדצמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח מקיף לווידג'ט רשימות צפייה לדף הבית

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [API](#api)
4. [שילוב בעמודים נוספים](#שילוב-בעמודים-נוספים)
5. [Customization](#customization)
6. [דוגמאות קוד](#דוגמאות-קוד)

---

## 🎯 סקירה כללית

**Watch Lists Widget** הוא ווידג'ט לדף הבית המציג רשימות צפייה בתצוגה קומפקטית (read-only).

**מאפיינים:**

- ✅ תצוגה קומפקטית בלבד (read-only)
- ✅ בחירת רשימה דרך dropdown בכותרת
- ✅ בחירה אוטומטית: רשימה אחרונה שהייתה פתוחה או הראשונה
- ✅ מצבי טעינה וריק
- ✅ Hover overlay להצגת פרטים מפורטים
- ✅ שימוש ב-FieldRendererService לעיצוב
- ✅ Module Pattern (IIFE)

**קבצים:**

- **JavaScript:** `trading-ui/scripts/widgets/watch-lists-widget.js`
- **CSS:** `trading-ui/styles-new/06-components/_watch-lists-widget.css`

---

## 🏗️ ארכיטקטורה

### Module Pattern (IIFE)

הווידג'ט משתמש ב-Module Pattern (IIFE) תואם לווידג'טים הקיימים:

```javascript
;(function () {
  'use strict';
  
  // Constants, State, Elements...
  
  const WatchListsWidget = {
    async init(containerId, config) { /* ... */ },
    async render() { /* ... */ },
    async refresh() { /* ... */ },
    destroy() { /* ... */ },
    version: '1.0.0'
  };
  
  window.WatchListsWidget = WatchListsWidget;
})();
```

### בחירת רשימה

הווידג'ט בוחר רשימה להצגה לפי הסדר הבא:

1. **רשימה אחרונה שהייתה פתוחה** - מ-`UnifiedCacheManager` או `PageStateManager`
2. **הרשימה הראשונה** - fallback אם לא נמצאה רשימה אחרונה

**שמירת בחירה:**

- הבחירה נשמרת ב-`UnifiedCacheManager` עם TTL של 7 ימים
- Key: `watch-lists-widget-last-list-id`

### Hover Overlay

הווידג'ט משתמש ב-**WidgetOverlayService** המרכזי לניהול overlay של פרטים נוספים.

**מבנה HTML נדרש:**

- `data-widget-overlay="true"` על ה-item
- `data-overlay="true"` על ה-details container

**תיעוד:**

- [WIDGET_OVERLAY_SERVICE_GUIDE.md](WIDGET_OVERLAY_SERVICE_GUIDE.md) - Widget Overlay Service
- [UNIFIED_UI_POSITIONING_GUIDE.md](UNIFIED_UI_POSITIONING_GUIDE.md) - Unified UI Positioning Service (Floating UI)

**הערה:** `WidgetOverlayService` משתמש ב-`Unified UI Positioning Service` למיקום חכם באמצעות Floating UI (עם fallback אוטומטי). האנימציות מבוצעות באמצעות GSAP (אופציונלי) עם fallback ל-CSS transitions.

**אנימציות:**

- אנימציות fade in/out חלקות בעת פתיחה/סגירה של overlay
- משך אנימציה: 100ms (ברירת מחדל)

---

## 🔌 API

### `init(containerId, config)`

מאתחל את הווידג'ט.

**Parameters:**

- `containerId` (string, optional) - ID של container (default: `watchListsWidgetContainer`)
- `config` (object, optional) - קונפיגורציה:
  - `maxItems` (number, default: 10) - מספר מקסימלי של פריטים להצגה

**Returns:** `Promise<boolean>`

**Example:**

```javascript
await window.WatchListsWidget.init('watchListsWidgetContainer', {
  maxItems: 10
});
```

### `render()`

מעדכן את התצוגה עם הנתונים הנוכחיים.

**Returns:** `Promise<void>`

**Example:**

```javascript
await window.WatchListsWidget.render();
```

### `refresh()`

מטען מחדש את הנתונים ומעדכן את התצוגה.

**Returns:** `Promise<void>`

**Example:**

```javascript
await window.WatchListsWidget.refresh();
```

### `destroy()`

מסיר את הווידג'ט ומנקה event listeners.

**Example:**

```javascript
window.WatchListsWidget.destroy();
```

---

## 🔗 שילוב בעמודים נוספים

### HTML Structure

הווידג'ט דורש מבנה HTML ספציפי:

```html
<div class="card h-100" id="watchListsWidgetContainer">
  <div class="card-header d-flex align-items-center justify-content-between gap-2">
    <h5 class="mb-0 d-flex align-items-center gap-2">
      <span class="icon-placeholder icon" data-icon="eye" data-size="16" data-alt="רשימות צפייה" aria-label="רשימות צפייה"></span>
      <span>רשימות צפייה</span>
    </h5>
    <select id="watchListsWidgetSelect" 
            class="form-select form-select-sm" 
            style="min-width: 200px; font-weight: 600;">
      <option value="">טוען רשימות...</option>
    </select>
  </div>
  <div class="card-body">
    <div id="watchListsWidgetLoading" class="d-flex align-items-center justify-content-center text-muted small">
      <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
      <span>טוען רשימת צפייה...</span>
    </div>
    <div id="watchListsWidgetError" class="alert alert-danger d-none" role="alert">
      <span class="alert-text">שגיאה בטעינת רשימת צפייה</span>
    </div>
    <div id="watchListsWidgetEmpty" class="alert alert-info d-none" role="status">
      <span class="alert-text">אין רשימות צפייה. צור רשימה חדשה בעמוד רשימות צפייה.</span>
    </div>
    <ul class="list-group" id="watchListsWidgetList"></ul>
  </div>
</div>
```

### Package Manifest

הווידג'ט נטען דרך החבילה `dashboard-widgets`:

**File:** `trading-ui/scripts/init-system/package-manifest.js`

```javascript
{
  file: 'widgets/watch-lists-widget.js',
  globalCheck: 'window.WatchListsWidget',
  description: 'Watch lists widget for dashboard',
  required: false,
  loadOrder: 5.6
}
```

### Page Initialization

הווידג'ט מאותחל ב-`page-initialization-configs.js`:

```javascript
if (window.WatchListsWidget) {
  try {
    await window.WatchListsWidget.init('watchListsWidgetContainer', {
      maxItems: 10
    });
  } catch (error) {
    window.Logger?.error?.('❌ Error initializing WatchListsWidget', { error: error.message });
  }
}
```

---

## 🎨 Customization

### Configuration Options

**maxItems:**

```javascript
await window.WatchListsWidget.init('watchListsWidgetContainer', {
  maxItems: 15  // הצג עד 15 פריטים
});
```

### CSS Customization

הווידג'ט משתמש ב-CSS classes ספציפיים:

- `.watch-lists-widget-item` - פריט ברשימה
- `.watch-lists-widget-flag` - כפתור דגל (read-only)
- `.watch-lists-widget-overlay` - overlay עם פרטים נוספים

**File:** `trading-ui/styles-new/06-components/_watch-lists-widget.css`

---

## 💻 דוגמאות קוד

### אתחול בסיסי

```javascript
// אתחול עם ברירת מחדל
await window.WatchListsWidget.init();

// אתחול עם קונפיגורציה
await window.WatchListsWidget.init('watchListsWidgetContainer', {
  maxItems: 10
});
```

### רענון נתונים

```javascript
// רענון מלא
await window.WatchListsWidget.refresh();

// עדכון תצוגה בלבד
await window.WatchListsWidget.render();
```

### ניקוי

```javascript
// ניקוי הווידג'ט
window.WatchListsWidget.destroy();
```

---

## 🔧 Dependencies

הווידג'ט תלוי במערכות הבאות:

- **WatchListsDataService** - טעינת נתונים
- **FieldRendererService** - עיצוב שדות
- **Logger** - לוגים
- **NotificationSystem** - התראות שגיאות
- **WidgetOverlayService** - ניהול overlay
- **UnifiedCacheManager** - שמירת state
- **PageStateManager** - fallback לשמירת state
- **IconSystem** - רינדור אייקונים

---

## 📝 הערות חשובות

1. **Read-only:** הווידג'ט הוא read-only - אין פעולות עריכה/מחיקה
2. **תצוגה קומפקטית בלבד:** אין תצוגות table/cards
3. **ללא תפריט פעולות:** אין תפריט פעולות לעריכת רשימות
4. **ללא כפתור פתיחה/סגירה:** אין כפתור toggle לסקשן

---

## 🔗 קישורים רלוונטיים

- [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md) - רשימת כל הווידג'טים
- [WATCH_LIST README.md](../../04-FEATURES/WATCH_LIST/README.md) - תיעוד מערכת Watch Lists
- [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md) - מדריך כללי ליצירת ווידג'טים

---

**תאריך עדכון אחרון:** 9 בדצמבר 2025

