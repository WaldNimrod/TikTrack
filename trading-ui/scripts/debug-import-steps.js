/**
 * Import Steps Debug Helper
 * ==========================
 * 
 * קוד בדיקה לבעיית ייבוא נתונים - שלב 3 מציג 0 רשומות
 * 
 * שימוש: העתק את הקוד לקונסול הדפדפן והרץ
 */

(function() {
    'use strict';
    
    const debugImportSteps = {
        /**
         * בדיקה מקיפה של כל הנתונים בין שלב 2 ל-3
         */
        checkAll: function() {
            console.log('='.repeat(80));
            console.log('🔍 IMPORT STEPS DEBUG - Full Check');
            console.log('='.repeat(80));
            
            // Step 1: Check analysis results (step 2)
            this.checkStep2();
            
            // Step 2: Check preview data (step 3)
            this.checkStep3();
            
            // Step 3: Check filtering logic
            this.checkFiltering();
            
            // Step 4: Check selected types
            this.checkSelectedTypes();
            
            // Step 5: Check session data
            this.checkSessionData();
            
            console.log('='.repeat(80));
            console.log('✅ Debug check complete');
            console.log('='.repeat(80));
        },
        
        /**
         * בדיקת נתוני שלב 2 (ניתוח)
         */
        checkStep2: function() {
            console.log('\n📊 STEP 2 - Analysis Results:');
            console.log('-'.repeat(80));
            
            const analysisResults = window.analysisResults;
            if (!analysisResults) {
                console.error('❌ analysisResults is null/undefined');
                return;
            }
            
            console.log('✅ analysisResults exists');
            console.log('Task Type:', analysisResults.task_type);
            console.log('Total Records:', analysisResults.total_records);
            console.log('Valid Records:', analysisResults.valid_records);
            console.log('Clean Records:', analysisResults.clean_records);
            console.log('Invalid Records:', analysisResults.invalid_records);
            console.log('Duplicate Records:', analysisResults.duplicate_records);
            console.log('Existing Records:', analysisResults.existing_records);
            
            // Check cashflow specific data
            if (analysisResults.task_type === 'cashflows') {
                console.log('\n💰 Cashflow Analysis:');
                console.log('Cashflow Summary:', analysisResults.cashflow_summary);
                console.log('Records by Type:', analysisResults.records_by_type);
                console.log('Total by Type:', analysisResults.totals_by_type);
            }
            
            // Check duplicate details
            if (analysisResults.duplicate_details) {
                console.log('\n🔄 Duplicate Details:');
                console.log('Clean Records Count:', Array.isArray(analysisResults.duplicate_details.clean_records) 
                    ? analysisResults.duplicate_details.clean_records.length 
                    : 'Not an array');
                console.log('Clean Records Sample:', Array.isArray(analysisResults.duplicate_details.clean_records)
                    ? analysisResults.duplicate_details.clean_records.slice(0, 3)
                    : analysisResults.duplicate_details.clean_records);
            }
            
            // Check missing tickers
            if (analysisResults.missing_tickers) {
                console.log('\n⚠️ Missing Tickers:');
                console.log('Count:', Array.isArray(analysisResults.missing_tickers) 
                    ? analysisResults.missing_tickers.length 
                    : 'Not an array');
                console.log('Tickers:', analysisResults.missing_tickers);
            }
        },
        
        /**
         * בדיקת נתוני שלב 3 (תצוגה מקדימה)
         */
        checkStep3: function() {
            console.log('\n👁️ STEP 3 - Preview Data:');
            console.log('-'.repeat(80));
            
            // Check if previewData exists in window
            const previewData = window.previewData;
            if (previewData) {
                console.log('✅ window.previewData exists');
                console.log('Records to Import:', previewData.records_to_import?.length || 0);
                console.log('Records to Skip:', previewData.records_to_skip?.length || 0);
                console.log('Summary:', previewData.summary);
            } else {
                console.warn('⚠️ window.previewData not found');
            }
            
            // Check active session info
            const activeSession = window.activeSessionInfo;
            if (activeSession) {
                console.log('\n📋 Active Session Info:');
                console.log('Ready Records:', activeSession.readyRecords);
                console.log('Total Records:', activeSession.totalRecords);
                console.log('Skip Records:', activeSession.skipRecords);
                console.log('Task Type:', activeSession.taskType);
            }
            
            // Check DOM elements
            const previewContainer = document.getElementById('step-preview');
            if (previewContainer) {
                console.log('\n🎨 DOM Preview Container:');
                const importCountEl = previewContainer.querySelector('[data-import-count]');
                const skipCountEl = previewContainer.querySelector('[data-skip-count]');
                console.log('Import Count Element:', importCountEl?.textContent || 'Not found');
                console.log('Skip Count Element:', skipCountEl?.textContent || 'Not found');
            }
        },
        
        /**
         * בדיקת לוגיקת הסינון
         */
        checkFiltering: function() {
            console.log('\n🔍 FILTERING LOGIC:');
            console.log('-'.repeat(80));
            
            const analysisResults = window.analysisResults;
            if (!analysisResults) {
                console.error('❌ Cannot check filtering - no analysisResults');
                return;
            }
            
            // Check buildPreviewFromAnalysis logic
            if (analysisResults.duplicate_details) {
                const cleanRecords = Array.isArray(analysisResults.duplicate_details.clean_records)
                    ? analysisResults.duplicate_details.clean_records
                    : [];
                
                console.log('Clean Records from duplicate_details:', cleanRecords.length);
                
                // Check missing ticker filtering
                const problemData = this.buildProblemResolutionFromAnalysis(analysisResults);
                if (problemData) {
                    const missingTickerSymbols = problemData.summary.missing_tickers
                        .map(ticker => typeof ticker === 'string' ? ticker : ticker?.symbol)
                        .filter(Boolean);
                    
                    console.log('Missing Ticker Symbols:', missingTickerSymbols);
                    
                    const filteredRecords = cleanRecords.filter(record => {
                        const symbol = record.symbol || record.ticker || '';
                        return !missingTickerSymbols.includes(symbol);
                    });
                    
                    console.log('After Missing Ticker Filter:', filteredRecords.length);
                    console.log('Filtered Out:', cleanRecords.length - filteredRecords.length);
                }
            }
        },
        
        /**
         * בדיקת סוגים נבחרים (cashflow types)
         */
        checkSelectedTypes: function() {
            console.log('\n✅ SELECTED TYPES:');
            console.log('-'.repeat(80));
            
            const selectedTypes = window.selectedCashflowTypes;
            if (selectedTypes) {
                console.log('✅ selectedCashflowTypes exists');
                console.log('Selected Types Object:', selectedTypes);
                
                const selectedKeys = Object.keys(selectedTypes).filter(
                    key => selectedTypes[key] === true
                );
                console.log('Selected Keys (true):', selectedKeys);
                console.log('Selected Keys Count:', selectedKeys.length);
                
                if (selectedKeys.length === 0) {
                    console.error('❌ NO TYPES SELECTED! This is likely the problem!');
                    console.log('All types:', Object.keys(selectedTypes));
                    console.log('All values:', Object.values(selectedTypes));
                }
            } else {
                console.warn('⚠️ selectedCashflowTypes not found in window');
            }
            
            // Check DOM checkboxes
            const typeCheckboxes = document.querySelectorAll('[data-cashflow-type]');
            if (typeCheckboxes.length > 0) {
                console.log('\n📋 DOM Type Checkboxes:');
                typeCheckboxes.forEach(cb => {
                    console.log(`  ${cb.dataset.cashflowType}: ${cb.checked ? '✅' : '❌'}`);
                });
            }
        },
        
        /**
         * בדיקת נתוני סשן
         */
        checkSessionData: function() {
            console.log('\n💾 SESSION DATA:');
            console.log('-'.repeat(80));
            
            console.log('Current Session ID:', window.currentSessionId);
            console.log('Active Session Info:', window.activeSessionInfo);
            console.log('Linked Account Info:', window.linkedAccountInfo);
            console.log('Selected Data Type Key:', window.selectedDataTypeKey);
        },
        
        /**
         * שחזור buildProblemResolutionFromAnalysis (מתוך הקוד המקורי)
         */
        buildProblemResolutionFromAnalysis: function(results) {
            if (!results) return null;
            
            const summary = {
                total_records: results.total_records || 0,
                valid_records: results.valid_records || results.clean_records || 0,
                invalid_records: results.invalid_records || 0,
                duplicate_records: results.duplicate_records || 0,
                existing_records: results.existing_records || 0,
                missing_tickers: results.missing_tickers || [],
                records_to_import: results.clean_records || results.valid_records || 0,
                records_to_skip: (results.duplicate_records || 0) + 
                               (results.existing_records || 0) + 
                               (results.invalid_records || 0),
                import_rate: 0
            };
            
            if (summary.total_records > 0) {
                summary.import_rate = Math.round(
                    (summary.records_to_import / summary.total_records) * 100
                );
            }
            
            return {
                summary,
                records_to_skip: []
            };
        },
        
        /**
         * בדיקה מהירה - רק הנתונים החשובים
         */
        quickCheck: function() {
            console.log('⚡ QUICK CHECK:');
            console.log('-'.repeat(80));
            
            const analysis = window.analysisResults;
            const preview = window.previewData;
            const selected = window.selectedCashflowTypes;
            
            console.log('Analysis Total:', analysis?.total_records || 0);
            console.log('Analysis Clean:', analysis?.clean_records || 0);
            console.log('Preview Import:', preview?.records_to_import?.length || 0);
            console.log('Selected Types:', selected ? Object.keys(selected).filter(k => selected[k]).length : 0);
            
            if (analysis?.task_type === 'cashflows' && selected) {
                const selectedKeys = Object.keys(selected).filter(k => selected[k]);
                console.log('\n⚠️ ISSUE DETECTED:');
                if (selectedKeys.length === 0) {
                    console.error('❌ NO CASHFLOW TYPES SELECTED!');
                } else {
                    console.log('✅ Types selected:', selectedKeys);
                }
            }
        },
        
        /**
         * בדיקת תהליך הסינון בפועל
         */
        checkFilteringProcess: function() {
            console.log('\n🔍 FILTERING PROCESS CHECK:');
            console.log('-'.repeat(80));
            
            const analysis = window.analysisResults;
            const preview = window.previewData;
            const selected = window.selectedCashflowTypes;
            const taskType = analysis?.task_type || window.selectedDataTypeKey || 'executions';
            
            console.log('Task Type:', taskType);
            
            if (taskType === 'cashflows') {
                console.log('\n💰 Cashflow Filtering Analysis:');
                
                // Check selected types
                const selectedKeys = selected ? Object.keys(selected).filter(k => selected[k]) : [];
                console.log('Selected Types Keys:', selectedKeys);
                console.log('Selected Types Count:', selectedKeys.length);
                
                if (selectedKeys.length === 0) {
                    console.error('❌ PROBLEM: No types selected!');
                    console.log('All available types:', selected ? Object.keys(selected) : 'selectedCashflowTypes not found');
                }
                
                // Check preview data records
                if (preview && preview.records_to_import) {
                    console.log('\n📋 Preview Records Analysis:');
                    console.log('Total Records in Preview:', preview.records_to_import.length);
                    
                    if (preview.records_to_import.length > 0) {
                        // Sample first few records
                        const sample = preview.records_to_import.slice(0, 5);
                        console.log('Sample Records (first 5):');
                        sample.forEach((record, idx) => {
                            const type = record.cashflow_type || record.record?.cashflow_type || 'N/A';
                            console.log(`  ${idx + 1}. Type: "${type}"`, record);
                        });
                        
                        // Check type distribution
                        const typeCounts = {};
                        preview.records_to_import.forEach(record => {
                            const type = (record.cashflow_type || record.record?.cashflow_type || 'unknown').toLowerCase();
                            typeCounts[type] = (typeCounts[type] || 0) + 1;
                        });
                        console.log('\nType Distribution in Preview:');
                        Object.entries(typeCounts).forEach(([type, count]) => {
                            const isSelected = selectedKeys.some(st => st.toLowerCase() === type);
                            console.log(`  ${type}: ${count} ${isSelected ? '✅' : '❌ NOT SELECTED'}`);
                        });
                        
                        // Check if filtering would remove all
                        if (selectedKeys.length > 0) {
                            const wouldPass = preview.records_to_import.filter(record => {
                                const cashflowType = (record.cashflow_type || record.record?.cashflow_type || '').toLowerCase();
                                return selectedKeys.some(selectedType => selectedType.toLowerCase() === cashflowType);
                            });
                            console.log(`\nAfter Filtering: ${wouldPass.length} records would pass`);
                            if (wouldPass.length === 0 && preview.records_to_import.length > 0) {
                                console.error('❌ PROBLEM: All records filtered out!');
                                console.log('Selected types:', selectedKeys);
                                console.log('Available types in records:', Object.keys(typeCounts));
                            }
                        }
                    } else {
                        console.warn('⚠️ Preview has 0 records - checking analysis...');
                        if (analysis?.duplicate_details?.clean_records) {
                            const clean = analysis.duplicate_details.clean_records;
                            console.log('Clean records from analysis:', Array.isArray(clean) ? clean.length : 'Not an array');
                        }
                    }
                } else {
                    console.warn('⚠️ No preview data found');
                }
            } else {
                console.log('Not a cashflows task - filtering logic different');
            }
        },
        
        /**
         * בדיקת API response
         */
        checkAPIData: async function() {
            console.log('\n🌐 API DATA CHECK:');
            console.log('-'.repeat(80));
            
            const sessionId = window.currentSessionId;
            if (!sessionId) {
                console.error('❌ No session ID found');
                return;
            }
            
            const taskKey = window.selectedDataTypeKey || window.analysisResults?.task_type || 'executions';
            console.log('Session ID:', sessionId);
            console.log('Task Key:', taskKey);
            
            try {
                const response = await fetch(`/api/user-data-import/session/${sessionId}/preview?task_type=${encodeURIComponent(taskKey)}`);
                const data = await response.json();
                
                console.log('API Response Status:', response.status);
                console.log('API Response Data:', data);
                
                if (data.preview_data) {
                    console.log('\nPreview Data from API:');
                    console.log('Records to Import:', data.preview_data.records_to_import?.length || 0);
                    console.log('Records to Skip:', data.preview_data.records_to_skip?.length || 0);
                    console.log('Summary:', data.preview_data.summary);
                    console.log('Selected Types:', data.preview_data.selected_types);
                }
            } catch (error) {
                console.error('❌ API Check Failed:', error);
            }
        }
    };
    
    // Export to window
    window.debugImportSteps = debugImportSteps;
    
    console.log('✅ Import Steps Debug Helper loaded!');
    console.log('Usage:');
    console.log('  debugImportSteps.checkAll()     - Full detailed check');
    console.log('  debugImportSteps.quickCheck()   - Quick summary');
    console.log('  debugImportSteps.checkStep2()   - Check step 2 data');
    console.log('  debugImportSteps.checkStep3()   - Check step 3 data');
    console.log('  debugImportSteps.checkSelectedTypes() - Check selected types');
    
})();

