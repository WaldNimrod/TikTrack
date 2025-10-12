/**
 * ========================================
 * Trades Page Controller - TikTrack
 * ========================================
 * 
 * בקר העמוד הראשי לטריידים עם אינטגרציה מלאה למערכות כלליות
 * 
 * תכונות:
 * - אינטגרציה עם מערכת אתחול מאוחדת (5 שלבים)
 * - אינטגרציה עם מערכת מטמון מאוחדת (4 שכבות)
 * - אינטגרציה עם מערכת מיפוי טבלאות
 * - אינטגרציה עם מערכת התראות
 * - אינטגרציה עם מערכת ניהול סקשנים
 * - אינטגרציה עם מערכת מודולים
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 8 באוקטובר 2025
 * גרסה: 2.0.0 (Rebuilt)
 * ========================================
 */

// ===== Global Element Cache =====
let addTradeModal = null;
let addTradeModalElement = null;
let editTradeModal = null;
let editTradeModalElement = null;
let editTradeModalLabel = null;
let editTradeForm = null;
let addTradeBtn = null;
let editTradeBtn = null;

// Initialize on DOM ready
// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js
// Initialization moved to initializeTradesPage

window.initializeTradesModals = function() {
    addTradeModalElement = document.getElementById('addTradeModal');
    editTradeModalElement = document.getElementById('editTradeModal');
    editTradeModalLabel = document.getElementById('editTradeModalLabel');
    editTradeForm = document.getElementById('editTradeForm');
    addTradeBtn = document.getElementById('addTradeBtn');
    editTradeBtn = document.getElementById('editTradeBtn');
    
    if (addTradeModalElement) addTradeModal = new bootstrap.Modal(addTradeModalElement);
    if (editTradeModalElement) editTradeModal = new bootstrap.Modal(editTradeModalElement);
};

window.initializeTradesPage = function() {
    // אתחול modals
    if (typeof window.initializeTradesModals === 'function') {
        window.initializeTradesModals();
    }
    
    // טעינת נתונים
    if (typeof window.loadTradesData === 'function') {
        window.loadTradesData();
    }
};

// ========================================
// פונקציות מודל הוספה
// ========================================

/**
 * הצגת מודל הוספת טרייד חדש
 */
function showAddTradeModal() {
    // טעינת נתונים למודל
    loadModalData();

    // ניקוי הטופס באמצעות DataCollectionService
    window.DataCollectionService.resetForm('addTradeForm', true);

    // הגדרת ברירות מחדל באמצעות DefaultValueSetter
    window.DefaultValueSetter.setCurrentDateTime('addCreatedAt');

    // הצגת המודל
    const modalElement = addTradeModalElement;
    if (modalElement) {
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalElement);
            addTradeModal ? addTradeModal.show() : editTradeModal.show();
        } else {
            console.error('Bootstrap is not loaded');
            // נסיון חלופי להצגת המודל
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            document.body.classList.add('modal-open');
        }
    } else {
        console.error('addTradeModal element not found');
    }
}

