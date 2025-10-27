/**
 * Alerts Modal Configuration
 * קונפיגורציה למודל התראות
 * 
 * @file alerts-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל התראות
const alertsModalConfig = {
    id: 'alertsModal',
    entityType: 'alert',
    title: {
        add: 'הוספת התראה',
        edit: 'עריכת התראה'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'select',
            id: 'alertTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...'
        },
        {
            type: 'text',
            id: 'alertName',
            label: 'שם ההתראה',
            required: true,
            placeholder: 'הכנס שם להתראה',
            maxLength: 100
        },
        {
            type: 'select',
            id: 'alertType',
            label: 'סוג התראה',
            required: true,
            options: [
                { value: 'price_above', label: 'מחיר מעל' },
                { value: 'price_below', label: 'מחיר מתחת' },
                { value: 'volume_spike', label: 'עלייה חדה בנפח' },
                { value: 'moving_average', label: 'ממוצע נע' },
                { value: 'rsi', label: 'RSI' },
                { value: 'macd', label: 'MACD' },
                { value: 'custom', label: 'מותאם אישית' }
            ],
            defaultValue: 'price_above'
        },
        {
            type: 'number',
            id: 'alertValue',
            label: 'ערך התראה',
            required: true,
            min: 0,
            step: 0.01,
            placeholder: 'הכנס ערך התראה...'
        },
        {
            type: 'select',
            id: 'alertCondition',
            label: 'תנאי',
            required: true,
            options: [
                { value: 'greater_than', label: 'גדול מ-' },
                { value: 'less_than', label: 'קטן מ-' },
                { value: 'equals', label: 'שווה ל-' },
                { value: 'crosses_above', label: 'חוצה מעל' },
                { value: 'crosses_below', label: 'חוצה מתחת' }
            ],
            defaultValue: 'greater_than'
        },
        {
            type: 'datetime-local',
            id: 'alertExpiry',
            label: 'תאריך תפוגה',
            required: false,
            description: 'השאר ריק להתראה ללא תפוגה'
        },
        {
            type: 'select',
            id: 'alertStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'active', label: 'פעילה' },
                { value: 'paused', label: 'מושהית' },
                { value: 'triggered', label: 'הופעלה' },
                { value: 'expired', label: 'פגה' },
                { value: 'cancelled', label: 'מבוטלת' }
            ],
            defaultValue: 'active'
        },
        {
            type: 'checkbox',
            id: 'alertEmail',
            label: 'שלח התראה במייל',
            required: false,
            defaultValue: false
        },
        {
            type: 'checkbox',
            id: 'alertSms',
            label: 'שלח התראה ב-SMS',
            required: false,
            defaultValue: false
        },
        {
            type: 'textarea',
            id: 'alertNotes',
            label: 'הערות',
            required: false,
            rows: 3,
            placeholder: 'הכנס הערות נוספות על ההתראה...',
            maxLength: 500
        }
    ],
    validation: {
        alertTicker: {
            required: true
        },
        alertName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        alertType: {
            required: true
        },
        alertValue: {
            required: true,
            min: 0
        },
        alertCondition: {
            required: true
        },
        alertExpiry: {
            required: false
        },
        alertStatus: {
            required: true
        },
        alertEmail: {
            required: false
        },
        alertSms: {
            required: false
        },
        alertNotes: {
            required: false,
            maxLength: 500
        }
    },
    onSave: 'saveAlert'
};

// יצירת המודל אם ModalManagerV2 זמין
if (window.ModalManagerV2) {
    try {
        window.ModalManagerV2.createCRUDModal(alertsModalConfig);
        console.log('✅ Alerts modal created successfully');
    } catch (error) {
        console.error('❌ Error creating Alerts modal:', error);
    }
} else {
    console.warn('⚠️ ModalManagerV2 not available for Alerts modal');
}

// ייצוא לקונסול (לצורך debug)
window.alertsModalConfig = alertsModalConfig;

