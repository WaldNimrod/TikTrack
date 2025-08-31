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
        return ((targetPrice - currentPrice) / currentPrice) * 100;
    } else if (side === 'Short') {
        return ((currentPrice - targetPrice) / currentPrice) * 100;
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
    
    console.log('🔄 Updated prices from percentages:', {
        currentPrice,
        side,
        stopPercentage,
        targetPercentage,
        newStopPrice: newStopPrice.toFixed(2),
        newTargetPrice: newTargetPrice.toFixed(2)
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
    
    console.log('🔄 Updated percentages from prices:', {
        currentPrice,
        side,
        stopPrice,
        targetPrice,
        newStopPercentage: newStopPercentage.toFixed(2),
        newTargetPercentage: newTargetPercentage.toFixed(2)
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

// ===== Notification Functions =====

/**
 * מקבל איקון לפי סוג הודעה
 * Get notification icon by type
 * 
 * @param {string} type - סוג ההודעה
 * @returns {string} HTML של האיקון
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        case 'info':
        default:
            return 'ℹ️';
    }
}

/**
 * הצגת הודעה במודל
 * Show notification in modal
 */
function showModalNotification(type, title, message, modalId = 'notificationModal') {
    // Showing notification in modal

    const modal = document.getElementById(modalId);
    if (!modal) {
        handleElementNotFound('showNotificationModal', `Modal ${modalId} not found`);
        return;
    }

    // עדכון תוכן המודל
    const titleElement = modal.querySelector('.modal-title');
    const messageElement = modal.querySelector('.modal-body');
    const iconElement = modal.querySelector('.notification-icon');

    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    // עדכון איקון לפי סוג
    if (iconElement) {
        iconElement.className = `notification-icon ${type}`;
        iconElement.innerHTML = getNotificationIcon(type);
    }

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

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
        focus: true
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

    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    // הגדרת פונקציית האישור
    const confirmBtn = modal.querySelector('.btn-confirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            if (onConfirm) onConfirm();
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

/**
 * הצגת הודעת שגיאה
 * Show error notification
 */
function showErrorNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showErrorNotification) {
        window.notificationSystem.showErrorNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`❌ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת הצלחה
 * Show success notification
 */
function showSuccessNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showSuccessNotification) {
        window.notificationSystem.showSuccessNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`✅ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת מידע
 * Show info notification
 */
function showInfoNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showInfoNotification) {
        window.notificationSystem.showInfoNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`ℹ️ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת אזהרה
 * Show warning notification
 */
function showWarningNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showWarningNotification) {
        window.notificationSystem.showWarningNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`⚠️ ${title}: ${message}`);
    }
}

/**
 * יצירת מיכל התראות אם לא קיים
 * Create toast container if not exists
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// ===== Color Functions =====

/**
 * פונקציה לצביעת סכומים (חיובי/שלילי)
 * Function for coloring amounts (positive/negative)
 */
function colorAmount(amount, displayText = null) {
    const text = displayText || (amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`);
    const className = amount >= 0 ? 'profit-positive' : 'profit-negative';
    return `<span class="${className}">${text}</span>`;
}

// ===== Notification Functions =====

/**
 * הצגת הודעה למשתמש - משתמשת במערכת ההתראות הגלובלית
 * Show notification to user - uses global notification system
 * 
 * @param {string} message - טקסט ההודעה להצגה
 * @param {string} type - סוג ההודעה: 'success' (ירוק), 'error' (אדום), 'warning' (צהוב), 'info' (כחול)
 */
function showNotification(message, type = 'info') {
    // שימוש במערכת ההתראות הגלובלית
    if (typeof window.notificationSystem !== 'undefined' && window.notificationSystem.showNotification) {
        // שימוש במערכת ההתראות הגלובלית - סדר נכון: message, type, title
        window.notificationSystem.showNotification(message, type, 'התראה');
    } else {
        // Fallback להצגת התראה פשוטה
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
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
window.showModalNotification = showModalNotification;
window.showModal = showModal;

window.confirmSecondAction = confirmSecondAction;
window.showErrorNotification = showErrorNotification;
window.showSuccessNotification = showSuccessNotification;
window.showInfoNotification = showInfoNotification;
window.showWarningNotification = showWarningNotification;
window.createToastContainer = createToastContainer;
window.colorAmount = colorAmount;
window.showNotification = showNotification;

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
    showModalNotification,
    confirmSecondAction,
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    showWarningNotification,
    createToastContainer,
    colorAmount,
    showNotification,
    // Price calculation functions
    calculateStopPrice,
    calculateTargetPrice,
    calculatePercentageFromPrice,
    updatePricesFromPercentages,
    updatePercentagesFromPrices,
    formatPercentage,
    formatPrice
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
function showLinkedItemsWarningModal(data, itemType, itemId, onConfirm) {

    // Create modal content
    const modalContent = createLinkedItemsWarningContent(data, itemType, itemId, onConfirm);

    // Create and show modal
    const modalId = 'linkedItemsWarningModal';
    const modalTitle = `⚠️ אזהרה: לא ניתן למחוק ${getItemTypeDisplayName(itemType)} #${itemId}`;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Create new modal with linked-items-modal class
    const modalHtml = `
    <div class="modal fade linked-items-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${modalContent}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
            <button type="button" class="btn btn-danger" onclick="forceDeleteWithLinkedItems('${itemType}', ${itemId}, ${onConfirm})">
              מחק בכל זאת
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

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
function createLinkedItemsWarningContent(data, itemType, itemId, onConfirm) {

    // יצירת כותרת מותאמת לפי סוג האלמנט
    let headerTitle = '';
    let itemName = '';

    switch (itemType) {
        case 'account':
            headerTitle = 'לא ניתן למחוק חשבון:';
            itemName = data.accountName || `חשבון ${itemId}`;
            break;
        case 'trade':
            headerTitle = 'לא ניתן למחוק טרייד:';
            itemName = data.tradeSymbol || `טרייד ${itemId}`;
            break;
        case 'ticker':
            headerTitle = 'לא ניתן למחוק טיקר:';
            itemName = data.tickerSymbol || `טיקר ${itemId}`;
            break;
        case 'alert':
            headerTitle = 'לא ניתן למחוק התראה:';
            itemName = data.alertName || `התראה ${itemId}`;
            break;
        case 'cash_flow':
            headerTitle = 'לא ניתן למחוק תזרים מזומנים:';
            itemName = data.cashFlowName || `תזרים ${itemId}`;
            break;
        case 'note':
            headerTitle = 'לא ניתן למחוק הערה:';
            itemName = data.noteTitle || `הערה ${itemId}`;
            break;
        case 'trade_plan':
            headerTitle = 'לא ניתן למחוק תוכנית טרייד:';
            itemName = data.planName || `תוכנית ${itemId}`;
            break;
        case 'execution':
            headerTitle = 'לא ניתן למחוק ביצוע:';
            itemName = data.executionName || `ביצוע ${itemId}`;
            break;
        default:
            headerTitle = 'לא ניתן למחוק רשומה:';
            itemName = `רשומה ${itemId}`;
    }

    let content = `
    <div class="linked-items-container">
      <div class="alert alert-warning">
        <strong>⚠️ ${headerTitle} <span class="text-danger">${itemName}</span></strong>
        <br>
        ${getItemTypeDisplayName(itemType)} זה מקושר לפריטים הבאים במערכת. יש לטפל בהם תחילה:
      </div>

      <div class="linked-items-section">
        <h6>📋 פריטים מקושרים (${data && data.linkedItems ? data.linkedItems.length : 0})</h6>
        <div class="linked-items-list">
  `;

    // Add linked items list
    if (data && data.linkedItems && data.linkedItems.length > 0) {
        content += createLinkedItemsWarningList(data.linkedItems);
    } else {
        content += `
          <div class="no-linked-items">
            <strong>ℹ️ לא נמצאו אובייקטים מקושרים</strong><br>
            למרות זאת, לא ניתן למחוק ${getItemTypeDisplayName(itemType)} זה.
          </div>
        `;
    }

    content += `
        </div>
      </div>

      <div class="alert alert-info">
        <strong>💡 מה ניתן לעשות:</strong>
        <ul class="mb-0">
          <li>בטל את הקישור לפריטים המקושרים</li>
          <li>מחק את הפריטים המקושרים תחילה</li>
          <li>או בחר "מחק בכל זאת" (זהירות!)</li>
        </ul>
      </div>
    </div>
  `;

    return content;
}

/**
 * Create linked items warning list
 * 
 * Creates a 3-column grid layout for displaying linked items in warning modal.
 * 
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the linked items list
 */
function createLinkedItemsWarningList(linkedItems) {
    if (!linkedItems || linkedItems.length === 0) {
        return '<div class="alert alert-info">אין אובייקטים מקושרים</div>';
    }

    let content = '';
    linkedItems.forEach(item => {
        content += `
        <div class="linked-item-card">
          <div class="linked-item-header">
            <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
            <span class="linked-item-id">#${item.id}</span>
          </div>
          <div class="linked-item-content">
            <div class="linked-item-title">${item.title || item.name || `#${item.id}`}</div>
            <div class="linked-item-details">
              ${createBasicItemInfo(item)}
            </div>
          </div>
          <div class="linked-item-actions">
            <button class="btn btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})">
              <i class="fas fa-eye"></i> צפייה
            </button>
            <button class="btn btn-outline-warning" onclick="unlinkItem('${item.type}', ${item.id})">
              <i class="fas fa-unlink"></i> נתק
            </button>
            <button class="btn btn-outline-info" onclick="openItemPage('${item.type}', ${item.id})">
              <i class="fas fa-cog"></i> עבור לניהול פרטים
            </button>
          </div>
        </div>
      `;
    });
    return content;
}

/**
 * Force delete with linked items
 * 
 * Handles the force deletion when user clicks "מחק בכל זאת"
 * 
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 */
function forceDeleteWithLinkedItems(itemType, itemId, onConfirm) {
    // Close the warning modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('linkedItemsWarningModal'));
    if (modal) {
        modal.hide();
    }

    // Show final confirmation
    if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
            'מחיקה עם פריטים מקושרים',
            `האם אתה בטוח שברצונך למחוק ${getItemTypeDisplayName(itemType)} #${itemId} יחד עם כל האובייקטים המקושרים אליו?`,
            () => {
                if (onConfirm && typeof onConfirm === 'function') {
                    onConfirm();
                }
            }
        );
    } else {
        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'מחיקה עם פריטים מקושרים',
                `האם אתה בטוח שברצונך למחוק ${getItemTypeDisplayName(itemType)} #${itemId} יחד עם כל האובייקטים המקושרים אליו?`,
                () => {
                    if (onConfirm && typeof onConfirm === 'function') {
                        onConfirm();
                    }
                }
            );
        } else {
            if (confirm(`האם אתה בטוח שברצונך למחוק ${getItemTypeDisplayName(itemType)} #${itemId} יחד עם כל האובייקטים המקושרים אליו?`)) {
                if (onConfirm && typeof onConfirm === 'function') {
                    onConfirm();
                }
            }
        }
    }
}

/**
 * Get item type icon
 * 
 * @param {string} itemType - Type of the item
 * @returns {string} Icon HTML
 */
function getItemTypeIcon(itemType) {
    const icons = {
        'account': '<img src="/images/icons/accounts.svg" alt="חשבון" style="width: 16px; height: 16px; vertical-align: middle;">',
        'trade': '<img src="/images/icons/trades.svg" alt="טרייד" style="width: 16px; height: 16px; vertical-align: middle;">',
        'ticker': '<img src="/images/icons/tickers.svg" alt="טיקר" style="width: 16px; height: 16px; vertical-align: middle;">',
        'alert': '<img src="/images/icons/alerts.svg" alt="התראה" style="width: 16px; height: 16px; vertical-align: middle;">',
        'cash_flow': '<img src="/images/icons/cash_flows.svg" alt="תזרים מזומנים" style="width: 16px; height: 16px; vertical-align: middle;">',
        'note': '<img src="/images/icons/notes.svg" alt="הערה" style="width: 16px; height: 16px; vertical-align: middle;">',
        'trade_plan': '<img src="/images/icons/trade_plans.svg" alt="תכנון טרייד" style="width: 16px; height: 16px; vertical-align: middle;">',
        'execution': '<img src="/images/icons/executions.svg" alt="ביצוע" style="width: 16px; height: 16px; vertical-align: middle;">'
    };
    return icons[itemType] || '<img src="/images/icons/home.svg" alt="דף הבית" style="width: 16px; height: 16px; vertical-align: middle;">';
}



/**
 * Global cancel function - unified cancel behavior across all pages
 * 
 * @param {string} itemType - Type of the item ('trade', 'ticker', 'alert', 'account', 'trade_plan', etc.)
 * @param {number} itemId - ID of the item
 * @param {string} itemName - Display name of the item (optional)
 * @param {string} currentStatus - Current status of the item (optional)
 */
async function cancelItem(itemType, itemId, itemName = null, currentStatus = null) {
    console.log(`🔄 Global cancel function called for ${itemType} ${itemId}`);
    
    // בדיקה אם האובייקט כבר מבוטל
    if (currentStatus === 'cancelled') {
        console.log(`⚠️ ${itemType} ${itemId} is already cancelled`);
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification(`${getItemTypeDisplayName(itemType)} כבר מבוטל`);
        }
        return;
    }
    
    // הגדרת הפעולה הנוכחית לביטול
    window.currentAction = 'cancel';
    
    // בדיקת פריטים מקושרים לפני הביטול
    try {
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        const response = await fetch(`${base}/api/v1/linked-items/${itemType}/${itemId}`);
        
        if (response.ok) {
            const linkedItemsData = await response.json();
            const childEntities = linkedItemsData.child_entities || [];
            const parentEntities = linkedItemsData.parent_entities || [];
            const allEntities = [...childEntities, ...parentEntities];

            if (allEntities.length > 0) {
                // יש פריטים מקושרים - הצגת אזהרה
                console.log(`⚠️ Linked items found: ${allEntities.length}`);
                
                if (typeof window.showLinkedItemsModal === 'function') {
                    window.showLinkedItemsModal(allEntities, itemType, itemId);
                } else {
                    handleFunctionNotFound('showLinkedItemsModal', 'פונקציית הצגת פריטים מקושרים לא נמצאה');
                    if (window.showErrorNotification) {
                        window.showErrorNotification(`שגיאה בביטול`, `לא ניתן לבטל ${getItemTypeDisplayName(itemType)} זה - יש פריטים מקושרים אליו`);
                    }
                }
                return;
            }
        }
    } catch (error) {
        console.warn('⚠️ Linked items check failed, proceeding with cancellation');
    }
    
    // אין פריטים מקושרים - ביצוע הביטול
    console.log(`✅ No linked items found, proceeding with cancellation`);
    await performItemCancellation(itemType, itemId, itemName);
}

/**
 * Create unified cancel button for any item type
 * 
 * @param {string} itemType - Type of the item ('trade', 'ticker', 'alert', 'account', 'trade_plan', etc.)
 * @param {number} itemId - ID of the item
 * @param {string} status - Current status of the item
 * @param {string} size - Button size (sm, lg, etc.)
 * @param {boolean} useGlobalCancel - Whether to use the global cancel function (default: false)
 * @returns {string} HTML for cancel button
 */
function createCancelButton(itemType, itemId, status = 'open', size = 'sm', useGlobalCancel = false) {
    const isCancelled = status === 'cancelled';
    const buttonClass = isCancelled ? 'btn-secondary' : 'btn-danger';
    const title = isCancelled ? 'הפעל מחדש' : 'בטל';
    const icon = 'X';
    
    // יצירת onclick בהתאם לסטטוס וסוג האובייקט
    let onclick = '';
    if (itemId) {
        if (isCancelled) {
            // הפעלה מחדש - פונקציות שונות לכל סוג
            switch (itemType) {
                case 'trade_plan':
                    onclick = `onclick="window.reactivateTradePlan(${itemId})"`;
                    break;
                case 'trade':
                    onclick = `onclick="window.reactivateTrade(${itemId})"`;
                    break;
                case 'ticker':
                    onclick = `onclick="window.reactivateTicker(${itemId})"`;
                    break;
                case 'alert':
                    onclick = `onclick="window.reactivateAlert(${itemId})"`;
                    break;
                case 'account':
                    onclick = `onclick="window.reactivateAccount(${itemId})"`;
                    break;
                default:
                    onclick = `onclick="window.reactivate${itemType.charAt(0).toUpperCase() + itemType.slice(1)}(${itemId})"`;
            }
        } else {
            // ביטול - פונקציות שונות לכל סוג
            switch (itemType) {
                case 'trade_plan':
                    onclick = `onclick="window.openCancelTradePlanModal(${itemId})"`;
                    break;
                case 'trade':
                    onclick = `onclick="window.cancelTradeRecord(${itemId})"`;
                    break;
                case 'ticker':
                    onclick = `onclick="window.cancelTicker(${itemId})"`;
                    break;
                case 'alert':
                    onclick = `onclick="window.cancelAlert(${itemId})"`;
                    break;
                case 'account':
                    onclick = `onclick="window.cancelAccount(${itemId})"`;
                    break;
                default:
                    onclick = `onclick="window.cancel${itemType.charAt(0).toUpperCase() + itemType.slice(1)}(${itemId})"`;
            }
        }
    }
    
    return `<button class="btn btn-${size} ${buttonClass}" ${onclick} title="${title}"><span class="cancel-icon">${icon}</span></button>`;
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
        const base = (location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
        let response;
        let successMessage = `${getItemTypeDisplayName(itemType)} בוטל בהצלחה!`;

        switch (itemType) {
            case 'trade_plan':
                response = await fetch(`${base}/api/v1/trade_plans/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                });
                break;
                
            case 'trade':
                response = await fetch(`${base}/api/v1/trades/${itemId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cancel_reason: 'בוטל על ידי המשתמש' })
                });
                break;
                
            case 'ticker':
                response = await fetch(`${base}/api/v1/tickers/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'canceled' })
                });
                break;
                
            case 'alert':
                response = await fetch(`${base}/api/v1/alerts/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                });
                break;
                
            case 'account':
                response = await fetch(`${base}/api/v1/accounts/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                });
                break;
                
            default:
                throw new Error(`לא נתמך ביטול עבור סוג: ${itemType}`);
        }

        if (response.ok) {
            console.log(`✅ ${itemType} ${itemId} cancelled successfully`);
            
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
function getItemTypeDisplayName(itemType) {
    const names = {
        'account': 'חשבון',
        'trade': 'טרייד',
        'ticker': 'טיקר',
        'alert': 'התראה',
        'cash_flow': 'תזרים מזומנים',
        'note': 'הערה',
        'trade_plan': 'תוכנית טרייד',
        'execution': 'ביצוע'
    };
    return names[itemType] || 'אובייקט';
}

/**
 * Create basic item info
 * 
 * @param {Object} item - Item data
 * @returns {string} HTML content
 */
function createBasicItemInfo(item) {
    let info = '';

    if (item.status) {
        const statusClass = item.status === 'open' ? 'text-success' :
            item.status === 'closed' ? 'text-warning' : 'text-danger';
        info += `<div class="item-status ${statusClass}">סטטוס: ${item.status}</div>`;
    }

    if (item.created_at) {
        info += `<div class="item-date">נוצר: ${item.created_at}</div>`;
    }

    if (item.notes) {
        info += `<div class="item-notes">הערות: ${item.notes.substring(0, 50)}${item.notes.length > 50 ? '...' : ''}</div>`;
    }

    return info || '<div class="item-no-info">אין מידע נוסף</div>';
}

// אתחול UI Utils
function initializeUIUtils() {
    // UI Utils loaded successfully
}

// Export functions to global scope
window.uiUtils = {
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    createToastContainer,
    showNotification,
    showLinkedItemsWarningModal,
    createLinkedItemsWarningContent,
    createLinkedItemsWarningList,
    forceDeleteWithLinkedItems,
    showLinkedItemsBlockingModal,
    createLinkedItemsBlockingContent,
    createLinkedItemsDetailedList,
    createDetailedItemInfo,
    getItemTypeIcon,
    getItemTypeDisplayName,
    createBasicItemInfo,
    cancelItem,
    performItemCancellation,
    createCancelButton
};

// Export global cancel functions
window.cancelItem = cancelItem;
window.performItemCancellation = performItemCancellation;
window.createCancelButton = createCancelButton;

// ===== WARNING SYSTEM FUNCTIONS =====

/**
 * Predefined warning types and their configurations
 */
const WARNING_TYPES = {
    // מחיקת פריט
    DELETE: {
        id: 'delete',
        title: 'מחיקת {itemType}',
        message: 'האם אתה בטוח שברצונך למחוק את {itemType} "{itemName}"?',
        icon: 'fas fa-trash-alt',
        theme: 'danger',
        actions: ['cancel', 'delete'],
        defaultAction: 'cancel'
    },

    // פריטים מקושרים
    LINKED_ITEMS: {
        id: 'linked_items',
        title: 'לא ניתן למחוק {itemType}',
        message: '{itemType} זה מקושר ל-{linkedCount} פריטים במערכת. יש לטפל בהם תחילה.',
        icon: 'fas fa-link',
        theme: 'warning',
        actions: ['close', 'force_delete', 'manage_linked'],
        defaultAction: 'close'
    },

    // שגיאת אימות
    VALIDATION: {
        id: 'validation',
        title: 'שגיאת אימות',
        message: 'שדה "{field}": {message}',
        icon: 'fas fa-exclamation-triangle',
        theme: 'warning',
        actions: ['ok'],
        defaultAction: 'ok'
    },

    // אזהרת מערכת
    SYSTEM: {
        id: 'system',
        title: 'אזהרת מערכת',
        message: '{message}',
        icon: 'fas fa-exclamation-circle',
        theme: 'info',
        actions: ['ok'],
        defaultAction: 'ok'
    },

    // אישור פעולה
    CONFIRMATION: {
        id: 'confirmation',
        title: 'אישור פעולה',
        message: '{message}',
        icon: 'fas fa-question-circle',
        theme: 'primary',
        actions: ['cancel', 'confirm'],
        defaultAction: 'cancel'
    }
};

/**
 * Get warning configuration by type
 */
function getWarningConfig(type, data = {}) {
    console.log('🔧 getWarningConfig called with:', { type, data });
    console.log('🔧 Available warning types:', Object.keys(WARNING_TYPES));

    const config = WARNING_TYPES[type.toUpperCase()];
    if (!config) {
        throw new Error(`Unknown warning type: ${type}`);
    }

    const result = {
        ...config,
        title: formatWarningMessage(config.title, data),
        message: formatWarningMessage(config.message, data)
    };

    console.log('🔧 Warning config result:', result);
    return result;
}

/**
 * Format warning message with data
 */
function formatWarningMessage(template, data) {
    console.log('🔧 formatWarningMessage called with:', { template, data });

    const result = template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = data[key] || match;
        console.log(`🔧 Replacing ${match} with ${value}`);
        return value;
    });

    console.log('🔧 Formatted message result:', result);
    return result;
}

/**
 * Validate warning data
 */
function validateWarningData(type, data) {
    if (!type || typeof type !== 'string') {
        throw new Error('Warning type must be a string');
    }

    if (!WARNING_TYPES[type.toUpperCase()]) {
        throw new Error(`Unknown warning type: ${type}`);
    }

    if (data && typeof data !== 'object') {
        throw new Error('Warning data must be an object');
    }
}

/**
 * Get warning theme configuration
 */
function getWarningTheme(theme) {
    const themes = {
        danger: {
            headerClass: 'bg-danger text-white',
            buttonClass: 'btn-danger'
        },
        warning: {
            headerClass: 'bg-warning text-dark',
            buttonClass: 'btn-warning'
        },
        info: {
            headerClass: 'bg-info text-white',
            buttonClass: 'btn-info'
        },
        primary: {
            headerClass: 'bg-primary text-white',
            buttonClass: 'btn-primary'
        }
    };

    return themes[theme] || themes.warning;
}

/**
 * Get warning icon
 */
function getWarningIcon(icon) {
    const icons = {
        'fas fa-trash-alt': '🗑️',
        'fas fa-link': '🔗',
        'fas fa-exclamation-triangle': '⚠️',
        'fas fa-exclamation-circle': '❗',
        'fas fa-question-circle': '❓'
    };

    return icons[icon] || icon;
}

/**
 * Get warning action buttons
 */
function getWarningActions(actions, defaultAction, theme, onConfirm = null, onCancel = null) {
    const actionConfigs = {
        cancel: {
            text: 'ביטול',
            class: 'btn-secondary',
            action: 'cancel'
        },
        ok: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'ok'
        },
        delete: {
            text: 'מחק',
            class: 'btn-danger',
            action: 'delete'
        },
        confirm: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'confirm'
        },
        close: {
            text: 'סגור',
            class: 'btn-secondary',
            action: 'close'
        },
        force_delete: {
            text: 'מחק בכל זאת',
            class: 'btn-danger',
            action: 'force_delete'
        },
        manage_linked: {
            text: 'ניהול מקושרים',
            class: 'btn-info',
            action: 'manage_linked'
        }
    };

    let buttonsHtml = '';

    actions.forEach(actionName => {
        const actionConfig = actionConfigs[actionName];
        if (!actionConfig) return;

        const isDefault = actionName === defaultAction;
        const buttonClass = isDefault ? actionConfig.class : 'btn-outline-secondary';

        buttonsHtml += `
            <button type="button" class="btn ${buttonClass}" 
                    onclick="handleWarningAction('${actionConfig.action}')">
                ${actionConfig.text}
            </button>
        `;
    });

    return buttonsHtml;
}

/**
 * Create warning modal
 */
function createWarningModal(config, options = {}, onConfirm = null, onCancel = null) {
    const modalId = `warningModal_${Date.now()}`;

    console.log('🔧 Creating warning modal with ID:', modalId);
    console.log('🔧 Config:', config);

    // Create simple modal HTML
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="${modalId}Label">
                            🗑️ ${config.title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${config.message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="handleWarningAction('delete')">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Verify modal was created
    const createdModal = document.getElementById(modalId);
    if (!createdModal) {
        throw new Error(`Failed to create modal with ID ${modalId}`);
    }

    console.log('✅ Modal created successfully with ID:', modalId);
    return modalId;
}

/**
 * Show warning modal
 */
function showWarning(type, data = {}, options = {}, onConfirm = null, onCancel = null) {
    try {
        console.log('🔧 showWarning called with:', { type, data, options });

        // Store callbacks globally
        window.warningConfirmCallback = onConfirm;
        window.warningCancelCallback = onCancel;

        // Create simple modal for DELETE type
        if (type === 'DELETE') {
            const modalId = `warningModal_${Date.now()}`;
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';

            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title" id="${modalId}Label">
                                    🗑️ מחיקת ${itemType}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                                <button type="button" class="btn btn-danger" onclick="handleWarningAction('delete')">מחק</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        // Create simple modal for CANCEL type
        else if (type === 'CANCEL') {
            const modalId = `warningModal_${Date.now()}`;
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';

            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-warning text-dark">
                                <h5 class="modal-title" id="${modalId}Label">
                                    ❌ ביטול ${itemType}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                                <button type="button" class="btn btn-warning" onclick="handleWarningAction('delete')">בטל</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if it exists
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                throw new Error(`Modal element with ID ${modalId} not found`);
            }

            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
                throw new Error('Bootstrap Modal is not available');
            }

            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });

            // Show the modal
            modal.show();
            console.log('✅ Modal shown successfully');

            return modalId;
        }

        // For DELETE and CANCEL types, use fallback
        if (type === 'DELETE' || type === 'CANCEL') {
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';
            const action = type === 'DELETE' ? 'למחוק' : 'לבטל';
            if (typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    `${action} ${itemType}`,
                    `האם אתה בטוח שברצונך ${action} את ${itemType} "${itemName}"?`,
                    onConfirm
                );
            } else {
                        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                `${action} ${itemType}`,
                `האם אתה בטוח שברצונך ${action} את ${itemType} "${itemName}"?`,
                onConfirm
            );
        } else {
            const confirmed = confirm(`האם אתה בטוח שברצונך ${action} את ${itemType} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        }
            }
            return;
        }
        
        // For other types, use fallback
        throw new Error(`Unsupported warning type: ${type}`);

    } catch (error) {
        handleSystemError(error, 'showing warning');

        // Fallback to simple confirm
        if (type === 'DELETE') {
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';
            if (typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'מחיקה',
                    `האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?`,
                    onConfirm
                );
            } else {
                        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'מחיקה',
                `האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?`,
                onConfirm
            );
        } else {
            const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        }
            }
        } else if (type === 'CANCEL') {
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';
            if (typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'ביטול',
                    `האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`,
                    onConfirm
                );
            } else {
                        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'ביטול',
                `האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`,
                onConfirm
            );
        } else {
            const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        }
            }
        } else {
            // Fallback to console error
            handleSystemError(new Error(data.message || 'שגיאה לא ידועה'), 'הצגת האזהרה');
        }
    }
}

