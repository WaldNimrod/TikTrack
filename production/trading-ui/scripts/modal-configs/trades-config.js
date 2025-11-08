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
        // שדה תצוגה לנתוני שוק לפני כל השדות
        {
            type: 'display',
            id: 'tradeTickerInfoDisplay',
            label: 'נתוני שוק',
            description: 'מתעדכן אוטומטית לאחר בחירת טיקר',
            rowClass: 'row',
            colClass: 'col-12'
        },
        // שורה ראשונה: טיקר + חשבון מסחר
        {
            type: 'select',
            id: 'tradeTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'select',
            id: 'tradeAccount',
            label: 'חשבון מסחר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...',
            defaultFromPreferences: true, // ברירת מחדל מהעדפות
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        // שורה שנייה: סוג השקעה + סטטוס
        {
            type: 'select',
            id: 'tradeType',
            label: 'סוג השקעה',
            required: true,
            options: [
                { value: 'swing', label: 'סווינג - מסחר לטווח קצר עד בינוני' },
                { value: 'investment', label: 'השקעה - השקעה ארוכת טווח' },
                { value: 'passive', label: 'פאסיבי - השקעה פאסיבית ללא פעילות מסחרית' }
            ],
            defaultValue: 'swing',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'המערכת תומכת בשלושת סוגי ההשקעה המאוחדים: Swing, Investment, Passive'
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
            defaultValue: 'open',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        // שורה שלישית: מחיר כניסה + תאריך כניסה
        {
            type: 'number',
            id: 'tradeEntryPrice',
            label: 'מחיר כניסה',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'datetime-local',
            id: 'tradeEntryDate',
            label: 'תאריך כניסה',
            required: true,
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        // שורה רביעית: כמות + סה"כ השקעה
        {
            type: 'number',
            id: 'tradeQuantity',
            label: 'כמות',
            required: true,
            min: 1,
            step: 1,
            placeholder: 'הכנס כמות...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'number',
            id: 'tradeTotalInvestment',
            label: 'סה״כ השקעה ($)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס סכום להשקעה...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'הסכום הכולל להשקעה בטרייד'
        },
        // שורה חמישית: Stop Loss + Take Profit
        {
            type: 'number',
            id: 'tradeStopLoss',
            label: 'Stop Loss',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'number',
            id: 'tradeTakeProfit',
            label: 'Take Profit',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Take Profit...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'number',
            id: 'tradeStopLossPercent',
            label: 'Stop Loss (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס אחוז סטופ...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'אחוז סטופ יחסית למחיר הכניסה'
        },
        {
            type: 'number',
            id: 'tradeTakeProfitPercent',
            label: 'Take Profit (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס אחוז יעד...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'אחוז יעד יחסית למחיר הכניסה'
        },
        // שורה אחרונה: הערות (בשורה מלאה) - Rich Text Editor
        {
            type: 'rich-text',
            id: 'tradeNotes',
            label: 'הערות',
            required: false,
            placeholder: 'הכנס הערות נוספות על הטרייד...',
            maxLength: 5000,
            options: {
                direction: 'rtl',
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
                ]
            }
        }
    ],
    validation: {
        tradeTicker: {
            required: true
        },
        tradeAccount: {
            required: true
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
        tradeStopLoss: {
            required: false,
            min: 0.01
        },
        tradeTakeProfit: {
            required: false,
            min: 0.01
        },
        tradeStopLossPercent: {
            required: false,
            min: 0.01
        },
        tradeTakeProfitPercent: {
            required: false,
            min: 0.01
        },
        tradeEntryDate: {
            required: true
        },
        tradeStatus: {
            required: true
        },
        tradeNotes: {
            required: false,
            maxLength: 5000
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
