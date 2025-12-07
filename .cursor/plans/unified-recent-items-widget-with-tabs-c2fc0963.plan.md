<!-- c2fc0963-4cfd-46b5-ae3b-78ec27cfb605 28a984bf-4e37-4561-8958-c5c2d107908c -->
# תוכנית מימוש - ווידג'ט פעולות ממתינות מאוחד

## מטרה

יצירת ווידג'ט חדש שמאחד 3 ווידג'טים קיימים:

1. **Pending Executions Highlights Widget** - שיוך ביצועים לטריידים
2. **Pending Execution Trade Creation Widget** - יצירת טרייד מביצועים  
3. **Pending Trade Plan Widget** - שיוך/יצירת תוכניות מתוך טריידים

**חשוב:** הקוד הקיים לא ייפגע - הווידג'ט החדש יתווסף בצורה נפרדת.

## מבנה הטאבים

### טאבים מקוננים עם זוגות תקינים

- **שורה עליונה:** סוג פעולה
  - "שיוך" (Assign)
  - "יצירת חדש" (Create)

- **שורה תחתונה:** סוג ישות (משתנה לפי הבחירה העליונה)
  - אם "שיוך" נבחר: "תוכניות" / "טריידים"
  - אם "יצירת חדש" נבחר: "תוכניות" / "טריידים"

### 4 קומבינציות אפשריות

1. שיוך → תוכניות
2. שיוך → טריידים
3. יצירת חדש → תוכניות
4. יצירת חדש → טריידים

**תמיד זוג אחד פעיל** - פעולה אחת + ישות אחת.

## קבצים ליצירה

### 1. JavaScript Widget File

**מיקום:** `trading-ui/scripts/widgets/unified-pending-actions-widget.js`

**תוכן:**

- Module Pattern (IIFE) לפי הסטנדרט
- State management מקומי
- Cache DOM elements
- ניהול 4 קומבינציות טאבים
- אינטגרציה עם כל ה-APIs הקיימים
- ממשק אחיד לכל הקומבינציות

### 2. CSS File

**מיקום:** `trading-ui/styles-new/06-components/_unified-pending-actions-widget.css`

**תוכן:**

- סגנונות לטאבים המקוננים
- הבדלה ויזואלית בין זוגות טאבים
- סגנונות לרשימה expandable (hover details)
- Responsive design

### 3. Developer Guide

**מיקום:** `documentation/03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md`

**תוכן:**

- סקירה כללית
- ארכיטקטורה
- API documentation
- דוגמאות קוד
- Customization

## מבנה HTML

### Container Structure

```html
<div class="card h-100" id="unifiedPendingActionsWidgetContainer">
  <div class="card-header">
    <!-- Title + Badge -->
    <!-- Nested Bootstrap Tabs -->
    <!-- Row 1: Action Type (Assign/Create) -->
    <!-- Row 2: Entity Type (Plans/Trades) - Dynamic -->
  </div>
  <div class="card-body">
    <!-- Tab Content Panes (4 combinations) -->
    <!-- Loading/Error/Empty states -->
    <!-- List with expandable details -->
  </div>
</div>
```

### Tab Structure

- שורה עליונה: `#unifiedPendingActionsActionTabs`
  - `#actionTabAssign`
  - `#actionTabCreate`

- שורה תחתונה: `#unifiedPendingActionsEntityTabs`
  - `#entityTabPlans` / `#entityTabTrades` (dynamic visibility)

- Content Panes:
  - `#paneAssignPlans`
  - `#paneAssignTrades`
  - `#paneCreatePlans`
  - `#paneCreateTrades`

## API Integration

### Endpoints להתחברות

**1. שיוך → תוכניות:**

- `/api/trades/pending-plan/assignments`

**2. שיוך → טריידים:**

- `/api/executions/pending-assignment/highlights`

**3. יצירת חדש → תוכניות:**

- `/api/trades/pending-plan/creations`

**4. יצירת חדש → טריידים:**

- `/api/executions/pending-assignment/trade-creation-clusters`

### Data Flow

- כל קומבינציה טוענת נתונים מה-API המתאים
- Cache נפרד לכל קומבינציה
- Auto-refresh (60 שניות)
- Dismissed items per combination

## ממשק אחיד

### רשימה עם פרטים נפתחים

- כל רשומה עם summary view
- Hover/focus מגלה details panel
- פרטים נוספים: ticker, account, dates, stats
- Styling אחיד לכל 4 הקומבינציות

