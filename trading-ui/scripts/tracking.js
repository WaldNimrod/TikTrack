/**
 * ========================================
 * דף המעקב - Trades/Tracking Page
 * ========================================
 * 
 * קובץ ייעודי לדף המעקב (tracking.html)
 * מכיל את כל הפונקציות הספציפיות לדף זה
 * 
 * פונקציות עיקריות:
 * - loadTradesData() - טעינת נתוני טריידים
 * - updateTradesTable() - עדכון טבלת הטריידים
 * - filterTradesData() - פילטור נתוני טריידים
 * - פונקציות מיון וסטטיסטיקות
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025
 * ========================================
 */

// משתנים גלובליים לדף המעקב
let tradesData = [];

/**
 * פונקציה לטעינת נתוני טריידים מהשרת
 */
async function loadTradesData() {
  try {
    console.log('🔄 === LOAD TRADES DATA ===');
    
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
    console.log('📡 סוג הנתונים:', typeof apiData);
    console.log('📡 האם זה מערך:', Array.isArray(apiData));
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
      opened_at: trade.created_at, // תאריך יצירת הטרייד
      closed_at: trade.closed_at,
      total_pl: trade.total_pl,
      notes: trade.notes
    }));
    
    console.log('📊 נתונים מעודכנים:', tradesData);
    console.log('📊 אורך tradesData:', tradesData.length);
    console.log('📊 דוגמה לטרייד ראשון:', tradesData[0]);
    
    // קבלת פילטרים שמורים
    const selectedStatuses = window.selectedStatusesForFilter || [];
    const selectedTypes = window.selectedTypesForFilter || [];
    const selectedAccounts = window.selectedAccountsForFilter || [];
    const selectedDateRange = window.selectedDateRangeForFilter || null;
    const searchTerm = window.searchTermForFilter || '';
    
    // ניקוי פילטר חיפוש שגוי
    if (searchTerm === 'ס') {
      window.searchTermForFilter = '';
    }
    
    console.log('🔄 פילטרים שמורים:', {
      selectedStatuses,
      selectedTypes,
      selectedAccounts,
      selectedDateRange,
      searchTerm
    });
    
    console.log('🔄 Saved filters:', { selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm });
    
    // שימוש בפונקציה הגלובלית לפילטור
    if (typeof window.filterDataByFilters === 'function') {
      tradesData = window.filterDataByFilters(tradesData, 'tracking');
    } else {
      console.error('filterDataByFilters function not found');
    }
        
    // עדכון הטבלה
    if (typeof window.updateTradesTable === 'function') {
      window.updateTradesTable(tradesData);
    } else {
      console.error('updateTradesTable function not found');
    }
    
  } catch (error) {
    console.error('Error loading trades data:', error);
    document.querySelector('#tradesTable tbody').innerHTML = '<tr><td colspan="10" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
  }
}

