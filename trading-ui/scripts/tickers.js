// ===== קובץ JavaScript לדף טיקרים =====
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
    const response = await fetch('/api/v1/currencies/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    window.currenciesData = data.data || data;
    window.currenciesLoaded = true;

  } catch (error) {
    handleDataLoadError(error, 'טעינת מטבעות');
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
    minWidth: '60px',
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
    minWidth: '60px',
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
    const tradesResponse = await fetch('/api/v1/trades/');
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
    const response = await fetch(`/api/v1/tickers/${tickerId}/update-active-trades`, {
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
    const response = await fetch('/api/v1/tickers/update-all-active-trades', {
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
function toggleTopSection() {
  // קריאה לפונקציה הגלובלית מ-main.js
  if (typeof window.toggleTopSectionGlobal === 'function') {
    window.toggleTopSectionGlobal();
  } else {
    handleFunctionNotFound('toggleTopSectionGlobal', 'פונקציית פתיחת סקשן עליון לא נמצאה');
  }
}

function toggleTickersSection() {
  if (typeof window.toggleMainSection === 'function') {
    window.toggleMainSection();
  } else {
    handleFunctionNotFound('toggleMainSection', 'פונקציית פתיחת סקשן ראשי לא נמצאה');
  }
}

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
  const ticker = tickersData.find(t => t.id === id);
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
async function saveTicker() {

  // ולידציה
  const symbol = document.getElementById('addTickerSymbol').value.trim().toUpperCase();
  const name = document.getElementById('addTickerName').value.trim();
  const type = document.getElementById('addTickerType').value;
  const currency_id = parseInt(document.getElementById('addTickerCurrency').value);
  const remarks = document.getElementById('addTickerRemarks').value.trim();

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
    const tickerData = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    const response = await fetch('/api/v1/tickers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickerData),
    });

    if (response.ok) {
      await response.json(); // result not used


      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTickerModal'));
      modal.hide();

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', `טיקר ${symbol} נוסף בהצלחה למערכת`);
      }

      // רענון הנתונים
      await loadTickersData();

      // עדכון שדה active_trades
      await updateActiveTradesField();

    } else {
      const errorText = await response.text();
      handleApiError('שגיאה בשמירת טיקר', errorText);

      // ניסיון לפרסר את השגיאה JSON
      let errorMessage = 'שגיאה בשמירת טיקר';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          // בדיקה אם זו שגיאת UNIQUE constraint
          if (errorData.error.message.includes('UNIQUE constraint failed: tickers.symbol')) {
            errorMessage = 'הסמל כבר קיים במערכת';
          } else {
            errorMessage = errorData.error.message;
          }
        }
      } catch {
        // אם לא ניתן לפרסר JSON, השתמש בטקסט המקורי
        errorMessage = errorText;
      }

      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בשמירה', errorMessage);
      }
    }

  } catch (error) {
    handleSaveError(error, 'שמירת טיקר');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בשמירה', 'שגיאה בשמירת טיקר');
    }
  }
}

/**
 * עדכון טיקר קיים
 *
 * כולל ולידציה של פריטים מקושרים באמצעות המערכת הכללית:
 * - API: /api/v1/linked-items/ticker/{id}
 * - פונקציה: window.showLinkedItemsWarning('ticker', id)
 * - מונע ביטול כאשר יש פריטים פתוחים
 *
 * Note: updated_at field is NOT modified during user updates - it's reserved for future pricing system updates
 */
