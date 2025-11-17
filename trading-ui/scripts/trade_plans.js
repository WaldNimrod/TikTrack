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
 * - addEditCondition() - addEditCondition function
 * - addEditReason() - addEditReason function
 * - addEditImportantNote() - addEditImportantNote function
 * - addEditReminder() - addEditReminder function
 * - addImportantNote() - addImportantNote function
 * - addReminder() - addReminder function
 * - updateDesignsTable() - updateDesignsTable function
 * - updateTradePlansTable() - updateTradePlansTable function
 * - updateTradePlansPageSummaryStats() - updateTradePlansPageSummaryStats function
 * - saveTradePlan() - saveTradePlan function
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
      fetch('/api/trade-plans/' + planId + '/execute', {
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
        const reloadPromise = typeof window.loadTradePlansData === 'function'
          ? window.loadTradePlansData()
          : (handleFunctionNotFound('loadTradePlansData'), Promise.reject(new Error('loadTradePlansData function not available')));

        reloadPromise.catch((reloadError) => {
          window.Logger?.error('⚠️ Failed to reload trade plans after execution', reloadError, { page: 'trade_plans' });
        });
        
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

// REMOVED: loadEditTickerInfo, displayEditTickerInfo, updateEditFormFieldsWithTickerData - not used
// Edit modal ticker info functions
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
    const parsedPrice = Number(ticker.current_price);
    const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;

    if (hasValidPrice) {
      priceDisplay.textContent = `$${parsedPrice.toFixed(2)}`;
    } else {
      priceDisplay.textContent = '-';
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification(
          'מחיר לא זמין',
          `לא התקבל מחיר עדכני לטיקר ${ticker.symbol}. אנא בדוק את מקורות הנתונים או טען מחדש את העמוד.`,
          6000,
          'system'
        );
      }
      window.Logger?.warn('⚠️ Missing current_price for ticker', { symbol: ticker.symbol, tickerId, page: 'trade_plans' });
    }

    const changeRaw = Number(ticker.daily_change);
    const changePercentRaw = Number(ticker.daily_change_percent);
    const hasValidChange = Number.isFinite(changeRaw) && Number.isFinite(changePercentRaw);

    if (hasValidChange) {
      const changeClass = changeRaw >= 0 ? 'positive' : 'negative';
      const changeSign = changeRaw >= 0 ? '+' : '';
      changeDisplay.textContent = `${changeSign}${changeRaw.toFixed(2)} (${changePercentRaw >= 0 ? '+' : ''}${changePercentRaw.toFixed(2)}%)`;
      changeDisplay.className = `form-control-plaintext ${changeClass}`;
    } else {
      changeDisplay.textContent = '-';
      changeDisplay.className = 'form-control-plaintext neutral';
      window.Logger?.warn('⚠️ Missing change data for ticker', { symbol: ticker.symbol, tickerId, page: 'trade_plans' });
    }
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

// REMOVED: saveEditTradePlan - deprecated wrapper, handled by ModalManagerV2.showEditModal
/**
 * שמירת עריכת תכנון
 */
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

    // Use relative URL to work with both development (8080) and production (5001)
    const response = await fetch(`/api/trade-plans/${tradePlanId}`, {
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
 * Build trade plan details string for confirmation dialogs
 * @param {Object} tradePlan - Trade plan object
 * @param {number} tradePlanId - Trade plan ID
 * @returns {string} - Formatted details string
 */
function buildTradePlanConfirmationDetails(tradePlan, tradePlanId) {
  if (!tradePlan) {
    return `תוכנית מסחר #${tradePlanId}`;
  }

  const ticker = tradePlan.ticker_symbol || tradePlan.symbol || tradePlan.ticker?.symbol || 'לא מוגדר';
  const sideText = tradePlan.side === 'buy' ? 'קנייה' :
    tradePlan.side === 'sell' ? 'מכירה' :
    tradePlan.side === 'Long' ? 'קנייה' :
    tradePlan.side === 'Short' ? 'מכירה' : tradePlan.side || 'לא מוגדר';
  const typeText = tradePlan.investment_type || tradePlan.type || 'לא מוגדר';
  const statusText = tradePlan.status === 'open' ? 'פתוח' :
    tradePlan.status === 'closed' ? 'סגור' :
    tradePlan.status === 'cancelled' ? 'מבוטל' : tradePlan.status || 'לא מוגדר';
  const amount = tradePlan.planned_amount ? `$${tradePlan.planned_amount}` : 'לא מוגדר';
  const dateEnvelope = window.dateUtils?.ensureDateEnvelope
    ? window.dateUtils.ensureDateEnvelope(
      tradePlan.created_at_envelope ||
      tradePlan.createdAtEnvelope ||
      tradePlan.created_at ||
      tradePlan.createdAt ||
      null
    )
    : (
      tradePlan.created_at_envelope ||
      tradePlan.createdAtEnvelope ||
      tradePlan.created_at ||
      tradePlan.createdAt ||
      null
    );

  let date = 'לא מוגדר';
  if (dateEnvelope) {
    if (window.dateUtils?.formatDate) {
      date = window.dateUtils.formatDate(dateEnvelope, { includeTime: false });
    } else {
      try {
        const dateObj = dateEnvelope instanceof Date ? dateEnvelope : new Date(dateEnvelope);
        if (!Number.isNaN(dateObj.getTime())) {
          date = dateObj.toLocaleDateString('he-IL');
        }
      } catch {
        date = 'לא מוגדר';
      }
    }
  }

  return `${ticker} - ${sideText} ${typeText}, סטטוס: ${statusText}, סכום: ${amount}, תאריך: ${date}`;
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
    window._lastCancelledTradePlanId = tradePlanId;

    const tradePlan = window.tradePlansData?.find(tp => tp.id === tradePlanId || tp.id === Number(tradePlanId));
    const tradePlanDetails = buildTradePlanConfirmationDetails(tradePlan, tradePlanId);

    const executeCancellation = async () => {
      if (typeof window.checkLinkedItemsAndPerformAction === 'function') {
        await window.checkLinkedItemsAndPerformAction('trade_plan', Number(tradePlanId), 'cancel', performTradePlanCancellation);
      } else {
        await performTradePlanCancellation(tradePlanId);
      }
    };

    if (typeof window.showCancelWarning === 'function') {
      window.showCancelWarning('trade_plan', tradePlanDetails, 'תוכנית מסחר', executeCancellation, () => {});
      return;
    }

    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'ביטול תוכנית מסחר',
          'האם אתה בטוח שברצונך לבטל תוכנית זו? פעולה זו תשנה את סטטוס התוכנית למבוטל.',
          () => resolve(true),
          () => resolve(false)
        );
      });
      if (!confirmed) {
        return;
      }
      await executeCancellation();
      return;
    }

    if (!window.confirm('האם אתה בטוח שברצונך לבטל את תוכנית המסחר?')) {
      return;
    }
    await executeCancellation();

  } catch (error) {
    window.Logger.error('שגיאה בביטול תכנון:', error, { page: "trade_plans" });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בביטול תכנון', error.message);
    }
  }
}

