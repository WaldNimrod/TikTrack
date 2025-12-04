
// Manual Header Init Method Checker
// Run this in browser console on each page

(function() {
    'use strict';
    
    const pages = [
  "ai-analysis.html",
  "alerts.html",
  "background-tasks.html",
  "button-color-mapping-simple.html",
  "button-color-mapping.html",
  "cache-management.html",
  "cash_flows.html",
  "chart-management.html",
  "code-quality-dashboard.html",
  "conditions-modals.html",
  "conditions-test.html",
  "constraints.html",
  "crud-testing-dashboard.html",
  "css-management.html",
  "data_import.html",
  "db_display.html",
  "db_extradata.html",
  "designs.html",
  "dynamic-colors-display.html",
  "executions.html",
  "external-data-dashboard.html",
  "index.html",
  "init-system-management.html",
  "notes.html",
  "notifications-center.html",
  "preferences-groups-management.html",
  "preferences.html",
  "research.html",
  "server-monitor.html",
  "smart-init-testing.html",
  "system-management.html",
  "tag-management.html",
  "ticker-dashboard.html",
  "tickers.html",
  "tooltip-editor.html",
  "trade_plans.html",
  "trades.html",
  "trades_formatted.html",
  "trading_accounts.html",
  "tradingview-widgets-showcase.html",
  "user-profile.html"
];
    
    function checkCurrentPage() {
        const pageName = window.location.pathname.split('/').pop();
        const initLogs = JSON.parse(localStorage.getItem('__headerInitLogs') || '[]');
        const pageLog = initLogs.find(log => log.page.endsWith(pageName));
        
        const result = {
            page: pageName,
            method: window.__headerSystemInitMethod || pageLog?.method || 'unknown',
            headerInitialized: !!(window.headerSystem && window.headerSystem.isInitialized),
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 HEADER INIT RESULT:', JSON.stringify(result, null, 2));
        return result;
    }
    
    // Check current page
    const result = checkCurrentPage();
    
    // Store result
    if (!window.__headerInitResults) {
        window.__headerInitResults = [];
    }
    window.__headerInitResults.push(result);
    
    console.log('✅ Result stored in window.__headerInitResults');
    console.log('📋 To see all results: console.log(JSON.stringify(window.__headerInitResults, null, 2))');
    
    return result;
})();
