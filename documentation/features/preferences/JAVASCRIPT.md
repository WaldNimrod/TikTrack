# Preferences.js Technical Documentation

## Overview

This document provides comprehensive technical documentation for the `preferences.js` file, which manages all client-side functionality for the TikTrack preferences page.

## Recent Updates (Version 2.5.0)

### Save Strategy Optimization
- **Changed from auto-save to batch save**: Users now control when to save all changes
- **Local memory updates**: Changes stored locally until user clicks "שמור שינויים"
- **Clear user feedback**: Info notifications for local updates, success for server saves

### Data Structure Handling
- **Fixed server response parsing**: Updated to handle direct object structure from server
- **Enhanced error handling**: Better handling of multiple data structure formats
- **Comprehensive logging**: Added detailed logging for debugging data flow issues

### API Endpoint Updates
- **Updated API paths**: Changed from `/api/preferences` to `/api/v1/preferences`
- **Fixed trailing slash issues**: Corrected PUT request URLs
- **Enhanced error handling**: Better handling of API responses

### New Preference Fields
- **Added `defaultCommission`**: Default commission rate setting
- **Added `consoleCleanupInterval`**: Console cleanup interval setting
- **Dynamic account filter population**: Account filter now loads from `window.accountsData`

## File Information

- **File**: `trading-ui/scripts/preferences.js`
- **Size**: 1,780 lines
- **Functions**: 64 total functions
- **Global Exports**: 44 window functions
- **Dependencies**: None (vanilla JavaScript)

## Architecture Overview

### Core Systems

1. **Preferences Management System**
2. **Section State Management System**
3. **Change Tracking System**
4. **API Communication Layer**
5. **Event Handling System**

## Function Categories

### 1. Preferences Management (12 functions)

#### Core CRUD Operations
```javascript
async function saveAllPreferences()
async function loadPreferencesToUI()
async function savePreference(key, value)
function getCurrentPreference(key)
```

#### Section-Specific Operations
```javascript
async function saveSystemPreferences()
async function resetSystemPreferences()
async function savePersonalPreferences()
async function resetPersonalPreferences()
async function saveSecurityPreferences()
async function resetSecurityPreferences()
async function saveDisplayPreferences()
async function resetDisplayPreferences()
```

### 2. Individual Preference Updates (9 functions)

```javascript
async function updatePrimaryCurrency(value)      // USD restriction enforced
async function updateTimezone(value)             // System timezone
async function updateDefaultStopLoss(value)      // Numeric validation
async function updateDefaultTargetPrice(value)   // Numeric validation
async function updateDefaultStatusFilter(value)  // Filter preferences
async function updateDefaultTypeFilter(value)
async function updateDefaultAccountFilter(value)
async function updateDefaultDateRangeFilter(value)
async function updateDefaultSearchFilter(value)
```

### 3. Section Management System (12 functions)

#### Main Section Controls
```javascript
function toggleAllSections()                     // Master toggle button
function toggleSection(sectionContainer)         // Individual section toggle
function saveSectionState(sectionContainer, isCollapsed)  // State persistence
function restoreAllSectionsState()               // Load saved states
function clearAllSectionsState()                 // Clear localStorage
```

#### Individual Section Toggles
```javascript
function toggleTopSection()                      // Top section toggle
function toggleSystemSection()                   // System settings section
function togglePersonalSection()                 // Personal settings section
function toggleSecuritySection()                 // Security settings section
function toggleDisplaySection()                  // Display settings section
function toggleTestingSection()                  // Testing section
```

#### Utility Functions
```javascript
function getSectionId(sectionContainer)          // Generate section ID
function debugSectionsState()                    // Debug helper
```

### 4. Change Tracking System (8 functions)

```javascript
// Global state variables
let hasUnsavedChanges = false;
let originalValues = {};

// Core change tracking
function markAsChanged()                         // Mark as having changes
function markAsSaved()                           // Mark as saved
function updatePageTitle()                       // Visual indicator
function checkForUnsavedChanges()               // Pre-navigation check
function saveOriginalValues()                    // Store initial values
function checkForChanges()                       // Compare current vs original
```

### 5. Testing Management (8 functions)

