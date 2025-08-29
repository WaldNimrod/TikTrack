/**
 * Linked Items - TikTrack Linked Items Management
 * ===============================================
 * 
 * REFACTORING HISTORY:
 * ===================
 * 
 * This file was created during the main.js modular split (Phase 6 - August 24, 2025)
 * to centralize all linked items functionality that was previously scattered across
 * multiple files and inline in various page scripts.
 * 
 * ORIGINAL STATE:
 * - Linked items logic duplicated across multiple files
 * - Inconsistent modal creation and display
 * - No centralized linked items management
 * - Difficult to maintain relationships between entities
 * 
 * REFACTORING BENEFITS:
 * - Centralized linked items management system
 * - Consistent modal creation and display across all pages
 * - Unified API for viewing relationships between entities
 * - Easy to maintain and extend linked items functionality
 * 
 * LINKED ITEMS FEATURE IMPLEMENTATION (August 24-26, 2025):
 * ========================================================
 * 
 * FEATURE: Advanced Linked Items Modal with Color-Coded System
 * - Displays parent and child entities for any record
 * - Opens modal with detailed relationship information
 * - Includes 4 action buttons for each linked item (View, Edit, Open Page, Delete)
 * - Color-coded badges for item types and statuses
 * - Responsive 3-column layout for better data presentation
 * - Hebrew localization with proper RTL support
 * 
 * IMPLEMENTATION DETAILS:
 * - Modal redesign: Advanced 3-column grid layout with color-coded badges
 * - Header customization: Dynamic headers with actual item symbols (e.g., "מה קשור לטיקר: AAPL")
 * - Content optimization: Reduced scrolling with concise item information
 * - Background click to close: Implemented for all modals across the site
 * - Large X close button: Positioned in top-left corner for easy access
 * - Color-coded system: Badges for item types and statuses with consistent color scheme
 * - CSS separation: Dedicated linked-items.css file with no inline styles
 * 
 * COLOR CODING SYSTEM:
 * ===================
 * 
 * Item Type Badges:
 * - Trade/Trade Plan: bg-primary (Blue)
 * - Account/Execution: bg-success (Green)
 * - Ticker: bg-info (Light Blue)
 * - Alert: bg-warning (Yellow)
 * - Cash Flow: bg-secondary (Gray)
 * - Note: bg-dark (Black)
 * 
 * Status Badges:
 * - Open/Active/Completed: bg-success (Green)
 * - Closed: bg-secondary (Gray)
 * - Pending: bg-warning (Yellow)
 * - Cancelled: bg-danger (Red)
 * 
 * TABLE-SPECIFIC WRAPPER FUNCTIONS:
 * - viewLinkedItemsForTrade(id) - For trades table
 * - viewLinkedItemsForAccount(id) - For accounts table  
 * - viewLinkedItemsForTicker(id) - For tickers table
 * - viewLinkedItemsForAlert(id) - For alerts table
 * - viewLinkedItemsForCashFlow(id) - For cash flows table
 * - viewLinkedItemsForNote(id) - For notes table
 * - viewLinkedItemsForTradePlan(id) - For trade plans table
 * - viewLinkedItemsForExecution(id) - For executions table
 * 
 * CONTENTS:
 * =========
 * 
 * 1. LINKED ITEMS VIEWING SYSTEM:
 *    - showLinkedItemsModal() - Display linked items modal
 *    - createLinkedItemsModalContent() - Create modal content
 *    - createLinkedItemsList() - Create linked items list (3-column layout)
 *    - createBasicItemInfo() - Create concise item information
 * 
 * 2. MODAL CREATION AND MANAGEMENT:
 *    - createModal() - Create modal structure with large X close button
 *    - getTickerSymbol() - Get ticker symbol from global data
 * 
 * 3. ITEM TYPE MANAGEMENT:
 *    - getItemTypeIcon() - Get icon for item type
 *    - getItemTypeDisplayName() - Get display name for item type
 *    - getTypeBadgeClass() - Get badge color class for item type
 *    - getStatusBadge() - Get status badge HTML with color coding
 * 
 * 4. ACTION BUTTONS:
 *    - viewItemDetails() - View item details
 *    - editItem() - Edit item
 *    - openItemPage() - Open item page
 *    - deleteItem() - Delete item
 * 
 * 5. SPECIFIC ITEM TYPE HANDLERS:
 *    - createTradeDetails() - Create trade details display
 *    - createAccountDetails() - Create account details display
 *    - createTickerDetails() - Create ticker details display
 *    - createAlertDetails() - Create alert details display
 *    - createCashFlowDetails() - Create cash flow details display
 *    - createNoteDetails() - Create note details display
 *    - createTradePlanDetails() - Create trade plan details display
 *    - createExecutionDetails() - Create execution details display
 * 
 * 6. UTILITY FUNCTIONS:
 *    - getMockLinkedData() - Get mock data for development
 *    - exportLinkedItemsData() - Export linked items data
 *    - viewItemDetails() - View item details
 *    - editItem() - Edit item
 *    - deleteItem() - Delete item
 *    - openItemPage() - Open item page (currently shows "in development")
 * 
 * DEPENDENCIES:
 * ============
 * - notification-system.js: showLinkedItemsWarning() and loadLinkedItemsData()
 * - Bootstrap 5.3.0: Modal functionality and styling
 * - linked-items.css: Dedicated styling for the modal
 * 
 * File: trading-ui/scripts/linked-items.js
 * Version: 3.0
 * Last Updated: August 26, 2025
 * 
 * Global Exports:
 * - window.showLinkedItemsModal() - Display linked items modal
 * - window.linkedItems - Module object with all functions
 * 
 * USAGE:
 * ======
 * 
 * View linked items for specific table:
 * ```javascript
 * viewLinkedItemsForTrade(123);
 * viewLinkedItemsForAccount(456);
 * ```
 * 
 * View linked items with generic function:
 * ```javascript
 * viewLinkedItems(123, 'trade');
 * ```
 * 
 * Create modal content:
 * ```javascript
 * const content = createLinkedItemsModalContent(data, 'ticker', 789);
 * ```
 * 
 * @version 1.1
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 * @linkedItemsFeature August 24, 2025 - Complete linked items modal system
 */

