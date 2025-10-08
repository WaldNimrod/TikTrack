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

// ========================================
// פונקציות מודל הוספה
// ========================================

/**
 * הצגת מודל הוספת חשבון מסחר חדש
 */
function showAddAccountModal() {
    // ניקוי הטופס
    const form = document.getElementById('addAccountForm');
    if (form) {
        form.reset();
    }

    // ניקוי וולידציה
    if (window.clearValidation) {
        window.clearValidation('addAccountForm');
    }

    // הצגת המודל
    const modalElement = document.getElementById('addAccountModal');
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
        console.error('addAccountModal element not found');
    }
}

/**
 * הוספת חשבון מסחר חדש
 */
async function addAccount() {
    try {
        // איסוף נתונים מהטופס
        const formData = {
            name: document.getElementById('accountName').value,
            status: document.getElementById('accountStatus').value,
            currency_id: document.getElementById('accountCurrency').value,
            cash_balance: document.getElementById('accountBalance').value || 0,
            description: document.getElementById('accountDescription').value || null
        };

        // וידוא שדות חובה
        if (!formData.name || !formData.status || !formData.currency_id) {
            throw new Error('שדות חובה חסרים');
        }

        // שליחה לשרת
        const response = await fetch('/api/trading-accounts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // הצגת הודעת הצלחה
        if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('חשבון מסחר נוסף בהצלחה');
        }

        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAccountModal'));
        if (modal) {
            modal.hide();
        }

        // רענון הטבלה
        if (typeof loadTradingAccountsData === 'function') {
            loadTradingAccountsData();
        }

    } catch (error) {
        console.error('Error adding trading account:', error);
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בהוספת חשבון מסחר', error.message);
        }
    }
}

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
            console.log('🚀 Initializing Trading Accounts with Unified System...');
            
            // שלב 3: מערכות עמוד - אתחול ספציפי
            await this.initializePageSystems();
            
            // הגדרת event listeners
            this.setupEventListeners();
            
            // טעינת נתונים
            await this.loadData();
            
            // עדכון UI
            this.updateUI();
            
            this.initialized = true;
            console.log('✅ Trading Accounts initialized successfully');
            
        } catch (error) {
            console.error('Error initializing trading accounts page:', error);
            this.showError('שגיאה באתחול העמוד');
        }
    }

    /**
     * אתחול ספציפי לעמוד (שלב 3 במערכת האתחול)
     */
    async initializePageSystems() {
        console.log('📊 Initializing Trading Accounts Page Systems...');
        
        // טעינת נתוני חשבונות
        if (typeof window.getAccounts === 'function') {
            try {
                this.data = await window.getAccounts();
    } catch (error) {
                console.warn('Failed to load accounts data:', error);
                this.data = [];
    }
  } else {
            console.warn('window.getAccounts function not available');
            this.data = [];
        }
        
        // הגדרת event handlers ספציפיים
        this.setupTradingAccountsHandlers();
    }

    /**
     * אתחול fallback במקרה שמערכת מאוחדת לא זמינה
     */
    async fallbackInitialize() {
        console.log('⚠️ Using fallback initialization for Trading Accounts');
        
        // אתחול בסיסי ללא מערכת מאוחדת
        this.setupEventListeners();
        await this.loadData();
        this.updateUI();
        this.initialized = true;
    }

    /**
     * טעינת נתונים באמצעות מערכות כלליות
     */
    async loadData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            // שימוש ב-account-service הקיים עם Unified Cache
            if (typeof window.getAccounts === 'function') {
                this.data = await window.getAccounts();
      } else {
                console.warn('window.getAccounts function not available, using empty data');
                this.data = [];
            }
            
            // עדכון UI באמצעות מערכות כלליות
            this.updateTable();
            this.updateStatistics();

  } catch (error) {
            console.error('Error loading data:', error);
            this.data = []; // fallback to empty array
            this.updateTable();
            this.updateStatistics();
            this.showError('שגיאה בטעינת נתונים');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
  }
}

