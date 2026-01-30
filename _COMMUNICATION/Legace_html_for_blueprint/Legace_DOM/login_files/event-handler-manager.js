/**
 * Centralized Event Handler System - Enhanced with Advanced Debugging & Monitoring
 * ================================================================================
 * 
 * This file provides a centralized event management system for TikTrack
 * to prevent duplicate event listeners and improve performance.
 * 
 * Enhanced Features (v2.0):
 * - Advanced event tracking and history
 * - Performance monitoring with execution time tracking
 * - Comprehensive debugging API for developers
 * - Detailed logging integration with Logger Service
 * - Event context builder for rich debugging information
 * - Error reporting and statistics
 * 
 * Debugging Guide:
 * - Use window.EventHandlerManager.debug.* for debugging tools
 * - Check window.EventHandlerManager.getStatistics() for performance data
 * - See documentation/03-DEVELOPMENT/GUIDES/EVENT_HANDLER_DEBUGGING_GUIDE.md
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md
 * - documentation/03-DEVELOPMENT/GUIDES/EVENT_HANDLER_DEBUGGING_GUIDE.md
 * 
 * Author: TikTrack Development Team
 * Version: 2.0.0
 * Last Updated: 2025-01-27
 * 
 * ===== FUNCTION INDEX =====
 * 
 * === Initialization ===
 * - init() - Initialize the event handler system
 * - setupGlobalDelegation() - Set up global event delegation
 * 
 * === Event Delegation ===
 * - handleDelegatedClick(event) - Handle delegated click events
 * - handleDelegatedChange(event) - Handle delegated change events
 * - handleDelegatedInput(event) - Handle delegated input events
 * - handleDelegatedBlur(event) - Handle delegated blur events
 * 
 * === Event Handling ===
 * - executeAction(action, element, event) - Execute action based on data-action
 * - openModal(modalType, element, event) - Open modal based on data-modal-trigger
 * - handleSortableClick(element, event) - Handle sortable header clicks
 * - handleFieldChange(fieldName, element, event) - Handle field changes
 * - handleFilterChange(filterType, element, event) - Handle filter changes
 * - handleRealTimeValidation(element, event) - Handle real-time validation
 * - handleSearchInput(element, event) - Handle search inputs
 * - handleFieldValidation(element, event) - Handle field validation on blur
 * 
 * === Action Handlers ===
 * - handleAddAction(element, event) - Handle add actions
 * - handleEditAction(element, event) - Handle edit actions
 * - handleDeleteAction(element, event) - Handle delete actions
 * - handleCancelAction(element, event) - Handle cancel actions
 * - handleSaveAction(element, event) - Handle save actions
 * - performDelete(entityType, entityId) - Perform actual delete operation
 * - performSave(form) - Perform actual save operation
 * 
 * === Listener Management ===
 * - addEventListener(eventName, handler, options) - Add event listener with deduplication
 * - removeEventListener(eventName, handler) - Remove event listener
 * - cleanup() - Clean up all event listeners
 * 
 * === Event Utilities ===
 * - dispatchCustomEvent(eventName, detail) - Dispatch custom event
 * 
 * === Debugging & Monitoring ===
 * - _buildEventContext(event, element, handler) - Build detailed event context
 * - _trackEvent(eventType, element, handler, result, executionTime, error) - Track event execution
 * - _getStackTrace() - Get current stack trace
 * - _wrapHandlerWithTracking(handler, handlerKey, eventName) - Wrap handler with performance tracking
 * 
 * === Debug API ===
 * - debug.getListeners() - Get all listeners with detailed info
 * - debug.getEventHistory(count) - Get event history
 * - debug.getStatistics() - Get event statistics
 * - debug.getHandlerInfo(handlerKey) - Get handler detailed info
 * - debug.traceEvent(eventName, elementSelector) - Trace specific event
 * - debug.findListenersForElement(selector) - Find listeners for element
 * - debug.findListenersForEvent(eventName) - Find listeners for event
 * - debug.simulateEvent(eventName, elementSelector, eventData) - Simulate event
 * - debug.enableVerboseLogging() - Enable verbose logging
 * - debug.disableVerboseLogging() - Disable verbose logging
 * - debug.getErrorReport() - Get error report
 * - debug.clearHistory() - Clear event history
 * - debug.clearStatistics() - Clear statistics
 */

/**
 * Centralized Event Handler System
 * Manages all event listeners to prevent duplicates and improve performance
 * Enhanced with advanced debugging and monitoring capabilities
 */
class EventHandlerManager {
    constructor() {
        // Core listener maps
        this.listeners = new Map(); // Enhanced: now contains detailed metadata
        this.delegatedListeners = new Map();
        this.initialized = false;

        // === Enhanced Debugging & Monitoring ===
        
        // Event Registry - Detailed information about each listener
        // Structure: Map<handlerKey, {
        //   handler: Function,
        //   options: Object,
        //   timestamp: number,          // When listener was added
        //   source: string,              // Source location (file/function)
        //   stackTrace: string,          // Stack trace at registration
        //   elementInfo: Object|null,    // Element info if applicable
        //   handlerInfo: {              // Handler metadata
        //     name: string,
        //     source: string
        //   },
        //   callCount: number,           // Number of times called
        //   lastCalled: number|null,     // Last call timestamp
        //   executionTime: Array<number>, // Execution times array
        //   avgExecutionTime: number,    // Average execution time
        //   errorCount: number,          // Number of errors
        //   lastError: Error|null        // Last error if any
        // }>
        
        // Event History - Last N events processed
        this.eventHistory = []; // Circular buffer - max 100 events
        this.maxEventHistorySize = 100;
        
        // Event Statistics - Aggregated statistics
        this.eventStatistics = {
            totalEvents: 0,
            eventsByType: new Map(), // eventType -> count
            eventsByHandler: new Map(), // handlerKey -> count
            errorsByType: new Map(), // eventType -> errorCount
            performanceByHandler: new Map(), // handlerKey -> {total, avg, min, max}
            slowHandlers: [] // Handlers exceeding performance threshold
        };
        
        // Error Collection - Detailed error information
        this.errors = []; // Array of error objects with full context
        this.maxErrorsSize = 50;
        
        // Performance Configuration
        this.performanceThreshold = 100; // ms - handlers exceeding this are considered slow
        this.enablePerformanceTracking = false; // Only enabled in DEBUG mode or via debug API
        
        // Debugging Configuration
        this.verboseLogging = false; // Can be enabled via debug.enableVerboseLogging()
        this.debugMode = false; // Determined automatically or via debug API
        
        // Stack trace collection (only in DEBUG mode)
        this.collectStackTraces = false; // Expensive operation - only when needed
    }

    /**
     * Initialize the event handler system
     * @function init
     * 
     * Sets up global event delegation and initializes debugging features.
     * In DEBUG mode, enables performance tracking and verbose logging.
     * 
     * @returns {void}
     * 
     * @example
     * // Auto-initialized, but can be called manually:
     * window.EventHandlerManager.init();
     */
    init() {
        if (this.initialized) {
            this._log('warn', 'Already initialized, skipping', {
                component: 'init',
                action: 're-initialization-attempt'
            });
            return;
        }
        
        // Determine debug mode
        this.debugMode = this._isDebugMode();
        this.enablePerformanceTracking = this.debugMode;
        this.collectStackTraces = this.debugMode;
        
        // Set up global event delegation
        this.setupGlobalDelegation();
        this.initialized = true;
        
        this._log('info', 'EventHandlerManager initialized successfully', {
            component: 'init',
            debugMode: this.debugMode,
            performanceTracking: this.enablePerformanceTracking,
            page: this._getCurrentPage()
        });
    }

    /**
     * Set up global event delegation for common events
     * @function setupGlobalDelegation
     * @private
     * 
     * Registers global event listeners for event delegation.
     * All delegated handlers are wrapped with performance tracking.
     * 
     * Delegated Events:
     * - click (capture phase) - Main click handler
     * - change - Form field changes
     * - input - Input events for validation/search
     * - blur - Field blur events for validation
     * 
     * @returns {void}
     */
    setupGlobalDelegation() {
        // Wrap handlers for tracking
        const clickHandler = this._wrapHandlerWithTracking(
            (event) => { this.handleDelegatedClick(event); },
            'delegated:click',
            'click'
        );
        
        const changeHandler = this._wrapHandlerWithTracking(
            (event) => { this.handleDelegatedChange(event); },
            'delegated:change',
            'change'
        );
        
        const inputHandler = this._wrapHandlerWithTracking(
            (event) => { this.handleDelegatedInput(event); },
            'delegated:input',
            'input'
        );
        
        const blurHandler = this._wrapHandlerWithTracking(
            (event) => { this.handleDelegatedBlur(event); },
            'delegated:blur',
            'blur'
        );
        
        // Click events delegation - Use capture phase to catch events early
        document.addEventListener('click', clickHandler, true);
        this.delegatedListeners.set('click', { handler: clickHandler, options: { capture: true } });

        // Change events delegation
        document.addEventListener('change', changeHandler);
        this.delegatedListeners.set('change', { handler: changeHandler, options: {} });

        // Input events delegation
        document.addEventListener('input', inputHandler);
        this.delegatedListeners.set('input', { handler: inputHandler, options: {} });

        // Blur events delegation
        document.addEventListener('blur', blurHandler, true); // Use capture for blur too
        this.delegatedListeners.set('blur', { handler: blurHandler, options: { capture: true } });
        
        this._log('debug', 'Global event delegation set up', {
            component: 'setupGlobalDelegation',
            delegatedEvents: ['click', 'change', 'input', 'blur'],
            performanceTracking: this.enablePerformanceTracking
        });
    }

