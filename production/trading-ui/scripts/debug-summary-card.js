/**
 * Debug script for monitoring summary card updates
 * Copy this to browser console to monitor summary card behavior
 */

(function() {
    'use strict';
    
    console.log('🔍 Summary Card Debug Monitor Started');
    
    // Monitor InvestmentCalculationService
    const originalBindForm = window.InvestmentCalculationService?.bindForm;
    if (originalBindForm) {
        window.InvestmentCalculationService.bindForm = function(...args) {
            console.log('🔵 bindForm called', {
                modalElement: args[0]?.id,
                config: args[1],
                skipInitialSummaryUpdate: args[1]?.skipInitialSummaryUpdate
            });
            const result = originalBindForm.apply(this, args);
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    console.log('✅ bindForm completed');
                }).catch(err => {
                    console.error('❌ bindForm error:', err);
                });
            }
            return result;
        };
    }
    
    const originalResync = window.InvestmentCalculationService?.resync;
    if (originalResync) {
        window.InvestmentCalculationService.resync = function(...args) {
            console.log('🟢 resync called', {
                modalElement: args[0]?.id,
                options: args[1]
            });
            
            // Log field values before resync
            const modalElement = args[0];
            if (modalElement) {
                const fields = {
                    price: modalElement.querySelector('#tradePlanEntryPrice, #tradeEntryPrice')?.value,
                    quantity: modalElement.querySelector('#tradePlanQuantity, #tradeQuantity')?.value,
                    amount: modalElement.querySelector('#planAmount, #tradeTotalInvestment')?.value,
                    stop: modalElement.querySelector('#tradePlanStopLoss, #tradeStopLoss')?.value,
                    target: modalElement.querySelector('#tradePlanTakeProfit, #tradeTakeProfit')?.value,
                    side: modalElement.querySelector('#tradePlanSide, #tradeSide')?.value,
                    ticker: modalElement.querySelector('#tradePlanTicker, #tradeTicker')?.value
                };
                console.log('📋 Field values before resync:', fields);
            }
            
            const result = originalResync.apply(this, args);
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    console.log('✅ resync completed');
                    
                    // Log summary card content after resync
                    if (modalElement) {
                        const summaryCard = modalElement.querySelector('#tradePlanRiskSummaryCard, #tradeRiskSummaryCard');
                        if (summaryCard) {
                            const riskRewardDiv = summaryCard.querySelector('.risk-summary-card__risk-reward');
                            if (riskRewardDiv) {
                                console.log('📊 Summary card content:', riskRewardDiv.innerHTML);
                            } else {
                                console.warn('⚠️ risk-reward div not found');
                            }
                        } else {
                            console.warn('⚠️ Summary card element not found');
                        }
                    }
                }).catch(err => {
                    console.error('❌ resync error:', err);
                });
            }
            return result;
        };
    }
    
    // Monitor computeSummaryData
    const originalUpdateSummary = window.InvestmentCalculationService?._updateSummary;
    
    // Helper function to check summary card
    window.checkSummaryCard = function(modalId = 'tradePlansModal') {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`❌ Modal ${modalId} not found`);
            return;
        }
        
        console.log('🔍 Checking summary card for', modalId);
        
        // Get field values
        const fields = {
            price: modalElement.querySelector('#tradePlanEntryPrice, #tradeEntryPrice')?.value,
            quantity: modalElement.querySelector('#tradePlanQuantity, #tradeQuantity')?.value,
            amount: modalElement.querySelector('#planAmount, #tradeTotalInvestment')?.value,
            stop: modalElement.querySelector('#tradePlanStopLoss, #tradeStopLoss')?.value,
            target: modalElement.querySelector('#tradePlanTakeProfit, #tradeTakeProfit')?.value,
            side: modalElement.querySelector('#tradePlanSide, #tradeSide')?.value,
            ticker: modalElement.querySelector('#tradePlanTicker, #tradeTicker')?.value
        };
        console.log('📋 Field values:', fields);
        
        // Check summary card
        const summaryCard = modalElement.querySelector('#tradePlanRiskSummaryCard, #tradeRiskSummaryCard');
        if (summaryCard) {
            console.log('✅ Summary card element found');
            const riskRewardDiv = summaryCard.querySelector('.risk-summary-card__risk-reward');
            if (riskRewardDiv) {
                console.log('📊 Summary card HTML:', riskRewardDiv.innerHTML);
                
                // Extract values
                const riskSpan = riskRewardDiv.querySelector('.risk-summary-card__risk-reward-row span:first-child');
                const rewardSpan = riskRewardDiv.querySelector('.risk-summary-card__risk-reward-row span:last-child');
                const ratioDiv = riskRewardDiv.querySelector('.risk-summary-card__risk-reward-ratio');
                
                console.log('📊 Extracted values:', {
                    risk: riskSpan?.textContent,
                    reward: rewardSpan?.textContent,
                    ratio: ratioDiv?.textContent
                });
            } else {
                console.warn('⚠️ risk-reward div not found in summary card');
            }
        } else {
            console.error('❌ Summary card element not found');
        }
        
        // Try to manually trigger update
        if (window.InvestmentCalculationService && typeof window.InvestmentCalculationService.resync === 'function') {
            console.log('🔄 Attempting manual resync...');
            window.InvestmentCalculationService.resync(modalElement, { force: true }).then(() => {
                console.log('✅ Manual resync completed');
                // Check again
                setTimeout(() => {
                    const riskRewardDiv = summaryCard?.querySelector('.risk-summary-card__risk-reward');
                    if (riskRewardDiv) {
                        console.log('📊 Summary card HTML after manual resync:', riskRewardDiv.innerHTML);
                    }
                }, 100);
            });
        }
    };
    
    console.log('✅ Debug monitor installed. Use checkSummaryCard() to check summary card state.');
    console.log('   Example: checkSummaryCard("tradePlansModal") or checkSummaryCard("tradesModal")');
    
})();

