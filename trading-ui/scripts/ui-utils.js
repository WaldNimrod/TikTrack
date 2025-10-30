/**
 * UI Utils - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains shared UI utility functions used across multiple pages including
 * price calculations, section toggles, form utilities, and common UI operations.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/UI_UTILITIES_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.2
 * Last Updated: 2025-01-27
 */

// ===== PRICE CALCULATION FUNCTIONS =====
// These functions are used across multiple pages (trade plans, trades, tickers)

/**
 * Calculate stop price based on percentage
 * @function calculateStopPrice
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
      response = await fetch(`${base}/api/accounts/${itemId}`, {
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
    if (window.Logger) { window.Logger.error(`❌ שגיאה ברענון טבלה אחרי ${operationName}:`, error, { page: "ui-utils" }); }
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
    if (window.Logger) { window.Logger.warn(`${itemName} כבר לא קיים בבסיס הנתונים, מרענן נתונים`, { page: "ui-utils" }); }
    
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
    if (window.Logger) { window.Logger.error(`שגיאה ב${operationName}:`, errorResponse, { page: "ui-utils" }); }
    
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
    if (window.Logger) { window.Logger.warn('לא נמצאה פונקציית טעינת נתונים לעמוד הנוכחי', { page: "ui-utils" }); }
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
window.toggleSection = function (sectionId) {
  if (window.Logger) { window.Logger.debug(`🚀 ===== toggleSection CALLED =====`, { page: "ui-utils" }); }
  console.log(`📋 Function called at: ${new Date().toISOString()}`);
  if (window.Logger) { window.Logger.debug(`📋 Section ID: "${sectionId}"`, { page: "ui-utils" }); }
  if (window.Logger) { window.Logger.debug(`📋 Function type: ${typeof window.toggleSection}`, { page: "ui-utils" }); }
  
  try {
    if (window.Logger) { window.Logger.debug(`🔧 toggleSection called with sectionId: "${sectionId}"`, { page: "ui-utils" }); }
    
    const section = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
    console.log(`🔍 Section found:`, section ? 'YES' : 'NO', section ? `(ID: ${section.id || 'no-id'}, data-section: ${section.getAttribute('data-section') || 'no-data-section'})` : '');
    
    // If this is the top section and page has >=3 sections, toggle all sections together
    const isTopSection = section && section.classList.contains('top-section');
    const sectionsCount = document.querySelectorAll('.top-section, .content-section, [data-section]').length;
    if (isTopSection && sectionsCount >= 3 && typeof window.toggleAllSections === 'function') {
      window.toggleAllSections();
      if (window.Logger) { window.Logger.debug(`🔁 Top section toggle: toggled ALL sections (count=${sectionsCount})`, { page: "ui-utils" }); }
      return;
    }

    const sectionBody = section ? section.querySelector('.section-body') : null;
    if (window.Logger) { window.Logger.debug(`🔍 Section body found:`, sectionBody ? 'YES' : 'NO', { page: "ui-utils" }); }
    
    const toggleBtn = section ? section.querySelector('button[onclick*="toggleSection"], button[data-onclick*="toggleSection"]') : null;
    if (window.Logger) { window.Logger.debug(`🔍 Toggle button found:`, toggleBtn ? 'YES' : 'NO', { page: "ui-utils" }); }
    
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;
    if (window.Logger) { window.Logger.debug(`🔍 Icon found:`, icon ? 'YES' : 'NO', { page: "ui-utils" }); }
    
    if (sectionBody) {
      const isCollapsed = sectionBody.classList.contains('collapsed') || sectionBody.style.display === 'none';
      if (window.Logger) { window.Logger.debug(`🔍 Current state - isCollapsed: ${isCollapsed}, display: "${sectionBody.style.display}"`, { page: "ui-utils" }); }

      if (isCollapsed) {
        sectionBody.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" EXPANDED`, { page: "ui-utils" }); }
      } else {
        sectionBody.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" COLLAPSED`, { page: "ui-utils" }); }
      }

      // Update icon
      if (icon) {
        const newIcon = sectionBody.style.display === 'none' ? '▼' : '▲';
        icon.textContent = newIcon;
        if (window.Logger) { window.Logger.debug(`🎨 Icon updated to: "${newIcon}"`, { page: "ui-utils" }); }
      }

      // Save state with page-specific key
      const isHidden = sectionBody.style.display === 'none';
      const pageName = getCurrentPageName();
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      localStorage.setItem(storageKey, isHidden.toString());
      if (window.Logger) { window.Logger.debug(`💾 State saved to localStorage: ${storageKey} = "${isHidden}"`, { page: "ui-utils" }); }
      
    } else {
      if (window.Logger) { window.Logger.warn(`❌ Section ${sectionId} not found`, { page: "ui-utils" }); }
    }
    
    if (window.Logger) { window.Logger.debug(`✅ ===== toggleSection COMPLETED SUCCESSFULLY =====`, { page: "ui-utils" }); }
  } catch (error) {
    if (window.Logger) { window.Logger.error(`❌ ===== toggleSection ERROR =====`, { page: "ui-utils" }); }
    if (window.Logger) { window.Logger.error(`❌ Error in toggleSection:`, error, { page: "ui-utils" }); }
    if (window.Logger) { window.Logger.error(`❌ Error stack:`, error.stack, { page: "ui-utils" }); }
    if (window.Logger) { window.Logger.error(`❌ ===== END ERROR =====`, { page: "ui-utils" }); }
  }
};

// NOTE: toggleAllSections function moved to generic function below to avoid duplication

/**
 * Restore all section states from localStorage
 * This function restores the collapsed/expanded state of all sections after page refresh
 * Works with the unified section toggle system
 * UPDATED: Now uses page-specific localStorage keys
 */