async function performTradePlanCancellation(tradePlanId) {
  try {
    const response = await fetch(`/api/trade-plans/${tradePlanId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש דרך הממשק' })
    });

    const handled = await window.handleApiResponseWithRefresh(response.clone(), {
      loadDataFunction: window.loadTradePlansData,
      operationName: 'ביטול',
      itemName: 'תוכנית המסחר',
      successMessage: 'תוכנית המסחר בוטלה בהצלחה',
      onSuccess: () => {
        window._lastCancelledTradePlanId = tradePlanId;
      }
    });

    if (!handled) {
      const errorText = await response.text();
      const message = errorText || 'בקשת הביטול לא הצליחה';
      window.showErrorNotification?.('שגיאה בביטול תוכנית מסחר', message);
    }

  } catch (error) {
    window.Logger?.error('שגיאה בביצוע ביטול תוכנית מסחר', error, { tradePlanId, page: 'trade_plans' });
    const message = error?.message || 'שגיאה בביטול תוכנית מסחר';
    window.showErrorNotification?.('שגיאה בביטול תוכנית מסחר', message);
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
    const reloadPromise = typeof window.loadTradePlansData === 'function'
      ? window.loadTradePlansData()
      : (handleFunctionNotFound('loadTradePlansData'), Promise.reject(new Error('loadTradePlansData function not available')));

    reloadPromise.catch((error) => {
      window.Logger?.error('⚠️ Failed to reload trade plans after filters update', error, { page: 'trade_plans' });
    });
  };
}


/**
 *
 * This function loads all planning from the server and updates the table.
 * If the server is not available the error is surfaced to the user without synthetic data.
 *
 * @returns {Array} Array of planning
 */
async function loadTradePlansData() {
  try {
    const serviceLoader = window.tradePlanService?.loadTradePlansData;
    if (typeof serviceLoader !== 'function') {
      handleFunctionNotFound('tradePlanService.loadTradePlansData');
      throw new Error('tradePlanService.loadTradePlansData missing');
    }

    const data = await serviceLoader();

    // Update global data
    const normalizedData = Array.isArray(data)
      ? data.map(plan => ({
          ...plan,
          updated_at: plan.updated_at || plan.modified_at || plan.cancelled_at || plan.created_at || null
        }))
      : [];
    window.tradePlansData = normalizedData;
    window.tradePlansLoaded = true;

    // Update the table
    updateTradePlansTable(normalizedData);
    
    // Register table with UnifiedTableSystem after data is loaded
    if (typeof window.registerTradePlansTables === 'function') {
      window.registerTradePlansTables();
    }

    // Restore page state (filters, sort, sections, entity filters)
    await restorePageState('trade_plans');

    return data;
  } catch (error) {
    window.tradePlansLoaded = false;
    handleApiError(error, 'נתוני תכנונים');
    throw error;
  }
}

// REMOVED: updateDesignsTable - alias not used
/**
 * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 */
// REMOVED: filterTradePlansData - not used
/**
 * פילטור נתוני תכנונים
 */
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
      tbody.innerHTML = `<tr><td colspan="13" class="text-center text-info">
                <i class="fas fa-search"></i> לא נמצאו תוצאות
                <br><small>נסה לשנות את הפילטרים או מונח החיפוש</small>
            </td></tr>`;
    } else {
      // No data at all
      // Showing "no data" message
      tbody.innerHTML = `<tr><td colspan="13" class="text-center text-muted">
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

    // Type correction - ensuring a valid value is passed
    const typeDisplay = design.investment_type ? window.translateTradePlanType ? window.translateTradePlanType(design.investment_type) : design.investment_type : 'לא מוגדר';
    const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
    const amountDisplay = formatCurrency(design.planned_amount);
    const targetDisplay = formatCurrency(design.target_price);
    const stopDisplay = formatCurrency(design.stop_price);
    const currentDisplay = formatCurrency(design.current || 0);
    const statusDisplay = window.translateTradePlanStatus ? window.translateTradePlanStatus(design.status) : design.status;

    // Displaying ticker symbol or name
    const tickerDisplay = design.ticker ? design.ticker.symbol || design.ticker.name || 'לא מוגדר' : 'לא מוגדר';

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = design.investment_type || '';
    const statusForFilter = design.status || '';

    return `
      <tr>
        <td class="ticker-cell">
          <span class="entity-trade-plan-badge entity-badge-base">
            ${tickerDisplay}
          </span>
        </td>
        <td data-date="${(() => {
          const createdEnvelope = window.dateUtils?.ensureDateEnvelope
            ? window.dateUtils.ensureDateEnvelope(
                design.created_at_envelope ||
                design.createdAtEnvelope ||
                design.created_at ||
                design.createdAt ||
                null
              )
            : (
                design.created_at_envelope ||
                design.createdAtEnvelope ||
                design.created_at ||
                design.createdAt ||
                null
              );
          if (window.dateUtils?.getEpochMilliseconds) {
            const ms = window.dateUtils.getEpochMilliseconds(createdEnvelope);
            return ms || '';
          }
          if (createdEnvelope instanceof Date) {
            return createdEnvelope.getTime();
          }
          try {
            return createdEnvelope ? new Date(createdEnvelope).getTime() : '';
          } catch {
            return '';
          }
        })()}">${(() => {
          const createdEnvelope = window.dateUtils?.ensureDateEnvelope
            ? window.dateUtils.ensureDateEnvelope(
                design.created_at_envelope ||
                design.createdAtEnvelope ||
                design.created_at ||
                design.createdAt ||
                null
              )
            : (
                design.created_at_envelope ||
                design.createdAtEnvelope ||
                design.created_at ||
                design.createdAt ||
                null
              );
          if (!createdEnvelope) {
            return `<span class="date-text">-</span>`;
          }
          if (window.FieldRendererService?.renderDate) {
            return `<span class="date-text">${window.FieldRendererService.renderDate(createdEnvelope, false)}</span>`;
          }
          if (window.dateUtils?.formatDate) {
            return `<span class="date-text">${window.dateUtils.formatDate(createdEnvelope, { includeTime: false })}</span>`;
          }
          try {
            const dateObj = createdEnvelope instanceof Date ? createdEnvelope : new Date(createdEnvelope);
            if (!Number.isNaN(dateObj.getTime())) {
              return `<span class="date-text">${dateObj.toLocaleDateString('he-IL')}</span>`;
            }
          } catch (error) {
            window.Logger?.warn('⚠️ trade plans date fallback failed', { error, created_at: design?.created_at }, { page: 'trade_plans' });
          }
          return `<span class="date-text">-</span>`;
        })()}</td>
        <td class="status-cell" data-status="${statusForFilter}">
          ${(() => {
            if (Number(design.id) === Number(window._lastCancelledTradePlanId)) {
              window.Logger?.info('updateTradePlansTable: rendering status cell for last cancelled plan', {
                planId: design.id,
                status: design.status,
              });
            }
            return '';
          })()}${(window.FieldRendererService && window.FieldRendererService.renderStatus) 
             ? window.FieldRendererService.renderStatus(design.status, 'trade_plan') 
             : (window.renderStatus ? window.renderStatus(design.status, 'trade_plan') : `<span class="status-${design.status}-badge entity-badge-base">${statusDisplay}</span>`)}
        </td>
        <td class="type-cell" data-type="${typeForFilter}">
          ${(window.FieldRendererService && window.FieldRendererService.renderType) 
            ? window.FieldRendererService.renderType(design.investment_type) 
            : (window.renderType ? window.renderType(design.investment_type) : `<span class="entity-trade-badge entity-badge-base">${typeDisplay}</span>`)}
        </td>
        <td class="side-cell" data-side="${design.side}">
          ${window.renderSide ? window.renderSide(design.side) : `<span class="${design.side === 'Long' ? 'numeric-value-positive' : 'numeric-value-negative'} entity-badge-base">${sideDisplay}</span>`}
        </td>
        <td class="quantity-cell">
          ${(() => {
            // חישוב כמות מהסכום המתוכנן ומחיר היעד
            const plannedAmount = design.planned_amount || 0;
            const targetPrice = design.target_price || 0;
            const calculatedQuantity = targetPrice > 0 ? (plannedAmount / targetPrice) : 0;
            
            if (calculatedQuantity > 0) {
              const formatted = calculatedQuantity.toFixed(1);
              return `<span class="numeric-value-positive entity-badge-medium">#${formatted}</span>`;
            } else {
              return `<span class="numeric-value-positive entity-badge-medium">-</span>`;
            }
          })()}
        </td>
        <td class="price-cell">
          <span class="target-text numeric-value-positive">
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
              return `<span class="numeric-value-positive entity-badge-medium">$${profitFormatted}</span>`;
            } else {
              return `<span class="numeric-value-zero entity-badge-medium">-</span>`;
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
              return `<span class="numeric-value-negative entity-badge-medium">$${lossFormatted}</span>`;
            } else {
              return `<span class="numeric-value-zero entity-badge-medium">-</span>`;
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
                  <div class="entity-badge-base table-cell-flex-small">
                    <span class="numeric-value-positive">${ratioFormatted}</span>
                    <span class="numeric-value-negative">1</span>
                  </div>
                `;
              }
            }
            return `<span class="numeric-value-zero entity-badge-medium">-</span>`;
          })()}
        </td>
        ${(() => {
          if (typeof window.renderUpdatedCell === 'function') {
            return window.renderUpdatedCell(design, {
              fields: ['updated_at', 'updatedAt', 'cancelled_at', 'created_at'],
              columnClass: 'col-updated'
            });
          }
          const fallbackDate = window.toDateObject
            ? window.toDateObject(design.updated_at || design.cancelled_at || design.created_at)
            : (design.updated_at || design.cancelled_at || design.created_at
                ? new Date(design.updated_at || design.cancelled_at || design.created_at)
                : null);
          if (!(fallbackDate instanceof Date) || Number.isNaN(fallbackDate?.getTime?.())) {
            return `<td class="col-updated"><span class="updated-value-empty">לא זמין</span></td>`;
          }
          const absolute = fallbackDate.toLocaleString('he-IL');
          const duration = typeof window.getDurationSince === 'function'
            ? window.getDurationSince(fallbackDate, { fallback: absolute })
            : absolute;
          return `<td class="col-updated" data-epoch="${fallbackDate.getTime()}" title="${absolute}"><span class="updated-value" dir="ltr">${duration}</span></td>`;
        })()}
        <td class="actions-cell">
          ${(() => {
            if (!window.createActionsMenu) {
              window.Logger.error('❌ createActionsMenu לא זמינה!', { page: "trade_plans" });
              return `<div class="alert alert-danger">שגיאה: מערכת התפריט לא זמינה</div>`;
            }
            
            try {
              const result = window.createActionsMenu([
                { type: 'VIEW', onclick: `window.showEntityDetails('trade_plan', ${design.id}, { mode: 'view' })`, title: 'צפה בפרטי תכנון' },
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

/**
 * Disable add-form fields until ticker is selected.
 * Uses global ModalManager when available to align with the unified system.
 */
function disableFormFields() {
  try {
    const modalElement = document.getElementById('tradePlansModal');
    const formElement = document.getElementById('tradePlansModalForm') || modalElement?.querySelector('form');

    if (!formElement) {
      window.Logger?.warn('disableFormFields: trade plan form not found', { page: 'trade_plans' });
      return;
    }

    if (window.ModalManager?.disableFormFields) {
      window.ModalManager.disableFormFields(formElement);
    } else {
      const fieldsToDisable = ['type', 'side', 'quantity', 'price', 'notes'];
      fieldsToDisable.forEach(fieldId => {
        const field = formElement.querySelector(`#${fieldId}`);
        if (field) {
          field.disabled = true;
          field.classList.add('disabled');
          field.removeAttribute('required');
        }
      });
    }

    ['selectedTickerDisplay', 'currentPriceDisplay', 'dailyChangeDisplay'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        if (id === 'selectedTickerDisplay') {
          element.textContent = 'לא נבחר';
        } else {
          element.textContent = '-';
          if (id === 'dailyChangeDisplay') {
            element.style.color = '#6c757d';
          }
        }
      }
    });

    window.Logger?.info('disableFormFields executed successfully', { page: 'trade_plans' });
  } catch (error) {
    window.Logger?.error('disableFormFields failed', error, { page: 'trade_plans' });
  }
}

