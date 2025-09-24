// alerts.js loaded successfully - removed debug log

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
  console.log('🚀 טעינת דף התראות עם מערכת ראש דף חדשה...');

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
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

  console.log('✅ מודולים הוגדרו לסגירה בלחיצה על הרקע');

  // בדיקת הצבעים הסטטיים
  console.log('🎨 בודק צבעים סטטיים...');
  const tradeColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-trade-color');
  const tickerColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-ticker-color');
  const tradePlanColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-trade-plan-color');
  const accountColor = getComputedStyle(document.documentElement).getPropertyValue('--entity-account-color');
  console.log('🎨 צבע טרייד:', tradeColor);
  console.log('🎨 צבע טיקר:', tickerColor);
  console.log('🎨 צבע תוכנית:', tradePlanColor);
  console.log('🎨 צבע חשבון:', accountColor);
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
}

/**
 * פונקציה זו טוענת את כל ההתראות מהשרת ומעדכנת את הטבלה
 * אם השרת לא זמין, משתמשת בנתוני דמו
 *
 * @returns {Array} מערך של התראות
 */
async function loadAlertsData() {
  console.log('📊 טעינת נתוני התראות מהשרת...');
  try {
    const response = await fetch('/api/alerts/');
    console.log('📊 תגובת שרת:', response.status, response.ok);

    if (!response.ok) {
      console.warn(`⚠️ Server error ${response.status}, using demo data`);
      // שימוש בנתוני דמו במקרה של שגיאת שרת
      alertsData = getDemoAlertsData();
      updateAlertsTable(alertsData);
      
      // רענון כפוי של הטבלה
      setTimeout(() => {
        updateAlertsTable(alertsData);
      }, 100);
      
      return alertsData;
    }

    const data = await response.json();
    const alerts = data.data || data;
    console.log('📊 נתונים שהתקבלו:', alerts.length, 'התראות');

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

    console.log('📊 נתונים מעובדים:', alertsData.length, 'התראות');
    
    // עדכון הטבלה
    updateAlertsTable(alertsData);
    

    return alertsData;

  } catch (error) {
    console.error('שגיאה בטעינת התראות:', error);
    // שימוש בנתוני דמו במקרה של שגיאה
    alertsData = getDemoAlertsData();
    updateAlertsTable(alertsData);
    
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
}

/**
 * עדכון טבלת התראות
 *
 * פונקציה זו מעדכנת את הטבלה עם הנתונים החדשים
 * כולל המרת ערכים לעברית ועיצוב תאים
 *
 * @param {Array} alerts - מערך של התראות לעדכון
 */
function updateAlertsTable(alerts) {
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
        fetch('/api/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      accounts = (accountsResponse.data || accountsResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      trades = (tradesResponse.data || tradesResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tradePlans = (tradePlansResponse.data || tradePlansResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tickers = (tickersResponse.data || tickersResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    } catch {
      // // console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
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
      console.warn('⚠️ alerts parameter is not available or not an array');
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין התראות להצגה</td></tr>';
      return;
    }

    const tableHTML = alerts.map(alert => {
      // לוג לבדיקת מבנה הנתונים
      // console.log('🔍 Alert data structure:', alert);
      
      // קבלת צבעי סטטוס דינמיים
      const statusClass = getStatusClass(alert.status);
      const statusColor = window.getStatusColor ? window.getStatusColor(alert.status, 'medium') : '#6c757d';
      const statusBgColor = window.getStatusBackgroundColor ? window.getStatusBackgroundColor(alert.status) : 'rgba(108, 117, 125, 0.1)';
      
      // קביעת האובייקט המקושר
      let relatedDisplay = '';
      let relatedIcon = '';
      let relatedClass = '';
      let relatedColor = '';
      let relatedBgColor = '';

      // console.log('🔍 Alert details:', {
      //   id: alert.id,
      //   related_type_id: alert.related_type_id,
      //   related_id: alert.related_id,
      //   status: alert.status,
      // });

      // console.log('📊 Related data counts:', {
      //   accounts: accounts.length,
      //   trades: trades.length,
      //   tradePlans: tradePlans.length,
      //   tickers: tickers.length,
      // });

      // טיפול במקרים שבהם related_type_id הוא null
      if (alert.related_type_id === null || alert.related_id === null) {
        relatedDisplay = 'כללי';
        relatedIcon = '🌐';
        relatedClass = 'related-general';

      } else {
        switch (alert.related_type_id) {
        case 1: { // חשבון
          // console.log(`🔍 Looking for account with ID: ${alert.related_id}`);
          // console.log('🔍 Available accounts:', accounts.map(a => ({ id: a.id, name: a.name || a.account_name })));
          const account = accounts.find(a => a.id === alert.related_id);
          if (account) {
            const name = account.name || account.account_name || 'לא מוגדר';
            const currency = account.currency || 'ILS';
            relatedDisplay = `${name} (${currency})`;
            // console.log(`✅ Found account: ${name} (${currency})`);
          } else {
            relatedDisplay = `חשבון ${alert.related_id}`;
            // console.log(`❌ Account not found for ID: ${alert.related_id}`);
          }
          relatedIcon = '🏦';
          relatedClass = 'related-account entity-account-badge';
          relatedColor = window.getEntityColor ? window.getEntityColor('account') : '#28a745';
          relatedBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('account') : 'rgba(40, 167, 69, 0.1)';
          break;
        }
        case 2: { // טרייד
          // console.log(`🔍 Looking for trade with ID: ${alert.related_id}`);
          // console.log('🔍 Available trades:', trades.map(t => ({
          //   id: t.id, created_at: t.created_at, date: t.date,
          //   side: t.side, investment_type: t.investment_type
          // })));
          const trade = trades.find(t => t.id === alert.related_id);
          if (trade) {
            const date = trade.created_at || trade.date;
            const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
            const side = trade.side || 'לא מוגדר';
            const investmentType = trade.investment_type || 'לא מוגדר';
            relatedDisplay = `טרייד | ${side} | ${investmentType} | ${formattedDate}`;
            // console.log(`✅ Found trade: ${relatedDisplay}`);
          } else {
            relatedDisplay = `טרייד ${alert.related_id}`;
            // console.log(`❌ Trade not found for ID: ${alert.related_id}`);
          }
          relatedIcon = '📈';
          relatedClass = 'related-trade entity-trade-badge';
          relatedColor = window.getEntityColor ? window.getEntityColor('trade') : '#007bff';
          relatedBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('trade') : 'rgba(0, 123, 255, 0.1)';
          break;
        }
        case 3: { // תוכנית
          // console.log(`🔍 Looking for trade plan with ID: ${alert.related_id}`);
          // console.log('🔍 Available trade plans:', tradePlans.map(p => ({
          //   id: p.id, created_at: p.created_at, date: p.date,
          //   side: p.side, investment_type: p.investment_type
          // })));
          const plan = tradePlans.find(p => p.id === alert.related_id);
          if (plan) {
            const date = plan.created_at || plan.date;
            const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
            const side = plan.side || 'לא מוגדר';
            const investmentType = plan.investment_type || 'לא מוגדר';
            relatedDisplay = `תוכנית | ${side} | ${investmentType} | ${formattedDate}`;
            // console.log(`✅ Found trade plan: ${relatedDisplay}`);
          } else {
            relatedDisplay = `תוכנית ${alert.related_id}`;
            // console.log(`❌ Trade plan not found for ID: ${alert.related_id}`);
          }
          relatedIcon = '📋';
          relatedClass = 'related-plan';
          break;
        }
        case 4: { // טיקר
          // console.log(`🔍 Looking for ticker with ID: ${alert.related_id}`);
          // console.log('🔍 Available tickers:', tickers.map(t => ({ id: t.id, symbol: t.symbol })));
          const ticker = tickers.find(t => t.id === alert.related_id);
          if (ticker) {
            relatedDisplay = ticker.symbol;
            // console.log(`✅ Found ticker: ${ticker.symbol}`);
          } else {
            relatedDisplay = `טיקר ${alert.related_id}`;
            // console.log(`❌ Ticker not found for ID: ${alert.related_id}`);
          }
          relatedIcon = '📊';
          relatedClass = 'related-ticker';
          break;
        }
        default:
          relatedDisplay = `אובייקט ${alert.related_id}`;
          relatedClass = 'related-other';
          // console.log(`❓ Unknown related_type_id: ${alert.related_type_id}`);
        }
      }

      // קביעת הסימבול לטור הראשון
      let symbolDisplay = '';
      if (alert.related_type_id === 1) { // חשבון - ריק
        symbolDisplay = '-';
      } else if (alert.related_type_id === 2) { // טרייד
        const trade = trades.find(t => t.id === alert.related_id);
        if (trade && trade.ticker_id) {
          const ticker = tickers.find(tick => tick.id === trade.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : `טרייד ${alert.related_id}`;
        } else {
          symbolDisplay = `טרייד ${alert.related_id}`;
        }
      } else if (alert.related_type_id === 3) { // תוכנית
        const plan = tradePlans.find(p => p.id === alert.related_id);
        if (plan && plan.ticker_id) {
          const ticker = tickers.find(tick => tick.id === plan.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : `תוכנית ${alert.related_id}`;
        } else {
          symbolDisplay = `תוכנית ${alert.related_id}`;
        }
      } else if (alert.related_type_id === 4) { // טיקר
        const ticker = tickers.find(tick => tick.id === alert.related_id);
        symbolDisplay = ticker ? ticker.symbol : `טיקר ${alert.related_id}`;
      } else {
        symbolDisplay = `אובייקט ${alert.related_id}`;
      }

      // הוספת איקון קישור לפני האובייקט
      relatedDisplay = '🔗 ' + relatedDisplay;

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
          <td class="ticker-cell">
            <div class="ticker-cell-content">
              <span class="ticker-symbol-link" 
                    onclick="showEntityDetails('alert', ${alert.id}); return false;" 
                    title="פרטי התראה">
                ${symbolDisplay}
              </span>
              <span class="ticker-link-icon" 
                    onclick="if (${alert.related_id || 'false'}) { showEntityDetails('ticker', ${alert.related_id}); } else { if (window.showErrorNotification) { window.showErrorNotification('שגיאה', 'מזהה טיקר לא זמין'); } else if (typeof showNotification === 'function') { showNotification('מזהה טיקר לא זמין', 'error'); } else { alert('מזהה טיקר לא זמין'); } } return false;" 
                    title="פרטי טיקר">
                🔗
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
          <span class="status-badge ${statusClass}">${statusDisplay}</span>
        </td>
          <td><span class="triggered-badge ${triggeredClass}">${triggeredDisplay}</span></td>
          <td class="related-cell">
            <div class="related-object-cell ${relatedClass}" 
             title="קישור לדף אובייקט - בפיתוח">
              ${relatedDisplay}
            </div>
          </td>

          <td><span class="message-text">${alert.message || '-'}</span></td>
          <td data-date="${alert.created_at}"><span class="date-text">${createdAt}</span></td>
          <td class="actions-cell" data-entity-id="${alert.id}" data-status="${alert.status || ''}">
            <div class="btn-group btn-group-sm actions-btn-group" role="group">
              <button class="btn btn-info" 
                      onclick="viewLinkedItemsForAlert(${alert.id})" 
                      title="צפה באלמנטים מקושרים">🔗</button>
              <button class="btn btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">✏️</button>
              ${alert.status === 'cancelled' || alert.status === 'canceled' ? `
              <button class="btn btn-outline-secondary" 
                      onclick="reactivateAlert(${alert.id})" 
                      title="הפעל מחדש התראה">
                <span class="reactivate-icon">✓</span>
              </button>
              ` : `
              <button class="btn btn-danger" 
                      onclick="cancelAlert(${alert.id})" 
                      title="ביטול">
                <span class="cancel-icon">X</span>
              </button>
              `}
              <button class="btn btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">🗑️</button>
            </div>
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
    
    console.log('✅ טבלת התראות עודכנה בהצלחה עם', alerts.length, 'התראות');
    

  });
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
  // סטטיסטיקות לפי הדוקומנטציה של מערכת ההתראות
  const totalAlerts = alertsData.length;
  const openAlerts = alertsData.filter(alert =>
    alert.status === 'open',
  ).length; // התראות פעילות
  const newAlerts = alertsData.filter(alert =>
    alert.is_triggered === 'new',
  ).length; // התראות חדשות (הופעלו ולא נקראו)
  const todayAlerts = alertsData.filter(alert => {
    const today = new Date().toDateString();
    const alertDate = new Date(alert.created_at).toDateString();
    return alertDate === today;
  }).length;
  const weekAlerts = alertsData.filter(alert => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(alert.created_at) >= weekAgo;
  }).length;

  document.getElementById('totalAlerts').textContent = totalAlerts;
  document.getElementById('activeAlerts').textContent = openAlerts;
  document.getElementById('newAlerts').textContent = newAlerts;
  document.getElementById('todayAlerts').textContent = todayAlerts;
  document.getElementById('weekAlerts').textContent = weekAlerts;
}


/**
 * הצגת מודל הוספת התראה
 */
function showAddAlertModal() {
  // טעינת נתונים למודל
  loadModalData();

  // ניקוי הטופס
  const form = document.getElementById('addAlertForm');
  if (form) {
    form.reset();
  }

  // ניקוי ולידציה
  clearAlertValidation();

  // הוספת event listeners לשדות התנאי
  setTimeout(() => {
    const conditionAttributeElement = document.getElementById('conditionAttribute');
    if (conditionAttributeElement) {
      conditionAttributeElement.addEventListener('change', function () {
        checkAlertVariable(this);
      });
    }

    const conditionOperatorElement = document.getElementById('conditionOperator');
    if (conditionOperatorElement) {
      conditionOperatorElement.addEventListener('change', function () {
        checkAlertOperator(this);
      });
    }
  }, 100);

  // הצגת המודל
  const modalElement = document.getElementById('addAlertModal');
  if (modalElement) {
    // הגדרת z-index גבוה מאוד
    modalElement.style.zIndex = '999999';

    // בדיקה אם Bootstrap זמין
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      });
      modal.show();

      // וידוא שהמודל מופיע מעל הכל
      setTimeout(() => {
        modalElement.style.zIndex = '999999';
        const dialog = modalElement.querySelector('.modal-dialog');
        if (dialog) {
          dialog.style.zIndex = '1000000';
        }
        const content = modalElement.querySelector('.modal-content');
        if (content) {
          content.style.zIndex = '1000001';
        }
      }, 100);
    } else {
      // אם Bootstrap לא זמין, נציג את המודל באופן ידני
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.style.zIndex = '999999';
      document.body.classList.add('modal-open');

      // הוספת backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modalBackdrop';
      backdrop.style.zIndex = '999998';
      document.body.appendChild(backdrop);
    }
  } else {
    // console.error('Modal element not found');
  }
}