window.restoreAllSectionStates = function () {
  if (window.Logger) {
    window.Logger.debug('🔧 restoreAllSectionStates called', { page: 'ui-utils' });
  }
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  // if (window.Logger) { window.Logger.debug(`🔍 Found ${sections.length} sections to restore`, { page: "ui-utils" }); }
  
  let restoredCount = 0;
  
  const pageName = getCurrentPageName();
  if (window.Logger) {
    window.Logger.debug(`🔧 restoreAllSectionStates called for page: "${pageName}"`, { page: 'ui-utils' });
  }
  
  // Check for accordion mode (only one section open at a time)
  const pageConfig = typeof window.pageInitializationConfigs !== 'undefined' && 
                     window.pageInitializationConfigs[pageName] ? 
                     window.pageInitializationConfigs[pageName] : 
                     (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName] ? 
                      window.PAGE_CONFIGS[pageName] : null);
  
  const accordionMode = pageConfig?.accordionMode === true;
  
  if (accordionMode && window.Logger) {
    window.Logger.debug(`🎯 Accordion mode enabled for page "${pageName}"`, { page: 'ui-utils' });
  }
  
  // For accordion mode, track which section should be open
  let openSectionId = null;
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    
    // Skip top section in accordion mode - it stays open always
    if (accordionMode && section.classList.contains('top-section')) {
      if (window.Logger) { window.Logger.debug(`⏭️ Skipping top section in accordion mode`, { page: "ui-utils" }); }
      return;
    }
    
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleBtn = section.querySelector('button[onclick*="toggleSection"], button[data-onclick*="toggleSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : 
                  section.querySelector('.section-toggle-icon, .filter-icon');

    if (window.Logger) { window.Logger.debug(`🔧 Processing section ${index + 1}/${sections.length}: ID="${sectionId}"`, { page: "ui-utils" }); }

    if (sectionBody && sectionId) {
      // Check localStorage for saved state with page-specific key
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      const isHidden = localStorage.getItem(storageKey) === 'true';
      if (window.Logger) { window.Logger.debug(`💾 Retrieved state for "${sectionId}" on page "${pageName}": hidden=${isHidden}`, { page: "ui-utils" }); }

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
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" closed (accordion mode - another section is open)`, { page: "ui-utils" }); }
          } else {
            // This is the first open section
            openSectionId = sectionId;
            sectionBody.classList.remove('collapsed');
            section.classList.remove('collapsed');
            sectionBody.style.display = 'block';
            if (icon) { icon.textContent = '▲'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" opened (accordion mode)`, { page: "ui-utils" }); }
          }
        } else {
          // This section should be closed
          sectionBody.classList.add('collapsed');
          section.classList.add('collapsed');
          sectionBody.style.display = 'none';
          if (icon) { icon.textContent = '▼'; }
          if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" closed (accordion mode)`, { page: "ui-utils" }); }
        }
      } else {
        // Normal mode - restore each section independently
        if (isHidden) {
          // Restore collapsed state
          sectionBody.classList.add('collapsed');
          section.classList.add('collapsed');
          sectionBody.style.display = 'none';
          if (icon) { icon.textContent = '▼'; }
          // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to COLLAPSED`, { page: "ui-utils" }); }
        } else {
          // Restore expanded state (default)
          sectionBody.classList.remove('collapsed');
          section.classList.remove('collapsed');
          sectionBody.style.display = 'block';
          if (icon) { icon.textContent = '▲'; }
          // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to EXPANDED`, { page: "ui-utils" }); }
        }
      }
      
      restoredCount++;
    } else {
      if (window.Logger) { window.Logger.debug(`⚠️ No section body or ID found for section ${index + 1}`, { page: "ui-utils" }); }
    }
  });
  
  // In accordion mode, if no section was opened (all closed), keep all closed
  // (do not auto-open first section - let user manually open sections)
  
  if (window.Logger) { window.Logger.debug(`✅ restoreAllSectionStates completed - restored ${restoredCount}/${sections.length} sections${accordionMode ? ' (accordion mode)' : ''}`, { page: "ui-utils" }); }
  return restoredCount;
};

