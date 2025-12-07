/**
 * Watch Lists Data Service
 * ======================================
 * Unified loader for watch lists data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load watch lists via API (with cache bust for local file protocol)
 * - Save results inside UnifiedCacheManager with a 45s TTL
 * - Provide forced reload + cache invalidation helpers
 * - Surface consistent errors through the global notification + log systems
 * - CRUD operations (create, update, delete, fetchDetails)
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 * - documentation/04-FEATURES/WATCH_LIST/API_REFERENCE.md
 *
 * Function Index:
 * ==============
 *
 * CACHE MANAGEMENT:
 * - saveWatchListsCache(data, options) - Save watch lists to cache
 * - invalidateWatchListsCache() - Invalidate watch lists cache (uses CacheSyncManager)
 * - clearWatchListsCache(patternOnly) - Clear watch lists cache
 *
 * DATA LOADING:
 * - fetchWatchListsFromApi({ signal }) - Fetch watch lists from API
 * - loadWatchListsData(options) - Load watch lists with cache support
 * - getWatchList(listId, options) - Get single watch list
 * - getWatchListItems(listId, options) - Get items in a watch list
 *
 * CRUD OPERATIONS:
 * - createWatchList(payload, options) - Create new watch list
 * - updateWatchList(listId, payload, options) - Update existing watch list
 * - deleteWatchList(listId, options) - Delete watch list
 * - addTickerToList(listId, tickerData, options) - Add ticker to list
 * - removeTickerFromList(itemId, options) - Remove ticker from list
 * - updateItemOrder(listId, itemsOrder, options) - Update item display order
 *
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */
(function watchListsDataService() {
  const WATCH_LISTS_DATA_KEY = 'watch-lists-data';
  const WATCH_LISTS_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'watch-lists-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string') {
      return window.API_BASE_URL;
    }
    return window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
  }

  function normalizeWatchListsPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return records.map((list) => ({
      ...list,
      updated_at: list.updated_at || list.created_at || null,
    }));
  }

  async function saveWatchListsCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? WATCH_LISTS_TTL;
    try {
      await window.UnifiedCacheManager.save(WATCH_LISTS_DATA_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('Failed to save watch lists cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  async function invalidateWatchListsCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('watch-list-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (!window.UnifiedCacheManager) {
      return;
    }
    if (typeof window.UnifiedCacheManager.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(WATCH_LISTS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate watch lists cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(WATCH_LISTS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear watch lists cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  async function clearWatchListsCache(patternOnly = false) {
    if (patternOnly) {
      if (window.UnifiedCacheManager?.clearByPattern) {
        await window.UnifiedCacheManager.clearByPattern(WATCH_LISTS_DATA_KEY).catch(() => {});
      }
      return;
    }
    if (window.UnifiedCacheManager?.invalidate) {
      await window.UnifiedCacheManager.invalidate(WATCH_LISTS_DATA_KEY).catch(() => {});
    }
  }

  function notifyLoadError(message, error) {
    window.Logger?.error?.('❌ Watch lists load error', {
      ...PAGE_LOG_CONTEXT,
      message,
      error: error?.message || error,
    });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בטעינת רשימות צפייה', message);
    }
  }

  async function fetchWatchListsFromApi({ signal } = {}) {
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists?_ts=${Date.now()}`;
    const response = await fetch(url, { 
      method: 'GET', 
      headers: DEFAULT_HEADERS, 
      signal,
      credentials: 'include' // Include cookies for session-based auth
    });
    
    // Handle 401/308 authentication errors
    if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const error = new Error(`Watch lists load failed (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }
    const payload = await response.json();
    const normalized = normalizeWatchListsPayload(payload);
    await saveWatchListsCache(normalized);
    return normalized;
  }

  async function loadWatchListsData(options = {}) {
    const { forceReload = false, signal } = options;
    
    // Try cache first (unless force reload)
    if (!forceReload && window.UnifiedCacheManager?.load) {
      try {
        const cached = await window.UnifiedCacheManager.load(WATCH_LISTS_DATA_KEY);
        if (cached) {
          window.Logger?.debug?.('📦 Loaded watch lists from cache', PAGE_LOG_CONTEXT);
          return cached;
        }
      } catch (error) {
        window.Logger?.warn?.('Cache load failed, fetching from API', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fetch from API
    window.Logger?.info?.('🌐 Fetching watch lists from API', PAGE_LOG_CONTEXT);
    return await fetchWatchListsFromApi({ signal });
  }

  async function getWatchList(listId, options = {}) {
    const { forceReload = false, signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}?_ts=${Date.now()}`;
    
    try {
      const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS, signal });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Watch list ${listId} not found`);
        }
        throw new Error(`Failed to load watch list (${response.status})`);
      }
      const payload = await response.json();
      return payload.data || null;
    } catch (error) {
      window.Logger?.error?.('❌ Error loading watch list', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function getWatchListItems(listId, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}/items?_ts=${Date.now()}`;
    
    try {
      const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS, signal });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Watch list ${listId} not found`);
        }
        throw new Error(`Failed to load watch list items (${response.status})`);
      }
      const payload = await response.json();
      return payload.data || [];
    } catch (error) {
      window.Logger?.error?.('❌ Error loading watch list items', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createWatchList(payload, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to create watch list (${response.status})`);
      }
      
      const result = await response.json();
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return result.data || null;
    } catch (error) {
      window.Logger?.error?.('❌ Error creating watch list', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
      throw error;
    }
  }

  async function updateWatchList(listId, payload, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload),
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to update watch list (${response.status})`);
      }
      
      const result = await response.json();
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return result.data || null;
    } catch (error) {
      window.Logger?.error?.('❌ Error updating watch list', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function deleteWatchList(listId, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: DEFAULT_HEADERS,
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to delete watch list (${response.status})`);
      }
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Error deleting watch list', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function addTickerToList(listId, tickerData, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}/items`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(tickerData),
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to add ticker to list (${response.status})`);
      }
      
      const result = await response.json();
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return result.data || null;
    } catch (error) {
      window.Logger?.error?.('❌ Error adding ticker to watch list', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function removeTickerFromList(itemId, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/items/${itemId}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: DEFAULT_HEADERS,
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to remove ticker from list (${response.status})`);
      }
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Error removing ticker from watch list', {
        ...PAGE_LOG_CONTEXT,
        itemId,
        error: error?.message,
      });
      throw error;
    }
  }

  async function updateItemOrder(listId, itemsOrder, options = {}) {
    const { signal } = options;
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/watch-lists/${listId}/items/reorder`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ items: itemsOrder }),
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to update item order (${response.status})`);
      }
      
      // Invalidate cache
      await invalidateWatchListsCache();
      
      return true;
    } catch (error) {
      window.Logger?.error?.('❌ Error updating item order', {
        ...PAGE_LOG_CONTEXT,
        listId,
        error: error?.message,
      });
      throw error;
    }
  }

  // Export to window
  window.WatchListsData = {
    // Cache management
    saveWatchListsCache,
    invalidateWatchListsCache,
    clearWatchListsCache,
    
    // Data loading
    fetchWatchListsFromApi,
    loadWatchListsData,
    getWatchList,
    getWatchListItems,
    
    // CRUD operations
    createWatchList,
    updateWatchList,
    deleteWatchList,
    addTickerToList,
    removeTickerFromList,
    updateItemOrder,
  };

  // Also export as WatchListsDataService for consistency
  window.WatchListsDataService = window.WatchListsData;

  window.Logger?.info?.('✅ Watch Lists Data Service initialized', PAGE_LOG_CONTEXT);
})();
