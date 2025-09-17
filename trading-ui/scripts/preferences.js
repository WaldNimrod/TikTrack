/**
 * Preferences Page - JavaScript Functions
 * =====================================
 * 
 * מערכת העדפות פשוטה ונקייה
 * 
 * @version 2.0.0
 * @lastUpdated January 7, 2025
 * @author TikTrack Development Team
 */

// Global variables
let hasUnsavedChanges = false;

// ===== CORE FUNCTIONS =====

// Load preferences from server
window.loadPreferences = async function() {
  try {
    console.log('📂 Loading preferences from server...');
    
    const response = await fetch('/api/v1/preferences/user');
    if (response.ok) {
      const result = await response.json();
      const preferences = result.data?.preferences || {};
      
      console.log('✅ Loaded preferences from server:', preferences);
      
      // Apply preferences to form
      applyPreferencesToForm(preferences);
      
      // Mark as saved (no changes yet)
      markAsSaved();
      
        return true;
      } else {
      console.log('⚠️ Server not available, using defaults');
      setDefaults();
      return false;
      }
    } catch (error) {
    console.error('❌ Error loading preferences:', error);
    setDefaults();
    return false;
  }
};

// Apply preferences to form elements
function applyPreferencesToForm(preferences) {
  console.log('🔧 Applying preferences to form:', preferences);
  
  // Apply general settings
  if (preferences.general) {
    Object.keys(preferences.general).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        const value = preferences.general[key];
        if (value !== undefined && value !== null) {
          if (element.type === 'checkbox') {
            element.checked = value;
      } else {
            element.value = value;
          }
          console.log(`✅ Applied general.${key} = ${value}`);
        }
      }
    });
  }
  
  // Apply colors
  if (preferences.colors) {
    Object.keys(preferences.colors).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        const value = preferences.colors[key];
        if (value !== undefined && value !== null) {
            element.value = value;
          console.log(`✅ Applied colors.${key} = ${value}`);
        }
      }
    });
  }
}

// Set default values
function setDefaults() {
  console.log('📝 Setting default values...');
  
  const defaults = {
    general: {
      primaryCurrency: 'USD',
      timezone: 'Asia/Jerusalem',
      defaultStopLoss: 5.0,
      defaultTargetPrice: 10.0,
      defaultCommission: 1.0,
      riskPercentage: 2.0
    },
    colors: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      successColor: '#28a745',
      warningColor: '#ffc107',
      dangerColor: '#dc3545',
      infoColor: '#007bff',
      entityTickerColor: '#dc3545',
      entityTickerColorLight: '#f8d7da',
      entityTickerColorDark: '#721c24',
      entityTradeColor: '#007bff',
      entityTradeColorLight: '#e3f2fd',
      entityTradeColorDark: '#0056b3',
      entityAccountColor: '#28a745',
      entityAccountColorLight: '#d4edda',
      entityAccountColorDark: '#155724',
      entityAlertColor: '#ff9c05',
      entityAlertColorLight: '#fff3cd',
      entityAlertColorDark: '#856404',
      entityCashFlowColor: '#20c997',
      entityCashFlowColorLight: '#d1ecf1',
      entityCashFlowColorDark: '#0c5460',
      entityNoteColor: '#6f42c1',
      entityNoteColorLight: '#e2e3f1',
      entityNoteColorDark: '#383d41',
      entityTradePlanColor: '#17a2b8',
      entityTradePlanColorLight: '#d1ecf1',
      entityTradePlanColorDark: '#0c5460',
      entityExecutionColor: '#fd7e14',
      entityExecutionColorLight: '#ffeaa7',
      entityExecutionColorDark: '#e17055',
      statusOpenColor: '#28a745',
      statusOpenColorLight: '#d4edda',
      statusOpenColorDark: '#155724',
      statusClosedColor: '#6c757d',
      statusClosedColorLight: '#f8f9fa',
      statusClosedColorDark: '#495057',
      statusCancelledColor: '#dc3545',
      statusCancelledColorLight: '#f8d7da',
      statusCancelledColorDark: '#721c24',
      typeSwingColor: '#007bff',
      typeSwingColorLight: '#e3f2fd',
      typeSwingColorDark: '#0056b3',
      typeInvestmentColor: '#28a745',
      typeInvestmentColorLight: '#d4edda',
      typeInvestmentColorDark: '#155724',
      typePassiveColor: '#6f42c1',
      typePassiveColorLight: '#e2e3f1',
      typePassiveColorDark: '#383d41',
      valuePositiveColor: '#28a745',
      valuePositiveColorLight: '#d4edda',
      valuePositiveColorDark: '#155724',
      valueNegativeColor: '#dc3545',
      valueNegativeColorLight: '#f8d7da',
      valueNegativeColorDark: '#721c24',
      valueNeutralColor: '#6c757d',
      valueNeutralColorLight: '#f8f9fa',
      valueNeutralColorDark: '#495057'
    }
  };
  
  applyPreferencesToForm(defaults);
}

