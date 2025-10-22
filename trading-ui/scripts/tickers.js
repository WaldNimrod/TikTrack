// ===== קובץ JavaScript לדף טיקרים =====

/**
 * עריכת טיקר קיים
 * @param {number} tickerId - מזהה הטיקר
 */
function editTicker(tickerId) {
  try {
    console.log('✏️ עורך טיקר:', tickerId);
    
    // חיפוש הטיקר בנתונים
    const ticker = window.tickersData.find(t => t.id === tickerId);
    if (!ticker) {
      throw new Error('טיקר לא נמצא');
    }
    
    // פתיחת מודל עריכה עם נתוני הטיקר
    showAddTickerModal(ticker);
    
  } catch (error) {
    console.error('שגיאה בעריכת טיקר:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעריכת טיקר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בעריכת טיקר');
    }
  }
}

/**
 * צפייה בפרטי טיקר
 * מציג חלון עם פרטים מפורטים של הטיקר
 * @param {number} tickerId - מזהה הטיקר
 */
function viewTickerDetails(tickerId) {
  try {
    console.log('👁️ מציג פרטי טיקר:', tickerId);
    
    // חיפוש הטיקר בנתונים
    const ticker = window.tickersData.find(t => t.id === tickerId);
    if (!ticker) {
      throw new Error('טיקר לא נמצא');
    }
    
    // יצירת תוכן פרטי הטיקר
    const detailsContent = `
      <div class="ticker-details">
        <h5>פרטי טיקר</h5>
        <div class="row">
          <div class="col-md-6">
            <p><strong>סמל:</strong> ${ticker.symbol || 'לא ידוע'}</p>
            <p><strong>שם:</strong> ${ticker.name || 'לא ידוע'}</p>
            <p><strong>סוג:</strong> ${ticker.type || 'לא ידוע'}</p>
          </div>
          <div class="col-md-6">
            <p><strong>מחיר:</strong> ${ticker.price || '0'}</p>
            <p><strong>שינוי:</strong> ${ticker.change || '0'}</p>
            <p><strong>אחוז שינוי:</strong> ${ticker.change_percent || '0%'}</p>
          </div>
        </div>
        ${ticker.description ? `<p><strong>תיאור:</strong> ${ticker.description}</p>` : ''}
      </div>
    `;
    
    // הצגת מודל עם הפרטים
    if (typeof window.showModalNotification === 'function') {
      window.showModalNotification('פרטי טיקר', detailsContent, 'info');
    } else {
      // fallback - הצגה בחלון alert
      alert(`פרטי טיקר:\n\n` +
        `סמל: ${ticker.symbol || 'לא ידוע'}\n` +
        `שם: ${ticker.name || 'לא ידוע'}\n` +
        `סוג: ${ticker.type || 'לא ידוע'}\n` +
        `מחיר: ${ticker.price || '0'}\n` +
        `שינוי: ${ticker.change || '0'}\n` +
        `אחוז שינוי: ${ticker.change_percent || '0%'}` +
        (ticker.description ? `\nתיאור: ${ticker.description}` : ''));
    }
    
  } catch (error) {
    console.error('שגיאה בהצגת פרטי טיקר:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי טיקר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי טיקר');
    }
  }
}

/**
 * רענון נתוני טיקר
 * טוען מחדש את נתוני הטיקר מהשרת
 * @param {number} tickerId - מזהה הטיקר
 */
function refreshTickerData(tickerId) {
  try {
    console.log('🔄 מרענן נתוני טיקר:', tickerId);
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showInfoNotification('מרענן נתוני טיקר...');
    }
    
    // שליחה לשרת לרענון נתוני הטיקר
    fetch('/api/tickers/' + tickerId + '/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה ברענון נתוני טיקר');
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ נתוני טיקר רוענו:', data);
      
      // רענון הטבלה
      loadTickersData();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('נתוני טיקר רוענו בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showSuccessNotification('נתוני טיקר רוענו בהצלחה');
      }
    })
    .catch(error => {
      console.error('שגיאה ברענון נתוני טיקר:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה ברענון נתוני טיקר', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showErrorNotification('שגיאה ברענון נתוני טיקר');
      }
    });
    
  } catch (error) {
    console.error('שגיאה ברענון נתוני טיקר:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון נתוני טיקר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון נתוני טיקר');
    }
  }
}
/*
 * Tickers.js - Tickers Page Management
 * ====================================
 *
 * This file contains all tickers management functionality for the TikTrack application.
 * It handles tickers CRUD operations, table updates, and user interactions.
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)
 * - notification-system.js (for linked items warnings)
 * - linked-items.js (for linked items modal display)
 *
 * Table Mapping:
 * - Uses 'tickers' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * Linked Items Integration:
 * - Delete operations trigger linked items warning via notification-system.js
 * - Advanced modal display handled by linked-items.js
 * - Color-coded badges and responsive design
 *
 * File: trading-ui/scripts/tickers.js
 * Version: 1.9.9
 * Last Updated: August 26, 2025
 */

// משתנים גלובליים

if (!window.tickersData) {
  window.tickersData = [];

}
if (!window.currenciesData) {
  window.currenciesData = [];

}
if (!window.currenciesLoaded) {
  window.currenciesLoaded = false;

}
let tickersData = window.tickersData;


// מפת צבעים לסוגי טיקרים
const tickerTypeColors = {
  'stock': { bg: '#e3f2fd', text: '#1976d2', label: 'מניה' },
  'etf': { bg: '#f3e5f5', text: '#7b1fa2', label: 'ETF' },
  'bond': { bg: '#e8f5e8', text: '#388e3c', label: 'אג"ח' },
  'crypto': { bg: '#fff3e0', text: '#f57c00', label: 'קריפטו' },
  'forex': { bg: '#fce4ec', text: '#c2185b', label: 'מטבע חוץ' },
  'commodity': { bg: '#f1f8e9', text: '#689f38', label: 'סחורה' },
  'other': { bg: '#fafafa', text: '#616161', label: 'אחר' },
};

/**
 * טעינת נתוני מטבעות מהשרת
 */
