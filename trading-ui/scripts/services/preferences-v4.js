(() => {
  const NS = 'PreferencesV4';
  if (window[NS]) return;

  // Updated to match actual group names in database:
  // - colors_unified (not 'colors')
  // - ui_settings (not 'ui')
  // - trading_settings (not 'trading')
  const DEFAULT_GROUPS = ['colors_unified', 'ui_settings', 'trading_settings'];
  const API = {
    bootstrap: '/api/preferences/bootstrap',
    group: '/api/preferences/user/group',
    groups: '/api/preferences/user/groups',
  };

  const activeRequests = new Map();
  let circuitOpenUntil = 0;
  const CIRCUIT_MS = 1500;

  const etagByGroup = new Map();
  const cacheByGroup = new Map();
  let bootstrapETag = null;
  let profileContext = null;

  function now() { return Date.now(); }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function dedup(key, fn) {
    if (activeRequests.has(key)) return activeRequests.get(key);
    const p = (async () => {
      try { return await fn(); } finally { activeRequests.delete(key); }
    })();
    activeRequests.set(key, p);
    return p;
  }

  async function doFetch(url, options = {}) {
    if (now() < circuitOpenUntil) {
      throw new Error('Circuit open due to rate limiting');
    }
    let res = await fetch(url, options);
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : 800 + Math.random() * 400;
      circuitOpenUntil = now() + CIRCUIT_MS;
      await sleep(delay);
      res = await fetch(url, options);
    }
    return res;
  }

  async function bootstrap(groups = DEFAULT_GROUPS, profileId = null, userId = null) {
    return dedup(`BOOTSTRAP:${groups.join(',')}:${profileId ?? ''}:${userId ?? ''}`, async () => {
      // Resolve userId from PreferencesCore or default to 1
      const resolvedUserId = userId ?? 
        window.PreferencesCore?.currentUserId ?? 
        window.PreferencesData?.currentUserId ?? 
        1;
      
      const params = new URLSearchParams();
      params.set('groups', groups.join(','));
      params.set('user_id', String(resolvedUserId));
      if (profileId != null) params.set('profile_id', String(profileId));
      const headers = {};
      if (bootstrapETag) headers['If-None-Match'] = bootstrapETag;
      const res = await doFetch(`${API.bootstrap}?${params.toString()}`, { headers, credentials: 'include' });
      if (res.status === 304) {
        window.Logger?.info?.('PreferencesV4 bootstrap 304 (served from cache)', { page: 'preferences-v4' });
        return { profileContext, groups: Object.fromEntries(cacheByGroup), etag: bootstrapETag };
      }
      if (res.status === 401 || res.status === 403) {
        window.Logger?.warn?.('PreferencesV4 bootstrap authentication error', { page: 'preferences-v4', status: res.status });
        // Return empty context instead of throwing - allow page to continue
        return { profileContext: null, groups: {}, etag: null };
      }
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Bootstrap failed: ${res.status} ${errorText}`);
      }
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || 'Failed bootstrap');
      const data = json.data;
      profileContext = data.profile_context || data.profileContext || null;
      bootstrapETag = res.headers.get('ETag') || null;
      const groupsPayload = data.groups || {};
      for (const [g, values] of Object.entries(groupsPayload)) {
        cacheByGroup.set(g, values);
      }
      const etags = data.group_etags || {};
      for (const [g, et] of Object.entries(etags)) {
        etagByGroup.set(g, et);
      }
      window.dispatchEvent(new CustomEvent('preferences:bootstrap:ready', { detail: { profileContext } }));
      return { profileContext, groups: groupsPayload, etag: bootstrapETag };
    });
  }

  async function getGroup(group, profileId = null, userId = null) {
    return dedup(`GET_GROUP:${group}:${profileId ?? ''}:${userId ?? ''}`, async () => {
      // Resolve userId from PreferencesCore or default to 1
      const resolvedUserId = userId ?? 
        window.PreferencesCore?.currentUserId ?? 
        window.PreferencesData?.currentUserId ?? 
        1;
      
      window.Logger?.debug?.('🔍 PreferencesV4.getGroup called', {
        page: 'preferences-v4',
        group,
        profileId,
        userId,
        resolvedUserId,
      });
      
      const params = new URLSearchParams();
      params.set('group', group);
      params.set('user_id', String(resolvedUserId));
      if (profileId != null) params.set('profile_id', String(profileId));
      const headers = {};
      const cachedETag = etagByGroup.get(group);
      if (cachedETag) headers['If-None-Match'] = cachedETag;
      const res = await doFetch(`${API.group}?${params.toString()}`, { headers, credentials: 'include' });
      
      window.Logger?.debug?.('🔍 PreferencesV4.getGroup response', {
        page: 'preferences-v4',
        group,
        status: res.status,
        hasCachedETag: !!cachedETag,
      });
      
      if (res.status === 304) {
        const cached = cacheByGroup.get(group) || {};
        window.Logger?.debug?.('🔍 PreferencesV4.getGroup - 304 Not Modified, using cache', {
          page: 'preferences-v4',
          group,
          cachedCount: Object.keys(cached).length,
        });
        return { group, values: cached, profileContext, etag: cachedETag, fromCache: true };
      }
      if (res.status === 401 || res.status === 403) {
        window.Logger?.warn?.('PreferencesV4 getGroup authentication error', { page: 'preferences-v4', status: res.status, group });
        // Return empty group instead of throwing - allow page to continue
        return { group, values: {}, profileContext, etag: null, fromCache: false };
      }
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`GetGroup failed: ${res.status} ${errorText}`);
      }
      const json = await res.json();
      
      window.Logger?.debug?.('🔍 PreferencesV4.getGroup JSON response', {
        page: 'preferences-v4',
        group,
        hasSuccess: json?.success,
        hasPreferences: !!json?.data?.preferences,
        preferencesCount: Array.isArray(json?.data?.preferences) ? json.data.preferences.length : Object.keys(json?.data?.preferences || {}).length,
      });
      
      if (!json?.success) throw new Error(json?.error || 'Failed group fetch');
      const data = json.data;
      const et = res.headers.get('ETag') || null;
      if (et) etagByGroup.set(group, et);
      
      // Backend returns 'preferences' not 'values' - normalize to 'values' for consistency
      // Handle both formats for backward compatibility
      const rawPreferences = data.preferences || data.values || {};
      
      // Normalize: if preferences is an array, convert to object
      let groupValues = {};
      if (Array.isArray(rawPreferences)) {
        // Convert array of preference objects to key-value map
        for (const pref of rawPreferences) {
          const prefName = pref?.preference_name || pref?.name || pref?.html_id;
          if (!prefName) continue;
          const prefValue = pref?.saved_value ?? pref?.value ?? pref?.default_value ?? null;
          groupValues[prefName] = prefValue;
        }
      } else if (rawPreferences && typeof rawPreferences === 'object') {
        groupValues = rawPreferences;
      }
      
      window.Logger?.debug?.('🔍 PreferencesV4.getGroup - normalized group values', {
        page: 'preferences-v4',
        group,
        groupValuesCount: Object.keys(groupValues).length,
      });
      
      cacheByGroup.set(group, groupValues);
      // Only warn about empty groups on preferences page or if explicitly debugging
      const isPreferencesPage = document.body?.classList?.contains('preferences-page') || 
                                 window.location.pathname === '/preferences' ||
                                 window.location.pathname.includes('/preferences');
      if (Object.keys(groupValues).length === 0 && isPreferencesPage) {
        window.Logger?.warn?.(`⚠️ PreferencesV4: group '${group}' returned empty values`, { page: 'preferences-v4' });
      } else if (Object.keys(groupValues).length === 0) {
        // Debug level for other pages (normal - groups may not be needed)
        window.Logger?.debug?.(`PreferencesV4: group '${group}' returned empty values (normal on non-preferences pages)`, { page: 'preferences-v4' });
      }
      profileContext = data.profile_context || profileContext;
      window.dispatchEvent(new CustomEvent('preferences:updated', { detail: { scope: 'group', group } }));
      // CRITICAL: Return normalized groupValues, not data.values (which may not exist or be in wrong format)
      return { group, values: groupValues, profileContext, etag: et, fromCache: false };
    });
  }

  async function getGroups(groups, profileId = null, userId = null) {
    const results = {};
    for (const g of groups) {
      // Resolve userId for getGroup call
      const resolvedUserId = userId ?? 
        window.PreferencesCore?.currentUserId ?? 
        window.PreferencesData?.currentUserId ?? 
        1;
      const { values } = await getGroup(g, profileId, resolvedUserId);
      results[g] = values;
    }
    return results;
  }

  async function saveGroup(group, valuesMap, profileId = null) {
    const body = { group, values: valuesMap };
    if (profileId != null) body.profile_id = profileId;
    const res = await doFetch(API.group, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error || 'Failed group save');
    // Update local cache
    const changed = json.data?.changed || {};
    const prev = cacheByGroup.get(group) || {};
    const next = { ...prev, ...Object.fromEntries(Object.entries(changed).map(([k, v]) => [k, v.new])) };
    cacheByGroup.set(group, next);
    for (const k of Object.keys(changed)) {
      window.dispatchEvent(new CustomEvent('preferences:changed', { detail: { name: k, group } }));
    }
    window.dispatchEvent(new CustomEvent('preferences:updated', { detail: { scope: 'group', group } }));
    // Invalidate UnifiedCacheManager keys if present
    if (window.UnifiedCacheManager?.invalidateByDependency) {
      try { window.UnifiedCacheManager.invalidateByDependency(`preferences:${group}`); } catch {}
    }
    return json.data;
  }

  function getPreference(name) {
    // Resolve from cached groups without network where possible
    for (const [g, values] of cacheByGroup.entries()) {
      if (Object.prototype.hasOwnProperty.call(values, name)) return values[name];
    }
    return null;
  }

  window[NS] = {
    bootstrap,
    getGroup,
    getGroups,
    saveGroup,
    getPreference,
    get profileContext() { return profileContext; },
    get groupCache() { return cacheByGroup; },
  };
  window.Logger?.info?.('✅ preferences-v4.js loaded', { page: 'preferences-v4' });
})(); 



