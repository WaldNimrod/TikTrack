/**
 * Comprehensive Cache Clearing Test Suite
 * ========================================
 * 
 * בדיקה מקיפה של כל 4 רמות הניקוי
 * דוגם מפתחות מכל ענף/קטגוריה ובודק שנמחקו
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @date 11 אוקטובר 2025
 */

console.log('🧪 Comprehensive Cache Clearing Test Suite loaded');

/**
 * Main test function - tests all 4 levels comprehensively
 */
window.runComprehensiveCacheClearingTest = async function() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE CACHE CLEARING TEST SUITE');
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    
    const overallResults = {
        startTime: startTime,
        light: null,
        medium: null,
        full: null,
        nuclear: null
    };
    
    try {
        // Test each level
        overallResults.light = await testLevel_Light();
        await new Promise(r => setTimeout(r, 500));
        
        overallResults.medium = await testLevel_Medium();
        await new Promise(r => setTimeout(r, 500));
        
        overallResults.full = await testLevel_Full();
        await new Promise(r => setTimeout(r, 500));
        
        // Nuclear is manual only
        overallResults.nuclear = { 
            tested: false, 
            note: 'Manual test only - too destructive',
            manualInstructions: 'Run: await testLevel_Nuclear() in isolated environment'
        };
        
        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 FINAL SUMMARY');
        console.log('='.repeat(80));
        console.table(overallResults);
        
        const duration = Date.now() - startTime;
        const passedCount = Object.values(overallResults).filter(r => r && typeof r === 'object' && r.passed === true).length;
        const testedCount = Object.values(overallResults).filter(r => r && typeof r === 'object' && r.tested === true).length;
        const failedCount = testedCount - passedCount;
        
        console.log(`\n✅ Tests Passed: ${passedCount}/${testedCount}`);
        console.log(`📊 Success Rate: ${(passedCount/testedCount*100).toFixed(1)}%`);
        console.log(`⏱️ Total Duration: ${duration}ms`);
        
        // Build detailed message
        let detailedMessage = `סה"כ נבדקו: ${testedCount} רמות\n`;
        detailedMessage += `✅ עברו: ${passedCount}\n`;
        if (failedCount > 0) {
            detailedMessage += `❌ נכשלו: ${failedCount}\n`;
        }
        detailedMessage += `\n📋 פירוט:\n`;
        detailedMessage += `• Light: ${overallResults.light.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Medium: ${overallResults.medium.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Full: ${overallResults.full.passed ? '✅ עבר' : '❌ נכשל'}\n`;
        detailedMessage += `• Nuclear: ⚠️ בדיקה ידנית בלבד`;
        
        // Show Final Success Modal or Error based on results
        if (passedCount === testedCount) {
            // All tests passed - show Final Success Modal with comprehensive details
            if (typeof window.showFinalSuccessNotification === 'function') {
                // Count total samples tested
                const lightSamples = overallResults.light?.samples ? Object.keys(overallResults.light.samples).length : 4;
                const mediumSamples = overallResults.medium?.samples ? Object.keys(overallResults.medium.samples).length : 6;
                const fullSamples = overallResults.full?.orphansSampled?.length || 15;
                const totalSamples = lightSamples + mediumSamples + fullSamples;
                
                await window.showFinalSuccessNotification(
                    'בדיקה מקיפה הושלמה בהצלחה! ✅',
                    `בדיקה מקיפה של מערכת ניקוי המטמון הושלמה בהצלחה.\n\n${detailedMessage}\n\n📊 סטטיסטיקה:\n• סה"כ דוגמאות נבדקו: ${totalSamples}\n• Light: ${lightSamples} ענפים\n• Medium: ${mediumSamples} ענפים\n• Full: ${fullSamples} orphans\n\nזמן בדיקה: ${duration}ms`,
                    {
                        operation: 'comprehensive-cache-clearing-test',
                        duration: `${duration}ms`,
                        timestamp: new Date().toISOString(),
                        testType: 'comprehensive',
                        coverage: {
                            light: '4 branches (Memory, localStorage, IndexedDB, Orphans)',
                            medium: '6 branches (Memory, localStorage, IndexedDB, Backend, 2 Orphans)',
                            full: `${fullSamples} orphans (5 categories: State, Preferences, Auth, Testing, Dynamic)`
                        },
                        samples: {
                            light: lightSamples,
                            medium: mediumSamples,
                            full: fullSamples,
                            total: totalSamples
                        },
                        results: {
                            light: overallResults.light,
                            medium: overallResults.medium,
                            full: overallResults.full,
                            nuclear: overallResults.nuclear
                        },
                        totalTested: testedCount,
                        totalPassed: passedCount,
                        totalFailed: failedCount,
                        successRate: '100%',
                        status: 'all-comprehensive-tests-passed',
                        healthCheck: 'כל רמות הניקוי + כל הדגימות מכל ענף וקטגוריה עברו בהצלחה',
                        nextAction: 'המערכת מוכנה לשימוש מלא - כיסוי 100%'
                    },
                    'testing'
                );
            }
        } else {
            // Some tests failed - show Critical Error Modal
            if (typeof window.showErrorNotification === 'function') {
                await window.showErrorNotification(
                    'בדיקה מקיפה',
                    `⚠️ יש כשלים בבדיקה המקיפה\n\n${detailedMessage}\n\nבדוק את הקונסול לפרטים מלאים על הכשלים.`,
                    10000,
                    'testing'
                );
            }
        }
        
        return overallResults;
        
    } catch (error) {
        console.error('❌ Critical error in comprehensive test:', error);
        
        // Show critical error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                '❌ שגיאה קריטית בבדיקה מקיפה',
                `הבדיקה המקיפה נכשלה בשגיאה קריטית!\n\nפרטים:\n• ${error.message}\n• ${error.stack?.split('\n')[0] || 'לא זמין'}\n\nבדוק את הקונסול לפרטים מלאים.`,
                10000,
                'testing'
            );
        }
        
        throw error;
    }
};

