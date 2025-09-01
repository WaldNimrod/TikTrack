/**
 * UI Utilities JavaScript
 *
 * פונקציות UI משותפות באמת - רק מה שמשמש הרבה עמודים
 *
 * File: trading-ui/scripts/ui-utils.js
 * Version: 1.1
 * Last Updated: August 26, 2025
 *
 * Added: Price calculation functions for trade plans, trades, and tickers
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
    console.warn('Invalid current price for stop calculation:', currentPrice);
    return 0;
  }

  if (!stopPercentage || stopPercentage <= 0) {
    console.warn('Invalid stop percentage:', stopPercentage);
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
    console.warn('Invalid side for stop calculation:', side);
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
    console.warn('Invalid current price for target calculation:', currentPrice);
    return 0;
  }

  if (!targetPercentage || targetPercentage <= 0) {
    console.warn('Invalid target percentage:', targetPercentage);
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
    console.warn('Invalid side for target calculation:', side);
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
    console.warn('Invalid current price for percentage calculation:', currentPrice);
    return 0;
  }

  if (!targetPrice || targetPrice <= 0) {
    console.warn('Invalid target price for percentage calculation:', targetPrice);
    return 0;
  }

  if (side === 'Long') {
    return (targetPrice - currentPrice) / currentPrice * 100;
  } else if (side === 'Short') {
    return (currentPrice - targetPrice) / currentPrice * 100;
  } else {
    console.warn('Invalid side for percentage calculation:', side);
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
  console.log('Updated prices from percentages:', {
    currentPrice,
    side,
    stopPercentage,
    targetPercentage,
    newStopPrice: newStopPrice.toFixed(2),
    newTargetPrice: newTargetPrice.toFixed(2),
  });
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
  console.log('Updated percentages from prices:', {
    currentPrice,
    side,
    stopPrice,
    targetPrice,
    newStopPercentage: newStopPercentage.toFixed(2),
    newTargetPercentage: newTargetPercentage.toFixed(2),
  });
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
function showSecondConfirmation(title, message, onConfirm) {
  // Showing second confirmation modal

  const modal = document.getElementById('secondConfirmationModal');
  if (!modal) {
    handleElementNotFound('showSecondConfirmation', 'Second confirmation modal not found');
    return;
  }

  // עדכון תוכן המודל
  const titleElement = modal.querySelector('.modal-title');
  const messageElement = modal.querySelector('.modal-body');

  if (titleElement) {titleElement.textContent = title;}
  if (messageElement) {messageElement.textContent = message;}

  // הגדרת פונקציית האישור
  const confirmBtn = modal.querySelector('.btn-confirm');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
      if (onConfirm) {onConfirm();}
    };
  }

  // הצגת המודל
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

/**
 * אישור פעולה שנייה
 * Confirm second action
 */
function confirmSecondAction() {
  if (typeof window.secondConfirmationCallback === 'function') {
    window.secondConfirmationCallback();
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById('secondConfirmationModal'));
  if (modal) {
    modal.hide();
  }
}


// ===== Notification Functions =====

// ===== Color Functions =====
// These functions handle color formatting

// ===== Color Functions =====
// These functions handle color formatting

/**
 * פונקציה לצביעת סכומים (חיובי/שלילי)
 * Function for coloring amounts (positive/negative)
 */
function colorAmount(amount, displayText = null) {
  const text = displayText || (amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`);
  const className = amount >= 0 ? 'profit-positive' : 'profit-negative';
  return `<span class="${className}">${text}</span>`;
}

/**
 * המרת סוג הודעה לצבע Bootstrap
 * Convert notification type to Bootstrap color
 *
 * @param {string} type - סוג ההודעה
 * @returns {string} צבע Bootstrap
 */
function getBootstrapColor(type) {
  switch (type) {
  case 'success':
    return 'success';
  case 'error':
    return 'danger';
  case 'warning':
    return 'warning';
  case 'info':
  default:
    return 'info';
  }
}

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
  } catch (error) {
    console.warn('⚠️ Linked items check failed, proceeding with cancellation');
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
async function performItemCancellation(itemType, itemId, itemName) {
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




// אתחול UI Utils
function initializeUIUtils() {
  // UI Utils loaded successfully
}

// Export functions to global scope
window.uiUtils = {
  cancelItem,
  performItemCancellation,
  createCancelButton,
  createDeleteButton,
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
    // גיבוי למערכת הישנה
    if (typeof window.showSecondConfirmationModal === 'function') {
      window.showSecondConfirmationModal(
        'אישור פעולה',
        message,
        onConfirm,
        () => {},
      );
    } else {
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'אישור',
          message,
          onConfirm,
        );
      } else {
        if (typeof window.showConfirmationDialog === 'function') {
          window.showConfirmationDialog(
            'אישור',
            message,
            onConfirm,
          );
        } else {
          if (confirm(message)) {
            onConfirm();
          }
        }
      }
    }
  }
}

// פונקציה createWarningModal כבר מוגדרת בשורה 1041

// ===== EXPORTS =====

// Export account utility functions
window.showSecondConfirmationModal = showSecondConfirmationModal;

// Initialize modal backdrop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeModalBackdrop();
});
