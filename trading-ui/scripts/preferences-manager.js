/**
 * Preferences Manager - Central Manager
 * =====================================
 *
 * מנהל מרכזי למערכת העדפות - נקודת כניסה אחת
 *
 * תכונות:
 * - Single Source of Truth
 * - Optimistic Updates
 * - Smart Cache Management
 * - Event-Driven Architecture
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */


// ===== FUNCTION INDEX =====

// === Data Functions ===
// - loadPromise() - Loadpromise
// - savePromise() - Savepromise

// ============================================================================
// PREFERENCES MANAGER CLASS
// ============================================================================

class PreferencesManager {
  constructor() {
    this.initialized = false;
    this.currentUserId = null;
    this.currentProfileId = null;
    this.loadingPromises = new Map(); // Deduplication
    this.savingPromises = new Map(); // Deduplication
  }

  /**
   * Initialize preferences system
   * @param {number} userId - User ID
   * @param {number} profileId - Profile ID
   * @returns {Promise<void>}
   */
  async initialize(userId = null, profileId = null) {
    if (this.initialized) {
      window.Logger?.debug?.('PreferencesManager already initialized', {
        page: 'preferences-manager',
      });
      return;
    }

    window.Logger?.info?.('🚀 Initializing PreferencesManager...', {
      page: 'preferences-manager',
      userId,
      profileId,
    });

    // Resolve userId and profileId
    const finalUserId = userId || window.PreferencesCore?.currentUserId || 1;
    let finalProfileId = profileId;

    if (finalProfileId === null || finalProfileId === undefined) {
      finalProfileId = window.PreferencesCore?.currentProfileId ?? 0;
    }

    this.currentUserId = finalUserId;
    this.currentProfileId = finalProfileId;

    // Initialize cache if available
    if (window.PreferencesCache) {
      await window.PreferencesCache.initialize();
    }

    // Load critical preferences immediately
    if (window.PreferencesData) {
      try {
        const criticalPrefs = await this._loadCriticalPreferences(finalUserId, finalProfileId);
        if (criticalPrefs && Object.keys(criticalPrefs).length > 0) {
          // Update global state
          if (!window.currentPreferences) {
            window.currentPreferences = {};
          }
          Object.assign(window.currentPreferences, criticalPrefs);
        }
      } catch (error) {
        window.Logger?.warn?.('Failed to load critical preferences, continuing...', {
          page: 'preferences-manager',
          error: error?.message,
        });
      }
    }

    this.initialized = true;

    // Dispatch event
    if (window.PreferencesEvents) {
      window.PreferencesEvents.dispatch('preferences:initialized', {
        userId: finalUserId,
        profileId: finalProfileId,
      });
    }

    window.Logger?.info?.('✅ PreferencesManager initialized', {
      page: 'preferences-manager',
      userId: finalUserId,
      profileId: finalProfileId,
    });
  }