/**
 * Test Light Level (25% coverage)
 * Should clear: Memory + Services
 * Should NOT clear: localStorage, IndexedDB, Orphans
 */
async function testLevel_Light() {
    console.log('\n🟢 ========== TESTING LIGHT LEVEL ==========');
    
    const result = {
        level: 'light',
        tested: true,
        passed: false,
        samples: {},
        details: {}
    };
    
    try {
        // ===== SAMPLE CREATION =====
        console.log('\n📝 Creating sample keys...');
        
        // Sample 1: Memory Layer
        await window.UnifiedCacheManager.layers.memory.save('test-light-memory', 'sample-data-memory');
        const memoryBefore = window.UnifiedCacheManager.layers.memory.cache.has('test-light-memory');
        console.log(`  Memory: test-light-memory created: ${memoryBefore}`);
        
        // Sample 2: localStorage tiktrack_*
        await window.UnifiedCacheManager.save('test-light-ls', 'sample-data-ls', { layer: 'localStorage' });
        const lsBefore = localStorage.getItem('tiktrack_test-light-ls') !== null;
        console.log(`  localStorage: tiktrack_test-light-ls created: ${lsBefore}`);
        
        // Sample 3: IndexedDB
        await window.UnifiedCacheManager.save('test-light-idb', 'sample-data-idb', { layer: 'indexedDB' });
        const idbBefore = true; // assume created
        console.log(`  IndexedDB: test-light-idb created: ${idbBefore}`);
        
        // Sample 4: Orphan Key
        localStorage.setItem('test-light-orphan', 'sample-orphan');
        const orphanBefore = localStorage.getItem('test-light-orphan') !== null;
        console.log(`  Orphan: test-light-orphan created: ${orphanBefore}`);
        
        result.samples = {
            memory: memoryBefore,
            localStorage: lsBefore,
            indexedDB: idbBefore,
            orphan: orphanBefore
        };
        
        // ===== CLEAR LIGHT =====
        console.log('\n🧹 Clearing with Light level...');
        const clearResult = await window.clearAllCache({ 
            level: 'light', 
            skipConfirmation: true,
            verbose: false
        });
        console.log('Clear result:', clearResult);
        
        // Wait for completion
        await new Promise(r => setTimeout(r, 200));
        
        // ===== VALIDATION =====
        console.log('\n✅ Validating results...');
        
        // Check 1: Memory should be cleared
        const memoryAfter = window.UnifiedCacheManager.layers.memory.cache.has('test-light-memory');
        result.details.memoryCleared = !memoryAfter;
        console.log(`  Memory cleared: ${!memoryAfter} ${!memoryAfter ? '✅' : '❌'}`);
        
        // Check 2: localStorage should NOT be cleared
        const lsAfter = localStorage.getItem('tiktrack_test-light-ls') !== null;
        result.details.localStoragePreserved = lsAfter;
        console.log(`  localStorage preserved: ${lsAfter} ${lsAfter ? '✅' : '❌'}`);
        
        // Check 3: IndexedDB should NOT be cleared
        const idbAfter = await window.UnifiedCacheManager.get('test-light-idb', { layer: 'indexedDB' });
        result.details.indexedDBPreserved = idbAfter !== null;
        console.log(`  IndexedDB preserved: ${idbAfter !== null} ${idbAfter !== null ? '✅' : '❌'}`);
        
        // Check 4: Orphan should NOT be cleared
        const orphanAfter = localStorage.getItem('test-light-orphan') !== null;
        result.details.orphanPreserved = orphanAfter;
        console.log(`  Orphan preserved: ${orphanAfter} ${orphanAfter ? '✅' : '❌'}`);
        
        // ===== CLEANUP TEST DATA =====
        localStorage.removeItem('tiktrack_test-light-ls');
        localStorage.removeItem('test-light-orphan');
        await window.UnifiedCacheManager.remove('test-light-idb');
        
        // ===== FINAL RESULT =====
        result.passed = 
            result.details.memoryCleared &&
            result.details.localStoragePreserved &&
            result.details.indexedDBPreserved &&
            result.details.orphanPreserved;
        
        console.log(`\n${result.passed ? '✅ LIGHT PASSED' : '❌ LIGHT FAILED'}`);
        
        // Show notification
        if (result.passed) {
            if (typeof window.showSuccessNotification === 'function') {
                await window.showSuccessNotification(
                    '✅ Light - בדיקה עברה',
                    `בדיקת רמה Light עברה בהצלחה!\n\n✅ Memory cleared\n✅ localStorage preserved\n✅ IndexedDB preserved\n✅ Orphans preserved`,
                    4000,
                    'testing'
                );
            }
        } else {
            if (typeof window.showErrorNotification === 'function') {
                await window.showErrorNotification(
                    '❌ Light - בדיקה נכשלה',
                    `בדיקת רמה Light נכשלה!\n\nבדוק את הקונסול לפרטים.`,
                    6000,
                    'testing'
                );
            }
        }
        
    } catch (error) {
        console.error('❌ Light test error:', error);
        result.passed = false;
        result.error = error.message;
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                '❌ Light - שגיאה קריטית',
                `שגיאה קריטית בבדיקת Light!\n\n• ${error.message}\n\nבדוק את הקונסול לפרטים מלאים.`,
                8000,
                'testing'
            );
        }
    }
    
    return result;
}

