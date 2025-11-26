#!/usr/bin/env node
/**
 * Table System Deviations Auto-Fix Script
 * סקריפט לתיקון אוטומטי של סטיות במערכת הטבלאות
 * 
 * Usage: node scripts/fix-table-deviations.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const TRADING_UI_DIR = path.join(BASE_DIR, 'trading-ui');
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Starting table system deviations auto-fix...\n');
if (DRY_RUN) {
  console.log('⚠️  DRY RUN MODE - No files will be modified\n');
}

// Mapping of table IDs to table types (from HTML)
const TABLE_TYPE_MAPPINGS = {
  // db_display.html - already fixed
  'accountsTable': 'trading_accounts',
  'tradesTable': 'trades',
  'tickersTable': 'tickers',
  'tradePlansTable': 'trade_plans',
  'executionsTable': 'executions',
  'alertsTable': 'alerts',
  'notesTable': 'notes',
  'cashFlowsTable': 'cash_flows',
  
  // db_extradata.html - already fixed
  'constraintsTable': 'constraints',
  'currenciesTable': 'currencies',
  'preferenceGroupsTable': 'preference_groups',
  'systemSettingGroupsTable': 'system_setting_groups',
  'externalDataProvidersTable': 'external_data_providers',
  'quotesLastTable': 'quotes_last',
  'planConditionsTable': 'plan_conditions',
  'userPreferencesTable': 'user_preferences',
  
  // executions.html
  'importTable': 'import_history',
  'skipTable': 'skip_history',
  
  // background-tasks.html
  'tasks-table': 'background_tasks',
  
  // css-management.html
  'cssFilesTable': 'css_files',
  
  // preferences.html
  'preferenceTypesAuditTableBody': 'preference_types',
};

function fixTableAttributes(htmlPath) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  let modified = false;
  let newContent = content;

  // Find all <table> tags without data-table-type
  const tableRegex = /<table([^>]*)(?!.*data-table-type)([^>]*)>/gi;
  
  tableRegex.lastIndex = 0;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const beforeAttrs = match[1];
    const afterAttrs = match[2];
    
    // Try to extract table ID
    const idMatch = fullMatch.match(/id=["']([^"']+)["']/i);
    if (idMatch) {
      const tableId = idMatch[1];
      const tableType = TABLE_TYPE_MAPPINGS[tableId];
      
      if (tableType) {
        // Add data-table-type attribute
        const newTableTag = fullMatch.replace(/>$/, ` data-table-type="${tableType}">`);
        newContent = newContent.replace(fullMatch, newTableTag);
        modified = true;
        console.log(`  ✅ Added data-table-type="${tableType}" to table ${tableId}`);
      }
    }
  }

  if (modified && !DRY_RUN) {
    fs.writeFileSync(htmlPath, newContent, 'utf8');
  }

  return modified;
}

// Fix HTML files
const HTML_FILES_TO_FIX = [
  'trading-ui/mockups/daily-snapshots/portfolio-state-page.html',
  'trading-ui/mockups/daily-snapshots/trade-history-page.html',
  'trading-ui/mockups/daily-snapshots/price-history-page.html',
  'trading-ui/mockups/daily-snapshots/comparative-analysis-page.html',
  'trading-ui/mockups/daily-snapshots/trading-journal-page.html',
  'trading-ui/mockups/daily-snapshots/strategy-analysis-page.html',
  'trading-ui/mockups/daily-snapshots/economic-calendar-page.html',
  'trading-ui/mockups/daily-snapshots/history-widget.html',
  'trading-ui/mockups/daily-snapshots/emotional-tracking-widget.html',
  'trading-ui/mockups/daily-snapshots/date-comparison-modal.html',
  'trading-ui/external-data-dashboard.html',
];

console.log('📄 Fixing HTML files...\n');

HTML_FILES_TO_FIX.forEach(file => {
  const filePath = path.join(BASE_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`  📝 ${file}...`);
    const fixed = fixTableAttributes(filePath);
    if (!fixed) {
      console.log(`     ℹ️  No fixes needed`);
    }
  } else {
    console.log(`  ⚠️  ${file} not found`);
  }
});

console.log('\n✅ HTML fixes complete!\n');

// Summary
console.log('📊 Summary:');
console.log('  - HTML files checked: ' + HTML_FILES_TO_FIX.length);
console.log('  - Files modified: (see above)');
if (DRY_RUN) {
  console.log('\n⚠️  This was a DRY RUN - no files were actually modified');
  console.log('   Run without --dry-run to apply changes');
} else {
  console.log('\n✅ All fixes applied successfully!');
}


