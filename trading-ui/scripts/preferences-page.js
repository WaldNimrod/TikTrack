/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 4
 * 
 * PAGE INITIALIZATION (1)
 * - initializePreferencesPage() - initializePreferencesPage function
 * 
 * DATA LOADING (1)
 * - loadAccountsForPreferences() - loadAccountsForPreferences function
 * 
 * DATA MANIPULATION (1)
 * - createNewProfile() - createNewProfile function
 * 
 * OTHER (1)
 * - switchActiveProfile() - switchActiveProfile function
 * 
 * ==========================================
 */
/**
 * Preferences Page Script - Clean Version
 * Handles page-specific functionality for preferences.html
 *
 * @author TikTrack Development Team
 * @version 3.1 - Removed auto-initialization (moved to unifiedAppInitializer)
 * @since January 2025
 */

window.Logger.info('📄 Loading preferences-page.js v3.0 (Clean, { page: "preferences-page" })...');

/**
 * ============================================================================
 * FUNCTION INDEX - Preferences Page Functions
 * ============================================================================
 * 
 * Global Functions:
 * - loadAccountsForPreferences() - Load trading accounts for default account select
 * - renderPreferenceTypesAuditTable() - Render preference types audit table
 * 
 * Helper Functions (Internal):
 * - (Internal helpers for account loading and table rendering)
 * 
 * Documentation: See documentation/04-FEATURES/CORE/preferences/PREFERENCES_COMPLETE_DEVELOPER_GUIDE.md
 * ============================================================================
 */

// ===== DATA LOADING =====
/**
 * Load trading accounts for default account preference
 * Fetches all trading accounts from API and populates the default_trading_account select
 */
