/**
 * Preferences Page Script - Clean Version
 * Handles page-specific functionality for preferences.html
 * 
 * @author TikTrack Development Team
 * @version 3.0 - Clean Rewrite
 * @since January 2025
 */

console.log('📄 Loading preferences-page.js v3.0 (Clean)...');

/**
 * Load accounts using global function
 */
async function loadAccountsForPreferences() {
    try {
        console.log('🔄 Loading accounts for preferences...');
        if (typeof window.loadAccountsDataFromAPI === 'function') {
            const accounts = await window.loadAccountsDataFromAPI();
            console.log('📊 Accounts loaded:', accounts);
            
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
                
                console.log('✅ Loaded accounts for preferences:', accounts.length);
            }
        }
    } catch (error) {
        console.error('❌ Error loading accounts:', error);
    }
}

/**
 * Switch Active Profile - Clean Implementation
 * Handles profile switching with proper validation and error handling
 */
async function switchActiveProfile() {
    try {
        console.log('🔄 Starting profile switch process...');
        
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) {
            throw new Error('Profile select element not found');
        }
        
        const selectedProfileName = profileSelect.value;
        if (!selectedProfileName) {
            throw new Error('Please select a profile');
        }
        
        console.log(`🔍 PROFILE DEBUG: Switching to profile: ${selectedProfileName}`);
        console.log(`🔍 CACHE DEBUG: Current cache state before switch:`, window.PreferencesCore?.cacheManager?.getAll?.() || 'Cache not available');
        
        // 1. Get all profiles
        const profiles = await window.getUserProfiles();
        if (!profiles || profiles.length === 0) {
            throw new Error('No profiles available');
        }
        console.log(`🔍 PROFILE DEBUG: Found ${profiles.length} profiles:`, profiles.map(p => `${p.name} (ID: ${p.id}, active: ${p.active}, default: ${p.default})`));
        
        // 2. Handle default profile vs regular profiles
        if (selectedProfileName === 'ברירת מחדל') {
            console.log('📋 Switching to default profile (system defaults)');
            
            // Find the default profile in the database
            const defaultProfile = profiles.find(p => p.default === true || p.default === 1 || p.is_default === true || p.is_default === 1);
            if (!defaultProfile) {
                throw new Error('Default profile not found in database');
            }
            
            console.log(`📋 Found default profile: ${defaultProfile.name} (ID: ${defaultProfile.id})`);
            
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
            
            console.log('✅ Default profile activated successfully');
            
            // Update PreferencesCore current profile BEFORE clearing cache
            // Update PreferencesCore and clear cache
            console.log('🔄 Updating PreferencesCore and clearing cache...');
            
            if (window.PreferencesCore) {
                await window.PreferencesCore.setCurrentProfile(1, defaultProfile.id);
                console.log('✅ PreferencesCore updated and cache cleared');
            } else {
                console.warn('⚠️ PreferencesCore not available');
            }
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('פרופיל הוחלף לברירת מחדל');
            }
            
            // Reload all form data for the new profile
            console.log('🔍 PROFILE DEBUG: Profile switch completed successfully');
            console.log('🔍 CACHE DEBUG: Final cache state:', window.PreferencesCore?.cacheManager?.getAll?.() || 'Cache not available');
            
            // Show loading notification
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('טוען נתונים לפרופיל ברירת מחדל...');
            }
            
            // Reload all preferences and form data for the new profile
            console.log('🔄 Reloading all form data for default profile...');
            try {
                // Reload preferences using the UI system with cache-busting
                if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
                    console.log('🔄 Reloading preferences with cache-busting...');
                    console.log(`🔄 Using cache buster: ${window.cacheBuster || 'none'}`);
                    await window.PreferencesUI.loadAllPreferences(1, defaultProfile.id);
                    console.log('✅ Preferences reloaded for default profile');
                }
                
                // Reload profiles dropdown to show current active profile
                if (typeof window.loadProfilesToDropdown === 'function') {
                    console.log('🔄 Reloading profiles dropdown to show active profile...');
                    await window.loadProfilesToDropdown();
                    console.log('✅ Profiles dropdown reloaded');
                    
                    // Verify the dropdown shows the correct active profile
                    const profileSelectElement = document.getElementById('profileSelect');
                    if (profileSelectElement) {
                        const selectedValue = profileSelectElement.value;
                        console.log(`🔍 UI DEBUG: Dropdown now shows: ${selectedValue}`);
                        console.log(`🔍 UI DEBUG: Expected profile: ברירת מחדל`);
                        
                        // Force update the dropdown if it doesn't match
                        if (selectedValue !== 'ברירת מחדל') {
                            console.log(`⚠️ MISMATCH: Dropdown shows "${selectedValue}" but expected "ברירת מחדל"`);
                            console.log(`🔄 Forcing dropdown update...`);
                            
                            // Find and select the correct option
                            const correctOption = profileSelectElement.querySelector('option[value="ברירת מחדל"]');
                            if (correctOption) {
                                correctOption.selected = true;
                                console.log(`✅ Forced selection of "ברירת מחדל" in dropdown`);
                            } else {
                                console.error(`❌ Option "ברירת מחדל" not found in dropdown!`);
                                console.log(`🔍 Available options:`, Array.from(profileSelectElement.options).map(opt => opt.value));
                            }
                        } else {
                            console.log(`✅ Dropdown correctly shows "ברירת מחדל"`);
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
                console.log(`🔍 UI DEBUG: Updated active profile card to: ברירת מחדל`);
                
                // Default profile is active - disable all preferences
                console.log('🔒 Default profile active - disabling all preferences interface');
                window.disableAllPreferencesInterface();
                
                // Show success notification
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('פרופיל הוחלף לברירת מחדל! כל הנתונים נטענו מחדש.');
                }
                
                console.log('✅ Profile switch completed - all form data reloaded');
                
            } catch (error) {
                console.error('❌ Error reloading form data:', error);
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
        console.log(`📋 Found profile: ${profile.name} (ID: ${profile.id})`);
        
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
        
        console.log('✅ Profile activated successfully');
        
        // 5. Update PreferencesCore current profile BEFORE clearing cache
        // 6. Update PreferencesCore and clear cache
        console.log('🔄 Updating PreferencesCore and clearing cache...');
        
        if (window.PreferencesCore) {
            await window.PreferencesCore.setCurrentProfile(1, profile.id);
            console.log('✅ PreferencesCore updated and cache cleared');
        } else {
            console.warn('⚠️ PreferencesCore not available');
        }
        
        // 7. Show success notification
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(`פרופיל הוחלף ל: ${profile.name}`);
        }
        
        // 8. Reload all form data for the new profile
        console.log('🔍 PROFILE DEBUG: Profile switch completed successfully');
        console.log('🔍 CACHE DEBUG: Final cache state:', window.PreferencesCore?.cacheManager?.getAll?.() || 'Cache not available');
        
        // Show loading notification
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification(`טוען נתונים לפרופיל: ${profile.name}...`);
        }
        
        // Reload all preferences and form data for the new profile
        console.log('🔄 Reloading all form data for new profile...');
        try {
            // Reload preferences using the UI system with cache-busting
            if (window.PreferencesUI && typeof window.PreferencesUI.loadAllPreferences === 'function') {
                console.log('🔄 Reloading preferences with cache-busting...');
                console.log(`🔄 Using cache buster: ${window.cacheBuster || 'none'}`);
                await window.PreferencesUI.loadAllPreferences(1, profile.id);
                console.log('✅ Preferences reloaded for new profile');
            }
            
            // Reload profiles dropdown to show current active profile
            if (typeof window.loadProfilesToDropdown === 'function') {
                console.log('🔄 Reloading profiles dropdown to show active profile...');
                await window.loadProfilesToDropdown();
                console.log('✅ Profiles dropdown reloaded');
                
                // Verify the dropdown shows the correct active profile
                const profileSelectElement = document.getElementById('profileSelect');
                if (profileSelectElement) {
                    const selectedValue = profileSelectElement.value;
                    console.log(`🔍 UI DEBUG: Dropdown now shows: ${selectedValue}`);
                    console.log(`🔍 UI DEBUG: Expected profile: ${profile.name}`);
                    
                    // Force update the dropdown if it doesn't match
                    if (selectedValue !== profile.name) {
                        console.log(`⚠️ MISMATCH: Dropdown shows "${selectedValue}" but expected "${profile.name}"`);
                        console.log(`🔄 Forcing dropdown update...`);
                        
                        // Find and select the correct option
                        const correctOption = profileSelectElement.querySelector(`option[value="${profile.name}"]`);
                        if (correctOption) {
                            correctOption.selected = true;
                            console.log(`✅ Forced selection of "${profile.name}" in dropdown`);
                        } else {
                            console.error(`❌ Option "${profile.name}" not found in dropdown!`);
                            console.log(`🔍 Available options:`, Array.from(profileSelectElement.options).map(opt => opt.value));
        }
    } else {
                        console.log(`✅ Dropdown correctly shows "${profile.name}"`);
                    }
                }
            }
            
            // Update active profile info display in the new card format
            const activeProfileName = document.getElementById('activeProfileName');
            const activeProfileDescription = document.getElementById('activeProfileDescription');
            
            if (activeProfileName) {
                activeProfileName.textContent = profile.name;
            }
            if (activeProfileDescription) {
                activeProfileDescription.textContent = profile.description || 'פרופיל משתמש';
            }
            console.log(`🔍 UI DEBUG: Updated active profile card to: ${profile.name}`);
            
            // Check if this is the default profile and disable all preferences
            const isDefaultProfile = profile.is_default || profile.default || profile.name === 'ברירת מחדל';
            if (isDefaultProfile) {
                console.log('🔒 Default profile active - disabling all preferences interface');
                window.disableAllPreferencesInterface();
            } else {
                console.log('✅ User profile active - enabling all preferences interface');
                window.enableAllPreferencesInterface();
            }
            
            // Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(`פרופיל הוחלף ל: ${profile.name}! כל הנתונים נטענו מחדש.`);
            }
            
            console.log('✅ Profile switch completed - all form data reloaded');
            
        } catch (error) {
            console.error('❌ Error reloading form data:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification(`שגיאה בטעינת נתונים לפרופיל החדש: ${error.message}`);
            }
        }
        
            } catch (error) {
        console.error('❌ Error switching profile:', error);
        
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
        console.log('🔄 Starting new profile creation...');
        
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
        
        console.log(`📋 Creating profile: ${profileName}`);
        
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
        
        console.log('✅ Profile created successfully');
        
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
        console.error('❌ Error creating profile:', error);
        
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(`שגיאה ביצירת פרופיל: ${error.message}`);
        }
    }
}

/**
 * Local copyDetailedLog function for preferences page
 */
async function copyDetailedLog() {
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
            console.log('✅ Log copied to clipboard');
            
                if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('לוג הועתק ללוח');
            }
        } else {
            console.log('⚠️ Clipboard API not available');
            console.log('📋 Log content:', logContent);
        }
        
        return logContent;
        
    } catch (error) {
        console.error('❌ Error generating detailed log:', error);
        return `Error generating log: ${error.message}`;
    }
}

/**
 * Initialize page-specific functionality
 */
function initializePreferencesPage() {
    console.log('🚀 Initializing preferences page...');
    
    // Load accounts when page loads
    loadAccountsForPreferences();
    
    // Make functions globally available
    window.switchActiveProfile = switchActiveProfile;
    window.createNewProfile = createNewProfile;
    window.copyDetailedLog = copyDetailedLog;
    
    console.log('✅ Preferences page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreferencesPage);
} else {
    initializePreferencesPage();
}

console.log('✅ preferences-page.js v3.0 loaded successfully');