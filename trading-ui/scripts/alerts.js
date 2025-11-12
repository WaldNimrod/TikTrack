/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 58
 * 
 * PAGE INITIALIZATION (2)
 * - initializeAlertModalTabs() - initializeAlertModalTabs function
 * - initializeAlertConditionBuilder() - * עדכון סטטיסטיקות הערכת תנאים
 * 
 * DATA LOADING (12)
 * - getDemoAlertsData() - getDemoAlertsData function
 * - loadAlertsData() - loadAlertsData function
 * - loadModalData() - loadModalData function
 * - getAlertState() - * עריכת התראה
 * - loadAlerts() - loadAlerts function
 * - loadConditionsFromSource() - loadConditionsFromSource function
 * - loadTradePlansForConditions() - * Load conditions from source type (trade_plan or trade)
 * - loadTradesForConditions() - * Load trade plans for conditions selection
 * - loadConditionsFromItem() - * Load trades for conditions selection
 * - showEvaluationLoading() - showEvaluationLoading function
 * - getMethodIdFromCondition() - getMethodIdFromCondition function
 * - loadAlertTickerInfo() - * הצגת מודל הוספת התראה
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
 * - updateEvaluationStats() - updateEvaluationStats function
 * - saveAlertData() - * Update evaluation statistics
 * - updateAlertsSummary() - updateAlertsSummary function
 * - createAlertFromCondition() - * Select condition for alert creation
 * - updateModalButtons() - * Initialize tab management for add alert modal
 * - updateEvaluationSummary() - updateEvaluationSummary function
 * - showAddAlertModal() - * ניקוי הממשק המתקדם
 * 
 * EVENT HANDLING (16)
 * - onRelationTypeChange() - onRelationTypeChange function
 * - onRelatedObjectChange() - * טיפול בשינוי סוג שיוך
 * - toggleConditionFields() - * טיפול בבחירת אובייקט
 * - enableConditionFields() - enableConditionFields function
 * - disableConditionFields() - * Enable condition fields for add modal
 * - enableEditConditionFields() - * Enable condition fields for add modal
 * - disableEditConditionFields() - * Enable condition fields for add modal
 * - parseAlertCondition() - parseAlertCondition function
 * - validateAlertStatusCombination() - validateAlertStatusCombination function
 * - restoreAlertsSectionState() - * אישור מחיקת התראה
 * - displayAvailableConditions() - displayAvailableConditions function
 * - selectConditionForAlert() - selectConditionForAlert function
 * - evaluateAllConditions() - evaluateAllConditions function
 * - refreshConditionEvaluations() - refreshConditionEvaluations function
 * - displayEvaluationResults() - * הצגת אינדיקטור טעינה להערכת תנאים
 * - cleanupAlertConditionBuilder() - * קבלת מזהה שיטה מתנאי קיים
 * 
 * UI UPDATES (2)
 * - showEditAlertModal() - * ניקוי הממשק המתקדם
 * - displayAlertTickerInfo() - * מחיקת התראה
 * 
 * VALIDATION (1)
 * - validateAlertForm() - validateAlertForm function
 * 
 * OTHER (10)
 * - populateSelect() - populateSelect function
 * - populateRelatedObjects() - * Enable condition fields for add modal
 * - populateEditRelatedObjects() - populateEditRelatedObjects function
 * - editAlert() - editAlert function
 * - filterAlertsByRelatedObjectTypeWrapper() - filterAlertsByRelatedObjectTypeWrapper function
 * - filterAlertsByRelatedObjectType() - filterAlertsByRelatedObjectType function
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

// Save global function reference BEFORE we export our own function
// We'll capture it when the function is first called, not at module load time
// This ensures we get the actual global function even if it loads after this file
let globalUpdatePageSummaryStats = null;

// ייצוא מוקדם של הפונקציה למניעת שגיאות
window.loadAlertsData = window.loadAlertsData || function() {
  // loadAlertsData not yet defined, using placeholder
  window.Logger.info('⚠️ loadAlertsData placeholder called', { page: "alerts" });
};

// ===== DATA LOADING FUNCTIONS =====
// Data fetching, table updates, and statistics

// Guard to prevent multiple simultaneous calls
let loadAlertsDataInProgress = false;
let loadAlertsDataPromise = null;
let alertsPaginationInstance = null;

/**
 * Load alerts data from server
 * Fetches all alerts and updates the table display
 * 
 * @function loadAlertsData
 * @async
 * @returns {Promise<void>}
 */
