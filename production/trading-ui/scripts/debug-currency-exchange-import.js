/**
 * Currency Exchange Import Debug Tool
 * ====================================
 * 
 * כלי בדיקה לבדיקת רשומות המרות מטבע שנוצרו בייבוא
 * 
 * Usage:
 *   debugCurrencyExchangeImport() - בדיקת כל רשומות ה-exchange
 *   debugCurrencyExchangeImport(249, 250) - בדיקת רשומות ספציפיות
 *   debugCurrencyExchangeImport(null, null, 'exchange_c86981839c5f') - בדיקה לפי external_id
 */

/**
 * בדיקת רשומות המרות מטבע
 * 
 * @param {number|null} fromId - ID של רשומת FROM (או null לכל)
 * @param {number|null} toId - ID של רשומת TO (או null לכל)
 * @param {string|null} externalId - external_id של הזוג (או null לכל)
 */
async function debugCurrencyExchangeImport(fromId = null, toId = null, externalId = null) {
    console.group('🔍 Currency Exchange Import Debug');
    
    try {
        // Fetch all exchange cash flows
        const response = await fetch('/api/cash-flows');
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        const allCashFlows = data.data || [];
        
        // Filter exchange flows
        const exchangeFlows = allCashFlows.filter(cf => {
            const type = cf.type || '';
            const extId = cf.external_id || '';
            const isExchange = (
                type === 'currency_exchange_from' ||
                type === 'currency_exchange_to' ||
                extId.startsWith('exchange_')
            );
            
            // Apply filters
            if (fromId && cf.id === fromId) return true;
            if (toId && cf.id === toId) return true;
            if (externalId && cf.external_id === externalId) return true;
            if (fromId || toId || externalId) return false;
            
            return isExchange;
        });
        
        console.log(`📊 Found ${exchangeFlows.length} exchange-related cash flows`);
        
        // Group by external_id
        const exchangeGroups = {};
        exchangeFlows.forEach(cf => {
            const extId = cf.external_id || 'unpaired';
            if (!exchangeGroups[extId]) {
                exchangeGroups[extId] = { from: null, to: null, external_id: extId };
            }
            if (cf.type === 'currency_exchange_from') {
                exchangeGroups[extId].from = cf;
            } else if (cf.type === 'currency_exchange_to') {
                exchangeGroups[extId].to = cf;
            }
        });
        
        // Analyze each group
        const groups = Object.values(exchangeGroups);
        console.log(`\n📦 Found ${groups.length} exchange groups`);
        
        groups.forEach((group, idx) => {
            console.group(`\n${idx + 1}. Exchange Group: ${group.external_id}`);
            
            if (!group.from || !group.to) {
                console.warn('⚠️ Incomplete pair:', {
                    hasFrom: !!group.from,
                    hasTo: !!group.to
                });
                if (group.from) console.log('FROM:', group.from);
                if (group.to) console.log('TO:', group.to);
                console.groupEnd();
                return;
            }
            
            const from = group.from;
            const to = group.to;
            
            // Basic info
            console.log('📋 Basic Info:');
            console.table({
                'FROM ID': from.id,
                'TO ID': to.id,
                'External ID': from.external_id,
                'Source': from.source,
                'Date': from.date
            });
            
            // Currency info
            console.log('💱 Currency Info:');
            console.table({
                'FROM Currency': `${from.currency_symbol || 'N/A'} (ID: ${from.currency_id})`,
                'TO Currency': `${to.currency_symbol || 'N/A'} (ID: ${to.currency_id})`,
                'FROM Amount': from.amount,
                'TO Amount': to.amount,
                'Fee Amount': from.fee_amount || 0
            });
            
            // Calculations
            const fromAmountAbs = Math.abs(from.amount);
            const toAmountAbs = Math.abs(to.amount);
            const calculatedRate = fromAmountAbs > 0 ? toAmountAbs / fromAmountAbs : 0;
            
            console.log('🧮 Calculations:');
            console.table({
                'FROM Amount (abs)': fromAmountAbs,
                'TO Amount (abs)': toAmountAbs,
                'Calculated Rate': calculatedRate.toFixed(6),
                'Expected TO (FROM * Rate)': (fromAmountAbs * calculatedRate).toFixed(2),
                'Actual TO': toAmountAbs.toFixed(2),
                'Difference': Math.abs(toAmountAbs - (fromAmountAbs * calculatedRate)).toFixed(2)
            });
            
            // Validation
            const rateDiff = Math.abs(toAmountAbs - (fromAmountAbs * calculatedRate));
            const isValid = rateDiff < 0.01; // Allow small floating point differences
            
            console.log('✅ Validation:');
            console.table({
                'Rate Calculation Valid': isValid ? '✅ YES' : '❌ NO',
                'Amount Difference': rateDiff.toFixed(6),
                'FROM is Negative': from.amount < 0 ? '✅ YES' : '❌ NO',
                'TO is Positive': to.amount > 0 ? '✅ YES' : '❌ NO',
                'Same External ID': from.external_id === to.external_id ? '✅ YES' : '❌ NO',
                'Same Date': from.date === to.date ? '✅ YES' : '❌ NO'
            });
            
            // Compare with manual example (IDs 2+3)
            if (from.id === 2 && to.id === 3) {
                console.log('⭐ This is the MANUAL reference example (should be correct)');
            } else if (from.source === 'file_import' || to.source === 'file_import') {
                console.log('📥 This is an IMPORTED exchange (check against manual example)');
                
                // Fetch manual example for comparison
                const manualFrom = allCashFlows.find(cf => cf.id === 2);
                const manualTo = allCashFlows.find(cf => cf.id === 3);
                
                if (manualFrom && manualTo) {
                    console.log('\n📊 Comparison with Manual Example (IDs 2+3):');
                    const manualFromAbs = Math.abs(manualFrom.amount);
                    const manualToAbs = Math.abs(manualTo.amount);
                    const manualRate = manualFromAbs > 0 ? manualToAbs / manualFromAbs : 0;
                    
                    console.table({
                        'Metric': ['FROM Amount', 'TO Amount', 'Exchange Rate', 'Fee Amount'],
                        'Manual (2+3)': [
                            `${manualFromAbs} ${manualFrom.currency_symbol}`,
                            `${manualToAbs} ${manualTo.currency_symbol}`,
                            manualRate.toFixed(6),
                            manualFrom.fee_amount || 0
                        ],
                        'Imported': [
                            `${fromAmountAbs} ${from.currency_symbol}`,
                            `${toAmountAbs} ${to.currency_symbol}`,
                            calculatedRate.toFixed(6),
                            from.fee_amount || 0
                        ]
                    });
                }
            }
            
            console.groupEnd();
        });
        
        // Summary
        console.log('\n📊 Summary:');
        const completePairs = groups.filter(g => g.from && g.to).length;
        const incompletePairs = groups.length - completePairs;
        const importedPairs = groups.filter(g => 
            (g.from && g.from.source === 'file_import') || 
            (g.to && g.to.source === 'file_import')
        ).length;
        const manualPairs = groups.length - importedPairs;
        
        console.table({
            'Total Groups': groups.length,
            'Complete Pairs': completePairs,
            'Incomplete Pairs': incompletePairs,
            'Imported Pairs': importedPairs,
            'Manual Pairs': manualPairs
        });
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
    } finally {
        console.groupEnd();
    }
}

// Export to window for console access
window.debugCurrencyExchangeImport = debugCurrencyExchangeImport;

console.log('✅ Currency Exchange Import Debug Tool loaded');
console.log('💡 Usage: debugCurrencyExchangeImport() or debugCurrencyExchangeImport(fromId, toId, externalId)');