async function loadAccountsForPreferences() {
  window.Logger?.info('🔍 [Accounts] Starting loadAccountsForPreferences', {
    page: 'preferences-page',
    timestamp: new Date().toISOString(),
  });

  try {
    const activeContext = window.PreferencesUI?.profileContext
            || window.PreferencesUI?.latestProfileContext
            || null;
    const finalUserId = Number(
      activeContext?.user?.id
            ?? window.PreferencesUI?.currentUserId
            ?? window.PreferencesCore?.currentUserId
            ?? 1,
    );
    const finalProfileIdRaw = activeContext?.resolved_profile?.id
            ?? activeContext?.active_profile?.id
            ?? window.PreferencesUI?.currentProfileId
            ?? window.PreferencesCore?.currentProfileId;
    const finalProfileId = finalProfileIdRaw !== null && finalProfileIdRaw !== undefined
      ? Number(finalProfileIdRaw)
      : 0;

    window.Logger?.info('🔄 [Accounts] Loading trading accounts for default account preference', {
      page: 'preferences-page',
      userId: finalUserId,
      profileId: finalProfileId,
      activeContext: Boolean(activeContext),
    });

    const accountSelect = document.getElementById('default_trading_account');
    if (!accountSelect) {
      window.Logger?.error('❌ [Accounts] default_trading_account select element not found', {
        page: 'preferences-page',
        suggestion: 'Check if the HTML element with id="default_trading_account" exists in the preferences page',
      });
      return;
    }

    window.Logger?.info('✅ [Accounts] Select element found', {
      page: 'preferences-page',
      elementId: accountSelect.id,
      elementTagName: accountSelect.tagName,
      currentOptionsCount: accountSelect.options?.length || 0,
    });

    let defaultAccountId = null;

    if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'preferences-page.js:107',message:'loadAccountsForPreferences - Calling getPreference',data:{preferenceName:'default_trading_account',finalUserId:finalUserId,finalProfileId:finalProfileId,currentProfileId:window.PreferencesCore?.currentProfileId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const preferenceValue = await window.PreferencesCore.getPreference(
          'default_trading_account',
          finalUserId,
          finalProfileId,
        );
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'preferences-page.js:120',message:'loadAccountsForPreferences - getPreference result',data:{preferenceValue:preferenceValue,preferenceValueType:typeof preferenceValue,isNull:preferenceValue===null,isUndefined:preferenceValue===undefined,isEmpty:preferenceValue===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (preferenceValue !== null && preferenceValue !== undefined && preferenceValue !== '') {
          if (typeof preferenceValue === 'object') {
            if (Object.prototype.hasOwnProperty.call(preferenceValue, 'id')) {
              defaultAccountId = String(preferenceValue.id);
            } else if (Object.prototype.hasOwnProperty.call(preferenceValue, 'value')) {
              defaultAccountId = String(preferenceValue.value);
            }
          } else {
            defaultAccountId = String(preferenceValue);
          }
        }
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'preferences-page.js:130',message:'loadAccountsForPreferences - defaultAccountId resolved',data:{defaultAccountId:defaultAccountId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } catch (prefError) {
        window.Logger.warn('⚠️ Failed to resolve default_trading_account from PreferencesCore', prefError, { page: 'preferences-page' });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'preferences-page.js:133',message:'loadAccountsForPreferences - getPreference error',data:{error:prefError?.message,errorStack:prefError?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    }

    let usedSelectPopulatorService = false;

    window.Logger.info('🔍 Checking accounts select population prerequisites...', {
      page: 'preferences-page',
      hasSelectElement: Boolean(accountSelect),
      hasSelectPopulatorService: Boolean(window.SelectPopulatorService),
      hasPopulateFunction: Boolean(window.SelectPopulatorService?.populateAccountsSelect),
      defaultAccountId,
    });

    if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
      usedSelectPopulatorService = true;
      window.Logger?.info('🚀 [Accounts] Using SelectPopulatorService.populateAccountsSelect', {
        page: 'preferences-page',
        defaultFromPreferences: !defaultAccountId,
        defaultValue: defaultAccountId,
        options: {
          includeEmpty: true,
          defaultFromPreferences: !defaultAccountId,
          defaultValue: defaultAccountId,
        },
      });

      try {
        await window.SelectPopulatorService.populateAccountsSelect(accountSelect, {
          includeEmpty: true,
          defaultFromPreferences: !defaultAccountId,
          defaultValue: defaultAccountId,
        });

        window.Logger?.info('✅ [Accounts] SelectPopulatorService.populateAccountsSelect completed', {
          page: 'preferences-page',
          optionsCountAfter: accountSelect.options?.length || 0,
          selectedValue: accountSelect.value,
        });
      } catch (populateError) {
        window.Logger?.error('❌ [Accounts] Error in SelectPopulatorService.populateAccountsSelect', {
          page: 'preferences-page',
          error: populateError.message,
          errorStack: populateError.stack,
        });
        throw populateError;
      }
    } else {
      window.Logger?.warn('⚠️ [Accounts] SelectPopulatorService.populateAccountsSelect unavailable, using TradingAccountsData service', {
        page: 'preferences-page',
        hasSelectPopulatorService: Boolean(window.SelectPopulatorService),
        hasPopulateFunction: Boolean(window.SelectPopulatorService?.populateAccountsSelect),
      });

      let accounts = [];
      if (window.TradingAccountsData?.loadTradingAccountsData) {
        window.Logger?.info('📡 [Accounts] Loading via TradingAccountsData.loadTradingAccountsData', {
          page: 'preferences-page',
        });
        const payload = await window.TradingAccountsData.loadTradingAccountsData({ force: true });
        window.Logger?.info('📥 [Accounts] Received payload from TradingAccountsData', {
          page: 'preferences-page',
          isArray: Array.isArray(payload),
          hasData: Boolean(payload?.data),
          payloadKeys: payload ? Object.keys(payload) : [],
        });
        accounts = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        window.Logger?.info('✅ [Accounts] Extracted accounts array', {
          page: 'preferences-page',
          accountsCount: accounts.length,
          firstAccount: accounts.length > 0 ? accounts[0] : null,
        });
      } else {
        window.Logger?.warn('⚠️ [Accounts] TradingAccountsData service not available, falling back to direct fetch', {
          page: 'preferences-page',
          hasTradingAccountsData: Boolean(window.TradingAccountsData),
          hasLoadFunction: Boolean(window.TradingAccountsData?.loadTradingAccountsData),
        });
        const apiUrl = `/api/trading-accounts/open?_t=${Date.now()}`;
        window.Logger?.info('📡 [Accounts] Fetching from API', {
          page: 'preferences-page',
          url: apiUrl,
        });
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        window.Logger?.info('📥 [Accounts] API response received', {
          page: 'preferences-page',
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          const errorText = await response.text();
          window.Logger?.error('❌ [Accounts] API error response', {
            page: 'preferences-page',
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
        }

        const result = await response.json();
        window.Logger?.info('📥 [Accounts] API JSON parsed', {
          page: 'preferences-page',
          hasData: Boolean(result?.data),
          isArray: Array.isArray(result),
          resultKeys: result ? Object.keys(result) : [],
        });
        accounts = result.data || result;
        window.Logger?.info('✅ [Accounts] Extracted accounts from API response', {
          page: 'preferences-page',
          accountsCount: accounts.length,
        });
      }

      window.Logger?.info('🔄 [Accounts] Populating select manually', {
        page: 'preferences-page',
        accountsBeforeFilter: accounts.length,
      });

      accountSelect.textContent = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'בחר חשבון מסחר...';
      accountSelect.appendChild(defaultOption);

      const filteredAccounts = accounts.filter(account => 
        account && (account.status === 'open' || account.status === 'active' || account.is_active === true)
      );

      window.Logger?.info('✅ [Accounts] Filtered accounts', {
        page: 'preferences-page',
        accountsAfterFilter: filteredAccounts.length,
        filteredAccounts: filteredAccounts.map(a => ({ id: a.id, name: a.name, status: a.status })),
      });

      filteredAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        accountSelect.appendChild(option);
      });

      window.Logger?.info('✅ [Accounts] Options added to select', {
        page: 'preferences-page',
        totalOptions: accountSelect.options.length,
      });

      if (defaultAccountId) {
        accountSelect.value = defaultAccountId;
        window.Logger?.info('✅ [Accounts] Default account ID set', {
          page: 'preferences-page',
          defaultAccountId,
        });
      }
    }

    if (defaultAccountId && !accountSelect.value) {
      accountSelect.value = defaultAccountId;
      window.Logger.info('✅ Applied default trading account after population', {
        page: 'preferences-page',
        defaultAccountId,
        appliedPostPopulation: true,
      });
    }

    const selectedOption = accountSelect.options[accountSelect.selectedIndex];
    const totalOptions = Math.max(accountSelect.options.length - (accountSelect.options[0]?.value === '' ? 1 : 0), 0);

    window.Logger?.info('✅ [Accounts] Loaded trading accounts for default account select', {
      page: 'preferences-page',
      usedSelectPopulatorService,
      accountsCount: totalOptions,
      defaultAccountId: accountSelect.value || null,
      defaultAccountName: selectedOption ? selectedOption.textContent : null,
      userId: finalUserId,
      profileId: finalProfileId,
      allOptions: Array.from(accountSelect.options).map(opt => ({
        value: opt.value,
        text: opt.textContent,
        selected: opt.selected,
      })),
    });
  } catch (error) {
    window.Logger?.error('❌ [Accounts] Error loading trading accounts for default account preference', {
      page: 'preferences-page',
      error: error.message,
      errorStack: error.stack,
      errorName: error.name,
    });
  }
}

/**
 * Switch Active Profile - Simple Implementation
 * Uses ProfileManager for clean profile switching
 */
async function switchActiveProfile() {
  try {
    window.Logger.info('🔄 Starting profile switch process...', { page: 'preferences-page' });

    const profileSelect = document.getElementById('profileSelect');
    if (!profileSelect) {
      throw new Error('Profile select element not found');
    }

    const selectedOption = profileSelect.options[profileSelect.selectedIndex];
    const selectedProfileValue = selectedOption ? selectedOption.value : profileSelect.value;
    if (!selectedProfileValue) {
      throw new Error('Please select a profile');
    }

    const selectedProfileId = Number(selectedProfileValue);

    // Get all profiles to find profile ID
    const profiles = await window.getUserProfiles();
    if (!profiles || profiles.length === 0) {
      throw new Error('No profiles available');
    }

    // Find profile by id
    const profile = profiles.find(p => p.id === selectedProfileId);
    if (!profile) {
      throw new Error(`Profile with ID "${selectedProfileValue}" not found`);
    }

    // Use ProfileManager to switch profile
    const success = await window.switchProfile(profile.id, 1);

    if (!success) {
      throw new Error('Profile switch failed');
    }

    // Update active profile info in summary
    const activeProfileInfoElement = document.getElementById('activeProfileInfo');
    if (activeProfileInfoElement) {
      activeProfileInfoElement.textContent = profile.name;
    }
    const activeProfileNameElement = document.getElementById('activeProfileName');
    if (activeProfileNameElement) {
      activeProfileNameElement.textContent = profile.name;
    }

    // Handle default profile UI state
    const isDefaultProfile = profile.id === 0 || profile.is_default === true || profile.default === true;

    window.Logger.info(`🔍 Profile switch: ID=${profile.id}, is_default=${profile.is_default}, isDefaultProfile=${isDefaultProfile}`, { page: 'preferences-page' });

    if (isDefaultProfile) {
      // Default profile is active - disable all preferences
      if (typeof window.disableAllPreferencesInterface === 'function') {
        window.disableAllPreferencesInterface();
      }
    } else {
      // User profile is active - enable all preferences and hide warning
      if (typeof window.enableAllPreferencesInterface === 'function') {
        window.enableAllPreferencesInterface();
      }
    }

    if (window.PreferencesUI) {
      if (typeof window.PreferencesUI.updateActiveUserDisplay === 'function') {
        window.PreferencesUI.updateActiveUserDisplay(window.PreferencesUI.profileContext?.user || null);
      }
      if (typeof window.PreferencesUI.updateActiveProfileDisplay === 'function') {
        window.PreferencesUI.updateActiveProfileDisplay(profile);
      }
    }

  } catch (error) {
    window.Logger.error('❌ Error switching profile:', error, { page: 'preferences-page' });

    const errorMessage = error.message || error.toString() || 'Unknown error occurred';

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה בהחלפת פרופיל: ${errorMessage}`);
    }
  }
}

/**
 * Create New Profile - Clean Implementation
 * Handles creation of new profiles with validation
 */
async function createNewProfile() {
  try {
    window.Logger.info('🔄 Starting new profile creation...', { page: 'preferences-page' });

    const nameInput = document.getElementById('newProfileName');
    if (!nameInput) {
      throw new Error('Profile name input not found');
    }

    const profileName = nameInput.value.trim();
    if (!profileName) {
      throw new Error('Please enter a profile name');
    }

    if (profileName === 'ברירת מחדל') {
      throw new Error('Cannot use "ברירת מחדל" as profile name');
    }

    window.Logger.info(`📋 Creating profile: ${profileName}`, { page: 'preferences-page' });

    // Check if profile already exists
    const profiles = await window.getUserProfiles();
    const existingProfile = profiles.find(p => p.name === profileName);
    if (existingProfile) {
      throw new Error(`Profile "${profileName}" already exists`);
    }

    // Use ProfileManager to create profile
    const profileId = await window.createProfile(profileName, `פרופיל ${profileName}`, 1);

    if (!profileId) {
      throw new Error('Failed to create profile');
    }

    // Clear input
    // Use DataCollectionService to clear field if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue(nameInput.id, '', 'text');
    } else {
      nameInput.value = '';
    }

    // Reload page after 1.5 seconds
    setTimeout(() => {
      window.location.reload(true);
    }, 1500);

  } catch (error) {
    window.Logger.error('❌ Error creating profile:', error, { page: 'preferences-page' });

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה ביצירת פרופיל: ${error.message}`);
    }
  }
}

/**
 * Local copyDetailedLog function for preferences page
 */
/**
 * Debug Profile System - Console Function
 * Run this in console: debugProfileSystem()
 */
window.debugProfileSystem = async function debugProfileSystem() {
  const logInfo = (message, context = {}) => {
    window.Logger?.info(message, { page: 'preferences-page', ...context });
  };
  const logWarn = (message, context = {}) => {
    window.Logger?.warn(message, { page: 'preferences-page', ...context });
  };

  logInfo('=== 🔍 DEBUG PROFILE SYSTEM ===');

  try {
    // 1. Check current profile IDs
    logInfo('1️⃣ Current Profile IDs', {
      preferencesCoreProfileId: window.PreferencesCore?.currentProfileId,
      preferencesUIProfileId: window.PreferencesUI?.currentProfileId,
      profileManagerProfileId: window.ProfileManager?.currentProfileId,
      preferencesCoreUserId: window.PreferencesCore?.currentUserId,
    });

    // 2. Check profiles from API
    logInfo('2️⃣ Profiles from API - Fetching');
    const profilesPayload = await window.PreferencesData.loadProfiles({ userId: 1, force: true });
    logInfo('   API Response received', { total: profilesPayload.profiles?.length || 0 });
    if (profilesPayload.profiles) {
      const profiles = profilesPayload.profiles;
      logInfo('   Profiles summary', { totalProfiles: profiles.length });
      profiles.forEach(p => {
        logInfo('   - Profile details', {
          profileId: p.id,
          name: p.name,
          active: p.active,
          isDefault: p.is_default || p.default,
        });
      });
      const activeProfile = profiles.find(p => p.active === true);
      logInfo('   Active Profile resolved', { activeProfileId: activeProfile?.id || null });
    }

    // 3. Test preference loading
    logInfo('3️⃣ Test Preference Loading - profileId=0 (default)');
    try {
      const testPref0 = await window.PreferencesCore.getPreference('statusOpenColor', 1, 0);
      logInfo('   ✅ profileId=0 load result', { value: testPref0 });
    } catch (e) {
      logWarn('   ❌ profileId=0 load error', { error: e.message });
    }

    logInfo('   Testing with profileId=1');
    try {
      const testPref1 = await window.PreferencesCore.getPreference('statusOpenColor', 1, 1);
      logInfo('   ✅ profileId=1 load result', { value: testPref1 });
    } catch (e) {
      logWarn('   ❌ profileId=1 load error', { error: e.message });
    }

    // 4. Check what LazyLoader is using
    logInfo('4️⃣ LazyLoader State');
    if (window.LazyLoader) {
      const stats = window.LazyLoader.getLoadingStats();
      logInfo('   Loading stats collected', stats);
    } else {
      logWarn('   ❌ LazyLoader not available');
    }

    // 5. Check what PreferencesAPIClient would send
    logInfo('5️⃣ PreferencesAPIClient Test', {
      description: 'Testing getPreference with profileId=null (should fallback to 0)',
    });

    logInfo('=== ✅ DEBUG COMPLETE ===', {
      nextSteps: [
        'בדיקת קריאות API בלשונית Network',
        'וידוא שימוש ב-profile_id=1 לעומת profile_id=0',
        'בדיקת הפרופיל שנשלח ל-LazyLoader.initialize',
      ],
    });

  } catch (error) {
    window.Logger?.error('❌ Error in debugProfileSystem', error, { page: 'preferences-page' });
  }
};

/**
 * Debug Profile Loading Flow - Console Function
 * Run this in console: debugProfileLoading()
 */
window.debugProfileLoading = async function debugProfileLoading() {
  const logInfo = (message, context = {}) => {
    window.Logger?.info(message, { page: 'preferences-page', ...context });
  };
  const logError = (message, error) => {
    window.Logger?.error(message, error, { page: 'preferences-page' });
  };

  logInfo('=== 🔍 DEBUG PROFILE LOADING FLOW ===');

  try {
    logInfo('Step 1: Load active profile');
    const activeProfileId = await window.PreferencesUI.loadActiveProfile();
    logInfo('   ✅ Active Profile resolved', { activeProfileId });

    logInfo('Step 2: Load all preferences');
    await window.PreferencesUI.loadAllPreferences(1, activeProfileId);
    logInfo('   ✅ Preferences loaded', { userId: 1, profileId: activeProfileId });

    logInfo('Step 3: Check final state', {
      preferencesCoreProfileId: window.PreferencesCore?.currentProfileId,
      preferencesUIProfileId: window.PreferencesUI?.currentProfileId,
    });

    logInfo('=== ✅ DEBUG COMPLETE ===');

  } catch (error) {
    logError('❌ Error in debugProfileLoading', error);
  }
};

async function copyDetailedLogLocal() {
  try {
    const pageStats = {
      activeProfileId: window.PreferencesUI?.currentProfileId || window.PreferencesCore?.currentProfileId || null,
      totalSections: document.querySelectorAll('.content-section').length,
      preferenceCount: document.querySelectorAll('[data-preference-name]').length,
    };
    const generator = typeof window.generateDetailedLog === 'function' ? window.generateDetailedLog : null;
    const logContent = generator
      ? generator('preferences-page', pageStats)
      : JSON.stringify({ page: 'preferences-page', pageStats, error: 'generateDetailedLog not available' }, null, 2);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(logContent);
    } else {
      const fallbackInput = document.createElement('textarea');
      fallbackInput.value = logContent;
      fallbackInput.style.position = 'fixed';
      fallbackInput.style.opacity = '0';
      document.body.appendChild(fallbackInput);
      fallbackInput.select();
      document.execCommand('copy');
      document.body.removeChild(fallbackInput);
    }

    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('העותק נשמר ללוח', 'ניתן להדביק אותו בכל מקום.', 3000);
    }
    window.Logger?.info('📋 Detailed log copied to clipboard', { page: 'preferences-page' });
  } catch (error) {
    window.Logger?.error('❌ Failed to copy detailed log', error, { page: 'preferences-page' });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהעתקת הלוג. נסה שוב בבקשה.');
    }
  }
}

