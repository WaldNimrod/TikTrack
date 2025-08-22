/**
 * ========================================
 * דף ההתראות - Alerts Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההתראות (alerts.html)
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
    console.log('🔄 טוען התראות מהשרת...');
    const response = await fetch('/api/v1/alerts/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const alerts = data.data || data;
    console.log(`✅ נטענו ${alerts.length} התראות`);

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
    updateAlertsTable(alertsData);

    return alertsData;

  } catch (error) {
    console.error('Error loading alerts data:', error);
    console.log('⚠️ משתמש בנתוני דמו');

    // שימוש בנתוני דמו
    alertsData = demoAlerts;
    updateAlertsTable(alertsData);

    return alertsData;
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
function updateAlertsTable(alerts) {
  console.log('🔄 === UPDATE ALERTS TABLE ===');
  console.log('🔄 Alerts to display:', alerts.length);

  const tbody = document.querySelector('#alertsTable tbody');
  if (!tbody) {
    console.log('📋 No alerts table found on this page - skipping table update');
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
      console.log('🔄 === LOADING ADDITIONAL DATA ===');
      console.log('🔄 טוען נתונים נוספים...');
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

      console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
      console.log('🔄 === ADDITIONAL DATA LOADED ===');
    } catch (error) {
      console.warn('⚠️ שגיאה בטעינת נתונים נוספים:', error);
      // המשך עם מערכים ריקים
      accounts = [];
      trades = [];
      tradePlans = [];
      tickers = [];
      console.log('🔄 === USING EMPTY ARRAYS ===');
    }
  };

  // טעינת נתונים ועדכון הטבלה
  loadAdditionalData().then(() => {
    console.log('🔄 === STARTING TABLE UPDATE ===');
    console.log('🔄 Processing alerts:', alerts.length);
    console.log('🔄 Available data:', {
      accounts: accounts.length,
      trades: trades.length,
      tradePlans: tradePlans.length,
      tickers: tickers.length
    });

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
            console.log(`🔍 Available trades:`, trades.map(t => ({ id: t.id, created_at: t.created_at, date: t.date })));
            const trade = trades.find(t => t.id === alert.related_id);
            if (trade) {
              const date = trade.created_at || trade.date;
              const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
              relatedDisplay = `טרייד ${alert.related_id} - ${formattedDate}`;
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
            console.log(`🔍 Available trade plans:`, tradePlans.map(p => ({ id: p.id, created_at: p.created_at, date: p.date })));
            const plan = tradePlans.find(p => p.id === alert.related_id);
            if (plan) {
              const date = plan.created_at || plan.date;
              const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
              relatedDisplay = `תוכנית ${alert.related_id} - ${formattedDate}`;
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

      // הוספת הסוג לפני האובייקט
      const typeLabels = {
        1: '🏦 ',
        2: '📈 ',
        3: '📋 ',
        4: '📊 '
      };

      const typeLabel = typeLabels[alert.related_type_id] || '❓ ';
      relatedDisplay = typeLabel + relatedDisplay;

      const createdAt = alert.created_at ? new Date(alert.created_at).toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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
        <tr>
          <td><span class="symbol-text">${symbolDisplay}</span></td>
          <td style="padding: 0;">
            <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right; min-width: 150px;">
              ${relatedDisplay}
            </div>
          </td>
          <td data-status="${statusDisplay}"><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
          <td><span class="triggered-badge ${triggeredClass}">${triggeredDisplay}</span></td>
          <td data-type="${typeDisplay}"><span class="type-badge ${typeClass}">${typeDisplay}</span></td>
          <td><span class="condition-text">${alert.condition || '-'}</span></td>
          <td><span class="message-text">${alert.message || '-'}</span></td>
          <td data-date="${alert.created_at}"><span class="date-text">${createdAt}</span></td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">
              ✏️
            </button>
            ${alert.status === 'open' ? `
            <button class="btn btn-sm btn-warning" onclick="cancelAlert(${alert.id})" title="בטל">
              ⏹️
            </button>
            ` : ''}
            <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');

    console.log('🔄 === FINISHED PROCESSING ALERTS ===');
    console.log('🔄 Generated HTML length:', tableHTML.length);

    tbody.innerHTML = tableHTML;

    // עדכון ספירת רשומות
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${alerts.length} התראות`;
    }

    // עדכון סטטיסטיקות
    updatePageSummaryStats();

    console.log('🔄 === TABLE UPDATE COMPLETED ===');
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

  // בדיקת ערכים נוכחיים והצגת הודעות מתאימות
  setTimeout(() => {
    console.log('🔍 === CHECKING VALUES IN SHOW ADD ALERT MODAL ===');
    const variableElement = document.getElementById('alertVariable');
    const operatorElement = document.getElementById('alertOperator');

    console.log('🔍 Variable element:', variableElement);
    console.log('🔍 Operator element:', operatorElement);

    if (variableElement && !checkAlertVariable(variableElement)) {
      console.log('❌ Variable check failed');
      // הפונקציה תציג הודעת שגיאה ותאפס את השדה
    }

    if (operatorElement && !checkAlertOperator(operatorElement)) {
      console.log('❌ Operator check failed');
      // הפונקציה תציג הודעת שגיאה ותאפס את השדה
    }
  }, 100);

  // הצגת המודל
  const modalElement = document.getElementById('addAlertModal');
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
    console.error('Modal element not found');
  }
}

/**
 * טעינת נתונים למודלים
 */
