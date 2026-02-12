# Global Event Delegation (GED) Specification

**id:** `TEAM_30_GED_SPEC`  
**owner:** Team 30 (Frontend Execution)  
**status:** 📝 **DRAFT - DESIGN SPRINT**  
**last_updated:** 2026-01-31  
**version:** v1.0 (Design Sprint)

---

## 📢 Executive Summary

**Global Event Delegation (GED)** הוא מערכת ניהול אירועים מרכזית למניעת דליפות זיכרון במערכת Phoenix. המערכת מספקת API מרכזי לניהול Event Listeners עם cleanup אוטומטי וניהול lifecycle.

**למה נחוץ:**
- מניעת דליפות זיכרון מ-Event Listeners שלא נוקו
- ניהול מרכזי של כל ה-Event Listeners במערכת
- Cleanup אוטומטי בעת ניווט בין עמודים
- תמיכה ב-Event Delegation לרכיבים דינמיים

**איך משתלב:**
- משתלב עם UAI לניהול lifecycle
- מספק API מרכזי לכל הרכיבים
- עובד עם PhoenixBridge לתקשורת בין רכיבים
- תומך ב-cleanup אוטומטי בעת ניווט

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**
- **מניעת דליפות זיכרון:** ניהול מרכזי של Event Listeners
- **Cleanup אוטומטי:** הסרה אוטומטית של listeners בעת ניווט
- **Event Delegation:** תמיכה ב-delegation לרכיבים דינמיים
- **Lifecycle Management:** ניהול lifecycle של listeners

### **בעיות שהמערכת פותרת:**
- **דליפות זיכרון:** Listeners שלא נוקו נשארים בזיכרון
- **קוד כפול:** כל רכיב מטפל בעצמו ב-cleanup
- **טעויות:** שכחה לנקות listeners
- **ביצועים:** ריבוי listeners על אותו element

### **יתרונות:**
- **זיכרון נקי:** אין דליפות זיכרון
- **תחזוקה קלה:** ניהול מרכזי של כל ה-listeners
- **ביצועים:** Event Delegation מפחית מספר listeners
- **אמינות:** Cleanup אוטומטי מונע טעויות

---

## 🏗️ Architecture

### **מבנה כללי:**

```
┌─────────────────────────────────────────────────────────────┐
│              Global Event Delegation (GED)                  │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   GEDCore    │───▶│  Listener    │───▶│   DOM       │ │
│  │  (Manager)   │    │  Registry    │    │  Elements   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                          │                                   │
│                    ┌──────────────┐                        │
│                    │   Cleanup    │                        │
│                    │   Manager    │                        │
│                    └──────────────┘                        │
│                          │                                   │
│                    ┌──────────────┐                        │
│                    │   UAI        │                        │
│                    │  Integration │                        │
│                    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### **רכיבים מרכזיים:**

#### **1. GEDCore (Main Manager)**
- מנהל את כל ה-Event Listeners
- מספק API מרכזי
- מטפל ב-registry וב-cleanup

#### **2. ListenerRegistry**
- רישום של כל ה-listeners
- קישור בין listeners ל-elements
- מעקב אחר lifecycle

#### **3. CleanupManager**
- ניהול cleanup אוטומטי
- הסרה של listeners בעת ניווט
- ניקוי לפי scope או page

#### **4. EventDelegator**
- Event Delegation לרכיבים דינמיים
- שימוש ב-event bubbling
- הפחתת מספר listeners

### **תלויות:**
- UAI - ניהול lifecycle
- PhoenixBridge - תקשורת בין רכיבים
- DOM APIs - Event handling

---

## 📋 API / Interface

### **Public Methods / Functions:**

#### **1. GED.on() - הוספת Event Listener**

```javascript
/**
 * Add event listener with automatic cleanup
 * @param {HTMLElement|string} target - Target element or selector
 * @param {string} eventType - Event type (click, change, etc.)
 * @param {Function} handler - Event handler function
 * @param {Object} options - Options: { scope, once, passive, capture }
 * @returns {string} Listener ID for cleanup
 * 
 * @example
 * const listenerId = GED.on('#myButton', 'click', function(e) {
 *   console.log('Button clicked');
 * }, { scope: 'page' });
 */
