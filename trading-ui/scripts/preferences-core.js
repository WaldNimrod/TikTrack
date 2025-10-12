/**
 * Preferences Core System - TikTrack
 * ===================================
 * 
 * Unified preferences management with modern OOP architecture
 * 
 * @version 2.0.0
 * @date January 12, 2025
 * @author TikTrack Development Team
 * 
 * @description
 * Complete rewrite of preferences system with:
 * - 5 specialized classes (APIClient, PreferencesManager, ColorManager, ProfileManager, UIManager)
 * - UnifiedCacheManager integration
 * - ColorSchemeSystem integration
 * - Async/await consistency
 * - Loading states & error handling
 * - Future-proof for multi-user system
 * 
 * @architecture
 * - APIClient: All HTTP communication
 * - PreferencesManager: Load/save/validate preferences
 * - ColorManager: Color loading and sync
 * - ProfileManager: Profile operations
 * - UIManager: UI updates and feedback
 * - PreferencesSystem: Global coordinator
 * 
 * @compatibility
 * - Backward compatible with old API (window.getPreference, etc.)
 * - Works with UnifiedCacheManager (with localStorage fallback)
 * - Integrates with ColorSchemeSystem
 * - No HTML changes required!
 */

console.log('📄 Loading preferences-core.js v2.0.0...');

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * API Error
 * Custom error for API communication failures
 */
class APIError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'APIError';
        this.code = code;
    }
}

/**
 * Validation Error
 * Custom error for preference validation failures
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ============================================================================
// CLASS 1: API CLIENT
// ============================================================================

/**
 * Preferences API Client
 * Handles all HTTP communication with backend preferences API
 */
class PreferencesAPIClient {
    constructor(baseURL = '/api/preferences') {
        this.baseURL = baseURL;
        this.defaultUserId = 1;  // Nimrod - currently the only user
    }
    
    /**
     * Generic GET request
     * @param {string} endpoint - API endpoint (e.g., '/user', '/profiles')
     * @param {Object} params - Query parameters
     * @returns {Promise<any>} Response data
     */
    async get(endpoint, params = {}) {
        try {
            const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
            
            // Add query parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.append(key, value);
                }
            });
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new APIError(`HTTP ${response.status}`, errorText || response.statusText);
            }
            
            const result = await response.json();
            
            // Check for success in result
            if (!result.success && !result.data) {
                throw new APIError('API Error', result.message || 'Unknown error');
            }
            
            return result.data;
            
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            console.error('❌ API GET error:', endpoint, error);
            throw new APIError('Network Error', error.message);
        }
    }
    
    /**
     * Generic POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request body
     * @returns {Promise<any>} Response data
     */
    async post(endpoint, body = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new APIError(`HTTP ${response.status}`, errorText || response.statusText);
            }
            
            const result = await response.json();
            
            // Check for success in result
            if (!result.success && !result.data) {
                throw new APIError('API Error', result.message || 'Unknown error');
            }
            
            return result.data;
            
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            console.error('❌ API POST error:', endpoint, error);
            throw new APIError('Network Error', error.message);
        }
    }
    
    // ========================================================================
    // SPECIFIC API METHODS
    // ========================================================================
    
    /**
     * Get all user preferences
     */
    async getUserPreferences(userId, profileId = null) {
        return await this.get('/user', { 
            user_id: userId, 
            profile_id: profileId 
        });
    }
    
    /**
     * Get single preference
     */
    async getSinglePreference(preferenceName, userId, profileId = null) {
        return await this.get('/user/single', { 
            preference_name: preferenceName, 
            user_id: userId, 
            profile_id: profileId 
        });
    }
    
    /**
     * Save preferences
     */
    async savePreferences(preferences, userId, profileId = null) {
        return await this.post('/user', { 
            preferences, 
            user_id: userId, 
            profile_id: profileId 
        });
    }
    
    /**
     * Get user profiles
     */
    async getProfiles(userId) {
        return await this.get('/profiles', { user_id: userId });
    }
    
    /**
     * Activate profile
     */
    async activateProfile(userId, profileId) {
        return await this.post('/profiles/activate', { 
            user_id: userId, 
            profile_id: profileId 
        });
    }
    
    /**
     * Get preference groups
     */
    async getGroups() {
        return await this.get('/groups');
    }
    
    /**
     * Check service health
     */
    async checkHealth() {
        return await this.get('/health');
    }
}

// ============================================================================
// CLASS 2: PREFERENCES MANAGER
// ============================================================================

/**
 * Preferences Manager
 * Main manager for loading, saving, and validating preferences
 * Integrates with UnifiedCacheManager
 */
class PreferencesManager {
    constructor(userId = null) {
        this.api = new PreferencesAPIClient();
        
        // Multi-user ready: auto-detect or use default
        this.userId = userId || this._getActiveUser() || 1;
        
        this.currentProfile = null;
        this.currentPreferences = null;
        this.initialized = false;
    }
    
    /**
     * Initialize the manager
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            console.log('🚀 Initializing PreferencesManager...');
            
            // Check API health
            const health = await this.api.checkHealth();
            console.log('✅ API health check:', health);
            
            // Wait for UnifiedCacheManager if available
            await this._waitForCache();
            
            this.initialized = true;
            console.log('✅ PreferencesManager initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ PreferencesManager initialization failed:', error);
            // Continue without cache - will use API only
            this.initialized = true;
            return false;
        }
    }
    
    /**
     * Load preferences from cache or API
     * @param {number} userId - User ID (default: current user)
     * @param {number} profileId - Profile ID (default: active profile)
     * @returns {Promise<Object>} Preferences data
     */
    async load(userId = null, profileId = null, forceRefresh = false) {
        try {
            userId = userId || this.userId;
            
            console.log(`📥 Loading preferences for user ${userId}, profile ${profileId || 'active'}${forceRefresh ? ' (force refresh)' : ''}...`);
            
            // Try cache first (unless force refresh)
            if (!forceRefresh) {
                const cacheKey = `user-preferences-${userId}-${profileId || 'active'}`;
                const cached = await this._getFromCache(cacheKey);
                
                if (cached && Object.keys(cached).length > 0) {
                    console.log(`✅ Loaded ${Object.keys(cached).length} preferences from cache`);
                    this.currentPreferences = cached;
                    this.currentProfile = profileId;
                    return cached;
                }
            } else {
                console.log('🔄 Force refresh - skipping cache');
            }
            
            // Cache miss or force refresh - load from API
            console.log('🔄 Fetching from API...');
            const apiData = await this.api.getUserPreferences(userId, profileId);
            
            if (apiData && apiData.preferences) {
                this.currentPreferences = apiData.preferences;
                this.currentProfile = apiData.profile_id || profileId;
                
                // Save to cache for next time
                const cacheKey = `user-preferences-${userId}-${profileId || 'active'}`;
                await this._saveToCache(cacheKey, apiData.preferences);
                
                console.log(`✅ Loaded ${Object.keys(apiData.preferences).length} preferences from API`);
                return apiData.preferences;
            }
            
            console.warn('⚠️ No preferences data returned from API');
            return {};
            
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            throw error;
        }
    }
    
