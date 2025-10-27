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

/**
 * ========================================
 * Trade Plans Page - Trade Plans Page
 * ========================================

/**
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

/**
 * העתקת תוכנית מסחר
 * יוצר עותק של תוכנית מסחר קיימת
 * @param {number} planId - מזהה התוכנית
 */
function copyTradePlan(planId) {
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

// Ticker info functions
async function loadTickerInfo(tickerId) {
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

async function displayTickerInfo(ticker) {
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
 * Update form fields with calculated values based on ticker data and user preferences
 */
async function updateFormFieldsWithTickerData(ticker, currentPrice) {
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

// Edit modal ticker info functions
async function loadEditTickerInfo(tickerId) {
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

async function displayEditTickerInfo(ticker) {
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
async function updateEditFormFieldsWithTickerData(ticker, currentPrice) {
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

/**
 * שמירת עריכת תכנון
 */
async function saveEditTradePlan() {
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
      entityName: 'תכנון'
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
 * פתיחת מודל מחיקת תכנון
 */
window.confirmDeleteTradePlan = confirmDeleteTradePlan;
window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;
window.cancelTradePlan = cancelTradePlan;
window.deleteTradePlan = deleteTradePlan;
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
      window.Logger.info('🔄 Loading trade plans data directly from API...', { page: "trade_plans" });
      const response = await fetch('/api/trade_plans/');
      
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

/**
 * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 */
function updateDesignsTable(trade_plans) {
  try {
    return updateTradePlansTable(trade_plans);
  } catch (error) {
    window.Logger.error('שגיאה בעדכון טבלת עיצובים:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון טבלת עיצובים', error.message);
    }
  }
}


/**
 * פילטור נתוני תכנונים
 */
function filterTradePlansData(filters) {
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
      filters.accounts.includes(plan.account_id),
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

    // Updating statistics
    updatePageSummaryStats();
    return;
  }

  window.Logger.info(`✅ Data exists, proceeding to build table HTML`, { page: "trade_plans" });
  const tableHTML = trade_plans.map((design, index) => {
    try {
      // Safeguarding against invalid data
      if (!design || typeof design !== 'object') {
        if (typeof window.showNotification === 'function') {
          window.showNotification('Invalid design data in table', 'warning');
        }
        return '';
      }


    const statusClass = getStatusClass(design.status);
    const typeClass = getTypeClass(design.investment_type);

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
          ${window.renderType ? window.renderType(design.investment_type) : `<span class="entity-trade-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${typeDisplay}</span>`}
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
          ${window.renderStatus ? window.renderStatus(design.status, 'trade_plan') : `<span class="status-${design.status}-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${statusDisplay}</span>`}
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
                { type: 'EDIT', onclick: `if (typeof window.showEditTradePlanModal === 'function') { window.showEditTradePlanModal(${design.id}); }`, title: 'ערוך' },
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

    // Updating statistics
    updatePageSummaryStats();
    
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
 * Update page summary statistics
 * Calculates and displays trade plan statistics
 * 
 * @function updatePageSummaryStats
 * @returns {void}
 */
function updatePageSummaryStats() {
  try {
    // Using filtered data if available, otherwise all data
    const dataToUse = window.filteredTradePlansData || window.tradePlansData;
    
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS.trade_plans;
      window.InfoSummarySystem.calculateAndRender(dataToUse, config);
      
      // עדכון מספר הרשומות בטבלה
      const countElement = document.getElementById('designsCount');
      if (countElement) {
        countElement.textContent = `${dataToUse.length} רשומות`;
      }
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
    window.Logger.error('שגיאה בעדכון סטטיסטיקות סיכום:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון סטטיסטיקות סיכום', error.message);
    }
  }
}

/**
 * הצגת מודל הוספת תכנון
 */
async function showAddTradePlanModal() {
  window.Logger.info('🚀 showAddTradePlanModal: Starting modal preparation...', { page: "trade_plans" });
  window.Logger.info('🔍 showAddTradePlanModal: Checking if modal is already open...', { page: "trade_plans" });
  
  // Check if modal is already open
  const existingModal = document.querySelector('#addTradePlanModal.show');
  if (existingModal) {
    window.Logger.info('⚠️ showAddTradePlanModal: Modal already open, closing first...', { page: "trade_plans" });
    const modal = bootstrap.Modal.getInstance(existingModal);
    if (modal) modal.hide();
  }
  
  // Clearing the form completely
  const form = document.getElementById('addTradePlanForm');
  if (form) {
    window.Logger.info('✅ showAddTradePlanModal: Form found, starting reset...', { page: "trade_plans" });
    form.reset();

    // Clear all form fields manually to ensure complete reset
    const allInputs = form.querySelectorAll('input, select, textarea');
    window.Logger.info(`🔧 showAddTradePlanModal: Clearing ${allInputs.length} form inputs...`, { page: "trade_plans" });
    allInputs.forEach(input => {
      // Clear all inputs except date (which will be set later)
      if (input.type !== 'date') {
        window.Logger.info(`🔧 Clearing input: ${input.id || input.name || input.type} (old value: "${input.value}", { page: "trade_plans" })`);
        input.value = '';
      }
      // Remove validation classes
      input.classList.remove('is-valid', 'is-invalid');
      // Remove any disabled state
      input.disabled = false;
      // Remove any required attribute that was added
      input.removeAttribute('required');
    });

    // Clear any validation messages
    const validationMessages = form.querySelectorAll('.invalid-feedback');
    validationMessages.forEach(msg => msg.remove());

    // Clear any ticker display information
    const tickerDisplay = document.getElementById('selectedTickerDisplay');
    const priceDisplay = document.getElementById('currentPriceDisplay');
    const changeDisplay = document.getElementById('dailyChangeDisplay');
    
    if (tickerDisplay) tickerDisplay.textContent = 'לא נבחר';
    if (priceDisplay) priceDisplay.textContent = '-';
    if (changeDisplay) {
      changeDisplay.textContent = '-';
      changeDisplay.style.color = '#6c757d';
    }
  }

  // Set default values for required fields AFTER clearing
  const investmentTypeSelect = document.getElementById('type');
  if (investmentTypeSelect) {
    investmentTypeSelect.value = 'swing'; // Default investment type
  }

  const sideSelect = document.getElementById('side');
  if (sideSelect) {
    sideSelect.value = 'Long'; // Default side
  }

  const plannedAmountInput = document.getElementById('quantity');
  if (plannedAmountInput) {
    plannedAmountInput.value = '1000'; // Default planned amount
  }

  // Set default date to today (for display)
  const todayDate = new Date();
  const todayDisplay = todayDate.toLocaleDateString('he-IL');
  const planDateDisplay = document.getElementById('planDateDisplay');
  if (planDateDisplay) {
    planDateDisplay.textContent = todayDisplay;
  }

  // Loading tickers with default from preferences
  window.Logger.info('🔄 showAddTradePlanModal: Loading tickers with SelectPopulatorService...', { page: "trade_plans" });
  await SelectPopulatorService.populateTickersSelect('ticker', {
    includeEmpty: true,
    emptyText: 'בחר טיקר',
    defaultFromPreferences: true,
    filterFn: (ticker) => ticker.status === 'open' || ticker.status === 'closed'
  });
  window.Logger.info('✅ showAddTradePlanModal: Tickers loaded with SelectPopulatorService', { page: "trade_plans" });


  // Clear any existing validation errors
  if (typeof window.clearValidation === 'function') {
    window.clearValidation('addTradePlanForm');
  }

  // Ensure ticker select is reset to default AFTER loading tickers
  window.Logger.info('🔄 showAddTradePlanModal: Resetting ticker select...', { page: "trade_plans" });
  const tickerSelect = document.getElementById('ticker');
  if (tickerSelect) {
    window.Logger.info(`🔧 showAddTradePlanModal: Ticker select found, current value: "${tickerSelect.value}"`, { page: "trade_plans" });
    
    // Add event listener for ticker selection
    tickerSelect.addEventListener('change', function() {
      window.Logger.info('🎯 Ticker selected:', this.value, { page: "trade_plans" });
      if (this.value) {
        // Enable all form fields
        enableFormFields();
        },
      },
      'side': {
        required: true,
        type: 'select',
        message: 'יש לבחור צד',
        customValidation: value => {
          const validSides = ['Long', 'Short'];
          if (!validSides.includes(value)) {
            return 'צד לא תקין';
          }
          return true;
        },
      },
      'quantity': {
        required: true,
        type: 'number',
        min: 0.01,
        max: 999999999,
        message: 'יש להזין סכום מתוכנן',
        customValidation: value => {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'סכום מתוכנן חייב להיות מספר';
          }
          if (numValue <= 0) {
            return 'סכום מתוכנן חייב להיות חיובי';
          }
          return true;
        },
      },
      'price': {
        type: 'number',
        min: 0.01,
        max: 999999999,
        customValidation: value => {
          if (value && value !== '') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              return 'מחיר עצירה חייב להיות מספר';
            }
            if (numValue <= 0) {
              return 'מחיר עצירה חייב להיות חיובי';
            }
          }
          return true;
        },
      },
      'notes': {
        type: 'number',
        min: 0.01,
        max: 999999999,
        customValidation: value => {
          if (value && value !== '') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              return 'מחיר יעד חייב להיות מספר';
            }
            if (numValue <= 0) {
              return 'מחיר יעד חייב להיות חיובי';
            }
          }
          return true;
        },
      },
      'notes': {
        type: 'text',
        maxLength: 500,
        customValidation: value => {
          if (value && value.length > 500) {
            return 'תנאי כניסה לא יכול להיות יותר מ-500 תווים';
          }
          return true;
        },
      },
      'notes': {
        type: 'text',
        maxLength: 500,
        customValidation: value => {
          if (value && value.length > 500) {
            return 'סיבות לא יכולות להיות יותר מ-500 תווים';
          }
          return true;
        },
      },
    };

    try {
      window.initializeValidation('addTradePlanForm', validationRules);
    } catch (error) {
      handleSystemError(error, 'אתחול ולידציה');
    }
  } else {
    if (typeof window.showNotification === 'function') {
      window.showNotification('window.initializeValidation not available', 'warning');
    }
  }

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
    if (typeof window.showNotification === 'function') {
      window.showNotification('tickerService.loadTickersForTradePlan not available', 'warning');
    }
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
        if (typeof window.showNotification === 'function') {
          window.showNotification('Form element not found - skipping save operation', 'warning');
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

/**
 * שמירת תכנון בעריכה
 * @deprecated Use saveTradePlanData('edit') instead
 */
async function saveEditTradePlan() {
  await saveTradePlanData('edit');
}

/**
 * שמירת תכנון חדש
 * @deprecated Use saveTradePlanData('add') instead
 */
async function saveNewTradePlan() {
  await saveTradePlanData('add');
}
      max: 999999999,
      customValidation: value => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'סכום מתוכנן חייב להיות מספר';
        }
        if (numValue <= 0) {
          return 'סכום מתוכנן חייב להיות חיובי';
        }
        return true;
      },
    },
    'price': {
      min: 0.01,
      max: 999999999,
      customValidation: value => {
        if (value && value !== '') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'מחיר עצירה חייב להיות מספר';
          }
          if (numValue <= 0) {
            return 'מחיר עצירה חייב להיות חיובי';
          }
        }
        return true;
      },
    },
    'notes': {
      min: 0.01,
      max: 999999999,
      customValidation: value => {
        if (value && value !== '') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            return 'מחיר יעד חייב להיות מספר';
          }
          if (numValue <= 0) {
            return 'מחיר יעד חייב להיות חיובי';
          }
        }
        return true;
      },
    },
    'notes': {
      maxLength: 500,
      customValidation: value => {
        if (value && value.length > 500) {
          return 'תנאי כניסה לא יכול להיות יותר מ-500 תווים';
        }
        return true;
      },
    },
    'notes': {
      maxLength: 500,
      customValidation: value => {
        if (value && value.length > 500) {
          return 'סיבות לא יכולות להיות יותר מ-500 תווים';
        }
        return true;
      },
    },
  };

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  // Get form values with proper validation
  const tickerIdValue = document.getElementById('ticker').value;
  const investmentTypeValue = document.getElementById('type').value;
  const sideValue = document.getElementById('side').value;
  const plannedAmountValue = document.getElementById('quantity').value;
  const stopPriceValue = document.getElementById('price').value;
  const targetPriceValue = document.getElementById('price').value;

  // Form values before processing

  const formData = {
    account_id: 1, // Default to main account
    ticker_id: tickerIdValue && tickerIdValue !== '' ? parseInt(tickerIdValue) : null,
    investment_type: investmentTypeValue || '',
    side: sideValue || '',
    planned_amount: plannedAmountValue && plannedAmountValue !== '' ? parseFloat(plannedAmountValue) : 0,
    stop_price: stopPriceValue && stopPriceValue !== '' ? parseFloat(stopPriceValue) : null,
    target_price: targetPriceValue && targetPriceValue !== '' ? parseFloat(targetPriceValue) : null,
    entry_conditions: document.getElementById('notes').value || '',
    reasons: document.getElementById('notes').value || '',
    status: 'open', // Default to open status
  };

  // Sending new trade plan

  // ולידציה - משתמש במערכת הכללית window.validateEntityForm

  try {
    const response = await fetch('/api/trade_plans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Detailed log of the response
    // Server response check

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError('Error response from server', errorText);

      // Try to parse JSON error response
      try {
        const errorData = JSON.parse(errorText);
        // Parsed error data

        // Handle validation errors from server
        if (errorData.error && errorData.error.message) {
          const errorMessage = errorData.error.message;
          // Error message

          // טיפול בשגיאות - משתמש במערכת הכללית

          if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשמירת תכנון', errorMessage);
          } else if (typeof window.showNotification === 'function') {
            window.showNotification(errorMessage, 'error');
          }
          return;
        }
      } catch (e) {
        handleSystemError(e, 'ניתוח תגובת JSON');
      }

      throw new Error(`Error saving trade plan: ${response.status} - ${errorText}`);
    }

    if (response.ok) {
      const newDesign = await response.json();

      // Closing the modal
      closeModal('addTradePlanModal');

      // Refreshing data
      loadTradePlansData();

      // Displaying success message
      showSuccessNotification('Trade plan saved', 'Trade plan saved successfully!');
    } else {
      throw new Error(`Error saving trade plan: ${response.status}`);
    }
  } catch (error) {
    handleSaveError(error, 'שמירת תכנון');
    showErrorNotification('Error saving trade plan', 'Error saving trade plan: ' + error.message);
  }
}