/**
 * פונקציה לפילטור נתוני טריידים
 */
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER TRADES DATA ===');
  console.log('🔄 Selected statuses:', selectedStatuses);
  console.log('🔄 Selected types:', selectedTypes);
  console.log('🔄 Selected accounts:', selectedAccounts);
  console.log('🔄 Date range:', selectedDateRange);
  console.log('🔄 Search term:', searchTerm);
  
  console.log('🔄 Original tradesData length:', tradesData.length);
  console.log('🔄 Original tradesData:', tradesData);
  let filteredTrades = [...tradesData];
  
  // פילטר לפי סטטוס
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    console.log('🔄 Filtering by status:', selectedStatuses);
    filteredTrades = filteredTrades.filter(trade => {
      const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
      console.log(`🔄 Trade ${trade.id}: status=${trade.status}, display=${statusDisplay}, selected=${selectedStatuses}, match=${selectedStatuses.includes(statusDisplay)}`);
      return selectedStatuses.includes(statusDisplay);
    });
    console.log('🔄 After status filter:', filteredTrades.length, 'trades');
  }
  
  // פילטר לפי סוג
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    console.log('🔄 Filtering by type:', selectedTypes);
    filteredTrades = filteredTrades.filter(trade => {
      // המרת סוגים מאנגלית לעברית
      let typeDisplay;
      switch(trade.type) {
        case 'swing':
          typeDisplay = 'סווינג';
          break;
        case 'investment':
          typeDisplay = 'השקעה';
          break;
        case 'passive':
          typeDisplay = 'פאסיבי';
          break;
        case 'buy':
          typeDisplay = 'קנייה';
          break;
        default:
          typeDisplay = trade.type;
      }
      
      // בדיקה אם הסוג הנבחר מתאים
      const isMatch = selectedTypes.includes(typeDisplay);
      console.log(`🔄 Trade ${trade.id}: type=${trade.type}, display=${typeDisplay}, selected=${selectedTypes}, match=${isMatch}`);
      return isMatch;
    });
    console.log('🔄 After type filter:', filteredTrades.length, 'trades');
  }
  
  // פילטר לפי חשבון
  if (selectedAccounts && selectedAccounts.length > 0 && !selectedAccounts.includes('all')) {
    filteredTrades = filteredTrades.filter(trade => {
      return selectedAccounts.includes(trade.account_name || trade.account_id);
    });
    console.log('🔄 After account filter:', filteredTrades.length, 'trades');
  }
  
  // פילטר לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '' && searchTerm !== 'ס') {
    const searchLower = searchTerm.toLowerCase();
    filteredTrades = filteredTrades.filter(trade => {
      return (
        (trade.account_name && trade.account_name.toLowerCase().includes(searchLower)) ||
        (trade.ticker_symbol && trade.ticker_symbol.toLowerCase().includes(searchLower)) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchLower)) ||
        (trade.trade_plan_id && trade.trade_plan_id.toString().includes(searchLower))
      );
    });
    console.log('🔄 After search filter:', filteredTrades.length, 'trades');
  }
  
  // עדכון הטבלה
  console.log('🔄 === UPDATING TABLE ===');
  console.log('🔄 Filtered trades count:', filteredTrades.length);
  console.log('🔄 First filtered trade:', filteredTrades[0]);
  updateTradesTable(filteredTrades);
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
function updateTradesTable(trades) {
  console.log('🔄 === UPDATE TRADES TABLE ===');
  console.log('🔄 Trades to display:', trades.length);
  console.log('🔄 First trade:', trades[0]);
  
  const tbody = document.querySelector('.main-content table tbody');
  if (!tbody) {
    console.error('Table body not found');
    return;
  }
  
  const tableHTML = trades.map(trade => {
    const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
    
    // המרת סוגים מאנגלית לעברית
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
        <button class="btn btn-sm btn-secondary" onclick="cancelTradeRecord('${trade.id}')" title="ביטול">❌</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTradeRecord('${trade.id}')" title="מחק">🗑️</button>
      </td>
    </tr>
  `;
  }).join('');
  
  tbody.innerHTML = tableHTML;
  
  // עדכון ספירת רשומות
  const countElement = document.querySelector('.main-content .table-count');
  if (countElement) {
    countElement.textContent = `${trades.length} טריידים`;
  }
  
  // עדכון סטטיסטיקות הטבלה
  window.updateTableStats('tracking');
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
  // כאן יוכנס קוד לעריכת טרייד
}

function cancelTradeRecord(tradeId) {
  console.log('ביטול טרייד:', tradeId);
  // כאן יוכנס קוד לביטול טרייד
}

function deleteTradeRecord(tradeId) {
  console.log('מחיקת טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך למחוק את הטרייד?')) {
    // כאן יוכנס קוד למחיקת טרייד
    console.log('טרייד נמחק:', tradeId);
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף המעקב
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  console.log('🔄 === UPDATE GRID FROM COMPONENT (tracking) ===');
  console.log('🔄 Parameters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });
  
  // קריאה לפונקציה הגלובלית
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'tracking');
};

// הוספת הפונקציות לגלובל
window.loadTradesData = loadTradesData;
window.updateTradesTable = updateTradesTable;
window.filterTradesData = filterTradesData;
window.viewTickerDetails = viewTickerDetails;
window.editTradeRecord = editTradeRecord;
window.cancelTradeRecord = cancelTradeRecord;
