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
        this.postSavePromptElement = null;
        this.postSaveModalElement = null;
        this.postSaveBackdropElement = null;
    }

    async initialize(options = {}) {
        window.Logger?.info('[ConditionsUIManager] initialize called', { options }, { page: 'conditions-ui-manager' });
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
        window.Logger?.info('[ConditionsUIManager] initialization complete', { entityId: this.entityId, entityType: this.entityType }, { page: 'conditions-ui-manager' });
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
            if (error?.forceRefresh) {
                await this.refreshConditions(true);
            }
            if (!error?.silent) {
                const message = error?.message || this.translator.getMessage('condition_delete_error') || 'שגיאה במחיקת התנאי';
                this.showNotification(message, 'error');
            }
        }
    }

    async openConditionForm(condition = null) {
        window.Logger?.info('[ConditionsUIManager] openConditionForm called', { isEdit: Boolean(condition), conditionId: condition?.id }, { page: 'conditions-ui-manager' });
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
        window.Logger?.info('[ConditionsUIManager] Condition form rendered', { isEdit: Boolean(condition) }, { page: 'conditions-ui-manager' });
    }

    closeConditionForm() {
        const container = this.container.querySelector('#conditionsFormContainer');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
        this.removePostSavePrompt();
        this.removePostSaveConfirmation();
    }

    async createCondition(formData) {
        window.Logger?.info('[ConditionsUIManager] createCondition invoked', { entityId: this.entityId, formData }, { page: 'conditions-ui-manager' });
        try {
            const savedCondition = await this.crudManager.createCondition(this.entityId, formData);
            window.Logger?.info('[ConditionsUIManager] Condition created successfully', { entityId: this.entityId, conditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
            this.showNotification(this.translator.getMessage('condition_created') || 'תנאי נוצר בהצלחה', 'success');
            await this.refreshConditions(true);
            await this.handlePostSaveSuccess('create', savedCondition);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to create condition', { error: error?.message, stack: error?.stack, entityId: this.entityId }, { page: 'conditions-ui-manager' });
            if (!error?.silent) {
                const message = error?.message || this.translator.getMessage('condition_create_error') || 'שגיאה ביצירת התנאי';
                this.showNotification(message, 'error');
            }
        }
    }

    async updateCondition(conditionId, formData) {
        window.Logger?.info('[ConditionsUIManager] updateCondition invoked', { entityId: this.entityId, conditionId, formData }, { page: 'conditions-ui-manager' });
        try {
            const updatedCondition = await this.crudManager.updateCondition(conditionId, formData, this.entityId);
            window.Logger?.info('[ConditionsUIManager] Condition updated successfully', { entityId: this.entityId, conditionId }, { page: 'conditions-ui-manager' });
            this.showNotification(this.translator.getMessage('condition_updated') || 'תנאי עודכן בהצלחה', 'success');
            await this.refreshConditions(true);
            await this.handlePostSaveSuccess('update', updatedCondition);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to update condition', { error: error?.message, stack: error?.stack, conditionId }, { page: 'conditions-ui-manager' });
            if (!error?.silent) {
                const message = error?.message || this.translator.getMessage('condition_update_error') || 'שגיאה בעדכון התנאי';
                this.showNotification(message, 'error');
            }
        }
    }

    async handlePostSaveSuccess(actionType, savedCondition) {
        window.Logger?.info('[ConditionsUIManager] Handling post-save actions', { actionType, entityId: this.entityId, conditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
        this.closeConditionForm();
        this.showPostSaveConfirmation(actionType, savedCondition);
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

    showPostSaveConfirmation(actionType = 'create', savedCondition = null) {
        window.Logger?.info('[ConditionsUIManager] showPostSaveConfirmation invoked', { actionType, entityId: this.entityId, conditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
        this.removePostSavePrompt();
        this.removePostSaveConfirmation();

        const entityLabel = this.entityType === 'plan' ? 'תוכנית המסחר' : 'העסקה';
        const entityDescriptor = this.entityName ? `"${this.entityName}"` : `#${this.entityId}`;
        const title = this.translator.getMessage('post_save_prompt_title') || 'שמירת תנאי';
        const messageTemplate = this.translator.getMessage('post_save_prompt_base') || 'האם תרצה להוסיף תנאי נוסף ל{entityLabel} {entityName}?';
        const confirmLabel = this.translator.getMessage('post_save_prompt_confirm_hint') || 'הוסף תנאי נוסף';
        const cancelTemplate = this.translator.getMessage('post_save_prompt_cancel_hint') || 'חזרה למודול {entityLabel}';
        const cancelLabel = cancelTemplate.replace('{entityLabel}', entityLabel);
        const message = messageTemplate
            .replace('{entityLabel}', entityLabel)
            .replace('{entityName}', entityDescriptor);

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show conditions-confirm-backdrop';

        const modal = document.createElement('div');
        modal.className = 'modal fade show conditions-confirm-modal';
        modal.setAttribute('role', 'dialog');
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close conditions-confirm-close" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary conditions-confirm-add">${confirmLabel}</button>
                        <button type="button" class="btn btn-outline-secondary conditions-confirm-return">${cancelLabel}</button>
                    </div>
                </div>
            </div>
        `;

        const cleanup = () => {
            try {
                if (this.postSaveBackdropElement?.parentNode) {
                    this.postSaveBackdropElement.parentNode.removeChild(this.postSaveBackdropElement);
                }
                if (this.postSaveModalElement?.parentNode) {
                    this.postSaveModalElement.parentNode.removeChild(this.postSaveModalElement);
                }
            } catch (error) {
                window.Logger?.warn('[ConditionsUIManager] Failed to remove post-save confirmation elements', { error: error?.message }, { page: 'conditions-ui-manager' });
            }
            this.postSaveBackdropElement = null;
            this.postSaveModalElement = null;
        };

        const handleAddAnother = () => {
            window.Logger?.info('[ConditionsUIManager] User chose to add another condition', { actionType, entityId: this.entityId, previousConditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
            cleanup();
            this.openConditionForm();
        };

        const handleReturnToParent = () => {
            window.Logger?.info('[ConditionsUIManager] User chose to return to parent module', { actionType, entityId: this.entityId, previousConditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
            cleanup();
            if (window.ModalNavigationService?.goBack) {
                window.ModalNavigationService.goBack();
            } else if (window.ConditionsModalController?.goBackToParent) {
                window.ConditionsModalController.goBackToParent();
            } else {
                const modalElement = document.getElementById('conditionsModal');
                const modalInstance = modalElement ? bootstrap?.Modal?.getInstance(modalElement) : null;
                modalInstance?.hide?.();
            }
        };

        modal.querySelector('.conditions-confirm-add')?.addEventListener('click', handleAddAnother);
        modal.querySelector('.conditions-confirm-return')?.addEventListener('click', handleReturnToParent);
        modal.querySelector('.conditions-confirm-close')?.addEventListener('click', handleReturnToParent);

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        this.postSaveBackdropElement = backdrop;
        this.postSaveModalElement = modal;
        window.Logger?.info('[ConditionsUIManager] Post-save confirmation modal displayed', { actionType, entityId: this.entityId }, { page: 'conditions-ui-manager' });
    }

    removePostSavePrompt() {
        if (this.postSavePromptElement?.parentNode) {
            this.postSavePromptElement.parentNode.removeChild(this.postSavePromptElement);
        }
        this.postSavePromptElement = null;
    }

    removePostSaveConfirmation() {
        if (this.postSaveBackdropElement?.parentNode) {
            this.postSaveBackdropElement.parentNode.removeChild(this.postSaveBackdropElement);
        }
        if (this.postSaveModalElement?.parentNode) {
            this.postSaveModalElement.parentNode.removeChild(this.postSaveModalElement);
        }
        this.postSaveBackdropElement = null;
        this.postSaveModalElement = null;
    }

    /**
     * Prompt user to choose next action after saving a condition.
     * Falls back to opening another form when confirmation dialog is unavailable.
     *
     * @param {('create'|'update')} actionType
     * @param {Object} savedCondition
     * @returns {Promise<'add'|'return'>}
     */
    promptPostSaveAction(actionType = 'create', savedCondition = {}) {
        const translator = this.translator || window.conditionsTranslations;
        const getMessage = (key, fallback) => {
            if (translator && typeof translator.getMessage === 'function') {
                return translator.getMessage(key) || fallback;
            }
            return fallback;
        };

        const entityLabel = this.entityType === 'plan' ? 'תוכנית מסחר' : 'עסקה';
        const entityDescriptor = this.entityName
            || savedCondition.name
            || savedCondition.display_name
            || `#${savedCondition.id ?? this.entityId ?? ''}`;

        const title = getMessage('post_save_prompt_title', 'שמירת תנאי');
        const baseTemplate = getMessage(
            'post_save_prompt_base',
            'האם תרצה להוסיף תנאי נוסף ל{entityLabel} {entityName}?'
        );
        const confirmHint = getMessage(
            'post_save_prompt_confirm_hint',
            'אישור – הוסף תנאי נוסף'
        );
        const cancelHint = getMessage(
            'post_save_prompt_cancel_hint',
            'דחייה – חזרה למודול {entityLabel}'
        );

        const replaceTokens = (template) => template
            .replace('{entityLabel}', entityLabel)
            .replace('{entityName}', entityDescriptor);

        const messageParts = [
            replaceTokens(baseTemplate),
            confirmHint ? replaceTokens(confirmHint) : '',
            cancelHint ? replaceTokens(cancelHint) : ''
        ].filter(Boolean);
        const message = messageParts.join('\n');

        const handleReturnNavigation = () => {
            if (window.ModalNavigationService?.goBack) {
                window.ModalNavigationService.goBack();
            } else if (window.ConditionsModalController?.goBackToParent) {
                window.ConditionsModalController.goBackToParent();
            } else {
                const modalElement = document.getElementById('conditionsModal');
                const modalInstance = modalElement ? bootstrap?.Modal?.getInstance(modalElement) : null;
                modalInstance?.hide?.();
            }
        };

        return new Promise((resolve) => {
            const handleAddAnother = () => {
                window.Logger?.info?.(
                    '[ConditionsUIManager] User confirmed add another condition',
                    { actionType, entityId: this.entityId, previousConditionId: savedCondition?.id },
                    { page: 'conditions-ui-manager' }
                );
                this.openConditionForm();
                resolve('add');
            };

            const handleReturn = () => {
                window.Logger?.info?.(
                    '[ConditionsUIManager] User chose to return after saving condition',
                    { actionType, entityId: this.entityId, previousConditionId: savedCondition?.id },
                    { page: 'conditions-ui-manager' }
                );
                handleReturnNavigation();
                resolve('return');
            };

            if (typeof window.showConfirmationDialog === 'function') {
                try {
                    window.showConfirmationDialog(
                        title,
                        message,
                        handleAddAnother,
                        handleReturn
                    );
                    return;
                } catch (error) {
                    window.Logger?.error?.(
                        '[ConditionsUIManager] showConfirmationDialog threw error, defaulting to add another condition',
                        { error: error?.message, actionType, entityId: this.entityId },
                        { page: 'conditions-ui-manager' }
                    );
                }
            } else {
                window.Logger?.warn?.(
                    '[ConditionsUIManager] showConfirmationDialog unavailable, defaulting to add another condition',
                    { actionType, entityId: this.entityId },
                    { page: 'conditions-ui-manager' }
                );
            }

            handleAddAnother();
        });
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


