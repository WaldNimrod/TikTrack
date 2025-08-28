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
      console.log('📊 נתונים מהשרת:', data);
      console.log('🔍 בדיקת מבנה נתונים:');
      console.log('  - data.user:', !!data.user);
      console.log('  - data.users:', !!data.users);
      console.log('  - data.defaults:', !!data.defaults);
      console.log('  - data.defaultTypeFilter:', data.defaultTypeFilter);
      console.log('  - data.primaryCurrency:', data.primaryCurrency);
      
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
        console.log('📊 השרת החזיר ישירות את האובייקט:', data);
      } else {
        currentPreferences = { ...DEFAULT_PREFERENCES };
      }
      
      console.log('✅ העדפות נטענו:', currentPreferences);
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
 * מעדכן העדפה בזיכרון (לא שומר בשרת)
 */
function updatePreference(key, value) {
  try {
    console.log(`🔄 updatePreference נקרא: ${key} = ${value}`);
    
    // בדיקה מיוחדת לפילטר סוג
    if (key === 'defaultTypeFilter') {
      console.log(`🎯 פילטר סוג מיוחד - ערך ישן: ${currentPreferences[key]}, ערך חדש: ${value}`);
    }
    
    // עדכן את הזיכרון הזמני מיד
    currentPreferences[key] = value;
    console.log(`🔄 עדכון זיכרון זמני: ${key} = ${value}`);
    console.log(`📊 currentPreferences אחרי עדכון:`, currentPreferences);
    
    // הצג הודעת מידע שהערך עודכן
    const label = getPreferenceLabel(key);
    const message = `${label} עודכן (לא נשמר עדיין)`;
    console.log(`📢 מציג הודעת מידע: ${message}`);
    showPreferencesInfo('העדפות', message);
    
    console.log(`✅ updatePreference הושלם בהצלחה`);
  } catch (error) {
    console.error(`❌ שגיאה ב-updatePreference:`, error);
  }
}

/**
 * שומר את כל ההעדפות
 */
