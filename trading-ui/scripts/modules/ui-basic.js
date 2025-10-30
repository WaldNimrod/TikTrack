/**
 * UI Utilities JavaScript
 *
 * פונקציות UI משותפות באמת - רק מה שמשמש הרבה עמודים
 *
 * File: trading-ui/scripts/ui-utils.js
 * Version: 1.2
 * Last Updated: January 15, 2025
 *
 * Added: Price calculation functions for trade plans, trades, and tickers
 * Added: Section toggle functions for opening/closing sections
 */

// ===== PRICE CALCULATION FUNCTIONS =====
// These functions are used across multiple pages (trade plans, trades, tickers)

/**
 * Calculate stop price based on percentage
 * @param {number} currentPrice - Current price of the ticker
 * @param {number} stopPercentage - Stop percentage (e.g., 0.1 for 10%)
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {number} Calculated stop price
 */
function calculateStopPrice(currentPrice, stopPercentage, side = 'Long') {
  if (!currentPrice || currentPrice <= 0) {
    // Invalid current price for stop calculation
    return 0;
  }

  if (!stopPercentage || stopPercentage <= 0) {
    // Invalid stop percentage
    return 0;
  }

  const percentage = stopPercentage / 100; // Convert to decimal

  if (side === 'Long') {
    // For Long: Stop below current price
    return currentPrice * (1 - percentage);
  } else if (side === 'Short') {
    // For Short: Stop above current price
    return currentPrice * (1 + percentage);
  } else {
    // Invalid side for stop calculation
    return 0;
  }
}

/**
 * Calculate target price based on percentage
 * @param {number} currentPrice - Current price of the ticker
 * @param {number} targetPercentage - Target percentage (e.g., 2000 for 2000%)
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {number} Calculated target price
 */
function calculateTargetPrice(currentPrice, targetPercentage, side = 'Long') {
  if (!currentPrice || currentPrice <= 0) {
    // Invalid current price for target calculation
    return 0;
  }

  if (!targetPercentage || targetPercentage <= 0) {
    // Invalid target percentage
    return 0;
  }

  const percentage = targetPercentage / 100; // Convert to decimal

  if (side === 'Long') {
    // For Long: Target above current price
    return currentPrice * (1 + percentage);
  } else if (side === 'Short') {
    // For Short: Target below current price
    return currentPrice * (1 - percentage);
  } else {
    // Invalid side for target calculation
    return 0;
  }
}

/**
 * Calculate percentage from current price to target price
 * @param {number} currentPrice - Current price
 * @param {number} targetPrice - Target price
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {number} Percentage difference
 */
function calculatePercentageFromPrice(currentPrice, targetPrice, side = 'Long') {
  if (!currentPrice || currentPrice <= 0) {
    // Invalid current price for percentage calculation
    return 0;
  }

  if (!targetPrice || targetPrice <= 0) {
    // Invalid target price for percentage calculation
    return 0;
  }

  if (side === 'Long') {
    return (targetPrice - currentPrice) / currentPrice * 100;
  } else if (side === 'Short') {
    return (currentPrice - targetPrice) / currentPrice * 100;
  } else {
    // Invalid side for percentage calculation
    return 0;
  }
}

/**
 * Update stop and target prices in form based on current price and percentages
 * @param {string} formId - ID of the form
 * @param {number} currentPrice - Current price of the ticker
 */
function updatePricesFromPercentages(formId, currentPrice) {
  const form = document.getElementById(formId);
  if (!form) {
    handleElementNotFound('updatePricesFromPercentages', `Form not found: ${formId}`);
    return;
  }

  const sideElement = form.querySelector('[name="side"]');
  const stopPercentageElement = form.querySelector('[name="stop_percentage"]');
  const targetPercentageElement = form.querySelector('[name="target_percentage"]');
  const stopPriceElement = form.querySelector('[name="stop_price"]');
  const targetPriceElement = form.querySelector('[name="target_price"]');

  if (!sideElement || !stopPercentageElement || !targetPercentageElement ||
        !stopPriceElement || !targetPriceElement) {
    handleElementNotFound('updatePricesFromPercentages', 'Required form elements not found');
    return;
  }

  const side = sideElement.value || 'Long';
  const stopPercentage = parseFloat(stopPercentageElement.value) || 0.1;
  const targetPercentage = parseFloat(targetPercentageElement.value) || 2000;

  // Calculate new prices
  const newStopPrice = calculateStopPrice(currentPrice, stopPercentage, side);
  const newTargetPrice = calculateTargetPrice(currentPrice, targetPercentage, side);

  // Update form fields
  stopPriceElement.value = newStopPrice.toFixed(2);
  targetPriceElement.value = newTargetPrice.toFixed(2);

  // Updated prices from percentages
  // console.log('Updated prices from percentages:', {
  //   currentPrice,
  //   side,
  //   stopPercentage,
  //   targetPercentage,
  //   newStopPrice: newStopPrice.toFixed(2),
  //   newTargetPrice: newTargetPrice.toFixed(2),
  // });
}

/**
 * Update percentages in form based on current price and target prices
 * @param {string} formId - ID of the form
 * @param {number} currentPrice - Current price of the ticker
 */
function updatePercentagesFromPrices(formId, currentPrice) {
  const form = document.getElementById(formId);
  if (!form) {
    handleElementNotFound('updatePercentagesFromPrices', `Form not found: ${formId}`);
    return;
  }

  const sideElement = form.querySelector('[name="side"]');
  const stopPriceElement = form.querySelector('[name="stop_price"]');
  const targetPriceElement = form.querySelector('[name="target_price"]');
  const stopPercentageElement = form.querySelector('[name="stop_percentage"]');
  const targetPercentageElement = form.querySelector('[name="target_percentage"]');

  if (!sideElement || !stopPriceElement || !targetPriceElement ||
        !stopPercentageElement || !targetPercentageElement) {
    handleElementNotFound('updatePercentagesFromPrices', 'Required form elements not found');
    return;
  }

  const side = sideElement.value || 'Long';
  const stopPrice = parseFloat(stopPriceElement.value) || 0;
  const targetPrice = parseFloat(targetPriceElement.value) || 0;

  // Calculate new percentages
  const newStopPercentage = calculatePercentageFromPrice(currentPrice, stopPrice, side);
  const newTargetPercentage = calculatePercentageFromPrice(currentPrice, targetPrice, side);

  // Update form fields
  stopPercentageElement.value = newStopPercentage.toFixed(2);
  targetPercentageElement.value = newTargetPercentage.toFixed(2);

  // Updated percentages from prices
  // console.log('Updated percentages from prices:', {
  //   currentPrice,
  //   side,
  //   stopPrice,
  //   targetPrice,
  //   newStopPercentage: newStopPercentage.toFixed(2),
  //   newTargetPercentage: newTargetPercentage.toFixed(2),
  // });
}

/**
 * Format percentage for display
 * @param {number} percentage - Percentage value
 * @returns {string} Formatted percentage string
 */
function formatPercentage(percentage) {
  if (percentage >= 100) {
    return `${percentage.toFixed(0)}%`;
  } else {
    return `${percentage.toFixed(2)}%`;
  }
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

// ===== MODAL UTILITIES =====
// These functions handle modal operations

/**
 * פתיחת מודל כללי
 * Show modal by ID
 *
 * @param {string} modalId - מזהה המודל
 * @param {Object} options - אפשרויות נוספות
 */
function showModal(modalId, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    handleElementNotFound('showModal', `Modal ${modalId} not found`);
    return;
  }

  // הגדרת אפשרויות ברירת מחדל
  const defaultOptions = {
    backdrop: true,
    keyboard: true,
    focus: true,
  };

  const modalOptions = { ...defaultOptions, ...options };

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal, modalOptions);
  bootstrapModal.show();
}

