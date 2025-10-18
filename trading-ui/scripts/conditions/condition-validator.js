/**
 * Condition Validator
 * Integrates with validation-system.js and notification-system.js
 * Provides comprehensive client and server-side validation
 */

class ConditionValidator {
    constructor() {
        this.errors = {};
        this.validationRules = {
            method_id: { required: true, type: 'number' },
            parameters_json: { required: true, type: 'json' },
            trade_plan_id: { required: true, type: 'number' },
            trade_id: { required: true, type: 'number' },
            condition_group: { required: false, type: 'number', min: 0 },
            logical_operator: { required: false, type: 'string', enum: ['AND', 'OR', 'NONE'] },
            is_active: { required: false, type: 'boolean' }
        };
    }
    
    /**
     * Validate form data before submission
     */
    async validateForm(formData, entityType) {
        // Clear previous errors
        this.clearErrors();
        
        // 1. Client-side validation
        const clientErrors = this.validateClientSide(formData, entityType);
        if (Object.keys(clientErrors).length > 0) {
            this.displayFieldErrors(clientErrors);
            this.showNotification('validation.client_errors', 'error');
            return false;
        }
        
        // 2. Server-side validation
        const serverValid = await this.validateServerSide(formData, entityType);
        if (!serverValid) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Client-side validation
     */
    validateClientSide(formData, entityType) {
        const errors = {};
        
        // Validate method selection
        if (!formData.method_id) {
            errors.method_id = this.getTranslation('validation.method_required');
        } else if (!this.isValidNumber(formData.method_id)) {
            errors.method_id = this.getTranslation('validation.invalid_value');
        }
        
        // Validate parameters
        if (!formData.parameters_json) {
            errors.parameters_json = this.getTranslation('validation.parameters_required');
        } else {
            try {
                const params = JSON.parse(formData.parameters_json);
                if (!this.validateParameters(params)) {
                    errors.parameters_json = this.getTranslation('validation.invalid_value');
                }
            } catch (e) {
                errors.parameters_json = this.getTranslation('validation.invalid_json');
            }
        }
        
        // Validate entity ID
        const entityIdField = entityType === 'plan' ? 'trade_plan_id' : 'trade_id';
        if (!formData[entityIdField]) {
            errors[entityIdField] = this.getTranslation('validation.entity_required');
        } else if (!this.isValidNumber(formData[entityIdField])) {
            errors[entityIdField] = this.getTranslation('validation.invalid_value');
        }
        
        // Validate logical operator
        if (formData.logical_operator && !['AND', 'OR', 'NONE'].includes(formData.logical_operator)) {
            errors.logical_operator = this.getTranslation('validation.invalid_value');
        }
        
        // Validate condition group
        if (formData.condition_group !== undefined && formData.condition_group < 0) {
            errors.condition_group = this.getTranslation('validation.min_value').replace('{min}', '0');
        }
        
        return errors;
    }
    
    /**
     * Validate parameters object
     */
    validateParameters(params) {
        if (typeof params !== 'object' || params === null) {
            return false;
        }
        
        // Check for required parameters based on method
        // This would be expanded based on the specific method requirements
        return true;
    }
    
    /**
     * Server-side validation via API
     */
    async validateServerSide(formData, entityType) {
        try {
            const endpoint = entityType === 'plan' 
                ? '/api/plan-conditions/validate'
                : '/api/trade-conditions/validate';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (!response.ok || result.status === 'error') {
                this.displayServerErrors(result.errors);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Server validation error:', error);
            this.showNotification('validation.server_error', 'error');
            return false;
        }
    }
    
    /**
     * Display field-specific errors
     */
    displayFieldErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const inputElement = document.querySelector(`[name="${field}"]`);
            if (inputElement) {
                this.markFieldAsInvalid(inputElement, message);
            }
        });
        