async function loadCurrenciesData() {
  try {
    const response = await fetch('/api/currencies/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.currenciesData = data.data || data;
    window.currenciesLoaded = true;

  } catch (error) {
    handleApiError(error, 'טעינת מטבעות');
    window.currenciesData = [];
    window.currenciesLoaded = false;
  }
}

/**
 * קבלת סמל מטבע לפי מזהה
 */
function getCurrencySymbol(currencyId) {
  if (!window.currenciesData || !window.currenciesLoaded) {
    return currencyId || 'N/A';
  }

  const currency = window.currenciesData.find(c => c.id === currencyId);
  return currency ? currency.symbol : currencyId || 'N/A';
}


/**
 * חישוב משך הזמן שעבר מתאריך נתון - פורמט אחיד מלא
 */
function getTimeDuration(dateString) {
  if (!dateString) return 'N/A';
  
  const now = new Date();
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'N/A';
  
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // פורמט אחיד: ימים:שעות:דקות
  return `${diffDays.toString().padStart(2, '0')}:${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
}

/**
 * קבלת עיצוב סוג טיקר
 */
function getTickerTypeStyle(type) {
  const typeConfig = tickerTypeColors[type] || tickerTypeColors['other'];
  return {
    backgroundColor: typeConfig.bg,
    color: typeConfig.text,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block',
    textAlign: 'center',
  };
}

/**
 * קבלת עיצוב סטטוס טיקר
 */
function getTickerStatusStyle(status) {
  const statusConfig = {
    'open': { bg: '#e8f5e8', text: '#388e3c' },
    'closed': { bg: '#fff3cd', text: '#856404' },
    'cancelled': { bg: '#ffebee', text: '#d32f2f' },
  };

  const config = statusConfig[status] || statusConfig['open'];
  return {
    backgroundColor: config.bg,
    color: config.text,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'inline-block',
    textAlign: 'center',
  };
}

/**
 * קבלת תווית סטטוס טיקר
 */
function getTickerStatusLabel(status) {
  const labels = {
    'open': 'פתוח',
    'closed': 'סגור',
    'cancelled': 'מבוטל',
  };
  return labels[status] || 'פתוח';
}

/**
 * פונקציה ליצירת אפשרויות מטבע בטופס
 */
function generateTickerCurrencyOptions(ticker = null) {
  let options = '';

  // בדיקה אם יש נתוני מטבעות
  if (window.currenciesData && window.currenciesData.length > 0) {
    window.currenciesData.forEach(currency => {
      // בדיקה אם המטבע נבחר לטיקר הנוכחי
      const isSelected = ticker && (
        ticker.currency_id === currency.id ||
                ticker.currency && ticker.currency.symbol === currency.symbol ||
                ticker.currency === currency.symbol
      );

      options += `<option value="${currency.id}" ${isSelected ? 'selected' : ''}>${currency.name} (${currency.symbol})</option>`;
    });
  } else {
    // fallback - רק דולר אמריקאי אם אין נתונים
    const isSelected = ticker && (
      ticker.currency_id === 1 ||
            ticker.currency && ticker.currency.symbol === 'USD' ||
            ticker.currency === 'USD'
    );
    options = `<option value="1" ${isSelected ? 'selected' : ''}>דולר אמריקאי (USD)</option>`;
  }

  return options;
}

/**
 * פונקציה לעדכון אפשרויות מטבע בטופס
 */
function updateCurrencyOptions(ticker = null) {
  const addSelect = document.getElementById('addTickerCurrency');
  const editSelect = document.getElementById('editTickerCurrency');

  if (addSelect) {
    const addOptions = generateTickerCurrencyOptions();
    addSelect.innerHTML = '<option value="">בחר מטבע...</option>' + addOptions;
  }

  if (editSelect) {
    const editOptions = generateTickerCurrencyOptions(ticker);
    editSelect.innerHTML = '<option value="">בחר מטבע...</option>' + editOptions;
  }
}

// פונקציה לעדכון שדה active_trades לפי טריידים פתוחים
async function updateActiveTradesField() {
  // Updating active_trades field for tickers

  try {
    // טעינת טריידים מהשרת
    const tradesResponse = await fetch('/api/trades/');
    if (!tradesResponse.ok) {
      // console.warn('⚠️ Could not load trades for active_trades update');
      return;
    }

    const tradesData = await tradesResponse.json();

    const trades = tradesData.data || tradesData;

    // יצירת מפה של טיקרים עם טריידים פתוחים
    const tickersWithOpenTrades = new Set();
    trades.forEach(trade => {
      if (trade.status === 'open' && trade.ticker_id) {
        tickersWithOpenTrades.add(trade.ticker_id);
      }
    });

    // עדכון שדה active_trades בטיקרים בזיכרון
    (window.tickersData || []).forEach(ticker => {
      const hasOpenTrades = tickersWithOpenTrades.has(ticker.id);
      ticker.active_trades = hasOpenTrades;
    });

    // עדכון סטטיסטיקות סיכום לאחר עדכון שדה active_trades
    // הסרת הקריאה הכפולה - updateTickersSummaryStats נקראת ב-loadTickersData
    // updateTickersSummaryStats(tickersData);

  } catch (error) {
    handleSystemError(error, 'עדכון שדה active_trades');
  }
}

/**
 * עדכון אוטומטי של שדה active_trades לטיקר ספציפי
 */
async function updateTickerActiveTradesStatus(tickerId) {
  try {
    const response = await fetch(`/api/tickers/${tickerId}/update-active-trades`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      await response.json(); // result not used

      // רענון הנתונים
      await loadTickersData();
    } else {
      handleApiError('שגיאה בעדכון שדה active_trades לטיקר', response.status);
    }
  } catch (error) {
    handleSystemError(error, 'עדכון שדה active_trades לטיקר');
  }
}

/**
 * עדכון אוטומטי של כל שדות active_trades
 */
async function updateAllActiveTradesStatuses() {
  try {
    const response = await fetch('/api/tickers/update-all-active-trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      await response.json(); // result not used

      // רענון הנתונים
      await loadTickersData();
    } else {
      handleApiError('שגיאה בעדכון כל שדות active_trades', response.status);
    }
  } catch (error) {
    handleSystemError(error, 'עדכון כל שדות active_trades');
  }
}

// פונקציה לשחזור מצב הסגירה - שימוש בפונקציות הגלובליות
function restoreTickersSectionState() {
  // שחזור מצב הסקשן העליון
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    // console.warn('⚠️ restoreAllSectionStates function not available globally');
  }

  // שחזור מצב הסקשנים הפנימיים
  if (typeof window.restoreSectionStates === 'function') {
    window.restoreSectionStates();
  } else {
    // console.warn('⚠️ restoreSectionStates function not available globally');
  }
}

// פונקציות נוספות

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות


// פונקציות נוספות

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת טיקר
 */
async function showAddTickerModal() {
  // הצגת מודל הוספת טיקר

  // טעינת מטבעות עם ברירת מחדל מהעדפות
  await SelectPopulatorService.populateCurrenciesSelect('addTickerCurrency', {
    includeEmpty: true,
    emptyText: 'בחר מטבע',
    defaultFromPreferences: true
  });

  // ניקוי הטופס
  document.getElementById('addTickerForm').reset();

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('addTickerForm');
  }

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('addTickerModal'), {
    backdrop: true,
    keyboard: true,
  });
  modal.show();
}

/**
 * הצגת מודל עריכת טיקר
 */
function showEditTickerModal(id) {
  // הצגת מודל עריכת טיקר

  // מציאת הטיקר לפי ID
  const ticker = tickersData.find(t => t.id === id);
  if (!ticker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא', 6000, 'system');
    }
    return;
  }

  // עדכון אפשרויות מטבע לפני מילוי הטופס
  updateCurrencyOptions(ticker);

  // ניקוי וולידציה
  if (window.clearValidation) {
    window.clearValidation('editTickerForm');
  }

  // מילוי הטופס
  document.getElementById('editTickerId').value = ticker.id;
  document.getElementById('editTickerSymbol').value = ticker.symbol;
  document.getElementById('editTickerName').value = ticker.name;
  document.getElementById('editTickerType').value = ticker.type;

  // עדכון מטבע - תמיכה במערכת החדשה
  const currencySelect = document.getElementById('editTickerCurrency');
  if (currencySelect) {
    if (ticker.currency_id) {
      currencySelect.value = ticker.currency_id;
    }
  }

  // עדכון סטטוס - המרה ל"לא מבוטל" או "מבוטל"
  const statusSelect = document.getElementById('editTickerStatus');
  if (statusSelect) {
    if (ticker.status === 'cancelled') {
      statusSelect.value = 'cancelled';
    } else {
      statusSelect.value = 'not_cancelled';
    }
  }

  document.getElementById('editTickerRemarks').value = ticker.remarks || '';

  // ניקוי שגיאות ולידציה
  if (window.clearValidation) {
    window.clearValidation('editTickerForm');
  }

  // הצגת המודל
  const modal = new bootstrap.Modal(document.getElementById('editTickerModal'), {
    backdrop: true,
    keyboard: true,
  });
  modal.show();
}

/**
 * מחיקת טיקר - wrapper לפונקציה showDeleteTickerModal
 */
function deleteTicker(id) {

  showDeleteTickerModal(id);
}

/**
 * הצגת מודל מחיקת טיקר
 */
function showDeleteTickerModal(id) {


  // מציאת הטיקר לפי ID
  const ticker = (window.tickersData || []).find(t => t.id === id);
  if (!ticker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא', 6000, 'system');
    }
    return;
  }

  // שימוש במערכת האזהרות המרכזית
  if (window.showDeleteWarning) {
    window.showDeleteWarning('ticker', `${ticker.symbol} - ${ticker.name}`, 'טיקר',
      () => confirmDeleteTicker(ticker.id), // onConfirm callback
      () => {}, // onCancel callback
    );
  } else {
    handleFunctionNotFound('showDeleteWarning', 'פונקציית הצגת אזהרת מחיקה לא נמצאה');
    // fallback - הצגת המודל הישן
    const modal = new bootstrap.Modal(document.getElementById('deleteTickerModal'));
    modal.show();
  }
}

// ========================================
// פונקציות ולידציה
// ========================================

/**
 * וולידציה מקיפה של טופס טיקר
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */


// ========================================
// פונקציות שמירה ועדכון
// ========================================

/**
 * שמירת טיקר חדש
 *
 * Note: updated_at field is NOT set during creation - it's reserved for future pricing system updates
 */
async function saveTicker() {

  // איסוף נתונים מהטופס באמצעות DataCollectionService
  const tickerData = DataCollectionService.collectFormData({
    symbol: { id: 'addTickerSymbol', type: 'text' },
    name: { id: 'addTickerName', type: 'text' },
    type: { id: 'addTickerType', type: 'text' },
    currency_id: { id: 'addTickerCurrency', type: 'int' },
    remarks: { id: 'addTickerRemarks', type: 'text' },
    status: { id: 'addTickerStatus', type: 'text', default: 'closed' }
  });

  const symbol = tickerData.symbol.trim().toUpperCase();
  const name = tickerData.name.trim();
  const type = tickerData.type;
  const currency_id = tickerData.currency_id;
  const remarks = tickerData.remarks.trim();

  // ולידציה גלובלית
  if (window.validateForm) {
    if (!window.validateForm('addTickerForm')) {
      return;
    }
  }

  // בדיקה אם הסמל כבר קיים במערכת
  const existingTicker = (window.tickersData || []).find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
  if (existingTicker) {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאת וולידציה',
        `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`,
      );
    }
    return;
  }

  // טיקר חדש תמיד יהיה "closed" (אין לו טריידים)
  const finalStatus = 'closed';

  try {
    const tickerPayload = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    const response = await fetch('/api/tickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleSaveResponse(response, {
      modalId: 'addTickerModal',
      successMessage: `טיקר ${symbol} נוסף בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'שמירת טיקר');
  }
}

