/**
 * Trading Accounts Modal Configuration
 * קונפיגורציה למודל חשבונות מסחר
 * 
 * @file trading-accounts-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל חשבונות מסחר
const tradingAccountsModalConfig = {
    id: 'tradingAccountsModal',
    entityType: 'account',
    title: {
        add: 'הוספת חשבון מסחר',
        edit: 'עריכת חשבון מסחר'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'text',
            id: 'accountName',
            label: 'שם חשבון המסחר',
            required: true,
            placeholder: 'הכנס שם לחשבון המסחר'
        },
        {
            type: 'text',
            id: 'accountNumber',
            label: 'מספר חשבון מסחר',
            required: true,
            placeholder: 'הכנס מספר חשבון מסחר'
        },
        {
            type: 'select',
            id: 'accountType',
            label: 'סוג חשבון מסחר',
            required: true,
            options: [
                { value: 'individual', label: 'פרטי' },
                { value: 'corporate', label: 'עסקי' },
                { value: 'institutional', label: 'מוסדי' },
                { value: 'demo', label: 'דמו' }
            ],
            defaultValue: 'individual'
        },
        {
            type: 'select',
            id: 'accountCurrency',
            label: 'מטבע',
            required: true,
            options: [
                { value: 'USD', label: 'דולר אמריקאי (USD)' },
                { value: 'EUR', label: 'יורו (EUR)' },
                { value: 'GBP', label: 'לירה שטרלינג (GBP)' },
                { value: 'ILS', label: 'שקל ישראלי (ILS)' },
                { value: 'JPY', label: 'ין יפני (JPY)' },
                { value: 'CAD', label: 'דולר קנדי (CAD)' },
                { value: 'AUD', label: 'דולר אוסטרלי (AUD)' },
                { value: 'CHF', label: 'פרנק שוויצרי (CHF)' }
            ],
            defaultValue: 'USD'
        },
        {
            type: 'number',
            id: 'accountBalance',
            label: 'יתרה ראשונית',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00'
        },
        {
            type: 'select',
            id: 'accountStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'active', label: 'פעיל' },
                { value: 'inactive', label: 'לא פעיל' },
                { value: 'suspended', label: 'מושעה' },
                { value: 'closed', label: 'סגור' }
            ],
            defaultValue: 'active'
        },
        {
            type: 'textarea',
            id: 'accountNotes',
            label: 'הערות',
            required: false,
            rows: 3,
            placeholder: 'הכנס הערות נוספות על חשבון המסחר...'
        }
    ],
    validation: {
        accountName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        accountNumber: {
            required: true,
            minLength: 3,
            maxLength: 50
        },
        accountType: {
            required: true
        },
        accountCurrency: {
            required: true
        },
        accountBalance: {
            required: false,
            min: 0
        },
        accountStatus: {
            required: true
        },
        accountNotes: {
            required: false,
            maxLength: 500
        }
    },
    onSave: 'saveTradingAccount'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradingAccountsModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradingAccountsModalConfig);
            console.log('✅ Trading Accounts modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Trading Accounts modal:', error);
            return false;
        }
    }
    return false;
}

// Attempt to initialize immediately if ModalManagerV2 is available
if (window.ModalManagerV2) {
    console.log('✅ ModalManagerV2 available, initializing Trading Accounts modal...');
    if (initializeTradingAccountsModal()) {
        console.log('✅ Trading Accounts modal initialized successfully');
    } else {
        console.warn('⚠️ Failed to initialize Trading Accounts modal');
    }
} else {
    console.log('⚠️ ModalManagerV2 not yet available, waiting...');
    // Wait for ModalManagerV2 to be available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            waitForModalManager();
        });
    } else {
        waitForModalManager();
    }
}

// Helper function to wait for ModalManagerV2
function waitForModalManager() {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 200; // 200ms between attempts
    
    const checkInterval = setInterval(() => {
        attempts++;
        if (window.ModalManagerV2) {
            console.log(`✅ ModalManagerV2 available after ${attempts} attempts, initializing modal...`);
            clearInterval(checkInterval);
            if (initializeTradingAccountsModal()) {
                console.log('✅ Trading Accounts modal initialized successfully');
            } else {
                console.warn('⚠️ Failed to initialize Trading Accounts modal');
            }
        } else if (attempts >= maxAttempts) {
            console.warn(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts`);
            clearInterval(checkInterval);
        }
    }, interval);
}

// ייצוא לקונסול (לצורך debug)
window.tradingAccountsModalConfig = tradingAccountsModalConfig;
