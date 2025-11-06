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
        
        // Fetch accounts directly from API
        const response = await fetch(`/api/trading-accounts/?_t=${Date.now()}`, {
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
        window.Logger.info('📊 Trading accounts loaded:', accounts, { page: "preferences-page" });
        
        const accountSelect = document.getElementById('default_trading_account');
        if (accountSelect && accounts && Array.isArray(accounts)) {
            accountSelect.innerHTML = '<option value="">בחר חשבון מסחר...</option>';
            
            accounts.forEach(account => {
                if (account.status === 'open') {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name;
                    accountSelect.appendChild(option);
                }
            });
            
            window.Logger.info('✅ Loaded trading accounts for default account preference:', accounts.length, { page: "preferences-page" });
        }
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
        
        const selectedProfileName = profileSelect.value;
        if (!selectedProfileName) {
            throw new Error('Please select a profile');
        }
        
        // Get all profiles to find profile ID
        const profiles = await window.getUserProfiles();
        if (!profiles || profiles.length === 0) {
            throw new Error('No profiles available');
        }
        
        // Find profile by name
        const profile = profiles.find(p => p.name === selectedProfileName);
        if (!profile) {
            throw new Error(`Profile "${selectedProfileName}" not found`);
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