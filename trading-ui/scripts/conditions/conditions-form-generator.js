/**
 * Conditions Form Generator - TikTrack
 * =====================================
 *
 * מערכת יצירת טפסים דינמית למערכת התנאים
 * משתמש במערכת ה-condition-builder.js הקיימת
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 */

/**
 * Conditions Form Generator
 * מחולל טפסים דינמי לתנאים
 */
class ConditionsFormGenerator {
    constructor() {
        this.translator = window.conditionsTranslations;
        this.validator = window.conditionsValidator;
        this.crudManager = window.conditionsCRUDManager;
        this.currentMethod = null;
        this.currentParameters = {};
    }
    
    /**
     * Generate condition form
     * יצירת טופס תנאי
     */
    generateConditionForm(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        const formHtml = this.buildFormHTML(options);
        container.innerHTML = formHtml;
        
        // Setup event listeners
        this.setupFormEventListeners(containerId);
        
        // Load trading methods
        this.loadTradingMethods(containerId);
    }
    
    /**
     * Build form HTML
     * בניית HTML של הטופס
     */
    buildFormHTML(options = {}) {
        const isEdit = options.isEdit || false;
        const conditionData = options.conditionData || {};
        
        return `
            <div class="condition-form" id="conditionForm">
                <div class="condition-form-header">
                    <h4 id="formTitle">${isEdit ? this.translator.getFormLabel('edit_condition') : this.translator.getFormLabel('add_condition')}</h4>
                    <button class="btn btn-sm btn-secondary" id="closeFormBtn" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="condition-form-body">
                    <form id="conditionFormElement">
                        <!-- Method Selection -->
                        <div class="mb-3">
                            <label for="methodSelect" class="form-label">
                                ${this.translator.getFormLabel('select_method')}
                            </label>
                            <select class="form-select" id="methodSelect" required>
                                <option value="">${this.translator.getFormLabel('select_method')}...</option>
                            </select>
                            <div class="invalid-feedback" id="methodSelectError"></div>
                        </div>
                        
                        <!-- Method Parameters Container -->
                        <div id="parametersContainer" class="mb-3">
                            <label class="form-label">${this.translator.getFormLabel('method_parameters')}</label>
                            <div id="parametersFields"></div>
                        </div>
                        
                        <!-- Logical Operator -->
                        <div class="mb-3">
                            <label for="logicalOperator" class="form-label">
                                ${this.translator.getFormLabel('logical_operator')}
                            </label>
                            <select class="form-select" id="logicalOperator">
                                <option value="NONE">${this.translator.getOperator('NONE')}</option>
                                <option value="AND">${this.translator.getOperator('AND')}</option>
                                <option value="OR">${this.translator.getOperator('OR')}</option>
                            </select>
                        </div>
                        
                        <!-- Condition Group -->
                        <div class="mb-3">
                            <label for="conditionGroup" class="form-label">
                                ${this.translator.getFormLabel('condition_group')}
                            </label>
                            <input type="number" class="form-control" id="conditionGroup" 
                                   value="${conditionData.condition_group || 0}" 
                                   min="0" max="99">
                        </div>
                        
                        <!-- Is Active -->
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="isActive" 
                                   ${conditionData.is_active !== false ? 'checked' : ''}>
                            <label class="form-check-label" for="isActive">
                                ${this.translator.getFormLabel('is_active')}
                            </label>
                        </div>
                        
                        <!-- Form Actions -->
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary" type="submit" id="saveConditionBtn">
                                <i class="fas fa-save"></i>
                                ${this.translator.getFormLabel('save_condition')}
                            </button>
                            <button class="btn btn-secondary" type="button" id="cancelFormBtn">
                                <i class="fas fa-times"></i>
                                ${this.translator.getFormLabel('cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup form event listeners
     * הגדרת מאזיני אירועים לטופס
     */
    setupFormEventListeners(containerId) {
        const container = document.getElementById(containerId);
        
        // Method selection change
        const methodSelect = container.querySelector('#methodSelect');
        if (methodSelect) {
            methodSelect.addEventListener('change', (e) => {
                this.onMethodChange(e.target.value);
            });
        }
        
        // Form submission
        const form = container.querySelector('#conditionFormElement');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.onFormSubmit();
            });
        }
        
        // Cancel button
        const cancelBtn = container.querySelector('#cancelFormBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.onFormCancel();
            });
        }
        
        // Close button
        const closeBtn = container.querySelector('#closeFormBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.onFormCancel();
            });
        }
    }
    
    /**
     * Load trading methods
     * טעינת שיטות מסחר
     */
    async loadTradingMethods(containerId) {
        try {
            const methods = await this.crudManager.getTradingMethods();
            const methodSelect = document.querySelector('#methodSelect');
            
            if (methodSelect && methods) {
                // Clear existing options except the first one
                methodSelect.innerHTML = '<option value="">בחר שיטה...</option>';
                
                // Add method options
                methods.forEach(method => {
                    const option = document.createElement('option');
                    option.value = method.id;
                    option.textContent = method.name;
                    option.dataset.methodKey = method.key;
                    methodSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading trading methods:', error);
            this.showNotification('שגיאה בטעינת שיטות מסחר', 'error');
        }
    }
    
    /**
     * Handle method selection change
     * טיפול בשינוי בחירת שיטה
     */
    async onMethodChange(methodId) {
        if (!methodId) {
            this.clearParameters();
            return;
        }
        
        try {
            // Get method data
            const methods = await this.crudManager.getTradingMethods();
            const method = methods.find(m => m.id == methodId);
            
            if (method) {
                this.currentMethod = method;
                this.generateParameterFields(method);
            }
        } catch (error) {
            console.error('Error handling method change:', error);
            this.showNotification('שגיאה בטעינת פרמטרי השיטה', 'error');
        }
    }
    
    /**
     * Generate parameter fields
     * יצירת שדות פרמטרים
     */
    generateParameterFields(method) {
        const container = document.getElementById('parametersFields');
        if (!container) {
            return;
        }
        
        // Clear existing fields
        container.innerHTML = '';
        
        // Get validation rules for this method
        const methodKey = method.key;
        const validationRules = this.validator.validationRules.methods[methodKey];
        
        if (!validationRules) {
            container.innerHTML = '<div class="text-muted">אין פרמטרים נדרשים לשיטה זו</div>';
            return;
        }
        
        // Generate fields for required parameters
        validationRules.required.forEach(paramName => {
            const field = this.createParameterField(paramName, validationRules, true);
            container.appendChild(field);
        });
        
        // Generate fields for optional parameters
        if (validationRules.optional) {
            validationRules.optional.forEach(paramName => {
                const field = this.createParameterField(paramName, validationRules, false);
                container.appendChild(field);
            });
        }
    }
    
    /**
     * Create parameter field
     * יצירת שדה פרמטר
     */
    createParameterField(paramName, validationRules, isRequired) {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'mb-3';
        
        const paramType = validationRules.types[paramName];
        const paramRange = validationRules.ranges[paramName];
        const translatedName = this.translator.getParameterName(paramName);
        
        let inputHtml = '';
        
        switch (paramType) {
            case 'number':
                inputHtml = this.createNumberInput(paramName, paramRange, isRequired);
                break;
            case 'string':
                inputHtml = this.createStringInput(paramName, isRequired);
                break;
            case 'boolean':
                inputHtml = this.createBooleanInput(paramName, isRequired);
                break;
            default:
                inputHtml = this.createTextInput(paramName, isRequired);
        }
        
        fieldContainer.innerHTML = `
            <label for="${paramName}" class="form-label">
                ${translatedName}
                ${isRequired ? '<span class="text-danger">*</span>' : ''}
            </label>
            ${inputHtml}
            <div class="invalid-feedback" id="${paramName}Error"></div>
        `;
        
        return fieldContainer;
    }
    
    /**
     * Create number input
     * יצירת שדה מספר
     */
    createNumberInput(paramName, paramRange, isRequired) {
        const min = paramRange?.min || '';
        const max = paramRange?.max || '';
        const step = paramName.includes('threshold') || paramName.includes('sensitivity') ? '0.1' : '1';
        
        return `
            <input type="number" class="form-control" id="${paramName}" 
                   name="${paramName}" ${isRequired ? 'required' : ''}
                   min="${min}" max="${max}" step="${step}"
                   placeholder="הזן ${this.translator.getParameterName(paramName)}">
        `;
    }
    
    /**
     * Create string input
     * יצירת שדה טקסט
     */
    createStringInput(paramName, isRequired) {
        return `
            <input type="text" class="form-control" id="${paramName}" 
                   name="${paramName}" ${isRequired ? 'required' : ''}
                   placeholder="הזן ${this.translator.getParameterName(paramName)}">
        `;
    }
    
    /**
     * Create boolean input
     * יצירת שדה בוליאני
     */
    createBooleanInput(paramName, isRequired) {
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="${paramName}" 
                       name="${paramName}" ${isRequired ? 'required' : ''}>
                <label class="form-check-label" for="${paramName}">
                    ${this.translator.getParameterName(paramName)}
                </label>
            </div>
        `;
    }
    
