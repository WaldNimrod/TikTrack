/**
 * Tooltip Debugging Script - להעתיק לקונסול
 * 
 * העתק את כל הקוד הזה לקונסול הדפדפן (F12 > Console) והקש Enter
 * הקוד יבצע בדיקות מקיפות של מערכת הטולטיפים
 */

(function() {
    console.log('🔍 ===== TOOLTIP DEBUG START =====');
    console.log('');
    
    // 0. בדיקת אזהרות ובעיות בטעינה
    console.log('0️⃣ Checking for warnings/errors during page load...');
    console.log('   Note: Check the console output above for any warnings that appeared during page load');
    console.log('   Common issues to look for:');
    console.log('   - Bootstrap loading errors');
    console.log('   - Script loading order issues');
    console.log('   - Missing dependencies');
    console.log('   - Tooltip initialization errors');
    console.log('');
    
    // בדיקת שגיאות בקונסול (אם יש דרך לגשת אליהן)
    if (window.console && window.console.error) {
        console.log('   Checking console for recent errors...');
        // ניסיון לזהות שגיאות נפוצות
        const scriptsOnPage = Array.from(document.querySelectorAll('script[src]'));
        const bootstrapScript = scriptsOnPage.find(s => s.src.includes('bootstrap'));
        if (!bootstrapScript) {
            console.warn('   ⚠️ Bootstrap script tag not found in page!');
        } else {
            console.log('   ✅ Bootstrap script found:', bootstrapScript.src);
            // בדיקה אם הסקריפט נטען
            if (bootstrapScript.complete || bootstrapScript.readyState === 'complete') {
                console.log('   ✅ Bootstrap script appears to be loaded');
            } else {
                console.warn('   ⚠️ Bootstrap script may not be fully loaded yet');
            }
        }
    }
    console.log('');
    
    // 1. בדיקת Bootstrap
    console.log('1️⃣ Checking Bootstrap availability...');
    const bootstrapAvailable = typeof bootstrap !== 'undefined';
    const tooltipAvailable = bootstrapAvailable && typeof bootstrap.Tooltip !== 'undefined';
    console.log('   Bootstrap available:', bootstrapAvailable);
    console.log('   Bootstrap.Tooltip available:', tooltipAvailable);
    if (!bootstrapAvailable) {
        console.error('   ❌ Bootstrap is NOT loaded!');
    } else if (!tooltipAvailable) {
        console.error('   ❌ Bootstrap.Tooltip is NOT available!');
    } else {
        console.log('   ✅ Bootstrap.Tooltip is available');
    }
    console.log('');
    
    // 2. בדיקת מערכת הכפתורים
    console.log('2️⃣ Checking Button System...');
    const buttonSystemAvailable = typeof window.advancedButtonSystem !== 'undefined';
    const initializeTooltipsAvailable = buttonSystemAvailable && 
        typeof window.advancedButtonSystem.initializeTooltips === 'function';
    console.log('   window.advancedButtonSystem available:', buttonSystemAvailable);
    console.log('   initializeTooltips available:', initializeTooltipsAvailable);
    if (buttonSystemAvailable && initializeTooltipsAvailable) {
        console.log('   ✅ Button system is ready');
    } else {
        console.warn('   ⚠️ Button system not fully available');
    }
    console.log('');
    
    // 3. חיפוש כפתורים עם data-tooltip בעמוד התראות
    console.log('3️⃣ Searching for buttons with data-tooltip on alerts page...');
    const allButtons = document.querySelectorAll('button');
    const buttonsWithTooltip = document.querySelectorAll('[data-tooltip]');
    console.log('   Total buttons on page:', allButtons.length);
    console.log('   Buttons with data-tooltip:', buttonsWithTooltip.length);
    
    if (buttonsWithTooltip.length === 0) {
        console.warn('   ⚠️ No buttons with data-tooltip found!');
        console.log('   Searching in filter buttons container...');
        const filterContainers = document.querySelectorAll('[id*="linkedItemsFilter"], [id*="filter"], .filter-buttons-container');
        console.log('   Filter containers found:', filterContainers.length);
        filterContainers.forEach((container, index) => {
            console.log(`   Container ${index + 1}:`, {
                id: container.id,
                className: container.className,
                buttons: container.querySelectorAll('button').length,
                buttonsWithTooltip: container.querySelectorAll('[data-tooltip]').length
            });
        });
    } else {
        console.log('   ✅ Found buttons with data-tooltip:');
        buttonsWithTooltip.forEach((btn, index) => {
            const tooltipText = btn.getAttribute('data-tooltip');
            const placement = btn.getAttribute('data-tooltip-placement') || 'default';
            const trigger = btn.getAttribute('data-tooltip-trigger') || 'default';
            console.log(`   Button ${index + 1}:`, {
                id: btn.id || 'no-id',
                text: btn.textContent.trim().substring(0, 30),
                tooltipText: tooltipText,
                placement: placement,
                trigger: trigger,
                hasDataBsToggle: btn.hasAttribute('data-bs-toggle'),
                element: btn
            });
        });
    }
    console.log('');
    
    // 4. בדיקת tooltip instances קיימים
    console.log('4️⃣ Checking existing tooltip instances...');
    if (tooltipAvailable) {
        let tooltipCount = 0;
        buttonsWithTooltip.forEach(btn => {
            const instance = bootstrap.Tooltip.getInstance(btn);
            if (instance) {
                tooltipCount++;
                console.log(`   ✅ Tooltip instance found for button:`, {
                    id: btn.id || 'no-id',
                    text: btn.textContent.trim().substring(0, 30),
                    enabled: instance._isEnabled,
                    config: instance._config
                });
            }
        });
        if (tooltipCount === 0) {
            console.warn('   ⚠️ No tooltip instances found for buttons with data-tooltip');
        } else {
            console.log(`   ✅ Found ${tooltipCount} tooltip instance(s)`);
        }
    } else {
        console.warn('   ⚠️ Cannot check tooltip instances - Bootstrap.Tooltip not available');
    }
    console.log('');
    
    // 5. נסיון לאתחל טולטיפים ידנית
    console.log('5️⃣ Attempting manual tooltip initialization...');
    if (tooltipAvailable && buttonsWithTooltip.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        
        buttonsWithTooltip.forEach((btn, index) => {
            try {
                // Dispose existing tooltip if exists
                const existing = bootstrap.Tooltip.getInstance(btn);
                if (existing) {
                    existing.dispose();
                }
                
                // Get tooltip configuration
                const tooltipText = btn.getAttribute('data-tooltip');
                const placement = btn.getAttribute('data-tooltip-placement') || 'top';
                const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
                
                if (!tooltipText) {
                    console.warn(`   ⚠️ Button ${index + 1} has data-tooltip attribute but no value`);
                    return;
                }
                
                // Create new tooltip
                const tooltipInstance = new bootstrap.Tooltip(btn, {
                    title: tooltipText,
                    placement: placement,
                    trigger: trigger
                });
                
                successCount++;
                console.log(`   ✅ Initialized tooltip for button ${index + 1}:`, {
                    id: btn.id || 'no-id',
                    text: btn.textContent.trim().substring(0, 30),
                    tooltipText: tooltipText
                });
            } catch (error) {
                errorCount++;
                console.error(`   ❌ Error initializing tooltip for button ${index + 1}:`, error);
            }
        });
        
        console.log('');
        console.log(`   Summary: ${successCount} successful, ${errorCount} errors`);
        
        if (successCount > 0) {
            console.log('');
            console.log('   🎉 Tooltips initialized! Try hovering over the buttons now.');
        }
    } else {
        if (!tooltipAvailable) {
            console.error('   ❌ Cannot initialize - Bootstrap.Tooltip not available');
        }
        if (buttonsWithTooltip.length === 0) {
            console.warn('   ⚠️ Cannot initialize - No buttons with data-tooltip found');
        }
    }
    console.log('');
    
    // 6. בדיקת כפתורי פילטר ספציפיים (אם יש)
    console.log('6️⃣ Checking filter buttons specifically...');
    const filterButtons = document.querySelectorAll('.filter-icon-btn, [class*="filter"], [id*="Filter"]');
    console.log('   Filter buttons found:', filterButtons.length);
    filterButtons.forEach((btn, index) => {
        const hasTooltip = btn.hasAttribute('data-tooltip');
        const tooltipText = btn.getAttribute('data-tooltip');
        console.log(`   Filter button ${index + 1}:`, {
            id: btn.id || 'no-id',
            className: btn.className,
            hasDataTooltip: hasTooltip,
            tooltipText: tooltipText,
            hasDataBsToggle: btn.hasAttribute('data-bs-toggle'),
            innerHTML: btn.innerHTML.substring(0, 50)
        });
    });
    console.log('');
    
    // 7. בדיקת Entity Details Renderer
    console.log('7️⃣ Checking Entity Details Renderer...');
    const rendererAvailable = typeof window.entityDetailsRenderer !== 'undefined';
    const initMethodAvailable = rendererAvailable && 
        typeof window.entityDetailsRenderer._initializeFilterTooltips === 'function';
    console.log('   window.entityDetailsRenderer available:', rendererAvailable);
    console.log('   _initializeFilterTooltips available:', initMethodAvailable);
    console.log('');
    
    // 8. בדיקת סדר טעינת הסקריפטים
    console.log('8️⃣ Checking script loading order...');
    const allScripts = Array.from(document.querySelectorAll('script[src]'));
    const bootstrapIndex = allScripts.findIndex(s => s.src.includes('bootstrap'));
    const buttonSystemIndex = allScripts.findIndex(s => s.src.includes('button-system-init'));
    const entityRendererIndex = allScripts.findIndex(s => s.src.includes('entity-details-renderer'));
    
    console.log('   Bootstrap script index:', bootstrapIndex !== -1 ? bootstrapIndex : 'NOT FOUND');
    console.log('   Button System script index:', buttonSystemIndex !== -1 ? buttonSystemIndex : 'NOT FOUND');
    console.log('   Entity Renderer script index:', entityRendererIndex !== -1 ? entityRendererIndex : 'NOT FOUND');
    
    if (bootstrapIndex !== -1 && buttonSystemIndex !== -1) {
        if (bootstrapIndex < buttonSystemIndex) {
            console.log('   ✅ Bootstrap loads before Button System (correct order)');
        } else {
            console.warn('   ⚠️ Button System loads before Bootstrap (may cause issues)');
        }
    }
    
    if (buttonSystemIndex !== -1 && entityRendererIndex !== -1) {
        if (buttonSystemIndex < entityRendererIndex) {
            console.log('   ✅ Button System loads before Entity Renderer (correct order)');
        } else {
            console.warn('   ⚠️ Entity Renderer loads before Button System (may cause issues)');
        }
    }
    console.log('');
    
    // 9. בדיקת console warnings על מערכות קריטיות
    console.log('9️⃣ Checking for system initialization warnings...');
    const criticalSystems = {
        'Unified Cache Manager': typeof window.unifiedCacheManager !== 'undefined',
        'Logger Service': typeof window.Logger !== 'undefined',
        'Modal Manager V2': typeof window.ModalManagerV2 !== 'undefined',
        'Linked Items Service': typeof window.LinkedItemsService !== 'undefined'
    };
    
    Object.entries(criticalSystems).forEach(([name, available]) => {
        if (available) {
            console.log(`   ✅ ${name} is available`);
        } else {
            console.warn(`   ⚠️ ${name} is NOT available`);
        }
    });
    console.log('');
    
    // בדיקה ספציפית ל-Unified Cache Manager warning
    if (!criticalSystems['Unified Cache Manager']) {
        console.warn('   ⚠️ Unified Cache Manager warning detected - this may affect tooltip initialization timing');
    }
    console.log('');
    
    // 10. בדיקת DOM readiness וזמן טעינה
    console.log('🔟 Checking DOM and timing...');
    console.log('   Document ready state:', document.readyState);
    console.log('   Page load time:', performance.timing ? 
        (performance.timing.loadEventEnd - performance.timing.navigationStart) + 'ms' : 'N/A');
    
    // בדיקה אם יש elements שטרם נטענו
    const modals = document.querySelectorAll('.modal');
    const filterContainers = document.querySelectorAll('[id*="linkedItemsFilter"], [id*="filter"]');
    console.log('   Modals found:', modals.length);
    console.log('   Filter containers found:', filterContainers.length);
    
    if (filterContainers.length === 0 && document.readyState === 'complete') {
        console.warn('   ⚠️ No filter containers found - filter buttons may not be rendered yet');
        console.log('   This could mean:');
        console.log('   - Filter buttons are only rendered when modal opens');
        console.log('   - Filter buttons are dynamically created');
        console.log('   - Page is still loading');
    }
    console.log('');
    
    // 11. סיכום והמלצות
    console.log('📋 ===== SUMMARY =====');
    console.log('');
    
    const issues = [];
    if (!bootstrapAvailable) {
        issues.push('❌ Bootstrap is not loaded');
    }
    if (!tooltipAvailable) {
        issues.push('❌ Bootstrap.Tooltip is not available');
    }
    if (buttonsWithTooltip.length === 0) {
        issues.push('⚠️ No buttons with data-tooltip found on page');
    }
    if (!buttonSystemAvailable) {
        issues.push('⚠️ Button system not available');
    }
    if (bootstrapIndex !== -1 && buttonSystemIndex !== -1 && bootstrapIndex > buttonSystemIndex) {
        issues.push('⚠️ Script loading order issue: Button System loads before Bootstrap');
    }
    if (!criticalSystems['Unified Cache Manager']) {
        issues.push('⚠️ Unified Cache Manager not initialized (may affect timing)');
    }
    if (filterContainers.length === 0 && document.readyState === 'complete') {
        issues.push('⚠️ Filter containers not found (buttons may be in modal)');
    }
    
    if (issues.length === 0) {
        console.log('✅ All checks passed!');
        console.log('');
        console.log('If tooltips still don\'t work, try:');
        console.log('1. Hover over a button with data-tooltip');
        console.log('2. Check browser console for errors');
        console.log('3. Try manually initializing (code already ran above)');
    } else {
        console.log('Issues found:');
        issues.forEach(issue => console.log('  ' + issue));
        console.log('');
        console.log('Recommendations:');
        if (!bootstrapAvailable) {
            console.log('  - Make sure Bootstrap JS is loaded before other scripts');
            console.log('  - Check HTML: <script src="...bootstrap.bundle.min.js"></script>');
        }
        if (buttonsWithTooltip.length === 0) {
            console.log('  - Check if you\'re on the correct page (alerts page)');
            console.log('  - Filter buttons may be in a modal - try opening a modal first');
            console.log('  - Check if filter buttons are dynamically created');
        }
        if (bootstrapIndex !== -1 && buttonSystemIndex !== -1 && bootstrapIndex > buttonSystemIndex) {
            console.log('  - Fix script loading order: Bootstrap must load before Button System');
        }
        if (!criticalSystems['Unified Cache Manager']) {
            console.log('  - Unified Cache Manager warning is normal, but may affect timing');
            console.log('  - Tooltips should still work, but may need manual initialization');
        }
        if (filterContainers.length === 0) {
            console.log('  - Filter buttons are likely in modals - open a modal to see them');
            console.log('  - Or check if buttons are created dynamically after page load');
        }
    }
    
    console.log('');
    console.log('🔍 ===== TOOLTIP DEBUG END =====');
    console.log('');
    console.log('💡 Tip: If tooltips were initialized, hover over buttons to test them!');
    console.log('');
    console.log('📌 IMPORTANT: Filter buttons with data-tooltip are created in modals!');
    console.log('   To test tooltips:');
    console.log('   1. Open an alert details modal (click on an alert row)');
    console.log('   2. Scroll to "פריטים מקושרים" section');
    console.log('   3. Run this debug script again, or use the function below:');
    console.log('');
    console.log('   Run: checkTooltipsInModals()');
    
    // פונקציה נוספת לבדיקה במודולים
    window.checkTooltipsInModals = function() {
        console.log('🔍 ===== CHECKING TOOLTIPS IN MODALS =====');
        console.log('');
        
        // בדיקת Bootstrap
        const bootstrapAvailable = typeof bootstrap !== 'undefined';
        const tooltipAvailable = bootstrapAvailable && typeof bootstrap.Tooltip !== 'undefined';
        
        // חיפוש כל המודולים הפתוחים
        const modals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
        console.log('Open modals found:', modals.length);
        
        if (modals.length === 0) {
            console.warn('⚠️ No open modals found!');
            console.log('   Please open a modal first (e.g., click on an alert to see details)');
            return;
        }
        
        modals.forEach((modal, modalIndex) => {
            console.log(`\n📦 Modal ${modalIndex + 1}:`);
            console.log('   Modal ID:', modal.id || 'no-id');
            console.log('   Modal classes:', modal.className);
            
            // חיפוש filter containers במודול
            const filterContainers = modal.querySelectorAll('[id*="linkedItemsFilter"], .filter-buttons-container');
            console.log('   Filter containers in modal:', filterContainers.length);
            
            filterContainers.forEach((container, containerIndex) => {
                console.log(`\n   Container ${containerIndex + 1}:`);
                console.log('     ID:', container.id || 'no-id');
                console.log('     Classes:', container.className);
                
                const buttons = container.querySelectorAll('button');
                const buttonsWithTooltip = container.querySelectorAll('[data-tooltip]');
                
                console.log('     Total buttons:', buttons.length);
                console.log('     Buttons with data-tooltip:', buttonsWithTooltip.length);
                
                if (buttonsWithTooltip.length > 0) {
                    console.log('     ✅ Found buttons with data-tooltip!');
                    buttonsWithTooltip.forEach((btn, btnIndex) => {
                        const tooltipText = btn.getAttribute('data-tooltip');
                        console.log(`     Button ${btnIndex + 1}:`, {
                            id: btn.id || 'no-id',
                            tooltipText: tooltipText,
                            hasInstance: tooltipAvailable ? !!bootstrap.Tooltip.getInstance(btn) : 'N/A'
                        });
                    });
                    
                    // נסיון לאתחל טולטיפים
                    if (tooltipAvailable) {
                        console.log('\n     🔧 Initializing tooltips...');
                        buttonsWithTooltip.forEach((btn, btnIndex) => {
                            try {
                                const existing = bootstrap.Tooltip.getInstance(btn);
                                if (existing) {
                                    existing.dispose();
                                }
                                
                                const tooltipText = btn.getAttribute('data-tooltip');
                                const placement = btn.getAttribute('data-tooltip-placement') || 'top';
                                const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
                                
                                new bootstrap.Tooltip(btn, {
                                    title: tooltipText,
                                    placement: placement,
                                    trigger: trigger
                                });
                                
                                console.log(`     ✅ Initialized tooltip for button ${btnIndex + 1}`);
                            } catch (error) {
                                console.error(`     ❌ Error initializing tooltip for button ${btnIndex + 1}:`, error);
                            }
                        });
                    }
                } else {
                    console.warn('     ⚠️ No buttons with data-tooltip found in this container');
                    console.log('     Checking all buttons in container:');
                    buttons.forEach((btn, btnIndex) => {
                        console.log(`     Button ${btnIndex + 1}:`, {
                            id: btn.id || 'no-id',
                            className: btn.className,
                            hasDataTooltip: btn.hasAttribute('data-tooltip'),
                            innerHTML: btn.innerHTML.substring(0, 50)
                        });
                    });
                }
            });
        });
        
        console.log('\n🔍 ===== MODAL CHECK COMPLETE =====');
    };
    
    // החזרת מידע שימושי
    return {
        bootstrapAvailable,
        tooltipAvailable,
        buttonSystemAvailable,
        buttonsWithTooltipCount: buttonsWithTooltip.length,
        buttonsWithTooltip: Array.from(buttonsWithTooltip),
        issues: issues,
        checkTooltipsInModals: window.checkTooltipsInModals
    };
})();

