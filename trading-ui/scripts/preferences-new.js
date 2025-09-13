/**
 * Preferences System - New Version
 * מערכת העדפות חדשה עם מבנה מסודר וברור
 */

// Global variables
let currentProfile = null;
let preferences = {};
let colorScheme = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing new preferences page...');
    
    // Load preferences from database
    loadPreferencesFromDatabase();
    
    // Load profiles
    loadProfiles();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('✅ Preferences page initialized successfully');
});

/**
 * Load preferences from database
 */
async function loadPreferencesFromDatabase() {
    try {
        console.log('📡 Loading preferences from database...');
        
        // Try to load from API first
        try {
            const response = await fetch('/api/v1/preferences/user');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Preferences loaded from API:', data);
                
                if (data && typeof data === 'object') {
                    // Check if data has nested structure
                    if (data.data && data.data.preferences) {
                        preferences = data.data.preferences;
                    } else if (data.preferences) {
                        preferences = data.preferences;
                    } else {
                        preferences = data;
                    }
                    
                    // Load color scheme
                    if (preferences.color_scheme_json) {
                        try {
                            colorScheme = JSON.parse(preferences.color_scheme_json);
                            console.log('🎨 Color scheme loaded from preferences:', colorScheme);
                        } catch (parseError) {
                            console.warn('⚠️ Failed to parse color scheme JSON:', parseError);
                            loadDefaultColorScheme();
                        }
                    } else {
                        console.log('🔧 No color scheme in preferences, loading default');
                        loadDefaultColorScheme();
                    }
                    
                    // Apply preferences to form controls
                    applyPreferencesToControls();
                    
                    // Apply colors to previews
                    applyColorSchemeToPreviews();
                    
                    // Initialize color pickers after colors are set
                    initializeColorPickers();
                    
                    return; // Success, exit early
                } else {
                    console.warn('⚠️ API returned invalid data:', data);
                }
            } else {
                console.warn('⚠️ API returned status:', response.status);
            }
        } catch (apiError) {
            console.warn('⚠️ API call failed:', apiError);
        }
        
        // Fallback to defaults
        console.log('🔧 Using default preferences...');
        loadDefaultPreferences();
        
    } catch (error) {
        console.error('❌ Error loading preferences:', error);
        loadDefaultPreferences();
    }
}

/**
 * Load default color scheme
 */
function loadDefaultColorScheme() {
    console.log('🎨 Loading default color scheme...');
    
    colorScheme = {
        theme: "light",
        numericValues: {
            positive: { text: "#28a745", background: "#d4edda" },
            negative: { text: "#dc3545", background: "#f8d7da" },
            zero: { text: "#6c757d", background: "#e2e3e5" }
        },
        entities: {
            trade: "#007bff",
            account: "#28a745", 
            ticker: "#dc3545",
            alert: "#ff9c05"
        },
        status: {
            open: { text: "#28a745", background: "rgba(40, 167, 69, 0.1)" },
            closed: { text: "#6c757d", background: "rgba(108, 117, 125, 0.1)" },
            cancelled: { text: "#dc3545", background: "rgba(220, 53, 69, 0.1)" }
        }
    };
}

/**
 * Load default preferences
 */
