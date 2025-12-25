/**
 * Trades Modal Configuration
 * קונפיגורציה למודל טריידים
 * 
 * @file trades-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeTradesModal() - Initialize trades modal

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
        // שורה ראשונה: טיקר + פרטי מחיר עדכני
        {
            type: 'select',
            id: 'tradeTicker',
            label: 'טיקר',
            fieldName: 'ticker_id',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'display',
            id: 'tradeTickerInfo',
            label: 'פרטי מחיר עדכני',
            rowClass: 'row',
            colClass: 'col-md-6',
            renderFn: 'renderTickerInfo'
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'tradeSeparator1'
        },
        // שורה שנייה: חשבון מסחר + סוג השקעה
        {
            type: 'select',
            id: 'tradeAccount',
            label: 'חשבון מסחר',
            fieldName: 'trading_account_id',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...',
            defaultFromPreferences: true,
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'tradeType',
            label: 'סוג השקעה',
            fieldName: 'investment_type',
            required: true,
            options: [
                { value: 'swing', label: 'סווינג - מסחר לטווח קצר עד בינוני' },
                { value: 'investment', label: 'השקעה - השקעה ארוכת טווח' },
                { value: 'passive', label: 'פאסיבי - השקעה פאסיבית ללא פעילות מסחרית' }
            ],
            defaultValue: 'swing',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שלישית: צד + סטטוס
        {
            type: 'select',
            id: 'tradeSide',
            label: 'צד',
            fieldName: 'side',
            required: true,
            options: [
                { value: 'Long', label: 'לונג (Long)' },
                { value: 'Short', label: 'שורט (Short)' }
            ],
            defaultValue: 'Long',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'tradeStatus',
            label: 'סטטוס',
            fieldName: 'status',
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
        // שורה רביעית: כמות + מחיר כניסה
        {
            type: 'number',
            id: 'tradeQuantity',
            label: 'כמות',
            fieldName: 'quantity',
            required: true,
            min: 1,
            step: 0.1,
            placeholder: 'הכנס כמות...',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'tradeEntryPrice',
            label: 'מחיר כניסה',
            fieldName: 'entry_price',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'מחיר הכניסה - מתעדכן אוטומטית לאחר בחירת טיקר'
        },
        // שורה חמישית: Stop Loss + Take Profit
        {
            type: 'number',
            id: 'tradeStopLoss',
            label: 'Stop Loss',
            fieldName: 'stop_price',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...',
            rowClass: 'row',
            colClass: 'col-md-6',
            labelStyle: 'color: var(--numeric-negative-medium);'
        },
        {
            type: 'number',
            id: 'tradeTakeProfit',
            label: 'Take Profit',
            fieldName: 'target_price',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Take Profit...',
            rowClass: 'row',
            colClass: 'col-md-6',
            labelStyle: 'color: var(--numeric-positive-medium);'
        },
        {
            type: 'number',
            id: 'tradeStopLossPercent',
            label: 'Stop Loss (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'אחוז סטופ...',
            rowClass: 'row',
            colClass: 'col-md-6',
            labelStyle: 'color: var(--numeric-negative-medium);',
            description: 'אחוז סטופ ביחס למחיר הכניסה'
        },
        {
            type: 'number',
            id: 'tradeTakeProfitPercent',
            label: 'Take Profit (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'אחוז יעד...',
            rowClass: 'row',
            colClass: 'col-md-6',
            labelStyle: 'color: var(--numeric-positive-medium);',
            description: 'אחוז יעד ביחס למחיר הכניסה'
        },
        // שורה שישית: תאריך כניסה
        {
            type: 'datetime-local',
            id: 'tradeEntryDate',
            label: 'תאריך כניסה',
            fieldName: 'entry_date',
            required: false,
            description: 'ברירת מחדל: היום',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שביעית: תגיות
        {
            type: 'select',
            id: 'tradeTags',
            label: 'תגיות',
            fieldName: 'tag_ids',
            required: false,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר תגיות...',
            multiple: true,
            rowClass: 'row',
            colClass: 'col-md-12'
        },
        // שורה שמינית: הערות
        {
            type: 'rich-text',
            id: 'tradeNotes',
            label: 'הערות',
            fieldName: 'notes',
            required: false,
            placeholder: 'הכנס הערות נוספות על הטרייד...',
            toolbar: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': ['right', 'center', 'left', 'justify'] }],
                [{ 'direction': 'rtl' }, { 'direction': 'ltr' }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ],
            rowClass: 'row',
            colClass: 'col-md-12'
        }
    ],
    // REMOVED: validation property - Validation is handled by centralized validation system (validation-utils.js)
    // The system automatically validates fields based on HTML [required] attribute and input types
    // Field required status is set via field.required property in the fields array above
    onSave: 'saveTrade'
};

let tradesConfigWarned = false;

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradesModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradesModalConfig);
            window.Logger?.debug?.('✅ Trades modal created successfully', { page: 'trades-config' });
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
