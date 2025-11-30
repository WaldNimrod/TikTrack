/**
 * Execution Clustering Service
 * ======================================
 * Shared service for loading execution clusters for trade creation.
 * Used by both executions page and unified widget.
 *
 * Responsibilities:
 * - Fetch clusters from API endpoint
 * - Cache clusters with TTL
 * - Manage dismissed clusters cache
 * - Filter visible clusters for widgets
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
 * - fetchClusters(options) - Fetch clusters from API
 * - getCachedClusters() - Get cached clusters
 * - cacheClusters(clusters) - Cache clusters
 *
 * DISMISSED ITEMS:
 * - getDismissedClusters() - Get dismissed cluster IDs
 * - dismissCluster(clusterId) - Dismiss a cluster
 * - clearDismissedClusters() - Clear all dismissed clusters
 *
 * UTILITIES:
 * - getVisibleClusters(clusters, maxItems) - Filter visible clusters
 * - invalidateCache() - Invalidate clusters cache
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function executionClusteringService() {
  'use strict';

  const API_ENDPOINT = '/api/executions/pending-assignment/trade-creation-clusters';
  const CLUSTERS_CACHE_KEY = 'execution-clustering-clusters';
  const DISMISSED_CACHE_KEY = 'pending-trade-create-clusters-dismissed';
  const CLUSTERS_TTL = 60 * 1000; // 60 seconds
  const DISMISSED_TTL = 3600 * 1000; // 1 hour
  const PAGE_LOG_CONTEXT = { page: 'execution-clustering-service' };

  // Internal state
  let cachedClusters = null;
  let dismissedClusters = null;

  /**
   * Fetch clusters from API
   * @param {Object} options - Options including limit, executions_limit, force
   * @returns {Promise<Array>} - Array of cluster objects
   */
  async function fetchClusters(options = {}) {
    try {
      const { force = false, limit, executions_limit } = options;

      // Check cache first if not forcing
      if (!force && cachedClusters) {
        window.Logger?.debug?.('📦 Clusters loaded from memory cache', PAGE_LOG_CONTEXT);
        return cachedClusters;
      }

      if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
        const cached = await window.UnifiedCacheManager.get(CLUSTERS_CACHE_KEY, { ttl: CLUSTERS_TTL });
        if (cached && Array.isArray(cached) && cached.length > 0) {
          window.Logger?.debug?.('📦 Clusters loaded from UnifiedCacheManager', PAGE_LOG_CONTEXT);
          cachedClusters = cached;
          return cached;
        }
      }

      window.Logger?.debug?.('🔄 Loading clusters from API...', PAGE_LOG_CONTEXT);

      // Build query params
      const params = new URLSearchParams();
      if (Number.isFinite(limit)) {
        params.set('limit', String(limit));
      }
      if (Number.isFinite(executions_limit)) {
        params.set('executions_limit', String(executions_limit));
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

      const clusters = Array.isArray(payload.data) ? payload.data : [];
      
      // Cache clusters
      cachedClusters = clusters;
      if (typeof window.UnifiedCacheManager?.save === 'function') {
        await window.UnifiedCacheManager.save(CLUSTERS_CACHE_KEY, clusters, { ttl: CLUSTERS_TTL });
      }

      window.Logger?.debug?.('✅ Clusters loaded from API', { ...PAGE_LOG_CONTEXT, count: clusters.length });
      return clusters;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading clusters', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Get cached clusters
   * @returns {Array|null} - Cached clusters or null
   */
  async function getCachedClusters() {
    // Always return a promise for consistency
    if (cachedClusters) {
      window.Logger?.debug?.('📦 Returning clusters from memory cache', { 
        ...PAGE_LOG_CONTEXT, 
        count: cachedClusters.length 
      });
      return cachedClusters;
    }

    if (typeof window.UnifiedCacheManager?.get === 'function') {
      try {
        window.Logger?.debug?.('📦 Loading clusters from UnifiedCacheManager', PAGE_LOG_CONTEXT);
        const cached = await window.UnifiedCacheManager.get(CLUSTERS_CACHE_KEY);
        if (cached && Array.isArray(cached)) {
          cachedClusters = cached;
          window.Logger?.debug?.('📦 Clusters loaded from UnifiedCacheManager', { 
            ...PAGE_LOG_CONTEXT, 
            count: cached.length 
          });
          return cached;
        }
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to get cached clusters', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }

    window.Logger?.debug?.('📦 No cached clusters found', PAGE_LOG_CONTEXT);
    return [];
  }

  /**
   * Cache clusters
   * @param {Array} clusters - Clusters to cache
   */
  async function cacheClusters(clusters) {
    cachedClusters = clusters;
    if (typeof window.UnifiedCacheManager?.save === 'function' && Array.isArray(clusters)) {
      try {
        await window.UnifiedCacheManager.save(CLUSTERS_CACHE_KEY, clusters, { ttl: CLUSTERS_TTL });
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to cache clusters', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  /**
   * Get dismissed cluster IDs
   * @returns {Promise<Set<string>>} - Set of dismissed cluster IDs
   */
  async function getDismissedClusters() {
    if (dismissedClusters) {
      return dismissedClusters;
    }

    try {
      const cached = await window.UnifiedCacheManager?.get?.(DISMISSED_CACHE_KEY);
      if (Array.isArray(cached)) {
        dismissedClusters = new Set(cached);
        return dismissedClusters;
      }
      dismissedClusters = new Set();
      return dismissedClusters;
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to load dismissed clusters from cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
      dismissedClusters = new Set();
      return dismissedClusters;
    }
  }

  /**
   * Dismiss a cluster
   * @param {string} clusterId - Cluster ID to dismiss
   */
  async function dismissCluster(clusterId) {
    const dismissed = await getDismissedClusters();
    dismissed.add(clusterId);
    dismissedClusters = dismissed;

    try {
      await window.UnifiedCacheManager?.set?.(
        DISMISSED_CACHE_KEY,
        Array.from(dismissed),
        { ttl: DISMISSED_TTL }
      );
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to persist dismissed clusters', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Clear all dismissed clusters
   */
  async function clearDismissedClusters() {
    dismissedClusters = new Set();
    try {
      await window.UnifiedCacheManager?.delete?.(DISMISSED_CACHE_KEY);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to clear dismissed clusters', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  /**
   * Get visible clusters (filter dismissed and limit)
   * @param {Array} clusters - All clusters
   * @param {number} maxItems - Maximum number of items to return
   * @returns {Promise<Array>} - Filtered visible clusters
   */
  async function getVisibleClusters(clusters, maxItems = null) {
    const dismissed = await getDismissedClusters();
    let visible = clusters.filter(cluster => !dismissed.has(cluster.cluster_id));
    
    if (Number.isFinite(maxItems) && maxItems > 0) {
      visible = visible.slice(0, maxItems);
    }
    
    return visible;
  }

  /**
   * Invalidate clusters cache
   */
  async function invalidateCache() {
    cachedClusters = null;
    if (typeof window.UnifiedCacheManager?.delete === 'function') {
      try {
        await window.UnifiedCacheManager.delete(CLUSTERS_CACHE_KEY);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to invalidate clusters cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
      }
    }
  }

  // Export public API
  window.ExecutionClusteringService = {
    fetchClusters,
    getCachedClusters,
    cacheClusters,
    getDismissedClusters,
    dismissCluster,
    clearDismissedClusters,
    getVisibleClusters,
    invalidateCache
  };

  window.Logger?.info?.('✅ ExecutionClusteringService loaded', PAGE_LOG_CONTEXT);
})();