```javascript
async function saveTestPreferences()
async function resetTestPreferences()
async function runSelectedTests()
function toggleAllTestsInCategory(category)
function updateCategoryButtonStates()
// ... additional test management functions
```

### 6. Utility Functions (15 functions)

```javascript
function showNotification(message, type)         // User feedback
function validateNumericInput(value, min, max)   // Input validation
function formatCurrency(value)                   // Display formatting
function sanitizeInput(value)                    // Security
// ... additional utility functions
```

## Global Exports

All functions are exported to the global `window` object for HTML access:

```javascript
// Core preferences functions
window.saveAllPreferences = saveAllPreferences;
window.loadPreferencesToUI = loadPreferencesToUI;
window.savePreference = savePreference;

// Section management
window.toggleAllSections = toggleAllSections;
window.toggleSystemSection = toggleSystemSection;
window.togglePersonalSection = togglePersonalSection;
// ... all toggle functions

// Individual updaters
window.updatePrimaryCurrency = updatePrimaryCurrency;
window.updateTimezone = updateTimezone;
// ... all update functions

// Change tracking (internal use)
// hasUnsavedChanges and related functions not exported
```

## Data Structures

### Preferences Object Structure
```javascript
const preferencesData = {
  defaults: {
    primaryCurrency: "USD",
    timezone: "Asia/Jerusalem",
    defaultStopLoss: 5,
    defaultTargetPrice: 10,
    defaultStatusFilter: "all",
    defaultTypeFilter: "all",
    defaultAccountFilter: "all",
    defaultDateRangeFilter: "all",
    defaultSearchFilter: ""
  },
  user: {
    // User's current preferences (same structure as defaults)
  }
};
```

### Section State Storage
```javascript
// LocalStorage structure for section states
const sectionStates = {
  "preferences-top-section": false,      // false = expanded, true = collapsed
  "preferences-system-section": false,
  "preferences-personal-section": false,
  "preferences-security-section": false,
  "preferences-display-section": false,
  "preferences-testing-section": true    // collapsed by default
};
```

## API Integration

### Endpoints Used

#### GET /api/preferences
```javascript
// Loads all preferences from server
const response = await fetch('/api/preferences');
const data = await response.json();
// Returns: { defaults: {...}, user: {...} }
```

#### POST /api/preferences
```javascript
// Saves all preferences to server
const response = await fetch('/api/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(preferencesData)
});
// Returns: { message: "Preferences saved successfully", status: "success" }
```

#### PUT /api/preferences/{key}
```javascript
// Updates individual preference
const response = await fetch(`/api/preferences/${key}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: value })
});
// Returns: success/error status
```

## Event Handling

### Page Load Initialization
```javascript
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('🔄 Initializing preferences page...');
    
    // Load preferences from server
    loadPreferencesToUI().then(() => {
      console.log('✅ Preferences loaded successfully');
    });
    
    // Restore section states
    restoreAllSectionsState();
    
    // Save original values for change tracking
    setTimeout(() => {
      saveOriginalValues();
    }, 1000);
    
    console.log('✅ Preferences page initialized');
  } catch (error) {
    console.error('❌ Error initializing preferences page:', error);
    showNotification('Error loading preferences page', 'error');
  }
});
```

### Navigation Protection
```javascript
// Warn before leaving with unsaved changes
window.addEventListener('beforeunload', function(e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    return e.returnValue;
  }
});

