# Unified Pending Actions Widget Developer Guide - ווידג'ט שיוך ויצירת טריידים ותוכניות

**תאריך יצירה:** 29 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** מדריך מפתח מקיף לווידג'ט שיוך ויצירת טריידים ותוכניות מרשומות ביצוע

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה](#ארכיטקטורה)
3. [API](#api)
4. [שילוב בעמודים נוספים](#שילוב-בעמודים-נוספים)
5. [Services Integration](#services-integration)
6. [דוגמאות קוד](#דוגמאות-קוד)

---

## 🎯 סקירה כללית

**Unified Pending Actions Widget** הוא ווידג'ט מאוחד המציג פעולות ממתינות לשיוך ויצירת טריידים ותוכניות מרשומות ביצוע.

**מאפיינים:**
- ✅ Bootstrap Tabs (nested tabs: Action + Entity)
- ✅ Module Pattern (IIFE)
- ✅ שימוש ב-services משותפים
- ✅ 4 קומבינציות: Assign Plans, Assign Trades, Create Plans, Create Trades

**קבצים:**
- **JavaScript:** `trading-ui/scripts/widgets/unified-pending-actions-widget.js`
- **CSS:** `trading-ui/styles-new/06-components/_unified-pending-actions-widget.css`

---

## 🏗️ ארכיטקטורה

### Module Pattern (IIFE)

הווידג'ט משתמש ב-Module Pattern (IIFE) תואם לווידג'טים הקיימים:

```javascript
;(function () {
  'use strict';
  
  // Constants, State, Elements...
  
  const UnifiedPendingActionsWidget = {
    async init() { /* ... */ },
    async render() { /* ... */ },
    async refresh() { /* ... */ },
    destroy() { /* ... */ },
    version: '2.0.0'
  };
  
  window.UnifiedPendingActionsWidget = UnifiedPendingActionsWidget;
})();
```

### Bootstrap Tabs (Nested)

הווידג'ט משתמש ב-Bootstrap 5 Tabs עם nested structure:
- **Action Tabs:** "שיוך" (Assign) / "יצירת חדש" (Create)
- **Entity Tabs:** "תוכניות" (Plans) / "טריידים" (Trades)

**4 קומבינציות:**
1. **Assign Plans** - שיוך תוכניות לטריידים
2. **Assign Trades** - שיוך ביצועים לטריידים
3. **Create Plans** - יצירת תוכניות מטריידים
4. **Create Trades** - יצירת טריידים מביצועים

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

כל פריט מציג:
- **Header Section** - תמיד גלוי: שם, תאריך, סכום, כפתורי פעולה
- **Details Section** - מוצג על hover: פרטים נוספים (חשבון, פעולה, הצעות שיוך, וכו')

---

## 🔌 API

### `UnifiedPendingActionsWidget.init(containerId, config)`

מאתחל את הווידג'ט.

**Parameters:**
- `containerId` (string, optional) - מזהה קונטיינר (ברירת מחדל: `'unifiedPendingActionsWidgetContainer'`)
- `config` (object, optional) - תצורת אתחול
  - `config.defaultItemsLimit` (number, optional) - מספר מקסימלי של פריטים להצגה (ברירת מחדל: `4`)
  - `config.defaultAction` (string, optional) - פעולה פעילה ברירת מחדל (`'assign'` או `'create'`)
  - `config.defaultEntity` (string, optional) - ישות פעילה ברירת מחדל (`'plans'` או `'trades'`)

**Example:**
```javascript
// אתחול ברירת מחדל
await window.UnifiedPendingActionsWidget.init();

// אתחול עם תצורה מותאמת
await window.UnifiedPendingActionsWidget.init('unifiedPendingActionsWidgetContainer', {
  defaultItemsLimit: 6,
  defaultAction: 'create',
  defaultEntity: 'trades'
});
```

**Note:** הפונקציה היא `async` - יש להשתמש ב-`await` או `.then()`.

### `UnifiedPendingActionsWidget.render()`

מעדכן את כל הקומבינציות.

**Example:**
```javascript
await window.UnifiedPendingActionsWidget.render();
```

### `UnifiedPendingActionsWidget.refresh()`

מרענן את כל הנתונים וטוען מחדש מהשרת.

**Example:**
```javascript
await window.UnifiedPendingActionsWidget.refresh();
```

### `UnifiedPendingActionsWidget.destroy()`

מנקה את הווידג'ט ומסיר את כל ה-event listeners.

**Example:**
```javascript
window.UnifiedPendingActionsWidget.destroy();
```

### `UnifiedPendingActionsWidget.getState()`

מחזיר את המצב הנוכחי של הווידג'ט (read-only).

**Returns:**
```javascript
{
  initialized: boolean,
  activeAction: 'assign' | 'create',
  activeEntity: 'plans' | 'trades',
  config: { ... }
}
```

**Example:**
```javascript
const state = window.UnifiedPendingActionsWidget.getState();
console.log('Active combination:', `${state.activeAction}-${state.activeEntity}`);
```

---

## 🔗 שילוב בעמודים נוספים

### 1. HTML Structure

הוסף את מבנה ה-HTML לעמוד:

```html
<div class="card h-100" id="unifiedPendingActionsWidgetContainer">
  <div class="card-header">
    <h5 id="unifiedPendingActionsWidgetTitle">פעולות ממתינות</h5>
    <span class="badge" id="unifiedPendingActionsWidgetBadge">0</span>
  </div>
  <div class="card-body">
    <!-- Action Tabs -->
    <ul class="nav nav-tabs" id="unifiedPendingActionsActionTabs" role="tablist">
      <li class="nav-item">
        <button class="nav-link active" id="actionTabAssign">שיוך</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" id="actionTabCreate">יצירת חדש</button>
      </li>
    </ul>
    
    <!-- Entity Tabs -->
    <ul class="nav nav-tabs" id="unifiedPendingActionsEntityTabs" role="tablist">
      <li class="nav-item">
        <button class="nav-link active" id="entityTabPlans">תוכניות</button>
      </li>
      <li class="nav-item">
        <button class="nav-link" id="entityTabTrades">טריידים</button>
      </li>
    </ul>
    
    <!-- Tab Content -->
    <div class="tab-content" id="unifiedPendingActionsTabContent">
      <!-- 4 panes for each combination -->
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

### 3. JavaScript

**Option A: דרך Package Manifest (מומלץ)**

הוסף ל-`package-manifest.js`:

```javascript
'my-package': {
  scripts: [
    {
      file: 'widgets/unified-pending-actions-widget.js',
      globalCheck: 'window.UnifiedPendingActionsWidget',
      required: true
    }
  ]
}
```

### 4. אתחול

```javascript
// בעמוד
document.addEventListener('DOMContentLoaded', async () => {
  if (window.UnifiedPendingActionsWidget) {
    await window.UnifiedPendingActionsWidget.init('unifiedPendingActionsWidgetContainer', {
      defaultAction: 'assign',
      defaultEntity: 'plans'
    });
  }
});
```

---

## 🔧 Services Integration

הווידג'ט משתמש ב-services משותפים לטעינת נתונים:

### ExecutionClusteringService

**לשימוש:** Create Trades

```javascript
// טעינת אשכולות
const clusters = await window.ExecutionClusteringService.fetchClusters({ force: true });
const cachedClusters = window.ExecutionClusteringService.getCachedClusters();
```

### ExecutionAssignmentService

**לשימוש:** Assign Trades

```javascript
// טעינת highlights
const highlights = await window.ExecutionAssignmentService.fetchHighlights({ force: true });
const cachedHighlights = window.ExecutionAssignmentService.getCachedHighlights();
```

### TradePlanAssignmentService

**לשימוש:** Assign Plans, Create Plans

```javascript
// טעינת assignments
const assignments = await window.TradePlanAssignmentService.fetchAssignments({ force: true });
const cachedAssignments = window.TradePlanAssignmentService.getCachedAssignments();

// טעינת creations
const creations = await window.TradePlanAssignmentService.fetchCreations({ force: true });
const cachedCreations = window.TradePlanAssignmentService.getCachedCreations();
```

### ExecutionClusterHelpers

**לשימוש:** Rendering של cluster items

```javascript
// רינדור פריט אשכול
const html = window.ExecutionClusterHelpers.renderClusterListItem(cluster, selectedIds, {
  onSelectionChange: (clusterId, executionId, isChecked) => { /* ... */ },
  onOpenTradeModal: (clusterId, clusterData, selectedExecIds) => { /* ... */ },
  onDismiss: (clusterId) => { /* ... */ }
});
```

### PendingActionsCacheService

**לשימוש:** ניהול dismissed items

```javascript
// Dismiss item
await window.PendingActionsCacheService.dismissItem('trade-creation-clusters', clusterId);

// Get dismissed items
const dismissed = await window.PendingActionsCacheService.getDismissed('trade-creation-clusters');
```

---

## 💻 דוגמאות קוד

### דוגמה 1: אתחול בסיסי

```javascript
// בעמוד הבית - אוטומטי דרך page-initialization-configs.js
await window.UnifiedPendingActionsWidget.init();
```

### דוגמה 2: אתחול עם תצורה

```javascript
await window.UnifiedPendingActionsWidget.init('customContainer', {
  defaultItemsLimit: 6,
  defaultAction: 'create',
  defaultEntity: 'trades'
});
```

### דוגמה 3: רענון נתונים

```javascript
// רענון כל הנתונים
await window.UnifiedPendingActionsWidget.refresh();

// עדכון רינדור בלבד
await window.UnifiedPendingActionsWidget.render();
```

### דוגמה 4: בדיקת מצב

```javascript
const state = window.UnifiedPendingActionsWidget.getState();
if (state.initialized) {
  console.log('Active:', `${state.activeAction}-${state.activeEntity}`);
}
```

---

## ⚠️ הערות חשובות

### שימוש ב-Widgets ישנים

**כרגע הווידג'ט עדיין משתמש ב-widgets ישנים כגיבוי:**
- `PendingExecutionTradeCreation` - עבור Create Trades
- `PendingExecutionsHighlights` - עבור Assign Trades
- `PendingTradePlanWidget` - עבור Assign/Create Plans

**תכנית עתידית:** מעבר מלא ל-services ו-ExecutionClusterHelpers בלבד.

**תיעוד ריפקטורינג:** ראה [REFACTORING_PLAN_UNIFIED_WIDGET.md](REFACTORING_PLAN_UNIFIED_WIDGET.md)

---

## 🔧 תלויות

### מערכות כלליות

- **ButtonSystem** (`window.ButtonSystem`) - עיבוד כפתורים
  - `initializeButtons(container)` - אתחול כפתורים

- **Logger** (`window.Logger`) - לוגים
  - `info()`, `warn()`, `error()`, `debug()`

### Services

- **ExecutionClusteringService** - אשכולות ביצועים
- **ExecutionAssignmentService** - שיוך ביצועים
- **TradePlanAssignmentService** - שיוך/יצירת תוכניות
- **ExecutionClusterHelpers** - עזרי רינדור
- **PendingActionsCacheService** - מטמון dismissed items

### Packages

הווידג'ט נטען דרך החבילה `dashboard-widgets`:
- `base`
- `services`
- `entity-services`

---

## 🔧 תיקונים ושיפורים

### 30 בנובמבר 2025 - תיקון user_id Filtering ושיפורים

#### תיקון Backend - user_id Filtering
**בעיה:** `ExecutionClusteringService.get_pending_executions` לא סינן לפי `user_id`, מה שעלול לגרום להצגת ביצועים של משתמשים אחרים.

**תיקון:**
- הוספת פרמטר `user_id` ל-`get_pending_executions` ב-`Backend/services/execution_clustering_service.py`
- הוספת סינון `Execution.user_id == user_id` לשאילתה
- עדכון `get_execution_trade_creation_clusters` להעביר `user_id` ל-`get_pending_executions`
- עדכון API endpoint `/api/executions/pending-assignment/trade-creation-clusters` לקבל `user_id` מ-`g.user_id`

**קבצים שעודכנו:**
- `Backend/services/execution_clustering_service.py`
- `Backend/routes/api/executions.py`

#### שיפורים ב-Frontend
**שיפורים:**
- הוספת לוגים מפורטים ב-`getDataForCombination` ו-`loadCombinationData`
- תיקון `getCachedClusters` ב-`execution-clustering-service.js` להחזיר תמיד array (לא null)
- שיפור טיפול בשגיאות

**קבצים שעודכנו:**
- `trading-ui/scripts/widgets/unified-pending-actions-widget.js`
- `trading-ui/scripts/services/execution-clustering-service.js`

**תוצאה:** ✅ כל התיקונים הושלמו בהצלחה. הוויג'ט עובד נכון עם user_id filtering.

**דוח בדיקות:** [WIDGETS_TESTING_REPORT.md](../../05-REPORTS/WIDGETS_TESTING_REPORT.md)

---

## 📖 תיעוד נוסף

- **רשימת ווידג'טים:** [WIDGETS_LIST.md](../../frontend/WIDGETS_LIST.md)
- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](WIDGET_DEVELOPER_GUIDE.md)
- **מדריך טאבים:** [TAB_SYSTEM_GUIDE.md](../../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)
- **תכנית ריפקטורינג:** [REFACTORING_PLAN_UNIFIED_WIDGET.md](REFACTORING_PLAN_UNIFIED_WIDGET.md)
- **דוח בדיקות:** [WIDGETS_TESTING_REPORT.md](../../05-REPORTS/WIDGETS_TESTING_REPORT.md)

---

**מקור:** `documentation/03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md`  
**עודכן:** 30 בנובמבר 2025

