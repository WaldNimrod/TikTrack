/**
 * Preferences Lazy Loader - TikTrack
 * ==================================
 *
 * Lazy loading system for preferences
 * Loads critical preferences immediately, non-critical on demand
 *
 * @version 1.0.0
 * @date January 23, 2025
 * @author TikTrack Development Team
 *
 * @description
 * Smart lazy loading system with:
 * - Critical vs non-critical classification
 * - Priority-based loading
 * - Background loading for non-critical
 * - User interaction triggers
 * - Performance optimization
 *
 * @architecture
 * - PreferenceClassifier: Classifies preferences by importance
 * - LazyLoader: Handles lazy loading logic
 * - PriorityManager: Manages loading priorities
 * - BackgroundLoader: Background loading for non-critical
 */

// window.Logger.info('📄 Loading preferences-lazy-loader.js v1.0.0...', { page: "preferences-lazy-loader" });

// ============================================================================
// PREFERENCE CLASSIFIER
// ============================================================================

/**
 * Preference Classification System
 * Classifies preferences by importance and usage patterns
 */
class PreferenceClassifier {
  constructor() {
    this.classifications = {
      // CRITICAL - Load immediately (affects core functionality)
      critical: [
        // User settings
        'default_trading_account',
        'defaultCommission',
        'defaultStopLoss',
        'defaultTargetPrice',

        // Core display
        'pagination_size_default',

        // Essential notifications
        'enableNotifications',
        'enableRealtimeNotifications',
        'notificationSound',
        'notificationPopup',

        // Core colors (most used)
        'primaryColor',
        'secondaryColor',
        'backgroundColor',
        'textColor',
        'timezone',
        'linkColor',
        'dangerColor',
        'successColor',
        'warningColor',
        'infoColor',
      ],

      // HIGH - Load on page load (important for UX)
      high: [
        // Chart settings
        'chartQuality',
        'chartInteractive',
        'chartShowTooltips',
        'chartAutoRefresh',
        'chartRefreshInterval',

        // Note: colors are loaded via the unified colors system (group/all),
        // so we avoid point-fetching color preferences here to prevent 404s
        // when specific color keys are not defined as standalone preferences.

        // Filter defaults
        'defaultDateRangeFilter',
        'defaultStatusFilter',
        'defaultTypeFilter',
        'defaultSearchFilter',

        // Notification settings
        'enableBackgroundTaskNotifications',
        'enableDataUpdateNotifications',
        'enableExternalDataNotifications',
        'enableSystemEventNotifications',
        'notifyOnTradeExecuted',
        'notifyOnStopLoss',
        'notificationDuration',
        'notificationMaxHistory',
      ],

      // MEDIUM - Load on user interaction
      medium: [
        // Chart colors
        'chartBackgroundColor',
        'chartBorderColor',
        'chartGridColor',
        'chartPointColor',
        'chartPrimaryColor',
        'chartTextColor',

        // Entity colors
        'entityAlertColor',
        'entityAlertColorDark',
        'entityAlertColorLight',
        'entityInfoColor',
        'entityInfoColorDark',
        'entityInfoColorLight',

        // Value color variants
        'valuePositiveColorLight',
        'valuePositiveColorDark',
        'valueNegativeColorLight',
        'valueNegativeColorDark',
        'valueNeutralColorLight',
        'valueNeutralColorDark',

        // Chart advanced
        'chartAnimations',
        'chartExportBackground',
        'chartExportFormat',
        'chartExportQuality',
        'chartExportResolution',
      ],

      // LOW - Load in background or on demand
      low: [
        // Console logs
        'console_logs_initialization_enabled',
        'console_logs_development_enabled',
        'console_logs_business_enabled',
        'console_logs_performance_enabled',
        'console_logs_system_enabled',
        'console_logs_ui_enabled',
        'console_logs_ui_components_enabled',
        'console_logs_cache_enabled',
        'console_logs_notifications_enabled',

        // Advanced chart settings
        'chartInteractive',
        'chartQuality',

        // UI preferences

        // Advanced colors
        'borderColor',
        'shadowColor',
        'highlightColor',
      ],
    };

    this.loadingOrder = ['critical', 'high', 'medium', 'low'];
  }

