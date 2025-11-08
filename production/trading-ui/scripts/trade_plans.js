/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 52
 * 
 * PAGE INITIALIZATION (4)
 * - setupPriceCalculation() - * View linked items for trade plan
 * - setupEditPriceCalculation() - setupEditPriceCalculation function
 * - initializeTradePlanConditionsSystem() - initializeTradePlanConditionsSystem function
 * - setupSortableHeadersLocal() - setupSortableHeadersLocal function
 * 
 * DATA LOADING (4)
 * - loadTickerInfo() - * Disable edit form fields
 * - loadTradePlanTickerInfo() - loadTradePlanTickerInfo function
 * - loadEditTickerInfo() - loadEditTickerInfo function
 * - loadTradePlansData() - loadTradePlansData function
 * 
 * DATA MANIPULATION (23)
 * - updateTickerInfo() - * Hide ticker information display
 * - updateSharesFromAmount() - updateSharesFromAmount function
 * - updateAmountFromShares() - updateAmountFromShares function
 * - updateFormFieldsWithTickerData() - updateFormFieldsWithTickerData function
 * - updateEditFormFieldsWithTickerData() - * Hide edit ticker information section
 * - updateEditTickerInfo() - updateEditTickerInfo function
 * - updateEditSharesFromAmount() - updateEditSharesFromAmount function
 * - updateEditAmountFromShares() - updateEditAmountFromShares function
 * - saveEditTradePlan() - * עדכון סכום מתוכנן ממספר מניות במודל העריכה
 * - addEditCondition() - addEditCondition function
 * - addEditReason() - * Add condition to edit modal
 * - addEditImportantNote() - * Add edit reason functionality (placeholder)
 * - addEditReminder() - * Add edit important note functionality (placeholder)
 * - addImportantNote() - * Add edit reminder functionality (placeholder)
 * - addReminder() - * Add important note functionality (placeholder for add modal)
 * - updateDesignsTable() - updateDesignsTable function
 * - updateTradePlansTable() - updateTradePlansTable function
 * - updateTradePlansPageSummaryStats() - updateTradePlansPageSummaryStats function
 * - saveTradePlanData() - saveTradePlanData function
 * - saveNewTradePlan() - saveNewTradePlan function
 * - showAddTradePlanModal() - showAddTradePlanModal function
 * - saveTradePlan() - * Show add trade plan modal
 * - deleteTradePlan() - deleteTradePlan function
 * 
 * EVENT HANDLING (2)
 * - restorePlanningSectionState() - * Setup sortable headers for trade plans table
 * - performTradePlanDeletion() - performTradePlanDeletion function
 * 
 * UI UPDATES (6)
 * - displayTickerInfo() - * טעינת מידע על הטיקר (למודל החדש)
 * - displayTradePlanTickerInfo() - displayTradePlanTickerInfo function
 * - hideTickerInfo() - hideTickerInfo function
 * - displayEditTickerInfo() - displayEditTickerInfo function
 * - hideEditTickerInfo() - hideEditTickerInfo function
 * - showEditTradePlanModal() - * Show add trade plan modal
 * 
 * VALIDATION (1)
 * - checkLinkedItemsBeforeCancel() - checkLinkedItemsBeforeCancel function
 * 
 * OTHER (12)
 * - executeTradePlan() - executeTradePlan function
 * - copyTradePlan() - copyTradePlan function
 * - enableFormFields() - enableFormFields function
 * - disableFormFields() - * פתיחת מודל הוספת תכנון חדש
 * - enableEditFieldsWrapper() - * Disable form fields for trade plan creation
 * - disableEditFields() - * Enable edit form fields wrapper
 * - reactivateTradePlan() - * בדיקת פריטים מקושרים לפני ביטול תכנון
 * - openCancelTradePlanModal() - * Add reminder functionality (placeholder for add modal)
 * - cancelTradePlan() - cancelTradePlan function
 * - viewLinkedItemsForTradePlan() - viewLinkedItemsForTradePlan function
 * - filterTradePlansData() - * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 * - filterTradePlansByType() - filterTradePlansByType function
 * 
 * ==========================================
 */
/**
 * Trade Plans Page - Comprehensive Function Index
 * ================================================
 * 
 * This file contains all functions for managing trade plans including:
 * - CRUD operations for trade plans
 * - Form management and validation
 * - UI interactions and modal handling
 * - Data filtering and sorting
 * - Price calculations and ticker management
 * - Conditions system integration
 * 
 * Author: TikTrack Development Team
 * Version: 2.0
 * Last Updated: 2025-01-27
 */

// Note: We'll capture the global function reference when updatePageSummaryStats is first called
// This avoids issues with function hoisting and ensures we get the true global function

/**
 * ========================================
 * Trade Plans Page - Trade Plans Page
 * ========================================
 * ביצוע תוכנית מסחר
 * מבצע את התוכנית המסחרית
 * @param {number} planId - מזהה התוכנית
 */
function executeTradePlan(planId) {
  try {
    window.Logger.info('⚡ מבצע תוכנית מסחר:', planId, { page: "trade_plans" });
    
    // חיפוש התוכנית בנתונים
    const plan = window.tradePlansData.find(p => p.id === planId);
    if (!plan) {
      throw new Error('תוכנית מסחר לא נמצאה');
    }
    
    // בדיקת תקינות התוכנית
    if (!plan.is_active) {
      throw new Error('תוכנית מסחר לא פעילה');
    }
    
    // הצגת חלון אישור
    const confirmMessage = `האם אתה בטוח שברצונך לבצע את התוכנית?\n\n` +
      `שם התוכנית: ${plan.name || 'לא ידוע'}\n` +
      `טיקר: ${plan.ticker_symbol || 'לא ידוע'}\n` +
      `סכום: ${plan.amount || 'לא ידוע'}`;
    
    if (confirm(confirmMessage)) {
      // שליחה לשרת לביצוע התוכנית
      fetch('/api/trade_plans/' + planId + '/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('שגיאה בביצוע תוכנית מסחר');
        }
        return response.json();
      })
      .then(data => {
        window.Logger.info('✅ תוכנית מסחר בוצעה:', data, { page: "trade_plans" });
        
        // רענון הטבלה
        loadTradePlansData();
        
        // הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('תוכנית מסחר בוצעה בהצלחה', '', 4000, 'business');
        } else if (typeof window.showNotification === 'function') {
          window.showNotification('תוכנית מסחר בוצעה בהצלחה', 'success');
        }
      })
      .catch(error => {
        window.Logger.error('שגיאה בביצוע תוכנית מסחר:', error, { page: "trade_plans" });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה בביצוע תוכנית מסחר', error.message, 6000, 'system');
        } else if (typeof window.showNotification === 'function') {
          window.showNotification('שגיאה בביצוע תוכנית מסחר', 'error');
        }
      });
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בביצוע תוכנית מסחר:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בביצוע תוכנית מסחר', error.message, 6000, 'system');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בביצוע תוכנית מסחר', 'error');
    }
  }
}

// REMOVED: copyTradePlan - not used
/**
 * העתקת תוכנית מסחר
 * יוצר עותק של תוכנית מסחר קיימת
 * @param {number} planId - מזהה התוכנית
 */
function _REMOVED_copyTradePlan(planId) {
  try {
    window.Logger.info('📋 מעתיק תוכנית מסחר:', planId, { page: "trade_plans" });
    
    // חיפוש התוכנית בנתונים
    const plan = window.tradePlansData.find(p => p.id === planId);
    if (!plan) {
      throw new Error('תוכנית מסחר לא נמצאה');
    }
    
    // יצירת עותק של התוכנית
    const copiedPlan = {
      ...plan,
      id: null, // מזהה חדש ייווצר
      name: (plan.name || 'תוכנית חדשה') + ' - עותק',
      is_active: false, // התוכנית החדשה לא פעילה
      created_at: null,
      updated_at: null
    };
    
    // שליחה לשרת ליצירת העותק
    fetch('/api/trade_plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(copiedPlan)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('שגיאה בהעתקת תוכנית מסחר');
      }
      return response.json();
    })
    .then(data => {
      window.Logger.info('✅ תוכנית מסחר הועתקה:', data, { page: "trade_plans" });
      
      // רענון הטבלה
      loadTradePlansData();
      
      // הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('תוכנית מסחר הועתקה בהצלחה', '', 4000, 'business');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('תוכנית מסחר הועתקה בהצלחה', 'success');
      }
    })
    .catch(error => {
      window.Logger.error('שגיאה בהעתקת תוכנית מסחר:', error, { page: "trade_plans" });
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בהעתקת תוכנית מסחר', error.message, 6000, 'system');
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בהעתקת תוכנית מסחר', 'error');
      }
    });
    
  } catch (error) {
    window.Logger.error('שגיאה בהעתקת תוכנית מסחר:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהעתקת תוכנית מסחר', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהעתקת תוכנית מסחר', 'error');
    }
  }
}

/**
 * Dedicated file for the trade plans page (trade_plans.html)
 *
 * RECENT UPDATES (August 31, 2025):
 * =================================
 *
 * VALIDATION SYSTEM IMPROVEMENTS:
 * - Fixed duplicate error messages in add form
 * - Implemented global validation system integration
 * - Real-time field validation with error highlighting
 * - Proper error field indication and clearing
 *
 * TICKER CHANGE FEATURE:
 * - Added immediate confirmation dialog when ticker changes
 * - Feature currently disabled with "Feature not supported" message
 * - Automatic revert to original ticker value
 * - Clear user feedback about feature status
 *
 * CANCELLATION SYSTEM ENHANCEMENT:
 * - Removed duplicate confirmation windows
 * - Added linked items checking before cancellation
 * - Fixed API method from PUT to POST for cancellation
 * - Clear success notifications after cancellation
 *
 * SERVER INTEGRATION FIXES:
 * - Complete server restart with cleanup
 * - Database lock file resolution (WAL/SHM)
 * - Automatic package installation
 * - Comprehensive health checks
 *
 * SORTING FIX (August 24, 2025):
 * =============================
 *
 * ISSUE: RangeError: Maximum call stack size exceeded when clicking sort headers
 * - Function was calling window.sortTable instead of window.sortTableData
 * - This caused infinite recursion and browser crash
 *
 * FIX APPLIED:
 * - Changed window.sortTable to window.sortTableData in sortTable function
 * - Updated function parameters to match global sorting system
 * - Fixed function signature: (columnIndex, data, tableType, updateFunction)
 *
 * LINKED ITEMS INTEGRATION:
 * - Added "Show Linked Details" button to each row
 * - Integrated with linked-items.js for modal functionality
 * - Uses viewLinkedItemsForTradePlan() wrapper function
 *
 * File contents:
 * - Loading planning data from server
 * - Displaying planning table with sorting and filters
 * - Adding new planning with comprehensive validation
 * - Editing existing planning with real-time validation
 * - Cancelling planning with linked items checking
 * - Deleting planning with confirmation
 * - Managing statuses and states
 * - Using global notification system
 * - "Show Linked Details" functionality
 *
 * Dependencies:
 * - table-mappings.js (for column mappings and sorting)
 * - main.js (for global sorting functions)
 * - translation-utils.js (for status translations)
 * - linked-items.js (for linked items modal)
 * - validation-utils.js (for validation functions)
 * - notification-system.js (for notification system)
 *
 * Table Mapping:
 * - Uses 'planning' table type from table-mappings.js
 * - Column mappings are centralized in table-mappings.js
 * - Sorting uses global window.sortTableData() function
 *
 * Notification system:
 * - All user messages use the global notification system
 * - showSuccessNotification() - Success messages
 * - showErrorNotification() - Error messages
 * - showWarningNotification() - Warning messages
 *
 * Author: Tik.track Development Team
 * Last update date: 2025-08-31
 * Status: ✅ Complete - Round B
 * @sortingFix August 24, 2025 - Fixed infinite recursion in sorting
 * @validationFix August 31, 2025 - Fixed validation system integration
 * @tickerChangeFix August 31, 2025 - Added ticker change confirmation
 * @cancellationFix August 31, 2025 - Enhanced cancellation system
 * @serverFix August 31, 2025 - Fixed server integration issues
 * ========================================
 */

// Global variables
window.tradePlansData = [];
window.tradePlansLoaded = false;
let tradePlanDefaultPercentsCache = null;
let tradePlanDefaultPercentsPromise = null;

// ===== CRUD Modal Functions =====

/**
 * פתיחת מודל הוספת תכנון חדש
 */
// ===== FORM MANAGEMENT FUNCTIONS =====
// Form field enabling/disabling and validation

/**
 * Enable form fields for trade plan creation
 * Activates all form fields after ticker selection
 * 
 * @function enableFormFields
 * @returns {void}
 */
function enableFormFields() {
  try {
    const formFields = [
      'type', 'side', 'quantity', 'price', 'notes'
    ];
    
    formFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false;
        field.classList.remove('disabled');
      }
    });
  } catch (error) {
    window.Logger.error('שגיאה בהפעלת שדות טופס:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלת שדות טופס', error.message);
    }
  }
}

/**
 * Disable form fields for trade plan creation
 * @returns {void}
 */
function disableFormFields() {
  try {
    const formFields = [
      'type', 'side', 'quantity', 'price', 'notes'
    ];
    
    formFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        field.classList.add('disabled');
      }
    });
  } catch (error) {
    window.Logger.error('שגיאה בהשבתת שדות טופס:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהשבתת שדות טופס', error.message);
    }
  }
}

