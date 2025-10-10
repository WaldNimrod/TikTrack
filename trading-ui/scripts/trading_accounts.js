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

console.log('📁 trading_accounts_new.js נטען - גרסה חדשה עם מערכות כלליות');

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
document.addEventListener('DOMContentLoaded', () => {
    addAccountModalElement = document.getElementById('addAccountModal');
    editAccountModalElement = document.getElementById('editAccountModal');
    loadingIndicator = document.getElementById('loadingIndicator');
    refreshBtn = document.getElementById('refreshBtn');
    accountCurrencySelect = document.getElementById('accountCurrency');
    editAccountCurrencySelect = document.getElementById('editAccountCurrency');
    
    if (addAccountModalElement) addAccountModal = new bootstrap.Modal(addAccountModalElement);
    if (editAccountModalElement) editAccountModal = new bootstrap.Modal(editAccountModalElement);
});

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
            console.log('✅ Data already loading or loaded, skipping...');
            return;
        }
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // שימוש ב-account-service הקיים עם Unified Cache
            console.log('📊 Loading data from getAccounts...');
            this.data = await window.getAccounts();
            console.log('📊 Data loaded:', this.data);
            
            // עדכון UI באמצעות מערכות כלליות
            this.updateTable();
            this.updateStatistics();
            
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
    updateTable() {
        try {
            const tbody = document.querySelector('#accountsTableBody');
            if (!tbody) {
                console.error('❌ לא נמצא tbody בטבלה');
                return;
            }

            console.log('📊 updateTable called - data length:', this.data ? this.data.length : 'undefined');
            console.log('📊 updateTable data:', this.data);

            // ניקוי הטבלה
            tbody.innerHTML = '';

            if (!this.data || this.data.length === 0) {
                console.log('📊 No data to display');
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="8" class="text-center">אין נתונים להצגה</td>';
                tbody.appendChild(row);
                return;
            }

            // הוספת שורות נתונים
            this.data.forEach(tradingAccount => {
                const row = this.createTableRow(tradingAccount);
                tbody.appendChild(row);
            });

            console.log(`✅ טבלה עודכנה עם ${this.data.length} חשבונות מסחר`);

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
        
        if (window.getColumnValue && window.tableMappings) {
            const tableType = 'accounts';
            nameValue = window.getColumnValue(tradingAccount, 1, tableType) || tradingAccount.name || '-';
            typeValue = tradingAccount.type || 'רגיל'; // סוג החשבון
            
            // תצוגת מטבע: שם מלא (סמל) או סמל בלבד
            if (tradingAccount.currency_name && tradingAccount.currency_symbol) {
                currencyValue = `${tradingAccount.currency_name} (${tradingAccount.currency_symbol})`;
            } else if (tradingAccount.currency_symbol) {
                currencyValue = tradingAccount.currency_symbol;
            } else if (tradingAccount.currency_name) {
                currencyValue = tradingAccount.currency_name;
            } else {
                currencyValue = window.getColumnValue(tradingAccount, 2, tableType) || tradingAccount.currency || '-';
            }
            
            balanceValue = window.getColumnValue(tradingAccount, 4, tableType) || tradingAccount.cashBalance || tradingAccount.cash_balance || 0;
            statusValue = window.getColumnValue(tradingAccount, 3, tableType) || tradingAccount.status || '-';
            createdValue = tradingAccount.created_at || '-';
        } else {
            // fallback למיפוי ידני
            nameValue = tradingAccount.name || '-';
            typeValue = tradingAccount.type || 'רגיל';
            
            // תצוגת מטבע: שם מלא (סמל) או סמל בלבד
            if (tradingAccount.currency_name && tradingAccount.currency_symbol) {
                currencyValue = `${tradingAccount.currency_name} (${tradingAccount.currency_symbol})`;
            } else if (tradingAccount.currency_symbol) {
                currencyValue = tradingAccount.currency_symbol;
            } else if (tradingAccount.currency_name) {
                currencyValue = tradingAccount.currency_name;
            } else {
                currencyValue = tradingAccount.currency || '-';
            }
            
            balanceValue = tradingAccount.cashBalance || tradingAccount.cash_balance || 0;
            statusValue = tradingAccount.status || '-';
            createdValue = tradingAccount.created_at || '-';
        }

        // עיצוב ערכים
        const formattedBalance = typeof balanceValue === 'number' ? `$${balanceValue.toLocaleString()}` : balanceValue;
        
        // עיצוב תאריך
        let formattedDate = '-';
        if (createdValue && createdValue !== '-') {
            try {
                const date = new Date(createdValue);
                formattedDate = date.toLocaleDateString('he-IL');
            } catch (e) {
                formattedDate = createdValue;
            }
        }
        
        // תרגום סטטוס לעברית
        const translatedStatus = window.translateAccountStatus ? 
            window.translateAccountStatus(statusValue) : statusValue;
        
        // קבלת צבעים דינמיים מההעדפות
        let statusColor = '#6c757d'; // ברירת מחדל
        let statusBgColor = 'rgba(108, 117, 125, 0.1)';
        
        if (window.getStatusColor && window.getStatusBackgroundColor) {
            statusColor = window.getStatusColor(statusValue, 'medium');
            statusBgColor = window.getStatusBackgroundColor(statusValue);
        } else {
            // fallback לצבעים בסיסיים
            const fallbackColors = {
                'open': { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' },
                'closed': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)' },
                'cancelled': { color: '#dc3545', bg: 'rgba(220, 53, 69, 0.1)' }
            };
            const colors = fallbackColors[statusValue] || fallbackColors['closed'];
            statusColor = colors.color;
            statusBgColor = colors.bg;
        }

        row.innerHTML = `
            <td class="col-name">${nameValue}</td>
            <td class="col-type">${typeValue}</td>
            <td class="col-currency">${currencyValue}</td>
            <td class="col-balance">${formattedBalance}</td>
            <td class="col-status">
                <span class="badge" style="background-color: ${statusBgColor}; color: ${statusColor}; border: 1px solid ${statusColor};">
                    ${translatedStatus}
                </span>
            </td>
            <td class="col-created">${formattedDate}</td>
            <td class="col-actions actions-cell">
                <button class="btn btn-sm btn-outline-primary" onclick="window.tradingAccountsController.showEditModal(${tradingAccount.id})" title="עריכה">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="window.tradingAccountsController.showDetails(${tradingAccount.id})" title="פרטים">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="window.tradingAccountsController.deleteAccount(${tradingAccount.id})" title="מחיקה">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    /**
     * עדכון סטטיסטיקות
     */
    updateStatistics() {
        if (!this.data || !Array.isArray(this.data)) {
            console.warn('⚠️ אין נתונים לעדכון סטטיסטיקות');
            return;
        }

        try {
            const totalAccounts = this.data.length;
            const activeAccounts = this.data.filter(account => account.status === 'open').length;
            const openAccounts = this.data.filter(account => account.status === 'open').length;
            const totalBalance = this.data.reduce((sum, account) => {
                const balance = parseFloat(account.cash_balance) || 0;
                return sum + balance;
            }, 0);

            // עדכון אלמנטים ב-DOM
            this.updateStatElement('totalAccounts', totalAccounts);
            this.updateStatElement('activeAccounts', activeAccounts);
            this.updateStatElement('openAccounts', openAccounts);
            this.updateStatElement('totalBalance', `$${totalBalance.toLocaleString()}`);

            console.log('📊 סטטיסטיקות עודכנו:', { totalAccounts, activeAccounts, openAccounts, totalBalance });

        } catch (error) {
            console.error('❌ שגיאה בעדכון סטטיסטיקות:', error);
        }
    }

    /**
     * עדכון אלמנט סטטיסטיקה
     */
    updateStatElement(elementId, value) {
        window.DataCollectionService.setValue(elementId, value, 'text');
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
        console.log('🔧 Setting up event listeners...');
        
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
        console.log('💼 Setting up Trading Accounts specific handlers...');
        
        // Export handlers to global scope for unified initialization
        window.setupTradingAccountsHandlers = () => {
            console.log('💼 Trading Accounts handlers setup complete');
        };
    }

    /**
     * רענון נתונים
     */
    async refreshData() {
        console.log('🔄 Refreshing data...');
        
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
        console.log('🔍 Filter clicked:', filterType);
        
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
        console.log('🎨 Updating UI...');
        
        // עדכון טבלה
        this.updateTable();
        
        // עדכון סטטיסטיקות
        this.updateStatistics();
        
        console.log('✅ UI updated successfully');
    }

    /**
     * הצגת מודל עריכה
     * לפי STANDARD_VALIDATION_GUIDE.md
     */
    async showEditModal(accountId) {
        console.log('✏️ Showing edit modal for account:', accountId);
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
        console.log('👁️ Showing details for account:', accountId);
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
        console.log('🗑️ Deleting account:', accountId);
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error('❌ Account not found:', accountId);
            return;
        }
        
        // אישור מחיקה
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את החשבון "${account.name}"?`);
        if (!confirmed) {
            return;
        }
        
        try {
            // קריאה ל-API למחיקה
            const response = await fetch(`/api/trading-accounts/${accountId}`, {
                method: 'DELETE',
                headers: {

                // ניקוי מטמון trading_accounts
                if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                    await window.UnifiedCacheManager.remove('trading_accounts');
                    console.log('✅ מטמון trading_accounts נוקה אחרי מחיקה');
                }
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Account deleted successfully');
                
                // הסרה מהמערך המקומי
                this.data = this.data.filter(a => a.id !== accountId);
                
                // עדכון הטבלה
                this.updateTable();
                this.updateStatistics();
                
                // הצגת הודעת הצלחה
                if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('החשבון נמחק בהצלחה', `החשבון "${account.name}" נמחק מהמערכת`);
                }
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            console.error('❌ Error deleting account:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה במחיקת החשבון', error.message);
            } else {
                alert('שגיאה במחיקת החשבון: ' + error.message);
            }
        }
    }
}