async function updateTicker() {

  const id = document.getElementById('editTickerId').value;
  const symbol = document.getElementById('editTickerSymbol').value.trim().toUpperCase();
  const name = document.getElementById('editTickerName').value.trim();
  const type = document.getElementById('editTickerType').value;
  const currency_id = parseInt(document.getElementById('editTickerCurrency').value);
  const status = document.getElementById('editTickerStatus').value;
  const remarks = document.getElementById('editTickerRemarks').value.trim();

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
      const response = await fetch(`/api/v1/linked-items/ticker/${id}`);

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
        if (window.showLinkedItemsWarning) {
          window.showLinkedItemsWarning('ticker', id);
        } else {
          handleFunctionNotFound('showLinkedItemsWarning', 'פונקציית בדיקת פריטים מקושרים לא זמינה');
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
    const tickerData = {
      symbol,
      name,
      type,
      currency_id,
      status: finalStatus,
      remarks: remarks || null,
    };

    const response = await fetch(`/api/v1/tickers/${id}`, {
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
}

/**
 * ביטול טיקר
 */
async function cancelTicker(id) {


  try {
    // קבלת פרטי הטיקר לצורך הודעת האישור
    let tickerDetails = '';
    try {
      const response = await fetch(`/api/v1/tickers/${id}`);
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
      if (!window.confirm(`האם אתה בטוח שברצונך לבטל טיקר זה?${tickerDetails}`)) {
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
    const response = await fetch(`/api/v1/tickers/${tickerId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    if (response.ok) {
      await response.json(); // result not used

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'הטיקר בוטל בהצלחה');
      }

      // רענון הנתונים
      if (typeof loadTickersData === 'function') {
        // אנחנו בעמוד tickers
        await loadTickersData();
      } else {
        // רענון כללי או קריאה למערכת callback
        if (typeof window.onTickerStatusChanged === 'function') {
          window.onTickerStatusChanged(tickerId, 'cancelled');
        } else {
          location.reload();
        }
      }

    } else {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לטריידים פעילים
        if (errorData.error && errorData.error.message &&
                    errorData.error.message.includes('active trades')) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsWarning) {
            window.showLinkedItemsWarning('ticker', tickerId);
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
    const response = await fetch(`/api/v1/linked-items/ticker/${tickerId}`);

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
          window.showNotification('אזהרה', 'יש פריטים מקושרים לטיקר זה', 'warning');
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
    const response = await fetch(`/api/v1/linked-items/ticker/${tickerId}`);

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
          window.showNotification('אזהרה', 'יש פריטים מקושרים לטיקר זה', 'warning');
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
    const response = await fetch('/api/v1/tickers/update-all-statuses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      await response.json(); // result not used


      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'סטטוסים של כל הטיקרים עודכנו בהצלחה');
      }

      // רענון הנתונים
      await loadTickersData();

      // עדכון שדה active_trades
      await updateActiveTradesField();

    } else {
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
      window.showErrorNotification('שגיאה', 'טיקר לא נמצא');
    }
    return;
  }

  try {
    const response = await fetch(`/api/v1/tickers/${id}`, {
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

    const response = await fetch(`/api/v1/tickers/${tickerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // שגיאה
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בהפעלה מחדש', 'שגיאה בהפעלה מחדש של הטיקר: ' + errorData.error.message);
        }

      } catch {
        handleApiError('שגיאה בהפעלה מחדש של טיקר', errorResponse);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בהפעלה מחדש', 'שגיאה בהפעלה מחדש של הטיקר');
        }
      }
      return;
    }


    // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('טיקר הופעל מחדש בהצלחה!');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('טיקר הופעל מחדש בהצלחה!', 'success');
    }

    // רענון הטבלה
    if (typeof loadTickersData === 'function') {
      // אנחנו בעמוד tickers
      await loadTickersData();
      // עדכון שדה active_trades רק בעמוד tickers
      await updateActiveTradesField();
    } else {
      // רענון כללי או קריאה למערכת callback
      if (typeof window.onTickerStatusChanged === 'function') {
        window.onTickerStatusChanged(tickerId, 'open');
      } else {
        location.reload();
      }
    }

  } catch (error) {
    handleSystemError(error, 'הפעלה מחדש של טיקר');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהפעלה מחדש', 'error');
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
    const response = await fetch(`/api/v1/tickers/${tickerId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await response.json(); // result not used

      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'הטיקר נמחק בהצלחה');
      }

      // רענון הנתונים
      if (typeof loadTickersData === 'function') {
        // אנחנו בעמוד tickers
        await loadTickersData();
        await updateActiveTradesField(); // רק עבור עמוד tickers
      } else {
        // רענון כללי או קריאה למערכת callback
        if (typeof window.onTickerDeleted === 'function') {
          window.onTickerDeleted(tickerId);
        } else {
          location.reload();
        }
      }

    } else {
      const errorResponse = await response.text();

      try {
        const errorData = JSON.parse(errorResponse);

        // בדיקה אם השגיאה קשורה לפריטים מקושרים
        if (errorData.error && errorData.error.message &&
                    (errorData.error.message.includes('linked items') ||
                        errorData.error.message.includes('Cannot delete ticker with linked items'))) {

          // הצגת אזהרת פריטים מקושרים
          if (window.showLinkedItemsWarning) {
            window.showLinkedItemsWarning('ticker', tickerId);
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
    const response = await fetch(`/api/v1/tickers/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {


      // הצגת הודעת הצלחה
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', `טיקר ${tickerInfo} נמחק בהצלחה מהמערכת`);
      }

      // רענון הנתונים
      await loadTickersData();

      // עדכון שדה active_trades
      await updateActiveTradesField();

    } else {
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
            if (window.showLinkedItemsWarning) {
              window.showLinkedItemsWarning('ticker', id);
            } else {
              handleFunctionNotFound('showLinkedItemsWarning', 'פונקציית בדיקת פריטים מקושרים לא נמצאה');
            }
          } catch (error) {
            handleSystemError(error, 'קריאה לפונקציית בדיקת פריטים מקושרים');
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
 * טעינת נתוני טיקרים - גרסה פשוטה
 */
async function loadTickersData() {
  try {
    // טעינת מטבעות אם עוד לא נטענו
    if (!window.currenciesLoaded) {
      await loadCurrenciesData();
    }

    const response = await fetch('/api/v1/tickers/');

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

    // רענון נתוני Yahoo Finance אוטומטית (ללא הודעות)
    refreshYahooFinanceDataSilently();


  } catch (error) {
    handleDataLoadError(error, 'טעינת נתוני טיקרים');

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
    const latestUpdateElement = document.getElementById('latestUpdate');
    const oldestUpdateElement = document.getElementById('oldestUpdate');

    // אם האלמנטים לא קיימים, הפונקציה לא רלוונטית לדף זה
    if (!totalTickersElement || !activeTickersElement || !latestUpdateElement || !oldestUpdateElement) {
      return;
    }

    if (!tickers || tickers.length === 0) {
      // אם אין נתונים, אפס את כל השדות
      totalTickersElement.textContent = '0';
      activeTickersElement.textContent = '0';
      latestUpdateElement.textContent = 'אין נתונים';
      oldestUpdateElement.textContent = 'אין נתונים';
      return;
    }

    // חישוב סטטיסטיקות
    const totalTickers = tickers.length;
    const activeTickers = tickers.filter(ticker => ticker.active_trades).length;

    // חישוב תאריכי עדכון
    const validUpdatedDates = tickers
      .map(ticker => ticker.updated_at)
      .filter(date => date)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));

    let latestUpdate = 'אין נתונים';
    let oldestUpdate = 'אין נתונים';

    if (validUpdatedDates.length > 0) {
      const latest = new Date(Math.max(...validUpdatedDates));
      const oldest = new Date(Math.min(...validUpdatedDates));

      latestUpdate = latest.toLocaleDateString('he-IL');
      oldestUpdate = oldest.toLocaleDateString('he-IL');
    }

    // עדכון השדות ב-HTML
    totalTickersElement.textContent = totalTickers;
    activeTickersElement.textContent = activeTickers;
    latestUpdateElement.textContent = latestUpdate;
    oldestUpdateElement.textContent = oldestUpdate;


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

      return `
                <tr>
                    <td title="${ticker.symbol || 'N/A'}"><strong>${ticker.symbol || 'N/A'}</strong></td>
                    <td title="${ticker.active_trades ? 'יש טריידים פעילים' : 'אין טריידים פעילים'}">${ticker.active_trades ? '✅' : '❌'}</td>
                    <td title="${typeLabel}">
                        <span style="background-color: ${typeStyle.backgroundColor}; 
                                     color: ${typeStyle.color}; 
                                     padding: ${typeStyle.padding}; 
                                     border-radius: ${typeStyle.borderRadius}; 
                                     font-size: ${typeStyle.fontSize}; 
                                     font-weight: ${typeStyle.fontWeight}; 
                                     display: ${typeStyle.display}; 
                                     min-width: ${typeStyle.minWidth}; 
                                     text-align: ${typeStyle.textAlign};">
                            ${typeLabel}
                        </span>
                    </td>
                    <td title="${currencySymbol}"><strong>${currencySymbol}</strong></td>
                    <td title="${ticker.updated_at ? new Date(ticker.updated_at).toLocaleString('he-IL') : 'N/A'}">${ticker.updated_at ? new Date(ticker.updated_at).toLocaleString('he-IL') : 'N/A'}</td>
                    <td title="${ticker.name || 'N/A'}">${ticker.name || 'N/A'}</td>
                    <td title="${ticker.created_at ? new Date(ticker.created_at).toLocaleDateString('he-IL') : 'N/A'}">${ticker.created_at ? new Date(ticker.created_at).toLocaleDateString('he-IL') : 'N/A'}</td>
                    <td title="${ticker.remarks || '-'}">${ticker.remarks || '-'}</td>
                    <td title="${statusLabel}">
                        <span style="background-color: ${statusStyle.backgroundColor}; 
                                     color: ${statusStyle.color}; 
                                     padding: ${statusStyle.padding}; 
                                     border-radius: ${statusStyle.borderRadius}; 
                                     font-size: ${statusStyle.fontSize}; 
                                     font-weight: ${statusStyle.fontWeight}; 
                                     display: ${statusStyle.display}; 
                                     min-width: ${statusStyle.minWidth}; 
                                     text-align: ${statusStyle.textAlign};">
                            ${statusLabel}
                        </span>
                    </td>
                    <td class="actions-cell">
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-info" 
                                    onclick="window.showLinkedItemsWarning('ticker', ${ticker.id})" 
                                    title="פריטים מקושרים">🔗</button>
                            <button class="btn btn-outline-secondary" 
                                    onclick="window.showEditTickerModal(${ticker.id})" 
                                    title="ערוך">✏️</button>
                            ${ticker.status === 'cancelled' ?
    `<button class="btn btn-outline-success" 
             onclick="window.reactivateTicker(${ticker.id})" 
             title="הפעל מחדש טיקר"><span class="reactivate-icon">✓</span></button>` :
    `<button class="btn btn-outline-danger" 
             onclick="window.cancelTicker(${ticker.id})" 
             title="בטל טיקר"><span class="cancel-icon">X</span></button>`
}
                            <button class="btn btn-outline-danger" 
                                    onclick="window.deleteTicker(${ticker.id})" 
                                    title="מחק טיקר"><span class="delete-icon">🗑️</span></button>
                        </div>
                    </td>
                </tr>
            `;
    });

    // עדכון הטבלה
    const finalHTML = tableRows.join('');
    tbody.innerHTML = finalHTML;

    // עדכון הספירה
    const countElement = document.querySelector('.table-count');
    if (countElement) {
      countElement.textContent = `${tickers.length} טיקרים`;
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
window.toggleTopSection = toggleTopSection;
window.toggleTickersSection = toggleTickersSection;
window.restoreTickersSectionState = restoreTickersSectionState;

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
function sortTable(columnIndex) {

  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.tickersData || [],
      'tickers',
      updateTickersTable,
    );
  } else {
    handleFunctionNotFound('sortTableData', 'פונקציית סידור טבלה לא נמצאה');
  }
}

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
window.sortTable = sortTable;
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

// אתחול הדף
document.addEventListener('DOMContentLoaded', function () {
  // שחזור מצב הסגירה
  restoreTickersSectionState();

  // אתחול וולידציה - שימוש בפונקציות הגלובליות
  if (window.initializeValidation) {
    // שימוש בוולידציה הגלובלית ללא כללים מותאמים
    window.initializeValidation('addTickerForm', {});
    window.initializeValidation('editTickerForm', {});
  }

  // שחזור מצב סידור
  restoreSortState();
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

// ===== Yahoo Finance Integration =====

/**
 * רענון נתוני Yahoo Finance לכל הטיקרים
 */
async function refreshYahooFinanceData() {
  const refreshBtn = document.getElementById('yahooRefreshBtn');
  
  try {
    // הצגת מצב טעינה
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<span class="action-icon">⏳</span> מרענן...';
    }

    // קבלת כל הטיקרים מהמערכת
    if (!window.tickersData || window.tickersData.length === 0) {
      await loadTickersData();
    }

    const symbols = window.tickersData
      .filter(ticker => ticker.symbol && ticker.status === 'active')
      .map(ticker => ticker.symbol);

    if (symbols.length === 0) {
      window.showNotification('אין טיקרים פעילים לעדכון', 'warning');
      return;
    }

    // קבלת נתוני Yahoo Finance
    const response = await fetch('/api/external-data/yahoo/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbols: symbols })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      // עדכון הנתונים בטבלה
      updateTickersWithYahooData(data.data);
      window.showNotification(`עודכנו נתונים עבור ${Object.keys(data.data).length} טיקרים`, 'success');
    } else {
      throw new Error(data.error || 'שגיאה לא ידועה');
    }

  } catch (error) {
    console.error('Error refreshing Yahoo Finance data:', error);
    window.showNotification(`שגיאה ברענון נתונים: ${error.message}`, 'error');
  } finally {
    // החזרת הכפתור למצב רגיל
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<span class="action-icon">🔄</span> רענן מחירים';
    }
  }
}

/**
 * עדכון נתוני הטיקרים עם מידע מ-Yahoo Finance
 */
function updateTickersWithYahooData(yahooData) {
  if (!window.tickersData) {
    return;
  }

  const updatedData = window.tickersData.map(ticker => {
    const yahooInfo = yahooData[ticker.symbol];
    if (yahooInfo && !yahooInfo.error) {
      return {
        ...ticker,
        current_price: yahooInfo.price,
        change_percent: yahooInfo.change_percent,
        volume: yahooInfo.volume,
        yahoo_updated_at: new Date().toLocaleString('he-IL')
      };
    }
    return ticker;
  });

  // עדכון הנתונים הגלובליים
  window.tickersData = updatedData;
  
  // עדכון הטבלה
  updateTickersTable(updatedData);
}

// Duplicate function removed - using main implementation at line 1501

/**
 * רענון נתוני Yahoo Finance ללא הודעות (לטעינה אוטומטית)
 */
async function refreshYahooFinanceDataSilently() {
  try {
    // קבלת כל הטיקרים מהמערכת
    if (!window.tickersData || window.tickersData.length === 0) {
      return;
    }

    const symbols = window.tickersData
      .filter(ticker => ticker.symbol && ticker.status === 'active')
      .map(ticker => ticker.symbol);

    if (symbols.length === 0) {
      return;
    }

    // קבלת נתוני Yahoo Finance
    const response = await fetch('/api/external-data/yahoo/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbols: symbols })
    });

    if (!response.ok) {
      console.warn('Failed to fetch Yahoo Finance data:', response.status);
      return;
    }

    const data = await response.json();

    if (data.status === 'success') {
      // עדכון הנתונים בטבלה (ללא הודעות)
      updateTickersWithYahooData(data.data);
      console.log(`Yahoo Finance data updated for ${Object.keys(data.data).length} tickers`);
    }

  } catch (error) {
    console.warn('Silent Yahoo Finance refresh failed:', error.message);
  }
}
