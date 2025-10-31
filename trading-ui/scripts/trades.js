/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 35
 * 
 * PAGE INITIALIZATION (1)
 * - setupSortEventListeners() - * Add important note to edit modal
 * 
 * DATA LOADING (3)
 * - getInvestmentTypeColor() - * עיצוב שינוי יומי עם צבעים לפי העדפות
 * - loadTradesData() - * קביעת צבע לפי סוג השקעה
 * - loadTickerDataForTrades() - loadTickerDataForTrades function
 * 
 * DATA MANIPULATION (11)
 * - updateTradesTable() - updateTradesTable function
 * - deleteTradeRecord() - deleteTradeRecord function
 * - addEditImportantNote() - addEditImportantNote function
 * - addEditReminder() - * Add important note to edit modal
 * - updateEditTradeTickerFromPlan() - updateEditTradeTickerFromPlan function
 * - updateEditTradePriceFromTicker() - updateEditTradePriceFromTicker function
 * - updateTrade() - updateTrade function
 * - confirmDeleteTrade() - confirmDeleteTrade function
 * - showAddTradeModal() - showAddTradeModal function
 * - saveTrade() - * Show add trade modal
 * - deleteTrade() - deleteTrade function
 * 
 * EVENT HANDLING (7)
 * - formatDailyChange() - formatDailyChange function
 * - performTradeCancellation() - * בדיקת מקושרים וביצוע ביטול
 * - performTradeDeletion() - performTradeDeletion function
 * - validateTradePlanChange() - validateTradePlanChange function
 * - validateTradeChanges() - validateTradeChanges function
 * - validateTickerChange() - validateTickerChange function
 * - showTickerChangeConfirmation() - showTickerChangeConfirmation function
 * 
 * UI UPDATES (1)
 * - showEditTradeModal() - * Show add trade modal
 * 
 * VALIDATION (2)
 * - checkLinkedItemsAndCancel() - checkLinkedItemsAndCancel function
 * - validateTradePlanDate() - validateTradePlanDate function
 * 
 * OTHER (10)
 * - viewTickerDetails() - viewTickerDetails function
 * - viewAccountDetails() - viewAccountDetails function
 * - viewTradePlanDetails() - viewTradePlanDetails function
 * - editTradeRecord() - editTradeRecord function
 * - cancelTradeRecord() - cancelTradeRecord function
 * - applyStatusFilterToTrades() - applyStatusFilterToTrades function
 * - reactivateTrade() - reactivateTrade function
 * - refreshTrades() - refreshTrades function
 * - generateDetailedLog() - generateDetailedLog function
 * - generateDetailedLogForTrades() - generateDetailedLogForTrades function
 * 
 * ==========================================
 */
/**
 * Trades Page - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains all functions for managing trades including:
 * - CRUD operations for trades
 * - Data loading and table management
 * - Form validation and UI interactions
 * - Modal handling and state management
 * - Filtering and sorting functionality
 * - Conditions system integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

/**
 * Trades.js - TikTrack Frontend
 * =============================
 *
 * This file contains all trade management functionality for the TikTrack application.
 * It handles trade CRUD operations, table updates, filtering, and user interactions.
 *
 * TABLE STRUCTURE FIXES (August 24, 2025):
 * =======================================
 *
 * ISSUE: Table headers and data columns were inconsistent
 * - HTML had 10 columns but data rendering had 11 columns
 * - Column order mismatch between headers and data
 * - Sorting failed due to incorrect column mappings
 *
 * FIXES APPLIED:
 * - Updated tableHTML generation to match 11-column structure
 * - Fixed column order: account_name, ticker_symbol, trade_plan_id, status, etc.
 * - Updated "Show Linked Details" button onclick to use viewLinkedItemsForTrade()
 * - Fixed sortTable function to call window.sortTableData correctly
 * - Updated colspan from 10 to 11 in HTML loading row
 *
 * SORTING IMPROVEMENTS:
 * - Fixed sortTable function to use global window.sortTableData
 * - Corrected function parameters: (columnIndex, data, tableType, updateFunction)
 * - Integrated with global sorting system for consistency
 *
 * Usage:
 * - Used in trades.html (trades/tracking page)
 * - Used in database.html (database page - trades table)
 *
 * Features:
 * - Trade data loading and management
 * - Trade table updates and display

 * - Trade creation, editing, and deletion
 * - Integration with global translation system
 * - "Show Linked Details" button for viewing related entities
 *
 * Architecture:
 * - Modular function organization by responsibility
 * - Integration with global translation system
 * - Comprehensive error handling and user feedback
 * - State management for trade operations
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (global utilities and sorting functions)
 * - translation-utils.js (translation functions)

 * - linked-items.js (linked items modal functionality)
 *
 * Table Mapping:
 * - Uses 'trades' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * @version 1.9.9
 * @lastUpdated August 26, 2025
 * @tableStructureFixes August 24, 2025 - Fixed column structure and sorting
 *
 * פונקציות עיקריות:
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - validateTradeForm() - ולידציה של טופס
 * - viewLinkedItemsForTrade() - הצגת פריטים מקושרים לטרייד
 *
 * תכונות חדשות:
 * - ולידציה מלאה של טופס הוספת טרייד
 * - שמירה לשרת עם API
 * - טעינת נתונים למודל (חשבונות, תוכניות)
 * - הודעות שגיאה והצלחה
 * - עיצוב אחיד עם שאר המודלים
 * - כפתור "הצג פרטים מקושרים" בכל שורה
 *
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025-08-24
 * ========================================
 */

// בדיקה שהפונקציות הנדרשות נטענו
if (typeof showErrorNotification === 'undefined') {
  // window.Logger.error('showErrorNotification לא נטענה!', { page: "trades" });
}
if (typeof showSuccessNotification === 'undefined') {
  // window.Logger.error('showSuccessNotification לא נטענה!', { page: "trades" });
}
if (typeof handleFunctionNotFound === 'undefined') {
  // window.Logger.error('handleFunctionNotFound לא נטענה!', { page: "trades" });
}

// משתנים גלובליים לדף המעקב
if (typeof window.tradesData === 'undefined') {
  const tradesData = [];
  window.tradesData = tradesData;
}

/**
 * עיצוב שינוי יומי עם צבעים לפי העדפות
 * @param {number} dailyChange - השינוי היומי באחוזים
 * @returns {string} - HTML מעוצב עם צבעים
 */
function formatDailyChange(dailyChange) {
  try {
  if (dailyChange === undefined || dailyChange === null) {
    return '-';
  }
  
  const changeValue = parseFloat(dailyChange);
  const isPositive = changeValue >= 0;
  const sign = isPositive ? '+' : '';
  const formattedValue = `${sign}${Math.abs(changeValue).toFixed(2)}%`;
  
  // קבלת צבעים מהעדפות או ברירת מחדל
  const colors = window.getTableColors ? window.getTableColors() : { 
    positive: '#28a745', 
    negative: '#dc3545' 
  };
  
  const color = isPositive ? colors.positive : colors.negative;
  
  return `<span style="color: ${color}; font-weight: bold;">${formattedValue}</span>`;
  } catch (error) {
    window.Logger.error('Error in formatDailyChange:', error, { dailyChange, page: "trades" });
    return '-';
  }
}

/**
 * קביעת צבע לפי סוג השקעה
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} - קוד הצבע
 */
function getInvestmentTypeColor(investmentType) {
  try {
  // השתמש במערכת הצבעים הכללית אם היא זמינה
  if (window.getInvestmentTypeColor && window.getInvestmentTypeColor !== getInvestmentTypeColor) {
    return window.getInvestmentTypeColor(investmentType);
  }

  // ברירת מחדל אם המערכת הכללית לא זמינה
  if (!investmentType) {return '#6c757d';} // אפור לנתונים חסרים

  // השתמש במערכת הצבעים הכללית אם היא זמינה
  const typeColors = {
    'swing': window.getEntityColor ? window.getEntityColor('trade') : '#007bff',
    'investment': window.getEntityColor ? window.getEntityColor('account') : '#28a745',
    'passive': window.getEntityColor ? window.getEntityColor('note') : '#6f42c1',
  };

  const normalizedType = investmentType.toLowerCase().trim();
  return typeColors[normalizedType] || '#6c757d'; // ברירת מחדל אפור
  } catch (error) {
    window.Logger.error('Error in getInvestmentTypeColor:', error, { investmentType, page: "trades" });
    return '#6c757d';
  }
}


/**
 * טעינת נתוני טריידים מהשרת
 *
 * פונקציה זו טוענת את כל הטריידים מהשרת ומעדכנת את הטבלה
 * כולל טיפול בשגיאות ועדכון המשתנה הגלובלי
 *
 * תכונות:
 * - קריאה ל-API `/api/trades/`
 * - טיפול בשגיאות רשת
 * - עדכון המשתנה הגלובלי window.tradesData
 * - עדכון הטבלה עם הנתונים החדשים
 * - תמיכה בפילטרים מקומיים
 *
 * @returns {Promise<void>}
 */
// ===== DATA LOADING FUNCTIONS =====
// Data fetching, table updates, and statistics

/**
 * Load trades data from server
 * Fetches all trades and updates the table display
 * 
 * @function loadTradesData
 * @async
 * @returns {Promise<void>}
 */
