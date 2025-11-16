(() => {
  if (window.PreferencesUIV4) return;

  const UI_NS = 'PreferencesUIV4';

  class PreferencesUIV4 {
    constructor() {
      this.currentUserId = null;
      this.currentProfileId = null;
      this.initialized = false;
      this.requiredGroups = ['ui', 'trading', 'colors'];
    }

    async initialize() {
      if (!window.PreferencesV4) {
        window.Logger?.error?.('PreferencesV4 SDK missing', { page: 'preferences-ui-v4' });
        return;
      }
      let profileContext = null;
      try {
        // Get userId from PreferencesCore or default to 1
        const userId = window.PreferencesCore?.currentUserId ?? 1;
        const bootstrapResult = await window.PreferencesV4.bootstrap(this.requiredGroups, null, userId);
        profileContext = bootstrapResult?.profileContext ?? null;
        this.currentUserId = profileContext?.user_id ?? profileContext?.user?.id ?? null;
        this.currentProfileId = profileContext?.resolved_profile_id ?? profileContext?.resolved_profile?.id ?? null;
      } catch (error) {
        window.Logger?.warn?.('PreferencesV4 bootstrap failed, continuing without profile context', {
          page: 'preferences-ui-v4',
          error: error?.message,
        });
        this.currentUserId = null;
        this.currentProfileId = null;
        profileContext = null;
      }

      // Only render if we have profile context
      if (profileContext) {
        this._renderUser(profileContext);
        this._renderProfile(profileContext);
      } else {
        window.Logger?.warn?.('No profile context available, skipping user/profile rendering', {
          page: 'preferences-ui-v4',
        });
      }

      // Load required groups (served from cache if 304)
      await Promise.all(this.requiredGroups.map(g => window.PreferencesV4.getGroup(g)));

      // Load profiles to dropdown
      if (typeof window.loadProfilesToDropdown === 'function') {
        await window.loadProfilesToDropdown(this.currentUserId);
      }

      // Load accounts for default account preference
      if (typeof window.loadAccountsForPreferences === 'function') {
        await window.loadAccountsForPreferences();
      }

      // Render preference types audit table
      if (typeof window.renderPreferenceTypesAuditTable === 'function') {
        await window.renderPreferenceTypesAuditTable();
      }

      // Start debug monitoring if available
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
      const ui = window.PreferencesV4.groupCache.get('ui') || {};
      const pageSize = ui['ui.page_size'] ?? 25;
      const pageSizeEl = document.querySelector('[data-pref-ui-page-size]');
      if (pageSizeEl) pageSizeEl.value = pageSize;
      const theme = ui['ui.theme'] ?? 'light';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.PreferencesUIV4.initialize());
  } else {
    window.PreferencesUIV4.initialize();
  }
})();



