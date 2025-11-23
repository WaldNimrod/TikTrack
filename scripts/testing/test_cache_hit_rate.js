/**
 * Cache Hit Rate Measurement Script
 * ==================================
 * 
 * This script measures the current cache hit rate for all Data Services
 * and Business Logic API calls to identify optimization opportunities.
 * 
 * Usage:
 *   Load this script in a browser console or test page
 *   Run: await testCacheHitRate()
 */

(async function testCacheHitRate() {
    'use strict';

    const results = {
        dataServices: {},
        businessLogic: {},
        overall: {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            hitRate: 0
        }
    };

    // Wait for systems to be ready
    if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
        console.warn('⚠️ UnifiedCacheManager not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
        console.error('❌ UnifiedCacheManager not available');
        return results;
    }

    console.log('📊 Starting Cache Hit Rate Measurement...\n');

    // Get initial stats
    const initialStats = window.UnifiedCacheManager.getStats();
    console.log('📈 Initial Cache Stats:', {
        hitRate: initialStats.performance?.hitRate || 0,
        totalRequests: initialStats.operations?.get || 0,
        hits: initialStats.performance?.hitRate ? 
            Math.round((initialStats.performance.hitRate / 100) * (initialStats.operations?.get || 0)) : 0
    });

    // Test Data Services
    const dataServices = [
        { name: 'TradesData', service: window.TradesData, key: 'trades-data' },
        { name: 'ExecutionsData', service: window.ExecutionsData, key: 'executions-data' },
        { name: 'AlertsData', service: window.AlertsData, key: 'alerts-data' },
        { name: 'CashFlowsData', service: window.CashFlowsData, key: 'cash-flows-data' },
        { name: 'NotesData', service: window.NotesData, key: 'notes-data' },
        { name: 'TradingAccountsData', service: window.TradingAccountsData, key: 'trading-accounts-data' },
        { name: 'TradePlansData', service: window.TradePlansData, key: 'trade-plans-data' },
        { name: 'TickersData', service: window.TickersData, key: 'tickers-data' }
    ];

    console.log('\n🔍 Testing Data Services...');
    for (const { name, service, key } of dataServices) {
        if (!service || !service.loadAll) {
            console.warn(`⚠️ ${name} not available`);
            continue;
        }

        try {
            const beforeStats = window.UnifiedCacheManager.getStats();
            const beforeHits = beforeStats.performance?.hitRate ? 
                Math.round((beforeStats.performance.hitRate / 100) * (beforeStats.operations?.get || 0)) : 0;
            const beforeRequests = beforeStats.operations?.get || 0;

            // First call (should be cache miss)
            const start1 = Date.now();
            await service.loadAll();
            const time1 = Date.now() - start1;

            // Second call (should be cache hit)
            const start2 = Date.now();
            await service.loadAll();
            const time2 = Date.now() - start2;

            const afterStats = window.UnifiedCacheManager.getStats();
            const afterHits = afterStats.performance?.hitRate ? 
                Math.round((afterStats.performance.hitRate / 100) * (afterStats.operations?.get || 0)) : 0;
            const afterRequests = afterStats.operations?.get || 0;

            const newRequests = afterRequests - beforeRequests;
            const newHits = afterHits - beforeHits;
            const hitRate = newRequests > 0 ? (newHits / newRequests) * 100 : 0;

            results.dataServices[name] = {
                firstCallTime: time1,
                secondCallTime: time2,
                cacheHit: time2 < time1 * 0.5, // Second call should be much faster
                hitRate: hitRate.toFixed(2) + '%',
                requests: newRequests,
                hits: newHits
            };

            console.log(`  ${name}: ${hitRate.toFixed(2)}% hit rate (${time1}ms → ${time2}ms)`);
        } catch (error) {
            console.error(`  ❌ ${name} error:`, error);
            results.dataServices[name] = { error: error.message };
        }
    }

    // Test Business Logic API calls
    console.log('\n🔍 Testing Business Logic API...');
    const businessLogicTests = [
        {
            name: 'calculateStopPrice',
            service: window.TradesData,
            method: 'calculateStopPrice',
            params: [100, 5, 'buy']
        },
        {
            name: 'calculateTargetPrice',
            service: window.TradesData,
            method: 'calculateTargetPrice',
            params: [100, 10, 'buy']
        },
        {
            name: 'validateExecution',
            service: window.ExecutionsData,
            method: 'validateExecution',
            params: [{
                trade_id: 1,
                price: 100,
                quantity: 10,
                status: 'completed'
            }]
        }
    ];

    for (const test of businessLogicTests) {
        if (!test.service || !test.service[test.method]) {
            console.warn(`⚠️ ${test.name} not available`);
            continue;
        }

        try {
            const beforeStats = window.UnifiedCacheManager.getStats();
            const beforeHits = beforeStats.performance?.hitRate ? 
                Math.round((beforeStats.performance.hitRate / 100) * (beforeStats.operations?.get || 0)) : 0;
            const beforeRequests = beforeStats.operations?.get || 0;

            // First call (should be cache miss)
            const start1 = Date.now();
            await test.service[test.method](...test.params);
            const time1 = Date.now() - start1;

            // Second call (should be cache hit)
            const start2 = Date.now();
            await test.service[test.method](...test.params);
            const time2 = Date.now() - start2;

            const afterStats = window.UnifiedCacheManager.getStats();
            const afterHits = afterStats.performance?.hitRate ? 
                Math.round((afterStats.performance.hitRate / 100) * (afterStats.operations?.get || 0)) : 0;
            const afterRequests = afterStats.operations?.get || 0;

            const newRequests = afterRequests - beforeRequests;
            const newHits = afterHits - beforeHits;
            const hitRate = newRequests > 0 ? (newHits / newRequests) * 100 : 0;

            results.businessLogic[test.name] = {
                firstCallTime: time1,
                secondCallTime: time2,
                cacheHit: time2 < time1 * 0.5,
                hitRate: hitRate.toFixed(2) + '%',
                requests: newRequests,
                hits: newHits
            };

            console.log(`  ${test.name}: ${hitRate.toFixed(2)}% hit rate (${time1}ms → ${time2}ms)`);
        } catch (error) {
            console.error(`  ❌ ${test.name} error:`, error);
            results.businessLogic[test.name] = { error: error.message };
        }
    }

    // Calculate overall stats
    const finalStats = window.UnifiedCacheManager.getStats();
    results.overall = {
        totalRequests: finalStats.operations?.get || 0,
        cacheHits: finalStats.performance?.hitRate ? 
            Math.round((finalStats.performance.hitRate / 100) * (finalStats.operations?.get || 0)) : 0,
        cacheMisses: (finalStats.operations?.get || 0) - (finalStats.performance?.hitRate ? 
            Math.round((finalStats.performance.hitRate / 100) * (finalStats.operations?.get || 0)) : 0),
        hitRate: parseFloat(finalStats.performance?.hitRate || 0)
    };

    // Summary
    console.log('\n📊 Cache Hit Rate Summary:');
    console.log('========================');
    console.log(`Overall Hit Rate: ${results.overall.hitRate.toFixed(2)}%`);
    console.log(`Total Requests: ${results.overall.totalRequests}`);
    console.log(`Cache Hits: ${results.overall.cacheHits}`);
    console.log(`Cache Misses: ${results.overall.cacheMisses}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (results.overall.hitRate < 80) {
        console.log('  ⚠️ Hit rate is below 80% target');
        console.log('  - Consider increasing TTL for frequently accessed data');
        console.log('  - Implement cache preloading for common operations');
        console.log('  - Review cache key generation for better reuse');
    } else {
        console.log('  ✅ Hit rate meets 80% target');
    }

    // Cache layer distribution
    if (finalStats.layers) {
        console.log('\n📦 Cache Layer Distribution:');
        Object.entries(finalStats.layers).forEach(([layer, stats]) => {
            console.log(`  ${layer}: ${stats.entries || 0} entries, ${(stats.size / 1024).toFixed(2)} KB`);
        });
    }

    return results;
})();

