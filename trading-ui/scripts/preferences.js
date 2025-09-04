/**
 * Simple Preferences System
 * ניהול העדפות פשוט ובסיסי
 */

// ברירות מחדל - מותאמות למערכת החדשה
const DEFAULT_PREFERENCES = {
  primaryCurrency: 'USD',
  defaultStopLoss: 5,
  defaultTargetPrice: 10,
  defaultCommission: 1.0,
  consoleCleanupInterval: 60000,
  timezone: 'Asia/Jerusalem',
  defaultStatusFilter: 'open',
  defaultTypeFilter: 'swing',
  defaultAccountFilter: 'all',
  defaultDateRangeFilter: 'this_week',
  defaultSearchFilter: '',
  dataRefreshInterval: 5,
  primaryDataProvider: 'yahoo',
  secondaryDataProvider: 'google',
  cacheTTL: 5,
  maxBatchSize: 25,
  requestDelay: 200,
  retryAttempts: 2,
  retryDelay: 5,
  autoRefresh: false,
  verboseLogging: false,
  // הגדרות צבעים לערכים מספריים
  numericValueColors: {
    positive: {
      light: '#d4edda',
      medium: '#28a745',
      dark: '#155724',
      border: '#c3e6cb',
    },
    negative: {
      light: '#f8d7da',
      medium: '#dc3545',
      dark: '#721c24',
      border: '#f5c6cb',
    },
    zero: {
      light: '#e2e3e5',
      medium: '#6c757d',
      dark: '#383d41',
      border: '#d6d8db',
    },
  },
  // הגדרות צבעים לפי ישויות
  entityColors: {
    trade: '#007bff',
    trade_plan: '#0056b3',
    execution: '#17a2b8',
    account: '#28a745',
    cash_flow: '#20c997',
    ticker: '#dc3545',
    alert: '#ff9c05',
    note: '#6f42c1',
    constraint: '#6c757d',
    design: '#495057',
    research: '#343a40',
    preference: '#adb5bd',
  },
  // הגדרות צבעים לפי סטטוסים
  statusColors: {
    open: {
      light: 'rgba(40, 167, 69, 0.1)',
      medium: '#28a745',
      dark: '#155724',
      border: 'rgba(40, 167, 69, 0.3)',
    },
    closed: {
      light: 'rgba(108, 117, 125, 0.1)',
      medium: '#6c757d',
      dark: '#383d41',
      border: 'rgba(108, 117, 125, 0.3)',
    },
    cancelled: {
      light: 'rgba(220, 53, 69, 0.1)',
      medium: '#dc3545',
      dark: '#721c24',
      border: 'rgba(220, 53, 69, 0.3)',
    },
  },
  // הגדרות צבעים לפי סוגי השקעה
  investmentTypeColors: {
    swing: {
      light: 'rgba(0, 123, 255, 0.1)',
      medium: '#007bff',
      dark: '#0056b3',
      border: 'rgba(0, 123, 255, 0.3)',
    },
    investment: {
      light: 'rgba(40, 167, 69, 0.1)',
      medium: '#28a745',
      dark: '#155724',
      border: 'rgba(40, 167, 69, 0.3)',
    },
    passive: {
      light: 'rgba(111, 66, 193, 0.1)',
      medium: '#6f42c1',
      dark: '#4a2c7a',
      border: 'rgba(111, 66, 193, 0.3)',
    },
  },
  // הגדרות שקיפות כותרות
  headerOpacity: {
    main: 60,
    sub: 30,
  },
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
      if (typeof window.showNotification === 'function') {
        window.showNotification('לא ניתן לטעון העדפות מהשרת, משתמש בברירות מחדל', 'warning');
      }
      currentPreferences = { ...DEFAULT_PREFERENCES };
    }
  } catch (error) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת העדפות: ' + error.message, 'error');
    }
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
    // עדכן את הזיכרון הזמני מיד
    currentPreferences[key] = value;

    // הצג הודעת מידע שהערך עודכן
    const label = getPreferenceLabel(key);
    const message = `${label} עודכן (לא נשמר עדיין)`;
    showPreferencesInfo('העדפות', message);
  } catch (error) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בעדכון העדפה: ' + error.message, 'error');
    }
  }
}

/**
 * שומר את כל ההעדפות
 */
async function saveAllPreferences() {
  try {
    const requestBody = { preferences: currentPreferences };
    const response = await fetch('/api/v1/preferences/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      await response.json();
      showPreferencesSuccess('הצלחה', 'כל ההעדפות נשמרו בהצלחה');

      // עדכן את מערכת הצבעים הגלובלית מיד
      if (window.loadColorPreferences) {
        await window.loadColorPreferences();
      }

      // טען מחדש את ההעדפות מהשרת כדי להציג את השינויים
      await loadPreferences();

      // הפעל הגדרות קונסול אחרי שמירה מוצלחת
      if (typeof applyConsoleSettings === 'function') {
        applyConsoleSettings();
      }
    } else {
      const errorText = await response.text();
      if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בשמירת העדפות: ' + errorText, 'error');
      }
      showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${response.status}`);
    }
  } catch (_error) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בשמירת העדפות: ' + _error.message, 'error');
    }
    showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${_error.message}`);
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
        },
      );
    } else {
      // Fallback למקרה שמערכת התראות לא זמינה
      if (window.confirm('האם אתה בטוח שברצונך לאפס את כל ההעדפות לברירות מחדל?')) {
        currentPreferences = { ...DEFAULT_PREFERENCES };
        updateUI();

        try {
          await saveAllPreferences();
          showPreferencesSuccess('הצלחה', 'העדפות אופסו לברירות מחדל');
        } catch (_error) {
          showPreferencesError('שגיאה', 'שגיאה באיפוס העדפות');
        }
      }
    }
  } catch (error) {
    console.error('שגיאה באיפוס העדפות:', error);
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

  // מרווח ניקוי קונסול
  const consoleCleanupIntervalInput = document.getElementById('consoleCleanupInterval');
  if (consoleCleanupIntervalInput) {
    consoleCleanupIntervalInput.value = currentPreferences.consoleCleanupInterval || 60000;
  }

  // פילטר סטטוס
  const statusFilterSelect = document.getElementById('defaultStatusFilter');
  if (statusFilterSelect) {
    statusFilterSelect.value = currentPreferences.defaultStatusFilter || 'open';
  }

  // פילטר סוג
  const typeFilterSelect = document.getElementById('defaultTypeFilter');
  if (typeFilterSelect) {
    typeFilterSelect.value = currentPreferences.defaultTypeFilter || 'swing';
  }

  // פילטר חשבון
  const accountFilterSelect = document.getElementById('defaultAccountFilter');
  if (accountFilterSelect) {
    accountFilterSelect.value = currentPreferences.defaultAccountFilter || 'all';
  }

  // פילטר טווח תאריכים
  const dateRangeFilterSelect = document.getElementById('defaultDateRangeFilter');
  if (dateRangeFilterSelect) {
    dateRangeFilterSelect.value = currentPreferences.defaultDateRangeFilter || 'this_week';
  }

  // פילטר חיפוש
  const searchFilterInput = document.getElementById('defaultSearchFilter');
  if (searchFilterInput) {
    searchFilterInput.value = currentPreferences.defaultSearchFilter || '';
  }

  // הגדרות נתונים חיצוניים
  const dataRefreshIntervalInput = document.getElementById('dataRefreshInterval');
  if (dataRefreshIntervalInput) {
    dataRefreshIntervalInput.value = currentPreferences.dataRefreshInterval || 5;
  }

  const primaryDataProviderSelect = document.getElementById('primaryDataProvider');
  if (primaryDataProviderSelect) {
    primaryDataProviderSelect.value = currentPreferences.primaryDataProvider || 'yahoo';
  }

  const secondaryDataProviderSelect = document.getElementById('secondaryDataProvider');
  if (secondaryDataProviderSelect) {
    secondaryDataProviderSelect.value = currentPreferences.secondaryDataProvider || 'google';
  }

  const cacheTTLInput = document.getElementById('cacheTTL');
  if (cacheTTLInput) {
    cacheTTLInput.value = currentPreferences.cacheTTL || 5;
  }

  const maxBatchSizeInput = document.getElementById('maxBatchSize');
  if (maxBatchSizeInput) {
    maxBatchSizeInput.value = currentPreferences.maxBatchSize || 25;
  }

  const requestDelayInput = document.getElementById('requestDelay');
  if (requestDelayInput) {
    requestDelayInput.value = currentPreferences.requestDelay || 200;
  }

  const retryAttemptsInput = document.getElementById('retryAttempts');
  if (retryAttemptsInput) {
    retryAttemptsInput.value = currentPreferences.retryAttempts || 2;
  }

  // עדכון ממשק הצבעים
  updateNumericValueColorsUI();

  // עדכון ממשק צבעי הישויות
  updateEntityColorsUI();

  // טעינת העדפות שקיפות כותרות
  loadHeaderOpacityPreferences();

  // עדכון ממשק צבעי הסטטוסים
  updateStatusColorsUI();

  // עדכון ממשק צבעי סוגי השקעה
  updateInvestmentTypeColorsUI();

  const retryDelayInput = document.getElementById('retryDelay');
  if (retryDelayInput) {
    retryDelayInput.value = currentPreferences.retryDelay || 5;
  }

  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.checked = currentPreferences.autoRefresh || false;
  }

  const verboseLoggingCheckbox = document.getElementById('verboseLogging');
  if (verboseLoggingCheckbox) {
    verboseLoggingCheckbox.checked = currentPreferences.verboseLogging || false;
  }
}