  /**
     * Classify a preference
     * @param {string} preferenceName - Preference name
     * @returns {string} Classification (critical, high, medium, low)
     */
  classify(preferenceName) {
    for (const [classification, preferences] of Object.entries(this.classifications)) {
      if (preferences.includes(preferenceName)) {
        return classification;
      }
    }
    return 'low'; // Default to low priority
  }

  /**
     * Get preferences by classification
     * @param {string} classification - Classification level
     * @returns {Array<string>} Preference names
     */
  getPreferencesByClassification(classification) {
    return this.classifications[classification] || [];
  }

  /**
     * Get all preferences sorted by priority
     * @returns {Array<Object>} Preferences with classification
     */
  getAllPreferencesSorted() {
    const result = [];

    for (const classification of this.loadingOrder) {
      const preferences = this.getPreferencesByClassification(classification);
      preferences.forEach(name => {
        result.push({
          name,
          classification,
          priority: this.loadingOrder.indexOf(classification),
        });
      });
    }

    return result;
  }
}

// ============================================================================
// LAZY LOADER CLASS
// ============================================================================

/**
 * Lazy Loading System
 * Handles smart loading of preferences
 */
class LazyLoader {
  constructor() {
    this.classifier = new PreferenceClassifier();
    this.loadedPreferences = new Set();
    this.loadingPromises = new Map();
    this.backgroundLoader = null;
    this.currentUserId = 1;
    this.currentProfileId = 0;
    this._bootedForKey = null;

    this.loadingStats = {
      critical: { loaded: 0, total: 0 },
      high: { loaded: 0, total: 0 },
      medium: { loaded: 0, total: 0 },
      low: { loaded: 0, total: 0 },
    };
  }

  /**
     * Initialize lazy loading
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID (0 for default profile)
     */
  async initialize(userId = 1, profileId = 0) {
    window.Logger.debug(`🚀 LazyLoader.initialize(userId=${userId}, profileId=${profileId})`, { page: 'preferences-lazy-loader' });

    // Check if PreferencesCore is available
    if (!window.PreferencesCore) {
      // window.Logger.warn('⚠️ PreferencesCore not available, skipping lazy loading initialization', { page: "preferences-lazy-loader" });
      return;
    }

    // Ensure profileId is explicitly set (0 for default profile, not null/undefined)
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : 0;
    window.Logger.debug(`🔍 LazyLoader using finalProfileId=${finalProfileId}`, { page: 'preferences-lazy-loader' });

    // Debounce duplicate initialize for same (user,profile) key
    const initKey = `${userId}:${finalProfileId}`;
    if (this._bootedForKey === initKey) {
      window.Logger.debug('⏭️ LazyLoader initialize skipped (same user/profile)', { page: 'preferences-lazy-loader' });
      return;
    }

    if (this.currentProfileId !== undefined && this.currentProfileId !== null && this.currentProfileId !== finalProfileId) {
      window.Logger.debug(`🔄 LazyLoader profile changed from ${this.currentProfileId} to ${finalProfileId} - clearing internal state`, { page: 'preferences-lazy-loader' });
      this.loadedPreferences.clear();
      this.loadingPromises.clear();
    }

    this.currentUserId = userId;
    this.currentProfileId = finalProfileId;
    this._bootedForKey = initKey;

    // Load critical preferences immediately
    await this.loadCriticalPreferences(userId, finalProfileId);

    // Start background loading for high priority
    this.startBackgroundLoading(userId, finalProfileId);

    // Dispatch all-loaded event after critical preferences are loaded
    // (background loading continues asynchronously)
    const environment = window.API_ENV || 'development';
    window.dispatchEvent(new CustomEvent('preferences:all-loaded', {
      detail: {
        userId,
        profileId,
        environment,
        criticalLoaded: this.loadingStats.critical.loaded,
        totalCritical: this.loadingStats.critical.total,
        note: 'Background loading continues for high/medium/low priority preferences',
      },
    }));

    // window.Logger.info('✅ Lazy loading system initialized', { page: "preferences-lazy-loader" });
  }

