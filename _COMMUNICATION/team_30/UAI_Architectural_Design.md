# Unified App Init (UAI) - Architectural Design

**Team:** 30 (Frontend Execution)  
**Date:** 2026-01-31  
**Version:** v1.0.0  
**Status:** 📋 **ARCHITECTURAL DESIGN**

---

## 📋 Executive Summary

**Problem Statement:**
המערכת הנוכחית סובלת מ-Race Conditions בעת טעינת עמודים. כל עמוד מטפל בעצמו באתחול ללא lifecycle management מרכזי, מה שמוביל לבעיות:
- קבצים נטענים בסדר לא מוגדר
- אין הבטחה שכל הרכיבים מוכנים לפני שימוש
- קוד כפול בכל עמוד
- קושי בתחזוקה ובדיבוג

**Solution:**
יצירת Unified App Init (UAI) - מערכת מרכזית לניהול lifecycle של עמודים ב-5 שלבים מוגדרים:
1. **DOM** - טעינת DOM והכנת המבנה
2. **Bridge** - אתחול PhoenixBridge וניהול state
3. **Data** - טעינת נתונים מה-API
4. **Render** - רינדור הטבלאות והאלמנטים
5. **Ready** - סיום אתחול והצגת העמוד

---

## 🏗️ Architecture Overview

### Core Principle: Sequential Lifecycle with Promise Chain

```
┌─────────────────────────────────────────────────────────────┐
│                    UAI Lifecycle Manager                    │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐│
│  │   DOM    │───▶│  Bridge  │───▶│   Data   │───▶│  Render  ││
│  │  Ready   │    │   Init   │    │   Load   │    │  Update  ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘│
│       │               │               │               │       │
│       └───────────────┴───────────────┴───────────────┘       │
│                           │                                   │
│                    ┌──────────┐                              │
│                    │  Ready   │                              │
│                    │  Signal  │                              │
│                    └──────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions:

1. **Sequential Execution:** כל שלב ממתין להשלמת השלב הקודם
2. **Promise-Based:** שימוש ב-Promises/Async-Await למניעת Race Conditions
3. **Event-Driven:** Custom Events לתקשורת בין רכיבים
4. **Dependency Injection:** כל רכיב מקבל את התלויות שלו
5. **Lifecycle Hooks:** נקודות התערבות לכל שלב

---

## 📐 Detailed Architecture

### 1. Core Classes

#### 1.1 `UnifiedAppInit` (Main Controller)

**Purpose:** מנהל את כל lifecycle של העמוד

**Location:** `ui/src/components/core/UnifiedAppInit.js`

**Responsibilities:**
- ניהול רצף השלבים
- טיפול בשגיאות
- לוגינג ודיבוג
- ניהול state גלובלי

**API:**
```javascript
class UnifiedAppInit {
  constructor(config) {
    this.config = config;
    this.currentStage = null;
    this.stages = {
      DOM: new DOMStage(),
      Bridge: new BridgeStage(),
      Data: new DataStage(),
      Render: new RenderStage(),
      Ready: new ReadyStage()
    };
  }
  
  async init() {
    // Sequential execution
    await this.stages.DOM.execute();
    await this.stages.Bridge.execute();
    await this.stages.Data.execute();
    await this.stages.Render.execute();
    await this.stages.Ready.execute();
  }
  
  getStage(stageName) {
    return this.stages[stageName];
  }
  
  onStageComplete(stageName, callback) {
    // Lifecycle hook
  }
}
```

**Dependencies:**
- `DOMStage`
- `BridgeStage`
- `DataStage`
- `RenderStage`
- `ReadyStage`

---

#### 1.2 `DOMStage` (Stage 1: DOM Ready)

**Purpose:** ממתין ל-DOM להיות מוכן ומכין את המבנה הבסיסי

**Location:** `ui/src/components/core/stages/DOMStage.js`

**Responsibilities:**
- בדיקת DOM readiness
- טעינת authGuard
- טעינת header (אם נדרש)
- הכנת containers בסיסיים

**API:**
```javascript
class DOMStage {
  constructor() {
    this.name = 'DOM';
    this.status = 'pending';
  }
  