/**
 * Restore section states from localStorage
 * Called on page load to restore previous section states
 * UPDATED: Now uses page-specific localStorage keys consistently
 */
window.restoreSectionStates = function () {
  // if (window.Logger) { window.Logger.debug(`🔧 restoreSectionStates called`, { page: "ui-utils" }); }
  
  // Restore top section state with page-specific key
  const pageName = getCurrentPageName();
  // if (window.Logger) { window.Logger.debug(`🔧 restoreSectionStates called for page: "${pageName}"`, { page: "ui-utils" }); }
  
  const topSectionHidden = localStorage.getItem(`${pageName}_top-section_collapsed`) === 'true';
  // if (window.Logger) { window.Logger.debug(`💾 Retrieved top section state for page "${pageName}": collapsed=${topSectionHidden}`, { page: "ui-utils" }); }
  
  const topSection = document.querySelector('.top-section .section-body, .top-section .section-content');
  const topToggleBtn = document.querySelector('.top-section button[onclick*="toggleSection"]');
  const topIcon = topToggleBtn ? topToggleBtn.querySelector('.filter-icon, .filter-arrow') : 
                   document.querySelector('.top-section .section-toggle-icon, .top-section .filter-icon');

  if (topSection && topSectionHidden) {
    topSection.classList.add('collapsed');
    topSection.style.display = 'none';
    if (topIcon) { topIcon.textContent = '▼'; }
      // if (window.Logger) { window.Logger.debug(`✅ Top section RESTORED to COLLAPSED`, { page: "ui-utils" }); }
  } else if (topSection) {
    topSection.classList.remove('collapsed');
    topSection.style.display = 'block';
    if (topIcon) { topIcon.textContent = '▲'; }
    // if (window.Logger) { window.Logger.debug(`✅ Top section RESTORED to EXPANDED`, { page: "ui-utils" }); }
  }

  // Restore main section states
  const sections = document.querySelectorAll('.content-section');
  // if (window.Logger) { window.Logger.debug(`🔍 Found ${sections.length} content sections to restore`, { page: "ui-utils" }); }
  
  let restoredCount = 0;
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    if (sectionId) {
      const sectionHidden = localStorage.getItem(`${pageName}_${sectionId}_SectionHidden`) === 'true';
      // if (window.Logger) { window.Logger.debug(`💾 Retrieved state for section "${sectionId}" on page "${pageName}": hidden=${sectionHidden}`, { page: "ui-utils" }); }
      
      const sectionBody = section.querySelector('.section-body, .section-content');
      const toggleBtn = section.querySelector('button[onclick*="toggleSection"], button[data-onclick*="toggleSection"]');
      const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : 
                    section.querySelector('.section-toggle-icon, .filter-icon');

      if (sectionBody && sectionHidden) {
        sectionBody.classList.add('collapsed');
        section.classList.add('collapsed');
        sectionBody.style.display = 'none';
        if (icon) { icon.textContent = '▼'; }
        // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to COLLAPSED`, { page: "ui-utils" }); }
        restoredCount++;
      } else if (sectionBody) {
        sectionBody.classList.remove('collapsed');
        section.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) { icon.textContent = '▲'; }
        // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to EXPANDED`, { page: "ui-utils" }); }
        restoredCount++;
      }
    }
  });
  
  // if (window.Logger) { window.Logger.debug(`✅ restoreSectionStates completed - restored ${restoredCount}/${sections.length} sections`, { page: "ui-utils" }); }
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
      <button class="btn btn-sm" onclick="${detailsFunction}('${entityType}', ${entityId})" title="פרטים">
        👁️
      </button>`;
  }

  // Linked items button
  if (showLinked) {
    buttonsHtml += `
      <button class="btn btn-sm" onclick="${linkedFunction}('${entityType}', ${entityId})" title="אובייקטים מקושרים">
        🔗
      </button>`;
  }

  // Edit button
  if (showEdit) {
    buttonsHtml += `
      <button class="btn btn-sm" onclick="${editFunction}('${entityType}', ${entityId})" title="ערוך">
        ✏️
      </button>`;
  }

  // Cancel/Restore button
  if (showCancel) {
    const isCancelled = status === 'בוטל' || status === 'סגור';
    const buttonClass = 'btn';
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
      <button class="btn btn-sm" onclick="${deleteFunction}('${entityType}', ${entityId})" title="מחק" style="font-size: 0.8em;">
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
window.toggleAllSections = window.toggleAllSections;
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
    if (window.Logger) { window.Logger.error(`❌ Table ${tableId} not found`, { page: "ui-utils" }); }
    return;
  }

  const rows = table.querySelectorAll('tbody tr');

  rows.forEach((row, index) => {
    const actionsCell = row.querySelector('.actions-cell');
    if (!actionsCell) {
      if (window.Logger) { window.Logger.warn(`⚠️ No actions cell found in row ${index}`, { page: "ui-utils" }); }
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

// הוסר - המערכת המאוחדת מטפלת באתחול
// Initialize modal backdrop and restore section states when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   initializeModalBackdrop();
  
  // Restore section states after a short delay to ensure all elements are loaded
  setTimeout(() => {
    if (typeof window.restoreSectionStates === 'function') {
      window.restoreSectionStates();
    }
  }, 100);
// });

// ===== SECTION TOGGLE FUNCTIONS =====
// These functions handle opening/closing sections across all pages

/**
 * Toggle top section visibility
 * Used for the main top section of each page
 */
function toggleTopSection(sectionId = 'top-section') {
  const section = document.getElementById(sectionId);
  if (!section) {
    if (window.Logger) { window.Logger.warn(`⚠️ Section ${sectionId} not found`, { page: "ui-utils" }); }
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
    if (window.Logger) { window.Logger.warn(`⚠️ No content area found in section ${sectionId}`, { page: "ui-utils" }); }
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
    if (window.Logger) { window.Logger.debug(`📂 Expanded section: ${sectionId}`, { page: "ui-utils" }); }
  } else {
    // Collapse
    sectionBody.style.display = 'none';
    section.classList.add('collapsed');
    section.classList.remove('expanded');
    if (toggleIcon) toggleIcon.textContent = '▶';
    if (window.Logger) { window.Logger.debug(`📁 Collapsed section: ${sectionId}`, { page: "ui-utils" }); }
  }
  
  // Save state to localStorage with page-specific key
  const pageName = getCurrentPageName();
  const storageKey = `${pageName}_${sectionId}_collapsed`;
  localStorage.setItem(storageKey, (!isCollapsed).toString());
  if (window.Logger) { window.Logger.debug(`💾 Top section state saved: ${storageKey} = "${!isCollapsed}"`, { page: "ui-utils" }); }
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
window.debugSectionStates = function() {
  const pageName = getCurrentPageName();
  if (window.Logger) { window.Logger.debug(`🔍 Debug Section States for page: "${pageName}"`, { page: "ui-utils" }); }
  if (window.Logger) { window.Logger.debug('=====================================', { page: "ui-utils" }); }
  
  // Check top section
  const topSectionKey = `${pageName}_top-section_collapsed`;
  const topSectionState = localStorage.getItem(topSectionKey);
  if (window.Logger) { window.Logger.debug(`📍 Top Section: ${topSectionKey} = "${topSectionState}"`, { page: "ui-utils" }); }
  
  // Check all content sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id;
    if (sectionId) {
      const sectionKey = `${pageName}_${sectionId}_SectionHidden`;
      const sectionState = localStorage.getItem(sectionKey);
      if (window.Logger) { window.Logger.debug(`📍 Section ${index + 1}: ${sectionKey} = "${sectionState}"`, { page: "ui-utils" }); }
    }
  });
  
  if (window.Logger) { window.Logger.debug('=====================================', { page: "ui-utils" }); }
};

/**
 * Toggle all sections on the page
 * Generic function that toggles all collapsible sections
 * UPDATED: Now uses page-specific localStorage keys
 */
function toggleAllSections() {
  console.log(`🔧 toggleAllSections (generic) called`);
  
  // Find all possible section types
  const contentSections = document.querySelectorAll('.content-section, .top-section');
  const sectionContents = document.querySelectorAll('.section-content');
  
  // Combine all sections
  const allSections = [...contentSections, ...sectionContents];
  
  if (!allSections.length) {
    if (window.Logger) { window.Logger.warn('⚠️ No sections found to toggle', { page: "ui-utils" }); }
    return;
  }
  
  if (window.Logger) { window.Logger.debug(`🔍 Found ${allSections.length} sections to toggle`, { page: "ui-utils" }); }
  
  // Check if all sections are collapsed
  const allCollapsed = allSections.every(section => {
    const sectionBody = section.querySelector('.section-body, .section-content');
    return sectionBody && (
      sectionBody.style.display === 'none' || 
      section.classList.contains('collapsed')
    );
  });
  
  if (window.Logger) { window.Logger.debug(`🔍 All sections are collapsed: ${allCollapsed}`, { page: "ui-utils" }); }
  if (window.Logger) { window.Logger.debug(`🎯 Action: ${allCollapsed ? 'EXPANDING all sections' : 'COLLAPSING all sections'}`, { page: "ui-utils" }); }
  
  const pageName = getCurrentPageName();
  
  // Toggle all sections
  allSections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleBtn = section.querySelector('.filter-toggle-btn, [onclick*="toggle"]');
    const icon = section.querySelector('.section-toggle-icon, .filter-icon');
    
    if (window.Logger) { window.Logger.debug(`🔧 Processing section ${index + 1}/${allSections.length}: ID="${sectionId}"`, { page: "ui-utils" }); }
    
    if (sectionBody) {
      if (allCollapsed) {
        // Expand all
        sectionBody.style.display = 'block';
        section.classList.remove('collapsed');
        section.classList.add('expanded');
        if (icon) icon.textContent = '▼';
        if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" EXPANDED`, { page: "ui-utils" }); }
      } else {
        // Collapse all
        sectionBody.style.display = 'none';
        section.classList.add('collapsed');
        section.classList.remove('expanded');
        if (icon) icon.textContent = '▶';
        if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" COLLAPSED`, { page: "ui-utils" }); }
      }
      
      // Save state with page-specific key
      const isHidden = sectionBody.style.display === 'none';
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      localStorage.setItem(storageKey, isHidden.toString());
      if (window.Logger) { window.Logger.debug(`💾 State saved to localStorage: ${storageKey} = "${isHidden}"`, { page: "ui-utils" }); }
    } else {
      if (window.Logger) { window.Logger.debug(`⚠️ No section body found for section "${sectionId}"`, { page: "ui-utils" }); }
    }
  });
  
  console.log(`✅ toggleAllSections (generic) completed - processed ${allSections.length} sections`);
  if (window.Logger) { window.Logger.debug(`📂 All sections ${allCollapsed ? 'expanded' : 'collapsed'}`, { page: "ui-utils" }); }
}

