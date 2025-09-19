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
        // Use global function to load accounts
        if (typeof window.loadAccountsDataFromAPI === 'function') {
            const accounts = await window.loadAccountsDataFromAPI();
            console.log('📊 Accounts loaded:', accounts);
            
            const accountSelect = document.getElementById('defaultAccountFilter');
            if (accountSelect && accounts) {
                // Clear existing options except the first one
                accountSelect.innerHTML = '<option>כל החשבונות</option>';
                
                // Add active accounts
                accounts.forEach(account => {
                    if (account.is_active) {
                        const option = document.createElement('option');
                        option.value = account.id;
                        option.textContent = account.name;
                        accountSelect.appendChild(option);
                    }
                });
                
                console.log('✅ Loaded accounts for preferences:', accounts.length);
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
        // Use global preferences system
        if (typeof window.loadPreferences === 'function') {
            const result = await window.loadPreferences();
            if (result && result.success) {
                const preferences = result.data.preferences || {};
                
                // Load colors into color pickers - load all color pickers on the page
                let loadedCount = 0;
                const allColorPickers = document.querySelectorAll('input[type="color"]');
                console.log(`🎨 Found ${allColorPickers.length} color pickers on page`);
                
                allColorPickers.forEach(picker => {
                    const id = picker.id;
                    const colorKey = picker.getAttribute('data-color-key');
                    console.log(`🎨 Processing color picker: ${id} (key: ${colorKey})`);
                    
                    // Try to find by color key first, then by id
                    let colorValue = null;
                    if (colorKey && preferences[colorKey]) {
                        colorValue = preferences[colorKey];
                    } else if (preferences[id]) {
                        colorValue = preferences[id];
                    }
                    
                    if (colorValue && colorValue !== '#000000' && colorValue !== 'black') {
                        picker.value = colorValue;
                        loadedCount++;
                        console.log(`✅ Loaded color for ${id}: ${colorValue}`);
                    } else {
                        console.log(`⚠️ No preference found for ${id}, setting default`);
                        // Set default color if none found
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
                        } else {
                            picker.value = '#6c757d';
                        }
                    }
                });
                
                console.log(`✅ Loaded ${loadedCount} colors for preferences using global system`);
            }
        } else {
            console.warn('⚠️ Global loadPreferences function not available');
        }
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
            window.showNotification('⚠️ המערכת תומכת כרגע רק בדולר אמריקאי (USD). השדה אופס לברירת המחדל.', 'warning');
        } else {
            alert('⚠️ המערכת תומכת כרגע רק בדולר אמריקאי (USD). השדה אופס לברירת המחדל.');
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
    loadAccountsForPreferences();
    
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
        if (typeof window.getAllUserPreferences === 'function') {
            try {
                const result = await window.getAllUserPreferences();
                if (result && result.success) {
                    const preferences = result.data.preferences || {};
                    const count = Object.keys(preferences).length;
                    const countElement = document.getElementById('preferencesCount');
                    if (countElement) {
                        countElement.textContent = count;
                        console.log(`📊 Loaded preferences count: ${count}`);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading preferences count:', error);
                const countElement = document.getElementById('preferencesCount');
                if (countElement) {
                    countElement.textContent = 'שגיאה';
                }
            }
        }

        // Load active profile
        if (typeof window.getUserProfiles === 'function') {
            const profiles = await window.getUserProfiles();
            if (profiles && profiles.length > 0) {
                const activeProfile = profiles.find(p => p.is_active) || profiles[0];
                const profileElement = document.getElementById('activeProfileInfo');
                if (profileElement) {
                    profileElement.textContent = activeProfile.profile_name || 'ברירת מחדל';
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
    
    inputs.forEach(input => {
        if (input.id && input.id !== 'saveAllBtn' && input.id !== 'resetBtn') {
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
        }
    });
    
    console.log('📝 Collected form data:', formData);
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
        
        // Use the preferences service to save
        if (typeof window.savePreferences === 'function') {
            const result = await window.savePreferences(formData);
            
            if (result) {
                console.log('✅ All preferences saved successfully');
                
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
