/**
 * Preferences Page - JavaScript Functions
 * =====================================
 * 
 * פונקציות JavaScript ספציפיות לעמוד העדפות
 * 
 * @version 1.0.0
 * @lastUpdated January 7, 2025
 * @author TikTrack Development Team
 */

// Currency validation function
window.validateCurrency = function(select) {
  if (select.value !== 'USD') {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('אזהרה', 'כרגע נתמך רק דולר ארה"ב');
    } else {
      alert('כרגע נתמך רק דולר ארה"ב');
    }
    select.value = 'USD';
  }
  // Auto-save after validation
  window.autoSavePreference('primaryCurrency', select.value);
};

// Simple auto-save function - saves one preference at a time
window.autoSavePreference = async function(key, value) {
  try {
    console.log(`Auto-saving ${key}:`, value);
    
    // Save to localStorage immediately
    const currentPrefs = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
    currentPrefs[key] = value;
    localStorage.setItem('tikTrack_preferences', JSON.stringify(currentPrefs));
    
    // Show success notification
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('נשמר', `${key} נשמר בהצלחה`);
    }
    
    // Try to save to server (optional)
    try {
      const response = await fetch('/api/v1/preferences/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value })
      });
      
      if (response.ok) {
        console.log(`✅ ${key} saved to server`);
      } else {
        console.log(`⚠️ ${key} saved locally only`);
      }
    } catch (apiError) {
      console.log(`⚠️ ${key} saved locally only (server error)`);
    }
    
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה בשמירת ${key}`);
    }
  }
};

// Load preferences from localStorage
window.loadPreferences = function() {
  try {
    const saved = localStorage.getItem('tikTrack_preferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      console.log('Loading preferences:', preferences);
      
      // Load all form fields
      Object.keys(preferences).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = preferences[key];
          } else {
            element.value = preferences[key];
          }
        }
      });
      
      console.log('✅ Preferences loaded successfully');
      if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('נטען', 'הגדרות נטענו מהזיכרון המקומי');
      }
      return true;
    }
  } catch (error) {
    console.error('❌ Error loading preferences:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת ההגדרות');
    }
  }
  return false;
};

// Set default values
window.setDefaults = function() {
  const defaults = {
    primaryCurrency: 'USD',
    timezone: 'Asia/Jerusalem',
    defaultStopLoss: '5.0',
    defaultTargetPrice: '10.0',
    defaultCommission: '1.0',
    defaultStatusFilter: 'open',
    defaultTypeFilter: 'swing',
    defaultDateRangeFilter: 'this_week',
    serverUrl: 'http://localhost:8080',
    serverPort: '8080',
    refreshInterval: '5',
    cacheTTL: '10',
    maxMemorySize: '512',
    consoleCleanupInterval: '30',
    logLevel: 'debug',
    maxLogFileSize: '10',
    manualConsoleCleanup: false
  };
  
  Object.keys(defaults).forEach(key => {
    const element = document.getElementById(key);
    if (element && !element.value) {
      if (element.type === 'checkbox') {
        element.checked = defaults[key];
      } else {
        element.value = defaults[key];
      }
    }
  });
};

// Setup auto-save for all form elements
window.setupAutoSave = function() {
  // Get all form elements
  const formElements = document.querySelectorAll('input, select, textarea');
  
  formElements.forEach(element => {
    // Skip color inputs (they have their own handler)
    if (element.type === 'color') return;
    
    // Add event listeners
    element.addEventListener('change', function() {
      const key = this.id;
      const value = this.type === 'checkbox' ? this.checked : this.value;
      window.autoSavePreference(key, value);
    });
    
    element.addEventListener('blur', function() {
      const key = this.id;
      const value = this.type === 'checkbox' ? this.checked : this.value;
      window.autoSavePreference(key, value);
    });
  });
  
  // Special handler for color inputs
  const colorInputs = document.querySelectorAll('input[type="color"]');
  colorInputs.forEach(input => {
    input.addEventListener('change', function() {
      window.autoSavePreference(this.id, this.value);
    });
  });
};

// ===== Color Picker Function =====
window.openColorPicker = function(colorId) {
  const colorInput = document.getElementById(colorId);
  if (colorInput) {
    colorInput.click();
  } else {
    console.error(`Color input with id '${colorId}' not found`);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `לא נמצא שדה צבע עם מזהה: ${colorId}`);
    }
  }
};

// Initialize preferences page
window.initializePreferencesPage = function() {
  console.log('🚀 Initializing preferences page');
  
  // Load saved preferences or set defaults
  const loaded = window.loadPreferences();
  if (!loaded) {
    console.log('📝 Setting default values');
    window.setDefaults();
  }
  
  // Setup auto-save
  window.setupAutoSave();
  
  console.log('✅ Preferences page initialized');
};