/**
 * טוען חשבונות לפילטר
 */
async function loadAccountsToFilter() {
  try {
    // שימוש ב-account-service.js במקום קריאה ישירה
    if (typeof window.getAccounts === 'function') {
      const accounts = await window.getAccounts();
      updateAccountFilter(accounts);
    } else {
      console.warn('⚠️ פונקציית getAccounts לא זמינה, משתמש בנתונים מקומיים');
      showPreferencesWarning('טעינת חשבונות', 'פונקציית getAccounts לא זמינה, משתמש בנתונים מקומיים');
      loadLocalAccounts();
    }
  } catch (error) {
    console.error('שגיאה בטעינת חשבונות:', error);
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
    { id: 3, name: 'חשבון השקעות' },
  ];

  updateAccountFilter(localAccounts);
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
    console.warn('לא נמצא אלמנט פילטר חשבונות');
    return;
  }

  // שמור את הבחירה הנוכחית
  const currentValue = accountFilterSelect.value;
  // נקה אפשרויות קיימות (חוץ מ"הכול")
  accountFilterSelect.innerHTML = '<option value="all">הכול</option>';

  // הוסף חשבונות
  if (accounts && accounts.length > 0) {
    accounts.forEach((account, _index) => {
      const option = document.createElement('option');
      option.value = account.id || account.name;
      option.textContent = account.name || account.id;
      accountFilterSelect.appendChild(option);
    });
  } else {
    console.warn('⚠️ אין חשבונות להוספה');
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
    defaultSearchFilter: 'פילטר חיפוש ברירת מחדל',
    dataRefreshInterval: 'מרווח רענון נתונים',
    primaryDataProvider: 'ספק נתונים ראשי',
    secondaryDataProvider: 'ספק נתונים משני',
    cacheTTL: 'מרווח זמן Cache',
    maxBatchSize: 'מספר מקסימלי של טיקרים לרענון',
    requestDelay: 'מרווח בין בקשות',
    retryAttempts: 'מספר ניסיונות חוזרים',
    retryDelay: 'זמן פסקה בין ניסיונות',
    autoRefresh: 'רענון אוטומטי',
    verboseLogging: 'לוגים מפורטים',
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
    console.log('✅ הצלחה:', title, '-', message);
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
    console.error('❌ שגיאה:', title, '-', message);
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
  try {
    // שחזור מצב הסקשנים
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      console.warn('פונקציית שחזור מצב סקשנים לא נמצאה');
    }

    // טען העדפות
    await loadPreferences();

    // טען חשבונות
    await loadAccountsToFilter();

    // טען הגדרות קונסול לממשק
    loadConsoleSettingsToUI();

    console.log('✅ דף העדפות אותחל בהצלחה');
  } catch (error) {
    console.error('שגיאה באתחול דף העדפות:', error);
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
    console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
  }
};

// ========================================
// Console Management Functions
// ========================================

/**
 * מעדכן הגדרת קונסול
 */
function updateConsolePreference(key, value) {
  try {
    // עדכן את הזיכרון הזמני מיד
    if (!currentPreferences.consoleSettings) {
      currentPreferences.consoleSettings = {};
    }
    currentPreferences.consoleSettings[key] = value;

    // הצג הודעת מידע שהערך עודכן
    const label = getConsolePreferenceLabel(key);
    const message = `${label} עודכן (לא נשמר עדיין)`;
    showPreferencesInfo('הגדרות קונסול', message);

    // אל תפעיל את ההגדרות עד שהמשתמש לוחץ על "שמור שינויים"
    // applyConsoleSettings();
  } catch (error) {
    console.error('שגיאה בעדכון הגדרת קונסול:', error);
  }
}

/**
 * מחזיר תווית להגדרת קונסול
 */
function getConsolePreferenceLabel(key) {
  const labels = {
    autoClear: 'ניקוי אוטומטי',
    clearInterval: 'מרווח ניקוי',
    suppressMessages: 'הסתרת הודעות',
    suppressDuration: 'משך הסתרה',
  };
  return labels[key] || key;
}

/**
 * מפעיל את הגדרות הקונסול
 */
function applyConsoleSettings() {
  try {
    if (typeof window.saveConsoleSettings === 'function') {
      const settings = currentPreferences.consoleSettings || {};
      window.saveConsoleSettings(settings);

      // הפעל ניקוי אוטומטי רק אם מופעל במפורש
      if (settings.autoClear && typeof window.autoClearConsole === 'function') {
        window.autoClearConsole();
      }

      // הפעל הסתרת הודעות רק אם מופעל במפורש
      if (settings.suppressMessages && typeof window.suppressConsoleMessages === 'function') {
        window.suppressConsoleMessages();
      }
    }
  } catch (error) {
    console.error('שגיאה בהפעלת הגדרות קונסול:', error);
  }
}