/**
 * Enable edit form fields wrapper using ModalManager when possible.
 */
function enableEditFieldsWrapper() {
  try {
    const editModalElement = document.getElementById('tradePlansModal');
    const formElement = editModalElement?.querySelector('form');

    if (!formElement) {
      window.Logger?.warn('enableEditFieldsWrapper: edit form not found', { page: 'trade_plans' });
      return;
    }

    if (window.ModalManager?.enableFormFields) {
      window.ModalManager.enableFormFields(formElement);
    } else {
      const editFields = ['editType', 'editSide', 'editQuantity', 'editPrice', 'editNotes'];
      editFields.forEach(fieldId => {
        const field = formElement.querySelector(`#${fieldId}`);
        if (field) {
          field.disabled = false;
          field.classList.remove('disabled');
        }
      });
    }

    window.Logger?.info('enableEditFieldsWrapper executed successfully', { page: 'trade_plans' });
  } catch (error) {
    window.Logger?.error('enableEditFieldsWrapper failed', error, { page: 'trade_plans' });
  }
}

/**
 * Disable edit form fields wrapper using ModalManager when possible.
 */
function disableEditFields() {
  try {
    const editModalElement = document.getElementById('tradePlansModal');
    const formElement = editModalElement?.querySelector('form');

    if (!formElement) {
      window.Logger?.warn('disableEditFields: edit form not found', { page: 'trade_plans' });
      return;
    }

    if (window.ModalManager?.disableFormFields) {
      window.ModalManager.disableFormFields(formElement);
    } else {
      const editFields = ['editType', 'editSide', 'editQuantity', 'editPrice', 'editNotes'];
      editFields.forEach(fieldId => {
        const field = formElement.querySelector(`#${fieldId}`);
        if (field) {
          field.disabled = true;
          field.classList.add('disabled');
        }
      });
    }

    window.Logger?.info('disableEditFields executed successfully', { page: 'trade_plans' });
  } catch (error) {
    window.Logger?.error('disableEditFields failed', error, { page: 'trade_plans' });
  }
}

// ===== GLOBAL EXPORTS =====
// Export functions to global scope for HTML onclick attributes

