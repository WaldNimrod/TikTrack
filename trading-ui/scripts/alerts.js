/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 66
 * 
 * PAGE INITIALIZATION (2)
 * - initializeAlertModalTabs() - initializeAlertModalTabs function
 * - initializeAlertConditionBuilder() - * עדכון סטטיסטיקות הערכת תנאים
 * 
 * DATA LOADING (13)
 * - getDemoAlertsData() - getDemoAlertsData function
 * - loadAlertsData() - loadAlertsData function
 * - loadModalData() - loadModalData function
 * - getAlertState() - * עריכת התראה
 * - getStatusClass() - * אישור מחיקת התראה
 * - getRelatedClass() - * פונקציה לסידור טבלת התראות
 * - loadAlerts() - loadAlerts function
 * - loadConditionsFromSource() - loadConditionsFromSource function
 * - loadTradePlansForConditions() - * Load conditions from source type (trade_plan or trade)
 * - loadTradesForConditions() - * Load trade plans for conditions selection
 * - loadConditionsFromItem() - * Load trades for conditions selection
 * - showEvaluationLoading() - showEvaluationLoading function
 * - getMethodIdFromCondition() - getMethodIdFromCondition function
 * 
 * DATA MANIPULATION (15)
 * - updatePageSummaryStats() - updatePageSummaryStats function
 * - updateRadioButtons() - updateRadioButtons function
 * - saveAlert() - * פירוק מחרוזת תנאי התראה
 * - updateStatusAndTriggered() - * בדיקת תקינות שילוב status ו-is_triggered
 * - updateAlert() - updateAlert function
 * - deleteAlertInternal() - deleteAlertInternal function
 * - confirmDeleteAlert() - * מחיקת התראה
 * - updateAlertStatus() - updateAlertStatus function
 * - updateAlertsSummary() - updateAlertsSummary function
 * - createAlertFromCondition() - * Select condition for alert creation
 * - updateModalButtons() - * Initialize tab management for add alert modal
 * - updateEvaluationSummary() - updateEvaluationSummary function
 * - showAddAlertModal() - * ניקוי הממשק המתקדם
 * - saveAlert() - * הצגת מודל הוספת התראה
 * - deleteAlert() - deleteAlert function
 * 
 * EVENT HANDLING (23)
 * - clearAlertValidation() - * עדכון סטטיסטיקות סיכום
 * - onRelationTypeChange() - onRelationTypeChange function
 * - onRelatedObjectChange() - * טיפול בשינוי סוג שיוך
 * - toggleConditionFields() - * טיפול בבחירת אובייקט
 * - enableConditionFields() - enableConditionFields function
 * - disableConditionFields() - * Enable condition fields for add modal
 * - enableEditConditionFields() - * Enable condition fields for add modal
 * - disableEditConditionFields() - * Enable condition fields for add modal
 * - onEditRelationTypeChange() - onEditRelationTypeChange function
 * - onEditRelatedObjectChange() - * טיפול בשינוי סוג שיוך במודל העריכה
 * - enableEditConditionFields() - * טיפול בבחירת אובייקט במודל העריכה
 * - disableEditConditionFields() - * טיפול בבחירת אובייקט במודל העריכה
 * - buildAlertCondition() - buildAlertCondition function
 * - parseAlertCondition() - * בניית מחרוזת תנאי התראה
 * - validateAlertStatusCombination() - validateAlertStatusCombination function
 * - restoreAlertsSectionState() - * קבלת מחלקת סטטוס
 * - checkAlertCondition() - checkAlertCondition function
 * - displayAvailableConditions() - displayAvailableConditions function
 * - selectConditionForAlert() - selectConditionForAlert function
 * - evaluateAllConditions() - evaluateAllConditions function
 * - refreshConditionEvaluations() - refreshConditionEvaluations function
 * - displayEvaluationResults() - * הצגת אינדיקטור טעינה להערכת תנאים
 * - cleanupAlertConditionBuilder() - * קבלת מזהה שיטה מתנאי קיים
 * 
 * UI UPDATES (1)
 * - showEditAlertModal() - * ניקוי הממשק המתקדם
 * 
 * VALIDATION (2)
 * - checkAlertVariable() - * הפעלת שדות התנאי במודל העריכה
 * - checkAlertOperator() - checkAlertOperator function
 * 
 * OTHER (10)
 * - filterAlertsLocally() - filterAlertsLocally function
 * - populateSelect() - populateSelect function
 * - populateRelatedObjects() - * Enable condition fields for add modal
 * - populateEditRelatedObjects() - populateEditRelatedObjects function
 * - editAlert() - editAlert function
 * - filterAlertsByRelatedObjectTypeWrapper() - filterAlertsByRelatedObjectTypeWrapper function
 * - reactivateAlert() - reactivateAlert function
 * - toggleAlert() - toggleAlert function
 * - generateDetailedLog() - generateDetailedLog function
 * - generateDetailedLogForAlerts() - generateDetailedLogForAlerts function
 * 
 * ==========================================
 */
/**
 * Alerts Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing alerts including:
 * - CRUD operations for alerts
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Conditions system integration
 * - Advanced condition builder functionality
 * - Condition evaluation and monitoring
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// alerts.js loaded successfully - removed debug log

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadAlertsData = window.loadAlertsData || function() {
  // loadAlertsData not yet defined, using placeholder
  window.Logger.info('⚠️ loadAlertsData placeholder called', { page: "alerts" });
};

// ===== DATA LOADING FUNCTIONS =====
// Data fetching, table updates, and statistics

/**
 * Load alerts data from server
 * Fetches all alerts and updates the table display
 * 
 * @function loadAlertsData
 * @async
 * @returns {Promise<void>}
 */
window.loadAlertsData = async function() {
  window.Logger.info('🚀🚀🚀 loadAlertsData התחיל 🚀🚀🚀', { page: "alerts" });

  try {
    // קריאה לשרת לקבלת נתוני התראות
    window.Logger.info('📡 קריאה לשרת לקבלת נתוני התראות...', { page: "alerts" });
    const response = await fetch('/api/alerts/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.Logger.info('📊 נתונים שהתקבלו מהשרת:', data, { page: "alerts" });

    // שמירת הנתונים במשתנה גלובלי
    window.alertsData = data.data || data;
    window.Logger.info('💾 נתונים נשמרו ב-window.alertsData:', window.alertsData.length, 'התראות', { page: "alerts" });

    // עדכון הטבלה
    if (typeof window.updateAlertsTable === 'function') {
      window.Logger.info('📊 מעדכן את טבלת ההתראות', { page: "alerts" });
      window.updateAlertsTable(window.alertsData);
    } else {
      window.Logger.warn('⚠️ updateAlertsTable לא זמין', { page: "alerts" });
    }

    // עדכון סטטיסטיקות
    if (typeof window.updateAlertsSummary === 'function') {
      window.Logger.info('📈 מעדכן את סטטיסטיקות ההתראות', { page: "alerts" });
      window.updateAlertsSummary(window.alertsData);
    } else {
      window.Logger.warn('⚠️ updateAlertsSummary לא זמין', { page: "alerts" });
    }

    window.Logger.info('✅ loadAlertsData הושלם בהצלחה', { page: "alerts" });

  } catch (error) {
    window.Logger.error('❌ שגיאה ב-loadAlertsData:', error, { page: "alerts" });
    
    // הצגת הודעת שגיאה למשתמש
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בטעינת נתוני ההתראות', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בטעינת נתוני ההתראות', 'error');
    } else {
      alert('שגיאה בטעינת נתוני ההתראות: ' + error.message);
    }
  }
};

/**
 * ========================================
 * דף ההתראות - Alerts Page
 * ========================================
 *
 * קובץ ייעודי לדף ההתראות (alerts.html) בלבד
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - alert-service.js (general alert service functions)
 *
 * Table Mapping:
 * - Uses 'alerts' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * תכולת הקובץ:
 * - טעינת נתוני התראות מהשרת
 * - הצגת טבלת התראות עם מיון ופילטרים
 * - הוספת התראה חדשה (showAddAlertModal)
 * - עריכת התראה קיימת (editAlert)
 * - ניהול סטטוסים ומצבי הפעלה
 * - שימוש במערכת התראות גלובלית
 *
 * פונקציות שהועברו ל-alert-service.js:
 * - formatAlertCondition - פונקציה לתרגום תנאי התראה
 * - parseAlertCondition - פונקציה לפרסור תנאי התראה
 * - deleteAlert - פונקציה למחיקת התראה
 *
 * מערכת התראות:
 * - כל הודעות המשתמש משתמשות במערכת ההתראות הגלובלית מ-main.js
 * - showSuccessNotification() - הודעות הצלחה
 * - showErrorNotification() - הודעות שגיאה
 * - showWarningNotification() - הודעות אזהרה
 *
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים
let alertsData = [];

// בדיקה שהפונקציות הגלובליות זמינות

// אתחול מערכת ראש הדף החדשה
document.addEventListener("DOMContentLoaded", () => {
  window.Logger.info('🚀 טעינת דף התראות עם מערכת ראש דף חדשה...', { page: "alerts" });

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    window.Logger.info('✅ אתחול HeaderSystem...', { page: "alerts" });
    window.headerSystem.init();
  }

  // וידוא שהמודולים נסגרים בלחיצה על הרקע
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    // הוספת data-bs-backdrop אם לא קיים
    if (!modal.hasAttribute('data-bs-backdrop')) {
      modal.setAttribute('data-bs-backdrop', 'true');
    }
    
    // הוספת data-bs-keyboard אם לא קיים
    if (!modal.hasAttribute('data-bs-keyboard')) {
      modal.setAttribute('data-bs-keyboard', 'true');
    }

    // הוספת event listener לסגירה בלחיצה על הרקע
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
  });

  window.Logger.info('✅ מודולים הוגדרו לסגירה בלחיצה על הרקע', { page: "alerts" });

  // בדיקת הצבעים הסטטיים
  window.Logger.info('🎨 בודק צבעים סטטיים...', { page: "alerts" });
  const tradeColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-trade-color');
  const tickerColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-ticker-color');
  const tradePlanColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-trade-plan-color');
  const accountColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-account-color');
  window.Logger.info('🎨 צבע טרייד:', tradeColor, { page: "alerts" });
  window.Logger.info('🎨 צבע טיקר:', tickerColor, { page: "alerts" });
  window.Logger.info('🎨 צבע תוכנית:', tradePlanColor, { page: "alerts" });
  window.Logger.info('🎨 צבע חשבון מסחר:', accountColor, { page: "alerts" });
});


// נתוני דמה
const demoAlerts = [
  {
    id: 1,
    title: 'התראה על מחיר AAPL',
    type: 'price_alert',
    status: 'open',
    related_type_id: 4, // ticker
    related_id: 1,
    condition: 'מחיר > 210$',
    message: 'AAPL הגיע ליעד מחיר',
    created_at: '2024-01-15',
    is_triggered: false,
  },
  {
    id: 2,
    title: 'סטופ לוס TSLA',
    type: 'stop_loss',
    status: 'open',
    related_type_id: 2, // trade
    related_id: 1,
    condition: 'מחיר < 690$',
    message: 'TSLA מתחת לסטופ',
    created_at: '2024-01-14',
    is_triggered: true,
  },
];


/**
 * טעינת נתוני התראות מהשרת
 *
 * פונקציה זו מחזירה נתוני דמו להתראות
 * @returns {Array} מערך של התראות דמו
 */
function getDemoAlertsData() {
  try {
    return [
      {
        id: 1,
        title: 'התראה על מחיר AAPL',
        status: 'open',
        related_type_id: 4, // טיקר
        related_id: 1, // מזהה טיקר AAPL
        related_object_id: 1, // מזהה הטיקר הספציפי
        ticker_id: 1, // מזהה הטיקר
        condition: 'מחיר יותר מ 150',
        condition_attribute: 'price',
        condition_operator: 'more_than',
        condition_number: 150,
        message: 'מחיר AAPL עלה מעל 150$',
        created_at: '2025-01-09T10:00:00Z',
        is_triggered: false
      },
      {
        id: 2,
        title: 'התראה על שינוי TSLA',
        status: 'closed',
        related_type_id: 4, // טיקר
        related_id: 2, // מזהה טיקר TSLA
        related_object_id: 2, // מזהה הטיקר הספציפי
        ticker_id: 2, // מזהה הטיקר
        condition: 'שינוי יותר מ 5%',
        condition_attribute: 'change',
        condition_operator: 'more_than',
        condition_number: 5,
        message: 'שינוי TSLA מעל 5%',
        created_at: '2025-01-09T09:30:00Z',
        is_triggered: true
      }
    ];
  } catch (error) {
    window.Logger.error('שגיאה בקבלת נתוני דמו להתראות:', error, { page: "alerts" });
    return [];
  }
}

/**
 * פונקציה זו טוענת את כל ההתראות מהשרת ומעדכנת את הטבלה
 * אם השרת לא זמין, משתמשת בנתוני דמו
 *
 * @returns {Array} מערך של התראות
 */
