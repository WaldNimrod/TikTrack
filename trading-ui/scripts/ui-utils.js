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
    const response = await fetch(`${base}/api/v1/linked-items/${itemType}/${itemId}`);

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
      response = await fetch(`${base}/api/v1/trade_plans/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'trade':
      response = await fetch(`${base}/api/v1/trades/${itemId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
      });
      break;

    case 'ticker':
      response = await fetch(`${base}/api/v1/tickers/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'alert':
      response = await fetch(`${base}/api/v1/alerts/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'account':
      response = await fetch(`${base}/api/v1/accounts/${itemId}`, {
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
      window.showNotification(`שגיאה בביטול ${getItemTypeDisplayName(itemType)}`, 'error');
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
    
    console.log(`🔄 רענון נתונים אחרי ${operationName}`);
    
    // טעינת נתונים חדשים
    if (typeof loadDataFunction === 'function') {
      await loadDataFunction();
    }
    
    // עדכון שדות פעילים אם קיים
    if (typeof updateActiveFieldsFunction === 'function') {
      await updateActiveFieldsFunction();
    }
    
    console.log(`✅ רענון הטבלה הושלם אחרי ${operationName}`);
    
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
window.toggleTopSection = function () {
  console.log('🔧 ui-utils.js toggleTopSection called');
  const currentPath = window.location.pathname;

  // Special handling for notes page
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesTopSection');
    const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // Update icon only
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // Save state
      localStorage.setItem('notesTopSectionHidden', !isHidden);
    }
    return;
  }

  // Regular handling for other pages
  const section = document.querySelector('.top-section .section-body');
  const toggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;
  
  console.log('🔍 toggleTopSection elements found:', {
    section: !!section,
    toggleBtn: !!toggleBtn,
    icon: !!icon,
    currentPath: currentPath
  });
  
  if (section) {
    console.log('📊 Section state:', {
      display: section.style.display,
      hasCollapsed: section.classList.contains('collapsed'),
      isHidden: section.style.display === 'none'
    });
  }

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // Determine localStorage key based on current page
    let storageKey = 'topSectionCollapsed';

    if (currentPath.includes('/alerts')) {
      storageKey = 'alertsTopSectionCollapsed';
    } else if (currentPath.includes('/planning') || currentPath.includes('/trade_plans')) {
      storageKey = 'planningTopSectionCollapsed';
    } else if (currentPath.includes('/trades')) {
      storageKey = 'tradesTopSectionCollapsed';
    } else if (currentPath.includes('/accounts')) {
      storageKey = 'accountsTopSectionCollapsed';
    } else if (currentPath.includes('/tickers')) {
      storageKey = 'tickersTopSectionCollapsed';
    } else if (currentPath.includes('/cash_flows')) {
      storageKey = 'cashFlowsTopSectionCollapsed';
    } else if (currentPath.includes('/executions')) {
      storageKey = 'executionsTopSectionCollapsed';
    } else if (currentPath.includes('/research')) {
      storageKey = 'researchTopSectionCollapsed';
    } else if (currentPath.includes('/constraints')) {
      storageKey = 'constraintsTopSectionCollapsed';
    } else if (currentPath.includes('/db_display')) {
      storageKey = 'dbDisplayTopSectionCollapsed';
    } else if (currentPath.includes('/db_extradata')) {
      storageKey = 'dbExtradataTopSectionCollapsed';
    } else if (currentPath.includes('/designs')) {
      storageKey = 'topSectionCollapsed';
    }

    // Save state to localStorage
    localStorage.setItem(storageKey, !isCollapsed);
  }
};

/**
 * Toggle main section (content section with tables)
 * Handles opening/closing of main content sections across all pages
 */
window.toggleMainSection = function () {
  console.log('🔧 ui-utils.js toggleMainSection called');
  const currentPath = window.location.pathname;

  // Special handling for notes page
  if (currentPath.includes('/notes')) {
    const section = document.getElementById('notesMainSection');
    const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

    if (section && toggleBtn) {
      const isHidden = section.style.display === 'none';
      section.style.display = isHidden ? 'block' : 'none';

      // Update icon only
      if (icon) {
        icon.textContent = isHidden ? '▲' : '▼';
      }

      // Save state
      localStorage.setItem('notesMainSectionHidden', !isHidden);
    }
    return;
  }

  // Regular handling for other pages
  const section = document.querySelector('.content-section .section-body');
  const toggleBtn = document.querySelector('.content-section button[onclick*="toggleMainSection"]');
  const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

  if (section) {
    const isCollapsed = section.classList.contains('collapsed') || section.style.display === 'none';

    if (isCollapsed) {
      section.classList.remove('collapsed');
      section.style.display = 'block';
    } else {
      section.classList.add('collapsed');
      section.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = isCollapsed ? '▲' : '▼';
    }

    // Save state
    localStorage.setItem('mainSectionHidden', section.style.display === 'none');
  }
};

/**
 * Toggle specific section by ID
 * Generic function for toggling any section by its ID
 * @param {string} sectionId - The ID of the section to toggle
 */