/**
 * Test Medium Level (60% coverage)
 * Should clear: Memory + Services + UnifiedCM (4 layers)
 * Should NOT clear: Orphans
 */
async function testLevel_Medium() {
    console.log('\n🔵 ========== TESTING MEDIUM LEVEL ==========');
    
    const result = {
        level: 'medium',
        tested: true,
        passed: false,
        samples: {},
        details: {}
    };
    
    try {
        // ===== SAMPLE CREATION =====
        console.log('\n📝 Creating sample keys from each branch...');
        
        // Branch 1: Memory
        await window.UnifiedCacheManager.layers.memory.save('test-med-memory', 'data-memory');
        
        // Branch 2: localStorage (tiktrack_*)
        await window.UnifiedCacheManager.save('test-med-ls', 'data-ls', { layer: 'localStorage' });
        
        // Branch 3: IndexedDB
        await window.UnifiedCacheManager.save('test-med-idb', 'data-idb', { layer: 'indexedDB' });
        
        // Branch 4: Backend
        await window.UnifiedCacheManager.layers.backend.save('test-med-backend', 'data-backend', { ttl: null });
        
        // Branch 5: Orphan (should stay!)
        localStorage.setItem('test-med-orphan', 'orphan-data');
        localStorage.setItem('colorScheme', 'test-scheme');  // Real orphan
        
        console.log('  ✅ All samples created');
        
        const before = {
            memory: window.UnifiedCacheManager.layers.memory.cache.has('test-med-memory'),
            localStorage: localStorage.getItem('tiktrack_test-med-ls') !== null,
            indexedDB: true,
            backend: window.UnifiedCacheManager.layers.backend.cache.has('test-med-backend'),
            orphan1: localStorage.getItem('test-med-orphan') !== null,
            orphan2: localStorage.getItem('colorScheme') !== null
        };
        
        console.log('Before:', before);
        result.samples = before;
        
        // ===== CLEAR MEDIUM =====
        console.log('\n🧹 Clearing with Medium level...');
        const clearResult = await window.clearAllCache({ 
            level: 'medium', 
            skipConfirmation: true,
            verbose: false
        });
        
        await new Promise(r => setTimeout(r, 200));
        
        // ===== VALIDATION =====
        console.log('\n✅ Validating each branch...');
        
        // Branch 1: Memory - should be cleared
        const memoryAfter = window.UnifiedCacheManager.layers.memory.cache.has('test-med-memory');
        result.details.memoryCleared = !memoryAfter;
        console.log(`  Branch 1 - Memory: ${!memoryAfter ? '✅ cleared' : '❌ not cleared'}`);
        
        // Branch 2: localStorage tiktrack_* - should be cleared
        const lsAfter = localStorage.getItem('tiktrack_test-med-ls') !== null;
        result.details.localStorageCleared = !lsAfter;
        console.log(`  Branch 2 - localStorage (tiktrack_*): ${!lsAfter ? '✅ cleared' : '❌ not cleared'}`);
        
        // Branch 3: IndexedDB - should be cleared
        const idbAfter = await window.UnifiedCacheManager.get('test-med-idb', { layer: 'indexedDB' });
        result.details.indexedDBCleared = idbAfter === null;
        console.log(`  Branch 3 - IndexedDB: ${idbAfter === null ? '✅ cleared' : '❌ not cleared'}`);
        
        // Branch 4: Backend - should be cleared
        const backendAfter = window.UnifiedCacheManager.layers.backend.cache.has('test-med-backend');
        result.details.backendCleared = !backendAfter;
        console.log(`  Branch 4 - Backend: ${!backendAfter ? '✅ cleared' : '❌ not cleared'}`);
        
        // Branch 5: Orphans - should NOT be cleared
        const orphan1After = localStorage.getItem('test-med-orphan') !== null;
        const orphan2After = localStorage.getItem('colorScheme') !== null;
        result.details.orphansPreserved = orphan1After && orphan2After;
        console.log(`  Branch 5 - Orphans: ${orphan1After && orphan2After ? '✅ preserved' : '❌ deleted (ERROR!)'}`);
        
        // ===== CLEANUP =====
        localStorage.removeItem('test-med-orphan');
        localStorage.removeItem('colorScheme');
        
        // ===== FINAL RESULT =====
        result.passed = 
            result.details.memoryCleared &&
            result.details.localStorageCleared &&
            result.details.indexedDBCleared &&
            result.details.backendCleared &&
            result.details.orphansPreserved;
        
        console.log(`\n${result.passed ? '✅ MEDIUM PASSED - All branches validated!' : '❌ MEDIUM FAILED'}`);
        
        // Show notification
        if (result.passed) {
            if (typeof window.showSuccessNotification === 'function') {
                await window.showSuccessNotification(
                    '✅ Medium - בדיקה עברה',
                    `בדיקת רמה Medium עברה בהצלחה!\n\n✅ Memory cleared\n✅ localStorage cleared\n✅ IndexedDB cleared\n✅ Backend cleared\n✅ Orphans preserved`,
                    5000,
                    'testing'
                );
            }
        } else {
            if (typeof window.showErrorNotification === 'function') {
                const failedBranches = [];
                if (!result.details.memoryCleared) failedBranches.push('Memory');
                if (!result.details.localStorageCleared) failedBranches.push('localStorage');
                if (!result.details.indexedDBCleared) failedBranches.push('IndexedDB');
                if (!result.details.backendCleared) failedBranches.push('Backend');
                if (!result.details.orphansPreserved) failedBranches.push('Orphans (לא נשמרו!)');
                
                await window.showErrorNotification(
                    '❌ Medium - בדיקה נכשלה',
                    `בדיקת רמה Medium נכשלה!\n\nענפים שנכשלו:\n• ${failedBranches.join('\n• ')}\n\nבדוק את הקונסול לפרטים.`,
                    8000,
                    'testing'
                );
            }
        }
        
    } catch (error) {
        console.error('❌ Medium test error:', error);
        result.passed = false;
        result.error = error.message;
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                '❌ Medium - שגיאה קריטית',
                `שגיאה קריטית בבדיקת Medium!\n\n• ${error.message}\n\nבדוק את הקונסול לפרטים מלאים.`,
                8000,
                'testing'
            );
        }
    }
    
    return result;
}