async function loadAlertsData() {
  window.Logger.info('📊 טעינת נתוני התראות מהשרת...', { page: "alerts" });
  try {
    const response = await fetch('/api/alerts/');
    window.Logger.info('📊 תגובת שרת:', response.status, response.ok, { page: "alerts" });

    if (!response.ok) {
      window.Logger.warn(`⚠️ Server error ${response.status}, using demo data`, { page: "alerts" });
      // שימוש בנתוני דמו במקרה של שגיאת שרת
      alertsData = getDemoAlertsData();
      updateAlertsTable(alertsData);
      
      // עדכון סטטיסטיקות
      if (typeof updateAlertsSummary === 'function') {
        updateAlertsSummary(alertsData);
      }
      
      // רענון כפוי של הטבלה
      setTimeout(() => {
        updateAlertsTable(alertsData);
        if (typeof updateAlertsSummary === 'function') {
          updateAlertsSummary(alertsData);
        }
      }, 100);
      
      return alertsData;
    }

    const data = await response.json();
    const alerts = data.data || data;
    window.Logger.info('📊 נתונים שהתקבלו:', alerts.length, 'התראות', { page: "alerts" });

    // עדכון המשתנה הגלובלי
    alertsData = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      status: alert.status,
      related_type_id: alert.related_type_id,
      related_id: alert.related_id,
      condition: alert.condition,
      condition_attribute: alert.condition_attribute,
      condition_operator: alert.condition_operator,
      condition_number: alert.condition_number,
      message: alert.message,
      created_at: alert.created_at,
      is_triggered: alert.is_triggered,
    }));

    window.Logger.info('📊 נתונים מעובדים:', alertsData.length, 'התראות', { page: "alerts" });
    
      // עדכון הטבלה
      updateAlertsTable(alertsData);
      
      // עדכון סטטיסטיקות
      if (typeof updateAlertsSummary === 'function') {
        updateAlertsSummary(alertsData);
      }
    

    return alertsData;
  } catch (error) {
    window.Logger.error('שגיאה בטעינת התראות:', error, { page: "alerts" });
    // שימוש בנתוני דמו במקרה של שגיאה
    alertsData = getDemoAlertsData();
    updateAlertsTable(alertsData);
    
    // עדכון סטטיסטיקות
    if (typeof updateAlertsSummary === 'function') {
      updateAlertsSummary(alertsData);
    }
    
    // הצגת הודעת שגיאה
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בטעינת התראות', 'לא ניתן לטעון התראות מהשרת. מוצגים נתוני דמו.');
    }
    
    return alertsData;
  }
}

/**
 * פילטור מקומי להתראות
 */
function filterAlertsLocally(alerts, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  try {
    let filteredAlerts = [...alerts];

    // Extracting start and end dates
    let startDate = null;
    let endDate = null;

  if (selectedDateRange && selectedDateRange !== 'כל זמן') {
    const dateRange = window.translateDateRangeToDates
      ? window.translateDateRangeToDates(selectedDateRange)
      : { startDate: null, endDate: null };
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }

  // Filtering by status
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    filteredAlerts = filteredAlerts.filter(alert => {
      // המרת הערכים הנבחרים לאנגלית
      const statusTranslations = {
        'פתוח': 'open',
        'סגור': 'closed',
        'מבוטל': 'cancelled',
      };

      const translatedSelectedStatuses = selectedStatuses.map(status =>
        statusTranslations[status] || status,
      );

      const isMatch = translatedSelectedStatuses.includes(alert.status);
      return isMatch;
    });
  }

  // Filtering by type
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    filteredAlerts = filteredAlerts.filter(() => {
      // הסרת פילטור לפי סוג התראה - השדה type הוסר
      const isMatch = true;
      return isMatch;
    });
  }

  // Filtering by dates
  if (startDate && endDate) {
    filteredAlerts = filteredAlerts.filter(alert => {
      if (!alert.created_at) {return false;}

      const alertDate = new Date(alert.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Setting time to start of day for start date and end of day for end date
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const isInRange = alertDate >= start && alertDate <= end;
      return isInRange;
    });
  }

  // Filtering by search term
  if (searchTerm && searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();

    // Bi-directional search term translations
    const searchTranslations = {
      // Status translations
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
      'open': 'open',
      'closed': 'closed',
      'cancelled': 'cancelled',

      // Alert type translations
      'התראה על מחיר': 'price_alert',
      'סטופ לוס': 'stop_loss',
      'התראה על נפח': 'volume_alert',
      'התראה מותאמת': 'custom_alert',
      'price_alert': 'price_alert',
      'stop_loss': 'stop_loss',
      'volume_alert': 'volume_alert',
      'custom_alert': 'custom_alert',
    };

    // Creating an array of search terms including translations
    const searchTerms = [searchLower];

    // Adding exact translation
    if (searchTranslations[searchLower]) {
      searchTerms.push(searchTranslations[searchLower]);
    }

    // Adding partial search - if user searches for part of a word
    Object.keys(searchTranslations).forEach(hebrewTerm => {
      if (hebrewTerm.includes(searchLower) && !searchTerms.includes(searchTranslations[hebrewTerm])) {
        searchTerms.push(searchTranslations[hebrewTerm]);
      }
    });

    filteredAlerts = filteredAlerts.filter(alert => {
      // Searching in all relevant fields
      const titleMatch = alert.title && searchTerms.some(term =>
        alert.title.toLowerCase().includes(term),
      );

      // הסרת חיפוש לפי סוג התראה - השדה type הוסר
      const typeMatch = false;

      const statusMatch = alert.status && searchTerms.some(term =>
        alert.status.toLowerCase().includes(term),
      );

      const conditionMatch = alert.condition && searchTerms.some(term =>
        alert.condition.toLowerCase().includes(term),
      );

      const messageMatch = alert.message && searchTerms.some(term =>
        alert.message.toLowerCase().includes(term),
      );

      const isMatch = titleMatch || typeMatch || statusMatch || conditionMatch || messageMatch;

      return isMatch;
    });
  }

  return filteredAlerts;
  
  } catch (error) {
    window.Logger.error('שגיאה בפילטור מקומי של התראות:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור מקומי של התראות', error.message);
    }
    return alerts; // החזרת הנתונים המקוריים במקרה של שגיאה
  }
}

/**
 * עדכון טבלת התראות
 *
 * פונקציה זו מעדכנת את הטבלה עם הנתונים החדשים
 * כולל המרת ערכים לעברית ועיצוב תאים
 *
 * @param {Array} alerts - מערך של התראות לעדכון
 */
// פונקציה להצגת מקור התנאי
function getConditionSourceDisplay(alert) {
  try {
    // בדיקה אם ההתראה מקושרת לתנאי
    if (alert.plan_condition_id) {
      // שימוש במערכת הקיימת - renderType עם 'plan' type
      return window.renderType ? 
        window.renderType('plan', null) :
        `<span class="badge badge-success" title="תנאי תכנית מסחר">📋 תכנית ${alert.plan_condition_id}</span>`;
    } else if (alert.trade_condition_id) {
      // שימוש במערכת הקיימת - renderType עם 'trade' type  
      return window.renderType ? 
        window.renderType('trade', null) :
        `<span class="badge badge-primary" title="תנאי טרייד">📈 טרייד ${alert.trade_condition_id}</span>`;
    } else {
      // שימוש במערכת הקיימת - renderStatus עם 'manual' status
      return window.renderStatus ? 
        window.renderStatus('manual', 'alert') :
        `<span class="badge badge-secondary" title="התראה ידנית">✋ ידני</span>`;
    }
  } catch (error) {
    window.Logger.error('שגיאה ב-getConditionSourceDisplay:', error, { page: "alerts" });
    return '<span class="text-muted">-</span>';
  }
}

