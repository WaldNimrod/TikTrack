/**
 * Simple Preferences System
 * ניהול העדפות פשוט ובסיסי
 */

// ברירות מחדל
const DEFAULT_PREFERENCES = {
  primaryCurrency: 'USD',
  timezone: 'Asia/Jerusalem',
  defaultStopLoss: 5,
  defaultTargetPrice: 10,
  defaultCommission: 1.0,
  defaultStatusFilter: 'all',
  defaultTypeFilter: 'all',
  defaultAccountFilter: 'all',
  defaultDateRangeFilter: 'all',
  defaultSearchFilter: ''
};

// העדפות נוכחיות
let currentPreferences = {};

/**
 * טוען העדפות מהשרת
 */
async function loadPreferences() {
  try {
  
    const response = await fetch('/api/v1/preferences/');
    if (response.ok) {
      const data = await response.json();
      // בדוק את המבנה הנכון - השרת מחזיר ישירות את האובייקט
      if (data.user) {
        currentPreferences = data.user;
      } else if (data.users && data.users.nimrod) {
        currentPreferences = data.users.nimrod;
      } else if (data.defaults) {
        currentPreferences = data.defaults;
      } else if (data.defaultTypeFilter || data.primaryCurrency) {
        // השרת מחזיר ישירות את האובייקט
        currentPreferences = data;
        } else {
        currentPreferences = { ...DEFAULT_PREFERENCES };
      }
      
      } else {
      console.warn('⚠️ לא ניתן לטעון העדפות מהשרת, משתמש בברירות מחדל');
      currentPreferences = { ...DEFAULT_PREFERENCES };
    }
  } catch (error) {
    handleDataLoadError(error, 'טעינת העדפות');
    currentPreferences = { ...DEFAULT_PREFERENCES };
  }
  
  // עדכון הממשק
  updateUI();
}

/**
 * מעדכן העדפה בזיכרון (לא שומר בשרת)
 */
function updatePreference(key, value) {
  try {
    // בדיקה מיוחדת לפילטר סוג
    if (key === 'defaultTypeFilter') {
      }
    
    // עדכן את הזיכרון הזמני מיד
    currentPreferences[key] = value;
    // הצג הודעת מידע שהערך עודכן
    const label = getPreferenceLabel(key);
    const message = `${label} עודכן (לא נשמר עדיין)`;
    showPreferencesInfo('העדפות', message);
    
    } catch (error) {
    handleSystemError(error, 'updatePreference');
  }
}

/**
 * שומר את כל ההעדפות
 */
async function saveAllPreferences() {
  try {
    // בדיקה מיוחדת לפילטר סוג
    if (currentPreferences.defaultTypeFilter) {
      }
    
    const requestBody = { preferences: currentPreferences };
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      const responseData = await response.json();
      showPreferencesSuccess('הצלחה', 'כל ההעדפות נשמרו בהצלחה');
    } else {
      const errorText = await response.text();
      handleApiError(new Error(`HTTP ${response.status}: ${errorText}`), 'שמירת העדפות');
              showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${response.status}`);
    }
  } catch (error) {
    handleSaveError(error, 'שמירת העדפות');
            showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${error.message}`);
  }
}

/**
 * מאפס לברירות מחדל
 */
async function resetToDefaults() {
  try {
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'איפוס הגדרות',
        'האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?',
        async () => {
          currentPreferences = { ...DEFAULT_PREFERENCES };
          updateUI();
          
          try {
            await saveAllPreferences();
            showPreferencesSuccess('הצלחה', 'העדפות אופסו לברירות מחדל');
          } catch (error) {
            showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
          }
        }
      );
    } else {
      // Fallback to browser confirm
      if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
        currentPreferences = { ...DEFAULT_PREFERENCES };
        updateUI();
        
        try {
          await saveAllPreferences();
          showPreferencesSuccess('הצלחה', 'העדפות אופסו לברירות מחדל');
        } catch (error) {
          showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
        }
      }
    }
  } catch (error) {
    handleSystemError(error, 'איפוס העדפות');
    showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
  }
}

/**
 * מעדכן את הממשק עם העדפות נוכחיות
 */
