/**
 * ========================================
 * Trades UI Layer
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
 * עדכון טבלת טריידים
 * @param {Array} trades - רשימת טריידים
 */
function updateTradesTable(trades) {
  console.log(`🔄 updateTradesTable called with ${trades ? trades.length : 0} trades`);

  const tbody = document.querySelector('#tradesTable tbody');
  
  if (!tbody) {
    console.error('❌ Table body not found');
    return;
  }

  // ניקוי הטבלה
  tbody.innerHTML = '';

  if (!trades || trades.length === 0) {
    renderEmptyState(tbody);
    return;
  }

  // רינדור כל שורה
  trades.forEach(trade => {
    const row = renderTableRow(trade);
    tbody.appendChild(row);
  });

  console.log(`✅ Rendered ${trades.length} trades`);
}

/**
 * רינדור שורה בטבלה
 * @param {Object} trade - טרייד
 * @returns {HTMLElement} אלמנט שורה
 */
function renderTableRow(trade) {
  const row = document.createElement('tr');
  row.setAttribute('data-trade-id', trade.id);

  // טיקר
  const tickerCell = document.createElement('td');
  tickerCell.className = 'col-ticker';
  tickerCell.textContent = trade.ticker_symbol || 'לא ידוע';
  row.appendChild(tickerCell);

  // סוג טרייד
  const typeCell = document.createElement('td');
  typeCell.className = 'col-type';
  typeCell.innerHTML = renderTradeTypeBadge(trade.trade_type);
  row.appendChild(typeCell);

  // כמות
  const quantityCell = document.createElement('td');
  quantityCell.className = 'col-quantity';
  quantityCell.textContent = trade.quantity || 'לא ידוע';
  row.appendChild(quantityCell);

  // מחיר כניסה
  const entryPriceCell = document.createElement('td');
  entryPriceCell.className = 'col-entry-price';
  entryPriceCell.textContent = trade.entry_price ? `₪${parseFloat(trade.entry_price).toFixed(2)}` : 'לא ידוע';
  row.appendChild(entryPriceCell);

  // מחיר נוכחי
  const currentPriceCell = document.createElement('td');
  currentPriceCell.className = 'col-current-price';
  currentPriceCell.textContent = trade.current_price ? `₪${parseFloat(trade.current_price).toFixed(2)}` : 'לא ידוע';
  row.appendChild(currentPriceCell);

  // מחיר יציאה
  const exitPriceCell = document.createElement('td');
  exitPriceCell.className = 'col-exit-price';
  exitPriceCell.textContent = trade.exit_price ? `₪${parseFloat(trade.exit_price).toFixed(2)}` : '-';
  row.appendChild(exitPriceCell);

  // רווח/הפסד
  const profitLossCell = document.createElement('td');
  profitLossCell.className = 'col-profit-loss';
  profitLossCell.innerHTML = renderProfitLoss(trade);
  row.appendChild(profitLossCell);

  // אחוז רווח/הפסד
  const percentageCell = document.createElement('td');
  percentageCell.className = 'col-percentage';
  percentageCell.innerHTML = renderProfitLossPercentage(trade);
  row.appendChild(percentageCell);

  // תאריך כניסה
  const entryDateCell = document.createElement('td');
  entryDateCell.className = 'col-entry-date';
  entryDateCell.textContent = trade.entry_date ? window.TradesBusiness.formatDate(trade.entry_date) : 'לא ידוע';
  row.appendChild(entryDateCell);

  // תאריך יציאה
  const exitDateCell = document.createElement('td');
  exitDateCell.className = 'col-exit-date';
  exitDateCell.textContent = trade.exit_date ? window.TradesBusiness.formatDate(trade.exit_date) : '-';
  row.appendChild(exitDateCell);

  // סטטוס
  const statusCell = document.createElement('td');
  statusCell.className = 'col-status';
  statusCell.innerHTML = renderStatusBadge(trade.status);
  row.appendChild(statusCell);

  // פעולות
  const actionsCell = document.createElement('td');
  actionsCell.className = 'col-actions';
  actionsCell.innerHTML = renderActionsMenu(trade);
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
  cell.colSpan = 12;
  cell.className = 'text-center text-muted py-4';
  cell.innerHTML = `
    <div class="d-flex flex-column align-items-center">
      <i class="fas fa-chart-line fa-2x mb-2"></i>
      <span>אין טריידים</span>
      <small>לחץ על "הוסף טרייד" כדי להתחיל</small>
    </div>
  `;
  row.appendChild(cell);
  tbody.appendChild(row);
}

/**
 * רינדור תג סוג טרייד
 * @param {string} tradeType - סוג טרייד
 * @returns {string} HTML של התג
 */