// ==========================================================================
// Preference Types Audit Helper
// ==========================================================================

const PreferenceTypesAudit = (() => {
  const state = {
    preferenceTypes: []
  };

  const escapeSelector = value => {
    if (!value) {
      return '';
    }
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    // eslint-disable-next-line no-control-regex
    return String(value).replace(/([\u0000-\u001F\u007F-\u009F\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  };

  const resolvePreferenceFieldDetails = preferenceName => {
    const details = {
      sectionTitle: 'לא נמצא בעמוד',
      sectionId: '',
      htmlIdentifier: 'לא נמצא',
      element: null,
    };

    if (!preferenceName) {
      return details;
    }

    const candidateSelectors = [
      `[data-preference-name="${preferenceName}"]`,
      `[data-color-key="${preferenceName}"]`,
      `[data-preference="${preferenceName}"]`,
      `[data-setting="${preferenceName}"]`,
      `[data-key="${preferenceName}"]`,
      `[name="${preferenceName}"]`,
    ];

    let element = null;
    for (const selector of candidateSelectors) {
      const node = document.querySelector(selector);
      if (node) {
        element = node;
        break;
      }
    }

    if (!element) {
      const escaped = escapeSelector(preferenceName);
      if (escaped) {
        element = document.getElementById(preferenceName) ||
                    document.querySelector(`#${escaped}`) ||
                    document.querySelector(`[name="${escaped}"]`);
      }
    }

    details.element = element;

    if (element) {
      const identifier = element.id || element.getAttribute('name') || element.getAttribute('data-color-key') || element.getAttribute('data-preference-name') || element.getAttribute('data-key');
      details.htmlIdentifier = identifier || '—';

      const sectionEl = element.closest('.content-section');
      if (sectionEl) {
        const headerEl = sectionEl.querySelector('.section-header h2');
        const headerText = headerEl ? headerEl.textContent.trim() : '';
        const dataGroup = sectionEl.dataset.group ? ` (${sectionEl.dataset.group})` : '';
        details.sectionTitle = headerText ? `${headerText}${dataGroup}` : sectionEl.id || sectionEl.dataset.group || '—';
        details.sectionId = sectionEl.id || '';
      }
    }

    return details;
  };

  const annotateFieldLabel = (element, preferenceId) => {
    if (!element || !preferenceId) {
      return;
    }

    let label = null;
    if (element.id) {
      const escaped = escapeSelector(element.id);
      label = document.querySelector(`label[for="${element.id}"]`) || document.querySelector(`label[for="${escaped}"]`);
    }

    if (!label && element.previousElementSibling && element.previousElementSibling.tagName === 'LABEL') {
      label = element.previousElementSibling;
    }

    if (!label && element.parentElement) {
      const parentLabel = element.parentElement.querySelector(`label[for="${element.id}"]`);
      if (parentLabel) {
        label = parentLabel;
      }
    }

    if (!label) {
      return;
    }

    if (label.dataset.preferenceIdAppended === 'true') {
      return;
    }

    const baseText = label.textContent.trim();
    label.dataset.preferenceIdAppended = 'true';
    label.textContent = `${baseText} (ID ${preferenceId})`;
  };

  /**
   * Register preference_types table with UnifiedTableSystem
   */
  const registerPreferenceTypesTable = () => {
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
      window.Logger?.warn?.('⚠️ UnifiedTableSystem not available for preference_types registration', { page: 'preferences' });
      return false;
    }

    const tableType = 'preference_types';

    if (window.UnifiedTableSystem.registry.isRegistered && window.UnifiedTableSystem.registry.isRegistered(tableType)) {
      window.Logger?.debug?.('ℹ️ Preference types table already registered', { page: 'preferences' });
      return true;
    }

    window.UnifiedTableSystem.registry.register(tableType, {
      dataGetter: () => {
        return PreferenceTypesAudit.state?.preferenceTypes || [];
      },
      updateFunction: (data) => {
        // Update state and re-render
        if (PreferenceTypesAudit.state) {
          PreferenceTypesAudit.state.preferenceTypes = Array.isArray(data) ? data : [];
          renderPreferenceTypesAuditTable();
        }
      },
      tableSelector: '#preferenceTypesAuditTable',
      columns: window.TABLE_COLUMN_MAPPINGS?.preference_types || [],
      sortable: true,
      filterable: true,
      defaultSort: { columnIndex: 0, direction: 'asc' }
    });

    window.Logger?.info?.('✅ Registered preference_types table with UnifiedTableSystem', { page: 'preferences' });
    return true;
  };

  const renderPreferenceTypesAuditTable = async () => {
    const container = document.getElementById('preferenceTypesAuditContainer');
    const tableBody = document.getElementById('preferenceTypesAuditTableBody');

    window.Logger?.info('🔍 [Types Table] Starting renderPreferenceTypesAuditTable', {
      page: 'preferences-page',
      containerExists: Boolean(container),
      tableBodyExists: Boolean(tableBody),
      hasPreferencesData: Boolean(window.PreferencesData),
      hasLoadTypesFunction: Boolean(window.PreferencesData?.loadPreferenceTypes),
    });

    if (!container || !tableBody) {
      window.Logger?.error('❌ [Types Table] Container or table body not found', {
        page: 'preferences-page',
        containerId: 'preferenceTypesAuditContainer',
        tableBodyId: 'preferenceTypesAuditTableBody',
      });
      return;
    }

    tableBody.textContent = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'text-center text-muted';
    cell.textContent = 'טוען נתונים...';
    row.appendChild(cell);
    tableBody.appendChild(row);

    try {
      window.Logger?.info('📡 [Types Table] Calling PreferencesData.loadPreferenceTypes', {
        page: 'preferences-page',
        force: true,
      });

      const result = await window.PreferencesData.loadPreferenceTypes({ force: true });
      
      window.Logger?.info('📥 [Types Table] Received response from loadPreferenceTypes', {
        page: 'preferences-page',
        hasResult: Boolean(result),
        resultKeys: result ? Object.keys(result) : [],
        hasTypes: Boolean(result?.types),
        typesCount: Array.isArray(result?.types) ? result.types.length : 0,
        rawResult: result,
      });

      const { types = [] } = result || {};
      
      // Update state for UnifiedTableSystem
      state.preferenceTypes = types;

      window.Logger?.info('📋 [Types Table] Preference types audit payload received', {
        page: 'preferences-page',
        total: types.length,
        firstType: types.length > 0 ? types[0] : null,
        allTypes: types,
      });

      const normalizeGroupName = type => {
        const name = (type.group_name || '').toString().trim().toLowerCase();
        return name;
      };

      types.sort((a, b) => {
        const groupA = normalizeGroupName(a);
        const groupB = normalizeGroupName(b);

        if (groupA && !groupB) {
          return -1;
        }

        if (!groupA && groupB) {
          return 1;
        }

        if (groupA < groupB) {
          return -1;
        }

        if (groupA > groupB) {
          return 1;
        }

        const groupIdA = typeof a.group_id === 'number' ? a.group_id : Number.MAX_SAFE_INTEGER;
        const groupIdB = typeof b.group_id === 'number' ? b.group_id : Number.MAX_SAFE_INTEGER;

        if (groupIdA !== groupIdB) {
          return groupIdA - groupIdB;
        }

        return (a.id || 0) - (b.id || 0);
      });

      if (!types.length) {
        window.Logger?.warn('⚠️ [Types Table] No types found in response', {
          page: 'preferences-page',
          result: result,
        });
        tableBody.textContent = '';
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'text-center text-muted';
        cell.textContent = 'לא נמצאו סוגי העדפות.';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
      }

      const fragment = document.createDocumentFragment();

      types.forEach((type, index) => {
        const details = resolvePreferenceFieldDetails(type.preference_name);
        if (details.element) {
          annotateFieldLabel(details.element, type.id);
        }

        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.className = 'text-center';
        numberCell.textContent = index + 1;
        row.appendChild(numberCell);

        const idCell = document.createElement('td');
        idCell.className = 'text-nowrap';
        idCell.textContent = `#${type.id}`;
        row.appendChild(idCell);

        const groupCell = document.createElement('td');
        groupCell.textContent = type.group_name || 'ללא קבוצה';
        row.appendChild(groupCell);

        const nameCell = document.createElement('td');
        nameCell.className = 'font-monospace';
        nameCell.textContent = type.preference_name;
        row.appendChild(nameCell);

        const sectionCell = document.createElement('td');
        sectionCell.textContent = details.sectionTitle;
        if (!details.element) {
          sectionCell.classList.add('text-danger');
        }
        row.appendChild(sectionCell);

        const htmlCell = document.createElement('td');
        htmlCell.textContent = details.htmlIdentifier || '—';
        if (!details.element) {
          htmlCell.classList.add('text-danger');
        }
        row.appendChild(htmlCell);

        fragment.appendChild(row);
      });

      tableBody.textContent = '';
      tableBody.appendChild(fragment);

      window.Logger?.info('✅ [Types Table] Preference types audit table rendered successfully', {
        page: 'preferences-page',
        total: types.length,
        rowsRendered: tableBody.querySelectorAll('tr').length,
      });
    } catch (error) {
      window.Logger?.error('❌ [Types Table] Failed to render preference types audit table', {
        page: 'preferences-page',
        error: error.message,
        errorStack: error.stack,
        errorName: error.name,
      });
      tableBody.textContent = '';
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.className = 'text-center text-danger';
      cell.textContent = `שגיאה בטעינת הנתונים: ${error.message}`;
      row.appendChild(cell);
      tableBody.appendChild(row);
    }
  };

  return {
    renderPreferenceTypesAuditTable,
    registerPreferenceTypesTable,
  };
})();

window.renderPreferenceTypesAuditTable = PreferenceTypesAudit.renderPreferenceTypesAuditTable;
window.registerPreferenceTypesTable = PreferenceTypesAudit.registerPreferenceTypesTable;

// Auto-register table when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (typeof window.registerPreferenceTypesTable === 'function') {
        window.registerPreferenceTypesTable();
      }
    }, 1000);
  });
} else {
  setTimeout(() => {
    if (typeof window.registerPreferenceTypesTable === 'function') {
      window.registerPreferenceTypesTable();
    }
  }, 1000);
}

