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
 * - Trade filtering and search functionality
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
 * - header-system.js (filter functionality)
 * - linked-items.js (linked items modal functionality)
 * 
 * Table Mapping:
 * - Uses 'trades' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * @version 2.3
 * @lastUpdated August 24, 2025
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
  console.error('❌ showErrorNotification לא נטענה!');
}
if (typeof showSuccessNotification === 'undefined') {
  console.error('❌ showSuccessNotification לא נטענה!');
}

// משתנים גלובליים לדף המעקב
let tradesData = [];
window.tradesData = tradesData;

/**
 * טעינת נתוני טריידים מהשרת
 * 
 * פונקציה זו טוענת את כל הטריידים מהשרת ומעדכנת את הטבלה
 * כולל טיפול בשגיאות ועדכון המשתנה הגלובלי
 * 
 * תכונות:
 * - קריאה ל-API `/api/v1/trades/`
 * - טיפול בשגיאות רשת
 * - עדכון המשתנה הגלובלי window.tradesData
 * - עדכון הטבלה עם הנתונים החדשים
 * - תמיכה בפילטרים מקומיים
 * 
 * @returns {Promise<void>}
 */
async function loadTradesData() {
  console.log('🔄 === LOADING TRADES DATA ===');
  console.log('🔄 Current page:', window.location.pathname);

  try {
    console.log('🔄 Fetching trades from server...');
    const response = await fetch('/api/v1/trades/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('🔄 Server response:', responseData);

    if (responseData.status !== 'success') {
      throw new Error(`API error: ${responseData.message || 'Unknown error'}`);
    }

    console.log('🔄 Processing trades data...');
    console.log('🔄 Number of trades received:', responseData.data ? responseData.data.length : 0);

    // בדיקה שהנתונים בפורמט הנכון
    let apiData = responseData.data || responseData;

    // עדכון הנתונים המקומיים - שימוש בשמות אחידים מה-API
    let tradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
      trade_plan_created_at: trade.trade_plan_created_at, // תאריך יצירה של התוכנית
      status: trade.status,
      investment_type: trade.investment_type,
      side: trade.side,
      created_at: trade.created_at,
      closed_at: trade.closed_at,
      cancelled_at: trade.cancelled_at,
      total_pl: trade.total_pl,
      notes: trade.notes
    }));

    // עדכון המשתנה הגלובלי
    window.tradesData = tradesData;

    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
      (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
      (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
      (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

    let filteredTrades = [...tradesData];

    if (hasActiveFilters) {
      filteredTrades = filterTradesLocally(tradesData, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
    }

    updateTradesTable(filteredTrades);

  } catch (error) {
    console.error('❌ Error loading trades data:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);

    const tbody = document.querySelector('#tradesTable tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">שגיאה בטעינת נתונים: ' + error.message + '</td></tr>';
    } else {
      console.error('❌ Table body not found for error display');
    }
  }
}

/**
 * פילטור נתוני טריידים
 * @param {Array} selectedStatuses - מערך סטטוסים נבחרים
 * @param {Array} selectedTypes - מערך סוגים נבחרים
 * @param {Array} selectedAccounts - מערך חשבונות נבחרים
 * @param {Object} selectedDateRange - טווח תאריכים נבחר
 * @param {string} searchTerm - מונח חיפוש
 */
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  // החזרת כל הנתונים ללא פילטור - כמו בדף database
  const globalTradesData = window.tradesData || [];
  updateTradesTable(globalTradesData);
}

/**
 * פילטור מקומי לטריידים
 */
function filterTradesLocally(trades, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  let filteredTrades = [...trades];

  // Extracting start and end dates
  let startDate = null;
  let endDate = null;

  if (selectedDateRange && selectedDateRange !== 'כל זמן') {
    const dateRange = window.translateDateRangeToDates ? window.translateDateRangeToDates(selectedDateRange) : { startDate: null, endDate: null };
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }

  // Filtering by status
  if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
    filteredTrades = filteredTrades.filter(trade => {
      // המרת הערכים הנבחרים לאנגלית
      const statusTranslations = {
        'פתוח': 'open',
        'סגור': 'closed',
        'מבוטל': 'cancelled'
      };

      const translatedSelectedStatuses = selectedStatuses.map(status =>
        statusTranslations[status] || status
      );

      const isMatch = translatedSelectedStatuses.includes(trade.status);
      return isMatch;
    });
  }

  // Filtering by type
  if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
    filteredTrades = filteredTrades.filter(trade => {
      // המרת הערכים הנבחרים לאנגלית
      const typeTranslations = {
        'סווינג': 'swing',
        'השקעה': 'investment',
        'פסיבי': 'passive'
      };

      const translatedSelectedTypes = selectedTypes.map(type =>
        typeTranslations[type] || type
      );

      const tradeType = trade.investment_type;
      const isMatch = translatedSelectedTypes.includes(tradeType);
      return isMatch;
    });
  }

  // Filtering by dates
  if (startDate && endDate) {
    filteredTrades = filteredTrades.filter(trade => {
      if (!trade.created_at) return false;

      const tradeDate = new Date(trade.created_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Setting time to start of day for start date and end of day for end date
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const isInRange = tradeDate >= start && tradeDate <= end;
      return isInRange;
    });
  }

  // Filtering by search term
  if (searchTerm && searchTerm.trim() !== '') {
    const searchLower = searchTerm.toLowerCase();

    // Bi-directional search term translations
    const searchTranslations = {
      // Status translations
      'פתוח': 'open',
      'סגור': 'closed',
      'מבוטל': 'cancelled',
      'open': 'open',
      'closed': 'closed',
      'cancelled': 'cancelled',
      // Type translations
      'סווינג': 'swing',
      'השקעה': 'investment',
      'פסיבי': 'passive',
      'swing': 'swing',
      'investment': 'investment',
      'passive': 'passive'
    };

    filteredTrades = filteredTrades.filter(trade => {
      const searchableFields = [
        trade.symbol || '',
        trade.status || '',
        trade.investment_type || '',
        trade.account_name || '',
        trade.notes || ''
      ];

      // Check original values
      const originalMatch = searchableFields.some(field =>
        field.toString().toLowerCase().includes(searchLower)
      );

      if (originalMatch) return true;

      // Check translated values
      const translatedSearchTerm = searchTranslations[searchLower] || searchLower;
      const translatedMatch = searchableFields.some(field => {
        const fieldLower = field.toString().toLowerCase();
        return fieldLower.includes(translatedSearchTerm) ||
          Object.entries(searchTranslations).some(([hebrew, english]) =>
            fieldLower.includes(hebrew) && english === translatedSearchTerm
          );
      });

      return translatedMatch;
    });
  }

  updateTradesTable(filteredTrades);
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
function updateTradesTable(trades) {
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

  const tableHTML = trades.map(trade => {
    const statusDisplay = trade.status === 'closed' ? 'סגור' : trade.status === 'cancelled' ? 'מבוטל' : 'פתוח';
    const typeDisplay = window.translateTradeType ? window.translateTradeType(trade.investment_type) : trade.investment_type;

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = trade.investment_type || '';

    return `
    <tr>
      <td class="ticker-cell"><strong><a href="#" onclick="viewTickerDetails('${trade.ticker_id}')" class="ticker-link">${trade.ticker_symbol || 'טיקר לא ידוע'}</a></strong></td>
      <td class="status-cell" data-status="${trade.status || ''}"><span class="status-badge status-${trade.status || 'open'}">${statusDisplay}</span></td>
      <td class="type-cell" data-type="${typeForFilter}">${typeDisplay || trade.investment_type || '-'}</td>
      <td class="side-cell" data-side="${trade.side || 'Long'}">
        <span class="side-badge ${trade.side === 'Long' ? 'side-long' : 'side-short'}">${trade.side || 'Long'}</span>
      </td>
      <td class="plan-cell">${trade.trade_plan_id ? `<a href="#" onclick="viewTradePlanDetails('${trade.trade_plan_id}')" class="plan-link">#${trade.trade_plan_id}</a>` : '-'}</td>
                      <td class="pl-cell">${window.colorAmountByValue(trade.total_pl || 0, trade.total_pl ? `$${trade.total_pl.toFixed(2)}` : '$0.00')}</td>
      <td data-date="${trade.created_at}">${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : trade.cancelled_at ? new Date(trade.cancelled_at).toLocaleDateString('he-IL') : ''}</td>
      <td><strong><a href="#" onclick="viewAccountDetails('${trade.account_id}')" class="account-link">${trade.account_name || trade.account_id || 'חשבון לא ידוע'}</a></strong></td>
      <td>${trade.notes || ''}</td>
      <td class="actions-cell">
        <table class="table table-sm table-borderless mb-0">
          <tbody>
            <tr>
              <td class="p-0 pe-1">
                ${createLinkButton(`viewLinkedItemsForTrade(${trade.id})`)}
              </td>
              <td class="p-0 pe-1">
                ${createEditButton(`editTradeRecord('${trade.id}')`)}
              </td>
              <td class="p-0 pe-1">
                ${trade.status === 'open' ?
        createButton('CANCEL', `cancelTradeRecord('${trade.id}')`) :
        `<button class="btn btn-sm btn-cancel-disabled" disabled title="לא ניתן לבטל טרייד סגור">X</button>`
      }
              </td>
              <td class="p-0">
                ${createDeleteButton(`deleteTradeRecord('${trade.id}')`)}
              </td>
            </tr>
          </tbody>
        </table>
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
}

// פונקציה הועברה ל-translation-utils.js בשם translateTradeType

/**
 * פונקציות נוספות
 */
function viewTickerDetails(tickerId) {
  // צפייה בפרטי טיקר
  // כאן יוכנס קוד לצפייה בפרטי טיקר
}

function viewAccountDetails(accountId) {
  // צפייה בפרטי חשבון
  // כאן יוכנס קוד לצפייה בפרטי חשבון
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות צפייה בפרטי חשבון תהיה זמינה בקרוב', 'info');
  } else {
    alert('פונקציונליות צפייה בפרטי חשבון תהיה זמינה בקרוב');
  }
}

function viewTradePlanDetails(tradePlanId) {
  // צפייה בפרטי תוכנית טרייד
  if (typeof window.showNotification === 'function') {
    window.showNotification(`פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`, 'info');
  } else {
    alert(`פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`);
  }
}

function editTradeRecord(tradeId) {
  // עריכת טרייד
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
  // ביטול טרייד - בדיקה אם יש אובייקטים מקושרים
  checkLinkedItemsBeforeCancel(tradeId);
}

/**
 * בדיקת אובייקטים מקושרים לפני ביטול
 * 
 * @param {string|number} tradeId - מזהה הטרייד
 */
function checkLinkedItemsBeforeCancel(tradeId) {
  // קבלת נתוני הטרייד כדי להציג את שמו בחלון האזהרה
  fetch(`/api/v1/trades/${tradeId}`)
    .then(response => response.json())
    .then(tradeData => {
      if (tradeData.status === 'success') {
        const trade = tradeData.data;

        // בדיקה אם יש אובייקטים מקושרים (למשל executions)
        fetch(`/api/v1/executions/?trade_id=${tradeId}`)
          .then(response => response.json())
          .then(executionsData => {
            const linkedItems = [];

            // הוספת executions אם יש
            if (executionsData.status === 'success' && executionsData.data && executionsData.data.length > 0) {
              executionsData.data.forEach(execution => {
                linkedItems.push({
                  id: execution.id,
                  type: 'execution',
                  title: `ביצוע ${execution.action} - ${execution.quantity} יחידות`,
                  status: execution.status || 'active',
                  created_at: execution.created_at,
                  notes: execution.notes,
                  action: execution.action,
                  quantity: execution.quantity,
                  price: execution.price
                });
              });
            }

            // בדיקה אם יש notes מקושרות
            fetch(`/api/v1/notes/?related_type_id=2&related_id=${tradeId}`)
              .then(response => response.json())
              .then(notesData => {
                if (notesData.status === 'success' && notesData.data && notesData.data.length > 0) {
                  notesData.data.forEach(note => {
                    linkedItems.push({
                      id: note.id,
                      type: 'note',
                      title: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''),
                      status: note.status || 'active',
                      created_at: note.created_at,
                      notes: note.content,
                      content: note.content
                    });
                  });
                }

                // אם יש אובייקטים מקושרים, הצג חלון אזהרה ללא אפשרות ביטול
                if (linkedItems.length > 0) {
                  const warningData = {
                    tradeSymbol: trade.ticker_symbol,
                    linkedItems: linkedItems
                  };

                  if (typeof window.showLinkedItemsBlockingModal === 'function') {
                    window.showLinkedItemsBlockingModal(
                      warningData,
                      'trade',
                      tradeId,
                      'cancel'
                    );
                  } else {
                    // גיבוי אם הפונקציה לא זמינה
                    alert(`לא ניתן לבטל טרייד זה כי יש ${linkedItems.length} אובייקטים מקושרים אליו.`);
                  }
                } else {
                  // אין אובייקטים מקושרים, רק אישור רגיל
                  if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
                    performTradeCancellation(tradeId);
                  }
                }
              })
              .catch(error => {
                console.error('שגיאה בבדיקת הערות מקושרות:', error);
                // במקרה של שגיאה, רק אישור רגיל
                if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
                  performTradeCancellation(tradeId);
                }
              });
          })
          .catch(error => {
            console.error('שגיאה בבדיקת ביצועים מקושרים:', error);
            // במקרה של שגיאה, רק אישור רגיל
            if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
              performTradeCancellation(tradeId);
            }
          });
      } else {
        console.error('שגיאה בקבלת נתוני טרייד:', tradeData);
        // במקרה של שגיאה, רק אישור רגיל
        if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
          performTradeCancellation(tradeId);
        }
      }
    })
    .catch(error => {
      console.error('שגיאה בקבלת נתוני טרייד:', error);
      // במקרה של שגיאה, רק אישור רגיל
      if (confirm('האם אתה בטוח שברצונך לבטל טרייד זה?')) {
        performTradeCancellation(tradeId);
      }
    });
}