window.loadAlertsData = async function() {
  // Prevent multiple simultaneous calls
  if (loadAlertsDataInProgress) {
    window.Logger.info('⏳ loadAlertsData כבר רץ, ממתין לסיום הקריאה הקודמת...', { page: "alerts" });
    return loadAlertsDataPromise;
  }

  loadAlertsDataInProgress = true;
  loadAlertsDataPromise = (async () => {
    try {
      window.Logger.info('🚀🚀🚀 loadAlertsData התחיל 🚀🚀🚀', { page: "alerts" });

      // קריאה לשרת לקבלת נתוני התראות
      window.Logger.info('📡 קריאה לשרת לקבלת נתוני התראות...', { page: "alerts" });
      const response = await fetch('/api/alerts/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      window.Logger.info('📊 נתונים שהתקבלו מהשרת:', data, { page: "alerts" });

      // שמירת הנתונים במשתנה גלובלי
      const rawAlerts = data?.data || data;
      window.alertsData = Array.isArray(rawAlerts)
        ? rawAlerts.map(alert => ({
            ...alert,
            updated_at: alert.updated_at || alert.triggered_at || alert.created_at || alert.last_evaluated_at || null
          }))
        : [];
      window.Logger.info('💾 נתונים נשמרו ב-window.alertsData:', window.alertsData.length, 'התראות', { page: "alerts" });

      // עדכון הטבלה
      if (typeof window.updateAlertsTable === 'function') {
        window.Logger.info('📊 מעדכן את טבלת ההתראות', { page: "alerts" });
        await window.updateAlertsTable(window.alertsData);
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
      
      // Register table with UnifiedTableSystem after data is loaded
      if (typeof window.registerAlertsTables === 'function') {
        window.registerAlertsTables();
      }

      // Restore page state (filters, sort, sections, entity filters)
      await restorePageState('alerts');

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
      throw error;
    } finally {
      loadAlertsDataInProgress = false;
      loadAlertsDataPromise = null;
    }
  })();

  return loadAlertsDataPromise;
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
  const accountColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-trading-account-color') || getComputedStyle(document.documentElement).getPropertyValue('--entity-account-color');
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
 * REMOVED: Duplicate loadAlertsData function
 * This function has been replaced by window.loadAlertsData (defined above)
 * The new implementation includes proper guards to prevent multiple simultaneous calls
 * 
 * @deprecated Use window.loadAlertsData instead
 */

// REMOVED: filterAlertsLocally - unused function

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

function renderAlertsTableRows(alerts) {
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
        fetch('/api/trade-plans/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      accounts = (accountsResponse.data || accountsResponse || []).filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
      trades = (tradesResponse.data || tradesResponse || []).filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
      tradePlans = (tradePlansResponse.data || tradePlansResponse || []).filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
      tickers = (tickersResponse.data || tickersResponse || []).filter(item => !Array.isArray(item) && typeof item === 'object' && item !== null);
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
      tbody.innerHTML = '<tr><td colspan="11" class="text-center">אין התראות להצגה</td></tr>';
      return;
    }

    const tableHTML = alerts.map(alert => {
      // לוג לבדיקת מבנה הנתונים
      // window.Logger.info('🔍 Alert data structure:', alert, { page: "alerts" });
      
      // קבלת צבעי סטטוס דינמיים - שימוש במערכת הכללית
      // Note: statusClass removed - use window.renderStatus or FieldRendererService.renderStatus instead
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

      let relatedCellHtml = '';
      if (window.FieldRendererService && typeof window.FieldRendererService.renderLinkedEntity === 'function') {
        try {
          let displayName = '';
          let metaForEntity = { renderMode: 'notes-table' };
          const relatedType = parseInt(alert.related_type_id, 10);

          switch (relatedType) {
          case 1: { // Trading account
            const account = accounts.find(a => a && a.id === alert.related_id);
            const accountName = account?.name || account?.account_name || `חשבון מסחר ${alert.related_id}`;
            displayName = accountName;
            metaForEntity = {
              renderMode: 'notes-table',
              name: accountName,
              status: account?.status || '',
              currency: account?.currency_symbol || account?.currency || ''
            };
            break;
          }
          case 2: { // Trade
            const trade = trades.find(t => t && t.id === alert.related_id);
            const tradeTicker = trade?.ticker_symbol || trade?.ticker?.symbol || (() => {
              if (trade?.ticker_id) {
                const ticker = tickers.find(tk => tk && tk.id === trade.ticker_id);
                return ticker?.symbol;
              }
              return null;
            })();
            const tickerSymbol = tradeTicker || `טרייד ${alert.related_id}`;
            const tradeDateEnvelope = window.dateUtils?.ensureDateEnvelope
              ? window.dateUtils.ensureDateEnvelope(
                  trade?.created_at_envelope ||
                  trade?.createdAtEnvelope ||
                  trade?.created_at ||
                  trade?.opened_at ||
                  trade?.date ||
                  null
                )
              : (
                  trade?.created_at_envelope ||
                  trade?.createdAtEnvelope ||
                  trade?.created_at ||
                  trade?.opened_at ||
                  trade?.date ||
                  null
                );
            displayName = tickerSymbol;
            metaForEntity = {
              renderMode: 'notes-table',
              ticker: tickerSymbol,
              date: tradeDateEnvelope,
              date_envelope: tradeDateEnvelope,
              status: trade?.status || '',
              side: trade?.side || '',
              investment_type: trade?.investment_type || ''
            };
            break;
          }
          case 3: { // Trade plan
            const plan = tradePlans.find(p => p && p.id === alert.related_id);
            const planTicker = plan?.ticker?.symbol || plan?.ticker_symbol || (() => {
              if (plan?.ticker_id) {
                const ticker = tickers.find(tk => tk && tk.id === plan.ticker_id);
                return ticker?.symbol;
              }
              return null;
            })();
            const tickerSymbol = planTicker || `תוכנית ${alert.related_id}`;
            const planDateEnvelope = window.dateUtils?.ensureDateEnvelope
              ? window.dateUtils.ensureDateEnvelope(
                  plan?.created_at_envelope ||
                  plan?.createdAtEnvelope ||
                  plan?.created_at ||
                  plan?.date ||
                  null
                )
              : (
                  plan?.created_at_envelope ||
                  plan?.createdAtEnvelope ||
                  plan?.created_at ||
                  plan?.date ||
                  null
                );
            displayName = tickerSymbol;
            metaForEntity = {
              renderMode: 'notes-table',
              ticker: tickerSymbol,
              date: planDateEnvelope,
              date_envelope: planDateEnvelope,
              status: plan?.status || '',
              side: plan?.side || '',
              investment_type: plan?.investment_type || '',
              planned_amount: plan?.planned_amount || plan?.plannedAmount || null
            };
            break;
          }
          case 4: { // Ticker
            const ticker = tickers.find(tk => tk && tk.id === alert.related_id);
            const tickerSymbol = ticker?.symbol || `טיקר ${alert.related_id}`;
            displayName = tickerSymbol;
            metaForEntity = {
              renderMode: 'notes-table',
              ticker: tickerSymbol,
              status: ticker?.status || ''
            };
            break;
          }
          default:
            displayName = `אובייקט ${alert.related_id}`;
            metaForEntity = { renderMode: 'notes-table' };
          }

          relatedCellHtml = window.FieldRendererService.renderLinkedEntity(
            alert.related_type_id,
            alert.related_id,
            displayName,
            metaForEntity
          );
        } catch (error) {
          window.Logger?.warn('⚠️ renderLinkedEntity failed for alert row, falling back to legacy renderer', { error, alertId: alert.id }, { page: "alerts" });
          relatedCellHtml = '';
        }
      }

      if (!relatedCellHtml) {
        const relatedDisplay = relatedObjectInfo.display;
        const relatedClass = relatedObjectInfo.class;
        const relatedColor = relatedObjectInfo.color;
        const relatedBgColor = relatedObjectInfo.bgColor;

        relatedCellHtml = `
          <div class="related-object-cell ${relatedClass}"
           style="${relatedColor ? `color: ${relatedColor};` : ''} ${relatedBgColor ? `background-color: ${relatedBgColor};` : ''}"
           title="${relatedObjectInfo.type || 'כללי'}">
            ${relatedDisplay}
          </div>
        `;
      }

      // קביעת הסימבול לטור הראשון באמצעות המערכת הכללית
      const symbolDisplay = window.getRelatedObjectSymbol ? 
        window.getRelatedObjectSymbol(alert, dataSources) : '-';

      const createdRawEnvelope =
        alert.created_at_envelope ||
        alert.createdAtEnvelope ||
        alert.created_atEnvelope ||
        alert.createdAt_envelope ||
        null;
      const createdSource =
        createdRawEnvelope ||
        alert.created_at ||
        alert.createdAt ||
        alert.created_at_utc ||
        alert.createdAtUtc ||
        alert.created_at_iso ||
        alert.createdAtIso ||
        alert.created_at_local ||
        alert.createdAtLocal ||
        null;
      const createdEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(createdSource)
        : createdSource;
      const createdDateObj = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(createdEnvelope || null)
        : (createdEnvelope ? new Date(createdEnvelope) : null);
      const createdAtDisplay = createdEnvelope
        ? (
            window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function'
              ? window.FieldRendererService.renderDate(createdEnvelope, true)
              : window.dateUtils?.formatDate
                ? window.dateUtils.formatDate(createdEnvelope, { includeTime: true })
                : (() => {
                    try {
                      if (createdDateObj && !Number.isNaN(createdDateObj.getTime())) {
                        return createdDateObj.toLocaleString('he-IL', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      }
                    } catch (error) {
                      window.Logger?.warn('⚠️ createdAt fallback formatting failed', { error, alertId: alert?.id }, { page: 'alerts' });
                    }
                    return 'לא מוגדר';
                  })()
          )
        : 'לא מוגדר';
      const createdAtDataAttr = window.dateUtils?.getEpochMilliseconds
        ? window.dateUtils.getEpochMilliseconds(createdEnvelope)
        : (() => {
            if (!createdDateObj || Number.isNaN(createdDateObj.getTime())) {return '';}
            try {
              return createdDateObj.getTime();
            } catch {
              return '';
            }
          })();

      const triggeredRawEnvelope =
        alert.triggered_at_envelope ||
        alert.triggeredAtEnvelope ||
        alert.triggered_atEnvelope ||
        alert.triggeredAt_envelope ||
        null;
      const triggeredSource =
        triggeredRawEnvelope ||
        alert.triggered_at ||
        alert.triggeredAt ||
        alert.triggered_at_utc ||
        alert.triggeredAtUtc ||
        alert.triggered_at_iso ||
        alert.triggeredAtIso ||
        alert.triggered_at_local ||
        alert.triggeredAtLocal ||
        null;
      const triggeredEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(triggeredSource)
        : triggeredSource;
      const triggeredDateObj = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(triggeredEnvelope || null)
        : (triggeredEnvelope ? new Date(triggeredEnvelope) : null);
      const triggeredAtDisplay = triggeredEnvelope
        ? (
            window.FieldRendererService?.renderDate
              ? window.FieldRendererService.renderDate(triggeredEnvelope, true)
              : window.dateUtils?.formatDate
                ? window.dateUtils.formatDate(triggeredEnvelope, { includeTime: true })
                : (() => {
                    try {
                      if (triggeredDateObj && !Number.isNaN(triggeredDateObj.getTime())) {
                        return triggeredDateObj.toLocaleString('he-IL', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      }
                    } catch (error) {
                      window.Logger?.warn('⚠️ triggeredAt fallback formatting failed', { error, alertId: alert?.id }, { page: 'alerts' });
                    }
                    return '-';
                  })()
          )
        : '-';
      const triggeredAtDataAttr = window.dateUtils?.getEpochMilliseconds
        ? window.dateUtils.getEpochMilliseconds(triggeredEnvelope)
        : (() => {
            if (!triggeredDateObj || Number.isNaN(triggeredDateObj.getTime())) {return '';}
            try {
              return triggeredDateObj.getTime();
            } catch {
              return '';
            }
          })();

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

      const expiryRawEnvelope =
        alert.expiry_date_envelope ||
        alert.expiryDateEnvelope ||
        alert.expiry_dateEnvelope ||
        alert.expiryDate_envelope ||
        null;
      const expirySource = expiryRawEnvelope || alert.expiry_date || alert.expiryDate || null;
      const expiryEnvelope = window.dateUtils?.ensureDateEnvelope
        ? window.dateUtils.ensureDateEnvelope(expirySource)
        : expirySource;
      const expiryDateObj = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(expiryEnvelope || null)
        : (expiryEnvelope ? new Date(expiryEnvelope) : null);
      const expiryDisplay = expiryEnvelope
        ? (
            window.FieldRendererService?.renderDate
              ? window.FieldRendererService.renderDate(expiryEnvelope, false)
              : window.dateUtils?.formatDate
                ? window.dateUtils.formatDate(expiryEnvelope, { includeTime: false })
                : (() => {
                    try {
                      if (expiryDateObj && !Number.isNaN(expiryDateObj.getTime())) {
                        return expiryDateObj.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
                      }
                    } catch (error) {
                      window.Logger?.warn('⚠️ expiry date fallback failed', { error, alertId: alert?.id }, { page: 'alerts' });
                    }
                    return '-';
                  })()
          )
        : '-';
      const expiryDataAttr = window.dateUtils?.getEpochMilliseconds
        ? window.dateUtils.getEpochMilliseconds(expiryEnvelope)
        : (() => {
            if (!expiryDateObj || Number.isNaN(expiryDateObj.getTime())) {return '';}
            try {
              return expiryDateObj.getTime();
            } catch {
              return '';
            }
          })();

      return `
        <tr data-status="${alert.status || ''}" data-date="${createdAtDataAttr || ''}">
          <td class="related-cell">
            ${relatedCellHtml}
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
              (window.FieldRendererService ? window.FieldRendererService.renderStatus(alert.status, 'alert') : 
                `<span class="status-badge" data-status-category="unknown">${statusDisplay}</span>`)}
          </td>
          <td>
            ${window.renderBoolean ? window.renderBoolean(alert.is_triggered) : 
              `<span class="triggered-badge ${triggeredClass}">${triggeredDisplay}</span>`}
          </td>
          <td class="text-center">
            ${getConditionSourceDisplay(alert)}
          </td>
          <td data-date="${createdAtDataAttr || ''}"><span class="date-text">${createdAtDisplay}</span></td>
          <td data-date="${triggeredAtDataAttr || ''}"><span class="date-text">${triggeredAtDisplay}</span></td>
          <td data-date="${expiryDataAttr || ''}"><span class="date-text">${expiryDisplay}</span></td>
          ${(() => {
            if (typeof window.renderUpdatedCell === 'function') {
              return window.renderUpdatedCell(alert, {
                fields: ['updated_at', 'triggered_at', 'created_at'],
                columnClass: 'col-updated'
              });
            }
            const fallbackDate = window.toDateObject
              ? window.toDateObject(alert.updated_at || alert.triggered_at || alert.created_at)
              : (alert.updated_at || alert.triggered_at || alert.created_at
                  ? new Date(alert.updated_at || alert.triggered_at || alert.created_at)
                  : null);
            if (!(fallbackDate instanceof Date) || Number.isNaN(fallbackDate?.getTime?.())) {
              return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
            }
            const absolute = fallbackDate.toLocaleString('he-IL');
            const duration = typeof window.getDurationSince === 'function'
              ? window.getDurationSince(fallbackDate, { fallback: absolute })
              : absolute;
            return `<td class="col-updated" data-epoch="${fallbackDate.getTime()}" title="${absolute}"><span class="updated-value" dir="ltr">${duration}</span></td>`;
          })()}
          <td class="actions-cell" data-entity-id="${alert.id}" data-status="${alert.status || ''}">
            ${(() => {
              if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
              const result = window.createActionsMenu([
                { type: 'VIEW', onclick: `window.showEntityDetails('alert', ${alert.id}, { mode: 'view' })`, title: 'צפה בפרטי התראה' },
                { type: 'EDIT', onclick: `editAlert(${alert.id})`, title: 'ערוך התראה' },
                { type: alert.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert && window.${alert.status === 'cancelled' ? 'reactivate' : 'cancel'}Alert(${alert.id})`, title: alert.status === 'cancelled' ? 'הפעל מחדש' : 'בטל' },
                { type: 'DELETE', onclick: `deleteAlert(${alert.id})`, title: 'מחק התראה' }
              ]);
              return result || '';
            })()}
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

    // עדכון סטטיסטיקות דרך המערכת הגנרית
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS.alerts) {
      const config = window.INFO_SUMMARY_CONFIGS.alerts;
      window.InfoSummarySystem.calculateAndRender(alertsData || [], config);
    } else if (typeof updatePageSummaryStats_LEGACY === 'function') {
      updatePageSummaryStats_LEGACY();
    }
    
    window.Logger.info('✅ טבלת התראות עודכנה בהצלחה עם', alerts.length, 'התראות', { page: "alerts" });
    

  });
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת התראות:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת התראות', error.message);
    }
  }
}

