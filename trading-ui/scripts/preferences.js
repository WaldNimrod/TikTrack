/**
 * Preferences Page - Simple and Clean System
 * =========================================
 * 
 * מערכת העדפות פשוטה ונקייה
 * 
 * @version 3.0.0
 * @lastUpdated January 7, 2025
 * @author TikTrack Development Team
 */

// ===== CORE FUNCTIONS =====

// Load preferences from server and apply to form
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
      
      // Show success notification
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נטען', 'ההעדפות נטענו בהצלחה מהשרת');
      }
      
      return true;
    } else {
      console.log('⚠️ Server not available, showing error');
      showError('שגיאה בטעינת השרת', 'לא ניתן לטעון העדפות מהשרת. בדוק את החיבור לשרת.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error loading preferences:', error);
    showError('שגיאה בטעינת העדפות', 'שגיאה בטעינת העדפות מהשרת: ' + error.message);
    return false;
  }
};

// Apply preferences to form elements
function applyPreferencesToForm(preferences) {
  console.log('🔧 Applying preferences to form:', preferences);
  
  // Clear all form fields first
  clearAllFormFields();
  
  // Apply general settings
  if (preferences.general) {
    Object.keys(preferences.general).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        const value = preferences.general[key];
        if (value !== undefined && value !== null && value !== '') {
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
        if (value !== undefined && value !== null && value !== '') {
          element.value = value;
          console.log(`✅ Applied colors.${key} = ${value}`);
        }
      }
    });
  }
}

// No default values - all data must come from server

// Save all preferences to database
window.saveAllPreferences = async function() {
  try {
    console.log('💾 Saving all preferences to database...');
    
    // Collect all form data with values only
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
        
        // Only include fields with actual values
        if (value && value !== '' && value !== '0') {
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
      }
    });
    
    // Check if there are any preferences to save
    const hasGeneral = Object.keys(preferences.general).length > 0;
    const hasColors = Object.keys(preferences.colors).length > 0;
    
    if (!hasGeneral && !hasColors) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'אין העדפות לשמירה - כל השדות ריקים');
      }
      return;
    }
    
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

// Clear all form fields
window.resetToDefaults = function() {
  if (confirm('האם אתה בטוח שברצונך לנקות את כל השדות?')) {
    console.log('🔄 Clearing all form fields...');
    clearAllFormFields();
    
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('נוקה', 'כל השדות נוקו');
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
    
    // Collect all form data with values only
    const formElements = document.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
      const key = element.id;
      if (key) {
        let value = element.type === 'checkbox' ? element.checked : element.value;
        
        // Only include fields with actual values
        if (value && value !== '' && value !== '0') {
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
      }
    });
    
    // Check if there are any preferences to export
    const hasGeneral = Object.keys(preferences.general).length > 0;
    const hasColors = Object.keys(preferences.colors).length > 0;
    
    if (!hasGeneral && !hasColors) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אזהרה', 'אין העדפות לייצוא - כל השדות ריקים');
      }
      return;
    }
    
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

// ===== UTILITY FUNCTIONS =====

// Show error message
function showError(title, message) {
  console.error(`❌ ${title}: ${message}`);
  
  // Show error notification if available
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(title, message);
  } else {
    // Fallback to alert
    alert(`${title}: ${message}`);
  }
  
  // Clear all form fields to show empty state
  clearAllFormFields();
}

// Clear all form fields
function clearAllFormFields() {
  const formElements = document.querySelectorAll('input, select, textarea');
  formElements.forEach(element => {
    if (element.type === 'checkbox') {
      element.checked = false;
    } else {
      element.value = '';
    }
  });
}

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
    
    console.log('✅ Preferences page initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing preferences page:', error);
  }
};

// ===== EXPORT FUNCTIONS =====

// Export all functions to global scope
window.applyPreferencesToForm = applyPreferencesToForm;
window.clearAllFormFields = clearAllFormFields;
