/**
 * ========================================
 * דף ההתראות - Alerts Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההתראות (alerts.html)
 * 
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * 
 * Table Mapping:
 * - Uses 'alerts' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * תכולת הקובץ:
 * - טעינת נתוני התראות מהשרת
 * - הצגת טבלת התראות עם מיון ופילטרים
 * - הוספת התראה חדשה
 * - עריכת התראה קיימת
 * - מחיקת התראה
 * - ניהול סטטוסים ומצבי הפעלה
 * - שימוש במערכת התראות גלובלית
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
console.log('🔧 Checking global functions in alerts.js...');
console.log('🔧 translateConditionFields available:', typeof window.translateConditionFields);
console.log('🔧 translateLegacyCondition available:', typeof window.translateLegacyCondition);



// נתוני דמה
const demoAlerts = [
  {
    id: 1,
    title: "התראה על מחיר AAPL",
    type: "price_alert",
    status: "open",
    related_type_id: 4, // ticker
    related_id: 1,
    condition: "מחיר > 210$",
    message: "AAPL הגיע ליעד מחיר",
    created_at: "2024-01-15",
    is_triggered: false
  },
  {
    id: 2,
    title: "סטופ לוס TSLA",
    type: "stop_loss",
    status: "open",
    related_type_id: 2, // trade
    related_id: 1,
    condition: "מחיר < 690$",
    message: "TSLA מתחת לסטופ",
    created_at: "2024-01-14",
    is_triggered: true
  }
];

/**
 * טעינת נתוני התראות מהשרת
 * 
 * פונקציה זו טוענת את כל ההתראות מהשרת ומעדכנת את הטבלה
 * אם השרת לא זמין, משתמשת בנתוני דמו
 * 
 * @returns {Array} מערך של התראות
 */