/**
 * Handle warning action
 */
function handleWarningAction(action) {
    console.log('🔧 Handling warning action:', action);

    // Close modal - find any open modal
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
        const modal = bootstrap.Modal.getInstance(openModal);
        if (modal) {
            modal.hide();
        }
    }

    // Handle action
    switch (action) {
        case 'confirm':
        case 'ok':
        case 'delete':
            if (typeof window.warningConfirmCallback === 'function') {
                console.log('✅ Executing confirm callback');
                window.warningConfirmCallback();
            } else {
                console.log('❌ No confirm callback found');
            }
            break;
        case 'cancel':
        case 'close':
            if (typeof window.warningCancelCallback === 'function') {
                console.log('❌ Executing cancel callback');
                window.warningCancelCallback();
            } else {
                console.log('❌ No cancel callback found');
            }
            break;
        case 'force_delete':
            if (typeof window.warningConfirmCallback === 'function') {
                console.log('✅ Executing force delete callback');
                window.warningConfirmCallback();
            } else {
                console.log('❌ No confirm callback found');
            }
            break;
        case 'manage_linked':
            // Handle linked items management
            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal();
            }
            break;
    }
}



/**
 * Show cancel warning (for tickers)
 */
function showCancelWarning(itemType, itemName, onConfirm = null, onCancel = null) {
    // Fallback mapping for item types
    const itemTypeDisplay = itemType === 'alert' ? 'התראה' :
        itemType === 'ticker' ? 'טיקר' :
            itemType === 'account' ? 'חשבון' :
                itemType === 'trade' ? 'טרייד' :
                    itemType === 'trade_plan' ? 'תוכנית טרייד' :
                        itemType === 'execution' ? 'ביצוע' :
                            itemType === 'cash_flow' ? 'תזרים מזומנים' :
                                itemType === 'note' ? 'הערה' : 'אובייקט';

    console.log('🔧 showCancelWarning called with:', { itemType, itemName, itemTypeDisplay });

    // Try to use the warning system, fallback to notification system
    try {
        return showWarning('CANCEL', {
            itemType: itemTypeDisplay,
            itemName: itemName
        }, {}, onConfirm, onCancel);
    } catch (error) {
        handleSystemError(error, 'showCancelWarning fallback');

        // Fallback to notification system
        if (typeof window.showConfirmationDialog === 'function') {
            const title = `ביטול ${itemTypeDisplay}`;
            const message = `האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`;
            window.showConfirmationDialog(title, message, onConfirm, onCancel);
        } else {
        // Fallback to simple confirm
        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'ביטול',
                `האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`,
                onConfirm
            );
        } else {
            const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        }
        }
    }
}

