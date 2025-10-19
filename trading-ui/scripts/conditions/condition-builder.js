/**
 * Condition Builder - Main Component
 * Builds conditions with methods and parameters
 * Uses Translation System for all UI text
 */

class ConditionBuilder {
    constructor(entityType, entityId, containerId) {
        this.entityType = entityType; // 'plan' or 'trade'
        this.entityId = entityId;
        this.containerId = containerId;
        this.conditions = [];
        this.methods = [];
        this.selectedMethod = null;
        this.validator = new ConditionValidator();
        this.initializeTranslations();
        this.initializeComponent();
    }
    
    /**
     * Initialize translations for the component
     */
    initializeTranslations() {
        this.translations = {
            selectMethod: this.getTranslation('conditions.select_method'),
            addCondition: this.getTranslation('conditions.add_condition'),
            editCondition: this.getTranslation('conditions.edit_condition'),
            deleteCondition: this.getTranslation('conditions.delete_condition'),
            saveCondition: this.getTranslation('conditions.save_condition'),
            cancel: this.getTranslation('conditions.cancel'),
            loading: this.getTranslation('conditions.loading'),
            error: this.getTranslation('conditions.error'),
            success: this.getTranslation('conditions.success'),
            warning: this.getTranslation('conditions.warning'),
            info: this.getTranslation('conditions.info')
        };
    }
    
    /**
     * Initialize the component
     */
    async initializeComponent() {
        try {
            await this.loadMethods();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Failed to initialize condition builder:', error);
            this.showNotification('conditions.error.load_methods', 'error');
        }
    }
    
    /**
     * Load trading methods from server
     */
    async loadMethods() {
        try {
            const response = await fetch('/api/trading-methods');
            if (!response.ok) {
                throw new Error('Failed to load methods');
            }
            
            const data = await response.json();
            this.methods = data.methods || [];
            
            // Group methods by category
            this.methodsByCategory = this.groupMethodsByCategory(this.methods);
        } catch (error) {
            console.error('Error loading methods:', error);
            throw error;
        }
    }
    
    /**
     * Group methods by category
     */
    groupMethodsByCategory(methods) {
        const grouped = {};
        methods.forEach(method => {
            if (!grouped[method.category]) {
                grouped[method.category] = [];
            }
            grouped[method.category].push(method);
        });
        return grouped;
    }
    
    /**
     * Render the component
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container ${this.containerId} not found`);
            return;
        }
        
        container.innerHTML = `
            <div class="condition-builder">
                <div class="method-selector-container">
                    <h6>${this.getTranslation('conditions.select_method')}</h6>
                    <div class="method-selector" id="methodSelector">
                        ${this.renderMethodSelector()}
                    </div>
                </div>
                
                <div class="parameter-form-container" id="parameterFormContainer" style="display: none;">
                    ${this.renderParameterForm()}
                </div>
                
                <div class="conditions-list-container">
                    <h6>תנאים קיימים</h6>
                    <div class="conditions-list" id="conditionsList">
                        ${this.renderConditionsList()}
                    </div>
                </div>
                
                <div class="condition-actions-bar">
                    <button type="button" class="btn" id="saveConditionsBtn">
                        <i class="fas fa-save me-2"></i>${this.getTranslation('conditions.save_condition')}
                    </button>
                    <button type="button" class="btn" id="testConditionsBtn">
                        <i class="fas fa-play me-2"></i>${this.getTranslation('conditions.actions.test_condition')}
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render method selector
     */
    renderMethodSelector() {
        let html = '';
        
        Object.entries(this.methodsByCategory).forEach(([category, methods]) => {
            html += `
                <div class="method-category">
                    <div class="category-title">${this.getTranslation(`conditions.category.${category}`)}</div>
                    <div class="method-cards">
                        ${methods.map(method => `
                            <div class="method-card" data-method-id="${method.id}">
                                <div class="method-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="method-name">${method.name_he}</div>
                                <div class="method-description">${method.description || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Render parameter form
     */
    renderParameterForm() {
        if (!this.selectedMethod) {
            return '<div class="text-muted">בחר שיטה כדי להגדיר פרמטרים</div>';
        }
        
        return `
            <div class="parameter-form">
                <h6>הגדרת פרמטרים - ${this.selectedMethod.name_he}</h6>
                <form id="parameterForm">
                    <div id="parameterFields">
                        <!-- Parameter fields will be loaded here -->
                    </div>
                    <div class="parameter-actions">
                        <button type="button" class="btn" id="addConditionBtn">
                            <i class="fas fa-plus me-2"></i>${this.getTranslation('conditions.add_condition')}
                        </button>
                        <button type="button" class="btn" id="cancelParameterBtn">
                            ${this.getTranslation('conditions.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    /**
     * Render conditions list
     */
    renderConditionsList() {
        if (this.conditions.length === 0) {
            return '<div class="text-muted">אין תנאים מוגדרים</div>';
        }
        
        return this.conditions.map((condition, index) => `
            <div class="condition-item" data-condition-index="${index}">
                <div class="condition-info">
                    <div class="condition-method">${condition.method_name}</div>
                    <div class="condition-parameters">${this.formatParameters(condition.parameters)}</div>
                    <div class="condition-operator">${this.getTranslation(`conditions.logical.${condition.logical_operator.toLowerCase()}`)}</div>
                </div>
                <div class="condition-actions">
                    <button data-button-type="EDIT" data-variant="small" data-index="${index}" data-text="" title="ערוך"></button>
                    <button data-button-type="DELETE" data-variant="small" data-index="${index}" data-text="" title="מחק"></button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Format parameters for display
     */
    formatParameters(parameters) {
        if (!parameters) return '';
        
        try {
            const params = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
            return Object.entries(params).map(([key, value]) => `${key}: ${value}`).join(', ');
        } catch (e) {
            return parameters;
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Method selection
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const methodId = parseInt(e.currentTarget.dataset.methodId);
                this.selectMethod(methodId);
            });
        });
        
        // Parameter form actions
        document.getElementById('addConditionBtn')?.addEventListener('click', () => {
            this.addCondition();
        });
        
        document.getElementById('cancelParameterBtn')?.addEventListener('click', () => {
            this.cancelParameterForm();
        });
        
        // Condition actions
        document.querySelectorAll('.edit-condition-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.editCondition(index);
            });
        });
        