GED.on(target, eventType, handler, options = {})
```

#### **2. GED.off() - הסרת Event Listener**

```javascript
/**
 * Remove event listener by ID
 * @param {string} listenerId - Listener ID returned from GED.on()
 * 
 * @example
 * GED.off(listenerId);
 */
GED.off(listenerId)
```

#### **3. GED.delegate() - Event Delegation**

```javascript
/**
 * Add delegated event listener (event delegation)
 * @param {HTMLElement|string} container - Container element or selector
 * @param {string} selector - Selector for target elements
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Options: { scope, once, passive }
 * @returns {string} Listener ID for cleanup
 * 
 * @example
 * // Delegate click events to all .js-action-view buttons
 * const listenerId = GED.delegate('#tableBody', '.js-action-view', 'click', function(e) {
 *   const button = e.target.closest('.js-action-view');
 *   console.log('View clicked', button);
 * }, { scope: 'page' });
 */
GED.delegate(container, selector, eventType, handler, options = {})
```

#### **4. GED.cleanup() - Cleanup לפי Scope**

```javascript
/**
 * Cleanup all listeners in a scope
 * @param {string} scope - Scope name ('page', 'component', 'global')
 * 
 * @example
 * // Cleanup all page-scoped listeners
 * GED.cleanup('page');
 */
GED.cleanup(scope)
```

#### **5. GED.cleanupAll() - Cleanup כל ה-Listeners**

```javascript
/**
 * Cleanup all registered listeners
 * 
 * @example
 * // Cleanup everything (usually on page unload)
 * GED.cleanupAll();
 */
GED.cleanupAll()
```

#### **6. GED.once() - Listener חד-פעמי**

```javascript
/**
 * Add one-time event listener (auto-removed after first trigger)
 * @param {HTMLElement|string} target - Target element or selector
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Options: { scope, passive }
 * @returns {string} Listener ID
 * 
 * @example
 * GED.once('#modal', 'shown', function() {
 *   console.log('Modal shown once');
 * });
 */