function renderTradeTypeBadge(tradeType) {
  const typeMap = {
    'buy': { class: 'badge bg-success', text: 'רכישה' },
    'sell': { class: 'badge bg-danger', text: 'מכירה' },
    'long': { class: 'badge bg-primary', text: 'ארוך' },
    'short': { class: 'badge bg-warning', text: 'קצר' }
  };

  const typeInfo = typeMap[tradeType] || { class: 'badge bg-light text-dark', text: tradeType || 'לא ידוע' };
  return `<span class="${typeInfo.class}">${typeInfo.text}</span>`;
}

/**
 * רינדור תג סטטוס
 * @param {string} status - סטטוס
 * @returns {string} HTML של התג
 */
function renderStatusBadge(status) {
  const statusMap = {
    'open': { class: 'badge bg-success', text: 'פתוח' },
    'closed': { class: 'badge bg-primary', text: 'סגור' },
    'cancelled': { class: 'badge bg-danger', text: 'בוטל' },
    'pending': { class: 'badge bg-warning', text: 'ממתין' }
  };

  const statusInfo = statusMap[status] || { class: 'badge bg-light text-dark', text: status || 'לא ידוע' };
  return `<span class="${statusInfo.class}">${statusInfo.text}</span>`;
}

/**
 * רינדור רווח/הפסד
 * @param {Object} trade - טרייד
 * @returns {string} HTML של הרווח/הפסד
 */
function renderProfitLoss(trade) {
  const profitLoss = window.TradesBusiness.calculateTradeProfitLoss(trade);
  const profit = parseFloat(profitLoss.profit);
  
  if (profit > 0) {
    return `<span class="text-success">₪${profitLoss.profit}</span>`;
  } else if (profit < 0) {
    return `<span class="text-danger">-₪${profitLoss.loss}</span>`;
  } else {
    return `<span class="text-muted">₪0.00</span>`;
  }
}

/**
 * רינדור אחוז רווח/הפסד
 * @param {Object} trade - טרייד
 * @returns {string} HTML של האחוז
 */
function renderProfitLossPercentage(trade) {
  const profitLoss = window.TradesBusiness.calculateTradeProfitLoss(trade);
  const percentage = parseFloat(profitLoss.percentage);
  
  if (percentage > 0) {
    return `<span class="text-success">+${profitLoss.percentage}%</span>`;
  } else if (percentage < 0) {
    return `<span class="text-danger">${profitLoss.percentage}%</span>`;
  } else {
    return `<span class="text-muted">0.00%</span>`;
  }
}

/**
 * רינדור תפריט פעולות
 * @param {Object} trade - טרייד
 * @returns {string} HTML של התפריט
 */
