/**
 * Conditions Form Generator - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the conditions form generator for TikTrack including:
 * - Dynamic form generation for conditions
 * - Form validation and event handling
 * - Trading methods integration
 * - Parameter management
 * - UI rendering and interaction
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Conditions Form Generator class
 * @class ConditionsFormGenerator
 */
class ConditionsFormGenerator {
    constructor() {
        this.translator = window.conditionsTranslations;
        this.validator = window.conditionsValidator;
        this.crudManager = null;
        this.currentMethod = null;
        this.methods = [];
        this.methodsById = new Map();
        this.containerId = null;
        this.mode = 'create';
    }

    getCrudManager() {
        if (!this.crudManager) {
            if (window.conditionsCRUDManager) {
                this.crudManager = window.conditionsCRUDManager;
            } else {
                const message = 'Conditions CRUD Manager not available';
                window.Logger?.error(`[ConditionsFormGenerator] ${message}`, { page: 'conditions-form-generator' });
                throw new Error(message);
            }
        }
        return this.crudManager;
    }

    async generateConditionForm(containerId, options = {}) {
        window.Logger?.info('[ConditionsFormGenerator] generateConditionForm called', { containerId, options }, { page: 'conditions-form-generator' });
        this.containerId = containerId;
        const container = document.getElementById(containerId);
        if (!container) {
            window.Logger?.error('[ConditionsFormGenerator] Container not found', { containerId }, { page: 'conditions-form-generator' });
            return;
        }

        this.mode = options.isEdit ? 'edit' : 'create';

        container.innerHTML = this.buildFormHTML(options);
        this.attachEventListeners(container);

        try {
            await this.loadMethods();
            window.Logger?.info('[ConditionsFormGenerator] Methods loaded', { methodsCount: this.methods.length }, { page: 'conditions-form-generator' });
            this.populateMethodSelect(options.conditionData);
            if (options.conditionData) {
                this.populateForm(options.conditionData);
            }
        } catch (error) {
            window.Logger?.error('[ConditionsFormGenerator] Failed to prepare condition form', { error: error?.message, stack: error?.stack }, { page: 'conditions-form-generator' });
            const message = this.translator.getMessage('condition_methods_error') || 'שגיאה בטעינת שיטות התנאים';
            this.showNotification(message, 'error');
        }
    }

