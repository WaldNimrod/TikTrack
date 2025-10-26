/**
 * Trade Plans Modal Configuration
 * קונפיגורציה למודל תוכניות מסחר
 * 
 * @file trade-plans-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל תוכניות מסחר
const tradePlansModalConfig = {
    id: 'tradePlansModal',
    entityType: 'trade_plan',
    title: {
        add: 'הוספת תוכנית מסחר',
        edit: 'עריכת תוכנית מסחר'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'select',
            id: 'tradePlanTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...'
        },
        {
            type: 'text',
            id: 'tradePlanName',
            label: 'שם התוכנית',
            required: true,
            placeholder: 'הכנס שם לתוכנית',
            maxLength: 100
        },
        {
            type: 'select',
            id: 'tradePlanType',
            label: 'סוג תוכנית',
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
            id: 'tradePlanQuantity',
            label: 'כמות מתוכננת',
            required: true,
            min: 1,
            step: 1,
            placeholder: 'הכנס כמות...'
        },
        {
            type: 'number',
            id: 'tradePlanEntryPrice',
            label: 'מחיר כניסה מתוכנן',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...'
        },
        {
            type: 'number',
            id: 'tradePlanStopLoss',
            label: 'Stop Loss',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...'
        },
        {
            type: 'number',
            id: 'tradePlanTakeProfit',
            label: 'Take Profit',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Take Profit...'
        },
        {
            type: 'datetime-local',
            id: 'tradePlanEntryDate',
            label: 'תאריך כניסה מתוכנן',
            required: false,
            description: 'השאר ריק לכניסה מיידית'
        },
        {
            type: 'select',
            id: 'tradePlanStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'draft', label: 'טיוטה' },
                { value: 'active', label: 'פעילה' },
                { value: 'executed', label: 'מבוצעת' },
                { value: 'cancelled', label: 'מבוטלת' },
                { value: 'expired', label: 'פגה' }
            ],
            defaultValue: 'draft'
        },
        {
            type: 'textarea',
            id: 'tradePlanNotes',
            label: 'הערות',
            required: false,
            rows: 4,
            placeholder: 'הכנס הערות נוספות על התוכנית...',
            maxLength: 1000
        }
    ],
    validation: {
        tradePlanTicker: {
            required: true
        },
        tradePlanName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        tradePlanType: {
            required: true
        },
        tradePlanQuantity: {
            required: true,
            min: 1
        },
        tradePlanEntryPrice: {
            required: false,
            min: 0.01
        },
        tradePlanStopLoss: {
            required: false,
            min: 0.01
        },
        tradePlanTakeProfit: {
            required: false,
            min: 0.01
        },
        tradePlanEntryDate: {
            required: false
        },
        tradePlanStatus: {
            required: true
        },
        tradePlanNotes: {
            required: false,
            maxLength: 1000
        }
    },
    onSave: 'saveTradePlan'
};

// יצירת המודל אם ModalManagerV2 זמין
if (window.ModalManagerV2) {
    try {
        window.ModalManagerV2.createCRUDModal(tradePlansModalConfig);
        console.log('✅ Trade Plans modal created successfully');
    } catch (error) {
        console.error('❌ Error creating Trade Plans modal:', error);
    }
} else {
    console.warn('⚠️ ModalManagerV2 not available for Trade Plans modal');
}

// ייצוא לקונסול (לצורך debug)
window.tradePlansModalConfig = tradePlansModalConfig;
