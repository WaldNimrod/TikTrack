/**
 * Preferences Page Script
 * Handles page-specific functionality for preferences.html
 * 
 * @author TikTrack Development Team
 * @version 3.0
 * @since September 2025
 */

console.log('📄 Loading preferences-page.js...');

/**
 * Load accounts using global function
 */
async function loadAccountsForPreferences() {
    try {
        console.log('🔄 Loading accounts for preferences...');
        // Use global function to load accounts
        if (typeof window.loadAccountsDataFromAPI === 'function') {
            console.log('📡 Calling loadAccountsDataFromAPI...');
            const accounts = await window.loadAccountsDataFromAPI();
            console.log('📊 Accounts loaded:', accounts);
            
            const accountSelect = document.getElementById('defaultAccountFilter');
            if (accountSelect && accounts) {
                // Clear existing options except the first one
                accountSelect.innerHTML = '<option>כל החשבונות</option>';
                
                // Add active accounts (status = "open")
                accounts.forEach(account => {
                    if (account.status === 'open') {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = account.name;
                        accountSelect.appendChild(option);
                    }
                });
                
                console.log('✅ Loaded accounts for preferences:', accounts.length);
            } else {
                console.warn('⚠️ Account select element not found');
            }
        } else {
            console.warn('⚠️ Global loadAccountsDataFromAPI function not available');
        }
    } catch (error) {
        console.error('❌ Error loading accounts:', error);
    }
}

/**
 * Load colors using global preferences system
 */
window.loadColorsForPreferences = async function() {
    try {
        // Load colors directly from API
        const allColorPickers = document.querySelectorAll('input[type="color"]');
        console.log(`🎨 Found ${allColorPickers.length} color pickers on page`);
        
        let loadedCount = 0;
        
        for (const picker of allColorPickers) {
            const id = picker.id;
            const colorKey = picker.getAttribute('data-color-key');
            console.log(`🎨 Processing color picker: ${id} (key: ${colorKey})`);
            
            try {
                // Try to get preference by name
                const preferenceName = colorKey || id;
                const response = await fetch(`/api/preferences/user/preference?name=${preferenceName}&user_id=1`);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data.value) {
                        const colorValue = result.data.value;
                        if (colorValue && colorValue !== '#000000' && colorValue !== 'black') {
                            picker.value = colorValue;
                            loadedCount++;
                            console.log(`✅ Loaded color for ${id}: ${colorValue}`);
                            continue;
                        }
                    }
                }
                
                // Fallback to default colors
                console.log(`⚠️ No preference found for ${id}, setting default`);
                if (id.includes('primary')) {
                    picker.value = '#007bff';
                } else if (id.includes('success')) {
                    picker.value = '#28a745';
                } else if (id.includes('warning')) {
                    picker.value = '#ffc107';
                } else if (id.includes('danger')) {
                    picker.value = '#dc3545';
                } else if (id.includes('positive')) {
                    picker.value = '#28a745';
                } else if (id.includes('negative')) {
                    picker.value = '#dc3545';
                } else if (id.includes('neutral')) {
                    picker.value = '#6c757d';
                } else if (id.includes('entity')) {
                    picker.value = '#6f42c1';
                } else {
                    picker.value = '#6c757d';
                }
                
            } catch (error) {
                console.error(`❌ Error loading color for ${id}:`, error);
                // Set default color
                picker.value = '#6c757d';
            }
        }
        
        console.log(`🎨 Loaded ${loadedCount} colors from preferences`);
    } catch (error) {
        console.error('❌ Error loading colors:', error);
    }
}

/**
 * Validate currency change - specific to preferences page
 * Only allows USD currency selection
 */
function validateCurrency(selectElement) {
    const selectedValue = selectElement.value;
    
    // Check if not USD
    if (!selectedValue.includes('USD')) {
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('⚠️ המערכת תומכת כרגע רק בדולר אמריקאי (USD). השדה אופס לברירת המחדל.', 'warning', 'אזהרה', 5000, 'ui');
        } else {
            window.showInfoNotification('⚠️ המערכת תומכת כרגע רק בדולר אמריקאי (USD). השדה אופס לברירת המחדל.');
        }
        
        // Reset to USD
        selectElement.value = 'USD - דולר ארה"ב';
    }
}