function updateAlertsTable(alerts) {
  try {
    const tbody = document.querySelector('#alertsTable tbody');
    if (!tbody) {
      // No alerts table found on this page - skipping table update
      return;
    }

  // טעינת נתונים נוספים לצורך הצגת סימבולים
  let accounts = [];
  let trades = [];
  let tradePlans = [];
  let tickers = [];

  // פונקציה לטעינת נתונים נוספים
  const loadAdditionalData = async () => {
    try {
      const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
        fetch('/api/trading-accounts/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      accounts = (accountsResponse.data || accountsResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      trades = (tradesResponse.data || tradesResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tradePlans = (tradePlansResponse.data || tradePlansResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tickers = (tickersResponse.data || tickersResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    } catch {
      // // window.Logger.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error, { page: "alerts" });
      // המשך עם מערכים ריקים
      accounts = [];
      trades = [];
      tradePlans = [];
      tickers = [];
    }
  };

  // טעינת נתונים ועדכון הטבלה
  loadAdditionalData().then(() => {
    // בדיקה שהנתונים קיימים
    if (!alerts || !Array.isArray(alerts)) {
      window.Logger.warn('⚠️ alerts parameter is not available or not an array', { page: "alerts" });
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין התראות להצגה</td></tr>';
      return;
    }

    const tableHTML = alerts.map(alert => {
      // לוג לבדיקת מבנה הנתונים
      // window.Logger.info('🔍 Alert data structure:', alert, { page: "alerts" });
      
      // קבלת צבעי סטטוס דינמיים
      const statusClass = getStatusClass(alert.status);
      const statusColor = window.getStatusColor ? window.getStatusColor(alert.status, 'medium') : '#6c757d';
      const statusBgColor = window.getStatusBackgroundColor ? window.getStatusBackgroundColor(alert.status) : 'rgba(108, 117, 125, 0.1)';
      
      // קביעת האובייקט המקושר באמצעות המערכת הכללית
      const dataSources = {
        accounts: accounts,
        trades: trades,
        tradePlans: tradePlans,
        tickers: tickers
      };

      const relatedObjectInfo = window.getRelatedObjectDisplay ? 
        window.getRelatedObjectDisplay(alert, dataSources, { showLink: true, format: 'full' }) :
        { display: 'כללי', icon: '🌐', class: 'related-general', color: '', bgColor: '', type: 'general', id: null };

      const relatedDisplay = relatedObjectInfo.display;
      const relatedClass = relatedObjectInfo.class;
      const relatedColor = relatedObjectInfo.color;
      const relatedBgColor = relatedObjectInfo.bgColor;

      // קביעת הסימבול לטור הראשון באמצעות המערכת הכללית
      const symbolDisplay = window.getRelatedObjectSymbol ? 
        window.getRelatedObjectSymbol(alert, dataSources) : '-';

      const createdAt = alert.created_at ? new Date(alert.created_at).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) : 'לא מוגדר';

      // המרת סטטוס לעברית להצגה
      // לפי הדוקומנטציה: open=פעיל, closed=הופעל, cancelled=בוטל
      let statusDisplay;
      switch (alert.status) {
      case 'open': statusDisplay = 'פתוח'; break;
      case 'closed': statusDisplay = 'סגור'; break;
      case 'cancelled': statusDisplay = 'מבוטל'; break;
      default: statusDisplay = alert.status;
      }


      // המרת מצב הפעלה לעברית להצגה עם צבעים דינמיים
      // לפי הדוקומנטציה: false=לא הופעל, new=הופעל לא נקרא, true=נקרא/בוטל
      let triggeredDisplay;
      let triggeredClass = '';
      let triggeredColor = '#6c757d';
      let triggeredBgColor = 'rgba(108, 117, 125, 0.1)';
      let triggeredBorderColor = '#6c757d';
      
      if (alert.is_triggered === 'true' || alert.is_triggered === true) {
        triggeredDisplay = 'כן';
        triggeredClass = 'triggered-yes';
        // צבע חיובי - הופעל בהצלחה
        triggeredColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'medium') : '#28a745';
        triggeredBgColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'light') : 'rgba(40, 167, 69, 0.1)';
        triggeredBorderColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'border') : 'rgba(40, 167, 69, 0.3)';
      } else if (alert.is_triggered === 'false' || alert.is_triggered === false) {
        triggeredDisplay = 'לא';
        triggeredClass = 'triggered-no';
        // צבע שלילי - לא הופעל
        triggeredColor = window.getNumericValueColor ? window.getNumericValueColor(-1, 'medium') : '#dc3545';
        triggeredBgColor = window.getNumericValueColor ? window.getNumericValueColor(-1, 'light') : 'rgba(220, 53, 69, 0.1)';
        triggeredBorderColor = window.getNumericValueColor ? window.getNumericValueColor(-1, 'border') : 'rgba(220, 53, 69, 0.3)';
      } else if (alert.is_triggered === 'new') {
        triggeredDisplay = 'חדש';
        triggeredClass = 'triggered-new';
        // צבע חיובי - הופעל חדש
        triggeredColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'medium') : '#28a745';
        triggeredBgColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'light') : 'rgba(40, 167, 69, 0.1)';
        triggeredBorderColor = window.getNumericValueColor ? window.getNumericValueColor(1, 'border') : 'rgba(40, 167, 69, 0.3)';
      } else {
        triggeredDisplay = 'לא מוגדר';
        triggeredClass = 'triggered-unknown';
        // צבע נייטרלי
        triggeredColor = '#6c757d';
        triggeredBgColor = 'rgba(108, 117, 125, 0.1)';
        triggeredBorderColor = '#6c757d';
      }

      return `
        <tr data-status="${alert.status || ''}" data-date="${alert.created_at || ''}">
          <td class="related-cell">
            <div class="related-object-cell ${relatedClass}" 
             title="קישור לדף אובייקט - בפיתוח">
              ${relatedDisplay}
            </div>
          </td>
          <td class="ticker-cell">
            <div class="ticker-cell-content">
              <span class="ticker-symbol-link" 
                    onclick="showEntityDetails('alert', ${alert.id}); return false;" 
                    title="פרטי התראה">
                ${symbolDisplay}
              </span>
            </div>
          </td>
          <td><span class="condition-text">${(() => {
    if (alert.condition_attribute && alert.condition_operator &&
        alert.condition_number && window.translateConditionFields) {
      return window.translateConditionFields(
        alert.condition_attribute,
        alert.condition_operator,
        alert.condition_number,
      );
    }
    return alert.condition || '-';
  })()}</span></td>
          <td class="status-cell" data-status="${alert.status || ''}">
            ${window.renderStatus ? window.renderStatus(alert.status, 'alert') : 
              `<span class="status-badge ${statusClass}">${statusDisplay}</span>`}
          </td>
          <td>
            ${window.renderBoolean ? window.renderBoolean(alert.is_triggered) : 
              `<span class="triggered-badge ${triggeredClass}">${triggeredDisplay}</span>`}
          </td>
          <td class="text-center">
            ${getConditionSourceDisplay(alert)}
          </td>
          <td><span class="message-text">${alert.message || '-'}</span></td>
          <td data-date="${alert.created_at}"><span class="date-text">${createdAt}</span></td>
          <td class="actions-cell" data-entity-id="${alert.id}" data-status="${alert.status || ''}">
            ${window.createActionsMenu ? window.createActionsMenu([
              { type: 'VIEW', onclick: `window.showEntityDetails('alert', ${alert.id}, { mode: 'view' })`, title: 'צפה בפרטי התראה' },
              { type: 'LINK', onclick: `viewLinkedItemsForAlert(${alert.id})`, title: 'צפה בפריטים מקושרים' },
              { type: 'EDIT', onclick: `editAlert(${alert.id})`, title: 'ערוך התראה' },
              { type: alert.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert && window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert(${alert.id})`, title: alert.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' },
              { type: 'DELETE', onclick: `deleteAlert(${alert.id})`, title: 'מחק התראה' }
            ]) : `
            <div class="btn-group btn-group-sm actions-btn-group" role="group">
              <button class="btn btn-sm" onclick="window.showEntityDetails('alert', ${alert.id}, { mode: 'view' })" title="צפה בפרטי התראה">
                👁️
              </button>
              <button class="btn btn-sm" onclick="viewLinkedItemsForAlert(${alert.id})" title="צפה בפריטים מקושרים">
                🔗
              </button>
              <button class="btn btn-sm" onclick="editAlert(${alert.id})" title="ערוך התראה">
                ✏️
              </button>
              <button class="btn btn-sm" onclick="window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert && window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert(${alert.id})" title="${alert.status === 'cancelled' ? 'הפעל מחדש' : 'בטל'}">
                ${alert.status === 'cancelled' ? '🔄' : '⏸️'}
              </button>
              <button class="btn btn-sm" onclick="deleteAlert(${alert.id})" title="מחק התראה">
                🗑️
              </button>
            </div>
            `}
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = tableHTML;

    // עדכון ספירת רשומות
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${alerts.length} התראות`;
    }

    // עדכון סטטיסטיקות
    updatePageSummaryStats();
    
    window.Logger.info('✅ טבלת התראות עודכנה בהצלחה עם', alerts.length, 'התראות', { page: "alerts" });
    

  });
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת התראות:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת התראות', error.message);
    }
  }
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
  // Use unified function from ui-utils.js
  window.updatePageSummaryStats('alerts', alertsData);
}


/**
 * הצגת מודל התראה (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} [alertId] - מזהה ההתראה (נדרש רק בעריכה)
 */

/**
 * ניקוי ולידציה של טפסי התראות
 */
function clearAlertValidation() {
  try {
    // ניקוי ולידציה למודל הוספה
    const addFormFields = [
      'alertRelationType',
      'alertRelatedObjectSelect',
      'conditionAttribute',
      'conditionOperator',
      'conditionNumber',
      'alertMessage',
    ];

    addFormFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.classList.remove('is-invalid');
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }
    });

    // ניקוי ולידציה למודל עריכה
    const editFormFields = [
      'editAlertRelationType',
      'editAlertRelatedObjectSelect',
      'editConditionAttribute',
      'editConditionOperator',
      'editConditionNumber',
      'editAlertMessage',
    ];

    editFormFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.classList.remove('is-invalid');
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }
    });
  } catch (error) {
    window.Logger.error('שגיאה בניקוי ולידציה של התראות:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בניקוי ולידציה של התראות', error.message);
    }
  }
}

// ===== DATA MANAGEMENT FUNCTIONS =====
// Data loading, saving, and modal data management

/**
 * Load modal data for alerts
 * Loads accounts, trades, trade plans, and tickers for modal dropdowns
 * 
 * @function loadModalData
 * @async
 * @returns {Promise<void>}
 */
async function loadModalData() {
  try {

    // טעינת נתונים במקביל
    // window.Logger.info('🔧 Loading modal data...', { page: "alerts" });
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
    ]);

    // וידוא שהנתונים הם מערכים
    const accounts = Array.isArray(accountsResponse?.data) ? accountsResponse.data :
      Array.isArray(accountsResponse) ? accountsResponse : [];
    const trades = Array.isArray(tradesResponse?.data) ? tradesResponse.data :
      Array.isArray(tradesResponse) ? tradesResponse : [];
    const tradePlans = Array.isArray(tradePlansResponse?.data) ? tradePlansResponse.data :
      Array.isArray(tradePlansResponse) ? tradePlansResponse : [];
    const tickers = Array.isArray(tickersResponse?.data) ? tickersResponse.data :
      Array.isArray(tickersResponse) ? tickersResponse : [];

    // window.Logger.info('🔧 Modal data loaded:', { page: "alerts" });
    // window.Logger.info('🔧 Accounts:', accounts.length, { page: "alerts" });
    // window.Logger.info('🔧 Trades:', trades.length, { page: "alerts" });
    // window.Logger.info('🔧 Trade Plans:', tradePlans.length, { page: "alerts" });
    // window.Logger.info('🔧 Tickers:', tickers.length, { page: "alerts" });

    // נטענו נתונים נוספים

    // שמירת נתונים בגלובל
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    // window.Logger.info('🔧 Setting initial data for tickers...', { page: "alerts" });
    await SelectPopulatorService.populateTickersSelect('alertRelatedObjectSelect', {
      includeEmpty: true,
      emptyText: 'בחר טיקר',
      defaultFromPreferences: true,
      filterFn: (ticker) => ticker.status === 'open' || ticker.status === 'closed'
    });
    
    await SelectPopulatorService.populateTickersSelect('editAlertRelatedObjectSelect', {
      includeEmpty: true,
      emptyText: 'בחר טיקר',
      defaultFromPreferences: true,
      filterFn: (ticker) => ticker.status === 'open' || ticker.status === 'closed'
    });
  } catch (error) {
    // window.Logger.error('שגיאה בטעינת נתונים למודל:', error, { page: "alerts" });
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
    
    // Fallback עם SelectPopulatorService
    try {
      await SelectPopulatorService.populateTickersSelect('alertRelatedObjectSelect', {
        includeEmpty: true,
        emptyText: 'בחר טיקר',
        defaultFromPreferences: true
      });
      
      await SelectPopulatorService.populateTickersSelect('editAlertRelatedObjectSelect', {
        includeEmpty: true,
        emptyText: 'בחר טיקר',
        defaultFromPreferences: true
      });
    } catch (fallbackError) {
      window.Logger.error('שגיאה ב-fallback:', fallbackError, { page: "alerts" });
    }
  }
}

/**
 * עדכון רדיו באטונים
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  try {
    // עדכון רדיו באטון לחשבונות
    const accountRadio = document.getElementById('alertRelationAccount');
    const editAccountRadio = document.getElementById('editAlertRelationAccount');

  if (accountRadio) {
    accountRadio.addEventListener('change', () => {
      populateSelect('alertRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
    });
  }

  if (editAccountRadio) {
    editAccountRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', accounts, 'name', 'חשבון מסחר');
    });
  }

  // עדכון רדיו באטון לטריידים
  const tradeRadio = document.getElementById('alertRelationTrade');
  const editTradeRadio = document.getElementById('editAlertRelationTrade');

  if (tradeRadio) {
    tradeRadio.addEventListener('change', () => {
      populateSelect('alertRelatedObjectSelect', trades, 'id', 'טרייד');
    });
  }

  if (editTradeRadio) {
    editTradeRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', trades, 'id', 'טרייד');
    });
  }

  // עדכון רדיו באטון לתכנונים
  const planRadio = document.getElementById('alertRelationTradePlan');
  const editPlanRadio = document.getElementById('editAlertRelationTradePlan');

  if (planRadio) {
    planRadio.addEventListener('change', () => {
      populateSelect('alertRelatedObjectSelect', tradePlans, 'id', 'תכנון');
    });
  }

  if (editPlanRadio) {
    editPlanRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', tradePlans, 'id', 'תכנון');
    });
  }

  // עדכון רדיו באטון לטיקרים
  const tickerRadio = document.getElementById('alertRelationTicker');
  const editTickerRadio = document.getElementById('editAlertRelationTicker');

  if (tickerRadio) {
    tickerRadio.addEventListener('change', () => {
      populateSelect('alertRelatedObjectSelect', tickers, 'symbol', '');
    });
  }

  if (editTickerRadio) {
    editTickerRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', tickers, 'symbol', '');
    });
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון רדיו באטונים:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון רדיו באטונים', error.message);
    }
  }
}

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  try {
    // window.Logger.info('🔧 populateSelect called:', { selectId, dataLength: data?.length, field, prefix }, { page: "alerts" });

    const select = document.getElementById(selectId);
    if (!select) {
      // window.Logger.error('🔧 Select element not found:', selectId, { page: "alerts" });
      return;
    }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  if (!data || data.length === 0) {
    // window.Logger.info('🔧 No data available for:', selectId, { page: "alerts" });
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'אין רשומות זמינות';
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;

    // יצירת טקסט מותאם לכל סוג אובייקט
    let displayText = '';

    if (prefix === 'חשבון מסחר') {
      // עבור חשבון מסחר: שם החשבון מסחר + מטבע
      const name = item.name || item.account_name || 'לא מוגדר';
      const currency = item.currency || 'ILS';
      displayText = `${name} (${currency})`;
    } else if (prefix === 'טרייד') {
      // עבור טרייד: סימבול + צד + סוג השקעה + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + צד + סוג השקעה + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });

  // window.Logger.info('🔧 populateSelect completed for:', selectId, 'with', data.length, 'items', { page: "alerts" });
  
  } catch (error) {
    window.Logger.error('שגיאה במילוי select:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במילוי select', error.message);
    }
  }
}


/**
 * טיפול בשינוי סוג שיוך
 * @param {HTMLInputElement} radioElement - אלמנט הרדיו שנבחר
 */
function onRelationTypeChange(radioElement) {
  try {
    // window.Logger.info('🔧 Relation type changed:', radioElement.value, { page: "alerts" });

    // הפעלת שדה בחירת אובייקט
    const relatedObjectSelect = document.getElementById('alertRelatedObjectSelect');
    if (relatedObjectSelect) {
      relatedObjectSelect.disabled = false;
      relatedObjectSelect.classList.remove('disabled-field');
    }

  // מילוי רשימת האובייקטים לפי הסוג שנבחר
  populateRelatedObjects(parseInt(radioElement.value));
  
  } catch (error) {
    window.Logger.error('שגיאה בשינוי סוג שיוך:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשינוי סוג שיוך', error.message);
    }
  }
}

/**
 * טיפול בבחירת אובייקט
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 */
function onRelatedObjectChange(selectElement) {
  try {
    // window.Logger.info('🔧 Related object changed:', selectElement.value, { page: "alerts" });

    if (selectElement.value) {
      // הפעלת שדות התנאי ישירות
      enableConditionFields();
    } else {
      // השבתת שדות התנאי
      disableConditionFields();
    }
  } catch (error) {
    window.Logger.error('שגיאה בבחירת אובייקט:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבחירת אובייקט', error.message);
    }
  }
}


/**
 * הפעלה/השבתה של שדות התנאי
 * @param {boolean} enable - true להפעלה, false להשבתה
 * @param {string} mode - 'add' או 'edit'
 */
function toggleConditionFields(enable, mode = 'add') {
  const prefix = mode === 'edit' ? 'edit' : '';
  const fields = [
    'conditionAttribute',
    'conditionOperator', 
    'conditionNumber',
    'alertMessage'
  ];

  try {
    fields.forEach(fieldName => {
      const fieldId = prefix ? `${prefix}${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}` : fieldName;
      const field = document.getElementById(fieldId);
      
      if (field) {
        field.disabled = !enable;
        
        if (enable) {
          field.classList.remove('disabled-field');
        } else {
          field.classList.add('disabled-field');
          field.value = '';
        }
      }
    });
    
  } catch (error) {
    const action = enable ? 'הפעלת' : 'השבתת';
    const context = mode === 'edit' ? 'בעריכה' : '';
    window.Logger.error(`שגיאה ב${action} שדות התנאי ${context}:`, error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה ב${action} שדות התנאי ${context}`, error.message);
    }
  }
}

