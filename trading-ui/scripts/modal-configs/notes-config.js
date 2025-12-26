/**
 * Notes Modal Configuration
 * קונפיגורציה למודל הערות
 * 
 * @file notes-config.js
 * @version 2.0.0
 * @lastUpdated January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeNotesModal() - Initializenotesmodal

// === Data Functions ===
// - saveNoteFallback() - Savenotefallback

// קונפיגורציה למודל הערות
const notesModalConfig = {
    id: 'notesModal',
    entityType: 'note',
    title: {
        add: 'הוספת הערה',
        edit: 'עריכת הערה'
    },
    size: 'lg',
    headerType: 'dynamic', // צבעים דינמיים לפי ישות
    fields: [
        // שורה ראשונה: סוג אובייקט מקושר + אובייקט מקושר (מועברים למעלה)
        {
            type: 'select',
            id: 'noteRelatedType',
            label: 'סוג אובייקט מקושר',
            required: true,
            options: [
                { value: '1', label: 'חשבון מסחר' },
                { value: '2', label: 'טרייד' },
                { value: '3', label: 'תוכנית השקעה' },
                { value: '4', label: 'טיקר' }
            ],
            defaultValue: '',
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'חובה - בחר לאיזה סוג אובייקט להקשר ההערה'
        },
        {
            type: 'select',
            id: 'noteRelatedObject',
            label: 'אובייקט מקושר',
            required: true,
            options: [], // יטען דינמית לפי סוג השיוך שנבחר
            placeholder: 'בחר אובייקט...',
            disabled: true,
            rowClass: 'row',
            colClass: 'col-md-6',
            description: 'חובה - בחר את האובייקט הספציפי'
        },
        // קו מפריד
        {
            type: 'separator',
            id: 'noteSeparator1'
        },
        {
            type: 'select',
            id: 'noteTags',
            label: 'תגיות',
            options: [],
            multiple: true,
            includeEmpty: false,
            additionalClasses: ['tag-multi-select'],
            rowClass: 'row',
            colClass: 'col-12',
            attributes: {
                'data-initial-value': '',
                'data-tag-entity': 'note'
            },
            description: 'הוסף תגיות להערה הזו לניהול משופר'
        },
        // שורה שנייה: תוכן הערה (בשורה מלאה) - Rich Text Editor
        {
            type: 'rich-text',
            id: 'noteContent',
            label: 'תוכן הערה',
            required: true,
            placeholder: 'הכנס את תוכן ההערה כאן...',
            maxLength: 10000,
            options: {
                direction: 'rtl',
                placeholder: 'הכנס את תוכן ההערה כאן...',
                minHeight: 200, // גובה מינימלי למודולים מקוננים
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
        // שורה שלישית: קובץ מצורף
        {
            type: 'file',
            id: 'noteAttachment',
            label: 'קובץ מצורף',
            required: false,
            accept: 'image/*,.pdf',
            description: 'אופציונלי - ניתן לצרף תמונה (JPG, PNG, GIF) או PDF (עד 512KB)',
            rowClass: 'row',
            colClass: 'col-12'
        }
    ],
    validation: {
        noteContent: {
            required: true,
            minLength: 1,
            maxLength: 10000
        },
        noteRelatedType: {
            required: true,
            enum: ['1', '2', '3', '4']
        },
        noteRelatedObject: {
            required: true,
            type: 'int'
        },
        noteAttachment: {
            required: false,
            maxSize: 524288 // 512KB in bytes
        }
    },
    onSave: 'saveNote'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeNotesModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(notesModalConfig);
            window.Logger?.debug?.('✅ Notes modal created successfully', { page: 'notes-config' });
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Notes modal:', error, { page: 'notes-config' });
            return false;
        }
    }
    return false;
}

if (window.ModalManagerV2) {
    initializeNotesModal();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (!initializeNotesModal()) {
                    setTimeout(() => {
                        if (!initializeNotesModal()) {
                            window.Logger?.debug?.('⚠️ ModalManagerV2 not available for Notes modal after retries', { page: 'notes-config' });
                        }
                    }, 500);
                }
            }, 100);
        });
    } else {
        setTimeout(() => {
            if (!initializeNotesModal()) {
                setTimeout(() => {
                    if (!initializeNotesModal()) {
                        console.warn('⚠️ ModalManagerV2 not available for Notes modal after retries');
                    }
                }, 500);
            }
        }, 100);
    }
}

// ===== FALLBACK saveNote FUNCTION =====
// This function is used when notes.js is not loaded (e.g., on trades.html)
// It uses UnifiedCRUDService to save notes

/**
 * Fallback saveNote function using UnifiedCRUDService
 * Used when notes.js is not loaded (e.g., on trades.html)
 * 
 * @global
 * @returns {Promise<void>}
 */