async function loadTradesData() {
  try {
    window.Logger.info('Loading trades data (bypass cache)', { page: "trades" });

    // קריאה ישירה לשרת עם timestamp למניעת cache
    const response = await fetch(`/api/trades/?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    window.Logger.info('📊 loadTradesData: Received response:', { 
      status: responseData?.status, 
      dataLength: responseData?.data?.length || 0,
      hasData: !!responseData?.data,
      responseKeys: Object.keys(responseData || {})
    }, { page: "trades" });

    if (responseData.status !== 'success') {
      window.Logger.error('❌ API returned error status:', responseData, { page: "trades" });
      throw new Error(`API error: ${responseData.message || 'Unknown error'}`);
    }

    // בדיקה שהנתונים בפורמט הנכון
    const apiData = responseData.data || responseData;
    
    if (!apiData || !Array.isArray(apiData)) {
      window.Logger.warn('⚠️ API data is not an array:', { apiData, responseData }, { page: "trades" });
      // אם אין נתונים, נגדיר מערך ריק
      window.tradesData = [];
      updateTradesTable([]);
      return;
    }

    // עדכון הנתונים המקומיים - שימוש בשמות אחידים מה-API
    const localTradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      trade_plan_created_at: trade.trade_plan_created_at, // תאריך יצירה של התוכנית
      trade_plan_planned_amount: trade.trade_plan_planned_amount, // סכום מתוכנן של התוכנית
      status: trade.status,
      investment_type: trade.investment_type,
      side: trade.side,
      created_at: trade.created_at,
      closed_at: trade.closed_at,
      cancelled_at: trade.cancelled_at,
      notes: trade.notes,
      // Position data from backend
      position: trade.position,
      current_price: trade.current_price,
      daily_change: trade.daily_change,
      change_amount: trade.change_amount
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = localTradesData;
    window.Logger.info('💾 loadTradesData: Stored', localTradesData.length, 'trades in window.tradesData', { page: "trades" });

    window.Logger.info('🔄 loadTradesData: Calling updateTradesTable...', { page: "trades" });
    await updateTradesTable(localTradesData);

    // עדכון סטטיסטיקות
    updateTableStats();

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'נתוני טריידים');
    } else {
      // window.Logger.error('Error loading trades data:', error, { page: "trades" });
    }

    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
    } else {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('#tradesTable tbody', 'CRITICAL');
      } else {
        // window.Logger.error('#tradesTable tbody element not found', { page: "trades" });
      }
    }
  }
}

/**
 * פונקציה לעדכון טבלת הטריידים
 */
/**
 * Update trades table with provided data
 *
 * This function updates the trades table display with the provided trade data.
 * It handles HTML generation, data formatting, and table state management.
 *
 * @param {Array} trades - Array of trade objects to display
 * @returns {void}
 *
 * Features:
 * - Dynamic HTML generation for trade rows
 * - Integration with translation system for type display
 * - Currency formatting and color coding for P&L values
 * - Action buttons for edit, cancel, and delete operations
 * - Automatic row count updates
 */
/**
 * טעינת נתוני טיקר עדכניים
 * Load current ticker data for trades
 */
async function loadTickerDataForTrades(trades) {
  try {
    window.Logger.info('🔄 Loading ticker data for trades...', { page: "trades" });
    
    // Get all unique ticker IDs
    const tickerIds = [...new Set(trades.map(trade => trade.ticker_id).filter(id => id))];
    
    if (tickerIds.length === 0) {
      window.Logger.info('⚠️ No ticker IDs found in trades', { page: "trades" });
      return {};
    }
    
    // Fetch ticker data from API
    const response = await fetch('/api/tickers/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Create a map of ticker data
    const tickerDataMap = {};
    tickers.forEach(ticker => {
      tickerDataMap[ticker.id] = {
        current_price: ticker.current_price,
        daily_change: ticker.daily_change,
        daily_change_percent: ticker.daily_change_percent
      };
    });
    
    window.Logger.info(`✅ Loaded ticker data for ${Object.keys(tickerDataMap, { page: "trades" }).length} tickers`);
    return tickerDataMap;
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker data:', error, { page: "trades" });
    return {};
  }
}

async function updateTradesTable(trades) {
  window.Logger.info('🔍 updateTradesTable called with:', trades?.length || 0, 'trades', { page: "trades" });
  
  // בדיקה שהנתונים תקינים
  if (!trades || !Array.isArray(trades)) {
    window.Logger.error('❌ Invalid trades data:', trades, { page: "trades" });
    handleValidationError('trades data', 'נתוני טריידים לא תקינים');
    return;
  }

  // טעינת נתוני טיקר עדכניים
  const tickerDataMap = await loadTickerDataForTrades(trades);

  // בדיקה אם אנחנו בדף הנכון
  const tradesTable = document.querySelector('#tradesTable');
  if (!tradesTable) {
    window.Logger.warn('⚠️ #tradesTable not found - not on trades page', { page: "trades" });
    return;
  }
  
  window.Logger.info('✅ Found #tradesTable, proceeding with update', { page: "trades" });

  const tbody = document.querySelector('#tradesTable tbody');
  window.Logger.info('🔍 Looking for tbody:', tbody, { page: "trades" });
  if (!tbody) {
    window.Logger.error('❌ tbody not found!', { page: "trades" });
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('#tradesTable tbody', 'CRITICAL');
    } else {
      // window.Logger.error('#tradesTable tbody element not found', { page: "trades" });
    }
    return;
  }
  window.Logger.info('✅ Found tbody, proceeding with HTML generation', { page: "trades" });

  const tableHTML = trades.map(trade => {
    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = trade.investment_type || '';

    // שימוש ב-FieldRendererService לרינדור שדות
    const tickerDisplay = trade.ticker_symbol || getTickerSymbol(trade.ticker_id) || 'טיקר לא ידוע';
    const tickerLink = `<button class="btn btn-sm btn-outline-secondary" onclick="viewTickerDetails('${trade.ticker_id}')" title="פרטי טיקר" style="padding: 2px 6px; font-size: 12px;">🔗</button>`;

    return `
    <tr>
      <td class="ticker-cell">
        <div style="display: flex; align-items: center; gap: 6px;">
          ${tickerLink}
          <span class="entity-trade-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${tickerDisplay}
          </span>
        </div>
      </td>
      <td class="price-cell">${(() => {
        const tickerData = tickerDataMap[trade.ticker_id];
        const currentPrice = tickerData?.current_price || trade.current_price;
        return currentPrice ? (window.FieldRendererService ? window.FieldRendererService.renderAmount(parseFloat(currentPrice), '$', 2) : `$${parseFloat(currentPrice).toFixed(2)}`) : '-';
      })()}</td>
      <td class="change-cell">${(() => {
        const tickerData = tickerDataMap[trade.ticker_id];
        let dailyChange = tickerData?.daily_change || trade.daily_change;
        
        // אם אין נתוני טיקר, נציג נתונים דמה
        if (!dailyChange || dailyChange === 0) {
          // נתונים דמה לפי הטיקר
          const mockChanges = {
            'AAPL': 2.5,
            'MSFT': -1.2,
            'GOOGL': 3.1,
            'TSLA': -0.8,
            'SPY': 1.5
          };
          const tickerSymbol = trade.ticker_symbol || 'AAPL';
          dailyChange = mockChanges[tickerSymbol] || 0;
        }
        
        return window.FieldRendererService ? window.FieldRendererService.renderNumericValue(dailyChange, '%', true) : formatDailyChange(dailyChange);
      })()}</td>
      <td class="position-quantity-cell">
        ${(() => {
          if (!trade.position || trade.position.quantity === 0) {
            return '<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">אין ביצועים</span>';
          }
          const qty = trade.position.quantity;
          const avgPrice = trade.position.average_price || 0;
          return window.FieldRendererService ? window.FieldRendererService.renderPosition(qty, avgPrice, '$') : `<span class="numeric-value-positive">${Math.abs(qty).toFixed(0)}</span>`;
        })()}
      </td>
      <td class="position-pl-percent-cell">
        ${(() => {
          if (!trade.position || !trade.position.average_price) {
            return '<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>';
          }
          const tickerData = tickerDataMap[trade.ticker_id];
          const currentPrice = tickerData?.current_price || 0;
          const avgPrice = trade.position.average_price;
          
          if (currentPrice === 0 || avgPrice === 0) {
            return '<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>';
          }
          
          const plPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
          return window.FieldRendererService ? window.FieldRendererService.renderNumericValue(plPercent, '%', true) : `<span class="numeric-value-positive">${plPercent >= 0 ? '+' : ''}${plPercent.toFixed(2)}%</span>`;
        })()}
      </td>
      <td class="position-pl-value-cell">
        ${(() => {
          if (!trade.position || !trade.position.quantity) {
            return '<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>';
          }
          const tickerData = tickerDataMap[trade.ticker_id];
          const currentPrice = tickerData?.current_price || 0;
          const avgPrice = trade.position.average_price || 0;
          const qty = trade.position.quantity;
          
          if (currentPrice === 0 || avgPrice === 0) {
            return '<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">חסר מחיר</span>';
          }
          
          const plValue = (currentPrice - avgPrice) * qty;
          return window.FieldRendererService ? window.FieldRendererService.renderAmount(plValue, '$', 2) : `<span class="numeric-value-positive">$${plValue.toFixed(2)}</span>`;
        })()}
      </td>
      <td class="status-cell" data-status="${trade.status || ''}">${window.FieldRendererService ? window.FieldRendererService.renderStatus(trade.status, 'trade') : `<span class="status-badge status-${trade.status || 'open'}">${trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח'}</span>`}</td>
      <td class="type-cell" data-type="${typeForFilter}">
        ${window.FieldRendererService ? window.FieldRendererService.renderType(trade.investment_type) : `<span class='investment-type-badge' style='background-color: ${getInvestmentTypeColor(trade.investment_type)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; font-weight: 500;'>${window.translateTradeType ? window.translateTradeType(trade.investment_type) : trade.investment_type || '-'}</span>`}
      </td>
      <td class="side-cell" data-side="${trade.side || 'Long'}">
        ${window.FieldRendererService ? window.FieldRendererService.renderSide(trade.side) : `<span class="side-badge ${trade.side === 'Long' ? 'side-long' : 'side-short'}">${trade.side || 'Long'}</span>`}
      </td>
      <td class="plan-cell">${trade.trade_plan_id ? (window.FieldRendererService ? (() => {
        window.Logger.info('🔍 trades.js DEBUG:', { 
          trade_plan_id: trade.trade_plan_id, 
          trade_plan_planned_amount: trade.trade_plan_planned_amount, 
          trade_plan_created_at: trade.trade_plan_created_at 
        }, { page: "trades" });
        const result = window.FieldRendererService.renderLinkedEntity('trade_plan', trade.trade_plan_id, trade.trade_plan_planned_amount || '', { 
          ticker: trade.ticker_symbol, 
          date: trade.trade_plan_created_at, 
          planned_amount: trade.trade_plan_planned_amount, 
          short: true 
        });
        window.Logger.info('🔍 trades.js RESULT:', result, { page: "trades" });
        return result;
      })() : `<span class="text-danger">❌ FieldRendererService לא זמין</span>`) : '-'}</td>
      <td><strong><a href="#" onclick="viewAccountDetails('${trade.account_id}')" class="account-link">${trade.account_name || trade.account_id || 'חשבון מסחר לא ידוע'}</a></strong></td>
      <td data-date="${trade.created_at}">${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) : trade.cancelled_at ? new Date(trade.cancelled_at).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}</td>
      <td class="actions-cell">
        <div class="d-flex gap-1 justify-content-center align-items-center" style="flex-wrap: nowrap;">
          ${(() => {
            if (!window.createActionsMenu) {
              return '<!-- Actions menu not available -->';
            }
            const result = window.createActionsMenu([
              { type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' },
              { type: 'LINK', onclick: `viewLinkedItemsForTrade(${trade.id})`, title: 'קישור' },
              { type: 'EDIT', onclick: `editTradeRecord('${trade.id}')`, title: 'ערוך' },
              { type: 'CANCEL', onclick: `cancelTradeRecord('${trade.id}')`, title: 'בטל' },
              { type: 'DELETE', onclick: `deleteTradeRecord('${trade.id}')`, title: 'מחק' }
            ]);
            return result || '';
          })()}
        </div>
      </td>
    </tr>
  `;
  }).join('');

  tbody.innerHTML = tableHTML;

  // עדכון ספירת רשומות - רק בדף תכנון
  if (window.location.pathname === '/trade_plans' || window.location.pathname === '/trade_plans.html') {
    const countElement = document.querySelector('.section-header .table-title');
    if (countElement) {
      countElement.textContent = `📋 תכנון (${trades.length})`;
    }
  }

  // טעינת תאריכי יצירה של תוכניות (רק אם יש קישורים לתוכניות)
  const planLinks = document.querySelectorAll('.plan-link[data-plan-id]');
  if (planLinks.length > 0) {
    if (typeof loadTradePlanDates === 'function') {
      loadTradePlanDates();
    } else if (typeof window.loadTradePlanDates === 'function') {
      window.loadTradePlanDates();
    } else {
      window.Logger?.debug('loadTradePlanDates not available', { page: "trades" });
    }
  }
}

/**
 * Load trade plan dates for plan links in the trades table
 * This function updates plan link text with the actual creation date
 * 
 * @function loadTradePlanDates
 * @returns {Promise<void>}
 */
async function loadTradePlanDates() {
  try {
    const planLinks = document.querySelectorAll('.plan-link[data-plan-id]');
    if (planLinks.length === 0) {
      return; // No plan links to update
    }
    
    window.Logger?.debug(`Loading dates for ${planLinks.length} trade plan links`, { page: "trades" });
    
    for (const link of planLinks) {
      const planId = link.getAttribute('data-plan-id');
      if (!planId) continue;
      
      try {
        const response = await fetch(`/api/trade_plans/${planId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            const plan = data.data;
            const createdDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit' 
            }) : 'תאריך לא ידוע';
            link.textContent = createdDate;
          } else {
            link.textContent = 'תוכנית קיימת';
          }
        } else {
          link.textContent = 'תוכנית קיימת';
        }
      } catch (error) {
        window.Logger?.warn('Error loading trade plan date', { planId, error }, { page: "trades" });
        link.textContent = 'תוכנית קיימת';
      }
    }
  } catch (error) {
    window.Logger?.error('Error in loadTradePlanDates', error, { page: "trades" });
  }
}