  /**
   * Load preference group
   * @param {string} groupName - Group name
   * @param {Object} options - Options
   * @returns {Promise<Object>} Preferences object
   */
  async loadGroup(groupName, options = {}) {
    const {
      userId = null,
      profileId = null,
      forceRefresh = false,
      useCache = true,
    } = options;

    const finalUserId = userId || this.currentUserId || 1;
    const finalProfileId = profileId !== null && profileId !== undefined
      ? profileId
      : (this.currentProfileId !== null && this.currentProfileId !== undefined ? this.currentProfileId : 0);

    // Deduplication
    const dedupeKey = `load_${groupName}_${finalUserId}_${finalProfileId}_${forceRefresh}`;
    if (this.loadingPromises.has(dedupeKey)) {
      window.Logger?.debug?.('⏭️ Load deduplicated', {
        page: 'preferences-manager',
        groupName,
        dedupeKey,
      });
      return await this.loadingPromises.get(dedupeKey);
    }

    const loadPromise = (async () => {
      try {
        window.Logger?.info?.(`📥 Loading group ${groupName}...`, {
          page: 'preferences-manager',
          userId: finalUserId,
          profileId: finalProfileId,
          forceRefresh,
        });

        // Try cache first (if not forcing refresh)
        if (useCache && !forceRefresh && window.PreferencesCache) {
          const cacheKey = window.PreferencesCache.buildKey('group', groupName, finalUserId, finalProfileId);
          const cached = await window.PreferencesCache.get(cacheKey);
          if (cached !== null) {
            window.Logger?.debug?.('🔍 Cache hit', {
              page: 'preferences-manager',
              groupName,
              cacheKey,
            });
            return cached;
          }
        }

        // Load from server
        let preferences = {};
        if (window.PreferencesData && typeof window.PreferencesData.loadGroupPreferences === 'function') {
          preferences = await window.PreferencesData.loadGroupPreferences(groupName, finalUserId, finalProfileId);
        } else if (window.PreferencesCore && typeof window.PreferencesCore.loadGroupPreferences === 'function') {
          preferences = await window.PreferencesCore.loadGroupPreferences(groupName, finalUserId, finalProfileId, forceRefresh);
        } else {
          throw new Error('No data source available for loading preferences');
        }

        // Save to cache
        if (window.PreferencesCache && preferences && Object.keys(preferences).length > 0) {
          const cacheKey = window.PreferencesCache.buildKey('group', groupName, finalUserId, finalProfileId);
          await window.PreferencesCache.set(cacheKey, preferences);
        }

        // Update global state
        if (!window.currentPreferences) {
          window.currentPreferences = {};
        }
        Object.assign(window.currentPreferences, preferences);

        window.Logger?.info?.(`✅ Loaded ${Object.keys(preferences).length} preferences from group ${groupName}`, {
          page: 'preferences-manager',
        });

        return preferences;
      } catch (error) {
        window.Logger?.error?.(`Failed to load group ${groupName}:`, error, {
          page: 'preferences-manager',
        });
        throw error;
      } finally {
        this.loadingPromises.delete(dedupeKey);
      }
    })();

    this.loadingPromises.set(dedupeKey, loadPromise);
    return await loadPromise;
  }