/**
 * עדכון טיקר קיים
 *
 * כולל ולידציה של פריטים מקושרים באמצעות המערכת הכללית:
 * - API: /api/linked-items/ticker/{id}
 * - פונקציה: window.showLinkedItemsWarning('ticker', id)
 * - מונע ביטול כאשר יש פריטים פתוחים
 *
 * Note: updated_at field is NOT modified during user updates - it's reserved for future pricing system updates
 */
async function updateTicker() {

  // שימוש ב-DataCollectionService לאיסוף נתונים
  const tickerData = DataCollectionService.collectFormData({
    id: { id: 'editTickerId', type: 'text' },
    symbol: { id: 'editTickerSymbol', type: 'text' },
    name: { id: 'editTickerName', type: 'text' },
    type: { id: 'editTickerType', type: 'text' },
    currency_id: { id: 'editTickerCurrency', type: 'int' },
    status: { id: 'editTickerStatus', type: 'text' },
    remarks: { id: 'editTickerRemarks', type: 'text' }
  });

  const { id, symbol, name, type, currency_id, status, remarks } = tickerData;

  // ולידציה גלובלית
  if (window.validateForm) {
    if (!window.validateForm('editTickerForm')) {
      return;
    }
  }

  // בדיקה אם הסמל כבר קיים בטיקרים אחרים (לא בטיקר הנוכחי)
  const existingTicker = (window.tickersData || []).find(t =>
    t.symbol.toUpperCase() === symbol.toUpperCase() &&
        t.id !== id,
  );
  if (existingTicker) {
    if (window.showErrorNotification) {
      window.showErrorNotification(
        'שגיאת וולידציה',
        `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`,
      );
    }
    return;
  }

  // טיפול בסטטוס "לא מבוטל" - צריך לקבוע אם זה "open" או "closed"
  let finalStatus = status;
  if (status === 'not_cancelled') {
    // בדיקה אם יש טריידים או תכנונים פתוחים לטיקר זה
    const ticker = (window.tickersData || []).find(t => t.id === id);
    if (ticker) {
      // אם יש טריידים או תכנונים פתוחים - סטטוס "open", אחרת "closed"
      finalStatus = ticker.active_trades ? 'open' : 'closed';
    } else {
      finalStatus = 'closed'; // ברירת מחדל
    }
  }

  // בדיקה אם הסטטוס השתנה ל"מבוטל" - אם כן, בדוק פריטים מקושרים
  const originalTicker = tickersData.find(t => t.id === id);
  if (originalTicker && status === 'cancelled' && originalTicker.status !== 'cancelled') {

    // בדיקת פריטים מקושרים באמצעות המערכת הכללית
    try {

      // שימוש ב-API הכללי לקבלת פריטים מקושרים
      const response = await fetch(`/api/linked-items/ticker/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const linkedItemsData = await response.json();

      // בדיקה אם יש פריטים פתוחים שמונעים ביטול
      const openTrades = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity =>
        entity.type === 'trade' && entity.status === 'open',
      ) : [];
      const openPlans = linkedItemsData.child_entities ? linkedItemsData.child_entities.filter(entity =>
        entity.type === 'trade_plan' && entity.status === 'open',
      ) : [];

      const hasOpenTrades = openTrades.length > 0;
      const hasOpenPlans = openPlans.length > 0;

      if (hasOpenTrades || hasOpenPlans) {

        // שימוש במערכת הכללית להצגת פריטים מקושרים
        if (window.showLinkedItemsModal) {
          // טעינת נתוני פריטים מקושרים
          try {
            const response = await fetch(`/api/linked-items/ticker/${id}`);
            if (response.ok) {
              const data = await response.json();
              window.showLinkedItemsModal(data, 'ticker', id);
            } else {
              throw new Error('Failed to load linked items data');
            }
          } catch (error) {
            handleApiError(error, 'פריטים מקושרים');
          }
        } else {
          handleFunctionNotFound('showLinkedItemsModal', 'פונקציית בדיקת פריטים מקושרים לא זמינה');
          // Fallback - הצגת הודעת אזהרה
          if (window.showWarningNotification) {
            window.showWarningNotification(
              'לא ניתן לבטל טיקר',
              `לא ניתן לבטל את הטיקר ${originalTicker.symbol} כי יש לו טריידים או תכנונים פתוחים. יש לסגור אותם קודם.`,
            );
          }
        }
        return; // לא ממשיכים עם העדכון
      }

    } catch (error) {
      handleSystemError(error, 'בדיקת פריטים מקושרים בעדכון');
      if (window.showErrorNotification) {
        window.showErrorNotification(
          'שגיאה בבדיקה',
          'שגיאה בבדיקת פריטים מקושרים. לא ניתן לבטל את הטיקר.',
        );
      }
      return; // לא ממשיכים עם העדכון
    }
  }

  try {
    const tickerPayload = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    const response = await fetch(`/api/tickers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerPayload),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editTickerModal',
      successMessage: `טיקר ${symbol} עודכן בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון טיקר');
  }
}

/**
 * ביטול טיקר
 */
async function cancelTicker(id) {


  try {
    // קבלת פרטי הטיקר לצורך הודעת האישור
    let tickerDetails = '';
    try {
      const response = await fetch(`/api/tickers/${id}`);
      if (response.ok) {
        const tickerData = await response.json();
        const ticker = tickerData.data;
        tickerDetails = `\n\nפרטי הטיקר:\n• סימבול: ${ticker.symbol || 'לא מוגדר'}\n• שם: ${ticker.name || 'לא מוגדר'}\n• סטטוס: ${ticker.status || 'לא מוגדר'}`;
      }
    } catch {
      // console.warn('לא ניתן לטעון פרטי טיקר:', error);
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול טיקר',
        `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancelTicker(id);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
        'danger', // צבע אדום לחלון האישור
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`,
            () => resolve(true),
            () => resolve(false),
            'ביטול טיקר',
            'בטל',
            'חזור'
          );
        }) : 
        window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`);
      if (!confirmed) {
        return;
      }
      await checkLinkedItemsAndCancelTicker(id);
    }

  } catch (error) {
    handleSystemError(error, 'ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול טיקר
 */
async function checkLinkedItemsAndCancelTicker(tickerId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני ביטול
    if (typeof window.checkLinkedItemsBeforeCancelTicker === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeCancelTicker(tickerId);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // אין מקושרים - ביצוע הביטול
    await performTickerCancellation(tickerId);

  } catch (error) {
    handleSystemError(error, 'בדיקת מקושרים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * ביצוע הביטול בפועל
 */
async function performTickerCancellation(tickerId) {
  try {
    // שליחה לשרת
    const response = await fetch(`/api/tickers/${tickerId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'ביטול',
      itemName: 'הטיקר',
      successMessage: 'הטיקר בוטל בהצלחה',
      onSuccess: () => {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'cancelled');
        }
      }
    });

    if (!handled) {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לטריידים פעילים
        if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('active trades')) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsModal) {
            try {
              const response = await fetch(`/api/linked-items/ticker/${tickerId}`);
              if (response.ok) {
                const data = await response.json();
                window.showLinkedItemsModal(data, 'ticker', tickerId);
              } else {
                throw new Error('Failed to load linked items data');
              }
            } catch (error) {
              handleApiError(error, 'פריטים מקושרים');
            }
          } else {
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה בביטול', 'לא ניתן לבטל טיקר זה - יש טריידים פעילים מקושרים אליו');
            }
          }
          return;
        }

        // בדיקה אם הטיקר כבר מבוטל
        if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('already cancelled')) {

          if (window.showErrorNotification) {
            window.showErrorNotification('מידע', 'הטיקר כבר מבוטל');
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
    }
  }
}

/**
 * בדיקת פריטים מקושרים לפני מחיקת טיקר
 */
async function checkLinkedItemsBeforeDeleteTicker(tickerId) {
  try {
    const response = await fetch(`/api/linked-items/ticker/${tickerId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם המחיקה
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // Not used

    // בדיקה רק אם יש פריטים שמקושרים אל הטיקר (child entities)
    // parent entities הם פריטים שהטיקר מקושר אליהם (חשבון) - לא רלוונטי למחיקה
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        // הוספת פרטי הטיקר לנתונים
        linkedItemsData.tickerSymbol = getTickerSymbol(tickerId);
        window.showLinkedItemsModal(linkedItemsData, 'ticker', tickerId, 'delete');
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('יש פריטים מקושרים לטיקר זה', 'warning', 'אזהרה', 5000, 'business');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

/**
 * בדיקת פריטים מקושרים לפני ביטול טיקר
 */
async function checkLinkedItemsBeforeCancelTicker(tickerId) {
  try {
    const response = await fetch(`/api/linked-items/ticker/${tickerId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם הביטול
      return false;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    // const parentEntities = linkedItemsData.parent_entities || []; // Not used

    // בדיקה רק אם יש פריטים שמקושרים אל הטיקר (child entities)
    // parent entities הם פריטים שהטיקר מקושר אליהם (חשבון) - לא רלוונטי לביטול
    if (childEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        // הוספת פרטי הטיקר לנתונים
        linkedItemsData.tickerSymbol = getTickerSymbol(tickerId);
        window.showLinkedItemsModal(linkedItemsData, 'ticker', tickerId);
        return true;
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('יש פריטים מקושרים לטיקר זה', 'warning', 'אזהרה', 5000, 'business');
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    handleSystemError(error, 'בדיקת פריטים מקושרים');
    return false;
  }
}

/**
 * קבלת סימבול הטיקר לפי ID
 */
function getTickerSymbol(tickerId) {
  // נסה למצוא בטיקרים שכבר נטענו
  if (window.tickersData) {
    const ticker = window.tickersData.find(t => t.id === tickerId);
    if (ticker) {
      return ticker.symbol;
    }
  }
  return `טיקר ${tickerId}`;
}

/**
 * עדכון כל הסטטוסים של טיקרים
 */
async function updateAllTickerStatuses() {


  try {
    const response = await fetch('/api/tickers/update-all-statuses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'עדכון',
      itemName: 'סטטוסי כל הטיקרים',
      successMessage: 'סטטוסים של כל הטיקרים עודכנו בהצלחה'
    });

    if (!handled) {
      const errorResponse = await response.text();
      handleApiError('שגיאה בעדכון סטטוסים', errorResponse);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
      }
    }

  } catch (error) {
    handleSystemError(error, 'עדכון סטטוסים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון סטטוסים של טיקרים');
    }
  }
}

// Function removed - not used anywhere

/**
 * ביצוע ביטול טיקר
 */
async function performCancelTicker(id) {


  // מציאת פרטי הטיקר
  const ticker = (window.tickersData || []).find(t => t.id === id);
  if (!ticker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא', 6000, 'system');
    }
    return;
  }

  try {
    const response = await fetch(`/api/tickers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });

    if (response.ok) {
      await response.json(); // result not used


      // הצגת הודעת הצלחה עם פרטי הטיקר
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', `הטיקר ${ticker.symbol} - ${ticker.name} בוטל בהצלחה`);
      }

      // רענון הנתונים
      if (typeof loadTickersData === 'function') {
        // אנחנו בעמוד tickers
        // ניקוי מטמון לפני רענון
        if (typeof window.clearTickersCache === 'function') {
          window.clearTickersCache();
        }
        await loadTickersData();
        // עדכון שדה active_trades רק בעמוד tickers
        await updateActiveTradesField();
      } else {
        // רענון כללי או קריאה למערכת callback
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'cancelled');
        } else {
          location.reload();
        }
      }

    } else if (response.status === 404) {
      // הטיקר כבר לא קיים בבסיס הנתונים - נסיר אותו מהמטמון ונרענן
      console.warn(`טיקר ${id} כבר לא קיים בבסיס הנתונים, מרענן נתונים`);
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מידע', `הטיקר כבר לא קיים במערכת - מרענן נתונים`);
      }

      // רענון הנתונים כמו במקרה של הצלחה
      if (typeof loadTickersData === 'function') {
        // ניקוי מטמון לפני רענון
        if (typeof window.clearTickersCache === 'function') {
          window.clearTickersCache();
        }
        await loadTickersData();
        await updateActiveTradesField();
      } else {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(id, 'cancelled');
        } else {
          location.reload();
        }
      }
    } else {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם הטיקר כבר מבוטל
        if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('already cancelled')) {

          if (window.showErrorNotification) {
            window.showErrorNotification('מידע', 'הטיקר כבר מבוטל');
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה בביטול טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול הטיקר');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביטול טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול טיקר');
    }
  }
}

/**
 * הפעלה מחדש של טיקר מבוטל
 *
 * @param {string|number} tickerId - מזהה הטיקר
 */
async function reactivateTicker(tickerId) {
  try {

    // מציאת הטיקר בנתונים
    const ticker = (window.tickersData || []).find(t => t.id === tickerId);
    if (!ticker) {
      handleElementNotFound('reactivateTicker', `טיקר לא נמצא: ${tickerId}`);
      throw new Error('טיקר לא נמצא');
    }

    const response = await fetch(`/api/tickers/${tickerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'שיחזור',
      itemName: 'הטיקר',
      successMessage: 'טיקר הופעל מחדש בהצלחה!',
      onSuccess: () => {
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'open');
        }
      }
    });

    if (!handled) {
      // fallback במקרה של שגיאה לא צפויה
      location.reload();
    }

  } catch (error) {
    handleSystemError(error, 'הפעלה מחדש של טיקר');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש');
    }
  }
}

// הפונקציה הוסרה - קיימת כבר בשורה 417

/**
 * בדיקת מקושרים וביצוע מחיקת טיקר
 */
async function checkLinkedItemsAndDeleteTicker(tickerId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני מחיקה
    if (typeof window.checkLinkedItemsBeforeDeleteTicker === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeDeleteTicker(tickerId);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // אין מקושרים - ביצוע המחיקה
    await performTickerDeletion(tickerId);

  } catch (error) {
    handleSystemError(error, 'בדיקת מקושרים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

/**
 * ביצוע המחיקה בפועל
 */
async function performTickerDeletion(tickerId) {
  try {
    // שליחה לשרת
    const response = await fetch(`/api/tickers/${tickerId}`, {
      method: 'DELETE',
    });

    // השתמש במערכת הגלובלית החדשה
    const handled = await window.handleApiResponseWithRefresh(response, {
      loadDataFunction: window.loadTickersData,
      updateActiveFieldsFunction: window.updateActiveTradesField,
      operationName: 'מחיקה',
      itemName: 'הטיקר',
      successMessage: 'הטיקר נמחק בהצלחה',
      onSuccess: () => {
        if (typeof window.onTickerDeleted === 'function') {
          window.onTickerDeleted(tickerId);
        }
      }
    });

    if (!handled) {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לפריטים מקושרים
        if (errorData.error && errorData.error.message &&
                    (errorData.error.message.includes('linked items') ||
                        errorData.error.message.includes('Cannot delete ticker with linked items'))) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsModal) {
            try {
              const response = await fetch(`/api/linked-items/ticker/${tickerId}`);
              if (response.ok) {
                const data = await response.json();
                window.showLinkedItemsModal(data, 'ticker', tickerId);
              } else {
                throw new Error('Failed to load linked items data');
              }
            } catch (error) {
              handleApiError(error, 'פריטים מקושרים');
            }
          } else {
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק טיקר זה - יש פריטים מקושרים אליו');
            }
          }
          return;
        }

        // שגיאה אחרת
        handleApiError('שגיאה במחיקת טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה במחיקת טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת הטיקר');
        }
      }
    }

  } catch (error) {
    handleSystemError(error, 'ביצוע מחיקת טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת הטיקר');
    }
  }
}

/**
 * אישור מחיקת טיקר (לשמירה על תאימות לאחור)
 */
async function confirmDeleteTicker(id) {


  // מציאת הטיקר לפני מחיקה כדי להציג פרטים בהודעה
  const ticker = (window.tickersData || []).find(t => t.id === id);
  const tickerInfo = ticker ? `${ticker.symbol} - ${ticker.name}` : `טיקר ${id}`;

  try {
    const response = await fetch(`/api/tickers/${id}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: `טיקר ${tickerInfo} נמחק בהצלחה!`,
      apiUrl: '/api/tickers/',
      entityName: 'טיקר'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
  }
}

// ========================================
// פונקציות מודל פריטים מקושרים
// ========================================


// ========================================
// פונקציות עזר
// ========================================

/**
 * הצגת הודעה
 */


/**
 * ניקוי מטמון הטיקרים
 */
function clearTickersCache() {
  window.tickersData = [];
  tickersData = [];
  console.log('🗑️ מטמון הטיקרים נוקה');
}

/**
 * טעינת נתוני טיקרים - גרסה פשוטה
 */
async function loadTickersData() {
  try {
    // ניקוי מטמון לפני טעינה
    clearTickersCache();
    
    // טעינת מטבעות אם עוד לא נטענו
    if (!window.currenciesLoaded) {
      await loadCurrenciesData();
    }

    const response = await fetch(`/api/tickers/?_t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // שמירת הנתונים
    tickersData = data.data || data;
    window.tickersData = tickersData;

    // עדכון שדה active_trades
    await updateActiveTradesField();

    // עדכון הטבלה (אחרי עדכון active_trades)
    updateTickersTable(tickersData);

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(tickersData);


  } catch (error) {
    handleApiError(error, 'טעינת נתוני טיקרים');

  }

  // יישום צבעי ישות על כותרות אחרי טעינת הנתונים
  if (window.applyEntityColorsToHeaders) {
    window.applyEntityColorsToHeaders('ticker');
  }
}

/**
 * עדכון סטטיסטיקות סיכום טיקרים
 */
function updateTickersSummaryStats(tickers) {

  try {
    // בדיקה אם האלמנטים קיימים בדף הנוכחי
    const totalTickersElement = document.getElementById('totalTickers');
    const activeTickersElement = document.getElementById('activeTickers');
    const averagePriceElement = document.getElementById('averagePrice');
    const dailyChangeElement = document.getElementById('dailyChange');

    // אם האלמנטים לא קיימים, הפונקציה לא רלוונטית לדף זה
    if (!totalTickersElement || !activeTickersElement || !averagePriceElement || !dailyChangeElement) {
      return;
    }

    if (!tickers || tickers.length === 0) {
      // אם אין נתונים, אפס את כל השדות
      totalTickersElement.textContent = '0';
      activeTickersElement.textContent = '0';
      averagePriceElement.textContent = '$0';
      dailyChangeElement.textContent = '0%';
      return;
    }

    // חישוב סטטיסטיקות
    const totalTickers = tickers.length;
    
    // ספירת טיקרים פעילים (פתוחים)
    const activeTickers = tickers.filter(ticker => ticker.status === 'open').length;
    
    // חישוב מחיר ממוצע
    const validPrices = tickers
      .map(ticker => ticker.current_price)
      .filter(price => price && price !== 'N/A' && !isNaN(parseFloat(price)))
      .map(price => parseFloat(price));
    
    const averagePrice = validPrices.length > 0 ? 
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length : 0;
    
    // חישוב שינוי יומי ממוצע
    const validChanges = tickers
      .map(ticker => ticker.change_percent)
      .filter(change => change && change !== 'N/A' && !isNaN(parseFloat(change)))
      .map(change => parseFloat(change));
    
    const averageChange = validChanges.length > 0 ? 
      validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length : 0;

    // חישוב תאריכי עדכון נתונים חיצוניים
    const validExternalDates = tickers
      .map(ticker => ticker.yahoo_updated_at)
      .filter(date => date)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));

    let latestUpdate = 'אין נתונים';
    let oldestUpdate = 'אין נתונים';

    if (validExternalDates.length > 0) {
      const latest = new Date(Math.max(...validExternalDates));
      const oldest = new Date(Math.min(...validExternalDates));

      const latestDuration = getTimeDuration(latest.toISOString());
      const oldestDuration = getTimeDuration(oldest.toISOString());

      latestUpdate = `${latest.toLocaleString('he-IL')} (${latestDuration})`;
      oldestUpdate = `${oldest.toLocaleString('he-IL')} (${oldestDuration})`;
    }

    // עדכון השדות ב-HTML
    totalTickersElement.textContent = totalTickers;
    activeTickersElement.textContent = activeTickers;
    averagePriceElement.textContent = `$${averagePrice.toFixed(2)}`;
    dailyChangeElement.textContent = `${averageChange >= 0 ? '+' : ''}${averageChange.toFixed(2)}%`;


  } catch (error) {
    handleSystemError(error, 'עדכון סטטיסטיקות סיכום');
  }
}


/**
 * עדכון טבלת טיקרים - גרסה פשוטה
 */
function updateTickersTable(tickers) {
  try {
    // מציאת ה-tbody
    let tbody = document.querySelector('table[data-table-type="tickers"] tbody');

    if (!tbody) {
      const container = document.getElementById('tickersContainer');
      if (container) {
        tbody = container.querySelector('tbody');
      }
    }

    if (!tbody) {
      handleElementNotFound('updateTickersTable', 'אלמנט tbody לא נמצא');
      return;
    }

    // בדיקה אם יש נתונים
    if (!tickers || tickers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center">לא נמצאו טיקרים</td></tr>';
      return;
    }

    // יצירת שורות עם עיצוב משופר
    const tableRows = tickers.map(ticker => {

      // קבלת סמל מטבע
      const currencySymbol = getCurrencySymbol(ticker.currency_id);

      // קבלת עיצוב סוג טיקר
      const typeStyle = getTickerTypeStyle(ticker.type);
      const typeLabel = tickerTypeColors[ticker.type]?.label || ticker.type || 'N/A';

      // קבלת עיצוב סטטוס
      const statusStyle = getTickerStatusStyle(ticker.status);
      const statusLabel = getTickerStatusLabel(ticker.status);

      // נתוני מחירים מהשירות החיצוני
      const currentPrice = ticker.current_price || 'N/A';
      const changePercent = ticker.change_percent || 0;
      const volume = ticker.volume || 'N/A';
      const updatedAtDisplay = ticker.yahoo_updated_at || 'N/A';
      
      // לוגים לדיבוג
      if (ticker.symbol === 'AAPL') {
        console.log(`🔍 Debug AAPL:`, {
          current_price: ticker.current_price,
          change_percent: ticker.change_percent,
          volume: ticker.volume,
          yahoo_updated_at: ticker.yahoo_updated_at
        });
      }

      // עיצוב שינוי אחוזים
      const changeColor = changePercent >= 0 ? '#28a745' : '#dc3545';
      const changeSign = changePercent >= 0 ? '+' : '';
      const changeDisplay = (changePercent !== 'N/A' && changePercent !== null && changePercent !== undefined) ?
        `${changeSign}${changePercent.toFixed(2)}%` : 'N/A';
      
      // עיגול מחיר לעד 2 ספרות אחרי הנקודה
      const formattedPrice = (currentPrice !== 'N/A' && currentPrice !== null && currentPrice !== undefined) ?
        `$${parseFloat(currentPrice).toFixed(2)}` : 'N/A';

      return `
                <tr>
                    <td title="${ticker.symbol || 'N/A'}">
                        <span class="ticker-symbol-link" 
                              onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker', ${ticker.id}); } else { console.error('פונקציה showEntityDetails לא קיימת'); }" 
                              title="לחץ לצפייה בפרטי הטיקר">
                            <strong>${ticker.symbol || 'N/A'}</strong>
                        </span>
                    </td>
                    <td title="${formattedPrice !== 'N/A' ? `מחיר נוכחי: ${formattedPrice}` : 'אין נתוני מחיר'}" style="color: ${changeColor}; font-weight: bold; text-align: center; direction: ltr;">${formattedPrice}</td>
                    <td title="${changeDisplay !== 'N/A' ? `שינוי יומי: ${changeDisplay}` : 'אין נתוני שינוי'}" style="color: ${changeColor}; font-weight: bold; text-align: center; direction: ltr;">${changeDisplay}</td>
                    <td title="${volume !== 'N/A' ? `נפח: ${volume}` : 'אין נתוני נפח'}" style="text-align: center; direction: ltr;">${window.renderVolume ? window.renderVolume(volume, true) : volume}</td>
                    <td title="${statusLabel}">
                        <span style="background-color: ${statusStyle.backgroundColor}; 
                                     color: ${statusStyle.color}; 
                                     padding: ${statusStyle.padding}; 
                                     border-radius: ${statusStyle.borderRadius}; 
                                     font-size: ${statusStyle.fontSize}; 
                                     font-weight: ${statusStyle.fontWeight}; 
                                     display: ${statusStyle.display}; 
                                     text-align: ${statusStyle.textAlign};">
                            ${statusLabel}
                        </span>
                    </td>
                    <td title="${typeLabel}">
                        <span style="background-color: ${typeStyle.backgroundColor}; 
                                     color: ${typeStyle.color}; 
                                     padding: ${typeStyle.padding}; 
                                     border-radius: ${typeStyle.borderRadius}; 
                                     font-size: ${typeStyle.fontSize}; 
                                     font-weight: ${typeStyle.fontWeight}; 
                                     display: ${typeStyle.display}; 
                                     text-align: ${typeStyle.textAlign};">
                            ${typeLabel}
                        </span>
                    </td>
                    <td title="${ticker.name || 'N/A'}">${ticker.name || 'N/A'}</td>
                    <td title="${ticker.currency_id ? `מטבע: ${getCurrencySymbol(ticker.currency_id)}` : 'אין נתוני מטבע'}" style="text-align: center;">
                        ${window.renderCurrency ? window.renderCurrency(ticker.currency_id, ticker.currency_name, getCurrencySymbol(ticker.currency_id)) : getCurrencySymbol(ticker.currency_id)}
                    </td>
                    <td title="${ticker.yahoo_updated_at ? `עודכן: ${new Date(ticker.yahoo_updated_at).toLocaleString('he-IL')}` : 'אין נתוני עדכון'}" style="text-align: center;">
                        ${ticker.yahoo_updated_at ? (window.formatShortDate ? window.formatShortDate(ticker.yahoo_updated_at) : new Date(ticker.yahoo_updated_at).toLocaleDateString('he-IL')) + ' ' + (window.formatTimeOnly ? window.formatTimeOnly(ticker.yahoo_updated_at) : new Date(ticker.yahoo_updated_at).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})) : 'N/A'}
                    </td>
                    <td class="actions-cell">
                        ${window.createActionsMenu ? window.createActionsMenu([
                          { type: 'VIEW', onclick: `window.showEntityDetails('ticker', ${ticker.id}, { mode: 'view' })`, title: 'צפה בפרטי טיקר' },
                          { type: 'LINK', onclick: `viewLinkedItemsForTicker(${ticker.id})`, title: 'פריטים מקושרים' },
                          { type: 'EDIT', onclick: `editTicker(${ticker.id})`, title: 'ערוך' },
                          { type: ticker.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `window.${ticker.status === 'cancelled' ? 'reactivate' : 'cancel'}Ticker(${ticker.id})`, title: ticker.status === 'cancelled' ? 'הפעל מחדש טיקר' : 'בטל טיקר' }
                        ]) : `
                        <div class="btn-group btn-group-sm" role="group">
                            <button data-button-type="VIEW" data-variant="small" 
                                    data-onclick="window.showEntityDetails('ticker', ${ticker.id}, { mode: 'view' })" 
                                    data-text="" title="צפה בפרטי טיקר"></button>
                            <button data-button-type="LINK" data-variant="small" 
                                    data-onclick="viewLinkedItemsForTicker(${ticker.id})" 
                                    data-text="" title="פריטים מקושרים"></button>
                            <button data-button-type="EDIT" data-variant="small" 
                                    data-onclick="editTicker(${ticker.id})" 
                                    data-text="" title="ערוך"></button>
                            ${ticker.status === 'cancelled' ?
    `<button data-button-type="REACTIVATE" data-variant="small" 
             data-onclick="window.reactivateTicker(${ticker.id})" 
             data-text="" title="הפעל מחדש טיקר"></button>` :
    `<button data-button-type="CANCEL" data-variant="small" 
             data-onclick="window.cancelTicker(${ticker.id})" 
             data-text="" title="בטל טיקר"></button>`
                            }
                        </div>
                        `}
                    </td>
                </tr>
            `;
    });

    // עדכון הטבלה עם כפיית רענון DOM
    const finalHTML = tableRows.join('');
    tbody.innerHTML = '';  // ניקוי מלא
    tbody.innerHTML = finalHTML;  // הוספת התוכן החדש
    
    // כפיית reflow של הדפדפן
    tbody.offsetHeight;

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${tickers.length} טיקרים`;
    }
    
    console.log(`📊 טבלת טיקרים עודכנה עם ${tickers.length} פריטים`);

    // סידור ברירת מחדל לפי העמודה הראשונה (סמל) - רק אם אין סידור קיים
    if (typeof window.applyDefaultSort === 'function') {
      window.applyDefaultSort('tickers', tickers, updateTickersTable);
    }

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(tickers);

  } catch (error) {
    handleSystemError(error, 'עדכון טבלת טיקרים');
  }
}


// הגדרת הפונקציות כגלובליות
window.updateActiveTradesField = updateActiveTradesField;
window.updateTickerActiveTradesStatus = updateTickerActiveTradesStatus;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.deleteTicker = deleteTicker;
window.cancelTicker = cancelTicker;
window.performCancelTicker = performCancelTicker;
window.updateAllTickerStatuses = updateAllTickerStatuses;
// window.toggleSection removed - using global version from ui-utils.js
window.toggleTickersSection = toggleTickersSection;
window.restoreTickersSectionState = restoreTickersSectionState;
window.clearTickersCache = clearTickersCache;

// פונקציות נתונים חיצוניים
window.refreshYahooFinanceData = refreshYahooFinanceData;
window.refreshYahooFinanceDataSilently = refreshYahooFinanceDataSilently;

// פונקציות מודלים
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.showDeleteTickerModal = showDeleteTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;

// פונקציות חדשות לביטול טיקר
window.checkLinkedItemsAndCancelTicker = checkLinkedItemsAndCancelTicker;
window.checkLinkedItemsBeforeCancelTicker = checkLinkedItemsBeforeCancelTicker;
window.performTickerCancellation = performTickerCancellation;
window.getTickerSymbol = getTickerSymbol;

// פונקציות חדשות למחיקת טיקר
window.deleteTicker = deleteTicker;
window.checkLinkedItemsAndDeleteTicker = checkLinkedItemsAndDeleteTicker;
window.checkLinkedItemsBeforeDeleteTicker = checkLinkedItemsBeforeDeleteTicker;
window.performTickerDeletion = performTickerDeletion;

// ===== פונקציות סידור =====

/**
 * פונקציה לסידור טבלת טיקרים
 * @param {number} columnIndex - אינדקס העמודה לסידור
 *
 * דוגמאות שימוש:
 * sortTable(0); // סידור לפי עמודת סימבול
 * sortTable(1); // סידור לפי עמודת שם
 * sortTable(2); // סידור לפי עמודת סוג
 *
 * @requires window.sortTableData - פונקציה גלובלית מ-main.js
 */

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
// restoreSortState - using global function from page-utils.js

// הגדרת הפונקציות כגלובליות
// window.sortTable export removed - using global version from tables.js
window.updateTickersTable = updateTickersTable;
window.updateTickersSummaryStats = updateTickersSummaryStats;
window.loadCurrenciesData = loadCurrenciesData;
window.getCurrencySymbol = getCurrencySymbol;
window.getTickerTypeStyle = getTickerTypeStyle;
window.getTickerStatusStyle = getTickerStatusStyle;
window.getTickerStatusLabel = getTickerStatusLabel;
window.generateTickerCurrencyOptions = generateTickerCurrencyOptions;
window.updateCurrencyOptions = updateCurrencyOptions;

// פונקציות ביטול טיקר - גלובליות
window.cancelTicker = cancelTicker;
window.checkLinkedItemsAndCancelTicker = checkLinkedItemsAndCancelTicker;
window.performTickerCancellation = performTickerCancellation;
window.checkLinkedItemsBeforeCancelTicker = checkLinkedItemsBeforeCancelTicker;
window.getTickerSymbol = getTickerSymbol;
window.reactivateTicker = reactivateTicker;

/**
 * טעינת צבעים מההעדפות ויישום על הכותרות
 */
async function loadColorsAndApplyToHeaders() {
  try {
    // ✨ טעינת העדפות ספציפיות לעמוד tickers
    const relevantPreferenceKeys = ['entityTickerColor', 'primaryColor', 'secondaryColor', 'theme', 'language'];
    
    if (window.loadSpecificPreferences) {
      const specificPreferences = await window.loadSpecificPreferences(relevantPreferenceKeys, 1, null);
      console.log('✅ Loaded specific preferences for tickers:', Object.keys(specificPreferences));
      
      // Apply only the loaded preferences
      if (window.loadAllColorsFromPreferences && specificPreferences) {
        window.loadAllColorsFromPreferences(specificPreferences);
      }
    } else if (window.loadPreferences) {
      // Fallback to loading all preferences
      await window.loadPreferences(1, null);
      console.log('🔄 Loaded all preferences for tickers (fallback)');
      
      // Filter to only relevant preferences
      if (window.currentPreferences) {
        const relevantPreferences = {};
        relevantPreferenceKeys.forEach(key => {
          if (window.currentPreferences[key] !== undefined) {
            relevantPreferences[key] = window.currentPreferences[key];
          }
        });
        
        if (window.loadAllColorsFromPreferences) {
          window.loadAllColorsFromPreferences(relevantPreferences);
        }
      }
    }

    // יישום צבעי ישות על כותרות
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('ticker');
    }
  } catch (error) {
    console.error('שגיאה בטעינת צבעים:', error);
  }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// אתחול הדף
// document.addEventListener('DOMContentLoaded', function () {
//   // שחזור מצב הסגירה
//   restoreTickersSectionState();

  // טעינת צבעים מההעדפות לפני יישום על הכותרות
  loadColorsAndApplyToHeaders();

  // אתחול וולידציה - שימוש בפונקציות הגלובליות
  if (window.initializeValidation) {
    // שימוש בוולידציה הגלובלית ללא כללים מותאמים
    window.initializeValidation('addTickerForm', {});
    window.initializeValidation('editTickerForm', {});
  }

  // שחזור מצב סידור
  restoreSortState();

  // טעינת נתוני טיקרים
  loadTickersData();
// });

// אתחול נוסף כשהדף נטען לחלוטין
window.addEventListener('load', function () {

  // בדיקה אם אנחנו בדף טיקרים
  const isTickersPage = window.location.pathname.includes('tickers') ||
                         document.querySelector('table[data-table-type="tickers"]') ||
                         document.getElementById('tickersContainer');

  if (!isTickersPage) {
    return;
  }

  // טעינת נתונים עם ניסיונות חוזרים
  let attempts = 0;
  const maxAttempts = 10;

  function tryLoadData() {

    // בדיקה מפורטת יותר

    const tbody = document.querySelector('table[data-table-type="tickers"] tbody') ||
                     document.getElementById('tickersContainer')?.querySelector('tbody');

    if (tbody) {
      // נמצא tbody, טוען נתונים
      // קורא ל-loadTickersData
      loadTickersData();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(tryLoadData, 500);
    } else {
      handleElementNotFound('tryLoadData', 'לא הצלחתי למצוא את הטבלה אחרי 10 ניסיונות');
      // מנסה לטעון נתונים בכל מקרה
      loadTickersData();
    }
  }

  // קורא ל-tryLoadData
  tryLoadData();
});

// ===== Yahoo Finance Integration =====

/**
 * רענון נתוני מחירים חיצוניים לכל הטיקרים
 * משתמש בשירות האחיד שעובד עם כל הספקים
 */
async function refreshYahooFinanceData() {
  try {
    // קבלת כל הטיקרים מהמערכת (כולל מבוטלים)
    if (!window.tickersData || window.tickersData.length === 0) {
      await loadTickersData();
    }

    // שימוש בשירות האחיד לקבלת נתונים
    const externalDataService = window.ExternalDataService;
    if (!externalDataService) {
      throw new Error('External Data Service not available');
    }

    // קבלת נתוני מחירים לכל הטיקרים (כולל מבוטלים)
    const externalData = await externalDataService.refreshTickersData(window.tickersData, 'yahooRefreshBtn');

    if (externalData) {
      // עדכון הנתונים הגלובליים והטבלה (כולל מבוטלים)
      window.tickersData = externalDataService.updateTickersWithExternalData(window.tickersData, externalData);
      updateTickersTable(window.tickersData);
      
      // עדכון סטטיסטיקות סיכום
      updateTickersSummaryStats(window.tickersData);
    }

  } catch (error) {
    console.error('Error refreshing external data:', error);
  }
}

// Function moved to external-data-service.js for reusability across pages

/**
 * רענון נתוני מחירים חיצוניים ללא הודעות (לטעינה אוטומטית)
 * משתמש בשירות האחיד שעובד עם כל הספקים
 */
async function refreshYahooFinanceDataSilently() {
  try {
    // קבלת כל הטיקרים מהמערכת
    if (!window.tickersData || window.tickersData.length === 0) {
      return;
    }

    // שימוש בשירות האחיד לקבלת נתונים
    const externalDataService = window.ExternalDataService;
    if (!externalDataService) {
      console.warn('External Data Service not available for silent refresh');
      return;
    }

    // קבלת נתוני מחירים בשקט
    const externalData = await externalDataService.refreshTickersDataSilently(window.tickersData);

    if (externalData) {
      // עדכון הנתונים הגלובליים (ללא הודעות)
      window.tickersData = externalDataService.updateTickersWithExternalData(window.tickersData, externalData);
      console.log('📈 External data updated silently:', externalData);
    } else {
      console.warn('📈 No external data received for silent refresh');
    }

  } catch (error) {
    console.warn('Silent external data refresh failed:', error.message);
  }
}

// פונקציה לפילטר טיקרים לפי סוג (פילטר פשוט - סוג אחד בלבד)
function filterTickersByType(type) {
  console.log(`🔍 Filtering tickers by type: ${type}`);
  
  // עדכון מצב הכפתורים - רק אחד פעיל בכל פעם
  const buttons = document.querySelectorAll('.ticker-type-filter [data-type]');
  buttons.forEach(btn => {
    const btnType = btn.getAttribute('data-type');
    if (btnType === type) {
      // כפתור פעיל
      btn.classList.add('active');
      if (btnType === 'all') {
        // כפתור איפוס - עיצוב מיוחד
        btn.classList.remove('btn');
        btn.style.backgroundColor = 'white';
        btn.style.color = '#28a745';
        btn.style.borderColor = '#28a745';
      } else {
        // כפתורים רגילים
        btn.classList.remove('btn');
        btn.style.backgroundColor = 'white';
        btn.style.color = '#28a745';
        btn.style.borderColor = '#28a745';
      }
    } else {
      // כפתורים לא פעילים
      btn.classList.remove('active');
      if (btnType === 'all') {
        // כפתור איפוס - עיצוב ברירת מחדל
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      } else {
        // כפתורים רגילים
        btn.classList.add('btn');
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
    }
  });

  // פילטור הנתונים - סוג אחד בלבד
  let filteredData = [...window.tickersData];
  
  if (type !== 'all') {
    // פילטר לפי סוג ספציפי
    filteredData = filteredData.filter(ticker => ticker.type === type);
  }
  // אם type === 'all', מציג את כל הטיקרים

  // עדכון הטבלה
  if (typeof window.updateTickersTable === 'function') {
    window.updateTickersTable(filteredData);
  }

  // עדכון ספירת הטיקרים
  const countElement = document.querySelector('.table-count');
  if (countElement) {
    const typeText = type === 'all' ? 'כל הטיקרים' : getTypeDisplayName(type);
    countElement.textContent = `${filteredData.length} טיקרים${type !== 'all' ? ` (${typeText})` : ''}`;
  }

  console.log(`🔍 Filtered ${filteredData.length} tickers out of ${window.tickersData.length} for type: ${type}`);
}

// פונקציה עזר לקבלת שם תצוגה לסוג
function getTypeDisplayName(type) {
  const typeNames = {
    'stock': 'מניות',
    'etf': 'ETF',
    'bond': 'אג"ח',
    'crypto': 'קריפטו',
    'forex': 'מטבע חוץ',
    'commodity': 'סחורה',
    'other': 'אחר'
  };
  return typeNames[type] || type;
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// Toggle functions
function toggleSection() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection();
    } else {
        console.warn('toggleSection function not found');
    }
}

function toggleTickersSection() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection('tickers');
    } else {
        console.warn('toggleSection function not found');
    }
}

