/**
 * ========================================
 * טריידים - Trades Management
 * ========================================
 * 
 * קובץ ייעודי לניהול טריידים (trades.js)
 * משמש גם בדף "מעקב" (tracking.html) וגם בדף "דאטאבייס" (database.html)
 * מכיל את כל הפונקציות הספציפיות לטריידים
 * 
 * דפים שמשתמשים בקובץ זה:
 * - tracking.html - דף מעקב טריידים
 * - database.html - דף דאטאבייס (טבלת טריידים)
 * 
 * פונקציות עיקריות:
 * - loadTradesData() - טעינת נתוני טריידים
 * - updateTradesTable() - עדכון טבלת הטריידים
 * - filterTradesData() - פילטור נתוני טריידים
 * - editTradeRecord() - עריכת טרייד
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - showAddTradeModal() - הצגת מודל הוספת טרייד
 * - showEditTradeModal() - הצגת מודל עריכת טרייד
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים לדף המעקב
let tradesData = [];
window.tradesData = tradesData;

/**
 * פונקציה לטעינת נתוני טריידים מהשרת
 */
async function loadTradesData() {
  try {
    console.log('🔄 === LOAD TRADES DATA ===');
    console.log('🔄 Starting to load trades data...');

    // קריאה מה-API
    const response = await fetch('/api/v1/trades/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let apiData = await response.json();

    // בדיקה שהנתונים בפורמט הנכון
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      apiData = apiData.data;
    }

    console.log('📡 נתונים מה-API:', apiData);
    console.log('📡 אורך הנתונים:', apiData ? apiData.length : 'null');

    // עדכון הנתונים המקומיים
    tradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      status: trade.status,
      type: trade.type,
      opened_at: trade.created_at,
      closed_at: trade.closed_at,
      total_pl: trade.total_pl,
      notes: trade.notes
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = tradesData;

    console.log('📊 נתונים מעודכנים:', tradesData.length, 'trades');

    // עדכון ישיר של הטבלה - ללא פילטרים מורכבים
    console.log('🔄 Updating trades table directly with', tradesData.length, 'trades');
    updateTradesTable(tradesData);

  } catch (error) {
    console.error('Error loading trades data:', error);
    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
    }
  }
}

