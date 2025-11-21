/**
 * Centralized Event Handler System
 * ================================
 * 
 * This file provides a centralized event management system for TikTrack
 * to prevent duplicate event listeners and improve performance.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-26
 */

/**
 * Centralized Event Handler System
 * Manages all event listeners to prevent duplicates and improve performance
 */
class EventHandlerManager {
    constructor() {
        this.listeners = new Map();
        this.delegatedListeners = new Map();
        this.initialized = false;
    }

    /**
     * Initialize the event handler system
     * @function init
     */
    init() {
        if (this.initialized) {
            console.log('⚠️ [EventHandlerManager] Already initialized, skipping');
            return;
        }
        
        // Set up global event delegation
        this.setupGlobalDelegation();
        this.initialized = true;
        if (window.Logger) {
            window.Logger.info('EventHandlerManager initialized successfully');
        }
    }

    /**
     * Set up global event delegation for common events
     * @function setupGlobalDelegation
     * @private
     */
    setupGlobalDelegation() {
        // Click events delegation
        document.addEventListener('click', (event) => {
            this.handleDelegatedClick(event);
        }, true); // Use capture phase to catch events early

        // Change events delegation
        document.addEventListener('change', (event) => {
            this.handleDelegatedChange(event);
        });

        // Input events delegation
        document.addEventListener('input', (event) => {
            this.handleDelegatedInput(event);
        });

        // Blur events delegation
        document.addEventListener('blur', (event) => {
            this.handleDelegatedBlur(event);
        });
    }

