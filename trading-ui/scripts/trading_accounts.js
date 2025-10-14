/**
 * ========================================
 * Trading Accounts Page Controller - TikTrack
 * ========================================
 * 
 * בקר העמוד הראשי לחשבונות מסחר עם אינטגרציה מלאה למערכות כלליות
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
 * תאריך יצירה: 5 בינואר 2025
 * גרסה: 2.0.0 (Rebuilt)
 * ========================================
 */


// ===== Global Element Cache =====
let addAccountModalElement = null;
let editAccountModalElement = null;
let addAccountModal = null;
let editAccountModal = null;
let loadingIndicator = null;
let refreshBtn = null;
let accountCurrencySelect = null;
let editAccountCurrencySelect = null;

// Initialize element references on DOM ready
// DOMContentLoaded removed - handled by unified system via PAGE_CONFIGS in core-systems.js
// Modal initialization moved to initializeTradingAccountsModals (called from PAGE_CONFIGS)

window.initializeTradingAccountsModals = function() {
    addAccountModalElement = document.getElementById('addAccountModal');
    editAccountModalElement = document.getElementById('editAccountModal');
    loadingIndicator = document.getElementById('loadingIndicator');
    refreshBtn = document.getElementById('refreshBtn');
    accountCurrencySelect = document.getElementById('accountCurrency');
    editAccountCurrencySelect = document.getElementById('editAccountCurrency');
    
    if (addAccountModalElement) addAccountModal = new bootstrap.Modal(addAccountModalElement);
    if (editAccountModalElement) editAccountModal = new bootstrap.Modal(editAccountModalElement);
};

/**
 * Trading Accounts Page Controller
 * בקר העמוד הראשי לחשבונות מסחר עם אינטגרציה מלאה למערכות כלליות
 */
class TradingAccountsController {
    constructor() {
        this.data = [];
        this.isLoading = false;
        this.initialized = false;
    }



    /**
     * טעינת נתונים באמצעות מערכות כלליות
     */
    async loadData() {
        if (this.isLoading || window.tradingAccountsDataLoaded) {
            return;
        }
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // שימוש במערכת הכללית לטעינת נתונים (כמו trade_plans)
            if (typeof window.loadTableData === 'function') {
                this.data = await window.loadTableData('trading_accounts', this.updateTable.bind(this), {
                    tableId: 'accountsTable',
                    entityName: 'חשבונות מסחר',
                    columns: 7,
                    onRetry: () => this.loadData()
                });
                
                // שמירת הנתונים הגלובליים
                window.tradingAccountsData = this.data;
                
                // עדכון UI באמצעות מערכות כלליות
                this.updateStatistics();
            } else {
                throw new Error('window.loadTableData is not available');
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('שגיאה בטעינת נתונים');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
            window.tradingAccountsDataLoaded = true;
        }
    }

