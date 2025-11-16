/**
 * Preferences Data Service
 * ========================
 * Centralizes every API interaction for user preferences so that pages can rely
 * on one cache-aware layer (UnifiedCacheManager + CacheTTLGuard) instead of
 * issuing ad-hoc fetch() calls.
 */
(function initPreferencesDataService() {
  const PAGE_LOG_CONTEXT = { page: 'preferences-data' };

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
    } = options;

    const url = buildUrlWithParams(path, params);
    const response = await fetch(url, {
      method,
      headers: {
        ...DEFAULT_HEADERS,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to parse JSON response for preferences request', {
        ...PAGE_LOG_CONTEXT,
        url,
        error: error?.message,
      });
    }

    if (!response.ok) {
      const errorMessage =
        payload?.error?.message ||
        payload?.error ||
        payload?.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.payload = payload;
      // Authentication UX: show clear error and allow UI to react
      if (response.status === 401 || response.status === 403) {
        try {
          const message = payload?.error?.message || payload?.message || 'דרושה התחברות למערכת';
          if (window.NotificationSystem?.error) {
            window.NotificationSystem.error(message, { context: 'preferences' });
          } else if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(message);
          }
        } catch (_) { /* noop */ }
        error.isAuthError = true;
        error.status = response.status;
      }
      throw error;
    }

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
    if (Array.isArray(rawPreferences)) {
      const map = {};
      rawPreferences.forEach((pref) => {
        const key =
          pref?.preference_name ||
          pref?.preferenceName ||
          pref?.name ||
          pref?.html_id;
        if (!key) {
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
      return { map, metadata: rawPreferences };
    }

    if (rawPreferences && typeof rawPreferences === 'object') {
      return { map: rawPreferences, metadata: [] };
    }

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
    const cacheKey = buildCacheKey(KEY_PREFIXES.all, [
      `u${userId}`,
      `p${profileId ?? 'active'}`,
    ]);

    if (!force) {
      const cached = await readCache(cacheKey, { ttl, layer: 'localStorage' });
      if (cached) {
        // Auto-migrate legacy array/object formats to normalized map
        const normalized = Array.isArray(cached?.preferences) || Array.isArray(cached)
          ? normalizePreferencesPayload({ data: { preferences: cached?.preferences ?? cached } }, { userId, profileId })
          : (cached?.preferences ? { ...cached } : normalizePreferencesPayload(cached, { userId, profileId }));
        if (normalized && normalized !== cached) {
          await saveCache(cacheKey, normalized, { ttl, layer: 'localStorage' });
        }
        return normalized;
      }
    }

    const params = {
      user_id: userId,
    };
    if (profileId !== null && profileId !== undefined) {
      params.profile_id = profileId;
    }

    const payload = await fetchJson('/api/preferences/user', { params });
    const normalized = normalizePreferencesPayload(payload, { userId, profileId });

    await saveCache(cacheKey, normalized, { ttl, layer: 'localStorage' });
    return normalized;
  }

  async function savePreference({ preferenceName, value, userId = 1, profileId = null }) {
    if (!preferenceName) {
      throw new Error('Preference name is required');
    }

    const payload = await fetchJson('/api/preferences/user/single', {
      method: 'POST',
      body: {
        preference_name: preferenceName,
        value,
        user_id: userId,
        profile_id: profileId,
      },
    });

    await clearCachePattern(KEY_PREFIXES.single);
    await clearCachePattern(KEY_PREFIXES.all);
    return payload;
  }

  async function savePreferences({ preferences = {}, userId = 1, profileId = null }) {
    if (!preferences || typeof preferences !== 'object' || Object.keys(preferences).length === 0) {
      return { success: false, message: 'No preferences provided' };
    }

    const payload = await fetchJson('/api/preferences/user', {
      method: 'POST',
      body: {
        preferences,
        user_id: userId,
        profile_id: profileId,
      },
    });

    await clearCachePattern(KEY_PREFIXES.single);
    await clearCachePattern(KEY_PREFIXES.all);
    return payload;
  }

  async function loadProfiles({ userId = 1, force = false, ttl = DEFAULT_TTL.profiles } = {}) {
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
  }

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

    await clearCachePattern(KEY_PREFIXES.profiles);
    return payload;
  }

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

    await clearCachePattern(KEY_PREFIXES.profiles);
    await clearCachePattern(KEY_PREFIXES.all);
    return payload;
  }

  async function deleteProfile({ profileId, userId = 1 }) {
    const payload = await fetchJson(`/api/preferences/profiles/${profileId}`, {
      method: 'DELETE',
      params: { user_id: userId },
    });

    await clearCachePattern(KEY_PREFIXES.profiles);
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

    const payload = await fetchJson('/api/preferences/admin/types', {
      credentials: 'same-origin',
    });
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
  };

  window.Logger?.info?.('✅ Preferences Data Service initialized', PAGE_LOG_CONTEXT);
})();


