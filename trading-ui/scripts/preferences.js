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
    
    // לא מציגים הודעה על כל שמירה - זה מטריד את המשתמש
    // רק בלוג לקונסול
    console.log(`✅ ${key} saved to localStorage`);
    
    // Mark as unsaved (needs database save)
    window.markAsUnsaved();
    
    // Don't save to server on every change - only on manual save
    // This prevents rate limiting issues
      
    } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה בשמירת ${key}`);
    }
  }
};

// Load preferences from server and localStorage
window.loadPreferences = async function() {
  try {
    console.log('📂 Loading preferences from server...');
    
    // First try to load from server
    const response = await fetch('/api/v1/preferences/user');
    if (response.ok) {
      const result = await response.json();
      const serverPrefs = result.data?.preferences || {};
      
      console.log('✅ Loaded preferences from server:', serverPrefs);
      
      // Merge server preferences with localStorage (localStorage takes priority)
      const localPrefs = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
      const mergedPrefs = { ...serverPrefs, ...localPrefs };
      
      // Save merged preferences to localStorage
      localStorage.setItem('tikTrack_preferences', JSON.stringify(mergedPrefs));
      
      // Apply preferences to form elements
      Object.keys(mergedPrefs).forEach(key => {
        const element = document.getElementById(key);
      if (element) {
          if (element.type === 'checkbox') {
            element.checked = mergedPrefs[key];
          } else {
            element.value = mergedPrefs[key];
        }
      }
    });
    
      console.log('✅ Preferences loaded and merged successfully');
      return true;
    } else {
      console.log('⚠️ Server preferences not available, loading from localStorage...');
      return window.loadPreferencesFromLocalStorage();
    }
    } catch (error) {
    console.error('❌ Error loading preferences from server:', error);
    console.log('📂 Falling back to localStorage...');
    return window.loadPreferencesFromLocalStorage();
  }
};

// Load preferences from localStorage only
window.loadPreferencesFromLocalStorage = function() {
  try {
    const saved = localStorage.getItem('tikTrack_preferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      console.log('Loading preferences from localStorage:', preferences);
      
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
      
      console.log('✅ Preferences loaded from localStorage successfully');
      return true;
    }
    } catch (error) {
    console.error('❌ Error loading preferences from localStorage:', error);
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

// Save all preferences to database
window.saveAllPreferences = async function() {
  try {
    console.log('💾 Saving all preferences to database...');
    
    // Get all current preferences from localStorage
    const currentPrefs = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
    
    if (Object.keys(currentPrefs).length === 0) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'אין הגדרות לשמירה');
      }
      return;
    }
    
    // Save to server
    const response = await fetch('/api/v1/preferences/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentPrefs)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ All preferences saved to database:', result);
      
      // Mark as saved
      window.markAsSaved();
      
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נשמר', 'כל ההגדרות נשמרו בהצלחה לבסיס הנתונים');
      }
    } else {
      console.error('❌ Failed to save preferences to database:', response.status);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'שגיאה בשמירת ההגדרות לבסיס הנתונים');
      }
    }
  } catch (error) {
    console.error('❌ Error saving all preferences:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת ההגדרות');
    }
  }
};

// Reset to defaults
window.resetToDefaults = function() {
  if (confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירות המחדל?')) {
    console.log('🔄 Resetting to defaults...');
    
    // Clear localStorage
    localStorage.removeItem('tikTrack_preferences');
    
    // Set defaults
    window.setDefaults();
    
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('אופס', 'ההגדרות אופסו לברירות המחדל');
    }
  }
};

// Export preferences
window.exportPreferences = function() {
  try {
    const currentPrefs = JSON.parse(localStorage.getItem('tikTrack_preferences') || '{}');
    
    if (Object.keys(currentPrefs).length === 0) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'אין הגדרות לייצוא');
      }
      return;
    }
    
    // Create download
    const dataStr = JSON.stringify(currentPrefs, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tiktrack-preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('ייצא', 'ההגדרות יוצאו בהצלחה');
    }
  } catch (error) {
    console.error('❌ Error exporting preferences:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בייצוא ההגדרות');
    }
  }
};

// Track unsaved changes
let hasUnsavedChanges = false;

// Add beforeunload event listener
window.addEventListener('beforeunload', function(e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = 'יש לך שינויים לא נשמרים. האם אתה בטוח שברצונך לעזוב?';
    return e.returnValue;
  }
});

// Mark as unsaved when changes are made
window.markAsUnsaved = function() {
  hasUnsavedChanges = true;
  // Update save button appearance
  const saveButtons = document.querySelectorAll('#saveAllBtn, #saveAllBtnBottom');
  saveButtons.forEach(btn => {
    btn.classList.add('btn-warning');
    btn.classList.remove('btn-success');
    btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> שמור שינויים';
  });
};

// Mark as saved when saved
window.markAsSaved = function() {
  hasUnsavedChanges = false;
  // Update save button appearance
  const saveButtons = document.querySelectorAll('#saveAllBtn, #saveAllBtnBottom');
  saveButtons.forEach(btn => {
    btn.classList.add('btn-success');
    btn.classList.remove('btn-warning');
    btn.innerHTML = '<i class="bi bi-save"></i> שמור הכל';
  });
};

// Load open accounts from database
window.loadOpenAccounts = async function() {
  try {
    console.log('🏦 Loading open accounts from database...');
    
    const response = await fetch('/api/v1/accounts/open');
    if (response.ok) {
      const result = await response.json();
      const accounts = result.data || [];
      
      console.log(`✅ Loaded ${accounts.length} open accounts:`, accounts);
      
      // Update the accounts dropdown
      const accountSelect = document.getElementById('defaultAccountFilter');
      if (accountSelect) {
        // Clear existing options except the first one
        accountSelect.innerHTML = '<option value="">כל החשבונות</option>';
        
        // Add open accounts
        accounts.forEach(account => {
          const option = document.createElement('option');
          option.value = account.id;
          option.textContent = account.name;
          accountSelect.appendChild(option);
        });
        
        console.log(`✅ Updated accounts dropdown with ${accounts.length} accounts`);
      }
      
      return accounts;
    } else {
      console.error('❌ Failed to load open accounts:', response.status);
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading open accounts:', error);
    return [];
  }
};

        // Initialize preferences page
        window.initializePreferencesPage = async function() {
          console.log('🚀 Initializing preferences page');
          
          // Load saved preferences or set defaults
          const loaded = await window.loadPreferences();
          if (!loaded) {
            console.log('📝 Setting default values');
            window.setDefaults();
          }
          
          // Setup auto-save
          window.setupAutoSave();
          
          // Load open accounts
          window.loadOpenAccounts();
          
          // Setup color picker event handlers
          window.setupColorPickers();
          
          // Mark as saved initially
          window.markAsSaved();
          
          console.log('✅ Preferences page initialized');
        };

        // Setup color picker event handlers - Chrome-style color picker for all browsers
        window.setupColorPickers = function() {
          console.log('🎨 Setting up Chrome-style color pickers for all browsers');
          
          const colorPickers = document.querySelectorAll('input[type="color"]');
          
          colorPickers.forEach(picker => {
            // Force Chrome-style color picker appearance
            picker.style.webkitAppearance = 'none';
            picker.style.mozAppearance = 'none';
            picker.style.appearance = 'none';
            picker.style.background = 'none';
            picker.style.border = '2px solid white';
            picker.style.borderRadius = '6px';
            picker.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            picker.style.width = '50px';
            picker.style.height = '40px';
            picker.style.padding = '0';
            picker.style.cursor = 'pointer';
            
            // Add hover effect
            picker.addEventListener('mouseenter', function() {
              this.style.borderColor = '#007bff';
              this.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.2)';
            });
            
            picker.addEventListener('mouseleave', function() {
              this.style.borderColor = 'white';
              this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            });
            
            // Add change event listener
            picker.addEventListener('change', function(e) {
              const colorKey = e.target.dataset.colorKey;
              const colorValue = e.target.value;
              
              if (colorKey) {
                // Update CSS variable immediately
                document.documentElement.style.setProperty(`--user-${colorKey}`, colorValue);
                
                // Auto-save the preference
                window.autoSavePreference(colorKey, colorValue);
                
                console.log(`🎨 Color updated: ${colorKey} = ${colorValue}`);
              }
            });
          });
          
          console.log(`✅ Setup ${colorPickers.length} Chrome-style color pickers`);
        };

// Export functions to global scope
window.validateCurrency = validateCurrency;
window.autoSavePreference = autoSavePreference;
window.loadPreferences = loadPreferences;
window.loadPreferencesFromLocalStorage = loadPreferencesFromLocalStorage;
window.setDefaults = setDefaults;
window.setupAutoSave = setupAutoSave;
window.initializePreferencesPage = initializePreferencesPage;
window.saveAllPreferences = saveAllPreferences;
window.resetToDefaults = resetToDefaults;
window.exportPreferences = exportPreferences;
window.loadOpenAccounts = loadOpenAccounts;
window.setupColorPickers = setupColorPickers;