  async execute() {
    this.status = 'running';
    
    // Wait for DOM
    await this.waitForDOM();
    
    // Load auth guard
    await this.loadAuthGuard();
    
    // Load header (if needed)
    await this.loadHeader();
    
    // Prepare containers
    this.prepareContainers();
    
    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name });
  }
  
  async waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve);
      }
    });
  }
  
  async loadAuthGuard() {
    // Load and execute authGuard.js
    // Wait for authentication check to complete
  }
  
  async loadHeader() {
    // Load headerLoader.js if needed
    // Wait for header to be injected
  }
  
  prepareContainers() {
    // Ensure required containers exist
    // Prepare page structure
  }
}
```

**Dependencies:**
- `authGuard.js`
- `headerLoader.js` (optional)

**Events Emitted:**
- `uai:dom:ready` - DOM מוכן
- `uai:dom:auth-complete` - אימות הושלם
- `uai:dom:header-loaded` - Header נטען

**Events Listened:**
- אין (שלב ראשון)

---

#### 1.3 `BridgeStage` (Stage 2: Bridge Init)

**Purpose:** מאתחל את PhoenixBridge ומוכן לתקשורת בין רכיבים

**Location:** `ui/src/components/core/stages/BridgeStage.js`

**Responsibilities:**
- אתחול PhoenixBridge
- טעינת phoenixFilterBridge.js
- הכנת state management
- הכנת event system

**API:**
```javascript
class BridgeStage {
  constructor() {
    this.name = 'Bridge';
    this.status = 'pending';
    this.bridge = null;
  }
  
  async execute() {
    this.status = 'running';
    
    // Wait for DOM stage to complete
    await this.waitForStage('DOM');
    
    // Initialize PhoenixBridge
    await this.initPhoenixBridge();
    
    // Load filter bridge
    await this.loadFilterBridge();
    
    // Setup event system
    this.setupEventSystem();
    
    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name, bridge: this.bridge });
  }
  
  async waitForStage(stageName) {
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.detail.stage === stageName) {
          window.removeEventListener('uai:stage-complete', handler);
          resolve();
        }
      };
      window.addEventListener('uai:stage-complete', handler);
      
      // If stage already completed, resolve immediately
      if (window.UAI?.getStage(stageName)?.status === 'completed') {
        window.removeEventListener('uai:stage-complete', handler);
        resolve();
      }
    });
  }
  
  async initPhoenixBridge() {
    // Ensure window.PhoenixBridge exists
    if (!window.PhoenixBridge) {
      // Load phoenixFilterBridge.js
      await this.loadScript('/src/components/core/phoenixFilterBridge.js');
    }
    this.bridge = window.PhoenixBridge;
  }
  
  async loadFilterBridge() {
    // Ensure filter bridge is loaded
    if (!window.PhoenixBridge) {
      throw new Error('PhoenixBridge not initialized');
    }
  }
  
  setupEventSystem() {
    // Setup global event listeners
    // Prepare for cross-component communication
  }
}
```

**Dependencies:**
- `DOMStage` (must complete first)
- `phoenixFilterBridge.js`

**Events Emitted:**
- `uai:bridge:ready` - Bridge מוכן
- `uai:bridge:state-updated` - State עודכן

**Events Listened:**
- `uai:stage-complete` (from DOMStage)

---

#### 1.4 `DataStage` (Stage 3: Data Load)

**Purpose:** טוען את כל הנתונים הנדרשים מה-API

**Location:** `ui/src/components/core/stages/DataStage.js`

**Responsibilities:**
- זיהוי סוג העמוד
- טעינת data loader המתאים
- טעינת נתונים מה-API
- המרת נתונים (transformers)
- אחסון נתונים ב-state

**API:**
```javascript
class DataStage {
  constructor() {
    this.name = 'Data';
    this.status = 'pending';
    this.data = {};
    this.loaders = {};
  }
  