/**
 * הצגת הודעת אישור שנייה
 * Show second confirmation modal
 */
// function showSecondConfirmation(title, message, onConfirm) - לא בשימוש כרגע

/**
 * אישור פעולה שנייה
 * Confirm second action
 */
// function confirmSecondAction() - לא בשימוש כרגע


// ===== Notification Functions =====

// ===== Color Functions =====
// These functions handle color formatting

// ===== Color Functions =====
// These functions handle color formatting

/**
 * פונקציה לצביעת סכומים (חיובי/שלילי) - הוסרה כי לא בשימוש
 * Function for coloring amounts (positive/negative) - removed because not used
 */
// function colorAmount(amount, displayText = null) { ... }

/**
 * המרת סוג הודעה לצבע Bootstrap - הוסרה כי לא בשימוש
 * Convert notification type to Bootstrap color - removed because not used
 */
// function getBootstrapColor(type) { ... }

// ===== Export Functions =====
window.showModal = showModal;

// Export price calculation functions to global scope
window.calculateStopPrice = calculateStopPrice;
window.calculateTargetPrice = calculateTargetPrice;
window.calculatePercentageFromPrice = calculatePercentageFromPrice;
window.updatePricesFromPercentages = updatePricesFromPercentages;
window.updatePercentagesFromPrices = updatePercentagesFromPrices;
window.formatPercentage = formatPercentage;
window.formatPrice = formatPrice;

// ייצוא המודול עצמו
window.uiUtils = {
  // Price calculation functions
  calculateStopPrice,
  calculateTargetPrice,
  calculatePercentageFromPrice,
  updatePricesFromPercentages,
  updatePercentagesFromPrices,
  formatPercentage,
  formatPrice,
};

/**
 * Show warning modal for deletion with linked items
 *
 * Creates a warning modal that displays linked items that prevent deletion,
 * similar to the linked items modal but with warning styling and deletion-specific content.
 *
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 */


/**
 * Create linked items warning modal content
 *
 * Generates the HTML content for the linked items warning modal, including
 * warning message and detailed information about linked items that prevent deletion.
 *
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 * @returns {string} HTML content for the modal
 */


/**
 * Create linked items warning list
 *
 * Creates a 3-column grid layout for displaying linked items in warning modal.
 *
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the linked items list
 */


/**
 * Global cancel function - unified cancel behavior across all pages
 *
 * @param {string} itemType - Type of the item ('trade', 'ticker', 'alert', 'account', 'trade_plan', etc.)
 * @param {number} itemId - ID of the item
 * @param {string} itemName - Display name of the item (optional)
 * @param {string} currentStatus - Current status of the item (optional)
 */
async function cancelItem(itemType, itemId, itemName = null, currentStatus = null) {
  // Global cancel function called for

  // בדיקה אם האובייקט כבר מבוטל
  if (currentStatus === 'cancelled') {
    // Item is already cancelled
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification(`${getItemTypeDisplayName(itemType)} כבר מבוטל`);
    }
    return;
  }

  // הגדרת הפעולה הנוכחית לביטול
  window.currentAction = 'cancel';

  // בדיקת פריטים מקושרים לפני הביטול
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    const response = await fetch(`${base}/api/linked-items/${itemType}/${itemId}`);

    if (response.ok) {
      const linkedItemsData = await response.json();
      const childEntities = linkedItemsData.child_entities || [];
      const parentEntities = linkedItemsData.parent_entities || [];
      const allEntities = [...childEntities, ...parentEntities];

      if (allEntities.length > 0) {
        // יש פריטים מקושרים - הצגת אזהרה
        // Linked items found

        if (typeof window.showLinkedItemsModal === 'function') {
          window.showLinkedItemsModal(allEntities, itemType, itemId);
        } else {
          handleFunctionNotFound('showLinkedItemsModal', 'פונקציית הצגת פריטים מקושרים לא נמצאה');
          if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בביטול', `לא ניתן לבטל ${getItemTypeDisplayName(itemType)} זה - יש פריטים מקושרים אליו`);
          }
        }
        return;
      }
    }
  } catch {
    // Linked items check failed, proceeding with cancellation
  }

  // אין פריטים מקושרים - ביצוע הביטול
  // No linked items found, proceeding with cancellation
  await performItemCancellation(itemType, itemId, itemName);
}


/**
 * Perform the actual cancellation based on item type
 *
 * @param {string} itemType - Type of the item
 * @param {number} itemId - ID of the item
 * @param {string} itemName - Display name of the item
 */
async function performItemCancellation(itemType, itemId, _itemName) {
  try {
    const base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    let response;
    const successMessage = `${getItemTypeDisplayName(itemType)} בוטל בהצלחה!`;

    switch (itemType) {
    case 'trade_plan':
      response = await fetch(`${base}/api/trade_plans/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'trade':
      response = await fetch(`${base}/api/trades/${itemId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
      });
      break;

    case 'ticker':
      response = await fetch(`${base}/api/tickers/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'alert':
      response = await fetch(`${base}/api/alerts/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'account':
      response = await fetch(`${base}/api/trading-accounts/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    default:
      throw new Error(`לא נתמך ביטול עבור סוג: ${itemType}`);
    }

    if (response.ok) {
      // Item cancelled successfully

      // הצגת הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(successMessage);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(successMessage, 'success');
      }

      // רענון הנתונים
      if (typeof window.loadData === 'function') {
        await window.loadData();
      } else {
        // נסיון לרענן לפי סוג האובייקט
        const refreshFunction = window[`load${itemType.charAt(0).toUpperCase() + itemType.slice(1)}sData`];
        if (typeof refreshFunction === 'function') {
          await refreshFunction();
        }
      }

    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    handleApiError(error, `cancelling ${itemType} ${itemId}`);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה בביטול ${getItemTypeDisplayName(itemType)}`, error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(`שגיאה בביטול ${getItemTypeDisplayName(itemType)}`, 'error', 'שגיאה', 6000, 'system');
    }
  }
}

/**
 * Get item type display name
 *
 * @param {string} itemType - Type of the item
 * @returns {string} Display name
 */


// אתחול UI Utils - הוסר כי לא בשימוש
// function initializeUIUtils() { ... }

// Export functions to global scope
window.uiUtils = {
  cancelItem,
  performItemCancellation,
};

// Export global cancel functions
window.cancelItem = cancelItem;
window.performItemCancellation = performItemCancellation;

// ===== WARNING SYSTEM FUNCTIONS =====
// These functions are now moved to notification-system.js

// These functions are now moved to notification-system.js

// This function is now moved to notification-system.js

// This function is now moved to notification-system.js


// This function is now moved to notification-system.js

/**
 * Show linked items warning
 */


// This function is now moved to notification-system.js

// Export individual functions to global scope


// These functions are now moved to notification-system.js


/**
 * Show linked items blocking modal
 *
 * Shows a modal that blocks deletion/cancellation when there are linked items.
 * This modal does NOT allow the action to proceed - it only shows information.
 *
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {string} actionType - Type of action being blocked ('delete' or 'cancel')
 */


/**
 * Create linked items blocking modal content
 *
 * Generates the HTML content for the linked items blocking modal, including
 * detailed information about linked items that prevent the action.
 *
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {string} actionType - Type of action being blocked
 * @returns {string} HTML content for the modal
 */


/**
 * Create detailed linked items list
 *
 * Creates a detailed list of linked items with specific fields for each type.
 *
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the detailed linked items list
 */


/**
 * Create detailed item information
 *
 * @param {Object} item - Item data
 * @returns {string} HTML content for detailed item info
 */


// ===== MODAL UTILITIES =====

/**
 * Initialize modal backdrop functionality
 *
 * Ensures all modals can be closed by clicking on the backdrop
 * This function should be called on DOMContentLoaded
 */
function initializeModalBackdrop() {
  // Initializing modal backdrop functionality

  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    // הוספת data-bs-backdrop אם לא קיים
    if (!modal.hasAttribute('data-bs-backdrop')) {
      modal.setAttribute('data-bs-backdrop', 'true');
    }

    // הוספת data-bs-keyboard אם לא קיים
    if (!modal.hasAttribute('data-bs-keyboard')) {
      modal.setAttribute('data-bs-keyboard', 'true');
    }

    // הוספת event listener לסגירה בלחיצה על הרקע
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
  });

  // Modal backdrop functionality initialized
}