async function loadAlertsData() {
  try {
    const response = await fetch('/api/v1/alerts/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const alerts = data.data || data;

    // עדכון המשתנה הגלובלי
    alertsData = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      type: alert.type,
      status: alert.status,
      related_type_id: alert.related_type_id,
      related_id: alert.related_id,
      condition: alert.condition,
      message: alert.message,
      created_at: alert.created_at,
      is_triggered: alert.is_triggered
    }));

    // עדכון הטבלה

    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
      (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
      (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
      (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

    let filteredAlerts = [...alertsData];

    if (hasActiveFilters) {
      filteredAlerts = filterAlertsLocally(alertsData, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
    }

    updateAlertsTable(filteredAlerts);

    return alertsData;

  } catch (error) {
    console.error('Error loading alerts data:', error);
    // משתמש בנתוני דמו

    // שימוש בנתוני דמו
    alertsData = demoAlerts;
    updateAlertsTable(alertsData);

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
    const dateRange = window.translateDateRangeToDates ? window.translateDateRangeToDates(selectedDateRange) : { startDate: null, endDate: null };
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
        'מבוטל': 'cancelled'
      };

      const translatedSelectedStatuses = selectedStatuses.map(status =>
        statusTranslations[status] || status
      );

      const isMatch = translatedSelectedStatuses.includes(alert.status);
      return isMatch;
    });
  }

  // Filtering by type
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    filteredAlerts = filteredAlerts.filter(alert => {
      // המרת הערכים הנבחרים לאנגלית
      const typeTranslations = {
        'התראה על מחיר': 'price_alert',
        'סטופ לוס': 'stop_loss',
        'התראה על נפח': 'volume_alert',
        'התראה מותאמת': 'custom_alert'
      };

      const translatedSelectedTypes = selectedTypes.map(type =>
        typeTranslations[type] || type
      );

      const isMatch = translatedSelectedTypes.includes(alert.type);
      return isMatch;
    });
  }

  // Filtering by dates
  if (startDate && endDate) {
    filteredAlerts = filteredAlerts.filter(alert => {
      if (!alert.created_at) return false;

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
      'custom_alert': 'custom_alert'
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
        alert.title.toLowerCase().includes(term)
      );

      const typeMatch = alert.type && searchTerms.some(term =>
        alert.type.toLowerCase().includes(term)
      );

      const statusMatch = alert.status && searchTerms.some(term =>
        alert.status.toLowerCase().includes(term)
      );

      const conditionMatch = alert.condition && searchTerms.some(term =>
        alert.condition.toLowerCase().includes(term)
      );

      const messageMatch = alert.message && searchTerms.some(term =>
        alert.message.toLowerCase().includes(term)
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
        fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      accounts = (accountsResponse.data || accountsResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      trades = (tradesResponse.data || tradesResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tradePlans = (tradePlansResponse.data || tradePlansResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
      tickers = (tickersResponse.data || tickersResponse || []).filter(item => Array.isArray(item) ? true : typeof item === 'object');
    } catch (error) {
      console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
      // המשך עם מערכים ריקים
      accounts = [];
      trades = [];
      tradePlans = [];
      tickers = [];
    }
  };

  // טעינת נתונים ועדכון הטבלה
  loadAdditionalData().then(() => {

    const tableHTML = alerts.map(alert => {
      const statusClass = getStatusClass(alert.status);
      const typeClass = getTypeClass(alert.type);
      // קביעת האובייקט המקושר
      let relatedDisplay = '';
      let relatedIcon = '';
      let relatedClass = '';

      console.log(`🔍 === PROCESSING ALERT ${alert.id} ===`);
      console.log(`🔍 Alert data:`, {
        id: alert.id,
        related_type_id: alert.related_type_id,
        related_id: alert.related_id,
        type: alert.type,
        status: alert.status
      });
      console.log(`🔍 Available data counts:`, {
        accounts: accounts.length,
        trades: trades.length,
        tradePlans: tradePlans.length,
        tickers: tickers.length
      });

      // טיפול במקרים שבהם related_type_id הוא null
      if (alert.related_type_id === null || alert.related_id === null) {
        relatedDisplay = 'כללי';
        relatedIcon = '🌐';
        relatedClass = 'related-general';
        console.log(`ℹ️ Alert ${alert.id} is general (not linked to specific object)`);
      } else {
        switch (alert.related_type_id) {
          case 1: // חשבון
            console.log(`🔍 Looking for account with ID: ${alert.related_id}`);
            console.log(`🔍 Available accounts:`, accounts.map(a => ({ id: a.id, name: a.name || a.account_name })));
            const account = accounts.find(a => a.id === alert.related_id);
            if (account) {
              const name = account.name || account.account_name || 'לא מוגדר';
              const currency = account.currency || 'ILS';
              relatedDisplay = `${name} (${currency})`;
              console.log(`✅ Found account: ${name} (${currency})`);
            } else {
              relatedDisplay = `חשבון ${alert.related_id}`;
              console.log(`❌ Account not found for ID: ${alert.related_id}`);
            }
            relatedIcon = '🏦';
            relatedClass = 'related-account';
            break;
          case 2: // טרייד
            console.log(`🔍 Looking for trade with ID: ${alert.related_id}`);
            console.log(`🔍 Available trades:`, trades.map(t => ({ id: t.id, created_at: t.created_at, date: t.date, side: t.side, investment_type: t.investment_type })));
            const trade = trades.find(t => t.id === alert.related_id);
            if (trade) {
              const date = trade.created_at || trade.date;
              const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
              const side = trade.side || 'לא מוגדר';
              const investmentType = trade.investment_type || 'לא מוגדר';
              relatedDisplay = `טרייד | ${side} | ${investmentType} | ${formattedDate}`;
              console.log(`✅ Found trade: ${relatedDisplay}`);
            } else {
              relatedDisplay = `טרייד ${alert.related_id}`;
              console.log(`❌ Trade not found for ID: ${alert.related_id}`);
            }
            relatedIcon = '📈';
            relatedClass = 'related-trade';
            break;
          case 3: // תוכנית
            console.log(`🔍 Looking for trade plan with ID: ${alert.related_id}`);
            console.log(`🔍 Available trade plans:`, tradePlans.map(p => ({ id: p.id, created_at: p.created_at, date: p.date, side: p.side, investment_type: p.investment_type })));
            const plan = tradePlans.find(p => p.id === alert.related_id);
            if (plan) {
              const date = plan.created_at || plan.date;
              const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
              const side = plan.side || 'לא מוגדר';
              const investmentType = plan.investment_type || 'לא מוגדר';
              relatedDisplay = `תוכנית | ${side} | ${investmentType} | ${formattedDate}`;
              console.log(`✅ Found trade plan: ${relatedDisplay}`);
            } else {
              relatedDisplay = `תוכנית ${alert.related_id}`;
              console.log(`❌ Trade plan not found for ID: ${alert.related_id}`);
            }
            relatedIcon = '📋';
            relatedClass = 'related-plan';
            break;
          case 4: // טיקר
            console.log(`🔍 Looking for ticker with ID: ${alert.related_id}`);
            console.log(`🔍 Available tickers:`, tickers.map(t => ({ id: t.id, symbol: t.symbol })));
            const ticker = tickers.find(t => t.id === alert.related_id);
            if (ticker) {
              relatedDisplay = ticker.symbol;
              console.log(`✅ Found ticker: ${ticker.symbol}`);
            } else {
              relatedDisplay = `טיקר ${alert.related_id}`;
              console.log(`❌ Ticker not found for ID: ${alert.related_id}`);
            }
            relatedIcon = '📊';
            relatedClass = 'related-ticker';
            break;
          default:
            relatedDisplay = `אובייקט ${alert.related_id}`;
            relatedIcon = '❓';
            relatedClass = 'related-other';
            console.log(`❓ Unknown related_type_id: ${alert.related_type_id}`);
        }
      }

      // קביעת הסימבול לטור הראשון
      let symbolDisplay = '';
      if (alert.related_type_id == 1) { // חשבון - ריק
        symbolDisplay = '-';
      } else if (alert.related_type_id == 2) { // טרייד
        const trade = trades.find(t => t.id == alert.related_id);
        if (trade && trade.ticker_id) {
          const ticker = tickers.find(tick => tick.id == trade.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : `טרייד ${alert.related_id}`;
        } else {
          symbolDisplay = `טרייד ${alert.related_id}`;
        }
      } else if (alert.related_type_id == 3) { // תוכנית
        const plan = tradePlans.find(p => p.id == alert.related_id);
        if (plan && plan.ticker_id) {
          const ticker = tickers.find(tick => tick.id == plan.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : `תוכנית ${alert.related_id}`;
        } else {
          symbolDisplay = `תוכנית ${alert.related_id}`;
        }
      } else if (alert.related_type_id == 4) { // טיקר
        const ticker = tickers.find(tick => tick.id == alert.related_id);
        symbolDisplay = ticker ? ticker.symbol : `טיקר ${alert.related_id}`;
      } else {
        symbolDisplay = `אובייקט ${alert.related_id}`;
      }

      // הוספת איקון קישור לפני האובייקט
      relatedDisplay = '🔗 ' + relatedDisplay;

      const createdAt = alert.created_at ? new Date(alert.created_at).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
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

      // המרת סוג התראה לעברית להצגה
      let typeDisplay;
      switch (alert.type) {
        case 'price_alert': typeDisplay = 'התראה על מחיר'; break;
        case 'stop_loss': typeDisplay = 'סטופ לוס'; break;
        case 'volume_alert': typeDisplay = 'התראה על נפח'; break;
        case 'custom_alert': typeDisplay = 'התראה מותאמת'; break;
        case 'account_alert': typeDisplay = 'התראה על חשבון'; break;
        case 'plan_alert': typeDisplay = 'התראה על תוכנית'; break;
        case 'trade_alert': typeDisplay = 'התראה על טרייד'; break;
        case 'ticker_alert': typeDisplay = 'התראה על טיקר'; break;
        case 'price': typeDisplay = 'התראה על מחיר'; break;
        case 'volume': typeDisplay = 'התראה על נפח'; break;
        case 'change': typeDisplay = 'התראה על שינוי'; break;
        case 'ma': typeDisplay = 'התראה על ממוצע נע'; break;
        default: typeDisplay = alert.type;
      }

      // המרת מצב הפעלה לעברית להצגה
      // לפי הדוקומנטציה: false=לא הופעל, new=הופעל לא נקרא, true=נקרא/בוטל
      let triggeredDisplay;
      let triggeredClass = '';
      if (alert.is_triggered === 'true' || alert.is_triggered === true) {
        triggeredDisplay = 'כן';
        triggeredClass = 'triggered-yes';
      } else if (alert.is_triggered === 'false' || alert.is_triggered === false) {
        triggeredDisplay = 'לא';
        triggeredClass = 'triggered-no';
      } else if (alert.is_triggered === 'new') {
        triggeredDisplay = 'חדש';
        triggeredClass = 'triggered-new';
      } else {
        triggeredDisplay = 'לא מוגדר';
        triggeredClass = 'triggered-unknown';
      }

      return `
        <tr data-status="${alert.status || ''}" data-type="${alert.type || ''}" data-date="${alert.created_at || ''}">
          <td class="ticker-cell">
            <span class="link-icon" title="חיבור לעמוד טרייד - בפיתוח" style="cursor: pointer; margin-left: 5px;">🔗</span>
            <span class="symbol-text">${symbolDisplay}</span>
          </td>
          <td><span class="condition-text">${(() => {
          if (alert.condition_attribute && alert.condition_operator && alert.condition_number && window.translateConditionFields) {
            return window.translateConditionFields(alert.condition_attribute, alert.condition_operator, alert.condition_number);
          }
          return alert.condition || '-';
        })()}</span></td>
          <td class="status-cell" data-status="${alert.status || ''}"><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
          <td><span class="triggered-badge ${triggeredClass}">${triggeredDisplay}</span></td>
          <td style="padding: 0;">
            <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right; min-width: 150px; cursor: pointer;" title="קישור לדף אובייקט - בפיתוח">
              ${relatedDisplay}
            </div>
          </td>
          <td class="type-cell" data-type="${alert.type || ''}"><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
          <td><span class="message-text">${alert.message || '-'}</span></td>
          <td data-date="${alert.created_at}"><span class="date-text">${createdAt}</span></td>
          <td class="actions-cell">
            <table class="table table-sm table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="p-0 pe-1">
                    <button class="btn btn-sm btn-info" onclick="viewLinkedItemsForAlert(${alert.id})" title="צפה באלמנטים מקושרים">🔗</button>
                  </td>
                  <td class="p-0 pe-1">
                    <button class="btn btn-sm btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">✏️</button>
                  </td>
                  <td class="p-0 pe-1">
                    ${alert.status === 'open' ? `
                    <button class="btn btn-sm btn-secondary" onclick="cancelAlert(${alert.id})" title="ביטול">❌</button>
                    ` : `
                    <button class="btn btn-sm btn-cancel-disabled" disabled title="לא ניתן לבטל התראה סגורה">X</button>
                    `}
                  </td>
                  <td class="p-0">
                    <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
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

    // הפעלת פילטרים אחרי עדכון הטבלה
    setTimeout(() => {
      if (typeof window.applyFilters === 'function') {
        window.applyFilters();
      }
    }, 100);
  });
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
  // סטטיסטיקות לפי הדוקומנטציה של מערכת ההתראות
  const totalAlerts = alertsData.length;
  const openAlerts = alertsData.filter(alert => alert.status === 'open').length; // התראות פעילות
  const newAlerts = alertsData.filter(alert => alert.is_triggered === 'new').length; // התראות חדשות (הופעלו ולא נקראו)
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
        keyboard: false
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
    console.error('Modal element not found');
  }
}

/**
 * טעינת נתונים למודלים
 */
async function loadModalData() {
  try {

    // טעינת נתונים במקביל
    console.log('🔧 Loading modal data...');
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    const accounts = accountsResponse.data || accountsResponse || [];
    const trades = tradesResponse.data || tradesResponse || [];
    const tradePlans = tradePlansResponse.data || tradePlansResponse || [];
    const tickers = tickersResponse.data || tickersResponse || [];

    console.log('🔧 Modal data loaded:');
    console.log('🔧 Accounts:', accounts.length);
    console.log('🔧 Trades:', trades.length);
    console.log('🔧 Trade Plans:', tradePlans.length);
    console.log('🔧 Tickers:', tickers.length);

    // נטענו נתונים נוספים

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);

    // הגדרת נתונים ראשוניים (ברירת מחדל לטיקר)
    console.log('🔧 Setting initial data for tickers...');
    populateSelect('alertRelatedObjectSelect', tickers, 'symbol', '');
    populateSelect('editAlertRelatedObjectSelect', tickers, 'symbol', '');
  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל:', error);
    // המשך עם מערכים ריקים
    updateRadioButtons([], [], [], []);
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
  console.log('🔧 populateSelect called:', { selectId, dataLength: data?.length, field, prefix });

  const select = document.getElementById(selectId);
  if (!select) {
    console.error('🔧 Select element not found:', selectId);
    return;
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  if (!data || data.length === 0) {
    console.log('🔧 No data available for:', selectId);
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

  console.log('🔧 populateSelect completed for:', selectId, 'with', data.length, 'items');
}

/**
 * סגירת מודל - שימוש בפונקציה גלובלית
 * @deprecated Use window.closeModal from main.js instead
 */
function closeModal(modalId) {
  // שימוש בפונקציה הגלובלית
  if (typeof window.closeModal === 'function') {
    window.closeModal(modalId);
  } else {
    console.error('❌ closeModal function not found in main.js');
  }
}

/**
 * בדיקת סוג התראה בזמן אמת
 */
function onAlertTypeChange(selectElement) {
  const selectedType = selectElement.value;
  if (selectedType) {
    checkAlertType(selectedType, selectElement);
  }
}

/**
 * בדיקת סוג התראה והצגת התראה לסוגים לא נתמכים
 * @param {string} alertType - סוג ההתראה
 * @param {HTMLElement} element - אלמנט הבחירה (אופציונלי)
 * @returns {boolean} true אם נתמך, false אם לא
 */
function checkAlertType(alertType, element = null) {
  // כרגע מאפשרים את כל סוגי ההתראות
  if (!alertType) {
    console.log('❌ No alert type selected');
    return false;
  }

  console.log('✅ Alert type accepted:', alertType);
  return true;
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
  console.log('🔍 === CHECK ALERT VARIABLE ===');
  console.log('🔍 Element:', selectElement);
  console.log('🔍 Selected value:', selectElement.value);

  // כרגע מאפשרים את כל התכונות
  const selectedValue = selectElement.value;

  if (!selectedValue) {
    console.log('❌ No variable selected');
    return false;
  }

  console.log('✅ Variable accepted:', selectedValue);
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
  console.log('🔍 === CHECK ALERT OPERATOR ===');
  console.log('🔍 Element:', selectElement);
  console.log('🔍 Selected value:', selectElement.value);

  // כרגע מאפשרים את כל האופרטורים
  const selectedValue = selectElement.value;

  if (!selectedValue) {
    console.log('❌ No operator selected');
    return false;
  }

  console.log('✅ Operator accepted:', selectedValue);
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
    value: parts[2] || ''
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
  const form = document.getElementById('addAlertForm');
  if (!form) {
    console.error('Form element not found');
    return;
  }

  // בדיקת סוג ההתראה
  const alertTypeElement = document.getElementById('alertType');
  const alertType = alertTypeElement.value;
  console.log('🔧 Alert type:', alertType);
  if (!checkAlertType(alertType, alertTypeElement)) {
    console.log('🔧 Alert type validation failed');
    return; // עצירת השמירה אם הסוג לא נתמך
  }

  // בדיקת תקינות הטופס
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // בדיקת שדות חובה
  const formData = new FormData(form);
  const relatedType = formData.get('alertRelationType');
  const relatedId = document.getElementById('alertRelatedObjectSelect').value;

  console.log('🔧 Form validation:');
  console.log('🔧 Related type:', relatedType);
  console.log('🔧 Related ID:', relatedId);

  // בדיקת תנאי התראה
  const conditionAttributeElement = document.getElementById('conditionAttribute');
  const conditionOperatorElement = document.getElementById('conditionOperator');
  const conditionNumberElement = document.getElementById('conditionNumber');

  const conditionAttribute = conditionAttributeElement.value;
  const conditionOperator = conditionOperatorElement.value;
  const conditionNumber = conditionNumberElement.value;

  console.log('🔧 Condition validation:');
  console.log('🔧 Condition attribute:', conditionAttribute);
  console.log('🔧 Condition operator:', conditionOperator);
  console.log('🔧 Condition number:', conditionNumber);

  if (!relatedType || !relatedId) {
    console.log('🔧 Validation failed: missing required fields');
    showModalNotification('error', 'שדות חובה חסרים', 'יש למלא את כל השדות החובה', 'addAlertModal');
    return;
  }

  if (!conditionAttribute || !conditionOperator || !conditionNumber) {
    console.log('🔧 Validation failed: missing condition fields');
    showModalNotification('error', 'תנאי התראה חסר', 'יש למלא את כל שדות התנאי', 'addAlertModal');
    return;
  }

  // וולידציה של ערך מספרי
  const numericValue = parseFloat(conditionNumber);
  if (isNaN(numericValue)) {
    showModalNotification('error', 'ערך לא תקין', 'הערך חייב להיות מספר', 'addAlertModal');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של ערך חיובי למחיר
  if (conditionAttribute === 'price' && numericValue <= 0) {
    showModalNotification('error', 'ערך מחיר לא תקין', 'מחיר חייב להיות גדול מ-0', 'addAlertModal');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של ערך מקסימלי למחיר
  if (conditionAttribute === 'price' && numericValue > 1000000) {
    showModalNotification('error', 'ערך מחיר גבוה מדי', 'מחיר לא יכול להיות גדול מ-1,000,000', 'addAlertModal');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של אחוזים (לשינוי)
  if (conditionAttribute === 'change' && (numericValue < -100 || numericValue > 100)) {
    showModalNotification('error', 'ערך אחוז לא תקין', 'אחוז שינוי חייב להיות בין -100% ל-100%', 'addAlertModal');
    conditionNumberElement.focus();
    return;
  }

  // המשך הקוד הקיים...
  // כרגע שולחים את סוג ההתראה כמו שהוא ללא המרה
  const convertedType = alertType;

  const alertData = {
    related_type_id: parseInt(formData.get('alertRelationType')),
    related_id: parseInt(document.getElementById('alertRelatedObjectSelect').value),
    type: convertedType,
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: document.getElementById('alertMessage').value || null,
    status: 'open',
    is_triggered: 'false'
  };

  // שולח התראה חדשה
  console.log('🔧 === SAVING ALERT ===');
  console.log('🔧 Alert data:', alertData);
  console.log('🔧 Request URL:', '/api/v1/alerts/');
  console.log('🔧 Request method:', 'POST');
  console.log('🔧 Request body:', JSON.stringify(alertData, null, 2));

  try {
    const response = await fetch('/api/v1/alerts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData)
    });

    console.log('🔧 Response status:', response.status);
    console.log('🔧 Response ok:', response.ok);

    if (response.ok) {
      const newAlert = await response.json();
      console.log('🔧 New alert created:', newAlert);

      // התראה נשמרה בהצלחה

      // סגירת המודל
      closeModal('addAlertModal');

      // רענון הנתונים
      loadAlertsData();

      // הצגת הודעה
      showModalNotification('success', 'התראה נשמרה', 'התראה נשמרה בהצלחה!', 'addAlertModal');
    } else {
      const errorText = await response.text();
      console.error('🔧 Server error response:', errorText);
      throw new Error(`שגיאה בשמירת התראה: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('🔧 Error saving alert:', error);
    showModalNotification('error', 'שגיאה בשמירת התראה', 'שגיאה בשמירת התראה: ' + error.message, 'addAlertModal');
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
    showErrorNotification('התראה לא נמצאה', 'התראה לא נמצאה');
    return;
  }

  // טעינת נתונים למודל
  loadModalData();

  // מילוי הטופס
  const editAlertId = document.getElementById('editAlertId');
  const editAlertType = document.getElementById('editAlertType');
  const editAlertMessage = document.getElementById('editAlertMessage');
  const editAlertStatus = document.getElementById('editAlertStatus');
  const editAlertIsTriggered = document.getElementById('editAlertIsTriggered');
  const editAlertState = document.getElementById('editAlertState');

  if (editAlertId) editAlertId.value = alert.id;
  if (editAlertType) editAlertType.value = alert.type || '';
  if (editAlertMessage) editAlertMessage.value = alert.message || '';
  if (editAlertStatus) editAlertStatus.value = alert.status || 'open';
  if (editAlertIsTriggered) editAlertIsTriggered.value = alert.is_triggered || 'false';

  // מילוי תנאי התראה
  const editConditionAttribute = document.getElementById('editConditionAttribute');
  const editConditionOperator = document.getElementById('editConditionOperator');
  const editConditionNumber = document.getElementById('editConditionNumber');

  if (editConditionAttribute) editConditionAttribute.value = alert.condition_attribute || 'price';
  if (editConditionOperator) editConditionOperator.value = alert.condition_operator || 'more_than';
  if (editConditionNumber) editConditionNumber.value = alert.condition_number || '0';

  // קביעת המצב הנכון לפי status ו-is_triggered
  const currentState = getAlertState(alert.status, alert.is_triggered);
  if (editAlertState) editAlertState.value = currentState;

  // בחירת האובייקט המקושר
  setTimeout(() => {
    const relatedObjectSelect = document.getElementById('editAlertRelatedObjectSelect');
    if (relatedObjectSelect && alert.related_id) {
      relatedObjectSelect.value = alert.related_id;
      // נבחר אובייקט
    }
  }, 100);

  // בחירת סוג הקשר
  const relationType = alert.related_type_id;
  const radioButton = document.querySelector(`input[name="editAlertRelationType"][value="${relationType}"]`);
  if (radioButton) {
    radioButton.checked = true;
    // הפעלת אירוע change לטעינת האובייקטים
    radioButton.dispatchEvent(new Event('change'));
  }

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
        keyboard: false
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
    console.error('Edit modal element not found');
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

  if (!stateSelect || !statusHidden || !triggeredHidden) return;

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
  const form = document.getElementById('editAlertForm');
  if (!form) {
    console.error('Form element not found');
    return;
  }

  // בדיקת סוג ההתראה
  const alertTypeElement = document.getElementById('editAlertType');
  const alertType = alertTypeElement.value;
  if (!checkAlertType(alertType, alertTypeElement)) {
    return; // עצירת העדכון אם הסוג לא נתמך
  }

  // עדכון status ו-is_triggered לפי המצב הנבחר
  updateStatusAndTriggered();

  // בדיקת תקינות הקשר בין status ו-is_triggered
  const status = document.getElementById('editAlertStatus').value;
  const isTriggered = document.getElementById('editAlertIsTriggered').value;

  if (!validateAlertStatusCombination(status, isTriggered)) {
    showErrorNotification('שילוב לא תקין', 'שילוב לא תקין בין סטטוס ומצב הפעלה. ראה את הכללים במערכת ההתראות.');
    return;
  }

  // בדיקת בחירת אובייקט
  const relatedTypeId = parseInt(document.querySelector('input[name="editAlertRelationType"]:checked')?.value);
  const relatedId = parseInt(document.getElementById('editAlertRelatedObjectSelect').value);

  if (!relatedTypeId || isNaN(relatedTypeId)) {
    showErrorNotification('סוג אובייקט חסר', 'נא לבחור סוג אובייקט לשיוך (חשבון, טרייד, תכנון או טיקר)');
    return;
  }

  if (!relatedId || isNaN(relatedId)) {
    showErrorNotification('אובייקט חסר', 'נא לבחור אובייקט ספציפי לשיוך מהרשימה');
    return;
  }

  // בדיקת תנאי התראה
  const conditionAttributeElement = document.getElementById('editConditionAttribute');
  const conditionOperatorElement = document.getElementById('editConditionOperator');
  const conditionNumberElement = document.getElementById('editConditionNumber');

  const conditionAttribute = conditionAttributeElement.value;
  const conditionOperator = conditionOperatorElement.value;
  const conditionNumber = conditionNumberElement.value;

  if (!conditionAttribute || !conditionOperator || !conditionNumber) {
    showErrorNotification('תנאי התראה חסר', 'יש למלא את כל שדות התנאי');
    return;
  }

  // וולידציה של ערך מספרי
  const numericValue = parseFloat(conditionNumber);
  if (isNaN(numericValue)) {
    showErrorNotification('ערך לא תקין', 'הערך חייב להיות מספר');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של ערך חיובי למחיר
  if (conditionAttribute === 'price' && numericValue <= 0) {
    showErrorNotification('ערך מחיר לא תקין', 'מחיר חייב להיות גדול מ-0');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של ערך מקסימלי למחיר
  if (conditionAttribute === 'price' && numericValue > 1000000) {
    showErrorNotification('ערך מחיר גבוה מדי', 'מחיר לא יכול להיות גדול מ-1,000,000');
    conditionNumberElement.focus();
    return;
  }

  // וולידציה של אחוזים (לשינוי)
  if (conditionAttribute === 'change' && (numericValue < -100 || numericValue > 100)) {
    showErrorNotification('ערך אחוז לא תקין', 'אחוז שינוי חייב להיות בין -100% ל-100%');
    conditionNumberElement.focus();
    return;
  }

  const alertId = document.getElementById('editAlertId').value;
  const alertData = {
    related_type_id: relatedTypeId,
    related_id: relatedId,
    type: alertType,
    condition_attribute: conditionAttribute,
    condition_operator: conditionOperator,
    condition_number: conditionNumber,
    message: document.getElementById('editAlertMessage').value || null,
    status: document.getElementById('editAlertStatus').value,
    is_triggered: document.getElementById('editAlertIsTriggered').value
  };

  // מעדכן התראה
  console.log('🔍 בדיקת נתונים לפני שליחה:');
  console.log('- related_type_id:', relatedTypeId, '(valid:', !isNaN(relatedTypeId), ')');
  console.log('- related_id:', relatedId, '(valid:', !isNaN(relatedId), ')');
  console.log('- status:', alertData.status);
  console.log('- is_triggered:', alertData.is_triggered);

  try {
    const response = await fetch(`/api/v1/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData)
    });

    if (response.ok) {
      const updatedAlert = await response.json();
      // התראה עודכנה בהצלחה

      // סגירת המודל
      closeModal('editAlertModal');

      // רענון הנתונים
      loadAlertsData();

      // הצגת הודעה
      showSuccessNotification('התראה עודכנה', 'התראה עודכנה בהצלחה!');
    } else {
      throw new Error(`שגיאה בעדכון התראה: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון התראה:', error);
    showErrorNotification('שגיאה בעדכון התראה', 'שגיאה בעדכון התראה: ' + error.message);
  }
}

/**
 * מחיקת התראה
 */
async function deleteAlert(alertId) {
  if (!confirm('האם אתה בטוח שברצונך למחוק התראה זו?')) {
    return;
  }

  try {
    // מוחק התראה

    const response = await fetch(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      // התראה נמחקה בהצלחה

      // רענון הנתונים
      loadAlertsData();

      // הצגת הודעה
      showSuccessNotification('התראה נמחקה', 'התראה נמחקה בהצלחה!');
    } else {
      // ניסיון לקרוא את פרטי השגיאה
      let errorMessage = `שגיאה במחיקת התראה: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // לא ניתן לקרוא פרטי שגיאה מהשרת
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('שגיאה במחיקת התראה:', error);
    showErrorNotification('שגיאה במחיקת התראה', 'שגיאה במחיקת התראה: ' + error.message);
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
function sortTable(columnIndex) {
  console.log(`🔄 sortTable נקראה עבור עמודה ${columnIndex} - התראות`);

  // שימוש בפונקציה הגלובלית החדשה
  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.filteredAlertsData || alertsData,
      'alerts',
      updateAlertsTable
    );
  } else {
    console.error('❌ sortTableData function not found in tables.js');
  }
}

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
 * קבלת מחלקת CSS לסוג התראה
 * 
 * פונקציה זו מחזירה את שם המחלקה CSS המתאימה לסוג ההתראה
 * משמשת לעיצוב התאים בטבלה
 * 
 * @param {string} type - סוג ההתראה
 * @returns {string} שם המחלקה CSS
 */
function getTypeClass(type) {
  switch (type) {
    case 'price_alert': return 'type-ticker';
    case 'stop_loss': return 'type-trade-open';
    case 'volume_alert': return 'type-other';
    case 'custom_alert': return 'type-other';
    default: return 'type-other';
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
function getRelatedClass(relatedType) {
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
    console.error('restoreAllSectionStates function not found in main.js');
  }
}

// הגנה - וידוא שהפונקציות הגלובליות זמינות
if (typeof window.toggleTopSection !== 'function') {
  window.toggleTopSection = function () {
    console.warn('toggleTopSection fallback called - main.js may not be loaded properly');
  };
}

if (typeof window.toggleMainSection !== 'function') {
  window.toggleMainSection = function () {
    const contentSections = document.querySelectorAll('.content-section');
    const alertsSection = contentSections[0]; // הסקשן הראשון - התראות

    if (!alertsSection) {
      console.error('❌ לא נמצא סקשן התראות');
      return;
    }

    const sectionBody = alertsSection.querySelector('.section-body');
    const toggleBtn = alertsSection.querySelector('button[onclick="toggleMainSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody) {
      const isCollapsed = sectionBody.style.display === 'none';

      if (isCollapsed) {
        sectionBody.style.display = 'block';
      } else {
        sectionBody.style.display = 'none';
      }

      // עדכון האייקון
      if (icon) {
        icon.textContent = isCollapsed ? '▲' : '▼';
      }

      // שמירת המצב ב-localStorage
      localStorage.setItem('alertsSectionCollapsed', !isCollapsed);
    }
  };
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {

  // שחזור מצב הסקשנים
  restoreAlertsSectionState();

  // אתחול פילטרים
  if (typeof window.initializePageFilters === 'function') {
    window.initializePageFilters('alerts');
  }

  // טעינת נתונים
  loadAlertsData();

  // טעינת מצב המיון
  if (typeof window.loadSortState === 'function') {
    window.loadSortState('alerts');
  }
});

// פונקציה לעדכון הטבלה מפילטרים
if (window.location.pathname.includes('/alerts')) {
  window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    // שמירת הפילטרים
    window.selectedStatusesForFilter = selectedStatuses || [];
    window.selectedTypesForFilter = selectedTypes || [];
    window.selectedDateRangeForFilter = selectedDateRange || null;
    window.searchTermForFilter = searchTerm || '';

    // טעינת נתונים מחדש עם הפילטרים החדשים
    if (typeof window.loadAlertsData === 'function') {
      window.loadAlertsData();
    } else {
      console.error('❌ loadAlertsData function not found');
    }
  };
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-header-system.js

// הוספת הפונקציות לגלובל
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.filterAlertsLocally = filterAlertsLocally;
window.showAddAlertModal = showAddAlertModal;
window.editAlert = editAlert;
window.deleteAlert = deleteAlert;
window.saveAlert = saveAlert;
window.updateAlert = updateAlert;
window.updateStatusAndTriggered = updateStatusAndTriggered;
window.getAlertState = getAlertState;
window.validateAlertStatusCombination = validateAlertStatusCombination;
window.sortTable = sortTable;
window.checkAlertType = checkAlertType;
window.onAlertTypeChange = onAlertTypeChange;
window.checkAlertVariable = checkAlertVariable;
window.checkAlertOperator = checkAlertOperator;
window.buildAlertCondition = buildAlertCondition;
window.parseAlertCondition = parseAlertCondition;

// פונקציה לטעינת התראות (alias ל-loadAlertsData)
function loadAlerts() {
  return loadAlertsData();
}

// חשיפת פונקציית loadAlerts
window.loadAlerts = loadAlerts;
// updateGridFromComponentGlobal הועבר ל-header-system.js

// פונקציות התראה מיובאות מ-main.js - אין צורך בייצוא כפול

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  // Clearing console messages
  if (console.clear) {
    console.clear();
  }
}, 18000);

// ========================================
// פונקציות לתרגום תנאי התראות
// ========================================

/**
 * פונקציה לתרגום תנאי התראה לעברית
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {string} - התנאי מתורגם לעברית
 */
window.formatAlertCondition = function (condition) {
  if (!condition) return '-';

  // Use the new global translation function
  if (window.translateLegacyCondition) {
    return window.translateLegacyCondition(condition);
  }

  // Fallback to old format if new function not available
  const parts = condition.split(' | ');
  if (parts.length >= 3) {
    const variable = parts[0] || '';
    const operator = parts[1] || '';
    const value = parts[2] || '';

    // המרת משתנה לעברית
    const variableLabels = {
      'price': 'מחיר',
      'change': 'שינוי',
      'ma': 'ממוצע נע',
      'volume': 'נפח מסחר'
    };

    // המרת אופרטור לעברית עם סימנים חשבונאיים
    const operatorLabels = {
      'lessThen': '<',
      'moreThen': '>',
      'cross': '=',
      'crossUp': '↗',
      'crossDown': '↘',
      'upBy': '+',
      'downBy': '-',
      'changeBy': '±',
      'upByPre': '+%',
      'downByPre': '-%',
      'changeByPre': '±%'
    };

    const variableDisplay = variableLabels[variable] || variable;
    const operatorDisplay = operatorLabels[operator] || operator;

    if (operator && value) {
      // פורמט מיוחד לאופרטורים חשבונאיים
      if (['upBy', 'downBy', 'changeBy', 'upByPre', 'downByPre', 'changeByPre'].includes(operator)) {
        return `${variableDisplay} ${operatorDisplay}${value}`;
      } else {
        return `${variableDisplay} ${operatorDisplay} ${value}`;
      }
    } else if (variable) {
      return variable;
    } else {
      return condition;
    }
  }

  return condition;
};

/**
 * פונקציה לפרסור תנאי התראה
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {object} - אובייקט עם המשתנה, האופרטור והערך
 */
window.parseAlertCondition = function (condition) {
  if (!condition) return { variable: '', operator: '', value: '' };

  const parts = condition.split(' | ');
  if (parts.length >= 3) {
    return {
      variable: parts[0] || '',
      operator: parts[1] || '',
      value: parts[2] || ''
    };
  } else if (parts.length === 2) {
    return {
      variable: parts[0] || '',
      operator: parts[1] || '',
      value: ''
    };
  } else if (parts.length === 1) {
    return {
      variable: parts[0] || '',
      operator: '',
      value: ''
    };
  }

  return { variable: '', operator: '', value: '' };
};