async function updateAlertsTable(alerts, options = {}) {
  const { skipPagination = false } = options;
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  if (!skipPagination && typeof window.updateTableWithPagination === 'function') {
    try {
      alertsPaginationInstance = await window.updateTableWithPagination({
        tableId: 'alertsTable',
        tableType: 'alerts',
        data: safeAlerts,
        render: async (pageData, context) => {
          renderAlertsTableRows(pageData);
          if (window.setPageTableData) {
            window.setPageTableData('alerts', pageData, {
              tableId: 'alertsTable',
              pageInfo: context?.pageInfo,
            });
          }
        },
        onFilteredDataChange: ({ filteredData }) => {
          if (typeof window.updateAlertsSummary === 'function') {
            window.updateAlertsSummary(Array.isArray(filteredData) ? filteredData : []);
          }
        },
      });
      return;
    } catch (error) {
      window.Logger?.warn('updateAlertsTable pagination fallback triggered', { error, page: 'alerts' });
    }
  }

  if (window.setTableData) {
    window.setTableData('alerts', safeAlerts, { tableId: 'alertsTable' });
    window.setFilteredTableData?.('alerts', safeAlerts, { tableId: 'alertsTable', skipPageReset: true });
  }

  renderAlertsTableRows(safeAlerts);
}

