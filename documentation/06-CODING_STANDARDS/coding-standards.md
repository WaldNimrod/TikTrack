# TikTrack Coding Standards

## Overview
סטנדרטי קוד אחידים לכל מערכת TikTrack - JavaScript, HTML, CSS.

## 🚨 Rule #1 - Use Existing General Systems (CRITICAL)
**לפני כל כתיבת פונקציה או קוד מקומי - חובה לבדוק היטב אם קיים קוד כללי במערכת.**

### כללים מחייבים:
1. **בדיקה ראשונית חובה**: לפני כתיבת כל פונקציה מקומית - יש לחפש קודם אם קיים קוד כללי
2. **עדיפות למערכות כלליות**: רוב הלוגיקה נמצא במערכות כלליות - יש להשתמש בהן תמיד לפני כתיבת קוד מקומי
3. **התייחסות לתיעוד**: יש לבדוק את המקורות הבאים:
   - **רשימת מערכות כלליות**: [`documentation/frontend/GENERAL_SYSTEMS_LIST.md`](../../frontend/GENERAL_SYSTEMS_LIST.md) - רשימה מלאה של כל המערכות הכלליות במערכת
   - **מניפסט חבילות**: `trading-ui/scripts/init-system/package-manifest.js` - רשימת חבילות טעינה ומערכות
   - **אינדקס תיעוד**: `documentation/INDEX.md` - אינדקס מלא של כל התיעוד
4. **רק אם חסר**: יש לכתוב קוד מקומי רק אם לאחר חיפוש יסודי לא נמצאה מערכת כללית

### דוגמאות למערכות כלליות:
- `FieldRendererService` - לרנדור סטטוסים, סוגים, סכומים, צדדים
- `checkLinkedItemsBeforeAction()` - לבדיקת פריטים מקושרים לפני מחיקה/ביטול
- `updatePageSummaryStats()` - לעדכון סטטיסטיקות עמוד (ב-ui-utils.js)
- `ModalManagerV2` - לניהול מודלים
- `CRUDResponseHandler` - לטיפול בפעולות CRUD

### דוגמה לעבירה (שגוי):
```javascript
// ❌ אסור: כתיבת פונקציה מקומית בלי לבדוק מערכות כלליות
function getStatusClassForTradePlan(status) {
  switch (status) {
    case 'open': return 'status-open';
    // ...
  }
}
```

### גישה נכונה (נכון):
```javascript
// ✅ נכון: שימוש במערכת כללית קיימת
window.FieldRendererService.renderStatus(design.status, 'trade_plan')
```

**חוק זה הוא כללי יסוד שכל מפתח חייב לעמוד בו.**

