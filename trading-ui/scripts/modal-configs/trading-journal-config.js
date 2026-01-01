/**
 * Trading Journal Modal Configuration
 * קונפיגורציה למודל יומן מסחר
 *
 * @file trading-journal-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeTradingJournalModal() - Initialize trading journal modal

// === Data Functions ===
// - saveTradingJournalFallback() - Save trading journal fallback


// קונפיגורציה למודל יומן מסחר
const tradingJournalModalConfig = {
    id: 'tradingJournalModal',
    entityType: 'trading_journal',
    title: {
        add: 'הוספת רשומת יומן מסחר',
        edit: 'עריכת רשומת יומן מסחר'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        // שורה ראשונה: טרייד + תאריך כניסה
        {
            type: 'select',
            id: 'tradingJournalTrade',
            label: 'טרייד',
            required: true,
            options: [], // יטען דינמית מטרידים זמינים
            placeholder: 'בחר טרייד...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'חובה - בחר את הטרייד שברצונך לתעד ביומן',
            attributes: {
                'data-entity-type': 'trade'
            }
        },
        {
            type: 'datetime-local',
            id: 'tradingJournalEntryDate',
            label: 'תאריך כניסה',
            required: true,
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'חובה - תאריך וכתיבת הרשומה ביומן'
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'tradingJournalSeparator1'
        },
        // שורה שנייה: מצב רוח + דירוג ביצועים
        {
            type: 'select',
            id: 'tradingJournalMood',
            label: 'מצב רוח',
            required: false,
            options: [
                { value: 'excellent', label: 'מצוין' },
                { value: 'good', label: 'טוב' },
                { value: 'neutral', label: 'נייטרלי' },
                { value: 'bad', label: 'רע' },
                { value: 'terrible', label: 'נורא' }
            ],
            placeholder: 'בחר מצב רוח...',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'אופציונלי - כיצד הרגשת במהלך הטרייד'
        },
        {
            type: 'number',
            id: 'tradingJournalPerformanceRating',
            label: 'דירוג ביצועים',
            required: false,
            min: 1,
            max: 10,
            step: 1,
            placeholder: '1-10',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'אופציונלי - דירוג אישי לביצועים (1-10)'
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'tradingJournalSeparator2'
        },
        // שורה שלישית: הערות (Rich Text Editor)
        {
            type: 'rich-text',
            id: 'tradingJournalNotes',
            label: 'הערות',
            required: false,
            placeholder: 'הכנס הערות על הטרייד...',
            maxLength: 10000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס הערות על הטרייד...',
                minHeight: 150,
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
            description: 'אופציונלי - הערות מפורטות על הטרייד, החלטות, תחושות וכו\''
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'tradingJournalSeparator3'
        },
        // שורה רביעית: לקחים שנלמדו (Rich Text Editor)
        {
            type: 'rich-text',
            id: 'tradingJournalLessonsLearned',
            label: 'לקחים שנלמדו',
            required: false,
            placeholder: 'מה למדת מהטרייד הזה?...',
            maxLength: 10000,
            options: {
                direction: 'rtl',
                placeholder: 'מה למדת מהטרייד הזה?...',
                minHeight: 120,
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
            description: 'אופציונלי - לקחים ותובנות לטריידים עתידיים'
        }
    ],
    validation: {
        tradingJournalTrade: {
            required: true,
            type: 'int'
        },
        tradingJournalEntryDate: {
            required: true,
            type: 'datetime-local'
        },
        tradingJournalMood: {
            required: false,
            enum: ['excellent', 'good', 'neutral', 'bad', 'terrible']
        },
        tradingJournalPerformanceRating: {
            required: false,
            type: 'int',
            min: 1,
            max: 10
        },
        tradingJournalNotes: {
            required: false,
            maxLength: 10000
        },
        tradingJournalLessonsLearned: {
            required: false,
            maxLength: 10000
        }
    },
    onSave: 'saveTradingJournal'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeTradingJournalModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(tradingJournalModalConfig);
            window.Logger?.debug?.('✅ Trading journal modal created successfully', { page: 'trading-journal-config' });
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Trading journal modal:', error, { page: 'trading-journal-config' });
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeTradingJournalModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeTradingJournalModal()) {
                    setTimeout(() => {
                        if (!initializeTradingJournalModal()) {
                            window.Logger?.debug?.('⚠️ ModalManagerV2 not available for Trading journal modal after retries', { page: 'trading-journal-config' });
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeTradingJournalModal()) {
                setTimeout(() => {
                    if (!initializeTradingJournalModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Trading journal modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ===== FALLBACK saveTradingJournal FUNCTION =====
// This function is used when trading-journal.js is not loaded
// It uses UnifiedCRUDService to save trading journal entries

/**
 * Fallback saveTradingJournal function using UnifiedCRUDService
 * Used when trading-journal.js is not loaded
 *
 * @global
 * @returns {Promise<void>}
 */