function renderActionsMenu(trade) {
  const actions = [];

  // עריכה
  actions.push(`
    <button class="btn btn-sm btn-outline-primary" onclick="window.TradesUI.showEditTradeModal(${trade.id})" title="עריכה">
      <i class="fas fa-edit"></i>
    </button>
  `);

  // סגירה (רק אם פתוח)
  if (trade.status === 'open') {
    actions.push(`
      <button class="btn btn-sm btn-outline-warning" onclick="window.TradesUI.showCloseTradeModal(${trade.id})" title="סגירה">
        <i class="fas fa-times"></i>
      </button>
    `);
  }

  // העתקה
  actions.push(`
    <button class="btn btn-sm btn-outline-info" onclick="window.TradesData.copyTrade(${trade.id})" title="העתקה">
      <i class="fas fa-copy"></i>
    </button>
  `);

  // מחיקה
  actions.push(`
    <button class="btn btn-sm btn-outline-danger" onclick="window.TradesData.deleteTrade(${trade.id})" title="מחיקה">
      <i class="fas fa-trash"></i>
    </button>
  `);

  // פריטים מקושרים
  actions.push(`
    <button class="btn btn-sm btn-outline-secondary" onclick="window.viewLinkedItemsForTrade(${trade.id})" title="פריטים מקושרים">
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
 * פתיחת מודל הוספת טרייד
 * @returns {Promise<void>}
 */
async function showAddTradeModal() {
  try {
    // ניקוי הטופס
    const form = document.getElementById('addTradeForm');
    if (form) {
      form.reset();
    }

    // טעינת טיקרים
    if (typeof window.SelectPopulatorService?.populateTickersSelect === 'function') {
      await window.SelectPopulatorService.populateTickersSelect('addTradeTickerId', {
        includeEmpty: true,
        filterFn: (ticker) => ticker.status === 'open' || ticker.status === 'closed'
      });
    }

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('addTradeModal'));
    modal.show();

    console.log('✅ Add trade modal opened');
  } catch (error) {
    console.error('❌ Error opening add trade modal:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל הוספת טרייד');
    }
  }
}

/**
 * פתיחת מודל עריכת טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @returns {Promise<void>}
 */
async function showEditTradeModal(tradeId) {
  try {
    // טעינת נתוני הטרייד
    const trade = await window.TradesData.getTradeDetails(tradeId);
    
    if (!trade) {
      throw new Error('טרייד לא נמצא');
    }

    // מילוי הטופס
    fillEditForm(trade);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('editTradeModal'));
    modal.show();

    console.log('✅ Edit trade modal opened for trade:', tradeId);
  } catch (error) {
    console.error('❌ Error opening edit trade modal:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל עריכת טרייד');
    }
  }
}

/**
 * פתיחת מודל סגירת טרייד
 * @param {number} tradeId - מזהה הטרייד
 * @returns {Promise<void>}
 */
async function showCloseTradeModal(tradeId) {
  try {
    // טעינת נתוני הטרייד
    const trade = await window.TradesData.getTradeDetails(tradeId);
    
    if (!trade) {
      throw new Error('טרייד לא נמצא');
    }

    // מילוי הטופס
    fillCloseForm(trade);

    // הצגת המודל
    const modal = new bootstrap.Modal(document.getElementById('closeTradeModal'));
    modal.show();

    console.log('✅ Close trade modal opened for trade:', tradeId);
  } catch (error) {
    console.error('❌ Error opening close trade modal:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל סגירת טרייד');
    }
  }
}

/**
 * מילוי טופס עריכה
 * @param {Object} trade - טרייד
 */
function fillEditForm(trade) {
  // מילוי שדות הטופס
  const fields = {
    'editTradeId': trade.id,
    'editTradeTickerId': trade.ticker_id || '',
    'editTradeType': trade.trade_type || '',
    'editTradeQuantity': trade.quantity || '',
    'editTradeEntryPrice': trade.entry_price || '',
    'editTradeCurrentPrice': trade.current_price || '',
    'editTradeStopLoss': trade.stop_loss || '',
    'editTradeTakeProfit': trade.take_profit || '',
    'editTradeNotes': trade.notes || ''
  };

  Object.entries(fields).forEach(([fieldId, value]) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = value;
    }
  });
}

/**
 * מילוי טופס סגירה
 * @param {Object} trade - טרייד
 */
function fillCloseForm(trade) {
  // מילוי שדות הטופס
  const fields = {
    'closeTradeId': trade.id,
    'closeTradeExitPrice': trade.current_price || trade.entry_price || '',
    'closeTradeNotes': ''
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
 * @param {Array} trades - רשימת טריידים
 */
function updateSummaryStats(trades) {
  if (!trades || !Array.isArray(trades)) {
    return;
  }

  const stats = window.TradesBusiness.calculateTotalProfitLoss(trades);
  const successRate = window.TradesBusiness.calculateSuccessRate(trades);
  const avgDuration = window.TradesBusiness.calculateAverageTradeDuration(trades);

  // עדכון אלמנטי הסטטיסטיקה
  const elements = {
    'totalTradesCount': trades.length,
    'openTradesCount': trades.filter(t => t.status === 'open').length,
    'closedTradesCount': trades.filter(t => t.status === 'closed').length,
    'totalProfit': stats.totalProfit,
    'totalLoss': stats.totalLoss,
    'netResult': stats.netResult,
    'successRate': successRate,
    'avgDuration': avgDuration
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
  console.log('🔄 Initializing Trades UI...');
  
  // הוספת מאזינים לאירועים
  setupEventListeners();
  
  console.log('✅ Trades UI initialized');
}

/**
 * הגדרת מאזיני אירועים
 */
function setupEventListeners() {
  // מאזין למיון טבלה
  const tableHeaders = document.querySelectorAll('#tradesTable th[data-sortable]');
  tableHeaders.forEach((header, index) => {
    header.addEventListener('click', () => handleTableSort(index));
  });
}

/**
 * טיפול במיון טבלה
 * @param {number} columnIndex - אינדקס עמודה
 */
function handleTableSort(columnIndex) {
  if (typeof window.sortTableData === 'function') {
    window.sortTableData('tradesTable', columnIndex);
  } else {
    console.error('❌ sortTableData function not available');
  }
}

// ייצוא המודול
window.TradesUI = {
  updateTradesTable,
  renderTableRow,
  renderEmptyState,
  renderTradeTypeBadge,
  renderStatusBadge,
  renderProfitLoss,
  renderProfitLossPercentage,
  renderActionsMenu,
  showAddTradeModal,
  showEditTradeModal,
  showCloseTradeModal,
  fillEditForm,
  fillCloseForm,
  closeModal,
  showLoading,
  hideLoading,
  updateSummaryStats,
  initialize,
  setupEventListeners,
  handleTableSort
};

console.log('✅ Trades UI module loaded');