/**
 * פונקציה לפילטור נתוני טריידים - פונקציה פשוטה
 */
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER TRADES DATA (SIMPLE) ===');

  // החזרת כל הנתונים ללא פילטור - כמו בדף database
  const globalTradesData = window.tradesData || [];
  console.log('🔄 Returning all trades without filtering:', globalTradesData.length, 'trades');

  updateTradesTable(globalTradesData);
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
function updateTradesTable(trades) {
  console.log('🔄 === UPDATE TRADES TABLE ===');
  console.log('🔄 Trades to display:', trades ? trades.length : 'null');

  // בדיקה שהנתונים תקינים
  if (!trades || !Array.isArray(trades)) {
    console.error('❌ Invalid trades data:', trades);
    return;
  }

  const tbody = document.querySelector('#tradesTable tbody');
  if (!tbody) {
    console.error('❌ Table body not found - looking for #tradesTable tbody');
    return;
  }
  console.log('✅ Table body found, updating with', trades.length, 'trades');

  const tableHTML = trades.map(trade => {
    const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
    const typeDisplay = getTypeDisplay(trade.type);

    return `
    <tr>
      <td><strong>${trade.account_name || trade.account_id || 'חשבון לא ידוע'}</strong></td>
      <td><strong><a href="#" onclick="viewTickerDetails('${trade.ticker_id}')" class="ticker-link">${trade.ticker_symbol || 'טיקר לא ידוע'}</a></strong></td>
      <td>${trade.trade_plan_id ? `תוכנית ${trade.trade_plan_id}` : '-'}</td>
      <td><span class="status-badge status-${trade.status || 'open'}">${statusDisplay}</span></td>
      <td>${typeDisplay}</td>
      <td>${trade.side || 'Long'}</td>
      <td>${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : ''}</td>
      <td class="${trade.total_pl >= 0 ? 'text-success' : 'text-danger'}">${trade.total_pl ? `$${trade.total_pl.toFixed(2)}` : '$0.00'}</td>
      <td>${trade.notes || ''}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-secondary" onclick="editTradeRecord('${trade.id}')" title="ערוך">✏️</button>
        <button class="btn btn-sm btn-secondary" onclick="cancelTradeRecord('${trade.id}')" title="ביטול">X</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTradeRecord('${trade.id}')" title="מחק">🗑️</button>
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = tableHTML;
  console.log('✅ Table updated successfully');

  // עדכון ספירת רשומות
  const countElement = document.querySelector('.section-header .table-title');
  if (countElement) {
    countElement.textContent = `📋 מעקב טריידים (${trades.length})`;
  }
}

/**
 * פונקציה לתרגום סוג לעברית
 */
function getTypeDisplay(type) {
  const typeMap = {
    'swing': 'סווינג',
    'investment': 'השקעה',
    'passive': 'פאסיבי',
    'buy': 'קנייה',
    'sell': 'מכירה'
  };
  return typeMap[type] || type;
}

/**
 * פונקציות נוספות
 */
function viewTickerDetails(tickerId) {
  console.log('צפייה בפרטי טיקר:', tickerId);
  // כאן יוכנס קוד לצפייה בפרטי טיקר
}

function editTradeRecord(tradeId) {
  console.log('עריכת טרייד:', tradeId);
  // מציאת הטרייד במערך
  const trade = tradesData.find(t => t.id == tradeId);
  if (trade) {
    showEditTradeModal(trade);
  } else {
    console.error('❌ Trade not found:', tradeId);
    alert('טרייד לא נמצא');
  }
}

function cancelTradeRecord(tradeId) {
  console.log('ביטול טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
    // TODO: Implement cancel trade API call
    alert('פונקציית ביטול טרייד תתווסף בקרוב');
  }
}

function deleteTradeRecord(tradeId) {
  console.log('מחיקת טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה?')) {
    // TODO: Implement delete trade API call
    alert('פונקציית מחיקת טרייד תתווסף בקרוב');
  }
}

// פונקציה להצגת מודל עריכת טרייד
function showEditTradeModal(trade) {
  console.log('הצגת מודל עריכת טרייד:', trade);
  // TODO: Implement edit trade modal
  alert(`עריכת טרייד ${trade.id} - ${trade.ticker_symbol} תתווסף בקרוב`);
}

// פונקציה להצגת מודל הוספת טרייד
function showAddTradeModal() {
  console.log('הצגת מודל הוספת טרייד');
  // TODO: Implement add trade modal
  alert('פונקציית הוספת טרייד תתווסף בקרוב');
}

// הגדרת הפונקציה updateGridFromComponent לדף המעקב
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (tracking) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

  // שמירת הפילטרים
  window.selectedStatusesForFilter = selectedStatuses || [];
  window.selectedTypesForFilter = selectedTypes || [];
  window.selectedDateRangeForFilter = selectedDateRange || null;
  window.searchTermForFilter = searchTerm || '';

  // טעינת נתונים מחדש עם הפילטרים החדשים
  if (typeof window.loadTradesData === 'function') {
    console.log('🔄 Calling loadTradesData with new filters');
    window.loadTradesData();
  } else {
    console.error('❌ loadTradesData function not found');
  }
};

// הוספת הפונקציות לגלובל
window.loadTradesData = loadTradesData;
window.updateTradesTable = updateTradesTable;
window.filterTradesData = filterTradesData;
window.viewTickerDetails = viewTickerDetails;
window.editTradeRecord = editTradeRecord;
window.cancelTradeRecord = cancelTradeRecord;
window.deleteTradeRecord = deleteTradeRecord;
window.showAddTradeModal = showAddTradeModal;
window.showEditTradeModal = showEditTradeModal;

// קריאה לטעינת נתונים כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === TRADES.JS DOM CONTENT LOADED ===');
    setTimeout(() => {
      if (typeof window.loadTradesData === 'function') {
        console.log('🔄 Calling loadTradesData from trades.js');
        window.loadTradesData();
      }
    }, 1000);
  });
} else {
  // הדף כבר נטען
  console.log('🔄 === TRADES.JS PAGE ALREADY LOADED ===');
  setTimeout(() => {
    if (typeof window.loadTradesData === 'function') {
      console.log('🔄 Calling loadTradesData from trades.js (already loaded)');
      window.loadTradesData();
    }
  }, 1000);
}