// Save all preferences to database
window.saveAllPreferences = async function() {
  try {
    console.log('💾 Saving all preferences to database...');
    
    // Collect all form data
    const preferences = {
      general: {},
      colors: {}
    };
    
    // Get all form elements
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
      const key = element.id;
      if (key) {
        let value = element.type === 'checkbox' ? element.checked : element.value;
        
        // Convert to appropriate type
        if (element.type === 'number') {
          value = parseFloat(value) || 0;
        }
        
        // Categorize by key
        if (['defaultStopLoss', 'defaultTargetPrice', 'defaultCommission', 'primaryCurrency', 'timezone', 'riskPercentage'].includes(key)) {
          preferences.general[key] = value;
        } else if (key.includes('Color')) {
          preferences.colors[key] = value;
        } else {
          preferences.general[key] = value;
        }
      }
    });
    
    console.log('📤 Sending preferences to server:', preferences);
    
    // Save to server
      const response = await fetch('/api/v1/preferences/user', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ All preferences saved to database:', result);
      
      // Mark as saved
      markAsSaved();
      
      // Show success notification
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
    setDefaults();
    markAsUnsaved();
    
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('אופס', 'ההגדרות אופסו לברירות המחדל');
    }
  }
};

// Export preferences
window.exportPreferences = function() {
  try {
    const preferences = {
      general: {},
      colors: {}
    };
    
    // Collect all form data
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
      const key = element.id;
      if (key) {
        let value = element.type === 'checkbox' ? element.checked : element.value;
        
        if (element.type === 'number') {
          value = parseFloat(value) || 0;
        }
        
        if (['defaultStopLoss', 'defaultTargetPrice', 'defaultCommission', 'primaryCurrency', 'timezone', 'riskPercentage'].includes(key)) {
          preferences.general[key] = value;
        } else if (key.includes('Color')) {
          preferences.colors[key] = value;
        } else {
          preferences.general[key] = value;
        }
      }
    });
    
    // Create download
    const dataStr = JSON.stringify(preferences, null, 2);
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

// ===== BUTTON STATE MANAGEMENT =====

// Mark as unsaved when changes are made
function markAsUnsaved() {
  hasUnsavedChanges = true;
  const saveButtons = document.querySelectorAll('#saveAllBtn, #saveAllBtnBottom');
  saveButtons.forEach(btn => {
    btn.disabled = false;
    btn.classList.add('btn-warning');
    btn.classList.remove('btn-success');
    btn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> שמור שינויים';
  });
}

// Mark as saved when saved
function markAsSaved() {
  hasUnsavedChanges = false;
  const saveButtons = document.querySelectorAll('#saveAllBtn, #saveAllBtnBottom');
  saveButtons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('btn-success');
    btn.classList.remove('btn-warning');
    btn.innerHTML = '<i class="bi bi-check"></i> נשמר';
  });
}

// ===== EVENT HANDLERS =====

// Setup event listeners for form elements
function setupEventListeners() {
  console.log('🔧 Setting up event listeners...');
  
  // Get all form elements
  const formElements = document.querySelectorAll('input, select, textarea');
  
  formElements.forEach(element => {
    element.addEventListener('change', function() {
      markAsUnsaved();
    });
    
    element.addEventListener('blur', function() {
      markAsUnsaved();
    });
  });
  
  // Special handler for color inputs
  const colorInputs = document.querySelectorAll('input[type="color"]');
  colorInputs.forEach(input => {
    input.addEventListener('change', function() {
      markAsUnsaved();
    });
  });
  
  console.log(`✅ Setup event listeners for ${formElements.length} form elements`);
}

// ===== UTILITY FUNCTIONS =====

// Currency validation
window.validateCurrency = function(select) {
  if (select.value !== 'USD') {
    if (typeof window.showWarningNotification === 'function') {
      window.showWarningNotification('אזהרה', 'כרגע נתמך רק דולר ארה"ב');
    } else {
      alert('כרגע נתמך רק דולר ארה"ב');
    }
    select.value = 'USD';
  }
  markAsUnsaved();
};

// Toggle all sections
window.toggleAllSections = function() {
  const sections = document.querySelectorAll('.content-section');
  const allOpen = Array.from(sections).every(section => section.classList.contains('show'));
  
  sections.forEach(section => {
    if (allOpen) {
      section.classList.remove('show');
    } else {
      section.classList.add('show');
    }
  });
  
  const toggleBtn = document.getElementById('toggleAllBtn');
  if (toggleBtn) {
    toggleBtn.innerHTML = allOpen ? 
      '<i class="bi bi-arrows-expand"></i> פתח הכל' : 
      '<i class="bi bi-arrows-collapse"></i> סגור הכל';
  }
};

