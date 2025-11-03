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
            label: 'מאפיין תנאי',
            required: true,
            options: [
                { value: 'price', label: 'מחיר' },
                { value: 'change', label: 'שינוי' },
                { value: 'ma', label: 'ממוצע נע' },
                { value: 'volume', label: 'נפח' }
            ],
            defaultValue: 'price'
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
            label: 'אופרטור תנאי',
            required: true,
            options: [
                { value: 'more_than', label: 'יותר מ-' },
                { value: 'less_than', label: 'פחות מ-' },
                { value: 'cross', label: 'חוצה' },
                { value: 'cross_up', label: 'חוצה למעלה' },
                { value: 'cross_down', label: 'חוצה למטה' },
                { value: 'change', label: 'שינוי' },
                { value: 'change_up', label: 'שינוי למעלה' },
                { value: 'change_down', label: 'שינוי למטה' },
                { value: 'equals', label: 'שווה' }
            ],
            defaultValue: 'more_than'
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
                { value: 'open', label: 'פתוח' },
                { value: 'closed', label: 'סגור' },
                { value: 'cancelled', label: 'מבוטל' }
            ],
            defaultValue: 'open'
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

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeAlertsModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(alertsModalConfig);
            console.log('✅ Alerts modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Alerts modal:', error);
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeAlertsModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeAlertsModal()) {
                    setTimeout(() => {
                        if (!initializeAlertsModal()) {
                            console.warn('⚠️ ModalManagerV2 not available for Alerts modal after retries');
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeAlertsModal()) {
                setTimeout(() => {
                    if (!initializeAlertsModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Alerts modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ייצוא לקונסול (לצורך debug)
window.alertsModalConfig = alertsModalConfig;


