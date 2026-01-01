# תיעוד API - UnifiedAppInitializer

## UnifiedAppInitializer API Documentation

**תאריך יצירה:** 2025-12-04  
**גרסה:** 1.6.0  
**עודכן:** 2025-12-04

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [Class: UnifiedAppInitializer](#class-unifiedappinitializer)
3. [Properties](#properties)
4. [Methods](#methods)
5. [Global Functions](#global-functions)
6. [Examples](#examples)
7. [Monitoring Tools](#monitoring-tools)
8. [Error Handling](#error-handling)

---

## 🎯 סקירה כללית

`UnifiedAppInitializer` הוא ה-class המרכזי של מערכת האיתחול המאוחדת ב-TikTrack. הוא אחראי על איתחול כל העמודים ב-4 שלבים: Detect → Prepare → Execute → Finalize.

**מיקום:** `trading-ui/scripts/modules/core-systems.js`  
**Package:** `init-system` (loadOrder: 22)  
**תלויות:** רק `base` package

---

## 📦 Class: UnifiedAppInitializer

### Constructor

```javascript
new UnifiedAppInitializer()
```

יוצר instance חדש של UnifiedAppInitializer.

**Returns:** `UnifiedAppInitializer` - Instance חדש

**Example:**

```javascript
const initializer = new UnifiedAppInitializer();
await initializer.initialize();
```

---

## 🔧 Properties

### `initialized`

- **Type:** `boolean`
- **Description:** האם האיתחול הושלם
- **Default:** `false`

### `initializationInProgress`

- **Type:** `boolean`
- **Description:** האם האיתחול בתהליך
- **Default:** `false`

### `pageInfo`

- **Type:** `Object | null`
- **Description:** מידע על העמוד הנוכחי
- **Structure:**

  ```javascript
  {
    name: string,        // שם העמוד
    path: string,        // נתיב העמוד
    filename: string,    // שם הקובץ
    type: string,        // סוג העמוד (trading, development, preferences, dashboard, general)
    requirements: {
      filters: boolean,
      validation: boolean,
      tables: boolean,
      charts: boolean
    }
  }
  ```

### `availableSystems`

- **Type:** `Set<string>`
- **Description:** Set של מערכות זמינות (notification, header, filter, וכו')

### `performanceMetrics`

- **Type:** `Object`
- **Description:** מדדי ביצועים
- **Structure:**

  ```javascript
  {
    startTime: number | null,
    endTime: number | null,
    stageTimes: {
      detect: number,
      prepare: number,
      execute: number,
      finalize: number
    },
    totalTime: number
  }
  ```

### `errorHandlers`

- **Type:** `Array<Function>`
- **Description:** רשימת error handlers

### `customInitializers`

- **Type:** `Array<Function>`
- **Description:** רשימת custom initializers

### `legacySupport`

- **Type:** `boolean`
- **Description:** תמיכה ב-legacy code
- **Default:** `true`

### `_preferencesInitialized`

- **Type:** `boolean`
- **Description:** האם העדפות מאותחלות (private)
- **Default:** `false`

---

## 🎯 Methods

### `initialize()`

נקודת הכניסה המרכזית לאיתחול. מבצע את כל תהליך האיתחול ב-4 שלבים.

**Signature:**

```javascript
async initialize(): Promise<Object>
```

**Returns:** `Promise<Object>` - Status object עם פרטי האיתחול

**Throws:** `Error` - אם האיתחול נכשל

**Example:**

```javascript
const initializer = new UnifiedAppInitializer();
const status = await initializer.initialize();
console.log('Initialization status:', status);
```

**Process:**

1. Stage 1: Detect and Analyze
2. Stage 2: Prepare Configuration
3. Stage 3: Execute Initialization
4. Stage 4: Finalize

---

### `detectAndAnalyze()`

**Stage 1:** זיהוי עמוד וניתוח מערכות זמינות.

**Signature:**

```javascript
async detectAndAnalyze(): Promise<void>
```

**Returns:** `Promise<void>`

**Process:**

- מזהה את העמוד הנוכחי (`detectPageInfo()`)
- מנתח מערכות זמינות (`detectAvailableSystems()`)
- מנתח דרישות העמוד (`analyzePageRequirements()`)

**Example:**

```javascript
await initializer.detectAndAnalyze();
console.log('Page info:', initializer.pageInfo);
console.log('Available systems:', initializer.availableSystems);
```

---

### `prepareConfiguration()`

**Stage 2:** הכנת קונפיגורציה מיטבית.

**Signature:**

```javascript
prepareConfiguration(): Object
```

**Returns:** `Object` - Configuration object עם:

```javascript
{
  pageConfig: Object,           // Page config מ-page-initialization-configs.js
  packages: Array<string>,       // רשימת packages נדרשים
  requiredGlobals: Array<string>, // רשימת globals נדרשים
  customInitializers: Array<Function>, // Custom initializers
  pageType: string,              // סוג העמוד
  sectionsDefaultState: string,  // מצב ברירת מחדל לסקשנים
  accordionMode: boolean,        // האם accordion mode
  // ... שדות נוספים מ-pageConfig
}
```

**Throws:** `Error` - אם page config לא נמצא או לא תקין

**Example:**

```javascript
const config = initializer.prepareConfiguration();
console.log('Required packages:', config.packages);
console.log('Required globals:', config.requiredGlobals);
```

---

### `executeInitialization(config)`

**Stage 3:** ביצוע איתחול בפועל.

**Signature:**

```javascript
async executeInitialization(config: Object): Promise<void>
```

**Parameters:**

- `config` (Object, required) - Configuration object מ-`prepareConfiguration()`

**Returns:** `Promise<void>`

**Process:**

1. Cache System initialization
2. Preferences initialization (אם `config.packages` כולל 'preferences')
3. Application initialization:
   - Header System (אם לא auth page)
   - Notification System
   - Actions Menu System
4. Custom initializers (אם מוגדרים)

**Example:**

```javascript
const config = initializer.prepareConfiguration();
await initializer.executeInitialization(config);
```

---

### `finalizeInitialization(config)`

**Stage 4:** סיום איתחול.

**Signature:**

```javascript
async finalizeInitialization(config: Object): Promise<void>
```

**Parameters:**

- `config` (Object, required) - Configuration object מ-`prepareConfiguration()`

**Returns:** `Promise<void>`

**Process:**

1. State restoration (שחזור מצב סקשנים, וכו')
2. Success notifications (אם נדרש)
3. Performance metrics logging
4. Mark as initialized

**Example:**

```javascript
const config = initializer.prepareConfiguration();
await initializer.executeInitialization(config);
await initializer.finalizeInitialization(config);
```

---

### `initializeModuleConfigs()`

מאתחל את תצורות המודולים לטעינה דינמית (כרגע לא בשימוש - static loading only).

**Signature:**

```javascript
initializeModuleConfigs(): void
```

**Returns:** `void`

**Note:** כרגע לא בשימוש - המערכת משתמשת ב-static loading בלבד.

---

### `initializePreferencesForPage(config)`

מאתחל את מערכת העדפות לעמוד.

**Signature:**

```javascript
async initializePreferencesForPage(config: Object): Promise<void>
```

**Parameters:**

- `config` (Object, required) - Configuration object עם `packages` array

**Returns:** `Promise<void>`

**Process:**

- בודק אם `config.packages` כולל 'preferences'
- טוען העדפות רק אם נדרש
- מונע טעינות כפולות

**Example:**

```javascript
const config = { packages: ['base', 'preferences'] };
await initializer.initializePreferencesForPage(config);
```

---

### `manualInitialization(config)`

איתחול ידני - זרימת איתחול סטנדרטית.

**Signature:**

```javascript
async manualInitialization(config: Object): Promise<void>
```

**Parameters:**

- `config` (Object, required) - Configuration object מ-`prepareConfiguration()`

**Returns:** `Promise<void>`

**Process:**

- Header System (אם לא auth page)
- Notification System
- Actions Menu System
- Custom initializers

**Example:**

```javascript
const config = initializer.prepareConfiguration();
await initializer.manualInitialization(config);
```

---

### `detectPageInfo()`

מזהה את העמוד הנוכחי.

**Signature:**

```javascript
detectPageInfo(): Object
```

**Returns:** `Object` - Page info object:

```javascript
{
  name: string,        // שם העמוד
  path: string,        // נתיב העמוד
  filename: string,    // שם הקובץ
  type: string,        // סוג העמוד
  requirements: {
    filters: boolean,
    validation: boolean,
    tables: boolean,
    charts: boolean
  }
}
```

**Example:**

```javascript
const pageInfo = initializer.detectPageInfo();
console.log('Page name:', pageInfo.name);
console.log('Page type:', pageInfo.type);
```

---

### `detectAvailableSystems()`

מזהה מערכות זמינות.

**Signature:**

```javascript
detectAvailableSystems(): Set<string>
```

**Returns:** `Set<string>` - Set של שמות מערכות זמינות:

- `'notification'` - NotificationSystem
- `'header'` - HeaderSystem
- `'filter'` - FilterSystem
- `'pageFilters'` - initializePageFilters
- `'validation'` - initializeValidation
- `'tables'` - setupSortableHeaders
- `'preferences'` - preferencesCache
- `'indexeddb'` - IndexedDB
- `'uiUtils'` - toggleSection
- `'notifications'` - showNotification
- `'actionsMenu'` - ActionsMenuSystem

**Example:**

```javascript
const systems = initializer.detectAvailableSystems();
console.log('Available systems:', Array.from(systems));
```

---

### `analyzePageRequirements()`

מנתח את דרישות העמוד.

**Signature:**

```javascript
analyzePageRequirements(): void
```

**Returns:** `void`

**Note:** כרגע רק לוג - הדרישות נקבעות ב-`detectPageInfo()`.

---

### `determinePageType(pageName)`

קובע את סוג העמוד.

**Signature:**

```javascript
determinePageType(pageName: string): string
```

**Parameters:**

- `pageName` (string, required) - שם העמוד

**Returns:** `string` - סוג העמוד:

- `'trading'` - עמודי מסחר (trades, executions, alerts)
- `'development'` - עמודי פיתוח (system-management, crud-testing-dashboard, וכו')
- `'preferences'` - עמוד העדפות
- `'dashboard'` - דשבורד ראשי
- `'general'` - עמוד כללי (ברירת מחדל)

**Example:**

```javascript
const pageType = initializer.determinePageType('trades');
console.log('Page type:', pageType); // 'trading'
```

---

### `requiresFilters(pageName)`

בודק אם העמוד דורש פילטרים.

**Signature:**

```javascript
requiresFilters(pageName: string): boolean
```

**Parameters:**

- `pageName` (string, required) - שם העמוד

**Returns:** `boolean` - `true` אם העמוד דורש פילטרים

**Example:**

```javascript
const needsFilters = initializer.requiresFilters('trades');
if (needsFilters) {
  // Initialize filters
}
```

---

### `requiresValidation(pageName)`

בודק אם העמוד דורש ולידציה.

**Signature:**

```javascript
requiresValidation(pageName: string): boolean
```

**Parameters:**

- `pageName` (string, required) - שם העמוד

**Returns:** `boolean` - `true` אם העמוד דורש ולידציה

**Example:**

```javascript
const needsValidation = initializer.requiresValidation('trades');
if (needsValidation) {
  // Initialize validation
}
```

---

### `requiresTables(pageName)`

בודק אם העמוד דורש טבלאות.

**Signature:**

```javascript
requiresTables(pageName: string): boolean
```

**Parameters:**

- `pageName` (string, required) - שם העמוד

**Returns:** `boolean` - `true` אם העמוד דורש טבלאות

**Example:**

```javascript
const needsTables = initializer.requiresTables('trades');
if (needsTables) {
  // Initialize tables
}
```

---

### `requiresCharts(pageName)`

בודק אם העמוד דורש גרפים.

**Signature:**

```javascript
requiresCharts(pageName: string): boolean
```

**Parameters:**

- `pageName` (string, required) - שם העמוד

**Returns:** `boolean` - `true` אם העמוד דורש גרפים

**Example:**

```javascript
const needsCharts = initializer.requiresCharts('index');
if (needsCharts) {
  // Initialize charts
}
```

---

### `handleError(error)`

מטפל בשגיאות איתחול.

**Signature:**

```javascript
handleError(error: Error): void
```

**Parameters:**

- `error` (Error, required) - שגיאת איתחול

**Returns:** `void`

**Process:**

- לוגים את השגיאה
- מריץ error handlers רשומים
- מציג הודעת שגיאה למשתמש

**Example:**

```javascript
try {
  await initializer.initialize();
} catch (error) {
  initializer.handleError(error);
}
```

---

### `getStatus()`

מחזיר את סטטוס האיתחול הנוכחי.

**Signature:**

```javascript
getStatus(): Object
```

**Returns:** `Object` - Status object:

```javascript
{
  initialized: boolean,
  initializationInProgress: boolean,
  pageInfo: Object | null,
  availableSystems: Set<string>,
  performanceMetrics: Object
}
```

**Example:**

```javascript
const status = initializer.getStatus();
console.log('Initialized:', status.initialized);
console.log('Page info:', status.pageInfo);
```

---

### `reset()`

מאפס את מצב האיתחול.

**Signature:**

```javascript
reset(): void
```

**Returns:** `void`

**Note:** שימושי לבדיקות ודיבוג בלבד.

**Example:**

```javascript
initializer.reset();
await initializer.initialize();
```

---

## 🌐 Global Functions

### `window.initializeUnifiedApp()`

נקודת הכניסה הגלובלית לאיתחול המערכת.

**Signature:**

```javascript
async function initializeUnifiedApp(): Promise<Object>
```

**Returns:** `Promise<Object>` - Status object עם פרטי האיתחול

**Throws:** `Error` - אם האיתחול נכשל

**Example:**

```javascript
// האיתחול מתבצע אוטומטית ב-DOMContentLoaded
// או ניתן לקרוא ישירות:
await window.initializeUnifiedApp();
```

**Note:** האיתחול מתבצע אוטומטית ב-`DOMContentLoaded` או ישירות אם הקובץ נטען מאוחר.

---

### `window.getUnifiedAppStatus()`

מחזיר את סטטוס האיתחול הגלובלי.

**Signature:**

```javascript
function getUnifiedAppStatus(): Object
```

**Returns:** `Object` - Status object (זהה ל-`getStatus()`)

**Example:**

```javascript
const status = window.getUnifiedAppStatus();
console.log('Initialized:', status.initialized);
```

---

### `window.clearUnifiedAppState()`

מנקה את מצב האיתחול הגלובלי.

**Signature:**

```javascript
function clearUnifiedAppState(): void
```

**Returns:** `void`

**Note:** שימושי לבדיקות ודיבוג בלבד.

**Example:**

```javascript
window.clearUnifiedAppState();
await window.initializeUnifiedApp();
```

---

## 📝 Examples

### Example 1: Basic Initialization

```javascript
// האיתחול מתבצע אוטומטית
// או ניתן לקרוא ישירות:
await window.initializeUnifiedApp();
```

### Example 2: Custom Initialization

```javascript
const initializer = new UnifiedAppInitializer();

// Stage 1: Detect and Analyze
await initializer.detectAndAnalyze();
console.log('Page:', initializer.pageInfo.name);
console.log('Systems:', Array.from(initializer.availableSystems));

// Stage 2: Prepare Configuration
const config = initializer.prepareConfiguration();
console.log('Packages:', config.packages);

// Stage 3: Execute Initialization
await initializer.executeInitialization(config);

// Stage 4: Finalize
await initializer.finalizeInitialization(config);
```

### Example 3: Check Status

```javascript
const status = window.getUnifiedAppStatus();
if (status.initialized) {
  console.log('Application initialized successfully');
  console.log('Page:', status.pageInfo.name);
  console.log('Total time:', status.performanceMetrics.totalTime, 'ms');
}
```

### Example 4: Error Handling

```javascript
try {
  await window.initializeUnifiedApp();
} catch (error) {
  console.error('Initialization failed:', error);
  // Error is automatically handled by UnifiedAppInitializer
}
```

### Example 5: Custom Initializers

```javascript
// ב-page-initialization-configs.js:
'my-page': {
  packages: ['base', 'services'],
  customInitializers: [
    async (pageConfig) => {
      // Custom initialization code
      await window.initializeMyPage();
    }
  ]
}
```

---

## 🔍 Monitoring Tools

### DependencyAnalyzer

כלי לבדיקת תלויות בין חבילות וסקריפטים.

```javascript
const analyzer = new DependencyAnalyzer();
const result = analyzer.analyze();

console.log(result);
// Output:
// {
//   "missing": ["jquery.js"],
//   "circular": [],
//   "unused": ["old-lib.js"],
//   "valid": true
// }
```

### LoadOrderValidator

כלי לבדיקת סדר טעינה מול התצורה הצפויה.

```javascript
const validator = new LoadOrderValidator();
const result = validator.compareLoadOrder();

console.log(result);
// Output:
// {
//   "configOrder": ["base", "auth", "header", "init-system"],
//   "actualOrder": ["base", "auth", "header", "init-system"],
//   "matches": true,
//   "violations": []
// }
```

**חשוב:** כלי הניטור משווים תצורה מול DOM בפועל - הם לא טוענים סקריפטים בעצמם.

## ⚠️ Error Handling

### Common Errors

#### 1. Page Config Not Found

**Error:** `Page config not found for page: <pageName>`

**Solution:** וודא שה-page config מוגדר ב-`page-initialization-configs.js`

#### 2. Missing Dependencies

**Error:** `Missing required dependency: <dependency>`

**Solution:** וודא שה-package מוגדר ב-`package-manifest.js` ונטען לפני `init-system`

#### 3. Initialization Already in Progress

**Warning:** `Initialization already in progress`

**Solution:** האיתחול כבר בתהליך - אין צורך לקרוא שוב

#### 4. DOM Not Ready

**Error:** `DOM is not ready`

**Solution:** האיתחול מתבצע אוטומטית ב-`DOMContentLoaded` - אין צורך לקרוא ידנית

---

## 🔗 Related Documentation

- **ארכיטקטורה מלאה:** `documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_INITIALIZATION_SYSTEM.md`
- **מדריך מפתחים:** `documentation/02-ARCHITECTURE/FRONTEND/INITIALIZATION_SYSTEM_DEVELOPER_GUIDE.md`
- **דוח סיום Refactor:** `documentation/05-REPORTS/INIT_REFACTOR_COMPLETION_REPORT.md`
- **דוח ביצועים:** `documentation/05-REPORTS/INIT_PERFORMANCE_COMPARISON.md`

---

**תאריך עדכון אחרון:** 2025-12-04  
**גרסה:** 1.6.0  
**סטטוס:** ✅ מעודכן ומתועד

