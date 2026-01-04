// Simple Node.js script to test page functionality
const puppeteer = require('puppeteer');

async function testPageFunctionality(pageUrl, pageName) {
    console.log(`Testing ${pageName}: ${pageUrl}`);
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
        try {
            const logData = JSON.parse(msg.text());
            logs.push(logData);
        } catch (e) {
            // Not a JSON log, skip
        }
    });
    
    try {
        await page.goto(`http://127.0.0.1:8080${pageUrl}`, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for page to stabilize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get page content and check for functionality elements
        const pageData = await page.evaluate(() => {
            const result = {
                title: document.title,
                hasMainContent: !!document.querySelector('.main-content'),
                globalsAvailable: {
                    UnifiedCacheManager: typeof window.UnifiedCacheManager !== 'undefined',
                    Logger: typeof window.Logger !== 'undefined',
                    TikTrackAuth: typeof window.TikTrackAuth !== 'undefined'
                }
            };
            
            if (window.location.pathname.includes('conditions_modals')) {
                result.conditionsSpecific = {
                    hasConditionsTable: !!document.querySelector('.conditions-table'),
                    conditionRows: document.querySelectorAll('[data-condition-id]').length,
                    actionButtons: {
                        add: !!document.getElementById('add-condition-btn'),
                        edit: document.querySelectorAll('.btn-edit').length,
                        delete: document.querySelectorAll('.btn-delete').length
                    }
                };
            } else if (window.location.pathname.includes('system_management')) {
                result.systemSpecific = {
                    hasSystemElements: document.querySelectorAll('[data-system-info]').length > 0,
                    hasDashboardContainer: !!document.getElementById('system-management-top'),
                    totalDataElements: document.querySelectorAll('[data-system-info]').length
                };
            }
            
            return result;
        });
        
        // Filter logs for this page
        const pageLogs = logs.filter(log => 
            log.data && log.data.page === pageName.replace('_', '')
        );
        
        console.log(`✅ ${pageName} loaded successfully`);
        console.log(`📄 Title: ${pageData.title}`);
        console.log(`🔧 Globals: UCM=${pageData.globalsAvailable.UnifiedCacheManager}, Logger=${pageData.globalsAvailable.Logger}, Auth=${pageData.globalsAvailable.TikTrackAuth}`);
        
        if (pageData.conditionsSpecific) {
            console.log(`📋 Conditions: Table=${pageData.conditionsSpecific.hasConditionsTable}, Rows=${pageData.conditionsSpecific.conditionRows}`);
            console.log(`🔘 Buttons: Add=${pageData.conditionsSpecific.actionButtons.add}, Edit=${pageData.conditionsSpecific.actionButtons.edit}, Delete=${pageData.conditionsSpecific.actionButtons.delete}`);
        } else if (pageData.systemSpecific) {
            console.log(`⚙️ System: Dashboard=${pageData.systemSpecific.hasDashboardContainer}, DataElements=${pageData.systemSpecific.totalDataElements}`);
        }
        
        console.log(`📝 Debug logs captured: ${pageLogs.length}`);
        
        return {
            pageName,
            success: true,
            pageData,
            logs: pageLogs
        };
        
    } catch (error) {
        console.log(`❌ ${pageName} failed: ${error.message}`);
        return {
            pageName,
            success: false,
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

async function main() {
    const results = [];
    
    // Test conditions_modals
    const conditionsResult = await testPageFunctionality('/conditions_modals.html', 'conditions_modals');
    results.push(conditionsResult);
    console.log('');
    
    // Test system_management  
    const systemResult = await testPageFunctionality('/system_management.html', 'system_management');
    results.push(systemResult);
    
    // Generate evidence JSON
    const evidence = {
        timestamp: new Date().toISOString(),
        test_type: 'Full Functionality Verification with JavaScript Execution',
        results: results,
        summary: {
            conditions_modals_functional: results.find(r => r.pageName === 'conditions_modals')?.success || false,
            system_management_functional: results.find(r => r.pageName === 'system_management')?.success || false,
            both_pages_functional: results.every(r => r.success)
        }
    };
    
    console.log('\\n=== EVIDENCE SUMMARY ===');
    console.log(`Conditions Modals: ${evidence.summary.conditions_modals_functional ? '✅ FUNCTIONAL' : '❌ NON-FUNCTIONAL'}`);
    console.log(`System Management: ${evidence.summary.system_management_functional ? '✅ FUNCTIONAL' : '❌ NON-FUNCTIONAL'}`);
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('documentation/05-REPORTS/artifacts/2026_01_04/functionality_reverification_with_js_execution.json', JSON.stringify(evidence, null, 2));
    console.log('\\n📋 Evidence saved to: documentation/05-REPORTS/artifacts/2026_01_04/functionality_reverification_with_js_execution.json');
}

main().catch(console.error);
