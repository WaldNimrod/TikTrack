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
        // שורה ראשונה: טיקר + נתוני שוק
        {
            type: 'select',
            id: 'tradeTicker',
            label: 'טיקר',
            required: true,
            options: [], // יטען דינמית מ-API
            placeholder: 'בחר טיקר...',
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-4 col-sm-12'
        },
        {
            type: 'display',
            id: 'tradeTickerInfoDisplay',
            label: 'נתוני שוק',
            colClass: 'col-md-4 col-sm-12'
        },
        {
            type: 'custom',
            id: 'tradeConditionsControls',
            colClass: 'col-md-4 col-sm-12',
            html: `
                <div class="conditions-control-wrapper d-flex flex-column align-items-end gap-2" data-conditions-controls="trade">
                    <button type="button" class="btn btn-outline-primary w-100" id="tradeOpenConditionsButton">
                        ניהול תנאים
                    </button>
                    <div class="text-muted small text-start w-100" data-conditions-disabled-hint>
                        ניהול תנאים יהיה זמין לאחר שמירת העסקה.
                    </div>
                </div>
            `
        },
        // שורה שנייה: צד + חשבון מסחר
        {
            type: 'select',
            id: 'tradeSide',
            label: 'צד',
            required: true,
            options: [
                { value: 'long', label: 'לונג (Long)' },
                { value: 'short', label: 'שורט (Short)' }
            ],
            defaultValue: 'long',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'בחר האם מדובר בלונג או שורט'
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
        // שורה שלישית: סוג השקעה + סטטוס
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
        // שורה רביעית: מחיר כניסה + תאריך כניסה
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
            step: 0.1,
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
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-negative-medium);'
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
            colClass: 'col-md-6 col-sm-12',
            labelStyle: 'color: var(--numeric-positive-medium);'
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
            labelStyle: 'color: var(--numeric-negative-medium);',
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
            labelStyle: 'color: var(--numeric-positive-medium);',
            description: 'אחוז יעד יחסית למחיר הכניסה'
        },
        {
            type: 'display',
            id: 'tradeRiskSummaryCard',
            label: 'סיכום טרייד',
            description: 'חישוב ריכוזי של נתוני ההשקעה, הסיכון והסיכוי',
            rowClass: 'row',
            colClass: 'col-12'
        },
        {
            type: 'select',
            id: 'tradeTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-4 col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'trade'
            },
            description: 'בחר תגיות עבור טרייד זה לטובת סינון ואנליטיקה'
        },
        {
            type: 'custom',
            id: 'tradeConditionsControls',
            rowClass: 'row g-3 align-items-end',
            colClass: 'col-md-8 col-12',
            html: `
                <div class="conditions-control-wrapper d-flex flex-column gap-2" data-conditions-controls="trade">
                    <div id="tradeConditionsSummary" class="conditions-summary-table" data-conditions-summary>
                        <div class="text-muted small mb-0">
                            תנאים פעילים יוצגו כאן לאחר שמירת הטרייד.
                        </div>
                    </div>
                    <div class="text-muted small" data-conditions-disabled-hint>
                        ניהול תנאים יהיה זמין לאחר שמירת הטרייד.
                    </div>
                    <div class="d-flex justify-content-end flex-wrap gap-2" dir="rtl">
                        <button
                            type="button"
                            id="tradeEvaluateConditionsButton"
                            data-button-type="REFRESH"
                            data-variant="small"
                            data-style="outline"
                            data-classes=" btn-outline-secondary"
                            data-icon="↻"
                            data-text=""
                            data-size="small"
                            data-onclick="handleTradeEvaluateConditionsClick()"
                            data-tooltip="בדיקת תנאים מול השוק"
                            aria-label="בדיקת תנאים">
                        </button>
                        <button
                            type="button"
                            id="tradeOpenConditionsButton"
                            data-button-type="ADD"
                            data-variant="small"
                            data-style="outline"
                            data-classes=" btn-outline-primary"
                            data-icon="➕"
                            data-text=""
                            data-size="small"
                            data-onclick="handleTradeConditionsButtonClick()"
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
        tradeSide: {
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