## 📋 Table of Contents
1. [JavaScript Standards](#javascript-standards)
2. [HTML Standards](#html-standards)
3. [CSS Standards](#css-standards)
4. [JSDoc Standards](#jsdoc-standards)
5. [File Organization](#file-organization)
6. [Naming Conventions](#naming-conventions)
7. [Error Handling](#error-handling)
8. [Performance Guidelines](#performance-guidelines)
9. [Testing Standards](#testing-standards)
10. [Documentation Standards](#documentation-standards)

## JavaScript Standards

### 1. Code Structure

#### Class Definition
```javascript
/**
 * ClassName - Brief description
 * =================================
 * 
 * Detailed description of the class purpose
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
class ClassName {
    /**
     * Constructor description
     * @param {Object} config - Configuration object
     * @param {string} config.option1 - Description
     * @param {number} config.option2 - Description
     */
    constructor(config = {}) {
        this.config = config;
        this.initialized = false;
        
        this.init();
    }
    
    /**
     * Initialize the class
     * @private
     */
    async init() {
        try {
            // Initialization logic
            this.initialized = true;
        } catch (error) {
            Logger.error('Class initialization failed', { error: error.message });
            throw error;
        }
    }
}
```

#### Function Definition
```javascript
/**
 * Function description
 * 
 * @param {string} param1 - Parameter description
 * @param {Object} param2 - Parameter description
 * @param {Object} options - Options object
 * @param {boolean} options.option1 - Option description
 * @param {number} options.option2 - Option description
 * @returns {Promise<Object>} Return description
 * @throws {Error} Error description
 * 
 * @example
 * const result = await functionName('param1', { key: 'value' }, { option1: true });
 */
async function functionName(param1, param2, options = {}) {
    try {
        // Function logic
        return result;
    } catch (error) {
        Logger.error('Function failed', { param1, error: error.message });
        throw error;
    }
}
```

### 2. Variable Declarations

#### Constants
```javascript
// Use UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.tiktrack.com';
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_TTL = 300; // 5 minutes
```

#### Variables
```javascript
// Use camelCase for variables
const userName = 'john_doe';
const isLoggedIn = true;
const userPreferences = { theme: 'dark' };
```

#### Destructuring
```javascript
// Prefer destructuring for object properties
const { name, email, preferences } = user;
const { theme, language } = preferences;

// Use rest operator for remaining properties
const { id, ...userData } = user;
```

### 3. Control Structures

#### If Statements
```javascript
// Use early returns to reduce nesting
if (!user) {
    throw new Error('User not found');
}

if (!user.isActive) {
    return null;
}

// Continue with main logic
```

#### Switch Statements
```javascript
switch (status) {
    case 'active':
        return 'User is active';
    case 'inactive':
        return 'User is inactive';
    case 'pending':
        return 'User is pending';
    default:
        throw new Error(`Unknown status: ${status}`);
}
```

#### Loops
```javascript
// Use for...of for arrays
for (const item of items) {
    processItem(item);
}

// Use for...in for objects (with hasOwnProperty check)
for (const key in object) {
    if (object.hasOwnProperty(key)) {
        processProperty(key, object[key]);
    }
}

// Use forEach for side effects
items.forEach(item => {
    processItem(item);
});

// Use map for transformations
const processedItems = items.map(item => processItem(item));
```

### 4. Async/Await

#### Async Functions
```javascript
// Always use async/await instead of Promises
async function loadUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        return userData;
    } catch (error) {
        Logger.error('Failed to load user data', { userId, error: error.message });
        throw error;
    }
}
```

#### Promise Handling
```javascript
// Use Promise.all for parallel operations
const [userData, preferences, settings] = await Promise.all([
    loadUserData(userId),
    loadUserPreferences(userId),
    loadUserSettings(userId)
]);

// Use Promise.allSettled for operations that can fail independently
const results = await Promise.allSettled([
    loadUserData(userId),
    loadUserPreferences(userId)
]);

results.forEach((result, index) => {
    if (result.status === 'rejected') {
        Logger.error(`Operation ${index} failed`, { error: result.reason });
    }
});
```

## HTML Standards

### 1. Document Structure

#### HTML5 Document
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - TikTrack</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="icon" href="favicon.ico">
</head>
<body>
    <!-- Page content -->
</body>
</html>
```

#### Semantic HTML
```html
<!-- Use semantic HTML elements -->
<header class="page-header">
    <h1>Page Title</h1>
    <nav class="main-navigation">
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/trades">Trades</a></li>
        </ul>
    </nav>
</header>

<main class="page-content">
    <section class="content-section">
        <h2>Section Title</h2>
        <article class="content-article">
            <p>Article content</p>
        </article>
    </section>
</main>

<footer class="page-footer">
    <p>&copy; 2025 TikTrack. All rights reserved.</p>
</footer>
```

### 2. Form Elements

#### Form Structure
```html
<form id="user-form" class="form-container" novalidate>
    <div class="form-group">
        <label for="username" class="form-label">Username:</label>
        <input type="text" id="username" name="username" class="form-input" required>
        <div class="form-error" id="username-error"></div>
    </div>
    
    <div class="form-group">
        <label for="email" class="form-label">Email:</label>
        <input type="email" id="email" name="email" class="form-input" required>
        <div class="form-error" id="email-error"></div>
    </div>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="reset" class="btn btn-secondary">Reset</button>
    </div>
</form>
```

### 3. Accessibility

#### ARIA Attributes
```html
<!-- Use ARIA attributes for accessibility -->
<button type="button" 
        class="btn btn-primary" 
        aria-label="Close dialog"
        aria-expanded="false"
        aria-controls="dialog-content">
    Close
</button>

<div role="alert" aria-live="polite" id="error-message"></div>

<!-- Use proper heading hierarchy -->
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
```

## CSS Standards

### 1. CSS Organization

#### File Structure
```css
/* ========================================
 * File Name - Brief Description
 * ========================================
 * 
 * Detailed description of the file purpose
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

/* ===== VARIABLES ===== */
:root {
    --primary-color: #26baac;
    --secondary-color: #fc5a06;
    --text-color: #333;
    --background-color: #fff;
    --border-radius: 4px;
    --spacing-unit: 8px;
}

/* ===== BASE STYLES ===== */
* {
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

/* ===== COMPONENTS ===== */
.btn {
    display: inline-block;
    padding: var(--spacing-unit) calc(var(--spacing-unit) * 2);
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: color-mix(in srgb, var(--primary-color) 80%, black);
}

/* ===== UTILITIES ===== */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.mb-1 { margin-bottom: var(--spacing-unit); }
.mb-2 { margin-bottom: calc(var(--spacing-unit) * 2); }
.mb-3 { margin-bottom: calc(var(--spacing-unit) * 3); }
```

### 2. CSS Methodology

#### BEM (Block Element Modifier)
```css
/* Block */
.card { }

/* Element */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier */
.card--large { }
.card--small { }
.card--primary { }

/* Element with modifier */
.card__header--highlighted { }
```

#### Component Structure
```css
/* Component: Button */
.btn {
    /* Base styles */
}

.btn--primary {
    /* Primary variant */
}

.btn--large {
    /* Large size */
}

.btn--disabled {
    /* Disabled state */
}

/* Component: Form */
.form { }
.form__group { }
.form__label { }
.form__input { }
.form__error { }
.form__actions { }
```

## JSDoc Standards

### 1. Function Documentation

#### Basic Function
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

#### Complex Function
```javascript
/**
 * Load user data from server with caching
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Options object
 * @param {boolean} options.forceRefresh - Force refresh from server
 * @param {number} options.cacheTTL - Cache time-to-live in seconds
 * @param {boolean} options.includePreferences - Include user preferences
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
 *     cacheTTL: 600,
 *     includePreferences: true
 * });
 */
async function loadUserData(userId, options = {}) {
    // Implementation
}
```

### 2. Class Documentation

#### Class with Methods
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
    
    /**
     * Save user data
     * 
     * @param {string} userId - User ID
     * @param {Object} userData - User data to save
     * @returns {Promise<boolean>} Success status
     * @throws {Error} When save fails
     */
    async saveUser(userId, userData) {
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

## File Organization

### 1. Directory Structure
```
trading-ui/
├── scripts/
│   ├── services/           # Service classes
│   │   ├── field-renderer-service.js
│   │   ├── notification-service.js
│   │   └── cache-service.js
│   ├── utils/             # Utility functions
│   │   ├── date-utils.js
│   │   ├── data-utils.js
│   │   └── validation-utils.js
│   ├── components/        # UI components
│   │   ├── button-system.js
│   │   ├── table-system.js
│   │   └── chart-system.js
│   └── pages/             # Page-specific scripts
│       ├── index.js
│       ├── trades.js
│       └── preferences.js
├── styles/
│   ├── main.css           # Main stylesheet
│   ├── components/        # Component styles
│   │   ├── buttons.css
│   │   ├── tables.css
│   │   └── forms.css
│   └── pages/             # Page-specific styles
│       ├── index.css
│       ├── trades.css
│       └── preferences.css
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

### 2. File Naming

#### JavaScript Files
```javascript
// Use kebab-case for file names
field-renderer-service.js
notification-system.js
unified-cache-manager.js

// Use descriptive names
button-system-init.js
table-management.js
chart-rendering.js
```

#### CSS Files
```css
/* Use kebab-case for CSS files */
main.css
button-system.css
table-styles.css
form-components.css
```

#### HTML Files
```html
<!-- Use kebab-case for HTML files -->
index.html
trades.html
trade-plans.html
trading-accounts.html
```

## Naming Conventions

### 1. Variables and Functions

#### camelCase for variables and functions
```javascript
const userName = 'john_doe';
const isLoggedIn = true;
const userPreferences = { theme: 'dark' };

function loadUserData() { }
function calculateTotal() { }
function validateForm() { }
```

#### PascalCase for classes and constructors
```javascript
class UserManager { }
class NotificationSystem { }
class CacheManager { }

function UserData() { }
function ApiResponse() { }
```

#### UPPER_SNAKE_CASE for constants
```javascript
const API_BASE_URL = 'https://api.tiktrack.com';
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_TTL = 300;
```

### 2. CSS Classes

#### BEM methodology
```css
/* Block */
.card { } */
.card { }

/* Element */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier */
.card--large { }
.card--small { }
.card--primary { }
```

### 3. HTML IDs and Classes

#### IDs use camelCase
```html
<div id="userProfile">
<div id="tradesTable">
<div id="notificationCenter">
```

#### Classes use kebab-case
```html
<div class="user-profile">
<div class="trades-table">
<div class="notification-center">
```

## Error Handling

### 1. Try-Catch Blocks

#### Basic Error Handling
```javascript
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    Logger.error('Operation failed', { error: error.message });
    throw error;
}
```

#### Specific Error Handling
```javascript
try {
    const result = await loadUserData(userId);
    return result;
} catch (error) {
    if (error.name === 'NetworkError') {
        Logger.warn('Network error, using cached data', { userId });
        return getCachedUserData(userId);
    } else if (error.name === 'ValidationError') {
        Logger.error('Validation error', { userId, error: error.message });
        showErrorNotification('Invalid user data');
        throw error;
    } else {
        Logger.error('Unexpected error', { userId, error: error.message });
        throw error;
    }
}
```

### 2. Error Types

#### Custom Error Classes
```javascript
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

// Usage
if (!userData.email) {
    throw new ValidationError('Email is required', 'email');
}
```

### 3. Error Logging

#### Structured Logging
```javascript
try {
    const result = await operation();
    Logger.info('Operation completed', { 
        operation: 'loadUserData',
        userId: userId,
        duration: performance.now() - startTime
    });
    return result;
} catch (error) {
    Logger.error('Operation failed', {
        operation: 'loadUserData',
        userId: userId,
        error: error.message,
        stack: error.stack,
        duration: performance.now() - startTime
    });
    throw error;
}
```

## Performance Guidelines

### 1. Code Optimization

#### Efficient Loops
```javascript
// Good - Use for...of for arrays
for (const item of items) {
    processItem(item);
}

// Good - Use map for transformations
const processedItems = items.map(item => processItem(item));

// Avoid - Don't use forEach for transformations
const processedItems = [];
items.forEach(item => {
    processedItems.push(processItem(item));
});
```

#### Memory Management
```javascript
// Good - Clear references
function cleanup() {
    this.data = null;
    this.cache.clear();
    this.listeners = [];
}

// Good - Use WeakMap for private data
const privateData = new WeakMap();

class MyClass {
    constructor() {
        privateData.set(this, { data: [] });
    }
}
```

### 2. Async Operations

#### Efficient Promise Handling
```javascript
// Good - Use Promise.all for parallel operations
const [userData, preferences, settings] = await Promise.all([
    loadUserData(userId),
    loadUserPreferences(userId),
    loadUserSettings(userId)
]);

// Good - Use Promise.allSettled for independent operations
const results = await Promise.allSettled([
    loadUserData(userId),
    loadUserPreferences(userId)
]);
```

#### Debouncing and Throttling
```javascript
// Debounce search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSearch = debounce(searchFunction, 300);
```

## Testing Standards

### 1. Unit Tests

#### Test Structure
```javascript
describe('UserManager', () => {
    let userManager;
    
    beforeEach(() => {
        userManager = new UserManager({
            apiUrl: '/api/users',
            timeout: 5000
        });
    });
    
    afterEach(() => {
        userManager = null;
    });
    
    describe('loadUser', () => {
        it('should load user data successfully', async () => {
            // Arrange
            const userId = '123';
            const expectedUser = { id: '123', name: 'John Doe' };
            
            // Act
            const result = await userManager.loadUser(userId);
            
            // Assert
            expect(result).toEqual(expectedUser);
        });
        
        it('should throw error for invalid user ID', async () => {
            // Arrange
            const invalidUserId = 'invalid';
            
            // Act & Assert
            await expect(userManager.loadUser(invalidUserId))
                .rejects.toThrow('User not found');
        });
    });
});
```

### 2. Integration Tests

#### API Integration
```javascript
describe('User API Integration', () => {
    it('should load user data from API', async () => {
        // Arrange
        const userId = '123';
        const expectedUser = { id: '123', name: 'John Doe' };
        
        // Mock API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(expectedUser)
        });
        
        // Act
        const result = await loadUserData(userId);
        
        // Assert
        expect(result).toEqual(expectedUser);
        expect(fetch).toHaveBeenCalledWith(`/api/users/${userId}`);
    });
});
```

## Documentation Standards

### 1. Code Comments

#### Function Comments
```javascript
/**
 * Calculate the total price including tax
 * 
 * @param {number} basePrice - Base price before tax
 * @param {number} taxRate - Tax rate as decimal (0.1 for 10%)
 * @returns {number} Total price including tax
 * 
 * @example
 * const total = calculateTotalPrice(100, 0.1); // Returns 110
 */
function calculateTotalPrice(basePrice, taxRate) {
    return basePrice * (1 + taxRate);
}
```

#### Complex Logic Comments
```javascript
// Calculate user score based on multiple factors
function calculateUserScore(user) {
    let score = 0;
    
    // Base score from user level
    score += user.level * 10;
    
    // Bonus for premium users
    if (user.isPremium) {
        score += 50;
    }
    
    // Penalty for inactive users
    if (user.lastLogin < Date.now() - 30 * 24 * 60 * 60 * 1000) {
        score -= 20;
    }
    
    return Math.max(0, score); // Ensure non-negative score
}
```

### 2. README Files

#### Project README
```markdown
# TikTrack - Trading Management System

## Overview
TikTrack is a comprehensive trading management system built with modern web technologies.

## Features
- User management
- Trade tracking
- Real-time notifications
- Data visualization

## Installation
```bash
npm install
npm start
```

## Development
```bash
npm run dev
npm run test
npm run lint
```

## API Documentation
See [API Reference](documentation/03-API_REFERENCE/README.md)

## Contributing
See [Coding Standards](documentation/06-CODING_STANDARDS/coding-standards.md)
```

## 🎯 Summary

### Key Principles
1. **Consistency** - Use consistent naming and structure
2. **Readability** - Write code that's easy to understand
3. **Maintainability** - Structure code for easy maintenance
4. **Performance** - Optimize for performance
5. **Testing** - Write comprehensive tests
6. **Documentation** - Document everything

### Tools and Automation
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **JSDoc** - Documentation generation
- **Jest** - Testing framework
- **Husky** - Git hooks

### Next Steps
1. Configure ESLint and Prettier
2. Set up automated testing
3. Implement code review process
4. Create development guidelines
5. Set up CI/CD pipeline