    /**
     * Save preferences to API
     * @param {Object} preferences - Preferences to save
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
    async save(preferences, userId = null, profileId = null) {
        try {
            userId = userId || this.userId;
            profileId = profileId || this.currentProfile;
            
            console.log(`💾 Saving preferences (userId: ${userId}, profileId: ${profileId})...`);
            
            // Validate first
            await this.validate(preferences);
            
            // Save to API
            await this.api.savePreferences(preferences, userId, profileId);
            
            // Clear ALL cache variants to avoid inconsistency
            await this._clearCache();
            
            // Update current preferences AND profile
            this.currentPreferences = preferences;
            this.currentProfile = profileId;
            
            console.log('✅ Preferences saved successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            throw error;
        }
    }
    
    /**
     * Get single preference
     * @param {string} preferenceName - Preference name
     * @returns {Promise<any>} Preference value
     */
    async getSingle(preferenceName) {
        try {
            // Try from current preferences first
            if (this.currentPreferences && this.currentPreferences[preferenceName] !== undefined) {
                return this.currentPreferences[preferenceName];
            }
            
            // Load from API
            const data = await this.api.getSinglePreference(preferenceName, this.userId);
            return data?.value;
            
        } catch (error) {
            console.error(`❌ Error getting preference ${preferenceName}:`, error);
            return null;
        }
    }
    
    /**
     * Get color preferences only
     * @returns {Object} Color preferences
     */
    getColorPreferences() {
        if (!this.currentPreferences) {
            return {};
        }
        
        return Object.entries(this.currentPreferences)
            .filter(([key]) => key.toLowerCase().includes('color'))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    }
    
    /**
     * Validate preferences before save
     * @param {Object} preferences - Preferences to validate
     * @returns {Promise<boolean>} Validation result
     */
    async validate(preferences) {
        try {
            // Validate color values
            for (const [key, value] of Object.entries(preferences)) {
                if (key.toLowerCase().includes('color')) {
                    if (!this._isValidColor(value)) {
                        throw new ValidationError(`ערך צבע לא תקין עבור ${key}: ${value}`);
                    }
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Validation error:', error);
            throw error;
        }
    }
    
    /**
     * Validate color format
     * @private
     */
    _isValidColor(value) {
        if (!value) return false;
        return /^#[0-9A-Fa-f]{6}$/.test(value);
    }
    
    /**
     * Get active user ID
     * @private
     * @future - Will integrate with TikTrackAuth when multi-user is implemented
     */
    _getActiveUser() {
        // Future: integrate with AuthSystem
        if (window.TikTrackAuth?.getCurrentUser) {
            const user = window.TikTrackAuth.getCurrentUser();
            return user?.id;
        }
        
        // Future: check session storage
        const sessionUser = sessionStorage.getItem('active_user_id');
        if (sessionUser) {
            return parseInt(sessionUser);
        }
        
        // Default: Nimrod (user_id = 1)
        return 1;
    }
    
    /**
     * Switch user context
     * @future - For when multi-user system is implemented
     */
    async switchUser(userId) {
        this.userId = userId;
        await this._clearCache();
        await this.load();
    }
    
    /**
     * Load preferences for specific user
     * @future - For admin functionality
     */
    async loadForUser(userId) {
        return await this.load(userId);
    }
    
    // ========================================================================
    // CACHE METHODS (UnifiedCacheManager Integration)
    // ========================================================================
    
    /**
     * Get data from cache
     * @private
     */
    async _getFromCache(key) {
        try {
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager?.initialized) {
                const cached = await window.UnifiedCacheManager.get(key);
                if (cached) {
                    console.log(`✅ Cache hit (UnifiedCacheManager): ${key}`);
                    return cached;
                }
            }
            
            // Fallback to localStorage
            const stored = localStorage.getItem(key);
            if (stored) {
                console.log(`✅ Cache hit (localStorage): ${key}`);
                return JSON.parse(stored);
            }
            
            console.log(`❌ Cache miss: ${key}`);
            return null;
            
        } catch (error) {
            console.warn('⚠️ Cache read error:', error);
            return null;
        }
    }
    
    /**
     * Save data to cache
     * @private
     */
    async _saveToCache(key, data) {
        try {
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager?.initialized) {
                await window.UnifiedCacheManager.save(key, data, {
                    ttl: 3600000,  // 1 hour
                    layer: 'localStorage'
                });
                console.log(`✅ Saved to cache (UnifiedCacheManager): ${key}`);
                return;
            }
            
            // Fallback to localStorage
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`✅ Saved to cache (localStorage): ${key}`);
            
        } catch (error) {
            console.warn('⚠️ Cache save error:', error);
            // Continue without cache
        }
    }
    
    /**
     * Clear cache
     * @private
     */
    async _clearCache() {
        try {
            console.log('🧹 Clearing ALL user-preferences cache variants...');
            
            // Clear both possible cache keys to avoid inconsistency
            const userId = this.userId;
            const profileId = this.currentProfile;
            
            const keysToRemove = [
                `user-preferences-${userId}-${profileId}`,  // Specific profile
                `user-preferences-${userId}-active`,         // Active variant
                `user-preferences-${userId}-null`,           // Null variant
                `user-preferences-${userId}-undefined`       // Undefined variant
            ];
            
            // Try UnifiedCacheManager first
            if (window.UnifiedCacheManager?.initialized) {
                for (const key of keysToRemove) {
                    try {
                        await window.UnifiedCacheManager.remove(key);
                        console.log(`🧹 Removed cache: ${key}`);
                    } catch (e) {
                        // Key might not exist, that's OK
                    }
                }
                console.log('✅ Cache cleared (UnifiedCacheManager)');
                return;
            }
            
            // Fallback to localStorage - remove ALL user-preferences-* keys
            const allKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('user-preferences-')) {
                    allKeys.push(key);
                }
            }
            allKeys.forEach(key => localStorage.removeItem(key));
            console.log(`✅ Cache cleared (localStorage): ${allKeys.length} items`);
            
        } catch (error) {
            console.warn('⚠️ Cache clear error:', error);
        }
    }
    
    /**
     * Wait for UnifiedCacheManager to initialize
     * @private
     */
    async _waitForCache(maxWait = 5000) {
        if (!window.UnifiedCacheManager) {
            console.log('ℹ️ UnifiedCacheManager not available, will use localStorage fallback');
            return;
        }
        
        const start = Date.now();
        while (!window.UnifiedCacheManager.initialized && Date.now() - start < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (window.UnifiedCacheManager.initialized) {
            console.log('✅ UnifiedCacheManager is ready');
        } else {
            console.log('⚠️ UnifiedCacheManager timeout, using localStorage fallback');
        }
    }
}

