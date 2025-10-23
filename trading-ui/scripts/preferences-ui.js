/**
 * Preferences UI System - TikTrack
 * ================================
 * 
 * UI helpers and form management for preferences
 * Handles all user interface interactions
 * 
 * @version 1.0.0
 * @date January 23, 2025
 * @author TikTrack Development Team
 * 
 * @description
 * UI-focused preferences system with:
 * - Form management and validation
 * - UI updates and feedback
 * - Loading states and animations
 * - Error handling and notifications
 * - Integration with preferences-core.js and preferences-colors.js
 * 
 * @architecture
 * - FormManager: Form operations and validation
 * - UIManager: UI updates and feedback
 * - LoadingManager: Loading states
 * - NotificationManager: User feedback
 * - PreferencesUI: Main coordinator
 */

console.log('📄 Loading preferences-ui.js v1.0.0...');

// ============================================================================
// FORM MANAGER CLASS
// ============================================================================

/**
 * Form Management System
 * Handles all form operations for preferences
 */
class FormManager {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.setupDefaultValidators();
    }
    
    /**
     * Setup default form validators
     */
    setupDefaultValidators() {
        // Email validator
        this.validators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });
        
        // Number validator
        this.validators.set('number', (value) => {
            return !isNaN(value) && isFinite(value);
        });
        
        // URL validator
        this.validators.set('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
        
        // Required validator
        this.validators.set('required', (value) => {
            return value !== null && value !== undefined && value !== '';
        });
    }
    
    /**
     * Collect form data
     * @param {string} formId - Form ID (optional, uses first form if not provided)
     * @returns {Object} Form data object
     */
    collectFormData(formId = null) {
        const form = formId ? document.getElementById(formId) : document.querySelector('form');
        if (!form) {
            console.warn('⚠️ No form found');
            return {};
        }
        
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.name || input.id;
            if (!name) return;
            
            let value = input.value;
            
            // Handle different input types
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    value = input.value;
                } else {
                    return; // Skip unchecked radio buttons
                }
            } else if (input.type === 'number') {
                value = parseFloat(value) || 0;
            }
            
            formData[name] = value;
        });
        
        console.log('📋 Collected form data:', formData);
        return formData;
    }
    
    /**
     * Populate form with data
     * @param {Object} data - Data to populate
     * @param {string} formId - Form ID (optional)
     */
    populateForm(data, formId = null) {
        const form = formId ? document.getElementById(formId) : document.querySelector('form');
        if (!form) {
            console.warn('⚠️ No form found');
            return;
        }
        
        Object.entries(data).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"], #${name}`);
            if (!input) return;
            
            // Handle different input types
            if (input.type === 'checkbox') {
                input.checked = Boolean(value);
            } else if (input.type === 'radio') {
                const radioInput = form.querySelector(`[name="${name}"][value="${value}"]`);
                if (radioInput) {
                    radioInput.checked = true;
                }
            } else {
                input.value = value;
            }
        });
        
        console.log('📋 Populated form with data');
    }
    
    /**
     * Validate form
     * @param {string} formId - Form ID (optional)
     * @returns {Object} Validation results
     */
    validateForm(formId = null) {
        const form = formId ? document.getElementById(formId) : document.querySelector('form');
        if (!form) {
            return { valid: false, errors: ['No form found'] };
        }
        
        const errors = [];
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.name || input.id;
            if (!name) return;
            
            const value = input.value;
            const validators = input.getAttribute('data-validate')?.split(',') || [];
            
            // Check required
            if (validators.includes('required') && !this.validators.get('required')(value)) {
                errors.push(`${name} is required`);
            }
            
            // Check other validators
            validators.forEach(validator => {
                if (validator !== 'required' && this.validators.has(validator)) {
                    if (!this.validators.get(validator)(value)) {
                        errors.push(`${name} is not a valid ${validator}`);
                    }
                }
            });
        });
        
        const result = {
            valid: errors.length === 0,
            errors: errors
        };
        
        console.log('✅ Form validation result:', result);
        return result;
    }
    
    /**
     * Reset form to defaults
     * @param {string} formId - Form ID (optional)
     */
    resetForm(formId = null) {
        const form = formId ? document.getElementById(formId) : document.querySelector('form');
        if (!form) {
            console.warn('⚠️ No form found');
            return;
        }
        
        form.reset();
        console.log('🔄 Form reset to defaults');
    }
}