async function saveNoteFallback() {
    if (!window.UnifiedCRUDService) {
        window.showErrorNotification?.('שגיאה', 'מערכת השמירה לא זמינה. נא לרענן את הדף.');
        window.Logger?.error('UnifiedCRUDService not available for saveNote fallback', {
            page: 'notes-config'
        });
        return;
    }

    const form = document.getElementById('notesModalForm') || document.getElementById('addNoteForm');
    if (!form) {
        window.Logger?.warn('⚠️ Notes form not found - aborting save', { page: 'notes-config' });
        return;
    }

    // Collect form data
    const fieldMap = {
        content: { id: 'noteContent', type: 'rich-text' },
        related_type_id: { id: 'noteRelatedType', type: 'text' },
        related_id: { id: 'noteRelatedObject', type: 'int' },
        tag_ids: { id: 'noteTags', type: 'tags', default: [] }
    };

    const noteData = window.DataCollectionService?.collectFormData(fieldMap) || {};
    const content = noteData.content || '';
    const attachmentFile = document.getElementById('noteAttachment')?.files[0];

    // Validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent || textContent.length === 0) {
        window.showErrorNotification?.('שגיאה', 'תוכן ההערה חובה');
        return;
    }

    if (!noteData.related_type_id || !noteData.related_id) {
        window.showErrorNotification?.('שגיאה', 'יש לבחור סוג אובייקט ואובייקט מקושר');
        return;
    }

    if (content.length > 10000) {
        window.showErrorNotification?.('שגיאה', 'תוכן ההערה לא יכול להיות יותר מ-10000 תווים');
        return;
    }

    // Determine if edit mode
    const isEditMode = form.dataset.mode === 'edit';
    const formEntityId = form.dataset.entityId || form.dataset.noteId || form.querySelector('input[name="id"]')?.value || null;
    const noteId = isEditMode && formEntityId ? parseInt(formEntityId, 10) : null;

    try {
        // Prepare data
        const entityData = {
            content,
            related_type_id: parseInt(noteData.related_type_id),
            related_id: parseInt(noteData.related_id)
        };

        // Handle attachment if present
        if (attachmentFile) {
            // For attachments, we need to use FormData
            const formData = new FormData();
            formData.append('content', content);
            formData.append('related_type_id', entityData.related_type_id);
            formData.append('related_id', entityData.related_id);
            formData.append('attachment', attachmentFile);

            // Use direct fetch for FormData
            const url = noteId ? `/api/notes/${noteId}` : '/api/notes/';
            const method = noteId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                body: formData
            });

            // Handle response
            const crudOptions = {
                modalId: 'notesModal',
                successMessage: noteId ? 'הערה עודכנה בהצלחה!' : 'הערה נשמרה בהצלחה!',
                entityName: 'הערה',
                reloadFn: () => {
                    // Refresh linked items if available
                    if (window.updateLinkedItemsTable) {
                        window.updateLinkedItemsTable();
                    }
                    // Refresh notes table if available
                    if (window.updateNotesTable) {
                        window.updateNotesTable();
                    }
                },
                requiresHardReload: false
            };

            let resolvedNoteId = noteId;
            let result = null;
            if (noteId) {
                result = await window.CRUDResponseHandler?.handleUpdateResponse(response, crudOptions);
                resolvedNoteId = noteId || result?.id || result?.data?.id;
            } else {
                result = await window.CRUDResponseHandler?.handleSaveResponse(response, crudOptions);
                resolvedNoteId = result?.id || result?.data?.id || noteId;
            }

            // Handle tags only if save was successful
            if (result && Number.isFinite(resolvedNoteId) && window.TagService && Array.isArray(noteData.tag_ids)) {
                try {
                    await window.TagService.replaceEntityTags('note', resolvedNoteId, noteData.tag_ids);
                } catch (tagError) {
                    window.Logger?.warn('⚠️ Failed to update note tags', {
                        error: tagError,
                        noteId: resolvedNoteId,
                        page: 'notes-config'
                    });
                }
            }
        } else {
            // Use UnifiedCRUDService for non-attachment saves
            const options = {
                modalId: 'notesModal',
                successMessage: noteId ? 'הערה עודכנה בהצלחה!' : 'הערה נשמרה בהצלחה!',
                entityName: 'הערה',
                reloadFn: () => {
                    // Refresh linked items if available
                    if (window.updateLinkedItemsTable) {
                        window.updateLinkedItemsTable();
                    }
                    // Refresh notes table if available
                    if (window.updateNotesTable) {
                        window.updateNotesTable();
                    }
                },
                requiresHardReload: false,
                isEdit: !!noteId,
                entityId: noteId
            };

            const result = await window.UnifiedCRUDService.saveEntity('note', entityData, options);

            // Handle tags
            const resolvedNoteId = noteId || result?.id;
            if (Number.isFinite(resolvedNoteId) && window.TagService && Array.isArray(noteData.tag_ids)) {
                try {
                    await window.TagService.replaceEntityTags('note', resolvedNoteId, noteData.tag_ids);
                } catch (tagError) {
                    window.Logger?.warn('⚠️ Failed to update note tags', {
                        error: tagError,
                        noteId: resolvedNoteId,
                        page: 'notes-config'
                    });
                }
            }
        }
    } catch (error) {
        window.Logger?.error('Error saving note via fallback', {
            error,
            page: 'notes-config'
        });
        window.CRUDResponseHandler?.handleError(error, 'שמירת הערה');
    }
}

// Export saveNote to global scope - use fallback if notes.js is not loaded
if (typeof window.saveNote === 'undefined') {
    window.saveNote = saveNoteFallback;
    window.Logger?.debug('Using saveNote fallback from notes-config.js', {
        page: 'notes-config'
    });
}

// ייצוא לקונסול (לצורך debug)
window.notesModalConfig = notesModalConfig;