/**
 * Update page summary statistics wrapper
 * Uses global updatePageSummaryStats from ui-utils.js
 * 
 * IMPORTANT: We saved the global function reference at the top of the file before export
 * to avoid infinite recursion.
 * 
 * @function updatePageSummaryStats
 * @returns {void}
 */
// REMOVED: updatePageSummaryStats - use window.InfoSummarySystem.calculateAndRender from services/statistics-calculator.js directly
async function updatePageSummaryStats_LEGACY() {
  try {
    // Get alerts data from global scope
    const dataToUse = window.alertsData || alertsData || [];
    
    // Capture global function reference on first call if not already captured
    if (!globalUpdatePageSummaryStats) {
      // Check if global function exists and it's different from our local function
      if (typeof window.updatePageSummaryStats === 'function' && 
          window.updatePageSummaryStats !== updatePageSummaryStats) {
        globalUpdatePageSummaryStats = window.updatePageSummaryStats;
      } else {
        // Global function not available or it's already us - skip to prevent recursion
        window.Logger?.warn('Global updatePageSummaryStats not available or recursion detected', { page: "alerts" });
        return;
      }
    }
    
    // Use the captured global function reference
    if (globalUpdatePageSummaryStats) {
      globalUpdatePageSummaryStats('alerts', dataToUse);
    }
  } catch (error) {
    window.Logger?.error('Error updating page summary stats:', error, { page: "alerts" });
  }
}


/**
 * הצגת מודל התראה (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} [alertId] - מזהה ההתראה (נדרש רק בעריכה)
 */