    /**
     * Create text input (fallback)
     * יצירת שדה טקסט (ברירת מחדל)
     */
    createTextInput(paramName, isRequired) {
        return `
            <input type="text" class="form-control" id="${paramName}" 
                   name="${paramName}" ${isRequired ? 'required' : ''}
                   placeholder="הזן ${this.translator.getParameterName(paramName)}">
        `;
    }
    
    /**
     * Clear parameters
     * ניקוי פרמטרים
     */
    clearParameters() {
        const container = document.getElementById('parametersFields');
        if (container) {
            container.innerHTML = '<div class="text-muted">בחר שיטת מסחר כדי לראות פרמטרים</div>';
        }
        this.currentMethod = null;
        this.currentParameters = {};
    }
    
    /**
     * Handle form submission
     * טיפול בשליחת טופס
     */
    async onFormSubmit() {
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Validate form data
            const validation = this.validator.validateCondition(formData);
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }
            
            // Show loading state
            this.setFormLoading(true);
            
            // Submit data (this would be handled by the parent component)
            if (this.onSubmitCallback) {
                await this.onSubmitCallback(formData);
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('שגיאה בשליחת הטופס', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }
    
    /**
     * Collect form data
     * איסוף נתוני טופס
     */
    collectFormData() {
        const formData = {
            method_id: document.getElementById('methodSelect')?.value,
            logical_operator: document.getElementById('logicalOperator')?.value || 'NONE',
            condition_group: parseInt(document.getElementById('conditionGroup')?.value) || 0,
            is_active: document.getElementById('isActive')?.checked || false,
            parameters_json: {}
        };
        
        // Collect parameter values
        if (this.currentMethod) {
            const methodKey = this.currentMethod.key;
            const validationRules = this.validator.validationRules.methods[methodKey];
            
            if (validationRules) {
                const allParams = [...(validationRules.required || []), ...(validationRules.optional || [])];
                
                allParams.forEach(paramName => {
                    const input = document.getElementById(paramName);
                    if (input) {
                        let value = input.value;
                        
                        // Convert value based on type
                        const paramType = validationRules.types[paramName];
                        if (paramType === 'number') {
                            value = parseFloat(value) || 0;
                        } else if (paramType === 'boolean') {
                            value = input.checked;
                        }
                        
                        if (value !== '' && value !== null && value !== undefined) {
                            formData.parameters_json[paramName] = value;
                        }
                    }
                });
            }
        }
        
        return formData;
    }
    
    /**
     * Show validation errors
     * הצגת שגיאות ולידציה
     */
    showValidationErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.form-control, .form-select').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        // Show new errors
        errors.forEach(error => {
            this.showNotification(error, 'error');
        });
    }
    