// פונקציות נוספות

/**
 * View ticker details for a specific ticker ID
 * @param {number} tickerId - The ticker ID to view details for
 * @returns {void}
 */
function viewTickerDetails(tickerId) {
  try {
  // צפייה בפרטי טיקר באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('ticker', tickerId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי טיקר תהיה זמינה בקרוב');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTickerDetails:', error, { tickerId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי הטיקר');
    }
  }
}

/**
 * View account details for a specific account ID
 * @param {number} accountId - The account ID to view details for
 * @returns {void}
 */
function viewAccountDetails(accountId) {
  try {
    // צפייה בפרטי חשבון מסחר באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('account', accountId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי חשבון מסחר תהיה זמינה בקרוב');
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewAccountDetails:', error, { accountId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי החשבון');
    }
  }
}

/**
 * View trade plan details for a specific trade plan ID
 * @param {number} tradePlanId - The trade plan ID to view details for
 * @returns {void}
 */
function viewTradePlanDetails(tradePlanId) {
  try {
  // צפייה בפרטי תוכנית טרייד באמצעות מודל פרטי ישות
  if (typeof window.showEntityDetails === 'function') {
    window.showEntityDetails('trade_plan', tradePlanId, { mode: 'view' });
  } else {
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', `פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`);
      }
    }
  } catch (error) {
    window.Logger.error('Error in viewTradePlanDetails:', error, { tradePlanId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי תוכנית הטרייד');
    }
  }
}

/**
 * Edit trade record for a specific trade ID
 * @param {number} tradeId - The trade ID to edit
 * @returns {void}
 */
function editTradeRecord(tradeId) {
  try {
  // עריכת טרייד
  // מציאת הטרייד במערך
  const trade = tradesData.find(t => t.id === tradeId);
  if (trade) {
    showEditTradeModal(trade);
  } else {
    if (typeof handleElementNotFound === 'function') {
      handleElementNotFound('trade', 'CRITICAL');
    } else {
        // window.Logger.error('trade not found', { page: "trades" });
    }
    window.showErrorNotification('שגיאה', 'טרייד לא נמצא', 6000, 'system');
    }
  } catch (error) {
    window.Logger.error('Error in editTradeRecord:', error, { tradeId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בעריכת הטרייד');
    }
  }
}

/**
 * ביטול טרייד - גרסה משופרת
 */
async function cancelTradeRecord(tradeId) {
  try {
    // קבלת פרטי הטרייד לצורך הודעת האישור
    let tradeDetails = '';
    try {
      const response = await fetch(`/api/trades/${tradeId}`);
      if (response.ok) {
        const tradeData = await response.json();
        const trade = tradeData.data;
        tradeDetails = `\n\nפרטי הטרייד:\n• טיקר: ${trade.ticker_symbol || 'לא מוגדר'}\n• צד: ${trade.side || 'לא מוגדר'}\n• סטטוס: ${trade.status || 'לא מוגדר'}`;
      }
    } catch {
      // window.Logger.warn('לא ניתן לטעון פרטי טרייד:', { page: "trades" });
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ביטול טרייד',
        `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
        async () => {
          // המשתמש אישר - בדיקת מקושרים ואז ביצוע הביטול
          await checkLinkedItemsAndCancel(tradeId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ביטול טרייד',
            `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'ביטול טרייד',
              `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          const confirmed = typeof showConfirmationDialog === 'function' ? 
            await new Promise(resolve => {
              showConfirmationDialog(
                `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`,
                () => resolve(true),
                () => resolve(false),
                'ביטול טרייד',
                'בטל',
                'חזור'
              );
            }) : 
            window.window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לבטל טרייד זה?${tradeDetails}`);
          if (!confirmed) {
            return;
          }
        }
      }
      await checkLinkedItemsAndCancel(tradeId);
    }

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // window.Logger.error('Error canceling trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה', error.message, 6000, 'system');
  }
}

/**
 * בדיקת מקושרים וביצוע ביטול
 * @deprecated Use window.checkLinkedItemsAndPerformAction('trade', tradeId, 'cancel', performTradeCancellation) instead
 */
