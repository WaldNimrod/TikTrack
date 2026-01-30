// Minimal UI Utils for debugging
console.log('[ui-utils.js] LOADED: UI utils script loaded successfully');

// DEBUG: Mark that ui-utils.js started loading
window.uiUtilsStarted = true;
// #endregion

// ===== PRICE CALCULATION FUNCTIONS =====
// These functions now use backend business logic API
// Legacy functions maintained for backward compatibility, but delegate to TradesData service

/**
 * Calculate stop price based on percentage
 * @function calculateStopPrice
 * @param {number} currentPrice - Current price of the ticker
 * @param {number} stopPercentage - Stop percentage (e.g., 0.1 for 10%)
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {Promise<number>|number} Calculated stop price (async if TradesData available)
 * 
 * @deprecated Use window.TradesData.calculateStopPrice() directly for async operations
 */
async function calculateStopPrice(currentPrice, stopPercentage, side = 'Long') {
  // Use backend business logic API if available
  if (window.TradesData?.calculateStopPrice) {
    try {
      return await window.TradesData.calculateStopPrice(currentPrice, stopPercentage, side);
    } catch (error) {
      window.Logger?.warn?.('Failed to calculate stop price via API, using fallback', { error: error?.message });
      // Fall back to local calculation for backward compatibility
    }
  }
  
  // Fallback to local calculation (for backward compatibility)
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }

  if (!stopPercentage || stopPercentage <= 0) {
    return 0;
  }

  const percentage = stopPercentage / 100;
  if (side === 'Long') {
    return currentPrice * (1 - percentage);
  } else if (side === 'Short') {
    return currentPrice * (1 + percentage);
  } else {
    return 0;
  }
}

/**
 * Calculate target price based on percentage
 * @param {number} currentPrice - Current price of the ticker
 * @param {number} targetPercentage - Target percentage (e.g., 2000 for 2000%)
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {Promise<number>|number} Calculated target price (async if TradesData available)
 * 
 * @deprecated Use window.TradesData.calculateTargetPrice() directly for async operations
 */
async function calculateTargetPrice(currentPrice, targetPercentage, side = 'Long') {
  // Use backend business logic API if available
  if (window.TradesData?.calculateTargetPrice) {
    try {
      return await window.TradesData.calculateTargetPrice(currentPrice, targetPercentage, side);
    } catch (error) {
      window.Logger?.warn?.('Failed to calculate target price via API, using fallback', { error: error?.message });
      // Fall back to local calculation for backward compatibility
    }
  }
  
  // Fallback to local calculation (for backward compatibility)
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }

  if (!targetPercentage || targetPercentage <= 0) {
    return 0;
  }

  const percentage = targetPercentage / 100;
  if (side === 'Long') {
    return currentPrice * (1 + percentage);
  } else if (side === 'Short') {
    return currentPrice * (1 - percentage);
  } else {
    return 0;
  }
}

/**
 * Calculate percentage from current price to target price
 * @param {number} currentPrice - Current price
 * @param {number} targetPrice - Target price
 * @param {string} side - Trade side ('Long' or 'Short')
 * @returns {Promise<number>|number} Percentage difference (async if TradesData available)
 * 
 * @deprecated Use window.TradesData.calculatePercentageFromPrice() directly for async operations
 */
async function calculatePercentageFromPrice(currentPrice, targetPrice, side = 'Long') {
  // Use backend business logic API if available
  if (window.TradesData?.calculatePercentageFromPrice) {
    try {
      return await window.TradesData.calculatePercentageFromPrice(currentPrice, targetPrice, side);
    } catch (error) {
      window.Logger?.warn?.('Failed to calculate percentage via API, using fallback', { error: error?.message });
      // Fall back to local calculation for backward compatibility
    }
  }
  
  // Fallback to local calculation (for backward compatibility)
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }

  if (!targetPrice || targetPrice <= 0) {
    return 0;
  }

  if (side === 'Long') {
    return (targetPrice - currentPrice) / currentPrice * 100;
  } else if (side === 'Short') {
    return (currentPrice - targetPrice) / currentPrice * 100;
  } else {
    return 0;
  }
}

/**
 * Calculate profit/loss value (general function for all interfaces)
 * @param {number} currentPrice - Current price
 * @param {number} entryPrice - Entry/average price
 * @param {number} quantity - Position quantity (can be negative for short)
 * @returns {number} Profit/loss value (positive for profit, negative for loss)
 * 
 * @example
 * calculateProfitLoss(150.25, 148.00, 100) // Returns: 225 (profit)
 * calculateProfitLoss(150.25, 152.00, 100) // Returns: -175 (loss)
 */