  async execute() {
    this.status = 'running';
    
    // Wait for Bridge stage to complete
    await this.waitForStage('Bridge');
    
    // Identify page type
    const pageType = this.identifyPageType();
    
    // Load appropriate data loader
    await this.loadDataLoader(pageType);
    
    // Fetch data from API
    await this.fetchData(pageType);
    
    // Transform data
    this.transformData();
    
    // Store in state
    this.storeData();
    
    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name, data: this.data });
  }
  
  identifyPageType() {
    // Detect page type from URL or data attribute
    const path = window.location.pathname;
    const pageMap = {
      '/cash_flows': 'cashFlows',
      '/brokers_fees': 'brokersFees',
      '/trading_accounts': 'tradingAccounts'
    };
    return pageMap[path] || 'default';
  }
  
  async loadDataLoader(pageType) {
    const loaderPath = this.getLoaderPath(pageType);
    if (loaderPath) {
      await this.loadScript(loaderPath);
      this.loaders[pageType] = window[`${pageType}DataLoader`] || window[`load${this.capitalize(pageType)}Data`];
    }
  }
  
  async fetchData(pageType) {
    const loader = this.loaders[pageType];
    if (!loader) {
      throw new Error(`Data loader not found for page type: ${pageType}`);
    }
    
    // Get filters from Bridge
    const filters = window.PhoenixBridge?.state?.filters || {};
    
    // Fetch data
    this.data = await loader(filters);
  }
  
  transformData() {
    // Data is already transformed by transformers.js in data loader
    // This stage just ensures transformers are available
  }
  
  storeData() {
    // Store data in global state or Bridge
    if (window.PhoenixBridge) {
      window.PhoenixBridge.state.pageData = this.data;
    }
    window.UAIState = window.UAIState || {};
    window.UAIState.data = this.data;
  }
  
  getLoaderPath(pageType) {
    const loaderMap = {
      'cashFlows': '/src/views/financial/cashFlows/cashFlowsDataLoader.js',
      'brokersFees': '/src/views/financial/brokersFees/brokersFeesDataLoader.js',
      'tradingAccounts': '/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js'
    };
    return loaderMap[pageType];
  }
}
```

**Dependencies:**
- `BridgeStage` (must complete first)
- Data loader modules (dynamic)
- `transformers.js`

**Events Emitted:**
- `uai:data:loaded` - נתונים נטענו
- `uai:data:error` - שגיאה בטעינת נתונים

**Events Listened:**
- `uai:stage-complete` (from BridgeStage)

---

#### 1.5 `RenderStage` (Stage 4: Render Update)

**Purpose:** מרנדר את הטבלאות והאלמנטים עם הנתונים

**Location:** `ui/src/components/core/stages/RenderStage.js`

**Responsibilities:**
- זיהוי רכיבי UI שצריכים רינדור
- טעינת table init modules
- אתחול טבלאות
- עדכון UI עם נתונים
- אתחול event handlers

**API:**
```javascript
class RenderStage {
  constructor() {
    this.name = 'Render';
    this.status = 'pending';
    this.components = {};
  }
  
