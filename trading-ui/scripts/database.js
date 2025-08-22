// ===== קובץ JavaScript לדף בסיס נתונים =====

// משתנים גלובליים
let allData = {
  accounts: [],
  trades: [],
  tickers: [],
  tradePlans: [],
  executions: [],
  cashFlows: [],
  alerts: [],
  notes: [],
  currencies: []
};

// פונקציות לפתיחה/סגירה של סקשנים
function toggleTopSection() {
  console.log('🔄 toggleTopSection נקראה');
  const topSection = document.querySelector('.top-section');

  if (!topSection) {
    console.error('❌ לא נמצא top-section');
    return;
  }
  console.log('✅ top-section נמצא:', topSection);

  const sectionBody = topSection.querySelector('.section-body');
  const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
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
    localStorage.setItem('databaseTopSectionHidden', !isCollapsed);
  }
}

function toggleMainSection() {
  console.log('🔄 toggleMainSection נקראה');
  const contentSections = document.querySelectorAll('.content-section');
  console.log('📋 מספר content-sections נמצא:', contentSections.length);

  // מציאת הסקשן הנוכחי (הכי קרוב לכפתור שנלחץ)
  const clickedButton = event.target.closest('button');
  const currentSection = clickedButton ? clickedButton.closest('.content-section') : contentSections[0];

  if (!currentSection) {
    console.error('❌ לא נמצא סקשן');
    return;
  }
  console.log('✅ סקשן נמצא:', currentSection);

  const sectionBody = currentSection.querySelector('.section-body');
  const toggleBtn = currentSection.querySelector('button[onclick="toggleMainSection()"]');
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
    const sectionId = currentSection.querySelector('.table-title').textContent.trim();
    localStorage.setItem(`databaseSectionHidden_${sectionId}`, !isCollapsed);
  }
}