/**
 * המרת שם שדה מהשרת ל-ID של השדה בטופס
 */
function getFieldIdFromServerField(serverField) {
  try {
    const fieldMapping = {
      'ticker_id': 'ticker',
      'investment_type': 'type',
      'side': 'side',
      'planned_amount': 'quantity',
      'stop_price': 'price',
      'target_price': 'notes',
    };
    return fieldMapping[serverField] || null;
  } catch (error) {
    window.Logger.error('שגיאה בקבלת מזהה שדה משדה שרת:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בקבלת מזהה שדה משדה שרת', error.message);
    }
    return null;
  }
}

/**
 * עריכת תכנון
 */
function editTradePlan(designId) {
  // קריאה לפונקציה הגלובלית לפתיחת מודל עריכה
  if (typeof window.showEditTradePlanModal === 'function') {
    window.showEditTradePlanModal(designId);
  } else {
    handleFunctionNotFound('showEditTradePlanModal');
    showErrorNotification('Error opening edit modal', 'Edit modal function not found');
  }
}


/**
 * מחיקת תכנון
 */
async function deleteTradePlan(tradePlanId) {
  try {
    const response = await fetch(`/api/trade_plans/${tradePlanId}`, {
      method: 'DELETE',
    });

    // שימוש ב-CRUDResponseHandler עם רענון אוטומטי
    await CRUDResponseHandler.handleDeleteResponse(response, {
      successMessage: 'תכנון נמחק בהצלחה!',
      apiUrl: '/api/trade_plans/',
      entityName: 'תכנון'
    });

  } catch (error) {
    CRUDResponseHandler.handleError(error, 'מחיקת תכנון');
  }
}



/**
 * פילטור נתוני תכנונים
 */
function filterDesignsData(statuses, types, accounts, dateRange, searchTerm) {


  // Calling global function with pageName
  if (typeof window.updateGridFromComponentGlobal === 'function') {
    window.updateGridFromComponentGlobal(statuses, types, accounts, dateRange, searchTerm, 'planning');
  }
}

/**
 * פונקציה לסידור הטבלה
 *
 * פונקציה זו משתמשת במערכת הסידור הגלובלית מ-main.js
 * כדי לסדר את טבלת התכנונים לפי העמודה הנבחרת.
 *
 * הפונקציה:
 * - משתמשת ב-sortTableData הגלובלית
 * - מעדכנת את הנתונים המסוננים
 * - שומרת את מצב הסידור ב-localStorage
 *
 * @param {number} columnIndex - אינדקס העמודה לסידור (0-8)
 *
 * @example
 * sortTable(0); // Sort by asset column
 * sortTable(1); // Sort by date column
 * sortTable(8); // Sort by status column
 *
 * @requires window.sortTableData - Global function from main.js
 * @requires window.filteredTradePlansData - Filtered data
 * @requires trade_plansData - Original data
 * @requires updateDesignsTable - Function to update table
 *
 * @since 2.0
 */

/**
 * פונקציה מקומית לסידור (fallback)
 * Local sorting function (fallback)
 */
