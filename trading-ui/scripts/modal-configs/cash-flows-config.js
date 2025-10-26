/**
 * Cash Flows Modal Configuration - TikTrack Modal System
 * =====================================================
 * 
 * קונפיגורציה למודל תזרימי מזומנים
 * 
 * @version 1.0.0
 * @created January 12, 2025
 * @author TikTrack Development Team
 */

const cashFlowModalConfig = {
    id: 'cashFlowModal',
    entityType: 'cash_flow',
    title: {
        add: 'הוספת תזרים מזומנים',
        edit: 'עריכת תזרים מזומנים'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'select',
            id: 'cashFlowType',
            label: 'סוג תזרים',
            required: true,
            options: [
                { value: 'deposit', label: 'הפקדה' },
                { value: 'withdrawal', label: 'משיכה' },
                { value: 'transfer', label: 'העברה' },
                { value: 'fee', label: 'עמלה' },
                { value: 'dividend', label: 'דיבידנד' }
            ]
        },
        {
            type: 'number',
            id: 'cashFlowAmount',
            label: 'סכום',
            required: true,
            min: 0.01,
            step: 0.01
        },
        {
            type: 'select',
            id: 'cashFlowCurrency',
            label: 'מטבע',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        },
        {
            type: 'select',
            id: 'cashFlowAccount',
            label: 'חשבון מסחר',
            required: true,
            defaultFromPreferences: true // ברירת מחדל מהעדפות
        },
        {
            type: 'date',
            id: 'cashFlowDate',
            label: 'תאריך תזרים',
            required: true,
            dateTime: true,
            defaultValue: 'today' // ברירת מחדל היום
        },
        {
            type: 'text',
            id: 'cashFlowDescription',
            label: 'תיאור',
            placeholder: 'תיאור התזרים'
        },
        {
            type: 'select',
            id: 'cashFlowSource',
            label: 'מקור',
            required: true,
            options: [
                { value: 'manual', label: 'ידני' },
                { value: 'IBKR-tradelog-csv', label: 'IBKR CSV' },
                { value: 'IBKR-api', label: 'IBKR API' }
            ],
            defaultValue: 'manual'
        },
        {
            type: 'text',
            id: 'cashFlowExternalId',
            label: 'מזהה חיצוני',
            placeholder: 'מזהה חיצוני (אופציונלי)',
            defaultValue: '0',
            disabled: true // מושבת כל עוד המקור הוא ידני
        },
        {
            type: 'select',
            id: 'cashFlowTrade',
            label: 'קישור לטרייד',
            includeEmpty: true,
            emptyText: 'בחר טרייד (אופציונלי)'
        },
        {
            type: 'select',
            id: 'cashFlowTradePlan',
            label: 'קישור לתוכנית השקעה',
            includeEmpty: true,
            emptyText: 'בחר תוכנית השקעה (אופציונלי)'
        }
    ],
    validation: {
        cashFlowAmount: { 
            required: true, 
            min: 0.01 
        },
        cashFlowType: { 
            required: true 
        },
        cashFlowCurrency: { 
            required: true 
        },
        cashFlowAccount: { 
            required: true 
        },
        cashFlowDate: { 
            required: true 
        },
        cashFlowSource: { 
            required: true 
        }
    },
    onSave: 'saveCashFlow'
};

// יצירת המודל כאשר הקובץ נטען
document.addEventListener('DOMContentLoaded', () => {
    if (window.ModalManagerV2) {
        try {
            window.ModalManagerV2.createCRUDModal(cashFlowModalConfig);
            console.log('Cash Flow Modal created successfully');
        } catch (error) {
            console.error('Error creating Cash Flow Modal:', error);
        }
    }
});

// ייצוא הקונפיגורציה למרחב הגלובלי
window.cashFlowModalConfig = cashFlowModalConfig;