/**
 * ניקוי ידני של הקונסול
 */
function manualClearConsole() {
  try {
    if (typeof window.clearConsole === 'function') {
      window.clearConsole();
      showPreferencesSuccess('ניקוי קונסול', 'הקונסול נוקה בהצלחה');
    } else {
      showPreferencesError('שגיאה', 'פונקציית ניקוי קונסול לא זמינה');
    }
  } catch (error) {
    console.error('שגיאה בניקוי קונסול:', error);
    showPreferencesError('שגיאה', 'שגיאה בניקוי הקונסול');
  }
}

/**
 * טוען הגדרות קונסול לממשק
 */
function loadConsoleSettingsToUI() {
  try {
    if (typeof window.getConsoleSettings === 'function') {
      const settings = window.getConsoleSettings();

      // עדכן את הממשק
      const autoClearCheckbox = document.getElementById('consoleAutoClear');
      const clearIntervalInput = document.getElementById('consoleClearInterval');
      const suppressMessagesCheckbox = document.getElementById('consoleSuppressMessages');
      const suppressDurationInput = document.getElementById('consoleSuppressDuration');

      if (autoClearCheckbox) {autoClearCheckbox.checked = settings.autoClear || false;}
      if (clearIntervalInput) {clearIntervalInput.value = settings.clearInterval || 60;}
      if (suppressMessagesCheckbox) {suppressMessagesCheckbox.checked = settings.suppressMessages || false;}
      if (suppressDurationInput) {suppressDurationInput.value = settings.suppressDuration || 5;}
    }
  } catch (error) {
    console.error('שגיאה בטעינת הגדרות קונסול לממשק:', error);
  }
}

// Export console management functions
window.updateConsolePreference = updateConsolePreference;
window.manualClearConsole = manualClearConsole;
window.loadConsoleSettingsToUI = loadConsoleSettingsToUI;

// ========================================
// 🎨 פונקציות ניהול צבעים לערכים מספריים
// ========================================

/**
 * עדכון צבע ערך מספרי
 */
function updateNumericValueColor(colorType, intensity, colorValue) {
  try {
    // בדיקת תקינות הפרמטרים
    if (!colorType || !intensity || !colorValue) {
      showPreferencesError('שגיאה', 'חסרים פרמטרים לעדכון הצבע');
      return;
    }

    // וידוא שהצבעים מאותחלים
    if (!currentPreferences.numericValueColors) {
      currentPreferences.numericValueColors = { ...DEFAULT_PREFERENCES.numericValueColors };
    }

    if (!currentPreferences.numericValueColors[colorType]) {
      currentPreferences.numericValueColors[colorType] = {};
    }

    // עדכון הצבע
    currentPreferences.numericValueColors[colorType][intensity] = colorValue;

    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.updateNumericValueColors) {
      window.updateNumericValueColors(currentPreferences.numericValueColors);
    }

    // עדכון השדה המקושר (אם קיים)
    const linkedFieldId = `${colorType}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}ColorHex`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField && linkedField.value !== colorValue) {
      linkedField.value = colorValue;
    }

    // הצג הודעת מידע
    const colorLabel = getColorTypeLabel(colorType, intensity);
    showPreferencesInfo('צבעים', `${colorLabel} עודכן`);

  } catch (error) {
    console.error('שגיאה בעדכון צבע ערך מספרי:', error);
    showPreferencesError('שגיאה', 'לא ניתן לעדכן את הצבע');
  }
}

/**
 * עדכון צבע ערך מספרי מ-hex
 */
function updateNumericValueColorFromHex(colorType, intensity, hexValue) {
  try {
    // בדיקת תקינות ה-hex
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      showPreferencesError('שגיאה', 'ערך hex לא תקין (נדרש: #RRGGBB)');
      return;
    }

    // עדכון הצבע
    updateNumericValueColor(colorType, intensity, hexValue);

    // עדכון השדה המקושר (אם קיים)
    const linkedFieldId = `${colorType}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}Color`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField && linkedField.value !== hexValue) {
      linkedField.value = hexValue;
    }

  } catch (error) {
    console.error('שגיאה בעדכון צבע ערך מספרי מ-hex:', error);
    showPreferencesError('שגיאה', 'לא ניתן לעדכן את הצבע');
  }
}

/**
 * איפוס צבעים לברירת המחדל
 */
function resetNumericValueColors() {
  try {
    // איפוס הצבעים לברירת המחדל
    currentPreferences.numericValueColors = { ...DEFAULT_PREFERENCES.numericValueColors };

    // עדכון הצבעים במערכת הצבעים הגלובלית
    if (window.updateNumericValueColors) {
      window.updateNumericValueColors(currentPreferences.numericValueColors);
    }

    // עדכון הממשק
    updateNumericValueColorsUI();

    // הצג הודעת מידע
    showPreferencesInfo('צבעים', 'הצבעים אופסו לברירת המחדל');

  } catch (error) {
    console.error('שגיאה באיפוס צבעים:', error);
    showPreferencesError('שגיאה', 'לא ניתן לאפס את הצבעים');
  }
}

/**
 * עדכון ממשק הצבעים המספריים
 */
function updateNumericValueColorsUI() {
  try {
    const colors = currentPreferences.numericValueColors || DEFAULT_PREFERENCES.numericValueColors;

    // עדכון צבעי ערכים חיוביים
    if (colors.positive) {
      const positiveTextColor = document.getElementById('positiveTextColor');
      const positiveTextColorHex = document.getElementById('positiveTextColorHex');
      const positiveBackgroundColor = document.getElementById('positiveBackgroundColor');
      const positiveBackgroundColorHex = document.getElementById('positiveBackgroundColorHex');

      if (positiveTextColor) { positiveTextColor.value = colors.positive.medium; }
      if (positiveTextColorHex) { positiveTextColorHex.value = colors.positive.medium; }
      if (positiveBackgroundColor) { positiveBackgroundColor.value = colors.positive.light; }
      if (positiveBackgroundColorHex) { positiveBackgroundColorHex.value = colors.positive.light; }
    }

    // עדכון צבעי ערכים שליליים
    if (colors.negative) {
      const negativeTextColor = document.getElementById('negativeTextColor');
      const negativeTextColorHex = document.getElementById('negativeTextColorHex');
      const negativeBackgroundColor = document.getElementById('negativeBackgroundColor');
      const negativeBackgroundColorHex = document.getElementById('negativeBackgroundColorHex');

      if (negativeTextColor) { negativeTextColor.value = colors.negative.medium; }
      if (negativeTextColorHex) { negativeTextColorHex.value = colors.negative.medium; }
      if (negativeBackgroundColor) { negativeBackgroundColor.value = colors.negative.light; }
      if (negativeBackgroundColorHex) { negativeBackgroundColorHex.value = colors.negative.light; }
    }

    // עדכון צבעי ערך אפס
    if (colors.zero) {
      const zeroTextColor = document.getElementById('zeroTextColor');
      const zeroTextColorHex = document.getElementById('zeroTextColorHex');
      const zeroBackgroundColor = document.getElementById('zeroBackgroundColor');
      const zeroBackgroundColorHex = document.getElementById('zeroBackgroundColorHex');

      if (zeroTextColor) { zeroTextColor.value = colors.zero.medium; }
      if (zeroTextColorHex) { zeroTextColorHex.value = colors.zero.medium; }
      if (zeroBackgroundColor) { zeroBackgroundColor.value = colors.zero.light; }
      if (zeroBackgroundColorHex) { zeroBackgroundColorHex.value = colors.zero.light; }
    }

  } catch (error) {
    console.error('שגיאה בעדכון ממשק הצבעים המספריים:', error);
  }
}