// Intercept link clicks
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href && !link.href.includes('preferences') && hasUnsavedChanges) {
    const userChoice = checkForUnsavedChanges();
    if (userChoice) {
      e.preventDefault();
      return false;
    }
  }
});
```

## Business Logic

### Currency Restriction
```javascript
async function updatePrimaryCurrency(value) {
  console.log('🔄 Updating primary currency:', value);

  // USD-only restriction
  if (value !== 'USD') {
    showNotification('❌ Cannot change primary currency. System supports USD only.', 'error');
    
    // Revert selection
    const select = document.getElementById('primaryCurrencySelect');
    if (select) {
      select.value = 'USD';
    }
    return;
  }

  // Save if valid
  const success = await savePreference('primaryCurrency', value);
  if (success) {
    console.log('✅ Primary currency updated successfully');
    markAsSaved();
  }
}
```

### Input Validation
```javascript
async function updateDefaultStopLoss(value) {
  console.log('🔄 Updating default stop loss:', value);

  // Validate numeric input
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0 || numValue > 100) {
    showNotification('❌ Stop loss must be between 0-100%', 'error');
    return;
  }

  // Save valid value
  const success = await savePreference('defaultStopLoss', numValue);
  if (success) {
    markAsChanged();
  }
}
```

## Error Handling

### API Error Handling
```javascript
async function saveAllPreferences() {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencesData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ All preferences saved successfully');
    showNotification('All preferences saved successfully', 'success');
    markAsSaved();
    
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
    showNotification('Error saving preferences. Please try again.', 'error');
  }
}
```

### UI Error Handling
```javascript
function showNotification(message, type = 'success') {
  try {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#f8d7da' : '#d4edda';
    const textColor = type === 'error' ? '#721c24' : '#155724';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 20px;
      border-radius: 8px;
      background-color: ${bgColor};
      color: ${textColor};
      /* ... more styles ... */
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
    
  } catch (error) {
    console.error('Error showing notification:', error);
    // Fallback to alert if notification system fails
    alert(message);
  }
}
```

## Performance Considerations

### Debouncing
```javascript
// Input change detection with debouncing
let changeCheckTimeout;
function scheduleChangeCheck() {
  clearTimeout(changeCheckTimeout);
  changeCheckTimeout = setTimeout(() => {
    checkForChanges();
  }, 500); // 500ms debounce
}
```

### Efficient DOM Queries
```javascript
// Cache DOM elements to avoid repeated queries
const sectionElements = {
  top: document.querySelector('[data-section="top"]'),
  system: document.querySelector('[data-section="system"]'),
  personal: document.querySelector('[data-section="personal"]'),
  // ... cache other sections
};
```

### Memory Management
```javascript
// Clean up event listeners and timeouts
function cleanup() {
  clearTimeout(changeCheckTimeout);
  // Remove event listeners if needed
  // Clear large objects if needed
}

// Call cleanup on page unload
window.addEventListener('beforeunload', cleanup);
```

## Testing Guidelines

### Unit Testing
```javascript
// Example test structure for individual functions
describe('updatePrimaryCurrency', () => {
  test('should reject non-USD currencies', async () => {
    const result = await updatePrimaryCurrency('EUR');
    expect(result).toBe(false);
    expect(showNotificationSpy).toHaveBeenCalledWith(
      expect.stringContaining('USD only'), 
      'error'
    );
  });
});
```

### Integration Testing
```javascript
// Test API integration
describe('API Integration', () => {
  test('should save preferences successfully', async () => {
    const mockResponse = { message: 'Success', status: 'success' };
    fetch.mockResolvedValue({ ok: true, json: () => mockResponse });
    
    await saveAllPreferences();
    
    expect(fetch).toHaveBeenCalledWith('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String)
    });
  });
});
```

## Maintenance Guidelines

### Adding New Preferences
1. Add HTML form element in appropriate section
2. Create corresponding `update{PreferenceName}(value)` function
3. Add to `preferencesData.defaults` object
4. Include in `loadPreferencesToUI()` function
5. Add to appropriate section save/reset functions
6. Export to window object
7. Add validation if needed
8. Update documentation

### Modifying Sections
1. Update HTML structure
2. Modify section management functions
3. Update `getSectionId()` logic if needed
4. Test toggle operations
5. Update state persistence logic

### API Changes
1. Update endpoint URLs
2. Modify request/response handling
3. Update error handling
4. Test integration thoroughly
5. Update documentation

## Security Considerations

### Input Sanitization
```javascript
function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  
  // Remove potentially dangerous characters
  return value
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .trim(); // Remove whitespace
}
```

### XSS Prevention
- All user inputs are sanitized before display
- No `innerHTML` usage with user data
- All notifications use `textContent`
- API responses are validated before use

### CSRF Protection
- All API requests include proper headers
- No sensitive operations in GET requests
- Proper error handling for unauthorized requests

## Conclusion

The `preferences.js` file provides a comprehensive, well-structured system for managing user preferences with:
- Clean architecture and separation of concerns
- Robust error handling and user feedback
- Efficient performance and memory usage
- Comprehensive change tracking
- Strong security measures
- Extensive documentation and maintainability

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Author**: TikTrack Development Team