// ============================================================================
// CLASS 3: COLOR MANAGER
// ============================================================================

/**
 * Color Manager
 * Handles all color-related operations
 * Integrates with ColorSchemeSystem
 */
class ColorManager {
    constructor(preferencesManager) {
        this.preferencesManager = preferencesManager;
        this.defaultColors = this._getDefaultColors();
    }
    
    /**
     * Load and apply colors to UI
     * @returns {Promise<boolean>} Success status
     */
    async loadColors() {
        try {
            console.log('🎨 Loading colors...');
            
            // Get color preferences from PreferencesManager
            const colors = this.preferencesManager.getColorPreferences();
            
            if (Object.keys(colors).length > 0) {
                console.log(`✅ Found ${Object.keys(colors).length} colors in preferences`);
                this.applyToUI(colors);
            } else {
                console.log('⚠️ No colors in preferences, using defaults');
                this.applyToUI(this.defaultColors);
            }
            
            // Sync with ColorSchemeSystem
            await this.syncWithColorScheme();
            
            return true;
            
        } catch (error) {
            console.error('❌ Error loading colors:', error);
            // Fallback to defaults on error
            this.applyToUI(this.defaultColors);
            return false;
        }
    }
    
    /**
     * Apply colors to UI color pickers
     * @param {Object} colors - Color values
     */
    applyToUI(colors) {
        const colorPickers = document.querySelectorAll('input[type="color"]');
        let applied = 0;
        
        colorPickers.forEach(picker => {
            const colorKey = picker.getAttribute('data-color-key') || picker.id;
            
            // Try preference color first
            if (colors[colorKey]) {
                picker.value = colors[colorKey];
                applied++;
            }
            // Fallback to default
            else if (this.defaultColors[colorKey]) {
                picker.value = this.defaultColors[colorKey];
                applied++;
            }
        });
        
        console.log(`🎨 Applied ${applied}/${colorPickers.length} colors to UI`);
    }
    
    /**
     * Sync colors with ColorSchemeSystem
     * Updates CSS variables
     */
    async syncWithColorScheme() {
        if (window.colorSchemeSystem?.updateCSSVariablesFromPreferences) {
            try {
                const prefs = this.preferencesManager.currentPreferences;
                if (prefs) {
                    await window.colorSchemeSystem.updateCSSVariablesFromPreferences(prefs);
                    console.log('✅ Colors synced with ColorSchemeSystem');
                }
            } catch (error) {
                console.warn('⚠️ ColorScheme sync failed:', error);
            }
        }
    }
    
    /**
     * Get default colors
     * @private
     * @returns {Object} Default color values
     */
    _getDefaultColors() {
        return {
            // System colors
            primaryColor: '#007bff',
            secondaryColor: '#6c757d',
            successColor: '#28a745',
            warningColor: '#ffc107',
            dangerColor: '#dc3545',
            infoColor: '#17a2b8',
            
            // Entity colors (main only - light/dark calculated by CSS)
            entityTradePlanColor: '#9c27b0',
            entityTradePlanColorLight: '#ba68c8',
            entityTradePlanColorDark: '#7b1fa2',
            
            entityTradeColor: '#007bff',
            entityTradeColorLight: '#0056b3',
            entityTradeColorDark: '#004085',
            
            entityAlertColor: '#ff9800',
            entityAlertColorLight: '#ffb74d',
            entityAlertColorDark: '#f57c00',
            
            entityNoteColor: '#607d8b',
            entityNoteColorLight: '#90a4ae',
            entityNoteColorDark: '#455a64',
            
            entityTradingAccountColor: '#28a745',
            entityTradingAccountColorLight: '#34ce57',
            entityTradingAccountColorDark: '#1e7e34',
            
            entityTickerColor: '#17a2b8',
            entityTickerColorLight: '#20c997',
            entityTickerColorDark: '#138496',
            
            entityExecutionColor: '#6f42c1',
            entityExecutionColorLight: '#8e44ad',
            entityExecutionColorDark: '#5a2d91',
            
            entityCashFlowColor: '#20c997',
            entityCashFlowColorLight: '#20c997',
            entityCashFlowColorDark: '#138496',
            
            entityResearchColor: '#9c27b0',
            entityResearchColorLight: '#ba68c8',
            entityResearchColorDark: '#7b1fa2',
            
            entityPreferencesColor: '#607d8b',
            entityPreferencesColorLight: '#90a4ae',
            entityPreferencesColorDark: '#455a64',
            
            // Status colors
            statusOpenColor: '#28a745',
            statusClosedColor: '#6c757d',
            statusCancelledColor: '#dc3545',
            
            // Type colors
            typeSwingColor: '#007bff',
            typeInvestmentColor: '#28a745',
            typePassiveColor: '#6c757d',
            
            // Priority colors
            priorityHighColor: '#dc3545',
            priorityMediumColor: '#ffc107',
            priorityLowColor: '#28a745',
            
            // Value colors
            valuePositiveColor: '#28a745',
            valueNegativeColor: '#dc3545',
            valueNeutralColor: '#6c757d',
            
            // Chart colors
            chartPrimaryColor: '#1e40af',
            chartBackgroundColor: '#ffffff',
            chartTextColor: '#212529',
            chartGridColor: '#e9ecef',
            chartBorderColor: '#dee2e6',
            chartPointColor: '#007bff'
        };
    }
}