    buildFormHTML(options = {}) {
        const conditionData = options.conditionData || {};
        return `
            <div class="condition-form" id="conditionForm">
                <div class="condition-form-header">
                    <h4 id="formTitle">${options.isEdit ? this.translator.getFormLabel('edit_condition') : this.translator.getFormLabel('add_condition')}</h4>
                    <button class="btn btn-sm btn-outline-secondary" id="closeFormBtn" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="condition-form-body">
                    <form id="conditionFormElement" novalidate>
                        <div class="mb-3">
                            <label for="methodSelect" class="form-label">
                                ${this.translator.getFormLabel('select_method')}
                                <span class="text-danger">*</span>
                            </label>
                            <select class="form-select" id="methodSelect" required>
                                <option value="">${this.translator.getFormLabel('select_method')}...</option>
                            </select>
                            <div class="invalid-feedback" id="methodSelectError"></div>
                        </div>

                        <div id="parametersContainer" class="mb-3" style="display: none;">
                            <label class="form-label">${this.translator.getFormLabel('method_parameters')}</label>
                            <div id="parametersFields"></div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="logicalOperator" class="form-label">
                                    ${this.translator.getFormLabel('logical_operator')}
                                </label>
                                <select class="form-select" id="logicalOperator">
                                    <option value="NONE">${this.translator.getOperator('NONE')}</option>
                                    <option value="AND">${this.translator.getOperator('AND')}</option>
                                    <option value="OR">${this.translator.getOperator('OR')}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="conditionGroup" class="form-label">
                                    ${this.translator.getFormLabel('condition_group')}
                                </label>
                                <input type="number" class="form-control" id="conditionGroup"
                                       value="${conditionData.condition_group || 0}"
                                       min="0" max="99">
                            </div>
                        </div>

                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="isActive"
                                   ${conditionData.is_active !== false ? 'checked' : ''}>
                            <label class="form-check-label" for="isActive">
                                ${this.translator.getFormLabel('is_active')}
                            </label>
                        </div>

                        <div class="d-flex gap-2 justify-content-end">
                            <button class="btn btn-primary" type="submit" id="saveConditionBtn">
                                <i class="fas fa-save"></i>
                                ${this.translator.getFormLabel('save_condition')}
                            </button>
                            <button class="btn btn-outline-secondary" type="button" id="cancelFormBtn">
                                <i class="fas fa-times"></i>
                                ${this.translator.getFormLabel('cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    attachEventListeners(container) {
        const methodSelect = container.querySelector('#methodSelect');
        if (methodSelect) {
            methodSelect.addEventListener('change', (event) => {
                this.handleMethodChange(event.target.value);
            });
        }

        const form = container.querySelector('#conditionFormElement');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleFormSubmit();
            });
        }

        const cancelBtn = container.querySelector('#cancelFormBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleFormCancel());
        }

        const closeBtn = container.querySelector('#closeFormBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handleFormCancel());
        }
    }

    async loadMethods() {
        const crudManager = this.getCrudManager();
        this.methods = await crudManager.getTradingMethods(true);
        this.methodsById.clear();
        this.methods.forEach(method => {
            this.methodsById.set(String(method.id), method);
        });
        window.Logger?.debug?.('[ConditionsFormGenerator] loadMethods completed', { methodsCount: this.methods.length }, { page: 'conditions-form-generator' });
    }

    populateMethodSelect(conditionData) {
        const methodSelect = document.getElementById('methodSelect');
        if (!methodSelect) return;

        methodSelect.innerHTML = `<option value="">${this.translator.getFormLabel('select_method')}...</option>`;

        this.methods
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.dataset.methodKey = method.method_key;
                option.dataset.category = method.category;
                option.textContent = `${method.name} ${method.category_name ? `- ${method.category_name}` : ''}`;
                methodSelect.appendChild(option);
            });

        if (conditionData?.method_id) {
            methodSelect.value = conditionData.method_id;
            this.handleMethodChange(conditionData.method_id);
        }

        window.Logger?.info('[ConditionsFormGenerator] Method select populated', { optionsCount: methodSelect.options.length }, { page: 'conditions-form-generator' });
    }

    handleMethodChange(methodId) {
        window.Logger?.info('[ConditionsFormGenerator] handleMethodChange called', { methodId }, { page: 'conditions-form-generator' });
        if (!methodId) {
            this.currentMethod = null;
            this.clearParameters();
            return;
        }

        const method = this.methodsById.get(String(methodId));
        if (!method) {
            window.Logger?.warn('[ConditionsFormGenerator] Method not found by id', { methodId }, { page: 'conditions-form-generator' });
            this.clearParameters();
            return;
        }

        this.currentMethod = method;
        this.renderParameterFields(method);
        window.Logger?.info('[ConditionsFormGenerator] Parameters rendered for method', { methodId, parametersCount: method.parameters?.length || 0 }, { page: 'conditions-form-generator' });
    }

    clearParameters() {
        const container = document.getElementById('parametersFields');
        const wrapper = document.getElementById('parametersContainer');
        if (container) {
            container.innerHTML = '<div class="text-muted">בחר שיטת מסחר כדי להגדיר פרמטרים</div>';
        }
        if (wrapper) {
            wrapper.style.display = 'none';
        }
        this.currentMethod = null;
    }

    renderParameterFields(method) {
        const wrapper = document.getElementById('parametersContainer');
        const container = document.getElementById('parametersFields');
        if (!container || !wrapper) return;

        container.innerHTML = '';

        if (!Array.isArray(method.parameters) || method.parameters.length === 0) {
            container.innerHTML = '<div class="text-muted">אין פרמטרים לשיטה זו</div>';
            wrapper.style.display = '';
            return;
        }

        method.parameters
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .forEach(parameter => {
                const field = this.createParameterField(parameter);
                container.appendChild(field);
            });

        wrapper.style.display = '';
    }

    createParameterField(parameter) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'mb-3';

        const label = this.translator.getParameterName(parameter.parameter_key)
            || parameter.parameter_name_he
            || parameter.parameter_name_en
            || parameter.parameter_key;

        const requiredIndicator = parameter.is_required ? '<span class="text-danger">*</span>' : '';
        const input = this.buildInputForParameter(parameter);

        fieldContainer.innerHTML = `
            <label class="form-label" for="${parameter.parameter_key}">
                ${label} ${requiredIndicator}
            </label>
            ${input}
            <small class="form-text text-muted">${parameter.help_text_he || parameter.help_text_en || ''}</small>
            <div class="invalid-feedback" id="${parameter.parameter_key}Error"></div>
        `;

        return fieldContainer;
    }

    buildInputForParameter(parameter) {
        const id = parameter.parameter_key;
        const requiredAttr = parameter.is_required ? 'required' : '';
        const defaultValue = parameter.default_value ?? '';
        const min = parameter.min_value || '';
        const max = parameter.max_value || '';
        const validation = this.safeParse(parameter.validation_rule);

        switch (parameter.parameter_type) {
            case 'number':
            case 'price':
            case 'percentage':
                return `
                    <input type="number" class="form-control" id="${id}" name="${id}"
                           ${requiredAttr}
                           value="${defaultValue}"
                           min="${min}" max="${max}"
                           step="${parameter.parameter_type === 'number' ? '1' : '0.01'}">
                `;
            case 'boolean':
                return `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="${id}" name="${id}"
                               ${defaultValue ? 'checked' : ''}>
                    </div>
                `;
            case 'dropdown': {
                const options = (validation?.allowed_values || []).map(option => `
                    <option value="${option}" ${option === defaultValue ? 'selected' : ''}>${option}</option>
                `).join('');
                return `
                    <select class="form-select" id="${id}" name="${id}" ${requiredAttr}>
                        <option value="">בחר...</option>
                        ${options}
                    </select>
                `;
            }
            default:
                return `
                    <input type="text" class="form-control" id="${id}" name="${id}"
                           ${requiredAttr}
                           value="${defaultValue}">
                `;
        }
    }

    async handleFormSubmit() {
        try {
            window.Logger?.info('[ConditionsFormGenerator] handleFormSubmit triggered', {}, { page: 'conditions-form-generator' });
            const formData = this.collectFormData();
            window.Logger?.debug?.('[ConditionsFormGenerator] collected form data', { formData }, { page: 'conditions-form-generator' });
            const validation = this.validator.validateCondition(formData);

            if (!validation.isValid) {
                window.Logger?.warn('[ConditionsFormGenerator] validation failed', { errors: validation.errors }, { page: 'conditions-form-generator' });
                this.presentValidationErrors(validation.errors);
                return;
            }

            this.setFormLoading(true);

            if (typeof this.onSubmitCallback === 'function') {
                await this.onSubmitCallback(formData);
                window.Logger?.info('[ConditionsFormGenerator] onSubmitCallback resolved', {}, { page: 'conditions-form-generator' });
            }
        } catch (error) {
            window.Logger?.error('Error submitting condition form', { error: error?.message, stack: error?.stack }, { page: 'conditions-form-generator' });
            this.showNotification(error.message || 'שגיאה בשליחת הטופס', 'error');
        } finally {
            this.setFormLoading(false);
            window.Logger?.debug?.('[ConditionsFormGenerator] handleFormSubmit finished', {}, { page: 'conditions-form-generator' });
        }
    }

    collectFormData() {
        const methodSelect = document.getElementById('methodSelect');
        const logicalOperator = document.getElementById('logicalOperator');
        const conditionGroup = document.getElementById('conditionGroup');
        const isActive = document.getElementById('isActive');

        const methodIdValue = methodSelect?.value ? Number(methodSelect.value) : null;

        const data = {
            method_id: Number.isInteger(methodIdValue) ? methodIdValue : null,
            logical_operator: logicalOperator?.value || 'NONE',
            condition_group: Number(conditionGroup?.value) || 0,
            is_active: Boolean(isActive?.checked),
            parameters_json: {}
        };

        if (this.currentMethod) {
            (this.currentMethod.parameters || []).forEach(parameter => {
                const input = document.getElementById(parameter.parameter_key);
                if (!input) return;

                if (parameter.parameter_type === 'boolean') {
                    data.parameters_json[parameter.parameter_key] = input.checked;
                    return;
                }

                if (parameter.parameter_type === 'number' ||
                    parameter.parameter_type === 'price' ||
                    parameter.parameter_type === 'percentage') {
                    const value = input.value;
                    if (value !== '') {
                        data.parameters_json[parameter.parameter_key] = Number(value);
                    }
                    return;
                }

                if (parameter.parameter_type === 'dropdown') {
                    if (input.value) {
                        data.parameters_json[parameter.parameter_key] = input.value;
                    }
                    return;
                }

                if (input.value) {
                    data.parameters_json[parameter.parameter_key] = input.value;
                }
            });
        }

        return data;
    }

    presentValidationErrors(errors) {
        document.querySelectorAll(`#${this.containerId} .invalid-feedback`).forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll(`#${this.containerId} .form-control, #${this.containerId} .form-select`).forEach(el => {
            el.classList.remove('is-invalid');
        });

        (errors || []).forEach(error => {
            if (typeof error === 'string') {
                this.showNotification(error, 'error');
            } else if (error?.field) {
                const input = document.getElementById(error.field);
                const feedback = document.getElementById(`${error.field}Error`);
                if (input) {
                    input.classList.add('is-invalid');
                }
                if (feedback) {
                    feedback.textContent = error.message || this.translator.getMessage('validation_failed');
                    feedback.style.display = 'block';
                }
            }
        });
    }

    setFormLoading(loading) {
        const saveBtn = document.getElementById('saveConditionBtn');
        if (!saveBtn) return;

        saveBtn.disabled = loading;
        saveBtn.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i> שומר...'
            : `<i class="fas fa-save"></i> ${this.translator.getFormLabel('save_condition')}`;
    }

    handleFormCancel() {
        if (typeof this.onCancelCallback === 'function') {
            this.onCancelCallback();
        }
    }

    setCallbacks(onSubmit, onCancel) {
        this.onSubmitCallback = onSubmit;
        this.onCancelCallback = onCancel;
    }

    populateForm(conditionData) {
        const logicalOperator = document.getElementById('logicalOperator');
        if (logicalOperator && conditionData.logical_operator) {
            logicalOperator.value = conditionData.logical_operator;
        }

        const conditionGroup = document.getElementById('conditionGroup');
        if (conditionGroup && conditionData.condition_group !== undefined) {
            conditionGroup.value = conditionData.condition_group;
        }

        const isActive = document.getElementById('isActive');
        if (isActive && conditionData.is_active !== undefined) {
            isActive.checked = conditionData.is_active;
        }

        const parameters = conditionData.parameters_json || conditionData.parameters;
        if (parameters && this.currentMethod) {
            const parsedParams = typeof parameters === 'string' ? this.safeParse(parameters, {}) : parameters;
            Object.entries(parsedParams).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (!input) return;

                if (input.type === 'checkbox') {
                    input.checked = Boolean(value);
                } else {
                    input.value = value;
                }
            });
        }
    }

    safeParse(value, fallback = null) {
        if (!value || typeof value !== 'string') {
            return value || fallback;
        }
        try {
            return JSON.parse(value);
        } catch (error) {
            window.Logger?.warn('[ConditionsFormGenerator] Failed to parse JSON value', { value, error: error?.message }, { page: 'conditions-form-generator' });
            return fallback;
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (window.notificationSystem && window.notificationSystem.showNotification) {
            window.notificationSystem.showNotification(message, type);
        } else {
            window.Logger?.info?.('[ConditionsFormGenerator] showNotification fallback', { type, message }, { page: 'conditions-form-generator' });
        }
    }
}

// Create global instance
window.conditionsFormGenerator = new ConditionsFormGenerator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsFormGenerator;
}





