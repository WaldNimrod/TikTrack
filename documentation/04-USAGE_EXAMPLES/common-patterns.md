# Common Patterns & Usage Examples

## Overview
תבניות נפוצות ודוגמאות שימוש למערכות TikTrack.

## 1. Page Initialization Pattern

### Standard Page Setup
```javascript
// 1. Wait for DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // 2. Initialize systems
    initializePage();
});

async function initializePage() {
    try {
        // 3. Load data
        const data = await loadPageData();
        
        // 4. Render UI
        renderPage(data);
        
        // 5. Setup event listeners
        setupEventListeners();
        
        // 6. Show success notification
        showSuccessNotification('עמוד נטען בהצלחה');
        
    } catch (error) {
        // 7. Handle errors
        Logger.error('Failed to initialize page', { error: error.message });
        showErrorNotification('שגיאה בטעינת העמוד');
    }
}
```

### Advanced Page Setup with Caching
```javascript
async function initializePageAdvanced() {
    try {
        // 1. Check cache first
        const cachedData = window.UnifiedCacheManager?.get('page-data');
        if (cachedData) {
            renderPage(cachedData);
            Logger.info('Page loaded from cache');
            return;
        }
        
        // 2. Load from server
        const data = await loadPageData();
        
        // 3. Cache the data
        await window.UnifiedCacheManager?.set('page-data', data, { ttl: 300 });
        
        // 4. Render UI
        renderPage(data);
        
        // 5. Setup systems
        setupPageSystems();
        
    } catch (error) {
        Logger.error('Page initialization failed', { error: error.message });
        showErrorNotification('שגיאה בטעינת העמוד');
    }
}
```

## 2. Data Loading Pattern

### Basic Data Loading
```javascript
async function loadPageData() {
    try {
        // 1. Show loading indicator
        showLoadingIndicator();
        
        // 2. Fetch data
        const response = await fetch('/api/data');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 3. Parse data
        const data = await response.json();
        
        // 4. Hide loading indicator
        hideLoadingIndicator();
        
        // 5. Log success
        Logger.info('Data loaded successfully', { count: data.length });
        
        return data;
        
    } catch (error) {
        // 6. Handle errors
        hideLoadingIndicator();
        Logger.error('Failed to load data', { error: error.message });
        throw error;
    }
}
```

### Advanced Data Loading with Retry
```javascript
async function loadPageDataWithRetry(maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            Logger.info(`Loading data (attempt ${attempt}/${maxRetries})`);
            
            const response = await fetch('/api/data');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            Logger.info('Data loaded successfully', { 
                attempt, 
                count: data.length 
            });
            
            return data;
            
        } catch (error) {
            lastError = error;
            Logger.warn(`Data loading failed (attempt ${attempt})`, { 
                error: error.message 
            });
            
            if (attempt < maxRetries) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    // All retries failed
    Logger.error('Data loading failed after all retries', { 
        error: lastError.message 
    });
    throw lastError;
}
```

## 3. Table Management Pattern