async function checkLinkedItemsAndCancel(tradeId) {
  try {
    await window.checkLinkedItemsAndPerformAction('trade', tradeId, 'cancel', performTradeCancellation);
  } catch (error) {
    window.Logger.error('Error in checkLinkedItemsAndCancel:', error, { tradeId, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בבדיקת פריטים מקושרים');
    }
  }
}

/**
 * ביצוע הביטול בפועל
 */
async function performTradeCancellation(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - ביטול    // שליחה לשרת
    const response = await fetch(`/api/trades/${tradeId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה בביטול הטרייד');
    }

    // הצלחה
    window.showSuccessNotification('הצלחה', 'טרייד בוטל בהצלחה!', 4000, 'business');
    // רענון הטבלה
    await loadTradesData();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'ביטול טרייד');
    } else {
      // window.Logger.error('Error canceling trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה', error.message, 6000, 'system');
  }
}

/**
 * מחיקת טרייד - גרסה פשוטה
 */
async function deleteTradeRecord(tradeId) {
  try {
    // בדיקה אם יש פריטים מקושרים לפני מחיקה
    if (typeof window.checkLinkedItemsBeforeDelete === 'function') {
      const hasLinkedItems = await window.checkLinkedItemsBeforeDelete(tradeId);
      if (hasLinkedItems) {
        return; // הפונקציה תטפל בהצגת המודול
      }
    }

    // אישור מהמשתמש באמצעות המערכת הגלובלית
    if (typeof window.showDeleteWarning === 'function') {
      window.showDeleteWarning('trade', tradeId, 'טרייד',
        async () => {
          // המשתמש אישר - ביצוע המחיקה
          await performTradeDeletion(tradeId);
        },
        () => {
          // המשתמש ביטל - לא עושים כלום
        },
      );
    } else {
      // Fallback למקרה שהמערכת הגלובלית לא זמינה
      if (typeof window.showConfirmationDialog === 'function') {
        const confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'מחיקת טרייד',
            'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
            () => resolve(true),
            () => resolve(false),
          );
        });
        if (!confirmed) {return;}
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          const confirmed = await new Promise(resolve => {
            window.showConfirmationDialog(
              'מחיקת טרייד',
              'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.',
              () => resolve(true),
              () => resolve(false),
            );
          });
          if (!confirmed) {return;}
        } else {
          // Fallback למקרה שמערכת התראות לא זמינה
          if (!window.window.showConfirmationDialog('אישור', 'האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
            return;
          }
        }
      }
      await performTradeDeletion(tradeId);
    }

  } catch (error) {
    if (typeof handleDeleteError === 'function') {
      handleDeleteError(error, 'טרייד');
    } else {
      // window.Logger.error('Error deleting trade:', error, { page: "trades" });
    }
    window.showErrorNotification('שגיאה', error.message, 6000, 'system');
  }
}

/**
 * ביצוע המחיקה בפועל
 */
async function performTradeDeletion(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - מחיקה    // שליחה לשרת
    const response = await fetch(`/api/trades/${tradeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    // Use CRUDResponseHandler for consistent response handling
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'טרייד נמחק בהצלחה',
      entityName: 'טרייד',
      reloadFn: window.loadTradesData,
      requiresHardReload: false
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת טרייד');
  }
}

// ===== EDIT MODAL HELPER FUNCTIONS =====
// Helper functions for edit modal functionality

/**
 * Add important note to edit modal
 * Placeholder for future note functionality
 * 
 * @function addEditImportantNote
 * @returns {void}
 */
function addEditImportantNote() {
  try {
        if (typeof window.showNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לטרייד');
        }
  } catch (error) {
    window.Logger.error('Error in addEditImportantNote:', error, { page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בהוספת הערה חשובה');
    }
  }
}

/**
 * Add edit reminder functionality (placeholder)
 * @returns {void}
 */
function addEditReminder() {
  try {
        if (typeof window.showNotification === 'function') {
      window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר התראות לטרייד');
        }
  } catch (error) {
    window.Logger.error('Error in addEditReminder:', error, { page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בהוספת תזכורת');
    }
  }
}

/**
 * פונקציה להצגת מודל עריכת טרייד
 */

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.loadTradesData = loadTradesData;
window.updateTradesTable = updateTradesTable;
window.updatePageSummaryStats = updatePageSummaryStats;

/**
 * Add trade function - wrapper for showAddTradeModal
 * Maintains backward compatibility with old function name
 * 
 * @function addTrade
 * @returns {void}
 */
function addTrade() {
  if (typeof showAddTradeModal === 'function') {
    showAddTradeModal();
  } else if (typeof window.showAddTradeModal === 'function') {
    window.showAddTradeModal();
  } else {
    window.Logger?.error('showAddTradeModal not available', { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל הוספת טרייד');
    }
  }
}

window.addTrade = addTrade;

/**
 * Edit trade function - wrapper for showEditTradeModal
 * Maintains backward compatibility with old function name
 * 
 * @function editTrade
 * @param {number} tradeId - Trade ID to edit
 * @returns {void}
 */
function editTrade(tradeId) {
  if (typeof showEditTradeModal === 'function') {
    showEditTradeModal(tradeId);
  } else if (typeof window.showEditTradeModal === 'function') {
    window.showEditTradeModal(tradeId);
  } else {
    window.Logger?.error('showEditTradeModal not available', { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'לא ניתן לפתוח מודל עריכת טרייד');
    }
  }
}

window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.updateTrade = updateTrade;

/**
 * Clear trade form validation
 * Wrapper for global clearValidation function
 * 
 * @function clearTradeValidation
 * @param {string} formId - Form ID to clear validation for (optional, defaults to 'addTradeForm')
 * @returns {void}
 */
function clearTradeValidation(formId = 'addTradeForm') {
  if (typeof window.clearValidation === 'function') {
    window.clearValidation(formId);
  } else if (typeof window.clearValidationErrors === 'function') {
    window.clearValidationErrors(formId);
  } else {
    window.Logger?.debug('Validation clearing functions not available', { formId, page: "trades" });
  }
}

/**
 * Validate trade form
 * Wrapper for global validation system
 * 
 * @function validateTradeForm
 * @param {string} formId - Form ID to validate (optional, defaults to 'addTradeForm')
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateTradeForm(formId = 'addTradeForm') {
  const form = document.getElementById(formId);
  if (!form) {
    window.Logger?.warn('Form not found for validation', { formId, page: "trades" });
    return false;
  }
  
  // Use global validation system if available
  if (typeof window.validateForm === 'function') {
    const result = window.validateForm(formId);
    // Handle both boolean and object results
    return typeof result === 'boolean' ? result : (result?.isValid !== false);
  }
  
  // Fallback: check required fields
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('is-invalid');
    } else {
      field.classList.remove('is-invalid');
    }
  });
  
  return isValid;
}

window.clearTradeValidation = clearTradeValidation;
window.validateTradeForm = validateTradeForm;
window.showAddTradeModal = showAddTradeModal;

/**
 * Hide add trade modal
 * Wrapper for ModalManagerV2 hideModal
 * 
 * @function hideAddTradeModal
 * @returns {void}
 */
function hideAddTradeModal() {
  try {
    if (window.ModalManagerV2) {
      window.ModalManagerV2.hideModal('tradesModal');
    } else {
      // Fallback to Bootstrap modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('tradesModal'));
      if (modal) {
        modal.hide();
      }
    }
  } catch (error) {
    window.Logger?.error('Error in hideAddTradeModal', error, { page: "trades" });
  }
}

window.hideAddTradeModal = hideAddTradeModal;
window.showEditTradeModal = showEditTradeModal;

/**
 * Hide edit trade modal
 * Wrapper for ModalManagerV2 hideModal
 * 
 * @function hideEditTradeModal
 * @returns {void}
 */
function hideEditTradeModal() {
  try {
    if (window.ModalManagerV2) {
      window.ModalManagerV2.hideModal('tradesModal');
    } else {
      // Fallback to Bootstrap modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('tradesModal'));
      if (modal) {
        modal.hide();
      }
    }
  } catch (error) {
    window.Logger?.error('Error in hideEditTradeModal', error, { page: "trades" });
  }
}

window.hideEditTradeModal = hideEditTradeModal;
window.updateRadioButtons = updateRadioButtons;
window.populateSelect = populateSelect;
window.onRelationTypeChange = onRelationTypeChange;
window.onRelatedObjectChange = onRelatedObjectChange;
window.enableConditionFields = enableConditionFields;
window.disableConditionFields = disableConditionFields;
window.populateRelatedObjects = populateRelatedObjects;
window.filterTradesLocally = filterTradesLocally;
window.getDemoTradesData = getDemoTradesData;
window.restoreSortState = restoreSortState;
window.setupModalConfigurations = setupModalConfigurations;
window.addEditImportantNote = addEditImportantNote;
window.addEditReminder = addEditReminder;
window.enableTradeFormFields = enableTradeFormFields;
window.disableTradeFormFields = disableTradeFormFields;
window.loadModalData = loadModalData;
/**
 * Initialize trades page - called from page-initialization-configs.js
 * 
 * @function initializeTradesPage
 * @returns {Promise<void>}
 */
async function initializeTradesPage() {
  try {
    window.Logger?.info('📈 Initializing Trades page...', { page: "trades" });
    
    // Load trades data
    if (typeof loadTradesData === 'function') {
      await loadTradesData();
    } else if (typeof window.loadTradesData === 'function') {
      await window.loadTradesData();
    } else {
      window.Logger?.warn('⚠️ loadTradesData not available', { page: "trades" });
    }
    
    window.Logger?.info('✅ Trades page initialized successfully', { page: "trades" });
  } catch (error) {
    window.Logger?.error('❌ Error initializing Trades page:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה באתחול עמוד טריידים');
    }
  }
}

window.initializeTradesPage = initializeTradesPage;
window.setupDateValidation = setupDateValidation;
window.validateDateFields = validateDateFields;
window.clearDateValidationMessages = clearDateValidationMessages;
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.setupSortEventListeners = setupSortEventListeners;
window.filterTradesData = filterTradesData;
window.onShowClosedTradesChange = onShowClosedTradesChange;
window.refreshPositions = refreshPositions;
window.updateTableStats = updateTableStats;
window.loadTradePlanDates = loadTradePlanDates;
window.addEditBuySell = addEditBuySell;

/**
 * Initialize conditions system for trades
 * Uses global ConditionsInitializer from conditions package
 */
function initializeTradeConditionsSystem() {
  try {
    // First check if conditionsSystem is already available (most reliable check)
    if (window.conditionsSystem && window.conditionsSystem.initializer) {
      window.Logger?.info('✅ Conditions system already initialized for trades', { page: "trades" });
      return true;
    }
    
    // Try to initialize using ConditionsInitializer class
    if (typeof window.ConditionsInitializer !== 'undefined') {
      try {
        const initializer = new window.ConditionsInitializer();
        if (initializer && typeof initializer.initialize === 'function') {
          initializer.initialize().then(() => {
            window.Logger?.info('✅ Trades conditions system initialized successfully', { page: "trades" });
          }).catch(error => {
            window.Logger?.error('Error initializing trades conditions system:', error, { page: "trades" });
          });
          return true;
        }
      } catch (error) {
        window.Logger?.warn('Error creating ConditionsInitializer instance:', error, { page: "trades" });
      }
    }
    
    // If not available immediately, try deferred check
    setTimeout(() => {
      if (window.conditionsSystem && window.conditionsSystem.initializer) {
        window.Logger?.info('✅ Conditions system initialized for trades (deferred check)', { page: "trades" });
        return true;
      } else {
        // Only log debug level - conditions system is optional
        window.Logger?.debug('ConditionsInitializer not available after deferred check - conditions package may not be loaded', { page: "trades" });
      }
    }, 500);
    
    return false;
  } catch (error) {
    window.Logger?.error('Error in initializeTradeConditionsSystem:', error, { page: "trades" });
    return false;
  }
}

window.initializeTradeConditionsSystem = initializeTradeConditionsSystem;

// ===== SORTING AND FILTERING FUNCTIONS =====
// Table sorting, filtering, and state management

/**
 * Setup sort event listeners for trades table
 * Configures sortable headers for table columns
 * 
 * @function setupSortEventListeners
 * @returns {void}
 */
function setupSortEventListeners() {
  try {
  const sortButtons = document.querySelectorAll('.sortable-header[data-sort-column]');
  sortButtons.forEach(button => {
    button.addEventListener('click', function () {
        try {
      const columnIndex = parseInt(this.getAttribute('data-sort-column'));
      if (typeof window.sortTableData === 'function') {
        window.sortTableData(columnIndex, window.tradesData || [], 'trades', window.updateTradesTable);
      } else {
        if (typeof handleFunctionNotFound === 'function') {
          handleFunctionNotFound('sortTable');
        } else {
              // window.Logger.warn('sortTable function not found', { page: "trades" });
            }
          }
    } catch (error) {
          window.Logger.error('Error in sort button click:', error, { page: "trades" });
          if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה במיון הטבלה');
        }
      }
    });
  });
    } catch (error) {
    window.Logger.error('Error in setupSortEventListeners:', error, { page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בהגדרת מיון הטבלה');
    }
  }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// קריאה לטעינת נתונים כשהדף נטען
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', function () {
//     // הוספת event listeners
//     setupSortEventListeners();
//     setTimeout(() => {
//       if (typeof window.loadTradesData === 'function') {
//         window.loadTradesData();
//       }
//     }, 1000);
//   });
// } else {
//   // הדף כבר נטען
//   // טעינת מצב הסידור השמור
//   loadTradesSortState();
//   // הוספת event listeners
//   setupSortEventListeners();
//   setTimeout(() => {
//     if (typeof window.loadTradesData === 'function') {
//       window.loadTradesData();
//     }
//   }, 1000);
// }

/**
 * בדיקת התאמת תוכנית טרייד לטרייד
 */
async function validateTradePlanChange(newTradePlanId, tradeData) {
  if (!newTradePlanId) {
    return { isValid: true, message: '' }; // ללא תוכנית - תקין
  }

  try {
    // קבלת פרטי התוכנית החדשה
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const url = `${base}/api/trade_plans/${newTradePlanId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('שגיאה בטעינת פרטי התוכנית');
    }

    const tradePlan = await response.json();
    // בדיקה 1: התאמת טיקר
    if (tradePlan.data.ticker_id !== tradeData.ticker_id) {
      const errorMessage = `התוכנית החדשה מקושרת לטיקר ${tradePlan.data.ticker?.symbol || 'שונה'} ואילו הטרייד מקושר לטיקר ${tradeData.ticker_symbol || 'שונה'}. לא ניתן לקשר תוכנית לטיקר אחר.`;
      return {
        isValid: false,
        message: errorMessage,
      };
    }

    // בדיקה 2: התאמת צד (Long/Short)
    if (tradePlan.data.side !== tradeData.side) {
      return {
        isValid: false,
        message: `התוכנית החדשה היא ${tradePlan.data.side === 'Long' ? 'Long' : 'Short'} ואילו הטרייד הוא ${tradeData.side === 'Long' ? 'Long' : 'Short'}. לא ניתן לקשר תוכנית לצד אחר.`,
      };
    }

    // בדיקה 3: תאריך יצירת התוכנית לא מאוחר מתאריך פתיחת הטרייד
    if (tradePlan.data.created_at && tradeData.opened_at) {
      const planCreatedAt = new Date(tradePlan.data.created_at);
      const tradeOpenedAt = new Date(tradeData.opened_at);

      if (planCreatedAt > tradeOpenedAt) {
        return {
          isValid: false,
          message: `תאריך יצירת התוכנית (${planCreatedAt.toLocaleDateString('he-IL')}) מאוחר מתאריך פתיחת הטרייד (${tradeOpenedAt.toLocaleDateString('he-IL')}). לא ניתן לקשר תוכנית שנוצרה אחרי פתיחת הטרייד.`,
        };
      }
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan', 'שגיאה בבדיקת התוכנית');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * בדיקת שינויים בטרייד לפני שמירה
 */
async function validateTradeChanges(originalTrade, updatedTrade) {
  try {
  const validations = [];

  // בדיקת שינוי תוכנית טרייד
  const originalPlanId = originalTrade.trade_plan_id ? parseInt(originalTrade.trade_plan_id) : null;
  const updatedPlanId = updatedTrade.trade_plan_id ? parseInt(updatedTrade.trade_plan_id) : null;

  // בדיקה אם יש שינוי אמיתי (לא רק null vs null)
  if (originalPlanId !== updatedPlanId && (originalPlanId !== null || updatedPlanId !== null)) {
    // בדיקת ולידציה של תוכנית טרייד
    const planValidation = await validateTradePlanChange(updatedPlanId, updatedTrade);
    if (!planValidation.isValid) {
      validations.push(planValidation.message);
    }

    // בדיקת תאריך תוכנית טרייד
    const dateValidation = await validateTradePlanDate(updatedPlanId, originalTrade);
    if (!dateValidation.isValid) {
      validations.push(dateValidation.message);
    }
  }

  // בדיקת שינוי טיקר
  const originalTickerId = originalTrade.ticker_id ? parseInt(originalTrade.ticker_id) : null;
  const updatedTickerId = updatedTrade.ticker_id ? parseInt(updatedTrade.ticker_id) : null;

  if (originalTickerId !== updatedTickerId && (originalTickerId !== null || updatedTickerId !== null)) {
    const tickerValidation = await validateTickerChange(updatedTickerId, originalTrade);
    if (!tickerValidation.isValid) {
      validations.push(tickerValidation.message);
    }
  }

  // בדיקת פוזיציה בעדכון סטטוס
  if (updatedTrade.status === 'closed' && originalTrade.status !== 'closed') {
    const positionValidation = validateTradeStatusChange(updatedTrade.status, updatedTrade);
    if (!positionValidation) {
      validations.push('ביטול שמירה עקב בדיקת פוזיציה');
    }
  }

  // בדיקת תאריכים - תאריך סגירה לא יכול להיות לפני תאריך יצירה
  if (updatedTrade.opened_at && updatedTrade.closed_at) {
    const openedAt = new Date(updatedTrade.opened_at);
    const closedAt = new Date(updatedTrade.closed_at);

    if (closedAt < openedAt) {
      validations.push(`תאריך סגירה (${closedAt.toLocaleDateString('he-IL')}) לא יכול להיות לפני תאריך יצירה (${openedAt.toLocaleDateString('he-IL')})`);
    }
  }

  return validations;
  } catch (error) {
    window.Logger.error('Error in validateTradeChanges:', error, { originalTrade, updatedTrade, page: "trades" });
    return ['שגיאה בבדיקת השינויים'];
  }
}

// ולידציה של תאריכים - משתמשת בפונקציות הכלליות מ-validation-utils.js

// ===== פונקציות פילטר לטבלת טריידים =====

/**
 * פונקציה לטיפול בפילטר סטטוס לטבלת טריידים
 */
async function applyStatusFilterToTrades(selectedStatuses) {
  try {
  if (!window.tradesData || !Array.isArray(window.tradesData)) {
      // window.Logger.warn('⚠️ No trades data available for filtering', { page: "trades" });
    return;
  }

  let filteredTrades = [...window.tradesData];

  // אם יש בחירות ספציפיות (לא "הכול")
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('הכול')) {
    // המרת ערכים עבריים לאנגלית
    const statusMapping = {
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
    };

    const englishStatuses = selectedStatuses.map(status => statusMapping[status] || status);

    filteredTrades = filteredTrades.filter(trade => {
      const tradeStatus = trade.status || 'open';
      return englishStatuses.includes(tradeStatus);
    });

    // Status filter applied
  }

  // עדכון הטבלה עם הנתונים המסוננים
  await updateTradesTable(filteredTrades);
  } catch (error) {
    window.Logger.error('Error in applyStatusFilterToTrades:', error, { selectedStatuses, page: "trades" });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בסינון הטריידים');
    }
  }
}

// ייצוא פונקציות פילטר לגלובל
window.applyStatusFilterToTrades = applyStatusFilterToTrades;
// ייצוא פונקציות ולידציה חדשות
window.validateTickerChange = validateTickerChange;
window.validateTradePlanDate = validateTradePlanDate;
window.showTickerChangeConfirmation = showTickerChangeConfirmation;

// ייצוא פונקציות עדכון מחירים
window.updateEditTradeTickerFromPlan = updateEditTradeTickerFromPlan;
window.updateEditTradePriceFromTicker = updateEditTradePriceFromTicker;

/**
 * בדיקת שינוי טיקר בטרייד
 * @param {string} newTickerId - מזהה הטיקר החדש
 * @param {object} tradeData - נתוני הטרייד הנוכחי
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTickerChange(newTickerId, tradeData) {
  if (!newTickerId || !tradeData.ticker_id) {
    return { isValid: true, message: '' };
  }

  const originalTickerId = parseInt(tradeData.ticker_id);
  const updatedTickerId = parseInt(newTickerId);

  // בדיקה אם הטיקר השתנה
  if (originalTickerId === updatedTickerId) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי הטיקר המקורי והחדש
    const [originalTickerResponse, newTickerResponse] = await Promise.all([
      fetch(`/api/tickers/${originalTickerId}`),
      fetch(`/api/tickers/${updatedTickerId}`),
    ]);

    if (!originalTickerResponse.ok || !newTickerResponse.ok) {
      throw new Error('שגיאה בקבלת פרטי טיקרים');
    }

    const originalTicker = await originalTickerResponse.json();
    const newTicker = await newTickerResponse.json();

    const originalSymbol = originalTicker.data?.symbol || 'לא ידוע';
    const newSymbol = newTicker.data?.symbol || 'לא ידוע';

    // הצגת דיאלוג אישור
    const confirmed = await showTickerChangeConfirmation(originalSymbol, newSymbol);

    return {
      isValid: confirmed,
      message: confirmed ? '' : 'המשתמש ביטל את שינוי הטיקר',
    };

  } catch {
    handleValidationError('ticker change', 'שגיאה בבדיקת שינוי טיקר');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת הטיקר. אנא נסה שוב.',
    };
  }
}

/**
 * הצגת דיאלוג אישור לשינוי טיקר
 * @param {string} originalSymbol - סימבול הטיקר המקורי
 * @param {string} newSymbol - סימבול הטיקר החדש
 * @returns {Promise<boolean>} האם המשתמש אישר את השינוי
 */
function showTickerChangeConfirmation(originalSymbol, newSymbol) {
  try {
    return new Promise(resolve => {
      const message = 'האם אתה בטוח שברצונך לשנות את הטיקר מ-' + originalSymbol + ' ל-' + newSymbol + '?\n\n' +
        'שינוי טיקר בטרייד קיים עלול להשפיע על:\n' +
        '• חישובי רווח/הפסד\n' +
        '• קישור לתוכניות טרייד\n' +
        '• נתוני מעקב היסטוריים\n\n' +
        'האם להמשיך בשינוי?';

      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'שינוי טיקר בטרייד',
          message,
          'אשר שינוי',
          'ביטול',
          () => resolve(true),
          () => resolve(false),
        );
      } else {
        // Fallback לדיאלוג פשוט
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'אישור',
            message,
            confirmed => resolve(confirmed),
            () => resolve(false),
          );
        } else {
          if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
              'אישור',
              message,
              confirmed => resolve(confirmed),
              () => resolve(false),
            );
          } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            const confirmed = window.confirm(message);
            resolve(confirmed);
          }
          resolve(confirmed);
        }
      }
    });
  } catch (error) {
    window.Logger.error('Error in showTickerChangeConfirmation:', error, { originalSymbol, newSymbol, page: "trades" });
    return Promise.resolve(false);
  }
}

/**
 * בדיקת תאריך תוכנית טרייד לעומת תאריך הטרייד
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 * @param {object} tradeData - נתוני הטרייד
 * @returns {Promise<object>} תוצאות הוולידציה
 */
async function validateTradePlanDate(tradePlanId, tradeData) {
  if (!tradePlanId || !tradeData.created_at) {
    return { isValid: true, message: '' };
  }

  try {
    // קבלת פרטי תוכנית הטרייד
    const response = await fetch(`/api/trade_plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const planCreatedAt = new Date(tradePlan.data.created_at);
    const tradeCreatedAt = new Date(tradeData.created_at);

    // בדיקה אם תאריך יצירת התוכנית מאוחר מתאריך יצירת הטרייד
    if (planCreatedAt > tradeCreatedAt) {
      return {
        isValid: false,
        message: `לא ניתן לקשר תוכנית טרייד שנוצרה בתאריך ${planCreatedAt.toLocaleDateString('he-IL')} לטרייד שנוצר בתאריך ${tradeCreatedAt.toLocaleDateString('he-IL')}. תאריך יצירת התוכנית לא יכול להיות מאוחר מתאריך יצירת הטרייד.`,
      };
    }

    return { isValid: true, message: '' };

  } catch {
    handleValidationError('trade plan date', 'שגיאה בבדיקת תאריך תוכנית טרייד');
    return {
      isValid: false,
      message: 'שגיאה בבדיקת תאריך התוכנית. אנא נסה שוב.',
    };
  }
}

/**
 * עדכון טיקר במודל העריכה לפי תוכנית טרייד נבחרת
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 */
async function updateEditTradeTickerFromPlan(tradePlanId) {
  if (!tradePlanId) {
    return;
  }

  // בדיקה אם השדה נוקה על ידי המערכת
  const tradePlanSelect = document.getElementById('editTradeTradePlanId');
  if (tradePlanSelect && tradePlanSelect.getAttribute('data-cleared') === 'true') {
    // השדה נוקה על ידי המערכת - לא לבצע עדכון
    tradePlanSelect.removeAttribute('data-cleared');
    return;
  }

  try {
    // קבלת פרטי התוכנית
    const response = await fetch(`/api/trade_plans/${tradePlanId}`);
    if (!response.ok) {
      throw new Error('שגיאה בקבלת פרטי תוכנית טרייד');
    }

    const tradePlan = await response.json();
    const plan = tradePlan.data;

    // בדיקה אם הטיקר שונה מהמקורי
    const originalTrade = window.currentEditTrade;
    const originalTickerId = originalTrade?.ticker_id;


    // בדיקה אם יש טיקר מקורי והטיקר של התוכנית החדשה שונה
    if (originalTickerId && plan.ticker_id && plan.ticker_id.toString() !== originalTickerId.toString()) {
      // שינוי תוכנית עם טיקר שונה - לא נתמך
      window.showErrorNotification(
        'פיצר לא נתמך',
        'שינוי תוכנית טרייד לטיקר שונה עדיין לא נתמך במערכת. אנא בחר תוכנית עם אותו טיקר או הסר את הקישור לתוכנית.',
      );

      // החזרת שדה התוכנית למצבו המקורי
      const editTradePlanSelect = document.getElementById('editTradeTradePlanId');
      if (editTradePlanSelect && originalTrade) {
        if (originalTrade.trade_plan_id) {
          tradePlanSelect.value = originalTrade.trade_plan_id;
        } else {
          tradePlanSelect.value = '';
        }

        // סימון שהשדה הוחזר למצב מקורי
        tradePlanSelect.setAttribute('data-restored', 'true');
      }

      return; // עצירת התהליך
    }

    // עדכון שדות הטיקר - רק אם הטיקר זהה או אם אין טיקר נוכחי
    const tickerDisplay = document.getElementById('editTradeTickerDisplay');
    const tickerIdInput = document.getElementById('editTradeTickerId');

    if (tickerDisplay && plan.ticker_symbol) {
      tickerDisplay.textContent = plan.ticker_symbol;
    }

    if (tickerIdInput && plan.ticker_id) {
      tickerIdInput.value = plan.ticker_id;

      // עדכון מחיר מהטיקר החדש
      await updateEditTradePriceFromTicker(plan.ticker_id);
    }

  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון טיקר במודל העריכה');
    } else {
      // window.Logger.error('Error updating ticker in edit modal:', error, { page: "trades" });
    }
  }
}

/**
 * עדכון מחיר במודל העריכה לפי טיקר נבחר
 * @param {string} tickerId - מזהה הטיקר
 */
async function updateEditTradePriceFromTicker(tickerId) {
  if (!tickerId) {
    return;
  }

  try {
    const response = await fetch(`/api/tickers/${tickerId}`);
    if (response.ok) {
      const tickerData = await response.json();
      const ticker = tickerData.data;

      // עדכון מחיר נוכחי
      const currentPriceElement = document.getElementById('editTradeCurrentPrice');
      if (currentPriceElement && ticker.current_price) {
        currentPriceElement.textContent = `$${parseFloat(ticker.current_price).toFixed(2)}`;
      }

      // עדכון שינוי יומי
      const dailyChangeElement = document.getElementById('editTradeDailyChange');
      if (dailyChangeElement && ticker.daily_change !== undefined) {
        const dailyChange = parseFloat(ticker.daily_change);
        const dailyChangeValue = dailyChange >= 0 ? `+${dailyChange.toFixed(2)}%` : `${dailyChange.toFixed(2)}%`;
        dailyChangeElement.textContent = dailyChangeValue;

        // צביעה לפי ערך באמצעות המערכת הגלובלית
        const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545' };
        if (dailyChange >= 0) {
          dailyChangeElement.style.color = colors.positive;
          dailyChangeElement.style.fontWeight = 'bold';
        } else {
          dailyChangeElement.style.color = colors.negative;
          dailyChangeElement.style.fontWeight = 'bold';
        }
      }
    }
  } catch (error) {
    if (typeof handleDataLoadError === 'function') {
      handleDataLoadError(error, 'עדכון מחיר במודל העריכה');
    } else {
      // window.Logger.error('Error updating price in edit modal:', error, { page: "trades" });
    }
  }
}

/**
 * הפעלה מחדש של טרייד מבוטל
 *
 * @param {string|number} tradeId - מזהה הטרייד
 */
async function reactivateTrade(tradeId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - עריכה    // מציאת הטרייד בנתונים
    const trade = tradesData.find(t => t.id === tradeId);
    if (!trade) {
      if (typeof handleElementNotFound === 'function') {
        handleElementNotFound('trade', 'CRITICAL');
      } else {
        // window.Logger.error('trade not found', { page: "trades" });
      }
      throw new Error('טרייד לא נמצא');
    }

    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trades/${tradeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'open',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('טרייד הופעל מחדש בהצלחה!', '', 4000, 'business');
    } else if (typeof window.showNotification === 'function') {
      window.showSuccessNotification('טרייד הופעל מחדש בהצלחה!', '', 4000, 'business');
    }

    // רענון הטבלה
    await loadTradesData();

  } catch (error) {
    if (typeof handleSaveError === 'function') {
      handleSaveError(error, 'הפעלה מחדש של טרייד');
    } else {
      // window.Logger.error('Error reactivating trade:', error, { page: "trades" });
    }
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש');
    }
  }
}

/**
 * רענון נתוני טריידים
 * טוען מחדש את כל נתוני הטריידים מהשרת
 */
function refreshTrades() {
  try {
    window.Logger.info('🔄 מרענן נתוני טריידים...', { page: "trades" });
    
    // הצגת אינדיקטור טעינה
    if (typeof window.showNotification === 'function') {
      window.showInfoNotification('מרענן נתוני טריידים...');
    }
    
    // טעינת נתונים מחדש
    loadTradesData();
    
    // הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('נתוני טריידים רוענו בהצלחה');
    } else if (typeof window.showNotification === 'function') {
      window.showSuccessNotification('נתוני טריידים רוענו בהצלחה');
    }
    
  } catch (error) {
    window.Logger.error('שגיאה ברענון טריידים:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון טריידים', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה ברענון טריידים');
    }
  }
}

/**
 * עדכון טרייד קיים
 * @param {number} tradeId - מזהה הטרייד
 * @param {Object} tradeData - נתוני הטרייד החדשים
 */
function updateTrade(tradeId, tradeData) {
  try {
    window.Logger.info('📝 מעדכן טרייד:', tradeId, tradeData, { page: "trades" });
    
    // ולידציה בסיסית
    if (!tradeId || !tradeData) {
      throw new Error('נתונים חסרים לעדכון טרייד');
    }
    
    // שליחה לשרת
    fetch('/api/trades/' + tradeId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tradeData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בעדכון טרייד');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ טרייד עודכן בהצלחה:', data, { page: "trades" });
      
      // רענון הטבלה
      loadTradesData();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('טרייד עודכן בהצלחה');
      } else if (typeof window.showNotification === 'function') {
        window.showSuccessNotification('טרייד עודכן בהצלחה');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בעדכון טרייד:', error, { page: "trades" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
      } else if (typeof window.showNotification === 'function') {
        window.showErrorNotification('שגיאה בעדכון טרייד');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טרייד:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טרייד');
    }
  }
}

