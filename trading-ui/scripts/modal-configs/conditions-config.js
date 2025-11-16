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