/**
 * Load trading settings from preferences
 */
async function loadTradingSettings() {
    try {
        console.log('📈 Loading trading settings...');
        
        // Try multiple approaches to load trading settings
        let settings = {};
        
        // Method 1: Try getGroupPreferences
        if (typeof window.getGroupPreferences === 'function') {
            try {
                const result = await window.getGroupPreferences('trading_settings');
                if (result && result.success) {
                    settings = result.data.preferences || {};
                    console.log('✅ Loaded via getGroupPreferences:', settings);
                }
            } catch (error) {
                console.warn('⚠️ getGroupPreferences failed:', error);
            }
        }
        
        // Method 2: Try individual preferences
        if (Object.keys(settings).length === 0) {
            try {
                const stopLoss = await window.getPreference('defaultStopLoss');
                const targetPrice = await window.getPreference('defaultTargetPrice');
                const commission = await window.getPreference('defaultCommission');
                
                if (stopLoss && stopLoss.success) settings.defaultStopLoss = stopLoss.data.value;
                if (targetPrice && targetPrice.success) settings.defaultTargetPrice = targetPrice.data.value;
                if (commission && commission.success) settings.defaultCommission = commission.data.value;
                
                console.log('✅ Loaded via individual preferences:', settings);
            } catch (error) {
                console.warn('⚠️ Individual preferences failed:', error);
            }
        }
        
        // Method 3: Use defaults if nothing loaded
        if (Object.keys(settings).length === 0) {
            settings = {
                defaultStopLoss: '2.0',
                defaultTargetPrice: '5.0',
                defaultCommission: '0.5'
            };
            console.log('⚠️ Using default values:', settings);
        }
        
        // Update UI
        const stopLossElement = document.getElementById('defaultStopLoss');
        const targetPriceElement = document.getElementById('defaultTargetPrice');
        const commissionElement = document.getElementById('defaultCommission');
        
        if (stopLossElement) stopLossElement.value = settings.defaultStopLoss || '2.0';
        if (targetPriceElement) targetPriceElement.value = settings.defaultTargetPrice || '5.0';
        if (commissionElement) commissionElement.value = settings.defaultCommission || '0.5';
        
        console.log('✅ Trading settings UI updated:', { 
            defaultStopLoss: settings.defaultStopLoss, 
            defaultTargetPrice: settings.defaultTargetPrice, 
            defaultCommission: settings.defaultCommission 
        });
    } catch (error) {
        console.error('❌ Error loading trading settings:', error);
        
        // Fallback to defaults
        const stopLossElement = document.getElementById('defaultStopLoss');
        const targetPriceElement = document.getElementById('defaultTargetPrice');
        const commissionElement = document.getElementById('defaultCommission');
        
        if (stopLossElement) stopLossElement.value = '2.0';
        if (targetPriceElement) targetPriceElement.value = '5.0';
        if (commissionElement) commissionElement.value = '0.5';
    }
}

/**
 * Initialize preferences page
 */
async function initializePreferencesPage() {
    console.log('⚙️ Initializing preferences page...');
    
    // Load accounts from database
    console.log('🔄 Calling loadAccountsForPreferences...');
    await loadAccountsForPreferences();
    
    // Load colors from database
    console.log('🎨 Calling loadColorsForPreferences...');
    try {
        await window.loadColorsForPreferences();
        console.log('✅ Colors loaded successfully');
    } catch (error) {
        console.error('❌ Error loading colors:', error);
    }
    
    // Load trading settings
    await loadTradingSettings();
    
    // Initialize info summary
    initializeInfoSummary();
    
    // Load preferences to update form fields
    if (typeof window.loadPreferences === 'function') {
        console.log('🔄 Loading preferences to update form...');
        window.loadPreferences();
    }
    
    // Initialize admin interface
    if (typeof window.createPreferencesAdminInterface === 'function') {
        const adminContainer = document.getElementById('adminInterfaceContainer');
        if (adminContainer) {
            window.createPreferencesAdminInterface();
        }
    } else {
        console.warn('Admin interface functions not available');
    }
}

/**
 * Initialize info summary with real data
 */
