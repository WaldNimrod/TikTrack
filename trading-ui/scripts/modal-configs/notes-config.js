/**
 * Notes Modal Configuration
 * קונפיגורציה למודל הערות
 * 
 * @file notes-config.js
 * @version 1.0.0
 * @lastUpdated January 27, 2025
 */

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
        {
            type: 'text',
            id: 'noteTitle',
            label: 'כותרת הערה',
            required: true,
            placeholder: 'הכנס כותרת להערה'
        },
        {
            type: 'textarea',
            id: 'noteContent',
            label: 'תוכן הערה',
            required: true,
            rows: 6,
            placeholder: 'הכנס את תוכן ההערה כאן...'
        },
        {
            type: 'select',
            id: 'noteCategory',
            label: 'קטגוריה',
            required: false,
            options: [
                { value: 'general', label: 'כללי' },
                { value: 'research', label: 'מחקר' },
                { value: 'analysis', label: 'ניתוח' },
                { value: 'reminder', label: 'תזכורת' },
                { value: 'idea', label: 'רעיון' }
            ],
            defaultValue: 'general'
        },
        {
            type: 'select',
            id: 'notePriority',
            label: 'עדיפות',
            required: false,
            options: [
                { value: 'low', label: 'נמוכה' },
                { value: 'medium', label: 'בינונית' },
                { value: 'high', label: 'גבוהה' }
            ],
            defaultValue: 'medium'
        }
    ],
    validation: {
        noteTitle: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        noteContent: {
            required: true,
            minLength: 10,
            maxLength: 2000
        },
        noteCategory: {
            required: false
        },
        notePriority: {
            required: false
        }
    },
    onSave: 'saveNote'
};

// יצירת המודל אם ModalManagerV2 זמין - Deferred initialization
function initializeNotesModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(notesModalConfig);
            console.log('✅ Notes modal created successfully');
            return true;
        } catch (error) {
            console.error('❌ Error creating Notes modal:', error);
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
                            console.warn('⚠️ ModalManagerV2 not available for Notes modal after retries');
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

// ייצוא לקונסול (לצורך debug)
window.notesModalConfig = notesModalConfig;
