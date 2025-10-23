/**
 * Preferences Core System - TikTrack
 * ===================================
 * 
 * Core preferences management (non-color preferences)
 * Handles general, filters, notifications, display preferences
 * 
 * @version 3.0.0
 * @date January 23, 2025
 * @author TikTrack Development Team
 * 
 * @description
 * Streamlined preferences system with:
 * - API communication
 * - Cache management
 * - Validation system
 * - Profile management
 * - Lazy loading support
 * 
 * @architecture
 * - PreferencesCore: Main coordinator
 * - APIClient: HTTP communication
 * - CacheManager: Cache operations
 * - ValidationManager: Preference validation
 * - ProfileManager: Profile operations
 * 
 * @compatibility
 * - Backward compatible with old API
 * - Works with UnifiedCacheManager
 * - Integrates with preferences-colors.js
 * - No HTML changes required!
 */

console.log('📄 Loading preferences-core.js v3.0.0...');

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
// API CLIENT CLASS
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
     * @param {string} endpoint - API endpoint
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
            
            return await response.json();
            
        } catch (error) {
            console.error(`❌ API GET error for ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Generic POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} Response data
     */
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new APIError(`HTTP ${response.status}`, errorText || response.statusText);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error(`❌ API POST error for ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Get single preference
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<any>} Preference value
     */
    async getPreference(preferenceName, userId = null, profileId = null) {
        const params = {
            name: preferenceName,
            user_id: userId || this.defaultUserId
        };
        
        if (profileId) {
            params.profile_id = profileId;
        }
        
        const result = await this.get('/user/preference', params);
        return result.data?.value;
    }
    
    /**
     * Get all user preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} All preferences
     */
    async getAllPreferences(userId = null, profileId = null) {
        const params = {
            user_id: userId || this.defaultUserId
        };
        
        if (profileId) {
            params.profile_id = profileId;
        }
        
        const result = await this.get('/user', params);
        return result.data?.preferences || {};
    }
    
    /**
     * Save single preference
     * @param {string} preferenceName - Preference name
     * @param {any} value - Preference value
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<boolean>} Success status
     */
    async savePreference(preferenceName, value, userId = null, profileId = null) {
        const data = {
            preference_name: preferenceName,
            value: value,
            user_id: userId || this.defaultUserId
        };
        
        if (profileId) {
            data.profile_id = profileId;
        }
        
        const result = await this.post('/user/single', data);
        return result.success;
    }
    
    /**
     * Save multiple preferences
     * @param {Object} preferences - Preferences object
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Save results
     */
    async savePreferences(preferences, userId = null, profileId = null) {
        const results = {
            saved: 0,
            errors: 0,
            details: {}
        };
        
        for (const [name, value] of Object.entries(preferences)) {
            try {
                const success = await this.savePreference(name, value, userId, profileId);
                if (success) {
                    results.saved++;
                    results.details[name] = { status: 'success' };
                } else {
                    results.errors++;
                    results.details[name] = { status: 'error', message: 'Save failed' };
                }
            } catch (error) {
                results.errors++;
                results.details[name] = { status: 'error', message: error.message };
            }
        }
        
        return results;
    }
}

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

/**
 * Preferences Cache Manager
 * Handles caching with TTL and invalidation
 */
class PreferencesCacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 5 * 60 * 1000; // 5 minutes TTL
        this.timestamps = new Map();
    }
    
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {any} Cached value or null
     */
    get(key) {
        const timestamp = this.timestamps.get(key);
        if (!timestamp) return null;
        
        // Check TTL
        if (Date.now() - timestamp > this.ttl) {
            this.delete(key);
            return null;
        }
        
        return this.cache.get(key);
    }
    
    /**
     * Set value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     */
    set(key, value) {
        this.cache.set(key, value);
        this.timestamps.set(key, Date.now());
    }
    
    /**
     * Delete key from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.timestamps.delete(key);
    }
    
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }
    
    /**
     * Invalidate specific keys
     * @param {Array<string>} keys - Keys to invalidate
     */
    invalidate(keys) {
        keys.forEach(key => this.delete(key));
    }
}

