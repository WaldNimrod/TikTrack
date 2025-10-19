/**
 * Page Standardization Script
 * סקריפט לסטנדרטיזציה של כל העמודים במערכת
 * 
 * @version 1.0.0
 * @created October 2025
 * @author TikTrack Development Team
 */

class PageStandardizer {
    constructor() {
        this.pagesToStandardize = [
            'index', 'preferences', 'trades', 'executions', 'trade_plans', 
            'alerts', 'trading_accounts', 'cash_flows', 'tickers', 'notes',
            'research', 'db_display', 'system-management', 'server-monitor',
            'cache-test', 'linter-realtime-monitor', 'notifications-center',
            'external-data-dashboard', 'crud-testing-dashboard', 'conditions_test',
            'conditions-test', 'db_extradata', 'constraints', 'background-tasks',
            'page-scripts-matrix', 'css-management', 'dynamic-colors-display',
            'designs', 'chart-management', 'init-system-management'
        ];
        
        this.packageScripts = {
            'base': [
                'scripts/global-favicon.js?v=1.0.0',
                'scripts/notification-system.js?v=1.0.0',
                'scripts/ui-utils.js?v=1.0.0',
                'scripts/page-utils.js?v=1.0.0',
                'scripts/translation-utils.js?v=1.0.0',
                'scripts/unified-cache-manager.js?v=1.0.0',
                'scripts/cache-sync-manager.js?v=1.0.0',
                'scripts/header-system.js?v=v6.0.0'
            ],
            'crud': [
                'scripts/tables.js?v=1.0.0',
                'scripts/data-utils.js?v=1.0.0',
                'scripts/pagination-system.js?v=1.0.0'
            ],
            'filters': [
                'scripts/related-object-filters.js?v=1.0.0'
            ],
            'charts': [
                'scripts/chart-management.js?v=1.0.0'
            ],
            'preferences': [
                'scripts/preferences.js?v=1.0.0',
                'scripts/preferences-core.js?v=1.0.0',
                'scripts/preferences-page.js?v=1.0.0'
            ],
            'validation': [
                'scripts/validation-utils.js?v=1.0.0',
                'scripts/constraint-manager.js?v=1.0.0'
            ],
            'advanced-notifications': [
                'scripts/active-alerts-component.js?v=1.0.0',
                'scripts/notifications-center.js?v=1.0.0',
                'scripts/realtime-notifications-client.js?v=1.0.0'
            ],
            'external-data': [
                'scripts/external-data-service.js?v=1.0.0',
                'scripts/yahoo-finance-service.js?v=1.0.0',
                'scripts/external-data-dashboard.js?v=1.0.0'
            ],
            'system-management': [
                'scripts/system-management.js?v=1.0.0',
                'scripts/cache-management.js?v=1.0.0',
                'scripts/server-monitor.js?v=1.0.0'
            ],
            'dev-tools': [
                'scripts/linter-realtime-monitor.js?v=1.0.0',
                'scripts/crud-testing-dashboard.js?v=1.0.0',
                'scripts/css-duplicates-analyzer.js?v=1.0.0'
            ]
        };
        
        this.coreScripts = [
            'scripts/page-initialization-configs.js?v=1.0.0',
            'scripts/unified-app-initializer.js?v=1.0.0'
        ];
    }
    
    /**
     * Get scripts for a page based on its packages
     */
    getScriptsForPage(pageName) {
        if (!window.PAGE_CONFIGS || !window.PAGE_CONFIGS[pageName]) {
            console.warn(`No config found for page: ${pageName}`);
            return this.packageScripts.base.concat(this.coreScripts);
        }
        
        const config = window.PAGE_CONFIGS[pageName];
        const packages = config.packages || ['base'];
        
        let scripts = [];
        
        // Add scripts for each package
        packages.forEach(pkg => {
            if (this.packageScripts[pkg]) {
                scripts = scripts.concat(this.packageScripts[pkg]);
            } else {
                console.warn(`Package ${pkg} not found in packageScripts`);
            }
        });
        
        // Add core scripts
        scripts = scripts.concat(this.coreScripts);
        
        // Remove duplicates
        return [...new Set(scripts)];
    }
    