        document.querySelectorAll('.delete-condition-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.deleteCondition(index);
            });
        });
        
        // Save conditions
        document.getElementById('saveConditionsBtn')?.addEventListener('click', () => {
            this.saveConditions();
        });
        
        // Test conditions
        document.getElementById('testConditionsBtn')?.addEventListener('click', () => {
            this.testConditions();
        });
    }
    
    /**
     * Select method and load parameters
     */
    async selectMethod(methodId) {
        try {
            this.selectedMethod = this.methods.find(m => m.id === methodId);
            if (!this.selectedMethod) {
                throw new Error('Method not found');
            }
            
            // Update UI
            document.querySelectorAll('.method-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-method-id="${methodId}"]`).classList.add('selected');
            
            // Load method parameters
            await this.loadMethodParameters(methodId);
            
            // Show parameter form
            document.getElementById('parameterFormContainer').style.display = 'block';
            
        } catch (error) {
            console.error('Error selecting method:', error);
            this.showNotification('conditions.error.load_parameters', 'error');
        }
    }
    
    /**
     * Load method parameters
     */
    async loadMethodParameters(methodId) {
        try {
            const response = await fetch(`/api/trading-methods/${methodId}/parameters`);
            if (!response.ok) {
                throw new Error('Failed to load parameters');
            }
            
            const data = await response.json();
            this.methodParameters = data.parameters || [];
            
            this.renderParameterFields();
        } catch (error) {
            console.error('Error loading method parameters:', error);
            throw error;
        }
    }
    
    /**
     * Render parameter fields
     */
    renderParameterFields() {
        const container = document.getElementById('parameterFields');
        if (!container) return;
        
        container.innerHTML = this.methodParameters.map(param => {
            return this.renderParameterField(param);
        }).join('');
        
        // Attach validation
        this.validator.attachRealTimeValidation(document.getElementById('parameterForm'));
    }
    
    /**
     * Render individual parameter field
     */
    renderParameterField(param) {
        const fieldId = `param_${param.parameter_key}`;
        const fieldName = `parameters.${param.parameter_key}`;
        
        let inputHtml = '';
        
        switch (param.parameter_type) {
            case 'number':
                inputHtml = `
                    <input type="number" 
                           class="form-control parameter-type-number" 
                           id="${fieldId}" 
                           name="${fieldName}"
                           value="${param.default_value || ''}"
                           min="${param.min_value || ''}"
                           max="${param.max_value || ''}"
                           ${param.is_required ? 'required' : ''}>
                `;
                break;
                
            case 'price':
                inputHtml = `
                    <input type="number" 
                           class="form-control parameter-type-price" 
                           id="${fieldId}" 
                           name="${fieldName}"
                           value="${param.default_value || ''}"
                           min="0"
                           step="0.01"
                           ${param.is_required ? 'required' : ''}>
                `;
                break;
                
            case 'percentage':
                inputHtml = `
                    <div class="input-group parameter-type-percentage">
                        <input type="number" 
                               class="form-control" 
                               id="${fieldId}" 
                               name="${fieldName}"
                               value="${param.default_value || ''}"
                               min="0"
                               max="100"
                               step="0.01"
                               ${param.is_required ? 'required' : ''}>
                        <span class="input-group-text">%</span>
                    </div>
                `;
                break;
                
            case 'period':
                inputHtml = `
                    <input type="number" 
                           class="form-control parameter-type-period" 
                           id="${fieldId}" 
                           name="${fieldName}"
                           value="${param.default_value || ''}"
                           min="1"
                           ${param.is_required ? 'required' : ''}>
                `;
                break;
                
            case 'boolean':
                inputHtml = `
                    <div class="form-check parameter-type-boolean">
                        <input type="checkbox" 
                               class="form-check-input" 
                               id="${fieldId}" 
                               name="${fieldName}"
                               value="true"
                               ${param.default_value === 'true' ? 'checked' : ''}>
                        <label class="form-check-label" for="${fieldId}">
                            ${param.parameter_name_he}
                        </label>
                    </div>
                `;
                break;
                
            case 'dropdown':
                const options = param.options ? param.options.split(',') : [];
                inputHtml = `
                    <select class="form-select parameter-type-dropdown" 
                            id="${fieldId}" 
                            name="${fieldName}"
                            ${param.is_required ? 'required' : ''}>
                        <option value="">בחר אפשרות</option>
                        ${options.map(option => `
                            <option value="${option.trim()}" ${param.default_value === option.trim() ? 'selected' : ''}>
                                ${option.trim()}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
                
            case 'date':
                inputHtml = `
                    <input type="date" 
                           class="form-control parameter-type-date" 
                           id="${fieldId}" 
                           name="${fieldName}"
                           value="${param.default_value || ''}"
                           ${param.is_required ? 'required' : ''}>
                `;
                break;
                
            default:
                inputHtml = `
                    <input type="text" 
                           class="form-control" 
                           id="${fieldId}" 
                           name="${fieldName}"
                           value="${param.default_value || ''}"
                           ${param.is_required ? 'required' : ''}>
                `;
        }
        
        return `
            <div class="mb-3">
                <label for="${fieldId}" class="form-label">
                    ${param.parameter_name_he}
                    ${param.is_required ? '<span class="text-danger">*</span>' : ''}
                </label>
                ${inputHtml}
                ${param.description ? `<small class="form-text text-muted">${param.description}</small>` : ''}
            </div>
        `;
    }
    
    /**
     * Add condition
     */
    async addCondition() {
        try {
            const formData = this.gatherFormData();
            
            // Validate form data
            const isValid = await this.validator.validateForm(formData, this.entityType);
            if (!isValid) {
                return;
            }
            
            // Create condition object
            const condition = {
                method_id: this.selectedMethod.id,
                method_name: this.selectedMethod.name_he,
                parameters: formData.parameters_json,
                logical_operator: formData.logical_operator || 'NONE',
                condition_group: formData.condition_group || 0,
                is_active: true
            };
            
            // Add to conditions list
            this.conditions.push(condition);
            
            // Update UI
            this.render();
            this.attachEventListeners();
            
            // Hide parameter form
            this.cancelParameterForm();
            
            this.showNotification('conditions.success.condition_saved', 'success');
            
        } catch (error) {
            console.error('Error adding condition:', error);
            this.showNotification('conditions.error.save_condition', 'error');
        }
    }
    
    /**
     * Edit condition
     */
    editCondition(index) {
        const condition = this.conditions[index];
        if (!condition) return;
        
        // Find method
        const method = this.methods.find(m => m.id === condition.method_id);
        if (!method) return;
        
        // Select method and load parameters
        this.selectMethod(method.id);
        
        // Populate form with existing values
        setTimeout(() => {
            this.populateParameterForm(condition.parameters);
        }, 100);
    }
    
    /**
     * Delete condition
     */
    deleteCondition(index) {
        if (confirm('האם אתה בטוח שברצונך למחוק תנאי זה?')) {
            this.conditions.splice(index, 1);
            this.render();
            this.attachEventListeners();
            this.showNotification('conditions.success.condition_deleted', 'success');
        }
    }
    
    /**
     * Cancel parameter form
     */
    cancelParameterForm() {
        document.getElementById('parameterFormContainer').style.display = 'none';
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('selected');
        });
        this.selectedMethod = null;
        this.validator.clearErrors();
    }
    
    /**
     * Gather form data
     */
    gatherFormData() {
        const formData = {
            method_id: this.selectedMethod?.id,
            logical_operator: 'NONE',
            condition_group: 0,
            is_active: true
        };
        
        // Add entity ID
        if (this.entityType === 'plan') {
            formData.trade_plan_id = this.entityId;
        } else {
            formData.trade_id = this.entityId;
        }
        
        // Gather parameters
        const parameters = {};
        this.methodParameters.forEach(param => {
            const fieldName = `parameters.${param.parameter_key}`;
            const input = document.querySelector(`[name="${fieldName}"]`);
            
            if (input) {
                let value = input.value;
                
                if (param.parameter_type === 'boolean') {
                    value = input.checked;
                } else if (param.parameter_type === 'number' || param.parameter_type === 'price' || param.parameter_type === 'percentage' || param.parameter_type === 'period') {
                    value = parseFloat(value) || 0;
                }
                
                parameters[param.parameter_key] = value;
            }
        });
        
        formData.parameters_json = JSON.stringify(parameters);
        
        return formData;
    }
    
    /**
     * Populate parameter form with existing values
     */
    populateParameterForm(parameters) {
        try {
            const params = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
            
            Object.entries(params).forEach(([key, value]) => {
                const input = document.querySelector(`[name="parameters.${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }
                }
            });
        } catch (error) {
            console.error('Error populating parameter form:', error);
        }
    }
    
    /**
     * Save conditions to server
     */
    async saveConditions() {
        try {
            if (this.conditions.length === 0) {
                this.showNotification('conditions.warning.no_conditions', 'warning');
                return;
            }
            
            const endpoint = this.entityType === 'plan' 
                ? `/api/trade-plans/${this.entityId}/conditions`
                : `/api/trades/${this.entityId}/conditions`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    conditions: this.conditions
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save conditions');
            }
            
            this.showNotification('conditions.success.condition_saved', 'success');
            
        } catch (error) {
            console.error('Error saving conditions:', error);
            this.showNotification('conditions.error.save_condition', 'error');
        }
    }
    
    /**
     * Test conditions
     */
    async testConditions() {
        try {
            if (this.conditions.length === 0) {
                this.showNotification('conditions.warning.no_conditions', 'warning');
                return;
            }
            
            const endpoint = this.entityType === 'plan' 
                ? `/api/trade-plans/${this.entityId}/conditions/test`
                : `/api/trades/${this.entityId}/conditions/test`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    conditions: this.conditions
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to test conditions');
            }
            
            const result = await response.json();
            this.showNotification('conditions.success.condition_tested', 'success');
            
        } catch (error) {
            console.error('Error testing conditions:', error);
            this.showNotification('conditions.error.test_condition', 'error');
        }
    }
    
    /**
     * Load existing conditions
     */
    async loadExistingConditions() {
        try {
            const endpoint = this.entityType === 'plan' 
                ? `/api/trade-plans/${this.entityId}/conditions`
                : `/api/trades/${this.entityId}/conditions`;
            
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to load conditions');
            }
            
            const data = await response.json();
            this.conditions = data.conditions || [];
            
            // Update UI
            this.render();
            this.attachEventListeners();
            
        } catch (error) {
            console.error('Error loading existing conditions:', error);
            // Don't show error notification for initial load
        }
    }
    
    /**
     * Helper methods
     */
    getTranslation(key) {
        return window.translations && window.translations[key] ? window.translations[key] : key;
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else if (window.showErrorNotification && type === 'error') {
            window.showErrorNotification(message);
        } else if (window.showSuccessNotification && type === 'success') {
            window.showSuccessNotification(message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Export for use in other modules
window.ConditionBuilder = ConditionBuilder;