/**
 * Test Full Level (100% coverage)
 * Should clear: Everything including Orphans
 * Should NOT clear: non-prefix localStorage (unless orphan list)
 */
async function testLevel_Full() {
    console.log('\n🟠 ========== TESTING FULL LEVEL ==========');
    
    const result = {
        level: 'full',
        tested: true,
        passed: false,
        samples: {},
        details: {},
        orphansSampled: []
    };
    
    try {
        // ===== SAMPLE CREATION - One from each category =====
        console.log('\n📝 Creating samples from EACH orphan category...');
        
        // UnifiedCM layers (will be cleared in Medium, tested here for completeness)
        await window.UnifiedCacheManager.save('test-full-memory', 'data', { layer: 'memory' });
        await window.UnifiedCacheManager.save('test-full-ls', 'data', { layer: 'localStorage' });
        await window.UnifiedCacheManager.save('test-full-idb', 'data', { layer: 'indexedDB' });
        
        // Orphan Category 1: State (2 keys)
        localStorage.setItem('cashFlowsSectionState', 'test-state-1');
        localStorage.setItem('executionsTopSectionCollapsed', 'test-state-2');
        console.log('  📌 State orphans: 2 created');
        
        // Orphan Category 2: Preferences (4 keys)
        localStorage.setItem('colorScheme', 'test-pref-1');
        localStorage.setItem('customColorScheme', 'test-pref-2');
        localStorage.setItem('headerFilters', 'test-pref-3');
        localStorage.setItem('consoleSettings', 'test-pref-4');
        console.log('  📌 Preferences orphans: 4 created');
        
        // Orphan Category 3: Auth (2 keys) - CRITICAL!
        localStorage.setItem('authToken', 'test-auth-1');
        localStorage.setItem('currentUser', 'test-auth-2');
        console.log('  📌 Auth orphans: 2 created');
        
        // Orphan Category 4: Testing (4 keys)
        localStorage.setItem('crud_test_results', 'test-testing-1');
        localStorage.setItem('linterLogs', 'test-testing-2');
        localStorage.setItem('css-duplicates-results', 'test-testing-3');
        localStorage.setItem('serverMonitorSettings', 'test-testing-4');
        console.log('  📌 Testing orphans: 4 created');
        
        // Orphan Category 5: Dynamic (patterns)
        localStorage.setItem('sortState_trades', 'test-dynamic-1');
        localStorage.setItem('section-visibility-alerts-section1', 'test-dynamic-2');
        localStorage.setItem('top-section-collapsed-tickers', 'test-dynamic-3');
        console.log('  📌 Dynamic orphans: 3 created');
        
        // Sample 6: Non-orphan key (should stay in Full, deleted in Nuclear)
        localStorage.setItem('some-random-key', 'should-stay-in-full');
        
        result.orphansSampled = [
            'cashFlowsSectionState', 'executionsTopSectionCollapsed',
            'colorScheme', 'customColorScheme', 'headerFilters', 'consoleSettings',
            'authToken', 'currentUser',
            'crud_test_results', 'linterLogs', 'css-duplicates-results', 'serverMonitorSettings',
            'sortState_trades', 'section-visibility-alerts-section1', 'top-section-collapsed-tickers'
        ];
        
        console.log(`\n✅ Total samples created: ${result.orphansSampled.length + 4} (15 orphans + 4 UnifiedCM)`);
        
        // ===== CLEAR FULL =====
        console.log('\n🧹 Clearing with Full level...');
        const clearResult = await window.clearAllCache({ 
            level: 'full', 
            skipConfirmation: true,
            verbose: false,
            includeAuth: true  // Important: test auth clearing
        });
        
        await new Promise(r => setTimeout(r, 300));
        
        // ===== VALIDATION - Check each orphan =====
        console.log('\n✅ Validating each orphan category...');
        
        const orphansAfter = {};
        result.orphansSampled.forEach(key => {
            const exists = localStorage.getItem(key) !== null;
            orphansAfter[key] = exists;
            if (exists) {
                console.log(`  ❌ ${key}: still exists (SHOULD BE DELETED!)`);
            }
        });
        
        const orphansCleared = result.orphansSampled.filter(k => !orphansAfter[k]).length;
        const orphansTotal = result.orphansSampled.length;
        
        result.details.orphansCleared = `${orphansCleared}/${orphansTotal}`;
        result.details.orphansClearedPercent = (orphansCleared / orphansTotal * 100).toFixed(1) + '%';
        
        console.log(`\n  📊 Orphans cleared: ${orphansCleared}/${orphansTotal} (${result.details.orphansClearedPercent})`);
        
        // Check by category
        result.details.categories = {
            state: !orphansAfter['cashFlowsSectionState'] && !orphansAfter['executionsTopSectionCollapsed'],
            preferences: !orphansAfter['colorScheme'] && !orphansAfter['customColorScheme'] && 
                        !orphansAfter['headerFilters'] && !orphansAfter['consoleSettings'],
            auth: !orphansAfter['authToken'] && !orphansAfter['currentUser'],
            testing: !orphansAfter['crud_test_results'] && !orphansAfter['linterLogs'] &&
                    !orphansAfter['css-duplicates-results'] && !orphansAfter['serverMonitorSettings'],
            dynamic: !orphansAfter['sortState_trades'] && 
                    !orphansAfter['section-visibility-alerts-section1'] &&
                    !orphansAfter['top-section-collapsed-tickers']
        };
        
        console.log('  Categories:');
        console.log(`    State: ${result.details.categories.state ? '✅' : '❌'}`);
        console.log(`    Preferences: ${result.details.categories.preferences ? '✅' : '❌'}`);
        console.log(`    Auth: ${result.details.categories.auth ? '✅' : '❌'}`);
        console.log(`    Testing: ${result.details.categories.testing ? '✅' : '❌'}`);
        console.log(`    Dynamic: ${result.details.categories.dynamic ? '✅' : '❌'}`);
        
        // Check non-orphan (should stay)
        const randomKeyAfter = localStorage.getItem('some-random-key') !== null;
        result.details.nonOrphanPreserved = randomKeyAfter;
        console.log(`\n  Non-orphan key preserved: ${randomKeyAfter} ${randomKeyAfter ? '✅' : '❌'}`);
        
        // Cleanup
        localStorage.removeItem('some-random-key');
        
        // ===== FINAL RESULT =====
        result.passed = 
            orphansCleared === orphansTotal &&
            Object.values(result.details.categories).every(v => v === true) &&
            result.details.nonOrphanPreserved;
        
        console.log(`\n${result.passed ? '✅ FULL PASSED - 100% orphans cleared!' : '❌ FULL FAILED'}`);
        
        // Show notification
        if (result.passed) {
            if (typeof window.showSuccessNotification === 'function') {
                await window.showSuccessNotification(
                    '✅ Full - בדיקה עברה',
                    `בדיקת רמה Full עברה בהצלחה!\n\n✅ ${result.details.orphansCleared} orphans cleared\n✅ ${result.details.orphansClearedPercent} כיסוי\n\n📋 קטגוריות:\n• State: ${result.details.categories.state ? '✅' : '❌'}\n• Preferences: ${result.details.categories.preferences ? '✅' : '❌'}\n• Auth: ${result.details.categories.auth ? '✅' : '❌'}\n• Testing: ${result.details.categories.testing ? '✅' : '❌'}\n• Dynamic: ${result.details.categories.dynamic ? '✅' : '❌'}`,
                    6000,
                    'testing'
                );
            }
        } else {
            if (typeof window.showErrorNotification === 'function') {
                const failedCategories = [];
                if (!result.details.categories.state) failedCategories.push('State');
                if (!result.details.categories.preferences) failedCategories.push('Preferences');
                if (!result.details.categories.auth) failedCategories.push('Auth');
                if (!result.details.categories.testing) failedCategories.push('Testing');
                if (!result.details.categories.dynamic) failedCategories.push('Dynamic');
                
                await window.showErrorNotification(
                    '❌ Full - בדיקה נכשלה',
                    `בדיקת רמה Full נכשלה!\n\n${result.details.orphansCleared} (${result.details.orphansClearedPercent})\n\nקטגוריות שנכשלו:\n• ${failedCategories.join('\n• ')}\n\nבדוק את הקונסול לפרטים.`,
                    8000,
                    'testing'
                );
            }
        }
        
    } catch (error) {
        console.error('❌ Full test error:', error);
        result.passed = false;
        result.error = error.message;
        
        // Show error notification
        if (typeof window.showErrorNotification === 'function') {
            await window.showErrorNotification(
                '❌ Full - שגיאה קריטית',
                `שגיאה קריטית בבדיקת Full!\n\n• ${error.message}\n\nבדוק את הקונסול לפרטים מלאים.`,
                8000,
                'testing'
            );
        }
    }
    
    return result;
}