  async execute() {
    this.status = 'running';
    
    // Wait for Data stage to complete
    await this.waitForStage('Data');
    
    // Identify UI components
    const components = this.identifyComponents();
    
    // Load component initializers
    await this.loadComponentInitializers(components);
    
    // Initialize components
    await this.initializeComponents(components);
    
    // Render data
    await this.renderData();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name });
  }
  
  identifyComponents() {
    const components = [];
    
    // Check for tables
    if (document.querySelector('.js-table')) {
      components.push('table');
    }
    
    // Check for filters
    if (document.querySelector('.js-filter')) {
      components.push('filter');
    }
    
    // Check for summary
    if (document.querySelector('.info-summary')) {
      components.push('summary');
    }
    
    return components;
  }
  
  async loadComponentInitializers(components) {
    const pageType = window.UAIState?.pageType || this.detectPageType();
    
    for (const component of components) {
      if (component === 'table') {
        const initPath = this.getTableInitPath(pageType);
        if (initPath) {
          await this.loadScript(initPath);
        }
      }
      
      if (component === 'filter') {
        const handlerPath = this.getFilterHandlerPath(pageType);
        if (handlerPath) {
          await this.loadScript(handlerPath);
        }
      }
    }
  }
  
  async initializeComponents(components) {
    // Initialize each component
    for (const component of components) {
      if (component === 'table') {
        // Table initialization is handled by tableInit modules
        // They listen to uai:data:loaded event
      }
    }
  }
  
  async renderData() {
    // Emit event to trigger rendering
    const data = window.UAIState?.data;
    if (data) {
      window.dispatchEvent(new CustomEvent('uai:render:data-ready', {
        detail: { data }
      }));
    }
  }
  
  setupEventHandlers() {
    // Setup global event handlers
    // Connect filters to tables
    // Connect actions to handlers
  }
  
  getTableInitPath(pageType) {
    const initMap = {
      'cashFlows': '/src/views/financial/cashFlows/cashFlowsTableInit.js',
      'brokersFees': '/src/views/financial/brokersFees/brokersFeesTableInit.js',
      'tradingAccounts': '/src/views/financial/tradingAccounts/tradingAccountsTableInit.js'
    };
    return initMap[pageType];
  }
  
  getFilterHandlerPath(pageType) {
    const handlerMap = {
      'cashFlows': '/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js',
      'brokersFees': '/src/views/financial/brokersFees/brokersFeesHeaderHandlers.js',
      'tradingAccounts': '/src/views/financial/tradingAccounts/tradingAccountsHeaderHandlers.js'
    };
    return handlerMap[pageType];
  }
}
```

**Dependencies:**
- `DataStage` (must complete first)
- Table init modules (dynamic)
- Filter handler modules (dynamic)
- `PhoenixTableSortManager.js`
- `PhoenixTableFilterManager.js`

**Events Emitted:**
- `uai:render:data-ready` - נתונים מוכנים לרינדור
- `uai:render:complete` - רינדור הושלם

**Events Listened:**
- `uai:stage-complete` (from DataStage)
- `uai:data:loaded`

---

#### 1.6 `ReadyStage` (Stage 5: Ready Signal)

**Purpose:** מסמן שהעמוד מוכן ומאפשר אינטראקציה

**Location:** `ui/src/components/core/stages/ReadyStage.js`

**Responsibilities:**
- בדיקת שכל השלבים הושלמו
- הסרת loading indicators
- הפעלת Lucide icons
- סימון העמוד כ-ready
- טריגר event סיום

**API:**
```javascript
class ReadyStage {
  constructor() {
    this.name = 'Ready';
    this.status = 'pending';
  }
  
