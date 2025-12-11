# Recent Items Widget Developer Guide - ווידג'ט טריידים ותוכניות אחרונות

**תאריך יצירה:** 29 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח מקיף לווידג'ט טריידים ותוכניות אחרונות מאוחד

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

**Recent Items Widget** הוא ווידג'ט מאוחד המציג:

- **טריידים אחרונים** - רשימת הטריידים האחרונים שנוצרו
- **תוכניות אחרונות** - רשימת התוכניות האחרונות שנוצרו

**מאפיינים:**

- ✅ Bootstrap Tabs (2 טאבים)
- ✅ Module Pattern (IIFE)
- ✅ Hover overlay להצגת פרטים מפורטים
- ✅ שימוש ב-FieldRendererService לעיצוב
- ✅ תמיכה ב-multiple instances

**קבצים:**

- **JavaScript:** `trading-ui/scripts/widgets/recent-items-widget.js`
- **CSS:** `trading-ui/styles-new/06-components/_recent-items-widget.css`

---

## 🏗️ ארכיטקטורה

### Module Pattern (IIFE)

הווידג'ט משתמש ב-Module Pattern (IIFE) תואם לווידג'טים הקיימים:

```javascript
;(function () {
  'use strict';
  
  // Constants, State, Elements...
  
  const RecentItemsWidget = {
    init() { /* ... */ },
    render(data) { /* ... */ },
    destroy() { /* ... */ },
    version: '1.0.0'
  };
  
  window.RecentItemsWidget = RecentItemsWidget;
})();
```

### Bootstrap Tabs

הווידג'ט משתמש ב-Bootstrap 5 Tabs לניווט בין 2 טאבים:

- **טריידים אחרונים** (Trades Tab)
- **תוכניות אחרונות** (Plans Tab)

