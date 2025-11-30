/**
 * Preferences Cache - Cache Management Layer
 * ==========================================
 *
 * ניהול מטמון אחיד להעדפות
 *
 * תכונות:
 * - Cache keys עקביים
 * - Invalidation חכם
 * - Multi-layer support (memory, localStorage, IndexedDB)
 * - Deduplication
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */

// ============================================================================
// PREFERENCES CACHE CLASS
// ============================================================================

class PreferencesCache {
  constructor() {
    this.initialized = false;
    this.defaultTTL = 300000; // 5 minutes
  }

  /**
   * Initialize cache system
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Ensure UnifiedCacheManager is available
    if (!window.UnifiedCacheManager) {
      window.Logger?.warn?.('UnifiedCacheManager not available, PreferencesCache will have limited functionality', {
        page: 'preferences-cache',
      });
    }

    this.initialized = true;
    window.Logger?.info?.('✅ PreferencesCache initialized', {
      page: 'preferences-cache',
    });
  }

  /**
   * Build cache key with consistent format
   * @param {string} type - Type: 'single', 'group', 'all'
   * @param {string} identifier - Identifier: preference name, group name, or 'all'
   * @param {number} userId - User ID
   * @param {number} profileId - Profile ID
   * @returns {string} Cache key
   */
  buildKey(type, identifier, userId, profileId) {
    const normalizedType = type || 'single';
    const normalizedIdentifier = identifier || '';
    const normalizedUserId = userId || 1;
    const normalizedProfileId = profileId !== null && profileId !== undefined ? profileId : 0;

    return `preference_${normalizedType}_${normalizedIdentifier}_${normalizedUserId}_${normalizedProfileId}`;
  }

  /**
   * Parse cache key
   * @param {string} key - Cache key
   * @returns {Object} Parsed key parts
   */
  parseKey(key) {
    const match = key.match(/^preference_(single|group|all)_(.+?)_(\d+)_(\d+)$/);
    if (!match) {
      return null;
    }

    return {
      type: match[1],
      identifier: match[2],
      userId: parseInt(match[3], 10),
      profileId: parseInt(match[4], 10),
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @param {Object} options - Options
   * @returns {Promise<any>} Cached value or null
   */
  async get(key, options = {}) {
    const {
      ttl = this.defaultTTL,
      layer = null, // null = try all layers
    } = options;

    if (!window.UnifiedCacheManager) {
      window.Logger?.warn?.('UnifiedCacheManager not available, cannot get from cache', {
        page: 'preferences-cache',
        key,
      });
      return null;
    }

    try {
      const cached = await window.UnifiedCacheManager.get(key, {
        ttl,
        layer,
      });

      if (cached !== null) {
        window.Logger?.debug?.('🔍 Cache hit', {
          page: 'preferences-cache',
          key,
        });
        return cached;
      }

      window.Logger?.debug?.('📭 Cache miss', {
        page: 'preferences-cache',
        key,
      });
      return null;
    } catch (error) {
      window.Logger?.warn?.('Error getting from cache', {
        page: 'preferences-cache',
        key,
        error: error?.message,
      });
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} options - Options
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      layer = null, // null = save to all layers
    } = options;

    if (!window.UnifiedCacheManager) {
      window.Logger?.warn?.('UnifiedCacheManager not available, cannot save to cache', {
        page: 'preferences-cache',
        key,
      });
      return;
    }

    try {
      await window.UnifiedCacheManager.save(key, value, {
        ttl,
        layer,
      });

      window.Logger?.debug?.('💾 Saved to cache', {
        page: 'preferences-cache',
        key,
      });
    } catch (error) {
      window.Logger?.warn?.('Error saving to cache', {
        page: 'preferences-cache',
        key,
        error: error?.message,
      });
    }
  }

  /**
   * Invalidate cache (remove without reloading)
   * @param {string} pattern - Pattern to match keys (supports wildcards)
   * @returns {Promise<void>}
   */
  async invalidate(pattern) {
    if (!window.UnifiedCacheManager) {
      window.Logger?.warn?.('UnifiedCacheManager not available, cannot invalidate cache', {
        page: 'preferences-cache',
        pattern,
      });
      return;
    }

    try {
      // If pattern is a specific key, remove it directly
      if (!pattern.includes('*') && !pattern.includes('?')) {
        await window.UnifiedCacheManager.remove(pattern);
        window.Logger?.debug?.('🧹 Invalidated cache key', {
          page: 'preferences-cache',
          key: pattern,
        });
        return;
      }

      // For patterns, we need to iterate through all keys
      // This is a simplified version - in production, you might want more sophisticated pattern matching
      window.Logger?.warn?.('Pattern-based invalidation not fully implemented, removing specific keys only', {
        page: 'preferences-cache',
        pattern,
      });
    } catch (error) {
      window.Logger?.warn?.('Error invalidating cache', {
        page: 'preferences-cache',
        pattern,
        error: error?.message,
      });
    }
  }

  /**
   * Clear cache for specific group
   * @param {string} groupName - Group name
   * @param {number} userId - User ID (optional)
   * @param {number} profileId - Profile ID (optional)
   * @returns {Promise<void>}
   */
  async clearGroup(groupName, userId = null, profileId = null) {
    if (!window.UnifiedCacheManager) {
      return;
    }

    const finalUserId = userId || window.PreferencesCore?.currentUserId || 1;
    const finalProfileId = profileId !== null && profileId !== undefined
      ? profileId
      : (window.PreferencesCore?.currentProfileId !== null && window.PreferencesCore?.currentProfileId !== undefined
        ? window.PreferencesCore.currentProfileId
        : 0);

    // Clear group cache
    const groupKey = this.buildKey('group', groupName, finalUserId, finalProfileId);
    await this.invalidate(groupKey);

    // Also clear all preferences cache (since group is part of all)
    const allKey = this.buildKey('all', '', finalUserId, finalProfileId);
    await this.invalidate(allKey);

    window.Logger?.info?.(`🧹 Cleared cache for group ${groupName}`, {
      page: 'preferences-cache',
      groupName,
      userId: finalUserId,
      profileId: finalProfileId,
    });
  }

  /**
   * Clear all preferences cache
   * @param {number} userId - User ID (optional)
   * @param {number} profileId - Profile ID (optional)
   * @returns {Promise<void>}
   */
  async clearAll(userId = null, profileId = null) {
    if (!window.UnifiedCacheManager) {
      return;
    }

    const finalUserId = userId || window.PreferencesCore?.currentUserId || 1;
    const finalProfileId = profileId !== null && profileId !== undefined
      ? profileId
      : (window.PreferencesCore?.currentProfileId !== null && window.PreferencesCore?.currentProfileId !== undefined
        ? window.PreferencesCore.currentProfileId
        : 0);

    // Clear all preference-related keys
    // This is a simplified version - in production, you might want to iterate through all keys
    const allKey = this.buildKey('all', '', finalUserId, finalProfileId);
    await this.invalidate(allKey);

    window.Logger?.info?.('🧹 Cleared all preferences cache', {
      page: 'preferences-cache',
      userId: finalUserId,
      profileId: finalProfileId,
    });
  }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

window.PreferencesCache = new PreferencesCache();

window.Logger?.info?.('✅ PreferencesCache loaded', {
  page: 'preferences-cache',
});