/**
 * ניקוי ולידציה של טפסי התראות
 */
function clearAlertValidation() {
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
}

/**
 * טעינת נתונים למודלים
 */
async function loadModalData() {
  try {

    // טעינת נתונים במקביל
    // console.log('🔧 Loading modal data...');
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

    // console.log('🔧 Modal data loaded:');
    // console.log('🔧 Accounts:', accounts.length);
    // console.log('🔧 Trades:', trades.length);
    // console.log('🔧 Trade Plans:', tradePlans.length);
    // console.log('🔧 Tickers:', tickers.length);

    // נטענו נתונים נוספים

    // שמירת נתונים בגלובל
    window.accountsData = accounts;
    window.tradesData = trades;
    window.tradePlansData = tradePlans;
    window.tickersData = tickers;

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    // console.log('🔧 Setting initial data for tickers...');
    populateSelect('alertRelatedObjectSelect', tickers, 'symbol', '');
    populateSelect('editAlertRelatedObjectSelect', tickers, 'symbol', '');
  } catch (error) {
    // console.error('שגיאה בטעינת נתונים למודל:', error);
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
    populateSelect('alertRelatedObjectSelect', [], 'symbol', '');
    populateSelect('editAlertRelatedObjectSelect', [], 'symbol', '');
  }
}

