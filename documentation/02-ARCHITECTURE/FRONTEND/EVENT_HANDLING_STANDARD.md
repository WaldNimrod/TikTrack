# Event Handling Standard - TikTrack

## סקירה כללית

**Event Handling Standard** מגדיר את התקן לטיפול באירועים ב-TikTrack, עם דגש על אירועי `data-onclick` לרכיבי DOM. התקן מבטיח טיפול אחיד, בטוח ומאובטח באירועים בכל רחבי המערכת.

## עקרונות יסוד

### 1. Attribute-Based Event Binding

- **איסור:** שימוש ב-inline event handlers (`onclick="..."`)
- **חובה:** שימוש ב-`data-onclick` attributes
- **יתרון:** הפרדה בין HTML ל-JavaScript, אבטחה משופרת

### 2. Centralized Event Delegation

- **איסור:** Event listeners ישירים על אלמנטים
- **חובה:** שימוש ב-event delegation דרך container
- **יתרון:** ביצועים משופרים, ניהול אחיד

### 3. Safe Function Execution

- **איסור:** `eval()` או function constructors
- **חובה:** שימוש ב-registered functions בלבד
- **יתרון:** מניעת XSS ו-code injection

## ארכיטקטורה

### רכיבי הליבה

#### 1. EventManager

- **קובץ:** `trading-ui/scripts/services/event-manager.js`
- **תפקיד:** ניהול רישום פונקציות וטיפול באירועים
- **פונקציות:** registerHandler, unregisterHandler, handleEvent

#### 2. SafeFunctionExecutor

- **קובץ:** `trading-ui/scripts/services/safe-function-executor.js`
- **תפקיד:** ביצוע בטוח של פונקציות רשומות
- **פונקציות:** execute, validateFunctionName

#### 3. EventValidator

- **קובץ:** `trading-ui/scripts/services/event-validator.js`
- **תפקיד:** אימות אירועים ופרמטרים
- **פונקציות:** validateEvent, sanitizeParameters

### זרימת טיפול באירועים

```javascript
// 1. HTML with data-onclick attribute
<button data-onclick="openModal" data-params="modalId:editTrade,tradeId:123">
  Edit Trade
</button>

// 2. Event delegation captures click
document.addEventListener('click', function(event) {
  const target = event.target.closest('[data-onclick]');
  if (target) {
    EventManager.handleEvent(target, event);
  }
});

// 3. Safe execution of registered function
EventManager.handleEvent = function(element, event) {
  const functionName = element.getAttribute('data-onclick');
  const params = EventValidator.parseParams(element.getAttribute('data-params'));

  if (EventValidator.validateEvent(functionName, params)) {
    SafeFunctionExecutor.execute(functionName, params, event);
  }
};
```

## API Reference

### EventManager

#### `registerHandler(name, handler)`

```javascript
// Register event handler function
EventManager.registerHandler('openModal', function(params, event) {
  const modalId = params.modalId;
  const tradeId = params.tradeId;
  // Open modal logic
});
```

#### `handleEvent(element, event)`

```javascript
// Handle DOM event from data-onclick element
EventManager.handleEvent(buttonElement, clickEvent);
// Automatically called by event delegation
```

#### `unregisterHandler(name)`

```javascript
// Remove registered handler
EventManager.unregisterHandler('openModal');
```

### SafeFunctionExecutor

#### `execute(functionName, params, event)`

```javascript
// Execute registered function safely
const result = SafeFunctionExecutor.execute('openModal', {
  modalId: 'editTrade',
  tradeId: 123
}, clickEvent);
```

#### `validateFunctionName(name)`

```javascript
// Validate function name exists and is safe
const isValid = SafeFunctionExecutor.validateFunctionName('openModal');
// Returns: true/false
```

### EventValidator

#### `parseParams(paramsString)`

```javascript
// Parse data-params attribute
const params = EventValidator.parseParams('modalId:editTrade,tradeId:123');
// Returns: { modalId: 'editTrade', tradeId: 123 }
```

#### `validateEvent(functionName, params)`

```javascript
// Validate event and parameters
const isValid = EventValidator.validateEvent('openModal', params);
// Returns: true/false with reason
```

## דוגמאות שימוש

### רישום פונקציות בעת אתחול

```javascript
// Initialize event handlers on app startup
function initializeEventHandlers() {
  // Modal handlers
  EventManager.registerHandler('openModal', handleOpenModal);
  EventManager.registerHandler('closeModal', handleCloseModal);

  // CRUD handlers
  EventManager.registerHandler('saveTrade', handleSaveTrade);
  EventManager.registerHandler('deleteTrade', handleDeleteTrade);

  // Navigation handlers
  EventManager.registerHandler('navigateTo', handleNavigateTo);

  Logger.info('Event handlers initialized', {
    registeredCount: EventManager.getRegisteredCount()
  });
}
```

### HTML עם data-onclick