// ============================================================================
// VALIDATION MANAGER CLASS
// ============================================================================

/**
 * Preferences Validation Manager
 * Handles validation of preference values
 */
class PreferencesValidationManager {
    constructor() {
        this.validators = new Map();
        this.setupDefaultValidators();
    }
    
    /**
     * Setup default validators
     */
    setupDefaultValidators() {
        // String validators
        this.validators.set('string', (value) => typeof value === 'string');
        
        // Number validators
        this.validators.set('number', (value) => typeof value === 'number' && !isNaN(value));
        
        // Boolean validators
        this.validators.set('boolean', (value) => typeof value === 'boolean');
        
        // JSON validators
        this.validators.set('json', (value) => {
            try {
                JSON.parse(value);
                return true;
            } catch {
                return false;
            }
        });
    }
    
    /**
     * Validate preference value
     * @param {string} preferenceName - Preference name
     * @param {any} value - Value to validate
     * @param {string} dataType - Expected data type
     * @returns {boolean} Is valid
     */
    validate(preferenceName, value, dataType) {
        const validator = this.validators.get(dataType);
        if (!validator) {
            console.warn(`⚠️ No validator for data type: ${dataType}`);
            return true; // Allow unknown types
        }
        
        const isValid = validator(value);
        if (!isValid) {
            console.warn(`⚠️ Validation failed for ${preferenceName}: expected ${dataType}, got ${typeof value}`);
        }
        
        return isValid;
    }
    
    /**
     * Check if preference exists in database
     * @param {string} preferenceName - Preference name
     * @returns {Promise<boolean>} Exists status
     */
    async checkPreferenceExists(preferenceName) {
        try {
            const response = await fetch(`/api/preferences/types/check?name=${preferenceName}`);
            if (response.ok) {
                const result = await response.json();
                return result.exists;
            }
            return false;
        } catch (error) {
            console.error(`❌ Error checking preference existence:`, error);
            return false;
        }
    }
}

// ============================================================================
// PROFILE MANAGER CLASS
// ============================================================================

/**
 * Profile Manager
 * Handles user profile operations
 */
class ProfileManager {
    constructor() {
        this.currentProfile = null;
        this.profiles = [];
    }
    
    /**
     * Get user profiles
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Profiles array
     */
    async getProfiles(userId = 1) {
        try {
            const response = await fetch(`/api/preferences/profiles?user_id=${userId}`);
            if (response.ok) {
                const result = await response.json();
                this.profiles = result.data || [];
                return this.profiles;
            }
            return [];
        } catch (error) {
            console.error('❌ Error loading profiles:', error);
            return [];
        }
    }
    
    /**
     * Switch to profile
     * @param {number} profileId - Profile ID
     */
    switchProfile(profileId) {
        this.currentProfile = profileId;
        console.log(`🔄 Switched to profile: ${profileId}`);
    }
    
    /**
     * Get current profile
     * @returns {number} Current profile ID
     */
    getCurrentProfile() {
        return this.currentProfile || 3; // Default profile
    }
}

// ============================================================================
// MAIN PREFERENCES CORE CLASS
// ============================================================================

/**
 * Main Preferences Core System
 * Coordinates all preference operations
 */
class PreferencesCore {
    constructor() {
        this.apiClient = new PreferencesAPIClient();
        this.cacheManager = new PreferencesCacheManager();
        this.validationManager = new PreferencesValidationManager();
        this.profileManager = new ProfileManager();
        
        this.currentUserId = 1; // Nimrod
        this.currentProfileId = 3; // Default profile
    }
    
