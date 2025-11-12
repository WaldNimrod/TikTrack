/**
 * Notes Modal Configuration
 * קונפיגורציה למודל הערות
 * 
 * @file notes-config.js
 * @version 2.0.0
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