// ===== ACCOUNT UTILITIES =====

/**
 * Show second confirmation modal
 * @param {string} message - הודעת האישור
 * @param {Function} onConfirm - פונקציה לביצוע אם אושר
 */
function showSecondConfirmationModal(message, onConfirm) {
  if (window.showConfirmationDialog) {
    window.showConfirmationDialog('אישור', message, onConfirm, () => {});
  } else {
    // Fallback למקרה שמערכת התראות לא זמינה
    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirm();
    }
  }
}

// פונקציה createWarningModal כבר מוגדרת בשורה 1041

// ===== TABLE REFRESH SYSTEM =====

/**
 * מערכת רענון טבלאות גלובלית
 * מטפלת ברענון טבלאות אחרי פעולות CRUD עם שיפורי ביצועים
 */

/**
 * רענון טבלה משופר עם כפיית DOM reflow
 * @param {Function} loadDataFunction - פונקציית טעינת הנתונים
 * @param {Function} updateActiveFieldsFunction - פונקציית עדכון שדות פעילים (אופציונלי)
 * @param {string} operationName - שם הפעולה לצורך לוגים
 * @param {number} delay - עיכוב במילישניות לפני הרענון (ברירת מחדל: 100)
 */
async function enhancedTableRefresh(loadDataFunction, updateActiveFieldsFunction, operationName = 'פעולה', delay = 100) {
  try {
    // עיכוב קטן לוודא שהשרת עדכן את הנתונים
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    
    // טעינת נתונים חדשים
    if (typeof loadDataFunction === 'function') {
      await loadDataFunction();
    }
    
    // עדכון שדות פעילים אם קיים
    if (typeof updateActiveFieldsFunction === 'function') {
      await updateActiveFieldsFunction();
    }
    
    
    return true;
  } catch (error) {
    console.error(`❌ שגיאה ברענון טבלה אחרי ${operationName}:`, error);
    return false;
  }
}

/**
 * טיפול משופר בתגובות API עם רענון טבלה אוטומטי
 * @param {Response} response - תגובת ה-API
 * @param {Object} options - אפשרויות הטיפול
 * @param {Function} options.loadDataFunction - פונקציית טעינת נתונים
 * @param {Function} options.updateActiveFieldsFunction - פונקציית עדכון שדות פעילים
 * @param {string} options.operationName - שם הפעולה
 * @param {string} options.itemName - שם הפריט (טיקר, עסקה וכו')
 * @param {string} options.successMessage - הודעת הצלחה מותאמת אישית
 * @param {Function} options.onSuccess - פונקציה נוספת לביצוע בהצלחה
 * @param {Function} options.onNotFound - פונקציה מותאמת אישית ל-404
 */
