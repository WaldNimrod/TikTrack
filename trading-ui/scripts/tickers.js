// ===== קובץ JavaScript לדף טיקרים =====

/**
 * עריכת טיקר קיים
 * @param {number} tickerId - מזהה הטיקר
 */
function editTicker(tickerId) {
  try {

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
// tickersData is now managed through window.tickersData only


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
    console.error('❌ שגיאה בטעינת מטבעות:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בטעינת מטבעות', error.message);
    }
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
    console.error('❌ שגיאה בעדכון שדה active_trades:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון שדה active_trades', error.message);
    }
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
    console.error('❌ שגיאה בעדכון שדה active_trades לטיקר:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון שדה active_trades לטיקר', error.message);
    }
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
    console.error('❌ שגיאה בעדכון כל שדות active_trades:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון כל שדות active_trades', error.message);
    }
  }
}

// פונקציה לשחזור מצב הסגירה - שימוש בפונקציות הגלובליות


// פונקציות נוספות

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות


// פונקציות נוספות

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל הוספת טיקר
 */
function showAddTickerModal() {
  // הצגת מודל הוספת טיקר

  // עדכון אפשרויות מטבע לפני הצגת הטופס
  updateCurrencyOptions();

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
  const ticker = (window.tickersData || []).find(t => t.id === id);
  if (!ticker) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
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
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
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
/**
 * ולידציה של טופס הוספת טיקר
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateTickerForm() {
    return window.validateEntityForm('addTickerForm', [
        { 
            id: 'addTickerSymbol', 
            name: 'סימול',
            validation: (value) => {
                if (!/^[A-Z0-9.]+$/.test(value)) return 'סימול יכול להכיל רק אותיות גדולות, מספרים ונקודות';
                if (value.length > 10) return 'סימול לא יכול להיות יותר מ-10 תווים';
                return true;
            }
        },
        { id: 'addTickerName', name: 'שם' },
        { id: 'addTickerType', name: 'סוג' },
        { id: 'addTickerCurrency', name: 'מטבע' }
    ]);
}

/**
 * שמירת טיקר חדש
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function saveTicker() {
  try {
    // 1. ולידציה של הטופס
    if (!validateTickerForm()) {
        return; // עצירה אם הולידציה נכשלה
    }

    // 2. איסוף נתונים מהטופס
    const symbol = document.getElementById('addTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('addTickerName').value.trim();
    const type = document.getElementById('addTickerType').value;
    const currency_id = parseInt(document.getElementById('addTickerCurrency').value);
    const remarks = document.getElementById('addTickerRemarks').value.trim();

    // 3. בדיקה אם הסמל כבר קיים במערכת
    const existingTicker = (window.tickersData || []).find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    if (existingTicker) {
      // שגיאת ולידציה - משתמש הזין סמל קיים
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification(
          'שגיאת ולידציה',
          `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`
        );
      }
      return;
    }

    // 4. טיקר חדש תמיד יהיה "closed" (אין לו טריידים)
    const finalStatus = 'closed';

    // 5. בניית אובייקט נתונים
    const tickerData = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    // 6. שליחה לשרת
    const response = await fetch('/api/tickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerData),
    });

    // 7. טיפול בתגובה
    if (!response.ok) {
      const errorData = await response.json();
      
      // בדיקה אם זו שגיאת ולידציה (HTTP 400)
      if (response.status === 400) {
        // שגיאת ולידציה מהשרת
        let errorMessage = errorData.message || 'נתונים לא תקינים';
        
        // בדיקה מיוחדת ל-UNIQUE constraint
        if (errorMessage.includes('UNIQUE constraint failed: tickers.symbol')) {
          errorMessage = `הסמל ${symbol} כבר קיים במערכת`;
        }
        
        if (typeof window.showSimpleErrorNotification === 'function') {
          window.showSimpleErrorNotification('שגיאת ולידציה', errorMessage);
        }
        return;
      }
      
      // שגיאת מערכת אחרת (500, 404, וכו')
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // 8. הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', `טיקר ${symbol} נוסף בהצלחה למערכת`);
    }

    // 9. סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
    if (modal) {
      modal.hide();
    }

    // 10. רענון הטבלה והשדות הפעילים
    if (typeof window.loadTickersData === 'function') {
      await window.loadTickersData();
    }
    if (typeof window.updateActiveTradesField === 'function') {
      await window.updateActiveTradesField();
    }

  } catch (error) {
    console.error('Error saving ticker:', error);
    
    // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת טיקר', error.message);
    }
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
/**
 * ולידציה של טופס עריכת טיקר
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateEditTickerForm() {
    return window.validateEntityForm('editTickerForm', [
        { 
            id: 'editTickerSymbol', 
            name: 'סימול',
            validation: (value) => {
                if (!/^[A-Z0-9.]+$/.test(value)) return 'סימול יכול להכיל רק אותיות גדולות, מספרים ונקודות';
                if (value.length > 10) return 'סימול לא יכול להיות יותר מ-10 תווים';
                return true;
            }
        },
        { id: 'editTickerName', name: 'שם' },
        { id: 'editTickerType', name: 'סוג' },
        { id: 'editTickerCurrency', name: 'מטבע' }
    ]);
}

/**
 * עדכון טיקר קיים
 * לפי STANDARD_VALIDATION_GUIDE.md + לוגיקה עסקית מיוחדת
 */
async function updateTicker() {
  try {
    // 1. ולידציה של הטופס
    if (!validateEditTickerForm()) {
        return; // עצירה אם הולידציה נכשלה
    }

    // 2. איסוף נתונים מהטופס
    const id = document.getElementById('editTickerId').value;
    const symbol = document.getElementById('editTickerSymbol').value.trim().toUpperCase();
    const name = document.getElementById('editTickerName').value.trim();
    const type = document.getElementById('editTickerType').value;
    const currency_id = parseInt(document.getElementById('editTickerCurrency').value);
    const status = document.getElementById('editTickerStatus').value;
    const remarks = document.getElementById('editTickerRemarks').value.trim();

    // 3. בדיקת כפילות סמל (לוגיקה עסקית)
    const existingTicker = (window.tickersData || []).find(t =>
      t.symbol.toUpperCase() === symbol.toUpperCase() && t.id !== id
    );
    if (existingTicker) {
      // שגיאת ולידציה - משתמש הזין סמל קיים
      if (window.showSimpleErrorNotification) {
        window.showSimpleErrorNotification(
          'שגיאת ולידציה',
          `הסמל ${symbol} כבר קיים במערכת (טיקר: ${existingTicker.name})`
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
  const originalTicker = (window.tickersData || []).find(t => t.id === id);
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
            console.error('❌ שגיאה בפריטים מקושרים:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בפריטים מקושרים', error.message);
            }
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
      console.error('❌ שגיאה בבדיקת פריטים מקושרים בעדכון:', error);
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
    const tickerData = {
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
      body: JSON.stringify(tickerData),
    });

    if (response.ok) {
      await response.json(); // result not used

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
      modal.hide();

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', `טיקר ${symbol} עודכן בהצלחה במערכת`);
      }

      // רענון הנתונים
      await loadTickersData();

      // עדכון שדה active_trades
      await updateActiveTradesField();

    } else if (response.status === 404) {
      // הטיקר כבר לא קיים בבסיס הנתונים - נסיר אותו מהמטמון ונרענן
      console.warn(`טיקר ${id} כבר לא קיים בבסיס הנתונים, מרענן נתונים`);
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מידע', `הטיקר כבר לא קיים במערכת - מרענן נתונים`);
      }

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('editTickerModal'));
      modal.hide();

      // רענון הנתונים כמו במקרה של הצלחה
      await loadTickersData();
      await updateActiveTradesField();
    } else {
      const error = await response.text();
      handleApiError('שגיאה בעדכון טיקר', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון טיקר: ' + error);
      }
    }

  } catch (error) {
    handleSaveError(error, 'עדכון טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון', 'שגיאה בעדכון טיקר');
    }
  }
  } catch (error) {
    console.error('❌ שגיאה כללית בעדכון טיקר:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון', error.message);
    }
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
    console.error('❌ שגיאה בביטול טיקר:', error);
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
    console.error('❌ שגיאה בבדיקת מקושרים:', error);
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
              console.error('❌ שגיאה בפריטים מקושרים:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בפריטים מקושרים', error.message);
            }
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
    console.error('❌ שגיאה בביצוע ביטול טיקר:', error);
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
    console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
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
    console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
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
    console.error('❌ שגיאה בעדכון סטטוסים:', error);
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
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
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
    console.error('❌ שגיאה בביטול טיקר:', error);
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
    console.error('❌ שגיאה בהפעלה מחדש של טיקר:', error);
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
    console.error('❌ שגיאה בבדיקת מקושרים:', error);
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
              console.error('❌ שגיאה בפריטים מקושרים:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בפריטים מקושרים', error.message);
            }
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
    console.error(error, 'ביצוע מחיקת טיקר');
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

    // בדיקה שהמערכת הגלובלית קיימת
    if (!window.handleApiResponseWithRefresh) {
      console.error('❌ המערכת הגלובלית לא נטענה במחיקה! משתמש בקוד הישן');
      // קוד ישן כ-fallback
      if (response.ok) {
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', `טיקר ${tickerInfo} נמחק בהצלחה מהמערכת`);
        }
        await loadTickersData();
        await updateActiveTradesField();
        return;
      } else if (response.status === 404) {
        console.warn(`טיקר ${id} כבר לא קיים בבסיס הנתונים, מרענן נתונים`);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', `טיקר ${tickerInfo} הוסר מהתצוגה (כבר לא קיים במערכת)`);
        }
        await loadTickersData();
        await updateActiveTradesField();
        return;
      }
    } else {
      // השתמש במערכת הגלובלית החדשה

      const handled = await window.handleApiResponseWithRefresh(response, {
        loadDataFunction: window.loadTickersData,
        updateActiveFieldsFunction: window.updateActiveTradesField,
        operationName: 'מחיקה',
        itemName: tickerInfo,
        successMessage: `טיקר ${tickerInfo} נמחק בהצלחה מהמערכת`
      });

      if (handled) {
        return; // המערכת הגלובלית טיפלה בהכל
      }
    }

    // רק אם המערכת הגלובלית לא טיפלה או לא קיימת

    if (!handled) {
      const errorResponse = await response.text();
      handleApiError('שגיאה במחיקת טיקר', errorResponse);

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לפריטים מקושרים

        if (errorData.error && errorData.error.message &&
                    (errorData.error.message.includes('linked items') ||
                        errorData.error.message.includes('Cannot delete ticker with linked items'))) {

          // הצגת אזהרת פריטים מקושרים לפני מחיקה
          try {
            if (window.showLinkedItemsModal) {
              const response = await fetch(`/api/linked-items/ticker/${id}`);
              if (response.ok) {
                const data = await response.json();
                window.showLinkedItemsModal(data, 'ticker', id);
              } else {
                throw new Error('Failed to load linked items data');
              }
            } else {
              handleFunctionNotFound('showLinkedItemsModal', 'פונקציית בדיקת פריטים מקושרים לא נמצאה');
            }
          } catch (error) {
            console.error(error, 'קריאה לפונקציית בדיקת פריטים מקושרים');
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק טיקר זה - יש פריטים מקושרים אליו');
            }
          }
          return;
        }

        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר: ' + errorData.error.message);
        }

      } catch {
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר: ' + errorResponse);
        }
      }
    }

  } catch (error) {
    handleDeleteError(error, 'מחיקת טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת טיקר');
    }
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
 * טעינת נתוני טיקרים - משתמש במערכת הכללית
 * @deprecated Use window.loadTableData() from tables.js instead
 */