/**
 * Show linked items warning
 */




/**
 * Show validation warning
 */
function showValidationWarningLegacy(field, message) {
    console.log('🔧 showValidationWarningLegacy called with:', { field, message });

    // Use the global validation warning system from notification-system.js if available
    if (typeof window.notificationSystem !== 'undefined' && window.notificationSystem.showValidationWarning) {
        window.notificationSystem.showValidationWarning(field, message);
    } else if (window.showErrorNotification) {
        // Use our notification system instead of alert
        window.showErrorNotification('שגיאת וולידציה', `${message}`);
    } else {
        // Fallback to console error if notification system is not available
        handleValidationError(field, message);
    }
}

// Export individual functions to global scope
window.showLinkedItemsWarningModal = showLinkedItemsWarningModal;
window.createLinkedItemsWarningContent = createLinkedItemsWarningContent;
window.createLinkedItemsWarningList = createLinkedItemsWarningList;
window.forceDeleteWithLinkedItems = forceDeleteWithLinkedItems;
window.showLinkedItemsBlockingModal = showLinkedItemsBlockingModal;
window.createLinkedItemsBlockingContent = createLinkedItemsBlockingContent;
window.createLinkedItemsDetailedList = createLinkedItemsDetailedList;
window.createDetailedItemInfo = createDetailedItemInfo;
window.getItemTypeIcon = getItemTypeIcon;
window.getItemTypeDisplayName = getItemTypeDisplayName;
window.createBasicItemInfo = createBasicItemInfo;

