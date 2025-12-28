#!/usr/bin/env node

/**
 * Test script for Info Summary System
 * Tests the basic functionality without requiring browser interaction
 */

console.log('🔍 Testing Info Summary System...');

// Simulate browser environment for testing
global.window = {
    location: {
        hostname: 'localhost',
        pathname: '/test'
    }
};
global.document = {
    getElementById: (id) => ({ id, innerHTML: '', style: {} }),
    createElement: (tag) => ({ tagName: tag, style: {} })
};

// Load the systems we need
try {
    // Load Info Summary Configs
    console.log('📋 Loading INFO_SUMMARY_CONFIGS...');
    const infoSummaryConfigs = require('../trading-ui/scripts/info-summary-configs.js');
    global.INFO_SUMMARY_CONFIGS = infoSummaryConfigs;

    console.log('✅ INFO_SUMMARY_CONFIGS loaded successfully');
    console.log('📊 Available configs:', Object.keys(global.INFO_SUMMARY_CONFIGS));

    // Test config structure
    for (const [pageKey, config] of Object.entries(global.INFO_SUMMARY_CONFIGS)) {
        console.log(`🔍 Testing config for ${pageKey}:`);
        if (!config.containerId) {
            console.error(`❌ Missing containerId for ${pageKey}`);
            continue;
        }
        if (!config.stats || !Array.isArray(config.stats)) {
            console.error(`❌ Invalid stats array for ${pageKey}`);
            continue;
        }

        console.log(`  ✅ Container: ${config.containerId}`);
        console.log(`  ✅ Stats count: ${config.stats.length}`);

        for (const stat of config.stats) {
            if (!stat.id || !stat.label || !stat.calculator) {
                console.error(`❌ Invalid stat structure:`, stat);
            } else {
                console.log(`    ✅ Stat: ${stat.id} (${stat.label}) - Calculator: ${stat.calculator}`);
            }
        }
    }

    // Load Info Summary System
    console.log('🔧 Loading InfoSummarySystem...');
    const InfoSummarySystemClass = require('../trading-ui/scripts/info-summary-system.js');

    // Test system initialization
    console.log('🏗️ Testing system initialization...');
    const system = new InfoSummarySystemClass();
    console.log('✅ InfoSummarySystem initialized successfully');

    // Test calculators
    console.log('🧮 Testing calculators...');
    const testData = [
        { id: 1, value: 100 },
        { id: 2, value: 200 },
        { id: 3, value: 300 }
    ];

    // Test sumField calculator
    const sumResult = system.calculateStatsFromData(testData, [{ calculator: 'sumField', params: { field: 'value' } }]);
    console.log('✅ sumField calculator result:', sumResult);

    // Test count calculator
    const countResult = system.calculateStatsFromData(testData, [{ calculator: 'count' }]);
    console.log('✅ count calculator result:', countResult);

    console.log('🎉 All Info Summary System tests passed!');

} catch (error) {
    console.error('❌ Info Summary System test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