### Standard Table Setup
```javascript
function setupTable(tableId, data, actions) {
    try {
        // 1. Load table data
        loadTableData(tableId, data, {
            sortable: true,
            filterable: true,
            pagination: true
        });
        
        // 2. Add action buttons
        generateTableActions(tableId, actions);
        
        // 3. Setup table state
        const savedState = loadTableState(tableId);
        if (savedState) {
            applyTableState(tableId, savedState);
        }
        
        // 4. Setup event listeners
        setupTableEventListeners(tableId);
        
        Logger.info('Table setup completed', { tableId, rowCount: data.length });
        
    } catch (error) {
        Logger.error('Table setup failed', { tableId, error: error.message });
        showErrorNotification('שגיאה בהגדרת הטבלה');
    }
}

function setupTableEventListeners(tableId) {
    // Sort events
    document.querySelectorAll(`#${tableId} th[data-sortable]`).forEach(header => {
        header.addEventListener('click', (e) => {
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);
            sortTable(columnIndex, tableId);
        });
    });
    
    // Filter events
    const filterInput = document.querySelector(`#${tableId}-filter`);
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            filterTable(tableId, e.target.value);
        });
    }
}
```

### Advanced Table with Caching
```javascript
async function setupTableAdvanced(tableId, dataSource, actions) {
    try {
        // 1. Check cache first
        const cachedData = window.UnifiedCacheManager?.get(`table-${tableId}`);
        if (cachedData) {
            setupTable(tableId, cachedData, actions);
            Logger.info('Table loaded from cache', { tableId });
            return;
        }
        
        // 2. Load data from source
        const data = await dataSource();
        
        // 3. Cache the data
        await window.UnifiedCacheManager?.set(`table-${tableId}`, data, { ttl: 600 });
        
        // 4. Setup table
        setupTable(tableId, data, actions);
        
        Logger.info('Table setup completed', { tableId, rowCount: data.length });
        
    } catch (error) {
        Logger.error('Advanced table setup failed', { tableId, error: error.message });
        showErrorNotification('שגיאה בהגדרת הטבלה');
    }
}
```

## 4. Form Handling Pattern

### Standard Form
```javascript
function setupForm(formId, onSubmit, onReset) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // 1. Setup form validation
    setupFormValidation(form);
    
    // 2. Setup submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // 3. Validate form
            if (!validateForm(form)) {
                showWarningNotification('אנא מלא את כל השדות הנדרשים');
                return;
            }
            
            // 4. Show loading
            showLoadingIndicator();
            
            // 5. Submit form
            const formData = new FormData(form);
            const result = await onSubmit(formData);
            
            // 6. Handle success
            hideLoadingIndicator();
            showSuccessNotification('הנתונים נשמרו בהצלחה');
            
            // 7. Reset form if needed
            if (onReset) {
                onReset();
            }
            
        } catch (error) {
            // 8. Handle errors
            hideLoadingIndicator();
            Logger.error('Form submission failed', { error: error.message });
            showErrorNotification('שגיאה בשמירת הנתונים');
        }
    });
    
    // 9. Setup reset handler
    const resetBtn = form.querySelector('[type="reset"]');
    if (resetBtn && onReset) {
        resetBtn.addEventListener('click', onReset);
    }
}
```

### Advanced Form with Auto-save
```javascript
function setupFormAdvanced(formId, onSubmit, onReset) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    let autoSaveTimeout;
    
    // 1. Setup form validation
    setupFormValidation(form);
    
    // 2. Setup auto-save
    form.addEventListener('input', () => {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            autoSaveForm(form);
        }, 2000); // Auto-save after 2 seconds of inactivity
    });
    
    // 3. Setup submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            showLoadingIndicator();
            const formData = new FormData(form);
            const result = await onSubmit(formData);
            
            hideLoadingIndicator();
            showSuccessNotification('הנתונים נשמרו בהצלחה');
            
            // Clear auto-save data
            clearAutoSaveData(formId);
            
        } catch (error) {
            hideLoadingIndicator();
            Logger.error('Form submission failed', { error: error.message });
            showErrorNotification('שגיאה בשמירת הנתונים');
        }
    });
}

async function autoSaveForm(form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Save to cache
        await window.UnifiedCacheManager?.set(`form-${form.id}`, data, { ttl: 3600 });
        
        Logger.debug('Form auto-saved', { formId: form.id });
        
    } catch (error) {
        Logger.warn('Auto-save failed', { formId: form.id, error: error.message });
    }
}
```

## 5. Error Handling Pattern

### Standard Error Handling
```javascript
function handleError(error, context = {}) {
    // 1. Log error
    Logger.error('Operation failed', { 
        error: error.message,
        stack: error.stack,
        context 
    });
    
    // 2. Show user notification
    showErrorNotification('אירעה שגיאה. אנא נסה שוב.');
    
    // 3. Report to server if critical
    if (error.severity === 'critical') {
        reportErrorToServer(error, context);
    }
}

async function reportErrorToServer(error, context) {
    try {
        await fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            })
        });
    } catch (reportError) {
        Logger.error('Failed to report error to server', { 
            error: reportError.message 
        });
    }
}
```

### Advanced Error Handling with Recovery
```javascript
async function executeWithErrorHandling(operation, context = {}) {
    try {
        // 1. Execute operation
        const result = await operation();
        
        // 2. Log success
        Logger.info('Operation completed successfully', context);
        
        return result;
        
    } catch (error) {
        // 3. Handle different error types
        if (error.name === 'NetworkError') {
            return handleNetworkError(error, context);
        } else if (error.name === 'ValidationError') {
            return handleValidationError(error, context);
        } else if (error.name === 'PermissionError') {
            return handlePermissionError(error, context);
        } else {
            return handleGenericError(error, context);
        }
    }
}

