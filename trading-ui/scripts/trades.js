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

// ========================================
// פונקציות מודל הוספה
// ========================================

/**
 * הצגת מודל הוספת טרייד חדש
 */
function showAddTradeModal() {
    // טעינת נתונים למודל
    loadModalData();

    // ניקוי הטופס
    const form = document.getElementById('addTradeForm');
    if (form) {
        form.reset();
    }

    // ניקוי וולידציה
    if (window.clearValidation) {
        window.clearValidation('addTradeForm');
    }

    // הגדרת תאריך נוכחי
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

    const dateInput = document.getElementById('addCreatedAt');
    if (dateInput) {
        dateInput.value = todayStr;
    }

    // הצגת המודל
    const modalElement = document.getElementById('addTradeModal');
    if (modalElement) {
        if (typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
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
        
        // 2. איסוף נתונים מהטופס
        const formData = {
            ticker_id: parseInt(document.getElementById('addTicker').value),
            trading_account_id: parseInt(document.getElementById('addAccount').value),
            status: document.getElementById('addStatus').value,
            investment_type: document.getElementById('addType').value,
            side: document.getElementById('addSide').value,
            trade_plan_id: document.getElementById('addTradePlan').value || null,
            entry_price: parseFloat(document.getElementById('addEntryPrice').value) || null,
            exit_price: parseFloat(document.getElementById('addExitPrice').value) || null,
            quantity: parseInt(document.getElementById('addQuantity').value),
            pnl: parseFloat(document.getElementById('addPnl').value) || 0,
            created_at: document.getElementById('addCreatedAt').value.split('T')[0], // רק תאריך
            closed_at: document.getElementById('addClosedAt').value ? document.getElementById('addClosedAt').value.split('T')[0] : null,
            remarks: document.getElementById('addRemarks').value || null
        };

        // 3. שליחה לשרת
        const response = await fetch('/api/trades/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // 4. טיפול בתגובה
        if (!response.ok) {
            const errorData = await response.json();
            
            // בדיקה אם זו שגיאת ולידציה (HTTP 400)
            if (response.status === 400) {
                if (typeof window.showSimpleErrorNotification === 'function') {
                    window.showSimpleErrorNotification('שגיאת ולידציה', errorData.message || 'נתונים לא תקינים');
                }
                return;
            }
            
            // שגיאת מערכת אחרת
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 5. הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'הטרייד נוסף בהצלחה');
        }

        // 6. סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTradeModal'));
        if (modal) {
            modal.hide();
        }

        // 7. רענון הטבלה
        if (typeof window.loadTradesData === 'function') {
            await window.loadTradesData();
        }

    } catch (error) {
        console.error('Error adding trade:', error);
        
        // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהוספת טרייד', error.message);
        }
    }
}

/**
 * טעינת נתונים למודלים
 */
