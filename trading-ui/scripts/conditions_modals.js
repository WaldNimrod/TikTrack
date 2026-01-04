/**
 * Conditions Modals Page Script
 * =============================
 *
 * Initializes the conditions management interface for the conditions_modals.html page
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated January 4, 2026
 */

// ===== FUNCTION INDEX =====

// === Global Functions ===
// - initializeConditionsManagement() - Initialize the conditions management interface
// - loadConditionsData() - Load conditions data and render the interface
// - renderConditionsTable() - Render the conditions table with action buttons
// - createConditionRow() - Create a table row for a condition
// - setupConditionsEventListeners() - Setup event listeners for action buttons

// ===== IMPLEMENTATION =====

/**
 * Initialize the conditions management interface
 */
window.initializeConditionsManagement = async function() {
    window.Logger?.info?.('🎯 Starting Conditions Management initialization', {
        page: 'conditions_modals'
    });

    try {
        // Check if required elements exist
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            throw new Error('Main content container not found');
        }

        // Create conditions management container
        const conditionsContainer = document.createElement('div');
        conditionsContainer.id = 'conditions-management-container';
        conditionsContainer.className = 'conditions-management-container';

        // Add to page
        mainContent.appendChild(conditionsContainer);

        // Don't render table here - loadConditionsData() will handle it
        // The table will be rendered when loadConditionsData() is called

        // Setup event listeners (will be called again after data loads)
        setupConditionsEventListeners();

        window.Logger?.info?.('✅ Conditions Management interface initialized successfully', {
            page: 'conditions_modals'
        });

    } catch (error) {
        window.Logger?.error?.('❌ Failed to initialize Conditions Management:', error, {
            page: 'conditions_modals'
        });
        throw error;
    }
};

/**
 * Load conditions data and render the interface
 */
window.loadConditionsData = async function() {
    window.Logger?.info?.('📊 Loading conditions data', {
        page: 'conditions_modals'
    });

    try {
        // For now, create sample conditions data
        // In production, this would load from API
        const sampleConditions = [
            {
                id: 1,
                name: 'תנאי רווח יומי',
                type: 'profit',
                value: 100,
                status: 'active',
                description: 'תנאי להפעלה כאשר הרווח היומי מגיע ל-100 ₪'
            },
            {
                id: 2,
                name: 'תנאי הפסד מקסימלי',
                type: 'loss',
                value: -500,
                status: 'active',
                description: 'תנאי להפסקת פעילות כאשר ההפסד מגיע ל-500 ₪'
            },
            {
                id: 3,
                name: 'תנאי נפח מסחר',
                type: 'volume',
                value: 10000,
                status: 'inactive',
                description: 'תנאי להפעלה כאשר נפח המסחר מגיע ל-10,000 ₪'
            }
        ];

        // Store data globally for access
        window.conditionsData = sampleConditions;

        // Render the table with data
        await renderConditionsTable();

        window.Logger?.info?.('✅ Conditions data loaded and rendered', {
            conditionsCount: sampleConditions.length,
            page: 'conditions_modals'
        });

    } catch (error) {
        window.Logger?.error?.('❌ Failed to load conditions data:', error, {
            page: 'conditions_modals'
        });
        throw error;
    }
};

/**
 * Render the conditions table with action buttons
 */
async function renderConditionsTable() {
    const container = document.getElementById('conditions-management-container');
    if (!container) {
        window.Logger?.error?.('Conditions management container not found', {
            page: 'conditions_modals'
        });
        return;
    }

    const conditions = window.conditionsData || [];

    const tableHtml = `
        <div class="table-container">
            <div class="table-header">
                <h3>ניהול תנאים</h3>
                <button class="btn btn-primary btn-add" id="add-condition-btn">
                    <i class="fas fa-plus"></i> הוסף תנאי
                </button>
            </div>
            <table class="table table-striped conditions-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>שם התנאי</th>
                        <th>סוג</th>
                        <th>ערך</th>
                        <th>סטטוס</th>
                        <th>תיאור</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    ${conditions.map(condition => createConditionRow(condition)).join('')}
                </tbody>
            </table>
        </div>
    `;

        container.innerHTML = tableHtml;

        // Setup event listeners after rendering
        setupConditionsEventListeners();

    window.Logger?.info?.('📋 Conditions table rendered', {
        conditionsCount: conditions.length,
        page: 'conditions_modals'
    });
}

/**
 * Create a table row for a condition
 */
function createConditionRow(condition) {
    const statusClass = condition.status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = condition.status === 'active' ? 'פעיל' : 'לא פעיל';

    return `
        <tr data-condition-id="${condition.id}">
            <td>${condition.id}</td>
            <td>${condition.name}</td>
            <td>${condition.type}</td>
            <td>${condition.value}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${condition.description}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${condition.id}">
                    <i class="fas fa-edit"></i> ערוך
                </button>
                <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${condition.id}">
                    <i class="fas fa-trash"></i> מחק
                </button>
            </td>
        </tr>
    `;
}

/**
 * Setup event listeners for action buttons
 */
function setupConditionsEventListeners() {
    // Add condition button
    const addBtn = document.getElementById('add-condition-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function() {
            window.Logger?.info?.('➕ Add condition button clicked', {
                page: 'conditions_modals'
            });
            // TODO: Implement add condition modal
            alert('פונקציונליות הוספת תנאי תתווסף בקרוב');
        });
    }

    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.Logger?.info?.('✏️ Edit condition button clicked', {
                conditionId: id,
                page: 'conditions_modals'
            });
            // TODO: Implement edit condition modal
            alert(`פונקציונליות עריכת תנאי ${id} תתווסף בקרוב`);
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            window.Logger?.info?.('🗑️ Delete condition button clicked', {
                conditionId: id,
                page: 'conditions_modals'
            });
            // TODO: Implement delete confirmation
            if (confirm(`האם אתה בטוח שברצונך למחוק תנאי ${id}?`)) {
                // Remove from data and re-render
                window.conditionsData = window.conditionsData.filter(c => c.id != id);
                renderConditionsTable();
            }
        });
    });

    window.Logger?.info?.('🎧 Conditions event listeners setup completed', {
        page: 'conditions_modals'
    });
}

// ===== INITIALIZATION =====

// Auto-initialize if this script loads directly (not through init system)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Only auto-init if not using the unified init system
        if (!window.UnifiedAppInitializer) {
            window.Logger?.warn?.('Auto-initializing conditions_modals (fallback mode)', {
                page: 'conditions_modals'
            });
            window.initializeConditionsManagement().catch(console.error);
        }
    });
} else {
    // DOM already loaded
    if (!window.UnifiedAppInitializer) {
        window.Logger?.warn?.('Auto-initializing conditions_modals (immediate)', {
            page: 'conditions_modals'
        });
        window.initializeConditionsManagement().catch(console.error);
    }
}

window.Logger?.info?.('🎯 Conditions Modals script loaded', {
    page: 'conditions_modals'
});