function updateUI() {
  // בדוק אם אנחנו בעמוד העדפות
  const isPreferencesPage = document.getElementById('primaryCurrency') !== null;
  
  if (!isPreferencesPage) {
    // לא אנחנו בעמוד העדפות, לא ננסה לטעון אלמנטים
    return;
  }
  
  // מטבע ראשי
  const primaryCurrencySelect = document.getElementById('primaryCurrency');
  if (primaryCurrencySelect) {
    primaryCurrencySelect.value = currentPreferences.primaryCurrency || 'USD';
    }
  
  // אזור זמן
  const timezoneSelect = document.getElementById('timezone');
  if (timezoneSelect) {
    timezoneSelect.value = currentPreferences.timezone || 'Asia/Jerusalem';
    }
  
  // סטופ לוס
  const stopLossInput = document.getElementById('defaultStopLoss');
  if (stopLossInput) {
    stopLossInput.value = currentPreferences.defaultStopLoss || 5;
    }
  
  // יעד
  const targetPriceInput = document.getElementById('defaultTargetPrice');
  if (targetPriceInput) {
    targetPriceInput.value = currentPreferences.defaultTargetPrice || 10;
    }
  
  // עמלה
  const commissionInput = document.getElementById('defaultCommission');
  if (commissionInput) {
    commissionInput.value = currentPreferences.defaultCommission || 1.0;
    }
  
  // פילטר סטטוס
  const statusFilterSelect = document.getElementById('defaultStatusFilter');
  if (statusFilterSelect) {
    statusFilterSelect.value = currentPreferences.defaultStatusFilter || 'all';
    }
  
  // פילטר סוג - בדיקה מיוחדת
  const typeFilterSelect = document.getElementById('defaultTypeFilter');
  if (typeFilterSelect) {
    const oldValue = typeFilterSelect.value;
    const newValue = currentPreferences.defaultTypeFilter || 'all';
    typeFilterSelect.value = newValue;
    // Updated type filter to
    } else {
    handleElementNotFound('updateUI', 'פילטר סוג - אלמנט לא נמצא');
  }
  
  // פילטר חשבון
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (accountFilterSelect) {
    accountFilterSelect.value = currentPreferences.defaultAccountFilter || 'all';
    }
  
  // פילטר טווח תאריכים
  const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilter');
  if (dateRangeFilterSelect) {
    dateRangeFilterSelect.value = currentPreferences.defaultDateRangeFilter || 'all';
    }
  
  }

/**
 * טוען חשבונות לפילטר
 */
async function loadAccountsToFilter() {
  try {
    // נסה לטעון חשבונות מהשרת
    const response = await fetch('/api/v1/accounts/');
    if (response.ok) {
      const result = await response.json();
      // בדוק את מבנה התגובה
      if (result.status === 'success' && result.data) {
        updateAccountFilter(result.data);
                         if (result.data.length > 0) {
            // הסרת התראה מיותרת בטעינה
            }
       } else if (Array.isArray(result)) {
         // אם התגובה היא מערך ישירות
         updateAccountFilter(result);
                 if (result.length > 0) {
            // הסרת התראה מיותרת בטעינה
            }
       } else {
         console.warn('⚠️ מבנה תגובה לא צפוי:', result);
         showPreferencesWarning('טעינת חשבונות', 'מבנה תגובה לא צפוי מהשרת, משתמש בנתונים מקומיים');
         // נסה לטעון חשבונות מקומיים
         loadLocalAccounts();
       }
     } else {
       console.warn('⚠️ לא ניתן לטעון חשבונות מהשרת, משתמש בנתונים מקומיים');
       showPreferencesWarning('טעינת חשבונות', 'לא ניתן לטעון חשבונות מהשרת, משתמש בנתונים מקומיים');
       loadLocalAccounts();
     }
   } catch (error) {
     handleDataLoadError(error, 'טעינת חשבונות');
     showPreferencesError('טעינת חשבונות', 'שגיאה בטעינת חשבונות מהשרת');
     loadLocalAccounts();
   }
}

/**
 * טוען חשבונות מקומיים (גיבוי)
 */
function loadLocalAccounts() {
  // חשבונות לדוגמה
  const localAccounts = [
    { id: 1, name: 'חשבון ראשי' },
    { id: 2, name: 'חשבון משני' },
    { id: 3, name: 'חשבון השקעות' }
  ];
  
     updateAccountFilter(localAccounts);
           // הסרת התראה מיותרת בטעינה
    }

/**
 * מעדכן את פילטר החשבונות
 */