window.toggleSection = function (sectionId) {
  console.log('🔧 ui-utils.js toggleSection called with:', sectionId);
  
  const section = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
  const sectionBody = section ? section.querySelector('.section-body') : null;
  const toggleBtn = section ? section.querySelector('button[onclick*="toggleSection"]') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;
  
  console.log('🔍 toggleSection elements found:', {
    sectionId: sectionId,
    section: !!section,
    sectionBody: !!sectionBody,
    toggleBtn: !!toggleBtn,
    icon: !!icon
  });
  
  if (sectionBody) {
    console.log('📊 Section body state:', {
      display: sectionBody.style.display,
      hasCollapsed: sectionBody.classList.contains('collapsed'),
      isHidden: sectionBody.style.display === 'none'
    });
  }
  
  if (sectionBody) {
    const isCollapsed = sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none';

    if (isCollapsed) {
      sectionBody.classList.remove('collapsed');
      sectionBody.style.display = 'block';
    } else {
      sectionBody.classList.add('collapsed');
      sectionBody.style.display = 'none';
    }

    // Update icon
    if (icon) {
      icon.textContent = sectionBody.style.display === 'none' ? '▼' : '▲';
    }

    // Save state
    localStorage.setItem(`${sectionId}SectionHidden`, sectionBody.style.display === 'none');
    
    console.log(`✅ Section ${sectionId} toggled:`, sectionBody.style.display === 'none' ? 'collapsed' : 'expanded');
  } else {
    console.warn(`❌ Section ${sectionId} not found`);
  }
};

/**
 * Toggle all sections at once
 * Handles opening/closing of all content sections at once
 */
window.toggleAllSections = function () {
  const sections = document.querySelectorAll('.content-section');
  const allCollapsed = Array.from(sections).every(section => {
    const sectionBody = section.querySelector('.section-body');
    return sectionBody && (sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none');
  });

  sections.forEach(section => {
    const sectionId = section.getAttribute('data-section') || section.id;
    const sectionBody = section.querySelector('.section-body');
    const toggleBtn = section.querySelector('button[onclick*="toggleSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

    if (sectionBody) {
      if (allCollapsed) {
        // Open all sections
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) { icon.textContent = '▲'; }
      } else {
        // Close all sections
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) { icon.textContent = '▼'; }
      }

      // Save state
      if (sectionId) {
        localStorage.setItem(`${sectionId}SectionHidden`, sectionBody.style.display === 'none');
      }
    }
  });

  console.log(`✅ All sections ${allCollapsed ? 'opened' : 'closed'}`);
};

/**
 * Restore section states from localStorage
 * Called on page load to restore previous section states
 */
window.restoreSectionStates = function () {
  // Restore top section state
  const topSectionHidden = localStorage.getItem('topSectionHidden') === 'true';
  const topSection = document.querySelector('.top-section .section-body');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleTopSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon, .filter-arrow') : null;

  if (topSection && topSectionHidden) {
    topSection.classList.add('collapsed');
    topSection.style.display = 'none';
    if (topIcon) { topIcon.textContent = '▼'; }
  }

  // Restore main section states
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    const sectionId = section.getAttribute('data-section') || section.id;
    if (sectionId) {
      const sectionHidden = localStorage.getItem(`${sectionId}SectionHidden`) === 'true';
      const sectionBody = section.querySelector('.section-body');
      const toggleBtn = section.querySelector('button[onclick*="toggleSection"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;

      if (sectionBody && sectionHidden) {
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) { icon.textContent = '▼'; }
      }
    }
  });

  console.log('✅ Section states restored from localStorage');
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
  console.log('🔧 generateActionButtons called with:', {entityId, entityType, status, detailsFunction, linkedFunction, editFunction, cancelFunction, restoreFunction, deleteFunction, showDetails, showLinked, showEdit, showCancel, showDelete});
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
  console.log('🔧 generateActionButtons returning HTML:', buttonsHtml);
  return buttonsHtml;
}

// ===== DEMO FUNCTIONS FOR TESTING =====

/**
 * Demo functions for testing action buttons
 * These are temporary functions for demonstration purposes
 */

