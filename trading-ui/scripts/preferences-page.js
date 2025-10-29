/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 5
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
 * OTHER (2)
 * - switchActiveProfile() - switchActiveProfile function
 * - copyDetailedLogLocal() - copyDetailedLogLocal function
 * 
 * ==========================================
 */
/**
 * Preferences Page Script - Clean Version
 * Handles page-specific functionality for preferences.html
 * 
 * @author TikTrack Development Team
 * @version 3.0 - Clean Rewrite
 * @since January 2025
 */

window.Logger.info('📄 Loading preferences-page.js v3.0 (Clean, { page: "preferences-page" })...');

/**
 * Function Index:
 * ==============
 * 
 * DATA LOADING:
 * - loadAccountsForPreferences()
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
 * Load accounts using global function
 */
async function loadAccountsForPreferences() {
    try {
        window.Logger.info('🔄 Loading accounts for preferences...', { page: "preferences-page" });
        if (typeof window.loadAccountsDataFromAPI === 'function') {
            const accounts = await window.loadAccountsDataFromAPI();
            window.Logger.info('📊 Accounts loaded:', accounts, { page: "preferences-page" });
            
            const accountSelect = document.getElementById('defaultAccountFilter');
            if (accountSelect && accounts) {
                accountSelect.innerHTML = '<option>כל החשבונות</option>';
                
                accounts.forEach(account => {
                    if (account.status === 'open') {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = account.name;
                        accountSelect.appendChild(option);
                    }
                });
                
                window.Logger.info('✅ Loaded accounts for preferences:', accounts.length, { page: "preferences-page" });
            }
        }
    } catch (error) {
        window.Logger.error('❌ Error loading accounts:', error, { page: "preferences-page" });
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
        if (profile.id === 0 || profile.default) {
            // Default profile is active - disable all preferences
            if (typeof window.disableAllPreferencesInterface === 'function') {
                window.disableAllPreferencesInterface();
            }
        } else {
            // User profile is active - enable all preferences
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
 */
function initializePreferencesPage() {
    window.Logger.info('🚀 Initializing preferences page...', { page: "preferences-page" });
    
    // Load accounts when page loads
    loadAccountsForPreferences();
    
    // Make functions globally available
    window.switchActiveProfile = switchActiveProfile;
    window.createNewProfile = createNewProfile;
    // window. export removed - using global version from system-management.js
    
    window.Logger.info('✅ Preferences page initialized', { page: "preferences-page" });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreferencesPage);
} else {
    initializePreferencesPage();
}

window.Logger.info('✅ preferences-page.js v3.0 loaded successfully', { page: "preferences-page" });