// ============================================================================
// UI MANAGER CLASS
// ============================================================================

/**
 * UI Management System
 * Handles all UI updates and feedback
 */
class UIManager {
    constructor() {
        this.loadingStates = new Map();
        this.counters = new Map();
    }
    
    /**
     * Show loading state
     * @param {string} elementId - Element ID
     * @param {string} message - Loading message
     */
    showLoading(elementId, message = 'טוען...') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        this.loadingStates.set(elementId, {
            originalContent: element.innerHTML,
            originalDisabled: element.disabled
        });
        
        element.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${message}
        `;
        element.disabled = true;
        
        console.log(`⏳ Loading state: ${elementId}`);
    }
    
    /**
     * Hide loading state
     * @param {string} elementId - Element ID
     */
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const state = this.loadingStates.get(elementId);
        if (state) {
            element.innerHTML = state.originalContent;
            element.disabled = state.originalDisabled;
            this.loadingStates.delete(elementId);
        }
        
        console.log(`✅ Loading complete: ${elementId}`);
    }
    
    /**
     * Update counter
     * @param {string} counterId - Counter ID
     * @param {number} value - Counter value
     * @param {string} label - Counter label
     */
    updateCounter(counterId, value, label = '') {
        const element = document.getElementById(counterId);
        if (!element) return;
        
        element.textContent = `${label}${value}`;
        this.counters.set(counterId, value);
        
        console.log(`📊 Updated counter ${counterId}: ${value}`);
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     * @param {number} duration - Display duration (ms)
     */
    showSuccess(message, duration = 3000) {
        if (window.showSuccessNotification) {
            window.showSuccessNotification('הצלחה', message, duration);
        } else {
            console.log(`✅ ${message}`);
        }
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} duration - Display duration (ms)
     */
    showError(message, duration = 5000) {
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', message, duration);
        } else {
            console.error(`❌ ${message}`);
        }
    }
    
    /**
     * Show info message
     * @param {string} message - Info message
     * @param {number} duration - Display duration (ms)
     */
    showInfo(message, duration = 4000) {
        if (window.showInfoNotification) {
            window.showInfoNotification('מידע', message, duration);
        } else {
            console.log(`ℹ️ ${message}`);
        }
    }
    
    /**
     * Toggle section visibility
     * @param {string} sectionId - Section ID
     * @param {boolean} visible - Visibility state
     */
    toggleSection(sectionId, visible = null) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const isVisible = visible !== null ? visible : section.style.display !== 'none';
        section.style.display = isVisible ? 'block' : 'none';
        
        console.log(`👁️ Section ${sectionId}: ${isVisible ? 'visible' : 'hidden'}`);
    }
    
    /**
     * Update form status
     * @param {string} status - Status (saving, saved, error)
     * @param {string} message - Status message
     */
    updateFormStatus(status, message = '') {
        const statusElement = document.getElementById('form-status');
        if (!statusElement) return;
        
        const statusClasses = {
            saving: 'text-warning',
            saved: 'text-success',
            error: 'text-danger'
        };
        
        statusElement.className = statusClasses[status] || '';
        statusElement.textContent = message;
        
        console.log(`📋 Form status: ${status} - ${message}`);
    }
}

// ============================================================================
// LOADING MANAGER CLASS
// ============================================================================

/**
 * Loading State Manager
 * Handles loading states and animations
 */
class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
    }
    
    /**
     * Start loading
     * @param {string} loaderId - Loader ID
     * @param {string} message - Loading message
     */
    startLoading(loaderId, message = 'טוען...') {
        this.activeLoaders.add(loaderId);
        
        // Show global loading if available
        if (window.showInfoNotification) {
            window.showInfoNotification('טעינה', message);
        }
        
        console.log(`⏳ Started loading: ${loaderId}`);
    }
    
    /**
     * Stop loading
     * @param {string} loaderId - Loader ID
     * @param {boolean} success - Loading success
     * @param {string} message - Completion message
     */
    stopLoading(loaderId, success = true, message = 'הושלם') {
        this.activeLoaders.delete(loaderId);
        
        // Show completion message
        if (success && window.showSuccessNotification) {
            window.showSuccessNotification('הצלחה', message);
        } else if (!success && window.showErrorNotification) {
            window.showErrorNotification('שגיאה', message);
        }
        
        console.log(`✅ Stopped loading: ${loaderId} (${success ? 'success' : 'error'})`);
    }
    
    /**
     * Check if loading
     * @param {string} loaderId - Loader ID
     * @returns {boolean} Is loading
     */
    isLoading(loaderId) {
        return this.activeLoaders.has(loaderId);
    }
    
    /**
     * Get all active loaders
     * @returns {Array<string>} Active loader IDs
     */
    getActiveLoaders() {
        return Array.from(this.activeLoaders);
    }
}

// ============================================================================
// MAIN PREFERENCES UI CLASS
// ============================================================================

/**
 * Main Preferences UI System
 * Coordinates all UI operations
 */
class PreferencesUI {
    constructor() {
        this.formManager = new FormManager();
        this.uiManager = new UIManager();
        this.loadingManager = new LoadingManager();
        
        this.currentUserId = 1; // Nimrod
        this.currentProfileId = 3; // Default profile
    }
    
    /**
     * Load all preferences into form
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
    async loadAllPreferences(userId = null, profileId = null) {
        const loaderId = 'load_preferences';
        
        try {
            this.loadingManager.startLoading(loaderId, 'טוען העדפות...');
            
            // Load non-color preferences
            const preferences = await window.PreferencesCore.getAllPreferences(
                userId || this.currentUserId, 
                profileId || this.currentProfileId
            );
            
            // Load color preferences
            if (window.ColorManager) {
                const colors = await window.ColorManager.loadAllColors(
                    userId || this.currentUserId, 
                    profileId || this.currentProfileId
                );
                Object.assign(preferences, colors);
            }
            
            // Populate form
            this.formManager.populateForm(preferences);
            
            // Update counters
            this.updateCounters(preferences);
            
            this.loadingManager.stopLoading(loaderId, true, 'העדפות נטענו בהצלחה');
            
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            this.loadingManager.stopLoading(loaderId, false, 'שגיאה בטעינת העדפות');
            this.uiManager.showError('שגיאה בטעינת העדפות: ' + error.message);
        }
    }
    
    /**
     * Save all preferences from form
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
    async saveAllPreferences(userId = null, profileId = null) {
        const loaderId = 'save_preferences';
        
        try {
            this.loadingManager.startLoading(loaderId, 'שומר העדפות...');
            this.uiManager.updateFormStatus('saving', 'שומר...');
            
            // Validate form
            const validation = this.formManager.validateForm();
            if (!validation.valid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }
            
            // Collect form data
            const formData = this.formManager.collectFormData();
            
            // Separate color and non-color preferences
            const colorPreferences = {};
            const nonColorPreferences = {};
            
            Object.entries(formData).forEach(([name, value]) => {
                if (name.includes('Color') || name.includes('color')) {
                    colorPreferences[name] = value;
                } else {
                    nonColorPreferences[name] = value;
                }
            });
            
            let totalSaved = 0;
            let totalErrors = 0;
            
            // Save non-color preferences
            if (Object.keys(nonColorPreferences).length > 0) {
                const result = await window.PreferencesCore.savePreferences(
                    nonColorPreferences, 
                    userId || this.currentUserId, 
                    profileId || this.currentProfileId
                );
                totalSaved += result.saved;
                totalErrors += result.errors;
            }
            
            // Save color preferences
            if (Object.keys(colorPreferences).length > 0 && window.ColorManager) {
                const colorResult = await window.saveAllColorPreferences(
                    userId || this.currentUserId, 
                    profileId || this.currentProfileId
                );
                totalSaved += colorResult.saved;
                totalErrors += colorResult.errors;
            }
            
            if (totalErrors === 0) {
                this.loadingManager.stopLoading(loaderId, true, `נשמרו ${totalSaved} העדפות בהצלחה`);
                this.uiManager.updateFormStatus('saved', 'נשמר בהצלחה');
            } else {
                this.loadingManager.stopLoading(loaderId, false, `נשמרו ${totalSaved} העדפות, ${totalErrors} שגיאות`);
                this.uiManager.updateFormStatus('error', `${totalErrors} שגיאות`);
            }
            
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            this.loadingManager.stopLoading(loaderId, false, 'שגיאה בשמירת העדפות');
            this.uiManager.updateFormStatus('error', 'שגיאה בשמירה');
            this.uiManager.showError('שגיאה בשמירת העדפות: ' + error.message);
        }
    }
    
    /**
     * Reset all preferences to defaults
     */
    async resetToDefaults() {
        try {
            this.uiManager.showInfo('מאפס העדפות לברירות מחדל...');
            
            // Reset form
            this.formManager.resetForm();
            
            // Reset colors if available
            if (window.ColorManager) {
                window.resetAllColorsToDefaults();
            }
            
            // Clear cache
            window.PreferencesCore.clearCache();
            
            this.uiManager.showSuccess('העדפות אופסו לברירות מחדל');
            
        } catch (error) {
            console.error('❌ Error resetting preferences:', error);
            this.uiManager.showError('שגיאה באיפוס העדפות: ' + error.message);
        }
    }
    
    /**
     * Update counters
     * @param {Object} preferences - Preferences object
     */
    updateCounters(preferences) {
        const totalCount = Object.keys(preferences).length;
        const colorCount = Object.keys(preferences).filter(key => 
            key.includes('Color') || key.includes('color')
        ).length;
        const nonColorCount = totalCount - colorCount;
        
        this.uiManager.updateCounter('total-preferences', totalCount, 'סה"כ העדפות: ');
        this.uiManager.updateCounter('color-preferences', colorCount, 'צבעים: ');
        this.uiManager.updateCounter('non-color-preferences', nonColorCount, 'אחרות: ');
    }
    
    /**
     * Toggle preference sections
     * @param {string} sectionName - Section name
     */
    toggleSection(sectionName) {
        const sectionId = `section-${sectionName}`;
        this.uiManager.toggleSection(sectionId);
    }
    
    /**
     * Show preference groups
     * @param {Array<string>} groups - Group names to show
     */
    showPreferenceGroups(groups = ['general', 'colors', 'notifications', 'display']) {
        groups.forEach(group => {
            const sectionId = `section-${group}`;
            this.uiManager.toggleSection(sectionId, true);
        });
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
window.PreferencesUI = new PreferencesUI();

// ============================================================================
// GLOBAL FUNCTIONS (Backward Compatibility)
// ============================================================================

/**
 * Load all preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.loadAllPreferences = async function(userId = null, profileId = null) {
    return await window.PreferencesUI.loadAllPreferences(userId, profileId);
};

/**
 * Save all preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.saveAllPreferences = async function(userId = null, profileId = null) {
    return await window.PreferencesUI.saveAllPreferences(userId, profileId);
};

/**
 * Reset to defaults (backward compatibility)
 */
window.resetToDefaults = function() {
    return window.PreferencesUI.resetToDefaults();
};

/**
 * Update counters (backward compatibility)
 * @param {Object} preferences - Preferences object
 */
window.updateCounters = function(preferences) {
    return window.PreferencesUI.updateCounters(preferences);
};

/**
 * Toggle section (backward compatibility)
 * @param {string} sectionName - Section name
 */
window.toggleSection = function(sectionName) {
    return window.PreferencesUI.toggleSection(sectionName);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 Preferences UI system initialized');
    });
} else {
    console.log('📄 Preferences UI system initialized');
}

console.log('✅ preferences-ui.js loaded successfully');
