/**
 * ========================================
 * דף ההתראות - Alerts Page
 * ========================================
 * 
 * קובץ ייעודי לדף ההתראות (alerts.html)
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
 * טעינת נתוני התראות
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
 */
function updateAlertsTable(alerts) {
  console.log('🔄 === UPDATE ALERTS TABLE ===');
  console.log('🔄 Alerts to display:', alerts.length);

  const tbody = document.querySelector('#alertsTable tbody');
  if (!tbody) {
    console.error('Table body not found');
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
      console.log('🔄 טוען נתונים נוספים...');
      const [accountsResponse, tradesResponse, tradePlansResponse, tickersResponse] = await Promise.all([
        fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/trades').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/tickers').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      accounts = accountsResponse.data || accountsResponse || [];
      trades = tradesResponse.data || tradesResponse || [];
      tradePlans = tradePlansResponse.data || tradePlansResponse || [];
      tickers = tickersResponse.data || tickersResponse || [];

      console.log(`✅ נטענו ${accounts.length} חשבונות, ${trades.length} טריידים, ${tradePlans.length} תוכניות, ${tickers.length} טיקרים`);
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

      switch (alert.related_type_id) {
        case 1: // חשבון
          const account = accounts.find(a => a.id === alert.related_id);
          relatedDisplay = account ? account.name : `חשבון ${alert.related_id}`;
          relatedIcon = '🏦';
          relatedClass = 'related-account';
          break;
        case 2: // טרייד
          const trade = trades.find(t => t.id === alert.related_id);
          relatedDisplay = trade ? trade.symbol : `טרייד ${alert.related_id}`;
          relatedIcon = '📈';
          relatedClass = 'related-trade';
          break;
        case 3: // תוכנית
          const plan = tradePlans.find(p => p.id === alert.related_id);
          relatedDisplay = plan ? plan.symbol : `תוכנית ${alert.related_id}`;
          relatedIcon = '📋';
          relatedClass = 'related-plan';
          break;
        case 4: // טיקר
          const ticker = tickers.find(t => t.id === alert.related_id);
          relatedDisplay = ticker ? ticker.symbol : `טיקר ${alert.related_id}`;
          relatedIcon = '📊';
          relatedClass = 'related-ticker';
          break;
        default:
          relatedDisplay = `אובייקט ${alert.related_id}`;
          relatedIcon = '❓';
          relatedClass = 'related-other';
      }

      // קביעת הסימבול לטור הראשון
      let symbolDisplay = '';
      if (alert.related_type_id == 1) { // חשבון - ריק
        symbolDisplay = '';
      } else if (alert.related_type_id == 2) { // טרייד
        const trade = trades.find(t => t.id == alert.related_id);
        if (trade && trade.ticker_id) {
          const ticker = tickers.find(tick => tick.id == trade.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : trade.ticker_id;
        } else {
          symbolDisplay = `${alert.related_id}`;
        }
      } else if (alert.related_type_id == 3) { // תוכנית
        const plan = tradePlans.find(p => p.id == alert.related_id);
        if (plan && plan.ticker_id) {
          const ticker = tickers.find(tick => tick.id == plan.ticker_id);
          symbolDisplay = ticker ? ticker.symbol : plan.ticker_id;
        } else {
          symbolDisplay = `${alert.related_id}`;
        }
      } else if (alert.related_type_id == 4) { // טיקר
        const ticker = tickers.find(tick => tick.id == alert.related_id);
        symbolDisplay = ticker ? ticker.symbol : alert.related_id;
      } else {
        symbolDisplay = `אובייקט ${alert.related_id}`;
      }

      // הוספת הסוג לפני האובייקט
      const typeLabels = {
        1: 'חשבון: ',
        2: 'טרייד: ',
        3: 'תוכנית: ',
        4: 'טיקר: '
      };

      const typeLabel = typeLabels[alert.related_type_id] || 'אובייקט: ';
      relatedDisplay = typeLabel + relatedDisplay;

      const createdAt = alert.created_at ? new Date(alert.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

      // המרת סטטוס לעברית להצגה
      let statusDisplay;
      switch (alert.status) {
        case 'open': statusDisplay = 'פתוח'; break;
        case 'closed': statusDisplay = 'סגור'; break;
        case 'cancelled': statusDisplay = 'מבוטל'; break;
        default: statusDisplay = alert.status;
      }

      // המרת מצב לעברית להצגה
      let stateDisplay;
      switch (alert.is_triggered) {
        case 'new': stateDisplay = 'לא נקרא'; break;
        case true: stateDisplay = 'נקרא'; break;
        case false: stateDisplay = 'מאזין'; break;
        default: stateDisplay = 'לא מוגדר';
      }

      return `
        <tr>
          <td><strong>${symbolDisplay}</strong></td>
          <td style="padding: 0;">
            <div class="related-object-cell ${relatedClass}" style="justify-content: flex-start; text-align: right;">
              ${relatedDisplay}
            </div>
          </td>
          <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
          <td><span class="state-badge">${stateDisplay}</span></td>
          <td><span class="type-badge ${typeClass}">${alert.type}</span></td>
          <td>${alert.condition || '-'}</td>
          <td>${alert.message || '-'}</td>
          <td>${createdAt}</td>
          <td class="actions-cell">
            <button class="btn btn-sm btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">
              ✏️
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">
              🗑️
            </button>
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
    updateSummaryStats();
  });
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updateSummaryStats() {
  const totalAlerts = alertsData.length;
  const openAlerts = alertsData.filter(alert => alert.status === 'open').length;
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
      populateSelect('alertRelatedObjectSelect', accounts, 'name');
    });
  }

  if (editAccountRadio) {
    editAccountRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', accounts, 'name');
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
      populateSelect('alertRelatedObjectSelect', tickers, 'symbol');
    });
  }

  if (editTickerRadio) {
    editTickerRadio.addEventListener('change', () => {
      populateSelect('editAlertRelatedObjectSelect', tickers, 'symbol');
    });
  }
}

/**
 * מילוי select עם נתונים
 */
function populateSelect(selectId, data, field, prefix = '') {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = '<option value="">בחר אובייקט לשיוך...</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = prefix ? `${prefix} ${item[field]}` : item[field];
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
  if (selectedType && !checkAlertType(selectedType)) {
    // החזרת הבחירה הקודמת
    selectElement.value = '';
  }
}

/**
 * בדיקת סוג התראה והצגת התראה לסוגים לא נתמכים
 */
function checkAlertType(alertType) {
  const unsupportedTypes = ['volume_alert', 'custom_alert'];

  if (unsupportedTypes.includes(alertType)) {
    alert('סוג התראה זה ייפתח בהמשך. כרגע נתמכים רק התראות על מחיר וסטופ לוס.');
    return false;
  }

  return true;
}

/**
 * שמירת התראה חדשה
 */
async function saveAlert() {
  const form = document.getElementById('addAlertForm');
  if (!form) {
    console.error('Form element not found');
    return;
  }

  // בדיקת סוג ההתראה
  const alertType = document.getElementById('alertType').value;
  if (!checkAlertType(alertType)) {
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
  const condition = document.getElementById('alertCondition').value;

  if (!relatedType || !relatedId || !condition) {
    alert('יש למלא את כל השדות החובה');
    return;
  }

  // המשך הקוד הקיים...
  const alertData = {
    related_type_id: parseInt(formData.get('alertRelationType')),
    related_id: parseInt(document.getElementById('alertRelatedObjectSelect').value),
    type: alertType,
    condition: document.getElementById('alertCondition').value,
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
      alert('התראה נשמרה בהצלחה!');
    } else {
      throw new Error(`שגיאה בשמירת התראה: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בשמירת התראה:', error);
    alert('שגיאה בשמירת התראה: ' + error.message);
  }
}

/**
 * עריכת התראה
 */
function editAlert(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (!alert) {
    alert('התראה לא נמצאה');
    return;
  }

  // טעינת נתונים למודל
  loadModalData();

  // מילוי הטופס
  const editAlertId = document.getElementById('editAlertId');
  const editAlertType = document.getElementById('editAlertType');
  const editAlertCondition = document.getElementById('editAlertCondition');
  const editAlertMessage = document.getElementById('editAlertMessage');

  if (editAlertId) editAlertId.value = alert.id;
  if (editAlertType) editAlertType.value = alert.type || '';
  if (editAlertCondition) editAlertCondition.value = alert.condition || '';
  if (editAlertMessage) editAlertMessage.value = alert.message || '';

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
 * עדכון התראה קיימת
 */
async function updateAlert() {
  const form = document.getElementById('editAlertForm');
  if (!form) {
    console.error('Form element not found');
    return;
  }

  // בדיקת סוג ההתראה
  const alertType = document.getElementById('editAlertType').value;
  if (!checkAlertType(alertType)) {
    return; // עצירת העדכון אם הסוג לא נתמך
  }

  // המשך הקוד הקיים...
  const alertId = document.getElementById('editAlertId').value;
  const alertData = {
    related_type_id: parseInt(document.querySelector('input[name="editAlertRelationType"]:checked').value),
    related_id: parseInt(document.getElementById('editAlertRelatedObjectSelect').value),
    type: alertType,
    condition: document.getElementById('editAlertCondition').value,
    message: document.getElementById('editAlertMessage').value || null
  };

  console.log('מעדכן התראה:', alertId, alertData);

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
      alert('התראה עודכנה בהצלחה!');
    } else {
      throw new Error(`שגיאה בעדכון התראה: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה בעדכון התראה:', error);
    alert('שגיאה בעדכון התראה: ' + error.message);
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
      alert('התראה נמחקה בהצלחה!');
    } else {
      throw new Error(`שגיאה במחיקת התראה: ${response.status}`);
    }
  } catch (error) {
    console.error('שגיאה במחיקת התראה:', error);
    alert('שגיאה במחיקת התראה: ' + error.message);
  }
}

/**
 * מיון טבלה
 */
function sortTable(columnIndex) {
  // פונקציה זו תתווסף בהמשך
  console.log(`מיון לפי עמודה ${columnIndex}`);
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
 * קבלת מחלקת סוג
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
 * קבלת מחלקת סוג של אובייקט מקושר
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
 */
function restoreAlertsSectionState() {
  // שחזור מצב top section
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon') : null;

  if (topSection && topToggleBtn && topIcon) {
    const isCollapsed = localStorage.getItem('alertsTopSectionCollapsed') === 'true';

    if (isCollapsed) {
      topSection.classList.add('collapsed');
      topSection.style.display = 'none';
      topIcon.textContent = '▼';
    } else {
      topSection.classList.remove('collapsed');
      topSection.style.display = 'block';
      topIcon.textContent = '▲';
    }
  }

  // שחזור מצב main section
  const mainSection = document.querySelector('.content-section .section-body');
  const mainToggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const mainIcon = mainToggleBtn ? mainToggleBtn.querySelector('.filter-icon') : null;

  if (mainSection && mainToggleBtn && mainIcon) {
    const isCollapsed = localStorage.getItem('alertsMainSectionCollapsed') === 'true';

    if (isCollapsed) {
      mainSection.classList.add('collapsed');
      mainSection.style.display = 'none';
      mainIcon.textContent = '▼';
    } else {
      mainSection.classList.remove('collapsed');
      mainSection.style.display = 'block';
      mainIcon.textContent = '▲';
    }
  }
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED (ALERTS) ===');

  // שחזור מצב הסקשנים
  restoreAlertsSectionState();

  // אתחול פילטרים
  if (typeof window.initializePageFilters === 'function') {
    window.initializePageFilters('alerts');
  }

  // טעינת נתונים
  loadAlertsData();
});

// הוספת הפונקציות לגלובל
window.loadAlertsData = loadAlertsData;
window.updateAlertsTable = updateAlertsTable;
window.showAddAlertModal = showAddAlertModal;
window.editAlert = editAlert;
window.deleteAlert = deleteAlert;
window.saveAlert = saveAlert;
window.updateAlert = updateAlert;
window.sortTable = sortTable;
window.checkAlertType = checkAlertType;
window.onAlertTypeChange = onAlertTypeChange;