/**
 * ביצוע ביטול הטרייד
 * 
 * @param {string|number} tradeId - מזהה הטרייד
 */
function performTradeCancellation(tradeId) {
  fetch(`/api/v1/trades/${tradeId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancel_reason: 'בוטל על ידי המשתמש'
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('שגיאה בביטול הטרייד');
    })
    .then(data => {
      // טרייד בוטל בהצלחה
      if (typeof window.showNotification === 'function') {
        window.showNotification('טרייד בוטל בהצלחה', 'success');
      } else {
        alert('טרייד בוטל בהצלחה');
      }
      loadTradesData(); // Reload the table
    })
    .catch(error => {
      console.error('שגיאה בביטול טרייד:', error);
      if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בביטול הטרייד', 'error');
      } else {
        alert('שגיאה בביטול הטרייד');
      }
    });
}

function deleteTradeRecord(tradeId) {
  // מחיקת טרייד
  if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
    // בדיקה אם יש אובייקטים מקושרים
    checkLinkedItemsBeforeDelete(tradeId);
  }
}

/**
 * בדיקת אובייקטים מקושרים לפני מחיקה
 * 
 * @param {string|number} tradeId - מזהה הטרייד
 */
function checkLinkedItemsBeforeDelete(tradeId) {
  // קבלת נתוני הטרייד כדי להציג את שמו בחלון האזהרה
  fetch(`/api/v1/trades/${tradeId}`)
    .then(response => response.json())
    .then(tradeData => {
      if (tradeData.status === 'success') {
        const trade = tradeData.data;

        // בדיקה אם יש אובייקטים מקושרים (למשל executions)
        fetch(`/api/v1/executions/?trade_id=${tradeId}`)
          .then(response => response.json())
          .then(executionsData => {
            const linkedItems = [];

            // הוספת executions אם יש
            if (executionsData.status === 'success' && executionsData.data && executionsData.data.length > 0) {
              executionsData.data.forEach(execution => {
                linkedItems.push({
                  id: execution.id,
                  type: 'execution',
                  title: `ביצוע ${execution.action} - ${execution.quantity} יחידות`,
                  status: execution.status || 'active',
                  created_at: execution.created_at,
                  notes: execution.notes,
                  action: execution.action,
                  quantity: execution.quantity,
                  price: execution.price
                });
              });
            }

            // בדיקה אם יש notes מקושרות
            fetch(`/api/v1/notes/?related_type_id=2&related_id=${tradeId}`)
              .then(response => response.json())
              .then(notesData => {
                if (notesData.status === 'success' && notesData.data && notesData.data.length > 0) {
                  notesData.data.forEach(note => {
                    linkedItems.push({
                      id: note.id,
                      type: 'note',
                      title: note.content.substring(0, 50) + (note.content.length > 50 ? '...' : ''),
                      status: note.status || 'active',
                      created_at: note.created_at,
                      notes: note.content,
                      content: note.content
                    });
                  });
                }

                // אם יש אובייקטים מקושרים, הצג חלון אזהרה ללא אפשרות מחיקה
                if (linkedItems.length > 0) {
                  const warningData = {
                    tradeSymbol: trade.ticker_symbol,
                    linkedItems: linkedItems
                  };

                  if (typeof window.showLinkedItemsBlockingModal === 'function') {
                    window.showLinkedItemsBlockingModal(
                      warningData,
                      'trade',
                      tradeId
                    );
                  } else {
                    // גיבוי אם הפונקציה לא זמינה
                    alert(`לא ניתן למחוק טרייד זה כי יש ${linkedItems.length} אובייקטים מקושרים אליו.`);
                  }
                } else {
                  // אין אובייקטים מקושרים, רק אישור רגיל
                  if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
                    performTradeDeletion(tradeId);
                  }
                }
              })
              .catch(error => {
                console.error('שגיאה בבדיקת הערות מקושרות:', error);
                // במקרה של שגיאה, רק אישור רגיל
                if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
                  performTradeDeletion(tradeId);
                }
              });
          })
          .catch(error => {
            console.error('שגיאה בבדיקת ביצועים מקושרים:', error);
            // במקרה של שגיאה, רק אישור רגיל
            if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
              performTradeDeletion(tradeId);
            }
          });
      } else {
        console.error('שגיאה בקבלת נתוני טרייד:', tradeData);
        // במקרה של שגיאה, רק אישור רגיל
        if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
          performTradeDeletion(tradeId);
        }
      }
    })
    .catch(error => {
      console.error('שגיאה בקבלת נתוני טרייד:', error);
      // במקרה של שגיאה, רק אישור רגיל
      if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
        performTradeDeletion(tradeId);
      }
    });
}



/**
 * ביצוע מחיקת הטרייד
 * 
 * @param {string|number} tradeId - מזהה הטרייד
 */
function performTradeDeletion(tradeId) {
  fetch(`/api/v1/trades/${tradeId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('שגיאה במחיקת הטרייד');
    })
    .then(data => {
      // טרייד נמחק בהצלחה
      if (typeof window.showNotification === 'function') {
        window.showNotification('טרייד נמחק בהצלחה', 'success');
      } else {
        alert('טרייד נמחק בהצלחה');
      }
      loadTradesData(); // Reload the table
    })
    .catch(error => {
      console.error('שגיאה במחיקת טרייד:', error);
      if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה במחיקת הטרייד', 'error');
      } else {
        alert('שגיאה במחיקת הטרייד');
      }
    });
}

