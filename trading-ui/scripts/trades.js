/**
 * Trades.js - TikTrack Frontend
 * =============================
 * 
 * This file contains all trade management functionality for the TikTrack application.
 * It handles trade CRUD operations, table updates, filtering, and user interactions.
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
 * 
 * Table Mapping:
 * - Uses 'trades' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 * 
 * @version 2.2
 * @lastUpdated August 23, 2025
 * 
 * פונקציות עיקריות:
 * - cancelTradeRecord() - ביטול טרייד
 * - deleteTradeRecord() - מחיקת טרייד
 * - validateTradeForm() - ולידציה של טופס
 * 
 * תכונות חדשות:
 * - ולידציה מלאה של טופס הוספת טרייד
 * - שמירה לשרת עם API
 * - טעינת נתונים למודל (חשבונות, תוכניות)
 * - הודעות שגיאה והצלחה
 * - עיצוב אחיד עם שאר המודלים
 * 
 * מחבר: Tik.track Development Team
 * תאריך עדכון אחרון: 2025-08-20
 * ========================================
 */

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
 * - טיפול בפורמט נתונים שונה
 * - עדכון משתנה גלובלי
 * - עדכון ישיר של הטבלה
 * - טיפול בשגיאות עם הודעה למשתמש
 * 
 * @returns {Promise<void>}
 */
/**
 * Load trades data from server
 * 
 * This function fetches trade data from the backend API and updates
 * the trades table with the retrieved data. It handles loading states,
 * error handling, and data processing.
 * 
 * @returns {Promise<void>}
 * 
 * Features:
 * - Async/await pattern for clean error handling
 * - Loading state management
 * - Comprehensive error handling and user feedback
 * - Integration with global notification system
 * - Automatic table updates after data loading
 */