// ============================================================================
// CLASS 4: PROFILE MANAGER
// ============================================================================

/**
 * Profile Manager
 * Handles all profile operations
 */
class ProfileManager {
    constructor(preferencesManager, uiManager) {
        this.preferencesManager = preferencesManager;
        this.uiManager = uiManager;
        this.api = preferencesManager.api;
        this.profiles = [];
        this.activeProfile = null;
    }
    
    /**
     * Load all user profiles
     * @param {number} userId - User ID
     * @returns {Promise<Array>} List of profiles
     */
    async loadProfiles(userId = null) {
        try {
            userId = userId || this.preferencesManager.userId;
            console.log(`📂 Loading profiles for user ${userId}...`);
            
            const data = await this.api.getProfiles(userId);
            this.profiles = data.profiles || [];
            this.activeProfile = this.profiles.find(p => p.active) || this.profiles[0];
            
            // Update dropdown UI
            await this.updateDropdown();
            
            console.log(`✅ Loaded ${this.profiles.length} profiles (active: ${this.activeProfile?.name})`);
            return this.profiles;
            
        } catch (error) {
            console.error('❌ Error loading profiles:', error);
            throw error;
        }
    }
    
    /**
     * Switch to different profile
     * @param {number} profileId - Profile ID to switch to
     * @returns {Promise<boolean>} Success status
     */
    async switchProfile(profileId) {
        try {
            console.log(`🔄 Switching to profile ${profileId}...`);
            this.uiManager.showLoading('profile-switch');
            
            // Step 1: Activate profile in database
            await this.api.activateProfile(this.preferencesManager.userId, profileId);
            console.log('✅ Profile activated in database');
            
            this.uiManager.hideLoading('profile-switch');
            this.uiManager.showSuccess('פרופיל הוחלף בהצלחה!', 'מנקה cache ומרענן...');
            
            // Use the UNIFIED cache clearing system - it handles EVERYTHING!
            // This will:
            // - Clear Memory, localStorage, IndexedDB, Backend layers
            // - Clear Service Caches (EntityDetailsAPI, ExternalDataService, etc.)
            // - Clear Orphan Keys (colorScheme, customColorScheme, etc.)
            // - Clear backend cache via /api/cache/clear
            // - Reload page data from server
            // - Perform hard reload with cache bypass: location.replace(url + ?_refresh=timestamp)
            console.log('🧹 Using unified cache clearing system...');
            
            setTimeout(async () => {
                await window.clearAllCache({
                    level: 'full',             // 100% coverage - for profile switch
                    skipConfirmation: true,    // No modal - we already confirmed switch
                    verbose: true              // Detailed logging
                });
                // Note: clearAllCache will automatically reload the page!
            }, 500);
            
            return true;
            
        } catch (error) {
            this.uiManager.hideLoading('profile-switch');
            this.uiManager.showError('שגיאה בהחלפת פרופיל', error.message);
            throw error;
        }
    }
    
    /**
     * Update profile UI elements
     * Updates both display (currentActiveProfile) and selection (profileSwitchSelect)
     */
    async updateDropdown() {
        // 1. Update current active profile display
        const currentActiveElem = document.getElementById('currentActiveProfile');
        if (currentActiveElem) {
            const activeProfile = this.profiles.find(p => p.active);
            if (activeProfile) {
                currentActiveElem.textContent = activeProfile.name;
                currentActiveElem.dataset.profileId = activeProfile.id;
            }
        }
        
        // 2. Update profile selection dropdown
        const switchSelect = document.getElementById('profileSwitchSelect');
        if (switchSelect) {
            // Clear existing options
            switchSelect.innerHTML = '<option value="">בחר פרופיל...</option>';
            
            // Add all profiles (including active one)
            this.profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.id;
                option.textContent = profile.name;
                option.dataset.profileName = profile.name;
                
                // Mark if this is the current active profile
                if (profile.active) {
                    option.textContent += ' (פעיל כעת)';
                }
                
                switchSelect.appendChild(option);
            });
        }
        
        console.log(`📋 Updated profile UI with ${this.profiles.length} profiles`);
    }
    
    /**
     * Get active profile
     * @returns {Object} Active profile
     */
    getActiveProfile() {
        return this.activeProfile || this.profiles.find(p => p.active) || this.profiles[0];
    }
    
    // ========================================================================
    // PROFILE MANAGEMENT METHODS
    // ========================================================================
    
    /**
     * Create new profile with system defaults
     */
    async createProfile(profileName, description = '') {
        try {
            // 1. Validate profileName not empty
            if (!profileName || !profileName.trim()) {
                throw new Error('שם פרופיל לא יכול להיות ריק');
            }
            
            console.log(`➕ Creating profile: ${profileName}...`);
            
            // 2. POST /api/preferences/profiles
            const response = await this.api.post('/profiles', {
                user_id: this.preferencesManager.userId,
                profile_name: profileName,
                description: description
            });
            
            // 3. Reload profiles
            await this.loadProfiles();
            
            console.log('✅ Profile created successfully');
            
            // 4. Return response with new profile_id
            return response;
            
        } catch (error) {
            console.error('❌ Error creating profile:', error);
            throw error;
        }
    }
    
    /**
     * Delete profile
     */
    async deleteProfile(profileId) {
        try {
            // 1. Validate profileId provided
            if (!profileId) {
                throw new Error('מזהה פרופיל חסר');
            }
            
            console.log(`🗑️ Deleting profile ${profileId}...`);
            
            // 2. Check this.profiles.length > 1
            if (this.profiles.length <= 1) {
                throw new Error('לא ניתן למחוק את הפרופיל האחרון במערכת');
            }
            
            // 3. DELETE /api/preferences/profiles/{profileId}?user_id={userId}
            const response = await fetch(
                `/api/preferences/profiles/${profileId}?user_id=${this.preferencesManager.userId}`, 
                { method: 'DELETE' }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete profile');
            }
            
            // 4. Reload profiles
            await this.loadProfiles();
            
            console.log('✅ Profile deleted successfully');
            
            // 5. Return true
            return true;
            
        } catch (error) {
            console.error('❌ Error deleting profile:', error);
            throw error;
        }
    }
    
    /**
     * Export profile to JSON
     * @future - For backup/transfer functionality
     */
    async exportProfile(profileId) {
        try {
            const preferences = await this.preferencesManager.load(
                this.preferencesManager.userId, 
                profileId
            );
            
            const profileData = {
                profile_id: profileId,
                profile_name: this.profiles.find(p => p.id === profileId)?.name,
                preferences: preferences,
                exported_at: new Date().toISOString(),
                exported_by: this.preferencesManager.userId
            };
            
            return JSON.stringify(profileData, null, 2);
            
        } catch (error) {
            console.error('❌ Error exporting profile:', error);
            throw error;
        }
    }
    
    /**
     * Import profile from JSON
     * @future - For backup/transfer functionality
     */
    async importProfile(profileName, preferencesJSON) {
        try {
            const profileData = JSON.parse(preferencesJSON);
            
            // Create new profile
            await this.createProfile(profileName, `Imported from ${profileData.profile_name}`, false);
            
            // Get new profile ID
            await this.loadProfiles();
            const newProfile = this.profiles.find(p => p.name === profileName);
            
            if (!newProfile) {
                throw new Error('Failed to create profile');
            }
            
            // Save preferences to new profile
            await this.preferencesManager.save(
                profileData.preferences, 
                this.preferencesManager.userId, 
                newProfile.id
            );
            
            console.log('✅ Profile imported successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error importing profile:', error);
            throw error;
        }
    }
}