/**
 * פונקציות עזר למודל העריכה
 */
function addEditImportantNote() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לטרייד', 'info');
  }
}

function addEditReminder() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('המודול יאפשר בקרוב לייצר התראות לטרייד', 'info');
  }
}

function addEditBuySell() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
  }
}

/**
 * פונקציות עזר למודל העריכה
 */
function loadTradeExecutions(tradeId) {
  console.log('🔄 טעינת עסקאות לטרייד:', tradeId);

  // כאן תהיה קריאה לשרת לטעינת העסקאות
  // כרגע נציג נתוני דוגמה
  const executionsData = [
    {
      id: 1,
      date: '2024-01-15 10:30',
      type: 'buy',
      quantity: 50,
      price: 44.50,
      commission: 1.25,
      total: 2226.25,
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-16 14:15',
      type: 'buy',
      quantity: 50,
      price: 46.00,
      commission: 1.25,
      total: 2301.25,
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-20 11:45',
      type: 'sell',
      quantity: 100,
      price: 47.50,
      commission: 1.25,
      total: 4748.75,
      status: 'completed'
    }
  ];

  updateExecutionsTable(executionsData);
}

/**
 * עדכון טבלת העסקאות
 */
function updateExecutionsTable(executions) {
  const tableBody = document.getElementById('editTradeExecutionsTable');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  executions.forEach(execution => {
    const row = document.createElement('tr');

    const typeBadge = execution.type === 'buy'
      ? '<span class="badge bg-success">קניה</span>'
      : '<span class="badge bg-danger">מכירה</span>';

    const statusBadge = execution.status === 'completed'
      ? '<span class="badge bg-success">הושלם</span>'
      : '<span class="badge bg-warning">ממתין</span>';

    row.innerHTML = `
      <td>${execution.date}</td>
      <td>${typeBadge}</td>
      <td>${execution.quantity}</td>
      <td>$${execution.price.toFixed(2)}</td>
      <td>$${execution.commission.toFixed(2)}</td>
      <td>$${execution.total.toFixed(2)}</td>
      <td>${statusBadge}</td>
    `;

    tableBody.appendChild(row);
  });
}

/**
 * פונקציה להצגת מודל עריכת טרייד
 */
async function showEditTradeModal(trade) {
  console.log('הצגת מודל עריכת טרייד:', trade);

  // טעינת נתונים למודל העריכה
  await loadEditModalData(trade);

  // טעינת נתוני העסקאות
  loadTradeExecutions(trade.id);

  // שמירת הטרייד המקורי לבדיקות
  window.currentEditTrade = trade;

  // הגדרת ולידציה של שדות תאריך
  setTimeout(() => {
    setupDateValidation();
  }, 100);

  // שמירת הטרייד המקורי לבדיקות
  window.currentEditTrade = trade;

  // הגדרת ולידציה של שדות תאריך
  setTimeout(() => {
    setupDateValidation();
  }, 100);

  // Show the modal
  const modalElement = document.getElementById('editTradeModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  } else {
    console.error('Edit trade modal element not found');
  }
}

/**
 * טעינת נתונים למודל העריכה
 */
async function loadEditModalData(trade) {
  console.log('🔄 loadEditModalData מתחילה');
  try {
    // טעינת חשבונות ותוכניות טרייד
    const [accountsResponse, tradePlansResponse] = await Promise.all([
      fetch('/api/v1/accounts/'),
      fetch('/api/v1/trade_plans/')
    ]);

    if (!accountsResponse.ok || !tradePlansResponse.ok) {
      throw new Error('שגיאה בטעינת נתונים');
    }

    const accounts = await accountsResponse.json();
    const tradePlans = await tradePlansResponse.json();

    console.log('✅ נתונים נטענו למודל עריכה:', {
      accounts: accounts.data.length,
      tradePlans: tradePlans.data.length
    });

    // מילוי רשימת חשבונות - רק חשבונות פתוחים
    const accountSelect = document.getElementById('editTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      const openAccounts = accounts.data.filter(account => account.status === 'open');
      openAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד - רק תוכניות פתוחות
    const tradePlanSelect = document.getElementById('editTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">בחר תוכנית טרייד</option>';
      const openPlans = tradePlans.data.filter(plan => plan.status === 'open');
      openPlans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // הצגת: סימבול | צד | סוג השקעה | תאריך
        const createdDate = new Date(plan.created_at).toLocaleDateString('he-IL');
        const side = plan.side || 'לא מוגדר';
        const investmentType = plan.investment_type || 'לא מוגדר';

        // קבלת סימבול הטיקר - בדיקה אם יש אובייקט ticker או שדה ישיר
        let tickerSymbol = 'לא מוגדר';
        let tickerId = null;

        if (plan.ticker && plan.ticker.symbol) {
          tickerSymbol = plan.ticker.symbol;
          tickerId = plan.ticker.id;
        } else if (plan.ticker_symbol) {
          tickerSymbol = plan.ticker_symbol;
          tickerId = plan.ticker_id;
        }

        // יצירת טקסט עם הסימבול בבולד
        const boldSymbol = `<strong>${tickerSymbol}</strong>`;
        option.innerHTML = `${boldSymbol} | ${side} | ${investmentType} | ${createdDate}`;
        option.setAttribute('data-ticker-symbol', tickerSymbol);
        option.setAttribute('data-ticker-id', tickerId);
        tradePlanSelect.appendChild(option);
      });
    }

    // מילוי השדות עם נתוני הטרייד (אחרי טעינת הנתונים)
    if (trade) {
      const editForm = document.getElementById('editTradeForm');
      if (editForm) {
        // Set form values - using correct field IDs from HTML
        document.getElementById('editTradeId').value = trade.id;
        document.getElementById('editTradeType').value = trade.investment_type || '';
        document.getElementById('editTradeSide').value = trade.side || '';
        document.getElementById('editTradeAccountId').value = trade.account_id || '';
        document.getElementById('editTradeNotes').value = trade.notes || '';

        // Set ticker display
        const tickerDisplay = document.getElementById('editTradeTickerDisplay');
        if (tickerDisplay) {
          tickerDisplay.textContent = trade.ticker_symbol || 'לא מוגדר';
        }

        // Set ticker ID
        const tickerIdInput = document.getElementById('editTradeTickerId');
        if (tickerIdInput) {
          tickerIdInput.value = trade.ticker_id || '';
        }

        // Set trade plan ID
        const tradePlanSelect = document.getElementById('editTradeTradePlanId');
        if (tradePlanSelect) {
          tradePlanSelect.value = trade.trade_plan_id || '';
        }

        // Set dates if they exist
        if (trade.opened_at) {
          const openedDate = new Date(trade.opened_at);
          const dateStr = openedDate.toISOString().slice(0, 16);
          const openedAtInput = document.getElementById('editTradeOpenedAt');
          if (openedAtInput) {
            openedAtInput.value = dateStr;
          }
        }

        if (trade.closed_at) {
          const closedDate = new Date(trade.closed_at);
          const dateStr = closedDate.toISOString().slice(0, 16);
          const closedAtInput = document.getElementById('editTradeClosedAt');
          if (closedAtInput) {
            closedAtInput.value = dateStr;
          }
        }

        // Set status
        const statusSelect = document.getElementById('editTradeStatus');
        if (statusSelect) {
          statusSelect.value = trade.status || 'open';
        }
      }
    }

  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל עריכה:', error);
  }
}