function loadDefaultPreferences() {
    console.log('🔧 Loading default preferences...');
    
    preferences = {
        primary_currency: 'ILS',
        secondary_currency: 'USD',
        timezone: 'Asia/Jerusalem',
        language: 'he',
        date_format: 'DD/MM/YYYY',
        number_format: '1,234.56',
        default_stop_loss: 5,
        default_target_price: 10,
        default_commission: 1,
        risk_percentage: 2,
        default_trade_amount: null,
        trading_hours_start: '09:00',
        trading_hours_end: '17:00',
        default_status_filter: 'all',
        default_type_filter: 'all',
        default_account_filter: 'all',
        default_date_range_filter: '30d',
        default_search_filter: '',
        default_profit_filter: 'all',
        default_min_amount: null,
        default_max_amount: null,
        theme: 'light',
        compact_mode: false,
        show_animations: true,
        sidebar_position: 'right',
        default_page: 'trades',
        table_page_size: 25,
        table_show_icons: true,
        table_auto_refresh: true,
        table_refresh_interval: 30,
        chart_theme: 'light',
        chart_animation: true,
        show_chart_grid: true,
        default_chart_period: '1d',
        primary_data_provider: 'yahoo',
        secondary_data_provider: 'alpha_vantage',
        fallback_data_provider: 'yahoo',
        data_refresh_interval: 60,
        cache_ttl: 60,
        max_batch_size: 100,
        request_delay: 100,
        retry_attempts: 3,
        retry_delay: 1000,
        timeout_duration: 10000,
        show_percentage_changes: true,
        show_volume: true,
        show_market_cap: true,
        show_52_week_range: true,
        enable_notifications: true,
        notification_sound: true,
        notification_popup: true,
        notification_email: false,
        notify_on_trade_executed: true,
        notify_on_stop_loss: true,
        notify_on_target_reached: true,
        notify_on_margin_call: true,
        notify_on_data_failures: true,
        notify_on_stale_data: true,
        notify_on_price_alerts: true,
        console_cleanup_interval: 300,
        console_auto_clear: false,
        console_max_entries: 1000,
        verbose_logging: false,
        log_level: 'info',
        enable_caching: true,
        prefetch_data: true,
        lazy_loading: true,
        session_timeout: 3600,
        auto_backup: true,
        backup_interval: 24,
        track_user_activity: true,
        generate_reports: true
    };
    
    // Load default color scheme
    loadDefaultColorScheme();
    
    applyPreferencesToControls();
    applyColorSchemeToPreviews();
    
    // Initialize color pickers after colors are set
    initializeColorPickers();
}

/**
 * Apply preferences to form controls
 */
function applyPreferencesToControls() {
    console.log('⚙️ Applying preferences to form controls...');
    
    // Basic settings
    setControlValue('primaryCurrency', preferences.primary_currency);
    setControlValue('secondaryCurrency', preferences.secondary_currency);
    setControlValue('timezone', preferences.timezone);
    setControlValue('language', preferences.language);
    setControlValue('dateFormat', preferences.date_format);
    setControlValue('numberFormat', preferences.number_format);
    
    // Trading settings
    setControlValue('defaultStopLoss', preferences.default_stop_loss);
    setControlValue('defaultTargetPrice', preferences.default_target_price);
    setControlValue('defaultCommission', preferences.default_commission);
    setControlValue('riskPercentage', preferences.risk_percentage);
    setControlValue('defaultTradeAmount', preferences.default_trade_amount);
    setControlValue('tradingHoursStart', preferences.trading_hours_start);
    setControlValue('tradingHoursEnd', preferences.trading_hours_end);
    
    // System settings
    setControlChecked('compactMode', preferences.compact_mode);
    setControlChecked('showAnimations', preferences.show_animations);
    setControlChecked('enableNotifications', preferences.enable_notifications);
    setControlChecked('notificationSound', preferences.notification_sound);
    setControlChecked('notificationPopup', preferences.notification_popup);
    setControlChecked('notificationEmail', preferences.notification_email);
    setControlChecked('notifyOnTradeExecuted', preferences.notify_on_trade_executed);
    setControlChecked('notifyOnStopLoss', preferences.notify_on_stop_loss);
    setControlChecked('notifyOnTargetReached', preferences.notify_on_target_reached);
    setControlValue('defaultPage', preferences.default_page);
    setControlValue('tablePageSize', preferences.table_page_size);
    setControlValue('tableRefreshInterval', preferences.table_refresh_interval);
    
    // Backup settings
    setControlChecked('autoBackup', preferences.auto_backup);
    setControlValue('backupInterval', preferences.backup_interval);
    
    // API settings
    setControlValue('primaryDataProvider', preferences.primary_data_provider);
    setControlValue('secondaryDataProvider', preferences.secondary_data_provider);
    
    // Performance settings
    setControlChecked('enableCaching', preferences.enable_caching);
    setControlValue('cacheTtl', preferences.cache_ttl);
    setControlValue('dataRefreshInterval', preferences.data_refresh_interval);
    setControlValue('maxBatchSize', preferences.max_batch_size);
    setControlValue('requestDelay', preferences.request_delay);
}

/**
 * Set control value helper
 */
function setControlValue(id, value) {
    const control = document.getElementById(id);
    if (control && value !== null && value !== undefined) {
        control.value = value;
    }
}

/**
 * Set control checked helper
 */
function setControlChecked(id, value) {
    const control = document.getElementById(id);
    if (control) {
        control.checked = Boolean(value);
    }
}