async function loadModalData() {
  try {
    console.log('🔄 טוען נתונים למודל...');

    // טעינת נתונים במקביל
    const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/trades').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/tickers').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    const accounts = accountsResponse.data || accountsResponse || [];
    const trades = tradesResponse.data || tradesResponse || [];
    const tradePlans = tradePlansResponse.data || tradePlansResponse || [];
    const tickers = tickersResponse.data || tickersResponse || [];

    console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);

    // עדכון רדיו באטונים
    updateRadioButtons(accounts, trades, tradePlans, tickers);
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
  const select = document.getElementById(selectId);
  if (!select) return;

  console.log(`🔄 מילוי ${selectId} עם ${data.length} פריטים מסוג ${prefix}`);
  if (data.length > 0) {
    console.log('📋 דוגמה לפריט ראשון:', data[0]);
  }

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

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
      // עבור טרייד: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else if (prefix === 'תכנון') {
      // עבור תכנון: סימבול + תאריך
      const symbol = item.symbol || item.ticker_symbol || item.ticker?.symbol || 'לא מוגדר';
      const date = item.created_at || item.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
      displayText = `${symbol} - ${formattedDate}`;
    } else {
      // עבור טיקר: רק סימבול
      displayText = item[field] || item.symbol || 'לא מוגדר';
    }

    option.textContent = displayText;
    select.appendChild(option);
  });
}

/**
 * סגירת מודל
 */
