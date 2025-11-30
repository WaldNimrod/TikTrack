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

  // Update form fields using DataCollectionService if available
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

  // Update form fields using DataCollectionService if available
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
 * Show modal by ID
 *
 * @param {string} modalId - מזהה המודל
 * @param {Object} options - אפשרויות נוספות
 */
// REMOVED: showModal - use window.ModalManagerV2.showModal() for new modals or bootstrap.Modal directly for legacy modals

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
      const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
        ? window.LinkedItemsService.getEntityLabel(itemType) 
        : itemType;
      window.showInfoNotification(`${entityLabel} כבר מבוטל`);
    }
    return;
  }

  // הגדרת הפעולה הנוכחית לביטול
  window.currentAction = 'cancel';

  // בדיקת פריטים מקושרים לפני הביטול
  try {
    // Use relative URL to work with both development (8080) and production (5001)
    const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);

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
            const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
              ? window.LinkedItemsService.getEntityLabel(itemType) 
              : itemType;
            window.showErrorNotification('שגיאה בביטול', `לא ניתן לבטל ${entityLabel} זה - יש פריטים מקושרים אליו`);
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
    // Use relative URL to work with both development (8080) and production (5001)
    let response;
    const entityLabel = (window.LinkedItemsService && window.LinkedItemsService.getEntityLabel) 
      ? window.LinkedItemsService.getEntityLabel(itemType) 
      : itemType;
    const successMessage = `${entityLabel} בוטל בהצלחה!`;

    switch (itemType) {
    case 'trade_plan':
      response = await fetch(`/api/trade-plans/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      break;

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
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
          const modalId = modal.id;
          if (modalId) {
            window.ModalManagerV2.hideModal(modalId);
          }
        } else if (bootstrap?.Modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
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
// REMOVED: showSecondConfirmationModal - use window.showConfirmationDialog from warning-system.js directly

// פונקציה createWarningModal כבר מוגדרת בשורה 1041

// ===== TABLE REFRESH SYSTEM =====

/**
 * מערכת רענון טבלאות גלובלית
 * מטפלת ברענון טבלאות אחרי פעולות CRUD עם שיפורי ביצועים
 */

// REMOVED: enhancedTableRefresh - use window.enhancedTableRefresh from ui-utils.js instead
// The global function provides the same functionality with improved logging

// REMOVED: handleApiResponseWithRefresh - use window.handleApiResponseWithRefresh from ui-utils.js instead
// The global function provides the same functionality with improved error handling

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
    await window.enhancedTableRefresh(loadData, updateActive, operationName);
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
    // Check both inline style and computed style to handle CSS classes like d-flex
    const inlineDisplay = sectionBody.style.display;
    const computedDisplay = window.getComputedStyle(sectionBody).display;
    const isCollapsed = (inlineDisplay === 'none' || computedDisplay === 'none');

    // Check if we're in accordion mode
    const pageName = getCurrentPageName();
    const pageConfig = typeof window.pageInitializationConfigs !== 'undefined' && 
                       window.pageInitializationConfigs[pageName] ? 
                       window.pageInitializationConfigs[pageName] : 
                       (typeof window.PAGE_CONFIGS !== 'undefined' && window.PAGE_CONFIGS[pageName] ? 
                        window.PAGE_CONFIGS[pageName] : null);
    const accordionMode = pageConfig?.accordionMode === true;

    if (isCollapsed) {
      // Opening section
      if (accordionMode) {
        // Close all other sections first
        const allContentSections = document.querySelectorAll('.content-section');
        for (const otherSection of allContentSections) {
          if (otherSection !== section) {
            const otherSectionBody = otherSection.querySelector('.section-body');
            const otherIcon = otherSection.querySelector('.section-toggle-icon');
            if (otherSectionBody && (otherSectionBody.style.display !== 'none')) {
              otherSectionBody.style.display = 'none';
              if (otherIcon) await updateChevronIcon(otherIcon, true);
              // Save state for other sections too using UnifiedCacheManager
              const otherSectionId = otherSection.getAttribute('data-section') || otherSection.id;
              if (otherSectionId) {
                const otherStorageKey = `${pageName}_${otherSectionId}_SectionHidden`;
                if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
                  window.UnifiedCacheManager.save(otherStorageKey, true, {
                    layer: 'localStorage',
                    ttl: null,
                    syncToBackend: false
                  });
                }
              }
            }
          }
        }
      }
      
      // Remove d-flex/d-block classes that might interfere and set display
      sectionBody.classList.remove('d-none', 'd-flex', 'd-block');
      sectionBody.style.display = 'block';
      console.log(`✅ Section "${sectionId}" EXPANDED`);
    } else {
      // Closing section - remove display classes and set to none
      sectionBody.classList.remove('d-flex', 'd-block');
      sectionBody.classList.add('d-none');
      sectionBody.style.display = 'none';
      console.log(`✅ Section "${sectionId}" COLLAPSED`);
    }

    // Update icon - use SVG icons from BUTTON_ICONS
    if (icon) {
      const isCollapsed = sectionBody.style.display === 'none';
      let newIconHTML = '';
      
      if (window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE) {
        const toggleIconPath = window.BUTTON_ICONS.TOGGLE;
        if (toggleIconPath.startsWith('/') || toggleIconPath.startsWith('http')) {
          // Use chevron-down for both states, rotate with CSS when expanded
          const transformStyle = isCollapsed ? '' : ' style="transform: rotate(180deg);"';
          newIconHTML = `<img src="${toggleIconPath}" width="16" height="16" alt="${isCollapsed ? 'הצג' : 'הסתר'}" class="icon"${transformStyle}>`;
        } else {
          newIconHTML = isCollapsed ? '▼' : '▲'; // Fallback
        }
      } else {
        // Fallback to emoji
        newIconHTML = isCollapsed ? '▼' : '▲';
      }
      
      // Check if icon is already an img tag or contains one
      const existingImg = icon.tagName === 'IMG' ? icon : icon.querySelector('img');
      if (existingImg) {
        // Update existing img tag
        if (icon.tagName === 'IMG') {
          icon.src = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE ? window.BUTTON_ICONS.TOGGLE : '';
          icon.style.transform = isCollapsed ? '' : 'rotate(180deg)';
        } else {
          existingImg.src = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE ? window.BUTTON_ICONS.TOGGLE : '';
          existingImg.style.transform = isCollapsed ? '' : 'rotate(180deg)';
        }
      } else {
        // Replace text content with img tag
        icon.innerHTML = newIconHTML;
      }
    }
    
    // Update toggle button tooltip dynamically based on section state
    // CRITICAL: Only update if button does NOT have data-tooltip-static (static tooltips cannot be changed)
    if (toggleBtn && 
        !toggleBtn.hasAttribute('data-tooltip-static') &&
        window.advancedButtonSystem && 
        typeof window.advancedButtonSystem.updateTooltip === 'function') {
      const isCollapsed = sectionBody.style.display === 'none';
      // Try to get section-specific tooltip text, or use default
      const sectionName = section.querySelector('.table-title')?.textContent?.trim() || 
                         section.querySelector('h2')?.textContent?.trim() || 
                         sectionId;
      const tooltipText = isCollapsed 
        ? `הצג ${sectionName}` 
        : `הסתר ${sectionName}`;
      
      window.advancedButtonSystem.updateTooltip(toggleBtn, tooltipText, {
        placement: 'top',
        trigger: 'hover'
      });
    }

    // Save state with page-specific key using Unified Cache Manager
    const isHidden = sectionBody.style.display === 'none';
    const storageKey = `${pageName}_${sectionId}_SectionHidden`;
    
    if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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

    /**
     * Helper function to update chevron icon for expand/collapse
     * @param {HTMLElement} iconElement - The icon element to update
     * @param {boolean} isCollapsed - Whether the section is collapsed
     */
    async function updateChevronIcon(iconElement, isCollapsed) {
        if (!iconElement) return;
        
        // Use IconSystem if available - use 'toggle' which maps to 'chevron-down'
        if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized && iconElement.tagName === 'IMG') {
            try {
                // Use 'toggle' which maps to 'chevron-down' in icon-mappings.js
                const iconHTML = await window.IconSystem.renderIcon('button', 'toggle', {
                    size: iconElement.getAttribute('width') || '16',
                    alt: iconElement.getAttribute('alt') || (isCollapsed ? 'הצג' : 'הסתר'),
                    class: iconElement.getAttribute('class') || 'icon'
                });
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = iconHTML;
                const newIcon = tempDiv.firstElementChild;
                if (newIcon) {
                    // Apply rotation transform for expanded state
                    if (!isCollapsed && newIcon.tagName === 'svg') {
                        newIcon.style.transform = 'rotate(180deg)';
                    } else if (!isCollapsed && newIcon.tagName === 'IMG') {
                        newIcon.style.transform = 'rotate(180deg)';
                    }
                    iconElement.parentNode.replaceChild(newIcon, iconElement);
                }
            } catch (error) {
                // Fallback to direct path - use chevron-down
                const toggleIconPath = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE 
                    ? window.BUTTON_ICONS.TOGGLE 
                    : '/trading-ui/images/icons/tabler/chevron-down.svg';
                iconElement.src = toggleIconPath;
                iconElement.style.transform = isCollapsed ? '' : 'rotate(180deg)';
            }
        } else if (iconElement.tagName === 'IMG') {
            const toggleIconPath = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE 
                ? window.BUTTON_ICONS.TOGGLE 
                : '/trading-ui/images/icons/tabler/chevron-down.svg';
            iconElement.src = toggleIconPath;
            iconElement.style.transform = isCollapsed ? '' : 'rotate(180deg)';
        } else if (iconElement.querySelector('img')) {
            const img = iconElement.querySelector('img');
            const toggleIconPath = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE 
                ? window.BUTTON_ICONS.TOGGLE 
                : '/trading-ui/images/icons/tabler/chevron-down.svg';
            img.src = toggleIconPath;
            img.style.transform = isCollapsed ? '' : 'rotate(180deg)';
        } else {
            // Replace text content with img tag
            const toggleIconPath = window.BUTTON_ICONS && window.BUTTON_ICONS.TOGGLE 
                ? window.BUTTON_ICONS.TOGGLE 
                : '/trading-ui/images/icons/tabler/chevron-down.svg';
            const transformStyle = isCollapsed ? '' : ' style="transform: rotate(180deg);"';
            iconElement.innerHTML = `<img src="${toggleIconPath}" width="16" height="16" alt="${isCollapsed ? 'הצג' : 'הסתר'}" class="icon"${transformStyle}>`;
        }
    }


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
  const defaultState = pageConfig?.sectionsDefaultState || 'open'; // 'closed' | 'open' - backward compatible
  
  if (accordionMode) {
    console.log(`🎯 Accordion mode enabled for page "${pageName}"`);
  }
  
  console.log(`📋 Default state for page "${pageName}": ${defaultState}`);
  
  const sections = document.querySelectorAll('.content-section, .top-section');
  
  let restoredCount = 0;
  
  // For accordion mode, track which section should be open
  let openSectionId = null;
  
  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const sectionId = section.getAttribute('data-section') || section.id || `section-${index}`;
    
    // Skip top section - it stays open always (per user requirements)
    if (section.classList.contains('top-section')) {
      console.log(`⏭️ Skipping top section (always open)`);
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
      let cachedState = null;
      
      if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
        cachedState = await window.UnifiedCacheManager.get(storageKey);
        isHidden = cachedState === true;
        console.log(`💾 Retrieved state from Unified Cache for "${sectionId}" on page "${pageName}": hidden=${isHidden}`);
      } else {
        // UnifiedCacheManager לא זמין - כלל 44 violation prevented
        console.warn(`UnifiedCacheManager לא זמין - משתמש בברירת מחדל (כלל 44 violation prevented) עבור "${sectionId}"`);
      }

      if (accordionMode) {
        // In accordion mode, only one section should be open
        // If no state is saved (null), always closed
        const hasSavedState = cachedState !== null && cachedState !== undefined;
        const shouldBeOpen = hasSavedState && isHidden === false;
        
        console.log(`🔍 ACCORDION DEBUG for "${sectionId}":`, {
          storageKey: storageKey,
          cachedState: cachedState,
          isHidden: isHidden,
          hasSavedState: hasSavedState,
          shouldBeOpen: shouldBeOpen,
          openSectionId: openSectionId,
          bodyDisplayStyle: sectionBody.style.display
        });
        
        // Only modify state if we have a saved preference
        if (hasSavedState) {
          if (shouldBeOpen) {
            // This section should be open
            if (openSectionId) {
              // Already have an open section, close this one
              sectionBody.style.display = 'none';
              if (icon) { await updateChevronIcon(icon, true); }
              console.log(`✅ Section "${sectionId}" closed (accordion mode - another section is open)`);
            } else {
              // This is the first open section
              openSectionId = sectionId;
              sectionBody.style.display = 'block';
              if (icon) { await updateChevronIcon(icon, false); }
              console.log(`✅ Section "${sectionId}" opened (accordion mode)`);
            }
          } else {
            // This section should be closed
            sectionBody.style.display = 'none';
            if (icon) { await updateChevronIcon(icon, true); }
            console.log(`✅ Section "${sectionId}" closed (accordion mode)`);
          }
        } else {
          // No saved state - in accordion mode, always closed
          sectionBody.style.display = 'none';
          if (icon) { await updateChevronIcon(icon, true); }
          console.log(`⏭️ Section "${sectionId}" has no saved state - accordion mode default (closed)`);
        }
      } else {
        // Normal mode - restore each section independently
        const hasSavedStateInNormalMode = cachedState !== null && cachedState !== undefined;
        
        if (hasSavedStateInNormalMode) {
          // Has saved state - restore it
          if (isHidden) {
            // Restore collapsed state
            sectionBody.style.display = 'none';
            if (icon) { await updateChevronIcon(icon, true); }
            console.log(`✅ Section "${sectionId}" RESTORED to COLLAPSED`);
          } else {
            // Restore expanded state
            sectionBody.style.display = 'block';
            if (icon) { await updateChevronIcon(icon, false); }
            console.log(`✅ Section "${sectionId}" RESTORED to EXPANDED`);
          }
        } else {
          // No saved state - apply default state from page config
          // Special case: trade-creation section should be closed by default (lazy loading)
          const shouldBeClosed = sectionId === 'trade-creation';
          const finalState = shouldBeClosed ? 'closed' : defaultState;
          
          if (finalState === 'open') {
            sectionBody.style.display = 'block';
            if (icon) { await updateChevronIcon(icon, false); }
            console.log(`✅ Section "${sectionId}" default state OPEN (no cache)`);
          } else {
            sectionBody.style.display = 'none';
            if (icon) { await updateChevronIcon(icon, true); }
            console.log(`✅ Section "${sectionId}" default state CLOSED (no cache)`);
          }
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
  
  if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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
    if (topIcon) { await updateChevronIcon(topIcon, true); }
    // console.log(`✅ Top section RESTORED to COLLAPSED`);
  } else if (topSection) {
    topSection.classList.remove('collapsed');
    topSection.style.display = 'block';
    if (topIcon) { await updateChevronIcon(topIcon, false); }
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
      
      if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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
        if (icon) { await updateChevronIcon(icon, true); }
        // console.log(`✅ Section "${sectionId}" RESTORED to COLLAPSED`);
        restoredCount++;
      } else if (sectionBody) {
        sectionBody.classList.remove('collapsed');
        section.classList.remove('collapsed');
        sectionBody.style.display = 'block';
        if (icon) { await updateChevronIcon(icon, false); }
        // console.log(`✅ Section "${sectionId}" RESTORED to EXPANDED`);
        restoredCount++;
      }
    }
  }
  
  // console.log(`✅ restoreSectionStates completed - restored ${restoredCount}/${sections.length} sections`);
};

// ===== ACTION BUTTONS SYSTEM =====
// ⚠️ DEPRECATED: This function is deprecated. Use window.createActionsMenu() from actions-menu-system.js instead.
// This function is kept for backward compatibility only and should not be used in new code.

/**
 * Generate action buttons HTML for table rows
 * @deprecated Use window.createActionsMenu() from actions-menu-system.js instead
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
    const buttonIcon = isCancelled ? '✓' : '❌';
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

// REMOVED: viewLinkedItems demo function - use window.viewLinkedItems from linked-items.js directly

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
// REMOVED: window exports - use window.enhancedTableRefresh and window.handleApiResponseWithRefresh from ui-utils.js instead
window.getPageDataFunctions = getPageDataFunctions;
window.autoRefreshCurrentPage = autoRefreshCurrentPage;

// Export account utility functions
// REMOVED: window.showSecondConfirmationModal - use window.showConfirmationDialog directly

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
 * @deprecated Use window.createActionsMenu() directly in table rendering instead
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

    // יצירת הכפתורים באמצעות Actions Menu Toolkit המרכזי
    const buttons = [];
    
    if (finalConfig.showDetails) {
      buttons.push({
        type: 'VIEW',
        onclick: `${finalConfig.detailsFunction}('${entityType}', ${entityId})`,
        title: 'פרטים'
      });
    }
    
    if (finalConfig.showLinked) {
      buttons.push({
        type: 'LINK',
        onclick: `${finalConfig.linkedFunction}('${entityType}', ${entityId})`,
        title: 'אובייקטים מקושרים'
      });
    }
    
    if (finalConfig.showEdit) {
      buttons.push({
        type: 'EDIT',
        onclick: `${finalConfig.editFunction}('${entityType}', ${entityId})`,
        title: 'ערוך'
      });
    }
    
    if (finalConfig.showCancel) {
      const isCancelled = status === 'בוטל' || status === 'סגור';
      buttons.push({
        type: isCancelled ? 'REACTIVATE' : 'CANCEL',
        onclick: `${isCancelled ? finalConfig.restoreFunction : finalConfig.cancelFunction}('${entityType}', ${entityId})`,
        title: isCancelled ? 'שיחזר' : 'בטל'
      });
    }
    
    if (finalConfig.showDelete) {
      buttons.push({
        type: 'DELETE',
        onclick: `${finalConfig.deleteFunction}('${entityType}', ${entityId})`,
        title: 'מחק'
      });
    }
    
    // Use centralized Actions Menu Toolkit
    let buttonsHtml = '';
    if (typeof window.createActionsMenu === 'function') {
      buttonsHtml = window.createActionsMenu(buttons);
    } else {
      // Fallback to deprecated generateActionButtons if createActionsMenu is not available
      console.warn('⚠️ [loadTableActionButtons] window.createActionsMenu not available, using deprecated generateActionButtons');
      buttonsHtml = generateActionButtons(
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
    }

    // בדיקה אם כבר יש כפתורים - למנוע כפילות
    if (actionsCell.querySelector('.actions-menu-wrapper')) {
      console.warn(`⚠️ Actions menu already exists in row ${index}, skipping`);
      return;
    }
    
    actionsCell.innerHTML = buttonsHtml;
  });

}

// Export the new function only if not already defined
if (!window.loadTableActionButtons) {
  window.loadTableActionButtons = loadTableActionButtons;
}

// Export demo functions for testing
window.viewTickerDetails = viewTickerDetails;
// REMOVED: window.viewLinkedItems - use window.viewLinkedItems from linked-items.js directly
window.editTicker = editTicker;
window.cancelTicker = cancelTicker;
window.restoreTicker = restoreTicker;
window.deleteTicker = deleteTicker;

// Initialize modal backdrop and restore section states when DOM is loaded - הוסר כדי למנוע כפילות עם core-systems.js
// האתחול מתבצע דרך מערכת האתחול המאוחדת

// ===== SECTION TOGGLE FUNCTIONS =====
// These functions handle opening/closing sections across all pages

// REMOVED: toggleTopSection - use window.toggleSection(sectionId) from ui-utils.js instead
// The global function handles section toggling with improved state management

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
  
  if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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
      
      if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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

// REMOVED: toggleAllSections - use window.toggleAllSections from ui-utils.js instead
// The global function provides the same functionality

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
    
    if (window.UnifiedCacheManager && (window.UnifiedCacheManager.initialized || window.UnifiedCacheManager.isInitialized?.())) {
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
      if (toggleIcon) await updateChevronIcon(toggleIcon, true);
      restoredCount++;
    }
  }
  
}

// Export functions to global scope
// toggleSection removed - use toggleSection('top') instead
// window.toggleSection export removed - using global version from ui-utils.js
// REMOVED: window.toggleAllSections - use window.toggleAllSections from ui-utils.js instead
window.toggleSectionGlobal = window.toggleSection;
window.toggleAllSectionsGlobal = window.toggleAllSections;
// REMOVED: window.toggleTopSection - use window.toggleSection(sectionId) instead
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

// REMOVED: showFieldError - use window.showFieldError from validation-utils.js instead
// These are validation functions for form fields, NOT notification functions

// REMOVED: showFieldSuccess - use window.showFieldSuccess from validation-utils.js instead
// These are validation functions for form fields, NOT notification functions

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
  input._validationHandler = () => (window.validateField || validateField)(input, rules);

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
        isValid = (window.validateTextField || validateTextField)(input, fieldRules);
        break;

      case 'number':
        isValid = (window.validateNumberField || validateNumberField)(input, fieldRules);
        break;

      case 'date':
        isValid = (window.validateDateField || validateDateField)(input, fieldRules);
        break;

      default:
        if (input.tagName === 'SELECT') {
          isValid = (window.validateSelectField || validateSelectField)(input, fieldRules);
        } else if (input.tagName === 'TEXTAREA') {
          isValid = (window.validateTextField || validateTextField)(input, fieldRules);
        } else {
          isValid = (window.validateField || validateField)(input, fieldRules);
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

// REMOVED: window.showFieldError/window.showFieldSuccess - use window.showFieldError/window.showFieldSuccess from validation-utils.js instead
window.clearFieldError = clearFieldError;
window.clearFieldValidation = clearFieldValidation;
window.clearValidationErrors = clearValidationErrors;

// ייצוא פונקציות ולידציה (רק אם לא מוגדרות כבר ב-validation-utils.js)
if (typeof window.validateForm === 'undefined' && typeof validateForm !== 'undefined') {
  window.validateForm = validateForm;
}
if (typeof window.validateField === 'undefined' && typeof validateField !== 'undefined') {
  window.validateField = validateField;
}
if (typeof window.validateTextField === 'undefined' && typeof validateTextField !== 'undefined') {
  window.validateTextField = validateTextField;
}
if (typeof window.validateNumberField === 'undefined' && typeof validateNumberField !== 'undefined') {
  window.validateNumberField = validateNumberField;
}
if (typeof window.validateEmailField === 'undefined' && typeof validateEmailField !== 'undefined') {
  window.validateEmailField = validateEmailField;
}
if (typeof window.validateDateField === 'undefined' && typeof validateDateField !== 'undefined') {
  window.validateDateField = validateDateField;
}
if (typeof window.validateSelectField === 'undefined' && typeof validateSelectField !== 'undefined') {
  window.validateSelectField = validateSelectField;
}
if (typeof window.setupFieldValidation === 'undefined' && typeof setupFieldValidation !== 'undefined') {
  window.setupFieldValidation = setupFieldValidation;
}

// ייצוא פונקציות ולידציה מותאמות
if (typeof window.validateCurrencySymbol === 'undefined' && typeof validateCurrencySymbol !== 'undefined') {
  window.validateCurrencySymbol = validateCurrencySymbol;
}
if (typeof window.validateCurrencyRate === 'undefined' && typeof validateCurrencyRate !== 'undefined') {
  window.validateCurrencyRate = validateCurrencyRate;
}
if (typeof window.validateTickerSymbol === 'undefined' && typeof validateTickerSymbol !== 'undefined') {
  window.validateTickerSymbol = validateTickerSymbol;
}

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
  // REMOVED: showFieldError, showFieldSuccess - use window.showFieldError/window.showFieldSuccess from validation-utils.js
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


