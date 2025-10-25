# JSDoc Guide - TikTrack

## Overview
מדריך מקיף להוספת JSDoc לכל הפונקציות והמערכות ב-TikTrack.

## 📋 JSDoc Standards

### 1. Basic Function Documentation

#### Simple Function
```javascript
/**
 * Calculate the sum of two numbers
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 * 
 * @example
 * const result = add(2, 3); // Returns 5
 */
function add(a, b) {
    return a + b;
}
```

#### Async Function
```javascript
/**
 * Load user data from server
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Options object
 * @param {boolean} options.forceRefresh - Force refresh from server
 * @param {number} options.cacheTTL - Cache time-to-live in seconds
 * @returns {Promise<Object>} User data object
 * @throws {Error} When user not found or server error
 * 
 * @example
 * // Basic usage
 * const user = await loadUserData('123');
 * 
 * @example
 * // With options
 * const user = await loadUserData('123', {
 *     forceRefresh: true,
 *     cacheTTL: 600
 * });
 */
async function loadUserData(userId, options = {}) {
    // Implementation
}
```

### 2. Class Documentation

#### Basic Class
```javascript
/**
 * UserManager - Manages user operations
 * ====================================
 * 
 * Handles user authentication, data loading, and preferences management.
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * @example
 * const userManager = new UserManager({ apiUrl: '/api/users' });
 * await userManager.loadUser('123');
 */
class UserManager {
    /**
     * Create UserManager instance
     * 
     * @param {Object} config - Configuration object
     * @param {string} config.apiUrl - API base URL
     * @param {number} config.timeout - Request timeout in ms
     * @param {boolean} config.cacheEnabled - Enable caching
     */
    constructor(config = {}) {
        this.config = config;
    }
    
    /**
     * Load user data by ID
     * 
     * @param {string} userId - User ID
     * @param {Object} options - Load options
     * @param {boolean} options.includePreferences - Include user preferences
     * @returns {Promise<Object>} User data
     * @throws {Error} When user not found
     * 
     * @example
     * const user = await userManager.loadUser('123');
     */
    async loadUser(userId, options = {}) {
        // Implementation
    }
}
```

### 3. Type Definitions

#### Custom Types
```javascript
/**
 * @typedef {Object} UserData
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {Object} preferences - User preferences
 * @property {string} preferences.theme - Theme preference
 * @property {string} preferences.language - Language preference
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Success status
 * @property {Object} data - Response data
 * @property {string} message - Response message
 * @property {number} timestamp - Response timestamp
 */

/**
 * Load user data from API
 * 
 * @param {string} userId - User ID
 * @returns {Promise<ApiResponse>} API response
 */
async function loadUserData(userId) {
    // Implementation
}
```

### 4. Event Handlers

#### DOM Event Handler
```javascript
/**
 * Handle form submission
 * 
 * @param {Event} event - Form submit event
 * @param {HTMLFormElement} event.target - Form element
 * @returns {Promise<void>}
 * @throws {Error} When form validation fails
 * 
 * @example
 * form.addEventListener('submit', handleFormSubmit);
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    // Implementation
}
```

#### Custom Event Handler
```javascript
/**
 * Handle user data change event
 * 
 * @param {CustomEvent} event - Custom event
 * @param {Object} event.detail - Event data
 * @param {string} event.detail.userId - User ID
 * @param {Object} event.detail.userData - User data
 * @returns {void}
 * 
 * @example
 * document.addEventListener('userDataChanged', handleUserDataChange);
 */
function handleUserDataChange(event) {
    const { userId, userData } = event.detail;
    // Implementation
}
```

### 5. Utility Functions

#### Data Processing
```javascript
/**
 * Process and validate user data
 * 
 * @param {Object} rawData - Raw user data
 * @param {string} rawData.name - User name
 * @param {string} rawData.email - User email
 * @param {Object} options - Processing options
 * @param {boolean} options.validateEmail - Validate email format
 * @param {boolean} options.normalizeName - Normalize name format
 * @returns {Object} Processed user data
 * @throws {ValidationError} When validation fails
 * 
 * @example
 * const processedData = processUserData(rawData, {
 *     validateEmail: true,
 *     normalizeName: true
 * });
 */
function processUserData(rawData, options = {}) {
    // Implementation
}
```

#### Formatting Functions
```javascript
/**
 * Format currency value
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting
 * @param {number} options.decimals - Number of decimal places
 * @returns {string} Formatted currency string
 * 
 * @example
 * const formatted = formatCurrency(1234.56, 'USD'); // "$1,234.56"
 */
function formatCurrency(amount, currency = 'USD', options = {}) {
    // Implementation
}
```

