/**
 * Debug Script for Watch Lists Data Loading
 * 
 * Run this in the browser console when you have items in a watch list
 * to debug why ticker data is not showing.
 * 
 * Usage:
 * 1. Open watch_list.html
 * 2. Select a list with items
 * 3. Run this script in console
 */

(function() {
    'use strict';

    async function debugWatchListsData() {
        console.log('🔍 ===== WATCH LISTS DATA DEBUG =====');
        
        // 1. Check if WatchListsPage is loaded
        if (!window.WatchListsPage) {
            console.error('❌ window.WatchListsPage not available');
            return;
        }
        console.log('✅ WatchListsPage is available');
        
        // 2. Check current state
        const activeListId = window.WatchListsPage.activeListId;
        const activeListItems = window.WatchListsPage.activeListItems || [];
        
        console.log('\n📊 Current State:');
        console.log('  - Active List ID:', activeListId);
        console.log('  - Active List Items Count:', activeListItems.length);
        
        if (activeListItems.length === 0) {
            console.warn('⚠️ No items in active list. Please select a list with items first.');
            console.log('\n💡 Available lists:');
            const lists = window.WatchListsPage.watchListsData || [];
            lists.forEach(list => {
                console.log(`  - ${list.name} (ID: ${list.id}, Items: ${list.item_count})`);
            });
            return;
        }
        
        // 3. Check first item structure
        console.log('\n📦 First Item Structure:');
        const firstItem = activeListItems[0];
        console.log('  - Item ID:', firstItem.id);
        console.log('  - Ticker ID:', firstItem.ticker_id);
        console.log('  - Has Ticker Object:', !!firstItem.ticker);
        console.log('  - Ticker Keys:', firstItem.ticker ? Object.keys(firstItem.ticker) : 'N/A');
        
        if (firstItem.ticker) {
            console.log('\n📈 Ticker Data:');
            const ticker = firstItem.ticker;
            console.log('  - Symbol:', ticker.symbol);
            console.log('  - Name:', ticker.name);
            console.log('  - Current Price:', ticker.current_price);
            console.log('  - Price:', ticker.price);
            console.log('  - Change:', ticker.change);
            console.log('  - Change %:', ticker.change_percent);
            console.log('  - ATR:', ticker.atr);
            console.log('  - ATR %:', ticker.atr_percent);
            console.log('  - Position:', ticker.position);
            console.log('  - P/L:', ticker.profit_loss);
            console.log('  - P/L %:', ticker.profit_loss_percent);
            
            // Check all numeric fields
            console.log('\n🔢 Numeric Fields Check:');
            const numericFields = [
                'current_price', 'price', 'change', 'change_amount',
                'change_percent', 'change_percentage',
                'daily_change_percent', 'daily_change_percentage',
                'atr', 'atr_percent',
                'profit_loss', 'pl',
                'profit_loss_percent', 'pl_percent'
            ];
            numericFields.forEach(field => {
                const value = ticker[field];
                const isValid = value !== null && value !== undefined && !isNaN(parseFloat(value));
                console.log(`  - ${field}:`, value, isValid ? '✅' : '❌');
            });
        } else {
            console.warn('⚠️ No ticker object found in item');
        }
        
        // 4. Manually call enrichWatchListItemsWithTickerData
        console.log('\n🔄 Testing enrichWatchListItemsWithTickerData...');
        try {
            const enrichedItems = await window.WatchListsPage.enrichWatchListItemsWithTickerData(activeListItems);
            console.log('✅ Enrichment completed');
            console.log('  - Enriched Items Count:', enrichedItems.length);
            
            if (enrichedItems.length > 0) {
                const enrichedItem = enrichedItems[0];
                console.log('\n📈 Enriched Item Ticker Data:');
                if (enrichedItem.ticker) {
                    const ticker = enrichedItem.ticker;
                    console.log('  - Symbol:', ticker.symbol);
                    console.log('  - Current Price:', ticker.current_price);
                    console.log('  - Change %:', ticker.change_percent);
                    console.log('  - ATR:', ticker.atr);
                    console.log('  - Position:', ticker.position);
                    console.log('  - P/L:', ticker.profit_loss);
                    
                    // Check if data is actually populated
                    const hasPriceData = ticker.current_price !== null && ticker.current_price !== undefined;
                    const hasChangeData = ticker.change_percent !== null && ticker.change_percent !== undefined;
                    const hasPositionData = ticker.position !== null && ticker.position !== undefined;
                    
                    console.log('\n✅ Data Availability:');
                    console.log('  - Price Data:', hasPriceData ? '✅' : '❌');
                    console.log('  - Change Data:', hasChangeData ? '✅' : '❌');
                    console.log('  - Position Data:', hasPositionData ? '✅' : '❌');
                } else {
                    console.warn('⚠️ No ticker object in enriched item');
                }
            }
        } catch (error) {
            console.error('❌ Error during enrichment:', error);
            console.error('Stack:', error.stack);
        }
        
        // 5. Check FieldRendererService
        console.log('\n🎨 FieldRendererService Check:');
        const hasFieldRenderer = !!window.FieldRendererService;
        console.log('  - Available:', hasFieldRenderer ? '✅' : '❌');
        if (hasFieldRenderer) {
            console.log('  - renderAmount:', typeof window.FieldRendererService.renderAmount);
            console.log('  - renderNumericValue:', typeof window.FieldRendererService.renderNumericValue);
            console.log('  - renderATR:', typeof window.FieldRendererService.renderATR);
            console.log('  - renderSide:', typeof window.FieldRendererService.renderSide);
        }
        
        // 6. Check table rendering
        console.log('\n📊 Table Rendering Check:');
        const table = document.querySelector('#watchListItemsTable tbody');
        if (table) {
            const rows = Array.from(table.querySelectorAll('tr[data-item-id]'));
            console.log('  - Table Found: ✅');
            console.log('  - Rows Count:', rows.length);
            
            if (rows.length > 0) {
                const firstRow = rows[0];
                const cells = Array.from(firstRow.querySelectorAll('td'));
                console.log('  - Cells Count:', cells.length);
                
                // Check each cell
                cells.forEach((cell, idx) => {
                    const text = cell.textContent.trim();
                    const isEmpty = text === '' || text === '-' || text === 'לא זמין';
                    console.log(`  - Cell ${idx}:`, text.substring(0, 50), isEmpty ? '⚠️ Empty' : '✅');
                });
            } else {
                console.warn('  - No rows found in table');
            }
        } else {
            console.error('  - Table not found');
        }
        
        // 7. Test entityDetailsAPI
        if (firstItem.ticker_id && window.entityDetailsAPI) {
            console.log('\n🔌 Testing entityDetailsAPI.getEntityDetails...');
            try {
                const details = await window.entityDetailsAPI.getEntityDetails('ticker', firstItem.ticker_id, {
                    includeMarketData: true,
                    includeLinkedItems: false,
                    forceRefresh: false
                });
                console.log('✅ Entity Details Retrieved:');
                console.log('  - Symbol:', details.symbol);
                console.log('  - Current Price:', details.current_price);
                console.log('  - Change %:', details.change_percent);
                console.log('  - ATR:', details.atr);
                console.log('  - Position:', details.position);
                console.log('  - All Keys:', Object.keys(details).slice(0, 20));
            } catch (error) {
                console.error('❌ Error fetching entity details:', error);
            }
        }
        
        // 8. Test positions API
        console.log('\n🔌 Testing Positions API...');
        try {
            const response = await fetch('/api/positions/portfolio?unify_accounts=true');
            if (response.ok) {
                const positions = await response.json();
                console.log('✅ Positions Retrieved:');
                console.log('  - Total Positions:', positions.length);
                if (positions.length > 0) {
                    console.log('  - First Position:', {
                        ticker_id: positions[0].ticker_id,
                        quantity: positions[0].quantity,
                        side: positions[0].side
                    });
                    
                    // Find position for first item's ticker
                    const itemPosition = positions.find(p => p.ticker_id === firstItem.ticker_id);
                    if (itemPosition) {
                        console.log('  - Position for Item Ticker:', itemPosition);
                    } else {
                        console.log('  - No position found for item ticker');
                    }
                }
            } else {
                console.error('❌ Positions API Error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Error fetching positions:', error);
        }
        
        console.log('\n✅ ===== DEBUG COMPLETE =====');
    }
    
    // Export to window
    window.debugWatchListsData = debugWatchListsData;
    
    // Auto-run if items exist
    if (window.WatchListsPage && window.WatchListsPage.activeListItems && window.WatchListsPage.activeListItems.length > 0) {
        console.log('🔍 Auto-running debug script...');
        debugWatchListsData();
    } else {
        console.log('💡 Run window.debugWatchListsData() in console after selecting a list with items');
    }
})();









