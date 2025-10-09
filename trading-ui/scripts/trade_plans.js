/**
 * ========================================
 * Trade Plans Page - Trade Plans Page
 * ========================================
 */

// ===== HELPER FUNCTIONS =====

/**
 * Error Handler Wrapper
 * Handles errors consistently across all functions
 * @param {string} operation - Name of the operation that failed
 * @param {Error} error - The error object
 */
function handleError(operation, error) {
  console.error(`❌ שגיאה ב${operation}:`, error);
  if (window.showErrorNotification) {
    window.showErrorNotification(`שגיאה ב${operation}`, error.message || 'שגיאה לא ידועה');
  } else if (window.showNotification) {
    window.showNotification(`שגיאה ב${operation}: ${error.message}`, 'error');
  }
}

/**
 * Notification Wrapper
 * Unified notification handler for all notification types
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'warning', 'info'
 * @param {string} title - Optional title
 */
function notify(message, type = 'info', title = '') {
  const notificationTitle = title || {
    'success': 'הצלחה',
    'error': 'שגיאה',
    'warning': 'אזהרה',
    'info': 'מידע'
  }[type] || '';

  if (type === 'success' && window.showSuccessNotification) {
    window.showSuccessNotification(notificationTitle, message);
  } else if (type === 'error' && window.showErrorNotification) {
    window.showErrorNotification(notificationTitle, message);
  } else if (type === 'warning' && window.showWarningNotification) {
    window.showWarningNotification(notificationTitle, message);
  } else if (type === 'info' && window.showInfoNotification) {
    window.showInfoNotification(notificationTitle, message);
  } else if (window.showNotification) {
    window.showNotification(message, type, notificationTitle);
  } else {
    console.log(`[${type}] ${notificationTitle}: ${message}`);
  }
}

// ===== TRADE PLAN FUNCTIONS =====

/**
 * ביצוע תוכנית מסחר
 * מבצע את התוכנית המסחרית
 * @param {number} planId - מזהה התוכנית
 */
function executeTradePlan(planId) {
  try {
    console.log('⚡ מבצע תוכנית מסחר:', planId);
    
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
        console.log('✅ תוכנית מסחר בוצעה:', data);
        loadTradePlansData();
        notify('תוכנית מסחר בוצעה בהצלחה', 'success');
      })
      .catch(error => handleError('ביצוע תוכנית מסחר', error));
    }
    
  } catch (error) {
    handleError('ביצוע תוכנית מסחר', error);
  }
}

/**
 * העתקת תוכנית מסחר
 * יוצר עותק של תוכנית מסחר קיימת
 * @param {number} planId - מזהה התוכנית
 */
function copyTradePlan(planId) {
  try {
    console.log('📋 מעתיק תוכנית מסחר:', planId);
    
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
      console.log('✅ תוכנית מסחר הועתקה:', data);
      loadTradePlansData();
      notify('תוכנית מסחר הועתקה בהצלחה', 'success');
    })
    .catch(error => handleError('העתקת תוכנית מסחר', error));
    
  } catch (error) {
    handleError('העתקת תוכנית מסחר', error);
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
function openAddTradePlanModal() {
  // Opening add trade plan modal
  const modal = new bootstrap.Modal(document.getElementById('addTradePlanModal'));

  // קבע ברירת מחדל של היום לשדה התאריך
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const dateInput = document.getElementById('addTradePlanDate');
  if (dateInput) {dateInput.value = todayStr;}

  modal.show();
}

/**
 * פתיחת מודל עריכת תכנון קיים
 */
/**
 * עריכת תכנון טרייד
 */
function editTradePlan(tradePlanId) {
    openEditTradePlanModal(tradePlanId);
}

/**
 * הצגת פרטי תכנון טרייד
 */
function showTradePlanDetails(tradePlanId) {
    // חיפוש התכנון בנתונים
    const tradePlan = window.tradePlansData ? window.tradePlansData.find(tp => tp.id === tradePlanId) : null;
    
    if (!tradePlan) {
        console.error(`❌ Trade Plan with ID ${tradePlanId} not found`);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה', `תכנון טרייד עם ID ${tradePlanId} לא נמצא`);
        }
        return;
    }

    // שימוש במערכת הצגת פרטים כללית אם זמינה
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('trade_plan', tradePlanId, { mode: 'view' });
    } else {
        // הצגה פשוטה
        const details = `פרטי תכנון טרייד:
ID: ${tradePlan.id}
טיקר: ${tradePlan.ticker_id}
סוג השקעה: ${tradePlan.investment_type}
צד: ${tradePlan.side}
סטטוס: ${tradePlan.status}
סכום מתוכנן: ${tradePlan.planned_amount}
מחיר עצירה: ${tradePlan.stop_price || 'לא מוגדר'}
מחיר יעד: ${tradePlan.target_price || 'לא מוגדר'}
מחיר נוכחי: ${tradePlan.current_price || 'לא מוגדר'}
נוצר: ${tradePlan.created_at ? new Date(tradePlan.created_at).toLocaleString('he-IL') : 'לא מוגדר'}`;
        alert(details);
    }
}

/**
 * מחיקת תכנון טרייד
 */