async function loadTickersData() {
  try {
    // טעינת מטבעות אם עוד לא נטענו (נדרש לפני טעינת טיקרים)
    if (!window.currenciesLoaded) {
      await loadCurrenciesData();
    }
    
    // שימוש במערכת הכללית לטעינת נתונים
    if (typeof window.loadTableData === 'function') {
      const data = await window.loadTableData('tickers', updateTickersTable);
      
      // שמירת הנתונים הגלובליים
      window.tickersData = data;
      
      // עדכון שדה active_trades
      await updateActiveTradesField();
      
      // עדכון סטטיסטיקות סיכום
      updateTickersSummaryStats(window.tickersData);
      
      return data;
    }
    
    // Fallback למקרה שהמערכת הכללית לא זמינה
    // ניקוי מטמון לפני טעינה
    clearTickersCache();

    const response = await fetch(`/api/tickers/?_t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // שמירת הנתונים
    window.tickersData = data.data || data;

    // עדכון שדה active_trades
    await updateActiveTradesField();

    // עדכון הטבלה (אחרי עדכון active_trades)
    updateTickersTable(window.tickersData);

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(window.tickersData);


  } catch (error) {
    console.error('❌ שגיאה בטעינת נתוני טיקרים:', error);
    if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בטעינת נתוני טיקרים', error.message);
    }

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
    const openTickersElement = document.getElementById('openTickers');
    const closedTickersElement = document.getElementById('closedTickers');

    // אם האלמנטים לא קיימים, הפונקציה לא רלוונטית לדף זה
    if (!totalTickersElement || !activeTickersElement || !openTickersElement || !closedTickersElement) {
      return;
    }

    if (!tickers || tickers.length === 0) {
      // אם אין נתונים, אפס את כל השדות
      totalTickersElement.textContent = '0';
      activeTickersElement.textContent = '0';
      openTickersElement.textContent = '0';
      closedTickersElement.textContent = '0';
      return;
    }

    // חישוב סטטיסטיקות
    const totalTickers = tickers.length;
    
    // ספירת טיקרים לפי סטטוס
    const openTickers = tickers.filter(ticker => ticker.status === 'open').length;
    const closedTickers = tickers.filter(ticker => ticker.status === 'closed').length;
    const cancelledTickers = tickers.filter(ticker => ticker.status === 'cancelled').length;
    
    // סה"כ טיקרים עם טרייד
    const tickersWithTrades = tickers.filter(ticker => ticker.active_trades).length;

    // עדכון השדות ב-HTML
    totalTickersElement.textContent = totalTickers;
    activeTickersElement.textContent = tickersWithTrades;
    openTickersElement.textContent = openTickers;
    closedTickersElement.textContent = closedTickers;

  } catch (error) {
    console.error(error, 'עדכון סטטיסטיקות סיכום');
  }
}


// ===== פונקציות עזר לטבלה =====

/**
 * פורמט מחיר טיקר
 */
function formatTickerPrice(ticker) {
  const currentPrice = ticker.current_price || 'N/A';
  const changePercent = ticker.change_percent || 0;
  
  const changeColor = changePercent >= 0 ? '#28a745' : '#dc3545';
  const formattedPrice = (currentPrice !== 'N/A' && currentPrice !== null && currentPrice !== undefined) ?
    `$${parseFloat(currentPrice).toFixed(2)}` : 'N/A';
  
  return { formattedPrice, changeColor };
}

/**
 * פורמט שינוי אחוזים
 */
function formatTickerChange(ticker) {
  const changePercent = ticker.change_percent || 0;
  const changeColor = changePercent >= 0 ? '#28a745' : '#dc3545';
  const changeSign = changePercent >= 0 ? '+' : '';
  const changeDisplay = (changePercent !== 'N/A' && changePercent !== null && changePercent !== undefined) ?
    `${changeSign}${changePercent.toFixed(2)}%` : 'N/A';
  
  return { changeDisplay, changeColor };
}

/**
 * פורמט זמן עדכון
 */
function formatTickerUpdateTime(ticker) {
  const updatedAtDisplay = ticker.yahoo_updated_at || 'N/A';
  return (updatedAtDisplay !== 'N/A' && updatedAtDisplay !== null && updatedAtDisplay !== undefined) ?
    new Date(updatedAtDisplay).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
}

/**
 * יצירת HTML לכפתורי פעולה
 */
function createTickerActionsHTML(tickerId) {
  return `
    <button class="btn btn-sm btn-outline-info" onclick="viewLinkedItemsForTicker(${tickerId})" title="פריטים מקושרים">
      <i class="bi bi-link-45deg"></i>
    </button>
    <button class="btn btn-sm btn-outline-primary" onclick="editTicker(${tickerId})" title="עריכה">
      <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-sm btn-outline-info" onclick="viewTickerDetails(${tickerId})" title="פרטים">
      <i class="bi bi-eye"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger" onclick="deleteTicker(${tickerId})" title="מחיקה">
      <i class="bi bi-trash"></i>
    </button>
  `;
}

/**
 * יצירת HTML לשורת טיקר
 */
function createTickerRowHTML(ticker) {
  const { formattedPrice, changeColor: priceColor } = formatTickerPrice(ticker);
  const { changeDisplay, changeColor } = formatTickerChange(ticker);
  const formattedUpdatedAt = formatTickerUpdateTime(ticker);
  const statusStyle = getTickerStatusStyle(ticker.status);
  const statusLabel = getTickerStatusLabel(ticker.status);
  
  return `
    <tr>
      <td title="${ticker.name || 'N/A'}">
        <span class="ticker-name-link" 
              onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker', ${ticker.id}); } else { console.error('פונקציה showEntityDetails לא קיימת'); }" 
              title="לחץ לצפייה בפרטי הטיקר">
          <strong>${ticker.name || 'N/A'}</strong>
        </span>
      </td>
      <td title="${formattedPrice !== 'N/A' ? `מחיר נוכחי: ${formattedPrice}` : 'אין נתוני מחיר'}" 
          style="color: ${priceColor}; font-weight: bold; text-align: center; direction: ltr;">
        ${formattedPrice}
      </td>
      <td title="${changeDisplay !== 'N/A' ? `שינוי יומי: ${changeDisplay}` : 'אין נתוני שינוי'}" 
          style="color: ${changeColor}; font-weight: bold; text-align: center; direction: ltr;">
        ${changeDisplay}
      </td>
      <td title="${formattedUpdatedAt !== 'N/A' ? `עדכון אחרון: ${formattedUpdatedAt}` : 'אין נתוני עדכון'}" 
          style="text-align: center; direction: ltr;">
        ${formattedUpdatedAt}
      </td>
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
      <td class="col-actions actions-cell actions-3-btn">
        ${createTickerActionsHTML(ticker.id)}
      </td>
    </tr>
  `;
}

/**
 * עדכון טבלת טיקרים - גרסה מחודשת ומאופטמת
 */
function updateTickersTable(tickers) {
  try {
    // מציאת ה-tbody
    const tbody = document.querySelector('table[data-table-type="tickers"] tbody') ||
                   document.getElementById('tickersContainer')?.querySelector('tbody');

    if (!tbody) {
      handleElementNotFound('updateTickersTable', 'אלמנט tbody לא נמצא');
      return;
    }

    // בדיקה אם יש נתונים
    if (!tickers || tickers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">לא נמצאו טיקרים</td></tr>';
      return;
    }

    // יצירת שורות
    const tableRows = tickers.map(ticker => createTickerRowHTML(ticker));
    
    // עדכון הטבלה
    tbody.innerHTML = tableRows.join('');
    tbody.offsetHeight; // כפיית reflow

    // עדכון ספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${tickers.length} טיקרים`;
    }

    // סידור ברירת מחדל
    if (typeof window.applyDefaultSort === 'function') {
      window.applyDefaultSort('tickers', tickers, updateTickersTable);
    }

    // עדכון סטטיסטיקות סיכום
    updateTickersSummaryStats(tickers);

  } catch (error) {
    console.error(error, 'עדכון טבלת טיקרים');
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

// ===== פונקציות נתונים חיצוניים =====
// פונקציות אלו קוראות ל-ExternalDataService (external-data-service.js)
// המערכת עובדת עם כל ספק נתונים באמצעות הנורמלייזר

/**
 * רענון נתוני מחירים חיצוניים לכל הטיקרים
 * משתמש ב-ExternalDataService שעובד עם כל הספקים (Yahoo, Alpha Vantage, וכו')
 */
async function refreshExternalData() {
  try {
    // טעינת נתונים אם צריך
    if (!window.tickersData || window.tickersData.length === 0) {
      await loadTickersData();
    }

    // שימוש ב-ExternalDataService
    const service = window.ExternalDataService;
    if (!service) {
      throw new Error('External Data Service not available');
    }

    // רענון הנתונים (הנורמלייזר מטפל בהתאמת הספק)
    const externalData = await service.refreshTickersData(window.tickersData);
    
    if (externalData) {
      // עדכון הטבלה
      window.tickersData = service.updateTickersWithExternalData(window.tickersData, externalData);
      updateTickersTable(window.tickersData);
      updateTickersSummaryStats(window.tickersData);
    }
  } catch (error) {
    console.error('Error refreshing external data:', error);
  }
}

/**
 * רענון נתוני מחירים חיצוניים ללא הודעות (לטעינה אוטומטית)
 */
async function refreshExternalDataSilently() {
  try {
    if (!window.tickersData || window.tickersData.length === 0) {
      return;
    }

    const service = window.ExternalDataService;
    if (!service) {
      return;
    }

    const externalData = await service.refreshTickersDataSilently(window.tickersData);
    
    if (externalData) {
      window.tickersData = service.updateTickersWithExternalData(window.tickersData, externalData);
    }
  } catch (error) {
    console.warn('Silent external data refresh failed:', error.message);
  }
}

// ייצוא גלובלי
window.refreshExternalData = refreshExternalData;
window.refreshExternalDataSilently = refreshExternalDataSilently;

// תאימות לאחור (deprecated - להסרה בגרסה הבאה)
window.refreshYahooFinanceData = refreshExternalData;
window.refreshYahooFinanceDataSilently = refreshExternalDataSilently;

// פונקציות מודלים
window.showAddTickerModal = showAddTickerModal;
window.showEditTickerModal = showEditTickerModal;
window.showDeleteTickerModal = showDeleteTickerModal;
window.saveTicker = saveTicker;
window.updateTicker = updateTicker;
window.confirmDeleteTicker = confirmDeleteTicker;

// פונקציות ולידציה סטנדרטיות
window.validateTickerForm = validateTickerForm;
window.validateEditTickerForm = validateEditTickerForm;

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
function restoreSortState() {
  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('tickers', window.tickersData || [], updateTickersTable);
  } else {
    handleFunctionNotFound('restoreAnyTableSort', 'פונקציית שחזור סידור לא נמצאה');
  }
}

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
    // ✨ עדכון לתמיכה במערכת העדפות     // נסה לטעון העדפות  ראשית, ואז fallback
    if (!window.currentPreferences) {
      if (window.preferences && window.preferences.loadPreferences) {
        await window.preferences.loadPreferences();

      } else if (window.loadPreferences) {
        await window.loadPreferences();

      }
    }

    // טעינת צבעים מההעדפות
    if (window.loadAllColorsFromPreferences && window.currentPreferences) {
      window.loadAllColorsFromPreferences(window.currentPreferences);
    }

    // יישום צבעי ישות על כותרות
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('ticker');
    }
  } catch (error) {
    console.error('שגיאה בטעינת צבעים:', error);
  }
}

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // שחזור מצב הסגירה
  restoreTickersSectionState();

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

  // טעינת נתוני טיקרים - מוסר כדי למנוע כפילות עם window.load
  // loadTickersData();
});

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

// פונקציה לפילטר טיקרים לפי סוג (פילטר פשוט - סוג אחד בלבד)
function filterTickersByType(type) {

  // עדכון מצב הכפתורים - רק אחד פעיל בכל פעם
  const buttons = document.querySelectorAll('.ticker-type-filter [data-type]');
  buttons.forEach(btn => {
    const btnType = btn.getAttribute('data-type');
    if (btnType === type) {
      // כפתור פעיל
      btn.classList.add('active');
      if (btnType === 'all') {
        // כפתור איפוס - עיצוב מיוחד
        btn.classList.remove('btn-outline-primary');
        btn.style.backgroundColor = 'white';
        btn.style.color = '#28a745';
        btn.style.borderColor = '#28a745';
      } else {
        // כפתורים רגילים
        btn.classList.remove('btn-outline-primary');
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
        btn.classList.add('btn-outline-primary');
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

