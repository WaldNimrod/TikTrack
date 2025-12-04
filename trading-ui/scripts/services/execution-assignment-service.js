/**
 * Execution Assignment Service
 * ======================================
 * Shared service for loading execution highlights (assignment suggestions).
 * Used by both executions page and unified widget.
 *
 * Responsibilities:
 * - Fetch highlights from API endpoint
 * - Cache highlights with TTL
 * - Manage dismissed items cache
 * - Filter visible highlights
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
 * - fetchHighlights(options) - Fetch highlights from API
 * - getCachedHighlights() - Get cached highlights
 * - cacheHighlights(highlights) - Cache highlights
 *
 * DISMISSED ITEMS:
 * - getDismissedItems() - Get dismissed item keys
 * - dismissItem(executionId, tradeId) - Dismiss an item
 * - clearDismissedItems() - Clear all dismissed items
 *
 * UTILITIES:
 * - getVisibleHighlights(highlights, maxItems) - Filter visible highlights
 * - invalidateCache() - Invalidate highlights cache
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function executionAssignmentService() {
  'use strict';

  const API_ENDPOINT = '/api/executions/pending-assignment/highlights';
  const HIGHLIGHTS_CACHE_KEY = 'execution-assignment-highlights';
  const DISMISSED_CACHE_KEY = 'pending-execution-highlights-dismissed';
  const HIGHLIGHTS_TTL = 60 * 1000; // 60 seconds
  const DISMISSED_TTL = 3600 * 1000; // 1 hour
  const PAGE_LOG_CONTEXT = { page: 'execution-assignment-service' };

  // Internal state
  let cachedHighlights = null;
  let dismissedItems = null;

  /**
   * Get dismiss key for an item
   * @param {number} executionId - Execution ID
   * @param {number} tradeId - Trade ID (optional)
   * @returns {string} - Dismiss key
   */
  function getDismissKey(executionId, tradeId = null) {
    return tradeId ? `execution-${executionId}-trade-${tradeId}` : `execution-${executionId}`;
  }

  /**
   * Fetch highlights from API
   * @param {Object} options - Options including limit, suggestions, force
   * @returns {Promise<Array>} - Array of highlight objects
   */
  async function fetchHighlights(options = {}) {
    try {
      const { force = false, limit = 5, suggestions = 5 } = options;

      // Check cache first if not forcing
      if (!force && cachedHighlights) {
        window.Logger?.debug?.('📦 Highlights loaded from memory cache', PAGE_LOG_CONTEXT);
        return cachedHighlights;
      }

      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(HIGHLIGHTS_CACHE_KEY, { ttl: HIGHLIGHTS_TTL });
        if (cached && Array.isArray(cached) && cached.length > 0) {
          window.Logger?.debug?.('📦 Highlights loaded from UnifiedCacheManager', PAGE_LOG_CONTEXT);
          cachedHighlights = cached;
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading highlights from API...', PAGE_LOG_CONTEXT);

      // Build query params
      const params = new URLSearchParams();
      if (Number.isFinite(limit) && limit > 0) {
        params.set('limit', String(limit));
      }
      if (Number.isFinite(suggestions) && suggestions > 0) {
        params.set('suggestions', String(suggestions));
      }

      const url = params.toString() ? `${API_ENDPOINT}?${params.toString()}` : API_ENDPOINT;
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

      const highlights = Array.isArray(payload.data) ? payload.data : [];
      
      // Cache highlights
      cachedHighlights = highlights;
      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(HIGHLIGHTS_CACHE_KEY, highlights, { ttl: HIGHLIGHTS_TTL });
      }

      window.Logger?.debug?.('✅ Highlights loaded from API', { ...PAGE_LOG_CONTEXT, count: highlights.length });
      return highlights;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading highlights', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Get cached highlights
   * @returns {Array|null} - Cached highlights or null
   */
  async function getCachedHighlights() {
    if (cachedHighlights) {
      return cachedHighlights;
    }

    if (typeof window.UnifiedCacheManager?.get === 'function') {
      try {
        const cached = await window.UnifiedCacheManager.get(HIGHLIGHTS_CACHE_KEY);
        if (cached && Array.isArray(cached)) {
          cachedHighlights = cached;
          return cached;
        }
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to get cached highlights', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }

    return null;
  }

  /**
   * Cache highlights
   * @param {Array} highlights - Highlights to cache
   */
  async function cacheHighlights(highlights) {
    cachedHighlights = highlights;
    if (typeof window.UnifiedCacheManager?.save === 'function' && Array.isArray(highlights)) {
      try {
        await window.UnifiedCacheManager.save(HIGHLIGHTS_CACHE_KEY, highlights, { ttl: HIGHLIGHTS_TTL });
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to cache highlights', { ...PAGE_LOG_CONTEXT, error: error?.message });
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
      if (Array.isArray(cached) && cached.length > 0) {
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
   * @param {number} executionId - Execution ID
   * @param {number} tradeId - Trade ID (optional)
   */
  async function dismissItem(executionId, tradeId = null) {
    const dismissed = await getDismissedItems();
    const key = getDismissKey(executionId, tradeId);
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
   * Get visible highlights (filter dismissed)
   * @param {Array} highlights - All highlights
   * @param {number} maxItems - Maximum number of items to return (optional)
   * @returns {Promise<Array>} - Filtered visible highlights
   */
  async function getVisibleHighlights(highlights, maxItems = null) {
    const dismissed = await getDismissedItems();
    let visible = highlights.filter(highlight => {
      const executionId = highlight?.execution?.id;
      if (!executionId) return false;
      
      // Check if execution is dismissed
      const executionKey = getDismissKey(executionId);
      if (dismissed.has(executionKey)) return false;
      
      // Check if specific trade suggestion is dismissed
      const suggestions = highlight?.suggestions || [];
      if (suggestions.length > 0) {
        return suggestions.some(suggestion => {
          const tradeId = suggestion?.trade?.id;
          if (!tradeId) return true;
          const itemKey = getDismissKey(executionId, tradeId);
          return !dismissed.has(itemKey);
        });
      }
      
      return true;
    });
    
    if (Number.isFinite(maxItems) && maxItems > 0) {
      visible = visible.slice(0, maxItems);
    }
    
    return visible;
  }

  /**
   * Invalidate highlights cache
   */
  async function invalidateCache() {
    cachedHighlights = null;
    if (typeof window.UnifiedCacheManager?.delete === 'function') {
      try {
        await window.UnifiedCacheManager.delete(HIGHLIGHTS_CACHE_KEY);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to invalidate highlights cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  // Export public API
  window.ExecutionAssignmentService = {
    fetchHighlights,
    getCachedHighlights,
    cacheHighlights,
    getDismissedItems,
    dismissItem,
    clearDismissedItems,
    getVisibleHighlights,
    invalidateCache,
    getDismissKey
  };

  window.Logger?.info?.('✅ ExecutionAssignmentService loaded', PAGE_LOG_CONTEXT);
})();




