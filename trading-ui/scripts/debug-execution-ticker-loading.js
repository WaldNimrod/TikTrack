/**
 * Debug script for executionTicker loading issue
 * קוד ניטור לבדיקת בעיית טעינת executionTicker
 * 
 * Run in console: debugExecutionTickerLoading()
 */

window.debugExecutionTickerLoading = async function() {
    console.log('🔍 ===== DEBUG: ExecutionTicker Loading =====');
    console.log('📅 Start time:', new Date().toISOString());
    
    const report = {
        startTime: new Date().toISOString(),
        modalExists: false,
        selectExists: false,
        selectInitialState: null,
        populateSelectsCalled: false,
        populateSingleSelectCalled: false,
        tickerServiceAvailable: false,
        selectPopulatorAvailable: false,
        relevantTickers: null,
        allTickers: null,
        selectAfterPopulate: null,
        selectAfterModalShown: null,
        errors: [],
        timeline: []
    };
    
    // Helper to add timeline event
    const addTimeline = (event, data = {}) => {
        const entry = {
            time: new Date().toISOString(),
            event,
            ...data
        };
        report.timeline.push(entry);
        console.log(`⏱️ [${entry.time}] ${event}`, data);
    };
    
    try {
        // 1. Check if modal exists
        const modal = document.getElementById('executionsModal');
        report.modalExists = !!modal;
        addTimeline('Modal check', { exists: report.modalExists });
        
        if (!modal) {
            console.warn('⚠️ Modal executionsModal not found in DOM');
            report.errors.push('Modal not found');
            return report;
        }
        
        // 2. Check if select exists
        const select = modal.querySelector('#executionTicker');
        report.selectExists = !!select;
        addTimeline('Select check', { exists: report.selectExists });
        
        if (!select) {
            console.warn('⚠️ Select executionTicker not found in modal');
            report.errors.push('Select not found');
            return report;
        }
        
        // 3. Check initial state
        report.selectInitialState = {
            optionsCount: select.options.length,
            options: Array.from(select.options).map(opt => ({
                value: opt.value,
                text: opt.textContent
            })),
            value: select.value,
            innerHTML: select.innerHTML.substring(0, 100) // First 100 chars
        };
        addTimeline('Initial select state', report.selectInitialState);
        
        // 4. Check services availability
        report.tickerServiceAvailable = !!(window.tickerService && typeof window.tickerService.getTickersWithOpenOrClosedTradesAndPlans === 'function');
        report.selectPopulatorAvailable = !!(window.SelectPopulatorService && typeof window.SelectPopulatorService.populateTickersSelect === 'function');
        addTimeline('Services check', {
            tickerService: report.tickerServiceAvailable,
            selectPopulator: report.selectPopulatorAvailable
        });
        
        // 5. Try to get relevant tickers
        if (report.tickerServiceAvailable) {
            try {
                const relevantTickers = await window.tickerService.getTickersWithOpenOrClosedTradesAndPlans({
                    useCache: true
                });
                report.relevantTickers = {
                    count: relevantTickers.length,
                    tickers: relevantTickers.map(t => ({ id: t.id, symbol: t.symbol, name: t.name }))
                };
                addTimeline('Relevant tickers fetched', report.relevantTickers);
            } catch (error) {
                report.errors.push(`Error fetching relevant tickers: ${error.message}`);
                addTimeline('Error fetching relevant tickers', { error: error.message });
            }
        }
        
        // 6. Try to get all tickers
        if (report.selectPopulatorAvailable) {
            try {
                // Simulate what populateTickersSelect does
                const response = await fetch('/api/tickers/');
                if (response.ok) {
                    const data = await response.json();
                    const allTickers = data.data || data || [];
                    report.allTickers = {
                        count: allTickers.length,
                        tickers: allTickers.slice(0, 10).map(t => ({ id: t.id, symbol: t.symbol, name: t.name })) // First 10
                    };
                    addTimeline('All tickers fetched', report.allTickers);
                }
            } catch (error) {
                report.errors.push(`Error fetching all tickers: ${error.message}`);
                addTimeline('Error fetching all tickers', { error: error.message });
            }
        }
        
        // 7. Check select state after a delay (simulating modal shown)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        report.selectAfterPopulate = {
            optionsCount: select.options.length,
            options: Array.from(select.options).map(opt => ({
                value: opt.value,
                text: opt.textContent
            })),
            value: select.value
        };
        addTimeline('Select state after 500ms', report.selectAfterPopulate);
        
        // 8. Try to manually populate - BUT ONLY IF VALUE IS NOT PRESERVED
        // CRITICAL: Don't re-populate if the select was already initialized by initializeSpecialHandlers
        // This prevents clearing the value that was set by populateForm
        if (report.selectPopulatorAvailable && report.allTickers) {
            // Check if select was already initialized and value preserved
            const isAlreadyInitialized = select.dataset.specialHandlersInitialized === 'true';
            const isValuePreserved = select.dataset.valuePreserved === 'true';
            const preservedValue = select.dataset.preservedValue;
            
            if (isAlreadyInitialized && isValuePreserved && preservedValue) {
                console.log('⏭️ Skipping manual populate - select already initialized with preserved value', {
                    preservedValue: preservedValue,
                    currentValue: select.value
                });
                // Just report the current state without re-populating
                report.selectAfterModalShown = {
                    optionsCount: select.options.length,
                    options: Array.from(select.options).map(opt => ({
                        value: opt.value,
                        text: opt.textContent
                    })),
                    value: select.value,
                    skipped: true,
                    reason: 'Already initialized with preserved value'
                };
                addTimeline('Select state after modal shown (skipped manual populate)', report.selectAfterModalShown);
            } else {
                try {
                    // CRITICAL: Save current value before populating to preserve it
                    const currentValue = select.value || preservedValue;
                    console.log('🔄 Attempting manual population...', { 
                        currentValue, 
                        preservedValue,
                        willPreserve: !!currentValue,
                        isAlreadyInitialized,
                        isValuePreserved
                    });
                    await window.SelectPopulatorService.populateTickersSelect(select, {
                        includeEmpty: true,
                        defaultValue: currentValue // CRITICAL: Preserve current value
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    report.selectAfterModalShown = {
                        optionsCount: select.options.length,
                        options: Array.from(select.options).map(opt => ({
                            value: opt.value,
                            text: opt.textContent
                        })),
                        value: select.value
                    };
                    addTimeline('Select state after manual populate', report.selectAfterModalShown);
                } catch (error) {
                    report.errors.push(`Error in manual populate: ${error.message}`);
                    addTimeline('Error in manual populate', { error: error.message });
                }
            }
        } else {
            // No manual populate - just report current state
            report.selectAfterModalShown = {
                optionsCount: select.options.length,
                options: Array.from(select.options).map(opt => ({
                    value: opt.value,
                    text: opt.textContent
                })),
                value: select.value,
                skipped: true,
                reason: 'Conditions not met for manual populate'
            };
            addTimeline('Select state after modal shown (no manual populate)', report.selectAfterModalShown);
        }
        
        // 9. Compare with tradePlanTicker
        const tradePlanModal = document.getElementById('tradePlansModal');
        if (tradePlanModal) {
            const tradePlanTicker = tradePlanModal.querySelector('#tradePlanTicker');
            if (tradePlanTicker) {
                report.tradePlanTickerComparison = {
                    optionsCount: tradePlanTicker.options.length,
                    options: Array.from(tradePlanTicker.options).map(opt => ({
                        value: opt.value,
                        text: opt.textContent
                    })),
                    value: tradePlanTicker.value
                };
                addTimeline('TradePlanTicker comparison', report.tradePlanTickerComparison);
            }
        }
        
        // 10. Check ModalManagerV2 state
        if (window.ModalManagerV2) {
            const modalInfo = window.ModalManagerV2.getModalInfo?.('executionsModal');
            report.modalManagerState = {
                exists: !!modalInfo,
                isActive: modalInfo?.isActive,
                config: modalInfo?.config ? {
                    id: modalInfo.config.id,
                    entityType: modalInfo.config.entityType,
                    fieldsCount: modalInfo.config.fields?.length
                } : null
            };
            addTimeline('ModalManagerV2 state', report.modalManagerState);
        }
        
    } catch (error) {
        report.errors.push(`Fatal error: ${error.message}`);
        console.error('❌ Fatal error in debug:', error);
    }
    
    report.endTime = new Date().toISOString();
    report.duration = new Date(report.endTime) - new Date(report.startTime);
    
    console.log('📊 ===== DEBUG REPORT =====');
    console.log(JSON.stringify(report, null, 2));
    console.log('📊 ===== END REPORT =====');
    
    return report;
};

// Auto-run when modal is shown
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupModalWatcher();
    });
} else {
    setupModalWatcher();
}

function setupModalWatcher() {
    const modal = document.getElementById('executionsModal');
    if (modal) {
        // Watch for modal shown event
        modal.addEventListener('shown.bs.modal', async () => {
            console.log('🔍 Modal shown - running debug...');
            setTimeout(async () => {
                await window.debugExecutionTickerLoading();
            }, 1000); // Wait 1 second after modal shown
        }, { once: false });
        
        console.log('✅ Debug watcher set up for executionsModal');
    } else {
        console.warn('⚠️ executionsModal not found, cannot set up watcher');
    }
}

console.log('✅ Debug script loaded. Run debugExecutionTickerLoading() in console to test.');