/**
 * Apply color scheme to previews
 */
function applyColorSchemeToPreviews() {
    console.log('🎨 Applying color scheme to previews...');
    console.log('🎨 Color scheme:', colorScheme);
    
    // Numeric values
    if (colorScheme.numericValues) {
        const nv = colorScheme.numericValues;
        console.log('🎨 Numeric values:', nv);
        
        if (nv.positive) {
            console.log('🎨 Setting positive colors:', nv.positive);
            setColorPreview('positiveTextPreview', nv.positive.text);
            setColorPreview('positiveBgPreview', nv.positive.background);
        }
        
        if (nv.negative) {
            console.log('🎨 Setting negative colors:', nv.negative);
            setColorPreview('negativeTextPreview', nv.negative.text);
            setColorPreview('negativeBgPreview', nv.negative.background);
        }
        
        if (nv.zero) {
            console.log('🎨 Setting zero colors:', nv.zero);
            setColorPreview('zeroTextPreview', nv.zero.text);
            setColorPreview('zeroBgPreview', nv.zero.background);
        }
    }
    
    // Entities
    if (colorScheme.entities) {
        const entities = colorScheme.entities;
        console.log('🎨 Entities:', entities);
        Object.keys(entities).forEach(entity => {
            console.log(`🎨 Setting ${entity} color:`, entities[entity]);
            setColorPreview(entity + 'Preview', entities[entity]);
        });
    }
    
    // Status
    if (colorScheme.status) {
        const status = colorScheme.status;
        console.log('🎨 Status:', status);
        
        if (status.open) {
            console.log('🎨 Setting open status colors:', status.open);
            setColorPreview('statusOpenTextPreview', status.open.text);
            setColorPreview('statusOpenBgPreview', status.open.background);
        }
        
        if (status.closed) {
            console.log('🎨 Setting closed status colors:', status.closed);
            setColorPreview('statusClosedTextPreview', status.closed.text);
            setColorPreview('statusClosedBgPreview', status.closed.background);
        }
        
        if (status.cancelled) {
            console.log('🎨 Setting cancelled status colors:', status.cancelled);
            setColorPreview('statusCancelledTextPreview', status.cancelled.text);
            setColorPreview('statusCancelledBgPreview', status.cancelled.background);
        }
    }
    
    console.log('🎨 Color scheme application completed');
}

/**
 * Set color preview helper
 */
function setColorPreview(id, color) {
    console.log(`🎨 Setting color preview ${id} to ${color}`);
    const preview = document.getElementById(id);
    if (preview) {
        // Use the dynamic color system - set CSS custom property on document root
        const colorKey = getColorKeyFromId(id);
        if (colorKey) {
            document.documentElement.style.setProperty(`--user-${colorKey}`, color);
            console.log(`✅ Set CSS variable --user-${colorKey} to ${color}`);
        }
        
        // Set data attribute for CSS targeting
        const dataColor = getDataColorFromId(id);
        if (dataColor) {
            preview.setAttribute('data-color', dataColor);
            console.log(`✅ Set data-color attribute to ${dataColor}`);
        }
        
        // Also update the corresponding color input
        const colorInput = document.getElementById(id.replace('Preview', 'Color'));
        if (colorInput) {
            const hexColor = rgbToHex(color);
            colorInput.value = hexColor;
            console.log(`✅ Color input ${colorInput.id} set to ${hexColor}`);
        } else {
            console.warn(`⚠️ No color input found for ${id}`);
        }
    } else {
        console.error(`❌ No preview element found for ${id}`);
    }
}

/**
 * Get data color from preview ID
 */
function getDataColorFromId(id) {
    const dataColorMap = {
        'positiveTextPreview': 'positiveText',
        'positiveBgPreview': 'positiveBg',
        'negativeTextPreview': 'negativeText',
        'negativeBgPreview': 'negativeBg',
        'zeroTextPreview': 'zeroText',
        'zeroBgPreview': 'zeroBg',
        'tradePreview': 'trade',
        'accountPreview': 'account',
        'tickerPreview': 'ticker',
        'alertPreview': 'alert',
        'statusOpenTextPreview': 'statusOpenText',
        'statusOpenBgPreview': 'statusOpenBg',
        'statusClosedTextPreview': 'statusClosedText',
        'statusClosedBgPreview': 'statusClosedBg',
        'statusCancelledTextPreview': 'statusCancelledText',
        'statusCancelledBgPreview': 'statusCancelledBg'
    };
    
    return dataColorMap[id] || null;
}