/**
 * שמירת עריכת טרייד
 */
async function saveEditTrade() {
  console.log('🔄 Saving edited trade');

  // שמירת הטרייד המקורי לבדיקות
  const originalTrade = window.currentEditTrade || {};

  // בדיקה שכל האלמנטים קיימים
  const editTradeId = document.getElementById('editTradeId');
  const editTradeType = document.getElementById('editTradeType');
  const editTradeSide = document.getElementById('editTradeSide');
  const editTradeAccountId = document.getElementById('editTradeAccountId');
  const editTradeTradePlanId = document.getElementById('editTradeTradePlanId');
  const editTradeNotes = document.getElementById('editTradeNotes');
  const editTradeOpenedAt = document.getElementById('editTradeOpenedAt');
  const editTradeClosedAt = document.getElementById('editTradeClosedAt');
  const editTradeStatus = document.getElementById('editTradeStatus');
  const editTradeTickerId = document.getElementById('editTradeTickerId');
  const editTradeTickerDisplay = document.getElementById('editTradeTickerDisplay');

  if (!editTradeId || !editTradeType || !editTradeSide || !editTradeAccountId ||
    !editTradeTradePlanId || !editTradeNotes || !editTradeOpenedAt ||
    !editTradeStatus || !editTradeTickerId || !editTradeTickerDisplay) {
    console.error('❌ אלמנטים חסרים בטופס עריכה:', {
      editTradeId: !!editTradeId,
      editTradeType: !!editTradeType,
      editTradeSide: !!editTradeSide,
      editTradeAccountId: !!editTradeAccountId,
      editTradeTradePlanId: !!editTradeTradePlanId,
      editTradeNotes: !!editTradeNotes,
      editTradeOpenedAt: !!editTradeOpenedAt,
      editTradeClosedAt: !!editTradeClosedAt,
      editTradeStatus: !!editTradeStatus,
      editTradeTickerId: !!editTradeTickerId,
      editTradeTickerDisplay: !!editTradeTickerDisplay
    });

    if (typeof window.showNotification === 'function') {
      window.showNotification('חלק מהשדות בטופס העריכה לא נמצאו. אנא סגור ופתח מחדש את המודל.', 'error');
    } else if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שגיאה בטופס', 'חלק מהשדות בטופס העריכה לא נמצאו. אנא סגור ופתח מחדש את המודל.');
    } else {
      alert('שגיאה בטופס: חלק מהשדות בטופס העריכה לא נמצאו. אנא סגור ופתח מחדש את המודל.');
    }
    return;
  }

  // טיפול בשדה status - אם ריק, נשתמש בערך המקורי
  const statusValue = editTradeStatus.value || originalTrade.status || 'open';
  console.log('🔍 בדיקת שדה status:', {
    formValue: editTradeStatus.value,
    originalValue: originalTrade.status,
    finalValue: statusValue
  });

  // טיפול בשדה trade_plan_id - אם ריק, נשלח null
  const tradePlanIdValue = editTradeTradePlanId.value || null;
  console.log('🔍 בדיקת שדה trade_plan_id:', {
    formValue: editTradeTradePlanId.value,
    finalValue: tradePlanIdValue
  });

  const formData = {
    id: editTradeId.value,
    investment_type: editTradeType.value,
    side: editTradeSide.value,
    account_id: editTradeAccountId.value,
    trade_plan_id: tradePlanIdValue,
    notes: editTradeNotes.value,
    opened_at: editTradeOpenedAt.value,
    closed_at: editTradeClosedAt ? editTradeClosedAt.value : null,
    status: statusValue,
    ticker_id: editTradeTickerId.value,
    ticker_symbol: editTradeTickerDisplay.textContent
  };

  // בדיקת כל השינויים
  const validations = await validateTradeChanges(originalTrade, formData);

  if (validations.length > 0) {
    console.log('❌ ביטול שמירה עקב שגיאות ולידציה:', validations);

    // הצגת כל השגיאות
    const errorMessage = validations.join('\n\n');
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאות ולידציה: ' + errorMessage, 'error');
    } else if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שגיאות ולידציה', errorMessage);
    } else {
      alert('שגיאות ולידציה:\n\n' + errorMessage);
    }
    return;
  }

  try {
    const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
    const url = `${base}/api/v1/trades/${formData.id}`;
    console.log('🌐 שליחת בקשה ל:', url);
    console.log('📤 נתונים נשלחים:', formData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('📥 תשובת שרת:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ שגיאת שרת מלאה:', errorText);
      console.error('❌ פרטי השגיאה:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        requestData: formData
      });
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Trade updated successfully:', result);

    // הצגת הודעת הצלחה
    if (window.uiUtils && window.uiUtils.showSuccessNotification) {
      window.uiUtils.showSuccessNotification('טרייד עודכן בהצלחה!', 'הטרייד עודכן בהצלחה במערכת');
    } else {
      alert('טרייד עודכן בהצלחה!');
    }

    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTradeModal'));
    modal.hide();

    // רענון הטבלה
    await loadTradesData();

  } catch (error) {
    console.error('❌ Error updating trade:', error);
    if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שגיאה בעדכון הטרייד', 'שגיאה בתקשורת עם השרת');
    } else {
      alert('שגיאה בעדכון הטרייד: שגיאה בתקשורת עם השרת');
    }
  }
}

/**
 * הצגת מודל הוספת טרייד
 * 
 * פונקציה זו פותחת את מודל ההוספה ומכינה אותו לשימוש
 * 
 * תכונות:
 * - טעינת נתונים למודל (חשבונות, תוכניות טרייד)
 * - ניקוי טופס ההוספה
 * - הגדרת תאריך נוכחי אוטומטי
 * - הצגת המודל עם Bootstrap
 * 
 * תלויות:
 * - loadModalData() - טעינת נתונים למודל
 * - Bootstrap Modal
 */
