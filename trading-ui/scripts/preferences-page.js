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
async function loadColorsForPreferences() {
    try {
        // Use global preferences system
        if (typeof window.loadPreferences === 'function') {
            const result = await window.loadPreferences();
            if (result && result.success) {
                const preferences = result.data.preferences || {};
                
                // Load colors into color pickers - load all color pickers on the page
                let loadedCount = 0;
                const allColorPickers = document.querySelectorAll('input[type="color"]');
                allColorPickers.forEach(picker => {
                    const id = picker.id;
                    if (preferences[id]) {
                        picker.value = preferences[id];
                        loadedCount++;
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
        if (typeof showNotification === 'function') {
            showNotification('המערכת תומכת כרגע רק בדולר אמריקאי (USD)', 'warning');
        } else {
            alert('המערכת תומכת כרגע רק בדולר אמריקאי (USD)');
        }
        
        // Reset to USD
        selectElement.value = 'USD - דולר ארה"ב';
    }
}

/**
 * Initialize preferences page
 */
function initializePreferencesPage() {
    console.log('⚙️ Initializing preferences page...');
    
    // Load accounts from database
    loadAccountsForPreferences();
    
    // Load colors from database
    loadColorsForPreferences();
    
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
            const result = await window.getAllUserPreferences();
            if (result && result.success) {
                const preferences = result.data.preferences || {};
                const count = Object.keys(preferences).length;
                const countElement = document.getElementById('preferencesCount');
                if (countElement) {
                    countElement.textContent = count;
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

// Export functions to global scope
window.loadAccountsForPreferences = loadAccountsForPreferences;
window.loadColorsForPreferences = loadColorsForPreferences;
window.validateCurrency = validateCurrency;
window.initializePreferencesPage = initializePreferencesPage;
window.initializeInfoSummary = initializeInfoSummary;

console.log('✅ preferences-page.js loaded successfully');