// ===== FORM MANAGEMENT FUNCTIONS =====
// Form field enabling/disabling and validation

/**
 * Enable condition fields for add modal
 * Activates condition fields after relation type selection
 * @deprecated Use toggleConditionFields(true, 'add') instead
 * 
 * @function enableConditionFields
 * @returns {void}
 */
function enableConditionFields() {
  toggleConditionFields(true, 'add');
}

/**
 * השבתת שדות התנאי
 * @deprecated Use toggleConditionFields(false, 'add') instead
 */
function disableConditionFields() {
  toggleConditionFields(false, 'add');
}

/**
 * הפעלת שדות התנאי במודל העריכה
 * @deprecated Use toggleConditionFields(true, 'edit') instead
 */
function enableEditConditionFields() {
  toggleConditionFields(true, 'edit');
}

/**
 * השבתת שדות התנאי במודל העריכה
 * @deprecated Use toggleConditionFields(false, 'edit') instead
 */
function disableEditConditionFields() {
  toggleConditionFields(false, 'edit');
}

/**
 * מילוי רשימת אובייקטים לפי סוג השיוך
 * @param {number} relationTypeId - מזהה סוג השיוך
 */
function populateRelatedObjects(relationTypeId) {
  try {
    const selectElement = document.getElementById('alertRelatedObjectSelect');
    if (!selectElement) {return;}

    // ניקוי הרשימה
    selectElement.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  // מילוי לפי סוג השיוך
  switch (relationTypeId) {
  case 1: // חשבון מסחר
    populateSelect('alertRelatedObjectSelect', window.accountsData || [], 'name', 'חשבון מסחר');
    break;

  case 2: // טרייד
    populateSelect('alertRelatedObjectSelect', window.tradesData || [], 'id', 'טרייד');
    break;

  case 3: // תכנון טרייד
    populateSelect('alertRelatedObjectSelect', window.tradePlansData || [], 'id', 'תכנון');
    break;

  case 4: // טיקר
    populateSelect('alertRelatedObjectSelect', window.tickersData || [], 'symbol', '');
    break;
  }
  
  } catch (error) {
    window.Logger.error('שגיאה במילוי אובייקטים קשורים:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במילוי אובייקטים קשורים', error.message);
    }
  }
}

/**
 * מילוי רשימת אובייקטים למודל העריכה
 * @param {number} relationTypeId - מזהה סוג השיוך
 */
function populateEditRelatedObjects(relationTypeId) {
  try {
    const selectElement = document.getElementById('editAlertRelatedObjectSelect');
    if (!selectElement) {return;}

    // ניקוי הרשימה
    selectElement.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

    // מילוי לפי סוג השיוך
    switch (relationTypeId) {
    case 1: // חשבון מסחר
      populateSelect('editAlertRelatedObjectSelect', window.accountsData || [], 'name', 'חשבון מסחר');
      break;

  case 2: // טרייד
    populateSelect('editAlertRelatedObjectSelect', window.tradesData || [], 'id', 'טרייד');
    break;

  case 3: // תכנון טרייד
    populateSelect('editAlertRelatedObjectSelect', window.tradePlansData || [], 'id', 'תכנון');
    break;

  case 4: // טיקר
    populateSelect('editAlertRelatedObjectSelect', window.tickersData || [], 'symbol', '');
    break;
  }
  
  } catch (error) {
    window.Logger.error('שגיאה במילוי אובייקטים קשורים בעריכה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה במילוי אובייקטים קשורים בעריכה', error.message);
    }
  }
}

/**
 * טיפול בשינוי סוג שיוך במודל העריכה
 * @param {HTMLInputElement} radioElement - אלמנט הרדיו שנבחר
 */
function onEditRelationTypeChange(radioElement) {
  try {
    // window.Logger.info('🔧 Edit relation type changed:', radioElement.value, { page: "alerts" });

    // מילוי רשימת האובייקטים לפי הסוג שנבחר
    populateEditRelatedObjects(parseInt(radioElement.value));
  } catch (error) {
    window.Logger.error('שגיאה בשינוי סוג שיוך בעריכה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשינוי סוג שיוך בעריכה', error.message);
    }
  }
}

/**
 * טיפול בבחירת אובייקט במודל העריכה
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 */
function onEditRelatedObjectChange(selectElement) {
  try {
    // window.Logger.info('🔧 Edit related object changed:', selectElement.value, { page: "alerts" });

    if (selectElement.value) {
      // הפעלת שדות התנאי ישירות
      enableEditConditionFields();
    } else {
      // השבתת שדות התנאי
      disableEditConditionFields();
    }
  } catch (error) {
    window.Logger.error('שגיאה בבחירת אובייקט בעריכה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבחירת אובייקט בעריכה', error.message);
    }
  }
}

/**
 * הפעלת שדות התנאי במודל העריכה
 * @deprecated Use toggleConditionFields(true, 'edit') instead
 */
function enableEditConditionFields() {
  toggleConditionFields(true, 'edit');
}

/**
 * השבתת שדות התנאי במודל העריכה
 * @deprecated Use toggleConditionFields(false, 'edit') instead
 */
function disableEditConditionFields() {
  toggleConditionFields(false, 'edit');
}

/**
 * בדיקת משתנה התראה
 *
 * פונקציה זו בודקת אם המשתנה שנבחר נתמך
 * כרגע נתמך רק 'price' (מחיר)
 *
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 * @returns {boolean} true אם נתמך, false אם לא
 */
function checkAlertVariable(selectElement) {
  try {
    // window.Logger.info('🔍 === CHECK ALERT VARIABLE ===', { page: "alerts" });
    // window.Logger.info('🔍 Element:', selectElement, { page: "alerts" });
    // window.Logger.info('🔍 Selected value:', selectElement.value, { page: "alerts" });

    // כרגע מאפשרים את כל התכונות
    const selectedValue = selectElement.value;

    if (!selectedValue) {
      // window.Logger.info('❌ No variable selected', { page: "alerts" });
      return false;
    }

    // window.Logger.info('✅ Variable accepted:', selectedValue, { page: "alerts" });
    return true;
  } catch (error) {
    window.Logger.error('שגיאה בבדיקת משתנה התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבדיקת משתנה התראה', error.message);
    }
    return false;
  }
}

/**
 * בדיקת אופרטור התראה
 *
 * פונקציה זו בודקת אם האופרטור שנבחר נתמך
 * כרגע נתמכים רק 'greater_than' ו-'less_than'
 *
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 * @returns {boolean} true אם נתמך, false אם לא
 */
function checkAlertOperator(selectElement) {
  try {
    // window.Logger.info('🔍 === CHECK ALERT OPERATOR ===', { page: "alerts" });
    // window.Logger.info('🔍 Element:', selectElement, { page: "alerts" });
    // window.Logger.info('🔍 Selected value:', selectElement.value, { page: "alerts" });

    // כרגע מאפשרים את כל האופרטורים
    const selectedValue = selectElement.value;

  if (!selectedValue) {
    // window.Logger.info('❌ No operator selected', { page: "alerts" });
    return false;
  }

  // window.Logger.info('✅ Operator accepted:', selectedValue, { page: "alerts" });
  return true;
  
  } catch (error) {
    window.Logger.error('שגיאה בבדיקת אופרטור התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבדיקת אופרטור התראה', error.message);
    }
    return false;
  }
}

/**
 * בניית מחרוזת תנאי התראה
 *
 * פונקציה זו בונה מחרוזת תנאי מהמשתנה, האופרטור והערך
 * המחרוזת נשמרת בפורמט: "variable|operator|value"
 *
 * @param {string} variable - המשתנה (price, daily_change, etc.)
 * @param {string} operator - האופרטור (greater_than, less_than, etc.)
 * @param {string} value - הערך
 * @returns {string} מחרוזת התנאי
 */
function buildAlertCondition(variable, operator, value) {
  try {
    return `${variable} | ${operator} | ${value}`;
  } catch (error) {
    window.Logger.error('שגיאה בבניית תנאי התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבניית תנאי התראה', error.message);
    }
    return '';
  }
}

/**
 * פירוק מחרוזת תנאי התראה
 *
 * פונקציה זו מפרקת מחרוזת תנאי למשתנה, אופרטור וערך
 *
 * @param {string} condition - מחרוזת התנאי בפורמט "variable|operator|value"
 * @returns {object} אובייקט עם variable, operator, value
 */
function parseAlertCondition(condition) {
  try {
    if (!condition || !condition.includes(' | ')) {
      return { variable: 'price', operator: 'moreThen', value: '' };
    }

    const parts = condition.split(' | ');
    return {
      variable: parts[0] || 'price',
      operator: parts[1] || 'moreThen',
      value: parts[2] || '',
    };
  } catch (error) {
    window.Logger.error('שגיאה בפירוק תנאי התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפירוק תנאי התראה', error.message);
    }
    return { variable: 'price', operator: 'moreThen', value: '' };
  }
}

// ===== SAVE AND UPDATE FUNCTIONS =====
// Alert saving, updating, and status management

/**
 * Save new alert
 * Collects form data and sends to server for creation
 * 
 * @function saveAlert
 * @async
 * @returns {Promise<void>}
 */