  async execute() {
    this.status = 'running';
    
    // Wait for Render stage to complete
    await this.waitForStage('Render');
    
    // Verify all stages completed
    this.verifyStages();
    
    // Remove loading indicators
    this.removeLoadingIndicators();
    
    // Initialize Lucide icons
    await this.initLucideIcons();
    
    // Mark page as ready
    this.markPageReady();
    
    // Emit ready event
    this.emitReady();
    
    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name });
  }
  
  verifyStages() {
    const stages = ['DOM', 'Bridge', 'Data', 'Render'];
    for (const stage of stages) {
      const stageStatus = window.UAI?.getStage(stage)?.status;
      if (stageStatus !== 'completed') {
        throw new Error(`Stage ${stage} not completed. Status: ${stageStatus}`);
      }
    }
  }
  
  removeLoadingIndicators() {
    // Remove loading spinners
    // Show content
    document.body.classList.remove('uai-loading');
    document.body.classList.add('uai-ready');
  }
  
  async initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    } else {
      // Wait for Lucide to load
      await new Promise((resolve) => {
        const checkLucide = () => {
          if (window.lucide) {
            window.lucide.createIcons();
            resolve();
          } else {
            setTimeout(checkLucide, 100);
          }
        };
        checkLucide();
      });
    }
  }
  
  markPageReady() {
    window.UAIState = window.UAIState || {};
    window.UAIState.ready = true;
    window.UAIState.readyTime = Date.now();
  }
  
  emitReady() {
    window.dispatchEvent(new CustomEvent('uai:ready', {
      detail: {
        timestamp: Date.now(),
        stages: ['DOM', 'Bridge', 'Data', 'Render', 'Ready']
      }
    }));
  }
}
```

**Dependencies:**
- `RenderStage` (must complete first)
- `lucide` library

**Events Emitted:**
- `uai:ready` - העמוד מוכן

**Events Listened:**
- `uai:stage-complete` (from RenderStage)

---

### 2. Supporting Classes

#### 2.1 `StageBase` (Base Class)

**Purpose:** מחלקה בסיסית לכל השלבים

**Location:** `ui/src/components/core/stages/StageBase.js`

**API:**
```javascript
class StageBase {
  constructor(name) {
    this.name = name;
    this.status = 'pending'; // pending, running, completed, error
    this.error = null;
    this.startTime = null;
    this.endTime = null;
  }
  
  async execute() {
    throw new Error('execute() must be implemented by subclass');
  }
  
  async waitForStage(stageName) {
    // Wait for another stage to complete
  }
  
  async loadScript(src) {
    // Load JavaScript file dynamically
  }
  
  emit(eventName, data) {
    window.dispatchEvent(new CustomEvent(`uai:${this.name.toLowerCase()}:${eventName}`, {
      detail: { stage: this.name, ...data }
    }));
  }
  
  on(eventName, callback) {
    window.addEventListener(`uai:${this.name.toLowerCase()}:${eventName}`, callback);
  }
}
```

---

#### 2.2 `ScriptLoader` (Utility)

**Purpose:** טוען קבצי JavaScript דינמית

**Location:** `ui/src/components/core/utils/ScriptLoader.js`

**API:**
```javascript
class ScriptLoader {
  static async load(src, options = {}) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.type = options.type || 'text/javascript';
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  }
  
  static async loadModule(src) {
    return this.load(src, { type: 'module' });
  }
}
```

---

### 3. Integration Points

#### 3.1 HTML Integration

**Current Pattern:**
```html
<body>
  <script src="/src/components/core/authGuard.js"></script>
  <script src="/src/components/core/phoenixFilterBridge.js"></script>
  <script src="/src/components/core/headerLoader.js"></script>
  <!-- ... many scripts ... -->
</body>
```

**New Pattern:**
```html
<body>
  <!-- Single entry point -->
  <script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
  <script>
    // Page-specific configuration
    window.UAIConfig = {
      pageType: 'cashFlows',
      requiresAuth: true,
      requiresHeader: true,
      dataEndpoints: ['cash_flows', 'cash_flows/currency_conversions', 'cash_flows/summary']
    };
  </script>