function calculateProfitLoss(currentPrice, entryPrice, quantity) {
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }
  if (!entryPrice || entryPrice <= 0) {
    return 0;
  }
  if (!quantity || quantity === 0) {
    return 0;
  }
  
  // P/L = (currentPrice - entryPrice) * quantity
  // Works for both long (positive quantity) and short (negative quantity)
  return (currentPrice - entryPrice) * quantity;
}

/**
 * Calculate profit/loss percentage (general function for all interfaces)
 * @param {number} currentPrice - Current price
 * @param {number} entryPrice - Entry/average price
 * @returns {number} Profit/loss percentage (positive for profit, negative for loss)
 * 
 * @example
 * calculateProfitLossPercent(150.25, 148.00) // Returns: 1.52 (1.52% profit)
 * calculateProfitLossPercent(150.25, 152.00) // Returns: -1.15 (-1.15% loss)
 */
function calculateProfitLossPercent(currentPrice, entryPrice) {
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }
  if (!entryPrice || entryPrice <= 0) {
    return 0;
  }
  
  // P/L % = ((currentPrice - entryPrice) / entryPrice) * 100
  return ((currentPrice - entryPrice) / entryPrice) * 100;
}

/**
 * Calculate daily change percentage from open price (general function for all interfaces)
 * @param {number} currentPrice - Current price
 * @param {number} openPrice - Opening price (price at start of day)
 * @returns {number} Daily change percentage (positive for gain, negative for loss)
 * 
 * @example
 * calculateDailyChangePercent(150.25, 148.00) // Returns: 1.52 (1.52% gain)
 * calculateDailyChangePercent(150.25, 152.00) // Returns: -1.15 (-1.15% loss)
 */
function calculateDailyChangePercent(currentPrice, openPrice) {
  if (!currentPrice || currentPrice <= 0) {
    return 0;
  }
  if (!openPrice || openPrice <= 0) {
    return 0;
  }
  
  // Daily change % = ((currentPrice - openPrice) / openPrice) * 100
  return ((currentPrice - openPrice) / openPrice) * 100;
}

/**
 * Update stop and target prices in form based on current price and percentages
 * @param {string} formId - ID of the form
 * @param {number} currentPrice - Current price of the ticker
 */
async function updatePricesFromPercentages(formId, currentPrice) {
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

  // Calculate new prices using backend API (with fallback)
  const newStopPrice = await calculateStopPrice(currentPrice, stopPercentage, side);
  const newTargetPrice = await calculateTargetPrice(currentPrice, targetPercentage, side);

  // Update form fields
  // Use DataCollectionService to set values if available
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
    window.DataCollectionService.setValue(stopPriceElement.id, newStopPrice.toFixed(2), 'number');
    window.DataCollectionService.setValue(targetPriceElement.id, newTargetPrice.toFixed(2), 'number');
  } else {
    stopPriceElement.value = newStopPrice.toFixed(2);
    targetPriceElement.value = newTargetPrice.toFixed(2);
  }

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
async function updatePercentagesFromPrices(formId, currentPrice) {
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

  // Calculate new percentages using backend API (with fallback)
  const newStopPercentage = await calculatePercentageFromPrice(currentPrice, stopPrice, side);
  const newTargetPercentage = await calculatePercentageFromPrice(currentPrice, targetPrice, side);

  // Update form fields
  // Use DataCollectionService to set values if available
  if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
    window.DataCollectionService.setValue(stopPercentageElement.id, newStopPercentage.toFixed(2), 'number');
    window.DataCollectionService.setValue(targetPercentageElement.id, newTargetPercentage.toFixed(2), 'number');
  } else {
    stopPercentageElement.value = newStopPercentage.toFixed(2);
    targetPercentageElement.value = newTargetPercentage.toFixed(2);
  }

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
 * Show modal by ID - Uses ModalManagerV2 when available
 * 
 * @deprecated Use window.ModalManagerV2.showModal() directly when possible
 * @param {string} modalId - מזהה המודל
 * @param {Object} options - אפשרויות נוספות (mode, entityData, etc.)
 */
function showModal(modalId, options = {}) {
  // Try to use ModalManagerV2 first
  if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
    const mode = options.mode || 'add';
    const entityData = options.entityData || null;
    window.ModalManagerV2.showModal(modalId, mode, entityData, options).catch(error => {
      window.Logger?.error('Error showing modal via ModalManagerV2', { error, modalId, page: 'ui-utils' });
      // Fallback to bootstrap if ModalManagerV2 fails
      fallbackToBootstrapModal(modalId, options);
    });
    return;
  }

  // Fallback to bootstrap.Modal for backwards compatibility
  fallbackToBootstrapModal(modalId, options);
}