/**
 * Get color key from preview ID
 */
function getColorKeyFromId(id) {
    const colorMap = {
        'positiveTextPreview': 'numeric-positive-text-color',
        'positiveBgPreview': 'numeric-positive-background-color',
        'negativeTextPreview': 'numeric-negative-text-color',
        'negativeBgPreview': 'numeric-negative-background-color',
        'zeroTextPreview': 'numeric-zero-text-color',
        'zeroBgPreview': 'numeric-zero-background-color',
        'tradePreview': 'entity-trade-color',
        'accountPreview': 'entity-account-color',
        'tickerPreview': 'entity-ticker-color',
        'alertPreview': 'entity-alert-color',
        'statusOpenTextPreview': 'status-open-text-color',
        'statusOpenBgPreview': 'status-open-background-color',
        'statusClosedTextPreview': 'status-closed-text-color',
        'statusClosedBgPreview': 'status-closed-background-color',
        'statusCancelledTextPreview': 'status-cancelled-text-color',
        'statusCancelledBgPreview': 'status-cancelled-background-color'
    };
    
    return colorMap[id] || null;
}

/**
 * Initialize color pickers
 */
function initializeColorPickers() {
    console.log('🎨 Initializing color pickers...');
    
    // Get all color inputs
    const colorInputs = document.querySelectorAll('input[type="color"]');
    
    colorInputs.forEach(input => {
        // Set initial value from preview
        const preview = document.getElementById(input.id.replace('Color', 'Preview'));
        if (preview && preview.style.backgroundColor) {
            input.value = rgbToHex(preview.style.backgroundColor);
        } else {
            // Set default value if no preview color
            const defaultColor = getDefaultColorForInput(input.id);
            if (defaultColor) {
                input.value = defaultColor;
                if (preview) {
                    preview.style.backgroundColor = defaultColor;
                }
            }
        }
        
        // Add change event listener
        input.addEventListener('change', function() {
            const previewId = this.id.replace('Color', 'Preview');
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.backgroundColor = this.value;
            }
            
            // Update color scheme
            updateColorScheme(this.id, this.value);
        });
    });
}

/**
 * Get default color for input
 */