</body>
```

---

#### 3.2 Data Loader Integration

**Current Pattern:**
```javascript
// cashFlowsTableInit.js
(function initCashFlowsTables() {
  function initializeTableManagers() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initTables();
        loadInitialData();
      });
    } else {
      initTables();
      loadInitialData();
    }
  }
  initializeTableManagers();
})();
```

**New Pattern:**
```javascript
// cashFlowsTableInit.js
(function initCashFlowsTables() {
  // Listen for UAI events
  window.addEventListener('uai:render:data-ready', function(e) {
    const data = e.detail.data;
    initTables();
    updateTables(data);
  });
  
  // Or use lifecycle hook
  if (window.UAI) {
    window.UAI.onStageComplete('Render', function() {
      const data = window.UAIState?.data;
      if (data) {
        initTables();
        updateTables(data);
      }
    });
  }
})();
```

---

## 🔄 Lifecycle Flow

### Complete Flow Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Load Starts                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 1: DOM                                              │
│  ├─ Wait for DOMContentLoaded                              │
│  ├─ Load authGuard.js                                      │
│  ├─ Check authentication                                    │
│  ├─ Load headerLoader.js (if needed)                        │
│  └─ Emit: uai:dom:ready                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 2: Bridge                                           │
│  ├─ Wait for DOM stage complete                            │
│  ├─ Load phoenixFilterBridge.js                            │
│  ├─ Initialize PhoenixBridge                              │
│  ├─ Setup event system                                     │
│  └─ Emit: uai:bridge:ready                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 3: Data                                             │
│  ├─ Wait for Bridge stage complete                         │
│  ├─ Identify page type                                     │
│  ├─ Load data loader module                                │
│  ├─ Fetch data from API                                    │
│  ├─ Transform data (transformers.js)                      │
│  ├─ Store in state                                         │
│  └─ Emit: uai:data:loaded                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 4: Render                                           │
│  ├─ Wait for Data stage complete                           │
│  ├─ Identify UI components                                 │
│  ├─ Load component initializers                            │
│  ├─ Initialize components                                  │
│  ├─ Render data                                            │
│  ├─ Setup event handlers                                   │
│  └─ Emit: uai:render:complete                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Stage 5: Ready                                            │
│  ├─ Wait for Render stage complete                         │
│  ├─ Verify all stages completed                            │
│  ├─ Remove loading indicators                              │
│  ├─ Initialize Lucide icons                                │
│  ├─ Mark page as ready                                     │
│  └─ Emit: uai:ready                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Page Ready                               │
│              User can interact                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Race Condition Prevention

### Mechanisms:

1. **Sequential Execution:** כל שלב ממתין להשלמת השלב הקודם
2. **Promise Chain:** שימוש ב-Promises/Async-Await
3. **Event System:** Custom Events לתקשורת בין רכיבים
4. **State Verification:** בדיקת state לפני המשך
5. **Dependency Injection:** כל רכיב מקבל את התלויות שלו

### Example Prevention:

```javascript
// ❌ BEFORE (Race Condition):
document.addEventListener('DOMContentLoaded', function() {
  loadData(); // Might run before header is loaded
  initTable(); // Might run before data is loaded
});

// ✅ AFTER (No Race Condition):
await uai.stages.DOM.execute(); // Wait for DOM
await uai.stages.Bridge.execute(); // Wait for Bridge
await uai.stages.Data.execute(); // Wait for Data
await uai.stages.Render.execute(); // Wait for Render
```

---

## 📦 Dependencies Map

```
UnifiedAppInit
├── StageBase (base class)
│   └── ScriptLoader (utility)
├── DOMStage
│   ├── authGuard.js
│   └── headerLoader.js
│       └── phoenixFilterBridge.js (loaded by headerLoader)
├── BridgeStage
│   └── phoenixFilterBridge.js
├── DataStage
│   ├── transformers.js
│   └── [page-specific data loader]
│       └── routes.json (SSOT)
├── RenderStage
│   ├── PhoenixTableSortManager.js
│   ├── PhoenixTableFilterManager.js
│   ├── tableFormatters.js
│   └── [page-specific table init]
│       └── [page-specific header handlers]
└── ReadyStage
    └── lucide (library)
