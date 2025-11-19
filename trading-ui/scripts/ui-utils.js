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

  // הגדרת אפשרויות ברירת מחדל - ללא backdrop (ננהל אותו מרכזית)
  const defaultOptions = {
    backdrop: false, // ננהל backdrop מרכזית דרך ModalNavigationManager
    keyboard: options.keyboard !== false ? true : false,
    focus: options.focus !== false ? true : false,
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
  window.Logger?.info('cancelItem invoked', { itemType, itemId, itemName, currentStatus });

  // בדיקה אם האובייקט כבר מבוטל
  if (currentStatus === 'cancelled') {
    // Item is already cancelled
    if (typeof window.showInfoNotification === 'function') {
      const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
        ? window.LinkedItemsService.getEntityLabel(itemType) 
        : itemType;
      window.showInfoNotification(`${entityLabel} כבר מבוטל`);
    }
    return;
  }

  try {
    let hasLinkedItems = false;

    if (typeof window.checkLinkedItemsBeforeAction === 'function') {
      window.Logger?.info('cancelItem using global checkLinkedItemsBeforeAction', { itemType, itemId });
      hasLinkedItems = await window.checkLinkedItemsBeforeAction(itemType, itemId, 'cancel');
      window.Logger?.info('cancelItem linked items result (global)', { itemType, itemId, hasLinkedItems });
    } else {
      window.currentAction = 'cancel';

      const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);
      window.Logger?.info('cancelItem fallback linked-items fetch', {
        itemType,
        itemId,
        ok: response.ok,
        status: response.status,
      });

      if (response.ok) {
        const linkedItemsData = await response.json();
        const childEntities = linkedItemsData.child_entities || [];
        const parentEntities = linkedItemsData.parent_entities || [];

        window.Logger?.info('cancelItem fallback linked-items counts', {
          itemType,
          itemId,
          childCount: childEntities.length,
          parentCount: parentEntities.length,
        });

        if (childEntities.length > 0) {
          hasLinkedItems = true;
          if (typeof window.showLinkedItemsModal === 'function') {
            window.Logger?.info('cancelItem showing linked items modal (fallback)', { itemType, itemId });
            window.showLinkedItemsModal(linkedItemsData, itemType, itemId, 'warningBlock');
          } else {
            handleFunctionNotFound('showLinkedItemsModal', 'פונקציית הצגת פריטים מקושרים לא נמצאה');
            if (window.showErrorNotification) {
              const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
                ? window.LinkedItemsService.getEntityLabel(itemType) 
                : itemType;
              window.showErrorNotification('שגיאה בביטול', `לא ניתן לבטל ${entityLabel} זה - יש פריטים מקושרים אליו`);
            }
          }
        }
      }

      delete window.currentAction;
    }

    if (hasLinkedItems) {
      window.Logger?.info('cancelItem aborted due to linked items', { itemType, itemId });
      return;
    }
  } catch {
    // Linked items check failed, proceeding with cancellation
    window.Logger?.warn('cancelItem linked-items check failed, proceeding', { itemType, itemId });
  }

  const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
    ? window.LinkedItemsService.getEntityLabel(itemType) 
    : itemType;
  const displayName = itemName || `${entityLabel} ${itemId}`;

  let confirmed = true;
  if (typeof window.showCancelWarning === 'function') {
    window.Logger?.info('cancelItem showing cancel warning modal', { itemType, itemId, itemName: displayName });
    confirmed = await new Promise(resolve => {
      window.showCancelWarning(itemType, displayName, entityLabel,
        () => resolve(true),
        () => resolve(false));
    });
  } else if (typeof window.showConfirmationDialog === 'function') {
    window.Logger?.info('cancelItem showing confirmation dialog fallback', { itemType, itemId, itemName: displayName });
    confirmed = await new Promise(resolve => {
      window.showConfirmationDialog(
        `ביטול ${entityLabel}`,
        `האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?\n\nהסטטוס ישתנה ל"מבוטל".`,
        () => resolve(true),
        () => resolve(false),
        'warning'
      );
    });
  } else {
    confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?`);
  }

  if (!confirmed) {
    window.Logger?.info('cancelItem cancelled by user', { itemType, itemId });
    return;
  }

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
    // Use relative URL to work with both development (8080) and production (5001)
    let response;
    const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
      ? window.LinkedItemsService.getEntityLabel(itemType) 
      : itemType;
    const successMessage = `${entityLabel} בוטל בהצלחה!`;
    window.Logger?.info('performItemCancellation started', { itemType, itemId });

    switch (itemType) {
    case 'trade_plan': {
      const payload = { cancel_reason: 'בוטל על ידי המשתמש דרך הממשק' };
      response = await fetch(`/api/trade-plans/${itemId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      break;
    }

    case 'trade':
      response = await fetch(`/api/trades/${itemId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' }),
      });
      break;

    case 'ticker':
      response = await fetch(`/api/tickers/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'alert':
      response = await fetch(`/api/alerts/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    case 'account':
      response = await fetch(`/api/trading-accounts/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

    default:
      throw new Error(`לא נתמך ביטול עבור סוג: ${itemType}`);
    }

    window.Logger?.info('performItemCancellation response received', {
      itemType,
      itemId,
      ok: response?.ok,
      status: response?.status,
    });

    if (response.ok) {
      let responseData;
      try {
        const responseText = await response.clone().text();
        window.Logger?.info('performItemCancellation response raw text', {
          itemType,
          itemId,
          responseText,
        });
        responseData = responseText ? JSON.parse(responseText) : undefined;
        window.Logger?.info('performItemCancellation response payload parsed', {
          itemType,
          itemId,
          responseData,
          apiStatus: responseData?.data?.status,
        });
      } catch (jsonError) {
        window.Logger?.warn('performItemCancellation: failed to parse response body', {
          itemType,
          itemId,
          error: jsonError?.message,
        });
      }
      const apiSuccessMessage = responseData?.message || responseData?.status_message;
      const finalSuccessMessage = apiSuccessMessage || successMessage;
      // Item cancelled successfully
      window.Logger?.info('performItemCancellation success', {
        itemType,
        itemId,
        successMessage: finalSuccessMessage,
      });

      // הצגת הודעת הצלחה
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification(finalSuccessMessage);
      } else if (typeof window.showNotification === 'function') {
        window.showNotification(finalSuccessMessage, 'success');
      }

      if (typeof window.loadData === 'function') {
        await window.loadData();
      } else {
        const basicRefresh = window[`load${itemType.charAt(0).toUpperCase() + itemType.slice(1)}sData`];
        if (typeof basicRefresh === 'function') {
          await basicRefresh();
        } else if (typeof window.loadTradePlansData === 'function' && itemType === 'trade_plan') {
          await window.loadTradePlansData();
        } else if (typeof window.reloadPageData === 'function') {
          await window.reloadPageData();
        }
      }

    } else {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    handleApiError(error, `cancelling ${itemType} ${itemId}`);
    const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
      ? window.LinkedItemsService.getEntityLabel(itemType) 
      : itemType;
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification(`שגיאה בביטול ${entityLabel}`, error.message);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(`שגיאה בביטול ${entityLabel}`, 'error', 'שגיאה', 6000, 'system');
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
    'trading_accounts': {
      loadData: window.loadTradingAccountsDataForTradingAccountsPage,
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
  // Use console.log instead of Logger to break circular dependency
  // Logger should not depend on toggleSection, and toggleSection should not depend on Logger
  const DEBUG_MODE = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.search.includes('debug=true');
  
  if (DEBUG_MODE) {
    console.debug(`🚀 ===== toggleSection CALLED =====`);
    console.debug(`📋 Section ID: "${sectionId}"`);
    console.debug(`📋 Function type: ${typeof window.toggleSection}`);
  }
  
  try {
    if (DEBUG_MODE) {
      console.debug(`🔧 toggleSection called with sectionId: "${sectionId}"`);
    }
    
    const section = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
    console.log(`🔍 Section found:`, section ? 'YES' : 'NO', section ? `(ID: ${section.id || 'no-id'}, data-section: ${section.getAttribute('data-section') || 'no-data-section'})` : '');
    
    // If this is the top section and page has >=3 sections, toggle all sections together
    const isTopSection = section && section.classList.contains('top-section');
    const sectionsCount = document.querySelectorAll('.top-section, .content-section, [data-section]').length;
    if (isTopSection && sectionsCount >= 3 && typeof window.toggleAllSections === 'function') {
      window.toggleAllSections();
      if (DEBUG_MODE) {
        console.debug(`🔁 Top section toggle: toggled ALL sections (count=${sectionsCount})`);
      }
      return;
    }

    const sectionBody = section ? section.querySelector('.section-body') : null;
    if (DEBUG_MODE) {
      console.debug(`🔍 Section body found:`, sectionBody ? 'YES' : 'NO');
    }
    
    const toggleBtn = section ? section.querySelector('button[onclick*="toggleSection"], button[data-onclick*="toggleSection"]') : null;
    if (DEBUG_MODE) {
      console.debug(`🔍 Toggle button found:`, toggleBtn ? 'YES' : 'NO');
    }
    
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : null;
    if (DEBUG_MODE) {
      console.debug(`🔍 Icon found:`, icon ? 'YES' : 'NO');
    }
    
    if (sectionBody) {
      const isCollapsed = sectionBody.style.display === 'none';
      if (DEBUG_MODE) {
        console.debug(`🔍 Current state - isCollapsed: ${isCollapsed}, display: "${sectionBody.style.display}"`);
      }

      // Check if we're in accordion mode
      const pageName = getCurrentPageName();
      const pageConfig = typeof window.pageInitializationConfigs !== 'undefined' && 
                         window.pageInitializationConfigs[pageName] ? 
                         window.pageInitializationConfigs[pageName] : 
                         (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName] ? 
                          window.PAGE_CONFIGS[pageName] : null);
      const accordionMode = pageConfig?.accordionMode === true;
      
      if (DEBUG_MODE && accordionMode) {
        console.debug(`🎯 Accordion mode detected - checking for other open sections`);
      }

      if (isCollapsed) {
        // Opening section
        if (accordionMode) {
          // Close all other sections first
          const allContentSections = document.querySelectorAll('.content-section');
          allContentSections.forEach(otherSection => {
            if (otherSection !== section) {
              const otherSectionBody = otherSection.querySelector('.section-body');
              const otherIcon = otherSection.querySelector('.section-toggle-icon');
              if (otherSectionBody && (otherSectionBody.style.display !== 'none')) {
                otherSectionBody.style.display = 'none';
                if (otherIcon) otherIcon.textContent = '▼';
                // Save state for other sections too
                const otherSectionId = otherSection.getAttribute('data-section') || otherSection.id;
                if (otherSectionId) {
                  // Save state via PageStateManager if available
                  if (window.PageStateManager && window.PageStateManager.initialized) {
                    window.PageStateManager.loadSections(pageName).then(async (sections) => {
                      sections[otherSectionId] = true;
                      await window.PageStateManager.saveSections(pageName, sections);
                    }).catch(() => {
                      // Fallback ל-localStorage
                      const otherStorageKey = `${pageName}_${otherSectionId}_SectionHidden`;
                      localStorage.setItem(otherStorageKey, 'true');
                    });
                  } else {
                    // Fallback ל-localStorage
                    const otherStorageKey = `${pageName}_${otherSectionId}_SectionHidden`;
                    localStorage.setItem(otherStorageKey, 'true');
                  }
                }
              }
            }
          });
        }
        
        sectionBody.style.display = 'block';
        if (DEBUG_MODE) {
          console.debug(`✅ Section "${sectionId}" EXPANDED`);
        }
      } else {
        // Closing section
        sectionBody.style.display = 'none';
        if (DEBUG_MODE) {
          console.debug(`✅ Section "${sectionId}" COLLAPSED`);
        }
      }

      // Update icon
      if (icon) {
        const newIcon = sectionBody.style.display === 'none' ? '▼' : '▲';
        icon.textContent = newIcon;
        if (DEBUG_MODE) {
          console.debug(`🎨 Icon updated to: "${newIcon}"`);
        }
      }

      // Save state via PageStateManager if available
      const isHidden = sectionBody.style.display === 'none';
      if (window.PageStateManager && window.PageStateManager.initialized) {
        // טעינת מצב נוכחי ועדכון
        window.PageStateManager.loadSections(pageName).then(async (sections) => {
          sections[sectionId] = isHidden;
          await window.PageStateManager.saveSections(pageName, sections);
          if (DEBUG_MODE) {
            console.debug(`💾 State saved via PageStateManager: ${sectionId} = "${isHidden}"`);
          }
        }).catch(err => {
          // Fallback ל-localStorage
          const storageKey = `${pageName}_${sectionId}_SectionHidden`;
          localStorage.setItem(storageKey, isHidden.toString());
          if (DEBUG_MODE) {
            console.debug(`💾 State saved to localStorage (fallback): ${storageKey} = "${isHidden}"`);
          }
        });
      } else {
        // Fallback ל-localStorage רק אם PageStateManager לא זמין
        const storageKey = `${pageName}_${sectionId}_SectionHidden`;
        localStorage.setItem(storageKey, isHidden.toString());
        if (DEBUG_MODE) {
          console.debug(`💾 State saved to localStorage: ${storageKey} = "${isHidden}"`);
        }
      }
      
    } else {
      if (DEBUG_MODE) {
        console.warn(`❌ Section ${sectionId} not found`);
      }
    }
    
    if (DEBUG_MODE) {
      console.debug(`✅ ===== toggleSection COMPLETED SUCCESSFULLY =====`);
    }
  } catch (error) {
    // Use console.error instead of Logger to avoid circular dependency
    console.error(`❌ ===== toggleSection ERROR =====`);
    console.error(`❌ Error in toggleSection:`, error);
    if (error.stack) {
      console.error(`❌ Error stack:`, error.stack);
    }
    // Logger removed to break circular dependency - using console.error instead
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
  
  // טעינת מצב סקשנים דרך PageStateManager אם זמין
  let sectionsState = {};
  if (window.PageStateManager && window.PageStateManager.initialized) {
    try {
      sectionsState = await window.PageStateManager.loadSections(pageName);
      if (window.Logger) {
        window.Logger.debug(`💾 Loaded sections state via PageStateManager for "${pageName}":`, sectionsState, { page: "ui-utils" });
      }
    } catch (err) {
      if (window.Logger) {
        window.Logger.warn('⚠️ Failed to load sections via PageStateManager, using localStorage fallback', err, { page: "ui-utils" });
      }
      // Fallback ל-localStorage - נטען בהמשך
    }
  }
  
  // Check for accordion mode (only one section open at a time)
  const pageConfig = typeof window.pageInitializationConfigs !== 'undefined' && 
                     window.pageInitializationConfigs[pageName] ? 
                     window.pageInitializationConfigs[pageName] : 
                     (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName] ? 
                      window.PAGE_CONFIGS[pageName] : null);
  
  const accordionMode = pageConfig?.accordionMode === true;
  const defaultState = pageConfig?.sectionsDefaultState || 'open'; // 'closed' | 'open' - backward compatible
  
  if (accordionMode && window.Logger) {
    window.Logger.debug(`🎯 Accordion mode enabled for page "${pageName}"`, { page: 'ui-utils' });
  }
  
  if (window.Logger) {
    window.Logger.debug(`📋 Default state for page "${pageName}": ${defaultState}`, { page: 'ui-utils' });
  }
  
  // For accordion mode, track which section should be open
  let openSectionId = null;
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    
    // Skip top section - it stays open always (per user requirements)
    if (section.classList.contains('top-section')) {
      if (window.Logger) { window.Logger.debug(`⏭️ Skipping top section (always open)`, { page: "ui-utils" }); }
      return;
    }
    
    const sectionBody = section.querySelector('.section-body, .section-content');
    const toggleBtn = section.querySelector('button[onclick*="toggleSection"], button[data-onclick*="toggleSection"]');
    const icon = toggleBtn ? toggleBtn.querySelector('.section-toggle-icon, .filter-icon, .filter-arrow') : 
                  section.querySelector('.section-toggle-icon, .filter-icon');

    if (window.Logger) { window.Logger.debug(`🔧 Processing section ${index + 1}/${sections.length}: ID="${sectionId}"`, { page: "ui-utils" }); }

    if (sectionBody && sectionId) {
      // בדיקת מצב שמור - קודם מ-PageStateManager, אחר כך fallback ל-localStorage
      let isHidden = false;
      if (sectionsState && sectionsState.hasOwnProperty(sectionId)) {
        isHidden = sectionsState[sectionId] === true;
        if (window.Logger) { window.Logger.debug(`💾 Retrieved state from PageStateManager for "${sectionId}": hidden=${isHidden}`, { page: "ui-utils" }); }
      } else {
        // Fallback ל-localStorage
        const storageKey = `${pageName}_${sectionId}_SectionHidden`;
        isHidden = localStorage.getItem(storageKey) === 'true';
        if (window.Logger) { window.Logger.debug(`💾 Retrieved state from localStorage for "${sectionId}": hidden=${isHidden}`, { page: "ui-utils" }); }
      }

      if (accordionMode) {
        // In accordion mode, only one section should be open
        // If no state is saved (null), respect HTML default (closed)
        const hasSavedState = sectionsState && sectionsState.hasOwnProperty(sectionId) || localStorage.getItem(`${pageName}_${sectionId}_SectionHidden`) !== null;
        const shouldBeOpen = hasSavedState && isHidden === false;
        
        if (window.Logger) {
          window.Logger.debug(`🔍 ACCORDION DEBUG for "${sectionId}":`, { 
            page: "ui-utils",
            hasSavedState: hasSavedState,
            isHidden: isHidden,
            shouldBeOpen: shouldBeOpen,
            openSectionId: openSectionId,
            bodyDisplayStyle: sectionBody.style.display
          });
        }
        
        // Only modify state if we have a saved preference
        if (hasSavedState) {
          if (shouldBeOpen) {
            // This section should be open
            if (openSectionId) {
              // Already have an open section, close this one
              sectionBody.style.display = 'none';
              if (icon) { icon.textContent = '▼'; }
              if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" closed (accordion mode - another section is open)`, { page: "ui-utils" }); }
            } else {
              // This is the first open section
              openSectionId = sectionId;
              sectionBody.style.display = 'block';
              if (icon) { icon.textContent = '▲'; }
              if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" opened (accordion mode)`, { page: "ui-utils" }); }
            }
          } else {
            // This section should be closed
            sectionBody.style.display = 'none';
            if (icon) { icon.textContent = '▼'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" closed (accordion mode)`, { page: "ui-utils" }); }
          }
        } else {
          // No saved state - in accordion mode, always closed
          sectionBody.style.display = 'none';
          if (icon) { icon.textContent = '▼'; }
          if (window.Logger) { window.Logger.debug(`⏭️ Section "${sectionId}" has no saved state - accordion mode default (closed)`, { page: "ui-utils" }); }
        }
      } else {
        // Normal mode - restore each section independently
        const hasSavedStateInNormalMode = sectionsState && sectionsState.hasOwnProperty(sectionId) || localStorage.getItem(`${pageName}_${sectionId}_SectionHidden`) !== null;
        
        if (hasSavedStateInNormalMode) {
          // Has saved state - restore it
          if (isHidden) {
            // Restore collapsed state
            sectionBody.style.display = 'none';
            if (icon) { icon.textContent = '▼'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to COLLAPSED`, { page: "ui-utils" }); }
          } else {
            // Restore expanded state
            sectionBody.style.display = 'block';
            if (icon) { icon.textContent = '▲'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" RESTORED to EXPANDED`, { page: "ui-utils" }); }
          }
        } else {
          // No saved state - apply default state from page config
          if (defaultState === 'closed') {
            sectionBody.style.display = 'none';
            if (icon) { icon.textContent = '▼'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" default state CLOSED (no cache)`, { page: "ui-utils" }); }
          } else {
            sectionBody.style.display = 'block';
            if (icon) { icon.textContent = '▲'; }
            if (window.Logger) { window.Logger.debug(`✅ Section "${sectionId}" default state OPEN (no cache)`, { page: "ui-utils" }); }
          }
        }
      }
      
      restoredCount++;
    } else {
      if (window.Logger) { window.Logger.debug(`⚠️ No section body or ID found for section ${index + 1}`, { page: "ui-utils" }); }
    }
  });
  
  // In accordion mode, if no section was opened (all closed), keep all closed
  // (do not auto-open first section - let user manually open sections)
  
  // Set flag and dispatch event to signal that sections have been restored
  // This allows lazy loading observers to wait before initializing
  window.sectionsRestored = true;
  window.dispatchEvent(new CustomEvent('sections:restored', {
    detail: { pageName, restoredCount, totalSections: sections.length, accordionMode }
  }));
  
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

    // בדיקה אם כבר יש כפתורים - למנוע כפילות
    if (actionsCell.querySelector('.actions-menu-wrapper')) {
      if (window.Logger) { window.Logger.warn(`⚠️ Actions menu already exists in row ${index}, skipping`, { page: "ui-utils" }); }
      return;
    }
    
    actionsCell.innerHTML = buttonsHtml;
  });

}