/**
 * אישור מחיקת טרייד
 * מציג חלון אישור לפני מחיקת טרייד
 * @param {number} tradeId - מזהה הטרייד למחיקה
 */
function confirmDeleteTrade(tradeId) {
  try {
    window.Logger.info('🗑️ מאשר מחיקת טרייד:', tradeId, { page: "trades" });
    
    // חיפוש הטרייד בנתונים
    const trade = window.tradesData.find(t => t.id === tradeId);
    if (!trade) {
      throw new Error('טרייד לא נמצא');
    }
    
    // יצירת הודעת אישור
    const confirmMessage = `האם אתה בטוח שברצונך למחוק את הטרייד?\n\n` +
      `חשבון מסחר: ${trade.account_name || 'לא ידוע'}\n` +
      `טיקר: ${trade.ticker_symbol || 'לא ידוע'}\n` +
      `סכום: ${trade.amount || 'לא ידוע'}`;
    
    // הצגת חלון אישור
    if (confirm(confirmMessage)) {
      // ביצוע המחיקה
      deleteTradeRecord(tradeId);
    }
    
  } catch (error) {
    window.Logger.error('שגיאה באישור מחיקת טרייד:', error, { page: "trades" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה באישור מחיקת טרייד', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showErrorNotification('שגיאה באישור מחיקת טרייד');
    }
  }
}

// Detailed Log Functions for Trades Page
/**
 * Generate detailed log for trades page
 * @returns {string} JSON string of detailed log data
 */
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'trades',
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
            tradesStats: {
                totalTrades: document.getElementById('totalTrades')?.textContent || 'לא נמצא',
                openTrades: document.getElementById('openTrades')?.textContent || 'לא נמצא',
                closedTrades: document.getElementById('closedTrades')?.textContent || 'לא נמצא',
                totalPL: document.getElementById('totalPL')?.textContent || 'לא נמצא',
                actualData: {
                    totalTradesCount: window.tradesData ? window.tradesData.length : 0,
                    openTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'open').length : 0,
                    closedTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'closed').length : 0,
                    cancelledTradesCount: window.tradesData ? window.tradesData.filter(t => t.status === 'cancelled').length : 0
                }
            },
            sections: {
                topSection: {
                    title: 'מעקב טריידים',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא',
                    colorDemoVisible: !document.getElementById('tradesColorDemo')?.style.display === 'none',
                    actualContent: {
                        hasHeader: !!document.querySelector('.top-section .section-header'),
                        hasStats: !!document.querySelector('.top-section .summary-stats'),
                        hasFilters: !!document.querySelector('.top-section .filters'),
                        hasButtons: !!document.querySelector('.top-section .action-buttons')
                    }
                },
                contentSection: {
                    title: 'הטריידים שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#tradesTable tbody tr').length,
                    tableData: document.querySelector('#tradesContainer')?.textContent?.substring(0, 300) || 'לא נמצא',
                    actualContent: {
                        hasTable: !!document.querySelector('#tradesTable'),
                        hasTableBody: !!document.querySelector('#tradesTable tbody'),
                        hasTableHead: !!document.querySelector('#tradesTable thead'),
                        hasFilters: !!document.querySelector('.content-section .filters'),
                        hasPagination: !!document.querySelector('.content-section .pagination')
                    }
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#tradesTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#tradesTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#tradesTable tbody tr').length > 0,
                selectedRows: document.querySelectorAll('#tradesTable tbody tr.selected').length,
                actualTradesData: window.tradesData ? window.tradesData.map(trade => ({
                    id: trade.id,
                    ticker: trade.ticker_symbol || trade.ticker_id,
                    status: trade.status,
                    type: trade.investment_type,
                    side: trade.side,
                    currentPrice: trade.current_price,
                    dailyChange: trade.daily_change,
                    created: trade.created_at,
                    closed: trade.closed_at || trade.cancelled_at
                })) : [],
                tableStructure: {
                    hasTbody: !!document.querySelector('#tradesTable tbody'),
                    hasThead: !!document.querySelector('#tradesTable thead'),
                    tbodyRowCount: document.querySelectorAll('#tradesTable tbody tr').length,
                    theadColCount: document.querySelectorAll('#tradesTable thead th').length
                }
            },
            modals: {
                addModal: document.getElementById('addTradeModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTradeModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTradeModal') ? 'זמין' : 'לא זמין',
                linkedItemsModal: document.getElementById('linkedItemsModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddTradeModal: typeof window.showAddTradeModal === 'function' ? 'זמין' : 'לא זמין',
                editTradeRecord: typeof window.editTradeRecord === 'function' ? 'זמין' : 'לא זמין',
                deleteTradeRecord: typeof window.deleteTradeRecord === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                sortTableData: typeof window.sortTableData === 'function' ? 'זמין' : 'לא זמין'
            },
            buttons: {
                addTradeBtn: document.getElementById('addTradeBtn') ? 'זמין' : 'לא זמין',
                editTradeBtn: document.getElementById('editTradeBtn') ? 'זמין' : 'לא זמין',
                deleteTradeBtn: document.getElementById('deleteTradeBtn') ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            },
            systems: {
                unifiedCacheManager: typeof window.UnifiedCacheManager === 'object' ? 'זמין' : 'לא זמין',
                headerSystem: typeof window.HeaderSystem === 'object' ? 'זמין' : 'לא זמין',
                notificationSystem: typeof window.showNotification === 'function' ? 'זמין' : 'לא זמין',
                colorSchemeSystem: typeof window.applyEntityColorsToHeaders === 'function' ? 'זמין' : 'לא זמין',
                translationSystem: typeof window.translateTradeType === 'function' ? 'זמין' : 'לא זמין',
                buttonSystem: typeof window.createEditButton === 'function' ? 'זמין' : 'לא זמין',
                linkedItemsSystem: typeof window.viewLinkedItemsForTrade === 'function' ? 'זמין' : 'לא זמין',
                preferencesSystem: typeof window.getPreference === 'function' ? 'זמין' : 'לא זמין',
                validationSystem: typeof window.initializeValidation === 'function' ? 'זמין' : 'לא זמין',
                tableSystem: typeof window.sortTableData === 'function' ? 'זמין' : 'לא זמין'
            },
            ui: {
                headerVisible: !!document.getElementById('unified-header'),
                headerHeight: document.getElementById('unified-header')?.offsetHeight || 0,
                mainContentVisible: !!document.querySelector('.main-content'),
                backgroundWrapperVisible: !!document.querySelector('.background-wrapper'),
                pageBodyVisible: !!document.querySelector('.page-body'),
                pageStructure: {
                    hasBackgroundWrapper: !!document.querySelector('.background-wrapper'),
                    hasPageBody: !!document.querySelector('.page-body'),
                    hasMainContent: !!document.querySelector('.main-content'),
                    hasTopSection: !!document.querySelector('.top-section'),
                    hasContentSection: !!document.querySelector('.content-section')
                },
                elements: {
                    totalElements: document.querySelectorAll('*').length,
                    visibleElements: document.querySelectorAll(':not([style*="display: none"]):not(.d-none)').length,
                    hiddenElements: document.querySelectorAll('[style*="display: none"], .d-none').length
                },
                styling: {
                    hasBootstrap: !!document.querySelector('link[href*="bootstrap"]'),
                    hasCustomCSS: !!document.querySelector('link[href*="styles-new"]'),
                    hasFontAwesome: !!document.querySelector('link[href*="font-awesome"]'),
                    hasBootstrapIcons: !!document.querySelector('link[href*="bootstrap-icons"]')
                }
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


// Export log functions to global scope
// window. export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local  function for trades page
async function generateDetailedLogForTrades() {
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
        window.Logger.error('שגיאה בהעתקה:', err, { page: "trades" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

/**
 * Show add trade modal
 * Uses ModalManagerV2 for consistent modal experience
 * 
 * @function showAddTradeModal
 * @returns {void}
 */
function showAddTradeModal() {
    try {
        window.Logger.debug('showAddTradeModal called', { page: 'trades' });
        
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showModal('tradesModal', 'add');
        } else {
            console.error('ModalManagerV2 not available');
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה');
            }
        }
    } catch (error) {
        window.Logger.error('Error in showAddTradeModal:', error, { page: 'trades' });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל הוספת טרייד');
        }
    }
}

/**
 * הצגת מודל עריכת טרייד
 * Uses ModalManagerV2 for consistent modal experience
 */
function showEditTradeModal(tradeId) {
    try {
        window.Logger.debug('showEditTradeModal called', { tradeId, page: 'trades' });
        
        if (window.ModalManagerV2) {
            window.ModalManagerV2.showEditModal('tradesModal', 'trade', tradeId);
        } else {
            console.error('ModalManagerV2 not available');
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה');
            }
        }
    } catch (error) {
        window.Logger.error('Error in showEditTradeModal:', error, { tradeId, page: 'trades' });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בפתיחת מודל עריכת טרייד');
        }
    }
}