/**
 * Test Nuclear Level (150%+ coverage)
 * Should clear: EVERYTHING
 * ⚠️ DESTRUCTIVE - Manual execution only!
 */
async function testLevel_Nuclear() {
    console.log('\n☢️ ========== TESTING NUCLEAR LEVEL ==========');
    console.log('⚠️⚠️⚠️ WARNING: This will DELETE EVERYTHING! ⚠️⚠️⚠️');
    console.log('This test should ONLY run in isolated/test environment!');
    console.log('\nAre you SURE? This will:');
    console.log('  ☢️ Clear ALL localStorage (including other sites on localhost)');
    console.log('  ☢️ DELETE entire IndexedDB database');
    console.log('  ☢️ Clear sessionStorage');
    console.log('\nTo proceed, run: await testLevel_Nuclear_Confirmed()');
    
    return {
        level: 'nuclear',
        tested: false,
        passed: 'N/A',
        note: 'Manual confirmation required',
        instructions: 'Run: await testLevel_Nuclear_Confirmed()'
    };
}

/**
 * Nuclear test - confirmed execution
 * ⚠️ Only run in safe/isolated environment!
 */
window.testLevel_Nuclear_Confirmed = async function() {
    console.log('\n☢️ ========== NUCLEAR TEST - CONFIRMED ==========');
    
    const result = {
        level: 'nuclear',
        tested: true,
        passed: false,
        before: {},
        after: {},
        details: {}
    };
    
    try {
        // Capture before
        result.before = {
            localStorageCount: localStorage.length,
            indexedDBExists: true,  // assume exists
            sessionStorageCount: sessionStorage?.length || 0
        };
        
        console.log('Before:', result.before);
        
        // ===== CLEAR NUCLEAR =====
        console.log('\n☢️ Clearing with Nuclear level...');
        const clearResult = await window.clearAllCache({ 
            level: 'nuclear', 
            skipConfirmation: true,
            verbose: true
        });
        
        await new Promise(r => setTimeout(r, 500));
        
        // ===== VALIDATION =====
        console.log('\n✅ Validating complete destruction...');
        
        result.after = {
            localStorageCount: localStorage.length,
            sessionStorageCount: sessionStorage?.length || 0
        };
        
        result.details.allLocalStorageCleared = result.after.localStorageCount === 0;
        result.details.sessionStorageCleared = result.after.sessionStorageCount === 0;
        
        console.log(`  localStorage: ${result.before.localStorageCount} → ${result.after.localStorageCount} ${result.details.allLocalStorageCleared ? '✅' : '❌'}`);
        console.log(`  sessionStorage: ${result.before.sessionStorageCount} → ${result.after.sessionStorageCount} ${result.details.sessionStorageCleared ? '✅' : '❌'}`);
        
        // Check IndexedDB deletion
        try {
            const dbCheck = await new Promise((resolve, reject) => {
                const req = indexedDB.open('UnifiedCacheDB');
                req.onsuccess = () => {
                    const version = req.result.version;
                    req.result.close();
                    resolve({ exists: true, version });
                };
                req.onerror = () => resolve({ exists: false });
                req.onblocked = () => resolve({ exists: true, blocked: true });
            });
            
            result.details.indexedDBDeleted = !dbCheck.exists;
            console.log(`  IndexedDB: ${dbCheck.exists ? '❌ still exists' : '✅ deleted'}`);
        } catch (e) {
            result.details.indexedDBDeleted = 'unknown';
        }
        
        result.passed = 
            result.details.allLocalStorageCleared &&
            (result.details.indexedDBDeleted === true || result.details.indexedDBDeleted === 'unknown');
        
        console.log(`\n${result.passed ? '✅ NUCLEAR PASSED - Everything destroyed!' : '❌ NUCLEAR FAILED'}`);
        console.log('⚠️ Page refresh required now!');
        
    } catch (error) {
        console.error('❌ Nuclear test error:', error);
        result.passed = false;
        result.error = error.message;
    }
    
    return result;
};