function updateAccountFilter(accounts) {
  // בדוק אם אנחנו בעמוד העדפות
  const isPreferencesPage = document.getElementById('primaryCurrency') !== null;
  
  if (!isPreferencesPage) {
    // לא אנחנו בעמוד העדפות, לא ננסה לטעון אלמנטים
    return;
  }
  
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (!accountFilterSelect) {
    handleElementNotFound('updateAccountFilter', 'לא נמצא אלמנט פילטר חשבונות');
    return;
  }
  
  // שמור את הבחירה הנוכחית
  const currentValue = accountFilterSelect.value;
  // נקה אפשרויות קיימות (חוץ מ"הכול")
  accountFilterSelect.innerHTML = '<option value="all">הכול</option>';
  
  // הוסף חשבונות
  if (accounts && accounts.length > 0) {
    accounts.forEach((account, index) => {
      const option = document.createElement('option');
      option.value = account.id || account.name;
      option.textContent = account.name || account.id;
      accountFilterSelect.appendChild(option);
      // Added account option
    });
  } else {
    console.warn('⚠️ אין חשבונות להוספה');
  }
  
  // החזר את הבחירה הקודמת אם היא עדיין קיימת
  if (currentValue && Array.from(accountFilterSelect.options).some(opt => opt.value === currentValue)) {
    accountFilterSelect.value = currentValue;
    } else {
    }
  
  }

/**
 * מחזיר תווית בעברית להעדפה
 */
function getPreferenceLabel(key) {
  const labels = {
    primaryCurrency: 'מטבע ראשי',
    timezone: 'אזור זמן',
    defaultStopLoss: 'סטופ לוס ברירת מחדל',
    defaultTargetPrice: 'יעד ברירת מחדל',
    defaultCommission: 'עמלה ברירת מחדל',
    defaultStatusFilter: 'פילטר סטטוס ברירת מחדל',
    defaultTypeFilter: 'פילטר סוג ברירת מחדל',
    defaultAccountFilter: 'פילטר חשבון ברירת מחדל',
    defaultDateRangeFilter: 'פילטר טווח תאריכים ברירת מחדל',
    defaultSearchFilter: 'פילטר חיפוש ברירת מחדל'
  };
  
  return labels[key] || key;
}

/**
 * הצגת הודעת הצלחה
 */
function showPreferencesSuccess(title, message) {
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'success');
  } else {
    // הצלחה
    }
}

/**
 * הצגת הודעת שגיאה
 */
function showPreferencesError(title, message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'error');
  } else {
    handleSystemError(new Error(`${title}: ${message}`), 'הצגת שגיאת העדפות');
  }
}

/**
 * הצגת הודעת מידע
 */
function showPreferencesInfo(title, message) {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'info');
  } else {
    // מידע
  }
}

/**
 * הצגת הודעת אזהרה
 */
function showPreferencesWarning(title, message) {
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'warning');
  } else {
    console.warn('⚠️ אזהרה:', title, '-', message);
  }
}

/**
 * אתחול הדף
 */
async function initializePreferences() {
  // בדיקת מערכת ההתראות
  try {
    // שחזור מצב הסקשנים
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      handleFunctionNotFound('restoreAllSectionStates', 'פונקציית שחזור מצב סקשנים לא נמצאה');
    }

    // טען העדפות
    await loadPreferences();
    
    // טען חשבונות
    await loadAccountsToFilter();
    
    // הסרת התראה מיותרת בטעינה
  } catch (error) {
    handleSystemError(error, 'אתחול דף העדפות');
    showPreferencesError('שגיאה', 'שגיאה באתחול דף העדפות');
  }
}

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', initializePreferences);

// ========================================
// Export Functions
// ========================================

// Export main functions
window.saveAllPreferences = saveAllPreferences;
window.resetToDefaults = resetToDefaults;
window.updatePreference = updatePreference;
window.loadPreferences = loadPreferences;
window.initializePreferences = initializePreferences;

// Export notification functions
window.showPreferencesSuccess = showPreferencesSuccess;
window.showPreferencesError = showPreferencesError;
window.showPreferencesInfo = showPreferencesInfo;
window.showPreferencesWarning = showPreferencesWarning;

// Export utility functions
window.getPreferenceLabel = getPreferenceLabel;
window.loadAccountsToFilter = loadAccountsToFilter;

// Export toggle functions
window.toggleTopSection = function() {
  if (typeof window.toggleTopSectionGlobal === 'function') {
    window.toggleTopSectionGlobal();
  } else {
    handleFunctionNotFound('toggleTopSectionGlobal', 'פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
  }
};
