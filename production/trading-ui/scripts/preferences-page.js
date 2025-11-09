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
 * Function Index:
 * ==============
 * 
 * DATA LOADING:
 * - loadAccountsForPreferences() - Loads trading accounts for default account preference
 * 
 * PREFERENCES MANAGEMENT:
 * - savePreferences()
 * - loadPreferences()
 * - resetPreferences()
 * 
 * UI MANAGEMENT:
 * - updateUI()
 * - validateForm()
 * 
 * ==============
 */

// ===== DATA LOADING =====
/**
 * Load trading accounts for default account preference
 * Fetches all trading accounts from API and populates the default_trading_account select
 */
async function loadAccountsForPreferences() {
    try {
        window.Logger.info('🔄 Loading trading accounts for default account preference...', { page: "preferences-page" });
        const accountSelect = document.getElementById('default_trading_account');
        if (!accountSelect) {
            window.Logger.warn('⚠️ default_trading_account select element not found', { page: "preferences-page" });
            return;
        }

        let defaultAccountId = null;

        if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
            try {
                const preferenceValue = await window.PreferencesCore.getPreference('default_trading_account', 1, window.PreferencesCore.currentProfileId);
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
            } catch (prefError) {
                window.Logger.warn('⚠️ Failed to resolve default_trading_account from PreferencesCore', prefError, { page: "preferences-page" });
            }
        }

        let usedSelectPopulatorService = false;

        window.Logger.info('🔍 Checking accounts select population prerequisites...', {
            page: "preferences-page",
            hasSelectElement: Boolean(accountSelect),
            hasSelectPopulatorService: Boolean(window.SelectPopulatorService),
            hasPopulateFunction: Boolean(window.SelectPopulatorService?.populateAccountsSelect),
            defaultAccountId
        });

        if (window.SelectPopulatorService && typeof window.SelectPopulatorService.populateAccountsSelect === 'function') {
            usedSelectPopulatorService = true;
            window.Logger.info('🚀 Using SelectPopulatorService.populateAccountsSelect for default trading account', {
                page: "preferences-page",
                defaultFromPreferences: !defaultAccountId,
                defaultValue: defaultAccountId
            });
            await window.SelectPopulatorService.populateAccountsSelect(accountSelect, {
                includeEmpty: true,
                defaultFromPreferences: !defaultAccountId,
                defaultValue: defaultAccountId
            });
        } else {
            window.Logger.warn('⚠️ SelectPopulatorService.populateAccountsSelect unavailable, falling back to direct fetch', { page: "preferences-page" });
            
            const response = await fetch(`/api/trading-accounts/open?_t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const accounts = result.data || result;

            accountSelect.innerHTML = '<option value="">בחר חשבון מסחר...</option>';

            accounts
                .filter(account => account && (account.status === 'open' || account.status === 'active' || account.is_active === true))
                .forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name;
                    accountSelect.appendChild(option);
                });

            if (defaultAccountId) {
                accountSelect.value = defaultAccountId;
            }
        }

        if (defaultAccountId && !accountSelect.value) {
            accountSelect.value = defaultAccountId;
            window.Logger.info('✅ Applied default trading account after population', {
                page: "preferences-page",
                defaultAccountId,
                appliedPostPopulation: true
            });
        }

        const selectedOption = accountSelect.options[accountSelect.selectedIndex];
        const totalOptions = Math.max(accountSelect.options.length - (accountSelect.options[0]?.value === '' ? 1 : 0), 0);

        window.Logger.info('✅ Loaded trading accounts for default account select', {
            page: "preferences-page",
            usedSelectPopulatorService,
            accountsCount: totalOptions,
            defaultAccountId: accountSelect.value || null,
            defaultAccountName: selectedOption ? selectedOption.textContent : null
        });
    } catch (error) {
        window.Logger.error('❌ Error loading trading accounts for default account preference:', error, { page: "preferences-page" });
    }
}

/**
 * Switch Active Profile - Simple Implementation
 * Uses ProfileManager for clean profile switching
 */
async function switchActiveProfile() {
    try {
        window.Logger.info('🔄 Starting profile switch process...', { page: "preferences-page" });
        
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) {
            throw new Error('Profile select element not found');
        }
        
        const selectedOption = profileSelect.selectedOptions[0];
        if (!selectedOption) {
            throw new Error('Please select a profile');
        }
        
        const profileId = parseInt(selectedOption.value, 10);
        if (!Number.isFinite(profileId)) {
            throw new Error('Invalid profile selected');
        }
        
        const profileName = selectedOption.dataset.profileName || selectedOption.textContent;
        const profileDescription = selectedOption.dataset.profileDescription || '';
        const profile = {
            id: profileId,
            name: profileName,
            description: profileDescription,
            is_default: profileId === 0
        };
        
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
        
        // Handle default profile UI state
        const isDefaultProfile = profile.id === 0 || profile.is_default === true || profile.default === true;
        
        window.Logger.info(`🔍 Profile switch: ID=${profile.id}, is_default=${profile.is_default}, isDefaultProfile=${isDefaultProfile}`, { page: "preferences-page" });
        
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
        
    } catch (error) {
        window.Logger.error('❌ Error switching profile:', error, { page: "preferences-page" });
        
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
        window.Logger.info('🔄 Starting new profile creation...', { page: "preferences-page" });
        
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
        
        window.Logger.info(`📋 Creating profile: ${profileName}`, { page: "preferences-page" });
        
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
        nameInput.value = '';
        
        // Reload page after 1.5 seconds
        setTimeout(() => {
            window.location.reload(true);
        }, 1500);

    } catch (error) {
        window.Logger.error('❌ Error creating profile:', error, { page: "preferences-page" });
        
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
window.debugProfileSystem = async function() {
    console.log('=== 🔍 DEBUG PROFILE SYSTEM ===');
    console.log('');
    
    try {
        // 1. Check current profile IDs
        console.log('1️⃣ Current Profile IDs:');
        console.log('   PreferencesCore.currentProfileId:', window.PreferencesCore?.currentProfileId);
        console.log('   PreferencesUI.currentProfileId:', window.PreferencesUI?.currentProfileId);
        console.log('   ProfileManager.currentProfileId:', window.ProfileManager?.currentProfileId);
        console.log('   PreferencesCore.currentUserId:', window.PreferencesCore?.currentUserId);
        console.log('');
        
        // 2. Check profiles from API
        console.log('2️⃣ Profiles from API:');
        const profilesResponse = await fetch('/api/preferences/profiles?user_id=1');
        const profilesResult = await profilesResponse.json();
        console.log('   API Response:', profilesResult);
        if (profilesResult.success) {
            const profiles = profilesResult.data.profiles;
            console.log(`   Total profiles: ${profiles.length}`);
            profiles.forEach(p => {
                console.log(`   - Profile ${p.id}: ${p.name} (active: ${p.active}, is_default: ${p.is_default || p.default})`);
            });
            const activeProfile = profiles.find(p => p.active === true);
            console.log('   Active Profile:', activeProfile);
        }
        console.log('');
        
        // 3. Test preference loading
        console.log('3️⃣ Test Preference Loading:');
        console.log('   Testing with profileId=0 (default):');
        try {
            const testPref0 = await window.PreferencesCore.getPreference('statusOpenColor', 1, 0);
            console.log('   ✅ profileId=0: Success, value:', testPref0);
        } catch (e) {
            console.log('   ❌ profileId=0: Error:', e.message);
        }
        
        console.log('   Testing with profileId=1:');
        try {
            const testPref1 = await window.PreferencesCore.getPreference('statusOpenColor', 1, 1);
            console.log('   ✅ profileId=1: Success, value:', testPref1);
        } catch (e) {
            console.log('   ❌ profileId=1: Error:', e.message);
        }
        console.log('');
        
        // 4. Check what LazyLoader is using
        console.log('4️⃣ LazyLoader State:');
        if (window.LazyLoader) {
            const stats = window.LazyLoader.getLoadingStats();
            console.log('   Loading Stats:', stats);
        } else {
            console.log('   ❌ LazyLoader not available');
        }
        console.log('');
        
        // 5. Check what PreferencesAPIClient would send
        console.log('5️⃣ PreferencesAPIClient Test:');
        console.log('   Testing getPreference with profileId=null:');
        console.log('   (This should use profile_id=0)');
        // This will show in network tab
        
        console.log('');
        console.log('=== ✅ DEBUG COMPLETE ===');
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Check Network tab for API calls');
        console.log('   2. Look for profile_id=1 vs profile_id=0');
        console.log('   3. Check what profileId is passed to LazyLoader.initialize');
        
    } catch (error) {
        console.error('❌ Error in debugProfileSystem:', error);
    }
};

/**
 * Debug Profile Loading Flow - Console Function
 * Run this in console: debugProfileLoading()
 */
window.debugProfileLoading = async function() {
    console.log('=== 🔍 DEBUG PROFILE LOADING FLOW ===');
    console.log('');
    
    try {
        console.log('Step 1: Load active profile');
        const activeProfileId = await window.PreferencesUI.loadActiveProfile();
        console.log('   ✅ Active Profile ID:', activeProfileId);
        console.log('');
        
        console.log('Step 2: Load all preferences');
        await window.PreferencesUI.loadAllPreferences(1, activeProfileId);
        console.log('   ✅ Preferences loaded');
        console.log('');
        
        console.log('Step 3: Check final state');
        console.log('   PreferencesCore.currentProfileId:', window.PreferencesCore?.currentProfileId);
        console.log('   PreferencesUI.currentProfileId:', window.PreferencesUI?.currentProfileId);
        console.log('');
        
        console.log('=== ✅ DEBUG COMPLETE ===');
        
    } catch (error) {
        console.error('❌ Error in debugProfileLoading:', error);
    }
};

/**
 * Disable frontend cache (UnifiedCacheManager + LazyLoader) for current session
 * Usage:
 *   await disableFrontendCacheForSession();
 *   await debugProfileLoading();
 */
window.disableFrontendCacheForSession = async function() {
    const logger = window.Logger || console;
    const unified = window.UnifiedCacheManager;
    
    if (!unified) {
        logger.warn('⚠️ UnifiedCacheManager not available – make sure base packages finished loading');
        return;
    }

    if (!window.__frontendCacheBackup) {
        window.__frontendCacheBackup = {};
    }

    if (window.__frontendCacheBackup.active) {
        logger.info('ℹ️ Frontend cache bypass already active – skipping reinitialization');
        return;
    }

    // Ensure initialization finished before patching
    if (!unified.initialized && typeof unified.initialize === 'function') {
        logger.info('🔄 Initializing UnifiedCacheManager before cache bypass...');
        await unified.initialize();
    }

    // Backup original methods
    window.__frontendCacheBackup.get = unified.get?.bind(unified);
    window.__frontendCacheBackup.getMultiple = unified.getMultiple?.bind(unified);
    window.__frontendCacheBackup.save = unified.save?.bind(unified);
    window.__frontendCacheBackup.remove = unified.remove?.bind(unified);
    window.__frontendCacheBackup.clear = unified.clear?.bind(unified);
    window.__frontendCacheBackup.active = true;

    logger.info('🧹 Clearing existing cache layers before bypass...');
    try {
        if (typeof unified.clearAllCache === 'function') {
            await unified.clearAllCache({ autoRefresh: false });
        }
    } catch (clearError) {
        logger.warn('⚠️ Failed to execute clearAllCache()', clearError);
    }

    // Remove localStorage keys related to preferences
    const removedKeys = [];
    if (typeof window.localStorage !== 'undefined') {
        const removalPatterns = [
            'tiktrack_preference_',
            'tiktrack_all_preferences__profile_',
            'preference_',
            'preferences-active-profile',
            'preferences-groups__profile_',
            'preferences-color-cache__profile_'
        ];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (removalPatterns.some(pattern => key.startsWith(pattern))) {
                removedKeys.push(key);
            }
        }

        removedKeys.forEach(key => localStorage.removeItem(key));
        localStorage.setItem('cache_mode', 'no-cache');
    }

    window.cacheMode = 'no-cache';

    // Override UnifiedCacheManager methods to force API usage
    unified.get = async function(key, options = {}) {
        logger.debug?.(`🚫 Cache bypass (get): ${key}`, { page: 'preferences-cache-bypass' });
        if (options && typeof options.fallback === 'function') {
            return await options.fallback();
        }
        return null;
    };

    unified.getMultiple = async function(keys = [], options = {}) {
        logger.debug?.('🚫 Cache bypass (getMultiple)', { keys, page: 'preferences-cache-bypass' });
        const results = {};
        if (Array.isArray(keys)) {
            for (const key of keys) {
                results[key] = null;
            }
        }
        return results;
    };

    unified.save = async function(key, value, options = {}) {
        logger.debug?.(`🚫 Cache bypass (save): ${key}`, { page: 'preferences-cache-bypass' });
        return true;
    };

    if (typeof unified.remove === 'function') {
        unified.remove = async function(key) {
            logger.debug?.(`🚫 Cache bypass (remove): ${key}`, { page: 'preferences-cache-bypass' });
            return true;
        };
    }

    // Reset LazyLoader internal caches
    if (window.LazyLoader) {
        try {
            window.LazyLoader.loadedPreferences?.clear?.();
            window.LazyLoader.loadingPromises?.clear?.();
            logger.info('🧹 LazyLoader caches cleared');
        } catch (lazyError) {
            logger.warn('⚠️ Failed to clear LazyLoader state', lazyError);
        }
    }

    logger.info('✅ Frontend cache bypass enabled for this session', {
        removedKeys,
        page: 'preferences-cache-bypass'
    });

    return { removedKeys, message: 'Frontend cache bypass enabled' };
};

/**
 * Restore the original cache behaviour after disableFrontendCacheForSession()
 * Usage:
 *   restoreFrontendCache();
 */
window.restoreFrontendCache = function() {
    const logger = window.Logger || console;
    const unified = window.UnifiedCacheManager;
    const backup = window.__frontendCacheBackup;

    if (!backup?.active || !unified) {
        logger.warn('⚠️ Cache bypass is not active – nothing to restore');
        return;
    }

    if (backup.get) {
        unified.get = backup.get;
    }
    if (backup.getMultiple) {
        unified.getMultiple = backup.getMultiple;
    }
    if (backup.save) {
        unified.save = backup.save;
    }
    if (backup.remove) {
        unified.remove = backup.remove;
    }
    if (backup.clear) {
        unified.clear = backup.clear;
    }

    backup.active = false;
    window.cacheMode = 'preserve';
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cache_mode');
    }

    logger.info('✅ Frontend cache restored – run PreferencesUI.loadAllPreferences() to warm caches', {
        page: 'preferences-cache-bypass'
    });
};

/**
 * Inspect preference cache keys and verify profile suffix usage
 * Usage:
 *   inspectPreferenceCacheKeys();
 */
window.inspectPreferenceCacheKeys = function() {
    const logger = window.Logger || console;

    if (typeof localStorage === 'undefined') {
        logger.warn('⚠️ localStorage not available');
        return [];
    }

    const relevantPatterns = [
        'tiktrack_preference_',
        'tiktrack_all_preferences__profile_',
        'tiktrack_preference_group_',
        'preference_',
        'all_preferences_',
        'preference_group_'
    ];

    const results = [];
    const keys = Object.keys(localStorage);

    for (const rawKey of keys) {
        if (!relevantPatterns.some(pattern => rawKey.startsWith(pattern))) {
            continue;
        }

        const normalizedKey = rawKey.startsWith('tiktrack_') ? rawKey.replace('tiktrack_', '') : rawKey;
        const profileMatch = normalizedKey.match(/__profile_(\d+)$/);
        results.push({
            rawKey,
            normalizedKey,
            hasProfileSuffix: Boolean(profileMatch),
            profileId: profileMatch ? Number(profileMatch[1]) : null,
            valueLength: (localStorage.getItem(rawKey) || '').length
        });
    }

    if (results.length === 0) {
        logger.info('ℹ️ No preference cache keys found in localStorage');
    } else {
        console.table(results);
        logger.info(`📊 Found ${results.length} preference-related cache keys`);
    }

    return results;
};
async function copyDetailedLogLocal() {
    try {
        const log = [];
        const timestamp = new Date().toLocaleString('he-IL');
        
        log.push('=== לוג מפורט - עמוד העדפות TikTrack ===');
        log.push(`📅 תאריך ושעה: ${timestamp}`);
        log.push('');
        
        // System info
        log.push('--- מידע מערכת ---');
        log.push(`🌐 URL: ${window.location.href}`);
        log.push(`📱 User Agent: ${navigator.userAgent}`);
        log.push(`💾 Local Storage: ${localStorage.length} items`);
        log.push('');
        
        // Preferences info
        log.push('--- מידע העדפות ---');
        if (window.PreferencesCore) {
            log.push(`👤 Current User ID: ${window.PreferencesCore.currentUserId}`);
            log.push(`📋 Current Profile ID: ${window.PreferencesCore.currentProfileId}`);
        }
        if (window.ProfileManager) {
            log.push(`👤 ProfileManager User ID: ${window.ProfileManager.currentUserId}`);
            log.push(`📋 ProfileManager Profile ID: ${window.ProfileManager.currentProfileId}`);
        }
        
        // Statistics
        log.push('');
        log.push('--- סטטיסטיקות ---');
        const prefsCount = document.getElementById('preferencesCount')?.textContent || '0';
        const profilesCount = document.getElementById('profilesCount')?.textContent || '0';
        const groupsCount = document.getElementById('groupsCount')?.textContent || '0';
        const activeProfile = document.getElementById('activeProfileInfo')?.textContent || 'לא זמין';
        
        log.push(`📊 מספר העדפות: ${prefsCount}`);
        log.push(`👥 מספר פרופילים: ${profilesCount}`);
        log.push(`📁 מספר קבוצות: ${groupsCount}`);
        log.push(`👤 פרופיל פעיל: ${activeProfile}`);
        
        // Form data
        log.push('');
        log.push('--- נתוני טופס ---');
        const form = document.getElementById('preferencesForm');
        if (form) {
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                if (value && value !== '') {
                    log.push(`${key}: ${value}`);
                }
            }
        }
        
        const logContent = log.join('\n');
        
        // Copy to clipboard
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(logContent);
            window.Logger.info('✅ Log copied to clipboard', { page: "preferences-page" });
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג הועתק ללוח');
            }
        } else {
            window.Logger.info('⚠️ Clipboard API not available', { page: "preferences-page" });
            window.Logger.info('📋 Log content:', logContent, { page: "preferences-page" });
        }
        
        return logContent;
        
    } catch (error) {
        window.Logger.error('❌ Error generating detailed log:', error, { page: "preferences-page" });
        return `Error generating log: ${error.message}`;
    }
}

const PreferenceTypesAudit = (() => {
    const escapeSelector = (value) => {
        if (!value) {
            return '';
        }
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }
        return String(value).replace(/([\0-\x1f\x7f-\x9f\s!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    };

    const resolvePreferenceFieldDetails = (preferenceName) => {
        const details = {
            sectionTitle: 'לא נמצא בעמוד',
            sectionId: '',
            htmlIdentifier: 'לא נמצא',
            element: null
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
            `[name="${preferenceName}"]`
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
                details.sectionTitle = headerText ? `${headerText}${dataGroup}` : (sectionEl.id || sectionEl.dataset.group || '—');
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

    const renderPreferenceTypesAuditTable = async () => {
         const container = document.getElementById('preferenceTypesAuditContainer');
         const tableBody = document.getElementById('preferenceTypesAuditTableBody');
 
         if (!container || !tableBody) {
             window.Logger?.warn('⚠️ Preference types audit container not found', { page: 'preferences-page' });
             return;
         }
 
         tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">טוען נתונים...</td></tr>';
 
         try {
             const response = await fetch('/api/preferences/admin/types', { credentials: 'same-origin' });
             if (!response.ok) {
                 throw new Error(`HTTP ${response.status}`);
             }
 
             const payload = await response.json();
             if (!payload.success) {
                 throw new Error(payload.error || 'Unknown error');
             }
 
             const extractTypes = (data) => {
                 if (!data) {
                     return [];
                 }
 
                 if (Array.isArray(data.preference_types)) {
                     return data.preference_types;
                 }
 
                 if (Array.isArray(data.data?.preference_types)) {
                     return data.data.preference_types;
                 }
 
                 if (Array.isArray(data.data)) {
                     return data.data;
                 }
 
                 if (Array.isArray(data.results)) {
                     return data.results;
                 }
 
                 return [];
             };
 
             const types = extractTypes(payload);
 
             window.Logger?.info('📋 Preference types audit payload received', {
                 page: 'preferences-page',
                 hasDataKey: Boolean(payload.data),
                 total: types.length
             });
 
             const normalizeGroupName = (type) => {
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
                 tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">לא נמצאו סוגי העדפות.</td></tr>';
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
 
             tableBody.innerHTML = '';
             tableBody.appendChild(fragment);
 
             window.Logger?.info('✅ Preference types audit table rendered', {
                 page: 'preferences-page',
                 total: types.length
             });
         } catch (error) {
             window.Logger?.error('❌ Failed to render preference types audit table', error, { page: 'preferences-page' });
             tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">שגיאה בטעינת הנתונים: ${error.message}</td></tr>`;
         }
     };

    return {
        renderPreferenceTypesAuditTable
    };
})();

window.renderPreferenceTypesAuditTable = PreferenceTypesAudit.renderPreferenceTypesAuditTable;

/**
 * Initialize page-specific functionality
 * NOTE: This function is NO LONGER called automatically.
 * Page initialization is now handled by unifiedAppInitializer via customInitializers in page-initialization-configs.js
 * This function is kept for backward compatibility and manual initialization if needed.
 */
function initializePreferencesPage() {
    window.Logger.info('🚀 Initializing preferences page (manual)...', { page: "preferences-page" });
    
    // NOTE: loadAccountsForPreferences() is now called via customInitializers in page-initialization-configs.js
    // This prevents double-loading of accounts
    // loadAccountsForPreferences(); // MOVED TO customInitializers
    
    // Functions are now exported globally outside this function for immediate availability
    window.Logger.info('✅ Preferences page initialized (manual)', { page: "preferences-page" });
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

window.Logger.info('✅ preferences-page.js v3.1 loaded successfully', { page: "preferences-page" });