/**
 * ולידציה של טופס הוספת טרייד
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateTradeForm() {
    return window.validateEntityForm('addTradeForm', [
        { id: 'addTicker', name: 'טיקר' },
        { id: 'addAccount', name: 'חשבון מסחר' },
        { id: 'addType', name: 'סוג השקעה' },
        { id: 'addSide', name: 'צד' },
        { 
            id: 'addQuantity', 
            name: 'כמות',
            validation: (value) => {
                const qty = parseInt(value);
                if (isNaN(qty)) return 'יש להזין כמות תקינה';
                if (qty <= 0) return 'כמות חייבת להיות חיובית';
                return true;
            }
        },
        { id: 'addCreatedAt', name: 'תאריך פתיחה' }
    ]);
}

/**
 * הוספת טרייד חדש
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function addTrade() {
    try {
        // 1. ולידציה של הטופס
        if (!validateTradeForm()) {
            return; // עצירה אם הולידציה נכשלה
        }
        
        // 2. איסוף נתונים מהטופס באמצעות DataCollectionService
        const formData = window.DataCollectionService.collectFormData({
            ticker_id: { id: 'addTicker', type: 'int' },
            trading_account_id: { id: 'addAccount', type: 'int' },
            status: { id: 'addStatus', type: 'text' },
            investment_type: { id: 'addType', type: 'text' },
            side: { id: 'addSide', type: 'text' },
            trade_plan_id: { id: 'addTradePlan', type: 'int', default: null },
            entry_price: { id: 'addEntryPrice', type: 'number', default: null },
            exit_price: { id: 'addExitPrice', type: 'number', default: null },
            quantity: { id: 'addQuantity', type: 'int' },
            pnl: { id: 'addPnl', type: 'number', default: 0 },
            created_at: { id: 'addCreatedAt', type: 'dateOnly' },
            closed_at: { id: 'addClosedAt', type: 'dateOnly', default: null },
            remarks: { id: 'addRemarks', type: 'text', default: null }
        });

        // 3. שליחה לשרת וטיפול בתגובה באמצעות CRUDResponseHandler
        const response = await fetch('/api/trades/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // טיפול בתגובה
        await window.CRUDResponseHandler.handleSaveResponse(response, {
            modalId: 'addTradeModal',
            successMessage: 'הטרייד נוסף בהצלחה',
            reloadFn: async () => {
                // ניקוי מטמון
                if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                    await window.UnifiedCacheManager.remove('trades');
                }
                // רענון טבלה
                if (typeof window.loadTradesData === 'function') {
                    await window.loadTradesData();
                }
            },
            entityName: 'טרייד'
        });

    } catch (error) {
        console.error('Error adding trade:', error);
        
        // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהוספת טרייד', error.message);
        }
    }
}

/**
 * טעינת נתונים למודלים - באמצעות SelectPopulatorService
 */
async function loadModalData() {
    try {
        // טעינת טיקרים
        await window.SelectPopulatorService.populateTickersSelect('addTicker', {
            includeEmpty: true,
            emptyText: 'בחר טיקר'
        });

        // טעינת חשבונות מסחר
        await window.SelectPopulatorService.populateAccountsSelect('addAccount', {
            includeEmpty: true,
            emptyText: 'בחר חשבון',
            defaultFromPreferences: true
        });

        // טעינת תוכניות טרייד
        await window.SelectPopulatorService.populateTradePlansSelect('addTradePlan', {
            includeEmpty: true,
            emptyText: 'בחר תוכנית'
        });

    } catch (error) {
        console.error('Error loading modal data:', error);
    }
}

console.log('📁 trades.js נטען - גרסה חדשה עם מערכות כלליות');

/**
 * Trades Page Controller
 * בקר העמוד הראשי לטריידים עם אינטגרציה מלאה למערכות כלליות
 */
class TradesController {
    constructor() {
        this.data = [];
        this.isLoading = false;
        this.initialized = false;
    }

    /**
     * אתחול העמוד - אינטגרציה עם מערכת אתחול מאוחדת
     */
    async initialize() {
        try {
            // בדיקה שמערכת האתחול המאוחדת זמינה
            if (!window.unifiedAppInit || typeof window.unifiedAppInit.isInitialized !== 'function') {
                console.warn('⚠️ Unified App Initializer not ready, using fallback initialization');
                await this.fallbackInitialize();
                return;
            }

            // שימוש במערכת אתחול מאוחדת
            
            // שלב 3: מערכות עמוד - אתחול ספציפי
            await this.initializePageSystems();
            
            // שלב 4: מערכות עמוד - אתחול נוסף
            await this.initializeAdditionalSystems();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ Error initializing Trades page:', error);
            await this.fallbackInitialize();
        }
    }

