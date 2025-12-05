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
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
            width: 300,
            style: 'width: 300px; min-width: 200px;',
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'select',
            id: 'cashFlowCurrency',
            label: 'מטבע',
            required: true,
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
            width: 300,
            style: 'width: 300px; min-width: 200px;'
        },
        // שורה רביעית: מקור + מזהה חיצוני
        {
            type: 'select',
            id: 'cashFlowSource',
            label: 'מקור',
            required: true,
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
            width: 300,
            style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                // שורה שנייה: מטבע מקור + מטבע יעד
                {
                    type: 'select',
                    id: 'currencyExchangeFromCurrency',
                    label: 'מטבע מקור',
                    required: true,
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
                    populateFromService: 'currencies',
                    rowClass: 'row',
                    colClass: 'col-md-6'
                },
                {
                    type: 'select',
                    id: 'currencyExchangeToCurrency',
                    label: 'מטבע יעד',
                    required: true,
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                    width: 300,
                    style: 'width: 300px; min-width: 200px;',
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
                window.Logger.info('✅ Cash Flow Modal created successfully', { page: 'cash-flows-config' });
            } else {
                console.log('✅ Cash Flow Modal created successfully');
            }
            return; // הצלחנו, אין צורך לנסות שוב
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error creating Cash Flow Modal:', error, { page: 'cash-flows-config' });
            } else {
                console.error('❌ Error creating Cash Flow Modal:', error);
            }
        }
    }
    
    // אם ModalManagerV2 לא זמין, נסה שוב אחרי זמן קצר (עד 5 שניות)
    let attempts = 0;
    const maxAttempts = 50; // 50 ניסיונות * 100ms = 5 שניות
    const retryInterval = setInterval(() => {
        attempts++;
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
            try {
                window.ModalManagerV2.createCRUDModal(cashFlowModalConfig);
                if (window.Logger) {
                    window.Logger.info('✅ Cash Flow Modal created successfully (retry)', { page: 'cash-flows-config', attempts });
                } else {
                    console.log(`✅ Cash Flow Modal created successfully (after ${attempts} attempts)`);
                }
                clearInterval(retryInterval);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Error creating Cash Flow Modal (retry):', error, { page: 'cash-flows-config', attempts });
                } else {
                    console.error(`❌ Error creating Cash Flow Modal (attempt ${attempts}):`, error);
                }
            }
        } else if (attempts >= maxAttempts) {
            // הגענו למקסימום ניסיונות
            clearInterval(retryInterval);
            if (window.Logger) {
                window.Logger.warn('⚠️ Cash Flow Modal not created - ModalManagerV2 not available after retries', { page: 'cash-flows-config', attempts: maxAttempts });
            } else {
                console.warn(`⚠️ Cash Flow Modal not created - ModalManagerV2 not available after ${maxAttempts} attempts`);
            }
        }
    }, 100);
})();
