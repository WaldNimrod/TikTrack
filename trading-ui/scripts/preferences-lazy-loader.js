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

        // Status colors
        'statusOpenColor',
        'statusClosedColor',
        'statusCancelledColor',

        // Notification colors
        'notificationSuccessColor',
        'notificationErrorColor',
        'notificationWarningColor',
        'notificationInfoColor',

        // Value colors
        'valuePositiveColor',
        'valueNegativeColor',
        'valueNeutralColor',

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
    window.Logger.info(`🚀 LAZY LOADER DEBUG: initialize(userId=${userId}, profileId=${profileId})`, { page: 'preferences-lazy-loader' });

    // Check if PreferencesCore is available
    if (!window.PreferencesCore) {
      // window.Logger.warn('⚠️ PreferencesCore not available, skipping lazy loading initialization', { page: "preferences-lazy-loader" });
      return;
    }

    // Ensure profileId is explicitly set (0 for default profile, not null/undefined)
    const finalProfileId = profileId !== null && profileId !== undefined ? profileId : 0;
    window.Logger.info(`🔍 LAZY LOADER DEBUG: Using finalProfileId=${finalProfileId}`, { page: 'preferences-lazy-loader' });

    if (this.currentProfileId !== undefined && this.currentProfileId !== null && this.currentProfileId !== finalProfileId) {
      window.Logger.info(`🔄 LAZY LOADER DEBUG: Profile changed from ${this.currentProfileId} to ${finalProfileId} - clearing internal state`, { page: 'preferences-lazy-loader' });
      this.loadedPreferences.clear();
      this.loadingPromises.clear();
    }

    this.currentUserId = userId;
    this.currentProfileId = finalProfileId;

    // Load critical preferences immediately
    await this.loadCriticalPreferences(userId, finalProfileId);

    // Start background loading for high priority
    this.startBackgroundLoading(userId, finalProfileId);

    // window.Logger.info('✅ Lazy loading system initialized', { page: "preferences-lazy-loader" });
  }

  /**
     * Load critical preferences immediately
     * @param {number} userId - User ID
     * @param {number} profileId - Profile ID
     */
  async loadCriticalPreferences(userId, profileId) {
    const criticalPrefs = this.classifier.getPreferencesByClassification('critical');
    this.loadingStats.critical.total = criticalPrefs.length;

    // window.Logger.info(`🔥 Loading ${criticalPrefs.length} critical preferences...`, { page: "preferences-lazy-loader" });

    try {
      const payload = await window.PreferencesData.loadAllPreferencesRaw({
        userId,
        profileId,
        force: true,
      });

      const allPreferences = payload?.preferences || {};

      // Mark critical preferences as loaded
      for (const prefName of criticalPrefs) {
        if (Object.prototype.hasOwnProperty.call(allPreferences, prefName)) {
          this.loadedPreferences.add(prefName);
          this.loadingStats.critical.loaded++;
        }
      }

    } catch (error) {
      // window.Logger.error('❌ Error loading critical preferences:', error, { page: "preferences-lazy-loader" });
      // Fallback to individual loading
      const promises = criticalPrefs.map(async prefName => {
        try {
          const value = await this.loadSinglePreference(prefName, userId, profileId);
          this.loadedPreferences.add(prefName);
          this.loadingStats.critical.loaded++;
          return { name: prefName, value, success: true };
        } catch (error) {
          // window.Logger.warn(`⚠️ Failed to load critical preference ${prefName}:`, error, { page: "preferences-lazy-loader" });
          return { name: prefName, value: null, success: false, error };
        }
      });

      await Promise.all(promises);
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

    window.Logger.debug(`🐌 Loading ${lowPrefs.length} low priority preferences in background...`, { page: 'preferences-lazy-loader' });

    // Load one by one with longer delays
    for (const prefName of lowPrefs) {
      try {
        await this.loadSinglePreference(prefName, userId, profileId);
        this.loadedPreferences.add(prefName);
        this.loadingStats.low.loaded++;
      } catch (error) {
        window.Logger.warn(`⚠️ Failed to load low priority preference ${prefName}:`, error, { page: 'preferences-lazy-loader' });
      }

      // Delay between each preference
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    window.Logger.debug(`✅ Loaded ${this.loadingStats.low.loaded}/${lowPrefs.length} low priority preferences`, { page: 'preferences-lazy-loader' });
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
      window.Logger.info('📄 Lazy loading system ready', { page: 'preferences-lazy-loader' });
    }
  });
} else {
  if (window.Logger && window.Logger.info) {
    window.Logger.info('📄 Lazy loading system ready', { page: 'preferences-lazy-loader' });
  }
}

if (window.Logger && window.Logger.info) {
  window.Logger.info('✅ preferences-lazy-loader.js loaded successfully', { page: 'preferences-lazy-loader' });
}
