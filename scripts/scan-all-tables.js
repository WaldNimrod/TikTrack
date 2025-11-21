#!/usr/bin/env node
/**
 * Table Sorting System Scanner
 * Scans all HTML and JavaScript files for tables and their sorting configuration
 * 
 * Usage:
 *   node scripts/scan-all-tables.js [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/scan-all-tables.js --output reports/table-sorting-audit/tables-inventory.json
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'table-sorting-audit');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

/**
 * Extract table information from HTML
 */
function extractTableFromHTML(filePath, content) {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const pageName = path.basename(filePath, '.html');
  const tables = [];
  
  // Find all tables
  const tableElements = document.querySelectorAll('table');
  tableElements.forEach((table, index) => {
    const tableId = table.id || `table-${index}`;
    const tableType = table.getAttribute('data-table-type') || 
                     table.closest('[data-table-type]')?.getAttribute('data-table-type') || 
                     null;
    
    // Find table headers to identify columns
    const headers = [];
    const headerElements = table.querySelectorAll('thead th, thead td');
    headerElements.forEach((header, colIndex) => {
      headers.push({
        index: colIndex,
        text: header.textContent.trim(),
        hasSortable: header.classList.contains('sortable-header') || 
                    header.hasAttribute('data-sortable'),
        onclick: header.getAttribute('onclick') || header.getAttribute('data-onclick') || null
      });
    });
    
    // Check if table is in a modal
    const modal = table.closest('.modal, [class*="modal"]');
    const inModal = !!modal;
    const modalId = modal ? (modal.id || 'unknown') : null;
    
    tables.push({
      tableId,
      tableType,
      pageName,
      inModal,
      modalId,
      columnCount: headers.length,
      headers,
      hasPagination: !!table.closest('.pagination-container, [class*="pagination"]'),
      selector: `#${tableId}`,
      filePath: path.relative(TRADING_UI_DIR, filePath)
    });
  });
  
  return tables;
}

/**
 * Extract table registration from JavaScript
 */
function extractTableRegistration(filePath, content) {
  const pageName = path.basename(filePath, '.js');
  const registrations = [];
  
  // Look for register*Tables functions
  const registerPattern = /(?:window\.)?register(\w+)Tables?\s*=\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
  let match;
  
  while ((match = registerPattern.exec(content)) !== null) {
    const functionName = match[1];
    const functionBody = match[2];
    
    // Extract table type from registry.register calls
    const registerPattern2 = /registry\.register\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g;
    let registerMatch;
    
    while ((registerMatch = registerPattern2.exec(functionBody)) !== null) {
      const tableType = registerMatch[1];
      const configBody = registerMatch[2];
      
      // Extract defaultSort if exists
      let defaultSort = null;
      const defaultSortMatch = configBody.match(/defaultSort\s*:\s*(\{[^}]*\}|\[[^\]]*\]|null|undefined)/);
      if (defaultSortMatch) {
        try {
          defaultSort = eval(`(${defaultSortMatch[1]})`);
        } catch (e) {
          defaultSort = defaultSortMatch[1];
        }
      }
      
      // Extract tableSelector
      const selectorMatch = configBody.match(/tableSelector\s*:\s*['"]([^'"]+)['"]/);
      const tableSelector = selectorMatch ? selectorMatch[1] : null;
      
      // Extract sortable
      const sortableMatch = configBody.match(/sortable\s*:\s*(true|false)/);
      const sortable = sortableMatch ? sortableMatch[1] === 'true' : true;
      
      registrations.push({
        tableType,
        functionName: `register${functionName}Tables`,
        pageName,
        defaultSort,
        tableSelector,
        sortable,
        filePath: path.relative(TRADING_UI_DIR, filePath),
        hasRegistration: true
      });
    }
  }
  
  // Also check for direct UnifiedTableSystem.registry.register calls
  const directRegisterPattern = /UnifiedTableSystem\.registry\.register\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/g;
  while ((match = directRegisterPattern.exec(content)) !== null) {
    const tableType = match[1];
    const configBody = match[2];
    
    // Check if already found
    if (!registrations.find(r => r.tableType === tableType && r.pageName === pageName)) {
      let defaultSort = null;
      const defaultSortMatch = configBody.match(/defaultSort\s*:\s*(\{[^}]*\}|\[[^\]]*\]|null|undefined)/);
      if (defaultSortMatch) {
        try {
          defaultSort = eval(`(${defaultSortMatch[1]})`);
        } catch (e) {
          defaultSort = defaultSortMatch[1];
        }
      }
      
      const selectorMatch = configBody.match(/tableSelector\s*:\s*['"]([^'"]+)['"]/);
      const tableSelector = selectorMatch ? selectorMatch[1] : null;
      
      registrations.push({
        tableType,
        functionName: 'direct registration',
        pageName,
        defaultSort,
        tableSelector,
        sortable: true,
        filePath: path.relative(TRADING_UI_DIR, filePath),
        hasRegistration: true
      });
    }
  }
  
  return registrations;
}