async function handleApiResponseWithRefresh(response, options = {}) {
  const {
    loadDataFunction,
    updateActiveFieldsFunction,
    operationName = 'פעולה',
    itemName = 'פריט',
    successMessage,
    onSuccess,
    onNotFound
  } = options;

  if (response.ok) {
    // פעולה הצליחה
    const defaultMessage = `${itemName} ${operationName === 'מחיקה' ? 'נמחק' : 
                                      operationName === 'עדכון' ? 'עודכן' : 
                                      operationName === 'הוספה' ? 'נוסף' : 
                                      operationName === 'ביטול' ? 'בוטל' : 
                                      operationName === 'שיחזור' ? 'שוחזר' : 'עובד'} בהצלחה`;
    
    if (window.showSuccessNotification) {
      window.showSuccessNotification('הצלחה', successMessage || defaultMessage);
    }

    // ביצוע פונקציה נוספת אם קיימת
    if (typeof onSuccess === 'function') {
      await onSuccess();
    }

    // רענון טבלה
    await enhancedTableRefresh(loadDataFunction, updateActiveFieldsFunction, operationName);
    
    return true;

  } else if (response.status === 404) {
    // פריט לא קיים - טיפול ב-404
    console.warn(`${itemName} כבר לא קיים בבסיס הנתונים, מרענן נתונים`);
    
    if (typeof onNotFound === 'function') {
      await onNotFound();
    } else {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('מידע', `${itemName} כבר לא קיים במערכת - מרענן נתונים`);
      }
    }

    // רענון טבלה גם במקרה של 404
    await enhancedTableRefresh(loadDataFunction, updateActiveFieldsFunction, `זיהוי 404 ב${operationName}`);
    
    return true;

  } else {
    // שגיאה אחרת
    const errorResponse = await response.text();
    console.error(`שגיאה ב${operationName}:`, errorResponse);
    
    try {
      const errorData = JSON.parse(errorResponse);
      const errorMessage = errorData.error?.message || errorResponse;
      
      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה ב${operationName}`, errorMessage);
      }
    } catch {
      if (window.showErrorNotification) {
        window.showErrorNotification(`שגיאה ב${operationName}`, 'שגיאה לא מזוהה');
      }
    }
    
    return false;
  }
}

/**
 * פונקציית עזר לזיהוי אוטומטי של פונקציות טעינת נתונים לפי עמוד נוכחי
 */
function getPageDataFunctions() {
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  
  const pageFunctions = {
    'tickers': {
      loadData: window.loadTickersData,
      updateActive: window.updateActiveTradesField
    },
    'trades': {
      loadData: window.loadTradesData,
      updateActive: window.updateActiveTradesField
    },
    'accounts': {
      loadData: window.loadAccountsDataForAccountsPage,
      updateActive: null
    },
    'alerts': {
      loadData: window.loadAlertsData,
      updateActive: null
    },
    'trade_plans': {
      loadData: window.loadTradePlansData,
      updateActive: null
    },
    'executions': {
      loadData: window.loadExecutionsData,
      updateActive: null
    },
    'cash_flows': {
      loadData: window.loadCashFlowsData,
      updateActive: null
    },
    'notes': {
      loadData: window.loadNotesData,
      updateActive: null
    }
  };
  
  return pageFunctions[currentPage] || { loadData: null, updateActive: null };
}

/**
 * פונקציית עזר מקוצרת לרענון אוטומטי לפי עמוד נוכחי
 * @param {string} operationName - שם הפעולה
 */
async function autoRefreshCurrentPage(operationName = 'פעולה') {
  const { loadData, updateActive } = getPageDataFunctions();
  
  if (loadData) {
    await enhancedTableRefresh(loadData, updateActive, operationName);
  } else {
    console.warn('לא נמצאה פונקציית טעינת נתונים לעמוד הנוכחי');
    location.reload(); // fallback
  }
}

// ===== SECTION TOGGLE SYSTEM =====
// Centralized section toggle functionality for all pages

/**
 * ===== SECTION TOGGLE SYSTEM =====
 * Centralized system for opening/closing sections across all pages
 * All toggle functions are organized here for better maintainability
 */

/**
 * Toggle top section (header section with alerts/summary)
 * Handles opening/closing of top sections across all pages
 */

// toggleSection removed - use toggleSection('main') instead

/**
 * Toggle specific section by ID
 * Generic function for toggling any section by its ID
 * @param {string} sectionId - The ID of the section to toggle
 */
window.toggleSection = async function (sectionId) {
  
  const section = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
  const sectionBody = section ? section.querySelector('.section-body') : null;
  const toggleBtn = section ? section.querySelector('button[onclick*="toggleSection"]') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;
  
  if (sectionBody) {
    const isCollapsed = sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.classList.remove('collapsed');
      sectionBody.style.display = 'block';
      // console.log(`✅ Section "${sectionId}" EXPANDED`);
    } else {
      sectionBody.classList.add('collapsed');
      sectionBody.style.display = 'none';
      // console.log(`✅ Section "${sectionId}" COLLAPSED`);
    }

    // Update icon
    if (icon) {
      const newIcon = sectionBody.style.display === 'none' ? '▼' : '▲';
      icon.textContent = newIcon;
    }

    // Save state with page-specific key using Unified Cache Manager
    const isHidden = sectionBody.style.display === 'none';
    const pageName = getCurrentPageName();
    const storageKey = `${pageName}_${sectionId}_SectionHidden`;
    
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        await window.UnifiedCacheManager.save(storageKey, isHidden, {
            layer: 'localStorage',
            ttl: null, // persistent
            syncToBackend: false
        });
        console.log(`💾 State saved to Unified Cache: ${storageKey} = "${isHidden}"`);
    } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.error(`UnifiedCacheManager לא זמין - לא ניתן לשמור מצב Section (כלל 44 violation prevented): ${storageKey}`);
    }
    
  } else {
    console.warn(`❌ Section ${sectionId} not found`);
  }
};

// NOTE: toggleAllSections function moved to generic function below to avoid duplication

/**
 * Restore all section states from localStorage
 * This function restores the collapsed/expanded state of all sections after page refresh
 * Works with the unified section toggle system
 * UPDATED: Now uses page-specific localStorage keys
 */
window.restoreAllSectionStates = async function () {
  const pageName = getCurrentPageName();
  
  // מניעת כפילויות
  if (window.sectionStatesRestored && window.sectionStatesRestored[pageName]) {
    return;
  }
  
  // Check for accordion mode (only one section open at a time)
  const pageConfig = typeof window.pageInitializationConfigs !== 'undefined' && 
                     window.pageInitializationConfigs[pageName] ? 
                     window.pageInitializationConfigs[pageName] : 
                     (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName] ? 
                      window.PAGE_CONFIGS[pageName] : null);
  
  const accordionMode = pageConfig?.accordionMode === true;
  
  if (accordionMode) {
    console.log(`🎯 Accordion mode enabled for page "${pageName}"`);
  }
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  
  let restoredCount = 0;
  
  // For accordion mode, track which section should be open
  let openSectionId = null;
  
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    
    // Skip top section in accordion mode - it stays open always
    if (accordionMode && section.classList.contains('top-section')) {
      console.log(`⏭️ Skipping top section in accordion mode`);
      continue;
    }
    
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleBtn = section.querySelector('button[onclick*="toggleSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : 
                  section.querySelector('.section-toggle-icon, .filter-icon');


    if (sectionBody && sectionId) {
      // Check Unified Cache for saved state with page-specific key
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      let isHidden = false;
      
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        const cachedState = await window.UnifiedCacheManager.get(storageKey);
        isHidden = cachedState === true;
        console.log(`💾 Retrieved state from Unified Cache for "${sectionId}" on page "${pageName}": hidden=${isHidden}`);
      } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented) עבור "${sectionId}"`);
        isHidden = false; // ברירת מחדל
      }

      if (accordionMode) {
        // In accordion mode, only one section should be open
        if (!isHidden) {
          // This section should be open
          if (openSectionId) {
            // Already have an open section, close this one
            sectionBody.classList.add('collapsed');
            section.classList.add('collapsed');
            sectionBody.style.display = 'none';
            if (icon) { icon.textContent = '▼'; }
            console.log(`✅ Section "${sectionId}" closed (accordion mode - another section is open)`);
          } else {
            // This is the first open section
            openSectionId = sectionId;
            sectionBody.classList.remove('collapsed');
            section.classList.remove('collapsed');
            sectionBody.style.display = 'block';
            if (icon) { icon.textContent = '▲'; }
            console.log(`✅ Section "${sectionId}" opened (accordion mode)`);
          }
        } else {
          // This section should be closed
          sectionBody.classList.add('collapsed');
          section.classList.add('collapsed');
          sectionBody.style.display = 'none';
          if (icon) { icon.textContent = '▼'; }
          console.log(`✅ Section "${sectionId}" closed (accordion mode)`);
        }
      } else {
        // Normal mode - restore each section independently
        if (isHidden) {
          // Restore collapsed state
          sectionBody.classList.add('collapsed');
          section.classList.add('collapsed');
          sectionBody.style.display = 'none';
          if (icon) { icon.textContent = '▼'; }
          // console.log(`✅ Section "${sectionId}" RESTORED to COLLAPSED`);
        } else {
          // Restore expanded state (default)
          sectionBody.classList.remove('collapsed');
          section.classList.remove('collapsed');
          sectionBody.style.display = 'block';
          if (icon) { icon.textContent = '▲'; }
          // console.log(`✅ Section "${sectionId}" RESTORED to EXPANDED`);
        }
      }
      
      restoredCount++;
    } else {
      console.log(`⚠️ No section body or ID found for section ${index + 1}`);
    }
  }
  
  // In accordion mode, if no section was opened (all closed), keep all closed
  // (do not auto-open first section - let user manually open sections)
  
  console.log(`✅ restoreAllSectionStates completed - restored ${restoredCount}/${sections.length} sections${accordionMode ? ' (accordion mode)' : ''}`);
  
  // סימון שהסטטוסים שוחזרו לעמוד זה
  if (!window.sectionStatesRestored) {
    window.sectionStatesRestored = {};
  }
  window.sectionStatesRestored[pageName] = true;
  
  return restoredCount;
};

/**
 * Restore section states from localStorage
 * Called on page load to restore previous section states
 * UPDATED: Now uses page-specific localStorage keys consistently
 */
