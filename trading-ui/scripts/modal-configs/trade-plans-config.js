/**
 * Trade Plans Modal Configuration
 * קונפיגורציה למודל תוכניות מסחר
 * 
 * @file trade-plans-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeTradePlansModal() - Initializetradeplansmodal

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
        // שורה ראשונה: טיקר + נתוני שוק
        {
            type: 'select',
            id: 'tradePlanTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-4 col-sm-12'
        },
        {
            type: 'display',
            id: 'tradePlanTickerInfo',
            label: 'נתוני שוק',
            colClass: 'col-md-4 col-sm-12'
        },
        // שורה שנייה: צד + סוג השקעה
        {
            type: 'select',
            id: 'tradePlanSide',
            label: 'צד',
            required: true,
            options: [
                { value: 'Long', label: 'לונג (Long)' },
                { value: 'Short', label: 'שורט (Short)' }
            ],
            defaultValue: 'Long',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'בחירת צד הפעולה המתוכננת'
        },
        {
            type: 'select',
            id: 'tradePlanAccount',
            label: 'חשבון מסחר',
            fieldName: 'trading_account_id',
            required: true,
            options: [],
            placeholder: 'בחר חשבון מסחר...',
            defaultFromPreferences: true,
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'select',
            id: 'tradePlanType',
            label: 'סוג השקעה',
            required: true,
            fieldName: 'investment_type', // Map to database column name
            options: [
                { value: 'Swing', label: 'סווינג - מסחר לטווח קצר עד בינוני' },
                { value: 'Investment', label: 'השקעה - השקעה ארוכת טווח' },
                { value: 'Passive', label: 'פאסיבי - השקעה פאסיבית ללא פעילות מסחרית' }
            ],
            defaultValue: 'Swing',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        // שורה שלישית: סוג השקעה + סטטוס
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
            colClass: 'col-md-6 col-sm-12'
        },
        // שורה רביעית: מחיר כניסה + תאריך כניסה
        {
            type: 'number',
            id: 'tradePlanEntryPrice',
            label: 'מחיר כניסה מתוכנן',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר כניסה...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'מחיר הכניסה המתוכנן - מתעדכן אוטומטית לאחר בחירת טיקר'
        },
        {
            type: 'datetime-local',
            id: 'tradePlanEntryDate',
            label: 'תאריך כניסה מתוכנן',
            required: false,
            description: 'ברירת מחדל: היום',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'number',
            id: 'tradePlanQuantity',
            label: 'כמות מתוכננת',
            required: true,
            min: 1,
            step: 0.1,
            placeholder: 'הכנס כמות...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12'
        },
        {
            type: 'number',
            id: 'planAmount',
            label: 'סכום השקעה מתוכנן ($)',
            required: true,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס סכום השקעה...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'הסכום הכולל להשקעה בתכנון'
        },
        // שורה חמישית: Stop Loss + Take Profit
        // שורה שישית: Stop Loss + Take Profit
        {
            type: 'number',
            id: 'tradePlanStopLoss',
            label: 'Stop Loss',
            required: false,
            min: 0.01,
            step: 0.01,
            placeholder: 'הכנס מחיר Stop Loss...',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-negative-medium);'
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
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-positive-medium);'
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
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-negative-medium);',
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
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-positive-medium);',
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
        {
            type: 'select',
            id: 'tradePlanTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-4 col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'trade_plan'
            },
            description: 'בחר תגיות שיסייעו בארגון ומעקב אחר תוכנית זו'
        },
        {
            type: 'custom',
            id: 'tradePlanConditionsControls',
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-8 col-12',
            html: `
                <div class="conditions-control-wrapper d-flex flex-column gap-2" data-conditions-controls="trade-plan">
                    <div id="tradePlanConditionsSummary" class="conditions-summary-table" data-conditions-summary>
                        <div class="text-muted small mb-0">
                            תנאים פעילים יוצגו כאן לאחר שמירת התכנון.
                        </div>
                    </div>
                    <div class="text-muted small" data-conditions-disabled-hint>
                        ניהול תנאים יהיה זמין לאחר שמירת התכנון.
                    </div>
                    <div class="d-flex justify-content-end flex-wrap gap-2" dir="rtl">
                        <button
                            type="button"
                            id="tradePlanEvaluateConditionsButton"
                            data-button-type="REFRESH"
                            data-variant="small"
                            data-style="outline"
                            data-classes=" btn-outline-secondary"
                            data-icon="↻"
                            data-text=""
                            data-size="small"
                            data-onclick="handleTradePlanEvaluateConditionsClick()"
                            data-tooltip="בדיקת תנאים מול השוק"
                            aria-label="בדיקת תנאים">
                        </button>
                        <button
                            type="button"
                            id="tradePlanOpenConditionsButton"
                            data-button-type="ADD"
                            data-variant="small"
                            data-style="outline"
                            data-classes=" btn-outline-primary"
                            data-icon="➕"
                            data-text=""
                            data-size="small"
                            data-onclick="handleTradePlanConditionsButtonClick()"
                            data-tooltip="הוסף תנאי"
                            aria-label="הוסף תנאי">
                        </button>
                    </div>
                </div>
            `
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
            window.Logger?.debug?.('✅ Trade Plans modal created successfully', { page: 'trade-plans-config' });
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