// Export all necessary functions to global scope
window.saveTradePlan = saveTradePlan;
window.executeTradePlan = executeTradePlan;
window.deleteTradePlan = deleteTradePlan;
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

    const initializerInstance = (() => {
      if (window.conditionsInitializer && typeof window.conditionsInitializer.initialize === 'function') {
        return window.conditionsInitializer;
      }
      if (typeof window.ConditionsInitializer === 'function') {
        try {
          return new window.ConditionsInitializer();
        } catch (error) {
          window.Logger?.warn('Error creating ConditionsInitializer instance:', error, { page: "trade_plans" });
          return null;
        }
      }
      return null;
    })();

    if (initializerInstance && typeof initializerInstance.initialize === 'function') {
      const afterInit = () => {
        if (window.conditionsCRUDManager) {
          window.conditionsCRUDManager.setContext({ entityType: 'plan' });
          window.conditionsCRUDManager.getTradingMethods();
        }
        window.Logger?.info('✅ Trade plans conditions system initialized successfully', { page: "trade_plans" });
      };

      const initResult = initializerInstance.initialize();
      if (initResult && typeof initResult.then === 'function') {
        initResult.then(afterInit).catch(error => {
          window.Logger?.error('Error initializing trade plans conditions system:', error, { page: "trade_plans" });
        });
      } else if (initResult !== false) {
        afterInit();
      }
      return true;
    }

    // If not available immediately, try deferred check
    setTimeout(() => {
      if (window.conditionsSystem && window.conditionsSystem.initializer) {
        window.Logger?.info('✅ Conditions system initialized for trade plans (deferred check)', { page: "trade_plans" });
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

function getTradePlanModalEntityName(modalElement) {
  if (!modalElement) {
    return '';
  }
  if (modalElement.dataset.entityName && modalElement.dataset.entityName.trim() !== '') {
    return modalElement.dataset.entityName;
  }
  const tickerSelect = modalElement.querySelector('#tradePlanTicker');
  if (tickerSelect && tickerSelect.selectedOptions.length > 0) {
    const tickerName = tickerSelect.selectedOptions[0].textContent?.trim();
    if (tickerName) {
      modalElement.dataset.entityName = tickerName;
      return tickerName;
    }
  }
  return '';
}

function getTradePlansModalElement() {
  return document.getElementById('tradePlansModal');
}

const tradePlanConditionsSummaryCache = new Map();
const tradePlanConditionEvaluations = new Map();

function isConditionsModalOpenForPlan(entityId) {
  if (!entityId) {
    return false;
  }
  const modalElement = document.getElementById('conditionsModal');
  const context = window.__conditionsActiveContext;
  if (!modalElement || !context) {
    return false;
  }
  const isVisible = modalElement.classList.contains('show');
  if (!isVisible) {
    return false;
  }
  return context.entityType === 'plan' && Number(context.entityId) === Number(entityId);
}

function getCachedConditionSummary(entityId, conditionId) {
  const list = tradePlanConditionsSummaryCache.get(Number(entityId));
  if (!Array.isArray(list)) {
    return null;
  }
  return list.find(condition => Number(condition.id) === Number(conditionId)) || null;
}

function clearCachedConditionsSummary(entityId) {
  if (!entityId) {
    tradePlanConditionsSummaryCache.clear();
    tradePlanConditionEvaluations.clear();
    return;
  }
  const numericId = Number(entityId);
  const cachedList = tradePlanConditionsSummaryCache.get(numericId);
  if (Array.isArray(cachedList)) {
    cachedList.forEach(condition => {
      if (condition?.id) {
        tradePlanConditionEvaluations.delete(Number(condition.id));
      }
    });
  }
  tradePlanConditionsSummaryCache.delete(numericId);
}

async function openTradePlanConditionsModal(modalElement, options = {}) {
  if (!modalElement) {
    window.Logger?.error('Trade plans modal element not found while opening conditions', {}, { page: 'trade_plans' });
    window.showNotification?.('מודול תוכניות מסחר לא זמין כרגע.', 'error');
    return;
  }

  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('ניתן לנהל תנאים רק לאחר שמירת התכנון.', 'info');
    return;
  }

  const focusConditionId = options.focusConditionId ? Number(options.focusConditionId) : null;

  if (isConditionsModalOpenForPlan(entityId)) {
    if (focusConditionId && window.conditionsUIManager?.handleEditCondition) {
      try {
        await window.conditionsUIManager.handleEditCondition(focusConditionId);
        return;
      } catch (error) {
        window.Logger?.warn('Failed to focus condition in active modal', { error: error?.message, focusConditionId }, { page: 'trade_plans' });
      }
    }
    // Modal already open but no focus requested; nothing else to do
    return;
  }

  window.Logger?.info('Trade plan conditions button triggered', { entityId, modalId: modalElement.id }, { page: 'trade_plans' });

  try {
    const initResult = typeof window.initializeTradePlanConditionsSystem === 'function'
      ? window.initializeTradePlanConditionsSystem()
      : false;
    if (initResult && typeof initResult.then === 'function') {
      await initResult;
    }
  } catch (error) {
    window.Logger?.warn('Failed to initialize trade plan conditions system before modal launch', { error, page: 'trade_plans' });
  }

  if (!window.ConditionsModalController || typeof window.ConditionsModalController.open !== 'function') {
    window.Logger?.error('ConditionsModalController לא זמין', { page: 'trade_plans' });
    window.showNotification?.('לא ניתן לפתוח את מודול התנאים כעת.', 'error');
    return;
  }

  const entityName = getTradePlanModalEntityName(modalElement);
  window.ConditionsModalController.open({
    entityType: 'plan',
    entityId: Number(entityId),
    entityName,
    parentModalId: modalElement.id,
    focusConditionId,
    layoutMode: 'form-only'
  });
}

async function handleTradePlanConditionsButtonClick() {
  const modalElement = getTradePlansModalElement();
  await openTradePlanConditionsModal(modalElement);
}

window.handleTradePlanConditionsButtonClick = handleTradePlanConditionsButtonClick;
window.handleTradePlanEvaluateConditionsClick = handleTradePlanEvaluateConditionsClick;

async function handleTradePlanConditionSummaryEdit(conditionId) {
  const modalElement = getTradePlansModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול תכניות מסחר לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('נדרש לשמור את התכנון לפני עריכת תנאים.', 'info');
    return;
  }
  const numericConditionId = Number(conditionId);
  if (!Number.isFinite(numericConditionId)) {
    window.Logger?.warn('handleTradePlanConditionSummaryEdit called without valid condition id', { conditionId }, { page: 'trade_plans' });
    return;
  }
  await openTradePlanConditionsModal(modalElement, { focusConditionId: numericConditionId });
}

async function handleTradePlanConditionSummaryDelete(conditionId) {
  const modalElement = getTradePlansModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול תכניות מסחר לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('נדרש לשמור את התכנון לפני מחיקת תנאים.', 'info');
    return;
  }
  const numericConditionId = Number(conditionId);
  if (!Number.isFinite(numericConditionId)) {
    window.Logger?.warn('handleTradePlanConditionSummaryDelete called without valid condition id', { conditionId }, { page: 'trade_plans' });
    return;
  }

  const cachedCondition = getCachedConditionSummary(entityId, numericConditionId);
  const confirmed = await confirmTradePlanConditionDeletion(cachedCondition);
  if (!confirmed) {
    return;
  }

  if (isConditionsModalOpenForPlan(entityId) && window.conditionsUIManager?.handleDeleteCondition) {
    await window.conditionsUIManager.handleDeleteCondition(numericConditionId, { skipConfirm: true });
    return;
  }

  await deleteConditionViaCrud(numericConditionId, entityId);
}

window.handleTradePlanConditionSummaryEdit = handleTradePlanConditionSummaryEdit;
window.handleTradePlanConditionSummaryDelete = handleTradePlanConditionSummaryDelete;

async function confirmTradePlanConditionDeletion(condition) {
  const translator = getConditionsTranslator();
  const title = translator?.getMessage('condition_delete_confirm_title') || 'מחיקת תנאי';
  const baseMessage = translator?.getMessage('condition_delete_confirm_message') || 'האם למחוק את התנאי הנבחר?';
  const secondary = translator?.getMessage('condition_delete_confirm_secondary') || '';
  const methodName = condition?.method_name || condition?.method?.name || '';
  const message = methodName ? `${baseMessage}\n${methodName}` : baseMessage;
  const fullMessage = secondary ? `${message}\n${secondary}` : message;

  if (typeof window.showConfirmationDialog === 'function') {
    return await new Promise((resolve) => {
      window.showConfirmationDialog(
        title,
        fullMessage,
        () => resolve(true),
        () => resolve(false),
        'danger'
      );
    });
  }

  if (window.showNotification) {
    window.showNotification(`${title}: ${message}`, 'warning');
  }

  return window.confirm(fullMessage);
}

async function deleteConditionViaCrud(conditionId, entityId) {
  const crudManager = window.conditionsCRUDManager;
  if (!crudManager) {
    window.showNotification?.('מערכת ניהול התנאים אינה זמינה כרגע.', 'error');
    return;
  }

  try {
    crudManager.setContext?.({ entityType: 'plan' });
    const success = await crudManager.deleteCondition(Number(conditionId), Number(entityId));
    if (success) {
      window.showNotification?.('התנאי נמחק בהצלחה', 'success');
      window.dispatchEvent(new CustomEvent('tradePlanConditionsUpdated', {
        detail: {
          action: 'delete',
          entityType: 'plan',
          tradePlanId: Number(entityId),
          payload: { conditionId: Number(conditionId) }
        }
      }));
      const modalElement = getTradePlansModalElement();
      if (modalElement) {
        loadTradePlanConditionsSummary(modalElement, { showLoading: false });
      }
    }
  } catch (error) {
    window.Logger?.error('Failed to delete condition from summary', { error: error?.message, conditionId }, { page: 'trade_plans' });
    window.showNotification?.('שגיאה במחיקת התנאי', 'error');
  }
}

function buildTradePlanModalNavigationMetadata(modalElement) {
  if (!modalElement) {
    return null;
  }
  const mode = modalElement.dataset.modalMode || modalElement.dataset.mode || 'add';
  const entityId = mode === 'edit' ? Number(modalElement.dataset.entityId) || null : null;
  const titleElement = modalElement.querySelector('.modal-title');
  const defaultTitle = mode === 'edit' ? 'עריכת תוכנית מסחר' : 'הוספת תוכנית מסחר';
  const title = titleElement?.textContent?.trim() || defaultTitle;
  return {
    modalId: modalElement.id,
    modalType: 'trade-plan-modal',
    entityType: 'trade_plan',
    entityId,
    title,
    metadata: {
      mode,
      entityName: modalElement.dataset.entityName || ''
    }
  };
}

async function registerTradePlanModalNavigation(modalElement) {
  if (!modalElement || !window.ModalNavigationService?.registerModalOpen) {
    return;
  }
  const metadata = buildTradePlanModalNavigationMetadata(modalElement);
  if (!metadata) {
    return;
  }
  try {
    const entry = await window.ModalNavigationService.registerModalOpen(modalElement, metadata);
    modalElement.dataset.navigationInstanceId = entry?.instanceId || '';
    if (window.modalNavigationManager?.updateModalNavigation) {
      window.modalNavigationManager.updateModalNavigation(modalElement);
    }
  } catch (error) {
    window.Logger?.warn('Failed to register trade plan modal in navigation service', { error: error?.message }, { page: 'trade_plans' });
  }
}