    /**
     * Handle delegated click events
     * @function handleDelegatedClick
     * @param {Event} event - Click event
     * @private
     */
    handleDelegatedClick(event) {
        // Prevent double handling in bubbling chain
        if (event._ehmHandled) {
            return;
        }
        const target = event.target;
        
        // Handle buttons and links with data-onclick attribute (centralized button system)
        // This is the primary way to handle button clicks in TikTrack
        // Based on documentation: documentation/frontend/button-system.md
        // Supports both <button> and <a> elements with data-onclick
        const elementWithOnclick = target.closest('button[data-onclick], a[data-onclick]');
        
        if (elementWithOnclick) {
            // Don't process if element is disabled (for buttons)
            if (elementWithOnclick.disabled || elementWithOnclick.hasAttribute('disabled')) {
                return;
            }
            
            const onclickValue = elementWithOnclick.getAttribute('data-onclick');
            
            if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
                console.log('🚀 [EventHandlerManager] Executing onclick:', onclickValue);
                console.log('🚀 [EventHandlerManager] Checking if function exists in global scope...');
                
                // Check if the function exists before eval
                if (onclickValue.includes('openImportUserDataModal')) {
                    console.log('🚀 [EventHandlerManager] openImportUserDataModal check:', {
                        'window.openImportUserDataModal': typeof window.openImportUserDataModal,
                        'typeof openImportUserDataModal (global)': typeof (typeof window !== 'undefined' ? window.openImportUserDataModal : undefined)
                    });
                }
                
                try {
                    // Execute the onclick handler using eval (safe because it's controlled)
                    // Note: Following documentation spec - no preventDefault/stopPropagation
                    // to allow Bootstrap modals and other standard behaviors to work
                    // Eval runs in current scope, so window functions are available
                    // If function is not found, try with window. prefix
                    let result;
                    
                    // First, check if the function exists in global scope
                    const functionName = onclickValue.replace(/\(.*\)/, '').trim();
                    const functionArgs = onclickValue.match(/\((.*)\)/)?.[1] || '';
                    console.log('🚀 [EventHandlerManager] Function name extracted:', functionName);
                    console.log('🚀 [EventHandlerManager] Function args:', functionArgs);
                    console.log('🚀 [EventHandlerManager] window[functionName] exists:', typeof window[functionName]);
                    
                    // Try direct window access first if function exists there
                    if (window[functionName] && typeof window[functionName] === 'function') {
                        console.log('🚀 [EventHandlerManager] Function found in window, calling directly:', functionName);
                        try {
                            if (functionArgs) {
                                // Parse arguments (simple comma-separated, no complex parsing)
                                const args = functionArgs.split(',').map(arg => {
                                    const trimmed = arg.trim();
                                    // Try to evaluate as JavaScript expression, fallback to string
                                    try {
                                        return eval(trimmed);
                                    } catch {
                                        return trimmed;
                                    }
                                });
                                result = window[functionName](...args);
                            } else {
                                result = window[functionName]();
                            }
                            console.log('🚀 [EventHandlerManager] Direct call succeeded, result type:', typeof result);
                        } catch (directError) {
                            console.error('🚀 [EventHandlerManager] Direct call failed:', directError.name, directError.message);
                            throw directError;
                        }
                    } else {
                        // Fallback to eval
                        try {
                            console.log('🚀 [EventHandlerManager] Function not in window, attempting eval:', onclickValue);
                            result = eval(onclickValue);
                            console.log('🚀 [EventHandlerManager] Eval succeeded, result type:', typeof result);
                        } catch (evalError) {
                            console.error('🚀 [EventHandlerManager] Eval failed:', evalError.name, evalError.message);
                            // If eval fails, try with window. prefix for global functions
                            if (evalError.name === 'ReferenceError' && !onclickValue.includes('window.')) {
                                const windowPrefixed = `window.${onclickValue}`;
                                console.log('🚀 [EventHandlerManager] Retrying with window. prefix:', windowPrefixed);
                                try {
                                    result = eval(windowPrefixed);
                                    console.log('🚀 [EventHandlerManager] Window-prefixed eval succeeded, result type:', typeof result);
                                } catch (windowEvalError) {
                                    console.error('🚀 [EventHandlerManager] Window-prefixed eval also failed:', windowEvalError.name, windowEvalError.message);
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
                        result
                            .then(() => {
                                console.log('✅ [EventHandlerManager] Async onclick completed successfully');
                            })
                            .catch(error => {
                                console.error('❌ [EventHandlerManager] Error in async onclick:', {
                                    onclickValue: onclickValue,
                                    error: error.message,
                                    stack: error.stack
                                });
                                if (window.showErrorNotification) {
                                    window.showErrorNotification('שגיאה', `שגיאה בביצוע פעולה: ${error.message}`);
                                }
                            });
                        console.log('✅ [EventHandlerManager] Async onclick initiated successfully');
                    } else if (result === undefined || result === null) {
                        // אם התוצאה היא undefined/null, זה יכול להיות שהפונקציה היא async אבל לא החזירה Promise
                        // נבדוק אם יש ModalManagerV2 בקוד
                        if (onclickValue.includes('ModalManagerV2') && onclickValue.includes('showModal')) {
                            console.warn('⚠️ [EventHandlerManager] ModalManagerV2.showModal returned undefined - might be async issue');
                            console.warn('   onclickValue:', onclickValue);
                            console.warn('   ModalManagerV2 available:', !!window.ModalManagerV2);
                            console.warn('   showModal available:', !!(window.ModalManagerV2 && window.ModalManagerV2.showModal));
                        }
                        console.log('✅ [EventHandlerManager] onclick executed successfully (result:', result, ')');
                    } else {
                        console.log('✅ [EventHandlerManager] onclick executed successfully (result:', result, ')');
                    }
                } catch (error) {
                    console.error('❌ [EventHandlerManager] Error executing data-onclick:', {
                        onclickValue: onclickValue,
                        error: error.message,
                        stack: error.stack
                    });
                    if (window.Logger) {
                        window.Logger.error('EventHandlerManager: Error executing data-onclick', {
                            onclickValue: onclickValue,
                            error: error.message,
                            stack: error.stack
                        });
                    } else {
                        console.error('EventHandlerManager: Error executing data-onclick:', onclickValue, error);
                    }
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
                return;
            }
        } else {
        }
        
        // Handle TOGGLE buttons without data-onclick (auto-wire to nearest section)
        const toggleBtn = target.closest('button[data-button-type="TOGGLE"]:not([data-onclick])');
        if (toggleBtn && typeof window.toggleSection === 'function') {
            try {
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
                }
            } catch (err) {
                if (window.Logger) {
                    window.Logger.error('EventHandlerManager: TOGGLE auto-wire failed', { error: err?.message });
                }
            }
        }

        // Header filter toggles (fallback when inline onclick is blocked/missing)
        const headerFilterBtn = target.closest('button.filter-toggle');
        if (!event._ehmHandled && headerFilterBtn && window.headerSystemReady !== false) {
            try {
                if (headerFilterBtn.classList.contains('status-filter-toggle') && typeof window.toggleStatusFilterMenu === 'function') {
                    window.toggleStatusFilterMenu();
                    event._ehmHandled = true;
                    if (typeof event.stopImmediatePropagation === 'function') { event.stopImmediatePropagation(); }
                    return;
                }
                if (headerFilterBtn.classList.contains('type-filter-toggle') && typeof window.toggleTypeFilterMenu === 'function') {
                    window.toggleTypeFilterMenu();
                    event._ehmHandled = true;
                    if (typeof event.stopImmediatePropagation === 'function') { event.stopImmediatePropagation(); }
                    return;
                }
                if (headerFilterBtn.classList.contains('account-filter-toggle') && typeof window.toggleAccountFilterMenu === 'function') {
                    window.toggleAccountFilterMenu();
                    event._ehmHandled = true;
                    if (typeof event.stopImmediatePropagation === 'function') { event.stopImmediatePropagation(); }
                    return;
                }
                if (headerFilterBtn.classList.contains('date-range-filter-toggle') && typeof window.toggleDateRangeFilterMenu === 'function') {
                    window.toggleDateRangeFilterMenu();
                    event._ehmHandled = true;
                    if (typeof event.stopImmediatePropagation === 'function') { event.stopImmediatePropagation(); }
                    return;
                }
                if (headerFilterBtn.id === 'headerFilterToggleBtnMain' || headerFilterBtn.id === 'headerFilterToggleBtnSecondary') {
                    if (typeof window.toggleHeaderFilters === 'function') {
                        window.toggleHeaderFilters();
                        event._ehmHandled = true;
                        if (typeof event.stopImmediatePropagation === 'function') { event.stopImmediatePropagation(); }
                        return;
                    }
                }
            } catch (e) {
                if (window.Logger) {
                    window.Logger.error('EventHandlerManager: header filter toggle fallback failed', { error: e?.message });
                }
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
                if (window.Logger) {
                    window.Logger.debug('EventHandlerManager: Detected onclick button (browser will handle)', {
                        onclickValue: onclickValue,
                        element: buttonWithOnclickLegacy
                    });
                }
                // Don't execute - browser will handle onclick naturally
                // This prevents double execution while maintaining compatibility
            }
        }
        
        // Handle button clicks with data-action
        if (target.matches('[data-action]')) {
            const action = target.getAttribute('data-action');
            this.executeAction(action, target, event);
        }
        
        // Handle modal triggers
        if (target.matches('[data-modal-trigger]')) {
            const modalType = target.getAttribute('data-modal-trigger');
            this.openModal(modalType, target, event);
        }
        
        // Handle sortable headers - but only if they don't have onclick or data-onclick attributes
        // Elements with data-onclick are already handled above (lines 89-130)
        if (target.matches('.sortable-header')) {
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
     */
    handleDelegatedChange(event) {
        const target = event.target;
        
        // Handle data-onchange attribute (like data-onclick for buttons)
        const elementWithOnchange = target.closest('select[data-onchange], input[data-onchange]');
        if (elementWithOnchange) {
            const onchangeValue = elementWithOnchange.getAttribute('data-onchange');
            if (onchangeValue && onchangeValue !== 'null' && onchangeValue !== '') {
                console.log('🚀 [EventHandlerManager] Executing onchange:', onchangeValue);
                console.log('🚀 [EventHandlerManager] Element value:', elementWithOnchange.value);
                try {
                    // Replace 'this.value' with the actual value before eval
                    // This is needed because eval.call doesn't work correctly with 'this'
                    const actualValue = elementWithOnchange.value;
                    // Replace this.value with the actual value (handle both string and non-string)
                    const codeToExecute = onchangeValue.replace(/this\.value/g, 
                        typeof actualValue === 'string' ? `"${actualValue.replace(/"/g, '\\"')}"` : actualValue
                    );
                    console.log('🚀 [EventHandlerManager] Code after replacement:', codeToExecute);
                    console.log('🚀 [EventHandlerManager] Actual value:', actualValue, 'Type:', typeof actualValue);
                    
                    // Execute the onchange handler using eval
                    const result = eval(codeToExecute);
                    if (result && typeof result.then === 'function') {
                        result
                            .then(() => {
                                console.log('✅ [EventHandlerManager] Async onchange completed successfully');
                            })
                            .catch(error => {
                                console.error('❌ [EventHandlerManager] Error in async onchange:', error);
                                if (window.Logger) {
                                    window.Logger.error('EventHandlerManager: Error in async onchange', error);
                                }
                            });
                    } else {
                        console.log('✅ [EventHandlerManager] onchange executed successfully (sync)');
                    }
                    event._ehmHandled = true;
                    return;
                } catch (error) {
                    console.error('❌ [EventHandlerManager] Error executing data-onchange:', error);
                    if (window.Logger) {
                        window.Logger.error('EventHandlerManager: Error executing data-onchange', {
                            onchangeValue,
                            error: error.message,
                            stack: error.stack
                        });
                    }
                }
            }
        }
        
        // Debug logging for filter changes
        if (target.matches('[data-filter-change]')) {
            const filterType = target.getAttribute('data-filter-change');
            if (window.Logger) {
                window.Logger.debug('🔔 [EventHandlerManager] Detected filter change', {
                    filterType,
                    elementId: target.id,
                    value: target.value,
                    hasDataFilterChange: target.hasAttribute('data-filter-change')
                });
            }
        }
        
        // Handle form field changes
        if (target.matches('[data-field-change]')) {
            const fieldName = target.getAttribute('data-field-change');
            this.handleFieldChange(fieldName, target, event);
        }
        
        // Handle filter changes
        if (target.matches('[data-filter-change]')) {
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
        if (target.matches('[data-validate-on-input]')) {
            this.handleRealTimeValidation(target, event);
        }
        
        // Handle search inputs
        if (target.matches('[data-search-input]')) {
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
        if (target.matches('[data-validate-on-blur]')) {
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
        const delegatedElement = element.closest('button[data-onclick], a[data-onclick]');
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
     */
    handleFilterChange(filterType, element, event) {
        // Trigger filter change handlers
        const eventName = `filterChange:${filterType}`;
        if (window.Logger) {
            window.Logger.info('🔔 [EventHandlerManager] handleFilterChange called', {
                filterType,
                eventName,
                elementId: element.id,
                value: element.value
            });
        }
        this.dispatchCustomEvent(eventName, {
            filterType,
            element,
            value: element.value,
            originalEvent: event
        });
        if (window.Logger) {
            window.Logger.debug('✅ [EventHandlerManager] Custom event dispatched', {
                eventName,
                page: 'event-handler-manager'
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
     * Add event listener with deduplication
     * @function addEventListener
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(eventName, handler, options = {}) {
        const key = `${eventName}:${handler.name || 'anonymous'}`;
        
        if (this.listeners.has(key)) {
            if (window.Logger) {
                window.Logger.warn(`Duplicate event listener prevented: ${key}`);
            }
            return;
        }
        
        this.listeners.set(key, { handler, options });
        document.addEventListener(eventName, handler, options);
    }

    /**
     * Remove event listener
     * @function removeEventListener
     * @param {string} eventName - Event name
     * @param {Function} handler - Event handler
     */
    removeEventListener(eventName, handler) {
        const key = `${eventName}:${handler.name || 'anonymous'}`;
        
        if (this.listeners.has(key)) {
            this.listeners.delete(key);
            document.removeEventListener(eventName, handler);
        }
    }

    /**
     * Clean up all event listeners
     * @function cleanup
     */
    cleanup() {
        for (const [key, { handler, options }] of this.listeners) {
            document.removeEventListener(key.split(':')[0], handler, options);
        }
        this.listeners.clear();
        this.initialized = false;
    }
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