  /**
     * Load critical preferences immediately
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadCriticalPreferences(userId, profileId) {
    const loadStartTime = performance.now();
    const criticalPrefs = this.classifier.getPreferencesByClassification('critical');
    this.loadingStats.critical.total = criticalPrefs.length;

    // Detect environment
    const environment = window.API_ENV || 'development';
    
    // Check cache first to determine if we have a cache hit
    let fromCache = false;
    let cacheLayer = null;
    let allPreferences = {};

    try {
      // Check if we have cached preferences before making API call
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        const cacheKey = `preference_all_u${userId}_p${profileId ?? 'active'}`;
        const cached = await window.UnifiedCacheManager.get(cacheKey, { layer: 'localStorage' });
        if (cached && cached.preferences) {
          fromCache = true;
          cacheLayer = 'localStorage';
          allPreferences = cached.preferences;
          window.Logger?.debug?.('✅ Cache hit for critical preferences', {
            page: 'preferences-lazy-loader',
            cacheLayer,
            userId,
            profileId,
          });
          
          // Dispatch cache hit event
          window.dispatchEvent(new CustomEvent('preferences:cache-hit', {
            detail: {
              cacheLayer,
              userId,
              profileId,
              preferenceCount: Object.keys(allPreferences).length,
              environment,
            },
          }));
        }
      }

      // If not from cache, load from API
      if (!fromCache) {
        // Wait for PreferencesData to be available (with retry mechanism)
        let waitCount = 0;
        const maxWaitAttempts = 20; // 2 seconds total (20 * 100ms)
        while (!window.PreferencesData || typeof window.PreferencesData.loadAllPreferencesRaw !== 'function') {
          if (waitCount >= maxWaitAttempts) {
            window.Logger?.warn?.('[PreferencesLazyLoader] PreferencesData.loadAllPreferencesRaw API is not available after waiting - returning empty preferences', {
              page: 'preferences-lazy-loader',
              userId,
              profileId,
              waitTime: `${maxWaitAttempts * 100}ms`,
            });
            return { preferences: {}, userId, profileId, fromCache: false };
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
        
        if (waitCount > 0) {
          window.Logger?.debug?.('[PreferencesLazyLoader] PreferencesData became available after waiting', {
            page: 'preferences-lazy-loader',
            userId,
            profileId,
            waitTime: `${waitCount * 100}ms`,
          });
        }
        
        // Use force: false to leverage cache - only call API if cache is missing or expired
        // This prevents unnecessary API calls and rate limiting
        const payload = await window.PreferencesData.loadAllPreferencesRaw({
          userId,
          profileId,
          force: false, // Use cache if available - only fetch from API if cache is missing/expired
        });

        allPreferences = payload?.preferences || {};
        cacheLayer = 'backend';
        
        window.Logger?.debug?.('📡 Loaded critical preferences from API', {
          page: 'preferences-lazy-loader',
          cacheLayer,
          userId,
          profileId,
          count: Object.keys(allPreferences).length,
        });
        
        // Dispatch cache miss event
        window.dispatchEvent(new CustomEvent('preferences:cache-miss', {
          detail: {
            cacheLayer,
            userId,
            profileId,
            preferenceCount: Object.keys(allPreferences).length,
            environment,
          },
        }));
      }
      
      // If no preferences loaded (neither from cache nor API), load default values
      // This ensures the system always has default values to work with
      if (Object.keys(allPreferences).length === 0) {
        window.Logger?.info?.('⚠️ No user preferences found, loading default values from preference_types table', {
          page: 'preferences-lazy-loader',
          userId,
          profileId,
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
                  // Try to get default value from PreferencesCore
                  if (window.PreferencesCore && typeof window.PreferencesCore.getDefaultPreference === 'function') {
                    const defaultValue = await window.PreferencesCore.getDefaultPreference(prefName);
                    if (defaultValue !== null && defaultValue !== undefined) {
                      defaultPreferences[prefName] = defaultValue;
                    } else if (prefType?.default_value !== null && prefType?.default_value !== undefined) {
                      // Fallback: use default_value from types data if available
                      defaultPreferences[prefName] = prefType.default_value;
                    }
                  } else if (prefType?.default_value !== null && prefType?.default_value !== undefined) {
                    // Fallback: use default_value from types data if PreferencesCore not available
                    defaultPreferences[prefName] = prefType.default_value;
                  }
                } catch (defaultError) {
                  // Non-critical - continue loading other defaults
                  window.Logger?.debug?.(`⚠️ Failed to load default for ${prefName}: ${defaultError?.message}`, {
                    page: 'preferences-lazy-loader',
                  });
                }
              }
              
              if (Object.keys(defaultPreferences).length > 0) {
                allPreferences = defaultPreferences;
                cacheLayer = 'defaults';
                window.Logger?.debug?.(`✅ Loaded ${Object.keys(defaultPreferences).length} default preferences`, {
                  page: 'preferences-lazy-loader',
                });
              }
            }
          }
        } catch (defaultLoadError) {
          window.Logger?.warn?.('⚠️ Failed to load default preferences, continuing with empty preferences', {
            page: 'preferences-lazy-loader',
            error: defaultLoadError?.message,
          });
        }
      }

      // Mark critical preferences as loaded
      for (const prefName of criticalPrefs) {
        if (Object.prototype.hasOwnProperty.call(allPreferences, prefName)) {
          this.loadedPreferences.add(prefName);
          this.loadingStats.critical.loaded++;
        }
      }

      // Calculate load time
      const loadTime = performance.now() - loadStartTime;

      // CRITICAL: Update global preference stores so other systems can access them
      // This is essential for systems that check window.currentPreferences before event listeners are set up
      if (!window.currentPreferences) {
        window.currentPreferences = {};
      }
      if (!window.userPreferences) {
        window.userPreferences = {};
      }
      
      // CRITICAL: Update global preference stores with CORRECT userId/profileId
      // Merge loaded preferences into global stores (don't overwrite, merge to preserve any existing values)
      Object.assign(window.currentPreferences, allPreferences);
      Object.assign(window.userPreferences, allPreferences);
      
      // Update PreferencesCore state with CORRECT profile
      if (window.PreferencesCore) {
        window.PreferencesCore.currentUserId = userId;
        window.PreferencesCore.currentProfileId = profileId;
      }
      
      window.Logger?.debug?.('✅ Updated window.currentPreferences with loaded preferences', {
        page: 'preferences-lazy-loader',
        preferencesCount: Object.keys(allPreferences).length,
        currentPreferencesCount: Object.keys(window.currentPreferences).length,
        userId,
        profileId,
        note: 'Preferences loaded and merged into global stores',
      });

      // Set global flag to indicate preferences are loaded (for systems that check before listening)
      window.__preferencesCriticalLoaded = true;
      window.__preferencesCriticalLoadedDetail = {
        preferences: allPreferences,
        fromCache,
        cacheLayer,
        userId,
        profileId,
        loadTime: `${loadTime.toFixed(2)}ms`,
        environment,
        criticalCount: this.loadingStats.critical.loaded,
        totalCritical: this.loadingStats.critical.total,
        timestamp: Date.now(),
      };

      // Dispatch critical-loaded event with metadata
      window.dispatchEvent(new CustomEvent('preferences:critical-loaded', {
        detail: window.__preferencesCriticalLoadedDetail,
      }));

      window.Logger?.debug?.('✅ Critical preferences loaded', {
        page: 'preferences-lazy-loader',
        fromCache,
        cacheLayer,
        loadTime: `${loadTime.toFixed(2)}ms`,
        criticalCount: this.loadingStats.critical.loaded,
        totalCritical: this.loadingStats.critical.total,
      });

    } catch (error) {
      const loadTime = performance.now() - loadStartTime;
      window.Logger?.error?.('❌ Error loading critical preferences:', error, {
        page: 'preferences-lazy-loader',
        loadTime: `${loadTime.toFixed(2)}ms`,
      });
      
      // Fallback to individual loading
      const promises = criticalPrefs.map(async prefName => {
        try {
          const value = await this.loadSinglePreference(prefName, userId, profileId);
          this.loadedPreferences.add(prefName);
          this.loadingStats.critical.loaded++;
          return { name: prefName, value, success: true };
        } catch (error) {
          window.Logger?.warn?.(`⚠️ Failed to load critical preference ${prefName}:`, error, {
            page: 'preferences-lazy-loader',
          });
          return { name: prefName, value: null, success: false, error };
        }
      });

      await Promise.all(promises);
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('preferences:critical-loaded', {
        detail: {
          preferences: {},
          fromCache: false,
          cacheLayer: 'error',
          userId,
          profileId,
          loadTime: `${loadTime.toFixed(2)}ms`,
          environment,
          error: error?.message || String(error),
          criticalCount: this.loadingStats.critical.loaded,
          totalCritical: this.loadingStats.critical.total,
        },
      }));
    }
  }

  /**
     * Start background loading for high priority preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  startBackgroundLoading(userId, profileId) {
    if (this.backgroundLoader) {
      clearTimeout(this.backgroundLoader);
    }

    // Load high priority after a short delay
    this.backgroundLoader = setTimeout(async () => {
      await this.loadHighPriorityPreferences(userId, profileId);
    }, 100);

    // Load medium priority after longer delay
    setTimeout(async () => {
      await this.loadMediumPriorityPreferences(userId, profileId);
    }, 500);

    // Load low priority in background
    setTimeout(async () => {
      await this.loadLowPriorityPreferences(userId, profileId);
    }, 2000);
  }

  /**
     * Load high priority preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadHighPriorityPreferences(userId, profileId) {
    const highPrefs = this.classifier.getPreferencesByClassification('high');
    this.loadingStats.high.total = highPrefs.length;

    window.Logger.debug(`⚡ Loading ${highPrefs.length} high priority preferences...`, { page: 'preferences-lazy-loader' });

    // Load in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < highPrefs.length; i += batchSize) {
      const batch = highPrefs.slice(i, i + batchSize);
      const promises = batch.map(prefName => this.loadSinglePreference(prefName, userId, profileId));

      try {
        await Promise.all(promises);
        batch.forEach(prefName => {
          this.loadedPreferences.add(prefName);
          this.loadingStats.high.loaded++;
        });
      } catch (error) {
        window.Logger.warn('⚠️ Batch loading failed:', error, { page: 'preferences-lazy-loader' });
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    window.Logger.debug(`✅ Loaded ${this.loadingStats.high.loaded}/${highPrefs.length} high priority preferences`, { page: 'preferences-lazy-loader' });
  }

  /**
     * Load medium priority preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadMediumPriorityPreferences(userId, profileId) {
    const mediumPrefs = this.classifier.getPreferencesByClassification('medium');
    this.loadingStats.medium.total = mediumPrefs.length;

    window.Logger.debug(`📊 Loading ${mediumPrefs.length} medium priority preferences...`, { page: 'preferences-lazy-loader' });

    // Load in smaller batches
    const batchSize = 3;
    for (let i = 0; i < mediumPrefs.length; i += batchSize) {
      const batch = mediumPrefs.slice(i, i + batchSize);
      const promises = batch.map(prefName => this.loadSinglePreference(prefName, userId, profileId));

      try {
        await Promise.all(promises);
        batch.forEach(prefName => {
          this.loadedPreferences.add(prefName);
          this.loadingStats.medium.loaded++;
        });
      } catch (error) {
        window.Logger.warn('⚠️ Medium priority batch loading failed:', error, { page: 'preferences-lazy-loader' });
      }

      // Longer delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    window.Logger.debug(`✅ Loaded ${this.loadingStats.medium.loaded}/${mediumPrefs.length} medium priority preferences`, { page: 'preferences-lazy-loader' });
  }

  /**
     * Load low priority preferences
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadLowPriorityPreferences(userId, profileId) {
    const lowPrefs = this.classifier.getPreferencesByClassification('low');
    this.loadingStats.low.total = lowPrefs.length;

    if (lowPrefs.length === 0) {
      return;
    }

    window.Logger.debug(`🐌 Loading ${lowPrefs.length} low priority preferences in background...`, { page: 'preferences-lazy-loader' });

    // Load all low priority preferences at once to avoid multiple API calls
    // This prevents rate limiting after cache clear or hard refresh
    try {
      // Wait for PreferencesData to be available (with retry mechanism)
      let waitCount = 0;
      const maxWaitAttempts = 20; // 2 seconds total (20 * 100ms)
      while (!window.PreferencesData || typeof window.PreferencesData.loadAllPreferencesRaw !== 'function') {
        if (waitCount >= maxWaitAttempts) {
          window.Logger?.warn?.('[PreferencesLazyLoader] PreferencesData.loadAllPreferencesRaw API is not available after waiting - skipping low priority preferences', {
            page: 'preferences-lazy-loader',
            userId,
            profileId,
            waitTime: `${maxWaitAttempts * 100}ms`,
          });
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      
      if (waitCount > 0) {
        window.Logger?.debug?.('[PreferencesLazyLoader] PreferencesData became available after waiting (low priority)', {
          page: 'preferences-lazy-loader',
          userId,
          profileId,
          waitTime: `${waitCount * 100}ms`,
        });
      }
      
      // Use force: false to leverage cache - only call API if cache is missing or expired
      const payload = await window.PreferencesData.loadAllPreferencesRaw({
        userId,
        profileId,
        force: false, // Use cache if available - only fetch from API if cache is missing/expired
      });

      const allPreferences = payload?.preferences || {};

      // Mark all low priority preferences as loaded
      for (const prefName of lowPrefs) {
        if (Object.prototype.hasOwnProperty.call(allPreferences, prefName)) {
          this.loadedPreferences.add(prefName);
          this.loadingStats.low.loaded++;
        }
      }

      window.Logger.debug(`✅ Loaded ${this.loadingStats.low.loaded}/${lowPrefs.length} low priority preferences`, { page: 'preferences-lazy-loader' });
    } catch (error) {
      window.Logger.warn(`⚠️ Failed to load low priority preferences:`, error, { page: 'preferences-lazy-loader' });
      // Fallback: try loading individually (but this should rarely happen)
      for (const prefName of lowPrefs) {
        if (!this.loadedPreferences.has(prefName)) {
          try {
            await this.loadSinglePreference(prefName, userId, profileId);
            this.loadedPreferences.add(prefName);
            this.loadingStats.low.loaded++;
            // Delay between each preference to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            window.Logger.warn(`⚠️ Failed to load low priority preference ${prefName}:`, err, { page: 'preferences-lazy-loader' });
          }
        }
      }
    }
  }

  /**
     * Load single preference
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     * @returns {Promise<any>} Preference value
     */
  async loadSinglePreference(preferenceName, userId, profileId) {
    window.Logger.debug(`🔍 LAZY LOADER DEBUG: loadSinglePreference(${preferenceName}, userId=${userId}, profileId=${profileId})`, { page: 'preferences-lazy-loader' });

    // Check if already loading
    if (this.loadingPromises.has(preferenceName)) {
      return await this.loadingPromises.get(preferenceName);
    }

    // Check if PreferencesCore is available
    if (!window.PreferencesCore) {
      window.Logger.warn(`⚠️ PreferencesCore not available for ${preferenceName}`, { page: 'preferences-lazy-loader' });
      return null;
    }

    // Check if already loaded
    if (this.loadedPreferences.has(preferenceName)) {
      return await window.PreferencesCore.getPreference(preferenceName, userId, profileId);
    }

    // Ensure profileId is explicitly set (0 for default profile, not null/undefined)
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : 0;
    window.Logger.debug(`🔍 LAZY LOADER DEBUG: Using finalProfileId=${finalProfileId} for ${preferenceName}`, { page: 'preferences-lazy-loader' });

    // Create loading promise
    const promise = window.PreferencesCore.getPreference(preferenceName, userId, finalProfileId);
    this.loadingPromises.set(preferenceName, promise);

    try {
      const value = await promise;
      this.loadedPreferences.add(preferenceName);
      return value;
    } finally {
      this.loadingPromises.delete(preferenceName);
    }
  }

