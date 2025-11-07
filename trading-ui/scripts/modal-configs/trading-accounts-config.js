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
        // שורה ראשונה: שם החשבון + מטבע
        {
            type: 'text',
            id: 'accountName',
            label: 'שם החשבון',
            required: true,
            placeholder: 'הכנס שם לחשבון המסחר',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'accountCurrency',
            label: 'מטבע',
            required: true,
            defaultFromPreferences: true, // ברירת מחדל מהעדפות
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שנייה: יתרת פתיחה + סטטוס
        {
            type: 'number',
            id: 'accountOpeningBalance',
            label: 'יתרת פתיחה',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00',
            description: 'יתרת פתיחה במטבע הבסיס של החשבון בלבד. שאר מטבעות מתחילים מ-0.',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'accountStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'open', label: 'פתוח' },
                { value: 'closed', label: 'סגור' },
                { value: 'cancelled', label: 'מבוטל' }
            ],
            defaultValue: 'open',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה אחרונה: הערות (בשורה מלאה) - Rich Text Editor
        {
            type: 'rich-text',
            id: 'accountNotes',
            label: 'הערות',
            required: false,
            placeholder: 'הכנס הערות נוספות על החשבון...',
            maxLength: 5000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס הערות נוספות על החשבון...',
                toolbar: [
                    [{ 'header': [2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': ['right', 'center', 'left', 'justify'] }],
                    [{ 'direction': 'rtl' }, { 'direction': 'ltr' }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                ]
            }
        }
    ],
    validation: {
        accountName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        accountCurrency: {
            required: true
        },
        accountOpeningBalance: {
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