```

---

## 🎯 Implementation Phases

### Phase 1: Core Infrastructure
1. Create `StageBase` class
2. Create `ScriptLoader` utility
3. Create `UnifiedAppInit` main controller
4. Create basic stage classes (DOM, Bridge, Data, Render, Ready)

### Phase 2: Stage Implementation
1. Implement `DOMStage` with authGuard and headerLoader integration
2. Implement `BridgeStage` with PhoenixBridge integration
3. Implement `DataStage` with dynamic loader detection
4. Implement `RenderStage` with component initialization
5. Implement `ReadyStage` with finalization

### Phase 3: Integration
1. Update existing pages to use UAI
2. Migrate table init modules to listen to UAI events
3. Migrate data loaders to work with UAI
4. Test with D18 (Brokers Fees) and D21 (Cash Flows)

### Phase 4: Optimization
1. Add caching for loaded scripts
2. Add error recovery mechanisms
3. Add performance monitoring
4. Add debugging tools

---

## 🔍 Error Handling

### Error Strategy:

1. **Stage-Level Errors:** כל שלב מטפל בשגיאות שלו
2. **Global Error Handler:** UnifiedAppInit מטפל בשגיאות קריטיות
3. **Fallback Mechanisms:** מנגנוני fallback לכל שלב
4. **Error Events:** Custom events לשגיאות

### Example:

```javascript
class DataStage extends StageBase {
  async execute() {
    try {
      // ... execution ...
    } catch (error) {
      this.status = 'error';
      this.error = error;
      this.emit('error', { error, stage: this.name });
      
      // Fallback: try to continue with empty data
      this.data = { data: [], total: 0 };
      this.status = 'completed';
    }
  }
}
```

---

## 📊 Performance Considerations

### Optimizations:

1. **Parallel Loading:** טעינת scripts במקביל (כאשר אפשר)
2. **Caching:** שמירת scripts שנטענו
3. **Lazy Loading:** טעינת רכיבים רק כשצריך
4. **Debouncing:** debounce לאירועים תכופים

### Metrics:

- **Time to DOM Ready:** < 100ms
- **Time to Bridge Ready:** < 200ms
- **Time to Data Loaded:** < 1000ms (depends on API)
- **Time to Render Complete:** < 500ms
- **Total Time to Ready:** < 2000ms (target)

---

## 🧪 Testing Strategy

### Unit Tests:
- Test each stage independently
- Test error handling
- Test dependency resolution

### Integration Tests:
- Test complete lifecycle
- Test with different page types
- Test error recovery

### E2E Tests:
- Test page load with UAI
- Test user interactions
- Test performance

---

## 📝 Migration Guide

### For Existing Pages:

1. **Remove individual script tags:**
```html
<!-- ❌ REMOVE -->
<script src="/src/components/core/authGuard.js"></script>
<script src="/src/components/core/phoenixFilterBridge.js"></script>
<!-- ... -->
```

2. **Add UAI entry point:**
```html
<!-- ✅ ADD -->
<script type="module" src="/src/components/core/UnifiedAppInit.js"></script>
<script>
  window.UAIConfig = {
    pageType: 'cashFlows',
    requiresAuth: true,
    requiresHeader: true
  };
</script>
```

3. **Update table init modules:**
```javascript
// Listen to UAI events instead of DOMContentLoaded
window.addEventListener('uai:render:data-ready', function(e) {
  const data = e.detail.data;
  // Initialize tables with data
});
```

---

## ✅ Summary

**UAI Architecture:**
- ✅ 5 sequential stages (DOM → Bridge → Data → Render → Ready)
- ✅ Promise-based execution (no Race Conditions)
- ✅ Event-driven communication
- ✅ Dependency injection
- ✅ Lifecycle hooks
- ✅ Error handling
- ✅ Performance optimizations

**Benefits:**
- ✅ No Race Conditions
- ✅ Centralized lifecycle management
- ✅ Easier debugging
- ✅ Better maintainability
- ✅ Consistent page loading
- ✅ Reusable across all pages

---

**Team 30 (Frontend Execution)**  
**Date:** 2026-01-31  
**Status:** 📋 **ARCHITECTURAL DESIGN - READY FOR REVIEW**

**log_entry | [Team 30] | UAI | ARCHITECTURAL_DESIGN | COMPLETED | 2026-01-31**
