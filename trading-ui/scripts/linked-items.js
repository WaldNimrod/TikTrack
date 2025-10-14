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
 *    - exportLinkedItemsData() - Export linked items data
 *    - viewItemDetails() - View item details
 *    - editItem() - Edit item
 *    - deleteItem() - Delete item
 *    - openItemPage() - Open item page (currently shows "in development")
 *
 * DEPENDENCIES:
 * ============
 * - notification-system.js: showLinkedItemsModal() and loadLinkedItemsData()
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
  let detectedItemType = itemType;
  if (!detectedItemType) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/accounts')) {detectedItemType = 'account';}
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

  // יצירת כותרת מותאמת לפי ישות (ללא מזהים גולמיים)
  let modalTitle = '';
  if (itemType === 'ticker') {
    const tickerSymbol = data.tickerSymbol ||
      (window.getTickerSymbol ? window.getTickerSymbol(itemId) : '') ||
      '';
    modalTitle = `פריטים מקושרים לטיקר ${tickerSymbol || ''}`.trim();
  } else if (itemType === 'trade_plan') {
    modalTitle = 'פריטים מקושרים לתוכנית השקעה';
  } else if (itemType === 'account') {
    // עבור חשבון - הוספת שם החשבון
    const accountName = data.accountName || '';
    modalTitle = accountName ? `פריטים מקושרים לחשבון ${accountName}` : `פריטים מקושרים לחשבון #${itemId}`;
  } else {
    modalTitle = `פריטים מקושרים ל-${getItemTypeDisplayName(itemType)}`;
  }

  // Add mode indicator to title
  if (mode === 'warningBlock') {
    modalTitle += ' - ⚠️ אזהרה';
  } else if (mode === 'view') {
    modalTitle += ' - 👁️ תצוגה';
  }

  createModal(modalId, modalTitle, modalContent, mode, itemType);

  // Show the modal using the unified helper function to avoid ARIA warnings
  if (typeof window.createAndShowModal === 'function') {
    // Use helper to show existing modal (already in DOM from createModal)
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    
    // Add MutationObserver for ARIA fix
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          if (modalElement.getAttribute('aria-hidden') === 'true') {
            modalElement.removeAttribute('aria-hidden');
            modalElement.removeAttribute('inert');
          }
        }
      });
    });
    
    observer.observe(modalElement, { attributes: true, attributeFilter: ['aria-hidden', 'inert'] });
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', () => {
      observer.disconnect();
    }, { once: true });
  } else {
    // Fallback to regular Bootstrap
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
  }
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
  case 'account':
    itemName = data.accountName || `חשבון ${itemId}`;
    break;
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

  // קבלת הסבר על הכללים לפי סוג האובייקט והפעולה (רק ב-warningBlock mode)
  const rulesExplanation = mode === 'warningBlock' ? getRulesExplanation(itemType, data) : null;

  const entityColor = (window.getEntityColor && window.getEntityColor(itemType)) || '#26baac';

  let content = `
    <div class="linked-items-container">
      <div class="alert alert-info">
        <strong>📋 סקירת אלמנטים מקושרים</strong><br>
        מציג את כל האלמנטים המקושרים ל-${itemName}
        ${mode === 'warningBlock' ? '<br><strong style="color: ' + (window.getTableColors ? window.getTableColors().negative : '#dc3545') + ';">⚠️ לא ניתן לבצע פעולה זו עד לטיפול בפריטים המקושרים</strong>' : ''}
      </div>
      ${rulesExplanation ? `
      <div class="alert alert-warning">
        <strong>⚠️ כללי ביטול/מחיקה</strong><br>
        ${rulesExplanation}
      </div>
      ` : ''}
  `;

  // Add linked items lists with separation
  const childEntities = data.child_entities || [];
  const parentEntities = data.parent_entities || [];

  if (mode === 'view') {
    // In view mode, show parents first, then children with separate headers
    if (parentEntities.length > 0) {
      content += `
        <div class="section-header">
          <h6 class="section-title">📋 אובייקטים אם (Parent Objects)</h6>
          <p class="section-description">אובייקטים שמכילים או מפנים לאובייקט הנוכחי</p>
        </div>
      `;
      content += createLinkedItemsList(parentEntities, mode);
    }

    if (childEntities.length > 0) {
      content += `
        <div class="section-header">
          <h6 class="section-title">🔗 אובייקטים ילדים (Child Objects)</h6>
          <p class="section-description">אובייקטים שמקושרים לאובייקט הנוכחי</p>
        </div>
      `;
      content += createLinkedItemsList(childEntities, mode);
    }

    if (parentEntities.length === 0 && childEntities.length === 0) {
      content += `
        <div class="alert alert-warning">
          <strong>ℹ️ לא נמצאו פריטים מקושרים</strong><br>
          ל-${getItemTypeDisplayName(itemType)} זה אין פריטים מקושרים במערכת.
        </div>
      `;
    }
  } else {
    // In warningBlock mode, show only children (existing behavior)
    if (childEntities.length > 0) {
      content += createLinkedItemsList(childEntities, mode);
    } else {
      content += `
        <div class="alert alert-warning">
          <strong>ℹ️ לא נמצאו פריטים מקושרים</strong><br>
          ל-${getItemTypeDisplayName(itemType)} זה אין פריטים מקושרים במערכת.
        </div>
      `;
    }
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
function createLinkedItemsList(items, mode = 'view') {
  let listHtml = '<div class="linked-items-list">';

  items.forEach(item => {
    const icon = getItemTypeIcon(item.type);
    const displayName = getItemTypeDisplayName(item.type);

    // Use FieldRendererService when available
    const statusBadge = (window.FieldRendererService && window.FieldRendererService.renderStatus)
      ? window.FieldRendererService.renderStatus(item.status, item.type)
      : getStatusBadge(item.status);

    const createdLabel = (window.FieldRendererService && window.FieldRendererService.renderDate) ? window.FieldRendererService.renderDate(item.created_at, false) : (item.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'לא מוגדר');
    const basicInfo = `נוצר: ${createdLabel}`;

    listHtml += `
      <div class="linked-item-row ${item.type} linked-item-${item.type}">
        <div class="linked-item-col">
          <div class="linked-item-icon">${icon}</div>
          <div class="linked-item-type">
            <span class="badge ${getTypeBadgeClass(item.type)}">${displayName}</span>
          </div>
        </div>
        <div class="linked-item-col">
          <div class="linked-item-title">${item.title || ''}</div>
          <div class="linked-item-description">${item.description || ''}</div>
          <div class="linked-item-status">${statusBadge}</div>
        </div>
        <div class="linked-item-col" style="margin-inline-start:auto;">
          <div class="linked-item-basic-details">${basicInfo}</div>
          ${mode === 'warningBlock' ? '' : `
          <div class="linked-item-actions" style="margin-inline-start:auto;">
            ${window.createActionsMenu ? window.createActionsMenu([
              window.createButton ? window.createButton('VIEW', `viewItemDetails('${item.type}', ${item.id})`) : `<button class='btn btn-sm btn-outline-info' onclick=\"viewItemDetails('${item.type}', ${item.id})\" title='צפה'>👁️</button>`,
              window.createEditButton ? window.createEditButton(`editItem('${item.type}', ${item.id})`) : `<button class='btn btn-sm btn-outline-secondary' onclick=\"editItem('${item.type}', ${item.id})\" title='ערוך'>✏️</button>`,
              window.createLinkButton ? window.createLinkButton(`openItemPage('${item.type}', ${item.id})`) : `<button class='btn btn-sm btn-outline-info' onclick=\"openItemPage('${item.type}', ${item.id})\" title='פתח'>🔗</button>`,
              window.createDeleteButton ? window.createDeleteButton(`deleteItem('${item.type}', ${item.id})`) : `<button class='btn btn-sm btn-danger' onclick=\"deleteItem('${item.type}', ${item.id})\" title='מחק'>🗑️</button>`
            ], `${item.type}-${item.id}`) : ''}
          </div>
          `}
        </div>
      </div>
    `;
  });

  listHtml += '</div>';
  return listHtml;
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
  const accounts = allEntities.filter(entity => entity.type === 'account');

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
    explanation += `<br>• ${accounts.length} חשבון(ות)`;
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

  case 'account': {
    const linkedTrades = childEntities.filter(entity => entity.type === 'trade');
    const linkedExecutions = childEntities.filter(entity => entity.type === 'execution');
    const linkedNotes = childEntities.filter(entity => entity.type === 'note');
    const linkedAlerts = childEntities.filter(entity => entity.type === 'alert');

    explanation = 'לא ניתן למחוק חשבון זה כי יש:';
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
 * Get icon for item type
 *
 * Returns the appropriate emoji icon for each item type
 *
 * @param {string} type - Item type
 * @returns {string} Emoji icon
 */
function getItemTypeIcon(type) {
  // השתמש בפונקציה הגלובלית אם היא זמינה
  if (window.uiUtils && window.uiUtils.getItemTypeIcon) {
    const globalIcon = window.uiUtils.getItemTypeIcon(type);
    // החלף את הגודל ל-48px עבור חלון המקושרים (פי 2 מהמקורי)
    return globalIcon.replace('width: 16px; height: 16px;', 'width: 48px; height: 48px;').replace('class="', 'class="linked-item-icon-img ');
  }

  // ברירת מחדל אם הפונקציה הגלובלית לא זמינה
  const icons = {
    'trade': '<img src="/images/icons/trades.svg" alt="טרייד" class="linked-item-icon-img" width="48" height="48">',
    'account': '<img src="/images/icons/accounts.svg" alt="חשבון" class="linked-item-icon-img" width="48" height="48">',
    'ticker': '<img src="/images/icons/tickers.svg" alt="טיקר" class="linked-item-icon-img" width="48" height="48">',
    'alert': '<img src="/images/icons/alerts.svg" alt="התראה" class="linked-item-icon-img" width="48" height="48">',
    'cash_flow': '<img src="/images/icons/cash_flows.svg" alt="תזרים מזומנים" class="linked-item-icon-img" width="48" height="48">',
    'note': '<img src="/images/icons/notes.svg" alt="הערה" class="linked-item-icon-img" width="48" height="48">',
    'trade_plan': '<img src="/images/icons/trade_plans.svg" alt="תכנון טרייד" class="linked-item-icon-img" width="48" height="48">',
    'execution': '<img src="/images/icons/executions.svg" alt="ביצוע" class="linked-item-icon-img" width="48" height="48">',
  };
  return icons[type] || '<img src="/images/icons/home.svg" alt="דף הבית" class="linked-item-icon-img" width="48" height="48">';
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
    'trade': 'טרייד',
    'account': 'חשבון',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'cash_flow': 'תזרים מזומנים',
    'note': 'הערה',
    'trade_plan': 'תוכנית השקעה',
    'execution': 'ביצוע',
  };
  return names[type] || 'פריט';
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
function createModal(id, title, content, mode = 'view', entityType = '') {
  // Remove existing modal if it exists
  const existingModal = document.getElementById(id);
  if (existingModal) {
    existingModal.remove();
  }

  // Create new modal with mode-specific styling
  // Note: No aria-hidden - let Bootstrap manage it to avoid accessibility warnings
  const entityClass = entityType ? ` entity-${entityType}` : '';
  const modalHtml = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label">
      <div class="modal-dialog modal-xl">
        <div class="modal-content${entityClass}">
                          <div class="modal-header linkedItems_modal-header-colored modal-header-${mode} entity-${entityType}">
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
    const objectType = getItemTypeDisplayName(item.related_object_type);
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
  if (item.quantity) {details += `<div><strong>כמות:</strong> #${item.quantity}</div>`;}
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
      getItemTypeDisplayName(item.type) || '',
      item.title || '',
      item.description || '',
      item.status || '',
      createdDate,
      item.symbol || '',
      item.currency || '',
      item.quantity ? '#' + item.quantity : (item.amount || ''),
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
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('פיתוח', 'פתיחת דף רשומה - בפיתוח');
    }
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
    'execution': 'bg-success',
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
  if (!status) {return '';}

  // סולם הצבעים הזהה לעמודי הטבלאות
  const statusClasses = {
    'open': 'status-badge status-open',
    'closed': 'status-badge status-closed',
    'active': 'status-badge status-active',
    'completed': 'status-badge status-completed',
    'pending': 'status-badge status-pending',
    'cancelled': 'status-badge status-cancelled',
    'inactive': 'status-badge status-inactive',
    'archived': 'status-badge status-archived',
  };

  const statusText = {
    'open': 'פתוח',
    'closed': 'סגור',
    'active': 'פעיל',
    'completed': 'הושלם',
    'pending': 'ממתין',
    'cancelled': 'בוטל',
    'inactive': 'לא פעיל',
    'archived': 'בארכיון',
  };

  const badgeClass = statusClasses[status] || 'status-badge status-inactive';
  const badgeText = statusText[status] || status;

  return `<span class="${badgeClass}">${badgeText}</span>`;
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


// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
// Generic functions (for backward compatibility)
window.viewLinkedItems = viewLinkedItems;

// עטיפה עם לוגים עבור חתימות ישנות של showLinkedItemsModal([],'type',id)
const _showLinkedItemsModal = showLinkedItemsModal;
window.showLinkedItemsModal = function(dataOrItemId, maybeType, maybeId, mode = 'view') {
  const info = (window.consoleCleanup?.info || console.log);
  const warn = (window.consoleCleanup?.warn || console.warn);
  // תמיכה בחתימה הישנה: ([], 'ticker', 1)
  if (Array.isArray(dataOrItemId) && typeof maybeType === 'string' && (typeof maybeId === 'number' || typeof maybeId === 'string')) {
    info(`🔗 [LinkedItems] Legacy call detected: showLinkedItemsModal([], '${maybeType}', ${maybeId}, '${mode}')`);
    // נטען נתונים ואז נקרא לגרסה החדשה
    return loadLinkedItemsData(maybeType, maybeId).then((data) => {
      info(`📦 [LinkedItems] Data loaded for ${maybeType}#${maybeId}`, data ? {count: (data.childEntities||[]).length} : {nullData: true});
      return _showLinkedItemsModal(data || [], maybeType, maybeId, mode);
    });
  }
  // חתימה חדשה: (data, 'type', id)
  info(`🔗 [LinkedItems] showLinkedItemsModal called`, { type: maybeType, id: maybeId, mode });
  return _showLinkedItemsModal(dataOrItemId, maybeType, maybeId, mode);
};
window.loadLinkedItemsData = loadLinkedItemsData;
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
  loadLinkedItemsData,
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
  viewLinkedItemsForExecution,
};

// Linked Items loaded successfully

// ===== Helper wrapper for legacy HTML buttons =====
/**
 * Open linked items modal from generic button calls
 * Tries to auto-detect entityId from current edit modal if not provided
 */
function openLinkedItemsModal(entityType, entityId) {
  const log = (window.consoleCleanup?.info || console.log);
  const logErr = (window.consoleCleanup?.error || console.error);

  log(`🔎 [LinkedItems] openLinkedItemsModal called`, { entityType, entityId });

  let resolvedId = entityId;
  if (!resolvedId) {
    // Try to read from edit modal dataset (used in trades page)
    const editModal = document.getElementById('editTradeModal');
    if (editModal && editModal.dataset && editModal.dataset.tradeId) {
      resolvedId = editModal.dataset.tradeId;
    }
    // Try actions-cell dataset
    if (!resolvedId) {
      const actionsCell = document.querySelector('.actions-cell:hover, .actions-cell:focus-within');
      if (actionsCell && actionsCell.dataset && actionsCell.dataset.entityId) {
        resolvedId = actionsCell.dataset.entityId;
      }
    }
  }

  if (!resolvedId) {
    logErr(`❌ [LinkedItems] Missing entityId. Cannot open modal. entityType=${entityType}`);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('אלמנטים מקושרים', `לא זוהה מזהה רשומה עבור ${getItemTypeDisplayName(entityType)}.`);
    }
    return;
  }

  log(`✅ [LinkedItems] Opening modal`, { entityType, resolvedId });
  viewLinkedItems(resolvedId, entityType);
}

window.openLinkedItemsModal = openLinkedItemsModal;