/**
 * Check if table type exists in TABLE_COLUMN_MAPPINGS and find date columns
 */
function checkTableMapping(tableType, tableMappingsContent) {
  const DEFAULT_DATE_KEYS = [
    'created_at', 'opened_at', 'closed_at', 'updated_at', 'triggered_at',
    'completed_at', 'expiry_date', 'date', 'trade_created_at', 'yahoo_updated_at'
  ];
  
  // Try to extract TABLE_COLUMN_MAPPINGS from the content
  let hasMapping = false;
  let dateColumnIndex = null;
  let dateColumnKey = null;
  let columns = [];
  
  // Look for table type in mappings
  const mappingPattern = new RegExp(`['"]${tableType}['"]\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = tableMappingsContent.match(mappingPattern);
  
  if (match) {
    hasMapping = true;
    const columnsStr = match[1];
    
    // Extract column keys (handle both string and object formats)
    const columnPattern = /['"]([^'"]+)['"]|key:\s*['"]([^'"]+)['"]/g;
    let colMatch;
    let index = 0;
    
    while ((colMatch = columnPattern.exec(columnsStr)) !== null) {
      const key = colMatch[1] || colMatch[2];
      columns.push({ index, key });
      
      // Check if this is a date column
      if (!dateColumnIndex && DEFAULT_DATE_KEYS.includes(key)) {
        dateColumnIndex = index;
        dateColumnKey = key;
      }
      
      index++;
    }
  }
  
  return {
    hasMapping,
    hasDateColumn: dateColumnIndex !== null,
    dateColumnIndex,
    dateColumnKey,
    columns
  };
}

/**
 * Scan all HTML files
 */
function scanHTMLFiles() {
  const htmlFiles = [];
  const htmlTables = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', 'backup', 'archive'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const tables = extractTableFromHTML(fullPath, content);
          htmlTables.push(...tables);
        } catch (error) {
          console.error(`Error scanning ${fullPath}:`, error.message);
        }
      }
    }
  }
  
  scanDirectory(TRADING_UI_DIR);
  
  return { htmlFiles, htmlTables };
}

/**
 * Scan all JavaScript files
 */
function scanJavaScriptFiles() {
  const jsFiles = [];
  const jsRegistrations = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', 'backup', 'archive', 'test'].includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        // Skip test files and backup files
        if (!entry.name.includes('.test.') && 
            !entry.name.includes('.backup') && 
            !entry.name.includes('.bak')) {
          jsFiles.push(fullPath);
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const registrations = extractTableRegistration(fullPath, content);
            jsRegistrations.push(...registrations);
          } catch (error) {
            console.error(`Error scanning ${fullPath}:`, error.message);
          }
        }
      }
    }
  }
  
  scanDirectory(path.join(TRADING_UI_DIR, 'scripts'));
  
  return { jsFiles, jsRegistrations };
}

/**
 * Match HTML tables with JavaScript registrations
 */
function matchTablesWithRegistrations(htmlTables, jsRegistrations) {
  const matchedTables = [];
  const unmatchedHTML = [];
  const unmatchedJS = [];
  
  // Create a map of registrations by tableType and pageName
  const registrationMap = new Map();
  jsRegistrations.forEach(reg => {
    const key = `${reg.pageName}:${reg.tableType}`;
    if (!registrationMap.has(key)) {
      registrationMap.set(key, []);
    }
    registrationMap.get(key).push(reg);
  });
  
  // Match HTML tables with registrations
  htmlTables.forEach(htmlTable => {
    const key = `${htmlTable.pageName}:${htmlTable.tableType}`;
    const registrations = registrationMap.get(key) || [];
    
    if (registrations.length > 0) {
      matchedTables.push({
        ...htmlTable,
        registration: registrations[0],
        hasRegistration: true,
        defaultSort: registrations[0].defaultSort,
        sortable: registrations[0].sortable
      });
    } else {
      unmatchedHTML.push({
        ...htmlTable,
        hasRegistration: false,
        defaultSort: null,
        sortable: null
      });
    }
  });
  
  // Find unmatched registrations
  jsRegistrations.forEach(reg => {
    const key = `${reg.pageName}:${reg.tableType}`;
    const hasMatch = htmlTables.some(t => 
      t.pageName === reg.pageName && t.tableType === reg.tableType
    );
    if (!hasMatch) {
      unmatchedJS.push(reg);
    }
  });
  
  return { matchedTables, unmatchedHTML, unmatchedJS };
}

/**
 * Generate report
 */
function generateReport(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  const report = {
    scanDate: new Date().toISOString(),
    summary: {
      totalHTMLFiles: data.htmlFiles.length,
      totalJSFiles: data.jsFiles.length,
      totalHTMLTables: data.htmlTables.length,
      totalJSRegistrations: data.jsRegistrations.length,
      matchedTables: data.matchedTables.length,
      unmatchedHTML: data.unmatchedHTML.length,
      unmatchedJS: data.unmatchedJS.length,
      tablesWithDefaultSort: data.matchedTables.filter(t => t.defaultSort !== null && t.defaultSort !== undefined).length,
      tablesWithoutDefaultSort: data.matchedTables.filter(t => !t.defaultSort || t.defaultSort === null || t.defaultSort === undefined).length
    },
    htmlTables: data.htmlTables,
    jsRegistrations: data.jsRegistrations,
    matchedTables: data.matchedTables,
    unmatchedHTML: data.unmatchedHTML,
    unmatchedJS: data.unmatchedJS
  };
  
  // Write JSON report
  const jsonOutput = outputFile || path.join(OUTPUT_DIR, `tables-inventory-${timestamp}.json`);
  fs.writeFileSync(jsonOutput, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ JSON report written to: ${jsonOutput}`);
  
  // Generate Markdown report
  const mdOutput = jsonOutput.replace('.json', '.md');
  generateMarkdownReport(report, mdOutput);
  console.log(`✅ Markdown report written to: ${mdOutput}`);
  
  return { jsonOutput, mdOutput };
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report, outputPath) {
  let md = `# Table Sorting System Inventory Report\n\n`;
  md += `**Scan Date:** ${new Date(report.scanDate).toLocaleString('he-IL')}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- **Total HTML Files Scanned:** ${report.summary.totalHTMLFiles}\n`;
  md += `- **Total JavaScript Files Scanned:** ${report.summary.totalJSFiles}\n`;
  md += `- **Total HTML Tables Found:** ${report.summary.totalHTMLTables}\n`;
  md += `- **Total JavaScript Registrations Found:** ${report.summary.totalJSRegistrations}\n`;
  md += `- **Matched Tables:** ${report.summary.matchedTables}\n`;
  md += `- **Unmatched HTML Tables:** ${report.summary.unmatchedHTML}\n`;
  md += `- **Unmatched JS Registrations:** ${report.summary.unmatchedJS}\n`;
  md += `- **Tables With Default Sort:** ${report.summary.tablesWithDefaultSort}\n`;
  md += `- **Tables Without Default Sort:** ${report.summary.tablesWithoutDefaultSort}\n\n`;
  
  md += `## Matched Tables (${report.matchedTables.length})\n\n`;
  md += `| Page | Table Type | Table ID | Has Default Sort | Sortable | In Modal |\n`;
  md += `|------|------------|----------|------------------|----------|----------|\n`;
  
  report.matchedTables.forEach(table => {
    const hasDefaultSort = table.defaultSort ? '✅' : '❌';
    const sortable = table.sortable ? '✅' : '❌';
    const inModal = table.inModal ? '✅' : '❌';
    md += `| ${table.pageName} | ${table.tableType || 'N/A'} | ${table.tableId} | ${hasDefaultSort} | ${sortable} | ${inModal} |\n`;
  });
  
  md += `\n## Unmatched HTML Tables (${report.unmatchedHTML.length})\n\n`;
  if (report.unmatchedHTML.length > 0) {
    md += `| Page | Table ID | Table Type | Column Count |\n`;
    md += `|------|----------|------------|--------------|\n`;
    report.unmatchedHTML.forEach(table => {
      md += `| ${table.pageName} | ${table.tableId} | ${table.tableType || 'N/A'} | ${table.columnCount} |\n`;
    });
  } else {
    md += `All HTML tables have matching JavaScript registrations.\n`;
  }
  
  md += `\n## Unmatched JavaScript Registrations (${report.unmatchedJS.length})\n\n`;
  if (report.unmatchedJS.length > 0) {
    md += `| Page | Table Type | Function Name | Has Default Sort |\n`;
    md += `|------|------------|---------------|------------------|\n`;
    report.unmatchedJS.forEach(reg => {
      const hasDefaultSort = reg.defaultSort ? '✅' : '❌';
      md += `| ${reg.pageName} | ${reg.tableType} | ${reg.functionName} | ${hasDefaultSort} |\n`;
    });
  } else {
    md += `All JavaScript registrations have matching HTML tables.\n`;
  }
  
  md += `\n## Tables Without Default Sort\n\n`;
  const tablesWithoutSort = report.matchedTables.filter(t => !t.defaultSort || t.defaultSort === null || t.defaultSort === undefined);
  if (tablesWithoutSort.length > 0) {
    md += `| Page | Table Type | Table ID | Expected Default Sort | Has Date Column |\n`;
    md += `|------|------------|----------|---------------------|-----------------|\n`;
    tablesWithoutSort.forEach(table => {
      const expectedSort = table.expectedDefaultSort ? 
        `${table.expectedDefaultSort.key} (${table.expectedDefaultSort.direction})` : 
        'N/A';
      const hasDate = table.mappingInfo?.hasDateColumn ? '✅' : '❌';
      md += `| ${table.pageName} | ${table.tableType || 'N/A'} | ${table.tableId} | ${expectedSort} | ${hasDate} |\n`;
    });
  } else {
    md += `All tables have default sort configuration.\n`;
  }
  
  md += `\n## Detailed Analysis\n\n`;
  md += `### Tables with Date Columns (should have date desc default sort)\n\n`;
  const tablesWithDate = report.matchedTables.filter(t => t.mappingInfo?.hasDateColumn);
  if (tablesWithDate.length > 0) {
    md += `| Page | Table Type | Date Column | Date Index | Has Default Sort |\n`;
    md += `|------|------------|-------------|------------|------------------|\n`;
    tablesWithDate.forEach(table => {
      const hasDefaultSort = table.defaultSort ? '✅' : '❌';
      md += `| ${table.pageName} | ${table.tableType} | ${table.mappingInfo.dateColumnKey} | ${table.mappingInfo.dateColumnIndex} | ${hasDefaultSort} |\n`;
    });
  }
  
  fs.writeFileSync(outputPath, md, 'utf-8');
}