### 6. API Functions

#### HTTP Requests
```javascript
/**
 * Make HTTP request to API
 * 
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request data
 * @param {Object} options.headers - Request headers
 * @param {number} options.timeout - Request timeout in ms
 * @returns {Promise<Object>} API response
 * @throws {NetworkError} When network request fails
 * @throws {ApiError} When API returns error
 * 
 * @example
 * const response = await apiRequest('/api/users', {
 *     method: 'POST',
 *     data: { name: 'John', email: 'john@example.com' }
 * });
 */
async function apiRequest(endpoint, options = {}) {
    // Implementation
}
```

#### Cache Operations
```javascript
/**
 * Get data from cache
 * 
 * @param {string} key - Cache key
 * @param {Object} options - Cache options
 * @param {boolean} options.ignoreExpiry - Ignore expiry time
 * @returns {Object|null} Cached data or null if not found
 * 
 * @example
 * const cachedData = getFromCache('user-123');
 */
function getFromCache(key, options = {}) {
    // Implementation
}

/**
 * Set data in cache
 * 
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {boolean} options.persistent - Persist across sessions
 * @returns {boolean} Success status
 * 
 * @example
 * const success = setInCache('user-123', userData, { ttl: 300 });
 */
function setInCache(key, data, options = {}) {
    // Implementation
}
```

### 7. UI Functions

#### DOM Manipulation
```javascript
/**
 * Create and append element to container
 * 
 * @param {string} tagName - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} attributes.className - CSS class name
 * @param {string} attributes.id - Element ID
 * @param {string} textContent - Element text content
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement} Created element
 * 
 * @example
 * const button = createElement('button', {
 *     className: 'btn btn-primary',
 *     textContent: 'Click me'
 * }, document.body);
 */
function createElement(tagName, attributes = {}, container = null) {
    // Implementation
}
```

#### Event Binding
```javascript
/**
 * Bind event listener to element
 * 
 * @param {HTMLElement} element - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler function
 * @param {Object} options - Event options
 * @param {boolean} options.once - Remove listener after first call
 * @param {boolean} options.passive - Passive event listener
 * @returns {Function} Unbind function
 * 
 * @example
 * const unbind = bindEvent(button, 'click', handleClick, { once: true });
 */
function bindEvent(element, eventType, handler, options = {}) {
    // Implementation
}
```

### 8. Validation Functions

#### Input Validation
```javascript
/**
 * Validate user input
 * 
 * @param {Object} input - Input data
 * @param {string} input.name - User name
 * @param {string} input.email - User email
 * @param {Object} rules - Validation rules
 * @param {boolean} rules.required - Required fields
 * @param {RegExp} rules.emailPattern - Email pattern
 * @returns {Object} Validation result
 * @returns {boolean} returns.isValid - Validation status
 * @returns {Array<string>} returns.errors - Error messages
 * 
 * @example
 * const result = validateInput({ name: 'John', email: 'john@example.com' });
 * if (!result.isValid) {
 *     console.log('Validation errors:', result.errors);
 * }
 */
function validateInput(input, rules = {}) {
    // Implementation
}
```

### 9. Configuration Functions

#### System Configuration
```javascript
/**
 * Configure system settings
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.apiUrl - API base URL
 * @param {number} config.timeout - Request timeout
 * @param {boolean} config.debug - Debug mode
 * @param {Object} config.cache - Cache configuration
 * @param {number} config.cache.ttl - Cache TTL
 * @param {boolean} config.cache.enabled - Cache enabled
 * @returns {void}
 * 
 * @example
 * configureSystem({
 *     apiUrl: '/api',
 *     timeout: 5000,
 *     debug: true,
 *     cache: { ttl: 300, enabled: true }
 * });
 */
function configureSystem(config) {
    // Implementation
}
```

### 10. Error Handling

#### Error Classes
```javascript
/**
 * Custom error class for validation errors
 * 
 * @class ValidationError
 * @extends Error
 * @param {string} message - Error message
 * @param {string} field - Field that failed validation
 * @param {string} code - Error code
 */
class ValidationError extends Error {
    /**
     * Create ValidationError instance
     * 
     * @param {string} message - Error message
     * @param {string} field - Field name
     * @param {string} code - Error code
     */
    constructor(message, field, code) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
    }
}
```

#### Error Handling Functions
```javascript
/**
 * Handle and log errors
 * 
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 * @param {string} context.operation - Operation that failed
 * @param {Object} context.data - Data related to error
 * @returns {void}
 * 
 * @example
 * try {
 *     await riskyOperation();
 * } catch (error) {
 *     handleError(error, { operation: 'loadUserData', data: { userId: '123' } });
 * }
 */
function handleError(error, context = {}) {
    // Implementation
}
```

