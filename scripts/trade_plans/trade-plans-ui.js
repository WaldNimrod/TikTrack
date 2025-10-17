/**
 * ========================================
 * Trade Plans UI Layer
 * ========================================
 * 
 * אחראי על:
 * - רינדור טבלאות
 * - פתיחת/סגירת מודלים
 * - עדכון DOM
 * - אירועי UI
 * - אין לוגיקה עסקית
 */

/**
 * עדכון טבלת תוכניות מסחר
 * @param {Array} trade_plans - רשימת תוכניות מסחר
 */
function updateTradePlansTable(trade_plans) {
  console.log(`🔄 updateTradePlansTable called with ${trade_plans ? trade_plans.length : 0} trade plans`);

  const tbody = document.querySelector('#trade_plansTable tbody');
  
  if (!tbody) {
    console.error('❌ Table body not found');
    return;
  }

  // ניקוי הטבלה
  tbody.innerHTML = '';

  if (!trade_plans || trade_plans.length === 0) {
    renderEmptyState(tbody);
    return;
  }

  // רינדור כל שורה
  trade_plans.forEach(plan => {
    const row = renderTableRow(plan);
    tbody.appendChild(row);
  });

  console.log(`✅ Rendered ${trade_plans.length} trade plans`);
}

/**
 * רינדור שורה בטבלה
 * @param {Object} plan - תוכנית מסחר
 * @returns {HTMLElement} אלמנט שורה
 */
function renderTableRow(plan) {
  const row = document.createElement('tr');
  row.setAttribute('data-plan-id', plan.id);

  // טיקר
  const tickerCell = document.createElement('td');
  tickerCell.className = 'col-ticker';
  tickerCell.textContent = plan.ticker_symbol || 'לא ידוע';
  row.appendChild(tickerCell);

  // שם התוכנית
  const nameCell = document.createElement('td');
  nameCell.className = 'col-name';
  nameCell.textContent = plan.name || 'ללא שם';
  row.appendChild(nameCell);

  // סכום
  const amountCell = document.createElement('td');
  amountCell.className = 'col-amount';
  amountCell.textContent = plan.amount ? `₪${parseFloat(plan.amount).toFixed(2)}` : 'לא ידוע';
  row.appendChild(amountCell);

  // מחיר כניסה
  const entryPriceCell = document.createElement('td');
  entryPriceCell.className = 'col-entry-price';
  entryPriceCell.textContent = plan.entry_price ? `₪${parseFloat(plan.entry_price).toFixed(2)}` : 'לא ידוע';
  row.appendChild(entryPriceCell);

  // כמות מניות
  const quantityCell = document.createElement('td');
  quantityCell.className = 'col-quantity';
  quantityCell.textContent = plan.quantity || 'לא ידוע';
  row.appendChild(quantityCell);

  // מחיר עצירה
  const stopPriceCell = document.createElement('td');
  stopPriceCell.className = 'col-stop-price';
  stopPriceCell.textContent = plan.stop_price ? `₪${parseFloat(plan.stop_price).toFixed(2)}` : 'לא מוגדר';
  row.appendChild(stopPriceCell);

  // מחיר יעד
  const targetPriceCell = document.createElement('td');
  targetPriceCell.className = 'col-target-price';
  targetPriceCell.textContent = plan.target_price ? `₪${parseFloat(plan.target_price).toFixed(2)}` : 'לא מוגדר';
  row.appendChild(targetPriceCell);

  // סטטוס
  const statusCell = document.createElement('td');
  statusCell.className = 'col-status';
  statusCell.innerHTML = renderStatusBadge(plan.status);
  row.appendChild(statusCell);

  // תאריך יצירה
  const dateCell = document.createElement('td');
  dateCell.className = 'col-date';
  dateCell.textContent = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : 'לא ידוע';
  row.appendChild(dateCell);

  // פעולות
  const actionsCell = document.createElement('td');
  actionsCell.className = 'col-actions';
  actionsCell.innerHTML = renderActionsMenu(plan);
  row.appendChild(actionsCell);

  return row;
}

/**
 * רינדור מצב ריק
 * @param {HTMLElement} tbody - אלמנט טבלה
 */
function renderEmptyState(tbody) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 10;
  cell.className = 'text-center text-muted py-4';
  cell.innerHTML = `
    <div class="d-flex flex-column align-items-center">
      <i class="fas fa-chart-line fa-2x mb-2"></i>
      <span>אין תוכניות מסחר</span>
      <small>לחץ על "הוסף תכנון" כדי להתחיל</small>
    </div>
  `;
  row.appendChild(cell);
  tbody.appendChild(row);
}

