/**
 * Alerts Modal Configuration
 * קונפיגורציה למודל התראות
 * 
 * @file alerts-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeAlertsModal() - Initializealertsmodal

// === Data Functions ===
// - saveAlertFallback() - Savealertfallback

// קונפיגורציה למודל התראות
const alertsModalConfig = {
    id: 'alertsModal',
    entityType: 'alert',
    title: {
        add: 'הוספת התראה',
        edit: 'עריכת התראה'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        // שורה ראשונה: טיקר + פרטי מחיר עדכני
        {
            type: 'display',
            id: 'alertTicker',
            label: 'טיקר',
            required: false,
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'display',
            id: 'alertTickerInfo',
            label: 'פרטי מחיר עדכני',
            rowClass: 'row',
            colClass: 'col-md-6',
            renderFn: 'renderTickerInfo'
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'alertSeparator1'
        },
        // שורה שנייה: סוג אובייקט מקושר + אובייקט מקושר
        {
            type: 'select',
            id: 'alertRelatedType',
            label: 'סוג אובייקט מקושר',
            required: false,
            options: [
                { value: '1', label: 'חשבון מסחר' },
                { value: '2', label: 'טרייד' },
                { value: '3', label: 'תוכנית השקעה' },
                { value: '4', label: 'טיקר' }
            ],
            defaultValue: '4',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'אופציונלי - ניתן לשייך התראה לאובייקט ספציפי'
        },
        {
            type: 'select',
            id: 'alertRelatedObject',
            label: 'אובייקט מקושר',
            required: false,
            options: [], // יטען דינמית לפי סוג השיוך שנבחר
            placeholder: 'בחר אובייקט...',
            disabled: true,
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        // שורה שלישית: מצב משולב + תאריך יצירה + תאריך תפוגה
        {
            type: 'select',
            id: 'alertStatusCombined',
            name: 'alertStatusCombined',
            label: 'מצב',
            required: true,
            options: [
                { value: 'new', label: 'חדש' },  // open + false
                { value: 'active', label: 'פעיל' },  // open + new
                { value: 'unread', label: 'לא נקרא' },  // closed + new
                { value: 'read', label: 'נקרא' },  // closed + true
                { value: 'cancelled', label: 'מבוטל' }  // cancelled + false
            ],
            defaultValue: 'new',
            rowClass: 'row',
            colClass: 'col-md-4'
        },
        {
            type: 'display',
            id: 'alertCreatedAt',
            label: 'תאריך יצירה',
            required: false,
            rowClass: 'row',
            colClass: 'col-md-4'
        },
        {
            type: 'date',
            id: 'alertExpiryDate',
            name: 'expiry_date',
            label: 'תאריך תפוגה',
            required: false,
            rowClass: 'row',
            colClass: 'col-md-4',
            description: 'ברירת מחדל: שנה מהיום (ניתן לשינוי)'
        },
        // שורה רביעית: שדות התנאי
        {
            type: 'select',
            id: 'alertType',
            label: 'מאפיין תנאי',
            required: true,
            options: [
                { value: 'price', label: 'מחיר' },
                { value: 'change', label: 'שינוי' },
                { value: 'ma', label: 'ממוצע נע' },
                { value: 'volume', label: 'נפח' }
            ],
            defaultValue: 'price',
            rowClass: 'row',
            colClass: 'col-md-4'
        },
        {
            type: 'select',
            id: 'alertCondition',
            label: 'אופרטור תנאי',
            required: true,
            options: [
                { value: 'more_than', label: 'יותר מ-' },
                { value: 'less_than', label: 'פחות מ-' },
                { value: 'cross', label: 'חוצה' },
                { value: 'cross_up', label: 'חוצה למעלה' },
                { value: 'cross_down', label: 'חוצה למטה' },
                { value: 'change', label: 'שינוי' },
                { value: 'change_up', label: 'שינוי למעלה' },
                { value: 'change_down', label: 'שינוי למטה' },
                { value: 'equals', label: 'שווה' }
            ],
            defaultValue: 'more_than',
            rowClass: 'row',
            colClass: 'col-md-4'
        },
        {
            type: 'number',
            id: 'alertValue',
            label: 'ערך התראה',
            required: true,
            min: 0,
            step: 0.01,
            placeholder: 'הכנס ערך התראה...',
            rowClass: 'row',
            colClass: 'col-md-4'
        },
        {
            type: 'select',
            id: 'alertTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row',
            colClass: 'col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'alert'
            },
            description: 'הוסף תגיות שיופיעו לצד ההתראה'
        },
        // הודעה - בסוף אחרי סטטוס ותאריכים
        {
            type: 'rich-text',
            id: 'alertName',
            label: 'הודעה',
            required: true,
            placeholder: 'הכנס הודעת התראה',
            maxLength: 5000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס הודעת התראה',
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
        alertTicker: {
            required: true
        },
        alertName: {
            required: true,
            minLength: 1,
            maxLength: 5000
        },
        alertType: {
            required: true
        },
        alertValue: {
            required: true,
            min: 0
        },
        alertCondition: {
            required: true
        },
        alertStatusCombined: {
            required: true
        },
        alertExpiryDate: {
            required: false
        },
        alertNotes: {
            required: false,
            maxLength: 5000
        }
    },
    onSave: 'saveAlert'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeAlertsModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(alertsModalConfig);
            window.Logger?.debug?.('✅ Alerts modal created successfully', { page: 'alerts-config' });
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Alerts modal:', error, { page: 'alerts-config' });
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeAlertsModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeAlertsModal()) {
                    setTimeout(() => {
                        if (!initializeAlertsModal()) {
                            window.Logger?.debug?.('⚠️ ModalManagerV2 not available for Alerts modal after retries', { page: 'alerts-config' });
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeAlertsModal()) {
                setTimeout(() => {
                    if (!initializeAlertsModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Alerts modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ===== FALLBACK saveAlert FUNCTION =====
// This function is used when alerts.js is not loaded (e.g., on trade_plans.html)
// It uses UnifiedCRUDService to save alerts

/**
 * Fallback saveAlert function using UnifiedCRUDService
 * Used when alerts.js is not loaded (e.g., on trade_plans.html)
 * 
 * @global
 * @returns {Promise<void>}
 */
