/**
 * Edit Modal Test Suite
 * סקריפט בדיקה אוטומטית למודולי עריכה
 * 
 * בודק שכל השדות נטענים נכון במודול עריכה לכל ה-entity types
 * 
 * @file edit-modal-test.js
 * @version 1.0.0
 * @created January 27, 2025
 */


// ===== FUNCTION INDEX =====

// === Class Methods ===
// - EditModalTestSuite.shouldIgnoreField() - Shouldignorefield

// === Data Functions ===
// - EditModalTestSuite.getFirstId() - Getfirstid
// - EditModalTestSuite.getFieldIds() - Getfieldids
// - EditModalTestSuite.getFieldValue() - Getfieldvalue

(function() {
    'use strict';

    /**
     * Edit Modal Test Suite
     * בודק שמודולי עריכה טוענים שדות נכון
     */
    class EditModalTestSuite {
        constructor() {
            this.entityTypes = [
                { type: 'trade', modalId: 'tradesModal', dataVar: 'tradesData' },
                { type: 'trade_plan', modalId: 'tradePlansModal', dataVar: 'tradePlansData' },
                { type: 'execution', modalId: 'executionsModal', dataVar: 'executionsData' },
                { type: 'alert', modalId: 'alertsModal', dataVar: 'alertsData' },
                { type: 'ticker', modalId: 'tickersModal', dataVar: 'tickersData' },
                { type: 'trading_account', modalId: 'tradingAccountsModal', dataVar: 'trading_accountsData' },
                { type: 'cash_flow', modalId: 'cashFlowModal', dataVar: 'cashFlowsData' },
                { type: 'note', modalId: 'notesModal', dataVar: 'notesData' }
            ];
            
            this.results = {
                passed: [],
                failed: [],
                warnings: []
            };
        }

        /**
         * Get first available ID from data array
         * @param {string} dataVar - Window variable name for data array
         * @returns {number|null} First ID or null
         */
        getFirstId(dataVar) {
            const data = window[dataVar];
            if (!data || !Array.isArray(data) || data.length === 0) {
                return null;
            }
            return data[0].id;
        }

        /**
         * Get field IDs from modal configuration
         * @param {string} entityType - Entity type
         * @returns {Array<string>} Array of field IDs
         */
        getFieldIds(entityType) {
            const configs = {
                'trade': window.tradesModalConfig,
                'trade_plan': window.tradePlansModalConfig,
                'execution': window.executionsModalConfig,
                'alert': window.alertsModalConfig,
                'ticker': window.tickersModalConfig,
                'trading_account': window.tradingAccountsModalConfig,
                'cash_flow': window.cashFlowModalConfig,
                'note': window.notesModalConfig
            };
            
            const config = configs[entityType];
            if (!config) return [];
            
            const fieldIds = [];
            
            // Handle regular fields array
            if (config.fields && Array.isArray(config.fields)) {
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
         * Get field value from form
         * @param {HTMLElement} modal - Modal element
         * @param {string} fieldId - Field ID
         * @returns {any} Field value
         */
        getFieldValue(modal, fieldId) {
            const field = modal.querySelector(`#${fieldId}`);
            if (!field) return null;
            
            if (field.type === 'checkbox' || field.type === 'radio') {
                return field.checked;
            } else if (field.tagName === 'SELECT') {
                return field.value;
            } else if (field.classList && field.classList.contains('rich-text-editor-container')) {
                // Rich text editor
                if (window.RichTextEditorService && typeof window.RichTextEditorService.getEditorInstance === 'function') {
                    const editor = window.RichTextEditorService.getEditorInstance(fieldId);
                    if (editor) {
                        return editor.root.innerHTML;
                    }
                }
                return field.dataset.pendingContent || '';
            } else {
                return field.value;
            }
        }

        /**
         * Check if field should be ignored
         * @param {string} fieldId - Field ID
         * @returns {boolean} True if should ignore
         */
        shouldIgnoreField(fieldId) {
            const ignorePatterns = [
                'TickerInfo',
                'TickerInfoDisplay',
                'RiskSummaryCard',
                'CreatedAt',
                'Separator',
                'ExternalData',
                'NetAmount',
                'Summary'
            ];
            
            return ignorePatterns.some(pattern => fieldId.includes(pattern));
        }

        /**
         * Test edit modal for a single entity type
         * @param {Object} entityConfig - Entity configuration
         * @returns {Promise<Object>} Test results
         */
        async testEntityType(entityConfig) {
            const { type, modalId, dataVar } = entityConfig;
            
            console.log(`\n🧪 Testing ${type}...`);
            
            // Get first ID
            const testId = this.getFirstId(dataVar);
            if (!testId) {
                return {
                    entityType: type,
                    success: false,
                    error: `No data available for ${type} (${dataVar} is empty or undefined)`
                };
            }
            
            console.log(`   Using ID: ${testId}`);
            
            // Open edit modal
            if (!window.ModalManagerV2 || typeof window.ModalManagerV2.showEditModal !== 'function') {
                return {
                    entityType: type,
                    success: false,
                    error: 'ModalManagerV2 not available'
                };
            }
            
            // Open modal
            window.ModalManagerV2.showEditModal(modalId, type, testId);
            
            // Wait for modal to open and data to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Find modal element
            const modal = document.querySelector(`#${modalId}`);
            if (!modal) {
                return {
                    entityType: type,
                    success: false,
                    error: `Modal ${modalId} not found`
                };
            }
            
            // Get field IDs from config
            const fieldIds = this.getFieldIds(type);
            
            // Get API data for comparison
            let apiData = null;
            try {
                const response = await fetch(`/api/${type.replace('_', '-')}/${testId}`);
                if (response.ok) {
                    apiData = await response.json();
                }
            } catch (error) {
                console.warn(`   ⚠️ Could not fetch API data: ${error.message}`);
            }
            
            // Check each field
            const fieldChecks = [];
            const issues = [];
            
            fieldIds.forEach(fieldId => {
                if (this.shouldIgnoreField(fieldId)) {
                    return; // Skip display/separator fields
                }
                
                const fieldValue = this.getFieldValue(modal, fieldId);
                const fieldExists = modal.querySelector(`#${fieldId}`) !== null;
                
                fieldChecks.push({
                    fieldId,
                    exists: fieldExists,
                    hasValue: fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
                });
                
                if (!fieldExists) {
                    issues.push({
                        type: 'field_not_found',
                        field: fieldId,
                        message: `Field ${fieldId} not found in modal`
                    });
                } else if (!fieldValue && fieldValue !== 0 && fieldValue !== false) {
                    // Field exists but has no value - might be OK if API data also doesn't have it
                    if (apiData) {
                        const fieldMapping = window.ModalManagerV2.getFieldMapping(type);
                        const apiFieldName = Object.keys(fieldMapping).find(key => fieldMapping[key] === fieldId);
                        if (apiFieldName && apiData[apiFieldName] !== null && apiData[apiFieldName] !== undefined) {
                            issues.push({
                                type: 'field_not_populated',
                                field: fieldId,
                                apiField: apiFieldName,
                                message: `Field ${fieldId} exists but not populated (API has value: ${apiData[apiFieldName]})`
                            });
                        }
                    }
                }
            });
            
            // Close modal
            const closeBtn = modal.querySelector('.btn-close, [data-bs-dismiss="modal"]');
            if (closeBtn) {
                closeBtn.click();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            return {
                entityType: type,
                testId,
                success: issues.length === 0,
                fieldChecks,
                issues,
                fieldCount: fieldIds.length,
                checkedCount: fieldChecks.length
            };
        }

        /**
         * Run all tests
         * @returns {Promise<Object>} Complete test results
         */
        async runAllTests() {
            console.log('🚀 Starting Edit Modal Test Suite...');
            console.log('='.repeat(60));
            
            const results = {};
            
            for (const entityConfig of this.entityTypes) {
                try {
                    const result = await this.testEntityType(entityConfig);
                    results[entityConfig.type] = result;
                    
                    if (result.success) {
                        console.log(`✅ ${entityConfig.type}: All fields checked (${result.checkedCount}/${result.fieldCount} fields)`);
                        this.results.passed.push(entityConfig.type);
                    } else {
                        console.error(`❌ ${entityConfig.type}: Found ${result.issues?.length || 0} issues`);
                        if (result.issues) {
                            result.issues.forEach(issue => {
                                console.error(`   - ${issue.message}`);
                            });
                        }
                        this.results.failed.push({ entityType: entityConfig.type, result });
                    }
                } catch (error) {
                    console.error(`❌ ${entityConfig.type}: Test failed with error:`, error);
                    results[entityConfig.type] = {
                        entityType: entityConfig.type,
                        success: false,
                        error: error.message
                    };
                    this.results.failed.push({ entityType: entityConfig.type, error: error.message });
                }
                
                // Wait between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 Test Summary:');
            console.log(`✅ Passed: ${this.results.passed.length}`);
            console.log(`❌ Failed: ${this.results.failed.length}`);
            console.log('='.repeat(60));
            
            return {
                results,
                summary: {
                    passed: this.results.passed.length,
                    failed: this.results.failed.length,
                    total: this.entityTypes.length
                }
            };
        }

        /**
         * Generate detailed report
         * @returns {string} HTML report
         */
        async generateReport() {
            const testResults = await this.runAllTests();
            let html = '<div style="font-family: monospace; padding: 20px;">';
            html += '<h2>Edit Modal Test Report</h2>';
            html += `<p><strong>Summary:</strong> ${testResults.summary.passed} passed, ${testResults.summary.failed} failed</p>`;
            
            this.entityTypes.forEach(entityConfig => {
                const result = testResults.results[entityConfig.type];
                html += `<h3>${entityConfig.type}</h3>`;
                html += `<p>Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}</p>`;
                html += `<p>Test ID: ${result.testId || 'N/A'}</p>`;
                html += `<p>Fields: ${result.checkedCount || 0}/${result.fieldCount || 0} checked</p>`;
                
                if (result.issues && result.issues.length > 0) {
                    html += '<ul>';
                    result.issues.forEach(issue => {
                        html += `<li style="color: red;">${issue.message}</li>`;
                    });
                    html += '</ul>';
                }
                
                if (result.error) {
                    html += `<p style="color: red;">Error: ${result.error}</p>`;
                }
            });
            
            html += '</div>';
            return html;
        }
    }

    // Export to window
    window.EditModalTestSuite = EditModalTestSuite;

    // Auto-run if requested
    if (window.autoRunEditModalTests) {
        const testSuite = new EditModalTestSuite();
        testSuite.runAllTests();
    }

    console.log('✅ Edit Modal Test Suite loaded. Use: new EditModalTestSuite().runAllTests()');
})();

