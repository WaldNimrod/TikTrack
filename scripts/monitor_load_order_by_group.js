#!/usr/bin/env node

/**
 * Load Order Monitoring by QA Group - TikTrack
 * Monitors load-order discipline for Option 1 compliance per QA group
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const QA_GROUPS = {
    'group_1_auth_pages': ['/login', '/register', '/forgot_password', '/reset_password'],
    'group_2_core_user_pages': ['/', '/trades', '/executions', '/alerts', '/preferences'],
    'group_3_management_tools': ['/cache_management', '/chart_management', '/code_quality_dashboard', '/css_management'],
    'group_4_crud_operations': ['/crud_testing_dashboard', '/user_profile', '/user_management', '/tag_management']
};

// Option 1 Compliance: ModalManagerV2 not required (redirect-only flow)
const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.TikTrackAuth'
];

// Conditional globals that depend on loaded systems
const CONDITIONAL_GLOBALS = {
    'window.UnifiedAppInitializer': 'core-systems/init-system',
    'window.ModalManagerV2': null  // Not required in Option 1
};

async function monitorGroup(groupName) {
    const pages = QA_GROUPS[groupName];
    if (!pages) {
        throw new Error(`Unknown group: ${groupName}`);
    }

    console.log(`\n🔍 Monitoring Group: ${groupName}`);
    console.log(`📄 Pages: ${pages.join(', ')}`);
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const groupResults = {
        group: groupName,
        timestamp: new Date().toISOString(),
        pages_tested: pages.length,
        violations_found: 0,
        pages_with_violations: [],
        detailed_results: []
    };

    for (const pageUrl of pages) {
        console.log(`\n  📊 Testing: ${pageUrl}`);
        
        const page = await browser.newPage();
        const pageResult = {
            page: pageUrl,
            html_scripts: 0,
            dom_scripts: 0,
            requiredGlobals_missing: [],
            load_order: 'OK',
            errors: [],
            status: 'UNKNOWN'
        };

        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`    ❌ CONSOLE ERROR [${pageUrl}]: ${msg.text()}`);
                pageResult.errors.push(msg.text());
            }
        });

        try {
            // Navigate to page
            await page.goto(`http://localhost:8080${pageUrl}`, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Wait for scripts to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check script counts
            const scripts = await page.$$eval('script', scripts => scripts.length);
            pageResult.html_scripts = scripts;

            // Check required globals
            for (const globalCheck of REQUIRED_GLOBALS) {
                try {
                    const exists = await page.evaluate(globalCheck => {
                        try {
                            return eval(globalCheck) !== undefined;
                        } catch (e) {
                            return false;
                        }
                    }, globalCheck);
                    
                    if (!exists) {
                        pageResult.requiredGlobals_missing.push(globalCheck);
                    }
                } catch (e) {
                    pageResult.requiredGlobals_missing.push(globalCheck);
                }
            }

            // Check conditional globals
            for (const [globalCheck, dependency] of Object.entries(CONDITIONAL_GLOBALS)) {
                if (dependency) {
                    // Check if dependency system is loaded first
                    try {
                        const dependencyLoaded = await page.evaluate(dependency => {
                            // Check if any script with this dependency name is loaded
                            const scripts = Array.from(document.querySelectorAll('script[src]'));
                            return scripts.some(script => script.src.includes(dependency));
                        }, dependency);

                        if (dependencyLoaded) {
                            // Dependency loaded, check if global exists
                            const exists = await page.evaluate(globalCheck => {
                                try {
                                    return eval(globalCheck) !== undefined;
                                } catch (e) {
                                    return false;
                                }
                            }, globalCheck);

                            if (!exists) {
                                pageResult.requiredGlobals_missing.push(`${globalCheck} (required because ${dependency} is loaded)`);
                                console.log(`    ⚠️  MISSING CONDITIONAL GLOBAL [${pageUrl}]: ${globalCheck} (required because ${dependency} is loaded)`);
                            }
                        } else {
                            // Dependency not loaded, global not required
                            console.log(`    ℹ️  CONDITIONAL GLOBAL [${pageUrl}]: ${globalCheck} not required (${dependency} not loaded)`);
                        }
                    } catch (error) {
                        console.log(`    ℹ️  CONDITIONAL GLOBAL CHECK ERROR [${pageUrl}]: ${globalCheck} - ${error.message}`);
                    }
                } else {
                    // No dependency (like ModalManagerV2 in Option 1)
                    console.log(`    ℹ️  CONDITIONAL GLOBAL [${pageUrl}]: ${globalCheck} not required in Option 1`);
                }
            }

            // Determine status
            const missingCount = pageResult.requiredGlobals_missing.length;
            if (missingCount === 0) {
                pageResult.status = 'GREEN';
                console.log(`    ✅ GREEN: All required globals present`);
            } else {
                pageResult.status = 'CRITICAL';
                pageResult.violations_found = missingCount;
                console.log(`    ❌ CRITICAL: Missing ${missingCount} globals`);
                groupResults.violations_found += missingCount;
                groupResults.pages_with_violations.push(pageUrl);
            }

        } catch (error) {
            console.log(`    🔥 ERROR: ${error.message}`);
            pageResult.status = 'ERROR';
            pageResult.errors.push(error.message);
            groupResults.violations_found += 1;
            groupResults.pages_with_violations.push(pageUrl);
        }

        groupResults.detailed_results.push(pageResult);
        await page.close();
    }

    await browser.close();
    
    // Group summary
    groupResults.overall_status = groupResults.violations_found === 0 ? 'PASS' : 'FAIL';
    
    console.log(`\n🎯 Group ${groupName} Summary:`);
    console.log(`   Status: ${groupResults.overall_status}`);
    console.log(`   Violations: ${groupResults.violations_found}`);
    if (groupResults.pages_with_violations.length > 0) {
        console.log(`   Problem pages: ${groupResults.pages_with_violations.join(', ')}`);
    }
    
    return groupResults;
}

async function runAllGroups() {
    const allResults = {
        timestamp: new Date().toISOString(),
        monitoring_type: 'QA Group Based',
        groups_tested: Object.keys(QA_GROUPS).length,
        groups_passed: 0,
        groups_failed: 0,
        total_violations: 0,
        group_results: []
    };

    for (const groupName of Object.keys(QA_GROUPS)) {
        try {
            const groupResult = await monitorGroup(groupName);
            allResults.group_results.push(groupResult);
            
            if (groupResult.overall_status === 'PASS') {
                allResults.groups_passed++;
            } else {
                allResults.groups_failed++;
                allResults.total_violations += groupResult.violations_found;
            }
        } catch (error) {
            console.error(`❌ Failed to monitor group ${groupName}:`, error.message);
            allResults.group_results.push({
                group: groupName,
                error: error.message,
                overall_status: 'ERROR'
            });
            allResults.groups_failed++;
        }
    }

    // Overall summary
    allResults.overall_status = allResults.groups_failed === 0 ? 'ALL GROUPS PASS' : `${allResults.groups_failed} GROUPS FAIL`;
    
    console.log(`\n🎯 OVERALL MONITORING SUMMARY:`);
    console.log(`   Groups Tested: ${allResults.groups_tested}`);
    console.log(`   Groups Passed: ${allResults.groups_passed}`);
    console.log(`   Groups Failed: ${allResults.groups_failed}`);
    console.log(`   Total Violations: ${allResults.total_violations}`);
    console.log(`   Overall Status: ${allResults.overall_status}`);

    // Save results
    const outputDir = path.join(process.cwd(), 'documentation/05-REPORTS/artifacts/2026_01_03');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, 'option1_load_order_group_monitoring_results.json');
    fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
    
    console.log(`\n💾 Results saved to: ${outputFile}`);
    
    return allResults;
}

// Command line usage
const targetGroup = process.argv[2];
if (targetGroup) {
    // Monitor specific group
    monitorGroup(targetGroup).catch(console.error);
} else {
    // Monitor all groups
    runAllGroups().catch(console.error);
}