async function initializeInfoSummary() {
    try {
        console.log('📊 Initializing info summary...');
        
        // Load preferences count
        try {
            const response = await fetch('/api/preferences/user?user_id=1');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.preferences) {
                    const count = Object.keys(result.data.preferences).length;
                    const countElement = document.getElementById('preferencesCount');
                    if (countElement) {
                        countElement.textContent = count;
                        console.log(`📊 Loaded preferences count: ${count}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading preferences count:', error);
            const countElement = document.getElementById('preferencesCount');
            if (countElement) {
                countElement.textContent = 'שגיאה';
            }
        }

        // Load profiles count
        if (typeof window.getUserProfiles === 'function') {
            try {
                const profiles = await window.getUserProfiles();
                if (profiles && profiles.length > 0) {
                    const profilesCountElement = document.getElementById('profilesCount');
                    if (profilesCountElement) {
                        profilesCountElement.textContent = profiles.length;
                        console.log(`📊 Loaded profiles count: ${profiles.length}`);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading profiles count:', error);
                const profilesCountElement = document.getElementById('profilesCount');
                if (profilesCountElement) {
                    profilesCountElement.textContent = 'שגיאה';
                }
            }
        }

        // Load groups count
        try {
            const response = await fetch('/api/preferences/groups');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.groups) {
                    const groupsCountElement = document.getElementById('groupsCount');
                    if (groupsCountElement) {
                        groupsCountElement.textContent = result.data.groups.length;
                        console.log(`📊 Loaded groups count: ${result.data.groups.length}`);
                    }
                }
            } else {
                // Fallback: count groups from preferences
                const response2 = await fetch('/api/preferences/user?user_id=1');
                if (response2.ok) {
                    const result2 = await response2.json();
                    if (result2.success && result2.data.preferences) {
                        const groups = new Set();
                        Object.values(result2.data.preferences).forEach(pref => {
                            if (pref.group) groups.add(pref.group);
                        });
                        const groupsCountElement = document.getElementById('groupsCount');
                        if (groupsCountElement) {
                            groupsCountElement.textContent = groups.size;
                            console.log(`📊 Loaded groups count from preferences: ${groups.size}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading groups count:', error);
            const groupsCountElement = document.getElementById('groupsCount');
            if (groupsCountElement) {
                groupsCountElement.textContent = 'שגיאה';
            }
        }

        // Load active profile
        if (typeof window.getUserProfiles === 'function') {
            const profiles = await window.getUserProfiles();
            if (profiles && profiles.length > 0) {
                const activeProfile = profiles.find(p => p.active) || profiles[0];
                const profileElement = document.getElementById('activeProfileInfo');
                if (profileElement) {
                    profileElement.textContent = activeProfile.name || 'ברירת מחדל';
                }
                
                // Load profiles to dropdown using the dedicated function
                if (typeof window.loadProfilesToDropdown === 'function') {
                    await window.loadProfilesToDropdown();
                }
                
                // Add event listener for profile selection
                const profileSelect = document.getElementById('profileSelect');
                if (profileSelect) {
                    profileSelect.addEventListener('change', async function() {
                        const selectedProfile = this.value;
                        console.log(`🔄 Profile changed to: ${selectedProfile}`);
                        
                        if (selectedProfile && selectedProfile !== 'ברירת מחדל') {
                            // Get profile ID and switch to it
                            const profiles = await window.getUserProfiles();
                            const profile = profiles.find(p => p.name === selectedProfile);
                            if (profile && typeof window.switchProfile === 'function') {
                                console.log(`🔄 Switching to profile: ${profile.name} (ID: ${profile.id})`);
                                await window.switchProfile(profile.id);
                                
                                // Reload preferences after switching profile
                                if (typeof window.loadPreferences === 'function') {
                                    await window.loadPreferences(1, profile.id);
                                }
                                
                                // Show success notification
                                if (typeof window.showSuccessNotification === 'function') {
                                    window.showSuccessNotification(`פרופיל הוחלף ל: ${profile.name}`);
                                }
                            }
                        } else if (selectedProfile === 'ברירת מחדל') {
                            // Switch to default profile
                            const profiles = await window.getUserProfiles();
                            const defaultProfile = profiles.find(p => p.default);
                            if (defaultProfile && typeof window.switchProfile === 'function') {
                                console.log(`🔄 Switching to default profile: ${defaultProfile.name} (ID: ${defaultProfile.id})`);
                                await window.switchProfile(defaultProfile.id);
                                
                                // Reload preferences after switching profile
                                if (typeof window.loadPreferences === 'function') {
                                    await window.loadPreferences(1, defaultProfile.id);
                                }
                                
                                // Show success notification
                                if (typeof window.showSuccessNotification === 'function') {
                                    window.showSuccessNotification('פרופיל הוחלף לברירת מחדל');
                                }
                            }
                        }
                    });
                }
            }
        }

        // Load primary currency
        if (typeof window.getPreference === 'function') {
            const currency = await window.getPreference('primaryCurrency');
            if (currency) {
                const currencyElement = document.getElementById('primaryCurrencyInfo');
                if (currencyElement) {
                    currencyElement.textContent = currency;
                }
            }
        }

        // Set last update time
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleString('he-IL');
        }

        console.log('✅ Info summary initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing info summary:', error);
    }
}

/**
 * Collect form data from all preference inputs
 */
function collectFormData() {
    const formData = {};
    
    // Collect all input elements
    const inputs = document.querySelectorAll('input, select, textarea');
    console.log(`📋 Found ${inputs.length} input elements on page`);
    
    inputs.forEach(input => {
        if (input.id && input.id !== 'saveAllBtn' && input.id !== 'resetBtn' && !input.disabled) {
            let value = input.value;
            
            // Handle different input types
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number') {
                value = parseFloat(value) || 0;
            } else if (input.type === 'color') {
                // Keep color values as strings
                value = value || '#000000';
            }
            
            formData[input.id] = value;
            console.log(`📋 Collected: ${input.id} = ${value} (type: ${input.type})`);
        }
    });
    
    console.log('📝 Collected form data:', formData);
    console.log(`📋 Total fields collected: ${Object.keys(formData).length}`);
    return formData;
}