function updateTradePlanModalNavigation(modalElement, overrides = {}) {
  if (!modalElement || !window.ModalNavigationService?.updateModalMetadata) {
    return;
  }
  const metadata = buildTradePlanModalNavigationMetadata(modalElement);
  if (!metadata) {
    return;
  }
  const payload = {
    modalId: metadata.modalId,
    modalType: metadata.modalType,
    entityType: metadata.entityType,
    entityId: overrides.entityId ?? metadata.entityId,
    title: overrides.title || metadata.title,
    metadata: {
      ...metadata.metadata,
      ...(overrides.metadata || {})
    }
  };
  window.ModalNavigationService.updateModalMetadata(metadata.modalId, payload);
  if (window.modalNavigationManager?.updateModalNavigation) {
    window.modalNavigationManager.updateModalNavigation(modalElement);
  }
}

function handleTradePlanModalRestore(event, modalElement) {
  const detail = event.detail || {};
  const { stage, entry } = detail;
  if (!stage) {
    return;
  }
  if (stage === 'before-show' && entry) {
    if (entry.entityId) {
      modalElement.dataset.entityId = entry.entityId;
      modalElement.dataset.modalMode = entry.metadata?.mode || 'edit';
    }
    if (entry.metadata?.entityName) {
      modalElement.dataset.entityName = entry.metadata.entityName;
    }
  }
  if (stage === 'after-show') {
    updateTradePlanModalNavigation(modalElement);
    if (modalElement.dataset.entityId) {
      loadTradePlanConditionsSummary(modalElement, { showLoading: false });
    }
  }
}

function setupTradePlanModalNavigation() {
  const modalElement = document.getElementById('tradePlansModal');
  if (!modalElement || modalElement.dataset.navigationBound === 'true') {
    return;
  }
  modalElement.dataset.navigationBound = 'true';

  modalElement.addEventListener('shown.bs.modal', () => registerTradePlanModalNavigation(modalElement));
  modalElement.addEventListener('modal:entity-context-changed', () => updateTradePlanModalNavigation(modalElement));
  modalElement.addEventListener('modal:entity-context-reset', () => {
    modalElement.dataset.entityId = '';
    modalElement.dataset.entityName = '';
    updateTradePlanModalNavigation(modalElement, { entityId: null, metadata: { mode: 'add', entityName: '' } });
    clearCachedConditionsSummary(null);
  });
  modalElement.addEventListener('modal-navigation:restore', (event) => handleTradePlanModalRestore(event, modalElement));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupTradePlanModalNavigation);
} else {
  setupTradePlanModalNavigation();
}

function getConditionsTranslator() {
  return window.conditionsTranslations || null;
}

function escapeHtmlForConditions(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtmlForConditions(value) {
  if (!value) {
    return '';
  }
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = value;
  return tempDiv.textContent || tempDiv.innerText || '';
}

function getConditionActionMeta(actionKey) {
  const translator = getConditionsTranslator();
  const actions = translator?.getTriggerActions?.() || {};
  return actions[actionKey] || null;
}

function getConditionActionLabel(condition) {
  const translator = getConditionsTranslator();
  const actionKey = condition?.trigger_action || condition?.triggerAction || 'enter_trade_positive';
  return translator?.getTriggerActionLabel?.(actionKey) || actionKey;
}

function formatConditionActionCell(condition) {
  const actionLabel = getConditionActionLabel(condition);
  const notesPreview = stripHtmlForConditions(condition?.action_notes || condition?.actionNotes || '');
  const truncatedNotes = notesPreview.length > 120 ? `${notesPreview.slice(0, 120)}…` : notesPreview;
  const polarity = getConditionActionMeta(condition?.trigger_action || condition?.triggerAction)?.polarity || 'neutral';
  const polarityClass = polarity === 'positive' ? 'text-success' : (polarity === 'negative' ? 'text-danger' : 'text-muted');

  return `
    <div class="d-flex flex-column gap-1">
      <span class="fw-semibold ${polarityClass}">${escapeHtmlForConditions(actionLabel)}</span>
      ${truncatedNotes ? `<span class="text-muted small">${escapeHtmlForConditions(truncatedNotes)}</span>` : ''}
    </div>
  `;
}

function getConditionEvaluationRecord(conditionId) {
  if (!conditionId) {
    return null;
  }
  return tradePlanConditionEvaluations.get(Number(conditionId)) || null;
}

function formatConditionEvaluationCell(condition) {
  const evaluation = getConditionEvaluationRecord(condition?.id);
  if (!evaluation) {
    return '<span class="text-muted small">טרם נבדק</span>';
  }

  if (evaluation.error) {
    return `<div class="text-danger small">${escapeHtmlForConditions(evaluation.error)}</div>`;
  }

  const badgeHtml = window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function'
    ? window.FieldRendererService.renderStatus(evaluation.met ? 'triggered' : 'not_triggered', 'alert')
    : `<span class="badge ${evaluation.met ? 'bg-success' : 'bg-secondary'}">${evaluation.met ? 'הופעל' : 'לא הופעל'}</span>`;

  let timestampHtml = '';
  if (evaluation.evaluationTime) {
    const formattedTime = typeof window.formatDateTime === 'function'
      ? window.formatDateTime(evaluation.evaluationTime)
      : new Date(evaluation.evaluationTime).toLocaleString('he-IL');
    timestampHtml = `<span class="text-muted small">${escapeHtmlForConditions(formattedTime)}</span>`;
  }

  return `
    <div class="d-flex flex-column gap-1">
      ${badgeHtml}
      ${timestampHtml}
    </div>
  `;
}

function extractConditionParametersSummary(condition) {
  if (!condition) {
    return {};
  }
  if (condition.parameters && typeof condition.parameters === 'object') {
    return condition.parameters;
  }
  const raw = condition.parameters_json;
  if (!raw) {
    return {};
  }
  if (typeof raw === 'object') {
    return raw;
  }
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    window.Logger?.warn('Failed parsing condition parameters for summary', { error: error?.message }, { page: 'trade_plans' });
    return {};
  }
}

function getConditionMethodName(condition) {
  const translator = getConditionsTranslator();
  const methodKey = condition?.method_key || condition?.method?.method_key;
  if (methodKey && translator?.getMethodName) {
    const translated = translator.getMethodName(methodKey);
    if (translated) {
      return translated;
    }
  }
  return condition?.method_name
    || condition?.method?.name_he
    || condition?.method?.name_en
    || 'ללא שם';
}

function getConditionOperatorLabel(condition) {
  const translator = getConditionsTranslator();
  const operator = condition?.logical_operator || 'NONE';
  return translator?.getOperator?.(operator) || operator;
}

function formatConditionParametersSummaryHtml(condition) {
  const parameters = extractConditionParametersSummary(condition);
  const entries = Object.entries(parameters);
  if (!entries.length) {
    return '<span class="text-muted">ללא פרמטרים</span>';
  }
  const translator = getConditionsTranslator();
  return entries.map(([key, value]) => {
    const label = translator?.getParameterName?.(key) || key;
    return `<div class="badge bg-light text-dark border fw-normal me-1 mb-1">${escapeHtmlForConditions(label)}: ${escapeHtmlForConditions(value)}</div>`;
  }).join('');
}

