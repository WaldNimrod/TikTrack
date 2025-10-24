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
 * Switch Active Profile - Clean Implementation
 * Handles profile switching with proper validation and error handling
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
        
        window.Logger.info(`🔍 PROFILE DEBUG: Switching to profile: ${selectedProfileName}`, { page: "preferences-page" });
        window.Logger.info(`🔍 CACHE DEBUG: Current cache state before switch:`, window.PreferencesCore?.cacheManager?.getAll?.(, { page: "preferences-page" }) || 'Cache not available');
        
        // 1. Get all profiles
        const profiles = await window.getUserProfiles();
        if (!profiles || profiles.length === 0) {
            throw new Error('No profiles available');
        }
        window.Logger.info(`🔍 PROFILE DEBUG: Found ${profiles.length} profiles:`, profiles.map(p => `${p.name} (ID: ${p.id}, active: ${p.active}, default: ${p.default}, { page: "preferences-page" })`));
        
        // 2. Handle default profile vs regular profiles
        if (selectedProfileName === 'ברירת מחדל') {
            window.Logger.info('📋 Switching to default profile (system defaults, { page: "preferences-page" })');
            
            // Find the default profile in the database
            const defaultProfile = profiles.find(p => p.default === true || p.default === 1 || p.is_default === true || p.is_default === 1);
            if (!defaultProfile) {
                throw new Error('Default profile not found in database');
            }
            
            window.Logger.info(`📋 Found default profile: ${defaultProfile.name} (ID: ${defaultProfile.id}, { page: "preferences-page" })`);
            
            // Call API to activate the default profile
            const response = await fetch('/api/preferences/profiles/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    profile_id: defaultProfile.id
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
                    const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to activate default profile');
            }
            
            window.Logger.info('✅ Default profile activated successfully', { page: "preferences-page" });
            
            // Update PreferencesCore current profile BEFORE clearing cache
            // Update PreferencesCore and clear cache
            window.Logger.info('🔄 Updating PreferencesCore and clearing cache...', { page: "preferences-page" });
            
            if (window.PreferencesCore) {
                await window.PreferencesCore.setCurrentProfile(1, defaultProfile.id);
                window.Logger.info('✅ PreferencesCore updated and cache cleared', { page: "preferences-page" });
            } else {
                window.Logger.warn('⚠️ PreferencesCore not available', { page: "preferences-page" });
            }
            
            // Update PreferencesUI currentProfileId for synchronization
            if (window.PreferencesUI) {
                window.PreferencesUI.currentProfileId = defaultProfile.id;
                window.Logger.info('✅ PreferencesUI currentProfileId synchronized', { page: "preferences-page" });
            }
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('פרופיל הוחלף לברירת מחדל');
            }
            
            // Reload all form data for the new profile
            window.Logger.info('🔍 PROFILE DEBUG: Profile switch completed successfully', { page: "preferences-page" });
            window.Logger.info('🔍 CACHE DEBUG: Final cache state:', window.PreferencesCore?.cacheManager?.getAll?.(, { page: "preferences-page" }) || 'Cache not available');
            
            // Show loading notification
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('טוען נתונים לפרופיל ברירת מחדל...');
            }
            
            // Reload all preferences and form data for the new profile
            window.Logger.info('🔄 Reloading all form data for default profile...', { page: "preferences-page" });
            try {
                // Reload preferences using the UI system with cache-busting
                if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
                    window.Logger.info('🔄 Reloading preferences with cache-busting...', { page: "preferences-page" });
                    window.Logger.info(`🔄 Using cache buster: ${window.cacheBuster || 'none'}`, { page: "preferences-page" });
                    await window.PreferencesUI.loadAllPreferences(1, defaultProfile.id);
                    window.Logger.info('✅ Preferences reloaded for default profile', { page: "preferences-page" });
                }
                
                // Reload profiles dropdown to show current active profile
                if (typeof window.loadProfilesToDropdown === 'function') {
                    window.Logger.info('🔄 Reloading profiles dropdown to show active profile...', { page: "preferences-page" });
                    await window.loadProfilesToDropdown();
                    window.Logger.info('✅ Profiles dropdown reloaded', { page: "preferences-page" });
                    
                    // Verify the dropdown shows the correct active profile
                    const profileSelectElement = document.getElementById('profileSelect');
                    if (profileSelectElement) {
                        const selectedValue = profileSelectElement.value;
                        window.Logger.info(`🔍 UI DEBUG: Dropdown now shows: ${selectedValue}`, { page: "preferences-page" });
                        window.Logger.info(`🔍 UI DEBUG: Expected profile: ברירת מחדל`, { page: "preferences-page" });
                        
                        // Force update the dropdown if it doesn't match
                        if (selectedValue !== 'ברירת מחדל') {
                            window.Logger.info(`⚠️ MISMATCH: Dropdown shows "${selectedValue}" but expected "ברירת מחדל"`, { page: "preferences-page" });
                            window.Logger.info(`🔄 Forcing dropdown update...`, { page: "preferences-page" });
                            
                            // Find and select the correct option
                            const correctOption = profileSelectElement.querySelector('option[value="ברירת מחדל"]');
                            if (correctOption) {
                                correctOption.selected = true;
                                window.Logger.info(`✅ Forced selection of "ברירת מחדל" in dropdown`, { page: "preferences-page" });
                            } else {
                                window.Logger.error(`❌ Option "ברירת מחדל" not found in dropdown!`, { page: "preferences-page" });
                                window.Logger.info(`🔍 Available options:`, Array.from(profileSelectElement.options, { page: "preferences-page" }).map(opt => opt.value));
                            }
                        } else {
                            window.Logger.info(`✅ Dropdown correctly shows "ברירת מחדל"`, { page: "preferences-page" });
                        }
                    }
                }
                
                // Update active profile info display in the new card format
                const activeProfileName = document.getElementById('activeProfileName');
                const activeProfileDescription = document.getElementById('activeProfileDescription');
                
                if (activeProfileName) {
                    activeProfileName.textContent = 'ברירת מחדל';
                }
                if (activeProfileDescription) {
                    activeProfileDescription.textContent = 'פרופיל ברירת מחדל של המערכת';
                }
                window.Logger.info(`🔍 UI DEBUG: Updated active profile card to: ברירת מחדל`, { page: "preferences-page" });
                
                // Default profile is active - disable all preferences
                window.Logger.info('🔒 Default profile active - disabling all preferences interface', { page: "preferences-page" });
                window.disableAllPreferencesInterface();
                
                // Show success notification
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('פרופיל הוחלף לברירת מחדל! כל הנתונים נטענו מחדש.');
                }
                
                // Show confirmation dialog before reload
                const shouldReload = confirm('הפרופיל הוחלף בהצלחה. האם לרענן את העמוד כדי לראות את השינויים?');
                
                if (shouldReload) {
                    window.Logger.info('🔄 User requested page reload', { page: "preferences-page" });
                    window.location.reload();
                }
                
                window.Logger.info('✅ Profile switch completed - all form data reloaded', { page: "preferences-page" });
                
            } catch (error) {
                window.Logger.error('❌ Error reloading form data:', error, { page: "preferences-page" });
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification(`שגיאה בטעינת נתונים לפרופיל ברירת מחדל: ${error.message}`);
                }
            }
            
            return; // Exit early for default profile
        }
        
        // 3. Find regular profile
        const profile = profiles.find(p => p.name === selectedProfileName);
        if (!profile) {
            throw new Error(`Profile "${selectedProfileName}" not found`);
        }
        window.Logger.info(`📋 Found profile: ${profile.name} (ID: ${profile.id}, { page: "preferences-page" })`);
        
        // 4. Call API to activate profile
        const response = await fetch('/api/preferences/profiles/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1,
                profile_id: profile.id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to activate profile');
        }
        
        window.Logger.info('✅ Profile activated successfully', { page: "preferences-page" });
        
        // 5. Update PreferencesCore current profile BEFORE clearing cache
        // 6. Update PreferencesCore and clear cache
        window.Logger.info('🔄 Updating PreferencesCore and clearing cache...', { page: "preferences-page" });
        
        if (window.PreferencesCore) {
            await window.PreferencesCore.setCurrentProfile(1, profile.id);
            window.Logger.info('✅ PreferencesCore updated and cache cleared', { page: "preferences-page" });
        } else {
            window.Logger.warn('⚠️ PreferencesCore not available', { page: "preferences-page" });
        }
        
        // Update PreferencesUI currentProfileId for synchronization
        if (window.PreferencesUI) {
            window.PreferencesUI.currentProfileId = profile.id;
            window.Logger.info('✅ PreferencesUI currentProfileId synchronized', { page: "preferences-page" });
        }
        
        // Profile switch completed successfully
        window.Logger.info('✅ Profile switch completed successfully', { page: "preferences-page" });
        
        // Show success notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(`פרופיל הוחלף ל: ${profile.name} בהצלחה!`);
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
        
        // Create profile via API (assuming this endpoint exists)
        const response = await fetch('/api/preferences/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1,
                profile_name: profileName,
                description: `פרופיל ${profileName}`,
                is_default: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to create profile');
        }
        
        window.Logger.info('✅ Profile created successfully', { page: "preferences-page" });
        
        // Clear input
        nameInput.value = '';
                                
                                // Show success notification
                                if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(`פרופיל "${profileName}" נוצר בהצלחה`);
        }
        
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
 * Local  function for preferences page
 */
async function  {
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
            log.push(`💾 Cache Size: ${Object.keys(window.PreferencesCore.cacheManager.cache || {}).length} items`);
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
    window. = ;
    
    window.Logger.info('✅ Preferences page initialized', { page: "preferences-page" });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreferencesPage);
} else {
    initializePreferencesPage();
}

window.Logger.info('✅ preferences-page.js v3.0 loaded successfully', { page: "preferences-page" });