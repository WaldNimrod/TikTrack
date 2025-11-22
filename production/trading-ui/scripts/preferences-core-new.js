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

// window.Logger.info('📄 Loading preferences-core.js v3.0.0...', { page: "preferences-core-new" });

// ============================================================================
// FUNCTION INDEX
// ============================================================================
/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Core System
 * ============================================================================
 * 
 * Core Classes:
 * - PreferencesAPIClient - HTTP communication with backend
 * - PreferencesCacheManager - Cache operations (4-layer cache)
 * - PreferencesValidationManager - Preference validation
 * - PreferencesProfileManager - Profile operations
 * - PreferencesCore - Main coordinator class
 * 
 * Global Functions (Backward Compatibility):
 * - getPreference(preferenceName, userId, profileId) - Get single preference
 * - savePreference(preferenceName, value, userId, profileId) - Save single preference
 * - getAllPreferences(userId, profileId) - Get all preferences
 * - saveAllPreferences(preferences, userId, profileId) - Save multiple preferences
 * - getCurrentPreference(preferenceName, options) - Get cached preference with fallbacks
 * - initializePreferencesWithLazyLoading(userId, profileId) - Initialize with lazy loading
 * - initializePreferences(userId, profileId) - Initialize preferences (legacy alias)
 * 
 * Global Instances:
 * - window.PreferencesCore - Main preferences core instance
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

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

// Expose ValidationError globally for use by preferences-validation.js
window.ValidationError = ValidationError;

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
   * @function PreferencesAPIClient.get
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   * @throws {APIError} If HTTP request fails
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);

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
  }

  /**
     * Generic POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise<any>} Response data
     */
  async post(endpoint, data = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(`HTTP ${response.status}`, errorText || response.statusText);
    }

    return await response.json();
  }

  /**
     * Get single preference
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<any>} Preference value
     */
  async getPreference(preferenceName, userId = null, profileId = null) {
    if (!window.PreferencesData?.loadPreference || typeof window.PreferencesData.loadPreference !== 'function') {
      window.Logger?.warn?.('[PreferencesCore] loadPreference API is not available', { page: 'preferences-core-new' });
      return null;
    }
    const result = await window.PreferencesData.loadPreference({
      preferenceName,
      userId: userId || this.defaultUserId,
      profileId,
    });
    return result?.value ?? null;
  }

  /**
     * Get all user preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} All preferences
     */
  async getAllPreferences(userId = null, profileId = null) {
    if (!window.PreferencesData?.loadAllPreferencesRaw || typeof window.PreferencesData.loadAllPreferencesRaw !== 'function') {
      window.Logger?.warn?.('[PreferencesAPIClient] loadAllPreferencesRaw API is not available', { page: 'preferences-core-new' });
      return null;
    }
    
    window.Logger?.debug?.('🔍 PreferencesAPIClient.getAllPreferences calling loadAllPreferencesRaw', {
      page: 'preferences-core-new',
      userId: userId || this.defaultUserId,
      profileId,
    });
    
    const payload = await window.PreferencesData.loadAllPreferencesRaw({
      userId: userId || this.defaultUserId,
      profileId,
      force: true,
    });

    window.Logger?.debug?.('🔍 PreferencesAPIClient.getAllPreferences received payload', {
      page: 'preferences-core-new',
      userId: userId || this.defaultUserId,
      profileId,
      preferencesCount: payload?.preferences 
        ? (Array.isArray(payload.preferences) 
            ? payload.preferences.length 
            : Object.keys(payload.preferences).length)
        : 0,
    });

    const result = {
      preferences: payload.preferences || {},
      profileContext: payload.profileContext || null,
      requestedProfileId: payload.requestedProfileId ?? null,
      resolvedProfileId: payload.resolvedProfileId ?? null,
    };
    
    window.Logger?.debug?.('🔍 PreferencesAPIClient.getAllPreferences returning result', {
      page: 'preferences-core-new',
      preferencesCount: Object.keys(result.preferences || {}).length,
      preferencesSample: Object.fromEntries(Object.entries(result.preferences || {}).slice(0, 5)),
    });

    return result;
  }

  /**
     * Get group preferences
     * @param {string} groupName - Group name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Group preferences
     */
  async getGroupPreferences(groupName, userId = null, profileId = null) {
    const result = await window.PreferencesData.loadPreferenceGroup({
      groupName,
      userId: userId || this.defaultUserId,
      profileId,
      force: true,
    });
    return {
      preferences: result?.preferences || {},
      profileContext: result?.profileContext || null,
      requestedProfileId: result?.requestedProfileId ?? null,
      resolvedProfileId: result?.resolvedProfileId ?? null,
    };
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
    const result = await window.PreferencesData.savePreference({
      preferenceName,
      value,
      userId: userId || this.defaultUserId,
      profileId,
    });
    return result?.success !== false;
  }

  /**
     * Save multiple preferences
     * @param {Object} preferences - Preferences object
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Save results
     */
  async savePreferences(preferences, userId = null, profileId = null) {
    const result = await window.PreferencesData.savePreferences({
      preferences,
      userId: userId || this.defaultUserId,
      profileId,
    });

    if (result?.success === false) {
      return {
        saved: 0,
        errors: Object.keys(preferences).length,
        details: Object.keys(preferences).reduce((acc, key) => {
          acc[key] = { status: 'error', message: result.error || 'Save failed' };
          return acc;
        }, {}),
      };
    }

    return {
      saved: Object.keys(preferences).length,
      errors: 0,
      details: Object.keys(preferences).reduce((acc, key) => {
        acc[key] = { status: 'success' };
        return acc;
      }, {}),
    };
  }
}

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

