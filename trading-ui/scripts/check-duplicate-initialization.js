/**
 * Duplicate Initialization Checker
 * בודק אתחול כפול ונוסף בכל העמודים
 * 
 * @version 1.0.0
 * @created October 2025
 * @author TikTrack Development Team
 */

class DuplicateInitializationChecker {
    constructor() {
        this.pagesToCheck = [
            'index', 'preferences', 'trades', 'executions', 'trade_plans', 
            'alerts', 'trading_accounts', 'cash_flows', 'tickers', 'notes',
            'research', 'db_display', 'system-management', 'server-monitor',
            'linter-realtime-monitor', 'notifications-center',
            'external-data-dashboard', 'crud-testing-dashboard',
            'conditions-test', 'db_extradata', 'constraints', 'background-tasks',
            'css-management', 'dynamic-colors-display',
            'designs', 'chart-management', 'init-system-management'
        ];
        
        this.standardScripts = [
            'scripts/page-initialization-configs.js',
            'scripts/unified-app-initializer.js',
            'scripts/global-favicon.js',
            'scripts/notification-system.js',
            'scripts/ui-utils.js',
            'scripts/page-utils.js',
            'scripts/translation-utils.js',
            'scripts/unified-cache-manager.js',
            'scripts/cache-sync-manager.js',
            'scripts/header-system.js'
        ];
        
        this.problematicScripts = [
            'scripts/notification-system-tester.js',
            'scripts/color-demo-toggle.js',
            'scripts/console-cleanup.js',
            'scripts/error-handlers.js',
            'scripts/memory-optimizer.js',
            'scripts/cache-policy-manager.js'
        ];
    }
    