## 📊 JSDoc Tags Reference

### 1. Basic Tags
- `@param` - Parameter description
- `@returns` - Return value description
- `@throws` - Exception description
- `@example` - Usage example
- `@since` - Version when added
- `@deprecated` - Mark as deprecated
- `@see` - Reference to related documentation

### 2. Advanced Tags
- `@typedef` - Type definition
- `@callback` - Callback function
- `@template` - Generic type parameter
- `@extends` - Class inheritance
- `@implements` - Interface implementation
- `@override` - Override parent method
- `@abstract` - Abstract method
- `@static` - Static method
- `@private` - Private member
- `@protected` - Protected member
- `@public` - Public member

### 3. TikTrack Specific Tags
- `@version` - Version number
- `@created` - Creation date
- `@updated` - Last update date
- `@author` - Author information
- `@system` - System name
- `@integration` - Integration points
- `@performance` - Performance notes
- `@security` - Security considerations

## 🎯 Best Practices

### 1. Documentation Structure
```javascript
/**
 * Function description
 * 
 * @param {type} param - Parameter description
 * @returns {type} Return description
 * @throws {Error} Error description
 * 
 * @example
 * const result = functionName(param);
 */
```

### 2. Type Annotations
```javascript
// Use specific types
@param {string} userId - User ID
@param {number} count - Item count
@param {boolean} enabled - Enable flag
@param {Object} options - Options object
@param {Array<string>} items - String array
@param {Promise<Object>} result - Promise returning object
```

### 3. Examples
```javascript
/**
 * @example
 * // Basic usage
 * const result = functionName('param');
 * 
 * @example
 * // Advanced usage
 * const result = functionName('param', { option: true });
 */
```

### 4. Error Documentation
```javascript
/**
 * @throws {ValidationError} When input is invalid
 * @throws {NetworkError} When network request fails
 * @throws {Error} When unexpected error occurs
 */
```

### 5. Version Information
```javascript
/**
 * @version 1.0.0
 * @created January 2025
 * @updated January 2025
 * @author TikTrack Development Team
 */
```

## 🚀 Implementation Plan

### Phase 1: Core Systems
1. **Logger Service** - Add JSDoc to all methods
2. **Cache Manager** - Document all cache operations
3. **Notification System** - Document notification functions
4. **Field Renderer** - Document rendering methods

### Phase 2: UI Systems
1. **Button System** - Document button creation
2. **Table System** - Document table operations
3. **Chart System** - Document chart functions
4. **Form System** - Document form handling

### Phase 3: Page Functions
1. **Index Page** - Document dashboard functions
2. **Trades Page** - Document trade operations
3. **Preferences Page** - Document settings functions
4. **All Other Pages** - Document page-specific functions

### Phase 4: Utility Functions
1. **Date Utils** - Document date functions
2. **Data Utils** - Document data processing
3. **Validation Utils** - Document validation functions
4. **Format Utils** - Document formatting functions

## 📈 Quality Metrics

### 1. Coverage Targets
- **Functions**: 100% JSDoc coverage
- **Classes**: 100% JSDoc coverage
- **Methods**: 100% JSDoc coverage
- **Parameters**: 100% documented
- **Returns**: 100% documented
- **Examples**: 80% coverage

### 2. Quality Standards
- All functions must have description
- All parameters must be documented
- All return values must be documented
- All exceptions must be documented
- Complex functions must have examples
- All classes must have overview

### 3. Validation
- Use ESLint JSDoc rules
- Validate with JSDoc CLI
- Check for missing documentation
- Verify example accuracy
- Test documentation generation

## 🔧 Tools and Automation

### 1. JSDoc CLI
```bash
# Generate documentation
npx jsdoc -c jsdoc.conf.json

# Validate JSDoc
npx jsdoc -X

# Check for missing documentation
npx jsdoc -X | grep "Missing"
```

### 2. ESLint Integration
```javascript
// .eslintrc.js
rules: {
    'jsdoc/require-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-example': 'warn'
}
```

### 3. Automated Documentation
```bash
# Generate docs on commit
npm run docs:generate

# Validate docs
npm run docs:validate

# Update docs
npm run docs:update
```

## 📚 Additional Resources

- [JSDoc Documentation](https://jsdoc.app/)
- [JSDoc Tags](https://jsdoc.app/tags.html)
- [JSDoc Examples](https://jsdoc.app/about-getting-started.html)
- [ESLint JSDoc Plugin](https://github.com/gajus/eslint-plugin-jsdoc)
