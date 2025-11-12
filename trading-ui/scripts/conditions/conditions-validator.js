/**
 * Conditions Validator - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the conditions validation system for TikTrack including:
 * - Method validation rules
 * - Parameter validation
 * - Form validation
 * - Error handling and reporting
 * - Integration with constraints system
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Conditions Validator class
 * @class ConditionsValidator
 */
class ConditionsValidator {
    constructor() {
        this.validationRules = {
            // Method validation rules
            methods: {
                'moving_average': {
                    required: ['period', 'threshold'],
                    optional: ['timeframe'],
                    types: {
                        period: 'number',
                        threshold: 'number',
                        timeframe: 'string'
                    },
                    ranges: {
                        period: { min: 1, max: 200 },
                        threshold: { min: 0.1, max: 10 }
                    }
                },
                'rsi': {
                    required: ['period', 'overbought', 'oversold'],
                    optional: ['timeframe'],
                    types: {
                        period: 'number',
                        overbought: 'number',
                        oversold: 'number',
                        timeframe: 'string'
                    },
                    ranges: {
                        period: { min: 2, max: 100 },
                        overbought: { min: 70, max: 100 },
                        oversold: { min: 0, max: 30 }
                    }
                },
                'support_resistance': {
                    required: ['strength', 'touches'],
                    optional: ['timeframe'],
                    types: {
                        strength: 'number',
                        touches: 'number',
                        timeframe: 'string'
                    },
                    ranges: {
                        strength: { min: 1, max: 10 },
                        touches: { min: 2, max: 10 }
                    }
                },
                'trend_lines': {
                    required: ['sensitivity', 'timeframe'],
                    optional: ['min_touches'],
                    types: {
                        sensitivity: 'number',
                        timeframe: 'string',
                        min_touches: 'number'
                    },
                    ranges: {
                        sensitivity: { min: 0.1, max: 1 },
                        min_touches: { min: 2, max: 10 }
                    }
                },
                'technical_patterns': {
                    required: ['pattern_type', 'confidence'],
                    optional: ['timeframe'],
                    types: {
                        pattern_type: 'string',
                        confidence: 'number',
                        timeframe: 'string'
                    },
                    ranges: {
                        confidence: { min: 0.1, max: 1 }
                    }
                },
                'fibonacci': {
                    required: ['level', 'timeframe'],
                    optional: ['sensitivity'],
                    types: {
                        level: 'string',
                        timeframe: 'string',
                        sensitivity: 'number'
                    },
                    ranges: {
                        sensitivity: { min: 0.1, max: 1 }
                    }
                }
            },
            
            // General validation rules
            general: {
                logical_operator: {
                    allowed: ['NONE', 'AND', 'OR']
                },
                condition_group: {
                    type: 'number',
                    range: { min: 0, max: 99 }
                },
                is_active: {
                    type: 'boolean'
                }
            }
        };
    }
    