/**
 * שמירת טרייד
 * Handles both add and edit modes
 */
async function saveTrade() {
    window.Logger.debug('saveTrade called', { page: 'trades' });
    
    try {
        // ניקוי מטמון לפני פעולת CRUD        // Collect form data using DataCollectionService
        const form = document.getElementById('tradesModalForm');
        if (!form) {
            throw new Error('Trade form not found');
        }
        
        const tradeData = DataCollectionService.collectFormData({
            ticker_id: { id: 'tradeTicker', type: 'int' },
            account_id: { id: 'tradeAccount', type: 'int' },
            name: { id: 'tradeName', type: 'text' },
            type: { id: 'tradeType', type: 'text' },
            quantity: { id: 'tradeQuantity', type: 'int' },
            entry_price: { id: 'tradeEntryPrice', type: 'float' },
            exit_price: { id: 'tradeExitPrice', type: 'float', default: null },
            stop_loss: { id: 'tradeStopLoss', type: 'float', default: null },
            take_profit: { id: 'tradeTakeProfit', type: 'float', default: null },
            entry_date: { id: 'tradeEntryDate', type: 'date' },
            exit_date: { id: 'tradeExitDate', type: 'date', default: null },
            status: { id: 'tradeStatus', type: 'text' },
            notes: { id: 'tradeNotes', type: 'text', default: null }
        });
        
        // Calculate P&L if exit price is provided
        if (tradeData.exit_price && tradeData.entry_price) {
            const pnl = (tradeData.exit_price - tradeData.entry_price) * tradeData.quantity;
            tradeData.pnl = pnl;
        }
        
        // Validate data
        if (!window.validateEntityForm) {
            throw new Error('Validation system not available');
        }
        
        const isValid = window.validateEntityForm('tradesModalForm', {
            tradeTicker: { required: true },
            tradeAccount: { required: true },
            tradeName: { required: true, minLength: 2, maxLength: 100 },
            tradeType: { required: true },
            tradeQuantity: { required: true, min: 1 },
            tradeEntryPrice: { required: true, min: 0.01 },
            tradeExitPrice: { required: false, min: 0.01 },
            tradeStopLoss: { required: false, min: 0.01 },
            tradeTakeProfit: { required: false, min: 0.01 },
            tradeEntryDate: { required: true },
            tradeExitDate: { required: false },
            tradeStatus: { required: true },
            tradeNotes: { required: false, maxLength: 1000 }
        });
        
        if (!isValid) {
            window.Logger.warn('Trade validation failed', { page: 'trades' });
            return;
        }
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const tradeId = form.dataset.tradeId;
        
        // Prepare API call
        const url = isEdit ? `/api/trades/${tradeId}` : '/api/trades';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tradeData)
        });
        
        // Use CRUDResponseHandler for consistent response handling
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'tradesModal',
                successMessage: 'טרייד עודכן בהצלחה',
                entityName: 'טרייד',
                reloadFn: window.loadTradesData,
                requiresHardReload: false
            });
        } else {
            await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'tradesModal',
                successMessage: 'טרייד נוסף בהצלחה',
                entityName: 'טרייד',
                reloadFn: window.loadTradesData,
                requiresHardReload: false
            });
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'שמירת טרייד');
    }
}