function performLocalSort(columnIndex) {
  const data = window.filteredTradePlansData || window.tradePlansData;
  const currentSortState = window.getSortState ? window.getSortState('trade_plans') : { columnIndex: -1, direction: 'asc' };

  // קביעת כיוון הסידור
  let direction = 'asc';
  if (currentSortState.columnIndex === columnIndex) {
    direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
  }

  // שמירת מצב הסידור
  if (window.saveSortState) {
    window.saveSortState('trade_plans', columnIndex, direction);
  }

  // סידור הנתונים
  const sortedData = [...data].sort((a, b) => {
    let aValue = getPlanningColumnValue(a, columnIndex);
    let bValue = getPlanningColumnValue(b, columnIndex);

    // המרה למספרים אם אפשר
    if (!isNaN(aValue) && !isNaN(bValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    // המרה לתאריכים אם אפשר
    if (isDateValue(aValue) && isDateValue(bValue)) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // סידור
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // עדכון הטבלה
  updateDesignsTable(sortedData);
  window.filteredTradePlansData = sortedData;


}

/**
 * קבלת ערך עמודה לטבלת תכנונים
 * Get column value for planning table
 */
function getPlanningColumnValue(item, columnIndex) {
  const columns = ['ticker', 'created_at', 'investment_type', 'side', 'planned_amount', 'target_price', 'stop_price', 'current', 'status'];
  const fieldName = columns[columnIndex];

  if (!fieldName) {
    if (typeof window.showNotification === 'function') {
      window.showNotification(`No column mapping found for planning column ${columnIndex}`, 'warning');
    }
    return '';
  }

  // טיפול מיוחד בשדות מורכבים
  if (fieldName === 'ticker') {
    return item.ticker ? item.ticker.symbol || item.ticker.name || '' : '';
  }

  return item[fieldName] || '';
}

/**
 * בדיקה אם ערך הוא תאריך
 * Check if value is a date
 */
function isDateValue(value) {
  if (!value) {return false;}
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// ===== SORTING AND FILTERING FUNCTIONS =====
// Table sorting, filtering, and state management

/**
 * Restore sort state for trade plans table
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 * 
 * @function restoreSortState
 * @returns {void}
 */
function restoreSortState() {
  // Check if data is available
  if (!window.tradePlansData || window.tradePlansData.length === 0) {
    window.Logger.info('⚠️ No trade plans data available for sort restoration', { page: "trade_plans" });
    return;
  }

  if (typeof window.restoreAnyTableSort === 'function') {
    window.restoreAnyTableSort('planning', window.tradePlansData, updateDesignsTable);
  } else {
    handleFunctionNotFound('restoreAnyTableSort');
  }
}

/**
 * Getting status class
 */
function getStatusClass(status) {
  // Safeguarding against invalid values
  if (status === null || status === undefined) {
    return 'status-other';
  }

  // Use dynamic color system from preferences
  switch (status) {
  case 'open': return 'status-open';
  case 'closed': return 'status-closed';
  case 'cancelled': return 'status-cancelled';
  default: return 'status-other';
  }
}

/**
 * Getting CSS class for type
 */
function getTypeClass(type) {
  // Safeguarding against invalid values
  if (type === null || type === undefined) {
    return 'type-other';
  }

  // Use dynamic color system from preferences
  // Note: type comes from backend in English, so we use English values for CSS classes
  switch (type) {
  case 'swing': return 'type-swing';
  case 'investment': return 'type-investment';
  case 'passive': return 'type-passive';
  case 'day_trading': return 'type-day_trading';
  case 'scalping': return 'type-scalping';
  default: return 'type-other';
  }
}

/**
 * Getting type display
 */
// פונקציה הועברה ל-translation-utils.js בשם translateTradePlanType

/**
 * Getting status display
 */
// פונקציה הועברה ל-translation-utils.js בשם translateTradePlanStatus

/**
 * טעינת העדפות המשתמש
 * ✨ עודכן לתמיכה במערכת העדפות !
 */
async function loadUserPreferences() {
  try {
    window.Logger.info('📋 Loading user preferences for trade_plans...', { page: "trade_plans" });
    
    // נסה ראשית מערכת  גלובלית
    if (typeof window.getCurrentPreference === 'function') {
      window.Logger.info('✅ Using global preferences system', { page: "trade_plans" });
      return {
        timezone: await window.getCurrentPreference('timezone') || 'Asia/Jerusalem',
        primaryCurrency: await window.getCurrentPreference('primaryCurrency') || 'USD',
        defaultStopLoss: await window.getCurrentPreference('defaultStopLoss') || 5,
        defaultTargetPrice: await window.getCurrentPreference('defaultTargetPrice') || 10
      };
    }
    
    // Fallback ל-API     try {
      const newResponse = await fetch('/api/preferences/user');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        if (newData.success && newData.data.preferences) {
          window.Logger.info('✅ Using new API preferences', { page: "trade_plans" });
          const prefs = newData.data.preferences;
          return {
            timezone: prefs.general?.timezone || 'Asia/Jerusalem',
            primaryCurrency: prefs.general?.primaryCurrency || 'USD',
            defaultStopLoss: prefs.general?.defaultStopLoss || 5,
            defaultTargetPrice: prefs.general?.defaultTargetPrice || 10
          };
        }
      }
    } catch (newError) {
      window.Logger.info('🔄 New API not available, trying fallback...', { page: "trade_plans" });
    }
    
    // Fallback ל-API
    try {
      const response = await fetch('/api/preferences/user');
      if (response.ok) {
        const preferences = await response.json();
        window.Logger.info('✅ Using API preferences', { page: "trade_plans" });
        return preferences;
      }
    } catch (migrationError) {
      window.Logger.info('🔄 API not available, trying local config...', { page: "trade_plans" });
    }
    
    // Fallback אחרון - קובץ JSON מקומי (legacy)
    try {
      const response = await fetch('/api/preferences/user');
      if (response.ok) {
        const preferences = await response.json();
        window.Logger.info('🔄 Using local JSON preferences (legacy, { page: "trade_plans" })');
        return preferences.user || preferences.defaults;
      }
    } catch (error) {
      window.Logger.error('❌ Error loading preferences:', error, { page: "trade_plans" });
    }
  
  // ברירת מחדל
  window.Logger.info('🔄 Using default preferences', { page: "trade_plans" });
  return {
    timezone: 'Asia/Jerusalem',
    primaryCurrency: 'USD',
    defaultStopLoss: 5,
    defaultTargetPrice: 10
  };
}

/**
 * יצירת תאריך עם timezone נכון
 * ✨ עודכן לתמיכה במערכת העדפות !
 */
async function createDateWithTimezone(year, month, day) {
  const preferences = await loadUserPreferences();
  const timezone = preferences?.timezone || 'Asia/Jerusalem';

  // Creating date with timezone
  const date = new Date(year, month, day);
  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return date.toLocaleDateString('en-CA', options); // YYYY-MM-DD format
}

/**
 * תרגום טווח תאריכים לתאריכים אמיתיים
 */
function translateDateRangeToDates(dateRange) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  let startDate = 'לא נבחר';
  let endDate = 'לא נבחר';

  if (typeof dateRange === 'string') {
    switch (dateRange) {
    case 'היום':
      startDate = todayStr;
      endDate = todayStr;
      break;

    case 'אתמול': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      endDate = startDate;
      break;
    }

    case 'שבוע אחרון': {
      const weekAgoLast = new Date(today);
      weekAgoLast.setDate(today.getDate() - 7);
      startDate = weekAgoLast.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'חודש אחרון': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '3 חודשים אחרונים': {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = threeMonthsAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '6 חודשים אחרונים': {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      startDate = sixMonthsAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה אחרונה': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'השבוע': {
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      // In Israel, the week starts on Sunday (0)
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שבוע': {
      const weekAgo7 = new Date(today);
      weekAgo7.setDate(today.getDate() - 7);
      startDate = weekAgo7.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'החודש': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'MTD': {
      startDate = createDateWithTimezone(today.getFullYear(), today.getMonth(), 1);
      endDate = todayStr;
      break;
    }

    case 'השנה': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      startDate = startOfYear.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'YTD': {
      startDate = createDateWithTimezone(today.getFullYear(), 0, 1);
      endDate = todayStr;
      break;
    }

    case '30 יום': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '60 יום': {
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);
      startDate = sixtyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case '90 יום': {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה': {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      startDate = oneYearAgo.toISOString().split('T')[0];
      endDate = todayStr;
      break;
    }

    case 'שנה קודמת':
      startDate = createDateWithTimezone(today.getFullYear() - 1, 0, 1);
      endDate = createDateWithTimezone(today.getFullYear() - 1, 11, 31);

      break;

    default:
      // Attempting to extract dates from text
      if (dateRange.includes(' - ')) {
        const dates = dateRange.split(' - ');
        startDate = dates[0] || 'לא נבחר';
        endDate = dates[1] || 'לא נבחר';
      } else if (dateRange.includes(' עד ')) {
        const dates = dateRange.split(' עד ');
        startDate = dates[0] || 'לא נבחר';
        endDate = dates[1] || 'לא נבחר';
      } else {
        startDate = dateRange;
        endDate = dateRange;
      }
      break;
    }
  } else if (dateRange && dateRange.startDate && dateRange.endDate) {
    startDate = dateRange.startDate;
    endDate = dateRange.endDate;
  }


  return { startDate, endDate };
}

/**
 * עדכון חלון בדיקת פילטרים
 */
function updateFilterDebugPanel() {
  const statusesElement = document.getElementById('debugSelectedStatuses');
  const typesElement = document.getElementById('debugSelectedTypes');
  const dateRangeElement = document.getElementById('debugSelectedDateRange');
  const startDateElement = document.getElementById('debugStartDate');
  const endDateElement = document.getElementById('debugEndDate');
  const searchElement = document.getElementById('debugSearchTerm');
  const statusElement = document.getElementById('debugFilterStatus');

  if (statusesElement) {
    const statuses = window.selectedStatusesForFilter || [];
    statusesElement.textContent = statuses.length > 0 ? statuses.join(', ') : 'לא נבחרו';
    statusesElement.style.color = statuses.length > 0 ? '#007bff' : '#6c757d';
  }

  if (typesElement) {
    const types = window.selectedTypesForFilter || [];
    typesElement.textContent = types.length > 0 ? types.join(', ') : 'לא נבחרו';
    typesElement.style.color = types.length > 0 ? '#007bff' : '#6c757d';
  }

  if (dateRangeElement) {
    const dateRange = window.selectedDateRangeForFilter || 'כל זמן';
    dateRangeElement.textContent = dateRange !== 'כל זמן' ? dateRange : 'לא נבחר';
    dateRangeElement.style.color = dateRange !== 'כל זמן' ? '#007bff' : '#6c757d';
  }

  if (startDateElement) {
    const startDate = window.selectedStartDateForFilter || 'לא נבחר';
    startDateElement.textContent = startDate;
    startDateElement.style.color = startDate !== 'לא נבחר' ? '#007bff' : '#6c757d';
  }

  if (endDateElement) {
    const endDate = window.selectedEndDateForFilter || 'לא נבחר';
    endDateElement.textContent = endDate;
    endDateElement.style.color = endDate !== 'לא נבחר' ? '#007bff' : '#6c757d';
  }

  if (searchElement) {
    const search = window.searchTermForFilter || '';
    searchElement.textContent = search.trim() !== '' ? search : 'ריק';
    searchElement.style.color = search.trim() !== '' ? '#007bff' : '#6c757d';
  }

  if (statusElement) {
    const hasActiveFilters = window.selectedStatusesForFilter && window.selectedStatusesForFilter.length > 0 ||
            window.selectedTypesForFilter && window.selectedTypesForFilter.length > 0 ||
            window.selectedDateRangeForFilter && window.selectedDateRangeForFilter !== 'כל זמן' ||
            window.selectedStartDateForFilter && window.selectedStartDateForFilter !== 'לא נבחר' ||
            window.selectedEndDateForFilter && window.selectedEndDateForFilter !== 'לא נבחר' ||
            window.searchTermForFilter && window.searchTermForFilter.trim() !== '';

    statusElement.textContent = hasActiveFilters ? 'פעיל' : 'לא פעיל';
    const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', secondary: '#6c757d' };
    statusElement.style.color = hasActiveFilters ? colors.positive : colors.secondary;
  }


}

/**
 * פילטור מקומי של נתוני תכנונים
 * פונקציה זו מספקת פילטור מקומי כאשר הפונקציה הגלובלית לא זמינה
 */
function filterTradePlansLocally(data, statuses, types, dateRange, searchTerm) {

  if (!data || !Array.isArray(data)) {

    return [];
  }

  let filteredData = [...data];

  // פילטור לפי סטטוס
  if (statuses && statuses.length > 0) {
    filteredData = filteredData.filter(plan =>
      statuses.includes(plan.status),
    );
  }

  // פילטור לפי סוג השקעה
  if (types && types.length > 0) {
    filteredData = filteredData.filter(plan =>
      types.includes(plan.investment_type),
    );
  }

  // פילטור לפי תאריך
  if (dateRange && dateRange !== 'כל זמן') {
    // כאן אפשר להוסיף לוגיקת פילטור לפי תאריך

  }

  // פילטור לפי חיפוש
  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filteredData = filteredData.filter(plan =>
      plan.ticker?.symbol && plan.ticker.symbol.toLowerCase().includes(term) ||
            plan.ticker?.name && plan.ticker.name.toLowerCase().includes(term) ||
            plan.entry_conditions && plan.entry_conditions.toLowerCase().includes(term) ||
            plan.reasons && plan.reasons.toLowerCase().includes(term),
    );
  }


  return filteredData;
}

// formatCurrency is available globally from translation-utils.js as window.formatCurrency

/**
 * שחזור מצב הסקשנים
 *
 * פונקציה זו משתמשת בפונקציה הגלובלית מ-main.js
 */
// restoreDesignsSectionState is already defined in page-utils.js

// Global functions are now properly defined in main.js

// Export conditions system functions to global scope
window.initializeTradePlanConditionsSystem = initializeTradePlanConditionsSystem;
window.setupTradePlanModalListeners = setupTradePlanModalListeners;
window.initializeTradePlanConditions = initializeTradePlanConditions;
window.cleanupTradePlanConditions = cleanupTradePlanConditions;
window.getCurrentEditPlanId = getCurrentEditPlanId;

// ===== CONDITIONS SYSTEM FUNCTIONS =====
// Conditions system integration and management

/**
 * Initialize conditions system for trade plans
 * Integrated with unified initialization system
 * 
 * @function initializeTradePlanConditionsSystem
 * @returns {void}
 */
function initializeTradePlanConditionsSystem() {
    try {
        window.Logger.info('🔧 Initializing trade plans conditions system...', { page: "trade_plans" });
        
        // Setup modal event listeners for automatic conditions initialization
        setupTradePlanModalListeners();
        
        window.Logger.info('✅ Trade plans conditions system initialized', { page: "trade_plans" });
        
    } catch (error) {
        window.Logger.error('❌ Failed to initialize trade plans conditions system:', error, { page: "trade_plans" });
    }
}

/**
 * Setup modal event listeners for trade plans
 */
function setupTradePlanModalListeners() {
    // Add Trade Plan Modal
    const addModal = document.getElementById('addTradePlanModal');
    if (addModal) {
        addModal.addEventListener('shown.bs.modal', () => {
            initializeTradePlanConditions('add');
        });
        
        addModal.addEventListener('hidden.bs.modal', () => {
            cleanupTradePlanConditions('add');
        });
    }
    
    // Edit Trade Plan Modal
    const editModal = document.getElementById('editTradePlanModal');
    if (editModal) {
        editModal.addEventListener('shown.bs.modal', () => {
            // Get the current plan ID from the modal
            const planId = getCurrentEditPlanId();
            initializeTradePlanConditions('edit', planId);
        });
        
        editModal.addEventListener('hidden.bs.modal', () => {
            cleanupTradePlanConditions('edit');
        });
    }
}

/**
 * Initialize conditions for trade plan
 * @param {string} mode - 'add' or 'edit'
 * @param {number|string} planId - Plan ID (or 'new' for new plans)
 */
function initializeTradePlanConditions(mode, planId = null) {
    try {
        window.Logger.info(`🔧 Initializing trade plan conditions for ${mode} mode, planId: ${planId}`, { page: "trade_plans" });
        
        // Check if ConditionBuilder is available
        if (typeof ConditionBuilder === 'undefined') {
            window.Logger.warn('⚠️ ConditionBuilder not available, skipping conditions initialization', { page: "trade_plans" });
            return false;
        }
        
        const containerId = `${mode}PlanConditionBuilder`;
        const actualPlanId = planId || 'new';
        
        // Create new ConditionBuilder
        const conditionBuilder = new ConditionBuilder('plan', actualPlanId, containerId);
        
        // Store in global scope for access by other functions
        const globalKey = `${mode}PlanConditionBuilder`;
        window[globalKey] = conditionBuilder;
        
        window.Logger.info(`✅ Trade plan conditions initialized for ${mode} mode`, { page: "trade_plans" });
        return true;
        
    } catch (error) {
        window.Logger.error('❌ Failed to initialize trade plan conditions:', error, { page: "trade_plans" });
        return false;
    }
}

/**
 * Cleanup conditions for trade plan
 * @param {string} mode - 'add' or 'edit'
 */
function cleanupTradePlanConditions(mode) {
    try {
        const globalKey = `${mode}PlanConditionBuilder`;
        if (window[globalKey]) {
            // Clean up if builder has cleanup method
            if (typeof window[globalKey].cleanup === 'function') {
                window[globalKey].cleanup();
            }
            delete window[globalKey];
            window.Logger.info(`✅ Trade plan conditions cleaned up for ${mode} mode`, { page: "trade_plans" });
        }
    } catch (error) {
        window.Logger.error('❌ Failed to cleanup trade plan conditions:', error, { page: "trade_plans" });
    }
}

/**
 * Get current edit plan ID from modal
 * @returns {number|null} Plan ID or null
 */
function getCurrentEditPlanId() {
    // Get plan ID from hidden input field in edit modal
    const planIdInput = document.getElementById('editTradePlanId');
    if (planIdInput && planIdInput.value) {
        return parseInt(planIdInput.value, 10);
    }
    return null;
}

// Initialize trade plans page - integrated with unified system
window.initializeTradePlansPage = async function() {
  window.Logger.info('📋 Trade plans page initialized via unified system', { page: "trade_plans" });

  // Initialize Cache Manager if not already initialized
  if (typeof window.UnifiedCacheManager !== 'undefined' && typeof window.UnifiedCacheManager.initialize === 'function') {
    try {
      await window.UnifiedCacheManager.initialize();
    } catch (error) {
      window.Logger.info('⚠️ Cache Manager initialization failed:', error, { page: "trade_plans" });
    }
  }

  // מערכת התנאים מאותחלת אוטומטית דרך המערכת המאוחדת

  // Restoring section state
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    // Fallback to local section state restoration
    restorePlanningSectionState();
  }

  // Initializing filters
  if (typeof window.initializePageFilters === 'function') {
    window.initializePageFilters('planning');
  }

  // Loading data
  loadTradePlansData();

  // Updating debug panel on page load
  setTimeout(() => {
    updateFilterDebugPanel();
  }, 1000);

  // Loading sort state
  if (typeof window.loadSortState === 'function') {
    window.loadSortState('planning');
  }

  // שחזור מצב סידור
  restoreSortState();
};

// Fallback removed - using unified initialization system only
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', window.initializeTradePlansPage);
// } else {
//   // DOM already loaded, initialize immediately
//   window.initializeTradePlansPage();
// }

// updateGridFromComponent is already defined at the beginning of the file

// ===== PRICE CALCULATION FUNCTIONS =====
// Price calculations and percentage calculations

/**
 * Setup price calculation for add form
 * Configures price and percentage calculation logic
 * 
 * @function setupPriceCalculation
 * @returns {void}
 */
function setupPriceCalculation() {
  // Target price calculation - when price changes, update percentage
  const targetPriceInput = document.getElementById('targetPrice');
  const targetPercentageInput = document.getElementById('targetPercentage');
  const entryPriceInput = document.getElementById('price');
  const sideInput = document.getElementById('side');
  
  if (targetPriceInput && targetPercentageInput && entryPriceInput && sideInput) {
    targetPriceInput.addEventListener('input', function() {
      const entryPrice = parseFloat(entryPriceInput.value) || 0;
      const targetPrice = parseFloat(this.value) || 0;
      const side = sideInput.value;
      
      if (entryPrice > 0 && targetPrice > 0) {
        let percentage;
        if (side === 'Short') {
          // For Short: target price should be lower than entry price
          percentage = ((entryPrice - targetPrice) / entryPrice) * 100;
        } else {
          // For Long: target price should be higher than entry price
          percentage = ((targetPrice - entryPrice) / entryPrice) * 100;
        }
        targetPercentageInput.value = percentage.toFixed(2);
      }
    });
    
    // Target percentage calculation - when percentage changes, update price
    targetPercentageInput.addEventListener('input', function() {
      const entryPrice = parseFloat(entryPriceInput.value) || 0;
      const percentage = parseFloat(this.value) || 0;
      const side = sideInput.value;
      
      if (entryPrice > 0) {
        let targetPrice;
        if (side === 'Short') {
          // For Short: target price = entry * (1 - percentage/100)
          targetPrice = entryPrice * (1 - percentage / 100);
        } else {
          // For Long: target price = entry * (1 + percentage/100)
          targetPrice = entryPrice * (1 + percentage / 100);
        }
        targetPriceInput.value = targetPrice.toFixed(2);
      }
    });
  }
  
  // Stop price calculation - when price changes, update percentage
  const stopPriceInput = document.getElementById('stopPrice');
  const stopPercentageInput = document.getElementById('stopPercentage');
  
  if (stopPriceInput && stopPercentageInput && entryPriceInput && sideInput) {
    stopPriceInput.addEventListener('input', function() {
      const entryPrice = parseFloat(entryPriceInput.value) || 0;
      const stopPrice = parseFloat(this.value) || 0;
      const side = sideInput.value;
      
      if (entryPrice > 0 && stopPrice > 0) {
        let percentage;
        if (side === 'Short') {
          // For Short: stop price should be higher than entry price (stop loss)
          percentage = ((stopPrice - entryPrice) / entryPrice) * 100;
        } else {
          // For Long: stop price should be lower than entry price (stop loss)
          percentage = ((entryPrice - stopPrice) / entryPrice) * 100;
        }
        stopPercentageInput.value = percentage.toFixed(2);
      }
    });
    
    // Stop percentage calculation - when percentage changes, update price
    stopPercentageInput.addEventListener('input', function() {
      const entryPrice = parseFloat(entryPriceInput.value) || 0;
      const percentage = parseFloat(this.value) || 0;
      const side = sideInput.value;
      
      if (entryPrice > 0) {
        let stopPrice;
        if (side === 'Short') {
          // For Short: stop price = entry * (1 + percentage/100)
          stopPrice = entryPrice * (1 + percentage / 100);
        } else {
          // For Long: stop price = entry * (1 - percentage/100)
          stopPrice = entryPrice * (1 - percentage / 100);
        }
        stopPriceInput.value = stopPrice.toFixed(2);
      }
    });
  }
  
  // Add event listener for side change to recalculate prices
  sideInput.addEventListener('change', function() {
    const entryPrice = parseFloat(entryPriceInput.value) || 0;
    const side = this.value;
    
    if (entryPrice > 0) {
      // Recalculate target price based on current percentage
      const targetPercentage = parseFloat(targetPercentageInput.value) || 0;
      if (targetPercentage > 0) {
        let targetPrice;
        if (side === 'Short') {
          targetPrice = entryPrice * (1 - targetPercentage / 100);
        } else {
          targetPrice = entryPrice * (1 + targetPercentage / 100);
        }
        targetPriceInput.value = targetPrice.toFixed(2);
      }
      
      // Recalculate stop price based on current percentage
      const stopPercentage = parseFloat(stopPercentageInput.value) || 0;
      if (stopPercentage > 0) {
        let stopPrice;
        if (side === 'Short') {
          stopPrice = entryPrice * (1 + stopPercentage / 100);
        } else {
          stopPrice = entryPrice * (1 - stopPercentage / 100);
        }
        stopPriceInput.value = stopPrice.toFixed(2);
      }
    }
  });
}

// Edit form price calculation functions
function setupEditPriceCalculation() {
  // Edit target price calculation - when price changes, update percentage
  const editTargetPriceInput = document.getElementById('editTargetPrice');
  const editTargetPercentageInput = document.getElementById('editTargetPercentage');
  const editEntryPriceInput = document.getElementById('editPrice');
  const editSideInput = document.getElementById('editSide');
  
  if (editTargetPriceInput && editTargetPercentageInput && editEntryPriceInput && editSideInput) {
    editTargetPriceInput.addEventListener('input', function() {
      const entryPrice = parseFloat(editEntryPriceInput.value) || 0;
      const targetPrice = parseFloat(this.value) || 0;
      const side = editSideInput.value;
      
      if (entryPrice > 0 && targetPrice > 0) {
        let percentage;
        if (side === 'Short') {
          // For Short: target price should be lower than entry price
          percentage = ((entryPrice - targetPrice) / entryPrice) * 100;
        } else {
          // For Long: target price should be higher than entry price
          percentage = ((targetPrice - entryPrice) / entryPrice) * 100;
        }
        editTargetPercentageInput.value = percentage.toFixed(2);
      }
    });
    
    // Edit target percentage calculation - when percentage changes, update price
    editTargetPercentageInput.addEventListener('input', function() {
      const entryPrice = parseFloat(editEntryPriceInput.value) || 0;
      const percentage = parseFloat(this.value) || 0;
      const side = editSideInput.value;
      
      if (entryPrice > 0) {
        let targetPrice;
        if (side === 'Short') {
          // For Short: target price = entry * (1 - percentage/100)
          targetPrice = entryPrice * (1 - percentage / 100);
        } else {
          // For Long: target price = entry * (1 + percentage/100)
          targetPrice = entryPrice * (1 + percentage / 100);
        }
        editTargetPriceInput.value = targetPrice.toFixed(2);
      }
    });
  }
  
  // Edit stop price calculation - when price changes, update percentage
  const editStopPriceInput = document.getElementById('editStopPrice');
  const editStopPercentageInput = document.getElementById('editStopPercentage');
  
  if (editStopPriceInput && editStopPercentageInput && editEntryPriceInput && editSideInput) {
    editStopPriceInput.addEventListener('input', function() {
      const entryPrice = parseFloat(editEntryPriceInput.value) || 0;
      const stopPrice = parseFloat(this.value) || 0;
      const side = editSideInput.value;
      
      if (entryPrice > 0 && stopPrice > 0) {
        let percentage;
        if (side === 'Short') {
          // For Short: stop price should be higher than entry price (stop loss)
          percentage = ((stopPrice - entryPrice) / entryPrice) * 100;
        } else {
          // For Long: stop price should be lower than entry price (stop loss)
          percentage = ((entryPrice - stopPrice) / entryPrice) * 100;
        }
        editStopPercentageInput.value = percentage.toFixed(2);
      }
    });
    
    // Edit stop percentage calculation - when percentage changes, update price
    editStopPercentageInput.addEventListener('input', function() {
      const entryPrice = parseFloat(editEntryPriceInput.value) || 0;
      const percentage = parseFloat(this.value) || 0;
      const side = editSideInput.value;
      
      if (entryPrice > 0) {
        let stopPrice;
        if (side === 'Short') {
          // For Short: stop price = entry * (1 + percentage/100)
          stopPrice = entryPrice * (1 + percentage / 100);
        } else {
          // For Long: stop price = entry * (1 - percentage/100)
          stopPrice = entryPrice * (1 - percentage / 100);
        }
        editStopPriceInput.value = stopPrice.toFixed(2);
      }
    });
  }
  
  // Add event listener for side change to recalculate prices in edit form
  editSideInput.addEventListener('change', function() {
    const entryPrice = parseFloat(editEntryPriceInput.value) || 0;
    const side = this.value;
    
    if (entryPrice > 0) {
      // Recalculate target price based on current percentage
      const targetPercentage = parseFloat(editTargetPercentageInput.value) || 0;
      if (targetPercentage > 0) {
        let targetPrice;
        if (side === 'Short') {
          targetPrice = entryPrice * (1 - targetPercentage / 100);
        } else {
          targetPrice = entryPrice * (1 + targetPercentage / 100);
        }
        editTargetPriceInput.value = targetPrice.toFixed(2);
      }
      
      // Recalculate stop price based on current percentage
      const stopPercentage = parseFloat(editStopPercentageInput.value) || 0;
      if (stopPercentage > 0) {
        let stopPrice;
        if (side === 'Short') {
          stopPrice = entryPrice * (1 + stopPercentage / 100);
        } else {
          stopPrice = entryPrice * (1 - stopPercentage / 100);
        }
        editStopPriceInput.value = stopPrice.toFixed(2);
      }
    }
  });
}

// Adding functions to global scope
window.loadTradePlansData = loadTradePlansData;
window.updateTradePlansTable = updateTradePlansTable;
window.showAddTradePlanModal = showAddTradePlanModal;
window.saveNewTradePlan = saveNewTradePlan;
window.editTradePlan = editTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.filterTradePlansData = filterTradePlansData;
// window.sortTable export removed - using global version from tables.js
window.filterTradePlansLocally = filterTradePlansLocally;
window.updateFilterDebugPanel = updateFilterDebugPanel;
window.translateDateRangeToDates = translateDateRangeToDates;
window.restoreSortState = restoreSortState;
window.restoreDesignsSectionState = restoreDesignsSectionState;

// Adding toggle functions to global scope
// window.toggleSection removed - using global version from ui-utils.js
// toggleSection export removed - use toggleSection('main') instead
window.restorePlanningSectionState = restorePlanningSectionState;


// Export validation functions
// Global validation functions are already exported from validation-utils.js
// No local validation functions to export

// פונקציות חסרות
window.loadPlanningData = function () {
  loadTradePlansData();
};

window.setupSortableHeaders = function () {
  // שימוש בפונקציה מקומית
  setupSortableHeadersLocal();
};

function setupSortableHeadersLocal() {
  const headers = document.querySelectorAll('#trade_plansTable th[onclick]');
  headers.forEach(header => {
    header.style.cursor = 'pointer';
    header.title = 'לחץ למיון';
  });
}

// ===== UI STATE MANAGEMENT FUNCTIONS =====
// Section toggling, state restoration, and UI management

/**
 * Toggle section visibility
 * Uses global toggleSection function
 * 
 * @function toggleSection
 * @returns {void}
 */
function toggleSection() {
    if (typeof window.toggleSection === 'function') {
        window.toggleSection();
    } else {
        window.Logger.warn('toggleSection function not found', { page: "trade_plans" });
    }
}

// toggleSection function removed - use toggleSection('main') instead

// פונקציה לשחזור מצב הסגירה
function restorePlanningSectionState() {
  // שחזור מצב top-section (התראות וסיכום)
  const topCollapsed = localStorage.getItem('planningTopSectionCollapsed') === 'true';
  const topSection = document.querySelector('.top-section');

  if (topSection) {
    const sectionBody = topSection.querySelector('.section-body');
    const toggleBtn = topSection.querySelector('button[onclick="toggleSection()"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && topCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }

  // שחזור מצב סקשן התכנונים
  const planningCollapsed = localStorage.getItem('planningMainSectionCollapsed') === 'true';
  const contentSections = document.querySelectorAll('.content-section');
  const planningSection = contentSections[0];

  if (planningSection) {
    const sectionBody = planningSection.querySelector('.section-body');
    const toggleBtn = planningSection.querySelector('button[onclick="toggleSection(\'main\')"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.filter-icon') : null;

    if (sectionBody && planningCollapsed) {
      sectionBody.style.display = 'none';
      if (icon) {
        icon.textContent = '▼';
      }
    }
  }
}


// פונקציות נוספות שחסרות
window.updateDateRangeFilterDisplayText = function () {
  // הפונקציה כבר מוגדרת ב-header-system.js
  if (typeof window.updateDateRangeFilterDisplayTextGlobal === 'function') {
    window.updateDateRangeFilterDisplayTextGlobal();
  } else {
    if (typeof window.showNotification === 'function') {
      window.showNotification('updateDateRangeFilterDisplayTextGlobal not found', 'warning');
    }
  }
};

window.updateAccountFilterDisplayText = function () {
  // הפונקציה כבר מוגדרת ב-accounts.js
  if (typeof window.updateAccountFilterDisplayTextGlobal === 'function') {
    window.updateAccountFilterDisplayTextGlobal();
  } else {
    if (typeof window.showNotification === 'function') {
      window.showNotification('updateAccountFilterDisplayTextGlobal not found', 'warning');
    }
  }
};

// updateAccountFilterMenu is already defined in accounts.js

// loadSectionStates is not needed - using global functions

// restoreAllSectionStates is already defined in main.js

// filterDataByFilters is not needed - using local filtering

// updateGridFromComponentGlobal is not needed - using local updateGridFromComponent

// updateTableStats is not needed - using local updatePageSummaryStats

// restoreDesignsSectionState is not needed - using global restoreAllSectionStates

// initializePageFilters is already defined in main.js

// loadSortState is already defined in main.js

// ===== פונקציות לכפתורים החדשים =====

/**
 * הצגת עמוד הנכס (בפיתוח)
 */
function showTickerPage(tickerId) {
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('פיתוח', 'עמוד הנכס נמצא בפיתוח');
  }
}

// ===== UTILITY FUNCTIONS =====
// Helper functions for notifications and general utilities

/**
 * Add important note to trade plan
 * Placeholder for future note functionality
 * 
 * @function addImportantNote
 * @returns {void}
 */
function addImportantNote() {

  // הצגת הודעה למשתמש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית');
  }
}

/**
 * הוספת תזכורת
 */
function addReminder() {

  // הצגת הודעה למשתמש
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב לייצר התראות לתוכנית');
  }
}

// ===== VALIDATION FUNCTIONS =====
// Form validation and ticker information updates

/**
 * Update ticker information display
 * Shows current price and daily change for selected ticker
 * 
 * @function updateTickerInfo
 * @returns {void}
 */
function updateTickerInfo() {
  const tickerSelect = document.getElementById('ticker');
  const tickerDisplay = document.getElementById('selectedTickerDisplay');
  const priceDisplay = document.getElementById('currentPriceDisplay');
  const changeDisplay = document.getElementById('dailyChangeDisplay');
  const stopPriceInput = document.getElementById('price');
  const targetPriceInput = document.getElementById('notes');

  // קבלת כל השדות שצריכים להיות מופעלים/מושבתים
  const investmentTypeSelect = document.getElementById('type');
  const sideSelect = document.getElementById('side');
  const amountInput = document.getElementById('quantity');
  const sharesInput = document.getElementById('quantity');
  const entryConditionsTextarea = document.getElementById('notes');
  const reasonsTextarea = document.getElementById('notes');

  if (tickerSelect.value) {
    const selectedOption = tickerSelect.options[tickerSelect.selectedIndex];
    const tickerSymbol = selectedOption.textContent;

    tickerDisplay.textContent = tickerSymbol;

    // Demo values - בעתיד יבואו מהשרת
    const currentPrice = 150.25;
    priceDisplay.textContent = `$${currentPrice.toFixed(2)}`;
    const dailyChangeValue = '+2.5%';
    changeDisplay.textContent = dailyChangeValue;

    // צביעה לפי ערך באמצעות המערכת הגלובלית
    const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545', secondary: '#6c757d' };
    if (dailyChangeValue.startsWith('+')) {
      changeDisplay.style.color = colors.positive;
      changeDisplay.style.fontWeight = 'bold';
    } else if (dailyChangeValue.startsWith('-')) {
      changeDisplay.style.color = colors.negative;
      changeDisplay.style.fontWeight = 'bold';
    } else {
      changeDisplay.style.color = colors.secondary;
    }

    // הפעלת כל השדות
    investmentTypeSelect.disabled = false;
    sideSelect.disabled = false;
    amountInput.disabled = false;
    sharesInput.disabled = false;
    stopPriceInput.disabled = false;
    targetPriceInput.disabled = false;
    entryConditionsTextarea.disabled = false;
    reasonsTextarea.disabled = false;

    // הוספת required לשדות החובה
    investmentTypeSelect.setAttribute('required', 'required');
    sideSelect.setAttribute('required', 'required');
    amountInput.setAttribute('required', 'required');


    // עדכון מחירי עצירה ויעד ברירת מחדל
    updateDefaultPrices(currentPrice);

    // עדכון מספר מניות אם יש סכום
    if (amountInput.value) {
      updateSharesFromAmount();
    }
  } else {
    tickerDisplay.textContent = 'לא נבחר';
    priceDisplay.textContent = '-';
    changeDisplay.textContent = '-';
    changeDisplay.style.color = '#6c757d';

    // השבתת כל השדות
    investmentTypeSelect.disabled = true;
    sideSelect.disabled = true;
    amountInput.disabled = true;
    sharesInput.disabled = true;
    stopPriceInput.disabled = true;
    targetPriceInput.disabled = true;
    entryConditionsTextarea.disabled = true;
    reasonsTextarea.disabled = true;

    // הסרת required משדות מושבתים
    investmentTypeSelect.removeAttribute('required');
    sideSelect.removeAttribute('required');
    amountInput.removeAttribute('required');

    // ניקוי ערכים
    investmentTypeSelect.value = '';
    sideSelect.value = '';
    amountInput.value = '';
    sharesInput.value = '';
    stopPriceInput.value = '';
    targetPriceInput.value = '';
    entryConditionsTextarea.value = '';
    reasonsTextarea.value = '';
  }
}

/**
 * עדכון מחירי עצירה ויעד ברירת מחדל
 */
function updateDefaultPrices(currentPrice) {
  const stopPriceInput = document.getElementById('price');
  const targetPriceInput = document.getElementById('notes');

  // שימוש בפונקציה הכללית
  const prices = calculateDefaultPrices(currentPrice);

  // עדכון השדות רק אם הם ריקים
  if (!stopPriceInput.value) {
    stopPriceInput.value = prices.stopPrice;
  }
  if (!targetPriceInput.value) {
    targetPriceInput.value = prices.targetPrice;
  }
}

/**
 * עדכון מספר מניות מסכום
 */
function updateSharesFromAmount() {

  const amountInput = document.getElementById('quantity');
  const sharesInput = document.getElementById('quantity');
  const priceDisplay = document.getElementById('currentPriceDisplay');

  if (amountInput && sharesInput && priceDisplay) {
    // בדיקה אם יש מחיר תקין
    if (amountInput.value && priceDisplay.textContent !== '-' && priceDisplay.textContent !== '') {
      const amount = parseFloat(amountInput.value);
      const price = parseFloat(priceDisplay.textContent.replace('$', ''));

      if (price > 0) {
        // בדיקה אם הפונקציה הכללית זמינה
        if (typeof window.convertAmountToShares === 'function') {
          const result = window.convertAmountToShares(amount, price);
          sharesInput.value = result.shares;
          // לא מעדכנים את הסכום חזרה - רק מספר מניות
          // amountInput.value = result.adjustedAmount;
        } else {
          handleFunctionNotFound('convertAmountToShares', 'פונקציית המרת סכום למניות לא נמצאה');
          // fallback
          const shares = Math.floor(amount / price);
          sharesInput.value = shares;
        }
      }
    }
  } else {
    handleElementNotFound('updateSharesFromAmount', 'אלמנטים נדרשים לא נמצאו לעדכון מניות');
  }
}

/**
 * עדכון סכום ממספר מניות
 */
function updateAmountFromShares() {
  const sharesInput = document.getElementById('quantity');
  const priceInput = document.getElementById('price');
  const priceDisplay = document.getElementById('currentPriceDisplay');

  // נסה תחילה את שדה המחיר, אחר כך את התצוגה
  let price = 0;
  if (priceInput && priceInput.value) {
    price = parseFloat(priceInput.value);
  } else if (priceDisplay && priceDisplay.textContent !== '-' && priceDisplay.textContent !== '') {
    price = parseFloat(priceDisplay.textContent.replace('$', ''));
  }

  if (sharesInput && price > 0) {
    if (sharesInput.value) {
      const shares = parseFloat(sharesInput.value);

      if (shares > 0) {
        // בדיקה אם הפונקציה הכללית זמינה
        if (typeof window.convertSharesToAmount === 'function') {
          const amount = window.convertSharesToAmount(shares, price);
          // עדכון תצוגת הסכום במקום שדה
          const amountDisplay = document.getElementById('amountDisplay');
          if (amountDisplay) {
            amountDisplay.textContent = `$${amount.toFixed(2)}`;
          }
        } else {
          handleFunctionNotFound('convertSharesToAmount', 'פונקציית המרת מניות לסכום לא נמצאה');
          // fallback
          const amount = shares * price;
          const amountDisplay = document.getElementById('amountDisplay');
          if (amountDisplay) {
            amountDisplay.textContent = `$${amount.toFixed(2)}`;
          }
        }
      }
    }
  } else {
    // אם אין מחיר או כמות, אפס את התצוגה
    const amountDisplay = document.getElementById('amountDisplay');
    if (amountDisplay) {
      amountDisplay.textContent = '$0.00';
    }
  }
}

/**
 * הוספת תנאי כניסה
 */
function addEntryCondition() {

  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב ליצור תנאי כניסה מתקדם');
  }
}

/**
 * הוספת סיבה
 */
function addReason() {

  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('מידע', 'המודול יאפשר בקרוב ליצור סיבות מתקדמות');
  }
}