function deleteTradePlan(tradePlanId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק תכנון טרייד זה?')) {
        return;
    }

    if (typeof window.showLoadingNotification === 'function') {
        window.showLoadingNotification('מוחק תכנון טרייד...');
    }

    fetch(`/api/trade_plans/${tradePlanId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // הסרת התכנון מהמערך המקומי
        const index = window.tradePlansData.findIndex(tp => tp.id === tradePlanId);
        if (index > -1) {
            window.tradePlansData.splice(index, 1);
        }

        // עדכון הטבלה
        updateTradePlansTable(window.tradePlansData);
        
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('תכנון טרייד נמחק בהצלחה');
        }
    })
    .catch(error => {
        console.error('❌ Failed to delete trade plan:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה במחיקת תכנון טרייד', error.message);
        }
    })
    .finally(() => {
        if (typeof window.hideLoadingNotification === 'function') {
            window.hideLoadingNotification();
        }
    });
}

async function openEditTradePlanModal(tradePlanId) {
  const tradePlan = window.tradePlansData.find(tp => tp.id === tradePlanId);
  if (!tradePlan) {
    handleElementNotFound('trade plan', 'CRITICAL');
    return;
  }

  // טעינת רשימת הטיקרים בחלון הבחירה
  await loadTickersForEditModal();

  // מילוי הטופס בנתונים קיימים
  document.getElementById('editTradePlanId').value = tradePlan.id;
  document.getElementById('editTradePlanTickerId').value = tradePlan.ticker_id;
  document.getElementById('editTradePlanInvestmentType').value = tradePlan.investment_type;
  document.getElementById('editTradePlanSide').value = tradePlan.side;
  document.getElementById('editTradePlanStatus').value = tradePlan.status;
  document.getElementById('editTradePlanPlannedAmount').value = tradePlan.planned_amount;
  document.getElementById('editTradePlanShares').value = tradePlan.shares || '';
  document.getElementById('editTradePlanStopPrice').value = tradePlan.stop_price || '';
  document.getElementById('editTradePlanTargetPrice').value = tradePlan.target_price || '';
  document.getElementById('editTradePlanEntryConditions').value = tradePlan.entry_conditions || '';
  document.getElementById('editTradePlanReasons').value = tradePlan.reasons || '';

  // עדכון תאריך
  if (tradePlan.created_at) {
    const date = new Date(tradePlan.created_at);
    const dateStr = date.toISOString().split('T')[0];
    document.getElementById('editTradePlanDate').value = dateStr;
  }

  // הפעלת כל השדות
  enableEditFields();

  // עדכון מידע על הטיקר
  await updateEditTickerInfo();

  // חישוב מספר מניות
  updateEditSharesFromAmount();

  const modal = new bootstrap.Modal(document.getElementById('editTradePlanModal'));
  modal.show();
}

/**
 * טעינת רשימת הטיקרים בחלון העריכה
 */
async function loadTickersForEditModal() {
  const tickerSelect = document.getElementById('editTradePlanTickerId');
  if (!tickerSelect) {return;}

  // ניקוי הרשימה הקיימת
  tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';

  try {
    // ניסיון לקבל טיקרים מהשירות
    let tickers = [];
    if (typeof window.tickerService?.getTickers === 'function') {
      tickers = await window.tickerService.getTickers();
    } else if (window.tickersData) {
      tickers = window.tickersData;
    }

    // סינון טיקרים - רק פתוחים או סגורים (לא מבוטלים)
    const activeTickers = tickers.filter(ticker =>
      ticker.status === 'open' || ticker.status === 'closed',
    );

    // הוספת הטיקרים הפעילים לרשימה
    activeTickers.forEach(ticker => {
      const option = document.createElement('option');
      option.value = ticker.id;
      option.textContent = ticker.symbol;
      tickerSelect.appendChild(option);
    });
  } catch (error) {
    handleDataLoadError(error, 'טיקרים למודל עריכה');
  }
}

/**
 * הפעלת השדות במודל העריכה
 */
function enableEditFields() {
  const fields = [
    'editTradePlanInvestmentType',
    'editTradePlanSide',
    'editTradePlanStatus',
    'editTradePlanPlannedAmount',
    'editTradePlanShares',
    'editTradePlanStopPrice',
    'editTradePlanTargetPrice',
    'editTradePlanEntryConditions',
    'editTradePlanReasons',
  ];

  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = false;
      field.classList.remove('disabled');
    }
  });
}

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
      // console.warn('Error getting tickers from service:', error);
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


/**
 * עדכון מספר מניות מסכום מתוכנן במודל העריכה
 */
function updateEditSharesFromAmount() {
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
}

/**
 * עדכון סכום מתוכנן ממספר מניות במודל העריכה
 */
function updateEditAmountFromShares() {
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
}

/**
 * שמירת עריכת תכנון
 */
async function saveEditTradePlan() {
  try {
    // איסוף נתונים מהטופס
    const formData = {
      id: document.getElementById('editTradePlanId').value,
      ticker_id: document.getElementById('editTradePlanTickerId').value,
      investment_type: document.getElementById('editTradePlanInvestmentType').value,
      side: document.getElementById('editTradePlanSide').value,
      status: document.getElementById('editTradePlanStatus').value,
      planned_amount: parseFloat(document.getElementById('editTradePlanPlannedAmount').value),
      stop_price: parseFloat(document.getElementById('editTradePlanStopPrice').value) || null,
      target_price: parseFloat(document.getElementById('editTradePlanTargetPrice').value) || null,
      entry_conditions: document.getElementById('editTradePlanEntryConditions').value,
      reasons: document.getElementById('editTradePlanReasons').value,
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
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${formData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('תכנון עודכן בהצלחה!', 'success');
    }

    // סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTradePlanModal'));
    modal.hide();

    // רענון הטבלה

    // ניקוי מטמון trade_plans
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
      await window.UnifiedCacheManager.remove('trade_plans');
      console.log('✅ מטמון trade_plans נוקה');
    }
    await loadTradePlansData();

  } catch (error) {
    handleSaveError(error, 'עדכון תכנון');

    // הצגת הודעת שגיאה
    let errorMessage = 'שגיאה בעדכון התכנון';
    try {
      const errorData = JSON.parse(error.message);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = error.message || errorMessage;
    }

    if (typeof window.showNotification === 'function') {
      window.showNotification(errorMessage, 'error');
    }
  }
}


// Function removed - not used anywhere

/**
 * בדיקת פריטים מקושרים לפני ביטול תכנון
 */
async function checkLinkedItemsBeforeCancel(tradePlanId) {
  try {
    // בדיקת פריטים מקושרים דרך API הכללי
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/linked-items/trade_plan/${tradePlanId}`);

    if (!response.ok) {
      // אם לא ניתן לבדוק פריטים מקושרים, ממשיכים עם הביטול
      await cancelTradePlan(tradePlanId);
      return;
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];
    const parentEntities = linkedItemsData.parent_entities || [];
    const allEntities = [...childEntities, ...parentEntities];

    if (allEntities.length > 0) {
      // יש פריטים מקושרים - הצגת חלון מקושרים
      if (typeof window.showLinkedItemsModal === 'function') {
        // הצגת המודל וחכייה לתשובה מהמשתמש
        return new Promise(resolve => {
          // שמירת ה-callback לביטול
          window._linkedItemsWarningCallbacks = {
            onConfirm: async () => {
              await cancelTradePlan(tradePlanId);
              resolve();
            },
            onCancel: () => {
              resolve();
            },
          };

          // הצגת המודל ב-warningBlock mode עם כל המידע הדרוש
          window.showLinkedItemsModal(linkedItemsData, 'trade_plan', tradePlanId, 'warningBlock');
        });
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification('לא ניתן לבטל תכנון זה - יש פריטים מקושרים אליו', 'error');
        }
        return;
      }
    } else {
      // אין פריטים מקושרים - ביצוע הביטול
      await cancelTradePlan(tradePlanId);
    }

  } catch (error) {
    // console.error('❌ שגיאה בבדיקת פריטים מקושרים:', error);
    if (typeof window.handleSystemError === 'function') {
      window.handleSystemError(error, 'בדיקת פריטים מקושרים');
    } else if (typeof window.handleDataLoadError === 'function') {
      window.handleDataLoadError(error, 'בדיקת פריטים מקושרים');
    }
    // במקרה של שגיאה - ממשיכים עם הביטול
    await cancelTradePlan(tradePlanId);
  }
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

      if (typeof window.updateTickerActiveTradesStatus === 'function') {
        await window.updateTickerActiveTradesStatus(tradePlan.ticker_id);
      } else {
        // console.warn('⚠️ updateTickerActiveTradesStatus function not available');
      }
    }

    // הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {

    // ניקוי מטמון trade_plans
    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
      await window.UnifiedCacheManager.remove('trade_plans');
      console.log('✅ מטמון trade_plans נוקה');
    }
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