    /**
     * Get single preference with caching and lazy loading support
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @param {boolean} useLazyLoading - Whether to use lazy loading
     * @returns {Promise<any>} Preference value
     */
    async getPreference(preferenceName, userId = null, profileId = null, useLazyLoading = true) {
        const cacheKey = `${preferenceName}_${userId || this.currentUserId}_${profileId || this.currentProfileId}`;
        
        // Check cache first
        const cached = this.cacheManager.get(cacheKey);
        if (cached !== null) {
            console.log(`✅ Cache hit for ${preferenceName}`);
            return cached;
        }
        
        // Check lazy loading if enabled
        if (useLazyLoading && window.LazyLoader) {
            const isLoaded = window.LazyLoader.isLoaded(preferenceName);
            if (!isLoaded) {
                console.log(`🎯 Loading ${preferenceName} on demand via lazy loader`);
                return await window.LazyLoader.loadOnDemand(preferenceName, userId, profileId);
            }
        }
        
        try {
            // Load from API
            const value = await this.apiClient.getPreference(
                preferenceName, 
                userId || this.currentUserId, 
                profileId || this.currentProfileId
            );
            
            // Cache the result
            this.cacheManager.set(cacheKey, value);
            
            console.log(`✅ Loaded preference ${preferenceName}:`, value);
            return value;
            
        } catch (error) {
            console.error(`❌ Error loading preference ${preferenceName}:`, error);
            return null;
        }
    }
    
    /**
     * Get all preferences with lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @param {Array<string>} criticalPrefs - Critical preferences to load immediately
     * @returns {Promise<Object>} Preferences object
     */
    async getAllPreferences(userId = null, profileId = null, criticalPrefs = []) {
        const cacheKey = `all_preferences_${userId || this.currentUserId}_${profileId || this.currentProfileId}`;
        
        // Check cache first
        const cached = this.cacheManager.get(cacheKey);
        if (cached !== null) {
            console.log('✅ Cache hit for all preferences');
            return cached;
        }
        
        try {
            // Load critical preferences first
            const criticalPreferences = {};
            if (criticalPrefs.length > 0) {
                for (const prefName of criticalPrefs) {
                    criticalPreferences[prefName] = await this.getPreference(prefName, userId, profileId);
                }
            }
            
            // Load all preferences
            const allPreferences = await this.apiClient.getAllPreferences(
                userId || this.currentUserId, 
                profileId || this.currentProfileId
            );
            
            // Merge critical preferences
            const result = { ...allPreferences, ...criticalPreferences };
            
            // Cache the result
            this.cacheManager.set(cacheKey, result);
            
            console.log(`✅ Loaded ${Object.keys(result).length} preferences`);
            return result;
            
        } catch (error) {
            console.error('❌ Error loading all preferences:', error);
            return {};
        }
    }
    
    /**
     * Save single preference with strict validation
     * @param {string} preferenceName - Preference name
     * @param {any} value - Preference value
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @param {string} dataType - Expected data type
     * @returns {Promise<Object>} Save result with validation
     */
    async savePreference(preferenceName, value, userId = null, profileId = null, dataType = 'string') {
        try {
            // Strict validation if available
            if (window.PreferenceValidator) {
                console.log(`🔍 Validating preference ${preferenceName} before save...`);
                
                const validationResult = await window.PreferenceValidator.validatePreference(
                    preferenceName, 
                    value, 
                    dataType
                );
                
                if (!validationResult.valid) {
                    const errorMessages = validationResult.errors.map(e => e.message).join(', ');
                    throw new ValidationError(`Validation failed for ${preferenceName}: ${errorMessages}`);
                }
                
                console.log(`✅ Validation passed for ${preferenceName}`);
            } else {
                // Fallback to basic validation
                const exists = await this.validationManager.checkPreferenceExists(preferenceName);
                if (!exists) {
                    throw new ValidationError(`Preference ${preferenceName} not found in database. Please create a migration to add this preference.`);
                }
            }
            
            // Save via API
            const success = await this.apiClient.savePreference(
                preferenceName, 
                value, 
                userId || this.currentUserId, 
                profileId || this.currentProfileId
            );
            
            if (success) {
                // Invalidate cache
                const cacheKey = `${preferenceName}_${userId || this.currentUserId}_${profileId || this.currentProfileId}`;
                this.cacheManager.delete(cacheKey);
                this.cacheManager.delete(`all_preferences_${userId || this.currentUserId}_${profileId || this.currentProfileId}`);
                
                console.log(`✅ Saved preference ${preferenceName}:`, value);
                
                return {
                    success: true,
                    validation: { valid: true, errors: [] }
                };
            } else {
                return {
                    success: false,
                    validation: { valid: true, errors: [] },
                    error: 'Save failed'
                };
            }
            
        } catch (error) {
            console.error(`❌ Error saving preference ${preferenceName}:`, error);
            return {
                success: false,
                validation: { valid: false, errors: [error] },
                error: error.message
            };
        }
    }
    