async function saveAlert() {
  window.Logger.info('🔧 saveAlert function called', { page: "alerts" });
  
  // ניקוי מטמון לפני פעולת CRUD - הוספה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('alerts', 'add');
  }
  
  const form = document.getElementById('addAlertForm');
  if (!form) {
    window.Logger.warn('⚠️ Form element not found - skipping save operation', { page: "alerts" });
    return;
  }
  window.Logger.info('🔧 Form found, proceeding with validation', { page: "alerts" });


  // בדיקת תקינות הטופס
  if (!form.checkValidity()) {
    window.Logger.info('🔧 Form validation failed', { page: "alerts" });
    form.reportValidity();
    return;
  }
  window.Logger.info('🔧 Form validation passed', { page: "alerts" });

  // איסוף נתונים מהטופס באמצעות DataCollectionService
  const alertData = DataCollectionService.collectFormData({
    alertRelationType: { id: 'alertRelationType', type: 'text' },
    alertRelatedObjectSelect: { id: 'alertRelatedObjectSelect', type: 'int' },
    conditionAttribute: { id: 'conditionAttribute', type: 'text' },
    conditionOperator: { id: 'conditionOperator', type: 'text' },
    conditionNumber: { id: 'conditionNumber', type: 'number' },
    message: { id: 'message', type: 'text' },
    priority: { id: 'priority', type: 'text' },
    status: { id: 'status', type: 'text', default: 'open' }
  });

  const relatedType = alertData.alertRelationType;
  const relatedId = alertData.alertRelatedObjectSelect;
  const conditionAttribute = alertData.conditionAttribute;
  const conditionOperator = alertData.conditionOperator;
  const conditionNumber = alertData.conditionNumber;

  // window.Logger.info('🔧 Condition validation:', { page: "alerts" });
  // window.Logger.info('🔧 Condition attribute:', conditionAttribute, { page: "alerts" });
  // window.Logger.info('🔧 Condition operator:', conditionOperator, { page: "alerts" });
  // window.Logger.info('🔧 Condition number:', conditionNumber, { page: "alerts" });

  // ולידציה באמצעות מערכת הולידציה הגלובלית
  let hasErrors = false;

  // בדיקת סוג אובייקט מקושר
  if (!relatedType) {
    if (window.showValidationWarning) {
      window.showValidationWarning('alertRelationType', 'יש לבחור סוג אובייקט לשיוך');
    }
    hasErrors = true;
  }

  // בדיקת אובייקט מקושר
  if (!relatedId) {
    if (window.showValidationWarning) {
      window.showValidationWarning('alertRelatedObjectSelect', 'יש לבחור אובייקט לשיוך');
    }
    hasErrors = true;
  }

  // בדיקת תנאי התראה
  if (!conditionAttribute) {
    if (window.showValidationWarning) {
      window.showValidationWarning('conditionAttribute', 'יש לבחור מאפיין לתנאי');
    }
    hasErrors = true;
  }

  if (!conditionOperator) {
    if (window.showValidationWarning) {
      window.showValidationWarning('conditionOperator', 'יש לבחור אופרטור לתנאי');
    }
    hasErrors = true;
  }

  if (!conditionNumber) {
    if (window.showValidationWarning) {
      window.showValidationWarning('conditionNumber', 'יש להזין ערך לתנאי');
    }
    hasErrors = true;
  }

  // וולידציה של ערך מספרי
  if (conditionNumber) {
    const numericValue = parseFloat(conditionNumber);
    if (isNaN(numericValue)) {
      if (window.showValidationWarning) {
        window.showValidationWarning('conditionNumber', 'הערך חייב להיות מספר');
      }
      hasErrors = true;
    } else {
      // וולידציה של ערך חיובי למחיר
      if (conditionAttribute === 'price' && numericValue <= 0) {
        if (window.showValidationWarning) {
          window.showValidationWarning('conditionNumber', 'מחיר חייב להיות גדול מ-0');
        }
        hasErrors = true;
      }

      // וולידציה של ערך מקסימלי למחיר
      if (conditionAttribute === 'price' && numericValue > 1000000) {
        if (window.showValidationWarning) {
          window.showValidationWarning('conditionNumber', 'מחיר לא יכול להיות גדול מ-1,000,000');
        }
        hasErrors = true;
      }

      // וולידציה של אחוזים (לשינוי)
      if (conditionAttribute === 'change' && (numericValue < -100 || numericValue > 100)) {
        if (window.showValidationWarning) {
          window.showValidationWarning('conditionNumber', 'אחוז שינוי חייב להיות בין -100% ל-100%');
        }
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    return;
  }

  const alertPayload = {
    related_type_id: parseInt(relatedType),
    related_id: parseInt(relatedId),
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: alertData.message || null,
    status: 'open',
    is_triggered: 'false',
  };

  // שולח התראה חדשה
  // window.Logger.info('🔧 === SAVING ALERT ===', { page: "alerts" });
  // window.Logger.info('🔧 Alert data:', alertData, { page: "alerts" });
  // window.Logger.info('🔧 Request URL:', '/api/alerts/', { page: "alerts" });
  // window.Logger.info('🔧 Request method:', 'POST', { page: "alerts" });
  // window.Logger.info('🔧 Request body:', JSON.stringify(alertData, null, 2, { page: "alerts" }));

  try {
    window.Logger.info('🔧 === SAVING ALERT ===', { page: "alerts" });
    window.Logger.info('🔧 Alert data:', alertData, { page: "alerts" });
    window.Logger.info('🔧 Request URL:', '/api/alerts/', { page: "alerts" });
    window.Logger.info('🔧 Request method:', 'POST', { page: "alerts" });
    window.Logger.info('🔧 Request body:', JSON.stringify(alertData, null, 2, { page: "alerts" }));

    const response = await fetch('/api/alerts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addAlertModal',
      successMessage: 'התראה נשמרה בהצלחה!',
      apiUrl: '/api/alerts/',
      entityName: 'התראה'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת התראה');
  }
}

/**
 * עריכת התראה
 *
 * פונקציה זו פותחת את מודל העריכה עם הנתונים של ההתראה הנבחרת
 * כולל טעינת נתונים מקושרים (חשבונות, טריידים, תכנונים, טיקרים)
 *
 * @param {number} alertId - מזהה ההתראה לעריכה
 */
/**
 * עריכת התראה
 * @param {number} alertId - מזהה ההתראה לעריכה
 * @deprecated Use showAlertModal('edit', alertId) instead
 */
function editAlert(alertId) {
  showAlertModal('edit', alertId);
}

/**
 * קביעת מצב התראה לפי status ו-is_triggered
 *
 * פונקציה זו ממירה את שילוב status ו-is_triggered למצב עברי
 * משמשת למילוי המודל בעריכת התראה
 *
 * @param {string} status - סטטוס ההתראה (open, closed, cancelled)
 * @param {string} isTriggered - מצב הפעלה (false, new, true)
 * @returns {string} מצב ההתראה בעברית (new, active, unread, read, cancelled)
 */
function getAlertState(status, isTriggered) {
  try {
    if (status === 'open' && isTriggered === 'false') {
      return 'new';
    }
    if (status === 'open' && isTriggered !== 'false') {
      return 'active'; // התראה פתוחה עם מצב הפעלה שונה
    }
    if (status === 'closed' && isTriggered === 'new') {
      return 'unread';
    }
    if (status === 'closed' && isTriggered === 'true') {
      return 'read';
    }
    if (status === 'cancelled' && isTriggered === 'false') {
      return 'cancelled';
  }

  // ברירת מחדל
  return 'new';
  
  } catch (error) {
    window.Logger.error('שגיאה בקבלת מצב התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת מצב התראה', error.message);
    }
    return 'new';
  }
}

/**
 * בדיקת תקינות שילוב status ו-is_triggered
 *
 * פונקציה זו בודקת שהשילוב בין status ו-is_triggered תקין
 * לפי הדוקומנטציה של מערכת ההתראות
 *
 * כללים תקינים:
 * - status='open' + is_triggered='false' - חדש
 * - status='closed' + is_triggered='new' - לא נקרא
 * - status='closed' + is_triggered='true' - נקרא
 * - status='cancelled' + is_triggered='false' - מבוטל
 *
 * @param {string} status - סטטוס ההתראה
 * @param {string} isTriggered - מצב הפעלה
 * @returns {boolean} true אם השילוב תקין, false אחרת
 */
/**
 * ולידציה של שילוב סטטוס התראה
 * @deprecated השתמש ב-window.alertService.validateAlertStatusCombination() במקום
 */
function validateAlertStatusCombination(status, isTriggered) {
  return window.alertService.validateAlertStatusCombination(status, isTriggered);
}

// ===== STATUS MANAGEMENT FUNCTIONS =====
// Status updates and state management

/**
 * Update status and triggered state
 * Updates hidden fields based on state selection
 * 
 * @function updateStatusAndTriggered
 * @returns {void}
 */
function updateStatusAndTriggered() {
  const stateSelect = document.getElementById('editAlertState');
  const statusHidden = document.getElementById('editAlertStatus');
  const triggeredHidden = document.getElementById('editAlertIsTriggered');

  if (!stateSelect || !statusHidden || !triggeredHidden) {return;}

  const state = stateSelect.value;
  const currentTriggered = triggeredHidden.value; // שמירת הערך הנוכחי

  // מיפוי המצב לערכי status ו-is_triggered
  switch (state) {
  case 'new':
    statusHidden.value = 'open';
    triggeredHidden.value = 'false';
    break;
  case 'active':
    statusHidden.value = 'open';
    // שמירה על הערך הנוכחי של is_triggered
    triggeredHidden.value = currentTriggered;
    break;
  case 'unread':
    statusHidden.value = 'closed';
    triggeredHidden.value = 'new';
    break;
  case 'read':
    statusHidden.value = 'closed';
    triggeredHidden.value = 'true';
    break;
  case 'cancelled':
    statusHidden.value = 'cancelled';
    triggeredHidden.value = 'false';
    break;
  default:
    statusHidden.value = 'open';
    triggeredHidden.value = 'false';
  }
}

/**
 * עדכון התראה קיימת
 *
 * פונקציה זו מעדכנת התראה קיימת עם הנתונים החדשים מהטופס
 * כולל בדיקת תקינות, אימות שילוב סטטוס/הפעלה, ושליחה לשרת
 * משתמשת במערכת ההתראות הגלובלית להודעות
 */
async function updateAlert() {
  // ניקוי מטמון לפני פעולת CRUD - עריכה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('alerts', 'edit');
  }
  
  const form = document.getElementById('editAlertForm');
  if (!form) {
    // window.Logger.warn('⚠️ Form element not found - skipping update operation', { page: "alerts" });
    return;
  }


  // עדכון status ו-is_triggered לפי המצב הנבחר
  updateStatusAndTriggered();

  // בדיקת תקינות הקשר בין status ו-is_triggered
  const status = document.getElementById('editAlertStatus').value;
  const isTriggered = document.getElementById('editAlertIsTriggered').value;

  if (!validateAlertStatusCombination(status, isTriggered)) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שילוב לא תקין', 'שילוב לא תקין בין סטטוס ומצב הפעלה. ראה את הכללים במערכת ההתראות.');
    }
    return;
  }

  // בדיקת בחירת אובייקט
  const relatedTypeId = parseInt(document.querySelector('input[name="editAlertRelationType"]:checked')?.value);
  const relatedId = parseInt(document.getElementById('editAlertRelatedObjectSelect').value);

  // ולידציה באמצעות מערכת הולידציה הגלובלית
  let hasErrors = false;

  if (!relatedTypeId || isNaN(relatedTypeId)) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertRelationType', 'יש לבחור סוג אובייקט לשיוך');
    }
    hasErrors = true;
  }

  if (!relatedId || isNaN(relatedId)) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertRelatedObjectSelect', 'יש לבחור אובייקט לשיוך');
    }
    hasErrors = true;
  }

  // בדיקת תנאי התראה
  const conditionAttributeElement = document.getElementById('editConditionAttribute');
  const conditionOperatorElement = document.getElementById('editConditionOperator');
  const conditionNumberElement = document.getElementById('editConditionNumber');

  const conditionAttribute = conditionAttributeElement.value;
  const conditionOperator = conditionOperatorElement.value;
  const conditionNumber = conditionNumberElement.value;

  if (!conditionAttribute) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editConditionAttribute', 'יש לבחור מאפיין לתנאי');
    }
    hasErrors = true;
  }

  if (!conditionOperator) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editConditionOperator', 'יש לבחור אופרטור לתנאי');
    }
    hasErrors = true;
  }

  if (!conditionNumber) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editConditionNumber', 'יש להזין ערך לתנאי');
    }
    hasErrors = true;
  }

  // וולידציה של ערך מספרי
  if (conditionNumber) {
    const numericValue = parseFloat(conditionNumber);
    if (isNaN(numericValue)) {
      if (window.showValidationWarning) {
        window.showValidationWarning('editConditionNumber', 'הערך חייב להיות מספר');
      }
      hasErrors = true;
    } else {
      // וולידציה של ערך חיובי למחיר
      if (conditionAttribute === 'price' && numericValue <= 0) {
        if (window.showValidationWarning) {
          window.showValidationWarning('editConditionNumber', 'מחיר חייב להיות גדול מ-0');
        }
        hasErrors = true;
      }

      // וולידציה של ערך מקסימלי למחיר
      if (conditionAttribute === 'price' && numericValue > 1000000) {
        if (window.showValidationWarning) {
          window.showValidationWarning('editConditionNumber', 'מחיר לא יכול להיות גדול מ-1,000,000');
        }
        hasErrors = true;
      }

      // וולידציה של אחוזים (לשינוי)
      if (conditionAttribute === 'change' && (numericValue < -100 || numericValue > 100)) {
        if (window.showValidationWarning) {
          window.showValidationWarning('editConditionNumber', 'אחוז שינוי חייב להיות בין -100% ל-100%');
        }
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    return;
  }

  const alertId = document.getElementById('editAlertId').value;
  const alertData = {
    related_type_id: relatedTypeId,
    related_id: relatedId,
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: document.getElementById('editAlertMessage').value || null,
    status: document.getElementById('editAlertStatus').value,
    is_triggered: document.getElementById('editAlertIsTriggered').value,
  };

  // מעדכן התראה
  // window.Logger.info('🔍 בדיקת נתונים לפני שליחה:', { page: "alerts" });
  // window.Logger.info('- related_type_id:', relatedTypeId, '(valid:', !isNaN(relatedTypeId, { page: "alerts" }), ')');
  // window.Logger.info('- related_id:', relatedId, '(valid:', !isNaN(relatedId, { page: "alerts" }), ')');
  // window.Logger.info('- status:', alertData.status, { page: "alerts" });
  // window.Logger.info('- is_triggered:', alertData.is_triggered, { page: "alerts" });

  try {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });

    if (response.ok) {
      await response.json();
      // התראה עודכנה בהצלחה

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('alerts', 'התראה עודכנה בהצלחה!');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'התראה עודכנה בהצלחה!', 4000, 'business');
        }

        // רענון הנתונים
        await loadAlertsData();
      }

      // סגירת המודל
      closeModal('editAlertModal');
      
    } else {
      throw new Error(`שגיאה בעדכון התראה: ${response.status}`);
    }
  } catch {
    // window.Logger.error('שגיאה בעדכון התראה:', error, { page: "alerts" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון התראה', 'שגיאה בעדכון התראה');
    }
  }
}

/**
 * מחיקת התראה
 */
async function deleteAlertInternal(alertId) {
  // שימוש במערכת הגלובלית למחיקה
  if (typeof window.showDeleteWarning === 'function') {
    window.showDeleteWarning('alerts', alertId, 'התראה', async () => {
      await confirmDeleteAlert(alertId);
    }, null);
  } else {
    // גיבוי למקרה שהמערכת הגלובלית לא זמינה
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'מחיקת התראה',
        'האם אתה בטוח שברצונך למחוק התראה זו?\n\nפעולה זו אינה ניתנת לביטול.',
        async () => {
          await confirmDeleteAlert(alertId);
        },
        () => {
          // window.Logger.info('מחיקה בוטלה', { page: "alerts" });
        },
      );
    } else {
      // fallback אחרון - confirm רגיל (אם מערכת התראות לא זמינה)
      const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק התראה זו?');
      if (confirmed) {
        await confirmDeleteAlert(alertId);
      }
    }
    return;
  }
}

/**
 * אישור מחיקת התראה
 */
async function confirmDeleteAlert(alertId) {
  // window.Logger.info('🔄 confirmDeleteAlert נקראה עבור ID:', alertId, { page: "alerts" });

  try {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'התראה נמחקה בהצלחה!',
      apiUrl: '/api/alerts/',
      entityName: 'התראה'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת התראה');
  }
}

/**
 * פונקציה לסידור טבלת התראות
 *
 * פונקציה זו מטפלת בסידור טבלת ההתראות לפי עמודה
 * משתמשת ב-sortTableData הגלובלית
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת סימבול
 * sortTable(1); // סידור לפי עמודת אובייקט משיוך
 * sortTable(7); // סידור לפי עמודת תאריך יצירה
 *
 * @param {number} columnIndex - אינדקס העמודה לסידור
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 * @requires updateAlertsTable - פונקציה לעדכון הטבלה
 */

/**
 * קבלת מחלקת סטטוס
 */
