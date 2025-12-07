/**
 * Trade Selector Modal - TikTrack
 * ====================================
 * 
 * מודל לבחירת טרייד
 * 
 * תכונות:
 * - טבלה של טריידים עם עיצוב זהה ל-linked-items
 * - כפתור "בחר" לכל רשומה
 * - הצגת מידע מינימלי לאחר בחירה (סימבול + תאריך)
 * - כפתור "בטל קישור" לביטול קישור
 * 
 * @file trade-selector-modal.js
 * @version 2.0.0
 * @created January 27, 2025
 * @updated February 2, 2025
 */

// ===== TRADE SELECTOR MODAL =====

// Global function to open trade selector modal
// MUST be defined BEFORE the class to ensure it's available immediately when script loads
// This function is called from data-onclick attributes via EventHandlerManager
window.openTradeSelector = async function(fieldId, mode = 'add') {
    console.log('🔵 [openTradeSelector] Called', { fieldId, mode });
    
    // Wait for tradeSelectorModal to be available (if not yet loaded)
    if (!window.tradeSelectorModal) {
        console.warn('⚠️ [openTradeSelector] tradeSelectorModal not available, waiting...');
        for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.tradeSelectorModal) {
                console.log(`✅ [openTradeSelector] tradeSelectorModal became available after ${(i + 1) * 100}ms`);
                break;
            }
        }
    }
    
    if (!window.tradeSelectorModal) {
        console.error('❌ [openTradeSelector] tradeSelectorModal not available after wait!');
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת בחירת טרייד לא זמינה. אנא רענן את הדף.');
        }
        return;
    }
    
    if (typeof window.tradeSelectorModal.show !== 'function') {
        console.error('❌ [openTradeSelector] tradeSelectorModal.show is not a function!');
        console.error('❌ [openTradeSelector] tradeSelectorModal:', window.tradeSelectorModal);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת בחירת טרייד לא מוגדרת נכון. אנא רענן את הדף.');
        }
        return;
    }
    
    try {
        console.log('🔵 [openTradeSelector] Calling tradeSelectorModal.show()');
        await window.tradeSelectorModal.show(fieldId, mode);
    } catch (error) {
        console.error('❌ [openTradeSelector] Error:', error);
        console.error('❌ [openTradeSelector] Error stack:', error.stack);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל בחירת טרייד: ${error.message}`);
        }
    }
};

class TradeSelectorModal {
    constructor() {
        this.modalId = 'tradeSelectorModal';
        this.currentMode = 'add'; // 'add' or 'edit'
        this.currentFieldId = null; // 'linkedTrade' (generic field name)
        this.currentValue = null; // selected trade ID
        this.selectedItem = null; // selected trade data
        this.tradesData = []; // Store trades data for sorting
        this.currentSortColumn = null; // Current sort column index
        this.currentSortDirection = null; // Current sort direction ('asc' or 'desc')
    }

    /**
     * Initialize modal - יצירת המודל
     * 
     * משתמש במערכת הקיימת window.createAndShowModal במקום ליצור Bootstrap modal בעצמו
     */
    init() {
        // אין צורך ליצור את המודל כאן - הוא ייווצר ב-show() באמצעות window.createAndShowModal
        // המודל ייווצר רק כשהוא נדרש, ולא באתחול
    }
    
    /**
     * Get modal HTML - קבלת HTML של המודל
     * 
     * @returns {string} HTML של המודל
     * @private
     */
    getModalHTML() {
        return `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="${this.modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header entity-trade">
                            <h5 class="modal-title" id="${this.modalId}Label">קישור לטרייד</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="סגור"></button>
                        </div>
                        <div class="modal-body">
                            <div id="tradeSelectorContent">
                                <!-- Content will be loaded here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show modal - הצגת המודל
     * 
     * משתמש ב-window.createAndShowModal מהמערכת הקיימת במקום ליצור Bootstrap modal בעצמו
     * 
     * @param {string} fieldId - ID of the field (e.g., 'linkedTrade')
     * @param {string} mode - 'add' or 'edit'
     * @param {number|null} currentValue - Current linked trade ID (for edit mode)
     */
    async show(fieldId, mode = 'add', currentValue = null) {
        try {
            this.currentFieldId = fieldId;
            this.currentMode = mode;
            this.currentValue = currentValue;

            // Find parent modal BEFORE creating new modal to get sourceInfo
            let parentModal = null;
            let parentEntry = null;

            if (window.ModalNavigationService?.getActiveEntry) {
                parentEntry = window.ModalNavigationService.getActiveEntry();
                parentModal = parentEntry?.element || (parentEntry?.modalId ? document.getElementById(parentEntry.modalId) : null);
            }

            if (!parentModal) {
                const allModals = document.querySelectorAll('.modal.show');
                for (const modal of allModals) {
                    if (modal.id !== this.modalId) {
                        parentModal = modal;
                        break;
                    }
                }
            }

            let sourceInfo = null;
            const parentModalId = parentModal?.id || parentEntry?.modalId || '';

            if (parentEntry) {
                sourceInfo = {
                    type: parentEntry.modalType || 'modal',
                    entityType: parentEntry.entityType || null,
                    entityId: parentEntry.entityId ?? null,
                    modalId: parentModalId
                };
            } else if (parentModalId.includes('cashFlow') || parentModalId.includes('CashFlow')) {
                sourceInfo = {
                    type: 'crud-modal',
                    entityType: 'cash_flow',
                    modalId: parentModalId
                };
            } else if (parentModalId.includes('execution') || parentModalId.includes('Execution')) {
                sourceInfo = {
                    type: 'crud-modal',
                    entityType: 'execution',
                    modalId: parentModalId
                };
            }

            // Create sourceInfo for nested modal
            const navigationMetadata = {
                type: 'selector-modal',
                entityType: 'trade_selector',
                entityId: null,
                title: 'קישור לטרייד',
                sourceInfo: sourceInfo
            };

            // Get modal HTML
            const modalHTML = this.getModalHTML();

            // Use window.createAndShowModal from core-systems.js
            // This function handles backdrop: false and ModalNavigationManager automatically
            if (!window.createAndShowModal) {
                throw new Error('window.createAndShowModal is not available. Make sure core-systems.js is loaded.');
            }

            // Create and show modal using the centralized system
            this.modal = await window.createAndShowModal(modalHTML, this.modalId, {
                backdrop: false, // Already handled by createAndShowModal, but explicit for clarity
                keyboard: true,
                focus: true
            });

            if (!this.modal) {
                throw new Error('Failed to create modal');
            }

            // Get modal element
            const modalElement = document.getElementById(this.modalId);
            if (!modalElement) {
                throw new Error('Modal element not found after creation');
            }

            navigationMetadata.modalId = this.modalId;
            navigationMetadata.modalType = 'selector-modal';

            // Modal Navigation System - רק למודלים מקוננים (nested modals)
            // בדיקה אם יש stack - רק אז זה מודל מקונן שצריך רישום
            const hasStack = window.ModalNavigationService?.getStack?.()?.length > 0;
            
            if (hasStack) {
                if (window.ModalNavigationService?.registerModalOpen) {
                    await window.ModalNavigationService.registerModalOpen(modalElement, navigationMetadata);
                } else if (window.pushModalToNavigation) {
                    await window.pushModalToNavigation(modalElement, navigationMetadata);
                }

                // עדכון UI (breadcrumb וכפתור חזרה) רק במודלים מקוננים
                if (window.modalNavigationManager?.updateModalNavigation) {
                    window.modalNavigationManager.updateModalNavigation(modalElement);
                }

                modalElement.addEventListener('hidden.bs.modal', () => {
                    if (window.ModalNavigationService?.registerModalClose) {
                        window.ModalNavigationService.registerModalClose(this.modalId);
                    } else if (window.registerModalNavigationClose) {
                        window.registerModalNavigationClose(this.modalId);
                    }
                }, { once: true });
            }

            // Load content AFTER modal is created and registered
            await this.loadContent();
            
        } catch (error) {
            console.error('❌ [TradeSelectorModal] Error in show():', error);
            console.error('❌ [TradeSelectorModal] Error stack:', error.stack);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', `שגיאה בפתיחת מודל בחירת טרייד: ${error.message}`);
            }
        }
    }

    /**
     * Load content - טעינת תוכן המודל
     */
    async loadContent() {
        const contentDiv = document.getElementById('tradeSelectorContent');
        if (!contentDiv) return;

        // Show loading
        contentDiv.textContent = '';
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-center py-4';
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border';
        spinner.setAttribute('role', 'status');
        loadingDiv.appendChild(spinner);
        contentDiv.appendChild(loadingDiv);

        try {
            // Get filtering parameters from parent modal if available
            let tradingAccountId = null;
            let tickerId = null;
            
            const parentEntry = window.ModalNavigationService?.getParentEntry
                ? window.ModalNavigationService.getParentEntry(this.modalId)
                : null;

            const parentModal = parentEntry?.element || (parentEntry?.modalId ? document.getElementById(parentEntry.modalId) : null);
            const parentEntityType = parentEntry?.entityType || null;

            if (parentModal && parentEntityType) {
                if (parentEntityType === 'cash_flow') {
                    const accountField = parentModal.querySelector('#cashFlowAccount, #currencyExchangeAccount');
                    if (accountField && accountField.value) {
                        tradingAccountId = parseInt(accountField.value);
                        console.log('🔵 [Cash Flow] Filtering trades by trading_account_id:', tradingAccountId);
                    }
                } else if (parentEntityType === 'execution') {
                    const accountField = parentModal.querySelector('#executionAccount');
                    const tickerField = parentModal.querySelector('#executionTicker');

                    if (accountField && accountField.value) {
                        tradingAccountId = parseInt(accountField.value);
                        console.log('🔵 [Execution] Filtering trades by trading_account_id:', tradingAccountId);
                    }

                    if (tickerField && tickerField.value) {
                        tickerId = parseInt(tickerField.value);
                        console.log('🔵 [Execution] Filtering trades by ticker_id:', tickerId);
                    }
                }
            }

            // Load trades only (no trade plans)
            const tradesResponse = await fetch('/api/trades/');

            if (!tradesResponse.ok) {
                throw new Error('שגיאה בטעינת נתונים');
            }

            const tradesData = await tradesResponse.json();
            let trades = tradesData.data || tradesData || [];

            // Filter trades by trading_account_id if provided
            if (tradingAccountId) {
                trades = trades.filter(trade => trade.trading_account_id === tradingAccountId);
                console.log(`🔵 Filtered to ${trades.length} trades for account ${tradingAccountId}`);
            }
            
            // Filter trades by ticker_id if provided (for executions)
            if (tickerId) {
                const beforeCount = trades.length;
                trades = trades.filter(trade => trade.ticker_id === tickerId);
                console.log(`🔵 Filtered to ${trades.length} trades for ticker ${tickerId} (from ${beforeCount})`);
            }

            // Store trades data for sorting
            this.tradesData = trades;

            // Check if we have a current selection
            if (this.currentValue) {
                // Find selected trade
                this.selectedItem = trades.find(t => t.id === parseInt(this.currentValue));
            }

            // Render content
            contentDiv.textContent = '';
            const contentHTML = this.renderContent(trades);
            const parser = new DOMParser();
            const doc = parser.parseFromString(contentHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                contentDiv.appendChild(node.cloneNode(true));
            });
            
            // Setup sortable headers after rendering
            this.setupSortableHeaders();
        } catch (error) {
            console.error('Error loading trade selector:', error);
            contentDiv.textContent = '';
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            const strong = document.createElement('strong');
            strong.textContent = 'שגיאה בטעינת נתונים: ';
            alertDiv.appendChild(strong);
            alertDiv.appendChild(document.createTextNode(error.message));
            contentDiv.appendChild(alertDiv);
        }
    }

    /**
     * Render content - רנדור תוכן המודל
     * 
     * @param {Array} trades - Array of trades
     * @returns {string} HTML content
     */
    renderContent(trades) {
        // If we have a selected item, show it with "cancel link" button
        if (this.selectedItem) {
            return this.renderSelectedItem();
        }

        // Otherwise, show table with all trades
        return this.renderTradesTable(trades);
    }

    /**
     * Render selected item - רנדור פריט נבחר
     * 
     * @returns {string} HTML content
     */
    renderSelectedItem() {
        const trade = this.selectedItem;
        
        // Helper function to get renderer with fallback
        // Helper function to get renderer - שימוש ישיר ב-FieldRendererService
        // המערכת תמיד זמינה דרך BASE package
        const getRenderer = (service, method, ...args) => {
            if (window.FieldRendererService?.[method]) {
                return window.FieldRendererService[method](...args);
            }
            // Fallback מינימלי למקרה נדיר ביותר שהמערכת לא זמינה
            return '<span class="badge badge-secondary">-</span>';
        };

        const tickerDisplay = trade.ticker_symbol || trade.ticker?.symbol || 'טיקר לא ידוע';
        const sideDisplay = getRenderer('FieldRendererService', 'renderSide', trade.side);
        const typeDisplay = getRenderer('FieldRendererService', 'renderType', trade.investment_type);
        const statusDisplay = getRenderer('FieldRendererService', 'renderStatus', trade.status, 'trade');
        const accountDisplay = trade.account_name || trade.trading_account_id || 'לא מוגדר';
        const dateDisplay = trade.created_at ? this.formatTableDate(trade.created_at) : 'לא מוגדר';

        return `
            <div class="alert alert-info">
                <h6>קישור קיים:</h6>
                <div class="table-responsive mt-3">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th class="ticker-cell col-ticker">טיקר</th>
                                <th class="side-cell col-side">צד</th>
                                <th class="type-cell col-type">סוג</th>
                                <th class="status-cell col-status">סטטוס</th>
                                <th class="account-cell col-account">חשבון</th>
                                <th class="date-cell col-date">תאריך</th>
                                <th class="actions-cell col-actions">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="ticker-cell">${tickerDisplay}</td>
                                <td class="side-cell">${sideDisplay}</td>
                                <td class="type-cell">${typeDisplay}</td>
                                <td class="status-cell">${statusDisplay}</td>
                                <td class="account-cell">${accountDisplay}</td>
                                <td class="date-cell">${dateDisplay}</td>
                                <td class="actions-cell">
                                    ${window.createActionsMenu ? window.createActionsMenu([
                                      { type: 'VIEW', onclick: `window.tradeSelectorModal.viewTradeDetails(${trade.id})`, title: 'פרטים' },
                                      { type: 'CANCEL', onclick: `window.tradeSelectorModal.cancelLink()`, title: 'בטל קישור' }
                                    ]) : '<!-- Actions menu not available -->'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mt-3">
                <button type="button" class="btn btn-primary" data-onclick="window.tradeSelectorModal.showSelectionTable()">
                    שנה קישור
                </button>
            </div>
        `;
    }

    /**
     * Render trades table - רנדור טבלת טריידים
     * 
     * @param {Array} trades - Array of trades
     * @returns {string} HTML content
     */
    renderTradesTable(trades) {
        if (!trades || trades.length === 0) {
            return '<div class="alert alert-info">אין טריידים זמינים</div>';
        }

        // Helper function to get renderer - שימוש ישיר ב-FieldRendererService
        // המערכת תמיד זמינה דרך BASE package
        const getRenderer = (service, method, ...args) => {
            if (window.FieldRendererService?.[method]) {
                return window.FieldRendererService[method](...args);
            }
            // Fallback מינימלי למקרה נדיר ביותר שהמערכת לא זמינה
            return '<span class="badge badge-secondary">-</span>';
        };

        // Build table HTML
        const tableRows = trades.map(trade => {
            const tickerDisplay = trade.ticker_symbol || trade.ticker?.symbol || 'טיקר לא ידוע';
            const sideDisplay = getRenderer('FieldRendererService', 'renderSide', trade.side);
            const typeDisplay = getRenderer('FieldRendererService', 'renderType', trade.investment_type);
            const statusDisplay = getRenderer('FieldRendererService', 'renderStatus', trade.status, 'trade');
            const accountDisplay = trade.account_name || trade.trading_account_id || 'לא מוגדר';
            const dateDisplay = trade.created_at ? this.formatTableDate(trade.created_at) : 'לא מוגדר';

            return `
                <tr data-trade-id="${trade.id}">
                    <td class="ticker-cell">${tickerDisplay}</td>
                    <td class="side-cell">${sideDisplay}</td>
                    <td class="type-cell">${typeDisplay}</td>
                    <td class="status-cell">${statusDisplay}</td>
                    <td class="account-cell">${accountDisplay}</td>
                    <td class="date-cell">${dateDisplay}</td>
                    <td class="actions-cell">
                        ${window.createActionsMenu ? window.createActionsMenu([
                          { type: 'VIEW', onclick: `window.tradeSelectorModal.viewTradeDetails(${trade.id})`, title: 'פרטים' },
                          { type: 'SELECT', onclick: `window.tradeSelectorModal.selectTrade(${trade.id})`, title: 'בחר' }
                        ]) : '<!-- Actions menu not available -->'}
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="table-responsive">
                <table class="table table-hover table-sm data-table" id="tradeSelectorTable" data-table-type="trades">
                    <thead>
                        <tr>
                            <th class="ticker-cell col-ticker">
                                <button class="sortable-header" data-column="0">
                                    טיקר
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="side-cell col-side">
                                <button class="sortable-header" data-column="1">
                                    צד
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="type-cell col-type">
                                <button class="sortable-header" data-column="2">
                                    סוג
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="status-cell col-status">
                                <button class="sortable-header" data-column="3">
                                    סטטוס
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="account-cell col-account">
                                <button class="sortable-header" data-column="4">
                                    חשבון
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="date-cell col-date">
                                <button class="sortable-header" data-column="5">
                                    תאריך
                                    <span class="sort-icon">↕</span>
                                </button>
                            </th>
                            <th class="actions-cell col-actions">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Get fallback renderer - רנדור חלופי אם FieldRendererService לא זמין
     * 
     * @param {string} method - Method name
     * @param {...any} args - Arguments
     * @returns {string} HTML content
     */
    /**
     * Get fallback renderer - משמש רק למקרה נדיר ביותר שהמערכת לא זמינה
     * @deprecated - המערכת תמיד זמינה דרך BASE package, fallback מיותר
     * @private
     */
    getFallbackRenderer(method, ...args) {
        // Fallback מינימלי - המערכת תמיד זמינה דרך BASE package
        return '<span class="badge badge-secondary">-</span>';
    }

    /**
     * View trade details - הצגת פרטי טרייד
     * 
     * @param {number} tradeId - ID of trade
     */
    viewTradeDetails(tradeId) {
        if (window.showEntityDetails && typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('trade', tradeId, { mode: 'view' });
        } else {
            console.warn('⚠️ showEntityDetails not available');
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'מערכת הצגת פרטים לא זמינה');
            }
        }
    }

    /**
     * Format date for table - עיצוב תאריך לטבלה
     * 
     * @param {string} dateString - Date string
     * @returns {string} Formatted date (dd.mm.yyyy)
     */
    formatTableDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (error) {
            return '';
        }
    }

    /**
     * Setup sortable headers - הגדרת כותרות לסידור
     */
    setupSortableHeaders() {
        const sortableHeaders = document.querySelectorAll(`#${this.modalId} .sortable-header`);
        
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const columnIndex = parseInt(header.getAttribute('data-column'));
                this.sortTable(columnIndex);
            });
        });
    }

    /**
     * Get column value for sorting - קבלת ערך עמודה לסידור
     * 
     * @param {Object} trade - Trade object
     * @param {number} columnIndex - Column index
     * @returns {*} Column value
     */
    getColumnValue(trade, columnIndex) {
        switch (columnIndex) {
            case 0: // טיקר
                return trade.ticker_symbol || trade.ticker?.symbol || '';
            case 1: // צד
                return trade.side || 'Long';
            case 2: // סוג
                return trade.investment_type || '';
            case 3: // סטטוס
                return trade.status || 'open';
            case 4: // חשבון
                return trade.account_name || trade.trading_account_id || '';
            case 5: // תאריך
                return trade.created_at || '';
            default:
                return '';
        }
    }

    /**
     * Sort table - סידור טבלה
     * 
     * @param {number} columnIndex - Column index to sort by
     */
    sortTable(columnIndex) {
        // Determine sort direction
        if (this.currentSortColumn === columnIndex) {
            // Toggle direction
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New column, default to ascending
            this.currentSortDirection = 'asc';
            this.currentSortColumn = columnIndex;
        }

        // Sort trades data
        const sortedTrades = [...this.tradesData].sort((a, b) => {
            const aValue = this.getColumnValue(a, columnIndex);
            const bValue = this.getColumnValue(b, columnIndex);

            // Handle dates
            if (columnIndex === 5) { // תאריך
                const aDate = new Date(aValue);
                const bDate = new Date(bValue);
                if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
                if (isNaN(aDate.getTime())) return 1;
                if (isNaN(bDate.getTime())) return -1;
                return this.currentSortDirection === 'asc' 
                    ? aDate - bDate 
                    : bDate - aDate;
            }

            // Handle numbers (account ID)
            if (columnIndex === 4 && typeof aValue === 'number' && typeof bValue === 'number') {
                return this.currentSortDirection === 'asc' 
                    ? aValue - bValue 
                    : bValue - aValue;
            }

            // Handle strings
            const aStr = String(aValue || '').toLowerCase();
            const bStr = String(bValue || '').toLowerCase();
            
            if (aStr < bStr) {
                return this.currentSortDirection === 'asc' ? -1 : 1;
            }
            if (aStr > bStr) {
                return this.currentSortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        // Update trades data
        this.tradesData = sortedTrades;

        // Re-render table
        const contentDiv = document.getElementById('tradeSelectorContent');
        if (contentDiv) {
            contentDiv.textContent = '';
            const tableHTML = this.renderTradesTable(sortedTrades);
            const parser = new DOMParser();
            const doc = parser.parseFromString(tableHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                contentDiv.appendChild(node.cloneNode(true));
            });
            this.setupSortableHeaders(); // Re-setup headers after re-render
        }

        // Update sort icons
        this.updateSortIcons(columnIndex);
    }

    /**
     * Update sort icons - עדכון איקוני סידור
     * 
     * @param {number} columnIndex - Column index
     */
    updateSortIcons(columnIndex) {
        const sortableHeaders = document.querySelectorAll(`#${this.modalId} .sortable-header`);
        
        sortableHeaders.forEach((header, index) => {
            const icon = header.querySelector('.sort-icon');
            if (icon) {
                if (index === columnIndex) {
                    // Show active sort icon
                    icon.textContent = this.currentSortDirection === 'asc' ? '↑' : '↓';
                    icon.style.opacity = '1';
                } else {
                    // Show inactive sort icon
                    icon.textContent = '↕';
                    icon.style.opacity = '0.5';
                }
            }
        });
    }

    /**
     * Select trade - בחירת טרייד
     * 
     * @param {number} tradeId - ID of selected trade
     */
    async selectTrade(tradeId) {
        try {
            // Fetch trade data
            const response = await fetch(`/api/trades/${tradeId}`);
            if (!response.ok) {
                throw new Error('שגיאה בטעינת פרטי טרייד');
            }
            const data = await response.json();
            const trade = data.data || data;

            // Update the hidden field - generic field name: trade_id
            // The field ID is determined by the parent modal's entity type
            const tradeField = document.getElementById('trade_id');
            if (tradeField) {
                // Use DataCollectionService to set value if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(tradeField.id, tradeId, 'int');
                } else {
                  tradeField.value = tradeId;
                }
            }

            // Update UI in parent modal
            this.updateParentModalDisplay(trade, 'trade');

            // Close modal using Bootstrap and let ModalNavigationManager handle it
            this.modal.hide();
            
            // ModalNavigationManager will handle the backdrop and history cleanup
        } catch (error) {
            console.error('Error selecting trade:', error);
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'שגיאה בבחירת טרייד');
            }
        }
    }

    /**
     * Update parent modal display - עדכון תצוגה במודל האם
     * 
     * מציג את כל הנתונים של הרשומה הנבחרת כמו בטבלת הבחירה
     */
    updateParentModalDisplay(trade, itemType) {
        // Find the button/display element in parent modal
        const buttonId = this.currentFieldId + 'Button';
        const buttonContainer = document.getElementById(buttonId);
        
        if (buttonContainer) {
            // Helper function to get renderer - שימוש ישיר ב-FieldRendererService
            // המערכת תמיד זמינה דרך BASE package
            const getRenderer = (service, method, ...args) => {
                if (window.FieldRendererService?.[method]) {
                    return window.FieldRendererService[method](...args);
                }
                // Fallback מינימלי למקרה נדיר ביותר שהמערכת לא זמינה
                return '<span class="badge badge-secondary">-</span>';
            };

            const tickerDisplay = trade.ticker_symbol || trade.ticker?.symbol || 'טיקר לא ידוע';
            const sideDisplay = getRenderer('FieldRendererService', 'renderSide', trade.side);
            const typeDisplay = getRenderer('FieldRendererService', 'renderType', trade.investment_type);
            const statusDisplay = getRenderer('FieldRendererService', 'renderStatus', trade.status, 'trade');
            const accountDisplay = trade.account_name || trade.trading_account_id || 'לא מוגדר';
            const dateDisplay = trade.created_at ? this.formatTableDate(trade.created_at) : 'לא מוגדר';

            buttonContainer.textContent = '';
            const tableHTML = `
                <div class="table-responsive" style="margin-top: 0.5rem;">
                    <table class="table table-sm mb-0" style="margin-bottom: 0;">
                        <thead>
                            <tr>
                                <th class="ticker-cell col-ticker">טיקר</th>
                                <th class="side-cell col-side">צד</th>
                                <th class="type-cell col-type">סוג</th>
                                <th class="status-cell col-status">סטטוס</th>
                                <th class="account-cell col-account">חשבון</th>
                                <th class="date-cell col-date">תאריך</th>
                                <th class="actions-cell col-actions">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="ticker-cell">${tickerDisplay}</td>
                                <td class="side-cell">${sideDisplay}</td>
                                <td class="type-cell">${typeDisplay}</td>
                                <td class="status-cell">${statusDisplay}</td>
                                <td class="account-cell">${accountDisplay}</td>
                                <td class="date-cell">${dateDisplay}</td>
                                <td class="actions-cell">
                                    ${window.createActionsMenu ? window.createActionsMenu([
                                      { type: 'VIEW', onclick: `window.tradeSelectorModal.viewTradeDetails(${trade.id})`, title: 'פרטים' },
                                      { type: 'CANCEL', onclick: `window.tradeSelectorModal.cancelLinkFromButton('${this.currentFieldId}')`, title: 'בטל קישור' }
                                    ]) : '<!-- Actions menu not available -->'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
            const parser = new DOMParser();
            const doc = parser.parseFromString(tableHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                buttonContainer.appendChild(node.cloneNode(true));
            });
        }
    }

    /**
     * Cancel link - ביטול קישור
     */
    cancelLink() {
        // Clear the field
        const tradeField = document.getElementById('trade_id');
        if (tradeField) {
            // Use DataCollectionService to clear field if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(tradeField.id, '', 'text');
            } else {
              tradeField.value = '';
            }
        }

        // Reset selection
        this.selectedItem = null;
        this.currentValue = null;

        // Reload content to show selection table
        this.loadContent();
    }

    /**
     * Cancel link from button - ביטול קישור מכפתור
     * 
     * @param {string} fieldId - Field ID
     */
    cancelLinkFromButton(fieldId) {
        // Clear the hidden field - generic field name: trade_id
        const tradeField = document.getElementById('trade_id');
        if (tradeField) {
            // Use DataCollectionService to clear field if available
            if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
              window.DataCollectionService.setValue(tradeField.id, '', 'text');
            } else {
              tradeField.value = '';
            }
        }

        // Reset button display
        const buttonId = fieldId + 'Button';
        const buttonContainer = document.getElementById(buttonId);
        if (buttonContainer) {
            buttonContainer.textContent = '';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-primary';
            button.setAttribute('data-onclick', `openTradeSelector('${fieldId}')`);
            button.textContent = 'קשר לטרייד';
            buttonContainer.appendChild(button);
        }

        // Reset selection
        this.selectedItem = null;
        this.currentValue = null;
    }

    /**
     * Show selection table - הצגת טבלת בחירה
     */
    async showSelectionTable() {
        this.selectedItem = null;
        this.currentValue = null;
        await this.loadContent();
    }

    /**
     * Format date - עיצוב תאריך
     * 
     * @param {string} dateString - Date string
     * @returns {string} Formatted date (dd.mm)
     */
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${day}.${month}`;
        } catch (error) {
            return '';
        }
    }
}

// Initialize global instance AFTER the class is defined
window.tradeSelectorModal = new TradeSelectorModal();

// No need to call init() - modal will be created when show() is called