/**
 * קבלת תווית צבע
 */
function getColorTypeLabel(colorType, intensity) {
  const typeLabels = {
    positive: 'ערכים חיוביים',
    negative: 'ערכים שליליים',
    zero: 'ערך אפס',
  };

  const intensityLabels = {
    light: 'רקע',
    medium: 'טקסט',
    dark: 'כהה',
    border: 'גבול',
  };

  return `${typeLabels[colorType] || colorType} - ${intensityLabels[intensity] || intensity}`;
}

// ========================================
// 🏷️ פונקציות ניהול צבעי ישויות
// ========================================

/**
 * עדכון צבע ישות
 */
function updateEntityColor(entityType, colorValue) {
  try {
    // בדיקת תקינות הפרמטרים
    if (!entityType || !colorValue) {
      showPreferencesError('שגיאה', 'חסרים פרמטרים לעדכון הצבע');
      return;
    }

    // וידוא שהצבעים מאותחלים
    if (!currentPreferences.entityColors) {
      currentPreferences.entityColors = { ...DEFAULT_PREFERENCES.entityColors };
    }

    // עדכון הצבע
    currentPreferences.entityColors[entityType] = colorValue;

    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.updateEntityColors) {
      window.updateEntityColors(currentPreferences.entityColors);
    }

    // עדכון השדה המקושר (אם קיים)
    const linkedFieldId = `entity${entityType.charAt(0).toUpperCase() + entityType.slice(1).replace('_', '')}ColorHex`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField && linkedField.value !== colorValue) {
      linkedField.value = colorValue;
    }

    // הצג הודעת מידע
    const entityLabel = getEntityLabel(entityType);
    showPreferencesInfo('צבעי ישויות', `צבע ${entityLabel} עודכן`);

  } catch (error) {
    console.error('שגיאה בעדכון צבע ישות:', error);
    showPreferencesError('שגיאה', 'לא ניתן לעדכן את הצבע');
  }
}

/**
 * עדכון צבע ישות מ-hex
 */
function updateEntityColorFromHex(entityType, hexValue) {
  try {
    // בדיקת תקינות ה-hex
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      showPreferencesError('שגיאה', 'ערך hex לא תקין (נדרש: #RRGGBB)');
      return;
    }

    // עדכון הצבע
    updateEntityColor(entityType, hexValue);

  } catch (error) {
    console.error('שגיאה בעדכון צבע ישות מ-hex:', error);
    showPreferencesError('שגיאה', 'לא ניתן לעדכן את הצבע');
  }
}

/**
 * איפוס צבעי ישויות לברירת המחדל
 */
function resetEntityColors() {
  try {
    // איפוס הצבעים לברירת המחדל
    currentPreferences.entityColors = { ...DEFAULT_PREFERENCES.entityColors };

    // עדכון הצבעים במערכת הצבעים הגלובלית
    if (window.resetEntityColors) {
      window.resetEntityColors();
    }

    // עדכון הממשק
    updateEntityColorsUI();

    // הצג הודעת מידע
    showPreferencesInfo('צבעי ישויות', 'צבעי הישויות אופסו לברירת המחדל');

  } catch (error) {
    console.error('שגיאה באיפוס צבעי ישויות:', error);
    showPreferencesError('שגיאה', 'לא ניתן לאפס את צבעי הישויות');
  }
}

/**
 * עדכון ממשק צבעי הישויות
 */
function updateEntityColorsUI() {
  try {
    const colors = currentPreferences.entityColors || DEFAULT_PREFERENCES.entityColors;

    // עדכון צבעי טריידים ותכנונים
    if (colors.trade) {
      const tradeColor = document.getElementById('entityTradeColor');
      const tradeColorHex = document.getElementById('entityTradeColorHex');
      if (tradeColor) { tradeColor.value = colors.trade; }
      if (tradeColorHex) { tradeColorHex.value = colors.trade; }
    }

    if (colors.trade_plan) {
      const tradePlanColor = document.getElementById('entityTradePlanColor');
      const tradePlanColorHex = document.getElementById('entityTradePlanColorHex');
      if (tradePlanColor) { tradePlanColor.value = colors.trade_plan; }
      if (tradePlanColorHex) { tradePlanColorHex.value = colors.trade_plan; }
    }

    if (colors.execution) {
      const executionColor = document.getElementById('entityExecutionColor');
      const executionColorHex = document.getElementById('entityExecutionColorHex');
      if (executionColor) { executionColor.value = colors.execution; }
      if (executionColorHex) { executionColorHex.value = colors.execution; }
    }

    // עדכון צבעי חשבונות ותזרים מזומנים
    if (colors.account) {
      const accountColor = document.getElementById('entityAccountColor');
      const accountColorHex = document.getElementById('entityAccountColorHex');
      if (accountColor) { accountColor.value = colors.account; }
      if (accountColorHex) { accountColorHex.value = colors.account; }
    }

    if (colors.cash_flow) {
      const cashFlowColor = document.getElementById('entityCashFlowColor');
      const cashFlowColorHex = document.getElementById('entityCashFlowColorHex');
      if (cashFlowColor) { cashFlowColor.value = colors.cash_flow; }
      if (cashFlowColorHex) { cashFlowColorHex.value = colors.cash_flow; }
    }

    // עדכון צבעי טיקרים והתראות
    if (colors.ticker) {
      const tickerColor = document.getElementById('entityTickerColor');
      const tickerColorHex = document.getElementById('entityTickerColorHex');
      if (tickerColor) { tickerColor.value = colors.ticker; }
      if (tickerColorHex) { tickerColorHex.value = colors.ticker; }
    }

    if (colors.alert) {
      const alertColor = document.getElementById('entityAlertColor');
      const alertColorHex = document.getElementById('entityAlertColorHex');
      if (alertColor) { alertColor.value = colors.alert; }
      if (alertColorHex) { alertColorHex.value = colors.alert; }
    }

    // עדכון צבעי הערות ואילוצים
    if (colors.note) {
      const noteColor = document.getElementById('entityNoteColor');
      const noteColorHex = document.getElementById('entityNoteColorHex');
      if (noteColor) { noteColor.value = colors.note; }
      if (noteColorHex) { noteColorHex.value = colors.note; }
    }

    if (colors.constraint) {
      const constraintColor = document.getElementById('entityConstraintColor');
      const constraintColorHex = document.getElementById('entityConstraintColorHex');
      if (constraintColor) { constraintColor.value = colors.constraint; }
      if (constraintColorHex) { constraintColorHex.value = colors.constraint; }
    }

    // עדכון צבעי עיצוב ומחקר
    if (colors.design) {
      const designColor = document.getElementById('entityDesignColor');
      const designColorHex = document.getElementById('entityDesignColorHex');
      if (designColor) { designColor.value = colors.design; }
      if (designColorHex) { designColorHex.value = colors.design; }
    }

    if (colors.research) {
      const researchColor = document.getElementById('entityResearchColor');
      const researchColorHex = document.getElementById('entityResearchColorHex');
      if (researchColor) { researchColor.value = colors.research; }
      if (researchColorHex) { researchColorHex.value = colors.research; }
    }

    if (colors.preference) {
      const preferenceColor = document.getElementById('entityPreferenceColor');
      const preferenceColorHex = document.getElementById('entityPreferenceColorHex');
      if (preferenceColor) { preferenceColor.value = colors.preference; }
      if (preferenceColorHex) { preferenceColorHex.value = colors.preference; }
    }

  } catch (error) {
    console.error('שגיאה בעדכון ממשק צבעי ישויות:', error);
  }
}

