/**
 * Constraint Manager - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the constraint management system for TikTrack.
 * Provides database constraint management interface with CRUD operations.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/CONSTRAINT_MANAGEMENT_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 2.2
 * Last Updated: 2025-01-27
 */

// Global constraint manager instance
let constraintManager;

/**
 * Constraint Manager Class
 * @class ConstraintManager
 */
class ConstraintManager {
  /**
   * Constructor - Initialize ConstraintManager
   * @constructor
   */
  constructor() {
        // Use relative URL to work with both development (8080) and production (5001)
        this.apiBase = '/api/constraints';
    this.currentConstraint = null;
    this.constraints = [];
    this.tables = [];

    this.init();
  }

  /**
   * Initialize constraint manager
   * @function init
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    try {
      await this.loadStats();
      await this.loadTables();
      await this.loadConstraints();
      this.setupEventListeners();
    } catch {
      // Error initializing constraint manager
      this.showMessage('שגיאה בטעינת המערכת', 'error');
    }
  }

  /**
   * Load constraint statistics
   * @function loadStats
   * @async
   * @returns {Promise<void>}
   */
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
    } catch {
      // Error loading stats
    }
  }

  /**
   * Load database tables
   * @function loadTables
   * @async
   * @returns {Promise<void>}
   */
  async loadTables() {
    try {
      const response = await fetch(`${this.apiBase}/tables`);
      const data = await response.json();

      if (data.status === 'success') {
        this.tables = data.data;
        this.populateTableFilter();
      }
    } catch {
      // Error loading tables
    }
  }

  /**
   * Load constraints with optional table filter
   * @function loadConstraints
   * @async
   * @param {string} tableFilter - Table filter
   * @returns {Promise<void>}
   */
  async loadConstraints(tableFilter = '') {
    try {
      const url = tableFilter ? `${this.apiBase}/?table=${tableFilter}` : this.apiBase;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'success') {
        this.constraints = data.data;
        this.renderConstraintsList();
      } else {
        // Error loading constraints
        this.showMessage('שגיאה בטעינת האילוצים', 'error');
      }
    } catch (error) {
      // Error loading constraints
      console.error('שגיאה בטעינת constraints:', error);
      this.showMessage('שגיאה בטעינת האילוצים מהשרת', 'error');
      // אין נתוני דמה - רק הודעת שגיאה
      this.constraints = [];
      this.renderConstraintsList();
      this.updateStats();
    }
  }



  /**
   * Update statistics display
   * @function updateStats
   * @returns {void}
   */
  updateStats() {
    document.getElementById('total-constraints').textContent = this.constraints.length;
    document.getElementById('total-tables').textContent = new Set(this.constraints.map(c => c.table_name)).size;
    document.getElementById('active-constraints').textContent = this.constraints.length;

    const enumCount = this.constraints.filter(c => c.constraint_type === 'ENUM')
      .reduce((sum, c) => sum + (c.enum_values?.length || 0), 0);
    document.getElementById('total-enums').textContent = enumCount;
  }

  /**
   * Populate table filter dropdown
   * @function populateTableFilter
   * @returns {void}
   */
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

  /**
   * Render constraints list
   * @function renderConstraintsList
   * @returns {void}
   */
  renderConstraintsList() {
    const container = document.getElementById('constraints-list-container');

    if (this.constraints.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">אין אילוצים להצגה</div>';
      return;
    }

    const html = this.constraints.map(constraint => this.renderConstraintItem(constraint)).join('');
    container.innerHTML = html;
  }

  /**
   * Render filtered constraints
   * @function renderFilteredConstraints
   * @param {Array} filteredConstraints - Filtered constraints array
   * @returns {void}
   */
  renderFilteredConstraints(filteredConstraints) {
    const container = document.getElementById('constraints-list-container');

    if (filteredConstraints.length === 0) {
      container.innerHTML = '<div class="text-center text-muted">לא נמצאו אילוצים התואמים לחיפוש</div>';
      return;
    }

    const html = filteredConstraints.map(constraint => this.renderConstraintItem(constraint)).join('');
    container.innerHTML = html;
  }

  /**
   * Render single constraint item
   * @function renderConstraintItem
   * @param {Object} constraint - Constraint object
   * @returns {string} HTML string
   */
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
                        </div>`,
  ).join('')}
                </div>
            `;
    }

    return `
            <div class="constraint-item" 
                 data-constraint-id="${constraint.id}" 
                 onclick="selectConstraint(${constraint.id})">
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

  static getBadgeClass(constraintType) {
    const classes = {
      'ENUM': 'badge-enum',
      'NOT_NULL': 'badge-not-null',
      'RANGE': 'badge-range',
      'UNIQUE': 'badge-unique',
    };
    return classes[constraintType] || 'badge-enum';
  }

  static getBadgeText(constraintType) {
    const texts = {
      'ENUM': 'ENUM',
      'NOT_NULL': 'NOT NULL',
      'RANGE': 'RANGE',
      'UNIQUE': 'UNIQUE',
    };
    return texts[constraintType] || constraintType;
  }

  /**
   * Select constraint by ID
   * @function selectConstraint
   * @param {string} constraintId - Constraint ID
   * @returns {void}
   */
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

  // Global function for selecting constraint
  static selectConstraint(constraintId) {
    if (constraintManager) {
      constraintManager.selectConstraint(constraintId);
    }
  }

  /**
   * Render constraint editor
   * @function renderConstraintEditor
   * @returns {void}
   */
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
                    <button data-button-type="DELETE" data-variant="full" 
                            data-onclick="constraintManager.deleteConstraint(${constraint.id})" data-text="מחק אילוץ" title="מחק אילוץ"></button>
                </div>
            </form>
        `;
  }

  /**
   * Delete constraint by ID
   * @function deleteConstraint
   * @async
   * @param {string} constraintId - Constraint ID
   * @returns {Promise<void>}
   */
  async deleteConstraint(constraintId) {
    if (typeof window.showConfirmationDialog === 'function') {
      const confirmed = await new Promise(resolve => {
        window.showConfirmationDialog(
          'מחיקת אילוץ',
          'האם אתה בטוח שברצונך למחוק את האילוץ הזה?',
          () => resolve(true),
          () => resolve(false),
        );
      });
      if (!confirmed) {return;}
    } else {
      // Fallback למקרה שמערכת התראות לא זמינה
      const confirmed = typeof showConfirmationDialog === 'function' ? 
        await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך למחוק את האילוץ הזה?',
            () => resolve(true),
            () => resolve(false),
            'מחיקת אילוץ',
            'מחק',
            'ביטול'
          );
        }) : 
        window.window.showConfirmationDialog('אישור', 'האם אתה בטוח שברצונך למחוק את האילוץ הזה?');
      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch(`${this.apiBase}/${constraintId}`, {
        method: 'DELETE',
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
    } catch {
      // Error deleting constraint
      this.showMessage('שגיאה במחיקת האילוץ', 'error');
    }
  }


  /**
   * Setup event listeners
   * @function setupEventListeners
   * @returns {void}
   */
  setupEventListeners() {
    // Table filter
    const tableFilter = document.getElementById('table-filter');
    if (tableFilter) {
      tableFilter.addEventListener('change', e => {
        this.loadConstraints(e.target.value);
      });
    }

    // Add constraint form
    const addForm = document.getElementById('add-constraint-form');
    if (addForm) {
      addForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleAddConstraint();
      });
    }

    // Constraint type change
    const constraintType = document.getElementById('constraint-type');
    if (constraintType) {
      constraintType.addEventListener('change', e => {
        const enumSection = document.getElementById('enum-values-section');
        if (enumSection) {
          if (e.target.value === 'ENUM') {
            enumSection.style.display = 'block';
          } else {
            enumSection.style.display = 'none';
          }
        }
      });
    }
  }

  /**
   * Handle add constraint form submission
   * @function handleAddConstraint
   * @returns {void}
   */
  handleAddConstraint() {
    let formData;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.collectFormData) {
      // Use DataCollectionService to collect form data
      const fieldMap = {
        table_name: { id: 'table-name', type: 'text' },
        column_name: { id: 'column-name', type: 'text' },
        constraint_type: { id: 'constraint-type', type: 'text' },
        constraint_name: { id: 'constraint-name', type: 'text' },
        constraint_definition: { id: 'constraint-definition', type: 'text' }
      };
      formData = window.DataCollectionService.collectFormData(fieldMap);
    } else {
      // Fallback if DataCollectionService is not available
      formData = {
        // Use DataCollectionService to get values if available
        table_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('table-name', 'text', '') 
          : (document.getElementById('table-name')?.value || ''),
        column_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('column-name', 'text', '') 
          : (document.getElementById('column-name')?.value || ''),
        constraint_type: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('constraint-type', 'text', '') 
          : (document.getElementById('constraint-type')?.value || ''),
        constraint_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('constraint-name', 'text', '') 
          : (document.getElementById('constraint-name')?.value || ''),
        constraint_definition: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('constraint-definition', 'text', '') 
          : (document.getElementById('constraint-definition')?.value || '')
      };
    }

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
            value,
            display_name: display,
            sort_order: parseInt(sort) || 1,
          });
        }
      });

      formData.enum_values = enumValues;
    }

    this.addConstraint(formData);
  }

  // Global function for adding new constraint
  static addNewConstraint() {
    if (constraintManager) {
      constraintManager.handleAddConstraint();
    }
  }

  static showMessage(message, type) {
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

  /**
   * Handle modal add constraint form submission
   * @function handleModalAddConstraint
   * @returns {void}
   */
  handleModalAddConstraint() {
    let formData;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.collectFormData) {
      // Use DataCollectionService to collect form data
      const fieldMap = {
        table_name: { id: 'modal-table-name', type: 'text' },
        column_name: { id: 'modal-column-name', type: 'text' },
        constraint_type: { id: 'modal-constraint-type', type: 'text' },
        constraint_name: { id: 'modal-constraint-name', type: 'text' },
        constraint_definition: { id: 'modal-constraint-definition', type: 'text' }
      };
      formData = window.DataCollectionService.collectFormData(fieldMap);
    } else {
      // Fallback if DataCollectionService is not available
      formData = {
        // Use DataCollectionService to get values if available
        table_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('modal-table-name', 'text', '') 
          : (document.getElementById('modal-table-name')?.value || ''),
        column_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('modal-column-name', 'text', '') 
          : (document.getElementById('modal-column-name')?.value || ''),
        constraint_type: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('modal-constraint-type', 'text', '') 
          : (document.getElementById('modal-constraint-type')?.value || ''),
        constraint_name: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('modal-constraint-name', 'text', '') 
          : (document.getElementById('modal-constraint-name')?.value || ''),
        constraint_definition: (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) 
          ? window.DataCollectionService.getValue('modal-constraint-definition', 'text', '') 
          : (document.getElementById('modal-constraint-definition')?.value || '')
      };
    }

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
            value,
            display_name: display,
            sort_order: parseInt(sort) || 1,
          });
        }
      });

      formData.enum_values = enumValues;
    }

    this.addConstraint(formData);

    // Close modal
    const modal = document.getElementById('add-constraint-modal');
    if (modal && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }

  // Global function for handling modal add constraint
  static handleModalAddConstraint() {
    if (constraintManager) {
      constraintManager.handleModalAddConstraint();
    }
  }

  /**
   * Add new constraint
   * @function addConstraint
   * @async
   * @param {FormData} formData - Form data
   * @returns {Promise<void>}
   */
  async addConstraint(formData) {
    try {
      const response = await fetch(this.apiBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        ConstraintManager.showMessage('האילוץ נוסף בהצלחה', 'success');
        await this.loadConstraints();
        this.updateStats();
      } else {
        ConstraintManager.showMessage('שגיאה בהוספת האילוץ', 'error');
      }
    } catch {
      ConstraintManager.showMessage('שגיאה בהוספת האילוץ', 'error');
    }
  }
}

