/**
 * Preferences Data Service
 * ========================
 * Centralizes every API interaction for user preferences so that pages can rely
 * on one cache-aware layer (UnifiedCacheManager + CacheTTLGuard + CacheSyncManager) instead of
 * issuing ad-hoc fetch() calls.
 * 
 * Related Documentation:
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * Function Index:
 * ==============
 * 
 * CACHE MANAGEMENT:
 * - readCache(key, options) - Read from UnifiedCacheManager
 * - saveCache(key, value, options) - Save to UnifiedCacheManager
 * - clearCachePattern(prefix) - Clear cache by pattern (fallback only)
 * 
 * PREFERENCE OPERATIONS:
 * - loadPreference({ preferenceName, userId, profileId, force, ttl }) - Load single preference
 * - loadPreferenceGroup({ groupName, userId, profileId, force, ttl }) - Load preference group
 * - loadPreferencesByNames({ names, userId, profileId, force, ttl }) - Load multiple preferences
 * - loadAllPreferencesRaw({ userId, profileId, force, ttl }) - Load all preferences
 * - savePreference({ preferenceName, value, userId, profileId }) - Save single preference (uses CacheSyncManager)
 * - savePreferences({ preferences, userId, profileId }) - Save multiple preferences (uses CacheSyncManager)
 * 
 * PROFILE OPERATIONS:
 * - loadProfiles({ userId, force, ttl }) - Load all profiles
 * - createProfile({ name, description, userId }) - Create new profile (uses CacheSyncManager)
 * - activateProfile({ profileId, userId }) - Activate profile (uses CacheSyncManager)
 * - deleteProfile({ profileId, userId }) - Delete profile (uses CacheSyncManager)
 * 
 * METADATA OPERATIONS:
 * - loadPreferenceGroupsMetadata({ force, ttl }) - Load groups metadata
 * - loadPreferenceTypes({ force, ttl }) - Load preference types
 * - loadDefaultPreference(preferenceName, { userId, profileId, force, ttl }) - Load default value
 * - loadPreferenceInfo(preferenceName) - Load preference info
 * - checkPreferenceExists(preferenceName) - Check if preference exists
 * - checkHealth() - Health check
 * 
 * UTILITY FUNCTIONS:
 * - buildDedupeKey(url, options) - Build dedupe key for request deduplication
 * - resolveBaseUrl() - Resolve base URL for API calls
 * - buildUrl(path) - Build full URL
 * - buildUrlWithParams(path, params) - Build URL with query params
 * - fetchJson(path, options) - Generic fetch with error handling
 * - buildCacheKey(prefix, parts) - Build cache key
 * - normalizePreferenceEntries(rawPreferences) - Normalize preference entries
 * - normalizePreferencesPayload(payload, fallback) - Normalize preferences payload
 * - normalizeProfilesPayload(payload, userId) - Normalize profiles payload
 * - normalizeGroupsPayload(payload) - Normalize groups payload
 * - normalizeTypesPayload(payload) - Normalize types payload
 * - normalizeGroupRecord(record) - Normalize group record
 * 
 * @version 2.0.0
 * @created January 2025
 * @updated January 2025 - Added CacheSyncManager integration
 * @author TikTrack Development Team
 */
