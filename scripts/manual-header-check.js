
// Manual Header Init Method Checker
// Run this in browser console on each page

(function() {
    'use strict';
    
    const pages = [
  "ai_analysis.html",
  "alerts.html",
  "background_tasks.html",
  "button_color_mapping_simple.html",
  "button_color_mapping.html",
  "cache_management.html",
  "cash_flows.html",
  "chart_management.html",
  "code_quality_dashboard.html",
  "conditions_modals.html",
  "conditions_test.html",
  "constraints.html",
  "crud_testing_dashboard.html",
  "css_management.html",
  "data_import.html",
  "db_display.html",
  "db_extradata.html",
  "designs.html",
  "dynamic_colors_display.html",
  "executions.html",
  "external_data_dashboard.html",
  "index.html",
  "init_system_management.html",
  "notes.html",
  "notifications_center.html",
  "preferences_groups_management.html",
  "preferences.html",
  "research.html",
  "server_monitor.html",
  "smart-init-testing.html",
  "system_management.html",
  "tag_management.html",
  "ticker_dashboard.html",
  "tickers.html",
  "tooltip-editor.html",
  "trade_plans.html",
  "trades.html",
  "trades_formatted.html",
  "trading_accounts.html",
  "tradingview_widgets_showcase.html",
  "user_profile.html"
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
