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
        // שורה ראשונה: טיקר + צד + סוג השקעה + סטטוס
        {
            type: 'display',
            id: 'tradePlanTickerInfo',
            label: 'נתוני שוק',
            description: 'מתעדכן אוטומטית לאחר בחירת טיקר',
            rowClass: 'row',
            colClass: 'col-12 col-lg-8 col-md-7'
        },
        {
            type: 'select',
            id: 'tradePlanTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            rowClass: 'row',
            colClass: 'col-12 col-lg-4 col-md-5 col-sm-12'
        },
        {
            type: 'select',
            id: 'tradePlanSide',
            label: 'צד',
            required: true,
            options: [
                { value: 'long', label: 'לונג (Long)' },
                { value: 'short', label: 'שורט (Short)' }
            ],
            defaultValue: 'long',
            rowClass: 'row',
            colClass: 'col-md-3 col-sm-12',
            description: 'בחירת צד הפעולה המתוכננת'
        },
        {
            type: 'select',
            id: 'tradePlanType',
            label: 'סוג השקעה',
            required: true,
            fieldName: 'investment_type', // Map to database column name
            options: [
                { value: 'swing', label: 'סווינג - מסחר לטווח קצר עד בינוני' },
                { value: 'investment', label: 'השקעה - השקעה ארוכת טווח' },
                { value: 'passive', label: 'פאסיבי - השקעה פאסיבית ללא פעילות מסחרית' }
            ],
            defaultValue: 'swing',
            rowClass: 'row',
            colClass: 'col-md-3 col-sm-12'
        },
        {
            type: 'select',
            id: 'tradePlanStatus',
            label: 'סטטוס',
            required: true,
            options: [
                { value: 'open', label: 'פתוח' },
                { value: 'closed', label: 'סגור' },
                { value: 'cancelled', label: 'מבוטל' }
            ],
            defaultValue: 'open',
            rowClass: 'row',
            colClass: 'col-md-3 col-sm-12'
        },
        // שורה שנייה: מחיר כניסה + תאריך כניסה
        {
            type: 'number',
            id: 'tradePlanEntryPrice',
            label: 'מחיר כניסה מתוכנן',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'datetime-local',
            id: 'tradePlanEntryDate',
            label: 'תאריך כניסה מתוכנן',
            required: false,
            description: 'ברירת מחדל: היום',
            colClass: 'col-md-6'
        },
        // שורה שלישית: כמות + סכום השקעה
        {
            type: 'number',
            id: 'planAmount',
            label: 'סכום השקעה מתוכנן ($)',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס סכום השקעה...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'הסכום הכולל להשקעה בתכנון'
        },
        {
            type: 'number',
            id: 'tradePlanQuantity',
            label: 'כמות מתוכננת',
            required: true,
            min: 1,
            step: 0.1,
            placeholder: 'הכנס כמות...',
            colClass: 'col-md-6'
        },
        // שורה רביעית: סטופ + יעד
        {
            type: 'number',
            id: 'tradePlanStopLoss',
            label: 'Stop Loss',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'tradePlanTakeProfit',
            label: 'Take Profit',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Take Profit...',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'number',
            id: 'tradePlanStopLossPercent',
            label: 'Stop Loss (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'אחוז סטופ מתוכנן...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'אחוז סטופ ביחס למחיר הכניסה'
        },
        {
            type: 'number',
            id: 'tradePlanTakeProfitPercent',
            label: 'Take Profit (%)',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'אחוז יעד מתוכנן...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'אחוז יעד ביחס למחיר הכניסה'
        },
        {
            type: 'display',
            id: 'tradePlanRiskSummaryCard',
            label: 'סיכום תוכנית',
            description: 'תצוגת נתוני השקעה, סיכון וסיכוי עבור התוכנית',
            rowClass: 'row',
            colClass: 'col-12'
        },
        // שורה אחרונה: הערות (בשורה מלאה) - Rich Text Editor
        {
            type: 'rich-text',
            id: 'tradePlanNotes',
            label: 'הערות',
            required: false,
            placeholder: 'הכנס הערות נוספות על התוכנית...',
            maxLength: 5000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס הערות נוספות על התוכנית...',
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
    // REMOVED: validation property - Validation is handled by centralized validation system (validation-utils.js)
    // The system automatically validates fields based on HTML [required] attribute and input types
    // Field required status is set via field.required property in the fields array above
    onSave: 'saveTradePlan'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
// This function will be called when ModalManagerV2 is ready
function initializeTradePlansModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradePlansModalConfig);
            console.log('✅ Trade Plans modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Trade Plans modal:', error);
            return false;
        }
    }
    return false;
}

// Try immediate initialization if ModalManagerV2 is already available
if (window.ModalManagerV2) {
    initializeTradePlansModal();
} else {
    // Deferred initialization - wait for ModalManagerV2 to be available
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Retry with delay to allow ModalManagerV2 initialization
            setTimeout(() => {
                if (!initializeTradePlansModal()) {
                    console.warn('⚠️ ModalManagerV2 not available after DOMContentLoaded - will retry');
                    // Final retry after additional delay
                    setTimeout(() => {
                        if (!initializeTradePlansModal()) {
                            console.warn('⚠️ ModalManagerV2 not available for Trade Plans modal after retries');
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        // DOM already loaded - use setTimeout with retry
        setTimeout(() => {
            if (!initializeTradePlansModal()) {
                setTimeout(() => {
                    if (!initializeTradePlansModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Trade Plans modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ייצוא לקונסול (לצורך debug)
window.tradePlansModalConfig = tradePlansModalConfig;


