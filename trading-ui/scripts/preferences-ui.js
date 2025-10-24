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
        this.currentProfileId = null; // Will be loaded from server
    }
    
    /**
     * Load active profile from server
     * @returns {Promise<number>} Active profile ID
     */
    async loadActiveProfile() {
        try {
            console.log('🔍 Loading active profile from server...');
            const response = await fetch('/api/preferences/profiles');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load profiles');
            }
            
            const activeProfile = result.data.profiles.find(p => p.active === true);
            if (!activeProfile) {
                throw new Error('No active profile found');
            }
            
            this.currentProfileId = activeProfile.id;
            console.log(`✅ Active profile loaded: ${activeProfile.name} (ID: ${activeProfile.id})`);
            return activeProfile.id;
            
        } catch (error) {
            console.error('❌ Error loading active profile:', error);
            // Fallback to default profile
            this.currentProfileId = 1;
            console.log('⚠️ Using fallback profile ID: 1');
            return 1;
        }
    }
    
    /**
     * Load all preferences into form with lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
    async loadAllPreferences(userId = null, profileId = null) {
        const loaderId = 'load_preferences';
        
        try {
            this.loadingManager.startLoading(loaderId, 'טוען העדפות...');
            
            // Load active profile if not provided
            if (!profileId) {
                profileId = await this.loadActiveProfile();
            }
            
            // Update currentProfileId to match the loaded profile
            this.currentProfileId = profileId;
            console.log(`✅ PreferencesUI currentProfileId updated to: ${profileId}`);
            
            // 🔍 Cache & Profile Debug Logging
            console.log(`🔍 CACHE DEBUG: Loading preferences for user ${userId || this.currentUserId}, profile ${profileId || this.currentProfileId}`);
            
            // Initialize lazy loading if available
            if (window.LazyLoader) {
                await window.LazyLoader.initialize(
                    userId || this.currentUserId, 
                    profileId || this.currentProfileId
                );
                
                // Get loading stats
                const stats = window.LazyLoader.getLoadingStats();
                console.log(`🔍 CACHE DEBUG: Lazy loading stats: ${stats.loaded}/${stats.total} (${stats.percentage}%)`);
                
                // Load ALL preferences at once from API
                const allPreferences = await window.PreferencesCore.getAllPreferences(userId || this.currentUserId, profileId || this.currentProfileId);
                console.log(`✅ Loaded ${Object.keys(allPreferences).length} preferences from API`);
                
                // Populate form with ALL preferences
                this.formManager.populateForm(allPreferences);
                
                // Update counters
                await this.updateCounters(allPreferences);
                
                // Load profiles to dropdown
                await window.loadProfilesToDropdown();
                
                this.loadingManager.stopLoading(loaderId, true, `נטענו ${Object.keys(allPreferences).length} העדפות`);
                
            } else {
                console.log('⚠️ LazyLoader not available, using standard loading');
                
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
                    
                    // Load colors into color pickers
                    if (window.ColorPickerManager) {
                        window.ColorPickerManager.loadColors(colors);
                    }
                }
                
                // Populate form
                this.formManager.populateForm(preferences);
                
                // Update counters
                await this.updateCounters(preferences);
                
                // Load profiles to dropdown
                console.log('🔄 Calling loadProfilesToDropdown...');
                await window.loadProfilesToDropdown();
                
                this.loadingManager.stopLoading(loaderId, true, 'העדפות נטענו בהצלחה');
            }
            
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            this.loadingManager.stopLoading(loaderId, false, 'שגיאה בטעינת העדפות');
            this.uiManager.showError('שגיאה בטעינת העדפות: ' + error.message);
        }
    }
    
    /**
     * Save All Preferences - Clean Implementation
     * Handles saving preferences with proper validation and error handling
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
    async saveAllPreferences(userId = null, profileId = null) {
        try {
            console.log('💾 Starting save all preferences process...');
            
            // 1. Get form element
            const form = document.getElementById('preferencesForm');
            if (!form) {
                throw new Error('Preferences form not found');
            }
            
            // 2. Collect form data
            const formData = new FormData(form);
            const changedPreferences = {};
            
            // 3. Check for changes and collect only changed preferences
            for (let [key, value] of formData.entries()) {
                if (this.hasChanged(key, value)) {
                    changedPreferences[key] = value;
                }
            }
            
            // 4. Check if there are any changes
            if (Object.keys(changedPreferences).length === 0) {
                console.log('ℹ️ No changes to save');
                if (typeof window.showInfoNotification === 'function') {
                    window.showInfoNotification('אין שינויים לשמירה');
                }
                return true;
            }
            
            console.log(`📊 Found ${Object.keys(changedPreferences).length} changed preferences`);
            
            // 5. Validate all changed preferences
            for (let [name, value] of Object.entries(changedPreferences)) {
                console.log(`🔍 Validating ${name}...`);
                
                if (window.PreferenceValidator) {
                    const validation = await window.PreferenceValidator.validatePreference(name, value);
                    if (!validation.valid) {
                        const errorMessages = validation.errors.map(e => e.message).join(', ');
                        throw new Error(`Validation failed for ${name}: ${errorMessages}`);
                    }
                }
            }
            
            console.log('✅ All preferences validated successfully');
            
            // 6. Save to backend
            const response = await fetch('/api/preferences/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId || window.PreferencesCore.currentUserId,
                    profile_id: profileId || window.PreferencesCore.currentProfileId,
                    preferences: changedPreferences
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to save preferences');
            }
            
            console.log('✅ Preferences saved successfully');
            
            // 7. Clear all cache layers via UnifiedCacheManager
            if (window.clearAllUnifiedCacheQuick) {
                await window.clearAllUnifiedCacheQuick();
                console.log('✅ All cache layers cleared');
            } else {
                console.log('⚠️ UnifiedCacheManager not available for cache clearing');
            }
            
            // 8. Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(`נשמרו ${Object.keys(changedPreferences).length} העדפות בהצלחה`);
            }
            
            // 9. Reload page after 1.5 seconds
            console.log('🔄 Page will reload in 1.5 seconds...');
            setTimeout(() => {
                window.location.reload(true);
            }, 1500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(`שגיאה בשמירת העדפות: ${error.message}`);
            }
            
            return false;
        }
    }
    
    /**
     * Check if preference has changed
     * @param {string} key - Preference key
     * @param {string} value - New value
     * @returns {boolean} True if changed
     */
    hasChanged(key, value) {
        // For now, assume all values are changed
        // In a more sophisticated implementation, we would compare with original values
        return value !== null && value !== undefined && value !== '';
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
    async updateCounters(preferences) {
        const totalCount = Object.keys(preferences).length;
        const colorCount = Object.keys(preferences).filter(key => 
            key.includes('Color') || key.includes('color')
        ).length;
        const nonColorCount = totalCount - colorCount;
        
        this.uiManager.updateCounter('total-preferences', totalCount, 'סה"כ העדפות: ');
        this.uiManager.updateCounter('color-preferences', colorCount, 'צבעים: ');
        this.uiManager.updateCounter('non-color-preferences', nonColorCount, 'אחרות: ');
        
        // Update HTML statistics
        await this.updateStatistics(preferences);
    }
    
    /**
     * Update statistics in HTML
     * @param {Object} preferences - Preferences object
     */
    async updateStatistics(preferences) {
        try {
            console.log('📊 Updating statistics...');
            
            // Update preferences count
            const preferencesCount = Object.keys(preferences).length;
            const preferencesCountElement = document.getElementById('preferencesCount');
            if (preferencesCountElement) {
                preferencesCountElement.textContent = preferencesCount;
                console.log(`📊 Updated preferences count: ${preferencesCount}`);
            }
            
            // Update profiles count
            try {
                const profiles = await window.getUserProfiles();
                const profilesCount = profiles.length;
                const profilesCountElement = document.getElementById('profilesCount');
                if (profilesCountElement) {
                    profilesCountElement.textContent = profilesCount;
                    console.log(`📊 Updated profiles count: ${profilesCount}`);
                }
            } catch (error) {
                console.error('❌ Error loading profiles count:', error);
                const profilesCountElement = document.getElementById('profilesCount');
                if (profilesCountElement) {
                    profilesCountElement.textContent = 'שגיאה';
                }
            }
            
            // Update groups count
            try {
                const response = await fetch('/api/preferences/groups');
                if (response.ok) {
                    const result = await response.json();
                    const groupsCount = result.data.groups.length;
                    const groupsCountElement = document.getElementById('groupsCount');
                    if (groupsCountElement) {
                        groupsCountElement.textContent = groupsCount;
                        console.log(`📊 Updated groups count: ${groupsCount}`);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error('❌ Error loading groups count:', error);
                const groupsCountElement = document.getElementById('groupsCount');
                if (groupsCountElement) {
                    groupsCountElement.textContent = 'שגיאה';
                }
            }
            
            console.log('✅ Statistics updated successfully');
        } catch (error) {
            console.error('❌ Error updating statistics:', error);
        }
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
 * Save individual preference with cache management
 * @param {string} preferenceName - Preference name
 * @param {any} value - Preference value
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.saveIndividualPreference = async function(preferenceName, value, userId = null, profileId = null) {
    try {
        console.log(`💾 Saving individual preference: ${preferenceName} = ${value}`);
        
        // Validate
        if (window.PreferenceValidator) {
            const validation = await window.PreferenceValidator.validatePreference(preferenceName, value);
            if (!validation.valid) {
                throw new Error(validation.errors.map(e => e.message).join(', '));
            }
        }
        
        // Save to backend
        const success = await window.PreferencesCore.savePreference(preferenceName, value, userId, profileId);
        
        if (success) {
            // Clear cache for this preference
            const cacheKey = `preference_${preferenceName}_${userId || window.PreferencesCore.currentUserId}_${profileId || window.PreferencesCore.currentProfileId}`;
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.remove(cacheKey);
            }
            
            // Show success
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(`העדפה "${preferenceName}" נשמרה בהצלחה`);
            }
            
            console.log(`✅ Individual preference saved: ${preferenceName}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error saving individual preference ${preferenceName}:`, error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(`שגיאה בשמירת העדפה: ${error.message}`);
        }
        return false;
    }
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
window.updateCounters = async function(preferences) {
    return await window.PreferencesUI.updateCounters(preferences);
};

/**
 * Toggle section (backward compatibility)
 * @param {string} sectionName - Section name
 */
window.toggleSection = function(sectionName) {
    return window.PreferencesUI.toggleSection(sectionName);
};

/**
 * Load profiles to dropdown
 * @returns {Promise<boolean>} Success status
 */
window.loadProfilesToDropdown = async function() {
    try {
        console.log('📂 Loading profiles to dropdown...');
        
        // Get profiles from API
        const response = await fetch('/api/preferences/profiles');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to load profiles');
        }
        
        const profiles = result.data.profiles;
        const profileSelect = document.getElementById('profileSelect');
        
        if (!profileSelect) {
            console.warn('⚠️ Profile select element not found');
            return false;
        }
        
        // Clear existing options
        profileSelect.innerHTML = '';
        
        // Add default option first
        const defaultOption = document.createElement('option');
        defaultOption.value = 'ברירת מחדל';
        defaultOption.textContent = 'ברירת מחדל';
        profileSelect.appendChild(defaultOption);
        
        if (profiles && profiles.length > 0) {
            profiles.forEach(profile => {
                // Skip if this is already the default profile
                if (profile.name === 'ברירת מחדל') {
                    return;
                }
                
                const option = document.createElement('option');
                option.value = profile.name;
                option.textContent = profile.name;
                if (profile.active) {
                    option.selected = true;
                }
                profileSelect.appendChild(option);
            });
            
            // Find and select the active profile
            const activeProfile = profiles.find(p => p.active);
            console.log(`🔍 PROFILE DEBUG: Found active profile:`, activeProfile);
            
            if (activeProfile) {
                // Update PreferencesUI currentProfileId
                if (window.PreferencesUI) {
                    window.PreferencesUI.currentProfileId = activeProfile.id;
                    console.log(`✅ PreferencesUI currentProfileId updated to: ${activeProfile.id}`);
                }
                
                // Select the active profile in dropdown
                const activeOption = profileSelect.querySelector(`option[value="${activeProfile.name}"]`);
                if (activeOption) {
                    activeOption.selected = true;
                    console.log(`🔍 UI DEBUG: Selected active profile in dropdown: ${activeProfile.name}`);
                } else {
                    console.warn(`⚠️ Active profile option not found in dropdown: ${activeProfile.name}`);
                }
            } else {
                // No active profile found, select default
                const defaultOption = profileSelect.querySelector('option[value="ברירת מחדל"]');
                if (defaultOption) {
                    defaultOption.selected = true;
                    console.log(`🔍 UI DEBUG: No active profile found, selected default`);
                }
            }
            
            console.log(`✅ Loaded ${profiles.length} profiles to dropdown`);
            
            // Update active profile info in the new card format
            const activeProfileName = document.getElementById('activeProfileName');
            const activeProfileDescription = document.getElementById('activeProfileDescription');
            
            if (activeProfile) {
                if (activeProfileName) {
                    activeProfileName.textContent = activeProfile.name;
                }
                if (activeProfileDescription) {
                    activeProfileDescription.textContent = activeProfile.description || 'פרופיל משתמש';
                }
                console.log(`🔍 UI DEBUG: Updated active profile card to: ${activeProfile.name}`);
                
                // Check if this is the default profile and disable all preferences
                const isDefaultProfile = activeProfile.is_default || activeProfile.default || activeProfile.name === 'ברירת מחדל';
                if (isDefaultProfile) {
                    console.log('🔒 Default profile active - disabling all preferences interface');
                    window.disableAllPreferencesInterface();
                } else {
                    console.log('✅ User profile active - enabling all preferences interface');
                    window.enableAllPreferencesInterface();
                }
            } else {
                if (activeProfileName) {
                    activeProfileName.textContent = 'ברירת מחדל';
                }
                if (activeProfileDescription) {
                    activeProfileDescription.textContent = 'פרופיל ברירת מחדל של המערכת';
                }
                console.log(`🔍 UI DEBUG: Updated active profile card to: ברירת מחדל (no active profile)`);
                
                // Default profile is active - disable all preferences
                console.log('🔒 Default profile active - disabling all preferences interface');
                window.disableAllPreferencesInterface();
            }
            
            return true;
        } else {
            console.log('⚠️ No profiles found, using default');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading profiles to dropdown:', error);
        return false;
    }
};

/**
 * Get user profiles
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Profiles array
 */
window.getUserProfiles = async function(userId = 1) {
    try {
        const response = await fetch(`/api/preferences/profiles?user_id=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to load profiles');
        }
        
        return result.data.profiles;
    } catch (error) {
        console.error('❌ Error loading profiles:', error);
        return [];
    }
};

/**
 * Switch profile
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.switchProfile = async function(profileId) {
    try {
        console.log(`🔄 Switching to profile ID: ${profileId}`);
        
        const response = await fetch('/api/preferences/profiles/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 1,
                profile_id: profileId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to switch profile');
        }
        
        console.log('✅ Profile switched successfully');
        return true;
    } catch (error) {
        console.error('❌ Error switching profile:', error);
        return false;
    }
};

/**
 * Load preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.loadPreferences = async function(userId = 1, profileId = 3) {
    try {
        console.log(`🔄 Loading preferences for user ${userId}, profile ${profileId}`);
        
        if (window.PreferencesUI) {
            await window.PreferencesUI.loadAllPreferences(userId, profileId);
            return true;
        } else {
            console.warn('⚠️ PreferencesUI not available');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading preferences:', error);
        return false;
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// ============================================================================
// DEFAULT PROFILE PROTECTION
// ============================================================================

/**
 * Disable all preferences interface when default profile is active
 */
window.disableAllPreferencesInterface = function() {
    console.log('🔒 Disabling all preferences interface...');
    
    // Disable all form inputs except profile management
    const allInputs = document.querySelectorAll('#preferencesForm input, #preferencesForm select, #preferencesForm textarea');
    allInputs.forEach(input => {
        // Keep profile select and new profile name input enabled
        if (input.id === 'profileSelect' || input.id === 'newProfileName') {
            input.disabled = false;
            input.classList.remove('disabled');
        } else {
            input.disabled = true;
            input.classList.add('disabled');
        }
    });
    
    // Disable all buttons except profile management (keep profile switching and creation enabled)
    const allButtons = document.querySelectorAll('#preferencesForm button:not([onclick*="switchActiveProfile"]):not([onclick*="createNewProfile"]):not([id*="switchProfileBtn"]):not([id*="createProfileBtn"])');
    allButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('disabled');
    });
    
    // Keep profile management buttons enabled
    const profileButtons = document.querySelectorAll('button[onclick*="switchActiveProfile"], button[onclick*="createNewProfile"], #switchProfileBtn, #createProfileBtn');
    profileButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
        console.log(`✅ Kept profile management button enabled: ${button.id || button.onclick}`);
    });
    
    // Keep profile select and new profile name input enabled
    const profileSelect = document.getElementById('profileSelect');
    const newProfileName = document.getElementById('newProfileName');
    if (profileSelect) {
        profileSelect.disabled = false;
        profileSelect.classList.remove('disabled');
        console.log('✅ Kept profile select enabled');
    }
    if (newProfileName) {
        newProfileName.disabled = false;
        newProfileName.classList.remove('disabled');
        console.log('✅ Kept new profile name input enabled');
    }
    
    // Add visual indicator to all save buttons
    const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
    saveButtons.forEach(saveButton => {
        saveButton.innerHTML = '<i class="bi bi-lock"></i> פרופיל ברירת מחדל - לא ניתן לערוך';
        saveButton.classList.add('btn-secondary', 'disabled');
        saveButton.classList.remove('btn-success');
        console.log(`🔒 Disabled save button: ${saveButton.id || 'unnamed'}`);
    });
    
    // Show warning message (only if not already shown)
    if (!document.getElementById('defaultProfileWarning')) {
        showDefaultProfileWarning();
    }
    
    console.log('✅ All preferences interface disabled');
};

/**
 * Enable all preferences interface when user profile is active
 */
window.enableAllPreferencesInterface = function() {
    console.log('✅ Enabling all preferences interface...');
    
    // Enable all form inputs
    const allInputs = document.querySelectorAll('#preferencesForm input, #preferencesForm select, #preferencesForm textarea');
    allInputs.forEach(input => {
        input.disabled = false;
        input.classList.remove('disabled');
    });
    
    // Enable all buttons
    const allButtons = document.querySelectorAll('#preferencesForm button');
    allButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
    
    // Restore all save buttons
    const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
    saveButtons.forEach(saveButton => {
        saveButton.innerHTML = '<i class="bi bi-save me-2"></i>שמור העדפות';
        saveButton.classList.add('btn-success');
        saveButton.classList.remove('btn-secondary', 'disabled');
        console.log(`✅ Enabled save button: ${saveButton.id || 'unnamed'}`);
    });
    
    // Hide warning message
    hideDefaultProfileWarning();
    
    console.log('✅ All preferences interface enabled');
};

/**
 * Show warning message for default profile
 */
function showDefaultProfileWarning() {
    // Remove existing warning if any
    hideDefaultProfileWarning();
    
    // Create warning message
    const warningDiv = document.createElement('div');
    warningDiv.id = 'defaultProfileWarning';
    warningDiv.className = 'alert alert-warning alert-dismissible fade show';
    warningDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>פרופיל ברירת מחדל פעיל!</strong>
        לא ניתן לערוך הגדרות בפרופיל ברירת מחדל. 
        החלף לפרופיל משתמש כדי לערוך הגדרות.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert after the profile management section
    const profileSection = document.getElementById('section1');
    if (profileSection) {
        profileSection.insertAdjacentElement('afterend', warningDiv);
    }
}

/**
 * Hide warning message for default profile
 */
function hideDefaultProfileWarning() {
    const warningDiv = document.getElementById('defaultProfileWarning');
    if (warningDiv) {
        warningDiv.remove();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 Preferences UI system initialized');
    });
} else {
    console.log('📄 Preferences UI system initialized');
}

console.log('✅ preferences-ui.js loaded successfully');