window.restoreSectionStates = async function () {
  
  // Restore top section state with page-specific key
  const pageName = getCurrentPageName();
  
  let topSectionHidden = false;
  
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    const cachedState = await window.UnifiedCacheManager.get(`${pageName}_top-section_collapsed`);
    topSectionHidden = cachedState === true;
    console.log(`💾 Retrieved top section state from Unified Cache for page "${pageName}": collapsed=${topSectionHidden}`);
  } else {
    // UnifiedCacheManager לא זמין - כלל 44 violation prevented
    console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented) עבור top-section בדף "${pageName}"`);
    topSectionHidden = false;
  }
  
  const topSection = document.querySelector('.top-section .section-body, .top-section .section-content');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon, .filter-arrow') : 
                   document.querySelector('.top-section .section-toggle-icon, .top-section .filter-icon');

  if (topSection && topSectionHidden) {
    topSection.classList.add('collapsed');
    topSection.style.display = 'none';
    if (topIcon) { topIcon.textContent = '▼'; }
    // console.log(`✅ Top section RESTORED to COLLAPSED`);
  } else if (topSection) {
    topSection.classList.remove('collapsed');
    topSection.style.display = 'block';
    if (topIcon) { topIcon.textContent = '▲'; }
    // console.log(`✅ Top section RESTORED to EXPANDED`);
  }

  // Restore main section states
  const sections = document.querySelectorAll('.content-section');
  
  let restoredCount = 0;
  
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    if (sectionId) {
      let sectionHidden = false;
      
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        const cachedState = await window.UnifiedCacheManager.get(`${pageName}_${sectionId}_SectionHidden`);
        sectionHidden = cachedState === true;
        console.log(`💾 Retrieved state from Unified Cache for section "${sectionId}" on page "${pageName}": hidden=${sectionHidden}`);
      } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented) עבור "${sectionId}" בדף "${pageName}"`);
        sectionHidden = false;
      }
      
      const sectionBody = section.querySelector('.section-body, .section-content');
      const toggleBtn = section.querySelector('button[onclick*="toggleSection"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : 
                    section.querySelector('.section-toggle-icon, .filter-icon');

      if (sectionBody && sectionHidden) {
        sectionBody.classList.add('collapsed');
        section.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) { icon.textContent = '▼'; }
        // console.log(`✅ Section "${sectionId}" RESTORED to COLLAPSED`);
        restoredCount++;
      } else if (sectionBody) {
        sectionBody.classList.remove('collapsed');
        section.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) { icon.textContent = '▲'; }
        // console.log(`✅ Section "${sectionId}" RESTORED to EXPANDED`);
        restoredCount++;
      }
    }
  }
  
  // console.log(`✅ restoreSectionStates completed - restored ${restoredCount}/${sections.length} sections`);
};

// ===== ACTION BUTTONS SYSTEM =====

/**
 * Generate action buttons HTML for table rows
 * @param {string} entityId - Entity ID for the row
 * @param {string} entityType - Entity type (e.g., 'ticker', 'trade', 'account')
 * @param {string} status - Current status (for cancel/restore logic)
 * @param {string} detailsFunction - Function name for details button
 * @param {string} linkedFunction - Function name for linked items button
 * @param {string} editFunction - Function name for edit button
 * @param {string} cancelFunction - Function name for cancel button
 * @param {string} restoreFunction - Function name for restore button
 * @param {string} deleteFunction - Function name for delete button
 * @param {boolean} showDetails - Show details button (default: true)
 * @param {boolean} showLinked - Show linked items button (default: true)
 * @param {boolean} showEdit - Show edit button (default: true)
 * @param {boolean} showCancel - Show cancel/restore button (default: true)
 * @param {boolean} showDelete - Show delete button (default: true)
 * @returns {string} HTML string for action buttons
 */
function generateActionButtons(entityId, entityType, status, detailsFunction, linkedFunction, editFunction, cancelFunction, restoreFunction, deleteFunction, showDetails = true, showLinked = true, showEdit = true, showCancel = true, showDelete = true) {
  let buttonsHtml = '<div class="btn-group">';

  // Details button
  if (showDetails) {
    buttonsHtml += `
      <button class="btn btn-sm btn-outline-success" onclick="${detailsFunction}('${entityType}', ${entityId})" title="פרטים">
        👁️
      </button>`;
  }

  // Linked items button
  if (showLinked) {
    buttonsHtml += `
      <button class="btn btn-sm btn-outline-success" onclick="${linkedFunction}('${entityType}', ${entityId})" title="אובייקטים מקושרים">
        🔗
      </button>`;
  }

  // Edit button
  if (showEdit) {
    buttonsHtml += `
      <button class="btn btn-sm btn-outline-warning" onclick="${editFunction}('${entityType}', ${entityId})" title="ערוך">
        ✏️
      </button>`;
  }

  // Cancel/Restore button
  if (showCancel) {
    const isCancelled = status === 'בוטל' || status === 'סגור';
    const buttonClass = isCancelled ? 'btn-outline-success' : 'btn-outline-danger';
    const buttonTitle = isCancelled ? 'שיחזר' : 'בטל';
    const buttonIcon = isCancelled ? '↻' : '❌';
    const buttonFunction = isCancelled ? restoreFunction : cancelFunction;

    buttonsHtml += `
      <button class="btn btn-sm ${buttonClass}" onclick="${buttonFunction}('${entityType}', ${entityId})" title="${buttonTitle}">
        ${buttonIcon}
      </button>`;
  }

  // Delete button
  if (showDelete) {
    buttonsHtml += `
      <button class="btn btn-sm btn-outline-danger" onclick="${deleteFunction}('${entityType}', ${entityId})" title="מחק" style="font-size: 0.8em;">
        🗑️
      </button>`;
  }

  buttonsHtml += '</div>';
  return buttonsHtml;
}

// ===== DEMO FUNCTIONS FOR TESTING =====

/**
 * Demo functions for testing action buttons
 * These are temporary functions for demonstration purposes
 */

function viewTickerDetails(entityType, id) {
    window.showInfoNotification(`🔍 פונקציה: viewTickerDetails - פרמטרים: entityType='${entityType}', id=${id}`);
}

function viewLinkedItems(entityType, id) {
    window.showInfoNotification(`🔗 פונקציה: viewLinkedItems - פרמטרים: entityType='${entityType}', id=${id}`);
}

function editTicker(entityType, id) {
    window.showInfoNotification(`✏️ פונקציה: editTicker - פרמטרים: entityType='${entityType}', id=${id}`);
}

function cancelTicker(entityType, id) {
    window.showWarningNotification(`❌ פונקציה: cancelTicker - פרמטרים: entityType='${entityType}', id=${id}`);
}

function restoreTicker(entityType, id) {
    window.showSuccessNotification(`🔄 פונקציה: restoreTicker - פרמטרים: entityType='${entityType}', id=${id}`);
}

function deleteTicker(entityType, id) {
    window.showErrorNotification(`🗑️ פונקציה: deleteTicker - פרמטרים: entityType='${entityType}', id=${id}`);
}

// ===== EXPORTS =====

// Export table refresh system functions
window.enhancedTableRefresh = enhancedTableRefresh;
window.handleApiResponseWithRefresh = handleApiResponseWithRefresh;
window.getPageDataFunctions = getPageDataFunctions;
window.autoRefreshCurrentPage = autoRefreshCurrentPage;

// Export account utility functions
window.showSecondConfirmationModal = showSecondConfirmationModal;

// Export section toggle system functions
// toggleSection removed - use toggleSection('top') instead
// window.toggleSection export removed - using global version from ui-utils.js
// window.toggleAllSections - exported below after definition (line ~1580)
window.restoreSectionStates = window.restoreSectionStates;
window.debugSectionStates = window.debugSectionStates;