  /**
     * Load preference on demand
     * @param {string} preferenceName - Preference name
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID (0 for default profile)
     * @returns {Promise<any>} Preference value
     */
  async loadOnDemand(preferenceName, userId = 1, profileId = 0) {
    window.Logger.debug(`🎯 Loading preference on demand: ${preferenceName}`, { page: 'preferences-lazy-loader' });

    const classification = this.classifier.classify(preferenceName);
    window.Logger.debug(`📊 Classification: ${classification}`, { page: 'preferences-lazy-loader' });

    // Ensure profileId is explicitly set (0 for default profile, not null/undefined)
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : 0;

    return await this.loadSinglePreference(preferenceName, userId, finalProfileId);
  }

  /**
     * Get loading statistics
     * @returns {Object} Loading stats
     */
  getLoadingStats() {
    const total = Object.values(this.loadingStats).reduce((sum, stat) => sum + stat.total, 0);
    const loaded = Object.values(this.loadingStats).reduce((sum, stat) => sum + stat.loaded, 0);

    return {
      total,
      loaded,
      percentage: total > 0 ? Math.round(loaded / total * 100) : 0,
      byClassification: this.loadingStats,
      loadedPreferences: Array.from(this.loadedPreferences),
    };
  }

  /**
     * Check if preference is loaded
     * @param {string} preferenceName - Preference name
     * @returns {boolean} Is loaded
     */
  isLoaded(preferenceName) {
    return this.loadedPreferences.has(preferenceName);
  }