/**
 * פונקציות עזר למודל העריכה
 */
function addEditCondition() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
  }
}

function addEditReason() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('פונקציונליות זו תהיה זמינה בקרוב', 'info');
  }
}

function addEditImportantNote() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('המודול יאפשר בקרוב לייצר הערות עשירות לתוכנית', 'info');
  }
}

function addEditReminder() {
  if (typeof window.showNotification === 'function') {
    window.showNotification('המודול יאפשר בקרוב לייצר התראות לתוכנית', 'info');
  }
}

/**
 * פתיחת מודל ביטול תכנון
 */
function openCancelTradePlanModal(tradePlanId) {

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
}

/**
 * פתיחת מודל מחיקת תכנון
 */
function openDeleteTradePlanModal(tradePlanId) {

  const tradePlan = window.tradePlansData.find(tp => tp.id === tradePlanId);
  if (!tradePlan) {
    handleElementNotFound('trade plan', 'CRITICAL');
    return;
  }

  // הצגת פרטי התכנון במודל המחיקה
  document.getElementById('deleteTradePlanDetails').innerHTML = `
        <strong>טיקר:</strong> ${tradePlan.ticker?.symbol || 'לא מוגדר'}<br>
        <strong>סוג:</strong> ${tradePlan.investment_type || 'לא מוגדר'}<br>
        <strong>צד:</strong> ${tradePlan.side || 'לא מוגדר'}<br>
        <strong>סכום מתוכנן:</strong> $${tradePlan.planned_amount || '0.00'}
    `;

  document.getElementById('deleteTradePlanModal').setAttribute('data-trade-plan-id', tradePlanId);

  const modal = new bootstrap.Modal(document.getElementById('deleteTradePlanModal'));
  modal.show();
}

/**
 * ביטול תכנון
 */
async function cancelTradePlan(tradePlanId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${tradePlanId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_reason: 'תכנון בוטל על ידי המשתמש'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'תכנון בוטל בהצלחה!');
    }

    await loadTradePlansData();
  } catch (error) {
    handleSaveError(error, 'ביטול תכנון');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בביטול התכנון');
    }
  }
}

/**
 * אישור ביטול תכנון
 */
async function confirmCancelTradePlan() {
  const modal = document.getElementById('cancelTradePlanModal');
  const tradePlanId = modal.getAttribute('data-trade-plan-id');


  // סגירת המודל הראשון
  bootstrap.Modal.getInstance(modal).hide();

  // בדיקת פריטים מקושרים לפני ביטול
  await checkLinkedItemsBeforeCancel(tradePlanId);
}

/**
 * אישור מחיקת תכנון
 */
async function confirmDeleteTradePlan() {
  const modal = document.getElementById('deleteTradePlanModal');
  const tradePlanId = modal.getAttribute('data-trade-plan-id');

  if (!tradePlanId) {
    handleElementNotFound('trade plan ID', 'CRITICAL');
    return;
  }

  try {
    // שימוש בפונקציה deleteTradePlan במקום מחיקה ישירה
    await deleteTradePlan(tradePlanId);

    // סגירת המודל
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteTradePlanModal'));
    deleteModal.hide();

  } catch (error) {
    handleDeleteError(error, 'תכנון');
    // הפונקציה deleteTradePlan כבר מטפלת בהצגת שגיאות
  }
}

// ייצוא פונקציות לגלובל
window.openAddTradePlanModal = openAddTradePlanModal;
window.openEditTradePlanModal = openEditTradePlanModal;
window.openCancelTradePlanModal = openCancelTradePlanModal;
window.openDeleteTradePlanModal = openDeleteTradePlanModal;
window.saveEditTradePlan = saveEditTradePlan;
window.confirmCancelTradePlan = confirmCancelTradePlan;
window.confirmDeleteTradePlan = confirmDeleteTradePlan;
window.checkLinkedItemsBeforeCancel = checkLinkedItemsBeforeCancel;
window.cancelTradePlan = cancelTradePlan;
window.deleteTradePlan = deleteTradePlan;
window.reactivateTradePlan = reactivateTradePlan;

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
    // שימוש במערכת הכללית לטעינת נתונים
    if (typeof window.loadTableData === 'function') {
      const data = await window.loadTableData('trade_plans', updateTradePlansTable);
      
      // עדכון נתונים גלובליים
      window.tradePlansData = data;
      window.tradePlansLoaded = true;
      
      return data;
    }
    
    // Fallback: Use trade-plan-service to load data
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
      console.log('🔄 Loading trade plans data directly from API...');
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
      console.log(`🔄 Updating table with ${data.length} trade plans...`);
      updateTradePlansTable(data);
      
      console.log(`✅ Loaded ${data.length} trade plans`);
      return data;
    }
  } catch (error) {
    handleDataLoadError(error, 'נתוני תכנונים');
    return [];
  }
}

/**
 * עדכון טבלת עיצובים (alias ל-updateTradePlansTable)
 */
function updateDesignsTable(trade_plans) {
  return updateTradePlansTable(trade_plans);
}


/**
 * פילטור נתוני תכנונים
 */