async function loadTradesData() {
  try {
    console.log('🔄 === LOAD TRADES DATA ===');
    console.log('🔄 Starting to load trades data...');
    console.log('🔄 Current URL:', window.location.href);
    console.log('🔄 API URL:', '/api/v1/trades/');

    // קריאה מה-API
    console.log('🔄 Fetching from API...');
    const response = await fetch('/api/v1/trades/');
    console.log('🔄 Response status:', response.status);
    console.log('🔄 Response headers:', response.headers);

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let apiData = await response.json();
    console.log('🔄 Raw API response:', apiData);

    // בדיקה שהנתונים בפורמט הנכון
    if (apiData && apiData.data && Array.isArray(apiData.data)) {
      apiData = apiData.data;
    }

    console.log('📡 נתונים מה-API:', apiData);
    console.log('📡 אורך הנתונים:', apiData ? apiData.length : 'null');

    // עדכון הנתונים המקומיים - שימוש בשמות אחידים מה-API
    tradesData = apiData.map(trade => ({
      id: trade.id,
      account_id: trade.account_id,
      account_name: trade.account_name,
      ticker_id: trade.ticker_id,
      ticker_symbol: trade.ticker_symbol,
      trade_plan_id: trade.trade_plan_id,
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

    console.log('📊 נתונים מעודכנים:', tradesData.length, 'trades');

    // עדכון ישיר של הטבלה - ללא פילטרים מורכבים
    console.log('🔄 Updating trades table directly with', tradesData.length, 'trades');
    
    // בדיקה אם יש פילטרים פעילים
    const hasActiveFilters = (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) ||
        (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) ||
        (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') ||
        (window.searchTermForFilter && window.searchTermForFilter.trim() !== '');

    console.log('🔄 Checking filters for trades page:', {
        hasActiveFilters,
        selectedStatusesForFilter: window.selectedStatusesForFilter,
        selectedTypesForFilter: window.selectedTypesForFilter,
        selectedDateRangeForFilter: window.selectedDateRangeForFilter,
        searchTermForFilter: window.searchTermForFilter
    });

    let filteredTrades = [...tradesData];

    if (hasActiveFilters) {
        console.log('🔄 Applying filters to trades data...');
        filteredTrades = filterTradesLocally(tradesData, window.selectedStatusesForFilter, window.selectedTypesForFilter, window.selectedDateRangeForFilter, window.searchTermForFilter);
        console.log('🔄 After filtering:', filteredTrades.length, 'trades');
    } else {
        console.log('🔄 No active filters, showing all trades');
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
 * 
 * פונקציה זו מסננת את נתוני הטריידים לפי הפרמטרים שהועברו
 * כרגע מחזירה את כל הנתונים ללא פילטור (כמו בדף database)
 * 
 * @param {Array} selectedStatuses - מערך סטטוסים נבחרים
 * @param {Array} selectedTypes - מערך סוגים נבחרים
 * @param {Array} selectedAccounts - מערך חשבונות נבחרים
 * @param {Object} selectedDateRange - טווח תאריכים נבחר
 * @param {string} searchTerm - מונח חיפוש
 */
function filterTradesData(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm) {
  console.log('🔄 === FILTER TRADES DATA (SIMPLE) ===');

  // החזרת כל הנתונים ללא פילטור - כמו בדף database
  const globalTradesData = window.tradesData || [];
  console.log('🔄 Returning all trades without filtering:', globalTradesData.length, 'trades');

  updateTradesTable(globalTradesData);
}

/**
 * פילטור מקומי לטריידים
 */
function filterTradesLocally(trades, selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
    console.log('🔄 === FILTER TRADES LOCALLY ===');
    console.log('🔄 Original trades:', trades.length);
    console.log('🔄 Filters:', { selectedStatuses, selectedTypes, selectedDateRange, searchTerm });

    let filteredTrades = [...trades];

    // Extracting start and end dates
    let startDate = null;
    let endDate = null;

    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
        console.log('🔄 Filter: Translating date range:', selectedDateRange);
        const dateRange = window.translateDateRangeToDates ? window.translateDateRangeToDates(selectedDateRange) : { startDate: null, endDate: null };
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        console.log('🔄 Filter: Translation result:', { startDate, endDate });
    }

    console.log('🔄 Extracted dates:', { startDate, endDate });

    // Filtering by status
    if (selectedStatuses && selectedStatuses.length > 0 && !selectedStatuses.includes('all')) {
        console.log('🔄 Filtering by status:', selectedStatuses);
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
            console.log(`🔄 Trade ${trade.id}: status=${trade.status}, selected=${selectedStatuses}, translated=${translatedSelectedStatuses}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After status filter:', filteredTrades.length, 'trades');
    }

    // Filtering by type
    if (selectedTypes && selectedTypes.length > 0 && !selectedTypes.includes('all')) {
        console.log('🔄 Filtering by type:', selectedTypes);
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
            console.log(`🔄 Trade ${trade.id}: type=${tradeType}, selected=${selectedTypes}, translated=${translatedSelectedTypes}, match=${isMatch}`);
            return isMatch;
        });
        console.log('🔄 After type filter:', filteredTrades.length, 'trades');
    }

    // Filtering by dates
    if (startDate && endDate) {
        console.log('🔄 Filtering by date range:', { startDate, endDate });
        filteredTrades = filteredTrades.filter(trade => {
            if (!trade.created_at) return false;

            const tradeDate = new Date(trade.created_at);
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Setting time to start of day for start date and end of day for end date
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInRange = tradeDate >= start && tradeDate <= end;
            console.log(`🔄 Trade ${trade.id}: created_at=${trade.created_at}, inRange=${isInRange}`);
            return isInRange;
        });
        console.log('🔄 After date filter:', filteredTrades.length, 'trades');
    }

    // Filtering by search term
    if (searchTerm && searchTerm.trim() !== '') {
        console.log('🔄 Filtering by search term:', searchTerm);
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

            // Investment type translations
            'סווינג': 'swing',
            'השקעה': 'investment',
            'פסיבי': 'passive',
            'swing': 'swing',
            'investment': 'investment',
            'passive': 'passive',

            // Side translations
            'לונג': 'long',
            'שורט': 'short',
            'long': 'long',
            'short': 'short'
        };

        // Creating an array of search terms including translations
        const searchTerms = [searchLower];

        // Adding exact translation
        if (searchTranslations[searchLower]) {
            searchTerms.push(searchTranslations[searchLower]);
        }

        // Adding partial search - if user searches for part of a word
        Object.keys(searchTranslations).forEach(hebrewTerm => {
            if (hebrewTerm.includes(searchLower) && !searchTerms.includes(searchTranslations[hebrewTerm])) {
                searchTerms.push(searchTranslations[hebrewTerm]);
            }
        });

        filteredTrades = filteredTrades.filter(trade => {
            // Searching in all relevant fields
            const tickerMatch = trade.ticker_symbol && searchTerms.some(term =>
                trade.ticker_symbol.toLowerCase().includes(term)
            );

            const typeMatch = trade.investment_type && searchTerms.some(term =>
                trade.investment_type.toLowerCase().includes(term)
            );

            const sideMatch = trade.side && searchTerms.some(term =>
                trade.side.toLowerCase().includes(term)
            );

            const statusMatch = trade.status && searchTerms.some(term =>
                trade.status.toLowerCase().includes(term)
            );

            const notesMatch = trade.notes && searchTerms.some(term =>
                trade.notes.toLowerCase().includes(term)
            );

            const isMatch = tickerMatch || typeMatch || sideMatch || statusMatch || notesMatch;

            console.log(`🔄 Trade ${trade.id} search:`, {
                ticker: trade.ticker_symbol,
                type: trade.investment_type,
                side: trade.side,
                status: trade.status,
                searchTerms: searchTerms,
                originalSearch: searchLower,
                match: isMatch
            });

            return isMatch;
        });
        console.log('🔄 After search filter:', filteredTrades.length, 'trades');
    }

    console.log('🔄 Final filtered trades:', filteredTrades.length);
    return filteredTrades;
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
    const typeDisplay = window.translateTradeType ? window.translateTradeType(trade.investment_type) : trade.investment_type;

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = trade.investment_type || '';

    return `
    <tr>
      <td><strong><a href="#" onclick="viewTickerDetails('${trade.ticker_id}')" class="ticker-link">${trade.ticker_symbol || 'טיקר לא ידוע'}</a></strong></td>
      <td data-status="${trade.status || ''}"><span class="status-badge status-${trade.status || 'open'}">${statusDisplay}</span></td>
      <td data-type="${typeForFilter}">${typeDisplay}</td>
      <td>${trade.side || 'Long'}</td>
      <td>${window.colorAmount(trade.total_pl || 0, trade.total_pl ? `$${trade.total_pl.toFixed(2)}` : '$0.00')}</td>
      <td>${trade.trade_plan_id ? `תוכנית ${trade.trade_plan_id}` : '-'}</td>
      <td data-date="${trade.created_at}">${trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'לא מוגדר'}</td>
      <td>${trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : trade.cancelled_at ? new Date(trade.cancelled_at).toLocaleDateString('he-IL') : ''}</td>
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
    // Implement cancel trade API call
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
        console.log('טרייד בוטל בהצלחה:', data);
        showNotification('טרייד בוטל בהצלחה', 'success');
        loadTradesData(); // Reload the table
      })
      .catch(error => {
        console.error('שגיאה בביטול טרייד:', error);
        showNotification('שגיאה בביטול הטרייד', 'error');
      });
  }
}

function deleteTradeRecord(tradeId) {
  console.log('מחיקת טרייד:', tradeId);
  if (confirm('האם אתה בטוח שברצונך למחוק טרייד זה? פעולה זו אינה הפיכה.')) {
    // Implement delete trade API call
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
        console.log('טרייד נמחק בהצלחה:', data);
        showNotification('טרייד נמחק בהצלחה', 'success');
        loadTradesData(); // Reload the table
      })
      .catch(error => {
        console.error('שגיאה במחיקת טרייד:', error);
        showNotification('שגיאה במחיקת הטרייד', 'error');
      });
  }
}

// פונקציה להצגת מודל עריכת טרייד
function showEditTradeModal(trade) {
  console.log('הצגת מודל עריכת טרייד:', trade);

  // Populate the edit form with trade data
  const editForm = document.getElementById('editTradeForm');
  if (editForm) {
    // Set form values
    document.getElementById('editTradeId').value = trade.id;
    document.getElementById('editTradeInvestmentType').value = trade.investment_type || '';
    document.getElementById('editTradeSide').value = trade.side || '';
    document.getElementById('editTradeAccount').value = trade.account_id || '';
    document.getElementById('editTradeNotes').value = trade.notes || '';

    // Set date if exists
    if (trade.opened_at) {
      const openedDate = new Date(trade.opened_at);
      const dateStr = openedDate.toISOString().slice(0, 16);
      document.getElementById('editTradeOpenedAt').value = dateStr;
    }
  }

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
  console.log('🔄 === SHOW ADD TRADE MODAL ===');

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
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
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
  console.log('🔄 === VALIDATE TRADE FORM ===');

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
    showErrorNotification('שדות חובה חסרים', 'יש למלא את כל השדות החובה');
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
  console.log('🔄 === SAVE NEW TRADE RECORD ===');

  // בדיקת ולידציה
  if (!validateTradeForm()) {
    return;
  }

  // איסוף נתונים מהטופס
  const formData = {
    account_id: parseInt(document.getElementById('addTradeAccountId').value),
    ticker_id: parseInt(document.getElementById('addTradeTickerId').value), // NOT NULL - לא יכול להיות null
    trade_plan_id: parseInt(document.getElementById('addTradeTradePlanId').value), // NOT NULL - לא יכול להיות null
    investment_type: document.getElementById('addTradeType').value, // תיקון שם השדה
    side: document.getElementById('addTradeSide').value,
    status: 'open',
    created_at: document.getElementById('addTradeOpenedAt').value, // NOT NULL - לא יכול להיות null
    closed_at: document.getElementById('addTradeClosedAt').value || null,
    notes: document.getElementById('addTradeNotes').value || null
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

      showSuccessNotification('טרייד נשמר בהצלחה', 'הטרייד החדש נוסף למערכת');

      // סגירת המודל
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTradeModal'));
      modal.hide();

      // רענון הטבלה
      loadTradesData();

    } else {
      const errorData = await response.json();
      console.error('שגיאה בשמירת טרייד:', errorData);
      showErrorNotification('שגיאה בשמירת טרייד', errorData.message || 'שגיאה לא ידועה');
    }

  } catch (error) {
    console.error('שגיאה בשמירת טרייד:', error);
    showErrorNotification('שגיאה בשמירת טרייד', 'שגיאה בתקשורת עם השרת');
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
  try {
    console.log('🔄 טוען נתונים למודל...');

    // טעינת חשבונות
    const accountsResponse = await fetch('/api/v1/accounts/');
    const accounts = await accountsResponse.json();

    // טעינת תוכניות טרייד
    const tradePlansResponse = await fetch('/api/v1/trade_plans/');
    const tradePlans = await tradePlansResponse.json();

    // מילוי רשימת חשבונות
    const accountSelect = document.getElementById('addTradeAccountId');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
      accounts.data.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.currency})`;
        accountSelect.appendChild(option);
      });
    }

    // מילוי רשימת תוכניות טרייד
    const tradePlanSelect = document.getElementById('addTradeTradePlanId');
    if (tradePlanSelect) {
      tradePlanSelect.innerHTML = '<option value="">ללא תוכנית</option>';
      tradePlans.data.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = `${plan.ticker_symbol} - ${plan.investment_type}`;
        tradePlanSelect.appendChild(option);
      });
    }

    console.log('✅ נתונים נטענו למודל');

  } catch (error) {
    console.error('שגיאה בטעינת נתונים למודל:', error);
  }
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
window.editTradeRecord = editTradeRecord;                  // עריכת טרייד
window.cancelTradeRecord = cancelTradeRecord;              // ביטול טרייד
window.deleteTradeRecord = deleteTradeRecord;              // מחיקת טרייד

// פונקציות מודלים:
window.showAddTradeModal = showAddTradeModal;              // הצגת מודל הוספה
window.showEditTradeModal = showEditTradeModal;            // הצגת מודל עריכה
window.saveNewTradeRecord = saveNewTradeRecord;            // שמירת טרייד חדש

// פונקציות ולידציה:
window.validateTradeForm = validateTradeForm;              // ולידציה של טופס
window.showTradeValidationError = showTradeValidationError; // הצגת שגיאת ולידציה
window.clearTradeValidationErrors = clearTradeValidationErrors; // ניקוי שגיאות ולידציה

// פונקציות עזר:
window.loadModalData = loadModalData;                      // טעינת נתונים למודל

// פונקציות סידור:
window.updateTradesSortIcons = updateTradesSortIcons;      // עדכון אייקוני סידור
window.loadTradesSortState = loadTradesSortState;          // טעינת מצב סידור
window.getTradesStatusForSort = getTradesStatusForSort;    // מיון סטטוסים

// פונקציית סידור מותאמת לטבלת טריידים
function sortTable(columnIndex) {
  console.log('🔄 === SORT TRADES TABLE ===');
  console.log('🔄 Column clicked:', columnIndex);

  if (typeof window.sortTableData === 'function') {
    const sortedData = window.sortTableData(
      columnIndex,
      window.tradesData || [],
      'trades',
      window.updateTradesTable
    );
    console.log('✅ נתונים מסודרים:', sortedData);
  } else {
    console.error('❌ sortTableData function not found in main.js');
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

// קריאה לטעינת נתונים כשהדף נטען
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 === TRADES.JS DOM CONTENT LOADED ===');
    // טעינת מצב הסידור השמור
    loadTradesSortState();
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
  // טעינת מצב הסידור השמור
  loadTradesSortState();
  setTimeout(() => {
    if (typeof window.loadTradesData === 'function') {
      console.log('🔄 Calling loadTradesData from trades.js (already loaded)');
      window.loadTradesData();
    }
  }, 1000);
}