/**
 * Load table-mappings.js to check column mappings
 */
function loadTableMappings() {
  const mappingsPath = path.join(TRADING_UI_DIR, 'scripts', 'table-mappings.js');
  try {
    return fs.readFileSync(mappingsPath, 'utf-8');
  } catch (error) {
    console.warn(`⚠️  Could not load table-mappings.js: ${error.message}`);
    return '';
  }
}

// Main execution
console.log('🔍 Scanning all tables in the system...\n');

// Load table mappings for analysis
const tableMappingsContent = loadTableMappings();
console.log(`📚 Loaded table-mappings.js\n`);

const htmlScan = scanHTMLFiles();
console.log(`📄 Found ${htmlScan.htmlFiles.length} HTML files`);
console.log(`📊 Found ${htmlScan.htmlTables.length} HTML tables\n`);

const jsScan = scanJavaScriptFiles();
console.log(`📜 Found ${jsScan.jsFiles.length} JavaScript files`);
console.log(`📝 Found ${jsScan.jsRegistrations.length} JavaScript table registrations\n`);

const matched = matchTablesWithRegistrations(htmlScan.htmlTables, jsScan.jsRegistrations);

// Enrich matched tables with mapping information
matched.matchedTables.forEach(table => {
  if (table.tableType) {
    const mappingInfo = checkTableMapping(table.tableType, tableMappingsContent);
    table.mappingInfo = mappingInfo;
    
    // If no explicit defaultSort, check if buildCanonDefaultSortChain would find a date
    if (!table.defaultSort && mappingInfo.hasDateColumn) {
      table.expectedDefaultSort = {
        columnIndex: mappingInfo.dateColumnIndex,
        direction: 'desc',
        key: mappingInfo.dateColumnKey,
        source: 'buildCanonDefaultSortChain (automatic)'
      };
    } else if (!table.defaultSort && !mappingInfo.hasDateColumn && mappingInfo.columns.length > 0) {
      table.expectedDefaultSort = {
        columnIndex: 0,
        direction: 'asc',
        key: mappingInfo.columns[0]?.key || 'first_column',
        source: 'buildCanonDefaultSortChain (fallback)'
      };
    }
  }
});

// Enrich unmatched HTML tables
matched.unmatchedHTML.forEach(table => {
  if (table.tableType) {
    const mappingInfo = checkTableMapping(table.tableType, tableMappingsContent);
    table.mappingInfo = mappingInfo;
  }
});

console.log(`✅ Matched: ${matched.matchedTables.length} tables`);
console.log(`⚠️  Unmatched HTML: ${matched.unmatchedHTML.length} tables`);
console.log(`⚠️  Unmatched JS: ${matched.unmatchedJS.length} registrations\n`);

const reportData = {
  htmlFiles: htmlScan.htmlFiles.map(f => path.relative(TRADING_UI_DIR, f)),
  jsFiles: jsScan.jsFiles.map(f => path.relative(TRADING_UI_DIR, f)),
  htmlTables: htmlScan.htmlTables,
  jsRegistrations: jsScan.jsRegistrations,
  matchedTables: matched.matchedTables,
  unmatchedHTML: matched.unmatchedHTML,
  unmatchedJS: matched.unmatchedJS
};

const outputs = generateReport(reportData);
console.log(`\n✅ Scan complete! Reports generated:`);
console.log(`   - ${outputs.jsonOutput}`);
console.log(`   - ${outputs.mdOutput}`);