function filterTradePlansData(filters) {
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

  // פילטור לפי חשבון
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
  // === UPDATE TRADE PLANS TABLE FUNCTION CALLED ===
  console.log(`🔄 updateTradePlansTable called with ${trade_plans ? trade_plans.length : 0} trade plans`);

  const tbody = document.querySelector('#trade_plansTable tbody');
  console.log(`🔍 Looking for tbody:`, tbody);
  // Looking for table body

  if (!tbody) {
    handleElementNotFound('#trade_plansTable tbody', 'CRITICAL');
    return;
  }

  // Checking if there is data to display
  console.log(`🔍 Checking data: trade_plans =`, trade_plans, `length =`, trade_plans?.length);
  console.log(`🔍 Condition check: !trade_plans =`, !trade_plans, `trade_plans.length === 0 =`, trade_plans?.length === 0);
  if (!trade_plans || trade_plans.length === 0) {
    console.log(`❌ No data to display - entering error condition`);
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

  console.log(`✅ Data exists, proceeding to build table HTML`);
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

    // Date formatting using date-utils
    const dateDisplay = design.created_at && window.formatDate ? 
      window.formatDate(design.created_at) : 'לא מוגדר';

    // Type correction - ensuring a valid value is passed
    const typeDisplay = design.investment_type ? window.translateTradePlanType ? window.translateTradePlanType(design.investment_type) : design.investment_type : 'לא מוגדר';
    const sideDisplay = design.side === 'Long' ? 'Long' : 'Short';
    const amountDisplay = formatCurrency(design.planned_amount);
    const targetDisplay = formatCurrency(design.target_price);
    const stopDisplay = formatCurrency(design.stop_price);
    const currentDisplay = formatCurrency(design.current || 0);
    const statusDisplay = window.translateTradePlanStatus ? window.translateTradePlanStatus(design.status) : design.status;

    // Displaying ticker symbol or name with Entity Details link
    const tickerDisplay = design.ticker_symbol || design.ticker?.symbol || design.ticker?.name || 'לא מוגדר';
    const tickerLink = design.id && window.createButton ? window.createButton('LINK', `showEntityDetails('trade_plan', ${design.id})`, 'btn-sm') : '';

    // שמירת הערכים המקוריים באנגלית לפילטר
    const typeForFilter = design.investment_type || '';
    const statusForFilter = design.status || '';

    // חישוב רווח פשוט
    const profitAmount = design.current_price && design.planned_amount ? 
      (design.current_price - design.planned_amount) * (design.side === 'Long' ? 1 : -1) : 0;
    const profitDisplay = formatCurrency(profitAmount);

    return `
      <tr>
        <!-- 1. טיקר -->
        <td class="ticker-cell">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${tickerLink}
            <span class="entity-trade-plan-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
              ${tickerDisplay}
            </span>
          </div>
        </td>
        
        <!-- 2. תאריך -->
        <td data-date="${design.created_at}"><span class="date-text">${dateDisplay}</span></td>
        
        <!-- 3. סוג -->
        <td class="type-cell" data-type="${typeForFilter}">
          <span class="entity-trade-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${typeDisplay}
          </span>
        </td>
        
        <!-- 4. צד -->
        <td class="side-cell" data-side="${design.side}">
          <span class="${design.side === 'Long' ? 'numeric-value-positive' : 'numeric-value-negative'}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${sideDisplay}
          </span>
        </td>
        
        <!-- 5. כמות -->
        <td class="quantity-cell">
          <span class="numeric-value-positive" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
            ${formatCurrency(design.planned_amount || 0)}
          </span>
        </td>
        
        <!-- 6. מחיר -->
        <td class="price-cell">
          <span class="numeric-value-zero" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
            ${formatCurrency(design.current_price || 0)}
          </span>
        </td>
        
        <!-- 7. השקעה -->
        <td class="investment-cell">
          <span class="numeric-value-positive" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
            ${amountDisplay}
          </span>
        </td>
        
        <!-- 8. סטטוס -->
        <td class="status-cell" data-status="${statusForFilter}">
          <span class="status-${design.status}-badge" style="padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">
            ${statusDisplay}
          </span>
        </td>
        
        <!-- 9. רווח -->
        <td class="profit-cell">
          <span class="${profitAmount >= 0 ? 'numeric-value-positive' : 'numeric-value-negative'}" style="padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-weight: 500;">
            ${profitDisplay}
          </span>
        </td>
        
        <!-- 10. הערות -->
        <td class="notes-cell">
          <span style="font-size: 0.85em; color: #666;">
            ${design.notes || design.reasons || 'אין הערות'}
          </span>
        </td>
        
        <!-- 11. פעולות -->
        <td class="actions-cell">
            ${window.createLinkButton ? window.createLinkButton(`viewLinkedItemsForTradePlan(${design.id})`) : ''}
            ${window.createEditButton ? window.createEditButton(`editTradePlan(${design.id})`) : ''}
            ${window.createButton ? window.createButton('VIEW', `showTradePlanDetails(${design.id})`) : ''}
            ${window.createDeleteButton ? window.createDeleteButton(`deleteTradePlan(${design.id})`) : ''}
        </td>
      </tr>
    `;
    } catch (error) {
      console.error(`❌ Error processing design ${index + 1}:`, error);
      return `<tr><td colspan="11" class="text-center text-danger">שגיאה בעיבוד תכנון ${index + 1}</td></tr>`;
    }
  }).join('');

  console.log(`🔄 Table HTML built successfully, length: ${tableHTML.length}`);
  console.log(`🔄 Setting tbody.innerHTML with ${trade_plans.length} rows`);
  tbody.innerHTML = tableHTML;
  console.log(`✅ Table updated successfully`);

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
}

/**
 * עדכון סטטיסטיקות סיכום
 */
function updatePageSummaryStats() {
  // Using filtered data if available, otherwise all data
  const dataToUse = window.filteredTradePlansData || window.tradePlansData;
  
  if (!dataToUse || !Array.isArray(dataToUse)) {
    console.log('⚠️ No data available for statistics');
    return;
  }

  const totalDesigns = dataToUse.length;
  const openDesigns = dataToUse.filter(design => design.status === 'open').length;
  const closedDesigns = dataToUse.filter(design => design.status === 'closed').length;
  const cancelledDesigns = dataToUse.filter(design => design.status === 'cancelled').length;

  // Calculating sums using correct field names
  let totalInvestment = 0;
  let totalProfit = 0;

  dataToUse.forEach(design => {
    // Safeguarding against invalid data
    if (!design || typeof design !== 'object') {
      return;
    }

    // Using correct field name: planned_amount instead of amount
    let amount = 0;
    if (design.planned_amount !== null && design.planned_amount !== undefined) {
      if (typeof design.planned_amount === 'string') {
        amount = parseFloat(design.planned_amount.replace(/[$,]/g, '')) || 0;
      } else {
        amount = parseFloat(design.planned_amount) || 0;
      }
    }
    totalInvestment += amount;

    // Simple profit calculation using correct fields
    if (design.current_price && design.planned_amount) {
      const currentPrice = typeof design.current_price === 'string' ? 
        parseFloat(design.current_price.replace(/[$,]/g, '')) || 0 : 
        parseFloat(design.current_price) || 0;
      
      const plannedAmount = typeof design.planned_amount === 'string' ? 
        parseFloat(design.planned_amount.replace(/[$,]/g, '')) || 0 : 
        parseFloat(design.planned_amount) || 0;

      // Calculate profit based on side (Long/Short)
      const profit = (currentPrice - plannedAmount) * (design.side === 'Long' ? 1 : -1);
      totalProfit += profit;
    }
  });

  const avgInvestment = totalDesigns > 0 ? totalInvestment / totalDesigns : 0;

  console.log(`📊 Statistics: ${totalDesigns} designs, $${totalInvestment.toFixed(2)} total investment, $${totalProfit.toFixed(2)} total profit`);

  // עדכון אלמנטי הסיכום - בדיקה אם הם קיימים לפני הגישה
  const totalDesignsElement = document.getElementById('totalDesigns');
  if (totalDesignsElement) {
    totalDesignsElement.textContent = totalDesigns;
  }

  const totalInvestmentElement = document.getElementById('totalInvestment');
  if (totalInvestmentElement) {
    totalInvestmentElement.textContent = formatCurrency(totalInvestment);
  }

  const avgInvestmentElement = document.getElementById('avgInvestment');
  if (avgInvestmentElement) {
    avgInvestmentElement.textContent = formatCurrency(avgInvestment);
  }

  const totalProfitElement = document.getElementById('totalProfit');
  if (totalProfitElement) {
    totalProfitElement.textContent = formatCurrency(totalProfit);
  }

  // עדכון מספר הרשומות בטבלה
  const countElement = document.getElementById('trade_plansCount');
  if (countElement) {
    countElement.textContent = `${totalDesigns} תכנונים`;
  }
}