    /**
     * אתחול מערכות עמוד ספציפיות
     */
    async initializePageSystems() {
        
        // אתחול מערכות בסיסיות
        await this.loadTrades();
        await this.loadTickers();
        await this.loadTradingAccounts();
        await this.loadTradePlans();
        
        // אתחול אירועים
        this.initializeEventListeners();
        
    }

    /**
     * אתחול מערכות נוספות
     */
    async initializeAdditionalSystems() {
        
        // אתחול מסננים
        this.initializeFilters();
        
        // אתחול טבלאות
        this.initializeTables();
        
    }

    /**
     * אתחול חלופי ללא מערכת מאוחדת
     */
    async fallbackInitialize() {
        
        try {
            await this.loadTrades();
            await this.loadTickers();
            await this.loadTradingAccounts();
            await this.loadTradePlans();
            
            this.initializeEventListeners();
            this.initializeFilters();
            this.initializeTables();
            
            this.initialized = true;
            
        } catch (error) {
            console.error('❌ Fallback initialization failed:', error);
        }
    }

    /**
     * טעינת טריידים
     */
    async loadTrades() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            const response = await fetch('/api/trades/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            this.data = responseData.data || responseData || [];
            
            // עדכון גלובלי למיון
            window.tradesData = this.data;
            window.filteredTradesData = null;
            
            
            // עדכון טבלה
            this.updateTradesTable();
            
        } catch (error) {
            console.error('❌ Error loading trades:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בטעינת טריידים', error.message);
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * טעינת טיקרים
     */
    async loadTickers() {
        try {
            const response = await fetch('/api/tickers/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            const tickers = responseData.data || responseData || [];
            this.updateTickerSelects(tickers);
            
        } catch (error) {
            console.error('❌ Error loading tickers:', error);
        }
    }

    /**
     * טעינת חשבונות מסחר
     */
    async loadTradingAccounts() {
        try {
            const response = await fetch('/api/trading-accounts/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            const accounts = responseData.data || responseData || [];
            this.updateAccountSelects(accounts);
            
        } catch (error) {
            console.error('❌ Error loading trading accounts:', error);
        }
    }

    /**
     * טעינת תוכניות מסחר
     */
    async loadTradePlans() {
        try {
            const response = await fetch('/api/trade_plans/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            const tradePlans = responseData.data || responseData || [];
            this.updateTradePlanSelects(tradePlans);
            
        } catch (error) {
            console.error('❌ Error loading trade plans:', error);
        }
    }

    /**
     * עדכון טבלת טריידים
     */
    updateTradesTable() {
        const tableBody = document.getElementById('tradesTableBody');
        if (!tableBody) return;
        
        if (!this.data || this.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="12" class="text-center text-muted">אין טריידים להצגה</td></tr>';
            return;
        }
        
        const tableHTML = this.data.map((trade, index) => {
            return this.createTradeRowHTML(trade);
        }).join('');
        
        tableBody.innerHTML = tableHTML;
    }

    /**
     * יצירת HTML לשורת טרייד
     */
    createTradeRowHTML(trade) {
        // שימוש ב-FieldRendererService לעיצוב שדות
        const statusDisplay = window.FieldRendererService ? 
            window.FieldRendererService.renderStatus(trade.status) : 
            `<span class="status-badge-${trade.status?.toLowerCase()}">${trade.status || '-'}</span>`;
        
        const typeDisplay = window.FieldRendererService ? 
            window.FieldRendererService.renderType(trade.investment_type) : 
            (trade.investment_type || '-');
        
        const sideDisplay = window.FieldRendererService ? 
            window.FieldRendererService.renderSide(trade.side) : 
            `<span class="side-badge">${trade.side || '-'}</span>`;
        
        const pnlDisplay = window.FieldRendererService ? 
            window.FieldRendererService.renderNumericValue(trade.total_pl || 0, '$', true) : 
            `$${(trade.total_pl || 0).toFixed(2)}`;
        
        const createdDate = window.FieldRendererService ? 
            window.FieldRendererService.renderDate(trade.created_at) : 
            (trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : '-');
        
        const closedDate = window.FieldRendererService ? 
            window.FieldRendererService.renderDate(trade.closed_at) : 
            (trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : '-');
        
        // מחיר נוכחי מהטיקר (מגיע מה-API עם market data)
        const currentPriceDisplay = (trade.current_price && trade.current_price > 0) ? 
            `$${Number(trade.current_price).toFixed(2)}` : 
            '<span class="text-danger fw-bold">לא זמין</span>';
        
        // שינוי % מהטיקר (מגיע מה-API עם market data)
        const changePct = (trade.daily_change !== null && trade.daily_change !== undefined) ? 
            window.FieldRendererService.renderNumericValue(trade.daily_change, '%', true) : 
            '<span class="text-muted">-</span>';
        
        const tickerSymbol = trade.ticker_symbol || trade.ticker?.symbol || '-';
        const accountName = trade.account_name || trade.trading_account?.name || '-';
        const planName = trade.trade_plan?.name || '-';
        
        // כפתורי פעולות - button-icons.js יוסיף את האייקונים
        return `
            <tr>
                <td class="col-ticker">${tickerSymbol}</td>
                <td class="col-price">${currentPriceDisplay}</td>
                <td class="col-change">${changePct}</td>
                <td class="col-status">${statusDisplay}</td>
                <td class="col-type">${typeDisplay}</td>
                <td class="col-side">${sideDisplay}</td>
                <td class="col-plan">${planName}</td>
                <td class="col-pnl">${pnlDisplay}</td>
                <td class="col-created">${createdDate}</td>
                <td class="col-closed">${closedDate}</td>
                <td class="col-account">${accountName}</td>
                <td class="col-actions actions-cell">
                    <button class="action-btn edit-btn" onclick="editTrade(${trade.id})" title="ערוך" data-entity-type="trade" data-entity-id="${trade.id}"></button>
                    <button class="action-btn view-btn" onclick="viewTrade(${trade.id})" title="צפה" data-entity-type="trade" data-entity-id="${trade.id}"></button>
                    <button class="action-btn delete-btn" onclick="deleteTrade(${trade.id})" title="מחק" data-entity-type="trade" data-entity-id="${trade.id}"></button>
                </td>
            </tr>
        `;
    }

    /**
     * צפייה בטרייד
     */
    viewTrade(tradeId) {
        const trade = this.data.find(t => t.id === tradeId);
        if (!trade) {
            console.error('Trade not found:', tradeId);
            return;
        }
        
        // פתיחת מודל פרטים
        if (typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('trade', trade);
        } else {
            alert(`פרטי טרייד:\nטיקר: ${trade.ticker?.symbol || 'N/A'}\nסטטוס: ${trade.status || 'N/A'}\nסוג: ${trade.investment_type || 'N/A'}\nצד: ${trade.side || 'N/A'}`);
        }
    }

    /**
     * עדכון רשימות טיקרים - באמצעות SelectPopulatorService
     */
    async updateTickerSelects(tickers) {
        const selects = ['editTicker'];
        
        for (const selectId of selects) {
            await window.SelectPopulatorService.populateTickersSelect(selectId, {
                includeEmpty: true,
                emptyText: 'בחר טיקר'
            });
        }
    }

    /**
     * עדכון רשימות חשבונות - באמצעות SelectPopulatorService
     */
    async updateAccountSelects(accounts) {
        const selects = ['editAccount'];
        
        for (const selectId of selects) {
            await window.SelectPopulatorService.populateAccountsSelect(selectId, {
                includeEmpty: true,
                emptyText: 'בחר חשבון',
                defaultFromPreferences: true
            });
        }
    }

    /**
     * עדכון רשימות תוכניות מסחר - באמצעות SelectPopulatorService
     */
    async updateTradePlanSelects(tradePlans) {
        const selects = ['editTradePlan'];
        
        for (const selectId of selects) {
            await window.SelectPopulatorService.populateTradePlansSelect(selectId, {
                includeEmpty: true,
                emptyText: 'בחר תוכנית מסחר'
            });
        }
    }

    /**
     * אתחול מאזינים לאירועים
     */
    initializeEventListeners() {
        
        // כפתור הוספת טרייד
        const addButton = addTradeBtn;
        if (addButton) {
            addButton.addEventListener('click', () => this.showAddTradeModal());
        }
        
        // כפתור עריכת טרייד
        const editButton = editTradeBtn;
        if (editButton) {
            editButton.addEventListener('click', () => this.showEditTradeModal());
        }
        
        // טופס עריכת טרייד
        const editForm = editTradeForm;
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditTrade(e));
        }
        
    }

    /**
     * אתחול מסננים
     */
    initializeFilters() {
        // יישום מסננים בהתאם לצורך
    }

    /**
     * אתחול טבלאות
     */
    initializeTables() {
        // יישום טבלאות בהתאם לצורך
    }

    /**
     * הצגת מודל הוספת טרייד
     */
    showAddTradeModal() {
        // איפוס הטופס
        const form = editTradeForm;
        if (form) {
            form.reset();
            form.dataset.mode = 'add';
        }
        
        // עדכון כותרת
        const modalLabel = editTradeModalLabel;
        if (modalLabel) {
            modalLabel.textContent = 'הוספת טרייד חדש';
        }
        
        // הצגת המודל
        // Use cached modal;
        addTradeModal ? addTradeModal.show() : editTradeModal.show();
    }

    /**
     * הצגת מודל עריכת טרייד
     */
    showEditTradeModal() {
        const checkboxes = document.querySelectorAll('#tradesTableBody input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification('אנא בחר טרייד לעריכה');
            }
            return;
        }
        
        if (checkboxes.length > 1) {
            if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification('אנא בחר טרייד אחד בלבד לעריכה');
            }
            return;
        }
        
        const tradeId = checkboxes[0].value;
        const trade = this.data.find(t => t.id == tradeId);
        
        if (!trade) {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('טרייד לא נמצא');
            }
            return;
        }
        