/**
 * Preferences Cache Manager
 * Handles caching with TTL and invalidation
 */
// PreferencesCacheManager removed - using UnifiedCacheManager instead

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
    this.validators.set('string', value => typeof value === 'string');

    // Number validators
    this.validators.set('number', value => typeof value === 'number' && !isNaN(value));

    // Boolean validators
    this.validators.set('boolean', value => typeof value === 'boolean');

    // JSON validators
    this.validators.set('json', value => {
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
      // window.Logger.warn(`⚠️ No validator for data type: ${dataType}`, { page: "preferences-core-new" });
      return true; // Allow unknown types
    }

    const isValid = validator(value);
    if (!isValid) {
      // window.Logger.warn(`⚠️ Validation failed for ${preferenceName}: expected ${dataType}, got ${typeof value}`, { page: "preferences-core-new" });
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
      return await window.PreferencesData.checkPreferenceExists(preferenceName);
    } catch (error) {
      // window.Logger.error(`❌ Error checking preference existence:`, error, { page: "preferences-core-new" });
      return false;
    }
  }
}

// ============================================================================
// MAIN PREFERENCES CORE CLASS
// ============================================================================
// Note: ProfileManager is now in preferences-profiles.js

/**
 * Main Preferences Core System
 * Coordinates all preference operations
 */
class PreferencesCore {
  constructor() {
    this.apiClient = new PreferencesAPIClient();
    // NO cacheManager - using UnifiedCacheManager!
    this.validationManager = new PreferencesValidationManager();
    // Note: ProfileManager is now in preferences-profiles.js (window.ProfileManager)

    this.currentUserId = 1; // Nimrod
    this.currentProfileId = null; // Will be loaded from server
    this.latestProfileContext = null;
    this.defaultPreferenceCache = new Map();
    this.defaultPreferenceEndpointAvailable = true;
    // High-level deduplication registry
    this._getAllPreferencesInflight = new Map();
  }

  /**
     * Get latest profile context metadata
     * @returns {Object|null} Profile context
     */
  getLatestProfileContext() {
    return this.latestProfileContext;
  }