// Export the new function only if not already defined (prefer ui-basic.js version)
if (!window.loadTableActionButtons) {
  window.loadTableActionButtons = loadTableActionButtons;
}

// Export demo functions for testing
window.viewTickerDetails = viewTickerDetails;
// REMOVED: window.viewLinkedItems demo - use window.viewLinkedItems from linked-items.js instead
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
  
  // Save state via PageStateManager if available
  const pageName = getCurrentPageName();
  const isHidden = !isCollapsed;
  if (window.PageStateManager && window.PageStateManager.initialized) {
    // טעינת מצב נוכחי ועדכון
    window.PageStateManager.loadSections(pageName).then(async (sections) => {
      sections[sectionId] = isHidden;
      await window.PageStateManager.saveSections(pageName, sections);
      if (window.Logger) {
        window.Logger.debug(`💾 Top section state saved via PageStateManager: ${sectionId} = "${isHidden}"`, { page: "ui-utils" });
      }
    }).catch(err => {
      // Fallback ל-localStorage
      const storageKey = `${pageName}_${sectionId}_collapsed`;
      localStorage.setItem(storageKey, (!isCollapsed).toString());
      if (window.Logger) {
        window.Logger.debug(`💾 Top section state saved to localStorage (fallback): ${storageKey} = "${!isCollapsed}"`, { page: "ui-utils" });
      }
    });
  } else {
    // Fallback ל-localStorage רק אם PageStateManager לא זמין
    const storageKey = `${pageName}_${sectionId}_collapsed`;
    localStorage.setItem(storageKey, (!isCollapsed).toString());
    if (window.Logger) {
      window.Logger.debug(`💾 Top section state saved to localStorage: ${storageKey} = "${!isCollapsed}"`, { page: "ui-utils" });
    }
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
      
      // Save state via PageStateManager if available
      const isHidden = sectionBody.style.display === 'none';
      if (window.PageStateManager && window.PageStateManager.initialized) {
        // טעינת מצב נוכחי ועדכון
        window.PageStateManager.loadSections(pageName).then(async (sections) => {
          sections[sectionId] = isHidden;
          await window.PageStateManager.saveSections(pageName, sections);
          if (window.Logger) {
            window.Logger.debug(`💾 State saved via PageStateManager: ${sectionId} = "${isHidden}"`, { page: "ui-utils" });
          }
        }).catch(err => {
          // Fallback ל-localStorage
          const storageKey = `${pageName}_${sectionId}_SectionHidden`;
          localStorage.setItem(storageKey, isHidden.toString());
          if (window.Logger) {
            window.Logger.debug(`💾 State saved to localStorage (fallback): ${storageKey} = "${isHidden}"`, { page: "ui-utils" });
          }
        });
      } else {
        // Fallback ל-localStorage רק אם PageStateManager לא זמין
        const storageKey = `${pageName}_${sectionId}_SectionHidden`;
        localStorage.setItem(storageKey, isHidden.toString());
        if (window.Logger) {
          window.Logger.debug(`💾 State saved to localStorage: ${storageKey} = "${isHidden}"`, { page: "ui-utils" });
        }
      }
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
 * UPDATED: Now uses PageStateManager with localStorage fallback
 */
async function loadSectionStates() {
  // if (window.Logger) { window.Logger.debug(`🔧 loadSectionStates called`, { page: "ui-utils" }); }
  
  const pageName = getCurrentPageName();
  // if (window.Logger) { window.Logger.debug(`🔧 loadSectionStates called for page: "${pageName}"`, { page: "ui-utils" }); }
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  // if (window.Logger) { window.Logger.debug(`🔍 Found ${sections.length} sections to load states for`, { page: "ui-utils" }); }
  
  let restoredCount = 0;
  
  // טעינת מצב סקשנים דרך PageStateManager אם זמין
  let sectionsState = {};
  if (window.PageStateManager && window.PageStateManager.initialized) {
    try {
      sectionsState = await window.PageStateManager.loadSections(pageName);
      // if (window.Logger) { window.Logger.debug(`💾 Loaded sections state via PageStateManager for "${pageName}"`, { page: "ui-utils" }); }
    } catch (err) {
      // Fallback ל-localStorage - נטען בהמשך
    }
  }
  
  sections.forEach((section, index) => {
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    
    // בדיקת מצב שמור - קודם מ-PageStateManager, אחר כך fallback ל-localStorage
    let isCollapsed = false;
    if (sectionsState && sectionsState.hasOwnProperty(sectionId)) {
      isCollapsed = sectionsState[sectionId] === true;
    } else {
      // Fallback ל-localStorage
      const storageKey = `${pageName}_${sectionId}_SectionHidden`;
      isCollapsed = localStorage.getItem(storageKey) === 'true';
    }
    
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

// ===== SCRIPT LOADING UTILITIES =====
// Shared helpers for on-demand script loading (used by dashboard lazy flows)

const __uiUtilsScriptRegistry = new Map();

/**
 * Normalize script key for registry comparison.
 * Strips origin and cache-busting query parameters for consistent matching.
 *
 * @param {string} src - Script source path.
 * @returns {string} Normalized path key.
 */
function normalizeScriptKey(src) {
  if (!src) {
    return '';
  }
  try {
    const url = new URL(src, window.location.origin);
    return url.pathname.replace(/^\//, '');
  } catch (_error) {
    return src.replace(window.location.origin, '').split('?')[0].replace(/^\//, '');
  }
}

/**
 * Check if script already exists in DOM.
 * @param {string} normalizedKey - Normalized script key
 * @returns {boolean}
 */
function isScriptInDOM(normalizedKey) {
  return Array.from(document.querySelectorAll('script[src]')).some(scriptEl => {
    const existingKey = normalizeScriptKey(scriptEl.src);
    return existingKey === normalizedKey;
  });
}

/**
 * Load a script tag only once and cache the pending promise.
 *
 * @param {string} src - Script URL (relative or absolute).
 * @param {Object} [options] - Optional configuration.
 * @param {number} [options.timeoutMs=10000] - Timeout in milliseconds.
 * @param {boolean} [options.async=true] - Whether to set the async attribute.
 * @param {Object} [options.attributes] - Additional attributes for the script element.
 * @returns {Promise<void>} Resolves when the script is loaded.
 */
function loadScriptOnce(src, options = {}) {
  if (!src) {
    return Promise.reject(new Error('loadScriptOnce: src is required'));
  }

  const {
    timeoutMs = 10000,
    async = true,
    attributes = {}
  } = options;

  const normalizedKey = normalizeScriptKey(src);

  if (__uiUtilsScriptRegistry.has(normalizedKey)) {
    return __uiUtilsScriptRegistry.get(normalizedKey);
  }

  if (isScriptInDOM(normalizedKey)) {
    return Promise.resolve();
  }

  const scriptPromise = new Promise((resolve, reject) => {
    const scriptElement = document.createElement('script');
    scriptElement.src = src;
    scriptElement.async = async;
    scriptElement.dataset.loader = 'ui-utils/loadScriptOnce';

    Object.entries(attributes).forEach(([attr, value]) => {
      if (typeof value !== 'undefined' && value !== null) {
        scriptElement.setAttribute(attr, value);
      }
    });

    let timeoutHandle = null;
    const clear = () => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    scriptElement.onload = () => {
      clear();
      if (window.Logger?.info) {
        window.Logger.info(`✅ Script loaded: ${src}`, { page: 'ui-utils', loader: 'loadScriptOnce' });
      }
      resolve();
    };

    scriptElement.onerror = (event) => {
      clear();
      __uiUtilsScriptRegistry.delete(normalizedKey);
      const error = new Error(`Failed to load script: ${src}`);
      error.event = event;
      if (window.Logger?.error) {
        window.Logger.error('❌ Script load error', error, { page: 'ui-utils', loader: 'loadScriptOnce' });
      }
      reject(error);
    };

    timeoutHandle = setTimeout(() => {
      __uiUtilsScriptRegistry.delete(normalizedKey);
      if (window.Logger?.error) {
        window.Logger.error(`❌ Script load timeout: ${src}`, { page: 'ui-utils', loader: 'loadScriptOnce', timeoutMs });
      }
      reject(new Error(`Script load timeout: ${src}`));
    }, timeoutMs);

    document.head.appendChild(scriptElement);
  });

  __uiUtilsScriptRegistry.set(normalizedKey, scriptPromise);
  return scriptPromise;
}

/**
 * Load multiple scripts sequentially while preserving the provided order.
 *
 * @param {string[]} sources - Array of script paths.
 * @param {Object} [options] - Options forwarded to each loadScriptOnce call.
 * @returns {Promise<void>} Resolves when all scripts finish loading.
 */
async function loadScriptsOnce(sources, options = {}) {
  if (!Array.isArray(sources)) {
    throw new Error('loadScriptsOnce: sources must be an array');
  }

  for (const source of sources) {
    if (!source) {
      continue;
    }
    await loadScriptOnce(source, options);
  }
}

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
    // Use provided data if available, otherwise try to get from filtered data or TableDataRegistry
    let dataToUse = data;

    // Only use TableDataRegistry if no data was provided
    if (!Array.isArray(dataToUse) || dataToUse.length === 0) {
      // Try filtered data first
      dataToUse = window[`filtered${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Data`] || data;

      // Then try TableDataRegistry
      if (window.TableDataRegistry && (!Array.isArray(dataToUse) || dataToUse.length === 0)) {
        const summary = window.TableDataRegistry.getSummary(pageName);
        if (summary) {
          const registryFiltered = window.TableDataRegistry.getFilteredData(pageName);
          if (Array.isArray(registryFiltered) && registryFiltered.length > 0) {
            dataToUse = registryFiltered;
          }
        } else if (typeof window.TableDataRegistry.resolveTableType === 'function') {
          const resolvedType = window.TableDataRegistry.resolveTableType(pageName);
          if (resolvedType) {
            const registryFiltered = window.TableDataRegistry.getFilteredData(resolvedType);
            if (Array.isArray(registryFiltered) && registryFiltered.length > 0) {
              dataToUse = registryFiltered;
            }
          }
        }

        if (!Array.isArray(dataToUse) || dataToUse.length === 0) {
          const registryFull = window.TableDataRegistry.getFullData(pageName);
          if (Array.isArray(registryFull) && registryFull.length > 0) {
            dataToUse = registryFull;
          }
        }
      }
    }

    const summaryData = Array.isArray(dataToUse) ? dataToUse : [];
    
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      const config = window.INFO_SUMMARY_CONFIGS[pageName];
      if (config) {
        window.InfoSummarySystem.calculateAndRender(summaryData, config);
        
        // עדכון מספר הרשומות בטבלה (אם סופק ID)
        if (countElementId) {
          const countElement = document.getElementById(countElementId);
          if (countElement) {
            countElement.textContent = `${summaryData.length} רשומות`;
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

/**
 * Update table count element with total filtered records (not just current page)
 * Generic function to update count display using TableDataRegistry
 * 
 * @function updateTableCount
 * @param {string|HTMLElement} countElementOrSelector - Element ID, selector, or element itself
 * @param {string} tableType - Table type identifier (e.g., 'trades', 'tickers', 'alerts')
 * @param {string} itemName - Item name for display (e.g., 'טריידים', 'טיקרים', 'התראות')
 * @param {number} [fallbackCount] - Fallback count if TableDataRegistry not available
 * @returns {void}
 * 
 * @example
 * updateTableCount('#tradesCount', 'trades', 'טריידים');
 * updateTableCount('.table-count', 'tickers', 'טיקרים');
 * updateTableCount(document.getElementById('alertsCount'), 'alerts', 'התראות', 0);
 */
function updateTableCount(countElementOrSelector, tableType, itemName, fallbackCount = null) {
  try {
    let countElement = null;
    
    // Resolve element from various input types
    if (typeof countElementOrSelector === 'string') {
      if (countElementOrSelector.startsWith('#')) {
        countElement = document.getElementById(countElementOrSelector.substring(1));
      } else if (countElementOrSelector.startsWith('.')) {
        countElement = document.querySelector(countElementOrSelector);
      } else {
        // Try as ID first, then as selector
        countElement = document.getElementById(countElementOrSelector) || document.querySelector(countElementOrSelector);
      }
    } else if (countElementOrSelector instanceof HTMLElement) {
      countElement = countElementOrSelector;
    }
    
    if (!countElement) {
      window.Logger?.debug('Count element not found', { tableType, selector: countElementOrSelector });
      return;
    }
    
    // Use TableDataRegistry to get total filtered count (not just current page)
    let totalCount = fallbackCount;
    if (window.getTableDataCounts) {
      const counts = window.getTableDataCounts(tableType);
      totalCount = counts.filtered || counts.total || fallbackCount || 0;
    } else if (fallbackCount === null) {
      // If no fallback provided and TableDataRegistry not available, try to get from window variable
      const dataVar = window[`${tableType}Data`] || window[`filtered${tableType.charAt(0).toUpperCase() + tableType.slice(1)}Data`];
      totalCount = Array.isArray(dataVar) ? dataVar.length : 0;
    }
    
    if (totalCount !== null && totalCount !== undefined) {
      countElement.textContent = `${totalCount} ${itemName}`;
    }
  } catch (error) {
    window.Logger?.warn('updateTableCount failed', { tableType, error: error?.message || error });
  }
}

// Export to window for global access
window.updateTableCount = updateTableCount;

function renderUpdatedCell(entity, options = {}) {
  const {
    fields = ['updated_at', 'updatedAt'],
    fallback = 'לא זמין',
    columnClass = 'col-updated',
    format = 'dhm',
    includeSeconds = false
  } = options || {};

  let updatedDate = null;

  if (typeof window.getLatestTimestamp === 'function') {
    updatedDate = window.getLatestTimestamp(entity, fields);
  } else if (typeof window.resolvePropertyPath === 'function') {
    const paths = Array.isArray(fields) ? fields : [fields];
    for (const path of paths) {
      const candidate = window.resolvePropertyPath(entity, path);
      // Use centralized date utils to handle DateEnvelope, datetime objects, and strings
      let dateObj = null;
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        dateObj = window.dateUtils.toDateObject(candidate);
      } else if (candidate instanceof Date) {
        dateObj = candidate;
      } else if (candidate) {
        dateObj = new Date(candidate);
      }
      if (dateObj instanceof Date && !Number.isNaN(dateObj.getTime())) {
        if (!updatedDate || dateObj.getTime() > updatedDate.getTime()) {
          updatedDate = dateObj;
        }
      }
    }
  }

  const epoch = updatedDate instanceof Date && !Number.isNaN(updatedDate.getTime())
    ? updatedDate.getTime()
    : '';

  let displayHtml = fallback;
  if (updatedDate instanceof Date && !Number.isNaN(updatedDate.getTime())) {
    if (typeof window.renderUpdatedTimestamp === 'function') {
      displayHtml = window.renderUpdatedTimestamp(updatedDate, { fallback, format, includeSeconds });
    } else if (typeof window.getDurationSince === 'function') {
      const duration = window.getDurationSince(updatedDate, { format, includeSeconds, fallback });
      const absolute = typeof window.formatDateTime === 'function'
        ? window.formatDateTime(updatedDate)
        : (window.formatDate ? window.formatDate(updatedDate, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(updatedDate, { includeTime: true }) : updatedDate.toLocaleString('he-IL')));
      const titleAttr = absolute ? ` title="${absolute}"` : '';
      displayHtml = `<span class="updated-value" dir="ltr"${titleAttr}>${duration || absolute}</span>`;
    } else {
      const formattedDate = window.formatDate ? window.formatDate(updatedDate, true) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(updatedDate, { includeTime: true }) : updatedDate.toLocaleString('he-IL'));
      displayHtml = `<span class="updated-value" dir="ltr">${formattedDate}</span>`;
    }
  } else {
    displayHtml = `<span class="updated-value-empty">${fallback}</span>`;
  }

  return `<td class="${columnClass}" data-epoch="${epoch}">${displayHtml}</td>`;
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
window.loadScriptOnce = loadScriptOnce;
window.loadScriptsOnce = loadScriptsOnce;
window.renderUpdatedCell = renderUpdatedCell;

// הוסר - המערכת המאוחדת מטפלת באתחול
// Load section states when DOM is ready
// document.addEventListener('DOMContentLoaded', function() {
//   loadSectionStates();
// });