/**
 * הצגת מודל הוספת תכנון
 */
function showAddTradePlanModal() {
  // Initialize and clear form using validation system
  initializeAddModalForm();
  setAddModalDefaults();
  
  // Display the modal first
  const modalElement = document.getElementById('addTradePlanModal');
  if (modalElement) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
    }
  }
  
  // Load data asynchronously (after modal is visible) - don't await!
  loadAddModalData().then(() => {
    console.log('✅ נתונים נטענו בהצלחה');
    // Initialize validation after data is loaded
    initializeAddModalValidation();
    // Add event listeners for ticker and account selection
    setupAddModalFieldActivation();
  }).catch(error => {
    console.error('❌ שגיאה בטעינת נתונים למודל:', error);
  });
}

/**
 * איפוס טופס הוספה
 * Initialize and reset add modal form
 */
function initializeAddModalForm() {
  const form = document.getElementById('addTradePlanForm');
  if (!form) return;
  
  form.reset();
  
  // Clear all validation states using validation system
  if (typeof window.clearValidation === 'function') {
    window.clearValidation('addTradePlanForm');
  }
  
  // Clear form fields manually
  const allInputs = form.querySelectorAll('input, select, textarea');
  allInputs.forEach(input => {
    if (input.type !== 'date') {
      input.value = '';
      input.classList.remove('is-valid', 'is-invalid');
    }
  });
}

/**
 * הגדרת ערכי ברירת מחדל
 * Set default values for form fields
 */
function setAddModalDefaults() {
  // Disable all fields until ticker AND account are selected
  const fieldsToDisable = [
    'addTradePlanInvestmentType', 'addTradePlanSide', 'addTradePlanPlannedAmount',
    'addTradePlanShares', 'addTradePlanStopPrice', 'addTradePlanTargetPrice',
    'addTradePlanEntryConditions', 'addTradePlanReasons'
  ];
  
  fieldsToDisable.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.disabled = true;
      field.removeAttribute('required');
    }
  });
  
  // Set default values (but keep fields disabled)
  const defaults = {
    'addTradePlanInvestmentType': 'swing',
    'addTradePlanSide': 'Long',
    'addTradePlanPlannedAmount': '1000',
    'addTradePlanDate': new Date().toISOString().split('T')[0]
  };
  
  Object.entries(defaults).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.value = value;
  });
  
  // Clear other fields
  const fieldsToClear = [
    'addTradePlanShares', 'addTradePlanStopPrice', 'addTradePlanTargetPrice',
    'addTradePlanEntryConditions', 'addTradePlanReasons'
  ];
  
  fieldsToClear.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = '';
  });
  
  // Clear ticker display
  const displays = {
    'selectedTickerDisplay': 'לא נבחר',
    'currentPriceDisplay': '-',
    'dailyChangeDisplay': '-'
  };
  
  Object.entries(displays).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
      if (id === 'dailyChangeDisplay') {
        element.style.color = '#6c757d';
      }
    }
  });
}

/**
 * טעינת נתונים למודל
 * Load data for modal (tickers, accounts, etc.)
 */
async function loadAddModalData() {
  await loadTickersForAddModal();
  await loadAccountsForAddModal();
}

/**
 * טעינת רשימת הטיקרים בחלון ההוספה
 */
async function loadTickersForAddModal() {
  const tickerSelect = document.getElementById('addTradePlanTickerId');
  if (!tickerSelect) return;

  // ניקוי הרשימה הקיימת
  tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';

  try {
    // ניסיון לקבל טיקרים מהשירות
    let tickers = [];
    if (typeof window.tickerService?.getTickers === 'function') {
      tickers = await window.tickerService.getTickers();
    } else if (window.tickersData) {
      tickers = window.tickersData;
    } else {
      // קריאה ישירה לAPI אם אין שירות
      const response = await fetch('/api/tickers');
      if (response.ok) {
        const data = await response.json();
        tickers = data.data || data;
      }
    }

    // סינון טיקרים - רק פתוחים או סגורים (לא מבוטלים)
    const activeTickers = tickers.filter(ticker =>
      ticker.status === 'open' || ticker.status === 'closed'
    );

    // הוספת הטיקרים הפעילים לרשימה
    activeTickers.forEach(ticker => {
      const option = document.createElement('option');
      option.value = ticker.id;
      option.textContent = ticker.symbol || ticker.name;
      tickerSelect.appendChild(option);
    });
    
    console.log(`✅ נטענו ${activeTickers.length} טיקרים פעילים`);
  } catch (error) {
    console.error('❌ שגיאה בטעינת טיקרים:', error);
  }
}

/**
 * טעינת רשימת החשבונות בחלון ההוספה
 */
async function loadAccountsForAddModal() {
  const accountSelect = document.getElementById('addTradePlanTradingAccount');
  if (!accountSelect) return;

  // ניקוי הרשימה הקיימת
  accountSelect.innerHTML = '<option value="">בחר חשבון</option>';

  try {
    // ניסיון לקבל חשבונות - קריאה ישירה לAPI
    let accounts = [];
    const response = await fetch('/api/trading-accounts/');
    if (response.ok) {
      const data = await response.json();
      accounts = data.data || data;
      
      // שמירה גלובלית לשימוש חוזר
      if (!window.trading_accountsData) {
        window.trading_accountsData = accounts;
      }
    }

    // סינון חשבונות - רק פתוחים (לא מבוטלים)
    const activeAccounts = accounts.filter(account =>
      account.status === 'open'
    );

    // הוספת החשבונות הפעילים לרשימה
    activeAccounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      accountSelect.appendChild(option);
    });
    
    console.log(`✅ נטענו ${activeAccounts.length} חשבונות פעילים`);
  } catch (error) {
    console.error('❌ שגיאה בטעינת חשבונות:', error);
  }
}

/**
 * הגדרת event listeners להפעלת שדות
 * Setup field activation when ticker is selected
 */
function setupAddModalFieldActivation() {
  const tickerSelect = document.getElementById('addTradePlanTickerId');
  
  if (!tickerSelect) {
    console.warn('⚠️ Ticker select not found!');
    return;
  }
  
  console.log('✅ Setting up ticker change listener');
  
  // Add event listener for ticker selection
  // Remove old listener if exists to prevent duplicates
  const oldListener = tickerSelect.onchange;
  tickerSelect.onchange = null;
  
  tickerSelect.addEventListener('change', () => {
    console.log('🔄 Ticker changed, calling updateTickerInfo');
    updateTickerInfo();
  });
}

/**
 * אתחול ולידציה למודל
 * Initialize validation for add modal
 */