async function saveAllPreferences() {
  try {
    console.log('🔄 saveAllPreferences נקרא');
    console.log('🔄 שומר את כל ההעדפות:', currentPreferences);
    
    // בדיקה מיוחדת לפילטר סוג
    if (currentPreferences.defaultTypeFilter) {
      console.log(`🎯 פילטר סוג בשמירה: ${currentPreferences.defaultTypeFilter}`);
    }
    
    const requestBody = { preferences: currentPreferences };
    console.log('📤 שליחת בקשה לשרת:', requestBody);
    
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 תגובה מהשרת:', response.status, response.statusText);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('📊 נתוני תגובה:', responseData);
      console.log('✅ כל ההעדפות נשמרו בהצלחה בשרת');
      showPreferencesSuccess('✅ כל ההעדפות נשמרו בהצלחה');
    } else {
      const errorText = await response.text();
      console.error('❌ שגיאה בשמירת העדפות:', response.status, errorText);
      showPreferencesError(`❌ שגיאה בשמירת העדפות: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ שגיאה בשמירת העדפות:', error);
    showPreferencesError(`❌ שגיאה בשמירת העדפות: ${error.message}`);
  }
}

/**
 * מאפס לברירות מחדל
 */
async function resetToDefaults() {
  if (window.showConfirmationDialog) {
    window.showConfirmationDialog(
      'איפוס הגדרות',
      'האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?',
      async () => {
        currentPreferences = { ...DEFAULT_PREFERENCES };
        updateUI();
        
        try {
          await saveAllPreferences();
          showPreferencesSuccess('✅ העדפות אופסו לברירות מחדל');
        } catch (error) {
          showPreferencesError('❌ שגיאה באיפוס העדפות');
        }
      }
    );
  } else {
    // גיבוי למערכת הישנה
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
      currentPreferences = { ...DEFAULT_PREFERENCES };
      updateUI();
      
      try {
        await saveAllPreferences();
        showPreferencesSuccess('✅ העדפות אופסו לברירות מחדל');
      } catch (error) {
        showPreferencesError('❌ שגיאה באיפוס העדפות');
      }
    }
  }
}

/**
 * מעדכן את הממשק עם העדפות נוכחיות
 */
function updateUI() {
  console.log('🔄 מעדכן ממשק עם העדפות:', currentPreferences);
  
  // מטבע ראשי
  const primaryCurrencySelect = document.getElementById('primaryCurrency');
  if (primaryCurrencySelect) {
    primaryCurrencySelect.value = currentPreferences.primaryCurrency || 'USD';
    console.log(`  💰 מטבע ראשי: ${primaryCurrencySelect.value}`);
  }
  
  // אזור זמן
  const timezoneSelect = document.getElementById('timezone');
  if (timezoneSelect) {
    timezoneSelect.value = currentPreferences.timezone || 'Asia/Jerusalem';
    console.log(`  🌍 אזור זמן: ${timezoneSelect.value}`);
  }
  
  // סטופ לוס
  const stopLossInput = document.getElementById('defaultStopLoss');
  if (stopLossInput) {
    stopLossInput.value = currentPreferences.defaultStopLoss || 5;
    console.log(`  🛑 סטופ לוס: ${stopLossInput.value}`);
  }
  
  // יעד
  const targetPriceInput = document.getElementById('defaultTargetPrice');
  if (targetPriceInput) {
    targetPriceInput.value = currentPreferences.defaultTargetPrice || 10;
    console.log(`  🎯 יעד: ${targetPriceInput.value}`);
  }
  
  // עמלה
  const commissionInput = document.getElementById('defaultCommission');
  if (commissionInput) {
    commissionInput.value = currentPreferences.defaultCommission || 1.0;
    console.log(`  💵 עמלה: ${commissionInput.value}`);
  }
  
  // פילטר סטטוס
  const statusFilterSelect = document.getElementById('defaultStatusFilter');
  if (statusFilterSelect) {
    statusFilterSelect.value = currentPreferences.defaultStatusFilter || 'all';
    console.log(`  📊 פילטר סטטוס: ${statusFilterSelect.value}`);
  }
  
  // פילטר סוג - בדיקה מיוחדת
  const typeFilterSelect = document.getElementById('defaultTypeFilter');
  if (typeFilterSelect) {
    const oldValue = typeFilterSelect.value;
    const newValue = currentPreferences.defaultTypeFilter || 'all';
    typeFilterSelect.value = newValue;
    console.log(`  🏷️ פילטר סוג: ${newValue} (היה: ${oldValue})`);
    console.log(`  🎯 פילטר סוג - אלמנט נמצא: ${!!typeFilterSelect}`);
    console.log(`  🎯 פילטר סוג - ערך ב-currentPreferences: ${currentPreferences.defaultTypeFilter}`);
  } else {
    console.error(`  ❌ פילטר סוג - אלמנט לא נמצא!`);
  }
  
  // פילטר חשבון
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (accountFilterSelect) {
    accountFilterSelect.value = currentPreferences.defaultAccountFilter || 'all';
    console.log(`  🏦 פילטר חשבון: ${accountFilterSelect.value}`);
  }
  
  // פילטר טווח תאריכים
  const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilter');
  if (dateRangeFilterSelect) {
    dateRangeFilterSelect.value = currentPreferences.defaultDateRangeFilter || 'all';
    console.log(`  📅 פילטר טווח תאריכים: ${dateRangeFilterSelect.value}`);
  }
  
  console.log('✅ עדכון ממשק הושלם');
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
      console.log('📊 תוצאות טעינת חשבונות:', result);
      
      // בדוק את מבנה התגובה
      if (result.status === 'success' && result.data) {
        updateAccountFilter(result.data);
                 if (result.data.length > 0) {
           showPreferencesInfo('טעינת חשבונות', `נטענו ${result.data.length} חשבונות בהצלחה`);
         }
       } else if (Array.isArray(result)) {
         // אם התגובה היא מערך ישירות
         updateAccountFilter(result);
         if (result.length > 0) {
           showPreferencesInfo('טעינת חשבונות', `נטענו ${result.length} חשבונות בהצלחה`);
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
     console.error('❌ שגיאה בטעינת חשבונות:', error);
     showPreferencesError('טעינת חשבונות', 'שגיאה בטעינת חשבונות מהשרת');
     loadLocalAccounts();
   }
}

/**
 * טוען חשבונות מקומיים (גיבוי)
 */
function loadLocalAccounts() {
  console.log('🔄 טוען חשבונות מקומיים...');
  
  // חשבונות לדוגמה
  const localAccounts = [
    { id: 1, name: 'חשבון ראשי' },
    { id: 2, name: 'חשבון משני' },
    { id: 3, name: 'חשבון השקעות' }
  ];
  
     updateAccountFilter(localAccounts);
   showPreferencesInfo('טעינת חשבונות', `נטענו ${localAccounts.length} חשבונות מקומיים`);
}

/**
 * מעדכן את פילטר החשבונות
 */
function updateAccountFilter(accounts) {
  console.log('🔄 מעדכן פילטר חשבונות עם:', accounts);
  
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (!accountFilterSelect) {
    console.error('❌ לא נמצא אלמנט פילטר חשבונות');
    return;
  }
  
  // שמור את הבחירה הנוכחית
  const currentValue = accountFilterSelect.value;
  console.log('📝 בחירה נוכחית:', currentValue);
  
  // נקה אפשרויות קיימות (חוץ מ"הכול")
  accountFilterSelect.innerHTML = '<option value="all">הכול</option>';
  
  // הוסף חשבונות
  if (accounts && accounts.length > 0) {
    console.log(`✅ מוסיף ${accounts.length} חשבונות לפילטר`);
    accounts.forEach((account, index) => {
      const option = document.createElement('option');
      option.value = account.id || account.name;
      option.textContent = account.name || account.id;
      accountFilterSelect.appendChild(option);
      console.log(`  ${index + 1}. ${account.name} (ID: ${account.id})`);
    });
  } else {
    console.warn('⚠️ אין חשבונות להוספה');
  }
  
  // החזר את הבחירה הקודמת אם היא עדיין קיימת
  if (currentValue && Array.from(accountFilterSelect.options).some(opt => opt.value === currentValue)) {
    accountFilterSelect.value = currentValue;
    console.log('✅ החזרתי בחירה קודמת:', currentValue);
  } else {
    console.log('ℹ️ אין בחירה קודמת או שהיא לא קיימת יותר');
  }
  
  console.log('✅ פילטר חשבונות עודכן בהצלחה');
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
function showPreferencesSuccess(message) {
  console.log(`📢 showPreferencesSuccess נקרא: ${message}`);
  
  if (typeof window.showSuccessNotification === 'function') {
    console.log('📢 משתמש ב-window.showSuccessNotification');
    window.showSuccessNotification('העדפות', message);
  } else if (typeof window.showNotification === 'function') {
    console.log('📢 משתמש ב-window.showNotification');
    window.showNotification('העדפות', message, 'success');
  } else {
    console.log('📢 משתמש ב-console.log (ללא מערכת התראות)');
    console.log('✅ הצלחה:', message);
  }
}

/**
 * הצגת הודעת שגיאה
 */
function showPreferencesError(message) {
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('העדפות', message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification('העדפות', message, 'error');
  } else {
    console.error('❌ שגיאה:', message);
  }
}

/**
 * הצגת הודעת מידע
 */
function showPreferencesInfo(title, message) {
  console.log(`📢 showPreferencesInfo נקרא: ${title} - ${message}`);
  
  if (typeof window.showInfoNotification === 'function') {
    console.log('📢 משתמש ב-window.showInfoNotification');
    window.showInfoNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    console.log('📢 משתמש ב-window.showNotification');
    window.showNotification(title, message, 'info');
  } else {
    console.log('📢 משתמש ב-console.log (ללא מערכת התראות)');
    console.log('ℹ️ מידע:', title, '-', message);
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
  console.log('🚀 מאתחל דף העדפות...');
  
  // בדיקת מערכת ההתראות
  console.log('🔍 בדיקת מערכת ההתראות:');
  console.log('  - window.showSuccessNotification:', typeof window.showSuccessNotification);
  console.log('  - window.showErrorNotification:', typeof window.showErrorNotification);
  console.log('  - window.showInfoNotification:', typeof window.showInfoNotification);
  console.log('  - window.showNotification:', typeof window.showNotification);
  
  try {
    // טען העדפות
    await loadPreferences();
    
    // טען חשבונות
    await loadAccountsToFilter();
    
    console.log('✅ דף העדפות אותחל בהצלחה');
    showPreferencesSuccess('דף העדפות אותחל בהצלחה');
  } catch (error) {
    console.error('❌ שגיאה באתחול דף העדפות:', error);
    showPreferencesError('שגיאה באתחול דף העדפות');
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
    console.error('❌ toggleTopSectionGlobal function not found in main.js');
  }
};