async function handleNetworkError(error, context) {
    Logger.warn('Network error detected', { error: error.message, context });
    
    // Try to use cached data
    const cachedData = window.UnifiedCacheManager?.get(context.cacheKey);
    if (cachedData) {
        showWarningNotification('מצב לא מקוון - מוצגים נתונים שמורים');
        return cachedData;
    }
    
    // Show offline message
    showErrorNotification('אין חיבור לאינטרנט. אנא בדוק את החיבור שלך.');
    throw error;
}
```

## 6. Performance Optimization Pattern

### Lazy Loading Pattern
```javascript
function setupLazyLoading() {
    // 1. Setup intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadLazyContent(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    // 2. Observe lazy elements
    document.querySelectorAll('[data-lazy]').forEach(element => {
        observer.observe(element);
    });
}

async function loadLazyContent(element) {
    try {
        const dataSrc = element.dataset.src;
        if (!dataSrc) return;
        
        // Load content
        const response = await fetch(dataSrc);
        const content = await response.text();
        
        // Replace placeholder
        element.innerHTML = content;
        element.removeAttribute('data-lazy');
        
        Logger.debug('Lazy content loaded', { src: dataSrc });
        
    } catch (error) {
        Logger.error('Lazy loading failed', { 
            element: element.id, 
            error: error.message 
        });
    }
}
```

### Performance Monitoring Pattern
```javascript
function setupPerformanceMonitoring() {
    // 1. Monitor long tasks
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.duration > 50) { // 50ms threshold
                    Logger.warn('Long task detected', {
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                }
            });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
    }
    
    // 2. Monitor memory usage
    if ('memory' in performance) {
        setInterval(() => {
            const memory = performance.memory;
            if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                Logger.warn('High memory usage detected', {
                    used: memory.usedJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
                });
            }
        }, 30000); // Check every 30 seconds
    }
}
```

## 7. Cache Management Pattern

### Smart Caching Strategy
```javascript
async function loadDataWithCache(key, dataLoader, options = {}) {
    const {
        ttl = 300, // 5 minutes default
        forceRefresh = false,
        fallbackToCache = true
    } = options;
    
    try {
        // 1. Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cachedData = window.UnifiedCacheManager?.get(key);
            if (cachedData) {
                Logger.debug('Data loaded from cache', { key });
                return cachedData;
            }
        }
        
        // 2. Load from source
        const data = await dataLoader();
        
        // 3. Cache the data
        await window.UnifiedCacheManager?.set(key, data, { ttl });
        
        Logger.info('Data loaded and cached', { key, ttl });
        return data;
        
    } catch (error) {
        Logger.error('Data loading failed', { key, error: error.message });
        
        // 4. Fallback to cache if available
        if (fallbackToCache) {
            const cachedData = window.UnifiedCacheManager?.get(key);
            if (cachedData) {
                Logger.warn('Using cached data as fallback', { key });
                showWarningNotification('מציג נתונים שמורים');
                return cachedData;
            }
        }
        
        throw error;
    }
}
```

## 8. Best Practices Summary

### Do's ✅
- Always use try-catch for async operations
- Log errors with context information
- Use caching for performance
- Show user-friendly notifications
- Handle network errors gracefully
- Use performance monitoring
- Implement auto-save for forms
- Use lazy loading for large content

### Don'ts ❌
- Don't ignore errors silently
- Don't show technical error messages to users
- Don't block UI during long operations
- Don't forget to clean up event listeners
- Don't use synchronous operations for data loading
- Don't cache sensitive data
- Don't forget to handle offline scenarios
- Don't use console.log in production

## Troubleshooting Common Issues

### Issue: Page not loading
**Solution:**
```javascript
// Check if systems are loaded
if (!window.UnifiedCacheManager) {
    Logger.error('Cache manager not loaded');
    showErrorNotification('מערכת לא מוכנה. אנא רענן את העמוד.');
    return;
}
```

### Issue: Data not saving
**Solution:**
```javascript
// Check network and retry
try {
    await saveData(data);
} catch (error) {
    if (error.name === 'NetworkError') {
        // Retry with exponential backoff
        await retryWithBackoff(() => saveData(data), 3);
    }
}
```

### Issue: Performance problems
**Solution:**
```javascript
// Use performance monitoring
const startTime = performance.now();
await heavyOperation();
const duration = performance.now() - startTime;

if (duration > 1000) {
    Logger.warn('Slow operation detected', { duration });
    // Consider optimization
}
```