// פונקציה לשחזור מצב הסגירה
function restoreDatabaseSectionState() {
  // שחזור מצב top-section
  const topCollapsed = localStorage.getItem('databaseTopSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleTopSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב content-sections
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => {
    const sectionTitle = section.querySelector('.table-title').textContent.trim();
    const sectionCollapsed = localStorage.getItem(`databaseSectionHidden_${sectionTitle}`) === 'true';
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector('button[onclick="toggleMainSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && sectionCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  });
}

// פונקציה לטעינת כל הנתונים
async function loadAllData() {
  console.log('🔄 === טוען את כל הנתונים ===');

  try {
    // טעינת כל הנתונים במקביל
    const [
      accountsResponse,
      tradesResponse,
      tickersResponse,
      tradePlansResponse,
      executionsResponse,
      cashFlowsResponse,
      alertsResponse,
      notesResponse,
      currenciesResponse
    ] = await Promise.all([
      fetch('/api/v1/accounts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trades/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/trade_plans/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/executions/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/cash_flows/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/alerts/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/notes/').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/v1/currencies/').then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    // שמירת הנתונים
    allData.accounts = accountsResponse.data || accountsResponse || [];
    allData.trades = tradesResponse.data || tradesResponse || [];
    allData.tickers = tickersResponse.data || tickersResponse || [];
    allData.tradePlans = tradePlansResponse.data || tradePlansResponse || [];
    allData.executions = executionsResponse.data || executionsResponse || [];
    allData.cashFlows = cashFlowsResponse.data || cashFlowsResponse || [];
    allData.alerts = alertsResponse.data || alertsResponse || [];
    allData.notes = notesResponse.data || notesResponse || [];
    allData.currencies = currenciesResponse.data || currenciesResponse || [];

    console.log('✅ נטענו נתונים:', {
      accounts: allData.accounts.length,
      trades: allData.trades.length,
      tickers: allData.tickers.length,
      tradePlans: allData.tradePlans.length,
      executions: allData.executions.length,
      cashFlows: allData.cashFlows.length,
      alerts: allData.alerts.length,
      notes: allData.notes.length,
      currencies: allData.currencies.length
    });

    // עדכון כל הטבלאות
    updateAllTables();
    updateStatistics();

  } catch (error) {
    console.error('❌ שגיאה בטעינת נתונים:', error);
    showError('שגיאה בטעינת נתונים מהשרת: ' + error.message);
  }
}

// פונקציה לעדכון כל הטבלאות
function updateAllTables() {
  updateAccountsTable();
  updateTradesTable();
  updateTickersTable();
  updateTradePlansTable();
  updateExecutionsTable();
  updateCashFlowsTable();
  updateAlertsTable();
  updateNotesTable();
  updateCurrenciesTable();
}

// פונקציה לעדכון סטטיסטיקות
function updateStatistics() {
  document.getElementById('accountsStats').textContent = allData.accounts.length;
  document.getElementById('tradesStats').textContent = allData.trades.length;
  document.getElementById('tickersStats').textContent = allData.tickers.length;
  document.getElementById('tradePlansStats').textContent = allData.tradePlans.length;
}

// פונקציה להצגת שגיאה
function showError(message) {
  console.error('❌ שגיאה:', message);
  // הצגת הודעת שגיאה בכל הטבלאות
  const tables = ['accountsTable', 'tradesTable', 'tickersTable', 'tradePlansTable',
    'executionsTable', 'cashFlowsTable', 'alertsTable', 'notesTable', 'currenciesTable'];

  tables.forEach(tableId => {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="100" class="text-center text-danger">
            <div style="padding: 20px;">
              <h5>❌ שגיאה בטעינת נתונים</h5>
              <p>${message}</p>
              <button class="btn btn-sm btn-primary" onclick="loadAllData()">נסה שוב</button>
            </div>
          </td>
        </tr>
      `;
    }
  });
}

// פונקציות לעדכון טבלאות ספציפיות
function updateAccountsTable() {
  const tbody = document.querySelector('#accountsTable tbody');
  if (!tbody) return;

  if (allData.accounts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.accounts.map(account => `
    <tr>
      <td>${account.name || ''}</td>
      <td>${account.currency || ''}</td>
      <td>${account.status || ''}</td>
      <td>${account.cash_balance || 0}</td>
      <td>${account.total_value || 0}</td>
      <td>${account.total_pl || 0}</td>
      <td>${account.notes || ''}</td>
      <td>${account.id || ''}</td>
      <td>${account.created_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editAccount(${account.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${account.id})" title="מחק">🗑️</button>
        ${account.status && account.status !== 'cancelled' ? 
          `<button class="btn btn-sm btn-warning" onclick="cancelAccount(${account.id})" title="ביטול">❌</button>` : 
          ''}
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('accountsCount').textContent = `${allData.accounts.length} רשומות`;
}

function updateTradesTable() {
  const tbody = document.querySelector('#tradesTable tbody');
  if (!tbody) return;

  if (allData.trades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.trades.map(trade => `
    <tr>
      <td>${trade.account_id || ''}</td>
      <td>${trade.ticker_id || ''}</td>
      <td>${trade.trade_plan_id || ''}</td>
      <td>${trade.status || ''}</td>
      <td>${trade.investment_type || ''}</td>
      <td>${trade.opened_at || ''}</td>
      <td>${trade.closed_at || ''}</td>
      <td>${trade.cancelled_at || ''}</td>
      <td>${trade.cancel_reason || ''}</td>
      <td>${trade.total_pl || 0}</td>
      <td>${trade.notes || ''}</td>
      <td>${trade.id || ''}</td>
      <td>${trade.created_at || ''}</td>
      <td>${trade.side || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editTrade(${trade.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTrade(${trade.id})" title="מחק">🗑️</button>
        ${trade.status && trade.status !== 'cancelled' ? 
          `<button class="btn btn-sm btn-warning" onclick="cancelTrade(${trade.id})" title="ביטול">❌</button>` : 
          ''}
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('tradesCount').textContent = `${allData.trades.length} רשומות`;
}

function updateTickersTable() {
  const tbody = document.querySelector('#tickersTable tbody');
  if (!tbody) return;

  if (allData.tickers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.tickers.map(ticker => `
    <tr>
      <td>${ticker.symbol || ''}</td>
      <td>${ticker.name || ''}</td>
      <td>${ticker.type || ''}</td>
      <td>${ticker.remarks || ''}</td>
      <td>${ticker.currency || ''}</td>
      <td>${ticker.active_trades ? 'כן' : 'לא'}</td>
      <td>${ticker.id || ''}</td>
      <td>${ticker.created_at || ''}</td>
      <td>${ticker.updated_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editTicker(${ticker.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTicker(${ticker.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('tickersCount').textContent = `${allData.tickers.length} רשומות`;
}

function updateTradePlansTable() {
  const tbody = document.querySelector('#tradePlansTable tbody');
  if (!tbody) return;

  if (allData.tradePlans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.tradePlans.map(plan => `
    <tr>
      <td>${plan.id || ''}</td>
      <td>${plan.account_id || ''}</td>
      <td>${plan.ticker_id || ''}</td>
      <td>${plan.investment_type || ''}</td>
      <td>${plan.planned_amount || 0}</td>
      <td>${plan.entry_conditions || ''}</td>
      <td>${plan.stop_price || 0}</td>
      <td>${plan.target_price || 0}</td>
      <td>${plan.reasons || ''}</td>
      <td>${plan.cancelled_at || ''}</td>
      <td>${plan.cancel_reason || ''}</td>
      <td>${plan.created_at || ''}</td>
      <td>${plan.side || ''}</td>
      <td>${plan.status || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editTradePlan(${plan.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTradePlan(${plan.id})" title="מחק">🗑️</button>
        ${plan.status && plan.status !== 'cancelled' ? 
          `<button class="btn btn-sm btn-warning" onclick="cancelTradePlan(${plan.id})" title="ביטול">❌</button>` : 
          ''}
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('tradePlansCount').textContent = `${allData.tradePlans.length} רשומות`;
}

function updateExecutionsTable() {
  const tbody = document.querySelector('#executionsTable tbody');
  if (!tbody) return;

  if (allData.executions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.executions.map(execution => `
    <tr>
      <td>${execution.trade_id || ''}</td>
      <td>${execution.action || ''}</td>
      <td>${execution.date || ''}</td>
      <td>${execution.quantity || 0}</td>
      <td>${execution.price || 0}</td>
      <td>${execution.fee || 0}</td>
      <td>${execution.source || ''}</td>
      <td>${execution.id || ''}</td>
      <td>${execution.created_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editExecution(${execution.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteExecution(${execution.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('executionsCount').textContent = `${allData.executions.length} רשומות`;
}

function updateCashFlowsTable() {
  const tbody = document.querySelector('#cashFlowsTable tbody');
  if (!tbody) return;

  if (allData.cashFlows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="12" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.cashFlows.map(cashFlow => `
    <tr>
      <td>${cashFlow.account_id || ''}</td>
      <td>${cashFlow.type || ''}</td>
      <td>${cashFlow.amount || 0}</td>
      <td>${cashFlow.date || ''}</td>
      <td>${cashFlow.description || ''}</td>
      <td>${cashFlow.id || ''}</td>
      <td>${cashFlow.created_at || ''}</td>
      <td>${cashFlow.currency || ''}</td>
      <td>${cashFlow.currency_id || ''}</td>
      <td>${cashFlow.usd_rate || 0}</td>
      <td>${cashFlow.source || ''}</td>
      <td>${cashFlow.external_id || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editCashFlow(${cashFlow.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCashFlow(${cashFlow.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('cashFlowsCount').textContent = `${allData.cashFlows.length} רשומות`;
}

function updateAlertsTable() {
  const tbody = document.querySelector('#alertsTable tbody');
  if (!tbody) return;

  if (allData.alerts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.alerts.map(alert => `
    <tr>
      <td>${alert.account_id || ''}</td>
      <td>${alert.ticker_id || ''}</td>
      <td>${alert.type || ''}</td>
      <td>${alert.condition || ''}</td>
      <td>${alert.message || ''}</td>
      <td>${alert.is_active ? 'כן' : 'לא'}</td>
      <td>${alert.triggered_at || ''}</td>
      <td>${alert.id || ''}</td>
      <td>${alert.created_at || ''}</td>
      <td>${alert.status || ''}</td>
      <td>${alert.is_triggered || ''}</td>
      <td>${alert.related_type_id || ''}</td>
      <td>${alert.related_id || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editAlert(${alert.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})" title="מחק">🗑️</button>
        ${alert.status && alert.status !== 'cancelled' ? 
          `<button class="btn btn-sm btn-warning" onclick="cancelAlert(${alert.id})" title="ביטול">❌</button>` : 
          ''}
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('alertsCount').textContent = `${allData.alerts.length} רשומות`;
}

function updateNotesTable() {
  const tbody = document.querySelector('#notesTable tbody');
  if (!tbody) return;

  if (allData.notes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.notes.map(note => `
    <tr>
      <td>${note.id || ''}</td>
      <td>${note.content || ''}</td>
      <td>${note.attachment || ''}</td>
      <td>${note.created_at || ''}</td>
      <td>${note.related_type_id || ''}</td>
      <td>${note.related_id || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editNote(${note.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('notesCount').textContent = `${allData.notes.length} רשומות`;
}

function updateCurrenciesTable() {
  const tbody = document.querySelector('#currenciesTable tbody');
  if (!tbody) return;

  if (allData.currencies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">אין נתונים</td></tr>';
    return;
  }

  const rows = allData.currencies.map(currency => `
    <tr>
      <td>${currency.symbol || ''}</td>
      <td>${currency.name || ''}</td>
      <td>${currency.usd_rate || 0}</td>
      <td>${currency.id || ''}</td>
      <td>${currency.created_at || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editCurrency(${currency.id})" title="ערוך">
          <span class="btn-icon">✏️</span>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCurrency(${currency.id})" title="מחק">🗑️</button>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rows;
  document.getElementById('currenciesCount').textContent = `${allData.currencies.length} רשומות`;
}

// פונקציות פעולות
function refreshAllData() {
  console.log('🔄 רענון כל הנתונים');
  loadAllData();
}

function exportAllData() {
  console.log('📤 ייצוא נתונים');
  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// פונקציה להוספת רשומה חדשה
function addRecord() {
  console.log('➕ הוספת רשומה חדשה...');
  // TODO: לזהות איזה טבלה ולפתוח מודל הוספה מתאים
  alert('פונקציית הוספת רשומה תתווסף בקרוב');
}

// פונקציות ביטול
function cancelAccount(id) {
  console.log('❌ ביטול חשבון:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל חשבון זה?')) {
    // TODO: קריאה ל-API לביטול החשבון
    alert('פונקציית ביטול חשבון תתווסף בקרוב');
  }
}

function cancelTrade(id) {
  console.log('❌ ביטול טרייד:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
    // TODO: קריאה ל-API לביטול הטרייד
    alert('פונקציית ביטול טרייד תתווסף בקרוב');
  }
}

function cancelTradePlan(id) {
  console.log('❌ ביטול תוכנית מסחר:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל תוכנית מסחר זו?')) {
    // TODO: קריאה ל-API לביטול התוכנית
    alert('פונקציית ביטול תוכנית מסחר תתווסף בקרוב');
  }
}

function cancelAlert(id) {
  console.log('❌ ביטול התראה:', id);
  if (confirm('האם אתה בטוח שברצונך לבטל התראה זו?')) {
    // TODO: קריאה ל-API לביטול ההתראה
    alert('פונקציית ביטול התראה תתווסף בקרוב');
  }
}

function showDatabaseInfo() {
  console.log('ℹ️ מידע בסיס נתונים');
  alert('מידע על בסיס הנתונים:\n\n' +
    'מספר טבלאות: 9\n' +
    'חשבונות: ' + allData.accounts.length + '\n' +
    'טריידים: ' + allData.trades.length + '\n' +
    'טיקרים: ' + allData.tickers.length + '\n' +
    'תוכניות: ' + allData.tradePlans.length + '\n' +
    'ביצועים: ' + allData.executions.length + '\n' +
    'תזרימי מזומנים: ' + allData.cashFlows.length + '\n' +
    'התראות: ' + allData.alerts.length + '\n' +
    'הערות: ' + allData.notes.length + '\n' +
    'מטבעות: ' + allData.currencies.length);
}

function showBackupOptions() {
  console.log('💾 אפשרויות גיבוי');
  alert('אפשרויות גיבוי:\n\n' +
    '1. ייצוא JSON - ייצא את כל הנתונים לקובץ JSON\n' +
    '2. גיבוי SQL - ייצא את מבנה הטבלאות והנתונים\n' +
    '3. גיבוי אוטומטי - גיבוי יומי אוטומטי');
}

// פונקציות צפייה/עריכה/מחיקה (placeholder)
function viewAccount(id) { console.log('צפייה בחשבון:', id); }
function editAccount(id) { console.log('עריכת חשבון:', id); }
function deleteAccount(id) { console.log('מחיקת חשבון:', id); }

function viewTrade(id) { console.log('צפייה בטרייד:', id); }
function editTrade(id) { console.log('עריכת טרייד:', id); }
function deleteTrade(id) { console.log('מחיקת טרייד:', id); }

function viewTicker(id) { console.log('צפייה בטיקר:', id); }
function editTicker(id) { console.log('עריכת טיקר:', id); }
function deleteTicker(id) { console.log('מחיקת טיקר:', id); }

function viewTradePlan(id) { console.log('צפייה בתוכנית:', id); }
function editTradePlan(id) { console.log('עריכת תוכנית:', id); }
function deleteTradePlan(id) { console.log('מחיקת תוכנית:', id); }

function viewExecution(id) { console.log('צפייה בביצוע:', id); }
function editExecution(id) { console.log('עריכת ביצוע:', id); }
function deleteExecution(id) { console.log('מחיקת ביצוע:', id); }

function viewCashFlow(id) { console.log('צפייה בתזרים:', id); }
function editCashFlow(id) { console.log('עריכת תזרים:', id); }
function deleteCashFlow(id) { console.log('מחיקת תזרים:', id); }

function viewAlert(id) { console.log('צפייה בהתראה:', id); }
function editAlert(id) { console.log('עריכת התראה:', id); }
function deleteAlert(id) { console.log('מחיקת התראה:', id); }

function viewNote(id) { console.log('צפייה בהערה:', id); }
function editNote(id) { console.log('עריכת הערה:', id); }
function deleteNote(id) { console.log('מחיקת הערה:', id); }

function viewCurrency(id) { console.log('צפייה במטבע:', id); }
function editCurrency(id) { console.log('עריכת מטבע:', id); }
function deleteCurrency(id) { console.log('מחיקת מטבע:', id); }

// הגדרת הפונקציות כגלובליות
window.toggleTopSection = toggleTopSection;
window.toggleMainSection = toggleMainSection;
window.restoreDatabaseSectionState = restoreDatabaseSectionState;
window.addRecord = addRecord;
window.cancelAccount = cancelAccount;
window.cancelTrade = cancelTrade;
window.cancelTradePlan = cancelTradePlan;
window.cancelAlert = cancelAlert;
window.exportAllData = exportAllData;
window.showDatabaseInfo = showDatabaseInfo;
window.showBackupOptions = showBackupOptions;

// פונקציות פעולות
window.viewAccount = viewAccount;
window.editAccount = editAccount;
window.deleteAccount = deleteAccount;
window.viewTrade = viewTrade;
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.viewTicker = viewTicker;
window.editTicker = editTicker;
window.deleteTicker = deleteTicker;
window.viewTradePlan = viewTradePlan;
window.editTradePlan = editTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.viewExecution = viewExecution;
window.editExecution = editExecution;
window.deleteExecution = deleteExecution;
window.viewCashFlow = viewCashFlow;
window.editCashFlow = editCashFlow;
window.deleteCashFlow = deleteCashFlow;
window.viewAlert = viewAlert;
window.editAlert = editAlert;
window.deleteAlert = deleteAlert;
window.viewNote = viewNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.viewCurrency = viewCurrency;
window.editCurrency = editCurrency;
window.deleteCurrency = deleteCurrency;

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  console.log('🔄 === DOM CONTENT LOADED (DATABASE) ===');

  // שחזור מצב הסגירה
  restoreDatabaseSectionState();

  // טעינת נתונים
  loadAllData();

  console.log('דף בסיס נתונים נטען בהצלחה');
});