function showAddTradeModal() {
  console.log('🚀 showAddTradeModal נקראת');

  // טעינת נתונים למודל
  loadModalData();

  // ניקוי הטופס
  const form = document.getElementById('addTradeForm');
  if (form) {
    form.reset();
  }

  // הגדרת תאריך נוכחי
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const hh = String(today.getHours()).padStart(2, '0');
  const min = String(today.getMinutes()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  const dateInput = document.getElementById('addTradeOpenedAt');
  if (dateInput) dateInput.value = todayStr;

  // הצגת המודל
  const modalElement = document.getElementById('addTradeModal');
  if (modalElement) {
    if (typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Bootstrap is not loaded');
      // נסיון חלופי להצגת המודל
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      document.body.classList.add('modal-open');
    }
  } else {
    console.error('Modal element not found');
  }
}

/**
 * ולידציה של טופס הוספת טרייד
 * 
 * פונקציה זו בודקת את תקינות הטופס לפני שליחה לשרת
 * 
 * תכונות:
 * - בדיקת שדות חובה
 * - הצגת הודעות שגיאה מתאימות
 * - ניקוי שגיאות קודמות
 * - החזרת תוצאה בוליאנית
 * 
 * שדות נבדקים:
 * - סוג טרייד (type)
 * - צד (side)
 * - חשבון (account_id)
 * 
 * @returns {boolean} true אם הטופס תקין, false אם לא
 */
function validateTradeForm() {

  const form = document.getElementById('addTradeForm');
  if (!form) {
    console.error('Form element not found');
    return false;
  }

  // ניקוי שגיאות קודמות
  clearTradeValidationErrors();

  let isValid = true;

  // בדיקת תוכנית טרייד (חובה לפי האילוצים)
  const tradePlanElement = document.getElementById('addTradeTradePlanId');
  if (!tradePlanElement.value) {
    showTradeValidationError('tradePlanError', 'יש לבחור תוכנית טרייד');
    isValid = false;
  }

  // בדיקת טיקר (חובה לפי האילוצים)
  const tickerElement = document.getElementById('addTradeTickerId');
  if (!tickerElement.value) {
    showTradeValidationError('tickerError', 'יש לבחור טיקר');
    isValid = false;
  }

  // בדיקת סוג טרייד (תיקון שם השדה)
  const typeElement = document.getElementById('addTradeType');
  if (!typeElement.value) {
    showTradeValidationError('typeError', 'יש לבחור סוג טרייד');
    isValid = false;
  }

  // בדיקת צד
  const sideElement = document.getElementById('addTradeSide');
  if (!sideElement.value) {
    showTradeValidationError('sideError', 'יש לבחור צד');
    isValid = false;
  }

  // בדיקת חשבון
  const accountElement = document.getElementById('addTradeAccountId');
  if (!accountElement.value) {
    showTradeValidationError('accountError', 'יש לבחור חשבון');
    isValid = false;
  }

  // בדיקת תאריך יצירה (חובה לפי האילוצים)
  const createdAtElement = document.getElementById('addTradeOpenedAt');
  if (!createdAtElement.value) {
    showTradeValidationError('createdAtError', 'יש למלא תאריך יצירה');
    isValid = false;
  }

  if (!isValid) {
    if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שדות חובה חסרים', 'יש למלא את כל השדות החובה');
    } else {
      alert('שדות חובה חסרים: יש למלא את כל השדות החובה');
    }
  }

  return isValid;
}

/**
 * הצגת שגיאת ולידציה
 * 
 * פונקציה זו מציגה הודעת שגיאה מתחת לשדה המתאים
 * 
 * @param {string} errorId - מזהה אלמנט השגיאה
 * @param {string} message - הודעת השגיאה
 */
function showTradeValidationError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

/**
 * ניקוי שגיאות ולידציה
 * 
 * פונקציה זו מסתירה את כל הודעות השגיאה בטופס
 */
function clearTradeValidationErrors() {
  const errorIds = ['typeError', 'sideError', 'accountError', 'tradePlanError'];
  errorIds.forEach(id => {
    const errorElement = document.getElementById(id);
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  });
}

/**
 * שמירת טרייד חדש
 * 
 * פונקציה זו שומרת טרייד חדש לשרת
 * כולל ולידציה, איסוף נתונים וטיפול בשגיאות
 * 
 * תכונות:
 * - ולידציה של טופס לפני שליחה
 * - איסוף נתונים מכל שדות הטופס
 * - שליחה לשרת עם API
 * - טיפול בשגיאות והודעות למשתמש
 * - סגירת המודל ורענון הטבלה
 * 
 * מבנה הנתונים הנשלח:
 * - account_id: מזהה החשבון
 * - ticker_id: מזהה הטיקר (אופציונלי)
 * - trade_plan_id: מזהה תוכנית טרייד (אופציונלי)
 * - type: סוג הטרייד (swing, investment, passive)
 * - side: צד הטרייד (Long, Short)
 * - status: סטטוס (open)
 * - created_at: תאריך יצירה
 * - closed_at: תאריך סגירה (אופציונלי)
 * - notes: הערות (אופציונלי)
 * 
 * @returns {Promise<void>}
 */
async function saveNewTradeRecord() {
  console.log('🔄 שמירת טרייד חדש...');
  console.log('🔍 בדיקת אלמנטים לפני שמירה:', {
    accountElement: !!document.getElementById('addTradeAccountId'),
    tickerElement: !!document.getElementById('addTradeTickerId'),
    tradePlanElement: !!document.getElementById('addTradeTradePlanId'),
    typeElement: !!document.getElementById('addTradeType'),
    sideElement: !!document.getElementById('addTradeSide'),
    openedAtElement: !!document.getElementById('addTradeOpenedAt')
  });

  // בדיקת ולידציה
  if (!validateTradeForm()) {
    return;
  }

  // איסוף נתונים מהטופס
  const accountElement = document.getElementById('addTradeAccountId');
  const tickerElement = document.getElementById('addTradeTickerId');
  const tradePlanElement = document.getElementById('addTradeTradePlanId');
  const typeElement = document.getElementById('addTradeType');
  const sideElement = document.getElementById('addTradeSide');
  const openedAtElement = document.getElementById('addTradeOpenedAt');
  const closedAtElement = document.getElementById('addTradeClosedAt');
  const notesElement = document.getElementById('addTradeNotes');

  // בדיקה שכל האלמנטים קיימים
  if (!accountElement || !tickerElement || !tradePlanElement || !typeElement || !sideElement || !openedAtElement) {
    console.error('❌ אלמנטים חסרים בטופס:', {
      accountElement: !!accountElement,
      tickerElement: !!tickerElement,
      tradePlanElement: !!tradePlanElement,
      typeElement: !!typeElement,
      sideElement: !!sideElement,
      openedAtElement: !!openedAtElement
    });

    // בדיקה אם המודל פתוח
    const modal = document.getElementById('addTradeModal');
    console.log('🔍 בדיקת מודל:', {
      modalExists: !!modal,
      modalDisplay: modal ? modal.style.display : 'N/A',
      modalClasses: modal ? modal.className : 'N/A'
    });

    if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שגיאה בטופס', 'חלק מהשדות בטופס לא נמצאו. אנא סגור ופתח מחדש את המודל.');
    } else {
      alert('שגיאה בטופס: חלק מהשדות בטופס לא נמצאו. אנא סגור ופתח מחדש את המודל.');
    }
    return;
  }

  const formData = {
    account_id: parseInt(accountElement.value),
    ticker_id: parseInt(tickerElement.value), // NOT NULL - לא יכול להיות null
    trade_plan_id: parseInt(tradePlanElement.value), // NOT NULL - לא יכול להיות null
    investment_type: typeElement.value, // תיקון שם השדה
    side: sideElement.value,
    status: 'open',
    created_at: openedAtElement.value, // NOT NULL - לא יכול להיות null
    closed_at: closedAtElement ? closedAtElement.value || null : null,
    notes: notesElement ? notesElement.value || null : null
  };

  console.log('שולח טרייד חדש:', formData);

  try {
    const response = await fetch('/api/v1/trades/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      const newTrade = await response.json();
      console.log('טרייד נשמר בהצלחה:', newTrade);

      if (window.uiUtils && window.uiUtils.showSuccessNotification) {
        window.uiUtils.showSuccessNotification('טרייד נשמר בהצלחה', 'הטרייד החדש נוסף למערכת');
      } else {
        alert('טרייד נשמר בהצלחה!');
      }

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTradeModal'));
      modal.hide();

      // רענון הטבלה
      loadTradesData();

    } else {
      const errorData = await response.json();
      console.error('❌ שגיאה בשמירת טרייד - פרטים מלאים:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        requestData: formData
      });

      if (typeof window.showNotification === 'function') {
        window.showNotification(`שגיאה בשמירת טרייד: ${errorData.error?.message || errorData.message || 'שגיאה לא ידועה'}`, 'error');
      } else if (window.uiUtils && window.uiUtils.showErrorNotification) {
        window.uiUtils.showErrorNotification('שגיאה בשמירת טרייד', errorData.error?.message || errorData.message || 'שגיאה לא ידועה');
      } else {
        alert('שגיאה בשמירת טרייד: ' + (errorData.error?.message || errorData.message || 'שגיאה לא ידועה'));
      }
    }

  } catch (error) {
    console.error('שגיאה בשמירת טרייד:', error);
    if (window.uiUtils && window.uiUtils.showErrorNotification) {
      window.uiUtils.showErrorNotification('שגיאה בשמירת טרייד', 'שגיאה בתקשורת עם השרת');
    } else {
      alert('שגיאה בשמירת טרייד: שגיאה בתקשורת עם השרת');
    }
  }
}

/**
 * טעינת נתונים למודל
 * 
 * פונקציה זו טוענת את הנתונים הנדרשים למודל ההוספה
 * 
 * תכונות:
 * - טעינת חשבונות מ-API
 * - טעינת תוכניות טרייד מ-API
 * - מילוי רשימות בחירה במודל
 * - טיפול בשגיאות
 * 
 * נתונים נטענים:
 * - חשבונות: שם וסוג מטבע
 * - תוכניות טרייד: סמל טיקר וסוג השקעה
 * 
 * @returns {Promise<void>}
 */
