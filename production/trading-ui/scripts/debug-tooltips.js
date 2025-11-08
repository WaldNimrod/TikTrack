/**
 * Tooltip Debug Utility
 * Run this in console to debug tooltip issues
 * 
 * Usage: copy and paste into browser console
 */

(function() {
    console.log('🔍 === TOOLTIP DEBUG UTILITY ===');
    console.log('');
    
    // 1. Check Bootstrap availability
    console.log('1️⃣ Bootstrap Tooltip Check:');
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        console.log('   ✅ Bootstrap Tooltip is available');
        console.log('   📦 Version:', bootstrap.Tooltip.VERSION || 'unknown');
    } else {
        console.log('   ❌ Bootstrap Tooltip is NOT available');
        console.log('   ⚠️ Tooltips will not work without Bootstrap');
    }
    console.log('');
    
    // 2. Check Button System availability
    console.log('2️⃣ Button System Check:');
    if (window.advancedButtonSystem) {
        console.log('   ✅ AdvancedButtonSystem is available');
        console.log('   📋 Methods:', {
            initializeTooltips: typeof window.advancedButtonSystem.initializeTooltips === 'function',
            _getTooltipConfig: typeof window.advancedButtonSystem._getTooltipConfig === 'function',
            _initializeTooltip: typeof window.advancedButtonSystem._initializeTooltip === 'function'
        });
    } else {
        console.log('   ❌ AdvancedButtonSystem is NOT available');
    }
    console.log('');
    
    // 3. Find all buttons with data-tooltip
    console.log('3️⃣ Buttons with data-tooltip:');
    const buttonsWithTooltip = document.querySelectorAll('[data-tooltip]');
    console.log('   📊 Total found:', buttonsWithTooltip.length);
    
    if (buttonsWithTooltip.length === 0) {
        console.log('   ⚠️ No buttons with data-tooltip found!');
    } else {
        console.log('   📋 Buttons details:');
        buttonsWithTooltip.forEach((btn, index) => {
            const tooltipText = btn.getAttribute('data-tooltip');
            const placement = btn.getAttribute('data-tooltip-placement') || 'top';
            const trigger = btn.getAttribute('data-tooltip-trigger') || 'hover';
            const hasBsToggle = btn.hasAttribute('data-bs-toggle');
            const hasTitle = btn.hasAttribute('title');
            const tooltipInstance = bootstrap && bootstrap.Tooltip ? bootstrap.Tooltip.getInstance(btn) : null;
            
            console.log(`   ${index + 1}. Button ID: ${btn.id || '(no id)'}`);
            console.log(`      - Tooltip text: "${tooltipText}"`);
            console.log(`      - Placement: ${placement}`);
            console.log(`      - Trigger: ${trigger}`);
            console.log(`      - Has data-bs-toggle: ${hasBsToggle}`);
            console.log(`      - Has title: ${hasTitle}`);
            console.log(`      - Tooltip instance: ${tooltipInstance ? '✅ Initialized' : '❌ Not initialized'}`);
            if (tooltipInstance) {
                console.log(`      - Tooltip enabled: ${tooltipInstance._isEnabled}`);
                console.log(`      - Tooltip config:`, tooltipInstance._config);
            }
            console.log(`      - Element:`, btn);
            console.log('');
        });
    }
    console.log('');
    
    // 4. Check filter buttons specifically
    console.log('4️⃣ Filter Buttons Check:');
    const filterContainers = document.querySelectorAll('[id^="linkedItemsFilter_"]');
    console.log('   📊 Filter containers found:', filterContainers.length);
    
    filterContainers.forEach((container, index) => {
        const tableId = container.id.replace('linkedItemsFilter_', '');
        const filterButtons = container.querySelectorAll('[data-tooltip]');
        console.log(`   Container ${index + 1} (tableId: ${tableId}):`);
        console.log(`      - Filter buttons: ${filterButtons.length}`);
        
        filterButtons.forEach((btn, btnIndex) => {
            const tooltipText = btn.getAttribute('data-tooltip');
            const tooltipInstance = bootstrap && bootstrap.Tooltip ? bootstrap.Tooltip.getInstance(btn) : null;
            console.log(`      Button ${btnIndex + 1}: "${tooltipText}" - ${tooltipInstance ? '✅' : '❌'}`);
        });
        console.log('');
    });
    console.log('');
    
    // 5. Try to initialize tooltips manually
    console.log('5️⃣ Manual Initialization Test:');
    if (window.advancedButtonSystem && window.advancedButtonSystem.initializeTooltips) {
        console.log('   🔧 Attempting to initialize tooltips for document.body...');
        try {
            window.advancedButtonSystem.initializeTooltips(document.body);
            console.log('   ✅ initializeTooltips called successfully');
            
            // Wait a bit and check again
            setTimeout(() => {
                console.log('   🔍 Re-checking after 200ms...');
                const recheckButtons = document.querySelectorAll('[data-tooltip]');
                let initializedCount = 0;
                recheckButtons.forEach(btn => {
                    const instance = bootstrap && bootstrap.Tooltip ? bootstrap.Tooltip.getInstance(btn) : null;
                    if (instance) initializedCount++;
                });
                console.log(`   📊 Initialized: ${initializedCount}/${recheckButtons.length}`);
            }, 200);
        } catch (error) {
            console.log('   ❌ Error:', error);
        }
    } else {
        console.log('   ❌ initializeTooltips method not available');
    }
    console.log('');
    
    // 6. Check specific button
    console.log('6️⃣ Test Single Button:');
    if (buttonsWithTooltip.length > 0) {
        const testButton = buttonsWithTooltip[0];
        console.log('   Testing button:', testButton);
        console.log('   Config from _getTooltipConfig:', 
            window.advancedButtonSystem && window.advancedButtonSystem._getTooltipConfig 
                ? window.advancedButtonSystem._getTooltipConfig(testButton)
                : 'method not available');
        
        if (bootstrap && bootstrap.Tooltip) {
            console.log('   Attempting manual Bootstrap Tooltip initialization...');
            try {
                // Destroy existing if any
                const existing = bootstrap.Tooltip.getInstance(testButton);
                if (existing) {
                    existing.dispose();
                    console.log('   ✅ Disposed existing tooltip');
                }
                
                // Create new
                const config = {
                    placement: testButton.getAttribute('data-tooltip-placement') || 'top',
                    trigger: testButton.getAttribute('data-tooltip-trigger') || 'hover',
                    title: testButton.getAttribute('data-tooltip')
                };
                const newTooltip = new bootstrap.Tooltip(testButton, config);
                console.log('   ✅ Created new tooltip:', newTooltip);
                console.log('   📋 Config:', config);
            } catch (error) {
                console.log('   ❌ Error creating tooltip:', error);
            }
        }
    }
    console.log('');
    
    console.log('🔍 === END DEBUG REPORT ===');
    
    // Return summary for programmatic access
    return {
        bootstrapAvailable: typeof bootstrap !== 'undefined' && !!bootstrap.Tooltip,
        buttonSystemAvailable: !!window.advancedButtonSystem,
        buttonsWithTooltip: buttonsWithTooltip.length,
        filterContainers: filterContainers.length,
        getTooltipStatus: function() {
            const buttons = document.querySelectorAll('[data-tooltip]');
            const status = {
                total: buttons.length,
                initialized: 0,
                notInitialized: []
            };
            buttons.forEach(btn => {
                const instance = bootstrap && bootstrap.Tooltip ? bootstrap.Tooltip.getInstance(btn) : null;
                if (instance) {
                    status.initialized++;
                } else {
                    status.notInitialized.push({
                        id: btn.id,
                        tooltip: btn.getAttribute('data-tooltip'),
                        element: btn
                    });
                }
            });
            return status;
        }
    };
})();


