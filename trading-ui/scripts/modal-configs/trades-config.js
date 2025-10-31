/**
 * Trades Modal Configuration
 * קונפיגורציה למודל טריידים
 * 
 * @file trades-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל טריידים
const tradesModalConfig = {
    id: 'tradesModal',
    entityType: 'trade',
    title: {
        add: 'הוספת טרייד',
        edit: 'עריכת טרייד'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'select',
            id: 'tradeTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...'
        },
        {
            type: 'select',
            id: 'tradeAccount',
            label: 'חשבון מסחר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...'
        },
        {
            type: 'text',
            id: 'tradeName',
            label: 'שם הטרייד',
            required: true,
            placeholder: 'הכנס שם לטרייד',
            maxLength: 100
        },
        {
            type: 'select',
            id: 'tradeType',
            label: 'סוג טרייד',
            required: true,
            options: [
                { value: 'long', label: 'קנייה ארוכת טווח' },
                { value: 'short', label: 'מכירה בחסר' },
                { value: 'swing', label: 'מסחר תנודות' },
                { value: 'scalp', label: 'סקלפינג' },
                { value: 'position', label: 'פוזיציה' }
            ],
            defaultValue: 'long'
        },
        {
            type: 'number',
            id: 'tradeQuantity',
            label: 'כמות',
            required: true,
            min: 1,
            step: 1,
            placeholder: 'הכנס כמות...'
        },
        {
            type: 'number',
            id: 'tradeEntryPrice',
            label: 'מחיר כניסה',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...'
        },
        {
            type: 'number',
            id: 'tradeExitPrice',
            label: 'מחיר יציאה',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר יציאה...'
        },
        {
            type: 'number',
            id: 'tradeStopLoss',
            label: 'Stop Loss',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...'
        },
        {
            type: 'number',
            id: 'tradeTakeProfit',
            label: 'Take Profit',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Take Profit...'
        },
        {
            type: 'datetime-local',
            id: 'tradeEntryDate',
            label: 'תאריך כניסה',
            required: true
        },
        {
            type: 'datetime-local',
            id: 'tradeExitDate',
            label: 'תאריך יציאה',
            required: false,
            description: 'השאר ריק לטרייד פתוח'
        },
        {
            type: 'select',
            id: 'tradeStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'open', label: 'פתוח' },
                { value: 'closed', label: 'סגור' },
                { value: 'cancelled', label: 'מבוטל' }
            ],
            defaultValue: 'open'
        },
        {
            type: 'textarea',
            id: 'tradeNotes',
            label: 'הערות',
            required: false,
            rows: 4,
            placeholder: 'הכנס הערות נוספות על הטרייד...',
            maxLength: 1000
        }
    ],
    validation: {
        tradeTicker: {
            required: true
        },
        tradeAccount: {
            required: true
        },
        tradeName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        tradeType: {
            required: true
        },
        tradeQuantity: {
            required: true,
            min: 1
        },
        tradeEntryPrice: {
            required: true,
            min: 0.01
        },
        tradeExitPrice: {
            required: false,
            min: 0.01
        },
        tradeStopLoss: {
            required: false,
            min: 0.01
        },
        tradeTakeProfit: {
            required: false,
            min: 0.01
        },
        tradeEntryDate: {
            required: true
        },
        tradeExitDate: {
            required: false
        },
        tradeStatus: {
            required: true
        },
        tradeNotes: {
            required: false,
            maxLength: 1000
        }
    },
    onSave: 'saveTrade'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradesModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradesModalConfig);
            console.log('✅ Trades modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Trades modal:', error);
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeTradesModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeTradesModal()) {
                    setTimeout(() => {
                        if (!initializeTradesModal()) {
                            console.warn('⚠️ ModalManagerV2 not available for Trades modal after retries');
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeTradesModal()) {
                setTimeout(() => {
                    if (!initializeTradesModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Trades modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ייצוא לקונסול (לצורך debug)
window.tradesModalConfig = tradesModalConfig;