/**
 * Enable edit form fields wrapper
 * @returns {void}
 */
function enableEditFieldsWrapper() {
  try {
    const formFields = [
      'editType', 'editSide', 'editQuantity', 'editPrice', 'editNotes'
    ];
    
    formFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = false;
        field.classList.remove('disabled');
      }
    });
  } catch (error) {
    window.Logger.error('שגיאה בהפעלת שדות עריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלת שדות עריכה', error.message);
    }
  }
}

/**
 * Disable edit form fields
 * @returns {void}
 */
function disableEditFields() {
  try {
    const formFields = [
      'editType', 'editSide', 'editQuantity', 'editPrice', 'editNotes'
    ];
    
    formFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.disabled = true;
        field.classList.add('disabled');
      }
    });
  } catch (error) {
    window.Logger.error('שגיאה בהשבתת שדות עריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהשבתת שדות עריכה', error.message);
    }
  }
}

// REMOVED: loadTickerInfo, displayTickerInfo, updateFormFieldsWithTickerData - not used, use loadTradePlanTickerInfo/displayTradePlanTickerInfo instead
// Ticker info functions
async function _REMOVED_loadTickerInfo(tickerId) {
  try {
    window.Logger.info('🔄 Loading ticker info for ID:', tickerId, { page: "trade_plans" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => t.id == tickerId);
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayTickerInfo(ticker);
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker info:', error, { page: "trade_plans" });
    // Fallback to mock data for demonstration
    displayTickerInfo({
      symbol: 'AAPL',
      current_price: 150.25,
      daily_change: 2.35,
      daily_change_percent: 1.58,
      volume: 45678900
    });
  }
}

/**
 * טעינת מידע על הטיקר (למודל החדש)
 */
async function loadTradePlanTickerInfo(tickerId) {
  try {
    window.Logger.info('🔄 Loading ticker info for ID:', tickerId, { page: "trade_plans" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => t.id == tickerId);
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayTradePlanTickerInfo(ticker);
    
  } catch (error) {
    window.Logger.error('❌ Error loading ticker info:', error, { page: "trade_plans" });
  }
}

async function _REMOVED_displayTickerInfo(ticker) {
  const tickerInfo = document.getElementById('tickerInfo');
  const tickerPrice = document.getElementById('tickerPrice');
  const tickerChange = document.getElementById('tickerChange');
  const tickerVolume = document.getElementById('tickerVolume');
  
  if (tickerInfo && tickerPrice && tickerChange && tickerVolume) {
    // Format price
    const currentPrice = parseFloat(ticker.current_price || 0);
    tickerPrice.textContent = `$${currentPrice.toFixed(2)}`;
    
    // Format change with color
    const change = parseFloat(ticker.daily_change || 0);
    const changePercent = parseFloat(ticker.daily_change_percent || 0);
    const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
    tickerChange.textContent = changeText;
    tickerChange.style.color = change >= 0 ? '#28a745' : '#dc3545';
    
    // Format volume
    const volume = parseInt(ticker.volume || 0);
    tickerVolume.textContent = volume.toLocaleString();
    
    // Show ticker info
    tickerInfo.style.display = 'block';
    
    // Update form fields with calculated values
    await updateFormFieldsWithTickerData(ticker, currentPrice);
  }
}

/**
 * הצגת מידע על הטיקר (למודל החדש)
 */
function displayTradePlanTickerInfo(ticker) {
  // Create or update ticker info display
  let tickerInfoDiv = document.getElementById('tradePlanTickerInfo');
  if (!tickerInfoDiv) {
    // Create a new row for ticker info spanning full width
    const tickerInfoRow = document.createElement('div');
    tickerInfoRow.className = 'row';
    tickerInfoRow.id = 'tradePlanTickerInfoRow';
    
    // Create column for ticker info - full width
    const tickerInfoCol = document.createElement('div');
    tickerInfoCol.className = 'col-12';
    
    tickerInfoDiv = document.createElement('div');
    tickerInfoDiv.id = 'tradePlanTickerInfo';
    tickerInfoDiv.className = 'mb-3 p-3 bg-light rounded';
    
    tickerInfoCol.appendChild(tickerInfoDiv);
    tickerInfoRow.appendChild(tickerInfoCol);
    
    // Insert after the ticker/account row
    const tickerSelect = document.getElementById('tradePlanTicker');
    if (tickerSelect) {
      const tickerField = tickerSelect.closest('.mb-3');
      if (tickerField && tickerField.parentNode) {
        // Find the row containing the ticker field
        const row = tickerField.closest('.row');
        if (row && row.parentNode) {
          row.parentNode.insertBefore(tickerInfoRow, row.nextSibling);
        }
      }
    }
  }
  
  // Use the new global renderTickerInfo function
  if (window.renderTickerInfo) {
    tickerInfoDiv.innerHTML = window.renderTickerInfo(ticker, 'ticker-info-display');
  } else {
    // Fallback if renderTickerInfo not available
    tickerInfoDiv.innerHTML = `
      <div class="ticker-info-display">
        <div class="row">
          <div class="col-md-6">
            <strong>${ticker.symbol || 'N/A'}</strong> - ${ticker.name || 'N/A'}
          </div>
          <div class="col-md-6 text-end">
            <span class="fw-bold">$${(ticker.current_price || 0).toFixed(2)}</span>
            <span class="${(ticker.daily_change || 0) >= 0 ? 'text-success' : 'text-danger'}">
              ${(ticker.daily_change || 0) >= 0 ? '↗' : '↘'} ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)
            </span>
          </div>
        </div>
        <div class="row mt-1">
          <div class="col-12">
            <small class="text-muted">
              נפח: ${(ticker.volume || 0).toLocaleString()} | 
              שינוי יומי: ${(ticker.daily_change || 0).toFixed(2)} (${(ticker.daily_change_percent || 0).toFixed(2)}%)
            </small>
          </div>
        </div>
      </div>
    `;
  }
  
  // Set default entry price to current price if field exists
  const entryPriceField = document.getElementById('tradePlanEntryPrice');
  if (entryPriceField && ticker.current_price) {
    entryPriceField.value = ticker.current_price;
  }

  if (typeof window.updateSharesFromAmount === 'function') {
    window.updateSharesFromAmount();
  }
  if (typeof window.updateAmountFromShares === 'function') {
    window.updateAmountFromShares();
  }
  if (typeof window.applyTradePlanDefaultRiskLevels === 'function') {
    const tradePlansModalElement = document.getElementById('tradePlansModal');
    const riskPromise = window.applyTradePlanDefaultRiskLevels({ force: false, modalElement: tradePlansModalElement });
    if (riskPromise && typeof riskPromise.catch === 'function') {
      riskPromise.catch(error => {
        window.Logger?.warn('⚠️ applyTradePlanDefaultRiskLevels failed', { error, page: 'trade_plans' });
      });
    }
  }
}

// ===== UI MANAGEMENT FUNCTIONS =====
// UI interactions, ticker info display, and form calculations

/**
 * Hide ticker information display
 * Removes ticker info from add modal
 * 
 * @function hideTickerInfo
 * @returns {void}
 */
function hideTickerInfo() {
  try {
    const tickerInfo = document.getElementById('tickerInfo');
    if (tickerInfo) {
      tickerInfo.style.display = 'none';
    }
  } catch (error) {
    window.Logger.error('שגיאה בהסתרת מידע טיקר:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהסתרת מידע טיקר', error.message);
    }
  }
}

/**
 * Update ticker info in add modal
 * Updates display elements and form fields when ticker is selected in add modal
 */
async function updateTickerInfo() {
  try {
    const tickerSelect = document.getElementById('ticker');
    const tickerDisplay = document.getElementById('selectedTickerDisplay');
    const priceDisplay = document.getElementById('currentPriceDisplay');
    const changeDisplay = document.getElementById('dailyChangeDisplay');
    const tickerId = tickerSelect ? tickerSelect.value : null;

    if (!tickerId) {
      if (tickerDisplay) tickerDisplay.textContent = 'לא נבחר';
      if (priceDisplay) priceDisplay.textContent = '-';
      if (changeDisplay) {
        changeDisplay.textContent = '-';
        changeDisplay.style.color = '#6c757d';
      }
      // Hide ticker info section
      hideTickerInfo();
      return;
    }

    // Load ticker data
    await loadTickerInfo(tickerId);

  } catch (error) {
    window.Logger.error('שגיאה בעדכון מידע טיקר:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון מידע טיקר', error.message);
    }
  }
}

/**
 * Update shares from planned amount in add modal
 * Calculates number of shares based on planned amount and current price
 * 
 * @function updateSharesFromAmount
 * @returns {void}
 */
function updateSharesFromAmount() {
  try {
    if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.updateFromAmount === 'function') {
      const tradePlansModal = document.getElementById('tradePlansModal');
      const tradesModal = document.getElementById('tradesModal');
      if (tradePlansModal) {
        window.InvestmentCalculationService.updateFromAmount(tradePlansModal);
      }
      if (tradesModal) {
        window.InvestmentCalculationService.updateFromAmount(tradesModal);
      }
    }
  } catch (error) {
    window.Logger?.error('שגיאה בעדכון מניות מסכום:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון מניות מסכום', error.message);
    }
  }
}

/**
 * Update amount from shares in add modal
 * Calculates planned amount based on number of shares and current price
 * 
 * @function updateAmountFromShares
 * @returns {void}
 */
function updateAmountFromShares() {
  try {
    if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.updateFromQuantity === 'function') {
      const tradePlansModal = document.getElementById('tradePlansModal');
      const tradesModal = document.getElementById('tradesModal');
      if (tradePlansModal) {
        window.InvestmentCalculationService.updateFromQuantity(tradePlansModal);
      }
      if (tradesModal) {
        window.InvestmentCalculationService.updateFromQuantity(tradesModal);
      }
    }
  } catch (error) {
    window.Logger?.error('שגיאה בעדכון סכום ממניות:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון סכום ממניות', error.message);
    }
  }
}

/**
 * Update form fields with calculated values based on ticker data and user preferences
 */
async function _REMOVED_updateFormFieldsWithTickerData(ticker, currentPrice) {
  try {
    window.Logger.info('🔄 Updating form fields with ticker data:', ticker.symbol, 'Price:', currentPrice, { page: "trade_plans" });
    
    // Get user preferences for default percentages
    let defaultStopLoss = 2.5; // Default fallback
    let defaultTargetPrice = 5.0; // Default fallback
    
    try {
      if (typeof window.getPreference === 'function') {
        const stopLossPref = await window.getPreference('defaultStopLoss');
        const targetPricePref = await window.getPreference('defaultTargetPrice');
        
        if (stopLossPref !== null && stopLossPref !== undefined) {
          defaultStopLoss = parseFloat(stopLossPref);
        }
        if (targetPricePref !== null && targetPricePref !== undefined) {
          defaultTargetPrice = parseFloat(targetPricePref);
        }
        
        window.Logger.info('✅ User preferences loaded:', { defaultStopLoss, defaultTargetPrice }, { page: "trade_plans" });
      }
    } catch (error) {
      window.Logger.warn('⚠️ Could not load user preferences, using defaults:', error, { page: "trade_plans" });
    }
    
    // Update entry price (current price)
    const priceInput = document.getElementById('price');
    if (priceInput) {
      priceInput.value = currentPrice.toFixed(2);
      window.Logger.info('✅ Updated entry price:', currentPrice.toFixed(2, { page: "trade_plans" }));
    }
    
    // Calculate and update target price and percentage based on side
    const targetPriceInput = document.getElementById('targetPrice');
    const targetPercentageInput = document.getElementById('targetPercentage');
    const sideInput = document.getElementById('side');
    if (targetPriceInput && targetPercentageInput && sideInput) {
      const side = sideInput.value || 'Long';
      let targetPrice;
      if (side === 'Short') {
        // For Short: target price should be lower than entry price
        targetPrice = currentPrice * (1 - defaultTargetPrice / 100);
        window.Logger.info('✅ Updated target price (Short, { page: "trade_plans" }):', targetPrice.toFixed(2), `(${defaultTargetPrice}% below entry)`);
      } else {
        // For Long: target price should be higher than entry price
        targetPrice = currentPrice * (1 + defaultTargetPrice / 100);
        window.Logger.info('✅ Updated target price (Long, { page: "trade_plans" }):', targetPrice.toFixed(2), `(${defaultTargetPrice}% above entry)`);
      }
      targetPriceInput.value = targetPrice.toFixed(2);
      targetPercentageInput.value = defaultTargetPrice.toFixed(2);
    }
    
    // Calculate and update stop loss price and percentage based on side
    const stopPriceInput = document.getElementById('stopPrice');
    const stopPercentageInput = document.getElementById('stopPercentage');
    if (stopPriceInput && stopPercentageInput && sideInput) {
      const side = sideInput.value || 'Long';
      let stopPrice;
      if (side === 'Short') {
        // For Short: stop price should be higher than entry price (stop loss)
        stopPrice = currentPrice * (1 + defaultStopLoss / 100);
        window.Logger.info('✅ Updated stop price (Short, { page: "trade_plans" }):', stopPrice.toFixed(2), `(${defaultStopLoss}% above entry)`);
      } else {
        // For Long: stop price should be lower than entry price (stop loss)
        stopPrice = currentPrice * (1 - defaultStopLoss / 100);
        window.Logger.info('✅ Updated stop price (Long, { page: "trade_plans" }):', stopPrice.toFixed(2), `(${defaultStopLoss}% below entry)`);
      }
      stopPriceInput.value = stopPrice.toFixed(2);
      stopPercentageInput.value = defaultStopLoss.toFixed(2);
    }
    
  } catch (error) {
    window.Logger.error('❌ Error updating form fields with ticker data:', error, { page: "trade_plans" });
  }
}