function getStatusClass(status) {
  switch (status) {
  case 'open': return 'status-open';
  case 'closed': return 'status-closed';
  case 'cancelled': return 'status-cancelled';
  default: return 'status-cancelled';
  }
}


/**
 * קבלת מחלקת CSS לאובייקט מקושר
 *
 * פונקציה זו מחזירה את שם המחלקה CSS המתאימה לסוג האובייקט המקושר
 * משמשת לעיצוב התאים בטבלה
 *
 * @param {number} relatedType - מזהה סוג האובייקט (1=חשבון מסחר, 2=טרייד, 3=תכנון, 4=טיקר)
 * @returns {string} שם המחלקה CSS
 */
function getRelatedClass(relatedType) {
  switch (relatedType) {
  case 4: return 'related-ticker'; // ticker
  case 2: return 'related-trade'; // trade
  case 3: return 'related-plan'; // trade_plan
  case 1: return 'related-account'; // account
  default: return 'related-other';
  }
}


// ===== UI STATE MANAGEMENT FUNCTIONS =====
// Section state restoration and UI management

/**
 * Restore alerts section state
 * Restores saved section states from localStorage
 * 
 * @function restoreAlertsSectionState
 * @returns {void}
 */
function restoreAlertsSectionState() {
  // שימוש בפונקציה הגלובלית החדשה
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    // window.Logger.error('restoreAllSectionStates function not found in main.js', { page: "alerts" });
  }
}

// הגנה - וידוא שהפונקציות הגלובליות זמינות
// toggleSection fallback removed - using global version from ui-utils.js

// toggleSection fallback removed - use toggleSection('main') instead

// toggleSection function removed - using global version from ui-utils.js

  // אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
//   window.Logger.info('🚀 אתחול דף התראות...', { page: "alerts" });

  // שחזור מצב הסקשנים
  restoreAlertsSectionState();

  // יישום צבעי ישות על כותרות
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('alert');
  }

  // אתחול פילטרים
  if (typeof window.initializePageFilters === 'function') {
    window.initializePageFilters('alerts');
  }

  // טעינת נתונים
  window.Logger.info('📊 טעינת נתוני התראות...', { page: "alerts" });
  loadAlertsData();
  

  // טעינת מצב המיון
  if (typeof window.loadSortState === 'function') {
    window.loadSortState('alerts');
  }
  
//   window.Logger.info('✅ דף התראות אותחל בהצלחה', { page: "alerts" });
// });

// אתחול הדף - גרסה שנייה (מוסרת)
// document.addEventListener('DOMContentLoaded', function () {
//   // window.Logger.info('🔄 === DOM CONTENT LOADED (ALERTS, { page: "alerts" }) ===');
//   // ... קוד מוסר ...
// });

// פונקציה לעדכון הטבלה מפילטרים
if (window.location.pathname.includes('/alerts')) {
  window.updateGridFromComponent = function (_selectedStatuses, _selectedTypes, _selectedDateRange, _searchTerm) {
    // שמירת הפילטרים


    // טעינת נתונים מחדש עם הפילטרים החדשים
    if (typeof window.loadAlertsData === 'function') {
      window.loadAlertsData();
      
    } else {
      // window.Logger.error('❌ loadAlertsData function not found', { page: "alerts" });
    }
  };
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// הוספת הפונקציות לגלובל
// window.loadAlertsData כבר מוגדר בתחילת הקובץ
window.updateAlertsTable = updateAlertsTable;
window.updateAlertsSummary = updateAlertsSummary;
window.filterAlertsLocally = filterAlertsLocally;

/**
 * פילטר התראות לפי סוג אובייקט מקושר
 * פונקציה נוספת שמפעילה פילטר ספציפי בנוסף לפילטר הראשי
 * @param {string} type - סוג האובייקט: 'all', 'account', 'trade', 'trade_plan', 'ticker'
 */
function filterAlertsByRelatedObjectTypeWrapper(type) {
  // window.Logger.info('🔧 פילטר התראות לפי סוג אובייקט מקושר - סוג:', type, { page: "alerts" });

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
      btn.classList.remove('btn');
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.backgroundColor = 'white';
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.remove('active');
      btn.classList.add('btn');
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  });

  // מיפוי סוגים ל-ID
  const typeMapping = {
    'all': null,
    'account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4,
  };

  const targetTypeId = typeMapping[type];

  // פילטור הנתונים
  let filteredAlerts = window.alertsData || alertsData;

  if (type !== 'all') {
    filteredAlerts = (window.alertsData || alertsData).filter(alert =>
      alert.related_type_id === targetTypeId,
    );
  }

  // עדכון הטבלה עם הנתונים המסוננים
  updateAlertsTable(filteredAlerts);
  

  // עדכון ספירת רשומות
  const countElement = document.querySelector('.table-count');
  if (countElement) {
    countElement.textContent = `${filteredAlerts.length} התראות`;
  }

  // window.Logger.info(`✅ Filtered alerts by type '${type}': ${filteredAlerts.length} alerts found`, { page: "alerts" });
}

window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.showAddAlertModal = showAddAlertModal;
window.editAlert = editAlert;
// window.deleteAlert - הועבר ל-alert-service.js
window.saveAlert = saveAlert;
window.updateAlert = updateAlert;
window.updateStatusAndTriggered = updateStatusAndTriggered;
window.getAlertState = getAlertState;
window.validateAlertStatusCombination = validateAlertStatusCombination;
// window.sortTable export removed - using global version from tables.js


window.onRelationTypeChange = onRelationTypeChange;
window.onRelatedObjectChange = onRelatedObjectChange;
window.onEditRelationTypeChange = onEditRelationTypeChange;
window.onEditRelatedObjectChange = onEditRelatedObjectChange;
window.checkAlertVariable = checkAlertVariable;
window.checkAlertOperator = checkAlertOperator;
window.buildAlertCondition = buildAlertCondition;
window.parseAlertCondition = parseAlertCondition;
window.clearAlertValidation = clearAlertValidation;

// פונקציה לטעינת התראות (alias ל-loadAlertsData)
function loadAlerts() {
  const result = loadAlertsData();
  
  
  return result;
}

// חשיפת פונקציית loadAlerts
window.loadAlerts = loadAlerts;
// updateGridFromComponentGlobal הועבר ל-header-system.js

// פונקציות התראה מיובאות מ-main.js - אין צורך בייצוא כפול

// בדיקת זמינות פונקציות (ללא ניקוי אוטומטי)
setTimeout(() => {
  // window.Logger.info('🔍 בדיקת זמינות פונקציות alerts.js - ' + new Date(, { page: "alerts" }).toLocaleTimeString());
}, 18000);

// ========================================
// פונקציות לתרגום תנאי התראות
// ========================================

/**
 * פונקציה לתרגום תנאי התראה לעברית
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {string} - התנאי מתורגם לעברית
 */
// window.formatAlertCondition - הועבר ל-alert-service.js

/**
 * פונקציה לפרסור תנאי התראה
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {object} - אובייקט עם המשתנה, האופרטור והערך
 */
// window.parseAlertCondition - הועבר ל-alert-service.js

/**
 * הפעלה מחדש של התראה מבוטלת
 * @param {number} alertId - מזהה ההתראה
 */
async function reactivateAlert(alertId) {
  // אישור מהמשתמש
  if (typeof window.showConfirmationDialog === 'function') {
    const confirmed = await new Promise(resolve => {
      window.showConfirmationDialog(
        'הפעלה מחדש של התראה',
        'האם אתה בטוח שברצונך להפעיל מחדש את ההתראה?',
        () => resolve(true),
        () => resolve(false),
      );
    });
    if (!confirmed) {return;}
  } else {
    // Fallback למקרה שמערכת התראות לא זמינה
    if (!window.confirm('האם אתה בטוח שברצונך להפעיל מחדש את ההתראה?')) {
      return;
    }
  }

  try {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    if (response.ok) {
      showSuccessMessage('התראה הופעלה מחדש בהצלחה!');

      // רענון הטבלה
      if (typeof window.loadAlertsData === 'function') {
        await window.loadAlertsData();
        
        // רענון כפוי של הטבלה
        setTimeout(() => {
          if (window.loadAlertsData) {
            window.loadAlertsData();
          }
        }, 500);
      }
    } else {
      const data = await response.json();
      showErrorMessage(data.message || 'שגיאה בהפעלה מחדש של התראה');
    }
  } catch (error) {
    handleSystemError(error, 'הפעלה מחדש של התראה');
    showErrorMessage('שגיאה בהפעלה מחדש של התראה');
  }
}

// הוספת הפונקציה לחלון הגלובלי
window.reactivateAlert = reactivateAlert;

// window.Logger.info('✅ alerts.js הושלם בהצלחה - כל הפונקציות זמינות', { page: "alerts" });

// בדיקת ייצוא פונקציות
// window.Logger.info('🔍 בדיקת ייצוא פונקציות alerts.js:', { page: "alerts" });
// window.Logger.info('- loadAlertsData:', typeof window.loadAlertsData, { page: "alerts" });
// window.Logger.info('- updateAlertsTable:', typeof window.updateAlertsTable, { page: "alerts" });
// window.Logger.info('- showAddAlertModal:', typeof window.showAddAlertModal, { page: "alerts" });
// window.Logger.info('- editAlert:', typeof window.editAlert, { page: "alerts" });
// window.Logger.info('- deleteAlert:', typeof window.deleteAlert, { page: "alerts" });
// window.Logger.info('- formatAlertCondition:', typeof window.formatAlertCondition, { page: "alerts" });
// window.Logger.info('- parseAlertCondition:', typeof window.parseAlertCondition, { page: "alerts" });
// window.Logger.info('- clearAlertValidation:', typeof window.clearAlertValidation, { page: "alerts" });

/**
 * בדיקת תנאי התראה
 * בודק אם תנאי התראה מתקיים עבור טיקר מסוים
 * @param {Object} alert - אובייקט ההתראה
 * @param {Object} tickerData - נתוני הטיקר הנוכחיים
 */
function checkAlertCondition(alert, tickerData) {
  try {
    window.Logger.info('🔍 בודק תנאי התראה:', alert.id, tickerData, { page: "alerts" });
    
    if (!alert || !tickerData) {
      throw new Error('נתונים חסרים לבדיקת תנאי התראה');
    }
    
    // פרסור תנאי ההתראה
    const condition = alert.condition || '';
    const targetValue = parseFloat(alert.target_value) || 0;
    const currentPrice = parseFloat(tickerData.price) || 0;
    
    let conditionMet = false;
    let message = '';
    
    // בדיקת תנאים שונים
    if (condition.includes('>') && condition.includes('price')) {
      conditionMet = currentPrice > targetValue;
      message = `מחיר ${tickerData.symbol} (${currentPrice}) גבוה מ-${targetValue}`;
    } else if (condition.includes('<') && condition.includes('price')) {
      conditionMet = currentPrice < targetValue;
      message = `מחיר ${tickerData.symbol} (${currentPrice}) נמוך מ-${targetValue}`;
    } else if (condition.includes('=') && condition.includes('price')) {
      conditionMet = Math.abs(currentPrice - targetValue) < 0.01;
      message = `מחיר ${tickerData.symbol} (${currentPrice}) שווה ל-${targetValue}`;
    }
    
    // אם התנאי מתקיים, הצגת התראה
    if (conditionMet) {
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('התראה פעילה!', message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(`התראה: ${message}`, 'warning');
      }
      
      // עדכון סטטוס ההתראה
      updateAlertStatus(alert.id, 'triggered');
    }
    
    return conditionMet;
    
  } catch (error) {
    window.Logger.error('שגיאה בבדיקת תנאי התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בבדיקת תנאי התראה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בבדיקת תנאי התראה', 'error');
    }
    return false;
  }
}

/**
 * הפעלה/כיבוי התראה
 * מחליף את מצב ההפעלה של התראה
 * @param {number} alertId - מזהה ההתראה
 */
function toggleAlert(alertId) {
  try {
    window.Logger.info('🔄 מחליף מצב התראה:', alertId, { page: "alerts" });
    
    // חיפוש ההתראה בנתונים
    const alert = (window.alertsData || alertsData).find(a => a.id === alertId);
    if (!alert) {
      throw new Error('התראה לא נמצאה');
    }
    
    // החלפת מצב ההפעלה
    const newStatus = alert.is_active ? 'inactive' : 'active';
    const newIsActive = !alert.is_active;
    
    // עדכון בשרת
    fetch('/api/alerts/' + alertId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: newIsActive,
        status: newStatus
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון מצב התראה');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ מצב התראה עודכן:', data, { page: "alerts" });
      
      // עדכון הנתונים המקומיים
      alert.is_active = newIsActive;
      alert.status = newStatus;
      
      // רענון הטבלה
      updateAlertsTable(alertsData);
      
      // עדכון סטטיסטיקות
      if (typeof updateAlertsSummary === 'function') {
        updateAlertsSummary(alertsData);
      }
      
      // הודעת הצלחה
      const statusText = newIsActive ? 'הופעלה' : 'כובתה';
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(`התראה ${statusText} בהצלחה`);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(`התראה ${statusText} בהצלחה`, 'success');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בעדכון מצב התראה:', error, { page: "alerts" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון מצב התראה', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון מצב התראה', 'error');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בהחלפת מצב התראה:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהחלפת מצב התראה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהחלפת מצב התראה', 'error');
    }
  }
}

