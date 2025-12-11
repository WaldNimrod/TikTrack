/**
 * Comprehensive Filter Tooltips Debug Script
 * ==========================================
 * 
 * This script provides detailed monitoring and debugging for filter button tooltips
 * on the alerts page and entity details modal.
 * 
 * Usage: Copy and paste into browser console
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - monitorButtonSystemInit() - Monitorbuttonsysteminit
// - manualTooltipInit() - Manualtooltipinit

// === Event Handlers ===
// - monitorFilterButtonsHTML() - Monitorfilterbuttonshtml
// - monitorDOMMutations() - Monitordommutations
// - monitorPageLoad() - Monitorpageload

// === Data Functions ===
// - getComprehensiveReport() - Getcomprehensivereport

// === Utility Functions ===
// - checkSourceHTML() - Checksourcehtml

// === Other ===
// - debugLog() - Debuglog
// - debugWarn() - Debugwarn
// - debugError() - Debugerror

// CRITICAL: Define the object IMMEDIATELY before IIFE to ensure it's always available
// This prevents "ReferenceError: debugFilterTooltips is not defined" errors
if (typeof window.debugFilterTooltips === 'undefined') {
    window.debugFilterTooltips = {
        _initializing: true,
        _ready: false,
        getReport: function() {
            return {
                error: 'Script is still initializing',
                message: 'Please wait a moment and try again',
                timestamp: new Date().toISOString()
            };
        }
    };
}

(function() {
    'use strict';
    
    // Immediate log to confirm script is loading
    console.log('🔍 [Filter Tooltips Debug] Script starting to load...');
    
    const DEBUG_PREFIX = '🔍 [Filter Tooltips Debug]';
    const logHistory = [];
    
    // Logging function with history
    function debugLog(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, data };
        logHistory.push(logEntry);
        console.log(`${DEBUG_PREFIX} ${message}`, data || '');
    }
    
    function debugWarn(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, data, level: 'warn' };
        logHistory.push(logEntry);
        console.warn(`${DEBUG_PREFIX} ⚠️ ${message}`, data || '');
    }
    
    function debugError(message, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, error, level: 'error' };
        logHistory.push(logEntry);
        console.error(`${DEBUG_PREFIX} ❌ ${message}`, error || '');
    }
    
    // ===== MONITORING FUNCTIONS =====
    
    /**
     * Monitor filter buttons HTML from source
     */
    function monitorFilterButtonsHTML() {
        debugLog('=== Checking Filter Buttons HTML ===');
        
        // Find all filter button containers
        const containers = document.querySelectorAll('.filter-buttons-container');
        debugLog(`Found ${containers.length} filter button containers`);
        
        containers.forEach((container, containerIndex) => {
            debugLog(`\n--- Container ${containerIndex + 1} ---`, {
                id: container.id || '(no id)',
                className: container.className,
                tagName: container.tagName,
                parentElement: container.parentElement?.tagName || 'none'
            });
            
            // Get all buttons in container
            const allButtons = container.querySelectorAll('button');
            debugLog(`  Total buttons: ${allButtons.length}`);
            
            allButtons.forEach((button, buttonIndex) => {
                const buttonInfo = {
                    index: buttonIndex + 1,
                    id: button.id || '(no id)',
                    classes: button.className,
                    dataType: button.getAttribute('data-type') || '(none)',
                    dataButtonType: button.getAttribute('data-button-type') || '(none)',
                    dataButtonProcessed: button.hasAttribute('data-button-processed'),
                    onclick: button.getAttribute('onclick') || '(none)',
                    dataOnclick: button.getAttribute('data-onclick') || '(none)',
                    title: button.getAttribute('title') || '(none)',
                    dataTooltip: button.getAttribute('data-tooltip') || '(none)',
                    dataTooltipPlacement: button.getAttribute('data-tooltip-placement') || '(none)',
                    dataTooltipTrigger: button.getAttribute('data-tooltip-trigger') || '(none)',
                    dataBsToggle: button.getAttribute('data-bs-toggle') || '(none)',
                    innerHTML: button.innerHTML.substring(0, 50) + '...'
                };
                
                debugLog(`  Button ${buttonIndex + 1}:`, buttonInfo);
                
                // Check if button has tooltip attributes
                if (button.hasAttribute('data-tooltip')) {
                    debugLog(`    ✅ Has data-tooltip: "${button.getAttribute('data-tooltip')}"`);
                } else {
                    debugWarn(`    ❌ Missing data-tooltip attribute`);
                }
                
                // Check Bootstrap tooltip instance
                if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                    const tooltipInstance = bootstrap.Tooltip.getInstance(button);
                    if (tooltipInstance) {
                        debugLog(`    ✅ Bootstrap tooltip instance exists`);
                    } else {
                        debugWarn(`    ❌ No Bootstrap tooltip instance`);
                    }
                } else {
                    debugWarn(`    ❌ Bootstrap not available`);
                }
            });
        });
    }
    
    /**
     * Monitor button system initialization
     */
    function monitorButtonSystemInit() {
        debugLog('=== Monitoring Button System Initialization ===');
        
        // Check if button system exists
        if (!window.advancedButtonSystem) {
            debugWarn('advancedButtonSystem not found');
            return;
        }
        
        debugLog('advancedButtonSystem found', {
            hasInitializeTooltips: typeof window.advancedButtonSystem.initializeTooltips === 'function',
            hasProcessButtons: typeof window.advancedButtonSystem.processButtons === 'function'
        });
        
        // Monitor when initializeTooltips is called
        const originalInitializeTooltips = window.advancedButtonSystem.initializeTooltips;
        if (originalInitializeTooltips) {
            window.advancedButtonSystem.initializeTooltips = function(container) {
                debugLog('initializeTooltips called', {
                    container: container?.id || container?.className || 'unknown',
                    containerTag: container?.tagName || 'unknown',
                    timestamp: new Date().toISOString()
                });
                
                // Call original function
                const result = originalInitializeTooltips.call(this, container);
                
                // Check results after a delay
                setTimeout(() => {
                    if (container) {
                        const buttonsWithTooltip = container.querySelectorAll('[data-tooltip]');
                        debugLog('After initializeTooltips', {
                            buttonsFound: buttonsWithTooltip.length,
                            timestamp: new Date().toISOString()
                        });
                        
                        buttonsWithTooltip.forEach((btn, idx) => {
                            const tooltipInstance = bootstrap?.Tooltip?.getInstance(btn);
                            debugLog(`  Button ${idx + 1} tooltip status:`, {
                                hasDataTooltip: btn.hasAttribute('data-tooltip'),
                                tooltipText: btn.getAttribute('data-tooltip'),
                                hasBootstrapInstance: !!tooltipInstance
                            });
                        });
                    }
                }, 200);
                
                return result;
            };
            
            debugLog('✅ Wrapped initializeTooltips function');
        }
    }
    
    /**
     * Monitor DOM mutations for filter buttons
     */
    function monitorDOMMutations() {
        debugLog('=== Setting up DOM Mutation Observer ===');
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.classList.contains('filter-buttons-container') || 
                        (target.tagName === 'BUTTON' && target.closest('.filter-buttons-container'))) {
                        debugLog('DOM mutation detected on filter element', {
                            target: target.tagName,
                            attributeName: mutation.attributeName,
                            newValue: target.getAttribute(mutation.attributeName),
                            timestamp: new Date().toISOString()
                        });
                    }
                } else if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('filter-buttons-container')) {
                                debugLog('New filter container added to DOM', {
                                    id: node.id || '(no id)',
                                    timestamp: new Date().toISOString()
                                });
                                
                                // Check buttons in new container
                                setTimeout(() => {
                                    const buttons = node.querySelectorAll('button[data-tooltip]');
                                    debugLog(`Found ${buttons.length} buttons with data-tooltip in new container`);
                                }, 100);
                            } else if (node.tagName === 'BUTTON' && node.closest('.filter-buttons-container')) {
                                debugLog('New filter button added to DOM', {
                                    hasDataTooltip: node.hasAttribute('data-tooltip'),
                                    dataTooltip: node.getAttribute('data-tooltip') || '(none)',
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-tooltip', 'data-button-processed', 'data-type', 'onclick', 'data-onclick']
        });
        
        debugLog('✅ DOM Mutation Observer started');
        return observer;
    }
    
    /**
     * Monitor page load and initialization
     */
    function monitorPageLoad() {
        debugLog('=== Monitoring Page Load ===');
        
        // Check current state
        if (document.readyState === 'complete') {
            debugLog('Page already loaded');
            monitorFilterButtonsHTML();
        } else {
            debugLog('Waiting for page load...');
            window.addEventListener('load', () => {
                debugLog('Page loaded');
                setTimeout(() => {
                    monitorFilterButtonsHTML();
                }, 500);
            });
        }
        
        // Monitor DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                debugLog('DOMContentLoaded fired');
                setTimeout(() => {
                    monitorFilterButtonsHTML();
                }, 100);
            });
        }
    }
    
    /**
     * Check source HTML for filter buttons
     */
    function checkSourceHTML() {
        debugLog('=== Checking Source HTML ===');
        
        // Try to get the original HTML
        const containers = document.querySelectorAll('.filter-buttons-container');
        containers.forEach((container, index) => {
            debugLog(`Container ${index + 1} HTML:`, {
                outerHTML: container.outerHTML.substring(0, 500) + '...'
            });
        });
    }
    
    /**
     * Manual tooltip initialization test
     */
    function manualTooltipInit() {
        debugLog('=== Manual Tooltip Initialization Test ===');
        
        if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
            debugError('Bootstrap Tooltip not available');
            return;
        }
        
        const containers = document.querySelectorAll('.filter-buttons-container');
        let totalInitialized = 0;
        
        containers.forEach((container, containerIndex) => {
            debugLog(`Processing container ${containerIndex + 1}`);
            
            const buttons = container.querySelectorAll('button[data-tooltip]');
            debugLog(`Found ${buttons.length} buttons with data-tooltip`);
            
            buttons.forEach((button, buttonIndex) => {
                try {
                    // Destroy existing tooltip if exists
                    const existingTooltip = bootstrap.Tooltip.getInstance(button);
                    if (existingTooltip) {
                        existingTooltip.dispose();
                        debugLog(`  Button ${buttonIndex + 1}: Disposed existing tooltip`);
                    }
                    
                    const tooltipText = button.getAttribute('data-tooltip');
                    const placement = button.getAttribute('data-tooltip-placement') || 'top';
                    const trigger = button.getAttribute('data-tooltip-trigger') || 'hover';
                    
                    if (tooltipText) {
                        new bootstrap.Tooltip(button, {
                            title: tooltipText,
                            placement: placement,
                            trigger: trigger
                        });
                        
                        totalInitialized++;
                        debugLog(`  ✅ Button ${buttonIndex + 1}: Tooltip initialized`, {
                            text: tooltipText,
                            placement: placement,
                            trigger: trigger
                        });
                    } else {
                        debugWarn(`  ❌ Button ${buttonIndex + 1}: No tooltip text`);
                    }
                } catch (error) {
                    debugError(`Error initializing tooltip for button ${buttonIndex + 1}`, error);
                }
            });
        });
        
        debugLog(`✅ Manual initialization complete: ${totalInitialized} tooltips initialized`);
    }
    
    /**
     * Get comprehensive report
     */
    function getComprehensiveReport() {
        debugLog('=== COMPREHENSIVE REPORT ===');
        
        const report = {
            timestamp: new Date().toISOString(),
            pageState: {
                readyState: document.readyState,
                url: window.location.href
            },
            systems: {
                bootstrap: typeof bootstrap !== 'undefined',
                bootstrapTooltip: typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined',
                advancedButtonSystem: !!window.advancedButtonSystem,
                buttonSystemHasInitTooltips: !!(window.advancedButtonSystem && window.advancedButtonSystem.initializeTooltips)
            },
            filterContainers: [],
            buttons: []
        };
        
        const containers = document.querySelectorAll('.filter-buttons-container');
        report.filterContainers = Array.from(containers).map((container, idx) => ({
            index: idx + 1,
            id: container.id || '(no id)',
            className: container.className,
            buttonCount: container.querySelectorAll('button').length,
            buttonsWithTooltip: container.querySelectorAll('button[data-tooltip]').length
        }));
        
        containers.forEach((container) => {
            const buttons = container.querySelectorAll('button');
            buttons.forEach((button) => {
                report.buttons.push({
                    containerId: container.id || '(no id)',
                    id: button.id || '(no id)',
                    dataType: button.getAttribute('data-type'),
                    dataButtonType: button.getAttribute('data-button-type'),
                    hasDataTooltip: button.hasAttribute('data-tooltip'),
                    dataTooltip: button.getAttribute('data-tooltip'),
                    hasBootstrapInstance: !!(bootstrap?.Tooltip?.getInstance(button)),
                    onclick: button.getAttribute('onclick') || null,
                    dataOnclick: button.getAttribute('data-onclick') || null
                });
            });
        });
        
        console.table(report.filterContainers);
        console.table(report.buttons);
        console.log('Full Report:', report);
        
        return report;
    }
    
    // ===== EXPORT FUNCTIONS =====
    
    // Ensure object exists (should already exist from before IIFE, but double-check)
    if (!window.debugFilterTooltips) {
        window.debugFilterTooltips = {};
    }
    
    // Define all functions with error handling
    try {
        // Update the existing object instead of replacing it
        Object.assign(window.debugFilterTooltips, {
            // Monitoring functions
            monitorButtons: monitorFilterButtonsHTML,
            monitorSystem: monitorButtonSystemInit,
            monitorMutations: monitorDOMMutations,
            monitorLoad: monitorPageLoad,
            checkSource: checkSourceHTML,
            
            // Action functions
            manualInit: manualTooltipInit,
            getReport: getComprehensiveReport,
            
            // History
            getHistory: () => logHistory,
            clearHistory: () => logHistory.length = 0,
            
            // Version info
            version: '1.0.0',
            loaded: true,
            _ready: true,
            _initializing: false
        });
        
        // Auto-start monitoring
        debugLog('=== Filter Tooltips Debug Script Loaded ===');
        
        // Initialize monitoring with error handling
        try {
            monitorPageLoad();
        } catch (e) {
            debugError('Error in monitorPageLoad', e);
        }
        
        try {
            monitorButtonSystemInit();
        } catch (e) {
            debugError('Error in monitorButtonSystemInit', e);
        }
        
        try {
            const mutationObserver = monitorDOMMutations();
            // Store observer for potential cleanup
            window.debugFilterTooltips._mutationObserver = mutationObserver;
        } catch (e) {
            debugError('Error in monitorDOMMutations', e);
        }
        
        debugLog('Available commands:', {
            'debugFilterTooltips.monitorButtons()': 'Check current state of filter buttons',
            'debugFilterTooltips.monitorSystem()': 'Monitor button system initialization',
            'debugFilterTooltips.manualInit()': 'Manually initialize tooltips',
            'debugFilterTooltips.getReport()': 'Get comprehensive report',
            'debugFilterTooltips.checkSource()': 'Check source HTML',
            'debugFilterTooltips.getHistory()': 'View log history'
        });
        
        console.log('✅ Filter Tooltips Debug Script Ready!');
        console.log('Run debugFilterTooltips.getReport() for full report');
    } catch (error) {
        console.error('❌ Error initializing debugFilterTooltips:', error);
        // Ensure basic object exists even on error
        if (!window.debugFilterTooltips) {
            window.debugFilterTooltips = {};
        }
        Object.assign(window.debugFilterTooltips, {
            error: 'Initialization failed',
            errorMessage: error.message,
            _ready: false,
            _initializing: false,
            getReport: () => ({ 
                error: 'Script initialization failed', 
                errorMessage: error.message,
                timestamp: new Date().toISOString()
            })
        });
    }
})();

// Final fallback: Ensure object is available even if IIFE fails completely
if (typeof window.debugFilterTooltips === 'undefined') {
    console.warn('⚠️ debugFilterTooltips not initialized, creating fallback');
    window.debugFilterTooltips = {
        error: 'Script not loaded properly',
        _ready: false,
        _initializing: false,
        getReport: () => ({ 
            error: 'Script not loaded properly',
            timestamp: new Date().toISOString()
        })
    };
} else {
    // Log successful initialization
    console.log('✅ debugFilterTooltips object is ready and available globally');
}

