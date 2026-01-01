#!/usr/bin/env node
/**
 * Direct Registry Suite Runner - Team D QA Validation
 * Runs the Registry Suite directly via Node.js without browser
 */

const http = require('http');
const https = require('https');

// Mock browser environment for running tests
global.window = {
    location: { hostname: 'localhost', port: '8080', protocol: 'http:' },
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    addEventListener: () => {},
    removeEventListener: () => {},
    fetch: (url, options) => {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            const req = protocol.request(url, {
                method: options?.method || 'GET',
                headers: options?.headers || {}
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(JSON.parse(data))
                    });
                });
            });
            req.on('error', reject);
            if (options?.body) {
                req.write(options.body);
            }
            req.end();
        });
    }
};

global.document = {
    createElement: () => ({}),
    querySelector: () => null,
    addEventListener: () => {}
};

// Load the registry and orchestrator
try {
    console.log('🔧 Loading test registry...');
    const registryPath = './trading-ui/scripts/test-registry.js';
    const orchestratorPath = './trading-ui/scripts/testing/test-orchestrator.js';
    const relevancyPath = './trading-ui/scripts/test-relevancy-rules.js';

    // Mock require for loading JS files
    const fs = require('fs');
    const vm = require('vm');

    // Load registry
    const registryCode = fs.readFileSync(registryPath, 'utf8');
    const registryContext = vm.createContext({
        TEST_REGISTRY: [],
        console: console,
        window: global.window,
        document: global.document
    });
    vm.runInContext(registryCode, registryContext);
    const registry = registryContext.TEST_REGISTRY;

    console.log(`✅ Loaded ${registry.length} tests from registry`);

    // Load relevancy rules
    const relevancyCode = fs.readFileSync(relevancyPath, 'utf8');
    const relevancyContext = vm.createContext({
        console: console,
        window: global.window,
        document: global.document,
        TEST_REGISTRY: registry
    });
    vm.runInContext(relevancyCode, relevancyContext);

    // Load orchestrator
    const orchestratorCode = fs.readFileSync(orchestratorPath, 'utf8');
    const orchestratorContext = vm.createContext({
        console: console,
        window: global.window,
        document: global.document,
        TEST_REGISTRY: registry,
        TestRelevancyRules: relevancyContext.TestRelevancyRules
    });

    vm.runInContext(orchestratorCode, orchestratorContext);

    console.log('✅ Test systems loaded');

    // Run a simple test to verify
    console.log('🎯 Running basic registry check...');
    console.log(`Registry contains ${registry.length} tests`);
    console.log('Sample test:', registry[0]?.name || 'No tests found');

    // Generate report
    const results = {
        timestamp: new Date().toISOString(),
        environment: 'direct-node',
        status: registry.length > 0 ? 'loaded' : 'failed',
        summary: {
            totalTests: registry.length,
            categories: {}
        },
        registry: registry.map(test => ({
            id: test.id,
            name: test.name,
            category: test.category,
            page: test.page,
            relevance: test.relevance
        }))
    };

    // Count by category
    registry.forEach(test => {
        results.summary.categories[test.category] = (results.summary.categories[test.category] || 0) + 1;
    });

    console.log('\n📊 REGISTRY ANALYSIS:');
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log('Categories:', results.summary.categories);

    // Save results
    fs.writeFileSync('registry_direct_report.json', JSON.stringify(results, null, 2));
    console.log('💾 Report saved to registry_direct_report.json');

} catch (error) {
    console.error('❌ Error loading registry:', error.message);
    process.exit(1);
}
