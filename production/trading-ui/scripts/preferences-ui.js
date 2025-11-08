/**
 * Preferences UI System - TikTrack
 * ================================
 * 
 * UI helpers and form management for preferences
 * Handles all user interface interactions
 * 
 * @version 1.3.0
 * @date January 23, 2025
 * @updated January 30, 2025 - Fixed saveAllPreferences to clear cache before reload
 * @updated January 30, 2025 - Fixed cache clearing to work directly with localStorage keys
 * @updated January 30, 2025 - Replaced page reload with refreshUserPreferences + loadAllPreferences
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

if (window.Logger && window.Logger.info) {
    window.Logger.info('📄 Loading preferences-ui.js v1.0.0...', { page: "preferences-ui" });
}

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
            window.Logger.warn('⚠️ No form found', { page: "preferences-ui" });
            return {};
        }
        
        // Reverse field name mapping for UI elements to preferences
        const fieldMapping = {};
        
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.name || input.id;
            if (!name) return;
            
            // Apply reverse field mapping if exists
            const mappedName = fieldMapping[name] || name;
            
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
            
            formData[mappedName] = value;
        });
        
        window.Logger.info('📋 Collected form data:', formData, { page: "preferences-ui" });
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
            window.Logger.warn('⚠️ No form found', { page: "preferences-ui" });
            return;
        }
        
        // Field name mapping for preferences to UI elements
        const fieldMapping = {};
        
        Object.entries(data).forEach(([name, value]) => {
            // Apply field mapping if exists
            const mappedName = fieldMapping[name] || name;
            const input = form.querySelector(`[name="${mappedName}"], #${mappedName}`);
            if (!input) return;
            
            // Handle different input types
            if (input.type === 'checkbox') {
                input.checked = Boolean(value);
            } else if (input.type === 'radio') {
                const radioInput = form.querySelector(`[name="${mappedName}"][value="${value}"]`);
                if (radioInput) {
                    radioInput.checked = true;
                }
            } else if (input.type === 'color') {
                // Convert color values with alpha channel to RGB hex format (#rrggbb)
                // Color inputs only accept #rrggbb format, not #rrggbbaa
                if (value && typeof value === 'string') {
                    // Check if it's an 8-digit hex with alpha
                    if (/^#[0-9A-Fa-f]{8}$/i.test(value)) {
                        // Strip the alpha channel (last 2 characters)
                        input.value = value.substring(0, 7);
                    } else if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
                        // Already valid 6-digit hex
                        input.value = value;
                    } else {
                        // Try to use ColorPickerManager converter if available
                        if (window.ColorPickerManager && typeof window.ColorPickerManager.getInstance === 'function') {
                            const colorManager = window.ColorPickerManager.getInstance();
                            if (colorManager && typeof colorManager.convertToColorInputFormat === 'function') {
                                input.value = colorManager.convertToColorInputFormat(value);
                            } else {
                                input.value = '#000000';
                            }
                        } else {
                            input.value = '#000000';
                        }
                    }
                } else {
                    input.value = '#000000';
                }
            } else {
                input.value = value;
            }
        });
        
        window.Logger.info('📋 Populated form with data', { page: "preferences-ui" });
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
        
        window.Logger.info('✅ Form validation result:', result, { page: "preferences-ui" });
        return result;
    }
    
    /**
     * Reset form to defaults
     * @param {string} formId - Form ID (optional)
     */
    resetForm(formId = null) {
        const form = formId ? document.getElementById(formId) : document.querySelector('form');
        if (!form) {
            window.Logger.warn('⚠️ No form found', { page: "preferences-ui" });
            return;
        }
        
        form.reset();
        window.Logger.info('🔄 Form reset to defaults', { page: "preferences-ui" });
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
        
        window.Logger.info(`⏳ Loading state: ${elementId}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`✅ Loading complete: ${elementId}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`📊 Updated counter ${counterId}: ${value}`, { page: "preferences-ui" });
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
            window.Logger.info(`✅ ${message}`, { page: "preferences-ui" });
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
            window.Logger.error(`❌ ${message}`, { page: "preferences-ui" });
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
            window.Logger.info(`ℹ️ ${message}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`👁️ Section ${sectionId}: ${isVisible ? 'visible' : 'hidden'}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`📋 Form status: ${status} - ${message}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`⏳ Started loading: ${loaderId}`, { page: "preferences-ui" });
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
        
        window.Logger.info(`✅ Stopped loading: ${loaderId} (${success ? 'success' : 'error'}, { page: "preferences-ui" })`);
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
            window.Logger.info('🔍 Loading active profile from server...', { page: "preferences-ui" });
            const response = await fetch('/api/preferences/profiles?user_id=1');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to load profiles');
            }
            
            const profiles = result.data.profiles;
            window.Logger.info(`🔍 Loaded ${profiles.length} profiles from server`, { page: "preferences-ui" });
            
            // Find active profile
            const activeProfile = profiles.find(p => p.active === true);
            
            // If no active profile found, use default profile (ID: 0)
            if (!activeProfile) {
                window.Logger.info('✅ No active profile found - using default profile (ID: 0)', { page: "preferences-ui" });
                this.currentProfileId = 0;
                return 0;
            }
            
            // Check if active profile is default system profile (ID: 0)
            if (activeProfile.id === 0) {
                window.Logger.info('✅ Active profile is system default profile (ID: 0)', { page: "preferences-ui" });
                this.currentProfileId = 0;
                return 0;
            }
            
            // Check if active profile has is_default flag
            if (activeProfile.is_default || activeProfile.default) {
                // If it's a user profile marked as default, still check if ID is 0
                if (activeProfile.id === 0 || activeProfile.user_id === 0) {
                    window.Logger.info('✅ Active profile is default system profile (ID: 0, user_id: 0)', { page: "preferences-ui" });
                    this.currentProfileId = 0;
                    return 0;
                } else {
                    // User profile marked as default - use it as-is
                    this.currentProfileId = activeProfile.id;
                    window.Logger.info(`✅ Active profile loaded: ${activeProfile.name} (ID: ${activeProfile.id})`, { page: "preferences-ui" });
                    return activeProfile.id;
                }
            }
            
            // Regular user profile
            this.currentProfileId = activeProfile.id;
            window.Logger.info(`✅ Active profile loaded: ${activeProfile.name} (ID: ${activeProfile.id})`, { page: "preferences-ui" });
            return activeProfile.id;
            
        } catch (error) {
            window.Logger.error('❌ Error loading active profile:', error, { page: "preferences-ui" });
            // Fallback to default profile (ID: 0)
            this.currentProfileId = 0;
            window.Logger.info('✅ Falling back to default profile (ID: 0)', { page: "preferences-ui" });
            return 0;
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
            
            // Initialize color pickers first if available
            if (window.ColorPickerManager) {
                window.ColorPickerManager.initializePickers();
            }
            
            // Load active profile if not provided
            if (profileId === null || profileId === undefined) {
                profileId = await this.loadActiveProfile();
            }
            
            // For default profile, ensure we use 0 explicitly
            const finalUserId = userId || this.currentUserId;
            const finalProfileId = (profileId !== null && profileId !== undefined) ? profileId : (this.currentProfileId !== null ? this.currentProfileId : 0);
            
            // Update currentProfileId to match the loaded profile
            this.currentProfileId = finalProfileId;
            window.Logger.info(`✅ PreferencesUI currentProfileId updated to: ${finalProfileId}`, { page: "preferences-ui" });
            
            // 🔍 Cache & Profile Debug Logging
            window.Logger.info(`🔍 CACHE DEBUG: Loading preferences for user ${finalUserId}, profile ${finalProfileId}`, { page: "preferences-ui" });
            
            // Initialize lazy loading if available
            if (window.LazyLoader) {
                window.Logger.info(`🔍 PREFERENCES UI DEBUG: Calling LazyLoader.initialize(userId=${finalUserId}, profileId=${finalProfileId})`, { page: "preferences-ui" });
                
                await window.LazyLoader.initialize(
                    finalUserId, 
                    finalProfileId
                );
                
                // Get loading stats
                const stats = window.LazyLoader.getLoadingStats();
                window.Logger.info(`🔍 CACHE DEBUG: Lazy loading stats: ${stats.loaded}/${stats.total} (${stats.percentage}%, { page: "preferences-ui" })`);
                
                // Load ALL preferences at once from API
                window.Logger.info(`🔍 PREFERENCES UI DEBUG: Calling PreferencesCore.getAllPreferences(userId=${finalUserId}, profileId=${finalProfileId})`, { page: "preferences-ui" });
                
                const allPreferences = await window.PreferencesCore.getAllPreferences(finalUserId, finalProfileId);
                window.Logger.info(`✅ Loaded ${Object.keys(allPreferences, { page: "preferences-ui" }).length} preferences from API`);
                
                // Load colors separately for color pickers
                if (window.ColorManager && window.ColorPickerManager) {
                    const colors = await window.ColorManager.loadAllColors(finalUserId, finalProfileId);
                    window.ColorPickerManager.loadColors(colors);
                    // Merge colors into allPreferences for populateForm
                    Object.assign(allPreferences, colors);
                }
                
                // Populate form with ALL preferences
                this.formManager.populateForm(allPreferences);
                
                // Update counters
                await this.updateCounters(allPreferences);
                
                // Load profiles to dropdown
                await window.loadProfilesToDropdown();
                
                this.loadingManager.stopLoading(loaderId, true, `נטענו ${Object.keys(allPreferences).length} העדפות`);
                
            } else {
                window.Logger.info('⚠️ LazyLoader not available, using standard loading', { page: "preferences-ui" });
                
                // Load non-color preferences
                const preferences = await window.PreferencesCore.getAllPreferences(
                    finalUserId, 
                    finalProfileId
                );
                
                // Load color preferences
                if (window.ColorManager) {
                    const colors = await window.ColorManager.loadAllColors(
                        finalUserId, 
                        finalProfileId
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
                window.Logger.info('🔄 Calling loadProfilesToDropdown...', { page: "preferences-ui" });
                await window.loadProfilesToDropdown();
                
                this.loadingManager.stopLoading(loaderId, true, 'העדפות נטענו בהצלחה');
            }
            
        } catch (error) {
            window.Logger.error('❌ Error loading preferences:', error, { page: "preferences-ui" });
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
            window.Logger.info('💾 Starting save all preferences process...', { page: "preferences-ui" });
            
            // Get form element
            const form = document.getElementById('preferencesForm');
            if (!form) {
                throw new Error('Preferences form not found');
            }
            
            // Collect form data using FormManager (handles both name and id)
            const formData = this.formManager.collectFormData('preferencesForm');
            const changedPreferences = {};
            
            // Check for changes and collect only changed preferences
            // Filter out non-preference fields (profile management, etc.)
            const excludedFields = ['profileSelect', 'newProfileName', 'switchProfileBtn', 'createProfileBtn'];
            
            for (let [key, value] of Object.entries(formData)) {
                // Skip excluded fields
                if (excludedFields.includes(key)) {
                    continue;
                }
                
                if (this.hasChanged(key, value)) {
                    // Convert values to strings for database storage
                    if (typeof value === 'boolean') {
                        changedPreferences[key] = value.toString();
                    } else if (typeof value === 'number') {
                        changedPreferences[key] = value.toString();
                    } else {
                        changedPreferences[key] = value;
                    }
                }
            }
            
            // Check if there are any changes
            if (Object.keys(changedPreferences).length === 0) {
                window.Logger.info('ℹ️ No changes to save', { page: "preferences-ui" });
                if (typeof window.showInfoNotification === 'function') {
                    window.showInfoNotification('אין שינויים לשמירה');
                }
                return true;
            }
            
            window.Logger.info(`📊 Found ${Object.keys(changedPreferences).length} changed preferences`);
            console.log('🔍 DEBUG: Changed preferences:', changedPreferences);
            
            // Validate all changed preferences
            for (let [name, value] of Object.entries(changedPreferences)) {
                window.Logger.info(`🔍 Validating ${name} = ${value} (type: ${typeof value})...`, { page: "preferences-ui" });
                
                if (window.PreferenceValidator) {
                    const validation = await window.PreferenceValidator.validatePreference(name, value);
                    if (!validation.valid) {
                        window.Logger.error(`❌ Validation failed for ${name}:`, {
                            value: value,
                            valueType: typeof value,
                            errors: validation.errors,
                            page: "preferences-ui"
                        });
                        const errorMessages = validation.errors.map(e => e.message).join(', ');
                        throw new Error(`Validation failed for ${name}: ${errorMessages}`);
                    }
                }
            }
            
            window.Logger.info('✅ All preferences validated successfully', { page: "preferences-ui" });
            
            // Get current profile IDs for debugging
            const finalUserId = userId || window.PreferencesCore?.currentUserId || 1;
            const finalProfileId = profileId || window.PreferencesCore?.currentProfileId || null;
            
            console.log('🔍 DEBUG: Profile IDs before save:', {
                userId_param: userId,
                profileId_param: profileId,
                PreferencesCore_currentUserId: window.PreferencesCore?.currentUserId,
                PreferencesCore_currentProfileId: window.PreferencesCore?.currentProfileId,
                PreferencesUI_currentProfileId: this.currentProfileId,
                finalUserId: finalUserId,
                finalProfileId: finalProfileId
            });
            
            // Save to backend
            const requestData = {
                user_id: finalUserId,
                profile_id: finalProfileId,
                preferences: changedPreferences
            };
            
            console.log('🔍 DEBUG: Sending to server:', requestData);
            
            const response = await fetch('/api/preferences/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            console.log('🔍 DEBUG: Server response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ DEBUG: Server error response:', errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('🔍 DEBUG: Server response:', result);
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                const savedCount = Object.keys(changedPreferences).length;
                window.showSuccessNotification(
                    `העדפות נשמרו בהצלחה! (${savedCount} העדפות)`,
                    3000
                );
            }
            
            // Clear preferences cache and reload using UnifiedCacheManager.refreshUserPreferences
            // This is the CORRECT way according to the architecture
            console.log('🧹 ===== CACHE CLEARING DEBUG START =====');
            window.Logger.info('🧹 Clearing preferences cache and reloading from backend...', { page: "preferences-ui" });
            
            // DEBUG: Check localStorage before clearing
            const allKeysBefore = Object.keys(localStorage);
            const prefKeysBefore = allKeysBefore.filter(k => 
                k.includes('preference') || k.includes('all_preferences')
            );
            console.log('🔍 DEBUG: localStorage keys BEFORE clearing:', prefKeysBefore);
            console.log('🔍 DEBUG: Total localStorage keys before:', allKeysBefore.length);
            
            try {
                // Use the official refreshUserPreferences method which:
                // 1. Clears all preference cache keys
                // 2. Reloads preferences from backend via PreferencesCore
                // 3. Updates the UI automatically via LazyLoader
                console.log('🔍 DEBUG: Checking UnifiedCacheManager:', {
                    exists: !!window.UnifiedCacheManager,
                    hasRefreshMethod: !!window.UnifiedCacheManager?.refreshUserPreferences
                });
                
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.refreshUserPreferences) {
                    console.log('✅ DEBUG: Calling UnifiedCacheManager.refreshUserPreferences()...');
                    
                    // CRITICAL: Use the same profileId that was used for saving
                    // Otherwise we'll reload the wrong profile's preferences
                    const saveProfileId = finalProfileId;
                    console.log('🔍 DEBUG: Will reload preferences for profileId:', saveProfileId);
                    
                    await window.UnifiedCacheManager.refreshUserPreferences(saveProfileId);
                    console.log('✅ DEBUG: refreshUserPreferences completed');
                    window.Logger.info('✅ Preferences cache cleared and reloaded from backend', { page: "preferences-ui" });
                    
                    // DEBUG: Check localStorage after clearing
                    const allKeysAfter = Object.keys(localStorage);
                    const prefKeysAfter = allKeysAfter.filter(k => 
                        k.includes('preference') || k.includes('all_preferences')
                    );
                    console.log('🔍 DEBUG: localStorage keys AFTER clearing:', prefKeysAfter);
                    console.log('🔍 DEBUG: Keys removed:', prefKeysBefore.length - prefKeysAfter.length);
                    
                    // NOTE: refreshUserPreferences already calls initializeWithLazyLoading which loads preferences
                    // We just need to reload the form with the already-loaded preferences
                    window.Logger.info('🔄 Reloading preferences into form...', { page: "preferences-ui" });
                    await this.loadAllPreferences();
                    window.Logger.info('✅ Preferences form updated with new values', { page: "preferences-ui" });
                    
                    console.log('🧹 ===== CACHE CLEARING DEBUG END =====');
                } else {
                    // Fallback to manual clearing if refreshUserPreferences not available
                    window.Logger.warn('⚠️ refreshUserPreferences not available, using manual clearing', { page: "preferences-ui" });
                    
                    const finalUserId = userId || window.PreferencesCore.currentUserId;
                    const finalProfileId = profileId || window.PreferencesCore.currentProfileId;
                    
                    const allKeys = Object.keys(localStorage);
                    const prefKeys = allKeys.filter(key => 
                        (key.startsWith(`preference_`) && key.includes(`_${finalUserId}_${finalProfileId}`)) ||
                        (key.startsWith(`tiktrack_preference_`) && key.includes(`_${finalUserId}_${finalProfileId}`)) ||
                        key === `all_preferences_${finalUserId}_${finalProfileId}` ||
                        key === `tiktrack_all_preferences_${finalUserId}_${finalProfileId}` ||
                        key === 'user-preferences' ||
                        key === 'tiktrack_user-preferences'
                    );
                    
                    for (const key of prefKeys) {
                        localStorage.removeItem(key);
                        if (window.UnifiedCacheManager && window.UnifiedCacheManager.remove) {
                            await window.UnifiedCacheManager.remove(key);
                        }
                    }
                    
                    // Reload preferences
                    await this.loadAllPreferences();
                }
            } catch (cacheError) {
                window.Logger.warn('⚠️ Error refreshing preferences cache:', cacheError, { page: "preferences-ui" });
                // Continue even if cache clearing fails
            }
            
            return true;
            
        } catch (error) {
            window.Logger.error('❌ Error saving preferences:', error, { page: "preferences-ui" });
            
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
            window.Logger.error('❌ Error resetting preferences:', error, { page: "preferences-ui" });
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
            window.Logger.info('📊 Updating statistics...', { page: "preferences-ui" });
            
            // Update preferences count
            const preferencesCount = Object.keys(preferences).length;
            const preferencesCountElement = document.getElementById('preferencesCount');
            if (preferencesCountElement) {
                preferencesCountElement.textContent = preferencesCount;
                window.Logger.info(`📊 Updated preferences count: ${preferencesCount}`, { page: "preferences-ui" });
            }
            
            // Update profiles count
            try {
                const profiles = await window.getUserProfiles();
                const profilesCount = profiles.length;
                const profilesCountElement = document.getElementById('profilesCount');
                if (profilesCountElement) {
                    profilesCountElement.textContent = profilesCount;
                    window.Logger.info(`📊 Updated profiles count: ${profilesCount}`, { page: "preferences-ui" });
                }
            } catch (error) {
                window.Logger.error('❌ Error loading profiles count:', error, { page: "preferences-ui" });
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
                        window.Logger.info(`📊 Updated groups count: ${groupsCount}`, { page: "preferences-ui" });
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                window.Logger.error('❌ Error loading groups count:', error, { page: "preferences-ui" });
                const groupsCountElement = document.getElementById('groupsCount');
                if (groupsCountElement) {
                    groupsCountElement.textContent = 'שגיאה';
                }
            }
            
            window.Logger.info('✅ Statistics updated successfully', { page: "preferences-ui" });
        } catch (error) {
            window.Logger.error('❌ Error updating statistics:', error, { page: "preferences-ui" });
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

/**
 * Debug function to monitor preferences cache and reload system
 * @function debugPreferencesCacheSystem
 */
window.debugPreferencesCacheSystem = function() {
    console.log('🔍 === PREFERENCES CACHE SYSTEM DEBUG ===');
    
    // Check if required functions exist
    console.log('📋 Function availability:');
    console.log('  - window.clearCacheQuick:', typeof window.clearCacheQuick);
    console.log('  - window.UnifiedCacheManager:', typeof window.UnifiedCacheManager);
    console.log('  - window.CRUDResponseHandler:', typeof window.CRUDResponseHandler);
    console.log('  - window.PreferencesCore:', typeof window.PreferencesCore);
    console.log('  - window.PreferencesUI:', typeof window.PreferencesUI);
    
    // Check current profile
    console.log('👤 Current profile:');
    console.log('  - User ID:', window.PreferencesCore?.currentUserId || 'undefined');
    console.log('  - Profile ID:', window.PreferencesCore?.currentProfileId || 'undefined');
    
    // Check cache state
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        console.log('💾 Cache state:');
        console.log('  - Initialized:', window.UnifiedCacheManager.initialized);
        console.log('  - Cache keys count:', window.UnifiedCacheManager.getAllKeys ? 'Available' : 'Not available');
    } else {
        console.log('❌ UnifiedCacheManager not available or not initialized');
    }
    
    // Test clearCacheQuick function
    console.log('🧪 Testing clearCacheQuick function:');
    if (typeof window.clearCacheQuick === 'function') {
        console.log('  - Function exists: ✅');
        console.log('  - Function type:', typeof window.clearCacheQuick);
    } else {
        console.log('  - Function exists: ❌');
    }
    
    console.log('🔍 === END DEBUG ===');
};

/**
 * Test preferences save with monitoring (no auto-reload)
 * @function testPreferencesSaveWithMonitoring
 */
window.testPreferencesSaveWithMonitoring = async function() {
    console.log('🧪 === TESTING PREFERENCES SAVE WITH MONITORING ===');
    
    try {
        // Test cache clearing with auto-reload disabled
        console.log('🔄 Testing cache clearing with auto-reload disabled...');
        
        if (typeof window.clearCacheQuick === 'function') {
            // Call clearCacheQuick with autoRefresh disabled
            await window.clearCacheQuick(null, { autoRefresh: false });
            console.log('✅ Cache cleared successfully (no auto-reload)');
        } else if (window.UnifiedCacheManager && window.UnifiedCacheManager.clearAllCacheQuick) {
            // Fallback to direct call
            const result = await window.UnifiedCacheManager.clearAllCacheQuick({ autoRefresh: false });
            console.log('✅ Cache cleared successfully (no auto-reload):', result);
        } else {
            console.log('❌ No cache clearing function available');
        }
        
        // Test preferences reload
        console.log('🔄 Testing preferences reload...');
        if (window.PreferencesUI && window.PreferencesUI.loadAllPreferences) {
            await window.PreferencesUI.loadAllPreferences();
            console.log('✅ Preferences reloaded successfully');
        }
        
        console.log('🧪 === TEST COMPLETED ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

/**
 * Force refresh preferences data (for debug mode)
 * @function forceRefreshPreferences
 */
window.forceRefreshPreferences = async function() {
    console.log('🔄 === FORCE REFRESHING PREFERENCES ===');
    
    try {
        // Clear cache first
        if (typeof window.clearCacheQuick === 'function') {
            console.log('🧹 Clearing cache...');
            await window.clearCacheQuick(null, { autoRefresh: false });
        } else if (window.UnifiedCacheManager && window.UnifiedCacheManager.clearAllCacheQuick) {
            console.log('🧹 Clearing cache (fallback)...');
            await window.UnifiedCacheManager.clearAllCacheQuick({ autoRefresh: false });
        }
        
        // Reload preferences and UI
        if (window.PreferencesUI && window.PreferencesUI.loadAllPreferences) {
            console.log('🔄 Reloading preferences and UI...');
            await window.PreferencesUI.loadAllPreferences();
        }
        
        console.log('✅ Force refresh completed');
        
    } catch (error) {
        console.error('❌ Force refresh failed:', error);
    }
};

/**
 * Check cache state and preferences data
 * @function checkCacheAndPreferencesState
 */
window.checkCacheAndPreferencesState = async function() {
    console.log('🔍 === CHECKING CACHE AND PREFERENCES STATE ===');
    
    try {
        // Check cache state
        if (window.UnifiedCacheManager && window.UnifiedCacheManager.getAllKeys) {
            const keys = await window.UnifiedCacheManager.getAllKeys();
            const prefKeys = keys.filter(k => k.includes('preference'));
            console.log('💾 Cache state:');
            console.log('  - Total cache keys:', keys.length);
            console.log('  - Preference keys:', prefKeys.length);
            console.log('  - Preference keys:', prefKeys);
        }
        
        // Check current preferences
        if (window.PreferencesCore && window.PreferencesCore.getAllPreferences) {
            const prefs = await window.PreferencesCore.getAllPreferences();
            console.log('⚙️ Current preferences:');
            console.log('  - Total preferences:', Object.keys(prefs).length);
            console.log('  - Sample preferences:', Object.keys(prefs).slice(0, 5));
        }
        
        // Check UI state
        const form = document.getElementById('preferencesForm');
        if (form) {
            const formData = new FormData(form);
            const formPrefs = {};
            for (let [key, value] of formData.entries()) {
                if (!['profileSelect', 'newProfileName', 'switchProfileBtn', 'createProfileBtn'].includes(key)) {
                    formPrefs[key] = value;
                }
            }
            console.log('🖥️ Form state:');
            console.log('  - Form preferences:', Object.keys(formPrefs).length);
            console.log('  - Sample form values:', Object.keys(formPrefs).slice(0, 5));
        }
        
        console.log('🔍 === STATE CHECK COMPLETED ===');
        
    } catch (error) {
        console.error('❌ State check failed:', error);
    }
};
window.saveIndividualPreference = async function(preferenceName, value, userId = null, profileId = null) {
    try {
        window.Logger.info(`💾 Saving individual preference: ${preferenceName} = ${value}`, { page: "preferences-ui" });
        
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
            
            window.Logger.info(`✅ Individual preference saved: ${preferenceName}`, { page: "preferences-ui" });
            return true;
        }
        
        return false;
    } catch (error) {
        window.Logger.error(`❌ Error saving individual preference ${preferenceName}:`, error, { page: "preferences-ui" });
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
// Define only if a global toggleSection is not already provided by the unified UI system
if (!window.toggleSection) {
    window.toggleSection = function(sectionName) {
        return window.PreferencesUI.toggleSection(sectionName);
    };
}

/**
 * Load profiles to dropdown
 * @param {number} userId - User ID (default: 1)
 * @returns {Promise<boolean>} Success status
 */
window.loadProfilesToDropdown = async function(userId = 1) {
    try {
        window.Logger.info('📂 Loading profiles to dropdown...', { page: "preferences-ui" });
        
        // Get profiles from API
        const response = await fetch(`/api/preferences/profiles?user_id=${userId}`);
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
            window.Logger.warn('⚠️ Profile select element not found', { page: "preferences-ui" });
            return false;
        }
        
        // Clear existing options
        profileSelect.innerHTML = '';
        
        if (profiles && profiles.length > 0) {
            // Add all profiles (including default profile if it exists)
            profiles.forEach(profile => {
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
            window.Logger.info(`🔍 PROFILE DEBUG: Found active profile:`, activeProfile, { page: "preferences-ui" });
            
            if (activeProfile) {
                // Update PreferencesUI currentProfileId
                if (window.PreferencesUI) {
                    window.PreferencesUI.currentProfileId = activeProfile.id;
                    window.Logger.info(`✅ PreferencesUI currentProfileId updated to: ${activeProfile.id}`, { page: "preferences-ui" });
                }
                
                // Select the active profile in dropdown
                const activeOption = profileSelect.querySelector(`option[value="${activeProfile.name}"]`);
                if (activeOption) {
                    activeOption.selected = true;
                    window.Logger.info(`🔍 UI DEBUG: Selected active profile in dropdown: ${activeProfile.name}`, { page: "preferences-ui" });
                } else {
                    window.Logger.warn(`⚠️ Active profile option not found in dropdown: ${activeProfile.name}`, { page: "preferences-ui" });
                }
            } else {
                // No active profile found, select default
                const defaultOption = profileSelect.querySelector('option[value="ברירת מחדל"]');
                if (defaultOption) {
                    defaultOption.selected = true;
                    window.Logger.info(`🔍 UI DEBUG: No active profile found, selected default`, { page: "preferences-ui" });
                }
            }
            
            window.Logger.info(`✅ Loaded ${profiles.length} profiles to dropdown`, { page: "preferences-ui" });
            
            // Update active profile info in the new card format
            const activeProfileName = document.getElementById('activeProfileName');
            const activeProfileDescription = document.getElementById('activeProfileDescription');
            const activeProfileInfo = document.getElementById('activeProfileInfo'); // Summary element
            
            if (activeProfile) {
                if (activeProfileName) {
                    activeProfileName.textContent = activeProfile.name;
                }
                if (activeProfileDescription) {
                    activeProfileDescription.textContent = activeProfile.description || 'פרופיל משתמש';
                }
                if (activeProfileInfo) {
                    activeProfileInfo.textContent = activeProfile.name;
                }
                window.Logger.info(`🔍 UI DEBUG: Updated active profile card to: ${activeProfile.name}`, { page: "preferences-ui" });
                
                // Check if this is the default profile and disable all preferences
                // Default profile is: ID = 0, or is_default = true, or name matches
                const isDefaultProfile = activeProfile.id === 0 || 
                                       activeProfile.is_default === true || 
                                       activeProfile.default === true ||
                                       activeProfile.name === 'ברירת מחדל' || 
                                       activeProfile.name === 'פרופיל ברירת מחדל';
                
                window.Logger.info(`🔍 Profile check: ID=${activeProfile.id}, is_default=${activeProfile.is_default}, name="${activeProfile.name}", isDefaultProfile=${isDefaultProfile}`, { page: "preferences-ui" });
                
                if (isDefaultProfile) {
                    window.Logger.info('🔒 Default profile active - disabling all preferences interface', { page: "preferences-ui" });
                    window.disableAllPreferencesInterface();
                } else {
                    window.Logger.info('✅ User profile active - enabling all preferences interface', { page: "preferences-ui" });
                    window.enableAllPreferencesInterface();
                }
            } else {
                if (activeProfileName) {
                    activeProfileName.textContent = 'ברירת מחדל';
                }
                if (activeProfileDescription) {
                    activeProfileDescription.textContent = 'פרופיל ברירת מחדל של המערכת';
                }
                if (activeProfileInfo) {
                    activeProfileInfo.textContent = 'ברירת מחדל';
                }
                window.Logger.info(`🔍 UI DEBUG: Updated active profile card to: ברירת מחדל (no active profile)`, { page: "preferences-ui" });
                
                // Default profile is active - disable all preferences
                window.Logger.info('🔒 Default profile active - disabling all preferences interface', { page: "preferences-ui" });
                window.disableAllPreferencesInterface();
            }
            
            return true;
        } else {
            window.Logger.info('⚠️ No profiles found, using default', { page: "preferences-ui" });
            return false;
        }
    } catch (error) {
        window.Logger.error('❌ Error loading profiles to dropdown:', error, { page: "preferences-ui" });
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
        window.Logger.error('❌ Error loading profiles:', error, { page: "preferences-ui" });
        return [];
    }
};

// Note: switchProfile is now in preferences-profiles.js - ProfileManager.switchProfile()

/**
 * Load preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.loadPreferences = async function(userId = 1, profileId = 3) {
    try {
        window.Logger.info(`🔄 Loading preferences for user ${userId}, profile ${profileId}`, { page: "preferences-ui" });
        
        if (window.PreferencesUI) {
            await window.PreferencesUI.loadAllPreferences(userId, profileId);
            return true;
        } else {
            window.Logger.warn('⚠️ PreferencesUI not available', { page: "preferences-ui" });
            return false;
        }
    } catch (error) {
        window.Logger.error('❌ Error loading preferences:', error, { page: "preferences-ui" });
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
    window.Logger.info('🔒 Disabling all preferences interface...', { page: "preferences-ui" });
    
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
        window.Logger.info(`✅ Kept profile management button enabled: ${button.id || button.onclick}`, { page: "preferences-ui" });
    });
    
    // Keep profile select and new profile name input enabled
    const profileSelect = document.getElementById('profileSelect');
    const newProfileName = document.getElementById('newProfileName');
    if (profileSelect) {
        profileSelect.disabled = false;
        profileSelect.classList.remove('disabled');
        window.Logger.info('✅ Kept profile select enabled', { page: "preferences-ui" });
    }
    if (newProfileName) {
        newProfileName.disabled = false;
        newProfileName.classList.remove('disabled');
        window.Logger.info('✅ Kept new profile name input enabled', { page: "preferences-ui" });
    }
    
    // Add visual indicator to all save buttons
    const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
    saveButtons.forEach(saveButton => {
        saveButton.innerHTML = '<i class="bi bi-lock"></i> פרופיל ברירת מחדל - לא ניתן לערוך';
        saveButton.classList.add('btn-secondary', 'disabled');
        saveButton.classList.remove('btn-success');
        window.Logger.info(`🔒 Disabled save button: ${saveButton.id || 'unnamed'}`, { page: "preferences-ui" });
    });
    
    // Show warning message (only if not already shown)
    if (!document.getElementById('defaultProfileWarning')) {
        showDefaultProfileWarning();
    }
    
    window.Logger.info('✅ All preferences interface disabled', { page: "preferences-ui" });
};

/**
 * Enable all preferences interface when user profile is active
 */
window.enableAllPreferencesInterface = function() {
    window.Logger.info('✅ Enabling all preferences interface...', { page: "preferences-ui" });
    
    // First, hide warning message (this should happen immediately)
    hideDefaultProfileWarning();
    window.Logger.info('✅ Hidden default profile warning message', { page: "preferences-ui" });
    
    // Enable all form inputs
    const allInputs = document.querySelectorAll('#preferencesForm input, #preferencesForm select, #preferencesForm textarea');
    allInputs.forEach(input => {
        input.disabled = false;
        input.classList.remove('disabled');
    });
    window.Logger.info(`✅ Enabled ${allInputs.length} form inputs`, { page: "preferences-ui" });
    
    // Enable all buttons
    const allButtons = document.querySelectorAll('#preferencesForm button');
    allButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('disabled');
    });
    window.Logger.info(`✅ Enabled ${allButtons.length} buttons`, { page: "preferences-ui" });
    
    // Restore all save buttons
    const saveButtons = document.querySelectorAll('button[onclick*="saveAllPreferences"], #savePreferencesBtn');
    saveButtons.forEach(saveButton => {
        saveButton.innerHTML = '<i class="bi bi-save me-2"></i>שמור העדפות';
        saveButton.classList.add('btn-success');
        saveButton.classList.remove('btn-secondary', 'disabled');
        window.Logger.info(`✅ Enabled save button: ${saveButton.id || 'unnamed'}`, { page: "preferences-ui" });
    });
    
    window.Logger.info('✅ All preferences interface enabled', { page: "preferences-ui" });
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
        window.Logger.info('📄 Preferences UI system initialized', { page: "preferences-ui" });
    });
} else {
    window.Logger.info('📄 Preferences UI system initialized', { page: "preferences-ui" });
}

if (window.Logger && window.Logger.info) {
    window.Logger.info('✅ preferences-ui.js loaded successfully', { page: "preferences-ui" });
}