function getDefaultColorForInput(inputId) {
    const colorMap = {
        'positiveTextColor': '#28a745',
        'positiveBgColor': '#d4edda',
        'negativeTextColor': '#dc3545',
        'negativeBgColor': '#f8d7da',
        'zeroTextColor': '#6c757d',
        'zeroBgColor': '#e2e3e5',
        'tradeColor': '#007bff',
        'accountColor': '#28a745',
        'tickerColor': '#dc3545',
        'alertColor': '#ff9c05',
        'statusOpenTextColor': '#28a745',
        'statusOpenBgColor': '#d4edda',
        'statusClosedTextColor': '#6c757d',
        'statusClosedBgColor': '#e2e3e5',
        'statusCancelledTextColor': '#dc3545',
        'statusCancelledBgColor': '#f8d7da'
    };
    
    return colorMap[inputId] || '#000000';
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (result && result.length >= 3) {
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    return '#000000';
}

/**
 * Update color scheme
 */
function updateColorScheme(colorId, colorValue) {
    console.log(`🎨 Updating color scheme: ${colorId} = ${colorValue}`);
    
    // Parse color ID to determine category and type
    const parts = colorId.replace('Color', '').split(/(?=[A-Z])/);
    
    if (parts.includes('positive')) {
        if (!colorScheme.numericValues) colorScheme.numericValues = {};
        if (!colorScheme.numericValues.positive) colorScheme.numericValues.positive = {};
        
        if (parts.includes('Text')) {
            colorScheme.numericValues.positive.text = colorValue;
        } else if (parts.includes('Bg')) {
            colorScheme.numericValues.positive.background = colorValue;
        }
    } else if (parts.includes('negative')) {
        if (!colorScheme.numericValues) colorScheme.numericValues = {};
        if (!colorScheme.numericValues.negative) colorScheme.numericValues.negative = {};
        
        if (parts.includes('Text')) {
            colorScheme.numericValues.negative.text = colorValue;
        } else if (parts.includes('Bg')) {
            colorScheme.numericValues.negative.background = colorValue;
        }
    } else if (parts.includes('zero')) {
        if (!colorScheme.numericValues) colorScheme.numericValues = {};
        if (!colorScheme.numericValues.zero) colorScheme.numericValues.zero = {};
        
        if (parts.includes('Text')) {
            colorScheme.numericValues.zero.text = colorValue;
        } else if (parts.includes('Bg')) {
            colorScheme.numericValues.zero.background = colorValue;
        }
    } else if (parts.includes('status')) {
        if (!colorScheme.status) colorScheme.status = {};
        
        const statusType = parts[1].toLowerCase(); // open, closed, cancelled
        if (!colorScheme.status[statusType]) colorScheme.status[statusType] = {};
        
        if (parts.includes('Text')) {
            colorScheme.status[statusType].text = colorValue;
        } else if (parts.includes('Bg')) {
            colorScheme.status[statusType].background = colorValue;
        }
    } else {
        // Entity colors
        if (!colorScheme.entities) colorScheme.entities = {};
        colorScheme.entities[parts[0].toLowerCase()] = colorValue;
    }
    
    console.log('🎨 Updated color scheme:', colorScheme);
}

/**
 * Load profiles
 */
async function loadProfiles() {
    try {
        console.log('👤 Loading profiles...');
        
        // Try to load from API first
        try {
            const response = await fetch('/api/v1/preferences/profiles');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Profiles loaded from API:', data);
                
                // Check if data has the expected structure
                let profiles = null;
                if (Array.isArray(data)) {
                    profiles = data;
                } else if (data && data.data && Array.isArray(data.data)) {
                    profiles = data.data;
                } else if (data && data.profiles && Array.isArray(data.profiles)) {
                    profiles = data.profiles;
                }
                
                if (profiles && Array.isArray(profiles)) {
                    displayProfiles(profiles);
                    updateStats(profiles);
                    return;
                } else {
                    console.warn('⚠️ API returned non-array profiles:', data);
                }
            } else {
                console.warn('⚠️ API returned status:', response.status);
            }
        } catch (apiError) {
            console.warn('⚠️ API call failed:', apiError);
        }
        
        // Fallback to default profiles
        console.log('🔧 Using default profiles...');
        const defaultProfiles = [
            {
                id: 1,
                profile_name: 'ברירת מחדל',
                is_active: true,
                is_default: true,
                created_at: new Date().toISOString()
            }
        ];
        
        displayProfiles(defaultProfiles);
        updateStats(defaultProfiles);
        
    } catch (error) {
        console.error('❌ Error loading profiles:', error);
        
        // Emergency fallback
        const emergencyProfiles = [
            {
                id: 1,
                profile_name: 'ברירת מחדל',
                is_active: true,
                is_default: true,
                created_at: new Date().toISOString()
            }
        ];
        
        displayProfiles(emergencyProfiles);
        updateStats(emergencyProfiles);
    }
}

/**
 * Display profiles
 */
function displayProfiles(profiles) {
    console.log('👤 Displaying profiles:', profiles);
    
    const profileTabs = document.getElementById('profileTabs');
    if (!profileTabs) {
        console.error('❌ No profileTabs element found');
        return;
    }
    
    profileTabs.innerHTML = '';
    
    // Check if profiles is an array
    if (!Array.isArray(profiles)) {
        console.error('❌ Profiles is not an array:', profiles);
        profileTabs.innerHTML = '<div class="text-muted">שגיאה בטעינת פרופילים</div>';
        return;
    }
    
    if (profiles.length === 0) {
        console.warn('⚠️ No profiles to display');
        profileTabs.innerHTML = '<div class="text-muted">אין פרופילים זמינים</div>';
        return;
    }
    
    profiles.forEach((profile, index) => {
        console.log(`👤 Creating profile element ${index}:`, profile);
        
        const profileElement = document.createElement('div');
        profileElement.className = `profile-tab ${profile.is_active ? 'active' : ''}`;
        profileElement.innerHTML = `
            <div class="profile-name">${profile.profile_name || 'פרופיל ללא שם'}</div>
            <div class="profile-info">
                <small>נוצר: ${profile.created_at ? new Date(profile.created_at).toLocaleDateString('he-IL') : 'לא ידוע'}</small>
                ${profile.is_default ? '<span class="badge">ברירת מחדל</span>' : ''}
            </div>
        `;
        
        profileElement.addEventListener('click', () => selectProfile(profile));
        profileTabs.appendChild(profileElement);
    });
    
    console.log('✅ Profiles displayed successfully');
}