/**
 * Load section states from localStorage
 * Called on page load to restore previous section states
 * UPDATED: Now uses page-specific localStorage keys
 */
function loadSectionStates() {
  // if (window.Logger) { window.Logger.debug(`🔧 loadSectionStates called`, { page: "ui-utils" }); }
  
  const pageName = getCurrentPageName();
  // if (window.Logger) { window.Logger.debug(`🔧 loadSectionStates called for page: "${pageName}"`, { page: "ui-utils" }); }
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  // if (window.Logger) { window.Logger.debug(`🔍 Found ${sections.length} sections to load states for`, { page: "ui-utils" }); }
  
  let restoredCount = 0;
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    const storageKey = `${pageName}_${sectionId}_SectionHidden`;
    const isCollapsed = localStorage.getItem(storageKey) === 'true';
    
    // if (window.Logger) { window.Logger.debug(`💾 Retrieved state for "${sectionId}" on page "${pageName}": hidden=${isCollapsed}`, { page: "ui-utils" }); }
    
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleIcon = section.querySelector('.section-toggle-icon, .filter-icon');
    
    if (sectionBody && isCollapsed) {
      sectionBody.style.display = 'none';
      section.classList.add('collapsed');
      section.classList.remove('expanded');
      if (toggleIcon) toggleIcon.textContent = '▶';
        // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to COLLAPSED`, { page: "ui-utils" }); }
      restoredCount++;
    } else if (sectionBody) {
      sectionBody.style.display = 'block';
      section.classList.remove('collapsed');
      section.classList.add('expanded');
      if (toggleIcon) toggleIcon.textContent = '▼';
        // if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to EXPANDED`, { page: "ui-utils" }); }
      restoredCount++;
    }
  });
  
  // if (window.Logger) { window.Logger.debug(`✅ loadSectionStates completed - restored ${restoredCount}/${sections.length} sections`, { page: "ui-utils" }); }
}