// Export action buttons system
window.generateActionButtons = generateActionButtons;

/**
 * פונקציה לטעינת כפתורי פעולות לכל הטבלה
 * @param {string} tableId - מזהה הטבלה
 * @param {string} entityType - סוג הישות (ticker, trade, etc.)
 * @param {Object} config - הגדרות הכפתורים
 */
function loadTableActionButtons(tableId, entityType, config = {}) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`❌ Table ${tableId} not found`);
    return;
  }

  const rows = table.querySelectorAll('tbody tr');

  rows.forEach((row, index) => {
    const actionsCell = row.querySelector('.actions-cell');
    if (!actionsCell) {
      console.warn(`⚠️ No actions cell found in row ${index}`);
      return;
    }

    // קבלת נתונים מהשורה
    const entityId = actionsCell.dataset.entityId || (index + 1);
    const status = actionsCell.dataset.status || 'פתוח';
    
    // הגדרות ברירת מחדל
    const defaultConfig = {
      showDetails: true,
      showLinked: true,
      showEdit: true,
      showCancel: true,
      showDelete: true,
      detailsFunction: `view${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Details`,
      linkedFunction: `viewLinkedItems`,
      editFunction: `edit${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      cancelFunction: `cancel${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      restoreFunction: `restore${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      deleteFunction: `delete${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`
    };

    // מיזוג עם הגדרות מותאמות אישית
    const finalConfig = { ...defaultConfig, ...config };

    // יצירת הכפתורים
    const buttonsHtml = generateActionButtons(
      entityId,
      entityType,
      status,
      finalConfig.detailsFunction,
      finalConfig.linkedFunction,
      finalConfig.editFunction,
      finalConfig.cancelFunction,
      finalConfig.restoreFunction,
      finalConfig.deleteFunction,
      finalConfig.showDetails,
      finalConfig.showLinked,
      finalConfig.showEdit,
      finalConfig.showCancel,
      finalConfig.showDelete
    );

    actionsCell.innerHTML = buttonsHtml;
  });

}

// Export the new function
window.loadTableActionButtons = loadTableActionButtons;

// Export demo functions for testing
window.viewTickerDetails = viewTickerDetails;
window.viewLinkedItems = viewLinkedItems;
window.editTicker = editTicker;
window.cancelTicker = cancelTicker;
window.restoreTicker = restoreTicker;
window.deleteTicker = deleteTicker;

// Initialize modal backdrop and restore section states when DOM is loaded - הוסר כדי למנוע כפילות עם core-systems.js
// האתחול מתבצע דרך מערכת האתחול המאוחדת

// ===== SECTION TOGGLE FUNCTIONS =====
// These functions handle opening/closing sections across all pages

/**
 * Toggle top section visibility
 * Used for the main top section of each page
 */
async function toggleTopSection(sectionId = 'top-section') {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`⚠️ Section ${sectionId} not found`);
    return;
  }
  
  // Handle special cases for development sections
  if (section.classList.contains('development-section')) {
    if (typeof window.toggleDevelopmentSection === 'function') {
      window.toggleDevelopmentSection(sectionId);
      return;
    }
  }
  
  // Find the toggle button and icon
  const toggleBtn = document.querySelector(`[onclick*="${sectionId}"]`);
  const toggleIcon = section.querySelector('.section-toggle-icon') || 
                    (toggleBtn ? toggleBtn.querySelector('.section-toggle-icon') : null);
  
  // Find the content area to toggle
  const sectionBody = section.querySelector('.section-body') ||
                     section.querySelector('.section-content') ||
                     section.querySelector('.content');
  
  if (!sectionBody) {
    console.warn(`⚠️ No content area found in section ${sectionId}`);
    return;
  }
  
  // Determine current state
  const isCollapsed = sectionBody.style.display === 'none' || 
                     section.classList.contains('collapsed');
  
  // Toggle visibility
  if (isCollapsed) {
    // Expand
    sectionBody.style.display = 'block';
    section.classList.remove('collapsed');
    section.classList.add('expanded');
    if (toggleIcon) toggleIcon.textContent = '▼';
    console.log(`📂 Expanded section: ${sectionId}`);
  } else {
    // Collapse
    sectionBody.style.display = 'none';
    section.classList.add('collapsed');
    section.classList.remove('expanded');
    if (toggleIcon) toggleIcon.textContent = '▶';
    console.log(`📁 Collapsed section: ${sectionId}`);
  }
  
  // Save state to localStorage with page-specific key
  const pageName = getCurrentPageName();
  const storageKey = `${pageName}_${sectionId}_collapsed`;
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    await window.UnifiedCacheManager.save(storageKey, !isCollapsed, {
      layer: 'localStorage',
      ttl: null, // persistent
      syncToBackend: false
    });
    console.log(`💾 Top section state saved to Unified Cache: ${storageKey} = "${!isCollapsed}"`);
  } else {
    // UnifiedCacheManager לא זמין - כלל 44 violation prevented
    console.error(`UnifiedCacheManager לא זמין - לא ניתן לשמור מצב Top Section (כלל 44 violation prevented): ${storageKey}`);
  }
}

// toggleSection function removed - use toggleSection('main') instead

/**
 * Get current page name from URL path
 * Used for page-specific localStorage keys
 */
function getCurrentPageName() {
  const path = window.location.pathname;
  const pathParts = path.split('/').filter(part => part.length > 0);
  
  // Handle root page
  if (pathParts.length === 0 || path === '/') {
    return 'index';
  }
  
  // Handle pages like /trades, /alerts, etc.
  const pageName = pathParts[pathParts.length - 1];
  
  // Remove .html extension if present
  return pageName.replace('.html', '');
}

/**
 * Debug function to show all section states for current page
 * Useful for debugging section state management
 */
window.debugSectionStates = async function() {
  const pageName = getCurrentPageName();
  console.log('=====================================');
  
  // Check top section
  const topSectionKey = `${pageName}_top-section_collapsed`;
  let topSectionState = null;
  
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
    topSectionState = await window.UnifiedCacheManager.get(topSectionKey);
    console.log(`📍 Top Section from Unified Cache: ${topSectionKey} = "${topSectionState}"`);
  } else {
    // UnifiedCacheManager לא זמין - כלל 44 violation prevented
    console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented): ${topSectionKey}`);
    topSectionState = null;
    console.log(`📍 Top Section from localStorage (fallback): ${topSectionKey} = "${topSectionState}"`);
  }
  
  // Check all content sections
  const sections = document.querySelectorAll('.content-section');
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionId = section.getAttribute('data-section') || section.id;
    if (sectionId) {
      const sectionKey = `${pageName}_${sectionId}_SectionHidden`;
      let sectionState = null;
      
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        sectionState = await window.UnifiedCacheManager.get(sectionKey);
        console.log(`📍 Section ${index + 1} from Unified Cache: ${sectionKey} = "${sectionState}"`);
      } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented): ${sectionKey}`);
        sectionState = null;
        console.log(`📍 Section ${index + 1} from localStorage (fallback): ${sectionKey} = "${sectionState}"`);
      }
    }
  }
  
  console.log('=====================================');
};

/**
 * Toggle all sections on the page
 * Generic function that toggles all collapsible sections
 * UPDATED: Now uses page-specific localStorage keys
 */
async function toggleAllSections() {
  
  // Find all possible section types
  const contentSections = document.querySelectorAll('.content-section, .top-section');
  const sectionContents = document.querySelectorAll('.section-content');
  
  // Combine all sections
  const allSections = [...contentSections, ...sectionContents];
  
  if (!allSections.length) {
    console.warn('⚠️ No sections found to toggle');
    return;
  }
  
  
  // Check if all sections are collapsed
  // Filter out sections without section-body first
  const sectionsWithBody = allSections.filter(section => {
    const sectionBody = section.querySelector('.section-body, .section-content');
    return sectionBody !== null;
  });
  
  
  const allCollapsed = sectionsWithBody.every(section => {
    const sectionBody = section.querySelector('.section-body, .section-content');
    return sectionBody.style.display === 'none' || section.classList.contains('collapsed');
  });
  
  
  const pageName = getCurrentPageName();
  
  // Toggle all sections
  for (let index = 0; index < allSections.length; index++) {
    const section = allSections[index];
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleBtn = section.querySelector('.filter-toggle-btn, [onclick*="toggle"]');
    const icon = section.querySelector('.section-toggle-icon, .filter-icon');
    
    
    if (sectionBody) {
      if (allCollapsed) {
        // Expand all
        sectionBody.style.display = 'block';
        section.classList.remove('collapsed');
        section.classList.add('expanded');
        if (icon) icon.textContent = '▼';
        // console.log(`✅ Section "${sectionId}" EXPANDED`);
      } else {
        // Collapse all
        sectionBody.style.display = 'none';
        section.classList.add('collapsed');
        section.classList.remove('expanded');
        if (icon) icon.textContent = '▶';
        // console.log(`✅ Section "${sectionId}" COLLAPSED`);
      }
      
      // Save state with page-specific key
      const isHidden = sectionBody.style.display === 'none';
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
        await window.UnifiedCacheManager.save(storageKey, isHidden, {
          layer: 'localStorage',
          ttl: null, // persistent
          syncToBackend: false
        });
        console.log(`💾 State saved to Unified Cache: ${storageKey} = "${isHidden}"`);
      } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.error(`UnifiedCacheManager לא זמין - לא ניתן לשמור מצב Section (כלל 44 violation prevented): ${storageKey}`);
        console.log(`💾 State saved to localStorage (fallback): ${storageKey} = "${isHidden}"`);
      }
    } else {
      console.log(`⚠️ No section body found for section "${sectionId}"`);
    }
  }
  
  // Update the global toggle button icon (toggleAllBtn)
  const toggleAllBtn = document.getElementById('toggleAllBtn');
  if (toggleAllBtn) {
    const toggleAllIcon = toggleAllBtn.querySelector('.filter-icon, .section-toggle-icon');
    if (toggleAllIcon) {
      // If we just collapsed all, show ▶ (closed), if we expanded all, show ▼ (open)
      toggleAllIcon.textContent = allCollapsed ? '▼' : '▶';
    }
  }
  
  console.log(`📂 All sections ${allCollapsed ? 'expanded' : 'collapsed'}`);
}

/**
 * Load section states from localStorage
 * Called on page load to restore previous section states
 * UPDATED: Now uses page-specific localStorage keys
 */
async function loadSectionStates() {
  
  const pageName = getCurrentPageName();
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  
  let restoredCount = 0;
  
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    const storageKey = `${pageName}_${sectionId}_SectionHidden`;
    let isCollapsed = false;
    
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      const cachedState = await window.UnifiedCacheManager.get(storageKey);
      isCollapsed = cachedState === true;
      console.log(`💾 Retrieved state from Unified Cache for "${sectionId}" on page "${pageName}": hidden=${isCollapsed}`);
    } else {
      // UnifiedCacheManager לא זמין - כלל 44 violation prevented
      console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented): ${storageKey}`);
      isCollapsed = false;
      console.log(`💾 Retrieved state from localStorage (fallback) for "${sectionId}" on page "${pageName}": hidden=${isCollapsed}`);
    }
    
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleIcon = section.querySelector('.section-toggle-icon, .filter-icon');
    
    if (sectionBody && isCollapsed) {
      sectionBody.style.display = 'none';
      section.classList.add('collapsed');
      section.classList.remove('expanded');
      if (toggleIcon) toggleIcon.textContent = '▶';
      restoredCount++;
    } else if (sectionBody) {
      sectionBody.style.display = 'block';
      section.classList.remove('collapsed');
      section.classList.add('expanded');
      if (toggleIcon) toggleIcon.textContent = '▼';
      restoredCount++;
    }
  }
  
}

