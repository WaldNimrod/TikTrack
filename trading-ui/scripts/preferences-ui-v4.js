(() => {
  if (window.PreferencesUIV4) return;

  const UI_NS = 'PreferencesUIV4';

  class PreferencesUIV4 {
    constructor() {
      this.currentUserId = null;
      this.currentProfileId = null;
      this.initialized = false;
      // Updated to match actual group names in database:
      // - ui_settings (not 'ui')
      // - trading_settings (not 'trading')
      // - colors_unified (not 'colors')
      this.requiredGroups = ['ui_settings', 'trading_settings', 'colors_unified'];
    }

    async initialize() {
      // Deduplication: prevent multiple initialization calls
      if (this.initialized) {
        window.Logger?.debug?.('⏭️ PreferencesUIV4 already initialized, skipping re-init', {
          page: 'preferences-ui-v4',
        });
        return;
      }

      if (!window.PreferencesV4) {
        window.Logger?.error?.('PreferencesV4 SDK missing', { page: 'preferences-ui-v4' });
        return;
      }

      this.initialized = true;
      
      // Step 1: Initialize lazy loading FIRST (like other pages)
      // This ensures preferences are loaded to window.currentPreferences before UI initialization
      const userId = window.PreferencesCore?.currentUserId ?? 1;
      const profileId = window.PreferencesCore?.currentProfileId ?? null;
      
      if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
        window.Logger?.info?.('🚀 Initializing preferences with lazy loading (step 1)...', {
          page: 'preferences-ui-v4',
          userId,
          profileId,
        });
        try {
          await window.PreferencesCore.initializeWithLazyLoading(userId, profileId);
          window.Logger?.info?.('✅ Lazy loading initialized, preferences should be in window.currentPreferences', {
            page: 'preferences-ui-v4',
            preferencesCount: Object.keys(window.currentPreferences || {}).length,
          });
        } catch (error) {
          window.Logger?.warn?.('⚠️ Lazy loading initialization failed, continuing with direct loading', {
            page: 'preferences-ui-v4',
            error: error?.message,
          });
        }
      }
      
      // Step 2: Bootstrap to get profile context
      let profileContext = null;
      try {
        const bootstrapResult = await window.PreferencesV4.bootstrap(this.requiredGroups, null, userId);
        profileContext = bootstrapResult?.profileContext ?? null;
        this.currentUserId = profileContext?.user_id ?? profileContext?.user?.id ?? userId;
        this.currentProfileId = profileContext?.resolved_profile_id ?? profileContext?.resolved_profile?.id ?? profileId;
      } catch (error) {
        window.Logger?.warn?.('PreferencesV4 bootstrap failed, continuing without profile context', {
          page: 'preferences-ui-v4',
          error: error?.message,
        });
        this.currentUserId = userId;
        this.currentProfileId = profileId;
        profileContext = null;
      }

      // Step 3: Render user/profile info
      if (profileContext) {
        this._renderUser(profileContext);
        this._renderProfile(profileContext);
      } else {
        window.Logger?.warn?.('No profile context available, skipping user/profile rendering', {
          page: 'preferences-ui-v4',
        });
      }

      // Step 4: Load required groups (for UI display)
      const finalUserId = this.currentUserId ?? userId;
      const finalProfileId = this.currentProfileId ?? profileId;
      
      window.Logger?.info?.('📦 Loading preference groups for UI...', {
        page: 'preferences-ui-v4',
        groups: this.requiredGroups,
        userId: finalUserId,
        profileId: finalProfileId,
      });
      
      await Promise.all(this.requiredGroups.map(g => window.PreferencesV4.getGroup(g, finalProfileId, finalUserId)));

      // Step 5: Ensure ALL preferences are loaded to window.currentPreferences with CORRECT profile
      // This is a fallback in case lazy loading didn't populate it, or to refresh with latest data
      // CRITICAL: Use finalUserId and finalProfileId (from bootstrap) not initial userId/profileId
      if (window.PreferencesCore && typeof window.PreferencesCore.getAllPreferences === 'function') {
        try {
          window.Logger?.info?.('📥 Loading all preferences to window.currentPreferences...', {
            page: 'preferences-ui-v4',
            userId: finalUserId,
            profileId: finalProfileId,
            note: 'Using profile from bootstrap, not initial values',
          });
          const allPreferences = await window.PreferencesCore.getAllPreferences(finalUserId, finalProfileId);
          
          // PreferencesCore.getAllPreferences() returns the preferences object directly
          // (it's not wrapped in { preferences: {...} })
          const preferencesMap = allPreferences && typeof allPreferences === 'object' ? allPreferences : {};
          
          // Update global preferences stores with CORRECT userId/profileId
          // CRITICAL: Initialize globals if they don't exist, then merge (don't overwrite)
          if (!window.currentPreferences) {
            window.currentPreferences = {};
          }
          if (!window.userPreferences) {
            window.userPreferences = {};
          }
          
          if (window.PreferencesUI && typeof window.PreferencesUI.updateGlobalPreferences === 'function') {
            window.PreferencesUI.updateGlobalPreferences(preferencesMap, finalUserId, finalProfileId, profileContext);
          } else {
            // Fallback: update globals directly with CORRECT profile
            // Use Object.assign to merge, not overwrite (preserves any existing values)
            Object.assign(window.currentPreferences, preferencesMap);
            Object.assign(window.userPreferences, preferencesMap);
            if (window.PreferencesCore) {
              window.PreferencesCore.currentUserId = finalUserId;
              window.PreferencesCore.currentProfileId = finalProfileId;
              if (profileContext) {
                window.PreferencesCore.latestProfileContext = profileContext;
              }
            }
          }
          
          // Always dispatch preferences:critical-loaded event (even if empty) for other systems
          // This allows color-scheme-system, header-system, etc. to continue initialization
          const preferencesCount = Object.keys(preferencesMap).length;
          window.__preferencesCriticalLoaded = true;
          window.__preferencesCriticalLoadedDetail = {
            preferences: preferencesMap,
            fromCache: false,
            cacheLayer: 'api',
            userId,
            profileId,
            loadTime: '0ms',
            environment: window.API_ENV || 'development',
            criticalCount: preferencesCount,
            totalCritical: preferencesCount,
            timestamp: Date.now(),
          };
          
          window.dispatchEvent(new CustomEvent('preferences:critical-loaded', {
            detail: window.__preferencesCriticalLoadedDetail,
          }));
          
          if (preferencesCount > 0) {
            window.Logger?.info?.('✅ Dispatched preferences:critical-loaded event', {
              page: 'preferences-ui-v4',
              count: preferencesCount,
            });
          } else {
            window.Logger?.warn?.('⚠️ Dispatched preferences:critical-loaded event with empty preferences', {
              page: 'preferences-ui-v4',
              userId,
              profileId,
              note: 'This may indicate no preferences exist in database or API issue',
            });
          }
          
          window.Logger?.info?.('✅ Loaded all preferences to window.currentPreferences', {
            page: 'preferences-ui-v4',
            count: preferencesCount,
            isEmpty: preferencesCount === 0,
          });
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to load all preferences, continuing with groups only', {
            page: 'preferences-ui-v4',
            error: error?.message,
            errorStack: error?.stack,
          });
        }
      } else {
        window.Logger?.warn?.('⚠️ PreferencesCore.getAllPreferences not available', {
          page: 'preferences-ui-v4',
        });
      }

      // Load profiles to dropdown (only if profileSelect element exists - preferences page only)
      const profileSelect = document.getElementById('profileSelect');
      if (profileSelect && typeof window.loadProfilesToDropdown === 'function') {
        await window.loadProfilesToDropdown(this.currentUserId);
      }

      // Load accounts for default account preference (only if element exists - preferences page only)
      const defaultAccountSelect = document.getElementById('defaultAccountSelect') || document.getElementById('defaultAccount');
      if (defaultAccountSelect && typeof window.loadAccountsForPreferences === 'function') {
        await window.loadAccountsForPreferences();
      }

      // Render preference types audit table (only if element exists - preferences page only)
      const preferenceTypesTable = document.getElementById('preferenceTypesTable') || document.querySelector('[data-table-type="preference_types"]');
      if (preferenceTypesTable && typeof window.renderPreferenceTypesAuditTable === 'function') {
        await window.renderPreferenceTypesAuditTable();
      }

      // Start debug monitoring if available (preferences page only)
      const isPreferencesPage = document.body?.classList?.contains('preferences-page') || 
                                 window.location.pathname === '/preferences' ||
                                 window.location.pathname.includes('/preferences');
      if (isPreferencesPage) {
        if (window.PreferencesDebugMonitor && typeof window.PreferencesDebugMonitor.startMonitoring === 'function') {
          window.Logger?.info('🔍 Starting preferences debug monitoring', { page: 'preferences-ui-v4' });
          window.PreferencesDebugMonitor.startMonitoring();
        } else {
          window.Logger?.warn('⚠️ PreferencesDebugMonitor not available', {
            page: 'preferences-ui-v4',
            hasMonitor: Boolean(window.PreferencesDebugMonitor),
            hasStartFunction: Boolean(window.PreferencesDebugMonitor?.startMonitoring),
          });
        }
      }

      // Populate known UI elements
      this._applyUiGroup();
      this._populatePreferencesTable();

      // Bind events
      window.addEventListener('preferences:updated', (e) => {
        const scope = e?.detail?.scope;
        if (scope === 'group') {
          this._applyUiGroup();
          this._populatePreferencesTable();
        }
      });

      this.initialized = true;
      window.Logger?.info?.('✅ PreferencesUIV4 initialized', { page: 'preferences-ui-v4' });
    }

    _renderUser(profileContext) {
      const userId = profileContext?.user_id ?? profileContext?.user?.id ?? null;
      const userName = profileContext?.user?.display_name
        || profileContext?.user?.full_name
        || profileContext?.user?.username
        || (userId != null ? `User #${userId}` : 'לא זמין');
      const combined = userId != null ? `${userName} (#${userId})` : userName;
      
      // Update data-pref-user element (V4 style)
      const el = document.querySelector('[data-pref-user]');
      if (el) el.textContent = combined;
      
      // Also update legacy display elements for compatibility
      const cardNameEl = document.getElementById('activeUserName_display');
      const cardIdEl = document.getElementById('activeUserId_display');
      const summaryNameEl = document.getElementById('activeUserName');
      const summaryIdEl = document.getElementById('activeUserId');
      
      if (cardNameEl) cardNameEl.textContent = combined;
      if (cardIdEl) cardIdEl.textContent = userId != null ? `#${userId}` : '';
      if (summaryNameEl) summaryNameEl.textContent = combined;
      if (summaryIdEl) summaryIdEl.textContent = userId != null ? `#${userId}` : '';
      
      window.Logger?.info?.('👤 PreferencesUIV4: User display updated', {
        page: 'preferences-ui-v4',
        userId,
        userName,
      });
    }

    _renderProfile(profileContext) {
      const p = profileContext?.resolved_profile;
      const profId = p?.id ?? profileContext?.resolved_profile_id ?? null;
      const profName = p?.name || (profId != null ? `Profile #${profId}` : 'ברירת מחדל');
      const profDesc = p?.description || (profId === 0 ? 'פרופיל ברירת מחדל של המערכת' : 'פרופיל משתמש');
      const combined = profId != null ? `${profName} (#${profId})` : profName;
      
      // Update data-pref-profile element (V4 style)
      const el = document.querySelector('[data-pref-profile]');
      if (el) el.textContent = combined;
      
      // Also update legacy display elements for compatibility
      const cardNameEl = document.getElementById('activeProfileName_display');
      const cardDescEl = document.getElementById('activeProfileDescription_display');
      const summaryNameEl = document.getElementById('activeProfileName');
      const summaryInfoEl = document.getElementById('activeProfileInfo');
      
      if (cardNameEl) cardNameEl.textContent = combined;
      if (cardDescEl) cardDescEl.textContent = profDesc;
      if (summaryNameEl) summaryNameEl.textContent = combined;
      if (summaryInfoEl) summaryInfoEl.textContent = combined;
      
      window.Logger?.info?.('📘 PreferencesUIV4: Profile display updated', {
        page: 'preferences-ui-v4',
        profileId: profId,
        profileName: profName,
      });
    }

    _applyUiGroup() {
      // Updated to use correct group name: ui_settings (not 'ui')
      const ui = window.PreferencesV4.groupCache.get('ui_settings') || {};
      const pageSize = ui['tablePageSize'] ?? ui['ui.page_size'] ?? 25;
      const pageSizeEl = document.querySelector('[data-pref-ui-page-size]');
      if (pageSizeEl) pageSizeEl.value = pageSize;
      const theme = ui['theme'] ?? ui['ui.theme'] ?? 'light';
      document.documentElement.dataset.theme = theme;
    }

    _populatePreferencesTable() {
      const container = document.querySelector('[data-pref-table]');
      if (!container) return;
      const rows = [];
      for (const [group, values] of window.PreferencesV4.groupCache.entries()) {
        Object.entries(values).forEach(([name, value]) => {
          rows.push({ group, name, value });
        });
      }
      // Render simple table body if exists
      const tbody = container.querySelector('tbody');
      if (!tbody) return;
      tbody.innerHTML = rows.map(r => (
        `<tr><td>${r.group}</td><td>${r.name}</td><td>${String(r.value)}</td></tr>`
      )).join('');
    }
  }

  window.PreferencesUIV4 = new PreferencesUIV4();

  // Auto-initialization removed - preferences loading is now handled centrally by unified-app-initializer.js
  // All pages with 'preferences' package will have preferences loaded through the unified initialization system
  // This ensures single point of entry, proper cache usage, and no duplicate API calls
})();