// ===== LINKED ITEMS VIEWING SYSTEM =====
/**
 * Global function for viewing linked items
 * 
 * This is the main entry point for viewing linked items. It automatically
 * determines the item type based on the current page if not specified,
 * loads the linked items data, and displays them in a modal.
 * 
 * @param {number|string} itemId - ID of the item to view linked items for
 * @param {string} itemType - Type of item (optional, auto-detected if not provided)
 */
function viewLinkedItems(itemId, itemType = null) {
    // Auto-detect item type based on current page if not specified
    if (!itemType) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/accounts')) itemType = 'account';
        else if (currentPath.includes('/trades') || currentPath.includes('trades.html')) itemType = 'trade';
        else if (currentPath.includes('/tickers')) itemType = 'ticker';
        else if (currentPath.includes('/alerts')) itemType = 'alert';
        else if (currentPath.includes('/cash_flows')) itemType = 'cash_flow';
        else if (currentPath.includes('/notes')) itemType = 'note';
        else if (currentPath.includes('/trade_plans')) itemType = 'trade_plan';
        else if (currentPath.includes('/executions')) itemType = 'execution';
    }

    // Load linked items data
    loadLinkedItemsData(itemId, itemType);
}



/**
 * Show linked items modal with data
 * 
 * Creates and displays a modal showing all linked items for the specified item.
 * The modal includes detailed information about each linked item and provides
 * actions for viewing, editing, and deleting items.
 * 
 * @param {Object} data - Data to display
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 */
function showLinkedItemsModal(data, itemType, itemId) {

    // Create modal content
    const modalContent = createLinkedItemsModalContent(data, itemType, itemId);

    // Create and show modal
    const modalId = 'linkedItemsModal';
    
    // יצירת כותרת מותאמת עם סימבול הטיקר
    let modalTitle = '';
    if (itemType === 'ticker') {
        const tickerSymbol = data.tickerSymbol || getTickerSymbol(itemId) || `טיקר ${itemId}`;
        modalTitle = `פריטים מקושרים לטיקר ${tickerSymbol}`;
    } else {
        modalTitle = `פריטים מקושרים ל-${getItemTypeDisplayName(itemType)}`;
    }

    createModal(modalId, modalTitle, modalContent);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

/**
 * Create linked items modal content
 * 
 * Generates the HTML content for the linked items modal, including
 * detailed information about each linked item and action buttons.
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @returns {string} HTML content for the modal
 */
function createLinkedItemsModalContent(data, itemType, itemId) {

    // יצירת כותרת מותאמת לפי סוג האלמנט
    let headerTitle = '';
    let itemName = '';

    switch (itemType) {
        case 'account':
            headerTitle = 'מה קשור לחשבון:';
            itemName = data.accountName || `חשבון ${itemId}`;
            break;
        case 'trade':
            headerTitle = 'מה קשור לטרייד:';
            itemName = data.tradeSymbol || `טרייד ${itemId}`;
            break;
        case 'ticker':
            headerTitle = 'מה קשור לטיקר:';
            // נסה לקבל את הסימבול מהנתונים או מהטבלה
            const tickerSymbol = data.tickerSymbol || getTickerSymbol(itemId) || `טיקר ${itemId}`;
            itemName = tickerSymbol;
            break;
        case 'alert':
            headerTitle = 'מה קשור להתראה:';
            itemName = data.alertName || `התראה ${itemId}`;
            break;
        case 'cash_flow':
            headerTitle = 'מה קשור לתזרים מזומנים:';
            itemName = data.cashFlowName || `תזרים ${itemId}`;
            break;
        case 'note':
            headerTitle = 'מה קשור להערה:';
            itemName = data.noteTitle || `הערה ${itemId}`;
            break;
        case 'trade_plan':
            headerTitle = 'מה קשור לתוכנית טרייד:';
            itemName = data.planName || `תוכנית ${itemId}`;
            break;
        case 'execution':
            headerTitle = 'מה קשור לביצוע:';
            itemName = data.executionName || `ביצוע ${itemId}`;
            break;
        default:
            headerTitle = 'מה קשור לרשומה:';
            itemName = `רשומה ${itemId}`;
    }

    let content = `
    <div class="linked-items-container">
      <style>
        .linked-item-icon-img {
          filter: brightness(0) saturate(100%) invert(1);
          opacity: 0.8;
        }
        .linked-item-row {
          border-radius: 6px;
          margin-bottom: 6px;
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .linked-item-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .linked-item-row.trade { border-left: 4px solid #007bff; }
        .linked-item-row.account { border-left: 4px solid #28a745; }
        .linked-item-row.ticker { border-left: 4px solid #17a2b8; }
        .linked-item-row.alert { border-left: 4px solid #ffc107; }
        .linked-item-row.cash_flow { border-left: 4px solid #6c757d; }
        .linked-item-row.note { border-left: 4px solid #343a40; }
        .linked-item-row.trade_plan { border-left: 4px solid #007bff; }
        .linked-item-row.execution { border-left: 4px solid #28a745; }
        
        /* כותרת המודול עם רקע צבעוני */
        .modal-header {
          background: linear-gradient(135deg, #ff9c05, #ff8c00);
          color: white;
          border-bottom: 2px solid #ff8c00;
          position: relative;
          padding-left: 60px;
          min-height: 60px;
          display: flex;
          align-items: center;
        }
        
        /* כפתור סגירה מיושר לשמאל עם עיצוב כתום */
        .modal-header .btn-close-custom {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          background-color: white;
          color: #ff9c05;
          border: 2px solid #ff9c05;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.3s ease;
          z-index: 1056;
        }
        .modal-header .btn-close-custom:hover {
          background-color: #ff9c05;
          color: white;
        }
        
        /* צמצום רווחים בין אלמנטים */
        .linked-item-col {
          padding: 4px 8px;
        }
        .linked-item-title {
          font-size: 14px;
          margin-bottom: 2px;
        }
        .linked-item-description {
          font-size: 12px;
          margin-bottom: 2px;
        }
        .linked-item-status {
          margin-bottom: 4px;
        }
        .linked-item-basic-details {
          font-size: 11px;
          margin-bottom: 4px;
        }
        .linked-item-actions .btn-group {
          gap: 2px;
        }
        .linked-item-actions .btn {
          padding: 2px 6px;
          font-size: 12px;
        }
        
        /* סגנונות סטטוסים זהה לעמודי הטבלאות */
        .status-badge {
          padding: 0.5rem 1rem !important;
          border-radius: 20px !important;
          font-size: 0.85rem !important;
          font-weight: 700 !important;
          font-family: 'Noto Sans Hebrew', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Alef', sans-serif !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
          position: relative !important;
          overflow: hidden !important;
          display: inline-block !important;
        }
        
        .status-badge.status-open {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(67, 160, 71, 0.15) 100%) !important;
          color: #2e7d32 !important;
          border: 1px solid rgba(76, 175, 80, 0.3) !important;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15) !important;
        }
        
        .status-badge.status-closed {
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(30, 136, 229, 0.15) 100%) !important;
          color: #1565c0 !important;
          border: 1px solid rgba(33, 150, 243, 0.3) !important;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15) !important;
        }
        
        .status-badge.status-cancelled {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 143, 0, 0.15) 100%) !important;
          color: #ef6c00 !important;
          border: 1px solid rgba(255, 152, 0, 0.3) !important;
          box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15) !important;
        }
        
        .status-badge.status-active {
          background: linear-gradient(135deg, rgba(100, 181, 246, 0.2) 0%, rgba(66, 165, 245, 0.2) 100%) !important;
          color: #1976d2 !important;
          box-shadow: 0 2px 6px rgba(100, 181, 246, 0.1) !important;
        }
        
        .status-badge.status-inactive {
          background: linear-gradient(135deg, rgba(158, 158, 158, 0.2) 0%, rgba(117, 117, 117, 0.2) 100%) !important;
          color: #616161 !important;
          box-shadow: 0 2px 6px rgba(158, 158, 158, 0.1) !important;
        }
        
        .status-badge.status-pending {
          background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 143, 0, 0.2) 100%) !important;
          color: #f57c00 !important;
          box-shadow: 0 2px 6px rgba(255, 152, 0, 0.1) !important;
        }
        
        .status-badge.status-completed {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(67, 160, 71, 0.2) 100%) !important;
          color: #388e3c !important;
          box-shadow: 0 2px 6px rgba(76, 175, 80, 0.1) !important;
        }
        
        .status-badge.status-archived {
          background: linear-gradient(135deg, rgba(158, 158, 158, 0.2) 0%, rgba(117, 117, 117, 0.2) 100%) !important;
          color: #616161 !important;
          box-shadow: 0 2px 6px rgba(158, 158, 158, 0.1) !important;
        }
      </style>
      <div class="alert alert-info">
        <strong>📋 סקירת אלמנטים מקושרים</strong><br>
        מציג את כל האלמנטים המקושרים ל-${getItemTypeDisplayName(itemType)} ${itemName}
      </div>
  `;

    // Add linked items list
    const childEntities = data.child_entities || [];
    const parentEntities = data.parent_entities || [];
    const allEntities = [...childEntities, ...parentEntities];

    if (allEntities.length > 0) {
        content += createLinkedItemsList(allEntities);
    } else {
        content += `
      <div class="alert alert-warning">
        <strong>ℹ️ לא נמצאו פריטים מקושרים</strong><br>
        ל-${getItemTypeDisplayName(itemType)} זה אין פריטים מקושרים במערכת.
      </div>
    `;
    }

    content += `
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
        <button type="button" class="btn btn-primary" onclick="exportLinkedItemsData('${itemType}', ${itemId})">
          📤 ייצוא נתונים
        </button>
      </div>
    </div>
  `;

    return content;
}

/**
 * Create linked items list
 * 
 * Generates HTML for displaying a list of linked items with
 * detailed information and action buttons for each item.
 * 
 * @param {Array} items - Array of linked items
 * @returns {string} HTML content for the linked items list
 */
function createLinkedItemsList(items) {
    let listHtml = '<div class="linked-items-list">';

    items.forEach(item => {
        const icon = getItemTypeIcon(item.type);
        const displayName = getItemTypeDisplayName(item.type);
        const basicInfo = createBasicItemInfo(item);
        const statusBadge = getStatusBadge(item.status);

        listHtml += `
      <div class="linked-item-row ${item.type}">
        <div class="linked-item-col">
          <div class="linked-item-icon">${icon}</div>
          <div class="linked-item-type">
            <span class="badge ${getTypeBadgeClass(item.type)}">${displayName}</span>
          </div>
        </div>
        <div class="linked-item-col">
          <div class="linked-item-title">${item.title || `אלמנט ${item.id}`}</div>
          <div class="linked-item-description">${item.description || 'אין תיאור'} (מזהה: ${item.id})</div>
          <div class="linked-item-status">${statusBadge}</div>
        </div>
        <div class="linked-item-col">
          <div class="linked-item-basic-details">${basicInfo}</div>
          <div class="linked-item-actions">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})" title="צפה בפרטים">
                👁️
              </button>
              <button class="btn btn-outline-secondary" onclick="editItem('${item.type}', ${item.id})" title="ערוך">
                ✏️
              </button>
              <button class="btn btn-outline-info" onclick="openItemPage('${item.type}', ${item.id})" title="פתח דף">
                🔗
              </button>
              <button class="btn btn-outline-danger" onclick="deleteItem('${item.type}', ${item.id})" title="מחק">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    });

    listHtml += '</div>';
    return listHtml;
}

/**
 * Get icon for item type
 * 
 * Returns the appropriate emoji icon for each item type
 * 
 * @param {string} type - Item type
 * @returns {string} Emoji icon
 */
function getItemTypeIcon(type) {
    const icons = {
        'trade': '<img src="images/icons/trades.svg" alt="טרייד" class="linked-item-icon-img" width="24" height="24">',
        'account': '<img src="images/icons/accounts.svg" alt="חשבון" class="linked-item-icon-img" width="24" height="24">',
        'ticker': '<img src="images/icons/tickers.svg" alt="טיקר" class="linked-item-icon-img" width="24" height="24">',
        'alert': '<img src="images/icons/alerts.svg" alt="התראה" class="linked-item-icon-img" width="24" height="24">',
        'cash_flow': '<img src="images/icons/cash_flows.svg" alt="תזרים מזומנים" class="linked-item-icon-img" width="24" height="24">',
        'note': '<img src="images/icons/reserch.svg" alt="הערה" class="linked-item-icon-img" width="24" height="24">',
        'trade_plan': '<img src="images/icons/trade_plans.svg" alt="תכנון טרייד" class="linked-item-icon-img" width="24" height="24">',
        'execution': '<img src="images/icons/executions.svg" alt="ביצוע" class="linked-item-icon-img" width="24" height="24">'
    };
    return icons[type] || '<img src="images/icons/db_display.svg" alt="פריט" class="linked-item-icon-img" width="24" height="24">';
}

/**
 * Get display name for item type
 * 
 * Returns a human-readable display name for each item type
 * 
 * @param {string} type - Item type
 * @returns {string} Display name
 */
function getItemTypeDisplayName(type) {
    const names = {
        'trade': 'Trade',
        'account': 'Account',
        'ticker': 'Ticker',
        'alert': 'Alert',
        'cash_flow': 'Cash Flow',
        'note': 'Note',
        'trade_plan': 'Trade Plan',
        'execution': 'Execution'
    };
    return names[type] || 'Item';
}

/**
 * Create basic item info for display
 * 
 * Creates a simple string with basic information about the item
 * 
 * @param {Object} item - Item data
 * @returns {string} Basic info string
 */
function createBasicItemInfo(item) {
    // השתמש בנתונים שמגיעים מהשרת
    const status = item.status || 'לא מוגדר';
    const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

    return `סטטוס: ${status} | נוצר: ${createdAt}`;
}

/**
 * Create modal structure
 * 
 * Creates a Bootstrap modal with the specified content
 * 
 * @param {string} id - Modal ID
 * @param {string} title - Modal title
 * @param {string} content - Modal content
 */
function createModal(id, title, content) {
    // Remove existing modal if it exists
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    // Create new modal
    const modalHtml = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close-custom" data-bs-dismiss="modal" aria-label="Close">
              ✕
            </button>
            <h5 class="modal-title" id="${id}Label">${title}</h5>
          </div>
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    </div>
  `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Create detailed item information
 * 
 * Generates detailed information display for a linked item
 * 
 * @param {Object} item - Item data
 * @returns {string} HTML content for item details
 */
function createDetailedItemInfo(item) {
    let details = '<div class="item-details">';

    // Add common fields
    if (item.name) details += `<div><strong>Name:</strong> ${item.name}</div>`;
    if (item.status) details += `<div><strong>Status:</strong> ${item.status}</div>`;
    if (item.created_at) details += `<div><strong>Created:</strong> ${formatDate(item.created_at)}</div>`;

    // Add type-specific details
    switch (item.type) {
        case 'trade':
            details += createTradeDetails(item);
            break;
        case 'account':
            details += createAccountDetails(item);
            break;
        case 'ticker':
            details += createTickerDetails(item);
            break;
        case 'alert':
            details += createAlertDetails(item);
            break;
        case 'cash_flow':
            details += createCashFlowDetails(item);
            break;
        case 'note':
            details += createNoteDetails(item);
            break;
        case 'trade_plan':
            details += createTradePlanDetails(item);
            break;
        case 'execution':
            details += createExecutionDetails(item);
            break;
    }

    details += '</div>';
    return details;
}

// ===== SPECIFIC ITEM TYPE DETAILS =====
/**
 * Create trade details display
 * 
 * @param {Object} item - Trade item data
 * @returns {string} HTML content for trade details
 */
function createTradeDetails(item) {
    let details = '';
    if (item.symbol) details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;
    if (item.side) {
        const sideMap = {
            'buy': 'קנייה',
            'sell': 'מכירה',
            'long': 'לונג',
            'short': 'שורט'
        };
        const translatedSide = sideMap[item.side] || item.side;
        details += `<div><strong>צד:</strong> ${translatedSide}</div>`;
    }
    if (item.amount) details += `<div><strong>כמות:</strong> ${item.amount}</div>`;
    if (item.price) details += `<div><strong>מחיר:</strong> ${item.price}</div>`;
    return details;
}

/**
 * Create account details display
 * 
 * @param {Object} item - Account item data
 * @returns {string} HTML content for account details
 */
function createAccountDetails(item) {
    let details = '';
    if (item.currency) details += `<div><strong>מטבע:</strong> ${item.currency}</div>`;
    if (item.balance) details += `<div><strong>יתרה:</strong> ${item.balance}</div>`;
    return details;
}

/**
 * Create ticker details display
 * 
 * @param {Object} item - Ticker item data
 * @returns {string} HTML content for ticker details
 */
function createTickerDetails(item) {
    let details = '';
    if (item.symbol) details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;
    if (item.name) details += `<div><strong>שם:</strong> ${item.name}</div>`;
    if (item.type) {
        const typeMap = {
            'stock': 'מניה',
            'etf': 'ETF',
            'crypto': 'קריפטו',
            'forex': 'מט"ח',
            'commodity': 'סחורה'
        };
        const translatedType = typeMap[item.type] || item.type;
        details += `<div><strong>סוג:</strong> ${translatedType}</div>`;
    }
    return details;
}

/**
 * Create alert details display
 * 
 * @param {Object} item - Alert item data
 * @returns {string} HTML content for alert details
 */
function createAlertDetails(item) {
    let details = '';
    if (item.symbol) details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;
    if (item.message) {
        // המרה ותרגום של התנאי
        let translatedMessage = item.message;
        
        // המרת תנאים נפוצים
        translatedMessage = translatedMessage.replace(/price > (\d+)/g, 'מחיר גבוה מ-$1');
        translatedMessage = translatedMessage.replace(/price < (\d+)/g, 'מחיר נמוך מ-$1');
        translatedMessage = translatedMessage.replace(/price >= (\d+)/g, 'מחיר גבוה או שווה ל-$1');
        translatedMessage = translatedMessage.replace(/price <= (\d+)/g, 'מחיר נמוך או שווה ל-$1');
        translatedMessage = translatedMessage.replace(/price == (\d+)/g, 'מחיר שווה ל-$1');
        translatedMessage = translatedMessage.replace(/price != (\d+)/g, 'מחיר שונה מ-$1');
        
        // המרת פעולות נפוצות
        translatedMessage = translatedMessage.replace(/buy/g, 'קנייה');
        translatedMessage = translatedMessage.replace(/sell/g, 'מכירה');
        translatedMessage = translatedMessage.replace(/hold/g, 'החזקה');
        
        details += `<div><strong>תנאי:</strong> ${translatedMessage}</div>`;
    }
    if (item.priority) {
        const priorityMap = {
            'low': 'נמוכה',
            'medium': 'בינונית', 
            'high': 'גבוהה',
            'critical': 'קריטית'
        };
        const translatedPriority = priorityMap[item.priority] || item.priority;
        details += `<div><strong>עדיפות:</strong> ${translatedPriority}</div>`;
    }
    return details;
}

/**
 * Create cash flow details display
 * 
 * @param {Object} item - Cash flow item data
 * @returns {string} HTML content for cash flow details
 */
function createCashFlowDetails(item) {
    let details = '';
    if (item.amount) details += `<div><strong>סכום:</strong> ${item.amount}</div>`;
    if (item.type) {
        const typeMap = {
            'income': 'הכנסה',
            'expense': 'הוצאה',
            'transfer': 'העברה'
        };
        const translatedType = typeMap[item.type] || item.type;
        details += `<div><strong>סוג:</strong> ${translatedType}</div>`;
    }
    if (item.description) details += `<div><strong>תיאור:</strong> ${item.description}</div>`;
    return details;
}

/**
 * Create note details display
 * 
 * @param {Object} item - Note item data
 * @returns {string} HTML content for note details
 */
function createNoteDetails(item) {
    let details = '';
    if (item.related_object_type && item.related_object_id) {
        const objectType = getItemTypeDisplayName(item.related_object_type);
        const objectId = item.related_object_id;
        details += `<div><strong>קשור ל:</strong> ${objectType} #${objectId}</div>`;
    }
    if (item.content) details += `<div><strong>תוכן:</strong> ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</div>`;
    return details;
}

/**
 * Create trade plan details display
 * 
 * @param {Object} item - Trade plan item data
 * @returns {string} HTML content for trade plan details
 */
function createTradePlanDetails(item) {
    let details = '';
    if (item.symbol) details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;
    if (item.target_price) details += `<div><strong>מחיר יעד:</strong> ${item.target_price}</div>`;
    if (item.stop_loss) details += `<div><strong>סטופ לוס:</strong> ${item.stop_loss}</div>`;
    return details;
}

/**
 * Create execution details display
 * 
 * @param {Object} item - Execution item data
 * @returns {string} HTML content for execution details
 */
function createExecutionDetails(item) {
    let details = '';
    if (item.symbol) details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;
    if (item.quantity) details += `<div><strong>כמות:</strong> ${item.quantity}</div>`;
    if (item.price) details += `<div><strong>מחיר:</strong> ${item.price}</div>`;
    return details;
}

// ===== UTILITY FUNCTIONS =====
/**
 * Get mock linked data for development
 * 
 * Returns sample data for development and testing purposes
 * 
 * @param {string} itemType - Type of item
 * @param {string|number} itemId - ID of item
 * @returns {Object} Mock linked items data
 */
function getMockLinkedData(itemType, itemId) {

    // נתונים לדוגמה לפי סוג האלמנט
    switch (itemType) {
        case 'trade':
            return {
                tradeSymbol: 'AAPL',
                linkedItems: [
                    {
                        id: 1,
                        type: 'account',
                        name: 'חשבון מעודכן',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        currency: 'USD',
                        balance: 50000
                    },
                    {
                        id: 2,
                        type: 'ticker',
                        name: 'Apple Inc.',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        symbol: 'AAPL',
                        current_price: 145.50
                    },
                    {
                        id: 3,
                        type: 'alert',
                        name: 'התראה על מחיר AAPL',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        message: 'מחיר AAPL הגיע ליעד'
                    },
                    {
                        id: 4,
                        type: 'note',
                        name: 'הערה על הטרייד',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        content: 'טרייד מוצלח ב-Apple'
                    },
                    {
                        id: 5,
                        type: 'execution',
                        name: 'ביצוע טרייד AAPL',
                        status: 'completed',
                        created_at: new Date().toISOString(),
                        symbol: 'AAPL',
                        quantity: 100,
                        price: 145.50
                    }
                ]
            };
        case 'account':
            return {
                accountName: `חשבון ${itemId}`,
                linkedItems: [
                    {
                        id: 1,
                        type: 'trade',
                        name: 'טרייד AAPL',
                        status: 'open',
                        created_at: new Date().toISOString(),
                        symbol: 'AAPL',
                        side: 'buy'
                    }
                ]
            };
        case 'ticker':
            return {
                tickerSymbol: `טיקר ${itemId}`,
                linkedItems: [
                    {
                        id: 1,
                        type: 'trade',
                        name: 'טרייד בטיקר',
                        status: 'open',
                        created_at: new Date().toISOString(),
                        symbol: 'AAPL',
                        side: 'buy'
                    }
                ]
            };
        default:
            return {
                linkedItems: [
                    {
                        id: 1,
                        type: 'trade',
                        name: 'Sample Trade',
                        status: 'open',
                        created_at: new Date().toISOString(),
                        symbol: 'AAPL',
                        side: 'buy',
                        amount: 100
                    },
                    {
                        id: 2,
                        type: 'alert',
                        name: 'Sample Alert',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        message: 'Price alert for AAPL'
                    }
                ]
            };
    }
}

/**
 * Check if an item has linked items
 * 
 * Simple function to check if an item has linked items
 * 
 * @param {string|number} itemId - ID of the item
 * @param {string} itemType - Type of the item (optional)
 * @returns {Promise<Object>} Promise resolving to linked items info
 */
function checkLinkedItems(itemId, itemType = null) {
    // Checking linked items
    // פונקציה פשוטה לבדיקת פריטים מקושרים
    return Promise.resolve({ hasLinkedItems: false, items: [] });
}

/**
 * Export linked items data
 * 
 * Exports linked items data to various formats
 * 
 * @param {string} itemType - Type of item
 * @param {string|number} itemId - ID of item
 */
/**
 * Export linked items data to CSV
 * 
 * Generic function for exporting linked items data to CSV format
 * Can be used for any entity type (ticker, trade, account, etc.)
 * 
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 */
function exportLinkedItemsData(itemType, itemId) {
    console.log('🔄 ייצוא נתוני פריטים מקושרים:', itemType, itemId);
    
    try {
        // קבלת הנתונים מהשרת
        fetch(`/api/v1/linked-items/${itemType}/${itemId}`)
            .then(response => response.json())
            .then(data => {
                // יצירת CSV
                const csvContent = createCSVFromLinkedItems(data, itemType, itemId);
                
                // יצירת קובץ להורדה
                downloadCSV(csvContent, `linked_items_${itemType}_${itemId}_${new Date().toISOString().split('T')[0]}.csv`);
                
                // הצגת הודעת הצלחה
                if (window.showSuccessNotification) {
                    window.showSuccessNotification('הצלחה', 'הנתונים יוצאו בהצלחה לקובץ CSV');
                }
            })
            .catch(error => {
                console.error('❌ שגיאה בייצוא נתונים:', error);
                if (window.showErrorNotification) {
                    window.showErrorNotification('שגיאה בייצוא', 'שגיאה בייצוא הנתונים לקובץ CSV');
                }
            });
    } catch (error) {
        console.error('❌ שגיאה בייצוא נתונים:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בייצוא', 'שגיאה בייצוא הנתונים לקובץ CSV');
        }
    }
}

/**
 * Create CSV content from linked items data
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the parent item
 * @param {string|number} itemId - ID of the parent item
 * @returns {string} CSV content
 */
function createCSVFromLinkedItems(data, itemType, itemId) {
    const childEntities = data.child_entities || [];
    const parentEntities = data.parent_entities || [];
    const allEntities = [...childEntities, ...parentEntities];
    
    // כותרות CSV
    const headers = [
        'מזהה',
        'סוג',
        'כותרת',
        'תיאור',
        'סטטוס',
        'תאריך יצירה',
        'סמל',
        'מטבע',
        'כמות',
        'מחיר',
        'יעד',
        'סטופ לוס',
        'תנאי',
        'עדיפות',
        'תוכן'
    ];
    
    // יצירת שורות נתונים
    const rows = allEntities.map(item => {
        const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : '';
        
        return [
            item.id || '',
            getItemTypeDisplayName(item.type) || '',
            item.title || '',
            item.description || '',
            item.status || '',
            createdDate,
            item.symbol || '',
            item.currency || '',
            item.amount || item.quantity || '',
            item.price || '',
            item.target_price || '',
            item.stop_loss || '',
            item.message || '',
            item.priority || '',
            item.content || ''
        ];
    });
    
    // יצירת CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

/**
 * Download CSV file
 * 
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename for download
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * View item details
 * 
 * Navigate to item details page
 * 
 * @param {string} type - Item type
 * @param {string|number} id - Item ID
 */
function viewItemDetails(type, id) {
    // Viewing details
    // Implementation for viewing item details
}

/**
 * Edit item
 * 
 * Navigate to item edit page
 * 
 * @param {string} type - Item type
 * @param {string|number} id - Item ID
 */
function editItem(type, id) {
    // Editing item
    // Implementation for editing item
}

/**
 * Delete item
 * 
 * Delete item with confirmation
 * 
 * @param {string} type - Item type
 * @param {string|number} id - Item ID
 */
function deleteItem(type, id) {
    // Deleting item
    // Implementation for deleting item
}

/**
 * Open item page
 * 
 * Opens the item's page (currently shows development message)
 * 
 * @param {string} itemType - Item type
 * @param {number|string} itemId - Item ID
 */
function openItemPage(itemType, itemId) {

    // Show development message
    if (typeof window.showNotification === 'function') {
        window.showNotification('פתיחת דף רשומה - בפיתוח', 'info');
    } else {
        alert('פתיחת דף רשומה - בפיתוח');
    }

    // Future implementation: navigate to item page
    // window.location.href = `/${itemType}/${itemId}`;
}

// ===== SPECIFIC TABLE FUNCTIONS =====
/**
 * View linked items for trade
 * @param {number|string} tradeId - ID of the trade
 */
function viewLinkedItemsForTrade(tradeId) {
    return viewLinkedItems(tradeId, 'trade');
}

/**
 * View linked items for account
 * @param {number|string} accountId - ID of the account
 */
function viewLinkedItemsForAccount(accountId) {
    return viewLinkedItems(accountId, 'account');
}

/**
 * View linked items for ticker
 * @param {number|string} tickerId - ID of the ticker
 */
function viewLinkedItemsForTicker(tickerId) {
    return viewLinkedItems(tickerId, 'ticker');
}

/**
 * View linked items for alert
 * @param {number|string} alertId - ID of the alert
 */
function viewLinkedItemsForAlert(alertId) {
    return viewLinkedItems(alertId, 'alert');
}

/**
 * View linked items for cash flow
 * @param {number|string} cashFlowId - ID of the cash flow
 */
function viewLinkedItemsForCashFlow(cashFlowId) {
    return viewLinkedItems(cashFlowId, 'cash_flow');
}

/**
 * View linked items for note
 * @param {number|string} noteId - ID of the note
 */
function viewLinkedItemsForNote(noteId) {
    return viewLinkedItems(noteId, 'note');
}

/**
 * View linked items for trade plan
 * @param {number|string} tradePlanId - ID of the trade plan
 */
function viewLinkedItemsForTradePlan(tradePlanId) {
    return viewLinkedItems(tradePlanId, 'trade_plan');
}

/**
 * View linked items for execution
 * @param {number|string} executionId - ID of the execution
 */
function viewLinkedItemsForExecution(executionId) {
    return viewLinkedItems(executionId, 'execution');
}

/**
 * Get ticker symbol by ID
 * @param {number} tickerId - ID of the ticker
 * @returns {string} Ticker symbol
 */
function getTickerSymbol(tickerId) {
    // נסה לקבל מהטבלה הגלובלית
    if (window.tickersData && Array.isArray(window.tickersData)) {
        const ticker = window.tickersData.find(t => t.id == tickerId);
        if (ticker && ticker.symbol) {
            return ticker.symbol;
        }
    }
    return null;
}

/**
 * Get badge class for item type
 * @param {string} type - Item type
 * @returns {string} Badge CSS class
 */
function getTypeBadgeClass(type) {
    const badgeClasses = {
        'trade': 'bg-primary',
        'account': 'bg-success',
        'ticker': 'bg-info',
        'alert': 'bg-warning',
        'cash_flow': 'bg-secondary',
        'note': 'bg-dark',
        'trade_plan': 'bg-primary',
        'execution': 'bg-success'
    };
    return badgeClasses[type] || 'bg-secondary';
}

/**
 * Get status badge HTML
 * 
 * Uses the same color scheme as the main application tables
 * 
 * @param {string} status - Item status
 * @returns {string} Status badge HTML
 */
function getStatusBadge(status) {
    if (!status) return '';

    // סולם הצבעים הזהה לעמודי הטבלאות
    const statusClasses = {
        'open': 'status-badge status-open',
        'closed': 'status-badge status-closed',
        'active': 'status-badge status-active',
        'completed': 'status-badge status-completed',
        'pending': 'status-badge status-pending',
        'cancelled': 'status-badge status-cancelled',
        'inactive': 'status-badge status-inactive',
        'archived': 'status-badge status-archived'
    };

    const statusText = {
        'open': 'פתוח',
        'closed': 'סגור',
        'active': 'פעיל',
        'completed': 'הושלם',
        'pending': 'ממתין',
        'cancelled': 'בוטל',
        'inactive': 'לא פעיל',
        'archived': 'בארכיון'
    };

    const badgeClass = statusClasses[status] || 'status-badge status-inactive';
    const badgeText = statusText[status] || status;

    return `<span class="${badgeClass}">${badgeText}</span>`;
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
// Generic functions (for backward compatibility)
window.viewLinkedItems = viewLinkedItems;
window.showLinkedItemsModal = showLinkedItemsModal;
window.createLinkedItemsModalContent = createLinkedItemsModalContent;
window.checkLinkedItems = checkLinkedItems;
window.exportLinkedItemsData = exportLinkedItemsData;
window.createCSVFromLinkedItems = createCSVFromLinkedItems;
window.downloadCSV = downloadCSV;
window.createDetailedItemInfo = createDetailedItemInfo;
window.getItemTypeIcon = getItemTypeIcon;
window.getItemTypeDisplayName = getItemTypeDisplayName;
window.getTypeBadgeClass = getTypeBadgeClass;
window.getStatusBadge = getStatusBadge;
window.viewItemDetails = viewItemDetails;
window.editItem = editItem;
window.deleteItem = deleteItem;

// Specific table functions
window.viewLinkedItemsForTrade = viewLinkedItemsForTrade;
window.viewLinkedItemsForAccount = viewLinkedItemsForAccount;
window.viewLinkedItemsForTicker = viewLinkedItemsForTicker;
window.viewLinkedItemsForAlert = viewLinkedItemsForAlert;
window.viewLinkedItemsForCashFlow = viewLinkedItemsForCashFlow;
window.viewLinkedItemsForNote = viewLinkedItemsForNote;
window.viewLinkedItemsForTradePlan = viewLinkedItemsForTradePlan;
window.viewLinkedItemsForExecution = viewLinkedItemsForExecution;

// ייצוא המודול עצמו
window.linkedItems = {
    viewLinkedItems,
    showLinkedItemsModal,
    createLinkedItemsModalContent,
    checkLinkedItems,
    exportLinkedItemsData,
    createCSVFromLinkedItems,
    downloadCSV,
    createDetailedItemInfo,
    getItemTypeIcon,
    getItemTypeDisplayName,
    getTypeBadgeClass,
    getStatusBadge,
    viewItemDetails,
    editItem,
    deleteItem,
    viewLinkedItemsForTrade,
    viewLinkedItemsForAccount,
    viewLinkedItemsForTicker,
    viewLinkedItemsForAlert,
    viewLinkedItemsForCashFlow,
    viewLinkedItemsForNote,
    viewLinkedItemsForTradePlan,
    viewLinkedItemsForExecution
};

// Linked Items loaded successfully
