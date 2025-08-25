/**
 * Warning System - TikTrack Centralized Warning Management
 * =======================================================
 * 
 * CENTRALIZED WARNING SYSTEM (August 25, 2025):
 * =============================================
 * 
 * This file provides a centralized warning system that can be used across
 * all pages in the application. It maintains consistent styling and behavior
 * while allowing easy customization and reuse.
 * 
 * FEATURES:
 * - Centralized warning message management
 * - Consistent styling across all pages
 * - Easy customization for different contexts
 * - Reusable warning components
 * - Type-safe warning configurations
 * 
 * USAGE EXAMPLES:
 * - showWarning('delete', { itemType: 'ticker', itemName: 'AAPL' })
 * - showWarning('linked_items', { itemType: 'account', linkedCount: 5 })
 * - showWarning('validation', { field: 'symbol', message: 'Symbol already exists' })
 * 
 * CONTENTS:
 * =========
 * 
 * 1. WARNING TYPES AND CONFIGURATIONS:
 *    - WARNING_TYPES - Predefined warning configurations
 *    - getWarningConfig() - Get warning configuration by type
 * 
 * 2. WARNING DISPLAY FUNCTIONS:
 *    - showWarning() - Main function to display warnings
 *    - createWarningHTML() - Create warning HTML structure
 *    - createWarningModal() - Create warning modal
 * 
 * 3. WARNING STYLES AND THEMES:
 *    - getWarningTheme() - Get warning theme based on type
 *    - getWarningIcon() - Get warning icon based on type
 * 
 * 4. UTILITY FUNCTIONS:
 *    - validateWarningData() - Validate warning data
 *    - formatWarningMessage() - Format warning message
 *    - getWarningActions() - Get warning action buttons
 * 
 * DEPENDENCIES:
 * ============
 * - ui-utils.js: Modal and notification functions
 * - translation-utils.js: Text translations
 */

// ===== WARNING TYPES AND CONFIGURATIONS =====

/**
 * Predefined warning types and their configurations
 */
const WARNING_TYPES = {
    // מחיקת פריט
    DELETE: {
        id: 'delete',
        title: 'מחיקת {itemType}',
        message: 'האם אתה בטוח שברצונך למחוק את {itemType} "{itemName}"?',
        icon: 'fas fa-trash-alt',
        theme: 'danger',
        actions: ['cancel', 'delete'],
        defaultAction: 'cancel'
    },
    
    // פריטים מקושרים
    LINKED_ITEMS: {
        id: 'linked_items',
        title: 'לא ניתן למחוק {itemType}',
        message: '{itemType} זה מקושר ל-{linkedCount} פריטים במערכת. יש לטפל בהם תחילה.',
        icon: 'fas fa-link',
        theme: 'warning',
        actions: ['close', 'force_delete', 'manage_linked'],
        defaultAction: 'close'
    },
    
    // שגיאת אימות
    VALIDATION: {
        id: 'validation',
        title: 'שגיאת אימות',
        message: 'שדה "{field}": {message}',
        icon: 'fas fa-exclamation-triangle',
        theme: 'warning',
        actions: ['ok'],
        defaultAction: 'ok'
    },
    
    // אזהרת מערכת
    SYSTEM: {
        id: 'system',
        title: 'אזהרת מערכת',
        message: '{message}',
        icon: 'fas fa-exclamation-circle',
        theme: 'info',
        actions: ['ok'],
        defaultAction: 'ok'
    },
    
    // אישור פעולה
    CONFIRMATION: {
        id: 'confirmation',
        title: 'אישור פעולה',
        message: '{message}',
        icon: 'fas fa-question-circle',
        theme: 'primary',
        actions: ['cancel', 'confirm'],
        defaultAction: 'cancel'
    }
};

/**
 * Get warning configuration by type
 * 
 * @param {string} type - Warning type
 * @param {Object} data - Warning data for customization
 * @returns {Object} Warning configuration
 */
function getWarningConfig(type, data = {}) {
    const config = WARNING_TYPES[type.toUpperCase()];
    if (!config) {
        throw new Error(`Unknown warning type: ${type}`);
    }
    
    return {
        ...config,
        title: formatWarningMessage(config.title, data),
        message: formatWarningMessage(config.message, data)
    };
}