// ============================================================================
// CLASS 5: UI MANAGER
// ============================================================================

/**
 * UI Manager
 * Handles all UI updates, loading states, and user feedback
 */
class UIManager {
    constructor() {
        this.loadingStates = new Map();
    }
    
    /**
     * Show loading state for operation
     * @param {string} operation - Operation name (e.g., 'save', 'load', 'profile-switch')
     */
    showLoading(operation) {
        console.log(`⏳ Loading: ${operation}`);
        
        // Find and disable relevant buttons
        const buttons = document.querySelectorAll(
            `button[data-operation="${operation}"], #saveAllBtn, #resetBtn`
        );
        
        buttons.forEach(btn => {
            // Save original state
            if (!this.loadingStates.has(btn)) {
                this.loadingStates.set(btn, {
                    originalHTML: btn.innerHTML,
                    originalDisabled: btn.disabled
                });
            }
            
            // Set loading state
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> טוען...';
        });
    }
    
    /**
     * Hide loading state for operation
     * @param {string} operation - Operation name
     */
    hideLoading(operation) {
        console.log(`✅ Finished: ${operation}`);
        
        // Find and restore buttons
        const buttons = document.querySelectorAll(
            `button[data-operation="${operation}"], #saveAllBtn, #resetBtn`
        );
        
        buttons.forEach(btn => {
            const state = this.loadingStates.get(btn);
            if (state) {
                btn.innerHTML = state.originalHTML;
                btn.disabled = state.originalDisabled;
                this.loadingStates.delete(btn);
            }
        });
    }
    
