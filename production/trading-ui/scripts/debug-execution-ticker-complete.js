/**
 * Complete Debug Script for ExecutionTicker Loading
 * סקריפט דיבוג מלא לניטור טעינת executionTicker
 * 
 * This script monitors ALL stages of executionTicker loading:
 * 1. populateSelects
 * 2. populateForm
 * 3. initializeSpecialHandlers
 * 4. Any other code that might reset the value
 */

(function() {
    'use strict';
    
    const DEBUG_KEY = 'executionTicker';
    const logHistory = [];
    
    function log(step, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            step,
            data: JSON.parse(JSON.stringify(data)) // Deep clone
        };
        logHistory.push(entry);
        console.log(`🔍 [${DEBUG_KEY}] ${step}`, data);
    }
    
    function getSelectState(select) {
        if (!select) return null;
        return {
            id: select.id,
            value: select.value,
            selectedIndex: select.selectedIndex,
            optionsCount: select.options.length,
            options: Array.from(select.options).map(opt => ({
                value: opt.value,
                text: opt.textContent,
                selected: opt.selected
            })),
            innerHTML: select.innerHTML.substring(0, 200) // First 200 chars
        };
    }
    
    // Monitor populateSelects
    const originalPopulateSelects = window.ModalManagerV2?.prototype?.populateSelects;
    if (originalPopulateSelects) {
        window.ModalManagerV2.prototype.populateSelects = async function(...args) {
            const [modalElement, config] = args;
            const tickerSelect = modalElement?.querySelector?.('#executionTicker');
            
            if (tickerSelect) {
                log('populateSelects START', {
                    before: getSelectState(tickerSelect)
                });
            }
            
            const result = await originalPopulateSelects.apply(this, args);
            
            if (tickerSelect) {
                log('populateSelects END', {
                    after: getSelectState(tickerSelect)
                });
            }
            
            return result;
        };
    }
    
    // Monitor populateForm
    const originalPopulateForm = window.ModalManagerV2?.prototype?.populateForm;
    if (originalPopulateForm) {
        window.ModalManagerV2.prototype.populateForm = async function(...args) {
            const [modalElement, data] = args;
            const tickerSelect = modalElement?.querySelector?.('#executionTicker');
            const tickerId = data?.ticker_id;
            
            if (tickerSelect) {
                log('populateForm START', {
                    tickerId,
                    before: getSelectState(tickerSelect)
                });
            }
            
            const result = await originalPopulateForm.apply(this, args);
            
            if (tickerSelect) {
                log('populateForm END', {
                    tickerId,
                    after: getSelectState(tickerSelect)
                });
            }
            
            return result;
        };
    }
    
    // Monitor initializeSpecialHandlers
    const originalInitializeSpecialHandlers = window.ModalManagerV2?.prototype?.initializeSpecialHandlers;
    if (originalInitializeSpecialHandlers) {
        window.ModalManagerV2.prototype.initializeSpecialHandlers = function(...args) {
            const [modalElement] = args;
            const tickerSelect = modalElement?.querySelector?.('#executionTicker');
            
            if (tickerSelect) {
                log('initializeSpecialHandlers START', {
                    before: getSelectState(tickerSelect)
                });
            }
            
            const result = originalInitializeSpecialHandlers.apply(this, args);
            
            if (tickerSelect) {
                // Check after a short delay (async operations might happen)
                setTimeout(() => {
                    log('initializeSpecialHandlers END (delayed)', {
                        after: getSelectState(tickerSelect)
                    });
                }, 500);
            }
            
            return result;
        };
    }
    
    // Monitor SelectPopulatorService.populateTickersSelect
    if (window.SelectPopulatorService?.populateTickersSelect) {
        const originalPopulateTickersSelect = window.SelectPopulatorService.populateTickersSelect;
        window.SelectPopulatorService.populateTickersSelect = async function(select, options) {
            if (select?.id === 'executionTicker') {
                log('populateTickersSelect START', {
                    selectId: select.id,
                    defaultValue: options?.defaultValue,
                    before: getSelectState(select)
                });
            }
            
            const result = await originalPopulateTickersSelect.apply(this, arguments);
            
            if (select?.id === 'executionTicker') {
                log('populateTickersSelect END', {
                    selectId: select.id,
                    defaultValue: options?.defaultValue,
                    after: getSelectState(select)
                });
            }
            
            return result;
        };
    }
    
    // Monitor direct value changes
    const tickerSelectProto = HTMLSelectElement.prototype;
    const originalValueSetter = Object.getOwnPropertyDescriptor(tickerSelectProto, 'value')?.set;
    if (originalValueSetter) {
        Object.defineProperty(tickerSelectProto, 'value', {
            set: function(newValue) {
                if (this.id === 'executionTicker') {
                    const oldValue = this.value;
                    const stack = new Error().stack;
                    log('DIRECT value change', {
                        oldValue,
                        newValue,
                        stack: stack?.split('\n').slice(1, 4).join('\n') // First 3 stack frames
                    });
                }
                originalValueSetter.call(this, newValue);
            },
            get: Object.getOwnPropertyDescriptor(tickerSelectProto, 'value')?.get,
            configurable: true,
            enumerable: true
        });
    }
    
    // Monitor innerHTML changes (which would clear options)
    const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.set;
    if (originalInnerHTMLSetter) {
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(newHTML) {
                if (this.id === 'executionTicker') {
                    const oldOptionsCount = this.options?.length || 0;
                    const oldValue = this.value;
                    log('innerHTML change', {
                        oldOptionsCount,
                        oldValue,
                        newHTMLLength: newHTML?.length
                    });
                }
                originalInnerHTMLSetter.call(this, newHTML);
            },
            get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')?.get,
            configurable: true,
            enumerable: true
        });
    }
    
    // Monitor cloneNode (which might lose the value)
    const originalCloneNode = Node.prototype.cloneNode;
    Node.prototype.cloneNode = function(deep) {
        const result = originalCloneNode.call(this, deep);
        if (this.id === 'executionTicker') {
            log('cloneNode', {
                deep,
                originalValue: this.value,
                clonedValue: result.value,
                originalOptionsCount: this.options.length,
                clonedOptionsCount: result.options.length
            });
        }
        return result;
    };
    
    // Monitor replaceChild (which might replace the select)
    const originalReplaceChild = Node.prototype.replaceChild;
    Node.prototype.replaceChild = function(newChild, oldChild) {
        if (oldChild?.id === 'executionTicker' || newChild?.id === 'executionTicker') {
            log('replaceChild', {
                oldChildId: oldChild?.id,
                newChildId: newChild?.id,
                oldValue: oldChild?.value,
                newValue: newChild?.value,
                oldOptionsCount: oldChild?.options?.length,
                newOptionsCount: newChild?.options?.length
            });
        }
        return originalReplaceChild.call(this, newChild, oldChild);
    };
    
    // Global function to get debug report
    window.getExecutionTickerDebugReport = function() {
        const select = document.querySelector('#executionTicker');
        return {
            currentState: getSelectState(select),
            logHistory: logHistory,
            summary: {
                totalSteps: logHistory.length,
                populateSelectsCalls: logHistory.filter(l => l.step.includes('populateSelects')).length,
                populateFormCalls: logHistory.filter(l => l.step.includes('populateForm')).length,
                initializeSpecialHandlersCalls: logHistory.filter(l => l.step.includes('initializeSpecialHandlers')).length,
                populateTickersSelectCalls: logHistory.filter(l => l.step.includes('populateTickersSelect')).length,
                valueChanges: logHistory.filter(l => l.step.includes('value change')).length,
                innerHTMLChanges: logHistory.filter(l => l.step.includes('innerHTML')).length,
                cloneNodeCalls: logHistory.filter(l => l.step.includes('cloneNode')).length,
                replaceChildCalls: logHistory.filter(l => l.step.includes('replaceChild')).length
            }
        };
    };
    
    // Auto-run when modal is shown
    function setupWatcher() {
        const modal = document.getElementById('executionsModal');
        if (modal) {
            modal.addEventListener('shown.bs.modal', () => {
                console.log('🔍 [DEBUG] Modal shown - monitoring executionTicker...');
                setTimeout(() => {
                    const report = window.getExecutionTickerDebugReport();
                    console.log('📊 [DEBUG] Final Report:', report);
                    console.log('📊 [DEBUG] Run getExecutionTickerDebugReport() in console for full details');
                }, 2000);
            }, { once: false });
        } else {
            setTimeout(setupWatcher, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupWatcher);
    } else {
        setupWatcher();
    }
    
    console.log('✅ Complete debug script loaded. All executionTicker operations are being monitored.');
    console.log('📊 Run getExecutionTickerDebugReport() in console to see full report.');
})();