        // מילוי הטופס
        this.fillEditForm(trade);
        
        // עדכון כותרת
        const modalLabel = editTradeModalLabel;
        if (modalLabel) {
            modalLabel.textContent = 'עריכת טרייד';
        }
        
        // הצגת המודל
        // Use cached modal;
        addTradeModal ? addTradeModal.show() : editTradeModal.show();
    }

    /**
     * מילוי טופס עריכה
     */
    fillEditForm(trade) {
        const form = editTradeForm;
        if (!form) return;
        
        form.dataset.mode = 'edit';
        form.dataset.tradeId = trade.id;
        
        // מילוי שדות
        const fields = {
            'editTicker': trade.ticker_id,
            'editStatus': trade.status,
            'editType': trade.investment_type,
            'editSide': trade.side,
            'editTradePlan': trade.trade_plan_id,
            'editAccount': trade.trading_account_id
        };
        
        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value !== null && value !== undefined) {
                field.value = value;
            }
        });
    }

    /**
     * טיפול בעריכת טרייד
     */
    async handleEditTrade(event) {
        event.preventDefault();
        
        const form = event.target;
        const mode = form.dataset.mode;
        const tradeId = form.dataset.tradeId;
        
        // איסוף נתונים מהטופס באמצעות DataCollectionService
        const formData = window.DataCollectionService.collectFormData({
            ticker_id: { id: 'editTicker', type: 'int' },
            status: { id: 'editStatus', type: 'text' },
            investment_type: { id: 'editType', type: 'text' },
            side: { id: 'editSide', type: 'text' },
            trade_plan_id: { id: 'editTradePlan', type: 'int', default: null },
            trading_account_id: { id: 'editAccount', type: 'int' }
        });
        
        try {
            let response;
            
            if (mode === 'add') {
                // הוספת טרייד חדש
                response = await fetch('/api/trades/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // עריכת טרייד קיים
                response = await fetch(`/api/trades/${tradeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }
            
            // טיפול בתגובה באמצעות CRUDResponseHandler
            const handler = mode === 'add' ? 
                window.CRUDResponseHandler.handleSaveResponse : 
                window.CRUDResponseHandler.handleUpdateResponse;
            
            await handler(response, {
                modalId: mode === 'add' ? 'addTradeModal' : 'editTradeModal',
                successMessage: `טרייד ${mode === 'add' ? 'נוסף' : 'עודכן'} בהצלחה`,
                reloadFn: async () => {
                    // ניקוי מטמון
                    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                        await window.UnifiedCacheManager.remove('trades');
                    }
                    // רענון נתונים
                    await this.loadTrades();
                },
                entityName: 'טרייד'
            });
            
        } catch (error) {
            console.error('❌ Error saving trade:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בשמירת טרייד', error.message);
            }
        }
    }

    /**
     * מחיקת טרייד
     */
    async deleteTrade(tradeId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק את הטרייד?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/trades/${tradeId}`, {
                method: 'DELETE'
            });
            
            // טיפול בתגובה באמצעות CRUDResponseHandler
            await window.CRUDResponseHandler.handleDeleteResponse(response, {
                successMessage: 'טרייד נמחק בהצלחה',
                reloadFn: async () => {
                    // ניקוי מטמון
                    if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                        await window.UnifiedCacheManager.remove('trades');
                    }
                    // רענון נתונים
                    await this.loadTrades();
                },
                entityName: 'טרייד'
            });
            
        } catch (error) {
            window.CRUDResponseHandler.handleError(error, 'מחיקת טרייד');
        }
    }
}

