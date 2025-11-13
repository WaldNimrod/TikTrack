/**
 * Conditions UI Manager
 * =====================
 *
 * Responsible for rendering the unified conditions management UI for both
 * trade plans and trades. Integrates with the general modal system,
 * CRUD manager, form generator, and centralized notification system.
 *
 * Related systems:
 * - ModalManagerV2 (dynamic modal rendering)
 * - ConditionsCRUDManager (API connectivity and caching)
 * - ConditionsFormGenerator (dynamic form creation)
 * - EventHandlerManager (global button actions)
 */
class ConditionsUIManager {
    constructor() {
        this.translator = window.conditionsTranslations;
        this.crudManager = window.conditionsCRUDManager;
        this.formGenerator = window.conditionsFormGenerator;
        this.container = null;
        this.entityType = 'plan';
        this.entityId = null;
        this.entityName = '';
        this.conditions = [];
        this.isInitialized = false;
    }

    async initialize(options = {}) {
        this.entityType = options.entityType || 'plan';
        this.entityId = options.entityId;
        this.entityName = options.entityName || '';
        this.container = document.getElementById(options.containerId || 'conditionsManagerRoot');

        if (!this.container) {
            window.Logger?.error('[ConditionsUIManager] Container not found', { containerId: options.containerId }, { page: 'conditions-ui-manager' });
            return;
        }

        if (!this.entityId) {
            window.Logger?.error('[ConditionsUIManager] Missing entityId', { options }, { page: 'conditions-ui-manager' });
            this.renderError('לא הוגדר מזהה ישות לניהול תנאים');
            return;
        }

        this.crudManager.setContext({ entityType: this.entityType });
        this.renderLayout();
        this.bindStaticEvents();

        await this.refreshConditions();
        this.isInitialized = true;
    }

    renderLayout() {
        const entityLabel = this.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
        const entityDetails = `
            <div>
                <h5 class="mb-1">ניהול תנאים – ${entityLabel} #${this.entityId}</h5>
                ${this.entityName ? `<div class="text-muted small">${this.entityName}</div>` : ''}
            </div>
        `;

        this.container.innerHTML = `
            <div class="conditions-manager">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    ${entityDetails}
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary btn-sm" id="refreshConditionsBtn">
                            <i class="fas fa-sync-alt"></i> רענן
                        </button>
                        <button class="btn btn-primary btn-sm" id="addConditionBtn">
                            <i class="fas fa-plus"></i> ${this.translator.getFormLabel('add_condition')}
                        </button>
                    </div>
                </div>

                <div id="conditionsListContainer" class="conditions-list mb-4"></div>
                <div id="conditionsFormContainer" class="conditions-form-container" style="display:none;"></div>
            </div>
        `;
    }

    bindStaticEvents() {
        const refreshBtn = this.container.querySelector('#refreshConditionsBtn');
        const addBtn = this.container.querySelector('#addConditionBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshConditions(true));
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => this.openConditionForm());
        }