function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    // בדיקה אם Bootstrap זמין
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    } else {
      // אם Bootstrap לא זמין, נסגור את המודל באופן ידני
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      document.body.classList.remove('modal-open');

      // הסרת backdrop
      const backdrop = document.getElementById('modalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}

/**
 * בדיקת סוג התראה בזמן אמת
 */
function onAlertTypeChange(selectElement) {
  const selectedType = selectElement.value;
  if (selectedType && !checkAlertType(selectedType, selectElement)) {
    // החזרת הבחירה הקודמת
    selectElement.value = '';
  }
}

/**
 * בדיקת סוג התראה והצגת התראה לסוגים לא נתמכים
 * @param {string} alertType - סוג ההתראה
 * @param {HTMLElement} element - אלמנט הבחירה (אופציונלי)
 * @returns {boolean} true אם נתמך, false אם לא
 */
function checkAlertType(alertType, element = null) {
  const unsupportedTypes = ['volume_alert', 'custom_alert'];

  if (unsupportedTypes.includes(alertType)) {
    let message = '';
    if (alertType === 'volume_alert') {
      message = 'התראה על נפח מסחר עדיין בפיתוח. כרגע נתמכים רק התראות על מחיר וסטופ לוס.';
    } else if (alertType === 'custom_alert') {
      message = 'התראה מותאמת אישית עדיין בפיתוח. כרגע נתמכים רק התראות על מחיר וסטופ לוס.';
    } else {
      message = 'סוג התראה זה עדיין בפיתוח. כרגע נתמכים רק התראות על מחיר וסטופ לוס.';
    }

    // בדיקה אם אנחנו בתוך מודול
    if (element) {
      const modal = element.closest('.modal');
      if (modal && modal.id) {
        showModalWarningNotification(modal.id, 'פיצ\'ר בפיתוח', message);
      } else {
        showWarningNotification('פיצ\'ר בפיתוח', message);
      }
    } else {
      showWarningNotification('פיצ\'ר בפיתוח', message);
    }

    return false;
  }

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

  const supportedVariables = ['price'];
  const selectedValue = selectElement.value;

  if (!supportedVariables.includes(selectedValue)) {
    console.log('❌ Variable not supported:', selectedValue);
    let message = '';
    if (selectedValue === 'daily_change') {
      message = 'שינוי יומי עדיין בפיתוח. כרגע נתמך רק "מחיר".';
    } else if (selectedValue === 'moving_average') {
      message = 'ממוצע נע עדיין בפיתוח. כרגע נתמך רק "מחיר".';
    } else if (selectedValue === 'volume') {
      message = 'נפח מסחר עדיין בפיתוח. כרגע נתמך רק "מחיר".';
    } else {
      message = 'משתנה זה עדיין בפיתוח. כרגע נתמך רק "מחיר".';
    }
    console.log('🔍 Showing warning notification:', message);

    // בדיקה אם אנחנו בתוך מודול
    const modal = selectElement.closest('.modal');
    if (modal && modal.id) {
      showModalWarningNotification(modal.id, 'פיצ\'ר בפיתוח', message);
    } else {
      showWarningNotification('פיצ\'ר בפיתוח', message);
    }

    // החזרת הבחירה למחיר
    selectElement.value = 'price';
    console.log('🔍 Reset value to:', selectElement.value);
    return false;
  }

  console.log('✅ Variable supported:', selectedValue);
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

  const supportedOperators = ['greater_than', 'less_than'];
  const selectedValue = selectElement.value;

  if (!supportedOperators.includes(selectedValue)) {
    console.log('❌ Operator not supported:', selectedValue);
    let message = '';
    if (selectedValue === 'crosses') {
      message = 'אופרטור "חוצה" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'crosses_up') {
      message = 'אופרטור "חוצה למעלה" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'crosses_down') {
      message = 'אופרטור "חוצה למטה" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'increases_by') {
      message = 'אופרטור "עולה ב" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'decreases_by') {
      message = 'אופרטור "יורד ב" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'increases_by_percent') {
      message = 'אופרטור "עולה ב%" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else if (selectedValue === 'decreases_by_percent') {
      message = 'אופרטור "יורד ב%" עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    } else {
      message = 'אופרטור זה עדיין בפיתוח. כרגע נתמכים רק "גדול מ" ו"קטן מ".';
    }
    console.log('🔍 Showing warning notification:', message);
    showWarningNotification('פיצ\'ר בפיתוח', message);
    // החזרת הבחירה לגדול מ
    selectElement.value = 'greater_than';
    console.log('🔍 Reset value to:', selectElement.value);
    return false;
  }

  console.log('✅ Operator supported:', selectedValue);
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
  return `${variable}|${operator}|${value}`;
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
  if (!condition || !condition.includes('|')) {
    return { variable: 'price', operator: 'greater_than', value: '' };
  }

  const parts = condition.split('|');
  return {
    variable: parts[0] || 'price',
    operator: parts[1] || 'greater_than',
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
  if (!checkAlertType(alertType, alertTypeElement)) {
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

  // בדיקת תנאי התראה
  const variableElement = document.getElementById('alertVariable');
  const operatorElement = document.getElementById('alertOperator');
  const valueElement = document.getElementById('alertValue');

  const variable = variableElement.value;
  const operator = operatorElement.value;
  const value = valueElement.value;

  if (!relatedType || !relatedId) {
    showErrorNotification('שדות חובה חסרים', 'יש למלא את כל השדות החובה');
    return;
  }

  // בדיקת משתנה ואופרטור נתמכים
  if (!checkAlertVariable(variableElement)) {
    return; // הפונקציה תציג הודעת שגיאה ותאפס את השדה
  }

  if (!checkAlertOperator(operatorElement)) {
    return; // הפונקציה תציג הודעת שגיאה ותאפס את השדה
  }

  if (!variable || !operator) {
    showErrorNotification('תנאי התראה חסר', 'יש לבחור משתנה ואופרטור');
    return;
  }

  // בניית מחרוזת התנאי
  const condition = buildAlertCondition(variable, operator, value);

  // המשך הקוד הקיים...
  const alertData = {
    related_type_id: parseInt(formData.get('alertRelationType')),
    related_id: parseInt(document.getElementById('alertRelatedObjectSelect').value),
    type: alertType,
    condition: condition,
    message: document.getElementById('alertMessage').value || null,
    status: 'open',
    is_triggered: 'false'
  };

  console.log('שולח התראה חדשה:', alertData);

  try {
    const response = await fetch('/api/v1/alerts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData)
    });

    if (response.ok) {
      const newAlert = await response.json();
      console.log('התראה נשמרה בהצלחה:', newAlert);

      // סגירת המודל
      closeModal('addAlertModal');

      // רענון הנתונים
      loadAlertsData();

      // הצגת הודעה
      showSuccessNotification('התראה נשמרה', 'התראה נשמרה בהצלחה!');
    } else {
      throw new Error(`שגיאה בשמירת התראה: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בשמירת התראה:', error);
    showErrorNotification('שגיאה בשמירת התראה', 'שגיאה בשמירת התראה: ' + error.message);
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
  const conditionParts = parseAlertCondition(alert.condition || '');
  const editAlertVariable = document.getElementById('editAlertVariable');
  const editAlertOperator = document.getElementById('editAlertOperator');
  const editAlertValue = document.getElementById('editAlertValue');
  const editAlertCondition = document.getElementById('editAlertCondition');

  if (editAlertVariable) editAlertVariable.value = conditionParts.variable;
  if (editAlertOperator) editAlertOperator.value = conditionParts.operator;
  if (editAlertValue) editAlertValue.value = conditionParts.value;
  if (editAlertCondition) editAlertCondition.value = alert.condition || '';

  // בדיקת ערכים נוכחיים והצגת הודעות מתאימות
  setTimeout(() => {
    if (editAlertVariable && !checkAlertVariable(editAlertVariable)) {
      // הפונקציה תציג הודעת שגיאה ותאפס את השדה
    }

    if (editAlertOperator && !checkAlertOperator(editAlertOperator)) {
      // הפונקציה תציג הודעת שגיאה ותאפס את השדה
    }
  }, 100);

  // קביעת המצב הנכון לפי status ו-is_triggered
  const currentState = getAlertState(alert.status, alert.is_triggered);
  if (editAlertState) editAlertState.value = currentState;

  // בחירת האובייקט המקושר
  setTimeout(() => {
    const relatedObjectSelect = document.getElementById('editAlertRelatedObjectSelect');
    if (relatedObjectSelect && alert.related_id) {
      relatedObjectSelect.value = alert.related_id;
      console.log('✅ נבחר אובייקט:', alert.related_id, 'בסוג:', alert.related_type_id);
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
  const variableElement = document.getElementById('editAlertVariable');
  const operatorElement = document.getElementById('editAlertOperator');
  const valueElement = document.getElementById('editAlertValue');

  const variable = variableElement.value;
  const operator = operatorElement.value;
  const value = valueElement.value;

  // בדיקת משתנה ואופרטור נתמכים
  if (!checkAlertVariable(variableElement)) {
    return; // הפונקציה תציג הודעת שגיאה ותאפס את השדה
  }

  if (!checkAlertOperator(operatorElement)) {
    return; // הפונקציה תציג הודעת שגיאה ותאפס את השדה
  }

  if (!variable || !operator) {
    showErrorNotification('תנאי התראה חסר', 'יש לבחור משתנה ואופרטור');
    return;
  }

  // בניית מחרוזת התנאי
  const condition = buildAlertCondition(variable, operator, value);

  const alertId = document.getElementById('editAlertId').value;
  const alertData = {
    related_type_id: relatedTypeId,
    related_id: relatedId,
    type: alertType,
    condition: condition,
    message: document.getElementById('editAlertMessage').value || null,
    status: document.getElementById('editAlertStatus').value,
    is_triggered: document.getElementById('editAlertIsTriggered').value
  };

  console.log('מעדכן התראה:', alertId, alertData);
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
      console.log('התראה עודכנה בהצלחה:', updatedAlert);

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
    console.log('מוחק התראה:', alertId);

    const response = await fetch(`/api/v1/alerts/${alertId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('התראה נמחקה בהצלחה');

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
        console.log('לא ניתן לקרוא פרטי שגיאה מהשרת');
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('שגיאה במחיקת התראה:', error);
    showErrorNotification('שגיאה במחיקת התראה', 'שגיאה במחיקת התראה: ' + error.message);
  }
}

/**
 * פונקציה לסידור הטבלה
 * 
 * פונקציה זו משתמשת במערכת הסידור הגלובלית מ-main.js
 * כדי לסדר את טבלת ההתראות לפי העמודה הנבחרת.
 * 
 * הפונקציה:
 * - משתמשת ב-sortTableData הגלובלית
 * - מעדכנת את הנתונים המסוננים
 * - שומרת את מצב הסידור ב-localStorage
 * 
 * @param {number} columnIndex - אינדקס העמודה לסידור (0-7)
 * 
 * @example
 * sortTable(0); // סידור לפי עמודת סימבול
 * sortTable(1); // סידור לפי עמודת אובייקט משיוך
 * sortTable(7); // סידור לפי עמודת תאריך יצירה
 * 
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 * @requires window.filteredAlertsData - נתונים מסוננים
 * @requires alertsData - נתונים מקוריים
 * @requires updateAlertsTable - פונקציה לעדכון הטבלה
 * 
 * @since 2.0
 */
function sortTable(columnIndex) {
  console.log(`🔄 מיון טבלת התראות לפי עמודה ${columnIndex}`);

  // שימוש בפונקציה הגלובלית
  if (typeof window.sortTableData === 'function') {
    const sortedData = window.sortTableData(
      columnIndex,
      window.filteredAlertsData || alertsData,
      'alerts',
      updateAlertsTable
    );

    // עדכון הנתונים המסוננים
    window.filteredAlertsData = sortedData;
  } else {
    console.error('❌ sortTableData function not found in main.js');
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
    default: return 'status-inactive';
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
    console.log('🔄 toggleMainSection fallback נקראה');
    const contentSections = document.querySelectorAll('.content-section');
    console.log('📋 מספר content-sections נמצא:', contentSections.length);
    const alertsSection = contentSections[0]; // הסקשן הראשון - התראות

    if (!alertsSection) {
      console.error('❌ לא נמצא סקשן התראות');
      return;
    }
    console.log('✅ סקשן התראות נמצא:', alertsSection);

    const sectionBody = alertsSection.querySelector('.section-body');
    const toggleBtn = alertsSection.querySelector('button[onclick="toggleMainSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    console.log('🎯 sectionBody נמצא:', !!sectionBody);
    console.log('🔘 toggleBtn נמצא:', !!toggleBtn);
    console.log('🎨 icon נמצא:', !!icon);

    if (sectionBody) {
      const isCollapsed = sectionBody.style.display === 'none';
      console.log('📊 מצב נוכחי - isCollapsed:', isCollapsed);

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
  console.log('🔄 === DOM CONTENT LOADED (ALERTS) ===');

  // בדיקת זמינות פונקציות גלובליות
  console.log('🔍 Checking global functions:', {
    toggleTopSection: typeof window.toggleTopSection,
    toggleMainSection: typeof window.toggleMainSection,
    restoreAllSectionStates: typeof window.restoreAllSectionStates
  });

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
    console.log('🔄 === UPDATE GRID FROM COMPONENT (alerts) ===');
    console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

    // קריאה לפונקציה הגלובלית
    if (typeof window.updateGridFromComponentGlobal === 'function') {
      window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'alerts');
    } else {
      console.log('🔄 updateGridFromComponentGlobal not available, using local filtering...');

      // טיפול מקומי בפילטרים אם הפונקציה הגלובלית לא זמינה
      if (alertsData && typeof window.filterDataByFilters === 'function') {
        const filteredData = window.filterDataByFilters(alertsData, 'alerts');
        if (typeof window.updateAlertsTable === 'function') {
          window.updateAlertsTable(filteredData);
        }
      } else {
        console.error('❌ Local filtering not available either');
      }
    }
  };
}

// פונקציה גלובלית לעדכון הטבלה - הועברה ל-app-header.js

// הוספת הפונקציות לגלובל
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
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
// updateGridFromComponentGlobal הועבר ל-app-header.js

// פונקציות התראה מיובאות מ-main.js - אין צורך בייצוא כפול

// ניקוי הודעות קונסולה אחרי זמן קצר
setTimeout(() => {
  console.log('🧹 Clearing console messages to reduce clutter...');
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

  const parts = condition.split('|');
  if (parts.length >= 3) {
    const variable = parts[0] || '';
    const operator = parts[1] || '';
    const value = parts[2] || '';

    // המרת משתנה לעברית
    const variableLabels = {
      'price': 'מחיר',
      'daily_change': 'שינוי יומי',
      'moving_average': 'ממוצע נע',
      'volume': 'נפח מסחר'
    };

    // המרת אופרטור לעברית
    const operatorLabels = {
      'greater_than': '>',
      'less_than': '<',
      'crosses': 'חוצה',
      'crosses_up': 'חוצה למעלה',
      'crosses_down': 'חוצה למטה',
      'increases_by': 'עולה ב',
      'decreases_by': 'יורד ב',
      'increases_by_percent': 'עולה ב%',
      'decreases_by_percent': 'יורד ב%'
    };

    const variableDisplay = variableLabels[variable] || variable;
    const operatorDisplay = operatorLabels[operator] || operator;

    if (operator && value) {
      return `${variableDisplay} ${operatorDisplay} ${value}`;
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

  const parts = condition.split('|');
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


