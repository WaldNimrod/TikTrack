/**
 * Field Mapping Validator
 * סקריפט לבדיקת מיפויי שדות מקיפה
 * 
 * בודק שכל השדות בקונפיגורציות המודלים ממופים נכון ב-getFieldMapping
 * 
 * @file field-mapping-validator.js
 * @version 1.0.0
 * @created January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Class Methods ===
// - FieldMappingValidator.shouldIgnoreField() - Shouldignorefield
// - FieldMappingValidator.isSpecialField() - Isspecialfield
// - FieldMappingValidator.generateReport() - Generatereport

// === Event Handlers ===
// - FieldMappingValidator.getFieldIdsFromConfig() - Getfieldidsfromconfig

// === Data Functions ===
// - FieldMappingValidator.getFieldMappings() - Getfieldmappings
// - FieldMappingValidator.getReverseMappings() - Getreversemappings

// === Utility Functions ===
// - FieldMappingValidator.validateEntityType() - Validateentitytype
// - FieldMappingValidator.validateAll() - Validateall

(function() {
    'use strict';

    /**
     * Field Mapping Validator Class
     * בודק מיפויי שדות בין קונפיגורציות מודלים ל-field mappings
     */
    class FieldMappingValidator {
        constructor() {
            this.entityTypes = [
                'trade',
                'trade_plan',
                'execution',
                'alert',
                'ticker',
                'trading_account',
                'cash_flow',
                'note'
            ];
            
            this.modalConfigs = {
                'trade': window.tradesModalConfig,
                'trade_plan': window.tradePlansModalConfig,
                'execution': window.executionsModalConfig,
                'alert': window.alertsModalConfig,
                'ticker': window.tickersModalConfig,
                'trading_account': window.tradingAccountsModalConfig,
                'cash_flow': window.cashFlowModalConfig,
                'note': window.notesModalConfig
            };
            
            this.results = {
                passed: [],
                failed: [],
                warnings: []
            };
        }

        /**
         * Get all field IDs from modal configuration
         * @param {Object} config - Modal configuration object
         * @returns {Array<string>} Array of field IDs
         */
        getFieldIdsFromConfig(config) {
            const fieldIds = [];
            
            if (!config || !config.fields) {
                return fieldIds;
            }
            
            // Handle regular fields array
            if (Array.isArray(config.fields)) {
                config.fields.forEach(field => {
                    if (field.id && field.type !== 'separator' && field.type !== 'display') {
                        fieldIds.push(field.id);
                    }
                });
            }
            
            // Handle tabs (like cash_flow)
            if (config.tabs && Array.isArray(config.tabs)) {
                config.tabs.forEach(tab => {
                    if (tab.fields && Array.isArray(tab.fields)) {
                        tab.fields.forEach(field => {
                            if (field.id && field.type !== 'separator' && field.type !== 'display') {
                                fieldIds.push(field.id);
                            }
                        });
                    }
                });
            }
            
            return fieldIds;
        }

        /**
         * Get field mappings for entity type
         * @param {string} entityType - Entity type name
         * @returns {Object} Field mappings object
         */
        getFieldMappings(entityType) {
            if (!window.ModalManagerV2) {
                throw new Error('ModalManagerV2 not available');
            }
            
            return window.ModalManagerV2.getFieldMapping(entityType) || {};
        }

        /**
         * Get reverse mappings (form field ID -> API field name)
         * @param {Object} mappings - Field mappings object
         * @returns {Object} Reverse mappings object
         */
        getReverseMappings(mappings) {
            const reverse = {};
            for (const [apiField, formField] of Object.entries(mappings)) {
                reverse[formField] = apiField;
            }
            return reverse;
        }

        /**
         * Check if field should be ignored (metadata fields)
         * @param {string} fieldId - Field ID
         * @param {string} entityType - Entity type
         * @returns {boolean} True if field should be ignored
         */
        shouldIgnoreField(fieldId, entityType) {
            // Fields that are handled specially or are display-only
            const ignorePatterns = [
                'TickerInfo',
                'TickerInfoDisplay',
                'RiskSummaryCard',
                'CreatedAt',
                'Separator',
                'ExternalData'
            ];
            
            return ignorePatterns.some(pattern => fieldId.includes(pattern));
        }

        /**
         * Validate field mappings for a single entity type
         * @param {string} entityType - Entity type to validate
         * @returns {Object} Validation results
         */
        validateEntityType(entityType) {
            const config = this.modalConfigs[entityType];
            if (!config) {
                return {
                    entityType,
                    success: false,
                    error: `Configuration not found for ${entityType}`
                };
            }
            
            const fieldIds = this.getFieldIdsFromConfig(config);
            const mappings = this.getFieldMappings(entityType);
            const reverseMappings = this.getReverseMappings(mappings);
            
            const issues = [];
            const warnings = [];
            const mappedFields = [];
            
            // Check 1: All config fields should be mapped (or ignored)
            fieldIds.forEach(fieldId => {
                if (this.shouldIgnoreField(fieldId, entityType)) {
                    return; // Skip display/separator fields
                }
                
                if (!reverseMappings[fieldId]) {
                    // Check if it's a special field handled elsewhere
                    const isSpecialField = this.isSpecialField(fieldId, entityType);
                    if (!isSpecialField) {
                        issues.push({
                            type: 'missing_mapping',
                            field: fieldId,
                            message: `Field ${fieldId} in config is not mapped in getFieldMapping`
                        });
                    }
                } else {
                    mappedFields.push(fieldId);
                }
            });
            
            // Check 2: All mappings should exist in config
            Object.keys(reverseMappings).forEach(formFieldId => {
                if (!fieldIds.includes(formFieldId)) {
                    warnings.push({
                        type: 'orphan_mapping',
                        field: formFieldId,
                        apiField: reverseMappings[formFieldId],
                        message: `Mapping for ${formFieldId} exists but field not found in config`
                    });
                }
            });
            
            return {
                entityType,
                success: issues.length === 0,
                fieldCount: fieldIds.length,
                mappedCount: mappedFields.length,
                issues,
                warnings
            };
        }

        /**
         * Check if field is handled specially (not in regular mappings)
         * @param {string} fieldId - Field ID
         * @param {string} entityType - Entity type
         * @returns {boolean} True if field is special
         */
        isSpecialField(fieldId, entityType) {
            // Fields that are handled in populateSpecialSelects or other special handlers
            const specialFields = {
                'trade': ['tradeTickerInfoDisplay', 'tradeRiskSummaryCard'],
                'trade_plan': ['tradePlanTickerInfo', 'tradePlanRiskSummaryCard'],
                'alert': ['alertTicker', 'alertTickerInfo', 'alertStatusCombined'],
                'execution': ['linkedTrade'],
                'cash_flow': ['linkedTrade'],
                'note': [],
                'ticker': ['tickerExternalDataSection'],
                'trading_account': []
            };
            
            return (specialFields[entityType] || []).includes(fieldId);
        }

        /**
         * Run validation for all entity types
         * @returns {Object} Complete validation results
         */
        validateAll() {
            console.log('🔍 Starting field mapping validation...');
            
            const results = {};
            
            this.entityTypes.forEach(entityType => {
                console.log(`\n📋 Validating ${entityType}...`);
                const result = this.validateEntityType(entityType);
                results[entityType] = result;
                
                if (result.success) {
                    console.log(`✅ ${entityType}: All fields mapped correctly (${result.mappedCount}/${result.fieldCount} fields)`);
                    this.results.passed.push(entityType);
                } else {
                    console.error(`❌ ${entityType}: Found ${result.issues.length} issues`);
                    result.issues.forEach(issue => {
                        console.error(`   - ${issue.message}`);
                    });
                    this.results.failed.push({ entityType, issues: result.issues });
                }
                
                if (result.warnings && result.warnings.length > 0) {
                    console.warn(`⚠️ ${entityType}: Found ${result.warnings.length} warnings`);
                    result.warnings.forEach(warning => {
                        console.warn(`   - ${warning.message}`);
                    });
                    this.results.warnings.push({ entityType, warnings: result.warnings });
                }
            });
            
            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 Validation Summary:');
            console.log(`✅ Passed: ${this.results.passed.length}`);
            console.log(`❌ Failed: ${this.results.failed.length}`);
            console.log(`⚠️ Warnings: ${this.results.warnings.length}`);
            console.log('='.repeat(60));
            
            return {
                results,
                summary: {
                    passed: this.results.passed.length,
                    failed: this.results.failed.length,
                    warnings: this.results.warnings.length,
                    total: this.entityTypes.length
                }
            };
        }

        /**
         * Generate detailed report
         * @returns {string} HTML report
         */
        generateReport() {
            const validation = this.validateAll();
            let html = '<div style="font-family: monospace; padding: 20px;">';
            html += '<h2>Field Mapping Validation Report</h2>';
            html += `<p><strong>Summary:</strong> ${validation.summary.passed} passed, ${validation.summary.failed} failed, ${validation.summary.warnings} warnings</p>`;
            
            this.entityTypes.forEach(entityType => {
                const result = validation.results[entityType];
                html += `<h3>${entityType}</h3>`;
                html += `<p>Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}</p>`;
                html += `<p>Fields: ${result.mappedCount}/${result.fieldCount} mapped</p>`;
                
                if (result.issues && result.issues.length > 0) {
                    html += '<ul>';
                    result.issues.forEach(issue => {
                        html += `<li style="color: red;">${issue.message}</li>`;
                    });
                    html += '</ul>';
                }
                
                if (result.warnings && result.warnings.length > 0) {
                    html += '<ul>';
                    result.warnings.forEach(warning => {
                        html += `<li style="color: orange;">${warning.message}</li>`;
                    });
                    html += '</ul>';
                }
            });
            
            html += '</div>';
            return html;
        }
    }

    // Export to window
    window.FieldMappingValidator = FieldMappingValidator;

    // Auto-run if requested
    if (window.autoRunFieldMappingValidation) {
        const validator = new FieldMappingValidator();
        validator.validateAll();
    }

    console.log('✅ Field Mapping Validator loaded. Use: new FieldMappingValidator().validateAll()');
})();