// REMOVED: loadEditTickerInfo, displayEditTickerInfo, updateEditFormFieldsWithTickerData - not used
// Edit modal ticker info functions
async function _REMOVED_loadEditTickerInfo(tickerId) {
  try {
    window.Logger.info('🔄 Loading edit ticker info for ID:', tickerId, { page: "trade_plans" });
    
    // Get ticker data from API
    const response = await fetch(`/api/tickers/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const tickers = data.data || data;
    
    // Find the specific ticker
    const ticker = tickers.find(t => t.id == tickerId);
    if (!ticker) {
      throw new Error('Ticker not found');
    }
    
    // Display ticker info
    displayEditTickerInfo(ticker);
    
  } catch (error) {
    window.Logger.error('❌ Error loading edit ticker info:', error, { page: "trade_plans" });
    // Fallback to mock data for demonstration
    displayEditTickerInfo({
      symbol: 'AAPL',
      current_price: 150.25,
      daily_change: 2.35,
      daily_change_percent: 1.58,
      volume: 45678900
    });
  }
}

async function _REMOVED_displayEditTickerInfo(ticker) {
  const tickerInfo = document.getElementById('editTickerInfo');
  const tickerPrice = document.getElementById('editTickerPrice');
  const tickerChange = document.getElementById('editTickerChange');
  const tickerVolume = document.getElementById('editTickerVolume');
  
  if (tickerInfo && tickerPrice && tickerChange && tickerVolume) {
    // Format price
    const currentPrice = parseFloat(ticker.current_price || 0);
    tickerPrice.textContent = `$${currentPrice.toFixed(2)}`;
    
    // Format change with color
    const change = parseFloat(ticker.daily_change || 0);
    const changePercent = parseFloat(ticker.daily_change_percent || 0);
    const changeText = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
    tickerChange.textContent = changeText;
    tickerChange.style.color = change >= 0 ? '#28a745' : '#dc3545';
    
    // Format volume
    const volume = parseInt(ticker.volume || 0);
    tickerVolume.textContent = volume.toLocaleString();
    
    // Show ticker info
    tickerInfo.style.display = 'block';
    
    // Update edit form fields with calculated values
    await updateEditFormFieldsWithTickerData(ticker, currentPrice);
  }
}

/**
 * Hide edit ticker information section
 * @returns {void}
 */
function hideEditTickerInfo() {
  try {
    const tickerInfo = document.getElementById('editTickerInfo');
    if (tickerInfo) {
      tickerInfo.style.display = 'none';
    }
  } catch (error) {
    window.Logger.error('שגיאה בהסתרת מידע טיקר בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהסתרת מידע טיקר בעריכה', error.message);
    }
  }
}

/**
 * Update edit form fields with calculated values based on ticker data and user preferences
 */
async function _REMOVED_updateEditFormFieldsWithTickerData(ticker, currentPrice) {
  try {
    window.Logger.info('🔄 Updating edit form fields with ticker data:', ticker.symbol, 'Price:', currentPrice, { page: "trade_plans" });
    
    // Get user preferences for default percentages
    let defaultStopLoss = 2.5; // Default fallback
    let defaultTargetPrice = 5.0; // Default fallback
    
    try {
      if (typeof window.getPreference === 'function') {
        const stopLossPref = await window.getPreference('defaultStopLoss');
        const targetPricePref = await window.getPreference('defaultTargetPrice');
        
        if (stopLossPref !== null && stopLossPref !== undefined) {
          defaultStopLoss = parseFloat(stopLossPref);
        }
        if (targetPricePref !== null && targetPricePref !== undefined) {
          defaultTargetPrice = parseFloat(targetPricePref);
        }
        
        window.Logger.info('✅ User preferences loaded for edit:', { defaultStopLoss, defaultTargetPrice }, { page: "trade_plans" });
      }
    } catch (error) {
      window.Logger.warn('⚠️ Could not load user preferences for edit, using defaults:', error, { page: "trade_plans" });
    }
    
    // Update entry price (current price) - only if field is empty
    const editPriceInput = document.getElementById('editPrice');
    if (editPriceInput && (!editPriceInput.value || editPriceInput.value === '')) {
      editPriceInput.value = currentPrice.toFixed(2);
      window.Logger.info('✅ Updated edit entry price:', currentPrice.toFixed(2, { page: "trade_plans" }));
    }
    
    // Calculate and update target price and percentage based on side - only if fields are empty
    const editTargetPriceInput = document.getElementById('editTargetPrice');
    const editTargetPercentageInput = document.getElementById('editTargetPercentage');
    const editSideInput = document.getElementById('editSide');
    if (editTargetPriceInput && editTargetPercentageInput && editSideInput && 
        (!editTargetPriceInput.value || editTargetPriceInput.value === '') &&
        (!editTargetPercentageInput.value || editTargetPercentageInput.value === '')) {
      const side = editSideInput.value || 'Long';
      let targetPrice;
      if (side === 'Short') {
        // For Short: target price should be lower than entry price
        targetPrice = currentPrice * (1 - defaultTargetPrice / 100);
        window.Logger.info('✅ Updated edit target price (Short, { page: "trade_plans" }):', targetPrice.toFixed(2), `(${defaultTargetPrice}% below entry)`);
      } else {
        // For Long: target price should be higher than entry price
        targetPrice = currentPrice * (1 + defaultTargetPrice / 100);
        window.Logger.info('✅ Updated edit target price (Long, { page: "trade_plans" }):', targetPrice.toFixed(2), `(${defaultTargetPrice}% above entry)`);
      }
      editTargetPriceInput.value = targetPrice.toFixed(2);
      editTargetPercentageInput.value = defaultTargetPrice.toFixed(2);
    }
    
    // Calculate and update stop loss price and percentage based on side - only if fields are empty
    const editStopPriceInput = document.getElementById('editStopPrice');
    const editStopPercentageInput = document.getElementById('editStopPercentage');
    if (editStopPriceInput && editStopPercentageInput && editSideInput && 
        (!editStopPriceInput.value || editStopPriceInput.value === '') &&
        (!editStopPercentageInput.value || editStopPercentageInput.value === '')) {
      const side = editSideInput.value || 'Long';
      let stopPrice;
      if (side === 'Short') {
        // For Short: stop price should be higher than entry price (stop loss)
        stopPrice = currentPrice * (1 + defaultStopLoss / 100);
        window.Logger.info('✅ Updated edit stop price (Short, { page: "trade_plans" }):', stopPrice.toFixed(2), `(${defaultStopLoss}% above entry)`);
      } else {
        // For Long: stop price should be lower than entry price (stop loss)
        stopPrice = currentPrice * (1 - defaultStopLoss / 100);
        window.Logger.info('✅ Updated edit stop price (Long, { page: "trade_plans" }):', stopPrice.toFixed(2), `(${defaultStopLoss}% below entry)`);
      }
      editStopPriceInput.value = stopPrice.toFixed(2);
      editStopPercentageInput.value = defaultStopLoss.toFixed(2);
    }
    
  } catch (error) {
    window.Logger.error('❌ Error updating edit form fields with ticker data:', error, { page: "trade_plans" });
  }
}

// Function removed - using showAddTradePlanModal() instead for consistency

/**
 * פתיחת מודל עריכת תכנון קיים
 */

/**
 * עדכון מידע על הטיקר במודל העריכה
 */
async function updateEditTickerInfo() {
  const tickerId = document.getElementById('editTradePlanTickerId').value;
  const tickerDisplay = document.getElementById('editSelectedTickerDisplay');
  const priceDisplay = document.getElementById('editCurrentPriceDisplay');
  const changeDisplay = document.getElementById('editDailyChangeDisplay');
  const tradePlanId = document.getElementById('editTradePlanId').value;

  if (!tickerId) {
    tickerDisplay.textContent = 'לא נבחר';
    priceDisplay.textContent = '-';
    changeDisplay.textContent = '-';
    return;
  }

  // בדיקה אם הטיקר השתנה (רק אם יש תכנון נבחר)
  if (tradePlanId) {
    const originalTradePlan = window.tradePlansData.find(tp => tp.id === tradePlanId);
    if (originalTradePlan && originalTradePlan.ticker_id !== tickerId) {
      // Ticker changed from original to new

      // הצגת הודעת אישור לשינוי טיקר
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'שינוי טיקר לתכנון',
          'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?\n\nפעולה זו תשנה את הטיקר המקורי של התכנון.',
          () => {
            // המשתמש אישר - הצגת הודעה שהפיצ'ר לא נתמך
            if (typeof window.showWarningNotification === 'function') {
              window.showWarningNotification(
                'פיצ\'ר לא נתמך',
                'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.',
              );
            }
            // החזרת הטיקר למצבו המקורי
            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
            // עדכון התצוגה עם הטיקר המקורי
            updateEditTickerInfo();
            return;
          },
          () => {
            // המשתמש ביטל - מחזירים את הטיקר המקורי
            document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
            // עדכון התצוגה עם הטיקר המקורי
            updateEditTickerInfo();
            return;
          },
        );
      } else {
        // Fallback למקרה שהפונקציה לא זמינה
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'שינוי טיקר לתכנון',
            'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?',
            () => {
              if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification(
                  'פיצ\'ר לא נתמך',
                  'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.',
                );
              }
              document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
              updateEditTickerInfo();
            },
            () => {
              document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
              updateEditTickerInfo();
            },
          );
        } else {
          if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
              'שינוי טיקר לתכנון',
              'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?',
              () => {
                if (typeof window.showWarningNotification === 'function') {
                  window.showWarningNotification(
                    'פיצ\'ר לא נתמך',
                    'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.',
                  );
                }
                document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                updateEditTickerInfo();
              },
              () => {
                document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
                updateEditTickerInfo();
              },
            );
          } else {
            // Fallback למקרה שמערכת התראות לא זמינה
            const confirmed = typeof showConfirmationDialog === 'function' ? 
              await new Promise(resolve => {
                showConfirmationDialog(
                  'האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?',
                  () => resolve(true),
                  () => resolve(false),
                  'שינוי טיקר',
                  'שנה',
                  'ביטול'
                );
              }) : 
              window.confirm('האם אתה בטוח שברצונך לשנות את הטיקר של התכנון?');
            if (confirmed) {
              if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification(
                  'פיצ\'ר לא נתמך',
                  'שינוי טיקר לתכנון לא נתמך עדיין. הטיקר יוחזר למצבו המקורי.',
                );
              }
              document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
              updateEditTickerInfo();
            } else {
              document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
              updateEditTickerInfo();
            }
          }
        }
      }
    }
  }

  // מציאת הטיקר בנתונים
  let ticker = null;
  if (typeof window.tickerService?.getTickers === 'function') {
    try {
      const tickers = await window.tickerService.getTickers();
      ticker = tickers.find(t => t.id === tickerId);
    } catch {
      // window.Logger.warn('Error getting tickers from service:', error, { page: "trade_plans" });
    }
  }

  if (!ticker && window.tickersData) {
    ticker = window.tickersData.find(t => t.id === tickerId);
  }

  if (ticker) {
    tickerDisplay.textContent = ticker.symbol;

    // טיפול במחיר
    let displayPrice = ticker.current_price;
    if (!displayPrice || displayPrice === 0 || displayPrice === null) {
      // מחיר ברירת מחדל לפי סוג הטיקר
      switch (ticker.symbol) {
      case 'MSFT': displayPrice = 350.00; break;
      case 'AAPL': displayPrice = 180.00; break;
      case 'GOOGL': displayPrice = 140.00; break;
      case 'TSLA': displayPrice = 250.00; break;
      case 'SPY': displayPrice = 450.00; break;
      default: displayPrice = 100.00;
      }

      // הצגת הודעת אזהרה
      if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification(
          'מחיר לא זמין',
          `המחיר הנוכחי של ${ticker.symbol} לא זמין. משתמש במחיר ברירת מחדל לצורך החישובים.`,
        );
      }
    }

    priceDisplay.textContent = `$${displayPrice.toFixed(2)}`;

    const change = ticker.daily_change || 0;
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeSign = change >= 0 ? '+' : '';
    changeDisplay.textContent = `${changeSign}${change}%`;
    changeDisplay.className = `form-control-plaintext ${changeClass}`;
  } else {
    tickerDisplay.textContent = 'לא נמצא';
    priceDisplay.textContent = '-';
    changeDisplay.textContent = '-';
  }
}


// ===== EDIT FORM FUNCTIONS =====
// Edit modal form management and calculations

/**
 * Update shares from planned amount in edit modal
 * Calculates number of shares based on planned amount and current price
 * 
 * @function updateEditSharesFromAmount
 * @returns {void}
 */
function updateEditSharesFromAmount() {
  try {
    const amountInput = document.getElementById('editTradePlanPlannedAmount');
    const sharesInput = document.getElementById('editTradePlanShares');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');

    if (!amountInput || !sharesInput || !priceDisplay) {return;}

  const amount = parseFloat(amountInput.value) || 0;
  const priceText = priceDisplay.textContent;
  const price = parseFloat(priceText.replace('$', '')) || 0;

  if (price > 0) {
    const result = convertAmountToShares(amount, price);
    sharesInput.value = result.shares;
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון מניות מסכום בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון מניות מסכום בעריכה', error.message);
    }
  }
}

/**
 * עדכון סכום מתוכנן ממספר מניות במודל העריכה
 */
function updateEditAmountFromShares() {
  try {
    const amountInput = document.getElementById('editTradePlanPlannedAmount');
    const sharesInput = document.getElementById('editTradePlanShares');
    const priceDisplay = document.getElementById('editCurrentPriceDisplay');

    if (!amountInput || !sharesInput || !priceDisplay) {return;}

  const shares = parseFloat(sharesInput.value) || 0;
  const priceText = priceDisplay.textContent;
  const price = parseFloat(priceText.replace('$', '')) || 0;

  if (price > 0) {
    const amount = convertSharesToAmount(shares, price);
    amountInput.value = amount;
  }
  
  } catch (error) {
    window.Logger.error('שגיאה בעדכון סכום ממניות בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון סכום ממניות בעריכה', error.message);
    }
  }
}

// REMOVED: saveEditTradePlan - deprecated wrapper, use saveTradePlanData('edit') directly
/**
 * שמירת עריכת תכנון
 */
async function _REMOVED_saveEditTradePlan() {
  try {
    // שימוש ב-DataCollectionService לאיסוף נתונים
    const tradePlanData = DataCollectionService.collectFormData({
      id: { id: 'editTradePlanId', type: 'int' },
      ticker_id: { id: 'editTicker', type: 'int' },
      investment_type: { id: 'editType', type: 'text' },
      side: { id: 'editSide', type: 'text' },
      planned_amount: { id: 'editQuantity', type: 'number' },
      stop_price: { id: 'editPrice', type: 'number' },
      target_price: { id: 'editPrice', type: 'number' },
      entry_conditions: { id: 'editNotes', type: 'text' },
      reasons: { id: 'editNotes', type: 'text' }
    });

    const formData = {
      ...tradePlanData,
      status: 'open' // Default status
    };

    // בדיקה אם הסטטוס משתנה ל-'cancelled'
    const originalTradePlan = window.tradePlansData.find(tp => tp.id === formData.id);
    const isStatusChangingToCancelled = originalTradePlan &&
                                           originalTradePlan.status !== 'cancelled' &&
                                           formData.status === 'cancelled';

    if (isStatusChangingToCancelled) {
      // בדיקת פריטים מקושרים לפני הביטול
      await checkLinkedItemsBeforeCancel(formData.id);
      return; // לא ממשיכים עם העדכון אם יש פריטים מקושרים
    }

    // בדיקה אם הטיקר השתנה
    const isTickerChanging = originalTradePlan &&
                                originalTradePlan.ticker_id !== formData.ticker_id;

    if (isTickerChanging) {
      // שינוי טיקר לא נתמך - הצגת הודעה ודחיית השינוי
      // Ticker change detected - feature not supported
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(
          'פיצ\'ר לא נתמך',
          'שינוי טיקר לתכנון לא נתמך עדיין. השינוי נדחה.',
        );
      } else if (typeof window.showNotification === 'function') {
        window.showNotification('שינוי טיקר לתכנון לא נתמך עדיין', 'error');
      }

      // החזרת הטיקר למצבו המקורי
      document.getElementById('editTradePlanTickerId').value = originalTradePlan.ticker_id;
      return; // לא ממשיכים עם העדכון
    }

    // שליחה לשרת
    const response = await fetch(`/api/trade_plans/${formData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleUpdateResponse(response, {
      modalId: 'editTradePlanModal',
      successMessage: 'תכנון עודכן בהצלחה!',
      apiUrl: '/api/trade_plans/',
      entityName: 'תכנון',
      reloadFn: window.loadTradePlansData,
      requiresHardReload: false
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'עדכון תכנון');
  }
}


// Function removed - not used anywhere

/**
 * בדיקת פריטים מקושרים לפני ביטול תכנון
 * @deprecated Use window.checkLinkedItemsBeforeAction('trade_plan', tradePlanId, 'cancel') instead
 */
async function checkLinkedItemsBeforeCancel(tradePlanId) {
  return await window.checkLinkedItemsBeforeAction('trade_plan', tradePlanId, 'cancel');
}

/**
 * הפעלה מחדש של תכנון מבוטל
 */
async function reactivateTradePlan(tradePlanId) {
  try {

    // מציאת התכנון בנתונים
    const tradePlan = window.tradePlansData.find(tp => tp.id === tradePlanId);
    if (!tradePlan) {
      handleElementNotFound('trade plan', 'CRITICAL');
      throw new Error('תכנון לא נמצא');
    }

    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${tradePlanId}`, {
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


    // עדכון סטטוס הטיקר
    if (tradePlan.ticker_id) {
      // קריאה לשירות המאוחד
      if (window.tickerService && window.tickerService.updateTickerActiveTradesStatus) {
        await window.tickerService.updateTickerActiveTradesStatus(tradePlan.ticker_id);
      } else if (typeof window.updateTickerActiveTradesStatus === 'function') {
        // fallback לפונקציה המקורית אם השירות לא זמין
        await window.updateTickerActiveTradesStatus(tradePlan.ticker_id);
      } else {
        // window.Logger.warn('⚠️ updateTickerActiveTradesStatus function not available', { page: "trade_plans" });
      }
    }

    // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('תכנון הופעל מחדש בהצלחה!');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('תכנון הופעל מחדש בהצלחה!', 'success');
    }

    // רענון הטבלה
    await loadTradePlansData();

  } catch (error) {
    handleSaveError(error, 'הפעלה מחדש של תכנון');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהפעלה מחדש', error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בהפעלה מחדש', 'error');
    }
  }
}


// ===== EDIT MODAL HELPER FUNCTIONS =====
// Helper functions for edit modal functionality

/**
 * Add condition to edit modal
 * Placeholder for future condition functionality
 * 
 * @function addEditCondition
 * @returns {void}
 */
function addEditCondition() {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת תנאי בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת תנאי בעריכה', error.message);
    }
  }
}

/**
 * Add edit reason functionality (placeholder)
 * @returns {void}
 */
function addEditReason() {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת סיבה בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת סיבה בעריכה', error.message);
    }
  }
}

/**
 * Add edit important note functionality (placeholder)
 * @returns {void}
 */
function addEditImportantNote() {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת הערה חשובה בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה חשובה בעריכה', error.message);
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
      window.showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת תזכורת בעריכה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת תזכורת בעריכה', error.message);
    }
  }
}

/**
 * Add important note functionality (placeholder for add modal)
 * @returns {void}
 */
function addImportantNote() {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת הערה חשובה:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת הערה חשובה', error.message);
    }
  }
}

/**
 * Add reminder functionality (placeholder for add modal)
 * @returns {void}
 */
function addReminder() {
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'info');
    }
  } catch (error) {
    window.Logger.error('שגיאה בהוספת תזכורת:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בהוספת תזכורת', error.message);
    }
  }
}

/**
 * פתיחת מודל ביטול תכנון
 */
function openCancelTradePlanModal(tradePlanId) {
  try {
    const tradePlan = window.tradePlansData.find(tp => tp.id === tradePlanId);
    if (!tradePlan) {
      handleElementNotFound('trade plan', 'CRITICAL');
      return;
    }

    // הצגת פרטי התכנון במודל הביטול
    document.getElementById('cancelTradePlanDetails').innerHTML = `
          <strong>טיקר:</strong> ${tradePlan.ticker?.symbol || 'לא מוגדר'}<br>
          <strong>סוג:</strong> ${tradePlan.investment_type || 'לא מוגדר'}<br>
          <strong>צד:</strong> ${tradePlan.side || 'לא מוגדר'}<br>
          <strong>סכום מתוכנן:</strong> $${tradePlan.planned_amount || '0.00'}
      `;

  document.getElementById('cancelTradePlanModal').setAttribute('data-trade-plan-id', tradePlanId);

  const modal = new bootstrap.Modal(document.getElementById('cancelTradePlanModal'));
  modal.show();
  
  } catch (error) {
    window.Logger.error('שגיאה בפתיחת מודל ביטול תכנון:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפתיחת מודל ביטול תכנון', error.message);
    }
  }
}

/**
 * ביטול תכנון מסחר
 * Uses global cancelItem function from ui-utils.js
 * @param {number} tradePlanId - Trade plan ID
 */
async function cancelTradePlan(tradePlanId) {
  try {
    // Use global cancelItem function if available
    if (typeof window.cancelItem === 'function') {
      const tradePlan = window.tradePlansData?.find(tp => tp.id === tradePlanId);
      const tradePlanName = tradePlan?.name || `תכנון ${tradePlanId}`;
      await window.cancelItem('trade_plan', tradePlanId, tradePlanName);
      // Reload data after cancellation
      if (typeof loadTradePlansData === 'function') {
        await loadTradePlansData();
      }
    } else {
      // Fallback to opening modal if global function not available
      openCancelTradePlanModal(tradePlanId);
    }
  } catch (error) {
    window.Logger.error('שגיאה בביטול תכנון:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בביטול תכנון', error.message);
    }
  }
}

// Using global deleteTradePlan function - no need for confirmDeleteTradePlan wrapper
// The deleteTradePlan function already handles confirmation via checkLinkedItemsBeforeAction

/**
 * View linked items for trade plan
 * Uses global viewLinkedItems function from linked-items.js
 * @param {number} tradePlanId - Trade plan ID
 */
function viewLinkedItemsForTradePlan(tradePlanId) {
  if (typeof window.viewLinkedItems === 'function') {
    return window.viewLinkedItems(tradePlanId, 'trade_plan');
  } else {
    window.Logger?.warn('viewLinkedItems global function not available', { page: "trade_plans" });
  }
}

/**
 * Helper function to update prices from percentages
 * Used by both setupPriceCalculation and setupEditPriceCalculation
 * @param {HTMLElement} priceInput - Price input element
 * @param {HTMLElement} sideInput - Side input element
 * @param {HTMLElement} stopPriceInput - Stop price input element
 * @param {HTMLElement} stopPercentageInput - Stop percentage input element
 * @param {HTMLElement} targetPriceInput - Target price input element
 * @param {HTMLElement} targetPercentageInput - Target percentage input element
 */
function updatePricesFromPercentages(
  priceInput, sideInput, stopPriceInput, stopPercentageInput, 
  targetPriceInput, targetPercentageInput
) {
  const currentPrice = parseFloat(priceInput.value) || 0;
  const side = sideInput.value || 'Long';
  
  if (currentPrice > 0 && stopPercentageInput && stopPriceInput) {
    const stopPercentage = parseFloat(stopPercentageInput.value) || 0;
    if (stopPercentage > 0 && typeof window.calculateStopPrice === 'function') {
      const stopPrice = window.calculateStopPrice(currentPrice, stopPercentage, side);
      stopPriceInput.value = stopPrice.toFixed(2);
    }
  }
  
  if (currentPrice > 0 && targetPercentageInput && targetPriceInput) {
    const targetPercentage = parseFloat(targetPercentageInput.value) || 0;
    if (targetPercentage > 0 && typeof window.calculateTargetPrice === 'function') {
      const targetPrice = window.calculateTargetPrice(currentPrice, targetPercentage, side);
      targetPriceInput.value = targetPrice.toFixed(2);
    }
  }
}

/**
 * Helper function to update percentages from prices
 * Used by both setupPriceCalculation and setupEditPriceCalculation
 * @param {HTMLElement} priceInput - Price input element
 * @param {HTMLElement} sideInput - Side input element
 * @param {HTMLElement} stopPriceInput - Stop price input element
 * @param {HTMLElement} stopPercentageInput - Stop percentage input element
 * @param {HTMLElement} targetPriceInput - Target price input element
 * @param {HTMLElement} targetPercentageInput - Target percentage input element
 */
function updatePercentagesFromPrices(
  priceInput, sideInput, stopPriceInput, stopPercentageInput, 
  targetPriceInput, targetPercentageInput
) {
  const currentPrice = parseFloat(priceInput.value) || 0;
  const side = sideInput.value || 'Long';
  
  if (currentPrice > 0 && stopPriceInput && stopPercentageInput) {
    const stopPrice = parseFloat(stopPriceInput.value) || 0;
    if (stopPrice > 0 && typeof window.calculatePercentageFromPrice === 'function') {
      const stopPercentage = window.calculatePercentageFromPrice(currentPrice, stopPrice, side);
      stopPercentageInput.value = stopPercentage.toFixed(2);
    }
  }
  
  if (currentPrice > 0 && targetPriceInput && targetPercentageInput) {
    const targetPrice = parseFloat(targetPriceInput.value) || 0;
    if (targetPrice > 0 && typeof window.calculatePercentageFromPrice === 'function') {
      const targetPercentage = window.calculatePercentageFromPrice(currentPrice, targetPrice, side);
      targetPercentageInput.value = targetPercentage.toFixed(2);
    }
  }
}

/**
 * Setup price calculation event listeners for add modal
 * Sets up automatic price/percentage calculations when form fields change
 */
function setupPriceCalculation() {
  try {
    // Get form elements
    const priceInput = document.getElementById('price');
    const sideInput = document.getElementById('side');
    const stopPriceInput = document.getElementById('stopPrice');
    const stopPercentageInput = document.getElementById('stopPercentage');
    const targetPriceInput = document.getElementById('targetPrice');
    const targetPercentageInput = document.getElementById('targetPercentage');

    if (!priceInput || !sideInput) {
      return; // Required fields not found
    }

    // Create bound functions using the shared helper functions
    const updatePrices = () => updatePricesFromPercentages(
      priceInput, sideInput, stopPriceInput, stopPercentageInput, 
      targetPriceInput, targetPercentageInput
    );
    const updatePercentages = () => updatePercentagesFromPrices(
      priceInput, sideInput, stopPriceInput, stopPercentageInput, 
      targetPriceInput, targetPercentageInput
    );

    // Remove existing listeners if any
    const newPriceInput = priceInput.cloneNode(true);
    priceInput.parentNode.replaceChild(newPriceInput, priceInput);
    
    // Setup event listeners
    if (newPriceInput && sideInput) {
      newPriceInput.addEventListener('input', updatePrices);
      sideInput.addEventListener('change', updatePrices);
    }
    
    if (stopPercentageInput) {
      stopPercentageInput.addEventListener('input', updatePrices);
    }
    
    if (targetPercentageInput) {
      targetPercentageInput.addEventListener('input', updatePrices);
    }
    
    if (stopPriceInput) {
      stopPriceInput.addEventListener('input', updatePercentages);
    }
    
    if (targetPriceInput) {
      targetPriceInput.addEventListener('input', updatePercentages);
    }
    
    window.Logger?.debug('Price calculation event listeners setup completed', { page: "trade_plans" });
  } catch (error) {
    window.Logger?.error('Error setting up price calculation:', error, { page: "trade_plans" });
  }
}

/**
 * Setup price calculation event listeners for edit modal
 * Sets up automatic price/percentage calculations when edit form fields change
 */
function setupEditPriceCalculation() {
  try {
    // Get edit form elements
    const priceInput = document.getElementById('editPrice');
    const sideInput = document.getElementById('editSide');
    const stopPriceInput = document.getElementById('editStopPrice');
    const stopPercentageInput = document.getElementById('editStopPercentage');
    const targetPriceInput = document.getElementById('editTargetPrice');
    const targetPercentageInput = document.getElementById('editTargetPercentage');

    if (!priceInput || !sideInput) {
      return; // Required fields not found
    }

    // Create bound functions using the shared helper functions
    const updatePrices = () => updatePricesFromPercentages(
      priceInput, sideInput, stopPriceInput, stopPercentageInput, 
      targetPriceInput, targetPercentageInput
    );
    const updatePercentages = () => updatePercentagesFromPrices(
      priceInput, sideInput, stopPriceInput, stopPercentageInput, 
      targetPriceInput, targetPercentageInput
    );

    // Remove existing listeners if any
    const newPriceInput = priceInput.cloneNode(true);
    priceInput.parentNode.replaceChild(newPriceInput, priceInput);
    
    // Setup event listeners
    if (newPriceInput && sideInput) {
      newPriceInput.addEventListener('input', updatePrices);
      sideInput.addEventListener('change', updatePrices);
    }
    
    if (stopPercentageInput) {
      stopPercentageInput.addEventListener('input', updatePrices);
    }
    
    if (targetPercentageInput) {
      targetPercentageInput.addEventListener('input', updatePrices);
    }
    
    if (stopPriceInput) {
      stopPriceInput.addEventListener('input', updatePercentages);
    }
    
    if (targetPriceInput) {
      targetPriceInput.addEventListener('input', updatePercentages);
    }
    
    window.Logger?.debug('Edit price calculation event listeners setup completed', { page: "trade_plans" });
  } catch (error) {
    window.Logger?.error('Error setting up edit price calculation:', error, { page: "trade_plans" });
  }
}

window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;
window.cancelTradePlan = cancelTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.performTradePlanDeletion = performTradePlanDeletion;
window.viewLinkedItemsForTradePlan = viewLinkedItemsForTradePlan;
window.reactivateTradePlan = reactivateTradePlan;
window.setupPriceCalculation = setupPriceCalculation;
window.setupEditPriceCalculation = setupEditPriceCalculation;

window.updateEditTickerInfo = updateEditTickerInfo;
window.updateEditSharesFromAmount = updateEditSharesFromAmount;
window.updateEditAmountFromShares = updateEditAmountFromShares;
window.addEditCondition = addEditCondition;
window.addEditReason = addEditReason;
window.addEditImportantNote = addEditImportantNote;
window.addEditReminder = addEditReminder;
window.applyTradePlanDefaultRiskLevels = applyTradePlanDefaultRiskLevels;

async function getTradePlanDefaultPercents() {
  if (tradePlanDefaultPercentsCache) {
    return tradePlanDefaultPercentsCache;
  }
  if (tradePlanDefaultPercentsPromise) {
    return tradePlanDefaultPercentsPromise;
  }

  const loadPromise = (async () => {
    let stopPercent = 2.5;
    let targetPercent = 5.0;

    const fetchPreference = async (key, fallback) => {
      try {
        if (typeof window.getUserPreference === 'function') {
          const value = await window.getUserPreference(key, fallback);
          return value;
        }
        if (typeof window.getPreference === 'function') {
          const value = await window.getPreference(key, fallback);
          return value;
        }
      } catch (error) {
        window.Logger?.warn(`⚠️ Failed to load preference ${key}`, { error, page: 'trade_plans' });
      }
      return fallback;
    };

    try {
      const [stopPref, targetPref] = await Promise.all([
        fetchPreference('defaultStopLoss', null),
        fetchPreference('defaultTargetPrice', null),
      ]);

      if (stopPref !== null && stopPref !== undefined && !Number.isNaN(parseFloat(stopPref))) {
        stopPercent = Math.abs(parseFloat(stopPref));
      }
      if (targetPref !== null && targetPref !== undefined && !Number.isNaN(parseFloat(targetPref))) {
        targetPercent = Math.abs(parseFloat(targetPref));
      }
    } catch (error) {
      window.Logger?.warn('⚠️ Error loading trade plan default percents', { error, page: 'trade_plans' });
    }

    return {
      stopPercent,
      targetPercent,
    };
  })();

  tradePlanDefaultPercentsPromise = loadPromise
    .then(result => {
      tradePlanDefaultPercentsCache = result;
      tradePlanDefaultPercentsPromise = null;
      return result;
    })
    .catch(error => {
      tradePlanDefaultPercentsPromise = null;
      throw error;
    });

  return tradePlanDefaultPercentsPromise;
}

async function applyTradePlanDefaultRiskLevels(options = {}) {
  if (!window.InvestmentCalculationService || typeof window.InvestmentCalculationService.applyDefaultRisk !== 'function') {
    return;
  }

  const modalElement = options.modalElement
    || document.querySelector('.modal.show#tradePlansModal')
    || document.querySelector('.modal.show#tradesModal')
    || document.getElementById('tradePlansModal')
    || document.getElementById('tradesModal');

  if (!modalElement) {
    return;
  }

  const promise = window.InvestmentCalculationService.applyDefaultRisk(modalElement, options);

  const entryDateInput = document.getElementById('tradePlanEntryDate')
    || document.getElementById('tradeEntryDate');
  if (entryDateInput && (!entryDateInput.dataset.userModified || options.force) && !entryDateInput.value) {
    let assignedValue = null;

    if (entryDateInput.type === 'date') {
      if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDate === 'function') {
        assignedValue = window.DefaultValueSetter.setCurrentDate(entryDateInput.id);
      }

      if (!assignedValue) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        assignedValue = today.toISOString().slice(0, 10);
      }

      entryDateInput.value = assignedValue;
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const isoString = now.toISOString();

      if (entryDateInput.type === 'datetime-local') {
        assignedValue = isoString.slice(0, 16);
      } else {
        assignedValue = isoString;
      }

      entryDateInput.value = assignedValue;
    }

    entryDateInput.dataset.systemGenerated = 'true';
    delete entryDateInput.dataset.userModified;
  }

  return promise;
}

/**
 * Helper to gather modal inputs used for amount/quantity calculations
 * @returns {{amountInput: HTMLInputElement|null, sharesInput: HTMLInputElement|null, priceInput: HTMLInputElement|null, priceDisplay: HTMLElement|null}}
 */
function getTradePlanModalElements() {
  const amountInput = document.getElementById('planAmount')
    || document.getElementById('plannedAmount')
    || document.getElementById('addTradePlanPlannedAmount')
    || document.getElementById('tradeTotalInvestment')
    || null;

  const sharesInput = document.getElementById('tradePlanQuantity')
    || document.getElementById('shares')
    || document.getElementById('addTradePlanShares')
    || document.getElementById('tradeQuantity')
    || null;

  const priceInput = document.getElementById('tradePlanEntryPrice')
    || document.getElementById('tradeEntryPrice')
    || null;
  const priceDisplay = document.getElementById('currentPriceDisplay') || null;
  const entryDateInput = document.getElementById('tradePlanEntryDate')
    || document.getElementById('tradeEntryDate')
    || null;

  return { amountInput, sharesInput, priceInput, priceDisplay, entryDateInput };
}

/**
 * Parse numeric value from input, allowing partial decimal typing
 * @param {HTMLInputElement|null} input
 * @returns {number}
 */
function parseFieldValue(input) {
  if (!input) {
    return 0;
  }
  const raw = (input.value || '').toString().trim().replace(/,/g, '');
  if (raw === '' || raw === '.' || raw === '-' || raw === '-.') {
    return 0;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Parse price from entry input (or fallback to display element)
 * @param {HTMLInputElement|null} priceInput
 * @param {HTMLElement|null} priceDisplay
 * @returns {number}
 */
function parsePriceValue(priceInput, priceDisplay) {
  const priceFromInput = parseFieldValue(priceInput);
  if (priceFromInput > 0) {
    return priceFromInput;
  }

  if (priceDisplay && priceDisplay.textContent) {
    const normalized = priceDisplay.textContent.replace(/[^\d.\-]/g, '');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

/**
 * Normalize response from convertAmountToShares into consistent structure
 * @param {number|object} result
 * @returns {{sharesValue: number|null, adjustedAmount: number|null}}
 */
function normalizeSharesResult(result) {
  if (result == null) {
    return { sharesValue: null, adjustedAmount: null };
  }

  if (typeof result === 'object') {
    const shares = Number(result.shares);
    const adjustedAmount = result.adjustedAmount !== undefined
      ? Number(result.adjustedAmount)
      : null;

    return {
      sharesValue: Number.isFinite(shares) ? Number(shares.toFixed(4)) : null,
      adjustedAmount: Number.isFinite(adjustedAmount) ? adjustedAmount : null,
    };
  }

  const numericShares = Number(result);
  return {
    sharesValue: Number.isFinite(numericShares)
      ? Number(numericShares.toFixed(4))
      : null,
    adjustedAmount: null,
  };
}

// The translateDateRangeToDates function is already defined at the beginning of the file

// Defining the updateGridFromComponent function immediately at the beginning of the file

// Ensuring the function is only defined on the planning page
if (window.location.pathname.includes('/trade_plans')) {
  window.updateGridFromComponent = function (selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {


    // Saving filters in global variables
    window.selectedStatusesForFilter = selectedStatuses || [];
    window.selectedTypesForFilter = selectedTypes || [];
    window.selectedDateRangeForFilter = selectedDateRange || null;
    window.searchTermForFilter = searchTerm || '';

    // Extracting start and end dates from date range
    let startDate = 'לא נבחר';
    let endDate = 'לא נבחר';

    if (selectedDateRange && selectedDateRange !== 'כל זמן') {
      // Translating date range to actual dates
      const dateRange = translateDateRangeToDates(selectedDateRange);
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
    }

    window.selectedStartDateForFilter = startDate;
    window.selectedEndDateForFilter = endDate;


    // Updating debug panel
    if (typeof updateFilterDebugPanel === 'function') {
      updateFilterDebugPanel();
    }

    // Direct call to local function
    if (typeof window.loadTradePlansData === 'function') {
      window.loadTradePlansData();
    } else {
      handleFunctionNotFound('loadTradePlansData');
    }
  };
}


/**
 *
 * This function loads all planning from the server and updates the table
 * If server is not available, uses demo data
 *
 * @returns {Array} Array of planning
 */
async function loadTradePlansData() {
  try {
    // Use trade-plan-service to load data
    if (typeof window.tradePlanService?.loadTradePlansData === 'function') {
      const data = await window.tradePlanService.loadTradePlansData();

      // Update global data
      window.tradePlansData = data;
      window.tradePlansLoaded = true;

      // Update the table
      updateTradePlansTable(data);

      return data;
    } else {
      // Fallback: load data directly from API
      window.Logger.info('Loading trade plans data (bypass cache)', { page: "trade_plans" });
      
      // קריאה ישירה לשרת עם timestamp למניעת cache
      const response = await fetch(`/api/trade_plans/?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const data = result.data || [];
      
      // Update global data
      window.tradePlansData = data;
      window.tradePlansLoaded = true;
      
      // Update the table
      window.Logger.info(`🔄 Updating table with ${data.length} trade plans...`, { page: "trade_plans" });
      updateTradePlansTable(data);
      
      window.Logger.info(`✅ Loaded ${data.length} trade plans`, { page: "trade_plans" });
      return data;
    }
  } catch (error) {
    handleApiError(error, 'נתוני תכנונים');
    return [];
  }
}

// REMOVED: updateDesignsTable - alias not used
/**
 * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 */
function _REMOVED_updateDesignsTable(trade_plans) {
  try {
    return updateTradePlansTable(trade_plans);
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת עיצובים:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת עיצובים', error.message);
    }
  }
}


// REMOVED: filterTradePlansData - not used
/**
 * פילטור נתוני תכנונים
 */
function _REMOVED_filterTradePlansData(filters) {
  try {
    // Use trade-plan-service for filtering
    if (typeof window.tradePlanService?.filterTradePlans === 'function') {
      const filteredData = window.tradePlanService.filterTradePlans(filters);
      updateTradePlansTable(filteredData);
      return;
    }

  // Fallback to local filtering
  if (!window.tradePlansData || !Array.isArray(window.tradePlansData)) {
    return;
  }

  let filteredData = [...window.tradePlansData];

  // פילטור לפי סטטוס
  if (filters.statuses && filters.statuses.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.statuses.includes(plan.status),
    );
  }

  // פילטור לפי סוג השקעה
  if (filters.types && filters.types.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.types.includes(plan.investment_type),
    );
  }

  // פילטור לפי חשבון מסחר
  if (filters.accounts && filters.accounts.length > 0) {
    filteredData = filteredData.filter(plan =>
      filters.accounts.includes(plan.account?.id || plan.trading_account_id),
    );
  }

  // פילטור לפי תאריך
  if (filters.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    if (startDate && endDate) {
      filteredData = filteredData.filter(plan => {
        const planDate = new Date(plan.created_at);
        return planDate >= startDate && planDate <= endDate;
      });
    }
  }

  // פילטור לפי חיפוש
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filteredData = filteredData.filter(plan =>
      plan.ticker?.symbol?.toLowerCase().includes(searchTerm) ||
            plan.ticker?.name?.toLowerCase().includes(searchTerm) ||
            plan.entry_conditions?.toLowerCase().includes(searchTerm) ||
            plan.reasons?.toLowerCase().includes(searchTerm),
    );
  }


  // עדכון הטבלה
  updateTradePlansTable(filteredData);
  
  } catch (error) {
    window.Logger.error('שגיאה בפילטור נתוני תכנונים:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור נתוני תכנונים', error.message);
    }
  }
}