        this.errors = errors;
    }
    
    /**
     * Mark field as invalid
     */
    markFieldAsInvalid(inputElement, message) {
        // Add is-invalid class (Bootstrap standard)
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
        
        // Find or create feedback element
        let feedbackElement = inputElement.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            inputElement.parentNode.insertBefore(feedbackElement, inputElement.nextSibling);
        }
        
        // Set translated error message
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
    }
    
    /**
     * Mark field as valid
     */
    markFieldAsValid(inputElement) {
        inputElement.classList.add('is-valid');
        inputElement.classList.remove('is-invalid');
        
        const feedbackElement = inputElement.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.style.display = 'none';
        }
    }
    
    /**
     * Display server errors
     */
    displayServerErrors(errors) {
        if (errors.general) {
            this.showNotification(errors.general, 'error');
        }
        
        if (errors.fields) {
            this.displayFieldErrors(errors.fields);
        }
    }
    
    /**
     * Clear all validation errors
     */
    clearErrors() {
        // Remove validation classes from all inputs
        document.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });
        
        // Hide all feedback elements
        document.querySelectorAll('.invalid-feedback, .valid-feedback').forEach(el => {
            el.style.display = 'none';
        });
        
        this.errors = {};
    }
    
    /**
     * Real-time field validation (on blur)
     */
    attachRealTimeValidation(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // Clear error on change
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    input.classList.remove('is-invalid');
                    const feedback = input.nextElementSibling;
                    if (feedback && feedback.classList.contains('invalid-feedback')) {
                        feedback.style.display = 'none';
                    }
                }
            });
        });
    }
    
    /**
     * Validate single field
     */
    async validateField(inputElement) {
        const fieldName = inputElement.name;
        const fieldValue = inputElement.value;
        
        // Simple client-side checks
        if (inputElement.required && !fieldValue) {
            this.markFieldAsInvalid(inputElement, this.getTranslation('validation.field_required'));
            return false;
        }
        
        // Type-specific validation
        if (fieldValue) {
            const rule = this.validationRules[fieldName];
            if (rule) {
                if (rule.type === 'number' && !this.isValidNumber(fieldValue)) {
                    this.markFieldAsInvalid(inputElement, this.getTranslation('validation.invalid_value'));
                    return false;
                }
                
                if (rule.type === 'json') {
                    try {
                        JSON.parse(fieldValue);
                    } catch (e) {
                        this.markFieldAsInvalid(inputElement, this.getTranslation('validation.invalid_json'));
                        return false;
                    }
                }
                
                if (rule.enum && !rule.enum.includes(fieldValue)) {
                    this.markFieldAsInvalid(inputElement, this.getTranslation('validation.invalid_value'));
                    return false;
                }
            }
        }
        
        // Mark as valid if no errors
        this.markFieldAsValid(inputElement);
        return true;
    }
    
    /**
     * Validate parameter value based on type
     */
    validateParameterValue(value, parameterType, constraints = {}) {
        switch (parameterType) {
            case 'number':
                if (!this.isValidNumber(value)) return false;
                if (constraints.min !== undefined && value < constraints.min) return false;
                if (constraints.max !== undefined && value > constraints.max) return false;
                return true;
                
            case 'price':
                if (!this.isValidNumber(value) || value < 0) return false;
                return true;
                
            case 'percentage':
                if (!this.isValidNumber(value) || value < 0 || value > 100) return false;
                return true;
                
            case 'period':
                if (!this.isValidNumber(value) || value < 1) return false;
                return true;
                
            case 'boolean':
                return typeof value === 'boolean' || value === 'true' || value === 'false';
                
            case 'dropdown':
                return constraints.options ? constraints.options.includes(value) : true;
                
            case 'date':
                return !isNaN(Date.parse(value));
                
            default:
                return true;
        }
    }
    
    /**
     * Helper methods
     */
    isValidNumber(value) {
        return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
    }
    
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
    
    /**
     * Validate condition group
     */
    validateConditionGroup(conditions) {
        if (!Array.isArray(conditions) || conditions.length === 0) {
            return { valid: false, error: 'No conditions in group' };
        }
        
        // Check for valid logical operators
        const operators = conditions.map(c => c.logical_operator).filter(Boolean);
        const invalidOperators = operators.filter(op => !['AND', 'OR', 'NONE'].includes(op));
        
        if (invalidOperators.length > 0) {
            return { valid: false, error: 'Invalid logical operators' };
        }
        
        return { valid: true };
    }
    
    /**
     * Validate method parameters
     */
    async validateMethodParameters(methodId, parameters) {
        try {
            // Load method parameters from server
            const response = await fetch(`/api/trading-methods/${methodId}/parameters`);
            const methodParams = await response.json();
            
            if (!response.ok) {
                return { valid: false, error: 'Failed to load method parameters' };
            }
            
            const errors = {};
            
            // Validate each parameter
            methodParams.forEach(param => {
                const value = parameters[param.parameter_key];
                
                if (param.is_required && (value === undefined || value === null || value === '')) {
                    errors[param.parameter_key] = this.getTranslation('validation.field_required');
                    return;
                }
                
                if (value !== undefined && value !== null && value !== '') {
                    const isValid = this.validateParameterValue(value, param.parameter_type, {
                        min: param.min_value,
                        max: param.max_value,
                        options: param.options
                    });
                    
                    if (!isValid) {
                        errors[param.parameter_key] = this.getTranslation('validation.invalid_value');
                    }
                }
            });
            
            return {
                valid: Object.keys(errors).length === 0,
                errors: errors
            };
        } catch (error) {
            console.error('Method parameter validation error:', error);
            return { valid: false, error: 'Validation error' };
        }
    }
}

// Export for use in other modules
window.ConditionValidator = ConditionValidator;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize global validator instance
        window.conditionValidator = new ConditionValidator();
    });
} else {
    window.conditionValidator = new ConditionValidator();
}