/**
 * קבלת תווית ישות בעברית
 */
function getEntityLabel(entityType) {
  const labels = {
    trade: 'טריידים',
    trade_plan: 'תכנוני השקעה',
    execution: 'עסקאות',
    account: 'חשבונות',
    cash_flow: 'תזרים מזומנים',
    ticker: 'טיקרים',
    alert: 'התראות',
    note: 'הערות',
    constraint: 'אילוצים',
    design: 'עיצובים',
    research: 'מחקר',
    preference: 'העדפות',
  };
  return labels[entityType] || entityType;
}

// Export numeric value color functions
window.updateNumericValueColor = updateNumericValueColor;
window.updateNumericValueColorFromHex = updateNumericValueColorFromHex;
window.resetNumericValueColors = resetNumericValueColors;
window.updateNumericValueColorsUI = updateNumericValueColorsUI;

// Export entity color functions
window.updateEntityColor = updateEntityColor;
window.updateEntityColorFromHex = updateEntityColorFromHex;
window.resetEntityColors = resetEntityColors;
window.updateEntityColorsUI = updateEntityColorsUI;

// ===== HEADER OPACITY FUNCTIONS =====
// פונקציות לשקיפות כותרות

// דגל למניעת לולאה אינסופית
let isUpdatingHeaderOpacity = false;

/**
 * עדכון שקיפות כותרת
 * Update header opacity
 */
function updateHeaderOpacity(headerType, opacityValue) {
  try {
    // מניעת לולאה אינסופית
    if (isUpdatingHeaderOpacity) {
      return;
    }
    
    isUpdatingHeaderOpacity = true;
    
    console.log(`🎭 מעדכן שקיפות כותרת ${headerType} ל-${opacityValue}%`);
    
    // עדכון הערך המוצג
    const valueElement = document.getElementById(`${headerType}HeaderOpacityValue`);
    if (valueElement) {
      valueElement.textContent = `${opacityValue}%`;
    }
    
    // עדכון תצוגה מקדימה
    updateHeaderOpacityPreview(headerType, opacityValue);
    
    // שמירת העדפה
    if (!currentPreferences.headerOpacity) {
      currentPreferences.headerOpacity = {};
    }
    currentPreferences.headerOpacity[headerType] = parseInt(opacityValue);
    
    // עדכון CSS דינמי
    updateHeaderOpacityCSS(headerType, opacityValue);
    
    // שמירה אוטומטית של ההעדפות
    saveAllPreferences().catch(error => {
      console.error(`❌ שגיאה בשמירת שקיפות כותרת ${headerType}:`, error);
    }).finally(() => {
      // שחרור הדגל אחרי השמירה
      setTimeout(() => {
        isUpdatingHeaderOpacity = false;
      }, 100);
    });
    
    console.log(`✅ שקיפות כותרת ${headerType} עודכנה ל-${opacityValue}%`);
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון שקיפות כותרת ${headerType}:`, error);
    showPreferencesError('שגיאה', `לא ניתן לעדכן שקיפות כותרת ${headerType}`);
    isUpdatingHeaderOpacity = false;
  }
}

/**
 * עדכון תצוגה מקדימה של שקיפות
 * Update header opacity preview
 */
function updateHeaderOpacityPreview(headerType, opacityValue) {
  try {
    const previewElement = document.getElementById(`${headerType}HeaderPreview`);
    if (!previewElement) return;
    
    // צבע דוגמה (כחול טורקיז)
    const baseColor = '23, 162, 184'; // #17a2b8
    const opacity = opacityValue / 100;
    
    previewElement.style.backgroundColor = `rgba(${baseColor}, ${opacity})`;
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון תצוגה מקדימה:`, error);
  }
}

/**
 * עדכון CSS דינמי לשקיפות כותרות
 * Update dynamic CSS for header opacity
 */