  /**
     * Get loaded preferences count
     * @returns {number} Count
     */
  getLoadedCount() {
    return this.loadedPreferences.size;
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Create global instance
window.LazyLoader = new LazyLoader();

// ============================================================================
// GLOBAL FUNCTIONS
// ============================================================================

/**
 * Initialize lazy loading system
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID
 */
window.initializeLazyLoading = async function(userId = 1, profileId = 0) {
  return await window.LazyLoader.initialize(userId, profileId);
};

/**
 * Load preference on demand
 * @param {string} preferenceName - Preference name
 * @param {number} userId - User ID
 * @param {number} profileId - Profile ID (0 for default profile)
 */
window.loadPreferenceOnDemand = async function(preferenceName, userId = 1, profileId = 0) {
  return await window.LazyLoader.loadOnDemand(preferenceName, userId, profileId);
};

/**
 * Get loading statistics
 */
window.getLazyLoadingStats = function() {
  return window.LazyLoader.getLoadingStats();
};

/**
 * Check if preference is loaded
 * @param {string} preferenceName - Preference name
 */
window.isPreferenceLoaded = function(preferenceName) {
  return window.LazyLoader.isLoaded(preferenceName);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.Logger && window.Logger.info) {
      window.Logger.debug('📄 Lazy loading system ready', { page: 'preferences-lazy-loader' });
    }
  });
} else {
  if (window.Logger && window.Logger.info) {
    window.Logger.debug('📄 Lazy loading system ready', { page: 'preferences-lazy-loader' });
  }
}

if (window.Logger && window.Logger.info) {
  window.Logger.debug('✅ preferences-lazy-loader.js loaded successfully', { page: 'preferences-lazy-loader' });
}