### כפתורי פעולה

- **APPROVE** (קבלה) - `data-button-type="APPROVE"`
- **REJECT** (דחיה) - `data-button-type="REJECT"`
- עיבוד דרך ButtonSystem
- פעולות מותאמות לכל קומבינציה

### הגדרת מספר רשומות

- Config parameter: `defaultItemsLimit` (ברירת מחדל: 4)
- ניתן להגדיר ב-init config
- כל קומבינציה יכולה להיות שונה

## אינטגרציה עם מערכות כלליות

### חובה להשתמש ב:

1. **FieldRendererService** - עיצוב שדות
2. **ButtonSystem** - עיבוד כפתורים
3. **NotificationSystem** - הודעות
4. **ModalManagerV2** - פתיחת מודלים
5. **UnifiedCacheManager** - ניהול cache
6. **CacheSyncManager** - סנכרון cache
7. **Logger** - לוגים

### תלויות נוספות:

- `SelectPopulatorService` (למודלים)
- `CRUDResponseHandler` (טיפול בתגובות)
- `entityDetailsAPI` (פרטי ישויות)

## State Management

```javascript
const state = {
  initialized: false,
  activeAction: 'assign', // 'assign' | 'create'
  activeEntity: 'plans',  // 'plans' | 'trades'
  
  // Data per combination
  assignPlans: [],
  assignTrades: [],
  createPlans: [],
  createTrades: [],
  
  // Loading states
  loading: {
    assignPlans: false,
    assignTrades: false,
    createPlans: false,
    createTrades: false
  },
  
  // Dismissed items
  dismissed: new Map(), // key: combination-key, value: Set of item keys
  
  // Configuration
  config: {
    defaultItemsLimit: 4,
    autoRefreshInterval: 60000
  }
};
```

## פונקציונליות עיקרית

### 1. Tab Management

- ניהול בחירת טאבים (action + entity)
- עדכון entity tabs לפי action selection
- שמירת מצב בחירה
- Lazy loading של נתונים לפי בחירה

### 2. Data Fetching

- `fetchDataForCombination(action, entity)`
- Cache per combination
- Error handling נפרד
- Loading states נפרדים

### 3. Rendering

- `renderCombination(action, entity)`
- `renderListItem(item, combination)`
- `renderExpandableDetails(item, combination)`
- ממשק אחיד לכל הקומבינציות

### 4. Actions

- `handleApprove(item, combination)`
- `handleReject(item, combination)`
- `handleDismiss(item, combination)`
- פעולות מותאמות לכל סוג

## אינטגרציה במערכת

### 1. Package Manifest

**קובץ:** `trading-ui/scripts/init-system/package-manifest.js`

הוספה ל-package `dashboard-widgets`:

```javascript
{
  file: 'widgets/unified-pending-actions-widget.js',
  globalCheck: 'window.UnifiedPendingActionsWidget',
  description: 'Unified widget for pending assignments and creations',
  required: false,
  loadOrder: 5
}
```

### 2. Page Config

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

הוספה ל-page `index`:

```javascript
'index': {
  packages: ['base', 'dashboard-widgets'],
  requiredGlobals: ['window.UnifiedPendingActionsWidget'],
  customInitializers: [
    async () => {
      if (window.UnifiedPendingActionsWidget) {
        window.UnifiedPendingActionsWidget.init('unifiedPendingActionsWidgetContainer', {
          defaultItemsLimit: 4,
          defaultAction: 'assign',
          defaultEntity: 'plans'
        });
      }
    }
  ]
}
```

### 3. HTML Structure

**קובץ:** `trading-ui/index.html`

