/**
 * Executions Modal Configuration
 * קונפיגורציה למודל ביצועים
 * 
 * @file executions-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

// קונפיגורציה למודל ביצועים
const executionsModalConfig = {
    id: 'executionsModal',
    entityType: 'execution',
    title: {
        add: 'הוספת ביצוע',
        edit: 'עריכת ביצוע'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        {
            type: 'select',
            id: 'executionTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...'
        },
        {
            type: 'select',
            id: 'executionAccount',
            label: 'חשבון מסחר מסחר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...'
        },
        {
            type: 'select',
            id: 'executionType',
            label: 'סוג ביצוע',
            required: true,
            options: [
                { value: 'buy', label: 'קנייה' },
                { value: 'sell', label: 'מכירה' },
                { value: 'short', label: 'מכירה בחסר' },
                { value: 'cover', label: 'כיסוי' }
            ],
            defaultValue: 'buy'
        },
        {
            type: 'number',
            id: 'executionQuantity',
            label: 'כמות',
            required: true,
            min: 1,
            step: 1,
            placeholder: 'הכנס כמות...'
        },
        {
            type: 'number',
            id: 'executionPrice',
            label: 'מחיר',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר...'
        },
        {
            type: 'datetime-local',
            id: 'executionDate',
            label: 'תאריך ושעה',
            required: true,
            defaultValue: 'today'
        },
        {
            type: 'number',
            id: 'executionCommission',
            label: 'עמלה',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00'
        },
        {
            type: 'number',
            id: 'executionFees',
            label: 'עמלות נוספות',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00'
        },
        {
            type: 'select',
            id: 'executionStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'pending', label: 'ממתין' },
                { value: 'filled', label: 'מבוצע' },
                { value: 'cancelled', label: 'מבוטל' },
                { value: 'rejected', label: 'נדחה' }
            ],
            defaultValue: 'filled'
        },
        {
            type: 'textarea',
            id: 'executionNotes',
            label: 'הערות',
            required: false,
            rows: 3,
            placeholder: 'הכנס הערות נוספות על הביצוע...',
            maxLength: 500
        }
    ],
    validation: {
        executionTicker: {
            required: true
        },
        executionAccount: {
            required: true
        },
        executionType: {
            required: true
        },
        executionQuantity: {
            required: true,
            min: 1
        },
        executionPrice: {
            required: true,
            min: 0.01
        },
        executionDate: {
            required: true
        },
        executionCommission: {
            required: false,
            min: 0
        },
        executionFees: {
            required: false,
            min: 0
        },
        executionStatus: {
            required: true
        },
        executionNotes: {
            required: false,
            maxLength: 500
        }
    },
    onSave: 'saveExecution'
};

// יצירת המודל אם ModalManagerV2 זמין
if (window.ModalManagerV2) {
    try {
        window.ModalManagerV2.createCRUDModal(executionsModalConfig);
        console.log('✅ Executions modal created successfully');
    } catch (error) {
        console.error('❌ Error creating Executions modal:', error);
    }
} else {
    console.warn('⚠️ ModalManagerV2 not available for Executions modal');
}

// ייצוא לקונסול (לצורך debug)
window.executionsModalConfig = executionsModalConfig;
