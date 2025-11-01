/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 43
 * 
 * DATA LOADING (11)
 * - loadCurrenciesData() - loadCurrenciesData function
 * - getCurrencySymbol() - * Load currencies data from server
 * - getTimeDuration() - * קבלת סמל מטבע לפי מזהה
 * - getTickerTypeStyle() - * חישוב משך הזמן שעבר מתאריך נתון - פורמט אחיד מלא
 * - getTickerStatusStyle() - * קבלת עיצוב סוג טיקר
 * - getTickerStatusLabel() - * קבלת עיצוב סטטוס טיקר
 * - getTickerSymbol() - * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * - loadTickersData() - * הצגת הודעה
 * - loadColorsAndApplyToHeaders() - loadColorsAndApplyToHeaders function
 * - tryLoadData() - tryLoadData function
 * - getTypeDisplayName() - getTypeDisplayName function
 * 
 * DATA MANIPULATION (14)
 * - updateCurrencyOptions() - updateCurrencyOptions function
 * - updateActiveTradesField() - * פונקציה לעדכון אפשרויות מטבע בטופס
 * - updateTickerActiveTradesStatus() - updateTickerActiveTradesStatus function
 * - updateAllActiveTradesStatuses() - updateAllActiveTradesStatuses function
 * - saveTicker() - saveTicker function
 * - updateTicker() - updateTicker function
 * - checkLinkedItemsBeforeDeleteTicker() - checkLinkedItemsBeforeDeleteTicker function
 * - updateAllTickerStatuses() - * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * - checkLinkedItemsAndDeleteTicker() - checkLinkedItemsAndDeleteTicker function
 * - deleteTicker() - deleteTicker function
 * - confirmDeleteTicker() - confirmDeleteTicker function
 * - updateTickersSummaryStats() - updateTickersSummaryStats function
 * - updateTickersTable() - * עדכון סטטיסטיקות סיכום טיקרים
 * - showAddTickerModal() - showAddTickerModal function
 * 
 * EVENT HANDLING (5)
 * - generateTickerCurrencyOptions() - * קבלת תווית סטטוס טיקר
 * - restoreTickersSectionState() - restoreTickersSectionState function
 * - performTickerCancellation() - * בדיקת מקושרים וביצוע ביטול טיקר
 * - performTickerDeletion() - * בדיקת מקושרים וביצוע מחיקת טיקר
 * - toggleTickersSection() - toggleTickersSection function
 * 
 * UI UPDATES (1)
 * - showEditTickerModal() - * Show add ticker modal
 * 
 * VALIDATION (2)
 * - checkLinkedItemsAndCancelTicker() - checkLinkedItemsAndCancelTicker function
 * - checkLinkedItemsBeforeCancelTicker() - * בדיקת פריטים מקושרים לפני מחיקת טיקר
 * 
 * OTHER (10)
 * - viewTickerDetails() - viewTickerDetails function
 * - viewTickerDetailsOld() - * צפייה בפרטי טיקר
 * - refreshTickerData() - refreshTickerData function
 * - cancelTicker() - cancelTicker function
 * - performCancelTicker() - performCancelTicker function
 * - reactivateTicker() - reactivateTicker function
 * - clearTickersCache() - clearTickersCache function
 * - refreshYahooFinanceData() - refreshYahooFinanceData function
 * - refreshYahooFinanceDataSilently() - refreshYahooFinanceDataSilently function
 * - filterTickersByType() - filterTickersByType function
 * 
 * ==========================================
 */
/**
 * Tickers Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing tickers including:
 * - CRUD operations for tickers
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - External data integration (Yahoo Finance)
 * - Currency management
 * - Status and activity tracking
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// ===== קובץ JavaScript לדף טיקרים =====

// ===== TICKER MANAGEMENT FUNCTIONS =====
// CRUD operations for tickers

/**
 * Edit existing ticker
 * Opens modal for editing ticker
 * 
 * @function editTicker
 * @param {number} tickerId - ID of the ticker to edit
 * @returns {void}
 */
// REMOVED: editTicker function - using showAddTickerModal directly

/**
 * צפייה בפרטי טיקר
 * מציג חלון עם פרטים מפורטים של הטיקר
 * @param {number} tickerId - מזהה הטיקר
 */