function initializeAddModalValidation() {
  if (typeof window.initializeValidation !== 'function') {
    console.warn('window.initializeValidation not available');
    return;
  }
  
  const validationRules = {
    'addTradePlanTickerId': {
      required: true,
      type: 'select',
      message: 'יש לבחור טיקר'
    },
    'addTradePlanInvestmentType': {
      required: true,
      type: 'select',
      message: 'יש לבחור סוג השקעה',
      customValidation: value => {
        const validTypes = ['swing', 'investment', 'passive'];  // Per database constraints
        return validTypes.includes(value) || 'סוג השקעה לא תקין. ערכים תקינים: swing, investment, passive';
      }
    },
    'addTradePlanSide': {
      required: true,
      type: 'select',
      message: 'יש לבחור צד',
      customValidation: value => {
        const validSides = ['Long', 'Short'];
        return validSides.includes(value) || 'צד לא תקין';
      }
    },
    'addTradePlanPlannedAmount': {
      required: true,
      type: 'number',
      min: 0.01,
      max: 999999999,
      message: 'יש להזין סכום מתוכנן'
    },
    'addTradePlanStopPrice': {
      type: 'number',
      min: 0.01,
      max: 999999999
    },
    'addTradePlanTargetPrice': {
      type: 'number',
      min: 0.01,
      max: 999999999
    },
    'addTradePlanEntryConditions': {
      required: false,  // Not mandatory
      type: 'text',
      maxLength: 500
    },
    'addTradePlanReasons': {
      required: false,  // Not mandatory
      type: 'text',
      maxLength: 500
    }
  };
  
  try {
    window.initializeValidation('addTradePlanForm', validationRules);
  } catch (error) {
    console.error('Error initializing validation:', error);
  }
}

/**
 * ולידציה של טופס הוספת תכנון טרייד
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateTradePlanForm() {
    return window.validateEntityForm('addTradePlanForm', [
        { id: 'addTradePlanTickerId', name: 'טיקר' },
        { 
            id: 'addTradePlanInvestmentType', 
            name: 'סוג השקעה',
            validation: (value) => {
                const validTypes = ['swing', 'investment', 'passive'];  // Per database constraints
                if (!validTypes.includes(value)) {
                    return 'סוג השקעה לא תקין. ערכים תקינים: swing, investment, passive';
                }
                return true;
            }
        },
        { 
            id: 'addTradePlanSide', 
            name: 'צד',
            validation: (value) => {
                const validSides = ['Long', 'Short'];
                if (!validSides.includes(value)) {
                    return 'צד לא תקין';
                }
                return true;
            }
        },
        { 
            id: 'addTradePlanPlannedAmount', 
            name: 'סכום מתוכנן',
            validation: (value) => {
                const numValue = parseFloat(value);
                if (isNaN(numValue)) return 'סכום מתוכנן חייב להיות מספר';
                if (numValue <= 0) return 'סכום מתוכנן חייב להיות חיובי';
                return true;
            }
        },
        { 
            id: 'addTradePlanStopPrice', 
            name: 'מחיר עצירה',
            validation: (value) => {
                if (value && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) return 'מחיר עצירה חייב להיות מספר';
                    if (numValue <= 0) return 'מחיר עצירה חייב להיות חיובי';
                }
                return true;
            }
        },
        { 
            id: 'addTradePlanTargetPrice', 
            name: 'מחיר יעד',
            validation: (value) => {
                if (value && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) return 'מחיר יעד חייב להיות מספר';
                    if (numValue <= 0) return 'מחיר יעד חייב להיות חיובי';
                }
                return true;
            }
        },
        { 
            id: 'addTradePlanEntryConditions', 
            name: 'תנאי כניסה',
            required: false,  // Not mandatory per database model
            validation: (value) => {
                if (value && value.length > 500) {
                    return 'תנאי כניסה לא יכול להיות יותר מ-500 תווים';
                }
                return true;
            }
        },
        { 
            id: 'addTradePlanReasons', 
            name: 'סיבות',
            required: false,  // Not mandatory per database model
            validation: (value) => {
                if (value && value.length > 500) {
                    return 'סיבות לא יכולות להיות יותר מ-500 תווים';
                }
                return true;
            }
        }
    ]);
}

/**
 * שמירת תכנון חדש
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function saveNewTradePlan() {
  try {
    // 1. ולידציה של הטופס
    if (!validateTradePlanForm()) {
        return; // עצירה אם הולידציה נכשלה
    }
  
    // 2. קבלת ברירת מחדל לחשבון מסחר
    const defaultAccount = await window.getPreference('default_trading_account');
    const accountId = defaultAccount ? parseInt(defaultAccount) : 1;
    
    // 3. בניית אובייקט נתונים
    const formData = {
      account_id: accountId,
      ticker_id: parseInt(document.getElementById('addTradePlanTickerId').value),
      investment_type: document.getElementById('addTradePlanInvestmentType').value,
      side: document.getElementById('addTradePlanSide').value,
      planned_amount: parseFloat(document.getElementById('addTradePlanPlannedAmount').value),
      stop_price: document.getElementById('addTradePlanStopPrice').value ? parseFloat(document.getElementById('addTradePlanStopPrice').value) : null,
      target_price: document.getElementById('addTradePlanTargetPrice').value ? parseFloat(document.getElementById('addTradePlanTargetPrice').value) : null,
      entry_conditions: document.getElementById('addTradePlanEntryConditions').value || '',
      reasons: document.getElementById('addTradePlanReasons').value || '',
      status: 'open',
    };

    // 4. שליחה לשרת
    const response = await fetch('/api/trade_plans/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // 5. טיפול בתגובה
    if (!response.ok) {
      const errorData = await response.json();
      
      // בדיקה אם זו שגיאת ולידציה (HTTP 400)
      if (response.status === 400) {
        if (typeof window.showSimpleErrorNotification === 'function') {
          window.showSimpleErrorNotification('שגיאת ולידציה', errorData.message || 'נתונים לא תקינים');
        }
        return;
      }
      
      // שגיאת מערכת אחרת
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // 6. הצגת הודעת הצלחה
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'תכנון הטרייד נשמר בהצלחה');
    }

    // 7. סגירת המודל
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTradePlanModal'));
    if (modal) {
      modal.hide();
    }

    // 8. רענון הטבלה
    if (typeof window.loadTradePlansData === 'function') {
      await window.loadTradePlansData();
    }

  } catch (error) {
    console.error('Error saving trade plan:', error);
    
    // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בשמירת תכנון', error.message);
    }
  }
}

/**
 * המרת שם שדה מהשרת ל-ID של השדה בטופס
 */
function getFieldIdFromServerField(serverField) {
  const fieldMapping = {
    'ticker_id': 'addTradePlanTickerId',
    'investment_type': 'addTradePlanInvestmentType',
    'side': 'addTradePlanSide',
    'planned_amount': 'addTradePlanPlannedAmount',
    'stop_price': 'addTradePlanStopPrice',
    'target_price': 'addTradePlanTargetPrice',
  };
  return fieldMapping[serverField] || null;
}