/**
 * רינדור תג סטטוס
 * @param {string} status - סטטוס
 * @returns {string} HTML של התג
 */
function renderStatusBadge(status) {
  const statusMap = {
    'active': { class: 'badge bg-success', text: 'פעיל' },
    'inactive': { class: 'badge bg-secondary', text: 'לא פעיל' },
    'executed': { class: 'badge bg-primary', text: 'בוצע' },
    'cancelled': { class: 'badge bg-danger', text: 'בוטל' },
    'pending': { class: 'badge bg-warning', text: 'ממתין' }
  };

  const statusInfo = statusMap[status] || { class: 'badge bg-light text-dark', text: status || 'לא ידוע' };
  return `<span class="${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * רינדור תפריט פעולות
 * @param {Object} plan - תוכנית מסחר
 * @returns {string} HTML של התפריט
 */
function renderActionsMenu(plan) {
  const actions = [];

  // עריכה
  actions.push(`
    <button class="btn btn-sm btn-outline-primary" onclick="window.TradePlansUI.showEditTradePlanModal(${plan.id})" title="עריכה">
      <i class="fas fa-edit"></i>
    </button>
  `);

  // ביצוע (רק אם פעיל)
  if (plan.status === 'active') {
    actions.push(`
      <button class="btn btn-sm btn-outline-success" onclick="window.TradePlansData.executeTradePlan(${plan.id})" title="ביצוע">
        <i class="fas fa-play"></i>
      </button>
    `);
  }

  // העתקה
  actions.push(`
    <button class="btn btn-sm btn-outline-info" onclick="window.TradePlansData.copyTradePlan(${plan.id})" title="העתקה">
      <i class="fas fa-copy"></i>
    </button>
  `);

  // ביטול (רק אם פעיל)
  if (plan.status === 'active') {
    actions.push(`
      <button class="btn btn-sm btn-outline-warning" onclick="window.TradePlansData.cancelTradePlan(${plan.id})" title="ביטול">
        <i class="fas fa-stop"></i>
      </button>
    `);
  }

  // מחיקה
  actions.push(`
    <button class="btn btn-sm btn-outline-danger" onclick="window.TradePlansData.deleteTradePlan(${plan.id})" title="מחיקה">
      <i class="fas fa-trash"></i>
    </button>
  `);

  // פריטים מקושרים
  actions.push(`
    <button class="btn btn-sm btn-outline-secondary" onclick="window.viewLinkedItemsForTradePlan(${plan.id})" title="פריטים מקושרים">
      <i class="fas fa-link"></i>
    </button>
  `);

  return `
    <div class="btn-group" role="group">
      ${actions.join('')}
    </div>
  `;
}

/**
 * פתיחת מודל הוספת תוכנית מסחר
 * @returns {Promise<void>}
 */
async function showAddTradePlanModal() {
  try {
    // ניקוי הטופס
    const form = document.getElementById('addTradePlanForm');
    if (form) {
      form.reset();
    }

    // השבתת שדות
    disableAddFormFields();

    // טעינת טיקרים
    if (typeof window.SelectPopulatorService?.populateTickersSelect === 'function') {
      await window.SelectPopulatorService.populateTickersSelect('addTradePlanTickerId', {
        includeEmpty: true,
        filterFn: (ticker) => ticker.status === 'open' || ticker.status === 'closed'
      });
    }

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));
    modal.show();

    console.log('✅ Add trade plan modal opened');
  } catch (error) {
    console.error('❌ Error opening add trade plan modal:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל הוספת תוכנית');
    }
  }
}

/**
 * פתיחת מודל עריכת תוכנית מסחר
 * @param {number} planId - מזהה התוכנית
 * @returns {Promise<void>}
 */
async function showEditTradePlanModal(planId) {
  try {
    // טעינת נתוני התוכנית
    const plans = await window.TradePlansData.loadTradePlansData();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      throw new Error('תוכנית מסחר לא נמצאה');
    }

    // מילוי הטופס
    fillEditForm(plan);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTradePlanModal'));
    modal.show();

    console.log('✅ Edit trade plan modal opened for plan:', planId);
  } catch (error) {
    console.error('❌ Error opening edit trade plan modal:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל עריכת תוכנית');
    }
  }
}

/**
 * מילוי טופס עריכה
 * @param {Object} plan - תוכנית מסחר
 */
function fillEditForm(plan) {
  // מילוי שדות הטופס
  const fields = {
    'editTradePlanId': plan.id,
    'editTradePlanName': plan.name || '',
    'editTradePlanTickerId': plan.ticker_id || '',
    'editTradePlanAmount': plan.amount || '',
    'editTradePlanEntryPrice': plan.entry_price || '',
    'editTradePlanQuantity': plan.quantity || '',
    'editTradePlanStopPrice': plan.stop_price || '',
    'editTradePlanTargetPrice': plan.target_price || '',
    'editTradePlanNotes': plan.notes || ''
  };

  Object.entries(fields).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
    }
  });
}

/**
 * סגירת מודל
 * @param {string} modalId - מזהה המודל
 */
function closeModal(modalId) {
  const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
  if (modal) {
    modal.hide();
  }
}

/**
 * השבתת שדות טופס הוספה
 */
function disableAddFormFields() {
  const fields = [
    'addTradePlanName',
    'addTradePlanAmount',
    'addTradePlanEntryPrice',
    'addTradePlanQuantity',
    'addTradePlanStopPrice',
    'addTradePlanTargetPrice',
    'addTradePlanNotes'
  ];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = true;
    }
  });
}

/**
 * הפעלת שדות טופס הוספה
 */
function enableAddFormFields() {
  const fields = [
    'addTradePlanName',
    'addTradePlanAmount',
    'addTradePlanEntryPrice',
    'addTradePlanQuantity',
    'addTradePlanStopPrice',
    'addTradePlanTargetPrice',
    'addTradePlanNotes'
  ];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = false;
    }
  });
}

/**
 * הצגת טעינה
 * @param {string} elementId - מזהה האלמנט
 */
function showLoading(elementId = 'loadingIndicator') {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

/**
 * הסתרת טעינה
 * @param {string} elementId - מזהה האלמנט
 */
function hideLoading(elementId = 'loadingIndicator') {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * עדכון סטטיסטיקות סיכום
 * @param {Array} plans - רשימת תוכניות
 */
function updateSummaryStats(plans) {
  if (!plans || !Array.isArray(plans)) {
    return;
  }

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    executed: plans.filter(p => p.status === 'executed').length,
    cancelled: plans.filter(p => p.status === 'cancelled').length
  };

  // עדכון אלמנטי הסטטיסטיקה
  const elements = {
    'totalPlansCount': stats.total,
    'activePlansCount': stats.active,
    'executedPlansCount': stats.executed,
    'cancelledPlansCount': stats.cancelled
  };

  Object.entries(elements).forEach(([elementId, value]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  });
}

/**
 * אתחול UI
 */
function initialize() {
  console.log('🔄 Initializing Trade Plans UI...');
  
  // הוספת מאזינים לאירועים
  setupEventListeners();
  
  console.log('✅ Trade Plans UI initialized');
}

/**
 * הגדרת מאזיני אירועים
 */
function setupEventListeners() {
  // מאזין לבחירת טיקר בטופס הוספה
  const tickerSelect = document.getElementById('addTradePlanTickerId');
  if (tickerSelect) {
    tickerSelect.addEventListener('change', handleTickerSelection);
  }

  // מאזין למיון טבלה
  const tableHeaders = document.querySelectorAll('#trade_plansTable th[data-sortable]');
  tableHeaders.forEach((header, index) => {
    header.addEventListener('click', () => handleTableSort(index));
  });
}

/**
 * טיפול בבחירת טיקר
 * @param {Event} event - אירוע
 */
async function handleTickerSelection(event) {
  const tickerId = event.target.value;
  if (!tickerId) {
    disableAddFormFields();
    return;
  }

  try {
    // טעינת מידע טיקר
    await updateAddTickerInfo(tickerId);
    enableAddFormFields();
  } catch (error) {
    console.error('❌ Error handling ticker selection:', error);
  }
}

/**
 * טיפול במיון טבלה
 * @param {number} columnIndex - אינדקס עמודה
 */
function handleTableSort(columnIndex) {
  if (typeof window.sortTableData === 'function') {
    window.sortTableData('trade_plansTable', columnIndex);
  } else {
    console.error('❌ sortTableData function not available');
  }
}

// ייצוא המודול
window.TradePlansUI = {
  updateTradePlansTable,
  renderTableRow,
  renderEmptyState,
  renderStatusBadge,
  renderActionsMenu,
  showAddTradePlanModal,
  showEditTradePlanModal,
  fillEditForm,
  closeModal,
  disableAddFormFields,
  enableAddFormFields,
  showLoading,
  hideLoading,
  updateSummaryStats,
  initialize,
  setupEventListeners,
  handleTickerSelection,
  handleTableSort
};

console.log('✅ Trade Plans UI module loaded');