// Export functions to global scope
// toggleSection removed - use toggleSection('top') instead
// window.toggleSection export removed - using global version from ui-utils.js
window.toggleAllSections = toggleAllSections;
window.toggleSectionGlobal = window.toggleSection;
window.toggleAllSectionsGlobal = window.toggleAllSections;
window.toggleTopSection = toggleTopSection;
window.loadSectionStates = loadSectionStates;

// Load section states when DOM is ready - הוסר כדי למנוע כפילות עם core-systems.js
// האתחול מתבצע דרך מערכת האתחול המאוחדת
// ===== VALIDATION UTILS - מערכת ולידציה גלובלית =====
/*
 * Validation Utils - TikTrack
 * ===========================
 *
 * מערכת ולידציה גלובלית עם תמיכה בוולידציה בזמן אמת ובזמן שליחה
 *
 * 📖 דוקומנטציה מפורטת: documentation/frontend/VALIDATION_SYSTEM.md
 *
 * קובץ: trading-ui/scripts/validation-utils.js
 * גרסה: 2.2
 * עדכון אחרון: אוגוסט 31, 2025
 * מחבר: TikTrack Development Team
 *
 * תיקונים אחרונים (31 באוגוסט 2025):
 * - תיקון פונקציות showFieldError, showFieldSuccess, clearFieldError, clearFieldValidation
 * - תמיכה ב-ID מחרוזת או אלמנט DOM
 * - בדיקת קיום אלמנט לפני פעולה
 * - הוספת הודעות אזהרה לקונסול
 * - שיפור תאימות עם קובץ trade_plans.js
 */

// ===== קבועים =====

// כללי ולידציה ברירת מחדל
const DEFAULT_VALIDATION_RULES = {
  text: {
    required: false,
    minLength: 0,
    maxLength: 255,
    pattern: /.*/,
    customValidation: null,
  },
  number: {
    required: false,
    min: null,
    max: null,
    step: null,
    customValidation: null,
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    customValidation: null,
  },
  date: {
    required: false,
    minDate: null,
    maxDate: null,
    customValidation: null,
  },
  select: {
    required: false,
    customValidation: null,
  },
};

// ===== פונקציות עזר =====

/**
 * קבלת תווית השדה
 */
function getFieldLabel(field) {
  // ניסיון למצוא label לפי for
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label) {
    return label.textContent.trim();
  }

  // ניסיון למצוא label קרוב
  const parentLabel = field.closest('.form-group')?.querySelector('label') ||
                       field.parentNode?.querySelector('label');
  if (parentLabel) {
    return parentLabel.textContent.trim();
  }

  // ניסיון לקבל מתוך placeholder
  if (field.placeholder) {
    return field.placeholder;
  }

  // ברירת מחדל - שם השדה
  return field.name || field.id || 'שדה לא ידוע';
}

/**
 * בדיקה אם תאריך תקין
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * בדיקה אם אימייל תקין
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * בדיקה אם מספר טלפון תקין
 */
function isValidPhone(phone) {
  return /^[\d\s\-+()]+$/.test(phone);
}