async function loadModalData() {
    try {
        // טעינת טיקרים
        const tickersResponse = await fetch('/api/tickers/');
        if (tickersResponse.ok) {
            const tickers = await tickersResponse.json();
            const tickerSelect = document.getElementById('addTicker');
            if (tickerSelect) {
                tickerSelect.innerHTML = '<option value="">בחר טיקר</option>';
                tickers.forEach(ticker => {
                    const option = document.createElement('option');
                    option.value = ticker.id;
                    option.textContent = ticker.symbol;
                    tickerSelect.appendChild(option);
                });
            }
        }

        // טעינת חשבונות מסחר
        const accountsResponse = await fetch('/api/trading-accounts/');
        if (accountsResponse.ok) {
            const accounts = await accountsResponse.json();
            const accountSelect = document.getElementById('addAccount');
            if (accountSelect) {
                accountSelect.innerHTML = '<option value="">בחר חשבון</option>';
                accounts.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name;
                    accountSelect.appendChild(option);
                });
            }
        }

        // טעינת תוכניות טרייד
        const plansResponse = await fetch('/api/trade_plans/');
        if (plansResponse.ok) {
            const plans = await plansResponse.json();
            const planSelect = document.getElementById('addTradePlan');
            if (planSelect) {
                planSelect.innerHTML = '<option value="">בחר תוכנית</option>';
                plans.forEach(plan => {
                    const option = document.createElement('option');
                    option.value = plan.id;
                    option.textContent = plan.name || `תוכנית ${plan.id}`;
                    planSelect.appendChild(option);
                });
            }
        }

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
            console.log('🚀 Initializing Trades with Unified System...');
            
            // שלב 3: מערכות עמוד - אתחול ספציפי
            await this.initializePageSystems();
            
            // שלב 4: מערכות עמוד - אתחול נוסף
            await this.initializeAdditionalSystems();
            
            this.initialized = true;
            console.log('✅ Trades Page Initialized Successfully with Unified System');
            
        } catch (error) {
            console.error('❌ Error initializing Trades page:', error);
            await this.fallbackInitialize();
        }
    }

    /**
     * אתחול מערכות עמוד ספציפיות
     */
    async initializePageSystems() {
        console.log('🔧 Initializing Trades Page Systems...');
        
        // אתחול מערכות בסיסיות
        await this.loadTrades();
        await this.loadTickers();
        await this.loadTradingAccounts();
        await this.loadTradePlans();
        
        // אתחול אירועים
        this.initializeEventListeners();
        
        console.log('✅ Trades Page Systems Initialized');
    }

    /**
     * אתחול מערכות נוספות
     */
    async initializeAdditionalSystems() {
        console.log('🔧 Initializing Additional Trades Systems...');
        
        // אתחול מסננים
        this.initializeFilters();
        
        // אתחול טבלאות
        this.initializeTables();
        
        console.log('✅ Additional Trades Systems Initialized');
    }

    /**
     * אתחול חלופי ללא מערכת מאוחדת
     */
    async fallbackInitialize() {
        console.log('🔄 Using Fallback Initialization for Trades...');
        
        try {
            await this.loadTrades();
            await this.loadTickers();
            await this.loadTradingAccounts();
            await this.loadTradePlans();
            
            this.initializeEventListeners();
            this.initializeFilters();
            this.initializeTables();
            
            this.initialized = true;
            console.log('✅ Trades Page Fallback Initialization Complete');
            
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
        console.log('📊 Loading trades...');
        
        try {
            const response = await fetch('/api/trades/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            this.data = responseData.data || responseData || [];
            console.log(`✅ Loaded ${this.data.length} trades`);
            
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
            console.log(`✅ Loaded ${tickers.length} tickers`);
            
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
            console.log(`✅ Loaded ${accounts.length} trading accounts`);
            
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
            console.log(`✅ Loaded ${tradePlans.length} trade plans`);
            
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
        
        tableBody.innerHTML = '';
        
        this.data.forEach(trade => {
            const row = this.createTradeRow(trade);
            tableBody.appendChild(row);
        });
    }

    /**
     * יצירת שורת טרייד
     */
    createTradeRow(trade) {
        const row = document.createElement('tr');
        
        // תאריך יצירה
        const createdDate = trade.created_at ? new Date(trade.created_at).toLocaleDateString('he-IL') : 'N/A';
        
        // תאריך סגירה
        const closedDate = trade.closed_at ? new Date(trade.closed_at).toLocaleDateString('he-IL') : 'N/A';
        
        // מחיר נוכחי (נדרש לשלוף מהטיקר)
        const currentPrice = trade.current_price || 'N/A';
        
        // שינוי % (נדרש לחשב)
        const changePercent = trade.change_percent || 'N/A';
        
        row.innerHTML = `
            <td class="col-ticker">${trade.ticker?.symbol || 'N/A'}</td>
            <td class="col-price">${currentPrice}</td>
            <td class="col-change">${changePercent}</td>
            <td class="col-status">
                <span class="status-badge status-${trade.status?.toLowerCase() || 'unknown'}">
                    ${trade.status || 'N/A'}
                </span>
            </td>
            <td class="col-type">${trade.investment_type || 'N/A'}</td>
            <td class="col-side">
                <span class="side-badge side-${trade.side?.toLowerCase() || 'unknown'}">
                    ${trade.side || 'N/A'}
                </span>
            </td>
            <td class="col-plan">${trade.trade_plan?.name || 'N/A'}</td>
            <td class="col-pnl">
                <span class="pnl-badge ${(trade.total_pl || 0) >= 0 ? 'positive' : 'negative'}">
                    ${trade.total_pl || 0}
                </span>
            </td>
            <td class="col-created">${createdDate}</td>
            <td class="col-closed">${closedDate}</td>
            <td class="col-account">${trade.trading_account?.name || 'N/A'}</td>
            <td class="col-notes">
                ${trade.notes ? `<span title="${trade.notes}">📝</span>` : ''}
            </td>
            <td class="col-actions actions-cell">
                <button class="btn btn-sm btn-outline-primary" onclick="editTrade(${trade.id})" title="ערוך">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="viewTrade(${trade.id})" title="צפה">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTrade(${trade.id})" title="מחק">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        return row;
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
     * עדכון רשימות טיקרים
     */
    updateTickerSelects(tickers) {
        const selects = ['editTicker'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            // שמירת הערך הנוכחי
            const currentValue = select.value;
            
            // ניקוי האופציות
            select.innerHTML = '<option value="">בחר טיקר</option>';
            
            // הוספת טיקרים
            tickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker.id;
                option.textContent = `${ticker.symbol} - ${ticker.name}`;
                select.appendChild(option);
            });
            
            // שחזור הערך
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    /**
     * עדכון רשימות חשבונות
     */
    updateAccountSelects(accounts) {
        const selects = ['editAccount'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '<option value="">בחר חשבון</option>';
            
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = account.name;
                select.appendChild(option);
            });
            
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    /**
     * עדכון רשימות תוכניות מסחר
     */
    updateTradePlanSelects(tradePlans) {
        const selects = ['editTradePlan'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '<option value="">בחר תוכנית מסחר</option>';
            
            tradePlans.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = `${plan.ticker?.symbol || 'N/A'} - ${plan.investment_type}`;
                select.appendChild(option);
            });
            
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    /**
     * אתחול מאזינים לאירועים
     */
    initializeEventListeners() {
        console.log('🔧 Initializing Trades Event Listeners...');
        
        // כפתור הוספת טרייד
        const addButton = document.getElementById('addTradeBtn');
        if (addButton) {
            addButton.addEventListener('click', () => this.showAddTradeModal());
        }
        
        // כפתור עריכת טרייד
        const editButton = document.getElementById('editTradeBtn');
        if (editButton) {
            editButton.addEventListener('click', () => this.showEditTradeModal());
        }
        
        // טופס עריכת טרייד
        const editForm = document.getElementById('editTradeForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditTrade(e));
        }
        
        console.log('✅ Trades Event Listeners Initialized');
    }

    /**
     * אתחול מסננים
     */
    initializeFilters() {
        console.log('🔧 Initializing Trades Filters...');
        // יישום מסננים בהתאם לצורך
        console.log('✅ Trades Filters Initialized');
    }

    /**
     * אתחול טבלאות
     */
    initializeTables() {
        console.log('🔧 Initializing Trades Tables...');
        // יישום טבלאות בהתאם לצורך
        console.log('✅ Trades Tables Initialized');
    }

    /**
     * הצגת מודל הוספת טרייד
     */
    showAddTradeModal() {
        // איפוס הטופס
        const form = document.getElementById('editTradeForm');
        if (form) {
            form.reset();
            form.dataset.mode = 'add';
        }
        
        // עדכון כותרת
        const modalLabel = document.getElementById('editTradeModalLabel');
        if (modalLabel) {
            modalLabel.textContent = 'הוספת טרייד חדש';
        }
        
        // הצגת המודל
        const modal = new bootstrap.Modal(document.getElementById('editTradeModal'));
        modal.show();
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
        const modalLabel = document.getElementById('editTradeModalLabel');
        if (modalLabel) {
            modalLabel.textContent = 'עריכת טרייד';
        }
        
        // הצגת המודל
        const modal = new bootstrap.Modal(document.getElementById('editTradeModal'));
        modal.show();
    }

    /**
     * מילוי טופס עריכה
     */
    fillEditForm(trade) {
        const form = document.getElementById('editTradeForm');
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
        
        // איסוף נתונים מהטופס
        const formData = {
            ticker_id: document.getElementById('editTicker')?.value,
            status: document.getElementById('editStatus')?.value,
            investment_type: document.getElementById('editType')?.value,
            side: document.getElementById('editSide')?.value,
            trade_plan_id: document.getElementById('editTradePlan')?.value || null,
            trading_account_id: document.getElementById('editAccount')?.value
        };
        
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // הצלחה
            const result = await response.json();
            console.log(`✅ Trade ${mode === 'add' ? 'added' : 'updated'} successfully:`, result);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification(`טרייד ${mode === 'add' ? 'נוסף' : 'עודכן'} בהצלחה`);
            }
            
            // סגירת המודל
            const modal = bootstrap.Modal.getInstance(document.getElementById('editTradeModal'));
            if (modal) {
                modal.hide();
            }
            
            // רענון הנתונים
            await this.loadTrades();
            
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log(`✅ Trade ${tradeId} deleted successfully`);
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('טרייד נמחק בהצלחה');
            }
            
            // רענון הנתונים
            await this.loadTrades();
            
        } catch (error) {
            console.error('❌ Error deleting trade:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה במחיקת טרייד', error.message);
            }
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
            const modalLabel = document.getElementById('editTradeModalLabel');
            if (modalLabel) {
                modalLabel.textContent = 'עריכת טרייד';
            }
            
            // הצגת המודל
            const modal = new bootstrap.Modal(document.getElementById('editTradeModal'));
            modal.show();
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

// אתחול אוטומטי - הוסר למערכת מאוחדת
// document.addEventListener('DOMContentLoaded', function() {
//     if (window.tradesController && !window.tradesController.initialized) {
//         window.tradesController.initialize();
//     }
// });

console.log('✅ trades.js loaded successfully');