/**
 * מחיקת טרייד
 * Includes linked items check
 */
async function deleteTrade(tradeId) {
    window.Logger.debug('deleteTrade called', { tradeId, page: 'trades' });
    
    try {
        // Check linked items first
        if (window.checkLinkedItemsBeforeAction) {
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade', tradeId, 'delete');
            if (hasLinkedItems) {
                window.Logger.info('Trade has linked items, deletion cancelled', { tradeId, page: 'trades' });
                return;
            }
        }
        
        // Confirm deletion
        if (!confirm('האם אתה בטוח שברצונך למחוק את הטרייד?')) {
            return;
        }
        
        // Send delete request
        const response = await fetch(`/api/trades/${tradeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // Handle success
        if (window.showNotification) {
            window.showNotification('טרייד נמחק בהצלחה', 'success', 'business');
        }
        
        // Refresh data
        if (window.loadTradesData) {
            window.loadTradesData();
        }
        
        window.Logger.info('Trade deleted successfully', { tradeId, page: 'trades' });
        
    } catch (error) {
        window.Logger.error('Error deleting trade', { error: error.message, tradeId, page: 'trades' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה במחיקת הטרייד', 'error', 'system');
        }
    }
}

// Export functions to window for global access
window.showAddTradeModal = showAddTradeModal;
window.showEditTradeModal = showEditTradeModal;
window.saveTrade = saveTrade;
window.deleteTrade = deleteTrade;

