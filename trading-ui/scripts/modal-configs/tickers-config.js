/**
 * Tickers Modal Configuration
 * קונפיגורציה למודל טיקרים
 * 
 * @file tickers-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל טיקרים
const tickersModalConfig = {
    id: 'tickersModal',
    entityType: 'ticker',
    title: {
        add: 'הוספת טיקר',
        edit: 'עריכת טיקר'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'text',
            id: 'tickerSymbol',
            label: 'סמל הטיקר',
            required: true,
            placeholder: 'הכנס סמל טיקר (למשל: AAPL)',
            maxLength: 10
        },
        {
            type: 'text',
            id: 'tickerName',
            label: 'שם החברה',
            required: true,
            placeholder: 'הכנס שם החברה',
            maxLength: 100
        },
        {
            type: 'select',
            id: 'tickerType',
            label: 'סוג הטיקר',
            required: true,
            options: [
                { value: 'stock', label: 'מניה' },
                { value: 'etf', label: 'קרן נסחרת (ETF)' },
                { value: 'bond', label: 'אג"ח' },
                { value: 'commodity', label: 'סחורה' },
                { value: 'crypto', label: 'מטבע קריפטו' },
                { value: 'forex', label: 'מט"ח' },
                { value: 'index', label: 'מדד' }
            ],
            defaultValue: 'stock'
        },
        {
            type: 'select',
            id: 'tickerExchange',
            label: 'בורסה',
            required: true,
            options: [
                { value: 'NYSE', label: 'NYSE (ניו יורק)' },
                { value: 'NASDAQ', label: 'NASDAQ' },
                { value: 'AMEX', label: 'AMEX' },
                { value: 'OTC', label: 'OTC' },
                { value: 'TSX', label: 'TSX (טורונטו)' },
                { value: 'LSE', label: 'LSE (לונדון)' },
                { value: 'TASE', label: 'תל אביב' },
                { value: 'CRYPTO', label: 'בורסות קריפטו' },
                { value: 'FOREX', label: 'מט"ח' }
            ],
            defaultValue: 'NYSE'
        },
        {
            type: 'select',
            id: 'tickerCurrency',
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
                { value: 'CHF', label: 'פרנק שוויצרי (CHF)' },
                { value: 'BTC', label: 'ביטקוין (BTC)' },
                { value: 'ETH', label: 'אתריום (ETH)' }
            ],
            defaultValue: 'USD'
        },
        {
            type: 'text',
            id: 'tickerLogo',
            label: 'לוגו החברה (URL)',
            required: false,
            placeholder: 'https://example.com/logo.png',
            description: 'קישור לתמונת לוגו של החברה'
        },
        {
            type: 'select',
            id: 'tickerStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'active', label: 'פעיל' },
                { value: 'inactive', label: 'לא פעיל' },
                { value: 'suspended', label: 'מושעה' },
                { value: 'delisted', label: 'הוסרה מהמסחר' }
            ],
            defaultValue: 'active'
        },
        {
            type: 'textarea',
            id: 'tickerNotes',
            label: 'הערות',
            required: false,
            rows: 3,
            placeholder: 'הכנס הערות נוספות על הטיקר...',
            maxLength: 500
        }
    ],
    validation: {
        tickerSymbol: {
            required: true,
            minLength: 1,
            maxLength: 10,
            pattern: '^[A-Z0-9.-]+$'
        },
        tickerName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        tickerType: {
            required: true
        },
        tickerExchange: {
            required: true
        },
        tickerCurrency: {
            required: true
        },
        tickerLogo: {
            required: false,
            fileType: 'image',
            maxSize: '5MB'
        },
        tickerStatus: {
            required: true
        },
        tickerNotes: {
            required: false,
            maxLength: 500
        }
    },
    onSave: 'saveTicker'
};

// יצירת המודל אם ModalManagerV2 זמין
// יצירת המודל - מחכה ל-DOMContentLoaded
// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTickersModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tickersModalConfig);
            console.log('✅ Tickers modal created successfully');
            if (window.Logger) {
                window.Logger.debug('Tickers modal created successfully', { page: 'tickers' });
            }
            return true;
        } catch (error) {
            console.error('❌ Error creating Tickers modal:', error);
            if (window.Logger) {
                window.Logger.error('Error creating Tickers modal', { error: error.message, page: 'tickers' });
            }
            return false;
        }
    }
    return false;
}

// Attempt to initialize immediately if ModalManagerV2 is available
if (window.ModalManagerV2) {
    console.log('✅ ModalManagerV2 available, initializing Tickers modal...');
    if (initializeTickersModal()) {
        console.log('✅ Tickers modal initialized successfully');
    } else {
        console.warn('⚠️ Failed to initialize Tickers modal');
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
            console.log(`✅ ModalManagerV2 available after ${attempts} attempts, initializing Tickers modal...`);
            clearInterval(checkInterval);
            if (initializeTickersModal()) {
                console.log('✅ Tickers modal initialized successfully');
            } else {
                console.warn('⚠️ Failed to initialize Tickers modal');
            }
        } else if (attempts >= maxAttempts) {
            console.warn(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts`);
            clearInterval(checkInterval);
        }
    }, interval);
}

// ייצוא לקונסול (לצורך debug)
window.tickersModalConfig = tickersModalConfig;