function updateHeaderOpacityCSS(headerType, opacityValue) {
  try {
    // המרת אחוזים לערך hex
    const opacityHex = Math.round(opacityValue * 255 / 100).toString(16).padStart(2, '0');
    
    // עדכון CSS Variables
    if (headerType === 'main') {
      document.documentElement.style.setProperty('--header-main-opacity', opacityHex);
    } else if (headerType === 'sub') {
      document.documentElement.style.setProperty('--header-sub-opacity', opacityHex);
    }
    
    // עדכון מחלקות CSS קיימות
    updateEntityHeaderCSS();
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון CSS דינמי:`, error);
  }
}

/**
 * עדכון מחלקות CSS של כותרות ישויות
 * Update entity header CSS classes
 */
function updateEntityHeaderCSS() {
  try {
    if (!window.generateEntityCSS) return;
    
    // יצירת CSS חדש עם השקיפות המעודכנות
    const newCSS = window.generateEntityCSS();
    
    // עדכון אלמנט ה-CSS
    let styleElement = document.getElementById('dynamic-entity-colors');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-entity-colors';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = newCSS;
    
  } catch (error) {
    console.error('❌ שגיאה בעדכון CSS כותרות ישויות:', error);
  }
}

/**
 * יישום שקיפות על כל העמודים
 * Apply opacity to all pages
 */
function applyHeaderOpacityToAllPages() {
  try {
    console.log('🎭 מיישם שקיפות כותרות על כל העמודים...');
    
    // קבלת העדפות השקיפות
    const mainOpacity = currentPreferences.headerOpacity?.main || 60;
    const subOpacity = currentPreferences.headerOpacity?.sub || 30;
    
    // עדכון CSS דינמי
    updateHeaderOpacityCSS('main', mainOpacity);
    updateHeaderOpacityCSS('sub', subOpacity);
    
    // יישום על כותרות קיימות
    if (window.applyEntityColorsToHeaders) {
      // יישום על כל סוגי הישויות
      const entityTypes = ['execution', 'trade', 'account', 'ticker', 'alert'];
      entityTypes.forEach(entityType => {
        window.applyEntityColorsToHeaders(entityType);
      });
    }
    
    showPreferencesInfo('שקיפות כותרות', 'השקיפות יושמה על כל העמודים');
    
  } catch (error) {
    console.error('❌ שגיאה ביישום שקיפות על כל העמודים:', error);
    showPreferencesError('שגיאה', 'לא ניתן ליישם שקיפות על כל העמודים');
  }
}

/**
 * טעינת העדפות שקיפות
 * Load header opacity preferences
 */
function loadHeaderOpacityPreferences() {
  try {
    // מניעת עדכון אם אנחנו באמצע עדכון ידני
    if (isUpdatingHeaderOpacity) {
      return;
    }
    
    const mainOpacity = currentPreferences.headerOpacity?.main || 60;
    const subOpacity = currentPreferences.headerOpacity?.sub || 30;
    
    // עדכון ממשק המשתמש
    const mainSlider = document.getElementById('mainHeaderOpacity');
    const subSlider = document.getElementById('subHeaderOpacity');
    
    if (mainSlider) {
      mainSlider.value = mainOpacity;
      // עדכון ממשק ללא שמירה (רק בטעינה)
      updateHeaderOpacityUI('main', mainOpacity);
    }
    
    if (subSlider) {
      subSlider.value = subOpacity;
      // עדכון ממשק ללא שמירה (רק בטעינה)
      updateHeaderOpacityUI('sub', subOpacity);
    }
    
  } catch (error) {
    console.error('❌ שגיאה בטעינת העדפות שקיפות:', error);
  }
}

/**
 * עדכון ממשק שקיפות כותרת ללא שמירה
 * Update header opacity UI without saving
 */
function updateHeaderOpacityUI(headerType, opacityValue) {
  try {
    // עדכון הערך המוצג
    const valueElement = document.getElementById(`${headerType}HeaderOpacityValue`);
    if (valueElement) {
      valueElement.textContent = `${opacityValue}%`;
    }
    
    // עדכון תצוגה מקדימה
    updateHeaderOpacityPreview(headerType, opacityValue);
    
    // עדכון CSS דינמי
    updateHeaderOpacityCSS(headerType, opacityValue);
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון ממשק שקיפות כותרת ${headerType}:`, error);
  }
}

// ===== STATUS COLOR FUNCTIONS =====
// פונקציות לצבעי סטטוסים

/**
 * המרת hex ל-rgba עם שקיפות
 * Convert hex to rgba with opacity
 */
function hexToRgba(hex, opacity = 0.1) {
  try {
    // אם זה כבר rgba, החזר כפי שהוא
    if (hex.includes('rgba')) {
      return hex;
    }
    
    // הסרת # אם קיים
    hex = hex.replace('#', '');
    
    // המרה ל-rgb
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    
  } catch (error) {
    console.error('❌ שגיאה בהמרת hex ל-rgba:', error);
    return hex; // החזר את הערך המקורי
  }
}

/**
 * עדכון צבע סטטוס לפי עוצמה
 * Update status color by intensity
 */