// REMOVED: clearAlertValidation - unused function

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
      fetch('/api/trading-accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trade-plans/').then(r => r.json()).catch(() => ({ data: [] })),
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
      const dateRawEnvelope =
        item.created_at_envelope ||
        item.createdAtEnvelope ||
        item.created_atEnvelope ||
        item.createdAt_envelope ||
        item.date_envelope ||
        item.dateEnvelope ||
        null;
      const dateSource = dateRawEnvelope || item.created_at || item.date || null;
      const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(dateSource) : dateSource;
      const dateObj = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(dateEnvelope || null)
        : (dateEnvelope ? new Date(dateEnvelope) : null);
      const formattedDate = dateEnvelope
        ? (window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(dateEnvelope, { includeTime: false })
            : (() => {
                try {
                  if (dateObj && !Number.isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString('he-IL');
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ populateSelect trade date fallback failed', { error, itemId: item?.id }, { page: 'alerts' });
                }
                return 'לא מוגדר';
              })())
        : 'לא מוגדר';
      displayText = `${symbol} | ${side} | ${investmentType} | ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + צד + סוג השקעה + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const side = item.side || 'לא מוגדר';
      const investmentType = item.investment_type || 'לא מוגדר';
      const dateRawEnvelopePlan =
        item.created_at_envelope ||
        item.createdAtEnvelope ||
        item.created_atEnvelope ||
        item.createdAt_envelope ||
        item.date_envelope ||
        item.dateEnvelope ||
        null;
      const planDateSource = dateRawEnvelopePlan || item.created_at || item.date || null;
      const dateEnvelope = window.dateUtils?.ensureDateEnvelope ? window.dateUtils.ensureDateEnvelope(planDateSource) : planDateSource;
      const dateObj = window.dateUtils?.toDateObject
        ? window.dateUtils.toDateObject(dateEnvelope || null)
        : (dateEnvelope ? new Date(dateEnvelope) : null);
      const formattedDate = dateEnvelope
        ? (window.dateUtils?.formatDate
            ? window.dateUtils.formatDate(dateEnvelope, { includeTime: false })
            : (() => {
                try {
                  if (dateObj && !Number.isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString('he-IL');
                  }
                } catch (error) {
                  window.Logger?.warn('⚠️ populateSelect plan date fallback failed', { error, itemId: item?.id }, { page: 'alerts' });
                }
                return 'לא מוגדר';
              })())
        : 'לא מוגדר';
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

// REMOVED: populateEditRelatedObjects - not used, ModalManagerV2 uses populateSelects instead
/**
 * מילוי רשימת אובייקטים למודל העריכה
 * @param {number} relationTypeId - מזהה סוג השיוך
 */
function _REMOVED_populateEditRelatedObjects(relationTypeId) {
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

// REMOVED: onEditRelationTypeChange, onEditRelatedObjectChange - unused functions
// REMOVED: enableEditConditionFields, disableEditConditionFields (second occurrence) - deprecated wrappers

// REMOVED: checkAlertVariable, checkAlertOperator, buildAlertCondition - unused functions

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
  
  // Find form - try new modal form first (ModalManagerV2), then fallback to old form
  let form = document.getElementById('alertsModalForm');
  if (!form) {
    form = document.getElementById('addAlertForm');
  }
  
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

  // איסוף נתונים מהטופס - תומך גם בטופס החדש (ModalManagerV2) וגם בטופס הישן
  // Check if new form structure (ModalManagerV2) or old form structure
  const isNewForm = form.querySelector('#alertRelatedType');
  
  let relatedType, relatedId, conditionAttribute, conditionOperator, conditionNumber, message, status, isTriggered, expiryDate;
  let hasErrors = false;
  
  let tagIds = [];

  if (isNewForm) {
    // New form structure (ModalManagerV2)
    relatedType = form.querySelector('#alertRelatedType')?.value || '';
    relatedId = form.querySelector('#alertRelatedObject')?.value || '';
    conditionAttribute = form.querySelector('#alertType')?.value || '';
    conditionOperator = form.querySelector('#alertCondition')?.value || '';
    conditionNumber = form.querySelector('#alertValue')?.value || '';
    if (window.RichTextEditorService && typeof window.RichTextEditorService.getContent === 'function') {
      message = window.RichTextEditorService.getContent('alertName') || '';
    } else {
      message = form.querySelector('#alertName')?.value || '';
    }
    
    // Get combined status and parse to status + is_triggered
    const statusCombined = form.querySelector('#alertStatusCombined')?.value || 'new';
    const statusHidden = form.querySelector('#alertStatus_hidden')?.value || 'open';
    const isTriggeredHidden = form.querySelector('#alertIsTriggered_hidden')?.value || 'false';
    
    status = statusHidden;
    isTriggered = isTriggeredHidden;
    
    // Get expiry_date
    expiryDate = form.querySelector('#alertExpiryDate')?.value || null;
    if (expiryDate === '') expiryDate = null;

    const tagsSelect = form.querySelector('#alertTags');
    if (tagsSelect) {
      if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
        tagIds = window.TagUIManager.getSelectedValues(tagsSelect);
      } else {
        tagIds = Array.from(tagsSelect.selectedOptions || [])
          .map(option => parseInt(option.value, 10))
          .filter(Number.isFinite);
      }
    }
  } else {
    // Old form structure (backward compatibility)
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
    
    relatedType = alertData.alertRelationType;
    relatedId = alertData.alertRelatedObjectSelect;
    conditionAttribute = alertData.conditionAttribute;
    conditionOperator = alertData.conditionOperator;
    conditionNumber = alertData.conditionNumber;
    message = alertData.message;
    status = alertData.status || 'open';
    isTriggered = 'false';
    expiryDate = null;
  }

  const sanitizedMessage = window.RichTextEditorService && typeof window.RichTextEditorService.sanitizeHTML === 'function'
    ? window.RichTextEditorService.sanitizeHTML(message || '')
    : (message || '');
  const messageText = sanitizedMessage.replace(/<[^>]*>/g, '').trim();
  if (!messageText) {
    if (window.showValidationWarning) {
      window.showValidationWarning('alertName', 'יש להזין הודעת התראה');
    }
    hasErrors = true;
  }
  if (sanitizedMessage.length > 5000) {
    if (window.showValidationWarning) {
      window.showValidationWarning('alertName', 'הודעת ההתראה חורגת מהאורך המותר (5,000 תווים)');
    }
    hasErrors = true;
  }
  message = sanitizedMessage;

  // window.Logger.info('🔧 Condition validation:', { page: "alerts" });
  // window.Logger.info('🔧 Condition attribute:', conditionAttribute, { page: "alerts" });
  // window.Logger.info('🔧 Condition operator:', conditionOperator, { page: "alerts" });
  // window.Logger.info('🔧 Condition number:', conditionNumber, { page: "alerts" });

  // ולידציה באמצעות מערכת הולידציה הגלובלית
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

  // Check if editing (form has alert ID)
  const alertId = form.querySelector('input[name="id"]')?.value || 
                  form.querySelector('[data-alert-id]')?.getAttribute('data-alert-id') ||
                  form.closest('.modal')?.querySelector('[data-alert-id]')?.getAttribute('data-alert-id');
  
  const isEdit = !!alertId;
  
  const alertPayload = {
    related_type_id: parseInt(relatedType) || null,
    related_id: parseInt(relatedId) || null,
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: message || null,
    status: status || 'open',
    is_triggered: isTriggered || 'false',
  };
  
  // Add expiry_date if provided
  if (expiryDate) {
    alertPayload.expiry_date = expiryDate;
  }

  // שולח התראה חדשה או מעדכן קיימת
  try {
    window.Logger.info('🔧 === SAVING ALERT ===', { page: "alerts" });
    window.Logger.info('🔧 Is Edit:', isEdit, { page: "alerts" });
    window.Logger.info('🔧 Alert ID:', alertId, { page: "alerts" });
    window.Logger.info('🔧 Alert payload:', alertPayload, { page: "alerts" });
    window.Logger.info('🔧 Request URL:', isEdit ? `/api/alerts/${alertId}` : '/api/alerts/', { page: "alerts" });
    window.Logger.info('🔧 Request method:', isEdit ? 'PUT' : 'POST', { page: "alerts" });
    window.Logger.info('🔧 Request body:', JSON.stringify(alertPayload, null, 2), { page: "alerts" });

    const url = isEdit ? `/api/alerts/${alertId}` : '/api/alerts/';
    const method = isEdit ? 'PUT' : 'POST';
    const modalId = 'alertsModal'; // ModalManagerV2 uses alertsModal
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    const crudResult = await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: modalId,
      successMessage: isEdit ? 'התראה עודכנה בהצלחה!' : 'התראה נשמרה בהצלחה!',
      apiUrl: '/api/alerts/',
      entityName: 'התראה',
      reloadFn: window.loadAlertsData,
      requiresHardReload: false
    });
    const alertRecordId = isEdit ? Number(alertId) : Number(crudResult?.data?.id || crudResult?.id);
    if (Number.isFinite(alertRecordId) && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('alert', alertRecordId, tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update alert tags', {
          error: tagError,
          alertId: alertRecordId,
          page: 'alerts'
        });
        window.showErrorNotification?.('שמירת תגיות', 'התראה נשמרה אך שמירת התגיות נכשלה');
      }
    }

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
 * @param {number|string} alertId - מזהה ההתראה לעריכה
 * @returns {void}
 */
async function editAlert(alertId) {
  // Use ModalManagerV2 directly
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
    await window.ModalManagerV2.showEditModal('alertsModal', 'alert', alertId);
    if (window.TagUIManager && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
      await window.TagUIManager.hydrateSelectForEntity('alertTags', 'alert', alertId, { force: true });
      await window.TagUIManager.hydrateSelectForEntity('editAlertTags', 'alert', alertId, { force: true });
    }
  } else {
    window.Logger?.error('ModalManagerV2 לא זמין', { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
    }
  }
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
  // ניקוי מטמון לפני פעולת CRUD - עריכה  const form = document.getElementById('editAlertForm');
  if (!form) {
    // window.Logger.warn('⚠️ Form element not found - skipping update operation', { page: "alerts" });
    return;
  }

  // איסוף נתונים באמצעות DataCollectionService
  const alertData = DataCollectionService.collectFormData({
    related_type_id: { id: 'editAlertRelationType', type: 'int' },
    related_id: { id: 'editAlertRelatedObjectSelect', type: 'int' },
    condition_attribute: { id: 'editConditionAttribute', type: 'text' },
    condition_operator: { id: 'editConditionOperator', type: 'text' },
    condition_number: { id: 'editConditionNumber', type: 'number' },
    message: { id: 'editAlertMessage', type: 'rich-text', default: null },
    status: { id: 'editAlertStatus', type: 'text' },
    is_triggered: { id: 'editAlertIsTriggered', type: 'text' }
  });

  // עדכון status ו-is_triggered לפי המצב הנבחר
  updateStatusAndTriggered();

  const relatedTypeId = alertData.related_type_id;
  const relatedId = alertData.related_id;
  const conditionAttribute = alertData.condition_attribute;
  const conditionOperator = alertData.condition_operator;
  const conditionNumber = alertData.condition_number;
  const status = alertData.status;
  const isTriggered = alertData.is_triggered;
  const messageHtml = alertData.message || '';
  const messageText = messageHtml.replace(/<[^>]*>/g, '').trim();

  // ולידציה באמצעות מערכת הולידציה הגלובלית
  let hasErrors = false;

  if (!messageText) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertMessage', 'יש להזין הודעת התראה');
    }
    hasErrors = true;
  }

  if (messageHtml.length > 5000) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertMessage', 'הודעת ההתראה חורגת מהאורך המותר (5,000 תווים)');
    }
    hasErrors = true;
  }

  if (!validateAlertStatusCombination(status, isTriggered)) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שילוב לא תקין', 'שילוב לא תקין בין סטטוס ומצב הפעלה. ראה את הכללים במערכת ההתראות.');
    }
    return;
  }

  if (!relatedTypeId) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertRelationType', 'יש לבחור סוג אובייקט לשיוך');
    }
    hasErrors = true;
  }

  if (!relatedId) {
    if (window.showValidationWarning) {
      window.showValidationWarning('editAlertRelatedObjectSelect', 'יש לבחור אובייקט לשיוך');
    }
    hasErrors = true;
  }

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
  const tagsSelect = document.getElementById('editAlertTags');
  let tagIds = [];
  if (tagsSelect) {
    if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
      tagIds = window.TagUIManager.getSelectedValues(tagsSelect);
    } else {
      tagIds = Array.from(tagsSelect.selectedOptions || [])
        .map(option => parseInt(option.value, 10))
        .filter(Number.isFinite);
    }
  }

  const alertPayload = {
    related_type_id: relatedTypeId,
    related_id: relatedId,
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: messageHtml || null,
    status: status,
    is_triggered: isTriggered,
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
      body: JSON.stringify(alertPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    const updateResult = await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editAlertModal',
      successMessage: 'התראה עודכנה בהצלחה!',
      apiUrl: '/api/alerts/',
      entityName: 'התראה',
      reloadFn: window.loadAlertsData,
      requiresHardReload: false
    });
    if (updateResult !== null && window.TagService) {
      try {
        await window.TagService.replaceEntityTags('alert', Number(alertId), tagIds);
      } catch (tagError) {
        window.Logger?.warn('⚠️ Failed to update alert tags (legacy form)', {
          error: tagError,
          alertId,
          page: 'alerts'
        });
        window.showErrorNotification?.('שמירת תגיות', 'התראה עודכנה אך התגיות לא עודכנו');
      }
    }

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון התראה');
  }
}

/**
 * מחיקת התראה
 */
async function deleteAlertInternal(alertId) {
  // בדיקת פריטים מקושרים לפני חלון האישור
  if (typeof window.checkLinkedItemsBeforeAction === 'function') {
    const hasLinkedItems = await window.checkLinkedItemsBeforeAction('alert', alertId, 'delete');
    if (hasLinkedItems) {
      // יש פריטים מקושרים - המודול כבר הוצג, לא נציג חלון אישור
      return;
    }
  }
  
  // אין פריטים מקושרים - המשך עם חלון האישור
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
    // Use performAlertDeletion which handles cache clearing
    if (window.performAlertDeletion) {
      await window.performAlertDeletion(alertId);
    } else {
      // Fallback if performAlertDeletion not available
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      await CRUDResponseHandler.handleDeleteResponse(response, {
        successMessage: 'התראה נמחקה בהצלחה!',
        apiUrl: '/api/alerts/',
        entityName: 'התראה',
        reloadFn: window.loadAlertsData,
        requiresHardReload: false
      });
    }
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

// REMOVED: getStatusClass - use window.getStatusClass or FieldRendererService.renderStatus instead


// REMOVED: getRelatedClass - unused function


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
// REMOVED: window.filterAlertsLocally - function removed

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
    'trading_account': 1,
    'trade': 2,
    'trade_plan': 3,
    'ticker': 4,
  };

  if (type === 'account') {
    // DEPRECATED - use trading_account instead!
    const error = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
    window.Logger.error('❌ DEPRECATED: account entity type used in alerts', { type }, { page: "alerts" });
    console.error(error);
    throw error;
  }

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

/**
 * Filter alerts by related object type
 * Wrapper that uses global function from related-object-filters.js or local wrapper
 * 
 * @function filterAlertsByRelatedObjectType
 * @param {string} type - Object type to filter by
 * @returns {void}
 */
function filterAlertsByRelatedObjectType(type) {
  try {
    // First try global function from related-object-filters.js (if loaded)
    // Check if global exists and it's not our local function (will be set later)
    const globalFilterFn = typeof window.filterAlertsByRelatedObjectType === 'function' 
      ? window.filterAlertsByRelatedObjectType 
      : null;
    
    // If global exists and it's different from our local (before we export), use it
    if (globalFilterFn && globalFilterFn !== filterAlertsByRelatedObjectType) {
      globalFilterFn(type);
      return;
    }
    
    // Fallback to local wrapper
    if (typeof filterAlertsByRelatedObjectTypeWrapper === 'function') {
      filterAlertsByRelatedObjectTypeWrapper(type);
    } else {
      window.Logger?.warn('filterAlertsByRelatedObjectTypeWrapper not available', { page: "alerts" });
    }
  } catch (error) {
    window.Logger?.error('Error filtering alerts by related object type:', error, { page: "alerts" });
  }
}

window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly
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
// REMOVED: window exports for removed functions (onEditRelationTypeChange, onEditRelatedObjectChange, checkAlertVariable, checkAlertOperator, buildAlertCondition, clearAlertValidation)
window.parseAlertCondition = parseAlertCondition;

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

// REMOVED: checkAlertCondition - unused function

// REMOVED: toggleAlert - not used
/**
 * הפעלה/כיבוי התראה
 * מחליף את מצב ההפעלה של התראה
 * @param {number} alertId - מזהה ההתראה
 */
function _REMOVED_toggleAlert(alertId) {
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
// REMOVED: window.updatePageSummaryStats - use window.InfoSummarySystem.calculateAndRender from services/statistics-calculator.js directly
// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly
// REMOVED: hideAddAlertModal, hideEditAlertModal - use ModalManagerV2.hideModal directly

/**
 * Validate alert form wrapper
 * Uses global validateForm from validation-utils.js
 * 
 * @function validateAlertForm
 * @returns {boolean} true if form is valid
 */
function validateAlertForm() {
  try {
    const formId = 'alertsModalForm';
    if (typeof window.validateForm === 'function') {
      return window.validateForm(formId);
    } else if (typeof window.validateEntityForm === 'function') {
      return window.validateEntityForm('alert', formId);
    } else {
      window.Logger?.warn('validateForm not available - using basic validation', { page: "alerts" });
      // Basic validation fallback
      const form = document.getElementById(formId);
      if (!form) {
        window.Logger?.warn('Alert form not found', { page: "alerts" });
        return false;
      }
      return form.checkValidity();
    }
  } catch (error) {
    window.Logger?.error('Error validating alert form:', error, { page: "alerts" });
    return false;
  }
}

// REMOVED: window exports for removed functions
// REMOVED: window.showEditAlertModal - use window.ModalManagerV2.showEditModal('alertsModal', 'alert', id) directly
window.validateAlertForm = validateAlertForm;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;
window.onRelationTypeChange = onRelationTypeChange;
window.onRelatedObjectChange = onRelatedObjectChange;
window.enableConditionFields = enableConditionFields;
window.disableConditionFields = disableConditionFields;
window.populateRelatedObjects = populateRelatedObjects;
window.getDemoAlertsData = getDemoAlertsData;
// REMOVED: window.filterAlertsLocally - function removed
// Note: saveAlert already exported above
window.updateStatusAndTriggered = updateStatusAndTriggered;
window.restoreAlertsSectionState = restoreAlertsSectionState;
window.loadConditionsFromSource = loadConditionsFromSource;
window.loadTradePlansForConditions = loadTradePlansForConditions;
window.loadTradesForConditions = loadTradesForConditions;
window.loadConditionsFromItem = loadConditionsFromItem;
/**
 * Update evaluation statistics
 * Updates statistics display after condition evaluation
 * 
 * @function updateEvaluationStats
 * @param {Object} data - Evaluation results data
 * @returns {void}
 */
function updateEvaluationStats(data) {
  try {
    if (!data || typeof data !== 'object') {
      window.Logger?.warn('Invalid data for updateEvaluationStats', { page: "alerts" });
      return;
    }
    
    // Update evaluation summary if function exists
    if (typeof updateEvaluationSummary === 'function') {
      updateEvaluationSummary(data);
    } else {
      window.Logger?.debug('updateEvaluationSummary not available', { page: "alerts" });
    }
    
    // Update display if results container exists
    if (typeof displayEvaluationResults === 'function') {
      displayEvaluationResults(data);
    }
  } catch (error) {
    window.Logger?.error('Error updating evaluation stats:', error, { page: "alerts" });
  }
}

/**
 * Save alert data wrapper
 * Wrapper for saveAlert that handles ModalManagerV2 integration
 * 
 * @function saveAlertData
 * @returns {Promise<void>}
 */
async function saveAlertData() {
  try {
    // Use existing saveAlert function
    if (typeof saveAlert === 'function') {
      await saveAlert();
    } else {
      window.Logger?.error('saveAlert function not available', { page: "alerts" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'פונקציית שמירת התראה לא זמינה');
      }
    }
  } catch (error) {
    window.Logger?.error('Error in saveAlertData:', error, { page: "alerts" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בשמירת התראה');
    }
  }
}

window.evaluateAllConditions = evaluateAllConditions;
window.updateEvaluationStats = updateEvaluationStats;
window.initializeAlertConditionBuilder = initializeAlertConditionBuilder;
window.cleanupAlertConditionBuilder = cleanupAlertConditionBuilder;
// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly
// REMOVED: window.showEditAlertModal - use window.ModalManagerV2.showEditModal('alertsModal', 'alert', id) directly
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
  const alertsArray = Array.isArray(alerts)
    ? alerts
    : (window.TableDataRegistry ? window.TableDataRegistry.getFilteredData('alerts') : window.alertsData || []);

  window.Logger.info('📊 מעדכן סטטיסטיקות התראות:', alertsArray ? alertsArray.length : 0, 'התראות', { page: "alerts" });
  
  if (!alertsArray || !Array.isArray(alertsArray)) {
    window.Logger.warn('⚠️ alerts data is not available or not an array', { page: "alerts" });
    return;
  }

  // חישוב סטטיסטיקות
  const totalAlerts = alertsArray.length;
  const activeAlerts = alertsArray.filter(alert => alert.status === 'open').length;
  const newAlerts = alertsArray.filter(alert => alert.is_triggered === 'new').length;
  
  // התראות היום
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const getCreatedMs = (alert) => {
    const createdRawEnvelope =
      alert.created_at_envelope ||
      alert.createdAtEnvelope ||
      alert.created_atEnvelope ||
      alert.createdAt_envelope ||
      null;
    const createdSource =
      createdRawEnvelope ||
      alert.created_at ||
      alert.createdAt ||
      alert.created_at_utc ||
      alert.createdAtUtc ||
      alert.created_at_iso ||
      alert.createdAtIso ||
      alert.created_at_local ||
      alert.createdAtLocal ||
      null;
    const envelope = window.dateUtils?.ensureDateEnvelope
      ? window.dateUtils.ensureDateEnvelope(createdSource)
      : createdSource;
    if (!envelope) {return null;}
    const ms = window.dateUtils?.getEpochMilliseconds
      ? window.dateUtils.getEpochMilliseconds(envelope)
      : null;
    if (ms || ms === 0) {
      return ms;
    }
    const dateObj = window.dateUtils?.toDateObject
      ? window.dateUtils.toDateObject(envelope)
      : (envelope ? new Date(envelope) : null);
    if (!dateObj || Number.isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj.getTime();
  };

  const todayAlerts = alertsArray.filter(alert => {
    const createdMs = getCreatedMs(alert);
    if (createdMs === null) {return false;}
    const createdDate = new Date(createdMs);
    return createdDate >= startOfToday && createdDate < startOfTomorrow;
  }).length;
  
  // התראות השבוע
  const weekAlerts = alertsArray.filter(alert => {
    const createdMs = getCreatedMs(alert);
    if (createdMs === null) {return false;}
    const createdDate = new Date(createdMs);
    return createdDate >= weekAgo;
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
// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly
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
        const response = await fetch('/api/trade-plans');
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
            endpoint = `/api/plan-conditions?plan_id=${sourceId}`;
        } else if (sourceType === 'trade') {
            endpoint = `/api/trade-conditions?trade_id=${sourceId}`;
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
                        <button data-button-type="SECONDARY" data-variant="full" data-text="בחר תנאי זה" data-classes="btn-sm" data-onclick="selectConditionForAlert(${condition.id}, '${sourceType}')"></button>
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
// REMOVED: showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly

/**
 * הצגת מודל עריכת התראה
 * Uses ModalManagerV2 for consistent modal experience
 */
// REMOVED: showEditAlertModal - use window.ModalManagerV2.showEditModal('alertsModal', 'alert', alertId) directly

/**
 * שמירת התראה
 * Handles both add and edit modes
 */
// REMOVED: Duplicate saveAlert function - using ModalManagerV2 automatic CRUD handling

/**
 * מחיקת התראה
 * Includes linked items check
 */
// REMOVED: Duplicate deleteAlert function - using confirmDeleteAlert instead

/**
 * טעינת מידע על הטיקר (למודל החדש)
 */
async function loadAlertTickerInfo(tickerId) {
  try {
    window.Logger?.info?.('🔄 [loadAlertTickerInfo] Loading ticker info', { tickerId }, { page: "alerts" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => String(t.id) === String(tickerId));
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayAlertTickerInfo(ticker);
    window.Logger?.info?.('✅ [loadAlertTickerInfo] Ticker loaded', {
      tickerId,
      symbol: ticker?.symbol
    }, { page: "alerts" });
    
  } catch (error) {
    window.Logger?.error?.('❌ [loadAlertTickerInfo] Error', { tickerId, error: error?.message || error }, { page: "alerts" });
  }
}

/**
 * הצגת מידע על הטיקר (למודל החדש)
 */
function displayAlertTickerInfo(ticker) {
  window.Logger?.info?.('🖥️ [displayAlertTickerInfo] Rendering ticker', {
    tickerId: ticker?.id,
    symbol: ticker?.symbol
  }, { page: "alerts" });
  const tickerDisplay = document.getElementById('alertTicker');
  const tickerInfoDiv = document.getElementById('alertTickerInfo');
  
  if (tickerDisplay || tickerInfoDiv) {
    if (tickerDisplay) {
      tickerDisplay.textContent = ticker.symbol || 'לא מוגדר';
      tickerDisplay.dataset.tickerId = ticker.id ? String(ticker.id) : '';
    }
    
    window.currentAlertTickerData = ticker;
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.handleAlertTickerDataUpdate === 'function') {
      window.ModalManagerV2.handleAlertTickerDataUpdate(ticker);
    }
    
    if (tickerInfoDiv) {
      if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
        tickerInfoDiv.innerHTML = window.FieldRendererService.renderTickerInfo(ticker);
      } else if (window.renderTickerInfo) {
        tickerInfoDiv.innerHTML = window.renderTickerInfo(ticker, 'ticker-info-display');
      } else {
        tickerInfoDiv.innerHTML = `
          <div class="ticker-info-display">
            <div class="d-flex flex-wrap align-items-center gap-2">
              <strong>${(ticker.currency_symbol || '$')}${(ticker.current_price || 0).toFixed(2)}</strong>
              <span class="${(ticker.daily_change || 0) >= 0 ? 'text-success' : 'text-danger'}">
                ${(ticker.daily_change || 0) >= 0 ? '↗' : '↘'} ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)
              </span>
              <span class="text-muted small">
                נפח: ${(ticker.volume || 0).toLocaleString('he-IL')}
              </span>
            </div>
          </div>
        `;
      }
    }
    window.Logger?.info?.('✅ [displayAlertTickerInfo] Ticker rendered (primary containers)', {
      hasTickerDiv: !!tickerDisplay,
      hasInfoDiv: !!tickerInfoDiv
    }, { page: "alerts" });
    return;
  }
  
  // שמירה על התמיכה בפריסות ישנות
  let legacyTickerInfoDiv = document.getElementById('alertTickerInfoLegacy');
  if (!legacyTickerInfoDiv) {
    const tickerInfoRow = document.createElement('div');
    tickerInfoRow.className = 'row';
    tickerInfoRow.id = 'alertTickerInfoRow';
    
    const tickerInfoCol = document.createElement('div');
    tickerInfoCol.className = 'col-12';
    
    legacyTickerInfoDiv = document.createElement('div');
    legacyTickerInfoDiv.id = 'alertTickerInfoLegacy';
    legacyTickerInfoDiv.className = 'mb-3 p-3 bg-light rounded';
    
    tickerInfoCol.appendChild(legacyTickerInfoDiv);
    tickerInfoRow.appendChild(tickerInfoCol);
    
    const tickerField = document.getElementById('alertTicker');
    if (tickerField) {
      const row = tickerField.closest('.row');
      if (row && row.parentNode) {
        row.parentNode.insertBefore(tickerInfoRow, row.nextSibling);
      }
    }
  }
  
  if (window.FieldRendererService && window.FieldRendererService.renderTickerInfo) {
    legacyTickerInfoDiv.innerHTML = window.FieldRendererService.renderTickerInfo(ticker);
  } else {
    legacyTickerInfoDiv.innerHTML = window.renderTickerInfo
      ? window.renderTickerInfo(ticker, 'ticker-info-display')
      : `<strong>${ticker.symbol || 'N/A'}</strong>`;
  }
  window.Logger?.info?.('✅ [displayAlertTickerInfo] Ticker rendered (legacy)', {}, { page: "alerts" });
}

/**
 * ניקוי תצוגת מידע טיקר במודל ההתראות
 */
function clearAlertTickerInfo() {
  window.Logger?.info?.('🧼 [clearAlertTickerInfo] Clearing ticker UI', {}, { page: "alerts" });
  const tickerDisplay = document.getElementById('alertTicker');
  const tickerInfoDiv = document.getElementById('alertTickerInfo');
  const legacyTickerInfoDiv = document.getElementById('alertTickerInfoLegacy');
  
  if (tickerDisplay) {
    tickerDisplay.textContent = '-';
    delete tickerDisplay.dataset.tickerId;
  }
  
  window.currentAlertTickerData = null;
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.handleAlertTickerDataUpdate === 'function') {
    window.ModalManagerV2.handleAlertTickerDataUpdate(null);
  }
  
  if (tickerInfoDiv) {
    tickerInfoDiv.innerHTML = '';
  }
  
  if (legacyTickerInfoDiv) {
    legacyTickerInfoDiv.remove();
  }
  window.Logger?.info?.('✅ [clearAlertTickerInfo] Cleared', {}, { page: "alerts" });
}

// Export functions to window for global access
// REMOVED: window.showAddAlertModal - use window.ModalManagerV2.showModal('alertsModal', 'add') directly
// REMOVED: window.showEditAlertModal - use window.ModalManagerV2.showEditModal('alertsModal', 'alert', id) directly
window.loadAlertTickerInfo = loadAlertTickerInfo;
window.displayAlertTickerInfo = displayAlertTickerInfo;

/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('alerts', columnIndex);
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('alerts');
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register alerts table with UnifiedTableSystem
 * This function registers the alerts table for unified sorting and filtering
 */
window.registerAlertsTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "alerts" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register alerts table
    window.UnifiedTableSystem.registry.register('alerts', {
        dataGetter: () => {
            return window.alertsData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateAlertsTable === 'function') {
                window.updateAlertsTable(data);
            }
        },
        tableSelector: '#alertsTable',
        columns: getColumns('alerts'),
        sortable: true,
        filterable: true,
        defaultSort: { columnIndex: 0, direction: 'asc' } // סידור ברירת מחדל לפי עמודה ראשונה
    });
};
window.clearAlertTickerInfo = clearAlertTickerInfo;
// Note: saveAlert and deleteAlert removed - using ModalManagerV2 and confirmDeleteAlert instead
