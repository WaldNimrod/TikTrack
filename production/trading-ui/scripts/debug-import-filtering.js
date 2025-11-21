/**
 * Debug Import Filtering - Console Helper
 * 
 * This script provides console functions to debug the import filtering process.
 * It checks what the system intends to import and whether the selected_types filter is correctly applied.
 * 
 * Usage in browser console:
 *   debugImportFiltering()
 * 
 * @author TikTrack Development Team
 * @version 1.0
 * @since 2025-01-16
 */

(function() {
    'use strict';

    /**
     * Debug import filtering - check what system intends to import
     * 
     * This function:
     * 1. Checks currentSessionId
     * 2. Fetches preview_data from the session
     * 3. Checks selectedCashflowTypes from frontend
     * 4. Compares what should be imported vs what is in records_to_import
     * 5. Shows detailed breakdown by type
     */
    window.debugImportFiltering = async function() {
        console.log('🔍 [DEBUG] Starting import filtering debug...\n');
        
        // Check currentSessionId
        const sessionId = window.currentSessionId || (window.importUserDataModal && window.importUserDataModal.currentSessionId);
        if (!sessionId) {
            console.error('❌ [DEBUG] No currentSessionId found!');
            console.log('   Try: window.currentSessionId or check import modal state');
            return;
        }
        console.log(`✅ [DEBUG] Found session ID: ${sessionId}\n`);
        
        // Check selectedCashflowTypes from frontend
        const selectedTypes = window.selectedCashflowTypes || {};
        const selectedTypesList = Object.keys(selectedTypes).filter(type => selectedTypes[type] === true);
        console.log('📋 [DEBUG] Frontend selectedCashflowTypes:');
        console.log('   Object:', selectedTypes);
        console.log('   Selected list:', selectedTypesList);
        console.log('   Count:', selectedTypesList.length);
        console.log('');
        
        // Fetch preview data from backend
        try {
            console.log('📡 [DEBUG] Fetching preview data from backend...');
            const response = await fetch(`/api/user-data-import/session/${sessionId}/preview`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (!data.success) {
                console.error('❌ [DEBUG] Failed to fetch preview:', data.error || 'Unknown error');
                return;
            }
            
            const previewData = data.preview_data || {};
            const recordsToImport = previewData.records_to_import || [];
            const recordsToSkip = previewData.records_to_skip || [];
            const selectedTypesInPreview = previewData.selected_types;
            
            console.log('✅ [DEBUG] Preview data fetched successfully\n');
            
            // Show selected_types in preview_data
            console.log('🔍 [DEBUG] selected_types in preview_data:');
            console.log('   Value:', selectedTypesInPreview);
            console.log('   Type:', typeof selectedTypesInPreview);
            console.log('   Is array?', Array.isArray(selectedTypesInPreview));
            console.log('');
            
            // Show records count
            console.log('📊 [DEBUG] Records summary:');
            console.log(`   records_to_import: ${recordsToImport.length}`);
            console.log(`   records_to_skip: ${recordsToSkip.length}`);
            console.log('');
            
            // Analyze records_to_import by type
            const typesInImport = {};
            recordsToImport.forEach((rec, idx) => {
                const cfType = rec.cashflow_type || rec.type || rec.record?.cashflow_type || rec.record?.type || 'NO_TYPE';
                if (!typesInImport[cfType]) {
                    typesInImport[cfType] = {
                        count: 0,
                        examples: []
                    };
                }
                typesInImport[cfType].count++;
                if (typesInImport[cfType].examples.length < 3) {
                    typesInImport[cfType].examples.push({
                        index: idx,
                        amount: rec.amount || rec.record?.amount,
                        currency: rec.currency || rec.record?.currency,
                        external_id: rec.external_id || rec.record?.external_id
                    });
                }
            });
            
            console.log('📋 [DEBUG] Types in records_to_import:');
            Object.keys(typesInImport).sort().forEach(type => {
                const info = typesInImport[type];
                console.log(`   ${type}: ${info.count} records`);
                if (info.examples.length > 0) {
                    console.log(`      Examples:`);
                    info.examples.forEach(ex => {
                        console.log(`        [${ex.index}] Amount: ${ex.amount} ${ex.currency || ''}, External ID: ${ex.external_id || 'N/A'}`);
                    });
                }
            });
            console.log('');
            
            // Check if filtering is correct
            if (selectedTypesList.length > 0) {
                console.log('🔍 [DEBUG] Filtering validation:');
                const unexpectedTypes = Object.keys(typesInImport).filter(type => {
                    return !selectedTypesList.some(selected => selected.toLowerCase() === type.toLowerCase());
                });
                
                if (unexpectedTypes.length > 0) {
                    console.warn('⚠️ [DEBUG] UNEXPECTED TYPES FOUND in records_to_import:');
                    unexpectedTypes.forEach(type => {
                        console.warn(`   ❌ ${type}: ${typesInImport[type].count} records (NOT in selected_types!)`);
                    });
                } else {
                    console.log('✅ [DEBUG] All types in records_to_import match selected_types');
                }
                
                const missingTypes = selectedTypesList.filter(selected => {
                    return !Object.keys(typesInImport).some(type => 
                        type.toLowerCase() === selected.toLowerCase()
                    );
                });
                
                if (missingTypes.length > 0) {
                    console.warn('⚠️ [DEBUG] SELECTED TYPES NOT FOUND in records_to_import:');
                    missingTypes.forEach(type => {
                        console.warn(`   ❌ ${type} (selected but not in records_to_import)`);
                    });
                } else {
                    console.log('✅ [DEBUG] All selected_types have records in records_to_import');
                }
                console.log('');
            } else {
                console.warn('⚠️ [DEBUG] No selected_types found - all records will be imported');
                console.log('');
            }
            
            // Compare frontend vs backend selected_types
            if (selectedTypesList.length > 0 && selectedTypesInPreview) {
                console.log('🔍 [DEBUG] Frontend vs Backend selected_types comparison:');
                const frontendLower = selectedTypesList.map(t => t.toLowerCase()).sort();
                const backendLower = Array.isArray(selectedTypesInPreview) 
                    ? selectedTypesInPreview.map(t => String(t).toLowerCase()).sort()
                    : [];
                
                console.log('   Frontend:', frontendLower);
                console.log('   Backend:', backendLower);
                
                if (JSON.stringify(frontendLower) === JSON.stringify(backendLower)) {
                    console.log('   ✅ Match!');
                } else {
                    console.warn('   ❌ MISMATCH!');
                    const onlyFrontend = frontendLower.filter(f => !backendLower.includes(f));
                    const onlyBackend = backendLower.filter(b => !frontendLower.includes(b));
                    if (onlyFrontend.length > 0) {
                        console.warn(`      Only in frontend: ${onlyFrontend.join(', ')}`);
                    }
                    if (onlyBackend.length > 0) {
                        console.warn(`      Only in backend: ${onlyBackend.join(', ')}`);
                    }
                }
                console.log('');
            }
            
            // Show sample records
            console.log('📝 [DEBUG] Sample records (first 5):');
            recordsToImport.slice(0, 5).forEach((rec, idx) => {
                const actualRec = rec.record || rec;
                const cfType = actualRec.cashflow_type || actualRec.type || 'NO_TYPE';
                console.log(`   [${idx + 1}] Type: ${cfType}, Amount: ${actualRec.amount}, Currency: ${actualRec.currency || 'N/A'}`);
            });
            console.log('');
            
            // Summary
            console.log('📊 [DEBUG] Summary:');
            console.log(`   Session ID: ${sessionId}`);
            console.log(`   Frontend selected: ${selectedTypesList.length} types`);
            console.log(`   Backend selected_types: ${selectedTypesInPreview ? (Array.isArray(selectedTypesInPreview) ? selectedTypesInPreview.length : 'N/A') : 'None'}`);
            console.log(`   Records to import: ${recordsToImport.length}`);
            console.log(`   Unique types in import: ${Object.keys(typesInImport).length}`);
            console.log('');
            
            return {
                sessionId,
                frontendSelected: selectedTypesList,
                backendSelected: selectedTypesInPreview,
                recordsToImport: recordsToImport.length,
                typesInImport: Object.keys(typesInImport),
                typesBreakdown: typesInImport
            };
            
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching preview data:', error);
            console.error('   Stack:', error.stack);
            return null;
        }
    };
    
    /**
     * Quick check - just show counts
     */
    window.quickImportCheck = async function() {
        const sessionId = window.currentSessionId;
        if (!sessionId) {
            console.error('❌ No session ID');
            return;
        }
        
        try {
            const response = await fetch(`/api/user-data-import/session/${sessionId}/preview`);
            const data = await response.json();
            const preview = data.preview_data || {};
            const selected = preview.selected_types;
            
            console.log('📊 Quick Check:');
            console.log(`   Session: ${sessionId}`);
            console.log(`   Selected types: ${selected ? (Array.isArray(selected) ? selected.join(', ') : selected) : 'None'}`);
            console.log(`   Records to import: ${preview.records_to_import?.length || 0}`);
            
            const types = {};
            (preview.records_to_import || []).forEach(r => {
                const t = r.cashflow_type || r.type || r.record?.cashflow_type || 'NO_TYPE';
                types[t] = (types[t] || 0) + 1;
            });
            console.log(`   Types breakdown:`, types);
        } catch (error) {
            console.error('❌ Error:', error);
        }
    };
    
    console.log('✅ [DEBUG] Import filtering debug functions loaded!');
    console.log('   Use: debugImportFiltering() - Full detailed check');
    console.log('   Use: quickImportCheck() - Quick summary');
    
})();