function viewTickerDetails(entityType, id) {
    alert(`🔍 פונקציה: viewTickerDetails\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
}

function viewLinkedItems(entityType, id) {
    alert(`🔗 פונקציה: viewLinkedItems\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
}

function editTicker(entityType, id) {
    alert(`✏️ פונקציה: editTicker\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
}

function cancelTicker(entityType, id) {
    alert(`❌ פונקציה: cancelTicker\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
}

function restoreTicker(entityType, id) {
    alert(`🔄 פונקציה: restoreTicker\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
}

function deleteTicker(entityType, id) {
    alert(`🗑️ פונקציה: deleteTicker\n📊 פרמטרים: entityType='${entityType}', id=${id}\n📈 שורה: טיקר ${id}`);
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
window.toggleTopSection = window.toggleTopSection;
window.toggleMainSection = window.toggleMainSection;
window.toggleSection = window.toggleSection;
window.toggleAllSections = window.toggleAllSections;
window.restoreSectionStates = window.restoreSectionStates;

// Export action buttons system
window.generateActionButtons = generateActionButtons;
console.log('✅ generateActionButtons function exported to window');

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
  console.log(`🔧 Loading action buttons for ${rows.length} rows in table ${tableId}`);

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

  console.log(`✅ Action buttons loaded for ${rows.length} rows`);
}

// Export the new function
window.loadTableActionButtons = loadTableActionButtons;
console.log('✅ loadTableActionButtons function exported to window');

// Export demo functions for testing
window.viewTickerDetails = viewTickerDetails;
window.viewLinkedItems = viewLinkedItems;
window.editTicker = editTicker;
window.cancelTicker = cancelTicker;
window.restoreTicker = restoreTicker;
window.deleteTicker = deleteTicker;

// Initialize modal backdrop and restore section states when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeModalBackdrop();
  
  // Restore section states after a short delay to ensure all elements are loaded
  setTimeout(() => {
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    }
  }, 100);
});

// ===== SECTION TOGGLE FUNCTIONS =====
// These functions handle opening/closing sections across all pages

/**
 * Toggle top section visibility
 * Used for the main top section of each page
 */
function toggleTopSection() {
  console.log('🔧 ui-utils.js toggleTopSection called');
  
  const topSection = document.querySelector('.top-section');
  if (!topSection) {
    console.warn('⚠️ Top section not found');
    return;
  }
  
  const sectionBody = topSection.querySelector('.section-body');
  const toggleIcon = topSection.querySelector('.section-toggle-icon');
  
  if (!sectionBody || !toggleIcon) {
    console.warn('⚠️ Section body or toggle icon not found');
    return;
  }
  
  // Toggle visibility
  const isVisible = sectionBody.style.display !== 'none';
  sectionBody.style.display = isVisible ? 'none' : 'block';
  
  // Update icon
  toggleIcon.textContent = isVisible ? '▶' : '▼';
  
  // Save state to localStorage
  localStorage.setItem('topSectionCollapsed', isVisible.toString());
  
  console.log(`✅ Top section ${isVisible ? 'collapsed' : 'expanded'}`);
}

/**
 * Toggle section visibility by ID
 * Used for content sections with specific IDs
 * @param {string} sectionId - The ID of the section to toggle
 */
function toggleSection(sectionId) {
  console.log(`🔧 ui-utils.js toggleSection called with: ${sectionId}`);
  
  const section = document.getElementById(sectionId);
  if (!section) {
    console.warn(`⚠️ Section with ID '${sectionId}' not found`);
    return;
  }
  
  const sectionBody = section.querySelector('.section-body');
  const toggleIcon = section.querySelector('.section-toggle-icon');
  
  if (!sectionBody || !toggleIcon) {
    console.warn('⚠️ Section body or toggle icon not found');
    return;
  }
  
  // Toggle visibility
  const isVisible = sectionBody.style.display !== 'none';
  sectionBody.style.display = isVisible ? 'none' : 'block';
  
  // Update icon
  toggleIcon.textContent = isVisible ? '▶' : '▼';
  
  // Save state to localStorage
  localStorage.setItem(`${sectionId}Collapsed`, isVisible.toString());
  
  console.log(`✅ Section '${sectionId}' ${isVisible ? 'collapsed' : 'expanded'}`);
}

/**
 * Toggle all sections visibility
 * Used for expanding/collapsing all sections at once
 */
function toggleAllSections() {
  console.log('🔧 ui-utils.js toggleAllSections called');
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  const allCollapsed = Array.from(sections).every(section => {
    const sectionBody = section.querySelector('.section-body');
    return sectionBody && sectionBody.style.display === 'none';
  });
  
  sections.forEach(section => {
    const sectionBody = section.querySelector('.section-body');
    const toggleIcon = section.querySelector('.section-toggle-icon');
    
    if (sectionBody && toggleIcon) {
      sectionBody.style.display = allCollapsed ? 'block' : 'none';
      toggleIcon.textContent = allCollapsed ? '▼' : '▶';
      
      // Save state to localStorage
      const sectionId = section.id || 'topSection';
      localStorage.setItem(`${sectionId}Collapsed`, (!allCollapsed).toString());
    }
  });
  
  console.log(`✅ All sections ${allCollapsed ? 'expanded' : 'collapsed'}`);
}

/**
 * Load section states from localStorage
 * Called on page load to restore previous section states
 */
function loadSectionStates() {
  console.log('🔧 ui-utils.js loadSectionStates called');
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  
  sections.forEach(section => {
    const sectionId = section.id || 'topSection';
    const isCollapsed = localStorage.getItem(`${sectionId}Collapsed`) === 'true';
    
    const sectionBody = section.querySelector('.section-body');
    const toggleIcon = section.querySelector('.section-toggle-icon');
    
    if (sectionBody && toggleIcon && isCollapsed) {
      sectionBody.style.display = 'none';
      toggleIcon.textContent = '▶';
    }
  });
  
  console.log('✅ Section states loaded from localStorage');
}

// Export functions to global scope
window.toggleTopSection = toggleTopSection;
window.toggleSection = toggleSection;
window.toggleAllSections = toggleAllSections;
window.loadSectionStates = loadSectionStates;

// Load section states when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  loadSectionStates();
});