async function loadModalData() {
  console.log('🔄 loadModalData מתחילה');
  try {

    // טעינת חשבונות
    const accountsResponse = await fetch('/api/v1/accounts/');
    const accounts = await accountsResponse.json();

    // טעינת תוכניות טרייד
    const tradePlansResponse = await fetch('/api/v1/trade_plans/');
    const tradePlans = await tradePlansResponse.json();

    // מילוי רשימת חשבונות - רק חשבונות פתוחים
    const accountSelect = document.getElementById('addTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      const openAccounts = accounts.data.filter(account => account.status === 'open');
      openAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד - הצג כל התוכניות (פתוחות וסגורות)
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">בחר תוכנית טרייד</option>';

      // הצג כל התוכניות - פתוחות וסגורות
      // זה מאפשר למשתמש לבחור מתוכנית קיימת גם אם היא סגורה
      const allPlans = tradePlans.data;

      allPlans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        // הצגת: סימבול | צד | סוג השקעה | תאריך
        const createdDate = new Date(plan.created_at).toLocaleDateString('he-IL');
        const side = plan.side || 'לא מוגדר';
        const investmentType = plan.investment_type || 'לא מוגדר';

        // קבלת סימבול הטיקר - בדיקה אם יש אובייקט ticker או שדה ישיר
        let tickerSymbol = 'לא מוגדר';
        let tickerId = null;

        if (plan.ticker && plan.ticker.symbol) {
          tickerSymbol = plan.ticker.symbol;
          tickerId = plan.ticker.id;
        } else if (plan.ticker_symbol) {
          tickerSymbol = plan.ticker_symbol;
          tickerId = plan.ticker_id;
        }

        // יצירת טקסט עם הסימבול בבולד ואינדיקציה לסטטוס
        const boldSymbol = `<strong>${tickerSymbol}</strong>`;
        const statusIndicator = plan.status === 'open' ? '🟢' : '🔴';
        const statusText = plan.status === 'open' ? 'פתוח' : 'סגור';
        option.innerHTML = `${statusIndicator} ${boldSymbol} | ${side} | ${investmentType} | ${createdDate} (${statusText})`;
        option.setAttribute('data-ticker-symbol', tickerSymbol);
        option.setAttribute('data-ticker-id', tickerId);
        option.setAttribute('data-plan-status', plan.status);
        tradePlanSelect.appendChild(option);
      });
    }

    console.log('✅ נתונים נטענו למודל');
    console.log('🔍 בדיקת אלמנטים אחרי טעינה:', {
      accountSelect: !!document.getElementById('addTradeAccountId'),
      tradePlanSelect: !!document.getElementById('addTradeTradePlanId'),
      tickerDisplay: !!document.getElementById('addTradeTickerDisplay'),
      tickerId: !!document.getElementById('addTradeTickerId')
    });

    // הוספת אירוע לשינוי תוכנית טרייד
    const tradePlanSelectElement = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelectElement) {
      tradePlanSelectElement.addEventListener('change', function () {
        updateTickerFromTradePlan(this.value);
      });
    }

  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל:', error);
  }
}

/**
 * עדכון טיקר ומחיר לפי תוכנית טרייד נבחרת
 * @param {string} tradePlanId - מזהה תוכנית הטרייד
 */
async function updateTickerFromTradePlan(tradePlanId) {
  if (!tradePlanId) {
    // ניקוי שדות אם לא נבחרה תוכנית
    document.getElementById('addTradeTickerDisplay').textContent = 'לא נבחר';
    document.getElementById('addTradeTickerId').value = '';
    document.getElementById('addTradeCurrentPrice').textContent = '-';
    document.getElementById('addTradeDailyChange').textContent = '-';
    return;
  }

  try {
    // קבלת פרטי התוכנית
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    const selectedOption = tradePlanSelect.options[tradePlanSelect.selectedIndex];

    if (selectedOption) {
      const tickerSymbol = selectedOption.getAttribute('data-ticker-symbol');
      const tickerId = selectedOption.getAttribute('data-ticker-id');
      const planStatus = selectedOption.getAttribute('data-plan-status');

      // עדכון שדות הטיקר
      document.getElementById('addTradeTickerDisplay').textContent = tickerSymbol;
      document.getElementById('addTradeTickerId').value = tickerId;

      // הוספת אינדיקציה לסטטוס התוכנית
      const tickerDisplayElement = document.getElementById('addTradeTickerDisplay');
      if (tickerDisplayElement) {
        const statusIndicator = planStatus === 'open' ? '🟢' : '🔴';
        tickerDisplayElement.textContent = `${statusIndicator} ${tickerSymbol}`;
      }

      // כאן אפשר להוסיף קריאה לקבלת מחיר נוכחי ושינוי יומי
      // כרגע נציג ערכים דמו
      document.getElementById('addTradeCurrentPrice').textContent = '$150.25';

      // ערך דמו לשינוי יומי עם צביעה
      const dailyChangeValue = '+2.5%';
      const dailyChangeElement = document.getElementById('addTradeDailyChange');
      dailyChangeElement.textContent = dailyChangeValue;

      // צביעה לפי ערך
      if (dailyChangeValue.startsWith('+')) {
        dailyChangeElement.style.color = '#28a745'; // ירוק
        dailyChangeElement.style.fontWeight = 'bold';
      } else if (dailyChangeValue.startsWith('-')) {
        dailyChangeElement.style.color = '#dc3545'; // אדום
        dailyChangeElement.style.fontWeight = 'bold';
      } else {
        dailyChangeElement.style.color = '#6c757d'; // אפור
      }
    }
  } catch (error) {
    console.error('שגיאה בעדכון טיקר:', error);
  }
}

/**
 * עדכון רשימת טיקרים לפי פילטר "הצג טריידים סגורים"
 * פונקציה זו מתעדכנת כשהמשתמש מסמן/מבטל את הפילטר
 * @param {boolean} showClosed - האם להציג טריידים סגורים
 */
function updateTickersListForClosedTrades(showClosed) {
  console.log('🔄 עדכון רשימת טיקרים לפי פילטר:', showClosed);

  // עדכון רשימת התוכניות במודל הוספת טרייד
  if (showClosed) {
    console.log('🔄 פילטר "הצג טריידים סגורים" פעיל - מעדכן רשימת תוכניות...');
    // טעינה מחדש של נתוני המודל כדי לכלול תוכניות סגורות
    loadModalData();
  } else {
    console.log('🔄 פילטר "הצג טריידים סגורים" לא פעיל - מעדכן רשימת תוכניות...');
    // טעינה מחדש של נתוני המודל
    loadModalData();
  }
}

/**
 * פונקציה גלובלית לעדכון רשימת טיקרים לפי פילטר
 * פונקציה זו נקראת ממערכת הפילטרים הגלובלית
 * @param {boolean} showClosed - האם להציג טריידים סגורים
 */
window.updateTickersForClosedTradesFilter = function (showClosed) {
  console.log('🔄 עדכון רשימת טיקרים לפי פילטר גלובלי:', showClosed);
  updateTickersListForClosedTrades(showClosed);
};

/**
 * פונקציה לעדכון רשימת טיקרים לפי פילטר "הצג טריידים סגורים"
 * פונקציה זו נקראת כשהמשתמש מסמן/מבטל את הפילטר
 * @param {Event} event - אירוע השינוי
 */
function onShowClosedTradesChange(event) {
  const showClosed = event.target.checked;
  console.log('🔄 פילטר "הצג טריידים סגורים" השתנה:', showClosed);
  updateTickersListForClosedTrades(showClosed);
}

// ייצוא הפונקציה לגלובל
window.onShowClosedTradesChange = onShowClosedTradesChange;



/**
 * הוספת הערה חשובה
 */
function addImportantNote() {
  console.log('🔄 הודעת הערות עשירות');

  // הצגת הודעה למשתמש
  if (typeof showNotification === 'function') {
    showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
  } else {
    alert('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית');
  }
}

/**
 * הוספת תזכורת
 */
function addReminder() {
  console.log('🔄 הודעת התראות');

  // הצגת הודעה למשתמש
  if (typeof showNotification === 'function') {
    showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'warning');
  } else {
    alert('המודול יאפשר בקרוב לייצר התראות לתוכנית');
  }
}

/**
 * הוספת תזכורת
 */