// ===== WARNING DISPLAY FUNCTIONS =====

/**
 * Show warning modal
 * 
 * Main function to display warnings across the application
 * 
 * @param {string} type - Warning type (delete, linked_items, validation, etc.)
 * @param {Object} data - Warning data for customization
 * @param {Object} options - Additional options
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 */
function showWarning(type, data = {}, options = {}, onConfirm = null, onCancel = null) {
    try {
        // Validate input
        validateWarningData(type, data);
        
        // Get warning configuration
        const config = getWarningConfig(type, data);
        
        // Create warning modal
        const modalId = createWarningModal(config, options, onConfirm, onCancel);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        return modalId;
        
    } catch (error) {
        console.error('Error showing warning:', error);
        // Fallback to simple alert
        alert(data.message || 'שגיאה בהצגת האזהרה');
    }
}

/**
 * Create warning HTML structure
 * 
 * @param {Object} config - Warning configuration
 * @param {Object} options - Additional options
 * @returns {string} HTML content
 */
function createWarningHTML(config, options = {}) {
    const theme = getWarningTheme(config.theme);
    const icon = getWarningIcon(config.icon);
    
    return `
        <div class="warning-container">
            <div class="warning-header ${theme.headerClass}">
                <div class="warning-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="warning-title">
                    <h5>${config.title}</h5>
                </div>
            </div>
            
            <div class="warning-body">
                <div class="warning-message">
                    ${config.message}
                </div>
                
                ${options.additionalContent || ''}
            </div>
            
            <div class="warning-footer">
                ${getWarningActions(config.actions, config.defaultAction, theme)}
            </div>
        </div>
    `;
}

/**
 * Create warning modal
 * 
 * @param {Object} config - Warning configuration
 * @param {Object} options - Additional options
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 * @returns {string} Modal ID
 */