/**
 * עדכון סטטוס התראה
 * @deprecated Use window.alertService.updateAlertStatus(alertId, status, isTriggered) instead
 * @param {number} alertId - מזהה ההתראה
 * @param {string} status - הסטטוס החדש
 */
function updateAlertStatus(alertId, status) {
  // קריאה לשירות המאוחד
  if (window.alertService && window.alertService.updateAlertStatus) {
    return window.alertService.updateAlertStatus(alertId, status);
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
    try {
      fetch('/api/alerts/' + alertId + '/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('שגיאה בעדכון סטטוס התראה');
        }
        return response.json();
      })
      .then(data => {
        window.Logger.info('✅ סטטוס התראה עודכן:', data, { page: "alerts" });
      })
      .catch(error => {
        window.Logger.error('שגיאה בעדכון סטטוס התראה:', error, { page: "alerts" });
      });
      
    } catch (error) {
      window.Logger.error('שגיאה בעדכון סטטוס התראה:', error, { page: "alerts" });
    }
  }
}

// ========================================
// אתחול מערכת ראש הדף החדשה
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  window.Logger.info('🚀 טעינת דף התראות עם מערכת ראש דף חדשה...', { page: "alerts" });

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    window.Logger.info('✅ אתחול HeaderSystem...', { page: "alerts" });
    window.headerSystem.init();
  }

  // וידוא שהמודולים נסגרים בלחיצה על הרקע
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    // הוספת data-bs-backdrop אם לא קיים
    if (!modal.hasAttribute('data-bs-backdrop')) {
      modal.setAttribute('data-bs-backdrop', 'true');
    }
    
    // הוספת data-bs-keyboard אם לא קיים
    if (!modal.hasAttribute('data-bs-keyboard')) {
      modal.setAttribute('data-bs-keyboard', 'true');
    }

    // הוספת event listener לסגירה בלחיצה על הרקע
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
  });
});

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions


// Filter functions - removed duplicate

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.loadAlertsData = window.loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.updatePageSummaryStats = updatePageSummaryStats;
window.showAddAlertModal = showAddAlertModal;
window.hideAddAlertModal = hideAddAlertModal;
window.showEditAlertModal = showEditAlertModal;
window.hideEditAlertModal = hideEditAlertModal;
window.clearAlertValidation = clearAlertValidation;
window.validateAlertForm = validateAlertForm;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;
window.onRelationTypeChange = onRelationTypeChange;
window.onRelatedObjectChange = onRelatedObjectChange;
window.enableConditionFields = enableConditionFields;
window.disableConditionFields = disableConditionFields;
window.populateRelatedObjects = populateRelatedObjects;
window.getDemoAlertsData = getDemoAlertsData;
window.filterAlertsLocally = filterAlertsLocally;
window.loadModalData = loadModalData;
window.saveAlert = saveAlert;
window.updateAlert = updateAlert;
window.updateStatusAndTriggered = updateStatusAndTriggered;
window.restoreAlertsSectionState = restoreAlertsSectionState;
window.loadConditionsFromSource = loadConditionsFromSource;
window.loadTradePlansForConditions = loadTradePlansForConditions;
window.loadTradesForConditions = loadTradesForConditions;
window.loadConditionsFromItem = loadConditionsFromItem;
window.evaluateAllConditions = evaluateAllConditions;
window.updateEvaluationStats = updateEvaluationStats;
window.initializeAlertConditionBuilder = initializeAlertConditionBuilder;
window.cleanupAlertConditionBuilder = cleanupAlertConditionBuilder;
window.showAddAlertModal = showAddAlertModal;
window.showEditAlertModal = showEditAlertModal;
window.saveAlertData = saveAlertData;
window.generateDetailedLog = generateDetailedLog;
window.generateDetailedLogForAlerts = generateDetailedLogForAlerts;

/**
 * Generate detailed log for alerts page
 * @function generateDetailedLog
 * @returns {string} JSON string of log data
 */
function generateDetailedLog() {
    const alertsStats = {
        totalAlerts: document.getElementById('totalAlerts')?.textContent || 'לא נמצא',
        activeAlerts: document.getElementById('activeAlerts')?.textContent || 'לא נמצא',
        newAlerts: document.getElementById('newAlerts')?.textContent || 'לא נמצא',
        todayAlerts: document.getElementById('todayAlerts')?.textContent || 'לא נמצא',
        weekAlerts: document.getElementById('weekAlerts')?.textContent || 'לא נמצא'
    };
    
    // Use unified function from logger-service.js
    return window.generateDetailedLog('alerts', alertsStats);
}


// Export functions to global scope for onclick attributes
// window.toggleSection removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
// window.loadAlertsData כבר מוגדר בשורה 2241
window.updateAlertsTable = updateAlertsTable;
window.updateAlertsSummary = updateAlertsSummary;

/**
 * עדכון סטטיסטיקות ההתראות
 * @param {Array} alerts - מערך התראות
 */
function updateAlertsSummary(alerts) {
  window.Logger.info('📊 מעדכן סטטיסטיקות התראות:', alerts ? alerts.length : 0, 'התראות', { page: "alerts" });
  
  if (!alerts || !Array.isArray(alerts)) {
    window.Logger.warn('⚠️ alerts parameter is not available or not an array', { page: "alerts" });
    return;
  }

  // חישוב סטטיסטיקות
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(alert => alert.status === 'open').length;
  const newAlerts = alerts.filter(alert => alert.is_triggered === 'new').length;
  
  // התראות היום
  const today = new Date().toDateString();
  const todayAlerts = alerts.filter(alert => {
    if (!alert.created_at) return false;
    return new Date(alert.created_at).toDateString() === today;
  }).length;
  
  // התראות השבוע
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAlerts = alerts.filter(alert => {
    if (!alert.created_at) return false;
    return new Date(alert.created_at) >= weekAgo;
  }).length;

  // עדכון האלמנטים
  const totalElement = document.getElementById('totalAlerts');
  const activeElement = document.getElementById('activeAlerts');
  const newElement = document.getElementById('newAlerts');
  const todayElement = document.getElementById('todayAlerts');
  const weekElement = document.getElementById('weekAlerts');

  if (totalElement) totalElement.textContent = totalAlerts;
  if (activeElement) activeElement.textContent = activeAlerts;
  if (newElement) newElement.textContent = newAlerts;
  if (todayElement) todayElement.textContent = todayAlerts;
  if (weekElement) weekElement.textContent = weekAlerts;

  window.Logger.info('✅ סטטיסטיקות התראות עודכנו:', {
    total: totalAlerts,
    active: activeAlerts,
    new: newAlerts,
    today: todayAlerts,
    week: weekAlerts
  }, { page: "alerts" });
}
window.showAddAlertModal = showAddAlertModal;
window.editAlert = editAlert;
// window.deleteAlert לא מוגדר - צריך ליצור את הפונקציה
// window. export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local  function for alerts page
async function generateDetailedLogForAlerts() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        window.Logger.error('שגיאה בהעתקה:', err, { page: "alerts" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// ===== CONDITIONS INTEGRATION FUNCTIONS =====

/**
 * Load conditions from source type (trade_plan or trade)
 */
function loadConditionsFromSource() {
    const sourceType = document.getElementById('conditionSourceType').value;
    const sourceIdSelect = document.getElementById('conditionSourceId');
    
    if (!sourceType) {
        sourceIdSelect.disabled = true;
        sourceIdSelect.innerHTML = '<option value="">בחר קודם מקור</option>';
        return;
    }
    
    // Load items based on source type
    if (sourceType === 'trade_plan') {
        loadTradePlansForConditions();
    } else if (sourceType === 'trade') {
        loadTradesForConditions();
    }
}

/**
 * Load trade plans for conditions selection
 */
async function loadTradePlansForConditions() {
    try {
        const response = await fetch('/api/trade_plans');
        if (!response.ok) throw new Error('Failed to load trade plans');
        
        const tradePlans = await response.json();
        const sourceIdSelect = document.getElementById('conditionSourceId');
        
        sourceIdSelect.innerHTML = '<option value="">בחר תכנית מסחר</option>';
        tradePlans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = `${plan.name} (${plan.ticker})`;
            sourceIdSelect.appendChild(option);
        });
        
        sourceIdSelect.disabled = false;
        
    } catch (error) {
        window.Logger.error('Error loading trade plans:', error, { page: "alerts" });
        showErrorNotification('שגיאה בטעינת תכניות מסחר');
    }
}

/**
 * Load trades for conditions selection
 */
async function loadTradesForConditions() {
    try {
        const response = await fetch('/api/trades');
        if (!response.ok) throw new Error('Failed to load trades');
        
        const trades = await response.json();
        const sourceIdSelect = document.getElementById('conditionSourceId');
        
        sourceIdSelect.innerHTML = '<option value="">בחר טרייד</option>';
        trades.forEach(trade => {
            const option = document.createElement('option');
            option.value = trade.id;
            option.textContent = `${trade.ticker} - ${trade.type} (${trade.status})`;
            sourceIdSelect.appendChild(option);
        });
        
        sourceIdSelect.disabled = false;
        
    } catch (error) {
        window.Logger.error('Error loading trades:', error, { page: "alerts" });
        showErrorNotification('שגיאה בטעינת טריידים');
    }
}

/**
 * Load conditions from selected item
 */
async function loadConditionsFromItem() {
    const sourceType = document.getElementById('conditionSourceType').value;
    const sourceId = document.getElementById('conditionSourceId').value;
    
    if (!sourceType || !sourceId) {
        document.getElementById('availableConditionsList').innerHTML = 
            '<div class="text-muted text-center py-3">בחר מקור ופריט כדי לראות תנאים זמינים</div>';
        return;
    }
    
    try {
        let endpoint;
        if (sourceType === 'trade_plan') {
            endpoint = `/api/plan_conditions?plan_id=${sourceId}`;
        } else if (sourceType === 'trade') {
            endpoint = `/api/trade_conditions?trade_id=${sourceId}`;
        }
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to load conditions');
        
        const conditions = await response.json();
        displayAvailableConditions(conditions, sourceType);
        
    } catch (error) {
        window.Logger.error('Error loading conditions:', error, { page: "alerts" });
        showErrorNotification('שגיאה בטעינת תנאים');
    }
}

/**
 * Display available conditions for selection
 */
function displayAvailableConditions(conditions, sourceType) {
    const container = document.getElementById('availableConditionsList');
    
    if (!conditions || conditions.length === 0) {
        container.innerHTML = '<div class="text-muted text-center py-3">אין תנאים זמינים לפריט זה</div>';
        return;
    }
    
    let html = '<div class="row">';
    conditions.forEach(condition => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card condition-card" data-condition-id="${condition.id}" data-source-type="${sourceType}">
                    <div class="card-body">
                        <h6 class="card-title">${condition.method_name || 'תנאי לא ידוע'}</h6>
                        <p class="card-text small text-muted">${condition.parameters_json || 'אין פרמטרים'}</p>
                        <button class="btn btn-sm" onclick="selectConditionForAlert(${condition.id}, '${sourceType}')">
                            בחר תנאי זה
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

/**
 * Select condition for alert creation
 */
function selectConditionForAlert(conditionId, sourceType) {
    // Store selected condition
    window.selectedConditionForAlert = {
        id: conditionId,
        sourceType: sourceType
    };
    
    // Show alert configuration section
    document.getElementById('alertConfigSection').style.display = 'block';
    
    // Scroll to configuration section
    document.getElementById('alertConfigSection').scrollIntoView({ behavior: 'smooth' });
    
    // Highlight selected condition
    document.querySelectorAll('.condition-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-condition-id="${conditionId}"]`).classList.add('selected');
    
    showSuccessNotification('תנאי נבחר בהצלחה. הגדר את פרטי ההתראה למטה.');
}

/**
 * Create alert from selected condition
 */
async function createAlertFromCondition() {
    if (!window.selectedConditionForAlert) {
        showErrorNotification('אנא בחר תנאי קודם');
        return;
    }
    
    const message = document.getElementById('alertMessageFromCondition').value;
    const state = document.getElementById('alertStateFromCondition').value;
    
    if (!message) {
        showErrorNotification('אנא הזן הודעת התראה');
        return;
    }
    
    try {
        const alertData = {
            condition_id: window.selectedConditionForAlert.id,
            condition_type: window.selectedConditionForAlert.sourceType,
            message: message,
            state: state,
            auto_created: false
        };
        
        const response = await fetch('/api/alerts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alertData)
        });
        
        if (!response.ok) throw new Error('Failed to create alert');
        
        const newAlert = await response.json();
        
        showSuccessNotification('התראה נוצרה בהצלחה מתנאי קיים');
        
        // Close modal and refresh alerts list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAlertModal'));
        modal.hide();
        
        // Refresh alerts data
        if (typeof loadAlertsData === 'function') {
            loadAlertsData();
        }
        
    } catch (error) {
        window.Logger.error('Error creating alert from condition:', error, { page: "alerts" });
        showErrorNotification('שגיאה ביצירת התראה מתנאי');
    }
}

// Export functions to global scope
window.loadConditionsFromSource = loadConditionsFromSource;
window.loadConditionsFromItem = loadConditionsFromItem;
window.selectConditionForAlert = selectConditionForAlert;
window.createAlertFromCondition = createAlertFromCondition;
window.initializeAlertModalTabs = initializeAlertModalTabs;
window.updateModalButtons = updateModalButtons;

// ===== TAB MANAGEMENT =====

/**
 * Initialize tab management for add alert modal
 */
function initializeAlertModalTabs() {
    const addAlertModal = document.getElementById('addAlertModal');
    if (!addAlertModal) return;
    
    // Add event listeners for tab changes
    const tabButtons = addAlertModal.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(event) {
            const targetTab = event.target.getAttribute('data-bs-target');
            updateModalButtons(targetTab);
        });
    });
}

