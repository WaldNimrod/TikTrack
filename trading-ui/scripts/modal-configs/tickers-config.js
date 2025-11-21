/**
 * Tickers Modal Configuration
 * קונפיגורציה למודל טיקרים
 * 
 * @file tickers-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

(function initTickersModalConfiguration() {
    const GLOBAL_KEY = '__TICKERS_MODAL_CONFIG_SOURCE__';

    if (window[GLOBAL_KEY]) {
        if (!window.tickersModalConfig) {
            window.tickersModalConfig = window[GLOBAL_KEY];
        }
        return;
    }

    // קונפיגורציה למודל טיקרים
    const tickersModalConfig = {
        id: 'tickersModal',
        entityType: 'ticker',
        title: {
            add: 'הוספת טיקר',
            edit: 'עריכת טיקר'
        },
        size: 'lg',
        headerType: 'dynamic', // צבעים דינמיים לפי ישות
        fields: [
            // שורה ראשונה: סמל הטיקר + שם החברה
            {
                type: 'text',
                id: 'tickerSymbol',
                label: 'סמל הטיקר',
                required: true,
                placeholder: 'הכנס סמל טיקר (למשל: AAPL)',
                maxLength: 10,
                rowClass: 'row',
                colClass: 'col-md-6'
            },
            {
                type: 'text',
                id: 'tickerName',
                label: 'שם החברה',
                required: true,
                placeholder: 'הכנס שם החברה',
                maxLength: 100,
                rowClass: 'row',
                colClass: 'col-md-6'
            },
            // שורה שנייה: סוג הטיקר + מטבע
            {
                type: 'select',
                id: 'tickerType',
                label: 'סוג הטיקר',
                required: true,
                options: [
                    { value: 'stock', label: 'מניה' },
                    { value: 'etf', label: 'קרן נאמנות (ETF)' },
                    { value: 'bond', label: 'אג"ח' },
                    { value: 'crypto', label: 'מטבע דיגיטלי' },
                    { value: 'forex', label: 'מטבע חוץ' },
                    { value: 'commodity', label: 'סחורה' }
                ],
                defaultValue: 'stock',
                rowClass: 'row',
                colClass: 'col-md-6'
            },
            {
                type: 'select',
                id: 'tickerCurrency',
                label: 'מטבע',
                required: true,
                populateFromService: 'currencies', // יטען מ-SelectPopulatorService.populateCurrenciesSelect
                defaultFromPreferences: true, // ברירת מחדל מהעדפות
                rowClass: 'row',
                colClass: 'col-md-6'
            },
            {
                type: 'select',
                id: 'tickerStatus',
                label: 'סטטוס',
                required: true,
                options: [
                    { value: 'open', label: 'פתוח' },
                    { value: 'closed', label: 'סגור' },
                    { value: 'cancelled', label: 'מבוטל' }
                ],
                defaultValue: 'closed',
                rowClass: 'row',
                colClass: 'col-md-6'
            },
            {
                type: 'select',
                id: 'tickerTags',
                label: 'תגיות',
                options: [],
                multiple: true,
                includeEmpty: false,
                additionalClasses: ['tag-multi-select'],
                rowClass: 'row',
                colClass: 'col-12',
                attributes: {
                    'data-initial-value': '',
                    'data-tag-entity': 'ticker'
                },
                description: 'הוסף תגיות לטיקר לצורך סיווג ופילטרים'
            },
            // שורה אחרונה: הערות (בשורה מלאה) - Rich Text Editor
            {
                type: 'rich-text',
                id: 'tickerRemarks',
                label: 'הערות',
                required: false,
                placeholder: 'הכנס הערות נוספות על הטיקר...',
                maxLength: 5000,
                options: {
                    direction: 'rtl',
                    placeholder: 'הכנס הערות נוספות על הטיקר...',
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
            },
            // אזור בדיקת נתונים חיצוניים (נוסף דינמית)
            {
                type: 'custom',
                id: 'tickerExternalDataSection',
                html: `
                    <div class="row mt-3">
                        <div class="col-12">
                            <div class="d-flex gap-2 align-items-center mb-2">
                                <button type="button" 
                                        id="checkTickerExternalDataBtn" 
                                        class="btn btn-outline-info btn-sm" 
                                        disabled
                                        data-onclick="checkTickerExternalData()">
                                    <i class="fas fa-sync-alt"></i> בדוק נתונים חיצוניים
                                </button>
                                <small class="text-muted">הכנס סמל טיקר כדי לבדוק נתונים</small>
                            </div>
                            <div id="tickerExternalDataResult" class="mt-2" style="display: none;"></div>
                            <div id="tickerExternalDataWarning" class="alert alert-warning mt-2" style="display: none;"></div>
                        </div>
                    </div>
                `
            }
        ],
        validation: {
            tickerSymbol: {
                required: true,
                minLength: 1,
                maxLength: 10,
                pattern: '^[A-Z0-9.-]+$'
            },
            tickerName: {
                required: true,
                minLength: 2,
                maxLength: 100
            },
            tickerType: {
                required: true,
                enum: ['stock', 'etf', 'bond', 'crypto', 'forex', 'commodity']
            },
            tickerCurrency: {
                required: true,
                type: 'int' // currency_id הוא Integer
            },
            tickerStatus: {
                required: true,
                enum: ['open', 'closed', 'cancelled']
            },
            tickerRemarks: {
                required: false,
                maxLength: 5000
            }
        },
        onSave: 'saveTicker'
    };

    // יצירת המודל אם ModalManagerV2 זמין
    // יצירת המודל - מחכה ל-DOMContentLoaded
    // יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
    function initializeTickersModal() {
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
            try {
                window.ModalManagerV2.createCRUDModal(tickersModalConfig);
                console.log('✅ Tickers modal created successfully');
                if (window.Logger) {
                    window.Logger.debug('Tickers modal created successfully', { page: 'tickers' });
                }
                return true;
            } catch (error) {
                console.error('❌ Error creating Tickers modal:', error);
                if (window.Logger) {
                    window.Logger.error('Error creating Tickers modal', { error: error.message, page: 'tickers' });
                }
                return false;
            }
        }
        return false;
    }

    // Attempt to initialize immediately if ModalManagerV2 is available
    if (window.ModalManagerV2) {
        console.log('✅ ModalManagerV2 available, initializing Tickers modal...');
        if (initializeTickersModal()) {
            console.log('✅ Tickers modal initialized successfully');
        } else {
            console.warn('⚠️ Failed to initialize Tickers modal');
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
                console.log(`✅ ModalManagerV2 available after ${attempts} attempts, initializing Tickers modal...`);
                clearInterval(checkInterval);
                if (initializeTickersModal()) {
                    console.log('✅ Tickers modal initialized successfully');
                } else {
                    console.warn('⚠️ Failed to initialize Tickers modal');
                }
            } else if (attempts >= maxAttempts) {
                console.warn(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts`);
                clearInterval(checkInterval);
            }
        }, interval);
    }

    // ייצוא לקונסול (לצורך debug)
    window[GLOBAL_KEY] = tickersModalConfig;
    window.tickersModalConfig = tickersModalConfig;
    window.initializeTickersModal = initializeTickersModal;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = tickersModalConfig;
    }
})();