// Global functions for enum values

// Global function to show add constraint modal
function showAddConstraintModal() {

  // יצירת מודל דינמי אם לא קיים
  let modal = document.getElementById('add-constraint-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'add-constraint-modal';
    modal.className = 'modal fade';
    modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header linkedItems_modal-header-colored">
                        <h5 class="modal-title">הוספת אילוץ חדש</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="modal-add-constraint-form">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="modal-table-name" class="form-label">שם הטבלה</label>
                                        <input type="text" class="form-control" id="modal-table-name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="modal-column-name" class="form-label">שם העמודה</label>
                                        <input type="text" class="form-control" id="modal-column-name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="modal-constraint-type" class="form-label">סוג האילוץ</label>
                                        <select class="form-select" id="modal-constraint-type" required>
                                            <option value="">בחר סוג אילוץ</option>
                                            <option value="ENUM">ENUM - ערכים מותרים</option>
                                            <option value="NOT_NULL">NOT NULL - שדה חובה</option>
                                            <option value="RANGE">RANGE - טווח ערכים</option>
                                            <option value="UNIQUE">UNIQUE - ערך ייחודי</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="modal-constraint-name" class="form-label">שם האילוץ</label>
                                        <input type="text" class="form-control" id="modal-constraint-name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="modal-constraint-definition" 
                                               class="form-label">
                                           הגדרת האילוץ
                                         </label>
                                        <input type="text" class="form-control" 
                                               id="modal-constraint-definition" required>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button data-button-type="CANCEL" data-attributes="data-bs-dismiss='modal' type='button'"></button>
                        <button data-button-type="SAVE" data-onclick="handleModalAddConstraint()" data-attributes="type='button'"></button>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
  }

  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  } else {
    modal.style.display = 'block';
  }
}