function viewTickerDetails(tickerId) {
  try {
    // צפייה בפרטי טיקר באמצעות מודל פרטי ישות הגלובלי
    if (typeof window.showEntityDetails === 'function') {
      window.showEntityDetails('ticker', tickerId, { mode: 'view' });
    } else {
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'מערכת פרטי ישויות לא זמינה');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTickerDetails:', error, { tickerId, page: "tickers" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי הטיקר');
    }
  }
}

// REMOVED: viewTickerDetailsOld - not used, replaced by viewTickerDetails
// Keep old function for backward compatibility
function _REMOVED_viewTickerDetailsOld(tickerId) {
  try {
    window.Logger.info('👁️ מציג פרטי טיקר:', tickerId, { page: "tickers" });
    
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
    window.Logger.error('שגיאה בהצגת פרטי טיקר:', error, { page: "tickers" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי טיקר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהצגת פרטי טיקר');
    }
  }
}

// REMOVED: refreshTickerData - not used
/**
 * רענון נתוני טיקר
 * טוען מחדש את נתוני הטיקר מהשרת
 * @param {number} tickerId - מזהה הטיקר
 */
function _REMOVED_refreshTickerData(tickerId) {
  try {
    window.Logger.info('🔄 מרענן נתוני טיקר:', tickerId, { page: "tickers" });
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showInfoNotification('רענון', 'מרענן נתוני טיקר...');
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
      window.Logger.info('✅ נתוני טיקר רוענו:', data, { page: "tickers" });
      
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
      window.Logger.error('שגיאה ברענון נתוני טיקר:', error, { page: "tickers" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה ברענון נתוני טיקר', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showErrorNotification('שגיאה ברענון נתוני טיקר');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה ברענון נתוני טיקר:', error, { page: "tickers" });
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

// ===== CURRENCY MANAGEMENT FUNCTIONS =====
// Currency data loading and management

/**
 * Load currencies data from server
 * Fetches all currencies for dropdowns
 * 
 * @function loadCurrenciesData
 * @async
 * @returns {Promise<void>}
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
  try {
    if (!window.currenciesData || !window.currenciesLoaded) {
      return currencyId || 'N/A';
    }

    const currency = window.currenciesData.find(c => c.id === currencyId);
    return currency ? currency.symbol : currencyId || 'N/A';
  } catch (error) {
    console.error('getCurrencySymbol failed:', error);
    return currencyId || 'N/A';
  }
}


/**
 * חישוב משך הזמן שעבר מתאריך נתון - פורמט אחיד מלא
 */
function getTimeDuration(dateString) {
  try {
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
  } catch (error) {
    console.error('getTimeDuration failed:', error);
    return 'N/A';
  }
}

/**
 * קבלת עיצוב סוג טיקר
 */
function getTickerTypeStyle(type) {
  try {
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
  } catch (error) {
    console.error('getTickerTypeStyle failed:', error);
    return {
      backgroundColor: '#6c757d',
      color: '#ffffff',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  }
}

/**
 * קבלת עיצוב סטטוס טיקר
 */
function getTickerStatusStyle(status) {
  try {
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
  } catch (error) {
    console.error('getTickerStatusStyle failed:', error);
    return {
      backgroundColor: '#e8f5e8',
      color: '#388e3c',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'inline-block',
      textAlign: 'center',
    };
  }
}

/**
 * קבלת תווית סטטוס טיקר
 */
function getTickerStatusLabel(status) {
  try {
    const labels = {
      'open': 'פתוח',
      'closed': 'סגור',
      'cancelled': 'מבוטל',
    };
    return labels[status] || 'פתוח';
  } catch (error) {
    console.error('getTickerStatusLabel failed:', error);
    return 'פתוח';
  }
}

/**
 * פונקציה ליצירת אפשרויות מטבע בטופס
 */
function generateTickerCurrencyOptions(ticker = null) {
  try {
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
  } catch (error) {
    console.error('generateTickerCurrencyOptions failed:', error);
    return '<option value="1">דולר אמריקאי (USD)</option>';
  }
}

/**
 * פונקציה לעדכון אפשרויות מטבע בטופס
 */
function updateCurrencyOptions(ticker = null) {
  try {
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
  } catch (error) {
    console.error('updateCurrencyOptions failed:', error);
  }
}

// ===== STATUS MANAGEMENT FUNCTIONS =====
// Status updates and activity tracking

/**
 * Update active trades field for tickers
 * Updates active_trades field based on open trades
 * 
 * @function updateActiveTradesField
 * @async
 * @returns {Promise<void>}
 */
async function updateActiveTradesField() {
  // Updating active_trades field for tickers

  try {
    // טעינת טריידים מהשרת
    const tradesResponse = await fetch('/api/trades/');
    if (!tradesResponse.ok) {
      // window.Logger.warn('⚠️ Could not load trades for active_trades update', { page: "tickers" });
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
 * @deprecated Use window.tickerService.updateTickerActiveTradesStatus(tickerId) instead
 */
async function updateTickerActiveTradesStatus(tickerId) {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateTickerActiveTradesStatus) {
    return await window.tickerService.updateTickerActiveTradesStatus(tickerId);
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
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
}

/**
 * עדכון אוטומטי של כל שדות active_trades
 * @deprecated Use window.tickerService.updateAllActiveTradesStatuses() instead
 */
async function updateAllActiveTradesStatuses() {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateAllActiveTradesStatuses) {
    return await window.tickerService.updateAllActiveTradesStatuses();
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
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
}

// ===== UI STATE MANAGEMENT FUNCTIONS =====
// Section state restoration and UI management

/**
 * Restore tickers section state
 * Restores saved section states from localStorage
 * 
 * @function restoreTickersSectionState
 * @returns {void}
 */
function restoreTickersSectionState() {
  try {
    // שחזור מצב הסקשן העליון
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates();
    } else {
      // window.Logger.warn('⚠️ restoreAllSectionStates function not available globally', { page: "tickers" });
    }

    // שחזור מצב הסקשנים הפנימיים
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    } else {
      // window.Logger.warn('⚠️ restoreSectionStates function not available globally', { page: "tickers" });
    }
  } catch (error) {
    console.error('restoreTickersSectionState failed:', error);
  }
}

// פונקציות נוספות

// פונקציות לפתיחה/סגירה של סקשנים - משתמשות בפונקציות הגלובליות


// פונקציות נוספות

// ========================================
// פונקציות מודלים
// ========================================

/**
 * הצגת מודל טיקר (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 * @param {number} [id] - מזהה הטיקר (נדרש רק בעריכה)
 */

/**
 * וולידציה מקיפה של טופס טיקר
 * @param {string} mode - 'add' או 'edit'
 * @returns {boolean} true אם הטופס תקין, false אחרת
 */


// ========================================
// פונקציות שמירה ועדכון
// ========================================

// ===== SAVE AND UPDATE FUNCTIONS =====
// Ticker saving, updating, and data management

/**
 * Save new ticker
 * Collects form data and sends to server for creation
 * 
 * @function saveTicker
 * @async
 * @returns {Promise<void>}
 */
async function saveTicker() {
  
  // ניקוי מטמון לפני פעולת CRUD  // איסוף נתונים מהטופס באמצעות DataCollectionService
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
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
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
  
  // ניקוי מטמון לפני פעולת CRUD - עריכה  // שימוש ב-DataCollectionService לאיסוף נתונים
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
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
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
      // window.Logger.warn('לא ניתן לטעון פרטי טיקר:', error, { page: "tickers" });
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
 * @deprecated Use window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'cancel', performTickerCancellation) instead
 */
async function checkLinkedItemsAndCancelTicker(tickerId) {
  await window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'cancel', performTickerCancellation);
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
 * @deprecated Use window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete') instead
 */
async function checkLinkedItemsBeforeDeleteTicker(tickerId) {
  return await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete');
}

/**
 * בדיקת פריטים מקושרים לפני ביטול טיקר
 * @deprecated Use window.checkLinkedItemsBeforeAction('ticker', tickerId, 'cancel') instead
 */
async function checkLinkedItemsBeforeCancelTicker(tickerId) {
  return await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'cancel');
}

/**
 * קבלת סימבול הטיקר לפי ID
 */
function getTickerSymbol(tickerId) {
  try {
    // נסה למצוא בטיקרים שכבר נטענו
    if (window.tickersData) {
      const ticker = window.tickersData.find(t => t.id === tickerId);
      if (ticker) {
        return ticker.symbol;
      }
    }
    return `טיקר ${tickerId}`;
  } catch (error) {
    console.error('getTickerSymbol failed:', error);
    return `טיקר ${tickerId}`;
  }
}

/**
 * עדכון כל הסטטוסים של טיקרים
 * @deprecated Use window.tickerService.updateAllTickerStatuses() instead
 */
async function updateAllTickerStatuses() {
  // קריאה לשירות המאוחד
  if (window.tickerService && window.tickerService.updateAllTickerStatuses) {
    return await window.tickerService.updateAllTickerStatuses();
  } else {
    // fallback לפונקציה המקורית אם השירות לא זמין
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
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
          await window.UnifiedCacheManager.clearAllCache('Light');
        } else if (typeof window.clearAllCache === 'function') {
          window.clearAllCache();
        }
        // Clear local tickers data
        window.tickersData = [];
        tickersData = [];
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
      window.Logger.warn(`טיקר ${id} כבר לא קיים בבסיס הנתונים, מרענן נתונים`, { page: "tickers" });
      
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מידע', `הטיקר כבר לא קיים במערכת - מרענן נתונים`);
      }

      // רענון הנתונים כמו במקרה של הצלחה
      if (typeof loadTickersData === 'function') {
        // ניקוי מטמון לפני רענון
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
          await window.UnifiedCacheManager.clearAllCache('Light');
        } else if (typeof window.clearAllCache === 'function') {
          window.clearAllCache();
        }
        // Clear local tickers data
        window.tickersData = [];
        tickersData = [];
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
 * @deprecated Use window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'delete', performTickerDeletion) instead
 */
async function checkLinkedItemsAndDeleteTicker(tickerId) {
  await window.checkLinkedItemsAndPerformAction('ticker', tickerId, 'delete', performTickerDeletion);
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
 * מחיקת טיקר
 * Includes linked items check
 */
async function deleteTicker(tickerId) {
    window.Logger.info(`🗑️ deleteTicker called for ticker ${tickerId}`, { tickerId, page: 'tickers' });
    
    try {
        // Get ticker details for confirmation message
        let tickerDetails = `טיקר #${tickerId}`;
        const ticker = window.tickersData?.find(t => t.id === tickerId || t.id === parseInt(tickerId));
        
        if (ticker) {
            const symbol = ticker.symbol || 'לא מוגדר';
            const name = ticker.name || 'לא מוגדר';
            const statusText = ticker.status === 'open' ? 'פתוח' :
                             ticker.status === 'closed' ? 'סגור' :
                             ticker.status === 'cancelled' ? 'מבוטל' : ticker.status || 'לא מוגדר';
            const typeText = ticker.type || 'לא מוגדר';
            
            tickerDetails = `${symbol} - ${name}, סטטוס: ${statusText}, סוג: ${typeText}`;
        }
        
        // Check linked items first (Trades, Trade Plans, Alerts, Notes)
        window.Logger.info('🔍 Checking for linked items before deletion', { tickerId, page: 'tickers' });
        if (typeof window.checkLinkedItemsBeforeAction === 'function') {
            window.Logger.info('✅ checkLinkedItemsBeforeAction function exists', { tickerId, page: 'tickers' });
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('ticker', tickerId, 'delete');
            window.Logger.info(`🔍 Linked items check result: hasLinkedItems=${hasLinkedItems}`, { tickerId, page: 'tickers' });
            if (hasLinkedItems) {
                window.Logger.info('🚫 Ticker has linked items, deletion cancelled', { tickerId, page: 'tickers' });
                return;
            }
        } else {
            window.Logger.warn('⚠️ checkLinkedItemsBeforeAction function not available', { tickerId, page: 'tickers' });
        }
        
        // Use warning system for confirmation with detailed information
        if (window.showDeleteWarning) {
            window.showDeleteWarning('ticker', tickerDetails, 'טיקר',
                async () => await performTickerDeletion(tickerId),
                () => {}
            );
        } else {
            // Fallback to simple confirm
            if (!confirm('האם אתה בטוח שברצונך למחוק את הטיקר?')) {
                return;
            }
            await performTickerDeletion(tickerId);
        }
        
    } catch (error) {
        window.Logger.error('Error deleting ticker:', error, { tickerId, page: 'tickers' });
        CRUDResponseHandler.handleError(error, 'מחיקת טיקר');
    }
}

/**
 * אישור מחיקת טיקר (לשמירה על תאימות לאחור)
 * @deprecated Use deleteTicker instead
 */
async function confirmDeleteTicker(id) {
  
  // ניקוי מטמון לפני פעולת CRUD - מחיקה  // מציאת הטיקר לפני מחיקה כדי להציג פרטים בהודעה
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
      entityName: 'טיקר',
      reloadFn: window.loadTickersData,
      requiresHardReload: false
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


// ===== DATA MANAGEMENT FUNCTIONS =====
// Data loading, caching, and table management

// REMOVED: clearTickersCache - use window.UnifiedCacheManager.clearAllCache() or window.clearAllCache() from unified-cache-manager.js instead

/**
 * טעינת נתוני טיקרים - גרסה פשוטה
 */
async function loadTickersData() {
  try {
    window.Logger.info('Loading tickers data (bypass cache)', { page: "tickers" });
    
    // ניקוי מטמון לפני טעינה
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.clearAllCache === 'function') {
      await window.UnifiedCacheManager.clearAllCache('Light');
    } else if (typeof window.clearAllCache === 'function') {
      window.clearAllCache();
    }
    // Clear local tickers data
    window.tickersData = [];
    tickersData = [];
    
    // טעינת מטבעות אם עוד לא נטענו
    if (!window.currenciesLoaded) {
      await loadCurrenciesData();
    }

    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/tickers/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

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
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.tickers;
      window.InfoSummarySystem.calculateAndRender(tickers, config);
    } else {
      // מערכת סיכום נתונים לא זמינה
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement) {
        summaryStatsElement.innerHTML = `
          <div style="color: #dc3545; font-weight: bold;">
            ⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('updateTickersSummaryStats failed:', error);
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
        window.Logger.debug(`🔍 Debug AAPL:`, {
          current_price: ticker.current_price,
          change_percent: ticker.change_percent,
          volume: ticker.volume,
          yahoo_updated_at: ticker.yahoo_updated_at
        }, { page: "tickers" });
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
                              onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker', ${ticker.id}); } else { window.Logger.error('פונקציה showEntityDetails לא קיימת', { page: "tickers" }); }" 
                              title="לחץ לצפייה בפרטי הטיקר">
                            <strong>${ticker.symbol || 'N/A'}</strong>
                        </span>
                    </td>
                    <td title="${formattedPrice !== 'N/A' ? `מחיר נוכחי: ${formattedPrice}` : 'אין נתוני מחיר'}" style="color: ${changeColor}; font-weight: bold; text-align: center; direction: ltr;">${formattedPrice}</td>
                    <td title="${changeDisplay !== 'N/A' ? `שינוי יומי: ${changeDisplay}` : 'אין נתוני שינוי'}" style="color: ${changeColor}; font-weight: bold; text-align: center; direction: ltr;">${changeDisplay}</td>
                    <td title="${volume !== 'N/A' ? `נפח: ${volume}` : 'אין נתוני נפח'}" style="text-align: center; direction: ltr;">${window.renderVolume ? window.renderVolume(volume, true) : volume}</td>
                    <td class="status-cell" data-status="${ticker.status || ''}" title="${statusLabel}">
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
                    <td class="type-cell" data-type="${ticker.type || ''}" title="${typeLabel}">
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
                    <td class="date-cell" data-date="${ticker.yahoo_updated_at ? new Date(ticker.yahoo_updated_at).toISOString().split('T')[0] : ''}" title="${ticker.yahoo_updated_at ? `עודכן: ${new Date(ticker.yahoo_updated_at).toLocaleString('he-IL')}` : 'אין נתוני עדכון'}" style="text-align: center;">
                        ${ticker.yahoo_updated_at ? (window.formatShortDate ? window.formatShortDate(ticker.yahoo_updated_at) : new Date(ticker.yahoo_updated_at).toLocaleDateString('he-IL')) + ' ' + (window.formatTimeOnly ? window.formatTimeOnly(ticker.yahoo_updated_at) : new Date(ticker.yahoo_updated_at).toLocaleTimeString('he-IL', {hour: '2-digit', minute: '2-digit'})) : 'N/A'}
                    </td>
                    <td class="actions-cell">
                        ${(() => {
                          if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
                          const result = window.createActionsMenu([
                            { type: 'VIEW', onclick: `window.showEntityDetails('ticker', ${ticker.id}, { mode: 'view' })`, title: 'צפה בפרטי טיקר' },
                            { type: 'LINK', onclick: `window.viewLinkedItemsForTicker(${ticker.id})`, title: 'פריטים מקושרים' },
                            { type: 'EDIT', onclick: `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('tickersModal', 'ticker', ${ticker.id})`, title: 'ערוך' },
                            { type: ticker.status === 'cancelled' ? 'REACTIVATE' : 'CANCEL', onclick: `${ticker.status === 'cancelled' ? 'reactivateTicker' : 'performTickerCancellation'}(${ticker.id})`, title: ticker.status === 'cancelled' ? 'הפעל מחדש טיקר' : 'בטל טיקר' },
                            { type: 'DELETE', onclick: `deleteTicker(${ticker.id})`, title: 'מחק' }
                          ]);
                          return result || '';
                        })()}
                        ${!window.createActionsMenu ? `
                        <div class="btn-group btn-group-sm" role="group">
                            <button data-button-type="VIEW" data-variant="small" 
                                    data-onclick="window.showEntityDetails('ticker', ${ticker.id}, { mode: 'view' })" 
                                    data-text="" title="צפה בפרטי טיקר"></button>
                            <button data-button-type="LINK" data-variant="small" 
                                    data-onclick="window.viewLinkedItemsForTicker(${ticker.id})" 
                                    data-text="" title="פריטים מקושרים"></button>
                            <button data-button-type="EDIT" data-variant="small" 
                                    data-onclick="window.ModalManagerV2 && window.ModalManagerV2.showEditModal('tickersModal', 'ticker', ${ticker.id})" 
                                    data-text="" title="ערוך"></button>
                            ${ticker.status === 'cancelled' ?
                            `<button data-button-type="REACTIVATE" data-variant="small" 
                                     data-onclick="reactivateTicker(${ticker.id})" 
                                     data-text="" title="הפעל מחדש טיקר"></button>` :
                            `<button data-button-type="CANCEL" data-variant="small" 
                                     data-onclick="performTickerCancellation(${ticker.id})" 
                                     data-text="" title="בטל טיקר"></button>`}
                        </div>
                        ` : ''}
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
    
    window.Logger.debug(`📊 טבלת טיקרים עודכנה עם ${tickers.length} פריטים`, { page: "tickers" });

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
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: showDeleteTickerModal removed - not needed (using confirmDeleteTicker directly)
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
// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.editTicker = editTicker;
window.loadCurrenciesData = loadCurrenciesData;
window.updateActiveTradesField = updateActiveTradesField;
window.updateAllActiveTradesStatuses = updateAllActiveTradesStatuses;
window.restoreTickersSectionState = restoreTickersSectionState;
// Note: saveTicker already exported above
// REMOVED: window.clearTickersCache - use window.UnifiedCacheManager.clearAllCache() or window.clearAllCache() directly
window.loadTickersData = loadTickersData;
window.loadColorsAndApplyToHeaders = loadColorsAndApplyToHeaders;
window.refreshYahooFinanceData = refreshYahooFinanceData;
window.refreshYahooFinanceDataSilently = refreshYahooFinanceDataSilently;
window.toggleSection = toggleSection;
// REMOVED: window.toggleTickersSection - use window.toggleSection('tickers') directly
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: saveTickerData removed - not needed (using saveTicker directly)
window.performTickerCancellation = performTickerCancellation;
window.checkLinkedItemsBeforeCancelTicker = checkLinkedItemsBeforeCancelTicker;
window.getTickerSymbol = getTickerSymbol;
window.reactivateTicker = reactivateTicker;
window.updateAllTickerStatuses = updateAllTickerStatuses;

// ===== COLOR MANAGEMENT FUNCTIONS =====
// Color loading and header styling

/**
 * Load colors from preferences and apply to headers
 * Loads color preferences and applies them to page headers
 * 
 * @function loadColorsAndApplyToHeaders
 * @async
 * @returns {Promise<void>}
 */
async function loadColorsAndApplyToHeaders() {
  try {
    // ✨ טעינת העדפות ספציפיות לעמוד tickers
    const relevantPreferenceKeys = ['entityTickerColor', 'primaryColor', 'secondaryColor', 'theme', 'language'];
    
    if (window.loadSpecificPreferences) {
      const specificPreferences = await window.loadSpecificPreferences(relevantPreferenceKeys, 1, null);
      window.Logger.info('✅ Loaded specific preferences for tickers:', Object.keys(specificPreferences, { page: "tickers" }));
      
      // Apply only the loaded preferences
      if (window.loadAllColorsFromPreferences && specificPreferences) {
        window.loadAllColorsFromPreferences(specificPreferences);
      }
    } else if (window.loadPreferences) {
      // Fallback to loading all preferences
      await window.loadPreferences(1, null);
      window.Logger.info('🔄 Loaded all preferences for tickers (fallback, { page: "tickers" })');
      
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
    window.Logger.error('שגיאה בטעינת צבעים:', error, { page: "tickers" });
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

// ===== EXTERNAL DATA FUNCTIONS =====
// External data integration and refresh

/**
 * Refresh Yahoo Finance data for all tickers
 * Updates external price data for all tickers
 * 
 * @function refreshYahooFinanceData
 * @async
 * @returns {Promise<void>}
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
    window.Logger.error('Error refreshing external data:', error, { page: "tickers" });
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
      window.Logger.warn('External Data Service not available for silent refresh', { page: "tickers" });
      return;
    }

    // קבלת נתוני מחירים בשקט
    const externalData = await externalDataService.refreshTickersDataSilently(window.tickersData);

    if (externalData) {
      // עדכון הנתונים הגלובליים (ללא הודעות)
      window.tickersData = externalDataService.updateTickersWithExternalData(window.tickersData, externalData);
      window.Logger.info('📈 External data updated silently:', externalData, { page: "tickers" });
    } else {
      window.Logger.warn('📈 No external data received for silent refresh', { page: "tickers" });
    }

  } catch (error) {
    window.Logger.warn('Silent external data refresh failed:', error.message, { page: "tickers" });
  }
}

// פונקציה לפילטר טיקרים לפי סוג (פילטר פשוט - סוג אחד בלבד)
function filterTickersByType(type) {
  try {
    window.Logger.info(`🔍 Filtering tickers by type: ${type}`, { page: "tickers" });
    
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

    window.Logger.info(`🔍 Filtered ${filteredData.length} tickers out of ${window.tickersData.length} for type: ${type}`, { page: "tickers" });
  } catch (error) {
    console.error('filterTickersByType failed:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בסינון טיקרים');
    }
  }
}

// פונקציה עזר לקבלת שם תצוגה לסוג
function getTypeDisplayName(type) {
  try {
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
  } catch (error) {
    console.error('getTypeDisplayName failed:', error);
    return type;
  }
}

// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====

// ===== UTILITY FUNCTIONS =====
// Helper functions for UI interactions and general utilities

// toggleSection function removed - using global version from ui-basic.js

// REMOVED: toggleTickersSection - use window.toggleSection('tickers') from ui-utils.js directly

// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

// REMOVED: showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly

// REMOVED: showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', tickerId) directly

/**
 * שמירת טיקר
 * Handles both add and edit modes
 */
// REMOVED: Duplicate saveTicker function - using ModalManagerV2 automatic CRUD handling

/**
 * מחיקת טיקר
 * Includes linked items check
 */
// REMOVED: Duplicate deleteTicker function - using confirmDeleteTicker instead

// Export functions to window for global access
// REMOVED: window.showAddTickerModal - use window.ModalManagerV2.showModal('tickersModal', 'add') directly
// REMOVED: window.showEditTickerModal - use window.ModalManagerV2.showEditModal('tickersModal', 'ticker', id) directly
// Note: saveTicker and deleteTicker removed - using ModalManagerV2 and confirmDeleteTicker instead