function addReminder() {
  console.log('🔄 הודעת התראות');

  // הצגת הודעה למשתמש
  if (typeof showNotification === 'function') {
    showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'warning');
  } else {
    alert('המודול יאפשר בקרוב לייצר התראות לתוכנית');
  }
}

// הגדרת הפונקציה updateGridFromComponent לדף המעקב
window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  // שמירת הפילטרים
  window.selectedStatusesForFilter = selectedStatuses || [];
  window.selectedTypesForFilter = selectedTypes || [];
  window.selectedDateRangeForFilter = selectedDateRange || null;
  window.searchTermForFilter = searchTerm || '';

  // טעינת נתונים מחדש עם הפילטרים החדשים
  if (typeof window.loadTradesData === 'function') {
    window.loadTradesData();
  } else {
    console.error('❌ loadTradesData function not found');
  }
};

/**
 * בדיקת פוזיציה בעדכון סטטוס
 */
function validateTradeStatusChange(newStatus, tradeData) {
  if (newStatus === 'closed') {
    // בדיקה אם יש פוזיציה פתוחה
    const currentPosition = getCurrentPosition(tradeData.id);

    if (currentPosition && currentPosition.quantity > 0) {
      // הודעת אזהרה ראשונה
      const firstWarning = confirm(
        '⚠️ אזהרה: במערכת מופיע שיש פוזיציה פתוחה.\n' +
        'האם אתה בטוח שברצונך לסגור את הטרייד?\n\n' +
        'פוזיציה נוכחית: ' + currentPosition.quantity + ' מניות'
      );

      if (firstWarning) {
        // הודעת אזהרה שנייה
        const secondWarning = confirm(
          '🔒 ממשק הסגירה המלא כולל סגירת פוזיציה נמצא בפיתוח.\n\n' +
          'כרגע ניתן לסגור את הטרייד אך יש לזכור לעדכן עסקה לסגירת פוזיציה.\n\n' +
          'האם אתה בטוח שברצונך להמשיך?'
        );

        if (!secondWarning) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * קבלת פוזיציה נוכחית לטרייד
 */
function getCurrentPosition(tradeId) {
  // כאן תהיה קריאה לשרת לקבלת הפוזיציה הנוכחית
  // כרגע נחזיר נתוני דוגמה
  return {
    quantity: 100,
    averagePrice: 45.25,
    side: 'Long'
  };
}

/**
 * שיוך עסקה קיימת לטרייד
 */
function linkExistingExecution() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח', 'info');
  } else {
    alert('פונקציונליות שיוך עסקה קיימת נמצאת בפיתוח');
  }
}

/**
 * ביטול שיוך עסקה מטרייד
 */
function unlinkExecution() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח', 'info');
  } else {
    alert('פונקציונליות ביטול שיוך עסקה נמצאת בפיתוח');
  }
}

// ========================================
// ייצוא פונקציות לגלובל
// ========================================
// 
// פונקציות יסוד:
window.loadTradesData = loadTradesData;                    // טעינת נתוני טריידים
window.updateTradesTable = updateTradesTable;              // עדכון טבלת טריידים
window.filterTradesData = filterTradesData;                // פילטור נתוני טריידים
window.filterTradesLocally = filterTradesLocally;          // פילטור מקומי לטריידים

// פונקציות פעולות:
window.viewTickerDetails = viewTickerDetails;              // צפייה בפרטי טיקר
window.viewAccountDetails = viewAccountDetails;              // צפייה בפרטי חשבון
window.editTradeRecord = editTradeRecord;                  // עריכת טרייד
window.cancelTradeRecord = cancelTradeRecord;              // ביטול טרייד
window.deleteTradeRecord = deleteTradeRecord;              // מחיקת טרייד

window.checkLinkedItemsBeforeDelete = checkLinkedItemsBeforeDelete;  // בדיקת אובייקטים מקושרים למחיקה
window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;  // בדיקת אובייקטים מקושרים לביטול
window.performTradeDeletion = performTradeDeletion;        // ביצוע מחיקה
window.performTradeCancellation = performTradeCancellation;  // ביצוע ביטול

// פונקציות מודלים:
window.showAddTradeModal = showAddTradeModal;              // הצגת מודל הוספה
window.showEditTradeModal = showEditTradeModal;            // הצגת מודל עריכה
window.saveEditTrade = saveEditTrade;                      // שמירת עריכת טרייד
window.saveNewTradeRecord = saveNewTradeRecord;            // שמירת טרייד חדש

// פונקציות ולידציה:
window.validateTradeForm = validateTradeForm;              // ולידציה של טופס
window.showTradeValidationError = showTradeValidationError; // הצגת שגיאת ולידציה
window.clearTradeValidationErrors = clearTradeValidationErrors; // ניקוי שגיאות ולידציה

// פונקציות עזר:
window.loadModalData = loadModalData;                      // טעינת נתונים למודל
window.loadEditModalData = loadEditModalData;              // טעינת נתונים למודל עריכה
window.updateTickerFromTradePlan = updateTickerFromTradePlan; // עדכון טיקר מתוכנית
window.updateTickersListForClosedTrades = updateTickersListForClosedTrades; // עדכון רשימת טיקרים
window.updateTickersForClosedTradesFilter = window.updateTickersForClosedTradesFilter; // פונקציה גלובלית לעדכון טיקרים
window.onShowClosedTradesChange = onShowClosedTradesChange; // פונקציה לשינוי פילטר טריידים סגורים

// פונקציות כפתורים חדשות
window.addImportantNote = addImportantNote;                // הוספת הערה חשובה
window.addReminder = addReminder;                          // הוספת תזכורת
window.addEditImportantNote = addEditImportantNote;        // הוספת הערה חשובה במודל עריכה
window.addEditReminder = addEditReminder;                  // הוספת תזכורת במודל עריכה
window.addEditBuySell = addEditBuySell;                    // הוספת קניה/מכירה במודל עריכה
window.linkExistingExecution = linkExistingExecution;      // שיוך עסקה קיימת
window.unlinkExecution = unlinkExecution;                  // ביטול שיוך עסקה
window.loadTradeExecutions = loadTradeExecutions;          // טעינת נתוני עסקאות
window.updateExecutionsTable = updateExecutionsTable;      // עדכון טבלת עסקאות
window.validateTradeStatusChange = validateTradeStatusChange; // בדיקת פוזיציה בעדכון סטטוס
window.getCurrentPosition = getCurrentPosition;            // קבלת פוזיציה נוכחית
window.validateTradePlanChange = validateTradePlanChange;  // בדיקת התאמת תוכנית טרייד
window.validateTradeChanges = validateTradeChanges;        // בדיקת שינויים בטרייד
window.setupDateValidation = setupDateValidation;          // הגדרת ולידציה של תאריכים
window.validateDateFields = validateDateFields;            // בדיקת ולידציה של שדות תאריך

// פונקציות סידור:
window.updateTradesSortIcons = updateTradesSortIcons;      // עדכון אייקוני סידור
window.loadTradesSortState = loadTradesSortState;          // טעינת מצב סידור
window.getTradesStatusForSort = getTradesStatusForSort;    // מיון סטטוסים

// פונקצית סידור מותאמת לטבלת טריידים
function sortTable(columnIndex) {
  console.log('🔄 === SORT TRADES TABLE ===');
  console.log('🔄 Column clicked:', columnIndex);

  if (typeof window.sortTableData === 'function') {
    window.sortTableData(
      columnIndex,
      window.tradesData || [],
      'trades',
      window.updateTradesTable
    );
  } else {
    console.error('❌ sortTableData function not found in tables.js');
  }
}

// פונקציה לקבלת ערך מספרי לסטטוס טריידים
function getTradesStatusForSort(status) {
  switch (status) {
    case 'open': return 1;
    case 'closed': return 2;
    case 'cancelled': return 3;
    case 'cancelled': return 3;
    default: return 0;
  }
}

// פונקציה לעדכון אייקוני המיון בטבלת טריידים
function updateTradesSortIcons(activeColumnIndex) {
  const buttons = document.querySelectorAll('#tradesContainer .sortable-header');

  buttons.forEach((button, index) => {
    const sortIcon = button.querySelector('.sort-icon');
    if (sortIcon) {
      if (index === activeColumnIndex) {
        const iconText = window.tradesCurrentSortDirection === 'asc' ? '↑' : '↓';
        sortIcon.textContent = iconText;
        sortIcon.style.color = '#ff9c05';
        button.classList.add('active-sort');
      } else {
        sortIcon.textContent = '↕';
        sortIcon.style.color = '#999';
        button.classList.remove('active-sort');
      }
    }
  });
}

window.sortTable = sortTable;

