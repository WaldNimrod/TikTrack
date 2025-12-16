/**
 * Isolation Tool - בודד בעיות על ידי הסתרה/הפעלה של קומפוננטות
 * כלי לבידוד בעיות על ידי הפעלה/השבתה של חלקים שונים בעמוד
 */

(function() {
    'use strict';

    const IsolationTool = {
        components: {
            'active-alerts': true,
            'pending-executions': true,
            'pending-trade-plans': true,
            'recent-trades': true,
            'charts': true,
            'portfolio': true,
            'monitoring': true,
            'init-system-check': true
        },

        /**
         * Toggle component visibility
         */
        toggleComponent(name, show) {
            const elements = document.querySelectorAll(`[data-component="${name}"], .${name}-component, #${name}-component`);
            elements.forEach(el => {
                if (el) {
                    el.style.display = show ? '' : 'none';
                    console.log(`${show ? '✅' : '❌'} Component "${name}": ${show ? 'shown' : 'hidden'}`);
                }
            });
            
            // Also try by ID/class patterns
            const byId = document.getElementById(name);
            if (byId) {
                byId.style.display = show ? '' : 'none';
            }
            
            const byClass = document.querySelector(`.${name}`);
            if (byClass) {
                byClass.style.display = show ? '' : 'none';
            }
        },

        /**
         * Hide all components except specified ones
         */
        isolateComponents(keepVisible = []) {
            Object.keys(this.components).forEach(name => {
                const shouldShow = keepVisible.includes(name);
                this.toggleComponent(name, shouldShow);
            });
        },

        /**
         * Show all components
         */
        showAll() {
            Object.keys(this.components).forEach(name => {
                this.toggleComponent(name, true);
            });
        },

        /**
         * Hide all components
         */
        hideAll() {
            Object.keys(this.components).forEach(name => {
                this.toggleComponent(name, false);
            });
        },

        /**
         * Disable automatic initialization
         */
        disableAutoInit() {
            // Disable unified app initializer
            if (window.unifiedAppInit) {
                window.unifiedAppInit.initialized = true;
            }
            
            // Disable core systems auto-init
            if (window.globalInitializationState) {
                window.globalInitializationState.unifiedAppInitialized = true;
                window.globalInitializationState.unifiedAppInitializing = true;
            }
            
            console.log('✅ Auto-initialization disabled');
        },

        /**
         * Enable automatic initialization
         */
        enableAutoInit() {
            if (window.unifiedAppInit) {
                window.unifiedAppInit.initialized = false;
            }
            
            if (window.globalInitializationState) {
                window.globalInitializationState.unifiedAppInitialized = false;
                window.globalInitializationState.unifiedAppInitializing = false;
            }
            
            console.log('✅ Auto-initialization enabled');
        },

        /**
         * Disable specific scripts
         */
        disableScript(scriptName) {
            const scripts = document.querySelectorAll(`script[src*="${scriptName}"]`);
            scripts.forEach(script => {
                script.setAttribute('data-disabled', 'true');
                script.remove();
                console.log(`❌ Disabled script: ${scriptName}`);
            });
        },

        /**
         * Get isolation status
         */
        getStatus() {
            return {
                components: this.components,
                autoInitDisabled: window.globalInitializationState?.unifiedAppInitialized || false,
                errorDetectorActive: window.PromiseErrorDetector ? true : false,
                errorCount: window.PromiseErrorDetector?.getReportCount() || 0
            };
        },

        /**
         * Print isolation status
         */
        printStatus() {
            const status = this.getStatus();
            console.table(status);
            return status;
        }
    };

    // Expose to window
    window.IsolationTool = IsolationTool;

    // Add console helpers
    console.log(`
🔧 Isolation Tool Loaded
Available commands:
// - IsolationTool.toggleComponent('active-alerts', false)  // Hide component
// - IsolationTool.isolateComponents(['active-alerts'])     // Show only specified
// - IsolationTool.showAll()                                // Show all
// - IsolationTool.hideAll()                                // Hide all
// - IsolationTool.disableAutoInit()                        // Disable auto-init
// - IsolationTool.enableAutoInit()                         // Enable auto-init
// - IsolationTool.printStatus()                            // Print status
// - IsolationTool.getStatus()                              // Get status object
    `);

})();

