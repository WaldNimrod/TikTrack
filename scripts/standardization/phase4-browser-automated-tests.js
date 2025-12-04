#!/usr/bin/env node
/**
 * Phase 4: Automated Browser Tests
 * בדיקות אוטומטיות בדפדפן לכל העמודים
 * 
 * Uses Playwright to test all pages automatically
 * 
 * Usage:
 *   node scripts/standardization/phase4-browser-automated-tests.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'documentation', '05-REPORTS');
const RESULTS_FILE = path.join(DOCS_DIR, 'STANDARDIZATION_PHASE_4_BROWSER_TEST_RESULTS.json');
const REPORT_FILE = path.join(DOCS_DIR, 'STANDARDIZATION_PHASE_4_BROWSER_TEST_REPORT.md');

// Read pages from test results
function getPagesToTest() {
    const resultsFile = path.join(DOCS_DIR, 'STANDARDIZATION_PHASE_4_TEST_RESULTS.json');
    if (!fs.existsSync(resultsFile)) {
        return [];
    }
    
    const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    const pages = [];
    
    for (const result of data.results || []) {
        if (result.html_exists || result.js_exists) {
            pages.push({
                name: result.page,
                html_exists: result.html_exists,
                js_exists: result.js_exists,
                url: `${BASE_URL}/trading-ui/${result.page}.html`
            });
        }
    }
    
    return pages;
}

async function testPage(browser, pageInfo) {
    const page = await browser.newPage();
    const result = {
        page: pageInfo.name,
        url: pageInfo.url,
        timestamp: new Date().toISOString(),
        passed: false,
        errors: [],
        warnings: [],
        consoleErrors: [],
        consoleWarnings: [],
        loadTime: 0,
        tests: {}
    };
    
    try {
        console.log(`\n🔍 Testing: ${pageInfo.name}`);
        
        // Set up console message listeners
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                result.consoleErrors.push(text);
            } else if (type === 'warning') {
                result.consoleWarnings.push(text);
            }
        });
        
        // Set up page error listeners
        page.on('pageerror', error => {
            result.errors.push(error.message);
        });
        
        // Navigate to page
        const startTime = Date.now();
        try {
            await page.goto(pageInfo.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            result.loadTime = Date.now() - startTime;
        } catch (error) {
            result.errors.push(`Failed to load page: ${error.message}`);
            await page.close();
            return result;
        }
        
        // Wait for page to be ready
        await page.waitForTimeout(2000);
        
        // Test 1: Check for console errors
        result.tests.consoleErrors = {
            passed: result.consoleErrors.length === 0,
            count: result.consoleErrors.length,
            messages: result.consoleErrors
        };
        
        // Test 2: Check for required globals
        const requiredGlobals = await page.evaluate(() => {
            const globals = [
                'window.UnifiedAppInitializer',
                'window.NotificationSystem',
                'window.Logger'
            ];
            const found = {};
            for (const global of globals) {
                try {
                    found[global] = eval(`typeof ${global} !== 'undefined'`);
                } catch (e) {
                    found[global] = false;
                }
            }
            return found;
        });
        
        result.tests.requiredGlobals = {
            passed: Object.values(requiredGlobals).every(v => v),
            globals: requiredGlobals
        };
        
        // Test 3: Check page structure
        const pageStructure = await page.evaluate(() => {
            return {
                hasHeader: !!document.getElementById('unified-header'),
                hasBody: !!document.body,
                hasMainContent: !!document.querySelector('.main-content, .page-body, main')
            };
        });
        
        result.tests.pageStructure = {
            passed: pageStructure.hasBody && (pageStructure.hasHeader || pageStructure.hasMainContent),
            structure: pageStructure
        };
        
        // Test 4: Check for critical errors in page
        const criticalErrors = await page.evaluate(() => {
            const errors = [];
            // Check for common error patterns
            const errorElements = document.querySelectorAll('.error, .alert-danger, [class*="error"]');
            if (errorElements.length > 0) {
                errors.push(`Found ${errorElements.length} error elements`);
            }
            return errors;
        });
        
        result.tests.criticalErrors = {
            passed: criticalErrors.length === 0,
            errors: criticalErrors
        };
        
        // Overall result
        result.passed = (
            result.tests.consoleErrors.passed &&
            result.tests.requiredGlobals.passed &&
            result.tests.pageStructure.passed &&
            result.tests.criticalErrors.passed &&
            result.errors.length === 0
        );
        
        if (result.passed) {
            console.log(`  ✅ PASSED`);
        } else {
            console.log(`  ❌ FAILED`);
            if (result.consoleErrors.length > 0) {
                console.log(`    Console errors: ${result.consoleErrors.length}`);
            }
            if (result.errors.length > 0) {
                console.log(`    Page errors: ${result.errors.length}`);
            }
        }
        
    } catch (error) {
        result.errors.push(`Test error: ${error.message}`);
        console.log(`  ❌ ERROR: ${error.message}`);
    } finally {
        await page.close();
    }
    
    return result;
}

async function main() {
    console.log('='.repeat(70));
    console.log('Phase 4: Automated Browser Tests');
    console.log('='.repeat(70));
    
    // Check server
    console.log('\n🔍 Checking server...');
    try {
        const http = require('http');
        const url = require('url');
        const parsedUrl = url.parse(BASE_URL);
        
        await new Promise((resolve, reject) => {
            const req = http.get({
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 8080,
                path: '/',
                timeout: 5000
            }, (res) => {
                if (res.statusCode === 200 || res.statusCode === 404) {
                    resolve();
                } else {
                    reject(new Error(`Server returned ${res.statusCode}`));
                }
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Server check timeout'));
            });
        });
        
        console.log(`✅ Server is running on ${BASE_URL}\n`);
    } catch (error) {
        console.error(`❌ Server is not running on ${BASE_URL}`);
        console.error('Please start the server with: ./start_server.sh');
        process.exit(1);
    }
    
    // Get pages to test
    const pages = getPagesToTest();
    console.log(`📋 Found ${pages.length} pages to test\n`);
    
    if (pages.length === 0) {
        console.log('⚠️  No pages found to test');
        process.exit(0);
    }
    
    // Launch browser
    console.log('🚀 Launching browser...');
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        totalPages: pages.length,
        results: []
    };
    
    // Test each page
    for (let i = 0; i < pages.length; i++) {
        const pageInfo = pages[i];
        console.log(`[${i + 1}/${pages.length}]`);
        
        try {
            const result = await testPage(browser, pageInfo);
            results.results.push(result);
        } catch (error) {
            console.log(`  ❌ ERROR: ${error.message}`);
            results.results.push({
                page: pageInfo.name,
                url: pageInfo.url,
                timestamp: new Date().toISOString(),
                passed: false,
                errors: [error.message]
            });
        }
    }
    
    // Close browser
    await browser.close();
    
    // Calculate summary
    const passed = results.results.filter(r => r.passed).length;
    const failed = results.results.filter(r => !r.passed).length;
    const totalErrors = results.results.reduce((sum, r) => sum + (r.consoleErrors?.length || 0), 0);
    
    results.summary = {
        passed,
        failed,
        totalErrors,
        passRate: ((passed / results.totalPages) * 100).toFixed(1) + '%'
    };
    
    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n✅ Results saved to: ${RESULTS_FILE}`);
    
    // Generate markdown report
    generateMarkdownReport(results, REPORT_FILE);
    console.log(`✅ Report saved to: ${REPORT_FILE}`);
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Summary');
    console.log('='.repeat(70));
    console.log(`Total pages: ${results.totalPages}`);
    console.log(`Passed: ${passed} (${results.summary.passRate})`);
    console.log(`Failed: ${failed}`);
    console.log(`Total console errors: ${totalErrors}`);
    
    // Exit with error code if any tests failed
    if (failed > 0) {
        process.exit(1);
    }
}

function generateMarkdownReport(results, outputFile) {
    const lines = [
        '# דוח בדיקות אוטומטיות בדפדפן - שלב 4',
        '',
        `**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}`,
        `**סה"כ עמודים נבדקים:** ${results.totalPages}`,
        '',
        '---',
        '',
        '## 📊 סיכום כללי',
        '',
        `- **סה"כ עמודים:** ${results.totalPages}`,
        `- **עברו בהצלחה:** ${results.summary.passed} (${results.summary.passRate})`,
        `- **נכשלו:** ${results.summary.failed}`,
        `- **סה"כ שגיאות קונסולה:** ${results.summary.totalErrors}`,
        '',
        '---',
        '',
        '## 📋 תוצאות מפורטות',
        '',
        '| עמוד | URL | עבר | שגיאות קונסולה | זמן טעינה | מבנה עמוד | גלובלים |',
        '|------|-----|-----|-----------------|------------|------------|----------|'
    ];
    
    for (const result of results.results) {
        const passed = result.passed ? '✅' : '❌';
        const consoleErrors = result.consoleErrors?.length || 0;
        const loadTime = result.loadTime ? `${(result.loadTime / 1000).toFixed(1)}s` : 'N/A';
        const structure = result.tests?.pageStructure?.passed ? '✅' : '❌';
        const globals = result.tests?.requiredGlobals?.passed ? '✅' : '❌';
        
        lines.push(`| ${result.page} | ${result.url} | ${passed} | ${consoleErrors} | ${loadTime} | ${structure} | ${globals} |`);
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 📝 הערות');
    lines.push('');
    lines.push('- ✅ = עבר בהצלחה');
    lines.push('- ❌ = נכשל');
    lines.push('- שגיאות קונסולה = מספר שגיאות JavaScript בקונסולה');
    lines.push('- זמן טעינה = זמן טעינת העמוד במילישניות');
    
    fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { testPage, getPagesToTest };

