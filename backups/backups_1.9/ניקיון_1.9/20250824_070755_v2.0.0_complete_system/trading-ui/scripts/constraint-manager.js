/**
 * Constraint Manager - JavaScript for managing database constraints
 * Date: August 23, 2025
 * Description: Frontend JavaScript for the constraints management interface
 * 
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/constraint-manager.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

class ConstraintManager {
    constructor() {
        this.apiBase = 'http://localhost:8080/api/v1/constraints';
        this.currentConstraint = null;
        this.constraints = [];
        this.tables = [];

        this.init();
    }

    async init() {
        try {
            await this.loadStats();
            await this.loadTables();
            await this.loadConstraints();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing constraint manager:', error);
            this.showMessage('שגיאה בטעינת המערכת', 'error');
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();

            if (data.status === 'success') {
                document.getElementById('total-constraints').textContent = data.data.total_constraints;
                document.getElementById('total-tables').textContent = data.data.tables_with_constraints;
                document.getElementById('active-constraints').textContent = data.data.total_constraints;

                // Count enum values from constraints
                const enumCount = this.constraints.filter(c => c.constraint_type === 'ENUM')
                    .reduce((sum, c) => sum + (c.enum_values?.length || 0), 0);
                document.getElementById('total-enums').textContent = enumCount;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadTables() {
        try {
            const response = await fetch(`${this.apiBase}/tables`);
            const data = await response.json();

            if (data.status === 'success') {
                this.tables = data.data;
                this.populateTableFilter();
            }
        } catch (error) {
            console.error('Error loading tables:', error);
        }
    }

    async loadConstraints(tableFilter = '') {
        try {
            const url = tableFilter ? `${this.apiBase}/?table=${tableFilter}` : this.apiBase;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'success') {
                this.constraints = data.data;
                this.renderConstraintsList();
            }
        } catch (error) {
            console.error('Error loading constraints:', error);
            this.showMessage('שגיאה בטעינת האילוצים', 'error');
        }
    }

    populateTableFilter() {
        const select = document.getElementById('table-filter');
        select.innerHTML = '<option value="">כל הטבלאות</option>';

        this.tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table;
            option.textContent = table;
            select.appendChild(option);
        });
    }

    renderConstraintsList() {
        const container = document.getElementById('constraints-list-container');

        if (this.constraints.length === 0) {
            container.innerHTML = '<div class="text-center text-muted">אין אילוצים להצגה</div>';
            return;
        }

        const html = this.constraints.map(constraint => this.renderConstraintItem(constraint)).join('');
        container.innerHTML = html;
    }

    renderConstraintItem(constraint) {
        const badgeClass = this.getBadgeClass(constraint.constraint_type);
        const badgeText = this.getBadgeText(constraint.constraint_type);

        let enumValuesHtml = '';
        if (constraint.constraint_type === 'ENUM' && constraint.enum_values) {
            enumValuesHtml = `
                <div class="enum-values-list">
                    <small><strong>ערכים מותרים:</strong></small>
                    ${constraint.enum_values.map(ev =>
                `<div class="enum-value-item">
                            <span>${ev.value}</span>
                            <span class="text-muted">${ev.display_name}</span>
                        </div>`
            ).join('')}
                </div>
            `;
        }

        return `
            <div class="constraint-item" data-constraint-id="${constraint.id}" onclick="constraintManager.selectConstraint(${constraint.id})">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${constraint.table_name}.${constraint.column_name}</strong>
                        <span class="constraint-type-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <small class="text-muted">${constraint.constraint_name}</small>
                </div>
                <div class="mt-2">
                    <small class="text-muted">${constraint.constraint_definition}</small>
                </div>
                ${enumValuesHtml}
            </div>
        `;
    }

    getBadgeClass(constraintType) {
        const classes = {
            'ENUM': 'badge-enum',
            'NOT_NULL': 'badge-not-null',
            'RANGE': 'badge-range',
            'UNIQUE': 'badge-unique'
        };
        return classes[constraintType] || 'badge-enum';
    }

    getBadgeText(constraintType) {
        const texts = {
            'ENUM': 'ENUM',
            'NOT_NULL': 'NOT NULL',
            'RANGE': 'RANGE',
            'UNIQUE': 'UNIQUE'
        };
        return texts[constraintType] || constraintType;
    }

    selectConstraint(constraintId) {
        // Remove active class from all items
        document.querySelectorAll('.constraint-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        const selectedItem = document.querySelector(`[data-constraint-id="${constraintId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Find constraint data
        this.currentConstraint = this.constraints.find(c => c.id === constraintId);
        if (this.currentConstraint) {
            this.renderConstraintEditor();
        }
    }

    renderConstraintEditor() {
        const container = document.getElementById('editor-container');
        const constraint = this.currentConstraint;

        let enumValuesHtml = '';
        if (constraint.constraint_type === 'ENUM' && constraint.enum_values) {
            enumValuesHtml = `
                <div class="form-section">
                    <h5>ערכי ENUM</h5>
                    ${constraint.enum_values.map(ev => `
                        <div class="enum-value-item">
                            <input type="text" class="form-control" value="${ev.value}" readonly>
                            <input type="text" class="form-control" value="${ev.display_name}" readonly>
                            <input type="number" class="form-control" value="${ev.sort_order}" readonly>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        container.innerHTML = `
            <form id="edit-constraint-form">
                <div class="form-section">
                    <h5>פרטי האילוץ</h5>
                    <div class="mb-3">
                        <label class="form-label">שם הטבלה</label>
                        <input type="text" class="form-control" value="${constraint.table_name}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">שם העמודה</label>
                        <input type="text" class="form-control" value="${constraint.column_name}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">סוג האילוץ</label>
                        <input type="text" class="form-control" value="${constraint.constraint_type}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">שם האילוץ</label>
                        <input type="text" class="form-control" value="${constraint.constraint_name}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">הגדרת האילוץ</label>
                        <input type="text" class="form-control" value="${constraint.constraint_definition}" readonly>
                    </div>
                </div>
                ${enumValuesHtml}
                <div class="text-center">
                    <button type="button" class="btn btn-danger" onclick="constraintManager.deleteConstraint(${constraint.id})">
                        <i class="fas fa-trash"></i> מחק אילוץ
                    </button>
                </div>
            </form>
        `;
    }

    async deleteConstraint(constraintId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק את האילוץ הזה?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/${constraintId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.status === 'success') {
                this.showMessage('האילוץ נמחק בהצלחה', 'success');
                await this.loadConstraints();
                document.getElementById('editor-container').innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
                        <p>בחר אילוץ מהרשימה כדי לערוך אותו</p>
                    </div>
                `;
            } else {
                this.showMessage('שגיאה במחיקת האילוץ', 'error');
            }
        } catch (error) {
            console.error('Error deleting constraint:', error);
            this.showMessage('שגיאה במחיקת האילוץ', 'error');
        }
    }

    async addConstraint(formData) {
        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.status === 'success') {
                this.showMessage('האילוץ נוסף בהצלחה', 'success');
                document.getElementById('add-constraint-form').reset();
                document.getElementById('enum-values-section').style.display = 'none';
                await this.loadConstraints();
            } else {
                this.showMessage(data.message || 'שגיאה בהוספת האילוץ', 'error');
            }
        } catch (error) {
            console.error('Error adding constraint:', error);
            this.showMessage('שגיאה בהוספת האילוץ', 'error');
        }
    }

    setupEventListeners() {
        // Table filter
        document.getElementById('table-filter').addEventListener('change', (e) => {
            this.loadConstraints(e.target.value);
        });

        // Add constraint form
        document.getElementById('add-constraint-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddConstraint();
        });

        // Constraint type change
        document.getElementById('constraint-type').addEventListener('change', (e) => {
            const enumSection = document.getElementById('enum-values-section');
            if (e.target.value === 'ENUM') {
                enumSection.style.display = 'block';
            } else {
                enumSection.style.display = 'none';
            }
        });
    }

    handleAddConstraint() {
        const formData = {
            table_name: document.getElementById('table-name').value,
            column_name: document.getElementById('column-name').value,
            constraint_type: document.getElementById('constraint-type').value,
            constraint_name: document.getElementById('constraint-name').value,
            constraint_definition: document.getElementById('constraint-definition').value
        };

        // Add enum values if it's an ENUM constraint
        if (formData.constraint_type === 'ENUM') {
            const enumValues = [];
            const enumItems = document.querySelectorAll('#enum-values-container .enum-value-item');

            enumItems.forEach(item => {
                const value = item.querySelector('[name="enum-value"]').value;
                const display = item.querySelector('[name="enum-display"]').value;
                const sort = item.querySelector('[name="enum-sort"]').value;

                if (value && display) {
                    enumValues.push({
                        value: value,
                        display_name: display,
                        sort_order: parseInt(sort) || 1
                    });
                }
            });

            formData.enum_values = enumValues;
        }

        this.addConstraint(formData);
    }

    showMessage(message, type) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        messagesContainer.appendChild(messageDiv);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Global functions for enum values
function addEnumValue() {
    const container = document.getElementById('enum-values-container');
    const newItem = document.createElement('div');
    newItem.className = 'enum-value-item';
    newItem.innerHTML = `
        <input type="text" class="form-control" placeholder="ערך" name="enum-value">
        <input type="text" class="form-control" placeholder="שם תצוגה" name="enum-display">
        <input type="number" class="form-control" placeholder="סדר" name="enum-sort" value="1">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeEnumValue(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(newItem);
}

// Global function to show add constraint modal
function showAddConstraintModal() {
    const modal = document.getElementById('add-constraint-modal');
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

function removeEnumValue(button) {
    button.closest('.enum-value-item').remove();
}

// Initialize constraint manager when page loads
let constraintManager;
document.addEventListener('DOMContentLoaded', () => {
    constraintManager = new ConstraintManager();
});
