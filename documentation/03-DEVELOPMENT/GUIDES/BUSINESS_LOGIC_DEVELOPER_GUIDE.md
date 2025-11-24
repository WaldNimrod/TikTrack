# Business Logic Developer Guide
# מדריך מפתחים - Business Logic Layer

**תאריך יצירה:** 22 נובמבר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ✅ תיעוד מלא  
**מטרה:** מדריך מקיף למפתחים על איך ליצור, להשתמש ולשלב Business Logic Layer במערכת TikTrack

---

## 📋 תוכן עניינים

1. [מבוא](#מבוא)
2. [יצירת Business Service חדש](#יצירת-business-service-חדש)
3. [שימוש ב-Business Logic API](#שימוש-ב-business-logic-api)
4. [אינטגרציה עם מערכות טעינה ואיתחול](#אינטגרציה-עם-מערכות-טעינה-ואיתחול)
5. [אינטגרציה עם מערכות מטמון](#אינטגרציה-עם-מערכות-מטמון)
6. [דוגמאות קוד](#דוגמאות-קוד)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)

---

## 🎯 מבוא

### מה זה Business Logic Layer?

Business Logic Layer הוא שכבת הלוגיקה העסקית המרכזית במערכת TikTrack. השכבה אחראית על:

- **ולידציה של נתונים עסקיים** - בדיקת תקינות נתונים לפי חוקי עסק
- **חישובים עסקיים** - ביצוע חישובים מורכבים (מחירים, אחוזים, P/L, וכו')
- **אכיפת חוקי עסק** - יישום חוקי עסק מרכזיים דרך Business Rules Registry

### למה הוא קיים?

1. **הפרדת אחריות** - כל הלוגיקה העסקית ב-Backend, Frontend מכיל רק UI logic
2. **מרכזיות** - כל החישובים והולידציות במקום אחד
3. **שימוש חוזר** - Services משותפים לכל הישויות
4. **תחזוקה קלה** - שינוי חוק עסקי במקום אחד משפיע על כל המערכת
5. **עקביות** - הבטחת עקביות בלוגיקה העסקית בין Frontend ל-Backend

### ארכיטקטורה כללית:

```
Frontend (UI) → Data Service → Business Logic API → Business Service → Business Rules Registry
```

---

## 🏗️ יצירת Business Service חדש

### שלב 1: יצירת קובץ Service

**מיקום:** `Backend/services/business_logic/{entity}_business_service.py`

**דוגמה:** `Backend/services/business_logic/example_business_service.py`

```python
"""
Example Business Logic Service - TikTrack
==========================================

Business logic for example entity calculations, validations, and rule applications.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from __future__ import annotations

import logging
from typing import Any, Dict

from .base_business_service import BaseBusinessService
from .business_rules_registry import business_rules_registry

logger = logging.getLogger(__name__)


class ExampleBusinessService(BaseBusinessService):
    """
    Business logic service for example entity.
    
    Handles all example-related calculations, validations, and business rules.
    """
    
    def __init__(self):
        """Initialize the example business service."""
        super().__init__()
        self.registry = business_rules_registry
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate example data according to business rules.
        
        Args:
            data: Example data dictionary
            
        Returns:
            Dict with 'is_valid' (bool) and 'errors' (List[str])
        """
        errors = []
        
        # Validate required fields
        required_fields = ['field1', 'field2']
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                errors.append(f"{field} is required")
        
        # Validate field values using registry
        for field, value in data.items():
            if value is None or value == '':
                continue
            
            rule_result = self.registry.validate_value('example', field, value)
            if not rule_result['is_valid']:
                errors.append(rule_result['error'])
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
    
    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform example calculations.
        
        Args:
            data: Input data for calculations
            
        Returns:
            Dict with calculated values
        """
        results = {}
        
        # Perform calculations
        if 'field1' in data and 'field2' in data:
            results['calculated_value'] = data['field1'] * data['field2']
        
        return results
```

### שלב 2: הוספת Service ל-__init__.py

**מיקום:** `Backend/services/business_logic/__init__.py`

```python
from .example_business_service import ExampleBusinessService

__all__ = [
    # ... existing services ...
    'ExampleBusinessService',
]
```

### שלב 3: יצירת API Endpoints

**מיקום:** `Backend/routes/api/business_logic.py`

```python
from services.business_logic import ExampleBusinessService

# Initialize service
example_service = ExampleBusinessService()

# Create endpoint
@business_logic_bp.route('/example/validate', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
def validate_example():
    """Validate example data."""
    try:
        data = request.get_json() or {}
        
        result = example_service.validate(data)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating example: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500
```

### שלב 4: יצירת Frontend Wrapper

**מיקום:** `trading-ui/scripts/services/example-data.js`

```javascript
/**
 * Validate example data using backend business logic service.
 * Uses UnifiedCacheManager for caching results (60s TTL).
 * @param {Object} exampleData - Example data to validate
 * @returns {Promise<Object>} Validation result: {is_valid, errors}
 */
async function validateExample(exampleData) {
  // Use optimized cache key generation
  const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
    ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-example', exampleData)
    : `business:validate-example:${JSON.stringify(exampleData)}`;
  
  try {
    // Use CacheTTLGuard for automatic cache management
    if (window.CacheTTLGuard?.ensure) {
      return await window.CacheTTLGuard.ensure(cacheKey, async () => {
        const response = await fetch('/api/business/example/validate', {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(exampleData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            is_valid: false,
            errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
          };
        }

        const result = await response.json();
        return {
          is_valid: result.status === 'success',
          errors: []
        };
      }, { ttl: 60 * 1000 });
    }
    
    // Fallback if CacheTTLGuard not available
    const response = await fetch('/api/business/example/validate', {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(exampleData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        is_valid: false,
        errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
      };
    }

    const result = await response.json();
    return {
      is_valid: result.status === 'success',
      errors: []
    };
  } catch (error) {
    window.Logger?.error?.('❌ Error validating example', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
    throw error;
  }
}

// Export to global scope
window.ExampleData = {
  validateExample,
  // ... other functions ...
};
```

### שלב 5: הוספת חוקים ל-Registry (אם נדרש)

**מיקום:** `Backend/services/business_logic/business_rules_registry.py`

```python
BUSINESS_RULES: Dict[str, Dict[str, Any]] = {
    # ... existing rules ...
    'example': {
        'field1': {
            'min': 0.01,
            'max': 1000,
            'required': True,
            'type': 'float'
        },
        'field2': {
            'allowed_values': ['value1', 'value2', 'value3'],
            'required': True,
            'type': 'string'
        }
    }
}
```

---

## 🔌 שימוש ב-Business Logic API

### קריאה מ-Frontend

#### דרך Data Service Wrapper (מומלץ):

```javascript
// Using wrapper from Data Service
const validationResult = await window.ExampleData.validateExample({
  field1: 100,
  field2: 'value1'
});

if (!validationResult.is_valid) {
  console.error('Validation errors:', validationResult.errors);
}
```

#### דרך API ישירה (לא מומלץ):

```javascript
// Direct API call (not recommended - use wrapper instead)
const response = await fetch('/api/business/example/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ field1: 100, field2: 'value1' })
});

const result = await response.json();
```

### טיפול בשגיאות

```javascript
try {
  const result = await window.ExampleData.validateExample(data);
  
  if (!result.is_valid) {
    // Show validation errors to user
    window.showErrorNotification?.('שגיאת ולידציה', result.errors.join(', '));
    return;
  }
  
  // Continue with business logic
} catch (error) {
  // Handle API errors
  window.Logger?.error?.('Error calling Business Logic API', { error });
  window.showErrorNotification?.('שגיאה', 'שגיאה בבדיקת ולידציה');
}
```

### שימוש במטמון

ה-wrappers משתמשים אוטומטית במטמון דרך CacheTTLGuard:

```javascript
// First call - API request + cache save
const result1 = await window.ExampleData.validateExample(data);

// Second call (within TTL) - returns cached result
const result2 = await window.ExampleData.validateExample(data);
```

---

## 🔄 אינטגרציה עם מערכות טעינה ואיתחול

### 5 שלבי איתחול

Business Logic API משולב ב-5 שלבי האיתחול של UnifiedAppInitializer:

#### Stage 1: Core Systems

**תפקיד:** טעינת מערכות ליבה

**Business Logic Integration:**
- Cache System (UnifiedCacheManager, CacheTTLGuard, CacheSyncManager) נטען כאן
- Cache System נדרש לכל ה-Business Logic API calls

**אין צורך בפעולה** - Cache System נטען אוטומטית

#### Stage 2: UI Systems

**תפקיד:** טעינת מערכות UI

**Business Logic Integration:**
- ✅ לא נדרש - Business Logic לא תלוי ב-UI Systems

#### Stage 3: Page Systems

**תפקיד:** טעינת מערכות עמוד ספציפיות

**Business Logic Integration:**
- Data Services נטענים כאן (כולל Business Logic API wrappers)
- Custom Initializers רצים כאן - יכולים להשתמש ב-Business Logic API

**דוגמה: Custom Initializer**

```javascript
// In page-initialization-configs.js or core-systems.js
async function initializeTradesPage(pageConfig) {
  // Wait for Data Services to be available
  if (!window.TradesData) {
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (window.TradesData) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }
  
  // Now we can use Business Logic API
  const validationResult = await window.TradesData.validateTrade({
    price: 100,
    quantity: 10,
    side: 'buy',
    investment_type: 'Swing',
    status: 'open'
  });
  
  if (!validationResult.is_valid) {
    window.Logger?.warn?.('Trade validation failed during initialization', {
      errors: validationResult.errors
    });
  }
}
```

#### Stage 4: Validation Systems

**תפקיד:** ולידציות

**Business Logic Integration:**
- Business Logic API משמש לולידציות מורכבות
- Form validations יכולים להשתמש ב-Business Logic API

**דוגמה: Form Validation**

```javascript
// In page script (e.g., trades.js)
async function validateTradeForm(form) {
  const formData = {
    price: parseFloat(form.querySelector('#price').value),
    quantity: parseFloat(form.querySelector('#quantity').value),
    side: form.querySelector('#side').value,
    investment_type: form.querySelector('#investment_type').value,
    status: form.querySelector('#status').value
  };
  
  // Use Business Logic API for validation
  if (window.TradesData?.validateTrade) {
    const validationResult = await window.TradesData.validateTrade(formData);
    
    if (!validationResult.is_valid) {
      window.showErrorNotification?.('שגיאת ולידציה', validationResult.errors.join(', '));
      return false;
    }
  }
  
  return true;
}
```

#### Stage 5: Finalization

**תפקיד:** סיום איתחול

**Business Logic Integration:**
- Business Logic API משמש לחישובים סופיים
- Cache invalidation אחרי mutations

**דוגמה: Final Calculations**

```javascript
// In page script
async function finalizePage() {
  // Perform final calculations using Business Logic API
  if (window.TradesData?.calculatePL) {
    const plResult = await window.TradesData.calculatePL({
      entry_price: 100,
      exit_price: 110,
      quantity: 10,
      side: 'Long'
    });
    
    // Update UI with calculated P/L
    updatePLDisplay(plResult.pl, plResult.pl_percent);
  }
}
```

### Packages System

**קובץ:** `trading-ui/scripts/init-system/package-manifest.js`

Data Services מוגדרים ב-`services` package:

```javascript
services: {
  id: 'services',
  name: 'Services Package',
  description: 'שירותי נתונים',
  version: '2.0.0',
  critical: true,
  loadOrder: 3,
  dependencies: ['base'],
  scripts: [
    {
      file: 'services/trades-data.js',
      globalCheck: 'window.TradesData',
      description: 'שירות נתוני טריידים',
      required: true,
      loadOrder: 0
    },
    // ... other services ...
  ]
}
```

### Page Configs

**קובץ:** `trading-ui/scripts/page-initialization-configs.js`

כל עמוד מגדיר:

```javascript
trades: {
  name: 'Trades',
  packages: ['base', 'services', 'ui'],
  requiredGlobals: ['TradesData', 'UnifiedCacheManager'],
  customInitializers: [
    async (pageConfig) => {
      // Use Business Logic API here
      if (window.TradesData?.validateTrade) {
        // ...
      }
    }
  ]
}
```

### Preferences Loading Events

**Events:**
- `preferences:critical-loaded` - Preferences קריטיים נטענו
- `preferences:all-loaded` - כל ה-Preferences נטענו

**Business Logic Integration:**

```javascript
// Wait for preferences if needed
document.addEventListener('preferences:critical-loaded', async () => {
  // Now we can use Business Logic API that depends on preferences
  if (window.TradesData?.validateTrade) {
    // ...
  }
});

// Or check flag
if (window.__preferencesCriticalLoaded) {
  // Preferences are loaded
}
```

---

## 💾 אינטגרציה עם מערכות מטמון

### UnifiedCacheManager

**תפקיד:** ניהול 4 שכבות מטמון

**Business Logic Integration:**

ה-wrappers משתמשים אוטומטית ב-UnifiedCacheManager דרך CacheTTLGuard:

```javascript
// Wrapper uses UnifiedCacheManager automatically
const result = await window.TradesData.calculateStopPrice(100, 5, 'Long');
// Cache is managed automatically by CacheTTLGuard
```

### CacheTTLGuard

**תפקיד:** ניהול TTL אוטומטי

**Business Logic Integration:**

```javascript
// In wrapper
const cacheKey = `business:calculate-stop-price:${currentPrice}:${stopPercentage}:${side}`;
return await window.CacheTTLGuard.ensure(cacheKey, async () => {
  // API call
  const response = await fetch('/api/business/trade/calculate-stop-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_price: currentPrice, stop_percentage: stopPercentage, side: side })
  });
  
  const result = await response.json();
  return result.data.stop_price;
}, { ttl: 30 * 1000 }); // 30 seconds TTL
```

### CacheSyncManager

**תפקיד:** סנכרון Frontend ↔ Backend

**Business Logic Integration:**

```javascript
// After mutation (create/update/delete)
if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction('trade-created');
  // This invalidates all related Business Logic API cache
}
```

### Cache Invalidation Patterns

#### 1. After Mutations

```javascript
// After creating/updating/deleting entity
async function saveTrade(tradeData) {
  const result = await fetch('/api/trades/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeData)
  });
  
  if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
    await window.CacheSyncManager.invalidateByAction('trade-created');
  }
}
```

#### 2. Manual Invalidation

```javascript
// Manually invalidate specific cache
if (window.UnifiedCacheManager?.invalidate) {
  await window.UnifiedCacheManager.invalidate('business:calculate-stop-price:100:5:Long');
}
```

#### 3. Invalidate All Business Logic Cache

```javascript
// Invalidate all Business Logic API cache
if (window.UnifiedCacheManager?.invalidateByPattern) {
  await window.UnifiedCacheManager.invalidateByPattern('business:');
}
```

---

## 💻 דוגמאות קוד

### דוגמה 1: יצירת Service חדש

ראה [יצירת Business Service חדש](#יצירת-business-service-חדש) לפרטים מלאים.

### דוגמה 2: יצירת API Endpoint

ראה [שלב 3: יצירת API Endpoints](#שלב-3-יצירת-api-endpoints) לפרטים מלאים.

### דוגמה 3: יצירת Frontend Wrapper

ראה [שלב 4: יצירת Frontend Wrapper](#שלב-4-יצירת-frontend-wrapper) לפרטים מלאים.

### דוגמה 4: שימוש ב-Custom Initializer

```javascript
// In page-initialization-configs.js
trades: {
  name: 'Trades',
  packages: ['base', 'services', 'ui'],
  requiredGlobals: ['TradesData', 'UnifiedCacheManager', 'CacheTTLGuard'],
  customInitializers: [
    async (pageConfig) => {
      // Wait for Data Services
      if (!window.TradesData) {
        await new Promise(resolve => {
          const checkInterval = setInterval(() => {
            if (window.TradesData) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      }
      
      // Use Business Logic API
      const defaultTrade = {
        price: 100,
        quantity: 10,
        side: 'buy',
        investment_type: 'Swing',
        status: 'open'
      };
      
      const validationResult = await window.TradesData.validateTrade(defaultTrade);
      
      if (!validationResult.is_valid) {
        window.Logger?.warn?.('Default trade validation failed', {
          errors: validationResult.errors
        });
      }
    }
  ]
}
```

---

## ✅ Best Practices

### 1. תמיד השתמש ב-Wrappers

✅ **נכון:**
```javascript
const result = await window.TradesData.calculateStopPrice(100, 5, 'Long');
```

❌ **לא נכון:**
```javascript
const response = await fetch('/api/business/trade/calculate-stop-price', {...});
```

### 2. בדוק זמינות Data Services

✅ **נכון:**
```javascript
if (window.TradesData?.validateTrade) {
  const result = await window.TradesData.validateTrade(data);
}
```

❌ **לא נכון:**
```javascript
const result = await window.TradesData.validateTrade(data); // May fail if not loaded
```

### 3. השתמש ב-CacheTTLGuard

✅ **נכון:**
```javascript
return await window.CacheTTLGuard.ensure(cacheKey, async () => {
  // API call
}, { ttl: 30 * 1000 });
```

❌ **לא נכון:**
```javascript
const response = await fetch('/api/business/...'); // No caching
```

### 4. Invalidate Cache אחרי Mutations

✅ **נכון:**
```javascript
if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction('trade-created');
}
```

❌ **לא נכון:**
```javascript
// No cache invalidation - stale data
```

### 5. טיפול בשגיאות

✅ **נכון:**
```javascript
try {
  const result = await window.TradesData.validateTrade(data);
  if (!result.is_valid) {
    window.showErrorNotification?.('שגיאת ולידציה', result.errors.join(', '));
    return;
  }
} catch (error) {
  window.Logger?.error?.('Error validating trade', { error });
  window.showErrorNotification?.('שגיאה', 'שגיאה בבדיקת ולידציה');
}
```

❌ **לא נכון:**
```javascript
const result = await window.TradesData.validateTrade(data); // No error handling
```

---

## ⚠️ Common Pitfalls

### 1. שכחת Cache Invalidation

**בעיה:**
```javascript
// After creating trade, cache is not invalidated
await window.TradesData.saveTrade(tradeData);
// Cache still contains old data
```

**פתרון:**
```javascript
const result = await window.TradesData.saveTrade(tradeData);
if (result.status === 'success' && window.CacheSyncManager?.invalidateByAction) {
  await window.CacheSyncManager.invalidateByAction('trade-created');
}
```

### 2. שימוש בקוד ישן במקום Wrapper

**בעיה:**
```javascript
// Using old local calculation instead of Business Logic API
function calculateStopPrice(price, percentage) {
  return price * (1 - percentage / 100); // Old code
}
```

**פתרון:**
```javascript
// Use Business Logic API wrapper
const stopPrice = await window.TradesData.calculateStopPrice(price, percentage, 'Long');
```

### 3. אי-שימוש ב-Custom Initializers

**בעיה:**
```javascript
// Calling Business Logic API before Data Services are loaded
window.addEventListener('DOMContentLoaded', async () => {
  const result = await window.TradesData.validateTrade(data); // May fail
});
```

**פתרון:**
```javascript
// Use Custom Initializer in page-initialization-configs.js
customInitializers: [
  async (pageConfig) => {
    // Data Services are guaranteed to be loaded here
    const result = await window.TradesData.validateTrade(data);
  }
]
```

### 4. אי-בדיקת זמינות Systems

**בעיה:**
```javascript
// Not checking if Cache System is available
const result = await window.CacheTTLGuard.ensure(...); // May fail
```

**פתרון:**
```javascript
if (window.CacheTTLGuard?.ensure) {
  return await window.CacheTTLGuard.ensure(cacheKey, async () => {
    // API call
  }, { ttl: 30 * 1000 });
}

// Fallback if CacheTTLGuard not available
const response = await fetch('/api/business/...');
```

### 5. אי-שימוש ב-CacheKeyHelper

**בעיה:**
```javascript
// Inconsistent cache keys
const cacheKey = `business:validate-trade:${JSON.stringify(tradeData)}`;
```

**פתרון:**
```javascript
// Use CacheKeyHelper for consistent keys
const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
  ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-trade', tradeData)
  : `business:validate-trade:${JSON.stringify(tradeData)}`;
```

---

## 📚 קישורים נוספים

- [Business Logic Layer Documentation](../../02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md)
- [Business Rules Registry Documentation](../../02-ARCHITECTURE/BACKEND/BUSINESS_RULES_REGISTRY.md)
- [Business Logic Migration Guide](BUSINESS_LOGIC_MIGRATION_GUIDE.md)
- [Data Services Developer Guide](DATA_SERVICES_DEVELOPER_GUIDE.md)

---

**תאריך עדכון אחרון:** 22 נובמבר 2025  
**גרסה:** 1.0.0

