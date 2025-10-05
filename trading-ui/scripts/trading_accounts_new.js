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
            if (!window.unifiedAppInit || !window.unifiedAppInit.isInitialized()) {
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
            this.data = await window.getAccounts();
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
            this.data = await window.getAccounts();
            
            // עדכון UI באמצעות מערכות כלליות
            this.updateTable();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Error loading data:', error);
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

// אתחול אוטומטי אם DOM מוכן
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM Content Loaded - Starting Trading Accounts initialization');
        window.TradingAccountsController.initialize();
    });
} else {
    console.log('🚀 DOM already ready - Starting Trading Accounts initialization');
    window.TradingAccountsController.initialize();
}

console.log('✅ trading_accounts_new.js loaded successfully');