    /**
     * עדכון הטבלה באמצעות מערכת מיפוי טבלאות
     */
    updateTable(tradingAccounts = null) {
        try {
            // קבלת נתונים מפרמטר או מ-this.data (כמו trade_plans)
            const dataToRender = tradingAccounts || this.data || [];
            
            const tbody = document.querySelector('#accountsTableBody');
            if (!tbody) {
                console.error('❌ לא נמצא tbody בטבלה');
                return;
            }


            // ניקוי הטבלה
            tbody.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="8" class="text-center">אין נתונים להצגה</td>';
                tbody.appendChild(row);
                return;
            }

            // הוספת שורות נתונים
            dataToRender.forEach(tradingAccount => {
                const row = this.createTableRow(tradingAccount);
                tbody.appendChild(row);
            });
            
            // אתחול כפתורי פעולה (כמו cash_flows)
            if (typeof window.initializeButtonIcons === 'function') {
                setTimeout(() => {
                    window.initializeButtonIcons();
                }, 50);
            }

        } catch (error) {
            console.error('❌ שגיאה בעדכון הטבלה:', error);
        }
    }

    /**
     * יצירת שורה בטבלה
     */
    createTableRow(tradingAccount) {
        const row = document.createElement('tr');
        
        // שימוש במערכת מיפוי טבלאות אם זמינה
        let nameValue, typeValue, currencyValue, balanceValue, statusValue, createdValue;
        
        // שימוש בערכים ישירות מהאובייקט (כמו trade_plans)
        nameValue = tradingAccount.name || '-';
        typeValue = tradingAccount.type || 'רגיל';
        balanceValue = tradingAccount.cashBalance || tradingAccount.cash_balance || 0;
        statusValue = tradingAccount.status || '-';
        createdValue = tradingAccount.created_at || '-';

        // רינדור מטבע - רק סימן (לא שם מלא)
        const currencyDisplay = tradingAccount.currency_symbol || '-';

        // קבלת סמל המטבע לשימוש ביתרה
        const currencySymbol = tradingAccount.currency_symbol || '$';

        // רינדור יתרה - רק צבע טקסט (ללא רקע/מסגרת)
        const balanceClass = balanceValue > 0 ? 'numeric-value-positive' : 
                            (balanceValue < 0 ? 'numeric-value-negative' : '');
        const formattedBalance = `<span class="${balanceClass}">${balanceValue.toFixed(2)} ${currencySymbol}</span>`;
        
        // רינדור תאריך באמצעות FieldRendererService (כמו trade_plans + cash_flows)
        const formattedDate = window.FieldRendererService ? 
            window.FieldRendererService.renderDate(createdValue) : 
            (createdValue && window.formatDate ? window.formatDate(createdValue) : 'לא מוגדר');
        
        // רינדור status באמצעות FieldRendererService
        const statusBadge = window.FieldRendererService ? 
            window.FieldRendererService.renderStatus(statusValue, 'account') : 
            `<span class="badge">${statusValue}</span>`;

        row.innerHTML = `
            <td class="col-name">${nameValue}</td>
            <td class="col-type">${typeValue}</td>
            <td class="col-currency">${currencyDisplay}</td>
            <td class="col-balance">${formattedBalance}</td>
            <td class="col-status">${statusBadge}</td>
            <td class="col-created">${formattedDate}</td>
            <td class="col-actions actions-cell">
                ${window.createActionsMenu ? window.createActionsMenu([
                    window.createLinkButton ? window.createLinkButton(`if (window.showLinkedItemsModal) { window.showLinkedItemsModal([], 'trading_account', ${tradingAccount.id}); }`) : '',
                    window.createEditButton ? window.createEditButton(`window.tradingAccountsController.showEditModal(${tradingAccount.id})`) : '',
                    window.createDeleteButton ? window.createDeleteButton(`window.tradingAccountsController.deleteAccount(${tradingAccount.id})`) : ''
                ], tradingAccount.id) : ''}
            </td>
        `;

        return row;
    }

    /**
     * עדכון סטטיסטיקות - באמצעות StatisticsCalculator
     */
    updateStatistics(tradingAccounts = null) {
        // קבלת נתונים מפרמטר או מ-this.data (כמו cash_flows)
        const dataToCalc = tradingAccounts || this.data || [];
        
        if (!dataToCalc || !Array.isArray(dataToCalc)) {
            console.warn('⚠️ אין נתונים לעדכון סטטיסטיקות');
            return;
        }

        try {
            // חישוב סטטיסטיקות באמצעות StatisticsCalculator
            const stats = window.StatisticsCalculator ? {
                totalAccounts: window.StatisticsCalculator.countRecords(dataToCalc),
                activeAccounts: window.StatisticsCalculator.countRecords(dataToCalc, account => account.status === 'open'),
                totalBalance: window.StatisticsCalculator.calculateSum(dataToCalc, account => parseFloat(account.cashBalance || account.cash_balance) || 0)
            } : {
                // Fallback
                totalAccounts: dataToCalc.length,
                activeAccounts: dataToCalc.filter(account => account.status === 'open').length,
                totalBalance: dataToCalc.reduce((sum, account) => {
                    const balance = parseFloat(account.cashBalance || account.cash_balance) || 0;
                    return sum + balance;
                }, 0)
            };

            // עדכון אלמנטים ב-DOM
            this.updateStatElement('totalAccounts', stats.totalAccounts);
            this.updateStatElement('activeAccounts', stats.activeAccounts);
            this.updateStatElement('totalBalance', `$${stats.totalBalance.toLocaleString()}`);


        } catch (error) {
            console.error('❌ שגיאה בעדכון סטטיסטיקות:', error);
        }
    }

    /**
     * עדכון אלמנט סטטיסטיקה
     */
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠️ אלמנט לא נמצא: ${elementId}`);
        }
    }

    /**
     * ניהול מצב סקשנים באמצעות מערכת כלליות
     */
    toggleSection(sectionId) {
        // שימוש במערכת כלליות אם זמינה
        if (window.toggleSection && typeof window.toggleSection === 'function') {
            return window.toggleSection(sectionId);
        }
        
        // fallback מקומי
        const section = document.getElementById(sectionId);
        if (section) {
            const isHidden = section.classList.contains('hidden');
            section.classList.toggle('hidden', !isHidden);
            
            // שמירת מצב במטמון מאוחד
            if (window.UnifiedCacheManager) {
                window.UnifiedCacheManager.save(`accounts_ui_state_${sectionId}`, !isHidden, {
                    layer: 'localStorage',
                    ttl: null // persistent
                });
            }
        }
    }

    /**
     * הגדרת event listeners
     */
    setupEventListeners() {
        
        // Event listeners בסיסיים
        this.setupBasicEventListeners();
        
        // Event listeners ספציפיים לחשבונות
        this.setupTradingAccountsHandlers();
    }

    /**
     * הגדרת event listeners בסיסיים
     */
    setupBasicEventListeners() {
        // Refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    /**
     * הגדרת event handlers ספציפיים לחשבונות מסחר
     */
    setupTradingAccountsHandlers() {
        
        // Export handlers to global scope for unified initialization
        window.setupTradingAccountsHandlers = () => {
        };
    }

    /**
     * רענון נתונים
     */
    async refreshData() {
        
        // ניקוי מטמון
        if (window.UnifiedCacheManager) {
            await window.UnifiedCacheManager.remove('trading_accounts_data', {
                layer: 'localStorage'
            });
        }
        
        // טעינה מחדש
        await this.loadData();
        
        // הודעת הצלחה
        if (window.showSuccessNotification) {
            window.showSuccessNotification('נתונים רוענו בהצלחה');
        }
    }

    /**
     * טיפול בלחיצה על פילטר
     */
    handleFilterClick(event) {
        const filterType = event.target.dataset.filter;
        
        // כאן ניתן להוסיף לוגיקת פילטרים
        // נכון לעכשיו, הפילטרים מנוהלים על ידי header-system.js
    }

    /**
     * הצגת מצב טעינה
     */
    showLoadingState() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    }

    /**
     * הסתרת מצב טעינה
     */
    hideLoadingState() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * הצגת שגיאה
     */
    showError(message) {
        console.error('❌ Error:', message);
        
        if (window.showErrorNotification) {
            window.showErrorNotification(message);
        }
    }

    /**
     * עדכון UI כללי
     */
    updateUI() {
        
        // עדכון טבלה
        this.updateTable();
        
        // עדכון סטטיסטיקות
        this.updateStatistics();
        
    }

    /**
     * הצגת מודל עריכה
     * לפי STANDARD_VALIDATION_GUIDE.md
     */
    async showEditModal(accountId) {
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error('❌ Account not found:', accountId);
            return;
        }
        
        // ניקוי ולידציה
        if (window.clearValidation) {
            window.clearValidation('editAccountForm');
        }
        
        // טעינת מטבעות לפני מילוי הטופס
        await loadCurrenciesForEditAccount();
        
        // מילוי שדות המודל באמצעות DataCollectionService
        if (editAccountModalElement) {
            window.DataCollectionService.setFormData({
                id: { id: 'editAccountId', type: 'int' },
                name: { id: 'editAccountName', type: 'text' },
                status: { id: 'editAccountStatus', type: 'text' },
                currency_id: { id: 'editAccountCurrency', type: 'int' },
                cash_balance: { id: 'editAccountBalance', type: 'number' },
                notes: { id: 'editAccountDescription', type: 'text' }
            }, {
                id: account.id,
                name: account.name || '',
                status: account.status || '',
                currency_id: account.currency_id || account.currency || '',
                cash_balance: account.cashBalance || account.cash_balance || 0,
                notes: account.notes || ''
            });
            
            // פתיחת המודל
            if (editAccountModal) {
                editAccountModal.show();
            }
        }
    }

    /**
     * הצגת פרטים
     */
    showDetails(accountId) {
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error('❌ Account not found:', accountId);
            return;
        }
        
        // שימוש במערכת פרטי ישות אם זמינה
        if (typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('trading_account', account);
        } else {
            // fallback - הצגה בהתראה
            const currencyDisplay = account.currency_name ? 
                `${account.currency_name} (${account.currency_symbol || ''})` : 
                (account.currency_symbol || account.currency || '-');
            
            alert(`פרטי חשבון:\nשם: ${account.name}\nסטטוס: ${account.status}\nמטבע: ${currencyDisplay}\nיתרה: $${account.cashBalance || account.cash_balance}`);
        }
    }

    /**
     * מחיקת חשבון
     */
    async deleteAccount(accountId) {
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error('❌ Account not found:', accountId);
            return;
        }

        // 1) בדיקת מקושרים לפני מחיקה (כמו טיקרים)
        try {
            if (typeof window.checkLinkedItemsBeforeDeleteAccount === 'function') {
                const hasLinked = await window.checkLinkedItemsBeforeDeleteAccount(accountId);
                if (hasLinked) return; // מוצג חלון מקושרים והפעולה נעצרת
            }
        } catch (_) { /* שקט */ }

        // 2) דיאלוג אישור מערכת (fallback ל-confirm)
        let confirmed = true;
        if (typeof window.showConfirmationDialog === 'function') {
            confirmed = await new Promise(resolve => {
                window.showConfirmationDialog(
                    'מחיקת חשבון',
                    `האם אתה בטוח שברצונך למחוק את החשבון "${account.name}"?\nפעולה זו אינה ניתנת לביטול.`,
                    () => resolve(true),
                    () => resolve(false),
                    'danger'
                );
            });
        } else {
            confirmed = window.confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${account.name}"?`);
        }
        if (!confirmed) return;

        // 3) ביצוע מחיקה בפועל דרך פונקציה ייעודית (כמו performTickerDeletion)
        await performAccountDeletion(accountId, account.name);
    }
}