**תיעוד טאבים:** ראה [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

### Hover Overlay

הווידג'ט משתמש ב-**WidgetOverlayService** המרכזי לניהול overlay של פרטים נוספים.

**מבנה HTML נדרש:**

- `data-widget-overlay="true"` על ה-item (אופציונלי - לא נדרש)
- `data-overlay="true"` על ה-details container

**תיעוד:**

- [WIDGET_OVERLAY_SERVICE_GUIDE.md](WIDGET_OVERLAY_SERVICE_GUIDE.md) - Widget Overlay Service
- [UNIFIED_UI_POSITIONING_GUIDE.md](UNIFIED_UI_POSITIONING_GUIDE.md) - Unified UI Positioning Service (Floating UI)

**הערה:** `WidgetOverlayService` משתמש ב-`Unified UI Positioning Service` למיקום חכם באמצעות Floating UI (עם fallback אוטומטי). האנימציות מבוצעות באמצעות GSAP (אופציונלי) עם fallback ל-CSS transitions.

**אנימציות:**

- אנימציות fade in/out חלקות בעת פתיחה/סגירה של overlay
- משך אנימציה: 100ms (ברירת מחדל)
- ראה [UNIFIED_UI_POSITIONING_GUIDE.md](UNIFIED_UI_POSITIONING_GUIDE.md) - פרק GSAP Integration

**התנהגות פשוטה ומינימלית:**

- **mouseenter** על item → פתיחת overlay (סוגר את כל האחרים)
- **mouseleave** מ-item → סגירה (אלא אם העכבר עובר לאוברליי של אותו item או עדיין בתוך אותו item)
- **mouseleave** מ-overlay → סגירה (אלא אם העכבר עובר חזרה לאותו item)

**טיפול ב"חורים" בתוך item:**
הקוד בודק אם `relatedTarget` עדיין בתוך אותו item - אם כן, ה-overlay נשאר פתוח. זה מונע סגירה לא רצויה כשהעכבר עובר בין אלמנטים בתוך אותו item.

כל פריט מציג:

- **Header Section** - תמיד גלוי: שם, תאריך, סכום
- **Details Section** - מוצג על hover: פרטים נוספים (צד, סטטוס, כמות, וכו')

---

## 🔌 API

### `RecentItemsWidget.init(containerId, config)`

מאתחל את הווידג'ט.

**Parameters:**

- `containerId` (string, optional) - מזהה קונטיינר (ברירת מחדל: `'recentItemsWidgetContainer'`)
- `config` (object, optional) - תצורת אתחול
  - `config.defaultTab` (string) - טאב פעיל ברירת מחדל (`'trades'` או `'plans'`)
  - `config.maxItems` (number, optional) - מספר מקסימלי של פריטים להצגה בכל טאב (ברירת מחדל: `5`)

**Example:**

```javascript
// אתחול ברירת מחדל
window.RecentItemsWidget.init();

// אתחול עם טאב תוכניות פעיל
window.RecentItemsWidget.init('recentItemsWidgetContainer', {
  defaultTab: 'plans'
});

// אתחול עם הגדרת מספר מקסימלי של פריטים
window.RecentItemsWidget.init('recentItemsWidgetContainer', {
  defaultTab: 'trades',
  maxItems: 10
});
```

### `RecentItemsWidget.render(data)`

מעדכן את הווידג'ט עם נתונים חדשים.

**Parameters:**

- `data` (object) - נתונים לעדכון
  - `data.trades` (array, optional) - רשימת טריידים
  - `data.tradePlans` (array, optional) - רשימת תוכניות
  - `data.currencySymbol` (string, optional) - סמל מטבע (ברירת מחדל: `'$'`)

**Example:**

```javascript
window.RecentItemsWidget.render({
  trades: [
    { id: 1, ticker: { symbol: 'AAPL' }, side: 'long', amount: 1000, created_at: '2025-01-29' },
    { id: 2, ticker: { symbol: 'TSLA' }, side: 'short', amount: 2000, created_at: '2025-01-28' }
  ],
  tradePlans: [
    { id: 1, name: 'תוכנית AAPL', amount: 1000, created_at: '2025-01-29' }
  ],
  currencySymbol: '$'
});
```

**הערות:**

- אם `trades` או `tradePlans` לא מסופקים, הווידג'ט ישמור את הנתונים הקיימים
- אם מערך ריק מסופק, הווידג'ט ינקה את הטאב המתאים רק אם הוא כבר היה ריק

### `RecentItemsWidget.destroy()`

מנקה את הווידג'ט ומסיר את כל ה-event listeners.

**מה זה עושה:**

- מנקה את ה-state
- מסיר event listeners מכל ה-elements
- מנקה את כל הפריטים

**Example:**

```javascript
window.RecentItemsWidget.destroy();
```

---

## 🔗 שילוב בעמודים נוספים

### 1. HTML Structure

הוסף את מבנה ה-HTML לעמוד:

```html
<div class="card h-100" id="recentItemsWidgetContainer">
  <div class="card-header d-flex align-items-center justify-content-between gap-2">
    <h5 class="mb-0 d-flex align-items-center gap-2">
      <img src="images/icons/entities/home.svg" alt="טריידים ותוכניות אחרונות" class="section-icon">
      <span>טריידים ותוכניות אחרונות</span>
    </h5>
    <!-- Bootstrap Tabs -->
    <ul class="nav nav-tabs mb-0" id="recentItemsWidgetTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" 
                id="recentItemsTradesTab" 
                data-bs-toggle="tab" 
                data-bs-target="#recentItemsWidgetTradesPane" 
                type="button" 
                role="tab">
          טריידים
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="recentItemsPlansTab" 
                data-bs-toggle="tab" 
                data-bs-target="#recentItemsWidgetPlansPane" 
                type="button" 
                role="tab">
          תוכניות
        </button>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <!-- Tab Content -->
    <div class="tab-content" id="recentItemsWidgetTabContent">
      <!-- Trades Tab -->
      <div class="tab-pane fade show active" 
           id="recentItemsWidgetTradesPane" 
           role="tabpanel">
        <div id="recentItemsWidgetTradesLoading" class="d-none">טוען...</div>
        <div id="recentItemsWidgetTradesError" class="alert alert-danger d-none"></div>
        <div id="recentItemsWidgetTradesEmpty" class="alert alert-info d-none">אין טריידים להצגה</div>
        <ul class="list-group list-group-flush" id="recentItemsWidgetTradesList"></ul>
      </div>
      
      <!-- Plans Tab -->
      <div class="tab-pane fade" 
           id="recentItemsWidgetPlansPane" 
           role="tabpanel">
        <div id="recentItemsWidgetPlansLoading" class="d-none">טוען...</div>
        <div id="recentItemsWidgetPlansError" class="alert alert-danger d-none"></div>
        <div id="recentItemsWidgetPlansEmpty" class="alert alert-info d-none">אין תוכניות להצגה</div>
        <ul class="list-group list-group-flush" id="recentItemsWidgetPlansList"></ul>
      </div>
    </div>
  </div>
</div>
```

**ראה את המבנה המלא ב-** `trading-ui/index.html`

### 2. CSS

וודא שה-CSS נטען:

```html
<!-- ה-CSS נטען אוטומטית דרך master.css -->
```

או הוסף ישירות:

```html
<link rel="stylesheet" href="styles-new/06-components/_recent-items-widget.css?v=1.0.0">
```

### 3. JavaScript

**Option A: דרך Package Manifest (מומלץ)**

הוסף ל-`package-manifest.js`:

```javascript
'my-package': {
  scripts: [
    {
      file: 'widgets/recent-items-widget.js',
      globalCheck: 'window.RecentItemsWidget',
      required: true
    }
  ]
}
```

**Option B: טעינה ישירה**

```html
<script src="scripts/widgets/recent-items-widget.js?v=1.0.0"></script>
```

### 4. אתחול

```javascript
// בעמוד
document.addEventListener('DOMContentLoaded', () => {
  if (window.RecentItemsWidget) {
    window.RecentItemsWidget.init('recentItemsWidgetContainer', {
      defaultTab: 'trades',
      maxItems: 5
    });
  }
});
```

---

## 🎨 Customization

### מספר מקסימלי של פריטים

ניתן להגדיר את המספר המקסימלי של פריטים להצגה בכל טאב:

```javascript
window.RecentItemsWidget.init('recentItemsWidgetContainer', {
  maxItems: 10 // הצג עד 10 פריטים בכל טאב
});
```

### טאב ברירת מחדל

ניתן להגדיר איזה טאב יהיה פעיל בעת האתחול:

```javascript
window.RecentItemsWidget.init('recentItemsWidgetContainer', {
  defaultTab: 'plans' // התחל עם טאב תוכניות
});
```

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
- משך אנימציה: 200ms (ברירת מחדל)
- ראה [UNIFIED_UI_POSITIONING_GUIDE.md](UNIFIED_UI_POSITIONING_GUIDE.md) - פרק GSAP Integration

ה-overlay מוצג אוטומטית על hover על כל פריט. ה-overlay מציג:

- פרטים נוספים שלא מוצגים ב-header
- מידע מפורט על הטרייד/תוכנית

העיצוב נשלט דרך CSS ב-`_recent-items-widget.css`.

---

## 💻 דוגמאות קוד

### דוגמה 1: אתחול בסיסי

```javascript
// בעמוד הבית - אוטומטי דרך page-initialization-configs.js
window.RecentItemsWidget.init();
```

### דוגמה 2: אתחול עם תצורה

```javascript
window.RecentItemsWidget.init('customContainer', {
  defaultTab: 'plans',
  maxItems: 10
});
```

### דוגמה 3: עדכון טריידים ותוכניות

```javascript
// עדכון עם טריידים ותוכניות
window.RecentItemsWidget.render({
  trades: recentTrades,
  tradePlans: recentPlans,
  currencySymbol: '$'
});

// עדכון רק טריידים (תוכניות נשמרות)
window.RecentItemsWidget.render({
  trades: newTrades,
  currencySymbol: '$'
});

// עדכון רק תוכניות (טריידים נשמרים)
window.RecentItemsWidget.render({
  tradePlans: newPlans,
  currencySymbol: '$'
});
```

### דוגמה 4: ניקוי ווידג'ט

```javascript
// ניקוי מלא
window.RecentItemsWidget.destroy();
```

---

## 🔧 תלויות

### מערכות כלליות

- **FieldRendererService** (`window.FieldRendererService`) - עיצוב שדות
  - `renderAmount()` - עיצוב סכומים
  - `renderDateShort()` - עיצוב תאריכים קצרים
  - `renderSide()` - עיצוב צד (long/short)
  - `renderStatus()` - עיצוב סטטוס
  - `renderType()` - עיצוב סוג השקעה
  - `renderShares()` - עיצוב כמות מניות

- **ModalManagerV2** (`window.ModalManagerV2`) - פתיחת מודלים
  - `showModal(modalId, 'view', { entityId })` - פתיחת מודל ישות

- **Logger** (`window.Logger`) - לוגים
  - `info()`, `warn()`, `error()`, `debug()`

### Packages

הווידג'ט נטען דרך החבילה `dashboard-widgets`:

- `base`
- `services`
- `entity-services`

---

## 📖 תיעוד נוסף

- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- **מדריך טאבים:** [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)
- **ארכיטקטורת ווידג'טים:** [WIDGET_SYSTEM_ARCHITECTURE.md](../../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** 29 ינואר 2025