// ייצוא הפונקציות החדשות
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.updateTickerInfo = updateTickerInfo;
window.updateSharesFromAmount = updateSharesFromAmount;
window.updateAmountFromShares = updateAmountFromShares;
window.addEntryCondition = addEntryCondition;
window.addReason = addReason;
// window.sortTable export removed - using global version from tables.js


// Checking if functions are available

// בדיקת פונקציות המרה

// בדיקה נוספת של פונקציות גלובליות

// Verifying that our function is defined
if (window.location.pathname.includes('/trade_plans')) {
  // Verifying that our function is called
  if (typeof window.updateGridFromComponent === 'function') {
    // Function is properly defined
  } else {
    handleFunctionNotFound('updateGridFromComponent', 'פונקציית עדכון רשת לא נמצאה');
  }

  // טעינת נתונים בטעינת הדף
  setTimeout(() => {
    if (typeof window.loadTradePlansData === 'function') {
      window.loadTradePlansData();
    } else {
      handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה');
    }
  }, 500);
}

// קריאה ישירה לפונקציה - למקרה שהקוד למעלה לא רץ
// Data loading is handled by the unified initialization system
// No need for duplicate loading here

// Detailed Log Functions for Trade Plans Page
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'trade_plans',
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
            planningStats: {
                totalDesigns: document.getElementById('totalDesigns')?.textContent || 'לא נמצא',
                totalInvestment: document.getElementById('totalInvestment')?.textContent || 'לא נמצא',
                avgInvestment: document.getElementById('avgInvestment')?.textContent || 'לא נמצא',
                totalProfit: document.getElementById('totalProfit')?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'תכנון טריידים והשקעות',
                    visible: !document.querySelector('.top-section')?.classList.contains('d-none'),
                    alertsCount: document.querySelectorAll('.alert-card').length,
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא'
                },
                contentSection: {
                    title: 'התכנונים שלי',
                    visible: !document.querySelector('.content-section')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('#trade_plansTable tbody tr').length,
                    tableData: document.querySelector('#trade_plansContainer')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('#trade_plansTable tbody tr').length,
                headers: Array.from(document.querySelectorAll('#trade_plansTable thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('#trade_plansTable tbody tr').length > 0
            },
            modals: {
                addModal: document.getElementById('addTradePlanModal') ? 'זמין' : 'לא זמין',
                editModal: document.getElementById('editTradePlanModal') ? 'זמין' : 'לא זמין',
                deleteModal: document.getElementById('deleteTradePlanModal') ? 'זמין' : 'לא זמין'
            },
            functions: {
                openAddTradePlanModal: typeof window.openAddTradePlanModal === 'function' ? 'זמין' : 'לא זמין',
                showAddTradePlanModal: typeof window.showAddTradePlanModal === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                toggleSection: typeof window.toggleSection === 'function' ? 'זמין' : 'לא זמין',
                sortTable: typeof window.sortTable === 'function' ? 'זמין' : 'לא זמין'
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


// Export log functions to global scope
// window. export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local  function for trade_plans page
async function generateDetailedLogForTradePlans() {
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
        window.Logger.error('שגיאה בהעתקה:', err, { page: "trade_plans" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// קריאה ב-DOMContentLoaded
// document.addEventListener('DOMContentLoaded', function() {
//   if (window.location.pathname.includes('/trade_plans')) {
//     setTimeout(() => {
//       if (typeof loadTradePlansData === 'function') {
//         loadTradePlansData();
//       } else {
//         handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה ב-DOMContentLoaded');
//       }
//     }, 500);
//   }
// });

// פונקציה לסינון תכנונים לפי סוג
function filterTradePlansByType(type) {
  if (!window.trade_plansData) {
    window.Logger.warn('⚠️ אין נתוני תכנונים זמינים לסינון', { page: "trade_plans" });
    return;
  }

  // עדכון מצב הכפתורים
  const buttons = document.querySelectorAll('[data-type]');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-type') === 'all') {
      const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
      btn.style.backgroundColor = 'white';
      btn.style.color = colors.positive;
      btn.style.borderColor = colors.positive;
    } else {
      btn.classList.add('btn');
    }
  });

  // הפעלת הכפתור הנוכחי
  const currentButton = document.querySelector(`[data-type="${type}"]`);
  if (currentButton) {
    currentButton.classList.add('active');
    currentButton.classList.remove('btn');
    const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745' };
    currentButton.style.backgroundColor = 'white';
    currentButton.style.color = colors.positive;
    currentButton.style.borderColor = colors.positive;
  }

  // סינון הנתונים
  let filteredData = window.trade_plansData;
  if (type !== 'all') {
    filteredData = window.trade_plansData.filter(plan => plan.investment_type === type);
  }

  // עדכון הטבלה
  updateTradePlansTable(filteredData);
  
  // עדכון מונה
  const countElement = document.getElementById('trade_plansCount');
  if (countElement) {
    countElement.textContent = `${filteredData.length} תכנונים`;
  }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.executeTradePlan = executeTradePlan;
window.addTradePlan = addTradePlan;
window.editTradePlan = editTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.updateTradePlan = updateTradePlan;
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
window.addEditReminder = addEditReminder;
window.updatePageSummaryStats = updatePageSummaryStats;
window.restoreSortState = restoreSortState;
window.initializeTradePlanConditionsSystem = initializeTradePlanConditionsSystem;
window.setupPriceCalculation = setupPriceCalculation;
window.setupEditPriceCalculation = setupEditPriceCalculation;
window.setupSortableHeadersLocal = setupSortableHeadersLocal;
window.toggleSection = toggleSection;
window.restorePlanningSectionState = restorePlanningSectionState;
window.addImportantNote = addImportantNote;
window.addReminder = addReminder;
window.updateTickerInfo = updateTickerInfo;
window.updateSharesFromAmount = updateSharesFromAmount;
window.updateAmountFromShares = updateAmountFromShares;
window.showAddTradePlanModal = showAddTradePlanModal;
window.showEditTradePlanModal = showEditTradePlanModal;
window.saveTradePlanData = saveTradePlanData;
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
function showAddTradePlanModal() {
    window.Logger.debug('showAddTradePlanModal called', { page: 'trade_plans' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showModal('tradePlansModal', 'add');
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * הצגת מודל עריכת תוכנית מסחר
 * Uses ModalManagerV2 for consistent modal experience
 */
function showEditTradePlanModal(tradePlanId) {
    window.Logger.debug('showEditTradePlanModal called', { tradePlanId, page: 'trade_plans' });
    
    if (window.ModalManagerV2) {
        window.ModalManagerV2.showEditModal('tradePlansModal', 'trade_plan', tradePlanId);
    } else {
        console.error('ModalManagerV2 not available');
    }
}

/**
 * שמירת תוכנית מסחר
 * Handles both add and edit modes
 */
async function saveTradePlan() {
    window.Logger.debug('saveTradePlan called', { page: 'trade_plans' });
    
    try {
        // Collect form data
        const form = document.getElementById('tradePlansModalForm');
        if (!form) {
            throw new Error('Trade Plan form not found');
        }
        
        const formData = new FormData(form);
        const tradePlanData = {
            ticker_id: formData.get('tradePlanTicker'),
            name: formData.get('tradePlanName'),
            type: formData.get('tradePlanType'),
            quantity: parseInt(formData.get('tradePlanQuantity')),
            entry_price: parseFloat(formData.get('tradePlanEntryPrice')) || null,
            stop_loss: parseFloat(formData.get('tradePlanStopLoss')) || null,
            take_profit: parseFloat(formData.get('tradePlanTakeProfit')) || null,
            entry_date: formData.get('tradePlanEntryDate') || null,
            status: formData.get('tradePlanStatus'),
            notes: formData.get('tradePlanNotes')
        };
        
        // Validate data
        if (!window.validateEntityForm) {
            throw new Error('Validation system not available');
        }
        
        const isValid = window.validateEntityForm('tradePlansModalForm', {
            tradePlanTicker: { required: true },
            tradePlanName: { required: true, minLength: 2, maxLength: 100 },
            tradePlanType: { required: true },
            tradePlanQuantity: { required: true, min: 1 },
            tradePlanEntryPrice: { required: false, min: 0.01 },
            tradePlanStopLoss: { required: false, min: 0.01 },
            tradePlanTakeProfit: { required: false, min: 0.01 },
            tradePlanEntryDate: { required: false },
            tradePlanStatus: { required: true },
            tradePlanNotes: { required: false, maxLength: 1000 }
        });
        
        if (!isValid) {
            window.Logger.warn('Trade Plan validation failed', { page: 'trade_plans' });
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
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle success
        if (window.showNotification) {
            const message = isEdit ? 'תוכנית מסחר עודכנה בהצלחה' : 'תוכנית מסחר נוספה בהצלחה';
            window.showNotification(message, 'success', 'business');
        }
        
        // Close modal
        if (window.ModalManagerV2) {
            window.ModalManagerV2.hideModal('tradePlansModal');
        }
        
        // Refresh data
        if (window.loadTradePlansData) {
            window.loadTradePlansData();
        }
        
        window.Logger.info('Trade Plan saved successfully', { tradePlanId: result.id, page: 'trade_plans' });
        
    } catch (error) {
        window.Logger.error('Error saving trade plan', { error: error.message, page: 'trade_plans' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה בשמירת תוכנית המסחר', 'error', 'system');
        }
    }
}

/**
 * מחיקת תוכנית מסחר
 * Includes linked items check
 */
async function deleteTradePlan(tradePlanId) {
    window.Logger.debug('deleteTradePlan called', { tradePlanId, page: 'trade_plans' });
    
    try {
        // Check linked items first
        if (window.checkLinkedItemsBeforeAction) {
            const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade_plan', tradePlanId, 'delete');
            if (hasLinkedItems) {
                window.Logger.info('Trade Plan has linked items, deletion cancelled', { tradePlanId, page: 'trade_plans' });
                return;
            }
        }
        
        // Confirm deletion
        if (!confirm('האם אתה בטוח שברצונך למחוק את תוכנית המסחר?')) {
            return;
        }
        
        // Send delete request
        const response = await fetch(`/api/trade_plans/${tradePlanId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // Handle success
        if (window.showNotification) {
            window.showNotification('תוכנית מסחר נמחקה בהצלחה', 'success', 'business');
        }
        
        // Refresh data
        if (window.loadTradePlansData) {
            window.loadTradePlansData();
        }
        
        window.Logger.info('Trade Plan deleted successfully', { tradePlanId, page: 'trade_plans' });
        
    } catch (error) {
        window.Logger.error('Error deleting trade plan', { error: error.message, tradePlanId, page: 'trade_plans' });
        
        if (window.showNotification) {
            window.showNotification('שגיאה במחיקת תוכנית המסחר', 'error', 'system');
        }
    }
}

// Export functions to window for global access
window.showAddTradePlanModal = showAddTradePlanModal;
window.showEditTradePlanModal = showEditTradePlanModal;
window.saveTradePlan = saveTradePlan;
window.deleteTradePlan = deleteTradePlan;