// Note: Using global FieldRendererService for status and type rendering
// No local functions needed - use window.FieldRendererService.renderStatus() and renderType()

/**
 * עדכון טבלת תכנונים
 *
 * פונקציה זו מעדכנת את הטבלה עם הנתונים החדשים
 * כולל המרת ערכים לעברית ועיצוב תאים
 *
 * @param {Array} trade_plans - מערך של תכנונים לעדכון
 */
function updateTradePlansTable(trade_plans) {
  try {
    // === UPDATE TRADE PLANS TABLE FUNCTION CALLED ===
    window.Logger.info(`🔄 updateTradePlansTable called with ${trade_plans ? trade_plans.length : 0} trade plans`, { page: "trade_plans" });

    const tbody = document.querySelector('#trade_plansTable tbody');
    window.Logger.info(`🔍 Looking for tbody:`, tbody, { page: "trade_plans" });
    // Looking for table body

    if (!tbody) {
      handleElementNotFound('#trade_plansTable tbody', 'CRITICAL');
      return;
    }

    // Checking if there is data to display
    window.Logger.info(`🔍 Checking data: trade_plans =`, trade_plans, `length =`, trade_plans?.length, { page: "trade_plans" });
  window.Logger.info(`🔍 Condition check: !trade_plans =`, !trade_plans, `trade_plans.length === 0 =`, trade_plans?.length === 0, { page: "trade_plans" });
  if (!trade_plans || trade_plans.length === 0) {
    window.Logger.info(`❌ No data to display - entering error condition`, { page: "trade_plans" });
    // No trade plans to display

    // Checking if it's because of filters or if there are no data at all
    const hasOriginalData = window.tradePlanService?.getTradePlans()?.length > 0 || window.tradePlansData && window.tradePlansData.length > 0;
    // Has original data check

    // Checking if there are active filters
    const hasActiveFilters = (() => {
      // Search check
      if (window.searchTermForFilter && window.searchTermForFilter.trim() !== '') {
        return true;
      }

      // Status check (if not all statuses are selected)
      if (window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0) {
        const allStatuses = ['open', 'closed', 'cancelled'];
        const selectedStatuses = window.selectedStatusesForFilter.map(s => s.toLowerCase());
        if (!allStatuses.every(status => selectedStatuses.includes(status))) {
          return true;
        }
      }

      // Type check (if not all types are selected)
      if (window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0) {
        const allTypes = ['swing', 'investment', 'passive'];
        const selectedTypes = window.selectedTypesForFilter.map(t => t.toLowerCase());
        if (!allTypes.every(type => selectedTypes.includes(type))) {
          return true;
        }
      }

      // Date range check
      if (window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן') {
        return true;
      }

      return false;
    })();

    // Has active filters check

    if (hasOriginalData && hasActiveFilters) {
      // There is data but the filter didn't find results
      // Showing "no results" message due to filters
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-info">
                <i class="fas fa-search"></i> לא נמצאו תוצאות
                <br><small>נסה לשנות את הפילטרים או מונח החיפוש</small>
            </td></tr>`;
    } else {
      // No data at all
      // Showing "no data" message
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">
                <i class="fas fa-info-circle"></i> אין תכנונים להצגה
                <br><small>לא נמצאו תכנונים במערכת</small>
            </td></tr>`;
    }

    // Updating record count
    const countElement = document.querySelector('#trade_plansCount');
    if (countElement) {
      countElement.textContent = '0 תכנונים';
    }

    // Updating statistics - use the non-recursive function
    updateTradePlansPageSummaryStats();
    return;
  }

  window.Logger.info(`✅ Data exists, proceeding to build table HTML`, { page: "trade_plans" });
  const tableHTML = trade_plans.map((design, index) => {
    try {
      // Safeguarding against invalid data
      if (!design || typeof design !== 'object') {
        window.Logger?.warn('Invalid design data in table', { design: design, page: "trade_plans" });
        return '';
      }


    // Using global FieldRendererService for rendering - no need for local CSS classes

    // Date correction - converting to Hebrew format
    let dateDisplay = 'לא מוגדר';

    if (design.created_at) {
      try {
        const dateObj = new Date(design.created_at);

        if (!isNaN(dateObj.getTime())) {
          dateDisplay = dateObj.toLocaleDateString('he-IL');
        } else {
          handleValidationError('date', 'תאריך לא תקין');
        }
      } catch (error) {
        handleValidationError('date parsing', 'שגיאה בניתוח תאריך');
      }
    }

    // Type correction - ensuring a valid value is passed
    const typeDisplay = design.investment_type ? window.translateTradePlanType ? window.translateTradePlanType(design.investment_type) : design.investment_type : 'לא מוגדר';
    const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
    const amountDisplay = formatCurrency(design.planned_amount);
    const targetDisplay = formatCurrency(design.target_price);
    const stopDisplay = formatCurrency(design.stop_price);
    const currentDisplay = formatCurrency(design.current || 0);
    const statusDisplay = window.translateTradePlanStatus ? window.translateTradePlanStatus(design.status) : design.status;

    // Displaying ticker symbol or name with Entity Details link
    const tickerDisplay = design.ticker ? design.ticker.symbol || design.ticker.name || 'לא מוגדר' : 'לא מוגדר';
    const tickerLink = design.id ? `<button class="btn btn-sm" onclick="if (typeof window.showEntityDetails === 'function') { window.showEntityDetails('trade_plan', ${design.id}); }" title="קישור">🔗</button>` : '';

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = design.investment_type || '';
    const statusForFilter = design.status || '';

    return `
      <tr>
        <td class="ticker-cell">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${tickerLink}
            <span class="entity-trade-plan-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
              ${tickerDisplay}
            </span>
          </div>
        </td>
        <td data-date="${design.created_at}">${(() => {
          if (design.created_at) {
            try {
              const dateObj = new Date(design.created_at);
              if (!isNaN(dateObj.getTime())) {
                // פורמט מקוצר: DD/MM/YY
                const day = dateObj.getDate().toString().padStart(2, '0');
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const year = dateObj.getFullYear().toString().slice(-2);
                return `<span class="date-text">${day}/${month}/${year}</span>`;
              }
            } catch (e) {
              window.Logger.warn('Error parsing date:', design.created_at, e, { page: "trade_plans" });
            }
          }
          return `<span class="date-text">-</span>`;
        })()}</td>
        <td class="type-cell" data-type="${typeForFilter}">
          ${(window.FieldRendererService && window.FieldRendererService.renderType) 
            ? window.FieldRendererService.renderType(design.investment_type) 
            : (window.renderType ? window.renderType(design.investment_type) : `<span class="entity-trade-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${typeDisplay}</span>`)}
        </td>
        <td class="side-cell" data-side="${design.side}">
          ${window.renderSide ? window.renderSide(design.side) : `<span class="${design.side === 'Long' ? 'numeric-value-positive' : 'numeric-value-negative'}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${sideDisplay}</span>`}
        </td>
        <td class="quantity-cell">
          ${(() => {
            // חישוב כמות מהסכום המתוכנן ומחיר היעד
            const plannedAmount = design.planned_amount || 0;
            const targetPrice = design.target_price || 0;
            const calculatedQuantity = targetPrice > 0 ? (plannedAmount / targetPrice) : 0;
            
            if (calculatedQuantity > 0) {
              const formatted = calculatedQuantity.toFixed(1);
              return `<span class="numeric-value-positive" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">#${formatted}</span>`;
            } else {
              return `<span class="numeric-value-positive" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>`;
            }
          })()}
        </td>
        <td class="price-cell">
          <span class="target-text" style="color: ${window.getTableColors ? window.getTableColors().positive : '#28a745'};">
            ${(() => {
              const targetPrice = design.target_price || 0;
              const formatted = targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return `$${formatted}`;
            })()}
          </span>
        </td>
        <td class="investment-cell">
          ${(() => {
            const amount = design.planned_amount || 0;
            const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return `<span class="amount-display">$${formatted}</span>`;
          })()}
        </td>
        <td class="status-cell" data-status="${statusForFilter}">
          ${(window.FieldRendererService && window.FieldRendererService.renderStatus) 
            ? window.FieldRendererService.renderStatus(design.status, 'trade_plan') 
            : (window.renderStatus ? window.renderStatus(design.status, 'trade_plan') : `<span class="status-${design.status}-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${statusDisplay}</span>`)}
        </td>
        <td class="reward-cell">
          ${(() => {
            // חישוב סיכוי (רווח פוטנציאלי)
            const plannedAmount = design.planned_amount || 0;
            const targetPrice = design.target_price || 0;
            const currentPrice = design.current || 0;
            
            if (plannedAmount > 0 && targetPrice > 0) {
              const quantity = plannedAmount / targetPrice;
              const potentialProfit = quantity * (targetPrice - currentPrice);
              const profitFormatted = Math.round(potentialProfit).toLocaleString('en-US');
              return `<span class="numeric-value-positive" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">$${profitFormatted}</span>`;
            } else {
              return `<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>`;
            }
          })()}
        </td>
        <td class="risk-cell">
          ${(() => {
            // חישוב סיכון (הפסד מקסימלי)
            const plannedAmount = design.planned_amount || 0;
            const targetPrice = design.target_price || 0;
            const stopPrice = design.stop_price || 0;
            const currentPrice = design.current || 0;
            
            if (plannedAmount > 0 && targetPrice > 0 && stopPrice > 0) {
              const quantity = plannedAmount / targetPrice;
              const potentialLoss = quantity * (currentPrice - stopPrice);
              const lossFormatted = Math.round(Math.abs(potentialLoss)).toLocaleString('en-US');
              return `<span class="numeric-value-negative" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">$${lossFormatted}</span>`;
            } else {
              return `<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>`;
            }
          })()}
        </td>
        <td class="ratio-cell">
          ${(() => {
            // חישוב יחס סיכוי/סיכון
            const plannedAmount = design.planned_amount || 0;
            const targetPrice = design.target_price || 0;
            const stopPrice = design.stop_price || 0;
            const currentPrice = design.current || 0;
            
            if (plannedAmount > 0 && targetPrice > 0 && stopPrice > 0) {
              const quantity = plannedAmount / targetPrice;
              const potentialProfit = quantity * (targetPrice - currentPrice);
              const potentialLoss = quantity * (currentPrice - stopPrice);
              
              if (Math.abs(potentialLoss) > 0) {
                const ratio = potentialProfit / Math.abs(potentialLoss);
                const ratioFormatted = ratio.toFixed(2);
                
                // צביעה: סיכוי בירוק, סיכון באדום
                return `
                  <div style="font-size: 0.85em;">
                    <span class="numeric-value-positive" style="margin-right: 4px;">${ratioFormatted}</span>
                    <span class="numeric-value-negative">1</span>
                  </div>
                `;
              }
            }
            return `<span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">-</span>`;
          })()}
        </td>
        <td class="actions-cell">
          ${(() => {
            if (!window.createActionsMenu) {
              window.Logger.error('❌ createActionsMenu לא זמינה!', { page: "trade_plans" });
              return `<div class="alert alert-danger">שגיאה: מערכת התפריט לא זמינה</div>`;
            }
            
            try {
              const result = window.createActionsMenu([
                { type: 'VIEW', onclick: `window.showEntityDetails('trade_plan', ${design.id}, { mode: 'view' })`, title: 'צפה בפרטי תכנון' },
                { type: 'LINK', onclick: `if (typeof window.viewLinkedItemsForTradePlan === 'function') { window.viewLinkedItemsForTradePlan(${design.id}); }`, title: 'קישור' },
                { type: 'EDIT', onclick: `window.ModalManagerV2 && window.ModalManagerV2.showEditModal('tradePlansModal', 'trade_plan', ${design.id})`, title: 'ערוך' },
                { type: 'CANCEL', onclick: `if (typeof window.cancelTradePlan === 'function') { window.cancelTradePlan(${design.id}); }`, title: 'בטל' },
                { type: 'DELETE', onclick: `if (typeof window.deleteTradePlan === 'function') { window.deleteTradePlan(${design.id}); }`, title: 'מחק' }
              ]);
              
              if (!result || result.trim().length === 0) {
                window.Logger.error('❌ createActionsMenu החזירה תוצאה ריקה!', { page: "trade_plans" });
                return `<div class="alert alert-warning">אזהרה: תפריט הפעולות לא נוצר</div>`;
              }
              
              return result;
            } catch (error) {
              window.Logger.error('❌ שגיאה ביצירת תפריט פעולות:', error, { page: "trade_plans" });
              return `<div class="alert alert-danger">שגיאה: ${error.message}</div>`;
            }
          })()}
        </td>
      </tr>
    `;
    } catch (error) {
      window.Logger.error(`❌ Error processing design ${index + 1}:`, error, { page: "trade_plans" });
      return `<tr><td colspan="11" class="text-center text-danger">שגיאה בעיבוד תכנון ${index + 1}</td></tr>`;
    }
  }).join('');

  window.Logger.info(`🔄 Table HTML built successfully, length: ${tableHTML.length}`, { page: "trade_plans" });
  window.Logger.info(`🔄 Setting tbody.innerHTML with ${trade_plans.length} rows`, { page: "trade_plans" });
  tbody.innerHTML = tableHTML;
  window.Logger.info(`✅ Table updated successfully`, { page: "trade_plans" });

      // Updating record count
    const countElement = document.querySelector('#trade_plansCount');
    if (countElement) {
      countElement.textContent = `${trade_plans.length} תכנונים`;
    }

    // Updating statistics - use the non-recursive function
    updateTradePlansPageSummaryStats();
    
    // יישום צבעי ישויות על כותרות
    if (window.applyEntityColorsToHeaders) {
      window.applyEntityColorsToHeaders('trade_plan');
    }
    
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת תכנוני טרייד:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת תכנוני טרייד', error.message);
    }
  }
}

// ===== DATA MANAGEMENT FUNCTIONS =====
// Data loading, filtering, and statistics

/**
 * Update page summary statistics for trade plans
 * 
 * IMPORTANT: This function uses a DIFFERENT name to avoid recursion with global function.
 * The global function is window.updatePageSummaryStats(pageName, data, countElementId).
 * We call it directly without creating a local override.
 * 
 * @function updateTradePlansPageSummaryStats
 * @returns {void}
 */
function updateTradePlansPageSummaryStats() {
  try {
    // Call global function directly - it's in ui-utils.js
    if (typeof window.updatePageSummaryStats === 'function') {
      // Store reference to verify it's not our local function (by checking if it accepts 3 params)
      const fnString = window.updatePageSummaryStats.toString();
      if (fnString.includes('pageName') && fnString.includes('countElementId')) {
        // This is the global function from ui-utils.js - call it
        window.updatePageSummaryStats('trade_plans', window.tradePlansData, 'designsCount');
      } else {
        // Fallback: Use InfoSummarySystem directly
        if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
          const config = window.INFO_SUMMARY_CONFIGS['trade_plans'];
          if (config) {
            const dataToUse = window.filteredTradePlansData || window.tradePlansData || [];
            window.InfoSummarySystem.calculateAndRender(dataToUse, config);
            const countElement = document.getElementById('designsCount');
            if (countElement && dataToUse) {
              countElement.textContent = `${dataToUse.length} תכנונים`;
            }
          }
        }
      }
    } else if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      // Fallback: Use InfoSummarySystem directly if global function not available
      const config = window.INFO_SUMMARY_CONFIGS['trade_plans'];
      if (config) {
        const dataToUse = window.filteredTradePlansData || window.tradePlansData || [];
        window.InfoSummarySystem.calculateAndRender(dataToUse, config);
        const countElement = document.getElementById('designsCount');
        if (countElement && dataToUse) {
          countElement.textContent = `${dataToUse.length} תכנונים`;
        }
      }
    }
  } catch (error) {
    window.Logger?.error('Error updating page summary stats:', error, { page: "trade_plans" });
  }
}

// NO LOCAL updatePageSummaryStats function - it causes recursion!
// We use updateTradePlansPageSummaryStats() directly in the code
// This avoids the recursion issue with the global function

// REMOVED: Old showAddTradePlanModal - replaced by ModalManagerV2 version below

// REMOVED: Validation rules - Now handled by ModalManagerV2 using trade-plans-config.js
// The validation system is initialized automatically when the modal is created via ModalManagerV2.createCRUDModal()
// All validation rules are defined in: modal-configs/trade-plans-config.js -> validation property

  // השבתת כל השדות עד לבחירת טיקר
  const fieldsToDisable = [
    'type',
    'side',
    'quantity',
    'quantity',
    'price',
    'notes',
    'notes',
    'notes',
  ];

  fieldsToDisable.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = true;
      field.value = '';
      // הסרת required מהשדות המושבתים
      field.removeAttribute('required');
    }
  });

  // ניקוי תצוגת הטיקר
  const tickerDisplay = document.getElementById('selectedTickerDisplay');
  const priceDisplay = document.getElementById('currentPriceDisplay');
  const changeDisplay = document.getElementById('dailyChangeDisplay');

  if (tickerDisplay) {tickerDisplay.textContent = 'לא נבחר';}
  if (priceDisplay) {priceDisplay.textContent = '-';}
  if (changeDisplay) {
    changeDisplay.textContent = '-';
    changeDisplay.style.color = '#6c757d';
  }

  // Loading tickers from server
  if (typeof window.tickerService?.loadTickersForTradePlan === 'function') {
    window.tickerService.loadTickersForTradePlan();
  } else {
    window.Logger?.debug('tickerService.loadTickersForTradePlan not available - using fallback', { page: "trade_plans" });
  }

  // Displaying the modal
  const editModalElement = document.getElementById('addTradePlanModal');
  if (editModalElement) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(editModalElement);
      modal.show();
      
      // Setup edit price calculation functionality
      setTimeout(() => {
        if (typeof window.setupEditPriceCalculation === 'function') {
          window.setupEditPriceCalculation();
          window.Logger.info('✅ openEditTradePlanModal: Edit price calculation setup completed', { page: "trade_plans" });
        }
      }, 100);
    } else {
      editModalElement.style.display = 'block';
      editModalElement.classList.add('show');
      
      // Setup edit price calculation functionality
      setTimeout(() => {
        if (typeof window.setupEditPriceCalculation === 'function') {
          window.setupEditPriceCalculation();
          window.Logger.info('✅ openEditTradePlanModal: Edit price calculation setup completed', { page: "trade_plans" });
        }
      }, 100);
    }
  }

/**
 * שמירת תכנון חדש
 */
/**
 * שמירת נתוני תכנון (הוספה או עריכה)
 * @param {string} mode - 'add' או 'edit'
 */
async function saveTradePlanData(mode) {
  const isEdit = mode === 'edit';
  
  try {
    if (isEdit) {
      // שימוש ב-DataCollectionService לאיסוף נתונים
      const tradePlanData = DataCollectionService.collectFormData({
        id: { id: 'editTradePlanId', type: 'int' },
        ticker_id: { id: 'editTicker', type: 'int' },
        investment_type: { id: 'editType', type: 'text' },
        side: { id: 'editSide', type: 'text' },
        planned_amount: { id: 'editQuantity', type: 'number' },
        stop_price: { id: 'editPrice', type: 'number' },
        target_price: { id: 'editPrice', type: 'number' },
        entry_conditions: { id: 'editNotes', type: 'text' },
        reasons: { id: 'editNotes', type: 'text' }
      });

      const formData = {
        ...tradePlanData,
        status: 'open' // Default status
      };

      // בדיקה אם הסטטוס משתנה ל-'cancelled'
      const originalTradePlan = window.tradePlansData.find(tp => tp.id === formData.id);
      const isStatusChangingToCancelled = originalTradePlan &&
                                             originalTradePlan.status !== 'cancelled' &&
                                             formData.status === 'cancelled';

      if (isStatusChangingToCancelled) {
        // בדיקת פריטים מקושרים לפני הביטול
        await checkLinkedItemsBeforeCancel(formData.id);
        return; // לא ממשיכים עם העדכון אם יש פריטים מקושרים
      }

      // בדיקה אם הטיקר השתנה
      const isTickerChanging = originalTradePlan &&
                                  originalTradePlan.ticker_id !== formData.ticker_id;

      if (isTickerChanging) {
        // שינוי טיקר לא נתמך - הצגת הודעה ודחיית השינוי
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification(
            'פיצ\'ר לא נתמך',
            'שינוי טיקר לתכנון לא נתמך עדיין. השינוי נדחה.',
            6000,
            'system'
          );
        }
        return;
      }

      // שליחה לשרת
      const response = await fetch(`/api/trade_plans/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.showSuccessNotification('תכנון עודכן בהצלחה!');
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTradePlanModal'));
        if (modal) modal.hide();
        // רענון הנתונים
        await loadTradePlansData();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } else {
      const form = document.getElementById('addTradePlanForm');
      if (!form) {
        window.Logger?.warn('Form element not found - skipping save operation', { page: "trade_plans" });
        if (typeof window.showErrorNotification === 'function') {
          window.showErrorNotification('שגיאה', 'הטופס לא נמצא. יש לרענן את העמוד.');
        }
        return;
      }

      // בדיקת ולידציה
      if (!window.validateForm('addTradePlanForm')) {
        return;
      }

      // איסוף נתונים מהטופס
      const formData = {
        ticker_id: document.getElementById('ticker').value,
        investment_type: document.getElementById('type').value,
        side: document.getElementById('side').value,
        planned_amount: document.getElementById('quantity').value,
        stop_price: document.getElementById('price').value || null,
        entry_conditions: document.getElementById('notes').value || null,
        status: 'open'
      };

      // שליחה לשרת
      const response = await fetch('/api/trade_plans/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.showSuccessNotification('תכנון נוסף בהצלחה!');
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTradePlanModal'));
        if (modal) modal.hide();
        // רענון הנתונים
        await loadTradePlansData();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    
  } catch (error) {
    const action = isEdit ? 'עדכון' : 'הוספת';
    window.Logger.error(`שגיאה ב${action} תכנון:`, error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה ב${action} תכנון`, error.message);
    }
  }
}

// REMOVED: saveEditTradePlan deprecated wrapper - using saveTradePlanData('edit') directly
// Original wrapper at line 2654 has been removed - function is now defined at line 1207 with full implementation

// REMOVED: saveNewTradePlan - deprecated wrapper
/**
 * שמירת תכנון חדש
 * @deprecated Use saveTradePlanData('add') instead
 */
async function _REMOVED_saveNewTradePlan() {
  await saveTradePlanData('add');
}
// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.executeTradePlan = executeTradePlan;
// REMOVED: addTradePlan, editTradePlan, updateTradePlan - deprecated wrappers, using saveTradePlanData and ModalManagerV2
window.deleteTradePlan = deleteTradePlan;
window.enableFormFields = enableFormFields;
window.disableFormFields = disableFormFields;
window.enableEditFieldsWrapper = enableEditFieldsWrapper;
window.disableEditFields = disableEditFields;
window.hideTickerInfo = hideTickerInfo;
window.hideEditTickerInfo = hideEditTickerInfo;
window.updateEditSharesFromAmount = updateEditSharesFromAmount;
window.updateEditAmountFromShares = updateEditAmountFromShares;
window.addEditCondition = addEditCondition;
window.addEditReason = addEditReason;
window.addEditImportantNote = addEditImportantNote;
/**
 * Initialize conditions system for trade plans
 * Uses global ConditionsInitializer from conditions package
 */
function initializeTradePlanConditionsSystem() {
  try {
    // First check if conditionsSystem is already available (most reliable check)
    if (window.conditionsSystem && window.conditionsSystem.initializer) {
      window.Logger?.info('✅ Conditions system already initialized for trade plans', { page: "trade_plans" });
      return true;
    }
    
    // Try to initialize using ConditionsInitializer class
    if (typeof window.ConditionsInitializer !== 'undefined') {
      try {
        const initializer = new window.ConditionsInitializer();
        if (initializer && typeof initializer.initialize === 'function') {
          initializer.initialize().then(() => {
            window.Logger?.info('✅ Trade plans conditions system initialized successfully', { page: "trade_plans" });
          }).catch(error => {
            window.Logger?.error('Error initializing trade plans conditions system:', error, { page: "trade_plans" });
          });
          return true;
        }
      } catch (error) {
        window.Logger?.warn('Error creating ConditionsInitializer instance:', error, { page: "trade_plans" });
      }
    }
    
    // If not available immediately, try deferred check
    setTimeout(() => {
      if (window.conditionsSystem && window.conditionsSystem.initializer) {
        window.Logger?.info('✅ Conditions system initialized for trade plans (deferred check)', { page: "trade_plans" });
        return true;
      } else {
        window.Logger?.warn('⚠️ ConditionsInitializer not available - conditions package may not be loaded', { page: "trade_plans" });
      }
    }, 500);
    
    return false;
  } catch (error) {
    window.Logger?.error('Error in initializeTradePlanConditionsSystem:', error, { page: "trade_plans" });
    return false;
  }
}

/**
 * Setup sortable headers for trade plans table
 * Uses global setupSortableHeaders function from page-utils.js
 */
function setupSortableHeadersLocal() {
  try {
    if (typeof window.setupSortableHeaders === 'function') {
      window.setupSortableHeaders('trade_plans');
      window.Logger?.debug('Sortable headers setup completed for trade plans', { page: "trade_plans" });
    } else {
      window.Logger?.warn('Global setupSortableHeaders not available', { page: "trade_plans" });
    }
  } catch (error) {
    window.Logger?.error('Error setting up sortable headers:', error, { page: "trade_plans" });
  }
}

window.addEditReminder = addEditReminder;
window.updatePageSummaryStats = updatePageSummaryStats;
window.restoreSortState = restoreSortState;
window.initializeTradePlanConditionsSystem = initializeTradePlanConditionsSystem;
window.setupPriceCalculation = setupPriceCalculation;
window.setupEditPriceCalculation = setupEditPriceCalculation;
/**
 * Restore planning section state for trade plans
 * Uses global restoreAllSectionStates function from ui-utils.js
 */
function restorePlanningSectionState() {
  try {
    if (typeof window.restoreAllSectionStates === 'function') {
      window.restoreAllSectionStates('trade_plans');
      window.Logger?.debug('Planning section state restored for trade plans', { page: "trade_plans" });
    } else {
      window.Logger?.warn('Global restoreAllSectionStates not available', { page: "trade_plans" });
    }
  } catch (error) {
    window.Logger?.error('Error restoring planning section state:', error, { page: "trade_plans" });
  }
}

window.setupSortableHeadersLocal = setupSortableHeadersLocal;
window.toggleSection = toggleSection;
window.restorePlanningSectionState = restorePlanningSectionState;
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.updateTickerInfo = updateTickerInfo;
window.updateSharesFromAmount = updateSharesFromAmount;
window.updateAmountFromShares = updateAmountFromShares;
window.applyTradePlanDefaultRiskLevels = applyTradePlanDefaultRiskLevels;

// REMOVED: window.showAddTradePlanModal - use window.showModalSafe('tradePlansModal', 'add') directly

/**
 * Show edit trade plan modal (wrapper for ModalManagerV2)
 * Maintains backward compatibility with HTML onclick handlers
 * @function showEditTradePlanModal
 * @param {number|string} tradePlanId - ID of trade plan to edit
 */
window.showEditTradePlanModal = function(tradePlanId) {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        window.ModalManagerV2.showEditModal('tradePlansModal', 'trade_plan', tradePlanId);
    } else {
        console.error('ModalManagerV2 not available');
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
};

window.saveTradePlanData = saveTradePlanData;
/**
 * Filter trade plans by investment type
 * Filters the trade plans table by investment type (swing, investment, passive, or all)
 * 
 * @function filterTradePlansByType
 * @param {string} type - Investment type to filter by ('all', 'swing', 'investment', 'passive')
 * @returns {void}
 */
function filterTradePlansByType(type) {
  try {
    if (!window.tradePlansData || !Array.isArray(window.tradePlansData)) {
      window.Logger?.warn('Trade plans data not available for filtering', { page: "trade_plans" });
      return;
    }

    let filteredData;
    
    if (type === 'all') {
      // Show all trade plans
      filteredData = [...window.tradePlansData];
    } else {
      // Filter by investment type
      filteredData = window.tradePlansData.filter(plan => {
        // Handle both investment_type and type fields
        const planType = plan.investment_type || plan.type;
        return planType === type;
      });
    }

    // Update the table with filtered data
    if (typeof updateTradePlansTable === 'function') {
      updateTradePlansTable(filteredData);
    } else if (typeof window.updateTradePlansTable === 'function') {
      window.updateTradePlansTable(filteredData);
    }

    // Update active button state
    const filterButtons = document.querySelectorAll('.filter-icon-btn, .btn[onclick*="filterTradePlansByType"]');
    filterButtons.forEach(btn => {
      const btnType = btn.getAttribute('data-type') || btn.getAttribute('onclick')?.match(/filterTradePlansByType\(['"](.*?)['"]\)/)?.[1];
      if (btnType === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.Logger?.info(`Trade plans filtered by type: ${type}`, { count: filteredData.length, page: "trade_plans" });
    
  } catch (error) {
    window.Logger?.error('Error filtering trade plans by type:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בפילטור תכנונים לפי סוג', error.message);
    }
  }
}

window.filterTradePlansByType = filterTradePlansByType;

// ===== MODAL FUNCTIONS - NEW SYSTEM =====
// Modal management using ModalManagerV2

/**
 * Show add trade plan modal
 * Uses ModalManagerV2 for consistent modal experience
 * 
 * @function showAddTradePlanModal
 * @returns {void}
 */
// REMOVED: showAddTradePlanModal - use window.ModalManagerV2.showModal('tradePlansModal', 'add') directly

/**
 * הצגת מודל עריכת תוכנית מסחר
 * Uses ModalManagerV2 for consistent modal experience
 */
// REMOVED: showEditTradePlanModal - use window.ModalManagerV2.showEditModal('tradePlansModal', 'trade_plan', tradePlanId) directly

/**
 * שמירת תוכנית מסחר
 * Handles both add and edit modes
 */
async function saveTradePlan() {
    window.Logger.debug('saveTradePlan called', { page: 'trade_plans' });
    
    try {
        // ניקוי מטמון לפני פעולת CRUD        // Collect form data using DataCollectionService
        const form = document.getElementById('tradePlansModalForm');
        if (!form) {
            throw new Error('Trade Plan form not found');
        }
        
        const tradePlanData = DataCollectionService.collectFormData({
            trading_account_id: { id: 'tradePlanAccount', type: 'int' }, // Backend expects trading_account_id
            ticker_id: { id: 'tradePlanTicker', type: 'int' },
            investment_type: { id: 'tradePlanType', type: 'text' }, // Map tradePlanType field to investment_type column
            planned_amount: { id: 'planAmount', type: 'float' },
            quantity: { id: 'tradePlanQuantity', type: 'float' },
            entry_price: { id: 'tradePlanEntryPrice', type: 'float', default: null },
            stop_loss: { id: 'tradePlanStopLoss', type: 'float', default: null },
            take_profit: { id: 'tradePlanTakeProfit', type: 'float', default: null },
            entry_date: { id: 'tradePlanEntryDate', type: 'dateOnly', default: null },
            status: { id: 'tradePlanStatus', type: 'text' },
            notes: { id: 'tradePlanNotes', type: 'rich-text', default: null }
        });
        
        // ולידציה מפורטת
        let hasErrors = false;
        if (!tradePlanData.trading_account_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanAccount', 'חשבון מסחר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!tradePlanData.ticker_id) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanTicker', 'טיקר הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!tradePlanData.investment_type) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanType', 'סוג השקעה הוא שדה חובה');
            }
            hasErrors = true;
        }
        
        if (!tradePlanData.quantity || tradePlanData.quantity <= 0) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanQuantity', 'כמות חייבת להיות גדולה מ-0');
            }
            hasErrors = true;
        }
        
        if (!tradePlanData.status) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanStatus', 'סטטוס הוא שדה חובה');
            }
            hasErrors = true;
        }

        if (tradePlanData.notes && tradePlanData.notes.length > 5000) {
            if (window.showValidationWarning) {
                window.showValidationWarning('tradePlanNotes', 'הערות התוכנית חורגות מהאורך המותר (5,000 תווים)');
            }
            hasErrors = true;
        }
        
        if (hasErrors) {
            return;
        }
        
        // Determine if this is add or edit
        const isEdit = form.dataset.mode === 'edit';
        const tradePlanId = form.dataset.tradePlanId;
        
        // Prepare API call
        const url = isEdit ? `/api/trade_plans/${tradePlanId}` : '/api/trade_plans';
        const method = isEdit ? 'PUT' : 'POST';
        
        // Send to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tradePlanData)
        });
        
        // Use CRUDResponseHandler for consistent response handling
        if (isEdit) {
            await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית מסחר עודכנה בהצלחה',
                entityName: 'תוכנית מסחר',
                reloadFn: window.loadTradePlansData,
                requiresHardReload: false
            });
        } else {
            await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית מסחר נוספה בהצלחה',
                entityName: 'תוכנית מסחר',
                reloadFn: window.loadTradePlansData,
                requiresHardReload: false
            });
        }
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'שמירת תוכנית מסחר');
    }
}

/**
 * מחיקת תוכנית מסחר
 * Includes linked items check
 */
async function deleteTradePlan(tradePlanId) {
    window.Logger.info(`🗑️ deleteTradePlan called for trade plan ${tradePlanId}`, { tradePlanId, page: 'trade_plans' });
    
    try {
        // Get trade plan details for confirmation message
        let tradePlanDetails = `תוכנית מסחר #${tradePlanId}`;
        const tradePlan = window.tradePlansData?.find(tp => tp.id === tradePlanId || tp.id === parseInt(tradePlanId));
        
        if (tradePlan) {
            const ticker = tradePlan.ticker_symbol || tradePlan.symbol || 'לא מוגדר';
            const sideText = tradePlan.side === 'buy' ? 'קנייה' : 
                           tradePlan.side === 'sell' ? 'מכירה' : 
                           tradePlan.side === 'Long' ? 'קנייה' :
                           tradePlan.side === 'Short' ? 'מכירה' : tradePlan.side || 'לא מוגדר';
            const typeText = tradePlan.investment_type || tradePlan.type || 'לא מוגדר';
            const statusText = tradePlan.status === 'open' ? 'פתוח' :
                             tradePlan.status === 'closed' ? 'סגור' :
                             tradePlan.status === 'cancelled' ? 'מבוטל' : tradePlan.status || 'לא מוגדר';
            const amount = tradePlan.planned_amount ? `$${tradePlan.planned_amount}` : 'לא מוגדר';
            const date = tradePlan.created_at ? new Date(tradePlan.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
            
            tradePlanDetails = `${ticker} - ${sideText} ${typeText}, סטטוס: ${statusText}, סכום: ${amount}, תאריך: ${date}`;
        }
        
        // Check linked items first (Trades, Notes)
        window.Logger.info('🔍 Checking for linked items before deletion', { tradePlanId, page: 'trade_plans' });
        if (typeof window.checkLinkedItemsBeforeAction === 'function') {
            window.Logger.info('✅ checkLinkedItemsBeforeAction function exists', { tradePlanId, page: 'trade_plans' });
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade_plan', tradePlanId, 'delete');
            window.Logger.info(`🔍 Linked items check result: hasLinkedItems=${hasLinkedItems}`, { tradePlanId, page: 'trade_plans' });
            if (hasLinkedItems) {
                window.Logger.info('🚫 Trade Plan has linked items, deletion cancelled', { tradePlanId, page: 'trade_plans' });
                return;
            }
        } else {
            window.Logger.warn('⚠️ checkLinkedItemsBeforeAction function not available', { tradePlanId, page: 'trade_plans' });
        }
        
        // Use warning system for confirmation with detailed information
        if (window.showDeleteWarning) {
            window.showDeleteWarning('trade_plan', tradePlanDetails, 'תוכנית מסחר',
                async () => await performTradePlanDeletion(tradePlanId),
                () => {}
            );
        } else {
            // Fallback to simple confirm
            if (!confirm('האם אתה בטוח שברצונך למחוק את תוכנית המסחר?')) {
                return;
            }
            await performTradePlanDeletion(tradePlanId);
        }
        
    } catch (error) {
        window.Logger.error('Error deleting trade plan:', error, { tradePlanId, page: 'trade_plans' });
        CRUDResponseHandler.handleError(error, 'מחיקת תוכנית מסחר');
    }
}

async function performTradePlanDeletion(tradePlanId) {
    try {
        // Clear cache before deletion to ensure fresh data after reload
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('trade-plans-data');
        }
        
        // Send delete request
        const response = await fetch(`/api/trade_plans/${tradePlanId}`, {
            method: 'DELETE'
        });
        
        // Use CRUDResponseHandler for consistent response handling
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'תוכנית מסחר נמחקה בהצלחה',
            entityName: 'תוכנית מסחר',
            reloadFn: window.loadTradePlansData,
            requiresHardReload: false
        });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת תוכנית מסחר');
    }
}

// Export functions to window for global access
// Note: saveTradePlan already exported above
window.loadTradePlanTickerInfo = loadTradePlanTickerInfo;
window.displayTradePlanTickerInfo = displayTradePlanTickerInfo;
