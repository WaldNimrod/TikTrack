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
            label: 'חשבון מסחר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...',
            defaultFromPreferences: true // ברירת מחדל מהעדפות
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
            placeholder: 'הכנס כמות...',
            defaultValue: 100
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
            defaultValue: new Date().toISOString().slice(0, 16)
        },
        {
            type: 'number',
            id: 'executionCommission',
            label: 'עמלה',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00',
            defaultFromPreferences: true // ברירת מחדל מהעדפות
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
            type: 'number',
            id: 'executionRealizedPL',
            label: 'Realized P/L',
            required: false,
            step: 1,
            placeholder: '0',
            disabled: true  // Will be enabled/disabled based on action type
        },
        {
            type: 'number',
            id: 'executionMTMPL',
            label: 'MTM P/L',
            required: false,
            step: 1,
            placeholder: 'הכנס MTM P/L...'
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
        executionRealizedPL: {
            required: false,
            min: null  // Can be negative
        },
        executionMTMPL: {
            required: false,
            min: null  // Can be negative
        },
        executionNotes: {
            required: false,
            maxLength: 500
        }
    },
    onSave: 'saveExecution'
};

// יצירת המודל אם ModalManagerV2 זמין
// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeExecutionsModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(executionsModalConfig);
            console.log('✅ Executions modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Executions modal:', error);
            return false;
        }
    }
    return false;
}

// Attempt to initialize immediately if ModalManagerV2 is available
if (window.ModalManagerV2) {
    console.log('✅ ModalManagerV2 available, initializing Executions modal...');
    if (initializeExecutionsModal()) {
        console.log('✅ Executions modal initialized successfully');
    } else {
        console.warn('⚠️ Failed to initialize Executions modal');
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
            console.log(`✅ ModalManagerV2 available after ${attempts} attempts, initializing Executions modal...`);
            clearInterval(checkInterval);
            if (initializeExecutionsModal()) {
                console.log('✅ Executions modal initialized successfully');
            } else {
                console.warn('⚠️ Failed to initialize Executions modal');
            }
        } else if (attempts >= maxAttempts) {
            console.warn(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts`);
            clearInterval(checkInterval);
        }
    }, interval);
}

// ייצוא לקונסול (לצורך debug)
window.executionsModalConfig = executionsModalConfig;
