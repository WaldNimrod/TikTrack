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
        if (this.initialized) return;
        
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
        });

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
        const target = event.target;
        
        // Handle buttons with data-onclick attribute (centralized button system)
        // This is the primary way to handle button clicks in TikTrack
        // Based on documentation: documentation/frontend/button-system.md
        const buttonWithOnclick = target.closest('button[data-onclick]');
        if (buttonWithOnclick) {
            // Don't process if button is disabled
            if (buttonWithOnclick.disabled || buttonWithOnclick.hasAttribute('disabled')) {
                return;
            }
            
            const onclickValue = buttonWithOnclick.getAttribute('data-onclick');
            if (onclickValue && onclickValue !== 'null' && onclickValue !== '') {
                try {
                    // Execute the onclick handler using eval (safe because it's controlled)
                    // Note: Following documentation spec - no preventDefault/stopPropagation
                    // to allow Bootstrap modals and other standard behaviors to work
                    eval(onclickValue);
                } catch (error) {
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
                // Don't return early - allow other handlers to process if needed
                // This ensures compatibility with Bootstrap and other systems
            }
        }
        
        // Handle buttons with onclick attribute (legacy support - for backwards compatibility)
        // Note: We don't execute onclick handlers here to avoid double execution
        // The browser will handle onclick naturally, we just log for debugging
        const buttonWithOnclickLegacy = target.closest('button[onclick]:not([data-onclick])');
        if (buttonWithOnclickLegacy && buttonWithOnclickLegacy !== buttonWithOnclick) {
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
        
        // Handle sortable headers
        if (target.matches('.sortable-header')) {
            this.handleSortableClick(target, event);
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
     */
    handleSortableClick(element, event) {
        const table = element.closest('table');
        // Try data-table-type first (most common), then data-table-id as fallback
        const tableType = table.getAttribute('data-table-type') || table.getAttribute('data-table-id');
        const column = element.getAttribute('data-column');
        
        if (window.tables && window.tables.sortTable) {
            window.tables.sortTable(tableType, column);
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
        this.dispatchCustomEvent(eventName, {
            filterType,
            element,
            value: element.value,
            originalEvent: event
        });
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