/**
 * עדכון רדיו באטונים
 */
function updateRadioButtons(accounts, trades, tradePlans, tickers) {
  // עדכון רדיו באטון לחשבונות
  const accountRadio = document.getElementById('alertRelationAccount');
  const editAccountRadio = document.getElementById('editAlertRelationAccount');

  if (accountRadio) {
    accountRadio.addEventListener('change', () => {
      populateSelect('alertRelatedObjectSelect', accounts, 'name', 'חשבון');
    });
  }

  if (editAccountRadio) {
    editAccountRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', accounts, 'name', 'חשבון');
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
}

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  // console.log('🔧 populateSelect called:', { selectId, dataLength: data?.length, field, prefix });

  const select = document.getElementById(selectId);
  if (!select) {
    // console.error('🔧 Select element not found:', selectId);
    return;
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  if (!data || data.length === 0) {
    // console.log('🔧 No data available for:', selectId);
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

    if (prefix === 'חשבון') {
      // עבור חשבון: שם החשבון + מטבע
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

  // console.log('🔧 populateSelect completed for:', selectId, 'with', data.length, 'items');
}
}


/**
 * טיפול בשינוי סוג שיוך
 * @param {HTMLInputElement} radioElement - אלמנט הרדיו שנבחר
 */
function onRelationTypeChange(radioElement) {
  // console.log('🔧 Relation type changed:', radioElement.value);

  // הפעלת שדה בחירת אובייקט
  const relatedObjectSelect = document.getElementById('alertRelatedObjectSelect');
  if (relatedObjectSelect) {
    relatedObjectSelect.disabled = false;
    relatedObjectSelect.classList.remove('disabled-field');
  }

  // מילוי רשימת האובייקטים לפי הסוג שנבחר
  populateRelatedObjects(parseInt(radioElement.value));
}

/**
 * טיפול בבחירת אובייקט
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 */
function onRelatedObjectChange(selectElement) {
  // console.log('🔧 Related object changed:', selectElement.value);

  if (selectElement.value) {
    // הפעלת שדות התנאי ישירות
    enableConditionFields();
  } else {
    // השבתת שדות התנאי
    disableConditionFields();
  }
}


/**
 * הפעלת שדות התנאי
 */
function enableConditionFields() {
  const conditionAttribute = document.getElementById('conditionAttribute');
  const conditionOperator = document.getElementById('conditionOperator');
  const conditionNumber = document.getElementById('conditionNumber');
  const alertMessage = document.getElementById('alertMessage');

  if (conditionAttribute) {
    conditionAttribute.disabled = false;
    conditionAttribute.classList.remove('disabled-field');
  }
  if (conditionOperator) {
    conditionOperator.disabled = false;
    conditionOperator.classList.remove('disabled-field');
  }
  if (conditionNumber) {
    conditionNumber.disabled = false;
    conditionNumber.classList.remove('disabled-field');
  }
  if (alertMessage) {
    alertMessage.disabled = false;
    alertMessage.classList.remove('disabled-field');
  }
}

/**
 * השבתת שדות התנאי
 */
function disableConditionFields() {
  const conditionAttribute = document.getElementById('conditionAttribute');
  const conditionOperator = document.getElementById('conditionOperator');
  const conditionNumber = document.getElementById('conditionNumber');
  const alertMessage = document.getElementById('alertMessage');

  if (conditionAttribute) {
    conditionAttribute.disabled = true;
    conditionAttribute.classList.add('disabled-field');
    conditionAttribute.value = '';
  }
  if (conditionOperator) {
    conditionOperator.disabled = true;
    conditionOperator.classList.add('disabled-field');
    conditionOperator.value = '';
  }
  if (conditionNumber) {
    conditionNumber.disabled = true;
    conditionNumber.classList.add('disabled-field');
    conditionNumber.value = '';
  }
  if (alertMessage) {
    alertMessage.disabled = true;
    alertMessage.classList.add('disabled-field');
    alertMessage.value = '';
  }
}

/**
 * מילוי רשימת אובייקטים לפי סוג השיוך
 * @param {number} relationTypeId - מזהה סוג השיוך
 */
function populateRelatedObjects(relationTypeId) {
  const selectElement = document.getElementById('alertRelatedObjectSelect');
  if (!selectElement) {return;}

  // ניקוי הרשימה
  selectElement.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  // מילוי לפי סוג השיוך
  switch (relationTypeId) {
  case 1: // חשבון
    populateSelect('alertRelatedObjectSelect', window.accountsData || [], 'name', 'חשבון');
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
}

/**
 * מילוי רשימת אובייקטים למודל העריכה
 * @param {number} relationTypeId - מזהה סוג השיוך
 */
function populateEditRelatedObjects(relationTypeId) {
  const selectElement = document.getElementById('editAlertRelatedObjectSelect');
  if (!selectElement) {return;}

  // ניקוי הרשימה
  selectElement.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  // מילוי לפי סוג השיוך
  switch (relationTypeId) {
  case 1: // חשבון
    populateSelect('editAlertRelatedObjectSelect', window.accountsData || [], 'name', 'חשבון');
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
}

/**
 * טיפול בשינוי סוג שיוך במודל העריכה
 * @param {HTMLInputElement} radioElement - אלמנט הרדיו שנבחר
 */
function onEditRelationTypeChange(radioElement) {
  // console.log('🔧 Edit relation type changed:', radioElement.value);

  // מילוי רשימת האובייקטים לפי הסוג שנבחר
  populateEditRelatedObjects(parseInt(radioElement.value));
}

/**
 * טיפול בבחירת אובייקט במודל העריכה
 * @param {HTMLSelectElement} selectElement - אלמנט הבחירה
 */
function onEditRelatedObjectChange(selectElement) {
  // console.log('🔧 Edit related object changed:', selectElement.value);

  if (selectElement.value) {
    // הפעלת שדות התנאי ישירות
    enableEditConditionFields();
  } else {
    // השבתת שדות התנאי
    disableEditConditionFields();
  }
}

/**
 * הפעלת שדות התנאי במודל העריכה
 */
function enableEditConditionFields() {
  const conditionAttribute = document.getElementById('editConditionAttribute');
  const conditionOperator = document.getElementById('editConditionOperator');
  const conditionNumber = document.getElementById('editConditionNumber');
  const alertMessage = document.getElementById('editAlertMessage');

  if (conditionAttribute) {
    conditionAttribute.disabled = false;
    conditionAttribute.classList.remove('disabled-field');
  }
  if (conditionOperator) {
    conditionOperator.disabled = false;
    conditionOperator.classList.remove('disabled-field');
  }
  if (conditionNumber) {
    conditionNumber.disabled = false;
    conditionNumber.classList.remove('disabled-field');
  }
  if (alertMessage) {
    alertMessage.disabled = false;
    alertMessage.classList.remove('disabled-field');
  }
}

/**
 * השבתת שדות התנאי במודל העריכה
 */
function disableEditConditionFields() {
  const conditionAttribute = document.getElementById('editConditionAttribute');
  const conditionOperator = document.getElementById('editConditionOperator');
  const conditionNumber = document.getElementById('editConditionNumber');
  const alertMessage = document.getElementById('editAlertMessage');

  if (conditionAttribute) {
    conditionAttribute.disabled = true;
    conditionAttribute.classList.add('disabled-field');
    conditionAttribute.value = '';
  }
  if (conditionOperator) {
    conditionOperator.disabled = true;
    conditionOperator.classList.add('disabled-field');
    conditionOperator.value = '';
  }
  if (conditionNumber) {
    conditionNumber.disabled = true;
    conditionNumber.classList.add('disabled-field');
    conditionNumber.value = '';
  }
  if (alertMessage) {
    alertMessage.disabled = true;
    alertMessage.classList.add('disabled-field');
    alertMessage.value = '';
  }
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
  // console.log('🔍 === CHECK ALERT VARIABLE ===');
  // console.log('🔍 Element:', selectElement);
  // console.log('🔍 Selected value:', selectElement.value);

  // כרגע מאפשרים את כל התכונות
  const selectedValue = selectElement.value;

  if (!selectedValue) {
    // console.log('❌ No variable selected');
    return false;
  }

  // console.log('✅ Variable accepted:', selectedValue);
  return true;
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
  // console.log('🔍 === CHECK ALERT OPERATOR ===');
  // console.log('🔍 Element:', selectElement);
  // console.log('🔍 Selected value:', selectElement.value);

  // כרגע מאפשרים את כל האופרטורים
  const selectedValue = selectElement.value;

  if (!selectedValue) {
    // console.log('❌ No operator selected');
    return false;
  }

  // console.log('✅ Operator accepted:', selectedValue);
  return true;
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
  return `${variable} | ${operator} | ${value}`;
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
  if (!condition || !condition.includes(' | ')) {
    return { variable: 'price', operator: 'moreThen', value: '' };
  }

  const parts = condition.split(' | ');
  return {
    variable: parts[0] || 'price',
    operator: parts[1] || 'moreThen',
    value: parts[2] || '',
  };
}

/**
 * שמירת התראה חדשה
 *
 * פונקציה זו אוספת נתונים מהטופס ושולחת אותם לשרת
 * כולל בדיקת תקינות וטיפול בשגיאות
 * משתמשת במערכת ההתראות הגלובלית להודעות
 */
async function saveAlert() {
  console.log('🔧 saveAlert function called');
  
  // ניקוי מטמון לפני פעולת CRUD - הוספה
  if (window.clearCacheBeforeCRUD) {
    window.clearCacheBeforeCRUD('alerts', 'add');
  }
  
  const form = document.getElementById('addAlertForm');
  if (!form) {
    console.warn('⚠️ Form element not found - skipping save operation');
    return;
  }
  console.log('🔧 Form found, proceeding with validation');


  // בדיקת תקינות הטופס
  if (!form.checkValidity()) {
    console.log('🔧 Form validation failed');
    form.reportValidity();
    return;
  }
  console.log('🔧 Form validation passed');

  // בדיקת שדות חובה
  const formData = new FormData(form);
  const relatedType = formData.get('alertRelationType');
  const relatedId = document.getElementById('alertRelatedObjectSelect').value;

  // console.log('🔧 Form validation:');
  // console.log('🔧 Related type:', relatedType);
  // console.log('🔧 Related ID:', relatedId);

  // בדיקת תנאי התראה
  const conditionAttributeElement = document.getElementById('conditionAttribute');
  const conditionOperatorElement = document.getElementById('conditionOperator');
  const conditionNumberElement = document.getElementById('conditionNumber');

  const conditionAttribute = conditionAttributeElement.value;
  const conditionOperator = conditionOperatorElement.value;
  const conditionNumber = conditionNumberElement.value;

  // console.log('🔧 Condition validation:');
  // console.log('🔧 Condition attribute:', conditionAttribute);
  // console.log('🔧 Condition operator:', conditionOperator);
  // console.log('🔧 Condition number:', conditionNumber);

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

  const alertData = {
    related_type_id: parseInt(formData.get('alertRelationType')),
    related_id: parseInt(document.getElementById('alertRelatedObjectSelect').value),
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: document.getElementById('alertMessage').value || null,
    status: 'open',
    is_triggered: 'false',
  };

  // שולח התראה חדשה
  // console.log('🔧 === SAVING ALERT ===');
  // console.log('🔧 Alert data:', alertData);
  // console.log('🔧 Request URL:', '/api/alerts/');
  // console.log('🔧 Request method:', 'POST');
  // console.log('🔧 Request body:', JSON.stringify(alertData, null, 2));

  try {
    console.log('🔧 === SAVING ALERT ===');
    console.log('🔧 Alert data:', alertData);
    console.log('🔧 Request URL:', '/api/alerts/');
    console.log('🔧 Request method:', 'POST');
    console.log('🔧 Request body:', JSON.stringify(alertData, null, 2));

    const response = await fetch('/api/alerts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });

    console.log('🔧 Response status:', response.status);
    console.log('🔧 Response ok:', response.ok);

    if (response.ok) {
      const newAlert = await response.json();
      console.log('🔧 New alert created:', newAlert);

      // התראה נשמרה בהצלחה

      // שימוש במערכת הריענון המרכזית
      if (window.centralRefresh) {
        await window.centralRefresh.showSuccessAndRefresh('alerts', 'התראה נשמרה בהצלחה!');
      } else {
        // Fallback למערכת הישנה
        // הצגת הודעה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'התראה נשמרה בהצלחה!');
        }

        // רענון הנתונים
        await loadAlertsData();
      }

      // סגירת המודל
      closeModal('addAlertModal');
      
    } else {
      const errorText = await response.text();
      console.error('🔧 Server error response:', errorText);
      throw new Error(`שגיאה בשמירת התראה: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('🔧 Error saving alert:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בשמירת התראה', 'שגיאה בשמירת התראה: ' + error.message);
    }
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
function editAlert(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (!alert) {
    if (window.showErrorNotification) {
      window.showErrorNotification('התראה לא נמצאה', 'התראה לא נמצאה');
    }
    return;
  }

  // ניקוי ולידציה
  clearAlertValidation();

  // מילוי הטופס
  const editAlertId = document.getElementById('editAlertId');
  const editAlertMessage = document.getElementById('editAlertMessage');
  const editAlertStatus = document.getElementById('editAlertStatus');
  const editAlertIsTriggered = document.getElementById('editAlertIsTriggered');
  const editAlertState = document.getElementById('editAlertState');

  if (editAlertId) {editAlertId.value = alert.id;}
  if (editAlertMessage) {editAlertMessage.value = alert.message || '';}
  if (editAlertStatus) {editAlertStatus.value = alert.status || 'open';}
  if (editAlertIsTriggered) {editAlertIsTriggered.value = alert.is_triggered || 'false';}

  // מילוי תנאי התראה
  const editConditionAttribute = document.getElementById('editConditionAttribute');
  const editConditionOperator = document.getElementById('editConditionOperator');
  const editConditionNumber = document.getElementById('editConditionNumber');

  if (editConditionAttribute) {editConditionAttribute.value = alert.condition_attribute || 'price';}
  if (editConditionOperator) {editConditionOperator.value = alert.condition_operator || 'more_than';}
  if (editConditionNumber) {editConditionNumber.value = alert.condition_number || '0';}

  // קביעת המצב הנכון לפי status ו-is_triggered
  const currentState = getAlertState(alert.status, alert.is_triggered);
  if (editAlertState) {editAlertState.value = currentState;}

  // טעינת נתונים למודל ואז מילוי השדות
  loadModalData().then(() => {
    // בחירת סוג הקשר
    const relationType = alert.related_type_id;
    const radioButton = document.querySelector(`input[name="editAlertRelationType"][value="${relationType}"]`);
    if (radioButton) {
      radioButton.checked = true;
      // הפעלת אירוע change לטעינת האובייקטים
      radioButton.dispatchEvent(new Event('change'));
    }

    // בחירת האובייקט המקושר
    setTimeout(() => {
      const relatedObjectSelect = document.getElementById('editAlertRelatedObjectSelect');
      if (relatedObjectSelect && alert.related_id) {
        relatedObjectSelect.value = alert.related_id;
        // הפעלת אירוע change להפעלת שדות נוספים
        relatedObjectSelect.dispatchEvent(new Event('change'));
      }
    }, 200);

    // הפעלת שדות התנאי
    setTimeout(() => {
      enableEditConditionFields();
    }, 300);
  });

  // הוספת event listeners לשדות התנאי במודל העריכה
  setTimeout(() => {
    const editConditionAttributeElement = document.getElementById('editConditionAttribute');
    if (editConditionAttributeElement) {
      editConditionAttributeElement.addEventListener('change', function () {
        checkAlertVariable(this);
      });
    }

    const editConditionOperatorElement = document.getElementById('editConditionOperator');
    if (editConditionOperatorElement) {
      editConditionOperatorElement.addEventListener('change', function () {
        checkAlertOperator(this);
      });
    }
  }, 100);

  // הצגת המודל
  const modalElement = document.getElementById('editAlertModal');
  if (modalElement) {
    // הגדרת z-index גבוה מאוד
    modalElement.style.zIndex = '99999';

    // בדיקה אם Bootstrap זמין
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      });
      modal.show();

      // וידוא שהמודל מופיע מעל הכל
      setTimeout(() => {
        modalElement.style.zIndex = '99999';
        const dialog = modalElement.querySelector('.modal-dialog');
        if (dialog) {
          dialog.style.zIndex = '100000';
        }
        const content = modalElement.querySelector('.modal-content');
        if (content) {
          content.style.zIndex = '100001';
        }
      }, 100);
    } else {
      // אם Bootstrap לא זמין, נציג את המודל באופן ידני
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.style.zIndex = '99999';
      document.body.classList.add('modal-open');

      // הוספת backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modalBackdrop';
      backdrop.style.zIndex = '99998';
      document.body.appendChild(backdrop);
    }
  } else {
    // console.error('Edit modal element not found');
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
function validateAlertStatusCombination(status, isTriggered) {
  // כללים לפי הדוקומנטציה:
  // 1. status='open' + is_triggered='false' - תקין
  // 2. status='closed' + is_triggered='new' - תקין
  // 3. status='closed' + is_triggered='true' - תקין
  // 4. status='cancelled' + is_triggered='false' - תקין (תוקן!)

  if (status === 'open' && isTriggered === 'false') {
    return true;
  }
  if (status === 'closed' && (isTriggered === 'new' || isTriggered === 'true')) {
    return true;
  }
  if (status === 'cancelled' && isTriggered === 'false') {
    return true;
  }

  return false;
}

/**
 * עדכון status ו-is_triggered בהתאם למצב הנבחר
 *
 * פונקציה זו מעדכנת את השדות הנסתרים status ו-is_triggered
 * בהתאם למצב שנבחר ב-select של מצב ההתראה
 *
 * מצבים:
 * - new: status='open', is_triggered='false'
 * - active: status='open', is_triggered=שמירה על הערך הנוכחי
 * - unread: status='closed', is_triggered='new'
 * - read: status='closed', is_triggered='true'
 * - cancelled: status='cancelled', is_triggered='false'
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
    // console.warn('⚠️ Form element not found - skipping update operation');
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
  // console.log('🔍 בדיקת נתונים לפני שליחה:');
  // console.log('- related_type_id:', relatedTypeId, '(valid:', !isNaN(relatedTypeId), ')');
  // console.log('- related_id:', relatedId, '(valid:', !isNaN(relatedId), ')');
  // console.log('- status:', alertData.status);
  // console.log('- is_triggered:', alertData.is_triggered);

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
          window.showSuccessNotification('הצלחה', 'התראה עודכנה בהצלחה!');
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
    // console.error('שגיאה בעדכון התראה:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון התראה', 'שגיאה בעדכון התראה');
    }
  }
}

/**
 * מחיקת התראה
 */
async function _deleteAlert(alertId) {
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
          // console.log('מחיקה בוטלה');
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
  // console.log('🔄 confirmDeleteAlert נקראה עבור ID:', alertId);

  try {
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      // console.log('✅ התראה נמחקה בהצלחה');
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'התראה נמחקה בהצלחה!');
      }
      loadAlertsData();
      
    } else {
      // console.error('❌ שגיאה במחיקת התראה:', result);

      // טיפול בשגיאות מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        if (serverMessage.includes('has linked items')) {
          if (window.showErrorNotification) {
            window.showErrorNotification(
              'שגיאה במחיקה',
              'לא ניתן למחוק התראה זו - יש פריטים מקושרים אליה',
            );
          }
        } else {
          if (window.showErrorNotification) {
            window.showErrorNotification(
              'שגיאה במחיקה',
              serverMessage,
            );
          }
        }
      } else {
        if (window.showErrorNotification) {
          window.showErrorNotification(
            'שגיאה במחיקה',
            'שגיאה במחיקת התראה - בדוק את הנתונים',
          );
        }
      }
    }
  } catch {
    // console.error('❌ שגיאה במחיקת התראה:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאה',
        'שגיאה במחיקת התראה - בדוק את חיבור השרת',
      );
    }
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
 * @param {number} relatedType - מזהה סוג האובייקט (1=חשבון, 2=טרייד, 3=תכנון, 4=טיקר)
 * @returns {string} שם המחלקה CSS
 */
function _getRelatedClass(relatedType) {
  switch (relatedType) {
  case 4: return 'related-ticker'; // ticker
  case 2: return 'related-trade'; // trade
  case 3: return 'related-plan'; // trade_plan
  case 1: return 'related-account'; // account
  default: return 'related-other';
  }
}


/**
 * שחזור מצב הסקשנים
 *
 * פונקציה זו משחזרת את המצב השמור של הסקשנים (top-section ו-main-section)
 * כולל מצב פתוח/סגור ומיקום האייקונים
 * משתמשת ב-localStorage לשמירת המצב
 */
function restoreAlertsSectionState() {
  // שימוש בפונקציה הגלובלית החדשה
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    // console.error('restoreAllSectionStates function not found in main.js');
  }
}

// הגנה - וידוא שהפונקציות הגלובליות זמינות
if (typeof window.toggleSection !== 'function') {
  window.toggleSection = function () {
    // console.warn('toggleSection fallback called - main.js may not be loaded properly');
  };
}

// toggleSection fallback removed - use toggleSection('main') instead

// toggleSection function removed - using global version from ui-utils.js

  // אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 אתחול דף התראות...');

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
  console.log('📊 טעינת נתוני התראות...');
  loadAlertsData();
  

  // טעינת מצב המיון
  if (typeof window.loadSortState === 'function') {
    window.loadSortState('alerts');
  }
  
  console.log('✅ דף התראות אותחל בהצלחה');
});

// אתחול הדף - גרסה שנייה (מוסרת)
// document.addEventListener('DOMContentLoaded', function () {
//   // console.log('🔄 === DOM CONTENT LOADED (ALERTS) ===');
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
      // console.error('❌ loadAlertsData function not found');
    }
  };
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// הוספת הפונקציות לגלובל
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.filterAlertsLocally = filterAlertsLocally;

/**
 * פילטר התראות לפי סוג אובייקט מקושר
 * פונקציה נוספת שמפעילה פילטר ספציפי בנוסף לפילטר הראשי
 * @param {string} type - סוג האובייקט: 'all', 'account', 'trade', 'trade_plan', 'ticker'
 */
function filterAlertsByRelatedObjectType(type) {
  // console.log('🔧 פילטר התראות לפי סוג אובייקט מקושר - סוג:', type);

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
      btn.classList.remove('btn-outline-primary');
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.backgroundColor = 'white';
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.remove('active');
      btn.classList.add('btn-outline-primary');
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
  let filteredAlerts = alertsData;

  if (type !== 'all') {
    filteredAlerts = alertsData.filter(alert =>
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

  // console.log(`✅ Filtered alerts by type '${type}': ${filteredAlerts.length} alerts found`);
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
  // console.log('🔍 בדיקת זמינות פונקציות alerts.js - ' + new Date().toLocaleTimeString());
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

// console.log('✅ alerts.js הושלם בהצלחה - כל הפונקציות זמינות');

// בדיקת ייצוא פונקציות
// console.log('🔍 בדיקת ייצוא פונקציות alerts.js:');
// console.log('- loadAlertsData:', typeof window.loadAlertsData);
// console.log('- updateAlertsTable:', typeof window.updateAlertsTable);
// console.log('- showAddAlertModal:', typeof window.showAddAlertModal);
// console.log('- editAlert:', typeof window.editAlert);
// console.log('- deleteAlert:', typeof window.deleteAlert);
// console.log('- formatAlertCondition:', typeof window.formatAlertCondition);
// console.log('- parseAlertCondition:', typeof window.parseAlertCondition);
// console.log('- clearAlertValidation:', typeof window.clearAlertValidation);

/**
 * בדיקת תנאי התראה
 * בודק אם תנאי התראה מתקיים עבור טיקר מסוים
 * @param {Object} alert - אובייקט ההתראה
 * @param {Object} tickerData - נתוני הטיקר הנוכחיים
 */
function checkAlertCondition(alert, tickerData) {
  try {
    console.log('🔍 בודק תנאי התראה:', alert.id, tickerData);
    
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
    console.error('שגיאה בבדיקת תנאי התראה:', error);
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
    console.log('🔄 מחליף מצב התראה:', alertId);
    
    // חיפוש ההתראה בנתונים
    const alert = alertsData.find(a => a.id === alertId);
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
      console.log('✅ מצב התראה עודכן:', data);
      
      // עדכון הנתונים המקומיים
      alert.is_active = newIsActive;
      alert.status = newStatus;
      
      // רענון הטבלה
      updateAlertsTable(alertsData);
      
      // הודעת הצלחה
      const statusText = newIsActive ? 'הופעלה' : 'כובתה';
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(`התראה ${statusText} בהצלחה`);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(`התראה ${statusText} בהצלחה`, 'success');
      }
    })
    .catch(error => {
      console.error('שגיאה בעדכון מצב התראה:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון מצב התראה', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בעדכון מצב התראה', 'error');
      }
    });
    
  } catch (error) {
    console.error('שגיאה בהחלפת מצב התראה:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהחלפת מצב התראה', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהחלפת מצב התראה', 'error');
    }
  }
}

/**
 * עדכון סטטוס התראה
 * @param {number} alertId - מזהה ההתראה
 * @param {string} status - הסטטוס החדש
 */
function updateAlertStatus(alertId, status) {
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
      console.log('✅ סטטוס התראה עודכן:', data);
    })
    .catch(error => {
      console.error('שגיאה בעדכון סטטוס התראה:', error);
    });
    
  } catch (error) {
    console.error('שגיאה בעדכון סטטוס התראה:', error);
  }
}

// ========================================
// אתחול מערכת ראש הדף החדשה
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 טעינת דף התראות עם מערכת ראש דף חדשה...');

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
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


// Filter functions
function filterAlertsByRelatedObjectType(type) {
    if (typeof window.filterAlertsByRelatedObjectType === 'function') {
        window.filterAlertsByRelatedObjectType(type);
    } else {
        console.warn('filterAlertsByRelatedObjectType function not found');
    }
}

// ===== GLOBAL EXPORTS =====
// Detailed Log Functions for Alerts Page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'alerts',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            alertsStats: {
                totalAlerts: document.getElementById('totalAlerts')?.textContent || 'לא נמצא',
                activeAlerts: document.getElementById('activeAlerts')?.textContent || 'לא נמצא',
                newAlerts: document.getElementById('newAlerts')?.textContent || 'לא נמצא',
                todayAlerts: document.getElementById('todayAlerts')?.textContent || 'לא נמצא',
                weekAlerts: document.getElementById('weekAlerts')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'התראות - סקירה כללית',
                    visible: !document.getElementById('topSection')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('alertsColorDemo')?.style.display === 'none'
                },
                section1: {
                    title: 'ניהול התראות',
                    visible: !document.getElementById('section1')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#alertsTable tbody tr').length,
                    tableData: document.querySelector('#alertsContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#alertsTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#alertsTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#alertsTable tbody tr').length > 0
            },
            filters: {
                allButton: document.querySelector('button[data-type="all"]') ? 'זמין' : 'לא זמין',
                accountButton: document.querySelector('button[data-type="account"]') ? 'זמין' : 'לא זמין',
                tradeButton: document.querySelector('button[data-type="trade"]') ? 'זמין' : 'לא זמין',
                tradePlanButton: document.querySelector('button[data-type="trade_plan"]') ? 'זמין' : 'לא זמין',
                tickerButton: document.querySelector('button[data-type="ticker"]') ? 'זמין' : 'לא זמין',
                activeFilter: document.querySelector('.btn.active')?.textContent || 'לא נמצא'
            },
            modals: {
                addModal: document.getElementById('addAlertModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editAlertModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteAlertModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddAlertModal: typeof window.showAddAlertModal === 'function' ? 'זמין' : 'לא זמין',
                editAlert: typeof window.editAlert === 'function' ? 'זמין' : 'לא זמין',
                deleteAlert: typeof window.deleteAlert === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                filterAlertsByRelatedObjectType: typeof window.filterAlertsByRelatedObjectType === 'function' ? 'זמין' : 'לא זמין',
                sortTableData: typeof window.sortTableData === 'function' ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}


// Export functions to global scope for onclick attributes
window.toggleSection = toggleSection;
// window.toggleSection export removed - using global version from ui-utils.js
window.filterAlertsByRelatedObjectType = filterAlertsByRelatedObjectType;
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.showAddAlertModal = showAddAlertModal;
window.editAlert = editAlert;
window.deleteAlert = deleteAlert;
// window.copyDetailedLog export removed - using global version from system-management.js
window.generateDetailedLog = generateDetailedLog;