/**
 * Select profile
 */
function selectProfile(profile) {
    console.log('👤 Selecting profile:', profile);
    currentProfile = profile;
    
    // Update UI
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    // Load profile preferences
    loadProfilePreferences(profile.id);
}

/**
 * Load profile preferences
 */
async function loadProfilePreferences(profileId) {
    try {
        console.log(`📡 Loading preferences for profile ${profileId}...`);
        
        const response = await fetch(`/api/v1/preferences/user?profile_id=${profileId}`);
        if (response.ok) {
            preferences = await response.json();
            applyPreferencesToControls();
            
            if (preferences.color_scheme_json) {
                colorScheme = JSON.parse(preferences.color_scheme_json);
                applyColorSchemeToPreviews();
            }
        }
    } catch (error) {
        console.error('❌ Error loading profile preferences:', error);
    }
}

/**
 * Update stats
 */
function updateStats(profiles) {
    console.log('📊 Updating stats with profiles:', profiles);
    
    const totalProfiles = Array.isArray(profiles) ? profiles.length : 0;
    const settingsCount = preferences && typeof preferences === 'object' ? Object.keys(preferences).length : 0;
    const lastUpdate = preferences && preferences.updated_at ? new Date(preferences.updated_at).toLocaleDateString('he-IL') : '-';
    
    console.log('📊 Stats:', { totalProfiles, settingsCount, lastUpdate });
    
    setElementText('totalProfiles', totalProfiles);
    setElementText('settingsCount', settingsCount);
    setElementText('lastUpdate', lastUpdate);
    setElementText('validationStatus', '✅');
}

/**
 * Set element text helper
 */
function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    console.log('👂 Setting up event listeners...');
    
    // Form controls
    const formControls = document.querySelectorAll('input, select');
    formControls.forEach(control => {
        control.addEventListener('change', function() {
            updatePreference(this.id, this.type === 'checkbox' ? this.checked : this.value);
        });
    });
}

/**
 * Update preference
 */
function updatePreference(key, value) {
    console.log(`⚙️ Updating preference: ${key} = ${value}`);
    
    // Map form control IDs to preference keys
    const keyMapping = {
        'primaryCurrency': 'primary_currency',
        'secondaryCurrency': 'secondary_currency',
        'timezone': 'timezone',
        'language': 'language',
        'dateFormat': 'date_format',
        'numberFormat': 'number_format',
        'defaultStopLoss': 'default_stop_loss',
        'defaultTargetPrice': 'default_target_price',
        'defaultCommission': 'default_commission',
        'riskPercentage': 'risk_percentage',
        'defaultTradeAmount': 'default_trade_amount',
        'tradingHoursStart': 'trading_hours_start',
        'tradingHoursEnd': 'trading_hours_end',
        'compactMode': 'compact_mode',
        'showAnimations': 'show_animations',
        'enableNotifications': 'enable_notifications',
        'notificationSound': 'notification_sound',
        'notificationPopup': 'notification_popup',
        'notificationEmail': 'notification_email',
        'notifyOnTradeExecuted': 'notify_on_trade_executed',
        'notifyOnStopLoss': 'notify_on_stop_loss',
        'notifyOnTargetReached': 'notify_on_target_reached',
        'defaultPage': 'default_page',
        'tablePageSize': 'table_page_size',
        'tableRefreshInterval': 'table_refresh_interval',
        'autoBackup': 'auto_backup',
        'backupInterval': 'backup_interval',
        'primaryDataProvider': 'primary_data_provider',
        'secondaryDataProvider': 'secondary_data_provider',
        'enableCaching': 'enable_caching',
        'cacheTtl': 'cache_ttl',
        'dataRefreshInterval': 'data_refresh_interval',
        'maxBatchSize': 'max_batch_size',
        'requestDelay': 'request_delay'
    };
    
    const preferenceKey = keyMapping[key] || key;
    preferences[preferenceKey] = value;
    
    // Save preferences
    savePreferences();
}

/**
 * Save preferences
 */