GED.once(target, eventType, handler, options = {})
```

### **Configuration Options:**

#### **Global Configuration:**
```javascript
GED.config({
  autoCleanup: true,
  cleanupOnNavigate: true,
  enableDelegation: true,
  maxListeners: 1000 // Warning threshold
});
```

#### **Listener Options:**
- **scope:** `'page'` | `'component'` | `'global'` - Scope for cleanup
- **once:** `boolean` - Auto-remove after first trigger
- **passive:** `boolean` - Passive event listener
- **capture:** `boolean` - Capture phase
- **delegation:** `boolean` - Use event delegation

---

## 🔄 Workflow / Lifecycle

### **תהליך עבודה:**

1. **Initialization:**
   - GED נטען עם העמוד
   - מתחבר ל-UAI
   - מאתחל registry

2. **Listener Registration:**
   - קוד קורא ל-`GED.on()` או `GED.delegate()`
   - GED רושם את ה-listener
   - מחזיר listener ID

3. **Event Handling:**
   - Event מתרחש
   - GED מטפל ב-event
   - Handler נקרא

4. **Cleanup:**
   - בעת ניווט או cleanup ידני
   - GED מסיר את כל ה-listeners ב-scope
   - Registry מתעדכן

### **Lifecycle Hooks:**

- **onInit:** נקרא בעת אתחול GED
- **onListenerAdded:** נקרא כאשר listener נוסף
- **onListenerRemoved:** נקרא כאשר listener הוסר
- **onCleanup:** נקרא בעת cleanup

### **Integration with UAI:**

```javascript
// In UAI ReadyStage
class ReadyStage {
  async execute() {
    // ... other code ...
    
    // Setup GED cleanup on page unload
    GED.on(window, 'beforeunload', () => {
      GED.cleanup('page');
    }, { scope: 'global' });
    
    // Setup GED cleanup on navigation
    if (window.PhoenixBridge) {
      PhoenixBridge.addEventListener('navigation', () => {
        GED.cleanup('page');
      });
    }
  }
}
```

---

## ⚠️ Error Handling

### **Error Types:**

- **GED_INVALID_TARGET:** Target element לא נמצא
- **GED_INVALID_HANDLER:** Handler לא תקין
- **GED_LISTENER_NOT_FOUND:** Listener ID לא נמצא
- **GED_MAX_LISTENERS:** חריגה ממספר listeners מקסימלי

### **Error Handling Patterns:**

```javascript
try {
  const listenerId = GED.on('#myButton', 'click', handler);
} catch (error) {
  if (error.code === 'GED_INVALID_TARGET') {
    console.warn('Target element not found, retrying after DOM ready');
    // Retry after DOM ready
  } else {
    console.error('GED Error:', error);
  }
}
```

### **Error Codes:**

| Code | Description | HTTP Status |
|:---|:---|:---|
| `GED_INVALID_TARGET` | Target element not found | N/A |
| `GED_INVALID_HANDLER` | Invalid handler function | N/A |
| `GED_LISTENER_NOT_FOUND` | Listener ID not found | N/A |
| `GED_MAX_LISTENERS` | Maximum listeners exceeded | N/A |

---

## 📊 Examples

### **דוגמה 1: שימוש בסיסי - הוספת Listener**

```javascript
// In table initialization
function initTableActions() {
  const viewButtons = document.querySelectorAll('.js-action-view');
  
  viewButtons.forEach(btn => {
    // Register listener with GED
    const listenerId = GED.on(btn, 'click', function(e) {
      e.preventDefault();
      const flowId = this.getAttribute('data-flow-id');
      // Handle view action
    }, { scope: 'page' });
    
    // Store listener ID if needed for manual cleanup
    btn.setAttribute('data-listener-id', listenerId);
  });
}
```

### **דוגמה 2: Event Delegation - רכיבים דינמיים**

```javascript
// In table initialization - using delegation for dynamic rows
function initTableActions() {
  const tableBody = document.querySelector('#cashFlowsTableBody');
  
  // Single delegated listener for all action buttons
  const listenerId = GED.delegate(tableBody, '.js-action-view', 'click', function(e) {
    e.preventDefault();
    const button = e.target.closest('.js-action-view');
    const flowId = button.getAttribute('data-flow-id');
    // Handle view action
  }, { scope: 'page' });
  
  // This works even for dynamically added rows!
}
```

### **דוגמה 3: Cleanup לפי Scope**

```javascript
// In page cleanup (before navigation)
function cleanupPage() {
  // Cleanup all page-scoped listeners
  GED.cleanup('page');
  
  // Component-scoped listeners remain
  // Global listeners remain
}
```

### **דוגמה 4: One-Time Listener**

```javascript
// One-time initialization
GED.once('#modal', 'shown', function() {
  console.log('Modal shown for the first time');
  // This listener will be automatically removed after first trigger
});
```

### **דוגמה 5: אינטגרציה עם UAI**

```javascript
// In RenderStage
class RenderStage {
  async execute() {
    // ... render code ...
    
    // Setup event handlers with GED
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Filter handlers
    const filterInput = document.getElementById('cashFlowsSearch');
    if (filterInput) {
      GED.on(filterInput, 'input', this.handleSearchInput.bind(this), {
        scope: 'page'
      });
    }
    
    // Pagination handlers
    const prevBtn = document.getElementById('cashFlowsPrevPageBtn');
    if (prevBtn) {
      GED.on(prevBtn, 'click', this.handlePrevPage.bind(this), {
        scope: 'page'
      });
    }
  }
  