function createWarningModal(config, options = {}, onConfirm = null, onCancel = null) {
    const modalId = `warningModal_${Date.now()}`;
    const modalHtml = `
        <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header ${getWarningTheme(config.theme).headerClass}">
                        <h5 class="modal-title" id="${modalId}Label">
                            <i class="${config.icon}"></i>
                            ${config.title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${config.message}
                        ${options.additionalContent || ''}
                    </div>
                    <div class="modal-footer">
                        ${getWarningActions(config.actions, config.defaultAction, getWarningTheme(config.theme), onConfirm, onCancel)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    return modalId;
}

// ===== WARNING STYLES AND THEMES =====

/**
 * Get warning theme based on type
 * 
 * @param {string} theme - Theme name
 * @returns {Object} Theme configuration
 */
function getWarningTheme(theme) {
    const themes = {
        danger: {
            headerClass: 'bg-danger text-white',
            buttonClass: 'btn-danger',
            iconClass: 'text-danger'
        },
        warning: {
            headerClass: 'bg-warning text-dark',
            buttonClass: 'btn-warning',
            iconClass: 'text-warning'
        },
        info: {
            headerClass: 'bg-info text-white',
            buttonClass: 'btn-info',
            iconClass: 'text-info'
        },
        primary: {
            headerClass: 'bg-primary text-white',
            buttonClass: 'btn-primary',
            iconClass: 'text-primary'
        }
    };
    
    return themes[theme] || themes.warning;
}

/**
 * Get warning icon based on type
 * 
 * @param {string} icon - Icon class
 * @returns {string} Icon HTML
 */
function getWarningIcon(icon) {
    return icon || 'fas fa-exclamation-triangle';
}

// ===== UTILITY FUNCTIONS =====

/**
 * Validate warning data
 * 
 * @param {string} type - Warning type
 * @param {Object} data - Warning data
 */
function validateWarningData(type, data) {
    if (!type || typeof type !== 'string') {
        throw new Error('Warning type must be a string');
    }
    
    if (!WARNING_TYPES[type.toUpperCase()]) {
        throw new Error(`Unknown warning type: ${type}`);
    }
    
    if (data && typeof data !== 'object') {
        throw new Error('Warning data must be an object');
    }
}

/**
 * Format warning message with data
 * 
 * @param {string} template - Message template
 * @param {Object} data - Data to insert
 * @returns {string} Formatted message
 */
function formatWarningMessage(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return data[key] || match;
    });
}

/**
 * Get warning action buttons
 * 
 * @param {Array} actions - Available actions
 * @param {string} defaultAction - Default action
 * @param {Object} theme - Theme configuration
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @returns {string} Action buttons HTML
 */
function getWarningActions(actions, defaultAction, theme, onConfirm = null, onCancel = null) {
    const actionConfigs = {
        cancel: {
            text: 'ביטול',
            class: 'btn-secondary',
            action: 'cancel'
        },
        ok: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'ok'
        },
        delete: {
            text: 'מחק',
            class: 'btn-danger',
            action: 'delete'
        },
        confirm: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'confirm'
        },
        close: {
            text: 'סגור',
            class: 'btn-secondary',
            action: 'close'
        },
        force_delete: {
            text: 'מחק בכל זאת',
            class: 'btn-danger',
            action: 'force_delete'
        },
        manage_linked: {
            text: 'ניהול מקושרים',
            class: 'btn-info',
            action: 'manage_linked'
        }
    };
    
    let buttonsHtml = '';
    
    actions.forEach(actionName => {
        const actionConfig = actionConfigs[actionName];
        if (!actionConfig) return;
        
        const isDefault = actionName === defaultAction;
        const buttonClass = isDefault ? actionConfig.class : 'btn-outline-secondary';
        
        buttonsHtml += `
            <button type="button" class="btn ${buttonClass}" 
                    onclick="handleWarningAction('${actionConfig.action}', ${onConfirm ? 'true' : 'false'}, ${onCancel ? 'true' : 'false'})">
                ${actionConfig.text}
            </button>
        `;
    });
    
    return buttonsHtml;
}

/**
 * Handle warning action
 * 
 * @param {string} action - Action name
 * @param {boolean} hasConfirm - Whether confirm callback exists
 * @param {boolean} hasCancel - Whether cancel callback exists
 */
function handleWarningAction(action, hasConfirm, hasCancel) {
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.querySelector('.warning-modal'));
    if (modal) {
        modal.hide();
    }
    
    // Handle action
    switch (action) {
        case 'confirm':
        case 'ok':
        case 'delete':
            if (hasConfirm && typeof window.warningConfirmCallback === 'function') {
                window.warningConfirmCallback();
            }
            break;
        case 'cancel':
        case 'close':
            if (hasCancel && typeof window.warningCancelCallback === 'function') {
                window.warningCancelCallback();
            }
            break;
        case 'force_delete':
            if (hasConfirm && typeof window.warningConfirmCallback === 'function') {
                window.warningConfirmCallback();
            }
            break;
        case 'manage_linked':
            // Handle linked items management
            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal();
            }
            break;
    }
}

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Show delete warning
 * 
 * @param {string} itemType - Type of item to delete
 * @param {string} itemName - Name of item to delete
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 */
function showDeleteWarning(itemType, itemName, onConfirm = null, onCancel = null) {
    return showWarning('DELETE', {
        itemType: getItemTypeDisplayName(itemType),
        itemName: itemName
    }, {}, onConfirm, onCancel);
}

/**
 * Show linked items warning
 * 
 * @param {string} itemType - Type of item
 * @param {number} linkedCount - Number of linked items
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 */
function showLinkedItemsWarning(itemType, linkedCount, onConfirm = null, onCancel = null) {
    return showWarning('LINKED_ITEMS', {
        itemType: getItemTypeDisplayName(itemType),
        linkedCount: linkedCount
    }, {}, onConfirm, onCancel);
}

/**
 * Show validation warning
 * 
 * @param {string} field - Field name
 * @param {string} message - Validation message
 */
function showValidationWarning(field, message) {
    return showWarning('VALIDATION', {
        field: field,
        message: message
    });
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.showWarning = showWarning;
window.showDeleteWarning = showDeleteWarning;
window.showLinkedItemsWarning = showLinkedItemsWarning;
window.showValidationWarning = showValidationWarning;
window.getWarningConfig = getWarningConfig;
window.createWarningModal = createWarningModal;
window.handleWarningAction = handleWarningAction;