    /**
     * Generate standardized script section for a page
     */
    generateScriptSection(pageName) {
        const scripts = this.getScriptsForPage(pageName);
        
        let html = `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n`;
        
        // Group scripts by package
        const baseScripts = scripts.filter(s => s.includes('global-favicon') || s.includes('notification-system') || 
                                               s.includes('ui-utils') || s.includes('page-utils') || 
                                               s.includes('translation-utils') || s.includes('unified-cache-manager') || 
                                               s.includes('cache-sync-manager') || s.includes('header-system'));
        
        const otherScripts = scripts.filter(s => !baseScripts.includes(s) && !s.includes('page-initialization-configs') && !s.includes('unified-app-initializer'));
        
        const coreScripts = scripts.filter(s => s.includes('page-initialization-configs') || s.includes('unified-app-initializer'));
        
        if (baseScripts.length > 0) {
            html += `        <!-- Base Package Scripts -->\n`;
            baseScripts.forEach(script => {
                html += `        <script src="${script}"></script>\n`;
            });
            html += `        \n`;
        }
        
        if (otherScripts.length > 0) {
            html += `        <!-- Additional Package Scripts -->\n`;
            otherScripts.forEach(script => {
                html += `        <script src="${script}"></script>\n`;
            });
            html += `        \n`;
        }
        
        if (coreScripts.length > 0) {
            html += `        <!-- Page Configs and Initializer -->\n`;
            coreScripts.forEach(script => {
                html += `        <script src="${script}"></script>\n`;
            });
        }
        
        return html;
    }
    
    /**
     * Analyze a page and show what needs to be standardized
     */
    analyzePage(pageName) {
        console.log(`\n🔍 Analyzing page: ${pageName}`);
        
        const scripts = this.getScriptsForPage(pageName);
        console.log(`📦 Required packages: ${window.PAGE_CONFIGS?.[pageName]?.packages?.join(', ') || 'base'}`);
        console.log(`📜 Required scripts (${scripts.length}):`);
        scripts.forEach(script => {
            console.log(`   - ${script}`);
        });
        
        return {
            pageName,
            packages: window.PAGE_CONFIGS?.[pageName]?.packages || ['base'],
            requiredScripts: scripts,
            scriptCount: scripts.length
        };
    }
    
    /**
     * Analyze all pages
     */
    analyzeAllPages() {
        console.log('🔍 Analyzing all pages for standardization...\n');
        
        const results = [];
        this.pagesToStandardize.forEach(pageName => {
            const analysis = this.analyzePage(pageName);
            results.push(analysis);
        });
        
        console.log('\n📊 Summary:');
        console.log(`Total pages: ${results.length}`);
        console.log(`Pages with configs: ${results.filter(r => window.PAGE_CONFIGS?.[r.pageName]).length}`);
        console.log(`Average scripts per page: ${(results.reduce((sum, r) => sum + r.scriptCount, 0) / results.length).toFixed(1)}`);
        
        return results;
    }
    
    /**
     * Show standardization report
     */
    showStandardizationReport() {
        const results = this.analyzeAllPages();
        
        console.log('\n📋 Standardization Report:');
        console.log('='.repeat(50));
        
        results.forEach(result => {
            const hasConfig = !!window.PAGE_CONFIGS?.[result.pageName];
            const status = hasConfig ? '✅' : '❌';
            console.log(`${status} ${result.pageName.padEnd(25)} | ${result.packages.join(', ').padEnd(20)} | ${result.scriptCount} scripts`);
        });
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Update HTML files to use standardized script loading');
        console.log('2. Remove duplicate and unnecessary scripts');
        console.log('3. Ensure all pages use unified-app-initializer');
        console.log('4. Test each page after standardization');
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.PageStandardizer = PageStandardizer;
}

// Auto-run analysis if loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('init-system-management')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const standardizer = new PageStandardizer();
            standardizer.showStandardizationReport();
        }, 2000);
    });
}