    /**
     * Validate condition
     * @function validateCondition
     * @param {Object} conditionData - Condition data
     * @returns {Object} Validation result
     */
    validateCondition(conditionData) {
        const errors = [];
        const warnings = [];
        
        try {
            // Validate method selection
            if (!conditionData.method_id) {
                errors.push('יש לבחור שיטת מסחר');
            }
            
            // Validate method parameters
            if (conditionData.method_id && conditionData.parameters_json) {
                const methodValidation = this.validateMethodParameters(
                    conditionData.method_id,
                    conditionData.parameters_json
                );
                errors.push(...methodValidation.errors);
                warnings.push(...methodValidation.warnings);
            }
            
            // Validate logical operator
            if (conditionData.logical_operator) {
                const operatorValidation = this.validateLogicalOperator(
                    conditionData.logical_operator
                );
                errors.push(...operatorValidation.errors);
            }
            
            // Validate condition group
            if (conditionData.condition_group !== undefined) {
                const groupValidation = this.validateConditionGroup(
                    conditionData.condition_group
                );
                errors.push(...groupValidation.errors);
            }
            
            // Validate is_active
            if (conditionData.is_active !== undefined) {
                const activeValidation = this.validateIsActive(
                    conditionData.is_active
                );
                errors.push(...activeValidation.errors);
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
            
        } catch (error) {
            return {
                isValid: false,
                errors: [`שגיאה בולידציה: ${error.message}`],
                warnings: []
            };
        }
    }
    
    /**
     * Validate method parameters
     * @function validateMethodParameters
     * @param {number} methodId - Method ID
     * @param {string} parametersJson - Parameters JSON string
     * @returns {Object} Validation result
     */
    validateMethodParameters(methodId, parametersJson) {
        const errors = [];
        const warnings = [];
        
        try {
            const methodDefinition = this.getMethodDefinition(methodId);
            const parameters = this.normalizeParameters(parametersJson);
            
            if (!parameters) {
                errors.push('פרמטרים אינם אובייקט תקין');
                return { errors, warnings };
            }
            
            if (methodDefinition) {
                this.validateDynamicMethodParameters(methodDefinition, parameters, errors, warnings);
            } else {
                this.validateFallbackMethodParameters(methodId, parameters, errors, warnings);
            }
            
            return { errors, warnings };
            
        } catch (error) {
            return {
                errors: [`שגיאה בולידציית פרמטרים: ${error.message}`],
                warnings: []
            };
        }
    }
    
    /**
     * Validate parameter type
     * @function validateParameterType
     * @param {string} paramName - Parameter name
     * @param {*} paramValue - Parameter value
     * @param {string} expectedType - Expected type
     * @returns {boolean} Whether type is valid
     */
    validateParameterType(paramName, paramValue, expectedType) {
        let actualType = typeof paramValue;
        
        // Handle special cases
        if (expectedType === 'number' && actualType === 'string') {
            const numValue = parseFloat(paramValue);
            if (!isNaN(numValue)) {
                actualType = 'number';
            }
        }
        
        if (actualType !== expectedType) {
            return {
                isValid: false,
                error: `פרמטר ${paramName} חייב להיות מסוג ${expectedType}, התקבל ${actualType}`
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate parameter range
     * @function validateParameterRange
     * @param {string} paramName - Parameter name
     * @param {*} paramValue - Parameter value
     * @param {Object} rangeRules - Range rules
     * @returns {boolean} Whether range is valid
     */
    validateParameterRange(paramName, paramValue, rangeRules) {
        if (rangeRules.min !== undefined && paramValue < rangeRules.min) {
            return {
                isValid: false,
                error: `פרמטר ${paramName} חייב להיות לפחות ${rangeRules.min}`
            };
        }
        
        if (rangeRules.max !== undefined && paramValue > rangeRules.max) {
            return {
                isValid: false,
                error: `פרמטר ${paramName} חייב להיות לכל היותר ${rangeRules.max}`
            };
        }
        
        return { isValid: true };
    }
    
    /**
     * Validate logical operator
     * @function validateLogicalOperator
     * @param {string} operator - Logical operator
     * @returns {boolean} Whether operator is valid
     */
    validateLogicalOperator(operator) {
        const errors = [];
        
        if (!this.validationRules.general.logical_operator.allowed.includes(operator)) {
            errors.push(`אופרטור לוגי לא תקין: ${operator}`);
        }
        
        return { errors };
    }
    
    /**
     * Validate condition group
     * @function validateConditionGroup
     * @param {number} group - Condition group
     * @returns {boolean} Whether group is valid
     */
    validateConditionGroup(group) {
        const errors = [];
        
        if (typeof group !== 'number') {
            errors.push('קבוצת תנאי חייבת להיות מספר');
        } else if (group < this.validationRules.general.condition_group.range.min ||
                   group > this.validationRules.general.condition_group.range.max) {
            errors.push(`קבוצת תנאי חייבת להיות בין ${this.validationRules.general.condition_group.range.min} ל-${this.validationRules.general.condition_group.range.max}`);
        }
        
        return { errors };
    }
    
    /**
     * Validate is active
     * @function validateIsActive
     * @param {boolean} isActive - Is active flag
     * @returns {boolean} Whether is active is valid
     */
    validateIsActive(isActive) {
        const errors = [];
        
        if (typeof isActive !== 'boolean') {
            errors.push('סטטוס פעיל חייב להיות true או false');
        }
        
        return { errors };
    }
    
    /**
     * Get method key from ID
     * @function getMethodKeyFromId
     * @param {number} methodId - Method ID
     * @returns {string|null} Method key
     */
    getMethodKeyFromId(methodId) {
        const definition = this.getMethodDefinition(methodId);
        if (definition?.method_key) {
            return definition.method_key;
        }
        
        const legacyMapping = {
            1: 'moving_average',
            2: 'rsi',
            3: 'support_resistance',
            4: 'trend_lines',
            5: 'technical_patterns',
            6: 'fibonacci'
        };
        
        const numericId = parseInt(methodId, 10);
        if (!Number.isNaN(numericId) && legacyMapping[numericId]) {
            return legacyMapping[numericId];
        }
        
        if (this.validationRules.methods[methodId]) {
            return methodId;
        }
        
        return null;
    }

    getMethodDefinition(methodId) {
        if (!this.crudManager || typeof this.crudManager.getCachedTradingMethods !== 'function') {
            return null;
        }
        const methods = this.crudManager.getCachedTradingMethods();
        if (!methods || methods.length === 0) {
            return null;
        }
        return methods.find(method => String(method.id) === String(methodId));
    }

    normalizeParameters(parametersJson) {
        if (!parametersJson) {
            return {};
        }
        
        if (typeof parametersJson === 'object' && !Array.isArray(parametersJson)) {
            return parametersJson;
        }
        
        if (typeof parametersJson === 'string') {
            try {
                const parsed = JSON.parse(parametersJson);
                return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (error) {
                console.warn('[ConditionsValidator] Failed to parse parameters JSON', error);
                return {};
            }
        }
        
        return {};
    }

    validateDynamicMethodParameters(methodDefinition, parameters, errors, warnings) {
        const parameterDefs = Array.isArray(methodDefinition.parameters) ? methodDefinition.parameters : [];
        
        parameterDefs.forEach(parameter => {
            const key = parameter.parameter_key;
            const value = parameters[key];
            const label = (window.conditionsTranslations?.getParameterName(key)) || parameter.parameter_name_he || key;
            const validationRule = this.safeParse(parameter.validation_rule);
            
            if (parameter.is_required && (value === undefined || value === null || value === '')) {
                errors.push(`הפרמטר ${label} הוא חובה`);
                return;
            }
            
            if (value === undefined || value === null || value === '') {
                return;
            }
            
            if (!this.validateDynamicParameterType(parameter.parameter_type, value)) {
                errors.push(`ערך לא תקין לפרמטר ${label}`);
                return;
            }
            
            if (!this.validateDynamicParameterRange(parameter, value)) {
                errors.push(`הערך לפרמטר ${label} מחוץ לטווח המותר`);
            }
            
            if (parameter.parameter_type === 'dropdown' && validationRule?.allowed_values) {
                const allowed = validationRule.allowed_values.map(String);
                if (!allowed.includes(String(value))) {
                    errors.push(`ערך לא חוקי עבור ${label}. ערכים מותרים: ${allowed.join(', ')}`);
                }
            }
        });
        
        Object.keys(parameters).forEach(key => {
            if (!parameterDefs.some(parameter => parameter.parameter_key === key)) {
                warnings.push(`⚠️ הפרמטר ${key} אינו מוכר לשיטה ${methodDefinition.method_key || methodDefinition.name}`);
            }
        });
    }

    validateDynamicParameterType(parameterType, value) {
        switch (parameterType) {
            case 'number':
            case 'price':
            case 'percentage':
                return typeof value === 'number' && !Number.isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'dropdown':
            case 'period':
            case 'string':
            case 'text':
                return typeof value === 'string' || typeof value === 'number';
            default:
                return true;
        }
    }

    validateDynamicParameterRange(parameter, value) {
        if (value === undefined || value === null || value === '') {
            return true;
        }
        
        if (typeof value !== 'number' || Number.isNaN(value)) {
            const numericTypes = ['number', 'price', 'percentage'];
            if (!numericTypes.includes(parameter.parameter_type)) {
                return true;
            }
        }
        
        const min = parameter.min_value !== undefined && parameter.min_value !== null ? Number(parameter.min_value) : null;
        const max = parameter.max_value !== undefined && parameter.max_value !== null ? Number(parameter.max_value) : null;
        
        if (min !== null && value < min) {
            return false;
        }
        
        if (max !== null && value > max) {
            return false;
        }
        
        return true;
    }

    validateFallbackMethodParameters(methodId, parameters, errors, warnings) {
        const methodKey = this.getMethodKeyFromId(methodId);
        if (!methodKey) {
            errors.push('שיטת מסחר לא זוהתה');
            return;
        }
        
        const rules = this.validationRules.methods[methodKey];
        if (!rules) {
            warnings.push(`⚠️ אין כללי ולידציה לשיטה ${methodKey}`);
            return;
        }
        
        for (const requiredParam of rules.required) {
            if (!(requiredParam in parameters)) {
                errors.push(`פרמטר נדרש חסר: ${requiredParam}`);
            }
        }
        
        for (const [paramName, paramValue] of Object.entries(parameters)) {
            const paramRules = rules.types[paramName];
            if (paramRules) {
                const typeValidation = this.validateParameterType(paramName, paramValue, paramRules);
                if (!typeValidation.isValid) {
                    errors.push(typeValidation.error);
                }
                
                const rangeRules = rules.ranges[paramName];
                if (rangeRules && typeof paramValue === 'number') {
                    const rangeValidation = this.validateParameterRange(paramName, paramValue, rangeRules);
                    if (!rangeValidation.isValid) {
                        errors.push(rangeValidation.error);
                    }
                }
            } else if (!rules.optional.includes(paramName)) {
                warnings.push(`פרמטר לא מוכר: ${paramName}`);
            }
        }
    }

    safeParse(value) {
        if (!value || typeof value !== 'string') {
            return {};
        }
        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn('[ConditionsValidator] Failed to parse validation rule', error);
            return {};
        }
    }
    
    /**
     * Validate for creation
     * @function validateForCreation
     * @param {Object} conditionData - Condition data
     * @returns {Object} Validation result
     */
    validateForCreation(conditionData) {
        const validation = this.validateCondition(conditionData);
        
        // Additional validation for creation
        if (!conditionData.trade_plan_id) {
            validation.errors.push('מזהה תכנית מסחר נדרש');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
    
    /**
     * Validate for update
     * @function validateForUpdate
     * @param {Object} conditionData - Condition data
     * @returns {Object} Validation result
     */
    validateForUpdate(conditionData) {
        const validation = this.validateCondition(conditionData);
        
        // Additional validation for update
        if (!conditionData.id) {
            validation.errors.push('מזהה תנאי נדרש לעדכון');
        }
        
        validation.isValid = validation.errors.length === 0;
        return validation;
    }
}

// Create global instance
window.conditionsValidator = new ConditionsValidator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsValidator;
}