    /**
     * Set form loading state
     * הגדרת מצב טעינה לטופס
     */
    setFormLoading(loading) {
        const saveBtn = document.getElementById('saveConditionBtn');
        if (saveBtn) {
            saveBtn.disabled = loading;
            if (loading) {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> שומר...';
            } else {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> שמור תנאי';
            }
        }
    }
    
    /**
     * Handle form cancel
     * טיפול בביטול טופס
     */
    onFormCancel() {
        if (this.onCancelCallback) {
            this.onCancelCallback();
        } else {
            // Default behavior - hide form
            const form = document.getElementById('conditionForm');
            if (form) {
                form.style.display = 'none';
            }
        }
    }
    
    /**
     * Set form callbacks
     * הגדרת callback functions
     */
    setCallbacks(onSubmit, onCancel) {
        this.onSubmitCallback = onSubmit;
        this.onCancelCallback = onCancel;
    }
    
    /**
     * Populate form with existing data
     * מילוי טופס בנתונים קיימים
     */
    populateForm(conditionData) {
        // Set method
        const methodSelect = document.getElementById('methodSelect');
        if (methodSelect && conditionData.method_id) {
            methodSelect.value = conditionData.method_id;
            this.onMethodChange(conditionData.method_id);
        }
        
        // Set other fields
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
        
        // Set parameters (after method is loaded)
        setTimeout(() => {
            if (conditionData.parameters_json) {
                const parameters = typeof conditionData.parameters_json === 'string' 
                    ? JSON.parse(conditionData.parameters_json) 
                    : conditionData.parameters_json;
                
                Object.entries(parameters).forEach(([key, value]) => {
                    const input = document.getElementById(key);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = Boolean(value);
                        } else {
                            input.value = value;
                        }
                    }
                });
            }
        }, 500);
    }
    
    /**
     * Show notification
     * הצגת התראה
     */
    showNotification(message, type = 'info') {
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (window.notificationSystem && window.notificationSystem.showNotification) {
            window.notificationSystem.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Create global instance
window.conditionsFormGenerator = new ConditionsFormGenerator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsFormGenerator;
}