```html
<!-- Simple click handler -->
<button data-onclick="openModal" data-params="modalId:createTrade">
  Create New Trade
</button>

<!-- Handler with multiple parameters -->
<button data-onclick="editTrade"
        data-params="tradeId:123,modalId:editTrade,returnUrl:trades">
  Edit Trade
</button>

<!-- Navigation handler -->
<a data-onclick="navigateTo" data-params="page:portfolio,filter:active">
  View Portfolio
</a>
```

### יישום פונקציות handler

```javascript
// Modal opening handler
function handleOpenModal(params, event) {
  event.preventDefault(); // Prevent default if needed

  const modalId = params.modalId;
  const tradeId = params.tradeId;

  // Validate parameters
  if (!modalId) {
    Logger.error('Missing modalId parameter');
    return;
  }

  // Open modal using ModalSystem
  ModalSystem.open(modalId, {
    tradeId: tradeId,
    onSave: () => handleTradeSaved(tradeId)
  });
}

// CRUD save handler
async function handleSaveTrade(params, event) {
  event.preventDefault();

  try {
    const formData = getFormData(params.formId);
    const result = await UnifiedCRUDService.create('trades', formData);

    if (result.success) {
      NotificationSystem.success('Trade saved successfully');
      ModalSystem.close(params.modalId);
    } else {
      NotificationSystem.error(result.error);
    }
  } catch (error) {
    Logger.error('Error saving trade', { error: error.message, params });
    NotificationSystem.error('Failed to save trade');
  }
}
```

## אבטחה

### Parameter Sanitization

```javascript
// Sanitize parameters to prevent XSS
function sanitizeParams(params) {
  const sanitized = {};

  for (const [key, value] of Object.entries(params)) {
    // Remove dangerous characters
    sanitized[key] = String(value).replace(/[<>]/g, '');
  }

  return sanitized;
}
```

### Function Name Validation

```javascript
// Whitelist of allowed function names
const ALLOWED_FUNCTIONS = new Set([
  'openModal', 'closeModal', 'saveTrade', 'deleteTrade',
  'navigateTo', 'refreshData', 'toggleFilter'
]);

function validateFunctionName(name) {
  return ALLOWED_FUNCTIONS.has(name);
}
```

### Rate Limiting

```javascript
// Prevent rapid clicking
const clickTimestamps = new Map();

function checkRateLimit(functionName, element) {
  const now = Date.now();
  const lastClick = clickTimestamps.get(`${functionName}:${element.id}`) || 0;

  if (now - lastClick < 300) { // 300ms minimum
    return false; // Too fast, ignore
  }

  clickTimestamps.set(`${functionName}:${element.id}`, now);
  return true;
}
```

## ביצועים

### Event Delegation Benefits

- **זיכרון:** Event listener אחד בלבד לכל ה-DOM
- **ביצועים:** אין binding מחדש בעת שינויי DOM
- **דינמי:** עובד עם אלמנטים שנוצרו באופן דינמי

### Optimization Techniques

```javascript
// Debounced event handling for performance
const debouncedHandlers = new Map();

function getDebouncedHandler(functionName, handler, delay = 300) {
  const key = functionName;
  if (!debouncedHandlers.has(key)) {
    debouncedHandlers.set(key, debounce(handler, delay));
  }
  return debouncedHandlers.get(key);
}

// Memory cleanup
function cleanupEventHandlers() {
  debouncedHandlers.clear();
  EventManager.clearAllHandlers();
}
```

## ניפוי באגים

### Event Logging

```javascript
// Log all events for debugging
EventManager.on('eventTriggered', (eventData) => {
  Logger.debug('Event triggered', {
    functionName: eventData.functionName,
    params: eventData.params,
    elementId: eventData.element?.id,
    timestamp: new Date().toISOString()
  });
});

// Log handler registration
EventManager.on('handlerRegistered', (name) => {
  Logger.info('Event handler registered', { functionName: name });
});
```

### Error Handling

```javascript
// Global error handler for event execution
window.addEventListener('error', function(event) {
  if (event.error && event.filename.includes('event-manager')) {
    Logger.error('Event handler error', {
      message: event.error.message,
      functionName: event.error.functionName,
      stack: event.error.stack
    });
  }
});
```

## תחזוקה

### הוספת handler חדש

1. הוסף פונקציה ל-`ALLOWED_FUNCTIONS`
2. רשום ב-`initializeEventHandlers()`
3. הוסף ל-HTML עם `data-onclick`
4. בדוק עם logging מופעל

### עדכון פרמטרים

1. שנה את ה-HTML `data-params`
2. עדכן את ה-handler function
3. בדוק sanitization
4. עדכן תיעוד

### בדיקות

- ✅ Handler registration/unregistration
- ✅ Parameter parsing and sanitization
- ✅ Event delegation performance
- ✅ XSS prevention
- ✅ Error handling and logging

---

**גרסה:** 1.0.0
**תאריך:** 1 בינואר 2026
**סטטוס:** ✅ פעיל ומתועד