// יצירת instance גלובלי
window.tradesController = new TradesController();

// פונקציות גלובליות לתאימות לאחור
window.editTrade = function(tradeId) {
    window.tradesController.showEditTradeModal();
};

window.deleteTrade = function(tradeId) {
    window.tradesController.deleteTrade(tradeId);
};

window.viewTrade = function(tradeId) {
    window.tradesController.viewTrade(tradeId);
};

// פונקציות נוספות מהקובץ הישן
window.viewTickerDetails = function(tickerId) {
    // צפייה בפרטי טיקר באמצעות מודל פרטי ישות
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('ticker', tickerId, { mode: 'view' });
    } else {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי טיקר תהיה זמינה בקרוב');
        }
    }
};

window.viewAccountDetails = function(accountId) {
    // צפייה בפרטי חשבון באמצעות מודל פרטי ישות
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('account', accountId, { mode: 'view' });
    } else {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('מידע', 'פונקציונליות צפייה בפרטי חשבון תהיה זמינה בקרוב');
        }
    }
};

window.viewTradePlanDetails = function(tradePlanId) {
    // צפייה בפרטי תוכנית טרייד באמצעות מודל פרטי ישות
    if (typeof window.showEntityDetails === 'function') {
        window.showEntityDetails('trade_plan', tradePlanId, { mode: 'view' });
    } else {
        if (typeof window.showInfoNotification === 'function') {
            window.showInfoNotification('מידע', `פונקציונליות צפייה בתוכנית טרייד #${tradePlanId} תהיה זמינה בקרוב`);
        }
    }
};