        const listContainer = this.container.querySelector('#conditionsListContainer');
        if (listContainer) {
            listContainer.addEventListener('click', (event) => {
                const actionBtn = event.target.closest('[data-action]');
                if (!actionBtn) return;

                const conditionId = Number(actionBtn.getAttribute('data-condition-id'));
                if (!conditionId) return;

                const action = actionBtn.getAttribute('data-action');
                switch (action) {
                    case 'edit':
                        this.handleEditCondition(conditionId);
                        break;
                    case 'delete':
                        this.handleDeleteCondition(conditionId);
                        break;
                    default:
                        break;
                }
            });
        }
    }

    async refreshConditions(force = false) {
        const listContainer = this.container.querySelector('#conditionsListContainer');
        if (!listContainer) return;

        listContainer.innerHTML = `
            <div class="d-flex align-items-center text-muted">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                טוען תנאים...
            </div>
        `;

        try {
            this.conditions = await this.crudManager.readConditions(this.entityId, !force);
            this.renderConditions();
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to load conditions', { error: error?.message, stack: error?.stack }, { page: 'conditions-ui-manager' });
            this.renderError(error.message || 'שגיאה בטעינת התנאים');
        }
    }

    renderConditions() {
        const listContainer = this.container.querySelector('#conditionsListContainer');
        if (!listContainer) return;

        if (!this.conditions || this.conditions.length === 0) {
            listContainer.innerHTML = `
                <div class="alert alert-info d-flex align-items-center">
                    <i class="fas fa-info-circle me-2"></i>
                    לא קיימים תנאים עבור ישות זו. לחץ על "הוסף תנאי" כדי להתחיל.
                </div>
            `;
            return;
        }

        const rows = this.conditions.map(condition => this.renderConditionCard(condition)).join('');
        listContainer.innerHTML = `
            <div class="conditions-cards">
                ${rows}
            </div>
        `;
    }

    renderConditionCard(condition) {
        const methodName = condition.method_name || condition.method?.name || 'שיטה ללא שם';
        const categoryName = condition.category_name || '';
        const statusBadgeClass = condition.is_active !== false ? 'bg-success' : 'bg-secondary';
        const statusText = condition.is_active !== false ? 'פעיל' : 'לא פעיל';
        const logicalOperator = this.translator.getOperator(condition.logical_operator || 'NONE');

        const createdAt = condition.created_at ? new Date(condition.created_at).toLocaleString() : '';
        const updatedAt = condition.updated_at ? new Date(condition.updated_at).toLocaleString() : '';

        return `
            <div class="card condition-item mb-3" data-condition-id="${condition.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${methodName}</h6>
                            <div class="text-muted small">
                                ${categoryName ? `<span class="me-2"><i class="fas fa-layer-group"></i> ${categoryName}</span>` : ''}
                                <span><i class="fas fa-code-branch"></i> ${logicalOperator}</span>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${statusBadgeClass}">${statusText}</span>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" data-action="edit" data-condition-id="${condition.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" data-action="delete" data-condition-id="${condition.id}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    ${this.renderConditionParameters(condition.parameters)}

                    <div class="condition-meta text-muted small mt-3">
                        ${createdAt ? `<span class="me-3"><i class="far fa-clock"></i> נוצר: ${createdAt}</span>` : ''}
                        ${updatedAt ? `<span><i class="far fa-edit"></i> עודכן: ${updatedAt}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderConditionParameters(parameters) {
        if (!parameters || Object.keys(parameters).length === 0) {
            return '';
        }

        const items = Object.entries(parameters).map(([key, value]) => {
            const label = this.translator.getParameterName(key) || key;
            return `
                <div class="col-md-6 mb-1">
                    <div class="condition-parameter">
                        <span class="parameter-label">${label}:</span>
                        <span class="parameter-value">${Array.isArray(value) ? value.join(', ') : value}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="row gx-3 mt-3">
                ${items}
            </div>
        `;
    }

    async handleEditCondition(conditionId) {
        const condition = this.conditions.find(item => item.id === conditionId);
        if (!condition) {
            this.showNotification('התנאי המבוקש לא נמצא', 'error');
            return;
        }
        await this.openConditionForm(condition);
    }

    async handleDeleteCondition(conditionId) {
        try {
            const success = await this.crudManager.deleteCondition(conditionId, this.entityId);
            if (success) {
                await this.refreshConditions(true);
            }
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to delete condition', { error: error?.message, stack: error?.stack, conditionId }, { page: 'conditions-ui-manager' });
            this.showNotification(error.message || 'שגיאה במחיקת התנאי', 'error');
        }
    }

    async openConditionForm(condition = null) {
        const container = this.container.querySelector('#conditionsFormContainer');
        if (!container) return;

        container.style.display = '';
        this.formGenerator.setCallbacks(
            async (formData) => {
                await (condition
                    ? this.updateCondition(condition.id, formData)
                    : this.createCondition(formData));
            },
            () => this.closeConditionForm()
        );

        await this.formGenerator.generateConditionForm('conditionsFormContainer', {
            isEdit: Boolean(condition),
            conditionData: condition
        });
    }

    closeConditionForm() {
        const container = this.container.querySelector('#conditionsFormContainer');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    async createCondition(formData) {
        try {
            await this.crudManager.createCondition(this.entityId, formData);
            this.closeConditionForm();
            await this.refreshConditions(true);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to create condition', { error: error?.message, stack: error?.stack, entityId: this.entityId }, { page: 'conditions-ui-manager' });
            this.showNotification(error.message || 'שגיאה ביצירת התנאי', 'error');
        }
    }

    async updateCondition(conditionId, formData) {
        try {
            await this.crudManager.updateCondition(conditionId, formData, this.entityId);
            this.closeConditionForm();
            await this.refreshConditions(true);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to update condition', { error: error?.message, stack: error?.stack, conditionId }, { page: 'conditions-ui-manager' });
            this.showNotification(error.message || 'שגיאה בעדכון התנאי', 'error');
        }
    }

    renderError(message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (window.notificationSystem && window.notificationSystem.showNotification) {
            window.notificationSystem.showNotification(message, type);
        } else {
            window.Logger?.info?.('[ConditionsUIManager] showNotification fallback', { type, message }, { page: 'conditions-ui-manager' });
        }
    }
}

window.ConditionsUIManager = ConditionsUIManager;