/**
 * Save all preferences from form
 */
async function saveAllPreferences() {
    try {
        console.log('💾 Saving all preferences...');
        
        const formData = collectFormData();
        
        if (Object.keys(formData).length === 0) {
            console.warn('⚠️ No form data to save');
            return false;
        }
        
        // Get current active profile (not selected profile)
        const profiles = await window.getUserProfiles();
        const activeProfile = profiles.find(p => p.active);
        let profileId = null;
        
        if (activeProfile) {
            profileId = activeProfile.id;
            console.log(`📂 Saving to active profile: ${activeProfile.name} (ID: ${profileId})`);
        } else {
            console.log('📂 No active profile found, saving to default');
        }
        
        // Use the preferences service to save
        if (typeof window.savePreferences === 'function') {
            const result = await window.savePreferences(formData, 1, profileId);
            
            if (result) {
                console.log('✅ All preferences saved successfully');
                
                // Clear cache manually to ensure fresh data
                if (window.preferencesCache && window.preferencesCache.clear) {
                    console.log('🗑️ Clearing preferences cache manually...');
                    await window.preferencesCache.clear();
                }
                
                // Reload preferences to update form
                if (typeof window.loadPreferences === 'function') {
                    console.log('🔄 Reloading preferences to update form...');
                    await window.loadPreferences(1, profileId);
                }
                
                // Reload colors to update color pickers
                if (typeof window.loadColorsForPreferences === 'function') {
                    console.log('🎨 Reloading colors to update color pickers...');
                    await window.loadColorsForPreferences();
                }
                
                // Show success notification
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('העדפות נשמרו בהצלחה!');
                }
                
                return true;
            } else {
                throw new Error('Save preferences returned false');
            }
        } else {
            throw new Error('savePreferences function not available');
        }
        
    } catch (error) {
        console.error('❌ Error saving preferences:', error);
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשמירת העדפות: ' + error.message);
        }
        
        return false;
    }
}

// Export functions to global scope
window.loadAccountsForPreferences = loadAccountsForPreferences;
window.loadColorsForPreferences = loadColorsForPreferences;
window.loadTradingSettings = loadTradingSettings;
window.validateCurrency = validateCurrency;
window.initializePreferencesPage = initializePreferencesPage;
window.initializeInfoSummary = initializeInfoSummary;
window.collectFormData = collectFormData;
window.saveAllPreferences = saveAllPreferences;

console.log('✅ preferences-page.js loaded successfully');
