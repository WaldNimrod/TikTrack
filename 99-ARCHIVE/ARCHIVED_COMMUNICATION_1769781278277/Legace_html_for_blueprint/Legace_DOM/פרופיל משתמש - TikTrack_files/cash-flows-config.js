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
    tabs: [
        {
            id: 'regular',
            label: 'תזרים רגיל',
            active: true,
            fields: [
        // שורה ראשונה: סוג תזרים + חשבון מסחר
        {
            type: 'select',
            id: 'cashFlowType',
            label: 'סוג תזרים',
            required: true,
            classList: ['select-cash-flow-width'],
            options: [
                { value: 'deposit', label: 'הפקדה' },
                { value: 'withdrawal', label: 'משיכה' },
                { value: 'fee', label: 'עמלה' },
                { value: 'dividend', label: 'דיבידנד' },
                { value: 'transfer_in', label: 'העברה מחשבון אחר' },
                { value: 'transfer_out', label: 'העברה לחשבון אחר' },
                { value: 'other_positive', label: 'אחר חיובי' },
                { value: 'other_negative', label: 'אחר שלילי' }
            ],
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'cashFlowAccount',
            label: 'חשבון מסחר',
            required: true,
            classList: ['select-cash-flow-width'],
            defaultFromPreferences: true, // ברירת מחדל מהעדפות
            populateFromService: 'accounts', // שימוש ב-SelectPopulatorService לחשבונות
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'display',
            id: 'cashFlowExchangePairDisplay',
            label: 'צמד המרה',
            rowClass: 'row',
            colClass: 'col-12',
            description: 'כאשר התזרים הוא חלק מהמרת מטבע יוצג כאן הצמד המלא.'
        },
        // שורה שנייה: סכום + מטבע (ברירת מחדל מהעדפות)
        {
            type: 'number',
            id: 'cashFlowAmount',
            label: 'סכום',
            required: true,
            min: 0.01,
            step: 0.01,
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'cashFlowCurrency',
            label: 'מטבע',
            required: true,
            classList: ['select-cash-flow-width'],
            defaultFromPreferences: true, // ברירת מחדל מטבע ראשי מהעדפות
            populateFromService: 'currencies', // שימוש ב-SelectPopulatorService למטבעות
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שלישית: תאריך + קישור לטרייד
        {
            type: 'date',
            id: 'cashFlowDate',
            label: 'תאריך תזרים',
            required: true,
            dateTime: false,
            defaultTime: 'now',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'linkButton',
            id: 'linkedTrade',
            label: 'קישור לטרייד',
            buttonText: 'קשר לטרייד',
            description: 'לחיצה תפתח מודל לבחירת טרייד',
            rowClass: 'row',
            colClass: 'col-md-6',
        },
        // שורה רביעית: מקור + מזהה חיצוני
        {
            type: 'select',
            id: 'cashFlowSource',
            label: 'מקור',
            required: true,
            classList: ['select-cash-flow-width'],
            options: [
                { value: 'manual', label: 'ידני' },
                { value: 'IBKR-tradelog-csv', label: 'IBKR CSV' },
                { value: 'IBKR-api', label: 'IBKR API' }
            ],
            defaultValue: 'manual',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'text',
            id: 'cashFlowExternalId',
            label: 'מזהה חיצוני',
            placeholder: 'מזהה חיצוני (אופציונלי)',
            defaultValue: '0',
            disabled: true, // מושבת כל עוד המקור הוא ידני
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'cashFlowTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row',
            colClass: 'col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'cash_flow'
            },
            description: 'הוסף תגיות לתזרים זה'
        },
        // שורה חמישית: תיאור לכל רוחב המודל
        {
            type: 'rich-text',
            id: 'cashFlowDescription',
            label: 'תיאור',
            placeholder: 'תיאור התזרים',
            maxLength: 5000,
            options: {
                direction: 'rtl',
                placeholder: 'תיאור התזרים',
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
            },
            rowClass: 'row',
            colClass: 'col-12'
        }
            ]
        },
        {
            id: 'exchange',
            label: 'המרת מטבע',
            active: false,
            fields: [
                // שורה ראשונה: חשבון מסחר + תאריך
                {
                    type: 'select',
                    id: 'currencyExchangeAccount',
                    label: 'חשבון מסחר',
                    required: true,
                    classList: ['select-cash-flow-width'],
                    defaultFromPreferences: true,
                    populateFromService: 'accounts',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'date',
                    id: 'currencyExchangeDate',
                    label: 'תאריך',
                    required: true,
                    dateTime: false,
                    defaultTime: 'now',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                // שורה שנייה: מטבע מקור + מטבע יעד
                {
                    type: 'select',
                    id: 'currencyExchangeFromCurrency',
                    label: 'מטבע מקור',
                    required: true,
                    classList: ['select-cash-flow-width'],
                    populateFromService: 'currencies',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'select',
                    id: 'currencyExchangeToCurrency',
                    label: 'מטבע יעד',
                    required: true,
                    classList: ['select-cash-flow-width'],
                    populateFromService: 'currencies',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                // שורה שנייה המשך: שער המרה
                {
                    type: 'number',
                    id: 'currencyExchangeRate',
                    label: 'שער המרה',
                    required: true,
                    min: 0.000001,
                    step: 0.000001,
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                // שורה שלישית: עמלה (עם label של מטבע עמלה)
                {
                    type: 'number',
                    id: 'currencyExchangeFeeAmount',
                    label: 'עמלה',
                    required: false,
                    min: 0,
                    step: 0.01,
                    defaultValue: 0,
                    rowClass: 'row',
                    colClass: 'col-md-6',
                    feeCurrencyLabel: true // Signal to render currency label next to fee field
                },
                // שורה רביעית: סכום להמרה + סכום מומר
                {
                    type: 'number',
                    id: 'currencyExchangeFromAmount',
                    label: 'סכום להמרה',
                    required: true,
                    min: 0.01,
                    step: 0.01,
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'number',
                    id: 'currencyExchangeToAmount',
                    label: 'סכום מומר',
                    required: false,
                    readOnly: true,
                    disabled: true,
                    classList: ['select-cash-flow-width'],
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                // שורה חמישית: חישוב סופי מפורט
                {
                    type: 'display',
                    id: 'currencyExchangeNetAmount',
                    label: 'סיכום חישוב',
                    description: 'פירוט מלא של ההמרה והעמלה',
                    rowClass: 'row',
                    colClass: 'col-12'
                },
                // שורה שישית: מקור + מזהה חיצוני
                {
                    type: 'select',
                    id: 'currencyExchangeSource',
                    label: 'מקור',
                    required: true,
                    classList: ['select-cash-flow-width'],
                    options: [
                        { value: 'manual', label: 'ידני' },
                        { value: 'IBKR-tradelog-csv', label: 'IBKR CSV' },
                        { value: 'IBKR-api', label: 'IBKR API' }
                    ],
                    defaultValue: 'manual',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'text',
                    id: 'currencyExchangeExternalId',
                    label: 'מזהה חיצוני',
                    placeholder: 'מזהה חיצוני (אופציונלי)',
                    defaultValue: '0',
                    disabled: true,
                    classList: ['select-cash-flow-width'],
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'select',
                    id: 'currencyExchangeTags',
                    label: 'תגיות',
                    options: [],
                    multiple: true,
                    includeEmpty: false,
                    additionalClasses: ['tag-multi-select'],
                    rowClass: 'row',
                    colClass: 'col-12',
                    attributes: {
                        'data-initial-value': '',
                        'data-tag-entity': 'cash_flow'
                    },
                    description: 'הוסף תגיות להמרת מטבע זו'
                },
                // שורה שביעית: תיאור (בשורה מלאה)
                {
                    type: 'rich-text',
                    id: 'currencyExchangeDescription',
                    label: 'תיאור',
                    placeholder: 'תיאור ההמרה',
                    maxLength: 5000,
                    options: {
                        direction: 'rtl',
                        placeholder: 'תיאור ההמרה',
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
                    },
                    rowClass: 'row',
                    colClass: 'col-12'
                }
            ]
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
        },
        // Currency exchange validations
        currencyExchangeFromAmount: {
            required: true,
            min: 0.01
        },
        currencyExchangeRate: {
            required: true,
            min: 0.000001
        },
        currencyExchangeFromCurrency: {
            required: true
        },
        currencyExchangeToCurrency: {
            required: true
        }
    },
    onSave: 'saveCashFlow',
    onSaveExchange: 'saveCurrencyExchange' // Function to call when saving exchange
};

// ייצוא הקונפיגורציה למרחב הגלובלי - חייב להיות לפני יצירת המודל
window.cashFlowModalConfig = cashFlowModalConfig;

// יצירת המודל - נסה מיד ואם ModalManagerV2 לא זמין, נסה שוב
(function createCashFlowModal() {
    // נסה ליצור את המודל מיד אם ModalManagerV2 זמין
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(cashFlowModalConfig);
            if (window.Logger) {
                window.Logger.debug('✅ Cash Flow Modal created successfully', { page: 'cash_flows-config' });
            }

            // #region agent log - cash flow modal created
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'cash_flows-config.js:modal_created',
                message: 'Cash Flow Modal created successfully',
                data: {
                  timestamp: Date.now(),
                  page: window.location.pathname,
                  modalId: cashFlowModalConfig.id,
                  modalExists: !!document.getElementById(cashFlowModalConfig.id)
                },
                sessionId: 'batch_d_ui_debug',
                hypothesisId: 'H1_crud_buttons_wiring'
              })
            }).catch(() => {});
            // #endregion
            return; // הצלחנו, אין צורך לנסות שוב
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error creating Cash Flow Modal:', error, { page: 'cash_flows-config' });
            }
        }
    }
    
    // אם ModalManagerV2 לא זמין, נסה שוב אחרי זמן קצר (עד 5 שניות)
    let attempts = 0;
    const maxAttempts = 10; // 10 ניסיונות * 200ms = 2 שניות (הופחת מ-50 ל-10)
    const retryInterval = setInterval(() => {
        attempts++;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
            try {
                window.ModalManagerV2.createCRUDModal(cashFlowModalConfig);
                if (window.Logger && attempts > 1) {
                    // Only log if it took more than one attempt
                    window.Logger.debug('✅ Cash Flow Modal created successfully (retry)', { page: 'cash_flows-config', attempts });
                }
                clearInterval(retryInterval);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Error creating Cash Flow Modal (retry):', error, { page: 'cash_flows-config', attempts });
                }
            }
        } else if (attempts >= maxAttempts) {
            // הגענו למקסימום ניסיונות - רק אזהרה אחת בסוף
            clearInterval(retryInterval);
            if (window.Logger) {
                window.Logger.debug('⚠️ Cash Flow Modal not created - ModalManagerV2 not available after retries', { page: 'cash_flows-config', attempts: maxAttempts });
            }
            // Silent failure - modal is optional
        }
    }, 200); // Increased interval to 200ms to reduce load
})();