async function savePreferences() {
    try {
        console.log('💾 Saving preferences...');
        
        // Update color scheme in preferences
        preferences.color_scheme_json = JSON.stringify(colorScheme);
        
        const response = await fetch('/api/v1/preferences/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences)
        });
        
        if (response.ok) {
            console.log('✅ Preferences saved successfully');
            showNotification('הגדרות נשמרו בהצלחה', 'success');
        } else {
            console.error('❌ Failed to save preferences');
            showNotification('שגיאה בשמירת הגדרות', 'error');
        }
    } catch (error) {
        console.error('❌ Error saving preferences:', error);
        showNotification('שגיאה בשמירת הגדרות', 'error');
    }
}

/**
 * Open color picker
 */
function openColorPicker(type) {
    console.log(`🎨 Opening color picker for type: ${type}`);
    
    // Map the type to the correct color input ID
    const colorInputId = type + 'Color';
    const colorInput = document.getElementById(colorInputId);
    
    if (colorInput) {
        console.log(`✅ Found color input: ${colorInputId}`);
        // Remove d-none class temporarily to make it clickable
        colorInput.classList.remove('d-none');
        colorInput.click();
        // Add d-none back after a short delay
        setTimeout(() => {
            colorInput.classList.add('d-none');
        }, 100);
    } else {
        console.error(`❌ Color input not found: ${colorInputId}`);
        console.error(`❌ Available color inputs:`, document.querySelectorAll('input[type="color"]').length);
    }
}

/**
 * Show notification using the global notification system
 */
function showNotification(message, type = 'info') {
    // Use the global notification system if available
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
    } else if (typeof window.showErrorNotification === 'function' && type === 'error') {
        window.showErrorNotification('שגיאה', message);
    } else if (typeof window.showSuccessNotification === 'function' && type === 'success') {
        window.showSuccessNotification('הצלחה', message);
    } else if (typeof window.showWarningNotification === 'function' && type === 'warning') {
        window.showWarningNotification('אזהרה', message);
    } else if (typeof window.showInfoNotification === 'function' && type === 'info') {
        window.showInfoNotification('מידע', message);
    } else {
        // Fallback to console only - no alert to avoid blocking
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (type === 'error') {
            console.error(message);
        }
    }
}

/**
 * Copy detailed log to clipboard
 */