// Export warning system functions
window.showWarning = showWarning;

window.showCancelWarning = showCancelWarning;


// בדיקת פונקציות בסוף טעינת ui-utils.js
console.log('🔧 ui-utils.js נטען');
console.log('🔧 window.showDeleteWarning קיים:', typeof window.showDeleteWarning === 'function');
console.log('🔧 window.showConfirmationDialog קיים:', typeof window.showConfirmationDialog === 'function');
// Don't export showValidationWarning here - it's already exported from notification-system.js
window.getWarningConfig = getWarningConfig;
window.createWarningModal = createWarningModal;
window.handleWarningAction = handleWarningAction;


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
function showLinkedItemsBlockingModal(data, itemType, itemId, actionType = 'delete') {

    // Create modal content
    const modalContent = createLinkedItemsBlockingContent(data, itemType, itemId, actionType);

    // Create and show modal
    const modalId = 'linkedItemsBlockingModal';
    const actionText = actionType === 'cancel' ? 'ביטול' : 'מחיקה';
    const modalTitle = `⚠️ לא ניתן לבצע ${actionText}: ${getItemTypeDisplayName(itemType)} #${itemId}`;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Create new modal with linked-items-modal class
    const modalHtml = `
    <div class="modal fade linked-items-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${modalContent}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

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
function createLinkedItemsBlockingContent(data, itemType, itemId, actionType) {

    // יצירת כותרת מותאמת לפי סוג האלמנט והפעולה
    let headerTitle = '';
    let itemName = '';
    let actionText = actionType === 'cancel' ? 'ביטול' : 'מחיקה';

    switch (itemType) {
        case 'account':
            headerTitle = `לא ניתן לבצע ${actionText} חשבון:`;
            itemName = data.accountName || `חשבון ${itemId}`;
            break;
        case 'trade':
            headerTitle = `לא ניתן לבצע ${actionText} טרייד:`;
            itemName = data.tradeSymbol || `טרייד ${itemId}`;
            break;
        case 'ticker':
            headerTitle = `לא ניתן לבצע ${actionText} טיקר:`;
            itemName = data.tickerSymbol || `טיקר ${itemId}`;
            break;
        case 'alert':
            headerTitle = `לא ניתן לבצע ${actionText} התראה:`;
            itemName = data.alertName || `התראה ${itemId}`;
            break;
        case 'cash_flow':
            headerTitle = `לא ניתן לבצע ${actionText} תזרים מזומנים:`;
            itemName = data.cashFlowName || `תזרים ${itemId}`;
            break;
        case 'note':
            headerTitle = `לא ניתן לבצע ${actionText} הערה:`;
            itemName = data.noteTitle || `הערה ${itemId}`;
            break;
        case 'trade_plan':
            headerTitle = `לא ניתן לבצע ${actionText} תוכנית טרייד:`;
            itemName = data.planName || `תוכנית ${itemId}`;
            break;
        case 'execution':
            headerTitle = `לא ניתן לבצע ${actionText} ביצוע:`;
            itemName = data.executionName || `ביצוע ${itemId}`;
            break;
        default:
            headerTitle = `לא ניתן לבצע ${actionText} רשומה:`;
            itemName = `רשומה ${itemId}`;
    }

    let content = `
    <div class="linked-items-container">
      <div class="alert alert-danger">
        <strong>🚫 ${headerTitle} <span class="text-danger">${itemName}</span></strong>
        <br>
        ${getItemTypeDisplayName(itemType)} זה מקושר לפריטים הבאים במערכת. יש לטפל בהם תחילה לפני ${actionText}:
      </div>

      <div class="linked-items-section">
        <h6>📋 פריטים מקושרים (${data && data.linkedItems ? data.linkedItems.length : 0})</h6>
        <div class="linked-items-list">
  `;

    // Add linked items list with detailed information
    if (data && data.linkedItems && data.linkedItems.length > 0) {
        content += createLinkedItemsDetailedList(data.linkedItems);
    } else {
        content += `
          <div class="no-linked-items">
            <strong>ℹ️ לא נמצאו אובייקטים מקושרים</strong><br>
            למרות זאת, לא ניתן לבצע ${actionText} ${getItemTypeDisplayName(itemType)} זה.
          </div>
        `;
    }

    content += `
        </div>
      </div>

      <div class="alert alert-info">
        <strong>💡 מה ניתן לעשות:</strong>
        <ul class="mb-0">
          <li>בטל את הקישור לפריטים המקושרים</li>
          <li>מחק את הפריטים המקושרים תחילה</li>
          <li>או פנה למנהל המערכת</li>
        </ul>
      </div>
    </div>
  `;

    return content;
}

/**
 * Create detailed linked items list
 * 
 * Creates a detailed list of linked items with specific fields for each type.
 * 
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the detailed linked items list
 */
function createLinkedItemsDetailedList(linkedItems) {
    if (!linkedItems || linkedItems.length === 0) {
        return '<div class="alert alert-info">אין אובייקטים מקושרים</div>';
    }

    let content = '';

    linkedItems.forEach(item => {
        content += `
        <div class="linked-item-card">
          <div class="linked-item-header">
            <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
            <span class="linked-item-id">#${item.id}</span>
          </div>
          <div class="linked-item-content">
            <div class="linked-item-title">${item.title || item.name || `#${item.id}`}</div>
            <div class="linked-item-details">
              ${createDetailedItemInfo(item)}
            </div>
          </div>
          <div class="linked-item-actions">
            <button class="btn btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})">
              <i class="fas fa-eye"></i> צפייה
            </button>
            <button class="btn btn-outline-warning" onclick="unlinkItem('${item.type}', ${item.id})">
              <i class="fas fa-unlink"></i> נתק
            </button>
          </div>
        </div>
      `;
    });

    return content;
}

/**
 * Create detailed item information
 * 
 * @param {Object} item - Item data
 * @returns {string} HTML content for detailed item info
 */
function createDetailedItemInfo(item) {
    let info = '';

    // Common fields
    if (item.status) {
        const statusClass = item.status === 'open' ? 'text-success' :
            item.status === 'closed' ? 'text-warning' : 'text-danger';
        info += `<div class="item-status ${statusClass}">סטטוס: ${item.status}</div>`;
    }

    if (item.created_at) {
        info += `<div class="item-date">נוצר: ${item.created_at}</div>`;
    }

    // Type-specific fields
    if (item.type === 'execution') {
        if (item.action) info += `<div class="item-action">פעולה: ${item.action}</div>`;
        if (item.quantity) info += `<div class="item-quantity">כמות: ${item.quantity}</div>`;
        if (item.price) info += `<div class="item-price">מחיר: $${item.price}</div>`;
    }

    if (item.type === 'note') {
        if (item.content) {
            const shortContent = item.content.length > 100 ?
                item.content.substring(0, 100) + '...' : item.content;
            info += `<div class="item-content">תוכן: ${shortContent}</div>`;
        }
    }

    if (item.notes) {
        const shortNotes = item.notes.length > 50 ?
            item.notes.substring(0, 50) + '...' : item.notes;
        info += `<div class="item-notes">הערות: ${shortNotes}</div>`;
    }

    return info || '<div class="item-no-info">אין מידע נוסף</div>';
}