  /**
   * Save preference group
   * @param {string} groupName - Group name
   * @param {Object} preferences - Preferences to save
   * @param {Object} options - Options
   * @returns {Promise<Object>} Save results
   */
  async saveGroup(groupName, preferences, options = {}) {
    const {
      userId = null,
      profileId = null,
      optimisticUpdate = true,
    } = options;

    const finalUserId = userId || this.currentUserId || 1;
    const finalProfileId = profileId !== null && profileId !== undefined
      ? profileId
      : (this.currentProfileId !== null && this.currentProfileId !== undefined ? this.currentProfileId : 0);

    // Deduplication
    const dedupeKey = `save_${groupName}_${finalUserId}_${finalProfileId}`;
    if (this.savingPromises.has(dedupeKey)) {
      window.Logger?.debug?.('⏭️ Save deduplicated', {
        page: 'preferences-manager',
        groupName,
        dedupeKey,
      });
      return await this.savingPromises.get(dedupeKey);
    }

    const savePromise = (async () => {
      try {
        window.Logger?.info?.(`💾 Saving ${Object.keys(preferences).length} preferences for group ${groupName}...`, {
          page: 'preferences-manager',
          userId: finalUserId,
          profileId: finalProfileId,
        });

        // Optimistic update: update UI immediately
        // Note: PreferencesUI.updateFields doesn't exist - removed optimistic update for now
        // The UI will be updated after successful save via PreferencesUI.refresh() or similar
        if (optimisticUpdate && window.PreferencesUI) {
          // Skip optimistic update - PreferencesUI.updateFields doesn't exist
          // UI will be updated after successful save
          window.Logger?.debug?.('Skipping optimistic update - PreferencesUI.updateFields not available', {
            page: 'preferences-manager',
          });
        }

        // Save to server
        let results = { saved: 0, errors: 0 };
        if (window.PreferencesData && typeof window.PreferencesData.saveGroupPreferences === 'function') {
          results = await window.PreferencesData.saveGroupPreferences(groupName, preferences, finalUserId, finalProfileId);
        } else if (window.PreferencesCore && typeof window.PreferencesCore.saveGroupPreferences === 'function') {
          results = await window.PreferencesCore.saveGroupPreferences(groupName, preferences, finalUserId, finalProfileId);
        } else {
          throw new Error('No data source available for saving preferences');
        }

        // If save failed, rollback optimistic update
        if (results.errors > 0 || results.saved === 0) {
          if (optimisticUpdate && window.PreferencesUI) {
            window.Logger?.warn?.('Save failed, rolling back optimistic update', {
              page: 'preferences-manager',
            });
            // Reload from server
            await this.loadGroup(groupName, { userId: finalUserId, profileId: finalProfileId, forceRefresh: true });
          }
          throw new Error(`Failed to save ${results.errors} preferences`);
        }

        // Update cache with saved values
        if (window.PreferencesCache && results.saved > 0) {
          const cacheKey = window.PreferencesCache.buildKey('group', groupName, finalUserId, finalProfileId);
          await window.PreferencesCache.set(cacheKey, preferences);
        }

        // Update global state
        if (!window.currentPreferences) {
          window.currentPreferences = {};
        }
        Object.assign(window.currentPreferences, preferences);

        // Dispatch event
        if (window.PreferencesEvents) {
          window.PreferencesEvents.dispatch('preferences:saved', {
            groupName,
            preferences,
            userId: finalUserId,
            profileId: finalProfileId,
            savedCount: results.saved,
          });
        }

        window.Logger?.info?.(`✅ Saved ${results.saved} preferences for group ${groupName}`, {
          page: 'preferences-manager',
        });

        return results;
      } catch (error) {
        window.Logger?.error?.(`Failed to save group ${groupName}:`, error, {
          page: 'preferences-manager',
        });

        // Dispatch error event
        if (window.PreferencesEvents) {
          window.PreferencesEvents.dispatch('preferences:save-failed', {
            groupName,
            preferences,
            error: error.message,
          });
        }

        throw error;
      } finally {
        this.savingPromises.delete(dedupeKey);
      }
    })();

    this.savingPromises.set(dedupeKey, savePromise);
    return await savePromise;
  }

  /**
   * Refresh preference group (only if needed)
   * @param {string} groupName - Group name
   * @param {Object} options - Options
   * @returns {Promise<Object>} Preferences object
   */
  async refreshGroup(groupName, options = {}) {
    const {
      userId = null,
      profileId = null,
      force = false,
    } = options;

    window.Logger?.info?.(`🔄 Refreshing group ${groupName}...`, {
      page: 'preferences-manager',
      force,
    });

    // Invalidate cache
    if (window.PreferencesCache) {
      await window.PreferencesCache.clearGroup(groupName);
    }

    // Reload from server
    return await this.loadGroup(groupName, {
      userId,
      profileId,
      forceRefresh: true,
      useCache: false,
    });
  }

  /**
   * Load critical preferences (for initialization)
   * @private
   * @param {number} userId - User ID
   * @param {number} profileId - Profile ID
   * @returns {Promise<Object>} Critical preferences
   */
  async _loadCriticalPreferences(userId, profileId) {
    // Use LazyLoader if available
    if (window.LazyLoader && typeof window.LazyLoader.loadCriticalPreferences === 'function') {
      return await window.LazyLoader.loadCriticalPreferences(userId, profileId);
    }

    // Fallback: load from PreferencesCore
    if (window.PreferencesCore && typeof window.PreferencesCore.getCriticalPreferences === 'function') {
      return await window.PreferencesCore.getCriticalPreferences(userId, profileId);
    }

    // Last resort: empty object
    return {};
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

window.PreferencesManager = new PreferencesManager();

window.Logger?.info?.('✅ PreferencesManager loaded', {
  page: 'preferences-manager',
});

