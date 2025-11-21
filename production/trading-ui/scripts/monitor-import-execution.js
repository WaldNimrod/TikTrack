/**
 * Monitor Import Execution - Real-time Import Monitoring
 * 
 * This script monitors the actual import execution process in real-time.
 * It intercepts the execute_import API call and tracks what happens during import.
 * 
 * Usage in browser console:
 *   startImportMonitoring()  - Start monitoring
 *   stopImportMonitoring()   - Stop monitoring
 *   checkImportResults()     - Check what was actually imported
 * 
 * @author TikTrack Development Team
 * @version 1.0
 * @since 2025-01-16
 */

(function() {
    'use strict';

    let monitoringActive = false;
    let originalFetch = null;
    let importCallData = null;
    let importResponse = null;

    /**
     * Start monitoring import execution
     */
    window.startImportMonitoring = function() {
        if (monitoringActive) {
            console.log('⚠️ [MONITOR] Monitoring already active');
            return;
        }

        console.log('🔍 [MONITOR] Starting import execution monitoring...\n');
        monitoringActive = true;
        importCallData = null;
        importResponse = null;

        // Intercept fetch calls
        originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            const options = args[1] || {};

            // Check if this is the execute_import call
            if (typeof url === 'string' && url.includes('/api/user-data-import/session/') && url.includes('/execute')) {
                console.log('📡 [MONITOR] Intercepted execute_import API call');
                console.log('   URL:', url);
                
                // Parse request body
                if (options.body) {
                    try {
                        const bodyData = JSON.parse(options.body);
                        importCallData = {
                            url: url,
                            method: options.method || 'POST',
                            headers: options.headers || {},
                            body: bodyData
                        };
                        
                        console.log('📤 [MONITOR] Request payload:');
                        console.log('   selected_types:', bodyData.selected_types);
                        console.log('   generate_report:', bodyData.generate_report);
                        console.log('   Full body:', bodyData);
                        console.log('');
                        
                        // Extract session ID from URL
                        const sessionMatch = url.match(/\/session\/(\d+)\//);
                        if (sessionMatch) {
                            importCallData.sessionId = parseInt(sessionMatch[1]);
                            console.log('   Session ID:', importCallData.sessionId);
                        }
                        
                    } catch (e) {
                        console.warn('⚠️ [MONITOR] Could not parse request body:', e);
                    }
                }
                
                // Call original fetch and monitor response
                return originalFetch.apply(this, args)
                    .then(async (response) => {
                        console.log('📥 [MONITOR] Response received');
                        console.log('   Status:', response.status, response.statusText);
                        
                        // Clone response to read body without consuming it
                        const clonedResponse = response.clone();
                        try {
                            const responseData = await clonedResponse.json();
                            importResponse = {
                                status: response.status,
                                statusText: response.statusText,
                                data: responseData
                            };
                            
                            console.log('📊 [MONITOR] Response data:');
                            console.log('   success:', responseData.status === 'success' || responseData.success);
                            console.log('   imported_count:', responseData.imported_count || responseData.importedCount || 0);
                            console.log('   skipped_count:', responseData.skipped_count || responseData.skippedCount || 0);
                            console.log('   import_errors:', responseData.import_errors || []);
                            console.log('   Full response:', responseData);
                            console.log('');
                            
                            // If import succeeded, check what was actually created
                            if (response.status === 200 && (responseData.status === 'success' || responseData.success)) {
                                console.log('✅ [MONITOR] Import completed successfully!');
                                console.log('   Waiting 2 seconds for database commit...');
                                setTimeout(() => {
                                    checkImportResults(importCallData.sessionId);
                                }, 2000);
                            }
                            
                        } catch (e) {
                            console.warn('⚠️ [MONITOR] Could not parse response:', e);
                        }
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('❌ [MONITOR] Request failed:', error);
                        return Promise.reject(error);
                    });
            }
            
            // For all other fetch calls, use original
            return originalFetch.apply(this, args);
        };

        console.log('✅ [MONITOR] Monitoring active - waiting for import execution...\n');
        console.log('   💡 Click "ייבוא" button to trigger import');
        console.log('   💡 Use checkImportResults(sessionId) to manually check results\n');
    };

    /**
     * Stop monitoring
     */
    window.stopImportMonitoring = function() {
        if (!monitoringActive) {
            console.log('⚠️ [MONITOR] Monitoring not active');
            return;
        }

        if (originalFetch) {
            window.fetch = originalFetch;
            originalFetch = null;
        }
        
        monitoringActive = false;
        console.log('🛑 [MONITOR] Monitoring stopped');
    };

    /**
     * Check what was actually imported to database
     */
    window.checkImportResults = async function(sessionId = null) {
        const targetSessionId = sessionId || importCallData?.sessionId || window.currentSessionId;
        
        if (!targetSessionId) {
            console.error('❌ [MONITOR] No session ID available');
            console.log('   Provide session ID: checkImportResults(123)');
            return;
        }

        console.log('🔍 [MONITOR] Checking import results for session', targetSessionId);
        console.log('');

        try {
            // Get what was sent
            if (importCallData) {
                console.log('📤 [MONITOR] What was SENT to backend:');
                console.log('   selected_types:', importCallData.body?.selected_types || 'None');
                console.log('');
            }

            // Get what backend says was imported
            if (importResponse) {
                console.log('📊 [MONITOR] Backend response:');
                console.log('   imported_count:', importResponse.data.imported_count || importResponse.data.importedCount || 0);
                console.log('   skipped_count:', importResponse.data.skipped_count || importResponse.data.skippedCount || 0);
                console.log('');
            }

            // Check what was actually created in database
            console.log('💾 [MONITOR] Checking database for imported records...');
            const dbCheckResponse = await fetch(`/api/cash-flows?source=file_import&limit=1000`);
            if (!dbCheckResponse.ok) {
                throw new Error(`HTTP ${dbCheckResponse.status}`);
            }
            const dbData = await dbCheckResponse.json();
            const importedRecords = dbData.data || dbData.cash_flows || dbData || [];

            console.log('📊 [MONITOR] Database check results:');
            console.log('   Total imported records (source=file_import):', importedRecords.length);
            console.log('');

            if (importedRecords.length === 0) {
                console.warn('⚠️ [MONITOR] No imported records found in database!');
                console.log('   This could mean:');
                console.log('   - Import failed silently');
                console.log('   - Records were created with different source');
                console.log('   - Database query failed');
                return;
            }

            // Group by type
            const byType = {};
            importedRecords.forEach(record => {
                const type = record.type || 'NO_TYPE';
                if (!byType[type]) {
                    byType[type] = {
                        count: 0,
                        examples: []
                    };
                }
                byType[type].count++;
                if (byType[type].examples.length < 3) {
                    byType[type].examples.push({
                        id: record.id,
                        amount: record.amount,
                        currency_id: record.currency_id,
                        date: record.date,
                        external_id: record.external_id
                    });
                }
            });

            console.log('📋 [MONITOR] Records by type in database:');
            Object.keys(byType).sort().forEach(type => {
                const info = byType[type];
                console.log(`   ${type}: ${info.count} records`);
                if (info.examples.length > 0) {
                    console.log(`      Examples:`);
                    info.examples.forEach(ex => {
                        console.log(`        ID:${ex.id}, Amount:${ex.amount}, Date:${ex.date}, External ID:${ex.external_id || 'N/A'}`);
                    });
                }
            });
            console.log('');

            // Compare with what was sent
            if (importCallData?.body?.selected_types) {
                const selectedTypes = importCallData.body.selected_types.map(t => t.toLowerCase());
                const importedTypes = Object.keys(byType).map(t => t.toLowerCase());
                
                console.log('🔍 [MONITOR] Filtering validation:');
                console.log('   Selected types:', selectedTypes);
                console.log('   Imported types:', importedTypes);
                console.log('');

                const unexpectedTypes = importedTypes.filter(type => {
                    return !selectedTypes.some(selected => {
                        // Handle type mappings (e.g., borrow_fee -> fee)
                        if (selected === 'borrow_fee' && type === 'fee') return true;
                        if (selected === 'borrow_fee' && type === 'borrow_fee') return true;
                        return selected === type;
                    });
                });

                if (unexpectedTypes.length > 0) {
                    console.error('❌ [MONITOR] UNEXPECTED TYPES FOUND in database:');
                    unexpectedTypes.forEach(type => {
                        const originalType = Object.keys(byType).find(t => t.toLowerCase() === type);
                        console.error(`   ❌ ${originalType}: ${byType[originalType].count} records (NOT in selected_types!)`);
                    });
                    console.log('');
                } else {
                    console.log('✅ [MONITOR] All imported types match selected_types');
                    console.log('');
                }

                const missingTypes = selectedTypes.filter(selected => {
                    return !importedTypes.some(type => {
                        if (selected === 'borrow_fee' && type === 'fee') return true;
                        if (selected === 'borrow_fee' && type === 'borrow_fee') return true;
                        return selected === type;
                    });
                });

                if (missingTypes.length > 0) {
                    console.warn('⚠️ [MONITOR] SELECTED TYPES NOT FOUND in database:');
                    missingTypes.forEach(type => {
                        console.warn(`   ⚠️ ${type} (selected but not imported)`);
                    });
                    console.log('');
                }
            }

            // Summary
            console.log('📊 [MONITOR] Summary:');
            console.log('   Session ID:', targetSessionId);
            if (importCallData?.body?.selected_types) {
                console.log('   Selected types:', importCallData.body.selected_types.length);
            }
            console.log('   Backend says imported:', importResponse?.data?.imported_count || 0);
            console.log('   Actually in database:', importedRecords.length);
            console.log('   Unique types imported:', Object.keys(byType).length);
            console.log('');

            return {
                sessionId: targetSessionId,
                selectedTypes: importCallData?.body?.selected_types || [],
                backendImported: importResponse?.data?.imported_count || 0,
                actuallyImported: importedRecords.length,
                typesBreakdown: byType
            };

        } catch (error) {
            console.error('❌ [MONITOR] Error checking results:', error);
            console.error('   Stack:', error.stack);
            return null;
        }
    };

    /**
     * Show monitoring status
     */
    window.showMonitoringStatus = function() {
        console.log('📊 [MONITOR] Monitoring Status:');
        console.log('   Active:', monitoringActive ? '✅ Yes' : '❌ No');
        if (importCallData) {
            console.log('   Last call data:', importCallData);
        }
        if (importResponse) {
            console.log('   Last response:', importResponse);
        }
        if (!monitoringActive && !importCallData) {
            console.log('   💡 Run startImportMonitoring() to begin');
        }
    };

    // Auto-start if we're on the import page
    if (window.location.pathname.includes('data_import')) {
        console.log('✅ [MONITOR] Import execution monitoring functions loaded!');
        console.log('   Use: startImportMonitoring() - Start monitoring');
        console.log('   Use: stopImportMonitoring() - Stop monitoring');
        console.log('   Use: checkImportResults(sessionId) - Check what was imported');
        console.log('   Use: showMonitoringStatus() - Show current status');
        console.log('');
        console.log('💡 Run startImportMonitoring() now to monitor the next import!');
    }

})();

