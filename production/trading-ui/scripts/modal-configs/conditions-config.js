/**
 * Conditions Manager Modal Configuration
 * ======================================
 *
 * Provides a container modal for managing plan/trade conditions.
 * The modal body hosts the ConditionsUIManager which handles all
 * CRUD operations and rendering internally.
 */
const conditionsModalConfig = {
    id: 'conditionsModal',
    entityType: 'conditions_manager',
    title: {
        add: 'ניהול תנאים',
        edit: 'ניהול תנאים'
    },
    size: 'xl',
    headerType: 'dynamic',
    fields: [
        {
            type: 'custom',
            id: 'conditionsModalHeaderActions',
            html: `
                <div class="d-flex justify-content-between align-items-center mb-2 conditions-modal-toolbar">
                    <button type="button" class="btn btn-outline-secondary btn-sm d-none" data-action="conditions-back">
                        ← חזרה לעריכה
                    </button>
                    <span id="conditionsModalEntityLabel" class="text-muted small"></span>
                </div>
            `
        },
        {
            type: 'custom',
            id: 'conditionsManagerContainer',
            html: `
                <div id="conditionsManagerRoot" class="conditions-manager-root"></div>
            `
        }
    ],
    onSave: 'conditionsModalNoop'
};

window.conditionsModalConfig = conditionsModalConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = conditionsModalConfig;
}