async function saveAlertFallback() {
    if (!window.UnifiedCRUDService) {
        window.showErrorNotification?.('שגיאה', 'מערכת השמירה לא זמינה. נא לרענן את הדף.');
        window.Logger?.error('UnifiedCRUDService not available for saveAlert fallback', {
            page: 'alerts-config'
        });
        return;
    }

    const form = document.getElementById('alertsModalForm') || document.getElementById('addAlertForm');
    if (!form) {
        window.Logger?.warn('⚠️ Alerts form not found - aborting save', { page: 'alerts-config' });
        return;
    }

    // Check form validity
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Collect form data - use hidden fields if available (created by ModalManagerV2)
    // ModalManagerV2 creates alertStatus_hidden and alertIsTriggered_hidden from alertStatusCombined
    const statusHidden = form.querySelector('#alertStatus_hidden');
    const isTriggeredHidden = form.querySelector('#alertIsTriggered_hidden');
    
    // Collect basic form data - use DataCollectionService if available
    const relatedType = window.DataCollectionService?.getValue('alertRelatedType', 'text', '') || '';
    const relatedId = window.DataCollectionService?.getValue('alertRelatedObject', 'text', '') || '';
    const conditionAttribute = window.DataCollectionService?.getValue('alertType', 'text', '') || '';
    const conditionOperator = window.DataCollectionService?.getValue('alertCondition', 'text', '') || '';
    const conditionNumber = window.DataCollectionService?.getValue('alertValue', 'text', '') || '';
    const expiryDate = form.querySelector('#alertExpiryDate')?.value || null;
    
    // Get status and is_triggered from hidden fields (preferred) or parse from combined field
    let status = statusHidden?.value || 'open';
    let isTriggered = isTriggeredHidden?.value || 'false';
    
    // If hidden fields don't exist, parse from combined field (fallback)
    if (!statusHidden || !isTriggeredHidden) {
        const statusCombined = form.querySelector('#alertStatusCombined')?.value || 'new';
        // Parse combined status to status and is_triggered
        if (statusCombined === 'cancelled') {
            status = 'cancelled';
            isTriggered = 'false';
        } else if (statusCombined === 'new' || statusCombined === 'active') {
            status = 'open';
            isTriggered = 'false';
        } else if (statusCombined === 'unread') {
            status = 'closed';
            isTriggered = 'new';
        } else if (statusCombined === 'read') {
            status = 'closed';
            isTriggered = 'true';
        }
    }
    
    // Get rich text content if available
    let message = '';
    if (window.RichTextEditorService && typeof window.RichTextEditorService.getContent === 'function') {
        message = window.RichTextEditorService.getContent('alertName') || '';
    } else {
        const messageField = form.querySelector('#alertName');
        if (messageField) {
            message = messageField.value || '';
        }
    }
    
    // Get tags
    let tagIds = [];
    const tagsSelect = form.querySelector('#alertTags');
    if (tagsSelect) {
        if (window.TagUIManager && typeof window.TagUIManager.getSelectedValues === 'function') {
            tagIds = window.TagUIManager.getSelectedValues(tagsSelect);
        } else {
            tagIds = Array.from(tagsSelect.selectedOptions || [])
                .map(option => parseInt(option.value, 10))
                .filter(Number.isFinite);
        }
    }

    // Validation
    if (!conditionAttribute || !conditionOperator || conditionNumber === undefined || conditionNumber === '') {
        window.showErrorNotification?.('שגיאה', 'יש למלא את כל שדות התנאי (סוג, תנאי, ערך)');
        return;
    }

    // Validate condition number is numeric
    const numericValue = parseFloat(conditionNumber);
    if (isNaN(numericValue)) {
        window.showErrorNotification?.('שגיאה', 'ערך התנאי חייב להיות מספר');
        return;
    }

    // Determine if edit mode
    const isEditMode = form.dataset.mode === 'edit';
    const formEntityId = form.dataset.entityId || form.dataset.alertId || form.querySelector('input[name="id"]')?.value || null;
    const alertId = isEditMode && formEntityId ? parseInt(formEntityId, 10) : null;

    try {
        // Prepare data
        const entityData = {
            related_type_id: relatedType ? parseInt(relatedType) : null,
            related_id: relatedId ? parseInt(relatedId) : null,
            condition_attribute: conditionAttribute,
            condition_operator: conditionOperator,
            condition_number: numericValue,
            message: message || null,
            status: status || 'open',
            is_triggered: isTriggered || 'false'
        };

        // Add expiry_date if provided
        if (expiryDate && expiryDate !== '') {
            entityData.expiry_date = expiryDate;
        }

        // Use UnifiedCRUDService for saving
        const options = {
            modalId: 'alertsModal',
            successMessage: alertId ? 'התראה עודכנה בהצלחה!' : 'התראה נשמרה בהצלחה!',
            entityName: 'התראה',
            reloadFn: () => {
                // Refresh linked items if available
                if (window.updateLinkedItemsTable) {
                    window.updateLinkedItemsTable();
                }
                // Refresh alerts table if available
                if (window.updateAlertsTable) {
                    window.updateAlertsTable();
                }
            },
            requiresHardReload: false,
            isEdit: !!alertId,
            entityId: alertId
        };

        const result = await window.UnifiedCRUDService.saveEntity('alert', entityData, options);

        // Handle tags
        const resolvedAlertId = alertId || result?.id;
        if (Number.isFinite(resolvedAlertId) && window.TagService && Array.isArray(tagIds) && tagIds.length > 0) {
            try {
                await window.TagService.replaceEntityTags('alert', resolvedAlertId, tagIds);
            } catch (tagError) {
                window.Logger?.warn('⚠️ Failed to update alert tags', {
                    error: tagError,
                    alertId: resolvedAlertId,
                    page: 'alerts-config'
                });
            }
        }
    } catch (error) {
        window.Logger?.error('Error saving alert via fallback', {
            error,
            page: 'alerts-config'
        });
        window.CRUDResponseHandler?.handleError(error, 'שמירת התראה');
    }
}

// Export saveAlert to global scope - use fallback if alerts.js is not loaded
if (typeof window.saveAlert === 'undefined') {
    window.saveAlert = saveAlertFallback;
    window.Logger?.debug('Using saveAlert fallback from alerts-config.js', {
        page: 'alerts-config'
    });
}

// ייצוא לקונסול (לצורך debug)
window.alertsModalConfig = alertsModalConfig;