async function saveTradingJournalFallback() {
    if (!window.UnifiedCRUDService) {
        window.showErrorNotification?.('שגיאה', 'מערכת השמירה לא זמינה. נא לרענן את הדף.');
        window.Logger?.error('UnifiedCRUDService not available for saveTradingJournal fallback', {
            page: 'trading-journal-config'
        });
        return;
    }

    const form = document.getElementById('tradingJournalModalForm') || document.getElementById('addTradingJournalForm');
    if (!form) {
        window.Logger?.warn('⚠️ Trading journal form not found - aborting save', { page: 'trading-journal-config' });
        return;
    }

    // Collect form data
    const fieldMap = {
        trade_id: { id: 'tradingJournalTrade', type: 'int' },
        entry_date: { id: 'tradingJournalEntryDate', type: 'datetime-local' },
        notes: { id: 'tradingJournalNotes', type: 'rich-text' },
        mood: { id: 'tradingJournalMood', type: 'text' },
        lessons_learned: { id: 'tradingJournalLessonsLearned', type: 'rich-text' },
        performance_rating: { id: 'tradingJournalPerformanceRating', type: 'int' }
    };

    const journalData = window.DataCollectionService?.collectFormData(fieldMap) || {};

    // Validation
    if (!journalData.trade_id) {
        window.showErrorNotification?.('שגיאה', 'טרייד חובה');
        return;
    }

    if (!journalData.entry_date) {
        window.showErrorNotification?.('שגיאה', 'תאריך כניסה חובה');
        return;
    }

    // Determine if edit mode
    const isEditMode = form.dataset.mode === 'edit';
    const formEntityId = form.dataset.entityId || form.dataset.journalId || form.querySelector('input[name="id"]')?.value || null;
    const journalId = isEditMode && formEntityId ? parseInt(formEntityId, 10) : null;

    try {
        // Prepare data
        const entityData = {
            trade_id: parseInt(journalData.trade_id),
            entry_date: journalData.entry_date
        };

        // Add optional fields if present
        if (journalData.notes) entityData.notes = journalData.notes;
        if (journalData.mood) entityData.mood = journalData.mood;
        if (journalData.lessons_learned) entityData.lessons_learned = journalData.lessons_learned;
        if (journalData.performance_rating) entityData.performance_rating = parseInt(journalData.performance_rating);

        const options = {
            modalId: 'tradingJournalModal',
            successMessage: journalId ? 'רשומת יומן עודכנה בהצלחה!' : 'רשומת יומן נשמרה בהצלחה!',
            entityName: 'רשומת יומן מסחר',
            reloadFn: () => {
                // Refresh trading journal table if available
                if (window.updateTradingJournalTable) {
                    window.updateTradingJournalTable();
                }
                // Refresh linked items if available
                if (window.updateLinkedItemsTable) {
                    window.updateLinkedItemsTable();
                }
            },
            requiresHardReload: false,
            isEdit: !!journalId,
            entityId: journalId
        };

        const result = await window.UnifiedCRUDService.saveEntity('trading_journal', entityData, options);

    } catch (error) {
        window.Logger?.error('Error saving trading journal via fallback', {
            error,
            page: 'trading-journal-config'
        });
        window.CRUDResponseHandler?.handleError(error, 'שמירת רשומת יומן מסחר');
    }
}

// Export saveTradingJournal to global scope - use fallback if trading-journal.js is not loaded
if (typeof window.saveTradingJournal === 'undefined') {
    window.saveTradingJournal = saveTradingJournalFallback;
    window.Logger?.debug('Using saveTradingJournal fallback from trading-journal-config.js', {
        page: 'trading-journal-config'
    });
}

// ייצוא לקונסול (לצורך debug)
window.tradingJournalModalConfig = tradingJournalModalConfig;
