/**
 * Trade Plan Assignment Service
 * ======================================
 * Shared service for loading trade plan assignment and creation suggestions.
 * Used by both executions page and unified widget.
 *
 * Responsibilities:
 * - Fetch assignments from API endpoint
 * - Fetch creations from API endpoint
 * - Cache assignments and creations with TTL
 * - Manage dismissed items cache
 * - Filter visible items
 * - Provide clean API for both executions page and widget
 *
 * Related Documentation:
 * - documentation/03-DEVELOPMENT/GUIDES/REFACTORING_PLAN_UNIFIED_WIDGET.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 *
 * Function Index:
 * ==============
 *
 * DATA LOADING:
 * - fetchAssignments(options) - Fetch assignments from API
 * - fetchCreations(options) - Fetch creations from API
 * - getCachedAssignments() - Get cached assignments
 * - getCachedCreations() - Get cached creations
 * - cacheAssignments(assignments) - Cache assignments
 * - cacheCreations(creations) - Cache creations
 *
 * DISMISSED ITEMS:
 * - getDismissedItems() - Get dismissed item keys
 * - dismissItem(key) - Dismiss an item
 * - clearDismissedItems() - Clear all dismissed items
 *
 * UTILITIES:
 * - getVisibleAssignments(assignments, maxItems) - Filter visible assignments
 * - getVisibleCreations(creations, maxItems) - Filter visible creations
 * - invalidateCache() - Invalidate all caches
 * - getDismissKey(kind, tradeId, planId) - Get dismiss key for item
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function tradePlanAssignmentService() {
  'use strict';

  const ASSIGNMENTS_ENDPOINT = '/api/trades/pending-plan/assignments';
  const CREATIONS_ENDPOINT = '/api/trades/pending-plan/creations';
  const ASSIGNMENTS_CACHE_KEY = 'trade-plan-assignments';
  const CREATIONS_CACHE_KEY = 'trade-plan-creations';
  const DISMISSED_CACHE_KEY = 'pending-trade-plan-widget-dismissed';
  const ASSIGNMENTS_TTL = 60 * 1000; // 60 seconds
  const CREATIONS_TTL = 60 * 1000; // 60 seconds
  const DISMISSED_TTL = 3600 * 1000; // 1 hour
  const PAGE_LOG_CONTEXT = { page: 'trade-plan-assignment-service' };

  // Internal state
  let cachedAssignments = null;
  let cachedCreations = null;
  let dismissedItems = null;

  /**
   * Get dismiss key for an item
   * @param {string} kind - 'assignment' or 'creation'
   * @param {number} tradeId - Trade ID
   * @param {number} planId - Plan ID (for assignments only)
   * @returns {string} - Dismiss key
   */
  function getDismissKey(kind, tradeId, planId = null) {
    if (kind === 'assignment') {
      return `assignment-${tradeId}-${planId || 'none'}`;
    }
    if (kind === 'creation') {
      return `creation-${tradeId}`;
    }
    return `item-${tradeId}`;
  }

  /**
   * Fetch assignments from API
   * @param {Object} options - Options including limit, suggestions, force
   * @returns {Promise<Array>} - Array of assignment objects
   */
  async function fetchAssignments(options = {}) {
    try {
      const { force = false, limit, suggestions = 3 } = options;

      // Check cache first if not forcing
      if (!force && cachedAssignments) {
        window.Logger?.debug?.('📦 Assignments loaded from memory cache', PAGE_LOG_CONTEXT);
        return cachedAssignments;
      }

      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(ASSIGNMENTS_CACHE_KEY, { ttl: ASSIGNMENTS_TTL });
        if (cached && Array.isArray(cached) && cached.length > 0) {
          window.Logger?.debug?.('📦 Assignments loaded from UnifiedCacheManager', PAGE_LOG_CONTEXT);
          cachedAssignments = cached;
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading assignments from API...', PAGE_LOG_CONTEXT);

      // Build query params
      const params = new URLSearchParams();
      if (Number.isFinite(limit) && limit > 0) {
        params.set('limit', String(limit));
      }
      if (Number.isFinite(suggestions) && suggestions > 0) {
        params.set('suggestions', String(suggestions));
      }

      const url = params.toString() ? `${ASSIGNMENTS_ENDPOINT}?${params.toString()}` : ASSIGNMENTS_ENDPOINT;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();
      if (payload.status !== 'success') {
        throw new Error(payload?.error?.message || 'Unknown API error');
      }

      const assignments = Array.isArray(payload.data) ? payload.data : [];
      
      // Cache assignments
      cachedAssignments = assignments;
      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(ASSIGNMENTS_CACHE_KEY, assignments, { ttl: ASSIGNMENTS_TTL });
      }

      window.Logger?.debug?.('✅ Assignments loaded from API', { ...PAGE_LOG_CONTEXT, count: assignments.length });
      return assignments;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading assignments', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Fetch creations from API
   * @param {Object} options - Options including limit, assignmentIndex, force
   * @returns {Promise<Array>} - Array of creation objects
   */
  async function fetchCreations(options = {}) {
    try {
      const { force = false, limit, assignmentIndex = null } = options;

      // If assignmentIndex is provided, fetch assignments first to build index
      let index = assignmentIndex;
      if (!index && typeof fetchAssignments === 'function') {
        const assignments = await fetchAssignments({ limit: null, suggestions: 3 });
        index = {};
        assignments.forEach(item => {
          if (item.trade_id) {
            index[item.trade_id] = item.best_score || 0;
          }
        });
      }

      // Check cache first if not forcing
      if (!force && cachedCreations) {
        window.Logger?.debug?.('📦 Creations loaded from memory cache', PAGE_LOG_CONTEXT);
        return cachedCreations;
      }

      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(CREATIONS_CACHE_KEY, { ttl: CREATIONS_TTL });
        if (cached && Array.isArray(cached) && cached.length > 0) {
          window.Logger?.debug?.('📦 Creations loaded from UnifiedCacheManager', PAGE_LOG_CONTEXT);
          cachedCreations = cached;
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading creations from API...', PAGE_LOG_CONTEXT);

      // Build query params
      const params = new URLSearchParams();
      if (Number.isFinite(limit) && limit > 0) {
        params.set('limit', String(limit));
      }

      const url = params.toString() ? `${CREATIONS_ENDPOINT}?${params.toString()}` : CREATIONS_ENDPOINT;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();
      if (payload.status !== 'success') {
        throw new Error(payload?.error?.message || 'Unknown API error');
      }

      const creations = Array.isArray(payload.data) ? payload.data : [];
      
      // Cache creations
      cachedCreations = creations;
      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(CREATIONS_CACHE_KEY, creations, { ttl: CREATIONS_TTL });
      }

      window.Logger?.debug?.('✅ Creations loaded from API', { ...PAGE_LOG_CONTEXT, count: creations.length });
      return creations;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading creations', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Get cached assignments
   * @returns {Array|null} - Cached assignments or null
   */
  async function getCachedAssignments() {
    if (cachedAssignments) {
      return cachedAssignments;
    }

    if (typeof window.UnifiedCacheManager?.get === 'function') {
      try {
        const cached = await window.UnifiedCacheManager.get(ASSIGNMENTS_CACHE_KEY);
        if (cached && Array.isArray(cached)) {
          cachedAssignments = cached;
          return cached;
        }
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to get cached assignments', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }

    return null;
  }

  /**
   * Get cached creations
   * @returns {Array|null} - Cached creations or null
   */
  async function getCachedCreations() {
    if (cachedCreations) {
      return cachedCreations;
    }

    if (typeof window.UnifiedCacheManager?.get === 'function') {
      try {
        const cached = await window.UnifiedCacheManager.get(CREATIONS_CACHE_KEY);
        if (cached && Array.isArray(cached)) {
          cachedCreations = cached;
          return cached;
        }
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to get cached creations', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }

    return null;
  }

  /**
   * Cache assignments
   * @param {Array} assignments - Assignments to cache
   */
  async function cacheAssignments(assignments) {
    cachedAssignments = assignments;
    if (typeof window.UnifiedCacheManager?.save === 'function' && Array.isArray(assignments)) {
      try {
        await window.UnifiedCacheManager.save(ASSIGNMENTS_CACHE_KEY, assignments, { ttl: ASSIGNMENTS_TTL });
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to cache assignments', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  /**
   * Cache creations
   * @param {Array} creations - Creations to cache
   */
  async function cacheCreations(creations) {
    cachedCreations = creations;
    if (typeof window.UnifiedCacheManager?.save === 'function' && Array.isArray(creations)) {
      try {
        await window.UnifiedCacheManager.save(CREATIONS_CACHE_KEY, creations, { ttl: CREATIONS_TTL });
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to cache creations', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  /**
   * Get dismissed item keys
   * @returns {Promise<Set<string>>} - Set of dismissed item keys
   */
  async function getDismissedItems() {
    if (dismissedItems) {
      return dismissedItems;
    }

    try {
      const cached = await window.UnifiedCacheManager?.get?.(DISMISSED_CACHE_KEY);
      if (Array.isArray(cached)) {
        dismissedItems = new Set(cached);
        return dismissedItems;
      }
      dismissedItems = new Set();
      return dismissedItems;
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to load dismissed items from cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
      dismissedItems = new Set();
      return dismissedItems;
    }
  }

  /**
   * Dismiss an item
   * @param {string} key - Dismiss key (use getDismissKey to generate)
   */
  async function dismissItem(key) {
    const dismissed = await getDismissedItems();
    dismissed.add(key);
    dismissedItems = dismissed;

    try {
      await window.UnifiedCacheManager?.set?.(
        DISMISSED_CACHE_KEY,
        Array.from(dismissed),
        { ttl: DISMISSED_TTL }
      );
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to persist dismissed items', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Clear all dismissed items
   */
  async function clearDismissedItems() {
    dismissedItems = new Set();
    try {
      await window.UnifiedCacheManager?.delete?.(DISMISSED_CACHE_KEY);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to clear dismissed items', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Get visible assignments (filter dismissed)
   * @param {Array} assignments - All assignments
   * @param {number} maxItems - Maximum number of items to return (optional)
   * @returns {Promise<Array>} - Filtered visible assignments
   */
  async function getVisibleAssignments(assignments, maxItems = null) {
    const dismissed = await getDismissedItems();
    const trade = assignments.map(item => item.trade || {}).find(t => t.id);
    const suggestion = assignments.map(item => item.primary_suggestion || {}).find(s => s.plan);
    const plan = suggestion?.plan || {};
    
    let visible = assignments.filter(item => {
      const tradeId = item?.trade?.id;
      const planId = item?.primary_suggestion?.plan?.id;
      if (!tradeId) return false;
      
      const key = getDismissKey('assignment', tradeId, planId);
      return !dismissed.has(key);
    });
    
    if (Number.isFinite(maxItems) && maxItems > 0) {
      visible = visible.slice(0, maxItems);
    }
    
    return visible;
  }

  /**
   * Get visible creations (filter dismissed)
   * @param {Array} creations - All creations
   * @param {number} maxItems - Maximum number of items to return (optional)
   * @returns {Promise<Array>} - Filtered visible creations
   */
  async function getVisibleCreations(creations, maxItems = null) {
    const dismissed = await getDismissedItems();
    
    let visible = creations.filter(item => {
      const tradeId = item?.trade?.id;
      if (!tradeId) return false;
      
      const key = getDismissKey('creation', tradeId);
      return !dismissed.has(key);
    });
    
    if (Number.isFinite(maxItems) && maxItems > 0) {
      visible = visible.slice(0, maxItems);
    }
    
    return visible;
  }

  /**
   * Invalidate all caches
   */
  async function invalidateCache() {
    cachedAssignments = null;
    cachedCreations = null;
    
    if (typeof window.UnifiedCacheManager?.delete === 'function') {
      try {
        await Promise.all([
          window.UnifiedCacheManager.delete(ASSIGNMENTS_CACHE_KEY),
          window.UnifiedCacheManager.delete(CREATIONS_CACHE_KEY)
        ]);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to invalidate caches', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  // Export public API
  window.TradePlanAssignmentService = {
    fetchAssignments,
    fetchCreations,
    getCachedAssignments,
    getCachedCreations,
    cacheAssignments,
    cacheCreations,
    getDismissedItems,
    dismissItem,
    clearDismissedItems,
    getVisibleAssignments,
    getVisibleCreations,
    invalidateCache,
    getDismissKey
  };

  window.Logger?.info?.('✅ TradePlanAssignmentService loaded', PAGE_LOG_CONTEXT);
})();






