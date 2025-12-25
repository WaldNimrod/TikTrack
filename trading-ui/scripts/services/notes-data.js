/**
 * Notes Data Service
 * ======================================
 * Unified loader + CRUD helper for notes (including attachments).
 * Ensures cache policies via UnifiedCacheManager + CacheTTLGuard.
 */
(function notesDataService() {

// ===== FUNCTION INDEX =====

// === Initialization ===
// - buildUrl() - Buildurl
// - buildMutationRequest() - Buildmutationrequest
// - createNote() - Createnote

// === Event Handlers ===
// - sendNoteMutation() - Sendnotemutation
// - validateNoteRelation() - Validatenoterelation

// === UI Functions ===
// - updateNote() - Updatenote

// === Data Functions ===
// - normalizeNotesPayload() - Normalizenotespayload
// - saveNotesCache() - Savenotescache
// - notifyLoadError() - Notifyloaderror
// - fetchNotesFromApi() - Fetchnotesfromapi
// - loadNotesData() - Loadnotesdata
// - isFormDataPayload() - Isformdatapayload
// - fetchNoteDetails() - Fetchnotedetails
// - getCachedNotes() - Getcachednotes

// === Utility Functions ===
// - invalidateNotesCache() - Invalidatenotescache
// - validateNote() - Validatenote

// === Other ===
// - resolveBaseUrl() - Resolvebaseurl
// - normalizeNoteRecord() - Normalizenoterecord
// - clearNotesCachePattern() - Clearnotescachepattern
// - deleteNote() - Deletenote
// - setCachedNotes() - Setcachednotes

  const CACHE_KEY = 'notes-data';
  const DEFAULT_TTL = 90 * 1000; // 90 שניות
  const PAGE_LOG_CONTEXT = { page: 'notes-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  const ENDPOINTS = {
    list: '/api/notes/',
    detail: (noteId) => `/api/notes/${noteId}`,
  };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.length > 0) {
      return window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`;
    }

    if (window.location?.origin && window.location.origin !== 'null') {
      return window.location.origin.endsWith('/')
        ? window.location.origin
        : `${window.location.origin}/`;
    }

    return '';
  }

  function buildUrl(path) {
    const base = resolveBaseUrl();
    if (!base || path.startsWith('http')) {
      return path;
    }
    return `${base}${path.replace(/^\//, '')}`;
  }

  function normalizeNoteRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    return {
      ...record,
      updated_at: record.updated_at || record.modified_at || record.created_at || null,
    };
  }

  function normalizeNotesPayload(payload) {
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return rows.map(normalizeNoteRecord).filter(Boolean);
  }

  async function saveNotesCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }

    const ttl = options.ttl ?? DEFAULT_TTL;
    try {
      await window.UnifiedCacheManager.save(CACHE_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save notes cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  async function invalidateNotesCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('note-updated');
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

    try {
      if (typeof window.UnifiedCacheManager.invalidate === 'function') {
        await window.UnifiedCacheManager.invalidate(CACHE_KEY);
        return;
      }

      if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
        await window.UnifiedCacheManager.clearByPattern(CACHE_KEY);
      }
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to invalidate notes cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  async function clearNotesCachePattern() {
    if (typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
      try {
        await window.UnifiedCacheManager.clearByPattern(CACHE_KEY);
      } catch (error) {
        window.Logger?.warn?.('⚠️ Failed to clear notes cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת הערות';
    window.Logger?.error?.('❌ Notes load failed', {
      ...PAGE_LOG_CONTEXT,
      error: details,
    });
    window.showErrorNotification?.('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
  }

  async function fetchNotesFromApi(options = {}) {
    const { signal, queryParams } = options;
    const url = new URL(buildUrl(ENDPOINTS.list));

    if (queryParams && typeof queryParams === 'object') {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    if (!url.searchParams.has('_t')) {
      url.searchParams.set('_t', Date.now().toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal, // Include cookies for session-based auth
    });
    
    // Handle 401/308 authentication errors
    if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url.toString())) {
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = new Error(`טעינת הערות נכשלה (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }

    const payload = await response.json();
    const normalized = normalizeNotesPayload(payload);
    await saveNotesCache(normalized, { ttl: DEFAULT_TTL });
    return normalized;
  }

  async function loadNotesData(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal, queryParams } = options;
    const loader = () => fetchNotesFromApi({ signal, queryParams });

    try {
      if (force) {
        await clearNotesCachePattern();
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(CACHE_KEY, loader, {
          ttl,
          afterRead: (cachedData) => {
            if (Array.isArray(cachedData)) {
              window.Logger?.debug?.('📦 Notes served from cache', {
                ...PAGE_LOG_CONTEXT,
                count: cachedData.length,
              });
            }
          },
          afterLoad: (freshData) => {
            window.Logger?.debug?.('🔄 Notes fetched from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(freshData) ? freshData.length : 0,
            });
          },
        });

        if (cached) {
          if (Array.isArray(cached)) {
            return cached;
          }
          if (Array.isArray(cached?.data)) {
            return cached.data;
          }
        }
      }

      if (window.UnifiedCacheManager?.get) {
        try {
          const cached = await window.UnifiedCacheManager.get(CACHE_KEY, { ttl });
          if (cached) {
            return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
          }
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to read notes cache', {
            ...PAGE_LOG_CONTEXT,
            error: error?.message,
          });
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת הערות', error);
      throw error;
    }
  }

  function isFormDataPayload(payload) {
    return typeof FormData !== 'undefined' && payload instanceof FormData;
  }

  function buildMutationRequest({ method, payload, headers = {}, signal }) {
    const requestOptions = {
      method,
      signal,
    };

    if (payload !== undefined && payload !== null) {
      if (isFormDataPayload(payload)) {
        requestOptions.body = payload;
        // Log FormData contents for debugging
        if (window.Logger && payload.get) {
          const content = payload.get('content');
          window.Logger.debug('📤 [buildMutationRequest] FormData payload', {
            hasContent: !!content,
            contentLength: content?.length || 0,
            hasAttachment: !!payload.get('attachment'),
            ...PAGE_LOG_CONTEXT
          });
        }
      } else if (typeof payload === 'object') {
        requestOptions.headers = { ...DEFAULT_HEADERS, ...headers };
        requestOptions.body = JSON.stringify(payload);
        // Log JSON payload contents for debugging
        if (window.Logger) {
          window.Logger.debug('📤 [buildMutationRequest] JSON payload', {
            hasContent: !!payload.content,
            contentLength: payload.content?.length || 0,
            contentType: typeof payload.content,
            related_type_id: payload.related_type_id,
            related_id: payload.related_id,
            payloadKeys: Object.keys(payload),
            ...PAGE_LOG_CONTEXT
          });
        }
      } else {
        requestOptions.body = payload;
      }
    } else if (Object.keys(headers).length > 0) {
      requestOptions.headers = headers;
    }

    return requestOptions;
  }

  async function sendNoteMutation({ noteId, method, payload, headers, signal }) {
    const endpoint = noteId ? ENDPOINTS.detail(noteId) : ENDPOINTS.list;
    const url = buildUrl(endpoint);
    

    const response = await fetch(url, buildMutationRequest({ method, payload, headers, signal }));

    // CRITICAL: Do NOT read response.json() here - let CRUDResponseHandler handle it
    // Reading the response body here would consume it, causing CRUDResponseHandler to fail
    // Cache invalidation should be handled by CRUDResponseHandler or after it processes the response
    
    return response;
  }

  async function createNote(options = {}) {
    const payload = options.payload ?? options.body ?? options.data ?? null;
    return sendNoteMutation({
      method: 'POST',
      payload: payload,
      headers: options.headers,
      signal: options.signal,
    });
  }

  async function updateNote(noteId, options = {}) {
    // Handle case where options is actually the payload directly (for backward compatibility)
    let payload = null;
    let headers = {};
    let signal = null;
    
    if (options && typeof options === 'object' && !options.payload && !options.body && !options.data && !options.headers && !options.signal) {
      // If options looks like a payload (has content, related_type_id, etc.), treat it as payload
      if ('content' in options || 'related_type_id' in options || 'related_id' in options || 'id' in options) {
        payload = options;
        options = {};
      }
    }
    
    payload = payload ?? options.payload ?? options.body ?? options.data ?? null;
    headers = options.headers ?? {};
    signal = options.signal ?? null;
    
    
    return sendNoteMutation({
      noteId,
      method: 'PUT',
      payload: payload,
      headers: headers,
      signal: signal,
    });
  }

  async function deleteNote(noteId, options = {}) {
    return sendNoteMutation({
      noteId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchNoteDetails(noteId, options = {}) {
    const response = await fetch(buildUrl(ENDPOINTS.detail(noteId)), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת הערה ${noteId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch note details', {
        ...PAGE_LOG_CONTEXT,
        noteId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  }

  async function getCachedNotes() {
    if (!window.UnifiedCacheManager?.get) {
      return null;
    }
    try {
      return await window.UnifiedCacheManager.get(CACHE_KEY);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to read notes cache (getCachedNotes)', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
      return null;
    }
  }

  async function setCachedNotes(data, options = {}) {
    await saveNotesCache(data, options);
  }

  if (typeof window.CacheTTLGuard?.setConfig === 'function') {
    window.CacheTTLGuard.setConfig(CACHE_KEY, { ttl: DEFAULT_TTL });
  }

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Validate note data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} noteData - Note data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateNote(noteData) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-note', noteData)
      : `business:validate-note:${JSON.stringify(noteData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/note/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(noteData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/note/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          is_valid: false,
          errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        errors: []
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating note', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  /**
   * Validate note relation using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {number} relatedTypeId - Related type ID
   * @param {number} relatedId - Related entity ID
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateNoteRelation(relatedTypeId, relatedId) {
    const cacheKey = `business:validate-note-relation:${relatedTypeId}:${relatedId}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/note/validate-relation', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({
              related_type_id: relatedTypeId,
              related_id: relatedId
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/note/validate-relation', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          related_type_id: relatedTypeId,
          related_id: relatedId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          is_valid: false,
          errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        errors: []
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating note relation', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  window.NotesData = {
    KEY: CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadNotesData,
    fetchFresh: fetchNotesFromApi,
    saveCache: saveNotesCache,
    invalidateCache: invalidateNotesCache,
    clearPattern: clearNotesCachePattern,
    getCachedNotes,
    setCachedNotes,
    createNote,
    updateNote,
    deleteNote,
    fetchNoteDetails,
    validateNote,
    validateNoteRelation,
  };

  window.Logger?.info?.('✅ Notes Data Service initialized', PAGE_LOG_CONTEXT);
})();