  // Cleanup on stage completion
  async cleanup() {
    GED.cleanup('page');
  }
}
```

### **דוגמה 6: Migration מהקוד הקיים**

```javascript
// ❌ BEFORE (Manual cleanup - prone to memory leaks)
function initTableActions() {
  const viewButtons = document.querySelectorAll('.js-action-view');
  
  viewButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Handler
    });
    // ❌ No cleanup - memory leak!
  });
}

// ✅ AFTER (GED with automatic cleanup)
function initTableActions() {
  const tableBody = document.querySelector('#cashFlowsTableBody');
  
  // Single delegated listener - automatically cleaned up
  GED.delegate(tableBody, '.js-action-view', 'click', function(e) {
    // Handler
  }, { scope: 'page' });
  
  // Cleanup happens automatically on page navigation
}
```

### **דוגמה 7: ניהול Listeners מורכב**

```javascript
// Component with multiple listeners
class TableComponent {
  constructor(tableId) {
    this.tableId = tableId;
    this.listenerIds = [];
  }
  
  init() {
    const table = document.querySelector(`#${this.tableId}`);
    
    // Register multiple listeners
    this.listenerIds.push(
      GED.on(table, 'phoenix-table-sorted', this.handleSort.bind(this), {
        scope: 'component'
      })
    );
    
    this.listenerIds.push(
      GED.delegate(table, '.js-action-view', 'click', this.handleView.bind(this), {
        scope: 'component'
      })
    );
  }
  
  cleanup() {
    // Cleanup all component listeners
    this.listenerIds.forEach(id => GED.off(id));
    this.listenerIds = [];
    
    // Or use scope cleanup
    // GED.cleanup('component');
  }
}
```

---

## 🔗 Dependencies

### **External Dependencies:**
- אין (רק DOM APIs)

### **Internal Dependencies:**
- UAI - ניהול lifecycle
- PhoenixBridge - תקשורת בין רכיבים

### **SSOT Dependencies:**
- אין (מערכת עצמאית)

### **Integration Points:**
- **UAI:** GED משתלב עם UAI לניהול lifecycle
- **PhoenixBridge:** GED משתמש ב-PhoenixBridge לתקשורת
- **Table Init Modules:** כל table init משתמש ב-GED
- **Header Handlers:** כל header handler משתמש ב-GED

---

## 🏗️ Implementation Details

### **File Structure:**

```
ui/src/components/core/
├── UnifiedAppInit.js (UAI - integration point)
└── GlobalEventDelegation.js (new - GED)
    ├── GEDCore.js
    ├── ListenerRegistry.js
    ├── CleanupManager.js
    └── EventDelegator.js
```

### **Class Structure:**

```javascript
// GEDCore.js
class GEDCore {
  constructor() {
    this.registry = new ListenerRegistry();
    this.cleanupManager = new CleanupManager(this.registry);
    this.delegator = new EventDelegator(this.registry);
    this.config = {
      autoCleanup: true,
      cleanupOnNavigate: true,
      enableDelegation: true,
      maxListeners: 1000
    };
  }
  
  on(target, eventType, handler, options = {}) {
    const element = this.resolveTarget(target);
    if (!element) {
      throw new Error('GED_INVALID_TARGET: Target element not found');
    }
    
    const listenerId = this.registry.register({
      element,
      eventType,
      handler,
      options
    });
    
    element.addEventListener(eventType, handler, {
      passive: options.passive || false,
      capture: options.capture || false
    });
    
    return listenerId;
  }
  
  delegate(container, selector, eventType, handler, options = {}) {
    return this.delegator.delegate(container, selector, eventType, handler, options);
  }
  