// ===== Linked Items helpers for accounts =====
window.checkLinkedItemsBeforeDeleteAccount = async function(accountId) {
    try {
        // שימוש ב-endpoint הכללי (entity_type='account')
        const resp = await fetch(`/api/linked-items/account/${accountId}`);
        if (!resp.ok) return false; // אם לא ניתן לבדוק – לא חוסם
        const data = await resp.json();
        const childEntities = data.child_entities || [];
        if (childEntities.length > 0) {
            if (typeof window.showLinkedItemsModal === 'function') {
                data.accountName = (window.tradingAccountsData || []).find(a => a.id === accountId)?.name || '';
                window.showLinkedItemsModal(data, 'trading_account', accountId, 'delete');
            } else if (typeof window.showWarningNotification === 'function') {
                window.showWarningNotification('לא ניתן למחוק חשבון עם פריטים מקושרים', 'בטל/סגור פריטים פתוחים לפני המחיקה');
            }
            return true;
        }
        return false;
    } catch (_) {
        return false;
    }
};

// ביצוע מחיקת חשבון בפועל עם טיפול תגובה סטנדרטי
async function performAccountDeletion(accountId, accountName = '') {
    try {
        const response = await fetch(`/api/trading-accounts/${accountId}`, { method: 'DELETE' });
        
        if (response.ok) {
            // הצלחה: אפשר להשתמש במטפל הסטנדרטי (רק במסלול הצלחה) או לבצע ידנית
            if (typeof window.handleApiResponseWithRefresh === 'function') {
                const handled = await window.handleApiResponseWithRefresh(response.clone(), {
                    loadDataFunction: async () => window.tradingAccountsController?.loadData?.(),
                    updateActiveFieldsFunction: null,
                    operationName: 'מחיקה',
                    itemName: 'החשבון',
                    successMessage: `החשבון ${accountName || ''} נמחק בהצלחה`
                });
                if (handled) return;
            }
            if (window.UnifiedCacheManager?.remove) await window.UnifiedCacheManager.remove('trading_accounts');
            await window.tradingAccountsController?.loadData?.();
            if (window.showSuccessNotification) window.showSuccessNotification('החשבון נמחק בהצלחה');
            return;
        }

        // ניסיון לקרוא גוף שגיאה כ-JSON (מבלי לשבור את הזרם)
        let errorData = null;
        try { errorData = await response.clone().json(); } catch(_) {}

        // אם השרת החזיר רשימת טריידים פתוחים - בנה נתוני מודל והצג במקום שגיאה
        const openTrades = errorData?.error?.open_trades;
        if (Array.isArray(openTrades) && openTrades.length > 0 && typeof window.showLinkedItemsModal === 'function') {
            const data = {
                entity_type: 'account',
                entity_id: accountId,
                accountName: accountName,
                child_entities: openTrades.map(t => ({
                    id: t.id,
                    type: 'trade',
                    title: 'טרייד',
                    description: `${t.ticker_symbol} • ${t.investment_type || ''}`.trim(),
                    created_at: t.created_at,
                    status: t.status
                })),
                parent_entities: [],
                total_child_count: openTrades.length,
                total_parent_count: 0,
                entity_details: { id: accountId, name: accountName }
            };
            window.showLinkedItemsModal(data, 'trading_account', accountId, 'delete');
            return;
        }

        // במקרה כשל – בדיקת מקושרים ולהציג מודל
        if ([400, 409, 422].includes(response.status)) {
            try {
                const resp = await fetch(`/api/linked-items/account/${accountId}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if ((data.child_entities || []).length > 0 && typeof window.showLinkedItemsModal === 'function') {
                        data.accountName = accountName;
                        window.showLinkedItemsModal(data, 'trading_account', accountId, 'delete');
                        return;
                    }
                }
            } catch (_) { /* שקט */ }
        }

        const errorText = (errorData && (errorData.error?.message || errorData.message)) || `HTTP ${response.status}`;
        if (window.showErrorNotification) window.showErrorNotification('שגיאה במחיקת החשבון', errorText);
    } catch (e) {
        console.error('❌ Error deleting account:', e);
        if (window.showErrorNotification) window.showErrorNotification('שגיאה במחיקת החשבון', e.message);
    }
}

// יצירת instance גלובלי - שני שמות לתאימות
window.tradingAccountsController = new TradingAccountsController();
window.TradingAccountsController = window.tradingAccountsController; // Alias for compatibility


// ===== פונקציות ולידציה סטנדרטיות =====

/**
 * ולידציה של טופס הוספת חשבון מסחר
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateTradingAccountForm() {
    return window.validateEntityForm('addAccountForm', [
        { id: 'accountName', name: 'שם חשבון' },
        { id: 'accountStatus', name: 'סטטוס' },
        { id: 'accountCurrency', name: 'מטבע' },
        { 
            id: 'accountBalance', 
            name: 'יתרה',
            validation: (value) => {
                const balance = parseFloat(value);
                if (isNaN(balance)) return 'יש להזין יתרה תקינה';
                return true;
            }
        }
    ]);
}

/**
 * ולידציה של טופס עריכת חשבון מסחר
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
function validateEditAccountForm() {
    return window.validateEntityForm('editAccountForm', [
        { id: 'editAccountName', name: 'שם חשבון' },
        { id: 'editAccountStatus', name: 'סטטוס' },
        { id: 'editAccountCurrency', name: 'מטבע' },
        { 
            id: 'editAccountBalance', 
            name: 'יתרה',
            validation: (value) => {
                const balance = parseFloat(value);
                if (isNaN(balance)) return 'יש להזין יתרה תקינה';
                return true;
            }
        }
    ]);
}

// ===== פונקציות טיפול במודלים =====

/**
 * פתיחת מודל הוספת חשבון עם ברירות מחדל
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function showAddAccountModal() {
    // 1. ניקוי הטופס באמצעות DataCollectionService
    window.DataCollectionService.resetForm('addAccountForm', true);

    // 2. הגדרת ברירות מחדל לוגיות
    window.DataCollectionService.setValue('accountStatus', 'open', 'text');
    window.DataCollectionService.setValue('accountBalance', '0', 'text');

    // 3. טעינת מטבעות עם ברירת מחדל מהעדפות
    await loadCurrenciesForAccount();

    // 4. הצגת המודל
    if (addAccountModal) {
        addAccountModal.show();
    }
}

/**
 * טעינת מטבעות לטופס הוספה עם ברירת מחדל מהעדפות
 */
async function loadCurrenciesForAccount() {
    await window.SelectPopulatorService.populateCurrenciesSelect('accountCurrency', {
        includeEmpty: true,
        emptyText: 'בחר מטבע...'
    });
}

/**
 * טעינת מטבעות לטופס עריכה
 */
async function loadCurrenciesForEditAccount() {
    await window.SelectPopulatorService.populateCurrenciesSelect('editAccountCurrency', {
        includeEmpty: true,
        emptyText: 'בחר מטבע...'
    });
}

/**
 * שמירת חשבון מסחר חדש
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function saveTradingAccount() {
    try {
        // 1. ולידציה של הטופס
        if (!validateTradingAccountForm()) {
            return;
        }
        
        // 2. איסוף נתונים מהטופס באמצעות DataCollectionService
        const formData = window.DataCollectionService.collectFormData({
            name: { id: 'accountName', type: 'text' },
            status: { id: 'accountStatus', type: 'text', default: 'open' },
            currency_id: { id: 'accountCurrency', type: 'int' },
            cash_balance: { id: 'accountBalance', type: 'number', default: 0 },
            notes: { id: 'accountDescription', type: 'text', default: '' }
        });

        // 5. שליחה לשרת וטיפול בתגובה באמצעות CRUDResponseHandler
        const response = await fetch('/api/trading-accounts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // טיפול בתגובה
        const result = await window.CRUDResponseHandler.handleSaveResponse(response, {
            modalId: 'addAccountModal',
            successMessage: 'חשבון המסחר נשמר בהצלחה',
            reloadFn: async () => {
                // ניקוי מטמון trading_accounts
                if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                    await window.UnifiedCacheManager.remove('trading_accounts');
                }
                // רענון טבלה
                if (window.tradingAccountsController && window.tradingAccountsController.loadData) {
                    await window.tradingAccountsController.loadData();
                }
            },
            entityName: 'חשבון מסחר'
        });

    } catch (error) {
        console.error('Error saving trading account:', error);
        
        // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בשמירת חשבון מסחר', error.message);
        }
    }
}

/**
 * עדכון חשבון מסחר קיים
 * לפי STANDARD_VALIDATION_GUIDE.md
 */
async function updateTradingAccount() {
    try {
        // 1. ולידציה של הטופס
        if (!validateEditAccountForm()) {
            return;
        }
        
        // 2. איסוף נתונים מהטופס באמצעות DataCollectionService
        const accountId = window.DataCollectionService.getValue('editAccountId', 'int');
        const formData = window.DataCollectionService.collectFormData({
            name: { id: 'editAccountName', type: 'text' },
            status: { id: 'editAccountStatus', type: 'text' },
            currency_id: { id: 'editAccountCurrency', type: 'int' },
            cash_balance: { id: 'editAccountBalance', type: 'number', default: 0 },
            notes: { id: 'editAccountDescription', type: 'text', default: '' }
        });

        // 5. שליחה לשרת וטיפול בתגובה באמצעות CRUDResponseHandler
        const response = await fetch(`/api/trading-accounts/${accountId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // טיפול בתגובה
        const result = await window.CRUDResponseHandler.handleUpdateResponse(response, {
            modalId: 'editAccountModal',
            successMessage: 'חשבון המסחר עודכן בהצלחה',
            reloadFn: async () => {
                // ניקוי מטמון
                if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                    await window.UnifiedCacheManager.remove('trading_accounts');
                }
                // רענון טבלה
                if (window.tradingAccountsController && window.tradingAccountsController.loadData) {
                    await window.tradingAccountsController.loadData();
                }
            },
            entityName: 'חשבון מסחר'
        });

    } catch (error) {
        console.error('Error updating trading account:', error);
        
        // שגיאת JavaScript או Network - זו שגיאת מערכת אמיתית
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בעדכון חשבון מסחר', error.message);
        }
    }
}

// ===== ייצוא פונקציות גלובליות =====

// Export functions for unified initialization
window.updateTradingAccountsStatistics = function() {
    if (window.tradingAccountsController) {
        window.tradingAccountsController.updateStatistics();
    }
};

// Export validation functions
window.validateTradingAccountForm = validateTradingAccountForm;
window.validateEditAccountForm = validateEditAccountForm;

// Export modal functions
window.showAddAccountModal = showAddAccountModal;
window.loadCurrenciesForAccount = loadCurrenciesForAccount;
window.loadCurrenciesForEditAccount = loadCurrenciesForEditAccount;

// Export save/update functions
window.saveTradingAccount = saveTradingAccount;
window.updateTradingAccount = updateTradingAccount;

// אתחול אוטומטי אם DOM מוכן - הוסר כדי למנוע כפילות עם core-systems.js
// האתחול מתבצע דרך מערכת האתחול המאוחדת