/**
 * Fallback to bootstrap.Modal for backwards compatibility
 * @private
 */
function fallbackToBootstrapModal(modalId, options) {
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
  if (bootstrap && bootstrap.Modal) {
    const bootstrapModal = new bootstrap.Modal(modal, modalOptions);
    bootstrapModal.show();
  } else {
    window.Logger?.error('Bootstrap Modal not available', { modalId, page: 'ui-utils' });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'מערכת המודלים לא זמינה. אנא רענן את הדף.');
    }
  }
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
window.calculateProfitLoss = calculateProfitLoss;
window.calculateProfitLossPercent = calculateProfitLossPercent;
window.calculateDailyChangePercent = calculateDailyChangePercent;
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
  // Financial calculation functions (general - for all interfaces)
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateDailyChangePercent,
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

      const response = await fetch(`/api/linked_items/${itemType}/${itemId}`);
      window.Logger?.info('cancelItem fallback linked_items fetch', {
        itemType,
        itemId,
        ok: response.ok,
        status: response.status,
      });

      if (response.ok) {
        const linkedItemsData = await response.json();
        const childEntities = linkedItemsData.child_entities || [];
        const parentEntities = linkedItemsData.parent_entities || [];

        window.Logger?.info('cancelItem fallback linked_items counts', {
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
    window.Logger?.warn('cancelItem linked_items check failed, proceeding', { itemType, itemId });
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
    if (window.showConfirmationDialog) {
      confirmed = await new Promise((resolve) => {
        window.showConfirmationDialog(
          'ביטול',
          `האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?`,
          () => resolve(true),
          () => resolve(false),
          'warning'
        );
      });
    } else {
      confirmed = window.confirm(`האם אתה בטוח שברצונך לבטל את ${entityLabel} "${displayName}"?`);
    }
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
    // Use relative URL to work with both development (8090) and production (5001)
    let response;
    const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
      ? window.LinkedItemsService.getEntityLabel(itemType) 
      : itemType;
    const successMessage = `${entityLabel} בוטל בהצלחה!`;
    window.Logger?.info('performItemCancellation started', { itemType, itemId });

    switch (itemType) {
    case 'trade_plan': {
      const payload = { cancel_reason: 'בוטל על ידי המשתמש דרך הממשק' };
      response = await fetch(`/api/trade_plans/${itemId}/cancel`, {
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
      response = await fetch(`/api/trading_accounts/${itemId}`, {
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

/**
 * Update page summary statistics - Unified function
 * Calculates and displays page-specific statistics using InfoSummarySystem
 *
 * @param {string} pageName - Name of the page
 * @param {Array} data - Data array to calculate statistics from
 * @param {string} [countElementId] - Optional element ID to update record count
 */
function updatePageSummaryStats(pageName, data, countElementId = null) {
  try {
    // מערכת מאוחדת לסיכום נתונים
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS) {
      // Handle key mapping (e.g., 'ai_analysis' -> 'ai-analysis')
      const pageKeyToConfigKey = {
        'ai_analysis': 'ai-analysis',
        'portfolio_state': 'portfolio-state-page',
        'strategy_analysis': 'strategy-analysis'
      };
      const configKey = pageKeyToConfigKey[pageName] || pageName;
      const config = window.INFO_SUMMARY_CONFIGS[configKey];
      if (config) {
        window.InfoSummarySystem.calculateAndRender(data, config);

        // עדכון מספר הרשומות בטבלה (אם סופק ID)
        if (countElementId) {
          const countElement = document.getElementById(countElementId);
          if (countElement && typeof countElement === 'object' && 'textContent' in countElement) {
            countElement.textContent = `${data.length} רשומות`;
          }
        }
      } else {
        console.warn(`No summary config found for page: ${pageName}`);
      }
    } else {
      // מערכת סיכום נתונים לא זמינה
      const summaryStatsElement = document.getElementById('summaryStats');
      if (summaryStatsElement && typeof summaryStatsElement === 'object' && 'textContent' in summaryStatsElement) {
        summaryStatsElement.textContent = '';
        const errorDiv = document.createElement('div');
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.textContent = '⚠️ מערכת סיכום נתונים לא זמינה - נא לרענן את הדף';
        summaryStatsElement.appendChild(errorDiv);
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

// ===== MOCKUPS STANDARDIZATION HELPERS =====
// Helper functions for mockups standardization and integration with general systems

/**
 * Create cache key for mockup pages
 * @param {string} pageName - Page name (e.g., 'trade_history')
 * @param {string} dataType - Data type (e.g., 'trades', 'accounts')
 * @param {Object} params - Parameters object
 * @returns {string} Cache key
 */
function createCacheKey(pageName, dataType, params = {}) {
    const paramsStr = Object.keys(params).sort().map(k => `${k}:${params[k]}`).join('-');
    return `${pageName}-${dataType}-${paramsStr || 'default'}`;
}

/**
 * Safe API call wrapper with error handling
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} API response
 */
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        const errorMsg = `שגיאה בקריאת API: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
        }
        if (window.Logger) {
            window.Logger.error('API call failed', { url, error });
        }
        throw error;
    }
}

/**
 * Show loading state for a component
 * @param {string} componentId - Component ID
 */
function showLoadingState(componentId) {
    const component = document.getElementById(componentId);
    if (component) {
        component.classList.add('loading');
        if (!component.querySelector('.loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            const spinnerDiv = document.createElement('div');
            spinnerDiv.className = 'spinner-border spinner-border-sm';
            spinnerDiv.setAttribute('role', 'status');
            const span = document.createElement('span');
            span.className = 'visually-hidden';
            span.textContent = 'טוען...';
            spinnerDiv.appendChild(span);
            spinner.appendChild(spinnerDiv);
            component.appendChild(spinner);
        }
    }
}

/**
 * Hide loading state for a component
 * @param {string} componentId - Component ID
 */
function hideLoadingState(componentId) {
    const component = document.getElementById(componentId);
    if (component) {
        component.classList.remove('loading');
        const spinner = component.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

/**
 * Debounce function for delaying function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Create page state manager helper
 * @param {string} pageName - Page name
 * @returns {Object} Page state manager with save/restore methods
 */
function createPageStateManager(pageName) {
    return {
        async save(filters, sections, charts) {
            if (!window.PageStateManager) {
                return;
            }
            const state = { filters, sections, charts };
            await window.PageStateManager.savePageState(pageName, state);
        },
        async restore() {
            if (!window.PageStateManager) {
                return null;
            }
            return await window.PageStateManager.loadPageState(pageName);
        }
    };
}

// Enhanced error handling for Batch D auth/API errors
window.BatchDErrorHandler = {
    /**
     * Handle expected auth/API errors with user-friendly messages
     * @param {Error} error - The error object
     * @param {string} operation - Operation name for logging
     * @param {string} entityName - Entity name for user messages
     */
    handleExpectedError: function(error, operation = 'פעולה', entityName = 'פריט') {
        const isAuthError = error?.message?.includes('401') || error?.message?.includes('Unauthorized') ||
                           error?.message?.includes('403') || error?.message?.includes('Forbidden') ||
                           error?.status === 401 || error?.status === 403;
        const isValidationError = error?.message?.includes('400') || error?.status === 400 ||
                                 error?.message?.includes('Bad Request');

        // #region agent log - Batch D error handling
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'ui-utils.js:BatchDErrorHandler:handleExpectedError',
            message: 'Batch D expected error handling',
            data: {
              timestamp: Date.now(),
              page: window.location.pathname,
              operation: operation,
              entityName: entityName,
              errorType: isAuthError ? 'auth' : isValidationError ? 'validation' : 'other',
              errorMessage: error?.message || error,
              status: error?.status || 'Unknown'
            },
            sessionId: 'batch_d_auth_debug',
            hypothesisId: 'H1_expected_errors'
          })
        }).catch(() => {});
        // #endregion

        if (isAuthError) {
            // Auth errors - show login prompt
            window.Logger?.warn(`⚠️ Auth required for ${operation} on ${entityName}`);
            if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('אימות נדרש',
                    `יש להתחבר למערכת כדי לבצע ${operation} על ${entityName}`);
            }
            return true; // Handled
        }

        if (isValidationError) {
            // Validation errors - show data correction prompt
            window.Logger?.warn(`⚠️ Validation error in ${operation} for ${entityName}`);
            if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification('נתונים לא תקינים',
                    `יש לתקן את הנתונים ולנסות שוב לבצע ${operation}`);
            }
            return true; // Handled
        }

        return false; // Not handled, use default error handling
    },

    /**
     * Check if current page is a Batch D page
     */
    isBatchDPage: function() {
        const path = window.location.pathname;
        return path.includes('cash_flows') ||
               path.includes('system_management') ||
               path.includes('dynamic_colors_display') ||
               path.includes('button_color_mapping') ||
               path.includes('user_management');
    }
};

// Export DataUtils object for page initialization validation
window.DataUtils = {
    test: 'minimal'
};

console.log('[ui-utils.js] DataUtils exported');

// הוסר - המערכת המאוחדת מטפלת באתחול
// Load section states when DOM is ready
// document.addEventListener('DOMContentLoaded', function() {
//   loadSectionStates();
// });