    /**
     * Check a single page for duplicate initialization
     */
    async checkPage(pageName) {
        try {
            const response = await fetch(`/${pageName}.html`);
            if (!response.ok) {
                return {
                    pageName,
                    status: 'error',
                    error: `HTTP ${response.status}`,
                    scripts: [],
                    duplicates: [],
                    problematic: [],
                    missing: []
                };
            }
            
            const html = await response.text();
            const scriptMatches = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/g) || [];
            const scripts = scriptMatches.map(match => {
                const srcMatch = match.match(/src=["']([^"']+)["']/);
                return srcMatch ? srcMatch[1] : null;
            }).filter(Boolean);
            
            // Check for duplicates
            const duplicates = this.findDuplicates(scripts);
            
            // Check for problematic scripts
            const problematic = scripts.filter(script => 
                this.problematicScripts.some(prob => script.includes(prob))
            );
            
            // Check for missing standard scripts
            const missing = this.standardScripts.filter(standard => 
                !scripts.some(script => script.includes(standard))
            );
            
            // Check if using unified-app-initializer
            const hasUnifiedInitializer = scripts.some(script => 
                script.includes('unified-app-initializer.js')
            );
            
            // Check if using page-initialization-configs
            const hasPageConfigs = scripts.some(script => 
                script.includes('page-initialization-configs.js')
            );
            
            return {
                pageName,
                status: 'success',
                scripts: scripts.length,
                duplicates,
                problematic,
                missing,
                hasUnifiedInitializer,
                hasPageConfigs,
                isStandardized: hasUnifiedInitializer && hasPageConfigs && duplicates.length === 0 && problematic.length === 0
            };
            
        } catch (error) {
            return {
                pageName,
                status: 'error',
                error: error.message,
                scripts: 0,
                duplicates: [],
                problematic: [],
                missing: []
            };
        }
    }
    
    /**
     * Find duplicate scripts in a list
     */
    findDuplicates(scripts) {
        const seen = new Set();
        const duplicates = [];
        
        scripts.forEach(script => {
            const baseScript = script.split('?')[0]; // Remove version query
            if (seen.has(baseScript)) {
                duplicates.push(baseScript);
            } else {
                seen.add(baseScript);
            }
        });
        
        return [...new Set(duplicates)];
    }
    
    /**
     * Check all pages
     */
    async checkAllPages() {
        console.log('🔍 Checking all pages for duplicate initialization...\n');
        
        const results = [];
        for (const pageName of this.pagesToCheck) {
            console.log(`Checking ${pageName}...`);
            const result = await this.checkPage(pageName);
            results.push(result);
        }
        
        return results;
    }
    
    /**
     * Generate detailed report
     */
    generateReport(results) {
        const totalPages = results.length;
        const successfulChecks = results.filter(r => r.status === 'success').length;
        const standardizedPages = results.filter(r => r.isStandardized).length;
        const totalDuplicates = results.reduce((sum, r) => sum + (r.duplicates?.length || 0), 0);
        const totalProblematic = results.reduce((sum, r) => sum + (r.problematic?.length || 0), 0);
        const totalMissing = results.reduce((sum, r) => sum + (r.missing?.length || 0), 0);
        
        let report = `
📊 דוח בדיקת אתחול כפול ונוסף
${'='.repeat(50)}

📈 סטטיסטיקות כלליות:
• סה"כ עמודים: ${totalPages}
• בדיקות מוצלחות: ${successfulChecks}
• עמודים סטנדרטיים: ${standardizedPages}
• עמודים שצריכים תיקון: ${totalPages - standardizedPages}

🔴 בעיות שזוהו:
• סקריפטים כפולים: ${totalDuplicates}
• סקריפטים בעייתיים: ${totalProblematic}
• סקריפטים חסרים: ${totalMissing}

📋 פירוט לפי עמודים:
${'='.repeat(50)}
`;
        
        results.forEach(result => {
            const status = result.isStandardized ? '✅' : '❌';
            const scripts = result.scripts || 0;
            const duplicates = result.duplicates?.length || 0;
            const problematic = result.problematic?.length || 0;
            const missing = result.missing?.length || 0;
            
            report += `${status} ${result.pageName.padEnd(25)} | ${scripts.toString().padStart(2)} scripts | `;
            
            if (duplicates > 0) report += `🔄${duplicates} `;
            if (problematic > 0) report += `⚠️${problematic} `;
            if (missing > 0) report += `❌${missing} `;
            if (duplicates === 0 && problematic === 0 && missing === 0) report += `✅`;
            
            report += '\n';
            
            // Add details for problematic pages
            if (!result.isStandardized && result.status === 'success') {
                if (result.duplicates?.length > 0) {
                    report += `    🔄 כפילויות: ${result.duplicates.join(', ')}\n`;
                }
                if (result.problematic?.length > 0) {
                    report += `    ⚠️ בעייתיים: ${result.problematic.join(', ')}\n`;
                }
                if (result.missing?.length > 0) {
                    report += `    ❌ חסרים: ${result.missing.join(', ')}\n`;
                }
            }
        });
        
        report += `
🎯 המלצות:
${'='.repeat(50)}
1. תיקון עמודים עם כפילויות (${results.filter(r => r.duplicates?.length > 0).length} עמודים)
2. הסרת סקריפטים בעייתיים (${results.filter(r => r.problematic?.length > 0).length} עמודים)
3. הוספת סקריפטים חסרים (${results.filter(r => r.missing?.length > 0).length} עמודים)
4. וידוא שכל העמודים משתמשים ב-unified-app-initializer
5. סטנדרטיזציה מלאה של כל ${totalPages - standardizedPages} העמודים הבעייתיים
`;
        
        return report;
    }
    
    /**
     * Show report in console
     */
    async showReport() {
        const results = await this.checkAllPages();
        const report = this.generateReport(results);
        console.log(report);
        return results;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.DuplicateInitializationChecker = DuplicateInitializationChecker;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('init-system-management')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const checker = new DuplicateInitializationChecker();
            checker.showReport();
        }, 2000);
    });
}