/**
 * Initialize page-specific functionality
 * NOTE: This function is NO LONGER called automatically.
 * Page initialization is now handled by unifiedAppInitializer via customInitializers in page-initialization-configs.js
 * This function is kept for backward compatibility and manual initialization if needed.
 */
function initializePreferencesPage() {
  window.Logger.info('🚀 Initializing preferences page (manual)...', { page: 'preferences-page' });

  // NOTE: loadAccountsForPreferences() is now called via customInitializers in page-initialization-configs.js
  // This prevents double-loading of accounts
  // loadAccountsForPreferences(); // MOVED TO customInitializers

  // Functions are now exported globally outside this function for immediate availability
  window.Logger.info('✅ Preferences page initialized (manual)', { page: 'preferences-page' });
}

// NOTE: Auto-initialization is now handled by unifiedAppInitializer
// This DOMContentLoaded listener is KEPT for backward compatibility but should not be needed
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializePreferencesPage);
// } else {
//     initializePreferencesPage();
// }

// ============================================================================
// GLOBAL EXPORTS (Moved outside function for immediate availability)
// ============================================================================

/**
 * Make functions globally available immediately (not in init function)
 * This ensures they are available for the monitoring system
 */
window.switchActiveProfile = switchActiveProfile;
window.createNewProfile = createNewProfile;
window.loadAccountsForPreferences = loadAccountsForPreferences;
window.initializePreferencesPage = initializePreferencesPage;
window.copyDetailedLogLocal = copyDetailedLogLocal;

window.Logger.debug('✅ preferences-page.js v3.1 loaded successfully', { page: 'preferences-page' });
