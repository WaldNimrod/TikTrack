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
      currentPreferences = data.user || data.defaults || DEFAULT_PREFERENCES;
    } else {
      console.warn('⚠️ לא ניתן לטעון העדפות מהשרת, משתמש בברירות מחדל');
      currentPreferences = { ...DEFAULT_PREFERENCES };
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות:', error);
    currentPreferences = { ...DEFAULT_PREFERENCES };
  }
  
  // עדכון הממשק
  updateUI();
}

/**
 * שומר העדפה אחת
 */
async function savePreference(key, value) {
  try {
    const response = await fetch(`/api/v1/preferences/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value })
    });
    
    if (response.ok) {
      currentPreferences[key] = value;
      showSuccessNotification(`✅ ${getPreferenceLabel(key)} נשמר בהצלחה`);
    } else {
      console.error(`❌ שגיאה בשמירת ${key}:`, response.status);
      showErrorNotification(`❌ שגיאה בשמירת ${getPreferenceLabel(key)}`);
    }
  } catch (error) {
    console.error(`❌ שגיאה בשמירת ${key}:`, error);
    showErrorNotification(`❌ שגיאה בשמירת ${getPreferenceLabel(key)}`);
  }
}

/**
 * שומר את כל ההעדפות
 */
async function saveAllPreferences() {
  try {
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ preferences: currentPreferences })
    });
    
    if (response.ok) {
      showSuccessNotification('✅ כל ההעדפות נשמרו בהצלחה');
    } else {
      console.error('❌ שגיאה בשמירת העדפות:', response.status);
      showErrorNotification('❌ שגיאה בשמירת העדפות');
    }
  } catch (error) {
    console.error('❌ שגיאה בשמירת העדפות:', error);
    showErrorNotification('❌ שגיאה בשמירת העדפות');
  }
}

/**
 * מאפס לברירות מחדל
 */
async function resetToDefaults() {
  if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
    currentPreferences = { ...DEFAULT_PREFERENCES };
    updateUI();
    
    try {
      await saveAllPreferences();
      showSuccessNotification('✅ העדפות אופסו לברירות מחדל');
    } catch (error) {
      showErrorNotification('❌ שגיאה באיפוס העדפות');
    }
  }
}

/**
 * מעדכן את הממשק עם העדפות נוכחיות
 */
function updateUI() {
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
  
  // פילטר סוג
  const typeFilterSelect = document.getElementById('defaultTypeFilter');
  if (typeFilterSelect) {
    typeFilterSelect.value = currentPreferences.defaultTypeFilter || 'all';
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
      const accounts = await response.json();
      updateAccountFilter(accounts);
    } else {
      console.warn('⚠️ לא ניתן לטעון חשבונות מהשרת');
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
  }
}

/**
 * מעדכן את פילטר החשבונות
 */
function updateAccountFilter(accounts) {
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (!accountFilterSelect) return;
  
  // שמור את הבחירה הנוכחית
  const currentValue = accountFilterSelect.value;
  
  // נקה אפשרויות קיימות (חוץ מ"הכול")
  accountFilterSelect.innerHTML = '<option value="all">הכול</option>';
  
  // הוסף חשבונות
  if (accounts && accounts.length > 0) {
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id || account.name;
      option.textContent = account.name || account.id;
      accountFilterSelect.appendChild(option);
    });
  }
  
  // החזר את הבחירה הקודמת אם היא עדיין קיימת
  if (currentValue && Array.from(accountFilterSelect.options).some(opt => opt.value === currentValue)) {
    accountFilterSelect.value = currentValue;
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
function showSuccessNotification(message) {
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('העדפות', message);
  } else {
    alert(message);
  }
}

/**
 * הצגת הודעת שגיאה
 */
function showErrorNotification(message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('העדפות', message);
  } else {
    alert(message);
  }
}

/**
 * אתחול הדף
 */
async function initializePreferences() {
  console.log('🚀 מאתחל דף העדפות...');
  
  // טען העדפות
  await loadPreferences();
  
  // טען חשבונות
  await loadAccountsToFilter();
  
  console.log('✅ דף העדפות אותחל בהצלחה');
}

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', initializePreferences);

