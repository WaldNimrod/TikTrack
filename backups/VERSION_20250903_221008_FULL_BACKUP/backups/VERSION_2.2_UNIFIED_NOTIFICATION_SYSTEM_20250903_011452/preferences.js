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
  defaultSearchFilter: '',
  // הגדרות נתונים חיצוניים
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
    console.error('שגיאה בטעינת העדפות:', error);
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
    console.error('שגיאה בעדכון העדפה:', error);
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
      const responseData = await response.json();
      showPreferencesSuccess('הצלחה', 'כל ההעדפות נשמרו בהצלחה');

      // הפעל הגדרות קונסול אחרי שמירה מוצלחת
      if (typeof applyConsoleSettings === 'function') {
        applyConsoleSettings();
      }
    } else {
      const errorText = await response.text();
      console.error('שגיאה בשמירת העדפות:', errorText);
      showPreferencesError('שגיאה', `שגיאה בשמירת העדפות: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בשמירת העדפות:', error);
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
        } catch (error) {
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
    accounts.forEach((account, index) => {
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
 * עדכון צבע לערך מספרי
 * @param {string} valueType - סוג הערך (positive, negative, zero)
 * @param {string} colorType - סוג הצבע (light, medium, dark, border)
 * @param {string} colorValue - ערך הצבע החדש
 */
function updateNumericValueColor(valueType, colorType, colorValue) {
  try {
    // עדכון הצבע בהעדפות
    if (!currentPreferences.numericValueColors) {
      currentPreferences.numericValueColors = { ...DEFAULT_PREFERENCES.numericValueColors };
    }

    if (!currentPreferences.numericValueColors[valueType]) {
      currentPreferences.numericValueColors[valueType] = {};
    }

    currentPreferences.numericValueColors[valueType][colorType] = colorValue;

    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.updateNumericValueColors) {
      const newColors = {
        [valueType]: {
          [colorType]: colorValue,
        },
      };
      window.updateNumericValueColors(newColors);
    }

    // עדכון שדה הטקסט המתאים
    const hexInputId = `${valueType}${colorType.charAt(0).toUpperCase() + colorType.slice(1)}ColorHex`;
    const hexInput = document.getElementById(hexInputId);
    if (hexInput) {
      hexInput.value = colorValue;
    }

    // הצג הודעת מידע
    const typeLabels = {
      positive: 'ערכים חיוביים',
      negative: 'ערכים שליליים',
      zero: 'ערך אפס',
    };
    const colorLabels = {
      light: 'רקע',
      medium: 'טקסט',
      dark: 'טקסט כהה',
      border: 'גבול',
    };

    const message = `${typeLabels[valueType]} - ${colorLabels[colorType]} עודכן`;
    showPreferencesInfo('צבעים', message);

  } catch (error) {
    console.error('שגיאה בעדכון צבע:', error);
    showPreferencesError('שגיאה', 'לא ניתן לעדכן את הצבע');
  }
}

/**
 * עדכון צבע מערך hex
 * @param {string} valueType - סוג הערך (positive, negative, zero)
 * @param {string} colorType - סוג הצבע (light, medium, dark, border)
 * @param {string} hexValue - ערך hex החדש
 */
function updateNumericValueColorFromHex(valueType, colorType, hexValue) {
  try {
    // בדיקת תקינות ערך hex
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      showPreferencesError('שגיאה', 'ערך hex לא תקין. השתמש בפורמט #RRGGBB');
      return;
    }

    // עדכון הצבע
    updateNumericValueColor(valueType, colorType, hexValue);

    // עדכון שדה הצבע המתאים
    const colorInputId = `${valueType}${colorType.charAt(0).toUpperCase() + colorType.slice(1)}Color`;
    const colorInput = document.getElementById(colorInputId);
    if (colorInput) {
      colorInput.value = hexValue;
    }

  } catch (error) {
    console.error('שגיאה בעדכון צבע מ-hex:', error);
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
 * עדכון ממשק הצבעים
 */
function updateNumericValueColorsUI() {
  try {
    const colors = currentPreferences.numericValueColors || DEFAULT_PREFERENCES.numericValueColors;

    // עדכון צבעים חיוביים
    if (colors.positive) {
      const positiveTextColor = document.getElementById('positiveTextColor');
      const positiveTextColorHex = document.getElementById('positiveTextColorHex');
      const positiveBackgroundColor = document.getElementById('positiveBackgroundColor');
      const positiveBackgroundColorHex = document.getElementById('positiveBackgroundColorHex');

      if (positiveTextColor) {positiveTextColor.value = colors.positive.medium;}
      if (positiveTextColorHex) {positiveTextColorHex.value = colors.positive.medium;}
      if (positiveBackgroundColor) {positiveBackgroundColor.value = colors.positive.light;}
      if (positiveBackgroundColorHex) {positiveBackgroundColorHex.value = colors.positive.light;}
    }

    // עדכון צבעים שליליים
    if (colors.negative) {
      const negativeTextColor = document.getElementById('negativeTextColor');
      const negativeTextColorHex = document.getElementById('negativeTextColorHex');
      const negativeBackgroundColor = document.getElementById('negativeBackgroundColor');
      const negativeBackgroundColorHex = document.getElementById('negativeBackgroundColorHex');

      if (negativeTextColor) {negativeTextColor.value = colors.negative.medium;}
      if (negativeTextColorHex) {negativeTextColorHex.value = colors.negative.medium;}
      if (negativeBackgroundColor) {negativeBackgroundColor.value = colors.negative.light;}
      if (negativeBackgroundColorHex) {negativeBackgroundColorHex.value = colors.negative.light;}
    }

    // עדכון צבעי אפס
    if (colors.zero) {
      const zeroTextColor = document.getElementById('zeroTextColor');
      const zeroTextColorHex = document.getElementById('zeroTextColorHex');
      const zeroBackgroundColor = document.getElementById('zeroBackgroundColor');
      const zeroBackgroundColorHex = document.getElementById('zeroBackgroundColorHex');

      if (zeroTextColor) {zeroTextColor.value = colors.zero.medium;}
      if (zeroTextColorHex) {zeroTextColorHex.value = colors.zero.medium;}
      if (zeroBackgroundColor) {zeroBackgroundColor.value = colors.zero.light;}
      if (zeroBackgroundColorHex) {zeroBackgroundColorHex.value = colors.zero.light;}
    }

  } catch (error) {
    console.error('שגיאה בעדכון ממשק הצבעים:', error);
  }
}

// Export numeric value color functions
window.updateNumericValueColor = updateNumericValueColor;
window.updateNumericValueColorFromHex = updateNumericValueColorFromHex;
window.resetNumericValueColors = resetNumericValueColors;
window.updateNumericValueColorsUI = updateNumericValueColorsUI;

// ===== Entity Color Management Functions =====
// פונקציות ניהול צבעי ישויות

/**
 * עדכון צבע ישות
 */
function updateEntityColor(entityType, colorValue) {
  try {
    // עדכון הצבע בהעדפות
    if (!currentPreferences.entityColors) {
      currentPreferences.entityColors = {};
    }
    currentPreferences.entityColors[entityType] = colorValue;

    // עדכון הצבע במערכת הצבעים הגלובלית
    if (window.updateEntityColor) {
      window.updateEntityColor(entityType, colorValue);
    }

    // עדכון שדה ה-hex המתאים
    const hexInputId = `entity${entityType.charAt(0).toUpperCase() + entityType.slice(1)}ColorHex`;
    const hexInput = document.getElementById(hexInputId);
    if (hexInput) {
      hexInput.value = colorValue;
    }

    // הצג הודעת מידע
    const entityLabel = getEntityLabel(entityType);
    showPreferencesInfo('צבע ישות', `צבע ${entityLabel} עודכן`);

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

// Export entity color functions
window.updateEntityColor = updateEntityColor;
window.updateEntityColorFromHex = updateEntityColorFromHex;
window.resetEntityColors = resetEntityColors;
window.updateEntityColorsUI = updateEntityColorsUI;
