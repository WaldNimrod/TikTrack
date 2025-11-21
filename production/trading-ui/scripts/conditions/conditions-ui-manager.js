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
        this.layoutMode = 'manager';
    }

    async initialize(options = {}) {
        window.Logger?.info('[ConditionsUIManager] initialize called', { options }, { page: 'conditions-ui-manager' });
        this.logEvent('init-start', { options });
        this.entityType = options.entityType || 'plan';
        this.entityId = options.entityId;
        this.entityName = options.entityName || '';
        this.layoutMode = options.layoutMode || 'manager';
        this.container = document.getElementById(options.containerId || 'conditionsManagerRoot');

        if (!this.container) {
            window.Logger?.error('[ConditionsUIManager] Container not found', { containerId: options.containerId }, { page: 'conditions-ui-manager' });
            this.logEvent('init-error', { reason: 'container-not-found', containerId: options.containerId });
            return;
        }

        if (!this.entityId) {
            window.Logger?.error('[ConditionsUIManager] Missing entityId', { options }, { page: 'conditions-ui-manager' });
            this.renderError('לא הוגדר מזהה ישות לניהול תנאים');
            this.logEvent('init-error', { reason: 'missing-entityId' });
            return;
        }

        this.crudManager.setContext({ entityType: this.entityType });
        this.renderLayout();
        this.bindStaticEvents();

        await this.refreshConditions();
        this.isInitialized = true;
        window.Logger?.info('[ConditionsUIManager] initialization complete', { entityId: this.entityId, entityType: this.entityType }, { page: 'conditions-ui-manager' });
        this.logEvent('init-complete');
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="conditions-manager conditions-manager--form-only">
                <div id="conditionsFormContainer" class="conditions-form-container conditions-form-container--two-column"></div>
            </div>
        `;
    }

    bindStaticEvents() {
        this.openConditionForm();
    }

    async refreshConditions(force = false) {
        const listContainer = this.container.querySelector('#conditionsListContainer');
        if (listContainer) {
            listContainer.innerHTML = '';
        }
        try {
            this.conditions = await this.crudManager.readConditions(this.entityId, !force);
            this.logEvent('refresh-success', { count: this.conditions?.length || 0 });
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to load conditions', { error: error?.message, stack: error?.stack }, { page: 'conditions-ui-manager' });
            this.renderError(error.message || 'שגיאה בטעינת התנאים');
            this.logEvent('refresh-error', { error: error?.message });
        }
    }

    renderConditions() {
        return;
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
                                <button class="btn btn-outline-primary" data-condition-action="edit" data-condition-id="${condition.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" data-condition-action="delete" data-condition-id="${condition.id}">
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

    async handleDeleteCondition(conditionId, options = {}) {
        try {
            const condition = this.conditions.find(item => item.id === conditionId);
            if (!condition) {
                this.showNotification('התנאי המבוקש לא נמצא', 'error');
                return;
            }

            if (!options.skipConfirm) {
                const confirmed = await this.confirmConditionDeletion(condition);
                if (!confirmed) {
                    this.logEvent('delete-cancelled', { conditionId });
                    return;
                }
            }

            const success = await this.crudManager.deleteCondition(conditionId, this.entityId);
            if (success) {
                await this.refreshConditions(true);
                this.emitConditionsUpdated('delete', { conditionId });
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

    async confirmConditionDeletion(condition) {
        const translator = this.translator;
        const title = translator?.getMessage('condition_delete_confirm_title') || 'מחיקת תנאי';
        const baseMessage = translator?.getMessage('condition_delete_confirm_message') || 'האם למחוק את התנאי הנבחר?';
        const secondary = translator?.getMessage('condition_delete_confirm_secondary') || '';
        const methodName = condition?.method_name || condition?.method?.name || '';
        const message = methodName ? `${baseMessage}\n${methodName}` : baseMessage;
        const fullMessage = secondary ? `${message}\n${secondary}` : message;

        if (typeof window.showConfirmationDialog === 'function') {
            return await new Promise((resolve) => {
                window.showConfirmationDialog(
                    title,
                    fullMessage,
                    () => resolve(true),
                    () => resolve(false),
                    'danger'
                );
            });
        }

        if (window.showNotification) {
            window.showNotification(`${title}: ${message}`, 'warning');
        }

        return window.confirm(fullMessage);
    }

    async openConditionForm(condition = null) {
        window.Logger?.info('[ConditionsUIManager] openConditionForm called', { isEdit: Boolean(condition), conditionId: condition?.id }, { page: 'conditions-ui-manager' });
        this.logEvent('open-form', { mode: condition ? 'edit' : 'create', conditionId: condition?.id });
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
        if (this.formGenerator?.destroyActionNotesEditor) {
            this.formGenerator.destroyActionNotesEditor();
        }
        this.removePostSavePrompt();
        this.removePostSaveConfirmation();
    }

    async createCondition(formData) {
        window.Logger?.info('[ConditionsUIManager] createCondition invoked', { entityId: this.entityId, formData }, { page: 'conditions-ui-manager' });
        this.logEvent('create-start', { formData });
        try {
            const savedCondition = await this.crudManager.createCondition(this.entityId, formData);
            window.Logger?.info('[ConditionsUIManager] Condition created successfully', { entityId: this.entityId, conditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
            this.logEvent('create-success', { conditionId: savedCondition?.id });
            this.showNotification(this.translator.getMessage('condition_created') || 'תנאי נוצר בהצלחה', 'success');
            await this.refreshConditions(true);
            this.emitConditionsUpdated('create', savedCondition);
            await this.handlePostSaveSuccess('create', savedCondition);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to create condition', { error: error?.message, stack: error?.stack, entityId: this.entityId }, { page: 'conditions-ui-manager' });
            this.logEvent('create-error', { error: error?.message });
            if (!error?.silent) {
                const message = error?.message || this.translator.getMessage('condition_create_error') || 'שגיאה ביצירת התנאי';
                this.showNotification(message, 'error');
            }
        }
    }

    async updateCondition(conditionId, formData) {
        window.Logger?.info('[ConditionsUIManager] updateCondition invoked', { entityId: this.entityId, conditionId, formData }, { page: 'conditions-ui-manager' });
        this.logEvent('update-start', { conditionId, formData });
        try {
            const updatedCondition = await this.crudManager.updateCondition(conditionId, formData, this.entityId);
            window.Logger?.info('[ConditionsUIManager] Condition updated successfully', { entityId: this.entityId, conditionId }, { page: 'conditions-ui-manager' });
            this.logEvent('update-success', { conditionId });
            this.showNotification(this.translator.getMessage('condition_updated') || 'תנאי עודכן בהצלחה', 'success');
            await this.refreshConditions(true);
            this.emitConditionsUpdated('update', updatedCondition);
            await this.handlePostSaveSuccess('update', updatedCondition);
        } catch (error) {
            window.Logger?.error('[ConditionsUIManager] Failed to update condition', { error: error?.message, stack: error?.stack, conditionId }, { page: 'conditions-ui-manager' });
            this.logEvent('update-error', { conditionId, error: error?.message });
            if (!error?.silent) {
                const message = error?.message || this.translator.getMessage('condition_update_error') || 'שגיאה בעדכון התנאי';
                this.showNotification(message, 'error');
            }
        }
    }

    async handlePostSaveSuccess(actionType, savedCondition) {
        window.Logger?.info('[ConditionsUIManager] Handling post-save actions', { actionType, entityId: this.entityId, conditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
        this.logEvent('post-save', { actionType, conditionId: savedCondition?.id });
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
        this.logEvent('post-save-prompt', { actionType, conditionId: savedCondition?.id });
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
            this.logEvent('post-save-choice', { choice: 'add-another', actionType, previousConditionId: savedCondition?.id });
            cleanup();
            this.openConditionForm();
        };

        const handleReturnToParent = () => {
            window.Logger?.info('[ConditionsUIManager] User chose to return to parent module', { actionType, entityId: this.entityId, previousConditionId: savedCondition?.id }, { page: 'conditions-ui-manager' });
            this.logEvent('post-save-choice', { choice: 'return', actionType, previousConditionId: savedCondition?.id });
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

    logEvent(action, details = {}) {
        const payload = {
            action,
            entityId: this.entityId,
            entityType: this.entityType,
            timestamp: Date.now(),
            ...details
        };
        window.Logger?.info?.('[ConditionsFlow] Event', payload, { page: 'conditions-ui-manager' });
    }

    emitConditionsUpdated(action, payload = {}) {
        try {
            const detail = {
                action,
                entityType: this.entityType,
                tradePlanId: this.entityType === 'plan' ? this.entityId : null,
                payload
            };
            window.dispatchEvent?.(new CustomEvent('tradePlanConditionsUpdated', { detail }));
        } catch (error) {
            window.Logger?.warn('[ConditionsUIManager] Failed to emit conditions update event', { error: error?.message }, { page: 'conditions-ui-manager' });
        }
    }
}

window.ConditionsUIManager = ConditionsUIManager;

(function initializeConditionsSummaryRenderer() {
    if (window.ConditionsSummaryRenderer) {
        return;
    }

    const SUMMARY_CACHE = {
        plan: new Map(),
        trade: new Map()
    };
    const ENTITY_CONDITION_INDEX = {
        plan: new Map(),
        trade: new Map()
    };
    const CONDITION_OWNER_INDEX = {
        plan: new Map(),
        trade: new Map()
    };
    const EVALUATION_CACHE = {
        plan: new Map(),
        trade: new Map()
    };

    const defaultAlertStats = {
        total: 0,
        open: 0,
        closed: 0,
        triggered: 0,
        last_triggered_at: null
    };

    function getTranslator() {
        return window.conditionsTranslations || null;
    }

    function getCache(entityType) {
        return SUMMARY_CACHE[entityType] || SUMMARY_CACHE.plan;
    }

    function getEntityConditionIndex(entityType) {
        return ENTITY_CONDITION_INDEX[entityType] || ENTITY_CONDITION_INDEX.plan;
    }

    function getConditionOwnerIndex(entityType) {
        return CONDITION_OWNER_INDEX[entityType] || CONDITION_OWNER_INDEX.plan;
    }

    function getEvaluationCache(entityType) {
        return EVALUATION_CACHE[entityType] || EVALUATION_CACHE.plan;
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function stripHtml(value) {
        if (!value) {
            return '';
        }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    function formatTimestamp(dateValue) {
        if (!dateValue) {
            return '';
        }
        if (typeof window.formatDateTime === 'function') {
            return window.formatDateTime(dateValue);
        }
        const parsed = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
            return '';
        }
        return parsed.toLocaleString('he-IL');
    }

    function getConditionActionMeta(actionKey) {
        const translator = getTranslator();
        const actions = translator?.getTriggerActions?.() || {};
        return actions[actionKey] || null;
    }

    function getConditionActionLabel(condition) {
        const translator = getTranslator();
        const actionKey = condition?.trigger_action || condition?.triggerAction || 'enter_trade_positive';
        return translator?.getTriggerActionLabel?.(actionKey) || actionKey;
    }

    function getConditionMethodName(condition) {
        const translator = getTranslator();
        const methodKey = condition?.method_key || condition?.method?.method_key;
        if (methodKey && translator?.getMethodName) {
            const translated = translator.getMethodName(methodKey);
            if (translated) {
                return translated;
            }
        }
        return condition?.method_name
            || condition?.method?.name_he
            || condition?.method?.name_en
            || 'ללא שם';
    }

    function getConditionOperatorLabel(condition) {
        const translator = getTranslator();
        const operator = condition?.logical_operator || 'NONE';
        return translator?.getOperator?.(operator) || operator;
    }

    function extractParameters(condition) {
        if (condition?.parameters && typeof condition.parameters === 'object') {
            return condition.parameters;
        }
        const raw = condition?.parameters_json;
        if (!raw) {
            return {};
        }
        if (typeof raw === 'object') {
            return raw;
        }
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (error) {
            window.Logger?.warn?.('[ConditionsSummaryRenderer] Failed parsing condition parameters', { error: error?.message }, { page: 'conditions-ui-manager' });
            return {};
        }
    }

    function formatParametersHtml(condition) {
        const entries = Object.entries(extractParameters(condition));
        if (!entries.length) {
            return '<span class="text-muted">ללא פרמטרים</span>';
        }
        const translator = getTranslator();
        return entries.map(([key, value]) => {
            const label = translator?.getParameterName?.(key) || key;
            return `<div class="badge bg-light text-dark border fw-normal me-1 mb-1">${escapeHtml(label)}: ${escapeHtml(value)}</div>`;
        }).join('');
    }

    function normalizeAlertStats(condition) {
        const stats = condition?.alert_stats || {};
        return {
            total: Number(stats.total ?? defaultAlertStats.total),
            open: Number(stats.open ?? defaultAlertStats.open),
            closed: Number(stats.closed ?? defaultAlertStats.closed),
            triggered: Number(stats.triggered ?? defaultAlertStats.triggered),
            last_triggered_at: stats.last_triggered_at ?? defaultAlertStats.last_triggered_at
        };
    }

    function getEvaluationRecord(entityType, conditionId) {
        if (!conditionId) {
            return null;
        }
        return getEvaluationCache(entityType).get(Number(conditionId)) || null;
    }

    function formatEvaluationCell(entityType, condition) {
        const evaluation = getEvaluationRecord(entityType, condition?.id);
        if (!evaluation) {
            const stats = normalizeAlertStats(condition);
            const hasTriggered = stats.triggered > 0;
            const badgeHtml = window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function'
                ? window.FieldRendererService.renderStatus(hasTriggered ? 'triggered' : 'not_triggered', 'alert')
                : `<span class="badge ${hasTriggered ? 'bg-success' : 'bg-secondary'}">${hasTriggered ? 'הופעל' : 'לא הופעל'}</span>`;
            const timestampHtml = stats.last_triggered_at
                ? `<span class="text-muted small">הופעל לאחרונה: ${escapeHtml(formatTimestamp(stats.last_triggered_at))}</span>`
                : '<span class="text-muted small">לא קיימת בדיקה שמורה</span>';
            return `
                <div class="d-flex flex-column gap-1">
                    ${badgeHtml}
                    ${timestampHtml}
                </div>
            `;
        }

        if (evaluation.error) {
            return `<div class="text-danger small">${escapeHtml(evaluation.error)}</div>`;
        }

        const badgeHtml = window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function'
            ? window.FieldRendererService.renderStatus(evaluation.met ? 'triggered' : 'not_triggered', 'alert')
            : `<span class="badge ${evaluation.met ? 'bg-success' : 'bg-secondary'}">${evaluation.met ? 'הופעל' : 'לא הופעל'}</span>`;

        let timestampHtml = '';
        const formattedTime = formatTimestamp(evaluation.evaluationTime || evaluation.evaluated_at);
        if (formattedTime) {
            timestampHtml = `<span class="text-muted small">${escapeHtml(formattedTime)}</span>`;
        }

        return `
            <div class="d-flex flex-column gap-1">
                ${badgeHtml}
                ${timestampHtml}
            </div>
        `;
    }

    function formatAlertStatsCell(condition) {
        const stats = normalizeAlertStats(condition);
        const hasTriggered = stats.triggered > 0;
        const badgeHtml = window.FieldRendererService && typeof window.FieldRendererService.renderStatus === 'function'
            ? window.FieldRendererService.renderStatus(hasTriggered ? 'triggered' : 'not_triggered', 'alert')
            : `<span class="badge ${hasTriggered ? 'bg-success' : 'bg-secondary'}">${hasTriggered ? 'הופעל' : 'לא הופעל'}</span>`;
        const lastTriggeredText = stats.last_triggered_at
            ? `הופעל לאחרונה: ${escapeHtml(formatTimestamp(stats.last_triggered_at))}`
            : 'אין התראות פעילות';
        return `
            <div class="d-flex flex-column gap-1">
                ${badgeHtml}
                <span class="text-muted small">סה״כ ${stats.total} | פתוחות ${stats.open}</span>
                <span class="text-muted small">${lastTriggeredText}</span>
            </div>
        `;
    }

    function formatAutoAlertToggleCell(condition, toggleHandlerName) {
        if (!toggleHandlerName) {
            return '';
        }
        const isEnabled = condition?.auto_generate_alerts !== false;
        const tooltip = isEnabled ? 'כיבוי התראות אוטומטיות' : 'הפעלת התראות אוטומטיות';
        const icon = isEnabled ? '⚡' : '⛔';
        const buttonType = isEnabled ? 'SUCCESS' : 'WARNING';
        return `
            <div class="text-center">
                <button
                    type="button"
                    data-button-type="${buttonType}"
                    data-variant="small"
                    data-size="small"
                    data-icon="${icon}"
                    data-text=""
                    data-condition-toggle="${condition?.id || ''}"
                    data-tooltip="${tooltip}"
                    aria-label="${tooltip}"
                    data-onclick="${toggleHandlerName}(${condition?.id || 0})">
                </button>
            </div>
        `;
    }

    function formatActionCell(condition) {
        const actionLabel = getConditionActionLabel(condition);
        const notesPreview = stripHtml(condition?.action_notes || condition?.actionNotes || '');
        const truncatedNotes = notesPreview.length > 120 ? `${notesPreview.slice(0, 120)}…` : notesPreview;
        const polarity = getConditionActionMeta(condition?.trigger_action || condition?.triggerAction)?.polarity || 'neutral';
        const polarityClass = polarity === 'positive' ? 'text-success' : (polarity === 'negative' ? 'text-danger' : 'text-muted');

        return `
            <div class="d-flex flex-column gap-1">
                <span class="fw-semibold ${polarityClass}">${escapeHtml(actionLabel)}</span>
                ${truncatedNotes ? `<span class="text-muted small">${escapeHtml(truncatedNotes)}</span>` : ''}
            </div>
        `;
    }

    function buildActionsColumn(condition, handlerConfig) {
        const buttons = [];
        if (handlerConfig.evaluate) {
            buttons.push(`
                <button
                    type="button"
                    data-button-type="REFRESH"
                    data-variant="small"
                    data-size="small"
                    data-icon="↻"
                    data-text=""
                    data-condition-evaluate="${condition.id || ''}"
                    data-tooltip="בדיקת תנאי"
                    aria-label="בדיקת תנאי"
                    data-onclick="${handlerConfig.evaluate}(${condition.id || 0})">
                </button>
            `);
        }
        if (handlerConfig.edit) {
            buttons.push(`
                <button
                    type="button"
                    data-button-type="EDIT"
                    data-variant="small"
                    data-size="small"
                    data-text=""
                    data-tooltip="עריכת תנאי"
                    aria-label="עריכת תנאי"
                    data-onclick="${handlerConfig.edit}(${condition.id || 0})">
                </button>
            `);
        }
        if (handlerConfig.delete) {
            buttons.push(`
                <button
                    type="button"
                    data-button-type="DELETE"
                    data-variant="small"
                    data-size="small"
                    data-text=""
                    data-tooltip="מחיקת תנאי"
                    aria-label="מחיקת תנאי"
                    data-onclick="${handlerConfig.delete}(${condition.id || 0})">
                </button>
            `);
        }
        return buttons.join('\n');
    }

    function buildRow(entityType, condition, handlerConfig) {
        const methodName = getConditionMethodName(condition);
        const operatorName = getConditionOperatorLabel(condition);
        const parametersHtml = formatParametersHtml(condition);
        const updatedAt = condition?.updated_at?.display
            || condition?.created_at?.display
            || '';
        const alertsHtml = formatAlertStatsCell(condition);
        const autoAlertsHtml = formatAutoAlertToggleCell(condition, handlerConfig.toggle);
        const evaluationHtml = formatEvaluationCell(entityType, condition);

        return `
            <tr>
                <td class="fw-semibold">${escapeHtml(methodName)}</td>
                <td>${escapeHtml(operatorName)}</td>
                <td>${parametersHtml}</td>
                <td>${formatActionCell(condition)}</td>
                <td>${evaluationHtml}</td>
                <td>${alertsHtml}</td>
                <td>${autoAlertsHtml}</td>
                <td>${escapeHtml(updatedAt)}</td>
                <td class="text-center table-action-buttons">
                    ${buildActionsColumn(condition, handlerConfig)}
                </td>
            </tr>
        `;
    }

    function buildTable(entityType, conditions, handlerConfig = {}) {
        if (!Array.isArray(conditions) || !conditions.length) {
            return '<div class="text-muted small mb-0">אין תנאים פעילים להצגה.</div>';
        }
        const rows = conditions.map(condition => buildRow(entityType, condition, handlerConfig)).join('');
        return `
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>שיטה</th>
                            <th>אופרטור</th>
                            <th>פרמטרים</th>
                            <th>פעולה</th>
                            <th>בדיקה אחרונה</th>
                            <th>התראות</th>
                            <th>אוטומציה</th>
                            <th>עודכן</th>
                            <th class="text-center" style="width: 140px;">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    function updateEntityIndexes(entityType, entityId, conditionIds) {
        const entityIndex = getEntityConditionIndex(entityType);
        const ownerIndex = getConditionOwnerIndex(entityType);
        const evaluationCache = getEvaluationCache(entityType);
        const normalizedId = Number(entityId);
        const previousSet = entityIndex.get(normalizedId) || new Set();

        previousSet.forEach((conditionId) => {
            if (!conditionIds.has(conditionId)) {
                ownerIndex.delete(conditionId);
                evaluationCache.delete(conditionId);
            }
        });

        entityIndex.set(normalizedId, conditionIds);
        conditionIds.forEach((conditionId) => {
            ownerIndex.set(conditionId, normalizedId);
        });
    }

    function setConditions(entityType, entityId, conditions = []) {
        if (!entityId && entityId !== 0) {
            return;
        }
        const normalizedId = Number(entityId);
        const cache = getCache(entityType);
        cache.set(normalizedId, conditions);
        const conditionIds = new Set(
            conditions
                .filter(condition => condition?.id)
                .map(condition => Number(condition.id))
        );
        updateEntityIndexes(entityType, normalizedId, conditionIds);
    }

    function getConditions(entityType, entityId) {
        if (!entityId && entityId !== 0) {
            return [];
        }
        const cache = getCache(entityType);
        return cache.get(Number(entityId)) || [];
    }

    function getCondition(entityType, entityId, conditionId) {
        const list = getConditions(entityType, entityId);
        if (!Array.isArray(list)) {
            return null;
        }
        return list.find(condition => Number(condition.id) === Number(conditionId)) || null;
    }

    function clearCache(entityType, entityId = null) {
        const cache = getCache(entityType);
        const entityIndex = getEntityConditionIndex(entityType);
        const ownerIndex = getConditionOwnerIndex(entityType);
        const evaluationCache = getEvaluationCache(entityType);

        if (entityId === null || entityId === undefined) {
            cache.clear();
            entityIndex.clear();
            ownerIndex.clear();
            evaluationCache.clear();
            return;
        }

        const normalizedId = Number(entityId);
        cache.delete(normalizedId);
        const conditionIds = entityIndex.get(normalizedId);
        if (conditionIds) {
            conditionIds.forEach((conditionId) => {
                ownerIndex.delete(conditionId);
                evaluationCache.delete(conditionId);
            });
            entityIndex.delete(normalizedId);
        }
    }

    function setEvaluation(entityType, conditionId, payload) {
        if (!conditionId && conditionId !== 0) {
            return;
        }
        const evaluationCache = getEvaluationCache(entityType);
        if (payload === null || payload === undefined) {
            evaluationCache.delete(Number(conditionId));
            return;
        }
        evaluationCache.set(Number(conditionId), payload);
    }

    function clearEvaluation(entityType, conditionId) {
        if (!conditionId && conditionId !== 0) {
            return;
        }
        getEvaluationCache(entityType).delete(Number(conditionId));
    }

    async function confirmConditionDeletion(condition) {
        const translator = getTranslator();
        const title = translator?.getMessage('condition_delete_confirm_title') || 'מחיקת תנאי';
        const baseMessage = translator?.getMessage('condition_delete_confirm_message') || 'האם למחוק את התנאי הנבחר?';
        const secondary = translator?.getMessage('condition_delete_confirm_secondary') || '';
        const methodName = condition?.method_name || condition?.method?.name || '';
        const message = methodName ? `${baseMessage}\n${methodName}` : baseMessage;
        const fullMessage = secondary ? `${message}\n${secondary}` : message;

        if (typeof window.showConfirmationDialog === 'function') {
            return await new Promise((resolve) => {
                window.showConfirmationDialog(
                    title,
                    fullMessage,
                    () => resolve(true),
                    () => resolve(false),
                    'danger'
                );
            });
        }

        if (window.showNotification) {
            window.showNotification(`${title}: ${message}`, 'warning');
        }

        if (window.confirm) {
            return window.confirm(fullMessage);
        }

        return true;
    }

    function setButtonLoadingState(button, isLoading) {
        if (!button) {
            return;
        }
        if (isLoading) {
            button.dataset.loading = 'true';
            button.disabled = true;
        } else {
            delete button.dataset.loading;
            const baseDisabled = button.getAttribute('aria-disabled') === 'true';
            button.disabled = baseDisabled;
        }
        if (window.ButtonSystem?.processButtons) {
            window.ButtonSystem.processButtons(button.parentElement || button);
        } else if (window.ButtonSystem?.hydrateButtons) {
            window.ButtonSystem.hydrateButtons(button.parentElement || button);
        }
    }

    function dispatchConditionsUpdated(entityType, entityId, action, payload = {}) {
        try {
            const detail = {
                action,
                entityType,
                tradePlanId: entityType === 'plan' ? Number(entityId) : null,
                tradeId: entityType === 'trade' ? Number(entityId) : null,
                payload
            };
            window.dispatchEvent?.(new CustomEvent('tradePlanConditionsUpdated', { detail }));
        } catch (error) {
            window.Logger?.warn('[ConditionsSummaryRenderer] Failed to emit conditions update event', { error: error?.message }, { page: 'conditions-ui-manager' });
        }
    }

    async function deleteConditionViaCrud(entityType, conditionId, entityId) {
        const crudManager = window.conditionsCRUDManager;
        if (!crudManager) {
            window.showNotification?.('מערכת ניהול התנאים אינה זמינה כרגע.', 'error');
            return false;
        }
        try {
            crudManager.setContext?.({ entityType });
            const success = await crudManager.deleteCondition(Number(conditionId), Number(entityId));
            if (success) {
                clearEvaluation(entityType, conditionId);
                window.showNotification?.('התנאי נמחק בהצלחה', 'success');
                dispatchConditionsUpdated(entityType, entityId, 'delete', { conditionId: Number(conditionId) });
                return true;
            }
        } catch (error) {
            window.Logger?.error('[ConditionsSummaryRenderer] Failed to delete condition', { error: error?.message, conditionId, entityType }, { page: 'conditions-ui-manager' });
            window.showNotification?.('שגיאה במחיקת התנאי', 'error');
        }
        return false;
    }

    window.ConditionsSummaryRenderer = {
        setConditions,
        getConditions,
        getCondition,
        clearCache,
        setEvaluation,
        clearEvaluation,
        buildTable,
        formatActionCell,
        formatEvaluationCell,
        formatAlertStatsCell,
        formatAutoAlertToggleCell,
        confirmDeletion: confirmConditionDeletion,
        setButtonLoadingState,
        setButtonLoadingStateById: (buttonId, isLoading) => {
            if (!buttonId) {
                return;
            }
            setButtonLoadingState(document.getElementById(buttonId), isLoading);
        },
        deleteConditionViaCrud
    };
})();
