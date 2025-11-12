/**
 * Linked Items - TikTrack Linked Items Management
 * ===============================================
 *
 * 🔗 מערכת האובייקטים המקושרים - כוללת גם פילטרים
 * 
 * קשור ל: related-object-filters.js (פילטרים לפי סוג אובייקט מקושר)
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
 *    - createBasicItemInfo() - Create concise item information
 *
 * 2. LINKED ITEMS CHECKING SYSTEM:
 *    - checkLinkedItemsBeforeAction() - Check linked items before cancel/delete action
 *    - checkLinkedItemsAndPerformAction() - Check linked items and perform action if safe
 *
 * 3. MODAL CREATION AND MANAGEMENT:
 *    - createModal() - Create modal structure with large X close button
 *    - getTickerSymbol() - Get ticker symbol from global data
 *
 * 4. ITEM TYPE MANAGEMENT:
 *    - Uses LinkedItemsService.getLinkedItemIcon() directly
 *    - Uses LinkedItemsService.getEntityLabel() directly
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
 *    - exportLinkedItemsData() - Export linked items data
 *
 * DEPENDENCIES:
 * ============
 * - notification-system.js: showLinkedItemsModal() and loadLinkedItemsData()
 * - Bootstrap 5.3.0: Modal functionality and styling
 * - linked-items.css: Dedicated styling for the modal
 *
 * File: trading-ui/scripts/linked-items.js
 * Version: 3.1
 * Last Updated: January 12, 2025
 *
 * Global Exports:
 * - window.showLinkedItemsModal() - Display linked items modal
 * - window.checkLinkedItemsBeforeAction() - Check linked items before action
 * - window.checkLinkedItemsAndPerformAction() - Check and perform action if safe
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
 * Check linked items before cancel/delete:
 * ```javascript
 * const hasLinkedItems = await window.checkLinkedItemsBeforeAction('trade', 123, 'cancel');
 * if (!hasLinkedItems) {
 *   // Safe to proceed with action
 * }
 * ```
 *
 * Check linked items and perform action if safe:
 * ```javascript
 * await window.checkLinkedItemsAndPerformAction('trade', 123, 'cancel', performTradeCancellation);
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
  let detectedItemType = itemType;
  if (!detectedItemType) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/accounts') || currentPath.includes('/trading-accounts')) {detectedItemType = 'trading_account';}
    else if (currentPath.includes('/trades') || currentPath.includes('trades.html')) {detectedItemType = 'trade';}
    else if (currentPath.includes('/tickers')) {detectedItemType = 'ticker';}
    else if (currentPath.includes('/alerts')) {detectedItemType = 'alert';}
    else if (currentPath.includes('/cash_flows')) {detectedItemType = 'cash_flow';}
    else if (currentPath.includes('/notes')) {detectedItemType = 'note';}
    else if (currentPath.includes('/trade_plans')) {detectedItemType = 'trade_plan';}
    else if (currentPath.includes('/executions')) {detectedItemType = 'execution';}
  }

  // Load linked items data and show in view mode
  loadLinkedItemsData(detectedItemType, itemId).then(data => {
    if (data) {
      showLinkedItemsModal(data, detectedItemType, itemId, 'view');
    }
  });
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
function showLinkedItemsModal(data, itemType, itemId, mode = 'view') {

  // Create modal content based on mode
  const modalContent = createLinkedItemsModalContent(data, itemType, itemId, mode);

  // Create and show modal
  const modalId = 'linkedItemsModal';

  // יצירת כותרת מותאמת עם סימבול הטיקר
  let modalTitle = '';
  if (itemType === 'ticker') {
    const tickerSymbol = data.tickerSymbol ||
      (window.getTickerSymbol ? window.getTickerSymbol(itemId) : `טיקר ${itemId}`) ||
      `טיקר ${itemId}`;
    modalTitle = `פריטים מקושרים לטיקר ${tickerSymbol}`;
  } else if (itemType === 'trade_plan') {
    modalTitle = 'פריטים מקושרים לתוכנית השקעה';
  } else if (itemType === 'trading_account') {
    // עבור חשבון מסחר - הוספת שם החשבון מסחר
    const accountName = data.accountName || `חשבון מסחר ${itemId}`;
    modalTitle = `פריטים מקושרים לחשבון מסחר ${accountName}`;
  } else if (itemType === 'account') {
    // DEPRECATED - use trading_account instead!
    const error2 = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
    window.Logger.error('❌ DEPRECATED: account entity type used in showLinkedItemsModal', { itemType, itemId }, { page: "linked-items" });
    console.error(error2);
    throw error2;
  } else {
    modalTitle = `פריטים מקושרים ל-${window.LinkedItemsService.getEntityLabel(itemType)}`;
  }

  // Add mode indicator to title
  if (mode === 'warningBlock') {
    modalTitle += ' - ⚠️ אזהרה';
  } else if (mode === 'view') {
    modalTitle += ' - 👁️ תצוגה';
  }

  createModal(modalId, modalTitle, modalContent, mode);

  // Show the modal
  const modalElement = document.getElementById(modalId);
  
  // הגדרת רקע אזהרה לכותרת המודול במצב warningBlock
  if (mode === 'warningBlock') {
    const headerElement = modalElement.querySelector('.modal-header');
    if (headerElement) {
      headerElement.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
      headerElement.style.color = 'white';
      headerElement.style.borderBottom = '2px solid #c82333';
    }
  }
  
  const modal = new bootstrap.Modal(modalElement);
  
  modalElement.addEventListener('hidden.bs.modal', () => {
    if (!window.ModalNavigationService?.registerModalClose && window.registerModalNavigationClose) {
      window.registerModalNavigationClose(modalElement.id);
    }
  }, { once: true });
  
  modalElement.addEventListener('shown.bs.modal', () => {
    if (window.ModalNavigationService?.registerModalOpen) {
      window.ModalNavigationService.registerModalOpen(modalElement, {
        modalId,
        modalType: 'linked-items-modal',
        entityType: itemType,
        entityId: itemId ?? null,
        title: modalTitle,
        metadata: { mode }
      });
    } else if (window.pushModalToNavigation) {
      window.pushModalToNavigation(modalElement, {
        modalId,
        modalType: 'linked-items-modal',
        entityType: itemType,
        entityId: itemId ?? null,
        title: modalTitle,
        metadata: { mode }
      });
    }

    // Initialize tooltips for filter buttons after modal is shown
    setTimeout(() => {
      if (window.entityDetailsRenderer && window.entityDetailsRenderer._initializeFilterTooltips) {
        const linkedItemsTables = modalElement.querySelectorAll('[id^="linkedItemsTable_"]');
        linkedItemsTables.forEach(table => {
          const tableId = table.id;
          window.entityDetailsRenderer._initializeFilterTooltips(tableId);
        });
      }
      
      // Initialize dynamic buttons (data-onclick attributes)
      if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
        window.ButtonSystem.initializeButtons();
      }
    }, 200);
  }, { once: true });
  
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
function createLinkedItemsModalContent(data, itemType, itemId, mode = 'view') {

  // יצירת כותרת מותאמת לפי סוג האלמנט
  let itemName = '';

  switch (itemType) {
  case 'trading_account':
    itemName = data.accountName || `חשבון מסחר ${itemId}`;
    break;
  case 'account':
    // DEPRECATED - use trading_account instead!
    const error1 = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
    window.Logger.error('❌ DEPRECATED: account entity type used in createLinkedItemsModalContent', { itemType, itemId }, { page: "linked-items" });
    console.error(error1);
    throw error1;
  case 'trade':
    itemName = data.tradeSymbol || `טרייד ${itemId}`;
    break;
  case 'ticker': {
    // נסה לקבל את הסימבול מהנתונים או מהטבלה
    const tickerSymbol = data.tickerSymbol ||
      (window.getTickerSymbol ? window.getTickerSymbol(itemId) : `טיקר ${itemId}`) ||
      `טיקר ${itemId}`;
    itemName = tickerSymbol;
    break;
  }
  case 'alert':
    itemName = data.alertName || `התראה ${itemId}`;
    break;
  case 'cash_flow':
    itemName = data.cashFlowName || `תזרים ${itemId}`;
    break;
  case 'note':
    itemName = data.noteTitle || `הערה ${itemId}`;
    break;
  case 'trade_plan': {
    // נסה לקבל את פרטי התכנון מהנתונים הגלובליים או מהנתונים שהתקבלו
    const planDetails = getTradePlanDetails(itemId, data);
    itemName = planDetails || `תוכנית השקעה ${itemId}`;
    break;
  }
  case 'execution':
    itemName = data.executionName || `ביצוע ${itemId}`;
    break;
  default:
    itemName = `רשומה ${itemId}`;
  }

  let content = `
    <div class="linked-items-container">
      <style>
        /* כותרת המודול עם רקע צבעוני לפי mode */
        .modal-header {
          background: linear-gradient(135deg, ${mode === 'warningBlock' ? (window.getTableColors ? window.getTableColors().negative : '#dc3545') + ', #c82333' : (window.getTableColors ? window.getTableColors().positive : '#28a745') + ', #20c997'});
          color: white;
          border-bottom: 2px solid ${mode === 'warningBlock' ? '#c82333' : '#20c997'};
          position: relative;
          padding-left: 60px;
          min-height: 60px;
          display: flex;
          align-items: center;
        }
        
        /* כפתור סגירה מיושר לשמאל עם עיצוב מתאים */
        .modal-header .btn-close-custom {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          background-color: white;
          color: ${mode === 'warningBlock' ? window.getTableColors ? window.getTableColors().negative : '#dc3545' : window.getTableColors ? window.getTableColors().positive : '#28a745'};
          border: 2px solid ${mode === 'warningBlock' ? window.getTableColors ? window.getTableColors().negative : '#dc3545' : window.getTableColors ? window.getTableColors().positive : '#28a745'};
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.3s ease;
          z-index: 1056;
        }
        .modal-header .btn-close-custom:hover {
          background-color: ${mode === 'warningBlock' ? window.getTableColors ? window.getTableColors().negative : '#dc3545' : window.getTableColors ? window.getTableColors().positive : '#28a745'};
          color: white;
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
  `;

  // Get linked items data
  const childEntities = data.child_entities || [];
  const parentEntities = data.parent_entities || [];
  
  // Determine which entities to show based on mode
  const entitiesToShow = mode === 'warningBlock' ? childEntities : [...parentEntities, ...childEntities];
  
  // Get entity color for the table
  const entityColor = (window.getEntityColor && typeof window.getEntityColor === 'function')
    ? window.getEntityColor(itemType)
    : '#019193';
  
  // Use EntityDetailsRenderer to render linked items as table (same as in entity details modal)
  if (window.entityDetailsRenderer && typeof window.entityDetailsRenderer.renderLinkedItems === 'function') {
    // Create sourceInfo for linked items modal
    const sourceInfo = {
      sourceModal: 'linked-items',
      sourceType: itemType,
      sourceId: itemId
    };
    
    if (entitiesToShow.length > 0) {
      content += window.entityDetailsRenderer.renderLinkedItems(entitiesToShow, entityColor, itemType, itemId, sourceInfo, {});
    } else {
      // No linked items - show empty message
      content += `
        <div class="alert alert-warning">
          <strong>ℹ️ לא נמצאו פריטים מקושרים</strong><br>
          ל-${window.LinkedItemsService.getEntityLabel(itemType)} זה אין פריטים מקושרים במערכת.
        </div>
      `;
    }
  } else {
    // Fallback if EntityDetailsRenderer not available
    if (entitiesToShow.length > 0) {
      content += `
        <div class="alert alert-warning">
          <strong>⚠️ מערכת רינדור לא זמינה</strong><br>
          נא לרענן את הדף.
        </div>
      `;
    } else {
      content += `
        <div class="alert alert-warning">
          <strong>ℹ️ לא נמצאו פריטים מקושרים</strong><br>
          ל-${window.LinkedItemsService.getEntityLabel(itemType)} זה אין פריטים מקושרים במערכת.
        </div>
      `;
    }
  }

  content += `
      <div class="modal-footer">
        <button data-button-type="CLOSE" data-attributes="data-bs-dismiss='modal' type='button'"></button>
        <button type="button" class="btn" onclick="exportLinkedItemsData('${itemType}', ${itemId})">
          📤 ייצוא נתונים
        </button>
      </div>
    </div>
  `;

  return content;
}


/**
 * Get rules explanation for linked items modal
 *
 * Returns explanation of cancellation/deletion rules based on item type
 *
 * @param {string} itemType - Type of the item
 * @param {Object} data - Linked items data
 * @returns {string} Rules explanation
 */
function getRulesExplanation(itemType, data) {
  const childEntities = data.child_entities || [];
  const parentEntities = data.parent_entities || [];
  const allEntities = [...childEntities, ...parentEntities];

  if (allEntities.length === 0) {
    return null; // אין פריטים מקושרים
  }

  // הצגת כל הפריטים המקושרים בהסבר
  let explanation = `יש ${allEntities.length} פריט(ים) מקושר(ים):`;

  // סיווג הפריטים לפי סוג
  const trades = allEntities.filter(entity => entity.type === 'trade');
  const plans = allEntities.filter(entity => entity.type === 'trade_plan');
  const notes = allEntities.filter(entity => entity.type === 'note');
  const alerts = allEntities.filter(entity => entity.type === 'alert');
  const executions = allEntities.filter(entity => entity.type === 'execution');
  const accounts = allEntities.filter(entity => entity.type === 'account' || entity.type === 'trading_account');

  if (trades.length > 0) {
    const openTrades = trades.filter(t => t.status === 'open');
    const closedTrades = trades.filter(t => t.status === 'closed');
    explanation += `<br>• ${trades.length} טרייד(ים) (${openTrades.length} פעיל, ${closedTrades.length} סגור)`;
  }
  if (plans.length > 0) {
    const openPlans = plans.filter(p => p.status === 'open');
    const closedPlans = plans.filter(p => p.status === 'closed');
    explanation += `<br>• ${plans.length} תכנון(ים) (${openPlans.length} פעיל, ${closedPlans.length} סגור)`;
  }
  if (notes.length > 0) {
    explanation += `<br>• ${notes.length} הערה(ות)`;
  }
  if (alerts.length > 0) {
    explanation += `<br>• ${alerts.length} התראה(ות)`;
  }
  if (executions.length > 0) {
    explanation += `<br>• ${executions.length} ביצוע(ים)`;
  }
  if (accounts.length > 0) {
    explanation += `<br>• ${accounts.length} חשבון מסחר(ות)`;
  }

  explanation += '<br><br><strong>כללי ביטול:</strong><br>';

  // הוספת כללים ספציפיים לפי סוג האלמנט

  switch (itemType) {
  case 'trade_plan': {
    const activeTrades = childEntities.filter(entity => entity.type === 'trade' && entity.status === 'open');
    const closedTrades = childEntities.filter(entity => entity.type === 'trade' && entity.status === 'closed');
    // const linkedNotes = childEntities.filter(entity => entity.type === 'note'); // לא בשימוש
    // const linkedAlerts = childEntities.filter(entity => entity.type === 'alert'); // לא בשימוש
    // const linkedExecutions = childEntities.filter(entity => entity.type === 'execution'); // לא בשימוש

    // בדיקה אם זה מחיקה או ביטול לפי הקונטקסט
    const isDeletion = window.currentAction === 'delete';

    if (isDeletion) {
      // למחיקה - לא ניתן למחוק אם יש כל פריט מקושר
      let explanation = 'לא ניתן למחוק תכנון זה כי יש פריטים מקושרים:';
      if (activeTrades.length > 0) {
        explanation += `<br>• ${activeTrades.length} טרייד(ים) פעיל(ים) - יש לבטל אותם קודם`;
      }
      if (closedTrades.length > 0) {
        explanation += `<br>• ${closedTrades.length} טרייד(ים) מבוטלים - יש למחוק אותם קודם`;
      }
      if (notes.length > 0) {
        explanation += `<br>• ${notes.length} הערה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
      }
      if (alerts.length > 0) {
        explanation += `<br>• ${alerts.length} התראה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
      }
      if (executions.length > 0) {
        explanation += `<br>• ${executions.length} ביצוע(ים) מקושר(ים) - יש למחוק אותם קודם`;
      }
      return explanation;
    } else {
      // לביטול - רק טריידים פעילים מונעים ביטול
      let explanation = 'ניתן לבטל רק תכנון ללא טרייד או מקושר לטריידים מבוטלים. לא ניתן לבטל תכנון זה כי יש:';
      if (activeTrades.length > 0) {
        explanation += `<br>• ${activeTrades.length} טרייד(ים) פעיל(ים) - יש לבטל אותם קודם`;
      }
      if (notes.length > 0) {
        explanation += `<br>• ${notes.length} הערה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
      }
      if (alerts.length > 0) {
        explanation += `<br>• ${alerts.length} התראה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
      }
      if (executions.length > 0) {
        explanation += `<br>• ${executions.length} ביצוע(ים) מקושר(ים) - יש למחוק אותם קודם`;
      }
      if (closedTrades.length > 0) {
        explanation += `<br>• ${closedTrades.length} טרייד(ים) סגור(ים) - ניתן לבטל תכנון עם טריידים מבוטלים`;
      }
      return explanation;
    }
  }

  case 'trade': {
    const linkedExecutions = childEntities.filter(entity => entity.type === 'execution');
    const linkedNotes = childEntities.filter(entity => entity.type === 'note');
    const linkedAlerts = childEntities.filter(entity => entity.type === 'alert');

    explanation = 'לא ניתן לבטל טרייד זה כי יש:';
    if (linkedExecutions.length > 0) {
      explanation += `<br>• ${linkedExecutions.length} ביצוע(ים) מקושר(ים) - יש למחוק אותם קודם`;
    }
    if (linkedNotes.length > 0) {
      explanation += `<br>• ${linkedNotes.length} הערה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    if (linkedAlerts.length > 0) {
      explanation += `<br>• ${linkedAlerts.length} התראה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    return explanation;
  }

  case 'ticker': {
    const linkedTrades = childEntities.filter(entity => entity.type === 'trade');
    const linkedPlans = childEntities.filter(entity => entity.type === 'trade_plan');
    const tickerNotes = childEntities.filter(entity => entity.type === 'note');
    const tickerAlerts = childEntities.filter(entity => entity.type === 'alert');

    explanation = 'לא ניתן לבטל טיקר זה כי יש:';
    if (linkedTrades.length > 0) {
      const openTrades = linkedTrades.filter(t => t.status === 'open');
      const closedTrades = linkedTrades.filter(t => t.status === 'closed');
      explanation += `<br>• ${linkedTrades.length} טרייד(ים) (${openTrades.length} פעיל, ` +
        `${closedTrades.length} סגור) - יש לבטל את הפעילים קודם`;
    }
    if (linkedPlans.length > 0) {
      const openPlans = linkedPlans.filter(p => p.status === 'open');
      const closedPlans = linkedPlans.filter(p => p.status === 'closed');
      explanation += `<br>• ${linkedPlans.length} תכנון(ים) (${openPlans.length} פעיל, ` +
        `${closedPlans.length} סגור) - יש לבטל את הפעילים קודם`;
    }
    if (tickerNotes.length > 0) {
      explanation += `<br>• ${tickerNotes.length} הערה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    if (tickerAlerts.length > 0) {
      explanation += `<br>• ${tickerAlerts.length} התראה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    return explanation;
  }

  case 'trading_account': {
    const linkedTrades = childEntities.filter(entity => entity.type === 'trade');
    const linkedExecutions = childEntities.filter(entity => entity.type === 'execution');
    const linkedNotes = childEntities.filter(entity => entity.type === 'note');
    const linkedAlerts = childEntities.filter(entity => entity.type === 'alert');

    explanation = 'לא ניתן למחוק חשבון מסחר זה כי יש:';
    if (linkedTrades.length > 0) {
      const openTrades = linkedTrades.filter(t => t.status === 'open');
      const closedTrades = linkedTrades.filter(t => t.status === 'closed');
      explanation += `<br>• ${linkedTrades.length} טרייד(ים) (${openTrades.length} פעיל, ` +
        `${closedTrades.length} סגור) - יש לבטל את הפעילים קודם`;
    }
    if (linkedExecutions.length > 0) {
      explanation += `<br>• ${linkedExecutions.length} ביצוע(ים) מקושר(ים) - יש למחוק אותם קודם`;
    }
    if (linkedNotes.length > 0) {
      explanation += `<br>• ${linkedNotes.length} הערה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    if (linkedAlerts.length > 0) {
      explanation += `<br>• ${linkedAlerts.length} התראה(ות) מקושרת(ות) - יש למחוק אותן קודם`;
    }
    return explanation;
  }

  default:
    return 'יש פריטים מקושרים שמונעים ביטול/מחיקה של פריט זה. יש לטפל בפריטים המקושרים קודם.';
  }
}