// ===== INITIALIZATION =====

// Initialize the preferences page
window.initializePreferencesPage = async function() {
  console.log('🚀 Initializing preferences page...');
  
  try {
    // Load preferences from server
    await loadPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load open accounts
    await loadOpenAccounts();
    
    // Load profiles
    await loadProfiles();
    
    console.log('✅ Preferences page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing preferences page:', error);
  }
};

// ===== PROFILE MANAGEMENT =====

// Load profiles
window.loadProfiles = async function() {
  try {
    console.log('👥 Loading profiles...');
    
    const response = await fetch('/api/v1/preferences/profiles');
      if (response.ok) {
      const result = await response.json();
      const profiles = result.data || [];
      
      console.log('✅ Loaded profiles:', profiles);
      
      // Update profile dropdown
      const profileSelect = document.getElementById('profileSelect');
      if (profileSelect) {
        profileSelect.innerHTML = '';
        profiles.forEach(profile => {
          const option = document.createElement('option');
          option.value = profile.id;
          option.textContent = profile.name;
          if (profile.isDefault) {
            option.selected = true;
          }
          profileSelect.appendChild(option);
        });
      }
    }
    } catch (error) {
    console.error('❌ Error loading profiles:', error);
  }
};

// Create new profile
window.createProfile = async function() {
  const profileName = document.getElementById('newProfileName').value.trim();
  if (!profileName) {
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'אנא הכנס שם פרופיל');
    }
    return;
  }
  
  try {
    const response = await fetch('/api/v1/preferences/profiles/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: profileName,
        description: 'פרופיל חדש'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Profile created:', result);
      
      // Reload profiles
      await loadProfiles();
      
      // Clear input
      document.getElementById('newProfileName').value = '';
      
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נוצר', 'פרופיל נוצר בהצלחה');
      }
    } else {
      console.error('❌ Failed to create profile:', response.status);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'שגיאה ביצירת הפרופיל');
      }
    }
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה ביצירת הפרופיל');
    }
  }
};

// Load profile
window.loadProfile = async function() {
  const profileSelect = document.getElementById('profileSelect');
  if (!profileSelect || !profileSelect.value) {
    return;
  }
  
  try {
    const response = await fetch(`/api/v1/preferences/user?profile_id=${profileSelect.value}`);
    if (response.ok) {
      const result = await response.json();
      const preferences = result.data?.preferences || {};
      
      console.log('✅ Loaded profile preferences:', preferences);
      
      // Apply preferences to form
      applyPreferencesToForm(preferences);
      
      // Mark as saved
      markAsSaved();
      
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נטען', 'פרופיל נטען בהצלחה');
      }
    }
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בטעינת הפרופיל');
    }
  }
};

// Save current profile
window.saveCurrentProfile = async function() {
  await window.saveAllPreferences();
};

// Duplicate profile
window.duplicateProfile = function() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציה זו תהיה זמינה בקרוב');
  }
};

// Export profile
window.exportProfile = function() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציה זו תהיה זמינה בקרוב');
  }
};

// Delete profile
window.deleteProfile = function() {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'פונקציה זו תהיה זמינה בקרוב');
  }
};

// ===== ACCOUNTS MANAGEMENT =====

// Load open accounts
window.loadOpenAccounts = async function() {
  try {
    console.log('🏦 Loading open accounts...');
    
    const response = await fetch('/api/v1/accounts/open');
    if (response.ok) {
      const result = await response.json();
      const accounts = result.data || [];
      
      console.log('✅ Loaded open accounts:', accounts);
      
      // Update accounts dropdown
      const accountSelect = document.getElementById('defaultAccountFilter');
      if (accountSelect) {
        accountSelect.innerHTML = '<option value="all">כל החשבונות</option>';
        accounts.forEach(account => {
          const option = document.createElement('option');
          option.value = account.id;
          option.textContent = account.name;
          accountSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error loading open accounts:', error);
  }
};

// ===== PAGE UNLOAD WARNING =====

// Warn user before leaving with unsaved changes
window.addEventListener('beforeunload', function(e) {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = 'יש לך שינויים לא נשמרים. האם אתה בטוח שברצונך לעזוב?';
    return e.returnValue;
  }
});

// ===== EXPORT FUNCTIONS =====

// Export all functions to global scope
window.applyPreferencesToForm = applyPreferencesToForm;
window.setDefaults = setDefaults;
window.markAsUnsaved = markAsUnsaved;
window.markAsSaved = markAsSaved;
window.setupEventListeners = setupEventListeners;
