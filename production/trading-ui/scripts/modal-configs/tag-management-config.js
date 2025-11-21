/**
 * Tag Management Modals Configuration
 * ===================================
 *
 * Defines ModalManagerV2 configurations for managing tag categories and tags.
 */

const tagCategoryModalConfig = {
    id: 'tagCategoryModal',
    entityType: 'tag_category',
    title: {
        add: 'קטגוריה חדשה',
        edit: 'עריכת קטגוריה'
    },
    size: 'md',
    headerType: 'dynamic',
    fields: [
        {
            type: 'text',
            id: 'tagCategoryName',
            label: 'שם קטגוריה',
            required: true,
            rowClass: 'row',
            colClass: 'col-12',
            maxLength: 100,
            placeholder: 'לדוגמה: אסטרטגיות'
        },
        {
            type: 'textarea',
            id: 'tagCategoryDescription',
            label: 'תיאור',
            rowClass: 'row',
            colClass: 'col-12',
            maxLength: 250,
            placeholder: 'תיאור קצר לקטגוריה (אופציונלי)'
        },
        {
            type: 'number',
            id: 'tagCategoryOrder',
            label: 'סדר תצוגה',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            description: 'ערך נמוך יוצג ראשון',
            min: 0,
            step: 1
        },
        {
            type: 'checkbox',
            id: 'tagCategoryActive',
            label: 'קטגוריה פעילה',
            rowClass: 'row',
            colClass: 'col-md-6 col-sm-12',
            defaultValue: true
        }
    ],
    validation: {
        tagCategoryName: { required: true, minLength: 2 }
    },
    onSave: 'TagManagementPage.saveTagCategory'
};

const tagModalConfig = {
    id: 'tagModal',
    entityType: 'tag',
    title: {
        add: 'תגית חדשה',
        edit: 'עריכת תגית'
    },
    size: 'md',
    headerType: 'dynamic',
    fields: [
        {
            type: 'text',
            id: 'tagName',
            label: 'שם תגית',
            required: true,
            rowClass: 'row',
            colClass: 'col-12',
            maxLength: 100,
            placeholder: 'לדוגמה: פריצה'
        },
        {
            type: 'select',
            id: 'tagCategory',
            label: 'קטגוריה',
            options: [],
            rowClass: 'row',
            colClass: 'col-12',
            placeholder: 'בחר קטגוריה (אופציונלי)'
        },
        {
            type: 'textarea',
            id: 'tagDescription',
            label: 'תיאור',
            rowClass: 'row',
            colClass: 'col-12',
            maxLength: 250,
            placeholder: 'תיאור קצר לתגית (אופציונלי)'
        },
        {
            type: 'checkbox',
            id: 'tagActive',
            label: 'תגית פעילה',
            rowClass: 'row',
            colClass: 'col-12',
            defaultValue: true
        }
    ],
    validation: {
        tagName: { required: true, minLength: 2 }
    },
    onSave: 'TagManagementPage.saveTag'
};

function initializeTagManagementModals() {
    if (!window.ModalManagerV2 || typeof window.ModalManagerV2.createCRUDModal !== 'function') {
        return false;
    }

    try {
        window.ModalManagerV2.createCRUDModal(tagCategoryModalConfig);
        window.ModalManagerV2.createCRUDModal(tagModalConfig);
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize tag management modals', error);
        return false;
    }
}

if (window.ModalManagerV2) {
    initializeTagManagementModals();
} else {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initializeTagManagementModals();
            }, 150);
        });
    } else {
        setTimeout(() => {
            initializeTagManagementModals();
        }, 150);
    }
}

window.tagCategoryModalConfig = tagCategoryModalConfig;
window.tagModalConfig = tagModalConfig;





