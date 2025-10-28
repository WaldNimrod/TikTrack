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
            // Get method key from methodId (assuming methodId corresponds to method key)
            const methodKey = this.getMethodKeyFromId(methodId);
            if (!methodKey) {
                errors.push('שיטת מסחר לא זוהתה');
                return { errors, warnings };
            }
            
            const rules = this.validationRules.methods[methodKey];
            if (!rules) {
                errors.push(`כללי ולידציה לא נמצאו עבור שיטה: ${methodKey}`);
                return { errors, warnings };
            }
            
            // Parse parameters if string
            let parameters;
            if (typeof parametersJson === 'string') {
                try {
                    parameters = JSON.parse(parametersJson);
                } catch (e) {
                    errors.push('פורמט פרמטרים לא תקין');
                    return { errors, warnings };
                }
            } else {
                parameters = parametersJson;
            }
            
            // Validate required parameters
            for (const requiredParam of rules.required) {
                if (!(requiredParam in parameters)) {
                    errors.push(`פרמטר נדרש חסר: ${requiredParam}`);
                }
            }
            
            // Validate parameter types and ranges
            for (const [paramName, paramValue] of Object.entries(parameters)) {
                const paramRules = rules.types[paramName];
                if (paramRules) {
                    // Type validation
                    const typeValidation = this.validateParameterType(paramName, paramValue, paramRules);
                    if (!typeValidation.isValid) {
                        errors.push(typeValidation.error);
                    }
                    
                    // Range validation
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
        // This would typically come from the trading methods API
        // For now, we'll use a simple mapping
        const methodMapping = {
            1: 'moving_average',
            2: 'rsi',
            3: 'support_resistance',
            4: 'trend_lines',
            5: 'technical_patterns',
            6: 'fibonacci'
        };
        
        return methodMapping[methodId];
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