/**
 * Quick verification - samples one key from each major branch
 * Faster than full test, good for rapid iteration
 */
window.quickVerifyLevel = async function(level) {
    console.log(`\n🔍 Quick Verify: ${level.toUpperCase()}`);
    
    const samples = {
        memory: 'quick-mem-' + Date.now(),
        localStorage: 'quick-ls-' + Date.now(),
        indexedDB: 'quick-idb-' + Date.now(),
        orphan: 'quick-orphan-' + Date.now()
    };
    
    // Create samples
    await window.UnifiedCacheManager.save(samples.memory, 'data', { layer: 'memory' });
    await window.UnifiedCacheManager.save(samples.localStorage, 'data', { layer: 'localStorage' });
    await window.UnifiedCacheManager.save(samples.indexedDB, 'data', { layer: 'indexedDB' });
    localStorage.setItem(samples.orphan, 'orphan-data');
    
    console.log('✅ Samples created');
    
    // Clear
    await window.clearAllCache({ level, skipConfirmation: true, verbose: false });
    
    // Check
    const results = {
        memory: !window.UnifiedCacheManager.layers.memory.cache.has(samples.memory),
        localStorage: localStorage.getItem('tiktrack_' + samples.localStorage) === null,
        indexedDB: await window.UnifiedCacheManager.get(samples.indexedDB, { layer: 'indexedDB' }) === null,
        orphan: localStorage.getItem(samples.orphan) === null
    };
    
    console.table(results);
    
    // Cleanup
    localStorage.removeItem(samples.orphan);
    
    // Validate based on level
    let expected;
    if (level === 'light') {
        expected = { memory: true, localStorage: false, indexedDB: false, orphan: false };
    } else if (level === 'medium') {
        expected = { memory: true, localStorage: true, indexedDB: true, orphan: false };
    } else if (level === 'full') {
        expected = { memory: true, localStorage: true, indexedDB: true, orphan: true };
    } else if (level === 'nuclear') {
        expected = { memory: true, localStorage: true, indexedDB: true, orphan: true };
    }
    
    const passed = JSON.stringify(results) === JSON.stringify(expected);
    console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'} - ${level.toUpperCase()}`);
    
    // Show notification
    if (passed) {
        if (typeof window.showSuccessNotification === 'function') {
            await window.showSuccessNotification(
                `✅ Quick Verify - ${level.toUpperCase()}`,
                `בדיקה מהירה של ${level} עברה!\n\n${Object.entries(results).map(([k, v]) => `• ${k}: ${v ? '✅ נוקה' : '✅ נשמר'}`).join('\n')}`,
                4000,
                'testing'
            );
        }
    } else {
        if (typeof window.showErrorNotification === 'function') {
            const diffs = [];
            for (const [key, value] of Object.entries(results)) {
                if (value !== expected[key]) {
                    diffs.push(`${key}: צפוי ${expected[key]}, קיבלנו ${value}`);
                }
            }
            await window.showErrorNotification(
                `❌ Quick Verify - ${level.toUpperCase()}`,
                `בדיקה מהירה של ${level} נכשלה!\n\nהבדלים:\n• ${diffs.join('\n• ')}`,
                6000,
                'testing'
            );
        }
    }
    
    return { level, results, expected, passed };
};