    /**
     * Save multiple preferences
     * @param {Object} preferences - Preferences object
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Save results
     */
    async savePreferences(preferences, userId = null, profileId = null) {
        const results = {
            saved: 0,
            errors: 0,
            details: {}
        };
        
        for (const [name, value] of Object.entries(preferences)) {
            try {
                const success = await this.savePreference(name, value, userId, profileId);
                if (success) {
                    results.saved++;
                    results.details[name] = { status: 'success' };
                } else {
                    results.errors++;
                    results.details[name] = { status: 'error', message: 'Save failed' };
                }
            } catch (error) {
                results.errors++;
                results.details[name] = { status: 'error', message: error.message };
            }
        }
        
        // Invalidate all preferences cache
        this.cacheManager.delete(`all_preferences_${userId || this.currentUserId}_${profileId || this.currentProfileId}`);
        
        console.log(`✅ Saved ${results.saved} preferences, ${results.errors} errors`);
        return results;
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cacheManager.clear();
        console.log('🧹 Cleared preferences cache');
    }
    
    /**
     * Invalidate specific preferences
     * @param {Array<string>} preferenceNames - Preference names to invalidate
     */
    invalidatePreferences(preferenceNames) {
        const keys = preferenceNames.map(name => 
            `${name}_${this.currentUserId}_${this.currentProfileId}`
        );
        this.cacheManager.invalidate(keys);
        console.log(`🧹 Invalidated ${preferenceNames.length} preferences`);
    }
    
    /**
     * Initialize with lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
    async initializeWithLazyLoading(userId = null, profileId = null) {
        try {
            console.log('🚀 Initializing preferences with lazy loading...');
            
            // Initialize lazy loader if available
            if (window.LazyLoader) {
                await window.LazyLoader.initialize(
                    userId || this.currentUserId, 
                    profileId || this.currentProfileId
                );
                console.log('✅ Lazy loading initialized');
            } else {
                console.warn('⚠️ LazyLoader not available, using standard loading');
                // Fallback to standard loading
                await this.getAllPreferences(userId, profileId);
            }
            
        } catch (error) {
            console.error('❌ Error initializing lazy loading:', error);
            // Fallback to standard loading
            await this.getAllPreferences(userId, profileId);
        }
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
window.PreferencesCore = new PreferencesCore();

// ============================================================================
// GLOBAL FUNCTIONS (Backward Compatibility)
// ============================================================================

/**
 * Get preference (backward compatibility)
 * @param {string} preferenceName - Preference name
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<any>} Preference value
 */
window.getPreference = async function(preferenceName, userId = null, profileId = null) {
    return await window.PreferencesCore.getPreference(preferenceName, userId, profileId);
};

/**
 * Save preference (backward compatibility)
 * @param {string} preferenceName - Preference name
 * @param {any} value - Preference value
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<boolean>} Success status
 */
window.savePreference = async function(preferenceName, value, userId = null, profileId = null) {
    return await window.PreferencesCore.savePreference(preferenceName, value, userId, profileId);
};

/**
 * Get all preferences (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<Object>} All preferences
 */
window.getAllPreferences = async function(userId = null, profileId = null) {
    return await window.PreferencesCore.getAllPreferences(userId, profileId);
};

/**
 * Save all preferences (backward compatibility)
 * @param {Object} preferences - Preferences object
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 * @returns {Promise<Object>} Save results
 */
window.saveAllPreferences = async function(preferences, userId = null, profileId = null) {
    return await window.PreferencesCore.savePreferences(preferences, userId, profileId);
};

/**
 * Initialize preferences with lazy loading (backward compatibility)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.initializePreferencesWithLazyLoading = async function(userId = null, profileId = null) {
    return await window.PreferencesCore.initializeWithLazyLoading(userId, profileId);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 Preferences core system initialized');
    });
} else {
    console.log('📄 Preferences core system initialized');
}

console.log('✅ preferences-core.js loaded successfully');