window.editTradeRecord = function(tradeId) {
    // עריכת טרייד - תאימות לאחור
    if (tradeId) {
        // מציאת הטרייד במערך
        const trade = window.tradesController.data.find(t => t.id === tradeId);
        if (trade) {
            window.tradesController.fillEditForm(trade);
            
            // עדכון כותרת
            const modalLabel = editTradeModalLabel;
            if (modalLabel) {
                modalLabel.textContent = 'עריכת טרייד';
            }
            
            // הצגת המודל
            // Use cached modal;
            addTradeModal ? addTradeModal.show() : editTradeModal.show();
        } else {
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', 'טרייד לא נמצא');
            }
        }
    } else {
        window.tradesController.showEditTradeModal();
    }
};

window.showAddTradeModal = showAddTradeModal;

// Export validation function
window.validateTradeForm = validateTradeForm;

// Export save function
window.addTrade = addTrade;

// Export table update function (for sorting and data loading)
window.updateTradesTable = function(trades) {
    if (window.tradesController) {
        window.tradesController.data = trades || window.tradesController.data;
        window.tradesController.updateTradesTable();
        
        // הפעלת button-icons לאחר עדכון הטבלה
        if (typeof window.initializeButtonIcons === 'function') {
            setTimeout(() => {
                window.initializeButtonIcons();
            }, 100);
        }
    }
};