הוספה ל-main section (לפני או אחרי הווידג'טים הקיימים - לא במקום):

```html
<div class="col-12 col-lg-6">
  <div class="card h-100" id="unifiedPendingActionsWidgetContainer">
    <!-- Full widget structure -->
  </div>
</div>
```

## תיעוד

### 1. Developer Guide

מדריך מפורט עם:

- Overview
- Architecture
- API Reference
- Code Examples
- Customization Options

### 2. WIDGETS_LIST.md Update

הוספת הווידג'ט לרשימה:

- שם, קבצים, דוקומנטציה, סטטוס

## סטנדרטים ועמידה בחוקים

### עמידה בסטנדרטים

- ✅ Module Pattern (IIFE)
- ✅ Bootstrap Tabs
- ✅ שימוש במערכות כלליות
- ✅ Cache DOM elements
- ✅ Error handling
- ✅ Logger integration

### חוקי ממשק משתמש

- ✅ כפתורים בשורה (inline)
- ✅ צבעים מהלוגו
- ✅ RTL support
- ✅ Responsive design
- ✅ Accessible markup

### חוקי קוד

- ✅ אין mock data
- ✅ תיעוד באנגלית
- ✅ Function index
- ✅ אין inline scripts/styles

## שלבי מימוש

### Phase 1: מבנה בסיסי

1. יצירת קובץ JS עם Module Pattern
2. יצירת מבנה HTML בסיסי
3. יצירת קובץ CSS בסיסי
4. אינטגרציה ב-Package Manifest

### Phase 2: Tab System

1. יישום טאבים מקוננים
2. ניהול state של בחירות
3. עדכון דינמי של entity tabs
4. הבדלה ויזואלית בין זוגות

### Phase 3: Data Integration

1. אינטגרציה עם כל 4 ה-APIs
2. Data fetching per combination
3. Cache management
4. Error handling

### Phase 4: Rendering

1. ממשק אחיד לרשימות
2. Expandable details (hover)
3. כפתורי קבלה/דחיה
4. Loading/Error/Empty states

### Phase 5: Actions & Logic

1. פעולות מותאמות לכל קומבינציה
2. Modal opening (למודלים)
3. Cache invalidation
4. Auto-refresh

### Phase 6: Polish & Documentation

1. CSS refinements
2. Responsive adjustments
3. Developer guide
4. WIDGETS_LIST update

## בדיקות

### Functional Tests

- [ ] כל 4 הקומבינציות טוענות נתונים
- [ ] טאבים עובדים כראוי
- [ ] Expandable details עובד
- [ ] כפתורי קבלה/דחיה עובדים
- [ ] Cache invalidation אחרי פעולות
- [ ] Auto-refresh עובד

### UI/UX Tests

- [ ] הבדלה ברורה בין זוגות טאבים
- [ ] Responsive ב-mobile
- [ ] RTL support
- [ ] Accessibility

### Integration Tests

- [ ] עובד עם כל המערכות הכלליות
- [ ] לא פוגע בקוד קיים
- [ ] עובד במקביל לווידג'טים הקיימים

## הערות חשובות

1. **לא לגעת בקוד קיים** - הווידג'ט החדש נפרד לגמרי
2. **4 קומבינציות נפרדות** - כל אחת עם data/state/loading נפרד
3. **ממשק אחיד** - אותו עיצוב לכל הקומבינציות
4. **תמיד זוג תקין** - action אחד + entity אחד פעיל
5. **הגדרה נוחה** - config parameter למספר רשומות

### To-dos

- [ ] יצירת קובץ JavaScript הראשי - trading-ui/scripts/widgets/unified-pending-actions-widget.js עם Module Pattern (IIFE), State Management, ו-DOM caching
- [ ] יצירת קובץ CSS - trading-ui/styles-new/06-components/_unified-pending-actions-widget.css עם סגנונות לטאבים מקוננים והבדלה ויזואלית
- [ ] יצירת מבנה HTML מלא ב-index.html עם טאבים מקוננים (action + entity) ו-4 content panes
- [ ] יישום מערכת הטאבים המקוננים - ניהול בחירות, עדכון דינמי של entity tabs, הבדלה ויזואלית
- [ ] אינטגרציה עם כל 4 ה-APIs (assign plans, assign trades, create plans, create trades) עם data fetching נפרד לכל קומבינציה
- [ ] יישום ממשק אחיד לרשימות - renderListItem, renderExpandableDetails, loading/error/empty states
- [ ] יישום פעולות (APPROVE/REJECT/DISMISS) מותאמות לכל קומבינציה עם אינטגרציה למערכות כלליות
- [ ] הוספה ל-Package Manifest ב-dashboard-widgets package
- [ ] הוספה ל-Page Initialization Configs בעמוד index עם config parameters
- [ ] יצירת מדריך מפתח מפורט - documentation/03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md
- [ ] עדכון WIDGETS_LIST.md עם הווידגט החדש כולל קבצים, דוקומנטציה וסטטוס
- [ ] בדיקות פונקציונליות, UI/UX, integration tests ו-polish סופי (CSS, responsive, accessibility)