/**
 * עריכת תכנון
 */
function editTradePlan(designId) {
  // קריאה לפונקציה הגלובלית לפתיחת מודל עריכה
  if (typeof window.openEditTradePlanModal === 'function') {
    window.openEditTradePlanModal(designId);
  } else {
    handleFunctionNotFound('openEditTradePlanModal');
    showErrorNotification('Error opening edit modal', 'Edit modal function not found');
  }
}


/**
 * מחיקת תכנון
 */
async function deleteTradePlan(tradePlanId) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/trade_plans/${tradePlanId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('תכנון נמחק בהצלחה!', 'success');
    }

    // רענון הטבלה
    await loadTradePlansData();

  } catch (error) {
    handleDeleteError(error, 'תכנון');

    let errorMessage = 'שגיאה במחיקת התכנון';
    let hasLinkedItems = false;

    try {
      const errorData = JSON.parse(error.message);
      errorMessage = errorData.error?.message || errorMessage;

      // בדיקה אם השגיאה היא על פריטים מקושרים
      if (errorMessage.includes('פריטים מקושרים') || errorMessage.includes('linked items')) {
        hasLinkedItems = true;
      }
    } catch {
      errorMessage = error.message || errorMessage;
    }

    if (hasLinkedItems) {
      // הצגת חלון מקושרים באמצעות המערכת הכללית
      if (typeof window.showLinkedItemsModal === 'function') {
        try {
          const response = await fetch(`/api/linked-items/trade_plan/${tradePlanId}`);
          if (response.ok) {
            const data = await response.json();
            window.showLinkedItemsModal(data, 'trade_plan', tradePlanId);
          } else {
            throw new Error('Failed to load linked items data');
          }
        } catch (linkedError) {
          handleDataLoadError(linkedError, 'פריטים מקושרים');
          if (typeof window.showNotification === 'function') {
            window.showNotification('לא ניתן למחוק תכנון שיש לו פריטים מקושרים', 'error');
          }
        }
      } else {
        handleFunctionNotFound('showLinkedItemsModal');
        if (typeof window.showNotification === 'function') {
          window.showNotification('לא ניתן למחוק תכנון שיש לו פריטים מקושרים', 'error');
        }
      }
    } else {
      // הצגת הודעת שגיאה רגילה
      if (typeof window.showNotification === 'function') {
        window.showNotification(errorMessage, 'error');
      }
    }
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

/**
 * שחזור מצב סידור - שימוש בפונקציה גלובלית
 * @deprecated Use window.restoreAnyTableSort from main.js instead
 */
function restoreSortState() {
  // Check if data is available
  if (!window.tradePlansData || window.tradePlansData.length === 0) {
    console.log('⚠️ No trade plans data available for sort restoration');
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
    console.log('📋 Loading user preferences for trade_plans...');
    
    // נסה ראשית מערכת  גלובלית
    if (typeof window.getCurrentPreference === 'function') {
      console.log('✅ Using global preferences system');
      return {
        timezone: await window.getCurrentPreference('timezone') || 'Asia/Jerusalem',
        primaryCurrency: await window.getCurrentPreference('primaryCurrency') || 'USD',
        defaultStopLoss: await window.getCurrentPreference('defaultStopLoss') || 5,
        defaultTargetPrice: await window.getCurrentPreference('defaultTargetPrice') || 10
      };
    }
    
    // Fallback ל-API
    try {
      const newResponse = await fetch('/api/preferences/user');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        if (newData.success && newData.data.preferences) {
          console.log('✅ Using new API preferences');
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
      console.log('🔄 New API not available, trying fallback...');
    }
    
    // Fallback ל-API
    try {
      const response = await fetch('/api/preferences/user');
      if (response.ok) {
        const preferences = await response.json();
        console.log('✅ Using API preferences');
        return preferences;
      }
    } catch (migrationError) {
      console.log('🔄 API not available, trying local config...');
    }
    
    // Fallback אחרון - קובץ JSON מקומי (legacy)
    const response = await fetch('/api/preferences/user');
    if (response.ok) {
      const preferences = await response.json();
      console.log('🔄 Using local JSON preferences (legacy)');
      return preferences.user || preferences.defaults;
    }
    
  } catch (error) {
    handleDataLoadError(error, 'העדפות משתמש');
  }
  
  // ברירת מחדל
  console.log('🔄 Using default preferences');
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

// Initialization
document.addEventListener('DOMContentLoaded', function () {

  // Restoring section state - using global system
  if (typeof window.restoreAllSectionStates === 'function') {
    window.restoreAllSectionStates();
  } else {
    if (typeof handleFunctionNotFound === 'function') {
      handleFunctionNotFound('restoreAllSectionStates');
    } else {
      // console.warn('restoreAllSectionStates function not found');
    }
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
});

// updateGridFromComponent is already defined at the beginning of the file

// Adding functions to global scope
window.loadTradePlansData = loadTradePlansData;
window.updateTradePlansTable = updateTradePlansTable;
window.showAddTradePlanModal = showAddTradePlanModal;
// Export validation function
window.validateTradePlanForm = validateTradePlanForm;

// Export save/edit functions
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
// window.restorePlanningSectionState = restorePlanningSectionState; // REMOVED: Using global system


// Export validation functions
// Global validation functions are already exported from validation-utils.js
// No local validation functions to export

// פונקציות חסרות
window.loadPlanningData = function () {
  loadTradePlansData();
};

// הפונקציה setupSortableHeaders כבר מוגדרת ב-page-utils.js
// אין צורך להגדיר אותה שוב כאן

function setupSortableHeadersLocal() {
  const headers = document.querySelectorAll('#trade_plansTable th[onclick]');
  headers.forEach(header => {
    header.style.cursor = 'pointer';
    header.title = 'לחץ למיון';
  });
}

// פונקציות לפתיחה/סגירה של סקשנים - removed duplicate function that was causing infinite recursion
// The global toggleSection function from ui-utils.js is used instead

// toggleSection function removed - use toggleSection('main') instead

// פונקציה לשחזור מצב הסגירה
// function restorePlanningSectionState() - REMOVED: Using global section state management system
// The global restoreAllSectionStates() function from ui-utils.js is used instead


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

/**
 * הוספת הערה חשובה
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
// All validation functions are now handled by the global validation system in validation-utils.js
// No local validation functions needed - using window.showFieldError, window.clearValidationErrors, etc.

/**
 * עדכון מידע טיקר
 */
function updateTickerInfo() {
  const tickerSelect = document.getElementById('addTradePlanTickerId');
  if (!tickerSelect) {
    console.warn('⚠️ tickerSelect not found');
    return;
  }
  
  const tickerDisplay = document.getElementById('selectedTickerDisplay');
  const priceDisplay = document.getElementById('currentPriceDisplay');
  const changeDisplay = document.getElementById('dailyChangeDisplay');
  const stopPriceInput = document.getElementById('addTradePlanStopPrice');
  const targetPriceInput = document.getElementById('addTradePlanTargetPrice');

  // קבלת כל השדות שצריכים להיות מופעלים/מושבתים
  const investmentTypeSelect = document.getElementById('addTradePlanInvestmentType');
  const sideSelect = document.getElementById('addTradePlanSide');
  const amountInput = document.getElementById('addTradePlanPlannedAmount');
  const sharesInput = document.getElementById('addTradePlanShares');
  const entryConditionsTextarea = document.getElementById('addTradePlanEntryConditions');
  const reasonsTextarea = document.getElementById('addTradePlanReasons');

  if (tickerSelect.value) {
    const selectedOption = tickerSelect.options[tickerSelect.selectedIndex];
    const tickerSymbol = selectedOption.textContent;

    if (tickerDisplay) tickerDisplay.textContent = tickerSymbol;

    // Demo values - בעתיד יבואו מהשרת
    const currentPrice = 150.25;
    if (priceDisplay) priceDisplay.textContent = '$' + currentPrice.toFixed(2);
    
    const dailyChangeValue = '+2.5%';
    if (changeDisplay) {
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
    }

    // הפעלת כל השדות
    if (investmentTypeSelect) {
      investmentTypeSelect.disabled = false;
      investmentTypeSelect.setAttribute('required', 'required');
    }
    if (sideSelect) {
      sideSelect.disabled = false;
      sideSelect.setAttribute('required', 'required');
    }
    if (amountInput) {
      amountInput.disabled = false;
      amountInput.setAttribute('required', 'required');
    }
    if (sharesInput) sharesInput.disabled = false;
    if (stopPriceInput) stopPriceInput.disabled = false;
    if (targetPriceInput) targetPriceInput.disabled = false;
    if (entryConditionsTextarea) entryConditionsTextarea.disabled = false;
    if (reasonsTextarea) reasonsTextarea.disabled = false;


    // עדכון מחירי עצירה ויעד ברירת מחדל
    updateDefaultPrices(currentPrice);

    // עדכון מספר מניות אם יש סכום
    if (amountInput.value) {
      updateSharesFromAmount();
    }
  } else {
    // Clear displays
    if (tickerDisplay) tickerDisplay.textContent = 'לא נבחר';
    if (priceDisplay) priceDisplay.textContent = '-';
    if (changeDisplay) {
      changeDisplay.textContent = '-';
      changeDisplay.style.color = '#6c757d';
    }

    // השבתת כל השדות
    if (investmentTypeSelect) {
      investmentTypeSelect.disabled = true;
      investmentTypeSelect.removeAttribute('required');
      investmentTypeSelect.value = '';
    }
    if (sideSelect) {
      sideSelect.disabled = true;
      sideSelect.removeAttribute('required');
      sideSelect.value = '';
    }
    if (amountInput) {
      amountInput.disabled = true;
      amountInput.removeAttribute('required');
      amountInput.value = '';
    }
    if (sharesInput) {
      sharesInput.disabled = true;
      sharesInput.value = '';
    }
    if (stopPriceInput) {
      stopPriceInput.disabled = true;
      stopPriceInput.value = '';
    }
    if (targetPriceInput) {
      targetPriceInput.disabled = true;
      targetPriceInput.value = '';
    }
    if (entryConditionsTextarea) {
      entryConditionsTextarea.disabled = true;
      entryConditionsTextarea.value = '';
    }
    if (reasonsTextarea) {
      reasonsTextarea.disabled = true;
      reasonsTextarea.value = '';
    }
  }
}

/**
 * עדכון מחירי עצירה ויעד ברירת מחדל
 * Uses price calculation functions from ui-basic.js
 */
function updateDefaultPrices(currentPrice) {
  const stopPriceInput = document.getElementById('addTradePlanStopPrice');
  const targetPriceInput = document.getElementById('addTradePlanTargetPrice');
  const sideSelect = document.getElementById('addTradePlanSide');
  
  if (!stopPriceInput || !targetPriceInput || !currentPrice) return;
  
  const side = sideSelect ? sideSelect.value : 'Long';
  
  // Calculate default stop price (10% stop loss) using global function
  if (!stopPriceInput.value && window.calculateStopPrice) {
    const stopPrice = window.calculateStopPrice(currentPrice, 10, side);
    stopPriceInput.value = stopPrice.toFixed(2);
  }
  
  // Calculate default target price (20% target gain) using global function
  if (!targetPriceInput.value && window.calculateTargetPrice) {
    const targetPrice = window.calculateTargetPrice(currentPrice, 20, side);
    targetPriceInput.value = targetPrice.toFixed(2);
  }
}

/**
 * עדכון מספר מניות מסכום
 * Calculate shares from amount using price
 */
function updateSharesFromAmount() {
  const amountInput = document.getElementById('addTradePlanPlannedAmount');
  const sharesInput = document.getElementById('addTradePlanShares');
  const priceDisplay = document.getElementById('currentPriceDisplay');

  if (!amountInput || !sharesInput || !priceDisplay) return;
  if (!amountInput.value || priceDisplay.textContent === '-') return;

  const amount = parseFloat(amountInput.value);
  const price = parseFloat(priceDisplay.textContent.replace('$', ''));

  if (price > 0 && window.convertAmountToShares) {
    const result = window.convertAmountToShares(amount, price);
    sharesInput.value = result.shares;
  } else if (price > 0) {
    // Simple fallback
    sharesInput.value = Math.floor(amount / price);
  }
}

/**
 * עדכון סכום ממספר מניות
 * Calculate amount from shares using price
 */
function updateAmountFromShares() {
  const sharesInput = document.getElementById('addTradePlanShares');
  const amountInput = document.getElementById('addTradePlanPlannedAmount');
  const priceDisplay = document.getElementById('currentPriceDisplay');

  if (!sharesInput || !amountInput || !priceDisplay) return;
  if (!sharesInput.value || priceDisplay.textContent === '-') return;

  const shares = parseFloat(sharesInput.value);
  const price = parseFloat(priceDisplay.textContent.replace('$', ''));

  if (price > 0 && window.convertSharesToAmount) {
    const amount = window.convertSharesToAmount(shares, price);
    amountInput.value = amount;
  } else if (price > 0) {
    // Simple fallback
    amountInput.value = (shares * price).toFixed(2);
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
if (typeof loadTradePlansData === 'function') {
  setTimeout(() => {
    loadTradePlansData();
  }, 1000);
} else {
  handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה בסוף הקובץ');
}

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
// window.copyDetailedLog export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local copyDetailedLog function for trade_plans page
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

// קריאה ב-DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('/trade_plans')) {
    setTimeout(() => {
      if (typeof loadTradePlansData === 'function') {
        loadTradePlansData();
      } else {
        handleFunctionNotFound('loadTradePlansData', 'פונקציית טעינת נתוני תכנונים לא נמצאה ב-DOMContentLoaded');
      }
    }, 500);
  }
});