// ===== פונקציות ויזואליות =====

/**
 * הצגת שגיאה בשדה
 */
function showFieldError(input, message) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // showFieldError: Element not found for input
    return;
  }

  // הסרת סימון קודם
  element.classList.remove('is-valid');
  element.classList.add('is-invalid');

  // הסרת הודעת שגיאה קודמת
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }

  // הוספת הודעת שגיאה חדשה
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  element.parentNode.appendChild(errorDiv);
}

/**
 * הצגת הצלחה בשדה
 */
function showFieldSuccess(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // showFieldSuccess: Element not found for input
    return;
  }

  // הסרת סימון קודם
  element.classList.remove('is-invalid');
  element.classList.add('is-valid');

  // הסרת הודעת שגיאה
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי שגיאה משדה
 */
function clearFieldError(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // clearFieldError: Element not found for input
    return;
  }

  element.classList.remove('is-invalid');
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי ולידציה משדה
 */
function clearFieldValidation(input) {
  // אם input הוא מחרוזת (ID), נקבל את האלמנט
  const element = typeof input === 'string' ? document.getElementById(input) : input;

  // בדיקה שהאלמנט קיים
  if (!element) {
    // clearFieldValidation: Element not found for input
    return;
  }

  element.classList.remove('is-valid', 'is-invalid');
  const existingError = element.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * ניקוי כל שגיאות הוולידציה
 */
function clearValidationErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) {return;}

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    clearFieldValidation(input);
  });
}

// ===== פונקציות ולידציה =====

// validateTextField function removed - using version from validation-utils.js

// validateNumberField function removed - using version from validation-utils.js

// validateEmailField function removed - using version from validation-utils.js

// validateDateField function removed - using version from validation-utils.js

// validateSelectField function removed - using version from validation-utils.js

// validateField function removed - using version from validation-utils.js

/**
 * הגדרת ולידציה לשדה
 */
function setupFieldValidation(input, rules = {}) {
  // הסרת event listeners קודמים
  if (input._validationHandler) {
    input.removeEventListener('input', input._validationHandler);
    input.removeEventListener('blur', input._validationHandler);
    input.removeEventListener('change', input._validationHandler);
  }

  // יצירת פונקציית ולידציה
  input._validationHandler = () => validateField(input, rules);

  // הוספת event listeners
  input.addEventListener('input', input._validationHandler);
  input.addEventListener('blur', input._validationHandler);
  input.addEventListener('change', input._validationHandler);
}

// ===== פונקציות ולידציה מותאמות =====

// validateCurrencySymbol function removed - using version from validation-utils.js

// validateCurrencyRate function removed - using version from validation-utils.js

// validateTickerSymbol function removed - using version from validation-utils.js

// ===== פונקציה ראשית =====

/**
 * ולידציה של טופס
 */
// validateForm function removed - using version from validation-utils.js

// ===== פונקציות אתחול =====

/**
 * אתחול מערכת הוולידציה לטופס
 */
function initializeValidation(formId, validationRules = {}) {
  const form = document.getElementById(formId);
  if (!form) {
    // Form ${formId} not found - skipping validation initialization
    return;
  }

  // מציאת כל השדות בטופס
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input, _index) => {
    // הסרת event listeners קודמים
    if (input._validationHandler) {
      input.removeEventListener('input', input._validationHandler);
      input.removeEventListener('blur', input._validationHandler);
      input.removeEventListener('change', input._validationHandler);
    }

    // יצירת פונקציית ולידציה מותאמת לשדה
    input._validationHandler = () => {
      const fieldRules = validationRules[input.name] || {};
      // ולידציה לפי סוג השדה
      let isValid = false;

      switch (input.type) {
      case 'text':
      case 'password':
      case 'email':
      case 'tel':
      case 'url':
        isValid = validateTextField(input, fieldRules);
        break;

      case 'number':
        isValid = validateNumberField(input, fieldRules);
        break;

      case 'date':
        isValid = validateDateField(input, fieldRules);
        break;

      default:
        if (input.tagName === 'SELECT') {
          isValid = validateSelectField(input, fieldRules);
        } else if (input.tagName === 'TEXTAREA') {
          isValid = validateTextField(input, fieldRules);
        } else {
          isValid = validateField(input, fieldRules);
        }
        break;
      }

      return isValid;
    };

    // הוספת event listeners
    input.addEventListener('input', input._validationHandler);  // בזמן הקלדה
    input.addEventListener('blur', input._validationHandler);   // בזמן עזיבת השדה
    input.addEventListener('change', input._validationHandler); // בזמן שינוי ערך

  });

}

/**
 * ניקוי וולידציה לטופס
 */
function clearValidation(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    // Form ${formId} not found - skipping validation clearing
    return;
  }

  // ניקוי כל השדות
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    clearFieldValidation(input);
  });

}

// ===== ייצוא פונקציות =====

// ייצוא פונקציות עזר
window.isValidDate = isValidDate;
window.isValidEmail = isValidEmail;
window.isValidPhone = isValidPhone;

// ייצוא פונקציות ויזואליות
window.showFieldError = showFieldError;
window.showFieldSuccess = showFieldSuccess;
window.clearFieldError = clearFieldError;
window.clearFieldValidation = clearFieldValidation;
window.clearValidationErrors = clearValidationErrors;

// ייצוא פונקציות ולידציה
window.validateForm = validateForm;
window.validateField = validateField;
window.validateTextField = validateTextField;
window.validateNumberField = validateNumberField;
window.validateEmailField = validateEmailField;
window.validateDateField = validateDateField;
window.validateSelectField = validateSelectField;
window.setupFieldValidation = setupFieldValidation;

// ייצוא פונקציות ולידציה מותאמות
window.validateCurrencySymbol = validateCurrencySymbol;
window.validateCurrencyRate = validateCurrencyRate;
window.validateTickerSymbol = validateTickerSymbol;

// ייצוא פונקציות אתחול
window.initializeValidation = initializeValidation;
window.clearValidation = clearValidation;

// ===== פונקציות ולידציה סטנדרטיות לטפסים =====

/**
 * ולידציה סטנדרטית לטופס הוספה/עריכה
 * @param {string} formId - מזהה הטופס
 * @param {Array} requiredFields - מערך של אובייקטים עם fieldId ו-fieldName
 * @returns {boolean} true אם הטופס תקין, false אחרת
 * 
 * דוגמה:
 * const isValid = window.validateEntityForm('addCashFlowForm', [
 *   { id: 'cashFlowAccountId', name: 'חשבון מסחר' },
 *   { id: 'cashFlowType', name: 'סוג תזרים' },
 *   { id: 'cashFlowAmount', name: 'סכום', validation: (value) => parseFloat(value) !== 0 || 'סכום לא יכול להיות 0' }
 * ]);
 */
// validateEntityForm function removed - using version from validation-utils.js

// ייצוא המודול - פונקציות ולידציה הוסרו (בשימוש מ-validation-utils.js)
window.validationUtils = {
  // פונקציות ולידציה הועברו ל-validation-utils.js
  // validateForm, validateEntityForm, validateField, etc. - בשימוש מ-validation-utils.js
  showFieldError,
  showFieldSuccess,
  clearFieldError,
  clearFieldValidation,
  clearValidationErrors,
  isValidDate,
  isValidEmail,
  isValidPhone,
  setupFieldValidation,
  initializeValidation,
  clearValidation,
};