/**
     * עדכון הטבלה באמצעות מערכת מיפוי טבלאות
     */
    updateTable() {
        try {
            const tbody = document.querySelector('#accountsTable tbody');
            if (!tbody) {
                console.error('❌ לא נמצא tbody בטבלה');
                return;
            }

            // ניקוי הטבלה
            tbody.innerHTML = '';

            if (!this.data || this.data.length === 0) {
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
        let nameValue, currencyValue, statusValue, balanceValue, totalValueValue, plValue, notesValue;
        
        if (window.getColumnValue && window.tableMappings) {
            const tableType = 'accounts';
            nameValue = window.getColumnValue(tradingAccount, 1, tableType) || tradingAccount.name || '-';
            currencyValue = window.getColumnValue(tradingAccount, 2, tableType) || tradingAccount.currency || '-';
            statusValue = window.getColumnValue(tradingAccount, 3, tableType) || tradingAccount.status || '-';
            balanceValue = window.getColumnValue(tradingAccount, 4, tableType) || tradingAccount.cash_balance || 0;
            totalValueValue = window.getColumnValue(tradingAccount, 5, tableType) || tradingAccount.total_value || 0;
            plValue = window.getColumnValue(tradingAccount, 6, tableType) || tradingAccount.total_pl || 0;
            notesValue = window.getColumnValue(tradingAccount, 7, tableType) || tradingAccount.notes || '';
    } else {
            // fallback למיפוי ידני
            nameValue = tradingAccount.name || '-';
            currencyValue = tradingAccount.currency || '-';
            statusValue = tradingAccount.status || '-';
            balanceValue = tradingAccount.cash_balance || 0;
            totalValueValue = tradingAccount.total_value || 0;
            plValue = tradingAccount.total_pl || 0;
            notesValue = tradingAccount.notes || '';
        }

        // עיצוב ערכים
        const formattedBalance = typeof balanceValue === 'number' ? balanceValue.toLocaleString() : balanceValue;
        const formattedTotalValue = typeof totalValueValue === 'number' ? totalValueValue.toLocaleString() : totalValueValue;
        const formattedPL = typeof plValue === 'number' ? plValue.toLocaleString() : plValue;
        
        // צבע PL
        const plColor = typeof plValue === 'number' && plValue > 0 ? 'text-success' : 
                       typeof plValue === 'number' && plValue < 0 ? 'text-danger' : '';

        row.innerHTML = `
            <td>${tradingAccount.id || '-'}</td>
            <td>${nameValue}</td>
            <td>${currencyValue}</td>
            <td><span class="badge bg-secondary">${statusValue}</span></td>
            <td>${formattedBalance}</td>
            <td>${formattedTotalValue}</td>
            <td class="${plColor}">${formattedPL}</td>
            <td>${notesValue}</td>
            <td>
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
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
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
        const refreshBtn = document.getElementById('refreshBtn');
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
        const loadingEl = document.getElementById('loadingIndicator');
        if (loadingEl) {
            loadingEl.style.display = 'block';
  }
}

/**
     * הסתרת מצב טעינה
     */
    hideLoadingState() {
        const loadingEl = document.getElementById('loadingIndicator');
        if (loadingEl) {
            loadingEl.style.display = 'none';
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
}

// יצירת instance גלובלי
window.TradingAccountsController = new TradingAccountsController();

// Export functions for unified initialization
window.updateTradingAccountsStatistics = function() {
    if (window.TradingAccountsController) {
        window.TradingAccountsController.updateStatistics();
    }
};

// אתחול אוטומטי אם DOM מוכן - המתן למערכות כלליות
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM Content Loaded - Waiting for systems initialization...');
        // המתן למערכות כלליות להתאתחל
setTimeout(() => {
            console.log('🚀 Starting Trading Accounts initialization after delay');
            window.TradingAccountsController.initialize();
        }, 2000);
          });
      } else {
    console.log('🚀 DOM already ready - Waiting for systems initialization...');
    // המתן למערכות כלליות להתאתחל
    setTimeout(() => {
        console.log('🚀 Starting Trading Accounts initialization after delay');
        window.TradingAccountsController.initialize();
}, 2000);
}

    /**
     * הצגת מודל עריכה
     */
    showEditModal(accountId) {
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error(`❌ Account with ID ${accountId} not found`);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', `חשבון עם ID ${accountId} לא נמצא`);
            }
            return;
        }

        // מילוי הטופס
        document.getElementById('editAccountName').value = account.name || '';
        document.getElementById('editAccountStatus').value = account.status || '';
        document.getElementById('editAccountCurrency').value = account.currency_id || '';
        document.getElementById('editAccountBalance').value = account.cash_balance || 0;

        // הצגת המודל
        const modal = new bootstrap.Modal(document.getElementById('editAccountModal'));
        modal.show();
    }

    /**
     * הצגת פרטי חשבון
     */
    showDetails(accountId) {
        const account = this.data.find(a => a.id === accountId);
        if (!account) {
            console.error(`❌ Account with ID ${accountId} not found`);
            return;
        }

        // שימוש במערכת הצגת פרטים כללית אם זמינה
        if (typeof window.showEntityDetails === 'function') {
            window.showEntityDetails('trading_account', accountId, { mode: 'view' });
        } else {
            // הצגה פשוטה
            alert(`פרטי חשבון:\nשם: ${account.name}\nסטטוס: ${account.status}\nמטבע: ${account.currency}\nיתרה: ${account.cash_balance}`);
        }
    }

    /**
     * מחיקת חשבון
     */
    async deleteAccount(accountId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק חשבון זה?')) {
            return;
        }

        if (typeof window.showLoadingNotification === 'function') {
            window.showLoadingNotification('מוחק חשבון...');
        }

        try {
            const response = await fetch(`/api/trading-accounts/${accountId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            await this.loadData();
            
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('חשבון נמחק בהצלחה');
            }
        } catch (error) {
            console.error('❌ Failed to delete account:', error);
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה במחיקת חשבון', error.message);
            }
        } finally {
            if (typeof window.hideLoadingNotification === 'function') {
                window.hideLoadingNotification();
            }
        }
    }

console.log('✅ trading_accounts_new.js loaded successfully');
