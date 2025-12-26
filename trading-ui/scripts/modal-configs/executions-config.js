/**
 * Executions Modal Configuration
 * קונפיגורציה למודל ביצועים
 * 
 * @file executions-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Functions ===
// - initializeExecutionsModal() - Initializeexecutionsmodal
// - waitForModalManager() - Waitformodalmanager
// - waitForModalManager() - Waitformodalmanager

// === Initialization ===
// - initializeExecutionsModal() - Initializeexecutionsmodal
// === Functions ===
// - initializeExecutionsModal() - Initializeexecutionsmodal
// - waitForModalManager() - Waitformodalmanager

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
        // שורה ראשונה: נתוני שוק (כמו במודול התראות - למעלה)
        {
            type: 'display',
            id: 'executionTickerInfo',
            label: 'נתוני שוק',
            rowClass: 'row',
            colClass: 'col-md-12',
            renderFn: 'renderTickerInfo'
        },
        // שורה שנייה: טיקר + חשבון מסחר
        {
            type: 'select',
            id: 'executionTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            populateFromService: 'tickers', // שימוש ב-SelectPopulatorService לטיקרים (כמו ב-cash flows)
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'executionAccount',
            label: 'חשבון מסחר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר חשבון מסחר...',
            defaultFromPreferences: true, // ברירת מחדל מהעדפות
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שלישית: סוג ביצוע + כמות
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
            defaultValue: 'buy',
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'executionQuantity',
            label: 'כמות',
            required: true,
            min: 1,
            step: 1,
            placeholder: 'הכנס כמות...',
            defaultValue: 100,
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה רביעית: מחיר + תאריך ושעה
        {
            type: 'number',
            id: 'executionPrice',
            label: 'מחיר',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר...',
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'datetime-local',
            id: 'executionDate',
            label: 'תאריך ושעה',
            required: true,
            defaultValue: new Date().toISOString().slice(0, 16),
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה חמישית: קישור לטרייד (מעל העמלה)
        {
            type: 'linkButton',
            id: 'linkedTrade',
            label: 'קישור לטרייד',
            required: false,
            buttonText: 'קשר לטרייד',
            description: 'לחיצה תפתח מודל לבחירת טרייד',
            rowClass: 'row',
            colClass: 'col-md-12',
            width: 300,
            style: 'width: 300px; min-width: 200px;'
        },
        // שורה שישית: עמלה (בשורה מלאה)
        {
            type: 'number',
            id: 'executionCommission',
            label: 'עמלה',
            required: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00',
            defaultFromPreferences: true, // ברירת מחדל מהעדפות
            width: 300,
            style: 'width: 300px; min-width: 200px;'
        },
        // שורה שביעית: סה"כ (תוצאה מחושבת)
        {
            type: 'display',
            id: 'executionTotal',
            label: 'סה"כ',
            required: false,
            defaultValue: '',
            rowClass: 'row',
            colClass: 'col-md-12',
            style: 'font-weight: bold; font-size: 1.1em; color: #26baac;'
        },
        {
            type: 'select',
            id: 'executionSource',
            label: 'מקור',
            required: false,
            options: [
                { value: 'manual', label: 'ידני' },
                { value: 'api', label: 'API' },
                { value: 'file_import', label: 'ייבוא קובץ' },
                { value: 'direct_import', label: 'ייבוא ישיר' },
                { value: 'ibkr_import', label: 'ייבוא IBKR' }
            ],
            defaultValue: 'manual',
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'text',
            id: 'executionExternalId',
            label: 'מזהה חיצוני',
            required: false,
            placeholder: 'מזהה חיצוני (אופציונלי)',
            defaultValue: null,
            disabled: true, // מושבת כל עוד המקור הוא ידני
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'executionRealizedPL',
            label: 'Realized P/L',
            required: false,
            step: 1,
            placeholder: '0',
            disabled: true,  // Will be enabled/disabled based on action type
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'executionMTMPL',
            label: 'MTM P/L',
            required: false,
            step: 1,
            placeholder: 'הכנס MTM P/L...',
            disabled: true,  // Will be enabled/disabled based on action type (same as Realized P/L)
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'executionTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row',
            colClass: 'col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'execution'
            },
            description: 'הוסף תגיות לתיעוד הביצוע'
        },
        {
            type: 'rich-text',
            id: 'executionNotes',
            label: 'הערות',
            required: false,
            placeholder: 'הכנס הערות נוספות על הביצוע...',
            maxLength: 5000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס הערות נוספות על הביצוע...',
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
        executionSource: {
            required: false
        },
        executionExternalId: {
            required: false
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
            maxLength: 5000
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
            window.Logger?.debug?.('✅ Executions modal created successfully', { page: 'executions-config' });
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Executions modal:', error, { page: 'executions-config' });
            return false;
        }
    }
    return false;
}

// יצירת המודל כאשר הקובץ נטען - כמו ב-cash-flows-config.js
// Wait for DOMContentLoaded to ensure all dependencies are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Try immediately if ModalManagerV2 is available
        if (window.ModalManagerV2) {
            window.Logger?.debug?.('✅ ModalManagerV2 available on DOMContentLoaded, initializing Executions modal...', { page: 'executions-config' });
            if (initializeExecutionsModal()) {
                window.Logger?.debug?.('✅ Executions modal initialized successfully', { page: 'executions-config' });
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Executions modal', { page: 'executions-config' });
                // Fallback: wait for ModalManagerV2
                waitForModalManager();
            }
        } else {
            window.Logger?.debug?.('⚠️ ModalManagerV2 not yet available on DOMContentLoaded, waiting...', { page: 'executions-config' });
            waitForModalManager();
        }
    });
} else {
    // DOM already loaded - try immediately
    if (window.ModalManagerV2) {
        window.Logger?.debug?.('✅ ModalManagerV2 available, initializing Executions modal...', { page: 'executions-config' });
        if (initializeExecutionsModal()) {
            window.Logger?.debug?.('✅ Executions modal initialized successfully', { page: 'executions-config' });
        } else {
            window.Logger?.warn?.('⚠️ Failed to initialize Executions modal', { page: 'executions-config' });
            waitForModalManager();
        }
    } else {
        window.Logger?.debug?.('⚠️ ModalManagerV2 not yet available, waiting...', { page: 'executions-config' });
        waitForModalManager();
    }
}

// Helper function to wait for ModalManagerV2
function waitForModalManager() {
    let attempts = 0;
    const maxAttempts = 50; // Increased from 10 to 50 (10 seconds total)
    const interval = 200; // 200ms between attempts
    
    const checkInterval = setInterval(() => {
        attempts++;
        if (window.ModalManagerV2) {
            window.Logger?.debug?.(`✅ ModalManagerV2 available after ${attempts} attempts, initializing Executions modal...`, { page: 'executions-config' });
            clearInterval(checkInterval);
            if (initializeExecutionsModal()) {
                window.Logger?.debug?.('✅ Executions modal initialized successfully', { page: 'executions-config' });
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Executions modal', { page: 'executions-config' });
            }
        } else if (attempts >= maxAttempts) {
            window.Logger?.warn?.(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts (${maxAttempts * interval / 1000}s)`, { page: 'executions-config' });
            clearInterval(checkInterval);
        }
    }, interval);
}

// ייצוא לקונסול (לצורך debug)
window.executionsModalConfig = executionsModalConfig;

// Debug log for executions config
if (window.Logger) {
    window.Logger.debug('Executions modal config loaded', {
        page: 'executions-config',
        fieldsWithDefaultFromPreferences: executionsModalConfig.fields.filter(f => f.defaultFromPreferences).map(f => ({id: f.id, label: f.label}))
    });
}