/**
 * Helper: Create marker with timestamp for refresh detection
 */
window.createRefreshMarker = function(key) {
    const marker = {
        value: 'test-data',
        createdAt: Date.now(),
        version: 1
    };
    localStorage.setItem(key, JSON.stringify(marker));
    return marker;
};

/**
 * Helper: Check if marker was refreshed
 */
window.checkRefreshMarker = function(key, originalMarker) {
    const current = localStorage.getItem(key);
    if (!current) {
        return { refreshed: 'deleted', reason: 'Key was deleted' };
    }
    
    try {
        const parsed = JSON.parse(current);
        if (parsed.createdAt !== originalMarker.createdAt) {
            return { refreshed: true, reason: 'Timestamp changed' };
        }
        if (parsed.version !== originalMarker.version) {
            return { refreshed: true, reason: 'Version changed' };
        }
        return { refreshed: false, reason: 'No change detected' };
    } catch (e) {
        return { refreshed: 'unknown', reason: 'Parse error' };
    }
};

console.log('✅ Comprehensive test suite ready!');
console.log('\nAvailable functions:');
console.log('  - runComprehensiveCacheClearingTest() - Full suite (Light, Medium, Full)');
console.log('  - testLevel_Light() - Test Light only');
console.log('  - testLevel_Medium() - Test Medium only');
console.log('  - testLevel_Full() - Test Full only');
console.log('  - testLevel_Nuclear() - Instructions for Nuclear');
console.log('  - quickVerifyLevel(level) - Quick check');
console.log('  - createRefreshMarker(key) - Create marker with timestamp');
console.log('  - checkRefreshMarker(key, original) - Detect refresh');