function updateStatusColorIntensity(status, intensity, colorValue) {
  try {
    console.log(`🏷️ מעדכן צבע סטטוס ${status} (${intensity}) ל-${colorValue}`);
    
    // וידוא שהצבעים מאותחלים
    if (!currentPreferences.statusColors) {
      currentPreferences.statusColors = {};
    }
    if (!currentPreferences.statusColors[status]) {
      currentPreferences.statusColors[status] = {};
    }
    
    // המרת hex ל-rgba לפי העוצמה
    let finalColorValue = colorValue;
    if (colorValue.startsWith('#')) {
      if (intensity === 'light') {
        finalColorValue = hexToRgba(colorValue, 0.1);
      } else if (intensity === 'border') {
        finalColorValue = hexToRgba(colorValue, 0.3);
      }
      // medium ו-dark נשארים hex
    }
    
    // עדכון הצבע
    currentPreferences.statusColors[status][intensity] = finalColorValue;
    
    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.STATUS_COLORS && window.STATUS_COLORS[status]) {
      window.STATUS_COLORS[status][intensity] = finalColorValue;
    }
    
    // עדכון השדה המקושר
    const linkedFieldId = `status${status.charAt(0).toUpperCase() + status.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}ColorHex`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField) {
      linkedField.value = finalColorValue;
    }
    
    // עדכון CSS דינמי
    if (window.generateStatusCSS) {
      const newCSS = window.generateStatusCSS();
      let styleElement = document.getElementById('dynamic-status-colors');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-status-colors';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = newCSS;
    }
    
    showPreferencesInfo('צבע סטטוס', `צבע הסטטוס ${status} (${intensity}) עודכן`);
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון צבע סטטוס ${status} (${intensity}):`, error);
    showPreferencesError('שגיאה', `לא ניתן לעדכן צבע סטטוס ${status} (${intensity})`);
  }
}

/**
 * עדכון צבע סטטוס מ-hex לפי עוצמה
 * Update status color from hex by intensity
 */
function updateStatusColorIntensityFromHex(status, intensity, hexValue) {
  try {
    // בדיקת תקינות ה-hex
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      showPreferencesError('שגיאה', 'ערך hex לא תקין (נדרש: #RRGGBB)');
      return;
    }

    // עדכון הצבע
    updateStatusColorIntensity(status, intensity, hexValue);

    // עדכון השדה המקושר
    const linkedFieldId = `status${status.charAt(0).toUpperCase() + status.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}Color`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField && linkedField.value !== hexValue) {
      linkedField.value = hexValue;
    }

  } catch (error) {
    console.error(`❌ שגיאה בעדכון צבע סטטוס ${status} (${intensity}) מ-hex:`, error);
    showPreferencesError('שגיאה', `לא ניתן לעדכן צבע סטטוס ${status} (${intensity})`);
  }
}

/**
 * איפוס צבעי סטטוסים לברירת המחדל
 * Reset status colors to default
 */
function resetStatusColors() {
  try {
    console.log('🏷️ מאפס צבעי סטטוסים לברירת המחדל...');
    
    // איפוס הצבעים לברירת המחדל
    currentPreferences.statusColors = { ...DEFAULT_PREFERENCES.statusColors };
    
    // עדכון הצבעים במערכת הצבעים הגלובלית
    if (window.STATUS_COLORS) {
      Object.assign(window.STATUS_COLORS, currentPreferences.statusColors);
    }
    
    // עדכון הממשק
    updateStatusColorsUI();
    
    // עדכון CSS דינמי
    if (window.generateStatusCSS) {
      const newCSS = window.generateStatusCSS();
      let styleElement = document.getElementById('dynamic-status-colors');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-status-colors';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = newCSS;
    }
    
    showPreferencesInfo('צבעי סטטוסים', 'צבעי הסטטוסים אופסו לברירת המחדל');
    
  } catch (error) {
    console.error('❌ שגיאה באיפוס צבעי סטטוסים:', error);
    showPreferencesError('שגיאה', 'לא ניתן לאפס את צבעי הסטטוסים');
  }
}

/**
 * המרת rgba ל-hex
 * Convert rgba to hex
 */
function rgbaToHex(rgba) {
  try {
    // אם זה כבר hex, החזר כפי שהוא
    if (rgba.startsWith('#')) {
      return rgba;
    }
    
    // חילוץ ערכי rgba
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) {
      return '#000000'; // ברירת מחדל
    }
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // המרה ל-hex
    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
  } catch (error) {
    console.error('❌ שגיאה בהמרת rgba ל-hex:', error);
    return '#000000';
  }
}

/**
 * עדכון ממשק צבעי הסטטוסים
 * Update status colors UI
 */
function updateStatusColorsUI() {
  try {
    const colors = currentPreferences.statusColors || DEFAULT_PREFERENCES.statusColors;
    
    // עדכון צבעי סטטוסים
    Object.keys(colors).forEach(status => {
      const statusColors = colors[status];
      Object.keys(statusColors).forEach(intensity => {
        const colorInput = document.getElementById(`status${status.charAt(0).toUpperCase() + status.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}Color`);
        const colorHexInput = document.getElementById(`status${status.charAt(0).toUpperCase() + status.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}ColorHex`);
        
        if (colorInput) {
          // המרת rgba ל-hex עבור color input
          const hexValue = rgbaToHex(statusColors[intensity]);
          colorInput.value = hexValue;
        }
        if (colorHexInput) {
          // שמירת הערך המקורי (rgba) בשדה הטקסט
          colorHexInput.value = statusColors[intensity];
        }
      });
    });
    
  } catch (error) {
    console.error('❌ שגיאה בעדכון ממשק צבעי סטטוסים:', error);
  }
}

// Export header opacity functions
window.updateHeaderOpacity = updateHeaderOpacity;
window.updateHeaderOpacityUI = updateHeaderOpacityUI;
window.applyHeaderOpacityToAllPages = applyHeaderOpacityToAllPages;
window.loadHeaderOpacityPreferences = loadHeaderOpacityPreferences;

// ===== INVESTMENT TYPE COLOR FUNCTIONS =====
// פונקציות לצבעי סוגי השקעה

/**
 * עדכון צבע סוג השקעה לפי עוצמה
 * Update investment type color by intensity
 */
function updateInvestmentTypeColorIntensity(type, intensity, colorValue) {
  try {
    console.log(`📊 מעדכן צבע סוג השקעה ${type} (${intensity}) ל-${colorValue}`);
    
    // וידוא שהצבעים מאותחלים
    if (!currentPreferences.investmentTypeColors) {
      currentPreferences.investmentTypeColors = {};
    }
    if (!currentPreferences.investmentTypeColors[type]) {
      currentPreferences.investmentTypeColors[type] = {};
    }
    
    // המרת hex ל-rgba לפי העוצמה
    let finalColorValue = colorValue;
    if (colorValue.startsWith('#')) {
      if (intensity === 'light') {
        finalColorValue = hexToRgba(colorValue, 0.1);
      } else if (intensity === 'border') {
        finalColorValue = hexToRgba(colorValue, 0.3);
      }
      // medium ו-dark נשארים hex
    }
    
    // עדכון הצבע
    currentPreferences.investmentTypeColors[type][intensity] = finalColorValue;
    
    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.INVESTMENT_TYPE_COLORS && window.INVESTMENT_TYPE_COLORS[type]) {
      window.INVESTMENT_TYPE_COLORS[type][intensity] = finalColorValue;
    }
    
    // עדכון השדה המקושר
    const linkedFieldId = `investmentType${type.charAt(0).toUpperCase() + type.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}ColorHex`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField) {
      linkedField.value = finalColorValue;
    }
    
    // עדכון CSS דינמי
    if (window.generateInvestmentTypeCSS) {
      const newCSS = window.generateInvestmentTypeCSS();
      let styleElement = document.getElementById('dynamic-investment-type-colors');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-investment-type-colors';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = newCSS;
    }
    
    showPreferencesInfo('צבע סוג השקעה', `צבע סוג השקעה ${type} (${intensity}) עודכן`);
    
  } catch (error) {
    console.error(`❌ שגיאה בעדכון צבע סוג השקעה ${type} (${intensity}):`, error);
    showPreferencesError('שגיאה', `לא ניתן לעדכן צבע סוג השקעה ${type} (${intensity})`);
  }
}

/**
 * עדכון צבע סוג השקעה מ-hex לפי עוצמה
 * Update investment type color from hex by intensity
 */
function updateInvestmentTypeColorIntensityFromHex(type, intensity, hexValue) {
  try {
    // בדיקת תקינות ה-hex
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      showPreferencesError('שגיאה', 'ערך hex לא תקין (נדרש: #RRGGBB)');
      return;
    }

    // עדכון הצבע
    updateInvestmentTypeColorIntensity(type, intensity, hexValue);

    // עדכון השדה המקושר
    const linkedFieldId = `investmentType${type.charAt(0).toUpperCase() + type.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}Color`;
    const linkedField = document.getElementById(linkedFieldId);
    if (linkedField && linkedField.value !== hexValue) {
      linkedField.value = hexValue;
    }

  } catch (error) {
    console.error(`❌ שגיאה בעדכון צבע סוג השקעה ${type} (${intensity}) מ-hex:`, error);
    showPreferencesError('שגיאה', `לא ניתן לעדכן צבע סוג השקעה ${type} (${intensity})`);
  }
}

/**
 * איפוס צבעי סוגי השקעה לברירת המחדל
 * Reset investment type colors to default
 */
function resetInvestmentTypeColors() {
  try {
    console.log('📊 מאפס צבעי סוגי השקעה לברירת המחדל...');
    
    // איפוס הצבעים לברירת המחדל
    currentPreferences.investmentTypeColors = { ...DEFAULT_PREFERENCES.investmentTypeColors };
    
    // עדכון הצבעים במערכת הצבעים הגלובלית
    if (window.INVESTMENT_TYPE_COLORS) {
      Object.assign(window.INVESTMENT_TYPE_COLORS, currentPreferences.investmentTypeColors);
    }
    
    // עדכון הממשק
    updateInvestmentTypeColorsUI();
    
    // עדכון CSS דינמי
    if (window.generateInvestmentTypeCSS) {
      const newCSS = window.generateInvestmentTypeCSS();
      let styleElement = document.getElementById('dynamic-investment-type-colors');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-investment-type-colors';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = newCSS;
    }
    
    showPreferencesInfo('צבעי סוגי השקעה', 'צבעי סוגי השקעה אופסו לברירת המחדל');
    
  } catch (error) {
    console.error('❌ שגיאה באיפוס צבעי סוגי השקעה:', error);
    showPreferencesError('שגיאה', 'לא ניתן לאפס את צבעי סוגי השקעה');
  }
}

/**
 * עדכון ממשק צבעי סוגי השקעה
 * Update investment type colors UI
 */
function updateInvestmentTypeColorsUI() {
  try {
    const colors = currentPreferences.investmentTypeColors || DEFAULT_PREFERENCES.investmentTypeColors;
    
    // עדכון צבעי סוגי השקעה
    Object.keys(colors).forEach(type => {
      const typeColors = colors[type];
      Object.keys(typeColors).forEach(intensity => {
        const colorInput = document.getElementById(`investmentType${type.charAt(0).toUpperCase() + type.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}Color`);
        const colorHexInput = document.getElementById(`investmentType${type.charAt(0).toUpperCase() + type.slice(1)}${intensity.charAt(0).toUpperCase() + intensity.slice(1)}ColorHex`);
        
        if (colorInput) {
          // המרת rgba ל-hex עבור color input
          const hexValue = rgbaToHex(typeColors[intensity]);
          colorInput.value = hexValue;
        }
        if (colorHexInput) {
          // שמירת הערך המקורי (rgba) בשדה הטקסט
          colorHexInput.value = typeColors[intensity];
        }
      });
    });
    
  } catch (error) {
    console.error('❌ שגיאה בעדכון ממשק צבעי סוגי השקעה:', error);
  }
}

// Export status color functions
window.updateStatusColorIntensity = updateStatusColorIntensity;
window.updateStatusColorIntensityFromHex = updateStatusColorIntensityFromHex;
window.resetStatusColors = resetStatusColors;
window.updateStatusColorsUI = updateStatusColorsUI;

// Export investment type color functions
window.updateInvestmentTypeColorIntensity = updateInvestmentTypeColorIntensity;
window.updateInvestmentTypeColorIntensityFromHex = updateInvestmentTypeColorIntensityFromHex;
window.resetInvestmentTypeColors = resetInvestmentTypeColors;
window.updateInvestmentTypeColorsUI = updateInvestmentTypeColorsUI;

// Export utility functions
window.rgbaToHex = rgbaToHex;
window.hexToRgba = hexToRgba;

// Export validation functions
window.validateAllPreferencesSaved = validateAllPreferencesSaved;
window.quickPreferencesCheck = quickPreferencesCheck;

// ===== VALIDATION AND TESTING FUNCTIONS =====
// פונקציות לבדיקה ואימות

/**
 * בדיקה חוזרת שכל השדות נשמרים
 * Comprehensive validation that all fields are saved
 */
function validateAllPreferencesSaved() {
  try {
    console.log('🔍 מתחיל בדיקה חוזרת של כל ההעדפות...');
    
    const validationResults = {
      headerOpacity: false,
      statusColors: false,
      investmentTypeColors: false,
      entityColors: false,
      numericValueColors: false,
      basicPreferences: false
    };
    
    // בדיקת שקיפות כותרות
    if (currentPreferences.headerOpacity && 
        currentPreferences.headerOpacity.main && 
        currentPreferences.headerOpacity.sub) {
      validationResults.headerOpacity = true;
      console.log('✅ שקיפות כותרות נשמרה:', currentPreferences.headerOpacity);
    } else {
      console.log('❌ שקיפות כותרות לא נשמרה');
    }
    
    // בדיקת צבעי סטטוסים
    if (currentPreferences.statusColors && 
        currentPreferences.statusColors.open && 
        currentPreferences.statusColors.closed && 
        currentPreferences.statusColors.cancelled) {
      validationResults.statusColors = true;
      console.log('✅ צבעי סטטוסים נשמרו:', currentPreferences.statusColors);
    } else {
      console.log('❌ צבעי סטטוסים לא נשמרו');
    }
    
    // בדיקת צבעי סוגי השקעה
    if (currentPreferences.investmentTypeColors && 
        currentPreferences.investmentTypeColors.swing && 
        currentPreferences.investmentTypeColors.investment && 
        currentPreferences.investmentTypeColors.passive) {
      validationResults.investmentTypeColors = true;
      console.log('✅ צבעי סוגי השקעה נשמרו:', currentPreferences.investmentTypeColors);
    } else {
      console.log('❌ צבעי סוגי השקעה לא נשמרו');
    }
    
    // בדיקת צבעי ישויות
    if (currentPreferences.entityColors && 
        Object.keys(currentPreferences.entityColors).length > 0) {
      validationResults.entityColors = true;
      console.log('✅ צבעי ישויות נשמרו:', currentPreferences.entityColors);
    } else {
      console.log('❌ צבעי ישויות לא נשמרו');
    }
    
    // בדיקת צבעי ערכים מספריים
    if (currentPreferences.numericValueColors && 
        currentPreferences.numericValueColors.positive && 
        currentPreferences.numericValueColors.negative && 
        currentPreferences.numericValueColors.zero) {
      validationResults.numericValueColors = true;
      console.log('✅ צבעי ערכים מספריים נשמרו:', currentPreferences.numericValueColors);
    } else {
      console.log('❌ צבעי ערכים מספריים לא נשמרו');
    }
    
    // בדיקת העדפות בסיסיות
    if (currentPreferences.primaryCurrency && 
        currentPreferences.timezone && 
        currentPreferences.defaultStopLoss !== undefined) {
      validationResults.basicPreferences = true;
      console.log('✅ העדפות בסיסיות נשמרו');
    } else {
      console.log('❌ העדפות בסיסיות לא נשמרו');
    }
    
    // סיכום התוצאות
    const totalChecks = Object.keys(validationResults).length;
    const passedChecks = Object.values(validationResults).filter(Boolean).length;
    
    console.log(`📊 תוצאות הבדיקה: ${passedChecks}/${totalChecks} בדיקות עברו`);
    
    if (passedChecks === totalChecks) {
      console.log('🎉 כל ההעדפות נשמרו בהצלחה!');
      showPreferencesSuccess('בדיקה הושלמה', 'כל ההעדפות נשמרו בהצלחה!');
    } else {
      console.log('⚠️ חלק מההעדפות לא נשמרו');
      showPreferencesWarning('בדיקה הושלמה', `רק ${passedChecks}/${totalChecks} העדפות נשמרו`);
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ שגיאה בבדיקת ההעדפות:', error);
    showPreferencesError('שגיאה', 'שגיאה בבדיקת ההעדפות');
    return null;
  }
}

/**
 * בדיקה מהירה של שמירת העדפות
 * Quick check for preferences saving
 */
function quickPreferencesCheck() {
  try {
    console.log('⚡ בדיקה מהירה של העדפות...');
    
    const missingFields = [];
    
    if (!currentPreferences.headerOpacity) missingFields.push('headerOpacity');
    if (!currentPreferences.statusColors) missingFields.push('statusColors');
    if (!currentPreferences.investmentTypeColors) missingFields.push('investmentTypeColors');
    
    if (missingFields.length === 0) {
      console.log('✅ כל ההעדפות החדשות קיימות');
      return true;
    } else {
      console.log('❌ חסרים שדות:', missingFields);
      return false;
    }
    
  } catch (error) {
    console.error('❌ שגיאה בבדיקה מהירה:', error);
    return false;
  }
}

// אתחול העדפות בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
  loadPreferences();
  
  // בדיקה אוטומטית של העדפות אחרי טעינה
  setTimeout(() => {
    console.log('🔍 מבצע בדיקה אוטומטית של העדפות...');
    quickPreferencesCheck();
  }, 2000);
  
  // יישום צבעי ישות על כותרות עמוד העדפות
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('preference');
  }
});