function buildTradePlanConditionsSummaryTable(conditions) {
  const rows = conditions.map(condition => {
    const methodName = getConditionMethodName(condition);
    const operatorName = getConditionOperatorLabel(condition);
    const parametersHtml = formatConditionParametersSummaryHtml(condition);
    const updatedAt = condition?.updated_at?.display
      || condition?.created_at?.display
      || '';
    const conditionIdAttr = condition?.id ? `data-condition-id="${condition.id}"` : '';
    const actionHtml = formatConditionActionCell(condition);
    const evaluationHtml = formatConditionEvaluationCell(condition);
    return `
      <tr>
        <td class="fw-semibold">${escapeHtmlForConditions(methodName)}</td>
        <td>${escapeHtmlForConditions(operatorName)}</td>
        <td>${parametersHtml}</td>
        <td>${actionHtml}</td>
        <td>${evaluationHtml}</td>
        <td>${escapeHtmlForConditions(updatedAt)}</td>
        <td class="text-center table-action-buttons" ${conditionIdAttr}>
          <button
            type="button"
            data-button-type="EDIT"
            data-variant="small"
            data-size="small"
            data-text=""
            data-tooltip="עריכת תנאי"
            aria-label="עריכת תנאי"
            data-onclick="handleTradePlanConditionSummaryEdit(${condition.id || 0})">
          </button>
          <button
            type="button"
            data-button-type="DELETE"
            data-variant="small"
            data-size="small"
            data-text=""
            data-tooltip="מחיקת תנאי"
            aria-label="מחיקת תנאי"
            data-onclick="handleTradePlanConditionSummaryDelete(${condition.id || 0})">
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-striped table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>שיטה</th>
            <th>אופרטור</th>
            <th>פרמטרים</th>
            <th>פעולה</th>
            <th>בדיקה אחרונה</th>
            <th>עודכן</th>
            <th class="text-center" style="width: 90px;">פעולות</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

async function handleTradePlanEvaluateConditionsClick() {
  const modalElement = getTradePlansModalElement();
  if (!modalElement) {
    window.showNotification?.('מודול תכניות מסחר לא זמין כרגע.', 'error');
    return;
  }
  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    window.showNotification?.('יש לשמור את התכנון לפני בדיקת תנאים.', 'info');
    return;
  }

  setEvaluateButtonLoadingState(true);
  try {
    const conditions = await getTradePlanConditionsForEvaluation(entityId);
    if (!Array.isArray(conditions) || !conditions.length) {
      window.showNotification?.('אין תנאים פעילים לתכנון זה.', 'info');
      return;
    }

    const evaluationResults = await evaluatePlanConditions(conditions);
    let successCount = 0;
    let errorCount = 0;

    evaluationResults.forEach(result => {
      if (!result || !result.conditionId) {
        return;
      }
      if (result.error) {
        errorCount += 1;
        tradePlanConditionEvaluations.set(Number(result.conditionId), { error: result.error });
        return;
      }
      if (result.payload) {
        successCount += 1;
        tradePlanConditionEvaluations.set(Number(result.conditionId), result.payload);
      }
    });

    if (successCount) {
      window.showNotification?.(`נבדקו ${successCount} תנאים בהצלחה.`, 'success');
    }
    if (errorCount) {
      window.showNotification?.(`${errorCount} תנאים לא נבדקו.`, 'warning');
    }
  } catch (error) {
    window.Logger?.error('handleTradePlanEvaluateConditionsClick failed', { error, page: 'trade_plans' });
    window.showNotification?.('שגיאה בבדיקת התנאים.', 'error');
  } finally {
    setEvaluateButtonLoadingState(false);
    const refreshedModal = getTradePlansModalElement();
    if (refreshedModal) {
      loadTradePlanConditionsSummary(refreshedModal, { showLoading: false });
    }
  }
}

function setEvaluateButtonLoadingState(isLoading) {
  const button = document.getElementById('tradePlanEvaluateConditionsButton');
  if (!button) {
    return;
  }
  if (isLoading) {
    button.dataset.loading = 'true';
    button.disabled = true;
  } else {
    delete button.dataset.loading;
    const baseDisabled = button.getAttribute('aria-disabled') === 'true';
    button.disabled = baseDisabled;
  }
  if (window.ButtonSystem?.processButtons) {
    window.ButtonSystem.processButtons(button.parentElement || button);
  } else if (window.ButtonSystem?.hydrateButtons) {
    window.ButtonSystem.hydrateButtons(button.parentElement || button);
  }
}

async function getTradePlanConditionsForEvaluation(entityId) {
  const numericId = Number(entityId);
  const cached = tradePlanConditionsSummaryCache.get(numericId);
  if (Array.isArray(cached) && cached.length) {
    return cached;
  }
  const response = await fetch(`/api/plan-conditions/trade-plans/${entityId}/conditions`);
  if (!response.ok) {
    throw new Error('טעינת התנאים נכשלה');
  }
  const payload = await response.json();
  const data = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  if (Array.isArray(data)) {
    tradePlanConditionsSummaryCache.set(numericId, data);
  }
  return data;
}

function evaluatePlanConditions(conditions) {
  const promises = conditions
    .filter(condition => condition?.id)
    .map(condition => evaluateSinglePlanCondition(condition.id)
      .then(payload => ({
        conditionId: condition.id,
        payload
      }))
      .catch(error => ({
        conditionId: condition.id,
        error: error?.message || 'שגיאה בבדיקת תנאי'
      }))
    );
  return Promise.all(promises);
}

async function evaluateSinglePlanCondition(conditionId) {
  if (!conditionId) {
    throw new Error('מזהה תנאי חסר');
  }
  const response = await fetch(`/api/plan-conditions/${conditionId}/evaluate`, {
    method: 'POST'
  });
  const payload = await response.json();
  if (!response.ok || payload?.status === 'error') {
    throw new Error(payload?.message || 'שגיאה בבדיקת תנאי');
  }
  const normalized = normalizeConditionEvaluationPayload(payload?.data);
  if (normalized?.error) {
    throw new Error(normalized.error);
  }
  return normalized;
}

function normalizeConditionEvaluationPayload(rawPayload) {
  if (!rawPayload) {
    return null;
  }
  return {
    met: Boolean(rawPayload.met),
    evaluationTime: rawPayload.evaluation_time || rawPayload.evaluated_at || rawPayload.evaluationTime || null,
    details: rawPayload.details || {},
    methodName: rawPayload.method_name || '',
    error: rawPayload.error || null
  };
}

async function loadTradePlanConditionsSummary(modalElement, { showLoading = true } = {}) {
  const summaryContainer = modalElement?.querySelector('#tradePlanConditionsSummary');
  if (!summaryContainer) {
    return;
  }

  const entityId = modalElement.dataset.entityId;
  if (!entityId) {
    delete summaryContainer.dataset.entityId;
    summaryContainer.innerHTML = '<div class="text-muted small mb-0">נדרש לשמור את התכנון לפני שניתן להציג תנאים.</div>';
    clearCachedConditionsSummary(modalElement.dataset.entityId || null);
    return;
  }

  summaryContainer.dataset.entityId = entityId;
  tradePlanConditionsSummaryCache.set(Number(entityId), []);

  const crudManager = window.conditionsCRUDManager;
  if (!crudManager) {
    summaryContainer.innerHTML = '<div class="text-muted small mb-0">מערכת התנאים אינה זמינה כעת.</div>';
    return;
  }

  if (showLoading) {
    summaryContainer.innerHTML = `
      <div class="text-center text-muted py-2">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        טוען תנאים פעילים...
      </div>
    `;
  }

  try {
    crudManager.setContext?.({ entityType: 'plan' });
    const conditions = await crudManager.readConditions(Number(entityId), true);
    const activeConditions = (conditions || []).filter(condition => condition?.is_active !== false);
    tradePlanConditionsSummaryCache.set(Number(entityId), activeConditions);
    const validIds = new Set(
      activeConditions
        .filter(condition => condition?.id)
        .map(condition => Number(condition.id))
    );
    tradePlanConditionEvaluations.forEach((value, key) => {
      if (!validIds.has(Number(key))) {
        tradePlanConditionEvaluations.delete(Number(key));
      }
    });

    if (!activeConditions.length) {
      summaryContainer.innerHTML = '<div class="text-muted small mb-0">אין תנאים פעילים לתכנון זה.</div>';
      return;
    }

    summaryContainer.innerHTML = buildTradePlanConditionsSummaryTable(activeConditions);
    if (window.ButtonSystem?.processButtons) {
      window.ButtonSystem.processButtons(summaryContainer);
    } else if (window.ButtonSystem?.hydrateButtons) {
      window.ButtonSystem.hydrateButtons(summaryContainer);
    }
  } catch (error) {
    window.Logger?.error('Failed to load trade plan conditions summary', { error: error?.message, entityId }, { page: 'trade_plans' });
    summaryContainer.innerHTML = '<div class="alert alert-warning py-2 px-2 mb-0 small">שגיאה בטעינת תנאים פעילים. נסה שוב.</div>';
  }
}

/**
 * Bind conditions management controls inside the trade plan modal
 * @param {HTMLElement} modalElement
 */
function setupTradePlanConditionsButton(modalElement) {
  window.Logger?.info('setupTradePlanConditionsButton invoked', { modalId: modalElement?.id, mode: modalElement?.dataset?.modalMode || modalElement?.dataset?.mode }, { page: 'trade_plans' });
  if (!modalElement) {
    return;
  }

  const controlsWrapper = modalElement.querySelector('[data-conditions-controls="trade-plan"]');
  if (!controlsWrapper || controlsWrapper.dataset.initialized === 'true') {
    return;
  }

  if (window.ButtonSystem?.processButtons) {
    window.ButtonSystem.processButtons(controlsWrapper);
  } else if (window.ButtonSystem?.hydrateButtons) {
    window.ButtonSystem.hydrateButtons(controlsWrapper);
  }

  const openButton = controlsWrapper.querySelector('#tradePlanOpenConditionsButton');
  const evaluateButton = controlsWrapper.querySelector('#tradePlanEvaluateConditionsButton');
  const disabledHint = controlsWrapper.querySelector('[data-conditions-disabled-hint]');
  const tickerSelect = modalElement.querySelector('#tradePlanTicker');
  const summaryContainer = controlsWrapper.querySelector('#tradePlanConditionsSummary');

  const updateButtonState = () => {
    const mode = modalElement.dataset.modalMode || modalElement.dataset.mode || '';
    const entityId = modalElement.dataset.entityId || '';
    const isEnabled = mode === 'edit' && entityId;

    if (openButton) {
      openButton.disabled = !isEnabled;
    }

    if (evaluateButton) {
      evaluateButton.disabled = !isEnabled;
      evaluateButton.setAttribute('aria-disabled', String(!isEnabled));
      evaluateButton.classList.toggle('opacity-50', !isEnabled);
    }

    if (disabledHint) {
      disabledHint.classList.toggle('d-none', Boolean(isEnabled));
    }

    if (summaryContainer) {
      if (isEnabled) {
        loadTradePlanConditionsSummary(modalElement);
      } else {
        delete summaryContainer.dataset.entityId;
        summaryContainer.innerHTML = '<div class="text-muted small mb-0">נדרש לשמור את התכנון לפני שניתן להציג תנאים.</div>';
      }
    }
  };

  if (tickerSelect && !tickerSelect.dataset.conditionsNameBound) {
    tickerSelect.addEventListener('change', () => {
      getTradePlanModalEntityName(modalElement);
      updateButtonState();
    });
    tickerSelect.dataset.conditionsNameBound = 'true';
  }

  modalElement.addEventListener('modal:entity-context-changed', updateButtonState);
  modalElement.addEventListener('modal:entity-context-reset', updateButtonState);

  if (!modalElement.__tradePlanConditionsUpdatedListener) {
    modalElement.__tradePlanConditionsUpdatedListener = (event) => {
      const detail = event.detail || {};
      if (!detail.tradePlanId) {
        return;
      }
      if (String(detail.tradePlanId) === String(modalElement.dataset.entityId)) {
        loadTradePlanConditionsSummary(modalElement, { showLoading: false });
      }
    };
    window.addEventListener('tradePlanConditionsUpdated', modalElement.__tradePlanConditionsUpdatedListener);
  }

  controlsWrapper.dataset.initialized = 'true';
  updateButtonState();
  window.Logger?.info('Trade plan conditions controls ready', { entityId: modalElement.dataset.entityId, mode: modalElement.dataset.modalMode || modalElement.dataset.mode }, { page: 'trade_plans' });
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
window.setupTradePlanConditionsButton = setupTradePlanConditionsButton;
window.setupTradePlanConditionsButton = setupTradePlanConditionsButton;
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
window.showEditTradePlanModal = async function(tradePlanId) {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
        await window.ModalManagerV2.showEditModal('tradePlansModal', 'trade_plan', tradePlanId);
        if (window.TagUIManager && typeof window.TagUIManager.hydrateSelectForEntity === 'function') {
            await window.TagUIManager.hydrateSelectForEntity('tradePlanTags', 'trade_plan', tradePlanId, { force: true });
        }
    } else {
        console.error('ModalManagerV2 not available');
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
        }
    }
};

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
        const form = document.getElementById('tradePlansModalForm');
        if (!form) {
            throw new Error('Trade Plan form not found');
        }

        const modalElement = form.closest('.modal');
        const rawId =
            form.dataset.tradePlanId ||
            form.dataset.entityId ||
            modalElement?.dataset?.entityId ||
            null;
        const tradePlanId = rawId != null && rawId !== '' ? Number(rawId) : null;
        const isEdit = form.dataset.mode === 'edit' || modalElement?.dataset?.modalMode === 'edit';
        if (Number.isNaN(tradePlanId)) {
            window.Logger?.warn('Trade plan ID could not be parsed to a number', {
                rawId,
                page: 'trade_plans'
            });
        }

        if (isEdit && !Number.isFinite(tradePlanId)) {
            throw new Error('Trade plan ID is required for edit operations');
        }
        
        const tradePlanData = DataCollectionService.collectFormData({
            trading_account_id: { id: 'tradePlanAccount', type: 'int' }, // Backend expects trading_account_id
            ticker_id: { id: 'tradePlanTicker', type: 'int' },
            side: { id: 'tradePlanSide', type: 'text' },
            investment_type: { id: 'tradePlanType', type: 'text' }, // Map tradePlanType field to investment_type column
            planned_amount: { id: 'planAmount', type: 'float' },
            entry_price: { id: 'tradePlanEntryPrice', type: 'float' }, // Required field - entry price
            stop_price: { id: 'tradePlanStopLoss', type: 'float', default: null },
            target_price: { id: 'tradePlanTakeProfit', type: 'float', default: null },
            entry_date: { id: 'tradePlanEntryDate', type: 'dateOnly', default: null },
            status: { id: 'tradePlanStatus', type: 'text' },
            notes: { id: 'tradePlanNotes', type: 'rich-text', default: null },
            tag_ids: { id: 'tradePlanTags', type: 'tags', default: [] }
        });

        const tagIds = Array.isArray(tradePlanData.tag_ids) ? tradePlanData.tag_ids : [];
        delete tradePlanData.tag_ids;
        
        if (tradePlanData.side) {
            const sideValue = String(tradePlanData.side).toLowerCase();
            if (sideValue === 'long' || sideValue === 'short') {
                tradePlanData.side = sideValue.charAt(0).toUpperCase() + sideValue.slice(1);
            }
        }

        const validationConfig = [
            { id: 'tradePlanAccount', name: 'חשבון מסחר', rules: { required: true } },
            { id: 'tradePlanTicker', name: 'טיקר', rules: { required: true } },
            { id: 'tradePlanSide', name: 'צד', rules: { required: true } },
            { id: 'tradePlanType', name: 'סוג השקעה', rules: { required: true } },
            { id: 'tradePlanStatus', name: 'סטטוס', rules: { required: true } },
            { id: 'tradePlanEntryPrice', name: 'מחיר כניסה מתוכנן', rules: { required: true, min: 0.01 } },
            { id: 'planAmount', name: 'סכום השקעה מתוכנן', rules: { required: true, min: 0.01 } },
            { id: 'tradePlanQuantity', name: 'כמות מתוכננת', rules: { required: true, min: 0.01 } },
            { id: 'tradePlanStopLoss', name: 'Stop Loss', rules: { required: false, min: 0.01 } },
            { id: 'tradePlanTakeProfit', name: 'Take Profit', rules: { required: false, min: 0.01 } },
            { id: 'tradePlanStopLossPercent', name: 'Stop Loss (%)', rules: { required: false, min: 0.01 } },
            { id: 'tradePlanTakeProfitPercent', name: 'Take Profit (%)', rules: { required: false, min: 0.01 } },
            { id: 'tradePlanEntryDate', name: 'תאריך כניסה מתוכנן', rules: { required: false } }
        ];

        if (typeof window.validateEntityForm === 'function') {
            const validationResult = window.validateEntityForm('tradePlansModalForm', validationConfig);
            if (!validationResult.isValid) {
                window.Logger.warn('Trade plan validation failed', { page: 'trade_plans' });
                if (validationResult.errorMessages?.length && window.showErrorNotification) {
                    window.showErrorNotification('שגיאת ולידציה', validationResult.errorMessages.join('\n'));
                }
                return;
            }
        }

        const getNumericValue = (fieldId) => {
            const element = document.getElementById(fieldId);
            if (!element) {
                return null;
            }
            const rawValue = (element.value || '').toString().trim();
            if (!rawValue || rawValue === '.' || rawValue === '-' || rawValue === '-.') {
                return null;
            }
            const numericValue = Number(rawValue.replace(/,/g, ''));
            return Number.isFinite(numericValue) ? numericValue : null;
        };

        const stopPercentValue = getNumericValue('tradePlanStopLossPercent');
        const targetPercentValue = getNumericValue('tradePlanTakeProfitPercent');

        if (stopPercentValue !== null) {
            tradePlanData.stop_percentage = stopPercentValue;
        } else {
            delete tradePlanData.stop_percentage;
        }

        if (targetPercentValue !== null) {
            tradePlanData.target_percentage = targetPercentValue;
        } else {
            delete tradePlanData.target_percentage;
        }

        // Convert entry date -> created_at (DB column) if provided (add-mode only)
        if (tradePlanData.entry_date) {
            const parsedEntryDate = new Date(tradePlanData.entry_date);
            if (!Number.isNaN(parsedEntryDate.valueOf()) && !isEdit) {
                tradePlanData.created_at = parsedEntryDate.toISOString();
            }
        }
        delete tradePlanData.entry_date;

        if (isEdit && Number.isFinite(tradePlanId)) {
            const originalTradePlan = Array.isArray(window.tradePlansData)
                ? window.tradePlansData.find(tp => tp.id === tradePlanId)
                : null;

            if (originalTradePlan) {
                const statusChangedToCancelled =
                    originalTradePlan.status !== 'cancelled' &&
                    tradePlanData.status === 'cancelled';

                if (statusChangedToCancelled && typeof window.checkLinkedItemsBeforeAction === 'function') {
                    const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade_plan', tradePlanId, 'cancel');
                    if (hasLinkedItems) {
                        window.Logger?.info('Cancellation blocked - linked items detected', {
                            tradePlanId,
                            page: 'trade_plans'
                        });
                        return;
                    }
                }

                const tickerChanged = tradePlanData.ticker_id &&
                    originalTradePlan.ticker_id !== tradePlanData.ticker_id;

                if (tickerChanged) {
                    window.Logger?.warn('Trade plan ticker change is not supported yet', {
                        tradePlanId,
                        newTicker: tradePlanData.ticker_id,
                        page: 'trade_plans'
                    });
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
            }
        }

        if (!tradePlanData.status) {
            tradePlanData.status = 'open';
        }
        
        // Prepare API call
        const url = isEdit && Number.isFinite(tradePlanId) ? `/api/trade-plans/${tradePlanId}` : '/api/trade-plans';
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
        let result;

        if (isEdit) {
            result = await CRUDResponseHandler.handleUpdateResponse(response, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית מסחר עודכנה בהצלחה',
                entityName: 'תוכנית מסחר',
                reloadFn: window.loadTradePlansData,
                requiresHardReload: false
            });
        } else {
            result = await CRUDResponseHandler.handleSaveResponse(response, {
                modalId: 'tradePlansModal',
                successMessage: 'תוכנית מסחר נוספה בהצלחה',
                entityName: 'תוכנית מסחר',
                reloadFn: window.loadTradePlansData,
                requiresHardReload: false
            });
        }

        const planId = isEdit ? Number(tradePlanId) : Number(result?.data?.id || result?.id);
        if (Number.isFinite(planId)) {
            try {
                await window.TagService.replaceEntityTags('trade_plan', planId, tagIds);
            } catch (tagError) {
                window.Logger?.warn('⚠️ Failed to update trade plan tags', {
                    error: tagError,
                    tradePlanId: planId,
                    page: 'trade_plans'
                });
                const errorMessage = window.TagService?.formatTagErrorMessage
                    ? window.TagService.formatTagErrorMessage('שמירת התגיות נכשלה - הנתונים נשמרו ללא תגיות', tagError)
                    : 'שמירת התגיות נכשלה - הנתונים נשמרו ללא תגיות';
                window.showErrorNotification?.('שמירת תגיות', errorMessage);
            }
        }
        
        if (window.unifiedCacheManager) {
            await window.unifiedCacheManager.clearByPattern('trade-plans-data');
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
        const tradePlan = window.tradePlansData?.find(tp => tp.id === tradePlanId || tp.id === parseInt(tradePlanId));
        const tradePlanDetails = buildTradePlanConfirmationDetails(tradePlan, tradePlanId);
        window.Logger.info('🗑️ deleteTradePlan details prepared', {
            tradePlanId,
            tradePlanDetails,
            hasTradePlan: Boolean(tradePlan),
            page: 'trade_plans'
        });

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
            window.Logger.info('🗑️ Showing delete warning modal for trade plan', { tradePlanId, page: 'trade_plans' });
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
        // Send delete request
        window.Logger?.info('🗑️ Sending delete request for trade plan', {
            tradePlanId,
            endpoint: `/api/trade-plans/${tradePlanId}`,
            page: 'trade_plans'
        });
        const response = await fetch(`/api/trade-plans/${tradePlanId}`, {
            method: 'DELETE'
        });
        window.Logger?.info('🗑️ Delete response received', {
            tradePlanId,
            ok: response.ok,
            status: response.status,
            page: 'trade_plans'
        });
        
        // Use CRUDResponseHandler for consistent response handling
        await CRUDResponseHandler.handleDeleteResponse(response, {
            successMessage: 'תוכנית מסחר נמחקה בהצלחה',
            entityName: 'תוכנית מסחר',
            reloadFn: window.loadTradePlansData,
            requiresHardReload: false
        });
        window.Logger?.info('🗑️ Trade plan deletion handled successfully', { tradePlanId, page: 'trade_plans' });
        
    } catch (error) {
        CRUDResponseHandler.handleError(error, 'מחיקת תוכנית מסחר');
    }
}

// Export functions to window for global access
// Note: saveTradePlan already exported above
window.loadTradePlanTickerInfo = loadTradePlanTickerInfo;
window.displayTradePlanTickerInfo = displayTradePlanTickerInfo;

/**
 * Restore page state (filters, sort, sections, entity filters)
 * @param {string} pageName - Page name
 * @returns {Promise<void>}
 */
async function restorePageState(pageName) {
  try {
    // אתחול PageStateManager אם לא מאותחל
    if (window.PageStateManager && !window.PageStateManager.initialized) {
      await window.PageStateManager.initialize();
    }

    if (!window.PageStateManager || !window.PageStateManager.initialized) {
      if (window.Logger) {
        window.Logger.warn('⚠️ PageStateManager not available, skipping state restoration', { page: pageName });
      }
      return;
    }

    // מיגרציה של נתונים קיימים אם יש
    await window.PageStateManager.migrateLegacyData(pageName);

    // טעינת מצב מלא
    const pageState = await window.PageStateManager.loadPageState(pageName);
    if (!pageState) {
      return; // אין מצב שמור
    }

    // שחזור פילטרים ראשיים
    if (pageState.filters && window.filterSystem) {
      window.filterSystem.currentFilters = { ...window.filterSystem.currentFilters, ...pageState.filters };
      if (window.filterSystem.applyAllFilters) {
        window.filterSystem.applyAllFilters();
      }
    }

    // שחזור סידור
    if (pageState.sort && window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      const { columnIndex, direction } = pageState.sort;
      if (typeof columnIndex === 'number' && columnIndex >= 0) {
        await window.UnifiedTableSystem.sorter.sort('trade_plans', columnIndex);
      }
    } else if (window.UnifiedTableSystem && window.UnifiedTableSystem.sorter) {
      // אם אין מצב שמור, נסה להחיל סידור ברירת מחדל
      await window.UnifiedTableSystem.sorter.applyDefaultSort('trade_plans');
    }

    // שחזור סקשנים
    if (pageState.sections && typeof window.restoreAllSectionStates === 'function') {
      await window.restoreAllSectionStates();
    }

    // שחזור פילטרים פנימיים (entity filters) - מתבצע אוטומטית ב-entity-details-renderer

    if (window.Logger) {
      window.Logger.debug(`✅ Page state restored for "${pageName}"`, { page: pageName });
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error(`❌ Error restoring page state for "${pageName}":`, error, { page: pageName });
    }
  }
}

/**
 * Register trade_plans table with UnifiedTableSystem
 * This function registers the trade_plans table for unified sorting and filtering
 */
window.registerTradePlansTables = function() {
    if (!window.UnifiedTableSystem) {
        window.Logger?.warn('⚠️ UnifiedTableSystem not available for registration', { page: "trade_plans" });
        return;
    }

    // Get column mappings from table-mappings.js
    const getColumns = (tableType) => {
        return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
    };

    // Register trade_plans table
    window.UnifiedTableSystem.registry.register('trade_plans', {
        dataGetter: () => {
            return window.tradePlansData || [];
        },
        updateFunction: (data) => {
            if (typeof window.updateTradePlansTable === 'function') {
                window.updateTradePlansTable(data);
            }
        },
        tableSelector: '#trade_plansTable',
        columns: getColumns('trade_plans'),
        sortable: true,
        filterable: true
    });
};