// Export data arrays for sorting
window.tradesData = [];
window.filteredTradesData = null;

// ========================================
// פונקציה לטעינת נתוני טריידים
// ========================================

/**
 * טעינת כל הטריידים מהשרת ועדכון הטבלה
 * משתמשת במערכת הכללית loadTableData
 * Returns empty array on error with proper user notification (NO MOCK DATA per Rules 48-49)
 *
 * @returns {Array} מערך של טריידים או מערך ריק במקרה של שגיאה
 */
let _isLoadingTrades = false;

async function loadTradesData() {
    // מניעת טעינה כפולה
    if (_isLoadingTrades) {
        return window.tradesData || [];
    }
    
    _isLoadingTrades = true;
    
    try {
        // שימוש במערכת הכללית לטעינת נתונים (v2.0.0 - with error handling)
        if (typeof window.loadTableData === 'function') {
            const data = await window.loadTableData('trades', updateTradesTable, {
                tableId: 'tradesTable',
                entityName: 'טריידים',
                columns: 12,
                onRetry: loadTradesData
            });
            
            // עדכון נתונים גלובליים
            window.tradesData = data;
            _isLoadingTrades = false;
            
            // הפעלת button-icons לאחר עדכון הטבלה
            if (typeof window.initializeButtonIcons === 'function') {
                setTimeout(() => {
                    window.initializeButtonIcons();
                }, 100);
            }
            
            return data;
        } else {
            console.error('❌ window.loadTableData לא זמינה');
            
            // נסיון חלופי - טעינה ישירה מה-API
            const response = await fetch('/api/trades/');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            const data = result.data || result;
            
            window.tradesData = data;
            updateTradesTable(data);
            _isLoadingTrades = false;
            
            // הפעלת button-icons לאחר עדכון הטבלה
            if (typeof window.initializeButtonIcons === 'function') {
                setTimeout(() => {
                    window.initializeButtonIcons();
                }, 100);
            }
            
            return data;
        }
    } catch (error) {
        console.error('❌ שגיאה בטעינת טריידים:', error);
        
        // הצגת שגיאה למשתמש
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(
                'שגיאה בטעינת טריידים',
                `לא ניתן לטעון את נתוני הטריידים: ${error.message}`
            );
        }
        
        // עדכון טבלה עם שגיאה
        const tableBody = document.getElementById('tradesTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        שגיאה בטעינת נתונים: ${error.message}
                        <br>
                        <button class="btn btn-sm btn-primary mt-2" onclick="window.loadTradesData()">
                            <i class="fas fa-redo"></i> נסה שוב
                        </button>
                    </td>
                </tr>
            `;
        }
        
        _isLoadingTrades = false;
        return [];
    }
}

// חשיפה כפונקציה גלובלית
window.loadTradesData = loadTradesData;

// אתחול אוטומטי - הוסר למערכת מאוחדת
// document.addEventListener('DOMContentLoaded', function() {
//     if (window.tradesController && !window.tradesController.initialized) {
//         window.tradesController.initialize();
//     }
// });

console.log('✅ trades.js v=20251012d loaded successfully - fixed duplicate declarations');