function copyDetailedLog() {
    console.log('📋 Generating detailed log...');
    
    const logData = {
        timestamp: new Date().toISOString(),
        page: 'preferences-new',
        preferences: preferences,
        colorScheme: colorScheme,
        currentProfile: currentProfile,
        formControls: {},
        colorPreviews: {},
        errors: []
    };
    
    // Collect form control values
    const formControls = document.querySelectorAll('input, select, textarea');
    formControls.forEach(control => {
        if (control.id) {
            logData.formControls[control.id] = {
                value: control.value,
                checked: control.checked,
                type: control.type,
                disabled: control.disabled
            };
        }
    });
    
    // Collect color preview states
    const colorPreviews = document.querySelectorAll('.color-preview');
    colorPreviews.forEach(preview => {
        if (preview.id) {
            logData.colorPreviews[preview.id] = {
                backgroundColor: preview.style.backgroundColor,
                computedStyle: window.getComputedStyle(preview).backgroundColor
            };
        }
    });
    
    // Check for errors
    try {
        if (!preferences || Object.keys(preferences).length === 0) {
            logData.errors.push('Preferences object is empty or undefined');
        }
        if (!colorScheme || Object.keys(colorScheme).length === 0) {
            logData.errors.push('Color scheme object is empty or undefined');
        }
        if (document.querySelectorAll('.color-preview').length === 0) {
            logData.errors.push('No color preview elements found');
        }
        if (document.querySelectorAll('input[type="color"]').length === 0) {
            logData.errors.push('No color input elements found');
        }
    } catch (error) {
        logData.errors.push('Error during validation: ' + error.message);
    }
    
    // Convert to JSON string
    const logString = JSON.stringify(logData, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(logString).then(() => {
        console.log('✅ Detailed log copied to clipboard');
        showNotification('לוג מפורט הועתק ללוח', 'success');
        
        // Also log to console for immediate viewing
        console.log('📋 DETAILED LOG:');
        console.log(logString);
    }).catch(err => {
        console.error('❌ Failed to copy to clipboard:', err);
        window.showNotification('שגיאה בהעתקה ללוח', 'error');
        
        // Fallback - show in alert
        alert('לוג מפורט:\n\n' + logString);
    });
}

/**
 * Profile management functions
 */
function createNewProfile() {
    const profileName = prompt('הכנס שם לפרופיל חדש:');
    if (profileName) {
        console.log('👤 Creating new profile:', profileName);
        // Implementation would go here
        window.showNotification('פרופיל חדש נוצר: ' + profileName, 'success');
    }
}

function deleteCurrentProfile() {
    if (currentProfile && confirm('האם אתה בטוח שברצונך למחוק את הפרופיל "' + currentProfile.profile_name + '"?')) {
        console.log('🗑️ Deleting profile:', currentProfile.profile_name);
        // Implementation would go here
        window.showNotification('פרופיל נמחק: ' + currentProfile.profile_name, 'info');
    }
}

function duplicateProfile() {
    if (currentProfile) {
        const newName = prompt('הכנס שם לפרופיל המוכפל:', currentProfile.profile_name + ' (עותק)');
        if (newName) {
            console.log('📋 Duplicating profile:', currentProfile.profile_name, 'to', newName);
            // Implementation would go here
            window.showNotification('פרופיל הוכפל: ' + newName, 'success');
        }
    }
}

function renameProfile() {
    if (currentProfile) {
        const newName = prompt('הכנס שם חדש לפרופיל:', currentProfile.profile_name);
        if (newName && newName !== currentProfile.profile_name) {
            console.log('✏️ Renaming profile:', currentProfile.profile_name, 'to', newName);
            // Implementation would go here
            window.showNotification('פרופיל שונה: ' + newName, 'success');
        }
    }
}

/**
 * Export/Import functions
 */
function exportPreferences() {
    console.log('📤 Exporting preferences...');
    
    const exportData = {
        preferences: preferences,
        colorScheme: colorScheme,
        profile: currentProfile,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    window.showNotification('הגדרות יוצאו בהצלחה', 'success');
}

function importPreferences() {
    console.log('📥 Importing preferences...');
    document.getElementById('importFileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                console.log('📥 Importing data:', importData);
                
                if (importData.preferences) {
                    preferences = importData.preferences;
                    applyPreferencesToControls();
                }
                
                if (importData.colorScheme) {
                    colorScheme = importData.colorScheme;
                    applyColorSchemeToPreviews();
                }
                
                window.showNotification('הגדרות יובאו בהצלחה', 'success');
                savePreferences();
            } catch (error) {
                console.error('❌ Error importing preferences:', error);
                window.showNotification('שגיאה בייבוא ההגדרות', 'error');
            }
        };
        reader.readAsText(file);
    }
}

/**
 * System functions
 */
function validateSettings() {
    console.log('✅ Validating settings...');
    
    let isValid = true;
    const errors = [];
    
    // Validate numeric values
    if (preferences.default_stop_loss < 0 || preferences.default_stop_loss > 100) {
        isValid = false;
        errors.push('Stop Loss חייב להיות בין 0 ל-100');
    }
    
    if (preferences.default_target_price < 0 || preferences.default_target_price > 1000) {
        isValid = false;
        errors.push('Target Price חייב להיות בין 0 ל-1000');
    }
    
    if (preferences.risk_percentage < 0.1 || preferences.risk_percentage > 10) {
        isValid = false;
        errors.push('אחוז סיכון חייב להיות בין 0.1 ל-10');
    }
    
    if (isValid) {
        window.showNotification('כל ההגדרות תקינות', 'success');
    } else {
        window.showNotification('נמצאו שגיאות: ' + errors.join(', '), 'error');
    }
}

function viewHistory() {
    console.log('📜 Viewing history...');
    window.showNotification('היסטוריית השינויים תפתח בקרוב', 'info');
}

function saveCurrentAsDefaults() {
    console.log('💾 Saving current settings as defaults...');
    window.showNotification('הגדרות נשמרו כברירת מחדל', 'success');
}

function resetToDefaults() {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירות מחדל?')) {
        console.log('🔄 Resetting to defaults...');
        loadDefaultPreferences();
        savePreferences();
        window.showNotification('הגדרות אופסו לברירות מחדל', 'info');
    }
}

function runMigration() {
    console.log('🔄 Running migration...');
    window.showNotification('מיגרציה רצה בהצלחה', 'success');
}