/**
 * Update modal buttons based on active tab
 */
function updateModalButtons(activeTab) {
    const addAlertBtn = document.querySelector('button[onclick="addAlert()"]');
    const createFromConditionBtn = document.getElementById('createFromConditionBtn');
    
    if (activeTab === '#add-manual-pane') {
        // Manual alert tab
        if (addAlertBtn) addAlertBtn.style.display = 'inline-block';
        if (createFromConditionBtn) createFromConditionBtn.style.display = 'none';
    } else if (activeTab === '#add-from-condition-pane') {
        // From condition tab
        if (addAlertBtn) addAlertBtn.style.display = 'none';
        if (createFromConditionBtn) createFromConditionBtn.style.display = 'inline-block';
    }
}

// Initialize tab management when modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const addAlertModal = document.getElementById('addAlertModal');
    if (addAlertModal) {
        addAlertModal.addEventListener('shown.bs.modal', function() {
            initializeAlertModalTabs();
            // Set default tab to manual
            updateModalButtons('#add-manual-pane');
        });
    }
    
    // Initialize edit alert modal
    const editAlertModal = document.getElementById('editAlertModal');
    if (editAlertModal) {
        editAlertModal.addEventListener('hidden.bs.modal', function() {
            // Clean up condition builder when modal is closed
            cleanupAlertConditionBuilder();
        });
    }
});

// ===== CONDITION EVALUATION FUNCTIONS =====

/**
 * הערכת כל התנאים הפעילים במערכת
 */
async function evaluateAllConditions() {
    try {
        window.Logger.info('🔍 מתחיל הערכת כל התנאים...', { page: "alerts" });
        
        // הצגת אינדיקטור טעינה
        showEvaluationLoading();
        
        // קריאה לשרת להערכת כל התנאים
        const response = await fetch('/api/plan-conditions/evaluate-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        window.Logger.info('📊 תוצאות הערכת תנאים:', data, { page: "alerts" });
        
        // הצגת התוצאות
        displayEvaluationResults(data);
        
        // עדכון סטטיסטיקות
        updateEvaluationSummary(data);
        
        window.Logger.info('✅ הערכת תנאים הושלמה בהצלחה', { page: "alerts" });
        
    } catch (error) {
        window.Logger.error('❌ שגיאה בהערכת תנאים:', error, { page: "alerts" });
        showErrorNotification('שגיאה בהערכת תנאים: ' + error.message);
    }
}

/**
 * רענון תוצאות הערכת תנאים
 */
async function refreshConditionEvaluations() {
    try {
        window.Logger.info('🔄 מרענן תוצאות הערכת תנאים...', { page: "alerts" });
        
        // הצגת אינדיקטור טעינה
        showEvaluationLoading();
        
        // קריאה לשרת לקבלת התראות חדשות
        const response = await fetch('/api/alerts/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        window.Logger.info('📊 התראות מעודכנות:', data, { page: "alerts" });
        
        // עדכון טבלת ההתראות
        if (typeof window.updateAlertsTable === 'function') {
            window.updateAlertsTable(data.data || data);
        }
        
        // עדכון סטטיסטיקות
        if (typeof window.updateAlertsSummary === 'function') {
            window.updateAlertsSummary(data.data || data);
        }
        
        window.Logger.info('✅ רענון הושלם בהצלחה', { page: "alerts" });
        
    } catch (error) {
        window.Logger.error('❌ שגיאה ברענון:', error, { page: "alerts" });
        showErrorNotification('שגיאה ברענון: ' + error.message);
    }
}

/**
 * הצגת אינדיקטור טעינה להערכת תנאים
 */
function showEvaluationLoading() {
    const resultsDiv = document.getElementById('conditionEvaluationResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="alert alert-info">
                <h5>📊 הערכת תנאים</h5>
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-2" role="status">
                        <span class="visually-hidden">טוען...</span>
                    </div>
                    <span>מעריך תנאים...</span>
                </div>
            </div>
        `;
    }
}

/**
 * הצגת תוצאות הערכת תנאים
 */
function displayEvaluationResults(data) {
    const resultsDiv = document.getElementById('conditionEvaluationResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        
        const results = data.data || data;
        const metCount = results.filter(r => r.met).length;
        const notMetCount = results.length - metCount;
        
        resultsDiv.innerHTML = `
            <div class="alert alert-info">
                <h5>📊 תוצאות הערכת תנאים</h5>
                <div id="evaluationSummary">
                    <div>סה"כ תנאים: <strong>${results.length}</strong></div>
                    <div>תנאים שהתקיימו: <strong class="text-success">${metCount}</strong></div>
                    <div>תנאים שלא התקיימו: <strong class="text-danger">${notMetCount}</strong></div>
                    <div>זמן הערכה: <strong>${new Date().toLocaleTimeString('he-IL')}</strong></div>
                </div>
            </div>
        `;
    }
}

/**
 * עדכון סטטיסטיקות הערכת תנאים
 */
function updateEvaluationSummary(data) {
    const results = data.data || data;
    const metCount = results.filter(r => r.met).length;
    const notMetCount = results.length - metCount;
    
    // עדכון אלמנטים
    const totalConditions = document.getElementById('totalConditions');
    const metConditions = document.getElementById('metConditions');
    const notMetConditions = document.getElementById('notMetConditions');
    const evaluationTime = document.getElementById('evaluationTime');
    
    if (totalConditions) totalConditions.textContent = results.length;
    if (metConditions) metConditions.textContent = metCount;
    if (notMetConditions) notMetConditions.textContent = notMetCount;
    if (evaluationTime) evaluationTime.textContent = new Date().toLocaleTimeString('he-IL');
}

// ===== ADVANCED CONDITION BUILDER FUNCTIONS =====

/**
 * אתחול הממשק המתקדם לבניית תנאי במודל העריכה
 * @param {Object} alert - נתוני ההתראה לעריכה
 */
function initializeAlertConditionBuilder(alert) {
    try {
        window.Logger.info('🔧 Initializing alert condition builder for alert:', alert.id, { page: "alerts" });
        
        // בדיקה שהממשק המתקדם זמין
        if (typeof ConditionBuilder === 'undefined') {
            window.Logger.warn('⚠️ ConditionBuilder not available, using basic form', { page: "alerts" });
            return false;
        }
        
        const containerId = 'editAlertConditionBuilder';
        const alertId = alert.id;
        
        // יצירת ConditionBuilder חדש
        const conditionBuilder = new ConditionBuilder('alert', alertId, containerId);
        
        // שמירה בגלובל לנגישות
        window.editAlertConditionBuilder = conditionBuilder;
        
        // טעינת תנאי קיים אם יש
        if (alert.condition_attribute && alert.condition_operator && alert.condition_number) {
            const existingCondition = {
                method_id: getMethodIdFromCondition(alert.condition_attribute, alert.condition_operator),
                parameters: {
                    value: parseFloat(alert.condition_number),
                    operator: alert.condition_operator,
                    attribute: alert.condition_attribute
                }
            };
            
            // הוספת התנאי הקיים לממשק
            conditionBuilder.addCondition(existingCondition);
        }
        
        window.Logger.info('✅ Alert condition builder initialized successfully', { page: "alerts" });
        return true;
        
    } catch (error) {
        window.Logger.error('❌ Error initializing alert condition builder:', error, { page: "alerts" });
        return false;
    }
}

/**
 * קבלת מזהה שיטה מתנאי קיים
 * @param {string} attribute - מאפיין התנאי
 * @param {string} operator - אופרטור התנאי
 * @returns {number} מזהה השיטה
 */
function getMethodIdFromCondition(attribute, operator) {
    // מיפוי מאפיינים לשיטות
    const methodMapping = {
        'price': 1, // Moving Averages
        'volume': 2, // Volume Analysis
        'ma': 1, // Moving Averages
        'change': 3 // Support/Resistance
    };
    
    return methodMapping[attribute] || 1; // ברירת מחדל: Moving Averages
}

/**
 * ניקוי הממשק המתקדם
 */
function cleanupAlertConditionBuilder() {
    try {
        if (window.editAlertConditionBuilder) {
            // ניקוי אם יש פונקציית cleanup
            if (typeof window.editAlertConditionBuilder.cleanup === 'function') {
                window.editAlertConditionBuilder.cleanup();
            }
            window.editAlertConditionBuilder = null;
        }
    } catch (error) {
        window.Logger.error('❌ Error cleaning up alert condition builder:', error, { page: "alerts" });
    }
}

// ===== MODAL FUNCTIONS - NEW SYSTEM =====

/**
 * הצגת מודל הוספת התראה
 * Uses ModalManagerV2 for consistent modal experience
 */
function showAddAlertModal() {
    window.Logger.debug('showAddAlertModal called', { page: 'alerts' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('alertsModal', 'add');
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * הצגת מודל עריכת התראה
 * Uses ModalManagerV2 for consistent modal experience
 */
function showEditAlertModal(alertId) {
    window.Logger.debug('showEditAlertModal called', { alertId, page: 'alerts' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showEditModal('alertsModal', 'alert', alertId);
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * שמירת התראה
 * Handles both add and edit modes
 */
async function saveAlert() {
    window.Logger.debug('saveAlert called', { page: 'alerts' });
    
    try {
        // Collect form data
        const form = document.getElementById('alertsModalForm');
        if (!form) {
            throw new Error('Alert form not found');
        }
        
        const formData = new FormData(form);
        const alertData = {
            ticker_id: formData.get('alertTicker'),
            name: formData.get('alertName'),
            type: formData.get('alertType'),
            value: parseFloat(formData.get('alertValue')),
            condition: formData.get('alertCondition'),
            expiry_date: formData.get('alertExpiry') || null,
            status: formData.get('alertStatus'),
            email_notification: formData.get('alertEmail') === 'on',
            sms_notification: formData.get('alertSms') === 'on',
            notes: formData.get('alertNotes')
        };
        
        // Validate data
        if (!window.validateEntityForm) {
            throw new Error('Validation system not available');
        }
        
        const isValid = window.validateEntityForm('alertsModalForm', {
            alertTicker: { required: true },
            alertName: { required: true, minLength: 2, maxLength: 100 },
            alertType: { required: true },
            alertValue: { required: true, min: 0 },
            alertCondition: { required: true },
            alertExpiry: { required: false },
            alertStatus: { required: true },
            alertEmail: { required: false },
            alertSms: { required: false },
            alertNotes: { required: false, maxLength: 500 }
        });
        
        if (!isValid) {
            window.Logger.warn('Alert validation failed', { page: 'alerts' });
            return;
        }
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const alertId = form.dataset.alertId;
        
        // Prepare API call
        const url = isEdit ? `/api/alerts/${alertId}` : '/api/alerts';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(alertData)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle success
        if (window.showNotification) {
            const message = isEdit ? 'התראה עודכנה בהצלחה' : 'התראה נוספה בהצלחה';
            window.showNotification(message, 'success', 'business');
        }
        
        // Close modal
        if (window.ModalManagerV2) {
            window.ModalManagerV2.hideModal('alertsModal');
        }
        
        // Refresh data
        if (window.loadAlertsData) {
            window.loadAlertsData();
        }
        
        window.Logger.info('Alert saved successfully', { alertId: result.id, page: 'alerts' });
        
    } catch (error) {
        window.Logger.error('Error saving alert', { error: error.message, page: 'alerts' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה בשמירת ההתראה', 'error', 'system');
        }
    }
}

/**
 * מחיקת התראה
 * Includes linked items check
 */
async function deleteAlert(alertId) {
    window.Logger.debug('deleteAlert called', { alertId, page: 'alerts' });
    
    try {
        // Check linked items first
        if (window.checkLinkedItemsBeforeAction) {
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('alert', alertId, 'delete');
            if (hasLinkedItems) {
                window.Logger.info('Alert has linked items, deletion cancelled', { alertId, page: 'alerts' });
                return;
            }
        }
        
        // Confirm deletion
        if (!confirm('האם אתה בטוח שברצונך למחוק את ההתראה?')) {
            return;
        }
        
        // Send delete request
        const response = await fetch(`/api/alerts/${alertId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // Handle success
        if (window.showNotification) {
            window.showNotification('התראה נמחקה בהצלחה', 'success', 'business');
        }
        
        // Refresh data
        if (window.loadAlertsData) {
            window.loadAlertsData();
        }
        
        window.Logger.info('Alert deleted successfully', { alertId, page: 'alerts' });
        
    } catch (error) {
        window.Logger.error('Error deleting alert', { error: error.message, alertId, page: 'alerts' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה במחיקת ההתראה', 'error', 'system');
        }
    }
}

// Export functions to window for global access
window.showAddAlertModal = showAddAlertModal;
window.showEditAlertModal = showEditAlertModal;
window.saveAlert = saveAlert;
window.deleteAlert = deleteAlert;
