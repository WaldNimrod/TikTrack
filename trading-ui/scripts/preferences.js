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
    console.log('🔄 טוען העדפות מהשרת...');
    const response = await fetch('/api/v1/preferences/');
    if (response.ok) {
      const data = await response.json();
      console.log('📊 נתונים מהשרת:', data);
      
      // בדוק את המבנה הנכון
      if (data.user) {
        currentPreferences = data.user;
      } else if (data.users && data.users.nimrod) {
        currentPreferences = data.users.nimrod;
      } else if (data.defaults) {
        currentPreferences = data.defaults;
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
  // עדכן את הזיכרון הזמני מיד
  currentPreferences[key] = value;
  console.log(`🔄 עדכון זיכרון זמני: ${key} = ${value}`);
  
  // הצג הודעת מידע שהערך עודכן
  showPreferencesInfo('העדפות', `${getPreferenceLabel(key)} עודכן (לא נשמר עדיין)`);
}

/**
 * שומר את כל ההעדפות
 */
async function saveAllPreferences() {
  try {
    console.log('🔄 שומר את כל ההעדפות:', currentPreferences);
    
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ preferences: currentPreferences })
    });
    
    if (response.ok) {
      console.log('✅ כל ההעדפות נשמרו בהצלחה בשרת');
      showPreferencesSuccess('✅ כל ההעדפות נשמרו בהצלחה');
    } else {
      console.error('❌ שגיאה בשמירת העדפות:', response.status);
      showPreferencesError('❌ שגיאה בשמירת העדפות');
    }
  } catch (error) {
    console.error('❌ שגיאה בשמירת העדפות:', error);
    showPreferencesError('❌ שגיאה בשמירת העדפות');
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
           showPreferencesSuccess('✅ העדפות אופסו לברירות מחדל');
         } catch (error) {
           showPreferencesError('❌ שגיאה באיפוס העדפות');
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
  
  // פילטר סוג
  const typeFilterSelect = document.getElementById('defaultTypeFilter');
  if (typeFilterSelect) {
    typeFilterSelect.value = currentPreferences.defaultTypeFilter || 'all';
    console.log(`  🏷️ פילטר סוג: ${typeFilterSelect.value}`);
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
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('העדפות', message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification('העדפות', message, 'success');
  } else {
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
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification(title, message);
  } else if (typeof window.showNotification === 'function') {
    window.showNotification(title, message, 'info');
  } else {
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
  
  try {
    // טען העדפות
    await loadPreferences();
    
    // טען חשבונות
    await loadAccountsToFilter();
    
         console.log('✅ דף העדפות אותחל בהצלחה');
     showPreferencesSuccess('אתחול דף העדפות', 'דף העדפות אותחל בהצלחה');
   } catch (error) {
     console.error('❌ שגיאה באתחול דף העדפות:', error);
     showPreferencesError('אתחול דף העדפות', 'שגיאה באתחול דף העדפות');
   }
}

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', initializePreferences);