    /**
     * Handle delegated click events
     * @function handleDelegatedClick
     * @param {Event} event - Click event
     * @private
     * 
     * Handles all click events through event delegation.
     * Supports multiple patterns:
     * - data-onclick attributes (primary method)
     * - TOGGLE buttons (auto-wire to sections)
     * - Header filter toggles
     * - data-action attributes
     * - data-modal-trigger attributes
     * - Sortable headers
     * 
     * All execution is tracked for debugging and performance monitoring.
     */
    handleDelegatedClick(event) {
        const startTime = performance.now();
        const target = event.target;
        let handlerExecuted = false;
        let handlerName = null;
        let error = null;
        
        try {
        // Prevent double handling in bubbling chain
        if (event._ehmHandled) {
                if (this.verboseLogging) {
                    this._log('debug', 'Event already handled, skipping', {
                        component: 'handleDelegatedClick',
                        element: this._getElementSelector(target)
                    });
                }
            return;
        }
            
            // Build context for this event
            const eventContext = this._buildEventContext(event, target, 'handleDelegatedClick');
            
            if (this.verboseLogging) {
                this._log('debug', 'Click event received', eventContext);
            }
        
        // Handle elements with data-onclick attribute (centralized button system)
        // This is the primary way to handle button clicks in TikTrack
        // Based on documentation: documentation/frontend/button-system.md
        // Supports <button>, <a>, <div>, and any other element with data-onclick
        const elementWithOnclick = target.closest('[data-onclick]');
        
        if (elementWithOnclick) {
            // Don't process if element is disabled (for buttons)
            if (elementWithOnclick.disabled || elementWithOnclick.hasAttribute('disabled')) {
                    if (this.verboseLogging) {
                        this._log('debug', 'Element disabled, skipping', {
                            component: 'handleDelegatedClick',
                            element: this._getElementSelector(elementWithOnclick)
                        });
                    }
                return;
            }
            
            const onclickValue = elementWithOnclick.getAttribute('data-onclick');
            
            if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
                    handlerName = `data-onclick:${onclickValue}`;
                    
                    this._log('debug', `Executing onclick handler: ${onclickValue}`, {
                        component: 'handleDelegatedClick',
                        onclickValue,
                        element: this._getElementSelector(elementWithOnclick),
                        ...eventContext
                    });
                
                // Define result outside try block to ensure it's available in catch/finally
                let result = null;
                
                try {
                    // Execute the onclick handler using eval (safe because it's controlled)
                    // Note: Following documentation spec - no preventDefault/stopPropagation
                    // to allow Bootstrap modals and other standard behaviors to work
                    // Eval runs in current scope, so window functions are available
                    // If function is not found, try with window. prefix
                    
                    // First, check if the function exists in global scope
                    // Handle both direct function calls and nested object calls (e.g., window.AITemplateSelector.selectTemplate)
                    let functionName = onclickValue.replace(/\(.*\)/, '').trim();
                    const functionArgs = onclickValue.match(/\((.*)\)/)?.[1] || '';
                    
                    // Check if it's a nested call (e.g., window.AITemplateSelector.selectTemplate)
                    let targetFunction = null;
                    if (functionName.includes('.')) {
                        // Try to resolve nested path
                        try {
                            const parts = functionName.split('.');
                            let obj = window;
                            for (let i = 0; i < parts.length; i++) {
                                if (obj && typeof obj === 'object' && parts[i] in obj) {
                                    obj = obj[parts[i]];
                                } else {
                                    obj = null;
                                    break;
                                }
                            }
                            if (obj && typeof obj === 'function') {
                                targetFunction = obj;
                            }
                        } catch (e) {
                            // Fall through to eval
                        }
                    } else {
                        // Direct function name
                        if (window[functionName] && typeof window[functionName] === 'function') {
                            targetFunction = window[functionName];
                        }
                    }
                    
                    if (this.verboseLogging) {
                        this._log('debug', 'Parsing onclick handler', {
                            component: 'handleDelegatedClick',
                            onclickValue,
                            functionName,
                            functionArgs,
                            targetFunctionExists: !!targetFunction,
                            element: this._getElementSelector(elementWithOnclick)
                        });
                    }
                    
                    // Try direct function call if we found it
                    if (targetFunction) {
                        if (this.verboseLogging) {
                            this._log('debug', `Function found, calling directly: ${functionName}`, {
                                component: 'handleDelegatedClick',
                                functionName,
                                functionArgs
                            });
                        }
                        
                        try {
                            if (functionArgs) {
                                // Parse arguments (simple comma-separated, no complex parsing)
                                const args = functionArgs.split(',').map(arg => {
                                    const trimmed = arg.trim();
                                    // Remove quotes if present
                                    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                                        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                                        return trimmed.slice(1, -1);
                                    }
                                    // Try to evaluate as JavaScript expression, fallback to string
                                    try {
                                        return eval(trimmed);
                                    } catch (e) {
                                        return trimmed;
                                    }
                                });
                                
                                // If targetFunction is a method on an object, bind it to preserve context
                                if (targetFunction && typeof targetFunction === 'function') {
                                    // Check if it's a method (e.g., window.AIAnalysisManager.handleTemplateSelectionFromModal)
                                    const parts = functionName.split('.');
                                    if (parts.length > 1) {
                                        // It's a method call - get the object and method
                                        let obj = window;
                                        for (let i = 0; i < parts.length - 1; i++) {
                                            obj = obj[parts[i]];
                                            if (!obj) break;
                                        }
                                        const methodName = parts[parts.length - 1];
                                        if (obj && typeof obj[methodName] === 'function') {
                                            // Bind the method to its object
                                            targetFunction = obj[methodName].bind(obj);
                                        }
                                    }
                                }
                                
                                if (args.length > 0) {
                                    result = targetFunction(...args);
                                } else {
                                    result = targetFunction();
                                }
                            } else {
                                // If targetFunction is a method on an object, bind it to preserve context
                                if (targetFunction && typeof targetFunction === 'function') {
                                    // Check if it's a method (e.g., window.AIAnalysisManager.handleTemplateSelectionFromModal)
                                    const parts = functionName.split('.');
                                    if (parts.length > 1) {
                                        // It's a method call - get the object and method
                                        let obj = window;
                                        for (let i = 0; i < parts.length - 1; i++) {
                                            obj = obj[parts[i]];
                                            if (!obj) break;
                                        }
                                        const methodName = parts[parts.length - 1];
                                        if (obj && typeof obj[methodName] === 'function') {
                                            // Bind the method to its object
                                            targetFunction = obj[methodName].bind(obj);
                                        }
                                    }
                                }
                                
                                result = targetFunction();
                            }
                            
                            if (this.verboseLogging) {
                                this._log('debug', `Direct call succeeded`, {
                                    component: 'handleDelegatedClick',
                                    functionName,
                                    resultType: typeof result,
                                    isPromise: result && typeof result.then === 'function'
                                });
                            }
                        } catch (directError) {
                            error = directError;
                            this._log('error', `Direct call failed: ${directError.name}`, {
                                component: 'handleDelegatedClick',
                                functionName,
                                error: directError.message,
                                stack: directError.stack
                            });
                            throw directError;
                        }
                    } else {
                        // Fallback to eval
                            if (this.verboseLogging) {
                                this._log('debug', `Function not in window, attempting eval`, {
                                    component: 'handleDelegatedClick',
                                    onclickValue,
                                    functionName
                                });
                            }
                            
                            try {
                            result = eval(onclickValue);
                                
                                if (this.verboseLogging) {
                                    this._log('debug', `Eval succeeded`, {
                                        component: 'handleDelegatedClick',
                                        resultType: typeof result,
                                        isPromise: result && typeof result.then === 'function'
                                    });
                                }
                        } catch (evalError) {
                                error = evalError;
                                this._log('error', `Eval failed: ${evalError.name}`, {
                                    component: 'handleDelegatedClick',
                                    onclickValue,
                                    error: evalError.message,
                                    stack: evalError.stack
                                });
                                
                            // If eval fails, try with window. prefix for global functions
                            if (evalError.name === 'ReferenceError' && !onclickValue.includes('window.')) {
                                const windowPrefixed = `window.${onclickValue}`;
                                    
                                    if (this.verboseLogging) {
                                        this._log('debug', `Retrying with window. prefix`, {
                                            component: 'handleDelegatedClick',
                                            windowPrefixed
                                        });
                                    }
                                    
                                try {
                                    result = eval(windowPrefixed);
                                        
                                        if (this.verboseLogging) {
                                            this._log('debug', `Window-prefixed eval succeeded`, {
                                                component: 'handleDelegatedClick',
                                                resultType: typeof result
                                            });
                                        }
                                } catch (windowEvalError) {
                                        error = windowEvalError;
                                        this._log('error', `Window-prefixed eval also failed: ${windowEvalError.name}`, {
                                            component: 'handleDelegatedClick',
                                            windowPrefixed,
                                            error: windowEvalError.message,
                                            stack: windowEvalError.stack
                                        });
                                    throw windowEvalError;
                                }
                            } else {
                                throw evalError;
                            }
                        }
                    }
                    
                    // Handle async functions (Promises) - especially ModalManagerV2.showModal
                    if (result && typeof result.then === 'function') {
                        // This is a Promise - handle it properly
                            const asyncStartTime = performance.now();
                            
                        result
                            .then(() => {
                                    const asyncExecutionTime = performance.now() - asyncStartTime;
                                    handlerExecuted = true;
                                    
                                    this._trackEvent(
                                        'click',
                                        elementWithOnclick,
                                        handlerName,
                                        null,
                                        asyncExecutionTime,
                                        null
                                    );
                                    
                                    this._log('info', `Async onclick completed successfully`, {
                                        component: 'handleDelegatedClick',
                                        onclickValue,
                                        executionTime: asyncExecutionTime,
                                        element: this._getElementSelector(elementWithOnclick)
                                    });
                                })
                                .catch(asyncError => {
                                    const asyncExecutionTime = performance.now() - asyncStartTime;
                                    handlerExecuted = true;
                                    error = asyncError;
                                    
                                    this._trackEvent(
                                        'click',
                                        elementWithOnclick,
                                        handlerName,
                                        null,
                                        asyncExecutionTime,
                                        asyncError
                                    );
                                    
                                    this._log('error', `Error in async onclick`, {
                                        component: 'handleDelegatedClick',
                                        onclickValue,
                                        error: asyncError.message,
                                        stack: asyncError.stack,
                                        executionTime: asyncExecutionTime,
                                        element: this._getElementSelector(elementWithOnclick),
                                        ...eventContext
                                    });
                                    
                                if (window.showErrorNotification) {
                                        window.showErrorNotification('שגיאה', `שגיאה בביצוע פעולה: ${asyncError.message}`);
                                    }
                                });
                            
                            this._log('debug', `Async onclick initiated`, {
                                component: 'handleDelegatedClick',
                                onclickValue,
                                element: this._getElementSelector(elementWithOnclick)
                            });
                            
                            // Track async initiation (will be updated when promise resolves)
                            handlerExecuted = true;
                        } else {
                            // Sync execution
                            handlerExecuted = true;
                            const executionTime = performance.now() - startTime;
                            
                            this._trackEvent(
                                'click',
                                elementWithOnclick,
                                handlerName,
                                result,
                                executionTime,
                                null
                            );
                            
                            if (result === undefined || result === null) {
                        // אם התוצאה היא undefined/null, זה יכול להיות שהפונקציה היא async אבל לא החזירה Promise
                        // נבדוק אם יש ModalManagerV2 בקוד
                        if (onclickValue.includes('ModalManagerV2') && onclickValue.includes('showModal')) {
                                    this._log('warn', `ModalManagerV2.showModal returned undefined - might be async issue`, {
                                        component: 'handleDelegatedClick',
                                        onclickValue,
                                        modalManagerAvailable: !!window.ModalManagerV2,
                                        showModalAvailable: !!(window.ModalManagerV2 && window.ModalManagerV2.showModal)
                                    });
                                }
                            }
                            
                            if (this.verboseLogging) {
                                this._log('debug', `onclick executed successfully (sync)`, {
                                    component: 'handleDelegatedClick',
                                    onclickValue,
                                    resultType: typeof result,
                                    executionTime,
                                    element: this._getElementSelector(elementWithOnclick)
                                });
                            }
                        }
                    } catch (execError) {
                        error = execError;
                        const executionTime = performance.now() - startTime;
                        
                        this._trackEvent(
                            'click',
                            elementWithOnclick,
                            handlerName,
                            null,
                            executionTime,
                            execError
                        );
                        
                        this._log('error', `Error executing data-onclick`, {
                            component: 'handleDelegatedClick',
                            onclickValue,
                            error: execError.message,
                            stack: execError.stack,
                            executionTime,
                            element: this._getElementSelector(elementWithOnclick),
                            ...eventContext
                        });
                }
                    // Mark event as handled to avoid duplicate toggles from fallback handlers
                    event._ehmHandled = true;
                    // Prevent default for links to avoid navigation
                    if (elementWithOnclick.tagName === 'A') {
                        event.preventDefault();
                    }
                    // Only prevent default if it's a form submit button
                    if (elementWithOnclick.tagName === 'BUTTON' && elementWithOnclick.type === 'submit') {
                        event.preventDefault();
                    }
                    
                    // Track final execution
                    if (handlerExecuted && !error) {
                        const executionTime = performance.now() - startTime;
                        // Only check result if it was defined (not null means it was set in try block)
                        if (result !== null && (!result || typeof result.then !== 'function')) {
                            // Only track sync execution here (async was tracked above)
                            this._trackEvent(
                                'click',
                                elementWithOnclick,
                                handlerName,
                                result,
                                executionTime,
                                null
                            );
                        }
                    }
                    
                    return;
                }
            }
        } catch (outerError) {
            error = outerError;
            const executionTime = performance.now() - startTime;
            
            this._trackEvent(
                'click',
                target,
                'handleDelegatedClick',
                null,
                executionTime,
                outerError
            );
            
            this._log('error', `Error in handleDelegatedClick`, {
                component: 'handleDelegatedClick',
                error: outerError.message,
                stack: outerError.stack,
                executionTime,
                element: this._getElementSelector(target)
            });
        }
        
        // Handle TOGGLE buttons without data-onclick (auto-wire to nearest section)
        const toggleBtn = target.closest('button[data-button-type="TOGGLE"]:not([data-onclick])');
        if (toggleBtn && typeof window.toggleSection === 'function') {
            try {
                const toggleStartTime = performance.now();
                
                // Find nearest section container
                const sectionEl = toggleBtn.closest('.top-section, .content-section, [data-section]');
                let sectionId = null;
                if (sectionEl) {
                    if (sectionEl.classList.contains('top-section')) {
                        sectionId = sectionEl.getAttribute('data-section') || 'top';
                    } else if (sectionEl.hasAttribute('data-section')) {
                        sectionId = sectionEl.getAttribute('data-section');
                    } else if (sectionEl.id) {
                        sectionId = sectionEl.id;
                    }
                }

                if (sectionId) {
                    window.toggleSection(sectionId);
                    const toggleExecutionTime = performance.now() - toggleStartTime;
                    
                    this._trackEvent(
                        'click',
                        toggleBtn,
                        'toggleSection',
                        null,
                        toggleExecutionTime,
                        null
                    );
                    
                    if (this.verboseLogging) {
                        this._log('debug', `TOGGLE button executed`, {
                            component: 'handleDelegatedClick',
                            sectionId,
                            executionTime: toggleExecutionTime,
                            element: this._getElementSelector(toggleBtn)
                        });
                    }
                }
            } catch (err) {
                const toggleExecutionTime = performance.now() - startTime;
                
                this._trackEvent(
                    'click',
                    toggleBtn,
                    'toggleSection',
                    null,
                    toggleExecutionTime,
                    err
                );
                
                this._log('error', 'TOGGLE auto-wire failed', {
                    component: 'handleDelegatedClick',
                    error: err?.message,
                    stack: err?.stack,
                    element: this._getElementSelector(toggleBtn)
                });
            }
        }

        // Header filter toggles (fallback when inline onclick is blocked/missing)
        const headerFilterBtn = target.closest('button.filter-toggle');
        if (!event._ehmHandled && headerFilterBtn && window.headerSystemReady !== false) {
            try {
                const filterToggleStartTime = performance.now();
                let filterHandlerName = null;
                let filterHandlerExecuted = false;
                
                if (headerFilterBtn.classList.contains('status-filter-toggle') && typeof window.toggleStatusFilterMenu === 'function') {
                    filterHandlerName = 'toggleStatusFilterMenu';
                    window.toggleStatusFilterMenu();
                    filterHandlerExecuted = true;
                } else if (headerFilterBtn.classList.contains('type-filter-toggle') && typeof window.toggleTypeFilterMenu === 'function') {
                    filterHandlerName = 'toggleTypeFilterMenu';
                    window.toggleTypeFilterMenu();
                    filterHandlerExecuted = true;
                } else if (headerFilterBtn.classList.contains('account-filter-toggle') && typeof window.toggleAccountFilterMenu === 'function') {
                    filterHandlerName = 'toggleAccountFilterMenu';
                    window.toggleAccountFilterMenu();
                    filterHandlerExecuted = true;
                } else if (headerFilterBtn.classList.contains('date-range-filter-toggle') && typeof window.toggleDateRangeFilterMenu === 'function') {
                    filterHandlerName = 'toggleDateRangeFilterMenu';
                    window.toggleDateRangeFilterMenu();
                    filterHandlerExecuted = true;
                } else if (headerFilterBtn.id === 'headerFilterToggleBtnMain' || headerFilterBtn.id === 'headerFilterToggleBtnSecondary') {
                    if (typeof window.toggleHeaderFilters === 'function') {
                        filterHandlerName = 'toggleHeaderFilters';
                        window.toggleHeaderFilters();
                        filterHandlerExecuted = true;
                    }
                }
                
                if (filterHandlerExecuted) {
                    const filterExecutionTime = performance.now() - filterToggleStartTime;
                    
                    this._trackEvent(
                        'click',
                        headerFilterBtn,
                        filterHandlerName,
                        null,
                        filterExecutionTime,
                        null
                    );
                    
                    event._ehmHandled = true;
                    if (typeof event.stopImmediatePropagation === 'function') { 
                        event.stopImmediatePropagation(); 
                    }
                    
                    if (this.verboseLogging) {
                        this._log('debug', `Header filter toggle executed`, {
                            component: 'handleDelegatedClick',
                            handler: filterHandlerName,
                            executionTime: filterExecutionTime,
                            element: this._getElementSelector(headerFilterBtn)
                        });
                    }
                    
                    return;
                }
            } catch (e) {
                const filterExecutionTime = performance.now() - startTime;
                
                this._trackEvent(
                    'click',
                    headerFilterBtn,
                    'headerFilterToggle',
                    null,
                    filterExecutionTime,
                    e
                );
                
                this._log('error', 'Header filter toggle fallback failed', {
                    component: 'handleDelegatedClick',
                    error: e?.message,
                    stack: e?.stack,
                    element: this._getElementSelector(headerFilterBtn)
                });
            }
        }

        // Handle buttons with onclick attribute (legacy support - for backwards compatibility)
        // Note: We don't execute onclick handlers here to avoid double execution
        // The browser will handle onclick naturally, we just log for debugging
        const buttonWithOnclickLegacy = target.closest('button[onclick]:not([data-onclick])');
        if (buttonWithOnclickLegacy) {
            // Don't process if button is disabled
            if (buttonWithOnclickLegacy.disabled || buttonWithOnclickLegacy.hasAttribute('disabled')) {
                return;
            }
            
            const onclickValue = buttonWithOnclickLegacy.getAttribute('onclick');
            if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
                // Just log for debugging - let the browser handle onclick naturally
                this._log('debug', 'Detected onclick button (browser will handle)', {
                    component: 'handleDelegatedClick',
                    onclickValue,
                    element: this._getElementSelector(buttonWithOnclickLegacy),
                    note: 'Browser will handle onclick naturally - we log for debugging only'
                });
                // Don't execute - browser will handle onclick naturally
                // This prevents double execution while maintaining compatibility
            }
        }
        
        // Handle button clicks with data-action
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-action]')) {
            const action = target.getAttribute('data-action');
            this.executeAction(action, target, event);
        }
        
        // Handle modal triggers
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-modal-trigger]')) {
            const modalType = target.getAttribute('data-modal-trigger');
            this.openModal(modalType, target, event);
        }
        
        // Handle sortable headers - but only if they don't have onclick or data-onclick attributes
        // Elements with data-onclick are already handled above (lines 89-130)
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('.sortable-header')) {
            // Skip if element has onclick or data-onclick attribute - let it handle itself
            if (!target.hasAttribute('onclick') && !target.hasAttribute('data-onclick')) {
                this.handleSortableClick(target, event);
            }
            // If onclick or data-onclick exists, let it execute naturally without interference
        }
    }

    /**
     * Handle delegated change events
     * @function handleDelegatedChange
     * @param {Event} event - Change event
     * @private
     * 
     * Handles change events through event delegation.
     * Primarily handles data-onchange attributes on select and input elements.
     * Tracks all executions for debugging and performance monitoring.
     */
    handleDelegatedChange(event) {
        const startTime = performance.now();
        const target = event.target;
        const eventContext = this._buildEventContext(event, target, 'handleDelegatedChange');
        
        if (this.verboseLogging) {
            this._log('debug', 'Change event received', eventContext);
        }
        
        // Handle data-onchange attribute (like data-onclick for buttons)
        const elementWithOnchange = target.closest('select[data-onchange], input[data-onchange]');
        if (elementWithOnchange) {
            const onchangeValue = elementWithOnchange.getAttribute('data-onchange');
            if (onchangeValue && onchangeValue !== 'null' && onchangeValue !== '') {
                const handlerName = `data-onchange:${onchangeValue}`;
                
                this._log('debug', `Executing onchange handler: ${onchangeValue}`, {
                    component: 'handleDelegatedChange',
                    onchangeValue,
                    elementValue: elementWithOnchange.value,
                    element: this._getElementSelector(elementWithOnchange),
                    ...eventContext
                });
                
                try {
                    // Replace 'this.value' with the actual value before eval
                    // This is needed because eval.call doesn't work correctly with 'this'
                    const actualValue = elementWithOnchange.value;
                    // Replace this.value with the actual value (handle both string and non-string)
                    const codeToExecute = onchangeValue.replace(/this\.value/g, 
                        typeof actualValue === 'string' ? `"${actualValue.replace(/"/g, '\\"')}"` : actualValue
                    );
                    
                    if (this.verboseLogging) {
                        this._log('debug', `Code after replacement`, {
                            component: 'handleDelegatedChange',
                            codeToExecute,
                            actualValue,
                            actualValueType: typeof actualValue
                        });
                    }
                    
                    // Execute the onchange handler using eval
                    const result = eval(codeToExecute);
                    
                    if (result && typeof result.then === 'function') {
                        // Async handler
                        const asyncStartTime = performance.now();
                        
                        result
                            .then(() => {
                                const asyncExecutionTime = performance.now() - asyncStartTime;
                                
                                this._trackEvent(
                                    'change',
                                    elementWithOnchange,
                                    handlerName,
                                    null,
                                    asyncExecutionTime,
                                    null
                                );
                                
                                this._log('info', `Async onchange completed successfully`, {
                                    component: 'handleDelegatedChange',
                                    onchangeValue,
                                    executionTime: asyncExecutionTime,
                                    element: this._getElementSelector(elementWithOnchange)
                                });
                            })
                            .catch(asyncError => {
                                const asyncExecutionTime = performance.now() - asyncStartTime;
                                
                                this._trackEvent(
                                    'change',
                                    elementWithOnchange,
                                    handlerName,
                                    null,
                                    asyncExecutionTime,
                                    asyncError
                                );
                                
                                this._log('error', `Error in async onchange`, {
                                    component: 'handleDelegatedChange',
                                    onchangeValue,
                                    error: asyncError.message,
                                    stack: asyncError.stack,
                                    executionTime: asyncExecutionTime,
                                    element: this._getElementSelector(elementWithOnchange),
                                    ...eventContext
                                });
                            });
                    } else {
                        // Sync handler
                        const executionTime = performance.now() - startTime;
                        
                        this._trackEvent(
                            'change',
                            elementWithOnchange,
                            handlerName,
                            result,
                            executionTime,
                            null
                        );
                        
                        if (this.verboseLogging) {
                            this._log('debug', `onchange executed successfully (sync)`, {
                                component: 'handleDelegatedChange',
                                onchangeValue,
                                executionTime,
                                element: this._getElementSelector(elementWithOnchange)
                            });
                        }
                    }
                    
                    event._ehmHandled = true;
                    return;
                } catch (error) {
                    const executionTime = performance.now() - startTime;
                    
                    this._trackEvent(
                        'change',
                        elementWithOnchange,
                        handlerName,
                        null,
                        executionTime,
                        error
                    );
                    
                    this._log('error', `Error executing data-onchange`, {
                        component: 'handleDelegatedChange',
                        onchangeValue,
                        error: error.message,
                        stack: error.stack,
                        executionTime,
                        element: this._getElementSelector(elementWithOnchange),
                        ...eventContext
                    });
                }
            }
        }
        
        // Debug logging for filter changes
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-filter-change]')) {
            const filterType = target.getAttribute('data-filter-change');
            this._log('debug', 'Detected filter change', {
                component: 'handleDelegatedChange',
                filterType,
                elementId: target.id,
                value: target.value,
                element: this._getElementSelector(target),
                ...eventContext
            });
        }
        
        // Handle form field changes
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-field-change]')) {
            const fieldName = target.getAttribute('data-field-change');
            this.handleFieldChange(fieldName, target, event);
        }
        
        // Handle filter changes
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-filter-change]')) {
            const filterType = target.getAttribute('data-filter-change');
            this.handleFilterChange(filterType, target, event);
        }
    }

    /**
     * Handle delegated input events
     * @function handleDelegatedInput
     * @param {Event} event - Input event
     * @private
     */
    handleDelegatedInput(event) {
        const target = event.target;
        
        // Handle real-time validation
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-validate-on-input]')) {
            this.handleRealTimeValidation(target, event);
        }
        
        // Handle search inputs
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-search-input]')) {
            this.handleSearchInput(target, event);
        }
    }

    /**
     * Handle delegated blur events
     * @function handleDelegatedBlur
     * @param {Event} event - Blur event
     * @private
     */
    handleDelegatedBlur(event) {
        const target = event.target;
        
        // Handle field validation on blur
        if (target && target.nodeType === Node.ELEMENT_NODE && target.matches('[data-validate-on-blur]')) {
            this.handleFieldValidation(target, event);
        }
    }

    /**
     * Execute action based on data-action attribute
     * @function executeAction
     * @param {string} action - Action name
     * @param {HTMLElement} element - Target element
     * @param {Event} event - Original event
     * @private
     */
    executeAction(action, element, event) {
        switch (action) {
            case 'add':
                this.handleAddAction(element, event);
                break;
            case 'edit':
                this.handleEditAction(element, event);
                break;
            case 'delete':
                this.handleDeleteAction(element, event);
                break;
            case 'cancel':
                this.handleCancelAction(element, event);
                break;
            case 'save':
                this.handleSaveAction(element, event);
                break;
            default:
                if (window.Logger) {
                    window.Logger.warn(`Unknown action: ${action}`);
                }
        }
    }

    /**
     * Open modal based on data-modal-trigger attribute
     * @function openModal
     * @param {string} modalType - Modal type
     * @param {HTMLElement} element - Trigger element
     * @param {Event} event - Original event
     * @private
     */
    openModal(modalType, element, event) {
        if (window.ModalManagerV2) {
            const entityId = element.getAttribute('data-entity-id');
            const entityType = element.getAttribute('data-entity-type');
            
            if (modalType === 'add') {
                window.ModalManagerV2.showAddModal(entityType);
            } else if (modalType === 'edit') {
                window.ModalManagerV2.showEditModal(entityType, entityId);
            }
        }
    }

    /**
     * Handle sortable header clicks
     * @function handleSortableClick
     * @param {HTMLElement} element - Sortable header element
     * @param {Event} event - Original event
     * @private
     * 
     * NOTE: This function is for backward compatibility with tables that don't have onclick handlers.
     * Tables registered with UnifiedTableSystem should use onclick handlers that call window.sortTable directly.
     * This function only handles sortable headers WITHOUT onclick attributes.
     */
    handleSortableClick(element, event) {
        // If this click is already handled by data-onclick button system, skip to avoid double execution
        const delegatedElement = element.closest('[data-onclick]');
        if (delegatedElement) {
            return;
        }
        
        // If element has onclick attribute, let it handle the click (don't interfere)
        // NOTE: This is the primary path for UnifiedTableSystem - onclick handlers call window.sortTable directly
        if (element.hasAttribute('onclick') || element.getAttribute('onclick')) {
            // Let the onclick handler execute - don't prevent default or stop propagation
            return;
        }
        
        // ===== OLD CODE - Fallback for tables without onclick handlers =====
        // This code is kept for backward compatibility with older tables that don't use onclick
        // Most modern tables (including positions/portfolio) use onclick handlers that call UnifiedTableSystem
        const table = element.closest('table');
        // Try data-table-type first (most common), then data-table-id as fallback
        const tableType = table.getAttribute('data-table-type') || table.getAttribute('data-table-id');
        // Get column index from element's parent (th) cell index
        const th = element.closest('th');
        const columnIndex = th ? th.cellIndex : null;
        
        if (columnIndex !== null && window.sortTable) {
            // window.sortTable will delegate to UnifiedTableSystem if table is registered
            window.sortTable(tableType, columnIndex);
        }
    }

    /**
     * Handle field changes
     * @function handleFieldChange
     * @param {string} fieldName - Field name
     * @param {HTMLElement} element - Field element
     * @param {Event} event - Original event
     * @private
     */
    handleFieldChange(fieldName, element, event) {
        // Trigger field change handlers
        const eventName = `fieldChange:${fieldName}`;
        this.dispatchCustomEvent(eventName, {
            fieldName,
            element,
            value: element.value,
            originalEvent: event
        });
    }

    /**
     * Handle filter changes
     * @function handleFilterChange
     * @param {string} filterType - Filter type
     * @param {HTMLElement} element - Filter element
     * @param {Event} event - Original event
     * @private
     * 
     * Handles filter change events and dispatches custom events.
     * Logs all filter changes for debugging.
     */
    handleFilterChange(filterType, element, event) {
        const startTime = performance.now();
        const eventName = `filterChange:${filterType}`;
        
        this._log('info', `handleFilterChange called`, {
            component: 'handleFilterChange',
            filterType,
            eventName,
            elementId: element.id,
            element: this._getElementSelector(element),
            value: element.value,
            page: this._getCurrentPage()
        });
        
        try {
            this.dispatchCustomEvent(eventName, {
                filterType,
                element,
                value: element.value,
                originalEvent: event
            });
            
            const executionTime = performance.now() - startTime;
            
            this._trackEvent(
                'change',
                element,
                `handleFilterChange:${filterType}`,
                null,
                executionTime,
                null
            );
            
            if (this.verboseLogging) {
                this._log('debug', `Custom event dispatched`, {
                    component: 'handleFilterChange',
                    eventName,
                    executionTime,
                    page: this._getCurrentPage()
                });
            }
        } catch (error) {
            const executionTime = performance.now() - startTime;
            
            this._trackEvent(
                'change',
                element,
                `handleFilterChange:${filterType}`,
                null,
                executionTime,
                error
            );
            
            this._log('error', `Error in handleFilterChange`, {
                component: 'handleFilterChange',
                filterType,
                error: error.message,
                stack: error.stack,
                executionTime
            });
        }
    }

    /**
     * Handle real-time validation
     * @function handleRealTimeValidation
     * @param {HTMLElement} element - Input element
     * @param {Event} event - Original event
     * @private
     */
    handleRealTimeValidation(element, event) {
        if (window.validateEntityForm) {
            const fieldName = element.getAttribute('data-validate-on-input');
            window.validateEntityForm.validateField(fieldName, element.value);
        }
    }

    /**
     * Handle search input
     * @function handleSearchInput
     * @param {HTMLElement} element - Search input element
     * @param {Event} event - Original event
     * @private
     */
    handleSearchInput(element, event) {
        const searchTerm = element.value;
        const tableId = element.getAttribute('data-table-id');
        
        if (window.tables && window.tables.filterTable) {
            window.tables.filterTable(tableId, searchTerm);
        }
    }

    /**
     * Handle field validation on blur
     * @function handleFieldValidation
     * @param {HTMLElement} element - Field element
     * @param {Event} event - Original event
     * @private
     */
    handleFieldValidation(element, event) {
        if (window.validateEntityForm) {
            const fieldName = element.getAttribute('data-validate-on-blur');
            window.validateEntityForm.validateField(fieldName, element.value);
        }
    }

    /**
     * Handle add actions
     * @function handleAddAction
     * @param {HTMLElement} element - Action element
     * @param {Event} event - Original event
     * @private
     */
    handleAddAction(element, event) {
        const entityType = element.getAttribute('data-entity-type');
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showAddModal(entityType);
        }
    }

    /**
     * Handle edit actions
     * @function handleEditAction
     * @param {HTMLElement} element - Action element
     * @param {Event} event - Original event
     * @private
     */
    handleEditAction(element, event) {
        const entityType = element.getAttribute('data-entity-type');
        const entityId = element.getAttribute('data-entity-id');
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showEditModal(entityType, entityId);
        }
    }

    /**
     * Handle delete actions
     * @function handleDeleteAction
     * @param {HTMLElement} element - Action element
     * @param {Event} event - Original event
     * @private
     */
    handleDeleteAction(element, event) {
        const entityType = element.getAttribute('data-entity-type');
        const entityId = element.getAttribute('data-entity-id');
        
        if (window.checkLinkedItemsBeforeAction) {
            window.checkLinkedItemsBeforeAction(entityType, entityId, () => {
                this.performDelete(entityType, entityId);
            });
        } else {
            this.performDelete(entityType, entityId);
        }
    }

    /**
     * Perform actual delete operation
     * @function performDelete
     * @param {string} entityType - Entity type
     * @param {string} entityId - Entity ID
     * @private
     */
    performDelete(entityType, entityId) {
        // Implementation depends on the entity type
        if (window.showNotification) {
            window.showNotification(`${entityType} נמחק בהצלחה`, 'success');
        }
    }

    /**
     * Handle cancel actions
     * @function handleCancelAction
     * @param {HTMLElement} element - Action element
     * @param {Event} event - Original event
     * @private
     */
    handleCancelAction(element, event) {
        if (window.ModalManagerV2) {
            window.ModalManagerV2.hideModal();
        }
    }

    /**
     * Handle save actions
     * @function handleSaveAction
     * @param {HTMLElement} element - Action element
     * @param {Event} event - Original event
     * @private
     */
    handleSaveAction(element, event) {
        const form = element.closest('form');
        if (form && window.validateEntityForm) {
            const isValid = window.validateEntityForm.validateForm(form);
            if (isValid) {
                this.performSave(form);
            }
        }
    }

    /**
     * Perform actual save operation
     * @function performSave
     * @param {HTMLFormElement} form - Form element
     * @private
     */
    performSave(form) {
        // Implementation depends on the form type
        if (window.showNotification) {
            window.showNotification('נשמר בהצלחה', 'success');
        }
    }

    /**
     * Dispatch custom event
     * @function dispatchCustomEvent
     * @param {string} eventName - Event name
     * @param {Object} detail - Event detail
     * @private
     */
    dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Add event listener with deduplication and enhanced tracking
     * @function addEventListener
     * 
     * Registers an event listener with detailed metadata for debugging.
     * Prevents duplicate registrations and tracks performance.
     * 
     * @param {string} eventName - Event name (e.g., 'click', 'change')
     * @param {Function} handler - Event handler function
     * @param {Object} [options={}] - Event options (e.g., { capture: true, once: true })
     * @returns {boolean} True if listener was added, false if duplicate
     * 
     * @example
     * // Add a click listener
     * window.EventHandlerManager.addEventListener('click', handleClick, { capture: true });
     * 
     * @example
     * // Check if listener was registered
     * const added = window.EventHandlerManager.addEventListener('click', myHandler);
     * if (!added) {
     *   console.log('Listener already exists');
     * }
     */
    addEventListener(eventName, handler, options = {}) {
        if (!eventName || typeof handler !== 'function') {
            this._log('error', 'Invalid parameters for addEventListener', {
                component: 'addEventListener',
                eventName: typeof eventName,
                handlerType: typeof handler
            });
            return false;
        }

        const key = `${eventName}:${handler.name || 'anonymous'}`;
        
        // Check for duplicate
        if (this.listeners.has(key)) {
            this._log('warn', `Duplicate event listener prevented: ${key}`, {
                component: 'addEventListener',
                handlerKey: key,
                eventName,
                handlerName: handler.name || 'anonymous',
                existingSource: this.listeners.get(key).source || 'unknown'
            });
            return false;
        }
        
        // Get stack trace for debugging (only in DEBUG mode)
        const stackTrace = this.collectStackTraces ? this._getStackTrace() : null;
        
        // Build source information
        const source = this._extractSourceFromStack(stackTrace);
        
        // Wrap handler with performance tracking if enabled
        const wrappedHandler = this._wrapHandlerWithTracking(handler, key, eventName);
        
        // Store detailed metadata
        const listenerData = {
            handler: wrappedHandler, // Store wrapped handler
            originalHandler: handler, // Keep reference to original
            options,
            timestamp: Date.now(),
            source: source || 'unknown',
            stackTrace: stackTrace,
            handlerInfo: {
                name: handler.name || 'anonymous',
                source: source || 'unknown',
                length: handler.length // Number of parameters
            },
            callCount: 0,
            lastCalled: null,
            executionTime: [],
            avgExecutionTime: 0,
            errorCount: 0,
            lastError: null
        };
        
        this.listeners.set(key, listenerData);
        document.addEventListener(eventName, wrappedHandler, options);
        
        this._log('debug', `Event listener added: ${key}`, {
            component: 'addEventListener',
            handlerKey: key,
            eventName,
            handlerName: handler.name || 'anonymous',
            source: source || 'unknown',
            options,
            totalListeners: this.listeners.size
        });
        
        return true;
    }

    /**
     * Extract source information from stack trace
     * @function _extractSourceFromStack
     * @private
     * @param {string|null} stackTrace - Stack trace string
     * @returns {string|null} Source location (file:line) or null
     */
    _extractSourceFromStack(stackTrace) {
        if (!stackTrace) return null;
        
        try {
            // Extract file and line from stack trace
            // Format: "at functionName (file.js:123:45)"
            const match = stackTrace.match(/at\s+.+?\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
                const file = match[1].split('/').pop(); // Get filename only
                const line = match[2];
                return `${file}:${line}`;
            }
            
            // Fallback: try simpler format
            const simpleMatch = stackTrace.match(/(.+?):(\d+):(\d+)/);
            if (simpleMatch) {
                const file = simpleMatch[1].split('/').pop();
                const line = simpleMatch[2];
                return `${file}:${line}`;
            }
        } catch (e) {
            // Ignore errors in stack parsing
        }
        
        return null;
    }

    /**
     * Remove event listener
     * @function removeEventListener
     * 
     * Removes a previously registered event listener.
     * Logs removal for debugging purposes.
     * 
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler function (must be the same function reference)
     * @returns {boolean} True if listener was removed, false if not found
     * 
     * @example
     * // Remove a listener
     * const removed = window.EventHandlerManager.removeEventListener('click', myHandler);
     */
    removeEventListener(eventName, handler) {
        if (!eventName || typeof handler !== 'function') {
            this._log('error', 'Invalid parameters for removeEventListener', {
                component: 'removeEventListener',
                eventName: typeof eventName,
                handlerType: typeof handler
            });
            return false;
        }

        const key = `${eventName}:${handler.name || 'anonymous'}`;
        
        if (this.listeners.has(key)) {
            const listenerData = this.listeners.get(key);
            // Use the wrapped handler for removal (it was stored when added)
            document.removeEventListener(eventName, listenerData.handler, listenerData.options);
            this.listeners.delete(key);
            
            this._log('debug', `Event listener removed: ${key}`, {
                component: 'removeEventListener',
                handlerKey: key,
                eventName,
                handlerName: handler.name || 'anonymous',
                callCount: listenerData.callCount,
                totalListeners: this.listeners.size
            });
            
            return true;
        }
        
        this._log('warn', `Listener not found for removal: ${key}`, {
            component: 'removeEventListener',
            handlerKey: key,
            eventName
        });
        
        return false;
    }

    /**
     * Clean up all event listeners
     * @function cleanup
     * 
     * Removes all registered event listeners and resets the system.
     * Useful for testing or complete system reset.
     * 
     * @returns {void}
     * 
     * @example
     * // Clean up before page unload or for testing
     * window.EventHandlerManager.cleanup();
     */
    cleanup() {
        for (const [key, listenerData] of this.listeners) {
            const eventName = key.split(':')[0];
            const { handler, options } = listenerData;
            document.removeEventListener(eventName, handler, options);
        }
        this.listeners.clear();
        this.delegatedListeners.clear();
        this.initialized = false;
        this.eventHistory = [];
        this.errors = [];
        
        this._log('info', 'EventHandlerManager cleaned up', {
            component: 'cleanup'
        });
    }

    // ===== DEBUGGING & MONITORING HELPER FUNCTIONS =====

    /**
     * Check if we are in DEBUG mode
     * @function _isDebugMode
     * @private
     * @returns {boolean} True if in DEBUG mode
     */
    _isDebugMode() {
        // Check Logger Service DEBUG mode if available
        if (window.Logger && typeof window.Logger.DEBUG_MODE !== 'undefined') {
            return window.Logger.DEBUG_MODE;
        }
        
        // Fallback: check hostname/URL parameters
        if (typeof window !== 'undefined' && window.location) {
            return window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '0.0.0.0' ||
                   window.location.search.includes('debug=true') ||
                   window.location.search.includes('dev=true') ||
                   window.location.port === '8090';
        }
        
        return false;
    }

    /**
     * Get current page name for context
     * @function _getCurrentPage
     * @private
     * @returns {string} Current page name
     */
    _getCurrentPage() {
        if (typeof window === 'undefined' || !window.location) {
            return 'unknown';
        }
        const path = window.location.pathname;
        const page = path.split('/').pop()?.replace('.html', '') || 'index';
        return page;
    }

    /**
     * Get stack trace (only in DEBUG mode or when explicitly enabled)
     * @function _getStackTrace
     * @private
     * @returns {string|null} Stack trace or null
     */
    _getStackTrace() {
        if (!this.collectStackTraces) {
            return null;
        }
        
        try {
            const stack = new Error().stack;
            // Remove first 2 lines (this function and caller)
            return stack ? stack.split('\n').slice(3).join('\n') : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Build detailed event context for logging
     * @function _buildEventContext
     * @private
     * @param {Event} event - The event object
     * @param {HTMLElement} element - Target element (optional)
     * @param {Function|string} handler - Handler function or handler name (optional)
     * @returns {Object} Detailed context object
     */
    _buildEventContext(event, element = null, handler = null) {
        const context = {
            timestamp: Date.now(),
            page: this._getCurrentPage(),
            url: typeof window !== 'undefined' && window.location ? window.location.href : null
        };

        // Event information
        if (event) {
            context.event = {
                type: event.type,
                target: event.target ? {
                    tagName: event.target.tagName,
                    id: event.target.id,
                    className: event.target.className,
                    selector: this._getElementSelector(event.target)
                } : null,
                currentTarget: event.currentTarget ? {
                    tagName: event.currentTarget.tagName,
                    id: event.currentTarget.id,
                    className: event.currentTarget.className
                } : null,
                bubbles: event.bubbles,
                cancelable: event.cancelable,
                defaultPrevented: event.defaultPrevented,
                timeStamp: event.timeStamp
            };

            // Event path (DOM hierarchy)
            if (event.path && event.path.length > 0) {
                context.event.path = event.path.slice(0, 5).map(el => ({
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className
                }));
            }
        }

        // Element information
        if (element) {
            context.element = {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                selector: this._getElementSelector(element),
                attributes: this._getRelevantAttributes(element)
            };
        }

        // Handler information
        if (handler) {
            if (typeof handler === 'function') {
                context.handler = {
                    name: handler.name || 'anonymous',
                    type: 'function',
                    source: handler.toString().substring(0, 200) // First 200 chars
                };
            } else if (typeof handler === 'string') {
                context.handler = {
                    name: handler,
                    type: 'string'
                };
            }
        }

        // Stack trace (only in DEBUG mode)
        if (this.collectStackTraces) {
            const stack = this._getStackTrace();
            if (stack) {
                context.stackTrace = stack;
            }
        }

        return context;
    }

    /**
     * Get element selector for debugging
     * @function _getElementSelector
     * @private
     * @param {HTMLElement} element - DOM element
     * @returns {string} CSS selector string
     */
    _getElementSelector(element) {
        if (!element) return '';
        
        try {
            // Try ID first
            if (element.id) {
                return `#${element.id}`;
            }
            
            // Try classes
            if (element.className && typeof element.className === 'string') {
                const classes = element.className.split(' ').filter(c => c).join('.');
                if (classes) {
                    return `${element.tagName.toLowerCase()}.${classes}`;
                }
            }
            
            // Fallback to tag name
            return element.tagName.toLowerCase();
        } catch (e) {
            return 'unknown';
        }
    }

    /**
     * Get relevant attributes from element
     * @function _getRelevantAttributes
     * @private
     * @param {HTMLElement} element - DOM element
     * @returns {Object} Relevant attributes object
     */
    _getRelevantAttributes(element) {
        // Guard against non-element targets (e.g., document, window, text nodes)
        if (!element || typeof element.hasAttribute !== 'function' || typeof element.getAttribute !== 'function') {
            return {};
        }
        
        // Guard: ensure element is a valid DOM Element to avoid TypeError on window/document
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return {};
        }

        const relevant = {};
        const relevantAttrs = [
            'data-onclick', 'data-onchange', 'data-action', 'data-modal-trigger',
            'data-entity-type', 'data-entity-id', 'data-table-type', 'data-table-id',
            'data-filter-change', 'data-field-change', 'data-validate-on-input',
            'data-validate-on-blur', 'data-search-input', 'type', 'name', 'value'
        ];
        
        relevantAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                relevant[attr] = element.getAttribute(attr);
            }
        });
        
        return relevant;
    }

    /**
     * Track event execution for monitoring
     * @function _trackEvent
     * @private
     * @param {string} eventType - Event type (click, change, etc.)
     * @param {HTMLElement} element - Target element
     * @param {Function|string} handler - Handler function or name
     * @param {*} result - Execution result
     * @param {number} executionTime - Execution time in ms
     * @param {Error|null} error - Error if any
     * @returns {void}
     */
    _trackEvent(eventType, element, handler, result, executionTime, error = null) {
        if (!this.enablePerformanceTracking && !this.debugMode) {
            return; // Skip tracking in production unless explicitly enabled
        }

        const timestamp = Date.now();
        const handlerKey = typeof handler === 'function' 
            ? `${eventType}:${handler.name || 'anonymous'}`
            : `${eventType}:${handler || 'unknown'}`;

        // Update statistics
        this.eventStatistics.totalEvents++;
        
        // Events by type
        const typeCount = this.eventStatistics.eventsByType.get(eventType) || 0;
        this.eventStatistics.eventsByType.set(eventType, typeCount + 1);
        
        // Events by handler
        const handlerCount = this.eventStatistics.eventsByHandler.get(handlerKey) || 0;
        this.eventStatistics.eventsByHandler.set(handlerKey, handlerCount + 1);

        // Track errors
        if (error) {
            const errorCount = this.eventStatistics.errorsByType.get(eventType) || 0;
            this.eventStatistics.errorsByType.set(eventType, errorCount + 1);
            
            // Store error with full context
            const errorEntry = {
                timestamp,
                eventType,
                handlerKey,
                error: {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                },
                element: element ? this._getElementSelector(element) : null,
                context: this._buildEventContext(null, element, handler)
            };
            
            this.errors.push(errorEntry);
            if (this.errors.length > this.maxErrorsSize) {
                this.errors.shift(); // Remove oldest
            }
        }

        // Track performance
        if (executionTime !== null && executionTime !== undefined) {
            const perfData = this.eventStatistics.performanceByHandler.get(handlerKey) || {
                total: 0,
                count: 0,
                avg: 0,
                min: Infinity,
                max: 0,
                times: []
            };
            
            perfData.total += executionTime;
            perfData.count++;
            perfData.avg = perfData.total / perfData.count;
            perfData.min = Math.min(perfData.min, executionTime);
            perfData.max = Math.max(perfData.max, executionTime);
            perfData.times.push(executionTime);
            
            // Keep only last 100 execution times
            if (perfData.times.length > 100) {
                perfData.times.shift();
            }
            
            this.eventStatistics.performanceByHandler.set(handlerKey, perfData);
            
            // Track slow handlers
            if (executionTime > this.performanceThreshold) {
                const slowHandler = {
                    handlerKey,
                    executionTime,
                    threshold: this.performanceThreshold,
                    timestamp,
                    element: element ? this._getElementSelector(element) : null
                };
                
                // Update or add to slow handlers list
                const existingIndex = this.eventStatistics.slowHandlers.findIndex(
                    h => h.handlerKey === handlerKey
                );
                if (existingIndex >= 0) {
                    this.eventStatistics.slowHandlers[existingIndex] = slowHandler;
                } else {
                    this.eventStatistics.slowHandlers.push(slowHandler);
                    // Keep only last 20 slow handlers
                    if (this.eventStatistics.slowHandlers.length > 20) {
                        this.eventStatistics.slowHandlers.shift();
                    }
                }
            }
        }

        // Add to event history
        const historyEntry = {
            timestamp,
            eventType,
            handlerKey,
            element: element ? this._getElementSelector(element) : null,
            executionTime,
            success: !error,
            error: error ? {
                message: error.message,
                name: error.name
            } : null
        };
        
        this.eventHistory.push(historyEntry);
        if (this.eventHistory.length > this.maxEventHistorySize) {
            this.eventHistory.shift(); // Remove oldest (circular buffer)
        }
    }

    /**
     * Wrap handler with performance tracking
     * @function _wrapHandlerWithTracking
     * @private
     * @param {Function} handler - Original handler function
     * @param {string} handlerKey - Handler key for tracking
     * @param {string} eventName - Event name
     * @returns {Function} Wrapped handler
     */
    _wrapHandlerWithTracking(handler, handlerKey, eventName) {
        if (!this.enablePerformanceTracking) {
            return handler; // Return original if tracking disabled
        }

        const self = this;
        return function(...args) {
            const startTime = performance.now();
            let result;
            let error = null;

            try {
                result = handler.apply(this, args);
                
                // Handle async functions (Promises)
                if (result && typeof result.then === 'function') {
                    const asyncStartTime = performance.now();
                    return result
                        .then((value) => {
                            const asyncExecutionTime = performance.now() - asyncStartTime;
                            self._trackEvent(
                                eventName,
                                args[0]?.target || null,
                                handler,
                                value,
                                asyncExecutionTime,
                                null
                            );
                            return value;
                        })
                        .catch((err) => {
                            const asyncExecutionTime = performance.now() - asyncStartTime;
                            self._trackEvent(
                                eventName,
                                args[0]?.target || null,
                                handler,
                                null,
                                asyncExecutionTime,
                                err
                            );
                            throw err;
                        });
                }
                
                const executionTime = performance.now() - startTime;
                self._trackEvent(
                    eventName,
                    args[0]?.target || null,
                    handler,
                    result,
                    executionTime,
                    null
                );
                
                return result;
            } catch (err) {
                error = err;
                const executionTime = performance.now() - startTime;
                self._trackEvent(
                    eventName,
                    args[0]?.target || null,
                    handler,
                    null,
                    executionTime,
                    err
                );
                throw err;
            }
        };
    }

    /**
     * Unified logging function with Logger Service integration
     * @function _log
     * @private
     * @param {string} level - Log level (debug, info, warn, error)
     * @param {string} message - Log message
     * @param {Object} context - Additional context
     * @returns {void}
     */
    _log(level, message, context = {}) {
        // Use Logger Service if available
        if (window.Logger && typeof window.Logger[level] === 'function') {
            try {
                window.Logger[level](`[EventHandlerManager] ${message}`, {
                    ...context,
                    component: 'event-handler-manager',
                    page: context.page || this._getCurrentPage()
                });
                return;
            } catch (e) {
                // Fallback to console if Logger fails
            }
        }

        // Fallback to console
        const logFunc = console[level] || console.log;
        const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'info' ? 'ℹ️' : '🔍';
        logFunc(`${prefix} [EventHandlerManager] ${message}`, context);
    }

    // ===== DEBUG API =====

    /**
     * Debug API - Comprehensive debugging tools
     * Access via: window.EventHandlerManager.debug.*
     * 
     * All methods use arrow functions to maintain correct 'this' context.
     */
    debug = {
        /**
         * Get all listeners with detailed information
         * @function getListeners
         * @returns {Array} Array of listener objects with full metadata
         * 
         * @example
         * const listeners = window.EventHandlerManager.debug.getListeners();
         * console.log('Total listeners:', listeners.length);
         */
        getListeners: () => {
            const self = window.EventHandlerManager;
            const listeners = [];
            for (const [key, data] of self.listeners) {
                listeners.push({
                    key,
                    eventName: key.split(':')[0],
                    handlerName: key.split(':')[1] || 'anonymous',
                    ...data
                });
            }
            return listeners;
        },

        /**
         * Get event history (last N events)
         * @function getEventHistory
         * @param {number} [count=50] - Number of events to return
         * @returns {Array} Array of recent event entries
         * 
         * @example
         * const recentEvents = window.EventHandlerManager.debug.getEventHistory(20);
         */
        getEventHistory: (count = 50) => {
            const self = window.EventHandlerManager;
            return self.eventHistory.slice(-count).reverse(); // Most recent first
        },

        /**
         * Get comprehensive statistics
         * @function getStatistics
         * @returns {Object} Statistics object with all metrics
         * 
         * @example
         * const stats = window.EventHandlerManager.debug.getStatistics();
         * console.log('Total events:', stats.totalEvents);
         * console.log('Slow handlers:', stats.slowHandlers);
         */
        getStatistics: () => {
            const self = window.EventHandlerManager;
            return {
                totalEvents: self.eventStatistics.totalEvents,
                eventsByType: Object.fromEntries(self.eventStatistics.eventsByType),
                eventsByHandler: Object.fromEntries(self.eventStatistics.eventsByHandler),
                errorsByType: Object.fromEntries(self.eventStatistics.errorsByType),
                performanceByHandler: Object.fromEntries(
                    Array.from(self.eventStatistics.performanceByHandler.entries()).map(([key, data]) => [
                        key,
                        {
                            total: data.total,
                            count: data.count,
                            avg: data.avg,
                            min: data.min,
                            max: data.max
                        }
                    ])
                ),
                slowHandlers: self.eventStatistics.slowHandlers,
                totalListeners: self.listeners.size,
                totalErrors: self.errors.length,
                debugMode: self.debugMode,
                performanceTracking: self.enablePerformanceTracking
            };
        },

        /**
         * Get detailed information about a specific handler
         * @function getHandlerInfo
         * @param {string} handlerKey - Handler key (format: "eventName:handlerName")
         * @returns {Object|null} Handler information or null if not found
         * 
         * @example
         * const info = window.EventHandlerManager.debug.getHandlerInfo('click:handleClick');
         */
        getHandlerInfo: (handlerKey) => {
            const self = window.EventHandlerManager;
            const data = self.listeners.get(handlerKey);
            if (!data) return null;

            const perfData = self.eventStatistics.performanceByHandler.get(handlerKey);
            const callCount = self.eventStatistics.eventsByHandler.get(handlerKey) || 0;
            const errorCount = self.eventStatistics.errorsByType.get(handlerKey.split(':')[0]) || 0;

            return {
                key: handlerKey,
                ...data,
                callCount,
                errorCount,
                performance: perfData || null
            };
        },

        /**
         * Find all listeners for a specific element
         * @function findListenersForElement
         * @param {string} selector - CSS selector for the element
         * @returns {Array} Array of matching listeners
         * 
         * @example
         * const listeners = window.EventHandlerManager.debug.findListenersForElement('#myButton');
         */
        findListenersForElement: (selector) => {
            const self = window.EventHandlerManager;
            try {
                const element = document.querySelector(selector);
                if (!element) return [];

                // For delegated events, we check event history
                return self.eventHistory
                    .filter(entry => {
                        // This is a simplified check - in real implementation, 
                        // we'd need to track element associations more carefully
                        return entry.element === selector || 
                               entry.element && element && element.nodeType === Node.ELEMENT_NODE && element.matches(entry.element);
                    })
                    .map(entry => ({
                        handlerKey: entry.handlerKey,
                        eventType: entry.eventType,
                        lastCalled: entry.timestamp
                    }));
            } catch (e) {
                return [];
            }
        },

        /**
         * Find all listeners for a specific event type
         * @function findListenersForEvent
         * @param {string} eventName - Event name (click, change, etc.)
         * @returns {Array} Array of listeners for this event
         * 
         * @example
         * const clickListeners = window.EventHandlerManager.debug.findListenersForEvent('click');
         */
        findListenersForEvent: (eventName) => {
            const self = window.EventHandlerManager;
            const listeners = [];
            for (const [key, data] of self.listeners) {
                if (key.startsWith(`${eventName}:`)) {
                    listeners.push({
                        key,
                        handlerName: key.split(':')[1] || 'anonymous',
                        ...data
                    });
                }
            }
            return listeners;
        },

        /**
         * Simulate an event on an element
         * @function simulateEvent
         * @param {string} eventName - Event name to simulate
         * @param {string} elementSelector - CSS selector for target element
         * @param {Object} [eventData={}] - Additional event data
         * @returns {boolean} True if event was dispatched
         * 
         * @example
         * window.EventHandlerManager.debug.simulateEvent('click', '#myButton', { button: 0 });
         */
        simulateEvent: (eventName, elementSelector, eventData = {}) => {
            try {
                const element = document.querySelector(elementSelector);
                if (!element) {
                    console.warn(`[EventHandlerManager.debug] Element not found: ${elementSelector}`);
                    return false;
                }

                const event = new Event(eventName, {
                    bubbles: true,
                    cancelable: true,
                    ...eventData
                });

                element.dispatchEvent(event);
                return true;
            } catch (e) {
                console.error(`[EventHandlerManager.debug] Error simulating event:`, e);
                return false;
            }
        },

        /**
         * Enable verbose logging
         * @function enableVerboseLogging
         * @returns {void}
         * 
         * @example
         * window.EventHandlerManager.debug.enableVerboseLogging();
         */
        enableVerboseLogging: () => {
            const self = window.EventHandlerManager;
            self.verboseLogging = true;
            self.enablePerformanceTracking = true;
            self.collectStackTraces = true;
            console.log('[EventHandlerManager.debug] Verbose logging enabled');
        },

        /**
         * Disable verbose logging
         * @function disableVerboseLogging
         * @returns {void}
         */
        disableVerboseLogging: () => {
            const self = window.EventHandlerManager;
            self.verboseLogging = false;
            self.enablePerformanceTracking = self.debugMode; // Revert to debug mode setting
            self.collectStackTraces = self.debugMode;
            console.log('[EventHandlerManager.debug] Verbose logging disabled');
        },

        /**
         * Get error report
         * @function getErrorReport
         * @returns {Object} Error report with all errors and context
         * 
         * @example
         * const errorReport = window.EventHandlerManager.debug.getErrorReport();
         * console.log('Total errors:', errorReport.total);
         */
        getErrorReport: () => {
            const self = window.EventHandlerManager;
            return {
                total: self.errors.length,
                errors: self.errors,
                errorsByType: Object.fromEntries(self.eventStatistics.errorsByType),
                recentErrors: self.errors.slice(-10).reverse() // Last 10 errors
            };
        },

        /**
         * Clear event history
         * @function clearHistory
         * @returns {void}
         */
        clearHistory: () => {
            const self = window.EventHandlerManager;
            self.eventHistory = [];
            console.log('[EventHandlerManager.debug] Event history cleared');
        },

        /**
         * Clear statistics
         * @function clearStatistics
         * @returns {void}
         */
        clearStatistics: () => {
            const self = window.EventHandlerManager;
            self.eventStatistics = {
                totalEvents: 0,
                eventsByType: new Map(),
                eventsByHandler: new Map(),
                errorsByType: new Map(),
                performanceByHandler: new Map(),
                slowHandlers: []
            };
            self.errors = [];
            console.log('[EventHandlerManager.debug] Statistics cleared');
        }
    };
}

// Initialize the global event handler manager
window.EventHandlerManager = new EventHandlerManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.EventHandlerManager.init();
    });
} else {
    window.EventHandlerManager.init();
}