/**
 * Get trade plan details for display
 *
 * Returns formatted trade plan information including symbol and date
 *
 * @param {string|number} planId - Trade plan ID
 * @returns {string} Formatted trade plan details
 */
function getTradePlanDetails(planId, data = null) {
  try {
    // נסה לקבל את פרטי התכנון מהנתונים הגלובליים
    if (window.trade_plansData && Array.isArray(window.trade_plansData)) {
      const plan = window.trade_plansData.find(p => p.id === planId);
      if (plan) {
        // נסה לקבל את הסימבול מהטיקר
        let symbol = 'לא מוגדר';
        if (plan.ticker_symbol) {
          symbol = plan.ticker_symbol;
        } else if (plan.ticker && plan.ticker.symbol) {
          symbol = plan.ticker.symbol;
        } else if (plan.symbol) {
          symbol = plan.symbol;
        }

        const date = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
        return `לתוכנית השקעה ב${symbol} מתאריך ${date}`;
      }
    }

    // נסה לקבל מהנתונים שהתקבלו מה-API
    if (data && data.entity_details) {
      let symbol = 'לא מוגדר';
      if (data.entity_details.ticker_symbol) {
        symbol = data.entity_details.ticker_symbol;
      } else if (data.entity_details.ticker && data.entity_details.ticker.symbol) {
        symbol = data.entity_details.ticker.symbol;
      } else if (data.entity_details.symbol) {
        symbol = data.entity_details.symbol;
      }

      const date = data.entity_details.created_at ? new Date(data.entity_details.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
      return `לתוכנית השקעה ב${symbol} מתאריך ${date}`;
    }

    // נסה לקבל מהנתונים הראשיים של ה-API
    if (data && data.ticker_symbol) {
      let symbol = data.ticker_symbol;
      if (data.ticker && data.ticker.symbol) {
        symbol = data.ticker.symbol;
      }
      const date = data.created_at ? new Date(data.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
      return `לתוכנית השקעה ב${symbol} מתאריך ${date}`;
    }

    // נסה לקבל מהנתונים הגלובליים של הטיקר
    if (window.tickersData && Array.isArray(window.tickersData)) {
      const plan = window.trade_plansData?.find(p => p.id === planId);
      if (plan && plan.ticker_id) {
        const ticker = window.tickersData.find(t => t.id === plan.ticker_id);
        if (ticker && ticker.symbol) {
          const date = plan.created_at ? new Date(plan.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';
          return `לתוכנית השקעה ב${ticker.symbol} מתאריך ${date}`;
        }
      }
    }

    // אם לא נמצא, נסה לקבל מהטבלה
    const planRow = document.querySelector(`tr[data-plan-id="${planId}"]`);
    if (planRow) {
      const symbolCell = planRow.querySelector('[data-column="ticker_symbol"]') || planRow.querySelector('[data-column="symbol"]');
      const dateCell = planRow.querySelector('[data-column="created_at"]');
      const symbol = symbolCell ? symbolCell.textContent.trim() : 'לא מוגדר';
      const date = dateCell ? new Date(dateCell.textContent.trim()).toLocaleDateString('he-IL') : 'לא מוגדר';
      return `לתוכנית השקעה ב${symbol} מתאריך ${date}`;
    }

    return `תוכנית ${planId}`;
  } catch {
    // console.error('Error getting trade plan details:', error);
    return `תוכנית ${planId}`;
  }
}


/**
 * Create basic item info for display
 *
 * Creates a simple string with basic information about the item
 * 
 * מעודכן להשתמש ב-LinkedItemsService ללוגיקה משותפת
 *
 * @param {Object} item - Item data
 * @returns {string} Basic info string
 */
function createBasicItemInfo(item) {
  // פורמט שם פריט - שימוש ב-LinkedItemsService
  const formattedName = (window.LinkedItemsService && window.LinkedItemsService.formatLinkedItemName)
    ? window.LinkedItemsService.formatLinkedItemName(item)
    : (item.description || item.title || item.name || `אלמנט ${item.id}`); // Fallback
  
  // השתמש בנתונים שמגיעים מהשרת
  const status = item.status || 'לא מוגדר';
  const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'לא מוגדר';

  return `${formattedName} | סטטוס: ${status} | נוצר: ${createdAt}`;
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
function createModal(id, title, content, mode = 'view') {
  // Remove existing modal if it exists
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }

  // Create new modal with mode-specific styling
  const modalHtml = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header linkedItems_modal-header-colored modal-header-${mode}" ${mode === 'warningBlock' ? 'style="background: linear-gradient(135deg, #dc3545, #c82333) !important; color: white !important; border-bottom: 2px solid #c82333 !important;"' : ''}>
            <button type="button" class="btn-close-custom btn-close-${mode}" data-bs-dismiss="modal" aria-label="Close">
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
  if (item.name) {details += `<div><strong>Name:</strong> ${item.name}</div>`;}
  if (item.status) {details += `<div><strong>Status:</strong> ${item.status}</div>`;}
  if (item.created_at) {details += `<div><strong>Created:</strong> ${formatDate(item.created_at)}</div>`;}

  // Add type-specific details
  switch (item.type) {
  case 'trade':
    details += createTradeDetails(item);
    break;
  case 'trading_account':
    details += createAccountDetails(item);
    break;
  case 'account':
    // DEPRECATED - use trading_account instead!
    const error3 = new Error(`❌ DEPRECATED: 'account' entity type is no longer supported. Use 'trading_account' instead!`);
    window.Logger.error('❌ DEPRECATED: account entity type used in createDetailedItemInfo', { item }, { page: "linked-items" });
    console.error(error3);
    throw error3;
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
  if (item.symbol) {details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;}
  if (item.side) {
    const sideMap = {
      'buy': 'קנייה',
      'sell': 'מכירה',
      'long': 'לונג',
      'short': 'שורט',
    };
    const translatedSide = sideMap[item.side] || item.side;
    details += `<div><strong>צד:</strong> ${translatedSide}</div>`;
  }
  if (item.amount) {details += `<div><strong>כמות:</strong> ${item.amount}</div>`;}
  if (item.price) {details += `<div><strong>מחיר:</strong> ${item.price}</div>`;}
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
  if (item.currency) {details += `<div><strong>מטבע:</strong> ${item.currency}</div>`;}
  if (item.balance) {details += `<div><strong>יתרה:</strong> ${item.balance}</div>`;}
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
  if (item.symbol) {details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;}
  if (item.name) {details += `<div><strong>שם:</strong> ${item.name}</div>`;}
  if (item.type) {
    const typeMap = {
      'stock': 'מניה',
      'etf': 'ETF',
      'bond': 'אג"ח',
      'crypto': 'קריפטו',
      'forex': 'מט"ח',
      'commodity': 'סחורה',
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
  if (item.symbol) {details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;}
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
      'critical': 'קריטית',
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
  if (item.amount) {details += `<div><strong>סכום:</strong> ${item.amount}</div>`;}
  if (item.type) {
    const typeMap = {
      'income': 'הכנסה',
      'expense': 'הוצאה',
      'transfer': 'העברה',
    };
    const translatedType = typeMap[item.type] || item.type;
    details += `<div><strong>סוג:</strong> ${translatedType}</div>`;
  }
  if (item.description) {details += `<div><strong>תיאור:</strong> ${item.description}</div>`;}
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
    const objectType = window.LinkedItemsService.getEntityLabel(item.related_object_type);
    const objectId = item.related_object_id;
    details += `<div><strong>קשור ל:</strong> ${objectType} #${objectId}</div>`;
  }
  if (item.content) {details += `<div><strong>תוכן:</strong> ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</div>`;}
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
  if (item.symbol) {details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;}
  if (item.target_price) {details += `<div><strong>מחיר יעד:</strong> ${item.target_price}</div>`;}
  if (item.stop_loss) {details += `<div><strong>סטופ לוס:</strong> ${item.stop_loss}</div>`;}
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
  if (item.symbol) {details += `<div><strong>סמל:</strong> ${item.symbol}</div>`;}
  if (item.quantity) {details += `<div><strong>כמות:</strong> ${item.quantity}</div>`;}
  if (item.price) {details += `<div><strong>מחיר:</strong> ${item.price}</div>`;}
  return details;
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
  try {
    // קבלת הנתונים מהשרת
    fetch(`/api/linked-items/${itemType}/${itemId}`)
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
        // שגיאה בייצוא נתונים
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בייצוא', 'שגיאה בייצוא הנתונים לקובץ CSV');
        }
      });
  } catch {
    // שגיאה בייצוא נתונים
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
    'תוכן',
  ];

  // יצירת שורות נתונים
  const rows = allEntities.map(item => {
    const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : '';

    return [
      item.id || '',
      window.LinkedItemsService.getEntityLabel(item.type) || '',
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
      item.content || '',
    ];
  });

  // יצירת CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
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
  return viewLinkedItems(accountId, 'trading_account');
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



// ===== UNIFIED RELATED OBJECT DISPLAY SYSTEM =====

/**
 * Get related object display information
 * 
 * This is the unified function that replaces all the local implementations
 * in alerts.js, notes.js, and data-basic.js
 *
 * @param {Object} item - The item with related_type_id and related_id
 * @param {Object} dataSources - Object containing arrays of related data
 * @param {Object} options - Display options
 * @returns {Object} Display information object
 */
function getRelatedObjectDisplay(item, dataSources = {}, options = {}) {
  const {
    accounts = [],
    trades = [],
    tradePlans = [],
    tickers = []
  } = dataSources;

  const {
    showIcon = true,
    showLink = true,
    format = 'full' // 'full', 'simple', 'minimal'
  } = options;

  // Default values
  let relatedDisplay = 'כללי';
  let relatedIcon = '🌐';
  let relatedClass = 'related-general';
  let relatedColor = '';
  let relatedBgColor = '';

  // Handle null/undefined related_type_id
  if (!item.related_type_id || !item.related_id) {
    return {
      display: relatedDisplay,
      icon: relatedIcon,
      class: relatedClass,
      color: relatedColor,
      bgColor: relatedBgColor,
      type: 'general',
      id: null
    };
  }

  switch (item.related_type_id) {
    case 1: { // חשבון מסחר
      // לוגים לבדיקת חיפוש החשבון
      if (window.Logger && window.Logger.info) {
        window.Logger.info('🔍 חיפוש חשבון:', {
          related_id: item.related_id,
          accountsCount: accounts.length,
          accountsIds: accounts.map(a => a?.id).slice(0, 5) // רק 5 ראשונים ללוג
        }, { page: "linked-items" });
      }
      
      const account = accounts.find(a => a && a.id === item.related_id);
      if (account) {
        const name = account.name || account.account_name || 'לא מוגדר';
        const currency = account.currency_symbol || account.currency || 'ILS';
        
        if (window.Logger && window.Logger.info) {
          window.Logger.info('✅ חשבון נמצא:', { name, currency, id: account.id }, { page: "linked-items" });
        }
        
        if (format === 'minimal') {
          relatedDisplay = name;
        } else if (format === 'simple') {
          relatedDisplay = `${name} (${currency})`;
        } else {
          relatedDisplay = `${name} (${currency})`;
        }
      } else {
        if (window.Logger && window.Logger.warn) {
          window.Logger.warn('⚠️ חשבון לא נמצא:', {
            related_id: item.related_id,
            accountsCount: accounts.length
          }, { page: "linked-items" });
        }
        relatedDisplay = `חשבון מסחר ${item.related_id}`;
      }
      relatedIcon = '🏦';
      relatedClass = 'related-account entity-trading_account-badge';
      const tradingAccountColor = window.getEntityColor ? window.getEntityColor('trading_account') : '';
      const tradingAccountBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('trading_account') : '';
      if (!tradingAccountColor) {
        window.Logger.error('❌ trading_account color not found!', {}, { page: "linked-items" });
      }
      relatedColor = tradingAccountColor || '';
      relatedBgColor = tradingAccountBgColor || '';
      break;
    }
    case 2: { // טרייד
      const trade = trades.find(t => t.id === item.related_id);
      if (trade) {
        const date = trade.created_at || trade.date;
        const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
        const side = trade.side || 'לא מוגדר';
        const investmentType = trade.investment_type || 'לא מוגדר';
        
        // קבלת הטיקר מהטרייד
        let tickerSymbol = '-';
        if (trade.ticker_id) {
          const ticker = tickers.find(t => t.id === trade.ticker_id);
          if (ticker) {
            tickerSymbol = ticker.symbol || '-';
          }
        }
        
        if (format === 'minimal') {
          relatedDisplay = `טרייד ${item.related_id}`;
        } else if (format === 'simple') {
          relatedDisplay = `טרייד | ${tickerSymbol} | ${side} | ${formattedDate}`;
        } else {
          relatedDisplay = `טרייד | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
        }
      } else {
        relatedDisplay = `טרייד ${item.related_id}`;
      }
      relatedIcon = '📈';
      relatedClass = 'related-trade entity-trade-badge';
      relatedColor = window.getEntityColor ? window.getEntityColor('trade') : '#26baac';
      relatedBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('trade') : 'rgba(0, 123, 255, 0.1)';
      break;
    }
    case 3: { // תוכנית
      const plan = tradePlans.find(p => p.id === item.related_id);
      if (plan) {
        const date = plan.created_at || plan.date;
        const formattedDate = date ? new Date(date).toLocaleDateString('he-IL') : 'לא מוגדר';
        const side = plan.side || 'לא מוגדר';
        const investmentType = plan.investment_type || 'לא מוגדר';
        
        // קבלת הטיקר מהתוכנית
        let tickerSymbol = '-';
        if (plan.ticker_id) {
          const ticker = tickers.find(t => t.id === plan.ticker_id);
          if (ticker) {
            tickerSymbol = ticker.symbol || '-';
          }
        }
        
        if (format === 'minimal') {
          relatedDisplay = `תוכנית ${item.related_id}`;
        } else if (format === 'simple') {
          relatedDisplay = `תוכנית | ${tickerSymbol} | ${side} | ${formattedDate}`;
        } else {
          relatedDisplay = `תוכנית | ${tickerSymbol} | ${side} | ${investmentType} | ${formattedDate}`;
        }
      } else {
        relatedDisplay = `תוכנית ${item.related_id}`;
      }
      relatedIcon = '📋';
      relatedClass = 'related-plan';
      break;
    }
    case 4: { // טיקר
      const ticker = tickers.find(t => t.id === item.related_id);
      if (ticker) {
        relatedDisplay = ticker.symbol || `טיקר ${item.related_id}`;
      } else {
        relatedDisplay = `טיקר ${item.related_id}`;
      }
      relatedIcon = '📊';
      relatedClass = 'related-ticker';
      break;
    }
    default:
      relatedDisplay = `אובייקט ${item.related_id}`;
      relatedClass = 'related-other';
  }

  // Add link icon if requested
  if (showLink && item.related_type_id !== 1) { // Don't add link icon for accounts
    relatedDisplay = '🔗 ' + relatedDisplay;
  }

  return {
    display: relatedDisplay,
    icon: showIcon ? relatedIcon : '',
    class: relatedClass,
    color: relatedColor,
    bgColor: relatedBgColor,
    type: getRelatedObjectTypeName(item.related_type_id),
    id: item.related_id
  };
}

/**
 * Get related object type name by ID
 * 
 * @param {number} typeId - The related_type_id
 * @returns {string} Type name
 */
function getRelatedObjectTypeName(typeId) {
  const typeNames = {
    1: 'trading_account', // was 'account' - now deprecated
    2: 'trade', 
    3: 'trade_plan',
    4: 'ticker'
  };
  return typeNames[typeId] || 'unknown';
}

/**
 * Get related object type name in Hebrew
 * 
 * @param {number} typeId - The related_type_id
 * @returns {string} Type name in Hebrew
 */
function getRelatedObjectTypeNameHebrew(typeId) {
  const typeNames = {
    1: 'חשבון מסחר',
    2: 'טרייד',
    3: 'תוכנית',
    4: 'טיקר'
  };
  return typeNames[typeId] || 'אובייקט';
}

/**
 * Get symbol display for related object
 * 
 * This function handles the complex logic for displaying ticker symbols
 * based on the related object type and available data
 *
 * @param {Object} item - The item with related_type_id and related_id
 * @param {Object} dataSources - Object containing arrays of related data
 * @returns {string} Symbol display
 */
function getRelatedObjectSymbol(item, dataSources = {}) {
  const { trades = [], tradePlans = [], tickers = [] } = dataSources;

  if (!item.related_type_id || !item.related_id) {
    return '-';
  }

  switch (item.related_type_id) {
    case 1: // חשבון מסחר - ריק
      return '-';
    case 2: // טרייד
      const trade = trades.find(t => t.id === item.related_id);
      if (trade && trade.ticker_id) {
        const ticker = tickers.find(tick => tick.id === trade.ticker_id);
        return ticker ? ticker.symbol : `טרייד ${item.related_id}`;
      } else {
        return `טרייד ${item.related_id}`;
      }
    case 3: // תוכנית
      const plan = tradePlans.find(p => p.id === item.related_id);
      if (plan && plan.ticker_id) {
        const ticker = tickers.find(tick => tick.id === plan.ticker_id);
        return ticker ? ticker.symbol : `תוכנית ${item.related_id}`;
      } else {
        return `תוכנית ${item.related_id}`;
      }
    case 4: // טיקר
      const ticker = tickers.find(tick => tick.id === item.related_id);
      return ticker ? ticker.symbol : `טיקר ${item.related_id}`;
    default:
      return `אובייקט ${item.related_id}`;
  }
}

/**
 * Load linked items data from server
 *
 * @param {string} itemType - Type of the item
 * @param {number|string} itemId - ID of the item
 * @returns {Promise<Object>} Promise resolving to linked items data
 */
async function loadLinkedItemsData(itemType, itemId) {
  try {
    const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch {
    // console.error('Error loading linked items data:', error);
    return null;
  }
}


// ===== LINKED ITEMS CHECKING SYSTEM =====
/**
 * Check linked items before performing cancel/delete action
 * @param {string} itemType - Entity type (trade, ticker, trade_plan, account, etc.)
 * @param {number} itemId - Entity ID
 * @param {string} action - Action type ('cancel' or 'delete')
 * @returns {Promise<boolean>} true if has linked items (blocks action), false if no linked items
 */
async function checkLinkedItemsBeforeAction(itemType, itemId, action = 'cancel') {
  try {
    const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);
    
    if (!response.ok) {
      return false; // On error, allow action to proceed
    }

    const linkedItemsData = await response.json();
    const childEntities = linkedItemsData.child_entities || [];

    if (childEntities.length > 0) {
      // Store action context for rules explanation
      window.currentAction = action;
      
      // Show modal in warningBlock mode
      window.showLinkedItemsModal(linkedItemsData, itemType, itemId, 'warningBlock');
      
      // Clean up
      delete window.currentAction;
      
      return true; // Has linked items - block action
    }

    return false; // No linked items - continue
  } catch (error) {
    window.Logger.error(`Error checking linked items for ${itemType} ${itemId}:`, error);
    return false; // On error, allow action to proceed
  }
}

/**
 * Check linked items and perform action if no linked items exist
 * @param {string} itemType - Entity type
 * @param {number} itemId - Entity ID  
 * @param {string} action - Action type ('cancel' or 'delete')
 * @param {Function} actionFunction - Function to execute if no linked items
 * @returns {Promise<void>}
 */
async function checkLinkedItemsAndPerformAction(itemType, itemId, action, actionFunction) {
  try {
    const hasLinkedItems = await checkLinkedItemsBeforeAction(itemType, itemId, action);
    
    if (!hasLinkedItems) {
      // No linked items - perform the action
      await actionFunction(itemId);
    }
    // If hasLinkedItems is true, modal is already shown and action is blocked
    
  } catch (error) {
    window.Logger.error(`Error in checkLinkedItemsAndPerformAction:`, error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', error.message);
    }
  }
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
// Generic functions (for backward compatibility)
window.viewLinkedItems = viewLinkedItems;
window.showLinkedItemsModal = showLinkedItemsModal;
window.loadLinkedItemsData = loadLinkedItemsData;
window.createLinkedItemsModalContent = createLinkedItemsModalContent;
window.checkLinkedItems = checkLinkedItems;
window.exportLinkedItemsData = exportLinkedItemsData;

// New unified linked items checking functions
window.checkLinkedItemsBeforeAction = checkLinkedItemsBeforeAction;
window.checkLinkedItemsAndPerformAction = checkLinkedItemsAndPerformAction;
window.createCSVFromLinkedItems = createCSVFromLinkedItems;
window.downloadCSV = downloadCSV;
window.createDetailedItemInfo = createDetailedItemInfo;

// Specific table functions
window.viewLinkedItemsForTrade = viewLinkedItemsForTrade;
window.viewLinkedItemsForAccount = viewLinkedItemsForAccount;
window.viewLinkedItemsForTicker = viewLinkedItemsForTicker;
window.viewLinkedItemsForAlert = viewLinkedItemsForAlert;
window.viewLinkedItemsForCashFlow = viewLinkedItemsForCashFlow;
window.viewLinkedItemsForNote = viewLinkedItemsForNote;
window.viewLinkedItemsForTradePlan = viewLinkedItemsForTradePlan;
window.viewLinkedItemsForExecution = viewLinkedItemsForExecution;

// New unified related object functions
window.getRelatedObjectDisplay = getRelatedObjectDisplay;
window.getRelatedObjectTypeName = getRelatedObjectTypeName;
window.getRelatedObjectTypeNameHebrew = getRelatedObjectTypeNameHebrew;
window.getRelatedObjectSymbol = getRelatedObjectSymbol;


// ייצוא המודול עצמו
window.linkedItems = {
  viewLinkedItems,
  showLinkedItemsModal,
  loadLinkedItemsData,
  createLinkedItemsModalContent,
  checkLinkedItems,
  exportLinkedItemsData,
  createCSVFromLinkedItems,
  downloadCSV,
  createDetailedItemInfo,

  // New unified linked items checking functions
  checkLinkedItemsBeforeAction,
  checkLinkedItemsAndPerformAction,

  viewLinkedItemsForTrade,
  viewLinkedItemsForAccount,
  viewLinkedItemsForTicker,
  viewLinkedItemsForAlert,
  viewLinkedItemsForCashFlow,
  viewLinkedItemsForNote,
  viewLinkedItemsForTradePlan,
  viewLinkedItemsForExecution,

  // New unified related object functions
  getRelatedObjectDisplay,
  getRelatedObjectTypeName,
  getRelatedObjectTypeNameHebrew,
  getRelatedObjectSymbol,
};

// Linked Items loaded successfully