  /**
     * Get default preference value from preference_types table
     * @param {string} preferenceName - Name of the preference
     * @returns {Promise<any>} Default preference value
     */
  async getDefaultPreference(preferenceName) {
    if (this.defaultPreferenceCache.has(preferenceName)) {
      return this.defaultPreferenceCache.get(preferenceName);
    }
    if (this.defaultPreferenceEndpointAvailable === false) {
      return null;
    }

    if (!window.PreferencesData?.loadDefaultPreference) {
      window.Logger?.warn?.('[PreferencesCore] loadDefaultPreference API is not available', { page: 'preferences-core-new' });
      this.defaultPreferenceCache.set(preferenceName, null);
      return null;
    }

    try {
      const defaultValue = await window.PreferencesData.loadDefaultPreference(preferenceName, {
        userId: this.currentUserId || this.defaultUserId,
        profileId: this.currentProfileId,
        force: true,
      });
      this.defaultPreferenceCache.set(preferenceName, defaultValue);
      return defaultValue;
    } catch (error) {
      this.defaultPreferenceEndpointAvailable = false;
      this.defaultPreferenceCache.set(preferenceName, null);
      window.Logger?.debug?.(`⚠️ Error getting default preference ${preferenceName}: ${error?.message}`, { page: 'preferences-core-new' });
      return null;
    }
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
    // For default profile, use 0 explicitly
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    const cacheKey = `preference_${preferenceName}_${finalUserId}_${finalProfileId}`;

    // Use UnifiedCacheManager with fallback to localStorage if not initialized
    if (window.UnifiedCacheManager) {
      // Check if UnifiedCacheManager is initialized
      const isInitialized = window.UnifiedCacheManager.initialized === true;

      let cached = null;
      if (isInitialized) {
        cached = await window.UnifiedCacheManager.get(cacheKey, {
          layer: 'localStorage',
          ttl: 300000, // 5 minutes
        });
      } else {
        // Fallback to localStorage directly if UnifiedCacheManager not initialized
        try {
          const stored = localStorage.getItem(cacheKey);
          if (stored !== null) {
            const parsed = JSON.parse(stored);
            // Check if cache is still valid (if has timestamp)
            if (parsed && (!parsed.timestamp || Date.now() - parsed.timestamp < 300000)) {
              cached = parsed.value;
            }
          }
        } catch (e) {
          // localStorage fallback failed - continue to API
        }
      }

      if (cached !== null) {
        window.Logger.debug(`🔍 CACHE DEBUG: Cache hit for ${preferenceName} = ${cached} (key: ${cacheKey}, { page: "preferences-core-new" })`);
        return cached;
      }
    }

    window.Logger.debug(`🔍 CACHE DEBUG: Cache miss for ${preferenceName} (key: ${cacheKey}, { page: "preferences-core-new" }) - loading from API`);

    // Check lazy loading if enabled
    if (useLazyLoading && window.LazyLoader) {
      const isLoaded = window.LazyLoader.isLoaded(preferenceName);
      if (!isLoaded) {
        window.Logger.debug(`🎯 Loading ${preferenceName} on demand via lazy loader`, { page: 'preferences-core-new' });
        // Load all preferences at once from API
        // Use force: false to leverage cache - only call API if cache is missing or expired
        // This prevents rate limiting after cache clear or hard refresh
        const preferencesDataApi = window.PreferencesData;
        if (preferencesDataApi?.loadAllPreferencesRaw) {
          try {
            const payload = await preferencesDataApi.loadAllPreferencesRaw({
              userId: finalUserId,
              profileId: finalProfileId,
              force: false, // Use cache if available - only fetch from API if cache is missing/expired
            });

            const allPreferences = payload?.preferences || {};
            const value = allPreferences[preferenceName];

            if (window.UnifiedCacheManager) {
              await window.UnifiedCacheManager.save(cacheKey, value, {
                layer: 'localStorage',
                ttl: 300000,
              });
            }

            return value;
          } catch (error) {
            window.Logger.error('❌ Error loading preferences:', error, { page: 'preferences-core-new' });
            return null;
          }
        } else {
          window.Logger?.warn?.('[PreferencesCore] loadAllPreferencesRaw API is not available - returning null', { page: 'preferences-core-new' });
          return null;
        }
      }
    }

    try {
      // Load from API
      const value = await this.apiClient.getPreference(
        preferenceName,
        finalUserId,
        finalProfileId,
      );

      // Save to UnifiedCacheManager
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.save(cacheKey, value, {
          layer: 'localStorage',
          ttl: 300000,
        });
      }

      window.Logger.info(`✅ Loaded preference ${preferenceName}:`, value, { page: 'preferences-core-new' });
      return value;

    } catch (error) {
      window.Logger.error(`❌ Error loading preference ${preferenceName}:`, error, { page: 'preferences-core-new' });
      return null;
    }
  }

  /**
   * Get all preferences with lazy loading
   * @function PreferencesCore.getAllPreferences
   * @param {number} [userId=null] - User ID (uses currentUserId if not provided)
   * @param {number} [profileId=null] - Profile ID (uses currentProfileId if not provided, 0 for default)
   * @param {Array<string>} [criticalPrefs=[]] - Critical preferences to load immediately
   * @returns {Promise<Object>} Preferences object with all preference values
   * @example
   * const allPrefs = await window.PreferencesCore.getAllPreferences(1, 2);
   */
  async getAllPreferences(userId = null, profileId = null, criticalPrefs = [], forceRefresh = false) {
// For default profile, use 0 explicitly
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    // High-level deduplication: prevent duplicate calls with same params
    const dedupeKey = `getAllPreferences:u${finalUserId}:p${finalProfileId}`;
    if (this._getAllPreferencesInflight.has(dedupeKey)) {
      window.Logger?.debug?.('⏭️ PreferencesCore.getAllPreferences deduplicated - returning existing promise', {
        page: 'preferences-core-new',
        dedupeKey,
      });
      return await this._getAllPreferencesInflight.get(dedupeKey);
    }

    const loadPromise = (async () => {
      try {
        const cacheKey = `all_preferences_${finalUserId}_${finalProfileId}`;

        // If forceRefresh is true, skip cache and load from server
        if (!forceRefresh) {
          // Check cache first via UnifiedCacheManager
          if (window.UnifiedCacheManager) {
            const cached = await window.UnifiedCacheManager.get(cacheKey, {
              layer: 'localStorage',
              ttl: 300000,
            });
            if (cached !== null) {
              window.Logger.info('✅ Cache hit for all preferences', { page: 'preferences-core-new' });
              return cached;
            }
          }
        } else {
          // Force refresh: clear cache first
          window.Logger.info('🔄 Force refresh: clearing cache before loading from server', { page: 'preferences-core-new' });
          if (window.UnifiedCacheManager) {
            await window.UnifiedCacheManager.remove(cacheKey, { layer: 'localStorage' });
            const prefixedKey = `tiktrack_${cacheKey}`;
            await window.UnifiedCacheManager.remove(prefixedKey, { layer: 'localStorage' });
          }
        }

        try {
          // Load critical preferences first
          const criticalPreferences = {};
          if (criticalPrefs.length > 0) {
            for (const prefName of criticalPrefs) {
              criticalPreferences[prefName] = await this.getPreference(prefName, finalUserId, finalProfileId);
            }
          }

          // Load all preferences
          window.Logger?.debug?.('🔍 Calling apiClient.getAllPreferences', {
            page: 'preferences-core-new',
            userId: finalUserId,
            profileId: finalProfileId,
          });
          
          const apiResult = await this.apiClient.getAllPreferences(
            finalUserId,
            finalProfileId,
          );
          
          window.Logger?.debug?.('🔍 apiClient.getAllPreferences result', {
            page: 'preferences-core-new',
            userId: finalUserId,
            profileId: finalProfileId,
            preferencesCount: Array.isArray(apiResult?.preferences) ? apiResult.preferences.length : Object.keys(apiResult?.preferences || {}).length,
          });
          
          let allPreferences = apiResult.preferences || {};
          
          window.Logger?.debug?.('🔍 Extracted preferences from API result', {
            page: 'preferences-core-new',
            userId: finalUserId,
            profileId: finalProfileId,
            allPreferencesCount: Object.keys(allPreferences).length,
          });
          const profileContext = apiResult.profileContext || null;
          const effectiveProfileId = profileContext && profileContext.resolved_profile_id !== null && profileContext.resolved_profile_id !== undefined
            ? profileContext.resolved_profile_id
            : finalProfileId;

          if (profileContext) {
            this.latestProfileContext = profileContext;
            if (profileContext.resolved_profile_id !== null && profileContext.resolved_profile_id !== undefined) {
              this.currentProfileId = profileContext.resolved_profile_id;
            }
            if (profileContext.user?.id) {
              this.currentUserId = profileContext.user.id;
            } else {
              this.currentUserId = finalUserId;
            }
          } else {
            this.currentProfileId = effectiveProfileId;
            this.currentUserId = finalUserId;
          }

          // If no preferences loaded, load all default values from preference_types table
          // This ensures the system always has default values to work with
          if (Object.keys(allPreferences).length === 0) {
            window.Logger?.info?.('⚠️ No user preferences found, loading default values from preference_types table', {
              page: 'preferences-core-new',
              userId: finalUserId,
              profileId: effectiveProfileId,
            });
            
            try {
              // Try to load preference types metadata to get all preference names
              if (window.PreferencesData && typeof window.PreferencesData.loadPreferenceTypes === 'function') {
                const typesData = await window.PreferencesData.loadPreferenceTypes({ force: false });
                const types = typesData?.types || typesData?.data?.types || typesData || [];
                
                if (Array.isArray(types) && types.length > 0) {
                  // Load default value for each preference type
                  const defaultPreferences = {};
                  for (const prefType of types) {
                    const prefName = prefType?.preference_name || prefType?.name || prefType?.html_id;
                    if (!prefName) continue;
                    
                    try {
                      const defaultValue = await this.getDefaultPreference(prefName);
                      if (defaultValue !== null && defaultValue !== undefined) {
                        defaultPreferences[prefName] = defaultValue;
                      } else if (prefType?.default_value !== null && prefType?.default_value !== undefined) {
                        // Fallback: use default_value from types data if available
                        defaultPreferences[prefName] = prefType.default_value;
                      }
                    } catch (defaultError) {
                      // Non-critical - continue loading other defaults
                      window.Logger?.debug?.(`⚠️ Failed to load default for ${prefName}: ${defaultError?.message}`, {
                        page: 'preferences-core-new',
                      });
                    }
                  }
                  
                  if (Object.keys(defaultPreferences).length > 0) {
                    allPreferences = defaultPreferences;
                    window.Logger?.info?.(`✅ Loaded ${Object.keys(defaultPreferences).length} default preferences`, {
                      page: 'preferences-core-new',
                    });
                  }
                }
              }
            } catch (defaultLoadError) {
              window.Logger?.warn?.('⚠️ Failed to load default preferences, continuing with empty preferences', {
                page: 'preferences-core-new',
                error: defaultLoadError?.message,
              });
            }
          }

          // Merge critical preferences
          const result = { ...allPreferences, ...criticalPreferences };

          // Cache the result via UnifiedCacheManager
          if (window.UnifiedCacheManager) {
            const cacheKeyForSave = `all_preferences_${finalUserId}_${effectiveProfileId}`;
            await window.UnifiedCacheManager.save(cacheKeyForSave, result, {
              layer: 'localStorage',
              ttl: 300000,
            });
          }

          window.Logger.info(`✅ Loaded ${Object.keys(result).length} preferences`, { page: 'preferences-core-new' });
          return result;
        } catch (error) {
          window.Logger.error('❌ Error loading all preferences:', error, { page: 'preferences-core-new' });
          return {};
        }
      } catch (error) {
        window.Logger.error('❌ Error in getAllPreferences outer try:', error, { page: 'preferences-core-new' });
        return {};
      } finally {
        this._getAllPreferencesInflight.delete(dedupeKey);
      }
    })();
      
      this._getAllPreferencesInflight.set(dedupeKey, loadPromise);
      return await loadPromise;
    }

  /**
   * Save single preference with strict validation
   * @function PreferencesCore.savePreference
   * @param {string} preferenceName - Preference name
   * @param {any} value - Preference value
   * @param {number} [userId=null] - User ID (uses currentUserId if not provided)
   * @param {number} [profileId=null] - Profile ID (uses currentProfileId if not provided, 0 for default)
   * @param {string} [dataType='string'] - Data type for validation
   * @returns {Promise<Object>} Save result with validation status
   * @throws {ValidationError} If validation fails
   * @example
   * await window.PreferencesCore.savePreference('primaryCurrency', 'EUR', 1, 2);
   */
  async savePreference(preferenceName, value, userId = null, profileId = null, dataType = 'string') {
    try {
      // Strict validation if available
      if (window.PreferenceValidator) {
        window.Logger.info(`🔍 Validating preference ${preferenceName} before save...`, { page: 'preferences-core-new' });

        const validationResult = await window.PreferenceValidator.validatePreference(
          preferenceName,
          value,
          dataType,
        );

        if (!validationResult.valid) {
          const errorMessages = validationResult.errors.map(e => e.message).join(', ');
          throw new ValidationError(`Validation failed for ${preferenceName}: ${errorMessages}`);
        }

        window.Logger.info(`✅ Validation passed for ${preferenceName}`, { page: 'preferences-core-new' });
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
        profileId || this.currentProfileId,
      );

      if (success) {
        window.Logger.info(`✅ Saved preference ${preferenceName}:`, value, { page: 'preferences-core-new' });

        // ✅ מוחק cache אחרי שמירה מוצלחת
        await this.invalidatePreference(preferenceName, userId, profileId);

        return {
          success: true,
          validation: { valid: true, errors: [] },
        };
      } else {
        return {
          success: false,
          validation: { valid: true, errors: [] },
          error: 'Save failed',
        };
      }

    } catch (error) {
      window.Logger.error(`❌ Error saving preference ${preferenceName}:`, error, { page: 'preferences-core-new' });
      return {
        success: false,
        validation: { valid: false, errors: [error] },
        error: error.message,
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
      details: {},
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

    // Invalidate all preferences cache via UnifiedCacheManager
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.remove(`all_preferences_${userId || this.currentUserId}_${profileId || this.currentProfileId}`);
    }

    window.Logger.info(`✅ Saved ${results.saved} preferences, ${results.errors} errors`, { page: 'preferences-core-new' });
    return results;
  }

  /**
     * Clear cache - now handled by UnifiedCacheManager
     */
  clearCache() {
    // Cache clearing is now handled by UnifiedCacheManager
    window.Logger.info('🧹 Cache clearing handled by UnifiedCacheManager', { page: 'preferences-core-new' });
  }

  /**
     * Invalidate single preference cache
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async invalidatePreference(preferenceName, userId = null, profileId = null) {
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ?
      profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    // מוחק cache של preference בודד
    const cacheKey = `preference_${preferenceName}_${finalUserId}_${finalProfileId}`;
    if (window.UnifiedCacheManager) {
      // מוחק את ה-key עם prefix (tiktrack_)
      await window.UnifiedCacheManager.remove(cacheKey, { layer: 'localStorage' });
      // מוחק גם את ה-key עם prefix
      const prefixedKey = `tiktrack_${cacheKey}`;
      await window.UnifiedCacheManager.remove(prefixedKey, { layer: 'localStorage' });
    }

    // מוחק גם את all_preferences_* cache
    const allPrefsKey = `all_preferences_${finalUserId}_${finalProfileId}`;
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.remove(allPrefsKey, { layer: 'localStorage' });
      const prefixedAllPrefsKey = `tiktrack_${allPrefsKey}`;
      await window.UnifiedCacheManager.remove(prefixedAllPrefsKey, { layer: 'localStorage' });
    }

    window.Logger.info(`🧹 Invalidated preference cache: ${preferenceName}`, { page: 'preferences-core-new' });
  }

  /**
     * Invalidate specific preferences (multiple)
     * @param {Array<string>} preferenceNames - Preference names to invalidate
     */
  async invalidatePreferences(preferenceNames) {
    for (const name of preferenceNames) {
      await this.invalidatePreference(name);
    }
    window.Logger.info(`🧹 Invalidated ${preferenceNames.length} preferences`, { page: 'preferences-core-new' });
  }

  /**
     * Load group preferences with caching
     * @param {string} groupName - Group name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Group preferences
     */
  async loadGroupPreferences(groupName, userId = null, profileId = null) {
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    // Cache key for group
    const cacheKey = `preference_group_${groupName}_${finalUserId}_${finalProfileId}`;

    // Check cache
    if (window.UnifiedCacheManager) {
      const cached = await window.UnifiedCacheManager.get(cacheKey, {
        layer: 'localStorage',
        ttl: 300000, // 5 minutes
      });

      if (cached !== null) {
        window.Logger.debug(`🔍 Cache hit for group ${groupName}`, { page: 'preferences-core-new' });
        return cached;
      }
    }

    // Load from server
    window.Logger.info(`📥 Loading group ${groupName} from server...`, { page: 'preferences-core-new' });
    const groupResponse = await this.apiClient.getGroupPreferences(
      groupName,
      finalUserId,
      finalProfileId,
    );
    const preferences = groupResponse.preferences || {};
    const groupProfileContext = groupResponse.profileContext || null;
    const effectiveProfileId = groupProfileContext && groupProfileContext.resolved_profile_id !== null && groupProfileContext.resolved_profile_id !== undefined
      ? groupProfileContext.resolved_profile_id
      : finalProfileId;

    if (groupProfileContext) {
      this.latestProfileContext = groupProfileContext;
      if (groupProfileContext.resolved_profile_id !== null && groupProfileContext.resolved_profile_id !== undefined) {
        this.currentProfileId = groupProfileContext.resolved_profile_id;
      }
      if (groupProfileContext.user?.id) {
        this.currentUserId = groupProfileContext.user.id;
      }
    }

    // Save to cache
    if (window.UnifiedCacheManager) {
      const cacheKeyForSave = `preference_group_${groupName}_${finalUserId}_${effectiveProfileId}`;
      await window.UnifiedCacheManager.save(cacheKeyForSave, preferences, {
        layer: 'localStorage',
        ttl: 300000,
      });
    }

    window.Logger.info(`✅ Loaded ${Object.keys(preferences).length} preferences from group ${groupName}`, { page: 'preferences-core-new' });
    return preferences;
  }

  /**
     * Save group preferences
     * @param {string} groupName - Group name
     * @param {Object} preferences - Preferences to save
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<Object>} Save results
     */
  async saveGroupPreferences(groupName, preferences, userId = null, profileId = null) {
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    // Save to server
    const results = await this.savePreferences(preferences, finalUserId, finalProfileId);

    // Clear cache for this group
    await this.clearGroupCache(groupName, finalUserId, finalProfileId);

    window.Logger.info(`✅ Saved ${results.saved} preferences from group ${groupName}`, { page: 'preferences-core-new' });
    return results;
  }

  /**
     * Clear cache for specific group
     * @param {string} groupName - Group name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async clearGroupCache(groupName, userId = null, profileId = null) {
    const finalUserId = userId || this.currentUserId;
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : this.currentProfileId !== null ? this.currentProfileId : 0;

    const cacheKey = `preference_group_${groupName}_${finalUserId}_${finalProfileId}`;

    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.remove(cacheKey);
      window.Logger.debug(`🧹 Cleared cache for group ${groupName}`, { page: 'preferences-core-new' });
    }
  }

  /**
     * Set current profile
     * Note: Cache clearing is handled by ProfileManager.switchProfile()
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async setCurrentProfile(userId, profileId) {
    if (window.Logger) {
      window.Logger.info(`🔄 Setting current profile to user ${userId}, profile ${profileId}`, { page: 'preferences-core-new' });
    }
    this.currentUserId = userId;
    this.currentProfileId = profileId;

    // Update PreferencesUI if available
    if (window.PreferencesUI) {
      window.PreferencesUI.currentProfileId = profileId;
    }

    // Note: Cache clearing is handled by ProfileManager.switchProfile()
    // via UnifiedCacheManager.refreshUserPreferences()

    if (window.Logger) {
      window.Logger.info('✅ Profile updated in PreferencesCore', { page: 'preferences-core-new' });
    }
  }

  /**
     * Initialize with lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async initializeWithLazyLoading(userId = null, profileId = null) {
    try {
      window.Logger.info('🚀 Initializing preferences with lazy loading...', { page: 'preferences-core-new' });

      // Update current profile if provided
      if (userId !== null && profileId !== null) {
        await this.setCurrentProfile(userId, profileId);
      }

      // Initialize lazy loader if available
      if (window.LazyLoader) {
        // Ensure profileId is explicitly set (null means use active profile from server, not 0 or 1)
        const finalUserId = userId || this.currentUserId || 1;
        // If profileId is null/undefined, pass null to let server determine active profile
        // Don't use cached currentProfileId if it might be stale (e.g., from SQLite migration)
        const finalProfileId = profileId !== null && profileId !== undefined ? profileId : null;

        await window.LazyLoader.initialize(
          finalUserId,
          finalProfileId,
        );
        window.Logger.info('✅ Lazy loading initialized', { page: 'preferences-core-new' });
      } else {
        window.Logger.warn('⚠️ LazyLoader not available, using standard loading', { page: 'preferences-core-new' });
        // Fallback to standard loading
        await this.getAllPreferences(userId, profileId);
      }

    } catch (error) {
      window.Logger.error('❌ Error initializing lazy loading:', error, { page: 'preferences-core-new' });
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
 * Get current (cached) preference value with smart fallbacks.
 * Used by systems that expect an immediate value for risk calculations and defaults.
 * @param {string} preferenceName
 * @param {Object} options
 * @returns {Promise<any>}
 */
window.getCurrentPreference = async function(preferenceName, options = {}) {
  const {
    userId = null,
    profileId = null,
    fallbackValue = null,
    includeDefaultValue = true,
    fallbackToLocalStorage = true,
  } = options;

  try {
    if (window.currentPreferences && Object.prototype.hasOwnProperty.call(window.currentPreferences, preferenceName)) {
      const currentValue = window.currentPreferences[preferenceName];
      if (currentValue !== undefined) {
        return currentValue;
      }
    }

    if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
      const value = await window.PreferencesCore.getPreference(preferenceName, userId, profileId);
      if (value !== null && value !== undefined) {
        return value;
      }

      if (includeDefaultValue !== false && typeof window.PreferencesCore.getDefaultPreference === 'function') {
        const defaultValue = await window.PreferencesCore.getDefaultPreference(preferenceName);
        if (defaultValue !== null && defaultValue !== undefined) {
          return defaultValue;
        }
      }
    }
  } catch (error) {
    window.Logger?.warn?.('⚠️ getCurrentPreference failed, falling back to local storage', {
      preferenceName,
      error: error?.message,
    }, { page: 'preferences-core-new' });
  }

  if (fallbackToLocalStorage !== false) {
    try {
      const preferences = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
      if (Object.prototype.hasOwnProperty.call(preferences, preferenceName)) {
        return preferences[preferenceName];
      }
    } catch (storageError) {
      window.Logger?.warn?.('⚠️ getCurrentPreference localStorage fallback failed', {
        preferenceName,
        error: storageError?.message,
      }, { page: 'preferences-core-new' });
    }
  }

  return fallbackValue;
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

/**
 * Initialize preferences (legacy alias)
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.initializePreferences = async function(userId = null, profileId = null) {
  if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
    return await window.PreferencesUI.loadAllPreferences(
      userId ?? window.PreferencesCore?.currentUserId ?? 1,
      profileId,
    );
  }

  if (typeof window.initializePreferencesWithLazyLoading === 'function') {
    return await window.initializePreferencesWithLazyLoading(userId, profileId);
  }

  return await window.PreferencesCore.getAllPreferences(userId, profileId);
};

// window.refreshUserPreferences removed - using UnifiedCacheManager.refreshUserPreferences instead

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.Logger && window.Logger.info) {
      window.Logger.info('📄 Preferences core system initialized', { page: 'preferences-core-new' });
    }
  });
} else {
  if (window.Logger && window.Logger.info) {
    window.Logger.info('📄 Preferences core system initialized', { page: 'preferences-core-new' });
  }
}

// Event listener removed - UnifiedCacheManager handles preferences refresh directly

if (window.Logger && window.Logger.info) {
  window.Logger.info('✅ preferences-core.js loaded successfully', { page: 'preferences-core-new' });
}