(function initPreferencesDataService() {
  const PAGE_LOG_CONTEXT = { page: 'preferences-data' };

  // In-flight request dedupe registry (low-level - per URL)
  const inflight = new Map();
  // High-level function dedupe registry (prevents duplicate calls to same function with same params)
  const functionInflight = new Map();
  // ETag registry per URL
  const etags = new Map();
  // Simple circuit breaker for 429 bursts
  let rateLimitedUntil = 0;
  
  // Helper to build function-level dedupe key
  function buildFunctionDedupeKey(functionName, params) {
    const userId = params?.userId ?? params?.user_id ?? 'default';
    const profileId = params?.profileId ?? params?.profile_id ?? 'active';
    const force = params?.force ?? false;
    return `${functionName}:u${userId}:p${profileId}:f${force}`;
  }

  // Utility to build a stable dedupe key
  function buildDedupeKey(url, options) {
    const method = (options?.method || 'GET').toUpperCase();
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method} ${url} ${body}`;
    }

  const KEY_PREFIXES = {
    all: 'preference-data',
    single: 'preference-single',
    group: 'preference-group',
    multiple: 'preference-multiple',
    profiles: 'profile-data',
    groups: 'preference-groups',
    types: 'preference-types',
    defaults: 'preference-default',
  };

  const DEFAULT_TTL = {
    all: 2 * 60 * 1000,
    single: 60 * 1000,
    group: 2 * 60 * 1000,
    multiple: 2 * 60 * 1000,
    profiles: 2 * 60 * 1000,
    groups: 5 * 60 * 1000,
    types: 15 * 60 * 1000,
    defaults: 10 * 60 * 1000,
  };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
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

  function buildUrlWithParams(path, params = {}) {
    const url = new URL(buildUrl(path), window.location?.origin || 'http://127.0.0.1:8080');
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    if (!url.searchParams.has('_t')) {
      url.searchParams.set('_t', Date.now().toString());
    }
    return url.toString();
  }

  async function fetchJson(path, options = {}) {
    const {
      method = 'GET',
      params = {},
      body = null,
      headers = {},
      signal,
      credentials = 'same-origin',
      // advanced options
      timeoutMs = 15000,
      dedupe = true,
      maxRetries = 2,
    } = options;

    const url = buildUrlWithParams(path, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Dedupe identical requests
    const key = buildDedupeKey(url, { method, body });
    if (dedupe && inflight.has(key)) {
      try {
        return await inflight.get(key);
      } catch (e) {
        // fallthrough to perform a fresh call if previous failed
      }
    }

    const doFetch = async (attempt = 0) => {
      // Circuit breaker: if recently rate-limited, delay
      const now = Date.now();
      if (rateLimitedUntil && now < rateLimitedUntil) {
        const waitMs = Math.min(rateLimitedUntil - now, 3000);
        await new Promise(r => setTimeout(r, waitMs));
      }
      try {
        const hdrs = {
          method,
          headers: {
            ...DEFAULT_HEADERS,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
          credentials,
        };
        // Send If-None-Match ETag when available
        const etag = etags.get(url);
        if (etag) {
          hdrs.headers['If-None-Match'] = etag;
        }
        const resp = await fetch(url, {
          ...hdrs,
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal,
          credentials,
        });
        return resp;
      } catch (e) {
        if (attempt < maxRetries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt), 4000);
          await new Promise(r => setTimeout(r, backoff));
          return doFetch(attempt + 1);
        }
        throw e;
      }
    };

    const fetchPromise = doFetch(0)
      .finally(() => {
        clearTimeout(timeoutId);
        inflight.delete(key);
      });

    if (dedupe) {
      inflight.set(key, fetchPromise);
    }

    const response = await fetchPromise;

    let payload = null;
    try {
      // Handle 304 – serve from cache when possible
      if (response.status === 304) {
        // Attempt to read cached response based on path+params cache key(s)
        // Callers of fetchJson must manage their own cache reads; here we only short-circuit parse
        return { status: 304, fromCache: true };
      }
      
      // For 429 errors, read as text first in case JSON parsing fails
      if (response.status === 429) {
        try {
          const text = await response.text();
          if (text) {
            try {
              payload = JSON.parse(text);
            } catch (_) {
              // If not valid JSON, create a default payload
              payload = {
                status: 'error',
                error_code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded'
              };
            }
          } else {
            payload = {
              status: 'error',
              error_code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded'
            };
          }
        } catch (_) {
          // If we can't read the response, create a default payload
          payload = {
            status: 'error',
            error_code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded'
          };
        }
      } else {
        // For other status codes, try JSON parsing normally
        payload = await response.json();
      }
    } catch (error) {
      // If JSON parsing failed and it's not a 429 we already handled, log warning
      if (response.status !== 429) {
        window.Logger?.warn?.('⚠️ Failed to parse JSON response for preferences request', {
          ...PAGE_LOG_CONTEXT,
          url,
          error: error?.message,
        });
      }
      // If payload is still null and it's a 429, create default payload
      if (response.status === 429 && !payload) {
        payload = {
          status: 'error',
          error_code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded'
        };
      }
    }

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        payload?.error ||
        payload?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.payload = payload;
      // Authentication handling: mark error for callers, but avoid using the
      // notification system here (it itself relies on preferences and can
      // create recursive errors if preferences endpoints return 401).
      if (response.status === 401 || response.status === 403) {
        error.isAuthError = true;
        error.status = response.status;
        try {
          window.Logger?.warn?.('⚠️ Preferences request failed with authentication error', {
            ...PAGE_LOG_CONTEXT,
            url,
            status: response.status,
            message: errorMessage,
          });
        } catch (_) { /* noop */ }
      } else if (response.status === 429) {
        // Respect Retry-After header if present, then retry transparently
        const retryAfter = Number(response.headers?.get?.('Retry-After')) || 1;
        // Jitter to avoid herd effects
        const jitter = Math.floor(Math.random() * 250);
        // Trip short-lived circuit breaker
        rateLimitedUntil = Date.now() + Math.min(retryAfter * 1000 + jitter, 5000);
        if ((options.maxRetries ?? 2) > 0) {
          await new Promise(r => setTimeout(r, Math.min(retryAfter * 1000 + jitter, 5000)));
          // Retry once with reduced maxRetries to avoid infinite loop
          return await fetchJson(path, {
            ...options,
            maxRetries: (options.maxRetries ?? 2) - 1,
          });
        }
        error.status = 429;
        error.isRateLimited = true;
      }
      throw error;
    }

    // Store latest ETag if present
    try {
      const respEtag = response.headers?.get?.('ETag');
      if (respEtag) {
        etags.set(url, respEtag);
      }
    } catch {}

    return payload;
  }

  function buildCacheKey(prefix, parts = []) {
    if (!parts.length) {
      return prefix;
    }
    return `${prefix}::${parts.join('::')}`;
  }

  async function readCache(key, options = {}) {
    if (!window.UnifiedCacheManager?.get) {
      return null;
    }
    try {
      return await window.UnifiedCacheManager.get(key, options);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to read preferences cache', {
        ...PAGE_LOG_CONTEXT,
        key,
        error: error?.message,
      });
      return null;
    }
  }

  async function saveCache(key, value, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    try {
      await window.UnifiedCacheManager.save(key, value, options);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save preferences cache', {
        ...PAGE_LOG_CONTEXT,
        key,
        error: error?.message,
      });
    }
  }

  async function clearCachePattern(prefix) {
    if (typeof window.UnifiedCacheManager?.clearByPattern !== 'function') {
      return;
    }
    try {
      await window.UnifiedCacheManager.clearByPattern(prefix);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to clear preferences cache pattern', {
        ...PAGE_LOG_CONTEXT,
        prefix,
        error: error?.message,
      });
    }
  }

  function normalizePreferenceEntries(rawPreferences) {
    // DEBUG: Log input
    window.Logger?.debug?.('🔍 DEBUG: normalizePreferenceEntries input', {
      ...PAGE_LOG_CONTEXT,
      inputType: Array.isArray(rawPreferences) ? 'array' : typeof rawPreferences,
      inputLength: Array.isArray(rawPreferences) ? rawPreferences.length : 'N/A',
      inputSample: Array.isArray(rawPreferences) && rawPreferences.length > 0 
        ? rawPreferences.slice(0, 3) 
        : rawPreferences,
    });
    
    if (Array.isArray(rawPreferences)) {
      const map = {};
      let skippedCount = 0;
      rawPreferences.forEach((pref, index) => {
        const key =
          pref?.preference_name ||
          pref?.preferenceName ||
          pref?.name ||
          pref?.html_id;
        if (!key) {
          skippedCount++;
          window.Logger?.debug?.(`⚠️ Skipping preference entry ${index} - no key found`, {
            ...PAGE_LOG_CONTEXT,
            entry: pref,
          });
          return;
        }
        const value =
          pref?.saved_value ??
          pref?.value ??
          pref?.default_value ??
          pref?.defaultValue ??
          null;
        map[key] = value;
      });
      
      // DEBUG: Log output
      window.Logger?.debug?.('🔍 DEBUG: normalizePreferenceEntries output (array)', {
        ...PAGE_LOG_CONTEXT,
        inputLength: rawPreferences.length,
        outputKeys: Object.keys(map),
        outputCount: Object.keys(map).length,
        skippedCount,
        sampleEntries: Object.fromEntries(Object.entries(map).slice(0, 5)),
      });
      
      return { map, metadata: rawPreferences };
    }

    if (rawPreferences && typeof rawPreferences === 'object') {
      // DEBUG: Log output
      window.Logger?.debug?.('🔍 DEBUG: normalizePreferenceEntries output (object)', {
        ...PAGE_LOG_CONTEXT,
        inputKeys: Object.keys(rawPreferences),
        outputKeys: Object.keys(rawPreferences),
        outputCount: Object.keys(rawPreferences).length,
      });
      
      return { map: rawPreferences, metadata: [] };
    }

    // DEBUG: Log empty output
    window.Logger?.warn?.('⚠️ DEBUG: normalizePreferenceEntries returning empty map', {
      ...PAGE_LOG_CONTEXT,
      inputType: typeof rawPreferences,
      inputValue: rawPreferences,
    });
    
    return { map: {}, metadata: [] };
  }

  function normalizePreferencesPayload(payload = {}, fallback = {}) {
    const data = payload?.data || {};
    const rawPreferences =
      data.preferences ??
      payload.preferences ??
      payload?.data?.data ??
      payload?.data ??
      {};

    const { map: normalizedMap, metadata } = normalizePreferenceEntries(rawPreferences);

    const profileContext =
      data.profile_context ||
      payload.profile_context ||
      fallback.profileContext ||
      null;

    return {
      preferences: normalizedMap,
      preferencesMetadata: metadata,
      profileContext,
      resolvedProfileId:
        profileContext?.resolved_profile_id ??
        data.profile_id ??
        fallback.profileId ??
        null,
      requestedProfileId:
        profileContext?.requested_profile_id ??
        data.requested_profile_id ??
        null,
      userId: profileContext?.user?.id ?? data.user_id ?? fallback.userId ?? 1,
      raw: payload,
    };
  }

  function normalizeProfilesPayload(payload = {}, userId = 1) {
    const profiles = Array.isArray(payload?.data?.profiles)
      ? payload.data.profiles
      : Array.isArray(payload?.profiles)
        ? payload.profiles
        : [];
    const profileContext = payload?.data?.profile_context ||
      payload.profile_context ||
      null;

    return {
      profiles,
      profileContext,
      count: profiles.length,
      userId,
      activeProfileId:
        profileContext?.resolved_profile_id ??
        profileContext?.active_profile_id ??
        (profiles.find(p => p?.active)?.id ?? 0),
      raw: payload,
    };
  }

  function normalizeGroupsPayload(payload = {}) {
    const groups = Array.isArray(payload?.data?.groups)
      ? payload.data.groups
      : Array.isArray(payload?.groups)
        ? payload.groups
        : [];
    return {
      groups,
      count: groups.length,
      raw: payload,
    };
  }

  function normalizeTypesPayload(payload = {}) {
    const types = Array.isArray(payload?.data?.preference_types)
      ? payload.data.preference_types
      : Array.isArray(payload?.preference_types)
        ? payload.preference_types
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
    return {
      types,
      count: types.length,
      raw: payload,
    };
  }

  async function loadPreference({ preferenceName, userId = 1, profileId = null, force = false, ttl = DEFAULT_TTL.single } = {}) {
    if (!preferenceName) {
      return { value: null };
    }

    const cacheKey = buildCacheKey(KEY_PREFIXES.single, [
      preferenceName,
      `u${userId}`,
      `p${profileId ?? 'active'}`,
    ]);

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached !== null && cached !== undefined) {
        return {
          value: cached,
          cached: true,
        };
      }
    }

    const params = {
      preference_name: preferenceName,
      user_id: userId,
    };
    if (profileId !== null && profileId !== undefined) {
      params.profile_id = profileId;
    }

    const payload = await fetchJson('/api/preferences/user/single', { params });
    const value = payload?.data?.value ?? payload?.value ?? null;

    await saveCache(cacheKey, value, { ttl, layer: 'localStorage' });

    return {
      value,
      cached: false,
      raw: payload,
    };
  }

  function normalizeGroupRecord(record) {
    const rawPreferences = record?.preferences ?? {};
    const { map, metadata } = normalizePreferenceEntries(rawPreferences);
    return {
      ...record,
      preferences: map,
      preferencesMetadata: record?.preferencesMetadata || metadata,
    };
  }

  async function loadPreferenceGroup({ groupName, userId = 1, profileId = null, force = false, ttl = DEFAULT_TTL.group } = {}) {
    if (!groupName) {
      return { preferences: {} };
    }

    const cacheKey = buildCacheKey(KEY_PREFIXES.group, [
      groupName,
      `u${userId}`,
      `p${profileId ?? 'active'}`,
    ]);

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached) {
        const normalizedCache = normalizeGroupRecord(cached);
        if (normalizedCache !== cached) {
          await saveCache(cacheKey, normalizedCache, { ttl, layer: 'localStorage' });
        }
        return normalizedCache;
      }
    }

    const params = {
      group: groupName,
      user_id: userId,
    };
    if (profileId !== null && profileId !== undefined) {
      params.profile_id = profileId;
    }

    const payload = await fetchJson('/api/preferences/user/group', { params });
    const rawPreferences = payload?.data?.preferences || {};
    const { map: normalizedPreferences, metadata } = normalizePreferenceEntries(rawPreferences);
    const normalized = {
      preferences: normalizedPreferences,
      preferencesMetadata: metadata,
      profileContext: payload?.data?.profile_context || null,
      raw: payload,
    };

    await saveCache(cacheKey, normalized, { ttl, layer: 'localStorage' });
    return normalized;
  }

  async function loadPreferencesByNames({ names = [], userId = 1, profileId = null, force = false, ttl = DEFAULT_TTL.multiple } = {}) {
    if (!Array.isArray(names) || names.length === 0) {
      return {};
    }

    const cacheKey = buildCacheKey(KEY_PREFIXES.multiple, [
      names.join(','),
      `u${userId}`,
      `p${profileId ?? 'active'}`,
    ]);

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached) {
        // הגנה: מיגרציה אוטומטית של מערכים/פורמטים ישנים למפה נורמלית
        if (Array.isArray(cached)) {
          const { map } = normalizePreferenceEntries(cached);
          await saveCache(cacheKey, map, { ttl, layer: 'localStorage' });
          return map;
        }
        return typeof cached === 'object' ? cached : {};
      }
    }

    const payload = await fetchJson('/api/preferences/user/multiple', {
      method: 'POST',
      body: {
        preference_names: names,
        user_id: userId,
        profile_id: profileId,
      },
    });

    // נורמליזציה: תמיכה גם במקרה שהשרת מחזיר מערך ערכים/רשומות
    const raw = payload?.data?.preferences ?? payload?.preferences ?? payload?.data ?? {};
    const { map: normalizedMap } = normalizePreferenceEntries(raw);
    await saveCache(cacheKey, normalizedMap, { ttl, layer: 'localStorage' });
    return normalizedMap;
  }

  async function loadAllPreferencesRaw({ userId = 1, profileId = null, force = false, ttl = DEFAULT_TTL.all } = {}) {
    // High-level deduplication: prevent duplicate calls to this function with same params
    const dedupeKey = buildFunctionDedupeKey('loadAllPreferencesRaw', { userId, profileId, force });
    if (functionInflight.has(dedupeKey)) {
      window.Logger?.debug?.('⏭️ loadAllPreferencesRaw deduplicated - returning existing promise', {
        ...PAGE_LOG_CONTEXT,
        dedupeKey,
      });
      return await functionInflight.get(dedupeKey);
    }
    
    const loadPromise = (async () => {
      try {
        const cacheKey = buildCacheKey(KEY_PREFIXES.all, [
          `u${userId}`,
          `p${profileId ?? 'active'}`,
        ]);

        if (!force) {
          // Try all cache layers in order: Memory → localStorage → IndexedDB → Backend
          // UnifiedCacheManager handles this automatically, but we can specify fallback layers
          let cached = null;
          let cacheLayer = null;
          
          // Try memory first (fastest)
          if (window.UnifiedCacheManager?.layers?.memory) {
            cached = await readCache(cacheKey, { ttl, layer: 'memory' });
            if (cached) {
              cacheLayer = 'memory';
            }
          }
          
          // Try localStorage if memory miss
          if (!cached && window.UnifiedCacheManager?.layers?.localStorage) {
            cached = await readCache(cacheKey, { ttl, layer: 'localStorage' });
            if (cached) {
              cacheLayer = 'localStorage';
            }
          }
          
          // Try IndexedDB if localStorage miss
          if (!cached && window.UnifiedCacheManager?.layers?.indexedDB) {
            cached = await readCache(cacheKey, { ttl, layer: 'indexedDB' });
            if (cached) {
              cacheLayer = 'indexedDB';
            }
          }
          
          // Fallback to UnifiedCacheManager's automatic layer selection
          if (!cached) {
            cached = await readCache(cacheKey, { ttl });
            if (cached) {
              cacheLayer = 'auto';
            }
          }
          
          if (cached) {
            // Auto-migrate legacy array/object formats to normalized map
            const normalized = Array.isArray(cached?.preferences) || Array.isArray(cached)
              ? normalizePreferencesPayload({ data: { preferences: cached?.preferences ?? cached } }, { userId, profileId })
              : (cached?.preferences ? { ...cached } : normalizePreferencesPayload(cached, { userId, profileId }));
            
            // Cache warming: save to memory for faster subsequent access
            if (normalized && cacheLayer !== 'memory' && window.UnifiedCacheManager?.layers?.memory) {
              try {
                await saveCache(cacheKey, normalized, { ttl: Math.min(ttl, 300000), layer: 'memory' });
                window.Logger?.debug?.('🔥 Cache warming: saved to memory layer', {
                  ...PAGE_LOG_CONTEXT,
                  key: cacheKey,
                });
              } catch (warmError) {
                // Non-critical - continue even if cache warming fails
                window.Logger?.debug?.('⚠️ Cache warming failed (non-critical)', {
                  ...PAGE_LOG_CONTEXT,
                  error: warmError?.message,
                });
              }
            }
            
            if (normalized && normalized !== cached) {
              await saveCache(cacheKey, normalized, { ttl, layer: 'localStorage' });
            }
            
            window.Logger?.debug?.('✅ Cache hit for all preferences', {
              ...PAGE_LOG_CONTEXT,
              cacheLayer,
              key: cacheKey,
            });
            
            return normalized;
          }
        }

        // Cache miss - load from backend
        window.Logger?.debug?.('📡 Cache miss - loading from backend', {
          ...PAGE_LOG_CONTEXT,
          key: cacheKey,
        });

        const params = {
          user_id: userId,
        };
        if (profileId !== null && profileId !== undefined) {
          params.profile_id = profileId;
        }

        const payload = await fetchJson('/api/preferences/user', { params });
        
        window.Logger?.debug?.('🔍 Raw API response from /api/preferences/user', {
          ...PAGE_LOG_CONTEXT,
          userId,
          profileId,
          hasPayload: !!payload,
          payloadKeys: payload ? Object.keys(payload) : [],
          hasData: !!payload?.data,
          dataKeys: payload?.data ? Object.keys(payload.data) : [],
          preferencesType: Array.isArray(payload?.data?.preferences) ? 'array' : typeof payload?.data?.preferences,
          preferencesLength: Array.isArray(payload?.data?.preferences) ? payload.data.preferences.length : 'N/A',
          preferencesSample: Array.isArray(payload?.data?.preferences) && payload.data.preferences.length > 0 
            ? payload.data.preferences.slice(0, 3) 
            : payload?.data?.preferences,
          fullPayload: payload, // Full payload for debugging
        });
        
        const normalized = normalizePreferencesPayload(payload, { userId, profileId });
        
        window.Logger?.debug?.('🔍 Normalized preferences payload', {
          ...PAGE_LOG_CONTEXT,
          userId,
          profileId,
          hasPreferences: !!normalized?.preferences,
          preferencesType: typeof normalized?.preferences,
          preferencesKeys: normalized?.preferences ? Object.keys(normalized.preferences) : [],
          preferencesCount: normalized?.preferences ? Object.keys(normalized.preferences).length : 0,
          preferencesSample: normalized?.preferences ? Object.fromEntries(Object.entries(normalized.preferences).slice(0, 5)) : null,
          hasProfileContext: !!normalized?.profileContext,
          normalizedKeys: normalized ? Object.keys(normalized) : [],
        });

        // Save to all cache layers for optimal performance
        // Save to localStorage (primary)
        await saveCache(cacheKey, normalized, { ttl, layer: 'localStorage' });
        
        // Cache warming: also save to memory for immediate access
        if (window.UnifiedCacheManager?.layers?.memory) {
          try {
            await saveCache(cacheKey, normalized, { ttl: Math.min(ttl, 300000), layer: 'memory' });
          } catch (warmError) {
            // Non-critical
            window.Logger?.debug?.('⚠️ Memory cache warming failed (non-critical)', {
              ...PAGE_LOG_CONTEXT,
              error: warmError?.message,
            });
          }
        }
        
        return normalized;
      } catch (error) {
        window.Logger?.error?.('❌ Error in loadAllPreferencesRaw', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message || error,
          userId,
          profileId,
        });
        throw error;
      } finally {
        functionInflight.delete(dedupeKey);
      }
    })();
    
    functionInflight.set(dedupeKey, loadPromise);
    return await loadPromise;
  }

  async function savePreference({ preferenceName, value, userId = 1, profileId = null }) {
    if (!preferenceName) {
      throw new Error('Preference name is required');
    }

    // Use CRUDResponseHandler for consistent response handling
    const url = buildUrlWithParams('/api/preferences/user/single', {});
    const response = await fetch(url, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        preference_name: preferenceName,
        value,
        user_id: userId,
        profile_id: profileId,
      }),
    });

    // Use CRUDResponseHandler for consistent response handling
    if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
      const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
        successMessage: `העדפה ${preferenceName} נשמרה בהצלחה`,
        entityName: 'העדפה',
        requiresHardReload: false,
        // Note: preferences don't use modals or tables, so modalId and reloadFn are not needed
      });
      
      // Cache invalidation via CacheSyncManager (preferred method)
      if (window.CacheSyncManager?.invalidateByAction) {
        try {
          await window.CacheSyncManager.invalidateByAction('preference-updated');
        } catch (error) {
          // Silent fallback - CacheSyncManager errors are handled gracefully
          // window.Logger?.debug?.('CacheSyncManager.invalidateByAction failed, falling back', {
          //   ...PAGE_LOG_CONTEXT,
          //   error: error?.message,
          // });
          // Fallback to direct cache clearing
          await clearCachePattern(KEY_PREFIXES.single);
          await clearCachePattern(KEY_PREFIXES.all);
        }
      } else {
        // Fallback to direct cache clearing if CacheSyncManager not available
        await clearCachePattern(KEY_PREFIXES.single);
        await clearCachePattern(KEY_PREFIXES.all);
      }
      
      // Unified cache refresh: request profile refresh when available
      if (window.UnifiedCacheManager?.refreshUserPreferences) {
        try {
          await window.UnifiedCacheManager.refreshUserPreferences(
            profileId ?? 'active',
            null,
            { userId, preferenceNames: [preferenceName] },
          );
        } catch (_) { /* best-effort */ }
      }
      
      return crudResult;
    } else {
      // Fallback to original fetchJson if CRUDResponseHandler not available
      // Silent fallback - CRUDResponseHandler is optional, not critical
      // window.Logger?.debug?.('CRUDResponseHandler not available, using fallback', {
      //   ...PAGE_LOG_CONTEXT,
      // });
      const payload = await fetchJson('/api/preferences/user/single', {
        method: 'POST',
        body: {
          preference_name: preferenceName,
          value,
          user_id: userId,
          profile_id: profileId,
        },
      });

      // Cache invalidation via CacheSyncManager (preferred method)
      if (window.CacheSyncManager?.invalidateByAction) {
        try {
          await window.CacheSyncManager.invalidateByAction('preference-updated');
        } catch (error) {
          // Silent fallback - CacheSyncManager errors are handled gracefully
          // window.Logger?.debug?.('CacheSyncManager.invalidateByAction failed, falling back', {
          //   ...PAGE_LOG_CONTEXT,
          //   error: error?.message,
          // });
          // Fallback to direct cache clearing
          await clearCachePattern(KEY_PREFIXES.single);
          await clearCachePattern(KEY_PREFIXES.all);
        }
      } else {
        // Fallback to direct cache clearing if CacheSyncManager not available
        await clearCachePattern(KEY_PREFIXES.single);
        await clearCachePattern(KEY_PREFIXES.all);
      }
      
      // Unified cache refresh: request profile refresh when available
      if (window.UnifiedCacheManager?.refreshUserPreferences) {
        try {
          await window.UnifiedCacheManager.refreshUserPreferences(
            profileId ?? 'active',
            null,
            { userId, preferenceNames: [preferenceName] },
          );
        } catch (_) { /* best-effort */ }
      }
      return payload;
    }
  }

  /**
   * Save multiple preferences
   * 
   * @param {Object} options - Preferences options
   * @param {Object} options.preferences - Object with preference names as keys and values
   * @param {number} [options.userId=1] - User ID
   * @param {number|null} [options.profileId=null] - Profile ID (null for active profile)
   * @returns {Promise<Object>} API response payload
   * 
   * @description
   * Saves multiple preferences and invalidates cache via CacheSyncManager.
   * Uses 'preference-updated' action for cache invalidation with fallback to direct cache clearing.
   * 
   * Cache Invalidation:
   * - Primary: CacheSyncManager.invalidateByAction('preference-updated')
   * - Fallback: UnifiedCacheManager.clearByPattern() for 'preference-single' and 'preference-data'
   * 
   * Related Documentation:
   * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
   */
  async function savePreferences({ preferences = {}, userId = 1, profileId = null }) {
    if (!preferences || typeof preferences !== 'object' || Object.keys(preferences).length === 0) {
      return { success: false, message: 'No preferences provided' };
    }

    // Use CRUDResponseHandler for consistent response handling
    const url = buildUrlWithParams('/api/preferences/user', {});
    const response = await fetch(url, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        preferences,
        user_id: userId,
        profile_id: profileId,
      }),
    });

    // Use CRUDResponseHandler for consistent response handling
    if (window.CRUDResponseHandler && typeof window.CRUDResponseHandler.handleSaveResponse === 'function') {
      const crudResult = await window.CRUDResponseHandler.handleSaveResponse(response, {
        successMessage: `${Object.keys(preferences).length} העדפות נשמרו בהצלחה`,
        entityName: 'העדפות',
        requiresHardReload: false,
        // Note: preferences don't use modals or tables, so modalId and reloadFn are not needed
      });
      
      // Cache invalidation via CacheSyncManager (preferred method)
      if (window.CacheSyncManager?.invalidateByAction) {
        try {
          await window.CacheSyncManager.invalidateByAction('preference-updated');
        } catch (error) {
          // Silent fallback - CacheSyncManager errors are handled gracefully
          // window.Logger?.debug?.('CacheSyncManager.invalidateByAction failed, falling back', {
          //   ...PAGE_LOG_CONTEXT,
          //   error: error?.message,
          // });
          // Fallback to direct cache clearing
          await clearCachePattern(KEY_PREFIXES.single);
          await clearCachePattern(KEY_PREFIXES.all);
        }
      } else {
        // Fallback to direct cache clearing if CacheSyncManager not available
        await clearCachePattern(KEY_PREFIXES.single);
        await clearCachePattern(KEY_PREFIXES.all);
      }
      
      // Unified cache refresh: request profile refresh when available
      if (window.UnifiedCacheManager?.refreshUserPreferences) {
        try {
          await window.UnifiedCacheManager.refreshUserPreferences(
            profileId ?? 'active',
            null,
            { userId, preferenceNames: Object.keys(preferences) },
          );
        } catch (_) { /* best-effort */ }
      }
      
      return crudResult;
    } else {
      // Fallback to original fetchJson if CRUDResponseHandler not available
      // Silent fallback - CRUDResponseHandler is optional, not critical
      // window.Logger?.debug?.('CRUDResponseHandler not available, using fallback', {
      //   ...PAGE_LOG_CONTEXT,
      // });
      const payload = await fetchJson('/api/preferences/user', {
        method: 'POST',
        body: {
          preferences,
          user_id: userId,
          profile_id: profileId,
        },
      });

      // Cache invalidation via CacheSyncManager (preferred method)
      if (window.CacheSyncManager?.invalidateByAction) {
        try {
          await window.CacheSyncManager.invalidateByAction('preference-updated');
        } catch (error) {
          // Silent fallback - CacheSyncManager errors are handled gracefully
          // window.Logger?.debug?.('CacheSyncManager.invalidateByAction failed, falling back', {
          //   ...PAGE_LOG_CONTEXT,
          //   error: error?.message,
          // });
          // Fallback to direct cache clearing
          await clearCachePattern(KEY_PREFIXES.single);
          await clearCachePattern(KEY_PREFIXES.all);
        }
      } else {
        // Fallback to direct cache clearing if CacheSyncManager not available
        await clearCachePattern(KEY_PREFIXES.single);
        await clearCachePattern(KEY_PREFIXES.all);
      }
      
      // Unified cache refresh: request profile refresh when available
      if (window.UnifiedCacheManager?.refreshUserPreferences) {
        try {
          await window.UnifiedCacheManager.refreshUserPreferences(
            profileId ?? 'active',
            null,
            { userId, preferenceNames: Object.keys(preferences) },
          );
        } catch (_) { /* best-effort */ }
      }
      return payload;
    }
  }

  async function loadProfiles({ userId = 1, force = false, ttl = DEFAULT_TTL.profiles } = {}) {
    // High-level deduplication: prevent duplicate calls to this function with same params
    const dedupeKey = buildFunctionDedupeKey('loadProfiles', { userId, force });
    if (functionInflight.has(dedupeKey)) {
      window.Logger?.debug?.('⏭️ loadProfiles deduplicated - returning existing promise', {
        ...PAGE_LOG_CONTEXT,
        dedupeKey,
      });
      return await functionInflight.get(dedupeKey);
    }
    
    const loadPromise = (async () => {
      try {
        const cacheKey = buildCacheKey(KEY_PREFIXES.profiles, [`u${userId}`]);

        if (!force) {
          const cached = await readCache(cacheKey, { ttl });
          if (cached) {
            return cached;
          }
        }

        const payload = await fetchJson('/api/preferences/profiles', {
          params: { user_id: userId },
        });

        const normalized = normalizeProfilesPayload(payload, userId);
        await saveCache(cacheKey, normalized, { ttl });
        return normalized;
      } finally {
        functionInflight.delete(dedupeKey);
      }
    })();
    
    functionInflight.set(dedupeKey, loadPromise);
    return await loadPromise;
  }

  /**
   * Create a new user profile
   * 
   * @param {Object} options - Profile options
   * @param {string} options.name - Profile name
   * @param {string} [options.description=''] - Profile description
   * @param {number} [options.userId=1] - User ID
   * @returns {Promise<Object>} API response payload
   * 
   * @description
   * Creates a new user profile and invalidates cache via CacheSyncManager.
   * Uses 'profile-created' action for cache invalidation with fallback to direct cache clearing.
   * 
   * Cache Invalidation:
   * - Primary: CacheSyncManager.invalidateByAction('profile-created')
   * - Fallback: UnifiedCacheManager.clearByPattern() for 'profile-data'
   * 
   * Related Documentation:
   * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
   */
  async function createProfile({ name, description = '', userId = 1 }) {
    if (!name) {
      throw new Error('Profile name is required');
    }

    const payload = await fetchJson('/api/preferences/profiles', {
      method: 'POST',
      body: {
        user_id: userId,
        profile_name: name,
        description: description || `Profile ${name}`,
        is_default: false,
      },
    });

    // Cache invalidation via CacheSyncManager (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('profile-created');
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
        // Fallback to direct cache clearing
        await clearCachePattern(KEY_PREFIXES.profiles);
      }
    } else {
      // Fallback to direct cache clearing if CacheSyncManager not available
      await clearCachePattern(KEY_PREFIXES.profiles);
    }
    return payload;
  }

  /**
   * Activate a user profile
   * 
   * @param {Object} options - Profile activation options
   * @param {number} options.profileId - Profile ID to activate (0 for default profile)
   * @param {number} [options.userId=1] - User ID
   * @returns {Promise<Object>} API response payload
   * 
   * @description
   * Activates a user profile and invalidates cache via CacheSyncManager.
   * Uses 'profile-switched' action for cache invalidation with fallback to direct cache clearing.
   * If profileId is 0, returns success without API call (default profile).
   * 
   * Cache Invalidation:
   * - Primary: CacheSyncManager.invalidateByAction('profile-switched')
   * - Fallback: UnifiedCacheManager.clearByPattern() for 'profile-data' and 'preference-data'
   * 
   * Related Documentation:
   * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
   */
  async function activateProfile({ profileId, userId = 1 }) {
    if (profileId === 0) {
      return { success: true, message: 'Default profile selected (no API call)' };
    }

    const payload = await fetchJson('/api/preferences/profiles/activate', {
      method: 'POST',
      body: {
        user_id: userId,
        profile_id: profileId,
      },
    });

    // Cache invalidation via CacheSyncManager (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('profile-switched');
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
        // Fallback to direct cache clearing
        await clearCachePattern(KEY_PREFIXES.profiles);
        await clearCachePattern(KEY_PREFIXES.all);
      }
    } else {
      // Fallback to direct cache clearing if CacheSyncManager not available
      await clearCachePattern(KEY_PREFIXES.profiles);
      await clearCachePattern(KEY_PREFIXES.all);
    }
    return payload;
  }

  /**
   * Delete a user profile
   * 
   * @param {Object} options - Profile deletion options
   * @param {number} options.profileId - Profile ID to delete
   * @param {number} [options.userId=1] - User ID
   * @returns {Promise<Object>} API response payload
   * 
   * @description
   * Deletes a user profile and invalidates cache via CacheSyncManager.
   * Uses 'profile-deleted' action for cache invalidation with fallback to direct cache clearing.
   * 
   * Cache Invalidation:
   * - Primary: CacheSyncManager.invalidateByAction('profile-deleted')
   * - Fallback: UnifiedCacheManager.clearByPattern() for 'profile-data'
   * 
   * Related Documentation:
   * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
   */
  async function deleteProfile({ profileId, userId = 1 }) {
    const payload = await fetchJson(`/api/preferences/profiles/${profileId}`, {
      method: 'DELETE',
      params: { user_id: userId },
    });

    // Cache invalidation via CacheSyncManager (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('profile-deleted');
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
        // Fallback to direct cache clearing
        await clearCachePattern(KEY_PREFIXES.profiles);
      }
    } else {
      // Fallback to direct cache clearing if CacheSyncManager not available
      await clearCachePattern(KEY_PREFIXES.profiles);
    }
    return payload;
  }

  async function loadPreferenceGroupsMetadata({ force = false, ttl = DEFAULT_TTL.groups } = {}) {
    const cacheKey = KEY_PREFIXES.groups;

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached) {
        return cached;
      }
    }

    const payload = await fetchJson('/api/preferences/groups');
    const normalized = normalizeGroupsPayload(payload);

    await saveCache(cacheKey, normalized, { ttl });
    return normalized;
  }

  async function loadPreferenceTypes({ force = false, ttl = DEFAULT_TTL.types } = {}) {
    const cacheKey = KEY_PREFIXES.types;

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached) {
        return cached;
      }
    }

    // Use public endpoint first, fallback to admin endpoint if needed
    let payload;
    try {
      payload = await fetchJson('/api/preferences/types', {
        credentials: 'same-origin',
      });
    } catch (error) {
      // Fallback to admin endpoint if public endpoint fails
      if (error?.status === 404 || error?.status === 401) {
        window.Logger?.debug?.('Public types endpoint not available, trying admin endpoint', {
          ...PAGE_LOG_CONTEXT,
        });
        payload = await fetchJson('/api/preferences/admin/types', {
          credentials: 'same-origin',
        });
      } else {
        throw error;
      }
    }
    const normalized = normalizeTypesPayload(payload);

    await saveCache(cacheKey, normalized, { ttl });
    return normalized;
  }

  async function loadDefaultPreference(preferenceName, { userId = 1, profileId = null, force = false, ttl = DEFAULT_TTL.defaults } = {}) {
    if (!preferenceName) {
      throw new Error('preferenceName is required');
    }
    const cacheKey = buildCacheKey(KEY_PREFIXES.defaults, [
      preferenceName,
      `u${userId}`,
      `p${profileId ?? 'active'}`,
    ]);

    if (!force) {
      const cached = await readCache(cacheKey, { ttl });
      if (cached !== null && cached !== undefined) {
        return cached;
      }
    }

    const payload = await fetchJson('/api/preferences/default', {
      params: {
        preference_name: preferenceName,
        user_id: userId,
        profile_id: profileId,
      },
    });

    const value =
      payload?.data?.default_value ??
      payload?.default_value ??
      payload?.data?.value ??
      payload?.value ??
      null;

    await saveCache(cacheKey, value, { ttl, layer: 'localStorage' });
    return value;
  }

  async function loadPreferenceInfo(preferenceName) {
    if (!preferenceName) {
      throw new Error('preferenceName is required');
    }
    const payload = await fetchJson(`/api/preferences/info/${encodeURIComponent(preferenceName)}`);
    return payload?.data?.info || payload?.info || payload?.data || null;
  }

  async function checkPreferenceExists(preferenceName) {
    if (!preferenceName) {
      return false;
    }
    try {
      const payload = await fetchJson('/api/preferences/types/check', {
        params: { name: preferenceName },
      });
      return Boolean(payload?.exists);
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to check preference existence', {
        ...PAGE_LOG_CONTEXT,
        preferenceName,
        error: error?.message,
      });
      return false;
    }
  }

  async function checkHealth() {
    try {
      const payload = await fetchJson('/api/preferences/health');
      return payload?.data || payload || {};
    } catch (error) {
      window.Logger?.error?.('❌ Preferences health check failed', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
      throw error;
    }
  }

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Validate preference value using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {string} preferenceName - Preference name
   * @param {any} value - Value to validate
   * @param {string} dataType - Expected data type (string, number, boolean, json, color)
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validatePreference(preferenceName, value, dataType = 'string') {
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-preference', { preferenceName, value, dataType })
      : `business:validate-preference:${preferenceName}:${value}:${dataType}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/preferences/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({
              preference_name: preferenceName,
              value: value,
              data_type: dataType
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
      const response = await fetch('/api/business/preferences/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          preference_name: preferenceName,
          value: value,
          data_type: dataType
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
      window.Logger?.error?.('❌ Error validating preference', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  /**
   * Validate profile data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} profileData - Profile data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateProfile(profileData) {
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-profile', profileData)
      : `business:validate-profile:${JSON.stringify(profileData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/preferences/validate-profile', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(profileData)
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
      const response = await fetch('/api/business/preferences/validate-profile', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(profileData)
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
      window.Logger?.error?.('❌ Error validating profile', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  /**
   * Validate dependencies between preferences using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} preferences - Dictionary of preference_name -> value
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateDependencies(preferences) {
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-dependencies', preferences)
      : `business:validate-dependencies:${JSON.stringify(preferences)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/preferences/validate-dependencies', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ preferences })
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
      const response = await fetch('/api/business/preferences/validate-dependencies', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ preferences })
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
      window.Logger?.error?.('❌ Error validating dependencies', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  window.PreferencesData = {
    loadPreference,
    loadPreferenceGroup,
    loadPreferencesByNames,
    loadAllPreferencesRaw,
    savePreference,
    savePreferences,
    loadProfiles,
    createProfile,
    activateProfile,
    deleteProfile,
    loadPreferenceGroupsMetadata,
    loadPreferenceTypes,
    loadDefaultPreference,
    loadPreferenceInfo,
    checkPreferenceExists,
    checkHealth,
    clearPattern: clearCachePattern,
    validatePreference,
    validateProfile,
    validateDependencies,
  };

  window.Logger?.info?.('✅ Preferences Data Service initialized', PAGE_LOG_CONTEXT);
})();