// ייצוא פונקציות גלובליות
window.loadTradesData = loadTradesData;
window.updateTradesTable = updateTradesTable;
window.editTradeRecord = editTradeRecord;
window.cancelTradeRecord = cancelTradeRecord;
window.deleteTradeRecord = deleteTradeRecord;


// פונקציה לטעינת מצב הסידור השמור
function loadTradesSortState() {
  const savedColumn = localStorage.getItem('tradesSortColumn');
  const savedDirection = localStorage.getItem('tradesSortDirection');

  if (savedColumn !== null) {
    window.tradesCurrentSortColumn = parseInt(savedColumn);
    window.tradesCurrentSortDirection = savedDirection || 'asc';

    // עדכון אייקונים
    updateTradesSortIcons(window.tradesCurrentSortColumn);
  }
}

// הוספת event listeners לכפתורי המיון
function setupSortEventListeners() {
  const sortButtons = document.querySelectorAll('.sortable-header[data-sort-column]');
  sortButtons.forEach(button => {
    button.addEventListener('click', function () {
      const columnIndex = parseInt(this.getAttribute('data-sort-column'));
      if (typeof window.sortTable === 'function') {
        window.sortTable(columnIndex);
      } else {
        console.error('sortTable function not found');
      }
    });
  });
}

// קריאה לטעינת נתונים כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    // טעינת מצב הסידור השמור
    loadTradesSortState();
    // הוספת event listeners
    setupSortEventListeners();
    setTimeout(() => {
      if (typeof window.loadTradesData === 'function') {
        window.loadTradesData();
      }
    }, 1000);
  });
} else {
  // הדף כבר נטען
  // טעינת מצב הסידור השמור
  loadTradesSortState();
  // הוספת event listeners
  setupSortEventListeners();
  setTimeout(() => {
    if (typeof window.loadTradesData === 'function') {
      window.loadTradesData();
    }
  }, 1000);
}

/**
 * בדיקת התאמת תוכנית טרייד לטרייד
 */
async function validateTradePlanChange(newTradePlanId, tradeData) {
  console.log('🔍 validateTradePlanChange - פרמטרים:', { newTradePlanId, tradeData });

  if (!newTradePlanId) {
    console.log('✅ אין תוכנית טרייד - תקין');
    return { isValid: true, message: '' }; // ללא תוכנית - תקין
  }

  try {
    // קבלת פרטי התוכנית החדשה
    const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
    const url = `${base}/api/v1/trade_plans/${newTradePlanId}`;
    console.log('🌐 קריאה ל-API:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('שגיאה בטעינת פרטי התוכנית');
    }

    const tradePlan = await response.json();
    console.log('📋 תשובת API תוכנית טרייד:', tradePlan);

    // בדיקה 1: התאמת טיקר
    console.log('🔍 בדיקת טיקר:', {
      tradePlanTickerId: tradePlan.data.ticker_id,
      tradeDataTickerId: tradeData.ticker_id,
      tradePlanTickerSymbol: tradePlan.data.ticker?.symbol,
      tradeDataTickerSymbol: tradeData.ticker_symbol
    });

    if (tradePlan.data.ticker_id !== tradeData.ticker_id) {
      const errorMessage = `התוכנית החדשה מקושרת לטיקר ${tradePlan.data.ticker?.symbol || 'שונה'} ואילו הטרייד מקושר לטיקר ${tradeData.ticker_symbol || 'שונה'}. לא ניתן לקשר תוכנית לטיקר אחר.`;
      console.log('❌ שגיאה בהתאמת טיקר:', errorMessage);
      return {
        isValid: false,
        message: errorMessage
      };
    }

    // בדיקה 2: התאמת צד (Long/Short)
    if (tradePlan.data.side !== tradeData.side) {
      return {
        isValid: false,
        message: `התוכנית החדשה היא ${tradePlan.data.side === 'Long' ? 'Long' : 'Short'} ואילו הטרייד הוא ${tradeData.side === 'Long' ? 'Long' : 'Short'}. לא ניתן לקשר תוכנית לצד אחר.`
      };
    }

    // בדיקה 3: תאריך יצירת התוכנית לא מאוחר מתאריך פתיחת הטרייד
    if (tradePlan.data.created_at && tradeData.opened_at) {
      const planCreatedAt = new Date(tradePlan.data.created_at);
      const tradeOpenedAt = new Date(tradeData.opened_at);

      if (planCreatedAt > tradeOpenedAt) {
        return {
          isValid: false,
          message: `תאריך יצירת התוכנית (${planCreatedAt.toLocaleDateString('he-IL')}) מאוחר מתאריך פתיחת הטרייד (${tradeOpenedAt.toLocaleDateString('he-IL')}). לא ניתן לקשר תוכנית שנוצרה אחרי פתיחת הטרייד.`
        };
      }
    }

    return { isValid: true, message: '' };

  } catch (error) {
    console.error('שגיאה בבדיקת תוכנית טרייד:', error);
    return {
      isValid: false,
      message: 'שגיאה בבדיקת התוכנית. אנא נסה שוב.'
    };
  }
}

/**
 * בדיקת שינויים בטרייד לפני שמירה
 */
async function validateTradeChanges(originalTrade, updatedTrade) {
  const validations = [];

  // בדיקת שינוי תוכנית טרייד
  const originalPlanId = originalTrade.trade_plan_id ? parseInt(originalTrade.trade_plan_id) : null;
  const updatedPlanId = updatedTrade.trade_plan_id ? parseInt(updatedTrade.trade_plan_id) : null;

  console.log('🔍 בדיקת שינוי תוכנית טרייד:', {
    original: originalPlanId,
    updated: updatedPlanId,
    originalType: typeof originalPlanId,
    updatedType: typeof updatedPlanId,
    originalRaw: originalTrade.trade_plan_id,
    updatedRaw: updatedTrade.trade_plan_id,
    changed: originalPlanId !== updatedPlanId
  });

  // בדיקה אם יש שינוי אמיתי (לא רק null vs null)
  if (originalPlanId !== updatedPlanId && (originalPlanId !== null || updatedPlanId !== null)) {
    console.log('🔄 תוכנית טרייד השתנתה, בודק ולידציה...');
    const planValidation = await validateTradePlanChange(updatedPlanId, updatedTrade);
    console.log('📋 תוצאות ולידציה תוכנית:', planValidation);
    if (!planValidation.isValid) {
      validations.push(planValidation.message);
    }
  } else {
    console.log('✅ תוכנית טרייד לא השתנתה, דילוג על בדיקה');
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
}

/**
 * ולידציה בזמן אמת של שדות תאריך
 */
function setupDateValidation() {
  const openedAtField = document.getElementById('editTradeOpenedAt');
  const closedAtField = document.getElementById('editTradeClosedAt');

  if (openedAtField && closedAtField) {
    // ולידציה בעת שינוי תאריך יצירה
    openedAtField.addEventListener('change', function () {
      validateDateFields();
    });

    // ולידציה בעת שינוי תאריך סגירה
    closedAtField.addEventListener('change', function () {
      validateDateFields();
    });
  }
}

/**
 * בדיקת ולידציה של שדות תאריך
 */
function validateDateFields() {
  const openedAtField = document.getElementById('editTradeOpenedAt');
  const closedAtField = document.getElementById('editTradeClosedAt');

  if (!openedAtField || !closedAtField) return;

  const openedAt = openedAtField.value;
  const closedAt = closedAtField.value;

  // הסרת הודעות שגיאה קודמות
  clearDateValidationMessages();

  if (openedAt && closedAt) {
    const openedDate = new Date(openedAt);
    const closedDate = new Date(closedAt);

    if (closedDate < openedDate) {
      showDateValidationError('תאריך סגירה לא יכול להיות לפני תאריך יצירה');
      closedAtField.classList.add('is-invalid');
    } else {
      closedAtField.classList.remove('is-invalid');
      closedAtField.classList.add('is-valid');
    }
  }
}

/**
 * הצגת הודעת שגיאה לולידציה
 */
function showDateValidationError(message) {
  const closedAtField = document.getElementById('editTradeClosedAt');
  if (!closedAtField) return;

  // הסרת הודעות קודמות
  const existingError = closedAtField.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  // הוספת הודעת שגיאה
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  closedAtField.parentNode.appendChild(errorDiv);
}

/**
 * ניקוי הודעות ולידציה
 */
function clearDateValidationMessages() {
  const closedAtField = document.getElementById('editTradeClosedAt');
  if (!closedAtField) return;

  const existingError = closedAtField.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  closedAtField.classList.remove('is-invalid', 'is-valid');
}