// יצירת instance גלובלי - שני שמות לתאימות
window.tradingAccountsController = new TradingAccountsController();
window.TradingAccountsController = window.tradingAccountsController; // Alias for compatibility

console.log('✅ Trading Accounts Controller instance created:', window.tradingAccountsController);

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
    try {
        const response = await fetch('/api/currencies/');
        if (response.ok) {
            const result = await response.json();
            const currencies = result.data || result;
            if (accountCurrencySelect) {
                const select = accountCurrencySelect;
                select.innerHTML = '<option value="">בחר מטבע...</option>';
                
                // קבלת מטבע ברירת מחדל מהעדפות
                const defaultCurrency = await window.getPreference('default_currency');
                
                currencies.forEach((currency, index) => {
                    const option = document.createElement('option');
                    option.value = currency.id;
                    option.textContent = `${currency.symbol} - ${currency.name}`;
                    
                    // הגדרת ברירת מחדל:
                    // 1. אם יש העדפה - השתמש בה
                    // 2. אם אין - USD (id=1) או הראשון ברשימה
                    if (defaultCurrency && currency.id === parseInt(defaultCurrency)) {
                        option.selected = true;
                    } else if (!defaultCurrency && (currency.id === 1 || index === 0)) {
                        option.selected = true;
                    }
                    
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading currencies:', error);
    }
}

/**
 * טעינת מטבעות לטופס עריכה
 */
async function loadCurrenciesForEditAccount() {
    try {
        const response = await fetch('/api/currencies/');
        if (response.ok) {
            const result = await response.json();
            const currencies = result.data || result;
            if (editAccountCurrencySelect) {
                const select = editAccountCurrencySelect;
                select.innerHTML = '<option value="">בחר מטבע...</option>';
                
                currencies.forEach(currency => {
                    const option = document.createElement('option');
                    option.value = currency.id;
                    option.textContent = `${currency.symbol} - ${currency.name}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading currencies:', error);
    }
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

        // 5. שליחה לשרת
        const response = await fetch('/api/trading-accounts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // 6. טיפול בתגובה
        if (!response.ok) {
            const errorData = await response.json();
            
            // בדיקה אם זו שגיאת ולידציה (HTTP 400)
            if (response.status === 400) {
                // שגיאת ולידציה מהשרת
                if (typeof window.showSimpleErrorNotification === 'function') {
                    window.showSimpleErrorNotification('שגיאת ולידציה', errorData.message || 'נתונים לא תקינים');
                }
                return;
            }

        // ניקוי מטמון trading_accounts
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
            await window.UnifiedCacheManager.remove('trading_accounts');
            console.log('✅ מטמון trading_accounts נוקה אחרי הוספה');
        }
            
            // שגיאת מערכת אחרת (500, 404, וכו')
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 7. הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'חשבון המסחר נשמר בהצלחה');
        }

        // 8. סגירת המודל
        if (addAccountModal) {
            addAccountModal.hide();
        }

        // 9. רענון הטבלה
        if (window.tradingAccountsController && window.tradingAccountsController.loadData) {
            await window.tradingAccountsController.loadData();
        }

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

        // 5. שליחה לשרת
        const response = await fetch(`/api/trading-accounts/${accountId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // 6. טיפול בתגובה
        if (!response.ok) {
            const errorData = await response.json();
            
            // בדיקה אם זו שגיאת ולידציה (HTTP 400)
            if (response.status === 400) {
                // שגיאת ולידציה מהשרת
                if (typeof window.showSimpleErrorNotification === 'function') {
                    window.showSimpleErrorNotification('שגיאת ולידציה', errorData.message || 'נתונים לא תקינים');
                }
                return;
            }
            
            // שגיאת מערכת אחרת (500, 404, וכו')
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 7. הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', 'חשבון המסחר עודכן בהצלחה');
        }

        // 8. סגירת המודל
        if (editAccountModal) {
            editAccountModal.hide();
        }

        // 9. רענון הטבלה
        if (window.tradingAccountsController && window.tradingAccountsController.loadData) {
            await window.tradingAccountsController.loadData();
        }

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
console.log('🚀 Trading Accounts Controller ready - waiting for unified initialization');

console.log('✅ trading_accounts.js loaded successfully');