    /**
     * Update statistics counters
     * @param {Object} preferencesData - Current preferences
     */
    async updateCounters(preferencesData = null) {
        try {
            console.log('📊 Updating counters...');
            
            // Preferences count
            if (preferencesData) {
                const count = Object.keys(preferencesData).length;
                this._updateElement('preferencesCount', count);
                console.log(`📊 Preferences count: ${count}`);
            }
            
            // Profiles count
            try {
                const profiles = await this.api.getProfiles(this.preferencesManager?.userId || 1);
                const profilesCount = profiles?.profiles?.length || 0;
                this._updateElement('profilesCount', profilesCount);
                console.log(`📊 Profiles count: ${profilesCount}`);
                
                // Active profile - update both displays
                const activeProfile = profiles?.profiles?.find(p => p.active);
                if (activeProfile) {
                    // Update top statistics
                    this._updateElement('activeProfileInfo', activeProfile.name);
                    // Update section 1 display
                    this._updateElement('currentActiveProfile', activeProfile.name);
                    console.log(`📊 Active profile: ${activeProfile.name}`);
                }
            } catch (error) {
                console.warn('⚠️ Could not load profiles count:', error);
            }
            
            // Groups count
            try {
                const groups = await this.api.getGroups();
                const groupsCount = groups?.groups?.length || 13;  // Fallback to known count
                this._updateElement('groupsCount', groupsCount);
                console.log(`📊 Groups count: ${groupsCount}`);
            } catch (error) {
                console.warn('⚠️ Could not load groups count, using fallback');
                this._updateElement('groupsCount', 13);
            }
            
            console.log('✅ Counters updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating counters:', error);
        }
    }
    
    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {string} details - Optional details
     */
    showSuccess(message, details = '') {
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(message, details);
        } else {
            console.log('✅', message, details);
        }
    }
    
    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {string} details - Error details
     */
    showError(message, details = '') {
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(message, details);
        } else {
            console.error('❌', message, details);
            alert(`${message}\n\n${details}`);
        }
    }
    
    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {string} details - Warning details
     */
    showWarning(message, details = '') {
        if (typeof window.showWarningNotification === 'function') {
            window.showWarningNotification(message, details);
        } else {
            console.warn('⚠️', message, details);
        }
    }
    
    /**
     * Update element text content
     * @private
     */
    _updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ Element not found: ${id}`);
        }
    }
    
    // Reference to API (will be set by PreferencesSystem)
    api = null;
    preferencesManager = null;
}

// ============================================================================
// CLASS 6: PREFERENCES SYSTEM (Main Coordinator)
// ============================================================================

/**
 * Preferences System
 * Main coordinator that orchestrates all managers
 * Single entry point for all preferences operations
 */
class PreferencesSystem {
    constructor() {
        this.manager = new PreferencesManager();
        this.colors = new ColorManager(this.manager);
        this.ui = new UIManager();
        this.profiles = null;  // Will be initialized in initialize()
        this.initialized = false;
        
        // Set references for UIManager
        this.ui.api = this.manager.api;
        this.ui.preferencesManager = this.manager;
    }
    
    /**
     * Initialize the entire preferences system
     * Called by Unified Initialization System
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            console.log('🚀 Initializing PreferencesSystem...');
            
            // Step 1: Initialize manager
            await this.manager.initialize();
            
            // Step 2: Initialize profile manager
            this.profiles = new ProfileManager(this.manager, this.ui);
            
            // Step 3: Load profiles
            await this.profiles.loadProfiles();
            
            // Step 4: Load preferences for active profile
            const activeProfile = this.profiles.getActiveProfile();
            await this.manager.load(1, activeProfile?.id, true);  // forceRefresh=true on init
            
            // Step 5: Apply preferences to form
            this._applyToForm(this.manager.currentPreferences);
            
            // Step 6: Load colors
            await this.colors.loadColors();
            
            // Step 7: Update UI counters
            await this.ui.updateCounters(this.manager.currentPreferences);
            
            // Step 8: Load accounts using SelectPopulatorService
            if (typeof window.SelectPopulatorService !== 'undefined') {
                try {
                    await window.SelectPopulatorService.populateAccountsSelect('defaultAccountFilter', {
                        includeEmpty: true,
                        emptyText: 'בחר חשבון מסחר',
                        defaultFromPreferences: true,
                        filterFn: account => account.status === 'open'
                    });
                    console.log('✅ Trading accounts loaded');
                } catch (error) {
                    console.warn('⚠️ Could not load trading accounts:', error);
                }
            }
            
            // Step 9: Setup event listeners
            this._setupEventListeners();
            
            this.initialized = true;
            console.log('✅ PreferencesSystem fully initialized and ready');
            return true;
            
        } catch (error) {
            console.error('❌ PreferencesSystem initialization failed:', error);
            this.ui.showError('שגיאה באתחול מערכת ההעדפות', error.message);
            return false;
        }
    }
    
    /**
     * Save all preferences from form
     * @returns {Promise<boolean>} Success status
     */
    async saveAll() {
        try {
            this.ui.showLoading('save');
            
            // Collect form data
            const formData = this._collectFormData();
            
            if (Object.keys(formData).length === 0) {
                this.ui.showWarning('אין נתונים לשמירה');
                this.ui.hideLoading('save');
                return false;
            }
            
            console.log(`💾 Saving ${Object.keys(formData).length} preferences...`);
            
            // Validate
            await this.manager.validate(formData);
            
            // Save
            await this.manager.save(formData);
            console.log('✅ Preferences saved to database');
            
            this.ui.hideLoading('save');
            this.ui.showSuccess('העדפות נשמרו בהצלחה!', 'מרענן מטמון...');
            
            // Use light cache clearing for saves - no need for full reload
            // This clears Memory + Service Caches only (25% coverage)
            // Enough to ensure fresh data without full page reload
            setTimeout(async () => {
                await window.clearAllCache({
                    level: 'light',            // Light - just memory + services
                    skipConfirmation: true,    // No modal
                    verbose: false,            // No notification
                    skipReload: true           // Don't reload page!
                });
                
                // Reload fresh data from API after cache clear
                const activeProfile = this.profiles.getActiveProfile();
                await this.manager.load(null, activeProfile?.id, true); // Force refresh
                
                // Apply loaded data back to form
                this._applyToForm(this.manager.currentPreferences);
                
                // Update colors
                await this.colors.loadColors();
                
                // Update counters
                await this.ui.updateCounters(this.manager.currentPreferences);
                
                console.log('✅ Preferences refreshed after save');
            }, 100);
            
            return true;
            
        } catch (error) {
            this.ui.hideLoading('save');
            this.ui.showError('שגיאה בשמירת העדפות', error.message);
            return false;
        }
    }
    
    /**
     * Reset all preferences to defaults
     * @returns {Promise<boolean>} Success status
     */
    async resetToDefaults() {
        try {
            // Confirm with user via notification system
            const confirmed = await new Promise((resolve) => {
                if (window.showConfirmationDialog) {
                    window.showConfirmationDialog(
                        'איפוס לברירת מחדל',
                        'האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?\n\nפעולה זו תחליף את כל הערכים הנוכחיים בערכי ברירת המחדל של המערכת.',
                        () => resolve(true),
                        () => resolve(false),
                        'warning'
                    );
                } else {
                    // Fallback to standard confirm if notification system not available
                    resolve(confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?'));
                }
            });
            
            if (!confirmed) {
                console.log('❌ Reset cancelled by user');
                return false;
            }
            
            this.ui.showLoading('reset');
            console.log('🔄 Resetting to defaults...');
            
            // Get default values from API
            const response = await fetch('/api/preferences/admin/types');
            if (!response.ok) {
                throw new Error('Failed to get preference types');
            }
            
            const data = await response.json();
            console.log('📊 Received preference types:', data);
            
            // Fix: data.data is the array, not data.data.preference_types
            const preferenceTypes = data.data || [];
            
            if (!preferenceTypes || preferenceTypes.length === 0) {
                throw new Error('No preference types returned from API');
            }
            
            console.log(`✅ Found ${preferenceTypes.length} preference types`);
            
            // Build defaults object
            const defaults = {};
            preferenceTypes.forEach(pref => {
                if (pref.default_value !== null && pref.default_value !== undefined) {
                    defaults[pref.preference_name] = pref.default_value;
                }
            });
            
            console.log(`📝 Prepared ${Object.keys(defaults).length} default values`);
            
            if (Object.keys(defaults).length === 0) {
                throw new Error('No default values found');
            }
            
            // Save defaults
            await this.manager.save(defaults);
            console.log('✅ Default values saved to database');
            
            this.ui.hideLoading('reset');
            this.ui.showSuccess('העדפות אופסו לברירות מחדל!', 'מנקה cache ומרענן...');
            
            // Use the UNIFIED cache clearing system - it handles EVERYTHING!
            // This will:
            // - Clear Memory, localStorage, IndexedDB, Backend layers
            // - Clear Service Caches (EntityDetailsAPI, ExternalDataService, etc.)
            // - Clear backend cache via /api/cache/clear
            // - Reload page data from server
            // - Perform hard reload with cache bypass: location.replace(url + ?_refresh=timestamp)
            console.log('🧹 Using unified cache clearing system...');
            
            setTimeout(async () => {
                await window.clearAllCache({
                    level: 'medium',           // 60% coverage - good for preferences
                    skipConfirmation: true,    // No modal - we already confirmed reset
                    verbose: true              // Detailed logging
                });
                // Note: clearAllCache will automatically reload the page!
            }, 500);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error resetting to defaults:', error);
            this.ui.hideLoading('reset');
            this.ui.showError('שגיאה באיפוס העדפות', error.message);
            return false;
        }
    }
    
    /**
     * Collect form data from all inputs
     * @private
     * @returns {Object} Form data
     */
    _collectFormData() {
        const formData = {};
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.id && !input.disabled) {
                // Skip buttons and non-preference fields
                const skipIds = [
                    'saveAllBtn', 'resetBtn', 'toggleAllBtn', 'addPreferenceBtn',
                    'profileSelect', 'profileSwitchSelect', 'newProfileName', 'currentActiveProfile', 'switchProfileBtn',  // Profile management
                    'admin-user-select', 'admin-profile-select', 'admin-group-select', 'admin-search-input',  // Admin (if exists)
                    'preferenceName', 'preferenceValue', 'preferenceType', 'preferenceCategory', 'preferenceDescription',  // Modal fields
                    'editPreferenceName', 'editPreferenceValue', 'editPreferenceType', 'editPreferenceCategory', 'editPreferenceDescription'  // Edit modal
                ];
                
                if (skipIds.includes(input.id)) {
                    return;
                }
                
                // Get value based on input type
                if (input.type === 'checkbox') {
                    formData[input.id] = input.checked;
                } else if (input.type === 'number') {
                    formData[input.id] = parseFloat(input.value) || 0;
                } else if (input.type === 'color') {
                    formData[input.id] = input.value || '#000000';
                } else {
                    formData[input.id] = input.value;
                }
            }
        });
        
        console.log(`📋 Collected ${Object.keys(formData).length} form fields`);
        return formData;
    }
    
    /**
     * Apply preferences to form inputs
     * @param {Object} preferences - Preferences to apply
     * @private
     */
    _applyToForm(preferences) {
        if (!preferences) return;
        
        let updated = 0;
        
        Object.entries(preferences).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element && !element.disabled) {
                // Apply value based on element type
                if (element.type === 'checkbox') {
                    element.checked = (value === true || value === 'true' || value === '1' || value === 1);
                    updated++;
                } else if (element.type === 'number') {
                    element.value = parseFloat(value) || 0;
                    updated++;
                } else if (element.type === 'color') {
                    element.value = value || '#000000';
                    updated++;
                } else if (element.tagName === 'SELECT') {
                    element.value = value || '';
                    updated++;
                } else {
                    element.value = value || '';
                    updated++;
                }
            }
        });
        
        console.log(`📝 Applied ${updated} preferences to form`);
    }
    
    /**
     * Setup event listeners
     * @private
     */
    _setupEventListeners() {
        // No auto-switching on dropdown change!
        // User must click "החלף לפרופיל זה" button explicitly
        console.log('✅ Event listeners setup complete (profile switching requires explicit button click)');
    }
    
    /**
     * Switch to selected profile from dropdown
     * Called when user clicks "החלף לפרופיל זה" button
     */
    async switchToSelectedProfile() {
        try {
            const switchSelect = document.getElementById('profileSwitchSelect');
            const selectedProfileId = parseInt(switchSelect?.value);
            
            if (!selectedProfileId) {
                this.ui.showWarning('לא נבחר פרופיל', 'אנא בחר פרופיל מהרשימה');
                return;
            }
            
            // Check if already active
            const activeProfile = this.profiles.getActiveProfile();
            if (selectedProfileId === activeProfile?.id) {
                this.ui.showWarning('פרופיל כבר פעיל', 'הפרופיל הזה כבר פעיל במערכת');
                return;
            }
            
            // Switch profile (includes backend activation + page reload)
            await this.profiles.switchProfile(selectedProfileId);
            
            // Note: switchProfile() will trigger page reload automatically
            // No need for additional UI updates here
            
            return true;
            
        } catch (error) {
            this.ui.showError('שגיאה בהחלפת פרופיל', error.message);
            return false;
        }
    }
}

// ============================================================================
// GLOBAL EXPORT
// ============================================================================

/**
 * Global Preferences System Instance
 * Main entry point for all preferences operations
 */
window.PreferencesSystem = new PreferencesSystem();

console.log('✅ PreferencesSystem created and exported to window');

// ============================================================================
// LEGACY COMPATIBILITY LAYER
// ============================================================================

/**
 * Legacy API - Backward compatible with old preferences system
 * Allows existing code to continue working without changes
 */

// Get single preference
window.getPreference = async (preferenceName, userId = null, profileId = null) => {
    return await window.PreferencesSystem.manager.getSingle(preferenceName);
};

// Save preferences
window.savePreferences = async (preferences, userId = null, profileId = null) => {
    return await window.PreferencesSystem.manager.save(preferences, userId, profileId);
};

// Get all preferences
window.getAllUserPreferences = async (userId = null, profileId = null, forceRefresh = false) => {
    if (forceRefresh) {
        await window.PreferencesSystem.manager._clearCache();
    }
    return await window.PreferencesSystem.manager.load(userId, profileId);
};

// Load preferences (same as getAllUserPreferences)
window.loadPreferences = async (userId = null, profileId = null) => {
    return await window.PreferencesSystem.manager.load(userId, profileId);
};

// Save all preferences
window.saveAllPreferences = async () => {
    return await window.PreferencesSystem.saveAll();
};

// Get user profiles
window.getUserProfiles = async (userId = null) => {
    return await window.PreferencesSystem.profiles.loadProfiles(userId);
};

// Reset to defaults
window.resetToDefaults = async () => {
    return await window.PreferencesSystem.resetToDefaults();
};

// Switch profile
window.switchProfile = async (profileId) => {
    return await window.PreferencesSystem.profiles.switchProfile(profileId);
};

// Validate currency (page-specific)
window.validateCurrency = (selectElement) => {
    const selectedValue = selectElement.value;
    
    if (!selectedValue.includes('USD')) {
        if (typeof window.showWarningNotification === 'function') {
            window.showWarningNotification(
                'אזהרה',
                '⚠️ המערכת תומכת כרגע רק בדולר אמריקאי (USD). השדה אופס לברירת המחדל.'
            );
        }
        selectElement.value = 'USD - דולר ארה"ב';
    }
};

// Copy detailed log (kept from old system)
window.copyDetailedLog = async () => {
    try {
        const log = [];
        const timestamp = new Date().toLocaleString('he-IL');
        
        log.push('=== לוג מפורט - עמוד העדפות TikTrack ===');
        log.push(`זמן יצירה: ${timestamp}`);
        log.push(`עמוד: ${window.location.href}`);
        log.push('');
        
        log.push('--- מצב כללי ---');
        log.push(`כותרת: ${document.title}`);
        log.push(`סטטוס טעינה: ${document.readyState}`);
        log.push('');
        
        log.push('--- סטטיסטיקות ---');
        const prefsCount = document.getElementById('preferencesCount')?.textContent || '0';
        const profilesCount = document.getElementById('profilesCount')?.textContent || '0';
        const groupsCount = document.getElementById('groupsCount')?.textContent || '0';
        const activeProfile = document.getElementById('activeProfileInfo')?.textContent || 'לא זמין';
        
        log.push(`מספר העדפות: ${prefsCount}`);
        log.push(`מספר פרופילים: ${profilesCount}`);
        log.push(`מספר קבוצות: ${groupsCount}`);
        log.push(`פרופיל פעיל: ${activeProfile}`);
        log.push('');
        
        log.push('--- מצב סקשנים ---');
        const sections = document.querySelectorAll('.content-section, .top-section');
        sections.forEach((section, index) => {
            const sectionId = section.id || `section-${index + 1}`;
            const sectionBody = section.querySelector('.section-body');
            const isVisible = sectionBody ? sectionBody.style.display !== 'none' : true;
            log.push(`  ${index + 1}. ${sectionId}: ${isVisible ? 'פתוח' : 'סגור'}`);
        });
        log.push('');
        
        log.push('--- סטטוס מערכת ---');
        log.push(`PreferencesSystem initialized: ${window.PreferencesSystem?.initialized || false}`);
        log.push(`Current preferences loaded: ${window.PreferencesSystem?.manager?.currentPreferences ? 'Yes' : 'No'}`);
        log.push(`Profiles loaded: ${window.PreferencesSystem?.profiles?.profiles?.length || 0}`);
        log.push('');
        
        log.push('=== סוף לוג ===');
        
        const logText = log.join('\n');
        
        // Copy to clipboard
        await navigator.clipboard.writeText(logText);
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('לוג מפורט הועתק ללוח', 'הלוג מכיל את כל מה שרואה המשתמש בעמוד');
        }
        
        console.log('📋 Detailed log copied to clipboard');
        return true;
        
    } catch (error) {
        console.error('❌ Error copying detailed log:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהעתקת הלוג', error.message);
        }
        return false;
    }
};

// Additional legacy compatibility functions
window.loadProfilesToDropdown = async () => {
    return await window.PreferencesSystem.profiles.loadProfiles();
};

window.saveAsActiveProfile = async () => {
    return await window.PreferencesSystem.saveAll();
};

window.loadDefaultColors = () => {
    // Now handled automatically by ColorManager
    return window.PreferencesSystem.colors.loadColors();
};

// Profile management functions
window.switchToSelectedProfile = async () => {
    return await window.PreferencesSystem.switchToSelectedProfile();
};

window.createNewProfile = async () => {
    try {
        const nameInput = document.getElementById('newProfileName');
        const profileName = nameInput?.value?.trim();
        
        if (!profileName) {
            window.showWarningNotification(
                'שם פרופיל חסר',
                'אנא הכנס שם לפרופיל החדש'
            );
            return;
        }
        
        // Show loading
        window.PreferencesSystem.ui.showLoading('create-profile');
        
        // Create profile
        await window.PreferencesSystem.profiles.createProfile(
            profileName,
            `פרופיל ${profileName}`
        );
        
        // Clear input
        nameInput.value = '';
        
        // Hide loading
        window.PreferencesSystem.ui.hideLoading('create-profile');
        
        // Success notification
        window.showSuccessNotification(
            'פרופיל נוצר והופעל בהצלחה',
            `הפרופיל "${profileName}" נוצר עם ברירות מחדל והפך לפעיל. הדף ירענן בעוד רגע...`
        );
        
        // Reload page to show the new active profile
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        window.PreferencesSystem.ui.hideLoading('create-profile');
        
        // Extract error message
        const errorMsg = error.message || error.error || String(error);
        
        // Check for specific error types
        if (errorMsg.includes('already exists')) {
            window.showWarningNotification(
                'שם פרופיל קיים',
                `פרופיל בשם "${profileName}" כבר קיים במערכת. אנא בחר שם אחר.`
            );
        } else {
            window.showErrorNotification(
                'שגיאה ביצירת פרופיל',
                errorMsg
            );
        }
    }
};

window.deleteCurrentProfile = async () => {
    try {
        const activeProfile = window.PreferencesSystem.profiles.getActiveProfile();
        
        if (!activeProfile) {
            window.showWarningNotification('שגיאה', 'לא נמצא פרופיל פעיל');
            return;
        }
        
        // Check not the only profile
        const profiles = window.PreferencesSystem.profiles.profiles;
        if (profiles.length <= 1) {
            window.showWarningNotification(
                'לא ניתן למחוק',
                'לא ניתן למחוק את הפרופיל האחרון במערכת'
            );
            return;
        }
        
        // Confirmation dialog
        const confirmed = await new Promise((resolve) => {
            window.showConfirmationDialog(
                'מחיקת פרופיל',
                `האם אתה בטוח שברצונך למחוק את הפרופיל "${activeProfile.name}"?\n\n` +
                `פעולה זו תמחק את כל ההעדפות של הפרופיל ותעבור אוטומטית לפרופיל ברירת המחדל.\n\n` +
                `⚠️ פעולה זו אינה הפיכה!`,
                () => resolve(true),
                () => resolve(false),
                'danger'
            );
        });
        
        if (!confirmed) {
            return;
        }
        
        // Show loading
        window.PreferencesSystem.ui.showLoading('delete-profile');
        
        // Delete profile (backend will auto-switch if active)
        await window.PreferencesSystem.profiles.deleteProfile(activeProfile.id);
        
        // Reload profiles
        await window.PreferencesSystem.profiles.loadProfiles();
        
        // Hide loading
        window.PreferencesSystem.ui.hideLoading('delete-profile');
        
        // Success notification
        window.showSuccessNotification(
            'פרופיל נמחק בהצלחה',
            `הפרופיל "${activeProfile.name}" נמחק מהמערכת`
        );
        
        // Reload page to show new active profile
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        window.PreferencesSystem.ui.hideLoading('delete-profile');
        
        // Extract error message
        const errorMsg = error.message || error.error || String(error);
        
        window.showErrorNotification(
            'שגיאה במחיקת פרופיל',
            errorMsg
        );
    }
};

// toggleSection and toggleAllSections are already defined in ui-basic.js
// No need to redefine them here - they work globally

console.log('✅ preferences-core.js loaded successfully - ready for initialization');
console.log('📌 Call window.PreferencesSystem.initialize() to start');