// removeEnumValue function is defined as window function below

// Global functions for enum values
window.addEnumValue = function () {
  const container = document.getElementById('enum-values-container');
  if (container) {
    const newItem = document.createElement('div');
    newItem.className = 'enum-value-item';
    newItem.innerHTML = `
            <input type="text" class="form-control" placeholder="ערך" name="enum-value">
            <input type="text" class="form-control" placeholder="שם תצוגה" name="enum-display">
            <input type="number" class="form-control" placeholder="סדר" name="enum-sort" value="1">
            <button data-button-type="DELETE" data-variant="small" data-onclick="removeEnumValue(this)" data-text="" title="מחק"></button>
        `;
    container.appendChild(newItem);
  }
};

window.removeEnumValue = function (button) {
  button.closest('.enum-value-item').remove();
};

window.showAddConstraintModal = function () {
  showAddConstraintModal();
};

// Initialize constraint manager when page loads
// document.addEventListener('DOMContentLoaded', () => {
//   constraintManager = new ConstraintManager();
// });

// Global function for selecting constraint
window.selectConstraint = function (constraintId) {
  if (constraintManager) {
    constraintManager.selectConstraint(constraintId);
  }
};

// Global function for adding new constraint
window.addNewConstraint = function () {
  if (constraintManager) {
    constraintManager.handleAddConstraint();
  }
};

// Global function for handling modal add constraint
window.handleModalAddConstraint = function () {
  if (constraintManager) {
    constraintManager.handleModalAddConstraint();
  }
};

// ===== GLOBAL EXPORTS =====
window.constraintManager = constraintManager;
window.showAddConstraintModal = showAddConstraintModal;
window.selectConstraint = selectConstraint;
window.addNewConstraint = addNewConstraint;
window.handleModalAddConstraint = handleModalAddConstraint;
window.deleteConstraint = (constraintId) => constraintManager.deleteConstraint(constraintId);
window.removeEnumValue = removeEnumValue;
window.loadConstraintsData = () => constraintManager.loadConstraints();