// Ticker CRUD functions
function saveTicker() {
    if (typeof window.saveTicker === 'function') {
        window.saveTicker();
    } else {
        console.warn('saveTicker function not found');
    }
}

function updateTicker() {
    if (typeof window.updateTicker === 'function') {
        window.updateTicker();
    } else {
        console.warn('updateTicker function not found');
    }
}

function confirmDeleteTicker() {
    if (typeof window.confirmDeleteTicker === 'function') {
        window.confirmDeleteTicker();
    } else {
        console.warn('confirmDeleteTicker function not found');
    }
}

// Yahoo Finance functions
function refreshYahooFinanceData() {
    if (typeof window.refreshYahooFinanceData === 'function') {
        window.refreshYahooFinanceData();
    } else {
        console.warn('refreshYahooFinanceData function not found');
    }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for onclick attributes
// Detailed Log Functions for Tickers Page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'tickers',
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
            tickersStats: {
                totalTickers: document.getElementById('totalTickers')?.textContent || 'לא נמצא',
                activeTickers: document.getElementById('activeTickers')?.textContent || 'לא נמצא',
                latestUpdate: document.getElementById('latestUpdate')?.textContent || 'לא נמצא',
                oldestUpdate: document.getElementById('oldestUpdate')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'טיקרים',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('tickersColorDemo')?.classList.contains('d-none')
                },
                contentSection: {
                    title: 'הטיקרים שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#tickersTable tbody tr').length,
                    tableData: document.querySelector('#tickersContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#tickersTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#tickersTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#tickersTable tbody tr').length > 0
            },
            buttons: {
                yahooRefreshBtn: document.getElementById('yahooRefreshBtn') ? 'זמין' : 'לא זמין',
                addTickerBtn: document.getElementById('addTickerBtn') ? 'זמין' : 'לא זמין'
            },
            modals: {
                addModal: document.getElementById('addTickerModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTickerModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTickerModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddTickerModal: typeof window.showAddTickerModal === 'function' ? 'זמין' : 'לא זמין',
                editTicker: typeof window.editTicker === 'function' ? 'זמין' : 'לא זמין',
                confirmDeleteTicker: typeof window.confirmDeleteTicker === 'function' ? 'זמין' : 'לא זמין',
                refreshYahooFinanceData: typeof window.refreshYahooFinanceData === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleTickersSection: typeof window.toggleTickersSection === 'function' ? 'זמין' : 'לא זמין',
                filterTickersByType: typeof window.filterTickersByType === 'function' ? 'זמין' : 'לא זמין'
            },
            dataStatus: {
                tickersLoaded: window.tickersLoaded || false,
                tickersDataLength: window.tickersData ? window.tickersData.length : 0
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


window.filterTickersByType = filterTickersByType;
window.getTypeDisplayName = getTypeDisplayName;
// window.toggleSection removed - using global version from ui-utils.js
window.toggleTickersSection = toggleTickersSection;
window.showAddTickerModal = showAddTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;
window.refreshYahooFinanceData = refreshYahooFinanceData;
window.editTicker = editTicker;
window.viewTickerDetails = viewTickerDetails;
// window.copyDetailedLog export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local copyDetailedLog function for tickers page
async function copyDetailedLog() {
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
        console.error('שגיאה בהעתקה:', err);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