  off(listenerId) {
    const listener = this.registry.get(listenerId);
    if (!listener) {
      throw new Error('GED_LISTENER_NOT_FOUND: Listener ID not found');
    }
    
    listener.element.removeEventListener(listener.eventType, listener.handler);
    this.registry.unregister(listenerId);
  }
  
  cleanup(scope) {
    this.cleanupManager.cleanup(scope);
  }
  
  cleanupAll() {
    this.cleanupManager.cleanupAll();
  }
  
  resolveTarget(target) {
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    return target;
  }
}

// ListenerRegistry.js
class ListenerRegistry {
  constructor() {
    this.listeners = new Map();
    this.nextId = 1;
  }
  
  register(listener) {
    const id = `ged_${this.nextId++}`;
    listener.id = id;
    this.listeners.set(id, listener);
    return id;
  }
  
  get(id) {
    return this.listeners.get(id);
  }
  
  unregister(id) {
    this.listeners.delete(id);
  }
  
  getByScope(scope) {
    return Array.from(this.listeners.values()).filter(
      listener => listener.options.scope === scope
    );
  }
}

// EventDelegator.js
class EventDelegator {
  constructor(registry) {
    this.registry = registry;
  }
  
  delegate(container, selector, eventType, handler, options = {}) {
    const containerElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!containerElement) {
      throw new Error('GED_INVALID_TARGET: Container element not found');
    }
    
    // Create delegated handler
    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && containerElement.contains(target)) {
        handler.call(target, e);
      }
    };
    
    // Register as regular listener
    return this.registry.register({
      element: containerElement,
      eventType,
      handler: delegatedHandler,
      options: { ...options, delegation: true, selector }
    });
  }
}
```

---

## 🛡️ Memory Leak Prevention

### **Mechanisms:**

1. **Automatic Cleanup:** Cleanup אוטומטי בעת ניווט
2. **Scope Management:** ניהול listeners לפי scope
3. **Registry Tracking:** מעקב אחר כל ה-listeners
4. **Delegation:** הפחתת מספר listeners

### **Best Practices:**

```javascript
// ✅ GOOD: Use GED with scope
GED.on(button, 'click', handler, { scope: 'page' });

// ✅ GOOD: Use delegation for dynamic elements
GED.delegate(container, '.js-action', 'click', handler, { scope: 'page' });

// ✅ GOOD: Cleanup on component destroy
component.cleanup = function() {
  GED.cleanup('component');
};

// ❌ BAD: Manual addEventListener without cleanup
button.addEventListener('click', handler); // Memory leak!

// ❌ BAD: Anonymous functions without cleanup
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {}); // Memory leak!
});
```

---

## ✅ Checklist

### **Specification:**
- [x] כל הסעיפים מולאו
- [x] דוגמאות קוד נכללו
- [x] תלויות מתועדות
- [x] Error handling מתועד
- [x] Memory leak prevention מתועד
- [x] אינטגרציה עם UAI מתועדת

### **Integration:**
- [x] תיאום עם UAI lifecycle
- [x] תיאום עם PhoenixBridge
- [x] תמיכה ב-migration מהקוד הקיים
- [x] תמיכה ב-event delegation

---

## 📞 קישורים רלוונטיים

- **מקור המנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BASE_SYSTEMS_DESIGN_MANDATE.md`
- **תיעוד SSOT:** `documentation/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md`
- **קבצים קשורים:**
  - `ui/src/components/core/UnifiedAppInit.js` (UAI - integration)
  - `ui/src/components/core/phoenixFilterBridge.js` (PhoenixBridge - integration)
  - `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` (דוגמת שימוש)
  - `ui/src/views/financial/cashFlows/cashFlowsHeaderHandlers.js` (דוגמת שימוש)

---

**Team 30 (Frontend Execution)**  
**תאריך:** 2026-01-31  
**סטטוס:** 📝 **DRAFT - DESIGN SPRINT**

**log_entry | [Team 30] | GED | SPEC_DRAFT | BLUE | 2026-01-31**