// ===== PAGE SUMMARY STATISTICS FUNCTIONS =====
// These functions are used across multiple pages for summary statistics

/**
 * Update page summary statistics - Unified function
 * Calculates and displays page-specific statistics using InfoSummarySystem
 * 
 * @function updatePageSummaryStats
 * @param {string} pageName - Name of the page (alerts, cash_flows, trade_plans, etc.)
 * @param {Array} data - Data array to calculate statistics from
 * @param {string} [countElementId] - Optional element ID to update record count
 * @returns {void}
 */
function updatePageSummaryStats(pageName, data, countElementId = null) {
  try {
    // Using filtered data if available, otherwise provided data
    const dataToUse = window[`filtered${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`] || data;
    
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS[pageName];
      if (config) {
        window.InfoSummarySystem.calculateAndRender(dataToUse, config);
        
        // עדכון מספר הרשומות בטבלה (אם סופק ID)
        if (countElementId) {
          const countElement = document.getElementById(countElementId);
          if (countElement) {
            countElement.textContent = `${dataToUse.length} רשומות`;
          }
        }
      } else {
        console.warn(`No summary config found for page: ${pageName}`);
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
    window.Logger.error('שגיאה בעדכון סטטיסטיקות סיכום:', error, { page: pageName });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה בעדכון סטטיסטיקות סיכום', error.message);
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
window.updatePageSummaryStats = updatePageSummaryStats;

// הוסר - המערכת המאוחדת מטפלת באתחול
// Load section states when DOM is ready
// document.addEventListener('DOMContentLoaded', function() {
//   loadSectionStates();
// });
